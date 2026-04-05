# Feature: Error Reporter

## Feature ID
`043-error-reporter`

## Status
`complete`

## Version
`0.1.0`

## Created
2026-04-05

## Overview

### Goal
建立统一的错误报告机制，为 6-role 执行层提供标准化的错误收集、分类和输出格式，确保管理层（OpenClaw）能稳定消费执行层错误信息，做出准确的流程决策。

### Background
当前执行层有以下错误处理机制：

1. **io-contract.md** 定义了 Execution Result 的 status 字段（SUCCESS/BLOCKED/FAILED_RETRYABLE/FAILED_ESCALATE），但未标准化错误详情格式
2. **failure-analysis** skill 分类失败类型，但输出格式未与 artifact contract 对齐
3. **各角色 failure modes** 在 role-definition.md 中定义，但分散且不一致
4. **Escalation Contract** 定义了升级格式，但缺少从普通错误到升级的触发阈值
5. **issues_found** 在 Execution Result 中存在，但缺少 severity taxonomy 统一定义

**痛点：**
- 上游管理层难以区分"可自动处理的错误"和"需人工介入的错误"
- 不同角色输出的错误格式不一致，增加消费复杂度
- 错误追溯链不完整，难以从错误定位到具体 artifact/task
- 错误严重性评估缺少统一标准，导致 escalation 判断偏差

### Scope

**In Scope:**
- Error Artifact Contract 定义（`error-report` artifact）
- Error Taxonomy 定义（错误类型、严重级别、处理路径分类）
- Error Reporter Skill 实现（common skill）
- 与现有 io-contract.md 的集成（Execution Result issues_found 增强）
- 与 failure-analysis skill 的协作关系
- Error Report Schema（JSON Schema 添加到 Contract Schema Pack）

**Out of Scope:**
- 改变现有 Escalation/Rework Contract 格式
- 改变现有 role failure modes 定义
- 自动错误修复决策（由 failure-analysis + retry-strategy 处理）
- 错误可视化或 Dashboard（上层职责）
- 多项目错误聚合（上层职责）

---

## Requirements

### Functional Requirements

#### FR-001: Error Report Artifact Contract

定义新的 artifact type：`error-report`，作为角色执行错误的标准输出格式。

**Artifact Schema:**

```yaml
error-report:
  artifact_id: string              # 唯一 ID
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
    error_type: enum               # 错误类型（参考 Error Taxonomy）
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
      - low        # 可忽略/建议
      - medium     # 影响当前 task
      - high       # 阻塞下游或 milestone
      - critical   # 阻塞整个流程，需升级
    
  error_details:
    title: string                  # 错误标题（简短）
    description: string            # 详细描述（发生了什么）
    error_code: string             # 错误码（如 ERR-DEV-001）
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
    created_at: timestamp
    created_by_role: string
    retry_count: number            # 当前返工次数
```

#### FR-002: Error Taxonomy Definition

定义统一的错误分类标准，供所有角色使用。

**Error Type Taxonomy:**

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

**Severity Threshold to Escalation:**

| Severity | Escalation Threshold | 说明 |
|----------|---------------------|------|
| low | Never | 始终不升级 |
| medium | retry_count >= 2 | 返工 2 次后升级 |
| high | retry_count >= 1 | 返工 1 次后升级 |
| critical | Immediate | 立即升级 |

**Error Code Prefix per Role:**

| Role | Prefix | 示例 |
|------|--------|------|
| architect | ERR-ARCH | ERR-ARCH-001: Missing context |
| developer | ERR-DEV | ERR-DEV-001: Constraint violation |
| tester | ERR-TEST | ERR-TEST-001: Assertion fail |
| reviewer | ERR-REV | ERR-REV-001: Spec mismatch |
| docs | ERR-DOC | ERR-DOC-001: Missing evidence |
| security | ERR-SEC | ERR-SEC-001: Auth issue |
| common | ERR-COM | ERR-COM-001: Input invalid |

#### FR-003: Error Reporter Skill

新增 common skill：`error-reporter`，用于标准化错误报告生成。

**Skill Purpose:**
- 将角色执行中的错误信息转化为标准 error-report artifact
- 确保错误分类符合 Taxonomy 定义
- 自动判断 severity 和 recommended_action

**Skill Location:**
`.opencode/skills/common/error-reporter/SKILL.md`

**Skill Integration:**
- 与 `failure-analysis` 协作：failure-analysis 分析根因，error-reporter 格式化输出
- 与 `execution-reporting` 协作：error-report 作为 Execution Result 的 issues_found 输入

#### FR-004: Execution Result Enhancement

增强 `io-contract.md` 中 Execution Result 的 `issues_found` 字段。

**Before (Current):**
```yaml
issues_found:
  - issue_id: string
    severity: enum (critical/high/medium/low)
    description: string
    recommendation: string
```

**After (Enhanced):**
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

#### FR-005: Contract Schema Pack Integration

将 `error-report` schema 添加到 Contract Schema Pack。

**新增文件:**
- `contracts/pack/common/error-report.schema.json`

**Registry Update:**
在 `contracts/pack/registry.json` 中添加：
```json
{
  "contract_id": "ERR-001",
  "artifact_type": "error-report",
  "role": "common",
  "schema_path": "common/error-report.schema.json",
  "description": "Error Report Contract - Unified error output format",
  "version": "1.0.0"
}
```

#### FR-006: Role Failure Modes Reference

为各角色的 failure modes 添加 error type 映射。

**architect Failure Modes:**
| Failure Mode | Error Type | Error Code |
|--------------|------------|------------|
| 输入不足 | INPUT_INVALID | ERR-ARCH-001 |
| 需求冲突 | AMBIGUOUS_GOAL | ERR-ARCH-002 |
| 术语不清 | INPUT_INVALID | ERR-ARCH-003 |
| 上下文缺失 | INPUT_INVALID | ERR-ARCH-004 |
| 约束冲突 | AMBIGUOUS_GOAL | ERR-ARCH-005 |

**developer Failure Modes:**
| Failure Mode | Error Type | Error Code |
|--------------|------------|------------|
| 依赖上下文缺失 | INPUT_INVALID | ERR-DEV-001 |
| 设计与现状冲突 | CONSTRAINT_VIOLATION | ERR-DEV-002 |
| 环境阻塞 | ENVIRONMENT_ISSUE | ERR-DEV-003 |
| 范围不清 | SCOPE_CREEP_DETECTED | ERR-DEV-004 |

**tester Failure Modes:**
| Failure Mode | Error Type | Error Code |
|--------------|------------|------------|
| 覆盖缺口 | VERIFICATION_FAILURE | ERR-TEST-001 |
| 失败未分类 | EXECUTION_ERROR | ERR-TEST-002 |
| 无法复现 | ENVIRONMENT_ISSUE | ERR-TEST-003 |

**reviewer Failure Modes:**
| Failure Mode | Error Type | Error Code |
|--------------|------------|------------|
| Spec 对齐失败 | VERIFICATION_FAILURE | ERR-REV-001 |
| Governance drift | CONSTRAINT_VIOLATION | ERR-REV-002 |

---

## Non-Functional Requirements

### NFR-001: Backward Compatibility
- 现有 Execution Result 格式保持兼容，issues_found enhancement 为可选扩展
- 现有 failure-analysis skill 输出格式不变，error-reporter 作为下游消费

### NFR-002: Performance
- Error report 生成 < 50ms
- Schema validation < 20ms

### NFR-003: Extensibility
- Error Taxonomy 可扩展（新增 error_type 需走 governance update 流程）
- Error Code 可按角色扩展

### NFR-004: Consistency
- 所有 error-report 必须符合 schema
- Severity 分类必须与 quality-gate.md S0-S3 映射

---

## Acceptance Criteria

### AC-001: Error Report Artifact Contract
- [ ] `error-report-contract.md` 定义完整 artifact schema
- [ ] Schema 包含所有必需字段
- [ ] 与 io-contract.md Execution Result 对齐

### AC-002: Error Taxonomy
- [ ] Error Type Taxonomy 定义完整
- [ ] Severity Threshold to Escalation 定义清晰
- [ ] Error Code Prefix 分配正确

### AC-003: Error Reporter Skill
- [ ] `.opencode/skills/common/error-reporter/SKILL.md` 创建
- [ ] Skill 包含完整的输入/输出定义
- [ ] Skill 包含 Error Type 分类逻辑

### AC-004: Contract Schema Pack Integration
- [ ] `contracts/pack/common/error-report.schema.json` 创建
- [ ] `contracts/pack/registry.json` 更新
- [ ] Schema validation 工具可验证 error-report

### AC-005: Documentation
- [ ] io-contract.md 更新 issues_found enhancement 说明
- [ ] role-definition.md 各角色 failure modes 添加 error code 映射

---

## Technical Constraints

### TC-001: Dependencies
- Node.js 18+
- 现有 Contract Schema Pack 架构
- 现有 failure-analysis skill（不修改）

### TC-002: File Locations
- `.opencode/skills/common/error-reporter/SKILL.md` - 新增 skill
- `contracts/pack/common/error-report.schema.json` - 新增 schema
- `contracts/pack/registry.json` - 更新
- `io-contract.md` - 更新 §2 issues_found 定义
- `role-definition.md` - 更新各角色 failure modes

---

## Dependencies

### Internal
- Feature 017: Contract Schema Pack（已完成）
- Feature 003-008: 6-role Core Features（已完成）
- failure-analysis common skill（已存在）

### External
- 无

---

## Risks

### Risk-001: Error Type Classification Accuracy
- **描述**: 自动分类错误类型可能不准确
- **影响**: escalation 判断偏差
- **缓解**: 提供手动 override 机制，记录分类准确率指标

### Risk-002: Severity Threshold Calibration
- **描述**: escalation threshold 需根据实际运行调整
- **影响**: 过度升级或升级不足
- **缓解**: 初期保守阈值，后续根据运行数据优化

### Risk-003: Backward Compatibility
- **描述**: issues_found enhancement 可能影响现有 consumer
- **影响**: 解析错误
- **缓解**: 使用可选字段，现有 consumer 可忽略新字段

---

## Milestones

### M1: Error Report Contract & Taxonomy
- 定义 error-report artifact contract
- 定义 Error Taxonomy
- 创建 error-report-contract.md

### M2: Error Reporter Skill
- 创建 error-reporter SKILL.md
- 定义 Skill 输入/输出/步骤
- 编写示例

### M3: Contract Schema Pack Integration
- 创建 error-report.schema.json
- 更新 registry.json
- 验证 schema

### M4: Documentation & Integration
- 更新 io-contract.md
- 更新 role-definition.md
- 验证 backward compatibility

---

## Open Questions

### OQ-001: Error Report vs Failure Analysis Output
- **问题**: error-report 和 failure-analysis 输出如何区分？
- **选项 A**: failure-analysis 分析根因，error-reporter 格式化输出
- **选项 B**: failure-analysis 输出作为 error-report 的输入
- **建议**: 选择 A，保持职责分离

### OQ-002: Error Code 管理
- **问题**: Error Code 是否需要集中管理文件？
- **选项 A**: 在 taxonomy 文档中定义，各 skill 引用
- **选项 B**: 创建 `error-codes.json` 集中管理
- **建议**: 选择 A，减少额外文件

### OQ-003: Severity vs Quality Gate S0-S3
- **问题**: error-report severity 是否与 quality-gate S0-S3 完全一致？
- **当前**: low=S0, medium=S1, high=S2, critical=S3
- **建议**: 保持一致，便于审计层统一消费

---

## Assumptions

### A-001: 上游管理层消费能力
- 假设 OpenClaw 管理层能解析标准 error-report 格式
- 如果不能，需在上游增加 adapter

### A-002: 角色执行错误频率
- 假设大部分执行成功，错误报告为少数情况
- 如果错误频繁，可能需要调整架构

### A-003: 错误追溯链完整性
- 假设大部分错误能追溯到 source_artifact
- 如果追溯链不完整，error-report 应标注"trace incomplete"

---

## References

- `io-contract.md` - Execution Result Contract
- `role-definition.md` - 各角色 Failure Modes
- `quality-gate.md` - Severity Levels (S0-S3)
- `.opencode/skills/common/failure-analysis/SKILL.md` - 现有 failure analysis skill
- `specs/017-contract-schema-pack/spec.md` - Contract Schema Pack 定义