# Tasks: 002b-governance-repair

## Task Overview

This task list implements the governance repair feature to fix inconsistencies in 002-role-model-alignment.

---

## Phase 1: Create 002b Spec-Driven Documents

### T-001: Create spec.md

**Status:** Completed
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 20 minutes

**Description:**
Create the spec document defining the governance repair scope.

**Acceptance Criteria:**
- [x] spec.md created with Background, Goal, Scope, ACs
- [x] Explicitly states 003-architect-core is NOT in scope
- [x] Lists all files to be fixed

---

### T-002: Create plan.md

**Status:** In Progress
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 15 minutes

**Description:**
Create the implementation plan with phases and dependencies.

**Acceptance Criteria:**
- [ ] plan.md created with Overview, Architecture, Phases
- [ ] File changes listed
- [ ] Success criteria defined

---

### T-003: Create tasks.md

**Status:** Pending
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 15 minutes

**Description:**
Create the detailed task list (this document).

**Acceptance Criteria:**
- [ ] tasks.md created with all tasks
- [ ] Dependencies mapped
- [ ] Estimates provided

---

## Phase 2: Update 002 Completion Report

### T-004: Add Post-Completion Note to 002 completion-report

**Status:** Pending
**Priority:** High
**Assigned To:** docs
**Estimated Effort:** 10 minutes
**Dependencies:** T-001, T-002, T-003

**Description:**
Update the 002-role-model-alignment completion report to add a follow-up repair note.

**Acceptance Criteria:**
- [ ] Post-Completion Note section added
- [ ] References 002b-governance-repair
- [ ] Explains why follow-up repair was needed
- [ ] Does not delete original completion content

**Changes:**
- File: `specs/002-role-model-alignment/completion-report.md`
- Section: Add at end: "## Post-Completion Note" or "## Follow-up Repair Note"

---

## Phase 3: Fix Core Governance Documents

### T-005: Fix README.md

**Status:** Pending
**Priority:** High
**Assigned To:** docs
**Estimated Effort:** 25 minutes
**Dependencies:** T-004

**Description:**
Fix README.md to clarify 6-role formal model vs 3-skill legacy.

**Acceptance Criteria:**
- [ ] Skills directory described as two-tier structure
- [ ] 6-role explicitly called "formal execution model"
- [ ] 3-skill explicitly called "legacy transition/bootstrap skeleton"
- [ ] Workflow stages clarified
- [ ] No mention of 003-architect-core creation

**Changes:**
- File: `README.md`
- Sections to update:
  - Included Components (.opencode/skills/ description)
  - Recommended Workflow (stage descriptions)
  - Any skills listing

---

### T-006: Fix AGENTS.md

**Status:** Pending
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 20 minutes
**Dependencies:** T-004

**Description:**
Add Role Semantics Priority section and completion-report consistency rule.

**Acceptance Criteria:**
- [ ] "Role Semantics Priority" section added
- [ ] 6-role defined as formal execution semantics
- [ ] 3-skill defined as transition/legacy
- [ ] Feature naming rule: use 6-role terms
- [ ] Completion-report consistency rule added
- [ ] Semantic conflict resolution: package-spec + role-definition为准

**Changes:**
- File: `AGENTS.md`
- New sections:
  - ## Role Semantics Priority
  - Subsection: Completion Report Consistency

---

### T-007: Fix package-spec.md

**Status:** Pending
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 20 minutes
**Dependencies:** T-004

**Description:**
Add 6-role vs 3-skill mapping and clarify positioning.

**Acceptance Criteria:**
- [ ] 6-role clearly stated as formal execution model
- [ ] 3-skill clearly stated as bootstrap/transition
- [ ] Mapping section added:
  - spec-writer → architect (pre-spec) + docs
  - architect-auditor → architect + reviewer
  - task-executor → developer/tester/docs/security
- [ ] Note: 3-skill retained for compatibility, not governance主线

**Changes:**
- File: `package-spec.md`
- Section: After "Supported Skills", add mapping clarification

---

## Phase 4: Fix High-Risk Flow Order

### T-008: Verify role-definition.md high-risk flow

**Status:** Pending
**Priority:** High
**Assigned To:** reviewer
**Estimated Effort:** 10 minutes
**Dependencies:** T-005, T-006, T-007

**Description:**
Verify the high-risk flow in role-definition.md is correct.

**Acceptance Criteria:**
- [ ] Flow order is: architect → developer → tester → reviewer → security → docs
- [ ] Security explicitly noted as "after reviewer"
- [ ] No changes needed, or fixes applied

**Changes:**
- File: `role-definition.md`
- Expected: Already correct (source of truth)

---

### T-009: Fix m3-skills-integration-verification-report.md

**Status:** Pending
**Priority:** High
**Assigned To:** docs
**Estimated Effort:** 20 minutes
**Dependencies:** T-005, T-006, T-007

**Description:**
Fix the high-risk flow order in m3 verification report.

**Acceptance Criteria:**
- [ ] Flow order changed to: architect → developer → tester → reviewer → security → docs
- [ ] Key verification point updated: "security after reviewer" not "after tester"
- [ ] Diagram/ASCII art updated
- [ ] Correction note added explaining the fix
- [ ] Honest about original verification being based on wrong order

**Changes:**
- File: `specs/m3-skills-integration-verification-report.md`
- Lines to fix:
  - Line 727: "Security 角色正确插入: 在 Reviewer 后"
  - Line 735: Flow diagram
  - Line 742: security findings → reviewer input (already correct)

---

## Phase 5: Create 002b Completion Report

### T-010: Create completion-report.md

**Status:** Pending
**Priority:** High
**Assigned To:** docs
**Estimated Effort:** 15 minutes
**Dependencies:** T-008, T-009

**Description:**
Create the completion report for 002b-governance-repair.

**Acceptance Criteria:**
- [ ] Background section explains why repair was needed
- [ ] Problems list from spec
- [ ] Fixes applied enumerated
- [ ] Verification results (ACs satisfied)
- [ ] Impact on 003 (none, not created)
- [ ] Explicit statement: 003-architect-core not created

**Changes:**
- New file: `specs/002b-governance-repair/completion-report.md`

---

## Task Dependencies

```
T-001 ──┬── T-004 ──┬── T-005 ──┬── T-008 ──┬── T-010
        │           │           │           │
T-002 ──┘           ├── T-006 ──┤           │
                    │           │           │
T-003 ──────────────┴── T-007 ──┴── T-009 ──┘
```

**Phase Summary:**
- Phase 1: T-001, T-002, T-003 (parallel)
- Phase 2: T-004 (sequential)
- Phase 3: T-005, T-006, T-007 (parallel after T-004)
- Phase 4: T-008, T-009 (parallel after Phase 3)
- Phase 5: T-010 (sequential, final)

---

## Completion Criteria

All tasks completed:
- [ ] T-001: spec.md created
- [ ] T-002: plan.md created
- [ ] T-003: tasks.md created
- [ ] T-004: 002 completion report updated
- [ ] T-005: README.md fixed
- [ ] T-006: AGENTS.md fixed
- [ ] T-007: package-spec.md fixed
- [ ] T-008: role-definition.md verified
- [ ] T-009: m3 report fixed
- [ ] T-010: 002b completion report created

**Overall Success:**
- AC-001 through AC-008 satisfied
- 003-architect-core NOT created
- All governance documents consistent
