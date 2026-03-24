# Bugfix Report Contract

## Contract Metadata

| Field | Value |
|-------|-------|
| **Contract ID** | AC-003-dev |
| **Contract Name** | Bugfix Report Contract |
| **Version** | 1.0.0 |
| **Owner** | developer |
| **Consumers** | reviewer, docs, future developers |

---

## Purpose

Define the complete schema and validation rules for the `bugfix-report` artifact, which documents systematic bug fixing including root cause analysis and prevention strategies.

---

## Schema

```yaml
bugfix_report:
  # Metadata
  dispatch_id: string              # 关联的 dispatch ID
  task_id: string                  # Task ID
  bug_id: string                   # Bug ID (from issue tracker)
  created_at: timestamp            # 创建时间
  created_by: string               # 修复者
  
  # Problem Analysis (Required)
  problem_analysis:
    symptom: string                # 现象描述
    expected_behavior: string      # 期望行为
    actual_behavior: string        # 实际行为
    environment: string | null     # 环境信息
    frequency: enum | null         # always | often | sometimes | rarely
  
  # Root Cause (Required)
  root_cause:
    category: enum                 # 见下方分类
    description: string            # 详细根因分析
    analysis_method: string        # 5 Whys | Fishbone | Code Review | etc.
    contributing_factors:          # 促成因素
      - factor: string
        impact: string
  
  # Impact Assessment (Required)
  impact_assessment:
    severity: enum                 # critical | high | medium | low
    affected_components: string[]  # 受影响的组件
    affected_users: string | null  # 受影响用户范围
    data_corruption: boolean       # 是否涉及数据损坏
    security_implications: boolean # 是否有安全影响
  
  # Fix Details (Required)
  fix_details:
    approach: string               # 修复策略
    changed_files:                 # 修改的文件
      - path: string
        change_type: modified      # bugfix 通常为 modified
        description: string
        lines_changed:
          added: integer
          deleted: integer
    tests_added:                   # 新增的测试
      - path: string
        type: enum                 # regression | reproduction
        description: string
    is_minimal_fix: boolean        # 是否最小范围修复
  
  # Verification (Required)
  verification:
    reproduction_test_passed: boolean    # 复现测试是否通过
    regression_test_passed: boolean      # 回归测试是否通过
    manual_verification_passed: boolean  # 手动验证是否通过
    verification_notes: string | null
  
  # Deployment (Optional)
  deployment:
    deployed_to: string[]          # 部署环境
    deployment_time: timestamp | null
    monitoring_results: string | null
    post_deployment_issues: string[]
  
  # Lessons Learned (Required)
  lessons_learned:
    - lesson: string               # 学到的教训
      prevention: string           # 预防措施
      category: enum               # process | code | test | review
  
  # Follow-up (Optional)
  follow_up:
    - item: string                 # 跟进项
      owner: string                # 负责人
      due_date: string             # 截止日期
      status: enum                 # pending | in_progress | done
  
  # Recommendation (Required)
  recommendation: enum             # CLOSE | MONITOR | REOPEN | ESCALATE
  
  # Metrics (Optional)
  time_to_fix_minutes: integer
  time_to_identify_minutes: integer
```

---

## Root Cause Categories

| Category | Definition | Example |
|----------|------------|---------|
| `logic_error` | 代码逻辑错误 | 条件判断错误 |
| `boundary_condition` | 边界条件未处理 | 空值、越界 |
| `concurrency` | 并发问题 | 竞态条件、死锁 |
| `configuration` | 配置错误 | 错误的配置值 |
| `dependency` | 第三方依赖问题 | 库版本不兼容 |
| `environment` | 环境问题 | 运行时环境差异 |
| `data` | 数据问题 | 数据不一致 |
| `design` | 设计问题 | 架构设计缺陷 |

---

## Severity Levels

| Level | Definition | Response Time |
|-------|------------|---------------|
| `critical` | 系统不可用，数据丢失 | Immediate |
| `high` | 主要功能不可用 | Same day |
| `medium` | 次要功能问题 | Next sprint |
| `low` | 轻微问题 | Backlog |

---

## Validation Rules

### R-001: Required Fields

以下字段必须存在且非空：
- `dispatch_id`
- `task_id`
- `problem_analysis.symptom`
- `problem_analysis.expected_behavior`
- `problem_analysis.actual_behavior`
- `rootCause.category`
- `rootCause.description`
- `rootCause.analysis_method`
- `impact_assessment.severity`
- `impact_assessment.affected_components`
- `fix_details.approach`
- `fix_details.changed_files` (至少一个)
- `verification.reproduction_test_passed`
- `verification.regression_test_passed`
- `recommendation`

### R-002: Root Cause Depth

- `rootCause.description` 必须说明根因，不能仅描述症状
- 如果使用 5 Whys 方法，应包含完整的 Why 链
- `contributing_factors` 应包含促成因素

### R-003: Fix Minimality

- `fix_details.changed_files` 应仅包含修复 bug 所需的文件
- `is_minimal_fix` 应为 `true`，除非有明确理由
- 不应包含重构或优化

### R-004: Test Requirements

- 必须有 reproduction test 或 regression test
- `verification.reproduction_test_passed` 必须为 `true`
- `verification.regression_test_passed` 应为 `true`

### R-005: Lessons Learned

- 至少一条 `lessons_learned`
- `prevention` 必须具体可操作
- `category` 必须正确分类

---

## Recommendation Semantics

| Value | When to Use |
|-------|-------------|
| `CLOSE` | Bug 已完全修复，测试通过，无后续问题 |
| `MONITOR` | Bug 已修复，但需要观察（偶发问题、复杂修复） |
| `REOPEN` | 修复未成功，问题仍然存在 |
| `ESCALATE` | 发现更严重问题，需要升级处理 |

---

## Consumer Responsibilities

### Reviewer

- 验证 `rootCause` 是否深入（不只是症状）
- 确认 `fix_details` 是最小修复
- 检查 `verification` 测试是否充分
- 评估 `lessons_learned` 的实用价值

### Docs

- 提取 `lessons_learned` 到知识库
- 记录重大 bug 到 changelog
- 更新相关文档（如配置错误需更新配置文档）

### Future Developers

- 学习 `lessons_learned` 避免类似问题
- 参考 `rootCause.analysis_method` 用于问题排查
- 使用 `tests_added` 中的测试作为参考

---

## Example: Complete Bugfix Report

```yaml
bugfix_report:
  dispatch_id: "dispatch_004_002"
  task_id: "T-004-002"
  bug_id: "BUG-2026-001"
  created_at: "2026-03-24T14:00:00Z"
  created_by: "developer"
  
  problem_analysis:
    symptom: "Password reset email not sent"
    expected_behavior: "User should receive password reset email within 30 seconds"
    actual_behavior: "No email sent, no error shown to user"
    environment: "Production, v2.3.1"
    frequency: "always"
  
  root_cause:
    category: "configuration"
    description: |
      1. Why no email sent? - SMTP connection timeout
      2. Why timeout? - SMTP server address incorrect after migration
      3. Why incorrect? - Config not updated after infrastructure change
      4. Why not updated? - No process to sync config changes
    analysis_method: "5 Whys"
    contributing_factors:
      - factor: "No integration test for email flow"
        impact: "Issue not caught before deployment"
      - factor: "Silent failure in email service"
        impact: "Error not visible in logs"
  
  impact_assessment:
    severity: "high"
    affected_components: ["auth", "email-service"]
    affected_users: "All users requesting password reset"
    data_corruption: false
    security_implications: false
  
  fix_details:
    approach: "Update SMTP config to new server address and add error handling"
    changed_files:
      - path: "config/production.yml"
        change_type: "modified"
        description: "Update SMTP server address"
        lines_changed:
          added: 1
          deleted: 1
      - path: "src/services/EmailService.ts"
        change_type: "modified"
        description: "Add error logging for email failures"
        lines_changed:
          added: 8
          deleted: 2
    tests_added:
      - path: "tests/integration/password-reset.test.ts"
        type: "regression"
        description: "Verify email is sent and errors are logged"
    is_minimal_fix: true
  
  verification:
    reproduction_test_passed: true
    regression_test_passed: true
    manual_verification_passed: true
    verification_notes: "Tested in staging environment, email received successfully"
  
  deployment:
    deployed_to: ["staging", "production"]
    deployment_time: "2026-03-24T16:00:00Z"
    monitoring_results: "No errors in last 2 hours"
    post_deployment_issues: []
  
  lessons_learned:
    - lesson: "Config changes need synchronization process"
      prevention: "Add config change to deployment checklist"
      category: "process"
    - lesson: "Email service failures were silent"
      prevention: "Always log external service failures"
      category: "code"
  
  follow_up:
    - item: "Add integration test for email flow"
      owner: "qa-team"
      due_date: "2026-03-31"
      status: "pending"
  
  recommendation: "CLOSE"
  time_to_fix_minutes: 120
  time_to_identify_minutes: 60
```

---

## Example: Concurrency Bug

```yaml
bugfix_report:
  problem_analysis:
    symptom: "Duplicate orders created occasionally"
    expected_behavior: "One order per checkout attempt"
    actual_behavior: "Sometimes 2-3 duplicate orders"
    frequency: "rarely"
  
  root_cause:
    category: "concurrency"
    description: |
      Order creation and idempotency check are not atomic.
      Concurrent requests with same idempotency key pass check
      simultaneously and both create orders.
    analysis_method: "Code Review + Log Analysis"
  
  impact_assessment:
    severity: "high"
    affected_components: ["order-service"]
    affected_users: "Users with slow connections double-clicking"
    data_corruption: true
    security_implications: false
  
  fix_details:
    approach: "Add database unique constraint on idempotency key"
    changed_files:
      - path: "src/database/migrations/add_order_idempotency_key_unique.sql"
        change_type: "added"
        description: "Unique constraint migration"
        lines_changed:
          added: 5
          deleted: 0
    is_minimal_fix: true
  
  verification:
    reproduction_test_passed: true
    regression_test_passed: true
    manual_verification_passed: true
  
  lessons_learned:
    - lesson: "Concurrent operations need atomic checks"
      prevention: "Use database constraints for idempotency"
      category: "code"
  
  follow_up:
    - item: "Audit other operations for similar issues"
      owner: "tech-lead"
      due_date: "2026-03-31"
      status: "pending"
  
  recommendation: "MONITOR"
  notes: "Fix deployed, monitoring for 48 hours before closing"
```

---

## References

- `specs/004-developer-core/spec.md` - Feature specification
- `specs/004-developer-core/role-scope.md` - Developer role scope
- `.opencode/skills/developer/bugfix-workflow/SKILL.md` - Bugfix skill
