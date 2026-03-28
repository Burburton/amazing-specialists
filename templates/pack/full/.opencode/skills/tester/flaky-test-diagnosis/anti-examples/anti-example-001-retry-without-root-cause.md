# Anti-Example 001: Retry Without Root Cause Analysis

## What This Anti-Example Looks Like

### ❌ Incorrect Flaky Test Handling (Retry Without Analysis)

```yaml
flaky_test_fix:
  test: "Payment.processPayment integration test"
  
  # WRONG: Just adding retry without understanding why
  
  approach: "Add retry configuration"
  
  changes:
    - file: "jest.config.js"
      change: |
        {
          "testEnvironment": "node",
          "retry": 3,  // ← Just added retry
          "retryDelay": 1000
        }
    
    - file: "tests/integration/Payment.test.ts"
      change: |
        // No changes to test itself
        // Just relying on retry config
    
  # No root cause analysis documented
  root_cause: "unknown"
  
  # No quarantine or investigation plan
  quarantine: false
  fix_owner: null
```

### ❌ Another Common Anti-Pattern: Marking as Expected Failure

```yaml
flaky_test_handling:
  # WRONG: Marking flaky test as expected to fail
  
  approach: "Skip flaky test or mark as expected failure"
  
  changes:
    - file: "tests/integration/Payment.test.ts"
      change: |
        // @ts-ignore - flaky test, expected to fail sometimes
        test.skip('processPayment completes within timeout', async () => {
          // ...
        });
        
        // OR:
        test.failing('processPayment completes within timeout', async () => {
          // Marked as "failing" which Jest expects to fail
        });
```

## Why This Is Wrong

### BR-004 Violation: Retry Is Not A Fix

Adding retry without root cause analysis:
- Masks the real problem
- Increases test execution time
- May still fail occasionally
- Doesn't prevent future flaky tests

| What Retry Does | What It Doesn't Do |
|-----------------|-------------------|
| Runs test again | Identify root cause |
| Sometimes passes | Fix the underlying bug |
| Adds delay | Prevent recurrence |
| Masks failure rate | Reduce real flakiness |

### BR-002 Violation: Flaky Tests Are Critical Issues

Marking tests as skip/failing:
- Undermines trust in test suite
- Hides quality problems
- Allows real bugs to escape
- Creates technical debt

### False Confidence

```yaml
ci_pipeline:
  before:
    total_tests: 100
    flaky_tests: 3
    failure_rate: 3%
    
  after_retry_config:
    reported_failures: 0  # ← False!
    actual_flakiness: still 3%
    retry_count: 9 retries across 3 tests
    
  hidden_problems:
    - "Tests still flaky, just retry hides it"
    - "CI time increased by 9 * 1s = 9 seconds"
    - "Real root causes never identified"
    - "Production bugs may still escape"
```

### Example of Bugs Retry Won't Fix

```typescript
// Bug in test: Database not cleaned
afterEach(async () => {
  // Missing: connection.rollback() or DELETE FROM table
  connection.release();
});

// Retry won't fix this - state still accumulates

// Bug in code: Race condition
async function updateStatus() {
  const current = await getStatus(); // Race here
  await setStatus(current + 1);      // Another process may have changed it
}

// Retry won't fix this - race condition persists

// Bug in test: Wrong timeout
await waitForResult(1000); // Too short for real-world latency

// Retry won't fix this - timeout still insufficient
```

All of these bugs would still cause flaky tests even with retry.

## How to Detect This Anti-Pattern

### Detection Checklist

- [ ] **Retry Check**: Does the "fix" only add retry configuration?
- [ ] **Root Cause Check**: Is root cause documented and identified?
- [ ] **Fix Check**: Does the fix change test/implementation code (not just config)?
- [ ] **Investigation Check**: Is there evidence of investigation (multiple runs, isolation tests)?
- [ ] **Verification Check**: Is stability verified after fix (not just retry)?

### Warning Signs

```text
🚩 Fix only adds retry count/delay in config
🚩 No root cause category documented
🚩 No changes to test code
🚩 No changes to implementation code
🚩 Test marked as skip/failing/expected failure
🚩 No investigation log or diagnosis report
🚩 CI time increased but failure count unchanged
🚩 "Works now" but no explanation why
```

## How to Fix This

### Step 1: Perform Proper Diagnosis

```yaml
diagnosis_process:
  1_confirm_flaky:
    action: "Run test 20 times"
    record: "Failure rate, failure pattern"
    
  2_isolate_root_cause:
    action: "Run test alone, in sequence, in random order"
    identify: "State leakage? Timing? Order dependency?"
    
  3_analyze_code:
    action: "Check test setup/teardown, async handling, mock config"
    find: "Specific code causing flakiness"
    
  4_document:
    action: "Write diagnosis report with root cause category"
    required:
      - root_cause_category
      - mechanism
      - affected_code
      - evidence
```

### Step 2: Fix Root Cause

```yaml
proper_fix:
  for_timing_issues:
    fix: "Increase timeout appropriately or use retry in test code with backoff"
    example: "await waitFor({ timeout: 5000, retries: 3, backoff: 'exponential' })"
    not: "Just add retry in jest.config"
    
  for_state_leakage:
    fix: "Add cleanup in afterEach (transaction rollback or explicit delete)"
    example: "afterEach(async () => { await connection.rollback(); })"
    not: "Retry won't help - state accumulates"
    
  for_order_dependency:
    fix: "Add proper setup in beforeEach, make tests independent"
    example: "beforeEach(async () => { await seedTestData(); })"
    not: "Retry won't help - dependency persists"
    
  for_external_dependency:
    fix: "Mock external API properly"
    example: "jest.mock('PaymentGateway', () => mockPaymentGateway)"
    not: "Retry masks external instability"
```

### Step 3: Verify Stability

```yaml
verification:
  runs: 50
  required_failure_rate: 0%
  
  techniques:
    - "Run multiple times in parallel"
    - "Run in random order"
    - "Run with stress conditions"
```

### Step 4: If Fix Not Immediate, Use Quarantine

```yaml
quarantine_process:
  when_to_quarantine: "Root cause identified but fix requires significant work"
  
  quarantine_actions:
    - Move test to quarantine suite
    - Document root cause in diagnosis report
    - Assign fix owner
    - Set fix due date
    - Schedule periodic attempts to fix
  
  quarantine_is_not:
    - "Permanent solution"
    - "Skipping test without investigation"
    - "Hiding problem without plan to fix"
```

## Corrected Example

See `example-001-state-leakage-flaky-test.md` for a proper flaky test diagnosis that:
- ✅ Identifies root cause category (state_leakage)
- ✅ Documents specific mechanism
- ✅ Provides evidence from isolation tests
- ✅ Fixes actual code (transaction rollback)
- ✅ Verifies stability with 50 post-fix runs

## Comparison: Retry-Only vs Proper Fix

| Aspect | Retry-Only (❌) | Proper Fix (✅) |
|--------|-----------------|----------------|
| Root cause | Unknown | Identified and documented |
| Fix type | Config only | Code change |
| Stability | Still flaky | Verified stable |
| CI time | Increased | Improved |
| Trust | Low (masking) | High (resolved) |
| Recurrence | Likely | Prevented |

## Lesson

**Retry is a temporary mitigation, not a fix.** Flaky tests indicate real problems in test design or implementation. The correct approach is:

1. **Diagnose** → Identify root cause
2. **Fix** → Change code to address root cause
3. **Verify** → Confirm stability with multiple runs
4. **Quarantine** → Only if fix requires significant work

> A test that needs retry is a test that needs fixing.

---

## References

- `specs/005-tester-core/spec.md` Section 6: BR-002 (Flaky Tests Are Critical)
- `specs/005-tester-core/spec.md` Section 6: BR-003 (Root Cause Must Be Identified)
- `specs/005-tester-core/spec.md` Section 6: BR-004 (Retry Is Not A Fix)
- `specs/005-tester-core/spec.md` Section 6: BR-005 (Flaky Test Quarantine)
- `.opencode/skills/tester/flaky-test-diagnosis/SKILL.md` - Proper diagnosis process