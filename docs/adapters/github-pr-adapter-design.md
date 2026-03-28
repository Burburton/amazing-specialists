# GitHub PR Adapter Design Document

## Metadata
```yaml
adapter_id: github-pr
adapter_type: workspace
priority: later
status: design-only
design_version: 1.0.0
created_at: 2026-03-28
feature_reference: 020-orchestrator-and-workspace-adapters
```

---

## 1. Adapter Classification

| Property | Value | Notes |
|----------|-------|-------|
| **Adapter ID** | `github-pr` | Registry key |
| **Adapter Type** | Workspace | Downstream integration (Execution Result → GitHub PR) |
| **Priority** | Later | Design only, future implementation |
| **Interface** | `WorkspaceAdapter` | io-contract.md §8 |
| **Compatible Profiles** | minimal, full | Both profiles supported |
| **Workspace Type** | `github_repo` | Output to GitHub repository |

### Type Definition (from ADAPTERS.md)

作为 Workspace Adapter，GitHub PR Adapter 负责：
- **Artifact Output**: 将 Execution Result 的 artifacts 写入 PR 文件
- **File Handling**: 处理 changed_files 的 PR commit
- **State Sync**: 同步 execution state 到 PR status
- **Escalation Handling**: 将 escalation 输出到 PR review comment
- **Validation**: 验证 artifact 输出符合 schema
- **Retry Handling**: 处理输出失败的 retry

---

## 2. Input/Output Mapping Tables

### Artifact Output Mapping

将 Execution Result 的 artifacts 映射为 PR 文件（io-contract.md §2, §3）：

| Execution Result Field | GitHub PR Action | Notes |
|------------------------|------------------|-------|
| `artifacts[].path` | Add to PR files | File path in branch |
| `artifacts[].content` | PR file content | File content |
| `artifacts[].format` | File format detection | markdown → .md, json → .json |
| `artifacts[].artifact_type` | Commit message prefix | `[design-note]`, `[test-report]` |

### Changed Files Mapping

| Execution Result Field | GitHub PR Action | Notes |
|------------------------|------------------|-------|
| `changed_files[].path` | Create/update/delete file | File operations |
| `changed_files[].change_type: added` | Create new file | Add to branch |
| `changed_files[].change_type: modified` | Update existing file | Modify in branch |
| `changed_files[].change_type: deleted` | Remove file | Delete from branch |
| `changed_files[].change_type: renamed` | Move file | Rename in branch |
| `changed_files[].diff_summary` | Commit message | Include in commit |

### Status Mapping

| Execution Result Status | PR Status Action | Notes |
|-------------------------|------------------|-------|
| `SUCCESS` | Approve PR | Set review status to APPROVE |
| `SUCCESS_WITH_WARNINGS` | Approve PR with comment | APPROVE + warning comment |
| `PARTIAL` | Request changes | REQUEST_CHANGES with partial comment |
| `BLOCKED` | Comment without review | Comment explaining blocker |
| `FAILED_RETRYABLE` | Request changes | REQUEST_CHANGES with fix suggestions |
| `FAILED_ESCALATE` | Comment + escalate | Escalation comment |

### Recommendation Mapping

| Recommendation | PR Action | Notes |
|----------------|-----------|-------|
| `CONTINUE` | Merge readiness comment | Comment indicating ready for merge |
| `SEND_TO_TEST` | Request test review | Add `needs-testing` label |
| `SEND_TO_REVIEW` | Request code review | Add `needs-review` label |
| `REWORK` | Request changes | REQUEST_CHANGES status |
| `REPLAN` | Comment + escalate | Explain replan needed |
| `ESCALATE` | Escalation comment | Post escalation details |

---

## 3. Escalation Mapping

当需要升级时，将 Escalation 输出到 PR review comment：

| Escalation Field | PR Action | Format |
|------------------|-----------|--------|
| `escalation_id` | Review comment header | Posted as PR review comment |
| `summary` | Review comment body | Markdown formatted |
| `blocking_points` | Review comment (list) | `🚫 Blocking Points:` section |
| `recommended_next_steps` | Review comment (list) | `📋 Recommended Actions:` section |
| `requires_user_decision` | Add label | `escalation:needs-decision` |
| `options` | Review comment (options) | Choice list for user |

### Escalation Comment Template

```markdown
## 🚨 PR Escalation

**Escalation ID**: `{escalation_id}`
**Reason**: `{reason_type}`
**Level**: `{level}` (USER decision required)

### 🚫 Blocking Points
{blocking_points}

### 🔧 Attempted Actions
{attempted_actions}

### 📋 Recommended Next Steps
{recommended_next_steps}

### ⚖️ Options
{options}

---
**Requires your decision to proceed.** Please respond with your choice.
```

### PR Review Comment Positioning

Escalation comments should be positioned:
- **File-level comments**: When blocking point relates to specific file
- **Line-level comments**: When blocking point relates to specific line
- **General comments**: When blocking point is workflow/process issue

---

## 4. Retry Strategy

### Retry Configuration

| Property | Value | Notes |
|----------|-------|-------|
| **Strategy** | Configurable | User can configure retry behavior |
| **Max Retry** | 2 | Default, can be overridden |
| **Trigger** | User decision | Wait for PR author response |
| **Backoff** | None | Immediate retry after user decision |
| **Notification** | PR comment | Comment posted on each retry |

### Retry Flow

```
1. Artifact output fails (API error / validation error)
2. Post retry comment to PR
3. Wait for user decision (label: retry-approved or retry-aborted)
4. If retry-approved → Re-attempt output
5. If retry-aborted → Mark as FAILED
6. If max_retry exceeded → Escalate
```

### Retry Comment Template

```markdown
## 🔄 Output Retry Request

**Attempt**: #{retry_count}/{max_retry}
**Previous Failure**: `{previous_failure_reason}`

**Options**:
- ✅ Add `retry-approved` label to retry
- ❌ Add `retry-aborted` label to cancel

---
*Please add a label to indicate your decision.*
```

---

## 5. Interface Requirements

### Required Interface Implementation

适配器必须实现 `WorkspaceAdapter` 接口（io-contract.md §8）：

```typescript
interface GitHubPRAdapter extends WorkspaceAdapter {
  // Core Methods (Required)
  handleArtifacts(result: ExecutionResult): void;
  handleChangedFiles(result: ExecutionResult): void;
  handleEscalation(escalation: Escalation): void;
  validateArtifactOutput(artifacts: Artifact[]): ValidationResult;
  
  // Optional Methods (Recommended for GitHub)
  validatePaths?(paths: string[]): PathValidationResult[];
  handleRetry?(retryContext: RetryContext): RetryDecision;
  syncState?(result: ExecutionResult): void;
  getOutputSummary?(): WorkspaceOutputResult;
  
  // Adapter-specific Methods
  createBranch(prNumber: number, branchName: string): BranchResult;
  createCommit(branch: string, files: ChangedFile[], message: string): CommitResult;
  createPR(branch: string, title: string, body: string): PRResult;
  postReviewComment(prNumber: number, comment: ReviewComment): void;
  setReviewStatus(prNumber: number, status: ReviewStatus): void;
  addPRLabel(prNumber: number, label: string): void;
  
  // Metadata
  getAdapterInfo(): WorkspaceAdapterInfo;
}
```

### Custom Type Definitions

```typescript
interface PRResult {
  pr_number: number;
  pr_url: string;
  branch_name: string;
  status: 'created' | 'updated';
}

interface ReviewComment {
  body: string;
  path?: string;      // File path for file-level comment
  position?: number;  // Line position for line-level comment
  comment_type: 'general' | 'file' | 'line';
}

interface ReviewStatus {
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT' | 'PENDING';
  body?: string;
}

interface BranchResult {
  branch_name: string;
  base_branch: string;
  created: boolean;
}

interface CommitResult {
  commit_sha: string;
  files_changed: number;
}
```

### PathValidationResult Schema (BR-006)

```typescript
interface PathValidationResult {
  path: string;
  exists: boolean;
  writable: boolean;
  conflict: boolean;       // Won't overwrite unauthorized files
  profileMatch: boolean;   // Matches profile configuration
  errors: string[];
  suggestions: string[];
}
```

---

## 6. Implementation Considerations

### Branch Strategy

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **Feature Branch** | Create new branch per dispatch | New feature implementation |
| **Update Branch** | Update existing PR branch | Iterative changes |
| **Fork Branch** | Create branch in fork | External contributor |

Recommended flow:
```
1. Check if PR exists for this dispatch
2. If exists → Update existing branch
3. If not → Create new feature branch
4. Commit all changed_files
5. Create/update PR
```

### PR Naming Convention

| Artifact Type | PR Title Format | Branch Name |
|---------------|-----------------|-------------|
| design-note | `[Design] {title}` | `design/{task_id}` |
| implementation | `[Implement] {title}` | `feature/{feature_id}` |
| test-report | `[Test] {title}` | `test/{task_id}` |
| review-report | `[Review] {title}` | `review/{review_id}` |
| bugfix | `[Fix] {title}` | `fix/{issue_id}` |

### Authentication Requirements

| Method | Security Level | Recommended Use |
|--------|----------------|-----------------|
| GitHub App Token | High | Production deployment |
| Personal Access Token (PAT) | Medium | Development/testing |
| SSH Key | High | Git operations |

**Token Scope Requirements**:
- `repo` - Full repository access
- `pull_requests:write` - PR management
- `contents:write` - File operations

### Rate Limiting

GitHub API rate limits (same as GitHub Issue Adapter):
- **REST API**: 5000 requests/hour (authenticated)
- **GraphQL API**: 5000 points/hour

Adapter should implement rate limit tracking and backoff.

### Error Handling

| Error Type | Mapping | Response |
|------------|---------|----------|
| Branch creation failed | FAILED_RETRYABLE | Retry with different branch name |
| Commit failed | FAILED_RETRYABLE | Retry commit |
| PR creation failed | FAILED_RETRYABLE | Retry PR creation |
| Permission denied | BLOCKED | Escalate for permissions |
| Merge conflict | FAILED_RETRYABLE | Request user to resolve |

### File Conflict Handling

When file changes conflict:
- **Auto-merge**: Attempt to merge if safe
- **Manual request**: Request user resolution via PR comment
- **Abort**: Cancel commit and escalate

---

## 7. Configuration Schema

Adapter 配置应符合 `workspace-configuration.schema.json` 并包含 GitHub PR 特定扩展：

```json
{
  "workspace_type": "github_repo",
  "profile": "minimal",
  
  "output_config": {
    "artifact_path": "docs/artifacts/",
    "changed_files_path": "src/",
    "console_output": false
  },
  
  "escalation_config": {
    "channel": "github_comment",
    "requires_acknowledgment": true
  },
  
  "retry_config": {
    "strategy": "configurable",
    "max_retry": 2,
    "trigger": "user_decision"
  },
  
  "github_pr_config": {
    "default_base_branch": "main",
    "branch_prefix": "expert-pack/",
    "pr_template": {
      "title_prefix": "[Expert Pack]",
      "body_template": "docs/templates/pr-body-template.md"
    },
    "review_automation": {
      "auto_approve_on_success": false,
      "request_changes_on_failure": true
    },
    "labels": {
      "success": "expert-pack:success",
      "warning": "expert-pack:warning",
      "needs_retry": "retry-approved",
      "abort_retry": "retry-aborted",
      "escalation": "escalation:needs-decision"
    }
  }
}
```

---

## 8. Integration with Orchestrator

GitHub PR Adapter 通常配合以下 Orchestrator Adapter 使用：

| Orchestrator | Workflow | Notes |
|--------------|----------|-------|
| GitHub Issue Adapter | Issue → PR | Issue triggers, PR outputs |
| OpenClaw Adapter | Dispatch → PR | Manager dispatch, PR outputs |
| CLI Adapter | CLI → PR | CLI command, PR outputs (uncommon) |

### Combined Workflow (Issue → PR)

```
1. GitHub Issue created with labels
2. GitHub Issue Adapter → Dispatch Payload
3. Expert Pack Execution
4. Execution Result → GitHub PR Adapter
5. GitHub PR Adapter creates PR
6. PR linked back to Issue (cross-reference)
```

---

## 9. References

- `ADAPTERS.md` §Workspace Adapter §GitHub PR (Later)
- `io-contract.md` §2 (Execution Result)
- `io-contract.md` §3 (Artifact)
- `io-contract.md` §8 (Adapter Interface Contract)
- `adapters/registry.json` (Adapter metadata)
- GitHub REST API Documentation
- GitHub PR API Documentation

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial design document (Feature 020 T032) |