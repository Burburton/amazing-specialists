# I/O Contract

本文件定义 OpenCode 专家包与 OpenClaw 管理层之间的完整输入输出契约。

---

## 1. Dispatch Input Contract

### Contract Name
Dispatch Payload - 管理层向执行层派发的统一任务包

### Purpose
为 OpenClaw 管理层提供标准化的任务派发格式，确保所有角色接收结构化的任务定义、上下文和约束条件。

### Input Schema

```yaml
dispatch_id: string              # 本次派发唯一 ID（UUID 或语义化 ID）
project_id: string               # 项目 ID
milestone_id: string             # 当前 milestone ID
task_id: string                  # 目标 task ID

role: enum                       # 目标执行角色
  - architect
  - developer
  - tester
  - reviewer
  - docs
  - security

command: string                  # 指定命令入口
  # architect: design-task, evaluate-tradeoff, design-review
  # developer: implement-task, fix-task, refactor-task
  # tester: test-task, regression-task, verify-edge-cases
  # reviewer: review-task, compare-spec-vs-code, risk-review
  # docs: sync-readme, update-docs, write-changelog
  # security: security-check, permission-review, dependency-risk-review

title: string                    # 任务标题（人类可读）
goal: string                     # 该任务必须达成的结果（一句话定义成功标准）
description: string              # 任务详细说明

context:                         # 摘要上下文
  project_goal: string           # 项目总体目标
  milestone_goal: string         # 当前 milestone 目标
  task_scope: string             # 当前 task 范围
  related_spec_sections: [string] # 相关 spec 片段引用
  code_context_summary: string   # 代码上下文摘要
  
constraints:                     # 不能违反的条件（列表）
  - string                       # 例如："不改数据库 schema"、"不能改 public API"
  
inputs:                          # 工件引用或上下文片段
  - artifact_id: string          # 工件 ID
    artifact_type: enum          # 工件类型
      - spec
      - design_note
      - implementation_summary
      - test_report
      - review_report
      - docs_sync_report        # docs 产出（007-docs-core）
      - changelog_entry         # docs 产出（007-docs-core）
      - security_report
    path: string                 # 工件路径
    summary: string              # 工件内容摘要
    
expected_outputs:                # 对输出的最低要求
  - string                       # 例如："design document"、"code changes"
  
verification_steps:              # 管理层要求后续验证的步骤
  - string                       # 例如："build"、"unit_test"、"review"
  
risk_level: enum                 # 风险等级
  - low
  - medium
  - high
  - critical
  
retry_context:                   # 返工时必须包含（可选）
  retry_count: int               # 已返工次数
  previous_failure_reason: string # 上次失败原因
  previous_output_summary: string # 上次输出摘要
  required_fixes: [string]       # 本次必须修复项
  
upstream_dependencies:           # 上游依赖摘要（可选）
  - task_id: string
    status: enum
      - completed
      - failed
      - blocked
      
downstream_expectations:         # 下游角色如何消费结果（可选）
  string                         # 例如："tester 将基于错误码路径补测试"
  
metadata:                        # 扩展字段（可选）
  domain: string                 # 领域标签（auth/payment/user-management 等）
  created_at: timestamp
  created_by: string
```

### Required Input Fields
以下字段必须存在且非空：
- dispatch_id
- project_id
- milestone_id
- task_id
- role
- command
- title
- goal
- description
- context（至少包含 task_scope）
- constraints（至少一个约束，可以是"无特殊约束"）
- inputs（至少一个输入，可以是上下文说明）
- expected_outputs（至少一个期望输出）
- verification_steps（至少一个验证步骤）
- risk_level

### Optional Input Fields
- retry_context（仅在返工时必填）
- upstream_dependencies
- downstream_expectations
- metadata

### Input Validation Rules
1. **goal 不可为空**：必须明确说明任务要达成的结果
2. **constraints 必须区分硬约束和软约束**：硬约束以"必须"、"禁止"开头，软约束以"建议"、"优先"开头
3. **existing_artifacts 若存在必须给出路径**：每个 artifact 必须有 artifact_id 和 path
4. **role 与 command 必须匹配**：developer 角色不能使用 architect 专属命令
5. **retry_count 检查**：普通 task 不得超过 2 次，中高风险 task 不得超过 1 次
6. **risk_level 与 task 类型一致性**：涉及 auth/permission 的 task 最低为 medium

### Invalid Input Handling
若输入不满足验证规则：
- 角色应返回 `BLOCKED` 状态
- 明确说明哪些字段缺失或无效
- 不执行任何实质性工作

---

## 2. Execution Result Contract

### Contract Name
Execution Result - 执行层向管理层返回的统一执行结果

### Purpose
为所有角色提供标准化的输出格式，确保管理层能稳定消费执行结果，做出流程决策。

### Output Schema

```yaml
dispatch_id: string              # 关联的派发 ID
project_id: string               # 项目 ID
milestone_id: string             # milestone ID
task_id: string                  # task ID
role: enum                       # 执行角色
command: string                  # 执行的命令

status: enum                     # 执行状态
  - SUCCESS                     # 成功完成
  - SUCCESS_WITH_WARNINGS       # 成功但有警告
  - PARTIAL                     # 部分完成
  - BLOCKED                     # 被阻塞无法继续
  - FAILED_RETRYABLE            # 失败但可返工修复
  - FAILED_ESCALATE             # 失败必须升级

summary: string                  # 简要说明（3-5 句话）
  # 必须包含：做了什么、是否达成目标、还缺什么

artifacts:                       # 本轮主要产物引用列表
  - artifact_id: string
    artifact_type: enum          # design_note / implementation_summary / 
                                  # test_report / review_report / 
                                  # doc_update_report / security_report
    title: string
    path: string
    format: enum
      - markdown
      - yaml
      - json
      - code
    summary: string              # 工件内容摘要
    created_by_role: string
    related_task_id: string
    created_at: timestamp

changed_files:                   # 文件改动列表（若无改动必须显式写空列表）
  - path: string
    change_type: enum
      - added
      - modified
      - deleted
      - renamed
    diff_summary: string         # 变更内容摘要

checks_performed:                # 已做的自检清单
  - string                       # 例如："实现目标对齐检查"、"改动范围检查"

issues_found:                    # 发现但未解决的问题（若无必须显式写空列表）
  - issue_id: string
    severity: enum
      - critical
      - high
      - medium
      - low
    description: string
    recommendation: string

risks:                           # 当前剩余风险（若无必须显式写"未发现明显新增风险"）
  - risk_id: string
    level: enum
      - high
      - medium
      - low
    description: string
    mitigation: string           # 缓解措施

recommendation: enum             # 后续流向建议
  - CONTINUE                    # 继续下一阶段
  - SEND_TO_TEST               # 发送给 tester
  - SEND_TO_REVIEW             # 发送给 reviewer
  - REWORK                     # 返工（当前角色重试）
  - REPLAN                     # 重规划（回到 planning 层）
  - ESCALATE                   # 升级给用户/管理层

needs_followup: boolean          # 是否需要后续跟进
followup_suggestions:            # 跟进建议（若 needs_followup 为 true 则必填）
  - string

escalation:                      # 升级信息（若 status 为 FAILED_ESCALATE 则必填）
  escalation_id: string
  reason_type: enum
    - MISSING_CONTEXT
    - CONFLICTING_CONSTRAINTS
    - HIGH_RISK_CHANGE
    - REPEATED_FAILURE
    - OUT_OF_SCOPE_REQUEST
    - TOOLING_BLOCKER
  summary: string
  blocking_points: [string]
  attempted_actions: [string]
  recommended_next_steps: [string]
  requires_user_decision: boolean

created_at: timestamp
metadata:                        # 扩展字段
  execution_time_ms: int
  model_version: string
```

### Required Output Sections
以下字段必须存在：
- dispatch_id, project_id, milestone_id, task_id, role, command
- status
- summary（必须覆盖做了什么、是否达成目标、还缺什么）
- artifacts（列表，若无 artifact 必须说明原因）
- changed_files（列表，若无改动必须显式写空列表）
- checks_performed（列表，至少一项自检）
- issues_found（列表，若无问题必须显式写空列表）
- risks（必须显式说明，若无风险写"未发现明显新增风险"）
- recommendation
- needs_followup

### Status 定义

#### SUCCESS
- 满足 expected_outputs 所有要求
- 通过所有 verification_steps
- 无 must-fix 问题
- 风险在可接受范围内

#### SUCCESS_WITH_WARNINGS
- 主目标已达成
- 存在非阻塞性问题（low/medium severity）
- 不影响当前 milestone 推进
- 后续可通过其他方式处理

#### PARTIAL
- 部分目标达成
- 部分目标因合理原因未完成（如依赖未就绪）
- 已完成部分可交付给下游

#### BLOCKED
- 因外部原因无法继续（如依赖未满足、输入缺失）
- 不是角色自身失败
- 需要外部解阻塞

#### FAILED_RETRYABLE
- 当前失败可通过局部修复解决
- 不需要改 task 边界
- 目标仍然合理

#### FAILED_ESCALATE
- 风险过高
- 多轮失败未收敛
- 依赖冲突无法自动化解决
- 缺少关键决策

### Recommendation 使用规则

| 情况 | recommendation |
|------|---------------|
| architect 成功输出 design | SEND_TO_REVIEW 或直接 SEND_TO_IMPLEMENT |
| developer 成功输出代码 | SEND_TO_TEST |
| tester 成功完成测试 | SEND_TO_REVIEW |
| reviewer approve | CONTINUE |
| reviewer reject | REWORK |
| 发现结构性问题 | REPLAN |
| 需要用户决策 | ESCALATE |

---

## 3. Artifact Contract

### Contract Name
Artifact - 执行层产出的可引用工件

### Purpose
统一所有角色产出的工件格式，确保工件可被稳定引用、检索和追溯。

### Artifact Schema

```yaml
artifact_id: string              # 工件唯一 ID
artifact_type: enum              # 工件类型
  # design_note                 # architect 产出
  # implementation_summary      # developer 产出
  # code_diff_summary          # developer 产出（代码变更摘要）
  # test_report                # tester 产出
  # review_report              # reviewer 产出
  # doc_update_report          # docs 产出
  # security_report            # security 产出
  # performance_report         # performance 产出（若存在该角色）
  # release_readiness_report   # release 产出（若存在该角色）

title: string                    # 工件标题（人类可读）
path: string                     # 工件存储路径
format: enum                     # 格式
  - markdown
  - yaml
  - json
  - code
  - txt

summary: string                  # 内容摘要（100-300 字）
created_by_role: string          # 创建角色
related_task_id: string          # 关联 task ID
created_at: timestamp

metadata:                        # 扩展字段
  word_count: int
  related_artifacts: [string]    # 关联的其他 artifact IDs
  version: string               # 工件版本（用于追踪变更）
```

### Artifact Type 详细定义

#### design_note
architect 产出的设计文档，必须包含：
- task goal
- current context
- assumptions
- proposed design
- module boundary
- interface contract
- risks
- recommended implementation order

#### implementation_summary
developer 产出的实现总结，必须包含：
- 实现目标
- 实际改动
- changed files
- 对设计的偏离（如有）
- 自检结果
- 已知未解问题

#### test_report
tester 产出的测试报告，必须包含：
- scope
- tests added / run
- pass/fail summary
- uncovered gaps
- edge cases checked
- retry suggestion

#### review_report
reviewer 产出的审查报告，必须包含：
- overall decision (approve/reject/warn)
- critical issues
- non-critical issues
- maintainability notes
- residual risks
- action items

#### doc_update_report
docs 产出的文档同步报告，必须包含：
- synced docs
- missing docs
- user-facing change summary
- internal change summary

#### docs_sync_report
docs 产出的结构化文档同步报告（007-docs-core），必须包含：
- sync_target（同步目标）
- consumed_artifacts（消费的上游 artifacts，BR-001）
- touched_sections（变更的文档部分，BR-002）
- change_reasons（变更原因）
- consistency_checks（跨文档一致性检查，BR-005）
- status_updates（状态更新）
- unresolved_ambiguities（未解决的模糊）
- recommendation（sync-complete / needs-follow-up / blocked）

#### changelog_entry
docs 产出的结构化 changelog 条目（007-docs-core），必须包含：
- feature_id
- feature_name
- change_type（feature / repair / docs-only / governance，BR-006）
- summary
- capability_changes
- docs_changes
- validation_changes
- breaking_changes
- known_limitations
- related_features

#### security_report
security 产出的安全报告，必须包含：
- scope checked
- issues by severity
- must-fix list
- acceptable residual risk
- gate recommendation

---

### Machine-Readable Schema (Contract Schema Pack)

所有 Artifact Contract 都有对应的机器可读 JSON Schema 定义，位于 `contracts/pack/`：

- **registry.json** - 统一契约注册表，包含 17 个契约的完整元数据
- **schema files** - JSON Schema Draft 2020-12 格式的契约定义
- **validate-schema.js** - 基础 schema 验证工具

**契约发现**：
```bash
# 查询所有契约
cat contracts/pack/registry.json

# 查询特定契约 schema
cat contracts/pack/architect/design-note.schema.json
```

**契约验证**：
```bash
# 验证 artifact 是否符合契约
node contracts/pack/validate-schema.js <artifact-path> <contract-id>

# 示例
node contracts/pack/validate-schema.js design-note.yaml AC-001
```

**契约 ID 映射**：
| 角色 | Contract ID 范围 | 契约名称 |
|------|------------------|----------|
| architect | AC-001 ~ AC-004 | design-note, open-questions, risks-and-tradeoffs, module-boundaries |
| developer | DC-001 ~ DC-003 | implementation-summary, self-check-report, bugfix-report |
| tester | TC-001 ~ TC-003 | verification-report, test-scope-report, regression-risk-report |
| reviewer | RC-001 ~ RC-003 | review-findings-report, actionable-feedback-report, acceptance-decision-record |
| docs | DOC-001 ~ DOC-002 | docs-sync-report, changelog-entry |
| security | SEC-001 ~ SEC-002 | security-review-report, input-validation-review-report |

> **注**: Markdown 契约仍为权威定义。JSON Schema 为派生格式，用于自动化工具集成。

---

## 4. Escalation Contract

### Contract Name
Escalation - 当角色无法继续执行时的升级请求

### Purpose
定义升级的标准格式，确保升级信息包含足够的上下文供管理层或用户做决策。

### Escalation Schema

```yaml
escalation_id: string            # 升级唯一 ID
dispatch_id: string              # 关联的 dispatch ID
project_id: string
milestone_id: string
task_id: string
role: string                     # 发起升级的角色

level: enum                      # 升级级别
  - INTERNAL                    # 升级到 OpenClaw 管理层内部重协调
  - USER                        # 升级给用户决策

reason_type: enum                # 升级原因类型
  - MISSING_CONTEXT             # 缺少上下文
  - CONFLICTING_CONSTRAINTS     # 约束冲突
  - HIGH_RISK_CHANGE            # 高风险变更
  - REPEATED_FAILURE            # 重复失败
  - OUT_OF_SCOPE_REQUEST        # 超出范围请求
  - TOOLING_BLOCKER             # 工具阻塞
  - AMBIGUOUS_GOAL              # 目标模糊
  - UNRESOLVED_TRADEOFF         # 无法解决的 trade-off

summary: string                  # 升级摘要（3-5 句话说明情况）

blocking_points:                 # 阻塞点列表
  - string

evidence:                        # 证据
  related_artifacts: [string]    # 相关 artifact IDs
  logs: [string]                 # 相关日志
  failure_history:               # 失败历史
    - attempt_number: int
      failure_reason: string
      timestamp: timestamp

attempted_actions:               # 已尝试的解决动作
  - string

recommended_next_steps:          # 推荐的下一步动作
  - string

options:                         # 可选方案（若适用）
  - option_id: string
    description: string
    pros: [string]
    cons: [string]

recommended_option: string       # 推荐选项（若适用）

required_decision: string        # 需要的具体决策

impact_if_continue: string       # 如果继续的潜在影响
impact_if_stop: string          # 如果停止的潜在影响

created_at: timestamp
created_by: string
```

### Escalation Level 定义

#### INTERNAL
适用于：
- 当前角色不合适，需要换角色
- 需要增加 reviewer/tester/architect 补位
- 需要局部新增 task
- 需要局部重排依赖

#### USER
适用于：
- 商业目标改变
- 范围明显变化
- 多个方案 trade-off 无法自动选
- 当前 milestone 是否继续存在疑问
- 成本/时间/质量不可同时满足
- 自动返工达到上限

### Required Escalation Fields
- escalation_id, dispatch_id, project_id, milestone_id, task_id, role
- level
- reason_type
- summary
- blocking_points（至少一个）
- evidence（至少一个 artifact 或 log）
- recommended_next_steps（至少一个）

---

## 5. Rework Request Contract

### Contract Name
Rework Request - 返工请求

### Purpose
定义返工的标准格式，确保返工携带充分的失败上下文，避免重复犯错。

### Rework Request Schema

```yaml
rework_id: string                # 返工唯一 ID
project_id: string
milestone_id: string
task_id: string

scope: enum                      # 返工范围
  - task_only                   # 仅当前 task
  - task_and_downstream         # 当前 task 及下游
  - milestone_partial           # milestone 局部

reason_type: enum                # 返工原因类型
  - TEST_FAILURE
  - REVIEW_REJECTION
  - ACCEPTANCE_GAP
  - DOCS_MISSING
  - SECURITY_ISSUE
  - PERFORMANCE_REGRESSION
  - INCOMPLETE_OUTPUT
  
reason_summary: string           # 原因摘要

failed_checks:                   # 失败的检查项
  - check_name: string
    expected: string
    actual: string
    severity: enum

related_artifacts:               # 相关 artifacts
  - artifact_id: string
    artifact_type: string
    
retry_count: int                 # 已返工次数（本次是第几次）
max_retry: int                   # 最大允许返工次数

target_role: string              # 目标修复角色

required_fixes:                  # 必须修复项
  - fix_id: string
    description: string
    priority: enum
      - must_fix
      - should_fix
    verification_method: string

non_goals:                       # 返工时不允许扩大的范围
  - string

deadline_hint: timestamp         # 建议完成时间（可选）

created_at: timestamp
created_by: string               # 创建者（通常是 reviewer/acceptance 层）
```

---

## 6. Forbidden Behaviors

所有角色在执行时禁止以下行为：

### 输入处理禁止
- 不得伪造不存在的输入
- 不得忽略缺失的关键字段而继续执行
- 不得将 assumption 当成 confirmed fact 使用

### 输出处理禁止
- 不得省略发现的冲突或问题
- 不得把未验证的部分声称已验证
- 不得输出未定义的术语
- 不得使用"已完成""没问题"等模糊结论
- 不得 artifact 引用指向不存在的文件

### 执行过程禁止
- 不得擅自扩大改动范围（scope creep）
- 不得在未授权的情况下引入新依赖
- 不得以"顺手优化"为由做不相关重构
- 不得跳过验证步骤声称验证通过
- 不得隐瞒剩余风险

### 角色边界禁止
- architect 不得完成大规模业务代码实现
- developer 不得决定验收通过
- tester 不得修改业务逻辑掩盖测试失败
- reviewer 不得在 review 过程中偷偷补实现
- docs 不得修改业务逻辑
- security 不得替代 developer 完成功能实现

---

## 7. Traceability Rules

### 需求到实现的追溯
- 每个关键结论必须对应输入来源
- 每个 artifact 必须注明来源 spec 或 plan
- 每个代码变更必须关联到 task 和 requirement

### 实现到验证的追溯
- 每个 test case 必须关联到 acceptance criteria
- 每个 review comment 必须关联到 spec/design 条款
- 每个 security issue 必须关联到代码位置

### 工件之间的追溯
- design_note 必须引用相关 spec
- implementation_summary 必须引用 design_note
- test_report 必须引用 implementation_summary
- review_report 必须引用 spec/design/test_result

### 追溯格式
所有追溯关系使用以下格式之一：
- `Source: [artifact_type]:[artifact_id]`
- `Related: [task_id]`
- `Based on: [spec_section]`
- `Validates: [acceptance_criteria_id]`
