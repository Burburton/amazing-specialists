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

**Status:** Completed
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 15 minutes

**Description:**
Create the implementation plan with phases and dependencies.

**Acceptance Criteria:**
- [x] plan.md created with Overview, Architecture, Phases
- [x] File changes listed
- [x] Success criteria defined

---

### T-003: Create tasks.md

**Status:** Completed
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 15 minutes

**Description:**
Create the detailed task list (this document).

**Acceptance Criteria:**
- [x] tasks.md created with all tasks
- [x] Dependencies mapped
- [x] Estimates provided

---

## Phase 2: Update 002 Completion Report

### T-004: Add Post-Completion Note to 002 completion-report

**Status:** Completed
**Priority:** High
**Assigned To:** docs
**Estimated Effort:** 10 minutes
**Dependencies:** T-001, T-002, T-003

**Description:**
Update the 002-role-model-alignment completion report to add a follow-up repair note.

**Acceptance Criteria:**
- [x] Post-Completion Note section added
- [x] References 002b-governance-repair
- [x] Explains why follow-up repair was needed
- [x] Does not delete original completion content

**Changes:**
- File: `specs/002-role-model-alignment/completion-report.md`
- Section: Add at end: "## Post-Completion Note" or "## Follow-up Repair Note"

---

## Phase 3: Fix Core Governance Documents

### T-005: Fix README.md

**Status:** Completed
**Priority:** High
**Assigned To:** docs
**Estimated Effort:** 25 minutes
**Dependencies:** T-004

**Description:**
Fix README.md to clarify 6-role formal model vs 3-skill legacy.

**Acceptance Criteria:**
- [x] Skills directory described as two-tier structure
- [x] 6-role explicitly called "formal execution model"
- [x] 3-skill explicitly called "legacy transition/bootstrap skeleton"
- [x] Workflow stages clarified
- [x] No mention of 003-architect-core creation

**Changes:**
- File: `README.md`
- Sections to update:
  - Included Components (.opencode/skills/ description)
  - Recommended Workflow (stage descriptions)
  - Any skills listing

---

### T-006: Fix AGENTS.md

**Status:** Completed
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 20 minutes
**Dependencies:** T-004

**Description:**
Add Role Semantics Priority section and completion-report consistency rule.

**Acceptance Criteria:**
- [x] "Role Semantics Priority" section added
- [x] 6-role defined as formal execution semantics
- [x] 3-skill defined as transition/legacy
- [x] Feature naming rule: use 6-role terms
- [x] Completion-report consistency rule added
- [x] Semantic conflict resolution: package-spec + role-definition为准

**Changes:**
- File: `AGENTS.md`
- New sections:
  - ## Role Semantics Priority
  - Subsection: Completion Report Consistency

---

### T-007: Fix package-spec.md

**Status:** Completed
**Priority:** High
**Assigned To:** architect
**Estimated Effort:** 20 minutes
**Dependencies:** T-004

**Description:**
Add 6-role vs 3-skill mapping and clarify positioning.

**Acceptance Criteria:**
- [x] 6-role clearly stated as formal execution model
- [x] 3-skill clearly stated as bootstrap/transition
- [x] Mapping section added:
  - spec-writer → architect (pre-spec) + docs
  - architect-auditor → architect + reviewer
  - task-executor → developer/tester/docs/security
- [x] Note: 3-skill retained for compatibility, not governance主线

**Changes:**
- File: `package-spec.md`
- Section: After "Supported Skills", add mapping clarification

---

## Phase 4: Fix High-Risk Flow Order

### T-008: Verify role-definition.md high-risk flow

**Status:** Completed
**Priority:** High
**Assigned To:** reviewer
**Estimated Effort:** 10 minutes
**Dependencies:** T-005, T-006, T-007

**Description:**
Verify the high-risk flow in role-definition.md is correct.

**Acceptance Criteria:**
- [x] Flow order is: architect → developer → tester → reviewer → security → docs
- [x] Security explicitly noted as "after reviewer"
- [x] No changes needed, or fixes applied

**Changes:**
- File: `role-definition.md`
- Expected: Already correct (source of truth)

---

### T-009: Fix m3-skills-integration-verification-report.md

**Status:** Completed
**Priority:** High
**Assigned To:** docs
**Estimated Effort:** 20 minutes
**Dependencies:** T-005, T-006, T-007

**Description:**
Fix the high-risk flow order in m3 verification report.

**Acceptance Criteria:**
- [x] Flow order changed to: architect → developer → tester → reviewer → security → docs
- [x] Key verification point updated: "security after reviewer" not "after tester"
- [x] Diagram/ASCII art updated
- [x] Correction note added explaining the fix
- [x] Honest about original verification being based on wrong order

**Changes:**
- File: `specs/m3-skills-integration-verification-report.md`
- Lines to fix:
  - Line 727: "Security 角色正确插入: 在 Reviewer 后"
  - Line 735: Flow diagram
  - Line 742: security findings → reviewer input (already correct)

---

## Phase 5: Create 002b Completion Report

### T-010: Create completion-report.md

**Status:** Completed
**Priority:** High
**Assigned To:** docs
**Estimated Effort:** 15 minutes
**Dependencies:** T-008, T-009

**Description:**
Create the completion report for 002b-governance-repair.

**Acceptance Criteria:**
- [x] Background section explains why repair was needed
- [x] Problems list from spec
- [x] Fixes applied enumerated
- [x] Verification results (ACs satisfied)
- [x] Impact on 003 (none, not created)
- [x] Explicit statement: 003-architect-core not created

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
- [x] T-001: spec.md created
- [x] T-002: plan.md created
- [x] T-003: tasks.md created
- [x] T-004: 002 completion report updated
- [x] T-005: README.md fixed
- [x] T-006: AGENTS.md fixed
- [x] T-007: package-spec.md fixed
- [x] T-008: role-definition.md verified
- [x] T-009: m3 report fixed
- [x] T-010: 002b completion report created

**Overall Success:**
- AC-001 through AC-008 satisfied
- 003-architect-core NOT created
- All governance documents consistent
