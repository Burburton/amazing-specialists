# Examples 目录

本目录包含 OpenCode 专家包的使用示例，帮助理解如何使用 6-role 执行模型完成产品研发。

## 目录结构

```
examples/
├── README.md                    # 本文件
├── happy-path.md               # 标准流程示例（流程描述）
├── edge-cases.md               # 边界场景处理
├── failure-cases.md            # 失败场景处理
│
├── 01-quick-start/             # 快速入门
│   └── minimal-example.md      # 最小可运行示例
│
├── 02-end-to-end-feature/      # 完整 feature 开发示例
│   └── user-auth-feature/      # 用户认证功能示例
│       ├── README.md
│       ├── spec.md             # 产品规格
│       ├── plan.md             # 实现计划
│       ├── tasks.md            # 任务列表
│       └── artifacts/          # 模拟产出
│           ├── design-note.md
│           ├── implementation-summary.md
│           ├── test-report.md
│           └── review-report.md
│
├── 03-role-specific/           # 角色级示例
│   ├── architect-example.md    # architect 角色示例
│   ├── developer-example.md    # developer 角色示例
│   ├── tester-example.md       # tester 角色示例
│   ├── reviewer-example.md     # reviewer 角色示例
│   ├── docs-example.md         # docs 角色示例
│   └── security-example.md     # security 角色示例
│
└── 04-enhanced-mode/           # Enhanced 模式示例
    └── using-enhanced-mode.md  # 如何使用 --enhanced 标志
```

## 示例分类

### 普通用户示例
以下示例展示终端用户的日常使用方式：

- [01-quick-start/minimal-example.md](01-quick-start/minimal-example.md) - 使用 Spec 命令的完整流程（推荐入门）
- [02-end-to-end-feature/](02-end-to-end-feature/) - 完整 feature 开发示例
- [03-role-specific/](03-role-specific/) - 各角色详细用法

### 高级用户/系统集成者示例
以下示例展示系统内部机制，供高级用户和系统集成者参考：

- [happy-path.md](happy-path.md) - 系统内部调用流程（理解架构）
- [cli-workflow.md](cli-workflow.md) - CLI Adapter 使用（高级）
- [local-repo-output.md](local-repo-output.md) - Workspace Adapter 使用（高级）

## 快速导航

### 我是新手
1. 阅读 [happy-path.md](happy-path.md) 理解标准流程
2. 查看 [01-quick-start/](01-quick-start/) 运行第一个示例
3. 深入 [02-end-to-end-feature/](02-end-to-end-feature/) 了解完整流程

### 我想知道特定角色如何工作
查看 [03-role-specific/](03-role-specific/) 目录下对应角色的示例。

### 我想使用 Enhanced 模式
查看 [04-enhanced-mode/](04-enhanced-mode/) 了解如何使用 `--enhanced` 标志。

### 我遇到了问题
查看 [edge-cases.md](edge-cases.md) 和 [failure-cases.md](failure-cases.md) 了解边界和失败场景处理。

## 示例概览

| 示例 | 类型 | 难度 | 描述 |
|------|------|------|------|
| happy-path | 流程 | ⭐ | 标准 feature 开发流程 |
| minimal-example | 实践 | ⭐ | 最小可运行示例 |
| user-auth-feature | 实践 | ⭐⭐⭐ | 完整的用户认证功能开发 |
| role-specific | 角色 | ⭐⭐ | 每个角色的具体用法 |
| enhanced-mode | 高级 | ⭐⭐⭐ | Enhanced 模式使用示例 |

## Skills 快速参考

### MVP 核心 Skills (21 个)

| 角色 | Skills |
|------|--------|
| common | artifact-reading, context-summarization, failure-analysis, execution-reporting, retry-strategy |
| architect | requirement-to-design, module-boundary-design, tradeoff-analysis |
| developer | feature-implementation, bugfix-workflow, code-change-selfcheck |
| tester | unit-test-design, regression-analysis, edge-case-matrix |
| reviewer | code-review-checklist, spec-implementation-diff, reject-with-actionable-feedback |
| docs | readme-sync, changelog-writing |
| security | auth-and-permission-review, input-validation-review |

### M4 增强 Skills (12 个，可选)

| 角色 | M4 Skills |
|------|-----------|
| architect | interface-contract-design, migration-planning |
| developer | refactor-safely, dependency-minimization |
| tester | integration-test-design, flaky-test-diagnosis |
| reviewer | maintainability-review, risk-review |
| docs | architecture-doc-sync, user-guide-update |
| security | secret-handling-review, dependency-risk-review |

## 相关文档

- [docs/skills-usage-guide.md](../docs/skills-usage-guide.md) - Skills 使用指南
- [docs/enhanced-mode-guide.md](../docs/enhanced-mode-guide.md) - Enhanced 模式指南
- [README.md](../README.md) - 项目总览