# Feature Spec: Template Pack Content Fix

## Metadata
- Feature ID: 040-template-pack-content-fix
- Version: 1.0.0
- Status: COMPLETE
- Created: 2026-04-04
- Author: Sisyphus (AI Agent)

---

## Background

### Problem Statement

基于易用性评估，模板包初始化后存在以下关键问题：

1. **CLI 脚本缺失**：初始化后的项目不包含 `templates/cli/` 目录，用户无法运行 `doctor.js` 健康检查
2. **Examples 缺失**：README 链接的 `examples/01-quick-start/` 不存在，新手无处参考
3. **Docs 部分缺失**：`docs/` 目录为空，README 文档导航链接失效

### Current State

- `templates/pack/minimal/` 包含 117 个文件
- 不包含 `templates/cli/`、`examples/`、`docs/` 目录
- README 中的文档导航链接指向不存在的文件

---

## Goal

**一句话目标**：扩展模板包内容，确保初始化后的项目具备完整的 CLI 工具、示例和文档。

---

## Scope

### In Scope

1. **CLI 脚本复制到模板包**
   - `templates/cli/init.js`
   - `templates/cli/install.js`
   - `templates/cli/doctor.js`

2. **Examples 目录加入模板包**
   - `examples/01-quick-start/minimal-example.md`

3. **关键 Docs 文件加入模板包**
   - `docs/skills-usage-guide.md`
   - `docs/enhanced-mode-guide.md`
   - `docs/adapters/adapter-usage-guide.md`
   - `docs/plugin-usage-guide.md`

4. **更新 content-index.json**
   - 添加新增文件到 required 分类

5. **更新 doctor.js 检查项**
   - 检查 templates/cli/ 存在
   - 检查 examples/ 存在
   - 检查 docs/ 存在

### Out of Scope

1. 修改初始化逻辑（仅扩展复制内容）
2. 创建新的示例或文档
3. 修改 README 内容（链接已正确）

---

## Actors

| Actor | Role | Responsibility |
|-------|------|----------------|
| developer | 开发者 | 复制文件到模板包目录 |
| docs | 文档员 | 更新 content-index.json |
| tester | 测试员 | 验证初始化后项目完整性 |
| reviewer | 审查员 | 验证所有文件存在 |

---

## Core Workflows

### Workflow 1: 扩展模板包内容

```yaml
Trigger: Feature 启动
Steps:
  1. developer: 创建 templates/pack/minimal/templates/cli/ 目录
  2. developer: 复制 CLI 脚本到模板包
  3. developer: 创建 templates/pack/minimal/examples/ 目录
  4. developer: 复制 minimal-example.md 到模板包
  5. developer: 创建 templates/pack/minimal/docs/ 目录
  6. developer: 复制关键 docs 文件到模板包
  7. docs: 更新 content-index.json
  8. developer: 更新 doctor.js 检查项
  9. tester: 测试初始化后项目完整性
  10. reviewer: 验证所有文件存在
```

---

## Business Rules

### BR-001: 模板包目录结构规范
模板包必须包含以下目录：
- `templates/cli/` - CLI 工具脚本
- `examples/01-quick-start/` - 最小示例
- `docs/` - 关键使用文档

### BR-002: 文件复制规则
- 复制文件时保持原有结构和内容
- 不修改文件内容

### BR-003: Profile 一致性
- minimal 和 full profile 都包含相同的 CLI、examples、docs

---

## Acceptance Criteria

### AC-001: CLI 脚本可用
**Given**: 用户初始化新项目
**When**: 进入项目目录运行 `node templates/cli/doctor.js`
**Then**: 命令执行成功，显示健康检查结果

### AC-002: Examples 可访问
**Given**: 用户初始化新项目
**When**: 查看 `examples/01-quick-start/minimal-example.md`
**Then**: 文件存在且内容正确

### AC-003: Docs 链接有效
**Given**: 用户查看 README 文档导航
**When**: 点击 `docs/skills-usage-guide.md` 链接
**Then**: 文件存在

### AC-004: Doctor 检查项更新
**Given**: 用户运行 `doctor.js`
**When**: 检查执行
**Then**: 包含 templates/cli、examples、docs 的检查项

### AC-005: 初始化后项目完整
**Given**: 用户运行 `init.js` 初始化项目
**When**: 初始化完成
**Then**: 项目包含所有必要文件，可独立使用

---

## Non-functional Requirements

### NFR-001: 文件数量
- 初始化后文件数量从 117 增加到约 130

### NFR-002: 向后兼容
- 不影响已初始化的项目
- install.js --upgrade 可更新现有项目

---

## Assumptions

1. 源仓库中的 CLI 脚本、examples、docs 文件已存在且正确
2. 用户使用 Node.js 14+ 版本

---

## Open Questions

1. **Q1**: 是否需要将完整的 docs 目录复制？
   - **倾向**: 仅复制关键文档（skills-usage-guide, enhanced-mode-guide, adapters/, plugin-usage-guide），减少模板大小

2. **Q2**: full profile 是否需要额外的 docs 文件？
   - **倾向**: full profile 包含相同的 docs 文件，额外包含 M4 相关文档

---

## References

- [templates/pack/content-index.json](../../templates/pack/content-index.json) - 内容分类
- [templates/cli/](../../templates/cli/) - CLI 脚本源
- [examples/01-quick-start/](../../examples/01-quick-start/) - 示例源
- [docs/](../../docs/) - 文档源
- 易用性评估报告（对话上下文）