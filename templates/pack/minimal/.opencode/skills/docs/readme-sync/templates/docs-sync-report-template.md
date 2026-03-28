# Template: docs-sync-report

> This template provides a ready-to-use structure for generating docs-sync-report artifacts.
> Copy this template and fill in the fields based on your actual synchronization work.

---

```yaml
docs_sync_report:
  # ========================================
  # SYNC TARGET
  # ========================================
  sync_target:
    feature_id: "<FEATURE_ID>"  # e.g., "007-docs-core"
    feature_name: "<FEATURE_NAME>"  # e.g., "Docs 角色核心技能"
    
  # ========================================
  # CONSUMED ARTIFACTS (BR-001)
  # Document all upstream artifacts consumed for evidence-based documentation
  # ========================================
  consumed_artifacts:
    - artifact: "completion-report"
      path: "specs/<FEATURE_ID>/completion-report.md"
      fields_used: 
        - "completion_status"
        - "deliverables"
        - "known_gaps"
      
    - artifact: "implementation-summary"
      path: "specs/<FEATURE_ID>/implementation-summary.md"
      fields_used:
        - "changed_files"
        - "known_issues"
      
    - artifact: "acceptance-decision-record"
      path: "specs/<FEATURE_ID>/acceptance-decision-record.md"
      fields_used:
        - "decision_state"
        - "acceptance_conditions"
        
    # Add more artifacts as needed:
    # - artifact: "verification-report"
    # - artifact: "review-findings-report"
    # - artifact: "design-note"
  
  # ========================================
  # TOUCHED SECTIONS (BR-002)
  # Document ONLY sections that were actually changed
  # Each section MUST have a clear change_reason
  # ========================================
  touched_sections:
    - section: "<SECTION_NAME>"  # e.g., "Skills 清单 > Docs Skills"
      status: "updated"  # updated | added | removed | unchanged
      change_reason: "<REASON>"  # REQUIRED: Why was this section touched?
      changes:
        - type: "modified"  # added | modified | deleted
          content: |
            <CONTENT_CHANGE>
            # Show the actual content that was added/modified
            
    # Example:
    # - section: "Project Status"
    #   status: "updated"
    #   change_reason: "Feature completed, update status table"
    #   changes:
    #     - type: "modified"
    #       content: "| M3 - Peripheral | 4/4 | ✅ 100% |"
            
  # ========================================
  # CONSISTENCY CHECKS (BR-005)
  # Verify README status matches other documents
  # ========================================
  consistency_checks:
    readme_vs_completion_report:
      status: "consistent"  # consistent | inconsistent
      details: "<DETAILS>"
      
    readme_vs_spec:
      status: "consistent"
      details: "<DETAILS>"
      
    known_gaps_reflected:
      status: "reflected"  # reflected | not_reflected
      details: "<DETAILS>"
      
  # ========================================
  # STATUS UPDATES (BR-003, BR-008)
  # Document all status changes with evidence
  # ========================================
  status_updates:
    - item: "<ITEM_NAME>"  # e.g., "docs skills"
      previous_status: "<PREVIOUS>"  # e.g., "待实现"
      new_status: "<NEW>"  # e.g., "✅ 正式实现"
      evidence: "<PATH>#<FIELD>=<VALUE>"  # Link to evidence
      truthful: true  # BR-008: Is this status truthful?
      
  # ========================================
  # UNRESOLVED AMBIGUITIES
  # Document any ambiguities that couldn't be resolved
  # ========================================
  unresolved_ambiguities:
    - item: "<ITEM>"
      description: "<DESCRIPTION>"
      impact: "<IMPACT>"
      recommended_action: "<ACTION>"
      
  # Leave empty if no ambiguities:
  # unresolved_ambiguities: []
  
  # ========================================
  # RECOMMENDATION
  # ========================================
  recommendation: "sync-complete"  # sync-complete | needs-follow-up | blocked
  
  # If blocked, provide reason:
  # blocking_reason: "<REASON>"
  
  # ========================================
  # TERMINOLOGY CHECK (BR-004)
  # Verify 6-role terminology used, no legacy terms
  # ========================================
  terminology_check:
    uses_6_role_terminology: true
    legacy_terms_found: []  # List any legacy terms found, or []
```

---

## Usage Instructions

1. **Copy** this template to your working directory
2. **Replace** all `<PLACEHOLDER>` values with actual content
3. **Fill** all sections based on your synchronization work
4. **Verify** all BR compliance checks pass
5. **Submit** as your docs-sync-report artifact

## BR Compliance Checklist

Before submitting, verify:

- [ ] **BR-001**: All consumed_artifacts documented with paths and fields
- [ ] **BR-002**: All touched_sections have change_reason
- [ ] **BR-003**: All status_updates reference evidence
- [ ] **BR-004**: terminology_check shows uses_6_role_terminology = true
- [ ] **BR-005**: All consistency_checks completed
- [ ] **BR-008**: All status_updates have truthful = true (or explain why not)

## Example Filled Template

See `examples/example-001-feature-completion-sync.md` for a complete filled example.