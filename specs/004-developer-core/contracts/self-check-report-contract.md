# Self-Check Report Contract

## Contract Metadata

| Field | Value |
|-------|-------|
| **Contract ID** | AC-002-dev |
| **Contract Name** | Self-Check Report Contract |
| **Version** | 1.0.0 |
| **Owner** | developer |
| **Consumers** | reviewer (primary), tester (secondary) |

---

## Purpose

Define the complete schema and validation rules for the `self-check-report` artifact, which documents systematic pre-delivery validation results.

---

## Schema

```yaml
self_check_report:
  # Metadata
  dispatch_id: string              # 关联的 dispatch ID
  task_id: string                  # Task ID
  timestamp: timestamp             # 检查时间
  created_by: string               # 创建者
  
  # Summary (Required)
  summary:
    total_checks: integer          # 总检查项数
    passed: integer                # 通过数
    failed: integer                # 失败数
    blockers: integer              # blocker 数
    warnings: integer              # warning 数
    skipped: integer               # 跳过数 (N/A)
  
  # Check Results (Required)
  check_results:                   # 按类别组织
    - category: string             # 检查类别
      checks:
        - item: string             # 检查项名称
          status: enum             # pass | fail | na
          severity: enum           # blocker | warning | info
          description: string      # 检查结果描述
          evidence: string | null  # 证据 (如适用)
          fix_required: boolean    # 是否需要修复
  
  # Blockers (Required if any)
  blockers:                        # 必须修复的问题
    - blocker_id: string
      category: string
      description: string
      location: string | null      # 代码位置
      fix_suggestion: string       # 修复建议
      fixed: boolean               # 是否已修复
      fix_description: string | null # 修复说明
  
  # Warnings (Required if any)
  warnings:                        # 建议修复的问题
    - warning_id: string
      category: string
      description: string
      recommendation: string       # 改进建议
  
  # Overall Status (Required)
  overall_status: enum             # PASS | FAIL_WITH_BLOCKERS | PASS_WITH_WARNINGS
  
  # Recommendation (Required)
  recommendation: enum             # PROCEED | FIX_BLOCKERS | ESCALATE
  
  # Notes (Optional)
  notes: string | null
  
  # Metrics (Optional)
  time_spent_minutes: integer
  automated_checks_count: integer
  manual_checks_count: integer
```

---

## Check Categories

### Category 1: Goal Alignment (Required)

| Check Item | Severity | Description |
|------------|----------|-------------|
| Implementation matches task goal | Blocker | 实现是否符合 task goal |
| Acceptance criteria met | Blocker | 是否满足验收标准 |
| No omitted key features | Blocker | 是否遗漏关键功能 |
| No out-of-scope changes | Blocker | 是否有超出 scope 的改动 |

### Category 2: Design Consistency (Required if design exists)

| Check Item | Severity | Description |
|------------|----------|-------------|
| Matches design note | Blocker | 是否符合 design note |
| Respects module boundaries | Blocker | 是否尊重模块边界 |
| Honors interface contracts | Blocker | 是否遵守接口契约 |
| Deviations documented | Warning | 如有偏离，是否记录原因 |

### Category 3: Scope Control (Required)

| Check Item | Severity | Description |
|------------|----------|-------------|
| Minimal change scope | Warning | 改动范围是否最小 |
| No unrelated file changes | Blocker | 是否有无关文件改动 |
| Necessary deletions only | Warning | 删除的代码是否必要 |

### Category 4: Constraint Compliance (Required)

| Check Item | Severity | Description |
|------------|----------|-------------|
| Technical constraints met | Blocker | 是否遵守技术约束 |
| Performance constraints met | Warning | 是否遵守性能约束 |
| Security constraints met | Blocker | 是否遵守安全约束 |
| Dependency constraints met | Warning | 是否遵守依赖约束 |

### Category 5: Code Quality (Required)

| Check Item | Severity | Description |
|------------|----------|-------------|
| Code is understandable | Warning | 代码是否可理解 |
| Naming is clear | Warning | 命名是否清晰 |
| No obvious logic errors | Blocker | 是否有明显逻辑错误 |
| Exceptions handled | Blocker | 是否有未处理的异常 |
| No dead code | Warning | 是否有死代码 |

### Category 6: Test Coverage (Required)

| Check Item | Severity | Description |
|------------|----------|-------------|
| New code has tests | Blocker | 新增代码是否有测试 |
| Modified tests updated | Blocker | 修改代码是否更新测试 |
| Tests pass | Blocker | 测试是否通过 |
| Coverage acceptable | Warning | 覆盖率是否达标 |

### Category 7: Dependency Management (Required if changed)

| Check Item | Severity | Description |
|------------|----------|-------------|
| New dependencies approved | Blocker | 新依赖是否已批准 |
| Versions reasonable | Warning | 依赖版本是否合理 |
| No circular dependencies | Blocker | 是否有循环依赖 |

### Category 8: Documentation (Required)

| Check Item | Severity | Description |
|------------|----------|-------------|
| Code comments updated | Warning | 代码注释是否更新 |
| API docs updated | Warning | API 文档是否更新 |
| Complex logic documented | Warning | 复杂逻辑是否有注释 |

### Category 9: Security (Required)

| Check Item | Severity | Description |
|------------|----------|-------------|
| Input validation present | Blocker | 是否有输入验证 |
| No sensitive data leak | Blocker | 是否有敏感数据泄露 |
| No injection risks | Blocker | 是否有注入风险 |

### Category 10: Performance (Optional)

| Check Item | Severity | Description |
|------------|----------|-------------|
| No obvious performance issues | Warning | 是否有明显性能问题 |
| No N+1 queries | Warning | 是否有 N+1 查询 |
| Large data considered | Info | 大数据量场景是否考虑 |

---

## Validation Rules

### R-001: Required Fields

以下字段必须存在且非空：
- `dispatch_id`
- `task_id`
- `summary.total_checks`
- `check_results` (至少一个类别)
- `overall_status`
- `recommendation`

### R-002: Blocker Consistency

- 如果 `overall_status` 是 `PASS`，则 `blockers` 必须为空或所有 blocker 标记为 `fixed: true`
- 如果 `blockers` 中有未修复项，则 `overall_status` 不能是 `PASS`
- `recommendation` 为 `PROCEED` 时，不能有未修复的 blocker

### R-003: Count Consistency

```
summary.passed + summary.failed + summary.skipped = summary.total_checks
summary.blockers = count of blockers with status = fail and fixed = false
summary.warnings = count of warnings
```

### R-004: Honest Assessment

- 不能标记 `overall_status: PASS` 当存在未修复 blocker
- 不能将 blocker 降级为 warning
- `evidence` 必须真实存在

---

## Overall Status Semantics

| Status | Definition | Handoff Allowed |
|--------|------------|-----------------|
| `PASS` | 所有 blocker 已修复或无 blocker | Yes |
| `FAIL_WITH_BLOCKERS` | 存在未修复 blocker | No (must fix or escalate) |
| `PASS_WITH_WARNINGS` | 无 blocker，但有 warning | Yes (with documented warnings) |

---

## Consumer Responsibilities

### Reviewer

- 验证 `overall_status` 与 `blockers` 的一致性
- 抽查 `check_results` 的准确性
- 评估 `warnings` 的严重性
- 验证 `evidence` 是否真实

### Tester

- 参考 `check_results` 中的 test coverage 项
- 注意 `blockers` 中的测试相关问题
- 验证 `warnings` 是否影响测试策略

---

## Example: Perfect Pass

```yaml
self_check_report:
  dispatch_id: "dispatch_004_001"
  task_id: "T-004-001"
  timestamp: "2026-03-24T15:00:00Z"
  created_by: "developer"
  
  summary:
    total_checks: 28
    passed: 28
    failed: 0
    blockers: 0
    warnings: 0
    skipped: 2
  
  check_results:
    - category: "Goal Alignment"
      checks:
        - item: "Implementation matches task goal"
          status: pass
          severity: blocker
          description: "All acceptance criteria met"
          evidence: "See implementation-summary"
          fix_required: false
    - category: "Code Quality"
      checks:
        - item: "No obvious logic errors"
          status: pass
          severity: blocker
          description: "Code reviewed, no logic issues found"
          fix_required: false
  
  blockers: []
  warnings: []
  
  overall_status: PASS
  recommendation: PROCEED
  
  time_spent_minutes: 15
  automated_checks_count: 20
  manual_checks_count: 8
```

---

## Example: With Blockers

```yaml
self_check_report:
  summary:
    total_checks: 28
    passed: 25
    failed: 3
    blockers: 2
    warnings: 1
    skipped: 0
  
  check_results:
    - category: "Security"
      checks:
        - item: "Input validation present"
          status: fail
          severity: blocker
          description: "Missing validation for user input"
          evidence: "src/controllers/UserController.ts:45"
          fix_required: true
  
  blockers:
    - blocker_id: "BLOCKER-001"
      category: "Security"
      description: "Input validation missing for email field"
      location: "src/controllers/UserController.ts:45"
      fix_suggestion: "Add email format validation"
      fixed: false
      fix_description: null
  
  warnings:
    - warning_id: "WARN-001"
      category: "Code Quality"
      description: "Function exceeds 50 lines"
      recommendation: "Consider refactoring into smaller functions"
  
  overall_status: FAIL_WITH_BLOCKERS
  recommendation: FIX_BLOCKERS
  notes: "Need to add input validation before proceeding"
```

---

## Example: Fixed Blockers

```yaml
self_check_report:
  summary:
    total_checks: 28
    passed: 28
    failed: 0
    blockers: 0
    warnings: 1
    skipped: 0
  
  blockers:
    - blocker_id: "BLOCKER-001"
      category: "Security"
      description: "Input validation missing for email field"
      location: "src/controllers/UserController.ts:45"
      fix_suggestion: "Add email format validation"
      fixed: true
      fix_description: "Added Joi validation schema for email field"
  
  overall_status: PASS
  recommendation: PROCEED
  notes: "Fixed BLOCKER-001, WARN-001 is acceptable for this iteration"
```

---

## References

- `specs/004-developer-core/spec.md` - Feature specification
- `specs/004-developer-core/role-scope.md` - Developer role scope
- `.opencode/skills/developer/code-change-selfcheck/SKILL.md` - Self-check skill
