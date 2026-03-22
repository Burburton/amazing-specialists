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
