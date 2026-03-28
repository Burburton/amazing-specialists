# Anti-Example 002: Missing Breaking Change

## What Went Wrong

**Anti-Pattern:** Undisclosed Breaking Change
**BR Violated:** BR-008 (Status Truthfulness)

## Scenario

The docs role generated a changelog entry that failed to disclose a breaking API change.

## Incorrect Behavior

### Implementation Change
```yaml
# src/api/auth.js - Changed authentication method
# OLD: Query parameter ?token=xxx
# NEW: Header Authorization: Bearer xxx
```

### Changelog Entry (WRONG)
```yaml
changelog_entry:
  summary: "优化 API 认证流程"
  
  full_changelog: |
    ## [2.0.0] - 2026-03-26
    
    ### feature
    - 优化 API 认证流程
```

**Problems:**
1. **Breaking change hidden** - API contract changed without disclosure
2. **No migration guide** - Users can't migrate their code
3. **Downplays impact** - "优化" sounds minor but it's breaking
4. **Violates BR-008** - Not truthful about impact

## Why This Is a Problem

1. **Production Breakage:** Users' existing code stops working
2. **No Migration Path:** Users don't know how to fix
3. **Trust Erosion:** Hidden breaking changes damage trust
4. **Major Version Wasted:** 2.0.0 but no migration info

## Detection Method

Check implementation for breaking changes:
- [ ] API signature changed?
- [ ] Parameter format changed?
- [ ] Response format changed?
- [ ] Configuration format changed?
- [ ] Default behavior changed?

If ANY is "yes" → Must add breaking_changes section

## Correct Behavior

### Changelog Entry (CORRECT)
```yaml
changelog_entry:
  version:
    bump_type: major  # Correct for breaking changes
    bump_reason: "破坏性 API 变更"
    
  summary: "API 认证方式变更：从 Query 参数改为 Header 认证"
  
  change_type: feature  # Has new capabilities too
  
  breaking_changes:  # BR-008: MUST disclose
    - change: "API 认证方式变更"
      impact: "所有 API 调用需要更新认证方式"
      migration_guide: |
        **旧代码：**
        ```javascript
        fetch('/api?token=xxx')
        ```
        
        **新代码：**
        ```javascript
        fetch('/api', {
          headers: { 'Authorization': 'Bearer xxx' }
        })
        ```
      references: ["docs/migration-v1-v2.md"]
      
  known_limitations: []
  
  full_changelog: |
    ## [2.0.0] - 2026-03-26
    
    ### feature
    - API 认证方式优化
    
    ### Breaking Changes ⚠️
    - **API 认证方式变更**
      - 从 Query Parameter (`?token=xxx`) 改为 Header (`Authorization: Bearer xxx`)
      - **Migration Guide:** docs/migration-v1-v2.md
      
      **Before:**
      ```javascript
      fetch('/api?token=xxx')
      ```
      
      **After:**
      ```javascript
      fetch('/api', {
        headers: { 'Authorization': 'Bearer xxx' }
      })
      ```
```

## How to Fix

1. **Identify breaking changes** from implementation-summary
2. **Add breaking_changes section** with:
   - Exact change description
   - Impact scope
   - Migration guide with code examples
   - Reference to detailed docs
3. **Use MAJOR version** for breaking changes
4. **Be prominent** - use ⚠️ markers

## Prevention Strategy

- **Always** check for API/contract changes
- **Always** add breaking_changes section if ANY contract changed
- **Always** provide migration code examples
- **Enforce** BR-008 check for breaking changes

## BR Violation Mapping

| BR | How Violated | How to Comply |
|----|--------------|---------------|
| BR-008 | Breaking change hidden | Disclose in breaking_changes section |

## Impact Comparison

| Aspect | Wrong | Correct |
|--------|-------|---------|
| Breaking Section | Missing | Present with full details |
| Migration Guide | Missing | Code examples provided |
| User Impact | Unknown | Clearly stated |
| Version Bump | major (correct) | major with justification |
| Trust | Damaged | Maintained through transparency |