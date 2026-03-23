# 全自动产品研发闭环 MVP 设计稿

## 1. 项目目标

构建一套从**产品需求输入**到**阶段性交付与验收**的自动化研发闭环系统。  
用户只需提供产品需求或需求变更，系统即可自动完成后续主要研发流程，包括：

- 需求澄清
- 需求规格化
- 范围切分
- 技术方案设计
- 任务拆解
- 角色分派
- 代码实现
- 测试生成与执行
- 代码审查
- 文档同步
- 结果汇总
- 阶段验收汇报
- 失败返工与下一轮迭代

MVP 阶段不追求“完全无人干预的无限自治”，而是实现：

**默认自动推进 + 关键节点可验收 + 异常自动中断升级**

## 2. MVP 目标定义

### 2.1 MVP 核心目标

实现如下最小闭环：

1. 用户输入一个产品需求
2. 管理层自动将其整理为结构化 spec
3. 自动拆分为若干 milestone 与 task
4. 自动分配给 OpenCode 执行角色
5. 自动完成设计、开发、测试、审查
6. 自动执行校验与失败返工
7. 在 milestone 完成后输出验收包
8. 等待用户验收后继续下一轮

### 2.2 MVP 不做的事情

MVP 阶段暂不覆盖：

- 多项目并行调度
- 长周期自我产品规划
- 自动商业决策
- 自动上线生产环境
- 自动采购外部服务
- 自主调整组织结构
- 无上限循环自治
- 全量 UI 自动视觉验收
- 复杂跨仓库依赖编排
- 真实企业级权限与审计系统

## 3. 总体架构

### 3.1 分层架构

系统分为四层：

#### A. Requirement Layer
负责接收和理解输入需求。

输入形式可以包括：

- 一段自然语言产品想法
- PRD 草稿
- issue / 任务描述
- 变更请求
- bug 描述
- 功能增强诉求

#### B. Management & Orchestration Layer（OpenClaw）
负责：

- 澄清需求
- 规格化
- 制定计划
- 拆分 milestone
- 生成 task
- 选择执行角色
- 调度 OpenCode
- 跟踪状态
- 触发验证
- 汇总结果
- 发起验收

#### C. Expert Execution Layer（OpenCode）
负责：

- 架构设计
- 编码实现
- 测试生成
- 审查修复
- 文档更新
- 专项检查

通过多个 agent / skills / commands 构成角色化执行能力。

#### D. Verification & Acceptance Layer
负责：

- 构建验证
- 测试验证
- 规范验证
- 验收标准比对
- 风险判定
- 是否返工
- 是否允许进入下一阶段

## 4. 核心设计原则

### 4.1 管理与执行分离

OpenClaw 不直接承担主要代码实现职责。  
它负责理解、规划、调度、验收和推进流程。

OpenCode 不负责高层产品决策。  
它负责按任务执行专业动作。

### 4.2 角色与能力分离

- **Agent** 表示角色
- **Skill** 表示专业方法或知识包
- **Command / Workflow** 表示流程入口

不能把三者混成一个大 prompt。

### 4.3 默认自动推进，异常升级

系统在正常情况下自动推进。  
只有遇到预定义异常时才升级给用户。

### 4.4 所有任务都必须有输入输出契约

每个 task 不能只是“一句话命令”，而必须具备：

- 输入上下文
- 任务目标
- 约束条件
- 成功标准
- 输出格式
- 后续动作

### 4.5 验证优先于“感觉完成”

任何实现结果都必须经过验证层。  
没有通过验证，不算完成。

### 4.6 有限自治

系统必须有：

- 最大迭代次数
- 最大返工次数
- 最大自动推进深度
- 明确中断条件

防止无限循环与资源失控。

## 5. 角色分工

### 5.1 OpenClaw 管理层角色

#### 1) Product Interpreter
负责将用户输入转化为可处理的需求表达。

职责：
- 提取目标
- 提取用户价值
- 提取约束
- 发现模糊点
- 生成澄清问题

#### 2) Spec Planner
负责生成结构化规格说明。

职责：
- 形成功能边界
- 定义非功能要求
- 定义成功标准
- 切分版本范围
- 输出 spec

#### 3) Milestone Planner
负责从 spec 拆出 milestone。

职责：
- 切分阶段目标
- 确定依赖关系
- 识别优先级
- 划定每轮可交付范围

#### 4) Task Dispatcher
负责把任务分配给合适的 OpenCode 专家角色。

职责：
- 识别任务类型
- 匹配角色
- 打包上下文
- 调用执行接口
- 收集结果

#### 5) Acceptance Coordinator
负责验收、返工和状态推进。

职责：
- 比对验收标准
- 判断是否返工
- 组织下一轮
- 生成用户可读汇报

### 5.2 OpenCode 执行层角色

MVP 建议只保留 4 到 6 个核心角色。

#### 1) Architect Agent
职责：
- 分析现有代码结构
- 输出技术方案
- 定义模块边界
- 定义接口与数据流
- 评估 trade-off

输入：
- spec
- 代码上下文
- 约束条件

输出：
- design note
- implementation plan
- risk list

#### 2) Developer Agent
职责：
- 编写代码
- 修复 bug
- 重构模块
- 补齐必要脚本与配置

输入：
- task spec
- design note
- 相关代码上下文

输出：
- 代码变更
- 实现说明
- 自测说明

#### 3) Tester Agent
职责：
- 设计测试策略
- 生成单测/集成测试
- 执行测试
- 输出失败分析

输入：
- spec
- 实现变更
- 风险点

输出：
- 测试代码
- 测试结果
- 回归报告

#### 4) Reviewer Agent
职责：
- 审查代码改动
- 检查规范与逻辑
- 识别潜在问题
- 给出返工建议

输入：
- diff
- spec
- design note
- test result

输出：
- review report
- issues list
- approve / reject

#### 5) Docs Agent（可选）
职责：
- 更新 README
- 更新技术文档
- 更新使用说明
- 汇总变更说明

#### 6) Security / Performance Agent（MVP 可选）
职责：
- 做专项检查
- 在高风险任务时介入

## 6. MVP 状态机设计

这是整套闭环最关键的部分。

### 6.1 顶层状态

```text
RECEIVED
-> CLARIFYING
-> SPEC_DEFINED
-> MILESTONES_PLANNED
-> TASKS_DISPATCHED
-> EXECUTING
-> VERIFYING
-> ACCEPTANCE_READY
-> WAITING_FOR_USER_ACCEPTANCE
-> APPROVED / REJECTED / NEEDS_REPLAN
```

### 6.2 详细状态说明

#### 1) RECEIVED
收到用户需求。

进入条件：
- 用户提交新需求或变更需求

输出：
- 原始需求对象

#### 2) CLARIFYING
自动做需求澄清与信息补全。

动作：
- 识别缺失信息
- 生成假设
- 补齐默认值
- 必要时向用户提出最少量关键问题
- 若可容忍不确定性则直接进入 spec

输出：
- clarified requirement

#### 3) SPEC_DEFINED
形成结构化 spec。

包含：
- 背景
- 目标
- 范围
- 非目标
- 约束
- 功能需求
- 非功能需求
- 验收标准
- 风险与假设

#### 4) MILESTONES_PLANNED
生成里程碑规划。

包含：
- milestone 列表
- 每个 milestone 的目标
- 依赖
- 优先级
- 交付物

#### 5) TASKS_DISPATCHED
将 milestone 拆成任务并分派。

#### 6) EXECUTING
OpenCode 执行层按任务工作。

#### 7) VERIFYING
统一验证所有执行结果。

#### 8) ACCEPTANCE_READY
整理为可验收成果包。

#### 9) WAITING_FOR_USER_ACCEPTANCE
等待用户审批。

#### 10) APPROVED
进入下一 milestone 或结束。

#### 11) REJECTED / NEEDS_REPLAN
触发返工或重规划。

## 7. 单个任务的状态机

每个 task 独立维护状态。

```text
TODO
-> ASSIGNED
-> IN_PROGRESS
-> IMPLEMENTED
-> TESTED
-> REVIEWED
-> VERIFIED
-> DONE
```

失败分支：

```text
IN_PROGRESS -> BLOCKED
IMPLEMENTED -> FAILED_TEST
REVIEWED -> CHANGES_REQUESTED
VERIFYING -> FAILED_VERIFICATION
```

返工循环：

```text
FAILED_TEST -> IN_PROGRESS
CHANGES_REQUESTED -> IN_PROGRESS
FAILED_VERIFICATION -> IN_PROGRESS
```

当超过最大返工次数时：

```text
FAILED_* -> ESCALATED
```

## 8. 核心对象模型

### 8.1 Requirement Object

```yaml
id:
title:
raw_input:
business_goal:
user_value:
constraints:
assumptions:
open_questions:
priority:
status:
```

### 8.2 Spec Object

```yaml
id:
requirement_id:
summary:
scope:
out_of_scope:
functional_requirements:
non_functional_requirements:
acceptance_criteria:
technical_constraints:
risks:
milestones:
```

### 8.3 Milestone Object

```yaml
id:
spec_id:
name:
goal:
deliverables:
dependencies:
acceptance_criteria:
tasks:
status:
```

### 8.4 Task Object

```yaml
id:
milestone_id:
type:
owner_role:
title:
description:
inputs:
constraints:
expected_outputs:
verification_steps:
retry_count:
status:
artifacts:
```

### 8.5 Acceptance Report Object

```yaml
id:
milestone_id:
completed_items:
failed_items:
risks:
test_summary:
review_summary:
user_decisions_required:
recommendation:
status:
```

## 9. 需求到交付的标准流程

### 9.1 输入阶段

用户输入：

- 产品需求
- 功能增强
- bug 修复需求
- 一个高层 idea

系统动作：

1. 提取目标与范围
2. 提取约束
3. 做需求标准化
4. 判断是否需要补充澄清

产物：

- requirement object
- clarified requirement

### 9.2 规格阶段

系统动作：

1. 生成 spec
2. 提炼 acceptance criteria
3. 明确 non-goals
4. 输出风险清单

产物：

- spec.md
- acceptance criteria
- assumptions list

### 9.3 规划阶段

系统动作：

1. 拆分 milestone
2. 拆分 task
3. 建立任务依赖
4. 选择执行角色

产物：

- roadmap
- milestone plan
- task queue

### 9.4 执行阶段

系统动作：

1. Architect 先出方案
2. Developer 执行实现
3. Tester 补测试并验证
4. Reviewer 审查
5. 必要时 Docs 更新文档

产物：

- code diff
- tests
- review note
- docs diff

### 9.5 验证阶段

系统动作：

- 编译 / 构建
- lint
- unit test
- integration test
- acceptance rule check
- review gate

产物：

- verification report

### 9.6 验收阶段

系统动作：

1. 汇总 milestone 完成情况
2. 生成用户可读报告
3. 列出需拍板项
4. 用户批准或驳回
5. 进入下一 milestone 或返工

产物：

- acceptance report
- demo summary
- next-step proposal

## 10. 调度策略设计

### 10.1 任务类型到角色映射

| 任务类型 | 默认角色 |
|---|---|
| architecture | Architect Agent |
| feature implementation | Developer Agent |
| bug fixing | Developer Agent |
| test design | Tester Agent |
| regression | Tester Agent |
| code review | Reviewer Agent |
| doc update | Docs Agent |
| perf/security check | Security/Performance Agent |

### 10.2 调度规则

#### 规则 1：设计先行
对于中大型 feature，必须先经过 Architect Agent。

#### 规则 2：实现后必须测试
Developer 完成后必须进入 Tester。

#### 规则 3：测试后必须审查
测试通过不等于完成，还要 Reviewer 审查。

#### 规则 4：验收标准绑定任务
每个任务必须携带 verification steps。

#### 规则 5：失败自动返工
若测试或审查失败，自动退回对应执行角色。

#### 规则 6：达到阈值升级
超出以下阈值则升级到用户：

- 连续返工次数超限
- 架构方案冲突
- 缺失关键业务决策
- 成本或时间超预算
- 高风险改动触发

## 11. 自动化闭环机制

### 11.1 自动推进条件

满足以下条件时，系统自动进入下一步：

- 输入完整度达到阈值
- 上一步状态为 success
- 所需工件已生成
- 验证结果为通过
- 未触发升级条件

### 11.2 自动中断条件

触发以下任一条件，流程暂停并升级：

- spec 中存在关键歧义
- 多个方案 trade-off 无法自动选择
- 构建连续失败超过 N 次
- 测试连续失败超过 N 次
- review 连续拒绝超过 N 次
- 需求范围发生重大漂移
- 修改触达高风险区域
- 当前阶段成本超预算

### 11.3 返工机制

返工原则：

- 优先最小范围返工
- 保留失败上下文
- 明确失败原因
- 限制返工次数
- 必要时触发重规划

返工输入必须包含：

- 失败类型
- 失败日志
- 上一轮输出
- 新的修正目标

## 12. 验证层设计

### 12.1 验证类型

MVP 必须支持以下验证：

- Build 验证
- Lint 验证
- Unit Test
- Integration Test（若项目支持）
- Review Gate
- Acceptance Criteria Match

### 12.2 验证结果分类

```text
PASS
PASS_WITH_WARNINGS
FAIL_RETRYABLE
FAIL_ESCALATE
```

### 12.3 验证顺序

推荐顺序：

1. 静态检查
2. 编译 / 构建
3. 单元测试
4. 集成测试
5. 验收规则比对
6. code review

## 13. 用户验收机制

### 13.1 验收触发点

MVP 不要求每个 task 都找用户。

只在这些节点触发用户验收：

- spec 初版完成后
- 每个 milestone 完成后
- 重大方案变更时
- 自动返工达到上限时
- 版本候选完成时

### 13.2 用户看到的内容

验收包应包括：

- 本轮目标
- 已完成内容
- 未完成内容
- 风险与已知问题
- 测试摘要
- review 结论
- 推荐决策
- 下一步计划

### 13.3 用户可执行动作

- 继续下一阶段
- 驳回并返工
- 调整范围
- 暂停项目
- 终止项目

## 14. OpenClaw 与 OpenCode 的接口契约

### 14.1 调度请求格式

管理层发给执行层的任务至少包含：

```yaml
task_id:
role:
title:
goal:
context:
constraints:
inputs:
expected_outputs:
verification_steps:
priority:
retry_context:
```

### 14.2 执行结果格式

执行层返回：

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

### 14.3 验证结果格式

```yaml
task_id:
verification_status:
checks:
  - name:
    result:
    details:
failed_reasons:
retryable:
recommended_action:
```

## 15. OpenCode 专家包结构建议

```text
opencode-expert-pack/
├─ opencode.jsonc
├─ agents/
│  ├─ architect.md
│  ├─ developer.md
│  ├─ tester.md
│  ├─ reviewer.md
│  ├─ docs.md
│  └─ security.md
├─ skills/
│  ├─ spec-analysis/
│  │  └─ SKILL.md
│  ├─ system-design/
│  │  └─ SKILL.md
│  ├─ implementation/
│  │  └─ SKILL.md
│  ├─ testing/
│  │  └─ SKILL.md
│  ├─ review/
│  │  └─ SKILL.md
│  └─ docs-sync/
│     └─ SKILL.md
├─ commands/
│  ├─ design-task.md
│  ├─ implement-task.md
│  ├─ test-task.md
│  ├─ review-task.md
│  └─ acceptance-summary.md
├─ templates/
│  ├─ spec-template.md
│  ├─ milestone-template.md
│  ├─ task-template.yaml
│  └─ acceptance-report-template.md
└─ rules/
   ├─ coding-rules.md
   ├─ testing-rules.md
   └─ review-rules.md
```

## 16. MVP 的最小技能集合

不建议一上来做很多 skill。  
MVP 阶段只做下面这些。

### 管理层需要的能力
- requirement clarification
- spec generation
- milestone planning
- task classification
- acceptance summary generation

### 执行层需要的能力
- codebase analysis
- design decomposition
- feature implementation
- bug fix workflow
- test generation
- review checklist
- doc synchronization

## 17. 关键策略与护栏

### 17.1 范围控制策略

防止需求膨胀：

- spec 中必须有 out-of-scope
- 每个 milestone 必须有固定边界
- 新需求默认进入 backlog，不自动混入当前轮

### 17.2 成本控制策略

- 每轮最大任务数限制
- 每任务最大自动返工次数
- 每 milestone 最大自动执行轮次
- 模型分级使用，高价值任务再用高成本模型

### 17.3 风险控制策略

高风险任务包括：

- 涉及认证 / 权限
- 涉及数据库迁移
- 涉及支付或安全逻辑
- 涉及大面积重构
- 涉及发布流程修改

这些任务必须进入增强审查路径。

### 17.4 终止条件

出现以下情况之一时终止自动流程：

- 用户明确终止
- 连续返工无收敛
- spec 多次重写仍不稳定
- 项目目标已失效
- 当前里程碑不再值得继续

## 18. 推荐的 MVP 实施顺序

### Phase 1：静态文档驱动闭环
先不接复杂运行器，先把对象和流程跑通：

- requirement -> spec
- spec -> milestones
- milestone -> tasks
- task -> agent dispatch
- execution -> verification -> acceptance report

先用文件和目录组织状态。

### Phase 2：接入 OpenCode 专家包
实现：

- architect
- developer
- tester
- reviewer

让任务真正按角色执行。

### Phase 3：加入自动返工循环
实现：

- 测试失败自动返工
- review 失败自动返工
- milestone 汇总自动生成

### Phase 4：加入定期验收
实现：

- milestone 周报
- 用户验收动作
- 继续 / 返工 / 暂停控制

## 19. 成功指标

MVP 成功不看“模型看起来聪不聪明”，而看流程是否真的闭环。

建议用这些指标：

### 流程指标
- 从需求输入到 spec 生成成功率
- 从 milestone 到任务拆分成功率
- 自动派发成功率
- 自动验证成功率
- 自动返工收敛率

### 质量指标
- 单测通过率
- review 一次通过率
- milestone 验收通过率
- 返工后通过率

### 产出指标
- 每轮交付可验收工件数量
- 文档同步完成率
- 用户仅在关键节点参与的比例

### 效率指标
- 用户每轮介入次数
- 需求到 milestone 完成的平均周期
- 单任务平均自动处理轮数

## 20. 最终 MVP 定义

本项目 MVP 的最终定义为：

> 一套由 OpenClaw 管理层与 OpenCode 执行层组成的自动化研发闭环系统。系统能够从用户输入的产品需求出发，自动完成需求规格化、里程碑规划、任务分派、角色化执行、测试与审查验证，并在每个 milestone 形成用户可验收的成果包，在失败时触发受控返工，在关键节点向用户请求决策，从而实现“默认自动推进、阶段性人工验收”的最小可行研发闭环。

## 21. 下一步落地建议

接下来最适合继续做的，不是再扩展概念，而是把这份总纲拆成 4 份实施文档：

1. **系统状态机与对象模型设计**
2. **OpenClaw 管理层调度设计**
3. **OpenCode 专家包设计**
4. **验收与返工机制设计**

这样就可以直接进入 repo 结构和配置实现阶段了。
