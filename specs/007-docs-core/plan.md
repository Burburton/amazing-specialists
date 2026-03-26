# 007-docs-core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish docs as a first-class documentation synchronization role with 2 core skills, 2 artifact contracts, and complete quality/validation layer.

**Architecture:** This feature implements the complete core capability system for the `docs` role as the final stage in the 6-role execution chain (architect → developer → tester → reviewer → docs). It consumes upstream artifacts from all four preceding roles and produces structured documentation synchronization outputs.

**Tech Stack:** Markdown documentation, YAML artifact schemas, OpenCode skill system

---

## Document Status
- **Feature ID**: `007-docs-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-26
- **Based On**: `specs/007-docs-core/spec.md` v1.0.0

---

## 1. Architecture Summary

This feature implements the complete core capability system for the `docs` role, including:

1. **2 Core Skills**: `readme-sync`, `changelog-writing`
2. **2 Standard Artifacts**: `docs-sync-report`, `changelog-entry`
3. **Complete Quality Assurance System**: Checklists, Anti-examples, Failure modes, Validation gates
4. **Upstream/Downstream Role Interfaces**: Consumption contracts from architect/developer/tester/reviewer (upstream) and handoff to maintainers/users/OpenClaw (downstream)
5. **Evidence-Based Documentation**: All changes grounded in upstream artifacts, not speculation

This feature is not a bootstrap skeleton, but the complete first-phase implementation of the docs role.

---

## 2. Inputs from Spec

### 2.1 Core Requirements (from spec.md)

| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| BR-001 | Docs Must Consume Upstream Evidence, Not Speculate | Critical |
| BR-002 | Minimal Surface Area Discipline | Critical |
| BR-003 | Evidence-Based Statusing | Critical |
| BR-004 | 6-Role Terminology Consistency | Critical |
| BR-005 | Cross-Document Consistency | Critical |
| BR-006 | Changelog Must Distinguish Change Types | Critical |
| BR-007 | Docs Must Not Modify Implementation Code | Critical |
| BR-008 | Status Truthfulness | Critical |

### 2.2 Skill Requirements (from spec.md)

| Skill ID | Skill Name | Purpose |
|----------|------------|---------|
| SKILL-001 | readme-sync | Synchronize README and repository-level documentation with actual implementation state |
| SKILL-002 | changelog-writing | Generate structured changelog entries for completed work and repairs |

### 2.3 Artifact Requirements (from spec.md)

| Artifact ID | Artifact Name | Required Fields Count |
|-------------|---------------|----------------------|
| AC-001 | docs-sync-report | 8 fields |
| AC-002 | changelog-entry | 10 fields |

### 2.4 Validation Requirements (from spec.md)

| Validation ID | Type | Check Items |
|---------------|------|-------------|
| VM-001 | Skill-Level | Inputs, outputs, templates, examples, role boundaries |
| VM-002 | Artifact-Level | Required fields, downstream consumable, evidence-based |
| VM-003 | Consistency | README status, terminology, cross-document, no status inflation |
| VM-004 | Quality | Minimal surface area, touched sections documented, change reasons explicit |

---

## 3. Technical Constraints

### 3.1 Governance Alignment Constraints

| Constraint | Source | Rationale |
|------------|--------|-----------|
| C-001: Use 6-role formal terminology | AGENTS.md, role-definition.md | Maintain governance consistency |
| C-002: Explicitly consume 003/004/005/006 outputs | spec.md BR-001 | Establish upstream/downstream contract |
| C-003: Follow I/O Contract | io-contract.md | Ensure management layer can invoke |
| C-004: Satisfy Quality Gate | quality-gate.md | Ensure output quality |
| C-005: Maintain role purity | BR-007 | Docs must not modify implementation code |
| C-006: Evidence-based documentation | BR-001, BR-003 | All changes grounded in upstream artifacts |

### 3.2 Directory Structure Constraints

```
.opencode/skills/docs/
├── readme-sync/
│   ├── SKILL.md
│   ├── examples/
│   │   ├── example-001-feature-completion-sync.md
│   │   └── example-002-status-correction.md
│   ├── anti-examples/
│   │   ├── anti-example-001-status-inflation.md
│   │   └── anti-example-002-over-updating.md
│   └── templates/
│       └── docs-sync-report-template.md
└── changelog-writing/
    ├── SKILL.md
    ├── examples/
    │   ├── example-001-feature-release.md
    │   └── example-002-bugfix-release.md
    ├── anti-examples/
    │   ├── anti-example-001-vague-changelog.md
    │   └── anti-example-002-missing-breaking-change.md
    └── templates/
        └── changelog-entry-template.md
```

### 3.3 Artifact Storage Constraints

- Artifacts stored in task/feature working directory
- Follow feature-level traceability principles
- File naming convention: `docs-sync-report.md`, `changelog-entry.md`

### 3.4 Compatibility Constraints

- Existing docs skills already have SKILL.md files (bootstrap level)
- Enhance existing skills rather than replacing
- Do not break existing documentation workflows
- Align with existing readme-sync and changelog-writing patterns

---

## 4. Module Decomposition

### 4.1 Phase Overview

```
Phase 1: Role Scope Finalization (1 day)
  ├── P1-1: Docs role boundary confirmation
  ├── P1-2: Upstream interface from architect/developer/tester/reviewer definition
  └── P1-3: Downstream interface to maintainers/users/OpenClaw definition

Phase 2: Skill Formalization (2 days)
  ├── P2-1: readme-sync formalization
  └── P2-2: changelog-writing formalization

Phase 3: Artifact Contract Establishment (1 day)
  ├── P3-1: docs-sync-report contract
  └── P3-2: changelog-entry contract

Phase 4: Validation & Quality Layer (1 day)
  ├── P4-1: Upstream-consumability checklist
  ├── P4-2: Downstream-consumability checklist
  ├── P4-3: Failure-mode checklist
  └── P4-4: Anti-pattern guidance

Phase 5: Educational & Example Layer (1 day)
  ├── P5-1: Examples for each skill
  ├── P5-2: Anti-examples for each skill
  └── P5-3: Templates for each skill

Phase 6: Workflow & Package Integration (0.5 day)
  ├── P6-1: Role-scope.md documentation
  ├── P6-2: Package governance updates check
  └── P6-3: Feature completion preparation

Phase 7: Consistency Review (0.5 day)
  ├── P7-1: Governance document sync
  ├── P7-2: Cross-document consistency check
  └── P7-3: Final acceptance validation
```

### 4.2 Detailed Module Breakdown

#### Phase 1: Role Scope Finalization

**P1-1: Docs Role Boundary Confirmation**
- **Objective**: Define docs responsibilities and boundaries aligned with role-definition.md Section 5
- **Inputs**: role-definition.md (Section 5: docs), package-spec.md
- **Outputs**: role-scope.md (in specs/007-docs-core/)
- **Content**:
  - Mission statement (documentation synchronization)
  - In-scope / out-of-scope boundaries
  - Trigger conditions
  - Required/optional inputs from architect/developer/tester/reviewer
  - Expected outputs
  - Escalation rules (when to escalate vs document ambiguity)
  - BR-007 enforcement (no implementation code modification)
- **Acceptance Criteria**: No conflicts with role-definition.md; upstream/downstream roles can understand
- **Risks**: May overlap with developer documentation responsibilities
- **Failure Mode**: Unclear boundary between docs role and developer inline documentation

**P1-2: Upstream Interface Definition**
- **Objective**: Define how docs consumes architect, developer, tester, and reviewer outputs
- **Inputs**: 
  - specs/003-architect-core/contracts/
  - specs/004-developer-core/contracts/
  - specs/005-tester-core/contracts/
  - specs/006-reviewer-core/contracts/
- **Outputs**: upstream-consumption.md (in specs/007-docs-core/)
- **Content**:
  - Mapping from architect artifacts (design-note, open-questions)
  - Mapping from developer artifacts (implementation-summary, self-check-report, bugfix-report)
  - Mapping from tester artifacts (verification-report, regression-risk-report)
  - Mapping from reviewer artifacts (acceptance-decision-record, review-findings-report)
  - Field-by-field consumption guide
  - Feature completion context consumption (completion-report.md, spec.md)
- **Acceptance Criteria**: Docs knows how to read all upstream artifacts
- **Risks**: Missing fields or incompatible schemas between features
- **Failure Mode**: Cannot derive documentation changes from upstream outputs

**P1-3: Downstream Interface Definition**
- **Objective**: Define docs handoff to maintainers, users, and OpenClaw management layer
- **Inputs**: role-definition.md, io-contract.md
- **Outputs**: downstream-interfaces.md (in specs/007-docs-core/)
- **Content**:
  - What maintainers receive from docs (changelog-entry)
  - What users receive from docs (updated README with accurate status)
  - What OpenClaw receives from docs (docs-sync-report)
  - Recommendation field semantics (sync-complete / needs-follow-up / blocked)
- **Acceptance Criteria**: Each downstream consumer has clear consumption guidance
- **Risks**: Maintainer expectations may not align with docs capabilities
- **Failure Mode**: Maintainers cannot use docs outputs for release notes

---

#### Phase 2: Skill Formalization

**P2-1: readme-sync Formalization**

Existing SKILL.md (409 lines) requires enhancement:

| Enhancement | Current Status | Target Status |
|-------------|----------------|---------------|
| Examples | Embedded in YAML | Independent example files |
| Anti-examples | None | At least 2 anti-examples |
| Templates | Embedded format | Independent template files |
| Failure modes | Table format | Complete documentation + handling strategies |
| Contract alignment | Output format defined | Aligned with docs-sync-report contract |
| BR compliance | Partial | Explicit BR-001 through BR-008 compliance |
| Upstream consumption | Partial | Complete consumption mapping |

**Key additions needed**:
- Explicit BR-001 compliance (consume upstream evidence)
- BR-003 integration (evidence-based statusing)
- BR-005 integration (cross-document consistency checks)
- BR-008 integration (status truthfulness)
- Examples showing consumption of architect/developer/tester/reviewer artifacts
- Anti-examples showing status inflation and over-updating

**P2-2: changelog-writing Formalization**

Existing SKILL.md (470 lines) requires enhancement:

| Enhancement | Current Status | Target Status |
|-------------|----------------|---------------|
| Examples | Embedded in YAML | Independent example files |
| Anti-examples | None | At least 2 anti-examples |
| Templates | Embedded format | Independent template files |
| Failure modes | Table format | Complete documentation |
| Contract alignment | Output format defined | Aligned with changelog-entry contract |
| BR compliance | Partial | Explicit BR-006 compliance |

**Key additions needed**:
- Explicit BR-006 compliance (distinguish change types)
- Examples showing change type categorization
- Anti-examples showing vague changelog
- Integration with readme-sync workflow

---

#### Phase 3: Artifact Contract Establishment

**P3-1: docs-sync-report Contract**
- **Objective**: Define complete schema for docs-sync-report
- **Output**: contracts/docs-sync-report-contract.md
- **Content**:
  - Required fields (8 per spec.md AC-001)
  - sync_target, consumed_artifacts, touched_sections, change_reasons
  - consistency_checks, status_updates, unresolved_ambiguities, recommendation
  - Consumer guidance (maintainers, OpenClaw)
- **Acceptance Criteria**: Fields match spec.md; supports evidence-based reporting
- **Risks**: Status updates may conflict with completion-report
- **Failure Mode**: Cannot capture documentation change rationale

**P3-2: changelog-entry Contract**
- **Objective**: Define complete schema for changelog-entry
- **Output**: contracts/changelog-entry-contract.md
- **Content**:
  - Required fields (10 per spec.md AC-002)
  - feature_id, feature_name, change_type, summary
  - capability_changes, docs_changes, validation_changes
  - breaking_changes, known_limitations, related_features
  - Change type definitions (feature/repair/docs-only/governance)
- **Acceptance Criteria**: Supports all 4 change types with clear semantics
- **Risks**: Change type granularity may need refinement
- **Failure Mode**: Ambiguous change categorization

---

#### Phase 4: Validation & Quality Layer

**P4-1: Upstream-Consumability Checklist**
- **Objective**: Ensure docs correctly consumes upstream artifacts
- **Output**: validation/upstream-consumability-checklist.md
- **Check Items**:
  - [ ] architect artifacts read (design-note, open-questions)
  - [ ] developer artifacts read (implementation-summary, self-check-report, bugfix-report)
  - [ ] tester artifacts read (verification-report, regression-risk-report)
  - [ ] reviewer artifacts read (acceptance-decision-record, review-findings-report)
  - [ ] completion-report consumed for status truthfulness
  - [ ] Missing data handling documented
- **Acceptance Criteria**: All upstream artifacts can be consumed systematically

**P4-2: Downstream-Consumability Checklist**
- **Objective**: Ensure outputs can be consumed by downstream
- **Output**: validation/downstream-consumability-checklist.md
- **By Downstream Role**:
  - **maintainers**: changelog-entry suitable for release notes
  - **users**: README status accurate and actionable
  - **OpenClaw**: docs-sync-report consumable for acceptance verification
- **Acceptance Criteria**: Each downstream role has clear consumption path

**P4-3: Failure-Mode Checklist**
- **Objective**: Identify common docs failure patterns
- **Output**: validation/failure-mode-checklist.md
- **Content** (per spec.md Section 10 - 7 anti-patterns):
  - AP-001: Status Inflation
  - AP-002: Over-Updating
  - AP-003: Drift Ignorance
  - AP-004: Legacy Terminology Regression
  - AP-005: Vague Changelog
  - AP-006: Undocumented Changes
  - AP-007: Speculation-Based Documentation
- **Acceptance Criteria**: Each pattern detectable and preventable

**P4-4: Anti-Pattern Guidance**
- **Objective**: Provide comprehensive anti-pattern documentation
- **Output**: validation/anti-pattern-guidance.md
- **Content**:
  - Definition of each anti-pattern
  - Detection methods
  - Prevention strategies
  - Remediation steps
- **Acceptance Criteria**: Guidance actionable by docs role

---

#### Phase 5: Educational & Example Layer

**P5-1: Examples for Each Skill**
- **Objective**: Provide complete examples for each skill
- **Output Structure**:
  ```
  .opencode/skills/docs/
  ├── readme-sync/
  │   └── examples/
  │       ├── example-001-feature-completion-sync.md
  │       └── example-002-status-correction.md
  └── changelog-writing/
      └── examples/
          ├── example-001-feature-release.md
          └── example-002-bugfix-release.md
  ```

**P5-2: Anti-Examples for Each Skill**
- **Objective**: Demonstrate common mistakes
- **Output Structure**:
  ```
  .opencode/skills/docs/
  ├── readme-sync/
  │   └── anti-examples/
  │       ├── anti-example-001-status-inflation.md
  │       └── anti-example-002-over-updating.md
  └── changelog-writing/
      └── anti-examples/
          ├── anti-example-001-vague-changelog.md
          └── anti-example-002-missing-breaking-change.md
  ```

**P5-3: Templates for Each Skill**
- **Objective**: Provide reusable templates
- **Output Structure**:
  ```
  .opencode/skills/docs/
  ├── readme-sync/
  │   └── templates/
  │       └── docs-sync-report-template.md
  └── changelog-writing/
      └── templates/
          └── changelog-entry-template.md
  ```

---

#### Phase 6: Workflow & Package Integration

**P6-1: Role-scope.md Documentation**
- **Objective**: Complete docs role scope document
- **Output**: specs/007-docs-core/role-scope.md
- **Content**:
  - Mission
  - In Scope / Out of Scope
  - Trigger conditions
  - Required / Optional inputs
  - Expected outputs
  - Escalation rules
  - Upstream / Downstream dependencies
- **Acceptance Criteria**: Aligns with role-definition.md Section 5

**P6-2: Package Governance Updates Check**
- **Objective**: Check/update related governance documents
- **Documents to Check/Update**:
  - README.md (Skills inventory, Workflow, Feature status)
  - AGENTS.md (Role semantics if needed)
  - package-spec.md (Docs skills section)
- **Acceptance Criteria**: Governance documents reflect 007 completion

**P6-3: Feature Completion Preparation**
- **Objective**: Prepare completion-report.md
- **Output**: specs/007-docs-core/completion-report.md
- **Content**:
  - Deliverables checklist
  - Traceability matrix to spec
  - Open questions resolved/unresolved
  - Known gaps (future advanced skills)
  - Input value for 008-security-core
- **Acceptance Criteria**: Honest status reporting; no hidden gaps

---

#### Phase 7: Consistency Review

**P7-1: Governance Document Sync**
- **Objective**: Ensure all governance documents are consistent
- **Check Items**:
  - [ ] README.md terminology consistent with role-definition.md
  - [ ] AGENTS.md constraints consistent with package-spec.md
  - [ ] quality-gate.md docs gate aligned with this feature
  - [ ] io-contract.md artifact types include docs artifacts

**P7-2: Cross-Document Consistency Check**
- **Objective**: Verify no contradictions between documents
- **Method**: Use governance sync rule (AGENTS.md)
- **Check Areas**:
  - 6-role vs 3-skill semantic consistency
  - Feature status across README, plan, completion-report
  - Artifact field definitions consistent across contracts

**P7-3: Final Acceptance Validation**
- **Objective**: Validate against spec.md acceptance criteria
- **Validation Items**:
  - AC-001: Feature package complete
  - AC-002: Docs role scope formalized
  - AC-003: Core skills formally implemented
  - AC-004: Artifact contracts defined
  - AC-005: Upstream consumption logic clear
  - AC-006: Downstream handoff clear
  - AC-007: Skill assets complete
  - AC-008: Consistency discipline present
  - AC-009: Anti-pattern guidance present
  - AC-010: Scope boundary maintained
  - AC-011: Repository state updated
  - AC-012: 6-Role terminology preserved

---

## 5. Data Flow

### 5.1 Standard Feature Completion Docs Sync Flow

```
Upstream Artifacts
         │
         ▼
┌─────────────────────────┐
│   docs: Read            │
│   upstream artifacts    │
│   - implementation-summary│
│   - verification-report │
│   - acceptance-decision-record│
│   - completion-report   │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   docs:                 │
│   readme-sync           │
│   execution             │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   docs:                 │
│   consistency checks    │
│   (README vs evidence)  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   docs:                 │
│   changelog-writing     │
│   execution             │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Output Artifacts      │
│   - docs-sync-report    │
│   - changelog-entry     │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Downstream Handoff    │
│   - maintainers         │
│   - users               │
│   - OpenClaw            │
└─────────────────────────┘
```

### 5.2 Status Correction Flow

```
README Status Drift Detected
         │
         ▼
┌─────────────────────────┐
│   docs: Identify        │
│   discrepancy source    │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   docs: Compare with    │
│   completion-report /   │
│   acceptance-decision   │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   docs: Correct         │
│   status language       │
│   (BR-008 compliance)   │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   docs: Document        │
│   in docs-sync-report   │
└─────────────────────────┘
```

### 5.3 Blocked Documentation Sync Flow

```
Insufficient Upstream Artifacts
or Conflicting Status Claims
         │
         ▼
┌─────────────────────────┐
│   docs: Document        │
│   blocker               │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   docs: Classify        │
│   issue type            │
│   - missing artifact    │
│   - conflicting status  │
│   - ambiguous evidence  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   docs: Escalate        │
│   to appropriate role   │
│   with recommendation   │
│   = blocked             │
└─────────────────────────┘
```

---

## 6. Failure Handling

### 6.1 Skill-Level Failure Modes

| Skill | Failure Mode | Detection | Recovery |
|-------|--------------|-----------|----------|
| readme-sync | Status inflation | Checklist: evidence vs status language | Require upstream artifact verification |
| readme-sync | Over-updating | Checklist: touched sections minimal | Enforce minimal surface area |
| readme-sync | Drift ignorance | Checklist: cross-document consistency | Mandatory README vs completion-report check |
| readme-sync | Legacy terminology | Checklist: 6-role terminology | Reference role-definition.md |
| changelog-writing | Vague changelog | Checklist: specific content required | Require structured changelog-entry format |
| changelog-writing | Missing breaking change | Checklist: breaking change field | BR-006 enforcement |
| changelog-writing | Undocumented changes | Checklist: docs-sync-report presence | Require touched sections documentation |

### 6.2 Artifact-Level Failure Modes

| Artifact | Failure Mode | Detection | Recovery |
|----------|--------------|-----------|----------|
| docs-sync-report | Missing change reasons | touched_sections without reasons | Require documented reason for each section |
| docs-sync-report | No consistency checks | consistency_checks field empty | Mandatory BR-005 compliance |
| docs-sync-report | Status not evidence-based | status_updates without evidence links | BR-003 enforcement |
| changelog-entry | Generic summary | summary field too vague | Require specific, actionable language |
| changelog-entry | Missing change type | change_type not in allowed set | Use defined 4 types |

### 6.3 Escalation Rules

Escalate (ESCALATE) when:
- Upstream artifacts missing or insufficient for documentation sync
- Conflicting status claims between documents that cannot be resolved
- Documentation debt discovered that blocks synchronization
- Ambiguous evidence prevents clear documentation updates
- Major README restructuring required beyond minimal surface area

---

## 7. Validation Strategy

### 7.1 Skill-Level Validation

Each skill must pass:

```yaml
validation_checklist:
  skill_level:
    - inputs_defined: true
    - outputs_complete: true
    - templates_exist: true
    - examples_exist: true
    - anti_examples_exist: true
    - role_boundaries_clear: true
    - upstream_consumption_documented: true
```

### 7.2 Artifact-Level Validation

Each artifact must pass:

```yaml
validation_checklist:
  artifact_level:
    - required_fields_present: true
    - downstream_consumable: true
    - evidence_based: true
    - scoped_to_change: true
```

### 7.3 Consistency Validation

Must verify cross-document consistency:

```yaml
validation_checklist:
  consistency:
    - readme_status_matches_evidence: true
    - terminology_6_role_aligned: true
    - cross_document_consistent: true
    - no_status_inflation: true
```

### 7.4 Quality Validation

Must verify documentation quality:

```yaml
validation_checklist:
  quality:
    - minimal_surface_area: true
    - touched_sections_documented: true
    - change_reasons_explicit: true
    - no_unrelated_changes: true
```

---

## 8. Risks / Tradeoffs

### 8.1 Identified Risks

| Risk ID | Description | Level | Mitigation |
|---------|-------------|-------|------------|
| R-001 | Existing docs skills may have different structure | Low | Enhance existing, preserve what works |
| R-002 | README may need restructuring during sync | Medium | Enforce minimal surface area discipline |
| R-003 | Status truthfulness may conflict with feature claims | Medium | Explicit BR-008 enforcement |
| R-004 | Docs may overstep into developer role | Low | Explicit BR-007 enforcement |
| R-005 | Upstream artifacts may be incomplete | Medium | Blocked state handling defined |

### 8.2 Tradeoffs

| Decision | Chosen Approach | Alternative | Rationale |
|----------|-----------------|-------------|-----------|
| Skill enhancement | Enhance existing skills | Replace entirely | Preserve bootstrap patterns that work |
| Status inference | Require explicit status from upstream | Infer from artifacts | BR-003 evidence-based statusing |
| Changelog granularity | Per-feature entries | Aggregate entries | Aligns with release workflow |
| Multi-language | Out of MVP scope | Support multiple languages | Focus on primary documentation first |

### 8.3 Assumptions

| Assumption ID | Description | Impact if Wrong |
|---------------|-------------|-----------------|
| AS-001 | 003/004/005/006 features complete | Missing upstream interfaces |
| AS-002 | Governance documents authoritative | Need semantic re-alignment |
| AS-003 | README structure stable | Different README structure |
| AS-004 | Skills directory follows reviewer pattern | Different directory structure |

---

## 9. Requirement Traceability

### 9.1 Spec Requirements to Plan Mapping

| Spec Requirement | Plan Section | Task IDs |
|------------------|--------------|----------|
| BR-001: Consume Upstream Evidence | Phase 1 (Upstream), Phase 4 | P1-2, P4-1 |
| BR-002: Minimal Surface Area | Phase 2 (Skills), Phase 4 | P2-1, P4-4 |
| BR-003: Evidence-Based Statusing | Phase 2 (Skills) | P2-1 |
| BR-004: 6-Role Terminology | Phase 1, Phase 7 | P1-1, P7-1 |
| BR-005: Cross-Document Consistency | Phase 2 (Skills) | P2-1 |
| BR-006: Changelog Distinguish Change Types | Phase 2 (Skills) | P2-2 |
| BR-007: No Implementation Code Modification | Phase 1 (Role Scope) | P1-1 |
| BR-008: Status Truthfulness | Phase 2 (Skills) | P2-1 |

### 9.2 Acceptance Criteria to Tasks Mapping

| Acceptance Criteria | Tasks |
|---------------------|-------|
| AC-001: Feature Package Complete | All phases |
| AC-002: Docs Role Scope Formalized | P1-1, P6-1 |
| AC-003: Core Skills Formally Implemented | P2-1, P2-2 |
| AC-004: Artifact Contracts Defined | P3-1, P3-2 |
| AC-005: Upstream Consumption Logic Clear | P1-2, P4-1 |
| AC-006: Downstream Handoff Clear | P1-3, P4-2 |
| AC-007: Skill Assets Complete | P5-1, P5-2, P5-3 |
| AC-008: Consistency Discipline Present | P4-1, P4-3 |
| AC-009: Anti-Pattern Guidance Present | P4-4, P5-2 |
| AC-010: Scope Boundary Maintained | All phases (by design) |
| AC-011: Repository State Updated | P6-2, P7-1 |
| AC-012: 6-Role Terminology Preserved | P7-1, P7-2 |

---

## 10. Implementation Order

### 10.1 Recommended Execution Sequence

```
Day 1:
├── Phase 1: Role Scope Finalization (1 day)
│   └── Parallel: P1-1, P1-2, P1-3

Day 2-3:
├── Phase 2: Skill Formalization (2 days)
│   ├── P2-1: readme-sync (1 day)
│   └── P2-2: changelog-writing (1 day)

Day 4:
├── Phase 3: Artifact Contract Establishment (1 day)
│   └── Parallel: P3-1, P3-2

Day 5:
├── Phase 4: Validation & Quality Layer (1 day)
│   └── Sequential: P4-1 → P4-2 → P4-3 → P4-4

Day 6:
├── Phase 5: Educational & Example Layer (1 day)
│   └── Parallel: P5-1, P5-2, P5-3

Day 7 (Morning):
├── Phase 6: Workflow & Package Integration (0.5 day)
│   └── Sequential: P6-1 → P6-2 → P6-3

Day 7 (Afternoon):
└── Phase 7: Consistency Review (0.5 day)
    └── Sequential: P7-1 → P7-2 → P7-3
```

### 10.2 Parallel-Safe Tasks

| Phase | Parallel-Safe Tasks |
|-------|---------------------|
| Phase 1 | P1-1, P1-2, P1-3 (parallel) |
| Phase 2 | P2-1, P2-2 (parallel) |
| Phase 3 | P3-1, P3-2 (parallel) |
| Phase 5 | P5-1, P5-2, P5-3 (parallel) |

### 10.3 Dependencies

```
P1-1, P1-2, P1-3 → P2-1, P2-2
P2-1 → P3-1
P2-2 → P3-2
P3-1, P3-2 → P4-1, P4-2
P4-1, P4-2 → P4-3, P4-4
P4-3, P4-4 → P5-1, P5-2, P5-3
P5-1, P5-2, P5-3 → P6-1
P6-1 → P6-2 → P6-3
P6-3 → P7-1 → P7-2 → P7-3
```

---

## 11. Open Questions

### 11.1 From Spec (OQ-001, OQ-002, OQ-003, OQ-004)

| OQ ID | Question | Impact | Recommended Resolution |
|-------|----------|--------|------------------------|
| OQ-001 | Changelog granularity: per-feature or aggregate? | Changelog workflow | Per-feature entries, aggregated at release time |
| OQ-002 | Automated status inference vs explicit status? | Status handling | Require explicit status from completion-report or acceptance-decision-record |
| OQ-003 | Multi-language documentation handling? | Docs scope | Out of MVP scope; focus on primary documentation |
| OQ-004 | Documentation debt handling? | Docs workflow | Report as unresolved ambiguity; escalate if blocking |

### 11.2 New Open Questions from Planning

| OQ ID | Question | Impact | Temporary Assumption |
|-------|----------|--------|---------------------|
| OQ-005 | Should docs update README during partial feature completion? | README workflow | Only update when feature marked complete or has explicit status |
| OQ-006 | How to handle changelog for internal-only changes? | Changelog workflow | Include in changelog with docs-only type if user-facing impact |

---

## 12. Next Steps

### 12.1 Immediate Actions

1. **Create tasks.md**: Convert this plan to executable task list
2. **Confirm open questions**: Resolve OQ-001~OQ-006 decisions
3. **Begin Phase 1**: Role Scope Finalization

### 12.2 Dependencies on Other Features

| Dependency | Feature | Status |
|------------|---------|--------|
| 003-architect-core | Completed | ✅ |
| 004-developer-core | Completed | ✅ |
| 005-tester-core | Completed | ✅ |
| 006-reviewer-core | Completed | ✅ |
| 008-security-core | Planned | Waiting for this feature |

### 12.3 Deliverables Checklist

- [ ] `specs/007-docs-core/plan.md` (this document)
- [ ] `specs/007-docs-core/tasks.md`
- [ ] `specs/007-docs-core/role-scope.md`
- [ ] `specs/007-docs-core/upstream-consumption.md`
- [ ] `specs/007-docs-core/downstream-interfaces.md`
- [ ] `specs/007-docs-core/contracts/docs-sync-report-contract.md`
- [ ] `specs/007-docs-core/contracts/changelog-entry-contract.md`
- [ ] `.opencode/skills/docs/readme-sync/` (enhanced)
- [ ] `.opencode/skills/docs/changelog-writing/` (enhanced)
- [ ] `specs/007-docs-core/validation/` (checklists)
- [ ] `specs/007-docs-core/examples/` (example docs)
- [ ] `specs/007-docs-core/completion-report.md`

---

## References

- `specs/007-docs-core/spec.md` - Feature specification
- `specs/003-architect-core/` - Architect artifacts for upstream consumption
- `specs/004-developer-core/` - Developer artifacts for upstream consumption
- `specs/005-tester-core/` - Tester artifacts for upstream consumption
- `specs/006-reviewer-core/` - Reviewer artifacts for upstream consumption
- `package-spec.md` - Package governance specification
- `role-definition.md` - 6-role definition (Section 5: docs)
- `io-contract.md` - Input/output contract
- `quality-gate.md` - Quality gate rules
- `.opencode/skills/docs/*/SKILL.md` - Existing docs skill references