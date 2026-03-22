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
