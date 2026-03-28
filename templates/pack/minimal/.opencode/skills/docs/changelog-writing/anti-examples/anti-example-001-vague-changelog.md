# Anti-Example 001: Vague Changelog

## What Went Wrong

**Anti-Pattern:** AP-005 - Vague Changelog
**BR Violated:** BR-006 (Distinguish Change Types)

## Scenario

The docs role generated a changelog entry with generic, non-specific descriptions that provide no actionable information.

## Incorrect Behavior

### Input (Actual Implementation)
```yaml
changed_files:
  - src/auth/login.js  # Added null check
  - src/auth/middleware.js  # Optimized token validation
  - src/api/routes.js  # Fixed route handling
known_issues:
  - "Complex authentication flows not fully tested"
```

### Changelog Entry (WRONG)
```yaml
changelog_entry:
  summary: "Various improvements and bug fixes"
  
  full_changelog: |
    ## [1.2.1] - 2026-03-26
    
    ### Changes
    - Various improvements
    - Multiple bug fixes
    - General optimizations
```

**Problems:**
1. **No change_type** - Missing BR-006 classification
2. **Vague description** - "Various improvements" tells nothing
3. **No specifics** - User cannot understand what changed
4. **No known limitations** - Hidden issue about complex flows

## Why This Is a Problem

1. **User Confusion:** Users can't understand what changed
2. **No Decision Support:** Cannot decide whether to upgrade
3. **Violates BR-006:** No change type distinction
4. **Poor Communication:** Fails to inform about actual changes

## Detection Method

Check for vague patterns:
- [ ] "Various improvements"
- [ ] "Multiple updates"
- [ ] "Bug fixes and improvements"
- [ ] "General optimizations"
- [ ] No change_type field

**Rule:** If you can't tell exactly what changed from the changelog, it's vague.

## Correct Behavior

### Changelog Entry (CORRECT)
```yaml
changelog_entry:
  summary: "修复登录空指针异常，优化 Token 验证性能"
  
  change_type: repair  # BR-006
  
  consumed_artifacts:
    - artifact: bugfix-report
      path: specs/bugfix-001/bugfix-report.md
      fields_used: [bug_id, fix_summary]
      
  capability_changes: []
  
  known_limitations:
    - limitation: "复杂认证流程未完全测试"
      impact: "复杂场景可能仍有问题"
      workaround: "建议使用标准认证路径"
      source: "specs/bugfix-001/completion-report.md#known_gaps"
      
  full_changelog: |
    ## [1.2.1] - 2026-03-26
    
    ### repair
    - 修复登录时的空指针异常 (#110)
      - 添加空值检查，返回 400 错误
    - 优化 Token 验证性能 (#111)
      - 减少重复验证调用
    
    ### Known Limitations
    - 复杂认证流程未完全测试
```

## How to Fix

1. **Classify each change** with change_type (BR-006)
2. **Be specific** about what changed
3. **Include details** for important changes
4. **Disclose limitations** from known_gaps (BR-008)
5. **Reference sources** from implementation-summary

## Prevention Strategy

- **Always** use explicit change_type
- **Never** use "various", "multiple", "general"
- **Always** describe specific changes
- **Enforce** BR-006 check in changelog-entry

## BR Violation Mapping

| BR | How Violated | How to Comply |
|----|--------------|---------------|
| BR-006 | No change_type, vague descriptions | Use explicit types, specific descriptions |

## Comparison

| Aspect | Wrong | Correct |
|--------|-------|---------|
| Summary | "Various improvements" | "修复登录空指针异常，优化 Token 验证性能" |
| Change Type | Missing | repair |
| Specificity | None | Exact files and changes |
| Known Gaps | Hidden | Disclosed |