# Feature Spec: README Quick Start and Doc Unification

## Metadata
- Feature ID: 038-readme-quick-start-and-doc-unification
- Version: 1.0.0
- Status: COMPLETE
- Created: 2026-04-04
- Author: Sisyphus (AI Agent)

---

## Background

### Problem Statement

基于使用者评估报告，专家包存在以下文档问题：

1. **README 过长（629行）**：信息过载，新手难以定位关键入口
2. **文档入口分散**：多个使用指南（skills-usage-guide、USAGE.md、plugin-usage-guide、adapter-usage-guide）缺乏统一导航
3. **Skills 计数口径不一致**：README 说 "23 MVP"，skills-usage-guide 说 "21 个"

### Current State

- README Quick Start 在第 452 行，远离顶部
- 无明确的文档阅读顺序指引
- Skills 计数在不同文档间不一致

---

## Goal

**一句话目标**：优化 README 结构和文档导航，让新手能在 30 秒内开始使用专家包。

---

## Scope

### In Scope

1. **README 顶部添加"30秒快速入门"章节**
   - 3-5 行核心命令
   - 直接可执行的初始化命令
   - 链接到最小示例

2. **README 添加"文档导航"章节**
   - 明确阅读顺序（新手 → 进阶 → 专题）
   - 统一文档入口

3. **Skills 计数口径统一**
   - README 和 skills-usage-guide 使用相同计数
   - 明确 MVP/M4/Plugin 分类

### Out of Scope

1. Adapter 简化命令（P2，单独 feature）
2. 命令说明前置到 README（P2，单独 feature）
3. 文档内容合并/重写（保持现有内容，仅调整结构和导航）

---

## Actors

| Actor | Role | Responsibility |
|-------|------|----------------|
| docs | 文档员 | 更新 README.md、skills-usage-guide.md |
| reviewer | 审查员 | 验证文档一致性、计数准确性 |
| architect | 架构师 | 设计文档结构（可选） |

---

## Core Workflows

### Workflow 1: README 结构优化

```yaml
Trigger: Feature 启动
Steps:
  1. docs: 在 README 顶部（What It Is 之后）插入 "30秒快速入门" 章节
  2. docs: 在 Quick Start 之后添加 "文档导航" 章节
  3. docs: 更新 Skills 计数口径
  4. reviewer: 验证 README 结构和计数一致性
```

### Workflow 2: skills-usage-guide 计数修正

```yaml
Trigger: README 更新后
Steps:
  1. docs: 更新 skills-usage-guide.md 中的 Skills 计数
  2. docs: 确保 "MVP 核心" 定义与 README 一致
  3. reviewer: 验证计数一致性
```

---

## Business Rules

### BR-001: Quick Start 格式规范
"30秒快速入门" 章节必须：
- 不超过 10 行
- 包含可直接执行的命令
- 包含最小示例链接

### BR-002: 文档导航格式规范
"文档导航" 章节必须：
- 明确阅读顺序（新手 → 进阶 → 专题）
- 每个文档一句话描述用途
- 链接使用相对路径

### BR-003: Skills 计数口径规范
Skills 计数必须使用以下口径：
- **MVP 核心**: 23 个（common 5 + architect 3 + developer 3 + tester 3 + reviewer 3 + docs 3 + security 2）
- **M4 增强**: 16 个（可选）
- **Plugin**: 4 个（vite-setup, css-module-test, run-tests, run-build）
- **总计**: 43 个

---

## Acceptance Criteria

### AC-001: README Quick Start 可见性
**Given**: 用户打开 README.md
**When**: 查看前 50 行
**Then**: 能看到 "30秒快速入门" 章节

### AC-002: 文档导航完整性
**Given**: 用户查看 README "文档导航" 章节
**When**: 需要找到特定使用指南
**Then**: 能看到所有主要文档的链接和用途描述

### AC-003: Skills 计数一致性
**Given**: 用户查看 README 和 skills-usage-guide
**When**: 对比 Skills 计数
**Then**: 两处计数口径一致（MVP 23 个）

### AC-004: 快速入门可执行
**Given**: 新用户阅读 "30秒快速入门"
**When**: 执行其中的命令
**Then**: 能成功初始化项目或开始第一个 feature

---

## Non-functional Requirements

### NFR-001: 可维护性
- 文档导航章节应易于更新（新增文档时只需添加一行）
- Quick Start 命令应与 Template CLI 保持同步

### NFR-002: 一致性
- 所有文档中 Skills 计数使用相同口径
- 文档描述用语一致

---

## Assumptions

1. Template CLI (`templates/cli/init.js`) 已存在且可用
2. 最小示例 (`examples/01-quick-start/minimal-example.md`) 已存在且内容正确
3. 用户熟悉基本的命令行操作

---

## Open Questions

1. **Q1**: "30秒快速入门" 是否需要包含 Enhanced Mode 说明？
   - **倾向**: 不包含，保持简洁，Enhanced Mode 在"进阶"部分说明

2. **Q2**: 文档导航是否需要包含所有 specs 目录下的验证报告？
   - **倾向**: 不包含，验证报告属于"深度参考"，在 Quick Start 链接即可

---

## References

- [README.md](../README.md) - 当前 README
- [docs/skills-usage-guide.md](../docs/skills-usage-guide.md) - Skills 使用指南
- [templates/USAGE.md](../templates/USAGE.md) - Template 使用指南
- [examples/01-quick-start/minimal-example.md](../examples/01-quick-start/minimal-example.md) - 最小示例
- 评估报告（对话上下文）