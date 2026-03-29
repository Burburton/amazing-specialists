# Implementation Plan: E2E Integration Tests

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 024-e2e-integration-tests |
| **Plan Version** | 1.0.0 |
| **Created** | 2026-03-29 |
| **Based on** | spec.md v1.0.0 |

---

## 1. Implementation Strategy

### 1.1 Approach

Use Nock library to mock HTTP requests to external APIs (GitHub, OpenClaw). Tests will run against real adapter code but with mocked network responses.

### 1.2 Parallel-Safe Decomposition

| Unit | Scope | Dependencies | Parallel-Safe |
|------|-------|--------------|---------------|
| U1: Test Infrastructure | setup/, helpers/ | None | ✅ Yes |
| U2: GitHub Mocks | github-mock.js | U1 | ✅ Yes |
| U3: OpenClaw Mocks | openclaw-mock.js | U1 | ✅ Yes |
| U4: GitHub Workflow Tests | github-issue-to-pr.test.js | U1-U2 | ✅ Yes |
| U5: OpenClaw Workflow Tests | openclaw-dispatch-callback.test.js | U1, U3 | ✅ Yes |
| U6: Escalation Flow Tests | escalation-flow.test.js | U1, U3 | ✅ Yes |
| U7: Retry Flow Tests | retry-flow.test.js | U1, U3 | ✅ Yes |
| U8: Report Generator | report-generator.js | U1 | ✅ Yes |

---

## 2. File Structure

```
tests/e2e/
├── setup/
│   ├── mock-servers.js          # Nock global setup/teardown
│   ├── test-fixtures.js         # Test data factories
│   └── environment.js           # Environment configuration
│
├── helpers/
│   ├── github-mock.js           # GitHub API mock helpers
│   ├── openclaw-mock.js         # OpenClaw API mock helpers
│   └── assertions.js            # Custom test assertions
│
├── scenarios/
│   ├── github-issue-to-pr.test.js
│   ├── openclaw-dispatch-callback.test.js
│   ├── escalation-flow.test.js
│   └── retry-flow.test.js
│
├── test-reports/
│   └── .gitkeep
│
└── README.md
```

---

## 3. Component Specifications

### 3.1 Mock Servers Setup (`setup/mock-servers.js`)

```javascript
const nock = require('nock');

class MockServerManager {
  constructor() {
    this.scopes = [];
  }
  
  setupGitHubMocks(config) { /* ... */ }
  setupOpenClawMocks(config) { /* ... */ }
  cleanAll() { nock.cleanAll(); }
  isDone() { return this.scopes.every(s => s.isDone()); }
}

module.exports = { MockServerManager };
```

### 3.2 Test Fixtures (`setup/test-fixtures.js`)

```javascript
const fixtures = {
  githubIssue: (overrides = {}) => ({ /* ... */ }),
  openClawDispatch: (overrides = {}) => ({ /* ... */ }),
  executionResult: (overrides = {}) => ({ /* ... */ }),
  escalation: (overrides = {}) => ({ /* ... */ })
};

module.exports = fixtures;
```

### 3.3 GitHub Mock Helpers (`helpers/github-mock.js`)

```javascript
const mockGetIssue = (owner, repo, number, response) => { /* ... */ };
const mockCreatePR = (owner, repo, response) => { /* ... */ };
const mockPostComment = (owner, repo, number, response) => { /* ... */ };
const mockAddLabels = (owner, repo, number, response) => { /* ... */ };

module.exports = {
  mockGetIssue,
  mockCreatePR,
  mockPostComment,
  mockAddLabels
};
```

### 3.4 OpenClaw Mock Helpers (`helpers/openclaw-mock.js`)

```javascript
const mockPostResult = (response) => { /* ... */ };
const mockPostEscalation = (response) => { /* ... */ };
const mockPostRetry = (response) => { /* ... */ };
const mockPostHeartbeat = (response) => { /* ... */ };

module.exports = {
  mockPostResult,
  mockPostEscalation,
  mockPostRetry,
  mockPostHeartbeat
};
```

---

## 4. Test Scenarios

### 4.1 GitHub Issue → PR Workflow

**Test File**: `scenarios/github-issue-to-pr.test.js`

**Test Cases**:
1. TC-001: Webhook with valid signature → dispatch created
2. TC-002: Issue labels parsed correctly
3. TC-003: Issue body parsed correctly
4. TC-004: Dispatch payload validated
5. TC-005: Execution result creates PR
6. TC-006: Review comments posted
7. TC-007: Invalid signature rejected
8. TC-008: Malformed body handled

### 4.2 OpenClaw Bidirectional

**Test File**: `scenarios/openclaw-dispatch-callback.test.js`

**Test Cases**:
1. TC-009: JWT auth validated
2. TC-010: Message parsed to dispatch
3. TC-011: Result callback sent
4. TC-012: Escalation sent
5. TC-013: Decision processed
6. TC-014: Heartbeat sent
7. TC-015: Retry with backoff
8. TC-016: Auth failure handled

### 4.3 Escalation Flow

**Test File**: `scenarios/escalation-flow.test.js`

**Test Cases**:
1. TC-017: Escalation generated
2. TC-018: Callback sent
3. TC-019: 'acknowledged' handled
4. TC-020: 'decision_made' handled
5. TC-021: 'abort' handled
6. TC-022: 'escalate_further' handled

### 4.4 Retry Flow

**Test File**: `scenarios/retry-flow.test.js`

**Test Cases**:
1. TC-023: Low risk retry allowed
2. TC-024: Medium risk retry limited
3. TC-025: High/critical no retry
4. TC-026: Exponential backoff
5. TC-027: Retry logged
6. TC-028: Max exceeded escalation

---

## 5. Report Generator

**File**: `helpers/report-generator.js`

```javascript
class E2EReportGenerator {
  constructor(outputDir) { /* ... */ }
  
  startRun() { /* ... */ }
  recordTest(test) { /* ... */ }
  endRun() { /* ... */ }
  save() { /* ... */ }
}

module.exports = { E2EReportGenerator };
```

**Report Format**:
```json
{
  "timestamp": "ISO8601",
  "duration_ms": 0,
  "summary": {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "skipped": 0
  },
  "scenarios": [],
  "failures": []
}
```

---

## 6. Implementation Order

### Phase 1: Infrastructure (Parallel)

| Task | Estimated Time | Dependencies |
|------|----------------|--------------|
| T1: Create test directory structure | 10 min | None |
| T2: Implement mock-servers.js | 30 min | T1 |
| T3: Implement test-fixtures.js | 20 min | T1 |
| T4: Implement environment.js | 10 min | T1 |

### Phase 2: Mock Helpers (Parallel)

| Task | Estimated Time | Dependencies |
|------|----------------|--------------|
| T5: Implement github-mock.js | 45 min | T2 |
| T6: Implement openclaw-mock.js | 30 min | T2 |
| T7: Implement assertions.js | 20 min | T1 |

### Phase 3: Test Scenarios (Parallel)

| Task | Estimated Time | Dependencies |
|------|----------------|--------------|
| T8: Implement github-issue-to-pr.test.js | 1 hr | T5, T3 |
| T9: Implement openclaw-dispatch-callback.test.js | 1 hr | T6, T3 |
| T10: Implement escalation-flow.test.js | 45 min | T6, T3 |
| T11: Implement retry-flow.test.js | 45 min | T6, T3 |

### Phase 4: Reporting & Documentation

| Task | Estimated Time | Dependencies |
|------|----------------|--------------|
| T12: Implement report-generator.js | 30 min | T1 |
| T13: Create README.md | 20 min | T8-T11 |
| T14: Verify all tests pass | 15 min | T8-T12 |

---

## 7. Dependencies

### NPM Dependencies

```json
{
  "devDependencies": {
    "jest": "^30.0.0",
    "nock": "^13.5.0"
  }
}
```

### Internal Dependencies

- `adapters/github-issue/` - GitHub Issue Adapter
- `adapters/github-pr/` - GitHub PR Adapter
- `adapters/openclaw/` - OpenClaw Adapter

---

## 8. Success Criteria

| Criteria | Verification |
|----------|--------------|
| All tests pass | `npm run test:e2e` exit code 0 |
| No external API calls | Nock verifies all requests mocked |
| Report generated | `test-reports/e2e-report-*.json` exists |
| Coverage > 80% | Jest coverage report |
| Duration < 60s | Report shows duration_ms < 60000 |

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Mock responses don't match real API | Document real API responses in fixtures |
| Test flakiness | Use deterministic test data |
| Slow test execution | Parallel test execution |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial plan created |