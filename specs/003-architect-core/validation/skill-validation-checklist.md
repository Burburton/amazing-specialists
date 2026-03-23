# Skill Validation Checklist

## Document Information
- **Feature ID**: `003-architect-core`
- **Validation Model**: VM-001 (Skill-Level Validation)
- **Version**: 1.0.0
- **Created**: 2026-03-23
- **Purpose**: Validate architect core skills meet VM-001 requirements

---

## 1. Purpose and Scope

### 1.1 Purpose

This checklist provides validators with a structured approach to verify that each architect core skill satisfies VM-001 requirements:
- Inputs are clearly defined
- Outputs are complete
- Checklists are executable
- Examples demonstrate correct usage
- Anti-examples demonstrate common mistakes

### 1.2 Scope

This checklist applies to the three architect core skills:
1. `requirement-to-design`
2. `module-boundary-design`
3. `tradeoff-analysis`

### 1.3 When to Use

Use this checklist when:
- A skill implementation is claimed complete
- Before marking a skill as "validated" in completion reports
- During quality gate reviews for architect-core feature
- When onboarding new contributors to understand skill quality standards

### 1.4 Who Should Use

- **reviewer** role: Primary validator for skill completeness
- **architect** role: Self-validation before submitting for review
- **security** role: Security-relevant skill validation

---

## 2. Validation Items Overview

| Validation Item | requirement-to-design | module-boundary-design | tradeoff-analysis |
|----------------|----------------------|----------------------|------------------|
| Inputs clearly defined | ✓ | ✓ | ✓ |
| Outputs complete | ✓ | ✓ | ✓ |
| Checklists executable | ✓ | ✓ | ✓ |
| Examples demonstrate correct usage | ✓ | ✓ | ✓ |
| Anti-examples demonstrate common mistakes | ✓ | ✓ | ✓ |

---

## 3. Per-Skill Validation Criteria

### 3.1 SKILL-001: requirement-to-design

#### 3.1.1 Inputs Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| I-001 | `spec.md` marked as required input | | |
| I-002 | `plan.md` marked as optional input | | |
| I-003 | Package governance docs marked as required | | |
| I-004 | Feature assumptions marked as optional | | |
| I-005 | Legacy context marked as optional | | |
| I-006 | Input formats clearly specified | | |
| I-007 | Input sources discoverable (file paths or locations) | | |

**Pass Criteria**: All 7 checks must pass.

#### 3.1.2 Outputs Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| O-001 | `design-note` artifact defined with required fields | | |
| O-002 | Requirement-to-design mapping section defined | | |
| O-003 | Assumptions output section defined | | |
| O-004 | Open questions output section defined | | |
| O-005 | Design baseline structure defined | | |
| O-006 | Output artifact location specified | | |
| O-007 | Output format is machine-readable and human-readable | | |

**Pass Criteria**: All 7 checks must pass.

#### 3.1.3 Checklists Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| C-001 | Checklist contains executable steps (not vague guidance) | | |
| C-002 | Each checklist item has clear pass/fail criteria | | |
| C-003 | Checklist covers requirement extraction | | |
| C-004 | Checklist covers structural gap identification | | |
| C-005 | Checklist covers requirement → design mapping | | |
| C-006 | Checklist covers fact vs assumption distinction | | |
| C-007 | Checklist covers open question marking | | |

**Pass Criteria**: All 7 checks must pass.

#### 3.1.4 Examples Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| E-001 | At least one complete example provided | | |
| E-002 | Example shows input `spec.md` excerpt | | |
| E-003 | Example shows output `design-note` excerpt | | |
| E-004 | Example demonstrates requirement → design mapping | | |
| E-005 | Example shows assumptions explicitly marked | | |
| E-006 | Example shows open questions explicitly marked | | |
| E-007 | Example is realistic (not trivialized) | | |

**Pass Criteria**: All 7 checks must pass.

#### 3.1.5 Anti-Examples Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| A-001 | At least one anti-example provided | | |
| A-002 | Anti-example demonstrates "spec parroting" failure mode | | |
| A-003 | Anti-example shows missing non-goals | | |
| A-004 | Anti-example shows hidden assumptions | | |
| A-005 | Anti-example shows jumping to implementation | | |
| A-006 | Anti-example includes explanation of what's wrong | | |
| A-007 | Anti-example includes corrected version reference | | |

**Pass Criteria**: All 7 checks must pass.

---

### 3.2 SKILL-002: module-boundary-design

#### 3.2.1 Inputs Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| I-001 | `design-note` marked as required input | | |
| I-002 | `spec.md` and `plan.md` marked as required | | |
| I-003 | Current repository structure marked as required | | |
| I-004 | io-contract / role-definition marked as optional | | |
| I-005 | Input dependencies clearly ordered | | |
| I-006 | Input formats clearly specified | | |

**Pass Criteria**: All 6 checks must pass.

#### 3.2.2 Outputs Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| O-001 | `module-boundaries` artifact defined | | |
| O-002 | Responsibility table defined | | |
| O-003 | Dependency map defined | | |
| O-004 | Integration seam notes defined | | |
| O-005 | Out-of-scope boundary note defined | | |
| O-006 | Module list with names and descriptions | | |
| O-007 | Input/output for each module | | |
| O-008 | Future extension boundary defined | | |
| O-009 | Explicit non-responsibilities for each module | | |

**Pass Criteria**: All 9 checks must pass.

#### 3.2.3 Checklists Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| C-001 | Checklist covers module division and responsibility assignment | | |
| C-002 | Checklist covers input/output boundary definition | | |
| C-003 | Checklist covers dependency direction specification | | |
| C-004 | Checklist covers extension vs stability marking | | |
| C-005 | Checklist covers downstream role entry points | | |
| C-006 | Each checklist item is executable (action verbs) | | |

**Pass Criteria**: All 6 checks must pass.

#### 3.2.4 Examples Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| E-001 | At least one complete example provided | | |
| E-002 | Example shows module list with clear responsibilities | | |
| E-003 | Example shows dependency map (direction explicit) | | |
| E-004 | Example shows integration seams | | |
| E-005 | Example shows future extension boundaries | | |
| E-006 | Example is from realistic scenario | | |
| E-007 | Example demonstrates downstream consumability | | |

**Pass Criteria**: All 7 checks must pass.

#### 3.2.5 Anti-Examples Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| A-001 | At least one anti-example provided | | |
| A-002 | Anti-example demonstrates "folder-driven architecture" | | |
| A-003 | Anti-example shows overlapping responsibilities | | |
| A-004 | Anti-example shows missing dependency directions | | |
| A-005 | Anti-example shows missing integration seams | | |
| A-006 | Anti-example includes explanation of what's wrong | | |
| A-007 | Anti-example includes corrected version reference | | |

**Pass Criteria**: All 7 checks must pass.

---

### 3.3 SKILL-003: tradeoff-analysis

#### 3.3.1 Inputs Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| I-001 | Design alternatives marked as required | | |
| I-002 | Constraints marked as required | | |
| I-003 | Maintainability concerns marked as optional | | |
| I-004 | Extensibility expectations marked as optional | | |
| I-005 | Risk notes marked as optional | | |
| I-006 | Input sources discoverable | | |

**Pass Criteria**: All 6 checks must pass.

#### 3.3.2 Outputs Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| O-001 | `risks-and-tradeoffs` artifact defined | | |
| O-002 | Decision point field defined | | |
| O-003 | Alternatives considered field defined | | |
| O-004 | Selected approach field defined | | |
| O-005 | Rejected approaches field defined | | |
| O-006 | Tradeoff rationale field defined | | |
| O-007 | Risks introduced field defined | | |
| O-008 | Revisit trigger field defined | | |

**Pass Criteria**: All 8 checks must pass.

#### 3.3.3 Checklists Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| C-001 | Checklist covers approach comparison | | |
| C-002 | Checklist covers selection explanation | | |
| C-003 | Checklist covers rejection rationale | | |
| C-004 | Checklist covers cost documentation | | |
| C-005 | Checklist covers revisit trigger marking | | |
| C-006 | Checklist requires meaningful alternatives (if exist) | | |

**Pass Criteria**: All 6 checks must pass.

#### 3.3.4 Examples Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| E-001 | At least one complete example provided | | |
| E-002 | Example shows at least 2 alternatives compared | | |
| E-003 | Example shows selected approach with rationale | | |
| E-004 | Example shows rejected approaches with reasons | | |
| E-005 | Example shows risks introduced | | |
| E-006 | Example shows revisit triggers | | |
| E-007 | Example demonstrates real trade-offs (not trivial) | | |

**Pass Criteria**: All 7 checks must pass.

#### 3.3.5 Anti-Examples Validation

| Check | Criteria | Pass/Fail | Evidence |
|-------|----------|-----------|----------|
| A-001 | At least one anti-example provided | | |
| A-002 | Anti-example demonstrates "decision without alternatives" | | |
| A-003 | Anti-example shows vague language instead of trade-offs | | |
| A-004 | Anti-example shows missing maintenance costs | | |
| A-005 | Anti-example shows missing revisit triggers | | |
| A-006 | Anti-example includes explanation of what's wrong | | |
| A-007 | Anti-example includes corrected version reference | | |

**Pass Criteria**: All 7 checks must pass.

---

## 4. Pass/Fail Criteria

### 4.1 Overall Pass Criteria

A skill is considered **VALIDATED** when:
- **100%** of Input checks pass
- **100%** of Output checks pass
- **100%** of Checklist checks pass
- **100%** of Example checks pass
- **100%** of Anti-Example checks pass

### 4.2 Partial Pass Criteria

A skill may be marked **CONDITIONAL PASS** when:
- Minor documentation issues exist (typo, formatting)
- Examples need expansion but core structure is sound
- Anti-examples are present but could be more detailed

**Conditions for Conditional Pass**:
1. All critical checks (inputs, outputs, checklists) must pass 100%
2. Example and anti-example checks must pass at least 80%
3. Remediation plan must be documented
4. Remediation must be completed within 7 days

### 4.3 Fail Criteria

A skill **FAILS** validation when:
- Any Input check fails
- Any Output check fails
- Any Checklist check fails
- Example or Anti-Example checks pass less than 80%
- Critical failure modes are not documented

### 4.4 Validation Status Matrix

| Skill | Inputs | Outputs | Checklists | Examples | Anti-Examples | Overall Status |
|-------|--------|---------|------------|----------|---------------|----------------|
| requirement-to-design | /7 | /7 | /7 | /7 | /7 | |
| module-boundary-design | /6 | /9 | /6 | /7 | /7 | |
| tradeoff-analysis | /6 | /8 | /6 | /7 | /7 | |

---

## 5. Usage Instructions for Validators

### 5.1 Preparation

Before starting validation:

1. **Gather Required Materials**:
   - Skill `SKILL.md` files for all 3 skills
   - Example files from each skill's `examples/` directory
   - Anti-example files from each skill's `anti-examples/` directory
   - Template/checklist files from each skill's `templates/` or `checklists/` directory

2. **Set Up Validation Environment**:
   - Create a clean workspace
   - Have spec.md open for reference
   - Prepare validation tracking spreadsheet or document

3. **Review VM-001 Requirements**:
   - Re-read VM-001 from spec.md (section Validation Model)
   - Understand the intent behind each validation item

### 5.2 Execution

For each skill, follow this order:

1. **Inputs Review** (15-20 minutes):
   - Read the skill's input definitions
   - Verify each input has a clear source and format
   - Check that required vs optional is explicitly marked

2. **Outputs Review** (20-30 minutes):
   - Read the skill's output definitions
   - Verify all required fields are present
   - Check that outputs are consumable by downstream roles

3. **Checklists Review** (15-20 minutes):
   - Execute each checklist item manually
   - Verify each item is actionable (has clear pass/fail)
   - Check that checklists cover all required actions from skill definition

4. **Examples Review** (20-30 minutes):
   - Work through each example step-by-step
   - Verify examples match the skill's stated purpose
   - Check that examples are realistic and non-trivial

5. **Anti-Examples Review** (15-20 minutes):
   - Verify anti-examples demonstrate actual failure modes
   - Check that explanations clearly state what's wrong
   - Verify corrected version references are accurate

### 5.3 Documentation

For each skill:

1. **Record Evidence**:
   - Note specific file paths and line numbers
   - Quote relevant excerpts
   - Screenshot or copy critical sections

2. **Mark Pass/Fail**:
   - Use the tables in Section 3
   - Provide brief justification for each mark
   - Note any edge cases or ambiguities

3. **Summarize Findings**:
   - Write a 2-3 sentence summary per skill
   - Highlight strengths
   - Note critical gaps (if any)

### 5.4 Escalation

Escalate to architect role when:
- Validation criteria are ambiguous
- Examples/anti-examples are disputed
- Skill boundaries conflict with other roles

Escalate to reviewer role when:
- Validation is complete and ready for independent review
- Conditional pass requires approval
- Re-validation after remediation is needed

---

## 6. Common Issues and Remedies

### 6.1 Issue: Inputs Vaguely Defined

**Symptom**: Input section says "relevant documents" or "context" without specifying files.

**Remedy**:
1. Require explicit file paths or patterns (e.g., `specs/<feature>/spec.md`)
2. Require required/optional marking for each input
3. Add input format specification (markdown, JSON, etc.)

**Prevention**: Use input template:
```markdown
**Inputs**:
- `<file_path>` (required/optional) - description
```

---

### 6.2 Issue: Outputs Missing Required Fields

**Symptom**: Output artifact definition lacks fields from spec.md artifact contracts.

**Remedy**:
1. Cross-reference with spec.md Artifact Contract section
2. Add all required fields from AC-001 through AC-004
3. Verify field descriptions match spec.md semantics

**Prevention**: Create artifact contract cross-reference checklist.

---

### 6.3 Issue: Checklists Not Executable

**Symptom**: Checklist items like "ensure quality" or "verify completeness" without clear criteria.

**Remedy**:
1. Rewrite each item with action verbs
2. Add explicit pass/fail criteria
3. Test by executing the checklist yourself

**Prevention**: Use checklist item template:
```markdown
- [ ] ACTION: Do X to Y
  - Pass: Z is present and correct
  - Fail: Z is missing or incorrect
```

---

### 6.4 Issue: Examples Too Trivial

**Symptom**: Examples use "Hello World" or oversimplified scenarios.

**Remedy**:
1. Replace with realistic feature scenarios
2. Include edge cases (missing inputs, conflicting constraints)
3. Show partial or incomplete input handling

**Prevention**: Require examples to demonstrate at least 3 of:
- Multiple requirements
- Conflicting constraints
- Non-goal handling
- Assumption marking
- Open question exposure

---

### 6.5 Issue: Anti-Examples Missing Explanations

**Symptom**: Anti-example shows bad code but doesn't explain why it's bad.

**Remedy**:
1. Add "What's Wrong" section to each anti-example
2. Link to specific failure modes from spec.md
3. Add "Corrected Version" reference

**Prevention**: Use anti-example template:
```markdown
## Anti-Example: [Name]

**Bad Example**:
[show bad code]

**What's Wrong**:
- Violation 1: ...
- Violation 2: ...

**Corrected Version**:
See examples/[name]-correct.md
```

---

### 6.6 Issue: Skill Boundaries Unclear

**Symptom**: Skill appears to overlap with developer/reviewer responsibilities.

**Remedy**:
1. Re-read spec.md role definition section
2. Add explicit "Non-Responsibilities" section to skill
3. Cross-reference with downstream role definitions

**Prevention**: Include role boundary checklist in each skill:
```markdown
**This skill does NOT**:
- Write implementation code (developer responsibility)
- Perform final approval (reviewer responsibility)
- [etc.]
```

---

### 6.7 Issue: Examples Don't Match Skill Purpose

**Symptom**: Example demonstrates different behavior than skill's stated goal.

**Remedy**:
1. Re-align example with skill goal statement
2. Add commentary linking example steps to skill goals
3. Remove or relocate off-purpose content

**Prevention**: Start each example with:
```markdown
**This example demonstrates**: [skill goal]
**Input**: [what goes in]
**Output**: [what comes out]
**Key Steps**: [how the skill transforms input to output]
```

---

## 7. Validation Workflow

```
┌─────────────────────────────────────────────────────────┐
│  Validator receives skill for validation                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Phase 1: Preparation                                   │
│  - Gather materials                                     │
│  - Review VM-001 requirements                           │
│  - Set up tracking                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Phase 2: Per-Skill Validation                          │
│  For each of 3 skills:                                  │
│  1. Inputs (✓ all checks)                               │
│  2. Outputs (✓ all checks)                              │
│  3. Checklists (✓ all checks)                           │
│  4. Examples (✓ all checks)                             │
│  5. Anti-Examples (✓ all checks)                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Phase 3: Scoring                                       │
│  - Calculate pass/fail per skill                        │
│  - Document evidence                                    │
│  - Note conditional passes                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                  ┌───────┴───────┐
                  │               │
             All Pass        Any Fail
                  │               │
                  ▼               ▼
┌─────────────────────┐ ┌─────────────────────┐
│ Phase 4a: Complete  │ │ Phase 4b: Remediate │
│ - Mark validated    │ │ - Return to owner   │
│ - Document results  │ │ - Document gaps     │
│ - Notify reviewer   │ │ - Re-validate       │
└─────────────────────┘ └─────────────────────┘
```

---

## 8. Validation Record Template

```markdown
## Validation Record

**Skill**: [skill name]
**Validator**: [role and name]
**Date**: YYYY-MM-DD
**Version**: [skill version]

### Summary

[Brief 2-3 sentence summary of validation outcome]

### Detailed Results

| Category | Checks Passed | Total Checks | Percentage |
|----------|---------------|--------------|------------|
| Inputs   |               |              |            |
| Outputs  |               |              |            |
| Checklists |             |              |            |
| Examples |               |              |            |
| Anti-Examples |          |              |            |
| **Total** |              |              |            |

### Evidence

**Strengths**:
- Point 1
- Point 2

**Gaps** (if any):
- Gap 1 with remediation suggestion
- Gap 2 with remediation suggestion

### Recommendation

- [ ] VALIDATED - All checks pass
- [ ] CONDITIONAL PASS - Minor gaps, remediation plan attached
- [ ] FAILED - Critical gaps, re-validation required

**Next Steps**: [specific actions]
```

---

## 9. References

- `spec.md` - VM-001, VM-002, VM-003, VM-004 validation models
- `package-spec.md` - Package governance rules
- `role-definition.md` - architect role definition
- `quality-gate.md` - Quality gate requirements
- `.opencode/skills/architect/` - Skill implementations

---

## Appendix A: Quick Reference Card

### VM-001 Five Requirements

1. **Inputs Clearly Defined**: Can I find and understand all inputs?
2. **Outputs Complete**: Are all required output fields present?
3. **Checklists Executable**: Can I actually run each checklist item?
4. **Examples Correct**: Do examples show proper skill usage?
5. **Anti-Examples Mistakes**: Do anti-examples show real failures?

### Red Flags (Stop and Escalate)

- ❌ Input says "relevant context" without file paths
- ❌ Output missing required fields from spec.md
- ❌ Checklist says "ensure quality" without criteria
- ❌ Example is trivialized (no real scenario)
- ❌ Anti-example has no explanation

### Green Flags (Proceed)

- ✅ Explicit file paths with required/optional marking
- ✅ All AC-001 through AC-004 fields present
- ✅ Checklist items have action verbs and pass/fail
- ✅ Examples show realistic, multi-requirement scenarios
- ✅ Anti-examples link to failure modes and corrections
