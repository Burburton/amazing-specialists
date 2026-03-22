# Package Spec

## Package Name
OpenCode 专家包 - 全自动产品研发闭环执行层

## Package Goal
构建一套可复用、可调度、可控的 OpenCode 专家包，为全自动产品研发闭环提供标准化的角色化执行能力。通过明确的角色边界、统一的 I/O 契约、沉淀的 skills 方法包，实现从需求到交付的自动化执行层。

## Problem Statement
当前 AI 辅助研发面临以下核心问题：
1. **角色模糊**：一个万能 agent 承担所有职责，导致架构设计与代码实现、测试验证与审查判断混为一谈
2. **输出不可控**：不同执行结果的格式、质量、完整性差异巨大，难以被下游稳定消费
3. **方法不可复用**：每次执行依赖 prompt 的随机性，缺乏可沉淀的方法论
4. **质量难保障**：缺乏明确的质量门禁和验证标准，失败时难以判断是局部问题还是结构性问题
5. **协作无规范**：多角色协作时缺乏清晰的交接规则和阻塞条件

## Target Use Cases
1. **新功能开发**：从 spec 到代码实现、测试、审查、文档同步的完整闭环
2. **Bug 修复**：接收 bug 报告，定位问题，实施修复，验证闭环
3. **架构设计**：针对中大型功能进行模块边界、接口契约、技术方案设计
4. **代码审查**：独立审查实现是否符合 spec 和设计，识别风险并给出可执行建议
5. **安全检查**：针对高风险变更（认证、权限、敏感数据）进行专项检查

## Non-Goals
1. **不解决商业决策**：如优先级取舍、资源分配、产品方向调整
2. **不解决复杂项目管理**：如多项目并行调度、长周期产品规划
3. **不直接上线生产环境**：发布部署操作由专门的 release 流程处理
4. **不替代用户验收**：最终产品验收仍由用户或产品层决策
5. **不做无限循环自治**：自动执行有明确的次数限制和升级阈值

## Target Users / Agents
1. **OpenClaw 管理层**（主要调用者）
   - 通过 dispatch payload 调用专家包角色
   - 接收 execution result 和 artifacts
   - 根据 recommendation 决策下一步动作

2. **人类操作员**
   - 在 escalation 时介入做关键决策
   - 在 milestone 验收节点审阅成果
   - 在异常时手动触发重规划

3. **其他专家包**
   - 通过标准化接口消费本包的输出 artifacts
   - 作为下游角色接收上游的交付物

## Supported Roles

本专家包包含 **6 个核心角色**作为**正式执行层模型**：

### 1. architect（架构师）
负责技术方案设计，输出 design note、interface contract、implementation plan。

必备 Skills：
- requirement-to-design
- module-boundary-design  
- interface-contract-design
- tradeoff-analysis

### 2. developer（开发者）
负责代码实现，输出代码变更、implementation summary、self-check report。

必备 Skills：
- feature-implementation
- bugfix-workflow
- refactor-safely
- code-change-selfcheck

### 3. tester（测试员）
负责测试设计与执行，输出 test report、coverage gap summary、regression result。

必备 Skills：
- unit-test-design
- integration-test-design
- regression-analysis
- edge-case-matrix

### 4. reviewer（审查员）
负责独立审查，输出 review report、approval decision、change request list。

必备 Skills：
- code-review-checklist
- spec-implementation-diff
- risk-review
- reject-with-actionable-feedback

### 5. docs（文档员）
负责文档同步，输出 doc update report、changelog entry、usage doc patch。

必备 Skills：
- readme-sync
- architecture-doc-sync
- changelog-writing

### 6. security（安全员）
负责高风险场景专项检查，输出 security report、security issue list、gate decision。

必备 Skills：
- auth-and-permission-review
- input-validation-review
- secret-handling-review
- dependency-risk-review

## Supported Skills

本专家包的技能分为两类：

### 1. 6-Role 正式 Skills（按角色组织）

| 角色 | Skills |
|------|--------|
| architect | requirement-to-design, module-boundary-design, tradeoff-analysis |
| developer | feature-implementation, bugfix-workflow, code-change-selfcheck |
| tester | unit-test-design, regression-analysis, edge-case-matrix |
| reviewer | code-review-checklist, spec-implementation-diff, reject-with-actionable-feedback |
| docs | readme-sync, changelog-writing |
| security | auth-and-permission-review, input-validation-review |

### 2. 3-Skill 过渡骨架（Bootstrap 用）

> **注意**：以下 skills 是**过渡实现**，用于支撑早期 bootstrap 流程，不是最终角色体系。详见 [docs/architecture/role-model-evolution.md](docs/architecture/role-model-evolution.md)。

| Skill | 用途 | 未来映射 |
|-------|------|----------|
| **spec-writer** | 将产品意图转为结构化 spec.md | bootstrap / upstream-spec-assist |
| **architect-auditor** | 将 spec 转为技术 plan，审计设计一致性 | architect + reviewer |
| **task-executor** | 执行具体任务 | developer + tester + docs + security |

### 3-Skill 与 6-Role 的关系

```
3-Skill（过渡骨架）          6-Role（正式模型）
├── spec-writer      →      bootstrap / upstream（非执行角色）
├── architect-auditor →     architect + reviewer
└── task-executor    →      developer + tester + docs + security
```

迁移策略：
- **当前阶段（002-role-model-alignment）**：语义对齐，物理保留 3-skill
- **后续阶段（003-008）**：实现 6-role 核心能力，逐步替代 3-skill
- **未来阶段**：物理重构 skills 目录，移除 3-skill

详细映射关系见：[docs/infra/migration/skill-to-role-migration.md](docs/infra/migration/skill-to-role-migration.md)

## Expected Inputs
专家包统一接收 Dispatch Payload，包含以下字段：

**必填字段：**
- dispatch_id: 本次派发唯一 ID
- project_id: 项目 ID
- milestone_id: 当前 milestone
- task_id: 目标 task
- role: 目标角色（architect/developer/tester/reviewer/docs/security）
- command: 指定命令入口
- title: 任务标题
- goal: 该任务必须达成的结果
- description: 任务详细说明
- context: 摘要上下文
- constraints: 不能违反的条件
- inputs: 工件引用或上下文片段
- expected_outputs: 输出要求
- verification_steps: 后续验证方式
- risk_level: 风险等级（low/medium/high/critical）

**可选字段：**
- retry_context: 返工相关信息
- upstream_dependencies: 上游依赖摘要
- downstream_expectations: 下游角色消费方式
- metadata: 扩展字段

## Expected Outputs
专家包统一输出 Execution Result，包含以下字段：

**标准结构：**
- dispatch_id: 关联的派发 ID
- project_id: 项目 ID
- milestone_id: milestone ID
- task_id: task ID
- role: 执行角色
- command: 执行的命令
- status: 执行状态（SUCCESS/SUCCESS_WITH_WARNINGS/PARTIAL/BLOCKED/FAILED_RETRYABLE/FAILED_ESCALATE）
- summary: 简要说明做了什么、是否达成目标、还缺什么
- artifacts: 本轮主要产物引用列表
- changed_files: 文件改动列表
- checks_performed: 已做的自检清单
- issues_found: 发现但未解决的问题
- risks: 当前剩余风险
- recommendation: 后续流向建议（CONTINUE/SEND_TO_TEST/SEND_TO_REVIEW/REWORK/REPLAN/ESCALATE）
- needs_followup: 是否需要后续跟进
- followup_suggestions: 跟进建议
- escalation: 升级信息（若需升级）
- metadata: 扩展字段

## Quality Requirements
专家包输出必须满足以下质量标准：

### 1. 完整性
- 必填字段全部存在
- 必须包含 assumptions
- 必须包含明确的 next step
- 必须明确 scope / out-of-scope

### 2. 一致性
- 术语统一，不混用同义词
- 不存在自相矛盾的规则
- 与上游 spec / plan 不冲突

### 3. 可追溯性
- 每个关键结论对应输入来源
- 每个 artifact 注明来源 spec 或 plan
- 需求能映射到设计，设计能映射到任务

### 4. 可消费性
- 输出必须让下游角色或管理层可以继续工作
- 不允许"见上文""见输出"之类模糊引用
- 不允许伪造未验证的结论

### 5. 显式暴露问题
- 必须说明哪些部分未验证
- 必须说明哪些判断基于假设
- 必须说明哪些问题需要下游继续检查

## Integration Points

### 上游集成（OpenClaw 管理层）
- 接收 OpenClaw 的 Dispatch Coordinator 派发的任务
- 消费 Requirement / Spec / Milestone / Task 对象
- 接收上游的约束条件和风险评级

### 下游集成（OpenClaw 管理层）
- 向 Acceptance & Recovery Coordinator 返回 Execution Result
- 输出 artifacts 供下游验证与审计
- 在失败时通过 Escalation 机制升级

### 横向集成（其他专家包）
- 通过统一 artifact 格式与 docs 专家包交换文档
- 通过统一接口与 security 专家包交换安全检查结果

## Risks and Limits

### 适用边界
1. **单项目限制**：MVP 阶段仅支持单项目、单主线流程
2. **语言限制**：当前主要面向代码类项目，不覆盖纯设计/纯文档项目
3. **规模限制**：适合中小规模功能，超大规模功能需要手动拆分为多个 milestone
4. **技术栈限制**：skills 实现需要针对具体技术栈（Python/Node/Java 等）定制

### 已知风险
1. **上下文膨胀风险**：大项目可能导致 dispatch payload 过大，需要 context-summarization skill 裁剪
2. **失败收敛风险**：局部返工可能无法解决结构性问题，需要 replan 机制兜底
3. **角色边界模糊风险**：实际执行中可能出现角色越权，需要 review 机制检查
4. **质量误判风险**：角色自评可能过于乐观，需要独立 verification 层裁定

### 不适用场景
- 需要人类创意判断的 UI/UX 设计
- 需要大量外部协调的跨团队项目
- 需要合规审计的金融/医疗等高监管行业首版实现

## Acceptance Criteria
专家包"可用"的判定标准：

1. **角色完整性**：6 个核心角色（architect/developer/tester/reviewer/docs/security）均有定义和最小 skill 集
2. **契约稳定性**：dispatch payload 和 execution result 的 schema 稳定且文档化
3. **流程闭环**：单条任务可以从分派到执行到验收完整跑通
4. **质量门禁**：每个角色有过自己的 role gate，能识别低质量输出
5. **失败处理**：支持返工、重规划、升级三种失败恢复路径
6. **可追溯性**：能从需求到实现到验证形成完整的 traceability chain
7. **可复用性**：skills 方法包可以在不同项目中复用
8. **示例验证**：examples/happy-path.md 描述的示例可以成功执行
