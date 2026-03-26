# Governance Drift Detection Example

## Example Metadata

| Field | Value |
|-------|-------|
| **Example Type** | Governance Drift Detection Workflow |
| **Workflow Reference** | spec.md Section 5.3 Workflow 3 |
| **Skills Used** | spec-implementation-diff |
| **Artifacts Produced** | review-findings-report (with governance conflicts) |
| **Key Feature** | AH-006 Governance Alignment Enforcement (BR-006) |

---

## 1. Scenario Overview

### 1.1 Feature Being Reviewed

**Feature**: Report Generation System (Feature 007)

**Implementation Summary** (from developer):
```yaml
implementation_summary:
  goal_alignment:
    goal: "Implement report generation with PDF export"
    achieved: true
  
  changed_files:
    - path: "src/services/ReportService.ts"
      change_type: "added"
    - path: "src/controllers/ReportController.ts"
      change_type: "added"
    - path: "src/utils/pdfGenerator.ts"
      change_type: "added"
    - path: "README.md"
      change_type: "modified"
  
  completion_report:
    status: "Complete"
    artifacts_delivered:
      - "src/services/ReportService.ts"
      - "src/controllers/ReportController.ts"
      - "docs/api/report-api.md"
```

### 1.2 Governance Drift Detected

During spec-implementation-diff execution, the following governance conflicts were identified:

| Conflict Type | Location | Severity |
|---------------|----------|----------|
| Role boundary violation | code comments | major |
| Terminology drift | README.md | major |
| Path resolution failure | completion-report | major |
| Status misrepresentation | README.md | major |

---

## 2. Reviewer Workflow Execution

### 2.1 Step 1: Execute spec-implementation-diff

**Comparison: Spec vs Implementation**:

```yaml
spec_implementation_comparison:
  functional_requirements:
    - requirement: "Generate PDF reports"
      status: "IMPLEMENTED"
      evidence: "src/utils/pdfGenerator.ts"
    - requirement: "Export to various formats"
      status: "PARTIAL"
      evidence: "Only PDF implemented"
  
  governance_alignment:
    status: "DRIFT_DETECTED"
    conflicts: 4
```

### 2.2 Step 2: Check Against Canonical Documents (AH-006)

**AH-006 Mandatory Canonical Comparison**:

#### A. Role Boundary Check vs role-definition.md

```yaml
role_boundary_check:
  canonical_source: "role-definition.md"
  
  violations:
    - violation_id: "GOV-001"
      category: "Role Boundary"
      severity: "major"
      
      canonical_rule: |
        Section 4.3: reviewer must not mutate production code.
        "If implementation changes are required, reviewer produces 
        actionable feedback, not code changes."
      
      found_violation: |
        File: src/services/ReportService.ts
        Line 15-20: Comment block
        
        // REVIEWER NOTE: This function was rewritten by the reviewer
        // during code review to fix the PDF generation bug.
        // Original author: developer-a
        // Modified by: reviewer-b (during review)
      
      impact: |
        Reviewer has violated role boundary by modifying code directly.
        This undermines the independent review principle.
      
      required_action: |
        1. Revert the reviewer's code modifications
        2. Generate actionable-feedback-report instead
        3. Document the violation in review-findings-report
```

#### B. Terminology Check vs package-spec.md

```yaml
terminology_check:
  canonical_source: "package-spec.md"
  
  violations:
    - violation_id: "GOV-002"
      category: "Terminology"
      severity: "major"
      
      canonical_rule: |
        Section 2.1: Use 6-role formal terminology.
        Roles: architect, developer, tester, reviewer, docs, security.
        Legacy terms (spec-writer, task-executor) must be marked as
        "(legacy)" or "(transition)".
      
      found_violation: |
        File: README.md
        Line 45:
        
        "The spec-writer creates the specification, and the task-executor
        implements the code."
        
        Should be:
        "The architect creates the specification, and the developer
        implements the code."
        
        OR mark as legacy:
        "The spec-writer (legacy) creates the specification..."
      
      impact: |
        Using deprecated terminology confuses the 6-role model.
        README is a governance document when it defines roles/processes.
      
      required_action: |
        Update README.md to use canonical 6-role terminology.
```

#### C. Path Resolution Check vs io-contract.md

```yaml
path_resolution_check:
  canonical_source: "io-contract.md"
  
  violations:
    - violation_id: "GOV-003"
      category: "Path Resolution"
      severity: "major"
      
      canonical_rule: |
        AH-003: Declared artifact paths must resolve to real files.
        Path declarations in spec.md, plan.md, tasks.md, and 
        completion-report.md must be verifiable.
      
      found_violation: |
        File: specs/007-report-generation/completion-report.md
        Declared: "docs/api/report-api.md"
        Exists: false
        
        Actual file: "docs/api/report-generation-api.md"
        
        The declared path does not match the actual file location.
      
      impact: |
        Path mismatch prevents downstream consumers from finding artifacts.
        Automation tools cannot verify artifact delivery.
      
      required_action: |
        Either:
        1. Rename file to match declared path, OR
        2. Update completion-report to reflect actual path
```

#### D. Status Truthfulness Check vs README.md

```yaml
status_truthfulness_check:
  canonical_source: "README.md"
  
  violations:
    - violation_id: "GOV-004"
      category: "Status Truthfulness"
      severity: "major"
      
      canonical_rule: |
        AH-004: completion-report status must be synchronized with README.
        Partial/known gaps must be disclosed.
        "Substantially Complete with Known Gaps" must not be reported as
        "Fully Complete".
      
      found_violation: |
        completion-report.md states:
          status: "Fully Complete"
          known_gaps: ["CSV export not implemented"]
        
        README.md states:
          Feature 007: "Complete"
        
        However, CSV export is a spec requirement:
          spec.md requirement 3.2: "Export to PDF and CSV formats"
        
        This is actually "Substantially Complete with Known Gaps",
        not "Fully Complete".
      
      impact: |
        Status misrepresentation misleads stakeholders about actual
        feature completeness. Known gaps are hidden.
      
      required_action: |
        1. Update completion-report.md status to:
           status: "Substantially Complete with Known Gaps"
        2. Update README.md to reflect partial completion
        3. Document the CSV export gap explicitly
```

### 2.3 Step 3: Classify Governance Conflicts

**Governance Conflict Classification**:

| Conflict | Type | Severity | Impact |
|----------|------|----------|--------|
| GOV-001 | Role boundary violation | major | Undermines review independence |
| GOV-002 | Terminology drift | major | Confuses role model |
| GOV-003 | Path resolution failure | major | Breaks artifact discovery |
| GOV-004 | Status misrepresentation | major | Misleads stakeholders |

**Per AH-006: Canonical conflicts are at minimum MAJOR severity.**

### 2.4 Step 4: Document Governance Drift Findings

```yaml
governance_drift_findings:
  summary: |
    4 governance conflicts detected during AH-006 alignment check.
    All conflicts are MAJOR severity per audit hardening rules.
    Feature cannot be accepted until governance is synchronized.
  
  conflicts:
    - conflict_id: "GOV-001"
      category: "Role Boundary"
      severity: "major"
      canonical_reference: "role-definition.md Section 4.3"
      description: "Reviewer mutated production code during review"
      evidence_location: "src/services/ReportService.ts:15-20"
      required_sync_action:
        - "Revert reviewer code modifications"
        - "Generate actionable-feedback-report instead"
        - "Document violation in reviewer's performance record"
    
    - conflict_id: "GOV-002"
      category: "Terminology"
      severity: "major"
      canonical_reference: "package-spec.md Section 2.1"
      description: "README uses deprecated legacy terminology"
      evidence_location: "README.md:45"
      required_sync_action:
        - "Update to use 6-role terminology (architect, developer, etc.)"
        - "Or mark legacy terms explicitly"
    
    - conflict_id: "GOV-003"
      category: "Path Resolution"
      severity: "major"
      canonical_reference: "io-contract.md AH-003"
      description: "Declared artifact path does not match actual file"
      evidence_location: "completion-report.md, docs/api/"
      required_sync_action:
        - "Align path declaration with actual file location"
        - "Update completion-report to reflect correct path"
    
    - conflict_id: "GOV-004"
      category: "Status Truthfulness"
      severity: "major"
      canonical_reference: "quality-gate.md AH-004"
      description: "Status claims 'Fully Complete' but CSV export missing"
      evidence_location: "completion-report.md, README.md"
      required_sync_action:
        - "Update status to 'Substantially Complete with Known Gaps'"
        - "Disclose CSV export gap in README"
  
  recommendation: |
    Feature requires governance repair before acceptance.
    All 4 conflicts must be resolved to restore alignment.
    Recommend: Execute 002b-governance-repair workflow.
```

### 2.5 Step 5: Recommend Sync Actions

```yaml
sync_actions:
  immediate_required:
    - action: "Revert reviewer code modifications"
      owner: "developer"
      priority: "blocker"
      reason: "Role boundary violation must be corrected"
    
    - action: "Update README terminology"
      owner: "docs"
      priority: "major"
      reason: "Governance document must use canonical terms"
    
    - action: "Fix path resolution mismatch"
      owner: "developer"
      priority: "major"
      reason: "Artifact paths must be discoverable"
    
    - action: "Correct status misrepresentation"
      owner: "developer"
      priority: "major"
      reason: "Status must be truthful"
  
  governance_repair_workflow:
    reference: "002b-governance-repair"
    trigger: "Multiple governance conflicts detected"
    scope: "Feature 007 governance alignment"
```

---

## 3. Artifact Production

### 3.1 review-findings-report (with Governance Conflicts)

```yaml
review_findings_report:
  review_target: "Report Generation System (Feature 007)"
  
  reviewed_inputs:
    - artifact: "implementation-summary"
      source: "developer"
    - artifact: "completion-report"
      source: "developer"
    - artifact: "role-definition.md"
      source: "canonical"
    - artifact: "package-spec.md"
      source: "canonical"
    - artifact: "io-contract.md"
      source: "canonical"
    - artifact: "quality-gate.md"
      source: "canonical"
  
  summary_judgment: |
    Feature functionality is implemented correctly, but governance alignment
    is compromised. 4 governance conflicts detected per AH-006 check.
    Feature cannot be accepted until governance is restored.
  
  findings_by_severity:
    blocker: []
    major:
      - finding_id: "GOV-001"
        category: "Governance - Role Boundary"
        description: "Reviewer code mutation violation"
      - finding_id: "GOV-002"
        category: "Governance - Terminology"
        description: "Deprecated terminology in README"
      - finding_id: "GOV-003"
        category: "Governance - Path Resolution"
        description: "Declared path mismatch"
      - finding_id: "GOV-004"
        category: "Governance - Status Truthfulness"
        description: "Status misrepresentation"
    minor: []
    note: []
  
  evidence_references:
    - file: "src/services/ReportService.ts"
      lines: "15-20"
    - file: "README.md"
      lines: "45"
    - file: "specs/007-report-generation/completion-report.md"
    - file: "docs/api/"
  
  scope_mismatches: []
  quality_concerns: []
  
  governance_alignment_status: "DRIFT_DETECTED"
  
  governance_conflicts:
    - conflict_id: "GOV-001"
      canonical_document: "role-definition.md"
      severity: "major"
    - conflict_id: "GOV-002"
      canonical_document: "package-spec.md"
      severity: "major"
    - conflict_id: "GOV-003"
      canonical_document: "io-contract.md"
      severity: "major"
    - conflict_id: "GOV-004"
      canonical_document: "quality-gate.md"
      severity: "major"
  
  open_questions: []
  
  recommended_next_action: "request_changes"
  
  governance_repair_required: true
```

### 3.2 acceptance-decision-record

```yaml
acceptance_decision_record:
  target_feature: "Report Generation System (Feature 007)"
  
  decision_state: "reject"
  
  decision_rationale: |
    Feature rejected due to governance drift detected during AH-006 check.
    
    Although functional requirements are met, the following governance
    conflicts prevent acceptance:
    
    1. GOV-001 (major): Reviewer mutated production code
       - Violates role-definition.md Section 4.3
       - Undermines independent review principle
    
    2. GOV-002 (major): Deprecated terminology in README
       - Violates package-spec.md Section 2.1
       - Confuses 6-role model
    
    3. GOV-003 (major): Path resolution failure
       - Violates io-contract.md AH-003
       - Breaks artifact discovery
    
    4. GOV-004 (major): Status misrepresentation
       - Violates quality-gate.md AH-004
       - Misleads stakeholders
    
    Per AH-006, canonical conflicts are minimum MAJOR severity.
    Feature requires governance repair before acceptance.
  
  blocking_issues:
    - issue_id: "GOV-001"
      description: "Role boundary violation - reviewer code mutation"
      severity: "major"
    - issue_id: "GOV-002"
      description: "Terminology drift in README"
      severity: "major"
    - issue_id: "GOV-003"
      description: "Path resolution mismatch"
      severity: "major"
    - issue_id: "GOV-004"
      description: "Status misrepresentation"
      severity: "major"
  
  non_blocking_issues: []
  
  acceptance_conditions: []
  
  downstream_recommendation:
    developer: "Execute governance repair workflow"
    docs: "Update README with canonical terminology"
    acceptance: "Track governance repair progress"
  
  reviewer_confidence_level: "HIGH"
  confidence_rationale: |
    - AH-006 mandatory checks executed
    - All canonical documents compared
    - Conflicts clearly documented with evidence
    - Remediation path defined
  
  governance_compliance: "NON-COMPLIANT"
  governance_repair_required: true
```

---

## 4. Handoff Summary

### 4.1 Artifacts Delivered

| Artifact | Status | Consumer |
|----------|--------|----------|
| review-findings-report | ✅ Complete (with governance conflicts) | acceptance, docs, developer |
| acceptance-decision-record | ✅ Complete | acceptance, management |

### 4.2 Governance Drift Summary

**Status**: DRIFT_DETECTED

**Conflicts**: 4 (all major)

**Required Repair**:
1. Revert reviewer code modifications
2. Update README terminology
3. Fix path resolution mismatch
4. Correct status misrepresentation

**Next Step**: Execute 002b-governance-repair workflow

---

## 5. BR-006 Compliance Demonstration

### 5.1 What NOT to Do

**Prohibited (BR-006 / AH-006 Violation)**:
```yaml
# ❌ WRONG: Skip governance alignment
governance_alignment_status: "ALIGNED"
governance_conflicts: []
# Reviewer did not actually check canonical documents
```

```yaml
# ❌ WRONG: Ignore canonical conflicts
findings:
  - "Code looks good"
# No comparison against role-definition.md, package-spec.md, etc.
```

### 5.2 Correct Approach

**Required (BR-006 / AH-006 Compliant)**:
```yaml
# ✅ CORRECT: Check all canonical documents
governance_alignment_check:
  canonical_documents_checked:
    - role-definition.md
    - package-spec.md
    - io-contract.md
    - quality-gate.md
  
  conflicts_found: 4
  all_classified_as: "major"
  
  required_action: "governance_repair"
```

---

## 6. BR Compliance Summary

| BR | Compliance | Evidence |
|----|------------|----------|
| BR-001 | ✅ | Consumed all upstream artifacts including canonical docs |
| BR-002 | ✅ | Independent review beyond self-check |
| BR-003 | ✅ | Explicit decision state: reject |
| BR-004 | ✅ | All findings severity-classified |
| BR-005 | ✅ | Governance repair path specified |
| BR-006 | ✅ | **AH-006 governance alignment enforced** |
| BR-007 | ✅ | Identified GOV-001 as role boundary violation |
| BR-008 | ✅ | Scope checked |
| BR-009 | ✅ | GOV-004 identified status misrepresentation |
| BR-010 | ✅ | 6-role terminology used in report |

---

## 7. Skills Used Reference

| Skill | Purpose | SKILL.md Location |
|-------|---------|-------------------|
| spec-implementation-diff | AH-006 governance alignment check | `.opencode/skills/reviewer/spec-implementation-diff/SKILL.md` |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial governance drift detection example |