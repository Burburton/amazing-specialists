# OpenClaw 管理层调度设计

## 1. 文档目的

本文档定义“全自动产品研发闭环 MVP”中 **OpenClaw 管理层** 的调度设计。  
它回答的问题包括：

- OpenClaw 管理层在整个系统中承担什么职责
- 管理层如何消费 Requirement / Spec / Milestone / Task 等对象
- 管理层如何做需求澄清、规格化、规划、分派、验收推进
- 管理层如何选择 OpenCode 执行角色
- 管理层如何打包任务上下文
- 管理层如何处理失败、返工、重规划与升级
- 管理层与状态机、对象模型的接口如何对齐

本文档与《系统状态机与对象模型设计》配套使用。  
前者定义“对象和状态怎么长”，本文档定义“谁来推进它们、按什么规则推进”。

---

## 2. 设计目标

管理层调度系统需要满足以下目标：

1. **自动推进**
   - 在大多数常规路径上，不需要人工逐步干预

2. **可控**
   - 对高风险节点、歧义节点、失败节点设置中断与升级

3. **可追踪**
   - 每次调度决策都能记录依据、输入、输出与后续动作

4. **可扩展**
   - MVP 支持单项目、单条主线；后续可扩展到并发项目与复杂工作流

5. **可复用**
   - 调度逻辑尽量基于通用规则，而不是写死某个具体项目

---

## 3. 管理层定位

OpenClaw 管理层不是单纯的“聊天入口”，也不是执行层本身。  
它应当被定义为：

> 一个围绕项目对象模型运行的流程控制与决策协调层。

它的职责是：

- 将用户输入转成可执行对象
- 将对象推进到下一阶段
- 在需要时选择适合的执行角色
- 在执行结果返回后做验证判断与流程决策
- 在关键节点形成用户可验收成果包
- 在异常时决定返工、重规划或升级

它**不负责**：

- 具体大规模代码实现
- 具体测试执行细节
- 直接承担所有专业领域推理

这些应尽量交给 OpenCode 专家角色层完成。

---

## 4. 管理层总体结构

建议将 OpenClaw 管理层拆成 6 个逻辑模块：

1. **Ingress Coordinator**
2. **Clarification Engine**
3. **Spec Planner**
4. **Milestone & Task Planner**
5. **Dispatch Coordinator**
6. **Acceptance & Recovery Coordinator**

整体关系如下：

```text
User Input
  -> Ingress Coordinator
  -> Clarification Engine
  -> Spec Planner
  -> Milestone & Task Planner
  -> Dispatch Coordinator
  -> Verification Result Intake
  -> Acceptance & Recovery Coordinator
  -> Next Cycle / User Approval
```

---

## 5. 逻辑模块设计

## 5.1 Ingress Coordinator

### 职责
- 接收用户输入
- 创建或更新 Requirement 对象
- 判断是新需求、变更需求、bug、增强还是验收反馈
- 触发后续澄清或恢复流程

### 输入
- 用户自然语言输入
- 外部工单 / issue / PRD
- 用户验收反馈
- 系统内部失败事件

### 输出
- Requirement 对象
- Dispatch Request（内部）
- State Transition Event

### 关键能力
- 输入分类
- 去重与关联已有项目
- 决定是进入新流程还是补入既有流程

### MVP 规则
- 若无 active project，则创建新 project
- 若用户输入显然是对当前需求的补充，则挂到 active requirement
- 若用户输入是验收反馈，则进入 Acceptance & Recovery Coordinator

---

## 5.2 Clarification Engine

### 职责
- 从 raw input 中提取目标、价值、约束、范围提示
- 补全默认假设
- 识别 open questions
- 判断是否已达到 spec-ready 门槛

### 输入
- Requirement.raw_input
- 历史上下文
- 当前 active spec / milestone（若存在）

### 输出
- Requirement.normalized_input
- Requirement.assumptions
- Requirement.open_questions
- clarification_completed / clarification_failed 事件

### 判定原则
以下信息至少要有基本表达，才可进入 spec：
- 做什么
- 为什么做
- 大概边界
- 成功标准线索

### MVP 默认策略
若 open questions 不影响初版拆解，则允许带假设继续推进。  
只有“关键目标不清”或“范围冲突严重”时才阻塞。

---

## 5.3 Spec Planner

### 职责
- 根据 Requirement 生成结构化 spec
- 明确 scope / out_of_scope
- 明确 acceptance criteria
- 明确 risks / assumptions / dependencies

### 输入
- Requirement.normalized_input
- Requirement.constraints
- Requirement.assumptions
- 项目级规则模板

### 输出
- Spec 对象
- spec artifact
- planning_started 事件

### 核心要求
Spec 必须满足：
- 可以驱动 milestone 拆解
- 可以推导 task 类型
- 可以支持后续验证与验收

### MVP 最小模板
Spec 至少包含：
- summary
- goals
- scope
- out_of_scope
- functional_requirements
- acceptance_criteria
- risks

---

## 5.4 Milestone & Task Planner

### 职责
- 将 Spec 拆成 milestone
- 将 milestone 拆成 task
- 标注任务依赖
- 识别任务类型
- 给出 owner_role 建议
- 生成 task verification steps

### 输入
- Spec
- 项目级规则
- 角色映射表
- 风险策略

### 输出
- Milestone 对象列表
- Task 对象列表
- planning_completed 事件

### 核心要求
- milestone 应可验收
- task 应尽量小而闭环
- 每个 task 必须有 verification steps
- 避免一个 task 同时混合太多目标

### 拆分原则
- 先按交付目标拆 milestone
- 再按工作类型拆 task
- 再补依赖关系
- 最后决定角色归属

---

## 5.5 Dispatch Coordinator

### 职责
- 选择当前可执行任务
- 选择合适的 OpenCode 角色
- 打包任务上下文
- 发起执行请求
- 接收执行结果并写回对象模型

### 输入
- READY / TODO / ASSIGNED 状态的 task
- 当前 active milestone
- 角色能力映射
- 执行历史

### 输出
- Dispatch Payload
- task_assigned / task_started / task_completed / task_failed 事件
- Task 状态更新

### 核心要求
- 不能派发依赖未满足的 task
- 不能重复派发同一 task
- 高风险 task 需要走增强路径
- 返工 task 必须携带失败上下文

---

## 5.6 Acceptance & Recovery Coordinator

### 职责
- 在验证结束后决定：
  - 通过
  - 返工
  - 重规划
  - 升级给用户
- 构建 AcceptanceReport
- 等待并处理用户动作
- 决定进入下一 milestone 或结束项目

### 输入
- VerificationResult
- Milestone 状态
- 用户反馈
- 风险规则

### 输出
- AcceptanceReport
- 顶层状态迁移
- task / milestone / project 返工或重规划事件

### 核心要求
- 自动返工只限局部、有限次数
- 重大变化必须升级
- 每个 milestone 完成后都要形成用户可读结果

---

## 6. 管理层主流程

## 6.1 主流程概览

```text
1. 接收输入
2. 创建 / 更新 Requirement
3. 澄清并结构化
4. 生成 Spec
5. 规划 Milestone
6. 生成 Task
7. 选择可执行 Task
8. 分派给 OpenCode 专家
9. 接收执行结果
10. 触发验证
11. 判断通过 / 返工 / 重规划 / 升级
12. 形成验收包
13. 等待用户动作
14. 继续下一轮或结束
```

## 6.2 主循环伪流程

```text
while project not in [COMPLETED, CANCELLED, FAILED]:
    if no active_requirement:
        wait for user input
    elif requirement not spec_ready:
        clarify()
    elif no active_spec:
        create_spec()
    elif milestone planning not done:
        plan_milestones_and_tasks()
    elif executable_tasks_exist:
        dispatch_tasks()
    elif pending_verification_exists:
        run_verification_cycle()
    elif milestone_ready_for_acceptance:
        build_acceptance_package()
        wait for user decision
    else:
        determine_next_milestone_or_complete()
```

---

## 7. 输入分类设计

Ingress Coordinator 需要先判断输入属于哪一类。

## 7.1 输入类型枚举建议

```text
NEW_PRODUCT_REQUIREMENT
FEATURE_ENHANCEMENT
BUG_REPORT
SCOPE_CHANGE
ACCEPTANCE_FEEDBACK
STATUS_QUERY
PAUSE_REQUEST
CANCEL_REQUEST
RESUME_REQUEST
```

## 7.2 分类规则

### NEW_PRODUCT_REQUIREMENT
满足下列特征之一：
- 当前无 active requirement
- 输入描述新的产品目标或产品能力
- 与现有 requirement 无直接映射关系

### FEATURE_ENHANCEMENT
- 针对现有功能增加能力
- 不推翻主目标，只扩边界

### BUG_REPORT
- 明确描述现有行为与预期不一致
- 通常进入 bugfix task，而不是重做 spec

### SCOPE_CHANGE
- 用户明确修改当前范围
- 删除或新增关键交付目标
- 影响 milestone 结构

### ACCEPTANCE_FEEDBACK
- 用户正在对阶段成果作出评价
- 例如“这个先不做”“这个体验不对”“这个通过”

### STATUS_QUERY
- 仅询问当前进展，不改变对象状态

### PAUSE / CANCEL / RESUME
- 直接映射项目状态控制命令

---

## 8. 任务规划策略

## 8.1 milestone 规划原则

Milestone 不是技术动作集合，而是**可验收的阶段性交付目标**。

一个合格 milestone 应满足：
- 可以说清交付了什么
- 可以定义用户如何验收
- 范围足够小，能在一轮闭环里完成
- 依赖关系清晰

### 示例
不好的 milestone：
- “完成前后端所有开发”

好的 milestone：
- “完成用户登录闭环并支持基础错误提示”
- “完成商品列表浏览与分页接口”
- “完成首版管理后台角色权限模型”

## 8.2 task 规划原则

Task 是执行层最小闭环单位。

一个合格 task 应满足：
- 单一主要目标
- 明确 owner_role
- 依赖明确
- 输出明确
- 可验证

### 拆解建议
一个 feature milestone 通常拆成：
- architecture task（可选）
- implementation task
- test task
- review task
- docs task（可选）

---

## 9. 任务类型识别规则

## 9.1 基本类型映射

| 特征 | task type |
|---|---|
| 需要模块边界、接口设计、trade-off | ARCHITECTURE |
| 需要写功能代码 | IMPLEMENTATION |
| 修复缺陷 | BUGFIX |
| 增加或执行测试 | TEST_DESIGN / TEST_EXECUTION |
| 审查代码和实现合理性 | REVIEW |
| 更新文档 | DOCS |
| 性能、稳定性专项 | PERFORMANCE_CHECK |
| 安全、权限、敏感逻辑专项 | SECURITY_CHECK |

## 9.2 自动判定优先级

建议优先级从高到低：
1. BLOCKER bug
2. 当前 milestone 必需 task
3. 验收缺口任务
4. 文档同步任务
5. 可延期优化项

---

## 10. 角色选择策略

管理层的核心职责之一是决定“这类 task 应该派给谁”。

## 10.1 默认角色映射

| task type | owner_role |
|---|---|
| ARCHITECTURE | architect |
| IMPLEMENTATION | developer |
| BUGFIX | developer |
| TEST_DESIGN | tester |
| TEST_EXECUTION | tester |
| REVIEW | reviewer |
| DOCS | docs |
| SECURITY_CHECK | security |
| PERFORMANCE_CHECK | security / performance |

## 10.2 强制升级映射规则

以下情况即便 task 类型不变，也应改走增强路径：

- 涉及认证、权限、支付、数据迁移
- 涉及核心基础设施
- 涉及大范围重构
- 涉及公开接口变更
- 连续返工超过阈值

增强路径示例：
- architecture -> reviewer -> developer -> tester -> reviewer
- developer 输出必须再追加 security 检查

## 10.3 角色选择补充因素

除 task type 外，还应考虑：

- risk_level
- retry_count
- dependencies
- impacted_files
- milestone criticality
- 历史失败模式

---

## 11. Dispatch Payload 设计

Dispatch Payload 是管理层发给 OpenCode 执行层的统一任务包。

## 11.1 结构定义

```yaml
dispatch_id:
project_id:
milestone_id:
task_id:
role:
title:
goal:
description:
context:
constraints:
inputs:
expected_outputs:
verification_steps:
risk_level:
retry_context:
upstream_dependencies:
downstream_expectations:
```

## 11.2 字段说明

### role
目标执行角色，例如：
- architect
- developer
- tester
- reviewer

### context
任务上下文摘要，应包含：
- 当前 milestone 目标
- 当前 task 的边界
- 当前相关 spec 片段
- 关键已有实现或工件引用

### constraints
必须遵守的限制，例如：
- 不改数据库 schema
- 不能改 public API
- 必须复用现有 auth 模块
- 不允许引入新依赖

### inputs
可引用：
- spec 对象 ID
- design note artifact
- previous failure logs
- related task artifacts

### expected_outputs
对输出的最低要求，例如：
- 设计文档
- 代码变更
- 测试文件
- review 报告

### verification_steps
管理层要求后续验证的步骤。

### retry_context
返工时必须包含：
- 上次失败原因
- 上次输出摘要
- 本次修正目标

---

## 12. 上下文打包策略

调度质量高低，很大程度取决于上下文打包是否合理。

## 12.1 上下文分层

建议按三层打包：

### L1：全局上下文
- 项目目标
- 当前阶段
- 当前 milestone 目标

### L2：局部任务上下文
- 当前 task 描述
- 直接依赖 task 输出
- 相关 spec 片段
- 关键约束

### L3：返工 / 风险上下文
- 失败日志
- review 意见
- 风险提示
- 不可重复犯错点

## 12.2 上下文裁剪原则

- 只给当前 task 有关的上下文
- 避免把整个项目历史全部塞入
- 依赖信息尽量以摘要 + artifact 引用给出
- 用户验收反馈优先级高于旧推断

---

## 13. 调度循环设计

## 13.1 单轮调度步骤

1. 读取 active milestone
2. 找出所有可执行 task
3. 按优先级排序
4. 为每个 task 生成 dispatch payload
5. 分派给相应 OpenCode role
6. 等待或轮询执行结果
7. 写回 task 状态与 artifact
8. 若一批任务完成，则触发验证

## 13.2 可执行 task 判定

一个 task 只有满足以下条件，才进入 dispatch candidate 集合：

- status in [TODO, ASSIGNED, FAILED_TEST, CHANGES_REQUESTED, FAILED_VERIFICATION]
- dependencies 均已满足
- 未被标记 BLOCKED / ESCALATED / CANCELLED
- 当前 milestone 处于 READY 或 IN_PROGRESS
- project 不在 PAUSED / CANCELLED / FAILED

## 13.3 排序策略

建议排序键：
1. priority
2. 是否阻塞下游
3. risk_level
4. retry_count
5. created_at

---

## 14. 执行结果接入设计

OpenCode 返回结果后，管理层不能直接“相信完成”，而要做 intake 归档与判定。

## 14.1 执行结果结构

```yaml
task_id:
role:
status:
summary:
artifacts:
changed_files:
notes:
risks:
suggested_next_steps:
```

## 14.2 Intake 流程

1. 校验 task_id 和 role 是否匹配
2. 校验输出是否满足 expected_outputs 最小要求
3. 写入 artifact
4. 更新 task 状态
5. 生成事件日志
6. 决定是否需要追加下游任务
7. 决定是否进入验证阶段

## 14.3 状态更新规则示例

- architect 成功输出 design note -> task `DONE`
- developer 成功输出代码 -> task `IMPLEMENTED`
- tester 成功输出测试结果 -> task `TESTED`
- reviewer 成功输出 review -> task `REVIEWED`

---

## 15. 验证触发策略

管理层需要决定什么时候触发验证，而不是每个 task 完成都立即全量验证。

## 15.1 task 级验证触发

适用于：
- 单个关键 task 完成后
- bugfix 闭环
- 高风险代码修改

## 15.2 milestone 级验证触发

适用于：
- milestone 内主要 task 均完成
- 已具备验收工件
- 需要统一判断是否达到阶段目标

## 15.3 触发条件

### 进入验证的最小条件
- 当前 milestone 的 required tasks 均不再是 TODO / ASSIGNED / IN_PROGRESS
- 必要 artifact 已存在
- 无明显阻塞项

---

## 16. 返工与重规划决策设计

## 16.1 返工（Rework）定义

返工表示：
- 目标不变
- 范围大体不变
- 只需修正局部实现或输出质量

### 适合返工的情况
- unit test 失败
- review 指出实现缺陷
- 验收标准未完全满足但方向正确
- 文档缺失
- 错误处理或边界条件不完整

## 16.2 重规划（Replan）定义

重规划表示：
- 原 task 拆分方式、依赖关系或 milestone 划分不再合适
- 继续原路径成本过高或明显错误

### 适合重规划的情况
- 原设计前提失效
- 用户改变范围
- 某 milestone 太大或边界错误
- 多个 task 连环失败，问题不是局部修补可解
- 依赖结构不合理导致无法闭环

## 16.3 决策矩阵

| 情况 | 动作 |
|---|---|
| 局部实现问题 | REWORK |
| 多次同类失败 | REWORK -> ESCALATE |
| 规格和目标冲突 | REPLAN |
| 用户改目标 | REPLAN |
| 高风险且无法自动决策 | ESCALATE TO USER |

---

## 17. 升级策略

## 17.1 升级到管理层内部重分派

适用于：
- 当前角色不合适
- 需要增加 reviewer / tester / architect 补位
- task 依赖需要重排

## 17.2 升级到用户

以下情况必须升级给用户：

- 商业目标改变
- 范围明显变化
- 多个方案 trade-off 无法自动选
- 当前 milestone 是否继续存在疑问
- 成本 / 时间 /质量不可同时满足
- 自动返工达到上限

## 17.3 升级输出格式建议

```yaml
escalation_id:
project_id:
level:
reason:
related_entities:
summary:
options:
recommended_option:
required_user_decision:
created_at:
```

---

## 18. 用户验收流程设计

## 18.1 触发时机

以下节点触发用户验收：

- spec 初版完成
- milestone 完成
- 重大范围变更
- 连续失败达到阈值
- 发布候选版本完成

## 18.2 验收包内容

管理层需要统一生成：

- 本轮目标
- 完成项
- 未完成项
- 风险
- 测试摘要
- review 摘要
- 关键 artifacts 引用
- 推荐动作

## 18.3 用户动作映射

| 用户动作 | 系统结果 |
|---|---|
| 通过 | milestone -> ACCEPTED |
| 返工 | milestone -> REWORK_REQUIRED |
| 重规划 | milestone -> REPLANNING_REQUIRED |
| 暂停 | project -> PAUSED |
| 取消 | project -> CANCELLED |

---

## 19. 自动推进规则

## 19.1 可自动推进的典型路径

```text
Requirement clarified
-> Spec created
-> Milestone planned
-> Task dispatched
-> Execution result ingested
-> Verification passed
-> Acceptance package created
```

## 19.2 自动推进条件

必须同时满足：

- 当前状态允许自动推进
- 需要的对象已存在
- 没有 pending escalation
- retry_count 未超限
- 不在用户等待状态

## 19.3 自动推进禁止条件

- project.status in [PAUSED, CANCELLED, FAILED]
- acceptance.status == WAITING_USER
- 存在 critical 风险未决
- spec / milestone 缺关键字段
- 当前 task dependency 有环或未满足

---

## 20. 与对象模型的接口对齐

管理层必须读写以下对象：

- Project
- Requirement
- Spec
- Milestone
- Task
- Artifact
- VerificationResult
- AcceptanceReport
- EventLog

## 20.1 创建职责

| 对象 | 创建模块 |
|---|---|
| Requirement | Ingress Coordinator |
| Spec | Spec Planner |
| Milestone | Milestone Planner |
| Task | Task Planner |
| AcceptanceReport | Acceptance & Recovery Coordinator |
| EventLog | 所有模块通过统一日志接口写入 |

## 20.2 更新职责

| 对象 | 更新模块 |
|---|---|
| Requirement | Clarification Engine |
| Spec | Spec Planner / Replanning |
| Milestone | Planner / Acceptance Coordinator |
| Task | Dispatch Coordinator / Verification intake |
| Project | 全局状态控制模块 |

---

## 21. 事件与动作映射

## 21.1 典型事件流

### 新需求进入
```text
requirement_ingested
-> requirement_parsed
-> clarification_completed
-> spec_generated
-> planning_started
-> milestone_created
-> task_created
-> dispatch_completed
```

### 任务返工
```text
task_failed
-> verification_failed_retryable
-> task_reopened
-> redispatch_started
```

### 用户验收通过
```text
acceptance_package_created
-> user_approved
-> milestone_accepted
-> next_milestone_ready / project_completed
```

---

## 22. 配置驱动设计建议

为了后续可复用，建议将调度关键策略配置化。

## 22.1 建议配置项

```yaml
dispatch:
  max_parallel_tasks: 3
  default_retry_limit: 2
  risk_escalation_threshold: high

planning:
  require_architecture_for_large_feature: true
  auto_create_docs_task: true

verification:
  require_review_for_code_changes: true
  require_tests_for_feature_tasks: true

acceptance:
  require_user_signoff_on_milestone: true
  auto_pause_on_repeated_failures: true
```

## 22.2 配置化好处

- 不同项目可复用同一调度框架
- 可按团队成熟度调整自动化程度
- 便于后续引入不同专家包

---

## 23. 推荐实现结构

```text
orchestrator/
├─ ingress/
│  └─ ingress_coordinator.py
├─ clarification/
│  └─ clarification_engine.py
├─ planning/
│  ├─ spec_planner.py
│  ├─ milestone_planner.py
│  └─ task_planner.py
├─ dispatch/
│  ├─ dispatch_coordinator.py
│  ├─ role_selector.py
│  └─ context_builder.py
├─ acceptance/
│  ├─ acceptance_coordinator.py
│  └─ recovery_coordinator.py
├─ policies/
│  ├─ retry_policy.py
│  ├─ escalation_policy.py
│  └─ planning_policy.py
└─ services/
   ├─ object_store_service.py
   ├─ event_service.py
   └─ state_transition_service.py
```

---

## 24. MVP 最小实现范围

第一版建议只做下面这些：

### 必做
- 新需求进入与 requirement 创建
- clarification 到 spec
- spec 到 milestone / task
- 基于 task type 的角色分派
- dispatch payload 生成
- 执行结果 intake
- 返工 / 重规划 / 用户验收三分支
- acceptance report 生成

### 可后做
- 并行任务调度
- 智能成本控制
- 多项目仲裁
- 高级风险评分
- 动态模型路由

---

## 25. 风险与设计注意点

## 25.1 不能把管理层做成“另一个执行 agent”
管理层必须聚焦：
- 判断
- 拆解
- 分派
- 推进
- 验收

否则会重新变成一个大 prompt 混杂系统。

## 25.2 不能让 task 粒度失控
太大：
- 上下文膨胀
- 难验证
- 难返工

太小：
- 调度成本过高
- 管理层频繁震荡

MVP 阶段建议一个 task 控制为“单角色一次闭环可完成的目标”。

## 25.3 不要过早追求全并发
第一版更重要的是：
- 状态正确
- 对象完整
- 返工可控
- 验收闭环跑通

---

## 26. 验收标准

本文档对应的管理层调度实现，至少应满足：

1. 能从用户输入创建或更新 Requirement
2. 能把 Requirement 推进为 Spec
3. 能从 Spec 生成 Milestone 和 Task
4. 能为 Task 选择合适角色
5. 能生成统一 Dispatch Payload
6. 能在结果返回后做 intake 和状态更新
7. 能触发返工、重规划与升级
8. 能在 milestone 完成时生成验收包
9. 能接收用户动作并推进下一轮
10. 能与状态机和对象模型文档无缝对齐

---

## 27. 下一步建议

在这份文档之后，最适合继续拆的是：

**《OpenCode 专家包设计》**

因为管理层调度已经定义了：
- 何时派发
- 派给谁
- 发送什么上下文
- 期望收到什么结果

下一步就该把执行层角色包具体定义出来，包括：

- architect / developer / tester / reviewer 等角色说明
- 每个角色的输入输出契约
- skills 分类
- commands 设计
- 专家包目录结构
