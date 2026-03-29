# Feature Spec: E2E Integration Tests

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 024-e2e-integration-tests |
| **Feature Name** | E2E Integration Tests with Mock Server |
| **Version** | 1.0.0 |
| **Status** | Implemented |
| **Created** | 2026-03-29 |
| **Priority** | High |
| **Dependencies** | 021-github-issue-adapter, 022-github-pr-adapter, 023-openclaw-adapter |

---

## 1. Overview

### 1.1 Purpose

Implement comprehensive end-to-end integration tests using Mock Server pattern to validate complete workflows across adapters without depending on real external services.

### 1.2 Scope

| In Scope | Out of Scope |
|----------|--------------|
| Mock Server setup (Nock) | Real API testing |
| GitHub Issue → PR workflow | Performance benchmarks |
| OpenClaw bidirectional workflow | Load testing |
| CLI/Local workflow | Security penetration testing |
| Escalation flow tests | |
| Retry flow tests | |

### 1.3 Test Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Test Environment                        │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ Mock GitHub  │    │ Mock OpenClaw│    │ Expert Pack  │     │
│  │ API Server   │    │ API Server   │    │   Adapters   │     │
│  │   (Nock)     │    │   (Nock)     │    │   (Real)     │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│         │                   │                   │              │
│         └───────────────────┴───────────────────┘              │
│                         Jest Test Runner                      │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Test Scenarios

### 2.1 Scenario 1: GitHub Issue → PR Workflow

**Flow**:
```
GitHub Webhook → GitHub Issue Adapter → Dispatch Payload → 
(Expert Pack Mock) → Execution Result → GitHub PR Adapter → PR Creation
```

**Test Cases**:
- TC-001: Receive webhook with valid signature
- TC-002: Parse issue with labels to dispatch payload
- TC-003: Validate dispatch payload structure
- TC-004: Process execution result and create PR
- TC-005: Post review comments
- TC-006: Update PR status labels
- TC-007: Handle invalid webhook signature
- TC-008: Handle malformed issue body

### 2.2 Scenario 2: OpenClaw Bidirectional Communication

**Flow**:
```
OpenClaw Dispatch → OpenClaw Adapter → Dispatch Payload →
(Expert Pack Mock) → Execution Result → POST /api/v1/results
```

**Test Cases**:
- TC-009: Receive dispatch message with JWT auth
- TC-010: Parse OpenClaw message to dispatch payload
- TC-011: Send execution result callback
- TC-012: Handle escalation request
- TC-013: Process decision response
- TC-014: Send heartbeat during execution
- TC-015: Handle retry with backoff
- TC-016: Handle authentication failure

### 2.3 Scenario 3: Escalation Flow

**Flow**:
```
Execution Blocked → Generate Escalation → POST to OpenClaw →
Receive Decision → Continue/Abort
```

**Test Cases**:
- TC-017: Generate escalation with blocking points
- TC-018: Send escalation callback
- TC-019: Handle 'acknowledged' response
- TC-020: Handle 'decision_made' response
- TC-021: Handle 'abort' response
- TC-022: Handle 'escalate_further' response

### 2.4 Scenario 4: Retry Flow

**Flow**:
```
Execution Failed → Retry Decision → Log Retry → 
Backoff Wait → Retry Execution
```

**Test Cases**:
- TC-023: Retry allowed for low risk
- TC-024: Retry limited for medium risk
- TC-025: No retry for high/critical risk
- TC-026: Exponential backoff calculation
- TC-027: Log retry to OpenClaw
- TC-028: Max retry exceeded escalation

---

## 3. Technical Requirements

### 3.1 Mock Server Requirements

| Requirement | Description |
|-------------|-------------|
| GitHub REST API v3 | Mock all endpoints used by adapters |
| OpenClaw API v1 | Mock /api/v1/* endpoints |
| Webhook Signature | HMAC-SHA256 signature verification |
| JWT Authentication | Token validation simulation |

### 3.2 Test Infrastructure

```
tests/
├── e2e/
│   ├── setup/
│   │   ├── mock-servers.js          # Nock configuration
│   │   ├── test-fixtures.js         # Test data factories
│   │   └── environment.js           # Environment config
│   │
│   ├── scenarios/
│   │   ├── github-issue-to-pr.test.js
│   │   ├── openclaw-dispatch-callback.test.js
│   │   ├── escalation-flow.test.js
│   │   └── retry-flow.test.js
│   │
│   ├── helpers/
│   │   ├── github-mock.js
│   │   ├── openclaw-mock.js
│   │   └── assertions.js
│   │
│   └── README.md
│
└── test-reports/
    └── e2e-report-{timestamp}.json   # Test results for reporting
```

### 3.3 Dependencies

```json
{
  "devDependencies": {
    "jest": "^30.0.0",
    "nock": "^13.5.0"
  }
}
```

---

## 4. Mock API Endpoints

### 4.1 GitHub API Mocks

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/repos/{owner}/{repo}/issues/{number}` | GET | Get issue details |
| `/repos/{owner}/{repo}/issues` | POST | Create issue |
| `/repos/{owner}/{repo}/issues/{number}/comments` | POST | Add comment |
| `/repos/{owner}/{repo}/issues/{number}/labels` | POST | Add labels |
| `/repos/{owner}/{repo}/pulls` | POST | Create PR |
| `/repos/{owner}/{repo}/pulls/{number}/files` | GET | Get PR files |
| `/repos/{owner}/{repo}/pulls/{number}/reviews` | POST | Create review |

### 4.2 OpenClaw API Mocks

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/results` | POST | Receive execution result |
| `/api/v1/escalations` | POST | Receive escalation |
| `/api/v1/retries` | POST | Log retry attempt |
| `/api/v1/heartbeat` | POST | Receive heartbeat |

---

## 5. Test Fixtures

### 5.1 GitHub Issue Fixture

```javascript
const githubIssueFixture = {
  action: 'opened',
  issue: {
    number: 1,
    title: '[architect:design-task] Design new feature',
    body: `## Context
Building a new authentication feature.

## Goal
Create design document for auth system.

## Constraints
- Must support OAuth2
- Must have MFA option`,
    labels: [
      { name: 'milestone:mvp' },
      { name: 'risk:low' }
    ],
    user: { login: 'test-user' },
    repository: {
      owner: { login: 'test-org' },
      name: 'test-repo'
    }
  }
};
```

### 5.2 OpenClaw Dispatch Fixture

```javascript
const openClawDispatchFixture = {
  dispatch_id: 'dispatch-001',
  project: { id: 'proj-001', name: 'Test Project', goal: 'Build feature' },
  milestone: { id: 'ms-001', name: 'MVP', goal: 'Release MVP' },
  task: {
    id: 'task-001',
    title: 'Implement feature',
    goal: 'Create implementation',
    description: 'Detailed task description',
    context: { project_goal: 'Build feature', task_scope: 'Implementation' },
    constraints: ['Must pass tests'],
    inputs: [],
    expected_outputs: ['Working feature'],
    verification_steps: ['Run tests'],
    risk_level: 'low'
  },
  role: 'developer',
  command: 'implement-task'
};
```

### 5.3 Execution Result Fixture

```javascript
const executionResultFixture = {
  dispatch_id: 'dispatch-001',
  status: 'SUCCESS',
  summary: 'Task completed successfully',
  artifacts: [{
    artifact_id: 'artifact-001',
    artifact_type: 'implementation-summary',
    path: 'src/feature.js',
    summary: 'New feature implementation'
  }],
  recommendation: 'CONTINUE'
};
```

---

## 6. Reporting Requirements

### 6.1 Test Report Format

After each E2E test run, generate a report file:

```javascript
// test-reports/e2e-report-{timestamp}.json
{
  "timestamp": "2026-03-29T12:00:00Z",
  "duration_ms": 45000,
  "summary": {
    "total": 28,
    "passed": 26,
    "failed": 2,
    "skipped": 0
  },
  "scenarios": [
    {
      "name": "GitHub Issue → PR Workflow",
      "passed": 8,
      "failed": 0
    },
    {
      "name": "OpenClaw Bidirectional",
      "passed": 7,
      "failed": 1
    }
  ],
  "failures": [
    {
      "test_id": "TC-012",
      "test_name": "Handle escalation request",
      "error": "Expected status 200, got 500",
      "stack": "Error: ...",
      "file": "scenarios/openclaw-dispatch-callback.test.js:45"
    }
  ]
}
```

### 6.2 Report Location

```
tests/test-reports/
├── e2e-report-2026-03-29T12-00-00.json
├── e2e-report-2026-03-29T14-30-00.json
└── latest.json  → symlink to most recent
```

---

## 7. Acceptance Criteria

| AC ID | Description | Priority |
|-------|-------------|----------|
| AC-001 | Mock Server for GitHub API works correctly | Must |
| AC-002 | Mock Server for OpenClaw API works correctly | Must |
| AC-003 | GitHub Issue → PR workflow tests pass | Must |
| AC-004 | OpenClaw dispatch/callback tests pass | Must |
| AC-005 | Escalation flow tests pass | Must |
| AC-006 | Retry flow tests pass | Must |
| AC-007 | Test report generated after each run | Must |
| AC-008 | All tests run without external dependencies | Must |
| AC-009 | Test coverage > 80% for E2E paths | Should |
| AC-010 | Tests complete within 60 seconds | Should |

---

## 8. References

- `adapters/github-issue/` - GitHub Issue Adapter implementation
- `adapters/github-pr/` - GitHub PR Adapter implementation
- `adapters/openclaw/` - OpenClaw Adapter implementation
- `io-contract.md` - I/O contract definitions
- `adapters/github-issue/tests/e2e/` - Existing E2E test reference

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial spec created |