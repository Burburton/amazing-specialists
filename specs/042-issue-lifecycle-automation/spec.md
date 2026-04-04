# Feature: Issue Lifecycle Automation

## Feature ID
`042-issue-lifecycle-automation`

## Status
`draft`

## Version
`1.0.0`

## Created
2026-04-04

## Overview

### Goal
增强 GitHub Issue Adapter 的 Issue 生命周期管理能力，提供完整的创建、查询、关闭自动化流程，消除手动管理 Issue 编号导致的错误风险。

### Background
在实际使用 GitHub Issue Workflow 时发现以下问题：

1. **Issue 编号管理困难** - 创建 Issue 时不知道编号，无法在模板中预填 `Closes #XX`
2. **编号容易写错** - Commit 时手动填写编号容易出错（如 Issue #28 写成 #27）
3. **缺少按 Task ID 操作的能力** - 无法通过 `task:T-B007` 直接关闭 Issue
4. **缺少状态追踪** - 没有 Issue 与 Task ID 的映射记录
5. **错误恢复困难** - Issue 创建成功但后续失败时难以追溯

### Scope

**In Scope:**
- `GitHubClient` 增强：createIssue, searchIssues, closeIssue 等方法
- `process-issue.js` 增强：create, close, status, list 子命令
- Issue 模板更新：使用 Task ID 替代 Issue 编号
- 状态文件：`.issue-context.json` 追踪 Issue 映射
- 错误处理与幂等性保证

**Out of Scope:**
- Webhook 自动化（现有 Feature 037 已覆盖）
- CI/CD 集成
- 多项目管理

---

## Requirements

### Functional Requirements

#### FR-001: GitHubClient Enhancement

新增以下方法到 `adapters/github-issue/github-client.js`：

| Method | Purpose | API Endpoint |
|--------|---------|--------------|
| `createIssue()` | 创建新 Issue | POST /repos/{owner}/{repo}/issues |
| `searchIssues()` | 按 label 搜索 Issues | GET /repos/{owner}/{repo}/issues |
| `updateIssue()` | 更新 Issue | PATCH /repos/{owner}/{repo}/issues/{number} |
| `closeIssue()` | 关闭 Issue | PATCH with state: 'closed' |
| `reopenIssue()` | 重新打开 Issue | PATCH with state: 'open' |

#### FR-002: Issue Lifecycle Commands

新增子命令到 `scripts/process-issue.js`：

```bash
# 创建 Issue
node scripts/process-issue.js create \
  --owner <owner> --repo <repo> \
  --task <task-id> --title "<title>" \
  [--role <role>] [--risk <level>] [--milestone <milestone>] \
  [--body-file <path>] [--body "<markdown>"]

# 按 Task ID 关闭 Issue
node scripts/process-issue.js close \
  --owner <owner> --repo <repo> \
  --task <task-id> [--comment "<markdown>"]

# 查询 Issue 状态
node scripts/process-issue.js status \
  --owner <owner> --repo <repo> \
  --task <task-id>

# 列出 Issues
node scripts/process-issue.js list \
  --owner <owner> --repo <repo> \
  [--label <label>] [--state <open|closed|all>]
```

#### FR-003: Issue Context Tracking

创建 `.issue-context.json` 状态文件：

```json
{
  "version": "1.0.0",
  "project": "<repo>",
  "owner": "<owner>",
  "issues": {
    "<task-id>": {
      "number": 28,
      "url": "https://github.com/owner/repo/issues/28",
      "status": "open|closed",
      "created_at": "2026-04-04T12:00:00Z",
      "closed_at": null,
      "commit_sha": null
    }
  },
  "lastUpdated": "2026-04-04T12:00:00Z"
}
```

#### FR-004: Issue Template Update

更新 `.github/ISSUE_TEMPLATE/task.md`：

**Before:**
```markdown
git commit -m "feat(T-XXX): Brief description
Closes #XX"
```

**After:**
```markdown
## Post-completion

### Option A: Close by Task ID (Recommended)
node scripts/process-issue.js close \
  --owner <owner> --repo <repo> \
  --task T-XXX --comment "✅ Completed"

### Option B: Commit with Issue Number
After creating this issue, note the issue number: #____

git commit -m "feat(T-XXX): Brief description
Closes #ACTUAL_NUMBER"
```

#### FR-005: Idempotency Guarantee

所有操作必须是幂等的：

| Operation | Idempotency |
|-----------|-------------|
| `create --task T-XXX` | 如果已存在，返回现有 Issue，不重复创建 |
| `close --task T-XXX` | 如果已关闭，返回成功，不报错 |
| `status --task T-XXX` | 总是返回当前状态 |

#### FR-006: Error Handling

| Error Type | Handling |
|------------|----------|
| Rate Limit | 自动等待后重试 |
| Permission Denied | 明确提示权限不足，列出需要的 scope |
| Network Error | 重试 3 次，指数退避 |
| Issue Not Found | 提示使用 `create` 命令创建 |
| Multiple Issues Found | 警告并选择第一个 |

---

## Non-Functional Requirements

### NFR-001: Backward Compatibility
- 现有 `process-issue.js --issue <number>` 继续可用
- 现有 Issue 模板格式继续有效

### NFR-002: Performance
- Issue 创建 < 2s
- Issue 搜索 < 1s
- 状态文件读写 < 100ms

### NFR-003: Reliability
- 状态文件损坏时自动重建
- API 失败时不丢失已创建 Issue 信息

---

## Acceptance Criteria

### AC-001: GitHubClient Enhancement
- [ ] `createIssue()` 可创建 Issue 并返回编号
- [ ] `searchIssues()` 可按 label 过滤
- [ ] `closeIssue()` 可关闭 Issue
- [ ] 所有方法有单元测试

### AC-002: CLI Commands
- [ ] `create` 命令可创建 Issue 并记录到状态文件
- [ ] `close` 命令可按 Task ID 关闭 Issue
- [ ] `status` 命令可查询 Issue 状态
- [ ] `list` 命令可列出 Issues

### AC-003: Idempotency
- [ ] 重复 `create` 返回现有 Issue
- [ ] 重复 `close` 返回成功
- [ ] 状态文件正确更新

### AC-004: Error Handling
- [ ] Rate limit 自动重试
- [ ] 权限错误明确提示
- [ ] 网络错误重试 3 次

### AC-005: Documentation
- [ ] README 更新命令说明
- [ ] Issue 模板更新
- [ ] 使用示例文档

---

## Technical Constraints

### TC-001: Dependencies
- Node.js 18+
- 现有 `github-client.js` 架构
- `minimist` CLI 解析（已有）

### TC-002: File Locations
- `adapters/github-issue/github-client.js` - 增强
- `scripts/process-issue.js` - 增强
- `.github/ISSUE_TEMPLATE/task.md` - 更新
- `docs/issue-lifecycle.md` - 新增（可选）

---

## Dependencies

### Internal
- Feature 037: GitHub Issue Workflow Enhancement（已完成）

### External
- GitHub REST API v3
- GITHUB_TOKEN with `repo` scope

---

## Risks

### Risk-001: State File Conflicts
- **描述**: 多人同时操作时状态文件冲突
- **影响**: 数据不一致
- **缓解**: 使用 Git 追踪状态文件，冲突时手动合并

### Risk-002: API Rate Limit
- **描述**: 频繁操作触发限流
- **影响**: 操作失败
- **缓解**: 内置重试机制，显示剩余配额

---

## Milestones

### M1: GitHubClient Enhancement
- 新增 createIssue, searchIssues, closeIssue 方法
- 单元测试

### M2: CLI Commands
- create, close, status, list 子命令
- 集成测试

### M3: Documentation & Template
- Issue 模板更新
- README 更新

---

## References

- `adapters/github-issue/README.md`
- `adapters/github-issue/github-client.js`
- `scripts/process-issue.js`
- `specs/037-github-issue-workflow-enhancement/spec.md`
- [GitHub REST API - Issues](https://docs.github.com/en/rest/issues)