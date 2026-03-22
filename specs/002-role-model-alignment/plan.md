# Implementation Plan: 002-role-model-alignment

## Overview

This plan implements the role model alignment feature. The goal is to unify the role model cognition in the repository, align the governance documents with the technical skeleton semantics, and clarify the relationship between the 6-role formal model and the 3-skill transition skeleton.

**Spec Reference:** `specs/002-role-model-alignment/spec.md`

## Architecture

### Migration Strategy

```
Current State:
  Governance: 6-role (architect, developer, tester, reviewer, docs, security)
  Skeleton:   3-skill (spec-writer, architect-auditor, task-executor)

Target State:
  Governance: 6-role (formal model)
  Skeleton:   3-skill (marked as transition, will be gradually replaced)
  Mapping:    Clear 3-skill -> 6-role mapping documented
```

### Key Design Decisions

1. **Semantic Alignment First**: Prioritize semantic unification over physical restructuring
2. **Minimal Disruption**: Do not break existing bootstrap flow
3. **Explicit Documentation**: Write clear migration notes instead of silent reinterpretation
4. **Forward-Compatible**: Use 6-role naming for future features

## Implementation Phases

### Phase 1: Create Architecture Documentation (Parallel-Safe)

**Tasks:**
- P1-T001: Create `docs/architecture/role-model-evolution.md`
- P1-T002: Create `docs/infra/migration/skill-to-role-migration.md`

**Rationale:**
Establish the architectural foundation first. These documents define the migration strategy and serve as reference for all subsequent work.

**Acceptance Criteria:**
- Role-model-evolution.md explains: 6-role formal model, 3-skill transition nature, migration timeline
- Skill-to-role-migration.md provides detailed mapping: spec-writer -> bootstrap, architect-auditor -> architect + reviewer, task-executor -> developer + tester + docs + security

### Phase 2: Update Governance Documents (Sequential)

**Tasks:**
- P2-T003: Update `package-spec.md` - clarify 6-role formal status and 3-skill transition nature
- P2-T004: Update `role-definition.md` - add migration notes section
- P2-T005: Update `README.md` - adjust roadmap to use 6-role feature naming
- P2-T006: Update `AGENTS.md` - add "formal role semantics priority" rule

**Dependencies:**
- P2-T003 depends on P1-T001, P1-T002
- P2-T004 depends on P1-T001, P1-T002
- P2-T005 depends on P2-T003, P2-T004
- P2-T006 depends on P2-T003, P2-T004

**Rationale:**
Update the core governance documents to reflect the aligned role model. Must be done sequentially to maintain consistency.

**Acceptance Criteria:**
- package-spec.md clearly states: 6-role is formal, 3-skill is transition
- role-definition.md has a section explaining migration from 3-skill to 6-role
- README.md roadmap shows: 003-architect-core, 004-developer-core, etc.
- AGENTS.md includes: "Prefer 6-role semantics over 3-skill semantics"

### Phase 3: Verification (Sequential)

**Tasks:**
- P3-T007: Verify document consistency across all updated files
- P3-T008: Verify existing bootstrap flow still works
- P3-T009: Create summary report

**Dependencies:**
- All Phase 1 and Phase 2 tasks

**Acceptance Criteria:**
- No contradictions between README, package-spec, role-definition, AGENTS
- References to role-model-evolution.md are correct
- Bootstrap commands remain functional

## File Changes

### New Files

1. `docs/architecture/role-model-evolution.md`
   - 6-role formal model definition
   - 3-skill transition skeleton definition
   - Evolution timeline and migration strategy

2. `docs/infra/migration/skill-to-role-migration.md`
   - Detailed mapping table: 3-skill -> 6-role
   - Rationale for each mapping
   - Compatibility notes

### Modified Files

1. `package-spec.md`
   - Update "Supported Roles" section to emphasize 6-role formal status
   - Update "Supported Skills" section to mark 3-skill as transition
   - Add reference to migration documentation

2. `role-definition.md`
   - Add "Role Model Evolution" section at the end
   - Explain the relationship between 6-role and 3-skill
   - Add mapping table

3. `README.md`
   - Update "Recommended Workflow" section
   - Change "阶段 4: 命令与模板固化" to use 6-role naming
   - Update "下一步（M4 - 可选增强）" to show 6-role skill development
   - Update roadmap to: 003-architect-core, 004-developer-core, etc.

4. `AGENTS.md`
   - Add "Role Semantics Priority" rule
   - Update "Global Rules" to prefer 6-role terminology

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing bootstrap | Low | High | Do not modify .opencode/skills/ directory or command implementations |
| Contradictions in updated docs | Medium | Medium | Reviewer task to cross-check all updates |
| User confusion about migration | Medium | Medium | Clear documentation in role-model-evolution.md |
| Scope creep into physical refactoring | Medium | High | Strict adherence to "semantic alignment only" principle |

## Success Criteria

All Phase 3 verification tasks pass:
- AC-001: 正式模型明确 - 6-role clearly defined as formal
- AC-002: 过渡模型明确 - 3-skill clearly marked as transition
- AC-003: 映射关系存在 - Mapping documentation exists
- AC-004: 主线顺序清晰 - Roadmap shows 6-role feature sequence
- AC-005: 文档语义一致 - No contradictions across docs
- AC-006: 不破坏当前骨架 - Bootstrap flow still works

## Timeline Estimate

- Phase 1: 1-2 hours (parallel tasks)
- Phase 2: 2-3 hours (sequential tasks)
- Phase 3: 1 hour (verification)
- **Total: 4-6 hours**
