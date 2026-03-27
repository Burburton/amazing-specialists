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
- **.opencode/skills/** - 技能目录（两层结构：6-role 正式角色 + 3-skill 过渡骨架）
- **examples/** - 正例、边界例、失败例
- **specs/** - 本专家包自身功能的 spec-driven 开发目录
- **docs/** - 使用指南和验证报告

### 关于 Skills 目录结构

本专家包采用 **6-role 正式执行层模型**作为角色语义标准：

- **architect**（架构师）- 技术方案设计
- **developer**（开发者）- 代码实现
- **tester**（测试员）- 测试验证
- **reviewer**（审查员）- 独立审查
- **docs**（文档员）- 文档同步
- **security**（安全员）- 安全审查

同时，`.opencode/skills/` 目录保留早期 **3-skill 过渡骨架**以兼容 bootstrap 流程：

- **spec-writer** - 规格编写（legacy，将迁移到 architect + docs）
- **architect-auditor** - 架构审计（legacy，将迁移到 architect + reviewer）
- **task-executor** - 任务执行（legacy，将迁移到 developer/tester/docs/security）

> **重要**：3-skill 是过渡实现，不代表最终角色边界。后续 feature 命名、流程描述都应围绕 **6-role 正式模型**展开。详见 [docs/architecture/role-model-evolution.md](docs/architecture/role-model-evolution.md)。

## Skills 清单

### Common Skills（5个）
- **artifact-reading** - 统一读取工件，提取关键字段
- **context-summarization** - 上下文裁剪，防止膨胀
- **failure-analysis** - 失败根因分析，分类失败类型
- **execution-reporting** - 统一输出执行结果
- **retry-strategy** - 智能返工策略选择

### Architect Skills（3个）✅ 正式实现
> **注**: 通过 `003-architect-core` feature 正式实现，包含完整的 artifact contracts、validation layer 和 educational materials。

- **requirement-to-design** - 需求转技术设计
- **module-boundary-design** - 模块边界划分
- **tradeoff-analysis** - 技术方案对比分析

### Developer Skills（3个）✅ 正式实现
> **注**: 通过 `004-developer-core` feature 正式实现，包含完整的 artifact contracts、validation layer 和 educational materials。

- **feature-implementation** - 功能实现
- **bugfix-workflow** - Bug 修复闭环
- **code-change-selfcheck** - 代码变更自检

### Tester Skills（3个）✅ 正式实现
> **注**: 通过 `005-tester-core` feature 正式实现，包含完整的 artifact contracts、validation layer 和 educational materials。

- **unit-test-design** - 单元测试设计
- **regression-analysis** - 回归分析
- **edge-case-matrix** - 边界条件矩阵

### Reviewer Skills（3个）✅ 正式实现
> **注**: 通过 `006-reviewer-core` feature 正式实现，包含完整的 artifact contracts、validation layer 和 educational materials。

- **code-review-checklist** - 代码审查清单
- **spec-implementation-diff** - Spec 与实现对比
- **reject-with-actionable-feedback** - 可执行反馈

### Docs Skills（2个）✅ 正式实现
> **注**: 通过 `007-docs-core` feature 正式实现，包含完整的 artifact contracts、validation layer 和 educational materials。

- **readme-sync** - README 文档同步
- **changelog-writing** - 变更日志编写

### Security Skills（2个）✅ 正式实现
> **注**: 通过 `008-security-core` feature 正式实现，包含完整的 artifact contracts、validation layer 和 educational materials。

- **auth-and-permission-review** - 认证权限审查
- **input-validation-review** - 输入验证审查

## How to Use

### 对于 OpenClaw 管理层调用者
1. 通过统一 dispatch payload 调用专家包角色
2. 接收统一 execution result 和 artifact
3. 根据 recommendation 决定下一步动作（CONTINUE/REWORK/REPLAN/ESCALATE）

### 对于专家包开发者
1. 阅读 package-spec.md 理解专家包定位
2. 阅读 role-definition.md 理解各角色边界
3. 阅读 io-contract.md 理解输入输出契约
4. 阅读 docs/skills-usage-guide.md 了解如何使用 skills
5. 按 quality-gate.md 实现质量门禁
6. 遵循 collaboration-protocol.md 的交接规则

### 标准调用流程
```
User Input
  -> OpenClaw 管理层
    -> 需求澄清 -> 规格化 -> 里程碑规划 -> 任务分派
      -> OpenCode 专家包（本包）
        -> Common: artifact-reading + context-summarization（准备）
        -> architect: requirement-to-design（设计）
        -> developer: feature-implementation（实现）
        -> developer: code-change-selfcheck（自检）
        -> tester: edge-case-matrix + unit-test-design（测试）
        -> security: auth-and-permission-review（安全审查 - 高风险）
        -> reviewer: code-review-checklist + spec-implementation-diff（审查）
        -> docs: readme-sync + changelog-writing（文档）
        -> Common: execution-reporting（输出）
      -> 返回 execution result
    -> 验收判断 -> 返工/继续/升级
  -> 用户验收
```

## Recommended Workflow

### 阶段 1：治理层初始化 ✅ 已完成
- 完善根目录治理文档（package-spec.md, role-definition.md, io-contract.md 等）
- 建立与上层（OpenClaw）和下层（具体实现）的接口契约

### 阶段 2：核心角色 skills 实现 ✅ 已完成
- ✅ Common Skills（5个）: artifact-reading, context-summarization, failure-analysis, execution-reporting, retry-strategy
- ✅ Architect Skills（3个）: requirement-to-design, module-boundary-design, tradeoff-analysis
- ✅ Developer Skills（3个）: feature-implementation, bugfix-workflow, code-change-selfcheck
- ✅ Tester Skills（3个）: unit-test-design, regression-analysis, edge-case-matrix
- ✅ Reviewer Skills（3个）: code-review-checklist, spec-implementation-diff, reject-with-actionable-feedback
- ✅ Docs Skills（2个）: readme-sync, changelog-writing
- ✅ Security Skills（2个）: auth-and-permission-review, input-validation-review

### 阶段 3：文档与验证 ✅ 已完成
- ✅ 创建 skill-development-plan.md（开发计划）
- ✅ 创建 skills-usage-guide.md（使用指南）
- ✅ 验证 Common Skills（验证报告）
- ✅ 验证 Core Roles 协同（验证报告）
- ✅ 验证 Security/Docs 集成（验证报告）

### 阶段 4：角色模型对齐 ✅ 已完成（002-role-model-alignment）
- 明确 6-role 正式执行层模型（architect, developer, tester, reviewer, docs, security）
- 明确 3-skill 过渡骨架定位（spec-writer, architect-auditor, task-executor）
- 建立 3-skill → 6-role 映射关系
- 更新治理文档（package-spec.md, role-definition.md, AGENTS.md, README.md）
- 创建迁移说明文档（role-model-evolution.md, skill-to-role-migration.md）

### 阶段 5：命令固化与 Bootstrap 验证 ✅ 已完成（009-command-hardening）
- ✅ 固化 5 个核心命令的输入输出格式
- ✅ 建立统一的 artifact 模板（9 个模板，覆盖 6 角色 + 通用）
- ✅ 建立规则文件（coding-rules, testing-rules, review-rules）
- ✅ 跑通 specs/001-bootstrap 验证闭环
- ✅ 建立 quality gate 检查规范（quality-gate-checklist, gate-validation-method）
- ✅ 建立 traceability 追溯链方法

**新增文档目录**：
- `docs/rules/` - 执行规则文件
- `docs/templates/` - 统一 artifact 模板
- `docs/validation/` - 质量门禁检查规范
- `docs/traceability/` - 追溯链方法

### 阶段 6：正式核心角色 Feature（主线推荐）
基于 6-role 正式模型，逐步实现各角色的核心能力：

| Feature ID | Feature Name | Status | Description |
|------------|--------------|--------|-------------|
| `003-architect-core` | architect 角色核心技能 | ✅ Complete | 3 core skills, 4 artifact contracts, validation layer |
| `004-developer-core` | developer 角色核心技能 | ✅ Complete | 3 core skills, 3 artifact contracts, validation layer |
| `005-tester-core` | tester 角色核心技能 | ✅ Complete | 3 core skills, 3 artifact contracts, validation layer |
| `006-reviewer-core` | reviewer 角色核心技能 | ✅ Complete | 3 core skills, 3 artifact contracts, validation layer, AH-006 governance alignment |
| `007-docs-core` | docs 角色核心技能 | ✅ Complete | 2 core skills, 2 artifact contracts, validation layer, anti-pattern guidance |
| `008-security-core` | security 角色核心技能 | ✅ Complete | 2 core skills, 2 artifact contracts, validation layer, 6-role model complete |

> **当前进度**: `003-architect-core` 至 `008-security-core` 已全部完成。**6-Role 正式执行模型完整实现**。`010-3-skill-migration` 完成 3-skill 过渡骨架归档。

### 阶段 7：3-Skill 迁移 ✅ 已完成（010-3-skill-migration）

将早期 3-skill 过渡骨架归档到 `docs/archive/legacy-skills/`：
- `spec-writer` → architect + docs 角色协作
- `architect-auditor` → architect + reviewer 角色分工
- `task-executor` → developer + tester + docs + security 角色分工

## Quick Start

### 查看使用指南
阅读 [docs/skills-usage-guide.md](docs/skills-usage-guide.md) 了解如何使用 21 个 skills。

### 查看开发计划
阅读 [specs/skill-development-plan.md](specs/skill-development-plan.md) 了解 skills 的开发顺序和内容框架。

### 查看验证报告
- [specs/common-skills-verification-report.md](specs/common-skills-verification-report.md) - Common Skills 验证
- [specs/m2-skills-integration-verification-report.md](specs/m2-skills-integration-verification-report.md) - Core Roles 协同验证
- [specs/m3-skills-integration-verification-report.md](specs/m3-skills-integration-verification-report.md) - Security/Docs 集成验证

### Skills 目录结构

```
.opencode/skills/
├── common/              # 5个通用技能
├── architect/           # 3个架构师技能（✅ 003-architect-core）
├── developer/           # 3个开发者技能（✅ 004-developer-core）
├── tester/              # 3个测试员技能（✅ 005-tester-core）
├── reviewer/            # 3个审查员技能（✅ 006-reviewer-core）
├── docs/                # 2个文档员技能（✅ 007-docs-core）
└── security/            # 2个安全员技能（✅ 008-security-core）
```

> **6-Role Model Complete**: 所有 6 个角色的核心能力已实现。历史 3-skill 过渡骨架已归档到 `docs/archive/legacy-skills/`。

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

## Project Status

### Skills 完成度

| 阶段 | 数量 | 状态 |
|------|------|------|
| M1 - Common Skills | 5/5 | ✅ 100% |
| M2 - Core Roles | 12/12 | ✅ 100% |
| M3 - Peripheral | 4/4 | ✅ 100% |
| **总计** | **21/21** | **✅ 100%** |

> **6-Role Model Complete**: 所有 6 个角色的核心能力已实现。

### 文档完成度

| 文档 | 状态 |
|------|------|
| package-spec.md | ✅ |
| role-definition.md | ✅ |
| io-contract.md | ✅ |
| skill-development-plan.md | ✅ |
| skills-usage-guide.md | ✅ |
| 验证报告 x3 | ✅ |
| 规则文件 (docs/rules/) | ✅ |
| 模板文件 (docs/templates/) | ✅ |
| 检查规范 (docs/validation/) | ✅ |
| 追溯方法 (docs/traceability/) | ✅ |

### 下一步（M4 - 可选增强）

| 角色 | 待实现 Skills |
|------|--------------|
| architect | interface-contract-design, migration-planning |
| developer | refactor-safely, dependency-minimization |
| tester | integration-test-design, flaky-test-diagnosis |
| reviewer | maintainability-review, risk-review |
| docs | architecture-doc-sync, user-guide-update |
| security | secret-handling-review, dependency-risk-review |

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
