# Anti-Example 001: Vague Security Warning

## Document Status
- **Skill**: auth-and-permission-review
- **Anti-Pattern**: AP-001
- **Created**: 2026-03-27

---

## What Went Wrong

A security reviewer produced a vague finding without specific location, rationale, or remediation guidance.

### Bad Output

```yaml
security_review_report:
  scope: "Authentication module"
  findings:
    - id: SEC-001
      title: "Security Issue"
      description: "This code may be insecure."
      severity: medium
      # No location
      # No vulnerability type
      # No CWE/OWASP reference
      # No remediation
  risk_assessment: "Some issues found"
  gate_decision:
    decision: needs-fix
    # No conditions specified
```

---

## Why It's a Problem

### BR Violation: BR-001 (Security Must Be Actionable)

1. **Developer cannot act**: Without knowing which file/line, developer cannot fix
2. **No vulnerability type**: Developer doesn't know what to look for
3. **No remediation**: Developer has no guidance on how to fix
4. **Wastes time**: Developer must re-review entire module to find the issue

### Failure Mode Detection

From `skill-level-checklist.md`:
- ❌ `has_location`: No file or line number
- ❌ `has_vulnerability_type`: No CWE/OWASP classification
- ❌ `has_remediation`: No fix guidance

---

## Correct Approach

### Good Output

```yaml
security_review_report:
  scope: "Authentication module - JWT token handling"
  findings:
    - id: SEC-001
      severity: critical
      category: authentication
      title: "JWT Secret Hardcoded in Source Code"
      description: "JWT signing key is directly written in source code at line 12"
      location:
        file: "src/services/JwtTokenService.ts"
        line_start: 12
        line_end: 12
      vulnerability:
        type: "Hardcoded Credentials"
        cwe: "CWE-798"
        owasp: "A07:2021 - Identification and Authentication Failures"
      impact:
        description: "Attacker with code repository access can forge any user token"
        exploit_scenario: |
          1. Attacker gains access to code repository (public or compromised)
          2. Extracts hardcoded JWT_SECRET value from JwtTokenService.ts:12
          3. Generates valid JWT token with admin privileges
          4. Accesses admin endpoints with forged token
      remediation:
        recommendation: "Move JWT secret to environment variable with validation"
        code_example: |
          // Before (BAD):
          const JWT_SECRET = 'my-secret-key-12345'
          
          // After (GOOD):
          const JWT_SECRET = process.env.JWT_SECRET
          if (!JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable not configured')
          }
        effort: quick
        priority: immediate
  risk_assessment: critical
  gate_decision:
    decision: block
    conditions:
      - "SEC-001 must be fixed before any code can be deployed"
  recommendations:
    must_fix:
      - "SEC-001: Hardcoded JWT secret"
```

---

## Key Differences

| Aspect | Bad Output | Good Output |
|--------|------------|-------------|
| Location | Missing | File + line specified |
| Severity | Generic | Specific to vulnerability |
| Vulnerability Type | Missing | CWE-798, OWASP A07 |
| Description | "may be insecure" | Specific issue with impact |
| Remediation | Missing | Code example + effort/priority |
| Gate Decision | Vague | Specific conditions |

---

## Detection Checklist

When reviewing your own output:

- [ ] Every finding has `location.file` and `location.line_start`
- [ ] Every finding has `vulnerability.cwe` reference
- [ ] Every finding has specific description (not "may be insecure")
- [ ] Every finding has `remediation.code_example`
- [ ] Gate decision has specific conditions

---

## How to Fix This Anti-Pattern

1. **Always specify location**: Use file path and line numbers
2. **Use vulnerability taxonomy**: Reference CWE/OWASP
3. **Be specific**: Describe the exact issue, not vague concerns
4. **Provide remediation**: Include code example for fix
5. **Set clear gate conditions**: List what must be fixed

---

## References

- `specs/008-security-core/spec.md` Section 10 - AP-001 definition
- `specs/008-security-core/validation/anti-pattern-guidance.md` - Full guidance
- `specs/008-security-core/validation/finding-quality-checklist.md` - F-001 to F-005 checks
- `specs/008-security-core/contracts/security-review-report-contract.md` - Required fields

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial anti-example |