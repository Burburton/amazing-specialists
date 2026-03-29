# Task Checklist: E2E Integration Tests

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 024-e2e-integration-tests |
| **Tasks Version** | 1.0.0 |
| **Created** | 2026-03-29 |
| **Based on** | plan.md v1.0.0, spec.md v1.0.0 |

---

## Task Summary

| Phase | Total | Pending | In Progress | Completed |
|-------|-------|---------|-------------|-----------|
| Phase 1: Infrastructure | 4 | 0 | 0 | 4 |
| Phase 2: Mock Helpers | 3 | 0 | 0 | 3 |
| Phase 3: Test Scenarios | 4 | 0 | 0 | 4 |
| Phase 4: Reporting & Docs | 3 | 0 | 0 | 3 |
| **Total** | **14** | **0** | **0** | **14** |

---

## Phase 1: Infrastructure

### T001: Create test directory structure
**Status**: Completed
**Priority**: High
**Dependencies**: None
**Parallel-Safe**: ✅ Yes

**Description**: Create the E2E test directory structure.

**Acceptance Criteria**:
- [x] Create `tests/e2e/setup/` directory
- [x] Create `tests/e2e/helpers/` directory
- [x] Create `tests/e2e/scenarios/` directory
- [x] Create `tests/e2e/test-reports/` directory
- [x] Create `tests/e2e/README.md` placeholder

**Output**: Directory structure

---

### T002: Implement mock-servers.js
**Status**: Completed
**Priority**: High
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Implement MockServerManager for Nock setup/teardown.

**Acceptance Criteria**:
- [x] Implement `MockServerManager` class
- [x] Implement `setupGitHubMocks()` method
- [x] Implement `setupOpenClawMocks()` method
- [x] Implement `cleanAll()` method
- [x] Implement `isDone()` method
- [x] Export class

**Output**: `tests/e2e/setup/mock-servers.js`

---

### T003: Implement test-fixtures.js
**Status**: Completed
**Priority**: High
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Create test data fixture factories.

**Acceptance Criteria**:
- [x] Implement `githubIssue()` fixture factory
- [x] Implement `openClawDispatch()` fixture factory
- [x] Implement `executionResult()` fixture factory
- [x] Implement `escalation()` fixture factory
- [x] Support override parameters
- [x] Export all fixtures

**Output**: `tests/e2e/setup/test-fixtures.js`

---

### T004: Implement environment.js
**Status**: Completed
**Priority**: Medium
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Create environment configuration for tests.

**Acceptance Criteria**:
- [x] Define default test configuration
- [x] Support environment variable overrides
- [x] Export configuration object

**Output**: `tests/e2e/setup/environment.js`

---

## Phase 2: Mock Helpers

### T005: Implement github-mock.js
**Status**: Completed
**Priority**: High
**Dependencies**: T002
**Parallel-Safe**: ✅ Yes

**Description**: Create GitHub API mock helper functions.

**Acceptance Criteria**:
- [x] Implement `mockGetIssue()` - GET /repos/{owner}/{repo}/issues/{number}
- [x] Implement `mockCreatePR()` - POST /repos/{owner}/{repo}/pulls
- [x] Implement `mockPostComment()` - POST /repos/{owner}/{repo}/issues/{number}/comments
- [x] Implement `mockAddLabels()` - POST /repos/{owner}/{repo}/issues/{number}/labels
- [x] Implement `mockGetPRFiles()` - GET /repos/{owner}/{repo}/pulls/{number}/files
- [x] Implement `mockCreateReview()` - POST /repos/{owner}/{repo}/pulls/{number}/reviews
- [x] Export all helpers

**Output**: `tests/e2e/helpers/github-mock.js`

---

### T006: Implement openclaw-mock.js
**Status**: Completed
**Priority**: High
**Dependencies**: T002
**Parallel-Safe**: ✅ Yes

**Description**: Create OpenClaw API mock helper functions.

**Acceptance Criteria**:
- [x] Implement `mockPostResult()` - POST /api/v1/results
- [x] Implement `mockPostEscalation()` - POST /api/v1/escalations
- [x] Implement `mockPostRetry()` - POST /api/v1/retries
- [x] Implement `mockPostHeartbeat()` - POST /api/v1/heartbeat
- [x] Support response customization
- [x] Export all helpers

**Output**: `tests/e2e/helpers/openclaw-mock.js`

---

### T007: Implement assertions.js
**Status**: Completed
**Priority**: Medium
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Create custom test assertion helpers.

**Acceptance Criteria**:
- [x] Implement `assertValidDispatchPayload()`
- [x] Implement `assertValidExecutionResult()`
- [x] Implement `assertValidEscalation()`
- [x] Export all assertions

**Output**: `tests/e2e/helpers/assertions.js`

---

## Phase 3: Test Scenarios

### T008: Implement github-issue-to-pr.test.js
**Status**: Completed
**Priority**: High
**Dependencies**: T005, T003
**Parallel-Safe**: ✅ Yes

**Description**: Implement GitHub Issue → PR workflow E2E tests.

**Test Cases**:
- [x] TC-001: Webhook with valid signature → dispatch created
- [x] TC-002: Issue labels parsed correctly (role, command, milestone, risk)
- [x] TC-003: Issue body parsed correctly (Context, Goal, Constraints)
- [x] TC-004: Dispatch payload validated against schema
- [x] TC-005: Execution result creates PR with files
- [x] TC-006: Review comments posted on PR
- [x] TC-007: Invalid webhook signature rejected
- [x] TC-008: Malformed issue body handled gracefully

**Output**: `tests/e2e/scenarios/github-issue-to-pr.test.js`

---

### T009: Implement openclaw-dispatch-callback.test.js
**Status**: Completed
**Priority**: High
**Dependencies**: T006, T003
**Parallel-Safe**: ✅ Yes

**Description**: Implement OpenClaw bidirectional communication E2E tests.

**Test Cases**:
- [x] TC-009: JWT authentication validated
- [x] TC-010: Message parsed to dispatch payload
- [x] TC-011: Execution result callback sent to /api/v1/results
- [x] TC-012: Escalation sent to /api/v1/escalations
- [x] TC-013: Decision response processed correctly
- [x] TC-014: Heartbeat sent during execution
- [x] TC-015: Retry with exponential backoff
- [x] TC-016: Authentication failure handled

**Output**: `tests/e2e/scenarios/openclaw-dispatch-callback.test.js`

---

### T010: Implement escalation-flow.test.js
**Status**: Completed
**Priority**: High
**Dependencies**: T006, T003
**Parallel-Safe**: ✅ Yes

**Description**: Implement escalation flow E2E tests.

**Test Cases**:
- [x] TC-017: Escalation generated with blocking points
- [x] TC-018: Escalation callback sent to OpenClaw
- [x] TC-019: 'acknowledged' response handled
- [x] TC-020: 'decision_made' response handled
- [x] TC-021: 'abort' response handled
- [x] TC-022: 'escalate_further' response handled

**Output**: `tests/e2e/scenarios/escalation-flow.test.js`

---

### T011: Implement retry-flow.test.js
**Status**: Completed
**Priority**: High
**Dependencies**: T006, T003
**Parallel-Safe**: ✅ Yes

**Description**: Implement retry flow E2E tests.

**Test Cases**:
- [x] TC-023: Low risk task retry allowed (max 2)
- [x] TC-024: Medium risk task retry limited (max 1)
- [x] TC-025: High/critical risk no auto-retry
- [x] TC-026: Exponential backoff calculation correct
- [x] TC-027: Retry attempt logged to OpenClaw
- [x] TC-028: Max retry exceeded triggers escalation

**Output**: `tests/e2e/scenarios/retry-flow.test.js`

---

## Phase 4: Reporting & Documentation

### T012: Implement report-generator.js
**Status**: Completed
**Priority**: Medium
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Create E2E test report generator.

**Acceptance Criteria**:
- [x] Implement `E2EReportGenerator` class
- [x] Implement `startRun()` method
- [x] Implement `recordTest()` method
- [x] Implement `endRun()` method
- [x] Implement `save()` method - saves JSON report
- [x] Report includes timestamp, duration, summary, failures
- [x] Export class

**Output**: `tests/e2e/helpers/report-generator.js`

---

### T013: Create README.md
**Status**: Completed
**Priority**: Medium
**Dependencies**: T008-T011
**Parallel-Safe**: ✅ Yes

**Description**: Create E2E test documentation.

**Acceptance Criteria**:
- [x] Document test structure
- [x] Document how to run tests
- [x] Document test scenarios
- [x] Document mock server setup
- [x] Document report format

**Output**: `tests/e2e/README.md`

---

### T014: Verify all tests pass
**Status**: Completed
**Priority**: High
**Dependencies**: T008-T012
**Parallel-Safe**: ❌ No

**Description**: Run all E2E tests and verify they pass.

**Acceptance Criteria**:
- [x] All tests pass (28 test cases)
- [x] No external API calls made (Nock verification)
- [x] Report file generated
- [x] Test duration < 60 seconds

**Output**: Test execution report

---

## Parallel Execution Matrix

### Sprint 1 (T001)
| Task | Can Start After |
|------|-----------------|
| T001 | Now |

### Sprint 2 (T002-T004)
| Task | Can Start After |
|------|-----------------|
| T002 | T001 |
| T003 | T001 |
| T004 | T001 |

All can run in parallel after T001.

### Sprint 3 (T005-T007)
| Task | Can Start After |
|------|-----------------|
| T005 | T002 |
| T006 | T002 |
| T007 | T001 |

All can run in parallel.

### Sprint 4 (T008-T011)
| Task | Can Start After |
|------|-----------------|
| T008 | T005, T003 |
| T009 | T006, T003 |
| T010 | T006, T003 |
| T011 | T006, T003 |

All test scenarios can run in parallel.

### Sprint 5 (T012-T013)
| Task | Can Start After |
|------|-----------------|
| T012 | T001 |
| T013 | T008-T011 |

Can run in parallel with test scenarios.

### Sprint 6 (T014)
| Task | Can Start After |
|------|-----------------|
| T014 | T008-T012 |

Final verification task.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial task checklist created |