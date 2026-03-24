# Bugfix Workflow Checklist

## Phase 1: Understand

### Problem Collection
- [ ] Symptom described
- [ ] Expected vs actual behavior
- [ ] Environment information
- [ ] Reproduction steps
- [ ] Frequency (always/often/rarely)
- [ ] Error logs/stack traces

### Impact Assessment
- [ ] Severity evaluated
- [ ] Affected components identified
- [ ] Affected users estimated
- [ ] Data corruption check
- [ ] Security implications check

---

## Phase 2: Diagnose

### Root Cause Analysis
- [ ] Analysis method chosen (5 Whys, Fishbone, etc.)
- [ ] Analysis documented
- [ ] Root cause identified (not just symptom)
- [ ] Contributing factors listed

### Problem Classification
- [ ] Category assigned:
  - [ ] logic_error
  - [ ] boundary_condition
  - [ ] concurrency
  - [ ] configuration
  - [ ] dependency
  - [ ] environment
  - [ ] data
  - [ ] design

---

## Phase 3: Plan Fix

### Fix Strategy
- [ ] Minimal fix approach defined
- [ ] Affected files identified
- [ ] Test strategy defined
- [ ] Rollback plan documented

### Scope Control
- [ ] Only fix the bug
- [ ] No unrelated changes
- [ ] No refactoring
- [ ] No "improvements"

---

## Phase 4: Implement

### Test First
- [ ] Reproduction test written
- [ ] Test fails (confirms bug)
- [ ] Edge cases covered

### Fix Implementation
- [ ] Minimal code changes
- [ ] Code comments added if needed
- [ ] No scope creep

### Verify Fix
- [ ] Reproduction test passes
- [ ] Regression tests pass
- [ ] Manual verification done

---

## Phase 5: Document

### Bugfix Report
- [ ] problem_analysis complete
- [ ] root_cause with analysis method
- [ ] impact_assessment complete
- [ ] fix_details with minimal changes
- [ ] verification results
- [ ] lessons_learned documented

### Lessons Learned
- [ ] What was learned
- [ ] How to prevent
- [ ] Category (code/test/process/review)

---

## Output Requirements

### bugfix-report Must Have
- [ ] dispatch_id and task_id
- [ ] bug_id
- [ ] problem_analysis (symptom, expected, actual)
- [ ] root_cause (category, description, method)
- [ ] impact_assessment
- [ ] fix_details (approach, changed_files, tests)
- [ ] verification (reproduction, regression, manual)
- [ ] lessons_learned
- [ ] recommendation

### If Data Corruption
- [ ] Data recovery steps
- [ ] Prevention mechanisms

### If Security Implications
- [ ] Security review requested
- [ ] CVE considered

---

## Anti-Patterns to Avoid

- [ ] Fixing symptom, not root cause
- [ ] Large fixes with refactoring
- [ ] No reproduction test
- [ ] No regression testing
- [ ] Skipping lessons learned
- [ ] False "minimal fix" claim