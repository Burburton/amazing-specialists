# Downstream Consumability Checklist

## Document Metadata
- **Validation Model**: VM-003 (Cross-Role Validation)
- **Version**: 1.0.0
- **Created**: 2026-03-23
- **Purpose**: Validate architect artifacts are consumable by downstream roles

---

## 1. Purpose and Scope

### 1.1 Purpose

This checklist ensures that architect output artifacts provide **actionable, stable baselines** for downstream roles. Architect design exists for downstream consumption, not for "looking like architecture documentation."

### 1.2 Scope

This checklist applies to all architect artifacts:
- `design-note`
- `module-boundaries`
- `risks-and-tradeoffs`
- `open-questions`

### 1.3 Validation Timing

**When to use**:
- After completing all 3 core skills (requirement-to-design, module-boundary-design, tradeoff-analysis)
- Before handing off to downstream roles (developer, tester, reviewer, docs, security)
- During design revision cycles

**Who uses this**:
- **architect**: Self-validation before handoff
- **reviewer**: Independent validation of design consumability
- **project lead**: Gate approval for downstream phase entry

---

## 2. Validation Items Per Downstream Role

### 2.1 Developer Consumability Checklist

**Goal**: Verify developer can organize implementation based on architect artifacts.

| ID | Check Item | Artifact | Pass/Fail | Evidence |
|----|------------|----------|-----------|----------|
| D-01 | Can identify **what to implement** from design-note feature_goal | design-note | | |
| D-02 | Can identify **module responsibilities** from module-boundaries module_list | module-boundaries | | |
| D-03 | Can identify **input/output boundaries** for each module | module-boundaries | | |
| D-04 | Can identify **dependency directions** between modules | module-boundaries | | |
| D-05 | Can identify **integration seams** where modules connect | module-boundaries | | |
| D-06 | Can identify **design constraints** that limit implementation choices | design-note | | |
| D-07 | Can identify **non-goals** to avoid scope creep | design-note | | |
| D-08 | Can identify **assumptions** that may affect implementation | design-note | | |
| D-09 | Can identify **open questions** that need resolution before coding | open-questions | | |
| D-10 | Can trace **requirement → design mapping** to understand why | design-note | | |
| D-11 | Can identify **future extension boundaries** for forward-compatible code | module-boundaries | | |
| D-12 | Can identify **explicit non-responsibilities** to avoid over-engineering | module-boundaries | | |

**Pass Criteria**: All 12 items must pass. Any fail blocks handoff to developer.

**Critical Fails** (immediate block):
- D-02: Cannot identify module responsibilities
- D-03: Cannot identify input/output boundaries
- D-06: Cannot identify design constraints

---

### 2.2 Tester Consumability Checklist

**Goal**: Verify tester can organize verification based on architect artifacts.

| ID | Check Item | Artifact | Pass/Fail | Evidence |
|----|------------|----------|-----------|----------|
| T-01 | Can identify **module divisions** for test scope organization | module-boundaries | | |
| T-02 | Can identify **critical paths** from design-summary | design-note | | |
| T-03 | Can identify **boundary conditions** from input/output definitions | module-boundaries | | |
| T-04 | Can identify **integration seams** requiring integration tests | module-boundaries | | |
| T-05 | Can identify **risk areas** from risks-and-tradeoffs | risks-and-tradeoffs | | |
| T-06 | Can identify **assumptions** that need validation | design-note | | |
| T-07 | Can identify **constraints** that limit test approaches | design-note | | |
| T-08 | Can identify **open questions** that affect test planning | open-questions | | |
| T-09 | Can identify **dependency directions** for test ordering | module-boundaries | | |
| T-10 | Can identify **future extension boundaries** for regression test planning | module-boundaries | | |
| T-11 | Can identify **tradeoff rationale** for risk-based test prioritization | risks-and-tradeoffs | | |
| T-12 | Can identify **non-goals** to avoid testing out-of-scope features | design-note | | |

**Pass Criteria**: All 12 items must pass. Any fail blocks handoff to tester.

**Critical Fails** (immediate block):
- T-01: Cannot identify module divisions
- T-04: Cannot identify integration seams
- T-05: Cannot identify risk areas

---

### 2.3 Reviewer Consumability Checklist

**Goal**: Verify reviewer can judge design reasonableness based on architect artifacts.

| ID | Check Item | Artifact | Pass/Fail | Evidence |
|----|------------|----------|-----------|----------|
| R-01 | Can identify **decision rationale** for key design choices | risks-and-tradeoffs | | |
| R-02 | Can identify **alternatives considered** for each decision | risks-and-tradeoffs | | |
| R-03 | Can identify **rejected approaches** and why | risks-and-tradeoffs | | |
| R-04 | Can identify **assumptions** underlying the design | design-note | | |
| R-05 | Can identify **open questions** affecting design quality | open-questions | | |
| R-06 | Can identify **scope boundaries** (in-scope vs out-of-scope) | design-note | | |
| R-07 | Can identify **tradeoff rationale** with costs and benefits | risks-and-tradeoffs | | |
| R-08 | Can identify **revisit triggers** for future design re-evaluation | risks-and-tradeoffs | | |
| R-09 | Can trace **requirement → design mapping** for completeness | design-note | | |
| R-10 | Can identify **module responsibility boundaries** for overlap detection | module-boundaries | | |
| R-11 | Can identify **dependency directions** for coupling analysis | module-boundaries | | |
| R-12 | Can identify **risks introduced** by design decisions | risks-and-tradeoffs | | |

**Pass Criteria**: All 12 items must pass. Any fail blocks handoff to reviewer.

**Critical Fails** (immediate block):
- R-01: Cannot identify decision rationale
- R-02: Cannot identify alternatives considered
- R-04: Cannot identify assumptions

---

### 2.4 Docs Consumability Checklist

**Goal**: Verify docs can organize documentation based on architect artifacts.

| ID | Check Item | Artifact | Pass/Fail | Evidence |
|----|------------|----------|-----------|----------|
| DC-01 | Can extract **module responsibility summaries** for documentation | module-boundaries | | |
| DC-02 | Can extract **design terminology** and definitions | design-note | | |
| DC-03 | Can extract **key structure explanations** for user guides | design-note | | |
| DC-04 | Can extract **module list** for API/structure docs | module-boundaries | | |
| DC-05 | Can extract **integration seam notes** for integration guides | module-boundaries | | |
| DC-06 | Can extract **constraints** for limitations documentation | design-note | | |
| DC-07 | Can extract **non-goals** for scope clarification docs | design-note | | |
| DC-08 | Can extract **assumptions** for context documentation | design-note | | |
| DC-09 | Can extract **open questions** for "known issues" or "future work" docs | open-questions | | |
| DC-10 | Can extract **tradeoff rationale** for design decision documentation | risks-and-tradeoffs | | |
| DC-11 | Can extract **future extension boundaries** for roadmap docs | module-boundaries | | |
| DC-12 | Can extract **background and motivation** for introduction docs | design-note | | |

**Pass Criteria**: All 12 items must pass. Any fail blocks handoff to docs.

**Critical Fails** (immediate block):
- DC-01: Cannot extract module responsibility summaries
- DC-02: Cannot extract design terminology
- DC-03: Cannot extract key structure explanations

---

### 2.5 Security Consumability Checklist

**Goal**: Verify security can organize security review based on architect artifacts.

| ID | Check Item | Artifact | Pass/Fail | Evidence |
|----|------------|----------|-----------|----------|
| S-01 | Can identify **high-risk boundaries** (auth, data, trust boundaries) | module-boundaries | | |
| S-02 | Can identify **dependency/boundary info** for attack surface analysis | module-boundaries | | |
| S-03 | Can identify **trust boundary notes** between modules | module-boundaries | | |
| S-04 | Can identify **risks introduced** by design decisions | risks-and-tradeoffs | | |
| S-05 | Can identify **assumptions** affecting security posture | design-note | | |
| S-06 | Can identify **constraints** that limit security options | design-note | | |
| S-07 | Can identify **open questions** affecting security design | open-questions | | |
| S-08 | Can identify **input/output boundaries** for validation points | module-boundaries | | |
| S-09 | Can identify **integration seams** for interface security review | module-boundaries | | |
| S-10 | Can identify **tradeoff rationale** affecting security vs. other concerns | risks-and-tradeoffs | | |
| S-11 | Can identify **module responsibilities** for security boundary assignment | module-boundaries | | |
| S-12 | Can identify **revisit triggers** for security re-evaluation | risks-and-tradeoffs | | |

**Pass Criteria**: All 12 items must pass. Any fail blocks handoff to security.

**Critical Fails** (immediate block):
- S-01: Cannot identify high-risk boundaries
- S-03: Cannot identify trust boundary notes
- S-08: Cannot identify input/output boundaries

---

## 3. Per-Artifact Validation Criteria

### 3.1 design-note Validation

| Field | Required | Validation Criteria |
|-------|----------|---------------------|
| `background` | Yes | Provides context and motivation for the design |
| `feature_goal` | Yes | Clearly states what the feature aims to achieve |
| `input_sources` | Yes | Lists where requirements come from |
| `requirement_to_design_mapping` | Yes | Explicit mapping of requirements to design decisions |
| `design_summary` | Yes | High-level design overview understandable by all roles |
| `constraints` | Yes | Lists limitations and boundaries |
| `non_goals` | Yes | Explicit out-of-scope items |
| `assumptions` | Yes | Design assumptions made (distinguished from facts) |
| `open_questions` | Yes | Unresolved design questions |

**Anti-Pattern Checks**:
- [ ] NOT just restating spec without design transformation (AP-001)
- [ ] NOT omitting non-goals (AP-001)
- [ ] NOT assuming complete input without marking assumptions (AP-004)
- [ ] NOT skipping design layer and jumping to implementation (AP-001)

---

### 3.2 module-boundaries Validation

| Field | Required | Validation Criteria |
|-------|----------|---------------------|
| `module_list` | Yes | List of modules with names and descriptions |
| `module_responsibilities` | Yes | Each module's responsibilities (non-overlapping) |
| `inputs_outputs` | Yes | Input/output for each module |
| `dependency_directions` | Yes | How modules depend on each other |
| `integration_seams` | Yes | Points where modules connect |
| `future_extension_boundary` | Yes | Where extension is allowed |
| `explicit_non_responsibilities` | Yes | What each module does NOT do |

**Anti-Pattern Checks**:
- [ ] NOT dividing modules only by folder structure (AP-002)
- [ ] NOT having overlapping responsibilities (AP-002)
- [ ] NOT missing dependency directions (AP-002)
- [ ] NOT missing integration seam definitions (AP-002)
- [ ] NOT missing future extension boundaries (AP-007)

---

### 3.3 risks-and-tradeoffs Validation

| Field | Required | Validation Criteria |
|-------|----------|---------------------|
| `decision_point` | Yes | The decision being analyzed |
| `alternatives_considered` | Yes | Other options evaluated (at least 2) |
| `selected_approach` | Yes | The chosen approach |
| `rejected_approaches` | Yes | Approaches not taken and why |
| `tradeoff_rationale` | Yes | Reasoning for the selection with costs and benefits |
| `risks_introduced` | Yes | New risks from this decision |
| `revisit_trigger` | Yes | Conditions that should trigger re-evaluation |

**Anti-Pattern Checks**:
- [ ] NOT only writing "recommended approach" (AP-003)
- [ ] NOT missing alternatives (AP-003)
- [ ] NOT using vague language instead of real trade-offs (AP-003)
- [ ] NOT ignoring maintenance costs, complexity, collaboration overhead (AP-003)

---

### 3.4 open-questions Validation

| Field | Required | Validation Criteria |
|-------|----------|---------------------|
| `question` | Yes | The unresolved question |
| `why_it_matters` | Yes | Impact on design/implementation |
| `temporary_assumption` | Yes | Working assumption until resolved |
| `impact_surface` | Yes | What parts of the system are affected |
| `recommended_next_step` | Yes | How to resolve this question |

**Anti-Pattern Checks**:
- [ ] NOT hiding uncertainties (AP-004)
- [ ] NOT making silent assumptions (AP-004)

---

## 4. Pass/Fail Criteria

### 4.1 Overall Pass Criteria

**ALL of the following must be true**:

1. **Role Consumability**: All 5 role-specific checklists pass (60 total items)
   - Developer: 12/12 pass
   - Tester: 12/12 pass
   - Reviewer: 12/12 pass
   - Docs: 12/12 pass
   - Security: 12/12 pass

2. **Artifact Completeness**: All 4 artifacts have all required fields
   - design-note: 9/9 fields present
   - module-boundaries: 7/7 fields present
   - risks-and-tradeoffs: 7/7 fields present
   - open-questions: 5/5 fields present (if any open questions exist)

3. **Anti-Pattern Free**: No anti-pattern violations detected
   - AP-001 (Spec Parroting): Not detected
   - AP-002 (Folder-Driven Architecture): Not detected
   - AP-003 (Decision Without Alternatives): Not detected
   - AP-004 (Silent Assumptions): Not detected
   - AP-005 (Role Bleeding): Not detected
   - AP-006 (Over-Abstract Design): Not detected
   - AP-007 (No Future Boundary): Not detected

### 4.2 Fail Classification

| Severity | Criteria | Action |
|----------|----------|--------|
| **Critical** | Any critical fail item (marked in role checklists) | Immediate block, architect must revise |
| **Major** | Any non-critical fail in role checklists | Block, architect must revise |
| **Minor** | Missing non-required fields or documentation issues | Warning, can proceed with notes |
| **Cosmetic** | Formatting, clarity improvements | Optional revision |

### 4.3 Conditional Pass

**Conditional pass** allowed ONLY when:
- All critical items pass
- No more than 3 minor fails total
- All fails have documented mitigation plans
- Downstream roles agree to proceed with known issues

**Conditional pass requires**:
- Documented exceptions in handoff notes
- Explicit agreement from affected downstream roles
- Scheduled revision date for minor issues

---

## 5. Usage Instructions

### 5.1 How to Use This Checklist

**Step 1: Complete Architect Work**
- Complete requirement-to-design skill → design-note
- Complete module-boundary-design skill → module-boundaries
- Complete tradeoff-analysis skill → risks-and-tradeoffs
- Document any open questions → open-questions

**Step 2: Self-Validation (Architect)**
- Architect runs this checklist on own artifacts
- Fill in Pass/Fail for each item
- Document evidence (cite specific sections/paragraphs)
- Fix any fails found

**Step 3: Independent Validation (Reviewer)**
- Reviewer runs this checklist independently
- Compare results with architect self-validation
- Flag any discrepancies
- Escalate unresolved disputes

**Step 4: Handoff Decision**
- If ALL items pass: Approve handoff to downstream roles
- If conditional pass criteria met: Approve with documented exceptions
- If any critical/major fails: Return to architect for revision

**Step 5: Document Results**
- Save completed checklist to `validation/downstream-consumability-results-<date>.md`
- Include in feature completion report
- Track recurring fail patterns for process improvement

---

### 5.2 Evidence Documentation

For each checklist item, provide **specific evidence**:

**Good Evidence**:
- "design-note section 3.2, paragraph 2: 'The API module is responsible for...'"
- "module-boundaries table 1: Lists 5 modules with clear responsibilities"
- "risks-and-tradeoffs decision-003: Compares 3 alternatives with costs"

**Bad Evidence**:
- "It's in the document"
- "See design-note"
- "Architect confirmed verbally"

---

### 5.3 Checklist Template (Copy-Paste Ready)

```markdown
## Validation Results

**Date**: YYYY-MM-DD
**Validator**: [Name/Role]
**Feature**: [Feature ID/Name]

### Role Consumability

| Role | Pass | Fail | Critical Fails | Status |
|------|------|------|----------------|--------|
| Developer | X | X | X | PASS/FAIL |
| Tester | X | X | X | PASS/FAIL |
| Reviewer | X | X | X | PASS/FAIL |
| Docs | X | X | X | PASS/FAIL |
| Security | X | X | X | PASS/FAIL |

### Artifact Completeness

| Artifact | Required Fields | Present | Status |
|----------|----------------|---------|--------|
| design-note | 9 | X | PASS/FAIL |
| module-boundaries | 7 | X | PASS/FAIL |
| risks-and-tradeoffs | 7 | X | PASS/FAIL |
| open-questions | 5 | X | PASS/FAIL |

### Anti-Pattern Check

| Anti-Pattern | Detected | Notes |
|--------------|----------|-------|
| AP-001 | Yes/No | |
| AP-002 | Yes/No | |
| AP-003 | Yes/No | |
| AP-004 | Yes/No | |
| AP-005 | Yes/No | |
| AP-006 | Yes/No | |
| AP-007 | Yes/No | |

### Overall Result: PASS / FAIL / CONDITIONAL PASS

### Exceptions and Notes
[List any exceptions, conditional pass reasons, or follow-up actions]
```

---

### 5.4 Revision Workflow

When checklist fails:

1. **Document the fail**: Record which item(s) failed with evidence
2. **Categorize severity**: Critical / Major / Minor / Cosmetic
3. **Return to architect**: Specify required revisions
4. **Architect revises**: Fix the identified issues
5. **Re-validate**: Run checklist again on revised artifacts
6. **Track patterns**: Note if same fails recur (process improvement needed)

---

## 6. Relationship to Other Validation Models

This checklist (VM-003) works in conjunction with:

- **VM-001** (Skill-Level Validation): Ensures each skill produces correct outputs
- **VM-002** (Artifact-Level Validation): Ensures each artifact has required fields
- **VM-004** (Consistency Validation): Ensures consistency with canonical docs

**Validation Flow**:
```
VM-001 (Skill outputs correct?)
  → VM-002 (Artifacts complete?)
    → VM-003 (Downstream consumable?) ← THIS CHECKLIST
      → VM-004 (Consistent with governance?)
        → Downstream handoff approved
```

---

## 7. Traceability

### 7.1 Backward Traceability

This checklist traces to:
- `spec.md` VM-003: Cross-Role Validation requirements
- `spec.md` Business Rules BR-001 (Design Must Be Consumable)
- `spec.md` Artifact Contracts AC-001 through AC-004
- `package-spec.md` Downstream interface definitions
- `role-definition.md` Role responsibility boundaries

### 7.2 Forward Traceability

This checklist supports:
- Feature 004 (developer-core): Validates developer inputs
- Feature 005 (tester-core): Validates tester inputs
- Feature 006 (reviewer-core): Validates reviewer inputs
- Feature 007 (docs-core): Validates docs inputs
- Feature 008 (security-core): Validates security inputs

---

## 8. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-03-23 | Initial creation based on VM-003 | architect |

---

## 9. References

- `specs/003-architect-core/spec.md` - Feature specification (VM-003)
- `specs/003-architect-core/plan.md` - Implementation plan
- `package-spec.md` - Package governance
- `role-definition.md` - 6-role definitions
- `io-contract.md` - Input/output contracts
- `quality-gate.md` - Quality gate rules
- `specs/003-architect-core/contracts/open-questions-contract.md` - Open questions contract
