# E2E Integration Tests

## Overview

End-to-end integration tests for the OpenCode Expert Pack adapters using Mock Server pattern (Nock). These tests validate complete workflows without depending on real external services.

## Test Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Test Environment                        │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ Mock GitHub  │    │ Mock OpenClaw│    │ Expert Pack  │     │
│  │ API Server   │    │ API Server   │    │   Adapters   │     │
│  │   (Nock)     │    │   (Nock)     │    │   (Real)     │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                         Jest Test Runner                      │
└────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
tests/e2e/
├── setup/
│   ├── mock-servers.js          # Nock configuration
│   ├── test-fixtures.js         # Test data factories
│   └── environment.js           # Environment configuration
│
├── helpers/
│   ├── github-mock.js           # GitHub API mock helpers
│   ├── openclaw-mock.js         # OpenClaw API mock helpers
│   ├── assertions.js            # Custom test assertions
│   └── report-generator.js      # E2E report generator
│
├── scenarios/
│   ├── github-issue-to-pr.test.js
│   ├── openclaw-dispatch-callback.test.js
│   ├── escalation-flow.test.js
│   └── retry-flow.test.js
│
├── test-reports/
│   ├── e2e-report-{timestamp}.json
│   └── latest.json
│
└── README.md
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific scenario
npm test -- tests/e2e/scenarios/github-issue-to-pr.test.js

# Run with coverage
npm run test:e2e -- --coverage
```

## Test Scenarios

### Scenario 1: GitHub Issue → PR Workflow (8 tests)

Tests the complete flow from GitHub Issue webhook to PR creation:

| Test ID | Description |
|---------|-------------|
| TC-001 | Webhook with valid signature |
| TC-002 | Issue labels parsed correctly |
| TC-003 | Issue body parsed correctly |
| TC-004 | Dispatch payload validated |
| TC-005 | Execution result creates PR |
| TC-006 | Review comments posted |
| TC-007 | Invalid webhook signature rejected |
| TC-008 | Malformed issue body handled |

### Scenario 2: OpenClaw Bidirectional (8 tests)

Tests bidirectional communication with OpenClaw:

| Test ID | Description |
|---------|-------------|
| TC-009 | JWT authentication validated |
| TC-010 | Message parsed to dispatch payload |
| TC-011 | Execution result callback sent |
| TC-012 | Escalation sent |
| TC-013 | Decision response processed |
| TC-014 | Heartbeat sent during execution |
| TC-015 | Retry with exponential backoff |
| TC-016 | Authentication failure handled |

### Scenario 3: Escalation Flow (6 tests)

Tests escalation handling:

| Test ID | Description |
|---------|-------------|
| TC-017 | Escalation generated with blocking points |
| TC-018 | Escalation callback sent to OpenClaw |
| TC-019 | 'acknowledged' response handled |
| TC-020 | 'decision_made' response handled |
| TC-021 | 'abort' response handled |
| TC-022 | 'escalate_further' response handled |

### Scenario 4: Retry Flow (6 tests)

Tests retry logic:

| Test ID | Description |
|---------|-------------|
| TC-023 | Low risk task retry allowed |
| TC-024 | Medium risk task retry limited |
| TC-025 | High/critical risk no auto-retry |
| TC-026 | Exponential backoff calculation |
| TC-027 | Retry attempt logged to OpenClaw |
| TC-028 | Max retry exceeded triggers escalation |

## Mock Servers

### GitHub API Mocks

| Endpoint | Method | Mock Function |
|----------|--------|---------------|
| `/repos/{owner}/{repo}/issues/{number}` | GET | `mockGetIssue()` |
| `/repos/{owner}/{repo}/pulls` | POST | `mockCreatePR()` |
| `/repos/{owner}/{repo}/issues/{number}/comments` | POST | `mockPostComment()` |
| `/repos/{owner}/{repo}/issues/{number}/labels` | POST | `mockAddLabels()` |

### OpenClaw API Mocks

| Endpoint | Method | Mock Function |
|----------|--------|---------------|
| `/api/v1/results` | POST | `mockPostResult()` |
| `/api/v1/escalations` | POST | `mockPostEscalation()` |
| `/api/v1/retries` | POST | `mockPostRetry()` |
| `/api/v1/heartbeat` | POST | `mockPostHeartbeat()` |

## Test Report

After each run, a JSON report is generated:

```json
{
  "timestamp": "2026-03-29T12:00:00Z",
  "duration_ms": 45000,
  "summary": {
    "total": 28,
    "passed": 26,
    "failed": 2,
    "skipped": 0
  },
  "scenarios": [...],
  "failures": [...]
}
```

## Dependencies

- `jest` - Test framework
- `nock` - HTTP mocking

## Troubleshooting

### Tests fail with "Nock: No match for request"

Ensure all API endpoints are mocked before running tests.

### Mock state persists between tests

Use `nock.cleanAll()` in `beforeEach` and `afterAll` hooks.

### Report not generated

Check `test-reports/` directory permissions.