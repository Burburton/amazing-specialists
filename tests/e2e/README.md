# E2E Integration Tests

## Overview

End-to-end integration tests for the OpenCode Expert Pack adapters using Mock Server pattern (Nock). These tests validate complete workflows without depending on real external services.

## Test Architecture

### Three-Level Testing Strategy

```
┌──────────────────────────────────────────────────────────────┐
│  Level 3: True E2E Adapter Integration (adapters/)           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Mock HTTP   │ ←→ │ Real Adapter│ → │ Real Parser │      │
│  │   (Nock)    │    │   Code      │    │   Code      │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│  Tests: webhook → adapter.normalizeInput() → dispatch        │
├──────────────────────────────────────────────────────────────┤
│  Level 2: E2E Logic Tests (scenarios/)                       │
│  Tests data structures, parsing logic (no adapter calls)      │
├──────────────────────────────────────────────────────────────┤
│  Level 1: Adapter Unit Tests (adapters/*/tests/)             │
│  Tests individual components (label-parser, body-parser, etc) │
└──────────────────────────────────────────────────────────────┘
```

### Key Differences

| Level | Target | Invocation | Validation |
|-------|--------|------------|------------|
| Level 3 | Real adapter code | `adapter.normalizeInput()` | Full flow |
| Level 2 | Data structures | Manual construction | Field correctness |
| Level 1 | Components | Direct method calls | Unit isolation |

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
├── adapters/                    # Level 3: True E2E Adapter Tests
│   ├── fixtures/
│   │   └── adapter-fixtures.js  # Adapter test data factories
│   ├── helpers/
│   │   ├── mock-config.js       # Nock setup helpers
│   │   └── adapter-assertions.js# Adapter-specific assertions
│   ├── github-issue-adapter.test.js  # 15 tests
│   ├── openclaw-adapter.test.js      # 14 tests
│   ├── github-pr-adapter.test.js     # 10 tests
│   └── local-repo-adapter.test.js    # 7 tests
│
├── scenarios/                   # Level 2: E2E Logic Tests
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
# Run all E2E tests (Level 2 + Level 3)
npm run test:e2e

# Run Level 3: True E2E Adapter Tests only
npm run test:e2e:adapters

# Run specific adapter tests
npm run test:e2e:github-issue    # GitHub Issue adapter (15 tests)
npm run test:e2e:openclaw        # OpenClaw adapter (14 tests)
npm run test:e2e:github-pr       # GitHub PR adapter (10 tests)
npm run test:e2e:local-repo      # Local Repo adapter (7 tests)

# Run Level 2: E2E Logic Tests only
npm test -- tests/e2e/scenarios/

# Run specific scenario
npm test -- tests/e2e/scenarios/github-issue-to-pr.test.js

# Run with coverage
npm run test:e2e -- --coverage
```

## Test Scenarios

### Level 3: True E2E Adapter Tests (46 tests)

Tests REAL adapter code with Nock HTTP mocking. No mock adapter implementations.

#### GitHub Issue Adapter (15 tests)

Tests webhook handling, parsing, error mapping, escalation, and retry flows:

| Test ID | Description |
|---------|-------------|
| TC-GI-001 | Webhook with valid signature → dispatch created |
| TC-GI-002 | Webhook signature verification timing-safe |
| TC-GI-003 | Invalid webhook signature rejected |
| TC-GI-004 | Issue labels parsed via LabelParser |
| TC-GI-005 | Issue body parsed via BodyParser |
| TC-GI-006 | Dispatch payload validated |
| TC-GI-007 | Dispatch routed to execution |
| TC-GI-008 | Error mapping: 404 → BLOCKED |
| TC-GI-009 | Error mapping: 500 → FAILED_RETRYABLE |
| TC-GI-010 | Escalation generation |
| TC-GI-011 | Escalation posted via GitHub API |
| TC-GI-012 | Retry decision: low risk allowed |
| TC-GI-013 | Retry decision: critical risk denied |
| TC-GI-014 | Execution result posted |
| TC-GI-015 | Adapter info returned |

#### OpenClaw Adapter (14 tests)

Tests JWT auth, bidirectional communication, and decision responses:

| Test ID | Description |
|---------|-------------|
| TC-OC-001 | JWT token validated |
| TC-OC-002 | JWT expired rejected |
| TC-OC-003 | JWT invalid signature rejected |
| TC-OC-004 | Message parsed to dispatch payload |
| TC-OC-005 | Execution result callback sent |
| TC-OC-006 | Escalation callback sent |
| TC-OC-007 | Retry callback sent |
| TC-OC-008 | Heartbeat sent during execution |
| TC-OC-009 | Decision response: acknowledged |
| TC-OC-010 | Decision response: decision_made |
| TC-OC-011 | Decision response: abort |
| TC-OC-012 | Decision response: escalate_further |
| TC-OC-013 | API error mapping |
| TC-OC-014 | Adapter info returned |

#### GitHub PR Adapter (10 tests)

Tests PR creation, Git operations, and artifact writing:

| Test ID | Description |
|---------|-------------|
| TC-PR-001 | PR created from execution result |
| TC-PR-002 | Branch created for PR |
| TC-PR-003 | Tree created with files |
| TC-PR-004 | Commit created |
| TC-PR-005 | Artifacts written to PR |
| TC-PR-006 | PR description includes execution summary |
| TC-PR-007 | Review requested on PR |
| TC-PR-008 | Labels added to PR |
| TC-PR-009 | Execution result output formatted |
| TC-PR-010 | Adapter info returned |

#### Local Repo Adapter (7 tests)

Tests workspace operations and filesystem handling:

| Test ID | Description |
|---------|-------------|
| TC-LR-001 | Workspace initialized |
| TC-LR-002 | Artifacts written to filesystem |
| TC-LR-003 | Execution result logged |
| TC-LR-004 | Changelog updated |
| TC-LR-005 | README synced |
| TC-LR-006 | Cleanup performed |
| TC-LR-007 | Adapter info returned |

---

### Level 2: E2E Logic Tests (28 tests)

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