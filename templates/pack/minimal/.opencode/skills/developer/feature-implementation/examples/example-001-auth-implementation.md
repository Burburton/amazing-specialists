# Example 001: Authentication Feature Implementation

## Scenario
Implement user authentication with JWT tokens based on design-note.

## Task Description
```
Goal: Implement user authentication with JWT token generation and validation
Design: specs/auth/design-note.md
Constraints:
  - Do not modify database schema
  - Use existing user service
  - Token must expire in 24 hours
```

## Implementation

### Step 1: Read Design Note
```yaml
design_note_reference: specs/auth/design-note.md
key_sections:
  - feature_goal: "Enable secure user authentication with stateless tokens"
  - module_boundaries: "AuthService in src/services/, AuthController in src/controllers/"
  - constraints: "JWT secret from env, 24h expiry, bcrypt for passwords"
```

### Step 2: Implementation Summary Output
```yaml
implementation_summary:
  dispatch_id: "dispatch-auth-001"
  task_id: "T-AUTH-001"
  
  goal_alignment:
    goal: "Implement user authentication with JWT token generation and validation"
    achieved: true
    deviations: []
  
  implementation:
    approach: "Three-layer architecture with separate auth service"
    key_decisions:
      - decision: "Use jsonwebtoken library for JWT handling"
        reason: "Well-maintained, widely adopted, supports RS256"
        alternatives_considered: ["jose", "custom implementation"]
      - decision: "Store token expiry in token payload"
        reason: "Stateless verification without database lookup"
  
  changed_files:
    - path: "src/services/AuthService.ts"
      change_type: added
      description: "Core authentication service with JWT generation"
      lines_changed:
        added: 120
        deleted: 0
    - path: "src/controllers/AuthController.ts"
      change_type: added
      description: "HTTP endpoints for login/logout"
      lines_changed:
        added: 85
        deleted: 0
    - path: "src/middleware/AuthMiddleware.ts"
      change_type: added
      description: "JWT validation middleware"
      lines_changed:
        added: 45
        deleted: 0
  
  dependencies_added:
    - name: "jsonwebtoken"
      version: "^9.0.0"
      reason: "JWT token generation and validation"
      is_dev_dependency: false
    - name: "@types/jsonwebtoken"
      version: "^9.0.0"
      reason: "TypeScript type definitions"
      is_dev_dependency: true
  
  tests:
    - type: unit
      files:
        - "tests/unit/AuthService.test.ts"
        - "tests/unit/AuthMiddleware.test.ts"
      coverage: "92%"
      status: pass
    - type: integration
      files:
        - "tests/integration/auth-flow.test.ts"
      coverage: "85%"
      status: pass
  
  self_check:
    report_path: "./self-check-report.md"
    overall_status: PASS
    blockers_count: 0
    warnings_count: 1
  
  known_issues: []
  
  risks:
    - risk_id: "RISK-001"
      description: "JWT secret rotation not implemented"
      level: low
      mitigation: "Will be addressed in security review"
      owner: security
  
  recommendation: SEND_TO_TEST
  time_spent_minutes: 240
  blockers_encountered: []
```

### Key Patterns Demonstrated

1. **Design Reference**: Explicitly references design-note
2. **Goal Alignment**: Clear statement of achievement
3. **Change Documentation**: All files listed with descriptions
4. **Dependency Justification**: Each dependency has reason
5. **Test Coverage**: Both unit and integration tests
6. **Risk Transparency**: Known risks documented
7. **Honest Assessment**: Warnings acknowledged

### What Makes This a Good Example

- Follows design-note structure
- No scope creep
- Complete change documentation
- Self-check performed
- Ready for tester consumption