# Task List: 010-3-skill-migration

本文件基于 `spec.md` 和 `plan.md` 生成的可执行任务列表。

---

## Phase 1 - 创建归档目录

### T-1.1: 创建归档目录结构
- **状态**: ✅ COMPLETED
- **相关需求**: AC-001, AC-002
- **依赖**: 无
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `docs/archive/legacy-skills/spec-writer/`
  - ⬜ `docs/archive/legacy-skills/architect-auditor/`
  - ⬜ `docs/archive/legacy-skills/task-executor/`
- **验收标准**:
  - [ ] 目录结构已创建
- **预计耗时**: 5 分钟
- **风险**: 低

---

## Phase 2 - 移动文件

### T-2.1: 移动 spec-writer
- **状态**: ✅ COMPLETED
- **相关需求**: AC-001, AC-005
- **依赖**: T-1.1
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `docs/archive/legacy-skills/spec-writer/SKILL.md`
- **验收标准**:
  - [ ] 文件已移动
  - [ ] 原目录已删除
- **预计耗时**: 5 分钟
- **风险**: 低

### T-2.2: 移动 architect-auditor
- **状态**: ✅ COMPLETED
- **相关需求**: AC-001, AC-005
- **依赖**: T-1.1
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `docs/archive/legacy-skills/architect-auditor/SKILL.md`
- **验收标准**:
  - [ ] 文件已移动
  - [ ] 原目录已删除
- **预计耗时**: 5 分钟
- **风险**: 低

### T-2.3: 移动 task-executor
- **状态**: ✅ COMPLETED
- **相关需求**: AC-001, AC-005
- **依赖**: T-1.1
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `docs/archive/legacy-skills/task-executor/SKILL.md`
- **验收标准**:
  - [ ] 文件已移动
  - [ ] 原目录已删除
- **预计耗时**: 5 分钟
- **风险**: 低

### T-2.4: 创建归档说明
- **状态**: ✅ COMPLETED
- **相关需求**: AC-002
- **依赖**: T-2.1, T-2.2, T-2.3
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `docs/archive/legacy-skills/README.md`
- **验收标准**:
  - [ ] 说明文件存在
  - [ ] 包含历史文档说明
- **预计耗时**: 10 分钟
- **风险**: 低

---

## Phase 3 - 更新文档

### T-3.1: 更新 README.md
- **状态**: ✅ COMPLETED
- **相关需求**: AC-003
- **依赖**: Phase 2
- **执行角色**: docs
- **Deliverable**:
  - ⬜ README.md 更新
- **验收标准**:
  - [ ] 移除 "3-Skill 过渡骨架" 描述
  - [ ] 更新 Skills 目录结构
- **预计耗时**: 15 分钟
- **风险**: 低

### T-3.2: 更新 role-model-evolution.md
- **状态**: ✅ COMPLETED
- **相关需求**: AC-004
- **依赖**: Phase 2
- **执行角色**: docs
- **Deliverable**:
  - ⬜ `docs/architecture/role-model-evolution.md` 更新
- **验收标准**:
  - [ ] Phase 3 标记完成
  - [ ] 添加完成日期
- **预计耗时**: 10 分钟
- **风险**: 低

### T-3.3: 更新 skill-to-role-migration.md
- **状态**: ✅ COMPLETED
- **相关需求**: AC-004
- **依赖**: Phase 2
- **执行角色**: docs
- **Deliverable**:
  - ⬜ `docs/infra/migration/skill-to-role-migration.md` 更新
- **验收标准**:
  - [ ] 添加迁移完成说明
- **预计耗时**: 10 分钟
- **风险**: 低

### T-3.4: 更新 AGENTS.md
- **状态**: ✅ COMPLETED
- **相关需求**: AC-004
- **依赖**: Phase 2
- **执行角色**: docs
- **Deliverable**:
  - ⬜ AGENTS.md 更新
- **验收标准**:
  - [ ] 移除或简化 3-skill 相关规则
- **预计耗时**: 10 分钟
- **风险**: 低

---

## Phase 4 - 完成报告

### T-4.1: 创建 completion-report.md
- **状态**: ✅ COMPLETED
- **相关需求**: AC-001-AC-006
- **依赖**: Phase 3
- **执行角色**: docs
- **Deliverable**:
  - ⬜ `specs/010-3-skill-migration/completion-report.md`
- **验收标准**:
  - [ ] 所有 AC 状态记录
  - [ ] Known gaps 记录
- **预计耗时**: 10 分钟
- **风险**: 低

---

## 任务执行状态总览

| Task ID | 标题 | 角色 | 状态 | 依赖 | 预计耗时 |
|---------|------|------|------|------|----------|
| T-1.1 | 创建归档目录 | developer | ✅ COMPLETE | - | 5m |
| T-2.1 | 移动 spec-writer | developer | ✅ COMPLETE | T-1.1 | 5m |
| T-2.2 | 移动 architect-auditor | developer | ✅ COMPLETE | T-1.1 | 5m |
| T-2.3 | 移动 task-executor | developer | ✅ COMPLETE | T-1.1 | 5m |
| T-2.4 | 创建归档说明 | developer | ✅ COMPLETE | T-2.1-T-2.3 | 10m |
| T-3.1 | 更新 README.md | docs | ✅ COMPLETE | Phase 2 | 15m |
| T-3.2 | 更新 role-model-evolution.md | docs | ✅ COMPLETE | Phase 2 | 10m |
| T-3.3 | 更新 skill-to-role-migration.md | docs | ✅ COMPLETE | Phase 2 | 10m |
| T-3.4 | 更新 AGENTS.md | docs | ✅ COMPLETE | Phase 2 | 10m |
| T-4.1 | 创建 completion-report.md | docs | ✅ COMPLETE | Phase 3 | 10m |

**总计任务数**: 10 个
**已完成**: 10 个（100%）
**待执行**: 0 个（0%）
**预计总耗时**: 约 1.5 小时

---

## 文档信息

- **Tasks ID**: tasks-010-3-skill-migration-v1
- **版本**: 1.0.0
- **创建日期**: 2026-03-28
- **作者**: architect (via OpenCode agent)
- **关联 Spec**: `specs/010-3-skill-migration/spec.md`
- **关联 Plan**: `specs/010-3-skill-migration/plan.md`