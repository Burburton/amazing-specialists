# 004-developer-core Feature Specification

## Document Status
- **Feature ID**: `004-developer-core`
- **Feature Name**: Developer Core Skills System
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-24
- **Last Updated**: 2026-03-24

---

## Background

### Context

The repository has completed `003-architect-core`, establishing the **architect** role as the upstream design authority. Now we need to implement the **developer** role as the core execution role that transforms design notes into working code.

The developer role sits at the center of the execution flow:
```
architect (design) → developer (implement) → tester (verify) → reviewer (approve)
```

### Problem Statement

Without a complete developer-core implementation:

1. **No formal implementation contract**: architect outputs cannot be stably consumed by implementation
2. **No standardized self-check**: code changes lack systematic pre-delivery validation
3. **No bugfix methodology**: bug fixes lack root cause analysis and regression prevention
4. **Unclear role boundaries**: developer responsibilities may overlap with tester/reviewer
5. **Missing downstream handoff**: outputs are not structured for tester/reviewer consumption

### Prior Work

- `002-role-model-alignment`: Completed role semantics unification
- `002b-governance-repair`: Completed governance document consistency
- `003-architect-core`: Established upstream design artifacts (design-note, module-boundaries, risks-and-tradeoffs)

---

## Goal

Establish `developer` as a first-class execution role with:

1. **Complete capability system**: 3 core skills with full supporting assets
2. **Stable artifact contracts**: Standard output artifacts consumable by downstream roles
3. **Clear role boundaries**: Explicit responsibilities and non-responsibilities
4. **Validation model**: Quality gates, failure modes, and anti-pattern guidance
5. **Upstream/downstream interfaces**: Well-defined handoff protocols with architect (upstream) and tester/reviewer/docs (downstream)

This is **not** a minimal "bootstrap" implementation but a complete developer-core capability system.

---

## Scope

### In Scope

#### A. Role Boundary Layer
- developer role scope definition
- Upstream interface from architect
- Downstream interface to tester/reviewer/docs

#### B. Core Skills Layer (3 skills)

| Skill | Purpose |
|-------|---------|
| `feature-implementation` | Transform design notes into working code with implementation summary |
| `bugfix-workflow` | Systematic bug fixing with root cause analysis and regression prevention |
| `code-change-selfcheck` | Pre-delivery self-validation of code changes |

#### C. Artifact Contract Layer (3 artifacts)

| Artifact | Purpose |
|----------|---------|
| `implementation-summary` | Complete summary of code changes, goals achieved, and known issues |
| `self-check-report` | Systematic self-check results with blocker/warning classification |
| `bugfix-report` | Bug fix documentation with root cause, fix details, and lessons learned |

#### D. Quality and Validation Layer
- Cross-skill validation checklist
- Upstream-consumability checklist (from architect)
- Downstream-consumability checklist (to tester/reviewer)
- Failure-mode checklist
- Anti-pattern guidance

#### E. Educational and Example Layer
Each skill must include:
- `SKILL.md` - Skill definition
- `examples/` - Correct usage demonstrations
- `anti-examples/` - Common mistake demonstrations
- `templates/` or `checklists/` - Reusable templates

### Out of Scope

1. **tester core implementation** - Feature 005
2. **reviewer/docs/security core implementations** - Features 006-008
3. **Legacy task-executor skill deletion** - Future migration
4. **Repository-wide command system overhaul**
5. **Specific business feature code implementation**
6. **Advanced developer skills**:
   - `refactor-safely`
   - `dependency-minimization`
   - `performance-optimization`
   - `code-review-prep`

---

## Actors

### Primary Actor: developer

**Mission**: Transform design notes into working code, fix bugs systematically, and validate changes before handoff.

**Responsibilities**:
- Consume design-note and module-boundaries from architect
- Implement code according to design specifications
- Perform systematic self-check before delivery
- Fix bugs with root cause analysis
- Output structured implementation summary and self-check report
- Escalate when design conflicts with implementation reality

**Non-Responsibilities**:
- Substitute architect for design decisions
- Substitute tester for test case design and execution
- Substitute reviewer for independent quality judgment
- Substitute docs for documentation updates
- Substitute security for security audits
- Skip self-check and hope reviewer catches issues

### Upstream Provider: architect

| Artifact | Purpose |
|----------|---------|
| `design-note` | Design baseline with requirement mapping |
| `module-boundaries` | Module responsibilities and dependencies |
| `constraints` | Implementation constraints |
| `open-questions` | Unresolved items needing decisions |

### Downstream Consumers

| Role | Consumes |
|------|----------|
| `tester` | implementation-summary, changed files for test design |
| `reviewer` | implementation-summary, self-check-report for review |
| `docs` | implementation-summary for documentation sync |

---

## Core Workflows

### Workflow 1: Feature Implementation

```
design-note + module-boundaries
  → feature-implementation
    → code changes
      → code-change-selfcheck
        → implementation-summary + self-check-report
          → downstream roles
```

### Workflow 2: Bugfix

```
bug report / test failure
  → bugfix-workflow
    → root cause analysis
      → minimal fix
        → regression test
          → bugfix-report
            → downstream verification
```

### Workflow 3: Design Conflict Escalation

```
design-note vs implementation reality conflict
  → attempt resolution
    → if cannot resolve
      → escalate to architect + reviewer
        → design revision or constraint relaxation
          → continue implementation
```

---

## Business Rules

### BR-001: Implementation Must Match Design

Developer output must implement the design-note unless there's explicit deviation documentation.

**Implication**: Any deviation from design must be explicitly documented with rationale.

### BR-002: Self-Check Is Mandatory

All code changes must pass systematic self-check before handoff.

**Implication**: No code goes to tester/reviewer without self-check-report.

### BR-003: Bugfix Must Have Root Cause

Bug fixes must document root cause analysis, not just symptoms.

**Implication**: Surface fixes without root cause analysis are rejected.

### BR-004: Scope Control Is Developer Responsibility

Developer must actively prevent scope creep and document any necessary scope changes.

**Implication**: Implementations with undocumented scope changes are reworked.

### BR-005: Escalation Is Expected

When design conflicts with implementation reality, escalation is expected behavior, not failure.

**Implication**: Developer should escalate rather than silently deviate from design.

### BR-006: Use 6-Role Formal Semantics

Legacy 3-skill terminology only appears in mapping notes, not as primary framework.

**Implication**: All primary descriptions use architect/developer/tester/reviewer/docs/security terminology.

---

## Artifact Contracts

### AC-001: implementation-summary

**Purpose**: Primary implementation documentation mapping design to code changes.

**Required Fields**:
| Field | Description |
|-------|-------------|
| `goal_alignment` | Whether implementation achieved design goals |
| `implementation_approach` | Summary of implementation strategy |
| `changed_files` | List of all modified/added/deleted files |
| `deviations_from_design` | Any deviations and rationale |
| `dependencies_added` | New dependencies and justification |
| `tests_included` | Tests added or modified |
| `known_issues` | Known limitations or unfinished items |
| `risks` | Risks introduced by implementation |
| `performance_notes` | Performance characteristics |
| `recommendation` | SEND_TO_TEST, REWORK, or ESCALATE |

**Consumers**: tester, reviewer, docs

---

### AC-002: self-check-report

**Purpose**: Systematic validation of code changes before handoff.

**Required Fields**:
| Field | Description |
|-------|-------------|
| `summary` | Pass/fail counts and blocker count |
| `check_results` | Detailed results by category |
| `blockers` | Issues that must be fixed before handoff |
| `warnings` | Issues that should be fixed but not blocking |
| `overall_status` | PASS, FAIL_WITH_BLOCKERS, or PASS_WITH_WARNINGS |
| `recommendation` | PROCEED, FIX_BLOCKERS, or ESCALATE |

**Consumers**: reviewer (for pre-review quality assessment)

---

### AC-003: bugfix-report

**Purpose**: Complete documentation of bug fix including root cause and prevention.

**Required Fields**:
| Field | Description |
|-------|-------------|
| `problem_analysis` | Symptom, expected vs actual behavior |
| `root_cause` | Category and detailed analysis |
| `impact_assessment` | Severity and affected components |
| `fix_details` | Approach and changed files |
| `verification` | Test results and validation |
| `lessons_learned` | Prevention strategies |
| `recommendation` | CLOSE, MONITOR, REOPEN, or ESCALATE |

**Consumers**: reviewer, docs, future developers

---

## Skill Definitions

### SKILL-001: feature-implementation

**Goal**: Transform design note into working code with complete implementation summary.

**Inputs**:
- `design-note` (required)
- `module-boundaries` (required)
- spec and plan (required)
- codebase context (required)

**Outputs**:
- Code changes (files modified/added/deleted)
- `implementation-summary`

**Required Actions**:
1. Read and understand design-note
2. Identify files to modify/add/delete
3. Implement according to design
4. Document any deviations with rationale
5. Run self-check via code-change-selfcheck
6. Generate implementation-summary

**Quality Standards**:
- Design goals are achieved or deviations are documented
- Changed files are listed with descriptions
- Scope is controlled (no undocumented scope creep)
- Self-check passes or blockers are documented

**Failure Modes**:
- Implementing without reading design-note
- Silent deviation from design
- Scope creep without documentation
- Skipping self-check

---

### SKILL-002: bugfix-workflow

**Goal**: Systematically fix bugs with root cause analysis and regression prevention.

**Inputs**:
- Bug report or test failure (required)
- Code context (required)
- Historical context (optional)

**Outputs**:
- Fixed code changes
- `bugfix-report`

**Required Actions**:
1. Collect problem information
2. Locate root cause using 5 Whys or similar
3. Classify problem type
4. Assess impact
5. Create reproduction test
6. Implement minimal fix
7. Verify fix with regression test
8. Generate bugfix-report with lessons learned

**Quality Standards**:
- Root cause is identified, not just symptoms
- Fix is minimal (no unrelated changes)
- Reproduction test exists
- Regression test passes
- Prevention strategy documented

**Failure Modes**:
- Fixing symptoms without root cause
- Large fix with unrelated changes
- No reproduction test
- No regression test
- No lessons learned

---

### SKILL-003: code-change-selfcheck

**Goal**: Systematically validate code changes before handoff.

**Inputs**:
- Code changes (required)
- design-note (required)
- Task goal and constraints (required)

**Outputs**:
- `self-check-report`
- Blocker list (if any)

**Required Actions**:
1. Prepare check list based on change type
2. Check goal alignment
3. Check design consistency
4. Check scope control
5. Check constraint compliance
6. Check code quality
7. Check test coverage
8. Check dependency management
9. Check documentation
10. Check security
11. Check performance
12. Classify issues (blocker/warning/info)
13. Fix blockers or document why not fixed
14. Generate self-check-report

**Quality Standards**:
- All 10 categories checked
- Blockers identified and fixed or escalated
- Report is honest about status
- No false "all good" claims

**Failure Modes**:
- Skipping check categories
- Marking blockers as warnings
- False "all good" report
- Missing obvious issues

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
- [ ] No missing critical information

### VM-003: Cross-Role Validation

Must verify developer output is useful for:
- [ ] tester: Can design tests based on implementation-summary
- [ ] reviewer: Can review implementation against design
- [ ] docs: Can sync documentation from implementation-summary

### VM-004: Consistency Validation

Must verify consistency with canonical docs:
- [ ] `package-spec.md`
- [ ] `role-definition.md`
- [ ] `io-contract.md`
- [ ] `quality-gate.md`

---

## Anti-Patterns

### AP-001: Implementation Without Design

**Definition**: Implementing without reading or understanding the design-note.

**Example**: Writing code directly from task description without consulting design-note.

**Prevention**: Require explicit design-note reference in implementation-summary.

---

### AP-002: Silent Design Deviation

**Definition**: Deviating from design without documenting rationale.

**Example**: Changing module boundaries without notifying architect.

**Prevention**: Require deviations_from_design field in implementation-summary.

---

### AP-003: Scope Creep

**Definition**: Adding unrelated features or changes during implementation.

**Example**: "While I'm here, let me refactor this unrelated module."

**Prevention**: Scope control check in code-change-selfcheck.

---

### AP-004: Surface Bugfix

**Definition**: Fixing symptoms without root cause analysis.

**Example**: Adding null check without understanding why null occurs.

**Prevention**: Require root_cause analysis in bugfix-report.

---

### AP-005: Skipping Self-Check

**Definition**: Handing off code without systematic self-validation.

**Example**: "It compiles, ship it!"

**Prevention**: Make self-check-report required before handoff.

---

### AP-006: False All-Clear

**Definition**: Claiming self-check passed when obvious issues exist.

**Example**: Marking all checks pass despite known bugs.

**Prevention**: Reviewer spot-check of self-check accuracy.

---

### AP-007: Role Bleeding

**Definition**: Developer crossing into tester/reviewer formal responsibilities.

**Example**: Developer declaring "this is ready to merge" before reviewer approval.

**Prevention**: Explicit role boundaries in role-scope.md.

---

## Non-functional Requirements

### NFR-001: Discoverability

- Skills must be discoverable via `.opencode/skills/developer/` directory structure
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

- Each implementation decision must trace to a design decision
- Each artifact must reference its input sources
- Changes must be documented with rationale

---

## Acceptance Criteria

### AC-001: Feature Package Complete

`specs/004-developer-core/` contains complete spec package:
- [ ] `spec.md`
- [ ] `plan.md`
- [ ] `tasks.md`
- [ ] `completion-report.md`

### AC-002: Core Skills Formally Mapped

3 developer skills are formally integrated into 004:
- [ ] `feature-implementation` with clear scope
- [ ] `bugfix-workflow` with clear scope
- [ ] `code-change-selfcheck` with clear scope

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

Developer standard artifact contracts are explicit:
- [ ] `implementation-summary` contract
- [ ] `self-check-report` contract
- [ ] `bugfix-report` contract

### AC-005: Downstream Interfaces Clear

Developer handoff interfaces to tester/reviewer/docs are documented and outputs are consumable by downstream roles.

### AC-006: Upstream Interface Clear

Developer consumption interface from architect is documented.

### AC-007: Consistency with Canonical Docs

Feature aligns with canonical governance docs and does not re-introduce legacy 3-skill as primary semantic framework.

### AC-008: Anti-Pattern Guidance Established

Anti-pattern guidance exists and can clearly identify typical developer-core failure modes.

### AC-009: Completion Report Quality

`completion-report.md` clearly documents:
- Delivered content
- Uncovered future expansions
- Input value for features 005-008

### AC-010: Scope Boundary Maintained

Feature does not cross into tester/reviewer/docs/security core implementation.

### AC-011: First-Class Role Established

Feature can be considered developer role's complete first-phase implementation, not just bootstrap.

---

## Assumptions

### AS-001: Prior Features Complete

Assumes `003-architect-core` is complete with design artifacts available.

### AS-002: 6-Role Model Accepted

Assumes 6-role model is the authoritative semantic framework.

### AS-003: Downstream Features Will Follow

Assumes features 005-008 will be developed to consume developer outputs.

### AS-004: Existing Skills Are Baseline

Assumes existing `.opencode/skills/developer/` skills provide baseline content to formalize.

---

## Open Questions

### OQ-001: Advanced Skill Priority

Which advanced developer skills should be prioritized after core completion?

**Impact**: Affects roadmap for developer capability expansion.

**Temporary Assumption**: Focus on core skills first; advanced skills will be prioritized based on usage feedback.

**Recommended Next Step**: Gather downstream role usage feedback after core implementation.

---

### OQ-002: Integration with Legacy task-executor

How should developer-core interact with existing `task-executor` skill during transition?

**Impact**: Affects bootstrap flow compatibility.

**Temporary Assumption**: task-executor continues to operate; developer-core provides enhanced capabilities in parallel.

**Recommended Next Step**: Define explicit compatibility layer in plan.md.

---

### OQ-003: Self-Check Automation

How much of code-change-selfcheck can be automated vs manual?

**Impact**: Affects developer workflow efficiency.

**Temporary Assumption**: Provide both automated checks (lint, test) and manual checklists (design alignment, scope).

**Recommended Next Step**: Identify automation opportunities in plan.md.

---

## References

- `docs/infra/feature/004-developer-core-requirements.md` - Full requirements document
- `specs/003-architect-core/` - Upstream feature providing design artifacts
- `package-spec.md` - Package governance specification
- `role-definition.md` - 6-role definition
- `io-contract.md` - Input/output contract
- `quality-gate.md` - Quality gate rules
- `docs/architecture/role-model-evolution.md` - Role model evolution strategy
- `docs/infra/migration/skill-to-role-migration.md` - Migration mapping details
