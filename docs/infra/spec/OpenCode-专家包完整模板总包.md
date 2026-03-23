# OpenCode 专家包完整模板总包

这是一份可直接落地的统一模板文档，用于构建 **OpenCode 专家包**。

它把两类模板合并成一个总包：

1. **专家包治理层**  
   用来定义专家包本身的职责、边界、输入输出、质量门禁、协作协议和生命周期

2. **Spec-Driven 开发层**  
   用来驱动专家包内部功能的实现流程：  
   `spec -> plan -> tasks -> implement -> audit`

3. **OpenCode 接入层**  
   用来把上述规则落进 OpenCode：
   - `AGENTS.md`
   - `.opencode/commands/*.md`
   - `.opencode/skills/*/SKILL.md`

目标是让你最终得到一套：

- 可规范写需求和规划
- 可约束 OpenCode 输出
- 可派生 implementation plan
- 可进入 agent workflow
- 可审计一致性和质量
- 可长期复用和演进

---

# 一、适用场景

这份模板适合：

- 你要设计一个可复用的 OpenCode 专家包
- 你希望需求文档写完后，AI 能继续按规范往下干
- 你要沉淀长期资产，而不是一次性 prompt
- 你后续会有多个专家包协作
- 你要做质量门禁、协作边界和版本管理

不太适合：

- 一次性的临时脚本
- 只写一个小功能，不打算长期维护
- 只想快速试验，不在意一致性和复用性

---

# 二、推荐目录结构

```text
repo/
├─ README.md
├─ package-spec.md
├─ role-definition.md
├─ io-contract.md
├─ quality-gate.md
├─ collaboration-protocol.md
├─ package-lifecycle.md
├─ AGENTS.md
├─ .opencode/
│  ├─ commands/
│  │  ├─ spec-start.md
│  │  ├─ spec-plan.md
│  │  ├─ spec-tasks.md
│  │  ├─ spec-implement.md
│  │  └─ spec-audit.md
│  └─ skills/
│     ├─ spec-writer/
│     │  └─ SKILL.md
│     ├─ architect-auditor/
│     │  └─ SKILL.md
│     └─ task-executor/
│        └─ SKILL.md
├─ examples/
│  ├─ happy-path.md
│  ├─ edge-cases.md
│  └─ failure-cases.md
└─ specs/
   └─ 001-bootstrap/
      ├─ spec.md
      ├─ plan.md
      ├─ tasks.md
      ├─ data-model.md
      ├─ research.md
      └─ contracts/
```

说明：

- 根目录文档：定义专家包治理规则
- `AGENTS.md`：给 OpenCode 的项目级规则
- `.opencode/commands/`：给 OpenCode 的流程命令
- `.opencode/skills/`：给 OpenCode 的角色行为模板
- `examples/`：沉淀正例、边界例、失败例
- `specs/`：用于该专家包内部功能自身的 spec-driven 开发

---

# 三、根目录治理文档模板

## 1）README.md

保存为 `README.md`

```md
# Expert Pack Name

## What It Is
一句话说明这是做什么的专家包。

## What Problem It Solves
解决什么问题。

## Included Components
- package-spec.md
- role-definition.md
- io-contract.md
- quality-gate.md
- collaboration-protocol.md
- package-lifecycle.md
- AGENTS.md
- commands
- skills
- examples
- specs

## How to Use
1. 阅读 package-spec.md
2. 确认 role-definition.md 和 io-contract.md
3. 按 quality-gate.md 做校验
4. 按 collaboration-protocol.md 接入整体流程
5. 用 examples 做最小验证
6. 用 specs/ 中的 spec-driven 流程推进内部实现

## Recommended Workflow
- bootstrap package spec
- define roles
- define I/O contract
- define quality gate
- define collaboration protocol
- define lifecycle
- initialize OpenCode layer
- test with examples
- build internal feature specs

## Limits
说明此专家包的边界和限制。
```

---

## 2）package-spec.md

保存为 `package-spec.md`

```md
# Package Spec

## Package Name

## Package Goal
说明这个专家包的主要目标。

## Problem Statement
说明它要解决的核心问题。

## Target Use Cases
列出典型使用场景。

## Non-Goals
明确它不解决什么问题。

## Target Users / Agents
说明谁会调用这个专家包。
例如：
- planner agent
- architect agent
- task executor agent
- human operator

## Supported Roles
列出这个专家包内部包含的角色。
例如：
- spec-writer
- architect-auditor
- task-executor

## Supported Commands
列出该专家包暴露的命令。
例如：
- /spec-start
- /spec-plan
- /spec-tasks
- /spec-implement
- /spec-audit

## Supported Skills
列出该专家包包含的 skills。
例如：
- spec-writer
- architect-auditor
- task-executor

## Expected Inputs
说明专家包所需输入的类型和粒度。

## Expected Outputs
说明专家包产出的工件和结果。

## Quality Requirements
说明专家包输出必须满足的质量标准。

## Integration Points
说明它与哪些系统、流程或专家包集成。

## Risks and Limits
说明专家包的适用边界和风险。

## Acceptance Criteria
说明如何判定这个专家包“可用”。
```

---

## 3）role-definition.md

保存为 `role-definition.md`

```md
# Role Definition

## Role Name

## Mission
一句话说明这个角色的使命。

## In Scope
明确该角色负责的内容。

## Out of Scope
明确该角色不负责的内容。

## Trigger Conditions
在什么情况下应调用该角色。

## Required Inputs
列出必需输入。

## Optional Inputs
列出可选输入。

## Expected Outputs
列出该角色必须输出的工件、结论或状态。

## Success Criteria
什么样的输出算合格。

## Failure Modes
常见失败模式。
例如：
- 输入不足
- 需求冲突
- 术语不清
- 上游文档缺失
- 下游依赖未满足

## Escalation Rules
当角色无法继续时如何上报。
例如：
- 转入 open questions
- 进入 conflict report
- 阻塞后续执行

## Dependencies on Other Roles
说明依赖哪些上游角色，输出给哪些下游角色。

## Notes
补充说明。
```

---

## 4）io-contract.md

保存为 `io-contract.md`

```md
# I/O Contract

## Contract Name

## Purpose
定义该契约的用途。

## Input Schema
说明输入的结构。
建议用半结构化字段描述：

- goal
- context
- constraints
- existing_artifacts
- requested_output
- priority
- known_risks

## Required Input Fields
列出必填字段。

## Optional Input Fields
列出可选字段。

## Input Validation Rules
说明输入的校验规则。
例如：
- goal 不可为空
- constraints 必须区分硬约束和软约束
- existing_artifacts 若存在必须给出路径

## Output Schema
说明输出的结构。
建议至少包含：

- summary
- artifacts_created_or_updated
- assumptions
- open_questions
- blockers
- next_step

## Required Output Sections
列出强制输出的章节。

## Forbidden Behaviors
列出禁止行为。
例如：
- 不得伪造不存在的输入
- 不得省略冲突
- 不得把 assumption 写成 confirmed fact
- 不得输出未定义术语

## Error Output Format
定义错误输出格式。
例如：

- error_type
- impact
- blocking_reason
- recommended_action

## Traceability Rules
说明输出如何追溯到输入和上游文档。
例如：
- 每个关键结论应对应输入来源
- 每个新增 artifact 应注明来源 spec 或 plan
```

---

## 5）quality-gate.md

保存为 `quality-gate.md`

```md
# Quality Gate

## Gate Name

## Objective
说明这套质量门禁检查什么。

## Completeness Checks
检查输出是否完整。
例如：
- 是否覆盖必填章节
- 是否包含 assumptions
- 是否包含 next step
- 是否明确 scope / out-of-scope

## Consistency Checks
检查输出是否前后一致。
例如：
- 术语是否统一
- 是否存在自相矛盾的规则
- 是否和上游 spec / plan 冲突

## Terminology Checks
检查术语是否规范。
例如：
- 是否使用 glossary 中 canonical terms
- 是否引入未定义术语
- 是否混用同义词导致语义漂移

## Traceability Checks
检查可追溯性。
例如：
- 需求是否能映射到设计
- 设计是否能映射到任务
- 任务是否能映射到实现和验证

## Output Format Checks
检查输出格式是否符合约定。
例如：
- 必填字段是否都出现
- section 顺序是否符合模板
- 是否存在空章节未标注

## Review Checklist
供 human/operator 或 auditor 审阅：
- 该输出是否可直接交给下游角色
- 是否还需要补充澄清
- 是否有高风险 assumption
- 是否存在应阻塞的冲突

## Pass Criteria
列出通过条件。

## Fail Criteria
列出失败条件。

## Severity Levels
建议定义：
- S0: 可忽略的小问题
- S1: 建议修复的问题
- S2: 影响下游工作的明显问题
- S3: 必须阻塞的重大问题

## Remediation Rules
出现失败后怎么办：
- 返工给原角色
- 进入 conflict resolution
- 升级人工审阅
```

---

## 6）collaboration-protocol.md

保存为 `collaboration-protocol.md`

```md
# Collaboration Protocol

## Protocol Name

## Purpose
定义该专家包如何与其他角色或专家包协作。

## Upstream Inputs
说明从哪些角色/专家包接收输入。
例如：
- requirements clarifier
- product planner
- spec writer

## Downstream Outputs
说明输出给哪些角色/专家包。
例如：
- architect auditor
- task executor
- test validator

## Hand-off Rules
定义交接时必须满足的条件。
例如：
- spec writer 交给 architect 之前，spec 必须通过 quality gate
- architect 交给 executor 之前，tasks 必须存在且依赖清晰

## Blocking Conditions
定义哪些情况必须阻塞。
例如：
- 缺少 spec
- plan 与 spec 冲突
- task 缺少 requirement traceability
- 高风险 assumption 未确认

## Retry Rules
定义失败重试规则。
例如：
- 同类小问题允许自动修复一次
- 核心冲突不得自动反复重试
- 连续失败两次应升级人工审查

## Ownership Boundaries
明确职责边界。
例如：
- spec writer 不负责技术实现
- architect 不负责修改产品目标
- task executor 不负责扩展 scope

## Escalation Flow
定义升级路径。
例如：
- role self-report
- package auditor
- human reviewer

## Collaboration Examples
给出至少 1 个正常流转案例和 1 个阻塞案例。
```

---

## 7）package-lifecycle.md

保存为 `package-lifecycle.md`

```md
# Package Lifecycle

## Package Name

## Current Version

## Versioning Strategy
建议使用：
- MAJOR：职责边界或 I/O 契约不兼容变化
- MINOR：新增命令、skill、规则，且兼容旧用法
- PATCH：修复模板、描述、轻微规则问题

## Change Triggers
什么情况下需要更新版本。
例如：
- 新增角色
- 新增关键命令
- I/O 契约变更
- 质量门禁收紧
- 新增协作协议

## Backward Compatibility Policy
说明如何保持兼容。
例如：
- 老 command 名称保留一个版本周期
- 老输出格式提供兼容层
- 关键字段不可直接删除

## Deprecation Rules
说明如何弃用旧能力。
例如：
- 标记 deprecated
- 给出替代方案
- 给出迁移时间窗

## Migration Notes
说明升级时需要做什么。
例如：
- 重命名 skill 目录
- 更新 AGENTS.md
- 更新 command 参数格式
- 更新 examples 和 tests

## Release Checklist
发布新版本前检查：
- 文档是否完整
- examples 是否更新
- quality gate 是否同步更新
- collaboration protocol 是否同步更新
- 下游兼容性是否验证

## Rollback Strategy
如果新版本不稳定，如何回滚。
```

---

# 四、examples 模板

## 1）examples/happy-path.md

```md
# Happy Path Example

## Scenario
描述一个正常输入场景。

## Input
给出样例输入。

## Expected Behavior
说明专家包应该如何处理。

## Expected Output
说明期望输出结构和结果。

## Why This Matters
说明这个例子验证了什么能力。
```

---

## 2）examples/edge-cases.md

```md
# Edge Cases

## Scenario 1
### Input
### Risk
### Expected Handling

## Scenario 2
### Input
### Risk
### Expected Handling
```

---

## 3）examples/failure-cases.md

```md
# Failure Cases

## Failure Scenario
描述失败输入。

## Why It Fails
说明失败原因。

## Required Output
说明专家包应如何阻塞、上报、输出错误。

## Escalation
说明应如何进入升级路径。
```

---

# 五、AGENTS.md 模板

将下面内容保存为仓库根目录 `AGENTS.md`

```md
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
```

---

# 六、Spec-Driven 开发层模板

## 1）specs/<feature>/spec.md

```md
# Feature Spec

## Background

## Goal

## Scope

## Out of Scope

## Actors

## Core Workflows

## Business Rules

## Non-functional Requirements

## Acceptance Criteria

## Assumptions

## Open Questions
```

---

## 2）specs/<feature>/plan.md

```md
# Implementation Plan

## Architecture Summary

## Inputs from Spec

## Technical Constraints

## Module Decomposition

## Data Flow

## Failure Handling

## Validation Strategy

## Risks / Tradeoffs

## Requirement Traceability
```

---

## 3）specs/<feature>/tasks.md

```md
# Task List

## Phase 1 - Setup / Prerequisites

- [ ] T-001 Task title
  - Related requirements:
  - Dependencies:
  - Deliverable:

## Phase 2 - Core Implementation

- [ ] T-002 Task title
  - Related requirements:
  - Dependencies:
  - Deliverable:

## Phase 3 - Integration / Edge Cases

- [ ] T-003 Task title
  - Related requirements:
  - Dependencies:
  - Deliverable:

## Phase 4 - Validation / Cleanup

- [ ] T-004 Task title
  - Related requirements:
  - Dependencies:
  - Deliverable:
```

---

# 七、.opencode/commands 模板

将下面文件分别保存到 `.opencode/commands/`

## 1）spec-start.md

```md
---
description: Create or refine a feature spec
agent: general
---

Use the spec-driven workflow for feature: $ARGUMENTS

Goals:
1. Create or refine the feature folder under `specs/`.
2. Draft or update `spec.md`.
3. Focus on business requirements, user value, and acceptance criteria.
4. Avoid implementation details unless strictly necessary for understanding constraints.

Instructions:
- Check whether a matching feature directory exists.
- If it does not exist, create a new feature directory under `specs/`.
- Write `spec.md` with at least these sections:
  - Background
  - Goal
  - Scope
  - Out of Scope
  - Actors
  - Core Workflows
  - Business Rules
  - Non-functional Requirements
  - Acceptance Criteria
  - Assumptions
  - Open Questions
- Use explicit and stable terminology.
- Do not silently fill missing product facts.
- Put unknowns into `Assumptions` or `Open Questions`.

Output:
- created/updated files
- unresolved ambiguities
- next recommended command
```

---

## 2）spec-plan.md

```md
---
description: Generate implementation plan from a feature spec
agent: general
---

Read `specs/$1/spec.md` and generate or update technical design artifacts for feature `$1`.

Produce or update:
- `specs/$1/plan.md`
- `specs/$1/data-model.md` if needed
- `specs/$1/research.md` if needed
- `specs/$1/contracts/` if needed

Plan requirements:
- Translate requirements into architecture and implementation strategy.
- Preserve traceability from the spec.
- Explicitly list assumptions and risks.
- Surface conflicts instead of silently resolving them.

`plan.md` should include:
- Architecture Summary
- Inputs from Spec
- Technical Constraints
- Module Decomposition
- Data Flow
- Failure Handling
- Validation Strategy
- Risks / Tradeoffs
- Requirement Traceability

`data-model.md` should include:
- Core objects
- Key fields
- Invariants
- State transitions where relevant

`research.md` should include:
- Unknowns explored
- Technical options considered
- Final decisions and rationale

Output:
- files created or updated
- conflicts found
- next recommended command
```

---

## 3）spec-tasks.md

```md
---
description: Generate executable task list from plan and design docs
agent: general
---

Generate or update `specs/$1/tasks.md` for feature `$1`.

Read first:
- `specs/$1/spec.md`
- `specs/$1/plan.md`
- `specs/$1/data-model.md` if present
- `specs/$1/research.md` if present
- every file under `specs/$1/contracts/` if present

Task generation rules:
- Break work into small executable units.
- Each task should be independently understandable.
- Mark tasks that are safe to parallelize with `[P]`.
- Include coding, test, validation, and documentation updates when needed.
- Each task must reference the relevant section or requirement from `spec.md` and/or `plan.md`.
- Preserve implementation order and dependencies.

`tasks.md` format:
- Phase 1: setup / prerequisites
- Phase 2: core implementation
- Phase 3: integration / edge cases
- Phase 4: validation / cleanup

For each task include:
- task id
- title
- related requirements
- dependency notes if any
- deliverable expectation

Output:
- created/updated tasks
- dependency highlights
- next recommended command
```

---

## 4）spec-implement.md

```md
---
description: Implement a single task from a spec task list
agent: general
---

Implement feature `$1`, task `$2`.

Read first:
- `specs/$1/spec.md`
- `specs/$1/plan.md`
- `specs/$1/tasks.md`
- `specs/$1/data-model.md` if present
- `specs/$1/contracts/` if present

Execution rules:
1. Locate task `$2`.
2. Implement only what is required for this task.
3. Do not expand scope beyond the task and spec.
4. If a blocker or contradiction is found, stop and report it explicitly.
5. Run relevant tests or validations after changes.
6. Update task status in `tasks.md` if appropriate.

Final response format:
- Implemented task
- Files changed
- Validation run
- Remaining risks / blockers

Strict constraints:
- Do not implement tasks not listed in `tasks.md`.
- Do not invent product behavior absent from the spec.
- Do not silently rewrite requirements during implementation.
```

---

## 5）spec-audit.md

```md
---
description: Audit consistency between spec, plan, tasks, and code
agent: explore
---

Audit feature `$1`.

Read:
- `specs/$1/spec.md`
- `specs/$1/plan.md`
- `specs/$1/tasks.md`
- `specs/$1/data-model.md` if present
- `specs/$1/contracts/` if present

Also inspect the relevant implementation files.

Audit checklist:
1. Requirement-to-implementation coverage gaps
2. Missing or orphan tasks
3. Terminology inconsistencies
4. Data model mismatches
5. Contract mismatches
6. Acceptance criteria not yet validated
7. Assumptions that leaked into implementation as facts
8. Risks introduced by implementation not reflected in plan/spec

Output sections:
- Summary
- Coverage Gaps
- Consistency Issues
- Missing Validation
- Suggested Fixes
```

---

# 八、.opencode/skills 模板

将下面文件分别保存到 `.opencode/skills/.../SKILL.md`

## 1）.opencode/skills/spec-writer/SKILL.md

```md
# Spec Writer

## Purpose
Create or refine product specifications in a structured and stable way.

## When to Use
Use this skill when the user provides a new feature idea, fuzzy requirement, or asks to formalize a requirement into a specification.

## Primary Responsibilities
- Convert product intent into a structured `spec.md`
- Clarify scope boundaries
- Keep implementation details out unless they are true constraints
- Write explicit acceptance criteria
- Record uncertainties under `Assumptions` and `Open Questions`

## Rules
- Do not invent missing business facts.
- Use canonical terminology consistently.
- Prefer concise, precise statements over broad prose.
- Separate confirmed facts from assumptions.
- Keep the document stable enough for later planning and implementation.

## Required Sections
- Background
- Goal
- Scope
- Out of Scope
- Actors
- Core Workflows
- Business Rules
- Non-functional Requirements
- Acceptance Criteria
- Assumptions
- Open Questions

## Output Standard
A good output should:
- define what is being built
- define what is not being built
- define how success is judged
- expose uncertainties instead of hiding them
```

---

## 2）.opencode/skills/architect-auditor/SKILL.md

```md
# Architect Auditor

## Purpose
Translate the specification into a technical plan and audit consistency across design artifacts.

## When to Use
Use this skill when `spec.md` exists and the next step is architecture, design breakdown, or consistency review.

## Primary Responsibilities
- Create or refine `plan.md`
- Create `data-model.md` where needed
- Propose contracts and technical decomposition
- Identify contradictions, gaps, and risky assumptions
- Preserve traceability from requirements to architecture

## Rules
- Do not alter product intent silently.
- If the spec is ambiguous, record technical assumptions explicitly.
- Prefer conflict reporting over hidden interpretation.
- Ensure architecture modules map back to requirements.
- Ensure technical design is implementable and reviewable.

## Audit Focus
- requirement coverage
- terminology stability
- module boundary clarity
- data model correctness
- failure handling completeness
- validation strategy quality

## Output Standard
A good output should:
- explain how the system will satisfy the spec
- expose tradeoffs
- identify unresolved design risks
- be structured enough to derive tasks directly
```

---

## 3）.opencode/skills/task-executor/SKILL.md

```md
# Task Executor

## Purpose
Execute exactly one implementation task from a spec-driven task list.

## When to Use
Use this skill when `tasks.md` already exists and implementation work should begin.

## Primary Responsibilities
- Read spec and plan before touching code
- Implement only the requested task
- Validate the change with focused tests/checks
- Report blockers and contradictions explicitly
- Keep changes small and reviewable

## Rules
- Do not implement work outside the selected task.
- Do not infer new product behavior.
- Do not modify spec/plan silently through code.
- If the selected task depends on unfinished work, report it clearly.
- Always state what changed and how it was validated.

## Execution Checklist
1. Read `spec.md`
2. Read `plan.md`
3. Read `tasks.md`
4. Find the selected task
5. Implement only that task
6. Validate
7. Summarize results

## Output Standard
A good output should:
- reference the exact task
- keep scope tight
- include validation evidence
- clearly state blockers or residual risk
```

---

# 九、建议的专家包初始化任务清单

```md
# Expert Pack Bootstrap Checklist

- [ ] 创建 `README.md`
- [ ] 创建 `package-spec.md`
- [ ] 创建 `role-definition.md`
- [ ] 创建 `io-contract.md`
- [ ] 创建 `quality-gate.md`
- [ ] 创建 `collaboration-protocol.md`
- [ ] 创建 `package-lifecycle.md`
- [ ] 创建 `AGENTS.md`
- [ ] 创建 `examples/happy-path.md`
- [ ] 创建 `examples/edge-cases.md`
- [ ] 创建 `examples/failure-cases.md`
- [ ] 创建 `.opencode/commands/` 下的 5 个命令文件
- [ ] 创建 `.opencode/skills/` 下的 3 个 skill 目录和 `SKILL.md`
- [ ] 创建 `specs/001-bootstrap/spec.md`
- [ ] 创建 `specs/001-bootstrap/plan.md`
- [ ] 创建 `specs/001-bootstrap/tasks.md`
- [ ] 如需要，创建 `specs/001-bootstrap/data-model.md`
- [ ] 如需要，创建 `specs/001-bootstrap/research.md`
- [ ] 如需要，创建 `specs/001-bootstrap/contracts/`
```

---

# 十、建议的 OpenCode 使用顺序

```bash
/spec-start 001-bootstrap
/spec-plan 001-bootstrap
/spec-tasks 001-bootstrap
/spec-implement 001-bootstrap T-001
/spec-implement 001-bootstrap T-002
/spec-audit 001-bootstrap
```

如果是治理层初始化，不是实现具体 feature，可以先让 OpenCode 按根目录模板创建治理骨架，再进入 `specs/001-bootstrap/` 处理内部实现。

---

# 十一、直接交给 OpenCode 的落地说明

下面这段可以直接发给 OpenCode：

```md
请根据这份《OpenCode 专家包完整模板总包》在当前仓库中完成初始化落地。

要求：
1. 在仓库根目录创建以下治理文档：
   - README.md
   - package-spec.md
   - role-definition.md
   - io-contract.md
   - quality-gate.md
   - collaboration-protocol.md
   - package-lifecycle.md
   - AGENTS.md

2. 创建 `examples/` 目录，并初始化：
   - happy-path.md
   - edge-cases.md
   - failure-cases.md

3. 创建 `.opencode/commands/` 下的 5 个命令文件：
   - spec-start.md
   - spec-plan.md
   - spec-tasks.md
   - spec-implement.md
   - spec-audit.md

4. 创建 `.opencode/skills/` 下的 3 个 skill 目录和 `SKILL.md`：
   - spec-writer/SKILL.md
   - architect-auditor/SKILL.md
   - task-executor/SKILL.md

5. 创建 `specs/001-bootstrap/` 目录，并初始化：
   - spec.md
   - plan.md
   - tasks.md
   - data-model.md（可为空模板）
   - research.md（可为空模板）
   - contracts/（目录即可）

6. 保持模板章节结构完整，不要擅自删减核心章节。

7. 如果仓库中已存在同名文件，先比较差异，再报告是覆盖、合并还是保留。

8. 初始化完成后，请输出：
   - 目录树
   - 创建/更新的文件列表
   - 每个文件的一句话用途说明
   - 推荐的下一步动作

附加要求：
- 不要改写模板语义
- 路径必须正确
- 不要直接开始实现业务功能
- 当前阶段只完成专家包骨架初始化
```

---

# 十二、推荐落地顺序

最稳的方式不是一次全铺开，而是：

1. 先初始化专家包治理骨架  
2. 再初始化 `001-bootstrap` feature  
3. 让 OpenCode 跑一遍：
   - `/spec-start 001-bootstrap`
   - `/spec-plan 001-bootstrap`
   - `/spec-tasks 001-bootstrap`
4. 挑一个最小任务做 `/spec-implement`
5. 最后跑 `/spec-audit`

这样你就能验证三件事：

- 治理层是否约束住了 OpenCode
- spec-driven 流程是否可用
- commands 和 skills 是否真正能协同工作

---

# 十三、建议后续增强项

等这套骨架跑通后，再补下面这些：

- glossary.md
- object-model.md
- state-machine.md
- traceability-matrix.md
- PR template
- CI lint / consistency check
- command output schema enforcement
- package release checklist automation

这些不是第一天必须有，但后面会让一致性和可维护性再上一个台阶。

---

# 十四、最关键的使用原则

1. 先定义专家包，再让专家包开发自己  
2. 先写 spec，再写 plan，再拆 tasks，再实施  
3. 实施时一次只做一个 task  
4. 发现冲突先上报，不要让 OpenCode自行脑补  
5. 治理文档和 feature 文档都要作为 source of truth  
6. examples 要长期维护，它们是优化专家包质量的重要依据

---

# 十五、你现在应该怎么用这份文档

最直接的方式就是：

- 把这份文档放进你的项目里
- 把“直接交给 OpenCode 的落地说明”那一段发给 OpenCode
- 先只做初始化，不要急着让它写业务逻辑
- 初始化完成后，再让它从 `001-bootstrap` 跑第一轮 spec-driven 闭环

这样你得到的不是一堆散 prompt，而是一套真正可执行、可治理、可迭代的 OpenCode 专家包底座。
