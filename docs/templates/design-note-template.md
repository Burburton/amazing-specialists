# Design Note Template

**Version**: 1.0.0  
**Created**: 2026-03-27  
**Source Contract**: `specs/003-architect-core/contracts/design-note-contract.md`  
**Producer Role**: `architect`

---

## Purpose

This template provides the standard structure for creating a `design-note` artifact. The design-note is the primary design baseline document that transforms feature specifications into structured technical designs.

---

## Template Structure

Copy and fill in the sections below:

```markdown
# Design Note: [Feature Name]

## Metadata
- **Feature ID**: [e.g., 009-command-hardening]
- **Version**: [e.g., 1.0.0]
- **Created**: [YYYY-MM-DD]
- **Author**: architect

---

## 1. Background

[Minimum 2 sentences explaining context. Must reference the problem being solved and explain why this design is needed now.]

---

## 2. Feature Goal

[Single concise paragraph (3-5 sentences). Must state what success looks like and be testable/verifiable.]

---

## 3. Input Sources

| Source | Type | Mandatory |
|--------|------|-----------|
| [File path or document name] | spec / governance / constraint / context | true / false |

**Types**:
- `spec`: Feature specification file
- `governance`: Governance document (package-spec.md, role-definition.md, etc.)
- `constraint`: External constraint or limitation
- `context`: Supporting context document

---

## 4. Requirement to Design Mapping

| Requirement ID | Requirement Text | Design Decision | Artifact Section |
|----------------|-----------------|-----------------|------------------|
| [BR-001, NFR-001, etc.] | [Brief summary] | [How design addresses this] | [Which section/field] |

---

## 5. Design Summary

[High-level overview of the design approach. 5-10 sentences mentioning key architectural decisions.]

---

## 6. Constraints

| ID | Description | Source | Impact |
|----|-------------|--------|--------|
| [C-001] | [What the constraint is] | [Where it comes from] | [How it affects design] |

---

## 7. Non-Goals

| Item | Rationale | Future Consideration |
|------|-----------|---------------------|
| [Out-of-scope item] | [Why excluded] | true / false |

---

## 8. Assumptions

| ID | Description | Risk If Wrong | Validation Method |
|----|-------------|---------------|-------------------|
| [A-001] | [What is assumed] | [What happens if wrong] | [How to verify] |

---

## 9. Open Questions

| ID | Question | Why It Matters | Temporary Assumption | Impact Surface | Recommended Next Step |
|----|----------|----------------|---------------------|----------------|----------------------|
| [Q-001] | [Unresolved question] | [Impact on design] | [Working assumption] | [Affected areas] | [How to resolve] |
```

---

## Required Fields (9 Total)

Per the contract, the following 9 fields are **mandatory**:

| Field | Type | Description |
|-------|------|-------------|
| `background` | string | Context and motivation for the design |
| `feature_goal` | string | What this feature aims to achieve |
| `input_sources` | array | Where requirements come from |
| `requirement_to_design_mapping` | array | Explicit mapping of requirements to design decisions |
| `design_summary` | string | High-level design overview |
| `constraints` | array | Limitations and boundaries |
| `non_goals` | array | Explicit out-of-scope items |
| `assumptions` | array | Design assumptions made |
| `open_questions` | array | Unresolved design questions |

---

## Field Validation Rules

### background
- Minimum 2 sentences explaining context
- Must reference the problem being solved
- Must explain why this design is needed now

### feature_goal
- Must be a single concise paragraph (3-5 sentences)
- Must state what success looks like
- Must be testable/verifiable

### input_sources
- At least one `spec` type source must be present
- Each source must have a valid file path or document reference
- Mandatory sources must exist

### requirement_to_design_mapping
- Each business rule (BR-001 through BR-00X) must be mapped
- Each non-functional requirement (NFR-001 through NFR-00X) must be mapped
- Design decisions must be specific, not vague restatements
- Artifact section references must be valid field names

### design_summary
- Must provide high-level overview of the design approach
- Must mention key architectural decisions
- Must be understandable without reading the full spec
- Length: 5-10 sentences

### constraints
- All constraints from the spec must be listed
- Each constraint must have a source reference
- Impact must describe design implications, not just restate the constraint

### non_goals
- Must include all "Out of Scope" items from the spec
- Each non-goal must have a clear rationale
- Must prevent scope creep during implementation

### assumptions
- All assumptions from the spec must be listed
- Each assumption must have a risk assessment
- Assumptions must be marked as facts vs. assumptions (no hidden assumptions)

### open_questions
- All open questions from the spec must be listed
- Each question must have a temporary assumption (cannot leave unresolved)
- Recommended next step must be actionable

---

## Anti-Patterns to Avoid

- ❌ **Spec parroting**: Don't restate the spec without adding design structure
- ❌ **Folder-driven design**: Design should not be based on directory structure alone
- ❌ **Silent assumptions**: All assumptions must be explicit
- ❌ **Role bleeding**: Stay within architect boundaries, don't prescribe implementation
- ❌ **Over-abstract**: Design must be actionable for downstream roles

---

## Downstream Consumer Usage

### developer
1. Read `design_summary` for high-level understanding
2. Review `requirement_to_design_mapping` for design rationale
3. Check `constraints` for implementation boundaries
4. Note `assumptions` that may need validation

### tester
1. Use `feature_goal` to derive acceptance criteria
2. Use `constraints` to identify boundary test cases
3. Use `assumptions` to identify validation test cases

### reviewer
1. Verify `requirement_to_design_mapping` completeness
2. Challenge high-risk `assumptions`
3. Ensure `non_goals` are respected

### docs
1. Extract `design_summary` for documentation introduction
2. Use `background` for context sections

---

## References

- Source Contract: `specs/003-architect-core/contracts/design-note-contract.md`
- Feature Spec: `specs/003-architect-core/spec.md`
- Role Definition: `role-definition.md`
- Package Spec: `package-spec.md`