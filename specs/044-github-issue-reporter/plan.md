# Feature: GitHub Issue Reporter - Implementation Plan

## Feature ID
`044-github-issue-reporter`

## Version
`0.1.0`

## Created
2026-04-05

---

## Architecture Summary

### Problem Statement
Feature 043 (error-reporter) 建立了统一的 error-report artifact 格式，但存在可见性问题：
- error-report 存储在文件系统，用户需手动打开文件查看
- Issue 用户看不到错误详情，只有 "Execution Failed" 评论
- Escalation 信息分散，追溯链不直观

### Solution Overview
创建 GitHub Issue Reporter Skill (`github-issue-reporter`)，将 error-report artifact 转换为用户友好的 Issue comment 格式并发布到 GitHub Issue。

### Architecture Pattern
采用 **下游消费模式**：
- error-reporter（上游）生成 error-report artifact
- github-issue-reporter（下游）消费 artifact，发布到 Issue
- 不改变上游 artifact 格式，仅扩展输出渠道

### Module Structure
```
.github-issue-reporter/
├── .opencode/skills/common/github-issue-reporter/
│   └── SKILL.md                   # Skill 定义
├── adapters/github-issue/
│   ├── github-client.js           # 复用现有（Feature 021）
│   └── comment-templates.js       # 扩展：添加 errorComment template
├── scripts/
│   └── report-error-to-issue.js   # CLI 命令
├── lib/github-issue-reporter/
│   ├── issue-association.js       # Issue 关联检测逻辑
│   ├── error-comment-formatter.js # error-report → comment 转换
│   └── publisher.js               # 发布协调器
└── specs/<feature>/
    └── .issue-context.json        # Issue 映射状态（Feature 042）
```

---

## Inputs from Spec

### Core Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | GitHub Issue Reporter Skill 定义 | P0 |
| FR-002 | Error Comment Template 设计 | P0 |
| FR-003 | Issue Association Detection | P0 |
| FR-004 | CLI Command | P1 |
| FR-005 | Comment Format Variants | P1 |
| FR-006 | Execution Result Integration | P2 |

### Acceptance Criteria
| ID | Criteria | Validation |
|----|----------|------------|
| AC-001 | SKILL.md 创建，包含完整输入/输出定义 | Manual review |
| AC-002 | dispatch_id 解析正确，.issue-context.json 映射正确 | Unit tests |
| AC-003 | Template 包含所有 severity 变体 | Visual verification |
| AC-004 | CLI 命令支持 --error-report, --issue, --task | CLI tests |
| AC-005 | 与 github-client.js 集成正确 | Integration tests |
| AC-006 | README 更新 skill 列表 | Documentation review |

---

## Technical Constraints

### Dependencies (TC-001)
| Dependency | Status | Impact |
|------------|--------|--------|
| Feature 043: error-reporter | Complete ✅ | error-report artifact 定义 |
| Feature 021: github-issue-adapter | Complete ✅ | github-client.js |
| Feature 042: issue-lifecycle-automation | Complete ✅ | .issue-context.json |
| Feature 028: issue-status-sync | Complete ✅ | docs role progress posting pattern |
| Node.js 18+ | Required | Runtime |
| GITHUB_TOKEN with `repo` scope | Required | Authentication |

### File Locations (TC-002)
| File | Purpose | Action |
|------|---------|--------|
| `.opencode/skills/common/github-issue-reporter/SKILL.md` | Skill 定义 | Create |
| `scripts/report-error-to-issue.js` | CLI 命令 | Create |
| `lib/github-issue-reporter/*.js` | Core logic | Create |
| `adapters/github-issue/comment-templates.js` | Comment templates | Extend |
| `.issue-context.json` | State tracking | Read/Write (Feature 042) |

---

## Module Decomposition

### Module 1: github-issue-reporter SKILL
**Location**: `.opencode/skills/common/github-issue-reporter/SKILL.md`

**Responsibilities**:
- 定义 skill 输入/输出
- 定义 Comment Template 变体
- 定义与上游/下游协作关系

**Dependencies**:
- error-reporter skill（上游 artifact 来源）
- github-client（API 发布）

---

### Module 2: Issue Association Detector
**Location**: `lib/github-issue-reporter/issue-association.js`

**Responsibilities**:
- 解析 dispatch_id `gh-issue-{owner}-{repo}-{issue_number}` 格式
- 查询 .issue-context.json Task ID → Issue Number 映射
- 处理 CLI `--issue` 参数覆盖

**API**:
```typescript
interface IssueAssociationResult {
  success: boolean;
  issue_number?: number;
  owner?: string;
  repo?: string;
  source: 'dispatch_id' | 'issue_context' | 'cli_param';
  error?: string;
}

function detectIssueAssociation(
  errorReport: ErrorReport,
  cliParams?: { issue?: number; owner?: string; repo?: string }
): IssueAssociationResult;
```

**Resolution Priority** (BR-001):
1. CLI `--issue` 参数（最高）
2. dispatch_id 解析
3. .issue-context.json 映射
4. 返回 `NO_ISSUE_ASSOCIATED` 错误

---

### Module 3: Error Comment Formatter
**Location**: `lib/github-issue-reporter/error-comment-formatter.js`

**Responsibilities**:
- 转换 error-report artifact → GitHub comment markdown
- 根据 severity 选择 comment 格式变体
- 映射 severity 到 badge emoji

**API**:
```typescript
interface ErrorCommentOptions {
  error_report: ErrorReport;
  template_variant: 'detailed' | 'standard' | 'simplified';
}

function formatErrorComment(options: ErrorCommentOptions): string;
```

**Severity Badge Mapping** (FR-002):
| Severity | Badge | Emoji |
|----------|-------|-------|
| low | 🟢 Low | Green |
| medium | 🟡 Medium | Yellow |
| high | 🔴 High | Red |
| critical | 🟠 Critical | Orange |

**Comment Variants** (FR-005):
| Severity | Variant | Sections |
|----------|---------|----------|
| critical/high | detailed | blocking_points, fix_suggestions, impact, recovery |
| medium | standard | error details, recommended_action, simplified impact |
| low | simplified | error summary, source, informational note |

---

### Module 4: Publisher Coordinator
**Location**: `lib/github-issue-reporter/publisher.js`

**Responsibilities**:
- 协调 Issue Association → Formatter → GitHub Client 发布流程
- 处理发布失败重试（3 次）
- 更新 .issue-context.json 发布状态
- 记录 comment_id（用于后续更新）

**API**:
```typescript
interface PublishResult {
  success: boolean;
  comment_url?: string;
  comment_id?: number;
  error?: string;
}

async function publishErrorReport(
  errorReport: ErrorReport,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<PublishResult>;
```

**Idempotency** (BR-003):
- 同一 error_report_id 不重复发布到同一 Issue
- 检查 .issue-context.json 中是否已发布

---

### Module 5: CLI Command
**Location**: `scripts/report-error-to-issue.js`

**Responsibilities**:
- 提供手动发布 error-report 到 Issue 的 CLI 接口
- 支持 `--error-report`, `--issue`, `--task` 参数

**CLI Interface** (FR-004):
```bash
# 发布指定 error-report 到 Issue
node scripts/report-error-to-issue.js \
  --error-report <artifact-path> \
  --owner <owner> --repo <repo> \
  [--issue <number>]

# 使用 Task ID 自动查找 Issue
node scripts/report-error-to-issue.js \
  --error-report <artifact-path> \
  --task <task-id> \
  --owner <owner> --repo <repo>
```

**Output**:
- 成功：返回 comment URL
- 失败：返回错误详情

---

### Module 6: Comment Templates Extension
**Location**: `adapters/github-issue/comment-templates.js`

**Responsibilities**:
- 添加 `errorComment` template method
- 支持 severity 变体渲染

**Extension**:
```javascript
// Add to CommentTemplates class
errorComment(options) {
  const variant = this.selectVariant(options.severity);
  return this.renderErrorTemplate(variant, options);
}
```

---

## Data Flow

### Workflow 1: Automatic Error Report Publication

```
[Role Execution] → [error-reporter] → [error-report artifact]
                                          ↓
                              [github-issue-reporter]
                                          ↓
                          [Issue Association Detection]
                                          ↓
                          [Error Comment Formatting]
                                          ↓
                          [GitHub API POST Comment]
                                          ↓
                          [Update .issue-context.json]
```

### Workflow 2: Manual CLI Publication

```
[CLI User] → [report-error-to-issue.js]
                    ↓
            [Read error-report artifact]
                    ↓
            [Parse CLI params + dispatch_id]
                    ↓
            [Issue Association Detection]
                    ↓
            [Error Comment Formatting]
                    ↓
            [GitHub API POST Comment]
                    ↓
            [Return comment URL to user]
```

### Data Transformation

```
Error Report Artifact (JSON/YAML)
  → Issue Association (detect owner/repo/issue_number)
  → Comment Formatter (select variant, render template)
  → Markdown Comment (string)
  → GitHub API POST
  → Comment URL (string)
```

---

## Failure Handling

### Error Types

| Error Type | Code | Handling |
|------------|------|----------|
| NO_ISSUE_ASSOCIATED | ERR-GIR-001 | 返回错误，建议手动指定 --issue |
| ISSUE_NOT_FOUND | ERR-GIR-002 | 返回 404 详情，建议检查 Issue number |
| PERMISSION_DENIED | ERR-GIR-003 | 返回 403 详情，建议检查 token scope |
| API_RATE_LIMIT | ERR-GIR-004 | 等待重试（复用 github-client backoff） |
| COMMENT_POST_FAILED | ERR-GIR-005 | 重试 3 次，记录失败状态 |

### Retry Strategy
- 复用 `github-client.js` `_requestWithRetry` 方法
- 最大重试 3 次
- Exponential backoff
- Rate limit 等待 reset 时间

### Failure Isolation (NFR-003)
- 发布失败不影响 error-report artifact 本身
- 记录失败状态到 .issue-context.json
- 提供 CLI 命令重试

---

## Validation Strategy

### Unit Tests
| Module | Test Focus |
|--------|------------|
| issue-association.js | dispatch_id 解析，issue_context 查询，CLI param 覆盖 |
| error-comment-formatter.js | severity variant 选择，badge mapping，template rendering |
| publisher.js | 发布流程协调，idempotency 检查 |

### Integration Tests
| Scenario | Test Focus |
|----------|------------|
| Full workflow | error-report → Issue comment → URL 返回 |
| CLI command | 参数解析，error-report 读取，发布 |
| Integration with github-client | API 调用，错误处理 |

### Validation Commands
```bash
# Unit tests
npm test tests/unit/github-issue-reporter/

# Integration tests
npm test tests/integration/github-issue-reporter/

# Manual CLI test
node scripts/report-error-to-issue.js \
  --error-report specs/043/artifacts/error-report-example.json \
  --owner Burburton --repo amazing-specialist-face --issue 42
```

---

## Risks / Tradeoffs

### Risk-001: Issue Association Failure
- **描述**: dispatch_id 不包含 Issue 信息或 .issue-context.json 缺失
- **影响**: 无法自动发布，需手动指定
- **缓解**: 提供手动 CLI 命令，记录关联状态
- **Severity**: medium

### Risk-002: Comment Formatting Variability
- **描述**: GitHub markdown 渲染可能与预期不同
- **影响**: 评论显示不佳
- **缓解**: 测试多种 markdown 格式，使用 GitHub 支持的标准格式
- **Severity**: low

### Risk-003: API Rate Limit
- **描述**: 频繁发布触发 GitHub API 限流
- **影响**: 发布失败
- **缓解**: 复用 github-client rate limit handling，记录发布状态避免重复
- **Severity**: low

### Risk-004: Comment Uniqueness Enforcement
- **描述**: 如何判断同一 error_report_id 是否已发布
- **影响**: 可能重复发布
- **缓解**: 在 .issue-context.json 记录 error_report_id → comment_id 映射
- **Severity**: medium

### Tradeoff-001: Automatic vs Manual Publication
- **选择**: 自动发布（配置可选）
- **原因**: 减少 Issue 用户手动操作步骤
- **代价**: 需增加配置选项，增加复杂度

### Tradeoff-002: Comment Update vs New Comment
- **选择**: 更新现有评论（OQ-002 选项 A）
- **原因**: 避免 Issue 评论过多，保持清晰
- **代价**: 需记录 comment_id，增加状态管理复杂度

---

## Requirement Traceability

### FR-001 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| GitHub Issue Reporter Skill | Module 1 | `.opencode/skills/common/github-issue-reporter/SKILL.md` |

### FR-002 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| Error Comment Template | Module 3 | `lib/github-issue-reporter/error-comment-formatter.js` |
| Severity Badge Mapping | Module 3 | `lib/github-issue-reporter/error-comment-formatter.js` |

### FR-003 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| Issue Association Detection | Module 2 | `lib/github-issue-reporter/issue-association.js` |

### FR-004 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| CLI Command | Module 5 | `scripts/report-error-to-issue.js` |

### FR-005 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| Comment Format Variants | Module 3 | `lib/github-issue-reporter/error-comment-formatter.js` |

### FR-006 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| Execution Result Integration | Module 4 | `lib/github-issue-reporter/publisher.js` |

### AC → Validation
| Acceptance Criteria | Validation Method |
|---------------------|-------------------|
| AC-001 | Manual review + skill template verification |
| AC-002 | Unit tests: issue-association.test.js |
| AC-003 | Visual verification + comment rendering tests |
| AC-004 | CLI integration tests |
| AC-005 | Integration tests with mock GitHub API |
| AC-006 | Documentation review + README check |

---

## Implementation Order

### Phase 1: Skill Definition (M1)
1. 创建 `.opencode/skills/common/github-issue-reporter/SKILL.md`
2. 定义输入/输出/步骤
3. 定义 Comment Template 变体

### Phase 2: Core Logic (M2)
1. 创建 `lib/github-issue-reporter/issue-association.js`
2. 创建 `lib/github-issue-reporter/error-comment-formatter.js`
3. 创建 `lib/github-issue-reporter/publisher.js`

### Phase 3: CLI Command (M3)
1. 创建 `scripts/report-error-to-issue.js`
2. 实现 CLI 参数解析
3. 集成 core logic

### Phase 4: Integration & Testing (M4)
1. 扩展 `comment-templates.js`
2. 集成 github-client
3. 编写单元测试
4. 编写集成测试

### Phase 5: Documentation (M5)
1. 更新 README skill 列表
2. 编写使用示例
3. 更新 docs/skills-usage-guide.md

---

## Open Questions Resolution

### OQ-001: Automatic vs Manual Publication
- **Decision**: 选择选项 A（自动发布）
- **配置**: `auto_publish_to_issue: true` 可选启用
- **Threshold**: 仅 `medium` 及以上 severity 自动发布

### OQ-002: Comment Update vs New Comment
- **Decision**: 选择选项 A（更新现有评论）
- **实现**: 记录 `comment_id` 到 `.issue-context.json`
- **查询**: 通过 `error_report_id` 查找已发布评论

### OQ-003: Severity Threshold Configuration
- **Decision**: 可配置，默认 `medium`
- **配置**: `severity_threshold: "medium"` 在 skill config

### OQ-004: Integration with issue-status-sync
- **Decision**: 职责分离
- **issue-status-sync**: 处理 SUCCESS 状态（docs role）
- **github-issue-reporter**: 处理 FAILURE 状态（common skill）
- **协作**: 两者独立调用，无直接依赖

---

## Assumptions

### A-001: Issue Association Available
- 假设大部分 error-report 能追溯到 Issue（通过 dispatch_id 或 task_id）
- 如果无法追溯，提供手动 CLI 命令
- 验证: 检查现有 dispatch_id 格式是否包含 Issue 信息

### A-002: GitHub Token Available
- 假设运行环境有有效的 GITHUB_TOKEN
- 如果缺失，返回明确错误提示
- 验证: 检查 GITHUB_TOKEN 环境变量

### A-003: Single Issue Per Error
- 假设一个 error-report 只关联一个 Issue
- Phase 1 不支持多 Issue 发布
- Future: 可扩展支持多 Issue

### A-004: error-report Artifact Format Stable
- 假设 error-report artifact 格式由 043 定义，不变
- 直接消费 043 定义的格式
- 验证: 参考 specs/043-error-reporter/contracts/error-report-contract.md

---

## References

- `specs/043-error-reporter/spec.md` - error-reporter feature 定义
- `specs/043-error-reporter/contracts/error-report-contract.md` - error-report artifact contract
- `.opencode/skills/common/error-reporter/SKILL.md` - error-reporter skill
- `specs/021-github-issue-adapter/spec.md` - GitHub Issue Adapter
- `specs/042-issue-lifecycle-automation/spec.md` - Issue lifecycle automation
- `specs/028-issue-status-sync/spec.md` - issue-status-sync skill
- `adapters/github-issue/github-client.js` - GitHub API client
- `adapters/github-issue/comment-templates.js` - Comment templates
- `io-contract.md` §2 - Execution Result Contract

---

## Next Steps

1. `/spec-tasks 044-github-issue-reporter` - 生成任务列表
2. `/spec-implement 044-github-issue-reporter T-044-001` - 开始实现第一个任务