# Skill: error-reporter

## Skill Name
`error-reporter`

## Version
`1.0.0`

## Producer Role
`common` (所有角色可用)

## Purpose

将角色执行中的错误信息转化为标准 `error-report` artifact，确保管理层能稳定消费执行层错误信息，做出准确的流程决策。

**核心职责**：
- 将错误信息标准化为统一格式
- 分类错误类型（符合 Error Taxonomy）
- 评估严重级别和影响
- 生成推荐处理动作
- 构建完整追溯链

**与 failure-analysis 的关系**：
- failure-analysis 分析根因，输出 failure_type、root_cause、recommendation
- error-reporter 格式化输出，转化为标准 error-report artifact
- 职责分离，避免重复工作

---

## When to Use

| 场景 | 是否使用 | 说明 |
|------|---------|------|
| 角色执行失败 | ✅ 是 | 任何角色执行失败时生成 error-report |
| 验证未通过 | ✅ 是 | tester/reviewer 验证失败时 |
| 输入缺失/无效 | ✅ 是 | 无法继续执行时 |
| 环境阻塞 | ✅ 是 | 环境/依赖问题导致阻塞 |
| 目标模糊 | ✅ 是 | architect 无法明确设计目标时 |
| 范围蔓延检测 | ✅ 是 | reviewer 检测到超出 spec 的范围 |

---

## Inputs

### Required Inputs

| Input | Type | Description | Source |
|-------|------|-------------|--------|
| `error_context` | object | 错误发生的上下文 | 当前执行状态 |
| `error_description` | object | 错误描述信息 | 错误来源 |

**error_context 结构**：
```yaml
dispatch_id: string          # 关联的 dispatch ID
task_id: string              # 关联的 task ID  
role: string                 # 报告角色 (architect/developer/tester/reviewer/docs/security)
execution_phase: string      # 执行阶段 (preparation/execution/verification/output)
```

**error_description 结构**：
```yaml
title: string                # 错误标题（简短）
description: string          # 详细描述（发生了什么）
what_happened: string        # 具体发生了什么
```

### Optional Inputs

| Input | Type | Description | Source |
|-------|------|-------------|--------|
| `failure_analysis_output` | object | failure-analysis skill 的输出 | failure-analysis skill |
| `source_artifact` | string | 触发错误的 artifact ID | artifact-reading |
| `source_file` | string | 触发错误的文件路径 | 文件系统 |
| `stacktrace_or_context` | string | 相关日志/堆栈/上下文 | 执行过程 |

**failure_analysis_output 结构**（可选输入）：
```yaml
failure_type: string         # failure-analysis 输出的失败类型
root_cause: string           # 根因分析结果
recommendation: string       # failure-analysis 推荐动作
```

---

## Steps

### Step 1: 收集错误信息

**目标**：收集完整的错误上下文信息。

**活动**：
1. 从当前执行状态提取 dispatch_id、task_id、role、execution_phase
2. 收集错误描述（title、description、what_happened）
3. 如有 failure_analysis_output，提取 failure_type 和 root_cause
4. 确定错误来源（source_artifact 或 source_file）

**输出**：完整的 error_context 和 error_description。

---

### Step 2: 分类错误类型

**目标**：根据 Error Taxonomy 确定错误类型。

**分类逻辑**：

```typescript
function classifyErrorType(context: ErrorContext, errorDesc: ErrorDescription): ErrorType {
  // INPUT_INVALID: 输入缺失/无效
  if (context.execution_phase === 'preparation' && 
      (missingInput || invalidInput || missingContext)) {
    return 'INPUT_INVALID';
  }
  
  // CONSTRAINT_VIOLATION: 违反硬约束
  if (errorDesc.what_happened.includes('constraint') ||
      errorDesc.what_happened.includes('violation') ||
      violatesCodingRules) {
    return 'CONSTRAINT_VIOLATION';
  }
  
  // EXECUTION_ERROR: 执行过程错误
  if (context.execution_phase === 'execution' &&
      (executionFailure || runtimeError)) {
    return 'EXECUTION_ERROR';
  }
  
  // VERIFICATION_FAILURE: 验证失败
  if (context.execution_phase === 'verification' &&
      (testFailed || assertionFailed || reviewFailed)) {
    return 'VERIFICATION_FAILURE';
  }
  
  // ENVIRONMENT_ISSUE: 环境问题
  if (errorDesc.what_happened.includes('timeout') ||
      errorDesc.what_happened.includes('network') ||
      errorDesc.what_happened.includes('environment') ||
      dependencyUnavailable) {
    return 'ENVIRONMENT_ISSUE';
  }
  
  // DEPENDENCY_BLOCKER: 依赖阻塞
  if (errorDesc.what_happened.includes('dependency') ||
      errorDesc.what_happened.includes('blocked by') ||
      upstreamArtifactMissing) {
    return 'DEPENDENCY_BLOCKER';
  }
  
  // AMBIGUOUS_GOAL: 目标模糊
  if (context.role === 'architect' &&
      (unclearGoal || conflictingRequirements)) {
    return 'AMBIGUOUS_GOAL';
  }
  
  // SCOPE_CREEP_DETECTED: 范围蔓延
  if (context.role === 'reviewer' &&
      (scopeExpansion || beyondSpec)) {
    return 'SCOPE_CREEP_DETECTED';
  }
  
  // 默认：EXECUTION_ERROR
  return 'EXECUTION_ERROR';
}
```

**Error Type Taxonomy 参考**：

| Error Type | 定义 | Auto-Recoverable | 推荐 Action |
|------------|------|------------------|-------------|
| INPUT_INVALID | 输入缺失或无效 | false | REWORK/ESCALATE |
| CONSTRAINT_VIOLATION | 违反硬约束 | false | REWORK |
| EXECUTION_ERROR | 执行过程错误 | maybe | REWORK/RETRY |
| VERIFICATION_FAILURE | 验证失败 | false | REWORK |
| ENVIRONMENT_ISSUE | 环境问题 | true | RETRY |
| DEPENDENCY_BLOCKER | 依赖阻塞 | false | ESCALATE |
| AMBIGUOUS_GOAL | 目标模糊 | false | ESCALATE |
| SCOPE_CREEP_DETECTED | 范围蔓延 | false | REPLAN |

---

### Step 3: 评估严重级别

**目标**：根据影响范围和紧迫性确定 severity。

**评估逻辑**：

```typescript
function evaluateSeverity(errorType: ErrorType, impact: ImpactAssessment, retryCount: number): Severity {
  // ENVIRONMENT_ISSUE 通常为 low
  if (errorType === 'ENVIRONMENT_ISSUE') return 'low';
  
  // DEPENDENCY_BLOCKER 和 AMBIGUOUS_GOAL 通常为 critical 或 high
  if (errorType === 'DEPENDENCY_BLOCKER') return 'critical';
  if (errorType === 'AMBIGUOUS_GOAL') return 'high';
  
  // 根据影响评估
  if (impact.milestone_impact === 'blocked') return 'critical';
  if (impact.downstream_impact === 'blocked' || impact.downstream_impact === 'cascading') return 'high';
  
  // 根据返工次数提升 severity
  if (retryCount >= 2) return 'high';
  if (retryCount >= 1 && errorType !== 'INPUT_INVALID') return 'medium';
  
  // 默认
  return 'medium';
}
```

**Severity 到 Escalation Threshold**：

| Severity | Threshold | 说明 |
|----------|-----------|------|
| low | Never | 始终不升级 |
| medium | retry_count >= 2 | 返工 2 次后升级 |
| high | retry_count >= 1 | 返工 1 欍后升级 |
| critical | Immediate | 立即升级 |

**Severity 到 Quality Gate Mapping**：

| error-report severity | quality-gate.md level |
|-----------------------|----------------------|
| low | S0 - Trivial |
| medium | S1 - Minor |
| high | S2 - Major |
| critical | S3 - Critical |

---

### Step 4: 生成推荐动作

**目标**：根据 error_type + severity + retry_count 确定 recommended_action。

**决策逻辑**：

```typescript
function determineRecommendedAction(
  errorType: ErrorType, 
  severity: Severity, 
  autoRecoverable: boolean,
  retryCount: number
): RecommendedAction {
  // ENVIRONMENT_ISSUE: RETRY
  if (errorType === 'ENVIRONMENT_ISSUE') return 'RETRY';
  
  // DEPENDENCY_BLOCKER: ESCALATE
  if (errorType === 'DEPENDENCY_BLOCKER') return 'ESCALATE';
  
  // AMBIGUOUS_GOAL: ESCALATE
  if (errorType === 'AMBIGUOUS_GOAL') return 'ESCALATE';
  
  // SCOPE_CREEP_DETECTED: REPLAN
  if (errorType === 'SCOPE_CREEP_DETECTED') return 'REPLAN';
  
  // Severity-based decision
  if (severity === 'critical') return 'ESCALATE';
  
  // Retry threshold for medium severity
  if (severity === 'medium' && retryCount >= 2) return 'ESCALATE';
  
  // Retry threshold for high severity  
  if (severity === 'high' && retryCount >= 1) return 'ESCALATE';
  
  // Low severity: IGNORE
  if (severity === 'low') return 'IGNORE';
  
  // Default: REWORK
  return 'REWORK';
}
```

---

### Step 5: 构建追溯链

**目标**：确保错误能追溯到具体来源。

**活动**：
1. 确定 source_artifact（如 test-report, implementation-summary）
2. 确定 source_file（如 specs/my-feature/spec.md）
3. 确定 source_line（如具体行号）
4. 收集 related_errors（关联的其他错误）

**追溯链完整性规则**：
- 必须包含至少一个追溯来源（source_artifact 或 source_file）
- 如果追溯链不完整，标注 trace_incomplete（在 error_subtype 中）

---

### Step 6: 输出 error-report artifact

**目标**：生成符合 contract 的 error-report artifact。

**输出结构**：
```yaml
artifact_id: ERR-[timestamp]-[random]
artifact_type: error-report

error_context:
  dispatch_id: [from input]
  task_id: [from input]
  role: [from input]
  execution_phase: [from input]

error_classification:
  error_type: [classified in step 2]
  error_subtype: [refined description]
  severity: [evaluated in step 3]

error_details:
  title: [from input]
  description: [from input]
  error_code: [generated based on role]
  stacktrace_or_context: [from optional input]

impact_assessment:
  blocking_points: [identified issues]
  downstream_impact: [evaluated impact]
  milestone_impact: [evaluated impact]

traceability:
  source_artifact: [from step 5]
  source_file: [from step 5]
  source_line: [from step 5]
  related_errors: [from step 5]

resolution_guidance:
  auto_recoverable: [based on error_type]
  recommended_action: [from step 4]
  fix_suggestions: [generated suggestions]
  estimated_fix_effort: [estimated]

metadata:
  created_at: [current timestamp]
  created_by_role: [role from input]
  retry_count: [from input or default 0]
```

---

## Outputs

### Primary Output

| Output | Type | Description |
|--------|------|-------------|
| `error-report` | artifact | 标准 error-report artifact，符合 error-report-contract.md |

---

## Error Code Generation

**Error Code 格式**: `ERR-[ROLE]-[NUMBER]`

| Role | Prefix | 示例 Error Codes |
|------|--------|------------------|
| architect | ERR-ARCH | ERR-ARCH-001 (输入不足), ERR-ARCH-002 (需求冲突) |
| developer | ERR-DEV | ERR-DEV-001 (依赖缺失), ERR-DEV-002 (约束违规) |
| tester | ERR-TEST | ERR-TEST-001 (覆盖缺口), ERR-TEST-002 (失败未分类) |
| reviewer | ERR-REV | ERR-REV-001 (Spec对齐失败), ERR-REV-002 (Governance drift) |
| docs | ERR-DOC | ERR-DOC-001 (证据缺失), ERR-DOC-002 (状态漂移) |
| security | ERR-SEC | ERR-SEC-001 (权限检查失败), ERR-SEC-002 (依赖风险) |
| common | ERR-COM | ERR-COM-001 (输入无效) |

**Error Code Assignment Logic**:
```typescript
function generateErrorCode(role: string, errorType: ErrorType): string {
  // 参考 error-report-contract.md §Role Failure Modes Error Type Mapping
  const mappings = {
    architect: {
      INPUT_INVALID: 'ERR-ARCH-001',
      AMBIGUOUS_GOAL: 'ERR-ARCH-002'
    },
    developer: {
      INPUT_INVALID: 'ERR-DEV-001',
      CONSTRAINT_VIOLATION: 'ERR-DEV-002',
      ENVIRONMENT_ISSUE: 'ERR-DEV-003'
    },
    tester: {
      VERIFICATION_FAILURE: 'ERR-TEST-001',
      EXECUTION_ERROR: 'ERR-TEST-002',
      ENVIRONMENT_ISSUE: 'ERR-TEST-003'
    },
    reviewer: {
      VERIFICATION_FAILURE: 'ERR-REV-001',
      CONSTRAINT_VIOLATION: 'ERR-REV-002'
    },
    docs: {
      INPUT_INVALID: 'ERR-DOC-001',
      VERIFICATION_FAILURE: 'ERR-DOC-002'
    },
    security: {
      VERIFICATION_FAILURE: 'ERR-SEC-001',
      DEPENDENCY_BLOCKER: 'ERR-SEC-002'
    },
    common: {
      INPUT_INVALID: 'ERR-COM-001'
    }
  };
  
  return mappings[role]?.[errorType] || `ERR-COM-001`;
}
```

---

## Self-Check Checklist

完成 error-report 生成后，验证以下项：

- [ ] artifact_id 格式正确 (`ERR-[timestamp]-[random]`)
- [ ] artifact_type 为 `error-report`
- [ ] error_type 符合 Taxonomy 定义（8 种类型之一）
- [ ] severity 符合 quality-gate.md S0-S3 映射
- [ ] recommended_action 与 severity + retry_count 一致
- [ ] error_code 符合 `ERR-[ROLE]-[NUMBER]` 格式
- [ ] error_code ROLE 与 error_context.role 对应
- [ ] traceability 包含至少一个来源引用
- [ ] auto_recoverable 与 error_type 一致（如 ENVIRONMENT_ISSUE=true）

---

## Examples

### Example 1: INPUT_INVALID (architect)

**输入**：
```yaml
error_context:
  dispatch_id: disp-001
  task_id: task-arch-001
  role: architect
  execution_phase: preparation

error_description:
  title: "Missing spec section"
  description: "spec.md does not contain Acceptance Criteria section"
  what_happened: "Reading spec.md found empty Acceptance Criteria section at line 45"

source_file: specs/my-feature/spec.md
source_line: 45
```

**输出**：
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
  source_artifact: ""
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

---

### Example 2: VERIFICATION_FAILURE (tester)

**输入**：
```yaml
error_context:
  dispatch_id: disp-002
  task_id: task-test-001
  role: tester
  execution_phase: verification

error_description:
  title: "Test assertion failed"
  description: "Expected error code 4001 but received 4000"
  what_happened: "test_login_invalid_credentials assertion failed"

failure_analysis_output:
  failure_type: assertion_fail
  root_cause: "Error code mapping mismatch between spec and implementation"
  recommendation: "Update error code in implementation"

source_file: tests/test_auth.py
source_line: 45
```

**输出**：
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
  source_artifact: ""
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

---

### Example 3: ENVIRONMENT_ISSUE (developer)

**输入**：
```yaml
error_context:
  dispatch_id: disp-003
  task_id: task-dev-001
  role: developer
  execution_phase: execution

error_description:
  title: "Network timeout"
  description: "npm install failed due to network timeout"
  what_happened: "npm install timeout at registry.npmjs.org"

source_file: package.json
```

**输出**：
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
  error_code: ERR-DEV-003
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

## Integration Notes

### 与 failure-analysis 协作

**协作流程**：
```
角色执行失败
  -> failure-analysis (根因分析)
    -> 输出: failure_type, root_cause, recommendation
  -> error-reporter (格式化输出)
    -> 输入: error_context + failure_analysis_output (可选)
    -> 输出: error-report artifact
```

**职责边界**：
- failure-analysis: 分析根因、分类失败类型、给出推荐动作
- error-reporter: 格式化输出、生成标准 artifact、构建追溯链

### 与 execution-reporting 协作

**协作流程**：
```
error-report artifact
  -> execution-reporting
    -> 输入: error-report 作为 issues_found 的来源
    -> 输出: Execution Result (包含 issues_found)
```

**issues_found 增强**：
```yaml
issues_found:
  - issue_id: string
    error_report_id: string       # 关联 error-report artifact ID
    severity: enum                # 与 error-report severity 对齐
    error_type: enum              # 错误类型
    description: string
    recommendation: string
    auto_recoverable: boolean     # 是否可自动恢复
    traceability:                 # 追溯信息
      source_artifact: string
      source_file: string
```

---

## References

- `specs/043-error-reporter/contracts/error-report-contract.md` - Error Report 契约定义
- `contracts/pack/common/error-report.schema.json` - JSON Schema
- `.opencode/skills/common/failure-analysis/SKILL.md` - failure-analysis skill
- `.opencode/skills/common/execution-reporting/SKILL.md` - execution-reporting skill
- `io-contract.md` §2 - Execution Result Contract
- `quality-gate.md` §2 - Severity Levels (S0-S3)
- `role-definition.md` - 各角色 Failure Modes