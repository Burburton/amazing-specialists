# Docs Sync Report Checklist

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `007-docs-core` |
| **Document Type** | Artifact Validation Checklist |
| **Version** | 1.0.0 |
| **Created** | 2026-03-27 |
| **Status** | Complete |
| **Owner** | reviewer |
| **Aligned With** | `specs/007-docs-core/contracts/docs-sync-report-contract.md` |

---

## Purpose

Validate that `docs-sync-report` artifacts meet all structural, content, and business rule requirements before acceptance. This checklist is used by the reviewer role to verify documentation synchronization outputs from the docs role.

This checklist ensures:
1. All 8 required fields are present and valid
2. BR-001, BR-002, BR-003, BR-005 compliance verified
3. Evidence-based documentation validated
4. Cross-document consistency verified

---

## 1. Structural Validation

### 1.1 Metadata Fields

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `dispatch_id` | [ ] Present and non-empty | major | | |
| `task_id` | [ ] Present and non-empty | major | | |
| `created_at` | [ ] Valid timestamp format | minor | | |
| `created_by` | [ ] Value is "docs" | major | | |

### 1.2 Required Fields (AC-001: 8 fields)

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `sync_target` | [ ] Present with all sub-fields | blocker | | |
| `sync_target.feature_id` | [ ] Valid feature ID format | major | | |
| `sync_target.feature_name` | [ ] Human-readable name present | minor | | |
| `sync_target.sync_scope` | [ ] One of: full/partial/status-only | major | | |
| `sync_target.sync_reason` | [ ] Reason documented | minor | | |
| `consumed_artifacts` | [ ] At least one artifact present | blocker | | |
| `touched_sections` | [ ] At least one section (unless blocked) | major | | |
| `change_reasons` | [ ] At least one reason (unless blocked) | major | | |
| `consistency_checks` | [ ] At least one check present | major | | |
| `status_updates` | [ ] Present (may be empty) | minor | | |
| `unresolved_ambiguities` | [ ] Present (may be empty) | minor | | |
| `recommendation` | [ ] Present with all sub-fields | blocker | | |

---

## 2. consumed_artifacts Validation (BR-001)

### 2.1 Artifact Entry Structure

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `artifact_type` | [ ] Valid type from allowed set | major | | |
| `artifact_path` | [ ] Path resolves to actual file | major | | |
| `consumed_fully` | [ ] Boolean value present | minor | | |
| `key_fields_extracted` | [ ] At least one field documented | major | | |
| `gaps_found` | [ ] Present (may be empty) | minor | | |

### 2.2 Artifact Type Validation

| Artifact Type | Check | Severity | Status |
|---------------|-------|----------|--------|
| `implementation-summary` | [ ] Source: developer | major | |
| `completion-report` | [ ] Source: developer | major | |
| `acceptance-decision-record` | [ ] Source: reviewer | major | |
| `verification-report` | [ ] Source: tester | major | |
| `design-note` | [ ] Source: architect | major | |
| `open-questions` | [ ] Source: architect | major | |

### 2.3 BR-001 Compliance: Evidence-Based Consumption

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Every `touched_section` has corresponding `change_reason` | major | | |
| [ ] Every `change_reason` has `evidence_source` | major | | |
| [ ] All `consumed_artifacts` have `key_fields_extracted` documented | major | | |
| [ ] No documentation changes without artifact reference | blocker | | |

---

## 3. touched_sections Validation (BR-002)

### 3.1 Section Entry Structure

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `document` | [ ] Valid document name (e.g., README.md) | major | | |
| `section` | [ ] Section path or identifier present | minor | | |
| `change_type` | [ ] One of: add/update/remove | major | | |
| `change_description` | [ ] Clear description present | major | | |
| `lines_changed` | [ ] Line range documented | minor | | |

### 3.2 BR-002 Compliance: Minimal Surface Area

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Each `change_reason` has `is_minimal` field | minor | | |
| [ ] If `is_minimal` is false, justification provided | major | | |
| [ ] No unrelated section updates | major | | |
| [ ] Changes scoped to what actually changed | major | | |

---

## 4. consistency_checks Validation (BR-005)

### 4.1 Check Entry Structure

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `check_id` | [ ] Unique identifier present | minor | | |
| `check_name` | [ ] Descriptive name present | minor | | |
| `documents_compared` | [ ] At least two documents listed | major | | |
| `result` | [ ] One of: ALIGNED/MISALIGNED/NOT_APPLICABLE | major | | |
| `discrepancy` | [ ] Present if result is MISALIGNED | major | | |
| `resolution` | [ ] Present if result is MISALIGNED | major | | |

### 4.2 Required Consistency Checks

| Check Type | Check | Severity | Status | Notes |
|------------|-------|----------|--------|-------|
| README vs completion-report | [ ] Status alignment verified | major | | |
| README vs acceptance-decision-record | [ ] Decision state alignment verified | major | | |
| Skills inventory vs skill directories | [ ] Skills existence verified | major | | |

### 4.3 BR-005 Compliance: Cross-Document Consistency

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] `consistency_checks` includes README vs completion-report | major | | |
| [ ] `consistency_checks` includes README vs acceptance-decision-record | major | | |
| [ ] MISALIGNED results have `resolution` documented | major | | |
| [ ] No unreported inconsistencies | blocker | | |

---

## 5. status_updates Validation (BR-003, BR-008)

### 5.1 Status Entry Structure

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `feature` | [ ] Feature ID present | major | | |
| `previous_status` | [ ] Previous status documented | major | | |
| `new_status` | [ ] New status documented | major | | |
| `evidence` | [ ] Evidence for change present | major | | |
| `evidence_source` | [ ] Source artifact referenced | major | | |

### 5.2 BR-003 Compliance: Evidence-Based Statusing

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Status values match source artifacts | blocker | | |
| [ ] No status inflation (declaring complete when evidence shows partial) | blocker | | |
| [ ] Status evidence comes from valid artifact | major | | |

### 5.3 BR-008 Compliance: Status Truthfulness

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] "Substantially Complete with Known Gaps" not misrepresented as "Fully Complete" | blocker | | |
| [ ] Known gaps from completion-report reflected | major | | |
| [ ] No partial status hidden | major | | |

---

## 6. unresolved_ambiguities Validation

### 6.1 Ambiguity Entry Structure

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `item_id` | [ ] Unique identifier present | minor | | |
| `description` | [ ] Clear description present | major | | |
| `impact` | [ ] Impact documented | major | | |
| `attempted_resolution` | [ ] Resolution attempt documented | minor | | |
| `blocking` | [ ] Boolean blocking status present | major | | |
| `recommended_resolution` | [ ] Resolution recommendation present | minor | | |

### 6.2 Blocking Ambiguity Handling

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] If any `blocking: true`, recommendation.state is blocked | major | | |
| [ ] Blocking items have clear recommended_resolution | major | | |

---

## 7. recommendation Validation

### 7.1 Recommendation Structure

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `state` | [ ] One of: sync-complete/needs-follow-up/blocked | blocker | | |
| `justification` | [ ] Clear justification present | major | | |
| `follow_up_items` | [ ] Present if state is needs-follow-up | major | | |
| `blocking_items` | [ ] Present if state is blocked | blocker | | |
| `next_steps` | [ ] Actionable next steps documented | minor | | |

### 7.2 Recommendation Consistency

| State | Required Conditions | Severity | Status |
|-------|---------------------|----------|--------|
| `sync-complete` | [ ] No blocking ambiguities | major | |
| | [ ] No unresolved MISALIGNED checks | major | |
| `needs-follow-up` | [ ] follow_up_items not empty | major | |
| | [ ] No blocking ambiguities | major | |
| `blocked` | [ ] blocking_items not empty | blocker | |
| | [ ] At least one blocking ambiguity | major | |

---

## 8. Pass/Fail Criteria

### 8.1 PASS Criteria

All of the following must be true:

| Criterion | Check |
|-----------|-------|
| [ ] All 8 required fields present | |
| [ ] All structural validation checks pass | |
| [ ] BR-001 compliance verified | |
| [ ] BR-002 compliance verified | |
| [ ] BR-003 compliance verified | |
| [ ] BR-005 compliance verified | |
| [ ] BR-008 compliance verified | |
| [ ] No blocker-level violations | |
| [ ] recommendation.state matches actual status | |

### 8.2 FAIL Criteria

Any of the following causes FAIL:

| Criterion | Severity |
|-----------|----------|
| Missing required field | blocker |
| BR-001 violation (no evidence for changes) | blocker |
| BR-003 violation (status inflation) | blocker |
| BR-008 violation (status misrepresentation) | blocker |
| recommendation inconsistency | blocker |
| Two or more major violations | major |

### 8.3 N/A Criteria

The following may be marked N/A with justification:

| Criterion | When N/A Applies |
|-----------|------------------|
| `touched_sections` empty | When recommendation.state is blocked |
| `change_reasons` empty | When recommendation.state is blocked |
| `status_updates` empty | When no status changed |

---

## 9. Severity Levels

| Level | Definition | Action Required |
|-------|------------|-----------------|
| **blocker** | Must fix, blocks acceptance | Return to docs for correction |
| **major** | Significant issue, affects quality | Document and require resolution |
| **minor** | Minor issue, improvement | Document for future improvement |

---

## 10. Checklist Summary

| Category | Checks | Blocker | Major | Minor |
|----------|--------|---------|-------|-------|
| Structural Validation | 16 | 3 | 9 | 4 |
| consumed_artifacts Validation | 10 | 1 | 7 | 2 |
| touched_sections Validation | 9 | 0 | 6 | 3 |
| consistency_checks Validation | 11 | 1 | 8 | 2 |
| status_updates Validation | 8 | 2 | 5 | 1 |
| unresolved_ambiguities Validation | 8 | 0 | 5 | 3 |
| recommendation Validation | 9 | 3 | 5 | 1 |
| Pass/Fail Criteria | 9 | 4 | 1 | 0 |
| **Total** | **80** | **14** | **46** | **16** |

---

## References

- `specs/007-docs-core/spec.md` - Feature specification (AC-001, BR-001 to BR-008)
- `specs/007-docs-core/contracts/docs-sync-report-contract.md` - Artifact schema
- `specs/007-docs-core/role-scope.md` - Docs role boundaries
- `specs/007-docs-core/upstream-consumption.md` - Upstream consumption guide
- `role-definition.md` Section 5 - Docs role definition
- `quality-gate.md` - Quality gate rules

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial docs-sync-report validation checklist |