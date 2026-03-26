# Review Findings Report Contract

## Contract Metadata

| Field | Value |
|-------|-------|
| **Contract ID** | AC-001-rev |
| **Contract Name** | Review Findings Report Contract |
| **Version** | 1.0.0 |
| **Owner** | reviewer |
| **Consumers** | acceptance, docs, security |

---

## Purpose

Define the complete schema and validation rules for the `review-findings-report` artifact, which records independent review findings with severity classification, governance alignment status, and actionable recommendations for downstream consumers.

---

## Schema

```yaml
review_findings_report:
  # Metadata
  report_id: string                # Unique report identifier
  created_at: timestamp            # Creation timestamp
  created_by: string               # Creator (reviewer)
  
  # 1. review_target (Required)
  review_target:
    feature_id: string             # Feature/deliverable ID
    feature_name: string           # Human-readable name
    target_type: enum              # feature | task | artifact | milestone
    target_version: string         # Version or commit reference
    description: string            # Brief description of what is under review
  
  # 2. reviewed_inputs (Required)
  reviewed_inputs:
    upstream_artifacts:
      - artifact_type: enum        # design-note | implementation-summary | verification-report | test-scope-report
        artifact_path: string      # Path to artifact
        artifact_version: string   # Version or timestamp
        consumed_fully: boolean    # Whether artifact was fully consumed
        consumption_notes: string | null
    specs_reviewed:
      - spec_path: string          # Path to spec.md
      spec_version: string
    canonical_documents_checked:
      - document_type: enum        # role-definition | package-spec | io-contract | quality-gate | README
        document_path: string
        check_performed: boolean
  
  # 3. summary_judgment (Required)
  summary_judgment:
    overall_assessment: enum       # acceptable | acceptable_with_concerns | unacceptable | needs_clarification
    key_strengths: string[]        # What was done well
    critical_gaps: string[]        # Must-address issues
    overall_risk_level: enum       # low | medium | high | critical
    readiness_for_acceptance: enum # ready | not_ready | partially_ready
  
  # 4. findings_by_severity (Required)
  findings_by_severity:
    blockers:
      - finding_id: string
        title: string
        description: string
        location: string           # File, artifact section, or spec reference
        evidence: string           # Supporting evidence
        impact: string             # Why this blocks acceptance
        recommended_remediation: string
    major:
      - finding_id: string
        title: string
        description: string
        location: string
        evidence: string
        impact: string
        recommended_remediation: string
    minor:
      - finding_id: string
        title: string
        description: string
        location: string
        evidence: string
        suggested_improvement: string
    notes:
      - finding_id: string
        title: string
        description: string
        location: string | null
        observation: string
  
  # 5. evidence_references (Required)
  evidence_references:
    file_references:
      - file_path: string
        line_range: string | null  # e.g., "45-60"
        context: string            # Why this file is relevant
    artifact_references:
      - artifact_type: string
        artifact_path: string
        section_referenced: string | null
    observations:
      - observation_id: string
        description: string
        observer: string
        timestamp: timestamp
        context: string
  
  # 6. scope_mismatches (Required)
  scope_mismatches:
    spec_vs_implementation:
      - spec_requirement: string
        implementation_status: enum  # implemented | partially_implemented | not_implemented | exceeded_spec
        details: string
    unauthorized_additions:
      - addition_description: string
        location: string
        justification: string | null
        recommendation: enum        # accept | reject | document_and_accept
    scope_gaps:
      - gap_description: string
        spec_reference: string
        impact: string
  
  # 7. quality_concerns (Required)
  quality_concerns:
    maintainability:
      - concern_id: string
        description: string
        location: string
        severity: enum              # major | minor
        suggestion: string
    performance:
      - concern_id: string
        description: string
        location: string | null
        severity: enum
        suggestion: string | null
    security_flags:
      - concern_id: string
        description: string
        location: string
        severity: enum
        recommendation: string
    other_concerns:
      - concern_id: string
        category: string
        description: string
        severity: enum
  
  # 8. governance_alignment_status (Required)
  governance_alignment_status:
    overall_status: enum           # aligned | drift_detected | critical_drift
    alignment_details:
      - document_type: string
        aligned: boolean
        conflicts: string[] | null
        drift_description: string | null
  
  # 9. governance_conflicts (Required)
  governance_conflicts:
    has_conflicts: boolean
    conflicts:
      - conflict_id: string
        document_1: string         # e.g., "role-definition.md Section 4"
        document_2: string         # e.g., "feature spec.md Section 2"
        conflict_description: string
        severity: enum             # blocker | major | minor
        resolution_recommendation: string
    sync_required: boolean         # Whether governance sync is needed
    sync_details: string | null
  
  # 10. open_questions (Required)
  open_questions:
    - question_id: string
      question: string
      context: string
      blocking: boolean            # Whether this blocks decision
      suggested_owner: enum        # architect | developer | tester | management
      urgency: enum                # high | medium | low
  
  # 11. recommended_next_action (Required)
  recommended_next_action:
    action: enum                   # accept | reject | request_changes | escalate
    rationale: string
    conditions_for_acceptance: string[] | null  # If request_changes
    escalation_target: string | null             # If escalate
    handoff_artifacts:
      - artifact_type: string
        artifact_path: string
        notes: string | null
```

---

## Field Specifications

### summary_judgment.overall_assessment

| Value | Definition | When to Use |
|-------|------------|-------------|
| `acceptable` | All critical requirements met, no blockers | Full alignment with spec, only minor notes |
| `acceptable_with_concerns` | Meets core requirements but has issues | Major findings that don't block but need attention |
| `unacceptable` | Blocking issues prevent acceptance | Blockers present, critical gaps |
| `needs_clarification` | Cannot determine acceptability | Missing information, spec ambiguity |

### summary_judgment.overall_risk_level

| Value | Definition | Example |
|-------|------------|---------|
| `low` | Minor concerns only, well within acceptable range | Style issues, minor documentation gaps |
| `medium` | Some concerns but manageable | Known gaps with workarounds, non-critical quality concerns |
| `high` | Significant concerns requiring attention | Multiple major findings, incomplete verification |
| `critical` | Severe issues requiring immediate action | Security vulnerabilities, data loss risks, blocker findings |

### findings_by_severity (per quality-gate.md Section 2.2)

| Severity | Definition | Example | Required Response |
|----------|------------|---------|-------------------|
| `blocker` | Must fix, blocks milestone acceptance | Critical spec deviation, security vulnerability, governance conflict | Must be resolved before acceptance |
| `major` | Affects downstream or causes understanding deviation | Missing required artifact, incomplete documentation, partial gap not disclosed | Must be addressed with documented rationale |
| `minor` | Light issues with improvement opportunity | Terminology inconsistency, format suggestions | Should be fixed but doesn't block |
| `note` | Informational, for reference | Observations, optional improvements | No action required |

### governance_alignment_status.overall_status

| Value | Definition | Required Action |
|-------|------------|-----------------|
| `aligned` | No conflicts with canonical governance documents | None |
| `drift_detected` | Minor inconsistencies with governance | Document and recommend sync |
| `critical_drift` | Fundamental conflicts with governance | Must resolve before acceptance |

### recommended_next_action.action

| Value | Meaning | Next Step |
|-------|---------|-----------|
| `accept` | Deliverable acceptable for downstream | Handoff to acceptance/docs/security |
| `reject` | Blocking issues require rework | Generate actionable-feedback-report for developer |
| `request_changes` | Changes needed but not blocking | Specify conditions for acceptance |
| `escalate` | Requires higher-level decision | Escalate to architect/management |

---

## Validation Rules

### R-001: Required Fields

以下字段必须存在且非空：

- `report_id`
- `created_at`
- `created_by`
- `review_target` (所有子字段)
- `reviewed_inputs` (至少一个 upstream_artifact)
- `summary_judgment` (所有子字段)
- `findings_by_severity` (可包含空列表但必须存在所有严重级别键)
- `evidence_references` (至少一个引用类型)
- `scope_mismatches` (可包含空列表但必须存在)
- `quality_concerns` (可包含空列表但必须存在)
- `governance_alignment_status` (所有子字段)
- `governance_conflicts` (has_conflicts 必须明确)
- `open_questions` (可包含空列表但必须存在)
- `recommended_next_action` (action 和 rationale 必须存在)

### R-002: BR-004 Compliance (Severity Classification)

- 每个 finding 必须归类到 blocker/major/minor/note 之一
- 不得将所有发现堆砌在一起不分类
- blocker 必须有 impact 说明和 recommended_remediation
- major 必须有 impact 说明

### R-003: BR-006 Compliance (Governance Alignment)

- `governance_alignment_status` 必须明确
- `canonical_documents_checked` 必须列出检查了哪些治理文档
- 如果 `overall_status` 为 `drift_detected` 或 `critical_drift`，必须在 `governance_conflicts` 中详细说明

### R-004: Evidence Traceability

- 每个 finding 必须有 `evidence` 字段
- 每个 finding 必须有 `location` 字段（或说明为何 N/A）
- `evidence_references` 必须支持所有 findings 的追溯

### R-005: Action Consistency

- 如果 `findings_by_severity.blockers` 非空，`recommended_next_action.action` 必须是 `reject` 或 `escalate`
- 如果 `summary_judgment.overall_assessment` 为 `unacceptable`，`recommended_next_action.action` 必须是 `reject` 或 `escalate`

### R-006: Upstream Consumption Evidence

- `reviewed_inputs.upstream_artifacts` 必须列出所有消费的上游工件
- 如果 `consumed_fully` 为 false，必须说明 `consumption_notes`

### R-007: Scope Boundary Check

- `scope_mismatches` 必须检查 spec vs implementation
- 如有 unauthorized_additions，必须给出 recommendation

---

## Consumer Responsibilities

### Acceptance

- 根据 `recommended_next_action` 决定下一步
- 理解 `summary_judgment.overall_risk_level` 带来的风险
- 检查 `governance_alignment_status` 是否可接受
- 决定是否接受 partial 或有 concerns 的交付

### Docs

- 根据 `findings_by_severity` 确定文档同步范围
- 理解 `scope_mismatches` 对文档的影响
- 检查 `governance_conflicts` 是否需要文档更新

### Security

- 重点关注 `quality_concerns.security_flags`
- 评估 `findings_by_severity.blockers` 中的安全问题
- 确定是否需要专门的安全审查

---

## Producer Responsibilities

### Reviewer

- 独立执行审查，不依赖 developer 或 tester 的自评
- 消费所有相关上游工件
- 如实分类所有 findings 到正确的严重级别
- 检查 governance alignment (AH-006 合规)
- 提供可追溯的 evidence
- 生成明确的 recommended_next_action

---

## Example: Acceptable Review with Minor Notes

```yaml
review_findings_report:
  report_id: "RFR-006-001"
  created_at: "2026-03-26T10:00:00Z"
  created_by: "reviewer"
  
  review_target:
    feature_id: "006-reviewer-core"
    feature_name: "Reviewer Core Skills System"
    target_type: "feature"
    target_version: "1.0.0-draft"
    description: "Core reviewer capability layer for independent review"
  
  reviewed_inputs:
    upstream_artifacts:
      - artifact_type: "design-note"
        artifact_path: "specs/006-reviewer-core/design-note.md"
        artifact_version: "2026-03-26"
        consumed_fully: true
        consumption_notes: null
      - artifact_type: "implementation-summary"
        artifact_path: "specs/006-reviewer-core/implementation-summary.md"
        artifact_version: "2026-03-26"
        consumed_fully: true
        consumption_notes: null
      - artifact_type: "verification-report"
        artifact_path: "specs/006-reviewer-core/verification-report.md"
        artifact_version: "2026-03-26"
        consumed_fully: true
        consumption_notes: null
    specs_reviewed:
      - spec_path: "specs/006-reviewer-core/spec.md"
        spec_version: "1.0.0"
    canonical_documents_checked:
      - document_type: "role-definition"
        document_path: "role-definition.md"
        check_performed: true
      - document_type: "package-spec"
        document_path: "package-spec.md"
        check_performed: true
      - document_type: "quality-gate"
        document_path: "quality-gate.md"
        check_performed: true
  
  summary_judgment:
    overall_assessment: "acceptable_with_concerns"
    key_strengths:
      - "Complete artifact contracts with all required fields"
      - "Clear role boundaries defined in role-scope.md"
      - "Comprehensive validation model"
    critical_gaps: []
    overall_risk_level: "low"
    readiness_for_acceptance: "ready"
  
  findings_by_severity:
    blockers: []
    major:
      - finding_id: "MAJ-001"
        title: "Missing skill example files"
        description: "SKILL.md files reference examples/ directory but example files are not yet created"
        location: ".opencode/skills/reviewer/*/examples/"
        evidence: "Directory structure check shows examples/ folders are empty"
        impact: "Educational materials incomplete, violates AC-007"
        recommended_remediation: "Create at least 2 examples per skill before completion"
    minor:
      - finding_id: "MIN-001"
        title: "Terminology inconsistency in role-scope.md"
        description: "Section 3 uses 'must-review' while other sections use 'must-fix'"
        location: "specs/006-reviewer-core/role-scope.md:45"
        evidence: "Text comparison across sections"
        suggested_improvement: "Standardize to 'must-fix' per quality-gate.md terminology"
    notes:
      - finding_id: "NOTE-001"
        title: "Consider adding performance benchmarks"
        description: "NFR-001 mentions 30-60 minute review completion but no benchmark data"
        location: "specs/006-reviewer-core/spec.md:687"
        observation: "This is a future enhancement, not blocking"
  
  evidence_references:
    file_references:
      - file_path: "specs/006-reviewer-core/spec.md"
        line_range: "370-450"
        context: "Artifact contract definitions"
      - file_path: "specs/006-reviewer-core/role-scope.md"
        line_range: null
        context: "Role boundary definitions"
    artifact_references:
      - artifact_type: "design-note"
        artifact_path: "specs/006-reviewer-core/design-note.md"
        section_referenced: "Module Boundaries"
    observations:
      - observation_id: "OBS-001"
        description: "All 3 artifact contracts present and complete"
        observer: "reviewer"
        timestamp: "2026-03-26T09:45:00Z"
        context: "Contract directory inspection"
  
  scope_mismatches:
    spec_vs_implementation:
      - spec_requirement: "AC-007: Each skill must include at least 2 examples"
        implementation_status: "not_implemented"
        details: "Example files referenced but not created"
      - spec_requirement: "AC-004: All 3 artifact contracts defined"
        implementation_status: "implemented"
        details: "All contracts present with required fields"
    unauthorized_additions: []
    scope_gaps: []
  
  quality_concerns:
    maintainability:
      - concern_id: "QC-001"
        description: "Validation layer not yet automated"
        location: "specs/006-reviewer-core/validation/"
        severity: "minor"
        suggestion: "Consider adding automated validation scripts in future iteration"
    performance: []
    security_flags: []
    other_concerns: []
  
  governance_alignment_status:
    overall_status: "aligned"
    alignment_details:
      - document_type: "role-definition.md"
        aligned: true
        conflicts: null
        drift_description: null
      - document_type: "package-spec.md"
        aligned: true
        conflicts: null
        drift_description: null
      - document_type: "quality-gate.md"
        aligned: true
        conflicts: null
        drift_description: null
  
  governance_conflicts:
    has_conflicts: false
    conflicts: []
    sync_required: false
    sync_details: null
  
  open_questions:
    - question_id: "OQ-001"
      question: "Should decision vocabulary include finer states?"
      context: "OQ-001 in spec asks about accept-with-minor-notes granularity"
      blocking: false
      suggested_owner: "architect"
      urgency: "low"
  
  recommended_next_action:
    action: "request_changes"
    rationale: "Core implementation is solid but missing educational materials (examples) per AC-007"
    conditions_for_acceptance:
      - "Create at least 2 examples per reviewer skill"
      - "Fix terminology inconsistency MIN-001"
    escalation_target: null
    handoff_artifacts:
      - artifact_type: "actionable-feedback-report"
        artifact_path: "specs/006-reviewer-core/actionable-feedback-report.md"
        notes: "Will be generated after this report is accepted"
```

---

## Example: Critical Drift with Blockers

```yaml
review_findings_report:
  report_id: "RFR-006-002"
  created_at: "2026-03-26T14:00:00Z"
  created_by: "reviewer"
  
  review_target:
    feature_id: "006-reviewer-core"
    feature_name: "Reviewer Core Skills System"
    target_type: "feature"
    target_version: "1.0.0-draft"
    description: "Core reviewer capability layer for independent review"
  
  reviewed_inputs:
    upstream_artifacts:
      - artifact_type: "implementation-summary"
        artifact_path: "specs/006-reviewer-core/implementation-summary.md"
        artifact_version: "2026-03-26"
        consumed_fully: true
        consumption_notes: null
    specs_reviewed:
      - spec_path: "specs/006-reviewer-core/spec.md"
        spec_version: "1.0.0"
    canonical_documents_checked:
      - document_type: "role-definition"
        document_path: "role-definition.md"
        check_performed: true
  
  summary_judgment:
    overall_assessment: "unacceptable"
    key_strengths:
      - "Artifact contracts well-structured"
    critical_gaps:
      - "Role boundary in role-scope.md contradicts role-definition.md Section 4"
      - "Reviewer claims authority to modify code during review"
    overall_risk_level: "critical"
    readiness_for_acceptance: "not_ready"
  
  findings_by_severity:
    blockers:
      - finding_id: "BLK-001"
        title: "Governance conflict: Role boundary violation"
        description: "role-scope.md Section 3 states reviewer 'may fix minor issues directly', contradicting role-definition.md BR-007 prohibition"
        location: "specs/006-reviewer-core/role-scope.md:78-85"
        evidence: "Direct text comparison shows contradiction"
        impact: "Fundamental governance conflict, violates AH-006"
        recommended_remediation: "Remove 'may fix' clause and replace with 'must provide feedback for developer to fix'"
      - finding_id: "BLK-002"
        title: "Missing upstream artifact consumption"
        description: "verification-report not consumed before review judgment"
        location: "reviewed_inputs.upstream_artifacts"
        evidence: "verification-report exists but not listed in reviewed_inputs"
        impact: "Review judgment made without tester evidence, violates BR-001"
        recommended_remediation: "Consume verification-report and re-evaluate findings"
    major:
      - finding_id: "MAJ-001"
        title: "Status truthfulness violation"
        description: "completion-report claims 'Fully Complete' but README shows status as 'In Progress'"
        location: "specs/006-reviewer-core/completion-report.md:15"
        evidence: "Status mismatch between completion-report and README"
        impact: "Violates AH-004 status truthfulness requirement"
        recommended_remediation: "Update completion-report to reflect actual status"
    minor: []
    notes: []
  
  evidence_references:
    file_references:
      - file_path: "specs/006-reviewer-core/role-scope.md"
        line_range: "78-85"
        context: "Role boundary contradiction"
      - file_path: "role-definition.md"
        line_range: "180-195"
        context: "Canonical role boundary for reviewer"
    artifact_references:
      - artifact_type: "verification-report"
        artifact_path: "specs/006-reviewer-core/verification-report.md"
        section_referenced: null
    observations: []
  
  scope_mismatches:
    spec_vs_implementation: []
    unauthorized_additions:
      - addition_description: "Reviewer code modification capability"
        location: "specs/006-reviewer-core/role-scope.md:80"
        justification: null
        recommendation: "reject"
    scope_gaps: []
  
  quality_concerns:
    maintainability: []
    performance: []
    security_flags: []
    other_concerns: []
  
  governance_alignment_status:
    overall_status: "critical_drift"
    alignment_details:
      - document_type: "role-definition.md"
        aligned: false
        conflicts:
          - "Section 4: reviewer must not mutate production code"
          - "Section 4.2: reviewer provides feedback, not fixes"
        drift_description: "role-scope.md grants modification authority not present in canonical definition"
  
  governance_conflicts:
    has_conflicts: true
    conflicts:
      - conflict_id: "GC-001"
        document_1: "role-definition.md Section 4"
        document_2: "specs/006-reviewer-core/role-scope.md Section 3"
        conflict_description: "role-scope.md allows code modification, role-definition.md explicitly prohibits it"
        severity: "blocker"
        resolution_recommendation: "Align role-scope.md with role-definition.md; reviewer must never modify code"
    sync_required: true
    sync_details: "After fixing role-scope.md, update README to clarify reviewer does not modify code"
  
  open_questions:
    - question_id: "OQ-001"
      question: "How should role-scope.md be corrected?"
      context: "Need to align with role-definition.md while preserving review efficiency"
      blocking: true
      suggested_owner: "architect"
      urgency: "high"
  
  recommended_next_action:
    action: "reject"
    rationale: "Critical governance conflicts prevent acceptance. Role boundary violations are blockers."
    conditions_for_acceptance: null
    escalation_target: null
    handoff_artifacts:
      - artifact_type: "actionable-feedback-report"
        artifact_path: "specs/006-reviewer-core/actionable-feedback-report.md"
        notes: "Must contain must-fix items for BLK-001, BLK-002, MAJ-001"
```

---

## Validation Checklist

Use this checklist to validate any `review-findings-report`:

### Required Fields
- [ ] report_id exists and unique
- [ ] created_at in ISO 8601 format
- [ ] created_by is "reviewer"
- [ ] review_target complete with all sub-fields
- [ ] reviewed_inputs has at least one upstream_artifact
- [ ] summary_judgment complete with all sub-fields
- [ ] findings_by_severity has all four severity keys (blocker/major/minor/note)
- [ ] evidence_references has at least one reference
- [ ] scope_mismatches exists (can be empty lists)
- [ ] quality_concerns exists (can be empty lists)
- [ ] governance_alignment_status has overall_status
- [ ] governance_conflicts has has_conflicts boolean
- [ ] open_questions exists (can be empty list)
- [ ] recommended_next_action has action and rationale

### Severity Discipline
- [ ] Each finding classified to correct severity per quality-gate.md Section 2.2
- [ ] Blockers have impact and remediation
- [ ] Major findings have impact description

### Governance Alignment
- [ ] canonical_documents_checked lists governance docs reviewed
- [ ] governance_alignment_status accurately reflects conflicts
- [ ] If critical_drift, governance_conflicts details present

### Evidence Quality
- [ ] Each finding has evidence field
- [ ] Each finding has location or N/A justification
- [ ] evidence_references supports all findings

### Action Consistency
- [ ] If blockers present, action is reject or escalate
- [ ] If overall_assessment is unacceptable, action is reject or escalate
- [ ] If action is request_changes, conditions_for_acceptance provided

---

## References

- `specs/006-reviewer-core/spec.md` - Feature specification (AC-001)
- `specs/006-reviewer-core/role-scope.md` - Reviewer role scope
- `quality-gate.md` Section 2.2 - Severity classification model
- `docs/audit-hardening.md` - AH-006 governance alignment rules
- `role-definition.md` Section 4 - Reviewer role definition
- `specs/005-tester-core/contracts/verification-report-contract.md` - Pattern template