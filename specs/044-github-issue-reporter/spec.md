# Feature: GitHub Issue Reporter

## Feature ID
`044-github-issue-reporter`

## Status
`complete`

## Version
`0.1.0`

## Created
2026-04-05

## Overview

### Goal
将执行层产生的 `error-report` artifact 发布到 GitHub Issue，使用户能直观看到错误详情、严重程度和处理建议，无需翻阅文件系统中的 artifact 文件。

### Background
Feature 043 (error-reporter) 建立了统一的 error-report artifact 格式，但当前存在可见性问题：

1. **error-report 存储在文件系统** - 用户需手动打开 `specs/<feature>/artifacts/error-report-*.md` 或 JSON 文件查看
2. **Issue 用户看不到错误详情** - GitHub Issue 触发的任务失败后，Issue 上只有 "Execution Failed" 评论，缺少具体错误信息
3. **Escalation 信息分散** - 升级请求的 blocking points、options 在文件中，Issue 评论只说"需要决策"
4. **追溯链不直观** - error_report_id 关联在 issues_found 中，但用户无法快速定位

**痛点**：
- Issue 用户需要额外步骤才能理解错误
- 错误严重程度、推荐动作不够直观
- 缺少"一键查看错误详情"的用户体验
- error-report 和 Issue comment 之间存在断层

### Scope

**In Scope:**
- GitHub Issue Reporter Skill 定义（common skill）
- error-report → Issue comment 转换逻辑
- Error Comment Template 设计（支持 severity 高亮）
- 与 GitHub Issue Adapter 的集成（复用 github-client.js）
- 与 error-reporter skill 的协作关系（下游消费）
- CLI 命令支持（手动发布 error-report 到 Issue）
- Error Comment Schema（可选）

**Out of Scope:**
- 改变 error-report artifact 格式（由 043 定义）
- 自动 Issue 创建（由 042 lifecycle automation 处理）
- Issue 关闭逻辑（由 management acceptance 处理）
- OpenClaw 适配层变更（使用现有 adapter）
- 多 Issue 同时发布（Phase 1 单 Issue）

---

## Requirements

### Functional Requirements

#### FR-001: GitHub Issue Reporter Skill

新增 common skill：`github-issue-reporter`，用于将 error-report artifact 发布到 GitHub Issue。

**Skill Purpose:**
- 接收 error-report artifact 作为输入
- 转换为用户友好的 Issue comment 格式
- 发布评论到关联的 GitHub Issue
- 支持手动 CLI 调用

**Skill Location:**
`.opencode/skills/common/github-issue-reporter/SKILL.md`

**Skill Integration:**
- 与 `error-reporter` 协作：error-reporter 生成 artifact，github-issue-reporter 发布到 Issue
- 与 `execution-reporting` 协作：作为 Execution Result 的可选下游输出
- 与 `github-client` 协作：复用现有的 GitHub API 封装

#### FR-002: Error Comment Template

定义 error-report 到 Issue comment 的转换模板。

**Template Variables:**
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

**Severity Badge Mapping:**
| Severity | Badge | Color (GitHub) |
|----------|-------|----------------|
| low | 🟢 Low | Green circle |
| medium | 🟡 Medium | Yellow circle |
| high | 🔴 High | Red circle |
| critical | 🟠 Critical | Orange circle |

#### FR-003: Issue Association Detection

检测 error-report 应发布到哪个 Issue。

**Association Sources:**
1. `error_context.dispatch_id` - 解析 `gh-issue-{owner}-{repo}-{issue_number}` 格式
2. `specs/<feature>/.issue-context.json` - Task ID → Issue Number 映射
3. CLI 参数 - 手动指定 `--issue <number>`

**Resolution Priority:**
1. CLI `--issue` 参数（最高优先级）
2. dispatch_id 解析
3. .issue-context.json 映射
4. 错误：无法确定 Issue 时返回 `NO_ISSUE_ASSOCIATED`

#### FR-004: CLI Command

新增 CLI 命令支持手动发布 error-report。

```bash
# 发布 error-report 到 Issue
node scripts/report-error-to-issue.js \
  --error-report <artifact-path> \
  --owner <owner> --repo <repo> \
  [--issue <number>]

# 或使用 Task ID 自动查找 Issue
node scripts/report-error-to-issue.js \
  --error-report <artifact-path> \
  --task <task-id> \
  --owner <owner> --repo <repo>
```

**Output:**
- 成功：返回 comment URL
- 失败：返回错误详情（Issue not found, Permission denied, etc.）

#### FR-005: Comment Format Variants

根据 severity 选择不同的 comment 格式。

**critical/high severity (详细格式):**
- 包含完整的 blocking_points, fix_suggestions, impact
- 使用醒目的 emoji 和格式

**medium severity (标准格式):**
- 包含 error details 和 recommended_action
- 简化 impact 和 recovery 部分

**low severity (简化格式):**
- 仅包含 error summary 和 source
- 标注为"informational"

#### FR-006: Execution Result Integration

增强 execution-reporting skill 的可选输出。

**Integration Point:**
```
execution-reporting
  -> 输入: execution result + error-report artifacts
  -> 可选输出: 调用 github-issue-reporter 发布到 Issue
  -> 条件: dispatch_id 包含 Issue 关联 OR 配置强制发布
```

**配置选项:**
```json
{
  "auto_publish_to_issue": true,  // 自动发布 error-report 到 Issue
  "severity_threshold": "medium"  // 仅 medium+ severity 发布
}
```

---

## Non-Functional Requirements

### NFR-001: Backward Compatibility
- error-report artifact 格式不变（由 043 定义）
- GitHub Client API 不变（复用 021 adapter）
- 不影响现有 execution-reporting 流程

### NFR-002: Performance
- Comment 生成 < 50ms
- GitHub API 发布 < 2s
- Issue association 检测 < 100ms

### NFR-003: Reliability
- 发布失败时不影响 error-report artifact 本身
- 提供重试机制（3 次）
- 记录发布状态到 .issue-context.json

### NFR-004: Usability
- Comment 格式清晰易读
- Severity 直观可见
- 追溯信息完整
- 支持 markdown 渲染

---

## Actors

| Actor | Role | Responsibility |
|-------|------|----------------|
| **GitHub Issue** | Output Target | 接收 error comment |
| **error-reporter skill** | Upstream | 提供 error-report artifact |
| **execution-reporting skill** | Upstream | 触发发布（可选） |
| **GitHub Client** | Adapter | 发布评论到 GitHub API |
| **Issue User** | Consumer | 查看 error comment 并决策 |

---

## Core Workflows

### Workflow 1: Automatic Error Report Publication

```
[Role Execution]       [error-reporter]       [github-issue-reporter]       [GitHub API]
      |                      |                        |                        |
      |  1. Execution fails  |                        |                        |
      |---------------------->|                        |                        |
      |                      |                        |                        |
      |                      |  2. Generate error-report artifact                |
      |                      |----------------------->|                        |
      |                      |                        |                        |
      |                      |                        |  3. Detect Issue association
      |                      |                        |  4. Format comment
      |                      |                        |  5. POST comment
      |                      |                        |----------------------->|
      |                      |                        |                        |
      |                      |                        |  6. Return comment URL |
      |                      |                        |<-----------------------|
      |                      |                        |                        |
      |                      |  7. Update .issue-context.json                    |
      |                      |<-----------------------|                        |
```

### Workflow 2: Manual CLI Publication

```
[CLI User]             [scripts/report-error-to-issue.js]       [GitHub API]
      |                        |                                     |
      |  1. Run with --error-report                                |
      |----------------------->|                                     |
      |                        |                                     |
      |                        |  2. Read error-report artifact      |
      |                        |  3. Parse dispatch_id / --issue     |
      |                        |  4. Format comment                  |
      |                        |  5. POST comment                    |
      |                        |------------------------------------>|
      |                        |                                     |
      |                        |  6. Return comment URL              |
      |<-----------------------|                                     |
```

---

## Business Rules

### BR-001: Issue Association Required
必须能确定 Issue number 才能发布。无法确定时返回 `NO_ISSUE_ASSOCIATED` 错误。

### BR-002: Severity Threshold
仅 `medium` 及以上 severity 自动发布。`low` severity 需手动指定。

### BR-003: Comment Uniqueness
同一 error-report_id 不重复发布到同一 Issue（幂等性）。

### BR-004: Comment Update
若 error-report artifact 内容变更（如 retry 后），更新已发布的评论。

### BR-005: Markdown Formatting
评论必须使用 GitHub 支持的 markdown 格式，不使用 unsupported features。

---

## Acceptance Criteria

### AC-001: Skill Definition
- [ ] `.opencode/skills/common/github-issue-reporter/SKILL.md` 创建
- [ ] Skill 包含完整输入/输出定义
- [ ] Skill 包含 Comment Template 定义

### AC-002: Issue Association Detection
- [ ] dispatch_id `gh-issue-*` 格式解析正确
- [ ] .issue-context.json 映射查找正确
- [ ] CLI `--issue` 参数覆盖正确
- [ ] 无 Issue 关联时返回明确错误

### AC-003: Comment Template
- [ ] Template 包含所有 severity 变体
- [ ] Severity badge 正确显示
- [ ] Markdown 格式正确渲染

### AC-004: CLI Command
- [ ] `scripts/report-error-to-issue.js` 创建
- [ ] 支持 `--error-report` 参数
- [ ] 支持 `--issue` 参数
- [ ] 支持 `--task` 参数

### AC-005: Integration
- [ ] 与 github-client.js 集成正确
- [ ] 与 .issue-context.json 集成正确
- [ ] 发布失败不影响 artifact

### AC-006: Documentation
- [ ] README 更新 skill 列表
- [ ] 使用示例文档

---

## Technical Constraints

### TC-001: Dependencies
- Node.js 18+
- Feature 043: error-reporter（已完成）
- Feature 021: github-issue-adapter（已完成）
- Feature 042: issue-lifecycle-automation（已完成）
- GitHub Token with `repo` scope

### TC-002: File Locations
- `.opencode/skills/common/github-issue-reporter/SKILL.md` - 新增 skill
- `scripts/report-error-to-issue.js` - 新增 CLI
- `adapters/github-issue/comment-templates.js` - 可能扩展（添加 error template）
- `.issue-context.json` - 状态记录

---

## Dependencies

### Internal
- Feature 043: error-reporter（error-report artifact 定义）
- Feature 021: github-issue-adapter（github-client.js）
- Feature 042: issue-lifecycle-automation（.issue-context.json）
- Feature 028: issue-status-sync（docs role progress posting pattern）

### External
- GitHub REST API v3
- GITHUB_TOKEN with `repo` scope

---

## Risks

### Risk-001: Issue Association Failure
- **描述**: dispatch_id 不包含 Issue 信息或 .issue-context.json 缺失
- **影响**: 无法自动发布，需手动指定
- **缓解**: 提供手动 CLI 命令，记录关联状态

### Risk-002: Comment Formatting
- **描述**: GitHub markdown 渲染可能与预期不同
- **影响**: 评论显示不佳
- **缓解**: 测试多种 markdown 格式，使用 GitHub 支持的标准格式

### Risk-003: API Rate Limit
- **描述**: 频繁发布触发 GitHub API 限流
- **影响**: 发布失败
- **缓解**: 复用 adapter rate limit handling，记录发布状态避免重复

---

## Milestones

### M1: Skill Definition
- 创建 SKILL.md
- 定义 Comment Template
- 编写示例

### M2: CLI Command
- 创建 report-error-to-issue.js
- 实现 Issue association detection
- 实现 Comment 发布

### M3: Integration & Documentation
- 与 github-client 集成
- README 更新
- 使用示例文档

---

## Open Questions

### OQ-001: Automatic vs Manual Publication
- **问题**: error-report 是否自动发布到 Issue？
- **选项 A**: 自动发布（execution-reporting 触发）
- **选项 B**: 仅手动发布（CLI 命令）
- **建议**: 选择 A，配置 `auto_publish_to_issue: true` 可选启用

### OQ-002: Comment Update vs New Comment
- **问题**: error-report 变更时如何处理已发布评论？
- **选项 A**: 更新现有评论（需要 comment ID）
- **选项 B**: 发布新评论（追加）
- **建议**: 选择 A，记录 comment_id 到 .issue-context.json

### OQ-003: Severity Threshold Configuration
- **问题**: 自动发布的 severity threshold 是否可配置？
- **建议**: 可配置，默认 `medium`

### OQ-004: Integration with issue-status-sync
- **问题**: github-issue-reporter 与 issue-status-sync 如何协作？
- **观察**: issue-status-sync 处理 SUCCESS 状态，github-issue-reporter 处理 FAILURE 状态
- **建议**: 两个 skill 职责分离，docs role 调用 issue-status-sync，common role 调用 github-issue-reporter

---

## Assumptions

### A-001: Issue Association Available
- 假设大部分 error-report 能追溯到 Issue（通过 dispatch_id 或 task_id）
- 如果无法追溯，提供手动 CLI 命令

### A-002: GitHub Token Available
- 假设运行环境有有效的 GITHUB_TOKEN
- 如果缺失，返回明确错误提示

### A-003: Single Issue Per Error
- 假设一个 error-report 只关联一个 Issue
- Phase 1 不支持多 Issue 发布

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