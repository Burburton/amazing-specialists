# Feature: Error Reporter - Technical Design Plan

## Feature ID
`043-error-reporter`

## Version
`0.1.0`

## Status
`complete`

## Created
2026-04-05

---

## Architecture Summary

Error Reporter 是一个 **common skill**，为 6-role 执行层提供统一的错误报告生成能力。它作为 `failure-analysis` skill 的下游消费者，将分析结果转化为标准 `error-report` artifact 格式。

**核心定位**：
- **输入**: 角色执行过程中的错误信息、failure-analysis 输出
- **输出**: 标准化的 `error-report` artifact
- **消费者**: OpenClaw 管理层、execution-reporting skill、各角色 Execution Result

**架构位置**：
```
角色执行失败
  -> failure-analysis (根因分析)
    -> error-reporter (格式化输出)
      -> error-report artifact
        -> execution-reporting (issues_found 输入)
          -> Execution Result
```

---

## Inputs from Spec

### FR-001: Error Report Artifact Contract
定义新 artifact type: `error-report`，包含完整 schema（见 spec.md）。

### FR-002: Error Taxonomy Definition
- 8 种 Error Type（INPUT_INVALID, CONSTRAINT_VIOLATION 等）
- 4 级 Severity（low/medium/high/critical）
- Escalation Threshold 规则
- Error Code Prefix 分配（ERR-ARCH/ERR-DEV 等）

### FR-003: Error Reporter Skill
- Skill Location: `.opencode/skills/common/error-reporter/SKILL.md`
- 与 failure-analysis 协作关系：failure-analysis 分析根因，error-reporter 格式化输出

### FR-004: Execution Result Enhancement
增强 io-contract.md 中 `issues_found` 字段，添加：
- `error_report_id` - 关联 error-report artifact
- `error_type` - 错误类型
- `auto_recoverable` - 是否可自动恢复
- `traceability` - 追溯信息

### FR-005: Contract Schema Pack Integration
- 新增: `contracts/pack/common/error-report.schema.json`
- 更新: `contracts/pack/registry.json`

### FR-006: Role Failure Modes Reference
为 role-definition.md 中各角色 failure modes 添加 error type 映射。

---

## Technical Constraints

### TC-001: Dependencies
- Node.js 18+ (现有环境)
- 现有 Contract Schema Pack 架构（contracts/pack/）
- 现有 failure-analysis skill（不修改）
- 现有 execution-reporting skill（作为下游消费）

### TC-002: File Locations
| 类型 | 路径 |
|------|------|
| Skill Definition | `.opencode/skills/common/error-reporter/SKILL.md` |
| Contract Schema | `contracts/pack/common/error-report.schema.json` |
| Contract Registry | `contracts/pack/registry.json` (更新) |
| io-contract Update | `io-contract.md` §2 issues_found |
| role-definition Update | `role-definition.md` 各角色 Failure Modes |

### TC-003: Backward Compatibility
- issues_found enhancement 使用可选字段，现有 consumer 可忽略
- failure-analysis 输出格式不变，error-reporter 作为下游消费
- 新 error-report artifact 不影响现有 artifact types

---

## Module Decomposition

### M1: Error Report Contract & Taxonomy

**交付物**:
- `specs/043-error-reporter/contracts/error-report-contract.md` - Markdown 契约定义
- Error Taxonomy 文档化（嵌入 contract）

**模块职责**:
- 定义 error-report artifact schema
- 定义 Error Type Taxonomy（8 种类型 + severity threshold）
- 定义 Error Code Prefix 分配规则

### M2: Error Reporter Skill

**交付物**:
- `.opencode/skills/common/error-reporter/SKILL.md`

**Skill 结构**:
```yaml
Skill: error-reporter
Purpose: 将角色执行错误转化为标准 error-report artifact

Inputs:
  Required:
    - error_context (role, phase, dispatch_id, task_id)
    - error_description (title, description, what happened)
  Optional:
    - failure_analysis_output (来自 failure-analysis)
    - source_artifact (触发错误的 artifact)
    - stacktrace_or_context

Steps:
  1. 收集错误信息
  2. 分类错误类型 (match Error Taxonomy)
  3. 评估严重级别 (severity + impact assessment)
  4. 生成推荐动作 (recommended_action)
  5. 构建追溯链 (traceability)
  6. 输出 error-report artifact

Outputs:
  - error-report artifact (符合 contract)
```

### M3: Contract Schema Pack Integration

**交付物**:
- `contracts/pack/common/error-report.schema.json`
- `contracts/pack/registry.json` (添加 ERR-001 条目)

**Schema 设计**:
- 基于 spec.md FR-001 中的 YAML schema 转换为 JSON Schema Draft 2020-12
- 遵循现有 schema 格式（参考 design-note.schema.json）

### M4: Documentation & Integration

**交付物**:
- `io-contract.md` §2 issues_found enhancement
- `role-definition.md` 各角色 Failure Modes + error code 映射

**更新内容**:
- io-contract.md: 添加 issues_found enhanced fields 说明
- role-definition.md: 为 architect/developer/tester/reviewer docs/security 添加 Error Type + Error Code 列

---

## Data Flow

### 标准错误报告流程

```
1. 角色执行失败
   |
2. failure-analysis 分析根因
   | 输出: failure_analysis report
   |
3. error-reporter 格式化
   | 输入: error_context + failure_analysis_output
   | 输出: error-report artifact
   |
4. execution-reporting 汇总
   | 输入: error-report
   | 输出: issues_found (enhanced)
   |
5. Execution Result
   | 包含: issues_found with error_report_id
   |
6. OpenClaw 管理层消费
   | 根据 error_type + severity + recommended_action 决策
```

### Error Type 分类逻辑

```typescript
function classifyErrorType(context: ErrorContext): ErrorType {
  // INPUT_INVALID: 输入缺失/无效
  if (missingInput || invalidInput) return 'INPUT_INVALID';
  
  // CONSTRAINT_VIOLATION: 违反硬约束
  if (violatesConstraint) return 'CONSTRAINT_VIOLATION';
  
  // EXECUTION_ERROR: 执行过程错误
  if (executionFailure) return 'EXECUTION_ERROR';
  
  // VERIFICATION_FAILURE: 验证失败
  if (verificationFail) return 'VERIFICATION_FAILURE';
  
  // ENVIRONMENT_ISSUE: 环境问题
  if (environmentBlocker) return 'ENVIRONMENT_ISSUE';
  
  // DEPENDENCY_BLOCKER: 依赖阻塞
  if (dependencyMissing) return 'DEPENDENCY_BLOCKER';
  
  // AMBIGUOUS_GOAL: 目标模糊
  if (ambiguousGoal) return 'AMBIGUOUS_GOAL';
  
  // SCOPE_CREEP_DETECTED: 范围蔓延
  if (scopeCreep) return 'SCOPE_CREEP_DETECTED';
}
```

### Severity Threshold to Escalation

| Severity | Threshold | Implementation |
|----------|-----------|----------------|
| low | Never | `auto_recoverable: true`, `recommended_action: IGNORE` |
| medium | retry_count >= 2 | 检查 retry_count，达到阈值触发 ESCALATE |
| high | retry_count >= 1 | 检查 retry_count，达到阈值触发 ESCALATE |
| critical | Immediate | 直接设置 `recommended_action: ESCALATE` |

---

## Failure Handling

### Skill Failure Modes

| 失败模式 | 处理 |
|----------|------|
| error_type 分类不确定 | 设置 error_subtype 为 "UNCLASSIFIED"，记录 ambiguity |
| severity 评估困难 | 默认 medium，建议人工审查 |
| traceability 不完整 | 标注 `trace_incomplete: true` |
| 缺少 failure_analysis 输入 | 基于原始错误信息生成简略 report |

### 输出验证

**Self-Check Checklist**:
- [ ] error_report_id 格式正确
- [ ] error_type 符合 Taxonomy 定义
- [ ] severity 符合 quality-gate.md S0-S3 映射
- [ ] recommended_action 与 severity + retry_count 一致
- [ ] traceability 包含至少一个来源引用

---

## Validation Strategy

### M1 Validation: Contract & Taxonomy
- Schema validation: 使用 JSON Schema validator 验证 error-report.schema.json
- Taxonomy 完整性检查: 所有 8 种 Error Type + 4 级 Severity 定义完整

### M2 Validation: Skill Implementation
- 输入输出测试: 验证 skill 能正确生成 error-report artifact
- 分类准确性测试: 验证 error_type 分类逻辑
- Severity 评估测试: 验证 severity threshold 规则

### M3 Validation: Schema Pack Integration
- Registry 更新验证: 确认 ERR-001 条目正确添加
- Schema discovery 测试: 验证 registry.json 可查询 error-report contract

### M4 Validation: Documentation Integration
- io-contract.md 一致性: issues_found enhanced 字段与 error-report schema 对齐
- role-definition.md 一致性: 各角色 Error Code 映射正确

---

## Risks / Tradeoffs

### Risk-001: Error Type Classification Accuracy (spec 已识别)
- **Mitigation**: 提供手动 override 机制，记录分类准确率指标
- **Implementation**: 在 error-report schema 中添加 `classification_confidence` 字段（可选）

### Risk-002: Severity Threshold Calibration (spec 已识别)
- **Mitigation**: 初期保守阈值，后续根据运行数据优化
- **Implementation**: threshold 规则嵌入 skill 文档，可后续调整

### Risk-003: Backward Compatibility (spec 已识别)
- **Mitigation**: 使用可选字段，现有 consumer 可忽略新字段
- **Implementation**: issues_found enhancement 使用 `additionalProperties: true`

### Risk-004: failure-analysis 与 error-reporter 职责边界
- **问题**: failure-analysis 输出格式与 error-report 有重叠
- **决策**: failure-analysis 负责"根因分析"，error-reporter 负责"格式化输出"
- **Mitigation**: 在两 skill 文档中明确职责边界，避免重复工作

### Tradeoff-001: Error Code 集中管理 vs 分散定义
- **选项 A**: 在 taxonomy 文档中定义，各 skill 引用
- **选项 B**: 创建 `error-codes.json` 集中管理
- **决策**: 选择 A（spec 建议），减少额外文件，便于文档维护

### Tradeoff-002: Severity vs Quality Gate S0-S3
- **问题**: error-report severity 是否与 quality-gate S0-S3 完全一致？
- **决策**: 保持一致映射（low=S0, medium=S1, high=S2, critical=S3）
- **Implementation**: 在 skill 文档中明确映射关系

---

## Requirement Traceability

| Requirement | Design Decision | Artifact Section |
|-------------|-----------------|-------------------|
| FR-001 | error-report artifact schema 定义 | contracts/error-report-contract.md |
| FR-002 | Error Taxonomy 定义 | contracts/error-report-contract.md §Error Taxonomy |
| FR-003 | error-reporter SKILL.md | .opencode/skills/common/error-reporter/SKILL.md |
| FR-004 | issues_found enhancement | io-contract.md §2 update |
| FR-005 | Schema Pack integration | contracts/pack/common/error-report.schema.json |
| FR-006 | Role Failure Modes update | role-definition.md update |

### Acceptance Criteria Traceability

| AC | Validation Method | Milestone |
|----|-------------------|-----------|
| AC-001 | Schema validation + spec alignment check | M1 |
| AC-002 | Taxonomy completeness check | M1 |
| AC-003 | SKILL.md review + input/output test | M2 |
| AC-004 | Schema validation + registry update test | M3 |
| AC-005 | io-contract.md + role-definition.md review | M4 |

---

## Open Questions Resolutions

### OQ-001: Error Report vs Failure Analysis Output
- **决策**: 选择 A - failure-analysis 分析根因，error-reporter 格式化输出
- **实现**: error-reporter 可消费 failure_analysis_output 作为输入，但职责分离

### OQ-002: Error Code 管理
- **决策**: 选择 A - 在 taxonomy 文档中定义，各 skill 引用
- **实现**: Error Code 定义嵌入 error-report-contract.md

### OQ-003: Severity vs Quality Gate S0-S3
- **决策**: 保持一致映射
- **映射**: low=S0, medium=S1, high=S2, critical=S3

---

## Assumptions

### A-001: 上游管理层消费能力 (spec 已识别)
- 假设 OpenClaw 管理层能解析标准 error-report 格式
- 如果不能，需在上游增加 adapter

### A-002: 角色执行错误频率 (spec 已识别)
- 假设大部分执行成功，错误报告为少数情况
- 如果错误频繁，可能需要调整架构

### A-003: 错误追溯链完整性 (spec 已识别)
- 假设大部分错误能追溯到 source_artifact
- 如果追溯链不完整，error-report 应标注 "trace_incomplete"

### A-004: failure-analysis skill 输出可用
- 假设 failure-analysis skill 输出格式稳定
- error-reporter 可直接消费其输出

---

## Implementation Order

1. **M1**: Error Report Contract & Taxonomy（定义基准）
2. **M3**: Contract Schema Pack Integration（创建 schema 文件）
3. **M2**: Error Reporter Skill（实现 skill）
4. **M4**: Documentation & Integration（更新治理文档）

**原因**: 先定义 contract，再实现 skill，最后集成到治理文档。

---

## Next Recommended Command

```
/spec-tasks 043-error-reporter
```

生成可执行任务列表。