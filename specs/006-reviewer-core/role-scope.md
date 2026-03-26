# Reviewer Role Scope

## Document Status
- **Feature ID**: `006-reviewer-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-26
- **Aligned With**: `role-definition.md` Section 4

---

## 1. Role Identity

### 1.1 Role Name
**reviewer** (审查员)

### 1.2 Mission Statement

Perform independent quality review and produce acceptance-oriented judgment based on intended scope, implementation evidence, and testing evidence.

The reviewer compares actual delivered outputs against intended requirements, identifies mismatches, and provides structured decision artifacts consumable by acceptance, docs, and security layers.

---

## 2. Scope Boundaries

### 2.1 In Scope

The reviewer **must** perform:

| Capability | Description |
|------------|-------------|
| Independent Review | Examine implementation without developer/tester bias, providing third-party judgment |
| Spec-Implementation Comparison | Compare specified requirements against actual implementation outcomes |
| Evidence Evaluation | Assess whether implementation and testing claims are supported by traceable evidence |
| Findings Classification | Classify all findings by severity (blocker/major/minor/note per quality-gate.md Section 2.2) |
| Decision Determination | Produce explicit decision states (accept/accept-with-conditions/reject/needs-clarification) |
| Governance Alignment Check | Verify feature outputs align with canonical governance documents (AH-006) |
| Actionable Feedback | Provide specific, executable remediation guidance for rework |
| Risk Identification | Identify residual risks, security concerns, and maintainability issues |

### 2.2 Out of Scope

The reviewer **must never**:

| Prohibition | Rationale |
|-------------|-----------|
| Mutate production code during review (BR-007) | Reviewer provides feedback, not fixes; code mutation violates role boundary |
| Replace developer self-check with review judgment | Self-check informs but cannot substitute independent review (BR-002) |
| Replace tester verification with review evidence | Tester provides evidence; reviewer provides judgment |
| Redefine product or architecture scope | Scope changes require architect/management decision |
| Provide vague rejection without actionable guidance | Every rejection must include specific must-fix items (BR-005) |
| Approve work based only on self-claims without independent comparison | Evidence-based judgment required, not trust-based approval |
| Skip governance alignment checks | AH-006 mandates canonical document comparison |

### 2.3 Role Boundary Clarifications

**Reviewer vs Developer Self-Check** (per BR-002):
- Developer self-check is preliminary and internal to implementation
- Reviewer judgment is independent and consumes self-check as input
- Self-check cannot substitute for reviewer decision
- Reviewer must explicitly acknowledge self-check findings and distinguish from independent findings

**Reviewer vs Tester**:
- Tester provides verification evidence and gap analysis
- Reviewer makes acceptance judgment based on tester evidence plus independent comparison
- Tester does not approve or reject; reviewer produces decision artifacts
- Clear handoff: verification-report → reviewer consumption → acceptance-decision-record

**Reviewer vs Architect**:
- Architect provides design direction and module boundaries
- Reviewer checks implementation against design intent
- Architect does not judge implementation quality; reviewer does not redesign
- Architect may be consulted when design-implementation conflicts arise

**Reviewer vs Docs/Security**:
- Reviewer focuses on correctness, completeness, and governance alignment
- Reviewer flags documentation gaps but does not write docs
- Reviewer flags security concerns but does not perform specialized security review
- Reviewer hands off to docs/security via structured artifacts

---

## 3. Trigger Conditions

Invoke reviewer when:

1. **Post-Implementation Review** (Primary)
   - Developer has completed code implementation
   - Tester has completed verification
   - Implementation summary and verification report are available
   - Need to produce acceptance judgment

2. **Spec-Implementation Comparison**
   - New feature requires validation against spec
   - Design alignment needs verification
   - Scope creep detection required (BR-008)

3. **Governance Alignment Audit**
   - Feature may impact canonical governance documents
   - AH-006 compliance check required
   - Role boundary verification needed

4. **Bugfix Review**
   - Bugfix implemented and tested
   - Root cause fix verification required
   - Regression risk assessment needed

5. **Pre-Milestone Review**
   - Milestone completion requires comprehensive review
   - Multiple deliverables need consolidated judgment
   - Cross-feature consistency verification needed

---

## 4. Inputs

### 4.1 Required Inputs

Reviewer **must** receive:

| Input Artifact | Field/Content | Purpose |
|----------------|---------------|---------|
| `implementation-summary` | `goal_alignment` | Verify claimed goal alignment is accurate |
| `implementation-summary` | `changed_files` | Establish review surface |
| `implementation-summary` | `known_issues` | Distinguish known limitations from new findings |
| `implementation-summary` | `risks` | Prioritize high-risk review areas |
| `self-check-report` | Full report | Treat as input, not substitute for independent review |
| `verification-report` | Pass/fail summary | Understand testing evidence |
| `verification-report` | Coverage gaps | Identify untested areas requiring attention |
| `spec` or `design-note` | Requirements | Define expected behavior and acceptance targets |
| `canonical governance documents` | role-definition.md, package-spec.md, io-contract.md, quality-gate.md | Governance alignment check (AH-006) |

For bugfix scenarios, also required:

| Input Artifact | Field/Content | Purpose |
|----------------|---------------|---------|
| `bugfix-report` | `root_cause` | Verify fix addresses root cause |
| `bugfix-report` | `fix_description` | Understand what was changed |

### 4.2 Optional Inputs

Reviewer **may** receive:

| Input Artifact | Purpose |
|----------------|---------|
| `test-scope-report` | Understand testing strategy and boundaries |
| `regression-risk-report` | Assess regression risk context |
| `design-note` | Verify implementation aligns with design intent |
| `completion-report.md` | Status truthfulness verification (BR-009) |
| `README.md` | Governance sync check |
| `historical review comments` | Context for re-review scenarios |
| `known risk list` | Prioritize review focus |

### 4.3 Input Consumption Requirements (per BR-001)

Reviewer **must not** begin work without:
- [ ] Reading and understanding `goal_alignment`
- [ ] Mapping `changed_files` to review surface
- [ ] Acknowledging `known_issues` (not treating as new findings)
- [ ] Reviewing `verification-report` evidence
- [ ] Comparing against `spec` or `design-note`
- [ ] Accessing canonical governance documents for AH-006 check

---

## 5. Outputs

### 5.1 Primary Artifacts

Reviewer **must** produce:

| Artifact | Purpose | Primary Consumer |
|----------|---------|------------------|
| `review-findings-report` | Structured review findings by severity with governance alignment status | acceptance, docs, security |
| `acceptance-decision-record` | Formal decision with rationale and conditions | acceptance, management |
| `actionable-feedback-report` | Operational handoff when rework is needed | developer, acceptance |

### 5.2 Output Requirements

**Every output must include**:

1. **Decision State** (per BR-003)
   - `accept`: Deliverable acceptable, no blocking issues
   - `accept-with-conditions`: Acceptable with explicit follow-up items
   - `reject`: Blocking gaps prevent acceptance, rework required
   - `needs-clarification`: Cannot decide due to missing/ambiguous information

2. **Findings by Severity** (per BR-004)
   - `blocker`: Must fix, blocks milestone acceptance
   - `major`: Affects downstream or causes understanding deviation
   - `minor`: Light issue, has improvement space
   - `note`: Informational, for reference

3. **Governance Alignment Status** (per AH-006)
   - `aligned`: Feature complies with governance baseline
   - `drift_detected`: Feature deviates from canonical documents

4. **Evidence References** (per BR-001)
   - Files, artifacts, or observations supporting findings
   - Traceable to specific code locations or artifact sections

5. **Actionable Recommendations**
   - Specific must-fix items with remediation guidance
   - Clear ownership assignment (developer/tester/architect)

### 5.3 Output Quality Standards

- **Decision explicitness**: No review without explicit decision state
- **Severity discipline**: All findings classified per quality-gate.md Section 2.2
- **Actionability**: Every rejection has specific must-fix items
- **Evidence traceability**: Every finding linked to evidence
- **Governance compliance**: AH-006 checks documented

---

## 6. Escalation Rules

### 6.1 Escalate When:

Reviewer **must** escalate (not proceed independently) when:

| Condition | Escalate To | Reason |
|-----------|-------------|--------|
| Critical security risk identified | security, management | Requires specialized security review |
| Spec vs implementation fundamental conflict | architect, developer, management | Ambiguity cannot be resolved by reviewer alone |
| Design constraint conflict requires replan | architect, management | Implementation fix insufficient |
| Governance conflict requires management decision | management, architect | Canonical document conflict needs authority |
| Unable to produce decision due to missing information | developer, architect | Needs clarification (needs-clarification state) |
| Multiple blocking issues with unclear ownership | management | Requires coordination |

### 6.2 Escalation Process

```
Blocker Identified
  ↓
Document in review-findings-report.open_questions
  ↓
Classify blocker type (spec/design/implementation/governance)
  ↓
Escalate to appropriate role with context
  ↓
Blocker resolved → Continue review
Blocker unresolved → Set needs-clarification state with escalation record
```

### 6.3 Escalation Documentation

Every escalation must include:
- What is blocked
- Why it blocks decision
- Attempted resolutions
- Recommended next steps
- Impact on acceptance decision

---

## 7. Dependencies

### 7.1 Upstream Dependencies

| Role | Output | How Reviewer Consumes |
|------|--------|----------------------|
| **architect** | `design-note` | Verify implementation aligns with design intent |
| **architect** | `module-boundaries` | Check implementation respects architectural constraints |
| **developer** | `implementation-summary` | Establish review surface and understand claims |
| **developer** | `self-check-report` | Treat as input, not substitute for judgment |
| **developer** | `bugfix-report` | Verify root cause fix |
| **tester** | `verification-report` | Evaluate pass/fail evidence and coverage gaps |
| **tester** | `test-scope-report` | Understand testing boundaries |
| **OpenClaw management** | `spec`, `acceptance criteria` | Define expected behavior and acceptance targets |

### 7.2 Downstream Dependencies

| Role | Input | How They Consume |
|------|-------|------------------|
| **acceptance** | `acceptance-decision-record` | Make final acceptance determination |
| **acceptance** | `review-findings-report` | Understand findings and risks |
| **developer** (on reject) | `actionable-feedback-report` | Execute rework |
| **docs** | `review-findings-report` | Sync documentation with findings |
| **security** | `review-findings-report` | Specialized security follow-up on flagged items |

### 7.3 Dependency Flow

```
architect → developer → tester → reviewer → acceptance/docs/security
  (design)  (implement)  (verify)   (judge)     (consume)
```

Reviewer is the **judgment layer** that transforms verification evidence into decision artifacts consumable by acceptance and downstream roles.

---

## 8. Success Criteria

Reviewer work is successful when:

- [ ] **Decision state is explicit**: Clear accept/accept-with-conditions/reject/needs-clarification
- [ ] **Findings are severity-classified**: All findings follow blocker/major/minor/note discipline
- [ ] **Evidence is traceable**: Every finding linked to specific evidence
- [ ] **Governance alignment is verified**: AH-006 checks performed and documented
- [ ] **Rejection is actionable**: Must-fix items have specific remediation guidance
- [ ] **Role boundaries maintained**: No code mutation, no scope redefinition
- [ ] **Downstream consumability**: Acceptance/docs/security can act on reviewer outputs
- [ ] **Honest judgment**: No false confidence, gaps transparently disclosed

---

## 9. Failure Modes

Common reviewer failures to avoid:

| Failure Mode | Detection | Prevention |
|--------------|-----------|------------|
| **Vague review** | Checklist: specific guidance presence | Require actionable suggestions for every finding |
| **Rubber stamp approval** | Checklist: evidence verification | Mandate upstream artifact consumption |
| **Scope creep blindness** | Checklist: spec-implementation-diff execution | Explicit unauthorized addition flagging |
| **Severity confusion** | Checklist: severity classification accuracy | Mandatory severity discipline per quality-gate.md |
| **Governance drift ignorance** | Checklist: AH-006 check presence | Include governance alignment in review checklist |
| **Silent fixing** (BR-007) | Review: changed files scope | Explicit prohibition in role boundary |
| **Rejection without remedy** | Checklist: actionable-feedback-report presence | BR-005 enforcement |
| **Self-check confusion** | Checklist: explicit distinction check | Document self-check vs independent findings |
| **Decision state missing** | Checklist: decision state presence | BR-003 enforcement |
| **Evidence-free findings** | Checklist: evidence traceability | Require evidence links in all findings |

---

## 10. Constraints and Guardrails

### 10.1 Role Purity (per BR-007, BR-010)

- **No code mutation**: Reviewer produces feedback, not fixes; code changes are developer responsibility
- **6-role terminology**: Use architect/developer/tester/reviewer/docs/security consistently
- **Legacy compatibility**: 3-skill references only in mapping notes, never as primary terminology

### 10.2 Decision Discipline (per BR-003, BR-005)

- Every review must produce explicit decision state
- Every rejection must include actionable remediation guidance
- Must-fix items separated from non-blocking improvements

### 10.3 Governance Alignment (per AH-006)

- Must check feature outputs against canonical governance documents:
  - `role-definition.md` for role boundaries
  - `package-spec.md` for terminology
  - `io-contract.md` for artifact formats
  - `quality-gate.md` for severity levels

### 10.4 Upstream Consumption (per BR-001)

- Must consume architect/developer/tester artifacts systematically
- Must not ignore upstream evidence
- Must distinguish self-check from independent review

---

## 11. Interface Contracts

### 11.1 Consumption Contract (from architect/developer/tester)

Reviewer consumes these artifacts per field:

```yaml
consumption_contract:
  design_note:
    design_summary: "Verify implementation aligns with design intent"
    module_boundaries: "Check architectural constraint compliance"
    risks_and_tradeoffs: "Assess risk handling"
    
  implementation_summary:
    goal_alignment: "Verify claimed alignment accuracy"
    changed_files: "Establish review surface"
    known_issues: "Distinguish from new findings"
    risks: "Prioritize review focus"
    
  self_check_report:
    full_content: "Treat as input, not substitute for judgment"
    
  verification_report:
    pass_fail_summary: "Understand testing evidence"
    coverage_gaps: "Identify untested areas"
    
  canonical_governance_documents:
    role_definition_md: "Verify role boundary compliance"
    package_spec_md: "Check terminology consistency"
    io_contract_md: "Validate artifact formats"
    quality_gate_md: "Apply severity classification"
```

### 11.2 Production Contract (to acceptance/docs/security/developer)

Reviewer produces these artifacts:

```yaml
production_contract:
  review_findings_report:
    consumers: [acceptance, docs, security]
    purpose: "Structured findings with governance status"
    
  acceptance_decision_record:
    consumers: [acceptance, management]
    purpose: "Formal decision with rationale"
    
  actionable_feedback_report:
    consumers: [developer, acceptance]
    purpose: "Rework guidance when reject"
```

---

## 12. Governance Alignment Checklist (AH-006)

### 12.1 Canonical Document Alignment

- [ ] Role definitions align with `role-definition.md`
- [ ] Terminology aligns with `package-spec.md`
- [ ] I/O formats align with `io-contract.md`
- [ ] Severity levels align with `quality-gate.md`

### 12.2 Cross-Document Consistency

- [ ] Flow order consistent across spec/plan/tasks
- [ ] Role boundaries consistent with canonical
- [ ] Stage status consistent across documents
- [ ] Terminology consistent within feature

### 12.3 Path Resolution

- [ ] All declared artifact paths resolve to actual files
- [ ] All output paths in plan/tasks resolve correctly
- [ ] Evidence paths in completion-report resolve correctly

### 12.4 Status Truthfulness (per BR-009)

- [ ] Completion-report status is honest (no hidden gaps)
- [ ] README status matches completion-report
- [ ] Status classification uses correct level

### 12.5 README Governance Sync

- [ ] README feature status updated (if needed)
- [ ] README role list updated (if new roles added)
- [ ] README workflow description updated (if changed)
- [ ] Known gaps reflected in README (if any)

---

## 13. Decision State Definitions

### 13.1 Accept

**Definition**: Deliverable acceptable, no blocking issues.

**Criteria**:
- All critical requirements satisfied
- No blocker findings
- Major findings have acceptable justification or planned remediation
- Governance aligned

**Output**: acceptance-decision-record with `decision_state: accept`

### 13.2 Accept-with-Conditions

**Definition**: Acceptable with explicit follow-up items.

**Criteria**:
- Core requirements satisfied
- No blocker findings
- Major findings documented with acceptance conditions
- Clear follow-up plan exists

**Output**: acceptance-decision-record with `decision_state: accept-with-conditions` and `acceptance_conditions` field populated

### 13.3 Reject

**Definition**: Blocking gaps prevent acceptance, rework required.

**Criteria**:
- Critical requirements not satisfied, or
- Blocker findings present, or
- Governance drift requires correction

**Output**: acceptance-decision-record with `decision_state: reject` plus actionable-feedback-report

### 13.4 Needs-Clarification

**Definition**: Cannot decide due to missing/ambiguous information.

**Criteria**:
- Insufficient evidence for decision
- Spec ambiguity prevents judgment
- Missing required inputs

**Output**: acceptance-decision-record with `decision_state: needs-clarification` and `open_questions` field populated

---

## 14. References

- `role-definition.md` Section 4 - Canonical reviewer role definition with AH-006 enhanced responsibilities
- `specs/006-reviewer-core/spec.md` - Feature specification with business rules BR-001 through BR-010
- `specs/003-architect-core/` - Upstream feature providing design-note
- `specs/004-developer-core/` - Upstream feature providing implementation-summary, self-check-report
- `specs/005-tester-core/` - Upstream feature providing verification-report, test-scope-report
- `quality-gate.md` Section 2.2 - Severity classification model (blocker/major/minor/note)
- `docs/audit-hardening.md` - AH-006 governance alignment rules

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial role scope definition aligned with role-definition.md Section 4 and AH-006 enhanced responsibilities |