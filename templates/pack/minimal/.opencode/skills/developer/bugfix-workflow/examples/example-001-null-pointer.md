# Example 001: Null Pointer Bugfix

## Scenario
Fix a null pointer exception in user service.

## Bug Report
```
Issue: Null pointer when fetching user profile
Severity: High
Symptom: 500 error when accessing /api/users/:id
Expected: 404 when user not found
Actual: 500 Internal Server Error
```

## Bugfix Report
```yaml
bugfix_report:
  dispatch_id: "dispatch-fix-001"
  task_id: "T-FIX-001"
  bug_id: "BUG-2026-001"
  
  problem_analysis:
    symptom: "500 error when accessing non-existent user profile"
    expected_behavior: "Should return 404 Not Found"
    actual_behavior: "Returns 500 Internal Server Error"
    environment: "Production v2.3.1"
    frequency: "always"
  
  root_cause:
    category: "logic_error"
    description: |
      5 Whys Analysis:
      1. Why 500 error? - Null pointer exception in UserService
      2. Why null pointer? - getUserById returns null for non-existent user
      3. Why not handled? - No null check before accessing user.name
      4. Why no null check? - Assumed user always exists
      5. Why assumed? - Missing validation in controller
      Root Cause: Missing null check after database lookup
    analysis_method: "5 Whys"
    contributing_factors:
      - factor: "No unit test for non-existent user"
        impact: "Bug not caught before production"
  
  impact_assessment:
    severity: "high"
    affected_components: ["UserService", "UserController"]
    affected_users: "All users accessing profiles"
    data_corruption: false
    security_implications: false
  
  fix_details:
    approach: "Add null check after lookup, return 404 if not found"
    changed_files:
      - path: "src/controllers/UserController.ts"
        change_type: modified
        description: "Added null check with 404 response"
        lines_changed:
          added: 5
          deleted: 1
    tests_added:
      - path: "tests/unit/UserController.test.ts"
        type: reproduction
        description: "Test for non-existent user returns 404"
    is_minimal_fix: true
  
  verification:
    reproduction_test_passed: true
    regression_test_passed: true
    manual_verification_passed: true
    verification_notes: "Tested with non-existent user ID"
  
  lessons_learned:
    - lesson: "Database lookups can return null"
      prevention: "Always handle null case after lookup"
      category: "code"
    - lesson: "Missing test coverage for error paths"
      prevention: "Add tests for error scenarios"
      category: "test"
  
  recommendation: "CLOSE"
  time_to_fix_minutes: 30
  time_to_identify_minutes: 15
```

## Key Patterns Demonstrated

1. **Root Cause Analysis**: Uses 5 Whys method
2. **Minimal Fix**: Only 5 lines changed
3. **Reproduction Test**: Test added before fix verified
4. **Lessons Learned**: Prevention strategies documented