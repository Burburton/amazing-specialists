# Feature Spec: README Command Reference and Adapter Quick Command

## Metadata
- Feature ID: 039-readme-command-reference-and-adapter-quick
- Version: 1.0.0
- Status: COMPLETE
- Created: 2026-04-04
- Author: Sisyphus (AI Agent)

---

## Background

### Problem Statement

基于使用者评估报告，专家包存在以下 P2 问题：

1. **命令说明分散**：5 个核心命令定义在 `.opencode/commands/` 目录，新手可能错过，需要跳转文件才能查看
2. **Adapter 使用门槛高**：CLI Adapter 需要理解 Dispatch Payload 格式，参数复杂

### Current State

- 命令说明在 `.opencode/commands/spec-*.md` 文件中
- README 只有命令名称，无详细说明
- CLI Adapter 调用需要多个参数：
  ```bash
  node adapters/cli-local/index.js --project myapp --milestone m1 --task t001 \
    --role developer --command implement-task "标题" "目标"
  ```

---

## Goal

**一句话目标**：在 README 中前置命令说明，简化 Adapter 调用，降低使用门槛。

---

## Scope

### In Scope

1. **README 添加"核心命令参考"章节**
   - 在 README 中直接展开 5 个核心命令的说明
   - 包含命令用途、参数、输出
   - 减少文件跳转

2. **CLI Adapter 添加 `quick` 子命令**
   - 简化参数，仅需 `--role` 和任务描述
   - 自动填充默认值
   - 降低使用门槛

### Out of Scope

1. 修改命令的实际行为（仅添加文档和简化入口）
2. 其他 Adapter（GitHub Issue, OpenClaw 等）
3. Adapter 完整功能（保留现有功能，仅添加快捷入口）

---

## Actors

| Actor | Role | Responsibility |
|-------|------|----------------|
| docs | 文档员 | 更新 README.md |
| developer | 开发者 | 实现 CLI Adapter quick 子命令 |
| tester | 测试员 | 验证 quick 子命令功能 |
| reviewer | 审查员 | 验证文档和代码一致性 |

---

## Core Workflows

### Workflow 1: README 命令参考添加

```yaml
Trigger: Feature 启动
Steps:
  1. docs: 在 README "文档导航" 之后添加 "核心命令参考" 章节
  2. docs: 展开 5 个命令的用途、参数、输出
  3. reviewer: 验证命令说明与实际定义一致
```

### Workflow 2: CLI Adapter Quick 子命令

```yaml
Trigger: README 更新后
Steps:
  1. developer: 修改 adapters/cli-local/index.js 添加 quick 子命令
  2. developer: 实现参数简化和默认值填充
  3. tester: 测试 quick 子命令功能
  4. docs: 更新 adapter-usage-guide.md
  5. reviewer: 验证功能正确性
```

---

## Business Rules

### BR-001: README 命令参考格式规范
"核心命令参考" 章节必须：
- 每个命令包含：用途、参数、输出
- 使用表格或列表格式，简洁明了
- 链接到详细定义文件

### BR-002: Quick 子命令参数规范
Quick 子命令必须：
- 仅需 `--role` 和任务描述（位置参数）
- 自动填充：project_id, milestone_id, task_id（默认值）
- 支持可选 `--enhanced` 标志

### BR-003: 向后兼容
- 保留 CLI Adapter 现有功能
- Quick 子命令是新增功能，不影响现有调用方式

---

## Acceptance Criteria

### AC-001: README 命令参考可见性
**Given**: 用户打开 README.md
**When**: 查看 "核心命令参考" 章节
**Then**: 能看到 5 个核心命令的用途、参数、输出说明

### AC-002: Quick 子命令可用
**Given**: 用户执行 CLI Adapter
**When**: 使用 `quick` 子命令
**Then**: 能用简化参数启动任务

### AC-003: Quick 子命令输出正确
**Given**: 用户执行 `quick` 子命令
**When**: 提供正确的参数
**Then**: 输出正确的 Dispatch Payload

### AC-004: 文档更新
**Given**: Quick 子命令实现完成
**When**: 查看 adapter-usage-guide.md
**Then**: 能看到 quick 子命令的使用说明

---

## Non-functional Requirements

### NFR-001: 可维护性
- 命令说明应与 `.opencode/commands/*.md` 保持同步
- Quick 子命令逻辑简单，易于理解

### NFR-002: 向后兼容
- 现有 CLI Adapter 调用方式不受影响
- 新增功能不影响现有功能

---

## Assumptions

1. 5 个核心命令定义已稳定，不会频繁变更
2. Quick 子命令的默认值适用于大多数场景
3. 用户熟悉基本的命令行操作

---

## Open Questions

1. **Q1**: Quick 子命令的默认 project_id/milestone_id/task_id 应该是什么？
   - **倾向**: 使用 `default` 或 `quick-task` 作为占位符

2. **Q2**: Quick 子命令是否需要支持所有 6 个角色？
   - **倾向**: 支持 developer, architect, tester 三个主要角色，其他可选

---

## References

- [README.md](../../README.md) - 当前 README
- [.opencode/commands/](../../.opencode/commands/) - 命令定义
- [adapters/cli-local/index.js](../../adapters/cli-local/index.js) - CLI Adapter 实现
- [docs/adapters/adapter-usage-guide.md](../adapters/adapter-usage-guide.md) - Adapter 使用指南