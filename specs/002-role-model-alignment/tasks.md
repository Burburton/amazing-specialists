# Tasks: 002-role-model-alignment

## Task Overview

This task list implements the role model alignment feature. Tasks are organized by phase and dependency.

---

## Phase 1: Create Architecture Documentation

### T-001: Create docs/architecture/role-model-evolution.md

**Status:** Pending
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 1 hour
**Parallel-Safe:** Yes

**Description:**
Create the role model evolution document that defines the 6-role formal model, explains the 3-skill transition nature, and outlines the migration strategy.

**Acceptance Criteria:**
- [ ] Document explains 6-role formal model (architect, developer, tester, reviewer, docs, security)
- [ ] Document explains 3-skill transition skeleton (spec-writer, architect-auditor, task-executor)
- [ ] Document includes evolution timeline
- [ ] Document explains "semantic alignment before physical restructuring" principle
- [ ] Document is placed in `docs/architecture/role-model-evolution.md`

**Inputs:**
- `specs/002-role-model-alignment/spec.md`
- `role-definition.md`
- `package-spec.md`

**Outputs:**
- `docs/architecture/role-model-evolution.md`

---

### T-002: Create docs/infra/migration/skill-to-role-migration.md

**Status:** Pending
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 1 hour
**Parallel-Safe:** Yes
**Dependencies:** None (can run parallel with T-001)

**Description:**
Create the detailed migration document that maps each 3-skill to its corresponding 6-role(s) and explains the rationale.

**Acceptance Criteria:**
- [ ] Document includes mapping table: spec-writer -> bootstrap / upstream-spec-assist
- [ ] Document includes mapping table: architect-auditor -> architect + reviewer
- [ ] Document includes mapping table: task-executor -> developer + tester + docs + security
- [ ] Each mapping has rationale explanation
- [ ] Document includes compatibility notes
- [ ] Document is placed in `docs/infra/migration/skill-to-role-migration.md`

**Inputs:**
- `specs/002-role-model-alignment/spec.md`
- `.opencode/skills/` directory structure

**Outputs:**
- `docs/infra/migration/skill-to-role-migration.md`

---

## Phase 2: Update Governance Documents

### T-003: Update package-spec.md - Clarify Role Model Status

**Status:** Pending
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 30 minutes
**Parallel-Safe:** No (depends on T-001, T-002)

**Description:**
Update the package-spec.md to clearly distinguish between the 6-role formal model and the 3-skill transition skeleton.

**Acceptance Criteria:**
- [ ] "Supported Roles" section clearly states 6-role is the formal execution layer model
- [ ] "Supported Skills" section marks 3-skill as "transition/bootstrap skeleton"
- [ ] Add note explaining the relationship between roles and skills
- [ ] Add reference to role-model-evolution.md

**Inputs:**
- `specs/002-role-model-alignment/spec.md`
- `specs/002-role-model-alignment/plan.md`
- `docs/architecture/role-model-evolution.md` (from T-001)

**Outputs:**
- Updated `package-spec.md`

---

### T-004: Update role-definition.md - Add Migration Notes

**Status:** Pending
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 30 minutes
**Parallel-Safe:** No (depends on T-001, T-002)

**Description:**
Add a section to role-definition.md explaining the migration from 3-skill to 6-role model.

**Acceptance Criteria:**
- [ ] Add "Role Model Evolution" section at end of document
- [ ] Explain that 6-role is formal, 3-skill is transition
- [ ] Include mapping table showing 3-skill -> 6-role relationships
- [ ] Add reference to migration documentation

**Inputs:**
- `specs/002-role-model-alignment/spec.md`
- `docs/architecture/role-model-evolution.md` (from T-001)
- `docs/infra/migration/skill-to-role-migration.md` (from T-002)

**Outputs:**
- Updated `role-definition.md`

---

### T-005: Update README.md - Adjust Roadmap

**Status:** Pending
**Priority:** High
**Assigned To:** docs
**Estimated Effort:** 30 minutes
**Parallel-Safe:** No (depends on T-003, T-004)

**Description:**
Update the README.md to use 6-role naming for future features and clarify the current migration state.

**Acceptance Criteria:**
- [ ] Update "阶段 4: 命令与模板固化" to mention 6-role structure
- [ ] Update "下一步（M4 - 可选增强）" table to show 6-role skill development
- [ ] Update roadmap to show: 003-architect-core, 004-developer-core, 005-tester-core, 006-reviewer-core
- [ ] Add note about current migration state

**Inputs:**
- `specs/002-role-model-alignment/spec.md`
- Updated `package-spec.md` (from T-003)
- Updated `role-definition.md` (from T-004)

**Outputs:**
- Updated `README.md`

---

### T-006: Update AGENTS.md - Add Role Semantics Priority Rule

**Status:** Pending
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 20 minutes
**Parallel-Safe:** No (depends on T-003, T-004)

**Description:**
Add a rule to AGENTS.md that establishes 6-role semantics as the priority over 3-skill semantics.

**Acceptance Criteria:**
- [ ] Add "Role Semantics Priority" section or rule
- [ ] State: "When referencing roles, prefer 6-role terminology (architect, developer, tester, reviewer, docs, security) over 3-skill terminology"
- [ ] Add note about migration in progress
- [ ] Update "Global Rules" if needed

**Inputs:**
- `specs/002-role-model-alignment/spec.md`
- Updated `package-spec.md` (from T-003)
- Updated `role-definition.md` (from T-004)

**Outputs:**
- Updated `AGENTS.md`

---

## Phase 3: Verification

### T-007: Verify Document Consistency

**Status:** Pending
**Priority:** Medium
**Assigned To:** reviewer
**Estimated Effort:** 30 minutes
**Parallel-Safe:** No (depends on T-003, T-004, T-005, T-006)

**Description:**
Cross-check all updated documents to ensure consistency in role terminology and migration messaging.

**Acceptance Criteria:**
- [ ] No contradictions between README, package-spec, role-definition, AGENTS
- [ ] All references to role-model-evolution.md are correct
- [ ] 6-role terminology is used consistently
- [ ] 3-skill is consistently marked as transition

**Inputs:**
- Updated `README.md` (from T-005)
- Updated `package-spec.md` (from T-003)
- Updated `role-definition.md` (from T-004)
- Updated `AGENTS.md` (from T-006)

**Outputs:**
- Consistency verification report (can be in task comments)

---

### T-008: Verify Bootstrap Flow Still Works

**Status:** Pending
**Priority:** Medium
**Assigned To:** tester
**Estimated Effort:** 20 minutes
**Parallel-Safe:** No (depends on T-003, T-004, T-005, T-006)

**Description:**
Verify that existing bootstrap commands and flows remain functional after documentation updates.

**Acceptance Criteria:**
- [ ] `/spec-start` command reference is still valid
- [ ] `/spec-plan` command reference is still valid
- [ ] `/spec-tasks` command reference is still valid
- [ ] `/spec-implement` command reference is still valid
- [ ] `/spec-audit` command reference is still valid
- [ ] Skills directory structure is intact

**Inputs:**
- `.opencode/commands/` directory
- `.opencode/skills/` directory
- Updated governance documents

**Outputs:**
- Bootstrap verification report

---

### T-009: Create Summary Report

**Status:** Pending
**Priority:** Low
**Assigned To:** docs
**Estimated Effort:** 20 minutes
**Parallel-Safe:** No (depends on T-007, T-008)

**Description:**
Create a summary report documenting what was changed and the current migration state.

**Acceptance Criteria:**
- [ ] List all files created/modified
- [ ] Summarize key changes
- [ ] Document any open questions or risks
- [ ] Place report in `specs/002-role-model-alignment/completion-report.md`

**Inputs:**
- All completed tasks
- Verification reports from T-007, T-008

**Outputs:**
- `specs/002-role-model-alignment/completion-report.md`

---

## Task Dependencies Graph

```
T-001 ──┬──┬── T-003 ──┬── T-005 ──┬── T-007 ──┬── T-009
        │  │           │           │           │
T-002 ──┘  └───────────┴── T-004 ──┘           │
                                               │
                                    T-008 ─────┘
```

**Legend:**
- Phase 1: T-001, T-002 (parallel-safe)
- Phase 2: T-003, T-004, T-005, T-006 (sequential)
- Phase 3: T-007, T-008, T-009 (sequential)

---

## Completion Criteria

All tasks must be completed with their acceptance criteria satisfied:

- [ ] T-001: Architecture document created
- [ ] T-002: Migration document created
- [ ] T-003: package-spec.md updated
- [ ] T-004: role-definition.md updated
- [ ] T-005: README.md updated
- [ ] T-006: AGENTS.md updated
- [ ] T-007: Consistency verified
- [ ] T-008: Bootstrap flow verified
- [ ] T-009: Summary report created

**Overall Success Criteria:**
- All AC-001 through AC-006 from spec.md are satisfied
- No breaking changes to existing functionality
- Documentation is consistent across all files
