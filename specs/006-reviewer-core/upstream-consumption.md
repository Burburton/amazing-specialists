# 006-reviewer-core Upstream Consumption Guide

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `006-reviewer-core` |
| **Document Type** | Interface Specification |
| **Version** | 1.0.0 |
| **Created** | 2026-03-26 |
| **Status** | Draft |
| **Owner** | reviewer |
| **Aligned With** | `specs/003-architect-core/`, `specs/004-developer-core/`, `specs/005-tester-core/` |

---

## 1. Overview

### 1.1 Consumption Philosophy

The reviewer role's primary mission is to **perform independent quality review and produce acceptance-oriented judgment**. This document defines how reviewer systematically consumes outputs from `003-architect-core`, `004-developer-core`, and `005-tester-core` to derive evidence-based findings and decisions.

**Core Principles:**

1. **Evidence-Based Review (BR-001)**: Reviewer must consume structured upstream artifacts, not informal assumptions.

2. **Independent Judgment (BR-002)**: Developer self-check and tester verification inform review, but **cannot replace** reviewer judgment.

3. **Three-Source Triangulation**: Reviewer must correlate architect design intent, developer implementation claims, and tester verification evidence.

4. **Governance Alignment (BR-006)**: Reviewer must check outputs against canonical governance documents (AH-006).

5. **Scope Boundary Enforcement (BR-008)**: Reviewer must identify implementation beyond spec as a finding.

6. **Status Truthfulness (BR-009)**: Reviewer must verify completion-report status aligns with README status.

### 1.2 Upstream Artifact Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        THREE UPSTREAM SOURCES                        │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   ARCHITECT     │  │   DEVELOPER     │  │    TESTER       │     │
│  │  (003-core)     │  │  (004-core)     │  │  (005-core)     │     │
│  │                 │  │                 │  │                 │     │
│  │ design-note     │  │ impl-summary    │  │ test-scope      │     │
│  │ module-         │  │ self-check      │  │ verification    │     │
│  │ boundaries      │  │ bugfix-report   │  │ regression-risk │     │
│  │ risks-tradeoffs │  │                 │  │                 │     │
│  │ open-questions  │  │                 │  │                 │     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
│           │                    │                    │               │
└───────────┼────────────────────┼────────────────────┼───────────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │       REVIEWER         │
                    │                        │
                    │  - Triangulate sources │
                    │  - Identify conflicts  │
                    │  - Classify findings   │
                    │  - Make decisions      │
                    └────────────────────────┘
```

---

## 2. Field-by-Field Mapping: Architect Artifacts

### 2.1 design-note Consumption

The `design-note` artifact (AC-001 from 003-architect-core) provides the design baseline that reviewer must compare against implementation.

#### 2.1.1 feature_goal → Review Target Derivation

| Architect Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `feature_goal` | Define what was supposed to be achieved | Primary acceptance criteria baseline |
| `background` | Understand context and motivation | Context for evaluating design decisions |
| `input_sources` | Verify spec requirements were considered | Traceability check |

**Consumption Example:**

```yaml
# Architect Output (design-note)
feature_goal: |
  Establish reviewer as a first-class independent review role with complete 
  capability system, stable artifact contracts, and governance alignment checking.

# Reviewer Interpretation
review_baseline:
  primary_goal: "Reviewer has complete capability system with stable contracts"
  success_criteria:
    - "3 core skills fully implemented"
    - "3 artifact contracts documented"
    - "Governance alignment checking enforced"
  review_focus:
    - "Verify each skill exists and is complete"
    - "Verify each artifact contract has required fields"
    - "Verify AH-006 compliance in review process"
```

**BR-001 Compliance Check:**
- [ ] `feature_goal` read and used as acceptance baseline
- [ ] `background` understood for context
- [ ] `input_sources` verified as requirements baseline

---

#### 2.1.2 requirement_to_design_mapping → Spec-Implementation Diff

| Architect Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `requirement_to_design_mapping[].requirement_id` | Track each requirement | Must verify each is implemented |
| `requirement_to_design_mapping[].design_decision` | Understand design intent | Compare against implementation |
| `requirement_to_design_mapping[].artifact_section` | Locate relevant implementation | Targeted review |

**Consumption Example:**

```yaml
# Architect Output (design-note.requirement_to_design_mapping)
requirement_to_design_mapping:
  - requirement_id: "BR-001"
    requirement_text: "Reviewer Must Consume Upstream Evidence"
    design_decision: "All review outputs must begin with upstream artifact consumption"
    artifact_section: "upstream-consumption.md"

# Reviewer Interpretation
spec_implementation_diff:
  requirement: "BR-001"
  design_intent: "Review outputs consume upstream artifacts first"
  implementation_check:
    - location: "upstream-consumption.md"
      expected: "Document showing how to consume architect/developer/tester outputs"
      actual_status: "verify_exists"
      finding: "pending verification"
```

**BR-001 Compliance Check:**
- [ ] All `requirement_id` entries tracked for verification
- [ ] Each `design_decision` compared against actual implementation
- [ ] Gaps between design and implementation identified

---

#### 2.1.3 constraints → Boundary Verification

| Architect Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `constraints[].constraint_id` | Track constraint | Must verify compliance |
| `constraints[].description` | Understand limitation | Check implementation respects |
| `constraints[].impact` | Assess significance | Prioritize constraint checking |

**Consumption Example:**

```yaml
# Architect Output (design-note.constraints)
constraints:
  - constraint_id: "C-001"
    description: "Must use 6-role formal semantics, not legacy 3-skill terminology"
    source: "spec.md:BR-010"
    impact: "All field names and descriptions use architect/developer/tester/reviewer/docs/security"

# Reviewer Interpretation
constraint_verification:
  - constraint_id: "C-001"
    constraint: "6-role formal semantics"
    verification_method: "Scan documents for legacy terminology"
    check_results:
      - file: "spec.md"
        status: "compliant"
        notes: "Uses reviewer terminology correctly"
      - file: "plan.md"
        status: "verify_needed"
        notes: "Check for spec-writer/task-executor legacy terms"
```

**BR-001 Compliance Check:**
- [ ] All constraints from design-note tracked
- [ ] Each constraint verified against implementation
- [ ] Constraint violations reported as findings

---

#### 2.1.4 non_goals → Scope Creep Detection (BR-008)

| Architect Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `non_goals[].item` | Identify excluded scope | Flag if implemented |
| `non_goals[].rationale` | Understand exclusion reason | Assess if implementation violates design |
| `non_goals[].future_consideration` | Plan future check | Note for future features |

**Consumption Example:**

```yaml
# Architect Output (design-note.non_goals)
non_goals:
  - item: "developer core implementation"
    rationale: "This is feature 004, outside reviewer-core scope"
    future_consideration: false
  - item: "Final independent approval"
    rationale: "This is acceptance layer responsibility, not reviewer"
    future_consideration: false

# Reviewer Interpretation
scope_creep_check:
  excluded_items:
    - item: "developer core implementation"
      check: "No developer-specific code in reviewer-core"
      status: "no_violation"
    - item: "Final independent approval"
      check: "Reviewer recommends, acceptance decides"
      status: "compliant"
  scope_creep_findings: []
```

**BR-008 Compliance Check:**
- [ ] All `non_goals` items checked for unauthorized implementation
- [ ] Scope creep (implementing non_goals) reported as finding
- [ ] Rationale understood for excluded items

---

#### 2.1.5 assumptions → Risk Assessment

| Architect Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `assumptions[].assumption_id` | Track assumption | Verify assumption holds |
| `assumptions[].risk_if_wrong` | Understand consequence | High-risk assumptions prioritized |
| `assumptions[].validation_method` | Check validation | Verify assumption was validated |

**Consumption Example:**

```yaml
# Architect Output (design-note.assumptions)
assumptions:
  - assumption_id: "A-001"
    description: "Features 003, 004, 005 are complete and provide stable artifact contracts"
    risk_if_wrong: "Reviewer artifacts may not align with actual upstream needs"
    validation_method: "Check completion-report.md of features 003, 004, 005"

# Reviewer Interpretation
assumption_verification:
  - assumption_id: "A-001"
    assumption: "Upstream features complete"
    validation_action: "Verify 003/004/005 completion-reports exist and show complete status"
    validation_result: "verify_needed"
    risk_if_invalid: "HIGH - cannot consume upstream without stable contracts"
```

**BR-001 Compliance Check:**
- [ ] All assumptions tracked for validation
- [ ] High-risk assumptions verified before relying on them
- [ ] Invalid assumptions reported as potential blockers

---

#### 2.1.6 open_questions → Resolution Verification

| Architect Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `open_questions[].question_id` | Track question | Verify resolution |
| `open_questions[].temporary_assumption` | Working assumption | Check if still valid |
| `open_questions[].recommended_next_step` | Resolution plan | Verify was executed |

**Consumption Example:**

```yaml
# Architect Output (design-note.open_questions)
open_questions:
  - question_id: "Q-001"
    question: "Which advanced reviewer skills should be prioritized after core completion?"
    why_it_matters: "Affects roadmap for reviewer capability expansion"
    temporary_assumption: "Focus on core skills first; advanced skills prioritized based on usage feedback"
    recommended_next_step: "Gather downstream role usage feedback after core implementation"

# Reviewer Interpretation
open_question_status:
  - question_id: "Q-001"
    status: "open_with_assumption"
    assumption_valid: "true_for_current_feature"
    blocking: false
    note: "Assumption is valid - core skills are in scope, advanced skills deferred"
```

**BR-001 Compliance Check:**
- [ ] All open_questions tracked
- [ ] Resolved vs. unresolved status verified
- [ ] Unresolved questions with blocking impact flagged

---

### 2.2 module-boundaries Consumption

The `module-boundaries` artifact (AC-002 from 003-architect-core) defines architectural boundaries that reviewer must verify are respected.

#### 2.2.1 module_responsibilities → Implementation Boundary Check

| Architect Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `module_responsibilities[].id` | Track responsibility | Verify implementation matches |
| `module_responsibilities[].description` | Expected behavior | Compare against actual |
| `module_responsibilities[].priority` | Review focus | Core responsibilities prioritized |

**Consumption Example:**

```yaml
# Architect Output (module-boundaries.module_responsibilities)
module_responsibilities:
  "MOD-001":
    - id: "R-001"
      description: "Execute independent review of upstream artifacts"
      priority: "core"
      verification_hint: "Check that review process consumes all upstream sources"

# Reviewer Interpretation
boundary_check:
  module: "MOD-001"
  responsibilities:
    - id: "R-001"
      expected: "Independent review consuming all upstream sources"
      actual: "verify_against_implementation"
      verification_method: "Check upstream-consumption.md completeness"
      status: "pending"
```

**BR-003 Compliance Check:**
- [ ] All module responsibilities verified against implementation
- [ ] Core responsibilities receive thorough review
- [ ] Responsibility boundary violations flagged

---

#### 2.2.2 explicit_non_responsibilities → Scope Boundary Verification

| Architect Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `explicit_non_responsibilities[].description` | What module should NOT do | Flag if violated |
| `explicit_non_responsibilities[].rationale` | Why excluded | Understand design intent |
| `explicit_non_responsibilities[].may_belong_to` | Correct owner | Redirect if misfiled |

**Consumption Example:**

```yaml
# Architect Output (module-boundaries.explicit_non_responsibilities)
explicit_non_responsibilities:
  "reviewer-core":
    - id: "NR-001"
      description: "Silently fixing code during review"
      rationale: "Reviewer provides feedback, developer fixes"
      may_belong_to: "developer"

# Reviewer Interpretation
non_responsibility_check:
  - id: "NR-001"
    check: "Reviewer must not mutate production code"
    verification: "Check for any code modifications in review commits"
    status: "verify_needed"
    violation_severity: "blocker"
```

**BR-003 + BR-007 Compliance Check:**
- [ ] All non-responsibilities verified as NOT implemented
- [ ] Violations of non-responsibilities reported as major/blocker findings
- [ ] BR-007 (no code mutation) explicitly verified

---

### 2.3 risks-and-tradeoffs Consumption

The `risks-and-tradeoffs` artifact (AC-003 from 003-architect-core) documents design decisions that reviewer must verify were properly addressed.

#### 2.3.1 risks_introduced → Risk Resolution Verification

| Architect Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `risks_introduced[].risk` | Identified risk | Verify mitigation implemented |
| `risks_introduced[].severity` | Priority | Critical/high risks prioritized |
| `risks_introduced[].mitigation_strategy` | Expected mitigation | Verify implemented |
| `risks_introduced[].mitigation_owner` | Responsible role | Verify owner addressed |

**Consumption Example:**

```yaml
# Architect Output (risks-and-tradeoffs.risks_introduced)
risks_introduced:
  - risk: "Review findings may be too vague to be actionable"
    severity: "Medium"
    likelihood: "Possible"
    impact: "Developers cannot remediate effectively"
    mitigation_strategy: "Use structured finding templates with must-fix/suggest separation"
    mitigation_owner: "reviewer"

# Reviewer Interpretation
risk_verification:
  - risk: "Vague findings"
    severity: "Medium"
    expected_mitigation: "Structured finding templates"
    verification:
      - check: "Finding template exists with must-fix/suggest separation"
        location: "contracts/review-findings-report-contract.md"
        status: "verify_exists"
      - check: "Templates used in skill examples"
        location: "skills/*/examples/"
        status: "verify_needed"
```

**BR-001 Compliance Check:**
- [ ] All identified risks tracked
- [ ] Mitigation strategies verified as implemented
- [ ] High/critical risks receive priority verification

---

### 2.4 open-questions Consumption

The `open-questions` artifact (AC-004 from 003-architect-core) captures unresolved design questions that reviewer must verify were addressed.

#### 2.4.1 Open Questions Resolution Status

| Architect Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `question` | The unresolved question | Verify resolution in implementation |
| `temporary_assumption` | Working assumption | Check if still valid or resolved |
| `recommended_next_step` | Resolution plan | Verify was executed |
| `impact_surface` | Affected components | Focus verification areas |

**Consumption Example:**

```yaml
# Architect Output (open-questions)
question: "Should reviewer flag items for security role, or handle basic security concerns directly?"
why_it_matters: "Affects reviewer-scope boundary definition"
temporary_assumption: "Reviewer flags; security role performs specialized review"
impact_surface:
  direct:
    - "reviewer role-scope"
    - "security-skill interfaces"
recommended_next_step: "Clarify in spec with security role owners"

# Reviewer Interpretation
open_question_verification:
  question: "Reviewer vs security responsibility boundary"
  temporary_assumption: "Reviewer flags, security handles"
  verification:
    - check: "Spec clarifies reviewer does not perform security review"
      location: "spec.md Section 4.1 Non-Responsibilities"
      expected: "Explicit statement that security concerns are escalated"
      status: "verify_needed"
  blocking: false
  impact_if_unresolved: "Role confusion may occur"
```

**BR-001 Compliance Check:**
- [ ] All open questions tracked
- [ ] Resolution status verified against implementation
- [ ] Blocking unresolved questions flagged

---

## 3. Field-by-Field Mapping: Developer Artifacts

### 3.1 implementation-summary Consumption

The `implementation-summary` artifact (AC-001-dev from 004-developer-core) documents code changes and goal achievement.

#### 3.1.1 goal_alignment → Claim Verification

| Developer Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `goal_alignment.goal` | Original intent | Compare against architect design-goal |
| `goal_alignment.achieved` | Claimed status | Verify claim accuracy |
| `goal_alignment.deviations` | Intentional differences | Assess deviation acceptability |

**Consumption Example:**

```yaml
# Developer Output (implementation-summary.goal_alignment)
goal_alignment:
  goal: "Implement reviewer-core with 3 skills, 3 contracts, governance alignment"
  achieved: true
  deviations: []

# Architect Reference (design-note.feature_goal)
feature_goal: "Establish reviewer as first-class independent review role with complete capability system..."

# Reviewer Interpretation (Triangulation)
goal_verification:
  architect_goal: "Complete capability system with stable contracts"
  developer_claim: "3 skills, 3 contracts implemented"
  triangulation:
    - check: "Skills exist in .opencode/skills/reviewer/"
      status: "verify_exists"
    - check: "Contracts exist in specs/006-reviewer-core/contracts/"
      status: "verify_exists"
    - check: "Governance alignment enforced"
      status: "verify_in_spec"
  deviation_check:
    architect_expectation: "Complete capability system"
    developer_delivered: "3 skills, 3 contracts"
    match: "verify_alignment"
```

**BR-001 + BR-002 Compliance Check:**
- [ ] `goal_alignment.goal` compared against architect design-goal
- [ ] `goal_alignment.achieved` claim verified independently
- [ ] `deviations` assessed for acceptability
- [ ] Developer claim NOT accepted without independent verification

---

#### 3.1.2 changed_files → Review Surface Definition

| Developer Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `changed_files[].path` | Files to review | Direct mapping to review targets |
| `changed_files[].change_type` | Change nature | Focus review depth |
| `changed_files[].description` | Change purpose | Understand modification intent |
| `changed_files[].lines_changed` | Change magnitude | Gauge review scope |

**Consumption Example:**

```yaml
# Developer Output (implementation-summary.changed_files)
changed_files:
  - path: "specs/006-reviewer-core/spec.md"
    change_type: "added"
    description: "Feature specification"
    lines_changed:
      added: 834
      deleted: 0
  - path: "specs/006-reviewer-core/upstream-consumption.md"
    change_type: "added"
    description: "Upstream consumption guide"
    lines_changed:
      added: 450
      deleted: 0

# Reviewer Interpretation
review_surface:
  files_to_review:
    - path: "specs/006-reviewer-core/spec.md"
      priority: "critical"
      focus: "Requirements completeness, BR compliance, NFR coverage"
    - path: "specs/006-reviewer-core/upstream-consumption.md"
      priority: "high"
      focus: "Field mapping completeness, BR-001/BR-002 compliance"
  total_lines_changed: 1284
  estimated_review_effort: "45-60 minutes"
```

**BR-001 Compliance Check:**
- [ ] All `changed_files` mapped to review targets
- [ ] `change_type` informs review depth
- [ ] Review scope covers all changed files

---

#### 3.1.3 known_issues → Known Limitation Acknowledgment

| Developer Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `known_issues[].issue_id` | Track known issue | Distinguish from new findings |
| `known_issues[].description` | Limitation detail | Acknowledge in review |
| `known_issues[].severity` | Impact level | Assess if acceptable |
| `known_issues[].workaround` | Mitigation | Verify workaround works |

**Consumption Example:**

```yaml
# Developer Output (implementation-summary.known_issues)
known_issues:
  - issue_id: "ISSUE-001"
    description: "Advanced reviewer skills (performance, compliance) not implemented"
    severity: "low"
    component: "skills"
    planned_fix: "Future enhancement"
    workaround: "Core skills cover primary use cases"

# Reviewer Interpretation
known_issue_acknowledgment:
  - issue_id: "ISSUE-001"
    description: "Advanced skills not in scope"
    reviewer_action: "Verify this is documented as out-of-scope in spec.md"
    new_finding: false
    note: "Already documented as non-goal, no additional finding"
```

**BR-001 Compliance Check:**
- [ ] All `known_issues` acknowledged in review
- [ ] Known issues NOT reported as new findings
- [ ] Workarounds verified if applicable

---

#### 3.1.4 risks → Risk Review Focus

| Developer Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `risks[].risk_id` | Track risk | Verify mitigation |
| `risks[].description` | Risk detail | Assess in review |
| `risks[].level` | Priority | High-risk areas prioritized |
| `risks[].mitigation` | Planned mitigation | Verify implemented |
| `risks[].owner` | Responsible role | Verify owner addressed |

**Consumption Example:**

```yaml
# Developer Output (implementation-summary.risks)
risks:
  - risk_id: "RISK-001"
    description: "Reviewer may provide vague feedback without templates"
    level: "medium"
    mitigation: "Structured finding templates enforce specificity"
    owner: "reviewer"

# Reviewer Interpretation
risk_review:
  - risk_id: "RISK-001"
    risk: "Vague feedback"
    expected_mitigation: "Structured templates"
    verification:
      check: "Finding templates exist with must-fix/suggest separation"
      status: "verify_needed"
    priority: "medium"
```

**BR-001 Compliance Check:**
- [ ] All `risks` tracked for mitigation verification
- [ ] High-risk areas receive thorough review
- [ ] Mitigations verified as implemented

---

### 3.2 self-check-report Consumption (BR-002 Critical)

**BR-002 COMPLIANCE IS CRITICAL**: Self-check is **input**, not **substitute** for independent review.

#### 3.2.1 Distinguishing Self-Check from Independent Review (BR-002)

| Developer Field | Reviewer Usage | BR-002 Distinction |
|-----------------|----------------|-------------------|
| `self_check_report.overall_status` | Developer claim | `PASS` ≠ reviewer approval; independent verification required |
| `self_check_report.check_results` | Pre-validated items | Use as hints, verify independently |
| `self_check_report.blockers` | Pre-identified issues | Verify blockers are fixed |
| `self_check_report.warnings` | Known concerns | Consider in review focus |

**BR-002 Compliance Matrix:**

| Aspect | Developer Self-Check | Reviewer Independent Review |
|--------|---------------------|------------------------------|
| **Purpose** | Pre-delivery validation | Independent acceptance judgment |
| **Authority** | Internal to implementation | Consumable by downstream roles |
| **Evidence** | Self-reported | Independently verified |
| **Decision** | Cannot approve | Can recommend accept/reject |
| **Cannot Replace** | Cannot replace reviewer judgment | Is the independent judgment |

**Consumption Example:**

```yaml
# Developer Output (self-check-report)
self_check_report:
  overall_status: "PASS"
  summary:
    total_checks: 32
    passed: 32
    failed: 0
    blockers: 0
    warnings: 2
  check_results:
    - category: "Goal Alignment"
      checks:
        - item: "Implementation matches task goal"
          status: "pass"
          severity: "blocker"
          description: "All acceptance criteria met"

# Reviewer Interpretation (BR-002 Compliant)
independent_review_approach:
  self_check_acknowledged:
    status: "Developer claims PASS with 32/32 checks"
    role: "INFORMS review focus, does NOT substitute for review"
  
  independent_verification:
    - claim: "Implementation matches task goal"
      reviewer_action: "Compare implementation against architect design-note independently"
      evidence_type: "Reviewer's own spec-implementation-diff, NOT developer assertion"
    - claim: "All acceptance criteria met"
      reviewer_action: "Verify each criterion against evidence"
      evidence_type: "Independent verification, NOT self-check assertion"
  
  spot_checks:
    minimum: 3
    items:
      - "Verify at least 3 self-check items are accurate"
      - "Check: Files exist at declared paths"
      - "Check: Implementation matches description"
```

**BR-002 Compliance Check:**
- [ ] Self-check distinguished from independent review in findings report
- [ ] Self-check used as hints, not evidence
- [ ] Independent evidence collected for all claims
- [ ] Reviewer decision does NOT rely solely on self-check PASS

---

### 3.3 bugfix-report Consumption (for Bugfix Review)

When reviewing a bugfix, the `bugfix-report` artifact (AC-003-dev from 004-developer-core) provides critical context.

#### 3.3.1 root_cause → Fix Verification

| Developer Field | Reviewer Usage | Review Impact |
|-----------------|----------------|---------------|
| `root_cause.category` | Failure type | Verify fix addresses category |
| `root_cause.description` | Deep understanding | Verify fix addresses root cause, not symptom |
| `root_cause.contributing_factors` | Conditions | Verify all factors addressed |

**Consumption Example:**

```yaml
# Developer Output (bugfix-report.root_cause)
root_cause:
  category: "logic_error"
  description: |
    Condition check was inverted. When user.hasPermission() returns false,
    code was allowing access instead of denying.
  analysis_method: "Code Review + Reproduction"
  contributing_factors:
    - factor: "No unit test for permission denial case"
      impact: "Bug not caught in testing"

# Reviewer Interpretation
bugfix_verification:
  root_cause: "Inverted condition check"
  fix_verification:
    - check: "Condition is now correct"
      status: "verify_code_change"
    - check: "Unit test added for denial case"
      status: "verify_test_exists"
  contributing_factor_addressed:
    - factor: "Missing test"
      fix: "New test added"
      verification: "Check tests/permission.test.ts for denial case"
```

**BR-001 Compliance Check:**
- [ ] `root_cause` understood
- [ ] Fix verified to address root cause, not just symptom
- [ ] Contributing factors addressed

---

## 4. Field-by-Field Mapping: Tester Artifacts

### 4.1 test-scope-report Consumption

The `test-scope-report` artifact (AC-001-test from 005-tester-core) defines what tester planned to verify.

#### 4.1.1 goal_under_test → Test Coverage Baseline

| Tester Field | Reviewer Usage | Review Impact |
|--------------|----------------|---------------|
| `goal_under_test.original_goal` | What was supposed to be tested | Verify matches architect goal |
| `goal_under_test.test_interpretation` | Tester's understanding | Verify interpretation is correct |
| `goal_under_test.acceptance_targets` | Specific criteria | Use for acceptance decision |

**Consumption Example:**

```yaml
# Tester Output (test-scope-report.goal_under_test)
goal_under_test:
  original_goal: "Implement reviewer-core with 3 skills, 3 contracts"
  test_interpretation: "Verify each skill exists and is functional"
  acceptance_targets:
    - criterion: "3 skills exist with SKILL.md"
      measurable: true
      test_method: "file existence check"
    - criterion: "3 contracts exist with required fields"
      measurable: true
      test_method: "schema validation"

# Reviewer Interpretation
test_coverage_assessment:
  architect_goal: "Complete capability system"
  tester_interpretation: "3 skills, 3 contracts exist"
  alignment_check:
    - architect: "Complete capability system"
      tester: "3 skills, 3 contracts"
      match: "partial"
      gap: "Capability system includes validation layer, educational assets"
  finding: "Test scope may not fully cover architect goal"
```

**BR-001 Compliance Check:**
- [ ] `goal_under_test` compared against architect goal
- [ ] Gaps between test scope and design intent identified
- [ ] Acceptance targets used for decision baseline

---

#### 4.1.2 in_scope_items vs out_of_scope_items → Coverage Gap Assessment

| Tester Field | Reviewer Usage | Review Impact |
|--------------|----------------|---------------|
| `in_scope_items` | What was tested | Verify critical items covered |
| `out_of_scope_items` | What was excluded | Assess risk of exclusion |
| `out_of_scope_items[].reason` | Why excluded | Evaluate justification |
| `out_of_scope_items[].impact_assessment` | Risk | Factor into decision |

**Consumption Example:**

```yaml
# Tester Output
in_scope_items:
  - item_id: "SCOPE-001"
    description: "Code-review-checklist skill functionality"
    category: "functional"
out_of_scope_items:
  - item_id: "OUT-001"
    description: "Performance review skill"
    reason: "Not in current feature scope"
    impact_assessment: "No performance review capability in v1"
    deferred_to: "Future enhancement"

# Reviewer Interpretation
coverage_assessment:
  covered:
    - item: "Code-review-checklist skill"
      status: "tested"
  excluded:
    - item: "Performance review skill"
      reason: "Out of scope per spec.md"
      acceptable: true
      note: "Documented as non-goal in spec"
  coverage_gaps: []
```

**BR-001 Compliance Check:**
- [ ] `in_scope_items` cover critical functionality
- [ ] `out_of_scope_items` exclusions are justified
- [ ] Risk from exclusions factored into decision

---

### 4.2 verification-report Consumption

The `verification-report` artifact (AC-002-test from 005-tester-core) provides evidence of what passed/failed.

#### 4.2.1 execution_summary → Evidence Quality Assessment

| Tester Field | Reviewer Usage | Review Impact |
|--------------|----------------|---------------|
| `execution_summary.total_tests` | Test count | Gauge coverage |
| `execution_summary.passed` | Pass count | Primary success indicator |
| `execution_summary.failed` | Fail count | Blocking if unresolved |
| `execution_summary.blocked` | Blocked count | Potential review blockers |

**Consumption Example:**

```yaml
# Tester Output (verification-report.execution_summary)
execution_summary:
  total_tests: 24
  passed: 24
  failed: 0
  skipped: 0
  blocked: 0
  execution_environment: "local (jest)"

# Reviewer Interpretation
evidence_assessment:
  test_execution:
    total: 24
    passed: 24
    pass_rate: "100%"
  evidence_strength: "HIGH - all tests pass, no failures or blockers"
  confidence_boost: "Tests provide strong evidence for implementation claims"
  independent_verification:
    note: "Tests executed by tester, evidence is independent of developer self-check"
```

**BR-001 Compliance Check:**
- [ ] `execution_summary` reviewed
- [ ] Failed tests evaluated for blocking impact
- [ ] Evidence strength assessed

---

#### 4.2.2 confidence_level → Decision Input (BR-007)

| Tester Field | Reviewer Usage | Review Impact |
|--------------|----------------|---------------|
| `confidence_level.level` | Tester's confidence | Factor into reviewer confidence |
| `confidence_level.rationale` | Why this level | Understand evidence quality |
| `confidence_level.evidence_strength` | Evidence quality | Assess for decision |

**Consumption Example:**

```yaml
# Tester Output (verification-report.confidence_level)
confidence_level:
  level: "FULL"
  rationale: "All planned tests pass, edge cases covered, coverage meets targets"
  evidence_strength: "Automated tests with assertion evidence and coverage report"
  assumptions_made: []

# Reviewer Interpretation
confidence_integration:
  tester_confidence: "FULL"
  reviewer_action: "Use as input for reviewer confidence"
  independent_check:
    - check: "Verify confidence claim is justified"
      method: "Review test files and coverage report independently"
  reviewer_confidence:
    level: "derive_from_evidence"
    factors:
      - "Tester confidence: FULL"
      - "All tests pass: true"
      - "Coverage gaps: none reported"
```

**BR-001 Compliance Check:**
- [ ] `confidence_level` reviewed
- [ ] Tester confidence used as input, not substitute
- [ ] Reviewer derives own confidence from evidence

---

#### 4.2.3 coverage_gaps → Risk Factor

| Tester Field | Reviewer Usage | Review Impact |
|--------------|----------------|---------------|
| `coverage_gaps[].description` | What's not tested | Assess risk |
| `coverage_gaps[].reason_uncovered` | Why not tested | Evaluate justification |
| `coverage_gaps[].risk_assessment` | Potential impact | Factor into decision |
| `coverage_gaps[].priority_to_address` | Urgency | Flag for follow-up |

**Consumption Example:**

```yaml
# Tester Output (verification-report.coverage_gaps)
coverage_gaps:
  - gap_id: "GAP-001"
    description: "Governance alignment checking not tested"
    affected_component: "spec-implementation-diff skill"
    reason_uncovered: "No automated test framework for governance documents"
    risk_assessment: "Governance drift may not be detected"
    priority_to_address: "high"

# Reviewer Interpretation
gap_assessment:
  - gap_id: "GAP-001"
    description: "Governance alignment not tested"
    risk: "HIGH - AH-006 compliance requires this"
    reviewer_action:
      - "Verify skill documentation includes governance checking"
      - "Manual review of governance alignment capability"
      - "Flag as follow-up action for test enhancement"
```

**BR-001 Compliance Check:**
- [ ] All `coverage_gaps` reviewed
- [ ] High-priority gaps flagged
- [ ] Gaps factored into acceptance conditions

---

### 4.3 regression-risk-report Consumption

The `regression-risk-report` artifact (AC-003-test from 005-tester-core) identifies potential regression risks.

#### 4.3.1 regression_surfaces → Risk Awareness

| Tester Field | Reviewer Usage | Review Impact |
|--------------|----------------|---------------|
| `regression_surfaces[].module` | Affected module | Understand impact surface |
| `regression_surfaces[].likelihood` | Probability | Factor into risk assessment |
| `regression_surfaces[].impact_severity` | Impact | Prioritize attention |
| `regression_surfaces[].risk_score` | Combined score | Use for prioritization |

**Consumption Example:**

```yaml
# Tester Output (regression-risk-report.regression_surfaces)
regression_surfaces:
  - surface_id: "RS-001"
    module: "architect-core"
    functionality: "Design artifact consumption"
    connection_type: "direct"
    likelihood: "low"
    impact_severity: "major"
    risk_score: 4

# Reviewer Interpretation
regression_awareness:
  - surface: "architect-core consumption"
    risk_score: 4
    likelihood: "low"
    impact: "major"
    reviewer_action: "Verify reviewer can still consume architect artifacts correctly"
```

**BR-001 Compliance Check:**
- [ ] All `regression_surfaces` reviewed
- [ ] High-risk surfaces flagged for attention
- [ ] Regression risks documented in findings

---

## 5. Three-Source Triangulation

### 5.1 Triangulation Framework

Reviewer must correlate three upstream sources to identify conflicts:

```
┌─────────────────┐
│    ARCHITECT    │
│   (Should Be)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│   DEVELOPER     │────▶│    TESTER       │
│   (Claimed)     │     │   (Verified)    │
└─────────────────┘     └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
         ┌─────────────────────┐
         │     REVIEWER        │
         │   (Independent      │
         │    Judgment)        │
         └─────────────────────┘
```

### 5.2 Triangulation Checks

| Check | Architect Source | Developer Source | Tester Source | Conflict Type |
|-------|------------------|------------------|---------------|---------------|
| Goal alignment | `design-note.feature_goal` | `implementation-summary.goal_alignment.goal` | `test-scope-report.goal_under_test` | Goal mismatch |
| Scope alignment | `design-note.non_goals` | `implementation-summary.changed_files` | `test-scope-report.out_of_scope_items` | Scope creep |
| Risk coverage | `risks-and-tradeoffs.risks_introduced` | `implementation-summary.risks` | `verification-report.coverage_gaps` | Unmitigated risk |
| Constraint compliance | `design-note.constraints` | `implementation-summary.deviation` | `verification-report.failed_cases` | Constraint violation |

### 5.3 Triangulation Example

```yaml
triangulation_analysis:
  goal_check:
    architect: "Complete capability system with stable contracts"
    developer: "3 skills, 3 contracts implemented"
    tester: "3 skills, 3 contracts tested"
    finding: "ALIGNED - all sources agree on scope"

  scope_check:
    architect_non_goals: ["docs-core implementation", "security-core implementation"]
    developer_changed_files: ["specs/006-reviewer-core/*"]
    tester_out_of_scope: ["docs-core testing", "security-core testing"]
    finding: "ALIGNED - no scope creep detected"

  risk_check:
    architect_risks: ["Review findings may be vague"]
    developer_risks: ["Vague feedback without templates"]
    tester_coverage_gaps: ["No automated governance test"]
    finding: "PARTIAL - governance testing gap identified"

  constraint_check:
    architect_constraints: ["Use 6-role terminology"]
    developer_compliance: "Verified in implementation-summary"
    tester_verification: "Not explicitly tested"
    finding: "NEEDS_VERIFICATION - constraint tested manually"
```

---

## 6. BR-002 Compliance: Self-Check vs Independent Review

### 6.1 Formal Distinction

| Dimension | Developer Self-Check | Tester Verification | Reviewer Independent Review |
|-----------|---------------------|---------------------|------------------------------|
| **Executor** | developer | tester | reviewer |
| **Timing** | Pre-delivery | Post-delivery | Post-verification |
| **Purpose** | Validate own work | Provide evidence | Independent judgment |
| **Evidence Type** | Self-reported | Independently observed | Triangulated from all sources |
| **Can Approve** | No | No | Recommends only |
| **Conflict of Interest** | Yes (inherent) | No | No |

### 6.2 Review Report Language Requirements

**Prohibited (BR-002 Violation):**
- ❌ "Developer self-check passed, so we approve"
- ❌ "Tester verified, so no need for independent review"
- ❌ "Self-check covers everything, review complete"

**Required (BR-002 Compliant):**
- ✅ "Reviewer independently verified..."
- ✅ "Evidence: [reviewer's own observations]"
- ✅ "Developer self-check noted, independent verification performed"
- ✅ "Tester evidence considered, reviewer conducted own analysis"

### 6.3 Self-Check Spot-Check Requirements

Reviewer must spot-check at least **3 self-check items** for accuracy:

```yaml
spot_check_requirements:
  minimum_items: 3
  suggested_items:
    - "Implementation matches task goal"
    - "Files exist at declared paths"
    - "Required fields present in artifacts"
    - "No scope creep detected"
    - "Constraints respected"

  reporting:
    accurate: "Self-check accuracy verified for X items"
    inaccurate: "Self-check inaccuracy found: [description]. Lower confidence in developer claims."
```

---

## 7. Governance Alignment Checking (BR-006 / AH-006)

### 7.1 Canonical Documents to Check

| Document | Check Type | Severity if Violation |
|----------|------------|----------------------|
| `role-definition.md` | Role boundaries match | major |
| `package-spec.md` | Terminology consistent | major |
| `io-contract.md` | Artifact formats aligned | major |
| `quality-gate.md` | Severity levels used correctly | major |
| `AGENTS.md` | Execution rules followed | major |
| `README.md` | Status truthfulness (BR-009) | major |

### 7.2 Governance Alignment Checklist

```yaml
governance_alignment_check:
  role_boundaries:
    - check: "Reviewer does not implement developer responsibilities"
      reference: "role-definition.md Section 4"
      status: "verify"
    - check: "Reviewer does not perform tester verification"
      reference: "role-definition.md Section 4"
      status: "verify"

  terminology:
    - check: "Uses 6-role terms (architect/developer/tester/reviewer/docs/security)"
      reference: "package-spec.md"
      status: "verify"
    - check: "No legacy 3-skill terminology in primary documents"
      reference: "AGENTS.md Role Semantics Priority"
      status: "verify"

  artifact_formats:
    - check: "Artifact contracts follow io-contract.md structure"
      reference: "io-contract.md"
      status: "verify"

  severity_discipline:
    - check: "Findings use blocker/major/minor/note from quality-gate.md"
      reference: "quality-gate.md Section 2.2"
      status: "verify"

  status_truthfulness:
    - check: "completion-report status matches README status"
      reference: "AGENTS.md AH-004"
      status: "verify_if_applicable"
```

---

## 8. Handling Missing or Incomplete Upstream Outputs

### 8.1 Missing Fields Handling

| Missing Source/Field | Impact | Reviewer Action | Escalation |
|----------------------|--------|-----------------|------------|
| `design-note` | Cannot verify design alignment | Request from architect | Yes (BLOCKED) |
| `implementation-summary` | Cannot verify implementation claims | Request from developer | Yes (BLOCKED) |
| `verification-report` | No independent test evidence | Increase review thoroughness | No |
| `self-check-report` | No pre-validation hints | Proceed with full independent review | No |
| `module-boundaries` | Cannot verify boundary compliance | Infer from code structure | No |
| `bugfix-report.root_cause` (bugfix scenario) | Cannot verify fix completeness | Request from developer | Yes (BLOCKED) |

### 8.2 Incomplete Output Handling

**Scenario: design-note missing requirement_to_design_mapping**

```yaml
review_strategy:
  adjustment: "Derive requirements from spec.md directly"
  action: "Read spec.md and create own requirement list"
  documentation: "Note that design-note was incomplete"
  finding: "Report as minor finding - design-note should include requirement mapping"
```

**Scenario: verification-report shows partial confidence**

```yaml
review_strategy:
  adjustment: "Increase independent verification of low-confidence areas"
  action: "Conduct manual review of areas tester flagged as partial"
  documentation: "Document independent findings for gap areas"
  decision_impact: "May require accept-with-conditions instead of accept"
```

### 8.3 Escalation Triggers

Escalate to appropriate role/management when:

| Condition | Reason | Escalation Level |
|-----------|--------|-----------------|
| `design-note` completely missing | Cannot perform spec-implementation diff | Level 2 (architect + management) |
| `implementation-summary` claims contradict evidence | Honesty concern | Level 2 (developer + management) |
| `verification-report` shows critical failures not addressed | Blocking issue unresolved | Level 2 (developer + tester) |
| Governance alignment conflict detected | AH-006 violation | Level 2 (architect + management) |
| Status truthfulness violation (BR-009) | Misrepresentation | Level 2 (management) |

---

## 9. Upstream Artifact Reading Guide

### 9.1 Reading Order

```
1. design-note (architect)
   ↓ (understand design intent)
2. module-boundaries (architect)
   ↓ (understand architectural constraints)
3. risks-and-tradeoffs (architect)
   ↓ (understand decision rationale)
4. implementation-summary (developer)
   ↓ (understand implementation claims)
5. self-check-report (developer)
   ↓ (understand pre-validation status)
6. test-scope-report (tester)
   ↓ (understand what was tested)
7. verification-report (tester)
   ↓ (understand test results)
8. regression-risk-report (tester)
   ↓ (understand regression concerns)
```

### 9.2 Example: Complete Consumption Workflow

**Step 1: Read design-note**
```markdown
## Design Intent
- Goal: Complete reviewer capability system
- Key decisions: 3 skills, 3 contracts, governance alignment
- Constraints: 6-role terminology, no scope creep
```

**Step 2: Read module-boundaries**
```markdown
## Architectural Constraints
- Reviewer consumes 3 upstream sources
- Reviewer produces decision artifacts
- Reviewer must not mutate code
```

**Step 3: Read implementation-summary**
```markdown
## Implementation Claims
- 3 skills implemented
- 3 contracts documented
- Governance alignment included
```

**Step 4: Read verification-report**
```markdown
## Test Evidence
- 24 tests pass
- Coverage: 92%
- Confidence: FULL
```

**Step 5: Triangulate and Decide**
```markdown
## Reviewer Judgment
- Architect goal vs implementation: ALIGNED
- Test evidence supports claims: VERIFIED
- Governance alignment checked: CONFIRMED
- Decision: RECOMMEND ACCEPT
```

---

## 10. Validation Checklist

### 10.1 Pre-Review Consumption Check

Before beginning review, verify:

- [ ] `design-note` read and design intent understood
- [ ] `module-boundaries` read and constraints understood
- [ ] `risks-and-tradeoffs` read and decision rationale understood
- [ ] `implementation-summary` read and claims understood
- [ ] `self-check-report` read (as input, not evidence)
- [ ] `test-scope-report` read and test scope understood
- [ ] `verification-report` read and evidence assessed
- [ ] `regression-risk-report` read (if applicable)
- [ ] BR-002 compliance: Independent review planned (not relying on self-check)

### 10.2 Post-Review Consumption Check

After review, verify:

- [ ] All three upstream sources (architect, developer, tester) were consumed
- [ ] Triangulation performed between sources
- [ ] Conflicts between sources identified and documented
- [ ] Self-check used as input, not substitute for independent review
- [ ] Governance alignment checked (AH-006)
- [ ] Scope creep checked (BR-008)
- [ ] Status truthfulness verified (BR-009)
- [ ] Findings classified by severity (BR-004)
- [ ] Decision state explicit (BR-003)
- [ ] Rejection includes actionable feedback (BR-005)

### 10.3 BR-002 Specific Compliance Check

- [ ] Self-check distinguished from independent review in findings report
- [ ] Self-check used as hints, not evidence
- [ ] Independent evidence collected for critical claims
- [ ] At least 3 self-check items spot-checked for accuracy
- [ ] Reviewer decision does NOT rely solely on developer/tester claims

---

## 11. References

- `specs/006-reviewer-core/spec.md` - Feature specification (Section 4.2, Section 6 Business Rules)
- `specs/006-reviewer-core/role-scope.md` - Reviewer role scope (Section 4: Inputs)
- `specs/003-architect-core/contracts/design-note-contract.md` - Architect artifact schema
- `specs/003-architect-core/contracts/module-boundaries-contract.md` - Architect artifact schema
- `specs/003-architect-core/contracts/risks-and-tradeoffs-contract.md` - Architect artifact schema
- `specs/003-architect-core/contracts/open-questions-contract.md` - Architect artifact schema
- `specs/004-developer-core/contracts/implementation-summary-contract.md` - Developer artifact schema
- `specs/004-developer-core/contracts/self-check-report-contract.md` - Developer artifact schema
- `specs/004-developer-core/contracts/bugfix-report-contract.md` - Developer artifact schema
- `specs/005-tester-core/contracts/test-scope-report-contract.md` - Tester artifact schema
- `specs/005-tester-core/contracts/verification-report-contract.md` - Tester artifact schema
- `specs/005-tester-core/contracts/regression-risk-report-contract.md` - Tester artifact schema
- `role-definition.md` - 6-role definitions
- `quality-gate.md` - Severity level definitions (Section 2.2)
- `docs/audit-hardening.md` - AH-006 governance alignment rules

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial upstream consumption guide aligned with architect, developer, and tester contracts |