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
