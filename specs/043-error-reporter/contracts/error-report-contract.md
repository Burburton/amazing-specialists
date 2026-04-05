# Error Report Contract

## Contract ID
`ERR-001`

## Version
`1.0.0`

## Producer Role
`common` (所有角色可用)

## Consumer Roles
- `OpenClaw` (管理层消费，做流程决策)
- `execution-reporting` (汇总到 Execution Result)
- 各角色 (用于追溯和返工参考)

---

## Purpose

为 6-role 执行层提供标准化的错误报告格式，确保管理层能稳定消费执行层错误信息，做出准确的流程决策。

**核心问题解决**：
- 上游管理层难以区分"可自动处理的错误"和"需人工介入的错误"
- 不同角色输出的错误格式不一致，增加消费复杂度
- 错误追溯链不完整，难以从错误定位到具体 artifact/task
- 错误严重性评估缺少统一标准，导致 escalation 判断偏差

---

## Artifact Schema

### error-report

```yaml
error-report:
  artifact_id: string              # 唯一 ID (格式: ERR-[timestamp]-[random])
  artifact_type: error-report      # 固定类型
  
  error_context:
    dispatch_id: string            # 关联的 dispatch ID
    task_id: string                # 关联的 task ID
    role: enum                     # 报告角色
      - architect
      - developer
      - tester
      - reviewer
      - docs
      - security
    execution_phase: enum          # 执行阶段
      - preparation
      - execution
      - verification
      - output
      
  error_classification:
    error_type: enum               # 错误类型（见 Error Taxonomy）
      - INPUT_INVALID
      - CONSTRAINT_VIOLATION
      - EXECUTION_ERROR
      - VERIFICATION_FAILURE
      - ENVIRONMENT_ISSUE
      - DEPENDENCY_BLOCKER
      - AMBIGUOUS_GOAL
      - SCOPE_CREEP_DETECTED
    error_subtype: string          # 子类型（细化描述）
    severity: enum                 # 严重级别
      - low        # 可忽略/建议 (对应 quality-gate S0)
      - medium     # 影响当前 task (对应 quality-gate S1)
      - high       # 阻塞下游或 milestone (对应 quality-gate S2)
      - critical   # 阻塞整个流程，需升级 (对应 quality-gate S3)
    
  error_details:
    title: string                  # 错误标题（简短，< 100 字符）
    description: string            # 详细描述（发生了什么）
    error_code: string             # 错误码（见 Error Code Prefix）
    stacktrace_or_context: string  # 相关日志/堆栈/上下文片段
    
  impact_assessment:
    blocking_points: [string]      # 阻塞点列表
    downstream_impact: enum        # 对下游影响
      - none       # 不影响下游
      - minor      # 轻微影响
      - blocked    # 阻塞下游
      - cascading  # 可能级联影响
    milestone_impact: enum         # 对 milestone 影响
      - none
      - delay      # 可能延期
      - at_risk    # milestone 风险增加
      - blocked    # milestone 阻塞
    
  traceability:
    source_artifact: string        # 来源 artifact（如 test-report）
    source_file: string            # 来源文件（如有）
    source_line: number            # 来源行号（如有）
    related_errors: [string]       # 关联的其他 error IDs
    
  resolution_guidance:
    auto_recoverable: boolean      # 是否可自动恢复
    recommended_action: enum       # 推荐动作
      - IGNORE     # 可忽略
      - REWORK     # 返工当前 role
      - RETRY      # 重试（环境/临时问题）
      - REPLAN     # 重规划
      - ESCALATE   # 升级
    fix_suggestions: [string]      # 修复建议（如适用）
    estimated_fix_effort: string   # 预估修复成本
    
  metadata:
    created_at: timestamp          # ISO 8601 格式
    created_by_role: string        # 创建角色
    retry_count: number            # 当前返工次数
```

---

## Required Fields

以下字段必须存在且非空：

- `artifact_id`
- `artifact_type` (固定值 `error-report`)
- `error_context.role`
- `error_context.execution_phase`
- `error_classification.error_type`
- `error_classification.severity`
- `error_details.title`
- `error_details.description`
- `error_details.error_code`
- `impact_assessment.downstream_impact`
- `impact_assessment.milestone_impact`
- `resolution_guidance.auto_recoverable`
- `resolution_guidance.recommended_action`
- `metadata.created_at`
- `metadata.created_by_role`
- `metadata.retry_count`

---

## Error Taxonomy

### Error Type Definitions

| Error Type | 定义 | 触发角色 | Auto-Recoverable | 推荐 Action |
|------------|------|----------|------------------|-------------|
| INPUT_INVALID | 输入缺失或无效 | 所有 | false | REWORK/ESCALATE |
| CONSTRAINT_VIOLATION | 违反硬约束 | developer | false | REWORK |
| EXECUTION_ERROR | 执行过程错误 | developer/tester | maybe | REWORK/RETRY |
| VERIFICATION_FAILURE | 验证失败 | tester | false | REWORK |
| ENVIRONMENT_ISSUE | 环境问题 | 所有 | true | RETRY |
| DEPENDENCY_BLOCKER | 依赖阻塞 | 所有 | false | ESCALATE |
| AMBIGUOUS_GOAL | 目标模糊 | architect | false | ESCALATE |
| SCOPE_CREEP_DETECTED | 检测到范围蔓延 | reviewer | false | REPLAN |

### Severity Threshold to Escalation

| Severity | Escalation Threshold | 说明 |
|----------|---------------------|------|
| low | Never | 始终不升级 |
| medium | retry_count >= 2 | 返工 2 次后升级 |
| high | retry_count >= 1 | 返工 1 欍后升级 |
| critical | Immediate | 立即升级 |

### Severity to Quality Gate Mapping

| error-report severity | quality-gate.md level | 说明 |
|-----------------------|----------------------|------|
| low | S0 - Trivial | 可忽略 |
| medium | S1 - Minor | 建议修复 |
| high | S2 - Major | 必须修复，阻塞下游 |
| critical | S3 - Critical | 立即阻塞 |

---

## Error Code Prefix

### 按角色分配

| Role | Prefix | 示例 |
|------|--------|------|
| architect | ERR-ARCH | ERR-ARCH-001: Missing context |
| developer | ERR-DEV | ERR-DEV-001: Constraint violation |
| tester | ERR-TEST | ERR-TEST-001: Assertion fail |
| reviewer | ERR-REV | ERR-REV-001: Spec mismatch |
| docs | ERR-DOC | ERR-DOC-001: Missing evidence |
| security | ERR-SEC | ERR-SEC-001: Auth issue |
| common | ERR-COM | ERR-COM-001: Input invalid |

### Error Code 格式

```
ERR-[ROLE]-[NUMBER]
```

- ROLE: ARCH/DEV/TEST/REV/DOC/SEC/COM
- NUMBER: 3 位数字，从 001 开始递增

---

## Role Failure Modes Error Type Mapping

### architect Failure Modes

| Failure Mode | Error Type | Error Code |
|--------------|------------|------------|
| 输入不足 | INPUT_INVALID | ERR-ARCH-001 |
| 需求冲突 | AMBIGUOUS_GOAL | ERR-ARCH-002 |
| 术语不清 | INPUT_INVALID | ERR-ARCH-003 |
| 上下文缺失 | INPUT_INVALID | ERR-ARCH-004 |
| 约束冲突 | AMBIGUOUS_GOAL | ERR-ARCH-005 |

### developer Failure Modes

| Failure Mode | Error Type | Error Code |
|--------------|------------|------------|
| 依赖上下文缺失 | INPUT_INVALID | ERR-DEV-001 |
| 设计与现状冲突 | CONSTRAINT_VIOLATION | ERR-DEV-002 |
| 环境阻塞 | ENVIRONMENT_ISSUE | ERR-DEV-003 |
| 范围不清 | SCOPE_CREEP_DETECTED | ERR-DEV-004 |

### tester Failure Modes

| Failure Mode | Error Type | Error Code |
|--------------|------------|------------|
| 覆盖缺口 | VERIFICATION_FAILURE | ERR-TEST-001 |
| 失败未分类 | EXECUTION_ERROR | ERR-TEST-002 |
| 无法复现 | ENVIRONMENT_ISSUE | ERR-TEST-003 |

### reviewer Failure Modes

| Failure Mode | Error Type | Error Code |
|--------------|------------|------------|
| Spec 对齐失败 | VERIFICATION_FAILURE | ERR-REV-001 |
| Governance drift | CONSTRAINT_VIOLATION | ERR-REV-002 |

### docs Failure Modes

| Failure Mode | Error Type | Error Code |
|--------------|------------|------------|
| 上游证据缺失 | INPUT_INVALID | ERR-DOC-001 |
| 状态漂移检测失败 | VERIFICATION_FAILURE | ERR-DOC-002 |

### security Failure Modes

| Failure Mode | Error Type | Error Code |
|--------------|------------|------------|
| 权限检查失败 | VERIFICATION_FAILURE | ERR-SEC-001 |
| 依赖风险 | DEPENDENCY_BLOCKER | ERR-SEC-002 |

---

## Relationship to Other Artifacts

### 与 failure-analysis 的关系

| Artifact | 职责 | 输出 |
|----------|------|------|
| failure-analysis | 根因分析 | failure_analysis report (详细根因) |
| error-report | 格式化输出 | error-report artifact (标准化格式) |

**协作模式**：
- failure-analysis 分析根因，输出 failure_type、root_cause、recommendation
- error-reporter 消费 failure_analysis 输出，转化为标准 error-report 格式
- 职责分离，避免重复工作

### 与 Execution Result 的关系

error-report 作为 Execution Result `issues_found` 字段的输入：

```yaml
issues_found:
  - issue_id: string
    error_report_id: string       # 关联的 error-report artifact ID
    severity: enum                # 与 error-report severity 对齐
    error_type: enum              # 添加错误类型
    description: string
    recommendation: string
    auto_recoverable: boolean     # 新增：是否可自动恢复
    traceability:                 # 新增：追溯信息
      source_artifact: string
      source_file: string
```

---

## Validation Rules

### Schema Validation

- artifact_id 格式验证：`^ERR-[0-9]+-[a-z0-9]+$`
- error_type 必须为 Taxonomy 定义的 8 种类型之一
- severity 必须为 low/medium/high/critical
- recommended_action 必须与 severity + auto_recoverable 一致

### Business Rules

#### BR-001: Severity-Action Consistency
- severity=low 时，recommended_action 应为 IGNORE
- severity=medium 且 retry_count < 2 时，recommended_action 应为 REWORK
- severity=high 且 retry_count < 1 时，recommended_action 应为 REWORK
- severity=critical 时，recommended_action 应为 ESCALATE

#### BR-002: Auto-Recoverable Consistency
- error_type=ENVIRONMENT_ISSUE 时，auto_recoverable=true
- error_type=DEPENDENCY_BLOCKER 时，auto_recoverable=false
- error_type=VERIFICATION_FAILURE 时，auto_recoverable=false

#### BR-003: Traceability Minimum
- 必须包含至少一个追溯来源（source_artifact 或 source_file）

#### BR-004: Error Code Format
- error_code 必须符合 `ERR-[ROLE]-[NUMBER]` 格式
- ROLE 必须与 error_context.role 对应

---

## Examples

### Example 1: INPUT_INVALID (architect)

```yaml
artifact_id: ERR-20260405123000-abc123
artifact_type: error-report

error_context:
  dispatch_id: disp-001
  task_id: task-arch-001
  role: architect
  execution_phase: preparation

error_classification:
  error_type: INPUT_INVALID
  error_subtype: missing_spec_section
  severity: medium

error_details:
  title: "Missing spec section: acceptance criteria"
  description: "The spec.md file does not contain a valid Acceptance Criteria section. Unable to proceed with design."
  error_code: ERR-ARCH-001
  stacktrace_or_context: "spec.md line 45: '## Acceptance Criteria' section is empty"

impact_assessment:
  blocking_points:
    - "Cannot define design success criteria without acceptance criteria"
  downstream_impact: blocked
  milestone_impact: delay

traceability:
  source_artifact: spec-001
  source_file: specs/my-feature/spec.md
  source_line: 45
  related_errors: []

resolution_guidance:
  auto_recoverable: false
  recommended_action: REWORK
  fix_suggestions:
    - "Add Acceptance Criteria section to spec.md"
    - "Define at least 3 testable acceptance criteria"
  estimated_fix_effort: "15 minutes"

metadata:
  created_at: 2026-04-05T12:30:00Z
  created_by_role: architect
  retry_count: 0
```

### Example 2: VERIFICATION_FAILURE (tester)

```yaml
artifact_id: ERR-20260405140000-def456
artifact_type: error-report

error_context:
  dispatch_id: disp-002
  task_id: task-test-001
  role: tester
  execution_phase: verification

error_classification:
  error_type: VERIFICATION_FAILURE
  error_subtype: assertion_fail
  severity: high

error_details:
  title: "Test assertion failed: login invalid credentials"
  description: "Expected error code 4001 for invalid credentials, but received 4000. This indicates a mismatch between spec and implementation."
  error_code: ERR-TEST-001
  stacktrace_or_context: "FAIL: test_login_invalid_credentials\nAssertionError: expected 4001, got 4000\nFile: tests/test_auth.py:45"

impact_assessment:
  blocking_points:
    - "Login error code mapping is incorrect"
  downstream_impact: blocked
  milestone_impact: at_risk

traceability:
  source_artifact: test-report-001
  source_file: tests/test_auth.py
  source_line: 45
  related_errors: []

resolution_guidance:
  auto_recoverable: false
  recommended_action: REWORK
  fix_suggestions:
    - "Update INVALID_CREDENTIALS error code to 4001 in src/errors/codes.py"
    - "Re-run test to verify fix"
  estimated_fix_effort: "10 minutes"

metadata:
  created_at: 2026-04-05T14:00:00Z
  created_by_role: tester
  retry_count: 1
```

### Example 3: ENVIRONMENT_ISSUE (common)

```yaml
artifact_id: ERR-20260405150000-ghi789
artifact_type: error-report

error_context:
  dispatch_id: disp-003
  task_id: task-dev-001
  role: developer
  execution_phase: execution

error_classification:
  error_type: ENVIRONMENT_ISSUE
  error_subtype: network_timeout
  severity: low

error_details:
  title: "Network timeout during dependency install"
  description: "npm install failed due to network timeout. This is a temporary environment issue."
  error_code: ERR-COM-001
  stacktrace_or_context: "npm ERR! network timeout at https://registry.npmjs.org"

impact_assessment:
  blocking_points: []
  downstream_impact: none
  milestone_impact: none

traceability:
  source_artifact: ""
  source_file: package.json
  source_line: null
  related_errors: []

resolution_guidance:
  auto_recoverable: true
  recommended_action: RETRY
  fix_suggestions:
    - "Retry npm install"
    - "Check network connectivity"
  estimated_fix_effort: "5 minutes"

metadata:
  created_at: 2026-04-05T15:00:00Z
  created_by_role: developer
  retry_count: 0
```

---

## References

- `io-contract.md` §2 - Execution Result Contract (issues_found 定义)
- `quality-gate.md` §2 - Severity Levels (S0-S3)
- `role-definition.md` - 各角色 Failure Modes
- `.opencode/skills/common/failure-analysis/SKILL.md` - 根因分析 skill
- `specs/017-contract-schema-pack/spec.md` - Contract Schema Pack 定义