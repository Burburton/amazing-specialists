# Tasks: Issue Lifecycle Automation

## Feature
042-issue-lifecycle-automation

## Milestone
M042

---

## Task List

| Task ID | Task Name | Role | Status | Dependencies |
|---------|-----------|------|--------|--------------|
| T-042-001 | GitHubClient.createIssue | developer | completed | - |
| T-042-002 | GitHubClient.searchIssues | developer | completed | - |
| T-042-003 | GitHubClient.updateIssue/closeIssue | developer | completed | - |
| T-042-004 | IssueContext class | developer | completed | - |
| T-042-005 | CLI: create command | developer | completed | T-042-001, T-042-004 |
| T-042-006 | CLI: close command | developer | completed | T-042-002, T-042-003, T-042-004 |
| T-042-007 | CLI: status command | developer | completed | T-042-002, T-042-004 |
| T-042-008 | CLI: list command | developer | completed | T-042-002 |
| T-042-009 | Update Issue template | developer | completed | - |
| T-042-010 | Update README documentation | docs | completed | T-042-005~T-042-008 |
| T-042-011 | Unit tests | tester | completed | T-042-001~T-042-004 |
| T-042-012 | Integration test | tester | completed | T-042-005~T-042-008 |

---

## Detailed Tasks

### T-042-001: GitHubClient.createIssue

**Phase**: M1 - GitHubClient Enhancement
**Status**: pending
**Priority**: high
**Dependencies**: -

**Goal**:
Add createIssue method to GitHubClient for creating new GitHub Issues.

**Scope**:
- Add `createIssue(owner, repo, options)` method
- Support: title, body, labels, milestone, assignees
- Return created Issue object with number

**Acceptance Criteria**:
- [ ] Method creates Issue via GitHub API
- [ ] Returns Issue object with number property
- [ ] Handles API errors (rate limit, permission)
- [ ] Unit test passes

**Files**:
- `adapters/github-issue/github-client.js`

**Estimated Effort**: 30 minutes

---

### T-042-002: GitHubClient.searchIssues

**Phase**: M1 - GitHubClient Enhancement
**Status**: pending
**Priority**: high
**Dependencies**: -

**Goal**:
Add searchIssues method to GitHubClient for filtering Issues by labels and state.

**Scope**:
- Add `searchIssues(owner, repo, options)` method
- Support: labels[], state, milestone, per_page, page
- Return array of Issue objects

**Acceptance Criteria**:
- [ ] Method searches Issues via GitHub API
- [ ] Supports label filtering
- [ ] Supports state filtering (open/closed/all)
- [ ] Unit test passes

**Files**:
- `adapters/github-issue/github-client.js`

**Estimated Effort**: 30 minutes

---

### T-042-003: GitHubClient.updateIssue/closeIssue

**Phase**: M1 - GitHubClient Enhancement
**Status**: pending
**Priority**: high
**Dependencies**: -

**Goal**:
Add updateIssue, closeIssue, reopenIssue methods to GitHubClient.

**Scope**:
- Add `updateIssue(owner, repo, issueNumber, options)` method
- Add `closeIssue(owner, repo, issueNumber)` method
- Add `reopenIssue(owner, repo, issueNumber)` method
- All return updated Issue object

**Acceptance Criteria**:
- [ ] closeIssue sets state to 'closed'
- [ ] reopenIssue sets state to 'open'
- [ ] updateIssue can modify any field
- [ ] Unit tests pass

**Files**:
- `adapters/github-issue/github-client.js`

**Estimated Effort**: 30 minutes

---

### T-042-004: IssueContext class

**Phase**: M1 - GitHubClient Enhancement
**Status**: pending
**Priority**: high
**Dependencies**: -

**Goal**:
Create IssueContext class for managing `.issue-context.json` state file.

**Scope**:
- Create `adapters/github-issue/issue-context.js`
- Implement: load, save, recordIssue, getIssueByTaskId, updateIssueStatus, listIssues
- Handle file not existing (create new)
- Handle corrupted file (recreate)

**Acceptance Criteria**:
- [ ] Can read/write .issue-context.json
- [ ] Maps Task ID to Issue Number
- [ ] Tracks Issue status
- [ ] Handles missing/corrupted file

**Files**:
- `adapters/github-issue/issue-context.js`

**Estimated Effort**: 45 minutes

---

### T-042-005: CLI: create command

**Phase**: M2 - CLI Commands
**Status**: pending
**Priority**: high
**Dependencies**: T-042-001, T-042-004

**Goal**:
Add `create` subcommand to process-issue.js for creating Issues.

**Scope**:
- Add `handleCreateCommand(argv)` method
- Support CLI args: --owner, --repo, --task, --title, --role, --risk, --milestone, --body, --bodyFile
- Check for existing Issue (idempotency)
- Record to IssueContext

**Acceptance Criteria**:
- [ ] Creates Issue with correct labels
- [ ] Returns Issue number
- [ ] Records to .issue-context.json
- [ ] Idempotent (duplicate task returns existing Issue)

**Files**:
- `scripts/process-issue.js`

**Estimated Effort**: 45 minutes

---

### T-042-006: CLI: close command

**Phase**: M2 - CLI Commands
**Status**: pending
**Priority**: high
**Dependencies**: T-042-002, T-042-003, T-042-004

**Goal**:
Add `close` subcommand to process-issue.js for closing Issues by Task ID.

**Scope**:
- Add `handleCloseCommand(argv)` method
- Support CLI args: --owner, --repo, --task, --comment
- Find Issue by task label
- Post comment (if provided)
- Close Issue
- Update IssueContext

**Acceptance Criteria**:
- [ ] Closes Issue by Task ID
- [ ] Posts comment if provided
- [ ] Idempotent (already closed returns success)
- [ ] Updates .issue-context.json

**Files**:
- `scripts/process-issue.js`

**Estimated Effort**: 30 minutes

---

### T-042-007: CLI: status command

**Phase**: M2 - CLI Commands
**Status**: pending
**Priority**: medium
**Dependencies**: T-042-002, T-042-004

**Goal**:
Add `status` subcommand to process-issue.js for querying Issue status.

**Scope**:
- Add `handleStatusCommand(argv)` method
- Support CLI args: --owner, --repo, --task
- Check IssueContext first, then API
- Display: number, url, status, created_at, closed_at

**Acceptance Criteria**:
- [ ] Displays Issue status
- [ ] Works for both open and closed Issues
- [ ] Handles Task ID not found

**Files**:
- `scripts/process-issue.js`

**Estimated Effort**: 20 minutes

---

### T-042-008: CLI: list command

**Phase**: M2 - CLI Commands
**Status**: pending
**Priority**: medium
**Dependencies**: T-042-002

**Goal**:
Add `list` subcommand to process-issue.js for listing Issues.

**Scope**:
- Add `handleListCommand(argv)` method
- Support CLI args: --owner, --repo, --label, --state
- Display: number, state, task ID, title

**Acceptance Criteria**:
- [ ] Lists Issues with filters
- [ ] Supports label filtering
- [ ] Supports state filtering

**Files**:
- `scripts/process-issue.js`

**Estimated Effort**: 20 minutes

---

### T-042-009: Update Issue template

**Phase**: M3 - Documentation
**Status**: pending
**Priority**: medium
**Dependencies**: -

**Goal**:
Update `.github/ISSUE_TEMPLATE/task.md` to emphasize Task ID-based workflow.

**Scope**:
- Update Post-completion section
- Add Task ID-based close instructions
- Keep Issue number option as fallback
- Add example commands

**Acceptance Criteria**:
- [ ] Template shows Task ID close method
- [ ] Maintains backward compatibility
- [ ] Clear examples provided

**Files**:
- `.github/ISSUE_TEMPLATE/task.md`

**Estimated Effort**: 15 minutes

---

### T-042-010: Update README documentation

**Phase**: M3 - Documentation
**Status**: pending
**Priority**: medium
**Dependencies**: T-042-005~T-042-008

**Goal**:
Update `adapters/github-issue/README.md` with new commands and usage.

**Scope**:
- Add CLI commands section
- Add examples for create, close, status, list
- Document .issue-context.json
- Update troubleshooting section

**Acceptance Criteria**:
- [ ] All commands documented
- [ ] Usage examples provided
- [ ] Error handling documented

**Files**:
- `adapters/github-issue/README.md`

**Estimated Effort**: 30 minutes

---

### T-042-011: Unit tests

**Phase**: M1/M2 - Testing
**Status**: pending
**Priority**: high
**Dependencies**: T-042-001~T-042-004

**Goal**:
Write unit tests for GitHubClient and IssueContext.

**Scope**:
- Test createIssue, searchIssues, closeIssue
- Test IssueContext CRUD operations
- Mock GitHub API responses

**Acceptance Criteria**:
- [ ] All GitHubClient methods tested
- [ ] IssueContext methods tested
- [ ] Tests pass

**Files**:
- `tests/unit/github-client.test.js`
- `tests/unit/issue-context.test.js`

**Estimated Effort**: 45 minutes

---

### T-042-012: Integration test

**Phase**: M2 - Testing
**Status**: pending
**Priority**: medium
**Dependencies**: T-042-005~T-042-008

**Goal**:
Write integration tests for CLI commands.

**Scope**:
- Test create → status → close flow
- Test idempotency
- Test error cases

**Acceptance Criteria**:
- [ ] Full workflow tested
- [ ] Idempotency verified
- [ ] Error cases handled

**Files**:
- `tests/integration/process-issue.test.js`

**Estimated Effort**: 30 minutes

---

## Parallel Execution

**Phase 1 Parallel Group**:
- T-042-001 (createIssue) + T-042-002 (searchIssues) + T-042-003 (closeIssue) + T-042-004 (IssueContext)

**Phase 2 Parallel Group**:
- T-042-005 (create) + T-042-008 (list)

**Phase 3 Parallel Group**:
- T-042-009 (template) + T-042-010 (README)

---

## Notes

- Each task should have corresponding GitHub Issue created via new `create` command
- Use Task ID `T-042-XXX` for traceability
- Commit with `feat(T-042-XXX): ...` format