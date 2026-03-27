# Docs Sync Report Template

**Version**: 1.0.0  
**Created**: 2026-03-27  
**Source Contract**: `specs/007-docs-core/contracts/docs-sync-report-contract.md`  
**Producer Role**: `docs`

---

## Purpose

This template provides the standard structure for creating a `docs-sync-report` artifact. The docs-sync-report records the docs role's documentation synchronization work, evidence consumption, and downstream handoff recommendation.

---

## Template Structure

Copy and fill in the sections below:

```markdown
# Docs Sync Report: [Task ID]

## Metadata
- **Dispatch ID**: [dispatch_XXX_XXX]
- **Task ID**: [T-XXX-XXX]
- **Created**: [YYYY-MM-DDTHH:MM:SSZ]
- **Author**: docs

---

## 1. Sync Target

| Field | Value |
|-------|-------|
| **Feature ID** | [Feature being synchronized] |
| **Feature Name** | [Human-readable name] |
| **Sync Scope** | full / partial / status-only |
| **Sync Reason** | [Why this sync was performed] |

---

## 2. Consumed Artifacts

| Artifact Type | Artifact Path | Consumed Fully | Key Fields Extracted | Gaps Found |
|---------------|---------------|----------------|---------------------|------------|
| implementation-summary / completion-report / acceptance-decision-record / verification-report / design-note / open-questions | [Path] | true / false | [List of fields] | [Missing data or empty] |

---

## 3. Touched Sections

| Document | Section | Change Type | Change Description | Lines Changed |
|----------|---------|-------------|---------------------|---------------|
| [Document name] | [Section path] | add / update / remove | [What changed] | [e.g., 45-52] |

---

## 4. Change Reasons

| Reason ID | Section Affected | Reason | Evidence Source | Is Minimal |
|-----------|-----------------|--------|-----------------|------------|
| [CR-XXX] | [Which section] | [Why this change] | [Artifact that justified it] | true / false |

---

## 5. Consistency Checks

| Check ID | Check Name | Documents Compared | Result | Discrepancy | Resolution |
|----------|------------|--------------------|--------|-------------|------------|
| [CC-XXX] | [Name of check] | [List of documents] | ALIGNED / MISALIGNED / NOT_APPLICABLE | [If MISALIGNED] | [How resolved or null] |

---

## 6. Status Updates

| Feature | Previous Status | New Status | Evidence | Evidence Source |
|---------|-----------------|------------|----------|-----------------|
| [Feature ID] | [Status before] | [Status after] | [Evidence justifying change] | [Where evidence came from] |

(If no status changed, use empty list: [])

---

## 7. Unresolved Ambiguities

| Item ID | Description | Impact | Attempted Resolution | Blocking | Recommended Resolution |
|---------|-------------|--------|---------------------|----------|------------------------|
| [UA-XXX] | [What is ambiguous] | [How this affects docs] | [What was tried] | true / false | [How to resolve] |

(If no ambiguities, use empty list: [])

---

## 8. Recommendation

**State**: sync-complete / needs-follow-up / blocked

**Justification**: [Why this recommendation]

**Follow Up Items** (if needs-follow-up):
- [Items requiring follow-up]

**Blocking Items** (if blocked):
- [Items blocking completion]

**Next Steps**:
- [Actions for downstream consumers]
```

---

## Required Fields (8 Total)

Per the contract, the following fields are **mandatory**:

| Field | Required | Notes |
|-------|----------|-------|
| `dispatch_id` | Yes | Dispatch ID for traceability |
| `task_id` | Yes | Task ID for docs sync |
| `sync_target` | Yes | All sub-fields |
| `consumed_artifacts` | Yes | At least one artifact |
| `touched_sections` | Yes | At least one section (unless blocked) |
| `change_reasons` | Yes | At least one reason (unless blocked) |
| `consistency_checks` | Yes | At least one check |
| `status_updates` | Yes | Can be empty if no status changed |
| `unresolved_ambiguities` | Yes | Can be empty |
| `recommendation` | Yes | All sub-fields |

---

## Field Specifications

### sync_target.sync_scope

| Value | When to Use |
|-------|-------------|
| `full` | Feature completion, all docs need update |
| `partial` | Mid-feature update, minor doc changes |
| `status-only` | Only status fields updated |

### consumed_artifacts.artifact_type

| Value | Source Role | Description |
|-------|-------------|-------------|
| `implementation-summary` | developer | Implementation details |
| `completion-report` | developer | Feature completion status |
| `acceptance-decision-record` | reviewer | Acceptance decision |
| `verification-report` | tester | Test results |
| `design-note` | architect | Design baseline |
| `open-questions` | architect | Unresolved questions |

### touched_sections.change_type

| Value | Definition |
|-------|------------|
| `add` | New section added |
| `update` | Existing content modified |
| `remove` | Content removed |

### consistency_checks.result

| Value | Action |
|-------|--------|
| `ALIGNED` | None required |
| `MISALIGNED` | Must document discrepancy and resolution |
| `NOT_APPLICABLE` | Document why not relevant |

### recommendation.state

| Value | Downstream Action |
|-------|-------------------|
| `sync-complete` | Proceed to final acceptance |
| `needs-follow-up` | Track follow-up, may proceed |
| `blocked` | Resolve blocker before proceeding |

---

## Validation Rules

### R-002: BR-001 Evidence-Based
- Every touched_section must have change_reason
- Every change_reason must have evidence_source
- All consumed_artifacts must have key_fields_extracted

### R-003: BR-002 Minimal Surface Area
- Each change_reason must have is_minimal field
- If is_minimal is false, must justify in reason

### R-004: BR-005 Cross-Document Consistency
- consistency_checks must include at minimum:
  - README status vs completion-report status
  - README status vs acceptance-decision-record
- Any MISALIGNED must have resolution

### R-005: Recommendation Consistency
- If sync-complete: no blocking ambiguities, no unresolved MISALIGNED
- If needs-follow-up: follow_up_items not empty
- If blocked: blocking_items not empty, at least one blocking ambiguity

### R-006: Status Truthfulness
- status_updates must reflect actual changes
- Status values must match source artifacts
- No status inflation

---

## Anti-Patterns to Avoid

- ❌ **Changes without evidence**: Every change must have evidence_source
- ❌ **Missing consistency checks**: Must check cross-document consistency
- ❌ **Status inflation**: Don't declare complete if evidence shows otherwise
- ❌ **Hiding blockers**: Escalate blockers, don't hide them
- ❌ **Non-minimal changes**: Follow minimal surface area discipline

---

## Downstream Consumer Usage

### OpenClaw / Acceptance Layer
- Use `recommendation.state` for next action decision
- Review `consistency_checks` for governance alignment
- If blocked: resolve blockers before proceeding

### Management Layer
- Monitor `unresolved_ambiguities` for systemic issues
- Use `gaps_found` to identify upstream quality issues
- Track `follow_up_items` for sprint planning

### Future Features
- Use `touched_sections` for baseline understanding
- Reference `change_reasons` for rationale

---

## References

- Source Contract: `specs/007-docs-core/contracts/docs-sync-report-contract.md`
- Feature Spec: `specs/007-docs-core/spec.md`
- Role Scope: `specs/007-docs-core/role-scope.md`
- Role Definition: `role-definition.md` Section 5 (docs)