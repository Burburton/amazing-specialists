# Upstream Consumability Checklist

## Purpose
Verify that tester correctly consumes developer outputs from `004-developer-core`.

---

## 1. Artifact Reading Checks

### 1.1 implementation-summary Consumption

| Field | Check | Status |
|-------|-------|--------|
| `goal_alignment` | [ ] Read and understood | |
| `goal_alignment.goal` | [ ] Expected behavior derived | |
| `goal_alignment.achieved` | [ ] Test strategy informed (full/partial) | |
| `goal_alignment.deviations` | [ ] Acknowledged (not treated as bugs) | |
| `changed_files` | [ ] Mapped to test surface | |
| `changed_files[].path` | [ ] Each file has test coverage plan | |
| `changed_files[].change_type` | [ ] Test strategy matches change type | |
| `known_issues` | [ ] Acknowledged (not false positives) | |
| `known_issues[].issue_id` | [ ] Tracked in test report | |
| `known_issues[].workaround` | [ ] Verified where applicable | |
| `risks` | [ ] Prioritized for testing | |
| `risks[].level` | [ ] High risks receive thorough testing | |
| `risks[].mitigation` | [ ] Mitigations verified | |
| `tests_included` | [ ] Reviewed for baseline | |
| `tests_included[].coverage` | [ ] Coverage gaps identified | |

---

## 2. Self-Check Distinction (BR-002)

### 2.1 Formal Distinction Checks

| Check | Status | Notes |
|-------|--------|-------|
| [ ] Self-check distinguished from independent verification in report | | |
| [ ] Self-check used as hints, not evidence | | |
| [ ] Independent evidence collected for all claims | | |
| [ ] Self-check spot-checks completed (minimum 3 items) | | |
| [ ] Prohibited language avoided (e.g., "Developer verified") | | |
| [ ] Required language used (e.g., "Tester independently verified") | | |

### 2.2 BR-002 Compliance Matrix

| Aspect | Developer Self-Check | Tester Independent Verification | Check |
|--------|---------------------|--------------------------------|-------|
| **Executor** | developer | tester | [ ] |
| **Timing** | Pre-delivery | Post-delivery | [ ] |
| **Purpose** | Pre-delivery validation | Independent evidence | [ ] |
| **Evidence Type** | Self-reported | Independently observed | [ ] |
| **Consumer Trust** | Lower (hints only) | Higher (evidence) | [ ] |

### 2.3 Spot-Check Requirements

| Item | Verification | Status |
|------|--------------|--------|
| [ ] "Code compiles without errors" | Verified independently | |
| [ ] "No hardcoded secrets" | Verified independently | |
| [ ] "Input validation present" | Verified independently | |
| [ ] "Tests pass" | Re-run and verified | |
| [ ] Additional self-check item | Verified independently | |

---

## 3. Bugfix Integration

### 3.1 Root-Cause-Aware Testing

| Field | Check | Status |
|-------|-------|--------|
| `bugfix_report.root_cause.category` | [ ] Understood | |
| `bugfix_report.root_cause.description` | [ ] Deep understanding achieved | |
| `bugfix_report.root_cause.contributing_factors` | [ ] Identified | |
| `bugfix_report.fix_description` | [ ] Fix understood | |

### 3.2 Regression Test Design

| Check | Status | Notes |
|-------|--------|-------|
| [ ] Regression tests designed for root cause category | | |
| [ ] Regression tests designed for contributing factors | | |
| [ ] Original issue reproduction verified | | |
| [ ] Non-regression verification performed | | |

---

## 4. Missing Data Handling

### 4.1 Missing Fields Identification

| Missing Field | Impact | Action Taken | Escalated |
|---------------|--------|--------------|-----------|
| `goal_alignment` | [ ] Cannot derive expected behavior | [ ] Requested from developer | [ ] Yes (BLOCKED) |
| `changed_files` | [ ] Cannot identify test surface | [ ] Reviewed git diff manually | [ ] No (workaround exists) |
| `known_issues` | [ ] May report false positives | [ ] Tested conservatively | [ ] No |
| `risks` | [ ] Cannot prioritize | [ ] Tested all areas equally | [ ] No |
| `self-check-report` | [ ] No pre-validation hints | [ ] Increased test thoroughness | [ ] No |
| `bugfix-report.root_cause` | [ ] Cannot design regression tests | [ ] Requested from developer | [ ] Yes (BLOCKED) |

### 4.2 Assumptions Documentation

| Assumption | Rationale | Impact if Wrong | Documented |
|------------|-----------|-----------------|------------|
| | | | [ ] |
| | | | [ ] |
| | | | [ ] |

### 4.3 Escalation Triggers

| Condition | Status | Escalation Level |
|-----------|--------|------------------|
| `goal_alignment` completely missing | [ ] Yes [ ] No | Level 2 (developer + reviewer) |
| `bugfix-report.root_cause` missing | [ ] Yes [ ] No | Level 2 (developer + reviewer) |
| Self-check claims PASS but code doesn't compile | [ ] Yes [ ] No | Level 2 (developer + reviewer) |
| Multiple undocumented `known_issues` discovered | [ ] Yes [ ] No | Level 2 (developer + reviewer) |

---

## 5. BR-001 Compliance Check

### 5.1 Evidence-Based Testing

| Principle | Check | Status |
|-----------|-------|--------|
| Structured artifact consumption | [ ] Tester consumed structured developer artifacts | |
| No informal assumptions | [ ] No testing based on assumptions | |
| Field-by-field mapping | [ ] All fields mapped to test actions | |

### 5.2 Pre-Test Execution Consumption

Before beginning test execution, verify:

- [ ] `implementation-summary.goal_alignment` read and understood
- [ ] `implementation-summary.changed_files` mapped to test surface
- [ ] `implementation-summary.known_issues` acknowledged (not false positives)
- [ ] `implementation-summary.risks` prioritized for testing
- [ ] `implementation-summary.tests_included` reviewed
- [ ] `self-check-report` read (used as hints, not evidence)
- [ ] `bugfix-report.root_cause` read (if bugfix scenario)
- [ ] BR-002 compliance: Independent verification planned

---

## 6. Checklist Summary

| Category | Checks | Required |
|----------|--------|----------|
| Artifact Reading Checks | 15 | All required |
| Self-Check Distinction (BR-002) | 11 | All required |
| Bugfix Integration | 7 | If bugfix scenario |
| Missing Data Handling | 12 | All required |
| BR-001 Compliance | 9 | All required |
| **Total** | **54** | **All required** |

---

## References

- `specs/005-tester-core/spec.md` - Feature specification (Section 6 Business Rules)
- `specs/005-tester-core/upstream-consumption.md` - Detailed consumption guide
- `specs/004-developer-core/contracts/implementation-summary-contract.md` - Upstream artifact schema
- `specs/004-developer-core/contracts/self-check-report-contract.md` - Self-check schema
- `specs/004-developer-core/contracts/bugfix-report-contract.md` - Bugfix schema
- `role-definition.md` - 6-role definitions

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial upstream consumability checklist for 005-tester-core |
