# 005-tester-core Implementation Plan

## Document Status
- **Feature ID**: `005-tester-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-25
- **Based On**: `specs/005-tester-core/spec.md` v1.0.0

---

## 1. Architecture Summary

This feature implements the complete core capability system for the `tester` role, including:

1. **3 Core Skills**: `unit-test-design`, `regression-analysis`, `edge-case-matrix`
2. **3 Standard Artifacts**: `test-scope-report`, `verification-report`, `regression-risk-report`
3. **Complete Quality Assurance System**: Checklists, Anti-examples, Failure modes, Validation gates
4. **Upstream/Downstream Role Interfaces**: Consumption contracts from developer (upstream) and handoff to reviewer/acceptance (downstream)

This feature is not a bootstrap skeleton, but the complete first-phase implementation of the tester role.

---

## 2. Inputs from Spec

### 2.1 Core Requirements (from spec.md)

| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| BR-001 | Tester Must Consume Developer Evidence | Critical |
| BR-002 | Self-Check Is Not Independent Verification | Critical |
| BR-003 | Every Verification Report Must State Coverage Boundaries | Critical |
| BR-004 | Failures Must Be Classified | Critical |
| BR-005 | Edge Cases Are Mandatory | Critical |
| BR-006 | Regression Thinking Is Required | Critical |
| BR-007 | Honesty Over False Confidence | Critical |
| BR-008 | Tester Must Not Mutate Production Logic | Critical |
| BR-009 | Use 6-Role Formal Semantics | Critical |

### 2.2 Skill Requirements (from spec.md)

| Skill ID | Skill Name | Purpose |
|----------|------------|---------|
| SKILL-001 | unit-test-design | Turn changed behavior into test cases and structure |
| SKILL-002 | regression-analysis | Evaluate what existing behavior may be affected |
| SKILL-003 | edge-case-matrix | Identify and organize boundary conditions |

### 2.3 Artifact Requirements (from spec.md)

| Artifact ID | Artifact Name | Required Fields Count |
|-------------|---------------|----------------------|
| AC-001 | test-scope-report | 10 fields |
| AC-002 | verification-report | 12 fields |
| AC-003 | regression-risk-report | 8 fields |

### 2.4 Validation Requirements (from spec.md)

| Validation ID | Type | Check Items |
|---------------|------|-------------|
| AC-007 | Skill-Level | Examples, anti-examples, checklists required |
| AC-008 | Failure Classification | Reusable model required |
| AC-009 | Anti-Pattern | Guidance documentation required |
| AC-010 | Scope Boundary | No reviewer/docs/security content |

---

## 3. Technical Constraints

### 3.1 Governance Alignment Constraints

| Constraint | Source | Rationale |
|------------|--------|-----------|
| C-001: Use 6-role formal terminology | AGENTS.md, role-definition.md | Maintain governance consistency |
| C-002: Explicitly consume 004-developer-core outputs | spec.md BR-001 | Establish upstream/downstream contract |
| C-003: Follow I/O Contract | io-contract.md | Ensure management layer can invoke |
| C-004: Satisfy Quality Gate | quality-gate.md | Ensure output quality |
| C-005: Maintain role purity | BR-008 | Tester must not silently fix business logic |

### 3.2 Directory Structure Constraints

```
.opencode/skills/tester/
├── unit-test-design/
│   ├── SKILL.md
│   ├── examples/
│   │   └── example-1-test-design.md
│   ├── anti-examples/
│   │   └── anti-example-1-happy-path-only.md
│   └── checklists/
│       └── test-design-checklist.md
├── regression-analysis/
│   ├── SKILL.md
│   ├── examples/
│   ├── anti-examples/
│   └── checklists/
└── edge-case-matrix/
    ├── SKILL.md
    ├── examples/
    ├── anti-examples/
    └── checklists/
```

### 3.3 Artifact Storage Constraints

- Artifacts stored in task/feature working directory
- Follow feature-level traceability principles
- File naming convention: `test-scope-report.md`, `verification-report.md`, `regression-risk-report.md`

### 3.4 Compatibility Constraints

- Do not delete existing task-executor directory
- Do not break existing bootstrap workflows
- Mark legacy compatibility in skill documentation
- Align with existing tester skills (they already have basic SKILL.md files)

---

## 4. Module Decomposition

### 4.1 Phase Overview

```
Phase 1: Role Scope Finalization (1 day)
  ├── P1-1: Tester role boundary confirmation
  ├── P1-2: Upstream interface from developer definition
  └── P1-3: Downstream interface to reviewer/acceptance definition

Phase 2: Skill Formalization (2 days)
  ├── P2-1: unit-test-design formalization
  ├── P2-2: regression-analysis formalization
  └── P2-3: edge-case-matrix formalization

Phase 3: Artifact Contract Establishment (1 day)
  ├── P3-1: test-scope-report contract
  ├── P3-2: verification-report contract
  └── P3-3: regression-risk-report contract

Phase 4: Validation & Quality Layer (1 day)
  ├── P4-1: Upstream-consumability checklist
  ├── P4-2: Downstream-consumability checklist
  ├── P4-3: Failure-mode checklist
  └── P4-4: Anti-pattern guidance

Phase 5: Educational & Example Layer (1 day)
  ├── P5-1: Examples for each skill
  ├── P5-2: Anti-examples for each skill
  └── P5-3: Templates/checklists for each skill

Phase 6: Workflow & Package Integration (0.5 day)
  ├── P6-1: Role-scope.md documentation
  ├── P6-2: Package governance updates check
  └── P6-3: Feature completion preparation

Phase 7: Consistency Review (0.5 day)
  ├── P7-1: Governance document sync
  ├── P7-2: Cross-document consistency check
  └── P7-3: Final acceptance validation
```

### 4.2 Detailed Module Breakdown

#### Phase 1: Role Scope Finalization

**P1-1: Tester Role Boundary Confirmation**
- **Objective**: Define tester responsibilities and boundaries aligned with role-definition.md
- **Inputs**: role-definition.md (Section 3: tester), package-spec.md
- **Outputs**: role-scope.md (in specs/005-tester-core/)
- **Content**:
  - Mission statement
  - In-scope / out-of-scope boundaries
  - Trigger conditions
  - Required/optional inputs
  - Expected outputs
  - Escalation rules
  - Dependencies on other roles
- **Acceptance Criteria**: No conflicts with role-definition.md; upstream/downstream roles can understand
- **Risks**: May overlap with developer self-check responsibilities
- **Failure Mode**: Unclear boundary between tester verification and developer self-check

**P1-2: Upstream Interface Definition**
- **Objective**: Define how tester consumes developer outputs from 004-developer-core
- **Inputs**: specs/004-developer-core/contracts/, specs/004-developer-core/downstream-interfaces.md
- **Outputs**: upstream-consumption.md (in specs/005-tester-core/)
- **Content**:
  - Mapping from developer artifacts to tester inputs
  - Field-by-field consumption guide
  - Handling of known_issues and risks
  - Distinguishing self-check from independent verification
- **Acceptance Criteria**: tester knows how to read and use implementation-summary, self-check-report, bugfix-report
- **Risks**: Missing fields or incompatible schemas between 004 and 005
- **Failure Mode**: Cannot derive test scope from developer outputs

**P1-3: Downstream Interface Definition**
- **Objective**: Define tester handoff to reviewer and acceptance layer
- **Inputs**: role-definition.md (Section 4: reviewer), io-contract.md
- **Outputs**: downstream-interfaces.md (in specs/005-tester-core/)
- **Content**:
  - What reviewer receives from tester
  - Evidence quality requirements
  - Failure classification expectations
  - Coverage gap disclosure requirements
- **Acceptance Criteria**: Each downstream consumer has clear consumption guidance
- **Risks**: Reviewer expectations may not align with tester capabilities
- **Failure Mode**: Reviewer cannot use tester outputs for approval judgment

---

#### Phase 2: Skill Formalization

**P2-1: unit-test-design Formalization**

Existing SKILL.md requires enhancement:

| Enhancement | Current Status | Target Status |
|-------------|----------------|---------------|
| Examples | 2 detailed examples | At least 2 formal examples |
| Anti-examples | None | At least 2 anti-examples |
| Checklists | Embedded in SKILL.md | Independent checklist files |
| Failure modes | Table format | Complete documentation + handling strategies |
| Contract alignment | Mentions schema | Aligned with artifact contracts |
| Role boundaries | Implicit | Explicit tester role boundaries |

**Key additions needed**:
- Explicit BR-002 compliance (distinguish from developer self-check)
- BR-004 integration (failure classification in test output)
- Examples showing consumption of implementation-summary

**P2-2: regression-analysis Formalization**

Existing SKILL.md requires enhancement:

| Enhancement | Current Status | Target Status |
|-------------|----------------|---------------|
| Examples | 2 examples | At least 2 formal examples |
| Anti-examples | None | At least 2 anti-examples |
| Checklists | Embedded | Independent checklist files |
| Upstream integration | Generic | Specific to changed_files consumption |
| Contract alignment | Mentions schema | Aligned with regression-risk-report contract |

**Key additions needed**:
- BR-006 compliance (regression thinking as mandatory)
- Explicit handling of developer-identified risks
- Integration with bugfix-report for root-cause-aware testing

**P2-3: edge-case-matrix Formalization**

Existing SKILL.md requires enhancement:

| Enhancement | Current Status | Target Status |
|-------------|----------------|---------------|
| Examples | 2 examples (login, pagination) | At least 2 formal examples |
| Anti-examples | None | At least 2 anti-examples |
| Checklists | Analysis/planning/verification | Independent checklist files |
| BR-005 integration | Implicit | Explicit boundary coverage as mandatory |
| Contract alignment | None | Map to verification-report.edge_cases_checked |

**Key additions needed**:
- BR-005 compliance (edge cases mandatory, not optional)
- Examples showing happy-path-only anti-pattern detection
- Integration with unit-test-design workflow

---

#### Phase 3: Artifact Contract Establishment

**P3-1: test-scope-report Contract**
- **Objective**: Define complete schema for test-scope-report
- **Output**: contracts/test-scope-report-contract.md
- **Content**:
  - Required fields (per spec.md AC-001)
  - Field validation rules
  - Upstream artifact references (implementation-summary fields)
  - Example valid instances
  - Consumer guidance (reviewer, acceptance)
- **Acceptance Criteria**: Fields match spec.md AC-001; can be consumed by reviewer
- **Risks**: Scope definition may be too rigid for varying test scenarios
- **Failure Mode**: Cannot derive scope from developer outputs

**P3-2: verification-report Contract**
- **Objective**: Define complete schema for verification-report
- **Output**: contracts/verification-report-contract.md
- **Content**:
  - Required fields (per spec.md AC-002)
  - Failure classification model (BR-004)
  - Evidence format specifications
  - Confidence level definitions (FULL/PARTIAL/LOW)
  - Recommendation vocabulary
- **Acceptance Criteria**: Supports honest reporting; distinguishes pass/fail/blocked/gap
- **Risks**: Evidence format may be too restrictive
- **Failure Mode**: Evidence quality insufficient for reviewer approval

**P3-3: regression-risk-report Contract**
- **Objective**: Define complete schema for regression-risk-report
- **Output**: contracts/regression-risk-report-contract.md
- **Content**:
  - Required fields (per spec.md AC-003)
  - Risk ranking methodology
  - Recommendation vocabulary (ACCEPT_RISK/REWORK/ESCALATE)
  - Follow-up action specifications
- **Acceptance Criteria**: Clearly identifies regression surfaces and untested areas
- **Risks**: May overlap with 003-architect-core risk outputs
- **Failure Mode**: Missing adjacent impact assessment

---

#### Phase 4: Validation & Quality Layer

**P4-1: Upstream-consumability Checklist**
- **Objective**: Ensure tester correctly consumes developer outputs
- **Output**: validation/upstream-consumability-checklist.md
- **Check Items**:
  - [ ] implementation-summary.goal_alignment read and understood
  - [ ] changed_files mapped to test surface
  - [ ] known_issues acknowledged (not treated as false positives)
  - [ ] risks prioritized for testing
  - [ ] self-check-report distinguished from independent verification
  - [ ] bugfix-report.root_cause used for regression design
- **Acceptance Criteria**: All upstream artifacts can be consumed systematically
- **Risks**: Developer output format may vary
- **Failure Mode**: Test scope derived without proper upstream consumption

**P4-2: Downstream-consumability Checklist**
- **Objective**: Ensure outputs can be consumed by downstream
- **Output**: validation/downstream-consumability-checklist.md
- **By Downstream Role**:
  - **reviewer**: Can judge quality from verification-report; can identify gaps
  - **acceptance**: Can understand pass/fail/gap from summary; can assess risk
  - **developer**: Can understand actionable failures from classification
- **Acceptance Criteria**: Each downstream role has clear consumption path
- **Risks**: Downstream expectations may exceed tester scope
- **Failure Mode**: Reports filed but not actionable

**P4-3: Failure-mode Checklist**
- **Objective**: Identify common tester failure patterns
- **Output**: validation/failure-mode-checklist.md
- **Content** (per spec.md Section 11):
  - 10 anti-patterns with detection methods
  - Early warning signals for each pattern
  - Remediation strategies
  - Prevention measures
- **Patterns to Cover**:
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
- **Acceptance Criteria**: Each pattern detectable and preventable
- **Risks**: Checklist may be too long to be practical
- **Failure Mode**: Patterns occur but go undetected

**P4-4: Anti-pattern Guidance**
- **Objective**: Provide comprehensive anti-pattern documentation
- **Output**: validation/anti-pattern-guidance.md
- **Content**:
  - Definition of each anti-pattern
  - Real-world examples (sanitized)
  - Detection methods
  - Prevention strategies
  - Remediation steps
- **Acceptance Criteria**: Guidance actionable by tester role
- **Risks**: May overlap with general testing best practices
- **Failure Mode**: Anti-patterns occur despite guidance

---

#### Phase 5: Educational & Example Layer

**P5-1: Examples for Each Skill**
- **Objective**: Provide complete examples for each skill
- **Output Structure**:
  ```
  .opencode/skills/tester/
  ├── unit-test-design/
  │   └── examples/
  │       ├── example-001-auth-service-test-design.md
  │       └── example-002-api-validation-test-design.md
  ├── regression-analysis/
  │   └── examples/
  │       ├── example-001-login-lockout-regression.md
  │       └── example-002-refactoring-regression.md
  └── edge-case-matrix/
      └── examples/
          ├── example-001-user-input-boundaries.md
          └── example-002-payment-calculation-edges.md
  ```
- **Content Requirements**:
  - Realistic scenario
  - Complete input context (simulated developer outputs)
  - Step-by-step skill application
  - Complete output artifact
  - Notes on key decisions
- **Acceptance Criteria**: Examples demonstrate correct role behavior
- **Risks**: Examples may not cover all scenarios
- **Failure Mode**: Users cannot extrapolate from examples

**P5-2: Anti-examples for Each Skill**
- **Objective**: Demonstrate common mistakes
- **Output Structure**:
  ```
  .opencode/skills/tester/
  ├── unit-test-design/
  │   └── anti-examples/
  │       ├── anti-example-001-happy-path-only.md
  │       └── anti-example-002-uncoupled-tests.md
  ├── regression-analysis/
  │   └── anti-examples/
  │       ├── anti-example-001-impact-underestimation.md
  │       └── anti-example-002-no-historical-context.md
  └── edge-case-matrix/
      └── anti-examples/
          ├── anti-example-001-boundary-omission.md
          └── anti-example-002-false-confidence.md
  ```
- **Content Requirements**:
  - What went wrong
  - Why it's a problem
  - How to detect
  - How to fix
- **Acceptance Criteria**: Anti-examples clearly illustrate failure modes
- **Risks**: May be confused with correct examples
- **Failure Mode**: Same mistakes repeated

**P5-3: Templates/Checklists for Each Skill**
- **Objective**: Provide reusable templates
- **Output Structure**:
  ```
  .opencode/skills/tester/
  ├── unit-test-design/
  │   └── checklists/
  │       └── test-design-checklist.md
  ├── regression-analysis/
  │   └── checklists/
  │       └── regression-analysis-checklist.md
  └── edge-case-matrix/
      └── checklists/
          └── edge-case-matrix-checklist.md
  ```
- **Acceptance Criteria**: Templates usable without modification across features
- **Risks**: May be too generic for specific scenarios
- **Failure Mode**: Checklists ignored or incompletely applied

---

#### Phase 6: Workflow & Package Integration

**P6-1: Role-scope.md Documentation**
- **Objective**: Complete tester role scope document
- **Output**: specs/005-tester-core/role-scope.md
- **Content**:
  - Mission
  - In Scope / Out of Scope
  - Trigger conditions
  - Required / Optional inputs
  - Expected outputs
  - Escalation rules
  - Upstream / Downstream dependencies
- **Acceptance Criteria**: Aligns with role-definition.md Section 3
- **Risks**: May conflict with existing role-definition.md if not aligned
- **Failure Mode**: Role boundaries unclear in practice

**P6-2: Package Governance Updates Check**
- **Objective**: Check/update related governance documents
- **Documents to Check/Update**:
  - README.md (Skills inventory, Workflow, Feature status)
  - AGENTS.md (Role semantics if needed)
  - package-spec.md (Skills section - tester skills status)
- **Acceptance Criteria**: Governance documents reflect 005 completion
- **Risks**: Forgotten governance updates cause inconsistency
- **Failure Mode**: README says "pending" when feature is complete

**P6-3: Feature Completion Preparation**
- **Objective**: Prepare completion-report.md
- **Output**: specs/005-tester-core/completion-report.md
- **Content**:
  - Deliverables checklist
  - Traceability matrix to spec
  - Open questions resolved/unresolved
  - Known gaps (future advanced skills)
  - Input value for 006-reviewer-core
- **Acceptance Criteria**: Honest status reporting; no hidden gaps
- **Risks**: Overstating completion
- **Failure Mode**: Partial completion reported as complete

---

#### Phase 7: Consistency Review

**P7-1: Governance Document Sync**
- **Objective**: Ensure all governance documents are consistent
- **Check Items**:
  - [ ] README.md terminology consistent with role-definition.md
  - [ ] AGENTS.md constraints consistent with package-spec.md
  - [ ] quality-gate.md tester gate aligned with this feature
  - [ ] io-contract.md artifact types include tester artifacts
- **Acceptance Criteria**: No contradictions across governance docs
- **Risks**: Changes cascade requiring updates to multiple docs
- **Failure Mode**: Governance drift

**P7-2: Cross-document Consistency Check**
- **Objective**: Verify no contradictions between documents
- **Method**: Use governance sync rule (AGENTS.md)
- **Check Areas**:
  - 6-role vs 3-skill semantic consistency
  - Feature status across README, plan, completion-report
  - Artifact field definitions consistent across contracts
- **Acceptance Criteria**: Single source of truth for each fact
- **Risks**: Inconsistencies discovered late
- **Failure Mode**: Conflicting information in different docs

**P7-3: Final Acceptance Validation**
- **Objective**: Validate against spec.md acceptance criteria
- **Validation Items**:
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
- **Acceptance Criteria**: All AC items satisfied with evidence
- **Risks**: AC interpretation may differ
- **Failure Mode**: Feature accepted with hidden gaps

---

## 5. Data Flow

### 5.1 Standard Feature Verification Flow

```
Developer Artifacts
         │
         ▼
┌─────────────────────────┐
│   tester: Read developer   │
│   outputs                  │
│   - implementation-summary │
│   - self-check-report      │
│   - changed_files          │
│   - risks                  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   tester: test-scope       │
│   derivation               │
│   - Goal alignment         │
│   - Risk prioritization    │
│   - In/out scope           │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   tester: unit-test-design │
│   + edge-case-matrix       │
│   - Test cases             │
│   - Boundary coverage      │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   tester: test execution   │
│   - Run tests              │
│   - Collect evidence       │
│   - Classify results       │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   tester: regression-      │
│   analysis                 │
│   - Impact assessment      │
│   - Risk evaluation        │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Output Artifacts         │
│   - test-scope-report      │
│   - verification-report    │
│   - regression-risk-report │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Downstream Handoff       │
│   - reviewer               │
│   - acceptance             │
│   - developer (failures)   │
└─────────────────────────┘
```

### 5.2 Bugfix Verification Flow

```
Bugfix Report + Implementation
         │
         ▼
┌─────────────────────────┐
│   tester: root-cause-      │
│   aware design             │
│   - Repro check design     │
│   - Regression prevention  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   tester: verify original  │
│   issue fixed              │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   tester: non-regression   │
│   verification             │
└─────────────────────────┘
         │
         ▼
   Output: verification-report
   Output: regression-risk-report
```

### 5.3 Escalation Flow

```
Testing Blocker
         │
         ▼
┌─────────────────────────┐
│   Can test with          │
│   available info?        │
└─────────────────────────┘
    │           │
   Yes          No
    │           │
    ▼           ▼
Document    Escalate to
assumptions architect /
            developer /
            management
```

---

## 6. Failure Handling

### 6.1 Skill-Level Failure Modes

| Skill | Failure Mode | Detection | Recovery |
|-------|--------------|-----------|----------|
| unit-test-design | Happy-path-only | Checklist: boundary coverage assessment | Redesign with edge-case-matrix |
| unit-test-design | Self-check confusion | Checklist: explicit distinction from developer self-check | Clarify independent verification |
| regression-analysis | Impact underestimation | Checklist: indirect/potential impact assessment | Expand regression surface |
| regression-analysis | No historical context | Checklist: bugfix-report.root_cause review | Research similar changes |
| edge-case-matrix | Boundary omission | Checklist: parameter-by-parameter boundary analysis | Add missing boundaries |
| edge-case-matrix | False confidence | Checklist: honest gap disclosure | Report partial coverage |

### 6.2 Artifact-Level Failure Modes

| Artifact | Failure Mode | Detection | Recovery |
|----------|--------------|-----------|----------|
| test-scope-report | Missing upstream references | input_artifacts field empty | Add upstream citations |
| test-scope-report | No out-of-scope items | out_of_scope_items empty | Document exclusions |
| verification-report | Unclassified failures | failure_classification empty | Classify per BR-004 |
| verification-report | Missing coverage gaps | coverage_gaps empty | Document untested areas |
| regression-risk-report | No untested areas listed | untested_regression_areas empty | Identify and document gaps |
| regression-risk-report | Vague risk ranking | No severity/likelihood | Quantify risks |

### 6.3 Escalation Rules

Escalate (ESCALATE) when:
- Spec vs implementation conflict prevents test design
- Developer outputs insufficient for scope derivation
- Test environment prevents trustworthy results
- Multiple test failures with unclear root cause
- Bugfix root cause suggests design-level issue

---

## 7. Validation Strategy

### 7.1 Skill-Level Validation

Each skill must pass:

```yaml
validation_checklist:
  skill_level:
    - inputs_defined: true
    - outputs_complete: true
    - checklists_executable: true
    - examples_exist: true
    - anti_examples_exist: true
    - role_boundaries_clear: true
```

### 7.2 Artifact-Level Validation

Each artifact must pass:

```yaml
validation_checklist:
  artifact_level:
    - required_fields_present: true
    - downstream_consumable: true
    - no_hidden_assumptions: true
    - upstream_references_clear: true
```

### 7.3 Cross-Role Validation

Must verify downstream consumability:

```yaml
validation_checklist:
  cross_role:
    - reviewer_can_judge_quality: true
    - acceptance_can_assess_risk: true
    - developer_can_act_on_failures: true
```

### 7.4 Consistency Validation

Must verify alignment with governance docs:

```yaml
validation_checklist:
  consistency:
    - package_spec_aligned: true
    - role_definition_aligned: true
    - io_contract_aligned: true
    - quality_gate_aligned: true
    - spec_ac_criteria_met: true
```

---

## 8. Risks / Tradeoffs

### 8.1 Identified Risks

| Risk ID | Description | Level | Mitigation |
|---------|-------------|-------|------------|
| R-001 | Overlap with existing tester skills (may conflict) | Medium | Enhance existing, don't replace |
| R-002 | 004-developer-core interface mismatch | Medium | Close coordination with 004 outputs |
| R-003 | Reviewer expectations exceed tester scope | Medium | Clear downstream interface definition |
| R-004 | Test evidence quality hard to standardize | Medium | Flexible evidence format with required fields |
| R-005 | Honest gap reporting seen as failure | Low | Culture/documentation emphasizing honesty |

### 8.2 Tradeoffs

| Decision | Chosen Approach | Alternative | Rationale |
|----------|-----------------|-------------|-----------|
| Skill enhancement vs rewrite | Enhance existing | Complete rewrite | Existing skills have good foundation |
| Evidence format | Structured + freeform | Pure structured | Balance standardization with flexibility |
| Failure classification | 5 categories (BR-004) | Simpler 2-3 categories | Sufficient granularity without complexity |
| Confidence levels | 3 levels (FULL/PARTIAL/LOW) | Binary pass/fail | Honest partial verification reporting |
| Example count | 2 per skill | 3 per skill | Balance completeness with effort |

### 8.3 Assumptions

| Assumption ID | Description | Impact if Wrong |
|---------------|-------------|-----------------|
| AS-001 | 004-developer-core is complete | Missing upstream interface definitions |
| AS-002 | 6-role model is authoritative | Need semantic re-alignment |
| AS-003 | Existing tester skills are baseline | Need to develop from scratch |
| AS-004 | Reviewer role will follow 005 | Interface may need adjustment |

---

## 9. Requirement Traceability

### 9.1 Spec to Plan Mapping

| Spec Requirement | Plan Section | Task IDs |
|------------------|--------------|----------|
| BR-001: Consume Developer Evidence | Phase 1 (Upstream), Phase 4 | P1-2, P4-1 |
| BR-002: Self-Check Not Verification | Phase 2 (Skills), Phase 3 | P2-1, P2-2, P2-3 |
| BR-003: Coverage Boundaries | Phase 3 (Artifact Contracts) | P3-1, P3-2 |
| BR-004: Failure Classification | Phase 3 (Contracts), Phase 4 | P3-2, P4-3 |
| BR-005: Edge Cases Mandatory | Phase 2 (Skills), Phase 4 | P2-3, P4-4 |
| BR-006: Regression Thinking | Phase 2 (Skills) | P2-2 |
| BR-007: Honesty Over Confidence | Phase 3 (Contracts), Phase 5 | P3-2, P5-2 |
| BR-008: No Business Logic Mutation | Phase 1 (Role Scope) | P1-1 |
| BR-009: 6-Role Semantics | Phase 1, Phase 7 | P1-1, P7-1 |

### 9.2 Acceptance Criteria to Tasks Mapping

| Acceptance Criteria | Tasks |
|---------------------|-------|
| AC-001: Feature Package Complete | All phases |
| AC-002: Tester Role Scope Formalized | P1-1, P6-1 |
| AC-003: Core Skills Formally Implemented | P2-1, P2-2, P2-3 |
| AC-004: Artifact Contracts Defined | P3-1, P3-2, P3-3 |
| AC-005: Upstream Consumption Logic Clear | P1-2, P4-1 |
| AC-006: Downstream Evidence Logic Clear | P1-3, P4-2 |
| AC-007: Skill Assets Complete | P5-1, P5-2, P5-3 |
| AC-008: Failure Classification Model Present | P3-2, P4-3 |
| AC-009: Anti-Pattern Guidance Present | P4-4, P5-2 |
| AC-010: Scope Boundary Maintained | All phases (by design) |
| AC-011: First-Class Verification Role | All phases (by design) |

---

## 10. Implementation Order

### 10.1 Recommended Execution Sequence

```
Day 1:
├── Phase 1: Role Scope Finalization (1 day)
│   └── Parallel: P1-1, P1-2, P1-3

Day 2-3:
├── Phase 2: Skill Formalization (2 days)
│   ├── P2-1: unit-test-design (0.7 days)
│   ├── P2-2: regression-analysis (0.7 days)
│   └── P2-3: edge-case-matrix (0.6 days)

Day 4:
├── Phase 3: Artifact Contract Establishment (1 day)
│   └── Parallel: P3-1, P3-2, P3-3

Day 5:
├── Phase 4: Validation & Quality Layer (1 day)
│   └── Sequential: P4-1 → P4-2 → P4-3 → P4-4

Day 6:
├── Phase 5: Educational & Example Layer (1 day)
│   └── Parallel: P5-1, P5-2, P5-3

Day 7 (Morning):
├── Phase 6: Workflow & Package Integration (0.5 day)
│   └── Sequential: P6-1 → P6-2 → P6-3

Day 7 (Afternoon):
└── Phase 7: Consistency Review (0.5 day)
    └── Sequential: P7-1 → P7-2 → P7-3
```

### 10.2 Parallel-Safe Tasks

| Phase | Parallel-Safe Tasks |
|-------|---------------------|
| Phase 1 | P1-1, P1-2, P1-3 (parallel) |
| Phase 2 | P2-1, P2-2, P2-3 (parallel) |
| Phase 3 | P3-1, P3-2, P3-3 (parallel) |
| Phase 5 | P5-1, P5-2, P5-3 (parallel) |

### 10.3 Dependencies

```
P1-1, P1-2, P1-3 → P2-1, P2-2, P2-3
P2-1 → P3-2
P2-2 → P3-3
P2-3 → P3-1, P3-2
P3-1, P3-2, P3-3 → P4-1, P4-2
P4-1, P4-2 → P4-3, P4-4
P4-3, P4-4 → P5-1, P5-2, P5-3
P5-1, P5-2, P5-3 → P6-1
P6-1 → P6-2 → P6-3
P6-3 → P7-1 → P7-2 → P7-3
```

---

## 11. Open Questions

### 11.1 From Spec (OQ-001, OQ-002, OQ-003, OQ-004)

| OQ ID | Question | Impact | Recommended Resolution |
|-------|----------|--------|------------------------|
| OQ-001 | Recommendation vocabulary granularity? | Status reporting | Compact primary vocabulary + optional qualifiers |
| OQ-002 | Evidence format standardization? | Artifact structure | Structured fields + freeform details |
| OQ-003 | Automated vs manual verification distinction? | Report format | Mandatory distinction in verification-report |
| OQ-004 | task-executor compatibility? | Legacy support | Minimal compatibility notes |

### 11.2 New Open Questions from Planning

| OQ ID | Question | Impact | Temporary Assumption |
|-------|----------|--------|---------------------|
| OQ-005 | Should tester create actual test code or just design? | Scope | Design + specify; actual test code creation as future enhancement |
| OQ-006 | How to handle flaky test detection? | Quality | Document in anti-patterns; dedicated skill in future |

---

## 12. Next Steps

### 12.1 Immediate Actions

1. **Create tasks.md**: Convert this plan to executable task list
2. **Confirm open questions**: Resolve OQ-001~OQ-006 decisions
3. **Begin Phase 1**: Role Scope Finalization

### 12.2 Dependencies on Other Features

| Dependency | Feature | Status |
|------------|---------|--------|
| 004-developer-core | Completed | ✅ |
| 003-architect-core | Completed | ✅ |
| 002-role-model-alignment | Completed | ✅ |
| 002b-governance-repair | Completed | ✅ |
| 006-reviewer-core | Planned | Waiting for this feature |

### 12.3 Deliverables Checklist

- [ ] `specs/005-tester-core/plan.md` (this document)
- [ ] `specs/005-tester-core/tasks.md`
- [ ] `specs/005-tester-core/role-scope.md`
- [ ] `specs/005-tester-core/upstream-consumption.md`
- [ ] `specs/005-tester-core/downstream-interfaces.md`
- [ ] `specs/005-tester-core/contracts/test-scope-report-contract.md`
- [ ] `specs/005-tester-core/contracts/verification-report-contract.md`
- [ ] `specs/005-tester-core/contracts/regression-risk-report-contract.md`
- [ ] `.opencode/skills/tester/unit-test-design/` (enhanced)
- [ ] `.opencode/skills/tester/regression-analysis/` (enhanced)
- [ ] `.opencode/skills/tester/edge-case-matrix/` (enhanced)
- [ ] `specs/005-tester-core/validation/` (checklists)
- [ ] `specs/005-tester-core/examples/` (example docs)
- [ ] `specs/005-tester-core/completion-report.md`

---

## References

- `specs/005-tester-core/spec.md` - Feature specification
- `specs/004-developer-core/` - Upstream feature providing implementation artifacts
- `package-spec.md` - Package governance specification
- `role-definition.md` - 6-role definition
- `io-contract.md` - Input/output contract
- `quality-gate.md` - Quality gate rules
- `docs/architecture/role-model-evolution.md` - Role model evolution strategy
- `docs/infra/migration/skill-to-role-migration.md` - Migration mapping details
- `.opencode/skills/tester/unit-test-design/SKILL.md` - Existing skill reference
- `.opencode/skills/tester/regression-analysis/SKILL.md` - Existing skill reference
- `.opencode/skills/tester/edge-case-matrix/SKILL.md` - Existing skill reference