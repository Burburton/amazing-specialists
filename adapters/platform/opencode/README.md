# OpenCode Platform Adapter

## Platform Information

| 属性 | 值 |
|------|-----|
| Platform ID | `opencode` |
| Version | 1.0.0 |
| Supports Background Task | ✅ Yes |
| Supports Parallel Agents | ✅ Yes |
| Max Context Length | 200,000 tokens |

## Role-to-Category Mapping

| Role | Category | Reason |
|------|----------|--------|
| architect | `deep` | Architecture decisions require thorough research |
| developer | `unspecified-high` | General high-priority implementation |
| tester | `unspecified-high` | General high-priority verification |
| reviewer | `unspecified-high` | General high-priority review |
| docs | `writing` | Documentation is a writing task |
| security | `unspecified-high` | Security review is high priority |

## Default Skills

### architect
- `architect/requirement-to-design`
- `architect/module-boundary-design`
- `architect/tradeoff-analysis`

### developer
- `developer/feature-implementation`
- `developer/bugfix-workflow`
- `developer/code-change-selfcheck`

### tester
- `tester/unit-test-design`
- `tester/regression-analysis`
- `tester/edge-case-matrix`

### reviewer
- `reviewer/code-review-checklist`
- `reviewer/spec-implementation-diff`
- `reviewer/reject-with-actionable-feedback`

### docs
- `docs/readme-sync`
- `docs/changelog-writing`
- `docs/issue-status-sync`

### security
- `security/auth-and-permission-review`
- `security/input-validation-review`

## Known Issues

### Issue 1: subagent_type parameter not supported

**Problem**: Using `task(subagent_type="tester")` returns "Unknown agent: tester"

**Workaround**: Use `category` + `load_skills` instead:

```typescript
// ❌ Wrong
task(subagent_type="tester", prompt="...")

// ✅ Correct
task(
  category="unspecified-high",
  load_skills=["tester/unit-test-design"],
  prompt="..."
)
```

### Issue 2: Background task may fail on first attempt

**Problem**: Background tasks sometimes fail immediately without clear error

**Workaround**: 
1. Check task status with `background_output(task_id)`
2. Retry if needed, or use synchronous execution (`run_in_background=false`)

## Usage Examples

### Example 1: Dispatch Tester Task

```typescript
const category = 'unspecified-high';  // adapter.mapRoleToCategory('tester')
const skills = ['tester/unit-test-design', 'tester/regression-analysis'];

const result = task(
  category=category,
  load_skills=skills,
  description="Verify T-006 implementation",
  prompt="Check all acceptance criteria...",
  run_in_background=true
);
```

### Example 2: Get Platform Capabilities

```typescript
const capabilities = adapter.getCapabilities();

if (capabilities.supports_background_task) {
  // Use background execution
} else {
  // Use synchronous execution
}
```

## Files

| File | Purpose |
|------|---------|
| `role-mapping.json` | 6-role → category 映射配置 |
| `capabilities.json` | 平台能力声明 |
| `README.md` | 本文档 |

## Related Documentation

- [Platform Adapter Guide](../../docs/platform-adapter-guide.md)
- [ADAPTERS.md](../../ADAPTERS.md)
- [AGENTS.md](../../AGENTS.md)