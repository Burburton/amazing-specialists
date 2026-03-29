# OpenClaw Orchestrator Adapter

## Overview

The OpenClaw Orchestrator Adapter enables bidirectional communication between the OpenClaw management layer and the OpenCode Expert Pack. It receives dispatch messages from OpenClaw, normalizes them to Dispatch Payloads, routes to execution, and returns execution results via API callbacks.

## Status

| Field | Value |
|-------|-------|
| **Adapter ID** | `openclaw` |
| **Adapter Type** | `orchestrator` |
| **Priority** | `later` |
| **Version** | `1.0.0` |
| **Status** | `implemented` |
| **Interface** | `OrchestratorAdapter` |

## Architecture

```
OpenClaw Manager Layer
        │
        ▼ POST dispatch
┌───────────────────┐
│  OpenClaw Adapter │
├───────────────────┤
│ Message Parser    │ → OpenClaw message → Dispatch Payload
│ Schema Validator  │ → Validate against io-contract.md §1
│ OpenClaw Client   │ → HTTP client with retry/timeout
└───────────────────┘
        │
        ▼ Dispatch Payload
Expert Pack Core (6-Role Execution)
        │
        ▼ Execution Result
┌───────────────────┐
│  OpenClaw Adapter │
├───────────────────┤
│ Result Sender     │ → POST /api/v1/results
│ Escalation Handler│ → POST /api/v1/escalations
│ Retry Handler     │ → POST /api/v1/retries
│ Heartbeat Sender  │ → POST /api/v1/heartbeat
└───────────────────┘
        │
        ▼
OpenClaw Manager Layer
```

## Components

| Component | File | Purpose |
|-----------|------|---------|
| **Main Adapter** | `index.js` | OrchestratorAdapter implementation |
| **Types** | `types.js` | TypeScript-compatible type definitions |
| **Config** | `openclaw.config.json` | Adapter configuration |
| **OpenClaw Client** | `openclaw-client.js` | HTTP client for OpenClaw API |
| **Message Parser** | `message-parser.js` | OpenClaw message → Dispatch Payload |
| **Schema Validator** | `schema-validator.js` | Dispatch Payload validation |
| **Result Sender** | `result-sender.js` | POST execution results |
| **Escalation Handler** | `escalation-handler.js` | POST escalation requests |
| **Retry Handler** | `retry-handler.js` | Retry logic with backoff |
| **Heartbeat Sender** | `heartbeat-sender.js` | Periodic heartbeat mechanism |

## Configuration

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPENCLAW_API_URL` | OpenClaw API base URL |
| `OPENCLAW_JWT_TOKEN` | JWT authentication token |
| `OPENCLAW_API_KEY` | API key (alternative to JWT) |

### Config File

```json
{
  "adapter_id": "openclaw",
  "adapter_type": "orchestrator",
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
      "request_timeout_ms": 30000
    }
  }
}
```

## Usage

### Initialize Adapter

```javascript
const { OpenClawAdapter } = require('./adapters/openclaw');
const config = require('./adapters/openclaw/openclaw.config.json');

const adapter = new OpenClawAdapter(config);
```

### Process Dispatch Message

```javascript
const openClawMessage = {
  dispatch_id: 'dispatch-123',
  project: { id: 'proj-001', name: 'My Project', goal: 'Build feature' },
  milestone: { id: 'ms-001', name: 'MVP', goal: 'Release MVP' },
  task: {
    id: 'task-001',
    title: 'Implement feature',
    goal: 'Create the feature',
    description: 'Detailed description...',
    context: { project_goal: '...', milestone_goal: '...', task_scope: '...' },
    constraints: ['Must pass tests'],
    inputs: [],
    expected_outputs: ['Working feature'],
    verification_steps: ['Run tests'],
    risk_level: 'low'
  },
  role: 'developer',
  command: 'feature-implementation'
};

const dispatch = adapter.normalizeInput(openClawMessage);
const validation = adapter.validateDispatch(dispatch);

if (validation.isValid) {
  adapter.routeToExecution(dispatch);
}
```

### Send Execution Result

```javascript
const result = {
  dispatch_id: 'dispatch-123',
  status: 'SUCCESS',
  summary: 'Feature implemented successfully',
  artifacts: [{
    artifact_id: 'impl-001',
    artifact_type: 'implementation-summary',
    path: 'src/feature.js',
    summary: 'New feature implementation'
  }],
  recommendation: 'CONTINUE'
};

await adapter.sendExecutionResult(result);
```

### Handle Escalation

```javascript
const escalation = adapter.generateEscalation({
  dispatch_id: 'dispatch-123',
  project_id: 'proj-001',
  milestone_id: 'ms-001',
  task_id: 'task-001',
  role: 'developer',
  summary: 'Blocked by missing dependency',
  blocking_points: ['External API not available'],
  recommended_next_steps: ['Wait for API team']
});

const response = await adapter.sendEscalationCallback(escalation);
// response.status: 'acknowledged' | 'decision_made' | 'escalate_further' | 'abort'
```

### Heartbeat During Long Execution

```javascript
// Start heartbeat for estimated 10-minute task
adapter.startHeartbeat('dispatch-123', 600);

// Update progress
adapter.updateHeartbeatProgress('dispatch-123', {
  phase: 'implementation',
  percent_complete: 50,
  estimated_remaining_seconds: 300
});

// Stop when done
adapter.stopHeartbeat('dispatch-123');
```

## OrchestratorAdapter Interface

| Method | Description |
|--------|-------------|
| `normalizeInput(message)` | Convert OpenClaw message to Dispatch Payload |
| `validateDispatch(dispatch)` | Validate against io-contract.md §1 |
| `routeToExecution(dispatch)` | Route to execution entry point |
| `mapError(error)` | Map API error to ExecutionStatus |
| `generateEscalation(context)` | Generate Escalation object |
| `sendEscalationCallback(escalation)` | POST escalation to OpenClaw |
| `handleRetry(retryContext)` | Decide retry/abort/escalate |
| `logRetry(retryLog)` | Log retry attempt |
| `sendExecutionResult(result)` | POST execution result |
| `sendHeartbeat(dispatchId, status, progress)` | POST heartbeat |
| `getAdapterInfo()` | Return adapter metadata |

## Error Mapping

| HTTP Status | ExecutionStatus |
|-------------|-----------------|
| 401, 403 | `BLOCKED` |
| 404 | `BLOCKED` |
| 422 | `FAILED_RETRYABLE` |
| 429 | `BLOCKED` |
| 500, 502, 503, 504 | `FAILED_RETRYABLE` |
| Connection timeout | `FAILED_RETRYABLE` |

## Retry Strategy

| Risk Level | Max Retries |
|------------|-------------|
| `low` | 2 |
| `medium` | 1 |
| `high` | 0 (immediate escalation) |
| `critical` | 0 (immediate escalation) |

**Backoff**: Exponential (`initial * 2^retryCount`), default 60s → 120s → 240s

## Heartbeat Intervals

| Task Length | Interval |
|-------------|----------|
| < 5 minutes | 30 seconds |
| 5-30 minutes | 2 minutes |
| > 30 minutes | 5 minutes |

## Integration

### Compatible Profiles

- `minimal` (21 MVP skills)
- `full` (37 skills)

### Compatible Workspaces

- `github-pr`
- `local-repo`
- `external-system`

## Testing

```bash
# Verify module loads
node -e "const { OpenClawAdapter } = require('./adapters/openclaw'); console.log('OK');"

# Run unit tests (when available)
cd adapters/openclaw
npm test
```

## Security

- JWT token with expiration checking
- API key authentication for development
- Token refresh before expiration (5 min threshold)
- Secure token storage via environment variables

## References

- `io-contract.md §1` - Dispatch Payload schema
- `io-contract.md §2` - Execution Result schema
- `io-contract.md §4` - Escalation schema
- `io-contract.md §8` - OrchestratorAdapter interface
- `specs/023-openclaw-adapter/spec.md` - Feature specification
- `docs/adapters/openclaw-adapter-design.md` - Design document

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial implementation |