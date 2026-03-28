# Example 001: User Input Boundary Matrix

## Scenario Context

**Feature Being Tested:**
User registration form with the following fields:
- Username (string, 3-50 characters, alphanumeric + underscore)
- Email (string, email format)
- Password (string, 8-128 characters, complexity requirements)
- Age (number, 18-120)
- Terms Acceptance (boolean, required)

## BR-005 Compliance: Edge Cases Mandatory

This edge case matrix is **mandatory** before test design. Happy-path-only testing would miss critical boundaries.

### Input Parameter Analysis

#### Username Field

```yaml
parameter: "username"
type: "string"
constraints: "3-50 characters, alphanumeric + underscore only"

boundaries:
  # Empty/Null Boundaries (P0 - Must Test)
  - id: "UN-001"
    type: "null"
    value: null
    description: "Null username"
    priority: "P0"
    expected_behavior: "ValidationError: username is required"
    risk: "Missing validation allows null injection"
  
  - id: "UN-002"
    type: "empty_string"
    value: ""
    description: "Empty string username"
    priority: "P0"
    expected_behavior: "ValidationError: username is required"
    risk: "Empty usernames break uniqueness constraints"
  
  - id: "UN-003"
    type: "whitespace_only"
    value: "   "
    description: "Whitespace-only username"
    priority: "P0"
    expected_behavior: "ValidationError or trim then validate length"
    risk: "Whitespace usernames can bypass uniqueness"
  
  # Length Boundaries (P0 - Must Test)
  - id: "UN-004"
    type: "too_short"
    value: "ab"  # 2 characters
    description: "Below minimum length (3)"
    priority: "P0"
    expected_behavior: "ValidationError: username must be at least 3 characters"
    risk: "Short usernames may cause collisions"
  
  - id: "UN-005"
    type: "min_valid"
    value: "abc"  # 3 characters
    description: "Exactly at minimum length"
    priority: "P0"
    expected_behavior: "Accept"
    risk: "Boundary case"
  
  - id: "UN-006"
    type: "max_valid"
    value: "a" * 50  # 50 'a' characters
    description: "Exactly at maximum length"
    priority: "P0"
    expected_behavior: "Accept"
    risk: "Boundary case"
  
  - id: "UN-007"
    type: "too_long"
    value: "a" * 51  # 51 'a' characters
    description: "Above maximum length (50)"
    priority: "P0"
    expected_behavior: "ValidationError: username must be at most 50 characters"
    risk: "Buffer overflow, DoS, storage issues"
  
  - id: "UN-008"
    type: "extremely_long"
    value: "a" * 10000  # 10,000 characters
    description: "Extremely long input"
    priority: "P1"
    expected_behavior: "ValidationError (same as too_long)"
    risk: "DoS via resource exhaustion"
  
  # Character Set Boundaries (P0/P1 - Security Critical)
  - id: "UN-009"
    type: "special_characters"
    value: "user@name"
    description: "Contains @ symbol"
    priority: "P0"
    expected_behavior: "ValidationError: only alphanumeric and underscore allowed"
    risk: "Special chars may break parsing or enable injection"
  
  - id: "UN-010"
    type: "sql_injection"
    value: "' OR '1'='1"
    description: "SQL injection attempt"
    priority: "P0"
    expected_behavior: "ValidationError (rejected before SQL)"
    risk: "CRITICAL - SQL injection if not caught"
  
  - id: "UN-011"
    type: "xss_attempt"
    value: "<script>alert(1)</script>"
    description: "XSS attempt"
    priority: "P0"
    expected_behavior: "ValidationError (rejected)"
    risk: "CRITICAL - XSS if not caught"
  
  - id: "UN-012"
    type: "unicode_characters"
    value: "用户名"
    description: "Non-ASCII Unicode characters"
    priority: "P1"
    expected_behavior: "ValidationError: alphanumeric only"
    risk: "Unicode handling may vary by system"
  
  - id: "UN-013"
    type: "emoji"
    value: "user😎name"
    description: "Emoji in username"
    priority: "P1"
    expected_behavior: "ValidationError: alphanumeric only"
    risk: "Emoji may break storage or display"
  
  # Format Boundaries (P1)
  - id: "UN-014"
    type: "leading_trailing_spaces"
    value: "  username  "
    description: "Leading and trailing spaces"
    priority: "P1"
    expected_behavior: "Trim then validate, or reject"
    risk: "Whitespace can bypass uniqueness"
  
  - id: "UN-015"
    type: "underscores_only"
    value: "___"
    description: "Only underscores (should be valid)"
    priority: "P1"
    expected_behavior: "Accept (underscore is allowed)"
    risk: "Edge case - may look like whitespace"
  
  - id: "UN-016"
    type: "consecutive_underscores"
    value: "user__name"
    description: "Consecutive underscores"
    priority: "P2"
    expected_behavior: "Accept"
    risk: "Low"
```

#### Email Field

```yaml
parameter: "email"
type: "string"
constraints: "Valid email format"

boundaries:
  # Format Boundaries (P0)
  - id: "EM-001"
    type: "null"
    value: null
    description: "Null email"
    priority: "P0"
    expected_behavior: "ValidationError: email is required"
  
  - id: "EM-002"
    type: "empty_string"
    value: ""
    description: "Empty email"
    priority: "P0"
    expected_behavior: "ValidationError: email is required"
  
  - id: "EM-003"
    type: "invalid_format_no_at"
    value: "usernameexample.com"
    description: "Missing @ symbol"
    priority: "P0"
    expected_behavior: "ValidationError: invalid email format"
  
  - id: "EM-004"
    type: "invalid_format_no_domain"
    value: "username@"
    description: "Missing domain"
    priority: "P0"
    expected_behavior: "ValidationError: invalid email format"
  
  - id: "EM-005"
    type: "invalid_format_no_local"
    value: "@example.com"
    description: "Missing local part"
    priority: "P0"
    expected_behavior: "ValidationError: invalid email format"
  
  - id: "EM-006"
    type: "valid_email"
    value: "user@example.com"
    description: "Valid email"
    priority: "P0"
    expected_behavior: "Accept"
  
  # Edge Cases (P1)
  - id: "EM-007"
    type: "plus_addressing"
    value: "user+tag@example.com"
    description: "Plus addressing (subaddressing)"
    priority: "P1"
    expected_behavior: "Accept (valid per RFC)"
    risk: "Some systems don't handle plus addressing"
  
  - id: "EM-008"
    type: "dots_in_local"
    value: "user.name@example.com"
    description: "Dots in local part"
    priority: "P1"
    expected_behavior: "Accept"
  
  - id: "EM-009"
    type: "longest_valid"
    value: "very.long.email.address.that.is.at.the.maximum.allowed.length@example.com"
    description: "Very long but valid email"
    priority: "P1"
    expected_behavior: "Accept"
    risk: "May hit length limits"
```

#### Password Field

```yaml
parameter: "password"
type: "string"
constraints: "8-128 characters, must contain uppercase, lowercase, number, special char"

boundaries:
  # Length Boundaries (P0)
  - id: "PW-001"
    type: "too_short"
    value: "Ab1!"  # 4 characters
    description: "Below minimum (8)"
    priority: "P0"
    expected_behavior: "ValidationError: password must be at least 8 characters"
  
  - id: "PW-002"
    type: "min_valid"
    value: "Abcd123!"  # 8 characters
    description: "Exactly at minimum"
    priority: "P0"
    expected_behavior: "Accept"
  
  - id: "PW-003"
    type: "max_valid"
    value: "Abcd123!" + "x" * 120  # 128 characters
    description: "Exactly at maximum"
    priority: "P0"
    expected_behavior: "Accept"
  
  - id: "PW-004"
    type: "too_long"
    value: "Abcd123!" + "x" * 121  # 129 characters
    description: "Above maximum (128)"
    priority: "P0"
    expected_behavior: "ValidationError: password must be at most 128 characters"
  
  # Complexity Boundaries (P0)
  - id: "PW-005"
    type: "no_uppercase"
    value: "abcd123!"
    description: "Missing uppercase"
    priority: "P0"
    expected_behavior: "ValidationError: must contain uppercase"
  
  - id: "PW-006"
    type: "no_lowercase"
    value: "ABCD123!"
    description: "Missing lowercase"
    priority: "P0"
    expected_behavior: "ValidationError: must contain lowercase"
  
  - id: "PW-007"
    type: "no_number"
    value: "AbcdEfgh!"
    description: "Missing number"
    priority: "P0"
    expected_behavior: "ValidationError: must contain number"
  
  - id: "PW-008"
    type: "no_special"
    value: "Abcd1234"
    description: "Missing special character"
    priority: "P0"
    expected_behavior: "ValidationError: must contain special character"
  
  # Common Passwords (P1 - Security)
  - id: "PW-009"
    type: "common_password"
    value: "Password1!"
    description: "Common password"
    priority: "P1"
    expected_behavior: "Accept or warn (depends on policy)"
    risk: "Weak password if allowed"
```

#### Age Field

```yaml
parameter: "age"
type: "number"
constraints: "18-120"

boundaries:
  # Null/Type Boundaries (P0)
  - id: "AG-001"
    type: "null"
    value: null
    description: "Null age"
    priority: "P0"
    expected_behavior: "ValidationError: age is required"
  
  - id: "AG-002"
    type: "wrong_type_string"
    value: "twenty"
    description: "String instead of number"
    priority: "P0"
    expected_behavior: "ValidationError: age must be a number"
  
  # Range Boundaries (P0)
  - id: "AG-003"
    type: "below_min"
    value: 17
    description: "Below minimum (18)"
    priority: "P0"
    expected_behavior: "ValidationError: must be at least 18"
  
  - id: "AG-004"
    type: "min_valid"
    value: 18
    description: "Exactly at minimum"
    priority: "P0"
    expected_behavior: "Accept"
  
  - id: "AG-005"
    type: "max_valid"
    value: 120
    description: "Exactly at maximum"
    priority: "P0"
    expected_behavior: "Accept"
  
  - id: "AG-006"
    type: "above_max"
    value: 121
    description: "Above maximum (120)"
    priority: "P0"
    expected_behavior: "ValidationError: must be at most 120"
  
  # Extreme Boundaries (P1)
  - id: "AG-007"
    type: "zero"
    value: 0
    description: "Zero age"
    priority: "P1"
    expected_behavior: "ValidationError: must be at least 18"
  
  - id: "AG-008"
    type: "negative"
    value: -1
    description: "Negative age"
    priority: "P1"
    expected_behavior: "ValidationError: must be at least 18"
  
  - id: "AG-009"
    type: "extremely_large"
    value: 999999
    description: "Extremely large number"
    priority: "P1"
    expected_behavior: "ValidationError: must be at most 120"
```

#### Terms Acceptance (Boolean)

```yaml
parameter: "terms_accepted"
type: "boolean"
constraints: "Required, must be true"

boundaries:
  - id: "TA-001"
    type: "null"
    value: null
    description: "Null terms acceptance"
    priority: "P0"
    expected_behavior: "ValidationError: must accept terms"
  
  - id: "TA-002"
    type: "false"
    value: false
    description: "Did not accept terms"
    priority: "P0"
    expected_behavior: "ValidationError: must accept terms"
  
  - id: "TA-003"
    type: "true"
    value: true
    description: "Accepted terms"
    priority: "P0"
    expected_behavior: "Accept"
```

## Combination Matrix (P0 Priority)

```yaml
combination_scenarios:
  - id: "COMBO-001"
    name: "All valid minimum"
    parameters:
      username: "abc"
      email: "user@example.com"
      password: "Abcd123!"
      age: 18
      terms_accepted: true
    priority: "P0"
    expected: "Success"
  
  - id: "COMBO-002"
    name: "All empty/null"
    parameters:
      username: null
      email: null
      password: null
      age: null
      terms_accepted: null
    priority: "P0"
    expected: "ValidationError (multiple fields)"
  
  - id: "COMBO-003"
    name: "SQL injection in username"
    parameters:
      username: "' OR '1'='1"
      email: "user@example.com"
      password: "Abcd123!"
      age: 25
      terms_accepted: true
    priority: "P0"
    expected: "ValidationError (rejected before SQL)"
  
  - id: "COMBO-004"
    name: "All boundary minimum"
    parameters:
      username: "abc"
      email: "a@b.com"
      password: "Abcd123!"
      age: 18
      terms_accepted: true
    priority: "P0"
    expected: "Success"
  
  - id: "COMBO-005"
    name: "All boundary maximum"
    parameters:
      username: "a" * 50
      password: "Abcd123!" + "x" * 120
      age: 120
      terms_accepted: true
    priority: "P0"
    expected: "Success"
```

## Coverage Summary

```yaml
coverage_summary:
  total_boundaries: 35
  by_priority:
    P0: 28  # Must test
    P1: 6   # Should test
    P2: 1   # Nice to test
  
  by_parameter:
    username: 16
    email: 9
    password: 9
    age: 9
    terms_accepted: 3
  
  by_category:
    null_empty: 8
    length: 10
    format: 8
    range: 6
    security: 3
  
  br_compliance:
    br_003_coverage_boundaries: "All boundaries documented"
    br_005_edge_cases_mandatory: "28 P0 boundaries identified"
    br_004_failure_classification_ready: "Expected behaviors specified"
```

## Next Steps

This edge case matrix should be consumed by:
1. **unit-test-design** skill → Create test cases for each P0 boundary
2. **verification-report** → Track edge_cases_checked field
3. **test-scope-report** → Reference boundary coverage strategy

## Risk Areas Requiring Special Attention

```yaml
high_risk_boundaries:
  - boundary: "SQL injection in username"
    reason: "Critical security vulnerability if missed"
    mitigation: "Test explicitly, verify parameterized query"
  
  - boundary: "XSS attempt in username"
    reason: "Critical security vulnerability if missed"
    mitigation: "Test explicitly, verify encoding"
  
  - boundary: "Extremely long input"
    reason: "DoS risk via resource exhaustion"
    mitigation: "Test with length limits, verify early rejection"
```
