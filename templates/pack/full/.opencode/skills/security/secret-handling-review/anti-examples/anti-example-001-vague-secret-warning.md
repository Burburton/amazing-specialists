# Anti-Example 001: Vague Secret Warning

## Document Status
- **Skill**: secret-handling-review
- **Anti-Pattern**: AP-001
- **Created**: 2026-03-28

---

## What Went Wrong

A security reviewer produced a vague finding about secret handling without specific location, secret type, or remediation guidance.

### Bad Output

```yaml
secret_handling_review:
  scope: "Payment module"
  findings:
    - id: SEC-001
      title: "Secret Issue"
      description: "This code may expose secrets."
      severity: medium
      # No location
      # No secret_type
      # No vulnerability classification
      # No CWE/OWASP reference
      # No remediation
      # No code example
  risk_assessment: "Some issues found"
  gate_decision:
    decision: needs-fix
    # No conditions specified
```

---

## Why It's a Problem

### BR Violation: BR-001 (Security Must Be Actionable)

1. **Developer cannot act**: Without knowing which file/line, developer cannot fix
2. **No secret type**: Developer doesn't know what type of secret is exposed
3. **No remediation**: Developer has no guidance on how to fix
4. **Wastes time**: Developer must search entire module to find potential secrets
5. **False positive risk**: Without code evidence, finding may be incorrect

### Failure Mode Detection

From skill-level checklist:
- ❌ `has_location`: No file or line number
- ❌ `has_secret_type`: No classification (api_key, password, token, etc.)
- ❌ `has_vulnerability_type`: No CWE/OWASP classification
- ❌ `has_code_snippet`: No evidence of the secret
- ❌ `has_remediation`: No fix guidance

---

## Correct Approach

### Good Output

```yaml
secret_handling_review:
  scope:
    secrets_reviewed:
      - type: "api_key"
        location: "src/services/PaymentService.ts"
        description: "Stripe payment API key"
    
  findings:
    - id: SEC-001
      severity: critical
      category: hardcoded_secret
      title: "Stripe API Key Hardcoded in Source Code"
      description: |
        The Stripe payment API key is hardcoded directly in source code at 
        line 15. This is a live production key that can make real transactions.
      
      location:
        file: "src/services/PaymentService.ts"
        line_start: 15
        line_end: 15
        
      secret_type: "api_key"
      secret_value_pattern: "sk_live_*"
      
      vulnerability:
        type: "Hardcoded Credentials"
        cwe: "CWE-798"
        owasp: "A07:2021 - Identification and Authentication Failures"
        
      code_snippet: |
        // PaymentService.ts:15
        const STRIPE_API_KEY = 'sk_live_EXAMPLE_PLACEHOLDER_NOT_REAL_KEY'
        
      impact:
        description: "Attacker with code access can make unauthorized payment transactions"
        exploit_scenario: |
          1. Attacker gains repository access
          2. Extracts hardcoded STRIPE_API_KEY
          3. Uses Stripe API to process fraudulent charges
          4. Organization faces financial loss
        affected_systems: "Payment processing system"
        
      remediation:
        recommendation: "Move API key to environment variable with validation"
        code_example: |
          // Before (BAD):
          const STRIPE_API_KEY = 'sk_live_EXAMPLE_PLACEHOLDER_NOT_REAL_KEY'
          
          // After (GOOD):
          const STRIPE_API_KEY = process.env.STRIPE_API_KEY
          if (!STRIPE_API_KEY) {
            throw new Error('FATAL: STRIPE_API_KEY not configured')
          }
        effort: quick
        priority: immediate
        
  secret_management:
    storage_method: "hardcoded_source"
    rotation_enabled: false
    audit_enabled: false
    
  risk_assessment:
    overall_risk: critical
    
  gate_decision:
    decision: block
    conditions:
      - "SEC-001 must be fixed: Move API key to environment variable"
  recommendations:
    must_fix:
      - "SEC-001: Hardcoded Stripe API key"
```

---

## Key Differences

| Aspect | Bad Output | Good Output |
|--------|------------|-------------|
| Location | Missing | File + line specified |
| Secret Type | Missing | Classified as api_key |
| Severity | Generic | Critical (matches live key risk) |
| Vulnerability Type | Missing | CWE-798, OWASP A07 |
| Description | "may expose secrets" | Specific issue with pattern |
| Code Snippet | Missing | Shows actual hardcoded key |
| Remediation | Missing | Code example + effort/priority |
| Storage Assessment | Missing | secret_management section |
| Gate Decision | Vague | Specific conditions |

---

## Detection Checklist

When reviewing your own output:

- [ ] Every finding has `location.file` and `location.line_start`
- [ ] Every finding has `secret_type` classification
- [ ] Every finding has `vulnerability.cwe` reference
- [ ] Every finding has specific description (not "may expose secrets")
- [ ] Every finding has `code_snippet` showing the issue
- [ ] Every finding has `remediation.code_example`
- [ ] Gate decision has specific conditions
- [ ] `secret_management` section present

---

## How to Fix This Anti-Pattern

1. **Always specify location**: Use file path and line numbers
2. **Classify the secret**: Use secret_type (api_key, password, token, etc.)
3. **Use vulnerability taxonomy**: Reference CWE/OWASP
4. **Be specific**: Describe the exact issue, not vague concerns
5. **Show the code**: Provide code_snippet with the secret
6. **Provide remediation**: Include code example for fix
7. **Set clear gate conditions**: List what must be fixed
8. **Assess storage**: Include secret_management section

---

## Common Patterns to Search

When looking for hardcoded secrets, search for these patterns:

```regex
# API Keys
api_key|apiKey|API_KEY|secret_key|SECRET_KEY

# Passwords
password|PASSWORD|pwd|PWD|pass|PASS

# Tokens
token|TOKEN|auth_token|AUTH_TOKEN|access_token|ACCESS_TOKEN

# Private Keys
private_key|PRIVATE_KEY|privateKey|secret|SECRET

# AWS/Azure/GCP
aws_access_key|AWS_ACCESS_KEY|azure_key|AZURE_KEY|gcp_key|GCP_KEY

# Specific formats
sk_live_|pk_live_|AIza|ghp_|ghu_|AKIA|ASIA
```

---

## References

- `specs/008-security-core/validation/anti-pattern-guidance.md` - Full guidance
- `specs/008-security-core/validation/finding-quality-checklist.md` - Quality checks
- CWE-798: Use of Hard-coded Credentials

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial anti-example |