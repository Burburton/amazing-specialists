# Skill-to-Role Migration Guide

## Migration Status

**迁移状态**: ✅ 已完成（2026-03-28）

3-skill 过渡骨架已归档到 `docs/archive/legacy-skills/`。详见 `specs/010-3-skill-migration/`。

---

## Overview

本文档提供从 **3-skill 过渡骨架**迁移到 **6-role 正式模型**的详细映射指南。

## Quick Reference Table

| 3-Skill (过渡) | 6-Role (正式) | 映射类型 | 状态 |
|----------------|---------------|----------|------|
| spec-writer | bootstrap / upstream-spec-assist | 非执行角色 | 过渡保留 |
| architect-auditor | architect + reviewer | 一拆二 | 过渡保留 |
| task-executor | developer + tester + docs + security | 一拆四 | 过渡保留 |

## Detailed Mapping

### spec-writer → Bootstrap / Upstream-Spec-Assist

#### 当前状态

**Location**: `.opencode/skills/spec-writer/`

**Current Purpose**:
- 将产品意图转为结构化 spec.md
- 澄清 scope 边界
- 记录假设与开放问题

#### 映射分析

spec-writer **不是** 6-role 执行层的正式角色。它的功能将按场景分配：

| spec-writer 功能 | 目标归属 | 说明 |
|------------------|----------|------|
| 编写 spec.md | bootstrap / upstream | 属于流程初始化，不是执行层职责 |
| 澄清 scope 边界 | architect + reviewer | 架构设计时明确边界，审查时验证 |
| 记录假设 | 所有角色 | 每个角色都应在输出中记录假设 |

#### 迁移建议

**短期（当前阶段）**：
- 保留 `.opencode/skills/spec-writer/`
- 在文档中标记为 "bootstrap / transition"
- 继续用于 spec-start 命令

**长期（未来）**：
- spec 编写功能可拆分为：
  - **上游需求澄清**：由 OpenClaw 管理层或专门的需求分析工具处理
  - **技术 spec 细化**：由 architect 角色的 requirement-to-design skill 处理
- 考虑移除 spec-writer skill，或仅保留为 legacy 兼容

#### Compatibility Notes

- `/spec-start` 命令当前依赖 spec-writer skill
- 迁移期间保持命令接口不变
- 内部实现可逐步从 spec-writer 转向 6-role 协作

---

### architect-auditor → architect + reviewer

#### 当前状态

**Location**: `.opencode/skills/architect-auditor/`

**Current Purpose**:
- 将 spec 转为技术 plan
- 审计设计一致性
- 识别风险与 trade-off

#### 映射分析

architect-auditor 的功能明确拆分为两个正式角色：

| architect-auditor 功能 | 目标角色 | 说明 |
|------------------------|----------|------|
| 将 spec 转为技术 plan | architect | architect 的核心职责 |
| 模块边界划分 | architect | module-boundary-design skill |
| 接口契约定义 | architect | interface-contract-design skill |
| 审计设计一致性 | reviewer | spec-implementation-diff skill |
| 识别风险 | architect + reviewer | architect 识别设计风险，reviewer 识别实现风险 |
| trade-off 分析 | architect | tradeoff-analysis skill |

#### 职责边界

```
architect（设计阶段）
├── requirement-to-design
├── module-boundary-design
├── tradeoff-analysis
└── 输出: design note, interface contract

reviewer（审查阶段）
├── spec-implementation-diff
├── code-review-checklist
├── risk-review
└── 输出: review report, approval decision
```

#### 迁移建议

**短期（当前阶段）**：
- 保留 `.opencode/skills/architect-auditor/`
- 在文档中标记为 "transition - splitting into architect + reviewer"
- 继续用于 spec-plan 命令

**中期（003-architect-core, 006-reviewer-core）**：
- 实现正式的 architect 和 reviewer 角色 skill set
- architect-auditor 的功能被完全覆盖

**长期**：
- 归档或删除 architect-auditor skill
- /spec-plan 命令直接调用 architect 角色

#### Compatibility Notes

- architect-auditor 目前同时做"设计"和"审计"
- 6-role 模型中，design 和 audit 是不同阶段的独立职责
- 注意避免 reviewer 越权做设计（应触发 replan）

---

### task-executor → developer + tester + docs + security

#### 当前状态

**Location**: `.opencode/skills/task-executor/`

**Current Purpose**:
- 执行具体任务
- 读取 spec/plan/tasks
- 实现变更，验证结果

#### 映射分析

task-executor 是一个"万能执行器"，在 6-role 模型中被拆分为专业化角色：

| task-executor 功能 | 目标角色 | Skill |
|--------------------|----------|-------|
| 代码实现 | developer | feature-implementation, bugfix-workflow |
| 代码自检 | developer | code-change-selfcheck |
| 测试设计 | tester | unit-test-design, edge-case-matrix |
| 测试执行 | tester | regression-analysis |
| 文档同步 | docs | readme-sync, changelog-writing |
| 安全审查 | security | auth-and-permission-review, input-validation-review |

#### 职责边界

```
标准执行流：
developer → tester → reviewer → docs

高风险执行流：
developer → tester → reviewer → security → docs
```

#### 迁移建议

**短期（当前阶段）**：
- 保留 `.opencode/skills/task-executor/`
- 在文档中标记为 "transition - splitting into developer + tester + docs + security"
- 继续用于 spec-implement 命令

**中期（004-developer-core, 005-tester-core, 007-docs-core, 008-security-core）**：
- 实现 4 个正式角色的 skill set
- task-executor 的功能被完全覆盖
- /spec-implement 调用相应角色而非 task-executor

**长期**：
- 归档或删除 task-executor skill
- 可能保留一个轻量级的 "task-router" 用于分发任务到各角色

#### Compatibility Notes

- task-executor 目前是一个"黑盒"，内部决定如何执行
- 6-role 模型中，执行是透明的、分阶段的、可审查的
- 注意保持 /spec-implement 命令的接口稳定性

---

## Migration Checklist

### For Feature Developers

当开发新的 feature 时，参考以下 checklist：

- [ ] 使用 6-role 术语描述 actors（architect, developer, tester, reviewer, docs, security）
- [ ] 不使用 3-skill 术语作为正式角色名（spec-writer, architect-auditor, task-executor）
- [ ] 在 spec 中明确每个 task 的目标角色
- [ ] 参考 role-definition.md 确定角色边界

### For Skill Developers

当开发新的 skill 时，参考以下 checklist：

- [ ] 将 skill 归属到正确的 6-role 目录（`.opencode/skills/{role}/`）
- [ ] 不添加到 3-skill 目录（spec-writer, architect-auditor, task-executor）
- [ ] 遵循 role-definition.md 中的职责边界
- [ ] 在 skill 文档中注明所属角色

### For Command Developers

当修改 command 时，参考以下 checklist：

- [ ] 优先调用 6-role skills（如果已存在）
- [ ] 如需调用 3-skill，添加注释说明是 "legacy compatibility"
- [ ] 规划 command 的迁移路径到 6-role
- [ ] 保持 command 接口的向后兼容

## Common Pitfalls

### Pitfall 1: 混淆 skill 和 role

❌ **错误**："spec-writer 角色应该..."

✅ **正确**："spec-writer skill 用于 bootstrap，不是正式执行角色。spec 编写功能应由...处理"

### Pitfall 2: 在 6-role feature 中使用 3-skill 命名

❌ **错误**：Feature ID: `003-spec-writer-core`

✅ **正确**：Feature ID: `003-architect-core`（如果需要 upstream spec assist）或 `003-requirement-clarification`

### Pitfall 3: 假设 3-skill 会被立即移除

❌ **错误**："既然有了 6-role，我可以删除 spec-writer 了"

✅ **正确**："3-skill 在 Phase 1 保留，Phase 2 并行运行，Phase 3 才考虑移除"

### Pitfall 4: 忽视映射关系的复杂性

❌ **错误**："task-executor 就是 developer"

✅ **正确**："task-executor 的功能拆分到 developer、tester、docs、security 四个角色"

## FAQ

### Q: 为什么 3-skill 不直接重命名为 6-role？

A: 因为不是简单的一一对应：
- spec-writer 不是执行角色
- architect-auditor 拆分为 architect + reviewer
- task-executor 拆分为 developer + tester + docs + security

直接重命名会掩盖这种结构性变化。

### Q: 我应该在什么时候使用 3-skill vs 6-role？

A:
- **当前（Phase 1）**：继续按需使用 3-skill，但文档中使用 6-role 术语
- **Phase 2**：优先使用 6-role，3-skill 作为 fallback
- **Phase 3**：只使用 6-role

### Q: 如果我发现文档中混用了 3-skill 和 6-role 术语怎么办？

A: 提交 fix，优先统一为 6-role 术语。如果涉及 3-skill 的具体实现，添加 "(transition)" 标记。

### Q: 3-skill 什么时候会被完全移除？

A: ✅ **已完成（2026-03-28）**。3-skill 过渡骨架已归档到 `docs/archive/legacy-skills/`。6-role 正式模型完全替代。

## References

- `docs/architecture/role-model-evolution.md` - 演进策略和时间线
- `role-definition.md` - 6-role 详细定义
- `package-spec.md` - 专家包规格
- `specs/002-role-model-alignment/` - 本 feature 的 spec/plan/tasks
