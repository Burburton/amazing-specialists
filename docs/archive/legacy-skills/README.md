# Legacy Skills Archive

本目录包含 **3-Skill 过渡骨架**的历史文档，已被 **6-Role 正式执行模型**替代。

---

## 归档日期

2026-03-28

---

## 归档文件

| 原路径 | 归档路径 | 替代方案 |
|--------|----------|----------|
| `.opencode/skills/spec-writer/` | `spec-writer/SKILL.md` | architect + docs 角色协作 |
| `.opencode/skills/architect-auditor/` | `architect-auditor/SKILL.md` | architect + reviewer 角色分工 |
| `.opencode/skills/task-executor/` | `task-executor/SKILL.md` | developer + tester + docs + security 角色分工 |

---

## 迁移说明

### spec-writer → architect + docs

| spec-writer 功能 | 替代角色 | 相关 Skill |
|------------------|----------|------------|
| 编写 spec.md | architect | requirement-to-design |
| 澄清 scope 边界 | architect | module-boundary-design |
| 记录假设 | docs | readme-sync |

### architect-auditor → architect + reviewer

| architect-auditor 功能 | 替代角色 | 相关 Skill |
|------------------------|----------|------------|
| 将 spec 转为技术 plan | architect | requirement-to-design |
| 模块边界划分 | architect | module-boundary-design |
| 审计设计一致性 | reviewer | spec-implementation-diff |
| trade-off 分析 | architect | tradeoff-analysis |

### task-executor → developer + tester + docs + security

| task-executor 功能 | 替代角色 | 相关 Skill |
|--------------------|----------|------------|
| 代码实现 | developer | feature-implementation, bugfix-workflow |
| 代码自检 | developer | code-change-selfcheck |
| 测试设计与执行 | tester | unit-test-design, edge-case-matrix |
| 文档同步 | docs | readme-sync, changelog-writing |
| 安全审查 | security | auth-and-permission-review, input-validation-review |

---

## 迁移 Feature

- `002-role-model-alignment` - 角色模型对齐（Phase 1）
- `003-architect-core` - architect 角色核心能力
- `004-developer-core` - developer 角色核心能力
- `005-tester-core` - tester 角色核心能力
- `006-reviewer-core` - reviewer 角色核心能力
- `007-docs-core` - docs 角色核心能力
- `008-security-core` - security 角色核心能力
- `010-3-skill-migration` - 3-Skill 迁移（Phase 3）

---

## 参考

- `docs/architecture/role-model-evolution.md` - 角色模型演进文档
- `docs/infra/migration/skill-to-role-migration.md` - 迁移指南
- `role-definition.md` - 6-Role 正式定义

---

*本归档保留作为历史参考，不应在新项目中使用。*