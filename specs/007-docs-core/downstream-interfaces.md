# Downstream Interfaces

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 007-docs-core |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Created** | 2026-03-26 |
| **Purpose** | Define docs handoff to maintainers, users, OpenClaw, and future features |

---

## 1. Purpose

This document defines how downstream consumers receive and use docs role outputs. It establishes the handoff contract ensuring that maintainers can generate release notes, users can find accurate information, OpenClaw can verify documentation sync completion, and future features have a stable documentation baseline.

---

## 2. Downstream Consumers Overview

| Consumer | Receives | Primary Use Case |
|----------|----------|------------------|
| Maintainers | changelog-entry | Release notes preparation |
| Users | Updated README | Accurate feature status and usage |
| OpenClaw | docs-sync-report | Acceptance verification |
| Future Features | Baseline documentation state | Continuity |

---

## 3. Maintainer Interface

### 3.1 What Maintainers Receive

**Primary Artifact**: `changelog-entry`

**Purpose**: Enable maintainers to generate consistent, informative release notes.

### 3.2 changelog-entry Handoff

| Field | Maintainer Use | Format Requirements |
|-------|----------------|---------------------|
| `feature_id` | Release tracking | Alphanumeric ID (e.g., "005-tester-core") |
| `feature_name` | Release notes title | Human-readable name |
| `change_type` | Release categorization | feature / repair / docs-only / governance |
| `summary` | Release bullet point | 1-2 sentences, user-facing |
| `capability_changes` | Feature list | Bullet list of new capabilities |
| `docs_changes` | Documentation notes | Bullet list of doc updates |
| `validation_changes` | Testing notes | Bullet list of test changes |
| `breaking_changes` | Breaking change alert | Explicit disclosure |
| `known_limitations` | Caveats | Bullet list of limitations |
| `related_features` | Cross-reference | List of feature IDs |

### 3.3 Maintainer Consumption Checklist

When receiving changelog-entry, maintainers should verify:

- [ ] `change_type` is one of: feature, repair, docs-only, governance
- [ ] `summary` is suitable for release notes (user-facing language)
- [ ] `breaking_changes` is empty or has explicit content
- [ ] `known_limitations` captures all documented gaps

### 3.4 Maintainer Workflow Integration

```
1. Receive changelog-entry from docs
2. Verify changelog-entry completeness
3. If breaking_changes present:
   - Highlight in release notes
   - Add migration guidance
4. Add to CHANGELOG.md
5. Prepare release notes
```

### 3.5 Example Maintainer Handoff

```yaml
changelog_entry:
  feature_id: "005-tester-core"
  feature_name: "Tester Core Skills System"
  change_type: "feature"
  summary: "Establishes tester as a first-class verification role with complete artifact contracts and validation layer."
  capability_changes:
    - "3 core tester skills: unit-test-design, regression-analysis, edge-case-matrix"
    - "3 artifact contracts: test-scope-report, verification-report, regression-risk-report"
    - "Complete validation layer with checklists and anti-pattern guidance"
  docs_changes:
    - "README updated with tester-core status"
    - "Feature status table updated"
  validation_changes:
    - "All artifact contracts validated against schema"
    - "Skill assets validated against AC-007"
  breaking_changes: []
  known_limitations:
    - "Multi-language documentation not supported (deferred to M4)"
  related_features:
    - "003-architect-core"
    - "004-developer-core"
```

---

## 4. User Interface

### 4.1 What Users Receive

**Primary Artifact**: Updated README.md

**Purpose**: Enable users to find accurate feature status, usage guidance, and project progress.

### 4.2 README Sections Users Depend On

| Section | User Expectation | Docs Responsibility |
|---------|------------------|---------------------|
| Feature Status Table | Accurate completion status | Sync with completion-report, acceptance-decision-record |
| Skills Inventory | Current skill availability | Update after each feature completion |
| Workflow Section | Current execution process | Update when workflow changes |
| Quick Start | Accurate usage instructions | Sync with actual capabilities |
| Known Limitations | Transparent gap disclosure | Document from known_issues, coverage_gaps |

### 4.3 User Consumption Checklist

Users can verify README is current when:

- [ ] Feature status matches actual capability
- [ ] Skills inventory lists all implemented skills
- [ ] Known limitations reflect documented gaps
- [ ] No "Coming Soon" features without explicit status

### 4.4 User-Facing Change Summary

When docs updates README, users should be able to understand:

- What changed (feature, capability, status)
- Why it changed (new feature, bug fix, documentation update)
- Impact on them (new capabilities, breaking changes, known limitations)

### 4.5 Example User-Facing Updates

```markdown
## Feature Status Update

### Added
- Tester Core Skills System (005-tester-core) - Complete
  - 3 new tester skills for verification workflow
  - Complete artifact contracts for test documentation

### Changed
- README feature status table updated to reflect 005 completion
- Skills inventory updated with tester skill details

### Known Limitations
- Multi-language documentation support planned for M4
```

---

## 5. OpenClaw Interface

### 5.1 What OpenClaw Receives

**Primary Artifact**: `docs-sync-report`

**Purpose**: Enable OpenClaw management layer to verify documentation synchronization completion as part of acceptance workflow.

### 5.2 docs-sync-report Handoff

| Field | OpenClaw Use | Decision Impact |
|-------|--------------|-----------------|
| `sync_target` | What was synchronized | Scope verification |
| `consumed_artifacts` | Evidence sources | Traceability verification |
| `touched_sections` | What changed | Change scope verification |
| `change_reasons` | Why changes were made | Rationale verification |
| `consistency_checks` | Cross-document verification | Quality verification |
| `status_updates` | Status changes | State verification |
| `unresolved_ambiguities` | Open issues | Risk assessment |
| `recommendation` | Handoff decision | Acceptance decision |

### 5.3 Recommendation Vocabulary

| Recommendation | Meaning | OpenClaw Action |
|----------------|---------|-----------------|
| `sync-complete` | Documentation fully synchronized | Proceed to final acceptance |
| `needs-follow-up` | Documentation synchronized with follow-up items | Track follow-up, may proceed |
| `blocked` | Cannot synchronize due to blocker | Resolve blocker before proceeding |

### 5.4 OpenClaw Consumption Checklist

When receiving docs-sync-report, OpenClaw should verify:

- [ ] `recommendation` is `sync-complete` or `needs-follow-up` for acceptance
- [ ] `consumed_artifacts` includes all required upstream artifacts
- [ ] `consistency_checks` passed
- [ ] `unresolved_ambiguities` are acceptable risks

### 5.5 OpenClaw Workflow Integration

```
1. Receive docs-sync-report from docs
2. Check recommendation:
   - sync-complete → Proceed to acceptance
   - needs-follow-up → Log follow-up items, may proceed
   - blocked → Resolve blocker, retry docs sync
3. Verify consumed_artifacts against expected upstream
4. Check consistency_checks results
5. Review unresolved_ambiguities for risk
6. Record acceptance if recommendation allows
```

### 5.6 Example OpenClaw Handoff

```yaml
docs_sync_report:
  sync_target: "005-tester-core"
  consumed_artifacts:
    - artifact_type: implementation-summary
      artifact_path: specs/005-tester-core/implementation-summary.md
      consumed_fully: true
    - artifact_type: acceptance-decision-record
      artifact_path: specs/006-reviewer-core/acceptance-decision-record.md
      consumed_fully: true
    - artifact_type: completion-report
      artifact_path: specs/005-tester-core/completion-report.md
      consumed_fully: true
  touched_sections:
    - section: "README.md#skills-inventory"
      change_reason: "Add tester-core skills to skills list"
    - section: "README.md#feature-status"
      change_reason: "Update tester-core status to Complete"
    - section: "CHANGELOG.md"
      change_reason: "Add changelog entry for 005-tester-core"
  consistency_checks:
    - check: "README status vs completion-report"
      result: "ALIGNED"
    - check: "README status vs acceptance-decision-record"
      result: "ALIGNED"
    - check: "Skills inventory vs actual skills"
      result: "ALIGNED"
  status_updates:
    - feature: "005-tester-core"
      previous_status: "In Progress"
      new_status: "Complete"
      evidence: "acceptance-decision-record decision_state: accept"
  unresolved_ambiguities: []
  recommendation: "sync-complete"
```

---

## 6. Future Feature Interface

### 6.1 What Future Features Receive

**Primary Artifact**: Baseline documentation state (README.md, CHANGELOG.md)

**Purpose**: Enable subsequent features to build on stable documentation foundation.

### 6.2 Baseline State Requirements

Future features expect:

| Document | State Requirement | Update Discipline |
|----------|-------------------|-------------------|
| README.md | Accurate feature status | Update after each feature completion |
| CHANGELOG.md | Current changelog entries | Add entry per feature |
| Feature status table | Reflects actual completion | Sync with acceptance-decision-record |

### 6.3 Documentation Baseline Checklist

Before starting a new feature, verify:

- [ ] README reflects previous feature completions
- [ ] Feature status table is current
- [ ] Skills inventory is complete
- [ ] Known limitations are documented

### 6.4 Feature 008 (security-core) Handoff

For the next feature in the sequence (008-security-core):

```yaml
baseline_state:
  features_complete:
    - 003-architect-core
    - 004-developer-core
    - 005-tester-core
    - 006-reviewer-core
    - 007-docs-core
  skills_implemented:
    architect: [requirement-to-design, module-boundary-design, tradeoff-analysis]
    developer: [feature-implementation, bugfix-workflow, code-change-selfcheck]
    tester: [unit-test-design, regression-analysis, edge-case-matrix]
    reviewer: [code-review-checklist, spec-implementation-diff, reject-with-actionable-feedback]
    docs: [readme-sync, changelog-writing]
    security: []  # To be implemented by 008
  documentation_state:
    README_status: "Current as of 007-docs-core"
    CHANGELOG_status: "Current as of 007-docs-core"
```

---

## 7. Blocked State Handling

### 7.1 Blocked Conditions

Docs should emit `recommendation: blocked` when:

| Condition | Description | Required Resolution |
|-----------|-------------|---------------------|
| Missing upstream artifacts | Required artifacts not available | Obtain artifacts |
| Conflicting status claims | completion-report and README disagree | Resolve discrepancy |
| Conflicting evidence | acceptance-decision-record and verification-report conflict | Resolve conflict |
| Major documentation debt | Existing docs require significant restructuring | Allocate effort |
| Governance conflicts | Cross-document consistency broken | Governance sync |

### 7.2 Blocked Report Format

```yaml
docs_sync_report:
  sync_target: "007-docs-core"
  recommendation: "blocked"
  unresolved_ambiguities:
    - item: "acceptance-decision-record not available"
      impact: "Cannot determine feature status for README"
      required_resolution: "Complete reviewer acceptance before docs sync"
  blocking_points:
    - "acceptance-decision-record missing"
    - "verification-report has confidence_level: LOW"
  recommended_next_steps:
    - "Complete reviewer acceptance workflow"
    - "Re-run verification to achieve confidence_level: FULL or PARTIAL"
```

### 7.3 Blocked Resolution Flow

```
1. Docs emits blocked report
2. OpenClaw receives blocked status
3. OpenClaw routes to appropriate role:
   - Missing artifacts → Request from producing role
   - Conflicting status → Route to reviewer for resolution
   - Documentation debt → Allocate to appropriate effort
4. Resolution applied
5. Docs re-invoked
```

---

## 8. Recommendation Semantics

### 8.1 sync-complete

**Definition**: Documentation fully synchronized with no blocking issues.

**Requirements**:
- All required upstream artifacts consumed
- Consistency checks passed
- No unresolved ambiguities blocking documentation
- README, CHANGELOG updated appropriately

**Downstream Action**: Proceed to final acceptance.

### 8.2 needs-follow-up

**Definition**: Documentation synchronized with follow-up items that don't block acceptance.

**Requirements**:
- Core documentation updated
- Follow-up items documented
- No blocking issues

**Downstream Action**: Proceed with tracking follow-up items.

### 8.3 blocked

**Definition**: Cannot synchronize documentation due to blocking issues.

**Requirements**:
- Blocking issues documented
- Resolution path identified

**Downstream Action**: Resolve blocker before proceeding.

---

## 9. Artifact Persistence

### 9.1 Storage Location

| Artifact | Location | Naming Convention |
|----------|----------|-------------------|
| docs-sync-report | `specs/<feature-id>/docs-sync-report.md` | Feature-specific |
| changelog-entry | `specs/<feature-id>/changelog-entry.md` | Feature-specific |
| Updated README | Repository root | `README.md` |
| Updated CHANGELOG | Repository root | `CHANGELOG.md` |

### 9.2 Retention

- `docs-sync-report`: Retained for audit trail
- `changelog-entry`: Retained for traceability
- README/CHANGELOG updates: Part of version control history

---

## 10. Validation Checklist

### 10.1 Maintainer Interface Validation

- [ ] changelog-entry has all 10 required fields
- [ ] change_type is valid enum value
- [ ] summary is user-facing language
- [ ] breaking_changes explicitly documented

### 10.2 User Interface Validation

- [ ] README status matches acceptance-decision-record
- [ ] Skills inventory reflects implemented skills
- [ ] Known limitations documented

### 10.3 OpenClaw Interface Validation

- [ ] docs-sync-report has all 8 required fields
- [ ] recommendation is valid enum value
- [ ] consumed_artifacts documented
- [ ] consistency_checks results present

### 10.4 Future Feature Interface Validation

- [ ] Baseline state documented
- [ ] Previous feature completions reflected in README
- [ ] No documentation drift

---

## References

- `specs/007-docs-core/spec.md` AC-006 - Downstream handoff requirement
- `specs/007-docs-core/contracts/docs-sync-report-contract.md` - Artifact contract
- `specs/007-docs-core/contracts/changelog-entry-contract.md` - Artifact contract
- `role-definition.md` Section 5 - Docs downstream dependencies
- `io-contract.md` - I/O contract specification