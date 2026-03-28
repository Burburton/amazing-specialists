# Feature Spec: GitHub Issue Orchestrator Adapter

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 021-github-issue-adapter |
| **Feature Name** | GitHub Issue Orchestrator Adapter |
| **Priority** | Later |
| **Status** | Complete |
| **Target Version** | v1.1 |
| **Related Features** | 020-orchestrator-and-workspace-adapters |
| **Design Document** | docs/adapters/github-issue-adapter-design.md |

---

## Background

Feature 020 已完成适配层基础架构，包括：
- ADAPTERS.md - Adapter 架构定义文档
- adapters/interfaces/orchestrator-adapter.interface.ts - OrchestratorAdapter 接口定义
- adapters/registry.json - Adapter 注册表
- adapters/cli-local/ - CLI/Local Orchestrator Adapter (Must-Have, 已实现)

GitHub Issue Adapter 设计文档 (docs/adapters/github-issue-adapter-design.md) 已完成详细设计，定义了：
- Input/Output 映射表（GitHub Issue ↔ Dispatch Payload）
- Label 解析规则（milestone, role, command, task, risk）
- Issue Body section 解析（Context, Goal, Constraints, Inputs, Expected Outputs）
- Escalation 映射（升级评论模板）
- Retry 策略配置

当前需要实现完整的 GitHub Issue Orchestrator Adapter，使专家包可以通过 GitHub Issue 触发任务执行。

---

## Goal

实现完整的 GitHub Issue Orchestrator Adapter，达成以下目标：

1. **完整转换**：将 GitHub Issue 转换为标准 Dispatch Payload
2. **标签解析**：从 Issue labels 提取 milestone_id, role, command, task_id, risk_level
3. **正文解析**：从 Issue body 提取 Context, Goal, Constraints, Inputs, Expected Outputs
4. **GitHub API 集成**：支持评论发布、标签管理、Issue 查询
5. **Webhook 接收**：安全接收和验证 GitHub Webhook 事件
6. **Escalation 发布**：将升级请求发布为 Issue 评论和标签
7. **Retry 处理**：自动重试失败任务并发布重试评论
8. **完整测试**：单元测试、集成测试、端到端测试

---

## Scope

### In Scope

#### Core Components（必须实现）

| Component | File | Description |
|-----------|------|-------------|
| **Issue Parser** | `adapters/github-issue/issue-parser.js` | 核心解析逻辑，整合所有解析器 |
| **Label Parser** | `adapters/github-issue/label-parser.js` | 解析 GitHub labels 提取元数据 |
| **Body Parser** | `adapters/github-issue/body-parser.js` | 解析 Issue body sections |
| **GitHub Client** | `adapters/github-issue/github-client.js` | GitHub API 封装（REST/GraphQL） |
| **Webhook Handler** | `adapters/github-issue/webhook-handler.js` | Webhook 接收和验证 |
| **Comment Templates** | `adapters/github-issue/comment-templates.js` | 评论模板（Escalation, Retry, Result） |
| **Retry Handler** | `adapters/github-issue/retry-handler.js` | 重试策略和逻辑 |
| **Main Adapter** | `adapters/github-issue/index.js` | OrchestratorAdapter 接口实现 |
| **Configuration** | `adapters/github-issue/github-issue.config.json` | Adapter 配置 |
| **Schema** | `adapters/schemas/github-issue-payload.schema.json` | Webhook payload schema |

#### Functionality（功能范围）

1. **Input Normalization**
   - Issue → Dispatch Payload 完整转换
   - Label 提取和映射
   - Body section 解析
   - 默认值填充

2. **Validation**
   - Dispatch Payload schema 验证
   - Label 格式验证
   - Body section 完整性检查
   - Required fields 检查

3. **GitHub API Operations**
   - 发布评论（Escalation, Result, Retry）
   - 添加/移除标签
   - 查询 Issue 信息
   - 更新 Issue 状态

4. **Webhook Security**
   - Signature 验证（X-Hub-Signature-256）
   - Event 类型过滤（issues, issue_comment）
   - Action 过滤（opened, edited, labeled）
   - Secret 管理

5. **Escalation Handling**
   - 生成 Escalation 评论
   - 添加 escalation 标签
   - 选项格式化（投票式决策）

6. **Retry Handling**
   - 自动重试决策
   - 重试评论发布
   - 重试次数限制
   - Backoff 策略

7. **Error Mapping**
   - GitHub API 错误 → Execution Status
   - Validation 错误处理
   - Network 错误处理

### Out of Scope

| Item | Reason |
|------|--------|
| 修改 adapters/registry.json 架构 | Feature 020 已完成，仅添加新条目 |
| 修改 OrchestratorAdapter 接口定义 | Feature 020 已完成，直接使用现有接口 |
| GitHub PR Adapter | 单独 feature（022-github-pr-adapter） |
| GitHub App 完整 OAuth 流程 | 使用 PAT 或 App Token，不实现 OAuth 服务器 |
| 多仓库支持（Phase 1） | 先单仓库，后续扩展 |
| Issue 模板自动创建 | 使用 GitHub Issue Templates，不自动创建 |
| Real-time 通知（WebSocket） | 使用 Webhook 轮询模式 |
| 评论回复解析（Phase 1） | 仅解析原始 Issue，后续支持评论链 |

---

## Actors

### Primary Actors

| Actor | Role | Interactions |
|-------|------|--------------|
| **GitHub User** | 创建 Issue 触发任务 | 创建 Issue，添加 labels，填写 body |
| **OpenClaw Manager** | 上游调度器 | 接收 Dispatch Payload，返回 Execution Result |
| **Expert Pack** | 执行层 | 接收 Dispatch Payload，执行任务 |

### System Actors

| Actor | Role | Description |
|-------|------|-------------|
| **GitHub API** | 外部系统 | REST API v3 / GraphQL API v4 |
| **Webhook Server** | 基础设施 | 接收 GitHub Webhook 回调 |
| **Retry Scheduler** | 内部组件 | 管理重试队列和定时器 |

---

## Core Workflows

### Workflow 1: Issue Created → Task Dispatched

```
[GitHub User]                    [Webhook Handler]              [Issue Parser]               [Expert Pack]
     |                                  |                            |                           |
     |  1. Create Issue with labels     |                            |                           |
     |--------------------------------->|                            |                           |
     |                                  |                            |                           |
     |                                  |  2. POST /webhooks/github  |                           |
     |                                  |<---------------------------|                           |
     |                                  |                            |                           |
     |                                  |  3. Verify signature       |                           |
     |                                  |  4. Parse event payload    |                           |
     |                                  |----------------------------|                           |
     |                                  |                            |                           |
     |                                  |                            |  5. normalizeInput()      |
     |                                  |                            |  6. parseLabels()         |
     |                                  |                            |  7. parseBody()           |
     |                                  |                            |----------------------------|
     |                                  |                            |                           |
     |                                  |                            |                           |  8. validateDispatch()
     |                                  |                            |                           |  9. routeToExecution()
     |                                  |                            |                           |
     |                                  |  10. Post ack comment      |                           |
     |<---------------------------------|                            |                           |
```

**Steps:**
1. User 创建 Issue，添加 labels（role:developer, milestone:M001, etc.）
2. GitHub 发送 Webhook POST 请求到 `/webhooks/github`
3. Webhook Handler 验证请求签名（X-Hub-Signature-256）
4. Webhook Handler 解析 event payload（issues.opened）
5. Issue Parser 调用 normalizeInput() 开始转换
6. Label Parser 提取 milestone, role, command, task, risk
7. Body Parser 提取 Context, Goal, Constraints, Inputs, Expected Outputs
8. 验证 Dispatch Payload 完整性
9. 路由到 Expert Pack 执行入口
10. 发布 Acknowledgment 评论到 Issue

### Workflow 2: Execution Complete → Result Posted

```
[Expert Pack]                    [GitHub Client]                [GitHub API]
     |                                  |                            |
     |  1. Return Execution Result      |                            |
     |--------------------------------->|                            |
     |                                  |                            |
     |                                  |  2. Format result comment  |
     |                                  |----------------------------|
     |                                  |                            |
     |                                  |  3. POST /issues/{n}/comments|
     |                                  |---------------------------->
     |                                  |                            |
     |                                  |  4. Add labels (optional)  |
     |                                  |---------------------------->
```

**Steps:**
1. Expert Pack 完成任务，返回 Execution Result
2. GitHub Client 格式化结果为评论模板
3. 调用 GitHub API 发布结果评论
4. 根据需要添加状态标签（status:completed, status:failed 等）

### Workflow 3: Escalation Required → User Decision

```
[Expert Pack]                    [Comment Templates]            [GitHub Client]
     |                                  |                            |
     |  1. FAILED_ESCALATE status       |                            |
     |--------------------------------->|                            |
     |                                  |                            |
     |                                  |  2. Generate escalation comment|
     |                                  |  3. Format options as list |
     |                                  |----------------------------|
     |                                  |                            |
     |                                  |                            |  4. Post escalation comment
     |                                  |                            |  5. Add escalation:needs-decision label
     |<---------------------------------|                            |
     |                                  |                            |
     |  6. Wait for user response       |                            |
     |                                  |                            |
     |                                  |                            |  [User comments decision]
     |                                  |                            |<--
```

**Steps:**
1. Expert Pack 返回 FAILED_ESCALATE 状态
2. Comment Templates 生成 Escalation 评论（包含 blocking points, options）
3. 格式化选项为可点击列表
4. GitHub Client 发布 Escalation 评论
5. 添加 `escalation:needs-decision` 标签
6. 等待用户评论决策
7. 用户评论后，解析决策并继续或终止

### Workflow 4: Execution Failed → Auto Retry

```
[Expert Pack]                    [Retry Handler]                [GitHub Client]
     |                                  |                            |
     |  1. FAILED_RETRYABLE status      |                            |
     |--------------------------------->|                            |
     |                                  |                            |
     |                                  |  2. Check retry_count < max_retry|
     |                                  |  3. Generate retry_context |
     |                                  |----------------------------|
     |                                  |                            |
     |                                  |                            |  4. Post retry comment
     |                                  |                            |  5. Wait backoff period
     |                                  |                            |
     |                                  |  6. Re-dispatch with retry_context|
     |<---------------------------------|                            |
```

**Steps:**
1. Expert Pack 返回 FAILED_RETRYABLE 状态
2. Retry Handler 检查是否达到最大重试次数
3. 生成 retry_context（包含失败原因、修复建议）
4. 发布重试评论到 Issue
5. 等待 backoff 时间（默认 5 分钟）
6. 重新派发任务，携带 retry_context
7. 若超过最大重试次数 → Escalate

---

## Business Rules

### BR-001: Required Labels
Issue 必须至少包含一个 `role:*` 标签才能触发任务派发。

### BR-002: Label Priority
若存在多个 `role:*` 标签，使用第一个；若不存在，使用默认值 `role:developer`。

### BR-003: Body Section Fallback
若 `## Goal` section 缺失，使用 Issue title 作为 goal。

### BR-004: Milestone Extraction
从 `milestone:M###` 标签提取 milestone_id；若标签缺失，检查 Issue 绑定的 GitHub Milestone。

### BR-005: Dispatch ID Format
dispatch_id 格式：`gh-issue-{owner}-{repo}-{issue_number}`（例：`gh-issue-myorg-myrepo-123`）。

### BR-006: Webhook Event Filter
仅处理 `issues` 和 `issue_comment` 事件，忽略其他事件类型。

### BR-007: Webhook Action Filter
仅处理 `opened`, `edited`, `labeled` actions，忽略 `closed`, `deleted` 等。

### BR-008: Comment Template Variables
所有评论模板必须支持变量替换：`{variable_name}`。

### BR-009: Retry Limit
普通任务最大重试 1 次；高风险任务（risk:high/critical）不重试直接 Escalate。

### BR-010: Escalation Label Convention
Escalation 状态使用标签：`escalation:needs-decision`, `escalation:blocked`, `escalation:resolved`。

---

## Non-Functional Requirements

### Performance

| Requirement | Target |
|-------------|--------|
| Webhook 响应时间 | < 500ms (acknowledge) |
| Dispatch Payload 生成 | < 200ms |
| GitHub API 调用延迟 | < 3s (99th percentile) |
| 重试间隔 | 5 minutes (configurable) |

### Security

| Requirement | Implementation |
|-------------|----------------|
| Webhook Secret | HMAC-SHA256 验证 |
| API Token | Environment variable, never in code |
| Token Scope | 最小权限原则（issues:write, issues:read） |
| Rate Limit | 内置退避机制 |

### Reliability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.5% (excluding GitHub API outages) |
| Message Delivery | At-least-once delivery |
| Idempotency | 相同 Issue 多次触发幂等处理 |

---

## Core Components Detail

### 1. Issue Parser (issue-parser.js)

**Responsibility**: 核心解析逻辑，协调 Label Parser 和 Body Parser。

**Interface:**
```javascript
class IssueParser {
  parse(issue) {
    // 1. Parse labels
    // 2. Parse body
    // 3. Build Dispatch Payload
    // 4. Validate
    return dispatchPayload;
  }
}
```

**Key Methods:**
- `normalizeInput(issue)`: Convert GitHub Issue to Dispatch Payload
- `buildDispatchId(issue)`: Generate dispatch_id from issue metadata
- `extractProjectId(issue)`: Extract project_id from repository

---

### 2. Label Parser (label-parser.js)

**Responsibility**: 解析 GitHub Issue labels。

**Interface:**
```javascript
class LabelParser {
  parse(labels) {
    return {
      milestone_id: string | null,
      task_id: string | null,
      role: 'architect' | 'developer' | 'tester' | 'reviewer' | 'docs' | 'security' | null,
      command: string | null,
      risk_level: 'low' | 'medium' | 'high' | 'critical' | null,
      unrecognized_labels: string[]
    };
  }
}
```

**Label Patterns:**
- `milestone:M###` → milestone_id
- `task:T###` → task_id
- `role:{architect|developer|tester|reviewer|docs|security}` → role
- `command:{command_name}` → command
- `risk:{low|medium|high|critical}` → risk_level

---

### 3. Body Parser (body-parser.js)

**Responsibility**: 解析 Issue body markdown sections。

**Interface:**
```javascript
class BodyParser {
  parse(body) {
    return {
      goal: string,
      description: string,
      context: {
        task_scope: string
      },
      constraints: string[],
      inputs: Array<{artifact_id, artifact_type, path, summary}>,
      expected_outputs: string[],
      missing_sections: string[]
    };
  }
}
```

**Section Mapping:**
- `## Context` → context.task_scope
- `## Goal` → goal
- `## Constraints` → constraints (array from list items)
- `## Inputs` → inputs (artifact references)
- `## Expected Outputs` → expected_outputs

---

### 4. GitHub Client (github-client.js)

**Responsibility**: GitHub API 封装。

**Interface:**
```javascript
class GitHubClient {
  // Comments
  async postComment(issueNumber, body);
  async updateComment(commentId, body);
  async deleteComment(commentId);
  
  // Labels
  async addLabel(issueNumber, label);
  async removeLabel(issueNumber, label);
  async listLabels(issueNumber);
  
  // Issues
  async getIssue(issueNumber);
  async updateIssue(issueNumber, updates);
  
  // Rate Limit
  async checkRateLimit();
}
```

**Authentication:**
- Primary: GitHub App Token (JWT + Installation Token)
- Fallback: Personal Access Token (PAT)

---

### 5. Webhook Handler (webhook-handler.js)

**Responsibility**: 接收和验证 GitHub Webhook。

**Interface:**
```javascript
class WebhookHandler {
  // Main handler
  async handleRequest(request, secret);
  
  // Validation
  verifySignature(payload, signature, secret);
  
  // Event handling
  handleIssuesEvent(event);
  handleIssueCommentEvent(event);
  
  // Filtering
  shouldProcessEvent(event);
}
```

**Security:**
- Verify X-Hub-Signature-256 header
- Constant-time comparison to prevent timing attacks

---

### 6. Comment Templates (comment-templates.js)

**Responsibility**: 生成格式化评论。

**Templates:**

**Escalation Comment:**
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

**Retry Comment:**
```markdown
## 🔄 Retry Attempt #{retry_count}

**Previous Failure Reason**: `{previous_failure_reason}`
**Required Fixes**: `{required_fixes}`

Attempting retry with adjusted parameters...

---
*Max retries: {max_retry}. Current: {retry_count}*
```

**Result Comment:**
```markdown
## ✅ Execution Complete

**Status**: `{status}`
**Role**: `{role}`
**Command**: `{command}`

### Summary
{summary}

### Artifacts
{artifacts}

### Next Steps
{recommendation}
```

---

### 7. Retry Handler (retry-handler.js)

**Responsibility**: 管理重试逻辑。

**Interface:**
```javascript
class RetryHandler {
  shouldRetry(retryContext) {
    // Check retry_count < max_retry
    // Check risk_level (high/critical = no retry)
    return { decision: 'retry' | 'abort' | 'escalate' };
  }
  
  buildRetryContext(previousError, executionResult) {
    // Build retry_context for Dispatch Payload
  }
  
  getBackoffDuration(retryCount) {
    // Exponential backoff: 5min, 10min, 20min...
  }
}
```

---

### 8. Main Adapter (index.js)

**Responsibility**: OrchestratorAdapter 接口实现。

**Interface:**
```javascript
class GitHubIssueAdapter implements OrchestratorAdapter {
  // Core methods
  normalizeInput(issue) { /* ... */ }
  validateDispatch(dispatch) { /* ... */ }
  routeToExecution(dispatch) { /* ... */ }
  mapError(error) { /* ... */ }
  
  // Escalation
  generateEscalation(context) { /* ... */ }
  postEscalation(escalation, issueNumber) { /* ... */ }
  
  // Retry
  handleRetry(retryContext) { /* ... */ }
  
  // Metadata
  getAdapterInfo() { /* ... */ }
}
```

---

## GitHub API Integration Strategy

### API Selection

| Use Case | API | Endpoint |
|----------|-----|----------|
| Post comment | REST API v3 | POST /repos/{owner}/{repo}/issues/{number}/comments |
| Update comment | REST API v3 | PATCH /repos/{owner}/{repo}/issues/comments/{id} |
| Add label | REST API v3 | POST /repos/{owner}/{repo}/issues/{number}/labels |
| Remove label | REST API v3 | DELETE /repos/{owner}/{repo}/issues/{number}/labels/{name} |
| Get issue | REST API v3 | GET /repos/{owner}/{repo}/issues/{number} |
| List labels | REST API v3 | GET /repos/{owner}/{repo}/issues/{number}/labels |

### Authentication Strategy

**Primary: GitHub App**
```
1. Generate JWT with App private key
2. Exchange JWT for Installation Access Token
3. Use Installation Token for API calls
4. Token expires after 1 hour (auto-refresh)
```

**Fallback: Personal Access Token (PAT)**
- For development and testing
- Scope: `repo` (full control of private repositories)
- Stored in environment variable: `GITHUB_TOKEN`

### Rate Limiting

GitHub API Limits:
- **Authenticated**: 5,000 requests/hour
- **GitHub App**: 15,000 requests/hour (per installation)

**Mitigation:**
- Track remaining quota via `X-RateLimit-Remaining` header
- Exponential backoff when approaching limit
- Queue non-critical operations

---

## Webhook Security Verification Scheme

### Webhook Endpoint

```
POST /webhooks/github
Content-Type: application/json
X-GitHub-Event: issues
X-GitHub-Delivery: {uuid}
X-Hub-Signature-256: sha256={hex_digest}
```

### Verification Algorithm

```javascript
function verifySignature(payload, signature, secret) {
  // 1. Extract expected signature from header
  const expectedSig = signature.replace('sha256=', '');
  
  // 2. Compute HMAC-SHA256
  const computedSig = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  // 3. Constant-time comparison (prevent timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(expectedSig, 'hex'),
    Buffer.from(computedSig, 'hex')
  );
}
```

### Secret Management

| Environment | Storage | Access |
|-------------|---------|--------|
| Development | `.env` file (gitignored) | Local developer |
| Staging | Environment variable | CI/CD pipeline |
| Production | Secrets manager (AWS Secrets Manager / HashiCorp Vault) | Production service |

### Event Filtering

**Processed Events:**
- `issues.opened` - New Issue created
- `issues.edited` - Issue body/title edited
- `issues.labeled` - Label added/removed
- `issue_comment.created` - New comment (for escalation responses)

**Ignored Events:**
- `issues.closed`, `issues.deleted` - Issue 已关闭/删除
- `issues.assigned`, `issues.unassigned` - 分配变更
- `issues.milestoned`, `issues.demilestoned` - Milestone 变更

---

## Testing Strategy

### Test Levels

| Level | Scope | Tools | Coverage Target |
|-------|-------|-------|-----------------|
| Unit | Individual modules | Jest/Mocha | 90%+ |
| Integration | Module interactions | Jest + nock | 80%+ |
| E2E | Full workflow | Real GitHub repo | Key paths |

### Unit Tests

**issue-parser.test.js**
- Label extraction
- Body section parsing
- Dispatch Payload construction
- Validation error handling

**label-parser.test.js**
- All label patterns
- Multiple labels handling
- Unrecognized labels
- Empty labels

**body-parser.test.js**
- Section extraction
- Missing sections handling
- Malformed markdown
- Edge cases (empty body)

**github-client.test.js**
- API call mocking (nock)
- Error handling
- Rate limit handling
- Token refresh

**webhook-handler.test.js**
- Signature verification
- Event filtering
- Payload parsing
- Security edge cases

### Integration Tests

**test-scenarios/**
- Complete Issue → Dispatch Payload → Result Comment flow
- Escalation workflow with mock GitHub API
- Retry workflow with backoff simulation
- Error recovery scenarios

### E2E Tests

**test-e2e/**
- Real GitHub repository (test-org/test-repo)
- Full workflow automation
- Webhook simulation

---

## Acceptance Criteria

### AC-001: Dispatch Payload Generation
**Given** 一个包含完整 labels 和 body sections 的 GitHub Issue
**When** Webhook 触发并被处理
**Then** 生成符合 io-contract.md §1 的 Dispatch Payload，包含所有 required fields

### AC-002: Label Parsing
**Given** Issue 包含 `role:developer`, `milestone:M001`, `task:T001`, `risk:medium`
**When** 解析 labels
**Then** 正确提取 role=developer, milestone_id=M001, task_id=T001, risk_level=medium

### AC-003: Body Section Parsing
**Given** Issue body 包含 `## Context`, `## Goal`, `## Constraints` sections
**When** 解析 body
**Then** 正确映射到 context.task_scope, goal, constraints

### AC-004: Webhook Security
**Given** 配置了 webhook secret
**When** 接收到带有效签名的 webhook
**Then** 正常处理请求

**Given** 接收到带无效签名的 webhook
**When** 验证签名
**Then** 返回 401 Unauthorized，不处理请求

### AC-005: GitHub API Integration
**Given** 配置了有效的 GitHub Token
**When** 调用 postComment()
**Then** 评论成功发布到 Issue

**Given** 达到 rate limit
**When** 调用 GitHub API
**Then** 自动退避并记录警告

### AC-006: Escalation Comment
**Given** 任务返回 FAILED_ESCALATE 状态
**When** 生成 Escalation
**Then** 发布包含 blocking points, options, recommended actions 的评论

### AC-007: Retry Logic
**Given** 任务返回 FAILED_RETRYABLE 状态，retry_count < max_retry
**When** 处理重试
**Then** 发布重试评论，等待 backoff 时间，重新派发任务

**Given** 任务返回 FAILED_RETRYABLE 状态，retry_count >= max_retry
**When** 处理重试
**Then** 转换为 Escalation

### AC-008: Error Mapping
**Given** GitHub API 返回 404
**When** 调用 mapError()
**Then** 返回 BLOCKED 状态

**Given** GitHub API 返回 422
**When** 调用 mapError()
**Then** 返回 FAILED_RETRYABLE 状态

### AC-009: Configuration
**Given** 存在 `adapters/github-issue/github-issue.config.json`
**When** 加载 adapter
**Then** 正确读取配置并初始化

### AC-010: Interface Compliance
**Given** GitHub Issue Adapter 实现
**When** 检查接口
**Then** 实现所有 OrchestratorAdapter required methods

---

## Assumptions

1. **GitHub API 可用性**：假设 GitHub API 服务可用且稳定
2. **Webhook 基础设施**：假设存在可接收 webhook 的 HTTP 服务器（不内嵌 HTTP server）
3. **Token 管理**：假设 Token 由外部系统管理（adapter 只读取环境变量）
4. **单仓库 Phase 1**：Phase 1 只支持单仓库，多仓库支持后续扩展
5. **Node.js 环境**：适配器运行在 Node.js 18+ 环境
6. **网络可达**：运行环境可以访问 GitHub API (api.github.com)

---

## Open Questions

| Question | Status | Notes |
|----------|--------|-------|
| 是否需要在 Phase 1 支持 issue_comment 事件解析用户决策？ | Open | 当前设计包含，但可简化为仅 issues 事件 |
| 是否需要支持 GitHub Enterprise Server？ | Open | 影响 base URL 配置 |
| Retry 的 backoff 策略是否需要可配置？ | Open | 当前固定 5 分钟 |
| 是否需要支持 issue 模板自动生成 dispatch payload？ | Open | 可通过 `.github/ISSUE_TEMPLATE/` 实现 |
| 是否需要支持并发 Issue 处理？ | Open | Phase 1 建议串行，避免复杂度 |

---

## References

- [ADAPTERS.md](/ADAPTERS.md) - Adapter Architecture
- [io-contract.md](/io-contract.md) - I/O Contract (§1 Dispatch Payload, §4 Escalation, §8 Adapter Interface)
- [docs/adapters/github-issue-adapter-design.md](/docs/adapters/github-issue-adapter-design.md) - Design Document
- [adapters/interfaces/orchestrator-adapter.interface.ts](/adapters/interfaces/orchestrator-adapter.interface.ts) - Interface Definition
- GitHub REST API Documentation: https://docs.github.com/en/rest
- GitHub Webhooks Documentation: https://docs.github.com/en/webhooks

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-28 | Initial spec draft |
