# Downstream Consumability Checklist

## Purpose
Verify that tester outputs can be consumed by downstream roles (reviewer, acceptance, developer).

---

## 1. Reviewer Consumption Checks

### 1.1 test-scope-report Checks

| Field | Check | Status |
|-------|-------|--------|
| `in_scope_items` | [ ] Clear scope boundaries defined | |
| `out_of_scope_items` | [ ] Exclusions documented with reasons | |
| `risk_priorities` | [ ] High-risk areas identified and prioritized | |
| `input_artifacts` | [ ] Developer artifacts consumed | |
| `goal_under_test` | [ ] Expected behavior clearly stated | |
| `changed_surface` | [ ] Files/modules under test listed | |
| `test_strategy` | [ ] Overall verification approach explained | |
| `assumptions` | [ ] Assumptions explicitly stated | |
| `environment_requirements` | [ ] Test environment documented | |
| `recommendation` | [ ] PROCEED/BLOCKED/ESCALATE appropriate | |

### 1.2 verification-report Checks

| Field | Check | Status |
|-------|-------|--------|
| `test_scope_reference` | [ ] Link to test-scope-report present | |
| `tests_added_or_run` | [ ] Tests created/modified/executed listed | |
| `execution_summary` | [ ] Overview of execution status clear | |
| `pass_cases` | [ ] Verified passing scenarios documented | |
| `failed_cases` | [ ] Failed scenarios with identifiers | |
| `failure_classification` | [ ] Failures classified per BR-004 | |
| `evidence` | [ ] Evidence present (not just "passed") | |
| `coverage_gaps` | [ ] Gaps disclosed per BR-003 | |
| `edge_cases_checked` | [ ] Edge conditions explicitly assessed | |
| `blocked_items` | [ ] Blockers documented | |
| `confidence_level` | [ ] FULL/PARTIAL/LOW with rationale | |
| `recommendation` | [ ] PASS_TO_REVIEW/REWORK/RETEST/ESCALATE | |

### 1.3 regression-risk-report Checks

| Field | Check | Status |
|-------|-------|--------|
| `change_anchor` | [ ] What change triggered analysis | |
| `regression_surfaces` | [ ] Adjacent impacted behaviors identified | |
| `existing_tests_reused` | [ ] Existing tests for regression confidence | |
| `new_regression_checks` | [ ] Additional checks for recurrence | |
| `untested_regression_areas` | [ ] Risk surfaces not yet covered | |
| `risk_ranking` | [ ] Severity/likelihood prioritization | |
| `follow_up_actions` | [ ] Recommended next actions | |
| `recommendation` | [ ] ACCEPT_RISK/REWORK/ESCALATE | |

---

## 2. Acceptance Layer Checks

### 2.1 Pass/Fail/Gap Summary

| Check | Status | Notes |
|-------|--------|-------|
| [ ] Pass/fail/gap summary clear and understandable | | |
| [ ] Confidence level justified by actual coverage | | |
| [ ] Gaps explained (not just listed) | | |
| [ ] Recommendation actionable | | |

### 2.2 Risk Level Assessment

| Check | Status | Notes |
|-------|--------|-------|
| [ ] Risk level understandable to non-technical stakeholder | | |
| [ ] Risk ranking includes severity and likelihood | | |
| [ ] Untested areas documented with impact | | |

### 2.3 Confidence Level (BR-007)

| Level | Criteria | Check |
|-------|----------|-------|
| **FULL** | [ ] Comprehensive coverage; all paths verified | |
| **PARTIAL** | [ ] Core paths verified; gaps acknowledged | |
| **LOW** | [ ] Significant gaps or blockers | |

### 2.4 BR-007 Compliance: Honesty Over False Confidence

| Prohibited (BR-007 Violation) | Check NOT Present | Status |
|-------------------------------|-------------------|--------|
| ❌ "FULL confidence" with non-empty `out_of_scope_items` | [ ] Absent | |
| ❌ "All tested" without traceable evidence | [ ] Absent | |
| ❌ "Works fine" without specific observations | [ ] Absent | |
| ❌ "No issues found" when testing was partial | [ ] Absent | |

| Required (BR-007 Compliant) | Check Present | Status |
|-----------------------------|---------------|--------|
| ✅ "PARTIAL confidence - core paths verified, gaps acknowledged" | [ ] Present | |
| ✅ "Evidence: [specific log/output/assertion]" | [ ] Present | |
| ✅ "Coverage gap: [specific area not tested]" | [ ] Present | |
| ✅ "Assumption: [explicit assumption made]" | [ ] Present | |

---

## 3. Developer Feedback Checks

### 3.1 Actionable Failures

| Check | Status | Notes |
|-------|--------|-------|
| [ ] Failures have reproducible steps | | |
| [ ] Failure classification helps developer prioritize | | |
| [ ] Gaps explained with context (not just listed) | | |
| [ ] Evidence traceable to specific test cases | | |

### 3.2 Failure Classification (BR-004)

Every failed test must be classified:

| Category | Definition | Check |
|----------|------------|-------|
| **Implementation Issue** | [ ] Bug in production code | |
| **Test Issue** | [ ] Bug in test code | |
| **Environment Issue** | [ ] External factor blocking test | |
| **Design/Spec Issue** | [ ] Ambiguity in requirements | |
| **Dependency/Upstream Issue** | [ ] External service/dependency failure | |

### 3.3 Evidence Quality

| Quality Level | Characteristics | Check |
|---------------|-----------------|-------|
| **HIGH** | [ ] Specific logs/outputs/assertions; Reproducible steps | |
| **MEDIUM** | [ ] General descriptions; Some evidence present | |
| **LOW** | [ ] "Tested locally" without details; No traceable evidence | |

**Required Evidence Format:**

| Evidence Type | Required Content | Check |
|---------------|------------------|-------|
| **Test Output** | [ ] File path, test name, result, count | |
| **Log Snippet** | [ ] Relevant log lines with context | |
| **Assertion** | [ ] Expected vs actual values | |
| **Manual Verification** | [ ] Steps taken, observations | |

---

## 4. Evidence Quality Checks

### 4.1 Traceability

| Check | Status | Notes |
|-------|--------|-------|
| [ ] Evidence traceable to test cases | | |
| [ ] Test cases traceable to requirements | | |
| [ ] Requirements traceable to goal_alignment | | |

### 4.2 Vague Evidence Detection

| Vague Pattern | Check NOT Present | Status |
|---------------|-------------------|--------|
| ❌ "Tested locally" | [ ] Absent | |
| ❌ "Looks good" | [ ] Absent | |
| ❌ "All tests passed" (no file/count) | [ ] Absent | |
| ❌ "No issues" (no scope context) | [ ] Absent | |

### 4.3 Partial Verification Marking

| Check | Status | Notes |
|-------|--------|-------|
| [ ] Partial verification marked as PARTIAL | | |
| [ ] Blocked items clearly documented | | |
| [ ] Assumptions explicitly stated | | |

---

## 5. Per-Role Artifact Mapping

### 5.1 reviewer Consumption

| Artifact | Section | Consumable | Notes |
|----------|---------|:----------:|-------|
| **test-scope-report** | `in_scope_items` | [ ] | |
| | `out_of_scope_items` | [ ] | |
| | `risk_priorities` | [ ] | |
| **verification-report** | `execution_summary` | [ ] | |
| | `evidence` | [ ] | |
| | `failed_cases` | [ ] | |
| | `confidence_level` | [ ] | |
| **regression-risk-report** | `regression_surfaces` | [ ] | |
| | `untested_regression_areas` | [ ] | |

### 5.2 acceptance Consumption

| Artifact | Section | Consumable | Notes |
|----------|---------|:----------:|-------|
| **verification-report** | `confidence_level` | [ ] | |
| | `pass_cases` | [ ] | |
| | `failed_cases` | [ ] | |
| | `coverage_gaps` | [ ] | |
| **regression-risk-report** | `risk_ranking` | [ ] | |
| | `recommendation` | [ ] | |

### 5.3 developer Consumption

| Artifact | Section | Consumable | Notes |
|----------|---------|:----------:|-------|
| **verification-report** | `failed_cases` | [ ] | |
| | `failure_classification` | [ ] | |
| | `coverage_gaps` | [ ] | |
| **regression-risk-report** | `regression_surfaces` | [ ] | |

---

## 6. Quality Gates

### 6.1 reviewer Gate

- [ ] Can judge quality from verification-report
- [ ] Can identify gaps from coverage_gaps
- [ ] Can assess risk from regression-risk-report
- [ ] Evidence quality sufficient for approval judgment

### 6.2 acceptance Gate

- [ ] Can understand pass/fail/gap from summary
- [ ] Can assess risk from confidence_level and risk_ranking
- [ ] Recommendation actionable
- [ ] Can make accept/reject/escalate decision

### 6.3 developer Gate

- [ ] Can understand actionable failures from classification
- [ ] Can reproduce failures from evidence
- [ ] Knows what needs additional testing from coverage_gaps
- [ ] Can implement fixes

---

## 7. Checklist Summary

| Category | Checks | Required |
|----------|--------|----------|
| Reviewer Consumption Checks | 29 | All required |
| Acceptance Layer Checks | 16 | All required |
| Developer Feedback Checks | 15 | All required |
| Evidence Quality Checks | 13 | All required |
| Per-Role Artifact Mapping | 18 | All required |
| Quality Gates | 12 | All required |
| **Total** | **103** | **All required** |

---

## References

- `specs/005-tester-core/spec.md` - Feature specification (Section 6 Business Rules, Section 7 Artifact Contracts)
- `specs/005-tester-core/downstream-interfaces.md` - Detailed handoff guide
- `specs/005-tester-core/role-scope.md` - Tester role scope (Section 5: Outputs)
- `role-definition.md` Section 4 - Reviewer role definition
- `quality-gate.md` Section 2.2 - Findings severity definitions

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial downstream consumability checklist for 005-tester-core |
