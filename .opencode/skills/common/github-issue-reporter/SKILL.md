# Skill: github-issue-reporter

## Skill Name
`github-issue-reporter`

## Version
`1.0.0`

## Producer Role
`common` (所有角色可用)

## Purpose

将 `error-report` artifact 发布到 GitHub Issue，使用户能直观看到错误详情、严重程度和处理建议，无需翻阅文件系统中的 artifact 文件。

**核心职责**：
- 消费 error-report artifact（上游）
- 检测 Issue 关联（dispatch_id, .issue-context.json, CLI params）
- 格式化错误信息为 Issue comment（基于 severity 选择格式变体）
- 发布评论到 GitHub Issue（通过 github-client）
- 更新 .issue-context.json 发布状态

**与 error-reporter 的关系**：
- error-reporter（上游）生成 error-report artifact
- github-issue-reporter（下游）消费 artifact，发布到 Issue
- 不改变上游 artifact 格式，仅扩展输出渠道

---

## When to Use

| 场景 | 是否使用 | 说明 |
|------|---------|------|
| error-report artifact 生成 | ✅ 是 | 任何 error-report artifact 生成后可发布 |
| Issue 用户需查看错误详情 | ✅ 是 | 将错误信息发布到 Issue 评论 |
| Escalation 信息需可见 | ✅ 是 | 发布 blocking points 和 options 到 Issue |
| 手动 CLI 发布 | ✅ 是 | 用户通过 CLI 手动发布 error-report |
| 自动发布配置启用 | ✅ 是 | execution-reporting 配置 auto_publish_to_issue |

---

## Inputs

### Required Inputs

| Input | Type | Description | Source |
|-------|------|-------------|--------|
| `error_report` | artifact | error-report artifact (JSON/YAML) | error-reporter skill |
| `owner` | string | GitHub repository owner | CLI params / dispatch_id |
| `repo` | string | GitHub repository name | CLI params / dispatch_id |

**error_report artifact 结构**（来自 Feature 043）：
```yaml
artifact_id: string            # error-report ID
artifact_type: error-report    # 固定值

error_context:
  dispatch_id: string          # dispatch ID（可能包含 Issue 信息）
  task_id: string              # task ID（用于 .issue-context.json lookup）
  role: string                 # 报告角色
  execution_phase: string      # 执行阶段

error_classification:
  error_type: enum             # 8 种错误类型之一
  error_subtype: string        # 细化描述
  severity: enum               # low/medium/high/critical

error_details:
  title: string                # 错误标题
  description: string          # 详细描述
  error_code: string           # ERR-[ROLE]-[NUMBER]
  stacktrace_or_context: string

impact_assessment:
  blocking_points: array       # 阻塞点列表
  downstream_impact: enum      # none/delayed/blocked/cascading
  milestone_impact: enum       # none/at_risk/delay/blocked

traceability:
  source_artifact: string      # 来源 artifact
  source_file: string          # 来源文件
  source_line: number          # 来源行号

resolution_guidance:
  auto_recoverable: boolean    # 是否可自动恢复
  recommended_action: enum     # IGNORE/RETRY/REWORK/REPLAN/ESCALATE
  fix_suggestions: array       # 修复建议
  estimated_fix_effort: string

metadata:
  created_at: string           # ISO timestamp
  created_by_role: string      # 创建角色
  retry_count: number          # 返工次数
```

### Optional Inputs

| Input | Type | Description | Source |
|-------|------|-------------|--------|
| `issue_number` | number | Issue number (CLI override) | CLI --issue param |
| `issue_context` | object | .issue-context.json 内容 | Feature 042 |
| `auto_publish_config` | object | 自动发布配置 | execution-reporting config |

**auto_publish_config 结构**（可选输入）：
```yaml
auto_publish_to_issue: boolean    # 是否自动发布
severity_threshold: enum          # low/medium/high/critical
```

---

## Steps

### Step 1: 读取 error-report artifact

**目标**：读取并解析 error-report artifact。

**活动**：
1. 从文件路径或 artifact-reading skill 获取 error-report
2. 解析 JSON/YAML 格式
3. 提取关键字段：
   - error_context.dispatch_id
   - error_context.task_id
   - error_classification.severity
   - error_details (title, description, error_code)
   - impact_assessment.blocking_points
   - resolution_guidance (recommended_action, fix_suggestions)
   - metadata.created_at

**验证**：
- artifact_type 必须为 `error-report`
- 必需字段完整性检查
- 格式符合 error-report-contract.md

**输出**：解析后的 error_report object。

---

### Step 2: 检测 Issue 关联

**目标**：确定 error-report 应发布到哪个 Issue。

**Resolution Priority** (BR-001):
1. CLI `--issue` 参数（最高优先级）
2. dispatch_id 解析（`gh-issue-{owner}-{repo}-{issue_number}` 格式）
3. .issue-context.json Task ID → Issue Number 映射
4. 返回 NO_ISSUE_ASSOCIATED 错误

**dispatch_id 解析逻辑**：
```typescript
function parseDispatchId(dispatchId: string): IssueInfo | null {
  const regex = /^gh-issue-([^-]+)-([^-]+)-(\d+)$/;
  const match = dispatchId.match(regex);
  if (match) {
    return {
      owner: match[1],
      repo: match[2],
      issue_number: parseInt(match[3])
    };
  }
  return null;
}
```

**.issue-context.json lookup 逻辑**：
```typescript
function lookupIssueByTaskId(issueContext: IssueContext, taskId: string): number | null {
  if (issueContext.issues && issueContext.issues[taskId]) {
    return issueContext.issues[taskId].number;
  }
  return null;
}
```

**CLI 参数覆盖**：
- `--issue <number>` 直接指定 Issue number
- `--task <task-id>` 通过 Task ID lookup
- CLI 参数优先级高于 dispatch_id 和 issue_context

**输出**：`IssueAssociationResult`
```typescript
interface IssueAssociationResult {
  success: boolean;
  issue_number?: number;
  owner?: string;
  repo?: string;
  source: 'dispatch_id' | 'issue_context' | 'cli_param';
  error?: string;  // NO_ISSUE_ASSOCIATED
}
```

---

### Step 3: 选择 Comment 格式变体

**目标**：根据 severity 选择 comment 格式。

**Severity Badge Mapping** (FR-002):

| Severity | Badge | Emoji |
|----------|-------|-------|
| low | 🟢 Low | Green circle |
| medium | 🟡 Medium | Yellow circle |
| high | 🔴 High | Red circle |
| critical | 🟠 Critical | Orange circle |

**Comment Variants** (FR-005):

| Severity | Variant | Sections |
|----------|---------|----------|
| critical/high | detailed | full content: blocking_points, fix_suggestions, impact, recovery |
| medium | standard | error details, recommended_action, simplified impact |
| low | simplified | error summary, source, informational note |

**选择逻辑**：
```typescript
function selectCommentVariant(severity: Severity): CommentVariant {
  if (severity === 'critical' || severity === 'high') return 'detailed';
  if (severity === 'medium') return 'standard';
  return 'simplified';  // low
}
```

---

### Step 4: 格式化 Comment

**目标**：渲染 GitHub markdown comment。

**Template Variables** (FR-002):
```markdown
## 🚨 Error Report: {error_code}

**Severity**: {severity_badge}
**Error Type**: {error_type}
**Role**: {role}

### 📋 Error Summary
{title}

{description}

### 🚫 Blocking Points
{blocking_points_list}

### 📍 Source
{source_reference}

### 🔧 Recommended Action
**Action**: {recommended_action}

{fix_suggestions}

### ⏱️ Impact Assessment
- **Downstream Impact**: {downstream_impact}
- **Milestone Impact**: {milestone_impact}

### 📊 Recovery
- **Auto-Recoverable**: {auto_recoverable}
- **Retry Count**: {retry_count}/{max_retry}

---
*Error ID: {error_report_id}*
*Reported by: {role} role at {created_at}*
```

**Variable Mapping**：
```typescript
interface TemplateVariables {
  error_code: string;
  severity_badge: string;  // 🟢/🟡/🔴/🟠 + severity
  error_type: string;
  role: string;
  title: string;
  description: string;
  blocking_points_list: string;  // formatted as markdown list
  source_reference: string;      // file:line or artifact ID
  recommended_action: string;
  fix_suggestions: string;       // formatted as markdown list
  downstream_impact: string;
  milestone_impact: string;
  auto_recoverable: string;      // Yes/No
  retry_count: number;
  max_retry: number;             // 3 (configurable)
  error_report_id: string;
  created_at: string;
}
```

**Markdown 格式要求** (BR-005):
- 使用 GitHub 支持的标准 markdown
- 不使用 unsupported features（如 custom CSS, LaTeX）
- Emoji 使用 UTF-8 标准 emoji
- 确保正确渲染

**输出**：格式化的 markdown comment string。

---

### Step 5: 发布 Comment

**目标**：通过 github-client 发布评论。

**幂等性检查** (BR-003):
```typescript
function checkIdempotency(issueContext: IssueContext, errorReportId: string): number | null {
  // 检查 .issue-context.json 是否已发布此 error_report_id
  if (issueContext.published_errors && issueContext.published_errors[errorReportId]) {
    return issueContext.published_errors[errorReportId].comment_id;
  }
  return null;
}
```

**发布逻辑**：
```typescript
async function publishComment(
  owner: string, 
  repo: string, 
  issueNumber: number, 
  body: string, 
  existingCommentId?: number
): Promise<CommentResult> {
  if (existingCommentId) {
    // 更新现有评论 (BR-004)
    return githubClient.updateComment(owner, repo, existingCommentId, body);
  } else {
    // 创建新评论
    return githubClient.createComment(owner, repo, issueNumber, body);
  }
}
```

**Retry Strategy** (NFR-003):
- 复用 github-client `_requestWithRetry` 方法
- 最大重试 3 次
- Exponential backoff
- Rate limit 等待 reset 时间

**输出**：`CommentResult`
```typescript
interface CommentResult {
  success: boolean;
  comment_url?: string;
  comment_id?: number;
  error?: string;
}
```

---

### Step 6: 更新 .issue-context.json

**目标**：记录发布状态，支持后续更新和幂等性检查。

**更新内容**：
```yaml
published_errors:
  {error_report_id}:
    comment_id: number           # 评论 ID
    issue_number: number         # Issue number
    published_at: string         # ISO timestamp
    severity: enum               # severity
    status: enum                 # published/failed
```

**写入逻辑**：
```typescript
function updateIssueContext(
  issueContext: IssueContext,
  errorReportId: string,
  commentId: number,
  issueNumber: number,
  status: 'published' | 'failed'
): void {
  if (!issueContext.published_errors) {
    issueContext.published_errors = {};
  }
  issueContext.published_errors[errorReportId] = {
    comment_id: commentId,
    issue_number: issueNumber,
    published_at: new Date().toISOString(),
    severity: errorReport.error_classification.severity,
    status: status
  };
  // 写入文件
  fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext, null, 2));
}
```

**失败处理** (NFR-003):
- 发布失败时记录 status: 'failed'
- 提供 CLI 命令重试
- 不影响 error-report artifact 本身

---

## Outputs

### Primary Output

| Output | Type | Description |
|--------|------|-------------|
| `comment_url` | string | GitHub Issue comment URL |
| `.issue-context.json update` | file | 发布状态记录 |

---

## Error Handling

### Error Types

| Error Type | Code | Handling | Severity |
|------------|------|----------|----------|
| NO_ISSUE_ASSOCIATED | ERR-GIR-001 | 返回错误，建议手动指定 --issue | blocker |
| ISSUE_NOT_FOUND | ERR-GIR-002 | 返回 404 详情，建议检查 Issue number | major |
| PERMISSION_DENIED | ERR-GIR-003 | 返回 403 详情，建议检查 token scope | blocker |
| API_RATE_LIMIT | ERR-GIR-004 | 等待重试（复用 github-client backoff） | medium |
| COMMENT_POST_FAILED | ERR-GIR-005 | 重试 3 次，记录失败状态 | medium |

**错误响应格式**：
```typescript
interface ErrorResponse {
  success: false;
  error_code: string;
  error_message: string;
  suggestion: string;
  retry_available: boolean;
}
```

---

## Configuration Options

### auto_publish_to_issue

**类型**: `boolean`  
**默认值**: `false`  
**说明**: 是否自动发布 error-report 到 Issue。

**配置位置**: execution-reporting skill config

### severity_threshold

**类型**: `enum` (low/medium/high/critical)  
**默认值**: `medium`  
**说明**: 自动发布的 severity threshold。仅 threshold 及以上 severity 自动发布。

**配置位置**: execution-reporting skill config

### max_retry

**类型**: `number`  
**默认值**: `3`  
**说明**: Comment 发布最大重试次数。

---

## Integration Notes

### 与 error-reporter 协作

**协作流程**：
```
error-reporter (上游)
  -> 输出: error-report artifact
  -> github-issue-reporter (下游)
    -> 输入: error-report artifact
    -> 输出: Issue comment + .issue-context.json update
```

**职责边界**：
- error-reporter: 生成标准化 error-report artifact
- github-issue-reporter: 消费 artifact，发布到 Issue

### 与 execution-reporting 协作

**协作流程**：
```
execution-reporting
  -> 输入: execution result + error-report artifacts
  -> 可选输出: 调用 github-issue-reporter 发布到 Issue
  -> 条件: dispatch_id 包含 Issue 关联 OR 配置 auto_publish_to_issue
```

**配置示例**：
```json
{
  "auto_publish_to_issue": true,
  "severity_threshold": "medium"
}
```

### 与 issue-status-sync 协作

**职责分离**：
- issue-status-sync (docs role): 发布 SUCCESS 状态的进度评论
- github-issue-reporter (common skill): 发布 FAILURE 状态的错误评论
- 两者独立调用，无直接依赖

### 与 github-client 协作

**API Methods Used**:
- `createComment(owner, repo, issueNumber, body)` - 创建新评论
- `updateComment(owner, repo, commentId, body)` - 更新现有评论
- `_requestWithRetry` - 复用 retry 机制

---

## Self-Check Checklist

完成 error-report 发布后，验证以下项：

- [ ] error-report artifact 读取成功
- [ ] Issue association 检测正确（owner, repo, issue_number）
- [ ] Comment variant 选择正确（基于 severity）
- [ ] Severity badge 映射正确
- [ ] Markdown 格式符合 GitHub 支持
- [ ] Comment 发布成功（返回 comment_url）
- [ ] .issue-context.json 更新成功（记录 comment_id）
- [ ] 幂等性检查正确（不重复发布）
- [ ] 失败时记录状态，不影响 artifact

---

## Examples

### Example 1: Automatic Publication (dispatch_id)

**输入**：
```yaml
error_report:
  artifact_id: ERR-20260405123000-abc123
  error_context:
    dispatch_id: gh-issue-anomalyco-amazing-specialists-42
    task_id: T-044-003
    role: architect
  error_classification:
    severity: high
    error_type: INPUT_INVALID
  error_details:
    title: "Missing spec section"
    description: "spec.md does not contain Acceptance Criteria section"
    error_code: ERR-ARCH-001
  impact_assessment:
    blocking_points: ["Cannot define design success criteria"]
    downstream_impact: blocked
    milestone_impact: delay
  resolution_guidance:
    recommended_action: REWORK
    fix_suggestions: ["Add Acceptance Criteria section"]
  metadata:
    created_at: 2026-04-05T12:30:00Z
```

**Issue Association Detection**:
- dispatch_id: `gh-issue-anomalyco-amazing-specialists-42`
- 解析结果: owner=anomalyco, repo=amazing-specialists, issue_number=42
- Source: dispatch_id

**Comment Variant**: detailed (severity=high)

**Comment Output**:
```markdown
## 🚨 Error Report: ERR-ARCH-001

**Severity**: 🔴 High
**Error Type**: INPUT_INVALID
**Role**: architect

### 📋 Error Summary
Missing spec section: acceptance criteria

The spec.md file does not contain a valid Acceptance Criteria section. Unable to proceed with design.

### 🚫 Blocking Points
- Cannot define design success criteria without acceptance criteria

### 📍 Source
File: specs/my-feature/spec.md:45

### 🔧 Recommended Action
**Action**: REWORK

Fix suggestions:
- Add Acceptance Criteria section to spec.md
- Define at least 3 testable acceptance criteria

### ⏱️ Impact Assessment
- **Downstream Impact**: blocked
- **Milestone Impact**: delay

### 📊 Recovery
- **Auto-Recoverable**: No
- **Retry Count**: 0/3

---
*Error ID: ERR-20260405123000-abc123*
*Reported by: architect role at 2026-04-05T12:30:00Z*
```

**发布结果**：
- Comment URL: https://github.com/anomalyco/amazing-specialists/issues/42#issuecomment-123456
- Comment ID: 123456
- .issue-context.json 更新成功

---

### Example 2: Manual CLI Publication

**CLI Command**:
```bash
node scripts/report-error-to-issue.js \
  --error-report specs/044/artifacts/error-report-example.json \
  --owner anomalyco \
  --repo amazing-specialists \
  --issue 42
```

**流程**：
1. Read error-report artifact from file path
2. Parse CLI params: --issue=42, --owner=anomalyco, --repo=amazing-specialists
3. Issue Association: CLI param override (issue_number=42)
4. Format comment based on severity
5. Publish via github-client
6. Return comment URL to user

**输出**：
```json
{
  "success": true,
  "comment_url": "https://github.com/anomalyco/amazing-specialists/issues/42#issuecomment-123457",
  "comment_id": 123457
}
```

---

### Example 3: No Issue Associated

**输入**：
```yaml
error_report:
  artifact_id: ERR-20260405150000-def456
  error_context:
    dispatch_id: disp-001
    task_id: task-arch-001
    role: architect
  # dispatch_id 不包含 Issue 信息
```

**Issue Association Detection**:
- dispatch_id: `disp-001` (无法解析)
- .issue-context.json: Task ID `task-arch-001` 未找到
- 结果: NO_ISSUE_ASSOCIATED

**错误响应**：
```json
{
  "success": false,
  "error_code": "ERR-GIR-001",
  "error_message": "No Issue associated with error-report",
  "suggestion": "Use --issue CLI parameter to specify Issue number",
  "retry_available": false
}
```

---

### Example 4: Comment Update (Existing)

**场景**: 同一 error_report_id 已发布过评论，内容变更后再次发布。

**幂等性检查**:
```yaml
published_errors:
  ERR-20260405123000-abc123:
    comment_id: 123456
    issue_number: 42
```

**逻辑**:
- 检测到 existing comment_id: 123456
- 使用 updateComment API 而非 createComment
- 更新 .issue-context.json published_at

**输出**:
- Comment URL unchanged
- Comment content updated
- .issue-context.json updated_at timestamp

---

## References

- `specs/043-error-reporter/contracts/error-report-contract.md` - Error Report artifact format
- `specs/042-issue-lifecycle-automation/spec.md` - .issue-context.json schema
- `specs/044-github-issue-reporter/spec.md` - Feature specification
- `specs/044-github-issue-reporter/plan.md` - Implementation plan
- `adapters/github-issue/github-client.js` - GitHub API client
- `adapters/github-issue/comment-templates.js` - Comment templates reference
- `io-contract.md` §2 - Execution Result Contract