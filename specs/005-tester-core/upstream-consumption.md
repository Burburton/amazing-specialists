# 005-tester-core Upstream Consumption Guide

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `005-tester-core` |
| **Document Type** | Interface Specification |
| **Version** | 1.0.0 |
| **Created** | 2026-03-25 |
| **Status** | Draft |
| **Owner** | tester |
| **Aligned With** | `specs/004-developer-core/downstream-interfaces.md` |

---

## 1. Overview

### 1.1 Consumption Philosophy

The tester role's primary mission is to **convert implementation claims into verifiable evidence**. This document defines how tester systematically consumes developer outputs from `004-developer-core` to derive test scope, design verification strategies, and distinguish independent verification from developer self-check.

**Core Principles:**

1. **Evidence-Based Testing (BR-001)**: Tester must consume structured developer artifacts, not informal assumptions.

2. **Independent Verification (BR-002)**: Developer self-check may inform testing but **cannot** replace tester evidence.

3. **Risk-Prioritized Testing**: Developer-identified risks must be prioritized for testing.

4. **Known Issue Awareness**: Known issues must be acknowledged, not treated as false positives.

5. **Root-Cause-Aware Regression**: Bugfix root causes must inform regression check design.

### 1.2 Upstream Artifact Flow

```
┌─────────────────────────────────────────────────────────┐
│                      DEVELOPER                          │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ feature-impl    │  │ bugfix-workflow             │  │
│  │ - implement     │  │ - analyze                   │  │
│  │ - self-check    │  │ - fix                       │  │
│  │ - summarize     │  │ - verify                    │  │
│  └────────┬────────┘  └────────────┬────────────────┘  │
│           │                        │                    │
│           ▼                        ▼                    │
│  ┌───────────────────────────────────────────────┐     │
│  │ Output Artifacts                              │     │
│  │ - implementation-summary                      │     │
│  │ - self-check-report                           │     │
│  │ - bugfix-report (if applicable)               │     │
│  └────────────────────┬──────────────────────────┘     │
└───────────────────────┼─────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │     TESTER      │
              │  - Read outputs │
              │  - Derive scope │
              │  - Design tests │
              └─────────────────┘
```

---

## 2. Field-by-Field Mapping

### 2.1 implementation-summary Consumption

#### 2.1.1 goal_alignment → Test Scope Derivation

| Developer Field | Tester Usage | Test Design Impact |
|-----------------|--------------|-------------------|
| `goal_alignment.goal` | Derive expected behavior | Defines acceptance test criteria |
| `goal_alignment.achieved` | Scope confidence level | `true` = full testing; `partial` = targeted testing with gap focus |
| `goal_alignment.deviations` | Understand intentional differences | Test actual implementation, not original design |

**Consumption Example:**

```yaml
# Developer Output (implementation-summary.goal_alignment)
goal_alignment:
  goal: "Implement JWT authentication with token refresh"
  achieved: partial
  deviations:
    - deviation: "Refresh tokens deferred to next sprint"
      rationale: "Time constraints, approved by product owner"
      approved_by: "product_owner"

# Tester Interpretation
test_scope:
  in_scope:
    - JWT token generation
    - JWT token validation
    - Authentication flow
  out_of_scope:
    - Token refresh functionality (documented deviation)
  acceptance_criteria:
    - "User can authenticate with valid credentials"
    - "JWT token is issued on successful authentication"
    - "Invalid credentials are rejected"
```

**BR-001 Compliance Check:**
- [ ] `goal_alignment.goal` read and understood
- [ ] `goal_alignment.achieved` informs test strategy
- [ ] `deviations` acknowledged (not treated as bugs)

---

#### 2.1.2 changed_files → Test Surface Identification

| Developer Field | Tester Usage | Test Design Impact |
|-----------------|--------------|-------------------|
| `changed_files[].path` | Identify files to test | Direct mapping to test targets |
| `changed_files[].change_type` | Understand change nature | `added` = new tests; `modified` = regression + modification tests |
| `changed_files[].description` | Understand purpose | Inform test scenario design |
| `changed_files[].lines_changed` | Gauge change magnitude | Large changes → more thorough testing |

**Consumption Example:**

```yaml
# Developer Output (implementation-summary.changed_files)
changed_files:
  - path: "src/services/AuthService.ts"
    change_type: "added"
    description: "Core authentication service with JWT"
    lines_changed:
      added: 120
      deleted: 0
  - path: "src/controllers/AuthController.ts"
    change_type: "added"
    description: "HTTP endpoints for auth"
    lines_changed:
      added: 85
      deleted: 0
  - path: "src/middleware/authMiddleware.ts"
    change_type: "added"
    description: "JWT validation middleware"
    lines_changed:
      added: 45
      deleted: 0

# Tester Interpretation
test_surface:
  unit_tests:
    - target: "src/services/AuthService.ts"
      test_file: "tests/unit/AuthService.test.ts"
      scenarios:
        - "generateToken() with valid credentials"
        - "generateToken() with invalid credentials"
        - "validateToken() with valid token"
        - "validateToken() with expired token"
  integration_tests:
    - target: "src/controllers/AuthController.ts"
      test_file: "tests/integration/auth-flow.test.ts"
      scenarios:
        - "POST /auth/login - successful"
        - "POST /auth/login - failed"
  middleware_tests:
    - target: "src/middleware/authMiddleware.ts"
      test_file: "tests/unit/authMiddleware.test.ts"
      scenarios:
        - "Valid JWT passes through"
        - "Invalid JWT returns 401"
        - "Missing JWT returns 401"
```

**BR-001 Compliance Check:**
- [ ] All `changed_files` mapped to test surface
- [ ] `change_type` informs test strategy
- [ ] Change magnitude considered in test depth

---

#### 2.1.3 known_issues → Known Limitation Handling

| Developer Field | Tester Usage | Test Design Impact |
|-----------------|--------------|-------------------|
| `known_issues[].issue_id` | Track issue | Reference in test report |
| `known_issues[].description` | Understand limitation | Skip related false positive checks |
| `known_issues[].severity` | Assess impact | High severity → verify workaround |
| `known_issues[].workaround` | Document in test | Include in test report for awareness |

**Consumption Example:**

```yaml
# Developer Output (implementation-summary.known_issues)
known_issues:
  - issue_id: "ISSUE-001"
    description: "Token expiry handling needs improvement"
    severity: "medium"
    component: "AuthService"
    planned_fix: "Next sprint"
    workaround: "Client must handle 401 and re-authenticate"

# Tester Interpretation
test_handling:
  issue_acknowledged:
    - issue_id: "ISSUE-001"
      test_action: "Verify 401 is returned on expired token (expected behavior)"
      false_positive_check: "Do NOT report 'Token expiry not handled gracefully' as bug"
  workaround_verified:
    - check: "Client receives 401 on expired token"
      status: "Expected - workaround documented"
```

**BR-001 Compliance Check:**
- [ ] All `known_issues` acknowledged
- [ ] No known issues reported as false positives
- [ ] Workarounds verified where applicable

---

#### 2.1.4 risks → Risk-Prioritized Testing

| Developer Field | Tester Usage | Test Design Impact |
|-----------------|--------------|-------------------|
| `risks[].risk_id` | Track risk | Reference in test report |
| `risks[].description` | Understand risk | Design tests to verify/mitigate |
| `risks[].level` | Prioritize testing | `high` = thorough testing; `medium` = targeted; `low` = basic |
| `risks[].mitigation` | Verify mitigation | Test that mitigation is in place |

**Consumption Example:**

```yaml
# Developer Output (implementation-summary.risks)
risks:
  - risk_id: "RISK-001"
    description: "JWT secret management"
    level: "high"
    mitigation: "Will be addressed in security review"
    owner: "security"
  - risk_id: "RISK-002"
    description: "Token expiry set to 24h may be too long"
    level: "medium"
    mitigation: "Monitor and adjust based on usage"
    owner: "developer"

# Tester Interpretation
risk_prioritized_testing:
  high_priority:
    - risk_id: "RISK-001"
      test_actions:
        - "Verify JWT secret is not hardcoded"
        - "Verify secret is loaded from environment"
        - "Verify secret is not logged"
      escalation: "Security review required before production"
  medium_priority:
    - risk_id: "RISK-002"
      test_actions:
        - "Verify token expiry is configurable"
        - "Verify default is 24h as documented"
```

**BR-001 Compliance Check:**
- [ ] All `risks` prioritized in test plan
- [ ] High-risk areas receive thorough testing
- [ ] Mitigations verified

---

#### 2.1.5 tests_included → Existing Test Baseline

| Developer Field | Tester Usage | Test Design Impact |
|-----------------|--------------|-------------------|
| `tests[].type` | Understand test coverage | Build on existing tests |
| `tests[].files` | Locate test files | Review and extend |
| `tests[].coverage` | Assess coverage level | Supplement gaps |
| `tests[].status` | Verify test health | Re-run to confirm |

**Consumption Example:**

```yaml
# Developer Output (implementation-summary.tests)
tests:
  - type: "unit"
    files: ["tests/unit/AuthService.test.ts"]
    coverage: "92%"
    status: "pass"

# Tester Interpretation
test_baseline:
  existing_tests:
    - file: "tests/unit/AuthService.test.ts"
      action: "Review and re-run"
      extension_needed:
        - "Add edge case tests for boundary conditions"
        - "Add invalid input tests"
  coverage_gaps:
    - "Missing integration tests for auth flow"
    - "Missing middleware tests"
```

**BR-001 Compliance Check:**
- [ ] `tests_included` reviewed
- [ ] Existing tests re-run for verification
- [ ] Coverage gaps identified and addressed

---

### 2.2 self-check-report Consumption

#### 2.2.1 Distinguishing Self-Check from Independent Verification (BR-002)

| Developer Field | Tester Usage | Distinction Guidance |
|-----------------|--------------|---------------------|
| `self_check_report.overall_status` | Understand developer confidence | `PASS` = developer claims ready; tester still verifies independently |
| `self_check_report.check_results` | Identify focus areas | Use as hints, not as evidence |
| `self_check_report.blockers` | Verify resolution | Confirm blockers are actually fixed |
| `self_check_report.warnings` | Consider in testing | Warnings may indicate edge cases |

**BR-002 Compliance Matrix:**

| Aspect | Developer Self-Check | Tester Independent Verification |
|--------|---------------------|--------------------------------|
| **Purpose** | Pre-delivery validation | Independent evidence for reviewer/acceptance |
| **Authority** | Internal to implementation | Consumable by downstream roles |
| **Evidence** | Self-reported | Observed and recorded by tester |
| **Cannot Replace** | Cannot replace tester verification | N/A (is the replacement) |

**Consumption Example:**

```yaml
# Developer Output (self-check-report)
self_check_report:
  overall_status: "PASS"
  summary:
    total_checks: 28
    passed: 28
    failed: 0
    blockers: 0
    warnings: 1
  check_results:
    - category: "Goal Alignment"
      checks:
        - item: "Implementation matches task goal"
          status: "pass"
          severity: "blocker"
          description: "All acceptance criteria met"
    - category: "Test Coverage"
      checks:
        - item: "New code has tests"
          status: "pass"
          severity: "blocker"
          description: "92% coverage achieved"

# Tester Interpretation (BR-002 Compliant)
verification_approach:
  self_check_acknowledged:
    status: "Developer claims PASS with 28/28 checks"
    confidence: "Informs test strategy but does NOT replace verification"
  
  independent_verification:
    - claim: "Implementation matches task goal"
      tester_action: "Design and execute acceptance tests"
      evidence_type: "Test results, NOT self-check assertion"
    - claim: "New code has tests (92% coverage)"
      tester_action: "Review test coverage independently"
      evidence_type: "Coverage report, NOT self-check count"
  
  spot_checks:
    - check: "Verify at least 3 self-check items are accurate"
      items:
        - "Code compiles without errors"
        - "No hardcoded secrets"
        - "Input validation present"
```

**BR-002 Compliance Check:**
- [ ] Self-check distinguished from independent verification in test report
- [ ] Self-check used as hints, not evidence
- [ ] Independent evidence collected for all claims

---

### 2.3 bugfix-report Consumption (for Bugfix Scenarios)

#### 2.3.1 root_cause → Regression Check Design

| Developer Field | Tester Usage | Test Design Impact |
|-----------------|--------------|-------------------|
| `bugfix_report.root_cause.category` | Understand failure type | Design regression tests for category |
| `bugfix_report.root_cause.description` | Deep understanding | Design tests that would catch recurrence |
| `bugfix_report.root_cause.contributing_factors` | Identify conditions | Test scenarios with contributing factors |

**Consumption Example:**

```yaml
# Developer Output (bugfix-report.root_cause)
bugfix_report:
  root_cause:
    category: "concurrency"
    description: |
      Order creation and idempotency check are not atomic.
      Concurrent requests with same idempotency key pass check
      simultaneously and both create orders.
    analysis_method: "Code Review + Log Analysis"
    contributing_factors:
      - factor: "No database constraint on idempotency key"
        impact: "Race condition possible"
      - factor: "Check-then-act pattern without locking"
        impact: "Time-of-check to time-of-use vulnerability"

# Tester Interpretation
regression_test_design:
  root_cause_aware:
    - category: "concurrency"
      test_scenarios:
        - "Concurrent requests with same idempotency key"
        - "Rapid-fire order creation"
        - "Order creation under load"
      regression_checks:
        - "Database unique constraint on idempotency_key"
        - "Database transaction wraps check+create"
        - "Only one order created per key"
  contributing_factor_tests:
    - factor: "No database constraint"
      test: "Verify unique constraint exists and is enforced"
    - factor: "Check-then-act pattern"
      test: "Verify atomic operation or proper locking"
```

**BR-001 Compliance Check:**
- [ ] `root_cause` understood and addressed
- [ ] Regression tests designed for recurrence prevention
- [ ] Contributing factors tested

---

## 3. Upstream Artifact Reading Guide

### 3.1 Reading Order

```
1. implementation-summary.goal_alignment
   ↓ (understand what to verify)
2. implementation-summary.changed_files
   ↓ (understand what to test)
3. implementation-summary.known_issues + risks
   ↓ (understand limitations and priorities)
4. self-check-report
   ↓ (understand developer claims)
5. bugfix-report (if applicable)
   ↓ (understand root cause for regression)
```

### 3.2 Example: Complete Consumption Workflow

**Step 1: Read goal_alignment**
```markdown
## What I'm Verifying
- Goal: "Implement JWT authentication"
- Achieved: true
- Deviations: None
```

**Step 2: Map changed_files**
```markdown
## Test Surface
| File | Type | Tests Needed |
|------|------|--------------|
| AuthService.ts | added | Unit tests for generate/validate |
| AuthController.ts | added | Integration tests for endpoints |
| authMiddleware.ts | added | Unit tests for middleware |
```

**Step 3: Acknowledge known_issues**
```markdown
## Known Limitations (Not Bugs)
| Issue | Test Action |
|-------|-------------|
| ISSUE-001: Token expiry handling | Verify 401 returned (expected) |
```

**Step 4: Prioritize risks**
```markdown
## Risk-Prioritized Testing
| Risk | Level | Test Focus |
|------|-------|------------|
| RISK-001: JWT secret management | high | Verify no hardcoding, env loading |
| RISK-002: 24h expiry | medium | Verify configurable |
```

**Step 5: Distinguish self-check**
```markdown
## Self-Check vs Independent Verification
| Developer Claim | Tester Verification |
|-----------------|---------------------|
| "All acceptance criteria met" | Execute acceptance tests |
| "92% test coverage" | Review coverage report |
```

---

## 4. Handling Missing or Incomplete Developer Outputs

### 4.1 Missing Fields Handling

| Missing Field | Impact | Tester Action | Escalation |
|---------------|--------|---------------|------------|
| `goal_alignment` | Cannot derive expected behavior | Request from developer | Yes (BLOCKED) |
| `changed_files` | Cannot identify test surface | Review git diff manually | No (workaround exists) |
| `known_issues` | May report false positives | Test conservatively, document assumptions | No |
| `risks` | Cannot prioritize | Test all areas equally | No |
| `self-check-report` | No pre-validation hints | Increase test thoroughness | No |
| `bugfix-report.root_cause` (bugfix scenarios) | Cannot design root-cause-aware regression | Request from developer | Yes (BLOCKED) |

### 4.2 Incomplete Output Handling

**Scenario: goal_alignment.achieved = partial**

```yaml
test_strategy:
  adjustment: "Focus on achieved features; document gaps"
  achieved_features:
    - test: "Full verification"
  partial_features:
    - test: "Verify implemented portion"
    - document: "Gap in coverage"
  recommendation: "PASS_TO_REVIEW with documented gaps"
```

**Scenario: changed_files missing entries**

```yaml
test_strategy:
  adjustment: "Discover missing files via git diff"
  action: "Run `git diff HEAD~1 --name-only` to find all changed files"
  documentation: "Note in verification-report that changed_files was incomplete"
```

### 4.3 Escalation Triggers

Escalate to developer/management when:

| Condition | Reason | Escalation Level |
|-----------|--------|-----------------|
| `goal_alignment` completely missing | Cannot derive test scope | Level 2 (developer + reviewer) |
| `bugfix-report.root_cause` missing (bugfix scenario) | Cannot design regression tests | Level 2 (developer + reviewer) |
| `self-check-report` claims PASS but code doesn't compile | Self-check inaccuracy | Level 2 (developer + reviewer) |
| Multiple `known_issues` discovered during testing that were not documented | Honesty concern | Level 2 (developer + reviewer) |

---

## 5. BR-002 Compliance: Self-Check vs Independent Verification

### 5.1 Formal Distinction

| Dimension | Developer Self-Check | Tester Independent Verification |
|-----------|---------------------|--------------------------------|
| **Executor** | developer | tester |
| **Timing** | Pre-delivery (before handoff) | Post-delivery (after handoff) |
| **Purpose** | Validate own work before review | Provide independent evidence |
| **Evidence Type** | Self-reported observations | Independently observed results |
| **Consumer Trust** | Lower (inherent conflict of interest) | Higher (independent party) |
| **Can Replace** | Cannot replace tester verification | Replaces self-check as evidence |

### 5.2 Test Report Language Requirements

**Prohibited (BR-002 Violation):**
- ❌ "Developer verified this works"
- ❌ "Self-check passed, so we assume correct"
- ❌ "No testing needed - self-check covered it"

**Required (BR-002 Compliant):**
- ✅ "Tester independently verified..."
- ✅ "Test execution results: ..."
- ✅ "Evidence: [test output/logs/assertions]"
- ✅ "Developer self-check noted, independent verification performed"

### 5.3 Self-Check Spot-Check Requirements

Tester must spot-check at least **3 self-check items** for accuracy:

```yaml
spot_check_requirements:
  minimum_items: 3
  suggested_items:
    - "Code compiles without errors"
    - "No hardcoded secrets"
    - "Input validation present"
    - "Tests pass"
    - "No obvious logic errors"
  
  reporting:
    accurate: "Self-check accuracy verified for X items"
    inaccurate: "Self-check inaccuracy found: [description]. Lower confidence."
```

---

## 6. Validation Checklist

### 6.1 Pre-Test Execution Consumption Check

Before beginning test execution, verify:

- [ ] `implementation-summary.goal_alignment` read and understood
- [ ] `implementation-summary.changed_files` mapped to test surface
- [ ] `implementation-summary.known_issues` acknowledged (not false positives)
- [ ] `implementation-summary.risks` prioritized for testing
- [ ] `implementation-summary.tests_included` reviewed
- [ ] `self-check-report` read (used as hints, not evidence)
- [ ] `bugfix-report.root_cause` read (if bugfix scenario)
- [ ] BR-002 compliance: Independent verification planned (not relying on self-check)

### 6.2 Post-Test Execution Consumption Check

After test execution, verify:

- [ ] All `changed_files` tested
- [ ] All `known_issues` acknowledged in test report
- [ ] High-risk areas from `risks` tested thoroughly
- [ ] Self-check spot-checks completed
- [ ] Root-cause regression tests executed (if bugfix)
- [ ] Evidence is independent (not restating self-check)

---

## 7. References

- `specs/005-tester-core/spec.md` - Feature specification (Section 4.2, Section 6 Business Rules)
- `specs/005-tester-core/role-scope.md` - Tester role scope (Section 4: Inputs)
- `specs/004-developer-core/contracts/implementation-summary-contract.md` - Upstream artifact schema
- `specs/004-developer-core/contracts/self-check-report-contract.md` - Self-check schema
- `specs/004-developer-core/contracts/bugfix-report-contract.md` - Bugfix schema
- `specs/004-developer-core/downstream-interfaces.md` - Developer downstream interfaces
- `role-definition.md` - 6-role definitions

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-25 | Initial upstream consumption guide aligned with 004-developer-core contracts |
