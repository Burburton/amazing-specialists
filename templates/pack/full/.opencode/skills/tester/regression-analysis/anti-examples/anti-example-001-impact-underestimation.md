# Anti-Example 001: Impact Underestimation

## What This Anti-Example Looks Like

### ❌ Incorrect Regression Analysis (Underestimating Impact)

```yaml
regression_analysis:
  change_summary:
    changed_files:
      - path: "src/services/AuthService.ts"
        change_type: "modified"
        description: "Add lockout detection logic"
  
  impact_analysis:
    direct_impacts:
      - component: "AuthService.validateUser"
        impact_type: "modified"
        description: "Lockout check added"
    
    indirect_impacts: []  # ❌ EMPTY - No adjacent impacts identified
    potential_impacts: []  # ❌ EMPTY - No potential impacts considered
  
  regression_strategy:
    strategy: "smoke"  # ❌ Too light for security feature
    scope:
      - component: "AuthService"
        priority: "P1"  # ❌ Should be P0 for security
  
  test_cases:
    - id: "TC-001"
      name: "Login still works"
      priority: "P1"
  
  untested_regression_areas: []  # ❌ Claims full coverage
```

## Why This Is Wrong

### BR-006 Violation: Regression Thinking Is Required

This analysis **only looks at the directly changed code** and ignores:

| Missing Impact | Example | Consequence If Missing |
|---------------|---------|----------------------|
| **Controller layer** | AuthController.handleLogin | May not handle new USER_LOCKED error |
| **UI layer** | Login form | May show generic error instead of "account locked" |
| **Database** | User schema | May need migration for failedAttempts field |
| **Admin features** | User management | May need unlock functionality |
| **API consumers** | Mobile app, third-party | May not handle new error codes |

### BR-003 Violation: No Coverage Gap Disclosure

Claiming `untested_regression_areas: []` when no adjacent impacts were even analyzed is **false confidence**.

### Risk of This Anti-Pattern

```
Production Incident Scenario:

1. AuthService returns new USER_LOCKED error code
2. AuthController doesn't handle it → returns 500 Internal Server Error
3. UI shows "Something went wrong" to user
4. Legitimate users locked out, support tickets flood in
5. Root cause: Controller regression not tested

This was preventable with proper regression analysis.
```

## How to Detect This Anti-Pattern

### Detection Checklist

- [ ] **Dependency Analysis**: Was a dependency graph built?
- [ ] **Caller Identification**: Were all callers of changed code identified?
- [ ] **Data Flow Analysis**: Were downstream data consumers identified?
- [ ] **Interface Analysis**: Were API consumers considered?
- [ ] **UI/UX Impact**: Were UI changes considered?

### Warning Signs

```text
🚩 indirect_impacts is empty or has only 1-2 items
🚩 No controller/route/handler mentioned in impacts
🚩 No UI/frontend mentioned for API changes
🚩 No database/schema changes considered
🚩 Strategy is "smoke" for anything beyond trivial changes
🚩 Only 1-2 test cases for non-trivial feature
```

## How to Fix This

### Step 1: Build Proper Dependency Graph

```yaml
# Correct dependency analysis for AuthService change
callers_of AuthService.validateUser:
  - AuthController.handleLogin (direct caller)
  - PasswordResetService.verifyBeforeReset (indirect)
  - AdminUserService.impersonate (indirect)
  - ApiKeyAuthService.validateApiKey (indirect, fallback)

data_consumers_of User model:
  - UserAdminController (reads/updates user data)
  - ReportService (aggregates user stats)
  - EmailService (sends emails to users)
```

### Step 2: Identify All Impact Layers

```yaml
impact_layers:
  service_layer: "AuthService (changed)"
  controller_layer: "AuthController (must handle new error)"
  api_layer: "REST API (new error code in response)"
  ui_layer: "Login form (new error message)"
  database_layer: "User table (new columns)"
  integration_layer: "Mobile app, third-party (new error handling)"
```

### Step 3: Choose Appropriate Strategy

```yaml
# For security feature with schema change
strategy: "targeted"  # or "full" for high-risk

scope:
  - component: "AuthService"
    priority: "P0"
  - component: "AuthController"
    priority: "P0"
  - component: "Login UI"
    priority: "P1"
  - component: "Database migration"
    priority: "P0"
```

## Corrected Example

See `example-001-login-lockout-regression.md` for complete regression analysis that:
- ✅ Identifies direct impacts (AuthService)
- ✅ Identifies indirect impacts (Controller, UI, Database)
- ✅ Identifies potential impacts (Admin features, Password reset)
- ✅ Uses appropriate strategy (targeted, not smoke)
- ✅ Discloses untested areas honestly

## Lesson

**Regression thinking is mandatory, not optional.** Every code change has ripple effects. The goal is not just to test "what changed" but to test "what might be affected by the change."

---

## References

- `specs/005-tester-core/spec.md` Section 6: BR-006 (Regression Thinking Is Required)
- `specs/005-tester-core/spec.md` Section 6: BR-003 (Coverage Boundaries)
- `specs/005-tester-core/plan.md` Section 4: P2-2 (regression-analysis Formalization)
