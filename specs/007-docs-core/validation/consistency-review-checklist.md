# Consistency Review Checklist

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `007-docs-core` |
| **Document Type** | Validation Checklist |
| **Version** | 1.0.0 |
| **Created** | 2026-03-27 |
| **Status** | Complete |
| **Owner** | reviewer |
| **Aligned With** | `specs/007-docs-core/spec.md` BR-004, BR-005, BR-008 |

---

## Purpose

Validate cross-document consistency between README, completion-report, acceptance-decision-record, and other governance documents. This checklist is used by the reviewer role to verify that documentation maintains internal consistency and truthfulness (BR-004, BR-005, BR-008).

This checklist ensures:
1. BR-004: 6-Role Terminology Consistency
2. BR-005: Cross-Document Consistency
3. BR-008: Status Truthfulness
4. No contradictions between documents

---

## 1. BR-004: 6-Role Terminology Consistency

### 1.1 Formal Terminology Usage

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Uses 6-role terms: architect/developer/tester/reviewer/docs/security | major | | |
| [ ] No legacy 3-skill terminology in primary documents | major | | |
| [ ] Legacy terminology marked as "(legacy)" or "(transition)" where used | minor | | |

### 1.2 Terminology Consistency Across Documents

| Document Pair | Check | Severity | Status | Notes |
|---------------|-------|----------|--------|-------|
| README vs role-definition.md | [ ] Role terms consistent | major | | |
| README vs package-spec.md | [ ] Package terms consistent | major | | |
| completion-report vs README | [ ] Feature names consistent | major | | |
| acceptance-decision-record vs README | [ ] Decision terms consistent | major | | |

### 1.3 Prohibited Terminology Patterns

| Prohibited Pattern | Check NOT Present | Severity | Status |
|--------------------|-------------------|----------|--------|
| "spec-writer" in primary context | [ ] Absent | major | |
| "architect-auditor" in primary context | [ ] Absent | major | |
| "task-executor" in primary context | [ ] Absent | major | |
| Unmarked legacy terminology | [ ] Absent | minor | |

---

## 2. BR-005: Cross-Document Consistency

### 2.1 README Status vs Completion-Report

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Feature status in README matches completion-report | major | | |
| [ ] Known gaps in completion-report reflected in README | major | | |
| [ ] No "Complete" in README when completion-report shows partial | blocker | | |
| [ ] Deliverables count matches between documents | minor | | |

### 2.2 README Status vs Acceptance-Decision-Record

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] README status matches acceptance-decision-record decision_state | major | | |
| [ ] Accept conditions reflected if decision_state: accept-with-conditions | major | | |
| [ ] Rejection reflected as In Progress or Blocked | major | | |

### 2.3 Status Mapping Verification

| acceptance-decision-record state | Expected README Status | Check |
|----------------------------------|------------------------|-------|
| accept | Complete | [ ] Matches |
| accept-with-conditions | Complete (with conditions) | [ ] Matches |
| reject | In Progress | [ ] Matches |
| needs-clarification | Blocked | [ ] Matches |

### 2.4 Skills Inventory vs Skill Directories

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] All skills in README exist in .opencode/skills/ | major | | |
| [ ] All skills in .opencode/skills/ documented in README | major | | |
| [ ] Skill descriptions match between README and SKILL.md | minor | | |

### 2.5 Feature Table Consistency

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Feature IDs consistent across all documents | major | | |
| [ ] Feature names consistent across all documents | major | | |
| [ ] Feature status consistent across all documents | major | | |

---

## 3. BR-008: Status Truthfulness

### 3.1 Status Accuracy Verification

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Status reflects actual completion evidence | blocker | | |
| [ ] No status inflation (overstating completeness) | blocker | | |
| [ ] No status deflation (hiding actual completion) | major | | |

### 3.2 Partial Completion Disclosure

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] "Substantially Complete with Known Gaps" clearly stated | major | | |
| [ ] Known gaps listed explicitly | major | | |
| [ ] No misrepresentation as "Fully Complete" | blocker | | |

### 3.3 Known Gaps Disclosure

| Source | Check | Severity | Status | Notes |
|--------|-------|----------|--------|-------|
| completion-report known_gaps | [ ] Reflected in README | major | | |
| verification-report coverage_gaps | [ ] Reflected in limitations | major | | |
| acceptance-decision-record conditions | [ ] Reflected in status | major | | |

### 3.4 Status Inflation Detection

| Inflation Pattern | Check NOT Present | Severity | Status |
|-------------------|-------------------|----------|--------|
| "Complete" when completion-report shows gaps | [ ] Absent | blocker | |
| "Fully Complete" when acceptance has conditions | [ ] Absent | blocker | |
| Omitting known limitations | [ ] Absent | major | |
| Hiding partial status | [ ] Absent | major | |

---

## 4. Document Version Consistency

### 4.1 Version Alignment

| Document | Check | Severity | Status | Notes |
|----------|-------|----------|--------|-------|
| spec.md version | [ ] Consistent with plan.md | minor | | |
| plan.md version | [ ] Consistent with tasks.md | minor | | |
| completion-report version | [ ] Matches current feature state | minor | | |

### 4.2 Date Consistency

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Completion dates consistent across documents | minor | | |
| [ ] Update dates reflect actual changes | minor | | |

---

## 5. Governance Document Consistency

### 5.1 Canonical Document Alignment

| Canonical Document | Check | Severity | Status | Notes |
|--------------------|-------|----------|--------|-------|
| role-definition.md | [ ] Role boundaries match implementation | major | | |
| package-spec.md | [ ] Terminology consistent | major | | |
| io-contract.md | [ ] Artifact formats aligned | major | | |
| quality-gate.md | [ ] Severity levels used correctly | major | | |
| AGENTS.md | [ ] Execution rules followed | major | | |

### 5.2 Role Boundary Consistency

| Check | Reference | Severity | Status | Notes |
|-------|-----------|----------|--------|-------|
| [ ] Docs does not implement developer responsibilities | role-definition.md Section 5 | major | | |
| [ ] Docs does not perform tester verification | role-definition.md Section 5 | major | | |
| [ ] Docs does not mutate production code (BR-007) | spec.md BR-007 | major | | |

---

## 6. Cross-Reference Validation

### 6.1 Reference Resolution

| Reference Type | Check | Severity | Status | Notes |
|----------------|-------|----------|--------|-------|
| File paths | [ ] All paths resolve to existing files | major | | |
| Feature IDs | [ ] All IDs reference existing features | major | | |
| BR references | [ ] All BR numbers valid in spec.md | minor | | |
| Artifact references | [ ] All artifacts exist at declared paths | major | | |

### 6.2 Path Resolution (AH-003)

| Declared Path | Resolves | Status | Notes |
|---------------|:--------:|--------|-------|
| | [ ] | | |
| | [ ] | | |
| | [ ] | | |

---

## 7. Consistency Violation Severity

### 7.1 Severity Classification

| Violation Type | Severity | Definition |
|----------------|----------|------------|
| Status inflation | blocker | Misrepresenting incomplete as complete |
| Terminology conflict | major | Using different terms for same concept |
| Status misalignment | major | Documents showing different status |
| Path resolution failure | major | Referenced file does not exist |
| Version mismatch | minor | Document versions inconsistent |

### 7.2 Conflict Resolution

| Conflict Type | Resolution Action | Check |
|---------------|-------------------|-------|
| Status conflict | Use acceptance-decision-record as source of truth | [ ] |
| Terminology conflict | Use role-definition.md as source of truth | [ ] |
| Path conflict | Verify actual file location | [ ] |

---

## 8. Pre-Consistency Review Checklist

Before consistency review, verify:

| Check | Status | Notes |
|-------|--------|-------|
| [ ] README.md read and current state understood | | |
| [ ] completion-report.md read for status comparison | | |
| [ ] acceptance-decision-record read for decision state | | |
| [ ] role-definition.md referenced for terminology | | |
| [ ] package-spec.md referenced for package model | | |
| [ ] AGENTS.md referenced for governance rules | | |

---

## 9. Post-Consistency Review Checklist

After consistency review, verify:

| Check | Status | Notes |
|-------|--------|-------|
| [ ] All cross-document checks performed | | |
| [ ] All inconsistencies documented | | |
| [ ] Severity assigned to each finding | | |
| [ ] Resolution recommendations documented | | |
| [ ] docs-sync-report consistency_checks populated | | |

---

## 10. Pass/Fail Criteria

### 10.1 PASS Criteria

All of the following must be true:

| Criterion | Check |
|-----------|-------|
| [ ] No blocker-level consistency violations | |
| [ ] README status matches acceptance-decision-record | |
| [ ] Known gaps reflected in README | |
| [ ] No status inflation (BR-008) | |
| [ ] Terminology consistent (BR-004) | |

### 10.2 FAIL Criteria

Any of the following causes FAIL:

| Criterion | Severity |
|-----------|----------|
| Status inflation detected | blocker |
| Known gaps hidden in README | blocker |
| Two or more major consistency violations | major |
| Critical terminology conflict | major |

---

## 11. Severity Levels

| Level | Definition | Action Required |
|-------|------------|-----------------|
| **blocker** | Must fix, blocks acceptance | Return to docs for correction |
| **major** | Significant inconsistency, affects understanding | Document and require resolution |
| **minor** | Minor inconsistency, improvement | Document for future improvement |

---

## 12. Checklist Summary

| Category | Checks | Blocker | Major | Minor |
|----------|--------|---------|-------|-------|
| BR-004: Terminology Consistency | 10 | 0 | 8 | 2 |
| BR-005: Cross-Document Consistency | 15 | 1 | 10 | 4 |
| BR-008: Status Truthfulness | 12 | 4 | 6 | 2 |
| Document Version Consistency | 4 | 0 | 0 | 4 |
| Governance Document Consistency | 8 | 0 | 8 | 0 |
| Cross-Reference Validation | 6 | 0 | 4 | 2 |
| Pre/Post Review Checklists | 13 | 0 | 5 | 8 |
| Pass/Fail Criteria | 5 | 3 | 1 | 0 |
| **Total** | **73** | **8** | **42** | **22** |

---

## References

- `specs/007-docs-core/spec.md` BR-004, BR-005, BR-008 - Consistency requirements
- `specs/007-docs-core/contracts/docs-sync-report-contract.md` - consistency_checks field
- `role-definition.md` - 6-role terminology definitions
- `package-spec.md` - Package model terminology
- `AGENTS.md` - Audit Hardening Rule (AH-001 to AH-006)
- `quality-gate.md` - Severity level definitions

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial consistency review checklist |