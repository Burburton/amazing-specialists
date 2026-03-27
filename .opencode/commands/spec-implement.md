---
description: Implement a single task from a spec task list
agent: general
flags:
  --enhanced: Enable M4 enhancement kit for enhanced implementation
---

Implement feature `$1`, task `$2`.

## Standard Mode (Default)

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

## Enhanced Mode (--enhanced)

When `--enhanced` flag is provided or `spec.md` has `enhanced: true`, additionally apply M4 skills:

### Refactor Safely (developer)
If the task involves:
- Refactoring existing code
- Restructuring modules
- Extracting common logic

Then apply `refactor-safely` skill:
- Verify test coverage before refactoring
- Make small, incremental changes
- Validate each step
- Preserve git history clarity

### Integration Test Design (tester)
If the task adds:
- New API endpoints
- New service integrations
- New database interactions

Then apply `integration-test-design` skill:
- Design integration test scenarios
- Identify mock vs real dependencies
- Document test data requirements

### Dependency Minimization (developer)
When adding new dependencies:
- Check for lighter alternatives
- Verify dependency is actively maintained
- Check license compatibility
- Document dependency rationale

Output:
- Implemented task
- Files changed
- Validation run
- M4 skills applied (if any)
- Remaining risks / blockers