# Anti-Example 001: Happy-Path-Only Testing

## What This Anti-Example Looks Like

### ❌ Incorrect Test Design (Happy Path Only)

```yaml
test_suite:
  name: "AuthService Tests"
  
  test_cases:
    # ONLY Happy Path - NO Error Paths, NO Boundaries
    - id: "TC-001"
      name: "login works with valid credentials"
      category: "happy_path"
      
      input:
        username: "john"
        password: "password123"
      
      expected:
        success: true
        token: "jwt_token_returned"
    
    # That's it - only 1 test case
```

## Why This Is Wrong

### BR-005 Violation: Edge Cases Are Mandatory

This test design **only covers the happy path** and misses:

| Missing Category | Example Test Case | Risk If Missing |
|-----------------|-------------------|-----------------|
| **Error Path** | Invalid password rejection | Attackers can brute-force without lockout |
| **Error Path** | Non-existent user handling | Information leakage about user existence |
| **Boundary** | Empty username | System crash or unexpected behavior |
| **Boundary** | Very long username | Buffer overflow or DoS |
| **Security** | SQL injection attempt | Database compromise |
| **Security** | Null input handling | System crash or bypass |

### BR-003 Violation: No Coverage Boundaries Disclosed

The test report would say "All tests passed" but doesn't disclose:
- What was NOT tested (everything except happy path)
- Why those areas were excluded (no reason given)
- What risks remain (significant security and stability risks)

### BR-007 Violation: False Confidence

Claiming "tests passed" with only happy-path coverage creates **false confidence**:
- Stakeholders think functionality is verified
- In reality, only the simplest scenario was tested
- Production bugs will occur in edge cases

## How to Detect This Anti-Pattern

### Detection Checklist

- [ ] **Test Count Check**: Does the test suite have fewer than 5 test cases for a non-trivial function?
- [ ] **Category Distribution**: Are ALL test cases in `happy_path` category?
- [ ] **Error Path Check**: Is there at least one test for each error condition the function can throw?
- [ ] **Boundary Check**: Are there tests for min/max values, empty inputs, null inputs?
- [ ] **Security Check**: Are there tests for injection attempts, permission boundaries?

### Warning Signs

```text
🚩 Only 1-2 test cases for complex business logic
🚩 No tests with invalid inputs
🚩 No tests for error conditions mentioned in code
🚩 Test names all start with "should work when..." (no "should fail when...")
🚩 No mention of edge cases in test documentation
```

## How to Fix This

### Step 1: Apply Edge-Case-Matrix Skill

Before designing tests, run `edge-case-matrix` skill to identify:
- Input boundaries (min, max, empty, null)
- Error conditions (validation failures, business rule violations)
- Security boundaries (injection, auth bypass)

### Step 2: Ensure Test Category Distribution

A balanced test suite should have:

```yaml
test_distribution:
  happy_path: "40-50%"    # Main functionality
  error_path: "30-40%"    # Error handling
  boundary: "15-20%"      # Edge conditions
  security: "5-10%"       # Security scenarios
```

### Step 3: Document Coverage Boundaries

Explicitly state what was NOT tested:

```yaml
coverage_boundaries:
  in_scope:
    - "Username/password authentication"
    - "JWT token generation"
    - "Input validation"
  
  out_of_scope:
    - "OAuth integration (separate feature)"
    - "Password reset flow (separate endpoint)"
    - "Rate limiting (infrastructure layer)"
  
  gaps:
    - "Performance under load (requires load testing setup)"
    - "Concurrent login attempts (requires concurrency testing)"
```

## Corrected Example

See `example-001-auth-service-test-design.md` for a complete test design that:
- ✅ Covers happy path (1 test)
- ✅ Covers error paths (2+ tests)
- ✅ Covers boundaries (2+ tests)
- ✅ Covers security scenarios (1+ test)
- ✅ Documents coverage boundaries
- ✅ Integrates with edge-case-matrix output

## Lesson

**Happy-path-only testing gives a false sense of security.** The goal of testing is not to prove the code works, but to **find where it doesn't work**. Edge cases are where bugs hide.

---

## References

- `specs/005-tester-core/spec.md` Section 6: BR-005 (Edge Cases Are Mandatory)
- `specs/005-tester-core/spec.md` Section 6: BR-003 (Coverage Boundaries)
- `specs/005-tester-core/spec.md` Section 6: BR-007 (Honesty Over False Confidence)
- `.opencode/skills/tester/edge-case-matrix/SKILL.md` - Generate edge case matrix before test design
