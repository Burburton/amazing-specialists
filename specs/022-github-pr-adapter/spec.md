# Feature Spec: GitHub PR Workspace Adapter

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 022-github-pr-adapter |
| **Feature Name** | GitHub PR Workspace Adapter |
| **Priority** | Later |
| **Status** | Complete |
| **Target Version** | v1.1 |
| **Related Features** | 020-orchestrator-and-workspace-adapters, 021-github-issue-adapter |
| **Design Document** | docs/adapters/github-pr-adapter-design.md |

---

## Background

Feature 020 已完成适配层基础架构，Feature 021 已实现 GitHub Issue Orchestrator Adapter。GitHub PR Workspace Adapter 是下游集成组件，负责：

- **接收 Execution Result**：处理 Expert Pack 执行结果
- **输出到 GitHub PR**：创建/更新 PR，管理文件和提交
- **状态同步**：将执行状态映射到 PR review status
- **Escalation 处理**：通过 PR review comment 输出升级请求

---

## Goal

实现 GitHub PR Workspace Adapter，使得 Expert Pack 能够：
1. 将执行产出的 artifacts 写入 GitHub PR
2. 处理 changed_files 创建提交
3. 根据 execution status 设置 PR review status
4. 输出 escalation 到 PR review comment

---

## Scope

### In Scope

1. **Artifact Output**：将 Execution Result 的 artifacts 写入 PR 文件
2. **File Handling**：处理 changed_files 的创建/修改/删除
3. **State Sync**：同步 execution state 到 PR status
4. **Escalation Handling**：输出 escalation 到 PR review comment
5. **Retry Handling**：处理输出失败的 retry 请求
6. **PR Management**：创建分支、提交、PR

### Out of Scope

1. **Orchestration**：不处理上游调度（由 Orchestrator Adapter 负责）
2. **Local File Operations**：不处理本地文件系统（由 Local Repo Adapter 负责）
3. **Issue Integration**：不处理 Issue 相关操作（由 GitHub Issue Adapter 负责）
4. **Merge Operations**：不自动合并 PR（需人工决策）

---

## Actors

| Actor | Description | Role |
|-------|-------------|------|
| **Expert Pack** | 执行层，产生 Execution Result | Producer |
| **GitHub API** | GitHub REST API v3 | Integration Target |
| **PR Author** | PR 创建者，处理 escalation | Consumer |
| **Reviewer** | PR 审核者 | Consumer |

---

## Functional Requirements

### FR-001: Artifact Output

**Description**: 将 Execution Result 的 artifacts 写入 GitHub PR

**Input**: Execution Result (artifacts[])
**Output**: PR files

**Rules**:
- `artifacts[].path` → PR 文件路径
- `artifacts[].content` → 文件内容
- `artifacts[].format` → 文件扩展名推断
- `artifacts[].artifact_type` → commit message 前缀

### FR-002: Changed Files Handling

**Description**: 处理 changed_files 创建 PR commit

**Input**: Execution Result (changed_files[])
**Output**: Git commit

**Rules**:
- `change_type: added` → 创建新文件
- `change_type: modified` → 更新现有文件
- `change_type: deleted` → 删除文件
- `change_type: renamed` → 重命名文件

### FR-003: PR Status Mapping

**Description**: 根据 Execution Status 设置 PR review status

**Input**: Execution Status
**Output**: PR Review Event

**Mapping**:
| Execution Status | PR Action |
|------------------|-----------|
| SUCCESS | APPROVE |
| SUCCESS_WITH_WARNINGS | APPROVE + comment |
| PARTIAL | REQUEST_CHANGES |
| BLOCKED | COMMENT |
| FAILED_RETRYABLE | REQUEST_CHANGES |
| FAILED_ESCALATE | COMMENT + escalate |

### FR-004: Escalation Output

**Description**: 输出 escalation 到 PR review comment

**Input**: Escalation object
**Output**: PR review comment

**Format**:
```markdown
## 🚨 PR Escalation

**Escalation ID**: {escalation_id}
**Reason**: {reason_type}
**Level**: {level}

### 🚫 Blocking Points
{blocking_points}

### 📋 Recommended Next Steps
{recommended_next_steps}
```

### FR-005: Branch Strategy

**Description**: 管理 PR 分支策略

**Rules**:
- 检查是否已存在 PR
- 存在 → 更新现有分支
- 不存在 → 创建新 feature branch
- 分支命名: `expert-pack/{dispatch_id}`

### FR-006: Retry Handling

**Description**: 处理输出失败的 retry 请求

**Flow**:
1. 输出失败 → Post retry comment
2. 等待用户决策 (`retry-approved` / `retry-aborted` label)
3. retry-approved → 重新尝试
4. retry-aborted → 标记为 FAILED
5. 超过 max_retry → Escalate

---

## Non-Functional Requirements

### NFR-001: API Rate Limiting

- 遵守 GitHub API rate limit (5000 req/hr authenticated)
- 实现 rate limit tracking
- 实现指数退避

### NFR-002: Error Handling

- 所有 API 错误映射到 ExecutionStatus
- 网络错误自动重试
- 权限错误升级处理

### NFR-003: Security

- Token 从环境变量读取
- 不记录敏感信息
- HTTPS 通信

### NFR-004: Performance

- 支持批量文件操作
- 最小化 API 调用次数
- 并行处理独立操作

---

## Acceptance Criteria

### AC-001: WorkspaceAdapter Interface Compliance

**Given**: Execution Result from Expert Pack
**When**: Adapter processes the result
**Then**: All `WorkspaceAdapter` interface methods implemented correctly

**Validation**:
- `handleArtifacts()` processes artifacts
- `handleChangedFiles()` processes changed_files
- `handleEscalation()` outputs escalation
- `validateArtifactOutput()` validates artifacts

### AC-002: Artifact Output Correctness

**Given**: Execution Result with artifacts
**When**: Adapter processes artifacts
**Then**: Files created/updated in PR branch with correct content

**Validation**:
- File paths match `artifacts[].path`
- File content matches `artifacts[].content`
- Commit message includes artifact type prefix

### AC-003: Changed Files Handling

**Given**: Execution Result with changed_files
**When**: Adapter processes changed_files
**Then**: Git commit created with all file changes

**Validation**:
- Added files created
- Modified files updated
- Deleted files removed
- Commit message includes diff summary

### AC-004: PR Status Mapping

**Given**: Execution Result with status
**When**: Adapter sets PR review status
**Then**: Correct PR review event created

**Validation**:
- SUCCESS → APPROVE
- PARTIAL → REQUEST_CHANGES
- FAILED_ESCALATE → COMMENT with escalation

### AC-005: GitHub API Integration

**Given**: Valid GITHUB_TOKEN
**When**: Adapter makes API calls
**Then**: All operations succeed with rate limiting

**Validation**:
- Branch creation works
- File commit works
- PR creation/update works
- Review submission works

### AC-006: Escalation Comment Format

**Given**: Escalation object
**When**: Adapter outputs escalation
**Then**: PR review comment posted with correct format

**Validation**:
- Markdown format correct
- All required fields present
- Positioning appropriate (file/line/general)

### AC-007: Retry Flow

**Given**: Output failure
**When**: Retry triggered
**Then**: Correct retry flow executed

**Validation**:
- Retry comment posted
- Label detection works
- Max retry escalation works

### AC-008: Error Mapping

**Given**: GitHub API error
**When**: Error occurs
**Then**: Correct ExecutionStatus returned

**Validation**:
- 403/401 → BLOCKED
- 500/502 → FAILED_RETRYABLE
- Network error → FAILED_RETRYABLE

### AC-009: Configuration

**Given**: Adapter configuration file
**When**: Adapter initializes
**Then**: Configuration validated and loaded

**Validation**:
- Config file exists
- JSON schema valid
- All required fields present

### AC-010: Branch Strategy

**Given**: Dispatch ID
**When**: Adapter creates/updates PR
**Then**: Correct branch strategy applied

**Validation**:
- New PR creates feature branch
- Existing PR updates branch
- Branch naming convention followed

---

## Business Rules

### BR-001: PR Title Format

PR 标题格式：
- Design: `[Design] {title}`
- Implementation: `[Implement] {title}`
- Test: `[Test] {title}`
- Review: `[Review] {title}`
- Fix: `[Fix] {title}`

### BR-002: Default Base Branch

默认 base branch 为 `main`，可通过配置覆盖。

### BR-003: Max Retry Limit

默认 max_retry = 2，可配置。

### BR-004: Label Requirements

Retry labels:
- `retry-approved` - 用户批准重试
- `retry-aborted` - 用户取消重试
- `escalation:needs-decision` - 需要用户决策

### BR-005: Commit Message Format

```
{artifact_type}: {summary}

{description}

Co-authored-by: Expert Pack <expert-pack@opencode>
```

### BR-006: Path Validation

写入文件前验证：
- 路径不越界（不写 .git, .env 等）
- 不覆盖未授权文件
- 符合 profile 配置

---

## Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| GitHub REST API v3 | External | GitHub integration |
| `adapters/shared/` | Internal | Shared utilities |
| `io-contract.md` | Contract | Interface definition |
| GitHub Issue Adapter | Parallel | Can be used together |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| GitHub API changes | Low | High | Use stable API version |
| Rate limit exceeded | Medium | Medium | Implement backoff |
| Merge conflicts | Medium | Medium | Request user resolution |
| Permission denied | Low | High | Escalate to user |

---

## References

- `ADAPTERS.md` - Adapter Architecture
- `docs/adapters/github-pr-adapter-design.md` - Detailed Design
- `io-contract.md §2` - Execution Result Schema
- `io-contract.md §3` - Artifact Schema
- `io-contract.md §8` - WorkspaceAdapter Interface
- GitHub REST API Documentation

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial specification |