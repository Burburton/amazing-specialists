# Feature Verification Example

## Example Metadata

| Field | Value |
|-------|-------|
| **Example Type** | Feature Verification Workflow |
| **Workflow Reference** | spec.md Section 5.1 Workflow 1 |
| **Skills Used** | unit-test-design, edge-case-matrix, regression-analysis |
| **Artifacts Produced** | test-scope-report, verification-report, regression-risk-report |

---

## 1. Scenario Overview

### 1.1 Feature Being Verified

**Feature**: JWT Authentication Service

**Implementation Summary** (from developer):
- New `AuthService` class for token generation and validation
- New `AuthController` with `/auth/login` and `/auth/verify` endpoints
- New `authMiddleware` for protecting routes
- 92% test coverage claimed by developer

### 1.2 Upstream Artifacts Consumed

| Artifact | Source | Key Fields Used |
|----------|--------|-----------------|
| implementation-summary | developer | goal_alignment, changed_files, known_issues, risks, tests_included |
| self-check-report | developer | overall_status: PASS, 28/28 checks |
| design-note | architect | Authentication flow design |

---

## 2. Tester Workflow Execution

### 2.1 Step 1: Consume Developer Artifacts

**Reading implementation-summary.goal_alignment**:
```yaml
goal_alignment:
  goal: "Implement JWT authentication with token refresh"
  achieved: partial
  deviations:
    - deviation: "Refresh tokens deferred to next sprint"
      rationale: "Time constraints, approved by product owner"
```

**Tester Interpretation**:
- Primary goal achieved: JWT authentication
- Deviation acknowledged: Token refresh out of scope
- Test scope focuses on: token generation, token validation, authentication flow

**Reading implementation-summary.changed_files**:
```yaml
changed_files:
  - path: "src/services/AuthService.ts"
    change_type: "added"
    description: "Core authentication service with JWT"
    lines_changed: { added: 120, deleted: 0 }
  - path: "src/controllers/AuthController.ts"
    change_type: "added"
    description: "HTTP endpoints for auth"
    lines_changed: { added: 85, deleted: 0 }
  - path: "src/middleware/authMiddleware.ts"
    change_type: "added"
    description: "JWT validation middleware"
    lines_changed: { added: 45, deleted: 0 }
```

**Tester Interpretation**:
- Test surface: 3 new files requiring unit and integration tests
- No modified files, so no regression testing for existing code

**Reading implementation-summary.known_issues**:
```yaml
known_issues:
  - issue_id: "ISSUE-001"
    description: "Token expiry handling needs improvement"
    severity: "medium"
    workaround: "Client must handle 401 and re-authenticate"
```

**Tester Interpretation**:
- Do NOT report "Token expiry not handled gracefully" as bug
- Verify 401 is returned on expired token (expected behavior)

**Reading implementation-summary.risks**:
```yaml
risks:
  - risk_id: "RISK-001"
    description: "JWT secret management"
    level: "high"
    mitigation: "Will be addressed in security review"
```

**Tester Interpretation**:
- High-priority test area: JWT secret handling
- Verify secret is loaded from environment, not hardcoded

**Reading self-check-report**:
```yaml
self_check_report:
  overall_status: "PASS"
  summary:
    total_checks: 28
    passed: 28
    failed: 0
```

**BR-002 Compliance**: Self-check acknowledged but NOT used as evidence. Independent verification required.

---

### 2.2 Step 2: Produce test-scope-report

**Input Artifacts**:
- implementation-summary
- self-check-report
- design-note

**Goal Under Test**:
Verify JWT authentication implementation satisfies acceptance criteria.

**Changed Surface**:
- `src/services/AuthService.ts` - Unit tests
- `src/controllers/AuthController.ts` - Integration tests
- `src/middleware/authMiddleware.ts` - Unit tests

**Risk Priorities**:
1. (HIGH) JWT secret management - Security implications
2. (MEDIUM) Token expiry handling - Known issue acknowledged

**Test Strategy**:
1. Unit tests for AuthService methods
2. Unit tests for authMiddleware
3. Integration tests for AuthController endpoints
4. Edge case analysis for boundary conditions

**In-Scope Items**:
- JWT token generation with valid credentials
- JWT token validation with valid tokens
- JWT token validation with invalid/expired tokens
- Authentication endpoint success/failure cases
- Middleware route protection

**Out-of-Scope Items**:
- Token refresh functionality (documented deviation)
- Performance/load testing (environment not available)
- Security penetration testing (security role responsibility)

**Assumptions**:
- Database is available and configured
- JWT secret is properly configured in environment
- Test environment mirrors production configuration

**Recommendation**: PROCEED

---

### 2.3 Step 3: Execute unit-test-design Skill

**Using unit-test-design Skill** (see `.opencode/skills/tester/unit-test-design/SKILL.md`):

**Test Design for AuthService**:
| Method | Test Cases | Priority |
|--------|------------|----------|
| `generateToken(credentials)` | Valid credentials → JWT returned | High |
| `generateToken(credentials)` | Invalid credentials → null/exception | High |
| `generateToken(credentials)` | Null credentials → exception | Medium |
| `validateToken(token)` | Valid token → decoded payload | High |
| `validateToken(token)` | Expired token → null/exception | High |
| `validateToken(token)` | Malformed token → exception | Medium |
| `validateToken(token)` | Null token → exception | Medium |

**Test Design for authMiddleware**:
| Scenario | Expected Behavior | Priority |
|----------|-------------------|----------|
| Valid JWT in header | Request passes through | High |
| Invalid JWT in header | 401 Unauthorized | High |
| Missing JWT header | 401 Unauthorized | High |
| Malformed JWT in header | 401 Unauthorized | Medium |

---

### 2.4 Step 4: Execute edge-case-matrix Skill

**Using edge-case-matrix Skill** (see `.opencode/skills/tester/edge-case-matrix/SKILL.md`):

**Boundary Condition Matrix**:

| Parameter | Boundary | Test Value | Expected |
|-----------|----------|------------|----------|
| `credentials.username` | Empty | `""` | Reject |
| `credentials.username` | Very long | 1000 chars | Handle gracefully |
| `credentials.username` | Special chars | `"<script>"` | Sanitize/reject |
| `credentials.password` | Empty | `""` | Reject |
| `credentials.password` | Very long | 1000 chars | Handle gracefully |
| `token` | Empty | `""` | Reject |
| `token` | Malformed | `"not.a.jwt"` | Reject |
| `token` | Expired | Expired token | Reject with 401 |
| `token` | Wrong signature | Tampered token | Reject |
| `JWT secret` | Not configured | `null` | Fail fast |

**Happy Path Coverage**: Verified
- Valid credentials → JWT returned
- Valid JWT → Access granted

**Edge Case Coverage**: Verified
- Invalid inputs handled
- Expired/malformed tokens rejected
- Null values handled with exceptions

---

### 2.5 Step 5: Produce verification-report

**Test Scope Reference**: test-scope-report ID: TSR-001

**Tests Added/Run**:
| Test File | Type | Count | Status |
|-----------|------|-------|--------|
| `tests/unit/AuthService.test.ts` | Unit | 12 | PASS |
| `tests/unit/authMiddleware.test.ts` | Unit | 6 | PASS |
| `tests/integration/auth-flow.test.ts` | Integration | 8 | PASS |

**Execution Summary**:
- Total tests: 26
- Passed: 26
- Failed: 0
- Blocked: 0

**Pass Cases**:
| Test | Evidence |
|------|----------|
| `AuthService.generateToken()` with valid credentials | JWT returned with expected payload |
| `AuthService.validateToken()` with valid token | Decoded payload matches expected |
| `AuthService.validateToken()` with expired token | Returns null (expected) |
| `authMiddleware` with valid JWT | Request passes through |
| `authMiddleware` with invalid JWT | Returns 401 |
| `POST /auth/login` with valid credentials | Returns 200 with JWT |
| `POST /auth/login` with invalid credentials | Returns 401 |

**Failed Cases**: None

**Failure Classification**: N/A

**Evidence**:
```
tests/unit/AuthService.test.ts:
  ✓ generateToken with valid credentials returns JWT (15ms)
  ✓ generateToken with invalid credentials returns null (2ms)
  ✓ generateToken with null credentials throws error (1ms)
  ✓ validateToken with valid token returns payload (3ms)
  ✓ validateToken with expired token returns null (2ms)
  ✓ validateToken with malformed token throws error (1ms)
  ... 6 more passing tests

tests/unit/authMiddleware.test.ts:
  ✓ valid JWT passes through (5ms)
  ✓ invalid JWT returns 401 (2ms)
  ✓ missing JWT returns 401 (1ms)
  ... 3 more passing tests

tests/integration/auth-flow.test.ts:
  ✓ POST /auth/login - success (45ms)
  ✓ POST /auth/login - failure (12ms)
  ✓ POST /auth/verify - success (8ms)
  ... 5 more passing tests
```

**Coverage Gaps**:
| Gap | Reason | Impact | Follow-up |
|-----|--------|--------|-----------|
| Token refresh flow | Out of scope (deviation) | Refresh not verified | Scheduled Sprint 5 |
| Load testing | Environment not available | Performance unknown | Staging env next week |
| Invalid JWT formats (all variants) | Time constraints | Some edge cases untested | Backlog |

**Edge Cases Checked**:
- Empty credentials → Rejected ✓
- Very long inputs → Handled gracefully ✓
- Special characters in username → Sanitized ✓
- Empty token → Rejected ✓
- Malformed token → Rejected ✓
- Expired token → Returns 401 ✓

**Confidence Level**: FULL

**Rationale**: All in-scope items tested with passing results. Coverage gaps are documented and understood.

**Recommendation**: PASS_TO_REVIEW

---

### 2.6 Step 6: Execute regression-analysis Skill

**Using regression-analysis Skill** (see `.opencode/skills/tester/regression-analysis/SKILL.md`):

**Change Anchor**: New JWT authentication feature

**Regression Surfaces**:
| Area | Reason | Risk Level |
|------|--------|------------|
| Existing auth (if any) | Potential conflict | Low (this is new) |
| Route middleware chain | New middleware added | Medium |
| Error handling paths | New 401 responses | Low |

**Existing Tests Reused**:
| Test | Coverage |
|------|----------|
| `tests/integration/full-flow.test.ts` | End-to-end flow unchanged |

**New Regression Checks**:
| Check | Purpose |
|-------|---------|
| Auth middleware doesn't block existing routes | Ensure no regression |
| Existing routes still accessible without auth | Verify no breaking change |

**Untested Regression Areas**:
| Area | Reason |
|------|--------|
| Concurrent authentication requests | Load testing unavailable |

**Risk Ranking**:
| Risk | Severity | Likelihood |
|------|----------|------------|
| Existing routes broken by middleware | Low | Low |
| Performance degradation | Medium | Low |

**Follow-up Actions**:
- Monitor authentication latency in staging
- Run existing integration tests to verify no regression

**Recommendation**: ACCEPT_RISK

---

### 2.7 Step 7: Produce regression-risk-report

**Change Anchor**: JWT Authentication feature implementation

**Regression Surfaces**:
- Route middleware chain (medium risk)
- Error handling paths (low risk)

**Existing Tests Reused**:
- `tests/integration/full-flow.test.ts` - Verified no regression

**New Regression Checks**:
- Auth middleware non-blocking verification
- Existing routes accessibility test

**Untested Regression Areas**:
- Concurrent authentication (load testing unavailable)

**Risk Ranking**:
| Risk | Severity | Likelihood | Score |
|------|----------|------------|-------|
| Existing routes broken | Low | Low | 4 |
| Performance degradation | Medium | Low | 6 |

**Follow-up Actions**:
1. Monitor auth latency in staging
2. Run smoke tests on existing routes
3. Schedule load testing when environment ready

**Recommendation**: ACCEPT_RISK (with monitoring plan)

---

## 3. Handoff to Reviewer

### 3.1 Artifacts Delivered

| Artifact | Status | Consumer |
|----------|--------|----------|
| test-scope-report | ✅ Complete | reviewer, acceptance |
| verification-report | ✅ Complete | reviewer, developer, acceptance |
| regression-risk-report | ✅ Complete | reviewer, developer |

### 3.2 Key Findings Summary

**Pass Summary**:
- 26/26 tests passed
- All in-scope items verified
- No implementation issues found

**Gap Summary**:
- Token refresh: Deferred (documented deviation)
- Load testing: Environment unavailable

**Risk Summary**:
- Low regression risk
- Medium performance risk (unverified)

**Recommendation**: PASS_TO_REVIEW

---

## 4. BR Compliance Summary

| BR | Compliance | Evidence |
|----|------------|----------|
| BR-001 | ✅ | Consumed all developer artifacts systematically |
| BR-002 | ✅ | Self-check distinguished from independent verification |
| BR-003 | ✅ | Coverage gaps explicitly documented |
| BR-004 | ✅ | N/A (no failures to classify) |
| BR-005 | ✅ | Edge cases tested via edge-case-matrix skill |
| BR-006 | ✅ | Regression analysis performed |
| BR-007 | ✅ | Confidence level justified by evidence |
| BR-008 | ✅ | No business logic mutation |
| BR-009 | ✅ | 6-role terminology used consistently |

---

## 5. Skills Used Reference

| Skill | Purpose | SKILL.md Location |
|-------|---------|-------------------|
| unit-test-design | Design test cases for AuthService, authMiddleware | `.opencode/skills/tester/unit-test-design/SKILL.md` |
| edge-case-matrix | Identify boundary conditions | `.opencode/skills/tester/edge-case-matrix/SKILL.md` |
| regression-analysis | Assess regression risk | `.opencode/skills/tester/regression-analysis/SKILL.md` |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial feature verification example |