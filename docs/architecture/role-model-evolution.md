# Role Model Evolution

## Overview

本文档定义 OpenCode 专家包的角色模型演进路径，明确**正式执行层模型**与**过渡骨架**之间的关系。

## Current State (Current)

### 正式模型：6-Role 执行层（Formal Model）

自 2024 年起，OpenCode 专家包明确采用 **6 个核心角色**作为正式执行层模型：

| 角色 | 职责 | 核心输出 |
|------|------|----------|
| **architect** | 架构设计 | design note, interface contract, implementation plan |
| **developer** | 代码实现 | code changes, implementation summary, self-check report |
| **tester** | 测试验证 | test report, coverage gap summary, regression result |
| **reviewer** | 独立审查 | review report, approval decision, change request list |
| **docs** | 文档同步 | doc update report, changelog entry, usage doc patch |
| **security** | 安全审查 | security report, security issue list, gate decision |

**地位**：这是专家包的**正式执行层模型**，所有 governance 文档、feature 规划、role definition 均以此为准。

### 过渡骨架：3-Skill（Transition Skeleton）

当前 `.opencode/skills/` 目录仍保留早期采用的 **3-skill 结构**：

| Skill | 当前用途 | 定位 |
|-------|----------|------|
| **spec-writer** | 编写 spec.md | 过渡 / bootstrap |
| **architect-auditor** | 架构审计、生成 plan | 过渡 / bootstrap |
| **task-executor** | 执行任务 | 过渡 / bootstrap |

**地位**：这是**过渡实现骨架**，用于支撑早期 bootstrap 流程，不是最终角色体系。

## Migration Strategy

### 原则 1：Semantic Alignment First

**先统一语义和治理，再考虑目录重构。**

当前阶段（002-role-model-alignment）优先完成：
1. 治理文档中的角色语义统一
2. 明确 6-role 正式地位
3. 明确 3-skill 过渡性质
4. 建立清晰的映射关系

物理目录重构（如将 3-skill 拆分为 6-role 目录）推迟到后续阶段。

### 原则 2：Explicit Migration Notes

**不要默认团队会自己理解迁移关系，要显式写清楚。**

所有 governance 文档必须：
- 明确标注 6-role 为正式模型
- 明确标注 3-skill 为过渡骨架
- 提供详细的映射说明（见下方 Mapping）

### 原则 3：Forward-Compatible Naming

**后续 feature 命名应围绕正式角色模型展开。**

推荐的 feature 主线：
- ✅ `003-architect-core` - 正式 architect 角色核心能力
- ✅ `004-developer-core` - 正式 developer 角色核心能力
- ✅ `005-tester-core` - 正式 tester 角色核心能力
- ✅ `006-reviewer-core` - 正式 reviewer 角色核心能力
- ✅ `007-docs-core` - 正式 docs 角色核心能力
- ✅ `008-security-core` - 正式 security 角色核心能力

不推荐：
- ❌ `003-spec-writer-core` - 使用过渡 skill 命名
- ❌ `004-architect-auditor-v2` - 使用过渡 skill 命名

### 原则 4：Minimal-Disruption Transition

**先做最小必要修正，不要在大范围重构中拖慢主线。**

002-role-model-alignment feature 的边界：
- ✅ 创建架构说明文档
- ✅ 更新 governance 文档中的表述
- ❌ 不物理重构 `.opencode/skills/` 目录
- ❌ 不修改现有 command 的实现
- ❌ 不破坏现有 bootstrap 可运行性

## Mapping: 3-Skill → 6-Role

### spec-writer

**映射目标**：bootstrap / upstream-spec-assist（非正式执行角色）

**详细说明**：
- spec-writer 主要用于早期 bootstrap 阶段的 spec 编写
- 它不是 6-role 执行层中的正式角色
- 其功能将被拆分到：
  - **upstream-spec-assist**：上游需求澄清辅助（若存在）
  - **architect**：技术方案设计阶段的需求细化
  - **docs**：文档规范检查

**当前状态**：保留在 `.opencode/skills/spec-writer/`，标记为过渡

### architect-auditor

**映射目标**：architect + reviewer

**详细说明**：
- architect-auditor 的"架构审计"功能将拆分为：
  - **architect**：技术方案设计、模块边界划分、接口契约定义
  - **reviewer**：独立审查 design note 的合理性、风险识别

**当前状态**：保留在 `.opencode/skills/architect-auditor/`，标记为过渡

### task-executor

**映射目标**：developer + tester + docs + security

**详细说明**：
- task-executor 的"任务执行"功能将拆分为：
  - **developer**：代码实现、bugfix、局部重构
  - **tester**：测试设计与执行、回归分析
  - **docs**：文档同步、changelog 更新
  - **security**：高风险场景的安全审查

**当前状态**：保留在 `.opencode/skills/task-executor/`，标记为过渡

## Timeline

### Phase 1: Semantic Alignment (002-role-model-alignment) ✅

**时间**：2026-03

**目标**：
- 完成治理文档的角色语义统一
- 建立清晰的映射关系
- 明确后续 feature 主线方向

**交付物**：
- `docs/architecture/role-model-evolution.md` (本文档)
- `docs/infra/migration/skill-to-role-migration.md`
- 更新的 README.md, package-spec.md, role-definition.md, AGENTS.md

### Phase 2: Core Role Implementation (003-008)

**时间**：2026-Q2/Q3

**目标**：
- 实现 6 个正式角色的核心业务能力
- 每个角色具备完整的 skill set
- 不依赖 3-skill 过渡骨架也能完成完整流程

**交付物**：
- `specs/003-architect-core/`
- `specs/004-developer-core/`
- `specs/005-tester-core/`
- `specs/006-reviewer-core/`
- `specs/007-docs-core/`
- `specs/008-security-core/`

### Phase 3: Physical Restructuring (010-3-skill-migration) ✅

**时间**：2026-03-28

**目标**：
- 物理归档 `.opencode/skills/` 中的 3-skill 过渡骨架
- 移动到 `docs/archive/legacy-skills/`
- 保持历史可追溯

**交付物**：
- `docs/archive/legacy-skills/spec-writer/SKILL.md`
- `docs/archive/legacy-skills/architect-auditor/SKILL.md`
- `docs/archive/legacy-skills/task-executor/SKILL.md`
- `docs/archive/legacy-skills/README.md`
- `specs/010-3-skill-migration/`

## Decision Log

| 日期 | 决策 | 理由 | 状态 |
|------|------|------|------|
| 2024-XX | 采用 6-role 模型 | 更清晰的职责边界，便于专业化 | 已实施 |
| 2026-03 | 启动 002-role-model-alignment | 治理层与技术骨架不一致，需要对齐 | ✅ 已完成 |
| 2026-03 | 先语义对齐，后物理重构 | 最小侵入，避免破坏现有流程 | ✅ 已执行 |
| 2026-03-28 | 归档 3-skill 到 docs/archive | 保留历史可追溯，不删除 | ✅ 已完成 |

## References

- `role-definition.md` - 6-role 详细定义
- `package-spec.md` - 专家包规格
- `docs/infra/migration/skill-to-role-migration.md` - 详细映射说明
- `specs/002-role-model-alignment/` - 本 feature 的 spec/plan/tasks
