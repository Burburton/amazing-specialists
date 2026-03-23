# OpenCode 日常使用指令手册

这份手册不是模板定义文档，而是 **日常操作手册**。  
它回答的是：

- 平时怎么和 OpenCode 交互
- 什么时候直接自然语言聊天
- 什么时候必须走 `/spec-*` 命令
- 什么时候要显式指定 `spec.md / plan.md / tasks.md`
- 怎么避免 OpenCode 越界、漂移、重复劳动
- 怎么把“文档 -> 计划 -> 任务 -> 实现 -> 审计”真正跑起来

如果你已经有了下面这些文件：

- `AGENTS.md`
- `.opencode/commands/*.md`
- `.opencode/skills/*/SKILL.md`
- `specs/<feature>/spec.md`
- `specs/<feature>/plan.md`
- `specs/<feature>/tasks.md`

那么这份手册就是你日常使用 OpenCode 的操作说明。

---

# 一、先记住一句话

**治理规则靠自动加载，业务执行靠命令驱动。**

也就是说：

- `AGENTS.md`、skills、commands 这类规则层文件，一般放进仓库后就能持续发挥作用
- `spec.md`、`plan.md`、`tasks.md` 这类业务工件，不要指望 OpenCode 每次自由聊天都自动选对，最好通过固定命令或明确路径来读取

这是最核心的使用原则。

---

# 二、OpenCode 日常交互分成 4 类

## 1）仓库初始化类
目标：把模板骨架落到仓库里

典型任务：
- 创建 `AGENTS.md`
- 创建 `.opencode/commands/`
- 创建 `.opencode/skills/`
- 创建 `specs/001-bootstrap/`

这类任务可以直接用自然语言。

示例：

```text
请按《OpenCode 专家包完整模板总包》初始化当前仓库。
先创建治理骨架和 OpenCode 接入层，不要直接实现业务功能。
```

---

## 2）治理文档维护类
目标：更新专家包本身的规则和边界

典型任务：
- 修改 `package-spec.md`
- 更新 `role-definition.md`
- 调整 `io-contract.md`
- 收紧 `quality-gate.md`
- 增补 `collaboration-protocol.md`

这类任务也可以直接用自然语言，但要明确点名具体文件。

示例：

```text
请更新 package-spec.md 和 role-definition.md，
把这个专家包的职责范围收窄到“需求澄清 + spec 结构化”，
不要包含 implementation plan 生成职责。
```

或者：

```text
请基于当前仓库，补强 quality-gate.md，
增加术语一致性检查、traceability 检查和 blocker 判定规则。
```

---

## 3）feature/spec-driven 执行类
目标：对某个 feature 执行 `spec -> plan -> tasks -> implement -> audit`

这类最推荐走 `/spec-*` 命令，不要主要依赖自由聊天。

典型命令：

```bash
/spec-start 001-bootstrap
/spec-plan 001-bootstrap
/spec-tasks 001-bootstrap
/spec-implement 001-bootstrap T-001
/spec-audit 001-bootstrap
```

这是你以后最常用的一组。

---

## 4）审查 / 修复 /纠偏类
目标：发现 OpenCode 已有输出的问题，做修正或补漏

典型任务：
- 检查某个 feature 是否越界实现
- 检查 spec 和 code 是否一致
- 检查 tasks 是否缺 requirement 映射
- 检查治理文档和实际 commands/skills 是否不一致

这类任务可以自然语言，也可以走 `/spec-audit`。

示例：

```text
请检查 specs/002-role-router/ 下的 spec、plan、tasks 和代码实现之间是否存在不一致。
如果发现冲突，请先列出问题，不要直接改代码。
```

---

# 三、什么东西是“自动生效”的，什么不是

## 自动生效的
通常放进仓库后，OpenCode 会持续参考：

- `AGENTS.md`
- `.opencode/commands/*.md`
- `.opencode/skills/*/SKILL.md`

你不需要每次聊天都重新贴这些内容。

但注意：  
“自动生效”不代表它永远完美理解。  
只是说这些文件属于它的长期项目上下文和可调用能力层。

---

## 不建议完全依赖自动猜测的
这些文件虽然在仓库里，但实际执行时最好显式通过命令或路径指定：

- `specs/<feature>/spec.md`
- `specs/<feature>/plan.md`
- `specs/<feature>/tasks.md`
- `specs/<feature>/data-model.md`
- `specs/<feature>/contracts/*`

因为随着 feature 变多，OpenCode 不能总是稳定猜中你现在想让它操作哪一个。

所以：

- 有命令时，用命令
- 没命令时，明确写路径

---

# 四、你每天最常见的使用方式

## 场景 A：我要开始一个新 feature
推荐做法：

```bash
/spec-start 002-role-router
```

作用：
- 创建或更新 `specs/002-role-router/spec.md`
- 固化业务目标、范围、验收标准、假设和待确认问题

不要直接说：

```text
帮我做一个 role router
```

因为这样容易让 OpenCode 直接跳到实现，或者 spec 不完整。

---

## 场景 B：spec 写完了，我要进入技术规划
推荐做法：

```bash
/spec-plan 002-role-router
```

作用：
- 基于 `spec.md` 生成 `plan.md`
- 需要时补 `data-model.md`、`research.md`、`contracts/`

不要直接说：

```text
你给我设计一下架构
```

因为这种说法太松，会让输出不稳定。

---

## 场景 C：我要让它拆任务
推荐做法：

```bash
/spec-tasks 002-role-router
```

作用：
- 把 plan 转成小粒度 tasks
- 标记依赖
- 区分可并行和不可并行任务

不要直接说：

```text
把这个拆一下
```

因为拆出来的粒度会漂，而且未必能追溯回 spec。

---

## 场景 D：我要让它实现其中一个任务
推荐做法：

```bash
/spec-implement 002-role-router T-003
```

作用：
- 只做一个任务
- 控制 scope
- 避免一次改太多

不要直接说：

```text
把这个 feature 做完
```

因为这会失去任务边界，极容易越界实现。

---

## 场景 E：我要检查是否偏了
推荐做法：

```bash
/spec-audit 002-role-router
```

作用：
- 查 requirement coverage
- 查 terminology consistency
- 查 data model / contract mismatch
- 查 acceptance criteria 是否被验证

---

# 五、什么时候用自然语言，什么时候用命令

## 优先用自然语言的场景
### 1. 初始化或治理层工作
例如：

- 初始化仓库骨架
- 更新 package 目标和边界
- 修改角色职责
- 增加质量门禁
- 讨论为什么当前设计不合理

这类任务本质是“设计和治理讨论”，不是 feature 执行。

示例：

```text
请收窄这个专家包的职责边界，
让它只做需求澄清和 spec 结构化，不再负责 plan 生成。
同时更新 package-spec.md、role-definition.md、collaboration-protocol.md。
```

---

## 优先用命令的场景
### 1. 已经有 feature 目录，准备推进交付
例如：

- 写 spec
- 产出 plan
- 拆 tasks
- 做单任务实现
- 审计一致性

这些都应该优先用命令，而不是随意聊天。

---

## 混合使用的场景
有时候你先自然语言讨论，再进入命令执行，这是最正常的。

示例流程：

```text
我觉得 002-role-router 现在 scope 太大，先帮我收窄到只做 role selection，不包含 task scheduling。
```

然后：

```bash
/spec-start 002-role-router
/spec-plan 002-role-router
/spec-tasks 002-role-router
```

这个节奏是很合理的。

---

# 六、最推荐的标准工作流

## 工作流 1：初始化专家包
### 第一步：自然语言初始化
```text
请按《OpenCode 专家包完整模板总包》初始化当前仓库。
只完成治理骨架和 OpenCode 接入层，不开始业务功能实现。
```

### 第二步：检查骨架
让它输出：
- 目录树
- 创建的文件
- 每个文件用途

### 第三步：创建 bootstrap feature
```bash
/spec-start 001-bootstrap
/spec-plan 001-bootstrap
/spec-tasks 001-bootstrap
```

### 第四步：挑一个最小任务实现
```bash
/spec-implement 001-bootstrap T-001
```

### 第五步：审计
```bash
/spec-audit 001-bootstrap
```

---

## 工作流 2：新增一个正式 feature
### 第一步：定义 feature
```bash
/spec-start 003-skill-router
```

### 第二步：生成 plan
```bash
/spec-plan 003-skill-router
```

### 第三步：拆任务
```bash
/spec-tasks 003-skill-router
```

### 第四步：按 task 推进
```bash
/spec-implement 003-skill-router T-001
/spec-implement 003-skill-router T-002
/spec-implement 003-skill-router T-003
```

### 第五步：统一审计
```bash
/spec-audit 003-skill-router
```

---

## 工作流 3：修复漂移或不一致
### 第一步：先审计，不直接修
```bash
/spec-audit 003-skill-router
```

### 第二步：如果是治理层漂移
自然语言点名根目录治理文档：

```text
请根据 audit 结果，更新 package-spec.md、io-contract.md 和 quality-gate.md，
修复专家包职责边界与当前 commands 行为不一致的问题。
```

### 第三步：如果是 feature 层漂移
自然语言 + 明确路径：

```text
请基于 specs/003-skill-router/spec.md、plan.md、tasks.md，
修复当前实现与 spec 不一致的问题。
先给出修复计划，再执行。
```

---

# 七、什么时候必须显式指定路径

有以下情况时，最好不要只说 feature 名字，要明确文件路径：

## 1. 仓库里有多个 feature，很容易混淆
例如你已经有：

- `specs/001-bootstrap/`
- `specs/002-role-router/`
- `specs/003-skill-router/`

这时如果你只说：

```text
你帮我继续修一下 spec
```

很容易歧义。

更好的说法：

```text
请检查并更新 specs/003-skill-router/spec.md，
重点收窄 Scope 和 Out of Scope。
```

---

## 2. 你跳过了命令，直接自由聊天
这时一定要写清楚读哪些文件。

例如：

```text
请基于以下文件生成修订版 tasks：
- specs/003-skill-router/spec.md
- specs/003-skill-router/plan.md
- specs/003-skill-router/data-model.md
```

---

## 3. 你做的是 cross-feature 工作
比如一个治理调整影响多个 feature。

这时建议明确列出路径和影响范围。

例如：

```text
请检查以下 feature 的 spec 是否仍符合新的 I/O 契约：
- specs/002-role-router/spec.md
- specs/003-skill-router/spec.md
- specs/004-task-dispatch/spec.md
```

---

# 八、怎么提问，最不容易让 OpenCode 跑偏

## 好的提法 1：说明目标 + 说明边界 + 说明操作对象
```text
请更新 specs/002-role-router/spec.md，
目标是把 feature 收窄到 role selection，
不包含 task execution 和 workflow orchestration。
保留现有结构，不要直接改代码。
```

---

## 好的提法 2：说明输入文件 + 说明期望输出
```text
请读取以下文件：
- specs/002-role-router/spec.md
- specs/002-role-router/plan.md

然后生成或更新：
- specs/002-role-router/tasks.md

要求：
- 任务粒度小
- 每个任务可追溯到 spec
- 包含 validation task
```

---

## 好的提法 3：说明只做一个 task
```text
请只实现 specs/002-role-router/tasks.md 中的 T-003。
不要顺手做别的任务。
如果发现依赖未满足，先阻塞并报告。
```

---

## 不好的提法
### 太泛
```text
继续做
```

### 太大
```text
把这个项目做完
```

### 边界不清
```text
你看着优化一下
```

### 省略输入对象
```text
改一下 spec
```

这些都很容易导致 OpenCode 自行脑补。

---

# 九、怎么让 OpenCode 输出更稳定

## 1. 永远让它先汇报要改什么，再动手
尤其在治理层和大范围修订时。

示例：

```text
请先给出你准备修改的文件列表、修改目标和理由，
确认后再执行。
```

---

## 2. 大变更先分两步
先分析，再执行。

示例：

```text
先分析 specs/003-skill-router 当前 spec、plan、tasks 的不一致点，
不要修改文件。
```

然后再：

```text
根据上一步分析结果，开始修复文档。
```

---

## 3. 一次只让它做一个层级的事
不要在一句话里既让它改治理层，又让它改 feature spec，又让它直接实现代码。

错误示例：

```text
请修改 package-spec、修复 spec、更新 tasks，然后把相关代码也改了。
```

更好的做法是拆开。

---

## 4. 让它输出固定格式
例如：

```text
请按以下格式回复：
1. Files to update
2. Why each file changes
3. Risks
4. Next step
```

这样输出会稳很多。

---

# 十、推荐的固定提示模板

## 模板 A：治理层更新
```text
请更新以下治理文档：
- package-spec.md
- role-definition.md
- quality-gate.md

目标：
[写清目标]

边界：
[写清不改什么]

要求：
1. 保持现有章节结构
2. 不新增未讨论能力
3. 先输出修改计划，再执行
```

---

## 模板 B：feature 文档更新
```text
请读取以下文件：
- specs/<feature>/spec.md
- specs/<feature>/plan.md

任务：
[写清要改什么]

要求：
1. 只更新文档，不改代码
2. 保持 traceability
3. 列出 assumptions 和 blockers
```

---

## 模板 C：单任务实现
```text
请只实现 `specs/<feature>/tasks.md` 中的 `<task-id>`。

要求：
1. 先读取 spec.md、plan.md、tasks.md
2. 只实现该任务，不扩 scope
3. 完成后报告：
   - 变更文件
   - 验证方式
   - 剩余风险
```

---

## 模板 D：审计
```text
请审计以下 feature：
- specs/<feature>/spec.md
- specs/<feature>/plan.md
- specs/<feature>/tasks.md

同时检查相关代码实现。

输出：
1. Coverage gaps
2. Consistency issues
3. Missing validation
4. Suggested fixes

注意：
先列问题，不要直接修改文件。
```

---

# 十一、一个最小完整示例

假设你现在要做 `004-task-dispatch`。

## Step 1：创建 spec
```bash
/spec-start 004-task-dispatch
```

## Step 2：生成 plan
```bash
/spec-plan 004-task-dispatch
```

## Step 3：拆任务
```bash
/spec-tasks 004-task-dispatch
```

## Step 4：实现第一个任务
```bash
/spec-implement 004-task-dispatch T-001
```

## Step 5：实现第二个任务
```bash
/spec-implement 004-task-dispatch T-002
```

## Step 6：统一审计
```bash
/spec-audit 004-task-dispatch
```

## Step 7：如果发现治理层问题，再自然语言修治理文档
```text
请根据 audit 结果，更新 role-definition.md 和 collaboration-protocol.md，
使 task-dispatch 相关职责边界更清晰。
```

这个流程就比较理想。

---

# 十二、最容易犯的错误

## 错误 1：初始化后就完全自由聊天
后果：
- feature 边界漂移
- 跳过 spec / plan / tasks
- 直接进入大块实现

---

## 错误 2：一个 prompt 要它做太多层的事
后果：
- 治理层和 feature 层混在一起
- 产出质量不稳定
- 很难审计

---

## 错误 3：不点名 feature 或文件路径
后果：
- 读错 spec
- 更新错文件
- 多 feature 仓库尤其危险

---

## 错误 4：不做 audit
后果：
- 代码实现和 spec 慢慢分叉
- 术语和 I/O 契约悄悄漂移
- 到后面很难收回来

---

## 错误 5：一次实现多个 task
后果：
- 变更太大
- validation 难做
- 回滚困难
- scope 容易失控

---

# 十三、最推荐的习惯

1. 初始化后，优先走 `/spec-*` 命令  
2. 改治理文档时，用自然语言，但明确点名文件  
3. 做实现时，一次只做一个 task  
4. 出现不一致，先 audit，再修  
5. 多 feature 场景下，尽量写明路径  
6. 大修改先分析，再执行  
7. 让 OpenCode 每次都输出：
   - 改了什么
   - 为什么改
   - 怎么验证
   - 还有什么风险

---

# 十四、你可以直接发给自己的“操作提醒”

下面这段你甚至可以贴到 README 或自己的工作便签里：

```text
OpenCode 日常操作提醒：

1. 初始化 / 治理调整：用自然语言，点名文件
2. feature 执行：优先用 /spec-start /spec-plan /spec-tasks /spec-implement /spec-audit
3. 多 feature 时必须指定 feature 名或文件路径
4. 单次只做一个 task
5. 大改动先分析，再执行
6. 发现问题先 audit，不要直接瞎改
7. 每次都要让 OpenCode 说明：
   - changed files
   - reason
   - validation
   - remaining risks
```

---

# 十五、最终结论

这套东西真正用起来，不是“每次都去调用 spec 文件”，而是：

- **规则层文件**放进仓库后长期生效
- **业务工件文件**通过命令或显式路径驱动读取
- **日常交互**按“治理层自然语言 + feature 层命令驱动”的方式分层进行

这样 OpenCode 才不容易越界，也更容易形成长期稳定的专家包工作流。
