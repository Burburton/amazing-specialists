# Anti-Example 002: Self-Check Confusion

## What This Anti-Example Looks Like

### ❌ Incorrect Test Report (Self-Check Confusion)

```markdown
## Verification Report

### Test Summary
All tests passed. Developer self-check confirmed that:
- All 15 self-check items passed
- Code compiles without errors
- No hardcoded secrets
- Input validation is in place

### Conclusion
✅ PASSED - Developer verified all acceptance criteria are met.
```

## Why This Is Wrong

### BR-002 Violation: Self-Check Is Not Independent Verification

This test report **confuses developer self-check with tester verification**:

| Problem | Why It's Wrong |
|---------|----------------|
| **Restating self-check as evidence** | "Developer self-check confirmed..." - whose evidence is this? |
| **No independent verification** | Where is tester's own test execution? |
| **No test details** | What tests did tester run? What were the results? |
| **Conclusion based on self-check** | "Developer verified" - tester didn't verify anything |

### BR-002 Compliance Matrix

| Aspect | Developer Self-Check | Tester Independent Verification |
|--------|---------------------|--------------------------------|
| **Executor** | developer | ❌ developer (should be tester) |
| **Timing** | Pre-delivery | ❌ Not performed |
| **Purpose** | Validate own work | ❌ Not fulfilled |
| **Evidence Type** | Self-reported | ❌ No independent evidence |
| **Consumer Trust** | Lower (conflict of interest) | ❌ Untrustworthy |

## How to Detect This Anti-Pattern

### Detection Checklist

- [ ] **Evidence Source Check**: Does the report say "developer verified" or "self-check passed"?
- [ ] **Test Execution Check**: Are there specific test cases run by tester listed?
- [ ] **Test Results Check**: Are there actual test results (pass/fail counts, execution logs)?
- [ ] **Assertion Check**: Does the report include specific assertions made by tester?
- [ ] **Spot-Check Check**: Did tester spot-check at least 3 self-check items for accuracy?

### Warning Signs

```text
🚩 "Developer confirmed..." or "Self-check shows..."
🚩 No test case IDs or test names
🚩 No test execution logs or outputs
🚩 "All tests passed" without listing what tests
🚩 No distinction between self-check and independent verification
```

## How to Fix This

### Step 1: Explicitly Distinguish Self-Check from Verification

```yaml
verification_approach:
  self_check_acknowledged:
    status: "Developer claims PASS with 15/15 checks"
    use: "Hints for test focus, NOT evidence"
  
  independent_verification:
    - claim: "Input validation present"
      tester_action: "Test 5 invalid input scenarios"
      evidence: "Test UT-VAL-002 through UT-VAL-006 all pass"
    
    - claim: "No hardcoded secrets"
      tester_action: "Review code + test env variable loading"
      evidence: "Test UT-AUTH-004 verifies JWT_SECRET from env"
```

### Step 2: Perform Spot-Checks on Self-Check Items

Tester must verify at least 3 self-check items:

```yaml
spot_checks:
  - self_check_item: "Code compiles without errors"
    tester_verification: "Run build, confirm no errors"
    result: "Verified - build succeeds"
  
  - self_check_item: "No hardcoded secrets"
    tester_verification: "Search codebase for hardcoded strings, test env loading"
    result: "Verified - JWT_SECRET loaded from env"
  
  - self_check_item: "Input validation present"
    tester_verification: "Send invalid inputs, verify rejection"
    result: "Verified - invalid emails rejected with 400"
```

### Step 3: Use Correct Language

**Prohibited (BR-002 Violation):**
- ❌ "Developer verified this works"
- ❌ "Self-check passed, so we assume correct"
- ❌ "No testing needed - self-check covered it"

**Required (BR-002 Compliant):**
- ✅ "Tester independently verified..."
- ✅ "Test execution results: 7 passed, 0 failed"
- ✅ "Evidence: [test output/logs/assertions]"
- ✅ "Developer self-check noted, independent verification performed"

## Corrected Example

### ✅ Correct Test Report (BR-002 Compliant)

```markdown
## Verification Report

### Self-Check Acknowledged
Developer self-check reported 15/15 checks passed. Self-check used as hints for test focus.

### Independent Verification Performed

#### Tests Executed by Tester
| Test ID | Test Name | Result | Evidence |
|---------|-----------|--------|----------|
| UT-AUTH-001 | Valid credentials return token | PASS | Log: token generated |
| UT-AUTH-002 | Invalid password rejected | PASS | Log: 401 returned |
| UT-AUTH-003 | Empty username rejected | PASS | Log: ValidationError |
| UT-AUTH-004 | JWT secret from env | PASS | Log: no hardcoded secret |
| UT-AUTH-005 | Token expiry configurable | PASS | Log: 24h default |

#### Summary
- Tests run: 5
- Passed: 5
- Failed: 0
- Blocked: 0

#### Spot-Check of Self-Check Items
Tester verified 3 self-check claims independently:
1. ✅ "Code compiles" - Build run successfully
2. ✅ "No hardcoded secrets" - Code review + test confirmed
3. ✅ "Input validation present" - 4 invalid input tests passed

### Conclusion
✅ PASSED - Tester independently verified all critical paths.
```

## Lesson

**Developer self-check is hints, not evidence.** Tester must perform independent verification and collect independent evidence. The test report must clearly distinguish "developer claims" from "tester verified".

---

## References

- `specs/005-tester-core/spec.md` Section 6: BR-002 (Self-Check Is Not Independent Verification)
- `specs/005-tester-core/upstream-consumption.md` Section 5: BR-002 Compliance
- `specs/005-tester-core/contracts/verification-report-contract.md` - Evidence format requirements
