# 007-docs-core Feature Specification

## Document Status
- **Feature ID**: `007-docs-core`
- **Feature Name**: Docs Core Skills System
- **Version**: 1.0.0
- **Status**: Complete
- **Created**: 2026-03-26
- **Last Updated**: 2026-03-26
- **Authoring Intent**: Full-feature specification for OpenCode-driven implementation, not a minimal bootstrap

---

## 1. Background

### 1.1 Context

The repository has established four formal execution roles in the 6-role model:

- `003-architect-core`: Transforms requirements into design notes, module boundaries, and trade-off guidance
- `004-developer-core`: Transforms design into code changes, implementation summaries, self-check reports, and bugfix reports
- `005-tester-core`: Transforms implementation claims into verifiable evidence with test scope, verification reports, and regression analysis
- `006-reviewer-core`: Performs independent quality review with findings reports, acceptance decision records, and actionable feedback

The next missing first-class capability is `docs`.

In the intended execution chain:

```text
architect (design) → developer (implement) → tester (verify) → reviewer (independent judgment) → docs (documentation sync)
```

`docs` is the role that ensures **repository-level documentation consistency after implementation, testing, and review**.

Without a complete docs-core system, the expert package has the following structural gaps:

1. README state, feature status, and completion reports can diverge
2. changelog updates are not guaranteed to happen as part of the execution loop
3. repository-level documentation consistency depends on ad hoc behavior instead of explicit role capability
4. the 6-role formal execution model remains incomplete

### 1.2 Problem Statement

Without `007-docs-core`, the expert package has the following issues:

1. **No formal documentation synchronization contract**
   Implementation, testing, and review outputs cannot be systematically reflected in repository-facing documentation.

2. **No unified changelog methodology**
   There is no first-class method for generating consistent, structured changelog entries.

3. **No README consistency discipline**
   README status, progress tables, and skill listings can drift from actual implementation state.

4. **No explicit docs role boundaries**
   Other roles may attempt ad hoc documentation updates without following established conventions.

5. **No downstream-ready documentation artifacts**
   Users and maintainers cannot rely on documentation being synchronized with implementation.

### 1.3 Prior Work

This feature builds on:

- `002-role-model-alignment`
- `002b-governance-repair`
- `003-architect-core`
- `004-developer-core`
- `005-tester-core`
- `006-reviewer-core`

In particular:
- `004-developer-core` provides implementation-summary, self-check-report
- `005-tester-core` provides verification-report, regression-risk-report
- `006-reviewer-core` provides review-findings-report, acceptance-decision-record

This means `007-docs-core` should be designed as a **downstream consumer of architect, developer, tester, and reviewer artifacts**, producing documentation synchronization outputs.

---

## 2. Goal

Establish `docs` as a first-class documentation synchronization role with:

1. **Complete capability system**
   2 core skills with full supporting assets and explicit role boundaries.

2. **Stable documentation artifacts**
   Structured outputs (docs-sync-report, changelog-entry) that can be consumed by maintainers and downstream processes.

3. **Upstream-consumption discipline**
   Formal transformation of implementation, testing, and review artifacts into documentation updates.

4. **Evidence-based documentation**
   All documentation changes grounded in actual implementation evidence, not speculation.

5. **Minimal surface area discipline**
   Scoped changes that touch only what needs updating, avoiding repository-wide prose rewrites.

6. **Full educational packaging**
   Each docs skill must include SKILL.md, examples, templates, and validation checklists.

This feature is **not** a minimal placeholder. It is intended to be a complete docs-core capability layer suitable for downstream production use in the OpenCode expert package.

---

## 3. Scope

### 3.1 In Scope

#### A. Role Boundary Layer

Define docs role scope precisely:

- What docs must do
- What docs may do
- What docs must never do
- What docs escalates instead of deciding alone

This includes explicit boundaries against:

- Developer silently updating README without docs role discipline
- Docs writing about unimplemented features
- Docs overstating feature completeness

#### B. Core Skills Layer (2 skills)

| Skill | Purpose |
|-------|---------|
| `readme-sync` | Synchronize README and repository-level documentation with actual implementation state |
| `changelog-writing` | Generate structured changelog entries for completed work and repairs |

#### C. Artifact Contract Layer (2 artifacts)

| Artifact | Purpose |
|----------|---------|
| `docs-sync-report` | Primary structured documentation synchronization report |
| `changelog-entry` | Structured changelog entry for completed features or repairs |

#### D. Quality and Validation Layer

The feature must define:

- Upstream-consumability checklist for consuming implementation/review artifacts
- Downstream-consumability checklist for maintainers and release processes
- Failure-mode checklist for docs work
- Anti-pattern guidance for weak or misleading documentation outputs
- Evidence-quality rules
- Status truthfulness discipline

#### E. Educational and Example Layer

Each docs skill must include:

- `SKILL.md`
- `examples/`
- `templates/`

#### F. Interface Layer

Define:

- How docs consumes architect, developer, tester, and reviewer outputs
- How docs hands off to maintainers and downstream processes
- How docs reports blocked states or unresolved documentation conflicts

### 3.2 Out of Scope

1. `008-security-core` implementation
2. `architecture-doc-sync` skill (deferred to M4)
3. `user-guide-update` skill (deferred to M4)
4. Broad product documentation system redesign
5. Automated release tooling outside docs role skill boundary
6. Repository-wide prose rewrites not driven by actual changes

---

## 4. Actors

### 4.1 Primary Actor: docs

**Mission**: Synchronize repository-level documentation after a feature or repair changes system capabilities, feature status, skill coverage, usage guidance, or development progress.

**Responsibilities**:

- Identify which top-level or role-facing docs are impacted by a completed change
- Update README.md consistently with the authoritative implementation state
- Preserve naming, progress tables, role-model terminology, and roadmap ordering
- Generate structured changelog entries from completed work
- Avoid over-updating unrelated sections
- Explain what changed and why in a structured report

**Non-Responsibilities**:

- Modifying business logic or implementation code
- Deciding feature acceptance (acceptance layer)
- Writing detailed product usage tutorials (out of MVP scope)
- Declaring features complete without evidence
- Rewriting documentation unrelated to the change

### 4.2 Upstream Providers

Docs must formally consume the following artifacts:

#### From `003-architect-core`:

| Upstream Artifact | Purpose for Docs |
|-------------------|------------------|
| `design-note` | Understand feature scope and design intent |
| `open-questions` | Track what was resolved |

#### From `004-developer-core`:

| Upstream Artifact / Field | Purpose for Docs |
|---------------------------|------------------|
| `implementation-summary` | Primary source for what changed |
| `self-check-report` | Understand known issues and limitations |
| `bugfix-report` | Capture fix details for changelog |

#### From `005-tester-core`:

| Upstream Artifact | Purpose for Docs |
|-------------------|------------------|
| `verification-report` | Confirm what was verified |
| `regression-risk-report` | Document known risks |

#### From `006-reviewer-core`:

| Upstream Artifact | Purpose for Docs |
|-------------------|------------------|
| `acceptance-decision-record` | Confirm feature status for README |
| `review-findings-report` | Document any notable findings |

#### From Feature Completion:

| Source | Purpose for Docs |
|--------|------------------|
| `completion-report.md` | Understand overall feature completion state |
| `spec.md` | Reference for feature description |

### 4.3 Downstream Consumers

| Consumer | Consumes |
|----------|----------|
| Maintainers | changelog-entry for release notes |
| Users | Updated README with accurate status |
| OpenClaw management layer | docs-sync-report for acceptance verification |
| Future features | Baseline documentation state |

---

## 5. Core Workflows

### 5.1 Workflow 1: Standard Feature Completion Docs Sync

```text
feature completion signaled
  → consume upstream artifacts (implementation-summary, verification-report, acceptance-decision-record)
    → identify affected documentation surfaces
      → readme-sync execution
        → generate docs-sync-report
          → update README sections
            → verify consistency
              → handoff complete
```

### 5.2 Workflow 2: Changelog Entry Generation

```text
feature/repair completed
  → consume completion context
    → extract change categories (capability/docs/validation/repair)
      → generate structured changelog-entry
        → verify against conventions
          → ready for CHANGELOG.md
```

### 5.3 Workflow 3: Status Correction

```text
README status drift detected
  → identify discrepancy source
    → compare with completion-report / acceptance-decision-record
      → correct status language
        → document correction in docs-sync-report
          → verify consistency across documents
```

### 5.4 Workflow 4: Blocked Documentation Sync

```text
insufficient upstream artifacts
or
conflicting status claims
  → document blocker
    → classify issue type
      → escalate to appropriate role
```

---

## 6. Business Rules

### BR-001: Docs Must Consume Upstream Evidence, Not Speculate

Docs work must begin from structured upstream artifacts, not assumptions about what changed.

**Implication**: No docs output should skip upstream artifact interpretation.

### BR-002: Minimal Surface Area Discipline

Docs updates should be scoped to what changed. Avoid repository-wide prose rewrites unless necessary for correctness.

**Implication**: Docs must identify touched sections explicitly.

### BR-003: Evidence-Based Statusing

Any feature-status wording must be grounded in completion reports, audit outcomes, or explicit implementation evidence.

**Implication**: Docs must not declare features complete without evidence.

### BR-004: 6-Role Terminology Consistency

All documentation must use 6-role formal terminology (architect, developer, tester, reviewer, docs, security), not legacy 3-skill framing.

**Implication**: Status tables and role descriptions must align with role-definition.md.

### BR-005: Cross-Document Consistency

README progress table, current-progress text, and skill status wording must remain internally consistent.

**Implication**: Docs must check consistency across documents.

### BR-006: Changelog Must Distinguish Change Types

Changelog entries must distinguish between new capability, repair, documentation-only updates, and governance changes.

**Implication**: Generic "updates and improvements" entries are insufficient.

### BR-007: Docs Must Not Modify Implementation Code

Docs role produces documentation changes only, not code changes.

**Implication**: If implementation changes are needed, docs escalates to developer.

### BR-008: Status Truthfulness

Completion-report partial/known gaps must be reflected in README. "Substantially Complete with Known Gaps" cannot be misrepresented as "Fully Complete".

**Implication**: Status inflation is a docs anti-pattern.

---

## 7. Artifact Contracts

### AC-001: docs-sync-report

**Purpose**: Primary structured documentation synchronization report describing what was updated and why.

**Required Fields**:

| Field | Description |
|-------|-------------|
| `sync_target` | Feature/deliverable whose documentation is being synchronized |
| `consumed_artifacts` | Upstream artifacts used as source |
| `touched_sections` | Specific documentation sections updated |
| `change_reasons` | Reason for each section change |
| `consistency_checks` | Cross-document consistency verifications performed |
| `status_updates` | Feature status changes (if any) |
| `unresolved_ambiguities` | Items requiring clarification |
| `recommendation` | sync-complete / needs-follow-up / blocked |

**Primary Consumers**: OpenClaw management layer, maintainers

---

### AC-002: changelog-entry

**Purpose**: Structured changelog entry suitable for insertion into CHANGELOG.md.

**Required Fields**:

| Field | Description |
|-------|-------------|
| `feature_id` | Feature ID or change identifier |
| `feature_name` | Human-readable feature name |
| `change_type` | feature / repair / docs-only / governance |
| `summary` | Concise change description (1-2 sentences) |
| `capability_changes` | New capabilities added |
| `docs_changes` | Documentation changes |
| `validation_changes` | Testing/validation changes |
| `breaking_changes` | Breaking changes (if any) |
| `known_limitations` | Known gaps or limitations |
| `related_features` | Related feature IDs |

**Primary Consumers**: Maintainers, release notes, users

---

## 8. Skill Definitions

### SKILL-001: readme-sync

**Goal**: Synchronize repository-level documentation after a feature or repair changes system capabilities, feature status, skill coverage, usage guidance, or development progress.

**Inputs**:
- `implementation-summary` (required)
- `completion-report` or `acceptance-decision-record` (required)
- `current README` and affected docs (required)
- `repository conventions` for status wording and naming (required)

**Outputs**:
- `docs-sync-report`
- Updated README or documentation patch

**Required Actions**:
1. Identify which top-level or role-facing docs are impacted by the completed change
2. Read current README structure and conventions
3. Update relevant sections consistently with implementation state
4. Preserve naming, progress tables, role-model terminology, roadmap ordering
5. Verify cross-document consistency (README vs completion-report vs spec)
6. Document touched sections and change reasons
7. Avoid over-updating unrelated sections

**Quality Standards**:
- Every touched section must have documented reason
- Status wording must align with actual completion evidence
- Must not declare feature complete when evidence says partial
- Must use 6-role terminology, not legacy 3-skill framing
- Changes must be scoped to what changed

**Failure Modes**:
- Updating unrelated sections
- Declaring partial features complete
- Using inconsistent terminology
- Missing consistency checks
- Not documenting change reasons

---

### SKILL-002: changelog-writing

**Goal**: Generate consistent changelog entries for completed features, repairs, and significant governance/capability updates.

**Inputs**:
- `implementation-summary` (required)
- `changed files` or `change categories` (required)
- `feature completion state` (required)
- `related feature ID and title` (required)

**Outputs**:
- `changelog-entry`

**Required Actions**:
1. Summarize what changed in user-facing or maintainer-facing language
2. Capture scope, impact, and notable repository changes
3. Distinguish change type: new capability, repair, or documentation-only
4. Group changes by category (capability/docs/validation/repair)
5. Identify any breaking changes
6. Document known limitations
7. Ensure concise, maintainable wording

**Quality Standards**:
- Must not overstate feature completeness
- Must clearly identify change type
- Must be suitable for repeated repository usage
- Must preserve release-note readability
- Must be specific, not generic

**Failure Modes**:
- Generic "updates and improvements" without specifics
- Overstating completeness
- Not distinguishing change types
- Missing breaking change disclosure
- Vague or unclear language

---

## 9. Validation Model

### VM-001: Skill-Level Validation

```yaml
validation_checklist:
  skill_level:
    - [ ] inputs_defined: true
    - [ ] outputs_complete: true
    - [ ] templates_exist: true
    - [ ] examples_exist: true
    - [ ] role_boundaries_clear: true
```

### VM-002: Artifact-Level Validation

```yaml
validation_checklist:
  artifact_level:
    - [ ] required_fields_present: true
    - [ ] downstream_consumable: true
    - [ ] evidence_based: true
    - [ ] scoped_to_change: true
```

### VM-003: Consistency Validation

```yaml
validation_checklist:
  consistency:
    - [ ] readme_status_matches_evidence: true
    - [ ] terminology_6_role_aligned: true
    - [ ] cross_document_consistent: true
    - [ ] no_status_inflation: true
```

### VM-004: Quality Validation

```yaml
validation_checklist:
  quality:
    - [ ] minimal_surface_area: true
    - [ ] touched_sections_documented: true
    - [ ] change_reasons_explicit: true
    - [ ] no_unrelated_changes: true
```

---

## 10. Anti-Patterns

### AP-001: Status Inflation

**Definition**: Declaring a feature complete when evidence shows partial completion.

**Example**: Marking a feature "Complete" when completion-report shows known gaps.

**Prevention**: Require evidence-based status language; cross-check with completion-report.

### AP-002: Over-Updating

**Definition**: Rewriting broad documentation sections unrelated to the change.

**Example**: Restructuring the entire README when only adding one skill.

**Prevention**: Enforce minimal surface area; document touched sections.

### AP-003: Drift Ignorance

**Definition**: Not checking consistency between README and other documents.

**Example**: README says feature is pending while completion-report shows complete.

**Prevention**: Mandatory cross-document consistency checks.

### AP-004: Legacy Terminology Regression

**Definition**: Using 3-skill terminology instead of 6-role formal terminology.

**Example**: Describing roles as "spec-writer" instead of "architect".

**Prevention**: Enforce 6-role terminology; reference role-definition.md.

### AP-005: Vague Changelog

**Definition**: Changelog entries without specific, actionable information.

**Example**: "Various improvements and bug fixes."

**Prevention**: Require structured changelog-entry format with categories.

### AP-006: Undocumented Changes

**Definition**: Making documentation changes without recording reasons.

**Example**: Updating README status without explaining why.

**Prevention**: Require docs-sync-report with touched sections and change reasons.

### AP-007: Speculation-Based Documentation

**Definition**: Writing documentation about unimplemented or assumed features.

**Example**: Documenting a feature as "supports X" when X is not yet implemented.

**Prevention**: Require upstream artifact consumption; verify against implementation-summary.

---

## 11. Non-Functional Requirements

### NFR-001: Minimal Surface Area

Documentation updates must touch only what needs updating.

### NFR-002: Traceability

Every documentation change must be traceable to:
- Specific upstream artifact (implementation-summary, acceptance-decision-record, etc.)
- Specific reason for change
- Specific evidence supporting the change

### NFR-003: Consistency

README status, completion-report status, and feature table must align.

### NFR-004: Artifact Persistence

All docs artifacts must be persistable and retrievable for audit purposes.

---

## 12. Acceptance Criteria

### AC-001: Feature Package Complete

The feature must contain:
- `spec.md`
- `plan.md`
- `tasks.md`
- `completion-report.md`
- Role/interface/validation documents required by the plan

### AC-002: Docs Role Scope Formalized

The repository must clearly define docs responsibilities, non-responsibilities, escalation conditions, and upstream/downstream interfaces.

### AC-003: Core Skills Formally Implemented

Both core docs skills must exist as first-class skills with role-appropriate boundaries and educational assets.

### AC-004: Artifact Contracts Defined

Both docs artifact contracts must be documented with required fields and intended consumers.

### AC-005: Upstream Consumption Logic Clear

The feature must explicitly map how docs consumes architect, developer, tester, and reviewer artifacts.

### AC-006: Downstream Handoff Clear

The feature must explicitly define how maintainers and release processes consume docs outputs.

### AC-007: Skill Assets Complete

Each of the 2 skills must include:
- 1 `SKILL.md`
- At least 2 examples
- At least 1 template

### AC-008: Consistency Discipline Present

The feature must define cross-document consistency validation discipline.

### AC-009: Anti-Pattern Guidance Present

The feature must document common docs failure patterns and how to detect/prevent/remediate them.

### AC-010: Scope Boundary Maintained

No security implementation or M4-enhanced skills may be smuggled into 007.

### AC-011: Repository State Updated

Repository-level progress documentation must reflect that 007-docs-core has been implemented.

### AC-012: 6-Role Terminology Preserved

All documentation must use 6-role formal terminology without regressing to legacy 3-skill framing.

---

## 13. Assumptions

### AS-001: Upstream Features Complete

Assumes `003-architect-core`, `004-developer-core`, `005-tester-core`, and `006-reviewer-core` are complete and provide stable artifact contracts.

### AS-002: Governance Documents Authoritative

Assumes role-definition.md, package-spec.md, io-contract.md, and quality-gate.md are the canonical source of truth.

### AS-003: README Structure Stable

Assumes README.md follows a consistent structure with feature tables, skill listings, and progress narratives.

### AS-004: Skills Directory Structure

Assumes `.opencode/skills/docs/` follows the pattern established by `.opencode/skills/reviewer/`.

---

## 14. Open Questions

### OQ-001: Changelog Granularity

Should changelog entries be per-feature or aggregate multiple features?

**Initial Direction**: Per-feature entries, aggregated at release time.

### OQ-002: Automated Status Inference

Should docs role attempt to infer feature status automatically, or require explicit status from upstream?

**Initial Direction**: Require explicit status from completion-report or acceptance-decision-record.

### OQ-003: Multi-Language Documentation

How should docs role handle documentation that exists in multiple languages?

**Initial Direction**: Out of MVP scope; focus on primary documentation.

### OQ-004: Documentation Debt

How should docs role handle significant documentation debt discovered during sync?

**Initial Direction**: Report as unresolved ambiguity; escalate if blocking.

---

## 15. References

- `docs/infra/feature/007-docs-core-feature.md` - Full requirements document
- `specs/003-architect-core/` - Architect artifacts for upstream consumption
- `specs/004-developer-core/` - Developer artifacts for upstream consumption
- `specs/005-tester-core/` - Tester artifacts for upstream consumption
- `specs/006-reviewer-core/` - Reviewer artifacts for upstream consumption
- `package-spec.md` - Package governance specification
- `role-definition.md` - 6-role definition (Section 5: docs)
- `io-contract.md` - Input/output contract
- `quality-gate.md` - Quality gate rules
- `.opencode/skills/docs/*/SKILL.md` - Existing docs skill references

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial spec creation based on 007-docs-core-feature.md requirements |