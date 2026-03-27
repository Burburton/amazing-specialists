# Example 001: State Leakage Flaky Test Diagnosis

## Scenario Context

**Test Under Investigation:**
```yaml
test_info:
  file: "tests/integration/UserRepository.test.ts"
  test_name: "findAll returns all users"
  suite: "UserRepository Integration Tests"
  
  flaky_report:
    first_observed: "2026-03-15"
    ci_failures: 8 out of 20 runs (40% failure rate)
    local_reproduction: "Intermittent - fails about every 3-4 runs"
```

**CI Failure Pattern:**
```text
Run 1: ✓ findAll returns all users (5 passed)
Run 2: ✗ findAll returns all users
  AssertionError: Expected 5 users, got 8
Run 3: ✓ findAll returns all users (5 passed)
Run 4: ✗ findAll returns all users
  AssertionError: Expected 5 users, got 12
Run 5: ✓ findAll returns all users (5 passed)
Run 6: ✗ findAll returns all users
  AssertionError: Expected 5 users, got 17
...
```

**Key Observation:** The number of users found increases over time, suggesting state accumulation.

## Diagnosis Process

### Step 1: Confirm Flaky Behavior

```yaml
confirmation_runs:
  attempts: 25
  failures: 10
  failure_rate: 40%
  
  failure_pattern_analysis:
    observation: "User count increases across runs"
    pattern: "Expected 5, got 5 → 8 → 12 → 17 → 22 → ..."
    hypothesis: "Database state not cleaned between tests"
```

### Step 2: Isolate Root Cause

```yaml
isolation_tests:
  - test: "Run test alone (no other tests in suite)"
    result: "✓ Passes consistently (10/10)"
    conclusion: "Not a test internal issue, depends on other tests"
  
  - test: "Run test with preceding test: createUser"
    result: "✗ Fails 8/10 - gets 6 users (expected 5)"
    conclusion: "createUser test leaves state behind"
  
  - test: "Run test with random order"
    result: "✓ Passes when run first, ✗ fails when run after createUser"
    conclusion: "Order dependency + state leakage"
```

### Step 3: Analyze Test Setup/Teardown

```yaml
test_code_analysis:
  createUser_test:
    setup: "beforeEach: connect to database"
    teardown: "afterEach: disconnect from database"
    problem: "afterEach does NOT delete created user!"
    
  findAll_test:
    setup: "beforeEach: seed 5 users from fixture"
    teardown: "afterEach: disconnect from database"
    problem: "afterEach does NOT clean seeded or accumulated users!"
    
  suite_setup:
    beforeAll: "Create database connection pool"
    afterAll: "Close database connection pool"
    problem: "No global cleanup"
```

**Root Cause Identified:** Tests create/seed users but never delete them. Database connection pool persists across tests in parallel mode.

### Step 4: Verify State Leakage Mechanism

```yaml
state_leakage_verification:
  mechanism: "Database connection pool shared across tests"
  
  evidence:
    - "Tests use shared test database (test_db)"
    - "Connection pool not reset between tests"
    - "createUser inserts user but doesn't delete"
    - "findAll seed inserts 5 users but doesn't delete"
    - "Accumulation: 5 + createUser users + previous seed users"
  
  confirmed: true
  root_cause_category: "state_leakage"
```

## Full Diagnosis Report

```yaml
flaky_test_diagnosis:
  dispatch_id: "diag-user-repo-001"
  task_id: "fix-flaky-user-findall"
  
  test_identification:
    test_file: "tests/integration/UserRepository.test.ts"
    test_name: "findAll returns all users"
    test_suite: "UserRepository Integration Tests"
    
  flaky_behavior:
    failure_rate: 40
    failure_pattern: "User count increases over successive runs"
    reproduction_attempts: 25
    successful_reproductions: 10
    
  diagnosis:
    root_cause_category: state_leakage
    
    root_cause_detail:
      description: "Database users accumulate across tests due to missing cleanup"
      mechanism: "Tests seed/create users without deleting; connection pool persists"
      evidence:
        - "User count grows: 5 → 8 → 12 → 17 → 22"
        - "createUser test doesn't delete created user in afterEach"
        - "findAll test seeds 5 users but doesn't delete in afterEach"
        - "Database connection pool shared across tests in parallel mode"
        - "Running test alone passes consistently"
        
    affected_code:
      - file: "tests/integration/UserRepository.test.ts"
        line_range: "15-20"
        issue: "createUser test afterEach missing user deletion"
      
      - file: "tests/integration/UserRepository.test.ts"
        line_range: "35-40"
        issue: "findAll test afterEach missing seeded users deletion"
      
      - file: "tests/integration/UserRepository.test.ts"
        line_range: "5-10"
        issue: "Suite beforeAll/afterAll missing database reset"
        
  fix_strategy:
    type: fix
    
    recommended_fix:
      description: "Add comprehensive cleanup strategy"
      approach: "Transaction rollback or explicit delete in afterEach"
      risk_assessment: "Low risk - only affects test cleanup, not test logic"
      
    implementation:
      approach: "Transaction rollback (recommended for speed)"
      
      changes:
        - file: "tests/integration/UserRepository.test.ts"
          change_type: "modify"
          description: "Add transaction start in beforeEach, rollback in afterEach"
          
          before:
            code: |
              beforeEach(async () => {
                connection = await pool.getConnection();
              });
              
              afterEach(async () => {
                connection.release();
              });
          
          after:
            code: |
              beforeEach(async () => {
                connection = await pool.getConnection();
                await connection.beginTransaction();
              });
              
              afterEach(async () => {
                await connection.rollback();
                connection.release();
              });
        
        - file: "tests/integration/UserRepository.test.ts"
          change_type: "modify"
          description: "Remove explicit seed cleanup (handled by rollback)"
          
          note: "Transaction rollback automatically undoes all INSERTs from seed"
    
    alternative_fix:
      approach: "Explicit delete in afterEach (slower but more explicit)"
      
      code: |
        afterEach(async () => {
          await connection.query('DELETE FROM users WHERE test_marker = true');
          connection.release();
        });
      
      pros: "More explicit, easier to understand"
      cons: "Slower, requires test_marker column"
      
  quarantine_status:
    quarantined: false
    quarantine_reason: "Root cause identified and fix straightforward"
    
  verification:
    fix_applied: true
    post_fix_runs: 50
    post_fix_failures: 0
    stability_verified: true
    
    verification_details:
      - test: "Run test suite 50 times in parallel"
        result: "50/50 passed"
      - test: "Run test in random order 20 times"
        result: "20/20 passed"
      - test: "Run createUser + findAll together 30 times"
        result: "30/30 passed"
```

## Additional Observations

### Prevention Recommendations

```yaml
prevention_recommendations:
  - recommendation: "Always use transaction rollback for database tests"
    reason: "Fast, reliable, automatic cleanup"
    
  - recommendation: "Add CI check for test isolation"
    implementation: "Run tests in random order as part of CI"
    
  - recommendation: "Use separate database per test suite or transaction isolation"
    reason: "Prevents cross-suite state leakage"
    
  - recommendation: "Monitor user count in test database"
    implementation: "Add assertion in afterAll: expect(userCount).toBe(0)"
```

### Similar Tests Check

```yaml
similar_tests_check:
  affected_tests:
    - test: "findById returns created user"
      status: "Likely affected - uses same database, same cleanup issue"
    
    - test: "update modifies user correctly"
      status: "Likely affected - creates user without cleanup"
    
    - test: "delete removes user"
      status: "Less affected - deletion may help cleanup"
  
  recommendation: "Apply transaction rollback to entire suite"
```

## Key Lessons

1. **State Leakage is Common**: Database state leakage is one of the most common flaky test causes.

2. **Transaction Rollback is Best**: For database tests, transaction rollback is the recommended cleanup strategy:
   - Fast (no actual delete operations)
   - Reliable (undoes all changes)
   - Automatic (no manual cleanup code)

3. **Isolation Tests Reveal Root Cause**: Running tests alone, in sequence, and in random order helps isolate state leakage.

4. **Pattern Recognition**: Growing counts across runs is a telltale sign of state leakage.

5. **Prevention Over Fix**: Prevention through proper test design (FIRST principles) is better than fixing later.