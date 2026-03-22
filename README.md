# OpenCode 专家包 - 全自动产品研发闭环执行层

## What It Is
OpenCode 专家包是一套围绕角色、skills、commands、rules、templates、artifacts 组织起来的执行能力包，用于支撑全自动产品研发闭环的代码执行层。

它是「全自动产品研发闭环 MVP」的第三层（执行层），承接 OpenClaw 管理层的调度指令，完成具体的设计、开发、测试、审查、文档同步与专项检查任务。

## What Problem It Solves
- 解决 AI 辅助研发中"一个万能 agent 什么都做"导致的角色模糊、质量不可控问题
- 通过角色化分工，让每个专家专注于特定职责（架构设计、开发、测试、审查、文档、安全）
- 提供标准化的输入输出契约，确保管理层与执行层之间的稳定接口
- 通过 skills 沉淀方法论，让执行过程可复用、可审计、可迭代

## Included Components
- **package-spec.md** - 专家包总体规格定义
- **role-definition.md** - 6 个核心角色定义（architect/developer/tester/reviewer/docs/security）
- **io-contract.md** - 统一的 dispatch/execution/artifact/escalation 契约
- **quality-gate.md** - 角色质量门禁与验证规则
- **collaboration-protocol.md** - 角色间协作与交接协议
- **package-lifecycle.md** - 版本管理与生命周期规范
- **AGENTS.md** - OpenCode 项目级执行规则
- **.opencode/commands/** - 5 个核心流程命令（spec-start/spec-plan/spec-tasks/spec-implement/spec-audit）
- **.opencode/skills/** - 3 个核心技能（spec-writer/architect-auditor/task-executor）
- **examples/** - 正例、边界例、失败例
- **specs/** - 本专家包自身功能的 spec-driven 开发目录

## How to Use

### 对于 OpenClaw 管理层调用者
1. 通过统一 dispatch payload 调用专家包角色
2. 接收统一 execution result 和 artifact
3. 根据 recommendation 决定下一步动作（CONTINUE/REWORK/REPLAN/ESCALATE）

### 对于专家包开发者
1. 阅读 package-spec.md 理解专家包定位
2. 阅读 role-definition.md 理解各角色边界
3. 阅读 io-contract.md 理解输入输出契约
4. 按 quality-gate.md 实现质量门禁
5. 遵循 collaboration-protocol.md 的交接规则

### 标准调用流程
```
User Input
  -> OpenClaw 管理层
    -> 需求澄清 -> 规格化 -> 里程碑规划 -> 任务分派
      -> OpenCode 专家包（本包）
        -> architect 设计
        -> developer 实现
        -> tester 验证
        -> reviewer 审查
        -> docs 同步文档
        -> security 专项检查（高风险场景）
      -> 返回 execution result
    -> 验收判断 -> 返工/继续/升级
  -> 用户验收
```

## Recommended Workflow

### 阶段 1：治理层初始化（当前阶段）
- 完善根目录治理文档（package-spec.md, role-definition.md, io-contract.md 等）
- 根据设计文档填充实际内容
- 建立与上层（OpenClaw）和下层（具体实现）的接口契约

### 阶段 2：核心角色 skills 实现
- 实现 architect 核心 skills（requirement-to-design, module-boundary-design, interface-contract-design, tradeoff-analysis）
- 实现 developer 核心 skills（feature-implementation, bugfix-workflow, refactor-safely, code-change-selfcheck）
- 实现 tester 核心 skills（unit-test-design, integration-test-design, regression-analysis, edge-case-matrix）
- 实现 reviewer 核心 skills（code-review-checklist, spec-implementation-diff, risk-review, reject-with-actionable-feedback）

### 阶段 3：命令与模板固化
- 固化 5 个核心命令的输入输出格式
- 建立统一的 artifact 模板（design_note, implementation_summary, test_report, review_report 等）
- 建立规则文件（coding-rules, testing-rules, review-rules）

### 阶段 4：验证与审计
- 跑通 specs/001-bootstrap 验证闭环
- 实现 quality gate 自动化检查
- 建立 traceability 追溯链

## System Position

本专家包位于三层架构的第三层：

```
Layer 1: 用户/产品输入层
Layer 2: OpenClaw 管理层（调度、规划、验收）
Layer 3: OpenCode 执行层（本专家包）- 角色化专业执行
```

### 上层依赖（OpenClaw 提供）
- dispatch payload（统一任务包）
- requirement / spec / milestone / task 对象
- 执行上下文和约束条件

### 下层输出（提供给 OpenClaw）
- execution result（统一执行结果）
- artifacts（设计文档、实现总结、测试报告、审查报告等）
- escalation（升级请求，当无法自动决策时）

## Limits

### 本专家包不解决
- 商业优先级取舍（由 OpenClaw 管理层或用户决策）
- 多项目资源仲裁（由 OpenClaw 管理层承担）
- 产品方向的重新定义（由用户或产品层决策）

### MVP 阶段限制
- 第一版仅支持单项目、单主线流程
- 暂不支持复杂并发任务调度
- 暂不支持长周期自我产品规划
- 暂不支持真实企业级权限审计系统

### 质量边界
- 角色输出仅代表"候选结果"，最终质量结论需通过 verification/acceptance 层裁定
- 任何角色都不能自证质量，必须经独立验证
- 自动返工有次数上限（普通 task 最多 2 次，中高风险 task 更少）

## References

- 《全自动产品研发闭环 MVP 设计稿》- 总体架构与目标定义
- 《OpenClaw 管理层调度设计》- 上层调度接口定义
- 《OpenCode 专家包设计》- 本包详细设计（角色、skill、command）
- 《角色质量保障规范》- 各角色的质量标准与 gate 定义
- 《验收与返工机制设计》- 验收流程与失败处理机制
