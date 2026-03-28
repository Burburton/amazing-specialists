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
- **.opencode/skills/** - 技能目录（6-role 正式角色：architect, developer, tester, reviewer, docs, security）
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

> **历史说明**：早期 **3-skill 过渡骨架**（spec-writer, architect-auditor, task-executor）已于 2026-03-28 归档到 `docs/archive/legacy-skills/`。详见 [specs/010-3-skill-migration/](specs/010-3-skill-migration/)。

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

### Tester Skills（3个 MVP + 6个 M4）✅ 正式实现
> **注**: 通过 `005-tester-core` feature 实现 MVP 核心，`012-performance-testing-skills` feature 实现 M4 性能测试。

**MVP 核心 (3个)**:
- **unit-test-design** - 单元测试设计
- **regression-analysis** - 回归分析
- **edge-case-matrix** - 边界条件矩阵

**M4 性能测试 (6个，可选)**:
- **integration-test-design** - 集成测试设计
- **flaky-test-diagnosis** - 不稳定测试诊断
- **performance-test-design** - 性能测试设计
- **benchmark-analysis** - 基准测试分析
- **load-test-orchestration** - 负载测试编排
- **performance-regression-analysis** - 性能回归分析

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

> **注**: security 角色在高风险任务（认证、支付、敏感数据）中触发。标准流程可在 reviewer 后追加 security 检查。

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
| `001-bootstrap` | 项目初始化 | ✅ Complete | Bootstrap verification, directory structure |
| `002-role-model-alignment` | 角色模型对齐 | ✅ Complete | 6-role formal model, 3-skill migration strategy |
| `002b-governance-repair` | 治理一致性修复 | ✅ Complete | Governance drift repair, document sync |
| `003-architect-core` | architect 角色核心技能 | ✅ Complete | 3 core skills, 4 artifact contracts, validation layer |
| `004-developer-core` | developer 角色核心技能 | ✅ Complete | 3 core skills, 3 artifact contracts, validation layer |
| `005-tester-core` | tester 角色核心技能 | ✅ Complete | 3 core skills, 3 artifact contracts, validation layer |
| `006-reviewer-core` | reviewer 角色核心技能 | ✅ Complete | 3 core skills, 3 artifact contracts, validation layer, AH-006 governance alignment |
| `007-docs-core` | docs 角色核心技能 | ✅ Complete | 2 core skills, 2 artifact contracts, validation layer, anti-pattern guidance |
| `008-security-core` | security 角色核心技能 | ✅ Complete | 2 core skills, 2 artifact contracts, validation layer, 6-role model complete |
| `009-command-hardening` | 命令固化与验证 | ✅ Complete | 5 core commands, 9 templates, quality gate, traceability |
| `010-3-skill-migration` | 3-Skill 迁移归档 | ✅ Complete | Legacy skills archived to docs/archive/legacy-skills/ |
| `011-m4-enhancement-kit` | M4 可选增强套件 | ✅ Complete | 12 M4 skills, --enhanced flag, enhanced-mode-guide |
| `012-performance-testing-skills` | 性能测试技能 | ✅ Complete | 4 performance testing skills for tester role |
| `013-e2e-validation` | 端到端流程验证 | ✅ Complete | 5 commands, 6 roles, AH-001~AH-006 validated |
| `014-enhanced-mode-validation` | Enhanced 模式验证 | ✅ Complete | 16 M4 skills trigger validation, Enhanced mode activated |
| `015-historical-features-audit` | 历史功能审计 | ✅ Complete | 10 features audited, AH-001~AH-006 compliant |
| `016-release-preparation` | 发布准备 | ✅ Complete | Document cleanup, governance verification, release checklist |

> **当前进度**: `001-bootstrap` 至 `016-release-preparation` 已全部完成。**6-Role 正式执行模型完整实现并验证，Enhanced 模式已验证可用，历史功能审计通过，发布准备就绪**。

### 阶段 7：3-Skill 迁移 ✅ 已完成（010-3-skill-migration）

将早期 3-skill 过渡骨架归档到 `docs/archive/legacy-skills/`：
- `spec-writer` → architect + docs 角色协作
- `architect-auditor` → architect + reviewer 角色分工
- `task-executor` → developer + tester + docs + security 角色分工

### 阶段 8：M4 可选增强套件 ✅ 已完成（011-m4-enhancement-kit）

基于 6-role 正式模型，为每个角色添加可选增强技能：
- **Enhanced Mode**: 通过 `--enhanced` 标志启用
- **16 个 M4 Skills**: interface-contract-design, migration-planning, refactor-safely, dependency-minimization, integration-test-design, flaky-test-diagnosis, performance-test-design, benchmark-analysis, load-test-orchestration, performance-regression-analysis, maintainability-review, risk-review, architecture-doc-sync, user-guide-update, secret-handling-review, dependency-risk-review
- **默认 MVP 模式**: 不带 `--enhanced` 时仅使用 21 个核心技能
- **增强层激活**: 命令行标志、spec.md 元数据继承、环境变量

**新增文档**：
- `docs/enhanced-mode-selector.md` - Enhanced 模式检测逻辑
- `docs/enhanced-mode-guide.md` - Enhanced 模式使用指南

### 阶段 9：端到端流程验证 ✅ 已完成（013-e2e-validation）

通过实际运行完整 spec-driven workflow 验证系统执行能力：
- **5 个命令验证**: spec-start, spec-plan, spec-tasks, spec-implement, spec-audit 全部通过
- **6 个角色协同验证**: architect, developer, tester, reviewer, docs, security 正确协同
- **Governance 规则验证**: AH-001 至 AH-006 审计规则全部通过
- **验证结论**: PASS_WITH_WARNINGS (2 minor cosmetic issues)

**新增验证报告**：
- `specs/013-e2e-validation/verification-report.md` - 端到端验证总结

### 阶段 10：Enhanced 模式验证 ✅ 已完成（014-enhanced-mode-validation）

通过实际运行 Enhanced 模式验证 M4 skills 触发机制：
- **Enhanced 模式激活验证**: spec.md enhanced: true 元数据正确继承
- **M4 Skills 触发验证**: 4 个 skills 正确触发，8 个正确不触发
- **Enhanced 审计验证**: maintainability-review, risk-review 正确执行
- **验证结论**: PASS (Maintainability: 8/10, Risk: Low)

**新增验证报告**：
- `specs/014-enhanced-mode-validation/verification-report.md` - Enhanced 模式验证总结

### 阶段 11：历史功能审计 ✅ 已完成（015-historical-features-audit）

对历史 features (003-012) 执行 AH-001~AH-006 审计规则：
- **审计范围**: 10 个历史 features
- **发现问题**: 4 个 major findings (AH-004 状态不一致)
- **修复状态**: 全部修复
- **Governance 合规**: AH-001~AH-006 全部通过

**新增审计报告**：
- `specs/015-historical-features-audit/consolidated-audit-report.md` - 综合审计报告

### 阶段 12：发布准备 ✅ 已完成（016-release-preparation）

为 v1.0.0 正式发布做准备：
- **文档一致性修复**: README/CHANGELOG 添加缺失 features
- **临时产物清理**: 删除空目录，归档早期设计文档
- **Governance 验证**: AH-001~AH-006 全部通过
- **发布状态**: ✅ READY FOR v1.0.0

**新增发布文档**：
- `specs/016-release-preparation/release-checklist.md` - 发布检查清单

> **当前进度**: `001-bootstrap` 至 `008-security-core` 完成 MVP 核心，`010-3-skill-migration` 完成骨架归档，`011-m4-enhancement-kit` 完成 M4 可选增强，`012-performance-testing-skills` 完成性能测试套件，`013-e2e-validation` 完成端到端验证，`014-enhanced-mode-validation` 完成 Enhanced 模式验证，`015-historical-features-audit` 完成历史功能审计，`016-release-preparation` 完成发布准备。**Skills 总计 37 个（21 MVP + 16 M4）**，**Features 总计 17 个**。

## Quick Start

### 查看使用指南
阅读 [docs/skills-usage-guide.md](docs/skills-usage-guide.md) 了解如何使用 21 个 MVP 核心 skills。

### 查看 Enhanced Mode 指南
阅读 [docs/enhanced-mode-guide.md](docs/enhanced-mode-guide.md) 了解如何启用和使用 16 个 M4 增强 skills。

### 查看开发计划
阅读 [specs/skill-development-plan.md](specs/skill-development-plan.md) 了解 skills 的开发顺序和内容框架。

### 查看验证报告
- [specs/common-skills-verification-report.md](specs/common-skills-verification-report.md) - Common Skills 验证
- [specs/m2-skills-integration-verification-report.md](specs/m2-skills-integration-verification-report.md) - Core Roles 协同验证
- [specs/m3-skills-integration-verification-report.md](specs/m3-skills-integration-verification-report.md) - Security/Docs 集成验证
- [specs/013-e2e-validation/verification-report.md](specs/013-e2e-validation/verification-report.md) - 端到端流程验证
- [specs/014-enhanced-mode-validation/verification-report.md](specs/014-enhanced-mode-validation/verification-report.md) - Enhanced 模式验证
- [specs/015-historical-features-audit/consolidated-audit-report.md](specs/015-historical-features-audit/consolidated-audit-report.md) - 历史功能审计报告
- [specs/016-release-preparation/release-checklist.md](specs/016-release-preparation/release-checklist.md) - 发布检查清单

### Skills 目录结构

```
.opencode/skills/
├── common/              # 5个通用技能（MVP）
├── architect/           # 5个架构师技能（3 MVP + 2 M4）
│   ├── requirement-to-design/      # MVP
│   ├── module-boundary-design/     # MVP
│   ├── tradeoff-analysis/          # MVP
│   ├── interface-contract-design/  # M4 (可选)
│   └── migration-planning/          # M4 (可选)
├── developer/           # 5个开发者技能（3 MVP + 2 M4）
│   ├── feature-implementation/     # MVP
│   ├── bugfix-workflow/            # MVP
│   ├── code-change-selfcheck/      # MVP
│   ├── refactor-safely/            # M4 (可选)
│   └── dependency-minimization/    # M4 (可选)
├── tester/              # 9个测试员技能（3 MVP + 6 M4）
│   ├── unit-test-design/           # MVP
│   ├── regression-analysis/        # MVP
│   ├── edge-case-matrix/           # MVP
│   ├── integration-test-design/    # M4 (可选)
│   ├── flaky-test-diagnosis/       # M4 (可选)
│   ├── performance-test-design/    # M4 (可选)
│   ├── benchmark-analysis/         # M4 (可选)
│   ├── load-test-orchestration/    # M4 (可选)
│   └── performance-regression-analysis/  # M4 (可选)
├── reviewer/            # 5个审查员技能（3 MVP + 2 M4）
│   ├── code-review-checklist/      # MVP
│   ├── spec-implementation-diff/   # MVP
│   ├── reject-with-actionable-feedback/  # MVP
│   ├── maintainability-review/     # M4 (可选)
│   └── risk-review/                # M4 (可选)
├── docs/                # 4个文档员技能（2 MVP + 2 M4）
│   ├── readme-sync/                # MVP
│   ├── changelog-writing/          # MVP
│   ├── architecture-doc-sync/      # M4 (可选)
│   └── user-guide-update/          # M4 (可选)
└── security/            # 4个安全员技能（2 MVP + 2 M4）
    ├── auth-and-permission-review/ # MVP
    ├── input-validation-review/    # MVP
    ├── secret-handling-review/     # M4 (可选)
    └── dependency-risk-review/     # M4 (可选)
```

> **MVP 默认，M4 可选**: 默认使用 21 个 MVP 核心技能。M4 16 个增强技能需通过 `--enhanced` 标志显式启用。详见 [docs/enhanced-mode-guide.md](docs/enhanced-mode-guide.md)。

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
| M4 - Enhancement Kit | 16/16 | ✅ 100% (可选) |
| **总计** | **37/37** | **✅ 100%** |

> **MVP 模式默认启用**: 21 个核心技能。M4 16 个增强技能需通过 `--enhanced` 标志显式启用。

### 文档完成度

| 文档 | 状态 |
|------|------|
| package-spec.md | ✅ |
| role-definition.md | ✅ |
| io-contract.md | ✅ |
| skill-development-plan.md | ✅ |
| skills-usage-guide.md | ✅ |
| 验证报告 x4 | ✅ |
| 规则文件 (docs/rules/) | ✅ |
| 模板文件 (docs/templates/) | ✅ |
| 检查规范 (docs/validation/) | ✅ |
| 追溯方法 (docs/traceability/) | ✅ |
| Enhanced Mode 指南 (docs/enhanced-mode-guide.md) | ✅ |
| Enhanced Mode 选择器 (docs/enhanced-mode-selector.md) | ✅ |
| 端到端验证 (specs/013-e2e-validation/) | ✅ |

### M4 - 可选增强套件 ✅ 已完成（011-m4-enhancement-kit + 012-performance-testing-skills）

M4 是 **可选增强层**，补充 MVP 核心技能的高级能力。默认使用 MVP 模式，需显式启用 Enhanced 模式。

#### 启用方式
- **命令行**: 使用 `--enhanced` 标志，如 `/spec-start --enhanced <feature>`
- **Spec 元数据**: 在 `spec.md` 中设置 `enhanced: true`，后续命令自动继承
- **环境变量**: `OPCODE_ENHANCED=true`（调试用）

#### M4 Skills 清单（16 个）

| 角色 | M4 Skills | 用途 |
|------|-----------|------|
| architect | interface-contract-design | API/接口契约设计 |
| architect | migration-planning | 迁移策略规划 |
| developer | refactor-safely | 安全重构流程 |
| developer | dependency-minimization | 依赖最小化 |
| tester | integration-test-design | 集成测试设计 |
| tester | flaky-test-diagnosis | 不稳定测试诊断 |
| tester | performance-test-design | 性能测试设计 |
| tester | benchmark-analysis | 基准测试分析 |
| tester | load-test-orchestration | 负载测试编排 |
| tester | performance-regression-analysis | 性能回归分析 |
| reviewer | maintainability-review | 可维护性审查 |
| reviewer | risk-review | 风险评估审查 |
| docs | architecture-doc-sync | 架构文档同步 |
| docs | user-guide-update | 用户指南更新 |
| security | secret-handling-review | 密钥处理审查 |
| security | dependency-risk-review | 依赖风险审查 |

> **详见**: [docs/enhanced-mode-guide.md](docs/enhanced-mode-guide.md) 了解何时使用 Enhanced 模式。

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
