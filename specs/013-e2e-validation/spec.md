# 013-e2e-validation

## Background

本 feature 旨在通过实际运行一个完整的 spec-driven workflow 来验证整个专家包系统的端到端执行能力。这是一个"元 feature"——用于测试系统本身，而非实现业务功能。

系统已完成 37 个 skills（21 MVP + 16 M4）和 5 个核心命令（spec-start/spec-plan/spec-tasks/spec-implement/spec-audit）。需要通过实际执行验证：
1. 命令流程的正确性
2. 6-role 角色协同的有效性
3. artifact 输出的一致性
4. 质量门禁的可靠性

## Goal

执行一个简化的功能开发流程，验证：
- `/spec-start` 创建规范的能力
- `/spec-plan` 生成计划的能力
- `/spec-tasks` 生成任务列表的能力
- `/spec-implement` 实现功能的能力
- `/spec-audit` 审计验证的能力

**核心验证指标**：
- 每个命令能正确执行并输出预期 artifact
- 6 个角色（architect, developer, tester, reviewer, docs, security）能正确协同
- 审计能发现并报告问题（如有）

## Scope

### In Scope
- 运行完整 spec-driven workflow（5 个命令）
- 验证 artifact 输出格式符合模板规范
- 验证角色协同流程符合 collaboration-protocol.md
- 验证质量门禁检查能正确触发
- 生成验证报告总结流程执行结果

### Out of Scope
- 实际业务功能实现（仅运行测试流程）
- Enhanced 模式验证（本次仅验证 MVP 模式）
- 性能测试、压力测试
- 跨 feature 协同验证

## Actors

| Actor | Role | Responsibility |
|-------|------|----------------|
| Main Agent | Orchestrator | 执行命令流程，验证输出 |
| architect | architect | 技术方案设计（spec-plan 阶段） |
| developer | developer | 代码实现（spec-implement 阶段） |
| tester | tester | 测试验证（spec-implement/spec-audit 阶段） |
| reviewer | reviewer | 独立审查（spec-audit 阶段） |
| docs | docs | 文档同步（全流程） |
| security | security | 安全审查（如触发） |

## Core Workflows

### Workflow 1: 端到端验证流程

```
/spec-start 013-e2e-validation
  -> 创建 spec.md ✅ (已完成)
  
/spec-plan 013-e2e-validation
  -> architect: 生成 plan.md
  -> 验证 plan.md 格式符合模板
  
/spec-tasks 013-e2e-validation
  -> architect: 生成 tasks.md
  -> 验证 tasks.md 格式符合模板
  
/spec-implement 013-e2e-validation
  -> developer: 执行 tasks
  -> tester: 验证实现
  -> docs: 同步文档
  -> 输出实现摘要
  
/spec-audit 013-e2e-validation
  -> reviewer: 执行审计
  -> 输出审计报告
  -> 验证审计格式符合 audit-checklist-template.md
```

### Workflow 2: 角色协同验证

验证每个阶段的角色交接：
- architect → developer: plan.md + tasks.md 作为输入
- developer → tester: 实现代码 + 自检报告
- tester → reviewer: 测试报告
- reviewer → docs: 审计报告
- docs → security: 文档更新（如涉及敏感内容）

## Business Rules

1. **规则 E2E-001**: 每个命令必须输出预期 artifact
2. **规则 E2E-002**: artifact 格式必须符合 docs/templates/ 中的模板
3. **规则 E2E-003**: 角色交接必须遵循 collaboration-protocol.md
4. **规则 E2E-004**: 审计必须执行 quality-gate 检查
5. **规则 E2E-005**: 最终验证报告必须记录所有阶段的执行结果

## Non-functional Requirements

- **NFR-001**: 每个命令执行时间应在合理范围内（非性能测试）
- **NFR-002**: 输出文件路径必须正确 resolve
- **NFR-003**: 错误和警告必须被正确记录

## Acceptance Criteria

| ID | Criterion | Validation Method |
|----|-----------|-------------------|
| AC-001 | spec.md 创建成功 | 文件存在于 specs/013-e2e-validation/ |
| AC-002 | plan.md 创建成功且格式正确 | 文件存在，格式符合模板 |
| AC-003 | tasks.md 创建成功且格式正确 | 文件存在，格式符合模板 |
| AC-004 | 实现阶段正确执行 | 实现摘要输出 |
| AC-005 | 审计阶段正确执行 | 审计报告输出，格式符合模板 |
| AC-006 | 验证报告总结所有阶段 | verification-report.md 存在且内容完整 |

## Assumptions

1. 37 个 skills 已正确实现并可用
2. 5 个核心命令已正确配置
3. 测试环境支持运行完整流程
4. 不需要实际的业务代码实现（仅验证流程）

## Open Questions

1. 是否需要验证 Enhanced 模式？（本次 scope 外，可后续追加）
2. 审计是否需要验证 AH-001 至 AH-006 规则？（建议验证）

## Metadata

```yaml
feature_id: 013-e2e-validation
status: draft
created: 2026-03-28
mode: MVP  # 仅验证 MVP 模式
```