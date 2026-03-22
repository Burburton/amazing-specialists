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
