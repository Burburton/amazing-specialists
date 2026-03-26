# Actionable Feedback Report Contract

## Contract Metadata

| Field | Value |
|-------|-------|
| **Contract ID** | AC-003-rev |
| **Contract Name** | Actionable Feedback Report Contract |
| **Version** | 1.0.0 |
| **Owner** | reviewer |
| **Consumers** | developer (on reject), acceptance (for tracking) |

---

## Purpose

Define the complete schema and validation rules for the `actionable-feedback-report` artifact, which serves as the operational handoff document when rework is required. This artifact transforms review findings into executable remediation guidance that developers can act upon without ambiguity.

This artifact is the **primary feedback output** of the reviewer role when a decision is `reject` and must enable the developer to understand exactly what needs to change, why it matters, and how to verify the fix.

---

## Schema

```yaml
actionable_feedback_report:
  # Metadata
  report_id: string                # Unique report identifier
  created_at: timestamp            # Creation timestamp
  created_by: string               # Creator (reviewer)
  dispatch_id: string              # Dispatch ID for traceability
  task_id: string                  # Task ID under review
  
  # Decision Context (Required)
  decision_context:
    original_decision: enum        # reject | needs-clarification
    decision_rationale_summary: string  # Brief explanation of why rework needed
    review_findings_reference: string   # Path to review-findings-report
  
  # 1. issue_summary (Required - BR-005)
  issue_summary:
    headline: string               # One-line summary of the rejection
    detailed_summary: string       # 2-3 paragraph explanation
    root_cause_analysis: string    # Why these issues occurred
    impact_scope: string           # What is affected by these issues
  
  # 2. affected_files_artifacts (Required)
  affected_files_artifacts:
    files_requiring_changes:
      - file_path: string
        change_type: enum          # modify | create | delete
        priority: enum             # high | medium | low
        reason: string             # Why this file needs change
    artifacts_requiring_updates:
      - artifact_path: string
        artifact_type: enum        # spec | plan | contract | documentation
        sections_to_update: string[]
        reason: string
  
  # 3. why_it_matters (Required)
  why_it_matters:
    business_impact: string        # Impact on users, functionality, quality
    technical_impact: string       # Impact on architecture, maintainability
    downstream_risks: string[]     # Risks if not addressed
    acceptance_blockers: string[]  # Specific acceptance criteria violated
  
  # 4. required_correction (Required)
  required_correction:
    corrections:
      - correction_id: string
        type: enum                 # fix | add | remove | refactor | clarify
        target: string             # File, function, or artifact section
        current_state: string      # What currently exists (or doesn't)
        desired_state: string      # What should exist after fix
        implementation_guidance: string  # Specific steps to implement
        code_example: string | null     # Code snippet if applicable
        reference_documentation: string | null  # Links to relevant docs
    correction_order: string[]     # Recommended sequence (correction_ids)
    dependencies_between_corrections:
      - correction_id: string
      depends_on: string[]         # Other correction_ids
  
  # 5. suggested_owner_role (Required)
  suggested_owner_role:
    primary_owner: enum            # developer | tester | architect | docs
    owner_justification: string    # Why this role is appropriate
    supporting_roles:
      - role: enum
        responsibility: string     # What they should support
    escalation_path: string        # If primary owner cannot resolve
  
  # 6. expected_verification (Required)
  expected_verification:
    verification_methods:
      - method_id: string
        method_type: enum          # automated_test | manual_test | code_review | artifact_check
        description: string        # What to verify
        success_criteria: string   # What constitutes success
        responsible_role: enum     # Who should verify
        automation_available: boolean
    test_suggestions:
      - test_type: enum            # unit | integration | e2e | manual
        test_description: string
        test_file_suggestion: string | null
    re_review_scope: string[]      # Files/artifacts to re-review after fix
  
  # 7. closure_criteria (Required)
  closure_criteria:
    must_satisfy:
      - criterion_id: string
        description: string        # What must be true to close
        verification_method: string
        acceptance_criteria_reference: string | null  # Link to AC if applicable
    quality_gates:
      - gate_name: string          # e.g., "All tests pass"
        gate_description: string
        gate_status: enum          # pending | blocked | ready
    sign_off_required:
      - role: enum
        what_to_sign_off: string
  
  # 8. must_fix_items (Required - BR-005)
  must_fix_items:
    items:
      - item_id: string
        severity: enum             # blocker | major
        category: enum             # correctness | completeness | security | performance | governance
        title: string
        description: string
        location: string           # File:line or artifact:section
        remediation_steps:
          - step_number: integer
            action: string
            details: string
        expected_outcome: string   # What should result from fix
        verification_checklist:
          - check_item: string
            expected_result: string
        estimated_effort: string   # e.g., "1-2 hours", "1 day"
        priority_order: integer    # 1 = highest priority
    total_must_fix_count: integer
    estimated_total_effort: string
  
  # 9. should_fix_items (Required - BR-005)
  should_fix_items:
    items:
      - item_id: string
        severity: enum             # minor | note
        category: enum             # maintainability | style | documentation | optimization
        title: string
        description: string
        location: string
        improvement_suggestion: string
        benefit_if_fixed: string   # What benefit if addressed
        risk_if_not_fixed: string  # Consequence if deferred
        priority: enum             # high | medium | low
    total_should_fix_count: integer
    recommendation: string         # General guidance on addressing
  
  # 10. residual_risks (Required)
  residual_risks:
    risks_after_fix:
      - risk_id: string
        risk_description: string
        likelihood: enum           # high | medium | low
        impact: enum               # high | medium | low
        mitigation_recommendation: string
        accepted_by: string | null  # Role that accepted the risk
    known_limitations:
      - limitation: string
        workaround: string | null
        affects_acceptance: boolean
    assumptions_made:
      - assumption: string
        if_invalid: string         # What happens if assumption is wrong
  
  # Re-Review Criteria (Required)
  re_review_criteria:
    trigger_conditions:
      - condition: string          # e.g., "All must_fix_items resolved"
    scope_for_re_review:
      - item_type: enum            # file | artifact | functionality
        item_path: string
        reason: string
    re_review_urgency: enum        # high | medium | low
    estimated_re_review_effort: string
  
  # Closure Checklist (Required)
  closure_checklist:
    pre_submission_checks:
      - check_id: string
        check_description: string
        verification_method: string
    submission_requirements:
      - requirement: string
        format: string             # How to provide
    post_fix_actions:
      - action: string
        responsible_role: enum
    completion_confirmation:
      - confirmation_item: string
        confirmation_method: string
  
  # Additional Context (Optional)
  notes: string | null
  references:
    - reference_type: enum         # spec | design-note | contract | documentation
      reference_path: string
      relevance: string
```

---

## Field Specifications

### must_fix_items vs should_fix_items Classification

| Criteria | Must-Fix | Should-Fix |
|----------|----------|------------|
| **Severity** | blocker, major | minor, note |
| **Blocks Acceptance** | Yes - cannot accept without fix | No - can defer |
| **Category** | correctness, completeness, security, performance, governance | maintainability, style, documentation, optimization |
| **Verification Required** | Mandatory verification before re-review | Optional, recommended |
| **Priority** | Must be addressed immediately | Can be scheduled for later |
| **Closure Criteria** | Must satisfy all to close | May have open items at closure |

### must_fix_items.severity

| Value | Definition | Example | Action |
|-------|------------|---------|--------|
| `blocker` | Prevents any acceptance, critical failure | Security vulnerability, data loss risk, governance conflict | Must fix before re-review |
| `major` | Significant issue affecting quality or functionality | Missing required field, incomplete feature | Must fix, but can accept with conditions |

### should_fix_items.severity

| Value | Definition | Example | Action |
|-------|------------|---------|--------|
| `minor` | Improvement opportunity, low risk | Terminology inconsistency, minor style issue | Should address if time permits |
| `note` | Informational, suggestion | Optional enhancement, future consideration | No action required |

### suggested_owner_role.primary_owner

| Value | When to Assign | Example |
|-------|----------------|---------|
| `developer` | Code or implementation fix required | Logic error, missing functionality |
| `tester` | Test design or coverage issue | Missing test cases, test configuration |
| `architect` | Design or architecture change needed | Module boundary violation, spec conflict |
| `docs` | Documentation update required | Missing contract field documentation |

---

## Validation Rules

### R-001: Required Fields

以下字段必须存在且非空：

- `report_id`
- `created_at`
- `created_by`
- `dispatch_id`
- `task_id`
- `decision_context` (all sub-fields)
- `issue_summary` (all sub-fields)
- `affected_files_artifacts` (至少一个文件或工件)
- `why_it_matters` (business_impact 和 technical_impact)
- `required_correction` (至少一个 correction)
- `suggested_owner_role.primary_owner`
- `expected_verification` (至少一个 verification_method)
- `closure_criteria.must_satisfy` (至少一个条件)
- `must_fix_items` (至少一个 item)
- `should_fix_items` (items 列表必须存在，可为空)
- `residual_risks` (risks_after_fix 列表必须存在)
- `re_review_criteria` (至少一个 trigger_condition)
- `closure_checklist` (至少一个 pre_submission_check)

### R-002: BR-005 Compliance (Actionable Feedback)

- 每个 `must_fix_items` 必须有 `remediation_steps`
- 每个 `must_fix_items` 必须有 `verification_checklist`
- 不得使用模糊表述如 "需要改进" 或 "不符合标准"
- 每个修复建议必须具体到文件、位置和期望结果

### R-003: Must-Fix vs Should-Fix Separation

- `must_fix_items` 中的每个 item 必须是 `blocker` 或 `major` severity
- `should_fix_items` 中的每个 item 必须是 `minor` 或 `note` severity
- 不得将 blocker 混入 should_fix 或反之
- 如果 `must_fix_items` 为空，则不应使用此 artifact（应使用 acceptance-decision-record）

### R-004: Verification Method Quality

- 每个 `verification_method` 必须有明确的 `success_criteria`
- 每个必须修复项必须有对应的验证方法
- `re_review_scope` 必须覆盖所有 `affected_files_artifacts`

### R-005: Closure Criteria Completeness

- `closure_criteria.must_satisfy` 必须覆盖所有 `must_fix_items`
- 每个 closure criterion 必须有 `verification_method`
- `sign_off_required` 必须包含 reviewer 作为签收角色

### R-006: Owner Role Appropriateness

- `suggested_owner_role.primary_owner` 必须与问题类型匹配
- 如果涉及代码修改，primary_owner 必须是 developer
- 如果涉及架构决策，必须有 architect 支持或作为 primary

### R-007: Remediation Guidance Quality

- 每个 `remediation_steps` 必须有具体操作，不可使用模糊指令
- 对于复杂修复，必须提供 `code_example` 或 `reference_documentation`
- `correction_order` 必须考虑依赖关系

### R-008: Residual Risk Honesty

- 如果修复后仍有风险，必须在 `residual_risks` 中明确说明
- 每个 `risk_after_fix` 必须有 `mitigation_recommendation`
- 不得隐瞒已知的局限性

---

## Consumer Responsibilities

### Developer (Primary Consumer)

- 逐项处理 `must_fix_items` 中的每个项目
- 按照 `remediation_steps` 执行修复
- 使用 `verification_checklist` 自检
- 参考 `code_example` 和 `reference_documentation` 实施
- 完成后填写 `closure_checklist`
- 理解 `why_it_matters` 以避免类似问题
- 可选择处理 `should_fix_items` 中的改进建议

### Acceptance (Tracking)

- 使用 `closure_criteria` 跟踪修复进度
- 验证所有 `must_satisfy` 条件已满足
- 记录 `residual_risks` 的接受情况
- 确认 `sign_off_required` 完成

---

## Producer Responsibilities

### Reviewer

- 基于明确的 review findings 生成此报告
- 确保每个 must-fix 有具体的、可执行的 remediation
- 正确区分 must-fix 和 should-fix
- 提供足够的上下文让 developer 理解问题
- 不隐瞒修复后的 residual risks
- 定义清晰的 re-review scope

---

## Remediation Guidance Format Specification

### Standard Remediation Steps Format

```yaml
remediation_steps:
  - step_number: 1
    action: "Identify the affected function"
    details: "Locate the validateInput() function in AuthService.ts"
  - step_number: 2
    action: "Add null check"
    details: "Add null/undefined check before accessing user.name property"
  - step_number: 3
    action: "Add appropriate error handling"
    details: "Throw InvalidInputError with descriptive message if user.name is null"
```

### Code Example Format

```yaml
code_example: |
  // Before (incorrect):
  function validateInput(user) {
    return user.name.length > 0;  // Crashes if user.name is null
  }
  
  // After (correct):
  function validateInput(user) {
    if (!user || !user.name) {
      throw new InvalidInputError('User name is required');
    }
    return user.name.length > 0;
  }
```

---

## Re-Review Criteria Format Specification

### Standard Re-Review Criteria Format

```yaml
re_review_criteria:
  trigger_conditions:
    - condition: "All must_fix_items have verification checklists passing"
    - condition: "Closure checklist pre_submission_checks completed"
  scope_for_re_review:
    - item_type: "file"
      item_path: "src/services/AuthService.ts"
      reason: "Primary file affected by must_fix items"
    - item_type: "artifact"
      item_path: "tests/unit/AuthService.test.ts"
      reason: "Test file needs validation for new test cases"
  re_review_urgency: "high"
  estimated_re_review_effort: "30 minutes"
```

---

## Closure Checklist Format Specification

### Standard Closure Checklist Format

```yaml
closure_checklist:
  pre_submission_checks:
    - check_id: "PRE-001"
      check_description: "All must_fix_items remediation steps completed"
      verification_method: "Run local tests and verify all pass"
    - check_id: "PRE-002"
      check_description: "Verification checklists for each must_fix item all pass"
      verification_method: "Review each checklist item against implementation"
  submission_requirements:
    - requirement: "Updated code files with fixes"
      format: "Git commit with clear message referencing item IDs"
    - requirement: "Updated test files if new tests added"
      format: "Include in same commit or separate commit"
  post_fix_actions:
    - action: "Notify reviewer that fixes are ready for re-review"
      responsible_role: "developer"
    - action: "Run automated test suite"
      responsible_role: "developer"
  completion_confirmation:
    - confirmation_item: "All closure criteria satisfied"
      confirmation_method: "Reviewer sign-off in follow-up review"
```

---

## Example: Simple Must-Fix Feedback

```yaml
actionable_feedback_report:
  report_id: "AFR-006-001"
  created_at: "2026-03-26T14:00:00Z"
  created_by: "reviewer"
  dispatch_id: "dispatch_006_001"
  task_id: "T-006-001"
  
  decision_context:
    original_decision: "reject"
    decision_rationale_summary: "Missing required field in acceptance-decision-record contract prevents downstream consumption."
    review_findings_reference: "specs/006-reviewer-core/review-findings-report.md"
  
  issue_summary:
    headline: "Missing governance_compliance validation rules in contract"
    detailed_summary: "The acceptance-decision-record-contract.md is missing the R-006 validation rule for governance_compliance field. This field is required per AC-002 and is critical for AH-006 compliance. Without this validation rule, reviewers may produce decision records without proper governance alignment verification."
    root_cause_analysis: "The contract was drafted with the governance_compliance field defined but the validation rule was omitted during documentation."
    impact_scope: "All acceptance-decision-record artifacts; downstream acceptance layer; governance traceability"
  
  affected_files_artifacts:
    files_requiring_changes:
      - file_path: "specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md"
        change_type: "modify"
        priority: "high"
        reason: "Add missing validation rule R-006"
    artifacts_requiring_updates: []
  
  why_it_matters:
    business_impact: "Without proper governance validation, decisions may be made that violate established role boundaries and quality standards."
    technical_impact: "Downstream consumers cannot verify governance alignment, breaking the traceability chain from spec to implementation to acceptance."
    downstream_risks:
      - "Acceptance layer may accept work that violates governance baseline"
      - "No automated way to catch governance drift in decision records"
    acceptance_blockers:
      - "AC-002 requires governance_compliance field with validation"
      - "AH-006 requires governance alignment checking"
  
  required_correction:
    corrections:
      - correction_id: "CORR-001"
        type: "add"
        target: "acceptance-decision-record-contract.md Validation Rules section"
        current_state: "Validation Rules section has R-001 through R-005, missing R-006"
        desired_state: "Add R-006 rule specifying governance_compliance required fields and validation"
        implementation_guidance: "Add a new validation rule R-006 after R-005 that specifies: required governance documents to check, validation of governance_compliance.status field, and handling of NON_COMPLIANT status."
        code_example: |
          ### R-006: AH-006 Governance Alignment
          
          - `governance_compliance.canonical_documents_checked` 必须至少包含：
            - `role-definition.md`
            - `package-spec.md`
            - `quality-gate.md`
          - 如果 `governance_compliance.status` 是 `NON_COMPLIANT`，则 `decision_state` 不能是 `accept`
        reference_documentation: "docs/audit-hardening.md AH-006 section"
    correction_order: ["CORR-001"]
    dependencies_between_corrections: []
  
  suggested_owner_role:
    primary_owner: "developer"
    owner_justification: "This is a documentation update requiring understanding of validation rules and governance requirements."
    supporting_roles:
      - role: "architect"
        responsibility: "Verify governance alignment rule is correctly specified"
    escalation_path: "If unclear about governance requirements, escalate to architect"
  
  expected_verification:
    verification_methods:
      - method_id: "VM-001"
        method_type: "artifact_check"
        description: "Verify R-006 rule exists and covers all required aspects"
        success_criteria: "R-006 present with governance document list, status validation, and NON_COMPLIANT handling"
        responsible_role: "reviewer"
        automation_available: false
    test_suggestions: []
    re_review_scope:
      - "specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md"
  
  closure_criteria:
    must_satisfy:
      - criterion_id: "CRIT-001"
        description: "R-006 validation rule added with all required governance documents listed"
        verification_method: "Review updated contract for R-006 presence and completeness"
        acceptance_criteria_reference: "AC-002: governance_compliance field required"
      - criterion_id: "CRIT-002"
        description: "NON_COMPLIANT status handling defined"
        verification_method: "Check R-006 includes logic for NON_COMPLIANT status"
        acceptance_criteria_reference: "AH-006: governance alignment checking"
    quality_gates:
      - gate_name: "Contract completeness"
        gate_description: "All AC-002 required fields have corresponding validation rules"
        gate_status: "pending"
    sign_off_required:
      - role: "reviewer"
        what_to_sign_off: "Verify R-006 correctly implements AH-006 requirements"
  
  must_fix_items:
    items:
      - item_id: "MF-001"
        severity: "blocker"
        category: "completeness"
        title: "Add missing R-006 governance compliance validation rule"
        description: "The acceptance-decision-record contract is missing the R-006 validation rule for governance_compliance, which is required per AC-002 and AH-006."
        location: "acceptance-decision-record-contract.md:Validation Rules section (after R-005)"
        remediation_steps:
          - step_number: 1
            action: "Locate Validation Rules section in contract"
            details: "Find the section starting with '### R-001' in acceptance-decision-record-contract.md"
          - step_number: 2
            action: "Add R-006 rule after R-005"
            details: "Insert new rule specifying governance_compliance validation requirements"
          - step_number: 3
            action: "Define required governance documents"
            details: "List role-definition.md, package-spec.md, and quality-gate.md as required checks"
          - step_number: 4
            action: "Define NON_COMPLIANT handling"
            details: "Specify that NON_COMPLIANT status blocks accept decision"
        expected_outcome: "R-006 rule present with complete governance compliance validation logic"
        verification_checklist:
          - check_item: "R-006 exists in Validation Rules section"
            expected_result: "Rule is present after R-005"
          - check_item: "Three governance documents listed"
            expected_result: "role-definition.md, package-spec.md, quality-gate.md all present"
          - check_item: "NON_COMPLIANT handling defined"
            expected_result: "Logic prevents accept when NON_COMPLIANT"
        estimated_effort: "30 minutes"
        priority_order: 1
    total_must_fix_count: 1
    estimated_total_effort: "30 minutes"
  
  should_fix_items:
    items:
      - item_id: "SF-001"
        severity: "minor"
        category: "documentation"
        title: "Consider adding example of NON_COMPLIANT handling"
        description: "The contract examples section could benefit from an example showing how NON_COMPLIANT status affects the decision flow."
        location: "acceptance-decision-record-contract.md:Examples section"
        improvement_suggestion: "Add an example where governance_compliance.status is NON_COMPLIANT and show how it affects decision_state"
        benefit_if_fixed: "Better educational value for understanding governance alignment enforcement"
        risk_if_not_fixed: "Users may not fully understand the impact of NON_COMPLIANT status"
        priority: "low"
    total_should_fix_count: 1
    recommendation: "Address should-fix items in a follow-up commit if time permits, but not blocking for re-review."
  
  residual_risks:
    risks_after_fix:
      - risk_id: "RR-001"
        risk_description: "Existing acceptance-decision-record instances may not have governance_compliance validated"
        likelihood: "medium"
        impact: "medium"
        mitigation_recommendation: "Retroactively validate existing records against new R-006 rule"
        accepted_by: null
    known_limitations: []
    assumptions_made:
      - assumption: "Developer has read and understood AH-006 requirements"
        if_invalid: "May need architect clarification on governance alignment specifics"
  
  re_review_criteria:
    trigger_conditions:
      - condition: "R-006 validation rule added and verifiable"
    scope_for_re_review:
      - item_type: "file"
        item_path: "specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md"
        reason: "Primary file affected by the correction"
    re_review_urgency: "high"
    estimated_re_review_effort: "15 minutes"
  
  closure_checklist:
    pre_submission_checks:
      - check_id: "PRE-001"
        check_description: "R-006 validation rule added to contract"
        verification_method: "Visual inspection of contract file"
      - check_id: "PRE-002"
        check_description: "R-006 covers all three governance documents"
        verification_method: "Verify document list in R-006"
    submission_requirements:
      - requirement: "Updated contract file"
        format: "Git commit with message: 'feat(contracts): add R-006 governance compliance validation'"
    post_fix_actions:
      - action: "Request re-review of contract"
        responsible_role: "developer"
    completion_confirmation:
      - confirmation_item: "Reviewer approves updated contract"
        confirmation_method: "Reviewer sign-off in follow-up review"
  
  notes: null
  references:
    - reference_type: "contract"
      reference_path: "specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md"
      relevance: "Primary artifact being corrected"
    - reference_type: "documentation"
      reference_path: "docs/audit-hardening.md"
      relevance: "AH-006 requirements for governance alignment"
```

---

## Example: Multiple Must-Fix with Dependencies

```yaml
actionable_feedback_report:
  report_id: "AFR-006-002"
  created_at: "2026-03-26T16:30:00Z"
  created_by: "reviewer"
  dispatch_id: "dispatch_006_002"
  task_id: "T-006-002"
  
  decision_context:
    original_decision: "reject"
    decision_rationale_summary: "Role boundary violation in role-scope.md contradicts role-definition.md. Multiple contract fields missing validation. Requires coordinated fixes across multiple files."
    review_findings_reference: "specs/006-reviewer-core/review-findings-report.md"
  
  issue_summary:
    headline: "Governance conflict and incomplete contract validation blocking acceptance"
    detailed_summary: "The role-scope.md file grants reviewer the authority to 'fix minor issues directly', which contradicts role-definition.md BR-007 prohibition. Additionally, the acceptance-decision-record contract is missing validation rules for governance_compliance and confidence level justification. These issues are interconnected and require fixes in a specific order."
    root_cause_analysis: "The role-scope.md was drafted without cross-referencing role-definition.md. The contract validation rules were incomplete due to oversight during initial drafting."
    impact_scope: "Role boundaries, contract completeness, governance traceability, downstream consumer understanding"
  
  affected_files_artifacts:
    files_requiring_changes:
      - file_path: "specs/006-reviewer-core/role-scope.md"
        change_type: "modify"
        priority: "high"
        reason: "Remove code modification authority that violates governance"
      - file_path: "specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md"
        change_type: "modify"
        priority: "high"
        reason: "Add missing validation rules"
    artifacts_requiring_updates: []
  
  why_it_matters:
    business_impact: "Allowing reviewer to modify code during review undermines the independent review function and creates accountability issues."
    technical_impact: "Missing validation rules mean reviewers may produce incomplete decision records, breaking downstream consumption."
    downstream_risks:
      - "Role boundary confusion: developer vs reviewer responsibilities unclear"
      - "Incomplete decision records may be accepted without proper governance checks"
      - "Traceability chain broken between spec and implementation"
    acceptance_blockers:
      - "AH-006: governance alignment violation"
      - "BR-007: reviewer must not mutate production code"
      - "AC-002: missing validation rules for required fields"
  
  required_correction:
    corrections:
      - correction_id: "CORR-001"
        type: "fix"
        target: "specs/006-reviewer-core/role-scope.md Section 3"
        current_state: "States reviewer 'may fix minor issues directly'"
        desired_state: "Reviewer must provide feedback for developer to fix; no code modification authority"
        implementation_guidance: "Remove the 'may fix' clause. Replace with 'must provide actionable feedback for developer to address'. Add explicit prohibition note."
        code_example: |
          # Before (incorrect):
          reviewer may:
            - Fix minor issues directly (typos, simple bugs)
          
          # After (correct):
          reviewer must:
            - Provide actionable feedback for all issues found
          reviewer must never:
            - Modify production code during review
        reference_documentation: "role-definition.md Section 4: reviewer must not mutate production code"
      - correction_id: "CORR-002"
        type: "add"
        target: "acceptance-decision-record-contract.md Validation Rules section"
        current_state: "Missing R-006 governance compliance validation"
        desired_state: "R-006 rule added specifying governance compliance validation"
        implementation_guidance: "Add validation rule requiring governance_compliance field validation with canonical document list."
        code_example: null
        reference_documentation: "docs/audit-hardening.md AH-006"
      - correction_id: "CORR-003"
        type: "add"
        target: "acceptance-decision-record-contract.md Validation Rules section"
        current_state: "Missing confidence level justification requirements"
        desired_state: "R-005 rule added requiring justification for each confidence level"
        implementation_guidance: "Add validation rule requiring evidence_quality for HIGH, assumptions_made for MEDIUM, and gaps_in_evidence for LOW confidence."
        code_example: null
        reference_documentation: "specs/006-reviewer-core/spec.md BR-007"
    correction_order: ["CORR-001", "CORR-002", "CORR-003"]
    dependencies_between_corrections:
      - correction_id: "CORR-002"
        depends_on: []
      - correction_id: "CORR-003"
        depends_on: []
  
  suggested_owner_role:
    primary_owner: "developer"
    owner_justification: "All corrections are documentation updates requiring understanding of governance and validation requirements."
    supporting_roles:
      - role: "architect"
        responsibility: "Verify role-scope.md changes align with governance baseline"
    escalation_path: "If role boundary intent is unclear, escalate to architect"
  
  expected_verification:
    verification_methods:
      - method_id: "VM-001"
        method_type: "artifact_check"
        description: "Verify role-scope.md no longer contains code modification authority"
        success_criteria: "No 'may fix' or similar language; explicit prohibition present"
        responsible_role: "reviewer"
        automation_available: false
      - method_id: "VM-002"
        method_type: "artifact_check"
        description: "Verify R-005 and R-006 validation rules added to contract"
        success_criteria: "Both rules present with complete specifications"
        responsible_role: "reviewer"
        automation_available: false
      - method_id: "VM-003"
        method_type: "code_review"
        description: "Cross-verify role-scope.md against role-definition.md"
        success_criteria: "No contradictions between the two documents"
        responsible_role: "reviewer"
        automation_available: false
    test_suggestions: []
    re_review_scope:
      - "specs/006-reviewer-core/role-scope.md"
      - "specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md"
  
  closure_criteria:
    must_satisfy:
      - criterion_id: "CRIT-001"
        description: "role-scope.md aligned with role-definition.md on code modification"
        verification_method: "Compare role-scope.md Section 3 with role-definition.md Section 4"
        acceptance_criteria_reference: "BR-007: reviewer must not mutate production code"
      - criterion_id: "CRIT-002"
        description: "R-005 confidence justification rule added"
        verification_method: "Review contract for R-005 presence"
        acceptance_criteria_reference: "AC-002: confidence level with justification"
      - criterion_id: "CRIT-003"
        description: "R-006 governance compliance rule added"
        verification_method: "Review contract for R-006 presence"
        acceptance_criteria_reference: "AH-006: governance alignment checking"
    quality_gates:
      - gate_name: "Governance alignment"
        gate_description: "No conflicts between feature artifacts and canonical governance documents"
        gate_status: "pending"
    sign_off_required:
      - role: "reviewer"
        what_to_sign_off: "Verify all corrections complete and no new contradictions introduced"
  
  must_fix_items:
    items:
      - item_id: "MF-001"
        severity: "blocker"
        category: "governance"
        title: "Remove code modification authority from role-scope.md"
        description: "role-scope.md Section 3 states reviewer 'may fix minor issues directly', which contradicts role-definition.md BR-007 prohibition."
        location: "specs/006-reviewer-core/role-scope.md:78-85"
        remediation_steps:
          - step_number: 1
            action: "Locate the problematic section"
            details: "Find Section 3 in role-scope.md containing 'may fix' language"
          - step_number: 2
            action: "Remove code modification authority"
            details: "Delete the clause allowing reviewer to fix issues directly"
          - step_number: 3
            action: "Add explicit prohibition"
            details: "Add statement: 'reviewer must never modify production code during review'"
          - step_number: 4
            action: "Add actionable feedback requirement"
            details: "Add statement: 'reviewer must provide actionable feedback for developer to address'"
        expected_outcome: "role-scope.md aligned with role-definition.md on reviewer responsibilities"
        verification_checklist:
          - check_item: "No 'may fix' language present"
            expected_result: "Text search returns no matches"
          - check_item: "Explicit prohibition added"
            expected_result: "'must never modify production code' present"
          - check_item: "No contradiction with role-definition.md"
            expected_result: "Cross-reference shows alignment"
        estimated_effort: "15 minutes"
        priority_order: 1
      - item_id: "MF-002"
        severity: "blocker"
        category: "completeness"
        title: "Add R-006 governance compliance validation rule"
        description: "acceptance-decision-record contract is missing validation rule for governance_compliance field."
        location: "acceptance-decision-record-contract.md:Validation Rules section"
        remediation_steps:
          - step_number: 1
            action: "Add R-006 after R-005"
            details: "Insert new validation rule for governance_compliance"
          - step_number: 2
            action: "Specify required governance documents"
            details: "List role-definition.md, package-spec.md, quality-gate.md"
          - step_number: 3
            action: "Define NON_COMPLIANT handling"
            details: "Specify decision_state cannot be accept if NON_COMPLIANT"
        expected_outcome: "R-006 rule present with complete governance compliance validation"
        verification_checklist:
          - check_item: "R-006 exists"
            expected_result: "Rule present in Validation Rules section"
          - check_item: "Three governance documents listed"
            expected_result: "All required documents specified"
        estimated_effort: "30 minutes"
        priority_order: 2
      - item_id: "MF-003"
        severity: "major"
        category: "completeness"
        title: "Add R-005 confidence level justification rule"
        description: "acceptance-decision-record contract is missing validation rule for confidence level justification requirements."
        location: "acceptance-decision-record-contract.md:Validation Rules section"
        remediation_steps:
          - step_number: 1
            action: "Add R-005 rule"
            details: "Insert validation rule for confidence level justification"
          - step_number: 2
            action: "Specify justification requirements per level"
            details: "HIGH needs evidence_quality, MEDIUM needs assumptions_made, LOW needs gaps_in_evidence"
        expected_outcome: "R-005 rule present with level-specific justification requirements"
        verification_checklist:
          - check_item: "R-005 exists"
            expected_result: "Rule present in Validation Rules section"
          - check_item: "Level-specific requirements defined"
            expected_result: "Each level has required justification field"
        estimated_effort: "20 minutes"
        priority_order: 3
    total_must_fix_count: 3
    estimated_total_effort: "1 hour 5 minutes"
  
  should_fix_items:
    items:
      - item_id: "SF-001"
        severity: "minor"
        category: "documentation"
        title: "Add example showing governance conflict resolution"
        description: "The role-scope.md could benefit from an example showing how to handle governance conflicts."
        location: "specs/006-reviewer-core/role-scope.md:Examples section"
        improvement_suggestion: "Add example of escalating a governance conflict to architect"
        benefit_if_fixed: "Better guidance for handling edge cases"
        risk_if_not_fixed: "Reviewers may not know how to handle discovered conflicts"
        priority: "low"
    total_should_fix_count: 1
    recommendation: "Address should-fix items in follow-up if time permits. Not blocking for re-review."
  
  residual_risks:
    risks_after_fix:
      - risk_id: "RR-001"
        risk_description: "Other files may have similar governance conflicts not discovered in this review"
        likelihood: "low"
        impact: "medium"
        mitigation_recommendation: "Run governance alignment check across all feature artifacts"
        accepted_by: null
    known_limitations: []
    assumptions_made:
      - assumption: "No other role-scope files have similar contradictions"
        if_invalid: "Would require broader governance alignment review"
  
  re_review_criteria:
    trigger_conditions:
      - condition: "All three must_fix_items resolved"
      - condition: "Closure checklist pre_submission_checks completed"
    scope_for_re_review:
      - item_type: "file"
        item_path: "specs/006-reviewer-core/role-scope.md"
        reason: "Primary file for MF-001"
      - item_type: "file"
        item_path: "specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md"
        reason: "Primary file for MF-002 and MF-003"
    re_review_urgency: "high"
    estimated_re_review_effort: "45 minutes"
  
  closure_checklist:
    pre_submission_checks:
      - check_id: "PRE-001"
        check_description: "MF-001: role-scope.md code modification authority removed"
        verification_method: "Visual inspection of Section 3"
      - check_id: "PRE-002"
        check_description: "MF-002: R-006 governance compliance rule added"
        verification_method: "Verify rule presence in contract"
      - check_id: "PRE-003"
        check_description: "MF-003: R-005 confidence justification rule added"
        verification_method: "Verify rule presence in contract"
      - check_id: "PRE-004"
        check_description: "No new contradictions introduced"
        verification_method: "Cross-reference check against governance documents"
    submission_requirements:
      - requirement: "Updated role-scope.md"
        format: "Git commit: 'fix(role-scope): remove code modification authority, align with governance'"
      - requirement: "Updated acceptance-decision-record-contract.md"
        format: "Git commit: 'feat(contracts): add R-005 and R-006 validation rules'"
    post_fix_actions:
      - action: "Request re-review of both files"
        responsible_role: "developer"
      - action: "Update README if role boundaries description affected"
        responsible_role: "developer"
    completion_confirmation:
      - confirmation_item: "All must_fix_items verified by reviewer"
        confirmation_method: "Reviewer sign-off in follow-up review"
      - confirmation_item: "No governance conflicts remain"
        confirmation_method: "AH-006 compliance check"
  
  notes: "The governance conflict in MF-001 is the highest priority. MF-002 and MF-003 can be done in parallel but should be completed together for consistency."
  references:
    - reference_type: "documentation"
      reference_path: "role-definition.md"
      relevance: "Canonical source of truth for reviewer role boundaries"
    - reference_type: "documentation"
      reference_path: "docs/audit-hardening.md"
      relevance: "AH-006 governance alignment requirements"
    - reference_type: "contract"
      reference_path: "specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md"
      relevance: "Primary artifact for MF-002 and MF-003"
```

---

## Validation Checklist

Use this checklist to validate any `actionable-feedback-report`:

### Required Fields
- [ ] report_id exists and unique
- [ ] created_at in ISO 8601 format
- [ ] created_by is "reviewer"
- [ ] dispatch_id present
- [ ] task_id present
- [ ] decision_context complete
- [ ] issue_summary has all four sub-fields
- [ ] affected_files_artifacts has at least one file or artifact
- [ ] why_it_matters has business_impact and technical_impact
- [ ] required_correction has at least one correction
- [ ] suggested_owner_role.primary_owner defined
- [ ] expected_verification has at least one method
- [ ] closure_criteria.must_satisfy has at least one criterion
- [ ] must_fix_items has at least one item
- [ ] should_fix_items list exists (can be empty)
- [ ] residual_risks.risks_after_fix list exists
- [ ] re_review_criteria has at least one trigger_condition
- [ ] closure_checklist has at least one pre_submission_check

### Must-Fix vs Should-Fix Classification
- [ ] All must_fix_items are blocker or major severity
- [ ] All should_fix_items are minor or note severity
- [ ] No items are duplicated between the two lists
- [ ] Categories are appropriate for severity level

### Remediation Quality
- [ ] Each must_fix_item has remediation_steps
- [ ] Each must_fix_item has verification_checklist
- [ ] No vague remediation like "improve code" or "fix issue"
- [ ] Code examples provided for complex fixes

### Verification Quality
- [ ] Each verification_method has success_criteria
- [ ] re_review_scope covers all affected files
- [ ] Verification methods are actionable

### Closure Criteria
- [ ] All must_fix_items have corresponding closure criteria
- [ ] Each criterion has verification_method
- [ ] sign_off_required includes reviewer

### Residual Risk Honesty
- [ ] All known risks after fix documented
- [ ] Each risk has mitigation_recommendation
- [ ] No undisclosed known limitations

---

## References

- `specs/006-reviewer-core/spec.md` - Feature specification (AC-003)
- `specs/006-reviewer-core/role-scope.md` - Reviewer role scope
- `specs/006-reviewer-core/contracts/review-findings-report-contract.md` - Upstream artifact
- `specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md` - Related artifact
- `role-definition.md` - 6-role definition (Section 4: reviewer)
- `quality-gate.md` - Severity level definitions (Section 2.2)
- `docs/audit-hardening.md` - AH-006 governance alignment requirements
- `specs/005-tester-core/contracts/verification-report-contract.md` - Pattern template