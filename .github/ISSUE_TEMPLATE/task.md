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

### Step 1: Commit Changes (Required)
```bash
git add <files>
git commit -m "feat(T-XXX): Brief description

- Detail 1
- Detail 2

Closes #XX"
```

### Step 2: Push to Remote (Required)
```bash
git push origin <branch>
```

**Verify:**
- [ ] All changes committed
- [ ] Code pushed to remote
- [ ] Commit visible in GitHub

### Step 3: Post Completion Comment
Post a comment on this Issue with:
- Summary of changes
- Files changed
- Verification results (build output)
- Acceptance criteria check

### Step 4: Reviewer Assignment (if required)
<!-- For high-risk tasks, add label: role:reviewer -->
- `risk:critical` → Must have reviewer sign-off
- `risk:high` → Recommended reviewer sign-off

### Step 5: Close Issue (After Code Pushed)
**Close ONLY after:**
- ✅ Code committed and pushed
- ✅ Build passes
- ✅ Completion comment posted
- ✅ Reviewer sign-off (if required)

```bash
gh issue close <number> --repo <owner/repo>
```

### PR Creation (alternative)
<!-- Create PR instead of direct commit -->
- Branch: `feat/T-XXX-brief-description`
- Title: `feat(T-XXX): Brief description`
- Merge PR to close Issue automatically
