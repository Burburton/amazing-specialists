# OpenCode 专家包 MVP 目录骨架

## 1. 文档目的

本文档用于定义 **OpenCode 专家包 MVP** 的目录骨架、文件分层、命名规范与第一版落地范围，目标是让该专家包可以直接作为一个独立目录或独立仓库使用，并能被 OpenClaw 管理层稳定调度。

本文档解决的问题包括：

- OpenCode 专家包第一版应该长成什么目录结构
- 每个目录负责什么
- 每个目录里第一版应该放哪些文件
- 哪些文件是 MVP 必做，哪些可后补
- agent、skill、command、template、rule 之间如何分层
- 如何保证目录结构支持后续扩展，而不是第一版就写乱

---

## 2. 设计目标

MVP 目录骨架需要满足以下目标：

1. **可直接落地**
   - 拿去建目录就能开始填内容

2. **层次清晰**
   - 角色、skills、commands、rules、templates 分层明确

3. **先小后大**
   - 第一版只覆盖核心角色和核心动作

4. **支持调度**
   - OpenClaw 可以通过统一路径和约定调用专家包

5. **便于扩展**
   - 后续新增角色、skills、commands 时不需要推翻目录结构

---

## 3. MVP 范围

MVP 只覆盖以下核心角色：

- architect
- developer
- tester
- reviewer

可选但推荐加入：

- docs

高风险项目建议加入：

- security

第一版不强制做：

- performance
- release
- 多语言 / 多领域 skill 包
- 复杂 provider routing
- 多租户配置

---

## 4. 顶层目录结构

建议第一版采用如下目录结构：

```text
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
│  │  ├─ artifact-reading/
│  │  │  └─ SKILL.md
│  │  ├─ context-summarization/
│  │  │  └─ SKILL.md
│  │  ├─ failure-analysis/
│  │  │  └─ SKILL.md
│  │  └─ execution-reporting/
│  │     └─ SKILL.md
│  ├─ architect/
│  │  ├─ requirement-to-design/
│  │  │  └─ SKILL.md
│  │  ├─ interface-contract-design/
│  │  │  └─ SKILL.md
│  │  └─ tradeoff-analysis/
│  │     └─ SKILL.md
│  ├─ developer/
│  │  ├─ feature-implementation/
│  │  │  └─ SKILL.md
│  │  ├─ bugfix-workflow/
│  │  │  └─ SKILL.md
│  │  └─ code-change-selfcheck/
│  │     └─ SKILL.md
│  ├─ tester/
│  │  ├─ unit-test-design/
│  │  │  └─ SKILL.md
│  │  ├─ regression-analysis/
│  │  │  └─ SKILL.md
│  │  └─ edge-case-matrix/
│  │     └─ SKILL.md
│  ├─ reviewer/
│  │  ├─ code-review-checklist/
│  │  │  └─ SKILL.md
│  │  ├─ spec-implementation-diff/
│  │  │  └─ SKILL.md
│  │  └─ reject-with-actionable-feedback/
│  │     └─ SKILL.md
│  ├─ docs/
│  │  ├─ readme-sync/
│  │  │  └─ SKILL.md
│  │  └─ changelog-writing/
│  │     └─ SKILL.md
│  └─ security/
│     ├─ auth-and-permission-review/
│     │  └─ SKILL.md
│     └─ input-validation-review/
│        └─ SKILL.md
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

---

## 5. 顶层文件说明

## 5.1 README.md

### 作用
专家包入口说明文档。

### 第一版至少应包含
- 专家包定位
- 支持的角色
- 目录结构概览
- 与 OpenClaw 的关系
- MVP 范围
- 快速开始方式

### 为什么必须有
没有 README，后续自己都会忘记专家包的边界和用法。

---

## 5.2 opencode.jsonc

### 作用
OpenCode 的核心配置文件，用于注册 agent、commands、相关设置。

### 第一版至少应包含
- agent 定义入口
- command 发现路径
- skill 发现路径（若通过配置约定）
- 必要默认设置

### 第一版建议
先保持极简，只做：
- core agents
- core commands
- core config

不要一开始塞很多 provider 或复杂模型配置。

---

## 5.3 AGENTS.md

### 作用
提供整个专家包的角色总览与角色间分工说明。

### 第一版至少应包含
- architect / developer / tester / reviewer 的职责摘要
- 每个角色不做什么
- 推荐协作流
- 高风险任务追加 security / docs 的规则

### 为什么建议有
这个文件可以作为全局说明，避免每个 agent 文件都重复长篇背景。

---

## 6. agents/ 目录设计

## 6.1 作用

该目录用于定义角色本身，即：

- 这个角色是谁
- 它负责什么
- 不负责什么
- 默认使用哪些 skills
- 适合执行什么 commands
- 输出要求是什么

## 6.2 MVP 必做文件

### architect.md
### developer.md
### tester.md
### reviewer.md

## 6.3 推荐补充文件

### docs.md
### security.md

---

## 6.4 每个 agent 文件推荐结构

```md
# agent-name

## Role
角色定位

## Responsibilities
负责事项

## Non-Responsibilities
不负责事项

## Inputs
通常接收什么输入

## Outputs
必须输出什么

## Default Skills
默认挂载哪些 skills

## Preferred Commands
优先使用哪些 commands

## Quality Gates
进入下游前必须满足什么

## Escalation Conditions
什么情况下必须升级
```

---

## 7. skills/ 目录设计

## 7.1 作用

该目录用于沉淀方法论，不是堆知识点。  
skill 应该告诉角色：

- 什么场景用
- 怎么做
- 怎么检查
- 常见失败模式是什么
- 输出要长什么样

## 7.2 分层建议

### common/
所有角色共用的技能。

### architect/
架构角色专属技能。

### developer/
开发角色专属技能。

### tester/
测试角色专属技能。

### reviewer/
审查角色专属技能。

### docs/
文档角色专属技能。

### security/
安全角色专属技能。

---

## 7.3 MVP 必做 common skills

### artifact-reading
解决：如何读取并结构化消费上游工件。

### context-summarization
解决：如何裁剪上下文，只保留当前 task 必需信息。

### failure-analysis
解决：如何理解 test/review/verification 失败原因。

### execution-reporting
解决：如何输出统一格式结果。

---

## 7.4 MVP 必做角色技能

### architect
- requirement-to-design
- interface-contract-design
- tradeoff-analysis

### developer
- feature-implementation
- bugfix-workflow
- code-change-selfcheck

### tester
- unit-test-design
- regression-analysis
- edge-case-matrix

### reviewer
- code-review-checklist
- spec-implementation-diff
- reject-with-actionable-feedback

### docs（可选）
- readme-sync
- changelog-writing

### security（可选）
- auth-and-permission-review
- input-validation-review

---

## 7.5 每个 SKILL.md 推荐结构

```md
# Skill Name

## Purpose
## When to Use
## When Not to Use
## Inputs
## Steps
## Checklists
## Common Failure Modes
## Output Requirements
## Examples
```

---

## 8. commands/ 目录设计

## 8.1 作用

commands 用于固化“动作入口”，减少每次靠自由 prompt 调用造成的不稳定。

## 8.2 MVP 命令建议

### architect/
- design-task.md
- evaluate-tradeoff.md

### developer/
- implement-task.md
- fix-task.md
- refactor-task.md

### tester/
- test-task.md
- regression-task.md

### reviewer/
- review-task.md
- compare-spec-vs-code.md

### docs/
- update-docs.md

### security/
- security-check.md

---

## 8.3 每个 command 文件推荐结构

```md
# command-name

## Purpose
## Applicable Role
## Use Cases
## Required Inputs
## Expected Outputs
## Constraints
## Recommended Next Step
```

### 核心要求
每个 command 必须回答：
- 什么时候用
- 给什么输入
- 产出什么
- 不允许做什么

---

## 9. templates/ 目录设计

## 9.1 作用

templates 用于统一产物格式，降低输出波动。

## 9.2 MVP 必做模板

### 设计类
- design-note.md

### 实现类
- implementation-summary.md

### 测试类
- test-report.md

### 审查类
- review-report.md

### 文档类
- doc-update-report.md

### 安全类
- security-report.md

### 协议类
- dispatch-payload.yaml
- execution-result.yaml
- rework-request.yaml
- escalation.yaml

---

## 9.3 为什么模板要放单独目录

因为：
- template 不属于某个角色专属知识
- template 是跨角色协作契约的一部分
- template 会被 schema 和 examples 复用

---

## 10. rules/ 目录设计

## 10.1 作用

rules 定义约束，不属于 agent 本身，也不属于 skill 方法。

## 10.2 分层建议

### global/
所有角色都必须遵守。

### coding/
developer 相关规则。

### testing/
tester 相关规则。

### review/
reviewer 放行门槛。

### docs/
文档同步相关规则。

---

## 10.3 MVP 必做 rules

### global/execution-contract.md
定义：
- 所有角色必须输出统一 result
- 不得伪造完成
- 遇阻塞必须显式输出

### global/artifact-format.md
定义：
- artifact 命名规范
- path 规范
- summary 规范

### global/escalation-rules.md
定义：
- 什么情况下必须升级

### coding/change-scope-policy.md
定义：
- developer 不得超范围改动

### coding/dependency-policy.md
定义：
- 依赖引入限制

### testing/testing-policy.md
定义：
- tester 的最小覆盖与报告要求

### review/review-bar.md
定义：
- must-fix / non-blocking 的划分规则

### docs/documentation-policy.md
定义：
- 哪些变更必须同步文档

---

## 11. schemas/ 目录设计

## 11.1 作用

schemas 用于定义对外接口和工件结构，保证 OpenClaw 与 OpenCode 交互稳定。

## 11.2 MVP 必做 schema

- dispatch-payload.schema.yaml
- execution-result.schema.yaml
- artifact.schema.yaml
- rework-request.schema.yaml
- escalation.schema.yaml

## 11.3 为什么单独建 schemas/

因为 schema 是协议层，不应该散落在 templates 或 docs 中。  
它应该能独立被：
- 校验器消费
- 管理层消费
- 示例消费
- 文档引用

---

## 12. examples/ 目录设计

## 12.1 作用

examples 是落地速度非常高的目录。  
它能帮助你快速验证：
- schema 是否好用
- command 是否描述清楚
- 输出是否足够稳定

## 12.2 分层建议

### dispatch/
示例输入

### results/
示例输出

### artifacts/
示例工件

## 12.3 MVP 必做示例

### dispatch/
- architect-design-task.yaml
- developer-implement-task.yaml
- reviewer-review-task.yaml

### results/
- developer-success.yaml
- tester-fail-retryable.yaml
- reviewer-reject.yaml

### artifacts/
- sample-design-note.md
- sample-implementation-summary.md
- sample-test-report.md
- sample-review-report.md

---

## 13. docs/ 目录设计

## 13.1 作用

docs 用于承载专家包自己的说明文档，不与 templates / examples 混在一起。

## 13.2 MVP 推荐文档

### expert-pack-overview.md
说明专家包总体定位。

### role-matrix.md
列出角色边界、默认 skills、默认 commands。

### command-reference.md
列出所有 command 的用途。

### skill-index.md
列出所有 skill 的索引与说明。

### integration-guide.md
说明如何接入 OpenClaw / 如何派发任务 / 如何消费结果。

---

## 14. 第一版最小落地集合

如果你想先快速搭骨架，第一版建议最小只建这些：

```text
opencode-expert-pack/
├─ README.md
├─ opencode.jsonc
├─ AGENTS.md
├─ agents/
│  ├─ architect.md
│  ├─ developer.md
│  ├─ tester.md
│  └─ reviewer.md
├─ skills/
│  ├─ common/
│  │  ├─ artifact-reading/
│  │  │  └─ SKILL.md
│  │  ├─ failure-analysis/
│  │  │  └─ SKILL.md
│  │  └─ execution-reporting/
│  │     └─ SKILL.md
│  ├─ architect/
│  │  ├─ requirement-to-design/
│  │  │  └─ SKILL.md
│  │  └─ tradeoff-analysis/
│  │     └─ SKILL.md
│  ├─ developer/
│  │  ├─ feature-implementation/
│  │  │  └─ SKILL.md
│  │  └─ bugfix-workflow/
│  │     └─ SKILL.md
│  ├─ tester/
│  │  ├─ unit-test-design/
│  │  │  └─ SKILL.md
│  │  └─ regression-analysis/
│  │     └─ SKILL.md
│  └─ reviewer/
│     ├─ code-review-checklist/
│     │  └─ SKILL.md
│     └─ reject-with-actionable-feedback/
│        └─ SKILL.md
├─ commands/
│  ├─ architect/
│  │  └─ design-task.md
│  ├─ developer/
│  │  ├─ implement-task.md
│  │  └─ fix-task.md
│  ├─ tester/
│  │  └─ test-task.md
│  └─ reviewer/
│     └─ review-task.md
├─ templates/
│  ├─ design-note.md
│  ├─ implementation-summary.md
│  ├─ test-report.md
│  ├─ review-report.md
│  ├─ dispatch-payload.yaml
│  └─ execution-result.yaml
├─ rules/
│  ├─ global/
│  │  ├─ execution-contract.md
│  │  └─ escalation-rules.md
│  ├─ coding/
│  │  └─ change-scope-policy.md
│  ├─ testing/
│  │  └─ testing-policy.md
│  └─ review/
│     └─ review-bar.md
├─ schemas/
│  ├─ dispatch-payload.schema.yaml
│  ├─ execution-result.schema.yaml
│  └─ artifact.schema.yaml
└─ examples/
   ├─ dispatch/
   │  └─ developer-implement-task.yaml
   └─ results/
      └─ developer-success.yaml
```

### 这样做的好处
- 四个核心角色齐了
- 输入输出协议齐了
- 方法包齐了
- 命令入口齐了
- 模板齐了
- 可以开始跑第一个 demo 闭环

---

## 15. 命名规范

## 15.1 文件命名

### agent 文件
- 使用小写英文角色名
- 例如：`architect.md`

### skill 目录
- 使用 `kebab-case`
- 例如：`feature-implementation`

### command 文件
- 使用 `verb-object.md`
- 例如：`implement-task.md`

### template / schema
- 使用统一语义名
- 例如：`execution-result.yaml`
- 例如：`execution-result.schema.yaml`

## 15.2 目录命名原则

- 按“职责层”命名，不按“个人理解”命名
- 避免模糊目录名，如：
  - `misc/`
  - `tmp/`
  - `advanced/`
  - `other/`

---

## 16. 目录扩展原则

后续扩展时遵循以下顺序：

### 先加 skill
如果只是方法增强，不要先加新角色。

### 再加 command
如果已有角色动作不稳定，再增加 command 固化入口。

### 最后加角色
只有当职责边界已经明确，且现有角色确实不适合承担时，再新增角色。

### 不要轻易加顶层目录
尽量复用现有层：
- agents
- skills
- commands
- templates
- rules
- schemas
- examples
- docs

---

## 17. 与 OpenClaw 的接口约定建议

为了让 OpenClaw 好调度，建议约定：

### 角色发现
通过 `agents/` 目录统一发现。

### command 发现
通过 `commands/<role>/` 目录统一发现。

### skill 发现
通过 `skills/common/` + `skills/<role>/` 统一发现。

### 协议发现
通过 `schemas/` 统一发现。

### 模板发现
通过 `templates/` 统一发现。

### 示例发现
通过 `examples/` 统一发现。

这样管理层不需要猜测路径。

---

## 18. repo 初始化顺序建议

如果你要从零搭建这个目录，建议按下面顺序：

### 第一步：先建顶层骨架
- README.md
- opencode.jsonc
- AGENTS.md
- agents/
- skills/
- commands/
- templates/
- rules/
- schemas/
- examples/
- docs/

### 第二步：补四个核心角色
- architect.md
- developer.md
- tester.md
- reviewer.md

### 第三步：补统一协议
- dispatch payload
- execution result
- artifact schema

### 第四步：补最小 commands
- design-task
- implement-task
- test-task
- review-task

### 第五步：补最小 skills
- architect 2 个
- developer 2 个
- tester 2 个
- reviewer 2 个
- common 2 到 3 个

### 第六步：补 examples
先做最少一个端到端例子。

---

## 19. 第一版优先级建议

## P0：必须有
- agents/
- commands/
- skills/
- templates/
- schemas/
- README.md
- opencode.jsonc

## P1：强烈推荐
- rules/
- examples/
- AGENTS.md

## P2：后补
- docs/
- docs role
- security role
- integration-guide.md

---

## 20. 最小可运行定义

当专家包满足以下条件时，可认为已经达到“最小可运行”状态：

1. 至少有 4 个核心角色定义
2. 至少每个角色有 1 个 command
3. 至少每个角色有 2 个 skill
4. 有统一 dispatch payload schema
5. 有统一 execution result schema
6. 有统一 artifact 模板
7. 有至少一个端到端 examples
8. OpenClaw 可以通过角色 + command + payload 调用它

---

## 21. 常见错误目录设计

以下是第一版最容易犯的错误：

### 1）把所有内容都写进 agents/
问题：
- agent 文件变得臃肿
- 方法、规则、模板混在一起

### 2）没有 schemas/
问题：
- 输入输出协议全靠约定
- 后续很难做校验与自动化消费

### 3）没有 examples/
问题：
- 很难验证设计是否真的可用

### 4）太早加很多角色
问题：
- 目录复杂
- 职责边界不清
- 调度反而不稳定

### 5）skills 只有概念没有步骤
问题：
- 不能真正提升交付稳定性

---

## 22. 推荐的一句话目录哲学

可以把这套骨架记成一句话：

**agents 定义角色，skills 定义方法，commands 定义动作，templates 定义产物，rules 定义约束，schemas 定义协议，examples 定义样例，docs 定义说明。**

只要你始终按这句话组织，目录就不会乱。

---

## 23. 验收标准

本目录骨架设计，在实现层应至少满足：

1. 能直接创建仓库目录
2. 能支撑 architect / developer / tester / reviewer 四个核心角色
3. 能挂载 role-specific skills 与 common skills
4. 能通过 commands 固化主要动作入口
5. 能通过 templates 统一主要产物格式
6. 能通过 schemas 定义输入输出契约
7. 能通过 examples 验证可用性
8. 能被 OpenClaw 管理层稳定发现和调度

---

## 24. 下一步建议

在这份目录骨架之后，最适合继续往下写的是两类文档之一：

### 方向 A：实现协议
- `dispatch-payload与artifact-schema定义.md`

### 方向 B：直接落骨架内容
- `architect.md`
- `developer.md`
- `design-task.md`
- `implement-task.md`
- `dispatch-payload.schema.yaml`

如果你要尽快开工，优先走 **方向 B**，直接把骨架里的关键文件内容写出来。
