# OpenCode Spec-Driven 模板包

这是一套可以直接交给 OpenCode 落地的模板包，目标是：

- 让需求文档、实现计划、任务拆分、实现执行、审计检查形成固定流水线
- 让 OpenCode 始终以 spec 为准，不自由发挥
- 通过 `AGENTS.md + commands + skills` 约束输出和执行边界

---

# 一、推荐目录结构

```text
repo/
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
└─ specs/
   └─ 001-example-feature/
      ├─ spec.md
      ├─ plan.md
      ├─ tasks.md
      ├─ data-model.md
      ├─ research.md
      └─ contracts/
```

---

# 二、AGENTS.md

将下面内容保存为仓库根目录 `AGENTS.md`

```md
# AGENTS.md

## Development Mode
This repository is spec-driven.
All feature work must follow the artifacts under `specs/<feature>/`.

## Source of Truth
Priority order:
1. `specs/<feature>/spec.md`
2. `specs/<feature>/plan.md`
3. `specs/<feature>/data-model.md`
4. `specs/<feature>/contracts/*`
5. `specs/<feature>/tasks.md`

## Global Rules
- Do not implement a feature unless `spec.md` and `plan.md` exist.
- Do not invent product requirements beyond the spec.
- If information is missing, record it under `Assumptions` or `Open Questions`.
- Prefer explicit conflict reports over silent interpretation.
- Use canonical terms from the spec exactly.
- Every code change must map to at least one task in `tasks.md`.
- Every completed task must be validated against acceptance criteria in `spec.md` or tests derived from the feature documents.

## Consistency Rules
- Reject implementation if contracts, data model, and code conflict.
- Do not rename business objects casually.
- If the implementation suggests changing the spec, update the spec artifacts first, then implement.
- Preserve traceability from requirement -> plan -> task -> code -> validation.

## Execution Discipline
- Work in small, reviewable increments.
- Implement one task at a time unless tasks are explicitly marked parallel-safe.
- Always summarize:
  - what was changed
  - which task was implemented
  - what validation was run
  - any remaining risks or assumptions
```

---

# 三、.opencode/commands 模板

将下面文件分别保存到 `.opencode/commands/`

---

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

# 四、SKILL 模板

将下面文件分别保存到 `.opencode/skills/.../SKILL.md`

---

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

# 五、建议的 spec 文档模板

保存为每个 feature 下的 `spec.md` 初始模板：

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

# 六、建议的 plan 文档模板

保存为每个 feature 下的 `plan.md` 初始模板：

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

# 七、建议的 tasks 文档模板

保存为每个 feature 下的 `tasks.md` 初始模板：

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

# 八、建议 OpenCode 的实际使用顺序

```bash
/spec-start 001-user-auth
/spec-plan 001-user-auth
/spec-tasks 001-user-auth
/spec-implement 001-user-auth T-001
/spec-implement 001-user-auth T-002
/spec-audit 001-user-auth
```

---

# 九、你交给 OpenCode 的落地说明

你可以把下面这段直接发给 OpenCode：

```md
请根据这份模板包在当前仓库中完成初始化落地：

1. 创建 `AGENTS.md`
2. 创建 `.opencode/commands/` 下的 5 个命令文件
3. 创建 `.opencode/skills/` 下的 3 个 skill 目录和 `SKILL.md`
4. 创建 `specs/` 目录，并初始化一个 `001-example-feature/`
5. 确保文件内容与模板包一致
6. 完成后给出目录树和每个文件的创建结果摘要

要求：
- 不要改写模板语义
- 路径必须正确
- 如果仓库里已存在同名文件，先比较差异，再报告是否覆盖
```

---

# 十、最小原则

这套模板能稳定工作的前提是：

1. spec 永远是先于实现存在的  
2. plan 永远从 spec 派生  
3. tasks 永远从 plan 派生  
4. implement 永远只做单任务  
5. audit 永远独立存在  

不要跳过中间层直接让 OpenCode“按需求开发”，否则很快又会回到上下文漂移和一致性失控的问题。

---

# 十一、推荐下一步

初始化完这套模板后，先挑一个最小 feature 跑通一次全流程，不要一上来就拿大而复杂的项目测试。先证明：

- spec 能被稳定写出
- plan 能被稳定派生
- tasks 能被合理拆解
- 单任务实现不会越界
- audit 能发现遗漏和偏差

跑通一个 feature 后，再加你自己的扩展：
- glossary
- object model
- state machine
- PR 模板
- CI 校验
- task traceability matrix
