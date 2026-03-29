# Task Checklist: OpenClaw Orchestrator Adapter

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 023-openclaw-adapter |
| **Tasks Version** | 1.0.0 |
| **Created** | 2026-03-29 |
| **Based on** | plan.md v1.0.0, spec.md v1.0.0 |

---

## Task Summary

| Phase | Total | Pending | In Progress | Completed |
|-------|-------|---------|-------------|-----------|
| Phase 1: Core Components | 8 | 0 | 0 | 8 |
| Phase 2: Integration | 3 | 0 | 0 | 3 |
| Phase 3: Testing | 8 | 0 | 0 | 8 |
| Phase 4: Registry Update | 1 | 0 | 0 | 1 |
| **Total** | **20** | **0** | **0** | **20** |

---

## Phase 1: Core Components

### T001: Create types.js
**Status**: Completed
**Priority**: High
**Dependencies**: None
**Parallel-Safe**: ✅ Yes (but blocks T002-T005)

**Description**: Define TypeScript type definitions for OpenClaw adapter.

**Acceptance Criteria**:
- [x] Define `OpenClawDispatchMessage` type (per spec.md §5.1)
- [x] Define `OpenClawProject`, `OpenClawMilestone`, `OpenClawTask` types
- [x] Define `OpenClawContext` type
- [x] Define `EscalationResponse` type (per design.md §3)
- [x] Define `RetryLog` type
- [x] Define `HeartbeatPayload` type
- [x] Export all types via module

**Output**: `adapters/openclaw/types.js` ✅

**Validation**: File exists, all types exported correctly. ✅

---

### T002: Create openclaw-client.js
**Status**: Completed
**Priority**: High
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes (with T003-T005)

**Description**: Implement HTTP client for OpenClaw API communication.

**Acceptance Criteria**:
- [x] Implement `OpenClawClient` class
- [x] Support JWT/API key authentication
- [x] Connection pooling with keep-alive
- [x] Timeout handling (5s connection, 30s request)
- [x] Rate limit tracking (if OpenClaw provides headers)
- [x] HTTP-level retry for network errors (max 3)
- [x] Implement `postResult()` method
- [x] Implement `postEscalation()` method
- [x] Implement `postRetryLog()` method
- [x] Implement `postHeartbeat()` method
- [x] Implement `setAuthToken()` method
- [x] Implement `refreshToken()` method
- [x] Implement `getRateLimitInfo()` method

**Output**: `adapters/openclaw/openclaw-client.js` ✅

**Validation**: All methods implemented, error handling works. ✅

---

### T003: Create message-parser.js
**Status**: Pending
**Priority**: High
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes (with T002, T004-T005)

**Description**: Parse OpenClaw dispatch message into Dispatch Payload.

**Acceptance Criteria**:
- [ ] Implement `MessageParser` class
- [ ] Implement `parse()` method (returns Dispatch Payload)
- [ ] Field mapping per spec.md §5.1:
  - [ ] `dispatch_id` → `dispatch_id`
  - [ ] `project.id` → `project_id`
  - [ ] `milestone.id` → `milestone_id`
  - [ ] `task.id` → `task_id`
  - [ ] `role` → `role` (with enum validation)
  - [ ] `command` → `command`
  - [ ] `task.title` → `title`
  - [ ] `task.goal` → `goal`
  - [ ] `task.description` → `description`
  - [ ] `task.context` → `context`
  - [ ] `task.constraints` → `constraints`
  - [ ] `task.inputs` → `inputs`
  - [ ] `task.expected_outputs` → `expected_outputs`
  - [ ] `task.verification_steps` → `verification_steps`
  - [ ] `task.risk_level` → `risk_level` (with enum validation)
  - [ ] `retry_context` → `retry_context` (if present)
- [ ] Implement `validateRole()` method (AC-006)
- [ ] Implement `validateRiskLevel()` method (AC-007)
- [ ] Implement `generateDispatchId()` method (AC-008)
- [ ] Implement `mapProject()` helper
- [ ] Implement `mapMilestone()` helper
- [ ] Implement `mapTask()` helper
- [ ] Implement `mapContext()` helper

**Output**: `adapters/openclaw/message-parser.js`

**Validation**: Parser correctly maps all fields, validation works.

---

### T004: Create schema-validator.js
**Status**: Pending
**Priority**: High
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes (with T002-T003, T005)

**Description**: Validate Dispatch Payload against io-contract.md §1 schema.

**Acceptance Criteria**:
- [ ] Implement `SchemaValidator` class
- [ ] Validate all required fields (14 fields per spec.md §5.1)
- [ ] Validate role enum (6 values: architect, developer, tester, reviewer, docs, security)
- [ ] Validate risk_level enum (4 values: low, medium, high, critical)
- [ ] Return `ValidationResult` with `isValid` and `errors[]`
- [ ] Error messages include field name and severity

**Output**: `adapters/openclaw/schema-validator.js`

**Validation**: Validator catches all invalid inputs.

---

### T005: Create retry-handler.js
**Status**: Pending
**Priority**: High
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes (with T002-T004)

**Description**: Implement retry logic with configurable policy.

**Acceptance Criteria**:
- [ ] Implement `RetryHandler` class
- [ ] Implement `shouldRetry()` method (returns RetryDecision)
- [ ] Read retry_config from dispatch message (AC-015)
- [ ] Support strategies: auto, manual, disabled (AC-016)
- [ ] Implement exponential backoff calculation (AC-017)
  - Formula: `backoff = initial_seconds * (2 ^ retry_count)`
  - Default: 60s → 120s → 240s
- [ ] Risk-level limits per BR-002:
  - [ ] Low: max 2 retries
  - [ ] Medium: max 1 retry
  - [ ] High/Critical: no auto-retry (immediate escalation)
- [ ] Implement `getMaxRetry()` method
- [ ] Implement `calculateBackoff()` method
- [ ] Implement `isAutoRetryEnabled()` method
- [ ] Implement `isManualRetryRequired()` method
- [ ] Implement `isRetryDisabled()` method
- [ ] Implement `logRetry()` method (AC-018)

**Output**: `adapters/openclaw/retry-handler.js`

**Validation**: Retry logic correctly handles all risk levels and strategies.

---

### T006: Create result-sender.js
**Status**: Pending
**Priority**: High
**Dependencies**: T002
**Parallel-Safe**: ✅ Yes (with T007-T008)

**Description**: POST execution result to OpenClaw `/api/v1/results`.

**Acceptance Criteria**:
- [ ] Implement `ResultSender` class
- [ ] Implement `send()` method (AC-009)
- [ ] Format Execution Result per spec.md §5.2:
  - [ ] `dispatch_id` → `dispatch_id`
  - [ ] `status` → `execution_status`
  - [ ] `summary` → `summary`
  - [ ] `artifacts` → `artifacts`
  - [ ] `recommendation` → `recommendation`
  - [ ] `escalation` → `escalation` (if present)
- [ ] Include all required fields (AC-010)
- [ ] Retry on HTTP errors (exponential backoff) (AC-011)
- [ ] Implement `formatForResultApi()` helper
- [ ] Implement `handleSendError()` helper
- [ ] Timeout handling (30s default)

**Output**: `adapters/openclaw/result-sender.js`

**Validation**: Result sender posts correctly formatted payload.

---

### T007: Create escalation-handler.js
**Status**: Pending
**Priority**: High
**Dependencies**: T002
**Parallel-Safe**: ✅ Yes (with T006, T008)

**Description**: POST escalation request to OpenClaw `/api/v1/escalations`.

**Acceptance Criteria**:
- [ ] Implement `EscalationHandler` class
- [ ] Implement `send()` method (AC-012)
- [ ] Generate escalation from execution context
- [ ] Format escalation per design.md §3:
  - [ ] `escalation_id`
  - [ ] `dispatch_id`
  - [ ] `project_id`, `milestone_id`, `task_id`
  - [ ] `role`, `level`, `reason_type`
  - [ ] `summary`, `blocking_points[]`
  - [ ] `evidence`, `attempted_actions[]`
  - [ ] `recommended_next_steps[]`, `options[]`
  - [ ] `recommended_option`, `required_decision`
  - [ ] `requires_user_decision`, `requires_acknowledgment`
- [ ] Include escalation details (AC-013)
- [ ] Handle OpenClaw response (AC-014):
  - [ ] `acknowledged` → Wait for decision
  - [ ] `decision_made` → Continue with decision
  - [ ] `escalate_further` → Mark as USER escalation
  - [ ] `abort` → Stop execution, return BLOCKED
- [ ] Implement `generateEscalationId()` helper
- [ ] Implement `formatForEscalationApi()` helper
- [ ] Implement `handleResponse()` method
- [ ] Implement `waitForDecision()` method (max 5 minutes)

**Output**: `adapters/openclaw/escalation-handler.js`

**Validation**: Escalation handler sends correctly formatted payload and handles responses.

---

### T008: Create heartbeat-sender.js
**Status**: Pending
**Priority**: High
**Dependencies**: T002
**Parallel-Safe**: ✅ Yes (with T006-T007)

**Description**: Send periodic heartbeat to OpenClaw during long executions.

**Acceptance Criteria**:
- [ ] Implement `HeartbeatSender` class
- [ ] Implement `start()` method (AC-019)
- [ ] Implement `stop()` method
- [ ] Implement `updateProgress()` method
- [ ] Task-length-based intervals per BR-003:
  - [ ] Short (< 5 min): 30 seconds
  - [ ] Medium (5-30 min): 2 minutes
  - [ ] Long (> 30 min): 5 minutes
- [ ] Implement `calculateInterval()` method
- [ ] Heartbeat payload (AC-020):
  - [ ] `dispatch_id`
  - [ ] `status` (running|waiting|blocked)
  - [ ] `progress` object (phase, percent_complete, estimated_remaining_seconds)
  - [ ] `timestamp`
- [ ] Implement `sendHeartbeat()` method
- [ ] Handle heartbeat errors gracefully (AC-021) - don't fail execution
- [ ] Heartbeat cancellation on completion
- [ ] Configurable enable/disable

**Output**: `adapters/openclaw/heartbeat-sender.js`

**Validation**: Heartbeat sender sends periodic updates without blocking execution.

---

## Phase 2: Integration

### T009: Create index.js (Main Adapter)
**Status**: Pending
**Priority**: High
**Dependencies**: T002-T008
**Parallel-Safe**: ❌ No (requires all components)

**Description**: Implement OrchestratorAdapter interface (io-contract.md §8).

**Acceptance Criteria**:
- [ ] Implement `OpenClawAdapter` class
- [ ] Implement `normalizeInput()` method (AC-001, AC-004, AC-005)
- [ ] Implement `validateDispatch()` method (AC-002, AC-006, AC-007)
- [ ] Implement `routeToExecution()` method
- [ ] Implement `mapError()` method (per design.md §6):
  - [ ] Connection timeout → FAILED_RETRYABLE
  - [ ] Authentication failed → BLOCKED
  - [ ] Invalid message format → BLOCKED
  - [ ] OpenClaw API error (5xx) → FAILED_RETRYABLE
  - [ ] Rate limited → BLOCKED
- [ ] Implement `generateEscalation()` method
- [ ] Implement `sendEscalationCallback()` method
- [ ] Implement `handleRetry()` method
- [ ] Implement `logRetry()` method
- [ ] Implement `sendExecutionResult()` method
- [ ] Implement `sendHeartbeat()` method
- [ ] Implement `getAdapterInfo()` method
- [ ] Accept POST requests to dispatch endpoint (AC-001)
- [ ] Validate Content-Type header (AC-002)
- [ ] Authenticate requests using JWT/API key (AC-003)

**Output**: `adapters/openclaw/index.js`

**Validation**: Adapter implements full OrchestratorAdapter interface.

---

### T010: Create openclaw.config.json
**Status**: Pending
**Priority**: Medium
**Dependencies**: T009
**Parallel-Safe**: ✅ Yes (with T011)

**Description**: Define adapter configuration schema.

**Acceptance Criteria**:
- [ ] Define adapter_id, adapter_type, priority, version
- [ ] Define openclaw_config section:
  - [ ] api_base_url (environment variable reference)
  - [ ] authentication (type, token_env_var, refresh_threshold)
  - [ ] endpoints (result, escalation, retry, heartbeat)
  - [ ] retry_config (strategy, max_retry, backoff_type, backoff_initial_seconds)
  - [ ] heartbeat_config (enabled, interval_seconds, task_length_thresholds)
  - [ ] timeout_config (connection_timeout_ms, request_timeout_ms, max_wait_for_decision_ms)
- [ ] Valid JSON format

**Output**: `adapters/openclaw/openclaw.config.json`

**Validation**: Config file is valid JSON with all required fields.

---

### T011: Create README.md
**Status**: Pending
**Priority**: Medium
**Dependencies**: T009, T010
**Parallel-Safe**: ✅ Yes (with T010)

**Description**: Document adapter usage, architecture, and troubleshooting.

**Acceptance Criteria**:
- [ ] Overview section (adapter purpose, status)
- [ ] Architecture diagram
- [ ] Components table
- [ ] Configuration section (environment variables, config file)
- [ ] Usage examples (dispatch reception, result posting)
- [ ] OrchestratorAdapter interface table
- [ ] Error mapping table
- [ ] Retry strategy section
- [ ] Heartbeat mechanism section
- [ ] Integration section (compatible profiles, workspaces)
- [ ] Testing section
- [ ] Troubleshooting section (common issues, debugging tips)
- [ ] Security best practices section
- [ ] References section
- [ ] Changelog section

**Output**: `adapters/openclaw/README.md`

**Validation**: README covers all usage scenarios.

---

## Phase 3: Testing

### T012: Unit tests for openclaw-client.js
**Status**: Pending
**Priority**: Medium
**Dependencies**: T002
**Parallel-Safe**: ✅ Yes (with T013-T019)

**Description**: Unit tests for HTTP client component.

**Test Cases**:
- [ ] Authentication: JWT token set/refresh
- [ ] Authentication: API key set
- [ ] Timeout: connection timeout handling
- [ ] Timeout: request timeout handling
- [ ] Retry: HTTP-level retry on network errors
- [ ] Rate limit: tracking rate limit info
- [ ] API methods: postResult success
- [ ] API methods: postResult failure with retry
- [ ] API methods: postEscalation success
- [ ] API methods: postRetryLog success
- [ ] API methods: postHeartbeat success
- [ ] Error handling: 5xx errors
- [ ] Error handling: 4xx errors
- [ ] Connection pooling: keep-alive

**Target**: 25+ tests

**Output**: `adapters/openclaw/tests/unit/openclaw-client.test.js`

**Validation**: All tests pass, coverage > 80%.

---

### T013: Unit tests for message-parser.js
**Status**: Pending
**Priority**: Medium
**Dependencies**: T003
**Parallel-Safe**: ✅ Yes (with T012, T014-T019)

**Description**: Unit tests for message parser component.

**Test Cases**:
- [ ] Field mapping: dispatch_id direct
- [ ] Field mapping: project.id → project_id
- [ ] Field mapping: milestone.id → milestone_id
- [ ] Field mapping: task.id → task_id
- [ ] Field mapping: role with validation
- [ ] Field mapping: command
- [ ] Field mapping: task.title → title
- [ ] Field mapping: task.goal → goal
- [ ] Field mapping: task.description → description
- [ ] Field mapping: task.context → context
- [ ] Field mapping: task.constraints → constraints
- [ ] Field mapping: task.inputs → inputs
- [ ] Field mapping: task.expected_outputs → expected_outputs
- [ ] Field mapping: task.verification_steps → verification_steps
- [ ] Field mapping: task.risk_level with validation
- [ ] Field mapping: retry_context (optional)
- [ ] Validation: role enum (6 values)
- [ ] Validation: role invalid value error
- [ ] Validation: risk_level enum (4 values)
- [ ] Validation: risk_level invalid value error
- [ ] Generation: dispatch_id if missing
- [ ] Full message parsing: valid message
- [ ] Full message parsing: missing optional fields

**Target**: 25+ tests

**Output**: `adapters/openclaw/tests/unit/message-parser.test.js`

**Validation**: All tests pass, coverage > 80%.

---

### T014: Unit tests for schema-validator.js
**Status**: Pending
**Priority**: Medium
**Dependencies**: T004
**Parallel-Safe**: ✅ Yes (with T012-T013, T015-T019)

**Description**: Unit tests for schema validator component.

**Test Cases**:
- [ ] Validation: all required fields present
- [ ] Validation: missing dispatch_id error
- [ ] Validation: missing project_id error
- [ ] Validation: missing milestone_id error
- [ ] Validation: missing task_id error
- [ ] Validation: missing role error
- [ ] Validation: missing command error
- [ ] Validation: missing title error
- [ ] Validation: missing goal error
- [ ] Validation: missing description error
- [ ] Validation: missing context error
- [ ] Validation: missing constraints error
- [ ] Validation: missing inputs error
- [ ] Validation: missing expected_outputs error
- [ ] Validation: missing verification_steps error
- [ ] Validation: missing risk_level error
- [ ] Validation: invalid role value
- [ ] Validation: invalid risk_level value
- [ ] Validation: multiple errors returned
- [ ] Validation: empty dispatch payload
- [ ] Validation: valid payload returns isValid=true

**Target**: 25+ tests

**Output**: `adapters/openclaw/tests/unit/schema-validator.test.js`

**Validation**: All tests pass, coverage > 80%.

---

### T015: Unit tests for retry-handler.js
**Status**: Pending
**Priority**: Medium
**Dependencies**: T005
**Parallel-Safe**: ✅ Yes (with T012-T014, T016-T019)

**Description**: Unit tests for retry handler component.

**Test Cases**:
- [ ] Strategy: auto enabled
- [ ] Strategy: manual required
- [ ] Strategy: disabled
- [ ] Backoff: exponential calculation (60s → 120s → 240s)
- [ ] Backoff: initial_seconds configurable
- [ ] Risk level: low max 2 retries
- [ ] Risk level: medium max 1 retry
- [ ] Risk level: high no auto-retry
- [ ] Risk level: critical no auto-retry
- [ ] shouldRetry: retry_count < max_retry
- [ ] shouldRetry: retry_count >= max_retry (escalate)
- [ ] shouldRetry: retry disabled
- [ ] shouldRetry: manual strategy
- [ ] getMaxRetry: per risk level
- [ ] logRetry: retry log generation
- [ ] Context: retry_context present

**Target**: 25+ tests

**Output**: `adapters/openclaw/tests/unit/retry-handler.test.js`

**Validation**: All tests pass, coverage > 80%.

---

### T016: Unit tests for result-sender.js
**Status**: Pending
**Priority**: Medium
**Dependencies**: T006
**Parallel-Safe**: ✅ Yes (with T012-T015, T017-T019)

**Description**: Unit tests for result sender component.

**Test Cases**:
- [ ] Formatting: dispatch_id mapping
- [ ] Formatting: status → execution_status
- [ ] Formatting: summary
- [ ] Formatting: artifacts
- [ ] Formatting: recommendation
- [ ] Formatting: escalation (optional)
- [ ] Send: success response
- [ ] Send: retry on HTTP error
- [ ] Send: timeout handling
- [ ] Send: authentication error
- [ ] Error handling: handleSendError
- [ ] Full result: SUCCESS status
- [ ] Full result: FAILED_RETRYABLE status
- [ ] Full result: FAILED_ESCALATE status
- [ ] Full result: BLOCKED status
- [ ] Full result: with artifacts
- [ ] Full result: with recommendation CONTINUE
- [ ] Full result: with recommendation ESCALATE

**Target**: 25+ tests

**Output**: `adapters/openclaw/tests/unit/result-sender.test.js`

**Validation**: All tests pass, coverage > 80%.

---

### T017: Unit tests for escalation-handler.js
**Status**: Pending
**Priority**: Medium
**Dependencies**: T007
**Parallel-Safe**: ✅ Yes (with T012-T016, T018-T019)

**Description**: Unit tests for escalation handler component.

**Test Cases**:
- [ ] Generation: escalation_id format
- [ ] Formatting: dispatch_id
- [ ] Formatting: project/milestone/task IDs
- [ ] Formatting: role, level, reason_type
- [ ] Formatting: summary, blocking_points
- [ ] Formatting: evidence, attempted_actions
- [ ] Formatting: recommended_next_steps, options
- [ ] Formatting: recommended_option, required_decision
- [ ] Formatting: requires_user_decision, requires_acknowledgment
- [ ] Send: success response
- [ ] Response: acknowledged handling
- [ ] Response: decision_made handling
- [ ] Response: escalate_further handling
- [ ] Response: abort handling
- [ ] waitForDecision: timeout (5 minutes)
- [ ] waitForDecision: decision received
- [ ] Error handling: HTTP error
- [ ] Full escalation: USER level
- [ ] Full escalation: INTERNAL level

**Target**: 25+ tests

**Output**: `adapters/openclaw/tests/unit/escalation-handler.test.js`

**Validation**: All tests pass, coverage > 80%.

---

### T018: Unit tests for heartbeat-sender.js
**Status**: Pending
**Priority**: Medium
**Dependencies**: T008
**Parallel-Safe**: ✅ Yes (with T012-T017, T019)

**Description**: Unit tests for heartbeat sender component.

**Test Cases**:
- [ ] Interval calculation: short (< 5 min) = 30s
- [ ] Interval calculation: medium (5-30 min) = 2m
- [ ] Interval calculation: long (> 30 min) = 5m
- [ ] Interval calculation: custom thresholds
- [ ] Start: heartbeat begins
- [ ] Start: interval set correctly
- [ ] Stop: heartbeat stops
- [ ] Stop: on completion
- [ ] Progress: updateProgress updates state
- [ ] Payload: dispatch_id
- [ ] Payload: status (running|waiting|blocked)
- [ ] Payload: progress object
- [ ] Payload: timestamp
- [ ] Send: success
- [ ] Send: graceful error handling (no execution fail)
- [ ] Send: network error ignored
- [ ] Configuration: enabled
- [ ] Configuration: disabled (no heartbeat)
- [ ] Multiple heartbeats: concurrent dispatches

**Target**: 25+ tests

**Output**: `adapters/openclaw/tests/unit/heartbeat-sender.test.js`

**Validation**: All tests pass, coverage > 80%.

---

### T019: Integration tests (workflow.test.js)
**Status**: Pending
**Priority**: High
**Dependencies**: T012-T018
**Parallel-Safe**: ❌ No (requires all unit tests)

**Description**: Full workflow integration tests.

**Test Cases**:
- [ ] Workflow 1: Direct dispatch flow
  - [ ] Receive OpenClaw dispatch message
  - [ ] Parse to Dispatch Payload
  - [ ] Validate payload
  - [ ] Route to execution (mock)
  - [ ] Send execution result
  - [ ] Result received by OpenClaw (mock)
- [ ] Workflow 2: Escalation flow
  - [ ] Execution fails
  - [ ] Generate escalation
  - [ ] Post escalation to OpenClaw
  - [ ] Receive decision response
  - [ ] Continue/Abort based on response
- [ ] Workflow 3: Retry flow
  - [ ] Execution fails (retryable)
  - [ ] Log retry to OpenClaw
  - [ ] Calculate backoff
  - [ ] Retry execution with retry_context
  - [ ] Success after retry
- [ ] Workflow 4: Heartbeat flow
  - [ ] Long execution starts
  - [ ] Heartbeat sent periodically
  - [ ] Progress updates
  - [ ] Execution completes
  - [ ] Heartbeat stops
- [ ] Workflow 5: Error mapping
  - [ ] Connection timeout → FAILED_RETRYABLE
  - [ ] Auth failure → BLOCKED
  - [ ] Invalid format → BLOCKED
- [ ] Workflow 6: Full adapter lifecycle
  - [ ] Initialize adapter
  - [ ] Process dispatch
  - [ ] Handle result
  - [ ] Cleanup

**Target**: 10+ tests

**Output**: `adapters/openclaw/tests/integration/workflow.test.js`

**Validation**: All workflows pass, covers full lifecycle.

---

## Phase 4: Registry Update

### T020: Update registry.json
**Status**: Pending
**Priority**: Low
**Dependencies**: T009-T019
**Parallel-Safe**: ❌ No (final task)

**Description**: Update adapter registry to mark OpenClaw as implemented.

**Acceptance Criteria**:
- [ ] Update `adapters/registry.json`
- [ ] Change `openclaw` entry status from `design-only` to `implemented`
- [ ] Add `entry_point` field: `adapters/openclaw/index.js`
- [ ] Add `config_file` field: `adapters/openclaw/openclaw.config.json`
- [ ] Add `test_coverage` field with test count
- [ ] Update `last_updated` date

**Output**: `adapters/registry.json`

**Validation**: Registry correctly reflects implemented status.

---

## Parallel Execution Matrix

### Sprint 1 (T001)
| Task | Can Start After |
|------|-----------------|
| T001 | Now |

### Sprint 2 (T002-T005)
| Task | Can Start After |
|------|-----------------|
| T002 | T001 |
| T003 | T001 |
| T004 | T001 |
| T005 | T001 |

All can run in parallel after T001.

### Sprint 3 (T006-T008)
| Task | Can Start After |
|------|-----------------|
| T006 | T002 |
| T007 | T002 |
| T008 | T002 |

All can run in parallel after T002.

### Sprint 4 (T009-T011)
| Task | Can Start After |
|------|-----------------|
| T009 | T002-T008 |
| T010 | T009 |
| T011 | T009 |

T009 blocks T010 and T011. T010 and T011 can run in parallel.

### Sprint 5 (T012-T018)
| Task | Can Start After |
|------|-----------------|
| T012 | T002 |
| T013 | T003 |
| T014 | T004 |
| T015 | T005 |
| T016 | T006 |
| T017 | T007 |
| T018 | T008 |

All unit tests can run in parallel.

### Sprint 6 (T019)
| Task | Can Start After |
|------|-----------------|
| T019 | T012-T018 |

Integration tests require all unit tests.

### Sprint 7 (T020)
| Task | Can Start After |
|------|-----------------|
| T020 | T019 |

Registry update is final task.

---

## Research Findings Integration

Based on librarian research (bg_b6440327), OpenClaw is actually:

**OpenClaw** = Open-source personal AI assistant framework (339K GitHub stars)
- Uses **ACP (Agent Communication Protocol)** for runtime integration
- `AcpRuntime` interface for adapters (ensureSession, runTurn, cancel, close)
- Streaming events: text_delta, status, tool_call, done, error

**Oh My OpenCode (OMO)** has existing integration pattern showing:
- HTTP Gateway approach for dispatch handling
- Payload format with event, instruction, text, context

**Impact on Implementation**:
- Consider ACP Runtime adapter approach for deep integration
- HTTP Gateway approach matches current design more closely
- Test kit available: `runAcpRuntimeAdapterContract`

**Decision**: Proceed with HTTP Gateway approach (matches spec.md design). Future enhancement could add ACP Runtime adapter.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial task checklist created |