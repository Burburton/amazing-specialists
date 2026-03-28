# 015-historical-features-audit

## Background

本 feature 旨在对历史 features (003-012) 执行 AH-001~AH-006 审计规则，确保所有已完成的 feature 与 governance 文档保持一致。

随着 `docs/audit-hardening.md` 的建立，需要回溯验证所有历史 feature 是否符合审计强化规则。

## Goal

对 10 个历史 features 执行完整审计，识别并修复所有 governance 不一致问题。

**核心验证指标**:
- AH-001: Canonical Comparison - 检查与 role-definition.md, package-spec.md 等的一致性
- AH-002: Cross-Document Consistency - 检查跨文档状态、流程一致性
- AH-003: Path Resolution - 验证所有声明路径可 resolve
- AH-004: Status Truthfulness - 检查状态真实性
- AH-005: README Governance Sync - 检查 README 同步状态
- AH-006: Enhanced Reviewer Responsibilities - 检查 reviewer 职责

## Scope

### In Scope
- 审计 003-architect-core 至 012-performance-testing-skills (10 个 features)
- 识别所有 governance 不一致问题
- 修复 blocker 和 major findings
- 生成综合审计报告

### Out of Scope
- 审计 001-002 (bootstrap 和 role-model-alignment，已归档)
- 审计 013-014 (已审计)
- 功能性修改（仅修复 governance 问题）

## Actors

| Actor | Role | Responsibility |
|-------|------|----------------|
| Main Agent | Orchestrator | 协调并行审计，汇总结果 |
| reviewer | reviewer | 执行 AH-001~AH-006 审计规则 |
| docs | docs | 更新 README.md 和相关文档 |

## Features to Audit

| Feature ID | Feature Name | Priority |
|------------|--------------|----------|
| 003-architect-core | architect 角色核心技能 | P1 |
| 004-developer-core | developer 角色核心技能 | P1 |
| 005-tester-core | tester 角色核心技能 | P1 |
| 006-reviewer-core | reviewer 角色核心技能 | P1 |
| 007-docs-core | docs 角色核心技能 | P1 |
| 008-security-core | security 角色核心技能 | P1 |
| 009-command-hardening | 命令固化与验证 | P2 |
| 010-3-skill-migration | 3-Skill 迁移归档 | P2 |
| 011-m4-enhancement-kit | M4 可选增强套件 | P2 |
| 012-performance-testing-skills | 性能测试技能 | P2 |

## Acceptance Criteria

| ID | Criterion | Validation Method |
|----|-----------|-------------------|
| AC-001 | 所有 10 个 features 审计完成 | 每个_feature_有审计结果 |
| AC-002 | 所有 blocker findings 修复 | blocker_count = 0 |
| AC-003 | 所有 major findings 修复或记录 | major findings 状态记录 |
| AC-004 | README.md 同步更新 | README feature 表格准确 |
| AC-005 | 综合审计报告生成 | consolidated-audit-report.md 存在 |

## Audit Checklist Per Feature

### AH-001: Canonical Comparison
- [ ] 与 role-definition.md 一致
- [ ] 与 package-spec.md 一致
- [ ] 与 io-contract.md 一致
- [ ] 与 quality-gate.md 一致

### AH-002: Cross-Document Consistency
- [ ] spec.md status 与 completion-report 一致
- [ ] 流程顺序一致
- [ ] 角色边界一致

### AH-003: Path Resolution
- [ ] 所有声明路径可 resolve

### AH-004: Status Truthfulness
- [ ] 状态真实反映实际完成度
- [ ] known gaps 正确披露

### AH-005: README Governance Sync
- [ ] README feature 表格准确
- [ ] README 状态与 completion-report 一致

### AH-006: Enhanced Reviewer Responsibilities
- [ ] reviewer 职责正确执行

## Assumptions

1. 所有历史 features 已完成核心功能
2. Governance 文档 (role-definition.md 等) 是当前状态的权威来源
3. 审计发现可被修复

## Open Questions

1. 是否需要并行审计以提高效率？
2. Minor findings 是否需要全部修复？