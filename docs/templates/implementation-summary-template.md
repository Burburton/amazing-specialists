# Implementation Summary Template

**Version**: 1.0.0  
**Created**: 2026-03-27  
**Source Contract**: `specs/004-developer-core/contracts/implementation-summary-contract.md`  
**Producer Role**: `developer`

---

## Purpose

This template provides the standard structure for creating an `implementation-summary` artifact. The implementation-summary documents code changes, goal achievement, and known issues from developer implementation work.

---

## Template Structure

Copy and fill in the sections below:

```markdown
# Implementation Summary: [Task ID]

## Metadata
- **Dispatch ID**: [dispatch_XXX_XXX]
- **Task ID**: [T-XXX-XXX]
- **Created**: [YYYY-MM-DDTHH:MM:SSZ]
- **Author**: developer

---

## 1. Goal Alignment

**Original Goal**: [The task goal]

**Achieved Status**: 
- `true` - Goal fully achieved
- `partial` - Goal partially achieved  
- `false` - Goal not achieved

**Deviations** (if applicable):
| Deviation | Rationale | Approved By |
|-----------|-----------|-------------|
| [Description of deviation] | [Why this happened] | [Approver or null] |

---

## 2. Implementation Approach

**Strategy**: [Overview of implementation strategy]

**Key Decisions**:
| Decision | Reason | Alternatives Considered |
|----------|--------|------------------------|
| [Key technical decision] | [Why chosen] | [Other options evaluated] |

---

## 3. Changed Files

| Path | Change Type | Description | Lines Added | Lines Deleted |
|------|-------------|-------------|-------------|---------------|
| [File path] | added / modified / deleted | [What changed] | [Number] | [Number] |

---

## 4. Dependencies Added (if applicable)

| Name | Version | Reason | Dev Dependency |
|------|---------|--------|----------------|
| [Package name] | [Version] | [Why added] | true / false |

---

## 5. Dependencies Removed (if applicable)

| Name | Reason |
|------|--------|
| [Package name] | [Why removed] |

---

## 6. Tests

| Type | Files | Coverage | Status |
|------|-------|----------|--------|
| unit / integration / e2e | [Test file paths] | [Percentage] | pass / fail / partial |

---

## 7. Self-Check Reference

**Report Path**: [Path to self-check-report]

**Overall Status**: PASS / FAIL_WITH_BLOCKERS / PASS_WITH_WARNINGS

**Blockers Count**: [Number]

**Warnings Count**: [Number]

---

## 8. Known Issues

| Issue ID | Description | Severity | Component | Planned Fix | Workaround |
|----------|-------------|----------|-----------|-------------|------------|
| [ISSUE-XXX] | [Issue description] | low / medium / high | [Component] | [Fix plan or null] | [Workaround or null] |

(If no issues, use empty list: [])

---

## 9. Risks

| Risk ID | Description | Level | Mitigation | Owner |
|---------|-------------|-------|------------|-------|
| [RISK-XXX] | [Risk description] | low / medium / high | [Mitigation strategy] | [Owner] |

(If no risks, use empty list: [])

---

## 10. Performance Notes (optional)

[Any performance observations or benchmarks]

---

## 11. Documentation Updated (if applicable)

| File | Type | Description |
|------|------|-------------|
| [File path] | code_comment / readme / api_doc / changelog | [What was updated] |

---

## 12. Recommendation

**Action**: SEND_TO_TEST / REWORK / ESCALATE

---

## 13. Metrics (optional)

**Time Spent**: [Minutes]

**Blockers Encountered**: [List of blockers faced]
```

---

## Required Fields

Per the contract, the following fields are **mandatory**:

| Field | Required | Notes |
|-------|----------|-------|
| `dispatch_id` | Yes | Must match upstream dispatch |
| `task_id` | Yes | Task identifier |
| `goal_alignment.goal` | Yes | Original task goal |
| `goal_alignment.achieved` | Yes | true / partial / false |
| `implementation.approach` | Yes | Strategy overview |
| `changed_files` | Yes | At least one file |
| `self_check.report_path` | Yes | Path to valid self-check-report |
| `self_check.overall_status` | Yes | PASS / FAIL_WITH_BLOCKERS / PASS_WITH_WARNINGS |
| `known_issues` | Yes | Can be empty list [] |
| `risks` | Yes | Can be empty list [] |
| `recommendation` | Yes | SEND_TO_TEST / REWORK / ESCALATE |

---

## Field Specifications

### goal_alignment.achieved

| Value | Meaning | Next Action |
|-------|---------|-------------|
| `true` | Goal fully achieved | Proceed to tester |
| `partial` | Goal partially achieved | Proceed with documented gaps |
| `false` | Goal not achieved | Rework or escalate |

### changed_files.change_type

| Value | Definition |
|-------|------------|
| `added` | New file created |
| `modified` | Existing file changed |
| `deleted` | File removed |

### recommendation

| Value | When to Use |
|-------|-------------|
| `SEND_TO_TEST` | Implementation complete, self-check passed |
| `REWORK` | Implementation issues need fixing |
| `ESCALATE` | Blocking issue needs decision |

---

## Validation Rules

### R-001: Honest Assessment
- `goal_alignment.achieved` must truthfully reflect implementation status
- `known_issues` must contain ALL known issues (no hiding)
- `risks` must contain ALL identified risks

### R-002: Changed Files Completeness
- Each changed_file must have:
  - Valid `path` (relative, file exists)
  - Valid `change_type` enum
  - Non-empty `description`

### R-003: Traceability
- `dispatch_id` must match upstream dispatch
- `self_check.report_path` must point to valid self-check-report

---

## Anti-Patterns to Avoid

- ❌ **Hiding issues**: Known issues must be reported even if minor
- ❌ **False achievement claims**: Don't claim `achieved: true` if partial
- ❌ **Incomplete file list**: All changed files must be documented
- ❌ **Missing self-check reference**: Must reference actual self-check report

---

## Downstream Consumer Usage

### tester
- Use `changed_files` to determine test scope
- Use `goal_alignment` for acceptance test design
- Note `known_issues` to avoid false positives

### reviewer
- Compare `implementation` to design-note
- Evaluate `goal_alignment.deviations` reasonableness
- Verify `dependencies_added` necessity

### docs
- Extract `goal_alignment` for user-visible changes
- Record `dependencies_added` in installation docs
- Update based on `performance_notes`

---

## References

- Source Contract: `specs/004-developer-core/contracts/implementation-summary-contract.md`
- Feature Spec: `specs/004-developer-core/spec.md`
- Role Scope: `specs/004-developer-core/role-scope.md`