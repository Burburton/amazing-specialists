# Spec-Implementation Diff Checklist

## Overview

This checklist guides reviewers through the complete spec-implementation diff process, ensuring compliance with AH-006, BR-006, BR-008, and BR-009.

---

## Phase 1: Pre-Check Preparation

### 1.1 Document Collection

- [ ] `spec.md` has been read and requirements extracted
- [ ] `design-note` (if available) has been read
- [ ] `implementation-summary` has been read
- [ ] `verification-report` (if available) has been read
- [ ] `changed_files` list has been obtained

### 1.2 Canonical Documents Read

- [ ] `role-definition.md` has been read
- [ ] `package-spec.md` has been read
- [ ] `io-contract.md` has been read
- [ ] `quality-gate.md` has been read
- [ ] `README.md` has been read

### 1.3 Status Documents Read

- [ ] `completion-report.md` has been read
- [ ] Feature status in README has been noted

---

## Phase 2: Spec-Implementation Comparison

### 2.1 Requirements Coverage

For each requirement in spec:

- [ ] Requirement ID recorded
- [ ] Implementation status checked (implemented/partial/not_implemented)
- [ ] Implementation location identified
- [ ] Alignment status determined (aligned/deviation/gap)

### 2.2 Acceptance Criteria Verification

For each acceptance criterion:

- [ ] AC ID recorded
- [ ] AC status verified (PASS/FAIL/PARTIAL)
- [ ] Evidence of satisfaction documented
- [ ] Gaps identified (if any)

### 2.3 Interface Alignment

- [ ] API endpoints match spec
- [ ] Function signatures match spec
- [ ] Request/response formats match spec
- [ ] Error codes match spec

### 2.4 Behavior Alignment

- [ ] Happy path behavior matches spec
- [ ] Error handling matches spec
- [ ] Edge cases handled as specified
- [ ] State transitions match spec

---

## Phase 3: Scope Creep Detection (BR-008)

### 3.1 Non-Goals Check

- [ ] All items in `spec.md` non_goals section identified
- [ ] Implementation checked against each non_goal
- [ ] Any non_goal violations recorded as major findings

### 3.2 Feature Parity Check

- [ ] List of spec features created
- [ ] List of implemented features created
- [ ] Features in implementation but NOT in spec identified
- [ ] Unauthorized features categorized by severity

### 3.3 API Surface Check

- [ ] Spec API endpoints listed
- [ ] Implemented API endpoints listed
- [ ] Endpoints not in spec identified
- [ ] New endpoints flagged for review

### 3.4 Configuration Check

- [ ] Spec-defined configurations listed
- [ ] Implemented configurations listed
- [ ] New configurations not in spec identified

### 3.5 Scope Creep Summary

| Addition Type | Count | Severity |
|---------------|-------|----------|
| non_goals violations | ___ | major |
| Unauthorized features | ___ | major/minor |
| Extra API endpoints | ___ | major/minor |
| Extra configurations | ___ | minor/note |

---

## Phase 4: Governance Alignment Check (AH-006/BR-006)

### 4.1 Role Boundary Check

- [ ] Feature uses only roles defined in `role-definition.md`
- [ ] No new roles introduced without canonical update
- [ ] Role permissions match `role-definition.md`
- [ ] Skill-to-role mapping matches `package-spec.md`

**If new roles found:**
- [ ] Recorded as blocker finding
- [ ] Recommendation: Remove role or update canonical first

### 4.2 Terminology Check

- [ ] Feature uses terminology consistent with canonical documents
- [ ] No conflicting term definitions
- [ ] Legacy terms (spec-writer, task-executor) marked as legacy
- [ ] 6-role terminology used in primary descriptions

**If terminology conflicts found:**
- [ ] Recorded as major finding
- [ ] Canonical value documented
- [ ] Feature value documented

### 4.3 I/O Contract Check

- [ ] Artifact formats match `io-contract.md`
- [ ] Payload formats match `io-contract.md`
- [ ] Escalation formats match `io-contract.md`

### 4.4 Quality Gate Check

- [ ] Severity levels match `quality-gate.md`
- [ ] Gate definitions consistent with canonical
- [ ] Acceptance criteria format matches canonical

### 4.5 Cross-Document Consistency (AH-002)

- [ ] Flow order consistent across spec/plan/tasks
- [ ] Stage status consistent across documents
- [ ] Terminology consistent within feature documents
- [ ] Role boundaries consistent within feature

### 4.6 Governance Conflict Summary

| Conflict Type | Count | Severity |
|---------------|-------|----------|
| Role boundary | ___ | blocker/major |
| Terminology | ___ | major |
| I/O contract | ___ | major |
| Quality gate | ___ | major |

---

## Phase 5: Path Resolution Check (AH-003)

### 5.1 Spec Paths

- [ ] All artifact paths in spec exist
- [ ] All dependency paths in spec exist

### 5.2 Plan Paths

- [ ] All output paths in plan exist
- [ ] All artifact paths in plan exist

### 5.3 Tasks Paths

- [ ] All deliverable paths in tasks exist
- [ ] All output paths in tasks exist

### 5.4 Completion-Report Paths

- [ ] All completed file paths exist
- [ ] All evidence paths exist

### 5.5 Path Resolution Summary

| Document | Paths Checked | Paths Resolved | Failures |
|----------|---------------|----------------|----------|
| spec.md | ___ | ___ | ___ |
| plan.md | ___ | ___ | ___ |
| tasks.md | ___ | ___ | ___ |
| completion-report.md | ___ | ___ | ___ |

---

## Phase 6: Status Truthfulness Check (BR-009/AH-004)

### 6.1 Completion-Report Status

- [ ] Overall status recorded: _______________
- [ ] All AC statuses recorded
- [ ] Known gaps documented

### 6.2 README Status

- [ ] Feature status in README recorded: _______________
- [ ] Gaps disclosed in README: Yes / No

### 6.3 Status Alignment

| completion-report | README | Aligned? |
|-------------------|--------|----------|
| _________ | _________ | Yes / No |

### 6.4 Truthfulness Matrix Check

- [ ] If completion-report = "COMPLETE with known gaps", README ≠ "✅ Complete"
- [ ] If completion-report = "PARTIAL", README ≠ "✅ Complete"
- [ ] All known gaps disclosed in README
- [ ] Status classification correct (a/b/c)

**If status misrepresentation found:**
- [ ] Recorded as major finding
- [ ] Recommendation: Update README or completion-report

---

## Phase 7: Findings Classification

### 7.1 Severity Assignment

For each finding, assign severity per `quality-gate.md`:

| Severity | Definition | Example |
|----------|------------|---------|
| **blocker** | Must fix, blocks milestone | Governance conflict, role violation |
| **major** | Affects downstream or understanding | Status mismatch, path not found |
| **minor** | Improvement needed | Terminology inconsistency |
| **note** | Informational | Style suggestion |

### 7.2 Findings Summary Table

| ID | Severity | Category | Description | BR Reference |
|----|----------|----------|-------------|--------------|
| F-001 | | | | |
| F-002 | | | | |
| F-003 | | | | |

### 7.3 Blocker Count: ___

### 7.4 Major Count: ___

---

## Phase 8: Recommendation Formulation

### 8.1 Decision Matrix

| Condition | Action |
|-----------|--------|
| Any blocker findings | **reject** |
| Any major findings | **request_changes** |
| Only minor/note findings | **approve** (with warnings) |
| No findings | **approve** |

### 8.2 Must-Fix Items (blocker/major)

- [ ] Item 1: _______________
- [ ] Item 2: _______________
- [ ] Item 3: _______________

### 8.3 Should-Fix Items (minor)

- [ ] Item 1: _______________
- [ ] Item 2: _______________

### 8.4 Governance Actions

- [ ] `sync_canonical`: Update canonical document
- [ ] `update_readme`: Sync README status
- [ ] `document_drift`: Document governance deviation

---

## Phase 9: Output Generation

### 9.1 Required Output Fields

- [ ] `dispatch_id` populated
- [ ] `task_id` populated
- [ ] `summary.overall_status` set
- [ ] `summary.alignment_percentage` calculated
- [ ] `summary.governance_status` set
- [ ] `comparison` array populated
- [ ] `gaps` array populated
- [ ] `deviations` array populated
- [ ] `additions` array populated (scope creep)
- [ ] `governance_alignment` section included
- [ ] `recommendation` section completed

### 9.2 Governance Alignment Section

- [ ] `canonical_documents_checked` lists all 5 documents
- [ ] `conflicts` array present (empty if no conflicts)
- [ ] `cross_document_consistency` populated
- [ ] `path_resolution` populated
- [ ] `status_truthfulness` populated

---

## Phase 10: Final Review

### 10.1 Completeness Check

- [ ] All phases completed
- [ ] All checklists items reviewed
- [ ] No sections left empty without explanation

### 10.2 Consistency Check

- [ ] Findings match comparison results
- [ ] Recommendation matches finding severities
- [ ] Must-fix items match blocker/major findings

### 10.3 BR Compliance Summary

| Rule | Status | Notes |
|------|--------|-------|
| BR-001 | ✅/❌ | Evidence-based review |
| BR-006 | ✅/❌ | Governance alignment |
| BR-008 | ✅/❌ | Scope creep detection |
| BR-009 | ✅/❌ | Status truthfulness |

---

## Quick Reference: Finding Severity

| Finding Type | Severity | Rationale |
|--------------|----------|-----------|
| Role boundary violation | **blocker** | Breaks governance model |
| non_goals violation | **major** | Unauthorized scope |
| Status misrepresentation | **major** | Misleading stakeholders |
| Path not found | **major** | Broken references |
| Terminology conflict | **major** | Cross-feature inconsistency |
| Missing AC evidence | **major** | Incomplete verification |
| Missing example | **minor** | Documentation gap |

---

## Quick Reference: Recommendation Actions

| Action | When to Use |
|--------|-------------|
| **approve** | No blocker/major findings |
| **approve** (with warnings) | Only minor/note findings |
| **request_changes** | Has major findings |
| **reject** | Has blocker findings |
| **escalate** | Decision requires human judgment |

---

*This checklist ensures compliance with AH-006, BR-006, BR-008, and BR-009.*