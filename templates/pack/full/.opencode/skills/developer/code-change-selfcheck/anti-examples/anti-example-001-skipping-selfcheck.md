# Anti-Example 001: Skipping Self-Check

## Scenario
Developer claims code is ready without running self-check.

## What Went Wrong

### Developer's Claim
```
"Implementation complete. Ready for review."
# No self-check-report provided
```

### What Reviewer Found
```yaml
issues_found_by_reviewer:
  blockers:
    - issue: "Hardcoded database password"
      location: "src/config/database.ts:8"
      severity: blocker
    
    - issue: "Missing error handling"
      location: "src/services/AuthService.ts:45"
      severity: blocker
  
  warnings:
    - issue: "Console.log statements left in code"
      count: 5
    
    - issue: "No tests for error paths"
```

## Problems Identified

| Problem | Evidence | Impact |
|---------|----------|--------|
| No self-check | Missing self-check-report | Obvious issues shipped |
| Security issue | Hardcoded password | Credentials leaked |
| Quality issue | Missing error handling | Crashes in production |
| Test gap | No error path tests | Bugs not caught |

## Why This Is Dangerous

1. **Wastes reviewer time**: Reviewer becomes tester
2. **Security risk**: Credentials exposed
3. **Low quality bar**: Encourages carelessness
4. **Broken trust**: Reviewer can't trust developer's claims

## Correct Approach

```yaml
self_check_report:
  summary:
    total_checks: 28
    passed: 26
    failed: 2
    blockers: 2
  
  blockers:
    - blocker_id: "BLOCKER-001"
      description: "Hardcoded password in database config"
      fixed: true
      fix_description: "Moved to environment variable"
    
    - blocker_id: "BLOCKER-002"
      description: "Missing error handling"
      fixed: true
      fix_description: "Added try/catch with proper error responses"
  
  overall_status: PASS
  recommendation: PROCEED
```

## Detection

### Signs of Skipped Self-Check
- [ ] No self-check-report file
- [ ] Reviewer finds obvious issues
- [ ] "It compiles" is only verification
- [ ] No test run mentioned

### Prevention

1. **Make self-check-report mandatory**
2. **Gate handoff on self-check existence**
3. **Track self-check accuracy over time**
4. **Spot-check by reviewers**