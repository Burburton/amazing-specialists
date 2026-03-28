# Anti-Example 002: Scope Creep Blindness

## What This Shows

This anti-example demonstrates the **WRONG way** to perform spec-implementation diff by failing to detect scope creep - implementations that go beyond what the spec requires. This violates BR-008.

## The Anti-Pattern

### Scenario

A developer implemented a feature and added "bonus" functionality not specified in the spec. The reviewer focuses only on whether spec requirements are met, missing the unauthorized additions.

### Spec Requirements

```yaml
# spec.md
feature_id: "user-auth"
requirements:
  - id: "AUTH-001"
    description: "User can log in with username and password"
    
  - id: "AUTH-002"
    description: "User can log out"
    
  - id: "AUTH-003"
    description: "Session expires after 30 minutes of inactivity"

non_goals:
  - "Social login (OAuth, Google, GitHub)"
  - "Two-factor authentication"
  - "Password reset functionality"
```

### Implementation (What Was Actually Built)

```yaml
# implementation-summary.yaml
changed_files:
  - "src/auth/AuthService.ts"
  - "src/auth/OAuthService.ts"       # ⚠️ Not in spec!
  - "src/auth/TwoFactorService.ts"   # ⚠️ Not in spec!
  - "src/auth/PasswordResetService.ts"  # ⚠️ Not in spec!
  - "src/auth/SessionManager.ts"

new_endpoints:
  - "POST /auth/login"               # ✅ In spec
  - "POST /auth/logout"              # ✅ In spec
  - "GET /auth/oauth/google"         # ⚠️ Not in spec!
  - "GET /auth/oauth/github"         # ⚠️ Not in spec!
  - "POST /auth/2fa/enable"          # ⚠️ Not in spec!
  - "POST /auth/2fa/verify"          # ⚠️ Not in spec!
  - "POST /auth/password/reset"      # ⚠️ Not in spec!
```

### ❌ WRONG Approach: Scope Creep Blindness

```yaml
# INCORRECT: Reviewer only checks if spec requirements are met
spec_implementation_diff:
  summary:
    overall_status: aligned
    alignment_percentage: 100
    
  comparison:
    - category: "Requirements"
      items:
        - spec_item: "AUTH-001: Login"
          implementation_status: implemented
          alignment: aligned
          # ❌ WRONG: Says "aligned" but ignores OAuth addition
          
        - spec_item: "AUTH-002: Logout"
          implementation_status: implemented
          alignment: aligned
          
        - spec_item: "AUTH-003: Session timeout"
          implementation_status: implemented
          alignment: aligned
          
  # ❌ WRONG: No analysis of what was added beyond spec!
  additions: []  # Empty - reviewer didn't check for scope creep
  
  recommendation:
    action: approve  # ❌ WRONG: Approving unauthorized features
```

### Why This Is Wrong

1. **BR-008 Violation**: Scope creep detection is mandatory
2. **Unauthorized Features**: OAuth, 2FA, and password reset were explicitly in non_goals
3. **Maintenance Burden**: Code that wasn't requested now needs to be maintained
4. **Security Risk**: New auth mechanisms introduce attack surface
5. **Technical Debt**: "Bonus" features often lack proper testing and documentation

## The Correct Approach

### ✅ CORRECT: Detect and Report Scope Creep

```yaml
spec_implementation_diff:
  summary:
    overall_status: not_aligned
    alignment_percentage: 100  # Spec requirements met
    scope_creep_detected: true  # ✅ But scope creep exists
    
  comparison:
    - category: "Requirements"
      items:
        - spec_item: "AUTH-001: Login"
          implementation_status: implemented
          alignment: aligned
          # Note: Basic login works, but OAuth was also added
          
        - spec_item: "AUTH-002: Logout"
          implementation_status: implemented
          alignment: aligned
          
        - spec_item: "AUTH-003: Session timeout"
          implementation_status: implemented
          alignment: aligned
          
  # ✅ CORRECT: Analyze additions beyond spec
  additions:
    - addition: "OAuth login (Google, GitHub)"
      description: "Social login functionality not in spec"
      spec_reference: "non_goals: Social login (OAuth, Google, GitHub)"
      in_scope: false  # ⚠️ Explicitly out of scope
      files:
        - "src/auth/OAuthService.ts"
        - "src/auth/OAuthService.test.ts"
      severity: major
      
    - addition: "Two-factor authentication"
      description: "2FA functionality not in spec"
      spec_reference: "non_goals: Two-factor authentication"
      in_scope: false  # ⚠️ Explicitly out of scope
      files:
        - "src/auth/TwoFactorService.ts"
        - "src/auth/TwoFactorService.test.ts"
      severity: major
      
    - addition: "Password reset"
      description: "Password reset functionality not in spec"
      spec_reference: "non_goals: Password reset functionality"
      in_scope: false  # ⚠️ Explicitly out of scope
      files:
        - "src/auth/PasswordResetService.ts"
        - "src/auth/PasswordResetService.test.ts"
      severity: major
      
  scope_creep_summary:
    unauthorized_features: 3
    files_added_beyond_spec: 6
    new_endpoints_beyond_spec: 5
    estimated_additional_maintenance: "High"
    
  recommendation:
    action: request_changes  # ✅ CORRECT: Cannot approve with scope creep
    must_fix:
      - "Remove OAuth functionality (in non_goals)"
      - "Remove 2FA functionality (in non_goals)"
      - "Remove password reset functionality (in non_goals)"
    rationale: |
      Implementation includes features explicitly listed in non_goals.
      Per BR-008, scope creep must be identified as findings.
      Options:
      1. Remove unauthorized features, or
      2. Update spec to include these features (requires approval)
```

## Types of Scope Creep to Watch For

### Type 1: Explicit non_goals Violation

```yaml
# Most severe - spec explicitly says NOT to do this
spec:
  non_goals:
    - "Feature X"
    
implementation:
  added: "Feature X"  # ⚠️ severity: major
```

### Type 2: Implicit Scope Extension

```yaml
# Spec doesn't mention it, but it's a significant addition
spec:
  requirements:
    - "Basic user CRUD"
    
implementation:
  added: "User analytics dashboard"  # ⚠️ severity: major
```

### Type 3: API Surface Expansion

```yaml
# Spec defines limited API, implementation adds more
spec:
  api_endpoints:
    - "GET /users"
    
implementation:
  api_endpoints:
    - "GET /users"      # ✅ In spec
    - "POST /users"     # ⚠️ Not in spec - severity: major
    - "DELETE /users"   # ⚠️ Not in spec - severity: major
```

### Type 4: Behavior Enhancement

```yaml
# Spec says one thing, implementation does more
spec:
  behavior: "Send email on registration"
    
implementation:
  behavior: "Send email + SMS + push notification on registration"
  # ⚠️ SMS and push not in spec - severity: minor to major
```

## How to Detect Scope Creep

### Step 1: Read non_goals Carefully

```markdown
- [ ] Identify all items in spec's non_goals section
- [ ] Check if implementation includes any of these
- [ ] Flag as major finding if found
```

### Step 2: Compare Feature Lists

```markdown
- [ ] List all features in spec requirements
- [ ] List all features in implementation
- [ ] Identify features in implementation but not in spec
- [ ] Categorize by severity
```

### Step 3: Check API Surface

```markdown
- [ ] Compare spec API endpoints with implemented endpoints
- [ ] Flag any endpoints not in spec
- [ ] Check for new configuration options not in spec
```

### Step 4: Review Code Changes

```markdown
- [ ] Check file names for unexpected modules
- [ ] Look for new services not mentioned in spec
- [ ] Identify new dependencies added
```

## Scope Creep Detection Checklist

```yaml
scope_creep_checklist:
  explicit_non_goals:
    - checked: false
      instruction: "Compare implementation against spec's non_goals"
      
  feature_parity:
    - checked: false
      instruction: "Verify all implemented features are in spec"
      
  api_surface:
    - checked: false
      instruction: "Compare implemented endpoints with spec endpoints"
      
  configuration:
    - checked: false
      instruction: "Check for new config options not in spec"
      
  dependencies:
    - checked: false
      instruction: "Identify new dependencies for unauthorized features"
      
  file_analysis:
    - checked: false
      instruction: "Review new files for unexpected functionality"
```

## Real-World Consequences

### Example: OAuth Scope Creep

```
What happened:
  - Developer added "helpful" OAuth login
  - Not in spec, not tested as thoroughly
  - Security vulnerability in OAuth implementation
  - Affected production users
  - Required emergency patch

Could have been prevented:
  - Reviewer detecting scope creep
  - Either remove OAuth or properly spec/test it
```

## Summary

| Aspect | Anti-Pattern | Correct Pattern |
|--------|--------------|-----------------|
| non_goals check | Ignored | Explicitly checked against implementation |
| Feature comparison | Only verify spec is met | Also verify nothing extra was added |
| API surface | Not compared | Compared against spec |
| Additions section | Empty or missing | All additions documented with severity |
| Recommendation | May approve | Request changes if scope creep found |

## Related Rules

- **BR-008**: Scope Creep Detection Is Required - mandates detecting unauthorized features
- **AH-006**: Enhanced Reviewer Responsibilities
- **Quality Gate**: Scope creep findings are major or blocker severity