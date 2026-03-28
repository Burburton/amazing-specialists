# Example 001: Auth Service Test Design

## Scenario Context

**Developer Output Consumed:**
```yaml
implementation-summary:
  goal_alignment:
    goal: "Implement JWT authentication with token generation and validation"
    achieved: true
    deviations: []
  
  changed_files:
    - path: "src/services/AuthService.ts"
      change_type: "added"
      description: "Core authentication service with JWT"
      lines_changed: { added: 120, deleted: 0 }
    - path: "src/errors/AuthError.ts"
      change_type: "added"
      description: "Custom error classes for auth"
      lines_changed: { added: 25, deleted: 0 }
  
  risks:
    - risk_id: "RISK-001"
      description: "JWT secret must not be hardcoded"
      level: "high"
      mitigation: "Loaded from environment variable"
  
  known_issues:
    - issue_id: "ISSUE-001"
      description: "Token expiry set to 24h, may need adjustment"
      severity: "low"
  
  self-check-report:
    overall_status: "PASS"
    checks_performed: 15
    all_passed: true
```

## Test Design (Independent Verification per BR-002)

### BR-002 Compliance Note
> Developer self-check claims 15/15 checks passed. This test design **independently verifies** all claims with explicit evidence collection. Self-check is acknowledged but not used as evidence.

### Test Suite Structure

```yaml
test_suite:
  name: "AuthService Unit Tests"
  target: "src/services/AuthService.ts"
  
  test_cases:
    # Happy Path - Independent Verification
    - id: "UT-AUTH-001"
      name: "generateToken returns valid JWT with valid credentials"
      category: "happy_path"
      
      scenario:
        given: "User exists with valid password hash"
        when: "generateToken(username='john', password='correct123') is called"
        then: "Returns valid JWT token with correct payload"
      
      input:
        username: "john"
        password: "correct123"
      
      expected:
        output: "JWT token string (3 parts separated by dots)"
        token_payload:
          sub: "user-id-123"
          username: "john"
          iat: "<current timestamp>"
          exp: "<current + 86400>"
        error: null
      
      mocks:
        - dependency: "UserRepository.findByUsername"
          return_value:
            id: "user-123"
            username: "john"
            passwordHash: "$2b$10$..."
        
        - dependency: "PasswordHasher.verify"
          return_value: true
        
        - dependency: "JwtService.sign"
          return_value: "mocked.jwt.token"
      
      assertions:
        - "Token is returned (not null)"
        - "Token has 3 parts separated by dots"
        - "Token payload contains correct user ID"
        - "Token payload contains correct username"
        - "Token expiry is set to 24h from issuance"
      
      br_002_independent_verification:
        self_check_claim: "Token generation works"
        tester_verification: "Decode token payload and assert fields match expected values"
        evidence_type: "Assertion results + decoded payload"
    
    # Error Path - Independent Verification
    - id: "UT-AUTH-002"
      name: "generateToken throws InvalidCredentialsError with wrong password"
      category: "error_path"
      
      scenario:
        given: "User exists but password is incorrect"
        when: "generateToken(username='john', password='wrong') is called"
        then: "Throws InvalidCredentialsError"
      
      input:
        username: "john"
        password: "wrong"
      
      expected:
        output: null
        error: "InvalidCredentialsError"
        error_message: "Invalid credentials"
      
      mocks:
        - dependency: "UserRepository.findByUsername"
          return_value:
            id: "user-123"
            username: "john"
            passwordHash: "$2b$10$..."
        
        - dependency: "PasswordHasher.verify"
          return_value: false
      
      assertions:
        - "InvalidCredentialsError is thrown"
        - "Error message matches expected"
        - "No token is generated"
      
      br_002_independent_verification:
        self_check_claim: "Invalid password is rejected"
        tester_verification: "Assert error type and message, verify no token generated"
        evidence_type: "Exception caught + error properties"
    
    # Boundary - Empty Input (BR-005 Compliance)
    - id: "UT-AUTH-003"
      name: "generateToken throws ValidationError with empty username"
      category: "boundary"
      
      scenario:
        given: "Username is empty string"
        when: "generateToken(username='', password='any') is called"
        then: "Throws ValidationError before any DB lookup"
      
      input:
        username: ""
        password: "anyPassword"
      
      expected:
        output: null
        error: "ValidationError"
        error_message: "Username is required"
      
      assertions:
        - "ValidationError is thrown"
        - "UserRepository.findByUsername is NOT called (input validation first)"
      
      br_005_edge_case:
        boundary_type: "empty_string"
        parameter: "username"
        risk: "Missing validation allows empty credentials"
    
    # Risk-Based Testing (High Risk Area)
    - id: "UT-AUTH-004"
      name: "JWT secret is loaded from environment, not hardcoded"
      category: "security"
      
      scenario:
        given: "JWT_SECRET environment variable is set"
        when: "AuthService is initialized"
        then: "Service uses env variable, not hardcoded secret"
      
      input:
        env.JWT_SECRET: "test-secret-key-12345"
      
      expected:
        output: "Service initializes successfully"
        secret_source: "process.env.JWT_SECRET"
      
      assertions:
        - "AuthService constructor reads JWT_SECRET from env"
        - "No hardcoded secret string in code"
        - "Secret is not logged anywhere"
      
      br_001_risk_prioritized:
        risk_id: "RISK-001"
        risk_level: "high"
        test_rationale: "Hardcoded secrets are critical security vulnerability"
    
    # Known Issue Handling (BR-001 Compliance)
    - id: "UT-AUTH-005"
      name: "Token expiry is configurable (24h default)"
      category: "configuration"
      
      scenario:
        given: "Token expiry setting is at default"
        when: "Token is generated"
        then: "Expiry is set to 24 hours from issuance"
      
      input:
        username: "john"
        password: "correct123"
        config.token_expiry_seconds: 86400
      
      expected:
        token_payload.exp: "iat + 86400"
      
      assertions:
        - "exp - iat equals 86400 seconds"
        - "Expiry is configurable via config parameter"
      
      br_001_known_issue_acknowledged:
        issue_id: "ISSUE-001"
        test_action: "Verify 24h is default, verify configurability"
        note: "Issue is about 24h being too long, not a bug - expected behavior"
```

## Coverage Summary

```yaml
coverage_summary:
  total_test_cases: 5
  by_category:
    happy_path: 1
    error_path: 1
    boundary: 1
    security: 1
    configuration: 1
  
  br_compliance:
    br_001_upstream_consumed: true
    br_002_independent_verification: true
    br_003_coverage_boundaries: "Documented above"
    br_004_failure_classification_ready: true
    br_005_edge_cases_included: true
  
  test_files:
    - "tests/unit/AuthService.test.ts"
  
  mocks_required:
    - "UserRepository"
    - "PasswordHasher"
    - "JwtService"
    - "ConfigService"
```

## Test Execution Plan

```yaml
execution_plan:
  order:
    1: "UT-AUTH-003 (boundary - fails fast if validation broken)"
    2: "UT-AUTH-001 (happy path - core functionality)"
    3: "UT-AUTH-002 (error path - error handling)"
    4: "UT-AUTH-004 (security - high risk)"
    5: "UT-AUTH-005 (configuration - secondary)"
  
  estimated_time_ms: 500
  isolation_level: "Unit (all external dependencies mocked)"
```

## Key Decisions Notes

1. **Independent Verification (BR-002)**: Every test case includes explicit `br_002_independent_verification` section showing how tester independently verifies claims, not relying on self-check.

2. **Risk Prioritization (BR-001)**: High-risk area (JWT secret handling) gets dedicated test case even though developer self-check claimed it passed.

3. **Known Issue Handling (BR-001)**: ISSUE-001 is acknowledged and tested as expected behavior, not reported as a bug.

4. **Edge Cases (BR-005)**: Empty username boundary is tested even though it's a simple validation - happy-path-only is insufficient.
