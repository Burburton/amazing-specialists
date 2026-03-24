# 004-developer-core Tasks

## Document Status
- **Feature ID**: `004-developer-core`
- **Version**: 1.0.0
- **Status**: In Progress
- **Created**: 2026-03-24
- **Based On**: `specs/004-developer-core/plan.md` v1.0.0

---

## Phase 1: Role Scope Finalization

### Task 1.1: Developer Role Boundary Confirmation
- **Status**: ✅ DONE
- **Owner**: developer
- **Input**: role-definition.md, package-spec.md
- **Output**: role-scope.md
- **Acceptance Criteria**:
  - [x] Mission clearly defined
  - [x] In Scope / Out of Scope documented
  - [x] Trigger conditions specified
  - [x] No conflicts with role-definition.md

### Task 1.2: Upstream Interface Definition
- **Status**: ✅ DONE
- **Owner**: developer
- **Input**: specs/003-architect-core/downstream-interfaces.md
- **Output**: role-scope.md Section 6
- **Acceptance Criteria**:
  - [x] Design consumption contract defined
  - [x] Design conflict handling documented
  - [x] Escalation path for design issues

### Task 1.3: Downstream Interface Definition
- **Status**: ✅ DONE
- **Owner**: developer
- **Input**: role-definition.md, io-contract.md
- **Output**: downstream-interfaces.md
- **Acceptance Criteria**:
  - [x] tester interface defined
  - [x] reviewer interface defined
  - [x] docs interface defined
  - [x] Quality gates per interface specified

---

## Phase 2: Skill Formalization

### Task 2.1: feature-implementation Formalization
- **Status**: ✅ DONE (baseline exists, enhancement pending)
- **Owner**: developer
- **Input**: Existing .opencode/skills/developer/feature-implementation/SKILL.md
- **Output**: Enhanced skill with contract alignment
- **Acceptance Criteria**:
  - [x] SKILL.md reviewed and verified
  - [ ] examples/ added (2+ required)
  - [ ] anti-examples/ added (2+ required)
  - [ ] checklists/ added
  - [x] Contract alignment verified

### Task 2.2: bugfix-workflow Formalization
- **Status**: ✅ DONE (baseline exists, enhancement pending)
- **Owner**: developer
- **Input**: Existing .opencode/skills/developer/bugfix-workflow/SKILL.md
- **Output**: Enhanced skill with contract alignment
- **Acceptance Criteria**:
  - [x] SKILL.md reviewed and verified
  - [ ] examples/ added (2+ required)
  - [ ] anti-examples/ added (2+ required)
  - [ ] checklists/ added
  - [x] Contract alignment verified

### Task 2.3: code-change-selfcheck Formalization
- **Status**: ✅ DONE (baseline exists, enhancement pending)
- **Owner**: developer
- **Input**: Existing .opencode/skills/developer/code-change-selfcheck/SKILL.md
- **Output**: Enhanced skill with contract alignment
- **Acceptance Criteria**:
  - [x] SKILL.md reviewed and verified
  - [ ] examples/ added (2+ required)
  - [ ] anti-examples/ added (2+ required)
  - [ ] checklists/ added
  - [x] Contract alignment verified

---

## Phase 3: Artifact Contract Establishment

### Task 3.1: implementation-summary Contract
- **Status**: ✅ DONE
- **Owner**: developer
- **Output**: contracts/implementation-summary-contract.md
- **Acceptance Criteria**:
  - [x] Schema defined with all required fields
  - [x] Validation rules documented
  - [x] Consumer responsibilities specified
  - [x] Examples provided

### Task 3.2: self-check-report Contract
- **Status**: ✅ DONE
- **Owner**: developer
- **Output**: contracts/self-check-report-contract.md
- **Acceptance Criteria**:
  - [x] Schema defined with all required fields
  - [x] 10 check categories defined
  - [x] Validation rules documented
  - [x] Examples provided

### Task 3.3: bugfix-report Contract
- **Status**: ✅ DONE
- **Owner**: developer
- **Output**: contracts/bugfix-report-contract.md
- **Acceptance Criteria**:
  - [x] Schema defined with all required fields
  - [x] Root cause categories defined
  - [x] Validation rules documented
  - [x] Examples provided

---

## Phase 4: Validation & Quality Layer

### Task 4.1: Upstream-consumability Checklist
- **Status**: ⏳ PENDING
- **Owner**: developer
- **Output**: validation/upstream-consumability-checklist.md
- **Acceptance Criteria**:
  - [ ] design-note reading checks
  - [ ] module-boundaries parsing checks
  - [ ] constraint identification checks
  - [ ] open-questions handling checks

### Task 4.2: Downstream-consumability Checklist
- **Status**: ⏳ PENDING
- **Owner**: developer
- **Output**: validation/downstream-consumability-checklist.md
- **Acceptance Criteria**:
  - [ ] tester consumption checks
  - [ ] reviewer consumption checks
  - [ ] docs consumption checks

### Task 4.3: Failure-mode Checklist
- **Status**: ⏳ PENDING
- **Owner**: developer
- **Output**: validation/failure-mode-checklist.md
- **Acceptance Criteria**:
  - [ ] 7 anti-patterns detection methods
  - [ ] Early warning signals
  - [ ] Recovery strategies

### Task 4.4: Anti-pattern Guidance
- **Status**: ✅ DONE
- **Owner**: developer
- **Output**: validation/anti-pattern-guidance.md
- **Acceptance Criteria**:
  - [x] AP-001 through AP-007 defined
  - [x] Detection methods documented
  - [x] Prevention strategies provided
  - [x] Remediation approaches specified

---

## Phase 5: Educational & Example Layer

### Task 5.1: Examples for Each Skill
- **Status**: ⏳ PENDING
- **Owner**: developer
- **Output**: 
  - `.opencode/skills/developer/feature-implementation/examples/`
  - `.opencode/skills/developer/bugfix-workflow/examples/`
  - `.opencode/skills/developer/code-change-selfcheck/examples/`
- **Acceptance Criteria**:
  - [ ] 2+ examples per skill
  - [ ] Examples follow templates
  - [ ] Examples demonstrate correct patterns

### Task 5.2: Anti-examples for Each Skill
- **Status**: ⏳ PENDING
- **Owner**: developer
- **Output**:
  - `.opencode/skills/developer/feature-implementation/anti-examples/`
  - `.opencode/skills/developer/bugfix-workflow/anti-examples/`
  - `.opencode/skills/developer/code-change-selfcheck/anti-examples/`
- **Acceptance Criteria**:
  - [ ] 2+ anti-examples per skill
  - [ ] Anti-examples demonstrate common mistakes
  - [ ] Links to anti-pattern guidance

### Task 5.3: Templates/Checklists for Each Skill
- **Status**: ⏳ PENDING
- **Owner**: developer
- **Output**:
  - `.opencode/skills/developer/feature-implementation/checklists/`
  - `.opencode/skills/developer/bugfix-workflow/checklists/`
  - `.opencode/skills/developer/code-change-selfcheck/checklists/`
- **Acceptance Criteria**:
  - [ ] Standalone checklist file per skill
  - [ ] Checklists reference contracts
  - [ ] Checklists executable

---

## Phase 6: Workflow & Package Integration

### Task 6.1: Role-scope.md Documentation
- **Status**: ✅ DONE
- **Owner**: developer
- **Output**: specs/004-developer-core/role-scope.md
- **Acceptance Criteria**:
  - [x] Complete role scope with all sections
  - [x] Upstream/downstream interfaces documented
  - [x] Legacy compatibility note

### Task 6.2: Package Governance Updates Check
- **Status**: ⏳ PENDING
- **Owner**: developer
- **Output**: Governance sync verification
- **Acceptance Criteria**:
  - [ ] README.md updated with feature status
  - [ ] package-spec.md verified
  - [ ] quality-gate.md verified

### Task 6.3: Feature Completion Preparation
- **Status**: ⏳ PENDING
- **Owner**: developer
- **Output**: completion-report.md
- **Acceptance Criteria**:
  - [ ] Delivered content documented
  - [ ] Known gaps disclosed
  - [ ] Input value for 005-008 defined

---

## Phase 7: Consistency Review

### Task 7.1: Governance Document Sync
- **Status**: ⏳ PENDING
- **Owner**: developer
- **Acceptance Criteria**:
  - [ ] README.md consistent with feature status
  - [ ] role-definition.md consistent
  - [ ] package-spec.md consistent

### Task 7.2: Cross-document Consistency Check
- **Status**: ⏳ PENDING
- **Owner**: developer
- **Acceptance Criteria**:
  - [ ] Terminology consistent across documents
  - [ ] 6-role semantics maintained
  - [ ] No conflicts between spec/plan/tasks

### Task 7.3: Final Acceptance Validation
- **Status**: ⏳ PENDING
- **Owner**: developer + reviewer
- **Acceptance Criteria**:
  - [ ] AC-001 through AC-011 validated
  - [ ] All blockers resolved
  - [ ] Spec-audit passed

---

## Task Summary

| Phase | Total | Done | Pending | Blocked |
|-------|-------|------|---------|---------|
| Phase 1 | 3 | 3 | 0 | 0 |
| Phase 2 | 3 | 3 | 0 | 0 |
| Phase 3 | 3 | 3 | 0 | 0 |
| Phase 4 | 4 | 1 | 3 | 0 |
| Phase 5 | 3 | 0 | 3 | 0 |
| Phase 6 | 3 | 1 | 2 | 0 |
| Phase 7 | 3 | 0 | 3 | 0 |
| **Total** | **22** | **11** | **11** | **0** |

---

## Known Gaps

| Gap ID | Description | AC Impact | Priority |
|--------|-------------|-----------|----------|
| GAP-001 | Missing validation checklists (3 files) | AC-004 | Medium |
| GAP-002 | Missing skill examples (3 skills) | AC-003 | Medium |
| GAP-003 | Missing skill anti-examples (3 skills) | AC-003 | Medium |
| GAP-004 | Missing skill checklists (3 skills) | AC-003 | Medium |
| GAP-005 | README.md status sync pending | AC-007 | High |
| GAP-006 | completion-report.md pending | AC-009 | High |

---

## References

- `specs/004-developer-core/spec.md` - Feature specification
- `specs/004-developer-core/plan.md` - Implementation plan
- `specs/004-developer-core/role-scope.md` - Role scope
- `specs/004-developer-core/downstream-interfaces.md` - Downstream interfaces