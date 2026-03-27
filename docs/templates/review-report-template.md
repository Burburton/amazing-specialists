# Review Report Template (Review Findings Report)

**Version**: 1.0.0  
**Created**: 2026-03-27  
**Source Contract**: `specs/006-reviewer-core/contracts/review-findings-report-contract.md`  
**Producer Role**: `reviewer`

---

## Purpose

This template provides the standard structure for creating a `review-findings-report` artifact. The review-findings-report records independent review findings with severity classification, governance alignment status, and actionable recommendations.

---

## Template Structure

Copy and fill in the sections below:

```markdown
# Review Findings Report: [Report ID]

## Metadata
- **Report ID**: [RFR-XXX-XXX]
- **Created**: [YYYY-MM-DDTHH:MM:SSZ]
- **Author**: reviewer

---

## 1. Review Target

| Field | Value |
|-------|-------|
| **Feature ID** | [Feature ID being reviewed] |
| **Feature Name** | [Human-readable name] |
| **Target Type** | feature / task / artifact / milestone |
| **Target Version** | [Version or commit reference] |
| **Description** | [What is under review] |

---

## 2. Reviewed Inputs

### Upstream Artifacts Consumed
| Artifact Type | Artifact Path | Version | Consumed Fully | Consumption Notes |
|---------------|---------------|---------|----------------|-------------------|
| design-note / implementation-summary / verification-report / test-scope-report | [Path] | [Version] | true / false | [Notes if not fully consumed] |

### Specs Reviewed
| Spec Path | Spec Version |
|-----------|--------------|
| [Path to spec.md] | [Version] |

### Canonical Documents Checked
| Document Type | Document Path | Check Performed |
|---------------|---------------|-----------------|
| role-definition / package-spec / io-contract / quality-gate / README | [Path] | true / false |

---

## 3. Summary Judgment

| Field | Value |
|-------|-------|
| **Overall Assessment** | acceptable / acceptable_with_concerns / unacceptable / needs_clarification |
| **Overall Risk Level** | low / medium / high / critical |

**Key Strengths**:
- [What was done well]

**Critical Gaps**:
- [Must-address issues]

**Readiness for Acceptance**: ready / not_ready / partially_ready

---

## 4. Findings by Severity

### Blockers (severity: blocker)
| ID | Title | Description | Location | Evidence | Impact | Recommended Remediation |
|----|-------|-------------|----------|----------|--------|------------------------|
| [BLK-XXX] | [Title] | [Description] | [File/section] | [Supporting evidence] | [Why this blocks] | [How to fix] |

(If no blockers, use empty list: [])

### Major Findings
| ID | Title | Description | Location | Evidence | Impact | Recommended Remediation |
|----|-------|-------------|----------|----------|--------|------------------------|
| [MAJ-XXX] | [Title] | [Description] | [File/section] | [Evidence] | [Impact] | [Remediation] |

(If no majors, use empty list: [])

### Minor Findings
| ID | Title | Description | Location | Evidence | Suggested Improvement |
|----|-------|-------------|----------|----------|----------------------|
| [MIN-XXX] | [Title] | [Description] | [File/section] | [Evidence] | [Suggestion] |

(If no minors, use empty list: [])

### Notes
| ID | Title | Description | Location | Observation |
|----|-------|-------------|----------|-------------|
| [NOTE-XXX] | [Title] | [Description] | [File or null] | [Observation] |

(If no notes, use empty list: [])

---

## 5. Evidence References

### File References
| File Path | Line Range | Context |
|-----------|------------|---------|
| [Path] | [e.g., 45-60 or null] | [Why relevant] |

### Artifact References
| Artifact Type | Artifact Path | Section Referenced |
|---------------|---------------|-------------------|
| [Type] | [Path] | [Section or null] |

### Observations
| Observation ID | Description | Observer | Timestamp | Context |
|----------------|-------------|----------|-----------|---------|
| [OBS-XXX] | [What observed] | [Name] | [Timestamp] | [Context] |

---

## 6. Scope Mismatches

### Spec vs Implementation
| Spec Requirement | Implementation Status | Details |
|------------------|----------------------|---------|
| [Requirement] | implemented / partially_implemented / not_implemented / exceeded_spec | [Details] |

### Unauthorized Additions
| Addition Description | Location | Justification | Recommendation |
|---------------------|----------|---------------|----------------|
| [What was added beyond spec] | [Location] | [Justification or null] | accept / reject / document_and_accept |

### Scope Gaps
| Gap Description | Spec Reference | Impact |
|-----------------|----------------|--------|
| [What's missing] | [Reference] | [Impact] |

---

## 7. Quality Concerns

### Maintainability
| Concern ID | Description | Location | Severity | Suggestion |
|------------|-------------|----------|----------|------------|
| [QC-XXX] | [Concern] | [Location] | major / minor | [Suggestion] |

### Performance
| Concern ID | Description | Location | Severity | Suggestion |
|------------|-------------|----------|----------|------------|
| [QC-XXX] | [Concern] | [Location or null] | major / minor | [Suggestion or null] |

### Security Flags
| Concern ID | Description | Location | Severity | Recommendation |
|------------|-------------|----------|----------|----------------|
| [QC-XXX] | [Concern] | [Location] | major / minor | [Recommendation] |

### Other Concerns
| Concern ID | Category | Description | Severity |
|------------|----------|-------------|----------|
| [QC-XXX] | [Category] | [Description] | major / minor |

---

## 8. Governance Alignment Status

**Overall Status**: aligned / drift_detected / critical_drift

### Alignment Details
| Document Type | Aligned | Conflicts | Drift Description |
|---------------|---------|-----------|-------------------|
| [Document] | true / false | [List or null] | [Description or null] |

---

## 9. Governance Conflicts

**Has Conflicts**: true / false

### Conflicts (if applicable)
| Conflict ID | Document 1 | Document 2 | Conflict Description | Severity | Resolution Recommendation |
|-------------|------------|------------|---------------------|----------|--------------------------|
| [GC-XXX] | [Doc + section] | [Doc + section] | [What conflicts] | blocker / major / minor | [How to resolve] |

**Sync Required**: true / false

**Sync Details**: [What needs sync, or null]

---

## 10. Open Questions

| Question ID | Question | Context | Blocking | Suggested Owner | Urgency |
|-------------|----------|---------|----------|-----------------|---------|
| [OQ-XXX] | [Question] | [Context] | true / false | architect / developer / tester / management | high / medium / low |

---

## 11. Recommended Next Action

**Action**: accept / reject / request_changes / escalate

**Rationale**: [Why this recommendation]

**Conditions for Acceptance** (if request_changes):
- [List of conditions]

**Escalation Target** (if escalate): [Target or null]

### Handoff Artifacts
| Artifact Type | Artifact Path | Notes |
|---------------|---------------|-------|
| [Type] | [Path] | [Notes or null] |
```

---

## Required Fields

Per the contract, the following fields are **mandatory**:

| Field | Required | Notes |
|-------|----------|-------|
| `report_id` | Yes | Unique identifier |
| `created_at` | Yes | ISO 8601 timestamp |
| `created_by` | Yes | Must be "reviewer" |
| `review_target` | Yes | All sub-fields |
| `reviewed_inputs` | Yes | At least one upstream_artifact |
| `summary_judgment` | Yes | All sub-fields |
| `findings_by_severity` | Yes | All 4 severity keys (blocker/major/minor/note) |
| `evidence_references` | Yes | At least one reference type |
| `scope_mismatches` | Yes | Can be empty lists |
| `quality_concerns` | Yes | Can be empty lists |
| `governance_alignment_status` | Yes | overall_status required |
| `governance_conflicts` | Yes | has_conflicts boolean required |
| `open_questions` | Yes | Can be empty list |
| `recommended_next_action` | Yes | action and rationale required |

---

## Severity Classification (per quality-gate.md Section 2.2)

| Severity | Definition | Required Response |
|----------|------------|-------------------|
| `blocker` | Must fix, blocks milestone acceptance | Must resolve before acceptance |
| `major` | Affects downstream or causes understanding deviation | Must address with documented rationale |
| `minor` | Light issues with improvement opportunity | Should fix but doesn't block |
| `note` | Informational, for reference | No action required |

---

## Field Specifications

### summary_judgment.overall_assessment

| Value | When to Use |
|-------|-------------|
| `acceptable` | All critical requirements met, no blockers |
| `acceptable_with_concerns` | Meets core requirements but has issues |
| `unacceptable` | Blocking issues prevent acceptance |
| `needs_clarification` | Cannot determine acceptability |

### governance_alignment_status.overall_status

| Value | Required Action |
|-------|-----------------|
| `aligned` | No conflicts with canonical governance |
| `drift_detected` | Document and recommend sync |
| `critical_drift` | Must resolve before acceptance |

### recommended_next_action.action

| Value | Next Step |
|-------|-----------|
| `accept` | Handoff to acceptance/docs/security |
| `reject` | Generate actionable-feedback-report for developer |
| `request_changes` | Specify conditions for acceptance |
| `escalate` | Escalate to architect/management |

---

## Validation Rules

### R-002: Severity Classification
- Each finding must be classified to blocker/major/minor/note
- Cannot heap all findings together without classification
- Blockers must have impact and recommended_remediation
- Major findings must have impact description

### R-003: Governance Alignment (AH-006)
- `governance_alignment_status` must be explicit
- `canonical_documents_checked` must list checked governance docs
- If drift_detected or critical_drift, details required in governance_conflicts

### R-004: Evidence Traceability
- Each finding must have `evidence` field
- Each finding must have `location` field (or N/A justification)
- evidence_references must support all findings

### R-005: Action Consistency
- If blockers present, action must be reject or escalate
- If overall_assessment is unacceptable, action must be reject or escalate

---

## Anti-Patterns to Avoid

- ❌ **Severity misclassification**: Use correct severity per quality-gate.md
- ❌ **Missing governance check**: Must check canonical documents (AH-006)
- ❌ **Action inconsistency**: If blockers exist, must be reject/escalate
- ❌ **No evidence traceability**: Every finding needs evidence and location
- ❌ **Skipping upstream consumption**: Must consume all relevant artifacts

---

## Downstream Consumer Usage

### acceptance
- Use `recommended_next_action` for next decision
- Understand `overall_risk_level` risks
- Check `governance_alignment_status`

### docs
- Use `findings_by_severity` for doc sync scope
- Check `governance_conflicts` for doc updates

### security
- Focus on `quality_concerns.security_flags`
- Evaluate security-related blockers

---

## References

- Source Contract: `specs/006-reviewer-core/contracts/review-findings-report-contract.md`
- Feature Spec: `specs/006-reviewer-core/spec.md`
- Quality Gate: `quality-gate.md` Section 2.2
- Audit Hardening: `docs/audit-hardening.md` (AH-006)
- Role Definition: `role-definition.md` Section 4