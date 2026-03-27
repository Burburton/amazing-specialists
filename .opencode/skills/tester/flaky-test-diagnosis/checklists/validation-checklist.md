# Flaky Test Diagnosis Validation Checklist

## Purpose

Reusable checklist for flaky test diagnosis. Use this checklist before, during, and after diagnosis to ensure root cause is identified and properly fixed.

---

## Phase 1: Flaky Behavior Confirmation (BR-001)

### Before Diagnosis

- [ ] **Confirm test is actually flaky**
  - [ ] Run test at least 10 times
  - [ ] Document failure rate (percentage)
  - [ ] Document failure pattern (not just "it failed")

- [ ] **Collect diagnostic data**
  - [ ] CI logs collected and analyzed
  - [ ] Local reproduction attempted
  - [ ] Execution time distribution recorded
  - [ ] Resource usage observed

- [ ] **Check developer artifacts**
  - [ ] Reviewed implementation-summary.changed_files (recent changes)
  - [ ] Checked implementation-summary.risks for flaky risk
  - [ ] Examined test-history for patterns

---

## Phase 2: Root Cause Identification (BR-002, BR-003)

### Isolation Tests

- [ ] **Run test alone (no other tests)**
  - [ ] Result recorded
  - [ ] If passes alone → likely state leakage or order dependency

- [ ] **Run test in sequence with preceding tests**
  - [ ] Result recorded
  - [ ] Identify which preceding test causes failure

- [ ] **Run test in random order**
  - [ ] Result recorded
  - [ ] If order matters → order dependency confirmed

- [ ] **Run test with stress conditions**
  - [ ] Parallel execution tested
  - [ ] Resource constraints tested

### Root Cause Classification

- [ ] **Root cause category identified**
  - [ ] timing
  - [ ] state_leakage
  - [ ] resource_contention
  - [ ] order_dependency
  - [ ] external_dependency

- [ ] **Specific mechanism documented**
  - [ ] Exact code causing flakiness
  - [ ] How flakiness manifests
  - [ ] Why it's intermittent

- [ ] **Evidence collected**
  - [ ] At least 3 pieces of evidence supporting root cause
  - [ ] Evidence from isolation tests
  - [ ] Evidence from code analysis

### BR-003 Compliance (Root Cause Must Be Identified)

- [ ] Root cause category documented
- [ ] Mechanism documented
- [ ] Affected code identified (file, line range)
- [ ] Evidence documented

---

## Phase 3: Fix Strategy (BR-004)

### Fix vs Retry Decision

- [ ] **If fix is straightforward**
  - [ ] Fix strategy chosen: fix
  - [ ] Fix approach documented
  - [ ] Implementation planned

- [ ] **If fix requires significant work**
  - [ ] Quarantine strategy chosen
  - [ ] Temporary mitigation considered (retry documented as workaround)
  - [ ] Fix owner assigned
  - [ ] Fix due date set

### BR-004 Compliance (Retry Is Not A Fix)

- [ ] Retry NOT used as primary fix
- [ ] If retry used, documented as temporary mitigation
- [ ] Root cause still being investigated
- [ ] Proper fix still planned

### Fix Implementation

- [ ] **Fix changes code (not just config)**
  - [ ] Test code changed (if test issue)
  - [ ] Implementation code changed (if implementation issue)
  - [ ] Both changed (if interaction issue)

- [ ] **Fix type matches root cause**
  - [ ] timing → timeout adjustment or await improvement
  - [ ] state_leakage → cleanup in afterEach (rollback/delete)
  - [ ] resource_contention → resource management improvement
  - [ ] order_dependency → independent setup in beforeEach
  - [ ] external_dependency → mock improvement

---

## Phase 4: Quarantine Handling (BR-005)

### If Quarantine Necessary

- [ ] **Quarantine properly documented**
  - [ ] Quarantine reason documented
  - [ ] Root cause still documented
  - [ ] Fix owner assigned
  - [ ] Fix due date set

- [ ] **Quarantine is temporary**
  - [ ] Not marked as permanent skip
  - [ ] Periodic fix attempts planned
  - [ ] Quarantine suite used (not test.skip in main suite)

### BR-005 Compliance (Flaky Test Quarantine)

- [ ] Quarantine blocks flaky test from CI pass/fail decision
- [ ] Quarantine is documented (not hidden)
- [ ] Quarantine has fix owner
- [ ] Quarantine has timeline

---

## Phase 5: Verification

### Post-Fix Validation

- [ ] **Run test multiple times after fix**
  - [ ] At least 50 runs
  - [ ] All passes (0% failure rate)
  - [ ] Runs in parallel tested
  - [ ] Runs in random order tested

- [ ] **Stability verified**
  - [ ] failure_rate: 0%
  - [ ] No intermittent failures observed
  - [ ] Test passes under stress conditions

- [ ] **Document verification**
  - [ ] post_fix_runs recorded
  - [ ] post_fix_failures recorded
  - [ ] stability_verified: true

### Similar Tests Check

- [ ] Checked similar tests for same issue
- [ ] Applied fix to affected tests if needed
- [ ] Verified all affected tests now stable

---

## Phase 6: Prevention Recommendations

### Document Lessons

- [ ] **Root cause prevention documented**
  - [ ] How this flaky pattern could be prevented
  - [ ] Best practices violated (FIRST principles)
  - [ ] Recommendations for future test design

- [ ] **CI/CD improvements suggested**
  - [ ] Random order testing in CI
  - [ ] Test isolation verification
  - [ ] Flaky rate monitoring

---

## Quick Reference

### BR Compliance Summary

| Business Rule | Checklist Item |
|---------------|----------------|
| **BR-001** | Phase 1: Flaky Behavior Confirmation |
| **BR-002** | Phase 2: Root Cause Identified |
| **BR-003** | Phase 2: Root Cause Category Documented |
| **BR-004** | Phase 3: Retry Not Used as Primary Fix |
| **BR-005** | Phase 4: Quarantine Properly Documented |

### Red Flags (Stop and Fix)

- [ ] Fix only adds retry config
- [ ] Root cause not documented
- [ ] No code changes
- [ ] Test marked as skip/failing without quarantine process
- [ ] No verification runs after fix
- [ ] No evidence of investigation

### Anti-Patterns to Avoid

| Anti-Pattern | Why Wrong |
|-------------|-----------|
| Add retry in config only | BR-004: Retry is not a fix |
| Mark test as skip/failing | BR-002: Flaky tests are critical issues |
| No root cause documentation | BR-003: Root cause must be identified |
| Permanent quarantine | BR-005: Quarantine is temporary |

---

## Usage Notes

1. **Before diagnosis**: Complete Phase 1 (Flaky Behavior Confirmation)
2. **During diagnosis**: Use Phase 2 as guide for isolation tests
3. **After root cause**: Use Phase 3-4 for fix/quarantine strategy
4. **After fix**: Complete Phase 5 (Verification)
5. **Documentation**: Complete Phase 6 (Prevention Recommendations)

This checklist ensures flaky test diagnosis is thorough, root cause is identified, and proper fix (not just retry) is implemented.

---

## References

- `specs/005-tester-core/spec.md` Section 6: Business Rules (BR-001 to BR-005)
- `.opencode/skills/tester/flaky-test-diagnosis/SKILL.md` - Main skill definition
- `.opencode/skills/tester/flaky-test-diagnosis/anti-examples/anti-example-001-retry-without-root-cause.md` - Retry anti-pattern