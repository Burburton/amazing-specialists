# Implementation Plan: 002b-governance-repair

## Overview

This plan implements the governance repair feature to fix inconsistencies between 002-role-model-alignment completion claims and actual repository state.

**Spec Reference**: `specs/002b-governance-repair/spec.md`

## Architecture

### Problem Analysis

```
Issues to Fix:
├── 002 completion-report drift
│   └── Solution: Add follow-up repair note linking to 002b
├── 6-role/3-skill semantic inconsistency
│   ├── README.md - skills description
│   ├── AGENTS.md - missing Role Semantics Priority
│   └── package-spec.md - unclear 3-skill positioning
└── High-risk flow order conflict
    ├── role-definition.md - source of truth
    └── m3-verification-report - wrong order
```

### Repair Strategy

1. **Documentation-only changes** - no code changes
2. **Semantic alignment** - unify terminology across docs
3. **Flow order correction** - security after reviewer
4. **Traceability** - link 002 to 002b completion reports

## Implementation Phases

### Phase 1: Create 002b Spec-Driven Documents (Parallel-Safe)

**Tasks:**
- P1-T001: Create `specs/002b-governance-repair/spec.md` ✅
- P1-T002: Create `specs/002b-governance-repair/plan.md`
- P1-T003: Create `specs/002b-governance-repair/tasks.md`

**Rationale:**
Establish the spec-driven foundation first.

### Phase 2: Update 002 Completion Report (Sequential)

**Tasks:**
- P2-T004: Update `specs/002-role-model-alignment/completion-report.md`
  - Add Post-Completion Note / Follow-up Repair Note
  - Reference 002b-governance-repair

**Dependencies:**
- P2-T004 depends on P1-T001, P1-T002, P1-T003

### Phase 3: Fix Core Governance Documents (Sequential)

**Tasks:**
- P3-T005: Fix `README.md`
  - Clarify 6-role formal model
  - Clarify 3-skill as legacy transition
  - Fix skills directory description (two-tier structure)
  - Update workflow stages

- P3-T006: Fix `AGENTS.md`
  - Add "Role Semantics Priority" section
  - Add completion-report consistency rule

- P3-T007: Fix `package-spec.md`
  - Add 6-role vs 3-skill mapping section
  - Clarify 3-skill as bootstrap/transition

**Dependencies:**
- P3-T005, P3-T006, P3-T007 can be done in parallel after P2-T004

### Phase 4: Fix High-Risk Flow Order (Sequential)

**Tasks:**
- P4-T008: Verify and fix `role-definition.md` high-risk flow
- P4-T009: Fix `specs/m3-skills-integration-verification-report.md`
  - Change flow order to: architect → developer → tester → reviewer → security → docs
  - Update verification conclusions
  - Add correction note

**Dependencies:**
- P4-T008, P4-T009 depend on P3-T005, P3-T006, P3-T007

### Phase 5: Create 002b Completion Report (Sequential)

**Tasks:**
- P5-T010: Create `specs/002b-governance-repair/completion-report.md`

**Dependencies:**
- All previous tasks

## File Changes

### Modified Files

1. `specs/002-role-model-alignment/completion-report.md`
   - Add Post-Completion Note

2. `README.md`
   - Fix skills directory description
   - Update workflow stages
   - Clarify 6-role/3-skill relationship

3. `AGENTS.md`
   - Add Role Semantics Priority section
   - Add governance consistency rule

4. `package-spec.md`
   - Add 6-role vs 3-skill mapping

5. `specs/m3-skills-integration-verification-report.md`
   - Fix high-risk flow order
   - Update verification conclusions

### New Files

1. `specs/002b-governance-repair/spec.md`
2. `specs/002b-governance-repair/plan.md`
3. `specs/002b-governance-repair/tasks.md`
4. `specs/002b-governance-repair/completion-report.md`

## Success Criteria

All AC-001 through AC-008 from spec.md satisfied:
- AC-001: 6-role/3-skill semantics unified across README/AGENTS/package-spec
- AC-002: README skills description reflects two-tier structure
- AC-003: AGENTS.md has Role Semantics Priority rule
- AC-004: package-spec.md has 6-role vs 3-skill mapping
- AC-005: High-risk flow order unified
- AC-006: 002 completion report links to 002b
- AC-007: 002b spec-driven documents created
- AC-008: Explicit note that 003 not created

## Timeline Estimate

- Phase 1: 30 minutes
- Phase 2: 15 minutes
- Phase 3: 60 minutes
- Phase 4: 30 minutes
- Phase 5: 20 minutes
- **Total: 2.5-3 hours**
