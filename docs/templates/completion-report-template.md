# Completion Report Template

**Version**: 1.0.0  
**Created**: 2026-03-27  
**Source Example**: `specs/008-security-core/completion-report.md`  
**Producer Role**: Feature completion (typically last implementing role)

---

## Purpose

This template provides the standard structure for creating a `completion-report` artifact. The completion-report documents feature completion status, deliverables, traceability, and acceptance criteria assessment.

---

## Template Structure

Copy and fill in the sections below:

```markdown
# Completion Report

## Document Status
- **Feature ID**: `[Feature ID]`
- **Version**: [Version]
- **Status**: ✅ Complete / ⚠️ Partial / ❌ In Progress
- **Created**: [YYYY-MM-DD]
- **Completed**: [YYYY-MM-DD or "In Progress"]
- **Author**: [Role name] (via OpenCode agent)

---

## Executive Summary

[Feature `[Feature ID]` has been [successfully/partially] implemented...]

Include:
- Key deliverables summary
- Core capabilities delivered
- Significant achievements
- Overall completion status

---

## Deliverables Checklist

### Core Capability Deliverables (Phase 1-X)

| Deliverable | Path | Status |
|-------------|------|--------|
| [Document/file name] | `[Path]` | ✅ Complete / ⚠️ Partial |
| ... | ... | ... |

### Educational Assets (if applicable)

| Deliverable | Path | Status |
|-------------|------|--------|
| [Example files] | `[Path]` | ✅ Complete |
| ... | ... | ... |

### Governance & Completion (if applicable)

| Deliverable | Path | Status |
|-------------|------|--------|
| completion-report.md | `[Path]` | ✅ This document |
| README.md update | `README.md` | ✅ Complete / ⚠️ Partial |

---

## Traceability Matrix

### Spec Requirements to Deliverables

| Spec Requirement | Description | Deliverable | Status |
|------------------|-------------|-------------|--------|
| [BR-001] | [Requirement description] | [Deliverable path] | ✅ / ⚠️ |
| [NFR-001] | [NFR description] | [Deliverable path] | ✅ / ⚠️ |
| ... | ... | ... | ... |

### Validation Requirements to Deliverables (if applicable)

| Validation ID | Type | Deliverable | Status |
|---------------|------|-------------|--------|
| [VM-001] | [Type] | [Path] | ✅ |
| ... | ... | ... | ... |

---

## Open Questions Resolution

| OQ ID | Question | Resolution |
|-------|----------|------------|
| [OQ-001] | [Question text] | [How resolved or deferred] |
| ... | ... | ... |

---

## Known Gaps

### Deferred Items (Explicitly Out of Scope)

| Item | Description | Status |
|------|-------------|--------|
| [Item name] | [Description] | Deferred to [M4/Future] |
| ... | ... | ... |

### Partial Deliverables (if applicable)

| Deliverable | Gap Description | Impact |
|-------------|-----------------|--------|
| [Name] | [What's incomplete] | [Impact level] |

---

## Acceptance Criteria Assessment

| AC ID | Criterion | Status | Evidence |
|-------|-----------|--------|----------|
| [AC-001] | [Criterion text] | ✅ Pass / ⚠️ Partial / ❌ Pending | [Evidence path or description] |
| ... | ... | ... | ... |

### Overall Assessment: **Complete / Partial / In Progress**

- **Pass**: [Number] criteria
- **Partial**: [Number] criteria
- **Pending**: [Number] criteria

---

## Milestone or Model Declaration (if applicable)

[If this feature completes a significant milestone, include a declaration section]

**Example: 6-Role Model Complete Declaration**

| Role | Feature ID | Status | Core Skills |
|------|------------|--------|-------------|
| architect | 003-architect-core | ✅ Complete | [Skills summary] |
| developer | 004-developer-core | ✅ Complete | [Skills summary] |
| ... | ... | ... | ... |

---

## Remaining Work

### Items to Complete (if partial)

| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| [Item] | [What remains] | high / medium / low | [Role] |

### All Core Work Complete (if complete)

All tasks and deliverables are complete. No remaining work.

---

## Lessons Learned

1. **[Lesson title]**: [Description of insight]
2. **[Lesson title]**: [Description of insight]
...

---

## References

- `[Feature spec path]` - Feature specification
- `[Feature plan path]` - Implementation plan
- `[Feature tasks path]` - Task breakdown
- `[Role definition path]` - Role definition
- `[Quality gate path]` - Quality gate
- `README.md` - Project overview

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| [Version] | [Date] | [Change description] |
```

---

## Required Sections

Per the example completion report, the following sections are standard:

| Section | Required | Purpose |
|---------|----------|---------|
| Document Status | Yes | Feature identification and status |
| Executive Summary | Yes | High-level completion overview |
| Deliverables Checklist | Yes | List of all deliverables with paths |
| Traceability Matrix | Yes | Requirements mapped to deliverables |
| Open Questions Resolution | Yes | How questions were resolved |
| Known Gaps | Yes | Deferred or incomplete items |
| Acceptance Criteria Assessment | Yes | AC pass/fail with evidence |
| Remaining Work | Yes | What's left or confirmation of completion |
| References | Yes | Source documents |

---

## Document Status Format

```markdown
## Document Status
- **Feature ID**: `[Feature ID]`
- **Version**: [Version]
- **Status**: ✅ Complete / ⚠️ Partial / ❌ In Progress
- **Created**: [YYYY-MM-DD]
- **Completed**: [YYYY-MM-DD or "In Progress"]
- **Author**: [Role name] (via OpenCode agent)
```

---

## Deliverables Table Format

Use consistent table format:

```markdown
| Deliverable | Path | Status |
|-------------|------|--------|
| [Name] | `[Path]` | ✅ Complete / ⚠️ Partial |
```

---

## Acceptance Criteria Assessment Format

```markdown
| AC ID | Criterion | Status | Evidence |
|-------|-----------|--------|----------|
| [AC-XXX] | [Criterion] | ✅ Pass / ⚠️ Partial / ❌ Pending | [Evidence] |
```

### Overall Assessment Values

| Value | When to Use |
|-------|-------------|
| **Complete** | All ACs passed, no blockers |
| **Partial** | Some ACs partial, known gaps documented |
| **In Progress** | Feature not yet complete |

---

## Known Gaps Section

### Two types of gaps:

1. **Deferred Items**: Explicitly out of MVP scope
   - Mark status as "Deferred to M4" or similar
   - Include rationale for deferral

2. **Partial Deliverables**: Incomplete but in scope
   - Describe what's missing
   - Assess impact

---

## Status Truthfulness

Per audit-hardening rules (AH-004):

- **Must NOT** claim "Complete" if partial gaps exist
- Status must match actual evidence
- Partial status must disclose gaps in Known Gaps section
- README status must sync with completion-report status

---

## Anti-Patterns to Avoid

- ❌ **Status inflation**: Don't claim complete if partial
- ❌ **Missing traceability**: All requirements must map to deliverables
- ❌ **Undisclosed gaps**: All known gaps must be documented
- ❌ **No evidence for ACs**: Each AC must have evidence
- ❌ **README mismatch**: Status must sync with README

---

## Downstream Consumer Usage

### reviewer
- Verify AC assessment accuracy
- Check traceability completeness
- Validate status truthfulness

### docs
- Use status for README sync
- Extract summary for documentation

### management
- Use for milestone tracking
- Assess remaining work

---

## References

- Source Example: `specs/008-security-core/completion-report.md`
- Feature Spec: `specs/[feature]/spec.md`
- Audit Hardening: `docs/audit-hardening.md` (AH-004)