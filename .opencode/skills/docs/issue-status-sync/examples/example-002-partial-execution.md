# Example 002: Partial Execution - Needs Rework

## Scenario

Task execution completed with reviewer rejection. The reviewer found must-fix issues that require developer to rework. The docs role needs to post a progress comment indicating rework is needed and keep Issue OPEN.

## Input Context

### Dispatch Context

```yaml
dispatch:
  issue_number: 42
  repository: "Burburton/amazing-specialist-face"
  dispatch_id: "disp_028_001"
  command: "spec-implement"
  feature_id: "028-issue-status-sync"
```

### Upstream Artifacts

**acceptance-decision-record.md** (RC-003):
```yaml
contract_id: RC-003
feature_id: 028-issue-status-sync
decision: REJECTED
must_fix_issues:
  - "Type definition missing for issue-progress-report in SKILL.md"
  - "validation-checklist.md missing BR-003 critical check"
  - "Example files incomplete"
recommendation: REWORK
review_summary:
  - architect output: design-note - approved
  - developer output: implementation-summary - needs fixes
  - tester output: verification-report - 2 tests failing
timestamp: "2026-03-30T11:00:00Z"
```

**execution-result**:
```yaml
dispatch_id: disp_028_001
status: PARTIAL
recommendation: REWORK
artifacts_produced:
  - contract_id: AC-001
    path: specs/028/design-note.md
  - contract_id: DC-001
    path: specs/028/implementation-summary.md  # incomplete
artifacts_blocked:
  - contract_id: TC-001
    reason: "Tests failing due to type errors"
```

**verification-report.md** (TC-001):
```yaml
contract_id: TC-001
tests_passed: false
tests_total: 15
tests_failed: 2
tests_failed_details:
  - test: "issue-progress-report schema validation"
    error: "Missing required field: recommendation_reason"
  - test: "BR-003 closure prevention"
    error: "Checklist missing forbidden actions section"
coverage_summary: "78%"
```

## Skill Execution

### Step 1: Validate Issue Context (BR-004)

```yaml
issue_context_check:
  issue_number: 42          # ✅ exists
  repository: "Burburton/amazing-specialist-face"  # ✅ exists
  github_api_accessible: true  # ✅ accessible
  result: PASS
```

### Step 2: Consume Upstream Artifacts (BR-001)

```yaml
consumed_artifacts:
  - artifact: acceptance-decision-record
    contract_id: RC-003
    path: specs/028/acceptance-decision-record.md
    fields_used: [decision, must_fix_issues, recommendation]
    
  - artifact: execution-result
    path: specs/028/execution-result.md
    fields_used: [status, recommendation, artifacts_blocked]
    
  - artifact: verification-report
    contract_id: TC-001
    path: specs/028/verification-report.md
    fields_used: [tests_passed, tests_failed, tests_failed_details]
```

### Step 3: Determine Comment Type (BR-005)

Input recommendation: `REWORK`
Output recommendation: `NEEDS_REWORK`
Issue state: `OPEN` (保持开放等待返工)

### Step 4: Generate DOC-003 Report

```yaml
issue_progress_report:
  issue_number: 42
  repository: "Burburton/amazing-specialist-face"
  dispatch_id: "disp_028_001"
  execution_status: PARTIAL
  
  roles_completed:
    - role: architect
      status: COMPLETE
      key_output: "design-note (AC-001) - approved"
    - role: developer
      status: PARTIAL
      key_output: "implementation-summary (DC-001) - needs fixes"
    - role: tester
      status: PARTIAL
      key_output: "verification-report (TC-001) - 2 tests failing"
    - role: reviewer
      status: COMPLETE
      key_output: "acceptance-decision-record (RC-003) - REJECTED"
    - role: docs
      status: SKIPPED
      key_output: "Waiting for rework completion"
    - role: security
      status: SKIPPED
      key_output: "N/A"
      
  artifacts_produced:
    - contract_id: "AC-001"
      file_path: "specs/028/design-note.md"
      summary: "Skill design - approved"
    - contract_id: "DC-001"
      file_path: "specs/028/implementation-summary.md"
      summary: "Implementation summary - incomplete, needs fixes"
      
  recommendation: NEEDS_REWORK
  recommendation_reason: "Reviewer rejected (RC-003) with 3 must-fix issues: missing type definition, incomplete checklist, incomplete examples"
  
  quality_summary:
    tests_passed: false
    tests_failed: 2
    review_status: REJECTED
    security_gate: null
    
  next_steps:
    - action: "Add type definition for issue-progress-report"
      responsible_party: "developer"
    - action: "Complete validation-checklist with BR-003 check"
      responsible_party: "developer"
    - action: "Complete example files"
      responsible_party: "developer"
    - action: "Re-run tests after fixes"
      responsible_party: "tester"
    - action: "Re-submit for review"
      responsible_party: "developer"
      
  posted_at: "2026-03-30T11:30:00Z"
  comment_url: "https://github.com/Burburton/amazing-specialist-face/issues/42#issuecomment-yyy"
```

### Step 5: Format Markdown Comment

```markdown
## ⚠️ 需要返工

### 执行摘要
| 项目 | 值 |
|------|-----|
| 状态 | PARTIAL |
| Issue | #42 |
| Dispatch ID | disp_028_001 |
| Feature | 028-issue-status-sync |

### 返工原因 (来自 RC-003)
Reviewer 发现 3 个必须修复的问题：
1. ❌ Type definition missing for issue-progress-report in SKILL.md
2. ❌ validation-checklist.md missing BR-003 critical check
3. ❌ Example files incomplete

### 测试结果 (来自 TC-001)
- ❌ 2 tests failing (15 total)
  - issue-progress-report schema validation: Missing required field
  - BR-003 closure prevention: Checklist missing forbidden actions
- Coverage: 78%

### 角色完成状态
| 角色 | 状态 | 说明 |
|------|------|------|
| architect | ✅ Complete | design-note approved |
| developer | ⚠️ Partial | needs fixes |
| tester | ⚠️ Partial | 2 tests failing |
| reviewer | ✅ Complete | REJECTED, 3 must-fix issues |
| docs | ⏭️ Skipped | waiting for rework |
| security | ⏭️ Skipped | N/A |

### 下一步行动
| # | 行动 | 负责角色 |
|---|------|----------|
| 1 | 添加 issue-progress-report 类型定义 | developer |
| 2 | 完善 validation-checklist BR-003 检查 | developer |
| 3 | 完成示例文件 | developer |
| 4 | 修复后重新运行测试 | tester |
| 5 | 重新提交审查 | developer |

---
*Generated by docs/issue-status-sync at 2026-03-30T11:30:00Z*
```

### Step 6: Post Comment to GitHub

```javascript
const result = await githubClient.postComment(
  "Burburton",
  "amazing-specialist-face",
  42,
  commentBody
);

// Result
{
  status: 201,
  comment_id: "issuecomment-yyy",
  comment_url: "https://github.com/Burburton/amazing-specialist-face/issues/42#issuecomment-yyy"
}
```

### Step 7: Verify Issue State (BR-003)

```yaml
issue_state_verification:
  issue_state_before: OPEN
  issue_state_after: OPEN    # ✅ 必须保持 OPEN（等待返工）
  closure_attempted: false   # ✅ 未尝试关闭
  result: PASS
```

## Output Artifacts

### DOC-003: issue-progress-report

(Generated in Step 4 above)

### Secondary Output

```yaml
issue_status_sync_result:
  skill: docs/issue-status-sync
  issue_number: 42
  comment_posted: true
  comment_url: "https://github.com/Burburton/amazing-specialist-face/issues/42#issuecomment-yyy"
  issue_state_before: OPEN
  issue_state_after: OPEN    # BR-003: 必须保持 OPEN（等待返工）
  warnings: []
  timestamp: "2026-03-30T11:30:00Z"
```

## BR Compliance Verification

- [x] **BR-001**: All content references consumed artifacts (RC-003, TC-001)
- [x] **BR-002**: Only posted comment, no Issue modifications
- [x] **BR-003**: Issue remains OPEN, no closeIssue() called (critical for rework scenario)
- [x] **BR-004**: Issue context validated before execution
- [x] **BR-005**: Recommendation mapped correctly (REWORK → NEEDS_REWORK)

## Key Decisions

1. **No Premature Closure**: Critical for rework - Issue must stay OPEN to allow developer to continue work
2. **Evidence-Based**: Must-fix issues directly from RC-003, not summarized
3. **Clear Action Items**: Each must-fix issue mapped to specific next step
4. **Responsible Party**: Clear assignment to developer for rework actions

## Why BR-003 is Critical Here

If Issue was closed prematurely:
- Developer cannot continue working on the same Issue
- Rework would require new Issue or reopening
- Traceability chain broken
- Management acceptance flow disrupted

Keeping Issue OPEN ensures:
- Developer can submit fixes to same Issue
- Full traceability maintained
- Management can still accept/reject after rework