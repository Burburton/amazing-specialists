# Anti-Example: Single Sample Benchmark

## 错误做法

只执行一次测试就得出结论。

## 问题示例

```yaml
# 错误: 单次测试
benchmark:
  iterations: 1
  rounds: 1
  
result:
  response_time: 150ms
  
conclusion: "性能达标"
```

## 为什么这是错的

1. **随机波动**: 单次测试受随机因素影响大
2. **无统计意义**: 无法确定结果是否代表真实性能
3. **无法评估稳定性**: 不知道性能是否稳定
4. **忽略异常**: 无法识别异常值

## 正确做法

```yaml
# 正确: 多次采样
benchmark:
  iterations: 100  # 每轮100次
  warmup: 20       # 预热20次
  rounds: 5        # 5轮测试
  
results:
  round_1:
    mean: 48ms
    std: 12ms
    
  round_2:
    mean: 52ms
    std: 15ms
    
  round_3:
    mean: 45ms
    std: 10ms
    
  round_4:
    mean: 50ms
    std: 11ms
    
  round_5:
    mean: 47ms
    std: 13ms
    
# 统计分析
statistics:
  overall_mean: 48ms
  overall_std: 12ms
  confidence_interval_95%: [45ms, 51ms]
```

## 统计方法

| 方法 | 说明 | 最小样本数 |
|------|------|------------|
| 简单平均 | 快速评估 | 30 |
| 置信区间 | 更准确 | 100 |
| 假设检验 | 对比分析 | 各 100+ |

## 关键要点

1. **足够样本**: 至少 30 次迭代
2. **多轮测试**: 减少随机性
3. **统计分析**: 使用置信区间评估