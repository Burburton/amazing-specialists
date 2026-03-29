# Task Checklist: E2E Adapter Integration Tests

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 025-e2e-adapter-integration-tests |
| **Tasks Version** | 1.0.0 |
| **Created** | 2026-03-29 |
| **Based on** | plan.md v1.0.0, spec.md v1.0.0 |

---

## Task Summary

| Phase | Total | Pending | In Progress | Completed |
|-------|-------|---------|-------------|-----------|
| Phase 1: Infrastructure | 4 | 0 | 0 | 4 |
| Phase 2: GitHub Issue Tests | 7 | 0 | 0 | 7 |
| Phase 3: OpenClaw Tests | 6 | 0 | 0 | 6 |
| Phase 4: GitHub PR Tests | 4 | 0 | 0 | 4 |
| Phase 5: Local Repo Tests | 2 | 0 | 0 | 2 |
| Phase 6: Documentation | 4 | 0 | 0 | 4 |
| **Total** | **27** | **0** | **0** | **27** |

---

## Phase 1: Infrastructure Setup

### T001: Create test directory structure
**Status**: Completed
**Priority**: High
**Dependencies**: None
**Parallel-Safe**: ✅ Yes

**Description**: Create the E2E adapter test directory structure.

**Acceptance Criteria**:
- [x] Create `tests/e2e/adapters/` directory
- [x] Create `tests/e2e/adapters/fixtures/` directory
- [x] Create `tests/e2e/adapters/helpers/` directory

**Output**: Directory structure

---

### T002: Implement adapter-fixtures.js
**Status**: Completed
**Priority**: High
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Create test data fixtures for adapter tests.

**Acceptance Criteria**:
- [x] Implement `createGitHubWebhookPayload()` fixture
- [x] Implement `createGitHubIssue()` fixture
- [x] Implement `createOpenClawMessage()` fixture
- [x] Implement `createExecutionResult()` fixture
- [x] Implement `createEscalation()` fixture
- [x] Support deep merge overrides
- [x] Export all fixtures

**Output**: `tests/e2e/adapters/fixtures/adapter-fixtures.js`

---

### T003: Implement mock-config.js
**Status**: Completed
**Priority**: High
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Create mock configuration helper for Nock setup.

**Acceptance Criteria**:
- [x] Implement `setupGitHubNock(adapterConfig)` helper
- [x] Implement `setupOpenClawNock(adapterConfig)` helper
- [x] Implement `getAdapterConfig(adapterId)` loader
- [x] Export helpers

**Output**: `tests/e2e/adapters/helpers/mock-config.js`

---

### T004: Implement adapter-assertions.js
**Status**: Completed
**Priority**: High
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Create custom assertions for adapter validation.

**Acceptance Criteria**:
- [x] Implement `assertValidDispatchFromAdapter()`
- [x] Implement `assertValidExecutionResult()`
- [x] Implement `assertNockCallComplete()`
- [x] Implement `assertAdapterErrorMapping()`
- [x] Export all assertions

**Output**: `tests/e2e/adapters/helpers/adapter-assertions.js`

---

## Phase 2: GitHub Issue Adapter Tests

### T005: Implement webhook handling tests
**Status**: Completed
**Priority**: High
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-GI-001~003 webhook tests.

**Test Cases**:
- [x] TC-GI-001: Webhook with valid signature → dispatch created
- [x] TC-GI-002: Webhook signature verification timing-safe
- [x] TC-GI-003: Invalid webhook signature rejected

**Output**: `tests/e2e/adapters/github-issue-adapter.test.js` (partial)

---

### T006: Implement parsing flow tests
**Status**: Completed
**Priority**: High
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-GI-004~007 parsing tests.

**Test Cases**:
- [x] TC-GI-004: Issue labels parsed via LabelParser
- [x] TC-GI-005: Issue body parsed via BodyParser
- [x] TC-GI-006: Dispatch payload validated
- [x] TC-GI-007: Dispatch routed to execution

**Output**: `tests/e2e/adapters/github-issue-adapter.test.js` (partial)

---

### T007: Implement error mapping tests
**Status**: Completed
**Priority**: High
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-GI-008~009 error mapping tests.

**Test Cases**:
- [x] TC-GI-008: Error mapping: 404 → BLOCKED
- [x] TC-GI-009: Error mapping: 500 → FAILED_RETRYABLE

**Output**: `tests/e2e/adapters/github-issue-adapter.test.js` (partial)

---

### T008: Implement escalation flow tests
**Status**: Completed
**Priority**: High
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-GI-010~011 escalation tests.

**Test Cases**:
- [x] TC-GI-010: Escalation generation
- [x] TC-GI-011: Escalation posted via GitHub API (Nock)

**Output**: `tests/e2e/adapters/github-issue-adapter.test.js` (partial)

---

### T009: Implement retry flow tests
**Status**: Completed
**Priority**: High
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-GI-012~013 retry tests.

**Test Cases**:
- [x] TC-GI-012: Retry decision: low risk allowed
- [x] TC-GI-013: Retry decision: critical risk denied

**Output**: `tests/e2e/adapters/github-issue-adapter.test.js` (partial)

---

### T010: Implement result posting tests
**Status**: Completed
**Priority**: High
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-GI-014 result posting test.

**Test Cases**:
- [x] TC-GI-014: Execution result posted via GitHub API (Nock)

**Output**: `tests/e2e/adapters/github-issue-adapter.test.js` (partial)

---

### T011: Implement adapter info test
**Status**: Completed
**Priority**: Medium
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-GI-015 adapter info test.

**Test Cases**:
- [x] TC-GI-015: Adapter info returned

**Output**: `tests/e2e/adapters/github-issue-adapter.test.js` (complete)

---

## Phase 3: OpenClaw Adapter Tests

### T012: Implement JWT auth tests
**Status**: Completed
**Priority**: High
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-OC-001~003 JWT tests.

**Test Cases**:
- [x] TC-OC-001: JWT token validated
- [x] TC-OC-002: JWT expired rejected
- [x] TC-OC-003: JWT invalid signature rejected

**Output**: `tests/e2e/adapters/openclaw-adapter.test.js` (partial)

---

### T013: Implement message parsing test
**Status**: Completed
**Priority**: High
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-OC-004 message parsing test.

**Test Cases**:
- [x] TC-OC-004: Message parsed to dispatch payload

**Output**: `tests/e2e/adapters/openclaw-adapter.test.js` (partial)

---

### T014: Implement callback tests
**Status**: Completed
**Priority**: High
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-OC-005~008 callback tests.

**Test Cases**:
- [x] TC-OC-005: Execution result callback sent (Nock)
- [x] TC-OC-006: Escalation callback sent (Nock)
- [x] TC-OC-007: Retry callback sent (Nock)
- [x] TC-OC-008: Heartbeat sent during execution (Nock)

**Output**: `tests/e2e/adapters/openclaw-adapter.test.js` (partial)

---

### T015: Implement decision response tests
**Status**: Completed
**Priority**: High
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-OC-009~012 decision response tests.

**Test Cases**:
- [x] TC-OC-009: Decision response: acknowledged
- [x] TC-OC-010: Decision response: decision_made
- [x] TC-OC-011: Decision response: abort
- [x] TC-OC-012: Decision response: escalate_further

**Output**: `tests/e2e/adapters/openclaw-adapter.test.js` (partial)

---

### T016: Implement error mapping test
**Status**: Completed
**Priority**: Medium
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-OC-013 error mapping test.

**Test Cases**:
- [x] TC-OC-013: API error mapping

**Output**: `tests/e2e/adapters/openclaw-adapter.test.js` (partial)

---

### T017: Implement adapter info test
**Status**: Completed
**Priority**: Medium
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-OC-014 adapter info test.

**Test Cases**:
- [x] TC-OC-014: Adapter info returned

**Output**: `tests/e2e/adapters/openclaw-adapter.test.js` (complete)

---

## Phase 4: GitHub PR Adapter Tests

### T018: Implement PR creation tests
**Status**: Completed
**Priority**: High
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-PR-001~004 PR creation tests.

**Test Cases**:
- [x] TC-PR-001: PR created from execution result (Nock)
- [x] TC-PR-002: Branch created for PR (Nock)
- [x] TC-PR-003: Tree created with files (Nock)
- [x] TC-PR-004: Commit created (Nock)

**Output**: `tests/e2e/adapters/github-pr-adapter.test.js` (partial)

---

### T019: Implement artifact writing tests
**Status**: Completed
**Priority**: High
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-PR-005~006 artifact tests.

**Test Cases**:
- [x] TC-PR-005: Artifacts written to PR (Nock)
- [x] TC-PR-006: PR description includes execution summary

**Output**: `tests/e2e/adapters/github-pr-adapter.test.js` (partial)

---

### T020: Implement PR metadata tests
**Status**: Completed
**Priority**: Medium
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-PR-007~009 metadata tests.

**Test Cases**:
- [x] TC-PR-007: Review requested on PR (Nock)
- [x] TC-PR-008: Labels added to PR (Nock)
- [x] TC-PR-009: Execution result output formatted

**Output**: `tests/e2e/adapters/github-pr-adapter.test.js` (partial)

---

### T021: Implement adapter info test
**Status**: Completed
**Priority**: Medium
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-PR-010 adapter info test.

**Test Cases**:
- [x] TC-PR-010: Adapter info returned

**Output**: `tests/e2e/adapters/github-pr-adapter.test.js` (complete)

---

## Phase 5: Local Repo Adapter Tests

### T022: Implement workspace tests
**Status**: Completed
**Priority**: Medium
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-LR-001~006 workspace tests.

**Test Cases**:
- [x] TC-LR-001: Workspace initialized
- [x] TC-LR-002: Artifacts written to filesystem
- [x] TC-LR-003: Execution result logged
- [x] TC-LR-004: Changelog updated
- [x] TC-LR-005: README synced
- [x] TC-LR-006: Cleanup performed

**Output**: `tests/e2e/adapters/local-repo-adapter.test.js` (partial)

---

### T023: Implement adapter info test
**Status**: Completed
**Priority**: Low
**Dependencies**: T001-T004
**Parallel-Safe**: ✅ Yes

**Description**: Implement TC-LR-007 adapter info test.

**Test Cases**:
- [x] TC-LR-007: Adapter info returned

**Output**: `tests/e2e/adapters/local-repo-adapter.test.js` (complete)

---

## Phase 6: Documentation and Integration

### T024: Update README.md
**Status**: Completed
**Priority**: Medium
**Dependencies**: T005-T023
**Parallel-Safe**: ✅ Yes

**Description**: Update E2E README with adapter test section.

**Acceptance Criteria**:
- [x] Add adapter tests section to `tests/e2e/README.md`
- [x] Document test architecture (3-level diagram)
- [x] Document running instructions

**Output**: Updated `tests/e2e/README.md`

---

### T025: Add npm scripts
**Status**: Completed
**Priority**: Medium
**Dependencies**: T005-T023
**Parallel-Safe**: ✅ Yes

**Description**: Add npm scripts for adapter tests.

**Acceptance Criteria**:
- [x] Add `test:e2e:adapters` script
- [x] Add `test:e2e:github-issue` script
- [x] Add `test:e2e:openclaw` script
- [x] Add `test:e2e:github-pr` script
- [x] Add `test:e2e:local-repo` script

**Output**: Updated `package.json`

---

### T026: Verify all tests pass
**Status**: Completed
**Priority**: High
**Dependencies**: T005-T025
**Parallel-Safe**: ❌ No

**Description**: Run all E2E adapter tests and verify they pass.

**Acceptance Criteria**:
- [x] All 46 test cases pass
- [x] No external API calls made (Nock verification)
- [x] Test duration < 120 seconds total
- [x] Coverage > 90% on adapter index.js

**Output**: Test execution results

---

### T027: Generate test report
**Status**: Completed
**Priority**: Low
**Dependencies**: T026
**Parallel-Safe**: ❌ No

**Description**: Generate E2E adapter test report.

**Acceptance Criteria**:
- [x] Report includes pass/fail counts
- [x] Report includes coverage summary
- [x] Report saved to `tests/e2e/test-reports/`

**Output**: `tests/e2e/test-reports/e2e-adapter-report-{timestamp}.json`

---

## Parallel Execution Matrix

### Sprint 1 (Phase 1)
| Task | Can Start After |
|------|-----------------|
| T001 | Now |
| T002-T004 | T001 |

All Phase 1 tasks can run in parallel after T001.

### Sprint 2 (Phase 2)
| Task | Can Start After |
|------|-----------------|
| T005-T011 | Phase 1 complete |

All GitHub Issue tests can run in parallel.

### Sprint 3 (Phases 3-5)
| Task | Can Start After |
|------|-----------------|
| T012-T017 (OpenClaw) | Phase 1 complete |
| T018-T021 (GitHub PR) | Phase 1 complete |
| T022-T023 (Local Repo) | Phase 1 complete |

All can run parallel with Phase 2.

### Sprint 4 (Phase 6)
| Task | Can Start After |
|------|-----------------|
| T024-T025 | Phases 2-5 complete |
| T026 | T024-T025 |
| T027 | T026 |

Sequential verification.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial task checklist created |