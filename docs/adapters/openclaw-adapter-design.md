# OpenClaw Adapter Design Document

## Metadata
```yaml
adapter_id: openclaw
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
| **Adapter ID** | `openclaw` | Registry key |
| **Adapter Type** | Orchestrator | Upstream integration (OpenClaw → Dispatch Payload) |
| **Priority** | Later | Design only, future implementation |
| **Interface** | `OrchestratorAdapter` | io-contract.md §8 |
| **Compatible Profiles** | minimal, full | Both profiles supported |
| **Compatible Workspaces** | github-pr, local-repo, external-system | Full flexibility |

### Type Definition (from ADAPTERS.md)

作为 Orchestrator Adapter，OpenClaw Adapter 负责：
- **Input Normalization**: 将 OpenClaw dispatch message 转换为 Dispatch Payload
- **Context Extraction**: 从 OpenClaw message提取 project, milestone, task
- **Validation**: 验证 Dispatch Payload 符合 schema
- **Routing**: 根据 OpenClaw role/command 路由到执行入口
- **Error Mapping**: 将 OpenClaw API 错误映射为 BLOCKED/FAILED 状态
- **Escalation Generation**: 无法继续时生成 escalation request 并回调

### System Position

OpenClaw Adapter 是专家包与上层管理层之间的主要接口：

```
User/Product Layer
    ↓
OpenClaw Manager Layer (调度、规划、验收)
    ↓
OpenClaw Adapter (本适配器)
    ↓
Expert Pack Core (6-Role Execution)
    ↓
Workspace Adapter (输出)
```

---

## 2. Input/Output Mapping Tables

### Dispatch Input Mapping

将 OpenClaw dispatch message 字段映射为 Dispatch Payload（io-contract.md §1）：

| OpenClaw Field | Dispatch Payload Field | Mapping Logic |
|----------------|------------------------|---------------|
| `dispatch_id` | `dispatch_id` | Direct mapping |
| `project.id` | `project_id` | Direct mapping |
| `milestone.id` | `milestone_id` | Direct mapping |
| `task.id` | `task_id` | Direct mapping |
| `role` | `role` | Direct (validate enum) |
| `command` | `command` | Direct |
| `task.title` | `title` | Direct |
| `task.goal` | `goal` | Direct |
| `task.description` | `description` | Direct |
| `task.context` | `context` | Direct mapping |
| `task.constraints` | `constraints` | Direct array |
| `task.inputs` | `inputs` | Direct artifact refs |
| `task.expected_outputs` | `expected_outputs` | Direct |
| `task.verification_steps` | `verification_steps` | Direct |
| `task.risk_level` | `risk_level` | Direct (validate enum) |
| `retry_context` | `retry_context` | Direct (if present) |
| `upstream_dependencies` | `upstream_dependencies` | Direct (if present) |

### OpenClaw Message Schema (Expected)

OpenClaw 应发送以下格式的 dispatch message：

```yaml
dispatch_id: string
project:
  id: string
  name: string
  goal: string
milestone:
  id: string
  name: string
  goal: string
  status: enum
task:
  id: string
  title: string
  goal: string
  description: string
  context:
    project_goal: string
    milestone_goal: string
    task_scope: string
    related_spec_sections: [string]
    code_context_summary: string
  constraints: [string]
  inputs: [ArtifactReference]
  expected_outputs: [string]
  verification_steps: [string]
  risk_level: enum
role: enum (architect|developer|tester|reviewer|docs|security)
command: string
retry_context: (optional)
upstream_dependencies: (optional)
downstream_expectations: (optional)
metadata: (optional)
```

### Execution Result Return Mapping

将 Execution Result（io-contract.md §2）返回给 OpenClaw：

| Execution Result Field | OpenClaw Return Field | Mapping |
|------------------------|----------------------|---------|
| `dispatch_id` | `dispatch_id` | Direct |
| `project_id` | `project.id` | Direct |
| `milestone_id` | `milestone.id` | Direct |
| `task_id` | `task.id` | Direct |
| `role` | `role` | Direct |
| `command` | `command` | Direct |
| `status` | `execution_status` | Direct enum |
| `summary` | `summary` | Direct |
| `artifacts` | `artifacts` | Direct array |
| `changed_files` | `changed_files` | Direct array |
| `checks_performed` | `checks_performed` | Direct |
| `issues_found` | `issues_found` | Direct |
| `risks` | `risks` | Direct |
| `recommendation` | `recommendation` | Direct enum |
| `needs_followup` | `needs_followup` | Direct |
| `followup_suggestions` | `followup_suggestions` | Direct |
| `escalation` | `escalation` | Direct (if present) |

---

## 3. Escalation Mapping

当需要升级时，将 Escalation（io-contract.md §4）通过 API callback 发送给 OpenClaw：

| Escalation Field | OpenClaw API Action | Format |
|------------------|---------------------|--------|
| `escalation_id` | API callback payload | POST to escalation endpoint |
| `summary` | API payload body | JSON structured |
| `blocking_points` | API payload array | `blocking_points: []` |
| `recommended_next_steps` | API payload array | `recommended_next_steps: []` |
| `requires_user_decision` | API payload boolean | `requires_user_decision: bool` |
| `options` | API payload array | `options: []` |
| `evidence` | API payload object | `evidence: {}` |

### Escalation API Callback Schema

```json
POST /api/v1/escalations
{
  "escalation_id": "string",
  "dispatch_id": "string",
  "project_id": "string",
  "milestone_id": "string",
  "task_id": "string",
  "role": "string",
  "level": "INTERNAL|USER",
  "reason_type": "enum",
  "summary": "string",
  "blocking_points": ["string"],
  "evidence": {
    "related_artifacts": ["string"],
    "logs": ["string"],
    "failure_history": []
  },
  "attempted_actions": ["string"],
  "recommended_next_steps": ["string"],
  "options": [
    {
      "option_id": "string",
      "description": "string",
      "pros": ["string"],
      "cons": ["string"]
    }
  ],
  "recommended_option": "string",
  "required_decision": "string",
  "impact_if_continue": "string",
  "impact_if_stop": "string",
  "requires_user_decision": true,
  "requires_acknowledgment": true,
  "created_at": "timestamp"
}
```

### Escalation Response Handling

OpenClaw 应响应 escalation callback：

| Response | Action | Notes |
|----------|--------|-------|
| `acknowledged` | Wait for decision | OpenClaw processing |
| `decision_made` | Continue with decision | Decision provided |
| `escalate_further` | Escalate to USER | OpenClaw escalating |
| `abort` | Stop execution | OpenClaw aborting task |

---

## 4. Retry Strategy

### Retry Configuration

| Property | Value | Notes |
|----------|-------|-------|
| **Strategy** | Auto-retry with log | Automatic retry with logging |
| **Max Retry** | 2 (configurable) | Default 2, can be configured |
| **Trigger** | OpenClaw policy | Determined by OpenClaw retry policy |
| **Backoff** | Exponential | 1m → 2m → 4m |
| **Notification** | API log + callback | Log retry, callback if exceeded |

### Retry Flow

```
1. Dispatch execution fails
2. Log failure to OpenClaw API
3. Check retry_context.retry_count
4. If < max_retry:
   a. Prepare retry_context with incremented count
   b. Request re-dispatch from OpenClaw
   c. OpenClaw re-dispatches with retry_context
5. If max_retry exceeded:
   a. Generate escalation
   b. Callback to OpenClaw escalation endpoint
```

### Retry Log Schema

```json
POST /api/v1/retries
{
  "retry_id": "string",
  "dispatch_id": "string",
  "retry_count": number,
  "max_retry": number,
  "previous_failure_reason": "string",
  "previous_output_summary": "string",
  "required_fixes": ["string"],
  "retry_strategy": "auto",
  "backoff_seconds": number,
  "timestamp": "timestamp"
}
```

### Configurable Retry Policy

OpenClaw 可通过 dispatch message 配置 retry policy：

```yaml
retry_config:
  strategy: auto | manual | disabled
  max_retry: integer (default: 2)
  backoff_type: exponential | linear | fixed
  backoff_initial_seconds: integer (default: 60)
```

---

## 5. Interface Requirements

### Required Interface Implementation

适配器必须实现 `OrchestratorAdapter` 接口（io-contract.md §8）：

```typescript
interface OpenClawAdapter extends OrchestratorAdapter {
  // Core Methods (Required)
  normalizeInput(message: OpenClawDispatchMessage): DispatchPayload;
  validateDispatch(dispatch: DispatchPayload): ValidationResult;
  routeToExecution(dispatch: DispatchPayload): void;
  mapError(error: OpenClawApiError): ExecutionStatus;
  
  // Escalation Method (Required for OpenClaw)
  generateEscalation(context: EscalationContext): Escalation;
  sendEscalationCallback(escalation: Escalation): EscalationResponse;
  
  // Retry Method (Required for Auto-retry)
  handleRetry(retryContext: RetryContext): RetryDecision;
  logRetry(retryLog: RetryLog): void;
  
  // Result Return Methods (Required for OpenClaw)
  sendExecutionResult(result: ExecutionResult): void;
  sendHeartbeat(dispatchId: string, status: string): void;
  
  // Adapter-specific Methods
  validateOpenClawMessage(message: OpenClawDispatchMessage): ValidationResult;
  parseOpenClawContext(context: OpenClawContext): DispatchContext;
  
  // Metadata
  getAdapterInfo(): AdapterInfo;
}
```

### Custom Type Definitions

```typescript
interface OpenClawDispatchMessage {
  dispatch_id: string;
  project: OpenClawProject;
  milestone: OpenClawMilestone;
  task: OpenClawTask;
  role: RoleEnum;
  command: string;
  retry_context?: RetryContext;
  upstream_dependencies?: Dependency[];
  downstream_expectations?: string[];
  metadata?: Record<string, any>;
}

interface OpenClawProject {
  id: string;
  name: string;
  goal: string;
}

interface OpenClawMilestone {
  id: string;
  name: string;
  goal: string;
  status: 'planned' | 'active' | 'completed' | 'blocked';
}

interface OpenClawTask {
  id: string;
  title: string;
  goal: string;
  description: string;
  context: OpenClawContext;
  constraints: string[];
  inputs: ArtifactReference[];
  expected_outputs: string[];
  verification_steps: string[];
  risk_level: RiskLevelEnum;
}

interface OpenClawContext {
  project_goal: string;
  milestone_goal: string;
  task_scope: string;
  related_spec_sections: string[];
  code_context_summary: string;
}

interface EscalationResponse {
  status: 'acknowledged' | 'decision_made' | 'escalate_further' | 'abort';
  decision?: string;
  next_action?: string;
  timestamp: string;
}

interface RetryLog {
  retry_id: string;
  dispatch_id: string;
  retry_count: number;
  max_retry: number;
  previous_failure_reason: string;
  previous_output_summary: string;
  required_fixes: string[];
  retry_strategy: 'auto' | 'manual' | 'disabled';
  backoff_seconds: number;
  timestamp: string;
}
```

### API Endpoint Configuration

```typescript
interface OpenClawApiConfig {
  base_url: string;
  endpoints: {
    dispatch: string;         // Receive dispatch
    result: string;           // Send execution result
    escalation: string;       // Send escalation
    retry: string;            // Log retry
    heartbeat: string;        // Send heartbeat
    decision: string;         // Receive decision
  };
  authentication: {
    type: 'api_key' | 'oauth' | 'jwt';
    token_source: string;
  };
  retry_config: {
    max_retry: number;
    backoff_type: 'exponential' | 'linear' | 'fixed';
    backoff_initial_seconds: number;
  };
}
```

---

## 6. Implementation Considerations

### Authentication

| Method | Security Level | Recommended Use |
|--------|----------------|-----------------|
| JWT Token | High | Production (short-lived) |
| API Key | Medium | Development/testing |
| OAuth 2.0 | High | Enterprise integration |

**Token Validation**:
- Validate token signature
- Check expiration
- Validate issuer
- Check required scopes

### Connection Management

| Feature | Implementation | Notes |
|---------|----------------|-------|
| HTTP Client | Persistent connection | Connection pooling |
| Timeout | 30s default | Configurable |
| Retry | HTTP-level retry | For network errors |
| Keep-alive | Enabled | Reduce connection overhead |

### Heartbeat Mechanism

定期发送 heartbeat 告知 OpenClaw 执行状态：

```json
POST /api/v1/heartbeat
{
  "dispatch_id": "string",
  "status": "running|waiting|blocked",
  "progress": {
    "phase": "string",
    "percent_complete": number,
    "estimated_remaining_seconds": number
  },
  "timestamp": "timestamp"
}
```

建议 heartbeat 间隔：
- **Short tasks (< 5 min)**: 每 30 秒
- **Medium tasks (< 30 min)**: 每 2 分钟
- **Long tasks (> 30 min)**: 每 5 分钟

### Error Handling

| Error Type | Mapping | Response |
|------------|---------|----------|
| Connection timeout | FAILED_RETRYABLE | Retry with backoff |
| Authentication failed | BLOCKED | Escalate for auth |
| Invalid dispatch format | BLOCKED | Return validation errors |
| OpenClaw API error | FAILED_RETRYABLE | Retry HTTP call |
| Rate limited | BLOCKED | Wait and retry |

### Bidirectional Communication

OpenClaw Adapter 需要支持双向通信：

| Direction | Method | Purpose |
|-----------|--------|---------|
| OpenClaw → Adapter | HTTP POST | Dispatch message |
| Adapter → OpenClaw | HTTP POST | Execution result |
| Adapter → OpenClaw | HTTP POST | Escalation callback |
| Adapter → OpenClaw | HTTP POST | Heartbeat |
| OpenClaw → Adapter | WebSocket (optional) | Real-time decision |

---

## 7. Configuration Schema

Adapter 配置应符合 `workspace-configuration.schema.json` 并包含 OpenClaw 特定扩展：

```json
{
  "adapter_type": "orchestrator",
  "adapter_id": "openclaw",
  
  "openclaw_config": {
    "api_base_url": "${OPENCLAW_API_URL}",
    "authentication": {
      "type": "jwt",
      "token_source": "vault",
      "token_path": "${OPENCLAW_TOKEN_PATH}"
    },
    
    "endpoints": {
      "dispatch": "/api/v1/dispatch",
      "result": "/api/v1/results",
      "escalation": "/api/v1/escalations",
      "retry": "/api/v1/retries",
      "heartbeat": "/api/v1/heartbeat"
    },
    
    "retry_config": {
      "strategy": "auto",
      "max_retry": 2,
      "backoff_type": "exponential",
      "backoff_initial_seconds": 60,
      "configurable": true
    },
    
    "heartbeat_config": {
      "enabled": true,
      "interval_seconds": 120,
      "task_length_thresholds": {
        "short": 300,
        "medium": 1800,
        "long": 3600
      }
    },
    
    "timeout_config": {
      "connection_timeout_ms": 5000,
      "request_timeout_ms": 30000,
      "max_wait_for_decision_ms": 300000
    }
  }
}
```

---

## 8. Integration Patterns

### Pattern 1: Direct Dispatch

```
OpenClaw → POST dispatch → OpenClaw Adapter
    → normalize → validate → route
    → Expert Pack Execution
    → Execution Result
    → POST result → OpenClaw
```

### Pattern 2: Escalation Flow

```
Expert Pack → Escalation → OpenClaw Adapter
    → POST escalation → OpenClaw
    → OpenClaw decision
    → POST decision → OpenClaw Adapter
    → Continue/Abort execution
```

### Pattern 3: Retry Flow

```
Execution fails → OpenClaw Adapter
    → POST retry log → OpenClaw
    → OpenClaw re-dispatch
    → POST dispatch → OpenClaw Adapter
    → Retry execution with retry_context
```

---

## 9. References

- `ADAPTERS.md` §Orchestrator Adapter §OpenClaw (Later)
- `io-contract.md` §1 (Dispatch Payload)
- `io-contract.md` §2 (Execution Result)
- `io-contract.md` §4 (Escalation)
- `io-contract.md` §8 (Adapter Interface Contract)
- `adapters/registry.json` (Adapter metadata)
- OpenClaw Manager Layer API Documentation (待定义)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial design document (Feature 020 T033) |