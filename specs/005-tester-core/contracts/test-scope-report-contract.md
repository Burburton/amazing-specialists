# Test Scope Report Contract

## Contract Metadata

| Field | Value |
|-------|-------|
| **Contract ID** | AC-001-test |
| **Contract Name** | Test Scope Report Contract |
| **Version** | 1.0.0 |
| **Owner** | tester |
| **Consumers** | reviewer, acceptance, developer |

---

## Purpose

Define the complete schema and validation rules for the `test-scope-report` artifact, which establishes what tester is verifying, why it is in scope, and how scope was derived from developer artifacts.

---

## Schema

```yaml
test_scope_report:
  # Metadata
  dispatch_id: string              # 关联的 dispatch ID
  task_id: string                  # Task ID
  created_at: timestamp            # 创建时间
  created_by: string               # 创建者 (tester)
  
  # Input Artifacts (Required)
  input_artifacts:                 # Developer artifacts consumed
    implementation_summary_path: string
    self_check_report_path: string | null
    bugfix_report_path: string | null
    other_artifacts:
      - path: string
        type: string
  
  # Goal Under Test (Required)
  goal_under_test:                 # Expected behavior being verified
    original_goal: string          # From implementation-summary.goal_alignment.goal
    test_interpretation: string    # How tester interprets for testing
    acceptance_targets:            # Specific acceptance criteria
      - criterion: string
        measurable: boolean
        test_method: string
  
  # Changed Surface (Required)
  changed_surface:                 # Files/modules/flows under test
    files:
      - path: string
        test_priority: enum        # critical | high | medium | low
        test_types: string[]       # unit | integration | e2e
    modules:
      - name: string
        boundary: string
        impacted_functions: string[]
    data_flows:
      - source: string
        destination: string
        data_type: string
  
  # Risk Priorities (Required)
  risk_priorities:                 # High-risk areas ranked for testing
    - risk_id: string              # References implementation-summary.risks
      description: string
      level: enum                  # high | medium | low
      test_approach: string
      priority_rank: integer
  
  # Test Strategy (Required)
  test_strategy:
    overall_approach: string       # Description of testing approach
    test_levels:                   # Types of testing planned
      - level: enum                # unit | integration | e2e | manual
        coverage_target: string
        tools: string[]
    prioritization_rationale: string
  
  # In Scope Items (Required)
  in_scope_items:                  # Scenarios explicitly included
    - item_id: string
      description: string
      category: enum               # functional | non-functional | regression
      test_case_ids: string[]
  
  # Out of Scope Items (Required)
  out_of_scope_items:              # Scenarios intentionally excluded
    - item_id: string
      description: string
      reason: string               # Why excluded
      impact_assessment: string    # What risk this creates
      deferred_to: string | null   # Where this will be addressed
  
  # Assumptions (Required)
  assumptions:                     # Assumptions shaping test design
    - assumption: string
      source: string               # Where assumption came from
      risk_if_wrong: string
      validation_method: string | null
  
  # Environment Requirements (Required)
  environment_requirements:        # Tools/data/setup required
    tools:
      - name: string
        version: string | null
        purpose: string
    data:
      - type: string               # test_data | mock_data | production_subset
        description: string
        setup_instructions: string | null
    services:
      - name: string
        status: enum               # available | needs_setup | unavailable
        notes: string | null
  
  # Recommendation (Required)
  recommendation: enum             # PROCEED | BLOCKED | ESCALATE
  
  # Blocker Details (Conditional - required if recommendation is BLOCKED or ESCALATE)
  blockers:
    - blocker_id: string
      description: string
      type: enum                   # environment | spec_ambiguity | dependency | resource
      blocking_scope: string       # What cannot be tested
      proposed_resolution: string
      owner: string                # Who should resolve
  
  # Metrics (Optional)
  estimated_test_count: integer
  estimated_effort_hours: number
```

---

## Field Specifications

### recommendation

| Value | Meaning | Next Action |
|-------|---------|-------------|
| `PROCEED` | Scope defined, ready for test design | Continue to unit-test-design |
| `BLOCKED` | Cannot proceed without resolution | Wait for blocker resolution |
| `ESCALATE` | Requires management decision | Escalate to appropriate role |

### changed_surface.test_priority

| Value | Definition | Minimum Test Coverage |
|-------|------------|----------------------|
| `critical` | Core business logic, data integrity | 95% statement, 90% branch |
| `high` | Important user-facing features | 85% statement, 75% branch |
| `medium` | Supporting functionality | 70% statement, 60% branch |
| `low` | Utility or low-risk code | 50% statement |

### risk_priorities.level

| Value | Definition | Required Actions |
|-------|------------|-----------------|
| `high` | Significant impact if fails | Must have dedicated test cases, document coverage |
| `medium` | Moderate impact | Should have test cases, may accept partial coverage |
| `low` | Minor impact | Basic coverage acceptable |

---

## Validation Rules

### R-001: Required Fields

以下字段必须存在且非空：
- `dispatch_id`
- `task_id`
- `input_artifacts.implementation_summary_path`
- `goal_under_test.original_goal`
- `goal_under_test.test_interpretation`
- `changed_surface.files` (至少一个元素)
- `risk_priorities` (可为空列表但必须存在)
- `test_strategy.overall_approach`
- `in_scope_items` (至少一个元素)
- `out_of_scope_items` (可为空列表但必须存在)
- `assumptions` (可为空列表但必须存在)
- `environment_requirements`
- `recommendation`

### R-002: Upstream Artifact Traceability

- `input_artifacts.implementation_summary_path` 必须指向有效的 implementation-summary
- `goal_under_test.original_goal` 必须与 implementation-summary.goal_alignment.goal 一致
- `risk_priorities[].risk_id` 应能在 implementation-summary.risks 中找到对应

### R-003: BR-003 Compliance (Coverage Boundaries)

- `in_scope_items` 必须明确列出要测试的内容
- `out_of_scope_items` 必须明确列出排除内容（即使是空列表）
- 每个 out_of_scope_item 必须有 reason 字段说明排除原因

### R-004: BR-001 Compliance (Consume Developer Evidence)

- test_scope_report 必须体现对 developer artifacts 的消费
- 如果 developer 识别了 risks，tester 必须在 risk_priorities 中响应

### R-005: Honest Scope Definition

- 不应为了"好看"而缩小 in_scope_items
- out_of_scope_items 应如实反映限制
- assumptions 应如实反映测试前提条件

---

## Consumer Responsibilities

### Reviewer

- 使用 `goal_under_test` 验证测试覆盖完整性
- 检查 `out_of_scope_items` 的合理性
- 验证 `risk_priorities` 是否覆盖 developer 识别的风险
- 评估 `assumptions` 的合理性

### Acceptance

- 使用 `in_scope_items` 验收测试范围
- 理解 `out_of_scope_items` 带来的风险
- 根据 `recommendation` 决定后续流程

### Developer

- 确认 `goal_under_test.test_interpretation` 与预期一致
- 回应 `blockers` 中需要 developer 解决的问题
- 提供 `environment_requirements` 中需要的支持

---

## Producer Responsibilities

### Tester

- 确保 test scope 从 developer artifacts 正确推导
- 诚实界定 in-scope 和 out-of-scope
- 识别所有必要的 assumptions
- 准确评估 environment requirements
- 如实报告 blockers

---

## Example: Valid Test Scope Report

```yaml
test_scope_report:
  dispatch_id: "dispatch_005_001"
  task_id: "T-005-001"
  created_at: "2026-03-25T14:00:00Z"
  created_by: "tester"
  
  input_artifacts:
    implementation_summary_path: "./implementation-summary.md"
    self_check_report_path: "./self-check-report.md"
    bugfix_report_path: null
    other_artifacts: []
  
  goal_under_test:
    original_goal: "Implement user authentication with JWT"
    test_interpretation: "Verify authentication flow: login, token generation, token validation, logout"
    acceptance_targets:
      - criterion: "Valid credentials return JWT token"
        measurable: true
        test_method: "unit test assertion"
      - criterion: "Invalid credentials return 401"
        measurable: true
        test_method: "unit test assertion"
      - criterion: "Token expires after configured time"
        measurable: true
        test_method: "unit test with mocked time"
  
  changed_surface:
    files:
      - path: "src/services/AuthService.ts"
        test_priority: "critical"
        test_types: ["unit", "integration"]
      - path: "src/controllers/AuthController.ts"
        test_priority: "high"
        test_types: ["unit", "integration"]
    modules:
      - name: "AuthService"
        boundary: "Public API: login, validateToken, logout"
        impacted_functions: ["validateUser", "generateToken", "verifyToken"]
    data_flows:
      - source: "AuthController"
        destination: "AuthService"
        data_type: "Credentials -> Token"
  
  risk_priorities:
    - risk_id: "RISK-001"
      description: "JWT secret management"
      level: "high"
      test_approach: "Verify secret is loaded from environment, not hardcoded"
      priority_rank: 1
    - risk_id: "RISK-002"
      description: "Token expiration handling"
      level: "medium"
      test_approach: "Test expired token rejection"
      priority_rank: 2
  
  test_strategy:
    overall_approach: "Layered testing: unit tests for service logic, integration tests for API endpoints"
    test_levels:
      - level: "unit"
        coverage_target: "90%"
        tools: ["jest", "ts-mockito"]
      - level: "integration"
        coverage_target: "75%"
        tools: ["supertest"]
    prioritization_rationale: "Critical authentication logic tested first, then API layer"
  
  in_scope_items:
    - item_id: "SCOPE-001"
      description: "Login with valid credentials"
      category: "functional"
      test_case_ids: ["TC-001"]
    - item_id: "SCOPE-002"
      description: "Login with invalid credentials"
      category: "functional"
      test_case_ids: ["TC-002", "TC-003", "TC-004"]
    - item_id: "SCOPE-003"
      description: "Token validation"
      category: "functional"
      test_case_ids: ["TC-005", "TC-006"]
  
  out_of_scope_items:
    - item_id: "OUT-001"
      description: "Refresh token flow"
      reason: "Not implemented in this iteration"
      impact_assessment: "Users must re-login when token expires"
      deferred_to: "Next sprint"
    - item_id: "OUT-002"
      description: "Rate limiting on login endpoint"
      reason: "Infrastructure concern, not service logic"
      impact_assessment: "Potential brute force vulnerability"
      deferred_to: "Security review"
  
  assumptions:
    - assumption: "Database is available and properly seeded with test users"
      source: "Test environment documentation"
      risk_if_wrong: "Integration tests will fail"
      validation_method: "Pre-test connectivity check"
    - assumption: "JWT secret is configured in test environment"
      source: "developer self-check-report"
      risk_if_wrong: "Token generation will fail"
      validation_method: "Environment variable check"
  
  environment_requirements:
    tools:
      - name: "jest"
        version: "^29.0.0"
        purpose: "Test runner and assertions"
      - name: "ts-mockito"
        version: "^2.0.0"
        purpose: "Mocking framework"
    data:
      - type: "test_data"
        description: "Test users with known credentials"
        setup_instructions: "Run npm run seed:test-users"
    services:
      - name: "test_database"
        status: "needs_setup"
        notes: "Use Docker compose for local testing"
  
  recommendation: "PROCEED"
  
  estimated_test_count: 12
  estimated_effort_hours: 4
```

---

## Example: Blocked Test Scope Report

```yaml
test_scope_report:
  dispatch_id: "dispatch_005_002"
  task_id: "T-005-002"
  created_at: "2026-03-25T15:00:00Z"
  created_by: "tester"
  
  input_artifacts:
    implementation_summary_path: "./implementation-summary.md"
    self_check_report_path: null
    bugfix_report_path: null
    other_artifacts: []
  
  goal_under_test:
    original_goal: "Implement payment processing"
    test_interpretation: "Cannot determine - spec conflicts with implementation"
    acceptance_targets: []
  
  changed_surface:
    files:
      - path: "src/services/PaymentService.ts"
        test_priority: "critical"
        test_types: ["unit", "integration"]
    modules: []
    data_flows: []
  
  risk_priorities: []
  
  test_strategy:
    overall_approach: "Blocked - cannot design tests without clear requirements"
    test_levels: []
    prioritization_rationale: "N/A - blocked"
  
  in_scope_items: []
  
  out_of_scope_items:
    - item_id: "OUT-BLOCKED-001"
      description: "All payment testing"
      reason: "Spec ambiguity prevents test design"
      impact_assessment: "Payment feature cannot be verified"
      deferred_to: null
  
  assumptions: []
  
  environment_requirements:
    tools: []
    data: []
    services: []
  
  recommendation: "ESCALATE"
  
  blockers:
    - blocker_id: "BLOCK-001"
      description: "Spec says 'support multiple currencies' but implementation only handles USD"
      type: "spec_ambiguity"
      blocking_scope: "All currency-related test scenarios"
      proposed_resolution: "Architect to clarify: is this a spec deviation or intended limitation?"
      owner: "architect"
```

---

## References

- `specs/005-tester-core/spec.md` - Feature specification (AC-001)
- `specs/005-tester-core/role-scope.md` - Tester role scope
- `specs/005-tester-core/upstream-consumption.md` - Upstream artifact consumption guide
- `specs/004-developer-core/contracts/implementation-summary-contract.md` - Upstream artifact
- `role-definition.md` - 6-role definition