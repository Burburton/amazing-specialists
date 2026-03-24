# Example 001: Feature Self-Check

## Scenario
Developer completes feature implementation and runs self-check.

## Implementation Context
```
Task: Implement user authentication with JWT
Changed Files: 3 new files
New Dependencies: 2 packages
Tests: Unit and integration tests added
```

## Self-Check Report
```yaml
self_check_report:
  dispatch_id: "dispatch-auth-001"
  task_id: "T-AUTH-001"
  timestamp: "2026-03-24T14:00:00Z"
  created_by: "developer"
  
  summary:
    total_checks: 28
    passed: 28
    failed: 0
    blockers: 0
    warnings: 0
    skipped: 2
  
  check_results:
    - category: "Goal Alignment"
      checks:
        - item: "Implementation matches task goal"
          status: pass
          severity: blocker
          description: "JWT authentication implemented as specified"
          evidence: "See implementation-summary goal_alignment"
          fix_required: false
        - item: "Acceptance criteria met"
          status: pass
          severity: blocker
          description: "All 4 acceptance criteria verified"
          fix_required: false
        - item: "No omitted key features"
          status: pass
          severity: blocker
          description: "Token generation and validation both implemented"
          fix_required: false
        - item: "No out-of-scope changes"
          status: pass
          severity: blocker
          description: "Only auth-related files changed"
          fix_required: false
    
    - category: "Design Consistency"
      checks:
        - item: "Matches design note"
          status: pass
          severity: blocker
          description: "Three-layer architecture per design"
          fix_required: false
        - item: "Respects module boundaries"
          status: pass
          severity: blocker
          description: "AuthService, AuthController in specified locations"
          fix_required: false
        - item: "Honors interface contracts"
          status: pass
          severity: blocker
          description: "API endpoints match design specification"
          fix_required: false
        - item: "Deviations documented"
          status: na
          severity: warning
          description: "No deviations from design"
          fix_required: false
    
    - category: "Scope Control"
      checks:
        - item: "Minimal change scope"
          status: pass
          severity: warning
          description: "Only 3 files, 250 lines total"
          fix_required: false
        - item: "No unrelated file changes"
          status: pass
          severity: blocker
          description: "All changes directly related to auth"
          fix_required: false
    
    - category: "Constraint Compliance"
      checks:
        - item: "Technical constraints met"
          status: pass
          severity: blocker
          description: "No schema changes, used existing UserService"
          fix_required: false
        - item: "Security constraints met"
          status: pass
          severity: blocker
          description: "JWT secret from environment, bcrypt used"
          fix_required: false
    
    - category: "Code Quality"
      checks:
        - item: "Code is understandable"
          status: pass
          severity: warning
          description: "Clear naming, good structure"
          fix_required: false
        - item: "No obvious logic errors"
          status: pass
          severity: blocker
          description: "Code review found no issues"
          fix_required: false
        - item: "Exceptions handled"
          status: pass
          severity: blocker
          description: "All error paths have try/catch"
          fix_required: false
    
    - category: "Test Coverage"
      checks:
        - item: "New code has tests"
          status: pass
          severity: blocker
          description: "Unit and integration tests added"
          fix_required: false
        - item: "Tests pass"
          status: pass
          severity: blocker
          description: "All 15 tests passing"
          fix_required: false
        - item: "Coverage acceptable"
          status: pass
          severity: warning
          description: "92% coverage on new code"
          fix_required: false
    
    - category: "Dependency Management"
      checks:
        - item: "New dependencies approved"
          status: pass
          severity: blocker
          description: "jsonwebtoken approved in design"
          fix_required: false
        - item: "Versions reasonable"
          status: pass
          severity: warning
          description: "Using latest stable versions"
          fix_required: false
    
    - category: "Documentation"
      checks:
        - item: "Code comments updated"
          status: pass
          severity: warning
          description: "JSDoc added to public methods"
          fix_required: false
        - item: "Complex logic documented"
          status: pass
          severity: warning
          description: "Token validation flow explained"
          fix_required: false
    
    - category: "Security"
      checks:
        - item: "Input validation present"
          status: pass
          severity: blocker
          description: "Email/password validated before use"
          fix_required: false
        - item: "No sensitive data leak"
          status: pass
          severity: blocker
          description: "Passwords hashed, tokens don't contain secrets"
          fix_required: false
        - item: "No injection risks"
          status: pass
          severity: blocker
          description: "No SQL or command injection vectors"
          fix_required: false
    
    - category: "Performance"
      checks:
        - item: "No obvious performance issues"
          status: pass
          severity: warning
          description: "Token generation ~2ms"
          fix_required: false
      status: na
      checks:
        - item: "N+1 queries"
          status: na
          severity: warning
          description: "No database queries in hot path"
          fix_required: false
  
  blockers: []
  warnings: []
  
  overall_status: PASS
  recommendation: PROCEED
  
  time_spent_minutes: 20
  automated_checks_count: 18
  manual_checks_count: 10
```

## Key Patterns Demonstrated

1. **Complete Coverage**: All 10 categories checked
2. **Evidence Provided**: Each check has description
3. **Honest Assessment**: N/A items marked properly
4. **Clean Result**: PASS with no blockers