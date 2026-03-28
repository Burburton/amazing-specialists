# Anti-Example: Inconsistent Test Environment

## 错误做法

在不同环境条件下进行基准对比测试。

## 问题示例

```yaml
# 错误: 环境1
benchmark_baseline:
  environment: dev-server-01
  cpu: 2 cores
  memory: 4GB
  network: 同机房
  
# 错误: 环境2
benchmark_current:
  environment: prod-server-01
  cpu: 8 cores
  memory: 16GB
  network: 跨机房
```

## 为什么这是错的

1. **硬件差异**: 不同 CPU/内存性能不同
2. **网络差异**: 延迟差异影响测试结果
3. **环境噪音**: 其他进程影响测试
4. **结果不可比**: 无法判断性能变化是代码还是环境导致

## 正确做法

```yaml
# 正确: 同一环境
benchmark_baseline:
  environment: perf-test-01
  cpu: 4 cores
  memory: 8GB
  network: localhost
  isolated: true  # 独占环境
  
benchmark_current:
  environment: perf-test-01  # 同一环境
  cpu: 4 cores
  memory: 8GB
  network: localhost
  isolated: true
```

## 环境一致性检查清单

- [ ] 相同的服务器规格
- [ ] 相同的网络条件
- [ ] 相同的数据量
- [ ] 环境独占，无其他负载
- [ ] 相同的配置参数