# 006-reviewer-core Implementation Plan

## Document Status
- **Feature ID**: `006-reviewer-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-26
- **Based On**: `specs/006-reviewer-core/spec.md` v1.0.0

---

## 1. Architecture Summary

This feature implements the complete core capability system for the `reviewer` role, including:

1. **3 Core Skills**: `code-review-checklist`, `spec-implementation-diff`, `reject-with-actionable-feedback`
2. **3 Standard Artifacts**: `review-findings-report`, `acceptance-decision-record`, `actionable-feedback-report`
3. **Complete Quality Assurance System**: Checklists, Anti-examples, Failure modes, Validation gates
4. **Upstream/Downstream Role Interfaces**: Consumption contracts from architect/developer/tester (upstream) and handoff to acceptance/docs/security (downstream)
5. **AH-006 Governance Alignment**: Explicit checking against canonical governance documents

This feature is not a bootstrap skeleton, but the complete first-phase implementation of the reviewer role.

---

## 2. Inputs from Spec

### 2.1 Core Requirements (from spec.md)

| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| BR-001 | Reviewer Must Consume Upstream Evidence | Critical |
| BR-002 | Self-Check Is Not Independent Review | Critical |
| BR-003 | Every Review Must Produce Explicit Decision State | Critical |
| BR-004 | Findings Must Be Severity-Classified | Critical |
| BR-005 | Rejection Must Be Actionable | Critical |
| BR-006 | Governance Alignment Checking Is Mandatory | Critical |
| BR-007 | Reviewer Must Not Mutate Production Code | Critical |
| BR-008 | Scope Creep Detection Is Required | Critical |
| BR-009 | Status Truthfulness Must Be Verified | Critical |
| BR-010 | Use 6-Role Formal Semantics | Critical |

### 2.2 Skill Requirements (from spec.md)

| Skill ID | Skill Name | Purpose |
|----------|------------|---------|
| SKILL-001 | code-review-checklist | Provide systematic checklist-driven review framework |
| SKILL-002 | spec-implementation-diff | Compare specified versus implemented, including governance alignment |
| SKILL-003 | reject-with-actionable-feedback | Enable structured rejection with executable remediation guidance |

### 2.3 Artifact Requirements (from spec.md)

| Artifact ID | Artifact Name | Required Fields Count |
|-------------|---------------|----------------------|
| AC-001 | review-findings-report | 11 fields |
| AC-002 | acceptance-decision-record | 9 fields |
| AC-003 | actionable-feedback-report | 10 fields |

### 2.4 Validation Requirements (from spec.md)

| Validation ID | Type | Check Items |
|---------------|------|-------------|
| VM-001 | Skill-Level | Inputs, outputs, checklists, examples, anti-examples, role boundaries |
| VM-002 | Artifact-Level | Required fields, downstream consumable, severity discipline |
| VM-003 | Governance Alignment | Canonical documents, role boundaries, terminology, path resolution |
| VM-004 | Decision Quality | Decision state, rationale, blocking issues, residual risks |

---

## 3. Technical Constraints

### 3.1 Governance Alignment Constraints

| Constraint | Source | Rationale |
|------------|--------|-----------|
| C-001: Use 6-role formal terminology | AGENTS.md, role-definition.md | Maintain governance consistency |
| C-002: Explicitly consume 003/004/005 outputs | spec.md BR-001 | Establish upstream/downstream contract |
| C-003: Follow I/O Contract | io-contract.md | Ensure management layer can invoke |
| C-004: Satisfy Quality Gate | quality-gate.md | Ensure output quality |
| C-005: Maintain role purity | BR-007 | Reviewer must not silently fix code |
| C-006: AH-006 compliance mandatory | role-definition.md Section 4 | Governance alignment checking required |

### 3.2 Directory Structure Constraints

```
.opencode/skills/reviewer/
├── code-review-checklist/
│   ├── SKILL.md
│   ├── examples/
│   │   └── example-1-checklist-review.md
│   ├── anti-examples/
│   │   └── anti-example-1-vague-review.md
│   └── checklists/
│       └── review-checklist.md
├── spec-implementation-diff/
│   ├── SKILL.md
│   ├── examples/
│   ├── anti-examples/
│   └── checklists/
└── reject-with-actionable-feedback/
    ├── SKILL.md
    ├── examples/
    ├── anti-examples/
    └── checklists/
```

### 3.3 Artifact Storage Constraints

- Artifacts stored in task/feature working directory
- Follow feature-level traceability principles
- File naming convention: `review-findings-report.md`, `acceptance-decision-record.md`, `actionable-feedback-report.md`

### 3.4 Compatibility Constraints

- Existing reviewer skills already have SKILL.md files (bootstrap level)
- Enhance existing skills rather than replacing
- Do not break existing review workflows
- Align with AH-006 enhancements already in spec-implementation-diff

---

## 4. Module Decomposition

### 4.1 Phase Overview

```
Phase 1: Role Scope Finalization (1 day)
  ├── P1-1: Reviewer role boundary confirmation
  ├── P1-2: Upstream interface from architect/developer/tester definition
  └── P1-3: Downstream interface to acceptance/docs/security definition

Phase 2: Skill Formalization (2 days)
  ├── P2-1: code-review-checklist formalization
  ├── P2-2: spec-implementation-diff formalization (enhance AH-006)
  └── P2-3: reject-with-actionable-feedback formalization

Phase 3: Artifact Contract Establishment (1 day)
  ├── P3-1: review-findings-report contract
  ├── P3-2: acceptance-decision-record contract
  └── P3-3: actionable-feedback-report contract

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

**P1-1: Reviewer Role Boundary Confirmation**
- **Objective**: Define reviewer responsibilities and boundaries aligned with role-definition.md Section 4
- **Inputs**: role-definition.md (Section 4: reviewer), package-spec.md
- **Outputs**: role-scope.md (in specs/006-reviewer-core/)
- **Content**:
  - Mission statement (independent review, acceptance judgment)
  - In-scope / out-of-scope boundaries
  - Trigger conditions
  - Required/optional inputs from architect/developer/tester
  - Expected outputs
  - Escalation rules (when to escalate vs reject)
  - AH-006 governance alignment responsibilities
- **Acceptance Criteria**: No conflicts with role-definition.md; upstream/downstream roles can understand
- **Risks**: May overlap with tester verification responsibilities
- **Failure Mode**: Unclear boundary between reviewer judgment and tester evidence evaluation

**P1-2: Upstream Interface Definition**
- **Objective**: Define how reviewer consumes architect, developer, and tester outputs
- **Inputs**: 
  - specs/003-architect-core/contracts/
  - specs/004-developer-core/contracts/
  - specs/005-tester-core/contracts/
  - specs/005-tester-core/downstream-interfaces.md
- **Outputs**: upstream-consumption.md (in specs/006-reviewer-core/)
- **Content**:
  - Mapping from architect artifacts (design-note, module-boundaries)
  - Mapping from developer artifacts (implementation-summary, self-check-report)
  - Mapping from tester artifacts (test-scope-report, verification-report)
  - Field-by-field consumption guide
  - BR-002 compliance: Self-check as input, not substitute
- **Acceptance Criteria**: Reviewer knows how to read all upstream artifacts
- **Risks**: Missing fields or incompatible schemas between features
- **Failure Mode**: Cannot derive review scope from upstream outputs

**P1-3: Downstream Interface Definition**
- **Objective**: Define reviewer handoff to acceptance, docs, and security
- **Inputs**: role-definition.md (Sections 5, 6: docs, security), io-contract.md
- **Outputs**: downstream-interfaces.md (in specs/006-reviewer-core/)
- **Content**:
  - What acceptance receives from reviewer
  - What docs receives from reviewer
  - What security receives from reviewer
  - Decision state semantics (accept/reject/accept-with-conditions/needs-clarification)
  - Evidence quality requirements per BR-004
- **Acceptance Criteria**: Each downstream consumer has clear consumption guidance
- **Risks**: Acceptance expectations may not align with reviewer capabilities
- **Failure Mode**: Acceptance cannot use reviewer outputs for final decision

---

#### Phase 2: Skill Formalization

**P2-1: code-review-checklist Formalization**

Existing SKILL.md (462 lines) requires enhancement:

| Enhancement | Current Status | Target Status |
|-------------|----------------|---------------|
| Examples | 3 detailed examples | At least 2 formal examples |
| Anti-examples | None | At least 2 anti-examples |
| Checklists | Embedded in SKILL.md | Independent checklist files |
| Failure modes | Table format | Complete documentation + handling strategies |
| Contract alignment | Output format defined | Aligned with review-findings-report contract |
| AH-006 integration | None | Add governance alignment section |

**Key additions needed**:
- Explicit BR-002 compliance (distinguish from developer self-check)
- BR-004 integration (severity classification discipline)
- BR-006 governance alignment section
- Examples showing consumption of upstream artifacts

**P2-2: spec-implementation-diff Formalization**

Existing SKILL.md (568 lines) already has AH-006 governance alignment:
- ✅ Governance Alignment section present
- ✅ Canonical document checking
- ✅ Cross-document consistency checks
- ✅ Path resolution verification
- ✅ Status truthfulness checks

Enhancement needed:

| Enhancement | Current Status | Target Status |
|-------------|----------------|---------------|
| Examples | 3 examples | At least 2 formal examples |
| Anti-examples | None | At least 2 anti-examples |
| Checklists | Embedded | Independent checklist files |
| Contract alignment | Output format defined | Aligned with review-findings-report |

**Key additions needed**:
- Examples showing governance drift detection
- Anti-examples showing governance check skipping
- Integration with acceptance-decision-record workflow

**P2-3: reject-with-actionable-feedback Formalization**

Existing SKILL.md (532 lines) requires enhancement:

| Enhancement | Current Status | Target Status |
|-------------|----------------|---------------|
| Examples | 3 detailed examples | At least 2 formal examples |
| Anti-examples | None | At least 2 anti-examples |
| Checklists | Embedded | Independent checklist files |
| Contract alignment | Output format defined | Aligned with actionable-feedback-report contract |
| Closure criteria | Present | Enhanced with verification methods |

**Key additions needed**:
- BR-005 compliance examples
- Anti-examples showing vague rejection
- Integration with developer rework workflow

---

#### Phase 3: Artifact Contract Establishment

**P3-1: review-findings-report Contract**
- **Objective**: Define complete schema for review-findings-report
- **Output**: contracts/review-findings-report-contract.md
- **Content**:
  - Required fields (11 per spec.md AC-001)
  - Severity classification model (blocker/major/minor/note)
  - Governance alignment status field
  - Evidence reference format
  - Consumer guidance (acceptance, docs, security)
- **Acceptance Criteria**: Fields match spec.md; supports governance alignment reporting
- **Risks**: Governance conflicts may be hard to categorize
- **Failure Mode**: Cannot capture governance drift findings

**P3-2: acceptance-decision-record Contract**
- **Objective**: Define complete schema for acceptance-decision-record
- **Output**: contracts/acceptance-decision-record-contract.md
- **Content**:
  - Required fields (9 per spec.md AC-002)
  - Decision state definitions (accept/accept-with-conditions/reject/needs-clarification)
  - Rationale format requirements
  - Downstream recommendation vocabulary
- **Acceptance Criteria**: Supports all 4 decision states with clear semantics
- **Risks**: Decision state semantics may need clarification
- **Failure Mode**: Ambiguous decision states

**P3-3: actionable-feedback-report Contract**
- **Objective**: Define complete schema for actionable-feedback-report
- **Output**: contracts/actionable-feedback-report-contract.md
- **Content**:
  - Required fields (10 per spec.md AC-003)
  - Must-fix vs should-fix classification
  - Remediation guidance format
  - Re-review criteria specification
  - Closure checklist format
- **Acceptance Criteria**: Developer can execute remediation from feedback
- **Risks**: Remediation guidance may be too specific or too vague
- **Failure Mode**: Developer cannot act on feedback

---

#### Phase 4: Validation & Quality Layer

**P4-1: Upstream-Consumability Checklist**
- **Objective**: Ensure reviewer correctly consumes upstream artifacts
- **Output**: validation/upstream-consumability-checklist.md
- **Check Items**:
  - [ ] architect artifacts read (design-note, module-boundaries)
  - [ ] developer artifacts read (implementation-summary, self-check-report)
  - [ ] tester artifacts read (test-scope-report, verification-report)
  - [ ] BR-002 compliance (self-check distinction)
  - [ ] Missing data handling documented
- **Acceptance Criteria**: All upstream artifacts can be consumed systematically

**P4-2: Downstream-Consumability Checklist**
- **Objective**: Ensure outputs can be consumed by downstream
- **Output**: validation/downstream-consumability-checklist.md
- **By Downstream Role**:
  - **acceptance**: Decision state clear, rationale provided
  - **docs**: Findings actionable for documentation sync
  - **security**: Security-relevant findings flagged
  - **developer (on reject)**: Must-fix items actionable
- **Acceptance Criteria**: Each downstream role has clear consumption path

**P4-3: Failure-Mode Checklist**
- **Objective**: Identify common reviewer failure patterns
- **Output**: validation/failure-mode-checklist.md
- **Content** (per spec.md Section 10 - 7 anti-patterns):
  - AP-001: Vague Review
  - AP-002: Rubber Stamp Approval
  - AP-003: Scope Creep Blindness
  - AP-004: Severity Confusion
  - AP-005: Governance Drift Ignorance
  - AP-006: Silent Fixing
  - AP-007: Rejection Without Remedy
- **Acceptance Criteria**: Each pattern detectable and preventable

**P4-4: Anti-Pattern Guidance**
- **Objective**: Provide comprehensive anti-pattern documentation
- **Output**: validation/anti-pattern-guidance.md
- **Content**:
  - Definition of each anti-pattern
  - Detection methods
  - Prevention strategies
  - Remediation steps
- **Acceptance Criteria**: Guidance actionable by reviewer role

---

#### Phase 5: Educational & Example Layer

**P5-1: Examples for Each Skill**
- **Objective**: Provide complete examples for each skill
- **Output Structure**:
  ```
  .opencode/skills/reviewer/
  ├── code-review-checklist/
  │   └── examples/
  │       ├── example-001-feature-review.md
  │       └── example-002-bugfix-review.md
  ├── spec-implementation-diff/
  │   └── examples/
  │       ├── example-001-spec-alignment-check.md
  │       └── example-002-governance-drift-detection.md
  └── reject-with-actionable-feedback/
      └── examples/
          ├── example-001-actionable-rejection.md
          └── example-002-escalation-scenario.md
  ```

**P5-2: Anti-Examples for Each Skill**
- **Objective**: Demonstrate common mistakes
- **Output Structure**:
  ```
  .opencode/skills/reviewer/
  ├── code-review-checklist/
  │   └── anti-examples/
  │       ├── anti-example-001-vague-review.md
  │       └── anti-example-002-rubber-stamp.md
  ├── spec-implementation-diff/
  │   └── anti-examples/
  │       ├── anti-example-001-ignoring-governance.md
  │       └── anti-example-002-scope-creep-blindness.md
  └── reject-with-actionable-feedback/
      └── anti-examples/
          ├── anti-example-001-rejection-without-remedy.md
          └── anti-example-002-silent-fixing.md
  ```

**P5-3: Templates/Checklists for Each Skill**
- **Objective**: Provide reusable templates
- **Output Structure**:
  ```
  .opencode/skills/reviewer/
  ├── code-review-checklist/
  │   └── checklists/
  │       └── review-checklist.md
  ├── spec-implementation-diff/
  │   └── checklists/
  │       └── diff-checklist.md
  └── reject-with-actionable-feedback/
      └── checklists/
          └── feedback-checklist.md
  ```

---

#### Phase 6: Workflow & Package Integration

**P6-1: Role-scope.md Documentation**
- **Objective**: Complete reviewer role scope document
- **Output**: specs/006-reviewer-core/role-scope.md
- **Content**:
  - Mission
  - In Scope / Out of Scope
  - Trigger conditions
  - Required / Optional inputs
  - Expected outputs
  - Escalation rules
  - Upstream / Downstream dependencies
  - AH-006 governance alignment responsibilities
- **Acceptance Criteria**: Aligns with role-definition.md Section 4

**P6-2: Package Governance Updates Check**
- **Objective**: Check/update related governance documents
- **Documents to Check/Update**:
  - README.md (Skills inventory, Workflow, Feature status)
  - AGENTS.md (Role semantics if needed)
  - package-spec.md (Reviewer skills section)
- **Acceptance Criteria**: Governance documents reflect 006 completion

**P6-3: Feature Completion Preparation**
- **Objective**: Prepare completion-report.md
- **Output**: specs/006-reviewer-core/completion-report.md
- **Content**:
  - Deliverables checklist
  - Traceability matrix to spec
  - Open questions resolved/unresolved
  - Known gaps (future advanced skills)
  - Input value for 007-docs-core, 008-security-core
- **Acceptance Criteria**: Honest status reporting; no hidden gaps

---

#### Phase 7: Consistency Review

**P7-1: Governance Document Sync**
- **Objective**: Ensure all governance documents are consistent
- **Check Items**:
  - [ ] README.md terminology consistent with role-definition.md
  - [ ] AGENTS.md constraints consistent with package-spec.md
  - [ ] quality-gate.md reviewer gate aligned with this feature
  - [ ] io-contract.md artifact types include reviewer artifacts

**P7-2: Cross-Document Consistency Check**
- **Objective**: Verify no contradictions between documents
- **Method**: Use governance sync rule (AGENTS.md)
- **Check Areas**:
  - 6-role vs 3-skill semantic consistency
  - Feature status across README, plan, completion-report
  - Artifact field definitions consistent across contracts

**P7-3: Final Acceptance Validation**
- **Objective**: Validate against spec.md acceptance criteria
- **Validation Items**:
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

---

## 5. Data Flow

### 5.1 Standard Feature Review Flow

```
Upstream Artifacts
         │
         ▼
┌─────────────────────────┐
│   reviewer: Read         │
│   upstream artifacts     │
│   - design-note          │
│   - implementation-summary│
│   - verification-report  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   reviewer:              │
│   code-review-checklist  │
│   execution              │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   reviewer:              │
│   spec-implementation-diff│
│   + governance alignment │
│   (AH-006)               │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   reviewer:              │
│   findings classification│
│   (blocker/major/minor)  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   reviewer:              │
│   decision determination │
│   (accept/reject/etc)    │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Output Artifacts       │
│   - review-findings-report│
│   - acceptance-decision-record│
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Downstream Handoff     │
│   - acceptance           │
│   - docs                 │
│   - security             │
│   - developer (on reject)│
└─────────────────────────┘
```

### 5.2 Rejection with Feedback Flow

```
Blocking Findings Identified
         │
         ▼
┌─────────────────────────┐
│   reviewer: Classify     │
│   by severity            │
│   (blocker vs major)     │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   reviewer:              │
│   reject-with-actionable-│
│   feedback               │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Output:                │
│   actionable-feedback-   │
│   report                 │
│   - must-fix items       │
│   - should-fix items     │
│   - closure criteria     │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Handoff to developer   │
│   for rework             │
└─────────────────────────┘
```

### 5.3 Governance Drift Detection Flow

```
spec-implementation-diff Execution
         │
         ▼
┌─────────────────────────┐
│   Compare feature        │
│   outputs vs canonical   │
│   documents              │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Identify governance    │
│   conflicts              │
│   - role boundaries      │
│   - terminology          │
│   - artifact formats     │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Classify as            │
│   major/blocker          │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Document in            │
│   review-findings-report │
│   - governance_conflicts │
│   - recommended actions  │
└─────────────────────────┘
```

---

## 6. Failure Handling

### 6.1 Skill-Level Failure Modes

| Skill | Failure Mode | Detection | Recovery |
|-------|--------------|-----------|----------|
| code-review-checklist | Vague review | Checklist: specific suggestions for each finding | Require remediation guidance |
| code-review-checklist | Rubber stamp approval | Checklist: evidence links required | Mandate upstream consumption |
| spec-implementation-diff | Ignoring governance | Checklist: AH-006 mandatory | Include governance alignment in checklist |
| spec-implementation-diff | Scope creep blindness | Checklist: compare vs spec requirements | Explicit spec-implementation diff |
| reject-with-actionable-feedback | Rejection without remedy | Checklist: must-fix items required | BR-005 enforcement |
| reject-with-actionable-feedback | Silent fixing | Checklist: no code modification | BR-007 enforcement |

### 6.2 Artifact-Level Failure Modes

| Artifact | Failure Mode | Detection | Recovery |
|----------|--------------|-----------|----------|
| review-findings-report | Missing severity classification | failure_classification field empty | Classify per BR-004 |
| review-findings-report | No governance alignment status | governance_alignment_status missing | Add AH-006 section |
| acceptance-decision-record | Ambiguous decision state | decision_state not in allowed set | Use defined 4 states |
| acceptance-decision-record | No rationale | decision_rationale empty | Require justification |
| actionable-feedback-report | No must-fix items | must_fix_items empty on reject | Require specific remediation |

### 6.3 Escalation Rules

Escalate (ESCALATE) when:
- Spec vs implementation conflict prevents decision
- Governance conflict requires management decision
- Evidence insufficient for independent judgment
- Multi-reviewer conflict requires resolution
- Fundamental design constraint violation

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
    - ah006_integration: true  # NEW for reviewer
```

### 7.2 Artifact-Level Validation

Each artifact must pass:

```yaml
validation_checklist:
  artifact_level:
    - required_fields_present: true
    - downstream_consumable: true
    - severity_discipline_followed: true
    - decision_state_explicit: true
    - governance_alignment_reported: true  # NEW for reviewer
```

### 7.3 Governance Alignment Validation

Must verify AH-006 compliance:

```yaml
validation_checklist:
  governance_alignment:
    - canonical_documents_checked: true
    - role_boundaries_aligned: true
    - terminology_consistent: true
    - path_resolution_verified: true
    - status_truthfulness_checked: true
```

### 7.4 Decision Quality Validation

Must verify decision quality:

```yaml
validation_checklist:
  decision_quality:
    - decision_state_explicit: true
    - rationale_provided: true
    - blocking_issues_listed: true
    - non_blocking_issues_distinguished: true
    - residual_risks_documented: true
```

---

## 8. Risks / Tradeoffs

### 8.1 Identified Risks

| Risk ID | Description | Level | Mitigation |
|---------|-------------|-------|------------|
| R-001 | Existing reviewer skills may conflict with new contracts | Medium | Enhance existing, don't replace |
| R-002 | AH-006 governance checking may be too heavyweight | Medium | Make it optional for simple reviews |
| R-003 | Decision state semantics may need refinement | Medium | Start with 4 states, add qualifiers as needed |
| R-004 | Reviewer may overstep into developer role | Medium | Explicit BR-007 enforcement |
| R-005 | Governance drift findings may be hard to classify | Medium | Clear severity guidelines in quality-gate.md |

### 8.2 Tradeoffs

| Decision | Chosen Approach | Alternative | Rationale |
|----------|-----------------|-------------|-----------|
| AH-006 integration | Mandatory in spec-implementation-diff | Optional add-on | Aligns with audit-hardening.md |
| Decision states | 4 defined states | 6+ granular states | Balance clarity with flexibility |
| Severity levels | blocker/major/minor/note | Simpler 2-level | Matches quality-gate.md Section 2.2 |
| Existing skills | Enhance | Replace | Preserve AH-006 work already done |

### 8.3 Assumptions

| Assumption ID | Description | Impact if Wrong |
|---------------|-------------|-----------------|
| AS-001 | 003/004/005 features complete | Missing upstream interfaces |
| AS-002 | Governance documents authoritative | Need semantic re-alignment |
| AS-003 | Reviewer provides recommendations only | Authority scope mismatch |
| AS-004 | Skills directory follows tester pattern | Different directory structure |

---

## 9. Requirement Traceability

### 9.1 Spec Requirements to Plan Mapping

| Spec Requirement | Plan Section | Task IDs |
|------------------|--------------|----------|
| BR-001: Consume Upstream Evidence | Phase 1 (Upstream), Phase 4 | P1-2, P4-1 |
| BR-002: Self-Check Not Review | Phase 2 (Skills) | P2-1 |
| BR-003: Explicit Decision State | Phase 3 (Contracts) | P3-2 |
| BR-004: Severity Classification | Phase 3 (Contracts), Phase 4 | P3-1, P4-3 |
| BR-005: Rejection Actionable | Phase 2 (Skills) | P2-3 |
| BR-006: Governance Alignment Mandatory | Phase 2 (Skills) | P2-2 |
| BR-007: No Code Mutation | Phase 1 (Role Scope) | P1-1 |
| BR-008: Scope Creep Detection | Phase 2 (Skills) | P2-2 |
| BR-009: Status Truthfulness | Phase 2 (Skills) | P2-2 |
| BR-010: 6-Role Semantics | Phase 1, Phase 7 | P1-1, P7-1 |

### 9.2 Acceptance Criteria to Tasks Mapping

| Acceptance Criteria | Tasks |
|---------------------|-------|
| AC-001: Feature Package Complete | All phases |
| AC-002: Reviewer Role Scope Formalized | P1-1, P6-1 |
| AC-003: Core Skills Formally Implemented | P2-1, P2-2, P2-3 |
| AC-004: Artifact Contracts Defined | P3-1, P3-2, P3-3 |
| AC-005: Upstream Consumption Logic Clear | P1-2, P4-1 |
| AC-006: Downstream Decision Logic Clear | P1-3, P4-2 |
| AC-007: Skill Assets Complete | P5-1, P5-2, P5-3 |
| AC-008: Finding Classification Model Present | P3-1, P4-3 |
| AC-009: Anti-Pattern Guidance Present | P4-4, P5-2 |
| AC-010: Scope Boundary Maintained | All phases (by design) |
| AC-011: AH-006 Governance Alignment Enforced | P2-2, P4-3 |
| AC-012: First-Class Review Role Established | All phases (by design) |

---

## 10. Implementation Order

### 10.1 Recommended Execution Sequence

```
Day 1:
├── Phase 1: Role Scope Finalization (1 day)
│   └── Parallel: P1-1, P1-2, P1-3

Day 2-3:
├── Phase 2: Skill Formalization (2 days)
│   ├── P2-1: code-review-checklist (0.7 days)
│   ├── P2-2: spec-implementation-diff (0.7 days)
│   └── P2-3: reject-with-actionable-feedback (0.6 days)

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
P2-1 → P3-1
P2-2 → P3-1, P3-2
P2-3 → P3-3
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
| OQ-001 | Decision state granularity? | Status reporting | Use 4 defined states with optional qualifiers |
| OQ-002 | Automated vs manual review separation? | Review workflow | Manual is core; automated checks are pre-conditions |
| OQ-003 | Security review integration? | Role boundaries | Reviewer flags; security performs specialized review |
| OQ-004 | Multi-reviewer consensus? | Conflict resolution | Single reviewer produces decision; escalation for conflicts |

### 11.2 New Open Questions from Planning

| OQ ID | Question | Impact | Temporary Assumption |
|-------|----------|--------|---------------------|
| OQ-005 | Should governance checks be optional for trivial reviews? | AH-006 compliance | Mandatory for all reviews |
| OQ-006 | How to handle reviews with incomplete upstream artifacts? | Review quality | Document gaps; escalate if critical |

---

## 12. Next Steps

### 12.1 Immediate Actions

1. **Create tasks.md**: Convert this plan to executable task list
2. **Confirm open questions**: Resolve OQ-001~OQ-006 decisions
3. **Begin Phase 1**: Role Scope Finalization

### 12.2 Dependencies on Other Features

| Dependency | Feature | Status |
|------------|---------|--------|
| 003-architect-core | Completed | ✅ |
| 004-developer-core | Completed | ✅ |
| 005-tester-core | Completed | ✅ |
| 007-docs-core | Planned | Waiting for this feature |
| 008-security-core | Planned | Waiting for this feature |

### 12.3 Deliverables Checklist

- [ ] `specs/006-reviewer-core/plan.md` (this document)
- [ ] `specs/006-reviewer-core/tasks.md`
- [ ] `specs/006-reviewer-core/role-scope.md`
- [ ] `specs/006-reviewer-core/upstream-consumption.md`
- [ ] `specs/006-reviewer-core/downstream-interfaces.md`
- [ ] `specs/006-reviewer-core/contracts/review-findings-report-contract.md`
- [ ] `specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md`
- [ ] `specs/006-reviewer-core/contracts/actionable-feedback-report-contract.md`
- [ ] `.opencode/skills/reviewer/code-review-checklist/` (enhanced)
- [ ] `.opencode/skills/reviewer/spec-implementation-diff/` (enhanced)
- [ ] `.opencode/skills/reviewer/reject-with-actionable-feedback/` (enhanced)
- [ ] `specs/006-reviewer-core/validation/` (checklists)
- [ ] `specs/006-reviewer-core/examples/` (example docs)
- [ ] `specs/006-reviewer-core/completion-report.md`

---

## References

- `specs/006-reviewer-core/spec.md` - Feature specification
- `specs/003-architect-core/` - Architect artifacts for upstream consumption
- `specs/004-developer-core/` - Developer artifacts for upstream consumption
- `specs/005-tester-core/` - Tester artifacts for upstream consumption
- `package-spec.md` - Package governance specification
- `role-definition.md` - 6-role definition (Section 4: reviewer)
- `io-contract.md` - Input/output contract
- `quality-gate.md` - Quality gate rules (Section 2.2: severity levels)
- `docs/audit-hardening.md` - AH-006 governance alignment rules
- `.opencode/skills/reviewer/*/SKILL.md` - Existing reviewer skill references