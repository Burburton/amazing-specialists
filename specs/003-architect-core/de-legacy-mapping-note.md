# De-Legacy Mapping Note: 3-Skill to 6-Role Transition

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `003-architect-core` |
| **Document Type** | De-Legacy Mapping Note |
| **Version** | 1.0.0 |
| **Created** | 2026-03-23 |
| **Status** | Draft |
| **Related BR** | BR-006 (Use 6-Role Formal Semantics) |

---

## 1. Purpose of This Document

### 1.1 Why This Document Exists

This document serves as the **authoritative mapping reference** for transitioning from the legacy 3-skill bootstrap skeleton to the 6-role formal execution model within the context of `003-architect-core` feature implementation.

### 1.2 Primary Objectives

1. **Explicit Mapping**: Provide clear, traceable mapping from legacy 3-skill capabilities to 6-role formal responsibilities
2. **Capability Preservation**: Ensure no capability is lost during transition—only reorganized
3. **Boundary Clarification**: Distinguish architect role boundaries from overlapping legacy skill functions
4. **Compatibility Guidance**: Enable parallel operation during transition without breaking existing bootstrap flows
5. **Deprecation Planning**: Establish clear criteria and timeline for legacy skill deprecation

### 1.3 Scope and Audience

**Primary Audience**:
- Feature developers implementing `003-architect-core`
- Skill developers migrating legacy capabilities
- Command developers updating workflow orchestration
- Reviewers verifying role boundary compliance

**Scope**:
- Focus on architect role capabilities only
- Does not cover developer/tester/reviewer/docs/security migration details
- References comprehensive migration documentation for full 3-skill → 6-role mapping

### 1.4 Relationship to BR-006

Per **BR-006** from `spec.md`:
> Legacy 3-skill terminology only appears in mapping and compatibility notes, not as the primary narrative framework.

This document is the **designated location** for legacy 3-skill terminology within the `003-architect-core` feature package. All other documents in this feature should use 6-role formal semantics exclusively.

---

## 2. 3-Skill to 6-Role Mapping Table

### 2.1 High-Level Mapping Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    3-Skill (Transition)                         │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ spec-writer  │  │ architect-auditor│  │  task-executor   │  │
│  └──────┬───────┘  └────────┬─────────┘  └────────┬─────────┘  │
│         │                   │                      │            │
│         │    ┌──────────────┴──────────────┐       │            │
│         │    │                             │       │            │
│         ▼    ▼                             ▼       ▼            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              6-Role (Formal Execution Model)                ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  ││
│  │  │architect │ │reviewer  │ │developer │ │tester+docs+sec│  ││
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Detailed Mapping for Architect Role

| Legacy 3-Skill | Capability | 6-Role Target | Architect Skill/Artifact |
|----------------|------------|---------------|-------------------------|
| **spec-writer** | spec.md authoring | bootstrap / upstream | _Not architect responsibility_ |
| **spec-writer** | scope clarification | architect + reviewer | `requirement-to-design` (design-note) |
| **spec-writer** | assumption recording | all roles | `requirement-to-design` (assumptions field) |
| **architect-auditor** | spec → technical plan | architect | `requirement-to-design` + `module-boundary-design` |
| **architect-auditor** | module boundary definition | architect | `module-boundary-design` (module-boundaries artifact) |
| **architect-auditor** | interface contract definition | architect | `module-boundary-design` (integration_seams) |
| **architect-auditor** | risk identification | architect + reviewer | `tradeoff-analysis` (risks_introduced) |
| **architect-auditor** | trade-off analysis | architect | `tradeoff-analysis` (risks-and-tradeoffs artifact) |
| **architect-auditor** | design consistency audit | reviewer | _Not architect responsibility_ |
| **task-executor** | code implementation | developer | _Not architect responsibility_ |
| **task-executor** | test design/execution | tester | _Not architect responsibility_ |
| **task-executor** | documentation sync | docs | _Not architect responsibility_ |
| **task-executor** | security review | security | _Not architect responsibility_ |

### 2.3 Mapping Status Legend

| Status | Meaning |
|--------|---------|
| ✅ **Mapped** | Capability fully covered by architect skill |
| ⚠️ **Split** | Capability shared with another role |
| ❌ **Not Architect** | Capability belongs to different role |
| 🔄 **Transition** | Currently in migration state |

---

## 3. Capability Comparison

### 3.1 Legacy spec-writer vs 6-Role Architect

#### spec-writer Capabilities (Legacy)

| Capability | Description | Current Location |
|------------|-------------|------------------|
| `spec-authoring` | Transform product intent into structured spec.md | `.opencode/skills/spec-writer/SKILL.md` |
| `scope-clarification` | Define feature boundaries and non-goals | `.opencode/skills/spec-writer/SKILL.md` |
| `assumption-recording` | Document design assumptions and open questions | `.opencode/skills/spec-writer/SKILL.md` |

#### 6-Role Architect Capabilities (Formal)

| Capability | Description | Skill | Artifact |
|------------|-------------|-------|----------|
| `requirement-to-design` | Transform feature specs into structured design notes | `requirement-to-design` | design-note |
| `module-boundary-design` | Define module boundaries, responsibilities, dependencies | `module-boundary-design` | module-boundaries |
| `tradeoff-analysis` | Document design decisions with alternatives and rationale | `tradeoff-analysis` | risks-and-tradeoffs |
| `assumption-recording` | Record design assumptions (all skills) | All 3 core skills | assumptions field |
| `open-question-exposure` | Expose unresolved design questions | All 3 core skills | open-questions |

#### Key Differences

| Aspect | spec-writer (Legacy) | architect (Formal) |
|--------|---------------------|-------------------|
| **Primary Output** | spec.md | design-note, module-boundaries, risks-and-tradeoffs |
| **Design Transformation** | Minimal (requirements only) | Comprehensive (requirements → design structure) |
| **Downstream Consumption** | Developer reads spec directly | Multiple roles consume specialized artifacts |
| **Trade-off Analysis** | Not required | Required field in risks-and-tradeoffs |
| **Module Boundaries** | High-level only | Detailed responsibility, dependency, integration seams |
| **Role Boundary** | Blurred with implementation | Explicit non-responsibilities defined |

#### Migration Notes for spec-writer

**Important**: spec-writer is **NOT** being migrated to architect. Per mapping:
- `spec-authoring` → bootstrap / upstream process (OpenClaw管理层 or dedicated spec-assist)
- `scope-clarification` → architect during design phase + reviewer during audit phase
- `assumption-recording` → all 6 roles should record assumptions in their outputs

**Compatibility Pattern**:
```
Current (/spec-start):
  user-input → spec-writer → spec.md

Future (/spec-start with architect):
  user-input → requirement-to-design → spec.md + design-note
```

---

### 3.2 Legacy architect-auditor vs 6-Role Architect + Reviewer

#### architect-auditor Capabilities (Legacy)

| Capability | Description | Current Location |
|------------|-------------|------------------|
| `spec-to-plan` | Transform spec into technical implementation plan | `.opencode/skills/architect-auditor/SKILL.md` |
| `module-boundary-definition` | Define module divisions and responsibilities | `.opencode/skills/architect-auditor/SKILL.md` |
| `interface-contract-definition` | Define API and data contracts | `.opencode/skills/architect-auditor/SKILL.md` |
| `design-consistency-audit` | Audit design against spec constraints | `.opencode/skills/architect-auditor/SKILL.md` |
| `risk-identification` | Identify technical risks and dependencies | `.opencode/skills/architect-auditor/SKILL.md` |
| `tradeoff-documentation` | Document technical trade-offs | `.opencode/skills/architect-auditor/SKILL.md` |

#### 6-Role Architect Capabilities (Formal)

| Capability | Description | Skill | Artifact |
|------------|-------------|-------|----------|
| `requirement-to-design` | Transform specs into design structure | `requirement-to-design` | design-note |
| `module-boundary-design` | Define modules, responsibilities, dependencies | `module-boundary-design` | module-boundaries |
| `interface-contract-design` | Define API/data contracts (advanced skill) | _Future: interface-contract-design_ | interface-contract |
| `tradeoff-analysis` | Analyze alternatives, document rationale | `tradeoff-analysis` | risks-and-tradeoffs |
| `risk-identification` | Identify design-level risks | All 3 skills | risks field |

#### 6-Role Reviewer Capabilities (Formal)

| Capability | Description | Skill | Artifact |
|------------|-------------|-------|----------|
| `design-review` | Independent review of design-note | _Future: design-review-checklist_ | review-report |
| `spec-implementation-diff` | Verify implementation matches spec | `spec-implementation-diff` | diff-report |
| `risk-audit` | Audit risk identification completeness | _Future: risk-review_ | audit-report |
| `approval-decision` | Approve/reject/warn decision | All reviewer skills | overall_decision field |

#### Capability Split: architect-auditor → architect + reviewer

```
architect-auditor (Legacy - Combined)
├── Design Phase
│   ├── spec-to-plan           → architect.requirement-to-design
│   ├── module-boundary-def    → architect.module-boundary-design
│   ├── interface-contract-def → architect.interface-contract-design (future)
│   ├── tradeoff-documentation → architect.tradeoff-analysis
│   └── risk-identification    → architect (design risks)
│
└── Audit Phase
    ├── design-consistency-audit → reviewer.design-review
    ├── spec-implementation-diff → reviewer.spec-implementation-diff
    ├── risk-audit              → reviewer.risk-audit (future)
    └── approval-decision       → reviewer (all skills)
```

#### Key Differences

| Aspect | architect-auditor (Legacy) | architect + reviewer (Formal) |
|--------|---------------------------|-------------------------------|
| **Phase Separation** | Combined design + audit | Distinct design phase → audit phase |
| **Independence** | Self-audit (designer audits own work) | Independent audit (reviewer is separate role) |
| **Output Artifacts** | Single plan document | Multiple specialized artifacts |
| **Approval Authority** | Implicit approval via plan completion | Explicit approve/reject/warn decision |
| **Risk Handling** | Identified during planning | Identified during design + audited during review |

#### Migration Notes for architect-auditor

**Status**: architect-auditor functionality is **SPLIT** between architect and reviewer.

**Compatibility Pattern**:
```
Current (/spec-plan):
  spec.md → architect-auditor → plan.md

Future (/spec-plan with 6-role):
  spec.md → architect → design-note + module-boundaries + risks-and-tradeoffs
                          ↓
                    reviewer → review-report (approval decision)
```

**During Transition**:
- Continue using architect-auditor for `/spec-plan` command
- New `003-architect-core` skills provide enhanced capabilities in parallel
- When architect skills mature, `/spec-plan` can migrate to 6-role flow

---

### 3.3 Legacy task-executor vs 6-Role Execution Chain

#### task-executor Capabilities (Legacy)

| Capability | Description | Current Location |
|------------|-------------|------------------|
| `task-execution` | Execute implementation tasks | `.opencode/skills/task-executor/SKILL.md` |
| `code-implementation` | Write production code | `.opencode/skills/task-executor/SKILL.md` |
| `self-verification` | Basic self-check of changes | `.opencode/skills/task-executor/SKILL.md` |
| `documentation-update` | Update docs as part of task | `.opencode/skills/task-executor/SKILL.md` |

#### 6-Role Execution Chain

```
task-executor (Legacy - Monolithic)
    ↓
developer → tester → reviewer → docs → security (optional)
```

| Capability | 6-Role Target | Skills |
|------------|---------------|--------|
| `code-implementation` | developer | `feature-implementation`, `bugfix-workflow` |
| `self-verification` | developer | `code-change-selfcheck` |
| `test-design` | tester | `unit-test-design`, `edge-case-matrix` |
| `test-execution` | tester | `regression-analysis` |
| `documentation-sync` | docs | `readme-sync`, `changelog-writing` |
| `security-review` | security | `auth-and-permission-review`, `input-validation-review` |

#### Architect's Relationship with task-executor Migration

**Important**: task-executor migration does **NOT** affect architect role directly.

Architect outputs are **consumed by** the execution chain:
- `design-note` → consumed by developer for implementation guidance
- `module-boundaries` → consumed by developer for module structure, tester for test scope
- `risks-and-tradeoffs` → consumed by reviewer for audit baseline, security for risk areas
- `open-questions` → consumed by all downstream roles for decision awareness

---

## 4. Migration Path Recommendations

### 4.1 Phase-Based Migration Strategy

#### Phase 1: Semantic Alignment (Current - 002-role-model-alignment) ✅

**Status**: Completed

**Objectives**:
- ✅ Establish 6-role as formal execution model
- ✅ Document 3-skill → 6-role mapping
- ✅ Update governance docs (README, package-spec, role-definition, AGENTS.md)
- ✅ Create migration documentation (role-model-evolution.md, skill-to-role-migration.md)

**Architect-Specific Deliverables**:
- This de-legacy mapping note
- BR-006 compliance (6-role semantics in primary narrative)

---

#### Phase 2: Core Role Implementation (003-008)

**Status**: In Progress (003-architect-core)

**Timeline**: 2026-Q2/Q3

**Objectives**:
- Implement complete architect skill set (3 core skills)
- Implement developer skill set (3 core skills)
- Implement tester skill set (3 core skills)
- Implement reviewer skill set (3 core skills)
- Implement docs skill set (2 core skills)
- Implement security skill set (2 core skills)

**Architect-Specific Deliverables**:
- `requirement-to-design` skill with examples, templates, checklists
- `module-boundary-design` skill with examples, templates, checklists
- `tradeoff-analysis` skill with examples, templates, checklists
- Artifact contracts (design-note, module-boundaries, risks-and-tradeoffs, open-questions)
- Downstream interface definitions

**Migration Actions**:
1. Implement architect skills in `.opencode/skills/architect/`
2. Ensure architect outputs are consumable by existing task-executor flow
3. Document compatibility patterns for parallel operation
4. Prepare for architect-auditor deprecation (not yet)

---

#### Phase 3: Command Migration (Future)

**Status**: Planned

**Timeline**: After 003-008 completion

**Objectives**:
- Migrate `/spec-plan` command from architect-auditor to architect role
- Update command workflows to use 6-role chain
- Maintain backward compatibility where needed

**Architect-Specific Changes**:
```
Before:
  /spec-plan → architect-auditor → plan.md

After:
  /spec-plan → architect → design-note + module-boundaries + risks-and-tradeoffs
                              ↓
                        reviewer → review-report
```

**Compatibility Requirements**:
- Maintain existing plan.md format if downstream depends on it
- OR provide migration guide for downstream consumers
- Document artifact mapping: plan.md sections → new artifact fields

---

#### Phase 4: Physical Restructuring (Future)

**Status**: Deferred

**Timeline**: Not before 2026-Q4

**Objectives**:
- Decide fate of 3-skill directories (archive vs delete vs maintain compat layer)
- Restructure `.opencode/skills/` to reflect 6-role model
- Update all references to legacy skills

**Decision Points**:
1. **Archive vs Delete**: Should 3-skill directories be preserved for historical reference?
2. **Compatibility Layer**: Should a thin wrapper maintain command compatibility?
3. **Documentation Cleanup**: When can de-legacy notes like this be deprecated?

**Recommended Approach**:
- Archive (not delete) 3-skill directories with DEPRECATION_NOTICE.md
- Maintain minimal compatibility wrappers for 6-12 months
- Keep this de-legacy mapping note as historical reference

---

### 4.2 Skill-by-Skill Migration Checklist

#### spec-writer Migration

- [ ] Document spec-writer as bootstrap/transition (✅ Done in migration docs)
- [ ] Identify upstream spec-authoring owner (OpenClaw管理层 or dedicated tool)
- [ ] Ensure architect `requirement-to-design` covers scope clarification
- [ ] Update `/spec-start` command to use 6-role flow (future)
- [ ] Add deprecation notice to spec-writer skill directory
- [ ] Archive spec-writer skill (Phase 4)

#### architect-auditor Migration

- [ ] Document architect-auditor split (✅ Done in this document)
- [ ] Implement architect `requirement-to-design` skill (003-architect-core)
- [ ] Implement architect `module-boundary-design` skill (003-architect-core)
- [ ] Implement architect `tradeoff-analysis` skill (003-architect-core)
- [ ] Implement reviewer `design-review` skill (006-reviewer-core)
- [ ] Ensure architect outputs cover all architect-auditor plan.md fields
- [ ] Update `/spec-plan` command to use architect + reviewer (Phase 3)
- [ ] Add deprecation notice to architect-auditor skill directory
- [ ] Archive architect-auditor skill (Phase 4)

#### task-executor Migration

- [ ] Document task-executor split (✅ Done in migration docs)
- [ ] Implement developer skills (004-developer-core)
- [ ] Implement tester skills (005-tester-core)
- [ ] Implement reviewer skills (006-reviewer-core)
- [ ] Implement docs skills (007-docs-core)
- [ ] Implement security skills (008-security-core)
- [ ] Update `/spec-implement` command to use 6-role chain (Phase 3)
- [ ] Add deprecation notice to task-executor skill directory
- [ ] Archive task-executor skill (Phase 4)

---

### 4.3 Artifact Migration Mapping

#### plan.md → New Artifact Structure

If current architect-auditor outputs `plan.md`, map fields to new artifacts:

| plan.md Section | New Artifact | Field |
|-----------------|--------------|-------|
| `background` | design-note | background |
| `feature_goal` | design-note | feature_goal |
| `technical_approach` | design-note | design_summary |
| `module_structure` | module-boundaries | module_list + module_responsibilities |
| `dependencies` | module-boundaries | dependency_directions |
| `risks` | risks-and-tradeoffs | risks_introduced |
| `implementation_order` | design-note | recommended_implementation_order |
| `assumptions` | design-note | assumptions |
| `open_questions` | open-questions | (all fields) |

**Migration Strategy**:
- Option A: Maintain plan.md as aggregated artifact (generated from new artifacts)
- Option B: Deprecate plan.md, consumers read individual artifacts directly
- Option C: Maintain both during transition, provide sync tool

**Recommendation**: Option A for Phase 3, Option B for Phase 4

---

## 5. Compatibility Notes During Transition

### 5.1 Parallel Operation Principles

**PRINCIPLE 1**: Do not break existing bootstrap flows

During Phases 1-3, both 3-skill and 6-role flows must coexist:
```
┌─────────────────────────────────────────────────────────────┐
│                    Parallel Operation                        │
│                                                             │
│   Legacy Flow:                                              │
│   /spec-plan → architect-auditor → plan.md ─────────┐       │
│                                                     │       │
│   New Flow:                                         │       │
│   /spec-plan → architect → artifacts → reviewer ────┼───────│
│                                                     │       │
│   Both flows produce consumable output for downstream │       │
└─────────────────────────────────────────────────────┘
```

**PRINCIPLE 2**: Use 6-role semantics in documentation

Even when calling 3-skill internally, document using 6-role terms:
- ❌ "spec-writer skill will create the spec"
- ✅ "The spec-authoring process (currently via spec-writer skill) will..."

**PRINCIPLE 3**: Mark legacy compatibility explicitly

When code must reference 3-skill:
```markdown
<!-- LEGACY_COMPATIBILITY: spec-writer -->
<!-- TO_BE_REMOVED: Phase 4 (after 006-reviewer-core) -->
```

```javascript
// LEGACY_COMPATIBILITY: architect-auditor
// REPLACEMENT: architect.requirement-to-design + reviewer.design-review
// DEPRECATION_TARGET: Phase 4
```

---

### 5.2 Command Compatibility Matrix

| Command | Current Implementation | Phase 2 Target | Phase 3 Target |
|---------|----------------------|----------------|----------------|
| `/spec-start` | spec-writer | spec-writer (unchanged) | upstream-spec-assist or architect |
| `/spec-plan` | architect-auditor | architect-auditor OR architect (opt-in) | architect + reviewer |
| `/spec-tasks` | architect-auditor | architect-auditor OR architect (opt-in) | architect + reviewer |
| `/spec-implement` | task-executor | task-executor (unchanged) | developer + tester + docs |
| `/spec-audit` | architect-auditor | architect-auditor | reviewer (+ security if needed) |

**Opt-In Mechanism** (Phase 2):
```
/spec-plan --use-6-role  # Use architect skills instead of architect-auditor
```

---

### 5.3 Artifact Compatibility

#### Reading Legacy Artifacts

Architect skills should gracefully handle legacy inputs:

```markdown
**Input Handling**:
- If `plan.md` exists (from architect-auditor), read as legacy design baseline
- If `design-note` exists (from architect), use as primary design source
- If both exist, prefer design-note and log warning about plan.md deprecation
```

#### Producing Compatible Outputs

During transition, architect may need to produce both:

```markdown
**Output Generation**:
- Always produce: design-note, module-boundaries, risks-and-tradeoffs
- Optionally produce: plan.md (aggregated from new artifacts) for backward compatibility
- Mark plan.md as GENERATED_FROM_ARTIFACTS with timestamp
```

---

### 5.4 Common Compatibility Pitfalls

#### Pitfall 1: Assuming 3-skill Are Immediately Removed

❌ **Wrong**: "Since we have architect-core, I can delete architect-auditor"

✅ **Correct**: "architect-auditor remains active during Phases 1-3. Deprecation happens in Phase 4 after all commands migrate."

#### Pitfall 2: Mixing Terminology in Primary Narrative

❌ **Wrong**: "The architect-auditor role will design the module structure..."

✅ **Correct**: "The architect role (via module-boundary-design skill) will define module boundaries. Note: architect-auditor is a legacy skill being transitioned."

#### Pitfall 3: Breaking Existing Workflows

❌ **Wrong**: Updating `/spec-plan` to require new architect skills before they're complete

✅ **Correct**: Implement opt-in mechanism, allow users to choose legacy or new flow during transition

#### Pitfall 4: Forgetting Downstream Consumers

❌ **Wrong**: Changing artifact format without considering downstream impact

✅ **Correct**: Maintain backward-compatible output or provide migration tool for downstream consumers

---

## 6. Timeline Expectations

### 6.1 Deprecation Milestones

| Milestone | Target Date | Dependencies | Status |
|-----------|-------------|--------------|--------|
| Phase 1 Complete | 2026-03 | 002-role-model-alignment | ✅ Done |
| 003-architect-core Complete | 2026-Q2 | Phase 1 | 🔄 In Progress |
| 004-developer-core Complete | 2026-Q2/Q3 | 003-architect-core | ⏳ Planned |
| 005-tester-core Complete | 2026-Q2/Q3 | 003-architect-core | ⏳ Planned |
| 006-reviewer-core Complete | 2026-Q3 | 003-architect-core | ⏳ Planned |
| 007-docs-core Complete | 2026-Q3 | 004-developer-core | ⏳ Planned |
| 008-security-core Complete | 2026-Q3 | 004-developer-core | ⏳ Planned |
| Phase 3 (Command Migration) Start | After 008-security-core | All 003-008 | ⏳ Future |
| Phase 4 (Physical Restructuring) Start | Not before 2026-Q4 | Phase 3 complete | ⏳ Future |
| 3-skill Deprecation Notice | Phase 3 | Decision from governance | ⏳ Future |
| 3-skill Archive/Delete | Phase 4 | 6-12 months after deprecation notice | ⏳ Future |

---

### 6.2 Deprecation Criteria

**Before marking any 3-skill as DEPRECATED**:

- [ ] All 3-skill capabilities fully covered by 6-role skills
- [ ] All commands migrated to 6-role flow
- [ ] No active projects depend on 3-skill (or migration path provided)
- [ ] Deprecation notice published at least 6 months in advance
- [ ] Migration guide available for affected users
- [ ] Backward compatibility layer implemented (if needed)

**Before REMOVING any 3-skill**:

- [ ] Deprecation notice published ≥6 months ago
- [ ] All users migrated (or compatibility layer active)
- [ ] Documentation updated to remove 3-skill references (except historical)
- [ ] This de-legacy mapping note updated with removal date
- [ ] Governance docs (README, package-spec) updated

---

### 6.3 Expected Deprecation Dates (Estimates)

| Skill | Deprecation Notice Earliest | Removal Earliest |
|-------|----------------------------|------------------|
| spec-writer | 2026-Q3 (after upstream-spec-assist decision) | 2027-Q1 |
| architect-auditor | 2026-Q4 (after 006-reviewer-core) | 2027-Q2 |
| task-executor | 2026-Q4 (after 008-security-core) | 2027-Q2 |

**Note**: These are estimates. Actual dates depend on:
- Completion of 003-008 features
- Command migration complexity
- User feedback and adoption rate
- Breaking change tolerance

---

## 7. References to Migration Documentation

### 7.1 Primary Migration Documents

| Document | Location | Purpose |
|----------|----------|---------|
| **Role Model Evolution** | `docs/architecture/role-model-evolution.md` | High-level strategy, timeline, decision log |
| **Skill-to-Role Migration Guide** | `docs/infra/migration/skill-to-role-migration.md` | Detailed mapping for all 3 skills, checklists, FAQ |
| **De-Legacy Mapping Note** (This Doc) | `specs/003-architect-core/de-legacy-mapping-note.md` | Architect-specific migration details |

---

### 7.2 Governance Documents (Updated for 6-Role)

| Document | Status | Migration Relevance |
|----------|--------|---------------------|
| `README.md` | ✅ Updated | Contains 6-role/3-skill distinction in skills section |
| `package-spec.md` | ✅ Updated | Defines 6-role as formal execution model |
| `role-definition.md` | ✅ Updated | Detailed 6-role definitions + Appendix with migration notes |
| `io-contract.md` | ✅ Updated | Uses 6-role semantics for dispatch/execution contracts |
| `quality-gate.md` | ✅ Updated | Quality gates defined for 6 roles |
| `collaboration-protocol.md` | ✅ Updated | Role collaboration workflows use 6-role |
| `AGENTS.md` | ✅ Updated | Explicit 6-role priority over 3-skill |

---

### 7.3 Feature Specifications

| Feature | Location | Relevance |
|---------|----------|-----------|
| `002-role-model-alignment` | `specs/002-role-model-alignment/` | Completed semantic alignment |
| `002b-governance-repair` | `specs/002b-governance-repair/` | Governance document consistency |
| `003-architect-core` (Current) | `specs/003-architect-core/` | Architect role core implementation |
| `004-developer-core` (Planned) | `specs/004-developer-core/` | Developer role core implementation |
| `005-tester-core` (Planned) | `specs/005-tester-core/` | Tester role core implementation |
| `006-reviewer-core` (Planned) | `specs/006-reviewer-core/` | Reviewer role core implementation |
| `007-docs-core` (Planned) | `specs/007-docs-core/` | Docs role core implementation |
| `008-security-core` (Planned) | `specs/008-security-core/` | Security role core implementation |

---

### 7.4 Legacy Compatibility References

These documents/skills still use 3-skill terminology (marked as transition):

| Location | Skill | Status | Notes |
|----------|-------|--------|-------|
| `.opencode/skills/spec-writer/` | spec-writer | 🔄 Transition | Will be deprecated in Phase 4 |
| `.opencode/skills/architect-auditor/` | architect-auditor | 🔄 Transition | Will be deprecated in Phase 4 |
| `.opencode/skills/task-executor/` | task-executor | 🔄 Transition | Will be deprecated in Phase 4 |
| `.opencode/commands/spec-start` | (uses spec-writer) | 🔄 Transition | Migration planned for Phase 3 |
| `.opencode/commands/spec-plan` | (uses architect-auditor) | 🔄 Transition | Migration planned for Phase 3 |
| `.opencode/commands/spec-implement` | (uses task-executor) | 🔄 Transition | Migration planned for Phase 3 |

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **3-Skill** | Legacy transition skeleton: spec-writer, architect-auditor, task-executor |
| **6-Role** | Formal execution model: architect, developer, tester, reviewer, docs, security |
| **Phase 1** | Semantic alignment (governance docs, mapping) - ✅ Complete |
| **Phase 2** | Core role implementation (003-008 features) - In Progress |
| **Phase 3** | Command migration to 6-role - Planned |
| **Phase 4** | Physical restructuring (skill directory reorg) - Future |
| **Deprecation Notice** | Formal announcement that a skill will be removed (≥6 months advance) |
| **Legacy Compatibility** | Maintaining 3-skill functionality during transition |
| **Opt-In** | Mechanism to use new 6-role flow before it becomes default |

---

## Appendix B: Quick Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│           Should I use 3-skill or 6-role terminology?        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Context?      │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Primary       │  │ Legacy        │  │ Migration     │
│ Documentation │  │ Code/Commands │  │ Discussion    │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Use 6-role    │  │ Mark as       │  │ Use both with │
│ exclusively   │  │ "transition"  │  │ clear mapping │
│               │  │ + add notice  │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## Appendix C: Contact and Ownership

| Document | Owner | Last Updated | Next Review |
|----------|-------|-------------|-------------|
| This de-legacy mapping note | 003-architect-core feature team | 2026-03-23 | After 003-architect-core completion |
| role-model-evolution.md | Governance team | 2026-03-23 | After each phase completion |
| skill-to-role-migration.md | Migration team | 2026-03-23 | After 003-008 completion |

**Questions?** Refer to governance docs or open issue in specs/003-architect-core.

---

**END OF DOCUMENT**
