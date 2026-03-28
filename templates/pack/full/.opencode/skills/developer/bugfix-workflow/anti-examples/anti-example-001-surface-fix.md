# Anti-Example 001: Surface Bugfix

## Scenario
Developer fixes null pointer symptom without finding root cause.

## Bug Report
```
Issue: Null pointer in checkout
Severity: Medium
Symptom: 500 error during checkout
```

## What Went Wrong

### Developer's Bugfix Report
```yaml
bugfix_report:
  problem_analysis:
    symptom: "Null pointer in checkout"
    expected_behavior: "No error"
    actual_behavior: "500 error"
  
  root_cause:
    category: "logic_error"
    description: "Variable was null"
    # PROBLEM: Just describes symptom, not WHY it was null
  
  fix_details:
    approach: "Added null checks"
    changed_files:
      - path: "src/services/CheckoutService.ts"
        lines_changed:
          added: 50
          deleted: 5
        # PROBLEM: Added null checks everywhere instead of fixing root cause
    is_minimal_fix: false
    # PROBLEM: Large fix for a single bug
  
  lessons_learned: []
  # PROBLEM: No lessons documented
  
  recommendation: "CLOSE"
```

## Problems Identified

| Problem | Evidence | Impact |
|---------|----------|--------|
| Shallow root cause | "Variable was null" | May recur elsewhere |
| Large fix | 50 lines for null check | Unnecessary complexity |
| No lessons learned | Empty array | Knowledge not captured |
| Multiple null checks | Defensive everywhere | Hides real issue |

## Why This Is Dangerous

1. **Bug may recur**: Same null issue in other code paths
2. **Code bloat**: Unnecessary null checks everywhere
3. **Knowledge lost**: Future developers don't learn
4. **False confidence**: "Fixed" but root cause remains

## Correct Approach

```yaml
root_cause:
  description: |
    5 Whys:
    1. Null pointer in checkout
    2. Why? cart.items is undefined
    3. Why? Cart not loaded before checkout
    4. Why? Race condition between cart load and checkout
    5. Why? Missing await in cart initialization
    Root Cause: Missing async/await in cart loading

fix_details:
  approach: "Add await to cart loading"
  lines_changed:
    added: 1
    deleted: 1
  is_minimal_fix: true

lessons_learned:
  - lesson: "Async operations need await"
    prevention: "Use linter rule for floating promises"
```

## How to Detect

### In Bugfix Report
- Root cause doesn't use analysis method?
- Root cause describes symptom, not cause?
- Fix is large for simple bug?
- No lessons learned?

### In Code Review
- Many null checks added?
- Fix doesn't address why null occurred?
- Similar patterns elsewhere not fixed?

## Prevention

1. **Always use analysis method** (5 Whys, Fishbone)
2. **Find WHY, not WHAT**
3. **Keep fixes minimal**
4. **Document lessons learned**