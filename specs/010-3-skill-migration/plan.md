# Feature Plan: 010-3-skill-migration

## Document Status
- **Feature ID**: `010-3-skill-migration`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-28
- **Author**: architect (via OpenCode agent)

---

## Implementation Strategy

本 feature 采用**顺序执行**策略，按依赖关系依次完成：

```
Phase 1: 创建归档目录 → Phase 2: 移动文件 → Phase 3: 更新文档
```

---

## Phase 1: 创建归档目录

### T-1.1: 创建归档目录结构

**执行角色**: developer  
**预计耗时**: 5 分钟  
**Deliverable**: `docs/archive/legacy-skills/` 目录

**操作**:
```bash
mkdir -p docs/archive/legacy-skills/spec-writer
mkdir -p docs/archive/legacy-skills/architect-auditor
mkdir -p docs/archive/legacy-skills/task-executor
```

---

## Phase 2: 移动文件

### T-2.1: 移动 spec-writer

**执行角色**: developer  
**预计耗时**: 5 分钟  
**操作**:
```bash
mv .opencode/skills/spec-writer/SKILL.md docs/archive/legacy-skills/spec-writer/
rmdir .opencode/skills/spec-writer
```

### T-2.2: 移动 architect-auditor

**执行角色**: developer  
**预计耗时**: 5 分钟  
**操作**:
```bash
mv .opencode/skills/architect-auditor/SKILL.md docs/archive/legacy-skills/architect-auditor/
rmdir .opencode/skills/architect-auditor
```

### T-2.3: 移动 task-executor

**执行角色**: developer  
**预计耗时**: 5 分钟  
**操作**:
```bash
mv .opencode/skills/task-executor/SKILL.md docs/archive/legacy-skills/task-executor/
rmdir .opencode/skills/task-executor
```

### T-2.4: 创建归档说明

**执行角色**: developer  
**预计耗时**: 10 分钟  
**Deliverable**: `docs/archive/legacy-skills/README.md`

---

## Phase 3: 更新文档

### T-3.1: 更新 README.md

**执行角色**: docs  
**预计耗时**: 15 分钟  
**变更内容**:
- 移除 "3-Skill 过渡骨架" 相关描述
- 更新 Skills 目录结构说明
- 移除迁移文档引用（或更新为已完成）

### T-3.2: 更新 role-model-evolution.md

**执行角色**: docs  
**预计耗时**: 10 分钟  
**变更内容**:
- 标记 Phase 3 完成
- 添加完成日期
- 更新 Decision Log

### T-3.3: 更新 skill-to-role-migration.md

**执行角色**: docs  
**预计耗时**: 10 分钟  
**变更内容**:
- 添加迁移完成说明
- 更新 FAQ

### T-3.4: 更新 AGENTS.md

**执行角色**: docs  
**预计耗时**: 10 分钟  
**变更内容**:
- 移除或简化 3-skill 相关规则（如已无必要）

---

## Phase 4: 完成报告

### T-4.1: 创建 completion-report.md

**执行角色**: docs  
**预计耗时**: 10 分钟  
**Deliverable**: `specs/010-3-skill-migration/completion-report.md`

---

## 任务依赖图

```
Phase 1 (Setup)
└── T-1.1: 创建归档目录
    │
    ▼
Phase 2 (Migration)
├── T-2.1: 移动 spec-writer
├── T-2.2: 移动 architect-auditor
├── T-2.3: 移动 task-executor
└── T-4.4: 创建归档说明
    │
    ▼
Phase 3 (Documentation)
├── T-3.1: 更新 README.md
├── T-3.2: 更新 role-model-evolution.md
├── T-3.3: 更新 skill-to-role-migration.md
└── T-3.4: 更新 AGENTS.md
    │
    ▼
Phase 4 (Completion)
└── T-4.1: 创建 completion-report.md
```

---

## 预计总耗时

| Phase | 任务数 | 预计耗时 |
|-------|--------|----------|
| Phase 1 | 1 | 5 分钟 |
| Phase 2 | 4 | 25 分钟 |
| Phase 3 | 4 | 45 分钟 |
| Phase 4 | 1 | 10 分钟 |
| **总计** | **10** | **~1.5 小时** |

---

## Risk Analysis

### Risk 1: 意外删除文件
**影响**: 丢失历史文档  
**概率**: 低  
**缓解**: 使用 `mv` 而非 `rm`，确保文件被移动而非删除

### Risk 2: 文档引用断裂
**影响**: README 或其他文档中的链接失效  
**概率**: 中  
**缓解**: 全面检查引用并更新

---

## References

- `specs/010-3-skill-migration/spec.md` - Feature specification
- `docs/architecture/role-model-evolution.md` - 演进策略
- `docs/infra/migration/skill-to-role-migration.md` - 迁移指南

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial plan creation |