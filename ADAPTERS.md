# Adapter Architecture

本文件定义 OpenCode 专家包的适配层架构，包括 Orchestrator Adapter 和 Workspace Adapter 的边界、职责、接口与集成规则。

---

## Overview

Adapter 层是专家包与外部系统之间的集成层，解决两个核心接入问题：

1. **上游接入**：将外部调度系统（CLI、GitHub Issue、OpenClaw）的请求转换为标准 Dispatch Payload
2. **下游接入**：将 Execution Result 的 artifacts 输出到不同工作区形态（本地仓库、GitHub PR、外部系统）

### Position in Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           External Systems                                   │
│   CLI User / GitHub Issue / OpenClaw Manager / Future Orchestrators         │
└─────────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Orchestrator Adapters                              │
│  (Upstream Integration: External systems → Dispatch Payload → Expert Pack)  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CLI/Local        GitHub Issue        OpenClaw        Future...           │
│   Adapter          Adapter Design      Adapter Design                       │
│   (Must-Have)      (Later)             (Later)                             │
│       │                │                   │                                │
│       ▼                ▼                   ▼                                │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │              Dispatch Payload Normalizer                 │               │
│   │         (Contract: io-contract.md §1)                    │               │
│   └─────────────────────────────────────────────────────────┘               │
│                          │                                                  │
│                          ▼                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Expert Pack Core (6-Role Execution)                     │
│                     (architect/developer/tester/reviewer/docs/security)      │
│                     (37 Skills: 21 MVP + 16 M4)                              │
└─────────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Workspace Adapters                                 │
│  (Downstream Integration: Execution Result → Artifact → Target Workspace)   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Local Repo       GitHub PR            External        Future...           │
│   Adapter          Adapter Design       Adapter Design                       │
│   (Must-Have)      (Later)              (Later)                             │
│       │                │                   │                                │
│       ▼                ▼                   ▼                                │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │              Artifact Output Handler                     │               │
│   │         (Contract: io-contract.md §2, §3)                │               │
│   └─────────────────────────────────────────────────────────┘               │
│                          │                                                  │
│                          ▼                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Target Workspaces                                  │
│   Local Filesystem / GitHub Repository / External System / Future...        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Adapter Types

### Orchestrator Adapter vs Workspace Adapter

| Dimension | Orchestrator Adapter | Workspace Adapter |
|-----------|----------------------|-------------------|
| **Direction** | Upstream (External → Expert Pack) | Downstream (Expert Pack → External) |
| **Primary Input** | External request format | Execution Result |
| **Primary Output** | Dispatch Payload | Artifact / Changed Files |
| **Core Function** | Input normalization | Output handling |
| **Error Direction** | Return to external caller | Write to target workspace |
| **Escalation Role** | Generate escalation request | Handle escalation output |
| **Retry Scope** | Dispatch phase retry | Artifact output retry |

### Adapter Priority Classification

| Priority | Definition | Example |
|----------|------------|---------|
| **Must-Have** | MVP 核心，必须实现 | CLI/Local, Local Repo |
| **Later** | 设计先行，未来实现 | GitHub Issue, OpenClaw, GitHub PR |
| **Future** | 预留设计，暂无计划 | External System, Custom |

---

## Orchestrator Adapter Definition

### Responsibilities

| Responsibility | Description | Output |
|----------------|-------------|--------|
| **Input Normalization** | 将外部输入转换为标准 Dispatch Payload | Dispatch Payload (io-contract.md §1) |
| **Context Extraction** | 从外部源提取 project_id、milestone_id、task_id | Required fields in Dispatch Payload |
| **Validation** | 验证 Dispatch Payload 符合 schema | ValidationResult |
| **Routing** | 根据 role/command 路由到执行入口 | Execution trigger |
| **Error Mapping** | 将外部错误映射为 BLOCKED/FAILED 状态 | ExecutionStatus |
| **Escalation Generation** | 无法继续时生成 escalation request | Escalation (io-contract.md §4) |

### Interface Contract

Orchestrator Adapter 必须实现以下接口（详见 io-contract.md §8）：

```typescript
interface OrchestratorAdapter {
  // 核心方法
  normalizeInput(externalInput: any): DispatchPayload;
  validateDispatch(dispatch: DispatchPayload): ValidationResult;
  routeToExecution(dispatch: DispatchPayload): void;
  mapError(error: any): ExecutionStatus;
  
  // 可选方法
  generateEscalation(context: EscalationContext): Escalation;
  handleRetry(retryContext: RetryContext): RetryDecision;
  
  // 元数据
  getAdapterInfo(): AdapterInfo;
}
```

### Must-Have: CLI/Local Adapter

| Aspect | Implementation |
|--------|----------------|
| **Type** | Orchestrator |
| **Priority** | Must-Have |
| **Input** | CLI arguments (process.argv) |
| **Output** | Dispatch Payload |
| **Path** | `adapters/cli-local/` |
| **Config** | `adapters/cli-local/cli-local.config.json` |

**Dispatch Input Mapping**:

| CLI Argument | Dispatch Field | Mapping |
|--------------|----------------|---------|
| `--project <id>` | project_id | Direct |
| `--milestone <id>` | milestone_id | Direct |
| `--task <id>` | task_id | Direct |
| `--role <role>` | role | Direct (validate enum) |
| `--command <cmd>` | command | Direct |
| `<title>` (positional) | title | First positional arg |
| `<goal>` (remaining) | goal | Remaining positional args |
| `--context <json>` | context | JSON parse |
| `--constraints <array>` | constraints | Array parse |
| `--risk <level>` | risk_level | Direct (validate enum) |
| Auto-generated | dispatch_id | UUID v4 |

**Escalation Mapping**:

| Escalation Field | CLI Action |
|------------------|------------|
| escalation_id | Console output (print) |
| reason_type | Console output (print) |
| blocking_points | Console output (list) |
| recommended_next_steps | Console output (list) |
| requires_user_decision | Interactive prompt |

**Retry Strategy**:

| Property | Value |
|----------|-------|
| Strategy | Interactive |
| Max Retry | 2 (user can override) |
| Trigger | User decision |

### Later: GitHub Issue Adapter (Design Only)

| Aspect | Design |
|--------|--------|
| **Type** | Orchestrator |
| **Priority** | Later |
| **Input** | GitHub Issue (number, body, labels) |
| **Output** | Dispatch Payload |
| **Design Doc** | `docs/adapters/github-issue-adapter-design.md` |

**Dispatch Input Mapping** (Design):

| GitHub Issue Field | Dispatch Field | Mapping |
|--------------------|----------------|---------|
| Issue number | dispatch_id | `gh-issue-{number}` |
| Repository name | project_id | Direct |
| `milestone:*` label | milestone_id | Parse label |
| Issue title | title | Direct |
| Issue body | description/goal | Parse sections |
| `role:*` label | role | Parse label |
| Issue template | command | Parse template |

**Escalation Mapping** (Design):

| Escalation Field | GitHub Action |
|------------------|---------------|
| escalation_id | Issue comment |
| blocking_points | Issue comment (markdown) |
| requires_user_decision | Add `escalation:needs-decision` label |

**Retry Strategy** (Design):

| Property | Value |
|----------|-------|
| Strategy | Auto-retry with comment |
| Max Retry | 1 |
| Trigger | Bot triggered |

### Later: OpenClaw Adapter (Design Only)

| Aspect | Design |
|--------|--------|
| **Type** | Orchestrator |
| **Priority** | Later |
| **Input** | OpenClaw dispatch message |
| **Output** | Dispatch Payload |
| **Design Doc** | `docs/adapters/openclaw-adapter-design.md` |

**Dispatch Input Mapping** (Design):

| OpenClaw Field | Dispatch Field | Mapping |
|----------------|----------------|---------|
| dispatch_id | dispatch_id | Direct |
| project object | project_id | Direct |
| milestone object | milestone_id | Direct |
| task object | task_id | Direct |
| role field | role | Direct |
| command field | command | Direct |

**Escalation Mapping** (Design):

| Escalation Field | OpenClaw Action |
|------------------|-----------------|
| escalation_id | API callback |
| blocking_points | API callback payload |
| requires_user_decision | API callback with decision request |

**Retry Strategy** (Design):

| Property | Value |
|----------|-------|
| Strategy | Auto-retry with log |
| Max Retry | 2 (configurable) |
| Trigger | OpenClaw policy |

---

## Workspace Adapter Definition

### Responsibilities

| Responsibility | Description | Output |
|----------------|-------------|--------|
| **Artifact Output** | 将 Execution Result 的 artifacts 写入目标工作区 | Files in workspace |
| **File Handling** | 处理 changed_files 的写入/修改/删除 | File changes |
| **State Sync** | 同步 execution state 到工作区状态 | Status update |
| **Escalation Handling** | 将 escalation 输出到处理通道 | Escalation output |
| **Validation** | 验证 artifact 输出符合 schema | ValidationResult |
| **Retry Handling** | 处理输出失败的 retry | Retry decision |

### Interface Contract

Workspace Adapter 必须实现以下接口（详见 io-contract.md §8）：

```typescript
interface WorkspaceAdapter {
  // 核心方法
  handleArtifacts(result: ExecutionResult): void;
  handleChangedFiles(result: ExecutionResult): void;
  handleEscalation(escalation: Escalation): void;
  validateArtifactOutput(artifacts: Artifact[]): ValidationResult;
  
  // 可选方法
  handleRetry(retryContext: RetryContext): RetryDecision;
  syncState(result: ExecutionResult): void;
  
  // 元数据
  getAdapterInfo(): AdapterInfo;
}
```

### Must-Have: Local Repo Adapter

| Aspect | Implementation |
|--------|----------------|
| **Type** | Workspace |
| **Priority** | Must-Have |
| **Input** | Execution Result |
| **Output** | Files in local filesystem |
| **Path** | `adapters/local-repo/` |
| **Config** | `adapters/local-repo/local-repo.config.json` |

**Artifact Output Mapping**:

| Execution Result Field | Workspace Action |
|------------------------|------------------|
| artifacts[].path | File write (create/update) |
| artifacts[].content | File content |
| changed_files[].path | File write/delete |
| changed_files[].change_type | added → create, modified → update, deleted → remove |
| issues_found | Console output (log) |
| recommendation | Console output (status) |

**Escalation Output Mapping**:

| Escalation Field | Local Repo Action |
|------------------|-------------------|
| escalation_id | Console output (print) |
| reason_type | Console output (print) |
| blocking_points | Console output (list) |
| recommended_next_steps | Console output (list) |
| requires_user_decision | Interactive prompt |

**Path Validation Rules (BR-006)**:

| Rule | Description |
|------|-------------|
| Path exists | Validate path exists and is writable |
| No conflict | Validate won't overwrite unauthorized files |
| Profile match | Validate path matches profile configuration |

**Retry Strategy**:

| Property | Value |
|----------|-------|
| Strategy | Interactive |
| Max Retry | 2 (user can override) |
| Trigger | User decision |

### Later: GitHub PR Adapter (Design Only)

| Aspect | Design |
|--------|--------|
| **Type** | Workspace |
| **Priority** | Later |
| **Input** | Execution Result |
| **Output** | GitHub PR (files, commits) |
| **Design Doc** | `docs/adapters/github-pr-adapter-design.md` |

**Artifact Output Mapping** (Design):

| Execution Result Field | GitHub PR Action |
|------------------------|------------------|
| artifacts[].path | Add to PR files |
| artifacts[].content | PR file content |
| changed_files[] | Create commit |
| recommendation | PR status (approve/request_changes) |
| issues_found | PR review comments |

---

## Boundary Rules

### Orchestrator vs Workspace Boundary

| Rule | Orchestrator | Workspace |
|------|--------------|-----------|
| **Input Format** | External → Dispatch Payload | Execution Result → External |
| **Output Format** | Dispatch Payload → Expert Pack | Artifact → Target Workspace |
| **Error Direction** | Up (return to caller) | Down (write to workspace) |
| **Retry Scope** | Dispatch phase | Artifact output phase |
| **Escalation Role** | Generate escalation | Handle escalation output |
| **State Persistence** | None (in-memory) | Optional (workspace state) |
| **Dependency** | Contract Pack §1 | Contract Pack §2, §3 |

### Adapter Isolation (NFR-003)

| Isolation Rule | Description |
|-----------------|-------------|
| Orchestrator ↔ Workspace | Orchestrator adapter 不依赖 Workspace adapter |
| Workspace ↔ Orchestrator | Workspace adapter 不依赖 Orchestrator adapter |
| Execution Result as Boundary | Execution Result 是唯一中间层 |
| Single Adapter per Execution | 每次执行仅使用一个 orchestrator + 一个 workspace adapter |

---

## Adapter Registry

Adapter Registry 位于 `adapters/registry.json`，提供所有 adapter 的程序化发现。

### Registry Schema

```json
{
  "registry_version": "1.0.0",
  "last_updated": "timestamp",
  "adapters": {
    "orchestrator": [
      {
        "adapter_id": "cli-local",
        "adapter_type": "orchestrator",
        "priority": "must-have",
        "status": "implemented",
        "version": "1.0.0",
        "path": "adapters/cli-local/",
        "config_file": "cli-local.config.json",
        "interface": "OrchestratorAdapter",
        "compatible_profiles": ["minimal", "full"],
        "description": "CLI/Local command-line adapter"
      },
      {
        "adapter_id": "github-issue",
        "adapter_type": "orchestrator",
        "priority": "later",
        "status": "design-only",
        "design_doc": "docs/adapters/github-issue-adapter-design.md",
        "description": "GitHub Issue orchestrator adapter (design only)"
      },
      {
        "adapter_id": "openclaw",
        "adapter_type": "orchestrator",
        "priority": "later",
        "status": "design-only",
        "design_doc": "docs/adapters/openclaw-adapter-design.md",
        "description": "OpenClaw manager adapter (design only)"
      }
    ],
    "workspace": [
      {
        "adapter_id": "local-repo",
        "adapter_type": "workspace",
        "priority": "must-have",
        "status": "implemented",
        "version": "1.0.0",
        "path": "adapters/local-repo/",
        "config_file": "local-repo.config.json",
        "interface": "WorkspaceAdapter",
        "compatible_profiles": ["minimal", "full"],
        "description": "Local filesystem workspace adapter"
      },
      {
        "adapter_id": "github-pr",
        "adapter_type": "workspace",
        "priority": "later",
        "status": "design-only",
        "design_doc": "docs/adapters/github-pr-adapter-design.md",
        "description": "GitHub PR workspace adapter (design only)"
      },
      {
        "adapter_id": "external-system",
        "adapter_type": "workspace",
        "priority": "future",
        "status": "design-only",
        "design_doc": "docs/adapters/external-adapter-design.md",
        "description": "External system workspace adapter (design only)"
      }
    ]
  }
}
```

---

## Profile-Workspace Integration

### Profile Determines Skill Set (IR-001)

| Profile | Skill Count | Description |
|---------|-------------|-------------|
| minimal | 21 | MVP 核心技能 |
| full | 37 | MVP + M4 增强技能 |

Workspace adapter 必须根据 profile 确定可用的 skill 集合。

### Workspace Determines Output Format (IR-002)

| Workspace Type | Output Format | Description |
|----------------|---------------|-------------|
| local_repo | File system write | 本地文件写入 |
| github_repo | PR/Commit | GitHub PR 创建 |
| external_system | API call | 外部 API 调用 |

### Profile Version Compatibility (IR-003)

Workspace adapter 必须检查 profile version 与 package version 兼容性：

1. 读取 `compatibility-matrix.json`
2. 检查 profile 版本与 package 版本兼容性
3. 不兼容时返回 BLOCKED 状态
4. 需要 migration 时提示用户

### Profile-Adapter Interface (IR-004)

Adapter 必须通过统一接口获取 profile 配置：

| Source | Path | Interface |
|--------|------|-----------|
| Template Pack | `templates/pack/pack-version.json` | `getProfileConfig(profile_name)` |
| Contract Pack | `contracts/pack/pack-version.json` | `getContractPackVersion()` |

---

## Adapter-Contract Interface

### Contract Schema Consumption (BR-002)

Adapter 必须消费 Contract Schema Pack 进行验证：

| Adapter Type | Contract Section | Validation Target |
|--------------|------------------|-------------------|
| Orchestrator | io-contract.md §1 | Dispatch Payload |
| Workspace | io-contract.md §2, §3 | Execution Result, Artifact |

**Validation Flow**:

```
External Input → Adapter → Dispatch Payload → Contract Validator → Expert Pack
Execution Result → Adapter → Artifact Output → Contract Validator → Workspace
```

**Validation Tool**: `contracts/pack/validate-schema.js`

---

## Adapter-Versioning Interface

### Version Compatibility Check (BR-003)

Adapter 必须在初始化时检查版本兼容性：

| Step | Action |
|------|--------|
| 1 | Read `compatibility-matrix.json` |
| 2 | Check adapter version vs package version |
| 3 | Return BLOCKED if incompatible |
| 4 | Return migration hints if migration needed |

### Profile Configuration Load (BR-004)

Adapter 必须根据 profile 加载配置：

| Step | Action |
|------|--------|
| 1 | Read `templates/pack/pack-version.json` |
| 2 | Get profile version |
| 3 | Load profile directory (minimal/ or full/) |
| 4 | Return BLOCKED if profile not found |

---

## Configuration Schema

### Workspace Configuration Schema

Workspace 配置必须符合 `adapters/schemas/workspace-configuration.schema.json`：

```json
{
  "workspace_type": "local_repo | github_repo | external_system",
  "profile": "minimal | full",
  "output_config": {
    "artifact_path": "string",
    "changed_files_path": "string",
    "console_output": "boolean"
  },
  "escalation_config": {
    "channel": "console | github_comment | api",
    "requires_acknowledgment": "boolean"
  },
  "retry_config": {
    "max_retry": "integer",
    "strategy": "interactive | auto | disabled"
  }
}
```

---

## Non-functional Requirements

### NFR-001: Adapter Discoverability

Adapter 配置必须程序化可发现：
- 配置路径: `adapters/registry.json`
- 包含所有 adapter 类型、优先级、配置

### NFR-002: Adapter Extensibility

Adapter 必须支持扩展：
- Later adapters 可按统一接口添加
- 不修改现有 adapter 代码
- 配置驱动扩展

### NFR-003: Adapter Isolation

各 adapter 必须独立运行：
- Orchestrator adapter 不依赖 Workspace adapter
- Workspace adapter 不依赖 Orchestrator adapter
- 通过 Execution Result 作为中间层

### NFR-004: Contract Validation Performance

Adapter 验证必须高效：
- 验证时间 < 100ms（典型 dispatch/artifact）
- 不阻塞执行流程

### NFR-005: Error Transparency

Adapter 错误必须透明：
- 明确说明错误来源（adapter 或 expert pack）
- 明确说明错误类型（validation/execution/external）
- 提供可执行的修复建议

---

## References

- `io-contract.md` - Dispatch/Execution/Artifact/Escalation 契约定义
- `io-contract.md §8` - Adapter Interface Contract
- `contracts/pack/registry.json` - Contract Schema Pack 注册表
- `templates/pack/pack-version.json` - Template Pack 版本定义
- `compatibility-matrix.json` - 版本兼容性矩阵
- `VERSIONING.md` - 版本化策略
- `role-definition.md` - 6-role 角色定义
- `package-spec.md` - 专家包规格

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial adapter architecture definition (Feature 020) |