# Failure Mode Checklist - Architect Core Validation

## Document Metadata
- **Feature ID**: `003-architect-core`
- **Validation ID**: `VM-002`
- **Version**: 1.0.0
- **Created**: 2026-03-23
- **Purpose**: Artifact-level validation and skill-specific failure mode detection

---

## 1. Purpose and Scope

### 1.1 Purpose

This checklist provides a systematic validation mechanism for architect-core artifacts to ensure:
- All required fields are present and complete
- Artifacts are suitable for downstream consumption (developer, tester, reviewer, docs, security)
- No hidden or unmarked assumptions exist
- All critical boundaries are explicitly defined
- Skill-specific failure modes are detected and remediated

### 1.2 Scope

This checklist applies to:
- `design-note` artifacts (from SKILL-001: requirement-to-design)
- `module-boundaries` artifacts (from SKILL-002: module-boundary-design)
- `risks-and-tradeoffs` artifacts (from SKILL-003: tradeoff-analysis)
- `open-questions` artifacts (from all skills)

### 1.3 When to Use

| Trigger | Action |
|---------|--------|
| After completing a design-note | Run Section 2 + Section 3.1 |
| After completing module-boundaries | Run Section 2 + Section 3.2 |
| After completing risks-and-tradeoffs | Run Section 2 + Section 3.3 |
| Before handing off to downstream roles | Run Section 4 (Cross-Role Validation) |
| During design review | Run full checklist (Sections 2-5) |

---

## 2. Artifact-Level Validation (VM-002)

### 2.1 All Required Fields Present

#### 2.1.1 design-note Required Fields
- [ ] `background` - Context and motivation documented
- [ ] `feature_goal` - What this feature aims to achieve
- [ ] `input_sources` - Where requirements come from
- [ ] `requirement_to_design_mapping` - Explicit mapping table
- [ ] `design_summary` - High-level design overview
- [ ] `constraints` - Limitations and boundaries
- [ ] `non_goals` - Explicit out-of-scope items
- [ ] `assumptions` - Design assumptions made
- [ ] `open_questions` - Unresolved design questions

#### 2.1.2 module-boundaries Required Fields
- [ ] `module_list` - List of modules with names and descriptions
- [ ] `module_responsibilities` - Each module's responsibilities
- [ ] `inputs_outputs` - Input/output for each module
- [ ] `dependency_directions` - How modules depend on each other
- [ ] `integration_seams` - Points where modules connect
- [ ] `future_extension_boundary` - Where extension is allowed
- [ ] `explicit_non_responsibilities` - What each module does NOT do

#### 2.1.3 risks-and-tradeoffs Required Fields
- [ ] `decision_point` - The decision being analyzed
- [ ] `alternatives_considered` - Other options evaluated
- [ ] `selected_approach` - The chosen approach
- [ ] `rejected_approaches` - Approaches not taken and why
- [ ] `tradeoff_rationale` - Reasoning for the selection
- [ ] `risks_introduced` - New risks from this decision
- [ ] `revisit_trigger` - Conditions for re-evaluation

#### 2.1.4 open-questions Required Fields
- [ ] `question` - The unresolved question
- [ ] `why_it_matters` - Impact on design/implementation
- [ ] `temporary_assumption` - Working assumption until resolved
- [ ] `impact_surface` - Affected parts of the system
- [ ] `recommended_next_step` - How to resolve

**Detection Method**: Compare artifact structure against contract definitions in `specs/003-architect-core/contracts/`

**Failure Action**: Block artifact from downstream handoff until all required fields are populated.

---

### 2.2 Suitable for Downstream Consumption

#### 2.2.1 Developer Consumability
- [ ] Can organize implementation structure from module-boundaries
- [ ] Integration seams are clearly marked with entry points
- [ ] Dependencies are explicit (no implicit coupling)
- [ ] Implementation constraints are documented
- [ ] No "figure it out yourself" sections

#### 2.2.2 Tester Consumability
- [ ] Module divisions support test boundary definition
- [ ] Critical paths are identified
- [ ] Boundary conditions are explicit
- [ ] Integration seams are marked for integration testing
- [ ] Risk areas are highlighted

#### 2.2.3 Reviewer Consumability
- [ ] Decision rationale is traceable
- [ ] Trade-off analysis is complete
- [ ] Assumptions are marked for verification
- [ ] Scope boundaries enable clear acceptance criteria
- [ ] Open questions are explicit (not hidden)

#### 2.2.4 Docs Consumability
- [ ] Module responsibility summaries exist
- [ ] Design terminology is defined
- [ ] Key structural decisions are explained
- [ ] Non-goals prevent documentation scope creep

#### 2.2.5 Security Consumability
- [ ] High-risk boundaries are hinted
- [ ] Dependency/boundary info is clear
- [ ] Trust boundary notes are present
- [ ] Authentication/authorization touchpoints marked

**Detection Method**: Ask each downstream role: "Can you start your work from this artifact without asking clarifying questions?"

**Failure Action**: If any role cannot consume the artifact, add missing sections or schedule clarification.

---

### 2.3 No Hidden Unmarked Assumptions

#### 2.3.1 Assumption Detection
- [ ] All assumptions are explicitly marked in `assumptions` field
- [ ] No assumptions embedded in design decisions without labeling
- [ ] Facts vs. assumptions are clearly distinguished
- [ ] Assumptions have impact analysis (what breaks if wrong)
- [ ] Assumptions are testable/verifiable

#### 2.3.2 Hidden Assumption Indicators
Watch for these language patterns that may indicate hidden assumptions:
- [ ] "Obviously..." or "Clearly..." - May hide unexamined assumptions
- [ ] "We assume that..." without documenting in assumptions field
- [ ] "The system will..." without specifying how
- [ ] "Users will..." without user research backing
- [ ] "This should be..." without validation criteria

#### 2.3.3 Assumption Completeness
- [ ] Input gaps are documented as assumptions
- [ ] Missing dependencies are listed as assumptions
- [ ] Ambiguous rules are flagged as assumptions
- [ ] Technology choices include assumptions about future scale
- [ ] Timeline assumptions are explicit (if relevant)

**Detection Method**: Scan artifact for unmarked declarative statements. Ask "What must be true for this to work?"

**Failure Action**: Move hidden assumptions to explicit `assumptions` field with impact analysis.

---

### 2.4 No Missing Critical Boundaries

#### 2.4.1 Scope Boundaries
- [ ] In-scope items are explicit
- [ ] Out-of-scope items (non-goals) are explicit
- [ ] Boundary between current and future work is clear
- [ ] Extension points vs. stable areas are marked

#### 2.4.2 Module Boundaries
- [ ] Each module has single, clear responsibility
- [ ] No overlapping responsibilities between modules
- [ ] Module interfaces are well-defined
- [ ] Cross-module dependencies are explicit

#### 2.4.3 Integration Boundaries
- [ ] Integration seams are identified
- [ ] Handoff protocols are defined
- [ ] Data formats at boundaries are specified
- [ ] Error handling at boundaries is considered

#### 2.4.4 Role Boundaries
- [ ] Architect responsibilities are clear
- [ ] Non-responsibilities are explicit (what architect does NOT do)
- [ ] Downstream handoff points are marked
- [ ] Escalation boundaries are defined

**Detection Method**: Map artifact content against boundary types. Look for "fuzzy" areas where responsibility is unclear.

**Failure Action**: Add explicit boundary definitions to module-boundaries artifact.

---

## 3. Skill-Specific Failure Mode Checklists

### 3.1 SKILL-001 (requirement-to-design) Failure Modes

#### F-001: Rewriting Spec Without Design Structure
- [ ] Does the design-note add organizational structure beyond the spec?
- [ ] Are requirements transformed into technical design elements?
- [ ] Is there a clear requirement → design mapping?
- [ ] Does the design provide implementation guidance, not just restatement?

**Detection Method**: Compare design-note structure against spec structure. If they match 1:1, this is a red flag.

**Remediation**: Add design organization layer: modules, components, data flows, interfaces.

---

#### F-002: Omitting Non-Goals
- [ ] Is the `non_goals` section present?
- [ ] Are non-goals copied from spec, or expanded with design insight?
- [ ] Would a developer know what NOT to build from this document?
- [ ] Are there implicit goals that should be marked as non-goals?

**Detection Method**: Check if non_goals field exists and contains meaningful exclusions.

**Remediation**: Add explicit non-goals section. Ask: "What might someone reasonably build that we don't want?"

---

#### F-003: Assuming Complete Input
- [ ] Are input gaps explicitly documented?
- [ ] Is there an `open_questions` section for missing information?
- [ ] Are assumptions marked where input is incomplete?
- [ ] Does the design acknowledge uncertainty where it exists?

**Detection Method**: Review input_sources. Check if gaps are acknowledged or silently filled.

**Remediation**: Add assumptions and open questions for all input gaps.

---

#### F-004: Skipping Design Layer and Jumping to Implementation
- [ ] Does the design-note stay at design level (what/why)?
- [ ] Are implementation details deferred to developer?
- [ ] Is there a clear separation between design decisions and implementation choices?
- [ ] Would a developer have implementation freedom within this design?

**Detection Method**: Look for specific code structures, library names, or detailed algorithms that should be developer decisions.

**Remediation**: Move implementation details to "implementation notes" or remove. Keep design at architectural level.

---

### 3.2 SKILL-002 (module-boundary-design) Failure Modes

#### F-005: Dividing Modules Only by Folder Structure
- [ ] Are module responsibilities defined beyond directory names?
- [ ] Would the module boundaries still make sense without folder structure?
- [ ] Are responsibilities defined by behavior, not location?
- [ ] Is there a responsibility table independent of file paths?

**Detection Method**: Check if module descriptions can be understood without seeing directory structure.

**Remediation**: Add explicit responsibility definitions. Define modules by what they do, not where they live.

---

#### F-006: Overlapping Responsibilities
- [ ] Can each responsibility be assigned to exactly one module?
- [ ] Are there "shared responsibility" areas that should be clarified?
- [ ] Would two developers know which module to modify for a given change?
- [ ] Is there a responsibility matrix (module x responsibility)?

**Detection Method**: List all responsibilities. Check for duplicates or vague boundaries.

**Remediation**: Refine module boundaries. Use explicit "Module A does X, Module B does NOT do X" statements.

---

#### F-007: No Dependency Directions
- [ ] Is there a dependency map or diagram?
- [ ] Are dependency directions explicit (A → B means A depends on B)?
- [ ] Are circular dependencies identified (if any)?
- [ ] Is the allowed dependency direction documented?

**Detection Method**: Check for dependency_directions field. Verify it specifies direction, not just existence.

**Remediation**: Add explicit dependency map. Use arrows or matrix notation to show direction.

---

#### F-008: No Integration Seam Definitions
- [ ] Are integration seams explicitly listed?
- [ ] Does each seam have defined input/output contracts?
- [ ] Are integration test points identifiable from the seams?
- [ ] Is error handling at seams considered?

**Detection Method**: Look for integration_seams field. Check if seams are actionable for testing.

**Remediation**: Add integration_seams section with entry points, data formats, and error handling.

---

#### F-009: No Future Extension Boundaries
- [ ] Is there a `future_extension_boundary` field?
- [ ] Are extension points explicitly marked?
- [ ] Are stable areas (no extension expected) marked?
- [ ] Would a future developer know where to extend vs. where to leave alone?

**Detection Method**: Check for future_extension_boundary field. Verify it distinguishes extensible from stable.

**Remediation**: Add explicit extension boundaries. Mark "extension allowed here" vs. "stability required here."

---

### 3.3 SKILL-003 (tradeoff-analysis) Failure Modes

#### F-010: Only Writing "Recommended Approach"
- [ ] Is there a `decision_point` field?
- [ ] Is there a `selected_approach` field?
- [ ] Are there ALSO `alternatives_considered` and `rejected_approaches`?
- [ ] Would a reader understand the decision space, not just the conclusion?

**Detection Method**: Check if alternatives_considered and rejected_approaches fields exist and are non-empty.

**Remediation**: Add alternatives analysis. Document at least 2-3 options before the selected one.

---

#### F-011: No Alternatives
- [ ] Are there at least 2 alternatives for each major decision?
- [ ] Are alternatives meaningfully different (not just variations)?
- [ ] Do alternatives have their own pros/cons analysis?
- [ ] Would a reviewer understand what was NOT chosen?

**Detection Method**: Count alternatives per decision. Less than 2 = red flag.

**Remediation**: Add meaningful alternatives. Ask: "What other reasonable approaches exist?"

---

#### F-012: Using Vague Language Instead of Real Trade-Offs
- [ ] Are trade-offs specific (not "better/worse")?
- [ ] Are costs quantified where possible (time, complexity, lines of code)?
- [ ] Are benefits concrete (not just "more flexible")?
- [ ] Would a reviewer understand the actual trade-off being made?

**Detection Method**: Scan for vague terms: "better," "more flexible," "easier." Replace with specifics.

**Remediation**: Replace vague language with concrete comparisons: "Approach A takes X time, Approach B takes Y time."

---

#### F-013: Ignoring Maintenance Costs, Complexity, Collaboration Overhead
- [ ] Are maintenance costs documented for each alternative?
- [ ] Is complexity analyzed (cyclomatic, cognitive, coordination)?
- [ ] Is collaboration overhead considered (team coordination, review burden)?
- [ ] Are long-term costs included, not just short-term gains?

**Detection Method**: Check tradeoff_rationale for cost analysis. Look for "maintenance," "complexity," "team" mentions.

**Remediation**: Add cost analysis sections: maintenance cost, complexity analysis, team coordination impact.

---

## 4. Detection Methods

### 4.1 Automated Detection

| Failure Mode | Detection Approach |
|--------------|-------------------|
| Missing required fields | Schema validation against contract |
| Hidden assumptions | Pattern matching for "assume," "obviously," "clearly" |
| No alternatives | Count fields in risks-and-tradeoffs |
| Empty sections | Length check on required fields |

### 4.2 Manual Detection

| Failure Mode | Detection Approach |
|--------------|-------------------|
| Spec parroting | Compare spec structure vs. design-note structure |
| Folder-driven architecture | Remove folder references. Do modules still make sense? |
| Vague trade-offs | Replace all adjectives with numbers. Does it still work? |
| Overlapping responsibilities | Ask two developers: "Which module does X?" |

### 4.3 Downstream Detection

| Failure Mode | Detection Approach |
|--------------|-------------------|
| Not consumable | Ask downstream: "Can you start work from this?" |
| Missing boundaries | Ask: "Where would you extend this? Where NOT?" |
| Hidden assumptions | Ask: "What must be true for this to work?" |

---

## 5. Remediation Guidance

### 5.1 Remediation Priority

| Severity | Response Time | Action |
|----------|--------------|--------|
| Critical (blocking downstream) | Immediate | Block handoff, fix before proceeding |
| High (quality risk) | Before review | Fix before reviewer engagement |
| Medium (clarity issue) | Before implementation | Fix before developer handoff |
| Low (cosmetic) | Next iteration | Document for future improvement |

### 5.2 Remediation Actions by Failure Mode

#### For SKILL-001 Failures (F-001 to F-004)
1. Add design structure layer (modules, flows, interfaces)
2. Restore non-goals from spec + add design-level non-goals
3. Mark all input gaps as assumptions/open questions
4. Elevate implementation details to design level or defer

#### For SKILL-002 Failures (F-005 to F-009)
1. Define responsibilities by behavior, not folder
2. Create responsibility matrix to eliminate overlap
3. Add explicit dependency direction arrows
4. Document integration seams with contracts
5. Mark extension points vs. stable areas

#### For SKILL-003 Failures (F-010 to F-013)
1. Add alternatives_considered field with 2+ options
2. Document rejected_approaches with reasons
3. Replace vague terms with specific metrics
4. Add maintenance/complexity/collaboration cost analysis

### 5.3 Remediation Verification

After remediation, re-run:
- [ ] Section 2 (Artifact-Level Validation)
- [ ] Relevant Section 3 subsection (Skill-Specific)
- [ ] Section 4 detection method that caught the issue

**Pass Criteria**: All checks pass. Downstream roles confirm consumability.

---

## 6. Usage Instructions

### 6.1 Pre-Handoff Checklist

Before handing artifacts to downstream roles:

1. Run Section 2 (all 4 subsections)
2. Run Section 3 subsections relevant to created artifacts
3. Document any remaining open questions
4. Get sign-off from architect

### 6.2 Review Checklist

During design review:

1. Run full checklist (Sections 2-5)
2. Document any failures found
3. Assign remediation actions
4. Re-run checklist after fixes

### 6.3 Continuous Improvement

After each feature:
- [ ] Record which failure modes were found
- [ ] Track remediation time
- [ ] Identify patterns (recurring failure modes)
- [ ] Update anti-pattern guidance if new patterns emerge

---

## 7. Traceability

| Checklist Item | Spec Reference | Contract Reference |
|----------------|----------------|-------------------|
| VM-002 Section 2 | spec.md:VM-002 | contracts/*-contract.md |
| F-001 to F-004 | spec.md:SKILL-001 | contracts/design-note-contract.md |
| F-005 to F-009 | spec.md:SKILL-002 | contracts/module-boundaries-contract.md |
| F-010 to F-013 | spec.md:SKILL-003 | contracts/risks-and-tradeoffs-contract.md |

---

## 8. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-23 | Initial creation based on spec.md VM-002 and SKILL-001/002/003 |

---

## Appendix A: Quick Reference Card

### Red Flags (Stop Immediately)
- Missing required fields
- Hidden assumptions discovered
- No alternatives in tradeoff analysis
- Downstream cannot consume

### Yellow Flags (Fix Before Review)
- Vague language in trade-offs
- Overlapping responsibilities
- Missing future extension boundaries
- Spec-parroting without design structure

### Green Flags (Ready for Handoff)
- All required fields present
- Explicit assumptions marked
- 2+ alternatives documented
- Downstream confirms consumability
