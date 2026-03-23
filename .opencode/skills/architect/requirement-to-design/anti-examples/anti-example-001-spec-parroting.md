# Anti-Example: Spec Parroting

## Problem

This anti-example demonstrates **AP-001: Spec Parroting** - restating the specification without design transformation.

---

## What NOT to Do

```yaml
# WRONG: Just copying spec without transformation
design_note:
  background: "Implement user login feature"  # Copied from spec goal
  
  feature_goal: "Support username/password login"  # Copied from spec
  
  design_summary: "Login feature as described in spec"  # No design thinking
  
  # Missing: requirement_to_design_mapping
  # Missing: module structure
  # Missing: interface definitions
  # Missing: design decisions
  # Missing: assumptions
  # Missing: open questions
```

---

## Why It's Wrong

1. **No design value added**: The output is just a reorganization of spec text
2. **No transformation**: Requirements are not converted to implementable structures
3. **No guidance**: Developer cannot start implementation from this
4. **No traceability**: Cannot verify if all requirements are addressed

---

## Correct Approach

```yaml
# RIGHT: Transform requirements into design structure
design_note:
  background: |
    The application currently lacks authentication; all users access features 
    anonymously. This feature introduces secure login to protect sensitive operations.

  feature_goal: |
    Enable secure user authentication with JWT token-based session management.

  requirement_to_design_mapping:
    - requirement_id: "AC-001"
      requirement_text: "Support username/password login"
      design_decision: "Implement AuthController + AuthService layered architecture"
      rationale: "Separation of concerns: HTTP handling vs. business logic"
      
    - requirement_id: "AC-002"
      requirement_text: "Return JWT Token"
      design_decision: "Introduce JwtTokenService module"
      rationale: "Token management is orthogonal to auth logic"

  design_summary: |
    Layered architecture with Controller-Service-Repository pattern.
    AuthController handles HTTP, AuthService contains business logic,
    JwtTokenService manages token lifecycle.

  assumptions:
    - assumption_id: "A-001"
      description: "UserRepository provides findByUsername method"
      risk_if_wrong: "AuthService interface would need modification"
      validation_method: "Check UserRepository documentation"
```

---

## Detection Checklist

- [ ] Does each section add technical structure beyond the spec?
- [ ] Is there an explicit `requirement_to_design_mapping` section?
- [ ] Are technical decisions made (patterns, interfaces, layers)?
- [ ] Can developer start implementation from this document alone?

---

## Prevention

1. Always create `requirement_to_design_mapping` table
2. Each requirement must map to at least one design decision
3. Include architectural patterns and module structure
4. Ask: "Does this add value beyond the spec?"