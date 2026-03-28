# Performance Regression Analysis

## Purpose

检测性能回归，分析根本原因，提供修复建议。

## When to Use

- 版本发布前的性能检查
- 代码变更后的性能验证
- CI/CD 流水线集成
- 定期性能巡检

## Key Activities

### 1. 历史数据对比

```yaml
# 性能对比配置
comparison:
  baseline:
    version: v1.2.0
    commit: abc123
    
  current:
    version: v1.3.0
    commit: def456
    
  metrics:
    - response_time_p95
    - response_time_p99
    - throughput
    - error_rate
    
  thresholds:
    regression: 15%    # 超过 15% 判定为回归
    warning: 10%       # 超过 10% 发出警告
```

### 2. 回归检测方法

**检测维度**:

| 维度 | 检测方法 | 判定标准 |
|------|----------|----------|
| 单指标 | 百分比变化 | > 15% 回归 |
| 趋势 | 移动平均 | 连续 3 次退化 |
| 分布 | 直方图对比 | 形态显著变化 |

**统计显著性**:
- 使用 t-test 检验差异显著性
- p-value < 0.05 视为显著

### 3. 根因分析

**根因分类**:

| 类别 | 常见原因 | 排查方法 |
|------|----------|----------|
| 代码变更 | 新功能、重构 | Git diff、性能分析 |
| 依赖变化 | 库升级、API 变更 | 依赖对比 |
| 数据变化 | 数据量增长 | 数据统计 |
| 环境 | 配置、资源 | 环境对比 |
| 网络 | 延迟、带宽 | 网络监控 |

### 4. 报警建议

```yaml
# 报警配置
alerts:
  - name: response_time_regression
    condition: P99 > baseline * 1.15
    severity: high
    action: block_release
    
  - name: throughput_regression
    condition: throughput < baseline * 0.85
    severity: medium
    action: warn_and_continue
    
  - name: error_rate_increase
    condition: error_rate > baseline * 2
    severity: critical
    action: block_release
```

## Output

### 性能回归报告模板

```markdown
# Performance Regression Report

## 检测概述
- 当前版本: v1.3.0 (commit: def456)
- 基线版本: v1.2.0 (commit: abc123)
- 检测时间: 2026-03-28 10:30:00

## 回归检测结果

### 严重回归 ❌
| 指标 | 基线 | 当前 | 变化 | 阈值 |
|------|------|------|------|------|
| P99 响应时间 | 200ms | 280ms | +40% | 15% |
| 错误率 | 0.01% | 0.05% | +400% | 100% |

### 警告 ⚠️
| 指标 | 基线 | 当前 | 变化 |
|------|------|------|------|
| P95 响应时间 | 120ms | 138ms | +15% |

### 正常 ✅
| 指标 | 基线 | 当前 | 变化 |
|------|------|------|------|
| 吞吐量 | 1500 RPS | 1650 RPS | +10% |
| P50 响应时间 | 45ms | 43ms | -4% |

## 根因分析

### P99 回归分析
**发现**: 
- 登录接口 P99 从 200ms 上升到 280ms
- 主要耗时在数据库查询

**根因**:
- commit def456 增加了用户状态检查
- 新增数据库查询导致延迟增加

**影响范围**: 
- 登录接口
- 影响 5% 用户

### 错误率上升分析
**发现**: 
- 错误率从 0.01% 上升到 0.05%
- 主要是超时错误

**根因**:
- 与 P99 回归相关
- 部分请求超过超时阈值

## 建议

### 必须修复
1. 优化登录接口数据库查询
2. 添加缓存减少数据库访问

### 可选优化
1. 考虑异步处理用户状态检查
2. 调整超时配置

## 结论
❌ **存在严重回归，不建议发布**

需修复 P99 响应时间回归后重新测试。
```

## CI/CD Integration

```yaml
# GitLab CI 示例
performance_test:
  stage: test
  script:
    - run_benchmark.sh
    - compare_with_baseline.sh
  artifacts:
    reports:
      performance: performance-report.json
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

## Best Practices

1. **自动化检测**: 集成到 CI/CD 流水线
2. **历史数据保留**: 保持足够的历史数据
3. **合理阈值**: 根据业务场景设定阈值
4. **根因追溯**: 结合代码变更分析