# Anti-Example: Ignoring Data Variance

## 错误做法

忽略测试数据的自然波动，对单次结果过度解读。

## 问题示例

```yaml
# 错误: 忽略波动
baseline:
  p99: 180ms (单次测试)

current:
  p99: 200ms (单次测试)

conclusion: "回归 11%，需要修复"  # 可能是正常波动
```

## 为什么这是错的

1. **测试波动**: 性能测试存在自然波动
2. **误判风险**: 可能把正常波动当作回归
3. **过度反应**: 不必要的修复工作
4. **忽视统计**: 不考虑统计显著性

## 正确做法

```yaml
# 正确: 考虑方差
baseline:
  samples: [178ms, 182ms, 175ms, 185ms, 180ms]
  mean: 180ms
  std: 3.5ms
  confidence_interval_95%: [173ms, 187ms]
  
current:
  samples: [195ms, 205ms, 198ms, 202ms, 200ms]
  mean: 200ms
  std: 3.7ms
  confidence_interval_95%: [193ms, 207ms]
  
# 统计检验
t_test:
  t_statistic: 8.5
  p_value: 0.0001  # < 0.05, 统计显著
  
# 但变化幅度
effect_size:
  change: 11.1%
  practical_significance: marginal  # 实际影响边际
```

## 判断标准

```yaml
decision_matrix:
  statistical_significant: true
  practical_significant: false  # 变化 < 15%
  recommendation: 监控趋势，暂不修复
  
  # 如果
  statistical_significant: true
  practical_significant: true  # 变化 > 15%
  recommendation: 优先修复
```

## 方差来源

| 来源 | 说明 | 处理方法 |
|------|------|----------|
| 测试环境 | 资源竞争 | 独占环境 |
| 数据波动 | 网络延迟等 | 多次采样 |
| 系统状态 | GC、缓存 | 预热充分 |
| 测试工具 | 本身开销 | 校准工具 |

## 关键要点

1. **多次采样**: 至少 3 轮测试
2. **统计检验**: 使用 t-test 或类似方法
3. **区分显著**: 统计显著 vs 实际显著
4. **合理阈值**: 设定实际影响阈值