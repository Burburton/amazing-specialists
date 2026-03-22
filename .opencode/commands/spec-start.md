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
