# Feature Plan: 011-m4-enhancement-kit

## Document Status
- **Feature ID**: `011-m4-enhancement-kit`
- **Version**: 1.0.0
- **Status**: Complete
- **Created**: 2026-03-28
- **Author**: architect (via OpenCode agent)

---

## Implementation Strategy

本 feature 采用 **分层交付** 策略：

```
Phase 1: Architect M4 Skills (2 skills)
Phase 2: Developer M4 Skills (2 skills)
Phase 3: Tester M4 Skills (2 skills)
Phase 4: Reviewer M4 Skills (2 skills)
Phase 5: Docs M4 Skills (2 skills)
Phase 6: Security M4 Skills (2 skills)
Phase 7: Command Enhancement (--enhanced flag)
Phase 8: Documentation & Governance
```

Phase 1-6 可并行执行，Phase 7-8 顺序执行。

---

## Phase 1: Architect M4 Skills

### T-1.1: 创建 interface-contract-design skill

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `.opencode/skills/architect/interface-contract-design/SKILL.md`

**内容框架**:
```markdown
# Interface Contract Design

## Purpose
设计 API/模块接口契约，确保上下游对齐。

## When to Use
- 新增 API endpoint
- 定义模块间接口
- 微服务边界定义

## Key Activities
1. 定义接口签名（输入/输出）
2. 定义错误响应格式
3. 定义版本策略
4. 定义向后兼容规则

## Output
- interface-contract.md 或 OpenAPI spec
```

### T-1.2: 创建 migration-planning skill

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `.opencode/skills/architect/migration-planning/SKILL.md`

**内容框架**:
```markdown
# Migration Planning

## Purpose
规划数据/系统迁移策略，最小化风险。

## When to Use
- 数据库 schema 变更
- 系统升级
- 数据迁移

## Key Activities
1. 现状分析
2. 迁移策略选择
3. 回滚计划
4. 分阶段执行计划

## Output
- migration-plan.md
```

---

## Phase 2: Developer M4 Skills

### T-2.1: 创建 refactor-safely skill

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `.opencode/skills/developer/refactor-safely/SKILL.md`

**内容框架**:
```markdown
# Refactor Safely

## Purpose
安全重构代码，不改变行为。

## When to Use
- 重构遗留代码
- 改善代码结构
- 提取公共逻辑

## Key Activities
1. 识别重构范围
2. 确保测试覆盖
3. 小步重构
4. 每步验证

## Output
- refactor-checklist.md
```

### T-2.2: 创建 dependency-minimization skill

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `.opencode/skills/developer/dependency-minimization/SKILL.md`

---

## Phase 3: Tester M4 Skills

### T-3.1: 创建 integration-test-design skill

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `.opencode/skills/tester/integration-test-design/SKILL.md`

### T-3.2: 创建 flaky-test-diagnosis skill

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `.opencode/skills/tester/flaky-test-diagnosis/SKILL.md`

---

## Phase 4: Reviewer M4 Skills

### T-4.1: 创建 maintainability-review skill

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `.opencode/skills/reviewer/maintainability-review/SKILL.md`

### T-4.2: 创建 risk-review skill

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `.opencode/skills/reviewer/risk-review/SKILL.md`

---

## Phase 5: Docs M4 Skills

### T-5.1: 创建 architecture-doc-sync skill

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `.opencode/skills/docs/architecture-doc-sync/SKILL.md`

### T-5.2: 创建 user-guide-update skill

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `.opencode/skills/docs/user-guide-update/SKILL.md`

---

## Phase 6: Security M4 Skills

### T-6.1: 创建 secret-handling-review skill

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `.opencode/skills/security/secret-handling-review/SKILL.md`

### T-6.2: 创建 dependency-risk-review skill

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `.opencode/skills/security/dependency-risk-review/SKILL.md`

---

## Phase 7: Command Enhancement

### T-7.1: 修改 spec-start 命令

**执行角色**: developer  
**预计耗时**: 0.5 小时  
**Deliverable**: `.opencode/commands/spec-start.md` 更新

**变更内容**:
```markdown
---
description: Create or refine a feature spec
agent: general
flags:
  --enhanced: Enable M4 enhancement kit
---

Use the spec-driven workflow for feature: $ARGUMENTS

## Enhanced Mode (--enhanced)

When `--enhanced` flag is provided:
1. Apply M4 architect skills:
   - interface-contract-design (for API features)
   - migration-planning (for migration features)
2. Record `enhanced: true` in spec.md metadata
```

### T-7.2: 修改 spec-plan 命令

**执行角色**: developer  
**预计耗时**: 0.5 小时  
**Deliverable**: `.opencode/commands/spec-plan.md` 更新

### T-7.3: 修改 spec-implement 命令

**执行角色**: developer  
**预计耗时**: 0.5 小时  
**Deliverable**: `.opencode/commands/spec-implement.md` 更新

### T-7.4: 修改 spec-audit 命令

**执行角色**: developer  
**预计耗时**: 0.5 小时  
**Deliverable**: `.opencode/commands/spec-audit.md` 更新

### T-7.4.5: 修改 spec-tasks 命令

**执行角色**: developer  
**预计耗时**: 0.5 小时  
**Deliverable**: `.opencode/commands/spec-tasks.md` 更新

**变更内容**:
```markdown
---
description: Generate task list from a feature plan
agent: general
flags:
  --enhanced: Enable M4 enhancement kit
---

## Enhanced Mode (--enhanced)

When `--enhanced` flag is provided:
1. Apply M4 skills for task enhancement:
   - (architect) migration-planning - add migration tasks if needed
   - (tester) integration-test-design - add integration test tasks
   - (security) dependency-risk-review - add security review tasks
```

### T-7.5: 创建 enhanced-mode 选择器

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `docs/enhanced-mode-selector.md`

**内容**:
- 如何检测 `--enhanced` 标志
- 如何从 spec.md metadata 继承
- 哪些 M4 skills 在哪些场景激活

---

## Phase 7.5: Validation

### T-7.6: 验证 MVP 模式不变

**执行角色**: tester  
**预计耗时**: 0.5 小时  
**Deliverable**: `specs/011-m4-enhancement-kit/validation/mvp-mode-validation.md`

**验证内容**:
- 不带 `--enhanced` 执行 spec-start，验证不调用 M4 skills
- 不带 `--enhanced` 执行 spec-implement，验证不调用 M4 skills
- 确认流程与之前完全一致

### T-7.7: 验证 Enhanced 模式激活

**执行角色**: tester  
**预计耗时**: 0.5 小时  
**Deliverable**: `specs/011-m4-enhancement-kit/validation/enhanced-mode-validation.md`

**验证内容**:
- 带 `--enhanced` 执行 spec-start，验证调用 M4 architect skills
- 带 `--enhanced` 执行 spec-audit，验证调用 M4 reviewer/security skills
- 确认 M4 skills 在适当场景被激活

---

## Phase 8: Documentation & Governance

### T-8.1: 创建 enhanced-mode-guide.md

**执行角色**: docs  
**预计耗时**: 1 小时  
**Deliverable**: `docs/enhanced-mode-guide.md`

**内容框架**:
```markdown
# Enhanced Mode Guide

## What is Enhanced Mode?

Enhanced Mode 启用 M4 增强套件，提供高级技能...

## How to Enable

### Per-Command
/spec-start my-feature --enhanced

### Via spec.md Metadata
enhanced: true

## When to Use Enhanced Mode

- 复杂迁移场景
- 大规模重构
- 安全敏感项目
- 需要全面审查的项目

## M4 Skills Reference

| Skill | Role | Purpose |
|-------|------|---------|
| interface-contract-design | architect | API 契约设计 |
| ...
```

### T-8.2: 更新 README.md

**执行角色**: docs  
**预计耗时**: 0.5 小时  
**Deliverable**: README.md M4 章节更新

### T-8.3: 创建 completion-report.md

**执行角色**: docs  
**预计耗时**: 0.5 小时  
**Deliverable**: `specs/011-m4-enhancement-kit/completion-report.md`

---

## 任务依赖图

```
Phase 1 (Architect) ────────────────────────────────┐
├── T-1.1: interface-contract-design                │
└── T-1.2: migration-planning                       │
                                                    │
Phase 2 (Developer) ────────────────────────────────│
├── T-2.1: refactor-safely                          │
└── T-2.2: dependency-minimization                  │
                                                    │
Phase 3 (Tester) ───────────────────────────────────│
├── T-3.1: integration-test-design                  │
└── T-3.2: flaky-test-diagnosis                     │
                                                    │
Phase 4 (Reviewer) ─────────────────────────────────│
├── T-4.1: maintainability-review                   │
└── T-4.2: risk-review                              │
                                                    │
Phase 5 (Docs) ─────────────────────────────────────│
├── T-5.1: architecture-doc-sync                    │
└── T-5.2: user-guide-update                        │
                                                    │
Phase 6 (Security) ─────────────────────────────────│
├── T-6.1: secret-handling-review                   │
└── T-6.2: dependency-risk-review                   │
                                                    │
────────────────────────────────────────────────────┘
                    │
                    ▼
Phase 7 (Commands) ─────────────────────────────────
├── T-7.1: spec-start enhancement
├── T-7.2: spec-plan enhancement
├── T-7.3: spec-implement enhancement
├── T-7.4: spec-audit enhancement
├── T-7.4.5: spec-tasks enhancement
└── T-7.5: enhanced-mode selector
                    │
                    ▼
Phase 7.5 (Validation) ────────────────────────────
├── T-7.6: MVP mode validation
└── T-7.7: Enhanced mode validation
                    │
                    ▼
Phase 8 (Documentation)
├── T-8.1: enhanced-mode-guide.md
├── T-8.2: README.md update
└── T-8.3: completion-report.md
```

---

## 预计总耗时

| Phase | 任务数 | 预计耗时 |
|-------|--------|----------|
| Phase 1-6 (Skills) | 12 | 12 小时 |
| Phase 7 (Commands) | 6 | 3.5 小时 |
| Phase 7.5 (Validation) | 2 | 1 小时 |
| Phase 8 (Docs) | 3 | 2 小时 |
| **总计** | **23** | **~18.5 小时** |

---

## 并行执行建议

Phase 1-6 可分配给 6 个并行 agents：
- Agent A: Phase 1 (Architect skills)
- Agent B: Phase 2 (Developer skills)
- Agent C: Phase 3 (Tester skills)
- Agent D: Phase 4 (Reviewer skills)
- Agent E: Phase 5 (Docs skills)
- Agent F: Phase 6 (Security skills)

---

## Risk Analysis

### Risk 1: Skills 过于复杂
**影响**: M4 skills 难以使用  
**缓解**: 每个 SKILL.md 保持简洁，聚焦核心方法论

### Risk 2: 标志解析问题
**影响**: 命令不支持 `--enhanced`  
**缓解**: 在命令中使用简单的字符串匹配

### Risk 3: 与 MVP 冲突
**影响**: 增强模式覆盖 MVP 行为  
**缓解**: M4 是"补充"而非"替代"，保持 MVP 优先

---

## References

- `specs/011-m4-enhancement-kit/spec.md` - Feature specification
- `.opencode/commands/spec-*.md` - 现有命令
- `specs/003-architect-core/` - MVP architect skills 参考

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial plan creation |