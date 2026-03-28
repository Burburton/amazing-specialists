---
enhanced: true
feature_id: 014-enhanced-mode-validation
status: complete
created: 2026-03-28
---

# 014-enhanced-mode-validation

## Background

本 feature 旨在验证 Enhanced 模式的完整执行能力。系统已实现 16 个 M4 可选增强 skills，需要通过实际运行验证：

1. **Enhanced 模式激活机制**: --enhanced 标志、spec.md 元数据继承、环境变量
2. **M4 Skills 触发条件**: 每个 M4 skill 的触发场景是否正确配置
3. **Enhanced 模式流程**: spec-start → spec-plan → spec-tasks → spec-implement → spec-audit 是否正确应用 M4 skills

## Goal

通过运行一个包含多种触发场景的 feature，验证：
- Enhanced 模式能正确激活
- 16 个 M4 skills 能在正确条件下触发
- Enhanced 模式输出包含 M4 相关内容
- enhanced-mode-selector.md 检测逻辑正确

**核心验证指标**:
- 每个 M4 skill 至少有一个触发场景被验证
- Enhanced 模式元数据正确继承到后续命令
- 审计时能正确应用 M4 reviewer/security skills

## Scope

### In Scope
- 验证 Enhanced 模式激活机制（元数据继承）
- 验证 M4 skills 触发条件配置
- 验证 Enhanced 模式下各命令的输出差异
- 生成 Enhanced 模式验证报告

### Out of Scope
- 实际业务功能实现（仅验证 Enhanced 模式机制）
- 性能测试、压力测试
- M4 skills 内容质量评估（仅验证触发机制）

## Actors

| Actor | Role | Responsibility |
|-------|------|----------------|
| Main Agent | Orchestrator | 执行 Enhanced 模式流程，验证输出 |
| architect | architect | 应用 M4 skills (interface-contract-design, migration-planning) |
| developer | developer | 应用 M4 skills (refactor-safely, dependency-minimization) |
| tester | tester | 应用 M4 skills (integration-test-design, flaky-test-diagnosis, performance-*) |
| reviewer | reviewer | 应用 M4 skills (maintainability-review, risk-review) |
| docs | docs | 应用 M4 skills (architecture-doc-sync, user-guide-update) |
| security | security | 应用 M4 skills (secret-handling-review, dependency-risk-review) |

## Core Workflows

### Workflow 1: Enhanced Mode Activation

```
spec.md with enhanced: true
  -> /spec-plan (继承 enhanced)
    -> architect: interface-contract-design (if API/interface)
    -> architect: migration-planning (if migration)
  
  -> /spec-tasks (继承 enhanced)
    -> tester: integration-test-design (if integration)
    -> security: dependency-risk-review (if new dependencies)
  
  -> /spec-implement (继承 enhanced)
    -> developer: refactor-safely (if refactoring)
    -> developer: dependency-minimization (if new deps)
  
  -> /spec-audit (继承 enhanced)
    -> reviewer: maintainability-review
    -> reviewer: risk-review
    -> security: secret-handling-review (if secrets)
```

### Workflow 2: M4 Skills Triggering Conditions

| M4 Skill | 触发条件 | 验证方法 |
|----------|----------|----------|
| interface-contract-design | Feature 涉及新 API/endpoints | spec.md 声明 API |
| migration-planning | Feature 涉及数据库/系统迁移 | spec.md 声明 migration |
| refactor-safely | Task 涉及重构现有代码 | tasks.md 包含 refactor task |
| dependency-minimization | Feature 需要新依赖 | plan.md 分析依赖 |
| integration-test-design | Feature 有集成点 | spec.md 声明 integration |
| flaky-test-diagnosis | 存在不稳定测试 | tester 报告 flaky tests |
| performance-test-design | Feature 有性能需求 | spec.md 声明 performance |
| benchmark-analysis | 需要性能对比 | plan.md 包含 benchmark |
| load-test-orchestration | 需要验证承载能力 | spec.md 声明 load test |
| performance-regression-analysis | 版本发布前检测 | tasks.md 包含 regression |
| maintainability-review | 审计阶段启用 Enhanced | /spec-audit --enhanced |
| risk-review | 审计阶段启用 Enhanced | /spec-audit --enhanced |
| architecture-doc-sync | Feature 改变架构 | docs role 触发 |
| user-guide-update | Feature 改变用户交互 | docs role 触发 |
| secret-handling-review | Feature 处理敏感信息 | security role 触发 |
| dependency-risk-review | Feature 添加新依赖 | security role 触发 |

## Business Rules

1. **规则 ENH-001**: spec.md 的 `enhanced: true` 必须被后续命令继承
2. **规则 ENH-002**: M4 skill 必须在其触发条件满足时被激活
3. **规则 ENH-003**: Enhanced 模式输出必须包含 M4 相关章节
4. **规则 ENH-004**: 审计阶段 Enhanced 模式必须应用 M4 reviewer/security skills

## Non-functional Requirements

- **NFR-001**: Enhanced 模式不应显著增加执行时间
- **NFR-002**: M4 skills 输出应与 MVP skills 输出格式兼容
- **NFR-003**: Enhanced 模式应能正确回退到 MVP 模式（无 --enhanced）

## Acceptance Criteria

| ID | Criterion | Validation Method |
|----|-----------|-------------------|
| AC-001 | Enhanced 模式正确激活 | spec.md 元数据继承验证 |
| AC-002 | architect M4 skills 触发 | plan.md 包含 M4 章节 |
| AC-003 | tester M4 skills 触发 | tasks.md 包含 M4 tasks |
| AC-004 | developer M4 skills 触发 | implement 输出包含 M4 应用 |
| AC-005 | reviewer M4 skills 触发 | audit 输出包含 M4 findings |
| AC-006 | security M4 skills 触发 | audit 包含 security M4 检查 |
| AC-007 | docs M4 skills 触发 | 文档更新包含 architecture/user-guide |
| AC-008 | 验证报告总结 M4 状态 | verification-report.md 存在 |

## Assumptions

1. 16 个 M4 skills 已正确实现
2. enhanced-mode-selector.md 检测逻辑正确
3. 测试环境支持 Enhanced 模式执行

## Open Questions

1. 是否需要验证所有 16 个 M4 skills？（建议验证高频触发的 8 个）
2. Enhanced 模式与 MVP 模式的输出差异如何量化？

## M4 Skills Target Coverage

本次验证重点覆盖以下 M4 skills（按触发频率排序）：

| Priority | M4 Skill | Expected Trigger |
|----------|----------|------------------|
| **P1** | interface-contract-design | Feature 设计阶段 |
| **P1** | integration-test-design | Feature 测试阶段 |
| **P1** | maintainability-review | 审计阶段（Enhanced） |
| **P1** | risk-review | 审计阶段（Enhanced） |
| **P2** | migration-planning | 如 feature 涉及迁移 |
| **P2** | dependency-risk-review | 如 feature 添加依赖 |
| **P2** | architecture-doc-sync | 文档同步阶段 |
| **P2** | performance-test-design | 如 feature 有性能需求 |
| **P3** | refactor-safely | 如涉及重构 |
| **P3** | user-guide-update | 如改变用户交互 |
| **P3** | secret-handling-review | 如涉及敏感信息 |
| **P3** | benchmark-analysis | 如需性能对比 |

> **注**: P1 为必验证，P2/P3 为可选验证（取决于 feature 内容）。