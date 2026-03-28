# Example: Throughput Degradation

## 场景

检测到系统吞吐量下降，需要分析原因。

## 回归检测

```yaml
regression_detected:
  metric: throughput
  baseline:
    version: v1.2.0
    value: 5000 RPS
    
  current:
    version: v1.3.0
    value: 3200 RPS
    
  change: -36%
  threshold: 15%
  status: REGRESSION ❌
```

## 分析过程

### Step 1: 资源监控对比

```yaml
# 资源使用对比
resource_comparison:
  cpu:
    baseline: 65%
    current: 85%
    
  memory:
    baseline: 70%
    current: 92%
    
  gc_pause:
    baseline: 50ms avg
    current: 450ms avg  # 显著增加
    
  thread_count:
    baseline: 200
    current: 450
```

### Step 2: 分析 GC 行为

```yaml
# GC 日志分析
gc_analysis:
  young_gc:
    baseline: every 2s, 10ms pause
    current: every 500ms, 15ms pause
    
  old_gc:
    baseline: every 5min, 100ms pause
    current: every 30s, 800ms pause  # 问题!
    
  gc_causes:
    - "内存占用过高"
    - "对象晋升过快"
```

### Step 3: 内存分析

```yaml
# 内存分析
memory_analysis:
  heap_objects:
    baseline: 5M objects
    current: 25M objects  # 增长 5 倍
    
  largest_objects:
    - type: UserSession
      count: 2M
      size: 800MB
      
    - type: OrderCache
      count: 500K
      size: 400MB
      
  potential_leak:
    - UserSession 未正确清理
    - OrderCache 无限增长
```

### Step 4: 代码变更分析

```bash
git diff v1.2.0..v1.3.0 -- src/services/

# 发现变更
+ // 新增: 会话管理
+ const sessions = this.sessionManager.getAll();
+ // 问题: sessions 无过期清理
```

## 根因总结

| 因素 | 影响 |
|------|------|
| 内存泄漏 | UserSession 未清理 |
| 缓存无限增长 | OrderCache 无大小限制 |
| GC 压力 | Full GC 频繁，暂停时间长 |
| 吞吐量下降 | GC 暂停期间无法处理请求 |

## 修复建议

```yaml
recommendations:
  - priority: critical
    action: 修复 UserSession 内存泄漏
    implementation: 添加会话过期清理机制
    
  - priority: high
    action: 限制 OrderCache 大小
    implementation: 使用 LRU 缓存，设置最大条目数
    
  - priority: medium
    action: 调整 JVM 内存参数
    implementation: 增加堆内存，优化 GC 算法
```

## 预期效果

```yaml
expected_after_fix:
  throughput: 4800 RPS
  memory_usage: 75%
  gc_pause: 80ms avg
  status: RECOVERED ✅
```