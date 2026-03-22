# OpenCode 专家包 MVP 需求框架与开发计划

**版本**: v1.1  
**日期**: 2026-03-22  
**状态**: 需求规划阶段（已细化Skill建设策略）

---

## 第一部分：需求框架

### 1. 项目背景与定位

#### 1.1 项目定位

OpenCode 专家包是"全自动产品研发闭环 MVP"系统的**执行层核心组件**，负责：

- 接收 OpenClaw 管理层派发的结构化任务
- 通过角色化专家执行具体研发动作
- 输出标准化执行结果和工件
- 支持返工、升级等异常处理流程

#### 1.2 系统位置

```
┌─────────────────────────────────────────────────────────────┐
│                    用户 / 产品输入层                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                OpenClaw 管理层（调度、决策、推进）              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │ Ingress      │ │ Spec Planner │ │ Dispatch     │         │
│  │ Coordinator  │ │              │ │ Coordinator  │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           ★ OpenCode 专家包（本项目）★                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │architect│ │developer│ │ tester  │ │reviewer │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐                                     │
│  │  docs   │ │security │                                     │
│  └─────────┘ └─────────┘                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 验收与返工机制层                               │
└─────────────────────────────────────────────────────────────┘
```

#### 1.3 核心价值主张

| 价值点 | 说明 |
|--------|------|
| **角色清晰** | 不同专家有明确职责边界，不混成万能agent |
| **能力可复用** | 通过skills/commands/templates沉淀方法论 |
| **可调度** | OpenClaw可通过统一接口调度任意专家 |
| **可控** | 每个角色有独立规则和权限边界 |
| **可产品化** | 专家包可作为独立资产复用到不同项目 |

---

### 2. 核心需求分析

#### 2.1 角色需求（6个核心角色）

| 角色 | 核心职责 | MVP优先级 |
|------|----------|-----------|
| **architect** | 需求转技术方案、模块边界、接口契约、风险识别 | P0 必做 |
| **developer** | 功能实现、bug修复、局部重构、自检 | P0 必做 |
| **tester** | 测试设计、测试执行、回归分析、边界覆盖 | P0 必做 |
| **reviewer** | 独立审查、spec比对、风险审查、放行建议 | P0 必做 |
| **docs** | README同步、技术文档、changelog | P1 推荐 |
| **security** | 认证权限检查、输入校验、secret处理检查 | P2 高风险项目 |

#### 2.2 Skill需求（按角色分类）

**Common Skills（所有角色共用）**:

| Skill | 解决问题 | MVP优先级 |
|-------|----------|-----------|
| artifact-reading | 统一读取上游工件 | P0 |
| context-summarization | 裁剪上下文至最小必需 | P0 |
| failure-analysis | 理解失败原因并分类 | P0 |
| execution-reporting | 输出统一格式结果 | P0 |

**Role-Specific Skills**:

| 角色 | 必备Skill | 可选Skill |
|------|-----------|-----------|
| architect | requirement-to-design, interface-contract-design, tradeoff-analysis | migration-planning |
| developer | feature-implementation, bugfix-workflow, code-change-selfcheck | refactor-safely, dependency-minimization |
| tester | unit-test-design, regression-analysis, edge-case-matrix | integration-test-design, flaky-test-diagnosis |
| reviewer | code-review-checklist, spec-implementation-diff, reject-with-actionable-feedback | risk-review, maintainability-review |
| docs | readme-sync, changelog-writing | architecture-doc-sync |
| security | auth-and-permission-review, input-validation-review | secret-handling-review, dependency-risk-review |

#### 2.3 Command需求

| 角色 | Command | 说明 |
|------|---------|------|
| architect | design-task, evaluate-tradeoff | 架构设计入口 |
| developer | implement-task, fix-task, refactor-task | 开发动作入口 |
| tester | test-task, regression-task | 测试动作入口 |
| reviewer | review-task, compare-spec-vs-code | 审查动作入口 |
| docs | update-docs | 文档同步入口 |
| security | security-check | 安全检查入口 |

#### 2.4 Template需求

| Template | 用途 | 使用角色 |
|----------|------|----------|
| design-note.md | 架构设计文档 | architect |
| implementation-summary.md | 实现总结 | developer |
| test-report.md | 测试报告 | tester |
| review-report.md | 审查报告 | reviewer |
| doc-update-report.md | 文档更新报告 | docs |
| security-report.md | 安全报告 | security |
| dispatch-payload.yaml | 派发载荷模板 | 外部 |
| execution-result.yaml | 执行结果模板 | 所有角色 |

#### 2.5 Rule需求

| Rule | 作用范围 | 说明 |
|------|----------|------|
| execution-contract.md | global | 所有角色必须输出统一result |
| artifact-format.md | global | artifact命名、路径、摘要规范 |
| escalation-rules.md | global | 何时必须升级 |
| change-scope-policy.md | coding | developer不得超范围改动 |
| dependency-policy.md | coding | 依赖引入限制 |
| testing-policy.md | testing | tester最小覆盖要求 |
| review-bar.md | review | reviewer通过门槛 |
| documentation-policy.md | docs | 哪些变更必须同步文档 |

---

### 3. 功能需求清单

#### 3.1 核心功能（P0）

| ID | 功能 | 说明 | 验收标准 |
|----|------|------|----------|
| F001 | 角色定义 | 定义4个核心角色（architect/developer/tester/reviewer） | 每个角色有明确职责边界文档 |
| F002 | 角色发现 | OpenClaw能发现所有可用角色 | 通过agents/目录统一发现 |
| F003 | Command注册 | 每个角色至少2个command | commands/<role>/目录下有文件 |
| F004 | Skill挂载 | 每个角色有必备skill集 | skills/<role>/目录结构完整 |
| F005 | 统一输入契约 | 接收dispatch payload | 有schema定义，可校验 |
| F006 | 统一输出契约 | 输出execution result | 有schema定义，可校验 |
| F007 | Artifact输出 | 输出标准工件 | 有template定义 |
| F008 | Escalation输出 | 异常时输出升级结构 | 有schema定义 |

#### 3.2 增强功能（P1）

| ID | 功能 | 说明 | 验收标准 |
|----|------|------|----------|
| F009 | docs角色 | 文档同步专家 | docs.md + 相关skill |
| F010 | 安全角色 | 安全检查专家 | security.md + 相关skill |
| F011 | 完整examples | 端到端示例 | examples/目录完整 |
| F012 | 集成指南 | 接入OpenClaw指南 | integration-guide.md |

#### 3.3 可选功能（P2）

| ID | 功能 | 说明 | 验收标准 |
|----|------|------|----------|
| F013 | performance角色 | 性能检查专家 | 后续扩展 |
| F014 | release角色 | 发布准备专家 | 后续扩展 |
| F015 | 多语言支持 | 多语言skill包 | 后续扩展 |

---

### 4. 非功能需求

#### 4.1 质量属性

| 属性 | 要求 | 验证方式 |
|------|------|----------|
| **可维护性** | 分层清晰，职责单一 | 目录结构审查 |
| **可扩展性** | 新增角色不破坏现有结构 | 扩展测试 |
| **可测试性** | 每个skill/command可独立测试 | 单元测试 |
| **一致性** | 所有角色遵循统一契约 | Schema校验 |

#### 4.2 约束条件

| 约束 | 说明 |
|------|------|
| **不超范围执行** | 角色不得擅自扩大改动边界 |
| **不伪造完成** | 未验证不得声称完成 |
| **显式暴露问题** | 缺失上下文必须显式输出 |
| **最小改动原则** | 优先最小范围修复 |

---

### 5. 上下层接口规范

#### 5.1 上层接口（对OpenClaw管理层）

**5.1.1 调用入口**

```typescript
/**
 * 统一执行入口
 * @param role - 目标角色 (architect|developer|tester|reviewer|docs|security)
 * @param command - 命令名称
 * @param payload - 派发载荷
 * @returns 执行结果
 */
execute_role_task(
  role: string,
  command: string,
  payload: DispatchPayload
): Promise<ExecutionResult>
```

**5.1.2 角色发现接口**

```typescript
/**
 * 发现所有可用角色
 * @returns 角色列表及其元数据
 */
discover_agents(): AgentInfo[]

interface AgentInfo {
  name: string;
  description: string;
  commands: string[];
  skills: string[];
  quality_gates: string[];
}
```

**5.1.3 Command发现接口**

```typescript
/**
 * 发现角色的可用命令
 * @param role - 角色名称
 * @returns 命令列表
 */
discover_commands(role: string): CommandInfo[]

interface CommandInfo {
  name: string;
  description: string;
  required_inputs: string[];
  expected_outputs: string[];
}
```

**5.1.4 Schema获取接口**

```typescript
/**
 * 获取输入输出schema
 * @returns schema定义
 */
get_schemas(): {
  dispatch_payload: Schema;
  execution_result: Schema;
  artifact: Schema;
  escalation: Schema;
  rework_request: Schema;
}
```

#### 5.2 下层接口（对验证/验收层）

**5.2.1 Artifact输出**

```yaml
# 标准artifact结构
artifact_id: string        # 唯一标识
artifact_type: enum        # 类型枚举
title: string              # 标题
path: string               # 文件路径
format: string             # 格式 (markdown|yaml|json)
summary: string            # 摘要
created_by_role: string    # 创建角色
related_task_id: string    # 关联任务
created_at: datetime       # 创建时间
metadata: object           # 扩展字段
```

**5.2.2 Execution Result输出**

```yaml
dispatch_id: string
project_id: string
milestone_id: string
task_id: string
role: string
command: string
status: enum              # SUCCESS|SUCCESS_WITH_WARNINGS|PARTIAL|BLOCKED|FAILED_RETRYABLE|FAILED_ESCALATE
summary: string
artifacts: Artifact[]     # 产出工件列表
changed_files: string[]   # 改动文件列表
checks_performed: string[]# 已执行检查
issues_found: string[]    # 发现问题
risks: string[]           # 剩余风险
recommendation: enum      # CONTINUE|SEND_TO_TEST|SEND_TO_REVIEW|REWORK|REPLAN|ESCALATE
needs_followup: boolean
followup_suggestions: string[]
escalation: Escalation    # 升级信息（如有）
metadata: object
```

**5.2.3 Escalation输出**

```yaml
escalation_id: string
dispatch_id: string
task_id: string
role: string
reason_type: enum         # MISSING_CONTEXT|CONFLICTING_CONSTRAINTS|HIGH_RISK_CHANGE|REPEATED_FAILURE|OUT_OF_SCOPE_REQUEST|TOOLING_BLOCKER
summary: string
blocking_points: string[]
attempted_actions: string[]
recommended_next_steps: string[]
requires_user_decision: boolean
created_at: datetime
```

---

### 6. 数据契约定义

#### 6.1 Dispatch Payload Schema

```yaml
# schemas/dispatch-payload.schema.yaml
type: object
required:
  - dispatch_id
  - project_id
  - milestone_id
  - task_id
  - role
  - command
  - title
  - goal
  - description
  - constraints
  - expected_outputs
  - verification_steps
  - risk_level

properties:
  dispatch_id:
    type: string
    description: 本次派发唯一ID
  project_id:
    type: string
    description: 项目ID
  milestone_id:
    type: string
    description: 当前milestone
  task_id:
    type: string
    description: 目标task
  role:
    type: string
    enum: [architect, developer, tester, reviewer, docs, security]
    description: 目标角色
  command:
    type: string
    description: 指定命令入口
  title:
    type: string
    description: 任务标题
  goal:
    type: string
    description: 该任务必须达成的结果
  description:
    type: string
    description: 任务详细说明
  context:
    type: object
    description: 摘要上下文
  constraints:
    type: array
    items:
      type: string
    description: 不能违反的条件
  inputs:
    type: array
    items:
      type: string
    description: 工件引用或上下文片段
  expected_outputs:
    type: array
    items:
      type: string
    description: 输出要求
  verification_steps:
    type: array
    items:
      type: string
    description: 后续验证方式
  risk_level:
    type: string
    enum: [low, medium, high, critical]
    description: 风险等级
  retry_context:
    type: object
    description: 返工相关信息
  upstream_dependencies:
    type: array
    items:
      type: string
    description: 上游依赖摘要
  downstream_expectations:
    type: array
    items:
      type: string
    description: 下游消费期望
  metadata:
    type: object
    description: 扩展字段
```

#### 6.2 Execution Result Schema

```yaml
# schemas/execution-result.schema.yaml
type: object
required:
  - dispatch_id
  - project_id
  - milestone_id
  - task_id
  - role
  - command
  - status
  - summary
  - recommendation

properties:
  dispatch_id:
    type: string
  project_id:
    type: string
  milestone_id:
    type: string
  task_id:
    type: string
  role:
    type: string
  command:
    type: string
  status:
    type: string
    enum: [SUCCESS, SUCCESS_WITH_WARNINGS, PARTIAL, BLOCKED, FAILED_RETRYABLE, FAILED_ESCALATE]
  summary:
    type: string
  artifacts:
    type: array
    items:
      $ref: '#/definitions/Artifact'
  changed_files:
    type: array
    items:
      type: string
  checks_performed:
    type: array
    items:
      type: string
  issues_found:
    type: array
    items:
      type: string
  risks:
    type: array
    items:
      type: string
  recommendation:
    type: string
    enum: [CONTINUE, SEND_TO_TEST, SEND_TO_REVIEW, REWORK, REPLAN, ESCALATE]
  needs_followup:
    type: boolean
  followup_suggestions:
    type: array
    items:
      type: string
  escalation:
    $ref: '#/definitions/Escalation'
  metadata:
    type: object

definitions:
  Artifact:
    type: object
    required:
      - artifact_id
      - artifact_type
      - title
      - path
      - format
      - summary
      - created_by_role
      - related_task_id
    properties:
      artifact_id:
        type: string
      artifact_type:
        type: string
        enum: [design_note, implementation_summary, code_diff_summary, test_report, review_report, doc_update_report, security_report, performance_report, release_readiness_report]
      title:
        type: string
      path:
        type: string
      format:
        type: string
      summary:
        type: string
      created_by_role:
        type: string
      related_task_id:
        type: string
      created_at:
        type: string
        format: date-time
      metadata:
        type: object

  Escalation:
    type: object
    properties:
      escalation_id:
        type: string
      reason_type:
        type: string
        enum: [MISSING_CONTEXT, CONFLICTING_CONSTRAINTS, HIGH_RISK_CHANGE, REPEATED_FAILURE, OUT_OF_SCOPE_REQUEST, TOOLING_BLOCKER]
      summary:
        type: string
      blocking_points:
        type: array
        items:
          type: string
      recommended_next_steps:
        type: array
        items:
          type: string
      requires_user_decision:
        type: boolean
```

---

## 第二部分：开发计划

### 7. MVP范围定义

#### 7.1 MVP必须交付

| 类别 | 内容 | 文件/目录 |
|------|------|-----------|
| **配置文件** | opencode.jsonc, README.md, AGENTS.md | 根目录 |
| **角色定义** | architect, developer, tester, reviewer | agents/ |
| **Common Skills** | artifact-reading, failure-analysis, execution-reporting | skills/common/ |
| **角色Skills** | 每个核心角色至少2个skill | skills/<role>/ |
| **Commands** | 每个核心角色至少1个command | commands/<role>/ |
| **Templates** | 6个核心模板 | templates/ |
| **Schemas** | 3个核心schema | schemas/ |
| **Rules** | 5个核心规则 | rules/ |

#### 7.2 MVP可选交付

| 类别 | 内容 | 条件 |
|------|------|------|
| docs角色 | docs.md + 2个skill | 时间允许 |
| security角色 | security.md + 2个skill | 时间允许 |
| 完整examples | 端到端示例 | 时间允许 |
| 集成指南 | integration-guide.md | 时间允许 |

#### 7.3 MVP不做

| 类别 | 内容 | 原因 |
|------|------|------|
| performance角色 | 性能检查 | 增强功能 |
| release角色 | 发布准备 | 增强功能 |
| 多语言skill包 | 语言特定skill | 后续扩展 |
| 复杂provider routing | 模型路由 | 后续扩展 |

---

### 8. 里程碑规划

#### Milestone 1: 骨架搭建（预计2天）

**目标**: 建立完整目录结构和基础配置

**任务列表**:

| ID | 任务 | 产出 | 优先级 |
|----|------|------|--------|
| M1-001 | 创建目录结构 | 完整目录树 | P0 |
| M1-002 | 编写README.md | 项目入口文档 | P0 |
| M1-003 | 编写opencode.jsonc | 核心配置 | P0 |
| M1-004 | 编写AGENTS.md | 角色总览 | P0 |
| M1-005 | 定义dispatch-payload.schema.yaml | 输入契约 | P0 |
| M1-006 | 定义execution-result.schema.yaml | 输出契约 | P0 |
| M1-007 | 定义artifact.schema.yaml | 工件契约 | P0 |

**验收标准**:
- [ ] 目录结构符合设计文档
- [ ] 配置文件可被解析
- [ ] Schema可被校验工具使用

#### Milestone 2: 核心角色定义（预计3天）

**目标**: 完成4个核心角色的完整定义

**任务列表**:

| ID | 任务 | 产出 | 优先级 |
|----|------|------|--------|
| M2-001 | 编写architect.md | 架构师角色定义 | P0 |
| M2-002 | 编写developer.md | 开发者角色定义 | P0 |
| M2-003 | 编写tester.md | 测试者角色定义 | P0 |
| M2-004 | 编写reviewer.md | 审查者角色定义 | P0 |
| M2-005 | 编写docs.md（可选） | 文档角色定义 | P1 |
| M2-006 | 编写security.md（可选） | 安全角色定义 | P2 |

**验收标准**:
- [ ] 每个角色有明确职责边界
- [ ] 每个角色有必备skill列表
- [ ] 每个角色有quality gate定义

#### Milestone 3: Common Skills实现（预计2天）

**目标**: 完成所有角色共用的通用skill

**任务列表**:

| ID | 任务 | 产出 | 优先级 |
|----|------|------|--------|
| M3-001 | 实现artifact-reading skill | SKILL.md | P0 |
| M3-002 | 实现context-summarization skill | SKILL.md | P0 |
| M3-003 | 实现failure-analysis skill | SKILL.md | P0 |
| M3-004 | 实现execution-reporting skill | SKILL.md | P0 |

**验收标准**:
- [ ] 每个skill有完整的9部分结构
- [ ] skill有可执行的步骤
- [ ] skill有检查清单

#### Milestone 4: 角色Skills实现（预计5天）

**目标**: 完成各角色的专属skill

**Architect Skills**:

| ID | 任务 | 产出 | 优先级 |
|----|------|------|--------|
| M4-A01 | 实现requirement-to-design skill | SKILL.md | P0 |
| M4-A02 | 实现interface-contract-design skill | SKILL.md | P0 |
| M4-A03 | 实现tradeoff-analysis skill | SKILL.md | P0 |

**Developer Skills**:

| ID | 任务 | 产出 | 优先级 |
|----|------|------|--------|
| M4-D01 | 实现feature-implementation skill | SKILL.md | P0 |
| M4-D02 | 实现bugfix-workflow skill | SKILL.md | P0 |
| M4-D03 | 实现code-change-selfcheck skill | SKILL.md | P0 |

**Tester Skills**:

| ID | 任务 | 产出 | 优先级 |
|----|------|------|--------|
| M4-T01 | 实现unit-test-design skill | SKILL.md | P0 |
| M4-T02 | 实现regression-analysis skill | SKILL.md | P0 |
| M4-T03 | 实现edge-case-matrix skill | SKILL.md | P0 |

**Reviewer Skills**:

| ID | 任务 | 产出 | 优先级 |
|----|------|------|--------|
| M4-R01 | 实现code-review-checklist skill | SKILL.md | P0 |
| M4-R02 | 实现spec-implementation-diff skill | SKILL.md | P0 |
| M4-R03 | 实现reject-with-actionable-feedback skill | SKILL.md | P0 |

**验收标准**:
- [ ] 每个skill有Purpose/When to Use/Steps/Checklists
- [ ] 每个skill有Common Failure Modes
- [ ] 每个skill有Output Requirements

#### Milestone 5: Commands实现（预计3天）

**目标**: 完成各角色的command入口

**任务列表**:

| ID | 任务 | 产出 | 优先级 |
|----|------|------|--------|
| M5-001 | 实现architect/design-task.md | command文件 | P0 |
| M5-002 | 实现architect/evaluate-tradeoff.md | command文件 | P0 |
| M5-003 | 实现developer/implement-task.md | command文件 | P0 |
| M5-004 | 实现developer/fix-task.md | command文件 | P0 |
| M5-005 | 实现tester/test-task.md | command文件 | P0 |
| M5-006 | 实现tester/regression-task.md | command文件 | P0 |
| M5-007 | 实现reviewer/review-task.md | command文件 | P0 |
| M5-008 | 实现reviewer/compare-spec-vs-code.md | command文件 | P0 |

**验收标准**:
- [ ] 每个command有Purpose/Use Cases/Required Inputs/Expected Outputs
- [ ] 每个command有Constraints/Recommended Next Step
- [ ] command数量控制在每角色2-3个

#### Milestone 6: Templates实现（预计2天）

**目标**: 完成产物模板

**任务列表**:

| ID | 任务 | 产出 | 优先级 |
|----|------|------|--------|
| M6-001 | 实现design-note.md模板 | 模板文件 | P0 |
| M6-002 | 实现implementation-summary.md模板 | 模板文件 | P0 |
| M6-003 | 实现test-report.md模板 | 模板文件 | P0 |
| M6-004 | 实现review-report.md模板 | 模板文件 | P0 |
| M6-005 | 实现dispatch-payload.yaml模板 | 模板文件 | P0 |
| M6-006 | 实现execution-result.yaml模板 | 模板文件 | P0 |
| M6-007 | 实现doc-update-report.md模板 | 模板文件 | P1 |
| M6-008 | 实现security-report.md模板 | 模板文件 | P1 |

**验收标准**:
- [ ] 模板有清晰的字段说明
- [ ] 模板可被直接使用
- [ ] 模板与schema对齐

#### Milestone 7: Rules实现（预计2天）

**目标**: 完成约束规则

**任务列表**:

| ID | 任务 | 产出 | 优先级 |
|----|------|------|--------|
| M7-001 | 实现global/execution-contract.md | 规则文件 | P0 |
| M7-002 | 实现global/artifact-format.md | 规则文件 | P0 |
| M7-003 | 实现global/escalation-rules.md | 规则文件 | P0 |
| M7-004 | 实现coding/change-scope-policy.md | 规则文件 | P0 |
| M7-005 | 实现testing/testing-policy.md | 规则文件 | P0 |
| M7-006 | 实现review/review-bar.md | 规则文件 | P0 |
| M7-007 | 实现coding/dependency-policy.md | 规则文件 | P1 |
| M7-008 | 实现docs/documentation-policy.md | 规则文件 | P1 |

**验收标准**:
- [ ] 规则有明确的约束条件
- [ ] 规则有违反后果说明
- [ ] 规则可被检查

#### Milestone 8: Examples与文档（预计2天）

**目标**: 完成示例和文档

**任务列表**:

| ID | 任务 | 产出 | 优先级 |
|----|------|------|--------|
| M8-001 | 编写dispatch示例 | yaml文件 | P0 |
| M8-002 | 编写result示例 | yaml文件 | P0 |
| M8-003 | 编写artifact示例 | md文件 | P1 |
| M8-004 | 编写expert-pack-overview.md | 文档 | P1 |
| M8-005 | 编写role-matrix.md | 文档 | P1 |
| M8-006 | 编写command-reference.md | 文档 | P1 |
| M8-007 | 编写skill-index.md | 文档 | P1 |
| M8-008 | 编写integration-guide.md | 文档 | P1 |

**验收标准**:
- [ ] 至少有一个端到端示例
- [ ] 文档与实现一致
- [ ] 集成指南可被管理层使用

---

### 9. 详细任务分解

#### 9.1 按阶段分解

```
Phase 1: 骨架搭建 (2天)
├── M1-001: 创建目录结构
├── M1-002: 编写README.md
├── M1-003: 编写opencode.jsonc
├── M1-004: 编写AGENTS.md
├── M1-005: 定义dispatch-payload.schema.yaml
├── M1-006: 定义execution-result.schema.yaml
└── M1-007: 定义artifact.schema.yaml

Phase 2: 核心角色定义 (3天)
├── M2-001: 编写architect.md
├── M2-002: 编写developer.md
├── M2-003: 编写tester.md
├── M2-004: 编写reviewer.md
├── M2-005: 编写docs.md (可选)
└── M2-006: 编写security.md (可选)

Phase 3: Common Skills (2天)
├── M3-001: artifact-reading skill
├── M3-002: context-summarization skill
├── M3-003: failure-analysis skill
└── M3-004: execution-reporting skill

Phase 4: 角色Skills (5天)
├── Architect Skills (1天)
│   ├── M4-A01: requirement-to-design
│   ├── M4-A02: interface-contract-design
│   └── M4-A03: tradeoff-analysis
├── Developer Skills (1.5天)
│   ├── M4-D01: feature-implementation
│   ├── M4-D02: bugfix-workflow
│   └── M4-D03: code-change-selfcheck
├── Tester Skills (1.5天)
│   ├── M4-T01: unit-test-design
│   ├── M4-T02: regression-analysis
│   └── M4-T03: edge-case-matrix
└── Reviewer Skills (1天)
    ├── M4-R01: code-review-checklist
    ├── M4-R02: spec-implementation-diff
    └── M4-R03: reject-with-actionable-feedback

Phase 5: Commands (3天)
├── Architect Commands (0.5天)
│   ├── M5-001: design-task
│   └── M5-002: evaluate-tradeoff
├── Developer Commands (1天)
│   ├── M5-003: implement-task
│   └── M5-004: fix-task
├── Tester Commands (0.75天)
│   ├── M5-005: test-task
│   └── M5-006: regression-task
└── Reviewer Commands (0.75天)
    ├── M5-007: review-task
    └── M5-008: compare-spec-vs-code

Phase 6: Templates (2天)
├── M6-001: design-note.md
├── M6-002: implementation-summary.md
├── M6-003: test-report.md
├── M6-004: review-report.md
├── M6-005: dispatch-payload.yaml
├── M6-006: execution-result.yaml
├── M6-007: doc-update-report.md (P1)
└── M6-008: security-report.md (P1)

Phase 7: Rules (2天)
├── Global Rules (1天)
│   ├── M7-001: execution-contract.md
│   ├── M7-002: artifact-format.md
│   └── M7-003: escalation-rules.md
└── Domain Rules (1天)
    ├── M7-004: change-scope-policy.md
    ├── M7-005: testing-policy.md
    ├── M7-006: review-bar.md
    ├── M7-007: dependency-policy.md (P1)
    └── M7-008: documentation-policy.md (P1)

Phase 8: Examples与文档 (2天)
├── Examples (1天)
│   ├── M8-001: dispatch示例
│   ├── M8-002: result示例
│   └── M8-003: artifact示例
└── Documentation (1天)
    ├── M8-004: expert-pack-overview.md
    ├── M8-005: role-matrix.md
    ├── M8-006: command-reference.md
    ├── M8-007: skill-index.md
    └── M8-008: integration-guide.md
```

#### 9.2 依赖关系

```
M1 (骨架) ──→ M2 (角色定义)
    │
    └──→ M5 (schemas) ──→ M6 (templates)
              │
              └──→ M8 (examples)

M2 (角色定义) ──→ M3 (common skills)
    │
    └──→ M4 (角色skills) ──→ M5 (commands)

M3 (common skills) ──→ M4 (角色skills)

M4 (角色skills) ──→ M7 (rules)

M5 (commands) ──→ M8 (examples)
M6 (templates) ──→ M8 (examples)
M7 (rules) ──→ M8 (文档)
```

---

### 10. 优先级矩阵

#### 10.1 功能优先级

| 优先级 | 功能 | 说明 |
|--------|------|------|
| **P0** | 4个核心角色 | MVP必须 |
| **P0** | 统一输入输出契约 | MVP必须 |
| **P0** | Common Skills | MVP必须 |
| **P0** | 每角色2-3个核心Skill | MVP必须 |
| **P0** | 每角色1-2个Command | MVP必须 |
| **P0** | 核心Templates | MVP必须 |
| **P0** | 核心Schemas | MVP必须 |
| **P0** | 核心Rules | MVP必须 |
| **P1** | docs角色 | 推荐但非必须 |
| **P1** | 完整Examples | 提升可用性 |
| **P1** | 集成文档 | 便于接入 |
| **P2** | security角色 | 高风险项目需要 |
| **P2** | performance/release角色 | 后续扩展 |

#### 10.2 时间优先级

| 阶段 | 时间 | 优先级 | 依赖 |
|------|------|--------|------|
| Phase 1: 骨架搭建 | 2天 | P0 | 无 |
| Phase 2: 角色定义 | 3天 | P0 | Phase 1 |
| Phase 3: Common Skills | 2天 | P0 | Phase 2 |
| Phase 4: 角色Skills | 5天 | P0 | Phase 3 |
| Phase 5: Commands | 3天 | P0 | Phase 4 |
| Phase 6: Templates | 2天 | P0 | Phase 1 |
| Phase 7: Rules | 2天 | P0 | Phase 4 |
| Phase 8: Examples与文档 | 2天 | P1 | Phase 5,6,7 |

**总预计时间**: 21天（约3周）

---

### 11. 验收标准

#### 11.1 MVP验收清单

**必须满足**:

- [ ] 至少有4个核心角色定义（architect/developer/tester/reviewer）
- [ ] 每个角色至少有1个command
- [ ] 每个角色至少有2个skill
- [ ] 有统一dispatch payload schema
- [ ] 有统一execution result schema
- [ ] 有统一artifact模板
- [ ] 有至少一个端到端example
- [ ] OpenClaw可以通过角色 + command + payload调用

**推荐满足**:

- [ ] docs角色定义
- [ ] security角色定义
- [ ] 完整examples目录
- [ ] integration-guide.md

#### 11.2 质量验收标准

**角色定义**:
- [ ] 有明确职责边界
- [ ] 有必备skill列表
- [ ] 有quality gate定义
- [ ] 有escalation条件

**Skill质量**:
- [ ] 有完整的9部分结构
- [ ] 有可执行步骤
- [ ] 有检查清单
- [ ] 有失败模式说明
- [ ] 有输出要求

**Command质量**:
- [ ] 有Purpose说明
- [ ] 有Required Inputs
- [ ] 有Expected Outputs
- [ ] 有Constraints
- [ ] 有Recommended Next Step

**Schema质量**:
- [ ] 可被校验工具使用
- [ ] 与实现一致
- [ ] 有字段说明

---

### 12. Skill建设策略与来源建议

本节基于`docs/infra/OpenCode 专家包 MVP skill 清单与来源建议.md`，详细说明每个skill的建设策略。

#### 12.1 分类原则

所有skill按以下三类评估：

| 分类 | 定义 | 说明 |
|------|------|------|
| **A. 可直接复用** | 现成来源较成熟，和专家包架构冲突小，改动很少即可接入 | 方法论通用，可直接使用 |
| **B. 可半复用** | 现成来源能提供方法骨架，需按角色边界、输出格式、gate规则改写 | 方法通用，但输出格式需定制 |
| **C. 必须自定义** | 和调度协议、artifact schema、质量gate、返工机制强绑定 | 无法依赖外部，必须按自身体系写 |

#### 12.2 Common Skills建设策略

| Skill | 复用建议 | 必须改写的部分 | 建设方式 |
|-------|----------|----------------|----------|
| **artifact-reading** | 可半复用 | artifact类型枚举、读取优先级、输出摘要格式、与dispatch payload衔接方式 | 参考Superpowers/Anthropic skills写法，按自身artifact schema改造 |
| **context-summarization** | 可半复用 | 保留task goal/constraints/expected_outputs/retry context，丢弃无关噪音 | 参考通用summarization思路，结合dispatch payload schema定制 |
| **failure-analysis** | 可半复用 | reason_type/failed_checks/required_fixes/non_goals/recommendation输出结构 | 参考社区方法，结合ReworkRequest/Escalation schema |
| **execution-reporting** | **必须自定义** | 直接和execution-result.schema.yaml、artifact规范、verification/acceptance对接强绑定 | 不从外部找成品，直接按output contract写 |

#### 12.3 Architect Skills建设策略

| Skill | 复用建议 | 建设方式 | 是否适合skill creator |
|-------|----------|----------|----------------------|
| **requirement-to-design** | 可半复用 | 参考Superpowers workflow/planning/design技能思想，按design note模板改 | ✅ 适合 |
| **interface-contract-design** | 可半复用 | MVP第一版可先作为requirement-to-design内嵌章节，后续再拆独立skill | ✅ 适合 |
| **tradeoff-analysis** | 可直接复用/可半复用 | 方法论通用，优先作为可复用skill使用，按输出格式略改 | ✅ 适合 |

#### 12.4 Developer Skills建设策略

| Skill | 复用建议 | 必须绑定项 | 是否适合skill creator |
|-------|----------|-----------|----------------------|
| **feature-implementation** | 可半复用 | constraints/expected_outputs/changed_files/self-check/unresolved issues | ✅ 适合 |
| **bugfix-workflow** | 可半复用 | 修复摘要/影响范围/回归点/replan/escalate判断 | ✅ 适合 |
| **code-change-selfcheck** | **必须自定义** | 直接对应developer gate，是质量保障体系一部分 | ❌ 不适合 |

#### 12.5 Tester Skills建设策略

| Skill | 复用建议 | 必须绑定项 | 是否适合skill creator |
|-------|----------|-----------|----------------------|
| **unit-test-design** | 可半复用 | acceptance criteria/changed files/expected risk areas/test report模板 | ✅ 适合 |
| **regression-analysis** | 可半复用 | changed files/known risks/bugfix summary/reviewer建议 | ✅ 适合 |
| **edge-case-matrix** | 可半复用 | MVP第一版可先作为unit-test-design的一部分，后续再拆skill | ✅ 适合 |

#### 12.6 Reviewer Skills建设策略

| Skill | 复用建议 | 必须绑定项 | 是否适合skill creator |
|-------|----------|-----------|----------------------|
| **code-review-checklist** | 可半复用 | review-report.md/review-bar.md模板 | ✅ 适合 |
| **spec-implementation-diff** | **必须自定义** | spec结构/design note结构/implementation summary结构/acceptance criteria | ❌ 不适合 |
| **reject-with-actionable-feedback** | 可半复用 | review-report模板和返工机制 | ✅ 适合 |

#### 12.7 可选角色Skills建设策略

| 角色 | Skill | 复用建议 | 说明 |
|------|-------|----------|------|
| docs | readme-sync | 可半复用 | 结合changelog/doc_update_report模板 |
| docs | changelog-writing | 可直接复用/可半复用 | 变更说明写法通用 |
| security | auth-and-permission-review | 可半复用 | 输出severity/must-fix/gate recommendation |
| security | input-validation-review | 可半复用 | 输出结构接security_report |

#### 12.8 来源建议优先级

| 来源类型 | 适合场景 | 优先级 |
|----------|----------|--------|
| **OpenCode原生skills机制** | 承载层，最终落地运行的目标能力层 | 最高 |
| **Anthropic skills/skill-creator** | skill结构参考、初稿生成器、迭代优化器 | 高 |
| **Superpowers** | workflow discipline、design-before-implementation、review/verification风格参考 | 高 |
| **opencode-skills/opencode-agent-skills** | OpenCode兼容skill组织方式、目录命名、动态加载思路 | 中 |

#### 12.9 不建议依赖的来源类型

| 来源类型 | 问题 |
|----------|------|
| **纯提示词合集** | 没有稳定输入输出契约、不强调artifact和gate、很难接入闭环系统 |
| **过于通用的"万能专家"skill** | 方法不够明确、容易和角色边界冲突、最终导致expert pack混乱 |

#### 12.10 skill creator最佳使用方式

**适合用skill creator生成的skill**:
- requirement-to-design
- feature-implementation
- bugfix-workflow
- unit-test-design
- code-review-checklist
- reject-with-actionable-feedback

**不建议直接交给skill creator决定的skill**:
- execution-reporting（太依赖自身schema和gate设计）
- code-change-selfcheck（对应developer gate）
- spec-implementation-diff（依赖自身schema结构）

**推荐流程**:
1. 先写清skill名称与用途
2. 先定该skill的输入输出要求
3. 用skill creator生成初稿
4. 按角色规范改写
5. 用examples/实际任务验证
6. 再继续迭代

#### 12.11 MVP最终skill包清单

**必做common（4个）**:
- artifact-reading（可半复用）
- context-summarization（可半复用）
- failure-analysis（可半复用）
- execution-reporting（**必须自定义**）

**必做architect（2-3个）**:
- requirement-to-design（可半复用）
- tradeoff-analysis（可直接复用/可半复用）
- interface-contract-design（P1，可半复用）

**必做developer（3个）**:
- feature-implementation（可半复用）
- bugfix-workflow（可半复用）
- code-change-selfcheck（**必须自定义**）

**必做tester（2个）**:
- unit-test-design（可半复用）
- regression-analysis（可半复用）

**必做reviewer（3个）**:
- code-review-checklist（可半复用）
- spec-implementation-diff（**必须自定义**）
- reject-with-actionable-feedback（可半复用）

**可选docs（2个）**:
- readme-sync（可半复用）
- changelog-writing（可直接复用/可半复用）

**可选security（2个）**:
- auth-and-permission-review（可半复用）
- input-validation-review（可半复用）

#### 12.12 建设优先级总结

**一句话总结**：
> **先复用方法型skill，再自定义协议型skill，最后用skill creator补齐缺口并持续优化。**

---

### 13. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Skill粒度过大 | 难维护、难复用 | 控制每个skill解决单一方法问题 |
| Command过多 | 维护复杂 | 每角色限制2-3个 |
| Schema不一致 | 集成困难 | 先定义schema，再实现 |
| 角色边界模糊 | 职责混乱 | 明确定义Non-Responsibilities |
| 缺少示例 | 难以理解 | 优先完成端到端example |
| 过度依赖外部skill | 与自身体系不兼容 | 严格按"必须自定义"清单自己写 |

---

### 14. 后续扩展路线

#### 13.1 短期扩展（1-2个月）

- [ ] performance角色及skills
- [ ] release角色及skills
- [ ] 更多language-specific skills
- [ ] 更丰富的examples

#### 13.2 中期扩展（3-6个月）

- [ ] 多provider支持
- [ ] 动态skill加载
- [ ] 角色组合工作流
- [ ] 自定义角色模板

#### 13.3 长期扩展（6个月+）

- [ ] 领域专家包（如前端专家包、后端专家包）
- [ ] 团队定制化配置
- [ ] 跨项目知识迁移
- [ ] 学习型skill优化

---

## 附录

### A. 目录结构参考

```
opencode-expert-pack/
├─ README.md
├─ opencode.jsonc
├─ AGENTS.md
├─ agents/
│  ├─ architect.md
│  ├─ developer.md
│  ├─ tester.md
│  ├─ reviewer.md
│  ├─ docs.md
│  └─ security.md
├─ skills/
│  ├─ common/
│  │  ├─ artifact-reading/SKILL.md
│  │  ├─ context-summarization/SKILL.md
│  │  ├─ failure-analysis/SKILL.md
│  │  └─ execution-reporting/SKILL.md
│  ├─ architect/
│  │  ├─ requirement-to-design/SKILL.md
│  │  ├─ interface-contract-design/SKILL.md
│  │  └─ tradeoff-analysis/SKILL.md
│  ├─ developer/
│  │  ├─ feature-implementation/SKILL.md
│  │  ├─ bugfix-workflow/SKILL.md
│  │  └─ code-change-selfcheck/SKILL.md
│  ├─ tester/
│  │  ├─ unit-test-design/SKILL.md
│  │  ├─ regression-analysis/SKILL.md
│  │  └─ edge-case-matrix/SKILL.md
│  ├─ reviewer/
│  │  ├─ code-review-checklist/SKILL.md
│  │  ├─ spec-implementation-diff/SKILL.md
│  │  └─ reject-with-actionable-feedback/SKILL.md
│  ├─ docs/
│  │  ├─ readme-sync/SKILL.md
│  │  └─ changelog-writing/SKILL.md
│  └─ security/
│     ├─ auth-and-permission-review/SKILL.md
│     └─ input-validation-review/SKILL.md
├─ commands/
│  ├─ architect/
│  │  ├─ design-task.md
│  │  └─ evaluate-tradeoff.md
│  ├─ developer/
│  │  ├─ implement-task.md
│  │  ├─ fix-task.md
│  │  └─ refactor-task.md
│  ├─ tester/
│  │  ├─ test-task.md
│  │  └─ regression-task.md
│  ├─ reviewer/
│  │  ├─ review-task.md
│  │  └─ compare-spec-vs-code.md
│  ├─ docs/
│  │  └─ update-docs.md
│  └─ security/
│     └─ security-check.md
├─ templates/
│  ├─ design-note.md
│  ├─ implementation-summary.md
│  ├─ test-report.md
│  ├─ review-report.md
│  ├─ doc-update-report.md
│  ├─ security-report.md
│  ├─ dispatch-payload.yaml
│  ├─ execution-result.yaml
│  ├─ rework-request.yaml
│  └─ escalation.yaml
├─ rules/
│  ├─ global/
│  │  ├─ execution-contract.md
│  │  ├─ artifact-format.md
│  │  └─ escalation-rules.md
│  ├─ coding/
│  │  ├─ change-scope-policy.md
│  │  └─ dependency-policy.md
│  ├─ testing/
│  │  └─ testing-policy.md
│  ├─ review/
│  │  └─ review-bar.md
│  └─ docs/
│     └─ documentation-policy.md
├─ schemas/
│  ├─ dispatch-payload.schema.yaml
│  ├─ execution-result.schema.yaml
│  ├─ artifact.schema.yaml
│  ├─ rework-request.schema.yaml
│  └─ escalation.schema.yaml
├─ examples/
│  ├─ dispatch/
│  │  ├─ architect-design-task.yaml
│  │  ├─ developer-implement-task.yaml
│  │  └─ reviewer-review-task.yaml
│  ├─ results/
│  │  ├─ developer-success.yaml
│  │  ├─ tester-fail-retryable.yaml
│  │  └─ reviewer-reject.yaml
│  └─ artifacts/
│     ├─ sample-design-note.md
│     ├─ sample-implementation-summary.md
│     ├─ sample-test-report.md
│     └─ sample-review-report.md
└─ docs/
   ├─ expert-pack-overview.md
   ├─ role-matrix.md
   ├─ command-reference.md
   ├─ skill-index.md
   └─ integration-guide.md
```

### B. 参考文档

1. `docs/infra/OpenCode 专家包设计.md` - 角色与接口设计
2. `docs/infra/OpenCode专家包MVP目录骨架.md` - 目录结构设计
3. `docs/infra/角色质量保障规范.md` - 质量标准设计
4. `docs/infra/OpenCode 专家包 MVP skill 清单与来源建议.md` - Skill建设策略与来源建议
5. `docs/infra/系统状态机与对象模型设计.md` - 状态与对象模型
6. `docs/infra/OpenClaw 管理层调度设计.md` - 调度设计
7. `docs/infra/验收与返工机制设计.md` - 验收机制设计

### C. Skill建设速查表

**必须自定义的Skill（不可依赖外部）**:
```
skills/common/execution-reporting/SKILL.md
skills/developer/code-change-selfcheck/SKILL.md
skills/reviewer/spec-implementation-diff/SKILL.md
```

**适合skill creator生成的Skill**:
```
skills/architect/requirement-to-design/SKILL.md
skills/architect/tradeoff-analysis/SKILL.md
skills/developer/feature-implementation/SKILL.md
skills/developer/bugfix-workflow/SKILL.md
skills/tester/unit-test-design/SKILL.md
skills/tester/regression-analysis/SKILL.md
skills/reviewer/code-review-checklist/SKILL.md
skills/reviewer/reject-with-actionable-feedback/SKILL.md
```

**可半复用的Skill（需改造）**:
```
skills/common/artifact-reading/SKILL.md
skills/common/context-summarization/SKILL.md
skills/common/failure-analysis/SKILL.md
skills/architect/interface-contract-design/SKILL.md
skills/tester/edge-case-matrix/SKILL.md
skills/docs/readme-sync/SKILL.md
skills/security/auth-and-permission-review/SKILL.md
skills/security/input-validation-review/SKILL.md
```

**可直接复用/轻改造的Skill**:
```
skills/docs/changelog-writing/SKILL.md
```

---

### D. 配套文档

| 文档 | 说明 |
|------|------|
| **[详细实施规范](./OpenCode专家包_详细实施规范.md)** | Phase任务卡片、角色定义模板、Command规范、Template字段定义、Rule约束条件、Example示例规范 |