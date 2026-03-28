# Performance Test Design

## Purpose

设计性能测试方案，定义性能指标和测试场景，确保系统满足性能需求。

## When to Use

- Spec 中有明确的性能需求
- 新功能涉及高并发场景
- 系统架构发生重大变更
- 上线前性能验证

## Key Activities

### 1. 性能指标定义

| 指标类型 | 常用指标 | 说明 |
|----------|----------|------|
| 响应时间 | P50, P95, P99 | 不同百分位的响应时间 |
| 吞吐量 | RPS, TPS | 每秒请求数/事务数 |
| 并发数 | Concurrent Users | 同时在线用户数 |
| 错误率 | Error Rate | 请求失败比例 |
| 资源使用 | CPU, Memory, I/O | 系统资源消耗 |

### 2. 测试场景设计

```yaml
# 性能测试场景模板
scenarios:
  - name: normal_load
    description: 正常负载测试
    concurrency: 100
    duration: 5m
    ramp_up: 30s
    
  - name: peak_load
    description: 峰值负载测试
    concurrency: 500
    duration: 10m
    ramp_up: 1m
    
  - name: stress_test
    description: 压力测试
    concurrency: 1000
    duration: 15m
    ramp_up: 2m
    
  - name: endurance_test
    description: 耐久测试
    concurrency: 200
    duration: 2h
    ramp_up: 1m
```

### 3. 测试数据准备

- 生成符合生产规模的数据量
- 数据分布模拟真实场景
- 敏感数据脱敏处理

### 4. 环境配置

- 独立的性能测试环境
- 与生产环境相似的硬件配置
- 网络条件模拟

## Output

### 性能测试计划模板

```markdown
# Performance Test Plan

## 1. 测试目标
- 验证系统在 X 并发下响应时间 < Yms
- 验证系统吞吐量达到 Z RPS
- 识别系统性能瓶颈

## 2. 测试范围
- API: /api/auth/login, /api/orders
- 数据库: 读写操作
- 缓存: Redis 命中率

## 3. 性能指标
| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| P95 响应时间 | < 200ms | APM 工具 |
| 吞吐量 | > 1000 RPS | 负载工具 |
| 错误率 | < 0.1% | 日志分析 |

## 4. 测试场景
[场景定义]

## 5. 测试数据
- 用户数据: 10万条
- 订单数据: 100万条

## 6. 测试环境
- 服务器: 4C8G x 2
- 数据库: MySQL 8.0
- 缓存: Redis 6.0

## 7. 执行计划
- 第1天: 正常负载测试
- 第2天: 峰值负载测试
- 第3天: 压力测试和结果分析
```

## Integration

与 `integration-test-design` skill 协同：
1. 先用 integration-test-design 验证功能正确性
2. 再用 performance-test-design 设计性能测试
3. 性能测试基于功能测试场景扩展

## Best Practices

1. **明确性能目标**: 从业务需求推导性能指标
2. **分层测试**: 先单接口，再场景，最后端到端
3. **监控完善**: 测试时同步监控系统资源
4. **数据真实**: 测试数据接近生产规模和分布