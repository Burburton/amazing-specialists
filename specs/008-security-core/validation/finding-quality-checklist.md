# Finding Quality Validation Checklist

## Document Status
- **Feature ID**: `008-security-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-27
- **Purpose**: Validate that individual findings meet quality bar (VM-003)

---

## Purpose

This checklist validates that each individual finding in security reports meets the quality requirements defined in `spec.md` Section 9 (VM-003).

---

## Validation Items

### F-001: has_location

**Check**: Does the finding have a specific location?

**Pass Criteria**:
- [ ] File path is specified
- [ ] Line number(s) are specified (start, optionally end)
- [ ] Location points to actual vulnerable code

**Valid Location Examples**:
```yaml
location:
  file: "src/services/AuthService.ts"
  line_start: 42
  line_end: 45
```

**Invalid Location Examples**:
```yaml
location: "somewhere in the auth module"  # Too vague
location: null                              # Missing
```

**Status**: ⬜ PASS | ⬜ FAIL

---

### F-002: has_severity

**Check**: Does the finding have a severity classification?

**Pass Criteria**:
- [ ] Severity field present
- [ ] Severity is one of: critical, high, medium, low, info
- [ ] Severity is appropriate for the vulnerability type

**Severity Justification Guide**:

| Vulnerability Type | Typical Severity |
|-------------------|------------------|
| SQL Injection | critical |
| Authentication Bypass | critical |
| Hardcoded Credentials | critical |
| Missing Authorization | high |
| Stored XSS | high |
| Path Traversal | high |
| Reflected XSS | medium |
| Missing Rate Limiting | medium |
| Verbose Error Messages | low |
| Missing Security Headers | low |

**Status**: ⬜ PASS | ⬜ FAIL

---

### F-003: has_rationale

**Check**: Does the finding explain why it's a vulnerability?

**Pass Criteria**:
- [ ] Description field present and non-empty
- [ ] Description explains the security issue
- [ ] Impact description provided
- [ ] Exploit scenario or attack vector described

**Valid Rationale Example**:
```yaml
description: "JWT signing key is hardcoded in source code"
impact:
  description: "Attacker with code access can forge any user token"
  exploit_scenario: |
    1. Attacker gains code repository access
    2. Extracts hardcoded JWT_SECRET value
    3. Generates valid JWT for admin user
```

**Invalid Rationale Example**:
```yaml
description: "Security issue"  # Too vague
impact: null                     # Missing
```

**Status**: ⬜ PASS | ⬜ FAIL

---

### F-004: has_remediation

**Check**: Does the finding provide remediation guidance?

**Pass Criteria**:
- [ ] Remediation recommendation present
- [ ] Code example provided (for non-info findings)
- [ ] Code example is complete and usable
- [ ] Effort/priority guidance provided

**Valid Remediation Example**:
```yaml
remediation:
  recommendation: "Move JWT secret to environment variable"
  code_example: |
    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET not configured')
    }
  effort: "quick"
  priority: "immediate"
```

**Invalid Remediation Example**:
```yaml
remediation:
  recommendation: "Fix this issue"  # Not actionable
  code_example: null                 # Missing code example
```

**Status**: ⬜ PASS | ⬜ FAIL

---

### F-005: not_vague

**Check**: Is the finding specific and actionable?

**Pass Criteria**:
- [ ] Finding identifies specific code, not general patterns
- [ ] Finding has specific vulnerability type
- [ ] Finding has CWE/OWASP reference
- [ ] Finding can be acted upon directly

**Vague Finding Indicators**:
- "This code may be insecure"
- "Consider improving security"
- "Validate inputs properly"
- "There might be an issue"

**Specific Finding Indicators**:
- "SQL injection at line 42 in UserRepository.ts"
- "Hardcoded JWT secret at JwtService.ts:12"
- "Missing authorization check on DELETE /users endpoint"

**Vagueness Detection Checklist**:
- [ ] Does finding mention specific file/line?
- [ ] Does finding name specific vulnerability type?
- [ ] Does finding explain specific attack vector?
- [ ] Would a developer know exactly what to fix?

**Status**: ⬜ PASS | ⬜ FAIL

---

## Validation Summary

| Check ID | Check Name | Status | Notes |
|----------|------------|--------|-------|
| F-001 | has_location | ⬜ | |
| F-002 | has_severity | ⬜ | |
| F-003 | has_rationale | ⬜ | |
| F-004 | has_remediation | ⬜ | |
| F-005 | not_vague | ⬜ | |

### Overall Finding Quality

- **PASS**: All 5 checks pass
- **FAIL**: One or more checks fail

---

## Finding Quality Score

Calculate quality score for a finding:

```
Score = (Passed Checks / Total Checks) × 100%

Pass Threshold: 100% (all checks must pass)
```

---

## Batch Validation

For validating multiple findings in a report:

### Validation Template

| Finding ID | F-001 | F-002 | F-003 | F-004 | F-005 | Overall |
|------------|-------|-------|-------|-------|-------|---------|
| SEC-001 | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| SEC-002 | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| ... | | | | | | |

### Summary Metrics

- Total Findings: ___
- Pass Count: ___
- Fail Count: ___
- Pass Rate: ___%

---

## Example Validation

### Example 1: High-Quality Finding

```yaml
- id: SEC-001
  severity: critical
  category: authentication
  title: "JWT Secret Hardcoded"
  description: "JWT signing key is directly written in source code"    # ✅ F-003
  location:                                                             # ✅ F-001
    file: "src/services/JwtTokenService.ts"
    line_start: 12
    line_end: 12
  vulnerability:
    type: "Hardcoded Credentials"
    cwe: "CWE-798"
    owasp: "A07:2021"
  impact:
    description: "Attacker with code access can forge any user token"
    exploit_scenario: |
      1. Attacker gains code access
      2. Extracts hardcoded key
      3. Forges admin token
  remediation:                                                          # ✅ F-004
    recommendation: "Use environment variable"
    code_example: |
      const JWT_SECRET = process.env.JWT_SECRET
    effort: quick
    priority: immediate
```

**Validation**:
- F-001: ✅ PASS (file and line specified)
- F-002: ✅ PASS (critical is valid and appropriate)
- F-003: ✅ PASS (description, impact, exploit scenario present)
- F-004: ✅ PASS (remediation with code example)
- F-005: ✅ PASS (specific file, line, vulnerability type)

**Overall**: ✅ PASS

### Example 2: Low-Quality Finding

```yaml
- id: SEC-002
  severity: bad                    # ❌ Invalid enum
  title: "Security Issue"
  description: "This may be insecure"  # ❌ Vague
  location: "auth module"              # ❌ Not specific
  remediation:
    recommendation: "Fix it"           # ❌ Not actionable
```

**Validation**:
- F-001: ❌ FAIL (no file/line, just "auth module")
- F-002: ❌ FAIL ("bad" is not valid severity)
- F-003: ❌ FAIL (no rationale, no impact)
- F-004: ❌ FAIL ("Fix it" is not actionable)
- F-005: ❌ FAIL (completely vague)

**Overall**: ❌ FAIL

---

## References

- `specs/008-security-core/spec.md` Section 9 - VM-003 validation requirements
- `specs/008-security-core/spec.md` Section 10 - Anti-patterns (AP-001 to AP-006)
- `quality-gate.md` Section 3.6 - Security quality gate

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial validation checklist |