---
description: Generate executable task list from plan and design docs
agent: general
flags:
  --enhanced: Enable M4 enhancement kit for enhanced task generation
---

Generate or update `specs/$1/tasks.md` for feature `$1`.

## Standard Mode (Default)

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

## Enhanced Mode (--enhanced)

When `--enhanced` flag is provided or `spec.md` has `enhanced: true`, additionally apply M4 skills:

### Migration Planning Tasks (architect)
If the feature involves migration:
- Add migration preparation tasks
- Add data migration tasks with rollback steps
- Add migration validation tasks

### Integration Test Tasks (tester)
For integration-heavy features:
- Add integration test design tasks
- Add integration test execution tasks
- Add end-to-end validation tasks

### Security Review Tasks (security)
For security-sensitive features:
- Add dependency risk review task
- Add secret handling review task (if handling credentials)

### Dependency Risk Tasks (security)
- Add dependency audit task
- Add CVE check task
- Add license compliance check task

Output:
- created/updated tasks
- dependency highlights
- next recommended command