---
name: Task
about: Create a task for expert pack execution
title: '[T-XXX]: '
labels: 'role:developer'
assignees: ''
---

## Context
<!-- Describe the task context and background -->

## Goal
<!-- What needs to be achieved (REQUIRED) -->

## Constraints
<!-- Any constraints or limitations -->

## Inputs
<!-- Required inputs (artifacts, files, dependencies) -->
<!-- Format: artifact_type: path - description -->

## Expected Outputs
<!-- Expected deliverables -->

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Pre-flight Check
<!-- Verify dependencies before starting (Recommended) -->
- [ ] Dependent tasks completed: <!-- List task IDs, e.g., T-001, T-002 -->
- [ ] Required files exist: <!-- List file paths -->
- [ ] Environment variables set: <!-- List required env vars, e.g., GITHUB_TOKEN -->

---

## Verification Commands
<!-- Commands to verify the implementation -->
```bash
# Build command
npm run build

# Type check (if applicable)
npx tsc --noEmit

# Tests (if applicable)
npm test
```

---

## Post-completion
<!-- Actions after successful completion -->

### Commit Message Format
```
feat(T-XXX): Brief description

- Detail 1
- Detail 2
```

### Reviewer Assignment
<!-- For high-risk tasks, assign a reviewer -->
<!-- Add label: role:reviewer after implementation complete -->

### PR Creation (if applicable)
<!-- Create PR with title: feat(T-XXX): Brief description -->
