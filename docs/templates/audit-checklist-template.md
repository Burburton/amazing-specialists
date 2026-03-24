# Feature Audit Checklist Template

**Feature ID**: `<feature-id>`  
**Audit Date**: `<date>`  
**Auditor**: `<name>`  
**Audit Version**: 1.0 (Audit Hardening Compliant)

---

## Instructions

1. Copy this template to `specs/<feature-id>/audit-checklist.md` before audit
2. Fill in all sections during `/spec-audit` execution
3. Reference `docs/audit-hardening.md` for detailed rules
4. All findings must have severity: blocker/major/minor/note

---

## 1. Feature Internal Completeness Check

### 1.1 Required Documents
| Check | Document | Status | Notes |
|-------|----------|--------|-------|
| [ ] | `specs/<feature>/spec.md` exists | | |
| [ ] | `specs/<feature>/plan.md` exists | | |
| [ ] | `specs/<feature>/tasks.md` exists | | |
| [ ] | `specs/<feature>/completion-report.md` exists | | |
| [ ] | All docs have required sections | | |

### 1.2 Acceptance Criteria
| AC ID | Status | Evidence | Notes |
|-------|--------|----------|-------|
| | PASS / FAIL / PARTIAL | | |

**Gap Analysis**:
- [ ] All ACs have corresponding implementation
- [ ] Failed/PARTIAL ACs have reasons documented

### 1.3 Artifacts
| Artifact | Declared Path | Exists | Format Valid | Notes |
|----------|--------------|--------|--------------|-------|
| | | Yes/No | Yes/No | |

**Finding**: 
- Artifact count matches spec: Yes/No

---

## 2. Canonical Alignment Check (AH-001)

### 2.1 Documents Checked
- [ ] `role-definition.md`
- [ ] `package-spec.md`
- [ ] `io-contract.md`
- [ ] `quality-gate.md`
- [ ] `README.md`

### 2.2 Role Definition Alignment
| Check | Status | Finding (if any) |
|-------|--------|------------------|
| Roles used match `role-definition.md` | | |
| Role boundaries consistent | | |
| No undefined roles | | |
| Legacy terms properly marked | | |

### 2.3 Package Spec Alignment
| Check | Status | Finding (if any) |
|-------|--------|------------------|
| Terminology matches `package-spec.md` | | |
| Skill classifications consistent | | |
| No conflicting capability claims | | |

### 2.4 IO Contract Alignment
| Check | Status | Finding (if any) |
|-------|--------|------------------|
| Payload formats match | | |
| Artifact formats match | | |
| Field definitions consistent | | |

### 2.5 Quality Gate Alignment
| Check | Status | Finding (if any) |
|-------|--------|------------------|
| Severity levels match `quality-gate.md` | | |
| Gate definitions consistent | | |

**Canonical Conflicts Found**:  
<!-- List all AH-001 findings with severity -->

| ID | Severity | Description | Recommendation |
|----|----------|-------------|----------------|
| | | | |

---

## 3. Cross-Document Consistency Check (AH-002)

### 3.1 Flow Order Consistency
| Check | Status | Finding |
|-------|--------|---------|
| Spec flow order = Plan flow order | Yes/No | |
| Plan flow order = Tasks flow order | Yes/No | |
| Flow matches README description | Yes/No | |

### 3.2 Role Boundary Consistency
| Check | Status | Finding |
|-------|--------|---------|
| Role descriptions consistent across docs | Yes/No | |
| No role overreach described | Yes/No | |
| Skill-to-role mapping correct | Yes/No | |

### 3.3 Stage Status Consistency
| Document | Declared Status | Canonical Status | Aligned |
|----------|----------------|------------------|---------|
| spec.md | | | Yes/No |
| plan.md | | | Yes/No |
| tasks.md | | | Yes/No |
| completion-report.md | | | Yes/No |
| README.md | | | Yes/No |

### 3.4 Terminology Consistency
| Term | Spec Definition | Plan Usage | Canonical Definition | Consistent |
|------|-----------------|------------|---------------------|------------|
| | | | | Yes/No |

**Cross-Doc Issues Found**:  
<!-- List all AH-002 findings with severity -->

| ID | Severity | Category | Description |
|----|----------|----------|-------------|
| | | flow_order / role_boundary / stage_status / terminology | |

---

## 4. Path Resolution Check (AH-003)

### 4.1 Spec Path Validation
| Declared Path | Actual Location | Resolves | Severity (if failed) |
|--------------|-----------------|----------|---------------------|
| | | Yes/No | |

### 4.2 Plan Path Validation
| Declared Path | Actual Location | Resolves | Severity (if failed) |
|--------------|-----------------|----------|---------------------|
| | | Yes/No | |

### 4.3 Tasks Path Validation
| Declared Path | Actual Location | Resolves | Severity (if failed) |
|--------------|-----------------|----------|---------------------|
| | | Yes/No | |

### 4.4 Completion-Report Path Validation
| Declared Path | Actual Location | Resolves | Severity (if failed) |
|--------------|-----------------|----------|---------------------|
| | | Yes/No | |

**Path Issues Found**:  
<!-- List all AH-003 findings with severity -->

| ID | Severity | Declared Path | Issue | Recommendation |
|----|----------|---------------|-------|----------------|
| | major/minor | | File not found / Wrong path | |

---

## 5. Status Truthfulness Check (AH-004)

### 5.1 Completion-Report Assessment
| Check | Status |
|-------|--------|
| Honest about gaps | Yes/No |
| All PARTIAL ACs disclosed | Yes/No |
| Gap descriptions specific | Yes/No |

**Completion-Report Status Classification**:
- [ ] a) Fully Complete (no gaps)
- [ ] b) Substantially Complete with Known Gaps
- [ ] c) Incomplete

**Declared Status**: 

### 5.2 README Assessment
| Check | Status |
|-------|--------|
| Feature status matches completion-report | Yes/No |
| Known gaps reflected (if any) | Yes/No |
| No misleading "COMPLETE" for partial | Yes/No |

**README Status Classification**:
- [ ] a) Fully Complete (no gaps)
- [ ] b) Substantially Complete with Known Gaps
- [ ] c) Incomplete

**Declared Status**: 

### 5.3 Alignment Check
| Check | Status |
|-------|--------|
| completion-report status = README status | Yes/No |
| Gap disclosure consistent | Yes/No |

**Status Issues Found**:  
<!-- List all AH-004 findings with severity -->

| ID | Severity | Issue | Recommendation |
|----|----------|-------|----------------|
| | major | README shows COMPLETE but completion-report has gaps | Sync README status |

---

## 6. README Governance Sync Check (AH-005)

### 6.1 Role Model Sync
| Check | Status | Finding |
|-------|--------|---------|
| README role list matches `role-definition.md` | Yes/No | |
| New roles documented (if any) | Yes/No/N/A | |
| Legacy roles properly marked | Yes/No | |

### 6.2 Workflow Sync
| Check | Status | Finding |
|-------|--------|---------|
| README flow matches `package-spec.md` | Yes/No | |
| New workflows documented (if any) | Yes/No/N/A | |

### 6.3 Feature Status Sync
| Check | Status | Finding |
|-------|--------|---------|
| Feature status table updated | Yes/No | |
| Status matches completion-report | Yes/No | |

### 6.4 Command Sync
| Check | Status | Finding |
|-------|--------|---------|
| Commands match `.opencode/commands/` | Yes/No | |
| New commands documented (if any) | Yes/No/N/A | |

**README Issues Found**:  
<!-- List all AH-005 findings with severity -->

| ID | Severity | Issue | Recommendation |
|----|----------|-------|----------------|
| | | | |

---

## 7. Findings Summary

### 7.1 Blocker Findings (Must Fix)
<!-- List all blocker severity findings -->

| ID | Rule | Category | Description | Location | Recommendation |
|----|------|----------|-------------|----------|----------------|
| | AH-00X | | | | |

### 7.2 Major Findings (Must Fix or Accept)
<!-- List all major severity findings -->

| ID | Rule | Category | Description | Location | Recommendation |
|----|------|----------|-------------|----------|----------------|
| | AH-00X | | | | |

### 7.3 Minor Findings (Should Fix)
<!-- List all minor severity findings -->

| ID | Rule | Category | Description | Recommendation |
|----|------|----------|-------------|----------------|
| | AH-00X | | | |

### 7.4 Notes (Informational)
<!-- List all note severity findings -->

| ID | Description |
|----|-------------|
| | |

---

## 8. Final Recommendation

### 8.1 Audit Conclusion
- [ ] **PASS** - All blocker/major findings resolved or accepted
- [ ] **PASS_WITH_WARNINGS** - Minor issues exist, don't affect usage
- [ ] **FAIL** - Unresolved blocker/major findings

### 8.2 Required Actions (Must Fix)
<!-- List actions that must be completed -->

1. 
2. 
3. 

### 8.3 Optional Improvements (Should Fix)
<!-- List recommended but optional improvements -->

1. 
2. 

### 8.4 Release/Closure Recommendation

**Recommendation**: ☐ RELEASE / ☐ CONDITIONAL_RELEASE / ☐ HOLD

**Rationale**: 


**Conditions for Release** (if conditional):
1. 
2. 

---

## 9. Audit Evidence

### Documents Reviewed
- [ ] `specs/<feature>/spec.md`
- [ ] `specs/<feature>/plan.md`
- [ ] `specs/<feature>/tasks.md`
- [ ] `specs/<feature>/completion-report.md`
- [ ] `specs/<feature>/data-model.md` (if exists)
- [ ] `specs/<feature>/contracts/` (if exists)
- [ ] `role-definition.md`
- [ ] `package-spec.md`
- [ ] `io-contract.md`
- [ ] `quality-gate.md`
- [ ] `README.md`
- [ ] Implementation files

### Tools Used
- [ ] `/spec-audit <feature>`
- [ ] `spec-implementation-diff` skill
- [ ] Manual review

---

## References

- `docs/audit-hardening.md` - Complete audit specification
- `quality-gate.md` Section 2.2 - Severity levels
- `role-definition.md` Section 4 - Reviewer responsibilities

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Auditor | | | |
| Reviewer | | | |
| Approval | | | |

---

*This audit checklist follows the audit hardening specification (v1.0) to ensure comprehensive governance alignment and prevent feature-level completion vs repository-level consistency drift.*
