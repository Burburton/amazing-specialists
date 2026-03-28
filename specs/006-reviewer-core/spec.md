# 006-reviewer-core Feature Specification

## Document Status
- **Feature ID**: `006-reviewer-core`
- **Feature Name**: Reviewer Core Skills System
- **Version**: 1.0.0
- **Status**: Complete
- **Created**: 2026-03-26
- **Last Updated**: 2026-03-26
- **Authoring Intent**: Full-feature specification for OpenCode-driven implementation, not a minimal bootstrap

---

## 1. Background

### 1.1 Context

The repository has established three formal execution roles in the 6-role model:

- `003-architect-core`: Transforms requirements into design notes, module boundaries, and trade-off guidance
- `004-developer-core`: Transforms design into code changes, implementation summaries, self-check reports, and bugfix reports
- `005-tester-core`: Transforms implementation claims into verifiable evidence with test scope, verification reports, and regression analysis

The next missing first-class capability is `reviewer`.

In the intended execution chain:

```text
architect (design) → developer (implement) → tester (verify) → reviewer (independent judgment) → docs/security
```

`reviewer` is the role that performs **independent quality review and produces acceptance-oriented judgment**.
Without a complete reviewer-core system, the repository lacks a formal independent acceptance layer between verification and downstream documentation.

### 1.2 Problem Statement

Without `006-reviewer-core`, the expert package has the following structural gaps:

1. **No formal independent review contract**
   Implementation and testing outputs cannot be consumed by a standardized review role with stable decision artifacts.

2. **No unified spec-implementation diff methodology**
   There is no first-class method for comparing what was specified versus what was actually implemented.

3. **No systematic governance alignment checking**
   The AH-006 enhanced reviewer responsibilities (checking against canonical documents) lack formal skill support.

4. **No explicit decision model**
   Review outcomes lack structured decision states (accept/reject/accept-with-conditions/needs-clarification).

5. **No downstream-ready decision artifacts**
   Final acceptance, docs, and security layers need structured review evidence, not informal "looks good" statements.

6. **Role boundary remains under-specified in practice**
   Without reviewer-core, developer or tester may overstep into review judgment, or reviewer may silently mutate implementation.

### 1.3 Prior Work

This feature builds on:

- `002-role-model-alignment`
- `002b-governance-repair`
- `003-architect-core`
- `004-developer-core`
- `005-tester-core`

In particular:
- `004-developer-core` provides implementation-summary, self-check-report, bugfix-report
- `005-tester-core` provides test-scope-report, verification-report, regression-risk-report

This means `006-reviewer-core` should be designed as a **downstream consumer of architect, developer, and tester artifacts**, not as an isolated role document.

---

## 2. Goal

Establish `reviewer` as a first-class independent review role with:

1. **Complete capability system**
   3 core skills with full supporting assets and explicit role boundaries.

2. **Stable decision artifacts**
   Structured outputs that can be consumed by acceptance, docs, and security layers.

3. **Upstream-consumption discipline**
   Formal transformation of architect, developer, and tester artifacts into review evidence.

4. **Decision rigor**
   Clear separation between review execution, decision states, and actionable feedback.

5. **Honest evidence reporting**
   Findings must be severity-classified, evidence-based, and actionable.

6. **Full educational packaging**
   Each reviewer skill must include SKILL.md, examples, anti-examples, and reusable checklists/templates.

7. **Governance alignment enforcement**
   Explicit AH-006 compliance for checking feature outputs against canonical governance documents.

This feature is **not** a minimal placeholder. It is intended to be a complete reviewer-core capability layer suitable for downstream production use in the OpenCode expert package.

---

## 3. Scope

### 3.1 In Scope

#### A. Role Boundary Layer

Define reviewer role scope precisely:

- What reviewer must do
- What reviewer may do
- What reviewer must never do
- What reviewer escalates instead of deciding alone

This includes explicit boundaries against:

- Developer substituting self-check for review judgment
- Tester substituting verification evidence for independent review
- Reviewer silently rewriting code instead of providing feedback

#### B. Core Skills Layer (3 skills)

| Skill | Purpose |
|-------|---------|
| `code-review-checklist` | Provide structured checklist-driven review framework |
| `spec-implementation-diff` | Compare specified versus implemented, including governance alignment |
| `reject-with-actionable-feedback` | Enable structured rejection with executable remediation guidance |

#### C. Artifact Contract Layer (3 artifacts)

| Artifact | Purpose |
|-----------|--------|
| `review-findings-report` | Primary structured review artifact capturing findings by severity |
| `acceptance-decision-record` | Formal record of reviewer decision with rationale |
| `actionable-feedback-report` | Operational handoff document when rework is needed |

#### D. Quality and Validation Layer

The feature must define:

- Upstream-consumability checklist for consuming architect/developer/tester outputs
- Downstream-consumability checklist for acceptance/docs/security consumers
- Failure-mode checklist for reviewer work
- Anti-pattern guidance for weak or misleading review outputs
- Evidence-quality rules
- Finding classification model (blocker/major/minor/note per quality-gate.md Section 2.2)

#### E. Educational and Example Layer

Each reviewer skill must include:

- `SKILL.md`
- `examples/`
- `anti-examples/`
- `templates/` or `checklists/`

#### F. Interface Layer

Define:

- How reviewer consumes architect, developer, and tester outputs
- How reviewer hands off to acceptance, docs, and security
- How reviewer reports blocked states or unresolved conflicts

### 3.2 Out of Scope

1. `007-docs-core` implementation
2. `008-security-core` implementation
3. Repository-wide automated CI review framework buildout
4. Business-specific review code for a real product feature
5. Advanced review specialties beyond core foundation, such as:
   - `performance-review`
   - `compliance-review`
   - `accessibility-review`
   - `legal-review`
   - `third-party-license-review`

---

## 4. Actors

### 4.1 Primary Actor: reviewer

**Mission**: Perform independent quality review and produce acceptance-oriented judgment based on intended scope, implementation evidence, and testing evidence.

**Responsibilities**:

- Compare actual delivered outputs against intended requirements and scope
- Inspect whether implementation and testing claims are supported by evidence
- Identify mismatches, risks, omissions, overstatements, and acceptance blockers
- Produce actionable findings and decision outputs
- Recommend acceptance, conditional acceptance, or rejection with justification
- Perform governance alignment checks against canonical documents (AH-006)
- Classify findings using severity levels (blocker/major/minor/note)

**Non-Responsibilities**:

- Silently repairing implementation defects as if acting as developer
- Replacing the tester's validation function
- Redefining product or architecture scope without clear rationale
- Approving work based only on self-claims without independent comparison
- Providing vague rejection without actionable remediation guidance
- Mutating production code during review

### 4.2 Upstream Providers

Reviewer must formally consume the following artifacts:

#### From `003-architect-core`:

| Upstream Artifact | Purpose for Reviewer |
|-------------------|----------------------|
| `design-note` | Verify implementation aligns with design intent |
| `module-boundaries` | Check implementation respects architectural constraints |
| `risks-and-tradeoffs` | Assess whether identified risks were addressed |
| `open-questions` | Verify resolution of architectural uncertainties |

#### From `004-developer-core`:

| Upstream Artifact / Field | Purpose for Reviewer |
|---------------------------|----------------------|
| `implementation-summary.goal_alignment` | Verify claimed goal alignment is accurate |
| `implementation-summary.changed_files` | Establish review surface |
| `implementation-summary.known_issues` | Distinguish known limitations from new findings |
| `implementation-summary.risks` | Prioritize high-risk review areas |
| `self-check-report` | Treat as input, not substitute for independent review |
| `bugfix-report.root_cause` | Verify fix addresses root cause |

#### From `005-tester-core`:

| Upstream Artifact | Purpose for Reviewer |
|-------------------|----------------------|
| `test-scope-report` | Understand what was tested and why |
| `verification-report` | Evaluate pass/fail evidence and coverage gaps |
| `regression-risk-report` | Assess regression risk and untested areas |

### 4.3 Downstream Consumers

| Role | Consumes |
|------|----------|
| `acceptance` / management layer | acceptance-decision-record, overall pass/fail/gap evidence |
| `developer` (on reject) | actionable-feedback-report for rework |
| `docs` | review-findings-report for documentation sync |
| `security` | review-findings-report for security-focused follow-up |

---

## 5. Core Workflows

### 5.1 Workflow 1: Standard Feature Review

```text
design-note + implementation-summary + verification-report
  → consume upstream artifacts
    → code-review-checklist execution
      → spec-implementation-diff
        → governance alignment check (AH-006)
          → findings classification
            → decision determination
              → review-findings-report
                → acceptance-decision-record
                  → handoff to acceptance/docs/security
```

### 5.2 Workflow 2: Rejection with Feedback

```text
blocking findings identified
  → classify by severity
    → generate actionable-feedback-report
      → specify must-fix items
        → specify suggested improvements
          → define re-review criteria
            → handoff to developer
```

### 5.3 Workflow 3: Governance Drift Detection

```text
spec-implementation-diff execution
  → compare feature outputs vs canonical documents
    → identify governance conflicts
      → classify as major/blocker
        → document governance drift findings
          → recommend sync actions
            → escalate if fundamental conflict
```

### 5.4 Workflow 4: Ambiguity Escalation

```text
spec vs implementation conflict
or
insufficient evidence for decision
or
design constraint conflict
  → document blocker
    → classify issue type
      → escalate to architect/developer/management
```

---

## 6. Business Rules

### BR-001: Reviewer Must Consume Upstream Evidence, Not Ignore It

Reviewer work must begin from structured upstream artifacts, not from informal assumptions.

**Implication**: No reviewer output should skip upstream artifact interpretation.

### BR-002: Self-Check Is Not Independent Review

Developer self-check and tester verification inform review, but cannot replace reviewer judgment.

**Implication**: Reviewer must explicitly distinguish upstream evidence from independent findings.

### BR-003: Every Review Must Produce Explicit Decision State

Reviewer must produce one of: accept, accept-with-conditions, reject, or needs-clarification.

**Implication**: Reviews without explicit decision states are incomplete.

### BR-004: Findings Must Be Severity-Classified

Every finding must be classified as blocker, major, minor, or note per quality-gate.md Section 2.2.

**Implication**: Raw findings dumps without classification are insufficient.

### BR-005: Rejection Must Be Actionable

Every rejection must include specific must-fix items with remediation guidance.

**Implication**: "Needs improvement" without specific guidance is invalid.

### BR-006: Governance Alignment Checking Is Mandatory

Reviewer must check feature outputs against canonical governance documents (AH-006).

**Implication**: Reviews that skip governance alignment checks violate AH-006.

### BR-007: Reviewer Must Not Mutate Production Code

If implementation changes are required, reviewer produces actionable feedback, not code changes.

**Implication**: Reviewer may review but must not silently fix.

### BR-008: Scope Creep Detection Is Required

Reviewer must identify implementation beyond spec (scope creep) as a finding.

**Implication**: Passing targeted functionality is not enough if unauthorized features were added.

### BR-009: Status Truthfulness Must Be Verified

Reviewer must check completion-report status vs README status for alignment.

**Implication**: Status misrepresentation is a major finding.

### BR-010: Use 6-Role Formal Semantics

All primary descriptions use architect/developer/tester/reviewer/docs/security terminology.

**Implication**: Legacy terminology only appears in mapping notes if needed.

---

## 7. Artifact Contracts

### AC-001: review-findings-report

**Purpose**: Primary structured review artifact capturing findings by severity with governance alignment status.

**Required Fields**:

| Field | Description |
|-------|-------------|
| `review_target` | Feature/deliverable under review |
| `reviewed_inputs` | Upstream artifacts consumed |
| `summary_judgment` | High-level assessment |
| `findings_by_severity` | Blocker/major/minor/note categorization |
| `evidence_references` | Files, artifacts, or observations supporting findings |
| `scope_mismatches` | Deviations from spec/design |
| `quality_concerns` | Maintainability, performance, security concerns |
| `governance_alignment_status` | Aligned/drift_detected |
| `governance_conflicts` | Conflicts with canonical documents (if any) |
| `open_questions` | Items requiring clarification |
| `recommended_next_action` | accept/reject/request_changes/escalate |

**Primary Consumers**: acceptance, docs, security

---

### AC-002: acceptance-decision-record

**Purpose**: Formal record of reviewer decision with rationale and conditions.

**Required Fields**:

| Field | Description |
|-------|-------------|
| `target_feature` | Feature/deliverable being decided |
| `decision_state` | accept/accept-with-conditions/reject/needs-clarification |
| `decision_rationale` | Why this decision was made |
| `blocking_issues` | Must-fix items preventing acceptance |
| `non_blocking_issues` | Items that do not prevent acceptance |
| `acceptance_conditions` | Conditions for conditional acceptance (if applicable) |
| `downstream_recommendation` | Recommended actions for downstream roles |
| `reviewer_confidence_level` | HIGH/MEDIUM/LOW with justification |
| `governance_compliance` | Whether feature complies with governance baseline |

**Allowed Decision States**:

| State | Meaning |
|-------|---------|
| `accept` | Deliverable acceptable, no blocking issues |
| `accept-with-conditions` | Acceptable with explicit follow-up items |
| `reject` | Blocking gaps prevent acceptance, rework required |
| `needs-clarification` | Cannot decide due to missing/ambiguous information |

**Primary Consumers**: acceptance, management layer

---

### AC-003: actionable-feedback-report

**Purpose**: Operational handoff document when rework is needed.

**Required Fields**:

| Field | Description |
|-------|-------------|
| `issue_summary` | High-level summary of why rejection occurred |
| `affected_files_artifacts` | Files or artifacts requiring changes |
| `why_it_matters` | Impact of the issues |
| `required_correction` | Specific changes needed |
| `suggested_owner_role` | developer/tester/architect |
| `expected_verification` | How to verify fix |
| `closure_criteria` | What constitutes "done" |
| `must_fix_items` | Blocking items requiring resolution |
| `should_fix_items` | Non-blocking improvements |
| `residual_risks` | Accepted risks after remediation |

**Primary Consumers**: developer (on reject), acceptance (for tracking)

---

## 8. Skill Definitions

### SKILL-001: code-review-checklist

**Goal**: Provide systematic checklist-driven review framework ensuring coverage of correctness, completeness, consistency, and maintainability.

**Inputs**:
- `changed_files` (required)
- `spec` or `design-note` (required)
- `implementation-summary` (required)
- `test-results` (optional)

**Outputs**:
- `checklist_execution_results`
- `issues_by_category`
- `severity_classified_findings`

**Required Actions**:
1. Read spec/design to understand expected behavior
2. Review each changed file against checklist categories
3. Classify findings by severity (blocker/major/minor/note)
4. Link findings to specific code locations
5. Generate actionable suggestions

**Quality Standards**:
- Every checklist category must be evaluated
- Findings must be evidence-linked
- Severity discipline must be followed
- Vague suggestions prohibited

**Failure Modes**:
- Reviewing style instead of correctness
- Skipping checklist categories
- Not distinguishing severity levels
- Providing vague "needs improvement" feedback

---

### SKILL-002: spec-implementation-diff

**Goal**: Compare what was specified versus what was implemented, including governance alignment against canonical documents.

**Inputs**:
- `spec.md` (required)
- `design-note` (optional)
- `implementation-summary` (required)
- `canonical governance documents` (required for AH-006)

**Outputs**:
- `spec_vs_implementation_comparison`
- `governance_alignment_status`
- `drift_findings`
- `path_resolution_issues`

**Required Actions**:
1. Extract all spec requirements
2. Map each requirement to implementation
3. Identify gaps, deviations, and additions
4. Check governance alignment (AH-006):
   - Role boundaries vs role-definition.md
   - Terminology vs package-spec.md
   - Artifact formats vs io-contract.md
   - Severity levels vs quality-gate.md
5. Verify path resolution for declared artifacts
6. Check status truthfulness (completion-report vs README)

**Quality Standards**:
- Every spec requirement must be evaluated
- Governance conflicts must be reported as major/blocker
- Path failures must be documented
- Status misrepresentation must be flagged

**Failure Modes**:
- Only checking functional requirements, ignoring governance
- Accepting vague implementation claims without evidence
- Not verifying declared artifact paths exist
- Ignoring status discrepancies

---

### SKILL-003: reject-with-actionable-feedback

**Goal**: Enable reviewer to reject work in a way that is operationally useful and recoverable.

**Inputs**:
- `review-findings` (required)
- `blocking_issues` (required for reject)
- `suggested_improvements` (optional)

**Outputs**:
- `actionable-feedback-report`
- `re_review_criteria`
- `closure_checklist`

**Required Actions**:
1. Separate blockers from improvements
2. For each must-fix:
   - Describe the issue
   - Explain why it matters
   - Provide specific remediation
   - Define verification method
3. For improvements:
   - Describe benefit
   - Suggest priority
4. Define re-review scope
5. Specify closure criteria

**Quality Standards**:
- Every must-fix must have remediation guidance
- Code examples for complex fixes
- Re-review scope must be bounded
- No "needs improvement" without specifics

**Failure Modes**:
- Vague rejection without specifics
- Not separating must-fix from should-fix
- Not defining verification method
- Missing re-review criteria

---

## 9. Validation Model

### VM-001: Skill-Level Validation

```yaml
validation_checklist:
  skill_level:
    - [ ] inputs_defined: true
    - [ ] outputs_complete: true
    - [ ] checklists_executable: true
    - [ ] examples_exist: true
    - [ ] anti_examples_exist: true
    - [ ] role_boundaries_clear: true
```

### VM-002: Artifact-Level Validation

```yaml
validation_checklist:
  artifact_level:
    - [ ] required_fields_present: true
    - [ ] downstream_consumable: true
    - [ ] severity_discipline_followed: true
    - [ ] decision_state_explicit: true
```

### VM-003: Governance Alignment Validation

```yaml
validation_checklist:
  governance_alignment:
    - [ ] canonical_documents_checked: true
    - [ ] role_boundaries_aligned: true
    - [ ] terminology_consistent: true
    - [ ] path_resolution_verified: true
    - [ ] status_truthfulness_checked: true
```

### VM-004: Decision Quality Validation

```yaml
validation_checklist:
  decision_quality:
    - [ ] decision_state_explicit: true
    - [ ] rationale_provided: true
    - [ ] blocking_issues_listed: true
    - [ ] non_blocking_issues_distinguished: true
    - [ ] residual_risks_documented: true
```

---

## 10. Anti-Patterns

### AP-001: Vague Review

**Definition**: Review that says "needs improvement" without specific, actionable guidance.

**Example**: "The code could be better. Consider refactoring."

**Prevention**: Use structured checklist; require specific suggestions for every finding.

### AP-002: Rubber Stamp Approval

**Definition**: Approval based on surface-level review without independent verification.

**Example**: Accepting "tested locally" as sufficient evidence.

**Prevention**: Require evidence links; mandate upstream artifact consumption.

### AP-003: Scope Creep Blindness

**Definition**: Failing to identify implementation beyond specification.

**Example**: Accepting additional "bonus" features not in spec.

**Prevention**: Explicit spec-implementation-diff; flag unauthorized additions.

### AP-004: Severity Confusion

**Definition**: Treating all findings equally without severity classification.

**Example**: Listing style suggestions alongside security vulnerabilities.

**Prevention**: Mandatory severity discipline per quality-gate.md.

### AP-005: Governance Drift Ignorance

**Definition**: Skipping AH-006 governance alignment checks.

**Example**: Not checking if feature violates role-definition.md boundaries.

**Prevention**: Include governance alignment in review checklist.

### AP-006: Silent Fixing

**Definition**: Reviewer modifying code instead of providing feedback.

**Example**: Rewriting a function during review instead of documenting the issue.

**Prevention**: Explicit prohibition in role-scope.md; BR-007 enforcement.

### AP-007: Rejection Without Remedy

**Definition**: Rejecting without providing actionable remediation guidance.

**Example**: "This doesn't meet our standards" without specifics.

**Prevention**: BR-005 enforcement; require actionable-feedback-report.

---

## 11. Non-Functional Requirements

### NFR-001: Review Completion Time

Standard reviews should complete within 30-60 minutes of focused effort.

### NFR-002: Finding Traceability

Every finding must be traceable to:
- Specific file and line (or artifact section)
- Specific spec requirement (or N/A with justification)
- Evidence observation

### NFR-003: Decision Finality

Once a decision is recorded in acceptance-decision-record, it requires explicit override process to change.

### NFR-004: Artifact Persistence

All reviewer artifacts must be persistable and retrievable for audit purposes.

---

## 12. Acceptance Criteria

### AC-001: Feature Package Complete

The feature must contain:
- `spec.md`
- `plan.md`
- `tasks.md`
- `completion-report.md`
- Role/interface/validation documents required by the plan

### AC-002: Reviewer Role Scope Formalized

The repository must clearly define reviewer responsibilities, non-responsibilities, escalation conditions, and upstream/downstream interfaces.

### AC-003: Core Skills Formally Implemented

All 3 core reviewer skills must exist as first-class skills with role-appropriate boundaries and educational assets.

### AC-004: Artifact Contracts Defined

All 3 reviewer artifact contracts must be documented with required fields and intended consumers.

### AC-005: Upstream Consumption Logic Clear

The feature must explicitly map how reviewer consumes architect, developer, and tester artifacts.

### AC-006: Downstream Decision Logic Clear

The feature must explicitly define decision states and how acceptance/docs/security consume reviewer outputs.

### AC-007: Skill Assets Complete

Each of the 3 skills must include:
- 1 `SKILL.md`
- At least 2 examples
- At least 2 anti-examples
- At least 1 checklist or template

### AC-008: Finding Classification Model Present

The feature must define severity classification model aligned with quality-gate.md Section 2.2.

### AC-009: Anti-Pattern Guidance Present

The feature must document common reviewer failure patterns and how to detect/prevent/remediate them.

### AC-010: Scope Boundary Maintained

No docs/security implementation may be smuggled into 006.

### AC-011: AH-006 Governance Alignment Enforced

Reviewer skills must include explicit governance alignment checking capabilities.

### AC-012: First-Class Review Role Established

The resulting feature must make reviewer operable as a true independent review layer between tester and acceptance.

---

## 13. Assumptions

### AS-001: Upstream Features Complete

Assumes `003-architect-core`, `004-developer-core`, and `005-tester-core` are complete and provide stable artifact contracts.

### AS-002: Governance Documents Authoritative

Assumes role-definition.md, package-spec.md, io-contract.md, and quality-gate.md are the canonical source of truth.

### AS-003: Decision Authority Bounded

Assumes reviewer provides recommendations; final acceptance authority rests with acceptance/management layer.

### AS-004: Skills Directory Structure

Assumes `.opencode/skills/reviewer/` follows the pattern established by `.opencode/skills/tester/`.

---

## 14. Open Questions

### OQ-001: Decision State Granularity

Should decision vocabulary include finer states like `accept-with-minor-notes` or `reject-with-partial-approval`?

**Initial Direction**: Use the 4 defined states with optional status qualifiers.

### OQ-002: Automated vs Manual Review

How explicitly should the feature separate automated checks (lint, type-check) from manual review judgment?

**Initial Direction**: Manual review is core; automated checks are pre-conditions, not substitutes.

### OQ-003: Security Review Integration

Should reviewer flag items for security role, or handle basic security concerns directly?

**Initial Direction**: Reviewer flags; security role performs specialized review.

### OQ-004: Multi-Reviewer Consensus

How should conflicting review opinions be resolved?

**Initial Direction**: Single reviewer produces decision; escalation path for conflicts.

---

## 15. References

- `docs/infra/feature/006-reviewer-core-feature-spec.md` - Full requirements document
- `specs/003-architect-core/` - Architect artifacts for upstream consumption
- `specs/004-developer-core/` - Developer artifacts for upstream consumption
- `specs/005-tester-core/` - Tester artifacts for upstream consumption
- `package-spec.md` - Package governance specification
- `role-definition.md` - 6-role definition (Section 4: reviewer)
- `io-contract.md` - Input/output contract
- `quality-gate.md` - Quality gate rules (Section 2.2: severity levels)
- `docs/audit-hardening.md` - AH-006 governance alignment rules
- `.opencode/skills/reviewer/*/SKILL.md` - Existing reviewer skill references

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial spec creation based on 006-reviewer-core-feature-spec.md requirements |