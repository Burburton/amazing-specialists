# 003-architect-core 完整需求设计文档

## 1. 文档定位

本文档定义 `003-architect-core` 的完整 feature 设计，用于指导 OpenCode 在 `amazing-specialists` 仓库中正式实现 `architect` 角色的核心能力体系。

本文档不是“最小开工草案”，而是 `architect-core` 的完整 feature 需求说明。其目标包括：

- 明确 architect 在 6-role 正式执行模型中的职责边界
- 定义 architect-core 的完整能力结构、目录结构、技能契约与工件体系
- 规定 architect 与 downstream roles（developer / tester / reviewer / docs / security）的交接接口
- 规定质量门、验证方式、失败模式、阶段拆解与交付范围
- 为后续 `004-developer-core`、`005-tester-core`、`006-reviewer-core`、`007-docs-core`、`008-security-core` 提供稳定上游输入

---

## 2. Feature 基本信息

- **Feature ID**: `003-architect-core`
- **Feature Name**: Architect Core Skills System
- **Feature Type**: 正式角色能力建设 / canonical role implementation
- **所属阶段**: 6-role 正式执行模型的第一阶段核心角色落地
- **前置条件**:
  - `002-role-model-alignment` 已完成角色语义统一
  - `002b-governance-repair` 已完成治理文档与 report 一致性收口
- **后续衔接**:
  - `004-developer-core`
  - `005-tester-core`
  - `006-reviewer-core`
  - `007-docs-core`
  - `008-security-core`

---

## 3. 背景

仓库已经完成从 legacy 3-skill（`spec-writer` / `architect-auditor` / `task-executor`）向 6-role 正式执行模型的治理迁移。后续 feature 不应继续以 legacy skill 命名为主线，而应以正式角色边界为准。

在正式角色模型中，`architect` 处于整个执行链条的上游核心位置，承担从 feature specification 到技术设计结构的转换职责。其输出直接影响：

- developer 的实现组织方式
- tester 的测试目标划分
- reviewer 的设计基线判断
- docs 的结构化说明生成
- security 的边界识别与风险切入点

如果 architect-core 不完整，后续所有角色都会出现输入不稳定、职责混叠、验收标准模糊的问题。

因此，`003-architect-core` 不是简单补几个 skill 文件，而是建立“设计层作为正式执行层一等公民”的完整实现。

---

## 4. Feature 总目标

本 feature 的总目标如下：

1. 在 `.opencode/skills/architect/` 下建立完整且可扩展的 architect core skill system
2. 明确 architect 的 role boundary、artifact contract、skill taxonomy、validation model
3. 建立 architect 的标准输出物，使 downstream roles 可以稳定消费
4. 建立 architect 的质量门、失败恢复规则、反模式说明
5. 建立 architect 与 command/workflow/package-docs 的最小整合位点
6. 为后续角色 feature 提供统一的设计上游协议

---

## 5. Architect 在正式执行模型中的角色定义

### 5.1 角色职责

Architect 是正式执行链中的设计责任方，其职责包括：

- 接收 feature spec、治理规则与上下文输入
- 将需求、约束、非目标、开放问题转化为结构化设计
- 定义模块边界、职责分层、依赖关系和集成接缝
- 对关键设计路径给出 tradeoff 分析
- 生成 downstream roles 可消费的设计工件
- 将不确定性显式暴露为 assumptions / risks / open questions
- 在不越界到实现、测试、审查、安全专项执行的前提下，为全链路提供架构基线

### 5.2 角色非职责

Architect 不负责：

- 替代 developer 做实现细节落地
- 替代 tester 设计详细测试用例与验证计划
- 替代 reviewer 做最终独立审批
- 替代 docs 做完整外部说明产出
- 替代 security 做深入安全专项检查
- 无依据地发明输入事实

### 5.3 上游输入

Architect 的典型上游输入包括：

- `specs/<feature>/spec.md`
- `specs/<feature>/plan.md`
- `specs/<feature>/tasks.md`
- `package-spec.md`
- `role-definition.md`
- `io-contract.md`
- `quality-gate.md`
- 历史 feature 工件
- 仓库目录结构与现有 package docs

### 5.4 下游消费者

Architect 的典型下游消费者包括：

- `developer`: 使用设计说明、模块边界、依赖分层和实现约束
- `tester`: 使用关键路径、边界条件、模块分层和集成接缝
- `reviewer`: 使用设计 rationale、tradeoff、未决问题和角色边界
- `docs`: 使用系统结构说明、模块职责和术语定义
- `security`: 使用边界定义、数据/信任边界和高风险区域提示

---

## 6. 设计原则

本 feature 必须遵循以下设计原则。

### 6.1 设计必须可消费
architect 输出不是为了“写得像架构文档”，而是为了让 downstream roles 直接使用。

### 6.2 设计必须映射需求
architect 不能只输出抽象方案，必须显式说明“需求 -> 设计”映射。

### 6.3 边界必须清楚
architect-core 不能演化成泛化 planner，也不能与 reviewer / developer 角色混叠。

### 6.4 不确定性必须显式
对于输入缺口、依赖缺失、规则模糊等情况，必须输出 assumptions 与 open questions，而不是隐式猜测。

### 6.5 技能体系必须可扩展
本 feature 要实现完整 architect-core，但目录、模板与 contract 应允许后续新增 advanced architect skills。

### 6.6 仍以 6-role 正式语义为准
legacy 3-skill 只允许出现在映射与兼容说明中，不作为主叙述框架。

---

## 7. Scope

## 7.1 In Scope

本 feature 完整覆盖 architect-core 的正式能力体系，至少包括：

### A. 角色边界层
- architect role scope
- architect/downstream interface definition
- de-legacy mapping note

### B. 核心技能层
至少实现以下 3 个 core skills：
1. `requirement-to-design`
2. `module-boundary-design`
3. `tradeoff-analysis`

### C. 工件契约层
至少建立以下标准输出工件：
- `design-note`
- `module-boundaries`
- `risks-and-tradeoffs`
- `open-questions`

### D. 质量与验证层
- cross-skill validation checklist
- downstream-consumability checklist
- failure-mode checklist
- anti-pattern guidance

### E. 教学与示例层
每个 skill 至少包括：
- `SKILL.md`
- `examples/`
- `anti-examples/`
- `templates/` 或 `checklists/`

### F. 工作流接入层
- architect skill 在 package/workflow 中的最小引用位点
- role docs / package docs 的最小必要更新
- feature completion 的交付规则说明

## 7.2 Out of Scope

以下内容不在本 feature 内：

- developer 的正式核心实现
- tester 的正式核心实现
- reviewer/docs/security 的完整核心技能交付
- legacy 3-skill 目录删除
- 全仓库命令系统大改造
- 具体业务 feature 的代码实现
- advanced architect skill（如 performance-architecture、security-boundary-design、migration-strategy-design）的正式实现

---

## 8. 交付结构总览

建议交付结构如下：

```text
specs/003-architect-core/
  spec.md
  plan.md
  tasks.md
  completion-report.md

.opencode/skills/architect/
  requirement-to-design/
    SKILL.md
    examples/
    anti-examples/
    templates/
    checklists/
  module-boundary-design/
    SKILL.md
    examples/
    anti-examples/
    templates/
    checklists/
  tradeoff-analysis/
    SKILL.md
    examples/
    anti-examples/
    templates/
    checklists/

docs/
  architecture/
    architect-core-overview.md        (如确有需要)
  infra/
    contracts/
      architect-artifacts-contract.md (如确有需要)
```

说明：
- `docs/` 下的补充文档只有在确有需要时才添加，避免 003 变成大规模 docs feature。
- 以 `specs/` 和 `.opencode/skills/architect/` 为主交付面。

---

## 9. Skill Taxonomy

Architect-core 的完整 taxonomy 设计如下：

### 9.1 Core Skills（本次必须实现）
- `requirement-to-design`
- `module-boundary-design`
- `tradeoff-analysis`

### 9.2 Supporting Assets（本次必须实现）
- artifact templates
- output checklists
- examples
- anti-examples
- validation criteria

### 9.3 Future Expansion（本次只留扩展口，不实现）
- `interface-contract-design`
- `dependency-shaping`
- `architecture-risk-framing`
- `migration-path-design`
- `extensibility-planning`
- `operational-boundary-design`

---

## 10. Skill 详细定义

## 10.1 Skill A: requirement-to-design

### 目标
将 feature spec 中的目标、约束、非目标、依赖与未决项转换为结构化设计说明。

### 典型输入
- `spec.md`
- `plan.md`
- package governance docs
- feature assumptions
- legacy context（若存在）

### 典型输出
- `design-note`
- requirement-to-design mapping section
- assumptions
- open questions
- design baseline

### 必做动作
- 提炼功能目标、约束、非目标
- 识别 spec 中的结构空洞
- 建立需求到设计的映射关系
- 区分 confirmed facts 与 assumptions
- 标明需要 downstream 或 human 决策的 unresolved items

### 质量标准
- 不仅复述需求，而是形成设计组织
- 非目标被显式保留，避免设计膨胀
- assumptions 与 facts 清楚区分
- open questions 不被隐藏

### 常见失败模式
- 改写 spec 但没有设计结构
- 省略 non-goals
- 假设输入完备
- 直接推导实现而跳过设计层

### 必备产物
- `SKILL.md`
- 一个正例
- 一个反例
- 一个 design-note 模板
- 一个 requirement mapping checklist

---

## 10.2 Skill B: module-boundary-design

### 目标
定义模块划分、职责边界、依赖方向、集成接缝和 future extension 边界。

### 典型输入
- `design-note`
- spec 与 plan
- 仓库当前结构
- io-contract / role-definition

### 典型输出
- `module-boundaries`
- responsibility table
- dependency map
- integration seam notes
- out-of-scope boundary note

### 必做动作
- 划分模块与职责
- 定义输入输出边界
- 说明依赖方向
- 标明哪里允许扩展，哪里必须保持稳定
- 为 downstream roles 提供清晰切入面

### 质量标准
- 模块边界有清晰职责，不是随目录凑分组
- 高耦合区域被显式识别
- 模块之间的交接清晰
- 可为 tester/reviewer 提供稳定审查基线

### 常见失败模式
- 只按文件夹划分模块
- 责任重叠
- 没有依赖方向
- 没有集成接缝定义
- 没有 future extension 边界

### 必备产物
- `SKILL.md`
- 一个正例
- 一个反例
- 一个 module-boundaries 模板
- 一个 boundary quality checklist

---

## 10.3 Skill C: tradeoff-analysis

### 目标
对关键架构决策提供显式取舍分析、替代方案评估和未来重访条件。

### 典型输入
- design alternatives
- constraints
- maintainability concerns
- extensibility expectations
- risk notes

### 典型输出
- `risks-and-tradeoffs`
- chosen approach
- rejected alternatives
- risk rationale
- revisit triggers

### 必做动作
- 对关键方案做比较
- 说明为什么选中当前方案
- 说明放弃方案的理由
- 标出当前方案的代价
- 标出未来重访条件

### 质量标准
- 至少呈现有意义的替代分析（若确有替代）
- 不能只写结论，必须有 rationale
- 必须有代价说明，不只写收益
- 必须有 revisit trigger

### 常见失败模式
- 只写“推荐方案”
- 没有 alternatives
- 用空泛语言代替真实权衡
- 忽略维护成本、复杂度、协作代价

### 必备产物
- `SKILL.md`
- 一个正例
- 一个反例
- 一个 tradeoff template
- 一个 rationale checklist

---

## 11. Artifact Contract（完整定义）

Architect-core 必须建立稳定的标准输出工件体系。

## 11.1 `design-note`

### 作用
作为设计基线文档，承接 spec 到 architecture 的主要转换结果。

### 必含字段
- 背景
- feature 目标
- 输入来源
- 需求到设计映射
- 设计摘要
- constraints
- non-goals
- assumptions
- open questions

### 消费者
- developer
- tester
- reviewer
- docs

---

## 11.2 `module-boundaries`

### 作用
定义模块边界、职责、依赖与集成接缝。

### 必含字段
- 模块列表
- 模块职责
- 输入/输出
- 依赖方向
- 集成接缝
- future extension boundary
- explicit non-responsibilities

### 消费者
- developer
- tester
- reviewer
- security

---

## 11.3 `risks-and-tradeoffs`

### 作用
记录设计决策的权衡、风险与后续重访触发条件。

### 必含字段
- decision point
- alternatives considered
- selected approach
- rejected approaches
- tradeoff rationale
- risks introduced
- revisit trigger

### 消费者
- reviewer
- security
- docs
- future architect work

---

## 11.4 `open-questions`

### 作用
显式暴露当前尚未确定但影响设计质量的问题。

### 必含字段
- question
- why it matters
- temporary assumption
- impact surface
- recommended next step

### 消费者
- human decision makers
- reviewer
- developer
- future feature planners

---

## 12. Validation Model

Architect-core 必须定义完整验证模型，而不只是“看起来写得还行”。

## 12.1 Skill-level Validation
每个 skill 必须检查：
- 输入是否明确
- 输出是否完整
- checklist 是否可执行
- example 是否能展示正确使用方式
- anti-example 是否能展示常见错误

## 12.2 Artifact-level Validation
每种工件必须检查：
- 字段是否齐全
- 是否适合 downstream 消费
- 是否存在隐式假设未标注
- 是否遗漏关键边界

## 12.3 Cross-role Validation
必须验证 architect 输出是否对以下角色有用：
- developer 是否可基于其组织实现
- tester 是否可基于其组织验证
- reviewer 是否可基于其判断设计合理性

## 12.4 Consistency Validation
必须验证与以下 canonical docs 一致：
- `package-spec.md`
- `role-definition.md`
- `io-contract.md`
- `quality-gate.md`

---

## 13. Anti-Patterns

本 feature 必须明确以下 anti-pattern，并在 skills 中有所体现：

1. **Spec Parroting**
   只是复述 spec，没有设计转换。

2. **Folder-Driven Architecture**
   只根据目录结构假装完成模块设计。

3. **Decision Without Alternatives**
   直接下结论，没有 tradeoff 过程。

4. **Silent Assumptions**
   输入不全时隐式猜测，不输出 assumptions / open questions。

5. **Role Bleeding**
   architect 越界承担 developer/reviewer/security 的正式职责。

6. **Over-Abstract Design**
   输出大量抽象概念，但对下游没有消费价值。

7. **No Future Boundary**
   没有明确 future extension 与当前 scope 边界。

---

## 14. 与其他角色的接口定义

## 14.1 Architect -> Developer
architect 必须提供：
- design-note
- module-boundaries
- implementation constraints
- integration seam notes

developer 不应要求 architect 直接交付实现方案细节到代码级。

## 14.2 Architect -> Tester
architect 必须提供：
- 模块划分
- 关键路径
- 边界条件提示
- 集成接缝说明
- 风险集中区域提示

## 14.3 Architect -> Reviewer
architect 必须提供：
- decision rationale
- tradeoff analysis
- assumptions / open questions
- scope boundary definition

## 14.4 Architect -> Docs
architect 应提供：
- 模块职责摘要
- 设计术语
- 关键结构说明

## 14.5 Architect -> Security
architect 应提供：
- 高风险边界区提示
- 依赖/边界信息
- 潜在 trust boundary 或 sensitive path note（如适用）

---

## 15. 实施阶段

完整 feature 建议分 5 个阶段实施。

## Phase 1: Role Scope Finalization
目标：
- 定义 architect 的角色边界
- 明确与 legacy 3-skill 的映射
- 固化本 feature 的 skill taxonomy

交付：
- `spec.md`
- `plan.md`
- `tasks.md`
- role scope note

## Phase 2: Core Skill Authoring
目标：
- 编写 3 个 core skills 的 `SKILL.md`
- 明确 input/output/checklists/failure modes

交付：
- 3 个 `SKILL.md`

## Phase 3: Examples / Templates / Checklists
目标：
- 为每个 skill 补齐 examples、anti-examples、templates、checklists

交付：
- 各 skill 的 supporting assets

## Phase 4: Artifact Contract & Workflow Hook
目标：
- 固化 architect artifact contract
- 在 package/workflow 层提供最小引用

交付：
- artifact contract 说明
- 必要的 package refs

## Phase 5: Final Validation & Completion
目标：
- 做一致性验证
- 做 cross-role consumability 验证
- 输出 completion-report

交付：
- `completion-report.md`

---

## 16. 任务拆解（完整版本）

### T-001 Define architect role scope
输出：
- architect scope statement
- role responsibilities / non-responsibilities

### T-002 Define de-legacy mapping
输出：
- architect vs spec-writer / architect-auditor mapping note
- terminology alignment note

### T-003 Define architect skill taxonomy
输出：
- core/supporting/future taxonomy
- naming rationale

### T-004 Create feature spec package
输出：
- `spec.md`
- `plan.md`
- `tasks.md`

### T-005 Implement requirement-to-design skill
输出：
- `SKILL.md`
- examples
- anti-examples
- templates
- checklist

### T-006 Implement module-boundary-design skill
输出：
- `SKILL.md`
- examples
- anti-examples
- templates
- checklist

### T-007 Implement tradeoff-analysis skill
输出：
- `SKILL.md`
- examples
- anti-examples
- templates
- checklist

### T-008 Define architect artifact contracts
输出：
- design-note contract
- module-boundaries contract
- risks-and-tradeoffs contract
- open-questions contract

### T-009 Define cross-skill validation model
输出：
- skill validation checklist
- artifact validation checklist
- downstream consumability checklist

### T-010 Add minimal workflow references
输出：
- package/workflow references
- any required docs notes

### T-011 Run consistency review
输出：
- alignment check against canonical docs

### T-012 Write completion report
输出：
- `completion-report.md`

---

## 17. Acceptance Criteria（完整版本）

### AC-001
`specs/003-architect-core/spec.md`、`plan.md`、`tasks.md`、`completion-report.md` 全部建立完成。

### AC-002
`.opencode/skills/architect/` 下至少建立 3 个正式 core skills：
- `requirement-to-design`
- `module-boundary-design`
- `tradeoff-analysis`

### AC-003
每个 skill 都具备：
- `SKILL.md`
- 明确输入
- 明确输出
- 质量检查点
- 失败模式
- example
- anti-example
- template 或 checklist

### AC-004
architect 的标准工件契约已明确：
- `design-note`
- `module-boundaries`
- `risks-and-tradeoffs`
- `open-questions`

### AC-005
architect 与 developer/tester/reviewer 的交接接口已在文档中明确，且输出对 downstream roles 可消费。

### AC-006
本 feature 与 canonical docs 保持一致，不重新引入 legacy 3-skill 作为主语义框架。

### AC-007
已建立 anti-pattern guidance，能明确指出 architect-core 的典型失败方式。

### AC-008
completion-report 能明确说明：
- 已交付内容
- 未覆盖的 future expansions
- 对 004/005/006 的输入价值

### AC-009
本 feature 未越界到 developer/tester/reviewer/docs/security 的正式核心实现。

### AC-010
整个 feature 可被视为 architect 角色的正式第一阶段完整落地，而不是仅仅开工。

---

## 18. 风险与控制

### 风险 1：feature 过大，导致 OpenCode 发散
控制：
- 先完成 spec/plan/tasks，再按任务顺序实现，不允许乱跳。

### 风险 2：skill 有名无实
控制：
- 每个 skill 强制要求 example / anti-example / template / checklist。

### 风险 3：architect 越界
控制：
- 在 spec 与 skills 中明确 non-responsibilities。

### 风险 4：工件无法消费
控制：
- 引入 downstream-consumability checklist。

### 风险 5：又回到 legacy 3-skill 叙事
控制：
- 所有主命名与主描述都使用 6-role 语义。

---

## 19. 推荐给 OpenCode 的执行方式

建议 OpenCode 按以下顺序执行：

1. 创建 `specs/003-architect-core/` 四件套
2. 固化 architect role scope / taxonomy / task breakdown
3. 逐个实现 3 个 core skills
4. 为每个 skill 补 supporting assets
5. 固化 artifact contract
6. 做一致性验证
7. 输出 completion-report

禁止做法：
- 一上来就同时铺很多 future architect skills
- 把 003 做成全角色大包
- 一边写一边临时改 feature scope
- 把 example / anti-example / checklist 留到以后

---

## 20. 最终结论

`003-architect-core` 的完整目标，不是“先有个最小框架”，而是把 architect 正式建成一个可执行、可验证、可交接、可扩展的核心角色。

完成后应达到的状态是：

- architect 的角色边界清晰
- 3 个 core skills 全部正式存在
- 每个 skill 拥有完整 supporting assets
- architect 的标准工件体系稳定
- downstream roles 可以明确知道如何消费 architect 输出
- 仓库从“治理完成”真正进入“角色能力建设阶段”
