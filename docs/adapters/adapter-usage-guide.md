# Adapter Usage Guide

本指南介绍如何使用 OpenCode 专家包的适配器，包括 CLI/Local Orchestrator Adapter 和 Local Repo Workspace Adapter。

---

## Overview

适配器是专家包与外部系统之间的集成层：

- **Orchestrator Adapter**: 将外部输入转换为标准 Dispatch Payload
- **Workspace Adapter**: 将 Execution Result 输出到目标工作区

```
External Input → Orchestrator Adapter → Expert Pack → Workspace Adapter → Output
```

---

## CLI/Local Orchestrator Adapter

### Purpose

CLI/Local Adapter 将命令行输入转换为标准 Dispatch Payload，用于本地开发工作流。

### Location

- **Path**: `adapters/cli-local/`
- **Config**: `adapters/cli-local/cli-local.config.json`

### Usage

#### Basic Command Structure

```bash
node adapters/cli-local/index.js <command> [options] [title] [goal]
```

#### CLI Argument Mapping

| CLI Argument | Dispatch Field | Example |
|--------------|----------------|---------|
| `--project <id>` | project_id | `--project my-project` |
| `--milestone <id>` | milestone_id | `--milestone m1` |
| `--task <id>` | task_id | `--task t001` |
| `--role <role>` | role | `--role developer` |
| `--command <cmd>` | command | `--command implement-task` |
| `--context <json>` | context | `--context '{"key":"value"}'` |
| `--constraints <array>` | constraints | `--constraints '["no-db-change"]'` |
| `--risk <level>` | risk_level | `--risk medium` |
| `<title>` | title | First positional argument |
| `<goal>` | goal | Remaining positional arguments |

#### Example Commands

```bash
# Developer implementation task
node adapters/cli-local/index.js --project myapp --milestone m1 --task t001 \
  --role developer --command implement-task \
  "Implement user authentication" \
  "Create login/logout functionality with session management"

# Architect design task
node adapters/cli-local/index.js --project myapp --milestone m1 --task t002 \
  --role architect --command design-task \
  --risk medium \
  "Design API structure" \
  "Create API contract design for user module"

# Tester verification task
node adapters/cli-local/index.js --project myapp --milestone m1 --task t003 \
  --role tester --command test-task \
  "Test authentication flow" \
  "Verify login/logout works correctly"
```

### Configuration

```json
// adapters/cli-local/cli-local.config.json
{
  "adapter_id": "cli-local",
  "adapter_type": "orchestrator",
  "priority": "must-have",
  "version": "1.0.0",
  "retry_config": {
    "strategy": "interactive",
    "max_retry": 2,
    "trigger": "user_decision"
  },
  "escalation_config": {
    "channel": "console",
    "interactive": true
  }
}
```

### Escalation Handling

当任务无法继续时，CLI/Local Adapter 会：

1. 输出 escalation 详情到控制台
2. 显示阻塞点列表
3. 提示用户决策（继续/重试/中止）

---

## Local Repo Workspace Adapter

### Purpose

Local Repo Adapter 将 Execution Result 写入本地文件系统，用于本地开发工作流。

### Location

- **Path**: `adapters/local-repo/`
- **Config**: `adapters/local-repo/local-repo.config.json`

### Usage

#### Artifact Output

Execution Result 中的 artifacts 会被写入指定的路径：

| Execution Result Field | Output Action |
|------------------------|---------------|
| `artifacts[].path` | 文件写入（创建/更新） |
| `artifacts[].content` | 文件内容 |
| `changed_files[].path` | 文件变更处理 |
| `changed_files[].change_type` | added → create, modified → update, deleted → remove |

#### Configuration

```json
// adapters/local-repo/local-repo.config.json
{
  "adapter_id": "local-repo",
  "adapter_type": "workspace",
  "priority": "must-have",
  "version": "1.0.0",
  "workspace_type": "local_repo",
  "output_config": {
    "artifact_path": "./artifacts/",
    "changed_files_path": "./",
    "console_output": true
  },
  "retry_config": {
    "strategy": "interactive",
    "max_retry": 2,
    "trigger": "user_decision"
  },
  "validation_rules": {
    "path_exists": true,
    "no_conflict": true,
    "profile_match": true
  }
}
```

### Path Validation (BR-006)

Local Repo Adapter 验证输出路径：

| Rule | Description |
|------|-------------|
| Path exists | 路径存在且可写 |
| No conflict | 不覆盖未授权文件 |
| Profile match | 路径符合 profile 配置 |

### Console Output

执行完成后，Local Repo Adapter 输出：

- 执行摘要（summary）
- 发现的问题（issues_found）
- 后续建议（recommendation）

---

## Adapter Selection

### Orchestrator + Workspace Combination

| Orchestrator | Workspace | Use Case |
|--------------|-----------|----------|
| CLI/Local | Local Repo | 本地开发工作流 |

### Future Combinations (Design Only)

| Orchestrator | Workspace | Use Case |
|--------------|-----------|----------|
| GitHub Issue | GitHub PR | GitHub Issue 驱动开发 |
| OpenClaw | GitHub PR | 管理层调度 GitHub 流程 |
| OpenClaw | External | 外部系统集成 |

---

## Shared Utilities

### Version Check

检查适配器与包版本兼容性：

```bash
node adapters/shared/version-check.js
```

返回：
- 兼容性状态
- 迁移提示（如有）

### Profile Loader

加载 profile 配置：

```bash
node adapters/shared/profile-loader.js minimal
node adapters/shared/profile-loader.js full
```

返回：
- Profile 版本
- Skill 数量
- 文件数量

### Workspace Config Validator

验证工作区配置：

```bash
node adapters/shared/workspace-config-validator.js <config-path>
```

返回：
- ValidationResult (isValid, errors)

---

## Troubleshooting

### Common Issues

| Issue | Cause | Resolution |
|-------|-------|------------|
| `BLOCKED` status | 版本不兼容 | 运行 version-check.js 检查兼容性 |
| Path validation failed | 输出路径冲突 | 检查 path-validator.js 错误信息 |
| Profile not found | Profile 不匹配 | 使用 profile-loader.js 验证 profile |

### Error Transparency

所有适配器错误包含：
- 错误来源（adapter / expert_pack）
- 错误类型（validation / execution / external）
- 修复建议

---

## References

- [ADAPTERS.md](../ADAPTERS.md) - Adapter Architecture Definition
- [io-contract.md](../io-contract.md) - I/O Contract (§1-§4, §8)
- [adapters/registry.json](../adapters/registry.json) - Adapter Registry
- [examples/cli-workflow.md](../examples/cli-workflow.md) - CLI Workflow Example
- [examples/local-repo-output.md](../examples/local-repo-output.md) - Local Repo Output Example

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial adapter usage guide (Feature 020) |