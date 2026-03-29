# Feature Spec: OpenClaw Orchestrator Adapter

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 023-openclaw-adapter |
| **Feature Name** | OpenClaw Orchestrator Adapter |
| **Version** | 1.0.0 |
| **Status** | Implemented |
| **Created** | 2026-03-29 |
| **Priority** | Later |
| **Dependencies** | 020-orchestrator-and-workspace-adapters |

---

## 1. Overview

### 1.1 Purpose

Implement the OpenClaw Orchestrator Adapter to enable bidirectional communication between the OpenClaw management layer and the OpenCode Expert Pack. This adapter receives dispatch messages from OpenClaw, normalizes them to Dispatch Payloads, routes to execution, and returns execution results via API callbacks.

### 1.2 System Position

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

### 1.3 Scope

| In Scope | Out of Scope |
|----------|--------------|
| HTTP API client for OpenClaw | OpenClaw server implementation |
| Dispatch message parsing | OpenClaw decision logic |
| Execution result callback | OpenClaw UI/UX |
| Escalation callback | WebSocket real-time (optional) |
| Heartbeat mechanism | |
| Retry with configurable policy | |

---

## 2. Functional Requirements

### FR-001: Dispatch Message Reception

The adapter MUST receive OpenClaw dispatch messages via HTTP POST.

**Acceptance Criteria**:
- AC-001: Accept POST requests to configured dispatch endpoint
- AC-002: Validate Content-Type header (application/json)
- AC-003: Authenticate requests using JWT/API key
- AC-004: Parse OpenClaw message schema correctly

### FR-002: Dispatch Normalization

The adapter MUST normalize OpenClaw dispatch messages to Dispatch Payload format (io-contract.md §1).

**Acceptance Criteria**:
- AC-005: Map all required OpenClaw fields to Dispatch Payload
- AC-006: Validate role enum values (architect, developer, tester, reviewer, docs, security)
- AC-007: Validate risk_level enum values
- AC-008: Generate dispatch_id if not provided

### FR-003: Execution Result Callback

The adapter MUST send execution results back to OpenClaw via API callback.

**Acceptance Criteria**:
- AC-009: POST Execution Result to OpenClaw result endpoint
- AC-010: Include all required fields (dispatch_id, status, artifacts, etc.)
- AC-011: Handle API errors with retry

### FR-004: Escalation Callback

The adapter MUST send escalation requests to OpenClaw via API callback when execution cannot continue.

**Acceptance Criteria**:
- AC-012: POST Escalation to OpenClaw escalation endpoint
- AC-013: Include blocking_points, recommended_next_steps, options
- AC-014: Handle OpenClaw decision response (acknowledged, decision_made, abort)

### FR-005: Retry Handling

The adapter MUST support configurable retry policy from OpenClaw.

**Acceptance Criteria**:
- AC-015: Read retry_config from dispatch message
- AC-016: Support auto, manual, disabled strategies
- AC-017: Implement exponential backoff
- AC-018: Log retry attempts to OpenClaw retry endpoint

### FR-006: Heartbeat Mechanism

The adapter MUST send periodic heartbeats to OpenClaw during long-running executions.

**Acceptance Criteria**:
- AC-019: Send heartbeat based on task length (short: 30s, medium: 2m, long: 5m)
- AC-020: Include dispatch_id, status, progress
- AC-021: Handle heartbeat endpoint errors gracefully

---

## 3. Non-Functional Requirements

### NFR-001: Authentication Security

- Support JWT token validation with signature verification
- Support API key authentication for development
- Token expiration checking
- Secure token storage (environment variables, vault)

### NFR-002: Connection Reliability

- Connection pooling for HTTP client
- Configurable timeouts (connection: 5s, request: 30s)
- HTTP-level retry for network errors
- Keep-alive enabled

### NFR-003: Error Handling

- Map all error types to ExecutionStatus
- Structured error logging
- Graceful degradation on API failures

### NFR-004: Performance

- Handle 100+ concurrent dispatches
- Heartbeat overhead < 1% of execution time
- Memory-efficient message parsing

---

## 4. Business Rules

### BR-001: Role-Command Matching

Role must match allowed commands:
- `architect`: design-task, evaluate-tradeoff, design-review
- `developer`: implement-task, fix-task, refactor-task
- `tester`: test-task, regression-task, verify-edge-cases
- `reviewer`: review-task, compare-spec-vs-code, risk-review
- `docs`: sync-readme, update-docs, write-changelog
- `security`: security-check, permission-review, dependency-risk-review

### BR-002: Retry Count Limits

- Low risk: max 2 retries
- Medium risk: max 1 retry
- High/Critical risk: no auto-retry (immediate escalation)

### BR-003: Heartbeat Intervals

| Task Length | Interval |
|-------------|----------|
| < 5 minutes | 30 seconds |
| 5-30 minutes | 2 minutes |
| > 30 minutes | 5 minutes |

### BR-004: Token Refresh

- JWT tokens must be refreshed before expiration
- Refresh threshold: 5 minutes before expiry
- On refresh failure: escalate to OpenClaw

### BR-005: Request Timeout Handling

- Connection timeout: 5 seconds
- Request timeout: 30 seconds
- Max wait for decision: 5 minutes

---

## 5. Input/Output Mapping

### 5.1 Dispatch Input Mapping

| OpenClaw Field | Dispatch Payload Field | Mapping |
|----------------|------------------------|---------|
| `dispatch_id` | `dispatch_id` | Direct |
| `project.id` | `project_id` | Direct |
| `milestone.id` | `milestone_id` | Direct |
| `task.id` | `task_id` | Direct |
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

### 5.2 Execution Result Output Mapping

| Execution Result Field | OpenClaw Return Field |
|------------------------|----------------------|
| `dispatch_id` | `dispatch_id` |
| `status` | `execution_status` |
| `summary` | `summary` |
| `artifacts` | `artifacts` |
| `recommendation` | `recommendation` |
| `escalation` | `escalation` |

---

## 6. API Endpoints

### 6.1 OpenClaw API Endpoints (Adapter Calls)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/results` | POST | Send execution result |
| `/api/v1/escalations` | POST | Send escalation request |
| `/api/v1/retries` | POST | Log retry attempt |
| `/api/v1/heartbeat` | POST | Send heartbeat |

### 6.2 Adapter Endpoints (OpenClaw Calls)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/dispatch` | POST | Receive dispatch message |
| `/decision` | POST | Receive OpenClaw decision |

---

## 7. Configuration Schema

```json
{
  "adapter_id": "openclaw",
  "adapter_type": "orchestrator",
  "priority": "later",
  "version": "1.0.0",
  
  "openclaw_config": {
    "api_base_url": "${OPENCLAW_API_URL}",
    "authentication": {
      "type": "jwt",
      "token_env_var": "OPENCLAW_JWT_TOKEN"
    },
    "endpoints": {
      "result": "/api/v1/results",
      "escalation": "/api/v1/escalations",
      "retry": "/api/v1/retries",
      "heartbeat": "/api/v1/heartbeat"
    },
    "retry_config": {
      "strategy": "auto",
      "max_retry": 2,
      "backoff_type": "exponential",
      "backoff_initial_seconds": 60
    },
    "heartbeat_config": {
      "enabled": true,
      "interval_seconds": 120
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

## 9. Acceptance Criteria Summary

| AC ID | Description | Priority |
|-------|-------------|----------|
| AC-001 | Accept POST requests to dispatch endpoint | Must |
| AC-002 | Validate Content-Type header | Must |
| AC-003 | Authenticate requests using JWT/API key | Must |
| AC-004 | Parse OpenClaw message schema | Must |
| AC-005 | Map all required fields to Dispatch Payload | Must |
| AC-006 | Validate role enum values | Must |
| AC-007 | Validate risk_level enum values | Must |
| AC-008 | Generate dispatch_id if not provided | Should |
| AC-009 | POST Execution Result to OpenClaw | Must |
| AC-010 | Include all required fields in result | Must |
| AC-011 | Handle API errors with retry | Must |
| AC-012 | POST Escalation to OpenClaw | Must |
| AC-013 | Include escalation details | Must |
| AC-014 | Handle OpenClaw decision response | Must |
| AC-015 | Read retry_config from dispatch | Must |
| AC-016 | Support auto, manual, disabled strategies | Must |
| AC-017 | Implement exponential backoff | Must |
| AC-018 | Log retry attempts | Should |
| AC-019 | Send heartbeat based on task length | Should |
| AC-020 | Include progress info | Should |
| AC-021 | Handle heartbeat errors gracefully | Should |

---

## 10. References

- `docs/adapters/openclaw-adapter-design.md` - Design document
- `io-contract.md §1` - Dispatch Payload schema
- `io-contract.md §2` - Execution Result schema
- `io-contract.md §4` - Escalation schema
- `io-contract.md §8` - Adapter Interface Contract
- `adapters/interfaces/orchestrator-adapter.interface.ts` - TypeScript interface
- `adapters/github-issue/` - Reference implementation pattern
- `adapters/registry.json` - Adapter metadata

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial spec created |