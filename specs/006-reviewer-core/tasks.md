# 006-reviewer-core Implementation Tasks

## Document Status
- **Feature ID**: `006-reviewer-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-26
- **Based On**: `specs/006-reviewer-core/plan.md` v1.0.0

---

## Task Overview

This document breaks down the 006-reviewer-core implementation into small, executable, reviewable tasks organized into 7 phases.

**Total Tasks**: 31
**Estimated Duration**: 7 days
**Parallel-Safe Tasks**: Marked with `[P]`

---

## Phase 1: Setup / Prerequisites

*Focus: Define reviewer role boundaries, upstream/downstream interfaces, and governance alignment*

### Task 1.1: Define Reviewer Role Scope
- **Task ID**: T1.1
- **Title**: Create role-scope.md with reviewer boundaries
- **Purpose**: Formalize reviewer responsibilities, in-scope/out-of-scope boundaries, and escalation rules aligned with role-definition.md Section 4
- **Related Requirements**: BR-007, BR-010, AC-002
- **Files to Modify**:
  - `specs/006-reviewer-core/role-scope.md` (new)
- **Expected Outputs**:
  - Complete role-scope.md with:
    - Mission statement (independent review, acceptance judgment)
    - In-scope / out-of-scope boundaries
    - Trigger conditions
    - Required/optional inputs from architect/developer/tester
    - Expected outputs (review-findings-report, acceptance-decision-record, actionable-feedback-report)
    - Escalation rules (when to escalate vs reject)
    - AH-006 governance alignment responsibilities
    - Explicit prohibition on code mutation (BR-007)
- **Dependency / Ordering Notes**: None (can start immediately)
- **Acceptance Checks**:
  - [ ] No conflicts with role-definition.md Section 4
  - [ ] Upstream (architect/developer/tester) and downstream (acceptance/docs/security) roles can understand boundaries
  - [ ] Explicit prohibition on code mutation by reviewer (BR-007)
  - [ ] 6-role terminology used consistently (no legacy 3-skill terms)
  - [ ] AH-006 governance alignment responsibilities documented

- **Status**: ⏳ PENDING

### Task 1.2: Define Upstream Interface from Architect/Developer/Tester [P]
- **Task ID**: T1.2
- **Title**: Create upstream-consumption.md for upstream artifacts
- **Purpose**: Define how reviewer consumes outputs from 003-architect-core, 004-developer-core, 005-tester-core
- **Related Requirements**: BR-001, BR-002, AC-005
- **Files to Modify**:
  - `specs/006-reviewer-core/upstream-consumption.md` (new)
- **Expected Outputs**:
  - Complete upstream-consumption.md with:
    - Mapping from architect artifacts (design-note, module-boundaries, risks-and-tradeoffs, open-questions)
    - Mapping from developer artifacts (implementation-summary.goal_alignment, implementation-summary.changed_files, implementation-summary.known_issues, implementation-summary.risks, self-check-report, bugfix-report.root_cause)
    - Mapping from tester artifacts (test-scope-report, verification-report, regression-risk-report)
    - Field-by-field consumption guide
    - BR-002 compliance: Self-check as input, not substitute
    - Examples of correct consumption
- **Dependency / Ordering Notes**: Can parallel with T1.1, T1.3
- **Acceptance Checks**:
  - [ ] All upstream artifacts from 003/004/005 mapped to reviewer inputs
  - [ ] Explicit BR-002 compliance (self-check vs independent review distinction)
  - [ ] Examples of correct consumption provided
  - [ ] Missing data handling documented

- **Status**: ⏳ PENDING

### Task 1.3: Define Downstream Interface to Acceptance/Docs/Security [P]
- **Task ID**: T1.3
- **Title**: Create downstream-interfaces.md for acceptance/docs/security handoff
- **Purpose**: Define reviewer handoff to acceptance, docs, and security with decision state semantics
- **Related Requirements**: BR-003, BR-004, AC-006
- **Files to Modify**:
  - `specs/006-reviewer-core/downstream-interfaces.md` (new)
- **Expected Outputs**:
  - Complete downstream-interfaces.md with:
    - What acceptance receives from reviewer
    - What docs receives from reviewer
    - What security receives from reviewer
    - Decision state semantics (accept/reject/accept-with-conditions/needs-clarification)
    - Evidence quality requirements per BR-004
    - Consumption guidance for each downstream role
- **Dependency / Ordering Notes**: Can parallel with T1.1, T1.2
- **Acceptance Checks**:
  - [ ] Acceptance consumption path defined
  - [ ] Docs consumption path defined
  - [ ] Security consumption path defined
  - [ ] Developer feedback loop defined (on reject)
  - [ ] Clear evidence quality standards specified
  - [ ] All 4 decision states documented with semantics

- **Status**: ⏳ PENDING

---

## Phase 2: Core Implementation

*Focus: Formalize 3 core skills and establish 3 artifact contracts*

### Task 2.1: Formalize code-review-checklist Skill [P]
- **Task ID**: T2.1
- **Title**: Enhance code-review-checklist SKILL.md with complete guidance
- **Purpose**: Transform existing code-review-checklist skill into formal first-class skill with explicit role boundaries and BR-002/BR-004/BR-006 compliance
- **Related Requirements**: SKILL-001, BR-002, BR-004, BR-006, AC-003
- **Files to Modify**:
  - `.opencode/skills/reviewer/code-review-checklist/SKILL.md` (enhance)
- **Expected Outputs**:
  - Enhanced SKILL.md with:
    - Explicit BR-002 compliance section (distinguish from developer self-check)
    - BR-004 integration (severity classification discipline)
    - BR-006 governance alignment section (add AH-006 checks)
    - Examples showing consumption of upstream artifacts
    - Step-by-step review workflow
    - Input/output specifications
    - Role boundary clarifications
    - Failure modes documentation
- **Dependency / Ordering Notes**: Depends on T1.1, T1.2 (role boundaries and upstream interface defined)
- **Acceptance Checks**:
  - [ ] BR-002 explicitly addressed
  - [ ] BR-004 severity classification documented
  - [ ] BR-006 governance alignment checks included
  - [ ] Upstream consumption from architect/developer/tester artifacts documented
  - [ ] Role boundaries clear (no code mutation)
  - [ ] Workflow steps executable
  - [ ] At least 2 examples created (in separate files)
  - [ ] At least 2 anti-examples created (in separate files)
  - [ ] At least 1 checklist created (in separate files)

- **Status**: ⏳ PENDING

### Task 2.2: Formalize spec-implementation-diff Skill [P]
- **Task ID**: T2.2
- **Title**: Enhance spec-implementation-diff SKILL.md with complete guidance
- **Purpose**: Enhance existing spec-implementation-diff skill (already has AH-006) with formal examples, anti-examples, and contract alignment
- **Related Requirements**: SKILL-002, BR-006, BR-008, BR-009, AC-003, AC-011
- **Files to Modify**:
  - `.opencode/skills/reviewer/spec-implementation-diff/SKILL.md` (enhance)
- **Expected Outputs**:
  - Enhanced SKILL.md with:
    - BR-006 compliance (governance alignment checks - already present)
    - BR-008 compliance (scope creep detection)
    - BR-009 compliance (status truthfulness verification)
    - Examples showing governance drift detection
    - Integration with acceptance-decision-record workflow
    - Step-by-step spec-implementation diff workflow
    - Failure modes documentation
- **Dependency / Ordering Notes**: Depends on T1.1, T1.2
- **Acceptance Checks**:
  - [ ] BR-006 governance alignment checks documented (already present, verify)
  - [ ] BR-008 scope creep detection guidance added
  - [ ] BR-009 status truthfulness checks added
  - [ ] Upstream consumption documented
  - [ ] Role boundaries clear
  - [ ] At least 2 examples created
  - [ ] At least 2 anti-examples created
  - [ ] At least 1 checklist created

- **Status**: ⏳ PENDING

### Task 2.3: Formalize reject-with-actionable-feedback Skill [P]
- **Task ID**: T2.3
- **Title**: Enhance reject-with-actionable-feedback SKILL.md with complete guidance
- **Purpose**: Transform existing reject-with-actionable-feedback skill into formal first-class skill with BR-005 compliance and contract alignment
- **Related Requirements**: SKILL-003, BR-005, BR-007, AC-003
- **Files to Modify**:
  - `.opencode/skills/reviewer/reject-with-actionable-feedback/SKILL.md` (enhance)
- **Expected Outputs**:
  - Enhanced SKILL.md with:
    - BR-005 compliance (rejection must be actionable)
    - BR-007 compliance (no code mutation during rejection)
    - Examples showing actionable rejection
    - Anti-examples showing vague rejection
    - Integration with developer rework workflow
    - Step-by-step feedback generation workflow
    - Closure criteria specification
    - Failure modes documentation
- **Dependency / Ordering Notes**: Depends on T1.1
- **Acceptance Checks**:
  - [ ] BR-005 explicitly addressed (actionable guidance required)
  - [ ] BR-007 explicitly addressed (no silent fixing)
  - [ ] Upstream consumption documented
  - [ ] Role boundaries clear
  - [ ] At least 2 examples created
  - [ ] At least 2 anti-examples created
  - [ ] At least 1 checklist created
  - [ ] Closure criteria format specified

- **Status**: ⏳ PENDING

### Task 2.4: Create review-findings-report Contract [P]
- **Task ID**: T2.4
- **Title**: Define review-findings-report artifact contract
- **Purpose**: Establish complete schema for review-findings-report with all 11 required fields per AC-001
- **Related Requirements**: AC-001, BR-004, BR-006
- **Files to Modify**:
  - `specs/006-reviewer-core/contracts/review-findings-report-contract.md` (new)
- **Expected Outputs**:
  - Complete contract document with:
    - All 11 required fields defined (review_target, reviewed_inputs, summary_judgment, findings_by_severity, evidence_references, scope_mismatches, quality_concerns, governance_alignment_status, governance_conflicts, open_questions, recommended_next_action)
    - Field validation rules
    - Severity classification model (blocker/major/minor/note per quality-gate.md Section 2.2)
    - Governance alignment status definitions
    - Evidence reference format
    - Consumer guidance (acceptance, docs, security)
- **Dependency / Ordering Notes**: Depends on T2.1, T2.2 (skills inform contract needs)
- **Acceptance Checks**:
  - [ ] All 11 fields from AC-001 present
  - [ ] BR-004 severity classification model defined
  - [ ] BR-006 governance alignment fields included
  - [ ] Upstream references to architect/developer/tester artifacts clear
  - [ ] Example instances valid
  - [ ] Consumer guidance for acceptance/docs/security present

- **Status**: ⏳ PENDING

### Task 2.5: Create acceptance-decision-record Contract [P]
- **Task ID**: T2.5
- **Title**: Define acceptance-decision-record artifact contract
- **Purpose**: Establish complete schema for acceptance-decision-record with all 9 required fields per AC-002
- **Related Requirements**: AC-002, BR-003
- **Files to Modify**:
  - `specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md` (new)
- **Expected Outputs**:
  - Complete contract document with:
    - All 9 required fields defined (target_feature, decision_state, decision_rationale, blocking_issues, non_blocking_issues, acceptance_conditions, downstream_recommendation, reviewer_confidence_level, governance_compliance)
    - Decision state definitions (accept/accept-with-conditions/reject/needs-clarification)
    - Rationale format requirements
    - Downstream recommendation vocabulary
    - Confidence level definitions (HIGH/MEDIUM/LOW)
- **Dependency / Ordering Notes**: Depends on T2.2, T2.3 (skills inform decision logic)
- **Acceptance Checks**:
  - [ ] All 9 fields from AC-002 present
  - [ ] BR-003 decision state semantics clear (all 4 states documented)
  - [ ] Decision rationale format specified
  - [ ] Downstream recommendation vocabulary defined
  - [ ] Example instances valid

- **Status**: ⏳ PENDING

### Task 2.6: Create actionable-feedback-report Contract [P]
- **Task ID**: T2.6
- **Title**: Define actionable-feedback-report artifact contract
- **Purpose**: Establish complete schema for actionable-feedback-report with all 10 required fields per AC-003
- **Related Requirements**: AC-003, BR-005
- **Files to Modify**:
  - `specs/006-reviewer-core/contracts/actionable-feedback-report-contract.md` (new)
- **Expected Outputs**:
  - Complete contract document with:
    - All 10 required fields defined (issue_summary, affected_files_artifacts, why_it_matters, required_correction, suggested_owner_role, expected_verification, closure_criteria, must_fix_items, should_fix_items, residual_risks)
    - Must-fix vs should-fix classification
    - Remediation guidance format
    - Re-review criteria specification
    - Closure checklist format
- **Dependency / Ordering Notes**: Depends on T2.3 (reject-with-actionable-feedback skill)
- **Acceptance Checks**:
  - [ ] All 10 fields from AC-003 present
  - [ ] BR-005 actionable guidance format specified
  - [ ] Must-fix vs should-fix distinction clear
  - [ ] Re-review criteria format specified
  - [ ] Developer can execute remediation from feedback

- **Status**: ⏳ PENDING

---

## Phase 3: Integration / Edge Cases

*Focus: Validation layer, quality gates, educational materials, examples, and anti-examples*

### Task 3.1: Create Upstream-Consumability Checklist
- **Task ID**: T3.1
- **Title**: Build upstream-consumability-checklist.md
- **Purpose**: Ensure reviewer correctly consumes architect, developer, and tester outputs with systematic verification
- **Related Requirements**: AC-005, BR-001, BR-002
- **Files to Modify**:
  - `specs/006-reviewer-core/validation/upstream-consumability-checklist.md` (new)
- **Expected Outputs**:
  - Complete checklist with:
    - Architect artifacts consumption checks (design-note, module-boundaries, risks-and-tradeoffs, open-questions)
    - Developer artifacts consumption checks (implementation-summary fields, self-check-report distinction, bugfix-report.root_cause)
    - Tester artifacts consumption checks (test-scope-report, verification-report, regression-risk-report)
    - BR-002 compliance check (self-check vs independent review)
    - Missing data handling check
- **Dependency / Ordering Notes**: Depends on T1.2, T2.4 (upstream interface and contracts)
- **Acceptance Checks**:
  - [ ] All upstream artifact fields have check items
  - [ ] Checklist executable by reviewer
  - [ ] BR-002 distinction verifiable
  - [ ] Missing data handling documented

- **Status**: ⏳ PENDING

### Task 3.2: Create Downstream-Consumability Checklist
- **Task ID**: T3.2
- **Title**: Build downstream-consumability-checklist.md
- **Purpose**: Ensure outputs can be consumed by acceptance, docs, security, and developer (on reject)
- **Related Requirements**: AC-006
- **Files to Modify**:
  - `specs/006-reviewer-core/validation/downstream-consumability-checklist.md` (new)
- **Expected Outputs**:
  - Complete checklist with consumption paths for:
    - Acceptance: Decision state clear, rationale provided, confidence level assigned
    - Docs: Findings actionable for documentation sync
    - Security: Security-relevant findings flagged
    - Developer (on reject): Must-fix items actionable, remediation guidance specific
- **Dependency / Ordering Notes**: Depends on T1.3, T2.5, T2.6 (downstream interface and contracts)
- **Acceptance Checks**:
  - [ ] Acceptance consumption path verified
  - [ ] Docs consumption path verified
  - [ ] Security consumption path verified
  - [ ] Developer feedback loop verified
  - [ ] Evidence quality verifiable

- **Status**: ⏳ PENDING

### Task 3.3: Create Failure-Mode Checklist
- **Task ID**: T3.3
- **Title**: Build failure-mode-checklist.md with 7 anti-patterns
- **Purpose**: Document common reviewer failure patterns with detection and remediation strategies
- **Related Requirements**: AC-009, spec.md Section 10
- **Files to Modify**:
  - `specs/006-reviewer-core/validation/failure-mode-checklist.md` (new)
- **Expected Outputs**:
  - Complete checklist covering all 7 patterns from spec.md:
    1. AP-001: Vague Review
    2. AP-002: Rubber Stamp Approval
    3. AP-003: Scope Creep Blindness
    4. AP-004: Severity Confusion
    5. AP-005: Governance Drift Ignorance
    6. AP-006: Silent Fixing
    7. AP-007: Rejection Without Remedy
  - Each pattern includes: definition, detection method, early warning signals, remediation, prevention
- **Dependency / Ordering Notes**: Depends on T2.1, T2.2, T2.3 (skills define failure modes)
- **Acceptance Checks**:
  - [ ] All 7 patterns from spec.md Section 10 covered
  - [ ] Each pattern has detection method
  - [ ] Each pattern has remediation strategy
  - [ ] Each pattern has prevention measure

- **Status**: ⏳ PENDING

### Task 3.4: Create Anti-Pattern Guidance Document
- **Task ID**: T3.4
- **Title**: Build anti-pattern-guidance.md with detailed remediation
- **Purpose**: Provide comprehensive anti-pattern documentation with real-world examples and actionable guidance
- **Related Requirements**: AC-009
- **Files to Modify**:
  - `specs/006-reviewer-core/validation/anti-pattern-guidance.md` (new)
- **Expected Outputs**:
  - Complete guidance document with:
    - Definition of each anti-pattern
    - Real-world examples (sanitized)
    - Detection methods
    - Prevention strategies
    - Remediation steps
    - BR violation mapping (which BR each anti-pattern violates)
- **Dependency / Ordering Notes**: Depends on T3.3 (failure-mode checklist)
- **Acceptance Checks**:
  - [ ] Guidance actionable by reviewer role
  - [ ] Examples realistic and educational
  - [ ] Prevention strategies practical
  - [ ] Remediation steps clear
  - [ ] BR violation mapping documented

- **Status**: ⏳ PENDING

### Task 3.5: Create Examples for code-review-checklist [P]
- **Task ID**: T3.5
- **Title**: Build 2+ formal examples for code-review-checklist skill
- **Purpose**: Demonstrate correct reviewer behavior with realistic scenarios and complete workflows
- **Related Requirements**: AC-007, AC-003
- **Files to Modify**:
  - `.opencode/skills/reviewer/code-review-checklist/examples/example-001-feature-code-review.md` (new)
  - `.opencode/skills/reviewer/code-review-checklist/examples/example-002-bugfix-code-review.md` (new)
- **Expected Outputs**:
  - 2 complete examples with:
    - Realistic scenario description
    - Complete input context (simulated architect/developer/tester outputs)
    - Step-by-step skill application
    - Complete output artifacts (partial review-findings-report)
    - Key decision notes
    - Severity classification demonstration
- **Dependency / Ordering Notes**: Depends on T2.1 (skill formalization)
- **Acceptance Checks**:
  - [ ] At least 2 examples present
  - [ ] Examples demonstrate correct role behavior
  - [ ] Input context complete (upstream artifacts)
  - [ ] Output artifacts match contracts
  - [ ] Severity classification demonstrated

- **Status**: ⏳ PENDING

### Task 3.6: Create Examples for spec-implementation-diff [P]
- **Task ID**: T3.6
- **Title**: Build 2+ formal examples for spec-implementation-diff skill
- **Purpose**: Demonstrate spec-implementation comparison with governance drift detection
- **Related Requirements**: AC-007, AC-011
- **Files to Modify**:
  - `.opencode/skills/reviewer/spec-implementation-diff/examples/example-001-spec-alignment-check.md` (new)
  - `.opencode/skills/reviewer/spec-implementation-diff/examples/example-002-governance-drift-detection.md` (new)
- **Expected Outputs**:
  - 2 complete examples with:
    - Realistic scenario description
    - Spec requirements extraction
    - Implementation mapping
    - Governance alignment check (AH-006)
    - Drift findings documentation
    - Decision recommendation
- **Dependency / Ordering Notes**: Depends on T2.2 (skill formalization)
- **Acceptance Checks**:
  - [ ] At least 2 examples present
  - [ ] Spec-implementation comparison demonstrated
  - [ ] Governance drift detection shown
  - [ ] Decision recommendation clear
  - [ ] AH-006 compliance demonstrated

- **Status**: ⏳ PENDING

### Task 3.7: Create Examples for reject-with-actionable-feedback [P]
- **Task ID**: T3.7
- **Title**: Build 2+ formal examples for reject-with-actionable-feedback skill
- **Purpose**: Demonstrate actionable rejection with remediation guidance
- **Related Requirements**: AC-007, BR-005
- **Files to Modify**:
  - `.opencode/skills/reviewer/reject-with-actionable-feedback/examples/example-001-actionable-rejection.md` (new)
  - `.opencode/skills/reviewer/reject-with-actionable-feedback/examples/example-002-escalation-scenario.md` (new)
- **Expected Outputs**:
  - 2 complete examples with:
    - Realistic scenario description (blocking findings)
    - Must-fix vs should-fix classification
    - Specific remediation guidance
    - Closure criteria specification
    - Re-review scope definition
- **Dependency / Ordering Notes**: Depends on T2.3 (skill formalization)
- **Acceptance Checks**:
  - [ ] At least 2 examples present
  - [ ] Actionable guidance demonstrated
  - [ ] Must-fix vs should-fix distinction clear
  - [ ] Closure criteria specific
  - [ ] BR-005 compliance demonstrated

- **Status**: ⏳ PENDING

### Task 3.8: Create Anti-Examples for All Skills
- **Task ID**: T3.8
- **Title**: Build 2+ anti-examples for each of the 3 skills
- **Purpose**: Demonstrate common mistakes and how to detect/avoid them
- **Related Requirements**: AC-007, AC-009
- **Files to Modify**:
  - `.opencode/skills/reviewer/code-review-checklist/anti-examples/` (2 files)
  - `.opencode/skills/reviewer/spec-implementation-diff/anti-examples/` (2 files)
  - `.opencode/skills/reviewer/reject-with-actionable-feedback/anti-examples/` (2 files)
- **Expected Outputs**:
  - 6 anti-example documents total (2 per skill):
    - code-review-checklist: vague-review, rubber-stamp-approval
    - spec-implementation-diff: ignoring-governance, scope-creep-blindness
    - reject-with-actionable-feedback: rejection-without-remedy, silent-fixing
  - Each includes: what went wrong, why it's a problem, which BR violated, how to detect, how to fix
- **Dependency / Ordering Notes**: Depends on T3.5, T3.6, T3.7 (examples created first)
- **Acceptance Checks**:
  - [ ] At least 2 anti-examples per skill (6 total)
  - [ ] Anti-examples clearly illustrate failure modes
  - [ ] Detection methods practical
  - [ ] Remediation steps actionable
  - [ ] BR violation mapping documented

- **Status**: ⏳ PENDING

### Task 3.9: Create Reusable Templates/Checklists for All Skills [P]
- **Task ID**: T3.9
- **Title**: Build reusable templates for each of the 3 skills
- **Purpose**: Provide ready-to-use templates that work across features without modification
- **Related Requirements**: AC-007
- **Files to Modify**:
  - `.opencode/skills/reviewer/code-review-checklist/checklists/code-review-checklist.md` (new)
  - `.opencode/skills/reviewer/spec-implementation-diff/checklists/spec-implementation-diff-checklist.md` (new)
  - `.opencode/skills/reviewer/reject-with-actionable-feedback/checklists/rejection-feedback-checklist.md` (new)
- **Expected Outputs**:
  - 3 reusable checklist/template documents:
    - Code review workflow checklist
    - Spec-implementation diff workflow checklist
    - Rejection feedback workflow checklist
- **Dependency / Ordering Notes**: Depends on T2.1, T2.2, T2.3 (skills define workflows)
- **Acceptance Checks**:
  - [ ] 3 checklist documents created
  - [ ] Templates usable without modification across features
  - [ ] Checklists executable step-by-step
  - [ ] Integration with artifact contracts clear

- **Status**: ⏳ PENDING

---

## Phase 4: Validation / Cleanup

*Focus: Workflow integration, governance sync, final consistency review, and completion*

### Task 4.1: Create Feature Examples Directory
- **Task ID**: T4.1
- **Title**: Build feature-level examples in specs/006-reviewer-core/examples/
- **Purpose**: Provide end-to-end examples showing complete reviewer workflows
- **Related Requirements**: spec.md Section 5
- **Files to Modify**:
  - `specs/006-reviewer-core/examples/standard-feature-review-example.md` (new)
  - `specs/006-reviewer-core/examples/rejection-with-feedback-example.md` (new)
  - `specs/006-reviewer-core/examples/governance-drift-detection-example.md` (new)
  - `specs/006-reviewer-core/examples/ambiguity-escalation-example.md` (new)
- **Expected Outputs**:
  - 4 end-to-end examples:
    - Standard Feature Review workflow (Workflow 1 from spec.md)
    - Rejection with Feedback workflow (Workflow 2 from spec.md)
    - Governance Drift Detection workflow (Workflow 3 from spec.md)
    - Ambiguity Escalation workflow (Workflow 4 from spec.md)
- **Dependency / Ordering Notes**: Depends on T3.5, T3.6, T3.7 (skill examples completed)
- **Acceptance Checks**:
  - [ ] 4 complete workflow examples
  - [ ] Examples show artifact flow
  - [ ] Escalation scenarios covered
  - [ ] Realistic scenarios
  - [ ] Decision states demonstrated

- **Status**: ⏳ PENDING

### Task 4.2: Perform Package Governance Updates Check
- **Task ID**: T4.2
- **Title**: Check and update README.md and other governance documents
- **Purpose**: Ensure governance documents reflect 006 completion status
- **Related Requirements**: AC-001, AGENTS.md Governance Sync Rule
- **Files to Modify**:
  - `README.md` (update skills inventory, feature status)
  - `package-spec.md` (update reviewer skills section if needed)
- **Expected Outputs**:
  - Updated README.md with:
    - Reviewer skills marked as complete
    - Feature status table updated
    - Workflow section updated
  - Verified package-spec.md alignment
- **Dependency / Ordering Notes**: Depends on all Phase 2 and 3 tasks (core work complete)
- **Acceptance Checks**:
  - [ ] README.md reviewer skills status updated
  - [ ] Feature status table accurate
  - [ ] No contradictions with role-definition.md
  - [ ] No contradictions with package-spec.md
  - [ ] 6-role vs 3-skill terminology consistent

- **Status**: ⏳ PENDING

### Task 4.3: Create Completion Report
- **Task ID**: T4.3
- **Title**: Build completion-report.md with honest status assessment
- **Purpose**: Document completion status, traceability, and any known gaps for future work
- **Related Requirements**: AC-001, AGENTS.md Audit Hardening Rule
- **Files to Modify**:
  - `specs/006-reviewer-core/completion-report.md` (new)
- **Expected Outputs**:
  - Complete completion-report.md with:
    - Deliverables checklist (all items from plan.md Section 12.3)
    - Traceability matrix to spec requirements (BR-001 to BR-010, SKILL-001 to SKILL-003, AC-001 to AC-012)
    - Open questions resolved/unresolved status (OQ-001 to OQ-006)
    - Known gaps documented (future advanced skills)
    - Input value for 007-docs-core, 008-security-core
    - Honest status reporting (no hidden gaps)
- **Dependency / Ordering Notes**: Depends on all previous tasks
- **Acceptance Checks**:
  - [ ] All AC-001 through AC-012 assessed
  - [ ] Honest gap disclosure (no hidden gaps)
  - [ ] Traceability matrix complete
  - [ ] Status consistent with actual repository state
  - [ ] AH-004 compliance (partial gaps disclosed in README)

- **Status**: ⏳ PENDING

### Task 4.4: Perform Governance Document Sync
- **Task ID**: T4.4
- **Title**: Verify consistency across all governance documents
- **Purpose**: Ensure no contradictions between governance documents per AGENTS.md Governance Sync Rule
- **Related Requirements**: AGENTS.md Governance Sync Rule, AH-006
- **Files to Modify**:
  - `AGENTS.md` (if role semantics need update)
  - `quality-gate.md` (if reviewer gate needs update)
  - `io-contract.md` (if artifact types need update)
  - `role-definition.md` (if reviewer section needs enhancement)
- **Expected Outputs**:
  - Verification that:
    - README.md terminology consistent with role-definition.md
    - AGENTS.md constraints consistent with package-spec.md
    - quality-gate.md reviewer gate aligned with this feature
    - io-contract.md artifact types include reviewer artifacts
    - role-definition.md Section 4 aligned with 006 deliverables
- **Dependency / Ordering Notes**: Depends on T4.2
- **Acceptance Checks**:
  - [ ] No contradictions across governance docs
  - [ ] 6-role vs 3-skill consistency verified
  - [ ] Feature status consistent across docs
  - [ ] Artifact definitions consistent
  - [ ] AH-006 compliance documented

- **Status**: ⏳ PENDING

### Task 4.5: Perform Cross-Document Consistency Check
- **Task ID**: T4.5
- **Title**: Final consistency verification across all 006-reviewer-core documents
- **Purpose**: Verify no contradictions between spec, plan, tasks, and outputs
- **Related Requirements**: AGENTS.md Audit Hardening Rule (AH-001 to AH-006)
- **Files to Modify**:
  - None (verification only)
- **Expected Outputs**:
  - Consistency report documenting:
    - Spec vs plan alignment
    - Plan vs tasks alignment
    - Tasks vs actual outputs alignment
    - Artifact contracts vs skill documents alignment
    - Governance alignment (AH-006)
- **Dependency / Ordering Notes**: Depends on T4.3, T4.4 (completion report and governance sync done)
- **Acceptance Checks**:
  - [ ] Spec.md requirements all addressed in tasks
  - [ ] Plan.md phases mapped to tasks
  - [ ] No orphaned requirements
  - [ ] Single source of truth for each fact
  - [ ] AH-001 to AH-006 compliance verified

- **Status**: ⏳ PENDING

### Task 4.6: Execute Final Acceptance Validation
- **Task ID**: T4.6
- **Title**: Validate all acceptance criteria with evidence
- **Purpose**: Final validation against spec.md acceptance criteria
- **Related Requirements**: AC-001 through AC-012
- **Files to Modify**:
  - None (validation only, updates completion-report.md if needed)
- **Expected Outputs**:
  - Evidence package for each AC:
    - AC-001: Feature package complete
    - AC-002: Reviewer role scope formalized
    - AC-003: Core skills formally implemented
    - AC-004: Artifact contracts defined
    - AC-005: Upstream consumption logic clear
    - AC-006: Downstream decision logic clear
    - AC-007: Skill assets complete
    - AC-008: Finding classification model present
    - AC-009: Anti-pattern guidance present
    - AC-010: Scope boundary maintained
    - AC-011: AH-006 governance alignment enforced
    - AC-012: First-class review role established
- **Dependency / Ordering Notes**: Depends on all tasks (final validation)
- **Acceptance Checks**:
  - [ ] All 12 AC items satisfied with evidence
  - [ ] Evidence traceable to deliverables
  - [ ] No AC interpretation conflicts
  - [ ] Honest assessment of gaps

- **Status**: ⏳ PENDING

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
  T2.1 → T2.4 (code-review-checklist informs review-findings-report)
  T2.2 → T2.4, T2.5 (spec-implementation-diff informs findings and decision)
  T2.3 → T2.6 (reject-with-actionable-feedback informs feedback report)

Phase 3:
  T1.2 + T2.4 → T3.1 (upstream consumability)
  T1.3 + T2.5 + T2.6 → T3.2 (downstream consumability)
  T2.1, T2.2, T2.3 → T3.3 (failure modes)
  T3.3 → T3.4 (anti-pattern guidance)
  T2.1 → T3.5 (code-review examples)
  T2.2 → T3.6 (spec-implementation examples)
  T2.3 → T3.7 (rejection examples)
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
- 4 feature examples (T4.1)

### Governance & Completion (4 tasks)
- README/package-spec updates (T4.2)
- Completion report (T4.3)
- Governance sync (T4.4)
- Consistency check (T4.5)
- Final validation (T4.6)

### Total File Outputs

**New Files**: ~40
**Modified Files**: ~5 (skill enhancements + governance)

---

## Traceability Matrix

| Spec Requirement | Plan Phase | Tasks | AC |
|------------------|------------|-------|-----|
| BR-001 | P1, P4 | T1.2, T3.1 | AC-005 |
| BR-002 | P1, P2 | T1.2, T2.1, T3.1 | AC-005 |
| BR-003 | P3 | T2.5, T1.3 | AC-006 |
| BR-004 | P2, P3 | T2.1, T2.4, T3.3 | AC-008 |
| BR-005 | P2, P4 | T2.3, T2.6, T3.7 | AC-003 |
| BR-006 | P2 | T2.1, T2.2, T2.4 | AC-011 |
| BR-007 | P1, P2 | T1.1, T2.3 | AC-002 |
| BR-008 | P2 | T2.2 | AC-003 |
| BR-009 | P2, P7 | T2.2, T4.4 | AC-011 |
| BR-010 | P1, P7 | T1.1, T4.4 | AC-002 |
| SKILL-001 | P2 | T2.1 | AC-003, AC-007 |
| SKILL-002 | P2 | T2.2 | AC-003, AC-007 |
| SKILL-003 | P2 | T2.3 | AC-003, AC-007 |
| AC-001 | P7 | T4.3 | - |
| AC-002 | P1, P6 | T1.1, T4.4 | - |
| AC-003 | P2 | T2.1, T2.2, T2.3 | - |
| AC-004 | P3 | T2.4, T2.5, T2.6 | - |
| AC-005 | P1, P4 | T1.2, T3.1 | - |
| AC-006 | P1, P4 | T1.3, T3.2 | - |
| AC-007 | P5 | T3.5, T3.6, T3.7, T3.8, T3.9 | - |
| AC-008 | P4 | T2.4, T3.3 | - |
| AC-009 | P4 | T3.3, T3.4 | - |
| AC-010 | All | (design constraint) | - |
| AC-011 | P2, P7 | T2.2, T4.4 | - |
| AC-012 | All | T4.6 | - |

---

## Next Recommended Command

After reviewing this tasks.md:

```
/spec-implement

Feature: 006-reviewer-core
Tasks: Execute tasks T1.1 through T4.6 according to dependency order
Focus: Phase 1 and Phase 2 first (core capabilities)
Constraint: Maintain role purity, no docs/security implementation
Validation: Ensure all AC-001 through AC-012 satisfied
```

Or begin with Phase 1 only:

```
/spec-implement

Feature: 006-reviewer-core
Tasks: T1.1, T1.2, T1.3
Deliver: specs/006-reviewer-core/role-scope.md, upstream-consumption.md, downstream-interfaces.md
```