# Example 002: Bug Fix Release

## Scenario

**Feature ID:** BUGFIX-001
**Feature Name:** Login Bug Fix
**Change Type:** repair

## Context

A critical bug was fixed in the login system. The fix has been verified and needs a changelog entry.

## Input Artifacts

### bugfix-report.md
```yaml
bug_id: BUGFIX-001
bug_summary: "用户登录时空指针异常"
fix_summary: "添加空值检查，返回 400 错误而非抛出异常"
related_changes:
  - src/auth/login.js
severity: medium
verification_status: verified
```

### completion-report.md
```yaml
feature_id: BUGFIX-001
completion_status: complete
known_gaps:
  - id: KG-001
    description: "修复仅在简单场景验证，复杂认证流程未覆盖"
    impact: "复杂场景可能仍有问题"
    priority: medium
```

## Skill Execution

### Step 1: Consume Upstream Artifacts (BR-001)

```yaml
consumed_artifacts:
  - artifact: bugfix-report
    path: specs/bugfix-001/bugfix-report.md
    fields_used: [bug_id, fix_summary, severity]
  - artifact: completion-report
    path: specs/bugfix-001/completion-report.md
    fields_used: [known_gaps]
```

### Step 2: Classify Changes (BR-006)

| Change | Type | Rationale |
|--------|------|-----------|
| Login null pointer fix | repair | Bug fix, not new feature |

**Primary change_type:** repair

### Step 3: Write Entries

- Specific bug description: "修复用户登录时的空指针异常"
- Impact: "当用户名为空时返回 400 错误而非抛出异常"
- Reference: BUGFIX-001

### Step 4: Determine Version

- Previous version: 1.2.0
- Only repair type changes: PATCH bump
- New version: 1.2.1

### Step 5: Truthful Limitations (BR-008)

- known_gaps present in completion-report
- Must include in known_limitations:
  - "修复仅在简单场景验证"
  - "复杂认证流程未覆盖"

## Output Artifact

```yaml
changelog_entry:
  feature_id: "BUGFIX-001"
  feature_name: "Login Bug Fix"
  
  version:
    new_version: "1.2.1"
    previous_version: "1.2.0"
    bump_type: patch
    bump_reason: "Bug 修复"
    
  release_date: "2026-03-26"
  
  change_type: repair
  
  consumed_artifacts:
    - artifact: bugfix-report
      path: specs/bugfix-001/bugfix-report.md
      fields_used: [bug_id, fix_summary, severity]
    - artifact: completion-report
      path: specs/bugfix-001/completion-report.md
      fields_used: [known_gaps]
      
  summary: "修复用户登录时的空指针异常，返回明确的 400 错误"
  
  capability_changes: []
  
  docs_changes: []
  
  validation_changes: []
  
  breaking_changes: []
  
  known_limitations:
    - limitation: "修复仅在简单场景验证"
      impact: "复杂认证流程可能仍有问题"
      workaround: "建议使用标准认证路径，避免复杂嵌套场景"
      source: "specs/bugfix-001/completion-report.md#known_gaps"
      
  related_features: []
  
  full_changelog: |
    ## [1.2.1] - 2026-03-26
    
    ### repair
    - 修复用户登录时的空指针异常 (#110)
      - 当用户名为空时返回 400 错误而非抛出异常
      - 修复范围：src/auth/login.js
    
    ### Known Limitations
    - 修复仅在简单场景验证，复杂认证流程可能仍有问题
      - 建议使用标准认证路径
```

## BR Compliance Verification

- [x] **BR-001**: Changes reference bugfix-report and completion-report
- [x] **BR-006**: Correct "repair" type used
- [x] **BR-008**: Known limitation disclosed (complex scenarios not verified)
- [x] Format follows Keep a Changelog

## Key Decision Notes

1. **BR-006 Compliance:** Used "repair" type for bug fix
2. **BR-008 Truthfulness:** Disclosed limitation that fix wasn't verified in complex scenarios
3. **Specific Description:** Exact fix and impact documented
4. **Patch Version:** Correct for repair-only changes