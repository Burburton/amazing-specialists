# Anti-Example 001: Big-Bang Refactoring Without Tests

## Scenario
Developer refactors a large codebase in one big change without test coverage.

## What Went Wrong

### Developer's Refactor Summary
```yaml
refactor_summary:
  refactoring_goal:
    objective: "Improve code organization"
    scope: "Entire service layer"
    # PROBLEM: Too broad, unclear boundaries
    
  test_coverage:
    before: "15%"
    after: "15%"
    new_tests_added: []
    # PROBLEM: No tests added, low existing coverage
    
  changed_files:
    - path: "src/services/*.ts"
      change_type: modified
      description: "Reorganized all services"
      behavior_preserved: "hopefully"
      # PROBLEM: "hopefully" is not verification
      verification_method: "none"
      # PROBLEM: No verification method
      
  commit_history:
    - commit: "xyz789"
      message: "refactor: reorganize services"
      verification: "Code compiles"
      # PROBLEM: Compilation is not behavior verification
      
  verification_results:
    all_tests_pass: true  # The 15% that exist
    behavior_comparison: null  # PROBLEM: No comparison done
    performance_impact: null   # PROBLEM: Not measured
    
  recommendation: SEND_TO_TEST
  # PROBLEM: Too risky to send to test
```

## Problems Identified

| Problem | Why It's Wrong | Impact |
|---------|----------------|--------|
| No test safety net | 15% coverage insufficient | High risk of hidden bugs |
| Big-bang approach | Too many changes at once | Hard to isolate problems |
| "Hopefully" preserved | Not verifiable | False confidence |
| Compilation only | Does not verify behavior | Behavior may be broken |
| No verification plan | No way to confirm correctness | QA will find issues |

## What Actually Happened

After this refactoring:
1. QA found 12 new bugs in the first hour
2. Production incident from subtle behavior change
3. Rollback required
4. Lost 3 days of work
5. Trust in refactoring process damaged

## Root Cause Analysis

```
Lack of Test Coverage
        ↓
Big-Bang Refactor Decision
        ↓
No Incremental Verification
        ↓
Hidden Behavior Changes
        ↓
Production Issues
```

## Correct Approach

```yaml
# Step 1: Assess test coverage first
test_coverage_assessment:
  current: "15%"
  minimum_required: "70%"
  action: "Add tests before refactoring OR reduce refactoring scope"
  
# Step 2: If must refactor with low coverage
small_scope_refactor:
  approach: "Refactor one service at a time"
  verification:
    - "Add integration tests for that service"
    - "Manual testing with clear test cases"
    - "Compare before/after behavior"
    
# Step 3: Incremental approach
steps:
  - "Add tests for UserService"
  - "Refactor UserService only"
  - "Verify UserService behavior"
  - "Commit verified changes"
  - "Repeat for next service"
```

## Prevention Checklist

Before refactoring:
- [ ] Is test coverage sufficient (>70%)?
- [ ] If not, can tests be added?
- [ ] Is refactoring scope small enough?
- [ ] Is there a verification plan?
- [ ] Can changes be rolled back?

If any answer is "No":
- **Stop** and reassess
- Consider smaller scope
- Or add tests first

## Alternative: Safe Refactoring with Low Coverage

When test coverage is low and refactoring is necessary:

```yaml
low_coverage_refactor:
  risk_mitigation:
    - "Reduce scope to minimum necessary"
    - "Add critical path tests first"
    - "Use feature flags for gradual rollout"
    - "Prepare rollback plan"
    - "Manual testing checklist"
    
  documentation:
    - "Document expected behavior before changes"
    - "Document actual changes made"
    - "Document verification performed"
    - "Document known risks"
```

## How to Detect This Anti-Pattern

In code review:
1. PR too large (>500 lines changed)?
2. Tests not added or updated?
3. "behavior_preserved" not verified?
4. Commit history unclear?

If any "Yes" - request smaller, verified changes.