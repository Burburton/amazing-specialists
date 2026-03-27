# 用户认证功能 - 端到端示例

本文档展示一个完整的 feature 开发流程，包含真实的代码示例和所有阶段的产出。

## 功能概述

实现用户登录认证功能：
- 用户名/密码登录
- JWT Token 生成
- 错误处理

## 目录结构

```
user-auth-feature/
├── README.md           # 本文件
├── spec.md             # 产品规格
├── plan.md             # 实现计划
├── tasks.md            # 任务列表
└── artifacts/          # 各阶段产出
    ├── design-note.md
    ├── implementation-summary.md
    ├── test-report.md
    └── review-report.md
```

## 流程概览

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   spec.md   │───>│   plan.md   │───>│  tasks.md   │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────┐
│                    spec-implement                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │developer │──│  tester  │──│ reviewer │──│  docs   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                                      ┌─────────────┐
                                      │ spec-audit  │
                                      └─────────────┘
```

## 关键产出

| 阶段 | 角色 | 产出文件 |
|------|------|----------|
| 设计 | architect | design-note.md |
| 实现 | developer | implementation-summary.md |
| 测试 | tester | test-report.md |
| 审查 | reviewer | review-report.md |

## 使用的 Skills

### MVP Skills
- architect: `requirement-to-design`, `tradeoff-analysis`
- developer: `feature-implementation`, `code-change-selfcheck`
- tester: `unit-test-design`, `edge-case-matrix`
- reviewer: `code-review-checklist`, `spec-implementation-diff`
- docs: `readme-sync`
- security: `auth-and-permission-review`

### M4 Skills (如启用 --enhanced)
- architect: `interface-contract-design`
- developer: `refactor-safely`
- tester: `integration-test-design`
- reviewer: `risk-review`
- security: `secret-handling-review`

## 查看详细内容

- [spec.md](spec.md) - 产品规格
- [plan.md](plan.md) - 实现计划
- [tasks.md](tasks.md) - 任务列表
- [artifacts/](artifacts/) - 各阶段产出