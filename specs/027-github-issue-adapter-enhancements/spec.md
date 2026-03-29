# Spec: 027-github-issue-adapter-enhancements

## Metadata

| Field | Value |
|-------|-------|
| Feature ID | 027-github-issue-adapter-enhancements |
| Feature Name | GitHub Issue Adapter Workflow Enhancements |
| Status | Draft |
| Created | 2026-03-29 |
| Source | `specs/026-github-issue-adapter-workflow-test/workflow-test-report.md` |
| Milestone | M027 |

## Overview

Based on the real-world workflow test of GitHub Issue Adapter (Feature 026), this feature addresses 5 discovered issues and implements 2 suggested enhancements to improve the adapter's usability, automation, and error handling.

**Excluded**: Webhook integration (Suggestion 3) is deferred to backlog per user instruction.

## Motivation

The workflow test (Feature 026) validated that GitHub Issue Adapter core functionality works correctly:
- Issue creation → Dispatch generation → Execution → Result comment → Issue close

However, several friction points were identified that impact user experience and automation potential:
1. Labels must be pre-created manually before Issue creation
2. `project_id` parsing returns "unknown/unknown" instead of actual owner/repo
3. No explicit documentation for GITHUB_TOKEN requirements
4. Git operations (push/commit) lack retry mechanism (API calls already have retry)
5. Result comment requires manual formatting

## Scope

### In Scope

| ID | Issue/Suggestion | Severity | Description |
|----|------------------|----------|-------------|
| P1 | Label auto-creation | Medium | Provide `setup-labels` command to create standard labels |
| P2 | project_id parsing | Low | Extract owner/repo from `repository_url` field |
| P3 | GITHUB_TOKEN docs | Low | Document token requirements in README and usage guide |
| P4 | Git retry mechanism | Medium | Add retry wrapper for git operations (push, commit) |
| P5 | Result Comment template | Medium | Add `generateResultComment()` method for auto-formatting |
| S1 | Automation script | Medium | Create `scripts/process-issue.js` for end-to-end flow |
| S2 | Issue template | Low | Create `.github/ISSUE_TEMPLATE/task.md` |

### Out of Scope

| ID | Item | Reason |
|----|------|--------|
| S3 | Webhook integration | Deferred to backlog per user instruction |
| API retry | Already implemented | github-client.js has `_requestWithRetry()` |

## Requirements

### R1: Label Setup Command (P1)

**Problem**: Creating Issues fails if labels don't exist. Manual label creation is tedious.

**Solution**: Add `setup-labels` CLI command.

**Acceptance Criteria**:
- [ ] Command: `node adapters/github-issue/setup-labels.js --owner X --repo Y`
- [ ] Creates 20+ standard labels from predefined list
- [ ] Handles existing labels gracefully (skip or update)
- [ ] Reports created/skipped counts
- [ ] Supports custom label config file

**Label Categories**:
```
role: architect, developer, tester, reviewer, docs, security
task: T001-T999 (dynamic)
milestone: M001-M999 (dynamic)
phase: phase-1, phase-2, phase-3, phase-4
priority: high, medium, low
status: pending, in-progress, completed, blocked
escalation: needs-decision, needs-attention
```

### R2: project_id Parsing Enhancement (P2)

**Problem**: `dispatch.project_id` returns "unknown/unknown" because Issue has no `project:` label.

**Solution**: Extract owner/repo from Issue's `repository_url` field.

**Acceptance Criteria**:
- [ ] `issue-parser.js` extracts owner/repo from `repository_url`
- [ ] `project_id` format: `{owner}/{repo}`
- [ ] Fallback to "unknown/unknown" if `repository_url` missing
- [ ] Unit tests cover edge cases

**Implementation**:
```javascript
// From Issue object
const repositoryUrl = issue.repository_url; // "https://api.github.com/repos/owner/repo"
const match = repositoryUrl.match(/repos\/([^/]+)\/([^/]+)$/);
const projectId = match ? `${match[1]}/${match[2]}` : 'unknown/unknown';
```

### R3: GITHUB_TOKEN Documentation (P3)

**Problem**: Runtime warning "GitHubClient: No token provided" but no documentation on how to set it.

**Solution**: Add explicit documentation in README and usage guide.

**Acceptance Criteria**:
- [ ] README.md has "Authentication Setup" section
- [ ] Usage guide explains token scopes required
- [ ] Error message suggests checking documentation
- [ ] Example commands show token setup

**Documentation Content**:
- How to create GitHub Personal Access Token
- Required scopes: `repo` (private) or `public_repo` (public)
- Environment variable: `GITHUB_TOKEN`
- GitHub App alternative (production)

### R4: Git Operations Retry (P4)

**Problem**: Git push operations may fail due to network issues. github-client.js has retry, but git operations don't.

**Solution**: Add retry wrapper for git CLI operations.

**Acceptance Criteria**:
- [ ] `retry-handler.js` supports git operations
- [ ] Retry `git push`, `git commit` with exponential backoff
- [ ] Max retry: 3 (configurable)
- [ ] Network errors retry, auth errors don't retry
- [ ] Logs retry attempts

**Implementation Note**: 
- API retry already implemented in `github-client.js._requestWithRetry()`
- This enhancement adds retry for `git` CLI commands used in workflow

### R5: Result Comment Auto-Generation (P5)

**Problem**: Result comment must be manually formatted, increasing operator burden.

**Solution**: Add `generateResultComment(executionResult)` method.

**Acceptance Criteria**:
- [ ] Method returns formatted markdown string
- [ ] Includes: status, role, command, summary, artifacts, recommendation
- [ ] Uses CommentTemplates.result() internally
- [ ] Handles SUCCESS, FAILED_RETRYABLE, FAILED_ESCALATE states
- [ ] Unit tests verify output format

**Comment Template**:
```markdown
## Execution Result

| Field | Value |
|-------|-------|
| Status | {status} |
| Role | {role} |
| Command | {command} |
| Commit | {commit_sha} |

### Summary
{summary}

### Artifacts
- {artifact_1}
- {artifact_2}

### Recommendation
{recommendation}
```

### R6: Automation Script (S1)

**Problem**: Current workflow requires manual step-by-step execution.

**Solution**: Create `scripts/process-issue.js` for automated flow.

**Acceptance Criteria**:
- [ ] Script fetches Issue via GitHub API
- [ ] Generates Dispatch Payload
- [ ] Routes to execution (calls developer skill)
- [ ] Posts result comment
- [ ] Closes Issue on SUCCESS
- [ ] CLI: `node scripts/process-issue.js --owner X --repo Y --issue N`

**Flow**:
```
1. Fetch Issue (gh API /repos/{owner}/{repo}/issues/{number})
2. Parse Issue → Dispatch Payload
3. Validate Dispatch
4. Execute Task (delegate to developer skill)
5. Generate Result Comment
6. Post Comment to Issue
7. Close Issue (if SUCCESS)
```

### R7: Issue Template (S2)

**Problem**: Users must manually format Issues correctly.

**Solution**: Create `.github/ISSUE_TEMPLATE/task.md`.

**Acceptance Criteria**:
- [ ] Template file at `.github/ISSUE_TEMPLATE/task.md`
- [ ] YAML frontmatter with default labels
- [ ] Sections: Context, Goal, Constraints, Inputs, Expected Outputs, Acceptance Criteria
- [ ] Instructions in comments
- [ ] Works with GitHub Issue Template UI

**Template Structure**:
```markdown
---
name: Task
about: Create a task for expert pack execution
title: '[T-XXX]: '
labels: 'role:developer,task:TXXX,milestone:MXXX'
assignees: ''
---

## Context
<!-- Describe the task context and background -->

## Goal
<!-- What needs to be achieved (required) -->

## Constraints
<!-- Any constraints or limitations -->

## Inputs
<!-- Required inputs (artifacts, files, etc.) -->

## Expected Outputs
<!-- Expected deliverables -->

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Feature 021 | Predecessor | ✅ Complete |
| Feature 026 | Predecessor | ✅ Complete |
| github-client.js | Code | ✅ Exists |
| issue-parser.js | Code | ✅ Exists |
| comment-templates.js | Code | ✅ Exists |

## Constraints

- Must not break existing adapter functionality
- Must maintain io-contract.md compliance
- Must pass existing unit tests
- Webhook integration excluded per user instruction

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking existing tests | Medium | Run all existing tests before merge |
| Git retry interfering with auth | Low | Don't retry auth errors |
| Template mismatch with parser | Low | Validate template output against parser |

## Success Metrics

| Metric | Target |
|--------|--------|
| Automation steps reduced | From 7 manual to 1 command |
| Label creation time | From 2 min to 30 sec |
| Result comment formatting | From manual to automatic |
| Issue creation consistency | 100% via template |

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | 1 day | P1, P2, P5 (adapter enhancements) |
| Phase 2 | 1 day | P3, P4, S2 (docs + retry + template) |
| Phase 3 | 1 day | S1 (automation script) |
| Phase 4 | 0.5 day | Testing and validation |

**Total Estimate**: 3.5 days

## References

- `specs/026-github-issue-adapter-workflow-test/workflow-test-report.md` - Test report
- `adapters/github-issue/README.md` - Adapter documentation
- `adapters/github-issue/index.js` - Main adapter
- `adapters/github-issue/github-client.js` - API client with retry
- `adapters/github-issue/issue-parser.js` - Issue parser
- `adapters/github-issue/comment-templates.js` - Comment templates
- `io-contract.md §1` - Dispatch Payload schema