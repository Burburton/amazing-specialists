# 003-architect-core Feature Specification

## Document Status
- **Feature ID**: `003-architect-core`
- **Feature Name**: Architect Core Skills System
- **Version**: 1.0.0
- **Status**: Complete
- **Created**: 2026-03-23
- **Last Updated**: 2026-03-24

---

## Background

### Context

The repository has completed governance migration from legacy 3-skill (`spec-writer` / `architect-auditor` / `task-executor`) to the **6-role formal execution model**. In this model, `architect` occupies the upstream core position of the entire execution chain, responsible for transforming feature specifications into technical design structures.

### Problem Statement

Without a complete architect-core implementation:

1. **Unstable downstream inputs**: developer, tester, reviewer, docs, and security roles lack stable design baselines
2. **Role boundary confusion**: architect responsibilities may bleed into developer/reviewer/security domains
3. **Validation ambiguity**: no clear criteria for evaluating design quality
4. **Traceability gaps**: no structured mapping from requirements to design decisions

### Prior Work

- `002-role-model-alignment`: Completed role semantics unification
- `002b-governance-repair`: Completed governance document consistency closure

---

## Goal

Establish `architect` as a first-class execution role with:

1. **Complete capability system**: 3 core skills with full supporting assets
2. **Stable artifact contracts**: Standard output artifacts consumable by downstream roles
3. **Clear role boundaries**: Explicit responsibilities and non-responsibilities
4. **Validation model**: Quality gates, failure modes, and anti-pattern guidance
5. **Downstream interfaces**: Well-defined handoff protocols to other roles

This is **not** a minimal "bootstrap" implementation but a complete architect-core capability system.

---

## Scope

### In Scope

#### A. Role Boundary Layer
- architect role scope definition
- architect/downstream interface definition
- de-legacy mapping note (relationship to legacy 3-skill)

#### B. Core Skills Layer (3 skills)

| Skill | Purpose |
|-------|---------|
| `requirement-to-design` | Transform feature specs into structured design notes |
| `module-boundary-design` | Define module boundaries, responsibilities, and dependencies |
| `tradeoff-analysis` | Document design decisions with alternatives and rationale |

#### C. Artifact Contract Layer (4 artifacts)

| Artifact | Purpose |
|----------|---------|
| `design-note` | Design baseline document mapping requirements to design |
| `module-boundaries` | Module boundary, responsibility, and dependency definition |
| `risks-and-tradeoffs` | Trade-off analysis with rationale and revisit triggers |
| `open-questions` | Explicit exposure of unresolved design questions |

#### D. Quality and Validation Layer
- Cross-skill validation checklist
- Downstream-consumability checklist
- Failure-mode checklist
- Anti-pattern guidance

#### E. Educational and Example Layer
Each skill must include:
- `SKILL.md` - Skill definition
- `examples/` - Correct usage demonstrations
- `anti-examples/` - Common mistake demonstrations
- `templates/` or `checklists/` - Reusable templates

#### F. Workflow Integration Layer
- Minimal reference points in package/workflow
- Minimal necessary updates to role docs / package docs
- Feature completion delivery rules

### Out of Scope

1. **developer core implementation** - Feature 004
2. **tester core implementation** - Feature 005
3. **reviewer/docs/security core implementations** - Features 006-008
4. **Legacy 3-skill directory deletion** - Future migration
5. **Repository-wide command system overhaul**
6. **Specific business feature code implementation**
7. **Advanced architect skills**:
   - `interface-contract-design`
   - `dependency-shaping`
   - `architecture-risk-framing`
   - `migration-path-design`
   - `extensibility-planning`
   - `operational-boundary-design`

---

## Actors

### Primary Actor: architect

**Mission**: Transform requirements into executable technical designs, define module boundaries, and provide stable baselines for downstream roles.

**Responsibilities**:
- Receive feature specs, governance rules, and context inputs
- Transform requirements, constraints, non-goals, and open questions into structured designs
- Define module boundaries, responsibility layers, dependencies, and integration seams
- Provide trade-off analysis for key design decisions
- Generate consumable design artifacts for downstream roles
- Expose uncertainties as assumptions / risks / open questions

**Non-Responsibilities**:
- Substitute developer for implementation details
- Substitute tester for detailed test case design
- Substitute reviewer for final independent approval
- Substitute docs for complete external documentation
- Substitute security for deep security audits
- Invent input facts without basis

### Downstream Consumers

| Role | Consumes |
|------|----------|
| `developer` | design-note, module-boundaries, implementation constraints, integration seams |
| `tester` | module divisions, critical paths, boundary conditions, integration seams, risk areas |
| `reviewer` | decision rationale, trade-off analysis, assumptions/open questions, scope boundaries |
| `docs` | module responsibility summaries, design terminology, key structure explanations |
| `security` | high-risk boundary hints, dependency/boundary info, trust boundary notes |

---

## Core Workflows

### Workflow 1: New Feature Design

```
spec.md
  → requirement-to-design
    → design-note
      → module-boundary-design
        → module-boundaries
          → tradeoff-analysis
            → risks-and-tradeoffs
              → open-questions
                → downstream roles
```

### Workflow 2: Design Revision

```
existing design artifacts
  + change request / new constraint
    → tradeoff-analysis
      → updated risks-and-tradeoffs
        → updated design-note
          → downstream notification
```

### Workflow 3: Design Review

```
design artifacts
  → reviewer (independent review)
    → feedback
      → architect (revision if needed)
```

---

## Business Rules

### BR-001: Design Must Be Consumable

Architect output exists for downstream consumption, not for "looking like architecture documentation."

**Implication**: All artifacts must have clear fields, explicit assumptions, and actionable content.

### BR-002: Design Must Map Requirements

Architect must explicitly show requirement → design mapping, not just output abstract solutions.

**Implication**: Each design decision must trace to a requirement or constraint.

### BR-003: Boundaries Must Be Clear

Architect-core cannot evolve into a generic planner, nor overlap with reviewer/developer roles.

**Implication**: Explicit non-responsibilities must be documented and enforced.

### BR-004: Uncertainties Must Be Explicit

For input gaps, missing dependencies, or ambiguous rules, architect must output assumptions and open questions rather than implicit guessing.

**Implication**: No hidden assumptions; all uncertainties must be documented.

### BR-005: Skill System Must Be Extensible

Directory structure, templates, and contracts must allow future advanced architect skills.

**Implication**: Use consistent naming conventions and modular organization.

### BR-006: Use 6-Role Formal Semantics

Legacy 3-skill terminology only appears in mapping and compatibility notes, not as the primary narrative framework.

**Implication**: All primary descriptions use architect/developer/tester/reviewer/docs/security terminology.

---

## Artifact Contracts

### AC-001: design-note

**Purpose**: Primary design baseline document承接 spec to architecture transformation results.

**Required Fields**:
| Field | Description |
|-------|-------------|
| `background` | Context and motivation |
| `feature_goal` | What this feature aims to achieve |
| `input_sources` | Where requirements come from |
| `requirement_to_design_mapping` | Explicit mapping of requirements to design decisions |
| `design_summary` | High-level design overview |
| `constraints` | Limitations and boundaries |
| `non_goals` | Explicit out-of-scope items |
| `assumptions` | Design assumptions made |
| `open_questions` | Unresolved design questions |

**Consumers**: developer, tester, reviewer, docs

---

### AC-002: module-boundaries

**Purpose**: Define module boundaries, responsibilities, dependencies, and integration seams.

**Required Fields**:
| Field | Description |
|-------|-------------|
| `module_list` | List of modules with names and descriptions |
| `module_responsibilities` | Each module's responsibilities |
| `inputs_outputs` | Input/output for each module |
| `dependency_directions` | How modules depend on each other |
| `integration_seams` | Points where modules connect |
| `future_extension_boundary` | Where extension is allowed |
| `explicit_non_responsibilities` | What each module does NOT do |

**Consumers**: developer, tester, reviewer, security

---

### AC-003: risks-and-tradeoffs

**Purpose**: Document design decision trade-offs, risks, and revisit conditions.

**Required Fields**:
| Field | Description |
|-------|-------------|
| `decision_point` | The decision being analyzed |
| `alternatives_considered` | Other options evaluated |
| `selected_approach` | The chosen approach |
| `rejected_approaches` | Approaches not taken and why |
| `tradeoff_rationale` | Reasoning for the selection |
| `risks_introduced` | New risks from this decision |
| `revisit_trigger` | Conditions that should trigger re-evaluation |

**Consumers**: reviewer, security, docs, future architect work

---

### AC-004: open-questions

**Purpose**: Explicitly expose unresolved questions affecting design quality.

**Required Fields**:
| Field | Description |
|-------|-------------|
| `question` | The unresolved question |
| `why_it_matters` | Impact on design/implementation |
| `temporary_assumption` | Working assumption until resolved |
| `impact_surface` | What parts of the system are affected |
| `recommended_next_step` | How to resolve this question |

**Consumers**: human decision makers, reviewer, developer, future feature planners

---

## Skill Definitions

### SKILL-001: requirement-to-design

**Goal**: Transform feature spec goals, constraints, non-goals, dependencies, and unresolved items into structured design notes.

**Inputs**:
- `spec.md` (required)
- `plan.md` (optional)
- Package governance docs (required)
- Feature assumptions (optional)
- Legacy context if exists (optional)

**Outputs**:
- `design-note`
- Requirement-to-design mapping section
- Assumptions
- Open questions
- Design baseline

**Required Actions**:
1. Extract functional goals, constraints, and non-goals
2. Identify structural gaps in spec
3. Establish requirement → design mapping
4. Distinguish confirmed facts from assumptions
5. Mark unresolved items needing downstream or human decision

**Quality Standards**:
- Not just rephrasing requirements, but forming design organization
- Non-goals explicitly preserved to avoid design scope creep
- Assumptions and facts clearly distinguished
- Open questions not hidden

**Failure Modes**:
- Rewriting spec without design structure
- Omitting non-goals
- Assuming complete input
- Skipping design layer and jumping to implementation

---

### SKILL-002: module-boundary-design

**Goal**: Define module divisions, responsibility boundaries, dependency directions, integration seams, and future extension boundaries.

**Inputs**:
- `design-note` (required)
- Spec and plan (required)
- Current repository structure (required)
- io-contract / role-definition (optional)

**Outputs**:
- `module-boundaries`
- Responsibility table
- Dependency map
- Integration seam notes
- Out-of-scope boundary note

**Required Actions**:
1. Divide modules and assign responsibilities
2. Define input/output boundaries
3. Specify dependency directions
4. Mark where extension is allowed vs. where stability is required
5. Provide clear entry points for downstream roles

**Quality Standards**:
- Module boundaries have clear responsibilities, not arbitrary groupings
- High-coupling areas explicitly identified
- Module handoffs are clear
- Provides stable review baseline for tester/reviewer

**Failure Modes**:
- Dividing modules only by folder structure
- Overlapping responsibilities
- No dependency directions
- No integration seam definitions
- No future extension boundaries

---

### SKILL-003: tradeoff-analysis

**Goal**: Provide explicit trade-off analysis for key architecture decisions, including alternative evaluations and revisit conditions.

**Inputs**:
- Design alternatives (required)
- Constraints (required)
- Maintainability concerns (optional)
- Extensibility expectations (optional)
- Risk notes (optional)

**Outputs**:
- `risks-and-tradeoffs`
- Chosen approach
- Rejected alternatives
- Risk rationale
- Revisit triggers

**Required Actions**:
1. Compare key approaches
2. Explain why current approach was selected
3. Explain why alternatives were rejected
4. Document costs of current approach
5. Mark conditions for future revisit

**Quality Standards**:
- At least present meaningful alternative analysis (if alternatives exist)
- Not just conclusions; must have rationale
- Must document costs, not just benefits
- Must have revisit triggers

**Failure Modes**:
- Only writing "recommended approach"
- No alternatives
- Using vague language instead of real trade-offs
- Ignoring maintenance costs, complexity, collaboration overhead

---

## Validation Model

### VM-001: Skill-Level Validation

Each skill must be checked for:
- [ ] Inputs are clearly defined
- [ ] Outputs are complete
- [ ] Checklists are executable
- [ ] Examples demonstrate correct usage
- [ ] Anti-examples demonstrate common mistakes

### VM-002: Artifact-Level Validation

Each artifact must be checked for:
- [ ] All required fields present
- [ ] Suitable for downstream consumption
- [ ] No hidden unmarked assumptions
- [ ] No missing critical boundaries

### VM-003: Cross-Role Validation

Must verify architect output is useful for:
- [ ] developer: Can organize implementation based on it
- [ ] tester: Can organize verification based on it
- [ ] reviewer: Can judge design reasonableness based on it

### VM-004: Consistency Validation

Must verify consistency with canonical docs:
- [ ] `package-spec.md`
- [ ] `role-definition.md`
- [ ] `io-contract.md`
- [ ] `quality-gate.md`

---

## Anti-Patterns

### AP-001: Spec Parroting

**Definition**: Just restating spec without design transformation.

**Example**: Copying spec sections into design-note without adding design organization.

**Prevention**: Require explicit requirement → design mapping in each design-note.

---

### AP-002: Folder-Driven Architecture

**Definition**: Pretending module design is complete based only on directory structure.

**Example**: "The modules are: src/api, src/core, src/utils" without defining responsibilities.

**Prevention**: Require explicit responsibility table and dependency map.

---

### AP-003: Decision Without Alternatives

**Definition**: Direct conclusions without trade-off process.

**Example**: "We will use PostgreSQL" without explaining why not MySQL or MongoDB.

**Prevention**: Require alternatives_considered field in risks-and-tradeoffs.

---

### AP-004: Silent Assumptions

**Definition**: Implicit guessing when input is incomplete, without outputting assumptions / open questions.

**Example**: Assuming a feature will be async without documenting the assumption.

**Prevention**: Require assumptions field in design-note; block on critical missing inputs.

---

### AP-005: Role Bleeding

**Definition**: Architect crossing into developer/reviewer/security formal responsibilities.

**Example**: Writing detailed implementation code, or doing final approval.

**Prevention**: Explicit non-responsibilities in role definition; checklist enforcement.

---

### AP-006: Over-Abstract Design

**Definition**: Outputting大量 abstract concepts without consumption value for downstream.

**Example**: Pages of theoretical architecture diagrams without actionable guidance.

**Prevention**: Downstream-consumability checklist validation.

---

### AP-007: No Future Boundary

**Definition**: Not clearly defining future extension vs. current scope boundary.

**Example**: Design that assumes current scope is final, blocking future evolution.

**Prevention**: Require future_extension_boundary in module-boundaries.

---

## Non-functional Requirements

### NFR-001: Discoverability

- Skills must be discoverable via `.opencode/skills/architect/` directory structure
- Each skill must have a clear `SKILL.md` entry point
- Naming conventions must be consistent and self-documenting

### NFR-002: Reusability

- Templates must be usable across different features
- Checklists must be independent of specific feature context
- Examples must demonstrate generalizable patterns

### NFR-003: Maintainability

- Skill definitions must be version-controlled
- Changes to artifacts must be backward-compatible or explicitly versioned
- Documentation must be kept in sync with implementation

### NFR-004: Traceability

- Each design decision must trace to a requirement
- Each artifact must reference its input sources
- Changes must be documented with rationale

---

## Acceptance Criteria

### AC-001: Feature Package Complete

`specs/003-architect-core/` contains complete spec package:
- [ ] `spec.md`
- [ ] `plan.md`
- [ ] `tasks.md`
- [ ] `completion-report.md`

### AC-002: Core Skills Implemented

`.opencode/skills/architect/` contains at least 3 formal core skills:
- [ ] `requirement-to-design/`
- [ ] `module-boundary-design/`
- [ ] `tradeoff-analysis/`

### AC-003: Skill Assets Complete

Each skill has:
- [ ] `SKILL.md`
- [ ] Defined inputs
- [ ] Defined outputs
- [ ] Quality checkpoints
- [ ] Failure modes
- [ ] Example
- [ ] Anti-example
- [ ] Template or checklist

### AC-004: Artifact Contracts Defined

Architect standard artifact contracts are explicit:
- [ ] `design-note` contract
- [ ] `module-boundaries` contract
- [ ] `risks-and-tradeoffs` contract
- [ ] `open-questions` contract

### AC-005: Downstream Interfaces Clear

Architect handoff interfaces to developer/tester/reviewer are documented and outputs are consumable by downstream roles.

### AC-006: Consistency with Canonical Docs

Feature aligns with canonical governance docs and does not re-introduce legacy 3-skill as primary semantic framework.

### AC-007: Anti-Pattern Guidance Established

Anti-pattern guidance exists and can clearly identify typical architect-core failure modes.

### AC-008: Completion Report Quality

`completion-report.md` clearly documents:
- Delivered content
- Uncovered future expansions
- Input value for features 004/005/006

### AC-009: Scope Boundary Maintained

Feature does not cross into developer/tester/reviewer/docs/security core implementation.

### AC-010: First-Class Role Established

Feature can be considered architect role's complete first-phase implementation, not just a bootstrap.

---

## Assumptions

### AS-001: Prior Features Complete

Assumes `002-role-model-alignment` and `002b-governance-repair` are complete.

### AS-002: 6-Role Model Accepted

Assumes 6-role model is the authoritative semantic framework for all subsequent features.

### AS-003: Downstream Features Will Follow

Assumes features 004-008 will be developed to consume architect outputs.

### AS-004: English as Primary Language

Skill content will be primarily in English for broader applicability, with Chinese governance docs for repository consistency.

---

## Open Questions

### OQ-001: Advanced Skill Priority

Which advanced architect skills should be prioritized after core completion?

**Impact**: Affects roadmap for architect capability expansion.

**Temporary Assumption**: Focus on core skills first; advanced skills will be prioritized based on usage feedback.

**Recommended Next Step**: Gather downstream role usage feedback after core implementation.

---

### OQ-002: Integration with Existing 3-Skill

How should architect-core interact with existing `spec-writer` and `architect-auditor` during transition?

**Impact**: Affects bootstrap flow compatibility.

**Temporary Assumption**: 3-skill continues to operate; architect-core provides enhanced capabilities in parallel.

**Recommended Next Step**: Define explicit compatibility layer in plan.md.

---

### OQ-003: Artifact Storage Location

Should architect artifacts be stored in `specs/<feature>/` or a dedicated location?

**Impact**: Affects artifact discovery and traceability.

**Temporary Assumption**: Store in `specs/<feature>/` for feature-level traceability.

**Recommended Next Step**: Confirm in plan.md with rationale.

---

## References

- `docs/infra/feature/003-architect-core-full-feature-design.md` - Full feature design document
- `package-spec.md` - Package governance specification
- `role-definition.md` - 6-role definition
- `io-contract.md` - Input/output contract
- `quality-gate.md` - Quality gate rules
- `docs/architecture/role-model-evolution.md` - Role model evolution strategy
- `docs/infra/migration/skill-to-role-migration.md` - Migration mapping details