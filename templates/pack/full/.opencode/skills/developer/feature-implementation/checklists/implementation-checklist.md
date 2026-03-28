# Implementation Checklist

## Pre-Implementation

### Design Review
- [ ] Read design-note completely
- [ ] Understand feature_goal
- [ ] Review module-boundaries
- [ ] Identify all constraints
- [ ] Note any open-questions

### Scope Clarification
- [ ] Task goal is clear
- [ ] Acceptance criteria understood
- [ ] Out of scope items identified
- [ ] Dependencies identified

---

## During Implementation

### Code Quality
- [ ] Follow existing code patterns
- [ ] Use consistent naming conventions
- [ ] Write self-documenting code
- [ ] Add necessary comments

### Scope Control
- [ ] Only modify necessary files
- [ ] No unrelated refactoring
- [ ] No "while I'm here" changes
- [ ] Stay within task boundaries

### Design Alignment
- [ ] Implementation matches design-note
- [ ] Module boundaries respected
- [ ] Constraints satisfied
- [ ] Any deviations documented immediately

---

## Pre-Delivery

### Testing
- [ ] Unit tests written
- [ ] Tests pass locally
- [ ] Coverage acceptable
- [ ] Edge cases covered

### Self-Check
- [ ] Run code-change-selfcheck
- [ ] All blockers fixed
- [ ] Warnings documented
- [ ] Honest assessment made

### Documentation
- [ ] implementation-summary complete
- [ ] changed_files all listed
- [ ] dependencies justified
- [ ] deviations explained
- [ ] risks identified

---

## Output Requirements

### implementation-summary Must Have
- [ ] dispatch_id and task_id
- [ ] goal_alignment with achieved status
- [ ] implementation approach
- [ ] changed_files with descriptions
- [ ] self_check reference
- [ ] known_issues (even if empty)
- [ ] risks (even if empty)
- [ ] recommendation

### If Deviations Exist
- [ ] What deviated
- [ ] Why deviated
- [ ] Who approved (if applicable)

### If New Dependencies
- [ ] Package name and version
- [ ] Why needed
- [ ] Is it a dev dependency

---

## Handoff Readiness

- [ ] implementation-summary complete
- [ ] self-check-report exists
- [ ] All blockers resolved
- [ ] Code compiles/builds
- [ ] Tests pass
- [ ] Ready for tester/reviewer