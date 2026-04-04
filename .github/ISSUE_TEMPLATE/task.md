---
name: Task
about: Create a task for expert pack execution
title: '[T-XXX]: '
labels: 'role:developer'
assignees: ''
---

## Task ID
<!-- IMPORTANT: Fill this Task ID for automated workflow -->
**Task ID**: `T-XXX`

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

### Step 1: Create This Issue (if not created)
<!-- Use CLI to create Issue with Task ID tracking -->
```bash
node scripts/process-issue.js create \
  --owner <owner> --repo <repo> \
  --task T-XXX \
  --title "[T-XXX]: Task title" \
  --role developer \
  --risk low
```

This records the Issue number to `.issue-context.json` for reliable tracking.

---

### Step 2: Commit Changes (Required)
<!-- DO NOT use "Closes #XX" until you know the correct Issue number -->

**Recommended: Commit without auto-close**
```bash
git add <files>
git commit -m "feat(T-XXX): Brief description

- Detail 1
- Detail 2

Implements task:T-XXX"
```

**Alternative: If you verified the Issue number**
```bash
git commit -m "feat(T-XXX): Brief description

Closes #NN"
```
Replace `#NN` with the actual Issue number from `.issue-context.json` or the Issue URL.

---

### Step 3: Push to Remote (Required)
```bash
git push origin <branch>
```

**Verify:**
- [ ] All changes committed
- [ ] Code pushed to remote
- [ ] Commit visible in GitHub

---

### Step 4: Post Completion Comment
Post a comment on this Issue with:
- Summary of changes
- Files changed
- Verification results (build output)
- Acceptance criteria check

---

### Step 5: Reviewer Assignment (if required)
<!-- For high-risk tasks, add label: role:reviewer -->
- `risk:critical` → Must have reviewer sign-off
- `risk:high` → Recommended reviewer sign-off

---

### Step 6: Close Issue (After Code Pushed)
<!-- Use Task ID-based close for reliability -->

**Recommended: Close by Task ID (prevents wrong Issue)**
```bash
node scripts/process-issue.js close \
  --owner <owner> --repo <repo> \
  --task T-XXX \
  --comment "✅ Implementation complete

### Summary
- Brief description of changes

### Files Changed
- file1.ts - Description
- file2.ts - Description

### Verification
- Build: SUCCESS
- Tests: PASSED

**Result: SUCCESS**"
```

**Alternative: Close by Issue number**
```bash
gh issue close <number> --repo <owner/repo>
```

---

### Check Status
```bash
# Check Issue status by Task ID
node scripts/process-issue.js status --task T-XXX

# List Issues with filters
node scripts/process-issue.js list --owner <owner> --repo <repo> --label role:developer --state open
```

---

### PR Creation (alternative)
<!-- Create PR instead of direct commit -->
- Branch: `feat/T-XXX-brief-description`
- Title: `feat(T-XXX): Brief description`
- Merge PR to close Issue automatically (use verified Issue number)

---

## Why Task ID-Based Workflow?

**Problem**: Using `Closes #XX` in commit message before knowing the Issue number leads to closing wrong Issues.

**Solution**: Use Task ID (`T-XXX`) as primary identifier:
1. Create Issue with CLI → records Issue number to `.issue-context.json`
2. Close Issue by Task ID → CLI finds correct Issue number from GitHub labels

**Benefits**:
- Idempotent operations (repeated create/close won't fail)
- No risk of closing wrong Issue
- Full traceability via `.issue-context.json`

---

## Troubleshooting

### Issue already exists for this Task ID
Run `close` command - it handles existing Issues gracefully.

### Multiple Issues with same Task ID
CLI warns and uses the first one. Review manually.

### Token required
Set `GITHUB_TOKEN` environment variable or use `--token` flag.