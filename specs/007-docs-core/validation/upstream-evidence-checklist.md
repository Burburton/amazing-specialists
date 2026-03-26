# Upstream Evidence Checklist

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `007-docs-core` |
| **Document Type** | Validation Checklist |
| **Version** | 1.0.0 |
| **Created** | 2026-03-27 |
| **Status** | Complete |
| **Owner** | reviewer |
| **Aligned With** | `specs/007-docs-core/upstream-consumption.md` |

---

## Purpose

Verify that docs correctly consumes outputs from `003-architect-core`, `004-developer-core`, `005-tester-core`, and `006-reviewer-core` following evidence-based consumption principles (BR-001). This checklist is used by the reviewer role to validate that documentation work is grounded in actual implementation evidence, not speculation.

This checklist ensures:
1. All upstream artifacts are systematically consumed
2. Evidence exists for every documentation change
3. BR-001 compliance: consume evidence, not speculation
4. Missing data is handled appropriately

---

## 1. BR-001 Compliance: Evidence-Based Consumption

### 1.1 Core Principle Verification

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Every `touched_section` cites a `consumed_artifact` | blocker | | |
| [ ] No documentation updates without artifact reference | blocker | | |
| [ ] Assumptions explicitly documented when artifacts incomplete | major | | |
| [ ] Evidence sources traceable to actual artifacts | major | | |

### 1.2 Evidence Traceability Format

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Source artifact type documented | major | | |
| [ ] Source artifact path documented | major | | |
| [ ] Specific field or value extracted documented | minor | | |

---

## 2. Architect Artifacts (003-architect-core)

### 2.1 design-note Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `feature_goal` | [ ] Read for feature description | | |
| `background` | [ ] Read for context | | |
| `constraints` | [ ] Tracked for limitations | | |
| `non_goals` | [ ] Tracked for scope boundaries | | |
| `assumptions` | [ ] Tracked for dependencies | | |
| `open_questions` | [ ] Tracked for pending decisions | | |

### 2.2 open-questions Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `question` | [ ] Tracked for known limitations | | |
| `temporary_assumption` | [ ] Documented in usage notes | | |
| `impact_surface` | [ ] Affected components identified | | |
| `recommended_next_step` | [ ] Pending work tracked | | |

### 2.3 When design-note Missing

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Documented in unresolved_ambiguities | major | | |
| [ ] Alternative evidence source identified | major | | |
| [ ] Not blocking if other sources sufficient | minor | | |

---

## 3. Developer Artifacts (004-developer-core)

### 3.1 implementation-summary Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `goal_alignment.goal` | [ ] Used for feature description | | |
| `goal_alignment.achieved` | [ ] Used for completion status | | |
| `goal_alignment.deviations` | [ ] Documented in changelog | | |
| `changed_files` | [ ] Used to identify touched sections | | |
| `known_issues` | [ ] Documented in known limitations | | |
| `risks` | [ ] Documented in risk section | | |

### 3.2 self-check-report Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `overall_status` | [ ] Used for quality indication | | |
| `blockers` | [ ] Tracked for unresolved issues | | |
| `warnings` | [ ] Tracked for potential concerns | | |

### 3.3 bugfix-report Consumption (for Bugfix Docs)

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `bug_id` | [ ] Referenced in changelog | | |
| `fix_summary` | [ ] Used in changelog entry | | |
| `root_cause` | [ ] Documented in post-mortem | | |
| `verification_status` | [ ] Used for release confidence | | |

### 3.4 When implementation-summary Missing

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Documented as blocker in unresolved_ambiguities | blocker | | |
| [ ] Cannot proceed with docs sync without this | blocker | | |

---

## 4. Tester Artifacts (005-tester-core)

### 4.1 verification-report Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `execution_summary` | [ ] Used for quality statement | | |
| `confidence_level` | [ ] Used for verification confidence | | |
| `coverage_gaps` | [ ] Documented in known limitations | | |
| `blocked_items` | [ ] Tracked for known issues | | |

### 4.2 regression-risk-report Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `risk_areas` | [ ] Documented in risk section | | |
| `mitigation_strategies` | [ ] Documented in usage guidance | | |

### 4.3 When verification-report Missing

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Documented in unresolved_ambiguities | major | | |
| [ ] Increased documentation caution applied | major | | |
| [ ] Not blocking if acceptance-decision-record available | minor | | |

---

## 5. Reviewer Artifacts (006-reviewer-core)

### 5.1 acceptance-decision-record Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `decision_state` | [ ] Used for README status determination | | |
| `decision_rationale` | [ ] Used for changelog context | | |
| `blocking_issues` | [ ] Tracked for known issues | | |
| `acceptance_conditions` | [ ] Tracked for follow-up | | |
| `governance_compliance.status_truthfulness` | [ ] Used for status alignment | | |

### 5.2 review-findings-report Consumption

| Field | Check | Status | Notes |
|-------|-------|--------|-------|
| `findings_by_severity` | [ ] Used for known issues | | |
| `governance_alignment_status` | [ ] Used for consistency checks | | |
| `governance_conflicts` | [ ] Used for sync requirements | | |

### 5.3 When acceptance-decision-record Missing

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Documented as blocker | blocker | | |
| [ ] Cannot determine actual feature status | blocker | | |
| [ ] docs-sync-report recommendation: blocked | blocker | | |

---

## 6. Feature Completion Context

### 6.1 completion-report Consumption

| Section | Check | Status | Notes |
|---------|-------|--------|-------|
| Deliverables | [ ] Used for changelog scope | | |
| Completion status | [ ] Used for README status | | |
| Known gaps | [ ] Documented in known limitations | | |
| Traceability | [ ] Verified requirements coverage | | |

### 6.2 spec.md Consumption

| Section | Check | Status | Notes |
|---------|-------|--------|-------|
| Background | [ ] Used for README overview | | |
| Goal | [ ] Used for feature description | | |
| Scope | [ ] Used for scope documentation | | |
| Acceptance Criteria | [ ] Used for status determination | | |

---

## 7. Evidence Existence Checks

### 7.1 Required Evidence for Status Updates

| Status Claim | Required Evidence | Check | Severity |
|--------------|-------------------|-------|----------|
| Complete | acceptance-decision-record with decision_state: accept | [ ] | blocker |
| Complete with Conditions | acceptance-decision-record with decision_state: accept-with-conditions | [ ] | blocker |
| Partially Complete | completion-report showing known_gaps | [ ] | major |
| In Progress | Any implementation evidence | [ ] | minor |

### 7.2 Required Evidence for Feature Description

| Claim Type | Required Evidence | Check | Severity |
|------------|-------------------|-------|----------|
| New capability | implementation-summary changed_files | [ ] | major |
| Capability change | implementation-summary changed_files | [ ] | major |
| Bug fix | bugfix-report | [ ] | major |
| Documentation update | docs-sync-report touched_sections | [ ] | major |

### 7.3 Required Evidence for Known Limitations

| Limitation Source | Required Evidence | Check | Severity |
|-------------------|-------------------|-------|----------|
| Implementation gap | implementation-summary known_issues | [ ] | major |
| Testing gap | verification-report coverage_gaps | [ ] | major |
| Review finding | review-findings-report findings | [ ] | major |
| Design constraint | design-note constraints | [ ] | minor |

---

## 8. Artifact Integrity Checks

### 8.1 Artifact Path Resolution

| Artifact Type | Expected Path Pattern | Check | Severity |
|---------------|----------------------|-------|----------|
| design-note | specs/003-architect-core/design-note.md | [ ] | major |
| implementation-summary | specs/00X-*/implementation-summary.md | [ ] | major |
| verification-report | specs/005-tester-core/verification-report.md | [ ] | major |
| acceptance-decision-record | specs/006-reviewer-core/acceptance-decision-record.md | [ ] | blocker |
| completion-report | specs/00X-*/completion-report.md | [ ] | major |

### 8.2 Artifact Completeness

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Referenced artifacts actually exist at declared paths | major | | |
| [ ] Referenced artifacts are complete (not partial) | major | | |
| [ ] Referenced artifacts are current (not outdated) | minor | | |

### 8.3 Artifact Version Consistency

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] All artifacts reference same feature/version | major | | |
| [ ] No conflicting information between artifacts | major | | |

---

## 9. Missing Data Handling

### 9.1 Missing Artifact Handling

| Artifact Missing | Impact | Required Action | Check |
|------------------|--------|-----------------|-------|
| design-note | Cannot verify design alignment | Document in unresolved_ambiguities | [ ] |
| implementation-summary | Cannot verify implementation claims | Mark as blocker | [ ] |
| verification-report | No independent test evidence | Increase caution, note in docs | [ ] |
| acceptance-decision-record | Cannot determine status | Mark as blocker | [ ] |
| completion-report | Missing deliverables info | Use other sources | [ ] |

### 9.2 Incomplete Artifact Handling

| Scenario | Adjustment | Check | Status |
|----------|------------|-------|--------|
| Required field missing | Document gap, use temporary_assumption | [ ] | |
| Conflicting information | Document conflict, potentially escalate | [ ] | |
| Outdated artifact | Note discrepancy, verify current state | [ ] | |

### 9.3 Escalation Triggers

| Condition | Escalation Level | Check |
|-----------|------------------|-------|
| acceptance-decision-record missing | Level 2 (reviewer + management) | [ ] |
| implementation-summary missing | Level 2 (developer + management) | [ ] |
| Conflicting status claims | Level 2 (all roles + management) | [ ] |
| Cannot determine feature status | Level 2 (management) | [ ] |

---

## 10. Pre-Docs-Sync Validation

Before docs sync begins, verify:

| Check | Status | Notes |
|-------|--------|-------|
| [ ] completion-report available and read | | |
| [ ] acceptance-decision-record available and read | | |
| [ ] implementation-summary available and read | | |
| [ ] verification-report available and read (if applicable) | | |
| [ ] spec.md available for reference | | |
| [ ] All evidence sources documented | | |
| [ ] BR-001 compliance verified | | |
| [ ] No speculation-based documentation planned | | |

---

## 11. Post-Docs-Sync Validation

After docs sync, verify:

| Check | Status | Notes |
|-------|--------|-------|
| [ ] All consumed artifacts documented in docs-sync-report | | |
| [ ] Every touched_section has evidence source | | |
| [ ] Status claims match acceptance-decision-record | | |
| [ ] Known limitations match completion-report gaps | | |
| [ ] No undocumented assumptions | | |

---

## 12. Pass/Fail Criteria

### 12.1 PASS Criteria

All of the following must be true:

| Criterion | Check |
|-----------|-------|
| [ ] acceptance-decision-record consumed (for status) | |
| [ ] implementation-summary consumed (for changes) | |
| [ ] All touched_sections have evidence sources | |
| [ ] BR-001 compliance verified | |
| [ ] No speculation-based documentation | |

### 12.2 FAIL Criteria

Any of the following causes FAIL:

| Criterion | Severity |
|-----------|----------|
| acceptance-decision-record not consumed for status claims | blocker |
| implementation-summary not consumed for change descriptions | blocker |
| Documentation changes without evidence | blocker |
| BR-001 violation (speculation-based documentation) | blocker |

---

## 13. Severity Levels

| Level | Definition | Action Required |
|-------|------------|-----------------|
| **blocker** | Must fix, blocks docs sync | Cannot proceed without resolution |
| **major** | Significant issue, affects quality | Document and require resolution |
| **minor** | Minor issue, improvement | Document for future improvement |

---

## 14. Checklist Summary

| Category | Checks | Blocker | Major | Minor |
|----------|--------|---------|-------|-------|
| BR-001 Compliance | 8 | 2 | 4 | 2 |
| Architect Artifacts | 10 | 0 | 6 | 4 |
| Developer Artifacts | 13 | 2 | 7 | 4 |
| Tester Artifacts | 8 | 0 | 5 | 3 |
| Reviewer Artifacts | 11 | 3 | 5 | 3 |
| Feature Completion Context | 8 | 0 | 5 | 3 |
| Evidence Existence Checks | 12 | 3 | 6 | 3 |
| Artifact Integrity Checks | 10 | 0 | 7 | 3 |
| Missing Data Handling | 15 | 0 | 10 | 5 |
| Pre-Docs-Sync Validation | 8 | 0 | 5 | 3 |
| Post-Docs-Sync Validation | 5 | 0 | 3 | 2 |
| Pass/Fail Criteria | 5 | 4 | 0 | 0 |
| **Total** | **113** | **14** | **63** | **35** |

---

## References

- `specs/007-docs-core/spec.md` BR-001, BR-003 - Evidence-based requirements
- `specs/007-docs-core/upstream-consumption.md` - Detailed consumption guide
- `specs/007-docs-core/contracts/docs-sync-report-contract.md` - Artifact schema
- `specs/003-architect-core/contracts/` - Architect artifact contracts
- `specs/004-developer-core/contracts/` - Developer artifact contracts
- `specs/005-tester-core/contracts/` - Tester artifact contracts
- `specs/006-reviewer-core/contracts/` - Reviewer artifact contracts
- `role-definition.md` Section 5 - Docs role definition

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial upstream evidence checklist |