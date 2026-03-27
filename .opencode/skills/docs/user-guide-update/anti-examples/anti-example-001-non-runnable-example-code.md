# Anti-Example 001: Non-Runnable Example Code

## What Went Wrong

**Anti-Pattern:** AP-201 - Non-Runnable Example Code
**BR Violated:** BR-003 (Evidence-Based Statusing), BR-005 (Cross-Document Consistency)

## Scenario

The docs role added a new API example to the user guide, but the example code doesn't match the actual API parameters. Users trying to follow the example will fail.

## Incorrect Behavior

### implementation-summary.md
```yaml
api_changes:
  - endpoint: /dispatch
    change_type: modified
    old_params: [task_id, context]
    new_params: [task_id, skill, context]
```

### User Guide Example (WRONG - Not Verified)
```bash
# Using the dispatch API
curl -X POST /dispatch \
  -d "task_id=task-001" \
  -d "action=implement"  # WRONG: should be "skill" not "action"
```

**Problem:** The example uses "action" parameter but actual API uses "skill" parameter.

## Why This Is a Problem

1. **User Frustration:** Users copy example code and it fails
2. **Violates BR-003:** Example not based on actual API evidence
3. **Violates BR-005:** User guide API example inconsistent with actual API
4. **Wasted Time:** Users spend time debugging wrong examples
5. **Trust Erosion:** Users lose confidence in documentation

## Detection Method

1. Read implementation-summary to get api_changes
2. Extract new_params and old_params
3. Compare example code parameters with actual API
4. Run example code manually (if possible)

**Checklist:**
- [ ] api_changes read?
- [ ] Example parameters compared with actual?
- [ ] Example manually run?
- [ ] Output verified?

## Correct Behavior

### Example Code (CORRECT)
```bash
# Using the dispatch API
curl -X POST /dispatch \
  -d "task_id=task-001" \
  -d "skill=feature-implementation"  # CORRECT: matches actual "skill" param
```

### user-guide-sync-report (CORRECT)
```yaml
example_verification:
  - example_id: "curl-dispatch-example"
    verified: true
    verification_method: "手动运行 curl 命令"
    issues_found: []
    
consistency_checks:
  user_guide_api_vs_actual:
    status: consistent
    details: "示例参数 skill 与实际 API 一致"
```

## How to Fix

1. Read implementation-summary.md to find api_changes
2. Identify new_params for modified endpoints
3. Update example code to use correct parameters
4. Run example code manually to verify
5. Record verification in user-guide-sync-report

## Prevention Strategy

- **Always** read api_changes before adding examples
- **Always** compare example parameters with actual API
- **Always** run example code manually
- **Always** record verification result

## BR Violation Mapping

| BR | How Violated | How to Comply |
|----|--------------|---------------|
| BR-003 | Example not based on actual API | Read api_changes, match parameters |
| BR-005 | Example inconsistent with API | Verify example runs successfully |

## Related Anti-Patterns

- AP-202: API Documentation Outdated (文档显示旧参数名)
- AP-204: Documenting Unimplemented Feature (文档描述未实现功能)