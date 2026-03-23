# OpenCode 专家包治理模板

这份模板不是用来描述某一个普通 feature，而是用来描述 **OpenCode 专家包本身**。

它的目标是帮助你规范：

- 专家包负责什么、不负责什么
- 专家包在什么条件下被触发
- 专家包接收什么输入、输出什么结果
- 专家包如何与其他专家包协作
- 专家包如何做质量验收
- 专家包如何迭代和版本化

这份模板建议与前面的 **spec-driven 模板包** 配套使用：

- 前一份模板包解决：`spec -> plan -> tasks -> implement -> audit`
- 这一份模板包解决：`expert pack definition -> governance -> collaboration -> quality -> lifecycle`

两者结合后，才更适合长期沉淀 OpenCode 专家包资产。

---

# 一、推荐目录结构

```text
expert-pack/
├─ README.md
├─ package-spec.md
├─ role-definition.md
├─ io-contract.md
├─ quality-gate.md
├─ collaboration-protocol.md
├─ package-lifecycle.md
├─ examples/
│  ├─ happy-path.md
│  ├─ edge-cases.md
│  └─ failure-cases.md
├─ .opencode/
│  ├─ commands/
│  └─ skills/
└─ specs/
   └─ 001-bootstrap/
      ├─ spec.md
      ├─ plan.md
      └─ tasks.md
```

说明：

- `package-spec.md`：定义专家包是什么、解决什么问题
- `role-definition.md`：定义角色职责和边界
- `io-contract.md`：定义输入输出结构
- `quality-gate.md`：定义专家包交付的质量门禁
- `collaboration-protocol.md`：定义与其他专家包的协作接口
- `package-lifecycle.md`：定义版本、升级、弃用和迁移规则
- `examples/`：沉淀正例、边界例和失败例，帮助后续优化 prompt/skill

---

# 二、package-spec.md 模板

保存为 `package-spec.md`

```md
# Package Spec

## Package Name

## Package Goal
说明这个专家包的主要目标。

## Problem Statement
说明它要解决的核心问题。

## Target Use Cases
列出典型使用场景。

## Non-Goals
明确它不解决什么问题。

## Target Users / Agents
说明谁会调用这个专家包。
例如：
- planner agent
- architect agent
- task executor agent
- human operator

## Supported Roles
列出这个专家包内部包含的角色。
例如：
- spec-writer
- architect-auditor
- task-executor

## Supported Commands
列出该专家包暴露的命令。
例如：
- /spec-start
- /spec-plan
- /spec-tasks
- /spec-implement
- /spec-audit

## Supported Skills
列出该专家包包含的 skills。
例如：
- spec-writer
- architect-auditor
- task-executor

## Expected Inputs
说明专家包所需输入的类型和粒度。

## Expected Outputs
说明专家包产出的工件和结果。

## Quality Requirements
说明专家包输出必须满足的质量标准。

## Integration Points
说明它与哪些系统、流程或专家包集成。

## Risks and Limits
说明专家包的适用边界和风险。

## Acceptance Criteria
说明如何判定这个专家包“可用”。
```

---

# 三、role-definition.md 模板

保存为 `role-definition.md`

```md
# Role Definition

## Role Name

## Mission
一句话说明这个角色的使命。

## In Scope
明确该角色负责的内容。

## Out of Scope
明确该角色不负责的内容。

## Trigger Conditions
在什么情况下应调用该角色。

## Required Inputs
列出必需输入。

## Optional Inputs
列出可选输入。

## Expected Outputs
列出该角色必须输出的工件、结论或状态。

## Success Criteria
什么样的输出算合格。

## Failure Modes
常见失败模式。
例如：
- 输入不足
- 需求冲突
- 术语不清
- 上游文档缺失
- 下游依赖未满足

## Escalation Rules
当角色无法继续时如何上报。
例如：
- 转入 open questions
- 进入 conflict report
- 阻塞后续执行

## Dependencies on Other Roles
说明依赖哪些上游角色，输出给哪些下游角色。

## Notes
补充说明。
```

---

# 四、io-contract.md 模板

保存为 `io-contract.md`

```md
# I/O Contract

## Contract Name

## Purpose
定义该契约的用途。

## Input Schema
说明输入的结构。
建议用半结构化字段描述：

- goal
- context
- constraints
- existing_artifacts
- requested_output
- priority
- known_risks

## Required Input Fields
列出必填字段。

## Optional Input Fields
列出可选字段。

## Input Validation Rules
说明输入的校验规则。
例如：
- goal 不可为空
- constraints 必须区分硬约束和软约束
- existing_artifacts 若存在必须给出路径

## Output Schema
说明输出的结构。
建议至少包含：

- summary
- artifacts_created_or_updated
- assumptions
- open_questions
- blockers
- next_step

## Required Output Sections
列出强制输出的章节。

## Forbidden Behaviors
列出禁止行为。
例如：
- 不得伪造不存在的输入
- 不得省略冲突
- 不得把 assumption 写成 confirmed fact
- 不得输出未定义术语

## Error Output Format
定义错误输出格式。
例如：

- error_type
- impact
- blocking_reason
- recommended_action

## Traceability Rules
说明输出如何追溯到输入和上游文档。
例如：
- 每个关键结论应对应输入来源
- 每个新增 artifact 应注明来源 spec 或 plan
```

---

# 五、quality-gate.md 模板

保存为 `quality-gate.md`

```md
# Quality Gate

## Gate Name

## Objective
说明这套质量门禁检查什么。

## Completeness Checks
检查输出是否完整。
例如：
- 是否覆盖必填章节
- 是否包含 assumptions
- 是否包含 next step
- 是否明确 scope / out-of-scope

## Consistency Checks
检查输出是否前后一致。
例如：
- 术语是否统一
- 是否存在自相矛盾的规则
- 是否和上游 spec / plan 冲突

## Terminology Checks
检查术语是否规范。
例如：
- 是否使用 glossary 中 canonical terms
- 是否引入未定义术语
- 是否混用同义词导致语义漂移

## Traceability Checks
检查可追溯性。
例如：
- 需求是否能映射到设计
- 设计是否能映射到任务
- 任务是否能映射到实现和验证

## Output Format Checks
检查输出格式是否符合约定。
例如：
- 必填字段是否都出现
- section 顺序是否符合模板
- 是否存在空章节未标注

## Review Checklist
供 human/operator 或 auditor 审阅：
- 该输出是否可直接交给下游角色
- 是否还需要补充澄清
- 是否有高风险 assumption
- 是否存在应阻塞的冲突

## Pass Criteria
列出通过条件。

## Fail Criteria
列出失败条件。

## Severity Levels
建议定义：
- S0: 可忽略的小问题
- S1: 建议修复的问题
- S2: 影响下游工作的明显问题
- S3: 必须阻塞的重大问题

## Remediation Rules
出现失败后怎么办：
- 返工给原角色
- 进入 conflict resolution
- 升级人工审阅
```

---

# 六、collaboration-protocol.md 模板

保存为 `collaboration-protocol.md`

```md
# Collaboration Protocol

## Protocol Name

## Purpose
定义该专家包如何与其他角色或专家包协作。

## Upstream Inputs
说明从哪些角色/专家包接收输入。
例如：
- requirements clarifier
- product planner
- spec writer

## Downstream Outputs
说明输出给哪些角色/专家包。
例如：
- architect auditor
- task executor
- test validator

## Hand-off Rules
定义交接时必须满足的条件。
例如：
- spec writer 交给 architect 之前，spec 必须通过 quality gate
- architect 交给 executor 之前，tasks 必须存在且依赖清晰

## Blocking Conditions
定义哪些情况必须阻塞。
例如：
- 缺少 spec
- plan 与 spec 冲突
- task 缺少 requirement traceability
- 高风险 assumption 未确认

## Retry Rules
定义失败重试规则。
例如：
- 同类小问题允许自动修复一次
- 核心冲突不得自动反复重试
- 连续失败两次应升级人工审查

## Ownership Boundaries
明确职责边界。
例如：
- spec writer 不负责技术实现
- architect 不负责修改产品目标
- task executor 不负责扩展 scope

## Escalation Flow
定义升级路径。
例如：
- role self-report
- package auditor
- human reviewer

## Collaboration Examples
给出至少 1 个正常流转案例和 1 个阻塞案例。
```

---

# 七、package-lifecycle.md 模板

保存为 `package-lifecycle.md`

```md
# Package Lifecycle

## Package Name

## Current Version

## Versioning Strategy
建议使用：
- MAJOR：职责边界或 I/O 契约不兼容变化
- MINOR：新增命令、skill、规则，且兼容旧用法
- PATCH：修复模板、描述、轻微规则问题

## Change Triggers
什么情况下需要更新版本。
例如：
- 新增角色
- 新增关键命令
- I/O 契约变更
- 质量门禁收紧
- 新增协作协议

## Backward Compatibility Policy
说明如何保持兼容。
例如：
- 老 command 名称保留一个版本周期
- 老输出格式提供兼容层
- 关键字段不可直接删除

## Deprecation Rules
说明如何弃用旧能力。
例如：
- 标记 deprecated
- 给出替代方案
- 给出迁移时间窗

## Migration Notes
说明升级时需要做什么。
例如：
- 重命名 skill 目录
- 更新 AGENTS.md
- 更新 command 参数格式
- 更新 examples 和 tests

## Release Checklist
发布新版本前检查：
- 文档是否完整
- examples 是否更新
- quality gate 是否同步更新
- collaboration protocol 是否同步更新
- 下游兼容性是否验证

## Rollback Strategy
如果新版本不稳定，如何回滚。
```

---

# 八、README.md 模板

保存为 `README.md`

```md
# Expert Pack Name

## What It Is
一句话说明这是做什么的专家包。

## What Problem It Solves
解决什么问题。

## Included Components
- package-spec.md
- role-definition.md
- io-contract.md
- quality-gate.md
- collaboration-protocol.md
- package-lifecycle.md
- commands
- skills
- examples

## How to Use
1. 阅读 package-spec.md
2. 确认 role-definition.md 和 io-contract.md
3. 按 quality-gate.md 做校验
4. 按 collaboration-protocol.md 接入整体流程
5. 用 examples 做最小验证

## Recommended Workflow
- bootstrap package spec
- define roles
- define I/O contract
- define quality gate
- define collaboration protocol
- define lifecycle
- test with examples

## Limits
说明此专家包的边界和限制。
```

---

# 九、examples 模板建议

建议在 `examples/` 下至少保存三类样例。

---

## 1）happy-path.md

```md
# Happy Path Example

## Scenario
描述一个正常输入场景。

## Input
给出样例输入。

## Expected Behavior
说明专家包应该如何处理。

## Expected Output
说明期望输出结构和结果。

## Why This Matters
说明这个例子验证了什么能力。
```

---

## 2）edge-cases.md

```md
# Edge Cases

## Scenario 1
### Input
### Risk
### Expected Handling

## Scenario 2
### Input
### Risk
### Expected Handling
```

---

## 3）failure-cases.md

```md
# Failure Cases

## Failure Scenario
描述失败输入。

## Why It Fails
说明失败原因。

## Required Output
说明专家包应如何阻塞、上报、输出错误。

## Escalation
说明应如何进入升级路径。
```

---

# 十、建议的专家包初始化任务清单

你可以先用下面这份 checklist，让 OpenCode 建一版专家包治理骨架：

```md
# Expert Pack Bootstrap Checklist

- [ ] 创建 `README.md`
- [ ] 创建 `package-spec.md`
- [ ] 创建 `role-definition.md`
- [ ] 创建 `io-contract.md`
- [ ] 创建 `quality-gate.md`
- [ ] 创建 `collaboration-protocol.md`
- [ ] 创建 `package-lifecycle.md`
- [ ] 创建 `examples/happy-path.md`
- [ ] 创建 `examples/edge-cases.md`
- [ ] 创建 `examples/failure-cases.md`
- [ ] 若该专家包已绑定 OpenCode 行为，则同步创建 `.opencode/commands/`
- [ ] 若该专家包已绑定 OpenCode 行为，则同步创建 `.opencode/skills/`
```

---

# 十一、你交给 OpenCode 的落地说明

下面这段可以直接发给 OpenCode：

```md
请根据这份《OpenCode 专家包治理模板》在当前仓库中初始化一个专家包治理骨架。

要求：
1. 创建以下文件：
   - README.md
   - package-spec.md
   - role-definition.md
   - io-contract.md
   - quality-gate.md
   - collaboration-protocol.md
   - package-lifecycle.md
2. 创建 `examples/` 目录，并初始化：
   - happy-path.md
   - edge-cases.md
   - failure-cases.md
3. 保留模板结构，不要擅自删减核心章节
4. 如果仓库中已存在同名文件，先比较差异，再决定是覆盖、合并还是保留
5. 初始化完成后，输出：
   - 目录树
   - 创建/更新的文件列表
   - 每个文件的一句话用途说明
   - 推荐的下一步动作
```

---

# 十二、推荐和前一份模板如何组合使用

推荐做法：

## 层 1：专家包治理层
用于定义专家包本身：

- package-spec.md
- role-definition.md
- io-contract.md
- quality-gate.md
- collaboration-protocol.md
- package-lifecycle.md

## 层 2：专家包内部 feature 层
用于驱动该专家包自己的开发：

- specs/001-bootstrap/spec.md
- specs/001-bootstrap/plan.md
- specs/001-bootstrap/tasks.md

也就是说：

- 这份模板定义“专家包应该是什么”
- 前一份模板定义“专家包内部怎么开发落地”

两层叠起来才完整。

---

# 十三、适合什么时候用这份模板

适合：

- 你要设计一个可复用的 OpenCode 专家包
- 你后面会有多个专家包协作
- 你希望沉淀长期资产，而不只是写一次性 prompt
- 你要做质量验收、版本演进和协作边界治理

不太适合：

- 一次性的临时功能开发
- 非复用型、非长期维护的 prompt 草稿
- 没有角色边界和下游协作要求的小实验

---

# 十四、最小落地建议

先不要一上来把所有专家包都建全。更合适的顺序是：

1. 先选一个核心专家包  
   例如：`spec-writer-expert-pack`

2. 用本模板建立治理骨架

3. 再用前一份 spec-driven 模板给这个专家包自己建开发 spec

4. 跑一个完整闭环：
   - package governance
   - spec
   - plan
   - tasks
   - implement
   - audit

5. 跑通后，再抽象出可复用模式，复制到其他专家包

---

# 十五、推荐下一步

你接下来最值得补的不是更多文档，而是把这两份模板真正拼起来，形成一套统一骨架：

- `OpenCode Spec-Driven 模板包`
- `OpenCode 专家包治理模板`

然后再补第三层：
- glossary
- object model
- state machine
- traceability matrix
- PR / CI 校验规则

这样你的 OpenCode 专家包体系就从“能写”升级成“可治理、可复用、可扩展”。
