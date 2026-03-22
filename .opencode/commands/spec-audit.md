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
