# Implementation Plan: OpenClaw Orchestrator Adapter

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 023-openclaw-adapter |
| **Plan Version** | 1.0.0 |
| **Created** | 2026-03-29 |
| **Based on** | spec.md v1.0.0 |
| **Reference Implementation** | adapters/github-issue/ |

---

## 1. Implementation Strategy

### 1.1 Approach

Follow the established pattern from `adapters/github-issue/` as reference:

```
adapters/github-issue/
├── index.js               → Main adapter class (OrchestratorAdapter interface)
├── types.js               → TypeScript type definitions
├── *.config.json          → Adapter configuration
├── issue-parser.js        → Message parsing (label + body)
├── github-client.js       → HTTP API client with rate limiting
├── webhook-handler.js     → Incoming webhook handling
├── comment-templates.js   → Output formatting templates
├── retry-handler.js       → Retry logic with backoff
└── tests/                 → Unit and integration tests
```

### 1.2 Parallel-Safe Decomposition

The implementation decomposes into **6 parallel-safe units**:

| Unit | Scope | Dependencies | Parallel-Safe |
|------|-------|--------------|---------------|
| **U1: HTTP Client** | openclaw-client.js, rate-limit-tracker.js | None | ✅ Yes |
| **U2: Message Parser** | message-parser.js, schema-validator.js | U1 (types only) | ✅ Yes |
| **U3: Result Callback** | result-sender.js, execution-result-formatter.js | U1 | ✅ Yes |
| **U4: Escalation Handler** | escalation-handler.js, escalation-formatter.js | U1 | ✅ Yes |
| **U5: Retry Handler** | retry-handler.js, backoff-calculator.js | U1 | ✅ Yes |
| **U6: Heartbeat Mechanism** | heartbeat-sender.js, interval-calculator.js | U1 | ✅ Yes |

**Integration Unit** (after U1-U6 complete):
| Unit | Scope | Dependencies |
|------|-------|--------------|
| **U7: Main Adapter** | index.js, types.js, config | U1-U6 |

---

## 2. File Structure

### 2.1 Directory Layout

```
adapters/openclaw/
├── index.js                    # Main adapter class (OrchestratorAdapter)
├── types.js                    # TypeScript type definitions
├── openclaw.config.json        # Adapter configuration
├── openclaw-client.js          # HTTP client for OpenClaw API
├── message-parser.js           # OpenClaw message → Dispatch Payload
├── schema-validator.js         # Dispatch Payload validation
├── result-sender.js            # POST execution result to OpenClaw
├── escalation-handler.js       # POST escalation to OpenClaw
├── retry-handler.js            # Retry decision logic with backoff
├── heartbeat-sender.js         # Periodic heartbeat mechanism
├── comment-templates.js        # Not needed (API-based, no comments)
├── tests/
│   ├── unit/
│   │   ├── openclaw-client.test.js
│   │   ├── message-parser.test.js
│   │   ├── schema-validator.test.js
│   │   ├── result-sender.test.js
│   │   ├── escalation-handler.test.js
│   │   ├── retry-handler.test.js
│   │   └── heartbeat-sender.test.js
│   └── integration/
│       └── workflow.test.js    # Full workflow tests
└── README.md                   # Usage documentation
```

---

## 3. Component Specifications

### 3.1 Unit U1: HTTP Client (`openclaw-client.js`)

**Purpose**: Handle all HTTP communication with OpenClaw API.

**Key Features**:
- Connection pooling with keep-alive
- JWT/API key authentication
- Request timeout handling (5s connection, 30s request)
- Rate limit tracking (if OpenClaw provides headers)
- HTTP-level retry for network errors

**Interface**:
```javascript
class OpenClawClient {
  constructor(config);
  
  // Authentication
  setAuthToken(token);
  refreshToken();
  
  // API Methods
  postResult(dispatchId, executionResult);
  postEscalation(escalation);
  postRetryLog(retryLog);
  postHeartbeat(dispatchId, status, progress);
  
  // Utilities
  getRateLimitInfo();
  setTimeouts(connectionMs, requestMs);
}
```

**Dependencies**: None (standalone)

---

### 3.2 Unit U2: Message Parser (`message-parser.js`)

**Purpose**: Parse OpenClaw dispatch message into Dispatch Payload.

**Key Features**:
- Field mapping per spec.md §5.1
- Role enum validation (6 roles)
- Risk level enum validation (4 levels)
- dispatch_id generation if missing
- Context extraction from nested structure

**Interface**:
```javascript
class MessageParser {
  constructor(config);
  
  parse(openClawMessage);
  validateRole(role);
  validateRiskLevel(level);
  generateDispatchId();
  
  // Field mapping
  mapProject(projectObj);
  mapMilestone(milestoneObj);
  mapTask(taskObj);
  mapContext(contextObj);
}
```

**Output Schema** (Dispatch Payload per io-contract.md §1):
```javascript
{
  dispatch_id: string,
  project_id: string,
  milestone_id: string,
  task_id: string,
  role: RoleEnum,
  command: string,
  title: string,
  goal: string,
  description: string,
  context: DispatchContext,
  constraints: string[],
  inputs: ArtifactReference[],
  expected_outputs: string[],
  verification_steps: string[],
  risk_level: RiskLevelEnum,
  retry_context?: RetryContext
}
```

---

### 3.3 Unit U3: Result Sender (`result-sender.js`)

**Purpose**: POST execution result to OpenClaw `/api/v1/results`.

**Key Features**:
- Format Execution Result per spec.md §5.2
- Retry on HTTP errors (exponential backoff)
- Log failures for retry handler
- Timeout handling

**Interface**:
```javascript
class ResultSender {
  constructor(client, config);
  
  send(executionResult);
  formatForResultApi(result);
  handleSendError(error);
}
```

**API Payload Schema**:
```json
POST /api/v1/results
{
  "dispatch_id": "string",
  "execution_status": "SUCCESS|FAILED_RETRYABLE|FAILED_ESCALATE|BLOCKED",
  "summary": "string",
  "artifacts": [{ "artifact_id", "artifact_type", "path", "summary" }],
  "recommendation": "CONTINUE|REWORK|REPLAN|ESCALATE",
  "escalation": { ... }  // optional
}
```

---

### 3.4 Unit U4: Escalation Handler (`escalation-handler.js`)

**Purpose**: POST escalation request to OpenClaw `/api/v1/escalations`.

**Key Features**:
- Generate escalation from execution context
- Format escalation per design.md §3
- Handle OpenClaw response (acknowledged, decision_made, abort)
- Timeout handling for decision wait (max 5 minutes)

**Interface**:
```javascript
class EscalationHandler {
  constructor(client, config);
  
  send(escalationContext);
  generateEscalationId();
  formatForEscalationApi(context);
  handleResponse(response);
  waitForDecision(maxWaitMs);
}
```

**Response Handling**:
| Response | Action |
|----------|--------|
| `acknowledged` | Wait for decision callback |
| `decision_made` | Continue with provided decision |
| `escalate_further` | Mark as USER escalation |
| `abort` | Stop execution, return BLOCKED |

---

### 3.5 Unit U5: Retry Handler (`retry-handler.js`)

**Purpose**: Manage retry logic with configurable policy.

**Key Features**:
- Read retry_config from dispatch message
- Support strategies: auto, manual, disabled
- Exponential backoff calculation
- Risk-level limits (BR-002):
  - Low: max 2 retries
  - Medium: max 1 retry
  - High/Critical: no auto-retry
- Log retry attempts to OpenClaw

**Interface**:
```javascript
class RetryHandler {
  constructor(config);
  
  shouldRetry(retryContext);
  calculateBackoff(retryCount, config);
  getMaxRetry(riskLevel);
  logRetry(retryLog);
  
  // Strategy checks
  isAutoRetryEnabled();
  isManualRetryRequired();
  isRetryDisabled();
}
```

**Backoff Calculation**:
```
backoff = initial_seconds * (2 ^ retry_count)
Default: 60s → 120s → 240s
```

---

### 3.6 Unit U6: Heartbeat Sender (`heartbeat-sender.js`)

**Purpose**: Send periodic heartbeat to OpenClaw during long executions.

**Key Features**:
- Task-length-based intervals (BR-003):
  - Short (< 5 min): 30s
  - Medium (5-30 min): 2m
  - Long (> 30 min): 5m
- Progress tracking
- Graceful error handling (don't fail execution on heartbeat error)
- Heartbeat cancellation on completion

**Interface**:
```javascript
class HeartbeatSender {
  constructor(client, config);
  
  start(dispatchId, estimatedLength);
  stop(dispatchId);
  updateProgress(dispatchId, progress);
  
  calculateInterval(estimatedSeconds);
  sendHeartbeat(dispatchId, status, progress);
}
```

**Heartbeat Payload**:
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
  "timestamp": "ISO8601"
}
```

---

## 4. Main Adapter (`index.js`)

**Purpose**: Implement OrchestratorAdapter interface (io-contract.md §8).

**Interface Implementation**:
```javascript
class OpenClawAdapter {
  // Core Methods
  normalizeInput(message);         // → DispatchPayload
  validateDispatch(dispatch);      // → ValidationResult
  routeToExecution(dispatch);      // → routing info
  mapError(error);                 // → ExecutionStatus
  
  // Escalation Methods
  generateEscalation(context);     // → Escalation
  sendEscalationCallback(escalation); // → EscalationResponse
  
  // Retry Methods
  handleRetry(retryContext);       // → RetryDecision
  logRetry(retryLog);              // → void
  
  // Result Methods
  sendExecutionResult(result);     // → void
  sendHeartbeat(dispatchId, status); // → void
  
  // Metadata
  getAdapterInfo();                // → AdapterInfo
}
```

**Error Mapping**:
| Error Type | ExecutionStatus |
|------------|-----------------|
| Connection timeout | FAILED_RETRYABLE |
| Authentication failed | BLOCKED |
| Invalid message format | BLOCKED |
| OpenClaw API error (5xx) | FAILED_RETRYABLE |
| Rate limited | BLOCKED |

---

## 5. Configuration Schema (`openclaw.config.json`)

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
      "token_env_var": "OPENCLAW_JWT_TOKEN",
      "refresh_threshold_seconds": 300
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

## 6. Test Strategy

### 6.1 Unit Tests (per component)

| Component | Test File | Key Tests |
|-----------|-----------|-----------|
| OpenClaw Client | `openclaw-client.test.js` | Auth, timeout, retry, rate limit |
| Message Parser | `message-parser.test.js` | Field mapping, validation, generation |
| Schema Validator | `schema-validator.test.js` | Required fields, enum validation |
| Result Sender | `result-sender.test.js` | Formatting, retry, error handling |
| Escalation Handler | `escalation-handler.test.js` | Generation, response handling |
| Retry Handler | `retry-handler.test.js` | Strategy, backoff, risk-level rules |
| Heartbeat Sender | `heartbeat-sender.test.js` | Intervals, progress, graceful errors |

### 6.2 Integration Tests

| Test File | Scope |
|-----------|-------|
| `workflow.test.js` | Full dispatch → result flow |
| `workflow.test.js` | Escalation flow with decision |
| `workflow.test.js` | Retry flow with context |

### 6.3 Test Targets

- **Unit Tests**: 25+ tests per component (175+ total)
- **Integration Tests**: 10+ workflow tests
- **Coverage**: > 80% for all components

---

## 7. Implementation Order

### Phase 1: Core Components (Parallel)

| Task | Estimated Time | Dependencies |
|------|----------------|--------------|
| T1: Create types.js | 30 min | None |
| T2: Create openclaw-client.js | 2 hr | T1 |
| T3: Create message-parser.js | 2 hr | T1 |
| T4: Create schema-validator.js | 1 hr | T1 |
| T5: Create retry-handler.js | 1.5 hr | T1 |
| T6: Create result-sender.js | 1.5 hr | T2 |
| T7: Create escalation-handler.js | 1.5 hr | T2 |
| T8: Create heartbeat-sender.js | 1 hr | T2 |

### Phase 2: Integration (Sequential)

| Task | Estimated Time | Dependencies |
|------|----------------|--------------|
| T9: Create index.js | 2 hr | T2-T8 |
| T10: Create openclaw.config.json | 30 min | T9 |
| T11: Create README.md | 1 hr | T9, T10 |

### Phase 3: Testing (Parallel after Phase 2)

| Task | Estimated Time | Dependencies |
|------|----------------|--------------|
| T12: Unit tests for client | 1 hr | T2 |
| T13: Unit tests for parser | 1 hr | T3 |
| T14: Unit tests for validator | 30 min | T4 |
| T15: Unit tests for retry | 45 min | T5 |
| T16: Unit tests for result | 45 min | T6 |
| T17: Unit tests for escalation | 45 min | T7 |
| T18: Unit tests for heartbeat | 30 min | T8 |
| T19: Integration tests | 1.5 hr | T12-T18 |

### Phase 4: Registry Update

| Task | Estimated Time | Dependencies |
|------|----------------|--------------|
| T20: Update registry.json | 15 min | T9-T19 |

---

## 8. Parallel Execution Opportunities

### Sprint 1 (T1-T5)
- T1 (types.js) → blocks T2-T5
- T2-T5 can run in parallel after T1

### Sprint 2 (T6-T8)
- T6-T8 can run in parallel after T2

### Sprint 3 (T9-T11)
- T9 (index.js) must wait for T2-T8
- T10, T11 can run in parallel after T9

### Sprint 4 (T12-T19)
- All unit tests can run in parallel
- Integration tests wait for all unit tests

---

## 9. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| OpenClaw API not available | Mock client for testing; config for base_url |
| JWT token refresh complexity | Use API key for dev; JWT for prod |
| Heartbeat interval tuning | Configurable thresholds |
| Escalation response timeout | Max wait configurable (5 min default) |

---

## 10. Acceptance Criteria

| AC | Verification |
|----|--------------|
| AC-001: Accept POST to dispatch endpoint | Unit test message-parser |
| AC-002: Validate Content-Type | Integration test |
| AC-003: Authenticate with JWT/API key | Unit test client |
| AC-004: Parse OpenClaw schema | Unit test parser |
| AC-005: Map all fields to Dispatch Payload | Unit test parser |
| AC-006: Validate role enum | Unit test validator |
| AC-007: Validate risk_level enum | Unit test validator |
| AC-008: Generate dispatch_id if missing | Unit test parser |
| AC-009: POST Execution Result | Integration test |
| AC-010: Include all required fields | Unit test result-sender |
| AC-011: Handle API errors with retry | Unit test retry-handler |
| AC-012: POST Escalation | Integration test |
| AC-013: Include escalation details | Unit test escalation-handler |
| AC-014: Handle decision response | Unit test escalation-handler |
| AC-015: Read retry_config | Unit test retry-handler |
| AC-016: Support retry strategies | Unit test retry-handler |
| AC-017: Implement exponential backoff | Unit test retry-handler |
| AC-018: Log retry attempts | Integration test |
| AC-019: Send heartbeat | Unit test heartbeat-sender |
| AC-020: Include progress info | Unit test heartbeat-sender |
| AC-021: Handle heartbeat errors gracefully | Unit test heartbeat-sender |

---

## 11. References

- `specs/023-openclaw-adapter/spec.md` - Feature specification
- `docs/adapters/openclaw-adapter-design.md` - Design document
- `adapters/github-issue/index.js` - Reference implementation
- `io-contract.md §1` - Dispatch Payload schema
- `io-contract.md §2` - Execution Result schema
- `io-contract.md §4` - Escalation schema
- `io-contract.md §8` - Adapter Interface Contract
- `adapters/registry.json` - Adapter metadata

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial plan created |