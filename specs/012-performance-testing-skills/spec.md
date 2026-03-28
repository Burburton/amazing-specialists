# Feature Spec: 012-performance-testing-skills

## Document Status
- **Feature ID**: `012-performance-testing-skills`
- **Version**: 1.0.0
- **Status**: Complete
- **Created**: 2026-03-28
- **Completed**: 2026-03-28
- **Author**: architect (via OpenCode agent)

---

## Background

现有 tester 角色已实现 5 个 skills：
- **MVP (3)**: unit-test-design, regression-analysis, edge-case-matrix
- **M4 (2)**: integration-test-design, flaky-test-diagnosis

缺少**性能测试**相关能力。性能测试是确保系统在生产环境下满足性能需求的关键环节。

### 设计原则

性能测试 skills 作为 **M4 增强层**的扩展：
1. **可选启用** - 通过 `--enhanced` 标志激活
2. **补充而非替代** - 扩展 tester 角色能力
3. **与现有 skills 协同** - 与 integration-test-design 配合使用

---

## Goal

为 tester 角色新增 4 个性能测试 skills：

1. **performance-test-design** - 性能测试设计
2. **benchmark-analysis** - 基准测试分析
3. **load-test-orchestration** - 负载测试编排
4. **performance-regression-analysis** - 性能回归分析

---

## Scope

### In Scope

#### 1. performance-test-design

**用途**: 设计性能测试方案

**能力**:
- 性能指标定义（响应时间、吞吐量、并发数）
- 测试场景设计（正常负载、峰值负载、压力测试）
- 测试数据准备
- 环境配置建议

**输出**:
- 性能测试计划
- 测试场景定义
- 指标阈值设置

#### 2. benchmark-analysis

**用途**: 建立性能基线并分析

**能力**:
- 基准测试设计
- 性能数据采集
- 基线建立
- 对比分析

**输出**:
- 基准测试报告
- 性能基线数据
- 对比分析结论

#### 3. load-test-orchestration

**用途**: 编排负载测试

**能力**:
- 并发测试设计
- 压力测试执行
- 资源监控
- 瓶颈识别

**输出**:
- 负载测试报告
- 资源使用分析
- 瓶颈识别报告

#### 4. performance-regression-analysis

**用途**: 检测性能退化

**能力**:
- 历史性能数据对比
- 回归检测
- 根因分析
- 报警建议

**输出**:
- 性能回归报告
- 退化点识别
- 根因分析

### Out of Scope

1. **不实现真实负载工具** - 使用现有工具（k6, JMeter, Locust）
2. **不涉及生产监控** - 仅测试环境
3. **不做容量规划** - 属于架构师职责

---

## Business Rules

### BR-001: M4 增强层
性能测试 skills 属于 M4 增强层，需通过 `--enhanced` 标志启用。

### BR-002: 可选执行
性能测试不是每次开发的必选项，仅在以下场景触发：
- spec 明确性能要求
- 用户显式请求
- 高风险变更

### BR-003: 工具无关性
Skills 不绑定特定性能测试工具，支持多种工具集成。

### BR-004: 环境隔离
性能测试应在独立环境执行，避免影响开发/生产环境。

---

## Acceptance Criteria

### AC-001: 4 个性能测试 skills 创建
`.opencode/skills/tester/` 目录下存在 4 个性能测试 skill 目录，每个包含完整结构。

### AC-002: Skills 与 M4 集成
性能测试 skills 通过 `--enhanced` 标志启用，正确列在 enhanced-mode 指南中。

### AC-003: 文档完整
每个 skill 包含：
- Purpose, When to Use, Key Activities, Output
- examples/ 目录
- anti-examples/ 目录
- checklists/ 目录

### AC-004: 与现有 skills 协同
性能测试 skills 能与 integration-test-design 协同使用。

### AC-005: README.md 更新
README.md 更新 tester skills 清单，包含性能测试 skills。

---

## Interface Contract

### performance-test-design Input

```yaml
dispatch_id: dsp-perf-001
role: tester
command: design-performance-test
title: 设计登录接口性能测试

inputs:
  - artifact_id: spec-login-v1
    artifact_type: spec
    
  - artifact_id: design-login-v1
    artifact_type: design_note

performance_requirements:
  - response_time_p99: 200ms
  - throughput: 1000 rps
  - concurrent_users: 500

expected_outputs:
  - performance_test_plan
```

### performance-test-design Output

```yaml
status: SUCCESS
summary: 完成性能测试设计

artifacts:
  - artifact_id: perf-test-plan-login-v1
    artifact_type: performance_test_plan
    
test_scenarios:
  - name: normal_load
    description: 正常负载测试
    concurrency: 100
    duration: 5m
    expected_p99: 100ms
    
  - name: peak_load
    description: 峰值负载测试
    concurrency: 500
    duration: 10m
    expected_p99: 200ms
    
  - name: stress_test
    description: 压力测试
    concurrency: 1000
    duration: 15m
    expected_result: 识别系统极限

recommendation: READY_FOR_EXECUTION
```

---

## Assumptions

### ASM-001: 性能测试工具可用
项目已有或可引入性能测试工具（k6, JMeter 等）。

### ASM-002: 测试环境独立
存在独立的性能测试环境，与开发/生产隔离。

### ASM-003: 性能需求明确
spec 中有明确的性能指标要求。

---

## Open Questions

### OQ-001: 性能测试是否作为 gate？
**选项**:
- A: 必须通过性能测试才能发布
- B: 性能测试仅作参考，不阻塞发布

**推荐**: B（参考性），除非 spec 明确标记 performance-critical

### OQ-002: 性能测试环境配置？
是否需要专门的 skill 处理性能测试环境配置？

**推荐**: 第一版简化，假设环境已配置

---

## Implementation Phases

### Phase 1: performance-test-design
创建性能测试设计 skill

### Phase 2: benchmark-analysis
创建基准测试分析 skill

### Phase 3: load-test-orchestration
创建负载测试编排 skill

### Phase 4: performance-regression-analysis
创建性能回归分析 skill

### Phase 5: 文档更新
更新 enhanced-mode-guide.md 和 README.md

---

## References

- `.opencode/skills/tester/integration-test-design/` - 现有集成测试 skill
- `docs/enhanced-mode-guide.md` - Enhanced 模式指南
- `README.md` - Skills 清单

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial spec creation |