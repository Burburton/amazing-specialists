# 002-role-model-alignment Feature

这是一份面向 OpenCode 的 feature 定义文档，用于启动 **002-role-model-alignment** 的 spec-driven 开发。

它的目标不是实现新的业务能力，而是完成一次关键的**角色模型对齐与迁移治理**：

- 明确 **6-role 执行层模型** 是正式模型
- 明确当前 `.opencode/skills/` 中的 **3-skill 骨架** 只是过渡实现
- 给出两者之间的映射关系和迁移策略
- 修正 README / package spec / role definition / AGENTS 等文档中的表述
- 为后续正式核心角色 feature（如 `003-architect-core`）扫清认知和治理层障碍

---

# 一、Feature 基本信息

## Feature ID
`002-role-model-alignment`

## Feature Name
Role Model Alignment

## Feature Goal
统一当前仓库中的**角色模型认知**、**治理文档表述**和**OpenCode 技术骨架语义**，避免后续正式 feature 在“3-skill 旧模型”和“6-role 新模型”之间来回漂移。

## Why This Feature Matters
当前仓库已经明确采用 6 个执行角色作为正式角色模型：

- architect
- developer
- tester
- reviewer
- docs
- security

但 `.opencode/skills/` 仍保留较早期的 3-skill 骨架：

- spec-writer
- architect-auditor
- task-executor

如果不先完成这一步对齐，后续正式 feature 很容易出现：

1. 文档说一套，技能骨架按另一套理解
2. feature 边界混乱
3. role-definition 和 skill-behavior 不一致
4. OpenCode 在 spec / plan / tasks 阶段持续沿旧模型理解工作
5. 正式角色能力开发被迁移问题污染

因此，需要先完成一次轻量但明确的角色模型迁移治理。

---

# 二、问题定义

当前系统已经具备：

- 根目录治理文档
- `AGENTS.md`
- `.opencode/commands/`
- `.opencode/skills/`
- `specs/001-bootstrap/`
- bootstrap 相关 artifacts

但存在以下不一致：

## 1. 正式角色体系与技术骨架未完全对齐
治理层已经收敛到 6-role 执行层模型，但技术骨架仍采用 3-skill 命名。

## 2. README 中的阶段与主线顺序容易让人误解
如果先做正式角色 feature，再解释迁移关系，会让主线 feature 承担治理迁移责任。

## 3. 后续 feature 命名方向尚未完全固化
如果不先对齐，后续仍可能继续沿 `spec-writer-core` 这种旧语义命名，而不是围绕正式角色模型推进。

## 4. OpenCode 的上下文可能仍受旧 skill 语义影响
如果不在治理层明确写清“正式模型优先”，后续 spec-driven 产出可能继续围绕旧技能边界组织。

---

# 三、目标能力

完成本 feature 后，系统应做到：

1. 明确说明 **6-role 执行层模型是正式模型**
2. 明确说明 **3-skill 骨架是过渡实现，不是最终角色体系**
3. 给出至少一版清晰的 **映射关系**
4. 修正治理文档中的相关表述，使之不再互相冲突
5. 为后续 `003-architect-core`、`004-developer-core` 等 feature 建立稳定主线
6. 不要求当前阶段立刻完成 `.opencode/skills/` 目录的物理重构，但要求语义先统一

---

# 四、In Scope

本 feature 范围内包含：

## 1. 正式角色模型定义收敛
明确写出 6-role 模型的正式地位。

## 2. 过渡 skill 骨架定位说明
明确写出 3-skill 的过渡性质和暂时保留理由。

## 3. 映射关系定义
至少给出一版可用的角色映射，例如：

- `spec-writer` -> bootstrap / upstream-spec-assist / not-formal-execution-role
- `architect-auditor` -> future `architect` + `reviewer`
- `task-executor` -> future `developer` + `tester` + `docs` + `security`

## 4. 治理文档修正
至少允许更新：
- `README.md`
- `package-spec.md`
- `role-definition.md`
- `AGENTS.md`

如有必要，也可补：
- `migration-notes.md`
- `docs/architecture/role-model-evolution.md`

## 5. 主线 roadmap 调整
明确后续 feature 主线建议：
- `003-architect-core`
- `004-developer-core`
- `005-tester-core`
- `006-reviewer-core`
- 其他角色类 feature

---

# 五、Out of Scope

本 feature 当前阶段不负责：

## 1. 实现 architect / developer / tester 的真正业务能力
这一步只做治理和语义对齐，不做正式核心角色实现。

## 2. 完整重写全部 skill 目录
当前可以保留 3-skill 骨架，不强制立即物理拆分成 6 个目录。

## 3. 大规模代码实现
主要产物应以文档、规则、说明和少量配置调整为主。

## 4. 完整自动迁移系统
不要求在当前阶段完成自动重命名、自动兼容层或复杂迁移脚本。

## 5. 最终版角色矩阵优化
只要求先完成“足够清晰”的对齐版本，不追求一次做到最完美。

---

# 六、目标输入

本 feature 的输入主要来自当前仓库现状，包括但不限于：

- `README.md`
- `package-spec.md`
- `role-definition.md`
- `AGENTS.md`
- `.opencode/skills/`
- `.opencode/commands/`
- `specs/001-bootstrap/`

输入特征：

- 文档整体方向已经偏向 6-role 正式模型
- 技术骨架保留早期 3-skill 模式
- 需要在不破坏当前可运行性的情况下完成认知对齐

---

# 七、目标输出

目标输出应至少包括以下一种或多种结果：

1. 更新后的治理文档
2. 明确的角色模型迁移说明
3. 一份可被后续 feature 引用的映射定义
4. 一份清晰的后续主线 feature 顺序说明

输出应回答清楚以下问题：

- 正式模型是谁？
- 旧 skill 模型是什么性质？
- 当前为什么暂时保留？
- 未来如何迁移？
- 后续 feature 应该按哪条主线继续？

---

# 八、关键设计原则

## 1. Prefer semantic alignment before physical restructuring
先统一语义和治理，再考虑目录重构。

## 2. Prefer explicit migration notes over silent reinterpretation
不要默认团队会自己理解迁移关系，要显式写清楚。

## 3. Prefer forward-compatible naming
后续 feature 命名应围绕正式角色模型展开。

## 4. Prefer minimal-disruption transition
先做最小必要修正，不要在这个 feature 中引入大规模重构。

## 5. Keep the result actionable for downstream features
输出必须能直接支撑后续 `003-architect-core` 的启动。

---

# 九、建议的 Actors

本 feature 相关角色建议至少包含：

- **architect**：负责角色模型和系统边界设计
- **reviewer**：检查治理文档前后一致性
- **docs**：整理迁移说明和 README 更新
- **user / operator**：确认正式方向

当前阶段不要求所有角色已完整实现，但 spec 中应体现角色语义。

---

# 十、核心工作流

## Workflow 1：识别角色模型不一致
1. 读取治理层文档和当前 skill 骨架
2. 识别正式模型与过渡骨架之间的差异
3. 提炼出最关键的冲突点

## Workflow 2：定义迁移策略
1. 确定正式模型
2. 定义旧 skill 的过渡定位
3. 给出映射关系和迁移主线

## Workflow 3：修正文档与规则
1. 更新 README / package spec / role definition / AGENTS
2. 让仓库内的表述方向趋于一致
3. 为后续 feature 提供稳定上下文

## Workflow 4：为正式核心角色 feature 铺路
1. 在治理层写清推荐主线
2. 使 `003-architect-core` 可以在统一模型下启动

---

# 十一、业务规则

1. 6-role 模型必须被定义为正式执行层模型
2. 3-skill 模型必须被定义为 bootstrap / transition 骨架，而不是正式角色体系
3. 不得在当前阶段将迁移问题偷偷塞进后续核心能力 feature
4. 不得因为迁移说明而破坏现有 bootstrap 可运行性
5. 所有迁移说明必须尽量清晰、可追踪、可被后续 feature 复用

---

# 十二、非功能要求（NFR）

## 1. 清晰性
任何阅读仓库的人都应能快速理解当前处于什么迁移阶段。

## 2. 一致性
README、package spec、role definition、AGENTS 中的角色语义应基本一致。

## 3. 可执行性
输出结果应能直接支撑后续新 feature 的命名和规划。

## 4. 最小侵入
避免在本 feature 中引入过大范围的物理目录重构。

## 5. 可演进性
后续可继续从“语义统一”演进到“物理目录统一”。

---

# 十三、验收标准（Acceptance Criteria）

以下条件全部满足时，认为本 feature 达到最小可用标准：

## AC-001 正式模型明确
治理层文档中清楚说明 6-role 执行层模型是正式模型。

## AC-002 过渡模型明确
治理层文档中清楚说明 3-skill 骨架是过渡实现。

## AC-003 映射关系存在
至少有一份文档明确说明 3-skill 到 6-role 的映射关系。

## AC-004 主线顺序清晰
后续正式 feature 的主线顺序更加明确，不再混乱。

## AC-005 文档语义基本一致
README / package-spec / role-definition / AGENTS 中不再出现明显互相冲突的角色表述。

## AC-006 不破坏当前骨架
现有 bootstrap 流程和 command 使用方式不因本次修正而失效。

---

# 十四、风险与限制

## 风险 1：写得过于抽象
如果迁移说明太抽象，后续 OpenCode 仍可能按旧模型理解。

## 风险 2：修得太重
如果在本 feature 里做过多目录重构，会拖慢主线。

## 风险 3：映射过早固化
如果映射写得过于死板，可能影响后续更优设计。

## 风险 4：只改 README 不改规则
如果只更新 README，不更新 AGENTS / package spec，效果有限。

---

# 十五、建议的最小实现方向（供后续 plan 参考）

可能的实现拆分包括：

1. 盘点当前治理层和技术骨架中的角色定义差异
2. 定义正式角色模型与过渡骨架映射
3. 更新 README 中的阶段说明与主线顺序
4. 更新 `package-spec.md` 中的角色模型说明
5. 更新 `role-definition.md` 以体现迁移关系
6. 更新 `AGENTS.md` 以声明“正式角色语义优先”
7. 如有必要，新增单独迁移说明文档

---

# 十六、建议的首批任务方向（供 tasks 阶段参考）

以下不是最终 tasks，只是建议方向：

- 盘点现有角色模型冲突点
- 定义 3-skill -> 6-role 映射草案
- 更新 README 的角色模型说明与阶段顺序
- 更新 `package-spec.md` 的正式模型与过渡策略
- 更新 `role-definition.md` 的迁移说明
- 更新 `AGENTS.md` 的优先级规则
- 增加一份迁移说明文档
- reviewer 审核文档一致性

---

# 十七、建议交给 OpenCode 的启动说明

你可以把下面这段直接发给 OpenCode：

```text
现在开始开发 feature：002-role-model-alignment。

目标：
统一当前仓库中的角色模型认知和过渡策略，明确 6-role 执行层模型是正式模型，3-skill 骨架是过渡实现。

要求：
1. 先按 spec-driven 流程推进，不要直接做大范围重构
2. 先创建或完善 `specs/002-role-model-alignment/spec.md`
3. 再生成 `plan.md`
4. 再生成 `tasks.md`
5. 当前阶段以治理文档修正和迁移说明为主，不要直接扩展到正式核心角色实现
6. 每一步结束后，汇报：
   - 创建/更新的文件
   - 本步完成内容
   - 下一步建议

优先检查并可能更新：
- README.md
- package-spec.md
- role-definition.md
- AGENTS.md

先从 `/spec-start 002-role-model-alignment` 开始。
```

---

# 十八、推荐执行顺序

```bash
/spec-start 002-role-model-alignment
/spec-plan 002-role-model-alignment
/spec-tasks 002-role-model-alignment
/spec-implement 002-role-model-alignment T-001
/spec-audit 002-role-model-alignment
```

注意：

- 当前 feature 以治理对齐为主，不要一开始就做大规模目录重构
- 先确认 spec 和 plan 是否把“正式模型”和“过渡模型”讲清楚
- implement 阶段优先做文档修正类最小任务
