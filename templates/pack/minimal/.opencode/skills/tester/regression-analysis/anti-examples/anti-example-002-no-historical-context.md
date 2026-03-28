# Anti-Example 002: No Historical Context

## What This Anti-Example Looks Like

### ❌ Incorrect Regression Analysis (Ignoring Historical Patterns)

```yaml
regression_analysis:
  change_summary:
    changed_files:
      - path: "src/services/OrderService.ts"
        change_type: "modified"
        description: "Fix idempotency issue in order creation"
  
  bugfix-report: null  # ❌ Not read or referenced
  
  historical_issues: {}  # ❌ Empty - no historical analysis
  
  regression_strategy:
    test_cases:
      - id: "TC-001"
        name: "Order creation works"
        # ❌ No test for the specific root cause
      
  recurring_patterns: []  # ❌ No patterns identified
```

## Why This Is Wrong

### BR-001 Violation: Tester Must Consume Developer Evidence

For bugfix scenarios, `bugfix-report.root_cause` is **required input** that was ignored:

| Missing Field | Purpose | Consequence |
|--------------|---------|-------------|
| `bugfix-report.root_cause.category` | Understand failure type | May miss similar issues |
| `bugfix-report.root_cause.description` | Deep understanding | Cannot design recurrence prevention |
| `bugfix-report.root_cause.contributing_factors` | Identify conditions | Cannot test scenarios with factors |

### BR-006 Violation: No Root-Cause-Aware Testing

Without reading bugfix-report, regression tests are **generic** instead of **targeted at the specific root cause**.

### Risk of This Anti-Pattern

```
Bug Recurrence Scenario:

Original Bug: "Duplicate orders created due to race condition in idempotency check"
Root Cause: "Check-then-act pattern without database constraint"

Regression Analysis (No Historical Context):
- Tests: "Order creation works" (happy path only)
- Missing: "Concurrent requests with same idempotency key"

Result:
1. Fix is deployed without database constraint
2. Race condition still possible
3. Duplicate orders recur in production
4. Customer complains about double charges

This was preventable with root-cause-aware regression design.
```

## How to Detect This Anti-Pattern

### Detection Checklist

- [ ] **Bugfix Scenario Check**: Is this a bugfix? If yes, was bugfix-report read?
- [ ] **Root Cause Reference**: Does regression analysis reference root_cause.category?
- [ ] **Contributing Factors**: Are contributing factors tested?
- [ ] **Historical Patterns**: Are similar historical bugs considered?
- [ ] **Recurrence Prevention**: Is there a test that would catch the same root cause?

### Warning Signs

```text
🚩 bugfix-report not mentioned for bugfix scenario
🚩 No reference to root_cause in test design
🚩 Tests are generic ("works", "doesn't crash")
🚩 No test for the specific failure mode
🚩 historical_issues is empty
🚩 No "similar changes" or "recurring patterns" analysis
```

## How to Fix This

### Step 1: Read and Understand bugfix-report

```yaml
# Required consumption for bugfix scenarios
bugfix_report_consumption:
  root_cause:
    category: "concurrency"  # ← This tells you what to test
    description: "Check-then-act without locking"
    contributing_factors:
      - "No database constraint on idempotency key"
      - "Time gap between check and create"
  
  test_design_implications:
    - "Test concurrent requests"
    - "Test with database constraint"
    - "Test atomic operation"
```

### Step 2: Design Root-Cause-Aware Regression Tests

```yaml
# Correct regression tests for the idempotency bugfix
test_cases:
  - id: "TC-REG-001"
    name: "Concurrent requests with same idempotency key create only one order"
    root_cause_addressed: "concurrency"
    
    scenario:
      given: "Two requests sent simultaneously with same idempotency_key"
      when: "Both requests are processed"
      then: "Only one order is created"
    
    root_cause_verification:
      - "Database unique constraint on idempotency_key"
      - "Transaction wraps check+create atomically"
      - "Second request returns existing order, doesn't create new"
  
  - id: "TC-REG-002"
    name: "Rapid-fire requests don't create duplicates"
    root_cause_addressed: "timing"
    
    scenario:
      given: "10 requests sent in rapid succession with same key"
      when: "All requests are processed"
      then: "Exactly 1 order created, 9 return existing order"
```

### Step 3: Consider Historical Patterns

```yaml
historical_issues:
  similar_changes:
    - change: "Previous idempotency fix (2025-08)"
      issues: ["Race condition still possible under load"]
      lesson: "Database constraint required, not just application logic"
  
  recurring_patterns:
    - pattern: "Check-then-act race condition"
      frequency: "Occurs in 40% of concurrency bugs"
      prevention: "Always use database constraints or locking"
    
    - pattern: "Missing unique constraint on idempotency key"
      frequency: "Common in payment systems"
      prevention: "Add constraint at database schema level"
```

## Corrected Example

See `example-001-login-lockout-regression.md` for complete regression analysis that:
- ✅ Reads bugfix-report.root_cause
- ✅ Designs tests targeting the specific root cause
- ✅ Tests contributing factors explicitly
- ✅ Considers historical similar bugs
- ✅ Identifies recurring patterns

## Lesson

**Historical context prevents recurrence.** The bugfix-report root cause is not just documentation—it's the blueprint for regression test design. Without it, you're testing blindly.

---

## References

- `specs/005-tester-core/spec.md` Section 6: BR-001 (Consume Developer Evidence)
- `specs/005-tester-core/spec.md` Section 6: BR-006 (Regression Thinking Is Required)
- `specs/005-tester-core/upstream-consumption.md` Section 2.3 (bugfix-report Consumption)
