# Feature Spec: 020-orchestrator-and-workspace-adapters

## Metadata
```yaml
feature_id: 020-orchestrator-and-workspace-adapters
feature_name: Orchestrator 与 Workspace 适配层
status: Complete
created_at: 2026-03-28
priority: High
depends_on: [017-contract-schema-pack, 018-template-and-bootstrap-foundation, 019-versioning-and-compatibility-foundation]
```

---

## Background

### Current State
- 专家包已达到 v1.0.0 发布状态，具备完整的 6-role 执行模型、37 skills、5 commands
- Contract Schema Pack 提供 17 个 artifact contracts 的机器可读定义
- Template Pack 提供 minimal/full 两个 profile 的可复用模板
- VERSIONING.md 建立完整的版本化与兼容性治理体系
- 存在 `io-contract.md` 定义 dispatch payload 和 execution result 格式

### Problem Statement
当前专家包存在以下核心接入缺口：

1. **上游接入缺口**：dispatch payload 格式已定义，但无实际适配器将外部调度系统（CLI、GitHub Issue、OpenClaw）转换为标准 dispatch
2. **下游接入缺口**：execution result 格式已定义，但无实际适配器将 artifact 输出到不同工作区形态（本地仓库、GitHub PR、外部系统）
3. **Escalation 路径未实现**：escalation contract 已定义，但无适配器将升级请求映射到具体处理通道
4. **Profile 与 Workspace 未连接**：minimal/full profile 是模板概念，未与实际项目形态建立映射关系
5. **Retry 机制未适配**：retry_context 已定义，但不同 adapter 的 retry 策略未明确

### Why This Feature Matters
本 Feature 将专家包从"可独立运行的执行层"升级为"可被上游稳定调用、可按项目形态接入下游的完整系统"，解决：
- **调用者接入问题**：OpenClaw、CLI、GitHub Issue 可通过适配器标准化调用
- **工作区适配问题**：不同项目形态（本地仓库、GitHub 仓库、外部系统）可标准化接入
- **状态同步问题**：dispatch/artifact/escalation 可在不同 adapter 中正确映射
- **版本兼容问题**：adapter 与 contract/template/versioning 建立明确衔接规则

---

## Goal

建立正式的适配层，使专家包可被上游调度系统稳定调用，并可按不同项目形态接入下游工作区。

### Primary Goals
1. 定义 Orchestrator Adapter 和 Workspace Adapter 的边界与职责
2. 实现 CLI/Local Adapter（must-have）作为最小可验证适配器
3. 定义 GitHub Issue Adapter 和 OpenClaw Adapter 的设计（later）
4. 明确 dispatch/artifact/escalation/retry 在各 adapter 中的映射关系
5. 建立 Profile 与 Workspace 的集成规则
6. 建立 Adapter 与 Contract/Template/Versioning 的衔接规则
7. 提供最小可验证的接入示例与文档

---

## Scope

### In Scope
- **Adapter Architecture**：定义 adapter 类型、边界、职责、接口
- **CLI/Local Adapter**：本地命令行调用适配器（must-have，实现）
- **GitHub Issue Adapter Design**：GitHub Issue 调用适配器设计（later，仅设计）
- **OpenClaw Adapter Design**：OpenClaw 管理层调用适配器设计（later，仅设计）
- **Workspace/Profile Integration Rules**：工作区与 profile 的集成规则
- **Dispatch Mapping**：各 adapter 如何将外部输入转换为 dispatch payload
- **Artifact Mapping**：各 adapter 如何将 execution result 输出到目标工作区
- **Escalation Mapping**：各 adapter 如何将 escalation 映射到处理通道
- **Retry Mapping**：各 adapter 的 retry 策略差异
- **Adapter-Contract Interface**：adapter 如何消费 contract schema
- **Adapter-Versioning Interface**：adapter 如何处理版本兼容
- **Examples**：CLI/Local adapter 最小可验证示例
- **Docs Sync**：README/docs 同步

### Out of Scope
- **New Role Model**：不创建新的角色或修改现有角色边界
- **New Heavy Templates**：不创建新的模板体系或 profile
- **Complex Web UI**：不实现 Web UI 或可视化界面
- **Plugin Marketplace**：不实现插件机制或插件市场
- **Large Ecosystem**：不做大规模生态扩展或第三方集成
- **OpenClaw Full Implementation**：不实现完整的 OpenClaw 管理层
- **GitHub API Integration**：不实现完整的 GitHub API 集成（仅设计）

---

## Actors

| Actor | Role in This Feature |
|-------|---------------------|
| **CLI User** | 通过 CLI/Local adapter 调用专家包执行任务 |
| **GitHub Issue Creator** | 通过 GitHub Issue adapter 触发任务执行 |
| **OpenClaw Manager** | 通过 OpenClaw adapter 派发和接收任务 |
| **Adapter Runtime** | 执行 adapter 逻辑，转换输入输出格式 |
| **Workspace Handler** | 处理 artifact 输出到目标工作区 |
| **Contract Validator** | 验证 dispatch/artifact 符合 contract schema |
| **Version Resolver** | 判断 adapter 与 package version 兼容性 |

---

## Adapter Boundary Definition

### Orchestrator Adapter vs Workspace Adapter

```
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
```

### Orchestrator Adapter Responsibilities

| Responsibility | Description |
|---------------|-------------|
| **Input Normalization** | 将外部输入（CLI args、Issue body、OpenClaw message）转换为标准 Dispatch Payload |
| **Context Extraction** | 从外部源提取 project_id、milestone_id、task_id 等必要字段 |
| **Validation** | 验证 Dispatch Payload 符合 io-contract.md §1 的 schema |
| **Routing** | 根据 role/command 路由到正确的执行入口 |
| **Error Mapping** | 将外部错误映射为 BLOCKED/FAILED 状态 |

### Workspace Adapter Responsibilities

| Responsibility | Description |
|---------------|-------------|
| **Artifact Output** | 将 Execution Result 的 artifacts 输出到目标工作区 |
| **File Handling** | 处理 changed_files 的写入/提交/PR 创建 |
| **State Sync** | 同步 execution state 到工作区状态（如 GitHub Issue 状态更新）|
| **Escalation Handling** | 将 escalation 映射到目标通道（如 GitHub Issue comment）|
| **Validation** | 验证 Artifact 输出符合 io-contract.md §3 的 schema |

### Boundary Rules

| Rule | Orchestrator | Workspace |
|------|--------------|-----------|
| **Input Format** | 外部 → Dispatch Payload | Execution Result → 外部 |
| **Output Format** | Dispatch Payload → Expert Pack | Artifact → Target Workspace |
| **Error Direction** | 向上（返回外部调用者）| 向下（写入工作区）|
| **Retry Scope** | Dispatch 阶段 retry | Artifact 输出 retry |
| **Escalation Role** | 生成 escalation | 处理 escalation 输出 |

---

## Adapter Priority (Must-Have vs Later)

### Must-Have (实现)

| Adapter | Type | Priority | Reason |
|---------|------|----------|--------|
| **CLI/Local Adapter** | Orchestrator | Must-Have | 最小可验证适配器，支撑本地开发流程 |
| **Local Repo Adapter** | Workspace | Must-Have | 本地文件系统输出，最小可验证 |

### Later (仅设计)

| Adapter | Type | Priority | Reason |
|---------|------|----------|--------|
| **GitHub Issue Adapter** | Orchestrator | Later | 需要外部系统集成，设计先行 |
| **GitHub PR Adapter** | Workspace | Later | 需要外部 API 集成，设计先行 |
| **OpenClaw Adapter** | Orchestrator | Later | 上游管理层尚未就绪，设计先行 |
| **External System Adapter** | Workspace | Later | 未来扩展，设计预留 |

### Must-Have Deliverables

| ID | Deliverable | Description |
|----|-------------|-------------|
| M-001 | CLI/Local Adapter Implementation | 完整实现本地命令行适配器 |
| M-002 | Local Repo Adapter Implementation | 完整实现本地文件系统适配器 |
| M-003 | Adapter Architecture Document | 定义 adapter 类型、边界、接口 |
| M-004 | Example: CLI Workflow | 最小可验证的 CLI 工作流示例 |
| M-005 | Example: Local Repo Output | 最小可验证的本地输出示例 |

### Later Deliverables (Design Only)

| ID | Deliverable | Description |
|----|-------------|-------------|
| L-001 | GitHub Issue Adapter Design | 设计文档，定义接口与映射 |
| L-002 | GitHub PR Adapter Design | 设计文档，定义接口与映射 |
| L-003 | OpenClaw Adapter Design | 设计文档，定义接口与映射 |
| L-004 | External Adapter Design | 设计预留，定义接口框架 |

---

## Dispatch / Artifact / Escalation Mapping

### Dispatch Input Mapping

#### CLI/Local Adapter (Must-Have)

| External Input | Dispatch Field | Mapping Logic |
|----------------|----------------|---------------|
| CLI arguments | dispatch_id | UUID auto-generate |
| `--project` flag | project_id | Direct mapping |
| `--milestone` flag | milestone_id | Direct mapping |
| `--task` flag | task_id | Direct mapping |
| `--role` flag | role | Direct mapping (architect/developer/tester/reviewer/docs/security) |
| `--command` flag | command | Direct mapping |
| Positional arg | title/goal | First positional arg → title, rest → goal |
| `--context` flag | context | JSON/YAML parse |
| `--constraints` flag | constraints | Array parse |
| `--risk` flag | risk_level | Direct mapping (low/medium/high/critical) |

**CLI/Local Dispatch Normalization Flow:**
```
CLI Args → Arg Parser → Field Extractor → Schema Validator → Dispatch Payload
```

#### GitHub Issue Adapter Design (Later)

| External Input | Dispatch Field | Mapping Logic |
|----------------|----------------|---------------|
| Issue number | dispatch_id | `gh-issue-{number}` |
| Repository | project_id | Repo name as project_id |
| Issue labels | milestone_id | Parse from `milestone:*` label |
| Issue body | description | Full body as description |
| Issue title | title/goal | Title → title, body first line → goal |
| Issue assignee | role | Parse from `role:*` label |
| Issue template | command | Parse from template sections |

#### OpenClaw Adapter Design (Later)

| External Input | Dispatch Field | Mapping Logic |
|----------------|----------------|---------------|
| OpenClaw dispatch message | dispatch_id | Direct mapping |
| OpenClaw project object | project_id | Direct mapping |
| OpenClaw milestone object | milestone_id | Direct mapping |
| OpenClaw task object | task_id | Direct mapping |
| OpenClaw role field | role | Direct mapping |
| OpenClaw command field | command | Direct mapping |

### Artifact Output Mapping

#### Local Repo Adapter (Must-Have)

| Execution Result | Workspace Action | Mapping Logic |
|------------------|------------------|---------------|
| artifacts[].path | File write | Write artifact to local path |
| changed_files[].path | File write | Write/modify/delete files |
| changed_files[].change_type | File action | added → create, modified → update, deleted → remove |
| issues_found | Log output | Log issues to console |
| recommendation | Status output | Output recommendation to console |

**Local Repo Output Flow:**
```
Execution Result → Artifact Extractor → File Writer → Console Reporter
```

#### GitHub PR Adapter Design (Later)

| Execution Result | Workspace Action | Mapping Logic |
|------------------|------------------|---------------|
| artifacts[].path | PR file | Add artifact to PR |
| changed_files[] | PR commit | Create commit with changes |
| recommendation | PR status | Update PR status (approve/request_changes) |
| issues_found | PR review comment | Add review comments |

### Escalation Mapping

#### CLI/Local Adapter (Must-Have)

| Escalation Field | CLI Action | Mapping Logic |
|------------------|------------|---------------|
| escalation_id | Console output | Print escalation ID |
| reason_type | Console output | Print reason type |
| blocking_points | Console output | Print blocking points |
| recommended_next_steps | Console output | Print next steps |
| requires_user_decision | Interactive prompt | Prompt user for decision |

#### GitHub Issue Adapter Design (Later)

| Escalation Field | GitHub Action | Mapping Logic |
|------------------|---------------|---------------|
| escalation_id | Issue comment | Post as comment |
| blocking_points | Issue comment | Post blocking points |
| requires_user_decision | Issue label | Add `escalation:needs-decision` label |

### Retry Mapping

| Adapter | Retry Strategy | Max Retry | Trigger |
|---------|----------------|-----------|---------|
| CLI/Local | Interactive retry | 2 (user can override) | User decision |
| GitHub Issue | Auto-retry with comment | 1 | Bot triggered |
| OpenClaw | Auto-retry with log | 2 (configurable) | OpenClaw policy |

---

## Profile / Workspace Integration Design

### Profile-Workspace Mapping

| Profile | Compatible Workspace | Integration Rules |
|---------|---------------------|-------------------|
| **minimal** | Local Repo | Skills: 21 MVP, basic file handling |
| **minimal** | GitHub Repo | Skills: 21 MVP, GitHub API basics |
| **full** | Local Repo | Skills: 37 full, advanced file handling |
| **full** | GitHub Repo | Skills: 37 full, full GitHub API |
| **full** | External System | Skills: 37 full, custom adapter |

### Integration Rules

#### IR-001: Profile Determines Skill Set
Workspace adapter 必须根据 profile 确定可用的 skill 集合：
- `minimal` profile: 21 MVP skills
- `full` profile: 37 skills (MVP + M4)

#### IR-002: Workspace Determines Output Format
不同 workspace 类型有不同的 artifact 输出格式：
- Local Repo: 文件系统写入
- GitHub Repo: PR/Commit 创建
- External System: API 调用

#### IR-003: Profile Version Compatibility
Workspace adapter 必须检查 profile version 与 package version 兼容性：
- 参考 `compatibility-matrix.json`
- 不兼容时返回 BLOCKED 状态

#### IR-004: Profile-Adapter Interface
Adapter 必须通过统一接口获取 profile 配置：
- 路径: `templates/pack/pack-version.json`
- 接口: `getProfileConfig(profile_name)`

### Workspace Configuration Schema

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

## Core Workflows

### Workflow 1: CLI/Local Dispatch Flow

```
CLI User → CLI Args → CLI Adapter → Dispatch Normalizer → Contract Validator → Expert Pack
```

**Steps:**
1. CLI User 执行命令（如 `opencode-agent dispatch --role architect --command design-task ...`）
2. CLI Adapter 解析命令行参数
3. Dispatch Normalizer 将参数转换为 Dispatch Payload
4. Contract Validator 验证 Dispatch Payload 符合 io-contract.md §1
5. Expert Pack 接收 Dispatch Payload，执行角色任务

### Workflow 2: Local Repo Output Flow

```
Expert Pack → Execution Result → Local Repo Adapter → Artifact Handler → File System → Console
```

**Steps:**
1. Expert Pack 完成 execution，输出 Execution Result
2. Local Repo Adapter 解析 Execution Result
3. Artifact Handler 将 artifacts 写入本地文件系统
4. File System 执行文件变更（create/update/delete）
5. Console Reporter 输出 summary/issues/recommendation

### Workflow 3: Escalation Flow

```
Expert Pack → Escalation → Adapter → Escalation Handler → User Decision → Continue/Abort
```

**Steps:**
1. Expert Pack 生成 Escalation（FAILED_ESCALATE 状态）
2. Adapter 接收 Escalation，映射到处理通道
3. Escalation Handler 输出 escalation 信息
4. User Decision（CLI 交互式提示）
5. Continue（修复问题）或 Abort（终止流程）

---

## Business Rules

### BR-001: Adapter Interface Contract
所有 adapter 必须实现统一接口：

```typescript
interface OrchestratorAdapter {
  normalizeInput(externalInput: any): DispatchPayload;
  validateDispatch(dispatch: DispatchPayload): ValidationResult;
  routeToExecution(dispatch: DispatchPayload): void;
  mapError(error: any): ExecutionStatus;
}

interface WorkspaceAdapter {
  handleArtifacts(result: ExecutionResult): void;
  handleChangedFiles(result: ExecutionResult): void;
  handleEscalation(escalation: Escalation): void;
  validateArtifactOutput(artifacts: Artifact[]): ValidationResult;
}
```

### BR-002: Contract Schema Consumption
Adapter 必须消费 Contract Schema Pack 进行验证：
- Orchestrator Adapter 使用 `io-contract.md §1` 的 Dispatch Payload schema
- Workspace Adapter 使用 `io-contract.md §2, §3` 的 Execution Result 和 Artifact schema
- 验证使用 `contracts/pack/validate-schema.js` 或等效逻辑

### BR-003: Version Compatibility Check
Adapter 必须在初始化时检查版本兼容性：
- 检查 `compatibility-matrix.json`
- 不兼容时返回 BLOCKED 状态
- 兼容但有 migration 时提示用户

### BR-004: Profile Configuration Load
Adapter 必须根据 profile 加载配置：
- 从 `templates/pack/pack-version.json` 获取 profile 版本
- 从 profile 目录加载 skill 配置
- Profile 不匹配时返回 BLOCKED 状态

### BR-005: Dispatch Payload Required Fields
Orchestrator Adapter 必须确保 Dispatch Payload 包含所有必填字段（参考 io-contract.md §1）：
- dispatch_id, project_id, milestone_id, task_id
- role, command, title, goal, description
- context, constraints, inputs, expected_outputs
- verification_steps, risk_level

### BR-006: Artifact Output Path Validation
Workspace Adapter 必须验证 artifact 输出路径：
- 路径存在且可写
- 路径不冲突（不覆盖未授权文件）
- 路径符合 profile 配置

### BR-007: Escalation Channel Selection
Adapter 必须根据 workspace_type 选择正确的 escalation channel：
- `local_repo`: console + interactive prompt
- `github_repo`: GitHub comment + label
- `external_system`: API call

### BR-008: Retry Strategy Selection
Adapter 必须根据 workspace_type 选择正确的 retry strategy：
- `local_repo`: interactive（用户决策）
- `github_repo`: auto（bot triggered）
- `external_system`: configurable

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

## Acceptance Criteria

### AC-001: Adapter Architecture Defined
- [ ] Orchestrator Adapter 和 Workspace Adapter 边界明确
- [ ] Adapter 接口定义完整（BR-001）
- [ ] Adapter 类型、优先级、配置明确

### AC-002: CLI/Local Adapter Implemented
- [ ] CLI/Local Adapter 完整实现（M-001）
- [ ] 支持 dispatch 命令入口
- [ ] 支持 dispatch payload normalization
- [ ] 支持 contract validation

### AC-003: Local Repo Adapter Implemented
- [ ] Local Repo Adapter 完整实现（M-002）
- [ ] 支持 artifact 文件输出
- [ ] 支持 changed files 处理
- [ ] 支持 escalation console output

### AC-004: Dispatch Mapping Complete
- [ ] CLI/Local adapter dispatch mapping 完整
- [ ] GitHub Issue adapter design document exists
- [ ] OpenClaw adapter design document exists

### AC-005: Artifact Mapping Complete
- [ ] Local Repo adapter artifact mapping 完整
- [ ] GitHub PR adapter design document exists

### AC-006: Escalation Mapping Complete
- [ ] CLI/Local adapter escalation mapping 完整
- [ ] GitHub Issue adapter escalation design exists

### AC-007: Profile-Workspace Integration Rules
- [ ] Profile-workspace mapping rules defined (IR-001~IR-004)
- [ ] Workspace configuration schema defined
- [ ] Profile version compatibility check implemented

### AC-008: Adapter-Contract Interface
- [ ] Adapter 使用 contract schema 验证 (BR-002)
- [ ] 验证逻辑符合 io-contract.md 定义

### AC-009: Adapter-Versioning Interface
- [ ] Adapter 使用 compatibility-matrix.json (BR-003)
- [ ] Profile version check implemented (BR-004)

### AC-010: Examples Provided
- [ ] CLI workflow example exists (M-004)
- [ ] Local repo output example exists (M-005)
- [ ] Examples 可验证执行

### AC-011: Docs Sync Complete
- [ ] README.md 更新反映 adapter architecture
- [ ] 新增 adapters 使用文档
- [ ] Governance 文档一致性

---

## Deliverables

### Primary Deliverables

| ID | Deliverable | Path | Description |
|----|-------------|------|-------------|
| D-001 | ADAPTERS.md | ADAPTERS.md | Adapter architecture 总文档 |
| D-002 | adapters/registry.json | adapters/registry.json | Adapter 注册表 |
| D-003 | adapters/cli-local/ | adapters/cli-local/ | CLI/Local adapter 实现 |
| D-004 | adapters/local-repo/ | adapters/local-repo/ | Local Repo adapter 实现 |
| D-005 | github-issue-adapter-design.md | docs/adapters/github-issue-adapter-design.md | GitHub Issue adapter 设计 |
| D-006 | openclaw-adapter-design.md | docs/adapters/openclaw-adapter-design.md | OpenClaw adapter 设计 |
| D-007 | github-pr-adapter-design.md | docs/adapters/github-pr-adapter-design.md | GitHub PR adapter 设计 |

### Secondary Deliverables

| ID | Deliverable | Path | Description |
|----|-------------|------|-------------|
| D-008 | README.md update | README.md | 添加 adapter architecture 说明 |
| D-009 | examples/cli-workflow.md | examples/cli-workflow.md | CLI workflow 示例 |
| D-010 | examples/local-repo-output.md | examples/local-repo-output.md | Local repo output 示例 |
| D-011 | io-contract.md update | io-contract.md | 添加 adapter interface 章节 |

---

## Assumptions

1. **CLI 为主要入口**：本地开发流程是 MVP 主要使用场景
2. **GitHub 集成延后**：GitHub API 集成需要额外开发，设计先行
3. **OpenClaw 未就绪**：OpenClaw 管理层尚未实现，设计预留
4. **单 Adapter 运行**：每次 execution 仅使用一个 orchestrator + 一个 workspace adapter
5. **Profile 已就绪**：minimal/full profile 已通过 018 feature 实现

---

## Open Questions

1. **Adapter 配置位置**：adapter 配置应放在 `adapters/` 还是 `.opencode/adapters/`？
2. **多 Adapter 并发**：是否需要支持多 orchestrator adapter 并发调用？
3. **Adapter 状态持久化**：adapter 是否需要持久化状态（如 retry count）？
4. **Adapter 错误恢复**：adapter 自身失败时如何恢复？
5. **GitHub Adapter 认证**：GitHub adapter 如何处理认证（token storage）？
6. **External Adapter 定义**：external_system adapter 是否需要预留接口定义？

---

## References

- `io-contract.md` - Dispatch/Execution/Artifact/Escalation 契约定义
- `contracts/pack/registry.json` - Contract Schema Pack
- `templates/pack/pack-version.json` - Template Pack 版本定义
- `compatibility-matrix.json` - 版本兼容性矩阵
- `VERSIONING.md` - 版本化策略
- `role-definition.md` - 6-role 角色定义
- `package-spec.md` - 专家包规格

---

## Next Recommended Command

建议执行 `/spec-plan 020-orchestrator-and-workspace-adapters` 生成实施计划。