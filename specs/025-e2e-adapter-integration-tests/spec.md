# Spec: E2E Adapter Integration Tests

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 025-e2e-adapter-integration-tests |
| **Version** | 1.0.0 |
| **Created** | 2026-03-29 |
| **Status** | Draft |
| **Priority** | High |
| **Dependencies** | 024-e2e-integration-tests, 021-github-issue-adapter, 022-github-pr-adapter, 023-openclaw-adapter |

## Overview

### Problem Statement

现有 E2E 测试 (`024-e2e-integration-tests`) 仅验证数据结构和解析逻辑，不调用真实 adapter 代码。这导致：

1. **测试覆盖不完整**: 无法验证 adapter 的完整执行链路
2. **集成风险**: adapter 代码修改可能破坏实际调用流程，但现有测试无法捕获
3. **Mock 设计验证不足**: 无法验证 Nock mock 与真实 HTTP 调用的匹配情况

### Solution

实现 **True E2E Adapter Integration Tests**，调用真实 adapter 代码（如 `GitHubIssueAdapter.normalizeInput()`），配合 Nock mock HTTP，验证完整执行链路。

### Scope

| Adapter | Priority | Coverage |
|---------|----------|----------|
| `github-issue` | P0 (Critical) | Webhook → Dispatch → Escalation → Retry |
| `openclaw` | P1 (High) | JWT Auth → Callback → Decision Response |
| `github-pr` | P2 (Medium) | PR Creation → Artifact Writing |
| `local-repo` | P3 (Low) | File System Operations (no HTTP mock needed) |

---

## Test Architecture

### Three-Level Testing Strategy

```
┌──────────────────────────────────────────────────────────────┐
│  Level 3: True E2E Adapter Integration (本 Feature)          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Mock HTTP   │ ←→ │ Real Adapter│ → │ Real Parser │      │
│  │   (Nock)    │    │   Code      │    │   Code      │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│  测试: webhook → adapter.normalizeInput() → dispatch        │
├──────────────────────────────────────────────────────────────┤
│  Level 2: E2E Logic Tests (Feature 024)                      │
│  测试数据结构、解析逻辑（不调用 adapter）                      │
├──────────────────────────────────────────────────────────────┤
│  Level 1: Adapter Unit Tests (adapters/*/tests/)             │
│  单独测试每个组件（label-parser, body-parser 等）             │
└──────────────────────────────────────────────────────────────┘
```

### Key Differences from Level 2 Tests

| Dimension | Level 2 (Existing) | Level 3 (This Feature) |
|-----------|---------------------|------------------------|
| **Test Target** | Data structures, parsing logic | **Real Adapter code** |
| **Invocation** | Manual dispatch payload construction | `adapter.normalizeInput(issue)` |
| **HTTP Mock** | Mock helper functions | **Nock mock + adapter actual HTTP calls** |
| **Validation Scope** | Payload field correctness | **Full flow: webhook → parse → dispatch → result** |
| **Error Handling** | Test error format | **Test `adapter.mapError(error)`** |

---

## Test Cases

### Scenario 1: GitHub Issue Adapter Integration (P0)

**Target**: `adapters/github-issue/index.js`

| Test ID | Description | Validation |
|---------|-------------|------------|
| TC-GI-001 | Webhook with valid signature → dispatch created | `handleWebhook()` + `normalizeInput()` |
| TC-GI-002 | Webhook signature verification timing-safe | `crypto.timingSafeEqual()` call |
| TC-GI-003 | Invalid webhook signature rejected | Error returned, no dispatch |
| TC-GI-004 | Issue labels parsed via `LabelParser` | Role, command, milestone, risk extracted |
| TC-GI-005 | Issue body parsed via `BodyParser` | Context, goal, constraints extracted |
| TC-GI-006 | Dispatch payload validated against io-contract.md §1 | `validateDispatch()` returns `isValid: true` |
| TC-GI-007 | Dispatch routed to execution | `routeToExecution()` returns routing info |
| TC-GI-008 | Error mapping: 404 → BLOCKED | `mapError({ status: 404 })` |
| TC-GI-009 | Error mapping: 500 → FAILED_RETRYABLE | `mapError({ status: 500 })` |
| TC-GI-010 | Escalation generation | `generateEscalation()` creates valid escalation |
| TC-GI-011 | Escalation posted via GitHub API | Nock mock: POST /repos/{owner}/{repo}/issues/{number}/comments |
| TC-GI-012 | Retry decision: low risk allowed | `handleRetry({ risk_level: 'low' })` |
| TC-GI-013 | Retry decision: critical risk denied | `handleRetry({ risk_level: 'critical' })` |
| TC-GI-014 | Execution result posted | `postResult()` → Nock mock comment + label |
| TC-GI-015 | Adapter info returned | `getAdapterInfo()` metadata |

### Scenario 2: OpenClaw Adapter Integration (P1)

**Target**: `adapters/openclaw/index.js`

| Test ID | Description | Validation |
|---------|-------------|------------|
| TC-OC-001 | JWT token validated | `validateJWT()` returns valid |
| TC-OC-002 | JWT expired rejected | Error: "expired" |
| TC-OC-003 | JWT invalid signature rejected | Error: "invalid signature" |
| TC-OC-004 | Message parsed to dispatch payload | `normalizeInput()` creates dispatch |
| TC-OC-005 | Execution result callback sent | POST /api/v1/results → Nock mock |
| TC-OC-006 | Escalation callback sent | POST /api/v1/escalations → Nock mock |
| TC-OC-007 | Retry callback sent | POST /api/v1/retries → Nock mock |
| TC-OC-008 | Heartbeat sent during execution | POST /api/v1/heartbeat → Nock mock |
| TC-OC-009 | Decision response: acknowledged | `handleDecisionResponse({ response: 'acknowledged' })` |
| TC-OC-010 | Decision response: decision_made | Returns CONTINUE action |
| TC-OC-011 | Decision response: abort | Returns ABORT action |
| TC-OC-012 | Decision response: escalate_further | Returns ESCALATE action |
| TC-OC-013 | API error mapping | Network timeout → FAILED_RETRYABLE |
| TC-OC-014 | Adapter info returned | `getAdapterInfo()` metadata |

### Scenario 3: GitHub PR Adapter Integration (P2)

**Target**: `adapters/github-pr/index.js`

| Test ID | Description | Validation |
|---------|-------------|------------|
| TC-PR-001 | PR created from execution result | POST /repos/{owner}/{repo}/pulls → Nock mock |
| TC-PR-002 | Branch created for PR | POST /repos/{owner}/{repo}/git/refs |
| TC-PR-003 | Tree created with files | POST /repos/{owner}/{repo}/git/trees |
| TC-PR-004 | Commit created | POST /repos/{owner}/{repo}/git/commits |
| TC-PR-005 | Artifacts written to PR | File blobs uploaded |
| TC-PR-006 | PR description includes execution summary | Comment body contains artifacts |
| TC-PR-007 | Review requested on PR | POST /repos/{owner}/{repo}/pulls/{number}/requested_reviewers |
| TC-PR-008 | Labels added to PR | POST /repos/{owner}/{repo}/issues/{number}/labels |
| TC-PR-009 | Execution result output correctly formatted | io-contract.md §3 compliance |
| TC-PR-010 | Adapter info returned | `getAdapterInfo()` metadata |

### Scenario 4: Local Repo Adapter Integration (P3)

**Target**: `adapters/local-repo/index.js`

| Test ID | Description | Validation |
|---------|-------------|------------|
| TC-LR-001 | Workspace initialized | Directory created |
| TC-LR-002 | Artifacts written to filesystem | Files exist on disk |
| TC-LR-003 | Execution result logged | JSON file written |
| TC-LR-004 | Changelog updated | CHANGELOG.md appended |
| TC-LR-005 | README synced | README.md updated |
| TC-LR-006 | Cleanup performed | Temporary files removed |
| TC-LR-007 | Adapter info returned | `getAdapterInfo()` metadata |

---

## Acceptance Criteria

### Functional Requirements

- [ ] **AC-001**: All 46 test cases pass (15 + 14 + 10 + 7)
- [ ] **AC-002**: Tests invoke real adapter code, not mock helpers
- [ ] **AC-003**: Nock mocks correctly intercept adapter HTTP calls
- [ ] **AC-004**: `nock.isDone()` verifies all mocks were called
- [ ] **AC-005**: Error mapping tests cover all status codes
- [ ] **AC-006**: JWT auth tests cover valid/expired/invalid cases
- [ ] **AC-007**: Escalation/Retry flow tests verify complete decision logic

### Quality Requirements

- [ ] **AC-Q001**: Test coverage > 90% for adapter `index.js` methods
- [ ] **AC-Q002**: No external API calls (Nock verification)
- [ ] **AC-Q003**: Test duration < 30 seconds per adapter
- [ ] **AC-Q004**: Tests isolated: `nock.cleanAll()` in beforeEach/afterAll
- [ ] **AC-Q005**: Test fixtures reusable from `tests/e2e/setup/test-fixtures.js`

### Documentation Requirements

- [ ] **AC-D001**: `tests/e2e/README.md` updated with adapter test section
- [ ] **AC-D002**: Test architecture diagram documented
- [ ] **AC-D003**: Running instructions documented

---

## Out of Scope

- Real HTTP calls to GitHub/OpenClaw (use Nock)
- Performance benchmarking
- Security penetration testing
- Adapter configuration validation (covered by unit tests)

---

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Adapter config differs from test config | Tests fail | Use adapter's actual config.json |
| Nock mock URL mismatch | No match error | Use adapter's base_url from config |
| JWT test requires secret | Security risk | Use test-only secret in fixtures |

---

## References

- `specs/024-e2e-integration-tests/spec.md` - Existing E2E logic tests
- `specs/021-github-issue-adapter/spec.md` - GitHub Issue adapter spec
- `specs/022-github-pr-adapter/spec.md` - GitHub PR adapter spec
- `specs/023-openclaw-adapter/spec.md` - OpenClaw adapter spec
- `io-contract.md` §1 - Dispatch Payload schema
- `io-contract.md` §3 - Execution Result schema
- `io-contract.md` §8 - Adapter interface definition
- `tests/e2e/README.md` - Existing E2E test documentation