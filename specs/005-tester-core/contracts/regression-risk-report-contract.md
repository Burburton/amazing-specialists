# Regression Risk Report Contract

## Contract Metadata

| Field | Value |
|-------|-------|
| **Contract ID** | AC-003-test |
| **Contract Name** | Regression Risk Report Contract |
| **Version** | 1.0.0 |
| **Owner** | tester |
| **Consumers** | reviewer, acceptance, developer |

---

## Purpose

Define the complete schema and validation rules for the `regression-risk-report` artifact, which explains what adjacent or historical behavior might regress and how that risk was addressed.

---

## Schema

```yaml
regression_risk_report:
  # Metadata
  dispatch_id: string              # 关联的 dispatch ID
  task_id: string                  # Task ID
  created_at: timestamp            # 创建时间
  created_by: string               # 创建者 (tester)
  
  # Change Anchor (Required)
  change_anchor:                   # What change triggered regression analysis
    change_type: enum              # feature | bugfix | refactor | config
    change_summary: string         # Brief description of the change
    changed_files:
      - path: string
        change_summary: string
    related_bugfix_report: string | null  # Path if this is bugfix verification
  
  # Regression Surfaces (Required)
  regression_surfaces:             # Nearby impacted behaviors/modules
    - surface_id: string
      module: string
      functionality: string        # What functionality could be affected
      connection_type: enum        # direct | indirect | shared_dependency | data_flow
      connection_description: string
      likelihood: enum             # high | medium | low
      impact_severity: enum        # critical | major | minor
      risk_score: number           # Combined score (1-10)
  
  # Existing Tests Reused (Required)
  existing_tests_reused:           # Existing tests used for regression confidence
    - test_id: string
      test_file: string
      test_name: string
      covers_surface: string       # Which regression surface it covers
      execution_result: enum       # pass | fail | not_run
      notes: string | null
  
  # New Regression Checks (Required)
  new_regression_checks:           # Additional checks added for recurrence prevention
    - check_id: string
      description: string
      covers_surface: string
      test_file: string | null     # If test code written
      test_type: enum              # unit | integration | e2e | manual
      rationale: string            # Why this check was needed
  
  # Untested Regression Areas (Required)
  untested_regression_areas:       # Risk surfaces not yet covered
    - area_id: string
      surface_id: string           # References regression_surfaces
      description: string
      reason_untested: string      # Why not covered
      risk_assessment: string
      mitigation_recommendation: string
      priority_to_address: enum    # high | medium | low
  
  # Risk Ranking (Required)
  risk_ranking:                    # Severity / likelihood prioritization
    methodology: string            # How risks were ranked
    top_risks:
      - risk_id: string
        surface_id: string
        combined_score: number
        recommendation: string
    risk_matrix:
      high_likelihood_high_impact: string[]
      high_likelihood_low_impact: string[]
      low_likelihood_high_impact: string[]
      low_likelihood_low_impact: string[]
  
  # Follow-up Actions (Required)
  follow_up_actions:
    - action_id: string
      action_type: enum            # create_test | update_test | monitor | document | escalate
      description: string
      owner: string
      deadline: string | null
      priority: enum               | high | medium | low
      status: enum                 # pending | in_progress | completed | blocked
  
  # Recommendation (Required)
  recommendation: enum             # ACCEPT_RISK | REWORK | ESCALATE
  
  # Historical Context (Optional)
  historical_context:
    similar_changes:
      - change_id: string
        description: string
        regressions_introduced: string[]
        lessons_learned: string
    related_bug_history:
      - bug_id: string
        description: string
        root_cause: string
        fix_verified: boolean
  
  # Metrics (Optional)
  regression_coverage_percentage: number
  estimated_risk_exposure: string
```

---

## Field Specifications

### change_anchor.change_type

| Value | Definition | Regression Focus |
|-------|------------|-----------------|
| `feature` | New functionality added | Integration with existing features, shared resources |
| `bugfix` | Bug fixed | Root cause area, similar patterns elsewhere |
| `refactor` | Code restructured | All callers of changed code, behavior preservation |
| `config` | Configuration changed | All components using the config |

### regression_surfaces.connection_type

| Value | Definition | Example |
|-------|------------|---------|
| `direct` | Direct caller/callee relationship | Function A calls changed function B |
| `indirect` | Indirect dependency through layers | A → B → C (C changed) |
| `shared_dependency` | Uses same dependency | Both use shared database connection |
| `data_flow` | Data passes through changed code | User input → validation → storage |

### regression_surfaces.risk_score

Calculated as: `likelihood (1-5) × impact_severity (1-5)` → range 1-25, normalized to 1-10

| Score Range | Risk Level | Action Required |
|-------------|------------|-----------------|
| 8-10 | Critical | Must have regression test before proceeding |
| 5-7 | High | Should have regression test |
| 3-4 | Medium | Document risk, consider testing |
| 1-2 | Low | Accept risk, minimal testing |

### recommendation

| Value | Meaning | When to Use |
|-------|---------|-------------|
| `ACCEPT_RISK` | Risks identified and acceptable | Low exposure, mitigation in place |
| `REWORK` | Implementation needs change before release | High regression risk found |
| `ESCALATE` | Requires management decision | Risk assessment inconclusive or critical |

---

## Validation Rules

### R-001: Required Fields

以下字段必须存在且非空：
- `dispatch_id`
- `task_id`
- `change_anchor.change_type`
- `change_anchor.change_summary`
- `regression_surfaces` (可为空列表但必须存在)
- `existing_tests_reused` (可为空列表但必须存在)
- `new_regression_checks` (可为空列表但必须存在)
- `untested_regression_areas` (可为空列表但必须存在)
- `risk_ranking.methodology`
- `follow_up_actions` (至少一项)
- `recommendation`

### R-002: BR-006 Compliance (Regression Thinking Required)

- 必须识别 regression_surfaces 超出直接修改的代码路径
- 如果 regression_surfaces 为空，必须有 rationale 说明为何没有回归风险
- 必须评估对 adjacent surfaces 的影响

### R-003: Traceability

- `untested_regression_areas[].surface_id` 必须在 `regression_surfaces` 中有对应
- `new_regression_checks[].covers_surface` 必须在 `regression_surfaces` 中有对应
- `existing_tests_reused[].covers_surface` 必须在 `regression_surfaces` 中有对应

### R-004: Honest Risk Assessment

- `untested_regression_areas` 必须如实报告未覆盖区域
- `risk_ranking` 必须反映真实风险
- 不得隐瞒高回归风险

### R-005: Bugfix-Specific Requirements

- 如果 `change_anchor.change_type` 是 `bugfix`：
  - `change_anchor.related_bugfix_report` 应该存在
  - 应包含 root-cause-aware 回归检查
  - 应验证原始 bug 不会再次出现

---

## Consumer Responsibilities

### Reviewer

- 验证 `regression_surfaces` 是否全面
- 评估 `untested_regression_areas` 的风险
- 检查 `risk_ranking` 是否合理
- 决定是否接受 recommendation

### Acceptance

- 理解回归风险敞口
- 决定是否接受 `ACCEPT_RISK` recommendation
- 跟踪 `follow_up_actions`

### Developer

- 响应 `REWORK` recommendation
- 提供代码变更影响的上下文
- 支持 `historical_context` 信息收集

---

## Producer Responsibilities

### Tester

- 超越直接修改的代码路径思考回归风险
- 识别 indirect/shared_dependency/data_flow 连接
- 如实报告未测试的回归区域
- 提供可操作的建议

---

## Example: Feature Change Regression Report

```yaml
regression_risk_report:
  dispatch_id: "dispatch_005_001"
  task_id: "T-005-001"
  created_at: "2026-03-25T18:00:00Z"
  created_by: "tester"
  
  change_anchor:
    change_type: "feature"
    change_summary: "Added JWT authentication to AuthService"
    changed_files:
      - path: "src/services/AuthService.ts"
        change_summary: "Added JWT token generation and validation"
      - path: "src/controllers/AuthController.ts"
        change_summary: "Updated to use JWT authentication"
    related_bugfix_report: null
  
  regression_surfaces:
    - surface_id: "RS-001"
      module: "UserService"
      functionality: "User session management"
      connection_type: "direct"
      connection_description: "UserService calls AuthService for session validation"
      likelihood: "high"
      impact_severity: "major"
      risk_score: 8
    - surface_id: "RS-002"
      module: "API Middleware"
      functionality: "Request authentication"
      connection_type: "direct"
      connection_description: "Middleware uses AuthService.validateToken()"
      likelihood: "high"
      impact_severity: "critical"
      risk_score: 10
    - surface_id: "RS-003"
      module: "LoggingService"
      functionality: "Request logging"
      connection_type: "shared_dependency"
      connection_description: "Both AuthService and LoggingService use RequestContext"
      likelihood: "low"
      impact_severity: "minor"
      risk_score: 2
  
  existing_tests_reused:
    - test_id: "EXIST-001"
      test_file: "tests/integration/UserService.test.ts"
      test_name: "user session remains valid"
      covers_surface: "RS-001"
      execution_result: "pass"
      notes: "Session still works with new JWT implementation"
    - test_id: "EXIST-002"
      test_file: "tests/integration/APIMiddleware.test.ts"
      test_name: "authenticated request passes through"
      covers_surface: "RS-002"
      execution_result: "pass"
      notes: "API middleware correctly validates JWT tokens"
  
  new_regression_checks:
    - check_id: "NEW-001"
      description: "Test token expiration handling in session"
      covers_surface: "RS-001"
      test_file: "tests/unit/AuthService.test.ts"
      test_type: "unit"
      rationale: "New JWT implementation introduces token expiration, need to verify session behavior"
    - check_id: "NEW-002"
      description: "Test API middleware rejects expired tokens"
      covers_surface: "RS-002"
      test_file: "tests/integration/APIMiddleware.test.ts"
      test_type: "integration"
      rationale: "Critical path - ensure expired tokens are rejected"
  
  untested_regression_areas:
    - area_id: "UNTEST-001"
      surface_id: "RS-003"
      description: "RequestContext correlation with new auth"
      reason_untested: "Low risk, limited test time"
      risk_assessment: "Minor logging inconsistency possible"
      mitigation_recommendation: "Monitor logs for correlation issues"
      priority_to_address: "low"
  
  risk_ranking:
    methodology: "Likelihood × Impact matrix, normalized to 1-10 scale"
    top_risks:
      - risk_id: "TOP-001"
        surface_id: "RS-002"
        combined_score: 10
        recommendation: "Must verify all API endpoints with JWT auth"
    risk_matrix:
      high_likelihood_high_impact: ["RS-001", "RS-002"]
      high_likelihood_low_impact: []
      low_likelihood_high_impact: []
      low_likelihood_low_impact: ["RS-003"]
  
  follow_up_actions:
    - action_id: "ACTION-001"
      action_type: "monitor"
      description: "Monitor production logs for authentication failures after deployment"
      owner: "ops"
      deadline: "2026-03-26"
      priority: "high"
      status: "pending"
    - action_id: "ACTION-002"
      action_type: "document"
      description: "Update API documentation with new JWT authentication requirements"
      owner: "docs"
      deadline: "2026-03-27"
      priority: "medium"
      status: "pending"
  
  recommendation: "ACCEPT_RISK"
  
  historical_context:
    similar_changes:
      - change_id: "CHANGE-2025-042"
        description: "Previous auth system update"
        regressions_introduced: ["Session timeout too short"]
        lessons_learned: "Always test session duration after auth changes"
    related_bug_history: []
  
  regression_coverage_percentage: 85
  estimated_risk_exposure: "Low - critical paths tested, minor logging correlation risk"
```

---

## Example: Bugfix Regression Report

```yaml
regression_risk_report:
  dispatch_id: "dispatch_005_004"
  task_id: "T-005-004"
  created_at: "2026-03-25T19:00:00Z"
  created_by: "tester"
  
  change_anchor:
    change_type: "bugfix"
    change_summary: "Fixed payment calculation precision issue"
    changed_files:
      - path: "src/services/PaymentService.ts"
        change_summary: "Replaced floating-point arithmetic with decimal.js"
    related_bugfix_report: "./bugfix-report.md"
  
  regression_surfaces:
    - surface_id: "RS-PAY-001"
      module: "OrderService"
      functionality: "Order total calculation"
      connection_type: "direct"
      connection_description: "OrderService calls PaymentService.calculateTotal()"
      likelihood: "medium"
      impact_severity: "major"
      risk_score: 6
    - surface_id: "RS-PAY-002"
      module: "RefundService"
      functionality: "Refund amount calculation"
      connection_type: "direct"
      connection_description: "RefundService uses PaymentService for refund amounts"
      likelihood: "medium"
      impact_severity: "major"
      risk_score: 6
    - surface_id: "RS-PAY-003"
      module: "ReportingService"
      functionality: "Daily revenue report"
      connection_type: "data_flow"
      connection_description: "Reports aggregate payment data"
      likelihood: "low"
      impact_severity: "minor"
      risk_score: 2
  
  existing_tests_reused:
    - test_id: "EXIST-PAY-001"
      test_file: "tests/integration/OrderService.test.ts"
      test_name: "order total matches item prices"
      covers_surface: "RS-PAY-001"
      execution_result: "pass"
      notes: "Order calculation still correct after decimal.js change"
  
  new_regression_checks:
    - check_id: "NEW-PAY-001"
      description: "Verify original bug fix - payment calculation precision"
      covers_surface: "RS-PAY-001"
      test_file: "tests/unit/PaymentService.test.ts"
      test_type: "unit"
      rationale: "Root-cause-aware testing - verify the specific bug is fixed"
    - check_id: "NEW-PAY-002"
      description: "Test refund calculation with new precision"
      covers_surface: "RS-PAY-002"
      test_file: "tests/unit/RefundService.test.ts"
      test_type: "unit"
      rationale: "Refund amounts must match payment amounts"
  
  untested_regression_areas:
    - area_id: "UNTEST-PAY-001"
      surface_id: "RS-PAY-003"
      description: "Reporting aggregation with decimal values"
      reason_untested: "Reporting is scheduled for rewrite next sprint"
      risk_assessment: "Minor rounding differences in reports possible"
      mitigation_recommendation: "Manual verification of first report after deployment"
      priority_to_address: "medium"
  
  risk_ranking:
    methodology: "Root-cause-aware analysis + impact assessment"
    top_risks:
      - risk_id: "TOP-PAY-001"
        surface_id: "RS-PAY-002"
        combined_score: 6
        recommendation: "Ensure refund amounts match payment amounts exactly"
    risk_matrix:
      high_likelihood_high_impact: []
      high_likelihood_low_impact: []
      low_likelihood_high_impact: ["RS-PAY-001", "RS-PAY-002"]
      low_likelihood_low_impact: ["RS-PAY-003"]
  
  follow_up_actions:
    - action_id: "ACTION-PAY-001"
      action_type: "create_test"
      description: "Add integration test for full payment-refund flow"
      owner: "tester"
      deadline: "2026-03-26"
      priority: "high"
      status: "in_progress"
  
  recommendation: "ACCEPT_RISK"
  
  historical_context:
    similar_changes: []
    related_bug_history:
      - bug_id: "BUG-2026-015"
        description: "Payment calculation off by 1 cent due to floating point"
        root_cause: "JavaScript floating point arithmetic precision"
        fix_verified: true
  
  regression_coverage_percentage: 75
  estimated_risk_exposure: "Low-Medium - financial calculations verified, reporting aggregation has minor risk"
```

---

## References

- `specs/005-tester-core/spec.md` - Feature specification (AC-003)
- `specs/005-tester-core/role-scope.md` - Tester role scope
- `specs/005-tester-core/contracts/test-scope-report-contract.md` - Related artifact
- `specs/005-tester-core/contracts/verification-report-contract.md` - Related artifact
- `specs/004-developer-core/contracts/bugfix-report-contract.md` - Upstream artifact (for bugfix context)
- `role-definition.md` - 6-role definition