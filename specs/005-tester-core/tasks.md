# 005-tester-core Implementation Tasks

## Document Status
- **Feature ID**: `005-tester-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-25
- **Based On**: `specs/005-tester-core/plan.md` v1.0.0

---

## Task Overview

This document breaks down the 005-tester-core implementation into small, executable, reviewable tasks organized into 4 phases.

**Total Tasks**: 28
**Estimated Duration**: 7 days
**Parallel-Safe Tasks**: Marked with `[P]`

---

## Phase 1: Setup / Prerequisites

*Focus: Define tester role boundaries, upstream/downstream interfaces, and governance alignment*

### Task 1.1: Define Tester Role Scope
- **Task ID**: T1.1
- **Title**: Create role-scope.md with tester boundaries
- **Purpose**: Formalize tester responsibilities, in-scope/out-of-scope boundaries, and escalation rules aligned with role-definition.md Section 3
- **Related Requirements**: BR-008, BR-009, AC-002
- **Files to Modify**:
  - `specs/005-tester-core/role-scope.md` (new)
- **Expected Outputs**:
  - Complete role-scope.md with:
    - Mission statement
    - In-scope / out-of-scope boundaries
    - Trigger conditions
    - Required/optional inputs
    - Expected outputs
    - Escalation rules
    - Dependencies on other roles
- **Dependency / Ordering Notes**: None (can start immediately)
- **Acceptance Checks**:
  - [x] No conflicts with role-definition.md Section 3
  - [x] Upstream (developer) and downstream (reviewer) roles can understand boundaries
  - [x] Explicit prohibition on business logic mutation by tester
  - [x] 6-role terminology used consistently (no legacy 3-skill terms)
  
- **Status**: ✅ COMPLETED (2026-03-25)

### Task 1.2: Define Upstream Interface from Developer [P]
- **Task ID**: T1.2
- **Title**: Create upstream-consumption.md for developer artifacts
- **Purpose**: Define how tester consumes outputs from 004-developer-core (implementation-summary, self-check-report, bugfix-report)
- **Related Requirements**: BR-001, BR-002, AC-005
- **Files to Modify**:
  - `specs/005-tester-core/upstream-consumption.md` (new)
- **Expected Outputs**:
  - Complete upstream-consumption.md with:
    - Field-by-field mapping from developer artifacts to tester inputs
    - Consumption guide for implementation-summary.goal_alignment
    - Consumption guide for implementation-summary.changed_files
    - Consumption guide for implementation-summary.known_issues
    - Consumption guide for implementation-summary.risks
    - Consumption guide for self-check-report (with explicit distinction from independent verification)
    - Consumption guide for bugfix-report.root_cause
- **Dependency / Ordering Notes**: Can parallel with T1.1, T1.3
- **Acceptance Checks**:
  - [ ] All 6 developer artifact fields mapped to tester inputs
  - [ ] Explicit BR-002 compliance (self-check vs independent verification)
  - [ ] Examples of correct consumption provided

### Task 1.3: Define Downstream Interface to Reviewer [P]
- **Task ID**: T1.3
- **Title**: Create downstream-interfaces.md for reviewer/acceptance handoff
- **Purpose**: Define tester handoff to reviewer and acceptance layer with evidence quality requirements
- **Related Requirements**: BR-003, BR-004, AC-006
- **Files to Modify**:
  - `specs/005-tester-core/downstream-interfaces.md` (new)
- **Expected Outputs**:
  - Complete downstream-interfaces.md with:
    - What reviewer receives from tester
    - Evidence quality requirements
    - Failure classification expectations
    - Coverage gap disclosure requirements
    - Consumption guidance for each downstream role
- **Dependency / Ordering Notes**: Can parallel with T1.1, T1.2
- **Acceptance Checks**:
  - [ ] Reviewer consumption path defined
  - [ ] Acceptance layer consumption path defined
  - [ ] Developer feedback loop defined
  - [ ] Clear evidence quality standards specified

---

## Phase 2: Core Implementation

*Focus: Formalize 3 core skills and establish 3 artifact contracts*

### Task 2.1: Formalize unit-test-design Skill [P]
- **Task ID**: T2.1
- **Title**: Enhance unit-test-design SKILL.md with complete guidance
- **Purpose**: Transform existing unit-test-design skill into formal first-class skill with explicit role boundaries and upstream integration
- **Related Requirements**: SKILL-001, BR-002, BR-004
- **Files to Modify**:
  - `.opencode/skills/tester/unit-test-design/SKILL.md` (enhance)
- **Expected Outputs**:
  - Enhanced SKILL.md with:
    - Explicit BR-002 compliance section (distinguish from developer self-check)
    - BR-004 integration (failure classification in test output)
    - Examples showing consumption of implementation-summary
    - Step-by-step test design workflow
    - Input/output specifications
    - Role boundary clarifications
- **Dependency / Ordering Notes**: Depends on T1.1, T1.2 (role boundaries and upstream interface defined)
- **Acceptance Checks**:
  - [x] BR-002 explicitly addressed
  - [x] Upstream consumption from developer artifacts documented
  - [x] Role boundaries clear
  - [x] Workflow steps executable
  - [x] At least 2 examples created
  - [x] At least 2 anti-examples created
  - [x] At least 1 checklist created
- **Status**: ✅ COMPLETED (2026-03-25)

### Task 2.2: Formalize regression-analysis Skill [P]
- **Task ID**: T2.2
- **Title**: Enhance regression-analysis SKILL.md with complete guidance
- **Purpose**: Transform existing regression-analysis skill into formal first-class skill with BR-006 compliance and upstream integration
- **Related Requirements**: SKILL-002, BR-006
- **Files to Modify**:
  - `.opencode/skills/tester/regression-analysis/SKILL.md` (enhance)
- **Expected Outputs**:
  - Enhanced SKILL.md with:
    - BR-006 compliance (regression thinking as mandatory)
    - Explicit handling of developer-identified risks
    - Integration with bugfix-report for root-cause-aware testing
    - Step-by-step regression analysis workflow
    - Risk surface identification methodology
- **Dependency / Ordering Notes**: Depends on T1.1, T1.2
- **Acceptance Checks**:
  - [x] BR-006 explicitly addressed
  - [x] Root-cause-aware testing workflow documented
  - [x] Risk prioritization methodology clear
  - [x] Adjacent impact assessment guidance present
  - [x] At least 2 examples created
  - [x] At least 2 anti-examples created
  - [x] At least 1 checklist created
- **Status**: ✅ COMPLETED (2026-03-25)

### Task 2.3: Formalize edge-case-matrix Skill [P]
- **Task ID**: T2.3
- **Title**: Enhance edge-case-matrix SKILL.md with complete guidance
- **Purpose**: Transform existing edge-case-matrix skill into formal first-class skill with BR-005 compliance
- **Related Requirements**: SKILL-003, BR-005
- **Files to Modify**:
  - `.opencode/skills/tester/edge-case-matrix/SKILL.md` (enhance)
- **Expected Outputs**:
  - Enhanced SKILL.md with:
    - BR-005 compliance (edge cases mandatory, not optional)
    - Happy-path-only anti-pattern detection guidance
    - Integration with unit-test-design workflow
    - Boundary condition identification methodology
    - Parameter-by-parameter boundary analysis
- **Dependency / Ordering Notes**: Depends on T1.1, T1.2
- **Acceptance Checks**:
  - [x] BR-005 explicitly addressed
  - [x] Happy-path-only detection guidance present
  - [x] Boundary analysis methodology clear
  - [x] Integration with unit-test-design documented
  - [x] At least 2 examples created
  - [x] At least 2 anti-examples created
  - [x] At least 1 checklist created
- **Status**: ✅ COMPLETED (2026-03-25)

### Task 2.4: Create test-scope-report Contract [P]
- **Task ID**: T2.4
- **Title**: Define test-scope-report artifact contract
- **Purpose**: Establish complete schema for test-scope-report with all 10 required fields per AC-001
- **Related Requirements**: AC-001, BR-003
- **Files to Modify**:
  - `specs/005-tester-core/contracts/test-scope-report-contract.md` (new)
- **Expected Outputs**:
  - Complete contract document with:
    - All 10 required fields defined (input_artifacts, goal_under_test, changed_surface, risk_priorities, test_strategy, in_scope_items, out_of_scope_items, assumptions, environment_requirements, recommendation)
    - Field validation rules
    - Upstream artifact references
    - Example valid instances
    - Consumer guidance
- **Dependency / Ordering Notes**: Depends on T2.1, T2.2, T2.3 (skill formalization informs contract needs)
- **Acceptance Checks**:
  - [x] All 10 fields from AC-001 present
  - [x] Upstream references to developer artifacts clear
  - [x] Example instances valid
  - [x] Consumer guidance for reviewer/acceptance present
- **Status**: ✅ COMPLETED (2026-03-26)

### Task 2.5: Create verification-report Contract [P]
- **Task ID**: T2.5
- **Title**: Define verification-report artifact contract
- **Purpose**: Establish complete schema for verification-report with all 12 required fields per AC-002
- **Related Requirements**: AC-002, BR-004, BR-007
- **Files to Modify**:
  - `specs/005-tester-core/contracts/verification-report-contract.md` (new)
- **Expected Outputs**:
  - Complete contract document with:
    - All 12 required fields defined
    - Failure classification model (Implementation/Test/Environment/Design/Dependency)
    - Evidence format specifications
    - Confidence level definitions (FULL/PARTIAL/LOW)
    - Recommendation vocabulary (PASS_TO_REVIEW/REWORK/RETEST/ESCALATE)
- **Dependency / Ordering Notes**: Depends on T2.1, T2.3 (unit-test-design and edge-case-matrix inform verification)
- **Acceptance Checks**:
  - [x] All 12 fields from AC-002 present
  - [x] BR-004 failure classification model defined
  - [x] BR-007 honest confidence reporting enabled
  - [x] Evidence format flexible but structured
- **Status**: ✅ COMPLETED (2026-03-26)

### Task 2.6: Create regression-risk-report Contract [P]
- **Task ID**: T2.6
- **Title**: Define regression-risk-report artifact contract
- **Purpose**: Establish complete schema for regression-risk-report with all 8 required fields per AC-003
- **Related Requirements**: AC-003, BR-006
- **Files to Modify**:
  - `specs/005-tester-core/contracts/regression-risk-report-contract.md` (new)
- **Expected Outputs**:
  - Complete contract document with:
    - All 8 required fields defined
    - Risk ranking methodology
    - Recommendation vocabulary (ACCEPT_RISK/REWORK/ESCALATE)
    - Follow-up action specifications
- **Dependency / Ordering Notes**: Depends on T2.2 (regression-analysis skill)
- **Acceptance Checks**:
  - [x] All 8 fields from AC-003 present
  - [x] Risk ranking methodology clear
  - [x] Regression surfaces identification guidance present
  - [x] Untested areas documentation enabled
- **Status**: ✅ COMPLETED (2026-03-26)

---

## Phase 3: Integration / Edge Cases

*Focus: Validation layer, quality gates, educational materials, examples, and anti-examples*

### Task 3.1: Create Upstream-Consumability Checklist
- **Task ID**: T3.1
- **Title**: Build upstream-consumability-checklist.md
- **Purpose**: Ensure tester correctly consumes developer outputs with systematic verification
- **Related Requirements**: AC-005, BR-001, BR-002
- **Files to Modify**:
  - `specs/005-tester-core/validation/upstream-consumability-checklist.md` (new)
- **Expected Outputs**:
  - Complete checklist with:
    - implementation-summary.goal_alignment consumption check
    - changed_files mapped to test surface check
    - known_issues acknowledged check
    - risks prioritized check
    - self-check-report distinguished check
    - bugfix-report.root_cause usage check
- **Dependency / Ordering Notes**: Depends on T1.2, T2.4 (upstream interface and test-scope contract)
- **Acceptance Checks**:
  - [ ] All 6 upstream artifact fields have check items
  - [ ] Checklist executable by tester
  - [ ] BR-002 distinction verifiable

### Task 3.2: Create Downstream-Consumability Checklist
- **Task ID**: T3.2
- **Title**: Build downstream-consumability-checklist.md
- **Purpose**: Ensure outputs can be consumed by reviewer, acceptance, and developer
- **Related Requirements**: AC-006
- **Files to Modify**:
  - `specs/005-tester-core/validation/downstream-consumability-checklist.md` (new)
- **Expected Outputs**:
  - Complete checklist with consumption paths for:
    - Reviewer: quality judgment from verification-report
    - Acceptance: pass/fail/gap assessment
    - Developer: actionable failures from classification
- **Dependency / Ordering Notes**: Depends on T1.3, T2.5, T2.6 (downstream interface and artifact contracts)
- **Acceptance Checks**:
  - [ ] Reviewer consumption path verified
  - [ ] Acceptance consumption path verified
  - [ ] Developer feedback loop verified
  - [ ] Evidence quality verifiable

### Task 3.3: Create Failure-Mode Checklist
- **Task ID**: T3.3
- **Title**: Build failure-mode-checklist.md with 10 anti-patterns
- **Purpose**: Document common tester failure patterns with detection and remediation strategies
- **Related Requirements**: AC-008, spec.md Section 11
- **Files to Modify**:
  - `specs/005-tester-core/validation/failure-mode-checklist.md` (new)
- **Expected Outputs**:
  - Complete checklist covering all 10 patterns:
    1. Happy-path-only verification
    2. Evidence-free pass claim
    3. Self-check confusion
    4. Unclassified failures
    5. No coverage gap disclosure
    6. No regression thinking
    7. Spec ambiguity hidden
    8. Business logic mutation by tester
    9. Environment block misreported
    10. False completeness language
  - Each pattern includes: detection method, early warning signals, remediation, prevention
- **Dependency / Ordering Notes**: Depends on T2.1, T2.2, T2.3 (skills define failure modes)
- **Acceptance Checks**:
  - [ ] All 10 patterns from spec.md Section 11 covered
  - [ ] Each pattern has detection method
  - [ ] Each pattern has remediation strategy
  - [ ] Each pattern has prevention measure

### Task 3.4: Create Anti-Pattern Guidance Document
- **Task ID**: T3.4
- **Title**: Build anti-pattern-guidance.md with detailed remediation
- **Purpose**: Provide comprehensive anti-pattern documentation with real-world examples and actionable guidance
- **Related Requirements**: AC-009
- **Files to Modify**:
  - `specs/005-tester-core/validation/anti-pattern-guidance.md` (new)
- **Expected Outputs**:
  - Complete guidance document with:
    - Definition of each anti-pattern
    - Real-world examples (sanitized)
    - Detection methods
    - Prevention strategies
    - Remediation steps
- **Dependency / Ordering Notes**: Depends on T3.3 (failure-mode checklist)
- **Acceptance Checks**:
  - [ ] Guidance actionable by tester role
  - [ ] Examples realistic and educational
  - [ ] Prevention strategies practical
  - [ ] Remediation steps clear

### Task 3.5: Create Examples for unit-test-design [P]
- **Task ID**: T3.5
- **Title**: Build 2+ formal examples for unit-test-design skill
- **Purpose**: Demonstrate correct role behavior with realistic scenarios and complete workflows
- **Related Requirements**: AC-007
- **Files to Modify**:
  - `.opencode/skills/tester/unit-test-design/examples/example-001-auth-service-test-design.md` (new)
  - `.opencode/skills/tester/unit-test-design/examples/example-002-api-validation-test-design.md` (new)
- **Expected Outputs**:
  - 2 complete examples with:
    - Realistic scenario description
    - Complete input context (simulated developer outputs)
    - Step-by-step skill application
    - Complete output artifacts
    - Key decision notes
- **Dependency / Ordering Notes**: Depends on T2.1 (skill formalization)
- **Acceptance Checks**:
  - [ ] At least 2 examples present
  - [ ] Examples demonstrate correct role behavior
  - [ ] Input context complete
  - [ ] Output artifacts match contracts

### Task 3.6: Create Examples for regression-analysis [P]
- **Task ID**: T3.6
- **Title**: Build 2+ formal examples for regression-analysis skill
- **Purpose**: Demonstrate regression analysis with realistic scenarios
- **Related Requirements**: AC-007
- **Files to Modify**:
  - `.opencode/skills/tester/regression-analysis/examples/example-001-login-lockout-regression.md` (new)
  - `.opencode/skills/tester/regression-analysis/examples/example-002-refactoring-regression.md` (new)
- **Expected Outputs**:
  - 2 complete examples with realistic scenarios, input context, step-by-step analysis, output artifacts
- **Dependency / Ordering Notes**: Depends on T2.2 (skill formalization)
- **Acceptance Checks**:
  - [ ] At least 2 examples present
  - [ ] Regression surfaces identified
  - [ ] Risk ranking demonstrated
  - [ ] Recommendations clear

### Task 3.7: Create Examples for edge-case-matrix [P]
- **Task ID**: T3.7
- **Title**: Build 2+ formal examples for edge-case-matrix skill
- **Purpose**: Demonstrate boundary condition analysis with realistic scenarios
- **Related Requirements**: AC-007
- **Files to Modify**:
  - `.opencode/skills/tester/edge-case-matrix/examples/example-001-user-input-boundaries.md` (new)
  - `.opencode/skills/tester/edge-case-matrix/examples/example-002-payment-calculation-edges.md` (new)
- **Expected Outputs**:
  - 2 complete examples with realistic scenarios, input context, boundary analysis, output matrices
- **Dependency / Ordering Notes**: Depends on T2.3 (skill formalization)
- **Acceptance Checks**:
  - [ ] At least 2 examples present
  - [ ] Boundary conditions comprehensive
  - [ ] Happy-path explicitly included
  - [ ] Edge cases prioritized

### Task 3.8: Create Anti-Examples for All Skills
- **Task ID**: T3.8
- **Title**: Build 2+ anti-examples for each of the 3 skills
- **Purpose**: Demonstrate common mistakes and how to detect/avoid them
- **Related Requirements**: AC-007
- **Files to Modify**:
  - `.opencode/skills/tester/unit-test-design/anti-examples/` (2 files)
  - `.opencode/skills/tester/regression-analysis/anti-examples/` (2 files)
  - `.opencode/skills/tester/edge-case-matrix/anti-examples/` (2 files)
- **Expected Outputs**:
  - 6 anti-example documents total (2 per skill):
    - unit-test-design: happy-path-only, uncoupled-tests
    - regression-analysis: impact-underestimation, no-historical-context
    - edge-case-matrix: boundary-omission, false-confidence
  - Each includes: what went wrong, why it's a problem, how to detect, how to fix
- **Dependency / Ordering Notes**: Depends on T3.5, T3.6, T3.7 (examples created first)
- **Acceptance Checks**:
  - [ ] At least 2 anti-examples per skill (6 total)
  - [ ] Anti-examples clearly illustrate failure modes
  - [ ] Detection methods practical
  - [ ] Remediation steps actionable

### Task 3.9: Create Reusable Templates/Checklists for All Skills [P]
- **Task ID**: T3.9
- **Title**: Build reusable templates for each of the 3 skills
- **Purpose**: Provide ready-to-use templates that work across features without modification
- **Related Requirements**: AC-007
- **Files to Modify**:
  - `.opencode/skills/tester/unit-test-design/checklists/test-design-checklist.md` (new)
  - `.opencode/skills/tester/regression-analysis/checklists/regression-analysis-checklist.md` (new)
  - `.opencode/skills/tester/edge-case-matrix/checklists/edge-case-matrix-checklist.md` (new)
- **Expected Outputs**:
  - 3 reusable checklist/template documents:
    - Test design workflow checklist
    - Regression analysis workflow checklist
    - Edge case matrix workflow checklist
- **Dependency / Ordering Notes**: Depends on T2.1, T2.2, T2.3 (skills define workflows)
- **Acceptance Checks**:
  - [ ] 3 checklist documents created
  - [ ] Templates usable without modification across features
  - [ ] Checklists executable step-by-step
  - [ ] Integration with artifact contracts clear

---

## Phase 4: Validation / Cleanup

*Focus: Workflow integration, governance sync, final consistency review, and completion*

### Task 4.1: Create Feature Examples Directory
- **Task ID**: T4.1
- **Title**: Build feature-level examples in specs/005-tester-core/examples/
- **Purpose**: Provide end-to-end examples showing complete tester workflows
- **Related Requirements**: spec.md Section 9.1
- **Files to Modify**:
  - `specs/005-tester-core/examples/feature-verification-example.md` (new)
  - `specs/005-tester-core/examples/bugfix-verification-example.md` (new)
  - `specs/005-tester-core/examples/blocked-test-example.md` (new)
- **Expected Outputs**:
  - 3 end-to-end examples:
    - Feature verification workflow (Workflow 1 from spec.md)
    - Bugfix verification workflow (Workflow 2 from spec.md)
    - Ambiguity escalation workflow (Workflow 3 from spec.md)
- **Dependency / Ordering Notes**: Depends on T3.5, T3.6, T3.7 (skill examples completed)
- **Acceptance Checks**:
  - [ ] 3 complete workflow examples
  - [ ] Examples show artifact flow
  - [ ] Escalation scenarios covered
  - [ ] Realistic scenarios

### Task 4.2: Perform Package Governance Updates Check
- **Task ID**: T4.2
- **Title**: Check and update README.md and other governance documents
- **Purpose**: Ensure governance documents reflect 005 completion status
- **Related Requirements**: AC-001, spec.md Section 9.3
- **Files to Modify**:
  - `README.md` (update skills inventory, feature status)
  - `package-spec.md` (update skills section if needed)
- **Expected Outputs**:
  - Updated README.md with:
    - Tester skills marked as complete
    - Feature status table updated
    - Workflow section updated
  - Verified package-spec.md alignment
- **Dependency / Ordering Notes**: Depends on all Phase 2 and 3 tasks (core work complete)
- **Acceptance Checks**:
  - [ ] README.md tester skills status updated
  - [ ] Feature status table accurate
  - [ ] No contradictions with role-definition.md
  - [ ] No contradictions with package-spec.md

### Task 4.3: Create Completion Report
- **Task ID**: T4.3
- **Title**: Build completion-report.md with honest status assessment
- **Purpose**: Document completion status, traceability, and any known gaps for future work
- **Related Requirements**: AC-001, spec.md Section 14
- **Files to Modify**:
  - `specs/005-tester-core/completion-report.md` (new)
- **Expected Outputs**:
  - Complete completion-report.md with:
    - Deliverables checklist (all items from plan.md Section 12.3)
    - Traceability matrix to spec requirements
    - Open questions resolved/unresolved status
    - Known gaps documented (future advanced skills)
    - Input value for 006-reviewer-core
    - Honest status reporting
- **Dependency / Ordering Notes**: Depends on all previous tasks
- **Acceptance Checks**:
  - [ ] All AC-001 through AC-011 assessed
  - [ ] Honest gap disclosure (no hidden gaps)
  - [ ] Traceability matrix complete
  - [ ] Status consistent with actual repository state

### Task 4.4: Perform Governance Document Sync
- **Task ID**: T4.4
- **Title**: Verify consistency across all governance documents
- **Purpose**: Ensure no contradictions between governance documents per AGENTS.md Governance Sync Rule
- **Related Requirements**: AGENTS.md Governance Sync Rule
- **Files to Modify**:
  - `AGENTS.md` (if role semantics need update)
  - `quality-gate.md` (if tester gate needs update)
  - `io-contract.md` (if artifact types need update)
- **Expected Outputs**:
  - Verification that:
    - README.md terminology consistent with role-definition.md
    - AGENTS.md constraints consistent with package-spec.md
    - quality-gate.md tester gate aligned with this feature
    - io-contract.md artifact types include tester artifacts
- **Dependency / Ordering Notes**: Depends on T4.2
- **Acceptance Checks**:
  - [ ] No contradictions across governance docs
  - [ ] 6-role vs 3-skill consistency verified
  - [ ] Feature status consistent across docs
  - [ ] Artifact definitions consistent

### Task 4.5: Perform Cross-Document Consistency Check
- **Task ID**: T4.5
- **Title**: Final consistency verification across all 005-tester-core documents
- **Purpose**: Verify no contradictions between spec, plan, tasks, and outputs
- **Related Requirements**: AGENTS.md Audit Hardening Rule
- **Files to Modify**:
  - None (verification only)
- **Expected Outputs**:
  - Consistency report documenting:
    - Spec vs plan alignment
    - Plan vs tasks alignment
    - Tasks vs actual outputs alignment
    - Artifact contracts vs skill documents alignment
- **Dependency / Ordering Notes**: Depends on T4.3, T4.4 (completion report and governance sync done)
- **Acceptance Checks**:
  - [ ] Spec.md requirements all addressed in tasks
  - [ ] Plan.md phases mapped to tasks
  - [ ] No orphaned requirements
  - [ ] Single source of truth for each fact

### Task 4.6: Execute Final Acceptance Validation
- **Task ID**: T4.6
- **Title**: Validate all acceptance criteria with evidence
- **Purpose**: Final validation against spec.md acceptance criteria
- **Related Requirements**: AC-001 through AC-011
- **Files to Modify**:
  - None (validation only, updates completion-report.md if needed)
- **Expected Outputs**:
  - Evidence package for each AC:
    - AC-001: Feature package complete
    - AC-002: Tester role scope formalized
    - AC-003: Core skills formally implemented
    - AC-004: Artifact contracts defined
    - AC-005: Upstream consumption logic clear
    - AC-006: Downstream evidence logic clear
    - AC-007: Skill assets complete
    - AC-008: Failure classification model present
    - AC-009: Anti-pattern guidance present
    - AC-010: Scope boundary maintained
    - AC-011: First-class verification role established
- **Dependency / Ordering Notes**: Depends on all tasks (final validation)
- **Acceptance Checks**:
  - [ ] All 11 AC items satisfied with evidence
  - [ ] Evidence traceable to deliverables
  - [ ] No AC interpretation conflicts
  - [ ] Honest assessment of gaps

---

## Dependency Graph

```
Phase 1:
  T1.1, T1.2, T1.3 → can run in parallel

Phase 2:
  T1.* → T2.1, T2.2, T2.3 (skills)
  T1.* → T2.4, T2.5, T2.6 (contracts)
  T2.1, T2.2, T2.3 can run in parallel
  T2.4, T2.5, T2.6 can run in parallel

Phase 3:
  T1.2 + T2.4 → T3.1 (upstream consumability)
  T1.3 + T2.5 + T2.6 → T3.2 (downstream consumability)
  T2.1, T2.2, T2.3 → T3.3 (failure modes)
  T3.3 → T3.4 (anti-pattern guidance)
  T2.1 → T3.5 (unit-test examples)
  T2.2 → T3.6 (regression examples)
  T2.3 → T3.7 (edge-case examples)
  T3.5, T3.6, T3.7 → T3.8 (anti-examples)
  T2.1, T2.2, T2.3 → T3.9 (templates)

Phase 4:
  T3.5, T3.6, T3.7 → T4.1 (feature examples)
  Phase 2, 3 complete → T4.2 (governance update)
  All previous → T4.3 (completion report)
  T4.2 → T4.4 (governance sync)
  T4.3 + T4.4 → T4.5 (consistency check)
  T4.5 → T4.6 (final validation)
```

---

## Execution Recommendations

### Recommended Execution Sequence

```
Week 1:
├── Day 1: Phase 1 (Role Scope)
│   └── Parallel: T1.1, T1.2, T1.3
├── Day 2-3: Phase 2 (Core Implementation)
│   ├── Parallel: T2.1, T2.2, T2.3
│   └── Parallel: T2.4, T2.5, T2.6
├── Day 4-5: Phase 3 (Validation & Educational)
│   ├── Sequential: T3.1 → T3.2 → T3.3 → T3.4
│   └── Parallel: T3.5, T3.6, T3.7, T3.9
│   └── T3.8 (depends on 3.5-3.7)
└── Day 6-7: Phase 4 (Integration & Completion)
    ├── T4.1, T4.2, T4.3 (sequential)
    ├── T4.4 (governance sync)
    └── T4.5, T4.6 (final validation)
```

### Parallel Execution Groups

**Group A** (Day 1): T1.1, T1.2, T1.3
**Group B** (Day 2-3): T2.1, T2.2, T2.3, T2.4, T2.5, T2.6
**Group C** (Day 4-5): T3.1, T3.2, T3.3, T3.5, T3.6, T3.7, T3.9
**Group D** (Day 4-5, after Group C): T3.4, T3.8
**Group E** (Day 6-7): T4.1, T4.2, T4.3, T4.4, T4.5, T4.6

### Critical Path

```
T1.1/T1.2 → T2.1 → T3.5 → T3.8 → T4.1 → T4.3 → T4.6
      ↓
T2.4 → T3.1
      ↓
T2.5 → T3.2
```

---

## Deliverables Summary

### Core Capability Deliverables (18 tasks)
- 3 role/interface documents (T1.1, T1.2, T1.3)
- 3 enhanced SKILL.md files (T2.1, T2.2, T2.3)
- 3 artifact contracts (T2.4, T2.5, T2.6)
- 4 validation documents (T3.1, T3.2, T3.3, T3.4)

### Educational Assets (4 tasks)
- 6 skill examples (T3.5, T3.6, T3.7)
- 6 anti-examples (T3.8)
- 3 reusable templates (T3.9)
- 3 feature examples (T4.1)

### Governance & Completion (4 tasks)
- README/package-spec updates (T4.2)
- Completion report (T4.3)
- Governance sync (T4.4)
- Consistency check (T4.5)
- Final validation (T4.6)

### Total File Outputs

**New Files**: ~35
**Modified Files**: ~3 (skill enhancements + governance)

---

## Traceability Matrix

| Spec Requirement | Plan Phase | Tasks | AC |
|------------------|------------|-------|-----|
| BR-001 | P1, P4 | T1.2, T3.1 | AC-005 |
| BR-002 | P1, P2 | T1.2, T2.1, T3.1 | AC-005 |
| BR-003 | P3 | T2.4, T2.5 | AC-004 |
| BR-004 | P2, P3 | T2.1, T2.5, T3.3 | AC-008 |
| BR-005 | P2, P4 | T2.3, T3.4 | AC-009 |
| BR-006 | P2 | T2.2, T2.6 | AC-003 |
| BR-007 | P3 | T2.5, T3.8 | AC-007 |
| BR-008 | P1 | T1.1 | AC-002 |
| BR-009 | P1, P7 | T1.1, T4.4 | AC-002 |
| SKILL-001 | P2 | T2.1 | AC-003, AC-007 |
| SKILL-002 | P2 | T2.2 | AC-003, AC-007 |
| SKILL-003 | P2 | T2.3 | AC-003, AC-007 |
| AC-001 | P7 | T4.3 | - |
| AC-002 | P1, P6 | T1.1, T6.1 | - |
| AC-003 | P2 | T2.1, T2.2, T2.3 | - |
| AC-004 | P3 | T2.4, T2.5, T2.6 | - |
| AC-005 | P1, P4 | T1.2, T3.1 | - |
| AC-006 | P1, P4 | T1.3, T3.2 | - |
| AC-007 | P5 | T3.5, T3.6, T3.7, T3.8, T3.9 | - |
| AC-008 | P4 | T3.3 | - |
| AC-009 | P4 | T3.4 | - |
| AC-010 | All | (design constraint) | - |
| AC-011 | All | T4.6 | - |

---

## Next Recommended Command

After reviewing this tasks.md:

```
/spec-implement

Feature: 005-tester-core
Tasks: Execute tasks T1.1 through T4.6 according to dependency order
Focus: Phase 1 and Phase 2 first (core capabilities)
Constraint: Maintain role purity, no reviewer/docs/security content
Validation: Ensure all AC-001 through AC-011 satisfied
```

Or begin with Phase 1 only:

```
/spec-implement

Feature: 005-tester-core
Tasks: T1.1, T1.2, T1.3
Deliver: specs/005-tester-core/role-scope.md, upstream-consumption.md, downstream-interfaces.md
```
