---
description: Generate implementation plan from a feature spec
agent: general
flags:
  --enhanced: Enable M4 enhancement kit for advanced planning
---

Read `specs/$1/spec.md` and generate or update technical design artifacts for feature `$1`.

## Standard Mode (Default)

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

## Enhanced Mode (--enhanced)

When `--enhanced` flag is provided or `spec.md` has `enhanced: true`, additionally apply M4 skills:

### Migration Planning (architect)
If the feature involves data/system migration:
- Generate detailed migration strategy in plan
- Define rollback triggers and procedures
- Add validation checkpoints between phases

### Dependency Minimization (developer)
Analyze dependency impact:
- Identify new dependencies required
- Suggest lightweight alternatives
- Flag potential version conflicts
- Add dependency notes to plan

### Integration Test Planning (tester)
For integration-heavy features:
- Identify integration points
- Suggest integration test scenarios
- Add integration test tasks to plan

Output:
- files created or updated
- conflicts found
- next recommended command