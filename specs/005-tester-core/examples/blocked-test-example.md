# Blocked Test Example

## Example Metadata

| Field | Value |
|-------|-------|
| **Example Type** | Blocked Testing Scenario |
| **Workflow Reference** | spec.md Section 5.3 Workflow 3 |
| **Skills Used** | N/A (escalation workflow) |
| **Artifacts Produced** | verification-report (with blocker), escalation request |
| **Key Feature** | Honest gap reporting (BR-007) |

---

## 1. Scenario Overview

### 1.1 Feature Being Verified

**Feature**: Payment Processing Integration

**Implementation Summary** (from developer):
```yaml
implementation_summary:
  goal_alignment:
    goal: "Integrate with third-party payment processor (Stripe)"
    achieved: true
  
  changed_files:
    - path: "src/services/PaymentService.ts"
      change_type: "added"
    - path: "src/controllers/PaymentController.ts"
      change_type: "added"
  
  known_issues:
    - issue_id: "ISSUE-001"
      description: "Payment webhook handling not implemented"
      severity: "medium"
  
  risks:
    - risk_id: "RISK-001"
      description: "Payment processing involves real money"
      level: "critical"
```

### 1.2 Blocker Identified

**Blocker Type**: Environment Issue

**Blocker Description**: 
Payment processor sandbox environment is not configured. Test API keys are missing, and sandbox account creation requires approval from payment processor (takes 2-3 business days).

**Impact**: Cannot execute any payment integration tests against real payment processor.

---

## 2. Tester Workflow Execution

### 2.1 Step 1: Attempt Normal Workflow

**Consumed Developer Artifacts**:
- ✅ implementation-summary.goal_alignment
- ✅ implementation-summary.changed_files
- ✅ implementation-summary.known_issues
- ✅ implementation-summary.risks
- ✅ self-check-report

**Test Scope Derivation**:
```yaml
test_scope:
  goal_under_test: "Payment processing integration"
  changed_surface:
    - PaymentService.ts
    - PaymentController.ts
  in_scope_items:
    - Payment creation with valid card
    - Payment validation
    - Webhook handling (noted as known issue)
  out_of_scope_items:
    - None initially intended
```

### 2.2 Step 2: Identify Blocker

**Blocker Discovery**:
```
Attempting to run payment integration tests...

Test: POST /payments/create
Error: STRIPE_API_KEY not found in environment
Action: Check environment configuration
Result: API keys not configured

Test: Mock payment flow
Result: Mock mode not supported by implementation

Resolution Attempts:
1. Request API keys from developer → Developer does not have them
2. Create sandbox account → Requires approval (2-3 days)
3. Use mock/stub → Implementation requires real API

Status: BLOCKED
```

### 2.3 Step 3: Classify Blocker

**Blocker Classification**:

| Category | Assessment |
|----------|------------|
| **Type** | Environment Issue |
| **Severity** | Critical (blocks all payment tests) |
| **Resolvable by Tester** | No |
| **Resolvable by Developer** | No (requires external approval) |
| **Requires Management** | Yes (timeline decision needed) |

**Classification Reasoning**:
- Not an implementation issue (code is correct)
- Not a test issue (tests are designed correctly)
- Environment issue: External dependency unavailable
- Requires management decision: Accept delay or defer testing

### 2.4 Step 4: Document in verification-report

**verification-report (Partial)**:

```yaml
verification_report:
  test_scope_reference: "Payment Processing Integration"
  
  execution_summary:
    status: "BLOCKED"
    blocker_identified: true
  
  tests_added_or_run:
    - test: "tests/unit/PaymentService.test.ts"
      status: "DESIGNED (not executed)"
      reason: "Environment blocked"
    - test: "tests/integration/payment-flow.test.ts"
      status: "DESIGNED (not executed)"
      reason: "Environment blocked"
  
  pass_cases: []
  
  failed_cases: []
  
  blocked_items:
    - blocker_id: "BLOCKER-001"
      description: "Payment processor sandbox environment not configured"
      classification: "Environment Issue"
      impact: "Cannot execute any payment integration tests"
      attempted_resolutions:
        - action: "Request API keys from developer"
          result: "Developer does not have them"
        - action: "Create sandbox account"
          result: "Requires approval (2-3 days)"
        - action: "Use mock/stub"
          result: "Implementation requires real API"
      required_resolution:
        - "Obtain sandbox API keys, OR"
        - "Implement mock mode for testing, OR"
        - "Accept feature without integration testing (not recommended)"
      escalation_target: "management"
  
  confidence_level: "LOW"
  
  recommendation: "ESCALATE"
```

---

### 2.5 Step 5: Honest Gap Reporting (BR-007)

**Gap Disclosure**:

```yaml
coverage_gaps:
  - gap: "All payment integration tests"
    reason: "BLOCKED - Sandbox environment not configured"
    impact: "CRITICAL - Cannot verify payment processing"
    status: "BLOCKED"
  
  - gap: "Payment creation flow"
    reason: "BLOCKED - API keys unavailable"
    impact: "HIGH - Core feature unverified"
    status: "BLOCKED"
  
  - gap: "Webhook handling"
    reason: "BLOCKED - Cannot test without processor"
    impact: "MEDIUM - Already documented as known issue"
    status: "BLOCKED"

confidence_level: "LOW"
rationale: |
  Zero integration tests executed due to environment blocker.
  Unit tests designed but not run (require mock implementation).
  Cannot verify payment processing without sandbox access.
  
  BR-007 Compliance: Reporting LOW confidence honestly.
  Not claiming "tested locally" or "looks good".
```

---

### 2.6 Step 6: Escalation

**Escalation Request**:

```yaml
escalation_request:
  escalation_id: "ESC-001"
  from_role: "tester"
  to_roles: ["management", "developer"]
  
  summary: "Payment integration testing blocked by environment configuration"
  
  blocker_details:
    id: "BLOCKER-001"
    type: "Environment Issue"
    severity: "Critical"
    description: "Payment processor sandbox environment not configured"
  
  impact:
    - "Cannot verify payment processing functionality"
    - "Cannot confirm integration with third-party service"
    - "Critical feature (payment) untested"
  
  options:
    - option: "Wait for sandbox approval (2-3 days)"
      pros: "Full integration testing possible"
      cons: "Delays feature delivery"
    
    - option: "Implement mock mode for testing"
      pros: "Can test without external dependency"
      cons: "Requires code change by developer"
    
    - option: "Accept feature without integration testing"
      pros: "No delay"
      cons: "HIGH RISK - Payment processing unverified"
  
  tester_recommendation: |
    Option 1 (wait for sandbox) is recommended.
    Payment processing is critical and should be tested.
    Option 3 (accept without testing) is NOT recommended for payment features.
  
  required_decision_by: "management"
```

---

## 3. Blocker Classification Details

### 3.1 Blocker Type Determination

**Analysis**:

| Check | Result |
|-------|--------|
| Is implementation incorrect? | No → Not Implementation Issue |
| Is test code incorrect? | No → Not Test Issue |
| Is environment misconfigured? | Yes → Environment Issue |
| Is requirement ambiguous? | No → Not Design/Spec Issue |
| Is dependency available? | No → Could be Dependency Issue |

**Final Classification**: Environment Issue (primary), Dependency Issue (secondary)

### 3.2 Escalation Path

```
Tester identifies blocker
    ↓
Classify blocker type
    ↓
Document in verification-report
    ↓
Determine resolution requires management decision
    ↓
Escalate with options and recommendation
    ↓
Wait for resolution decision
```

---

## 4. Verification Report (Complete)

### 4.1 test-scope-report (Designed, Not Executed)

```yaml
test_scope_report:
  input_artifacts:
    - implementation-summary
    - self-check-report
  
  goal_under_test: "Payment processing integration"
  
  changed_surface:
    - "src/services/PaymentService.ts"
    - "src/controllers/PaymentController.ts"
  
  risk_priorities:
    - risk_id: "RISK-001"
      level: "critical"
      description: "Payment processing involves real money"
  
  test_strategy: |
    1. Unit tests for PaymentService methods
    2. Integration tests for payment flow
    3. Webhook handling tests (note: known issue)
  
  in_scope_items:
    - Payment creation
    - Payment validation
    - Webhook handling
  
  out_of_scope_items:
    - To be determined based on blocker resolution
  
  recommendation: "BLOCKED"
```

### 4.2 verification-report (With Blocker)

```yaml
verification_report:
  test_scope_reference: "test-scope-report ID: TSR-PAY-001"
  
  tests_added_or_run: []
  
  execution_summary:
    status: "BLOCKED"
    total_tests: 0
    passed: 0
    failed: 0
    blocked: 4
  
  pass_cases: []
  failed_cases: []
  failure_classification: N/A
  
  blocked_items:
    - blocker_id: "BLOCKER-001"
      description: "Payment processor sandbox environment not configured"
      classification: "Environment Issue"
      impact: "All payment integration tests"
      escalation: "management"
  
  evidence: "N/A - No tests executed due to blocker"
  
  coverage_gaps:
    - gap: "All payment integration tests"
      reason: "BLOCKER-001"
      impact: "CRITICAL"
  
  confidence_level: "LOW"
  
  recommendation: "ESCALATE"
  
  escalation_reference: "ESC-001"
```

---

## 5. BR-007 Compliance Demonstration

### 5.1 What NOT to Do

**Prohibited (BR-007 Violation)**:
```yaml
# ❌ WRONG: False confidence
confidence_level: "FULL"
rationale: "Developer said it works, self-check passed"
```

```yaml
# ❌ WRONG: Hidden blocker
verification_report:
  execution_summary: "Tests designed and ready"
  recommendation: "PASS_TO_REVIEW"
  # Missing: Blocker documentation
```

### 5.2 Correct Approach

**Required (BR-007 Compliant)**:
```yaml
# ✅ CORRECT: Honest reporting
confidence_level: "LOW"
rationale: |
  Zero tests executed due to environment blocker.
  Cannot verify payment processing without sandbox.
  Escalating to management for decision.
recommendation: "ESCALATE"
```

---

## 6. Resolution Options for Management

### 6.1 Option 1: Wait for Sandbox Approval

| Aspect | Detail |
|--------|--------|
| Timeline | 2-3 days |
| Impact | Feature delivery delayed |
| Risk | Low (full testing possible) |
| Tester Recommendation | ✅ Recommended |

### 6.2 Option 2: Implement Mock Mode

| Aspect | Detail |
|--------|--------|
| Timeline | 1 day (developer effort) |
| Impact | Requires code change |
| Risk | Medium (mock may not match real behavior) |
| Tester Recommendation | Acceptable alternative |

### 6.3 Option 3: Accept Without Testing

| Aspect | Detail |
|--------|--------|
| Timeline | Immediate |
| Impact | No delay |
| Risk | HIGH (payment unverified) |
| Tester Recommendation | ❌ NOT RECOMMENDED |

---

## 7. Lessons Learned

### 7.1 Prevention for Future

1. **Environment Checklist**: Verify external dependencies before implementation begins
2. **Early Coordination**: Request sandbox access during planning phase
3. **Mock-First Development**: Implement testable interfaces from start

### 7.2 Documentation for Future Reference

This blocker example demonstrates:
- Proper blocker identification and classification
- Honest LOW confidence reporting (BR-007)
- Clear escalation with options
- No false confidence despite pressure to deliver

---

## 8. BR Compliance Summary

| BR | Compliance | Evidence |
|----|------------|----------|
| BR-001 | ✅ | Consumed developer artifacts before identifying blocker |
| BR-002 | ✅ | Self-check not used as evidence (no testing done) |
| BR-003 | ✅ | Coverage gaps documented (all tests blocked) |
| BR-004 | ✅ | N/A (no failures to classify) |
| BR-005 | ✅ | N/A (no tests executed) |
| BR-006 | ✅ | N/A (no tests executed) |
| BR-007 | ✅ | **HONEST LOW CONFIDENCE REPORTING** - Key demonstration |
| BR-008 | ✅ | No business logic mutation |
| BR-009 | ✅ | 6-role terminology used |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial blocked test example demonstrating BR-007 compliance |