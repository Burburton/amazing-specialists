# Example 002: Self-Check with Blockers

## Scenario
Developer runs self-check and finds blockers that must be fixed.

## Self-Check Report
```yaml
self_check_report:
  dispatch_id: "dispatch-auth-002"
  task_id: "T-AUTH-002"
  timestamp: "2026-03-24T15:30:00Z"
  
  summary:
    total_checks: 28
    passed: 25
    failed: 3
    blockers: 2
    warnings: 1
    skipped: 0
  
  check_results:
    - category: "Security"
      checks:
        - item: "No sensitive data leak"
          status: fail
          severity: blocker
          description: "API key hardcoded in source"
          evidence: "src/config/api.ts:12"
          fix_required: true
        - item: "Input validation present"
          status: fail
          severity: blocker
          description: "User input not validated"
          evidence: "src/controllers/UserController.ts:45"
          fix_required: true
    
    - category: "Code Quality"
      checks:
        - item: "No dead code"
          status: fail
          severity: warning
          description: "Unused function getUserOld"
          evidence: "src/services/UserService.ts:78"
          fix_required: false
  
  blockers:
    - blocker_id: "BLOCKER-001"
      category: "Security"
      description: "API key hardcoded in src/config/api.ts:12"
      location: "src/config/api.ts:12"
      fix_suggestion: "Move API key to environment variable"
      fixed: false
      fix_description: null
    
    - blocker_id: "BLOCKER-002"
      category: "Security"
      description: "Missing input validation in UserController"
      location: "src/controllers/UserController.ts:45"
      fix_suggestion: "Add Joi validation for email and password"
      fixed: false
      fix_description: null
  
  warnings:
    - warning_id: "WARN-001"
      category: "Code Quality"
      description: "Unused function getUserOld"
      recommendation: "Remove or document purpose"
  
  overall_status: FAIL_WITH_BLOCKERS
  recommendation: FIX_BLOCKERS
  notes: "Security blockers must be fixed before handoff"
```

## After Fixing Blockers
```yaml
self_check_report:
  summary:
    total_checks: 28
    passed: 28
    failed: 0
    blockers: 0
    warnings: 1
  
  blockers:
    - blocker_id: "BLOCKER-001"
      category: "Security"
      description: "API key hardcoded"
      fixed: true
      fix_description: "Moved to process.env.API_KEY"
    
    - blocker_id: "BLOCKER-002"
      category: "Security"
      description: "Missing input validation"
      fixed: true
      fix_description: "Added Joi validation schema"
  
  overall_status: PASS_WITH_WARNINGS
  recommendation: PROCEED
  notes: "Blockers fixed, warning acceptable for this iteration"
```

## Key Patterns Demonstrated

1. **Honest Finding**: Blockers identified, not hidden
2. **Specific Evidence**: Exact file:line provided
3. **Fix Suggestions**: How to fix each blocker
4. **Re-check After Fix**: Verified fixes before proceeding