# Task Checklist: Issue Status Sync Skill

## Task Overview

| Phase | Task Count | Status |
|-------|------------|--------|
| Phase 1: Skill Core | 7 | ✅ Complete |
| Phase 2: Contract Definition | 3 | ✅ Complete |
| Phase 3: Role Integration | 3 | ✅ Complete |
| Phase 4: Supporting Materials | 4 | ✅ Complete |
| Phase 5: Validation | 4 | ✅ Complete |
| **Total** | **21** | **100% Complete** |

---

## Phase 1: Skill Core (P0)

### T-001: Create SKILL.md skeleton
- **Priority**: P0 (Critical)
- **Estimated Time**: 15 min
- **Status**: [ ] Pending
- **Description**: Create the main skill file with standard sections
- **Deliverables**:
  - `.opencode/skills/docs/issue-status-sync/SKILL.md` (skeleton)
- **Acceptance Criteria**:
  - [ ] File exists at correct path
  - [ ] Contains all standard sections (Purpose, When to Use, Implementation Process, Output, Examples, Checklists)
- **Dependencies**: None

### T-002: Define Purpose and When to Use
- **Priority**: P0 (Critical)
- **Estimated Time**: 10 min
- **Status**: [ ] Pending
- **Description**: Write the Purpose section explaining why this skill exists and when to use it
- **Deliverables**:
  - Updated SKILL.md Purpose section
  - Updated SKILL.md "When to Use" section
  - Updated SKILL.md "When Not to Use" section
- **Acceptance Criteria**:
  - [ ] Purpose clearly states the workflow defect being fixed
  - [ ] Trigger conditions explicitly listed
  - [ ] Non-trigger conditions documented
- **Dependencies**: T-001

### T-003: Define Implementation Process
- **Priority**: P0 (Critical)
- **Estimated Time**: 30 min
- **Status**: [ ] Pending
- **Description**: Define the step-by-step process for syncing Issue status
- **Deliverables**:
  - Implementation Process section with phases:
    - Phase 1: Context Gathering
    - Phase 2: Report Generation
    - Phase 3: Comment Posting
    - Phase 4: Verification
- **Acceptance Criteria**:
  - [ ] Each phase has clear steps
  - [ ] Steps reference existing artifacts (RC-003, execution result)
  - [ ] Process explicitly does NOT close Issue
- **Dependencies**: T-002

### T-004: Define Output Requirements (DOC-003)
- **Priority**: P0 (Critical)
- **Estimated Time**: 20 min
- **Status**: [ ] Pending
- **Description**: Define the issue-progress-report output structure
- **Deliverables**:
  - Output Requirements section
  - YAML schema for DOC-003
- **Acceptance Criteria**:
  - [ ] Output matches spec.md DOC-003 definition
  - [ ] All required fields documented
  - [ ] Field descriptions provided
- **Dependencies**: T-003

### T-005: Add Examples
- **Priority**: P0 (Critical)
- **Estimated Time**: 20 min
- **Status**: [ ] Pending
- **Description**: Add positive examples showing correct usage
- **Deliverables**:
  - Example 1: Successful execution with acceptance
  - Example 2: Partial execution needing rework
- **Acceptance Criteria**:
  - [ ] Examples show complete workflow
  - [ ] Issue remains OPEN in both examples
  - [ ] Comment content matches template
- **Dependencies**: T-004
- **Parallel With**: T-006

### T-006: Add Anti-Examples
- **Priority**: P0 (Critical)
- **Estimated Time**: 15 min
- **Status**: [ ] Pending
- **Description**: Document the anti-pattern of premature Issue closure
- **Deliverables**:
  - Anti-Example: Premature Issue closure
  - Explanation of why it's wrong
  - Correct alternative
- **Acceptance Criteria**:
  - [ ] Anti-pattern clearly identified
  - [ ] Business rule violation documented (BR-XXX)
  - [ ] Correct workflow contrasted
- **Dependencies**: T-004
- **Parallel With**: T-005

### T-007: Add Checklists
- **Priority**: P0 (Critical)
- **Estimated Time**: 15 min
- **Status**: [ ] Pending
- **Description**: Add validation checklists for skill execution
- **Deliverables**:
  - Pre-conditions checklist
  - Process checklist
  - Post-conditions checklist
- **Acceptance Criteria**:
  - [ ] Checklists follow docs role pattern
  - [ ] Includes "Issue NOT closed" verification
  - [ ] Includes artifact consumption check (BR-001)
- **Dependencies**: T-005, T-006

---

## Phase 2: Contract Definition (P0)

### T-008: Create issue-progress-report.schema.json
- **Priority**: P0 (Critical)
- **Estimated Time**: 20 min
- **Status**: [ ] Pending
- **Description**: Create JSON Schema for DOC-003 contract
- **Deliverables**:
  - `contracts/pack/schemas/docs/issue-progress-report.schema.json`
- **Acceptance Criteria**:
  - [ ] Schema validates output from T-004
  - [ ] Uses JSON Schema Draft 2020-12
  - [ ] Follows pattern of other docs schemas
- **Dependencies**: T-004

### T-009: Update registry.json with DOC-003 entry
- **Priority**: P0 (Critical)
- **Estimated Time**: 10 min
- **Status**: [ ] Pending
- **Description**: Add DOC-003 to the contract registry
- **Deliverables**:
  - Updated `contracts/pack/registry.json`
- **Acceptance Criteria**:
  - [ ] DOC-003 entry exists
  - [ ] producer_role is "docs"
  - [ ] consumer_roles includes "acceptance", "management"
- **Dependencies**: T-008

### T-010: Validate schema against skill output
- **Priority**: P0 (Critical)
- **Estimated Time**: 15 min
- **Status**: [ ] Pending
- **Description**: Verify the schema validates example outputs
- **Deliverables**:
  - Validation results
  - Sample output file (optional)
- **Acceptance Criteria**:
  - [ ] Example outputs validate against schema
  - [ ] No validation errors
- **Dependencies**: T-008, T-009

---

## Phase 3: Role Integration (P0)

### T-011: Update role-definition.md docs skills list
- **Priority**: P0 (Critical)
- **Estimated Time**: 10 min
- **Status**: [ ] Pending
- **Description**: Add issue-status-sync to docs role skills
- **Deliverables**:
  - Updated `role-definition.md`
- **Acceptance Criteria**:
  - [ ] docs role skills list includes "issue-status-sync"
  - [ ] Skill marked as MVP (not M4)
- **Dependencies**: T-007

### T-012: Update docs role inScope/triggerConditions
- **Priority**: P0 (Critical)
- **Estimated Time**: 10 min
- **Status**: [ ] Pending
- **Description**: Add Issue sync responsibilities to docs role
- **Deliverables**:
  - Updated docs role inScope
  - Updated docs role triggerConditions
- **Acceptance Criteria**:
  - [ ] inScope includes "Issue status sync"
  - [ ] triggerConditions includes "GitHub Issue driven task completion"
- **Dependencies**: T-011

### T-013: Update README.md skills count
- **Priority**: P1 (High)
- **Estimated Time**: 10 min
- **Status**: [ ] Pending
- **Description**: Update README to reflect new docs skill
- **Deliverables**:
  - Updated `README.md`
- **Acceptance Criteria**:
  - [ ] Docs skills count: 2 MVP → 3 MVP
  - [ ] Total skills count: 37 → 38
  - [ ] Feature table includes 028-issue-status-sync
- **Dependencies**: T-012

---

## Phase 4: Supporting Materials (P1)

### T-014: Create validation-checklist.md
- **Priority**: P1 (High)
- **Estimated Time**: 15 min
- **Status**: [ ] Pending
- **Description**: Create detailed validation checklist for skill output
- **Deliverables**:
  - `.opencode/skills/docs/issue-status-sync/checklists/validation-checklist.md`
- **Acceptance Criteria**:
  - [ ] Checklist follows docs role pattern
  - [ ] Includes all BR rules
  - [ ] Includes Issue-specific checks
- **Dependencies**: T-007

### T-015: Create example-001-successful-execution.md
- **Priority**: P1 (High)
- **Estimated Time**: 20 min
- **Status**: [ ] Pending
- **Description**: Create detailed example of successful execution
- **Deliverables**:
  - `.opencode/skills/docs/issue-status-sync/examples/example-001-successful-execution.md`
- **Acceptance Criteria**:
  - [ ] Shows complete workflow from Issue creation to comment
  - [ ] Issue remains OPEN at end
  - [ ] All artifact references documented
- **Dependencies**: T-007
- **Parallel With**: T-016, T-017

### T-016: Create example-002-partial-execution.md
- **Priority**: P1 (High)
- **Estimated Time**: 15 min
- **Status**: [ ] Pending
- **Description**: Create example of partial execution needing rework
- **Deliverables**:
  - `.opencode/skills/docs/issue-status-sync/examples/example-002-partial-execution.md`
- **Acceptance Criteria**:
  - [ ] Shows partial execution scenario
  - [ ] Issue remains OPEN
  - [ ] Comment indicates rework needed
- **Dependencies**: T-007
- **Parallel With**: T-015, T-017

### T-017: Create anti-example-001-premature-closure.md
- **Priority**: P1 (High)
- **Estimated Time**: 15 min
- **Status**: [ ] Pending
- **Description**: Document the anti-pattern of premature Issue closure
- **Deliverables**:
  - `.opencode/skills/docs/issue-status-sync/anti-examples/anti-example-001-premature-closure.md`
- **Acceptance Criteria**:
  - [ ] Shows wrong behavior (closing Issue prematurely)
  - [ ] Explains why it's wrong
  - [ ] Shows correct alternative
- **Dependencies**: T-007
- **Parallel With**: T-015, T-016

---

## Phase 5: Validation (P1)

### T-018: Verify SKILL.md follows docs template
- **Priority**: P1 (High)
- **Estimated Time**: 10 min
- **Status**: [ ] Pending
- **Description**: Validate skill structure against docs role template
- **Deliverables**:
  - Template compliance report
- **Acceptance Criteria**:
  - [ ] All required sections present
  - [ ] Section order matches template
  - [ ] Follows 007-docs-core patterns
- **Dependencies**: T-007, T-014
- **Parallel With**: T-019, T-020

### T-019: Verify skill does NOT close Issue
- **Priority**: P1 (High)
- **Estimated Time**: 10 min
- **Status**: [ ] Pending
- **Description**: Code review to ensure no Issue closure logic
- **Deliverables**:
  - Code review notes
- **Acceptance Criteria**:
  - [ ] No `state: 'closed'` in skill
  - [ ] No `closeIssue` function calls
  - [ ] Process explicitly states "do not close"
- **Dependencies**: T-007
- **Parallel With**: T-018, T-020

### T-020: Verify DOC-003 schema validation
- **Priority**: P1 (High)
- **Estimated Time**: 10 min
- **Status**: [ ] Pending
- **Description**: Run schema validation on example outputs
- **Deliverables**:
  - Schema validation results
- **Acceptance Criteria**:
  - [ ] All examples validate
  - [ ] No validation errors
- **Dependencies**: T-010
- **Parallel With**: T-018, T-019

### T-021: Create completion-report.md
- **Priority**: P0 (Critical)
- **Estimated Time**: 20 min
- **Status**: [ ] Pending
- **Description**: Create completion report documenting all deliverables
- **Deliverables**:
  - `specs/028-issue-status-sync/completion-report.md`
- **Acceptance Criteria**:
  - [ ] All tasks documented
  - [ ] All deliverables listed
  - [ ] Acceptance criteria verification
  - [ ] Known gaps documented (if any)
- **Dependencies**: T-018, T-019, T-020

---

## Acceptance Criteria Summary

| ID | Criterion | Task | Validation |
|----|-----------|------|------------|
| AC-001 | SKILL.md exists | T-001 | File check |
| AC-002 | Follows docs template | T-018 | Template compliance |
| AC-003 | DOC-003 in registry | T-009 | Registry check |
| AC-004 | Output matches schema | T-010, T-020 | Schema validation |
| AC-005 | Does NOT close Issue | T-003, T-019 | Code review |
| AC-006 | Examples show correct workflow | T-015, T-016 | Example review |
| AC-007 | Anti-example documents wrong pattern | T-017 | Anti-example check |
| AC-008 | role-definition.md updated | T-011, T-012 | File check |
| AC-009 | Validation checklist exists | T-014 | File check |
| AC-010 | README.md updated | T-013 | File check |

---

## Notes

### Execution Order
- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phase 3
- Phase 3 must complete before Phase 4
- Phase 4 must complete before Phase 5

### Parallel Execution
- Within Phase 1: T-005, T-006 can run in parallel
- Within Phase 4: T-015, T-016, T-017 can run in parallel
- Within Phase 5: T-018, T-019, T-020 can run in parallel

### Risk Notes
- T-003 is most complex (process definition)
- T-010 is critical for contract compliance
- T-019 must catch any closure logic