# Skill-Level Validation Checklist

## Document Status
- **Feature ID**: `008-security-core`
- **Version**: 1.0.0
- **Status**: Complete
- **Created**: 2026-03-27
- **Purpose**: Validate that security skills meet quality bar (VM-001)

---

## Purpose

This checklist validates that security skills (`auth-and-permission-review` and `input-validation-review`) meet the quality requirements defined in `spec.md` Section 9 (VM-001).

---

## Validation Items

### V-001: inputs_defined

**Check**: Are required inputs clearly defined?

**Pass Criteria**:
- [ ] All required inputs listed in SKILL.md
- [ ] Each input has source (developer, tester, feature context)
- [ ] Each input has purpose documented
- [ ] Missing input handling documented

**Validation Steps**:
1. Open `.opencode/skills/security/{skill}/SKILL.md`
2. Locate Input/Output Specifications section
3. Verify required inputs are listed
4. Verify each input has source and purpose

**Status**: ⬜ PASS | ⬜ FAIL

**Evidence**: 
```
Location: 
Findings: 
```

---

### V-002: outputs_complete

**Check**: Are outputs completely defined with contracts?

**Pass Criteria**:
- [ ] Output artifact named
- [ ] Contract reference provided
- [ ] Output format described
- [ ] Consumer guidance present

**Validation Steps**:
1. Open SKILL.md
2. Locate Output Artifact section
3. Verify artifact name matches contract
4. Verify contract path is valid

**Status**: ⬜ PASS | ⬜ FAIL

**Evidence**: 
```
Location: 
Findings: 
```

---

### V-003: checklists_exist

**Check**: Are pre/during/post checklists present?

**Pass Criteria**:
- [ ] Pre-review checklist exists
- [ ] During-review checklist exists
- [ ] Post-review checklist exists
- [ ] Checklists are actionable items

**Validation Steps**:
1. Open SKILL.md
2. Locate Checklists section
3. Verify all three phases present
4. Verify items are checkable

**Status**: ⬜ PASS | ⬜ FAIL

**Evidence**: 
```
Location: 
Findings: 
```

---

### V-004: examples_exist

**Check**: Are working examples provided?

**Pass Criteria**:
- [ ] At least 2 examples present
- [ ] Examples demonstrate different scenarios
- [ ] Examples include complete input/output
- [ ] Examples follow contract format

**Validation Steps**:
1. Open SKILL.md
2. Locate Examples section
3. Count examples (minimum 2)
4. Verify examples are complete

**Status**: ⬜ PASS | ⬜ FAIL

**Evidence**: 
```
Location: 
Findings: 
```

---

### V-005: role_boundaries_clear

**Check**: Are role boundaries explicitly documented?

**Pass Criteria**:
- [ ] "What security does NOT do" section exists
- [ ] BR-006 (no code modification) explicitly stated
- [ ] Parallel execution with reviewer documented
- [ ] Escalation rules present

**Validation Steps**:
1. Open SKILL.md
2. Locate Role Boundaries section
3. Verify prohibitions listed
4. Verify BR-006 compliance stated

**Status**: ⬜ PASS | ⬜ FAIL

**Evidence**: 
```
Location: 
Findings: 
```

---

### V-006: vulnerability_reference_exists

**Check**: Are CWE/OWASP references present?

**Pass Criteria**:
- [ ] Vulnerability table includes CWE column
- [ ] Vulnerability table includes OWASP column
- [ ] References are accurate (verify against CWE/OWASP)
- [ ] Common vulnerabilities covered

**Validation Steps**:
1. Open SKILL.md
2. Locate Common Vulnerabilities table
3. Verify CWE column exists
4. Verify OWASP column exists
5. Spot-check accuracy of references

**Status**: ⬜ PASS | ⬜ FAIL

**Evidence**: 
```
Location: 
Findings: 
```

---

## Validation Summary

| Check ID | Check Name | Status | Notes |
|----------|------------|--------|-------|
| V-001 | inputs_defined | ⬜ | |
| V-002 | outputs_complete | ⬜ | |
| V-003 | checklists_exist | ⬜ | |
| V-004 | examples_exist | ⬜ | |
| V-005 | role_boundaries_clear | ⬜ | |
| V-006 | vulnerability_reference_exists | ⬜ | |

### Overall Result

- **PASS**: All 6 checks pass
- **FAIL**: One or more checks fail

---

## Validation Execution

### For auth-and-permission-review

| Check ID | Status | Evidence |
|----------|--------|----------|
| V-001 | ✅ PASS | Required inputs listed in Input/Output Specifications section |
| V-002 | ✅ PASS | Output artifact: security-review-report, contract reference provided |
| V-003 | ✅ PASS | Checklists section contains pre/during/post checklists |
| V-004 | ✅ PASS | 2 examples present: critical auth bypass, pass with suggestions |
| V-005 | ✅ PASS | Role Boundaries section with BR-006 prohibition |
| V-006 | ✅ PASS | Common Vulnerabilities table has CWE and OWASP columns |

**Overall**: ✅ PASS

### For input-validation-review

| Check ID | Status | Evidence |
|----------|--------|----------|
| V-001 | ✅ PASS | Required inputs listed in Input/Output Specifications section |
| V-002 | ✅ PASS | Output artifact: input-validation-review-report, contract reference provided |
| V-003 | ✅ PASS | Checklists section contains pre/during/post checklists |
| V-004 | ✅ PASS | 3 examples present: SQL injection, XSS, path traversal |
| V-005 | ✅ PASS | Role Boundaries section with BR-006 prohibition |
| V-006 | ✅ PASS | Common Vulnerabilities table has CWE references |

**Overall**: ✅ PASS

---

## References

- `specs/008-security-core/spec.md` Section 9 - VM-001 validation requirements
- `.opencode/skills/security/auth-and-permission-review/SKILL.md` - Auth review skill
- `.opencode/skills/security/input-validation-review/SKILL.md` - Input validation skill

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial validation checklist |