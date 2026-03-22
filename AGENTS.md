# AGENTS.md

## Development Mode
This repository is expert-pack driven and spec-driven.
All feature work must follow the artifacts under `specs/<feature>/`.
All package-level decisions must follow the governance documents in the repository root.

## Package Governance Source of Truth
Priority order for package governance:
1. `package-spec.md`
2. `role-definition.md`
3. `io-contract.md`
4. `quality-gate.md`
5. `collaboration-protocol.md`
6. `package-lifecycle.md`

## Feature Implementation Source of Truth
Priority order for feature work:
1. `specs/<feature>/spec.md`
2. `specs/<feature>/plan.md`
3. `specs/<feature>/data-model.md`
4. `specs/<feature>/contracts/*`
5. `specs/<feature>/tasks.md`

## Global Rules
- Do not invent product requirements beyond the spec.
- Do not invent package capabilities beyond the package spec.
- If information is missing, record it under `Assumptions` or `Open Questions`.
- Prefer explicit conflict reports over silent interpretation.
- Use canonical terms consistently.
- Preserve traceability from package governance -> feature spec -> plan -> task -> code -> validation.

## Role Semantics Priority（角色语义优先规则）

### 正式模型优先

本仓库采用 **6-role 正式执行层语义**：
- `architect`（架构师）
- `developer`（开发者）
- `tester`（测试员）
- `reviewer`（审查员）
- `docs`（文档员）
- `security`（安全员）

当提及角色、actor、执行者时，**优先使用 6-role 术语**。

### 3-Skill 过渡骨架定位

`.opencode/skills/` 中的 **3-skill 是 legacy transition/bootstrap 兼容层**：
- `spec-writer` - legacy，将迁移到 architect（前置规格化）+ docs（文档规范）
- `architect-auditor` - legacy，将迁移到 architect + reviewer
- `task-executor` - legacy，将迁移到 developer/tester/docs/security

**使用 3-skill 时必须标注**：
1. 在文档中标记为 "(transition)"、"(legacy)" 或 "(bootstrap)"
2. 在 comments 中注明 "legacy compatibility"
3. 优先调用 6-role skills（如果已存在）

### Feature 命名规范

后续 feature、artifact、actor 描述**必须使用 6-role 术语**：
- ✅ 推荐：`003-architect-core`, `004-developer-core`, `005-tester-core`, ...
- ❌ 避免：`003-spec-writer-core`, `004-architect-auditor-v2`, `005-task-executor-enhancement`, ...

### 语义冲突解决

若不同文档间出现角色语义冲突：
- **以 `package-spec.md` + `role-definition.md` 中的 6-role 定义为准**
- 3-skill 相关表述应理解为 "legacy compatibility" 而非正式语义
- 冲突应通过 governance repair feature 解决，而非 silent reinterpretation

### Completion Report Consistency

- completion-report 声称已完成的治理更新，必须与仓库当前内容一致
- 若不一致，应通过后续 feature（如 002b-governance-repair）修复并建立可追溯关系
- 不允许长期漂移（drift）

### 参考文档

- `role-definition.md` - 6-role 详细定义
- `package-spec.md` - 正式模型与过渡骨架说明
- `docs/architecture/role-model-evolution.md` - 演进策略
- `docs/infra/migration/skill-to-role-migration.md` - 详细映射说明

## Package Rules
- Do not change role boundaries silently.
- Do not change I/O contract semantics silently.
- If changing package behavior, update governance docs first.
- Keep package responsibilities explicit and narrow.

## Governance Sync Rule（治理文档同步规则）

### Scope
以下类型的 feature 变更必须在完成前同步到公共文档：
- package governance（包治理规则、接口契约）
- role model semantics（角色定义、角色边界、角色映射）
- workflow ordering（工作流程、阶段顺序）
- command semantics（命令行为、输入输出格式）
- migration strategy（迁移策略、过渡方案）

### Required Action
在判定 feature 完成之前，必须：
1. 检查 `README.md` 是否需要更新
2. 检查 `package-spec.md` 是否需要更新
3. 检查 `role-definition.md` 是否需要更新
4. 检查 `AGENTS.md` 是否需要更新
5. 确保所有 governance 文档之间的一致性

### Completion Criteria
> 如果 feature 改变了上述 scope 中的任何一项，而公共文档（特别是 `README.md`）未同步更新，则该 feature **不能视为完成**。

## Feature Rules
- Do not implement a feature unless `spec.md` and `plan.md` exist.
- Every code change must map to at least one task in `tasks.md`.
- Every completed task must be validated against acceptance criteria or derived tests.
- Implement one task at a time unless explicitly marked parallel-safe.

## Execution Discipline
Always summarize:
- what was changed
- which file(s) were changed
- which task or governance update was performed
- what validation was run
- what risks, blockers, or assumptions remain
