# Anti-Example 001: Boundary Omission

## What This Anti-Example Looks Like

### ❌ Incorrect Edge Case Matrix (Missing Critical Boundaries)

```yaml
edge_case_matrix:
  input_parameters:
    - name: "username"
      type: "string"
      constraints: "3-50 characters"
    
    - name: "age"
      type: "number"
      constraints: "18-120"
  
  boundary_analysis:
    - parameter: "username"
      boundaries:
        - type: "valid"
          value: "john.doe"
          description: "Valid username"
          priority: "P0"
        # ❌ Only happy path - no boundaries!
  
  test_cases:
    - id: "TC-001"
      name: "Valid registration"
      parameters:
        username: "john.doe"
        age: 25
      expected: "Success"
  
  coverage_summary:
    total_boundaries: 1  # ❌ Only 1 boundary for 2 parameters!
```

## Why This Is Wrong

### BR-005 Violation: Edge Cases Are Mandatory

This "analysis" **completely omits critical boundaries**:

| Missing Boundary | Consequence If Not Tested |
|-----------------|-------------------------|
| **Empty username** | Empty usernames may bypass validation |
| **Null username** | Null may cause crash or injection |
| **Too short/long** | Length limits not enforced |
| **SQL injection** | Security vulnerability |
| **Age = 17 (below min)** | Underage users may register |
| **Age = null** | Missing age validation |
| **Age = 999** | Unrealistic values accepted |

### BR-003 Violation: False Confidence

Claiming `total_boundaries: 1` while having multiple input parameters creates **false confidence**:
- Stakeholders think boundaries are covered
- In reality, only happy path was tested
- Production bugs will occur at boundaries

### Risk of This Anti-Pattern

```
Production Incident Scenarios:

1. Security Incident:
   - Attacker sends username: "' OR '1'='1"
   - No SQL injection boundary was tested
   - Database compromised
   
2. Data Quality Issue:
   - User registers with age: -1
   - No negative boundary was tested
   - Analytics report "average age: -5"
   
3. System Crash:
   - User sends username: null
   - No null boundary was tested
   - NullPointerException crashes service

All preventable with proper edge case analysis.
```

## How to Detect This Anti-Pattern

### Detection Checklist

- [ ] **Boundary Count Check**: Are there fewer than 5 boundaries per string/number parameter?
- [ ] **Null/Empty Check**: Is there a null/empty boundary for each parameter?
- [ ] **Min/Max Check**: Are min and max boundaries tested for numeric ranges?
- [ ] **Security Check**: Are injection attempts included for user inputs?
- [ ] **Invalid Check**: Are there tests for invalid values (too short, too long, out of range)?

### Warning Signs

```text
🚩 Fewer than 5 boundaries for a string parameter
🚩 No null/empty boundaries
🚩 No min/max boundaries for numeric ranges
🚩 Only "valid" test cases
🚩 No security-related boundaries (injection, XSS)
🚩 coverage_summary.total_boundaries is very low
```

## How to Fix This

### Step 1: Use Standard Boundary Categories

For **string parameters**, always include:
```yaml
boundaries:
  - null
  - empty_string
  - whitespace_only
  - too_short (min - 1)
  - min_valid
  - max_valid
  - too_long (max + 1)
  - special_characters
  - sql_injection_attempt
  - xss_attempt
```

For **numeric parameters**, always include:
```yaml
boundaries:
  - null
  - below_min
  - min_valid
  - max_valid
  - above_max
  - zero (if applicable)
  - negative (if applicable)
```

### Step 2: Apply Edge Case Matrix Skill Properly

Follow the complete workflow:
1. **Identify all input parameters**
2. **Analyze each parameter systematically** (numeric, string, collection boundaries)
3. **Generate boundary matrix**
4. **Assign priorities** (P0 = must test)
5. **Create test cases for P0 boundaries**

### Step 3: Verify Coverage

```yaml
coverage_verification:
  username:
    null_empty: ["null", "empty", "whitespace"]  # ✓
    length: ["too_short", "min", "max", "too_long"]  # ✓
    characters: ["special", "sql_injection", "xss"]  # ✓
  
  age:
    null: ["null"]  # ✓
    range: ["below_min", "min", "max", "above_max"]  # ✓
    extreme: ["zero", "negative"]  # ✓
  
  total_boundaries: 35  # Much better than 1!
```

## Corrected Example

See `example-001-user-input-boundaries.md` for complete edge case matrix that:
- ✅ Covers 35 boundaries for 5 parameters
- ✅ Includes null/empty boundaries
- ✅ Includes length/range boundaries
- ✅ Includes security boundaries (SQL injection, XSS)
- ✅ Includes combination scenarios
- ✅ Documents expected behaviors

## Lesson

**Boundary omission gives false confidence.** It's not enough to test "it works with valid input." You must test "it handles invalid input correctly." Every parameter has boundaries—find them, test them, document them.

---

## References

- `specs/005-tester-core/spec.md` Section 6: BR-005 (Edge Cases Are Mandatory)
- `specs/005-tester-core/spec.md` Section 6: BR-003 (Coverage Boundaries)
- `.opencode/skills/tester/edge-case-matrix/SKILL.md` - Complete boundary categories
