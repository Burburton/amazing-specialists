# Template: changelog-entry

> This template provides a ready-to-use structure for generating changelog-entry artifacts.
> Copy this template and fill in the fields based on your actual changes.

---

```yaml
changelog_entry:
  # ========================================
  # IDENTIFICATION
  # ========================================
  feature_id: "<FEATURE_ID>"  # e.g., "007-docs-core"
  feature_name: "<FEATURE_NAME>"  # e.g., "Docs 角色核心技能"
  
  # ========================================
  # VERSION INFORMATION
  # ========================================
  version:
    new_version: "<NEW_VERSION>"  # e.g., "1.3.0"
    previous_version: "<PREV_VERSION>"  # e.g., "1.2.0"
    bump_type: "<BUMP_TYPE>"  # major | minor | patch
    bump_reason: "<REASON>"  # Why this bump type?
    
  release_date: "<DATE>"  # YYYY-MM-DD or "Unreleased"
  
  # ========================================
  # CHANGE TYPE (BR-006)
  # REQUIRED: Must be one of the four types
  # ========================================
  change_type: "<TYPE>"  # feature | repair | docs-only | governance
  
  # ========================================
  # CONSUMED ARTIFACTS (BR-001)
  # Document all upstream artifacts consumed
  # ========================================
  consumed_artifacts:
    - artifact: "completion-report"
      path: "specs/<FEATURE_ID>/completion-report.md"
      fields_used:
        - "deliverables"
        - "known_gaps"
        
    - artifact: "implementation-summary"
      path: "specs/<FEATURE_ID>/implementation-summary.md"
      fields_used:
        - "changed_files"
        - "known_issues"
        
    # Add more as needed:
    # - artifact: "bugfix-report"
    # - artifact: "acceptance-decision-record"
  
  # ========================================
  # SUMMARY
  # REQUIRED: Must be specific, not vague
  # Bad: "Various improvements and bug fixes"
  # Good: "实现 docs 角色核心技能：readme-sync 和 changelog-writing"
  # ========================================
  summary: "<SPECIFIC_SUMMARY>"
  
  # ========================================
  # CAPABILITY CHANGES
  # New features or capabilities added
  # ========================================
  capability_changes:
    - description: "<DESCRIPTION>"
      detail: |
        <DETAILED_DESCRIPTION>
      breaking: false  # true if breaking change
      migration: |  # Required if breaking: true
        <MIGRATION_GUIDE>
      references:
        - "<REFERENCE>"
        
  # Leave empty if no capability changes:
  # capability_changes: []
  
  # ========================================
  # DOCUMENTATION CHANGES
  # ========================================
  docs_changes:
    - description: "<DESCRIPTION>"
      detail: "<DETAIL>"
      
  # ========================================
  # VALIDATION CHANGES
  # Testing/validation related changes
  # ========================================
  validation_changes:
    - description: "<DESCRIPTION>"
      detail: "<DETAIL>"
      
  # ========================================
  # BREAKING CHANGES (BR-008)
  # REQUIRED if any breaking changes exist
  # ========================================
  breaking_changes:
    - change: "<CHANGE_DESCRIPTION>"
      impact: "<WHO_IS_AFFECTED>"
      migration_guide: |
        <CODE_EXAMPLES_AND_INSTRUCTIONS>
      references:
        - "<DOC_REFERENCE>"
        
  # Leave empty if no breaking changes:
  # breaking_changes: []
  
  # ========================================
  # KNOWN LIMITATIONS (BR-008)
  # REQUIRED: Must reflect known_gaps from completion-report
  # ========================================
  known_limitations:
    - limitation: "<LIMITATION>"
      impact: "<IMPACT>"
      workaround: "<WORKAROUND>"
      source: "<COMPLETION_REPORT_REFERENCE>"
      
  # Leave empty if no known limitations:
  # known_limitations: []
  
  # ========================================
  # RELATED FEATURES
  # ========================================
  related_features:
    - "<FEATURE_ID>"
    
  # ========================================
  # FULL CHANGELOG (Markdown)
  # ========================================
  full_changelog: |
    ## [<VERSION>] - <DATE>
    
    ### <CHANGE_TYPE>
    - <CHANGE_DESCRIPTION>
      - <DETAIL>
    
    ### Breaking Changes (if any)
    - <BREAKING_CHANGE>
      <MIGRATION_GUIDE>
    
    ### Known Limitations (if any)
    - <LIMITATION>
```

---

## Usage Instructions

1. **Copy** this template to your working directory
2. **Replace** all `<PLACEHOLDER>` values with actual content
3. **Choose** correct change_type (BR-006)
4. **Fill** breaking_changes if ANY breaking changes exist (BR-008)
5. **Fill** known_limitations from completion-report known_gaps (BR-008)
6. **Submit** as your changelog-entry artifact

## BR Compliance Checklist

Before submitting, verify:

- [ ] **BR-001**: All consumed_artifacts documented
- [ ] **BR-006**: change_type is explicit (feature/repair/docs-only/governance)
- [ ] **BR-008**: breaking_changes filled if breaking changes exist
- [ ] **BR-008**: known_limitations reflects completion-report known_gaps
- [ ] Summary is specific, not vague

## Change Type Decision Guide

| Change | Type |
|--------|------|
| New feature/capability | feature |
| Bug fix | repair |
| Documentation only | docs-only |
| Governance/process change | governance |

## Version Bump Guide

| Bump Type | When to Use |
|-----------|-------------|
| major | Breaking changes exist |
| minor | New features (feature type) |
| patch | Only repairs (repair type) |

## Example Filled Template

See `examples/example-001-feature-release.md` for a complete filled example.