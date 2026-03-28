# Example: User Authentication Feature Design

## Context

This example demonstrates `requirement-to-design` skill for a user authentication feature.

---

## Input Spec

```yaml
feature: User Authentication
goal: Enable secure user login with JWT tokens
scope:
  - Login API endpoint
  - Password verification
  - Token generation
  - Session management
acceptance_criteria:
  - Support username/password login
  - Return JWT Token on success
  - Handle error cases gracefully
constraints:
  - Use bcrypt for password hashing
  - Token validity: 24 hours
  - Reuse existing UserRepository
```

---

## Output Design Note

```yaml
design_note:
  background: |
    The application currently lacks authentication; all users access features 
    anonymously. This feature introduces secure login to protect sensitive 
    operations and enable user-specific functionality.

  feature_goal: |
    Enable secure user authentication with JWT token-based session management, 
    allowing users to log in with username/password and receive time-limited 
    tokens for subsequent API access.

  input_sources:
    - source: "specs/feature-user-auth/spec.md"
      type: "spec"
      mandatory: true
    - source: "package-spec.md"
      type: "governance"
      mandatory: true

  requirement_to_design_mapping:
    - requirement_id: "AC-001"
      requirement_text: "Support username/password login"
      design_decision: "Implement AuthController + AuthService layered architecture"
      rationale: "Separation of concerns: HTTP handling vs. business logic enables independent testing"
      artifact_section: "module_boundaries"

    - requirement_id: "AC-002"
      requirement_text: "Return JWT Token"
      design_decision: "Introduce JwtTokenService module for token lifecycle management"
      rationale: "Token management is orthogonal to auth logic; enables future token refresh"
      artifact_section: "module_boundaries"

    - requirement_id: "C-001"
      requirement_text: "Use bcrypt for password hashing"
      design_decision: "Integrate bcrypt in PasswordHasher utility"
      rationale: "Compliance with security constraint; industry standard"
      artifact_section: "design_summary"

    - requirement_id: "C-002"
      requirement_text: "Token validity 24 hours"
      design_decision: "JwtTokenService configured with 24h expiry"
      rationale: "Balance between security and user experience"
      artifact_section: "design_summary"

  design_summary: |
    Layered architecture with Controller-Service-Repository pattern:
    - AuthController handles HTTP request/response
    - AuthService contains business logic for authentication
    - JwtTokenService manages token generation and validation
    - PasswordHasher provides bcrypt-based password operations
    - UserRepository (existing) provides user data access

  constraints:
    - constraint_id: "C-001"
      description: "Use bcrypt for password hashing"
      source: "spec.md constraints"
      impact: "PasswordHasher module must use bcrypt library"
    - constraint_id: "C-002"
      description: "Token validity: 24 hours"
      source: "spec.md constraints"
      impact: "JwtTokenService must configure 24h expiry"
    - constraint_id: "C-003"
      description: "Reuse existing UserRepository"
      source: "spec.md constraints"
      impact: "AuthService depends on UserRepository interface"

  non_goals:
    - item: "User registration"
      rationale: "Separate feature; not in scope"
      future_consideration: true
    - item: "Password reset"
      rationale: "Separate feature; requires email infrastructure"
      future_consideration: true
    - item: "Social login (OAuth)"
      rationale: "Not in current scope; may be future extension"
      future_consideration: true
    - item: "Two-factor authentication"
      rationale: "Advanced feature; out of MVP scope"
      future_consideration: true

  assumptions:
    - assumption_id: "A-001"
      description: "UserRepository provides findByUsername method"
      risk_if_wrong: "AuthService interface would need modification"
      validation_method: "Check UserRepository interface documentation"
    - assumption_id: "A-002"
      description: "HTTPS enforced at infrastructure level"
      risk_if_wrong: "Credentials transmitted in clear text"
      validation_method: "Confirm with DevOps team"
    - assumption_id: "A-003"
      description: "System clock is synchronized across servers"
      risk_if_wrong: "Token validation may fail incorrectly"
      validation_method: "Verify NTP configuration"

  open_questions:
    - question_id: "Q-001"
      question: "Should we implement rate limiting for login attempts?"
      why_it_matters: "Prevents brute force attacks; affects AuthService interface"
      temporary_assumption: "Rate limiting handled by API gateway"
      impact_surface: "AuthService, monitoring, security posture"
      recommended_next_step: "Confirm with security team during review"
      blocker: false

  status: COMPLETE
```

---

## Key Transformation Points

1. **Requirement → Module**: "Support login" became AuthController + AuthService
2. **Requirement → Service**: "Return JWT" became JwtTokenService
3. **Constraint → Utility**: "Use bcrypt" became PasswordHasher
4. **Scope → Non-goals**: Registration, reset, OAuth explicitly excluded
5. **Gaps → Assumptions**: UserRepository interface, HTTPS, clock sync documented