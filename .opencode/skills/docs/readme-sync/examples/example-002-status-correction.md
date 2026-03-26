# Example 002: Status Correction (Drift Detection)

## Scenario

During routine documentation sync, a discrepancy is detected: README shows a feature as "✅ Complete" but the completion-report indicates known gaps exist. This example demonstrates BR-008 status truthfulness correction.

## Input Context

### Current README State

```markdown
| `006-reviewer-core` | reviewer 角色核心技能 | ✅ Complete | 独立审查核心能力 |
```

### Upstream Artifacts

**completion-report.md** (specs/006-reviewer-core/completion-report.md):
```yaml
feature_id: 006-reviewer-core
completion_status: substantially_complete_with_known_gaps
deliverables:
  - role-scope.md
  - SKILL.md files (3 skills)
  - contracts
known_gaps:
  - area: "Complex scenario review"
    description: "Complex multi-file cross-reference scenarios not fully covered"
    impact: "May miss issues in complex refactoring"
    priority: medium
  - area: "Performance review"
    description: "Performance impact review skill deferred to M4"
    impact: "Performance issues may not be caught"
    priority: low
```

## Problem Detection

### BR-005 Cross-Document Consistency Check

```yaml
consistency_check:
  readme_status: "✅ Complete"
  completion_report_status: "substantially_complete_with_known_gaps"
  result: INCONSISTENT
  issue: "README shows Complete but completion-report shows known gaps"
```

### BR-008 Status Truthfulness Violation

```yaml
truthfulness_check:
  current_status: "✅ Complete"
  actual_status: "⚠️ Substantially Complete with Known Gaps"
  hidden_gaps:
    - "Complex scenario review coverage incomplete"
    - "Performance review skill deferred"
  violation: "Status inflation detected"
```

## Execution Steps

### Step 1: Document the Drift

```yaml
detected_drift:
  location: "README.md > 阶段 6 table"
  current_readme_status: "✅ Complete"
  actual_status: "substantially_complete_with_known_gaps"
  source: completion-report.md
  gaps_hidden:
    - "Complex multi-file cross-reference scenarios not fully covered"
    - "Performance review skill deferred to M4"
```

### Step 2: Correct the Status

**Before:**
```markdown
| `006-reviewer-core` | reviewer 角色核心技能 | ✅ Complete | 独立审查核心能力 |
```

**After:**
```markdown
| `006-reviewer-core` | reviewer 角色核心技能 | ⚠️ 基本完成 | 独立审查核心能力（已知缺口：复杂场景审查） |
```

### Step 3: Update Known Gaps Section

Add or update a "Known Gaps" note in README:

```markdown
### Known Gaps (Current)

| Feature | Gap | Impact | Priority |
|---------|-----|--------|----------|
| 006-reviewer-core | Complex scenario review | May miss issues in complex refactoring | Medium |
| 006-reviewer-core | Performance review skill | Performance issues may not be caught | Low |
```

### Step 4: Verify Correction

```yaml
verification:
  readme_status_after: "⚠️ 基本完成"
  matches_completion_report: true
  gaps_now_visible: true
  truthful: true
```

## Output Artifact

```yaml
docs_sync_report:
  sync_target:
    feature_id: "006-reviewer-core"
    feature_name: "Reviewer 角色核心技能"
    
  consumed_artifacts:
    - artifact: completion-report
      path: specs/006-reviewer-core/completion-report.md
      fields_used: [completion_status, known_gaps]
      
  touched_sections:
    - section: "阶段 6：正式核心角色 Feature"
      status: updated
      change_reason: "BR-008 状态真实性修正：反映已知缺口"
      changes:
        - type: modified
          content: "| `006-reviewer-core` | reviewer 角色核心技能 | ⚠️ 基本完成 | 独立审查核心能力（已知缺口：复杂场景审查） |"
    - section: "Known Gaps"
      status: added
      change_reason: "BR-008 已知缺口必须在 README 中可见"
      changes:
        - type: added
          content: "New section documenting current known gaps"
          
  consistency_checks:
    readme_vs_completion_report:
      status: consistent
      details: "Status corrected to match completion-report"
    readme_vs_spec:
      status: consistent
      details: "Feature description accurate"
    known_gaps_reflected:
      status: reflected
      details: "Known gaps now visible in README table"
      
  status_updates:
    - item: "006-reviewer-core"
      previous_status: "✅ Complete"
      new_status: "⚠️ 基本完成"
      evidence: "completion-report.md#completion_status=substantially_complete_with_known_gaps"
      truthful: true
      correction_reason: "Previously hidden gaps now visible"
      
  unresolved_ambiguities: []
  
  recommendation: sync-complete
  
  terminology_check:
    uses_6_role_terminology: true
    legacy_terms_found: []
```

## Key Decisions

1. **BR-008 Enforcement**: Status corrected from inflated "Complete" to truthful "基本完成"
2. **Gap Visibility**: Known gaps added to README for transparency
3. **Minimal Change**: Only updated status-related sections, no unnecessary rewrites
4. **Audit Trail**: Documented the correction in status_updates with reason

## Anti-Pattern Avoided

This example avoids AP-001 (Status Inflation) by:
- Checking completion-report before accepting "Complete" status
- Making known gaps visible in README
- Documenting the correction in the sync report

## BR Compliance Verification

- [x] **BR-001**: Update references completion-report
- [x] **BR-002**: Only touched status-related sections
- [x] **BR-003**: Status from completion-report
- [x] **BR-004**: 6-role terminology used
- [x] **BR-005**: Cross-document consistency restored
- [x] **BR-008**: Status truthfulness restored (gaps visible)