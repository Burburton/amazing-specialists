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

本专家包采用 **6-role 正式执行层模型**：
- `architect`（架构师）
- `developer`（开发者）
- `tester`（测试员）
- `reviewer`（审查员）
- `docs`（文档员）
- `security`（安全员）

当提及角色时，**优先使用 6-role 术语**，避免使用 3-skill 过渡术语（spec-writer, architect-auditor, task-executor）。

### 3-Skill 过渡骨架

当前 `.opencode/skills/` 中保留的 3-skill 是**过渡实现**：
- `spec-writer` → bootstrap / upstream-spec-assist（非执行角色）
- `architect-auditor` → architect + reviewer
- `task-executor` → developer + tester + docs + security

使用 3-skill 时，应：
1. 在文档中标记为 "(transition)" 或 "(bootstrap)"
2. 优先调用 6-role skills（如果已存在）
3. 在 comments 中注明 legacy compatibility 原因

### Feature 命名规范

后续 feature 应围绕 **6-role 正式模型**命名：
- ✅ 推荐：`003-architect-core`, `004-developer-core`, `005-tester-core`, ...
- ❌ 避免：`003-spec-writer-core`, `004-architect-auditor-v2`, ...

### 参考文档

- `role-definition.md` - 6-role 详细定义
- `docs/architecture/role-model-evolution.md` - 演进策略
- `docs/infra/migration/skill-to-role-migration.md` - 详细映射说明

## Package Rules
- Do not change role boundaries silently.
- Do not change I/O contract semantics silently.
- If changing package behavior, update governance docs first.
- Keep package responsibilities explicit and narrow.

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
