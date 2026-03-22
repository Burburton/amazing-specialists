# Feature Spec: 002b-governance-repair

## Background

`002-role-model-alignment` feature 在 2026-03-22 被标记为完成，其 completion-report 声称已更新 README.md、AGENTS.md、package-spec.md、role-definition.md 等治理文档，明确了 6-role 正式模型与 3-skill 过渡骨架的关系。

然而，后续检查发现仓库存在以下治理不一致问题：

1. **002 completion-report 与仓库实际状态漂移**：
   - 报告声称已完成治理文档更新
   - 但实际文档中 6-role/3-skill 的表述仍不够清晰统一

2. **6-role 与 3-skill 语义未在核心文档中统一**：
   - README.md 对 `.opencode/skills/` 的描述未区分正式角色目录与 legacy 过渡目录
   - AGENTS.md 缺少明确的 "Role Semantics Priority" 规则
   - package-spec.md 对 3-skill 的定位表述不够明确

3. **高风险流程顺序冲突**：
   - role-definition.md 定义的高风险流程：`architect → developer → tester → reviewer → security → docs`
   - m3-skills-integration-verification-report.md 记录的验证流程：`architect → developer → tester → security → reviewer → docs`
   - 两者在 security 与 reviewer 的顺序上不一致

## Goal

一次性修复上述治理一致性问题，确保：

1. 002-role-model-alignment 的完成报告与仓库状态建立可追溯的修补关系
2. 6-role 正式执行模型与 3-skill 过渡骨架的语义在所有核心治理文档中统一
3. 高风险流程顺序在所有文档中一致
4. 不创建 003-architect-core，不开始 feature003 的任何工作

## Scope

### In Scope

1. **创建 002b-governance-repair spec-driven 文档**：
   - spec.md（本文档）
   - plan.md
   - tasks.md
   - completion-report.md

2. **修复 README.md**：
   - 明确 6-role 正式执行层语义
   - 明确 3-skill 为 legacy transition/bootstrap skeleton
   - 区分 `.opencode/skills/` 的两层结构（正式角色目录 + legacy 过渡目录）
   - 修正 Recommended Workflow 阶段说明

3. **修复 AGENTS.md**：
   - 增加 "Role Semantics Priority" 规则章节
   - 明确 6-role 正式语义优先
   - 明确 3-skill 必须标注 transition/legacy
   - 补充 completion-report 与仓库一致性规则

4. **修复 package-spec.md**：
   - 明确 6-role 为正式执行模型
   - 明确 3-skill 为 bootstrap/transition implementation
   - 增加 6-role vs 3-skill 映射说明

5. **统一高风险流程顺序**：
   - 修复 role-definition.md（如需要）
   - 修复 m3-skills-integration-verification-report.md
   - 统一为：`architect → developer → tester → reviewer → security → docs`

6. **更新 002-role-model-alignment completion-report**：
   - 添加 Post-Completion Note / Follow-up Repair Note
   - 引用 002b-governance-repair 作为后续修补

### Out of Scope

1. **不创建 `specs/003-architect-core/`**
2. **不开始 feature003 的任何工作**
3. **不实现 architect skill 的具体内容**
4. **不删除或修改 `.opencode/skills/` 目录结构**
5. **不修改除上述文件外的其他代码**

## Business Rules

1. **BR-001**: 6-role (architect, developer, tester, reviewer, docs, security) 是正式执行层模型
2. **BR-002**: 3-skill (spec-writer, architect-auditor, task-executor) 是 legacy transition/bootstrap 兼容层
3. **BR-003**: 所有 governance 文档对 6-role/3-skill 的表述必须一致
4. **BR-004**: 高风险流程顺序统一为：architect → developer → tester → reviewer → security → docs
5. **BR-005**: completion-report 与仓库状态不一致时，必须通过后续 feature 修复并建立可追溯关系
6. **BR-006**: 本次修复不创建 003-architect-core，不开始 feature003

## Acceptance Criteria

### AC-001
README.md / AGENTS.md / package-spec.md 三者都明确：
- 6-role 是正式模型
- 3-skill 是 transition/bootstrap

### AC-002
README 中不再把 `.opencode/skills/` 简单描述为"3 个核心技能"，而是反映正式角色目录 + legacy 过渡目录并存

### AC-003
AGENTS.md 中存在明确的 "Role Semantics Priority" 规则

### AC-004
package-spec.md 中存在 6-role vs 3-skill 的明确定位与映射说明

### AC-005
role-definition.md 与 m3-skills-integration-verification-report.md 的高风险流程顺序完全一致，且统一为：
architect → developer → tester → reviewer → security → docs

### AC-006
002-role-model-alignment completion-report 通过 follow-up repair note 与 002b 建立可追溯关系

### AC-007
specs/002b-governance-repair/ 下 spec.md / plan.md / tasks.md / completion-report.md 已创建，scope 仅限治理修补

### AC-008
明确说明 003-architect-core 尚未创建，feature003 需后续单独立项

## Assumptions

1. **ASM-001**: 002-role-model-alignment 的语义设计是正确的，只是文档落盘不完全
2. **ASM-002**: role-definition.md 中的高风险流程顺序是最终标准
3. **ASM-003**: 修复期间不引入新的业务功能

## Open Questions

无
