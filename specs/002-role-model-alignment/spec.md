# Feature Spec: 002-role-model-alignment

## Background

当前仓库已经明确采用 6 个执行角色作为正式角色模型：

- **architect** - 架构师
- **developer** - 开发者
- **tester** - 测试员
- **reviewer** - 审查员
- **docs** - 文档员
- **security** - 安全员

但 `.opencode/skills/` 仍保留较早期的 3-skill 骨架：

- **spec-writer** - 规格编写
- **architect-auditor** - 架构审计
- **task-executor** - 任务执行

这种不一致会导致：
1. 文档说一套，技能骨架按另一套理解
2. Feature 边界混乱
3. Role-definition 和 skill-behavior 不一致
4. OpenCode 在 spec/plan/tasks 阶段持续沿旧模型理解工作
5. 正式角色能力开发被迁移问题污染

## Goal

完成一次关键的角色模型对齐与迁移治理：

1. 明确 **6-role 执行层模型** 是正式模型
2. 明确当前 `.opencode/skills/` 中的 **3-skill 骨架** 只是过渡实现
3. 给出两者之间的映射关系和迁移策略
4. 修正 README / package spec / role definition / AGENTS 等文档中的表述
5. 为后续正式核心角色 feature（如 `003-architect-core`）扫清认知和治理层障碍

成功标准：
- 治理层文档清楚说明 6-role 是正式模型，3-skill 是过渡骨架
- 存在明确的 3-skill 到 6-role 的映射关系文档
- 后续 feature 主线顺序清晰（003-architect-core, 004-developer-core 等）
- 现有 bootstrap 流程和 command 使用方式不受影响

## Scope

**包含的功能：**

1. **正式角色模型定义收敛**
   - 在 package-spec.md 中明确 6-role 的正式地位
   - 说明 3-skill 的过渡性质和保留理由

2. **映射关系定义**
   - 创建 `docs/architecture/role-model-evolution.md`
   - 定义 3-skill 到 6-role 的映射关系

3. **治理文档修正**
   - 更新 README.md 中的阶段说明与主线顺序
   - 更新 package-spec.md 中的角色模型说明
   - 更新 role-definition.md 补充迁移说明
   - 更新 AGENTS.md 声明"正式角色语义优先"

4. **迁移说明文档**
   - 创建 `docs/infra/migration/skill-to-role-migration.md`
   - 说明当前状态、未来方向、迁移策略

**包含的文件：**
- `docs/architecture/role-model-evolution.md` (新建)
- `docs/infra/migration/skill-to-role-migration.md` (新建)
- `README.md` (更新)
- `package-spec.md` (更新)
- `role-definition.md` (更新)
- `AGENTS.md` (更新)

## Out of Scope

**明确不包含的功能：**

1. 实现 architect / developer / tester 的真正业务能力
2. 完整重写全部 skill 目录（物理重构）
3. 大规模代码实现
4. 完整自动迁移系统（自动重命名、兼容层）
5. 最终版角色矩阵优化（一次做到最完美）

**技术限制：**
- 不删除现有 `.opencode/skills/` 目录
- 不修改现有 bootstrap 流程的实现
- 不改变现有 command 的行为

## Actors

**主要参与者：**

1. **architect** - 负责角色模型和系统边界设计
2. **reviewer** - 检查治理文档前后一致性
3. **docs** - 整理迁移说明和 README 更新
4. **user/operator** - 确认正式方向

**系统角色：**
- architect - 设计迁移策略
- reviewer - 审查文档一致性
- docs - 文档同步

## Core Workflows

### 主流程：角色模型对齐

```
1. 盘点当前治理层和技术骨架中的角色定义差异
2. 识别正式模型与过渡骨架之间的关键冲突点
3. 确定正式模型（6-role）和过渡定位（3-skill）
4. 定义映射关系和迁移主线
5. 更新 README / package spec / role definition / AGENTS
6. 创建迁移说明文档
7. reviewer 审核文档一致性
```

### 替代流程 1：发现重大冲突

```
3a. 发现治理文档之间存在根本性冲突
4a. 创建冲突报告
5a. 升级给用户决策
```

### 替代流程 2：映射关系不确定

```
4a. 某些 skill 到 role 的映射关系不明确
5a. 记录为 Open Question
6a. 使用暂定映射，后续迭代修正
```

## Business Rules

**业务规则：**

1. **BR-001**: 6-role 模型必须被定义为正式执行层模型
2. **BR-002**: 3-skill 模型必须被定义为 bootstrap / transition 骨架，而不是正式角色体系
3. **BR-003**: 不得在当前阶段将迁移问题偷偷塞进后续核心能力 feature
4. **BR-004**: 不得因为迁移说明而破坏现有 bootstrap 可运行性
5. **BR-005**: 所有迁移说明必须尽量清晰、可追踪、可被后续 feature 复用

## Non-functional Requirements

**清晰性：**
- 任何阅读仓库的人都应能快速理解当前处于什么迁移阶段

**一致性：**
- README、package spec、role definition、AGENTS 中的角色语义应基本一致

**可执行性：**
- 输出结果应能直接支撑后续新 feature 的命名和规划

**最小侵入：**
- 避免在本 feature 中引入过大范围的物理目录重构

**可演进性：**
- 后续可继续从"语义统一"演进到"物理目录统一"

## Acceptance Criteria

**验收标准：**

### AC-001: 正式模型明确
**Given**: 阅读 package-spec.md 和 role-definition.md
**When**: 查看角色模型定义
**Then**: 
- 清楚说明 6-role 执行层模型是正式模型
- 每个角色的职责边界清晰

### AC-002: 过渡模型明确
**Given**: 阅读迁移说明文档
**When**: 查看 3-skill 定位
**Then**:
- 清楚说明 3-skill 骨架是过渡实现
- 说明保留理由和计划弃用时间线

### AC-003: 映射关系存在
**Given**: 阅读 docs/architecture/role-model-evolution.md
**When**: 查看映射章节
**Then**:
- 明确说明 spec-writer -> upstream-spec-assist / bootstrap
- 明确说明 architect-auditor -> architect + reviewer
- 明确说明 task-executor -> developer + tester + docs + security

### AC-004: 主线顺序清晰
**Given**: 阅读 README.md 的 roadmap 章节
**When**: 查看后续 feature 规划
**Then**:
- 后续正式 feature 按 6-role 模型展开
- 主线顺序为：003-architect-core -> 004-developer-core -> 005-tester-core -> 006-reviewer-core -> ...

### AC-005: 文档语义一致
**Given**: 对比 README / package-spec / role-definition / AGENTS
**When**: 查看角色相关表述
**Then**:
- 不再出现明显互相冲突的角色表述
- 正式角色术语使用一致

### AC-006: 不破坏当前骨架
**Given**: 运行现有 bootstrap 流程
**When**: 执行 /spec-start, /spec-plan 等命令
**Then**:
- 现有 bootstrap 流程可正常运行
- command 使用方式不受影响

## Assumptions

**设计假设：**

1. **ASM-001**: 6-role 模型是经过充分讨论后的正式方向
2. **ASM-002**: 3-skill 骨架短期内仍需保留以维持可运行性
3. **ASM-003**: 用户接受"先语义对齐，后物理重构"的迁移策略
4. **ASM-004**: 后续 feature 愿意围绕 6-role 模型展开
5. **ASM-005**: 当前治理文档的主要方向已经偏向 6-role，只需微调

## Open Questions

**待澄清问题：**

1. **Q-001**: 是否需要在当前阶段创建 6-role 的 skill 目录结构？
   - **状态**: 待架构确认
   - **当前处理**: 当前阶段只做语义对齐，不物理重构

2. **Q-002**: 3-skill 骨架何时可以完全弃用？
   - **状态**: 待后续规划
   - **当前处理**: 暂不设定弃用时间点，只明确过渡性质

3. **Q-003**: 是否需要保留 3-skill 到 6-role 的兼容层？
   - **状态**: 待架构确认
   - **当前处理**: 当前阶段不要求兼容层

---

**文档信息：**
- **Spec ID**: 002-role-model-alignment
- **版本**: 1.0.0
- **创建日期**: 2026-03-22
- **作者**: OpenCode Team
- **评审状态**: 待评审
