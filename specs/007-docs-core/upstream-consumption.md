# Upstream Consumption Guide

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 007-docs-core |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Created** | 2026-03-26 |
| **Purpose** | Define how docs consumes outputs from 003-architect-core, 004-developer-core, 005-tester-core, 006-reviewer-core |

---

## 1. Purpose

This document defines how the `docs` role consumes artifacts from upstream roles (architect, developer, tester, reviewer) to produce accurate, evidence-based documentation. It establishes the consumption contract ensuring BR-001 compliance: "Docs Must Consume Upstream Evidence, Not Speculate."

---

## 2. Consumption Principles

### 2.1 BR-001: Evidence-Based Consumption

**Principle**: All documentation changes must be grounded in consumed upstream artifacts.

**Requirements**:
- Every `touched_section` in docs-sync-report must cite a `consumed_artifact`
- No documentation updates without artifact reference
- Assumptions must be explicitly documented when artifacts are incomplete

**Anti-Pattern**: Writing documentation based on "expected" behavior without verification.

### 2.2 BR-003: Evidence-Based Statusing

**Principle**: Feature status in documentation must match evidence from upstream.

**Requirements**:
- Status must come from `completion-report.md` or `acceptance-decision-record`
- No inferring status from partial artifacts
- Document status discrepancies in `unresolved_ambiguities`

**Anti-Pattern**: Marking a feature "Complete" when completion-report shows known gaps.

### 2.3 Traceability

**Principle**: Every documentation change must be traceable to its source.

**Format**:
```
Source: [artifact_type]:[artifact_path]
Based on: [spec_section] or [completion-report]
Evidence: [specific_field_or_value]
```

---

## 3. Architect Artifacts (003-architect-core)

### 3.1 design-note Consumption

**Contract**: `specs/003-architect-core/contracts/design-note-contract.md`

**Purpose for Docs**: Understand feature scope, design intent, and constraints.

| Field | How Docs Uses It | Documentation Use Case |
|-------|------------------|------------------------|
| `background` | Extract context for documentation introduction | README feature overview |
| `feature_goal` | Derive user-facing description | Feature description in docs |
| `design_summary` | High-level design context | Architecture documentation |
| `constraints` | Document limitations | Known limitations section |
| `non_goals` | Clarify scope boundaries | Out-of-scope documentation |
| `assumptions` | Track dependencies | Prerequisites documentation |
| `open_questions` | Document pending decisions | Known limitations, TODOs |

**Example Consumption**:
```yaml
consumed_artifact:
  artifact_type: design-note
  artifact_path: specs/003-architect-core/design-note.md
  fields_used:
    - feature_goal → README feature description
    - constraints → Known limitations section
    - non_goals → Scope clarification
```

### 3.2 open-questions Consumption

**Contract**: `specs/003-architect-core/contracts/open-questions-contract.md`

**Purpose for Docs**: Track what was resolved and what remains uncertain.

| Field | How Docs Uses It | Documentation Use Case |
|-------|------------------|------------------------|
| `question` | Document the uncertainty | Known limitations |
| `temporary_assumption` | Document current behavior expectation | Usage notes |
| `impact_surface` | Identify affected components | Affected areas documentation |
| `recommended_next_step` | Track pending work | TODO documentation |

**Example Consumption**:
```yaml
consumed_artifact:
  artifact_type: open-questions
  artifact_path: specs/003-architect-core/open-questions.md
  fields_used:
    - question → Document in known limitations
    - temporary_assumption → Usage guidance
```

---

## 4. Developer Artifacts (004-developer-core)

### 4.1 implementation-summary Consumption

**Contract**: `specs/004-developer-core/contracts/implementation-summary-contract.md`

**Purpose for Docs**: Primary source for what changed.

| Field | How Docs Uses It | Documentation Use Case |
|-------|------------------|------------------------|
| `goal_alignment.goal` | What was implemented | Feature description |
| `goal_alignment.achieved` | Completion status | Status determination |
| `goal_alignment.deviations` | Document scope changes | Changelog, known limitations |
| `changed_files` | Identify affected areas | Touched sections |
| `known_issues` | Document problems | Known issues section |
| `risks` | Document risks | Risk documentation |
| `recommendation` | Determine readiness | Handoff decision |

**Example Consumption**:
```yaml
consumed_artifact:
  artifact_type: implementation-summary
  artifact_path: specs/004-developer-core/implementation-summary.md
  fields_used:
    - goal_alignment → README status update
    - changed_files → Identify documentation sections to update
    - known_issues → Known issues documentation
    - risks → Risk documentation
```

### 4.2 self-check-report Consumption

**Contract**: `specs/004-developer-core/contracts/self-check-report-contract.md`

**Purpose for Docs**: Understand developer's own assessment of quality.

| Field | How Docs Uses It | Documentation Use Case |
|-------|------------------|------------------------|
| `overall_status` | Quality indication | Status confidence |
| `blockers` | Unresolved issues | Known issues |
| `warnings` | Potential concerns | Known limitations |
| `recommendation` | Readiness assessment | Handoff timing |

**Example Consumption**:
```yaml
consumed_artifact:
  artifact_type: self-check-report
  artifact_path: specs/004-developer-core/self-check-report.md
  fields_used:
    - overall_status → Quality assessment
    - blockers → Unresolved issues for documentation
```

### 4.3 bugfix-report Consumption

**Contract**: `specs/004-developer-core/contracts/bugfix-report-contract.md`

**Purpose for Docs**: Capture fix details for changelog.

| Field | How Docs Uses It | Documentation Use Case |
|-------|------------------|------------------------|
| `bug_id` | Reference identifier | Changelog reference |
| `fix_summary` | What was fixed | Changelog entry |
| `root_cause` | Why it happened | Post-mortem documentation |
| `related_changes` | Affected areas | Changelog scope |
| `verification_status` | Fix confidence | Release notes |

**Example Consumption**:
```yaml
consumed_artifact:
  artifact_type: bugfix-report
  artifact_path: specs/004-developer-core/bugfix-report.md
  fields_used:
    - bug_id → Changelog reference
    - fix_summary → Changelog entry content
    - verification_status → Release confidence
```

---

## 5. Tester Artifacts (005-tester-core)

### 5.1 verification-report Consumption

**Contract**: `specs/005-tester-core/contracts/verification-report-contract.md`

**Purpose for Docs**: Confirm what was verified and understand confidence level.

| Field | How Docs Uses It | Documentation Use Case |
|-------|------------------|------------------------|
| `execution_summary` | Test coverage status | Quality statement |
| `confidence_level` | Verification confidence | Status determination |
| `coverage_gaps` | Unverified areas | Known limitations |
| `edge_cases_checked` | Boundary conditions tested | Quality documentation |
| `blocked_items` | Verification blockers | Known issues |
| `recommendation` | Readiness assessment | Handoff timing |

**Example Consumption**:
```yaml
consumed_artifact:
  artifact_type: verification-report
  artifact_path: specs/005-tester-core/verification-report.md
  fields_used:
    - confidence_level → Verification confidence in docs
    - coverage_gaps → Known limitations documentation
    - edge_cases_checked → Quality statement
```

### 5.2 regression-risk-report Consumption

**Contract**: `specs/005-tester-core/contracts/regression-risk-report-contract.md`

**Purpose for Docs**: Document known risks.

| Field | How Docs Uses It | Documentation Use Case |
|-------|------------------|------------------------|
| `risk_areas` | Areas of concern | Risk documentation |
| `mitigation_strategies` | How risks are handled | Usage guidance |
| `monitoring_recommendations` | What to watch | Operations documentation |

**Example Consumption**:
```yaml
consumed_artifact:
  artifact_type: regression-risk-report
  artifact_path: specs/005-tester-core/regression-risk-report.md
  fields_used:
    - risk_areas → Risk documentation
    - mitigation_strategies → Usage guidance
```

---

## 6. Reviewer Artifacts (006-reviewer-core)

### 6.1 acceptance-decision-record Consumption

**Contract**: `specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md`

**Purpose for Docs**: Primary source for feature status determination.

| Field | How Docs Uses It | Documentation Use Case |
|-------|------------------|------------------------|
| `decision_state` | Feature status | README status table |
| `decision_rationale` | Why accepted/rejected | Changelog context |
| `blocking_issues` | Unresolved problems | Known issues |
| `acceptance_conditions` | Follow-up requirements | TODO documentation |
| `governance_compliance.status_truthfulness` | Status verification | Status alignment check |

**Example Consumption**:
```yaml
consumed_artifact:
  artifact_type: acceptance-decision-record
  artifact_path: specs/006-reviewer-core/acceptance-decision-record.md
  fields_used:
    - decision_state → README status determination
    - blocking_issues → Known issues documentation
    - acceptance_conditions → Follow-up tracking
    - status_truthfulness → Verify README alignment
```

### 6.2 review-findings-report Consumption

**Contract**: `specs/006-reviewer-core/contracts/review-findings-report-contract.md`

**Purpose for Docs**: Understand quality concerns and governance alignment.

| Field | How Docs Uses It | Documentation Use Case |
|-------|------------------|------------------------|
| `findings_by_severity` | Quality issues | Known issues, limitations |
| `governance_alignment_status` | Governance compliance | Documentation consistency |
| `governance_conflicts` | Documentation conflicts | Sync requirements |
| `scope_mismatches` | Scope deviations | Changelog, limitations |

**Example Consumption**:
```yaml
consumed_artifact:
  artifact_type: review-findings-report
  artifact_path: specs/006-reviewer-core/review-findings-report.md
  fields_used:
    - findings_by_severity → Known issues documentation
    - governance_alignment_status → Documentation sync requirements
    - governance_conflicts → Cross-document consistency check
```

---

## 7. Feature Completion Context

### 7.1 completion-report.md Consumption

**Purpose for Docs**: Primary source for overall feature completion state.

| Section | How Docs Uses It | Documentation Use Case |
|---------|------------------|------------------------|
| Deliverables | What was delivered | Changelog scope |
| Completion status | Feature status | README status table |
| Known gaps | Outstanding issues | Known limitations |
| Traceability | Requirements coverage | Feature documentation |

### 7.2 spec.md Consumption

**Purpose for Docs**: Feature description and acceptance criteria reference.

| Section | How Docs Uses It | Documentation Use Case |
|---------|------------------|------------------------|
| Background | Feature context | README overview |
| Goal | Feature purpose | Feature description |
| Scope | Feature boundaries | Scope documentation |
| Acceptance Criteria | Completion definition | Status determination |

---

## 8. Consumption Workflow

### 8.1 Standard Feature Completion Flow

```
1. Receive feature completion signal
2. Consume completion-report.md
   → Extract overall status
   → Identify deliverables
3. Consume acceptance-decision-record
   → Confirm decision_state
   → Extract status truthfulness
4. Consume implementation-summary
   → Identify changed_files
   → Extract known_issues
5. Consume verification-report
   → Confirm confidence_level
   → Extract coverage_gaps
6. Consume review-findings-report
   → Check governance_alignment_status
   → Extract findings
7. Cross-reference with spec.md
   → Verify feature description
   → Confirm acceptance criteria
8. Generate docs-sync-report
   → Document consumed_artifacts
   → List touched_sections
   → Verify consistency_checks
```

### 8.2 Missing Data Handling

| Scenario | Action |
|----------|--------|
| Artifact not found | Document in `unresolved_ambiguities`, potentially `recommendation: blocked` |
| Required field missing | Document the gap, use `temporary_assumption` if possible |
| Conflicting information | Document conflict, potentially escalate |
| Incomplete artifact | Document gaps, note `consumed_fully: false` |

---

## 9. Field-by-Field Consumption Guide

### 9.1 README Status Determination

| Source | Field | Value → README Status |
|--------|-------|----------------------|
| acceptance-decision-record | decision_state | accept → Complete |
| acceptance-decision-record | decision_state | accept-with-conditions → Complete with Conditions |
| acceptance-decision-record | decision_state | reject → In Progress |
| acceptance-decision-record | decision_state | needs-clarification → Blocked |
| completion-report | status | Partial → Partially Complete |
| completion-report | known_gaps | Non-empty → Complete with Known Gaps |

### 9.2 Known Issues Documentation

| Source | Field | Documentation Use |
|--------|-------|-------------------|
| implementation-summary | known_issues | Primary known issues source |
| verification-report | coverage_gaps | Testing gaps |
| verification-report | blocked_items | Blocked functionality |
| acceptance-decision-record | blocking_issues | Blocking problems |
| review-findings-report | findings_by_severity.blockers | Critical issues |
| review-findings-report | findings_by_severity.major | Significant issues |

### 9.3 Changelog Content Sources

| Changelog Field | Primary Source | Alternative Source |
|-----------------|----------------|-------------------|
| feature_id | completion-report | spec.md |
| feature_name | spec.md | completion-report |
| change_type | implementation-summary.goal_alignment | completion-report |
| summary | implementation-summary.implementation.approach | design-note.design_summary |
| capability_changes | implementation-summary.changed_files | design-note |
| docs_changes | docs-sync-report.touched_sections | - |
| validation_changes | verification-report.tests_added_or_run | - |
| breaking_changes | implementation-summary.risks | review-findings-report |
| known_limitations | implementation-summary.known_issues | verification-report.coverage_gaps |
| related_features | design-note.assumptions | completion-report |

---

## 10. Examples

### 10.1 Complete Feature Consumption

```yaml
docs_sync_report:
  sync_target: "005-tester-core"
  consumed_artifacts:
    - artifact_type: design-note
      artifact_path: specs/003-architect-core/design-note.md
      consumed_fully: true
      fields_used: [feature_goal, design_summary, constraints]
    - artifact_type: implementation-summary
      artifact_path: specs/005-tester-core/implementation-summary.md
      consumed_fully: true
      fields_used: [goal_alignment, changed_files, known_issues]
    - artifact_type: verification-report
      artifact_path: specs/005-tester-core/verification-report.md
      consumed_fully: true
      fields_used: [confidence_level, coverage_gaps]
    - artifact_type: acceptance-decision-record
      artifact_path: specs/006-reviewer-core/acceptance-decision-record.md
      consumed_fully: true
      fields_used: [decision_state, governance_compliance.status_truthfulness]
    - artifact_type: completion-report
      artifact_path: specs/005-tester-core/completion-report.md
      consumed_fully: true
      fields_used: [deliverables, status, known_gaps]
```

### 10.2 Partial Consumption with Gaps

```yaml
docs_sync_report:
  sync_target: "007-docs-core"
  consumed_artifacts:
    - artifact_type: implementation-summary
      artifact_path: specs/007-docs-core/implementation-summary.md
      consumed_fully: true
      fields_used: [goal_alignment, changed_files]
    - artifact_type: acceptance-decision-record
      artifact_path: specs/006-reviewer-core/acceptance-decision-record.md
      consumed_fully: false
      consumption_notes: "verification-report referenced but not yet available"
  unresolved_ambiguities:
    - item: "verification-report not available for confidence_level extraction"
      impact: "Cannot document verification status in README"
      temporary_assumption: "Assume verification in progress, document as 'pending verification'"
```

---

## 11. Validation Checklist

### 11.1 Artifact Consumption Validation

- [ ] All required upstream artifacts listed in `consumed_artifacts`
- [ ] Each artifact has `artifact_type`, `artifact_path`, `consumed_fully`
- [ ] Missing artifacts documented in `unresolved_ambiguities`
- [ ] BR-001 satisfied: All documentation changes have artifact references

### 11.2 Field Extraction Validation

- [ ] Required fields extracted from each artifact type
- [ ] Field usage documented
- [ ] Missing fields noted

### 11.3 Cross-Reference Validation

- [ ] Status from acceptance-decision-record matches completion-report
- [ ] Known issues from all sources aggregated
- [ ] Breaking changes identified from risks and findings

---

## References

- `specs/007-docs-core/spec.md` BR-001, BR-003 - Evidence-based requirements
- `specs/003-architect-core/contracts/` - Architect artifact contracts
- `specs/004-developer-core/contracts/` - Developer artifact contracts
- `specs/005-tester-core/contracts/` - Tester artifact contracts
- `specs/006-reviewer-core/contracts/` - Reviewer artifact contracts
- `role-definition.md` Section 5 - Docs role definition
- `io-contract.md` - I/O contract specification