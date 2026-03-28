# Anti-Example 002: False All-Clear

## Scenario
Developer marks all checks passed when issues clearly exist.

## What Went Wrong

### Developer's Self-Check Report
```yaml
self_check_report:
  summary:
    total_checks: 28
    passed: 28
    failed: 0
    blockers: 0
    warnings: 0
  
  check_results:
    - category: "Security"
      checks:
        - item: "No sensitive data leak"
          status: pass
          # PROBLEM: But code has hardcoded API key
        - item: "Input validation present"
          status: pass
          # PROBLEM: But no validation exists
  
  overall_status: PASS
  recommendation: PROCEED
```

### Reality in Code
```typescript
// src/config/api.ts
const API_KEY = "sk-live-abc123";  // Hardcoded secret!

// src/controllers/UserController.ts
async createUser(req, res) {
  const user = await UserService.create(req.body);
  // No validation of req.body!
}
```

## Problems Identified

| Problem | Claim | Reality |
|---------|-------|---------|
| Sensitive data leak | PASS | Hardcoded API key |
| Input validation | PASS | No validation |
| Overall status | PASS | Should be FAIL_WITH_BLOCKERS |

## Why This Is Dangerous

1. **False confidence**: Team thinks code is safe
2. **Security vulnerability**: API key exposed
3. **Broken trust**: Reviewer can't rely on self-check
4. **Pattern normalization**: Encourages sloppy checks

## Correct Report
```yaml
self_check_report:
  summary:
    total_checks: 28
    passed: 26
    failed: 2
    blockers: 2
  
  check_results:
    - category: "Security"
      checks:
        - item: "No sensitive data leak"
          status: fail
          severity: blocker
          description: "Hardcoded API key in src/config/api.ts:8"
          fix_required: true
        - item: "Input validation present"
          status: fail
          severity: blocker
          description: "No validation for req.body"
          fix_required: true
  
  blockers:
    - blocker_id: "BLOCKER-001"
      description: "Hardcoded API key"
      location: "src/config/api.ts:8"
      fix_suggestion: "Move to environment variable"
  
  overall_status: FAIL_WITH_BLOCKERS
  recommendation: FIX_BLOCKERS
```

## Detection

### Signs of False All-Clear
- [ ] All checks pass but reviewer finds issues
- [ ] Self-check done too quickly
- [ ] No evidence provided
- [ ] Vague descriptions

### Prevention

1. **Require evidence**: Specific file:line references
2. **Spot-check accuracy**: Reviewer verifies sample
3. **Track accuracy metrics**: Self-check vs review findings
4. **Culture of honesty**: Encourage finding issues