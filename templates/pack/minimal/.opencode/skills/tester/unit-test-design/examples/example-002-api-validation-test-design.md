# Example 002: API Validation Test Design

## Scenario Context

**Developer Output Consumed:**
```yaml
implementation-summary:
  goal_alignment:
    goal: "Implement request validation middleware for API endpoints"
    achieved: true
    deviations: []
  
  changed_files:
    - path: "src/middleware/validationMiddleware.ts"
      change_type: "added"
      description: "Request validation middleware"
      lines_changed: { added: 85, deleted: 0 }
    - path: "src/validators/userValidator.ts"
      change_type: "added"
      description: "User input validation rules"
      lines_changed: { added: 45, deleted: 0 }
  
  risks:
    - risk_id: "RISK-001"
      description: "Validation bypass if middleware order is wrong"
      level: "high"
      mitigation: "Middleware order enforced in router config"
  
  known_issues: []
  
  self-check-report:
    overall_status: "PASS"
    checks_performed: 12
    all_passed: true
```

## Test Design (Independent Verification per BR-002)

### BR-002 Compliance Note
> Developer self-check claims 12/12 checks passed. This test design **independently verifies** all validation rules with explicit test cases. Self-check is acknowledged but each validation rule is independently tested.

### Test Suite Structure

```yaml
test_suite:
  name: "Validation Middleware Unit Tests"
  target: "src/middleware/validationMiddleware.ts"
  
  test_cases:
    # Happy Path - Valid Request
    - id: "UT-VAL-001"
      name: "valid request passes through middleware"
      category: "happy_path"
      
      scenario:
        given: "Request body passes all validation rules"
        when: "validationMiddleware processes the request"
        then: "Request proceeds to next handler without error"
      
      input:
        method: "POST"
        path: "/api/users"
        body:
          username: "john.doe"
          email: "john@example.com"
          age: 25
      
      expected:
        next_called: true
        response_status: null
        error: null
      
      mocks:
        - dependency: "next"
          return_value: "mocked next function"
      
      assertions:
        - "next() is called exactly once"
        - "No response is sent by middleware"
        - "req.validationErrors is empty or undefined"
      
      br_002_independent_verification:
        self_check_claim: "Valid requests pass validation"
        tester_verification: "Call middleware with valid data, assert next() called, no error response"
        evidence_type: "Mock call count + response status"
    
    # Error Path - Invalid Email
    - id: "UT-VAL-002"
      name: "invalid email format returns 400 Bad Request"
      category: "error_path"
      
      scenario:
        given: "Request body contains invalid email format"
        when: "validationMiddleware processes the request"
        then: "Returns 400 with validation error message"
      
      input:
        method: "POST"
        path: "/api/users"
        body:
          username: "john.doe"
          email: "not-an-email"
          age: 25
      
      expected:
        next_called: false
        response_status: 400
        response_body:
          error: "Validation Error"
          details:
            - field: "email"
              message: "Invalid email format"
      
      assertions:
        - "next() is NOT called"
        - "Response status is 400"
        - "Error details include email field"
        - "Error message is descriptive"
      
      br_002_independent_verification:
        self_check_claim: "Invalid emails are rejected"
        tester_verification: "Call middleware with invalid email, assert 400 response with correct error"
        evidence_type: "Response status + error payload"
    
    # Boundary - String Length (BR-005 Compliance)
    - id: "UT-VAL-003"
      name: "username at max length (50 chars) is accepted"
      category: "boundary"
      
      scenario:
        given: "Username is exactly 50 characters (max allowed)"
        when: "validationMiddleware processes the request"
        then: "Request passes validation"
      
      input:
        username: "a" * 50  # 50 'a' characters
        email: "test@example.com"
      
      expected:
        next_called: true
        response_status: null
      
      assertions:
        - "50-character username passes validation"
        - "next() is called"
      
      br_005_edge_case:
        boundary_type: "max_length"
        parameter: "username"
        constraint: "3-50 characters"
        rationale: "Boundary at maximum must be verified"
    
    # Boundary - String Length + 1
    - id: "UT-VAL-004"
      name: "username at max length + 1 (51 chars) is rejected"
      category: "boundary"
      
      scenario:
        given: "Username is 51 characters (exceeds max by 1)"
        when: "validationMiddleware processes the request"
        then: "Returns 400 with length validation error"
      
      input:
        username: "a" * 51  # 51 'a' characters
        email: "test@example.com"
      
      expected:
        next_called: false
        response_status: 400
        error_field: "username"
        error_message_contains: "50"  # mentions max length
      
      assertions:
        - "next() is NOT called"
        - "Response status is 400"
        - "Error mentions max length of 50"
      
      br_005_edge_case:
        boundary_type: "max_length_plus_one"
        parameter: "username"
        constraint: "3-50 characters"
        rationale: "Boundary just over max must be rejected"
    
    # Risk-Based Testing - Middleware Order (High Risk)
    - id: "UT-VAL-005"
      name: "middleware runs before route handler"
      category: "security"
      
      scenario:
        given: "Middleware is attached to route"
        when: "Invalid request is sent"
        then: "Route handler is NEVER called"
      
      input:
        method: "POST"
        path: "/api/users"
        body:
          username: ""  # Invalid - empty
          email: "test@example.com"
      
      expected:
        route_handler_called: false
        middleware_stopped_processing: true
      
      mocks:
        - dependency: "routeHandler"
          return_value: "mocked handler"
      
      assertions:
        - "Route handler is NOT called"
        - "Middleware sent 400 response"
        - "Invalid data never reached business logic"
      
      br_001_risk_prioritized:
        risk_id: "RISK-001"
        risk_level: "high"
        test_rationale: "Validation bypass is critical security vulnerability if middleware order is wrong"
    
    # Null Input Handling
    - id: "UT-VAL-006"
      name: "null body returns 400"
      category: "error_path"
      
      scenario:
        given: "Request body is null"
        when: "validationMiddleware processes the request"
        then: "Returns 400 with appropriate error"
      
      input:
        method: "POST"
        path: "/api/users"
        body: null
      
      expected:
        next_called: false
        response_status: 400
        error_message: "Request body is required"
      
      assertions:
        - "next() is NOT called"
        - "Response status is 400"
        - "Error indicates body is required"
    
    # Type Mismatch
    - id: "UT-VAL-007"
      name: "wrong type for age (string instead of number) returns 400"
      category: "error_path"
      
      scenario:
        given: "Age field is a string instead of number"
        when: "validationMiddleware processes the request"
        then: "Returns 400 with type error"
      
      input:
        username: "john"
        email: "john@example.com"
        age: "twenty-five"  # String instead of number
      
      expected:
        next_called: false
        response_status: 400
        error_field: "age"
        error_type: "type_mismatch"
      
      assertions:
        - "next() is NOT called"
        - "Response status is 400"
        - "Error indicates type mismatch for age field"
```

## Coverage Summary

```yaml
coverage_summary:
  total_test_cases: 7
  by_category:
    happy_path: 1
    error_path: 4
    boundary: 2
    security: 1
  
  validation_rules_covered:
    - "Email format validation"
    - "Username length (min/max)"
    - "Required field (body)"
    - "Type checking (age is number)"
    - "Middleware order (security)"
  
  br_compliance:
    br_001_upstream_consumed: true
    br_002_independent_verification: true
    br_003_coverage_boundaries: "Documented above"
    br_004_failure_classification_ready: true
    br_005_edge_cases_included: true
  
  test_files:
    - "tests/unit/validationMiddleware.test.ts"
    - "tests/unit/userValidator.test.ts"
  
  mocks_required:
    - "next function"
    - "route handler"
    - "response object"
```

## Key Decisions Notes

1. **BR-002 Independence**: Each test independently verifies validation behavior. Self-check claims are acknowledged but not used as evidence.

2. **BR-005 Edge Cases**: Both min and max boundaries are tested for username length, including the critical `max+1` case.

3. **BR-001 Risk Prioritization**: High-risk middleware order vulnerability gets dedicated test to ensure validation cannot be bypassed.

4. **BR-004 Failure Classification Ready**: Each test case has clear expected errors, enabling proper failure classification when tests fail.

5. **Upstream Consumption**: Test design derived from `changed_files` (validation middleware files) and `risks` (middleware order risk).
