# Traceability Matrix Template

## Document Status

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Created** | 2026-03-27 |
| **Feature** | 009-command-hardening |
| **Reference** | traceability-method.md |

---

## 1. Purpose

This document provides standard templates for traceability matrices used in feature completion reports. Use these templates to ensure consistent format across all features.

---

## 2. Template 1: Spec Requirements → Deliverables Matrix

### 2.1 Template Structure

```markdown
## Traceability Matrix

### Spec Requirements to Deliverables

| Spec Requirement | Description | Deliverable | Status |
|------------------|-------------|-------------|--------|
| BR-001 | [Brief description] | [Deliverable name/file] | ✅ |
| BR-002 | [Brief description] | [Deliverable name/file] | ✅ |
| ... | ... | ... | ... |
| AC-001 | [Criterion description] | [Validation artifact] | ✅ |
| AC-002 | [Criterion description] | [Validation artifact] | ⚠️ |
| ... | ... | ... | ... |
```

### 2.2 Column Definitions

| Column | Content | Format |
|--------|---------|--------|
| **Spec Requirement** | Requirement ID | BR-*, AC-*, SKILL-* prefix |
| **Description** | Brief summary | 1-2 lines maximum |
| **Deliverable** | Primary artifact satisfying requirement | File name or artifact type |
| **Status** | Completion status | ✅ / ⚠️ / ❌ / 🔄 / ⏳ |

### 2.3 Usage Example

```markdown
| Spec Requirement | Description | Deliverable | Status |
|------------------|-------------|-------------|--------|
| BR-001 | Security Must Be Actionable | All findings have location, severity, remediation | ✅ |
| BR-002 | Evidence-Based Findings | Code snippets in all findings | ✅ |
| BR-003 | Gate Decision Required | gate_decision field in all reports | ✅ |
| SKILL-001 | auth-and-permission-review | Enhanced SKILL.md | ✅ |
| SKILL-002 | input-validation-review | Enhanced SKILL.md | ✅ |
| AC-001 | security-review-report | Contract defined | ✅ |
| AC-002 | input-validation-review-report | Contract defined | ✅ |
| AC-003 | Core skills validated | Skill-level checklists | ✅ |
```

---

## 3. Template 2: Validation Requirements → Deliverables Matrix

### 3.1 Template Structure

```markdown
### Validation Requirements to Deliverables

| Validation ID | Type | Deliverable | Status |
|---------------|------|-------------|--------|
| VM-001 | [Validation type] | [Artifact name] | ✅ |
| VM-002 | [Validation type] | [Artifact name] | ✅ |
| ... | ... | ... | ... |
```

### 3.2 Column Definitions

| Column | Content | Format |
|--------|---------|--------|
| **Validation ID** | Validation requirement ID | VM-* prefix |
| **Type** | Category of validation | Skill-Level, Artifact-Level, Finding Quality, Governance Alignment, etc. |
| **Deliverable** | Checklist or report validating this | File name |
| **Status** | Validation result | ✅ / ⚠️ / ❌ |

### 3.3 Common Validation Types

| Type | Description | Typical Deliverable |
|------|-------------|---------------------|
| **Skill-Level** | Skill implementation validation | skill-level-checklist.md |
| **Artifact-Level** | Artifact contract validation | artifact-level-checklist.md |
| **Finding Quality** | Finding/report quality validation | finding-quality-checklist.md |
| **Governance Alignment** | Consistency with governance docs | README.md update, AGENTS.md check |
| **Downstream Consumability** | Artifact usable by downstream roles | downstream-consumability-checklist.md |
| **Failure Mode** | Failure handling validation | failure-mode-checklist.md |

### 3.4 Usage Example

```markdown
| Validation ID | Type | Deliverable | Status |
|---------------|------|-------------|--------|
| VM-001 | Skill-Level | skill-level-checklist.md | ✅ |
| VM-002 | Artifact-Level | artifact-level-checklist.md | ✅ |
| VM-003 | Finding Quality | finding-quality-checklist.md | ✅ |
| VM-004 | Governance Alignment | README updated | ✅ |
```

---

## 4. Template 3: Task → Artifact Matrix

### 4.1 Template Structure

```markdown
### Task to Artifact Mapping

| Task ID | Description | Artifact | Path |
|---------|-------------|----------|------|
| T-1.1 | [Task summary] | [Artifact name] | `specs/[feature]/...` |
| T-1.2 | [Task summary] | [Artifact name] | `.opencode/skills/...` |
| ... | ... | ... | ... |
```

### 4.2 Column Definitions

| Column | Content | Format |
|--------|---------|--------|
| **Task ID** | Task identifier | T-[phase].[task] format (e.g., T-1.1, T-2.3) |
| **Description** | Brief task summary | 1 line |
| **Artifact** | Artifact produced | File name or artifact type |
| **Path** | Relative path in repository | `specs/...` or `.opencode/skills/...` |

### 4.3 Usage Example

```markdown
| Task ID | Description | Artifact | Path |
|---------|-------------|----------|------|
| T-1.1 | Create role-scope.md | role-scope.md | `specs/008-security-core/role-scope.md` |
| T-1.2 | Create downstream-interfaces.md | downstream-interfaces.md | `specs/008-security-core/downstream-interfaces.md` |
| T-2.1 | Enhance auth-and-permission-review | SKILL.md | `.opencode/skills/security/auth-and-permission-review/SKILL.md` |
| T-2.2 | Enhance input-validation-review | SKILL.md | `.opencode/skills/security/input-validation-review/SKILL.md` |
| T-3.1 | Create security-review-report contract | contract.md | `specs/008-security-core/contracts/security-review-report-contract.md` |
| T-3.2 | Create input-validation-review-report contract | contract.md | `specs/008-security-core/contracts/input-validation-review-report-contract.md` |
```

---

## 5. Template 4: Acceptance Criteria Assessment Matrix

### 5.1 Template Structure

```markdown
## Acceptance Criteria Assessment

| AC ID | Criterion | Status | Evidence |
|-------|-----------|--------|----------|
| AC-001 | [Criterion description] | ✅ PASS | [Evidence reference] |
| AC-002 | [Criterion description] | ⚠️ PARTIAL | [Gap explanation] |
| AC-003 | [Criterion description] | ❌ FAIL | [Failure reason] |
| ... | ... | ... | ... |

### Overall Assessment: [Complete/Partial/Blocked]

- **Pass**: [N] criteria
- **Partial**: [N] criteria
- **Pending**: [N] criteria
```

### 5.2 Column Definitions

| Column | Content | Format |
|--------|---------|--------|
| **AC ID** | Acceptance criteria ID | AC-* prefix |
| **Criterion** | Criterion description | Full criterion text or summary |
| **Status** | Assessment result | ✅ PASS / ⚠️ PARTIAL / ❌ FAIL / ⏳ PENDING |
| **Evidence** | Evidence of satisfaction | File reference, action taken, or gap explanation |

### 5.3 Usage Example

```markdown
| AC ID | Criterion | Status | Evidence |
|-------|-----------|--------|----------|
| AC-001 | Feature package complete | ✅ PASS | spec.md, plan.md, tasks.md, completion-report.md exist |
| AC-002 | Security role scope formalized | ✅ PASS | role-scope.md complete with all required sections |
| AC-003 | Core skills validated | ✅ PASS | Both skills enhanced with anti-patterns, role boundaries |
| AC-004 | Artifact contracts defined | ✅ PASS | Both contracts with complete field specifications |
| AC-005 | Governance alignment complete | ✅ PASS | skill-development-plan.md aligned, README updated |

### Overall Assessment: **Complete**

- **Pass**: 10 criteria
- **Partial**: 0 criteria
- **Pending**: 0 criteria
```

---

## 6. Template 5: Known Gaps Matrix

### 6.1 Template Structure

```markdown
## Known Gaps

| Gap ID | Description | AC Impact | Blocking? | Follow-up |
|--------|-------------|-----------|-----------|-----------|
| GAP-001 | [Gap description] | AC-XXX PARTIAL | No | [feature-ID] |
| GAP-002 | [Gap description] | AC-XXX PARTIAL | Yes | N/A |
| ... | ... | ... | ... | ... |

### Mitigation

[Explain how gaps are mitigated and whether they block downstream work]
```

### 6.2 Column Definitions

| Column | Content | Format |
|--------|---------|--------|
| **Gap ID** | Gap identifier | GAP-* prefix |
| **Description** | Gap description | What is missing or incomplete |
| **AC Impact** | Which AC is affected | AC-XXX PARTIAL/FAIL |
| **Blocking?** | Does it block completion | Yes/No |
| **Follow-up** | Feature to address gap | Feature ID or "Deferred" |

### 6.3 Usage Example

```markdown
| Gap ID | Description | AC Impact | Blocking? | Follow-up |
|--------|-------------|-----------|-----------|-----------|
| GAP-001 | Example count: 1/skill vs 3+/skill required | AC-003 PARTIAL | No | 003b-architect-examples |
| GAP-002 | Anti-example count: 4 total vs 3+/skill required | AC-003 PARTIAL | No | 003b-architect-examples |

### Mitigation

Core skills are functional; examples can be expanded in follow-up feature `003b-architect-examples`.
This gap does not block downstream development.
```

---

## 7. Template 6: Open Questions Resolution Matrix

### 7.1 Template Structure

```markdown
## Open Questions Resolution

| OQ ID | Question | Resolution |
|-------|----------|------------|
| OQ-001 | [Question text] | ✅ Resolved: [Resolution] / Deferred / N/A |
| OQ-002 | [Question text] | ✅ Resolved: [Resolution] |
| ... | ... | ... |
```

### 7.2 Column Definitions

| Column | Content | Format |
|--------|---------|--------|
| **OQ ID** | Open question ID | OQ-* prefix |
| **Question** | The question posed | Full question text |
| **Resolution** | How it was resolved | ✅ Resolved + explanation, or Deferred |

### 7.3 Usage Example

```markdown
| OQ ID | Question | Resolution |
|-------|----------|------------|
| OQ-001 | Automated Tool Integration? | Out of MVP scope; skills focus on review methodology |
| OQ-002 | Security Review Triggers? | Documented in role-scope.md Section 4 |
| OQ-003 | Finding Re-Review Process? | Documented in downstream-interfaces.md Section 7 |
| OQ-004 | Cross-Skill Findings? | Both skills can report; aggregate at gate decision |
```

---

## 8. Template 7: Task Execution Summary Matrix

### 8.1 Template Structure

```markdown
## Task Execution Summary

| Phase | Tasks | Completed | Blocked | Deferred |
|-------|-------|-----------|---------|----------|
| Phase 1: [Name] | [N] | [N] | [N] | [N] |
| Phase 2: [Name] | [N] | [N] | [N] | [N] |
| ... | ... | ... | ... | ... |
| **Total** | **[N]** | **[N]** | **[N]** | **[N]** |
```

### 8.2 Usage Example

```markdown
| Phase | Tasks | Completed | Blocked | Deferred |
|-------|-------|-----------|---------|----------|
| Phase 1: Role Scope | 3 | 3 | 0 | 0 |
| Phase 2: Skill Taxonomy | 3 | 3 | 0 | 0 |
| Phase 3: Core Skills | 3 | 3 | 0 | 0 |
| Phase 4: Artifact Contracts | 4 | 4 | 0 | 0 |
| Phase 5: Validation Layer | 4 | 4 | 0 | 0 |
| Phase 6: Educational Layer | 3 | 3 | 0 | 0 |
| **Total** | **26** | **26** | **0** | **0** |
```

---

## 9. Combined Completion Report Template

### 9.1 Full Traceability Section

When writing a completion report, include the following traceability section:

```markdown
## Traceability Matrix

### Spec Requirements to Deliverables

| Spec Requirement | Description | Deliverable | Status |
|------------------|-------------|-------------|--------|
| BR-001 | [Description] | [Deliverable] | ✅ |
| BR-002 | [Description] | [Deliverable] | ✅ |
| [Continue for all BR-* and AC-*] |

### Validation Requirements to Deliverables

| Validation ID | Type | Deliverable | Status |
|---------------|------|-------------|--------|
| VM-001 | [Type] | [Deliverable] | ✅ |
| VM-002 | [Type] | [Deliverable] | ✅ |
| [Continue for all VM-*] |

---

## Open Questions Resolution

| OQ ID | Question | Resolution |
|-------|----------|------------|
| OQ-001 | [Question] | [Resolution] |
| [Continue for all OQ-*] |

---

## Known Gaps

| Gap ID | Description | AC Impact | Blocking? | Follow-up |
|--------|-------------|-----------|-----------|-----------|
| [Include if any gaps exist] |

---

## Acceptance Criteria Assessment

| AC ID | Criterion | Status | Evidence |
|-------|-----------|--------|----------|
| AC-001 | [Criterion] | ✅ PASS | [Evidence] |
| [Continue for all AC-*] |

### Overall Assessment: [Complete/Partial/Blocked]

- **Pass**: [N] criteria
- **Partial**: [N] criteria
- **Pending**: [N] criteria
```

---

## 10. Usage Guide

### 10.1 When to Use Each Template

| Template | When to Use | Mandatory? |
|----------|-------------|------------|
| Spec Requirements → Deliverables | Every completion report | Yes |
| Validation Requirements → Deliverables | Every completion report with validation layer | Yes |
| Task → Artifact | Detailed tracking needed | Recommended |
| Acceptance Criteria Assessment | Every completion report | Yes |
| Known Gaps | When gaps exist | Yes (if gaps) |
| Open Questions Resolution | When open questions exist | Yes (if OQs) |
| Task Execution Summary | Large features with phases | Recommended |

### 10.2 Template Selection Workflow

```
1. Check spec.md for BR-* requirements → Use Template 1
2. Check spec.md for AC-* criteria → Use Template 4
3. Check quality-gate.md for VM-* requirements → Use Template 2
4. Check tasks.md for phases → Use Template 7
5. Check for gaps → Use Template 5 (if needed)
6. Check for open questions → Use Template 6 (if needed)
7. Combine into completion report → Use Template 9
```

### 10.3 Best Practices

| Practice | Reason |
|----------|--------|
| Keep descriptions brief | Maintain readability |
| Use consistent status indicators | Standard interpretation |
| Include paths for artifacts | AH-003 compliance |
| Document all gaps honestly | AH-004 compliance |
| Cross-reference governance docs | AH-001 compliance |

---

## 11. References

- `docs/traceability/traceability-method.md` - Traceability methodology
- `specs/008-security-core/completion-report.md` - Complete example
- `specs/003-architect-core/completion-report.md` - Gap example
- `docs/audit-hardening.md` - Audit requirements (AH-003, AH-004)
- `docs/templates/audit-checklist-template.md` - Audit template reference

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial version for 009-command-hardening |