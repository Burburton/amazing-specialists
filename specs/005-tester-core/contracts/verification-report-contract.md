# Verification Report Contract

## Contract Metadata

| Field | Value |
|-------|-------|
| **Contract ID** | AC-002-test |
| **Contract Name** | Verification Report Contract |
| **Version** | 1.0.0 |
| **Owner** | tester |
| **Consumers** | reviewer, acceptance, developer |

---

## Purpose

Define the complete schema and validation rules for the `verification-report` artifact, which records what tests were designed/run, what passed/failed, and what remains unknown with honest evidence-based reporting.

---

## Schema

```yaml
verification_report:
  # Metadata
  dispatch_id: string              # 关联的 dispatch ID
  task_id: string                  # Task ID
  created_at: timestamp            # 创建时间
  created_by: string               # 创建者 (tester)
  
  # Test Scope Reference (Required)
  test_scope_reference:
    report_path: string            # test-scope-report 路径
    scope_version: string          # 版本标识
    scope_summary: string          # 简要描述 scope
  
  # Tests Added or Run (Required)
  tests_added_or_run:
    new_tests:
      - test_id: string
        file_path: string
        test_name: string
        test_type: enum            # unit | integration | e2e | manual
        category: enum             # happy_path | error_path | boundary | regression
        description: string
    modified_tests:
      - test_id: string
        file_path: string
        modification: string
    executed_tests:
      - test_id: string
        execution_time_ms: integer
        result: enum               # pass | fail | skip | blocked
  
  # Execution Summary (Required)
  execution_summary:
    total_tests: integer
    passed: integer
    failed: integer
    skipped: integer
    blocked: integer
    execution_environment: string  # Where tests ran
    execution_timestamp: timestamp
    test_framework: string
    duration_seconds: integer
  
  # Pass Cases (Required)
  pass_cases:
    - test_id: string
      description: string
      evidence_summary: string     # Brief summary of evidence
      automated: boolean           # BR-003 compliance: automated vs manual distinction
  
  # Failed Cases (Required)
  failed_cases:
    - test_id: string
      description: string
      failure_message: string
      failure_type: enum           # assertion | exception | timeout | environment
      reproduction_steps: string[]
  
  # Failure Classification (Required - BR-004)
  failure_classification:
    - test_id: string
      classification: enum         # implementation | test | environment | design | dependency
      rationale: string
      severity: enum               # critical | major | minor
      suggested_owner: string      # Who should fix
      recommended_action: string
  
  # Evidence (Required)
  evidence:
    automated_evidence:
      - type: enum                 # log | screenshot | diff | coverage_report | assertion_output
        source: string             # File path or reference
        description: string
    manual_evidence:
      - type: enum                 # observation | interview | document_review
        description: string
        observer: string
        timestamp: timestamp
    coverage_report:
      statement_coverage: number   # Percentage
      branch_coverage: number
      function_coverage: number
      report_path: string | null
  
  # Coverage Gaps (Required - BR-003)
  coverage_gaps:
    - gap_id: string
      description: string
      affected_component: string
      reason_uncovered: string     # Why this area wasn't tested
      risk_assessment: string      # What could go wrong
      priority_to_address: enum    # high | medium | low
  
  # Edge Cases Checked (Required - BR-005)
  edge_cases_checked:
    - edge_id: string
      description: string
      category: enum               # boundary | invalid_input | race_condition | resource_limit
      test_result: enum            # pass | fail | not_tested | blocked
      notes: string | null
  
  # Blocked Items (Required)
  blocked_items:
    - block_id: string
      description: string
      blocker_type: enum           # environment | spec_ambiguity | dependency | resource | access
      impact: string               # What cannot be tested
      workaround_available: boolean
      workaround_description: string | null
  
  # Confidence Level (Required - BR-007)
  confidence_level:
    level: enum                    # FULL | PARTIAL | LOW
    rationale: string              # Why this confidence level
    evidence_strength: string      # Description of evidence quality
    assumptions_made: string[]     # Assumptions if any
  
  # Recommendation (Required)
  recommendation: enum             # PASS_TO_REVIEW | REWORK | RETEST | ESCALATE
  
  # Additional Context (Optional)
  notes: string | null
  attachments:
    - name: string
      path: string
      description: string
```

---

## Field Specifications

### failure_classification.classification (BR-004)

| Value | Definition | Example | Next Action |
|-------|------------|---------|-------------|
| `implementation` | Code logic error | Wrong calculation result | Return to developer |
| `test` | Test design/execution problem | Wrong assertion | Fix test, re-run |
| `environment` | Test environment blocker | Database unavailable | Resolve env issue |
| `design` | Ambiguous or missing requirements | Unclear expected behavior | Escalate to architect |
| `dependency` | External dependency failure | Third-party API down | Check dependency status |

### confidence_level.level (BR-007)

| Value | Definition | When to Use |
|-------|------------|-------------|
| `FULL` | All planned tests pass with complete evidence | Happy path + edge cases + regression verified |
| `PARTIAL` | Some tests blocked or skipped | Minor coverage gaps, non-critical blockers |
| `LOW` | Significant gaps in verification | Major blockers, insufficient evidence, spec conflicts |

### recommendation

| Value | Meaning | Next Action |
|-------|---------|-------------|
| `PASS_TO_REVIEW` | Testing complete, ready for reviewer | Handoff to reviewer |
| `REWORK` | Implementation issues found | Return to developer with classification |
| `RETEST` | Environment/test issues need resolution | Fix issues and re-test |
| `ESCALATE` | Requires higher-level decision | Escalate to architect/management |

---

## Validation Rules

### R-001: Required Fields

以下字段必须存在且非空：
- `dispatch_id`
- `task_id`
- `test_scope_reference.report_path`
- `tests_added_or_run` (至少一项)
- `execution_summary` (所有子字段)
- `pass_cases` (可为空列表)
- `failed_cases` (可为空列表)
- `failure_classification` (如有 failed_cases 则必须)
- `evidence`
- `coverage_gaps` (可为空列表但必须存在)
- `edge_cases_checked` (可为空列表但必须存在)
- `blocked_items` (可为空列表但必须存在)
- `confidence_level.level`
- `confidence_level.rationale`
- `recommendation`

### R-002: BR-002 Compliance (Self-Check Distinction)

- 不得将 developer self-check 结果作为 tester 验证证据
- 所有 evidence 必须是 tester 独立收集的
- 如引用 developer 自测结果，必须标注为 "developer self-check (not independent verification)"

### R-003: BR-003 Compliance (Coverage Boundaries)

- `coverage_gaps` 必须如实报告未覆盖区域
- 即使 "all tests pass"，也必须检查是否有 coverage gaps
- "All good" without scope boundaries is invalid

### R-004: BR-004 Compliance (Failure Classification)

- 每个 `failed_cases` 条目必须在 `failure_classification` 中有对应
- 分类必须有 rationale
- 分类决定后续行动（developer vs tester vs environment）

### R-005: BR-005 Compliance (Edge Cases)

- `edge_cases_checked` 必须包含边界条件测试结果
- 如果没有边界条件测试，必须在 `coverage_gaps` 中说明原因

### R-006: BR-007 Compliance (Honest Confidence)

- `confidence_level` 必须如实反映验证完整性
- PARTIAL 或 LOW 必须有 rationale
- 不得将 PARTIAL/LOW 验证报告为 FULL

### R-007: Automated vs Manual Distinction

- 每个 `pass_cases` 必须标明 `automated` 字段
- 每个 `tests_added_or_run` 必须标明 `test_type`
- 手动测试结果必须有 `observer` 和 `timestamp`

---

## Consumer Responsibilities

### Reviewer

- 验证 `confidence_level` 与实际证据匹配
- 检查 `failure_classification` 是否合理
- 评估 `coverage_gaps` 的风险
- 确认 `edge_cases_checked` 覆盖边界条件

### Acceptance

- 根据 `recommendation` 决定下一步
- 理解 `confidence_level` 和 `coverage_gaps` 带来的风险
- 决定是否接受 PARTIAL 验证

### Developer

- 响应 `failure_classification` 中 `suggested_owner` 为 developer 的项目
- 提供 `blocked_items` 中需要的支持
- 修复 `classification: implementation` 的问题

---

## Producer Responsibilities

### Tester

- 独立执行验证，不依赖 developer self-check
- 如实分类所有失败
- 诚实报告 coverage gaps 和 blocked items
- 准确评估 confidence level
- 提供可追溯的 evidence

---

## Example: Valid Verification Report (PASS_TO_REVIEW)

```yaml
verification_report:
  dispatch_id: "dispatch_005_001"
  task_id: "T-005-001"
  created_at: "2026-03-25T16:00:00Z"
  created_by: "tester"
  
  test_scope_reference:
    report_path: "./test-scope-report.md"
    scope_version: "1.0"
    scope_summary: "AuthService login and token validation"
  
  tests_added_or_run:
    new_tests:
      - test_id: "TC-001"
        file_path: "tests/unit/AuthService.test.ts"
        test_name: "valid credentials returns user and token"
        test_type: "unit"
        category: "happy_path"
        description: "Test login with valid credentials"
      - test_id: "TC-002"
        file_path: "tests/unit/AuthService.test.ts"
        test_name: "invalid password throws InvalidCredentialsError"
        test_type: "unit"
        category: "error_path"
        description: "Test login with wrong password"
      - test_id: "TC-003"
        file_path: "tests/unit/AuthService.test.ts"
        test_name: "non-existent user throws UserNotFoundError"
        test_type: "unit"
        category: "error_path"
        description: "Test login with unknown username"
    modified_tests: []
    executed_tests:
      - test_id: "TC-001"
        execution_time_ms: 45
        result: "pass"
      - test_id: "TC-002"
        execution_time_ms: 38
        result: "pass"
      - test_id: "TC-003"
        execution_time_ms: 41
        result: "pass"
  
  execution_summary:
    total_tests: 8
    passed: 8
    failed: 0
    skipped: 0
    blocked: 0
    execution_environment: "local (jest)"
    execution_timestamp: "2026-03-25T16:15:00Z"
    test_framework: "jest@29.6.0"
    duration_seconds: 3
  
  pass_cases:
    - test_id: "TC-001"
      description: "Login with valid credentials"
      evidence_summary: "Returned user object with correct token"
      automated: true
    - test_id: "TC-002"
      description: "Login with invalid password"
      evidence_summary: "Threw InvalidCredentialsError as expected"
      automated: true
    - test_id: "TC-003"
      description: "Login with non-existent user"
      evidence_summary: "Threw UserNotFoundError as expected"
      automated: true
  
  failed_cases: []
  
  failure_classification: []
  
  evidence:
    automated_evidence:
      - type: "assertion_output"
        source: "tests/unit/AuthService.test.ts"
        description: "All 8 assertions passed"
      - type: "coverage_report"
        source: "coverage/lcov-report/index.html"
        description: "Statement: 92%, Branch: 85%, Function: 100%"
    manual_evidence: []
    coverage_report:
      statement_coverage: 92
      branch_coverage: 85
      function_coverage: 100
      report_path: "coverage/lcov-report/index.html"
  
  coverage_gaps:
    - gap_id: "GAP-001"
      description: "Token refresh flow not tested"
      affected_component: "AuthService.refreshToken"
      reason_uncovered: "Feature not implemented"
      risk_assessment: "Users must re-login when token expires"
      priority_to_address: "medium"
  
  edge_cases_checked:
    - edge_id: "EDGE-001"
      description: "Empty username"
      category: "invalid_input"
      test_result: "pass"
      notes: "Throws ValidationError"
    - edge_id: "EDGE-002"
      description: "Empty password"
      category: "invalid_input"
      test_result: "pass"
      notes: "Throws ValidationError"
    - edge_id: "EDGE-003"
      description: "Very long username (>100 chars)"
      category: "boundary"
      test_result: "pass"
      notes: "Properly handles without crash"
  
  blocked_items: []
  
  confidence_level:
    level: "FULL"
    rationale: "All planned tests pass, edge cases covered, coverage meets targets"
    evidence_strength: "Automated tests with assertion evidence and coverage report"
    assumptions_made: []
  
  recommendation: "PASS_TO_REVIEW"
  
  notes: null
  attachments: []
```

---

## Example: Verification Report with Failures

```yaml
verification_report:
  dispatch_id: "dispatch_005_003"
  task_id: "T-005-003"
  created_at: "2026-03-25T17:00:00Z"
  created_by: "tester"
  
  test_scope_reference:
    report_path: "./test-scope-report.md"
    scope_version: "1.0"
    scope_summary: "PaymentService payment processing"
  
  tests_added_or_run:
    new_tests:
      - test_id: "TC-PAY-001"
        file_path: "tests/unit/PaymentService.test.ts"
        test_name: "process valid payment"
        test_type: "unit"
        category: "happy_path"
        description: "Process payment with valid card"
    executed_tests:
      - test_id: "TC-PAY-001"
        execution_time_ms: 120
        result: "fail"
  
  execution_summary:
    total_tests: 1
    passed: 0
    failed: 1
    skipped: 0
    blocked: 0
    execution_environment: "local (jest)"
    execution_timestamp: "2026-03-25T17:15:00Z"
    test_framework: "jest@29.6.0"
    duration_seconds: 1
  
  pass_cases: []
  
  failed_cases:
    - test_id: "TC-PAY-001"
      description: "Process payment with valid card"
      failure_message: "Expected 200.00, received 199.99"
      failure_type: "assertion"
      reproduction_steps:
        - "Create payment request with amount 200.00"
        - "Call PaymentService.process()"
        - "Observe returned amount is 199.99"
  
  failure_classification:
    - test_id: "TC-PAY-001"
      classification: "implementation"
      rationale: "Floating point precision issue in calculation logic"
      severity: "major"
      suggested_owner: "developer"
      recommended_action: "Fix calculation to handle decimal precision correctly"
  
  evidence:
    automated_evidence:
      - type: "assertion_output"
        source: "tests/unit/PaymentService.test.ts"
        description: "Assertion failure: amount mismatch"
    manual_evidence: []
    coverage_report:
      statement_coverage: 75
      branch_coverage: 60
      function_coverage: 80
      report_path: "coverage/lcov-report/index.html"
  
  coverage_gaps:
    - gap_id: "GAP-PAY-001"
      description: "Multi-currency support not tested"
      affected_component: "PaymentService currency handling"
      reason_uncovered: "Spec ambiguity - unclear if multi-currency is required"
      risk_assessment: "May break for non-USD payments"
      priority_to_address: "high"
  
  edge_cases_checked:
    - edge_id: "EDGE-PAY-001"
      description: "Zero amount payment"
      category: "boundary"
      test_result: "not_tested"
      notes: "Blocked by primary test failure"
  
  blocked_items:
    - block_id: "BLOCK-PAY-001"
      description: "Cannot test multi-currency scenarios"
      blocker_type: "spec_ambiguity"
      impact: "Currency conversion logic unverified"
      workaround_available: false
      workaround_description: null
  
  confidence_level:
    level: "LOW"
    rationale: "Primary test failed with implementation bug, spec ambiguity blocks further testing"
    evidence_strength: "One failed test, no passing evidence"
    assumptions_made: []
  
  recommendation: "REWORK"
  
  notes: "Floating point precision issue affects all payment amounts. Recommend using decimal.js or similar library for financial calculations."
  attachments: []
```

---

## References

- `specs/005-tester-core/spec.md` - Feature specification (AC-002)
- `specs/005-tester-core/role-scope.md` - Tester role scope
- `specs/005-tester-core/contracts/test-scope-report-contract.md` - Upstream artifact
- `specs/005-tester-core/contracts/regression-risk-report-contract.md` - Related artifact
- `role-definition.md` - 6-role definition