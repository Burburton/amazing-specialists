# Implementation Plan: 012-performance-testing-skills

## Document Status
- **Feature ID**: `012-performance-testing-skills`
- **Version**: 1.0.0
- **Status**: Complete

---

## Implementation Strategy

采用**顺序实现**策略，每个 skill 独立完成后进入下一个。

```
Phase 1: performance-test-design
    ↓
Phase 2: benchmark-analysis
    ↓
Phase 3: load-test-orchestration
    ↓
Phase 4: performance-regression-analysis
    ↓
Phase 5: 文档更新
```

---

## Phase 1: performance-test-design

### 目标
创建性能测试设计 skill，支持设计性能测试方案。

### T-1.1: 创建 skill 目录结构
- 创建 `.opencode/skills/tester/performance-test-design/`
- 包含 SKILL.md, examples/, anti-examples/, checklists/

### T-1.2: 实现 SKILL.md
核心内容：
- **Purpose**: 设计性能测试方案，定义性能指标和测试场景
- **When to Use**: 有性能需求时
- **Key Activities**: 指标定义、场景设计、数据准备、环境配置
- **Output**: 性能测试计划

### T-1.3: 创建 examples/
- example-001-api-performance-test.md - API 性能测试示例
- example-002-database-performance.md - 数据库性能测试示例

### T-1.4: 创建 anti-examples/
- anti-example-001-no-baseline.md - 无基线的性能测试
- anti-example-002-unrealistic-targets.md - 不切实际的性能目标

### T-1.5: 创建 checklists/
- validation-checklist.md - 性能测试设计验证清单

---

## Phase 2: benchmark-analysis

### 目标
创建基准测试分析 skill，支持建立性能基线和对比分析。

### T-2.1: 创建 skill 目录结构
- 创建 `.opencode/skills/tester/benchmark-analysis/`

### T-2.2: 实现 SKILL.md
核心内容：
- **Purpose**: 建立性能基线，进行对比分析
- **When to Use**: 需要性能对比时
- **Key Activities**: 基准设计、数据采集、基线建立、对比分析
- **Output**: 基准测试报告

### T-2.3: 创建 examples/
- example-001-api-benchmark.md - API 基准测试
- example-002-version-comparison.md - 版本间性能对比

### T-2.4: 创建 anti-examples/
- anti-example-001-inconsistent-environment.md - 环境不一致
- anti-example-002-single-sample.md - 单次采样

### T-2.5: 创建 checklists/
- validation-checklist.md - 基准测试验证清单

---

## Phase 3: load-test-orchestration

### 目标
创建负载测试编排 skill，支持并发测试和压力测试。

### T-3.1: 创建 skill 目录结构
- 创建 `.opencode/skills/tester/load-test-orchestration/`

### T-3.2: 实现 SKILL.md
核心内容：
- **Purpose**: 编排负载测试，识别系统瓶颈
- **When to Use**: 需要验证系统承载能力时
- **Key Activities**: 并发设计、负载生成、资源监控、瓶颈识别
- **Output**: 负载测试报告

### T-3.3: 创建 examples/
- example-001-concurrent-users.md - 并发用户测试
- example-002-stress-test.md - 压力测试

### T-3.4: 创建 anti-examples/
- anti-example-001-no-monitoring.md - 无监控的负载测试
- anti-example-002-premature-stop.md - 过早停止

### T-3.5: 创建 checklists/
- validation-checklist.md - 负载测试验证清单

---

## Phase 4: performance-regression-analysis

### 目标
创建性能回归分析 skill，支持检测性能退化。

### T-4.1: 创建 skill 目录结构
- 创建 `.opencode/skills/tester/performance-regression-analysis/`

### T-4.2: 实现 SKILL.md
核心内容：
- **Purpose**: 检测性能退化，分析根因
- **When to Use**: 版本发布前、代码变更后
- **Key Activities**: 历史对比、回归检测、根因分析、报警建议
- **Output**: 性能回归报告

### T-4.3: 创建 examples/
- example-001-response-time-regression.md - 响应时间回归
- example-002-throughput-degradation.md - 吞吐量退化

### T-4.4: 创建 anti-examples/
- anti-example-001-no-historical-data.md - 无历史数据对比
- anti-example-002-ignore-variance.md - 忽略数据波动

### T-4.5: 创建 checklists/
- validation-checklist.md - 回归分析验证清单

---

## Phase 5: 文档更新

### T-5.1: 更新 enhanced-mode-guide.md
添加性能测试 skills 到 Enhanced 模式指南。

### T-5.2: 更新 README.md
更新 tester skills 清单，包含新增的 4 个性能测试 skills。

### T-5.3: 创建 completion-report.md
记录 feature 完成状态和验证结果。

---

## Dependencies

```mermaid
graph LR
    T1.1 --> T1.2 --> T1.3 --> T1.4 --> T1.5
    T1.5 --> T2.1 --> T2.2 --> T2.3 --> T2.4 --> T2.5
    T2.5 --> T3.1 --> T3.2 --> T3.3 --> T3.4 --> T3.5
    T3.5 --> T4.1 --> T4.2 --> T4.3 --> T4.4 --> T4.5
    T4.5 --> T5.1 --> T5.2 --> T5.3
```

---

## Risk Assessment

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 性能测试工具依赖 | 低 | Skills 不绑定特定工具 |
| 环境差异 | 中 | 文档中强调环境隔离 |
| 数据准确性 | 中 | 提供采样和统计方法指南 |

---

## Estimated Effort

| Phase | 预计时间 |
|-------|----------|
| Phase 1 | 1.5h |
| Phase 2 | 1.5h |
| Phase 3 | 1.5h |
| Phase 4 | 1.5h |
| Phase 5 | 0.5h |
| **总计** | **6.5h** |