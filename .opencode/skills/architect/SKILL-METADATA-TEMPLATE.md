# Skill Metadata Template

This document defines the standard metadata structure for all architect skills.

## Required Metadata Fields

Every skill `SKILL.md` must include the following metadata:

```yaml
---
skill_id: string              # Unique identifier (e.g., "ARCH-001")
skill_name: string            # Display name (e.g., "requirement-to-design")
role: string                  # Always "architect" for this directory
version: string               # Semantic version (e.g., "1.0.0")
purpose: string               # One-sentence description
---
```

## Required Document Sections

### 1. Purpose

- What problem the skill solves
- When to use / when not to use
- Core value proposition

### 2. Inputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| [input_name] | [type] | Yes/No | [description] |

### 3. Outputs

```yaml
[artifact_name]:
  [field_1]: string
  [field_2]: array
  ...
```

### 4. Steps

1. Step 1: [Action]
2. Step 2: [Action]
...

### 5. Checklists

#### Pre-Conditions
- [ ] [Requirement before skill execution]

#### Process Checks
- [ ] [Check during skill execution]

#### Post-Conditions
- [ ] [Validation after skill execution]

### 6. Examples

At least 3 examples demonstrating:
- Normal usage
- Edge case handling
- Partial input handling

### 7. Anti-Examples

At least 3 anti-examples demonstrating:
- Common mistakes
- Failure modes
- What NOT to do

### 8. Failure Modes

| Failure Mode | Symptoms | Handling |
|--------------|----------|----------|
| [mode] | [symptoms] | [handling] |

### 9. Quality Gates

- [ ] [Quality gate 1]
- [ ] [Quality gate 2]

### 10. Notes

- Relationship to other skills
- Downstream consumption guidance
- Version control notes

## Optional Metadata Fields

```yaml
created_at: timestamp          # Creation date
updated_at: timestamp          # Last update date
author: string                 # Original author
related_skills: [string]       # Related skill IDs
artifact_contract: string      # Reference to artifact contract
```

## Example Metadata Block

```yaml
---
skill_id: ARCH-001
skill_name: requirement-to-design
role: architect
version: 1.0.0
purpose: Transform feature specs into structured design notes
created_at: 2026-03-23
artifact_contract: specs/003-architect-core/contracts/design-note-contract.md
related_skills:
  - ARCH-002 (module-boundary-design)
  - ARCH-003 (tradeoff-analysis)
---
```

## Version Control Guidelines

### Version Format

- **MAJOR**: Breaking changes to skill interface
- **MINOR**: New features or capabilities
- **PATCH**: Bug fixes, clarifications, examples

### Change Documentation

All changes must be documented in the skill's revision history:

```markdown
## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-23 | Initial release |
| 1.1.0 | 2026-04-15 | Added edge case handling section |
```

## Downstream Consumption Notes

Each skill should include a section explaining how its outputs are consumed:

```markdown
## Downstream Consumption

This skill's output is consumed by:
- **developer**: [how they use it]
- **tester**: [how they use it]
- **reviewer**: [how they use it]
- **docs**: [how they use it]
- **security**: [how they use it]
```