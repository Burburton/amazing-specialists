# Validation Checklist: issue-status-sync

> This checklist validates that Issue status synchronization is complete and compliant with business rules.

---

## Pre-Conditions Validation

### BR-004: Issue Context Check

- [ ] dispatch.issue_number exists
- [ ] dispatch.repository exists  
- [ ] GitHub API is accessible
- [ ] All conditions met → proceed, otherwise → skip skill with warning

### Upstream Artifact Availability

- [ ] acceptance-decision-record (RC-003) exists and readable
- [ ] execution result exists and readable
- [ ] verification-report (TC-001) exists (optional, but should check)

---

## Process Execution Validation

### Phase 1: Context Gathering

- [ ] Issue context validated (issue_number, repository, GitHub API)
- [ ] acceptance-decision-record consumed
- [ ] execution result consumed  
- [ ] verification-report consumed if available

### BR-001: Evidence Consumption

- [ ] All consumed artifacts documented in report
- [ ] Each artifact has source path and key fields extracted
- [ ] No speculation without artifact backing
- [ ] recommendation_reason references artifact decisions

### Phase 2: Report Generation

- [ ] DOC-003 issue-progress-report generated
- [ ] All required fields present
- [ ] roles_completed array populated
- [ ] artifacts_produced array populated
- [ ] recommendation field set correctly

### Recommendation Mapping (BR-005)

| Input Recommendation | Expected Output Recommendation | Issue State |
|---------------------|------------------------------|-------------|
| CONTINUE / SEND_TO_ACCEPTANCE | PENDING_ACCEPTANCE | OPEN |
| REWORK | NEEDS_REWORK | OPEN |
| ESCALATE | BLOCKED_ESCALATION | OPEN |

- [ ] recommendation mapped correctly per BR-005 table

### Phase 3: Comment Posting

- [ ] GitHub API called successfully
- [ ] Comment posted (status code 201)
- [ ] comment_url recorded
- [ ] Issue state checked before and after

---

## BR-002: Minimal Surface Validation

- [ ] Only posted comment, no other Issue modifications
- [ ] Did NOT modify Issue title
- [ ] Did NOT modify Issue labels
- [ ] Did NOT modify Issue assignees
- [ ] Did NOT call updateIssue with state changes

---

## BR-003: No Premature Closure Validation (CRITICAL)

- [ ] **Did NOT call closeIssue()**
- [ ] **Did NOT call updateIssue({ state: 'closed' })**
- [ ] issue_state_after is OPEN
- [ ] Issue remains OPEN after skill execution
- [ ] Comment mentions "等待验收" or appropriate pending state

### Forbidden Actions Check

- [ ] No Issue state modification code executed
- [ ] No premature closure attempt made
- [ ] Skill correctly defers closure to management

---

## Post-Conditions Validation

### Output Artifact Completeness

- [ ] issue-progress-report (DOC-003) generated
- [ ] issue_status_sync_result generated
- [ ] Both outputs have all required fields

### Issue State Verification

- [ ] Issue is OPEN (not CLOSED)
- [ ] Comment visible on Issue
- [ ] comment_url accessible

### Traceability

- [ ] All consumed artifacts documented
- [ ] All produced artifacts documented
- [ ] Evidence chain complete

---

## Failure Mode Prevention

| FM ID | Prevention Check |
|-------|-------------------|
| FM-001 | [ ] No closeIssue() call in code path |
| FM-002 | [ ] Comment content based on artifacts (not fabricated) |
| FM-003 | [ ] Issue context validated before execution |
| FM-004 | [ ] API failure handled gracefully (retry or escalation) |

---

## Sign-Off

| Field | Value |
|-------|-------|
| Validator | docs role |
| Skill | issue-status-sync |
| Date | YYYY-MM-DD |
| Issue State After | OPEN (required) |
| Recommendation | sync-complete / needs-follow-up / blocked |

---

## Notes

- **BR-003 is CRITICAL**: If Issue was closed, this is a blocker-level violation
- If API failed but retry succeeded, note in warnings
- If Issue was already closed by another process, record as warning (not violation)
- Only all checks pass → sync-complete
- Any BR-003 violation → blocked (blocker-level)