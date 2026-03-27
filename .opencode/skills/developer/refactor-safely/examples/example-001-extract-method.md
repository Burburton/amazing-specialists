# Example 001: Extract Method Refactoring

## Scenario
Extract duplicate validation logic from multiple services into a shared utility.

## Task Description
```
Goal: Eliminate duplicate validation code in UserService and OrderService
Scope: Extract common validation methods to ValidationUtils
Constraints:
  - Do not change any external behavior
  - All existing tests must pass
  - Add tests for new utility methods
```

## Refactoring Process

### Step 1: Identify Refactoring Scope
```yaml
analysis:
  duplicate_code_found:
    - location: "src/services/UserService.ts:validateEmail()"
      lines: 15-25
    - location: "src/services/OrderService.ts:validateEmail()"
      lines: 20-30
  similarity: "95% identical implementation"
  impact_assessment: "Low risk - internal method extraction"
```

### Step 2: Test Coverage Check
```yaml
test_coverage:
  existing_tests:
    - "tests/unit/UserService.test.ts"  # 85% coverage
    - "tests/unit/OrderService.test.ts" # 80% coverage
  missing_tests: "No direct tests for validation logic"
  action: "Add tests for ValidationUtils before refactoring"
```

### Step 3: Add Test Safety Net
```yaml
new_tests:
  - file: "tests/unit/ValidationUtils.test.ts"
    description: "Test email validation, phone validation"
    cases:
      - "valid email formats"
      - "invalid email formats"
      - "valid phone formats"
      - "invalid phone formats"
      - "edge cases (empty, null, undefined)"
```

### Step 4: Small-Step Refactoring

#### Step 4.1: Create ValidationUtils with new methods
```yaml
commit:
  id: "a1b2c3d"
  message: "refactor: add ValidationUtils with email validation"
  verification:
    - "New tests pass"
    - "No other code changes yet"
```

#### Step 4.2: Update UserService
```yaml
commit:
  id: "a1b2c3e"
  message: "refactor: use ValidationUtils in UserService"
  verification:
    - "UserService tests pass"
    - "Behavior unchanged - same test results"
```

#### Step 4.3: Update OrderService
```yaml
commit:
  id: "a1b2c3f"
  message: "refactor: use ValidationUtils in OrderService"
  verification:
    - "OrderService tests pass"
    - "Behavior unchanged - same test results"
```

### Step 5: Final Verification
```yaml
verification:
  all_tests:
    - command: "npm test"
      result: "PASS"
      duration: "12.3s"
      
  behavior_comparison:
    method: "Manual API testing"
    endpoints_tested:
      - "POST /users - email validation"
      - "POST /orders - email validation"
    result: "Same response format, same validation behavior"
    
  coverage:
    before: "78%"
    after: "82%"
```

## Refactor Summary Output

```yaml
refactor_summary:
  dispatch_id: "dispatch-refactor-001"
  task_id: "T-REFACTOR-001"
  
  refactoring_goal:
    objective: "Eliminate duplicate validation code"
    scope: "UserService.ts, OrderService.ts"
    approach: "Extract to shared ValidationUtils"
    
  test_coverage:
    before: "78%"
    after: "82%"
    new_tests_added:
      - "tests/unit/ValidationUtils.test.ts"
      
  changed_files:
    - path: "src/utils/ValidationUtils.ts"
      change_type: added
      description: "New utility with validateEmail, validatePhone methods"
      behavior_preserved: true
      verification_method: "New unit tests"
      
    - path: "src/services/UserService.ts"
      change_type: modified
      description: "Use ValidationUtils instead of inline validation"
      behavior_preserved: true
      verification_method: "Existing tests pass, behavior comparison"
      
    - path: "src/services/OrderService.ts"
      change_type: modified
      description: "Use ValidationUtils instead of inline validation"
      behavior_preserved: true
      verification_method: "Existing tests pass, behavior comparison"
      
    - path: "tests/unit/ValidationUtils.test.ts"
      change_type: added
      description: "Tests for ValidationUtils"
      behavior_preserved: true
      verification_method: "Tests pass"
      
  commit_history:
    - commit: "a1b2c3d"
      message: "refactor: add ValidationUtils with email validation"
      verification: "New tests pass"
    - commit: "a1b2c3e"
      message: "refactor: use ValidationUtils in UserService"
      verification: "UserService tests pass"
    - commit: "a1b2c3f"
      message: "refactor: use ValidationUtils in OrderService"
      verification: "All tests pass"
      
  verification_results:
    all_tests_pass: true
    behavior_comparison: "API responses identical before/after"
    performance_impact: null
    
  known_issues: []
  
  risks:
    - risk: "ValidationUtils may grow into a god object"
      level: low
      mitigation: "Keep methods focused, split if needed"
      
  recommendation: SEND_TO_TEST
  time_spent_minutes: 45
```

## Key Patterns Demonstrated

1. **Test-First Safety Net**: Added tests before refactoring
2. **Small Commits**: Each step is independently verifiable
3. **Clear Verification**: Each commit has verification method
4. **Behavior Preservation**: Explicitly confirmed behavior unchanged
5. **Coverage Improvement**: Refactoring improved test coverage

## What Makes This a Good Example

- Started with test coverage analysis
- Added tests before refactoring
- Made small, atomic commits
- Verified behavior preservation
- Documented verification methods
- Coverage actually improved