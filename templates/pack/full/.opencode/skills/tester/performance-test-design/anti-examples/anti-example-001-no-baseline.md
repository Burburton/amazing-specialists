# Anti-Example: No Baseline Performance Test

## 错误做法

设计性能测试时没有建立任何基线，直接设定随机目标。

## 问题代码/配置

```yaml
# 错误示例
performance_test:
  scenarios:
    - name: load_test
      concurrency: 1000  # 为什么是1000?
      duration: 10m
      
  targets:
    response_time: < 100ms  # 依据是什么?
    throughput: > 2000 RPS  # 业务需求是多少?
```

## 为什么这是错的

1. **缺乏依据**: 性能目标没有业务需求支撑
2. **无法判断**: 不知道当前性能是好是坏
3. **无法追踪**: 无法识别性能回归

## 正确做法

```yaml
# 正确示例
performance_test:
  # 1. 从业务需求推导
  business_requirements:
    peak_users: 5000      # 业务高峰用户数
    expected_growth: 20%  # 预期增长率
    
  # 2. 建立基线
  baseline:
    source: last_release_v1.2.0
    metrics:
      p99_response_time: 180ms
      throughput: 1500 RPS
      
  # 3. 设定合理目标
  scenarios:
    - name: load_test
      concurrency: 6000  # 峰值 + 20% buffer
      duration: 10m
      
  targets:
    response_time: < 200ms  # 基于基线 + 业务需求
    throughput: > 1800 RPS  # 基线 + 20% 增长
```

## 关键要点

1. **业务驱动**: 性能目标源于业务需求
2. **基线参考**: 基于历史数据设定目标
3. **可追溯**: 目标可解释、可验证