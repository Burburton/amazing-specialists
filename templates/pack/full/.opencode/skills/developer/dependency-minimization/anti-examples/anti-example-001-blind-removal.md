# Anti-Example 001: Blind Dependency Removal

## Scenario
Developer removes dependencies without proper analysis, breaking the application.

## What Went Wrong

### Developer's Dependency Optimization
```yaml
dependency_optimization_summary:
  dispatch_id: "dispatch-deps-001"
  task_id: "T-DEPS-001"
  
  analysis:
    dependency_count:
      before: 42
      after: 30
    # PROBLEM: No analysis output shown
      
  optimizations:
    removed:
      - name: "underscore"
        reason: "Similar to lodash"
        # PROBLEM: Both lodash and underscore used in different parts
        
      - name: "core-js"
        reason: "Browser compatibility not needed"
        # PROBLEM: Used for polyfills in older browsers
        
      - name: "prop-types"
        reason: "TypeScript replaces this"
        # PROBLEM: Still used in runtime checks
        
  verification:
    build_status: pass  # PROBLEM: Build passed but tests failed
    test_status: pass   # PROBLEM: Claimed pass but actually failed
    bundle_size_before: "2.1 MB"
    bundle_size_after: "1.4 MB"
    
  recommendation: SEND_TO_TEST
  # PROBLEM: Should be ROLLBACK
```

## Problems Identified

| Problem | Why It's Wrong | Impact |
|---------|----------------|--------|
| No depcheck run | Removed without analysis | Removed needed dependencies |
| underscore removal | Both lodash and underscore in use | Import errors in code |
| core-js removal | Polyfills still needed | IE11 support broken |
| prop-types removal | Runtime checks still used | PropTypes warnings in console |
| False verification | Tests actually failed | Production issues |

## What Actually Happened

After this "optimization":
1. Build succeeded (TypeScript compile)
2. Tests failed (runtime errors)
3. Developer ignored test failures
4. Deployed to production
5. IE11 users saw errors
6. PropTypes warnings in console
7. Emergency rollback required

## Root Cause Analysis

```
No Analysis Tool Used
        ↓
Manual Guess at Unused Dependencies
        ↓
Removed Needed Dependencies
        ↓
Tests Failed (ignored)
        ↓
Production Issues
```

## Correct Approach

```yaml
# Step 1: Run analysis tool first
analysis:
  command: "depcheck"
  output:
    unused: ["left-pad", "moment"]  # Only actually unused
    used: ["underscore", "core-js", "prop-types"]  # Do NOT remove
    
# Step 2: Verify each removal
removal_process:
  underscore:
    analysis: "grep imports found in 3 files"
    decision: "KEEP - still used"
    
  core-js:
    analysis: "Polyfills required for IE11 support (still in browser targets)"
    decision: "KEEP - required for compatibility"
    
  prop-types:
    analysis: "Runtime prop validation still active"
    decision: "KEEP - or plan proper TypeScript migration first"
    
# Step 3: Only remove truly unused
safe_removals:
  - "left-pad" (no imports found)
  - "moment" (migrated to date-fns)
```

## Prevention Checklist

Before removing any dependency:
- [ ] Run depcheck to identify truly unused
- [ ] Verify no imports in code (grep search)
- [ ] Check if dependency provides unique functionality
- [ ] Check if dependency is required for compatibility
- [ ] Run tests after removal
- [ ] If tests fail, investigate before proceeding

## Warning Signs

Stop immediately if:
- [ ] depcheck shows the dependency IS used
- [ ] Imports found in code search
- [ ] Tests fail after removal
- [ ] Build warnings appear
- [ ] Dependency is a polyfill or compatibility layer

## How to Detect This Anti-Pattern

In code review:
1. No analysis tool output shown?
2. Removed dependencies that sound "similar"?
3. No grep/import verification mentioned?
4. Tests failed but summary says pass?
5. Compatibility dependencies removed?

If any "Yes" - request proper analysis and verification.

## Alternative: Proper Analysis Before Removal

```yaml
proper_analysis:
  step_1_depcheck:
    command: "npx depcheck"
    interpretation: "Only remove what depcheck flags as unused"
    
  step_2_grep_verify:
    command: "grep -r 'from \"dep-name\"' src/"
    interpretation: "If imports found, keep the dependency"
    
  step_3_check_similarity:
    duplicates: "If two packages do same thing, choose one"
    method: "Check all imports, migrate to chosen package, remove other"
    
  step_4_verify_removal:
    test_command: "npm test"
    interpretation: "If ANY test fails, rollback and investigate"
```