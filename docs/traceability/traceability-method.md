# Traceability Method

## Document Status

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Created** | 2026-03-27 |
| **Feature** | 009-command-hardening |
| **Reference** | BR-004: 追溯链覆盖完整生命周期 |

---

## 1. Purpose

This document defines the standard traceability method for the OpenCode expert package, ensuring:

- Every spec requirement traces to at least one deliverable
- Every deliverable traces back to a requirement or task
- The full lifecycle is covered: 需求→设计→实现→测试→审查→文档
- Auditability and accountability across the development process

---

## 2. Traceability Chain Definition

### 2.1 Lifecycle Stages

The traceability chain covers the complete development lifecycle:

```
Requirement (需求)
    ↓
Design (设计)
    ↓
Implementation (实现)
    ↓
Test (测试)
    ↓
Review (审查)
    ↓
Documentation (文档)
```

### 2.2 Trace Link Types

| Link Type | Direction | Purpose |
|-----------|-----------|---------|
| **SATISFIES** | Forward (Req → Deliverable) | Requirement is satisfied by deliverable |
| **DERIVES** | Backward (Deliverable → Req) | Deliverable derives from requirement |
| **VALIDATES** | Test → Implementation | Test validates implementation correctness |
| **DEPENDS** | Deliverable → Deliverable | Dependency relationship between artifacts |
| **IMPLEMENTED_BY** | Task → Artifact | Task produces specific artifact |

### 2.3 Required Coverage

Each feature must demonstrate traceability coverage for:

| Source | Target | Coverage Requirement |
|--------|--------|---------------------|
| `spec.md` Business Requirements (BR-*) | Deliverables | 100% coverage required |
| `spec.md` Acceptance Criteria (AC-*) | Validation evidence | 100% coverage required |
| `tasks.md` Tasks | Artifacts | 100% coverage required |
| Validation Requirements (VM-*) | Checklists/Reports | 100% coverage required |

---

## 3. Mapping Method

### 3.1 Requirement-to-Deliverable Mapping

**Process**:

1. Extract all requirements from `spec.md` (BR-* and AC-* prefixes)
2. For each requirement, identify:
   - Primary deliverable that satisfies it
   - Supporting deliverables if applicable
3. Verify bidirectional traceability (forward and backward)
4. Document in Traceability Matrix

**Example**:

| Requirement | Description | Primary Deliverable | Supporting Deliverables |
|-------------|-------------|---------------------|------------------------|
| BR-001 | Security Must Be Actionable | security-review-report-contract.md | SKILL.md enhancements |

### 3.2 Task-to-Artifact Mapping

**Process**:

1. Extract all tasks from `tasks.md`
2. For each task, identify:
   - Artifact(s) produced
   - Artifact location (relative path)
   - Artifact type (contract, checklist, template, etc.)
3. Verify task completion implies artifact existence
4. Document in Task-Artifact Matrix

**Example**:

| Task ID | Task Description | Artifact | Path |
|---------|------------------|----------|------|
| T-1.1 | Create role-scope.md | role-scope.md | `specs/008-security-core/role-scope.md` |

### 3.3 Validation-to-Evidence Mapping

**Process**:

1. Extract validation requirements from `spec.md` or `quality-gate.md`
2. For each validation requirement, identify:
   - Checklist or report that validates it
   - Validation result (PASS/PARTIAL/FAIL)
   - Evidence location
3. Document in Validation Matrix

**Example**:

| Validation ID | Type | Evidence | Result |
|---------------|------|----------|--------|
| VM-001 | Skill-Level | skill-level-checklist.md | PASS |

---

## 4. Matrix Format Specification

### 4.1 Standard Table Structure

All traceability matrices use a standard Markdown table format:

```markdown
| [ID Column] | [Description/Type] | [Deliverable/Artifact] | [Status/Path] |
|-------------|--------------------|-------------------------|---------------|
| BR-001 | Description text | deliverable-name | ✅/⚠️/❌ |
```

### 4.2 Status Indicators

| Indicator | Meaning | When to Use |
|-----------|---------|-------------|
| ✅ | Complete/Pass | Deliverable exists and validated |
| ⚠️ | Partial/Known Gap | Deliverable exists but incomplete |
| ❌ | Missing/Failed | Deliverable not found or failed validation |
| 🔄 | In Progress | Currently being implemented |
| ⏳ | Deferred | Planned for future feature |

### 4.3 ID Naming Convention

| Prefix | Source | Example |
|--------|--------|---------|
| `BR-*` | Business Requirements | BR-001, BR-002 |
| `AC-*` | Acceptance Criteria | AC-001, AC-002 |
| `VM-*` | Validation Requirements | VM-001, VM-002 |
| `T-*` | Tasks | T-1.1, T-2.1 |
| `OQ-*` | Open Questions | OQ-001, OQ-002 |
| `GAP-*` | Known Gaps | GAP-001, GAP-002 |

---

## 5. Traceability Verification Rules

### 5.1 Coverage Verification

**Rule**: Every requirement must trace to at least one deliverable.

**Verification Steps**:

1. Count requirements in `spec.md`
2. Count rows in Traceability Matrix
3. Verify: Matrix rows >= Requirements count
4. Verify: No requirement has empty Deliverable column

**Failure Condition**: Any requirement without deliverable linkage = **Verification FAIL**

### 5.2 Bidirectional Verification

**Rule**: Forward and backward traces must be consistent.

**Verification Steps**:

1. For each deliverable, verify it appears in at least one requirement row
2. For each requirement, verify deliverable exists in filesystem
3. Cross-check: Requirement → Deliverable mapping matches Deliverable → Requirement mapping

**Failure Condition**: Orphan deliverable (no requirement linkage) = **Warning**

### 5.3 Completeness Verification

**Rule**: All statuses must be non-empty and valid.

**Verification Steps**:

1. Check every row has Status column populated
2. Validate Status uses valid indicators (✅/⚠️/❌/🔄/⏳)
3. Verify "⚠️" rows have documented gap explanation

**Failure Condition**: Empty Status or undocumented ⚠️ = **Warning**

### 5.4 Path Verification

**Rule**: Declared paths must resolve to actual files.

**Verification Steps**:

1. Extract all paths from matrix
2. Verify each path exists in filesystem
3. Verify path format matches repository structure

**Failure Condition**: Path not found = **Major Finding**

---

## 6. Gap Handling Rules

### 6.1 Gap Discovery

When a gap is discovered:

| Scenario | Action |
|----------|--------|
| Requirement missing deliverable | Document in Known Gaps section, mark as ⚠️ |
| Deliverable missing requirement | Add to matrix, document rationale |
| Partial completion | Document specific gap, assign follow-up feature ID |
| Path not found | Correct path or mark as ❌, investigate |

### 6.2 Gap Classification

| Gap Type | Severity | Documentation Requirement |
|----------|----------|---------------------------|
| **Coverage Gap** | High | Must be documented in Known Gaps section |
| **Quality Gap** | Medium | Document in Known Gaps with remediation plan |
| **Path Gap** | High | Must be corrected before completion |
| **Timing Gap** | Low | Document as deferred item |

### 6.3 Gap Resolution

**Process**:

1. Document gap in completion-report's Known Gaps section
2. Assign GAP-* identifier
3. Determine severity and impact on AC
4. Assign follow-up feature ID if applicable
5. Update README.md if gap affects feature status narrative

**Example Gap Documentation**:

```markdown
| GAP-001 | Example count below spec requirement | AC-003 PARTIAL | No | 003b-architect-examples |
```

### 6.4 Partial Completion Handling

When a feature is complete but has known gaps:

1. Mark feature status as "✅ Complete (Known Gaps)" or "⚠️ Partial"
2. Document each gap with:
   - GAP-* identifier
   - Description
   - AC impact (which AC is affected)
   - Blocking status (Yes/No)
   - Follow-up feature ID
3. Update README.md to reflect accurate status narrative

---

## 7. Usage Guide

### 7.1 When to Create Traceability Matrix

Create traceability matrix during:

- Feature completion report writing (mandatory)
- Spec audit execution (mandatory per AH-003)
- Cross-feature dependency analysis (recommended)
- Quality gate verification (recommended)

### 7.2 Matrix Creation Workflow

```
Step 1: Extract requirements from spec.md
Step 2: Extract tasks from tasks.md
Step 3: Identify deliverables for each requirement
Step 4: Identify artifacts for each task
Step 5: Populate matrix tables
Step 6: Verify coverage and bidirectional traces
Step 7: Document gaps if found
Step 8: Add to completion-report
```

### 7.3 Matrix Review Checklist

| Check | Verification |
|-------|--------------|
| All BR-* requirements covered? | Row count matches BR count |
| All AC-* criteria covered? | Row count matches AC count |
| All tasks mapped to artifacts? | Row count matches task count |
| Status indicators valid? | All use ✅/⚠️/❌/🔄/⏳ |
| Paths resolve to files? | File existence verified |
| ⚠️ rows have gap documentation? | Known Gaps section exists |

### 7.4 Integration with Completion Report

The traceability matrix should be included in completion-report.md as a dedicated section:

```markdown
## Traceability Matrix

### Spec Requirements to Deliverables

| Spec Requirement | Description | Deliverable | Status |
|------------------|-------------|-------------|--------|
| BR-001 | ... | ... | ✅ |

### Validation Requirements to Deliverables

| Validation ID | Type | Deliverable | Status |
|---------------|------|-------------|--------|
| VM-001 | ... | ... | ✅ |

### Task to Artifact Mapping

| Task ID | Description | Artifact | Path |
|---------|-------------|----------|------|
| T-1.1 | ... | ... | `specs/...` |
```

---

## 8. Audit Integration

### 8.1 Audit Hardening Rule AH-003

Per `docs/audit-hardening.md` AH-003:

> **Path Resolution (AH-003)**: spec.md, plan.md, tasks.md, completion-report.md 中声明的关键交付路径必须能 resolve 到真实文件。路径声明错误（即使文件存在但路径写错）= **major**。

Traceability matrix must satisfy AH-003 verification.

### 8.2 Audit Checklist for Traceability

| Audit Check | Severity | Finding Type |
|-------------|----------|--------------|
| Requirement coverage < 100% | blocker | Coverage violation |
| Path not found in filesystem | major | AH-003 violation |
| Undocumented ⚠️ status | major | AH-004 violation |
| Orphan deliverable (no requirement) | minor | Traceability incomplete |
| Matrix format inconsistent | note | Style issue |

---

## 9. Examples

### 9.1 Complete Feature Traceability (008-security-core)

Reference: `specs/008-security-core/completion-report.md`

```markdown
## Traceability Matrix

### Spec Requirements to Deliverables

| Spec Requirement | Description | Deliverable | Status |
|------------------|-------------|-------------|--------|
| BR-001 | Security Must Be Actionable | All findings have location, severity, remediation | ✅ |
| BR-002 | Evidence-Based Findings | Code snippets in all findings | ✅ |
| SKILL-001 | auth-and-permission-review | Enhanced SKILL.md | ✅ |
| AC-001 | security-review-report | Contract defined | ✅ |

### Validation Requirements to Deliverables

| Validation ID | Type | Deliverable | Status |
|---------------|------|-------------|--------|
| VM-001 | Skill-Level | skill-level-checklist.md | ✅ |
| VM-002 | Artifact-Level | artifact-level-checklist.md | ✅ |
```

### 9.2 Gap Documentation Example (003-architect-core)

Reference: `specs/003-architect-core/completion-report.md`

```markdown
### Known Limitations

| Gap ID | Description | AC Impact | Blocking? | Follow-up |
|--------|-------------|-----------|-----------|-----------|
| GAP-001 | Example count: 1/skill vs 3+/skill required | AC-003 PARTIAL | No | 003b-architect-examples |
```

---

## 10. References

- `specs/008-security-core/completion-report.md` - Reference traceability matrix
- `specs/003-architect-core/completion-report.md` - Reference format with known gaps
- `docs/audit-hardening.md` - Audit hardening rules (AH-003, AH-004)
- `quality-gate.md` - Validation requirements
- `AGENTS.md` - Audit Hardening Rule

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial version for 009-command-hardening |