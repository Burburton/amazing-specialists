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
**Status**: Pending
**Priority**: High
**Dependencies**: None
**Parallel-Safe**: ✅ Yes

**Description**: Create the E2E test directory structure.

**Acceptance Criteria**:
- [ ] Create `tests/e2e/setup/` directory
- [ ] Create `tests/e2e/helpers/` directory
- [ ] Create `tests/e2e/scenarios/` directory
- [ ] Create `tests/e2e/test-reports/` directory
- [ ] Create `tests/e2e/README.md` placeholder

**Output**: Directory structure

---

### T002: Implement mock-servers.js
**Status**: Pending
**Priority**: High
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Implement MockServerManager for Nock setup/teardown.

**Acceptance Criteria**:
- [ ] Implement `MockServerManager` class
- [ ] Implement `setupGitHubMocks()` method
- [ ] Implement `setupOpenClawMocks()` method
- [ ] Implement `cleanAll()` method
- [ ] Implement `isDone()` method
- [ ] Export class

**Output**: `tests/e2e/setup/mock-servers.js`

---

### T003: Implement test-fixtures.js
**Status**: Pending
**Priority**: High
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Create test data fixture factories.

**Acceptance Criteria**:
- [ ] Implement `githubIssue()` fixture factory
- [ ] Implement `openClawDispatch()` fixture factory
- [ ] Implement `executionResult()` fixture factory
- [ ] Implement `escalation()` fixture factory
- [ ] Support override parameters
- [ ] Export all fixtures

**Output**: `tests/e2e/setup/test-fixtures.js`

---

### T004: Implement environment.js
**Status**: Pending
**Priority**: Medium
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Create environment configuration for tests.

**Acceptance Criteria**:
- [ ] Define default test configuration
- [ ] Support environment variable overrides
- [ ] Export configuration object

**Output**: `tests/e2e/setup/environment.js`

---

## Phase 2: Mock Helpers

### T005: Implement github-mock.js
**Status**: Pending
**Priority**: High
**Dependencies**: T002
**Parallel-Safe**: ✅ Yes

**Description**: Create GitHub API mock helper functions.

**Acceptance Criteria**:
- [ ] Implement `mockGetIssue()` - GET /repos/{owner}/{repo}/issues/{number}
- [ ] Implement `mockCreatePR()` - POST /repos/{owner}/{repo}/pulls
- [ ] Implement `mockPostComment()` - POST /repos/{owner}/{repo}/issues/{number}/comments
- [ ] Implement `mockAddLabels()` - POST /repos/{owner}/{repo}/issues/{number}/labels
- [ ] Implement `mockGetPRFiles()` - GET /repos/{owner}/{repo}/pulls/{number}/files
- [ ] Implement `mockCreateReview()` - POST /repos/{owner}/{repo}/pulls/{number}/reviews
- [ ] Export all helpers

**Output**: `tests/e2e/helpers/github-mock.js`

---

### T006: Implement openclaw-mock.js
**Status**: Pending
**Priority**: High
**Dependencies**: T002
**Parallel-Safe**: ✅ Yes

**Description**: Create OpenClaw API mock helper functions.

**Acceptance Criteria**:
- [ ] Implement `mockPostResult()` - POST /api/v1/results
- [ ] Implement `mockPostEscalation()` - POST /api/v1/escalations
- [ ] Implement `mockPostRetry()` - POST /api/v1/retries
- [ ] Implement `mockPostHeartbeat()` - POST /api/v1/heartbeat
- [ ] Support response customization
- [ ] Export all helpers

**Output**: `tests/e2e/helpers/openclaw-mock.js`

---

### T007: Implement assertions.js
**Status**: Pending
**Priority**: Medium
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Create custom test assertion helpers.

**Acceptance Criteria**:
- [ ] Implement `assertValidDispatchPayload()`
- [ ] Implement `assertValidExecutionResult()`
- [ ] Implement `assertValidEscalation()`
- [ ] Export all assertions

**Output**: `tests/e2e/helpers/assertions.js`

---

## Phase 3: Test Scenarios

### T008: Implement github-issue-to-pr.test.js
**Status**: Pending
**Priority**: High
**Dependencies**: T005, T003
**Parallel-Safe**: ✅ Yes

**Description**: Implement GitHub Issue → PR workflow E2E tests.

**Test Cases**:
- [ ] TC-001: Webhook with valid signature → dispatch created
- [ ] TC-002: Issue labels parsed correctly (role, command, milestone, risk)
- [ ] TC-003: Issue body parsed correctly (Context, Goal, Constraints)
- [ ] TC-004: Dispatch payload validated against schema
- [ ] TC-005: Execution result creates PR with files
- [ ] TC-006: Review comments posted on PR
- [ ] TC-007: Invalid webhook signature rejected
- [ ] TC-008: Malformed issue body handled gracefully

**Output**: `tests/e2e/scenarios/github-issue-to-pr.test.js`

---

### T009: Implement openclaw-dispatch-callback.test.js
**Status**: Pending
**Priority**: High
**Dependencies**: T006, T003
**Parallel-Safe**: ✅ Yes

**Description**: Implement OpenClaw bidirectional communication E2E tests.

**Test Cases**:
- [ ] TC-009: JWT authentication validated
- [ ] TC-010: Message parsed to dispatch payload
- [ ] TC-011: Execution result callback sent to /api/v1/results
- [ ] TC-012: Escalation sent to /api/v1/escalations
- [ ] TC-013: Decision response processed correctly
- [ ] TC-014: Heartbeat sent during execution
- [ ] TC-015: Retry with exponential backoff
- [ ] TC-016: Authentication failure handled

**Output**: `tests/e2e/scenarios/openclaw-dispatch-callback.test.js`

---

### T010: Implement escalation-flow.test.js
**Status**: Pending
**Priority**: High
**Dependencies**: T006, T003
**Parallel-Safe**: ✅ Yes

**Description**: Implement escalation flow E2E tests.

**Test Cases**:
- [ ] TC-017: Escalation generated with blocking points
- [ ] TC-018: Escalation callback sent to OpenClaw
- [ ] TC-019: 'acknowledged' response handled
- [ ] TC-020: 'decision_made' response handled
- [ ] TC-021: 'abort' response handled
- [ ] TC-022: 'escalate_further' response handled

**Output**: `tests/e2e/scenarios/escalation-flow.test.js`

---

### T011: Implement retry-flow.test.js
**Status**: Pending
**Priority**: High
**Dependencies**: T006, T003
**Parallel-Safe**: ✅ Yes

**Description**: Implement retry flow E2E tests.

**Test Cases**:
- [ ] TC-023: Low risk task retry allowed (max 2)
- [ ] TC-024: Medium risk task retry limited (max 1)
- [ ] TC-025: High/critical risk no auto-retry
- [ ] TC-026: Exponential backoff calculation correct
- [ ] TC-027: Retry attempt logged to OpenClaw
- [ ] TC-028: Max retry exceeded triggers escalation

**Output**: `tests/e2e/scenarios/retry-flow.test.js`

---

## Phase 4: Reporting & Documentation

### T012: Implement report-generator.js
**Status**: Pending
**Priority**: Medium
**Dependencies**: T001
**Parallel-Safe**: ✅ Yes

**Description**: Create E2E test report generator.

**Acceptance Criteria**:
- [ ] Implement `E2EReportGenerator` class
- [ ] Implement `startRun()` method
- [ ] Implement `recordTest()` method
- [ ] Implement `endRun()` method
- [ ] Implement `save()` method - saves JSON report
- [ ] Report includes timestamp, duration, summary, failures
- [ ] Export class

**Output**: `tests/e2e/helpers/report-generator.js`

---

### T013: Create README.md
**Status**: Pending
**Priority**: Medium
**Dependencies**: T008-T011
**Parallel-Safe**: ✅ Yes

**Description**: Create E2E test documentation.

**Acceptance Criteria**:
- [ ] Document test structure
- [ ] Document how to run tests
- [ ] Document test scenarios
- [ ] Document mock server setup
- [ ] Document report format

**Output**: `tests/e2e/README.md`

---

### T014: Verify all tests pass
**Status**: Pending
**Priority**: High
**Dependencies**: T008-T012
**Parallel-Safe**: ❌ No

**Description**: Run all E2E tests and verify they pass.

**Acceptance Criteria**:
- [ ] All tests pass (28 test cases)
- [ ] No external API calls made (Nock verification)
- [ ] Report file generated
- [ ] Test duration < 60 seconds

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