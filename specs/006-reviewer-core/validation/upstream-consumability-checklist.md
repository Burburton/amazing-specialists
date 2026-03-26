# Upstream Consumability Checklist

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `006-reviewer-core` |
| **Document Type** | Validation Checklist |
| **Version** | 1.0.0 |
| **Created** | 2026-03-26 |
| **Status** | Draft |
| **Owner** | reviewer |
| **Aligned With** | `specs/003-architect-core/`, `specs/004-developer-core/`, `specs/005-tester-core/` |

---

## Purpose

Verify that reviewer correctly consumes outputs from `003-architect-core`, `004-developer-core`, and `005-tester-core` following the three-source triangulation model and BR-001/BR-002 compliance requirements.

This checklist ensures:
1. All upstream artifacts are systematically consumed
2. Self-check evidence is distinguished from independent review
3. Three-source triangulation is performed
4. Governance alignment checks are executed (AH-006)

---

## 1. Architect Artifact Consumption Checks

### 1.1 design-note Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `feature_goal` | [ ] Read and used as acceptance baseline | | |
| `background` | [ ] Understood for context | | |
| `input_sources` | [ ] Verified as requirements baseline | | |
| `requirement_to_design_mapping` | [ ] Each requirement tracked for verification | | |
| `requirement_to_design_mapping[].requirement_id` | [ ] All IDs verified against implementation | | |
| `requirement_to_design_mapping[].design_decision` | [ ] Compared against actual implementation | | |
| `requirement_to_design_mapping[].artifact_section` | [ ] Located in implementation | | |
| `constraints` | [ ] All constraints tracked | | |
| `constraints[].constraint_id` | [ ] Each constraint verified | | |
| `constraints[].description` | [ ] Implementation respects limitation | | |
| `constraints[].impact` | [ ] Assessed for significance | | |
| `non_goals` | [ ] Scope creep check performed | | |
| `non_goals[].item` | [ ] Checked for unauthorized implementation | | |
| `non_goals[].rationale` | [ ] Understood for exclusion reason | | |
| `assumptions` | [ ] All assumptions tracked for validation | | |
| `assumptions[].assumption_id` | [ ] Assumption holds verified | | |
| `assumptions[].risk_if_wrong` | [ ] High-risk assumptions prioritized | | |
| `assumptions[].validation_method` | [ ] Validation was executed | | |
| `open_questions` | [ ] All tracked for resolution status | | |
| `open_questions[].question_id` | [ ] Resolution status verified | | |
| `open_questions[].temporary_assumption` | [ ] Assumption validity checked | | |

### 1.2 module-boundaries Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `module_responsibilities` | [ ] All responsibilities verified against implementation | | |
| `module_responsibilities[].id` | [ ] Each responsibility tracked | | |
| `module_responsibilities[].description` | [ ] Implementation matches expected behavior | | |
| `module_responsibilities[].priority` | [ ] Core responsibilities prioritized in review | | |
| `explicit_non_responsibilities` | [ ] Verified as NOT implemented | | |
| `explicit_non_responsibilities[].description` | [ ] What module should NOT do checked | | |
| `explicit_non_responsibilities[].rationale` | [ ] Why excluded understood | | |
| `explicit_non_responsibilities[].may_belong_to` | [ ] Redirect checked if misfiled | | |

### 1.3 risks-and-tradeoffs Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `risks_introduced` | [ ] All identified risks tracked | | |
| `risks_introduced[].risk` | [ ] Mitigation verified implemented | | |
| `risks_introduced[].severity` | [ ] Critical/high risks prioritized | | |
| `risks_introduced[].mitigation_strategy` | [ ] Mitigation strategy verified | | |
| `risks_introduced[].mitigation_owner` | [ ] Owner addressed verified | | |
| `tradeoffs` | [ ] Trade-off decisions understood | | |
| `tradeoffs[].decision` | [ ] Implementation respects decision | | |
| `tradeoffs[].chosen_option` | [ ] Implementation aligns with choice | | |
| `tradeoffs[].rejected_options` | [ ] No backsliding to rejected options | | |

### 1.4 open-questions (AC-004) Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `question` | [ ] Resolution status verified in implementation | | |
| `temporary_assumption` | [ ] Still valid or resolved checked | | |
| `recommended_next_step` | [ ] Was executed verified | | |
| `impact_surface` | [ ] Affected components focused for verification | | |

---

## 2. Developer Artifact Consumption Checks

### 2.1 implementation-summary Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `goal_alignment` | [ ] Compared against architect design-goal | | |
| `goal_alignment.goal` | [ ] Triangulated with architect's feature_goal | | |
| `goal_alignment.achieved` | [ ] Claim verified independently (not just accepted) | | |
| `goal_alignment.deviations` | [ ] Assessed for acceptability | | |
| `changed_files` | [ ] All mapped to review targets | | |
| `changed_files[].path` | [ ] Each file reviewed | | |
| `changed_files[].change_type` | [ ] Review depth matches change type | | |
| `changed_files[].description` | [ ] Modification intent understood | | |
| `changed_files[].lines_changed` | [ ] Review scope estimated | | |
| `known_issues` | [ ] All acknowledged in review | | |
| `known_issues[].issue_id` | [ ] Tracked, not reported as new finding | | |
| `known_issues[].description` | [ ] Limitation understood | | |
| `known_issues[].severity` | [ ] Assessed if acceptable | | |
| `known_issues[].workaround` | [ ] Workaround verified if applicable | | |
| `risks` | [ ] All tracked for mitigation verification | | |
| `risks[].risk_id` | [ ] Each risk tracked | | |
| `risks[].description` | [ ] Assessed in review | | |
| `risks[].level` | [ ] High-risk areas prioritized | | |
| `risks[].mitigation` | [ ] Mitigation implemented verified | | |
| `risks[].owner` | [ ] Owner addressed verified | | |
| `tests_included` | [ ] Reviewed for baseline | | |
| `tests_included[].coverage` | [ ] Coverage assessed | | |

### 2.2 self-check-report Consumption (BR-002 CRITICAL)

**BR-002 COMPLIANCE IS CRITICAL**: Self-check is **input**, not **substitute** for independent review.

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `overall_status` | [ ] Distinguished from reviewer approval | | |
| `overall_status` | [ ] `PASS` does NOT equal reviewer approval | | |
| `summary.total_checks` | [ ] Understood as hint count | | |
| `summary.passed` | [ ] Used as hints, verified independently | | |
| `summary.failed` | [ ] Pre-identified issues acknowledged | | |
| `summary.blockers` | [ ] Verified blockers are fixed | | |
| `summary.warnings` | [ ] Considered in review focus | | |
| `check_results` | [ ] Used as hints, NOT evidence | | |

#### 2.2.1 Self-Check Spot-Check Requirements

Reviewer must spot-check at least **3 self-check items** for accuracy:

| Item | Verification | Status |
|------|--------------|--------|
| [ ] "Implementation matches task goal" | Verified independently | |
| [ ] "Files exist at declared paths" | Verified independently | |
| [ ] "Required fields present in artifacts" | Verified independently | |
| [ ] "No scope creep detected" | Verified independently | |
| [ ] "Constraints respected" | Verified independently | |
| [ ] Additional self-check item | Verified independently | |

### 2.3 bugfix-report Consumption (for Bugfix Review)

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `root_cause.category` | [ ] Failure type understood | | |
| `root_cause.description` | [ ] Deep understanding achieved | | |
| `root_cause.contributing_factors` | [ ] All factors identified | | |
| `fix_description` | [ ] Fix understood | | |
| `fix_verification` | [ ] Fix addresses root cause, not symptom verified | | |
| `tests_added` | [ ] Regression tests verified | | |
| `regression_risk` | [ ] Regression risk assessed | | |

---

## 3. Tester Artifact Consumption Checks

### 3.1 test-scope-report Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `goal_under_test.original_goal` | [ ] Compared against architect goal | | |
| `goal_under_test.test_interpretation` | [ ] Interpretation verified correct | | |
| `goal_under_test.acceptance_targets` | [ ] Used for acceptance decision | | |
| `in_scope_items` | [ ] Critical functionality covered verified | | |
| `in_scope_items[].item_id` | [ ] Each scope item tracked | | |
| `in_scope_items[].description` | [ ] Coverage understood | | |
| `in_scope_items[].category` | [ ] Category coverage assessed | | |
| `out_of_scope_items` | [ ] Exclusions justified verified | | |
| `out_of_scope_items[].item_id` | [ ] Each exclusion tracked | | |
| `out_of_scope_items[].description` | [ ] Exclusion reason understood | | |
| `out_of_scope_items[].reason` | [ ] Justification evaluated | | |
| `out_of_scope_items[].impact_assessment` | [ ] Risk factored into decision | | |

### 3.2 verification-report Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `execution_summary.total_tests` | [ ] Test count gauge reviewed | | |
| `execution_summary.passed` | [ ] Pass count primary success indicator | | |
| `execution_summary.failed` | [ ] Blocking if unresolved | | |
| `execution_summary.blocked` | [ ] Potential review blockers identified | | |
| `confidence_level.level` | [ ] Used as input for reviewer confidence | | |
| `confidence_level.rationale` | [ ] Evidence quality understood | | |
| `confidence_level.evidence_strength` | [ ] Assessed for decision | | |
| `coverage_gaps` | [ ] All reviewed for risk | | |
| `coverage_gaps[].gap_id` | [ ] Each gap tracked | | |
| `coverage_gaps[].description` | [ ] What's not tested understood | | |
| `coverage_gaps[].reason_uncovered` | [ ] Justification evaluated | | |
| `coverage_gaps[].risk_assessment` | [ ] Factored into decision | | |
| `coverage_gaps[].priority_to_address` | [ ] High-priority gaps flagged | | |
| `failed_cases` | [ ] All failures reviewed | | |
| `failed_cases[].case_id` | [ ] Failure status verified | | |
| `failed_cases[].severity` | [ ] Blocking impact assessed | | |

### 3.3 regression-risk-report Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `regression_surfaces` | [ ] All reviewed | | |
| `regression_surfaces[].surface_id` | [ ] Each surface tracked | | |
| `regression_surfaces[].module` | [ ] Affected module understood | | |
| `regression_surfaces[].functionality` | [ ] Impact surface understood | | |
| `regression_surfaces[].connection_type` | [ ] Connection type noted | | |
| `regression_surfaces[].likelihood` | [ ] Probability factored | | |
| `regression_surfaces[].impact_severity` | [ ] Impact prioritized | | |
| `regression_surfaces[].risk_score` | [ ] Used for prioritization | | |
| `untested_areas` | [ ] Risk from untested areas assessed | | |
| `recommended_smoke_tests` | [ ] Smoke test recommendations noted | | |

---

## 4. BR-002 Compliance: Self-Check vs Independent Review

### 4.1 Formal Distinction Checks

| Check | Status | Notes |
|-------|--------|-------|
| [ ] Self-check distinguished from independent review in findings report | | |
| [ ] Self-check used as hints, not evidence | | |
| [ ] Independent evidence collected for all critical claims | | |
| [ ] At least 3 self-check items spot-checked for accuracy | | |
| [ ] Reviewer decision does NOT rely solely on developer/tester claims | | |

### 4.2 BR-002 Compliance Matrix

| Aspect | Developer Self-Check | Tester Verification | Reviewer Independent Review | Check |
|--------|---------------------|---------------------|------------------------------|-------|
| **Executor** | developer | tester | reviewer | [ ] |
| **Timing** | Pre-delivery | Post-delivery | Post-verification | [ ] |
| **Purpose** | Validate own work | Provide evidence | Independent judgment | [ ] |
| **Evidence Type** | Self-reported | Independently observed | Triangulated from all sources | [ ] |
| **Can Approve** | No | No | Recommends only | [ ] |
| **Conflict of Interest** | Yes (inherent) | No | No | [ ] |

### 4.3 Prohibited vs Required Language

| Type | Language | Status |
|------|----------|--------|
| **PROHIBITED** | "Developer self-check passed, so we approve" | [ ] Not used |
| **PROHIBITED** | "Tester verified, so no need for independent review" | [ ] Not used |
| **PROHIBITED** | "Self-check covers everything, review complete" | [ ] Not used |
| **REQUIRED** | "Reviewer independently verified..." | [ ] Used |
| **REQUIRED** | "Evidence: [reviewer's own observations]" | [ ] Used |
| **REQUIRED** | "Developer self-check noted, independent verification performed" | [ ] Used |
| **REQUIRED** | "Tester evidence considered, reviewer conducted own analysis" | [ ] Used |

---

## 5. Three-Source Triangulation Checks

### 5.1 Goal Alignment Triangulation

| Source | Field | Check | Status |
|--------|-------|-------|--------|
| Architect | `design-note.feature_goal` | [ ] Design intent understood | |
| Developer | `implementation-summary.goal_alignment.goal` | [ ] Claim understood | |
| Tester | `test-scope-report.goal_under_test` | [ ] Test interpretation understood | |
| **Triangulation** | All three compared | [ ] Goal alignment verified | |

### 5.2 Scope Alignment Triangulation

| Source | Field | Check | Status |
|--------|-------|-------|--------|
| Architect | `design-note.non_goals` | [ ] Excluded scope understood | |
| Developer | `implementation-summary.changed_files` | [ ] Implementation scope understood | |
| Tester | `test-scope-report.out_of_scope_items` | [ ] Test exclusions understood | |
| **Triangulation** | All three compared | [ ] No scope creep detected | |

### 5.3 Risk Coverage Triangulation

| Source | Field | Check | Status |
|--------|-------|-------|--------|
| Architect | `risks-and-tradeoffs.risks_introduced` | [ ] Identified risks understood | |
| Developer | `implementation-summary.risks` | [ ] Implementation risks understood | |
| Tester | `verification-report.coverage_gaps` | [ ] Coverage gaps understood | |
| **Triangulation** | All three compared | [ ] All risks addressed | |

### 5.4 Constraint Compliance Triangulation

| Source | Field | Check | Status |
|--------|-------|-------|--------|
| Architect | `design-note.constraints` | [ ] Constraints understood | |
| Developer | `implementation-summary.deviation` | [ ] Deviations understood | |
| Tester | `verification-report.failed_cases` | [ ] Failures understood | |
| **Triangulation** | All three compared | [ ] Constraints respected | |

---

## 6. Governance Alignment Checks (AH-006)

### 6.1 Canonical Document Checks

| Document | Check | Severity if Violation | Status |
|----------|-------|----------------------|--------|
| `role-definition.md` | [ ] Role boundaries match implementation | major | |
| `package-spec.md` | [ ] Terminology consistent | major | |
| `io-contract.md` | [ ] Artifact formats aligned | major | |
| `quality-gate.md` | [ ] Severity levels used correctly | major | |
| `AGENTS.md` | [ ] Execution rules followed | major | |
| `README.md` | [ ] Status truthfulness (BR-009) | major | |

### 6.2 Role Boundary Verification

| Check | Reference | Status | Notes |
|-------|-----------|--------|-------|
| [ ] Reviewer does not implement developer responsibilities | role-definition.md Section 4 | | |
| [ ] Reviewer does not perform tester verification | role-definition.md Section 4 | | |
| [ ] Reviewer does not mutate production code (BR-007) | spec.md BR-007 | | |
| [ ] Reviewer provides feedback, not fixes | role-scope.md | | |

### 6.3 Terminology Verification

| Check | Reference | Status | Notes |
|-------|-----------|--------|-------|
| [ ] Uses 6-role terms (architect/developer/tester/reviewer/docs/security) | package-spec.md | | |
| [ ] No legacy 3-skill terminology in primary documents | AGENTS.md | | |

### 6.4 Artifact Format Verification

| Check | Reference | Status | Notes |
|-------|-----------|--------|-------|
| [ ] Artifact contracts follow io-contract.md structure | io-contract.md | | |
| [ ] Required fields present in all artifacts | contracts/*.md | | |

### 6.5 Severity Discipline Verification

| Check | Reference | Status | Notes |
|-------|-----------|--------|-------|
| [ ] Findings use blocker/major/minor/note from quality-gate.md | quality-gate.md Section 2.2 | | |
| [ ] Severity definitions followed correctly | quality-gate.md | | |

### 6.6 Status Truthfulness Verification (BR-009)

| Check | Reference | Status | Notes |
|-------|-----------|--------|-------|
| [ ] completion-report status matches README status | AGENTS.md AH-004 | | |
| [ ] No partial/known gaps undisclosed in README | AGENTS.md AH-004 | | |

---

## 7. Missing Data Handling

### 7.1 Missing Fields Identification

| Missing Source/Field | Impact | Action Taken | Escalated |
|---------------------|--------|--------------|-----------|
| `design-note` | [ ] Cannot verify design alignment | [ ] Requested from architect | [ ] Yes (BLOCKED) |
| `implementation-summary` | [ ] Cannot verify implementation claims | [ ] Requested from developer | [ ] Yes (BLOCKED) |
| `verification-report` | [ ] No independent test evidence | [ ] Increased review thoroughness | [ ] No |
| `self-check-report` | [ ] No pre-validation hints | [ ] Full independent review | [ ] No |
| `module-boundaries` | [ ] Cannot verify boundary compliance | [ ] Inferred from code structure | [ ] No |
| `test-scope-report` | [ ] Cannot understand test coverage | [ ] Assumed minimal coverage | [ ] No |
| `bugfix-report.root_cause` (bugfix) | [ ] Cannot verify fix completeness | [ ] Requested from developer | [ ] Yes (BLOCKED) |

### 7.2 Incomplete Output Handling

| Scenario | Adjustment | Action | Documentation |
|----------|------------|--------|---------------|
| design-note missing `requirement_to_design_mapping` | [ ] Derive from spec.md | [ ] Created own requirement list | [ ] Noted incomplete design-note |
| verification-report shows partial confidence | [ ] Increased independent verification | [ ] Manual review of low-confidence areas | [ ] Documented independent findings |
| self-check-report claims contradict evidence | [ ] Flagged as concern | [ ] Verified claims independently | [ ] Documented discrepancy |

### 7.3 Assumptions Documentation

| Assumption | Rationale | Impact if Wrong | Documented |
|------------|-----------|-----------------|------------|
| | | | [ ] |
| | | | [ ] |
| | | | [ ] |

### 7.4 Escalation Triggers

| Condition | Status | Escalation Level |
|-----------|--------|------------------|
| `design-note` completely missing | [ ] Yes [ ] No | Level 2 (architect + management) |
| `implementation-summary` claims contradict evidence | [ ] Yes [ ] No | Level 2 (developer + management) |
| `verification-report` shows critical failures not addressed | [ ] Yes [ ] No | Level 2 (developer + tester) |
| Governance alignment conflict detected | [ ] Yes [ ] No | Level 2 (architect + management) |
| Status truthfulness violation (BR-009) | [ ] Yes [ ] No | Level 2 (management) |
| Self-check claims PASS but evidence contradicts | [ ] Yes [ ] No | Level 2 (developer + management) |

---

## 8. Pre-Review Validation Checklist

Before beginning review, verify:

- [ ] `design-note` read and design intent understood
- [ ] `module-boundaries` read and constraints understood
- [ ] `risks-and-tradeoffs` read and decision rationale understood
- [ ] `open-questions` read and resolution status verified
- [ ] `implementation-summary` read and claims understood
- [ ] `self-check-report` read (as input, not evidence)
- [ ] `test-scope-report` read and test scope understood
- [ ] `verification-report` read and evidence assessed
- [ ] `regression-risk-report` read (if applicable)
- [ ] BR-002 compliance: Independent review planned (not relying on self-check)
- [ ] Three-source triangulation framework prepared
- [ ] Governance alignment checklist prepared (AH-006)

---

## 9. Post-Review Validation Checklist

After review, verify:

### 9.1 Consumption Completeness

- [ ] All three upstream sources (architect, developer, tester) were consumed
- [ ] Triangulation performed between sources
- [ ] Conflicts between sources identified and documented
- [ ] Self-check used as input, not substitute for independent review

### 9.2 Compliance Verification

- [ ] BR-001: Review began from structured upstream artifacts
- [ ] BR-002: Independent evidence collected (not just self-check)
- [ ] BR-003: Explicit decision state produced
- [ ] BR-004: Findings severity-classified
- [ ] BR-005: Rejection includes actionable feedback (if applicable)
- [ ] BR-006: Governance alignment checked (AH-006)
- [ ] BR-007: No code mutation during review
- [ ] BR-008: Scope creep detected and flagged
- [ ] BR-009: Status truthfulness verified

### 9.3 Artifact Quality

- [ ] `review-findings-report` has all required fields
- [ ] `acceptance-decision-record` has explicit decision state
- [ ] `actionable-feedback-report` has specific remediation (if rejection)
- [ ] All findings linked to evidence

---

## 10. Checklist Summary

| Category | Checks | Required |
|----------|--------|----------|
| Architect Artifact Consumption | 36 | All required |
| Developer Artifact Consumption | 33 | All required |
| Tester Artifact Consumption | 28 | All required |
| BR-002 Compliance | 18 | All required |
| Three-Source Triangulation | 16 | All required |
| Governance Alignment (AH-006) | 18 | All required |
| Missing Data Handling | 16 | All required |
| Pre-Review Validation | 12 | All required |
| Post-Review Validation | 17 | All required |
| **Total** | **194** | **All required** |

---

## References

- `specs/006-reviewer-core/spec.md` - Feature specification (Section 4.2, Section 6 Business Rules)
- `specs/006-reviewer-core/upstream-consumption.md` - Detailed consumption guide
- `specs/003-architect-core/contracts/design-note-contract.md` - Architect artifact schema
- `specs/003-architect-core/contracts/module-boundaries-contract.md` - Architect artifact schema
- `specs/003-architect-core/contracts/risks-and-tradeoffs-contract.md` - Architect artifact schema
- `specs/003-architect-core/contracts/open-questions-contract.md` - Architect artifact schema
- `specs/004-developer-core/contracts/implementation-summary-contract.md` - Developer artifact schema
- `specs/004-developer-core/contracts/self-check-report-contract.md` - Developer artifact schema
- `specs/004-developer-core/contracts/bugfix-report-contract.md` - Developer artifact schema
- `specs/005-tester-core/contracts/test-scope-report-contract.md` - Tester artifact schema
- `specs/005-tester-core/contracts/verification-report-contract.md` - Tester artifact schema
- `specs/005-tester-core/contracts/regression-risk-report-contract.md` - Tester artifact schema
- `role-definition.md` - 6-role definitions
- `quality-gate.md` - Severity level definitions (Section 2.2)
- `docs/audit-hardening.md` - AH-006 governance alignment rules

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial upstream consumability checklist for 006-reviewer-core |