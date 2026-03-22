# Skill 开发计划

## 1. 文档目的

本计划基于以下设计文档制定：
- `docs/infra/OpenCode 专家包设计.md`
- `docs/infra/全自动产品研发闭环_MVP设计稿.md`
- `docs/infra/OpenCode 专家包 MVP skill 清单与来源建议.md`

目标是为 OpenCode 专家包补充缺失的 skills，建立完整的角色化执行能力。

---

## 2. 当前状态

### 2.1 已有 Skills（3个）
| Skill | 路径 | 归属角色 |
|-------|------|----------|
| spec-writer | `.opencode/skills/spec-writer/` | 通用/管理层 |
| architect-auditor | `.opencode/skills/architect-auditor/` | architect |
| task-executor | `.opencode/skills/task-executor/` | developer |

### 2.2 缺失统计
| 类别 | 应有 | 已有 | 缺失 |
|------|------|------|------|
| Common Skills | 5 | 0 | 5 |
| architect | 5 | 1 | 4 |
| developer | 5 | 1 | 4 |
| tester | 5 | 0 | 5 |
| reviewer | 5 | 0 | 5 |
| docs | 4 | 0 | 4 |
| security | 4 | 0 | 4 |
| **总计** | **33** | **3** | **30** |

---

## 3. 建设策略

### 3.1 总体原则
- **先复用方法型 skill，再自定义协议型 skill**
- **P0 优先，P1 按需**
- **Common skills 先行** —— 所有角色都依赖它们
- **按角色闭环验证** —— 每完成一个角色就验证能否跑通

### 3.2 优先级定义
- **P0**: MVP 最小闭环必需，不做无法跑通基础流程
- **P1**: 增强型，提升质量但不阻塞基础流程
- **P2**: 可选，等主闭环稳定后再做

### 3.3 复用策略
| 类型 | 策略 | 示例 |
|------|------|------|
| 可直接复用 | 吸收成熟社区方法 | tradeoff-analysis |
| 可半复用 | 参考骨架，改写输出格式 | requirement-to-design |
| 必须自定义 | 按本专家包 schema 自建 | execution-reporting, code-change-selfcheck |

---

## 4. Skill 创建顺序

### 第一阶段：Common Skills 基础层（5个）
**目标**: 建立所有角色共享的基础能力

| 顺序 | Skill | 优先级 | 复用策略 | 预计工时 |
|------|-------|--------|----------|----------|
| 1 | artifact-reading | P0 | 半复用 | 2h |
| 2 | context-summarization | P0 | 半复用 | 2h |
| 3 | failure-analysis | P0 | 半复用 | 3h |
| 4 | execution-reporting | P0 | **必须自定义** | 2h |
| 5 | retry-strategy | P1 | 半复用 | 2h |

**阶段验收标准**: 能统一读取 spec/design note，统一输出 execution result

---

### 第二阶段：Core Role 最小闭环（12个）
**目标**: 让 architect -> developer -> tester -> reviewer 能完整跑通

#### architect（3个新）
| 顺序 | Skill | 优先级 | 复用策略 | 预计工时 |
|------|-------|--------|----------|----------|
| 6 | requirement-to-design | P0 | 半复用 | 3h |
| 7 | module-boundary-design | P0 | 半复用 | 2h |
| 8 | tradeoff-analysis | P0 | 可直接复用 | 1.5h |
| - | ~~interface-contract-design~~ | P1 | 可延后 | - |
| - | ~~migration-planning~~ | P1 | 可延后 | - |

#### developer（3个新）
| 顺序 | Skill | 优先级 | 复用策略 | 预计工时 |
|------|-------|--------|----------|----------|
| 9 | feature-implementation | P0 | 半复用 | 3h |
| 10 | bugfix-workflow | P0 | 半复用 | 2h |
| 11 | code-change-selfcheck | P0 | **必须自定义** | 2h |
| - | ~~refactor-safely~~ | P1 | 可延后 | - |
| - | ~~dependency-minimization~~ | P1 | 可延后 | - |

#### tester（3个）
| 顺序 | Skill | 优先级 | 复用策略 | 预计工时 |
|------|-------|--------|----------|----------|
| 12 | unit-test-design | P0 | 半复用 | 2h |
| 13 | regression-analysis | P0 | 半复用 | 2h |
| 14 | edge-case-matrix | P0 | 半复用 | 2h |
| - | ~~integration-test-design~~ | P1 | 可延后 | - |
| - | ~~flaky-test-diagnosis~~ | P1 | 可延后 | - |

#### reviewer（4个）
| 顺序 | Skill | 优先级 | 复用策略 | 预计工时 |
|------|-------|--------|----------|----------|
| 15 | code-review-checklist | P0 | 半复用 | 2h |
| 16 | spec-implementation-diff | P0 | **必须自定义** | 3h |
| 17 | reject-with-actionable-feedback | P0 | 半复用 | 2h |
| 18 | risk-review | P0 | 半复用 | 2h |
| - | ~~maintainability-review~~ | P1 | 可延后 | - |

**阶段验收标准**: 能用 specs/001-bootstrap 跑通完整 feature 流程

---

### 第三阶段：外围角色增强（6个）
**目标**: 补齐 docs 和 security，让高风险任务也能处理

#### docs（2个）
| 顺序 | Skill | 优先级 | 复用策略 | 预计工时 |
|------|-------|--------|----------|----------|
| 19 | readme-sync | P1 | 半复用 | 2h |
| 20 | changelog-writing | P1 | 可直接复用 | 1.5h |
| - | ~~architecture-doc-sync~~ | P2 | 可延后 | - |
| - | ~~user-guide-update~~ | P2 | 可延后 | - |

#### security（4个）
| 顺序 | Skill | 优先级 | 复用策略 | 预计工时 |
|------|-------|--------|----------|----------|
| 21 | auth-and-permission-review | P1 | 半复用 | 2h |
| 22 | input-validation-review | P1 | 半复用 | 2h |
| 23 | secret-handling-review | P1 | 半复用 | 2h |
| 24 | dependency-risk-review | P1 | 半复用 | 2h |

**阶段验收标准**: 涉及 auth/permission 的变更能触发 security 检查

---

### 第四阶段：高级增强（9个，可选）
**目标**: 完善各角色的深度能力

| 顺序 | Skill | 优先级 | 归属角色 |
|------|-------|--------|----------|
| 25 | interface-contract-design | P2 | architect |
| 26 | migration-planning | P2 | architect |
| 27 | refactor-safely | P2 | developer |
| 28 | dependency-minimization | P2 | developer |
| 29 | integration-test-design | P2 | tester |
| 30 | flaky-test-diagnosis | P2 | tester |
| 31 | maintainability-review | P2 | reviewer |
| 32 | architecture-doc-sync | P2 | docs |
| 33 | user-guide-update | P2 | docs |

---

## 5. Skill 内容框架模板

每个 Skill 的 `SKILL.md` 应遵循以下结构：

```markdown
# Skill Name

## Purpose
这个 skill 解决什么问题，提供什么能力

## When to Use
- 适用场景 1
- 适用场景 2

## When Not to Use
- 不适用场景 1
- 不适用场景 2

## Required Inputs
| 字段 | 类型 | 说明 |
|------|------|------|
| input_1 | string | 描述 |
| input_2 | object | 描述 |

## Steps
1. 步骤一：具体动作
2. 步骤二：具体动作
3. 步骤三：具体动作

## Checklists
### 前置检查
- [ ] 检查项 1
- [ ] 检查项 2

### 过程检查
- [ ] 检查项 3
- [ ] 检查项 4

### 后置检查
- [ ] 检查项 5
- [ ] 检查项 6

## Common Failure Modes
| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 失败模式 1 | 现象描述 | 如何应对 |
| 失败模式 2 | 现象描述 | 如何应对 |

## Output Requirements
### 必须输出
- output_1: 描述
- output_2: 描述

### 可选输出
- optional_1: 描述

## Examples
### 示例 1：正常场景
输入：...
输出：...

### 示例 2：边界场景
输入：...
输出：...
```

---

## 6. 目录结构规划

```
.opencode/skills/
├── common/
│   ├── artifact-reading/
│   │   └── SKILL.md
│   ├── context-summarization/
│   │   └── SKILL.md
│   ├── failure-analysis/
│   │   └── SKILL.md
│   ├── execution-reporting/
│   │   └── SKILL.md
│   └── retry-strategy/
│       └── SKILL.md
├── architect/
│   ├── requirement-to-design/
│   │   └── SKILL.md
│   ├── module-boundary-design/
│   │   └── SKILL.md
│   ├── interface-contract-design/
│   │   └── SKILL.md
│   ├── tradeoff-analysis/
│   │   └── SKILL.md
│   └── migration-planning/
│       └── SKILL.md
├── developer/
│   ├── feature-implementation/
│   │   └── SKILL.md
│   ├── bugfix-workflow/
│   │   └── SKILL.md
│   ├── refactor-safely/
│   │   └── SKILL.md
│   ├── dependency-minimization/
│   │   └── SKILL.md
│   └── code-change-selfcheck/
│       └── SKILL.md
├── tester/
│   ├── unit-test-design/
│   │   └── SKILL.md
│   ├── integration-test-design/
│   │   └── SKILL.md
│   ├── regression-analysis/
│   │   └── SKILL.md
│   ├── edge-case-matrix/
│   │   └── SKILL.md
│   └── flaky-test-diagnosis/
│       └── SKILL.md
├── reviewer/
│   ├── code-review-checklist/
│   │   └── SKILL.md
│   ├── spec-implementation-diff/
│   │   └── SKILL.md
│   ├── risk-review/
│   │   └── SKILL.md
│   ├── maintainability-review/
│   │   └── SKILL.md
│   └── reject-with-actionable-feedback/
│       └── SKILL.md
├── docs/
│   ├── readme-sync/
│   │   └── SKILL.md
│   ├── changelog-writing/
│   │   └── SKILL.md
│   ├── architecture-doc-sync/
│   │   └── SKILL.md
│   └── user-guide-update/
│       └── SKILL.md
└── security/
    ├── auth-and-permission-review/
    │   └── SKILL.md
    ├── secret-handling-review/
    │   └── SKILL.md
    ├── input-validation-review/
    │   └── SKILL.md
    └── dependency-risk-review/
        └── SKILL.md
```

---

## 7. 关键依赖关系

```
Common Skills (所有后续 skill 依赖)
  ├── artifact-reading
  ├── context-summarization
  ├── failure-analysis
  └── execution-reporting

Role Skills
  ├── architect
  │   └── requirement-to-design (依赖: artifact-reading)
  ├── developer
  │   ├── feature-implementation (依赖: artifact-reading, execution-reporting)
  │   └── code-change-selfcheck (依赖: execution-reporting)
  ├── tester
  │   └── unit-test-design (依赖: artifact-reading)
  ├── reviewer
  │   ├── code-review-checklist (依赖: artifact-reading)
  │   └── spec-implementation-diff (依赖: artifact-reading, execution-reporting)
  ├── docs
  │   └── readme-sync (依赖: artifact-reading)
  └── security
      └── auth-and-permission-review (依赖: artifact-reading)
```

---

## 8. 里程碑计划

| 里程碑 | 交付内容 | 预计时间 | 验收标准 |
|--------|----------|----------|----------|
| M1 | Common Skills (5个) | 2-3天 | 能统一读取工件，统一输出结果 |
| M2 | Core Roles 基础 (12个) | 5-7天 | 能用 001-bootstrap 跑通 feature 流程 |
| M3 | 外围角色 (6个) | 3-4天 | 高风险任务能触发 security 检查 |
| M4 | 高级增强 (9个) | 按需 | 根据实际使用反馈决定 |

---

## 9. 下一步行动

立即开始 **第一阶段：Common Skills**

1. **创建目录结构** —— 按规划创建所有 skill 目录
2. **实现 artifact-reading** —— P0 最高优先级
3. **实现 execution-reporting** —— 与 artifact-reading 并行
4. **验证** —— 用 specs/001-bootstrap 测试读取和输出

---

## 10. 附录：参考来源

### 可直接复用/半复用的来源
- **Anthropic Skills**: 方法论骨架参考
- **Superpowers**: workflow discipline, design-first 思想
- **OpenCode 社区 skills**: 目录组织方式

### 必须自定义的要点
- execution-reporting: 与 `io-contract.md` 中的 result schema 对齐
- code-change-selfcheck: 与 `quality-gate.md` 中的 developer gate 对齐
- spec-implementation-diff: 与 spec/plan/tasks 格式对齐

---

## 变更记录

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
| 2026-03-22 | v0.1 | 初始版本，规划 skill 创建顺序和内容框架 | - |
