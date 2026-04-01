# Example: Basic Test Execution

## Scenario

Tester needs to run unit tests for a newly implemented feature.

## Input

```yaml
dispatch_id: gh-issue-owner-repo-42
task_id: T-015
feature: user-authentication
```

## Command Execution

```bash
$ npm test

> my-project@1.0.0 test
> vitest run

 ✓ src/__tests__/auth/login.test.ts (5)
   ✓ should authenticate valid user
   ✓ should reject invalid credentials
   ✓ should handle network errors
   ✓ should store session token
   ✓ should clear session on logout

Test Files  1 passed (1)
     Tests  5 passed (5)
  Duration  1.23s (bundle 120ms, tests 1.11s)
```

## Output

```yaml
test_report:
  status: success
  summary:
    total: 5
    passed: 5
    failed: 0
    skipped: 0
    duration_ms: 1230
    
  test_files:
    - file: src/__tests__/auth/login.test.ts
      tests: 5
      passed: 5
      failed: 0
      
  coverage: null  # Coverage not enabled
      
  command_used: "npm test"
  executed_at: "2026-04-02T00:30:00Z"
```

## Next Steps

1. Generate verification-report with test results
2. Update issue status to completed
3. Run coverage analysis if needed