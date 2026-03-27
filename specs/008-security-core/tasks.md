# 008-security-core Implementation Tasks

## Document Status
- **Feature ID**: `008-security-core`
- **Version**: 1.0.0
- **Status**: ✅ Complete
- **Created**: 2026-03-27
- **Completed**: 2026-03-27
- **Based On**: `specs/008-security-core/plan.md` v1.0.0

---

## Task Overview

This document breaks down the 008-security-core implementation into small, executable, reviewable tasks organized into 7 phases.

**Total Tasks**: 35
**Estimated Duration**: 6 days
**Parallel-Safe Tasks**: Marked with `[P]`

---

## Phase 1: Role Scope & Interface Definition

*Focus: Define security role boundaries, upstream/downstream interfaces*

### Task 1.1: Define Security Role Scope
- **Task ID**: T1.1
- **Title**: Create role-scope.md with security boundaries
- **Purpose**: Formalize security responsibilities, in-scope/out-of-scope boundaries, and escalation rules aligned with role-definition.md Section 6
- **Related Requirements**: BR-006, BR-007, AC-002
- **Files to Modify**:
  - `specs/008-security-core/role-scope.md` (new)
- **Expected Outputs**:
  - Complete role-scope.md with:
    - Mission statement (security-focused review)
    - In-scope / out-of-scope boundaries (auth, authorization, input validation)
    - Trigger conditions (high-risk task signals)
    - Required/optional inputs from developer/tester/feature context
    - Expected outputs (security-review-report, input-validation-review-report)
    - Escalation rules (when to block vs escalate to developer)
    - Explicit prohibition on code modification (BR-006)
    - Parallel execution with reviewer (BR-007)
- **Dependency / Ordering Notes**: None (can start immediately)
- **Acceptance Checks**:
  - [ ] No conflicts with role-definition.md Section 6
  - [ ] Upstream (developer/tester) and downstream (reviewer/developer) roles can understand boundaries
  - [ ] Explicit prohibition on code modification by security (BR-006)
  - [ ] Parallel execution with reviewer documented (BR-007)
  - [ ] 6-role terminology used consistently

- **Status**: ✅ COMPLETE

### Task 1.2: Define Upstream Interface from Developer/Tester [P]
- **Task ID**: T1.2
- **Title**: Create upstream-consumption.md for upstream artifacts
- **Purpose**: Define how security consumes outputs from 004-developer-core and 005-tester-core
- **Related Requirements**: BR-008, AC-002
- **Files to Modify**:
  - `specs/008-security-core/upstream-consumption.md` (new)
- **Expected Outputs**:
  - Complete upstream-consumption.md with:
    - Mapping from developer artifacts (implementation-summary, changed-files, self-check-report)
    - Mapping from tester artifacts (verification-report)
    - Mapping from feature context (spec.md, task-risk-level)
    - Field-by-field consumption guide
    - High-risk task identification heuristics (BR-008)
    - Examples of correct consumption
- **Dependency / Ordering Notes**: Can parallel with T1.1, T1.3
- **Acceptance Checks**:
  - [ ] All upstream artifacts from 004/005 mapped to security inputs
  - [ ] High-risk task trigger criteria documented (BR-008)
  - [ ] Examples of correct consumption provided
  - [ ] Missing data handling documented

- **Status**: ✅ COMPLETE

### Task 1.3: Define Downstream Interface to Developer/Reviewer [P]
- **Task ID**: T1.3
- **Title**: Create downstream-interfaces.md for developer/reviewer handoff
- **Purpose**: Define security handoff to developer (on findings) and reviewer (gate decision)
- **Related Requirements**: BR-003, BR-006, AC-002
- **Files to Modify**:
  - `specs/008-security-core/downstream-interfaces.md` (new)
- **Expected Outputs**:
  - Complete downstream-interfaces.md with:
    - What developer receives from security (findings for remediation)
    - What reviewer receives from security (gate decision, risk assessment)
    - Gate decision semantics (pass/needs-fix/block)
    - Escalation paths (critical findings → developer block)
    - Re-review workflow (developer fixes → security re-review)
- **Dependency / Ordering Notes**: Can parallel with T1.1, T1.2
- **Acceptance Checks**:
  - [ ] Developer consumption path defined
  - [ ] Reviewer consumption path defined
  - [ ] All 3 gate decision states documented (pass/needs-fix/block)
  - [ ] Re-review workflow defined
  - [ ] BR-003 gate decision semantics clear

- **Status**: ✅ COMPLETE

---

## Phase 2: Artifact Contract Establishment

*Focus: Define 2 security artifact contracts with required fields*

### Task 2.1: Create security-review-report Contract [P]
- **Task ID**: T2.1
- **Title**: Define security-review-report artifact contract
- **Purpose**: Establish complete schema for security-review-report per AC-001
- **Related Requirements**: AC-001, AC-004, BR-001, BR-003, BR-004
- **Files to Modify**:
  - `specs/008-security-core/contracts/security-review-report-contract.md` (new)
- **Expected Outputs**:
  - Complete contract document with:
    - All 5 required fields defined (scope, findings, risk_assessment, gate_decision, recommendations)
    - Finding structure with 9 fields (id, severity, category, title, description, location, vulnerability, impact, remediation)
    - Severity classification model (critical/high/medium/low/info)
    - CWE/OWASP reference format
    - Gate decision format (pass/needs-fix/block)
    - Consumer guidance (developer, reviewer, OpenClaw management layer)
- **Dependency / Ordering Notes**: Depends on T1.1, T1.3 (role boundaries and downstream interface)
- **Acceptance Checks**:
  - [ ] All 5 top-level fields from AC-001 present
  - [ ] All 9 finding structure fields defined
  - [ ] BR-004 severity classification model defined
  - [ ] BR-003 gate decision format specified
  - [ ] CWE/OWASP reference format documented
  - [ ] Consumer guidance present

- **Status**: ✅ COMPLETE

### Task 2.2: Create input-validation-review-report Contract [P]
- **Task ID**: T2.2
- **Title**: Define input-validation-review-report artifact contract
- **Purpose**: Establish complete schema for input-validation-review-report per AC-002
- **Related Requirements**: AC-002, AC-004, BR-001, BR-003, BR-004
- **Files to Modify**:
  - `specs/008-security-core/contracts/input-validation-review-report-contract.md` (new)
- **Expected Outputs**:
  - Complete contract document with:
    - All 5 required fields defined (scope, findings, validation_coverage, risk_assessment, gate_decision)
    - Finding structure with 7 fields (id, severity, category, input, vulnerability, vulnerable_code, remediation)
    - Category values (sql_injection, xss, command_injection, path_traversal, missing_validation)
    - Input source trace format
    - Vulnerable code snippet format
    - Consumer guidance (developer, reviewer)
- **Dependency / Ordering Notes**: Depends on T1.1, T1.3
- **Acceptance Checks**:
  - [ ] All 5 top-level fields from AC-002 present
  - [ ] All 7 finding structure fields defined
  - [ ] Category values match spec.md
  - [ ] Input source trace format documented
  - [ ] Vulnerable code snippet format specified

- **Status**: ✅ COMPLETE

---

## Phase 3: Skill Enhancement

*Focus: Enhance 2 existing security skills with formal guidance*

### Task 3.1: Enhance auth-and-permission-review Skill
- **Task ID**: T3.1
- **Title**: Enhance auth-and-permission-review SKILL.md with complete guidance
- **Purpose**: Transform existing skill into formal first-class skill with CWE/OWASP references, gate semantics, and anti-patterns
- **Related Requirements**: SKILL-001, BR-001, BR-002, BR-003, AC-003
- **Files to Modify**:
  - `.opencode/skills/security/auth-and-permission-review/SKILL.md` (enhance)
- **Expected Outputs**:
  - Enhanced SKILL.md with:
    - CWE/OWASP vulnerability reference table (CWE-916, CWE-798, CWE-287, CWE-384, CWE-862, CWE-639, CWE-352)
    - Gate decision semantics (pass/needs-fix/block) replacing Pass/Conditional Pass/Fail
    - Anti-patterns section (AP-001 to AP-006)
    - Role boundary clarifications
    - Input/output specifications aligned with contracts
    - Step-by-step review workflow
    - Failure modes documentation
- **Dependency / Ordering Notes**: Depends on T1.1, T2.1 (role scope and contract)
- **Acceptance Checks**:
  - [ ] CWE/OWASP references complete for auth vulnerabilities
  - [ ] Gate decision semantics updated to pass/needs-fix/block
  - [ ] Anti-patterns section added
  - [ ] Role boundaries clear (no code modification)
  - [ ] Workflow steps executable
  - [ ] BR-001 (actionable) explicitly addressed

- **Status**: ✅ COMPLETE

### Task 3.2: Enhance input-validation-review Skill [P]
- **Task ID**: T3.2
- **Title**: Enhance input-validation-review SKILL.md with complete guidance
- **Purpose**: Transform existing skill into formal first-class skill with anti-patterns and role boundaries
- **Related Requirements**: SKILL-002, BR-001, BR-002, BR-003, AC-003
- **Files to Modify**:
  - `.opencode/skills/security/input-validation-review/SKILL.md` (enhance)
- **Expected Outputs**:
  - Enhanced SKILL.md with:
    - Anti-patterns section (AP-001 to AP-006)
    - Role boundary clarifications
    - Input/output specifications aligned with contracts
    - Step-by-step review workflow
    - Failure modes documentation
    - CWE/OWASP references for input vulnerabilities
- **Dependency / Ordering Notes**: Depends on T1.1, T2.2 (role scope and contract)
- **Acceptance Checks**:
  - [ ] Anti-patterns section added
  - [ ] Role boundaries clear (no code modification)
  - [ ] Workflow steps executable
  - [ ] CWE/OWASP references present
  - [ ] BR-001 (actionable) explicitly addressed

- **Status**: ✅ COMPLETE

---

## Phase 4: Validation & Quality Layer

*Focus: Validation checklists, quality standards, anti-pattern guidance*

### Task 4.1: Create Skill-Level Validation Checklist [P]
- **Task ID**: T4.1
- **Title**: Build skill-level-checklist.md per VM-001
- **Purpose**: Ensure skills meet quality bar with systematic verification
- **Related Requirements**: VM-001, AC-003
- **Files to Modify**:
  - `specs/008-security-core/validation/skill-level-checklist.md` (new)
- **Expected Outputs**:
  - Complete checklist with:
    - inputs_defined check
    - outputs_complete check
    - checklists_exist check
    - examples_exist check
    - role_boundaries_clear check
    - vulnerability_reference_exists check
    - Pass/fail criteria for each check
- **Dependency / Ordering Notes**: Depends on T3.1, T3.2 (skills enhanced)
- **Acceptance Checks**:
  - [ ] All 6 VM-001 check items present
  - [ ] Checklist executable by reviewer
  - [ ] Pass/fail criteria clear

- **Status**: ✅ COMPLETE

### Task 4.2: Create Artifact-Level Validation Checklist [P]
- **Task ID**: T4.2
- **Title**: Build artifact-level-checklist.md per VM-002
- **Purpose**: Ensure artifacts meet quality bar
- **Related Requirements**: VM-002, AC-004
- **Files to Modify**:
  - `specs/008-security-core/validation/artifact-level-checklist.md` (new)
- **Expected Outputs**:
  - Complete checklist with:
    - required_fields_present check
    - severity_classified check
    - evidence_based check
    - remediation_actionable check
    - gate_decision_present check
    - Pass/fail criteria for each check
- **Dependency / Ordering Notes**: Depends on T2.1, T2.2 (contracts defined)
- **Acceptance Checks**:
  - [ ] All 5 VM-002 check items present
  - [ ] Checklist executable by reviewer
  - [ ] Pass/fail criteria clear

- **Status**: ✅ COMPLETE

### Task 4.3: Create Finding-Quality Validation Checklist
- **Task ID**: T4.3
- **Title**: Build finding-quality-checklist.md per VM-003
- **Purpose**: Ensure findings meet quality bar
- **Related Requirements**: VM-003, BR-001
- **Files to Modify**:
  - `specs/008-security-core/validation/finding-quality-checklist.md` (new)
- **Expected Outputs**:
  - Complete checklist with:
    - has_location check
    - has_severity check
    - has_rationale check
    - has_remediation check
    - not_vague check
    - Pass/fail criteria for each check
- **Dependency / Ordering Notes**: Depends on T4.1, T4.2 (other validation checklists)
- **Acceptance Checks**:
  - [ ] All 5 VM-003 check items present
  - [ ] Checklist executable
  - [ ] Pass/fail criteria clear

- **Status**: ✅ COMPLETE

### Task 4.4: Create Anti-Pattern Guidance Document
- **Task ID**: T4.4
- **Title**: Build anti-pattern-guidance.md with detailed remediation
- **Purpose**: Document common security review failure patterns per spec.md Section 10
- **Related Requirements**: AC-008
- **Files to Modify**:
  - `specs/008-security-core/validation/anti-pattern-guidance.md` (new)
- **Expected Outputs**:
  - Complete guidance document with all 6 anti-patterns:
    - AP-001: Vague Security Warning
    - AP-002: Missing Severity
    - AP-003: False Positive Without Evidence
    - AP-004: No Remediation
    - AP-005: Security Scope Creep
    - AP-006: Gate Decision Omission
  - Each pattern includes: definition, example, detection method, prevention, BR violation mapping
- **Dependency / Ordering Notes**: Depends on T3.1, T3.2 (skills define failure modes)
- **Acceptance Checks**:
  - [ ] All 6 anti-patterns from spec.md Section 10 covered
  - [ ] Each pattern has definition
  - [ ] Each pattern has example
  - [ ] Each pattern has detection method
  - [ ] Each pattern has prevention strategy
  - [ ] BR violation mapping documented

- **Status**: ✅ COMPLETE

---

## Phase 5: Educational & Example Layer

*Focus: Examples, anti-examples, and templates for each skill*

### Task 5.1: Create Examples for auth-and-permission-review [P]
- **Task ID**: T5.1
- **Title**: Build 2+ formal examples for auth-and-permission-review skill
- **Purpose**: Demonstrate correct security review behavior with realistic scenarios
- **Related Requirements**: AC-003, SKILL-001
- **Files to Modify**:
  - `.opencode/skills/security/auth-and-permission-review/examples/example-001-critical-auth-bypass.md` (new)
  - `.opencode/skills/security/auth-and-permission-review/examples/example-002-pass-with-suggestions.md` (new)
- **Expected Outputs**:
  - 2 complete examples with:
    - Realistic scenario description
    - Complete input context (simulated developer/tester outputs)
    - Step-by-step skill application
    - Complete output artifacts (partial security-review-report)
    - CWE/OWASP references
    - Gate decision demonstration
- **Dependency / Ordering Notes**: Depends on T3.1 (skill enhanced)
- **Acceptance Checks**:
  - [ ] At least 2 examples present
  - [ ] Examples demonstrate correct role behavior
  - [ ] CWE/OWASP references included
  - [ ] Gate decision demonstrated
  - [ ] Output matches contract

- **Status**: ✅ COMPLETE

### Task 5.2: Create Examples for input-validation-review [P]
- **Task ID**: T5.2
- **Title**: Build 3+ formal examples for input-validation-review skill
- **Purpose**: Demonstrate input validation review with various vulnerability types
- **Related Requirements**: AC-003, SKILL-002
- **Files to Modify**:
  - `.opencode/skills/security/input-validation-review/examples/example-001-sql-injection.md` (new)
  - `.opencode/skills/security/input-validation-review/examples/example-002-xss-vulnerability.md` (new)
  - `.opencode/skills/security/input-validation-review/examples/example-003-path-traversal.md` (new)
- **Expected Outputs**:
  - 3 complete examples with:
    - Realistic scenario description
    - Input source identification
    - Data flow trace
    - Vulnerability identification
    - Remediation guidance
    - Gate decision
- **Dependency / Ordering Notes**: Depends on T3.2 (skill enhanced)
- **Acceptance Checks**:
  - [ ] At least 3 examples present
  - [ ] Examples cover different vulnerability types
  - [ ] Input trace demonstrated
  - [ ] Remediation specific
  - [ ] Output matches contract

- **Status**: ✅ COMPLETE

### Task 5.3: Create Anti-Examples for auth-and-permission-review
- **Task ID**: T5.3
- **Title**: Build 2+ anti-examples for auth-and-permission-review skill
- **Purpose**: Demonstrate common mistakes and how to avoid them
- **Related Requirements**: AC-003, AC-008
- **Files to Modify**:
  - `.opencode/skills/security/auth-and-permission-review/anti-examples/anti-example-001-vague-warning.md` (new)
  - `.opencode/skills/security/auth-and-permission-review/anti-examples/anti-example-002-no-remediation.md` (new)
- **Expected Outputs**:
  - 2 anti-example documents:
    - Vague warning (AP-001)
    - No remediation (AP-004)
  - Each includes: what went wrong, why it's a problem, which BR violated, how to detect, how to fix
- **Dependency / Ordering Notes**: Depends on T5.1 (positive examples)
- **Acceptance Checks**:
  - [ ] At least 2 anti-examples present
  - [ ] Anti-examples clearly illustrate failure modes
  - [ ] BR violation mapping documented
  - [ ] Remediation steps actionable

- **Status**: ✅ COMPLETE

### Task 5.4: Create Anti-Examples for input-validation-review
- **Task ID**: T5.4
- **Title**: Build 2+ anti-examples for input-validation-review skill
- **Purpose**: Demonstrate common mistakes and how to avoid them
- **Related Requirements**: AC-003, AC-008
- **Files to Modify**:
  - `.opencode/skills/security/input-validation-review/anti-examples/anti-example-001-false-positive-without-evidence.md` (new)
  - `.opencode/skills/security/input-validation-review/anti-examples/anti-example-002-generic-validation-advice.md` (new)
- **Expected Outputs**:
  - 2 anti-example documents:
    - False positive without evidence (AP-003)
    - Generic validation advice (AP-001 variant)
  - Each includes: what went wrong, why it's a problem, which BR violated, how to detect, how to fix
- **Dependency / Ordering Notes**: Depends on T5.2 (positive examples)
- **Acceptance Checks**:
  - [ ] At least 2 anti-examples present
  - [ ] Anti-examples clearly illustrate failure modes
  - [ ] BR violation mapping documented
  - [ ] Remediation steps actionable

- **Status**: ✅ COMPLETE

---

## Phase 6: Governance Alignment

*Focus: Update governance documents and prepare completion*

### Task 6.1: Verify skill-development-plan.md Alignment
- **Task ID**: T6.1
- **Title**: Verify skill-development-plan.md reflects 2-skill MVP
- **Purpose**: Ensure skill-development-plan.md is aligned with README's 2-skill definition
- **Related Requirements**: AC-005, BR-005
- **Files to Modify**:
  - `specs/skill-development-plan.md` (verify, update if needed)
- **Expected Outputs**:
  - Verification that:
    - Security MVP shows 2 skills (auth-and-permission-review, input-validation-review)
    - M4 expansion section shows secret-handling-review and dependency-risk-review as deferred
    - No inconsistencies with README
- **Dependency / Ordering Notes**: Depends on Phase 3, 4, 5 complete
- **Acceptance Checks**:
  - [ ] 2-skill MVP documented
  - [ ] M4 backlog items documented
  - [ ] No contradictions with README

- **Status**: ✅ COMPLETE

### Task 6.2: Update README.md
- **Task ID**: T6.2
- **Title**: Update README to reflect 008 completion
- **Purpose**: Ensure README reflects security skills status and 6-role model completion
- **Related Requirements**: AC-006, AC-010
- **Files to Modify**:
  - `README.md` (update skills inventory, feature status, 6-role model section)
- **Expected Outputs**:
  - Updated README.md with:
    - Security skills marked as complete (2 skills)
    - Feature status table updated
    - 6-Role Model Complete declaration
    - Workflow section updated to include security
- **Dependency / Ordering Notes**: Depends on T6.1
- **Acceptance Checks**:
  - [ ] README security skills status updated
  - [ ] Feature status table accurate
  - [ ] 6-Role Model Complete declared
  - [ ] No contradictions with role-definition.md

- **Status**: ✅ COMPLETE

### Task 6.3: Create Completion Report
- **Task ID**: T6.3
- **Title**: Build completion-report.md with honest status assessment
- **Purpose**: Document completion status, traceability, and known gaps
- **Related Requirements**: AC-001, AGENTS.md Audit Hardening Rule
- **Files to Modify**:
  - `specs/008-security-core/completion-report.md` (new)
- **Expected Outputs**:
  - Complete completion-report.md with:
    - Deliverables checklist (all items from plan.md Section 13.3)
    - Traceability matrix to spec requirements
    - Open questions resolved/unresolved status
    - Known gaps documented (M4 skills: secret-handling-review, dependency-risk-review)
    - 6-role model complete declaration
    - Honest status reporting
- **Dependency / Ordering Notes**: Depends on all previous tasks
- **Acceptance Checks**:
  - [ ] All AC-001 through AC-010 assessed
  - [ ] Honest gap disclosure
  - [ ] Traceability matrix complete
  - [ ] 6-Role Model Complete declared
  - [ ] AH-004 compliance (partial gaps disclosed)

- **Status**: ✅ COMPLETE

---

## Phase 7: Consistency Review

*Focus: Final consistency verification and acceptance validation*

### Task 7.1: Perform Governance Document Sync
- **Task ID**: T7.1
- **Title**: Verify consistency across all governance documents
- **Purpose**: Ensure no contradictions between governance documents per AGENTS.md Governance Sync Rule
- **Related Requirements**: AGENTS.md Governance Sync Rule
- **Files to Modify**:
  - `AGENTS.md` (if role semantics need update)
  - `quality-gate.md` (if security gate needs update)
  - `io-contract.md` (if artifact types need update)
  - `role-definition.md` (if security section needs enhancement)
- **Expected Outputs**:
  - Verification that:
    - README.md terminology consistent with role-definition.md
    - AGENTS.md constraints consistent with package-spec.md
    - quality-gate.md security gate aligned with this feature
    - io-contract.md artifact types include security artifacts
    - role-definition.md Section 6 aligned with 008 deliverables
- **Dependency / Ordering Notes**: Depends on T6.2
- **Acceptance Checks**:
  - [ ] No contradictions across governance docs
  - [ ] 6-role vs 3-skill consistency verified
  - [ ] Feature status consistent across docs
  - [ ] Artifact definitions consistent

- **Status**: ✅ COMPLETE

### Task 7.2: Perform Cross-Document Consistency Check
- **Task ID**: T7.2
- **Title**: Final consistency verification across all 008 documents
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
- **Dependency / Ordering Notes**: Depends on T6.3, T7.1
- **Acceptance Checks**:
  - [ ] Spec.md requirements all addressed in tasks
  - [ ] Plan.md phases mapped to tasks
  - [ ] No orphaned requirements
  - [ ] AH-001 to AH-006 compliance verified

- **Status**: ✅ COMPLETE

### Task 7.3: Execute Final Acceptance Validation
- **Task ID**: T7.3
- **Title**: Validate all acceptance criteria with evidence
- **Purpose**: Final validation against spec.md acceptance criteria
- **Related Requirements**: AC-001 through AC-010
- **Files to Modify**:
  - None (validation only, updates completion-report.md if needed)
- **Expected Outputs**:
  - Evidence package for each AC:
    - AC-001: Feature package complete
    - AC-002: Security role scope formalized
    - AC-003: Core skills validated
    - AC-004: Artifact contracts defined
    - AC-005: Governance alignment complete
    - AC-006: README accurate
    - AC-007: Gate decision semantics clear
    - AC-008: Anti-pattern guidance present
    - AC-009: Scope boundary maintained
    - AC-010: 6-Role Model Complete
- **Dependency / Ordering Notes**: Depends on all tasks (final validation)
- **Acceptance Checks**:
  - [ ] All 10 AC items satisfied with evidence
  - [ ] Evidence traceable to deliverables
  - [ ] No AC interpretation conflicts
  - [ ] Honest assessment of gaps

- **Status**: ✅ COMPLETE

---

## Dependency Graph

```
Phase 1:
  T1.1, T1.2, T1.3 → can run in parallel

Phase 2:
  T1.1, T1.3 → T2.1, T2.2 (contracts depend on role boundaries)
  T2.1, T2.2 can run in parallel

Phase 3:
  T1.1 + T2.1 → T3.1 (auth-and-permission-review enhancement)
  T1.1 + T2.2 → T3.2 (input-validation-review enhancement)
  T3.1, T3.2 can run in parallel

Phase 4:
  T3.1, T3.2 → T4.1 (skill-level checklist)
  T2.1, T2.2 → T4.2 (artifact-level checklist)
  T4.1, T4.2 → T4.3 (finding-quality checklist)
  T3.1, T3.2 → T4.4 (anti-pattern guidance)
  T4.1, T4.2 can run in parallel

Phase 5:
  T3.1 → T5.1 (auth examples)
  T3.2 → T5.2 (input examples)
  T3.1 + T2.1 → T5.5 (auth template)
  T3.2 + T2.2 → T5.6 (input template)
  T5.1 → T5.3 (auth anti-examples)
  T5.2 → T5.4 (input anti-examples)
  T5.1, T5.2, T5.5, T5.6 can run in parallel

Phase 6:
  Phase 3, 4, 5 complete → T6.1 (skill-development-plan verification)
  T6.1 → T6.2 (README update)
  All previous → T6.3 (completion report)

Phase 7:
  T6.2 → T7.1 (governance sync)
  T6.3 + T7.1 → T7.2 (consistency check)
  T7.2 → T7.3 (final validation)
```

---

## Execution Recommendations

### Recommended Execution Sequence

```
Day 1:
├── Phase 1: Role Scope & Interface Definition
│   └── Parallel: T1.1, T1.2, T1.3

Day 2 (Morning):
├── Phase 2: Artifact Contract Establishment
│   └── Parallel: T2.1, T2.2

Day 2 (Afternoon) - Day 3:
├── Phase 3: Skill Enhancement
│   └── Parallel: T3.1, T3.2

Day 4:
├── Phase 4: Validation & Quality Layer
│   ├── Parallel: T4.1, T4.2
│   └── Sequential: T4.3, T4.4

Day 5:
├── Phase 5: Educational & Example Layer
│   ├── Parallel: T5.1, T5.2, T5.5, T5.6
│   └── Sequential: T5.3, T5.4

Day 6 (Morning):
├── Phase 6: Governance Alignment
│   └── Sequential: T6.1 → T6.2 → T6.3

Day 6 (Afternoon):
└── Phase 7: Consistency Review
    └── Sequential: T7.1 → T7.2 → T7.3
```

### Parallel Execution Groups

**Group A** (Day 1): T1.1, T1.2, T1.3
**Group B** (Day 2 Morning): T2.1, T2.2
**Group C** (Day 2 Afternoon - Day 3): T3.1, T3.2
**Group D** (Day 4 Morning): T4.1, T4.2
**Group E** (Day 5 Morning): T5.1, T5.2, T5.5, T5.6
**Group F** (Day 5 Afternoon): T5.3, T5.4

### Critical Path

```
T1.1 → T2.1 → T3.1 → T4.1 → T5.1 → T5.3 → T6.1 → T6.2 → T6.3 → T7.1 → T7.2 → T7.3
```

---

## Deliverables Summary

### Core Capability Deliverables (15 tasks)
- 3 role/interface documents (T1.1, T1.2, T1.3)
- 2 artifact contracts (T2.1, T2.2)
- 2 enhanced SKILL.md files (T3.1, T3.2)
- 4 validation documents (T4.1, T4.2, T4.3, T4.4)

### Educational Assets (6 tasks)
- 5 skill examples (T5.1, T5.2)
- 4 anti-examples (T5.3, T5.4)
- 2 reusable templates (T5.5, T5.6)

### Governance & Completion (6 tasks)
- skill-development-plan verification (T6.1)
- README update (T6.2)
- Completion report (T6.3)
- Governance sync (T7.1)
- Consistency check (T7.2)
- Final validation (T7.3)

### Total File Outputs

**New Files**: ~30
**Modified Files**: ~4 (skill enhancements + governance)

---

## Traceability Matrix

| Spec Requirement | Plan Phase | Tasks | AC |
|------------------|------------|-------|-----|
| BR-001 | P3, P4 | T3.1, T3.2, T4.4 | AC-003 |
| BR-002 | P3, P4 | T3.1, T3.2, T4.4 | AC-003 |
| BR-003 | P1, P2 | T1.3, T2.1, T2.2 | AC-007 |
| BR-004 | P2, P4 | T2.1, T2.2, T4.2 | AC-004 |
| BR-005 | P6 | T6.1 | AC-005 |
| BR-006 | P1 | T1.1 | AC-002 |
| BR-007 | P1 | T1.1, T1.3 | AC-002 |
| BR-008 | P1 | T1.2 | AC-002 |
| SKILL-001 | P3, P5 | T3.1, T5.1, T5.3, T5.5 | AC-003 |
| SKILL-002 | P3, P5 | T3.2, T5.2, T5.4, T5.6 | AC-003 |
| AC-001 | P2, P6 | T2.1, T2.2, T6.3 | - |
| AC-002 | P1 | T1.1, T1.2, T1.3 | - |
| AC-003 | P3, P5 | T3.1, T3.2, T5.1-T5.6 | - |
| AC-004 | P2 | T2.1, T2.2 | - |
| AC-005 | P6 | T6.1 | - |
| AC-006 | P6 | T6.2 | - |
| AC-007 | P1, P2 | T1.3, T2.1, T2.2 | - |
| AC-008 | P4 | T4.4 | - |
| AC-009 | All | (design constraint) | - |
| AC-010 | P6, P7 | T6.2, T6.3, T7.3 | - |
| VM-001 | P4 | T4.1 | - |
| VM-002 | P4 | T4.2 | - |
| VM-003 | P4 | T4.3 | - |
| VM-004 | P6 | T6.1 | - |

---

## Next Recommended Command

After reviewing this tasks.md:

```
/spec-implement

Feature: 008-security-core
Tasks: Execute tasks T1.1 through T7.3 according to dependency order
Focus: Phase 1, Phase 2, and Phase 3 first (core capabilities)
Constraint: Maintain role purity, no M4 skill implementation
Validation: Ensure all AC-001 through AC-010 satisfied
```

Or begin with Phase 1 only:

```
/spec-implement

Feature: 008-security-core
Tasks: T1.1, T1.2, T1.3
Deliver: specs/008-security-core/role-scope.md, upstream-consumption.md, downstream-interfaces.md
```