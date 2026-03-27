# Feature Spec: 010-3-skill-migration

## Document Status
- **Feature ID**: `010-3-skill-migration`
- **Version**: 1.0.0
- **Status**: ✅ Complete
- **Created**: 2026-03-28
- **Author**: architect (via OpenCode agent)

---

## Background

根据 `docs/architecture/role-model-evolution.md` 和 `docs/infra/migration/skill-to-role-migration.md` 定义的三阶段迁移计划：

| Phase | 状态 | 说明 |
|-------|------|------|
| Phase 1: Semantic Alignment | ✅ 已完成 | 002-role-model-alignment |
| Phase 2: Core Role Implementation | ✅ 已完成 | 003-008 |
| **Phase 3: Physical Restructuring** | ⬜ 待执行 | 本 Feature |

### 当前状态

3-skill 过渡骨架位于 `.opencode/skills/` 目录：
- `spec-writer/SKILL.md` - 规格编写方法论
- `architect-auditor/SKILL.md` - 架构审计方法论
- `task-executor/SKILL.md` - 任务执行方法论

### 迁移条件检查

| 条件 | 状态 | 验证 |
|------|------|------|
| 6-role skill set 完整覆盖 3-skill 功能 | ✅ | 003-008 已完成 |
| 所有 commands 都迁移到 6-role | ✅ | commands 使用 `agent: general`，不依赖 3-skill |
| 没有活跃项目依赖 3-skill | ✅ | SKILL.md 仅是定义性文档 |

---

## Goal

完成 Phase 3 Physical Restructuring：

1. 归档 3-skill 过渡骨架到 `docs/archive/legacy-skills/`
2. 更新 README.md 移除 3-skill 过渡骨架说明
3. 更新迁移文档标记 Phase 3 完成
4. 保持向后兼容（归档而非删除）

---

## Scope

### In Scope

#### 1. 归档 3-skill 目录

将以下文件移动到归档目录：
- `.opencode/skills/spec-writer/SKILL.md` → `docs/archive/legacy-skills/spec-writer/SKILL.md`
- `.opencode/skills/architect-auditor/SKILL.md` → `docs/archive/legacy-skills/architect-auditor/SKILL.md`
- `.opencode/skills/task-executor/SKILL.md` → `docs/archive/legacy-skills/task-executor/SKILL.md`

#### 2. 创建归档说明

创建 `docs/archive/legacy-skills/README.md`，说明：
- 这些是历史遗留文档
- 已被 6-role 正式模型替代
- 保留作为参考

#### 3. 更新 README.md

- 移除 "3-Skill 过渡骨架" 相关描述
- 更新 Skills 目录结构说明
- 标记迁移完成

#### 4. 更新迁移文档

- `docs/architecture/role-model-evolution.md` - 标记 Phase 3 完成
- `docs/infra/migration/skill-to-role-migration.md` - 添加完成说明

#### 5. 更新 AGENTS.md

- 移除 "Role Semantics Priority" 中的 3-skill 相关规则（如果已无必要）

### Out of Scope

1. **不修改 commands** - commands 已经使用 `agent: general`
2. **不修改 6-role skills** - 003-008 保持不变
3. **不删除文件** - 归档而非删除，保持历史可追溯
4. **不修改 contracts** - specs/003-008/contracts 保持不变

---

## Business Rules

### BR-001: 归档而非删除
所有 3-skill 文件移到 `docs/archive/legacy-skills/`，保留历史记录。

### BR-002: 保持可追溯性
归档文件添加说明，明确其已被 6-role 替代。

### BR-003: README 清理
README.md 移除 3-skill 相关描述，反映当前状态。

### BR-004: 迁移文档更新
迁移文档标记 Phase 3 完成，记录完成日期。

---

## Acceptance Criteria

### AC-001: 3-skill 目录已归档
`docs/archive/legacy-skills/` 目录包含 3 个 SKILL.md 文件。

### AC-002: 归档说明已创建
`docs/archive/legacy-skills/README.md` 存在，说明这些是历史文档。

### AC-003: README.md 已更新
README.md 不再包含 "3-Skill 过渡骨架" 相关描述。

### AC-004: 迁移文档已更新
`docs/architecture/role-model-evolution.md` 标记 Phase 3 完成。

### AC-005: Skills 目录结构已更新
`.opencode/skills/` 目录不再包含 spec-writer, architect-auditor, task-executor。

### AC-006: 6-role skills 未受影响
`.opencode/skills/` 下的 6-role 目录保持不变。

---

## Assumptions

### ASM-001: Commands 不依赖 3-skill
经验证，所有 commands 使用 `agent: general`，不直接调用 3-skill。

### ASM-002: 无外部项目依赖
假设没有外部项目依赖 3-skill 目录结构。

### ASM-003: 归档足够
归档（而非删除）满足历史追溯需求。

---

## Open Questions

### OQ-001: 是否需要保留兼容层？
**推荐**: 不需要。Commands 已独立，6-role 已完整。

### OQ-002: 归档目录命名？
**推荐**: `docs/archive/legacy-skills/`，与其他文档归档保持一致。

---

## References

- `docs/architecture/role-model-evolution.md` - 演进策略
- `docs/infra/migration/skill-to-role-migration.md` - 迁移指南
- `role-definition.md` - 6-role 定义
- `README.md` - 项目概览

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial spec creation |