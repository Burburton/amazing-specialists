# Docs Sync Report Contract

## Contract Metadata

| Field | Value |
|-------|-------|
| **Contract ID** | docs-sync-report |
| **Contract Name** | Documentation Synchronization Report Contract |
| **Version** | 1.0.0 |
| **Owner** | docs |
| **Consumers** | OpenClaw, acceptance, management, future-features |

---

## Purpose

Define the complete schema and validation rules for the `docs-sync-report` artifact, which records the docs role's documentation synchronization work, evidence consumption, and downstream handoff recommendation.

This artifact is the **primary output** of the docs role's `readme-sync` skill and must be consumed by the OpenClaw management layer to determine whether documentation synchronization is complete.

---

## Schema

```yaml
docs_sync_report:
  # Metadata
  dispatch_id: string              # Dispatch ID for traceability
  task_id: string                  # Task ID for docs sync
  created_at: timestamp            # Report timestamp
  created_by: string               # Always "docs"
  
  # Required Fields (AC-001: 8 fields total)
  
  # Field 1: sync_target (Required)
  sync_target:
    feature_id: string             # Feature being synchronized (e.g., "006-reviewer-core")
    feature_name: string           # Human-readable name
    sync_scope: enum               # full | partial | status-only
    sync_reason: string            # Why this sync was performed
  
  # Field 2: consumed_artifacts (Required - BR-001)
  consumed_artifacts:
    - artifact_type: enum          # implementation-summary | completion-report | acceptance-decision-record | verification-report | design-note | open-questions
      artifact_path: string        # Path to the artifact file
      consumed_fully: boolean      # Whether all relevant content was consumed
      key_fields_extracted: string[] # Important fields used from this artifact
      gaps_found: string[]         # Missing or incomplete data discovered
  
  # Field 3: touched_sections (Required - BR-002)
  touched_sections:
    - document: string             # Document name (e.g., "README.md", "CHANGELOG.md")
      section: string              # Section path or identifier
      change_type: enum            # add | update | remove
      change_description: string   # What changed in this section
      lines_changed: string        # Line range (e.g., "45-52")
  
  # Field 4: change_reasons (Required)
  change_reasons:
    - reason_id: string            # e.g., "CR-001"
      section_affected: string     # Which section this reason applies to
      reason: string               # Why this change was made
      evidence_source: string      # Which artifact justified this change
      is_minimal: boolean          # Whether this follows minimal surface area (BR-002)
  
  # Field 5: consistency_checks (Required - BR-005)
  consistency_checks:
    - check_id: string             # e.g., "CC-001"
      check_name: string           # Name of the consistency check
      documents_compared: string[] # Documents checked for consistency
      result: enum                 # ALIGNED | MISALIGNED | NOT_APPLICABLE
      discrepancy: string | null   # Description if MISALIGNED
      resolution: string | null    # How discrepancy was resolved
  
  # Field 6: status_updates (Required)
  status_updates:
    - feature: string              # Feature ID whose status changed
      previous_status: string      # Status before sync
      new_status: string           # Status after sync
      evidence: string             # Evidence justifying the status change
      evidence_source: string      # Where the evidence came from
  
  # Field 7: unresolved_ambiguities (Required)
  unresolved_ambiguities:
    - item_id: string              # e.g., "UA-001"
      description: string          # What is ambiguous or unclear
      impact: string               # How this affects documentation
      attempted_resolution: string # What was tried to resolve it
      blocking: boolean            # Whether this blocks sync completion
      recommended_resolution: string # How to resolve this
  
  # Field 8: recommendation (Required)
  recommendation:
    state: enum                    # sync-complete | needs-follow-up | blocked
    justification: string          # Why this recommendation
    follow_up_items: string[]      # Items requiring follow-up (if needs-follow-up)
    blocking_items: string[]       # Items blocking completion (if blocked)
    next_steps: string[]           # Actions for downstream consumers
```

---

## Field Specifications

### sync_target.sync_scope

| Value | Definition | When to Use |
|-------|------------|-------------|
| `full` | Complete documentation sync for feature completion | Feature marked complete, all documentation needs update |
| `partial` | Partial sync for incremental changes | Mid-feature status update, minor doc changes |
| `status-only` | Only status fields updated | Feature status changed, no content changes |

### consumed_artifacts.artifact_type

| Value | Source Role | Description |
|-------|-------------|-------------|
| `implementation-summary` | developer | Implementation details and outcomes |
| `completion-report` | developer | Feature completion status and deliverables |
| `acceptance-decision-record` | reviewer | Acceptance decision and rationale |
| `verification-report` | tester | Test verification results |
| `design-note` | architect | Design baseline and rationale |
| `open-questions` | architect | Unresolved design questions |

### touched_sections.change_type

| Value | Definition |
|-------|------------|
| `add` | New section or content added |
| `update` | Existing content modified |
| `remove` | Content removed |

### consistency_checks.result

| Value | Definition | Action |
|-------|------------|--------|
| `ALIGNED` | Documents are consistent | None required |
| `MISALIGNED` | Inconsistency found | Must document discrepancy and resolution |
| `NOT_APPLICABLE` | Check not relevant to this sync | Document why |

### recommendation.state

| Value | Definition | Downstream Action |
|-------|------------|-------------------|
| `sync-complete` | Documentation fully synchronized | Proceed to final acceptance |
| `needs-follow-up` | Synchronized with follow-up items | Track follow-up, may proceed |
| `blocked` | Cannot complete sync | Resolve blocker before proceeding |

---

## Validation Rules

### R-001: Required Fields

The following fields must exist and be non-empty:

- `dispatch_id`
- `task_id`
- `sync_target` (all sub-fields)
- `consumed_artifacts` (at least one artifact)
- `touched_sections` (at least one section)
- `change_reasons` (at least one reason)
- `consistency_checks` (at least one check)
- `status_updates` (may be empty if no status changed)
- `unresolved_ambiguities` (may be empty)
- `recommendation` (all sub-fields)

### R-002: BR-001 Compliance (Evidence-Based)

- Every `touched_section` must have a corresponding `change_reason`
- Every `change_reason` must have an `evidence_source`
- All `consumed_artifacts` must have `key_fields_extracted` documented

### R-003: BR-002 Compliance (Minimal Surface Area)

- Each `change_reason` must have `is_minimal` field
- If `is_minimal` is `false`, must justify in `reason` field
- Documentation changes should not rewrite unrelated sections

### R-004: BR-005 Compliance (Cross-Document Consistency)

- `consistency_checks` must include at minimum:
  - README status vs completion-report status
  - README status vs acceptance-decision-record decision_state
- Any `MISALIGNED` result must have `resolution` documented

### R-005: Recommendation Consistency

- If `recommendation.state` is `sync-complete`:
  - `unresolved_ambiguities` must have no items with `blocking: true`
  - `consistency_checks` must have no `MISALIGNED` results without resolution
- If `recommendation.state` is `needs-follow-up`:
  - `recommendation.follow_up_items` must not be empty
- If `recommendation.state` is `blocked`:
  - `recommendation.blocking_items` must not be empty
  - `unresolved_ambiguities` must have at least one `blocking: true`

### R-006: Status Truthfulness

- `status_updates` must reflect actual status changes
- Status values must match those in source artifacts
- No status inflation (declaring complete when evidence shows otherwise)

---

## Consumer Responsibilities

### OpenClaw / Acceptance Layer

- Use `recommendation.state` to determine next action
- If `sync-complete`: proceed to final acceptance
- If `needs-follow-up`: track items, may proceed
- If `blocked`: resolve blockers before proceeding
- Review `consistency_checks` for governance alignment

### Management Layer

- Monitor `unresolved_ambiguities` for systemic issues
- Use `consumed_artifacts.gaps_found` to identify upstream quality issues
- Track `recommendation.follow_up_items` for sprint planning

### Future Features

- Use `touched_sections` to understand documentation baseline
- Review `consistency_checks` for established patterns
- Reference `change_reasons` for documentation rationale

---

## Producer Responsibilities

### Docs Role

- Consume all required upstream artifacts before sync
- Document every documentation change with rationale
- Execute all required consistency checks
- Report honest status (no inflation)
- Escalate blockers rather than hiding them
- Follow minimal surface area discipline

---

## Example: Sync-Complete Report

```yaml
docs_sync_report:
  dispatch_id: "dispatch_007_001"
  task_id: "T-007-001"
  created_at: "2026-03-26T16:00:00Z"
  created_by: "docs"
  
  sync_target:
    feature_id: "006-reviewer-core"
    feature_name: "Reviewer Core Skills System"
    sync_scope: "full"
    sync_reason: "Feature marked complete, full documentation sync required"
  
  consumed_artifacts:
    - artifact_type: "implementation-summary"
      artifact_path: "specs/006-reviewer-core/implementation-summary.md"
      consumed_fully: true
      key_fields_extracted:
        - "deliverables"
        - "completion_status"
      gaps_found: []
    - artifact_type: "acceptance-decision-record"
      artifact_path: "specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md"
      consumed_fully: true
      key_fields_extracted:
        - "decision_state"
        - "target_feature"
      gaps_found: []
    - artifact_type: "completion-report"
      artifact_path: "specs/006-reviewer-core/completion-report.md"
      consumed_fully: true
      key_fields_extracted:
        - "deliverables_checklist"
        - "traceability_matrix"
      gaps_found: []
  
  touched_sections:
    - document: "README.md"
      section: "Feature Status Table"
      change_type: "update"
      change_description: "Updated 006-reviewer-core status from In Progress to Complete"
      lines_changed: "67"
    - document: "README.md"
      section: "Skills Inventory > reviewer"
      change_type: "update"
      change_description: "Added 3 reviewer skills with brief descriptions"
      lines_changed: "89-92"
    - document: "CHANGELOG.md"
      section: "Unreleased"
      change_type: "add"
      change_description: "Added changelog entry for 006-reviewer-core"
      lines_changed: "12-25"
  
  change_reasons:
    - reason_id: "CR-001"
      section_affected: "README.md#Feature Status Table"
      reason: "Feature completion requires status update to reflect actual capability"
      evidence_source: "acceptance-decision-record decision_state: accept"
      is_minimal: true
    - reason_id: "CR-002"
      section_affected: "README.md#Skills Inventory"
      reason: "New skills implemented must be documented for discoverability"
      evidence_source: "completion-report deliverables_checklist"
      is_minimal: true
    - reason_id: "CR-003"
      section_affected: "CHANGELOG.md"
      reason: "Feature release requires changelog entry for release notes"
      evidence_source: "changelog-writing skill requirement"
      is_minimal: true
  
  consistency_checks:
    - check_id: "CC-001"
      check_name: "README status vs completion-report status"
      documents_compared:
        - "README.md#Feature Status Table"
        - "specs/006-reviewer-core/completion-report.md"
      result: "ALIGNED"
      discrepancy: null
      resolution: null
    - check_id: "CC-002"
      check_name: "README status vs acceptance-decision-record"
      documents_compared:
        - "README.md#Feature Status Table"
        - "specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md"
      result: "ALIGNED"
      discrepancy: null
      resolution: null
    - check_id: "CC-003"
      check_name: "Skills inventory vs actual skill directories"
      documents_compared:
        - "README.md#Skills Inventory"
        - ".opencode/skills/reviewer/"
      result: "ALIGNED"
      discrepancy: null
      resolution: null
  
  status_updates:
    - feature: "006-reviewer-core"
      previous_status: "In Progress"
      new_status: "Complete"
      evidence: "acceptance-decision-record decision_state: accept"
      evidence_source: "acceptance-decision-record-contract.md"
  
  unresolved_ambiguities: []
  
  recommendation:
    state: "sync-complete"
    justification: "All required documentation updated, consistency checks passed, no blocking ambiguities"
    follow_up_items: []
    blocking_items: []
    next_steps:
      - "OpenClaw to proceed with final acceptance"
      - "Feature 007-docs-core can begin implementation"
```

---

## Example: Needs-Follow-Up Report

```yaml
docs_sync_report:
  dispatch_id: "dispatch_007_002"
  task_id: "T-007-002"
  created_at: "2026-03-26T17:00:00Z"
  created_by: "docs"
  
  sync_target:
    feature_id: "005-tester-core"
    feature_name: "Tester Core Skills System"
    sync_scope: "full"
    sync_reason: "Feature marked complete, full documentation sync required"
  
  consumed_artifacts:
    - artifact_type: "implementation-summary"
      artifact_path: "specs/005-tester-core/implementation-summary.md"
      consumed_fully: true
      key_fields_extracted:
        - "deliverables"
        - "completion_status"
      gaps_found: []
    - artifact_type: "acceptance-decision-record"
      artifact_path: "specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md"
      consumed_fully: true
      key_fields_extracted:
        - "decision_state"
        - "acceptance_conditions"
      gaps_found: []
  
  touched_sections:
    - document: "README.md"
      section: "Feature Status Table"
      change_type: "update"
      change_description: "Updated 005-tester-core status to Complete with conditions"
      lines_changed: "65"
    - document: "CHANGELOG.md"
      section: "Unreleased"
      change_type: "add"
      change_description: "Added changelog entry for 005-tester-core"
      lines_changed: "12-20"
  
  change_reasons:
    - reason_id: "CR-001"
      section_affected: "README.md#Feature Status Table"
      reason: "Feature accepted with conditions, status reflects conditional completion"
      evidence_source: "acceptance-decision-record decision_state: accept-with-conditions"
      is_minimal: true
  
  consistency_checks:
    - check_id: "CC-001"
      check_name: "README status vs acceptance-decision-record"
      documents_compared:
        - "README.md#Feature Status Table"
        - "acceptance-decision-record-contract.md"
      result: "ALIGNED"
      discrepancy: null
      resolution: null
  
  status_updates:
    - feature: "005-tester-core"
      previous_status: "In Progress"
      new_status: "Complete (with conditions)"
      evidence: "acceptance-decision-record decision_state: accept-with-conditions"
      evidence_source: "acceptance-decision-record-contract.md"
  
  unresolved_ambiguities:
    - item_id: "UA-001"
      description: "Acceptance conditions require follow-up but are not blocking"
      impact: "Conditions must be tracked and resolved post-acceptance"
      attempted_resolution: "Documented conditions in README"
      blocking: false
      recommended_resolution: "Track conditions in sprint backlog"
  
  recommendation:
    state: "needs-follow-up"
    justification: "Documentation synchronized but conditions require follow-up tracking"
    follow_up_items:
      - "Track acceptance conditions from acceptance-decision-record"
      - "Update README when conditions are resolved"
    blocking_items: []
    next_steps:
      - "OpenClaw may proceed with acceptance"
      - "Track follow-up items for resolution"
```

---

## Example: Blocked Report

```yaml
docs_sync_report:
  dispatch_id: "dispatch_007_003"
  task_id: "T-007-003"
  created_at: "2026-03-26T18:00:00Z"
  created_by: "docs"
  
  sync_target:
    feature_id: "007-docs-core"
    feature_name: "Docs Core Skills System"
    sync_scope: "full"
    sync_reason: "Feature marked complete in task tracker, documentation sync requested"
  
  consumed_artifacts:
    - artifact_type: "completion-report"
      artifact_path: "specs/007-docs-core/completion-report.md"
      consumed_fully: true
      key_fields_extracted:
        - "deliverables_checklist"
      gaps_found:
        - "completion-report shows incomplete deliverables"
    - artifact_type: "acceptance-decision-record"
      artifact_path: "specs/007-docs-core/contracts/acceptance-decision-record-contract.md"
      consumed_fully: false
      gaps_found:
        - "acceptance-decision-record not found - reviewer has not completed review"
  
  touched_sections: []
  
  change_reasons: []
  
  consistency_checks:
    - check_id: "CC-001"
      check_name: "completion-report status vs README status"
      documents_compared:
        - "specs/007-docs-core/completion-report.md"
        - "README.md#Feature Status Table"
      result: "MISALIGNED"
      discrepancy: "completion-report shows Incomplete, README shows Complete"
      resolution: "Cannot resolve - requires reviewer acceptance first"
  
  status_updates: []
  
  unresolved_ambiguities:
    - item_id: "UA-001"
      description: "acceptance-decision-record not available - reviewer has not completed review"
      impact: "Cannot determine actual feature status for documentation"
      attempted_resolution: "Searched for acceptance-decision-record in expected location"
      blocking: true
      recommended_resolution: "Complete reviewer acceptance workflow before docs sync"
    - item_id: "UA-002"
      description: "completion-report shows incomplete deliverables but task tracker shows complete"
      impact: "Documentation would reflect incorrect status"
      attempted_resolution: "Compared completion-report to task tracker"
      blocking: true
      recommended_resolution: "Resolve discrepancy between completion-report and task tracker"
  
  recommendation:
    state: "blocked"
    justification: "Required upstream artifacts missing, cannot complete documentation sync"
    follow_up_items: []
    blocking_items:
      - "acceptance-decision-record not available"
      - "completion-report shows incomplete deliverables"
    next_steps:
      - "Complete reviewer acceptance workflow"
      - "Verify completion-report accurately reflects deliverables"
      - "Re-invoke docs sync after blockers resolved"
```

---

## Quality Checklist

### Structural Validation

- [ ] All 8 required fields present
- [ ] `sync_target` has all sub-fields
- [ ] `consumed_artifacts` has at least one entry
- [ ] `touched_sections` has at least one entry (unless blocked)
- [ ] `change_reasons` has at least one entry (unless blocked)
- [ ] `consistency_checks` has at least one entry
- [ ] `recommendation` has all sub-fields

### Content Validation

- [ ] Every `touched_section` has corresponding `change_reason`
- [ ] Every `change_reason` has `evidence_source`
- [ ] All `consistency_checks` have valid `result` values
- [ ] `recommendation.state` matches actual status of ambiguities

### BR Compliance

- [ ] BR-001: All changes have evidence sources
- [ ] BR-002: Minimal surface area documented per change
- [ ] BR-005: Cross-document consistency checked

### Status Truthfulness

- [ ] No status inflation
- [ ] Status matches evidence in consumed artifacts
- [ ] Discrepancies documented, not hidden

---

## References

- `specs/007-docs-core/spec.md` - Feature specification (AC-001)
- `specs/007-docs-core/downstream-interfaces.md` - Downstream handoff details
- `specs/007-docs-core/role-scope.md` - Docs role boundaries
- `role-definition.md` - 6-role definition (Section 5: docs)
- `io-contract.md` - I/O contract specification