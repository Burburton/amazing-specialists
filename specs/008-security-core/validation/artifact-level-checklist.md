# Artifact-Level Validation Checklist

## Document Status
- **Feature ID**: `008-security-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-27
- **Purpose**: Validate that security artifacts meet quality bar (VM-002)

---

## Purpose

This checklist validates that security artifacts (`security-review-report` and `input-validation-review-report`) meet the quality requirements defined in `spec.md` Section 9 (VM-002).

---

## Validation Items

### A-001: required_fields_present

**Check**: Are all required fields present in the artifact?

**Pass Criteria**:
- [ ] All required fields from contract exist
- [ ] No null/empty required fields
- [ ] Field types match contract definition

**For security-review-report**:
- [ ] `dispatch_id`
- [ ] `task_id`
- [ ] `scope.components_reviewed`
- [ ] `findings`
- [ ] `risk_assessment.overall_risk`
- [ ] `gate_decision.decision`
- [ ] `recommendations`

**For input-validation-review-report**:
- [ ] `dispatch_id`
- [ ] `task_id`
- [ ] `scope.inputs_reviewed`
- [ ] `findings`
- [ ] `validation_coverage`
- [ ] `risk_assessment.overall_risk`
- [ ] `gate_decision.decision`
- [ ] `recommendations`

**Status**: ⬜ PASS | ⬜ FAIL

**Evidence**:
```
Missing fields: 
Extra fields: 
```

---

### A-002: severity_classified

**Check**: Are all findings classified by severity?

**Pass Criteria**:
- [ ] Every finding has severity field
- [ ] Severity values match defined enum (critical/high/medium/low/info)
- [ ] No findings without severity
- [ ] Severity classification is reasonable

**Validation Steps**:
1. Review each finding in artifact
2. Verify severity field present
3. Verify severity is valid enum value
4. Assess if severity is appropriate for finding

**Status**: ⬜ PASS | ⬜ FAIL

**Evidence**:
```
Findings without severity: 
Invalid severity values: 
```

---

### A-003: evidence_based

**Check**: Are findings grounded in actual code evidence?

**Pass Criteria**:
- [ ] Each finding has location (file:line)
- [ ] Code snippet provided showing vulnerability
- [ ] Vulnerability type identified
- [ ] CWE/OWASP reference provided

**For security-review-report**:
- [ ] `location.file` present
- [ ] `code_snippet` present
- [ ] `vulnerability.type` present
- [ ] `vulnerability.cwe` present
- [ ] `vulnerability.owasp` present

**For input-validation-review-report**:
- [ ] `vulnerable_code.location` present
- [ ] `vulnerable_code.snippet` present
- [ ] `vulnerability.type` present
- [ ] `vulnerability.cwe` present

**Status**: ⬜ PASS | ⬜ FAIL

**Evidence**:
```
Findings without evidence: 
```

---

### A-004: remediation_actionable

**Check**: Is remediation guidance specific and actionable?

**Pass Criteria**:
- [ ] Each finding has remediation
- [ ] Remediation has recommendation text
- [ ] Remediation has code example (where applicable)
- [ ] Code example is complete and usable

**For security-review-report**:
- [ ] `remediation.recommendation` present
- [ ] `remediation.code_example` present (for non-info findings)

**For input-validation-review-report**:
- [ ] `remediation.recommendation` present
- [ ] `remediation.secure_code_example` present

**Status**: ⬜ PASS | ⬜ FAIL

**Evidence**:
```
Findings without actionable remediation: 
```

---

### A-005: gate_decision_present

**Check**: Is gate decision explicit and consistent?

**Pass Criteria**:
- [ ] `gate_decision.decision` field present
- [ ] Decision is valid enum (pass/needs-fix/block)
- [ ] Conditions listed if needs-fix or block
- [ ] Decision is consistent with findings severity

**Consistency Rules**:
- Critical finding → gate_decision should be block
- High finding → gate_decision should be block or needs-fix
- Only medium/low/info → gate_decision can be needs-fix or pass
- No findings → gate_decision should be pass

**Status**: ⬜ PASS | ⬜ FAIL

**Evidence**:
```
Gate decision: 
Findings severity: 
Consistent: 
```

---

## Validation Summary

| Check ID | Check Name | Status | Notes |
|----------|------------|--------|-------|
| A-001 | required_fields_present | ⬜ | |
| A-002 | severity_classified | ⬜ | |
| A-003 | evidence_based | ⬜ | |
| A-004 | remediation_actionable | ⬜ | |
| A-005 | gate_decision_present | ⬜ | |

### Overall Result

- **PASS**: All 5 checks pass
- **FAIL**: One or more checks fail

---

## Validation Execution

### For security-review-report Contract

| Check ID | Status | Evidence |
|----------|--------|----------|
| A-001 | ✅ PASS | All required fields defined in contract schema |
| A-002 | ✅ PASS | severity field required with enum validation |
| A-003 | ✅ PASS | location, code_snippet, vulnerability fields required |
| A-004 | ✅ PASS | remediation.recommendation and code_example required |
| A-005 | ✅ PASS | gate_decision.decision required with validation rules |

**Overall**: ✅ PASS

### For input-validation-review-report Contract

| Check ID | Status | Evidence |
|----------|--------|----------|
| A-001 | ✅ PASS | All required fields defined in contract schema |
| A-002 | ✅ PASS | severity field required with enum validation |
| A-003 | ✅ PASS | vulnerable_code.location and snippet required |
| A-004 | ✅ PASS | remediation.recommendation and secure_code_example required |
| A-005 | ✅ PASS | gate_decision.decision required with validation rules |

**Overall**: ✅ PASS

---

## Example Validation Results

### Valid Artifact Example

```yaml
# Example: Valid security-review-report
dispatch_id: "dispatch_001"          # ✅ Present
task_id: "T-001"                      # ✅ Present
scope:
  components_reviewed: [...]          # ✅ Present
findings:
  - id: "SEC-001"
    severity: "critical"              # ✅ Valid enum
    location:                          # ✅ Present
      file: "auth.ts"
      line_start: 12
    code_snippet: |                   # ✅ Present
      const secret = 'hardcoded'
    vulnerability:                     # ✅ Present
      cwe: "CWE-798"
      owasp: "A07:2021"
    remediation:                       # ✅ Present
      recommendation: "Use env var"
      code_example: |                 # ✅ Present
        const secret = process.env.SECRET
risk_assessment:
  overall_risk: "critical"            # ✅ Present
gate_decision:
  decision: "block"                   # ✅ Valid, consistent with critical finding
recommendations:
  must_fix: [...]                     # ✅ Present
```

### Invalid Artifact Example

```yaml
# Example: Invalid security-review-report
dispatch_id: "dispatch_001"
task_id: null                          # ❌ Required field is null
findings:
  - id: "SEC-001"
    severity: "bad"                    # ❌ Invalid enum value
    location: null                     # ❌ Missing evidence
    code_snippet: null
    remediation: null                  # ❌ Missing remediation
gate_decision:
  decision: "pass"                     # ❌ Inconsistent with critical severity
```

---

## References

- `specs/008-security-core/spec.md` Section 9 - VM-002 validation requirements
- `specs/008-security-core/contracts/security-review-report-contract.md` - Security report contract
- `specs/008-security-core/contracts/input-validation-review-report-contract.md` - Input validation report contract

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial validation checklist |