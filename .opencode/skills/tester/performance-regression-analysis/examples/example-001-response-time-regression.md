# Example: Response Time Regression

## 场景

检测到 P99 响应时间回归，需要分析和定位根因。

## 回归检测

```yaml
regression_detected:
  metric: response_time_p99
  baseline:
    version: v1.2.0
    value: 180ms
    
  current:
    version: v1.3.0
    value: 280ms
    
  change: +55.6%
  threshold: 15%
  status: REGRESSION ❌
```

## 分析过程

### Step 1: 确认回归

```bash
# 重新运行测试确认
k6 run benchmark.js --out influxdb=http://localhost:8086/k6

# 结果确认
P99: 275ms (多次测试平均)
# 确认回归存在
```

### Step 2: 缩小范围

```yaml
# 按接口分析
api_breakdown:
  /api/auth/login:
    baseline_p99: 120ms
    current_p99: 125ms
    change: +4% ✅
    
  /api/orders:
    baseline_p99: 180ms
    current_p99: 350ms
    change: +94% ❌  # 主要问题
    
  /api/users:
    baseline_p99: 150ms
    current_p99: 160ms
    change: +7% ⚠️
```

**发现**: `/api/orders` 接口是主要回归源。

### Step 3: 代码变更分析

```bash
# 查看代码变更
git diff v1.2.0..v1.3.0 -- src/controllers/OrderController.ts

# 发现关键变更
+ // 新增: 验证用户权限
+ const hasPermission = await this.authService.checkPermission(
+   userId, 'order', 'read'
+ );
```

**发现**: v1.3.0 新增了权限验证，引入额外数据库查询。

### Step 4: 数据库分析

```sql
-- 分析慢查询
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE query LIKE '%permission%'
ORDER BY mean_time DESC;

-- 结果
query: SELECT * FROM permissions WHERE user_id = $1
mean_time: 85ms
calls: 10000
```

**发现**: 权限查询平均耗时 85ms，是性能退化的主因。

## 根因总结

| 因素 | 影响 |
|------|------|
| 代码变更 | 新增权限验证 |
| 数据库影响 | 额外查询增加 85ms |
| 缓存缺失 | 无缓存，每次查询数据库 |
| 整体影响 | P99 从 180ms → 280ms |

## 修复建议

```yaml
recommendations:
  - priority: high
    action: 为权限查询添加 Redis 缓存
    expected_impact: 减少数据库查询，降低 60-80ms
    
  - priority: medium
    action: 优化权限查询 SQL
    expected_impact: 减少查询时间 20-30ms
    
  - priority: low
    action: 考虑权限数据预加载
    expected_impact: 完全消除权限查询延迟
```

## 验证修复

```yaml
# 修复后重新测试
after_fix:
  version: v1.3.1
  metric: response_time_p99
  value: 195ms
  change_from_baseline: +8.3%
  status: ACCEPTABLE ✅
```