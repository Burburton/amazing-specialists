# Anti-Example 001: Premature Issue Closure

## ⚠️ WARNING: This is an anti-pattern demonstrating forbidden behavior

---

## Scenario

A developer mistakenly believes that once implementation is complete, the Issue should be closed immediately. They modify the issue-status-sync skill to close the Issue after posting the comment.

## ❌ Wrong Implementation

### Modified Skill Code (FORBIDDEN)

```javascript
// ❌ WRONG: docs skill includes Issue closure logic
async function syncIssueStatus(context) {
  const { issue_number, repository, dispatch_id } = context.dispatch;
  
  // Step 1: Generate comment
  const commentBody = generateProgressComment(context);
  
  // Step 2: Post comment
  await githubClient.postComment(owner, repo, issue_number, commentBody);
  
  // ❌ Step 3: Close Issue (FORBIDDEN!)
  if (context.execution_result.status === 'SUCCESS') {
    await githubClient.updateIssue(owner, repo, issue_number, { 
      state: 'closed',
      state_reason: 'completed'
    });
    
    console.log(`Issue #${issue_number} closed after successful execution`);
  }
  
  return {
    comment_posted: true,
    issue_state_after: 'closed',  // ❌ WRONG
    timestamp: new Date().toISOString()
  };
}
```

### Wrong Output

```yaml
# ❌ WRONG OUTPUT
issue_status_sync_result:
  skill: docs/issue-status-sync
  issue_number: 42
  comment_posted: true
  issue_state_before: OPEN
  issue_state_after: CLOSED    # ❌ VIOLATES BR-003
  closure_executed: true       # ❌ SHOULD NOT EXIST
  timestamp: "2026-03-30T10:00:00Z"
```

---

## Why This Is Wrong

### 1. Violates BR-003: No Premature Closure

**BR-003 states**: "严禁在本 skill 中关闭 Issue"

This implementation directly violates the core business rule.

### 2. Skips Management Acceptance

The correct flow is:
```
docs: Issue comment → Issue OPEN → Management reviews → Management closes
```

Premature closure skips the management acceptance step:
```
docs: Issue comment → Issue CLOSED ❌ → (Management never sees it)
```

### 3. Blocks Rework Flow

If reviewer later finds issues:
- Issue is already closed
- Developer cannot continue on same Issue
- Need to reopen or create new Issue
- Traceability broken

### 4. Wrong Responsibility Assignment

**Who should close Issue?**
- ✅ Management (after acceptance)
- ✅ OpenClaw adapter (automation mode, after acceptance)
- ❌ docs role (execution layer)

docs role is **execution layer**, not **acceptance layer**.

---

## ✅ Correct Implementation

### Proper Skill Code

```javascript
// ✅ CORRECT: docs skill ONLY posts comment
async function syncIssueStatus(context) {
  const { issue_number, repository, dispatch_id } = context.dispatch;
  
  // Step 1: Validate Issue context (BR-004)
  if (!issue_number || !repository) {
    return {
      comment_posted: false,
      warning: "Missing Issue context, skipping skill",
      issue_state_after: null
    };
  }
  
  // Step 2: Generate comment (based on artifacts - BR-001)
  const commentBody = generateProgressComment(context);
  
  // Step 3: Post comment ONLY
  await githubClient.postComment(owner, repo, issue_number, commentBody);
  
  // ✅ Step 4: Verify Issue stays OPEN (BR-003)
  const issueState = await githubClient.getIssue(owner, repo, issue_number);
  
  // ✅ NO CLOSURE LOGIC HERE
  // Issue closure is management responsibility
  
  return {
    comment_posted: true,
    issue_state_before: 'OPEN',
    issue_state_after: issueState.state,  // ✅ Should be OPEN
    closure_attempted: false,  // ✅ Explicitly false
    timestamp: new Date().toISOString()
  };
}
```

### Correct Output

```yaml
# ✅ CORRECT OUTPUT
issue_status_sync_result:
  skill: docs/issue-status-sync
  issue_number: 42
  comment_posted: true
  comment_url: "https://github.com/.../issues/42#issuecomment-xxx"
  issue_state_before: OPEN
  issue_state_after: OPEN    # ✅ CORRECT
  closure_attempted: false   # ✅ Explicitly documented
  warnings: []
  timestamp: "2026-03-30T10:00:00Z"
```

---

## Detection Checklist

Use this checklist to detect premature closure violations:

### Code Review Detection

- [ ] No `closeIssue()` call in skill code
- [ ] No `updateIssue({ state: 'closed' })` call
- [ ] No `updateIssue({ state: 'completed' })` call
- [ ] No closure logic in any execution path

### Output Validation Detection

- [ ] `issue_state_after` is OPEN
- [ ] `closure_attempted` is false or absent
- [ ] No `state_reason` field in output

### Comment Content Detection

- [ ] Comment says "等待验收" (pending acceptance)
- [ ] Comment does NOT say "已关闭" (closed)
- [ ] Next steps include "验收后关闭" (close after acceptance)

---

## Correct Closure Flow

### Who Closes the Issue?

| Scenario | Who Closes | When |
|----------|------------|------|
| Automation mode | OpenClaw adapter | After acceptance layer approves |
| Manual mode | Management (human) | After reviewing execution results |
| Rework needed | NO ONE (stay OPEN) | Until rework complete and accepted |

### Correct Automation Flow

```
Issue OPEN
  → 6-role execution (architect → developer → tester → reviewer → docs)
  → docs: issue-status-sync posts comment
  → Issue stays OPEN
  → acceptance layer checks RC-003
  → If APPROVED: OpenClaw adapter closes Issue
  → If REJECTED: Issue stays OPEN for rework
```

### Correct Manual Flow

```
Issue OPEN
  → 6-role execution
  → docs: issue-status-sync posts comment "等待验收"
  → Issue stays OPEN
  → Management reviews artifacts (RC-003, TC-001)
  → Management decides:
     - ACCEPT → Management closes Issue
     - REJECT → Issue stays OPEN, trigger rework
```

---

## Impact Analysis

### If Premature Closure Occurs

| Impact | Severity | Description |
|--------|----------|-------------|
| Governance violation | blocker | Violates BR-003 core rule |
| Acceptance skipped | blocker | Management never reviews |
| Rework blocked | major | Developer cannot continue |
| Traceability broken | major | Issue-artifact chain severed |
| Audit trail incomplete | major | No acceptance record |

### Recovery Actions

1. **Immediate**: Reopen Issue
2. **Document**: Record premature closure as violation
3. **Process**: Trigger management review
4. **Prevention**: Update skill code to remove closure logic

---

## Summary

| Aspect | Wrong | Correct |
|--------|-------|---------|
| Skill behavior | Posts comment + closes Issue | Posts comment only |
| Issue state after | CLOSED | OPEN |
| Closure responsibility | docs role (wrong) | Management/OpenClaw |
| BR-003 compliance | VIOLATED | COMPLIANT |

**Remember**: docs/issue-status-sync is an **execution layer** skill. Issue closure is an **acceptance layer** decision. Never mix these responsibilities.