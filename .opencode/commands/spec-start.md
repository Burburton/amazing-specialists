---
description: Create or refine a feature spec
agent: general
flags:
  --enhanced: Enable M4 enhancement kit for advanced spec creation
---

Use the spec-driven workflow for feature: $ARGUMENTS

## Standard Mode (Default)

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

## Enhanced Mode (--enhanced)

When `--enhanced` flag is provided, additionally apply M4 skills:

### Interface Contract Design (architect)
If the feature involves:
- New API endpoints
- Module interfaces
- Service boundaries

Then apply `interface-contract-design` skill:
- Draft interface signatures in `contracts/interface-contract.md`
- Define error response taxonomy
- Define version strategy

### Migration Planning (architect)
If the feature involves:
- Database schema changes
- System upgrades
- Data migration

Then apply `migration-planning` skill:
- Add `migration-planning.md` with strategy outline
- Identify rollback requirements
- Add migration-related Open Questions

### Enhanced Mode Metadata
Add to `spec.md` frontmatter:
```yaml
enhanced: true
```

This signals subsequent commands to use enhanced mode by default.

Output:
- created/updated files
- unresolved ambiguities
- next recommended command