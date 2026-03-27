# Anti-Pattern Guidance

## Document Status
- **Feature ID**: `008-security-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-27
- **Purpose**: Document common security review failure patterns and prevention strategies

---

## Purpose

This document defines 6 anti-patterns that represent common failure modes in security reviews. Each anti-pattern includes:
- Definition
- Example
- Detection method
- Prevention strategy
- BR violation mapping

These anti-patterns align with `spec.md` Section 10 and support BR-001 through BR-008.

---

## Anti-Pattern Definitions

### AP-001: Vague Security Warning

**Definition**: Security finding without specific location, rationale, or remediation.

**Characteristics**:
- No file or line number
- Generic description ("may be insecure")
- No vulnerability type identified
- No code example showing issue
- No remediation guidance

**Example (Bad)**:
```yaml
findings:
  - id: SEC-001
    title: "Security Issue"
    description: "This code may be insecure."
    severity: medium
```

**Example (Good)**:
```yaml
findings:
  - id: SEC-001
    title: "JWT Secret Hardcoded"
    description: "JWT signing key is hardcoded at line 12"
    severity: critical
    location:
      file: "JwtTokenService.ts"
      line_start: 12
    code_snippet: |
      const JWT_SECRET = 'my-secret-key'
    remediation:
      recommendation: "Use environment variable"
      code_example: |
        const JWT_SECRET = process.env.JWT_SECRET
```

**Detection Method**:
- Check if finding has location field
- Check if finding has specific vulnerability type
- Check if finding has code snippet
- Check if finding has specific remediation

**Prevention Strategy**:
1. Require finding structure with mandatory fields
2. Use validation checklist (F-001 through F-005)
3. Review each finding for specificity
4. Reject vague findings during self-check

**BR Violation**: BR-001 (Security Must Be Actionable)

---

### AP-002: Missing Severity

**Definition**: Finding without severity classification.

**Characteristics**:
- No severity field
- Invalid severity value
- Severity doesn't match vulnerability type
- All findings marked as same severity (copypasta)

**Example (Bad)**:
```yaml
findings:
  - id: SEC-001
    title: "SQL Injection"
    description: "User input concatenated in SQL query"
    # Missing severity field
```

**Example (Good)**:
```yaml
findings:
  - id: SEC-001
    title: "SQL Injection"
    severity: critical  # Explicit severity
    description: "User input concatenated in SQL query"
```

**Detection Method**:
- Check severity field exists
- Validate severity is in enum (critical/high/medium/low/info)
- Check severity matches vulnerability type

**Prevention Strategy**:
1. Make severity a required field in finding schema
2. Use severity classification guide
3. Validate severity during report generation
4. Cross-check severity against vulnerability severity tables

**Severity Classification Guide**:

| Vulnerability | Typical Severity |
|--------------|------------------|
| SQL Injection | critical |
| Command Injection | critical |
| Hardcoded Credentials | critical |
| Authentication Bypass | critical |
| Authorization Bypass | high |
| Stored XSS | high |
| Path Traversal | high |
| Reflected XSS | medium |
| Missing Rate Limit | medium |
| Info Disclosure | low |
| Missing Security Headers | low |

**BR Violation**: BR-004 (Severity Classification)

---

### AP-003: False Positive Without Evidence

**Definition**: Claiming vulnerability without code evidence.

**Characteristics**:
- Finding without code snippet
- Claim contradicted by actual code
- Speculation without proof
- Over-reporting based on patterns without context

**Example (Bad)**:
```yaml
findings:
  - id: SEC-001
    title: "Potential SQL Injection"
    description: "This code might have SQL injection."
    # No code snippet showing vulnerability
    # No evidence that input is actually user-controlled
```

**Example (Good)**:
```yaml
findings:
  - id: SEC-001
    title: "SQL Injection in User Search"
    description: "Username parameter directly concatenated into SQL"
    vulnerable_code:
      location: "UserRepository.ts:25"
      snippet: |
        const query = `SELECT * FROM users WHERE username = '${username}'`
        return await db.query(query)
    exploit_scenario:
      payload: "' OR '1'='1' --"
      impact: "Attacker can read all user data"
```

**Detection Method**:
- Check if code snippet is provided
- Verify snippet shows actual vulnerability
- Check if data flow from input to sink is traced
- Verify exploit scenario is realistic

**Prevention Strategy**:
1. Require vulnerable code snippet for all findings
2. Trace data flow from input to vulnerable sink
3. Provide exploit scenario or payload
4. Verify finding before adding to report

**BR Violation**: BR-002 (Evidence-Based Findings)

---

### AP-004: No Remediation

**Definition**: Finding with no guidance on how to fix.

**Characteristics**:
- Finding without remediation field
- Generic advice ("fix this")
- No code example for fix
- No explanation of secure approach

**Example (Bad)**:
```yaml
findings:
  - id: SEC-001
    title: "Missing Authorization"
    description: "Endpoint lacks authorization check"
    severity: high
    # No remediation
```

**Example (Good)**:
```yaml
findings:
  - id: SEC-001
    title: "Missing Authorization on Delete Endpoint"
    description: "DELETE /users/:id lacks admin role check"
    severity: high
    remediation:
      recommendation: "Add role-based authorization guard"
      code_example: |
        @Delete('/users/:id')
        @Roles('admin')
        @UseGuards(RolesGuard)
        async deleteUser(@Param('id') id: string) {
          await this.userService.delete(id)
        }
      effort: quick
      priority: immediate
```

**Detection Method**:
- Check if remediation field exists
- Check if recommendation is specific
- Check if code example is provided
- Verify remediation directly addresses finding

**Prevention Strategy**:
1. Make remediation required for all non-info findings
2. Provide code example for fix
3. Include effort and priority guidance
4. Review remediation for actionability

**BR Violation**: BR-001 (Security Must Be Actionable)

---

### AP-005: Security Scope Creep

**Definition**: Implementing non-MVP security skills or reviewing out-of-scope areas.

**Characteristics**:
- Implementing secret-handling-review (deferred to M4)
- Implementing dependency-risk-review (deferred to M4)
- Reviewing non-security code quality
- Exceeding defined security scope

**Example (Bad)**:
```yaml
# Security reviewer implementing secret-handling-review
findings:
  - id: SEC-001
    title: "API Key in Configuration"
    description: "API key should be rotated"
    category: secret_handling  # Not in MVP scope
```

**Example (Good)**:
```yaml
# Security reviewer focused on MVP scope (auth/input validation)
findings:
  - id: SEC-001
    title: "Missing Authorization Check"
    category: authorization  # Within MVP scope
```

**MVP Scope Definition**:
- ✅ auth-and-permission-review
- ✅ input-validation-review
- ❌ secret-handling-review (M4)
- ❌ dependency-risk-review (M4)

**Detection Method**:
- Check finding category against MVP scope
- Verify only MVP skills are invoked
- Check if review covers only security-relevant code

**Prevention Strategy**:
1. Document explicit MVP scope boundaries
2. Track M4 backlog items separately
3. Use scope validation in review workflow
4. Flag scope violations during self-check

**BR Violation**: BR-005 (MVP Boundary Discipline)

---

### AP-006: Gate Decision Omission

**Definition**: Security report without explicit gate decision.

**Characteristics**:
- No gate_decision field
- No pass/needs-fix/block determination
- Report ends without conclusion
- Findings listed but no overall judgment

**Example (Bad)**:
```yaml
security_review_report:
  findings:
    - id: SEC-001
      severity: critical
      ...
  # Missing gate_decision
  # Report ends here
```

**Example (Good)**:
```yaml
security_review_report:
  findings:
    - id: SEC-001
      severity: critical
      ...
  gate_decision:
    decision: block
    conditions:
      - "Fix SEC-001 before proceeding"
```

**Detection Method**:
- Check gate_decision field exists
- Validate decision is valid enum (pass/needs-fix/block)
- Check conditions are listed if needs-fix or block

**Prevention Strategy**:
1. Make gate_decision required field
2. Auto-validate decision against findings
3. Require conditions for non-pass decisions
4. Block submission without gate_decision

**Gate Decision Logic**:
```
IF any critical findings THEN decision = block
ELSE IF any high findings THEN decision = block
ELSE IF any medium findings THEN decision = needs-fix
ELSE IF any low/info findings THEN decision = needs-fix
ELSE decision = pass
```

**BR Violation**: BR-003 (Gate Decision Required)

---

## Anti-Pattern Summary Table

| ID | Name | Definition | BR Violation | Detection |
|----|------|------------|--------------|-----------|
| AP-001 | Vague Security Warning | No specific location/remediation | BR-001 | Check finding structure |
| AP-002 | Missing Severity | No severity classification | BR-004 | Check severity field |
| AP-003 | False Positive Without Evidence | No code evidence | BR-002 | Check code snippet |
| AP-004 | No Remediation | No fix guidance | BR-001 | Check remediation field |
| AP-005 | Security Scope Creep | Non-MVP skills | BR-005 | Check scope boundaries |
| AP-006 | Gate Decision Omission | No pass/needs-fix/block | BR-003 | Check gate_decision |

---

## Prevention Checklist

Before submitting security report:

- [ ] Every finding has location (AP-001)
- [ ] Every finding has severity (AP-002)
- [ ] Every finding has code snippet (AP-003)
- [ ] Every finding has remediation (AP-004)
- [ ] All findings are within MVP scope (AP-005)
- [ ] Report has gate_decision (AP-006)

---

## References

- `specs/008-security-core/spec.md` Section 10 - Anti-patterns definition
- `specs/008-security-core/spec.md` Section 6 - Business Rules (BR-001 to BR-008)
- `specs/008-security-core/validation/finding-quality-checklist.md` - Finding validation
- `quality-gate.md` Section 3.6 - Security quality gate

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial anti-pattern guidance document |