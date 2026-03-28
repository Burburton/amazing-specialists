# GitHub Issue Adapter Design Document

## Metadata
```yaml
adapter_id: github-issue
adapter_type: orchestrator
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
| **Adapter ID** | `github-issue` | Registry key |
| **Adapter Type** | Orchestrator | Upstream integration (External → Dispatch Payload) |
| **Priority** | Later | Design only, future implementation |
| **Interface** | `OrchestratorAdapter` | io-contract.md §8 |
| **Compatible Profiles** | minimal, full | Both profiles supported |
| **Compatible Workspaces** | github-pr, local-repo | Can output to GitHub PR or local files |

### Type Definition (from ADAPTERS.md)

作为 Orchestrator Adapter，GitHub Issue Adapter 负责：
- **Input Normalization**: 将 GitHub Issue 格式转换为 Dispatch Payload
- **Context Extraction**: 从 Issue 提取 project_id, milestone_id, task_id
- **Validation**: 验证 Dispatch Payload 符合 schema
- **Routing**: 根据 label 确定目标角色
- **Error Mapping**: 将 GitHub API 错误映射为 BLOCKED/FAILED 状态
- **Escalation Generation**: 无法继续时生成 escalation request

---

## 2. Input/Output Mapping Tables

### Dispatch Input Mapping

将 GitHub Issue 字段映射为 Dispatch Payload 字段（io-contract.md §1）：

| GitHub Issue Field | Dispatch Payload Field | Mapping Logic |
|--------------------|------------------------|---------------|
| **Issue number** | `dispatch_id` | `gh-issue-{repository}-{number}` |
| **Repository name** | `project_id` | `{owner}/{repo}` → project_id |
| **`milestone:*` label** | `milestone_id` | Parse label `milestone:M001` → `M001` |
| **Issue title** | `title` | Direct mapping |
| **Issue body** | `goal` | First paragraph/summary section |
| **Issue body** | `description` | Full body content |
| **Issue body** | `context` | Parse sections: `## Context` |
| **Issue body** | `constraints` | Parse sections: `## Constraints` |
| **Issue body** | `inputs` | Parse sections: `## Inputs` |
| **`role:*` label** | `role` | `role:developer` → `developer` |
| **`command:*` label** | `command` | `command:implement-task` → `implement-task` |
| **Issue template** | `command` | Template name → command mapping |
| **`risk:*` label** | `risk_level` | `risk:high` → `high` |
| **Auto-generated** | `expected_outputs` | Based on role/command |
| **Auto-generated** | `verification_steps` | Based on role/command |

### Label Parsing Rules

| Label Pattern | Field | Example |
|---------------|-------|---------|
| `milestone:M###` | milestone_id | `milestone:M001` → `M001` |
| `role:{role_name}` | role | `role:architect` → `architect` |
| `command:{command_name}` | command | `command:design-task` → `design-task` |
| `risk:{level}` | risk_level | `risk:critical` → `critical` |
| `task:T###` | task_id | `task:T001` → `T001` |
| `priority:*` | (metadata) | `priority:high` |

### Issue Body Section Parsing

GitHub Issue body 预期包含以下 sections：

```markdown
## Context
[项目上下文内容]

## Goal
[任务目标]

## Constraints
- [约束条件列表]

## Inputs
[输入工件引用]

## Expected Outputs
[期望输出列表]
```

Section 映射表：

| Section Name | Dispatch Field | Notes |
|--------------|-----------------|-------|
| `## Context` | `context.task_scope` | 任务范围上下文 |
| `## Goal` | `goal` | 任务目标（若缺失，用 Issue title） |
| `## Constraints` | `constraints` | 解析为数组 |
| `## Inputs` | `inputs` | 解析为 artifact 引用 |
| `## Expected Outputs` | `expected_outputs` | 解析为数组 |

---

## 3. Escalation Mapping

当需要升级时，将 Escalation（io-contract.md §4）输出到 GitHub：

| Escalation Field | GitHub Action | Format |
|------------------|---------------|--------|
| `escalation_id` | Issue comment | Posted as comment with header |
| `summary` | Issue comment body | Markdown formatted |
| `blocking_points` | Issue comment (markdown list) | `🚫 Blocking Points:` section |
| `recommended_next_steps` | Issue comment (markdown list) | `📋 Recommended Actions:` section |
| `requires_user_decision` | Add label | `escalation:needs-decision` |
| `options` | Issue comment (options section) | Markdown choice list |

### Escalation Comment Template

```markdown
## 🔔 Escalation Request

**Escalation ID**: `{escalation_id}`
**Reason**: `{reason_type}`
**Level**: `{level}`

### 🚫 Blocking Points
{blocking_points}

### 🔧 Attempted Actions
{attempted_actions}

### 📋 Recommended Next Steps
{recommended_next_steps}

### ⚖️ Options
{options}

**Requires User Decision**: {requires_user_decision}

---
Please respond with your decision to proceed.
```

### Label-based Escalation Handling

| Label | Action | Trigger Condition |
|-------|--------|-------------------|
| `escalation:needs-decision` | Wait for user comment | `requires_user_decision: true` |
| `escalation:resolved` | Continue execution | User responds with decision |
| `escalation:blocked` | Stop execution | External blocker identified |

---

## 4. Retry Strategy

### Retry Configuration

| Property | Value | Notes |
|----------|-------|-------|
| **Strategy** | Auto-retry with comment | Automatic retry with notification |
| **Max Retry** | 1 | Limited retry to avoid spam |
| **Trigger** | Bot triggered | Triggered by GitHub Actions/bot |
| **Backoff** | 5 minutes | Delay between retries |
| **Notification** | Issue comment | Comment posted on each retry |

### Retry Flow

```
1. Dispatch fails (validation error / execution error)
2. Post retry comment to Issue
3. Wait backoff period
4. Re-dispatch with retry_context
5. If max_retry exceeded → Escalate
```

### Retry Comment Template

```markdown
## 🔄 Retry Attempt #{retry_count}

**Previous Failure Reason**: `{previous_failure_reason}`
**Required Fixes**: `{required_fixes}`

Attempting retry with adjusted parameters...

---
*Max retries: {max_retry}. Current: {retry_count}*
```

---

## 5. Interface Requirements

### Required Interface Implementation

适配器必须实现 `OrchestratorAdapter` 接口（io-contract.md §8）：

```typescript
interface GitHubIssueAdapter extends OrchestratorAdapter {
  // Core Methods (Required)
  normalizeInput(issue: GitHubIssue): DispatchPayload;
  validateDispatch(dispatch: DispatchPayload): ValidationResult;
  routeToExecution(dispatch: DispatchPayload): void;
  mapError(error: GitHubApiError): ExecutionStatus;
  
  // Escalation Method (Required for GitHub)
  generateEscalation(context: EscalationContext): Escalation;
  
  // Retry Method (Required for Auto-retry)
  handleRetry(retryContext: RetryContext): RetryDecision;
  
  // Adapter-specific Methods
  parseIssueLabels(labels: GitHubLabel[]): LabelParseResult;
  parseIssueBody(body: string): BodyParseResult;
  postComment(issueNumber: number, comment: string): void;
  addLabel(issueNumber: number, label: string): void;
  
  // Metadata
  getAdapterInfo(): AdapterInfo;
}
```

### Custom Type Definitions

```typescript
interface GitHubIssue {
  number: number;
  repository: { owner: string; repo: string };
  title: string;
  body: string | null;
  labels: GitHubLabel[];
  milestone: { title: string; number: number } | null;
  user: { login: string };
  created_at: string;
  updated_at: string;
}

interface GitHubLabel {
  name: string;
  description: string | null;
}

interface LabelParseResult {
  milestone_id: string | null;
  task_id: string | null;
  role: RoleEnum | null;
  command: string | null;
  risk_level: RiskLevelEnum | null;
  unrecognized_labels: string[];
}

interface BodyParseResult {
  goal: string;
  description: string;
  context: DispatchContext;
  constraints: string[];
  inputs: ArtifactReference[];
  expected_outputs: string[];
  missing_sections: string[];
}
```

### ValidationResult Schema

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  missing_fields: string[];
  unrecognized_labels: string[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
}

interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
  suggestion: string;
}
```

---

## 6. Implementation Considerations

### Authentication Requirements

| Method | Security Level | Recommended Use |
|--------|----------------|-----------------|
| GitHub App Token | High | Production deployment |
| Personal Access Token (PAT) | Medium | Development/testing |
| OAuth App | Low | Not recommended for automation |

**Token Storage**: Should be handled by secure vault/secrets manager, not in adapter code.

### Rate Limiting

GitHub API rate limits:
- **REST API**: 5000 requests/hour (authenticated)
- **GraphQL API**: 5000 points/hour

Adapter should implement:
- Rate limit tracking
- Backoff when approaching limits
- Queue management for burst handling

### Error Handling

| Error Type | Mapping | Response |
|------------|---------|----------|
| 404 Not Found | BLOCKED | Issue not found, log error |
| 403 Forbidden | BLOCKED | Permission denied, escalate |
| 422 Validation Failed | FAILED_RETRYABLE | Invalid Issue format, retry |
| 500 Server Error | FAILED_RETRYABLE | GitHub API issue, retry |
| Rate Limited | BLOCKED | Wait and retry |

### Event Triggers

Adapter should support multiple trigger sources:

| Trigger | Configuration | Notes |
|---------|---------------|-------|
| GitHub Webhook | Webhook endpoint | Real-time processing |
| GitHub Actions | Workflow trigger | CI/CD integration |
| Polling | Scheduled check | Periodic Issue scan |
| Manual | CLI/API call | Manual dispatch |

### Testing Strategy

| Test Type | Coverage | Tool |
|-----------|----------|------|
| Unit Tests | Label parsing, body parsing | Jest/Mocha |
| Integration Tests | GitHub API mock | Mock service |
| E2E Tests | Real GitHub Issue | Test repository |

---

## 7. Configuration Schema

Adapter 配置应符合 `workspace-configuration.schema.json` 并包含 GitHub 特定扩展：

```json
{
  "adapter_type": "orchestrator",
  "adapter_id": "github-issue",
  
  "github_config": {
    "webhook_secret": "${GITHUB_WEBHOOK_SECRET}",
    "api_token_source": "github_app",
    "app_id": "${GITHUB_APP_ID}",
    "app_private_key_path": "${GITHUB_APP_PRIVATE_KEY_PATH}",
    
    "label_mappings": {
      "milestone_prefix": "milestone:",
      "role_prefix": "role:",
      "command_prefix": "command:",
      "task_prefix": "task:",
      "risk_prefix": "risk:"
    },
    
    "default_values": {
      "role": "developer",
      "command": "implement-task",
      "risk_level": "medium"
    },
    
    "retry_config": {
      "strategy": "auto",
      "max_retry": 1,
      "backoff_seconds": 300,
      "comment_on_retry": true
    }
  }
}
```

---

## 8. References

- `ADAPTERS.md` §Orchestrator Adapter §GitHub Issue (Later)
- `io-contract.md` §1 (Dispatch Payload)
- `io-contract.md` §4 (Escalation)
- `io-contract.md` §8 (Adapter Interface Contract)
- `adapters/registry.json` (Adapter metadata)
- GitHub REST API Documentation

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial design document (Feature 020 T031) |