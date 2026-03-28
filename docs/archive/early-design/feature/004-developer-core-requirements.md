# 004-developer-core 需求文档

## 1. 文档定位

本文档用于启动 `004-developer-core`，目标是在现有治理基线与 003-architect-core 已交付产物之上，把 developer 角色的 3 个核心 skills 从“已存在目录与草稿内容”推进到“正式可交付、可审计、可被下游消费的核心 feature”。

本次 004 不做 tester / reviewer / docs / security 的正式实现，只负责 developer 角色核心能力的规格化、收口、验证与治理同步。

---

## 2. 背景与当前状态

仓库已经明确采用 6-role 正式执行层模型，developer 是其中的正式执行角色之一。当前仓库状态显示：

- `003-architect-core` 已正式关闭，状态为 **Substantially Complete with Known Gaps**，可作为 004 的上游输入。
- `.opencode/skills/developer/` 目录已经存在 3 个 developer skills：
  - `feature-implementation`
  - `bugfix-workflow`
  - `code-change-selfcheck`
- 但这些 developer skills 仍需要通过一个正式 feature（`004-developer-core`）完成：
  - 范围定义
  - 输入输出契约对齐
  - 与 003 的接口衔接
  - 验证材料落盘
  - completion-report / downstream-interfaces / role-scope 等 feature 级文档收口
  - README / governance 文档同步（如需要）

换句话说，004 的核心不是“从 0 写出 developer skill 的想法”，而是把已有 developer skill 资产升级为 **正式核心角色交付**。

---

## 3. 004 的目标

### 3.1 主目标

完成 developer 角色核心能力的正式化交付，使 developer 能作为 6-role 正式模型中的执行角色，被 OpenClaw / OpenCode 稳定调用，并能向 tester / reviewer / docs 输出可消费产物。

### 3.2 具体目标

1. 明确 developer 在正式模型中的边界、职责、输入、输出、升级条件。
2. 将 3 个 developer skills 统一收口为一个可审计的 feature 包。
3. 与 003-architect-core 形成清晰的上游 / 下游接口。
4. 为后续 005-tester-core、006-reviewer-core、007-docs-core 提供稳定输入。
5. 补齐验证材料，证明 developer skills 不只是“存在”，而是“可用、可交付、可验证”。

---

## 4. 004 的非目标

以下内容 **不属于** 本次 004 范围：

1. 不启动 005/006/007/008 的正式 feature 实现。
2. 不重写 6-role 治理模型。
3. 不重做 003 的 architect 主体内容。
4. 不做大规模命令系统重构。
5. 不把所有质量门禁自动化到 CI。
6. 不扩展为完整“通用编程代理平台”。
7. 不把 tester / reviewer / docs / security 的职责混入 developer。

---

## 5. 004 的上游输入

### 5.1 Canonical Governance Inputs

004 必须对齐以下 canonical 文档：

- `package-spec.md`
- `role-definition.md`
- `io-contract.md`
- `quality-gate.md`
- `AGENTS.md`
- `README.md`

### 5.2 Functional Upstream Inputs

004 必须消费以下上游信息：

- `003-architect-core` 的 role-scope、contracts、downstream-interfaces、completion-report
- `.opencode/skills/developer/feature-implementation/SKILL.md`
- `.opencode/skills/developer/bugfix-workflow/SKILL.md`
- `.opencode/skills/developer/code-change-selfcheck/SKILL.md`
- `.opencode/commands/` 中与 spec workflow 相关的现有命令文档

### 5.3 Role-Level Input Assumptions

developer 的正式定位应基于现有 role-definition：

- mission：根据 task 描述和 design note 完成代码实现，输出可交付的代码变更和实现总结
- required inputs：task description / goal / constraints / code context
- optional inputs：design note / spec 片段 / 上轮失败信息 / upstream task artifacts
- expected outputs：changed files / implementation summary / self-check result / unresolved issues
- downstream consumers：tester / reviewer / docs

---

## 6. 004 的核心问题陈述

当前 developer 相关资产虽然已经存在，但仍有以下待收口问题：

1. **技能已存在，但 feature 级收口未完成**
   - 需要通过 `spec.md / plan.md / tasks.md / completion-report.md` 将 developer 核心能力形成一个正式 feature。

2. **需要与 003 架构输出建立明确接口**
   - developer 应如何消费 architect 的 design note、边界设计、tradeoff 结论，需要在 004 中明确。

3. **需要定义 developer 对下游的正式输出面**
   - tester、reviewer、docs 分别消费哪些 developer 产物，必须可审计。

4. **需要形成 role 级验证闭环**
   - 不能只证明 skill 文件存在，还要证明 developer 角色在 feature implementation / bugfix / self-check 三类典型场景下可用。

5. **需要避免角色边界污染**
   - developer 可以实现代码，但不能替代 tester 做验收、不能替代 reviewer 做独立审查、不能替代 docs 做正式文档同步。

---

## 7. 004 的范围定义

### 7.1 In Scope

本次 004 至少应覆盖以下内容：

#### A. Feature 级文档骨架
在 `specs/004-developer-core/` 下创建并收口至少以下文档：

- `spec.md`
- `plan.md`
- `tasks.md`
- `role-scope.md`
- `downstream-interfaces.md`
- `completion-report.md`
- `contracts/`（按需要）
- `validation/`（按需要）

#### B. Developer Core Skills 正式化
以正式模型而不是 legacy 术语为准，覆盖：

1. `feature-implementation`
   - 面向明确 task + design note 的实现流程
   - 强调 goal alignment、范围控制、实现总结

2. `bugfix-workflow`
   - 面向问题复现、根因定位、最小修复、回归验证
   - 强调 bugfix 闭环与最小改动原则

3. `code-change-selfcheck`
   - 面向提交前自检
   - 强调目标对齐、设计一致、范围控制、依赖、测试、文档、安全、性能等检查维度

#### C. 角色边界与协作关系落盘
明确 developer 与以下角色的边界：

- 上游：architect / OpenClaw
- 下游：tester / reviewer / docs
- 特殊高风险场景：security 追加介入

#### D. I/O 与 Artifact 对齐
developer 交付物必须与统一 I/O 契约对齐，至少明确：

- 输入 payload 需要什么字段
- 输出 execution result 如何组织
- implementation summary 的最小字段要求
- self-check result 的最小字段要求
- unresolved issues 如何表达
- changed files 如何表达

#### E. 验证资产
必须至少提供能证明以下场景可用的验证资产：

- 场景 1：按 design note 实现 feature
- 场景 2：修复 bug 并形成闭环
- 场景 3：提交前进行 code-change-selfcheck

### 7.2 Out of Scope

以下内容不应被 004 顺手扩展进去：

- tester 的测试矩阵正式实现
- reviewer 的审查流程正式实现
- docs 的文档同步流程正式实现
- security 的专项审查正式实现
- commands 系统全面重写
- CI 自动执行所有 quality gate

---

## 8. 004 的关键设计要求

### 8.1 正式模型优先

004 必须围绕 6-role 正式模型展开，禁止把 developer 核心定义回退成 `task-executor` 语义变体。

### 8.2 最小闭环优先

004 不要求把 developer 做成“万能代理”，而是要求先跑通一个最小但正式的 developer 闭环：

- 收到 task / design
- 实施代码改动
- 产生实现总结
- 做最小自检
- 输出供 tester/reviewer/docs 消费的产物

### 8.3 明确区分三类工作流

必须在 004 中清楚区分：

- 新功能实现：`feature-implementation`
- Bug 修复：`bugfix-workflow`
- 提交前自检：`code-change-selfcheck`

不允许三者混成一个泛化流程，导致适用场景不清。

### 8.4 输出必须可下游消费

developer 输出不能只写“实现已完成”，而必须能让 tester / reviewer / docs 直接消费。

至少要做到：

- tester 能据此知道验证目标、关键路径、变更文件
- reviewer 能据此对照 spec / design 审查实现
- docs 能据此同步 README / CHANGELOG / 使用说明

### 8.5 明确升级条件

004 必须保留 developer 的升级边界，包括但不限于：

- 关键上下文缺失
- design 与现状冲突无法裁定
- 工具 / 环境阻塞
- task 自身定义有问题
- 发现架构级变更需求

### 8.6 不伪造验证

completion-report 不得把“skill 文件存在”伪装成“developer role 已 fully validated”。
必须诚实区分：

- 已定义
- 已落盘
- 已演练
- 已验证
- 仍有 known gap

---

## 9. 004 建议交付物清单

建议至少交付以下产物：

### 9.1 Feature 文档

- `specs/004-developer-core/spec.md`
- `specs/004-developer-core/plan.md`
- `specs/004-developer-core/tasks.md`
- `specs/004-developer-core/role-scope.md`
- `specs/004-developer-core/downstream-interfaces.md`
- `specs/004-developer-core/completion-report.md`

### 9.2 Contracts

按需要新增到 `specs/004-developer-core/contracts/`：

- `developer-input-contract.md`
- `implementation-summary-contract.md`
- `self-check-report-contract.md`
- `handoff-to-tester-contract.md`
- `handoff-to-reviewer-contract.md`
- `handoff-to-docs-contract.md`

### 9.3 Validation

按需要新增到 `specs/004-developer-core/validation/`：

- `feature-implementation-validation.md`
- `bugfix-workflow-validation.md`
- `code-change-selfcheck-validation.md`
- `role-integration-validation.md`

### 9.4 Skill-Level Fixups（仅在必要时）

如果现有 developer skills 存在明显缺口，可做最小修补，但禁止无边界重写。

可接受的修补包括：

- 补充 missing sections
- 补齐 output schema
- 修正与 canonical docs 冲突的表述
- 补充 escalation / handoff / known limits

---

## 10. 验收标准（Acceptance Criteria）

### AC-001 Developer Role Scope Complete

`role-scope.md` 能清楚定义 developer 的：

- mission
- in scope / out of scope
- trigger conditions
- required / optional inputs
- expected outputs
- escalation rules
- upstream / downstream role dependencies

### AC-002 Three Core Skills Formally Mapped

3 个 developer skills 都被正式纳入 004，并且：

- 各自适用场景清楚
- 无明显职责重叠混乱
- 与 role-definition 的 developer 定位一致

### AC-003 Output Contracts Consumable

developer 的输出契约足够清楚，使 tester / reviewer / docs 能直接消费。

### AC-004 Validation Exists

至少存在 3 类场景的验证材料：

- 新功能实现
- bugfix 闭环
- 提交前自检

### AC-005 Canonical Alignment Pass

004 与以下文档无关键冲突：

- `package-spec.md`
- `role-definition.md`
- `io-contract.md`
- `quality-gate.md`
- `AGENTS.md`
- `README.md`

### AC-006 Downstream Readiness Proven

能明确证明 004 的交付物已经具备进入 005/006/007 的基础条件。

### AC-007 Completion State Truthful

`completion-report.md` 对 004 的状态表述真实，不夸大，不伪造 fully complete。

---

## 11. 建议任务拆解

### Task Group A：Spec 与范围收口

1. 梳理 developer role 的 canonical 定义
2. 梳理现有 3 个 developer skill 的内容与边界
3. 生成 `spec.md`
4. 生成 `plan.md`
5. 生成 `tasks.md`

### Task Group B：Role Scope 与 Interface

6. 生成 `role-scope.md`
7. 生成 `downstream-interfaces.md`
8. 对齐 003 → 004 的上游接口
9. 对齐 004 → 005/006/007 的下游接口

### Task Group C：Contracts

10. 设计 developer input/output contracts
11. 定义 implementation summary 最小字段
12. 定义 self-check report 最小字段
13. 定义 handoff contracts

### Task Group D：Validation

14. 设计 feature implementation 场景验证
15. 设计 bugfix 场景验证
16. 设计 self-check 场景验证
17. 设计 role integration 验证

### Task Group E：Closeout

18. 生成 `completion-report.md`
19. 检查 README / governance 是否需要同步
20. 执行 spec-audit
21. 修复 findings
22. 完成 closeout

---

## 12. 风险与常见失败模式

### 12.1 角色边界污染

风险：developer 被写成“既实现、又测试、又审查、又同步文档”的万能角色。  
要求：严格保持 developer 的正式边界。

### 12.2 只落技能，不落接口

风险：skill 文件写得很多，但 tester / reviewer / docs 不知道怎么消费。  
要求：downstream-interfaces 与 contracts 必须明确。

### 12.3 只写流程，不做验证

风险：004 看起来完整，但没有证据证明技能能跑。  
要求：validation/ 必须落盘。

### 12.4 把已有草稿当成正式完成

风险：因为 developer 技能目录已经存在，就误判 004 已完成。  
要求：必须以 feature 级交付、验证和 closeout 为准。

### 12.5 与 003 接口松散

风险：architect 输出如何进入 developer 没有清晰说明。  
要求：明确 design note / contracts / handoff 关系。

---

## 13. 推荐实施策略

建议采用以下策略：

1. **先收口 spec，再动 skill fixups**
   - 先定义 004 到底交什么，不要一上来大量改 skill 文本。

2. **优先做接口与验证，不优先做“润色”**
   - 004 的关键不是写得漂亮，而是 developer 作为正式角色能被消费、能被验证。

3. **严格控制改动面**
   - developer skill 若已基本可用，优先补齐缺口，不重写全部内容。

4. **先证明 004 自己成立，再考虑和 005/006/007 的联动增强**
   - 先把 developer 核心站稳。

---

## 14. 完成定义（Definition of Done）

只有在以下条件同时满足时，004 才可关闭：

1. `specs/004-developer-core/` feature 目录完整落盘。
2. 3 个 developer skills 被正式纳入 004，并完成边界澄清。
3. 存在清楚的 developer 输入/输出契约。
4. 存在可审计的验证材料。
5. completion-report 对状态表述真实。
6. 与 canonical governance docs 无关键冲突。
7. downstream readiness 有明确证据。
8. spec-audit 通过，或 findings 已被修复 / 明确接受。

---

## 15. 给 OpenCode 的启动指令（可直接投喂）

```text
请启动正式 feature：004-developer-core。

目标：
在现有治理基线、developer role 定义、现有 developer skills 目录、以及已正式关闭的 003-architect-core 基础上，完成 developer 角色核心能力的正式化交付。

本次 004 的本质：
不是从零发明 developer，而是把已有 developer skills（feature-implementation / bugfix-workflow / code-change-selfcheck）收口为一个正式、可审计、可验证、可下游消费的核心 feature。

执行要求：
1. 使用 spec workflow 启动 004：spec / plan / tasks / implement / audit
2. 在 `specs/004-developer-core/` 下建立完整 feature 目录
3. 至少交付：
   - spec.md
   - plan.md
   - tasks.md
   - role-scope.md
   - downstream-interfaces.md
   - completion-report.md
   - contracts/
   - validation/
4. 必须覆盖 3 个 developer 核心 skills：
   - feature-implementation
   - bugfix-workflow
   - code-change-selfcheck
5. 必须对齐 canonical documents：
   - package-spec.md
   - role-definition.md
   - io-contract.md
   - quality-gate.md
   - AGENTS.md
   - README.md
6. 必须明确：
   - developer 的正式边界
   - 003 -> 004 的上游输入关系
   - 004 -> tester / reviewer / docs 的下游输出关系
   - implementation summary / self-check report / unresolved issues 的最小契约
7. 必须提供验证材料，至少证明：
   - 按 design note 实现 feature
   - bugfix 闭环
   - code-change-selfcheck 可执行
8. 不要扩展到 005/006/007/008 的正式实现
9. 不要把 developer 写成万能角色
10. 不要把 skill 已存在误判成 feature 已完成

验收目标：
- 004 完成后，developer 角色应可被视为正式核心执行角色
- developer 产物应可直接被 tester / reviewer / docs 消费
- 004 应具备进入后续 005/006/007 的上游条件

输出要求：
1. 先给出 004 的 spec
2. 再给出 plan
3. 再给出 tasks
4. 实施过程中严格控制改动面
5. 最终给出 completion-report 和 audit 结果
```

---

## 16. 推荐命名与状态策略

### 命名

- feature 名称固定为：`004-developer-core`
- 不要使用：
  - `004-task-executor-upgrade`
  - `004-coding-agent-core`
  - `004-implementation-engine`

### 状态建议

开发阶段建议使用：

- Draft
- Planned
- In Progress
- Conditional Release
- Closed

如果存在已知缺口，建议使用：

- **Substantially Complete with Known Gaps**

不要在 completion-report 中轻易使用无保留的 Fully Complete，除非验证和下游接口都已充分证明。

---

## 17. 对你当前推进节奏的建议

最合理的主线是：

- 003 已关闭
- 现在正式进入 004
- 004 做 developer 核心闭环
- 之后按顺序推进 005 / 006 / 007 / 008
- 003b-architect-examples 仅作为可选 enhancement backlog，不阻塞主线

