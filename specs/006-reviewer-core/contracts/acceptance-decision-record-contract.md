# Acceptance Decision Record Contract

## Contract Metadata

| Field | Value |
|-------|-------|
| **Contract ID** | AC-002-rev |
| **Contract Name** | Acceptance Decision Record Contract |
| **Version** | 1.0.0 |
| **Owner** | reviewer |
| **Consumers** | acceptance, management, developer, docs, security |

---

## Purpose

Define the complete schema and validation rules for the `acceptance-decision-record` artifact, which records the reviewer's formal decision state, rationale, conditions, and downstream recommendations for a reviewed deliverable.

This artifact is the **primary decision output** of the reviewer role and must be consumed by the acceptance layer to determine final disposition of the work.

---

## Schema

```yaml
acceptance_decision_record:
  # Metadata
  dispatch_id: string              # Dispatch ID for traceability
  task_id: string                  # Task ID under review
  created_at: timestamp            # Decision timestamp
  created_by: string               # reviewer (always "reviewer")
  
  # Decision Target (Required)
  target_feature:
    feature_id: string             # Feature identifier (e.g., "006-reviewer-core")
    feature_name: string           # Human-readable name
    deliverable_type: enum         # feature | bugfix | enhancement | refactor
    review_scope: string           # What was reviewed (files, artifacts, etc.)
  
  # Decision State (Required - BR-003)
  decision_state: enum             # accept | accept-with-conditions | reject | needs-clarification
  decision_timestamp: timestamp
  
  # Decision Rationale (Required)
  decision_rationale:
    summary: string                # One-paragraph explanation of the decision
    key_factors: string[]          # Primary factors influencing the decision
    evidence_summary: string       # Brief summary of supporting evidence
    alternative_states_considered: # Other decision states evaluated
      - state: enum
        reason_rejected: string
  
  # Blocking Issues (Required)
  blocking_issues:
    - issue_id: string
      severity: enum               # blocker | major | minor | note
      category: enum               # correctness | completeness | consistency | security | performance | governance
      description: string          # What is wrong
      location: string             # File, function, or artifact reference
      impact: string               # What this blocks or risks
      remediation_required: string # What must be done to resolve
      evidence_reference: string   # Link to supporting evidence
  
  # Non-Blocking Issues (Required)
  non_blocking_issues:
    - issue_id: string
      severity: enum               # minor | note
      category: enum               # maintainability | style | documentation | optimization
      description: string          # What could be improved
      location: string             # File, function, or artifact reference
      recommendation: string       # Suggested improvement
      priority: enum               # high | medium | low
  
  # Acceptance Conditions (Required - for accept-with-conditions)
  acceptance_conditions:
    conditions_present: boolean    # true if decision_state is accept-with-conditions
    conditions:
      - condition_id: string
        description: string        # What must happen post-acceptance
        responsible_role: enum     # developer | tester | docs | security
        due_within: string | null  # Timeframe if applicable
        verification_method: string # How to verify condition met
    residual_risks: string[]       # Risks accepted with conditional acceptance
  
  # Downstream Recommendation (Required)
  downstream_recommendation:
    primary_action: enum           # PROCEED_TO_ACCEPTANCE | RETURN_TO_DEVELOPER | REQUEST_CLARIFICATION | ESCALATE
    target_roles: enum[]           # acceptance | developer | tester | docs | security | architect | management
    urgency: enum                  # normal | high | urgent
    handoff_artifacts: string[]    # Artifacts to pass to downstream
    next_steps: string[]           # Specific actions for downstream roles
  
  # Reviewer Confidence Level (Required - BR-007)
  reviewer_confidence_level:
    level: enum                    # HIGH | MEDIUM | LOW
    justification: string          # Why this confidence level
    evidence_quality: string       # Assessment of evidence quality
    assumptions_made: string[]     # Assumptions if confidence is not HIGH
    gaps_in_evidence: string[]     # What evidence was missing or incomplete
  
  # Governance Compliance (Required - AH-006)
  governance_compliance:
    status: enum                   # COMPLIANT | PARTIAL_COMPLIANCE | NON_COMPLIANT
    canonical_documents_checked:
      - document: string           # e.g., "role-definition.md"
        aligned: boolean
        conflicts: string[]        # Conflicts found, if any
    governance_conflicts:
      - conflict_id: string
        document: string           # Which governance document
        section: string            # Section reference
        description: string        # Nature of conflict
        severity: enum             # major | blocker
        remediation: string        # How to resolve
    status_truthfulness:
      completion_report_status: string  # Status claimed in completion-report
      readme_status: string             # Status claimed in README
      aligned: boolean
      discrepancy_description: string | null
  
  # Review Context (Optional)
  review_context:
    upstream_artifacts_consumed:
      - artifact_type: enum        # design-note | implementation-summary | verification-report | test-scope-report
        artifact_path: string
        consumed_fully: boolean
    review_duration_minutes: integer
    reviewer_notes: string | null
```

---

## Field Specifications

### decision_state (BR-003)

| Value | Definition | When to Use | Downstream Action |
|-------|------------|-------------|-------------------|
| `accept` | Deliverable is acceptable with no blocking issues | All requirements met, evidence complete, no governance conflicts | Proceed to acceptance |
| `accept-with-conditions` | Acceptable with explicit follow-up items | Minor issues remain but don't block acceptance, conditions are achievable | Proceed with tracking conditions |
| `reject` | Blocking gaps prevent acceptance, rework required | Critical defects, missing requirements, governance violations | Return to developer with actionable feedback |
| `needs-clarification` | Cannot decide due to missing/ambiguous information | Insufficient evidence, spec ambiguity, contradictory claims | Request clarification from appropriate role |

### reviewer_confidence_level.level

| Value | Definition | When to Use |
|-------|------------|-------------|
| `HIGH` | Decision is well-supported by complete evidence | All upstream artifacts consumed, no significant gaps, clear alignment |
| `MEDIUM` | Decision is supportable but with some gaps | Minor evidence gaps, some assumptions required, mostly complete picture |
| `LOW` | Decision has significant uncertainty | Major evidence gaps, critical assumptions, incomplete upstream artifacts |

### downstream_recommendation.primary_action

| Value | Meaning | Target Roles |
|-------|---------|--------------|
| `PROCEED_TO_ACCEPTANCE` | Work is ready for final acceptance | acceptance, management |
| `RETURN_TO_DEVELOPER` | Rework required before re-review | developer |
| `REQUEST_CLARIFICATION` | Need more information to decide | developer, architect, tester |
| `ESCALATE` | Requires higher-level decision | management, architect |

### governance_compliance.status

| Value | Definition | Required Action |
|-------|------------|-----------------|
| `COMPLIANT` | All canonical documents aligned | None |
| `PARTIAL_COMPLIANCE` | Minor conflicts that don't block | Document conflicts, recommend sync |
| `NON_COMPLIANT` | Major governance conflicts | Must be resolved or explicitly accepted |

### blocking_issues.severity

| Value | Definition | Required Action |
|-------|------------|-----------------|
| `blocker` | Must be fixed before any acceptance | Reject, return to developer |
| `major` | Significant issue requiring resolution | Reject or accept-with-conditions with mandatory fix |
| `minor` | Not blocking but should be addressed | Include in conditions or non-blocking |
| `note` | Informational, no action required | Document for awareness |

---

## Validation Rules

### R-001: Required Fields

以下字段必须存在且非空：

- `dispatch_id`
- `task_id`
- `target_feature` (all sub-fields)
- `decision_state` (must be one of 4 defined states)
- `decision_rationale.summary`
- `decision_rationale.key_factors` (at least one)
- `blocking_issues` (may be empty list if accept)
- `non_blocking_issues` (may be empty list)
- `acceptance_conditions.conditions_present` (must match decision_state)
- `downstream_recommendation.primary_action`
- `downstream_recommendation.target_roles` (at least one)
- `reviewer_confidence_level.level`
- `reviewer_confidence_level.justification`
- `governance_compliance.status`

### R-002: BR-003 Compliance (Explicit Decision State)

- `decision_state` 必须是以下之一：`accept`, `accept-with-conditions`, `reject`, `needs-clarification`
- 不得使用模糊状态如 "approved" 或 "needs work"
- 决策必须是明确的，不可省略

### R-003: Decision-State Consistency

- 如果 `decision_state` 是 `accept`，则 `blocking_issues` 必须为空
- 如果 `decision_state` 是 `accept-with-conditions`，则 `acceptance_conditions.conditions_present` 必须为 `true`
- 如果 `decision_state` 是 `reject`，则 `blocking_issues` 不能为空
- 如果 `decision_state` 是 `needs-clarification`，则 `downstream_recommendation.primary_action` 必须是 `REQUEST_CLARIFICATION`

### R-004: Rationale Quality

- `decision_rationale.summary` 必须至少 50 个字符
- `decision_rationale.key_factors` 必须至少有一个因素
- 每个因素必须具体，不可使用模糊表述如 "代码质量不够好"

### R-005: Confidence Justification

- `HIGH` confidence 必须有 `evidence_quality` 说明
- `MEDIUM` confidence 必须列出 `assumptions_made`
- `LOW` confidence 必须列出 `gaps_in_evidence`

### R-006: AH-006 Governance Alignment

- `governance_compliance.canonical_documents_checked` 必须至少包含：
  - `role-definition.md`
  - `package-spec.md`
  - `quality-gate.md`
- 如果 `governance_compliance.status` 是 `NON_COMPLIANT`，则 `decision_state` 不能是 `accept`

### R-007: Status Truthfulness Check

- `governance_compliance.status_truthfulness` 必须检查 completion-report 与 README 状态一致性
- 如果 `aligned` 是 `false`，必须在 `discrepancy_description` 中说明差异

### R-008: Blocking Issue Severity

- `blocking_issues` 中的每个 issue 必须有 `severity` 分类
- `blocker` 或 `major` 级别的 issue 必须有 `remediation_required`
- 每个 issue 必须有 `evidence_reference`

---

## Consumer Responsibilities

### Acceptance / Management Layer

- 根据 `decision_state` 决定最终处置
- 如果 `accept-with-conditions`，追踪 `acceptance_conditions`
- 评估 `reviewer_confidence_level` 以理解决策确定性
- 检查 `governance_compliance.status` 以了解治理风险

### Developer (on reject)

- 从 `blocking_issues` 获取必须修复的问题
- 从 `downstream_recommendation.next_steps` 了解下一步行动
- 参考 `decision_rationale.key_factors` 理解决策原因

### Docs

- 使用 `non_blocking_issues` 中的文档建议
- 参考 `governance_compliance` 了解需要同步的治理问题
- 追踪 `acceptance_conditions` 中文档相关的条件

### Security

- 检查 `blocking_issues` 中 `category: security` 的问题
- 评估 `governance_compliance` 中的安全相关冲突
- 关注 `downstream_recommendation` 中指向 security 的任务

---

## Producer Responsibilities

### Reviewer

- 基于上游 artifacts (design-note, implementation-summary, verification-report) 做出决策
- 确保 `decision_state` 明确且符合决策逻辑
- 如实分类所有 findings 的 severity
- 诚实评估 `reviewer_confidence_level`
- 执行完整的 governance alignment 检查
- 确保 `decision_rationale` 具体、可追溯

---

## Example: Accept Decision

```yaml
acceptance_decision_record:
  dispatch_id: "dispatch_006_001"
  task_id: "T-006-001"
  created_at: "2026-03-26T15:30:00Z"
  created_by: "reviewer"
  
  target_feature:
    feature_id: "005-tester-core"
    feature_name: "Tester Core Skills System"
    deliverable_type: "feature"
    review_scope: "All contracts, skills, validation layer"
  
  decision_state: "accept"
  decision_timestamp: "2026-03-26T15:30:00Z"
  
  decision_rationale:
    summary: "The tester-core feature is complete and well-implemented. All three artifact contracts are properly defined with validation rules. The three core skills have complete educational materials. Upstream consumption from developer artifacts is correctly specified. Downstream handoff to reviewer is clear."
    key_factors:
      - "All three artifact contracts present with required fields"
      - "Skill assets include examples, anti-examples, and checklists"
      - "Governance alignment verified against role-definition.md"
      - "Verification report demonstrates honest evidence reporting"
    evidence_summary: "Reviewed spec.md, all three contract files, skill directories, and validation checklist execution"
    alternative_states_considered:
      - state: "accept-with-conditions"
        reason_rejected: "No conditions needed - all requirements met"
  
  blocking_issues: []
  
  non_blocking_issues:
    - issue_id: "NB-001"
      severity: "note"
      category: "documentation"
      description: "Consider adding more edge case examples in unit-test-design skill"
      location: "specs/005-tester-core/skills/unit-test-design/examples/"
      recommendation: "Add 2-3 additional edge case examples for better educational value"
      priority: "low"
  
  acceptance_conditions:
    conditions_present: false
    conditions: []
    residual_risks: []
  
  downstream_recommendation:
    primary_action: "PROCEED_TO_ACCEPTANCE"
    target_roles: ["acceptance", "docs"]
    urgency: "normal"
    handoff_artifacts:
      - "specs/005-tester-core/spec.md"
      - "specs/005-tester-core/completion-report.md"
    next_steps:
      - "Acceptance layer to record feature acceptance"
      - "Docs to update README with tester-core status"
  
  reviewer_confidence_level:
    level: "HIGH"
    justification: "Complete evidence from spec, contracts, skills, and validation execution. All governance documents checked and aligned."
    evidence_quality: "Artifact contracts are complete and well-structured. Skill assets follow established patterns from architect-core."
    assumptions_made: []
    gaps_in_evidence: []
  
  governance_compliance:
    status: "COMPLIANT"
    canonical_documents_checked:
      - document: "role-definition.md"
        aligned: true
        conflicts: []
      - document: "package-spec.md"
        aligned: true
        conflicts: []
      - document: "quality-gate.md"
        aligned: true
        conflicts: []
    governance_conflicts: []
    status_truthfulness:
      completion_report_status: "Complete"
      readme_status: "Complete (005-tester-core)"
      aligned: true
      discrepancy_description: null
  
  review_context:
    upstream_artifacts_consumed:
      - artifact_type: "design-note"
        artifact_path: "specs/004-developer-core/contracts/implementation-summary-contract.md"
        consumed_fully: true
      - artifact_type: "verification-report"
        artifact_path: "specs/005-tester-core/contracts/verification-report-contract.md"
        consumed_fully: true
    review_duration_minutes: 45
    reviewer_notes: null
```

---

## Example: Reject Decision

```yaml
acceptance_decision_record:
  dispatch_id: "dispatch_006_002"
  task_id: "T-006-002"
  created_at: "2026-03-26T16:00:00Z"
  created_by: "reviewer"
  
  target_feature:
    feature_id: "006-reviewer-core"
    feature_name: "Reviewer Core Skills System"
    deliverable_type: "feature"
    review_scope: "Phase 1 artifacts: role-scope.md, contracts/"
  
  decision_state: "reject"
  decision_timestamp: "2026-03-26T16:00:00Z"
  
  decision_rationale:
    summary: "The acceptance-decision-record contract is incomplete. Three required fields are missing: governance_compliance validation rules, confidence level justification requirements, and downstream recommendation vocabulary. These gaps violate AC-002 requirements and prevent downstream consumers from properly interpreting the decision."
    key_factors:
      - "Missing governance_compliance field in validation rules"
      - "No confidence level justification requirements defined"
      - "Downstream recommendation vocabulary incomplete"
      - "Would mislead acceptance layer about decision completeness"
    evidence_summary: "Compared contract against AC-002 specification requirements. Found missing fields and incomplete definitions."
    alternative_states_considered:
      - state: "accept-with-conditions"
        reason_rejected: "Missing required fields constitute blocker, not minor condition"
      - state: "needs-clarification"
        reason_rejected: "Requirement is clear from AC-002, no ambiguity"
  
  blocking_issues:
    - issue_id: "BLK-001"
      severity: "blocker"
      category: "completeness"
      description: "Missing governance_compliance validation rules in R-001 Required Fields"
      location: "acceptance-decision-record-contract.md Validation Rules section"
      impact: "Downstream consumers cannot verify governance alignment, violating AH-006"
      remediation_required: "Add R-006 rule specifying governance_compliance required fields and validation"
      evidence_reference: "AC-002 requires governance_compliance field"
    - issue_id: "BLK-002"
      severity: "blocker"
      category: "completeness"
      description: "Missing confidence level justification requirements"
      location: "acceptance-decision-record-contract.md Field Specifications section"
      impact: "Reviewers may provide LOW confidence without explaining gaps"
      remediation_required: "Add R-005 rule requiring justification for each confidence level"
      evidence_reference: "AC-002 requires reviewer_confidence_level with justification"
    - issue_id: "BLK-003"
      severity: "major"
      category: "completeness"
      description: "Downstream recommendation vocabulary incomplete - missing ESCALATE action semantics"
      location: "acceptance-decision-record-contract.md downstream_recommendation.primary_action"
      impact: "Consumers may not understand when to escalate"
      remediation_required: "Add ESCALATE to primary_action vocabulary with target_roles semantics"
      evidence_reference: "AC-002 implies downstream_recommendation should cover all action types"
  
  non_blocking_issues:
    - issue_id: "NB-001"
      severity: "minor"
      category: "documentation"
      description: "Example could include more realistic confidence gaps"
      location: "Example section"
      recommendation: "Add example showing MEDIUM confidence with assumptions"
      priority: "low"
  
  acceptance_conditions:
    conditions_present: false
    conditions: []
    residual_risks: []
  
  downstream_recommendation:
    primary_action: "RETURN_TO_DEVELOPER"
    target_roles: ["developer"]
    urgency: "high"
    handoff_artifacts:
      - "specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md"
      - "specs/006-reviewer-core/spec.md#AC-002"
    next_steps:
      - "Add R-005 and R-006 validation rules"
      - "Complete downstream_recommendation vocabulary"
      - "Resubmit for review"
  
  reviewer_confidence_level:
    level: "HIGH"
    justification: "Clear specification in AC-002, unambiguous gap identification"
    evidence_quality: "Direct comparison of contract vs spec requirements"
    assumptions_made: []
    gaps_in_evidence: []
  
  governance_compliance:
    status: "PARTIAL_COMPLIANCE"
    canonical_documents_checked:
      - document: "role-definition.md"
        aligned: true
        conflicts: []
      - document: "package-spec.md"
        aligned: true
        conflicts: []
      - document: "quality-gate.md"
        aligned: true
        conflicts: []
    governance_conflicts:
      - conflict_id: "GC-001"
        document: "io-contract.md"
        section: "Section 3: Artifact Contracts"
        description: "Incomplete contract violates artifact completeness requirement"
        severity: "major"
        remediation: "Complete all AC-002 required fields before marking contract complete"
    status_truthfulness:
      completion_report_status: "N/A - review in progress"
      readme_status: "N/A - feature not complete"
      aligned: true
      discrepancy_description: null
  
  review_context:
    upstream_artifacts_consumed:
      - artifact_type: "design-note"
        artifact_path: "specs/006-reviewer-core/spec.md"
        consumed_fully: true
    review_duration_minutes: 30
    reviewer_notes: "Contract has good structure but incomplete specification. Fix blockers and resubmit."
```

---

## Example: Accept-With-Conditions Decision

```yaml
acceptance_decision_record:
  dispatch_id: "dispatch_006_003"
  task_id: "T-006-003"
  created_at: "2026-03-26T17:00:00Z"
  created_by: "reviewer"
  
  target_feature:
    feature_id: "004-developer-core"
    feature_name: "Developer Core Skills System"
    deliverable_type: "feature"
    review_scope: "All contracts, skills, validation layer"
  
  decision_state: "accept-with-conditions"
  decision_timestamp: "2026-03-26T17:00:00Z"
  
  decision_rationale:
    summary: "The developer-core feature is substantially complete and functional. Core requirements are met with proper artifact contracts and skill implementations. However, two conditions must be addressed post-acceptance: the code-change-selfcheck skill needs additional anti-examples, and the bugfix-report contract should include reproduction verification guidance."
    key_factors:
      - "All three artifact contracts properly defined"
      - "Core skills have SKILL.md and examples"
      - "Minor gaps in educational materials don't block core functionality"
      - "Conditions are achievable within one sprint"
    evidence_summary: "Reviewed all contracts, skill directories, and validation execution. Found non-blocking improvements needed."
    alternative_states_considered:
      - state: "accept"
        reason_rejected: "Two conditions require post-acceptance tracking"
      - state: "reject"
        reason_rejected: "Issues are non-blocking and don't warrant rejection"
  
  blocking_issues: []
  
  non_blocking_issues:
    - issue_id: "NB-001"
      severity: "minor"
      category: "documentation"
      description: "code-change-selfcheck skill has only 1 anti-example"
      location: "specs/004-developer-core/skills/code-change-selfcheck/anti-examples/"
      recommendation: "Add 1-2 more anti-examples for common self-check failures"
      priority: "medium"
    - issue_id: "NB-002"
      severity: "minor"
      category: "completeness"
      description: "bugfix-report contract lacks reproduction verification guidance"
      location: "specs/004-developer-core/contracts/bugfix-report-contract.md"
      recommendation: "Add field for how to verify the reproduction steps work"
      priority: "low"
  
  acceptance_conditions:
    conditions_present: true
    conditions:
      - condition_id: "COND-001"
        description: "Add 2 anti-examples to code-change-selfcheck skill showing common self-check failures (e.g., missing edge case tests, false positive on trivial changes)"
        responsible_role: "docs"
        due_within: "1 sprint"
        verification_method: "Review added anti-examples for relevance and clarity"
      - condition_id: "COND-002"
        description: "Add reproduction_verification field to bugfix-report contract with guidance on how to verify reproduction steps"
        responsible_role: "developer"
        due_within: "1 sprint"
        verification_method: "Contract update review and validation"
    residual_risks:
      - "Without additional anti-examples, developers may not recognize all self-check failure modes"
  
  downstream_recommendation:
    primary_action: "PROCEED_TO_ACCEPTANCE"
    target_roles: ["acceptance", "docs", "developer"]
    urgency: "normal"
    handoff_artifacts:
      - "specs/004-developer-core/spec.md"
      - "specs/004-developer-core/completion-report.md"
    next_steps:
      - "Acceptance layer to record feature acceptance with conditions"
      - "Docs to implement COND-001 within specified timeframe"
      - "Developer to implement COND-002 within specified timeframe"
  
  reviewer_confidence_level:
    level: "HIGH"
    justification: "Core functionality complete and verified. Conditions are specific and achievable."
    evidence_quality: "Complete contract review, skill directory inspection, validation checklist execution"
    assumptions_made: []
    gaps_in_evidence: []
  
  governance_compliance:
    status: "COMPLIANT"
    canonical_documents_checked:
      - document: "role-definition.md"
        aligned: true
        conflicts: []
      - document: "package-spec.md"
        aligned: true
        conflicts: []
      - document: "quality-gate.md"
        aligned: true
        conflicts: []
    governance_conflicts: []
    status_truthfulness:
      completion_report_status: "Complete"
      readme_status: "Complete (004-developer-core)"
      aligned: true
      discrepancy_description: null
  
  review_context:
    upstream_artifacts_consumed:
      - artifact_type: "design-note"
        artifact_path: "specs/003-architect-core/contracts/design-note-contract.md"
        consumed_fully: true
      - artifact_type: "implementation-summary"
        artifact_path: "specs/004-developer-core/contracts/implementation-summary-contract.md"
        consumed_fully: true
    review_duration_minutes: 50
    reviewer_notes: "Solid implementation. Conditions are minor quality improvements, not blockers."
```

---

## Example: Needs-Clarification Decision

```yaml
acceptance_decision_record:
  dispatch_id: "dispatch_006_004"
  task_id: "T-006-004"
  created_at: "2026-03-26T18:00:00Z"
  created_by: "reviewer"
  
  target_feature:
    feature_id: "007-docs-core"
    feature_name: "Docs Core Skills System"
    deliverable_type: "feature"
    review_scope: "Draft spec.md and contracts"
  
  decision_state: "needs-clarification"
  decision_timestamp: "2026-03-26T18:00:00Z"
  
  decision_rationale:
    summary: "Cannot render a decision because the spec contains conflicting statements about the readme-sync skill's scope. Section 6.1 claims the skill handles changelog generation, but Section 8.2 explicitly excludes changelog from readme-sync and assigns it to changelog-writing skill. This creates ambiguity about which skill owns changelog-related documentation."
    key_factors:
      - "Spec contains contradictory scope definitions"
      - "Cannot determine correct skill boundary without clarification"
      - "Downstream consumers may implement conflicting behavior"
    evidence_summary: "Found explicit contradiction between spec sections 6.1 and 8.2"
    alternative_states_considered:
      - state: "reject"
        reason_rejected: "Issue is ambiguity, not implementation defect"
      - state: "accept"
        reason_rejected: "Cannot accept spec with internal contradictions"
  
  blocking_issues:
    - issue_id: "BLK-001"
      severity: "blocker"
      category: "consistency"
      description: "Spec contains contradictory statements about readme-sync skill scope"
      location: "specs/007-docs-core/spec.md sections 6.1 and 8.2"
      impact: "Cannot determine correct skill implementation; downstream ambiguity"
      remediation_required: "Clarify whether readme-sync handles changelog or not"
      evidence_reference: "Section 6.1 line 145 vs Section 8.2 line 234"
  
  non_blocking_issues: []
  
  acceptance_conditions:
    conditions_present: false
    conditions: []
    residual_risks: []
  
  downstream_recommendation:
    primary_action: "REQUEST_CLARIFICATION"
    target_roles: ["architect"]
    urgency: "high"
    handoff_artifacts:
      - "specs/007-docs-core/spec.md"
    next_steps:
      - "Architect to clarify readme-sync skill scope"
      - "Update spec to resolve contradiction"
      - "Resubmit for review"
  
  reviewer_confidence_level:
    level: "MEDIUM"
    justification: "Contradiction is clear, but cannot determine intended behavior without architect input"
    evidence_quality: "Direct quote comparison shows contradiction"
    assumptions_made:
      - "Assume changelog-writing skill is the intended owner based on skill name"
    gaps_in_evidence:
      - "Missing architect clarification on intended scope"
  
  governance_compliance:
    status: "PARTIAL_COMPLIANCE"
    canonical_documents_checked:
      - document: "role-definition.md"
        aligned: true
        conflicts: []
      - document: "package-spec.md"
        aligned: true
        conflicts: []
      - document: "quality-gate.md"
        aligned: true
        conflicts: []
    governance_conflicts: []
    status_truthfulness:
      completion_report_status: "N/A - spec review"
      readme_status: "N/A - feature not complete"
      aligned: true
      discrepancy_description: null
  
  review_context:
    upstream_artifacts_consumed:
      - artifact_type: "design-note"
        artifact_path: "specs/007-docs-core/spec.md"
        consumed_fully: false  # Could not complete due to contradiction
    review_duration_minutes: 20
    reviewer_notes: "Found contradiction early in review. Stopped to request clarification rather than continue with ambiguous spec."
```

---

## References

- `specs/006-reviewer-core/spec.md` - Feature specification (AC-002)
- `specs/006-reviewer-core/role-scope.md` - Reviewer role scope
- `specs/006-reviewer-core/contracts/review-findings-report-contract.md` - Upstream artifact
- `specs/006-reviewer-core/contracts/actionable-feedback-report-contract.md` - Downstream artifact
- `role-definition.md` - 6-role definition (Section 4: reviewer)
- `quality-gate.md` - Severity level definitions (Section 2.2)
- `docs/audit-hardening.md` - AH-006 governance alignment requirements