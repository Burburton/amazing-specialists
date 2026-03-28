# Example 001: Spec Alignment Check

## Scenario

Reviewer is performing spec-implementation diff for `005-tester-core` feature, checking that implementation aligns with the specification.

## Input Artifacts

### Spec Reference (excerpt from spec.md)

```yaml
feature_id: 005-tester-core
feature_name: Tester Core Skills

requirements:
  - id: SKILL-001
    description: Implement unit-test-design skill
    acceptance_criteria:
      - AC-001: SKILL.md exists with complete content
      - AC-002: Examples directory with 2+ examples
      - AC-003: Anti-examples directory with 2+ anti-examples
      - AC-004: Checklists directory with 1+ checklist

  - id: SKILL-002
    description: Implement regression-analysis skill
    acceptance_criteria:
      - AC-005: SKILL.md exists with complete content
      - AC-006: BR-006 compliance documented
      
  - id: SKILL-003
    description: Implement edge-case-matrix skill
    acceptance_criteria:
      - AC-007: SKILL.md exists with complete content
      - AC-008: Edge case categories defined
```

### Implementation Summary (from developer)

```yaml
implementation_summary:
  feature_id: 005-tester-core
  
  changed_files:
    - path: .opencode/skills/tester/unit-test-design/SKILL.md
      status: created
    - path: .opencode/skills/tester/unit-test-design/examples/
      status: created
    - path: .opencode/skills/tester/regression-analysis/SKILL.md
      status: created
    - path: .opencode/skills/tester/edge-case-matrix/SKILL.md
      status: created
      
  skills_implemented:
    - unit-test-design
    - regression-analysis
    - edge-case-matrix
    
  business_rules_addressed:
    - BR-001
    - BR-006
    - BR-008
```

## Step-by-Step Execution

### Step 1: Requirement Extraction

Extract all requirements and acceptance criteria from spec:

| Req ID | Description | AC Count | Status |
|--------|-------------|----------|--------|
| SKILL-001 | unit-test-design | 4 ACs | To verify |
| SKILL-002 | regression-analysis | 2 ACs | To verify |
| SKILL-003 | edge-case-matrix | 2 ACs | To verify |

### Step 2: Implementation Mapping

Map each requirement to implementation:

| Req ID | AC | Spec Requirement | Implementation Location | Status |
|--------|-----|------------------|------------------------|--------|
| SKILL-001 | AC-001 | SKILL.md exists | `.opencode/skills/tester/unit-test-design/SKILL.md` | ✅ Found |
| SKILL-001 | AC-002 | 2+ examples | `.opencode/skills/tester/unit-test-design/examples/` | ✅ Found |
| SKILL-001 | AC-003 | 2+ anti-examples | `.opencode/skills/tester/unit-test-design/anti-examples/` | ✅ Found |
| SKILL-001 | AC-004 | 1+ checklist | `.opencode/skills/tester/unit-test-design/checklists/` | ✅ Found |
| SKILL-002 | AC-005 | SKILL.md exists | `.opencode/skills/tester/regression-analysis/SKILL.md` | ✅ Found |
| SKILL-002 | AC-006 | BR-006 documented | SKILL.md Section "Business Rules Compliance" | ✅ Found |
| SKILL-003 | AC-007 | SKILL.md exists | `.opencode/skills/tester/edge-case-matrix/SKILL.md` | ✅ Found |
| SKILL-003 | AC-008 | Edge case categories | SKILL.md Section "Categories" | ✅ Found |

### Step 3: Alignment Verification

Verify each implementation matches spec expectations:

```yaml
alignment_checks:
  - check: "SKILL-001 implementation completeness"
    expected: "4 ACs satisfied"
    actual: "4 ACs satisfied"
    alignment: aligned
    
  - check: "SKILL-002 BR-006 compliance"
    expected: "Business Rules Compliance section in SKILL.md"
    actual: "Found in regression-analysis/SKILL.md lines 14-22"
    alignment: aligned
    
  - check: "All skills follow naming convention"
    expected: ".opencode/skills/tester/<skill-name>/SKILL.md"
    actual: "All 3 skills follow convention"
    alignment: aligned
```

### Step 4: Gap Detection

Check for any gaps between spec and implementation:

```yaml
gaps:
  - gap_id: GAP-001
    description: "No gaps detected"
    severity: none
    
unimplemented_requirements: []

partial_implementations: []
```

### Step 5: Scope Creep Check (BR-008)

Verify no unauthorized features were added:

```yaml
scope_creep_check:
  additions_beyond_spec: []
  
  analysis:
    - item: "Validation layer in each skill"
      judgment: "Implementation detail, not scope creep"
      rationale: "Spec requires 'complete content', validation ensures quality"
      
    - item: "Upstream/Downstream artifact references"
      judgment: "Implementation detail, not scope creep"
      rationale: "Supports BR-001 evidence-based review"
```

## Output: Spec-Implementation Diff Report

```yaml
spec_implementation_diff:
  dispatch_id: "dispatch-005-review"
  task_id: "review-task-001"
  
  summary:
    overall_status: aligned
    alignment_percentage: 100
    governance_status: aligned
    
  spec_reference:
    spec_version: "1.0.0"
    spec_path: "specs/005-tester-core/spec.md"
    
  comparison:
    - category: "Requirements Coverage"
      items:
        - spec_item: "SKILL-001: unit-test-design"
          spec_description: "Implement unit-test-design skill"
          implementation_status: implemented
          implementation_location: ".opencode/skills/tester/unit-test-design/"
          alignment: aligned
          verification:
            method: "File existence check + content review"
            result: pass
            
        - spec_item: "SKILL-002: regression-analysis"
          spec_description: "Implement regression-analysis skill"
          implementation_status: implemented
          implementation_location: ".opencode/skills/tester/regression-analysis/"
          alignment: aligned
          verification:
            method: "File existence check + BR-006 compliance check"
            result: pass
            
        - spec_item: "SKILL-003: edge-case-matrix"
          spec_description: "Implement edge-case-matrix skill"
          implementation_status: implemented
          implementation_location: ".opencode/skills/tester/edge-case-matrix/"
          alignment: aligned
          verification:
            method: "File existence check + category review"
            result: pass
            
  gaps: []
  deviations: []
  additions: []
  
  scope_creep_analysis:
    unauthorized_features: []
    scope_creep_detected: false
    
  verification_coverage:
    test_coverage: 100
    untested_items: []
    
  governance_alignment:
    canonical_documents_checked:
      - role-definition.md
      - package-spec.md
      - io-contract.md
      - quality-gate.md
      - README.md
    conflicts: []
    cross_document_consistency:
      flow_order_aligned: true
      role_boundaries_aligned: true
      stage_status_aligned: true
      terminology_consistent: true
      issues: []
    path_resolution:
      paths_checked: 8
      paths_resolved: 8
      failures: []
    status_truthfulness:
      completion_report_status: "COMPLETE"
      readme_status: "✅ Complete"
      aligned: true
      gaps_disclosed: true
      issues: []
      
  recommendation:
    action: approve
    must_fix: []
    should_fix: []
    acceptable_deviations: []
    governance_actions: []
```

## Key Takeaways

1. **Requirement Traceability**: Every spec requirement maps to a specific implementation artifact
2. **Acceptance Criteria Verification**: Each AC is individually verified with evidence
3. **Scope Boundary Respect**: No unauthorized features detected (BR-008 compliance)
4. **Governance Alignment**: Feature aligns with canonical documents (AH-006 compliance)
5. **Status Truthfulness**: Completion-report and README status are consistent (BR-009 compliance)

## BR Compliance Summary

| Rule | Status | Evidence |
|------|--------|----------|
| BR-001 | ✅ PASS | Consumed design-note, implementation-summary, verification-report |
| BR-006 | ✅ PASS | Governance alignment checked, no conflicts |
| BR-008 | ✅ PASS | No scope creep detected |
| BR-009 | ✅ PASS | Status alignment verified |