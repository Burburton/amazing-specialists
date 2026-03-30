# Feature: Plugin Architecture

## Feature ID
`030-plugin-architecture`

## Status
`complete`

## Version
`1.0.0`

## Created
2026-03-30

## Overview

### Goal

为 `amazing_agent_specialist` 专家包设计可插拔 Plugin 架构，使技术栈特定能力与核心层分离。用户可按需选择 Plugin 匹配自己的项目类型。

### Background

`029-real-world-validation` 通过 `amazing-specialist-face` 项目验证发现：
- 核心层 skills（architect, developer, tester 等）流程指导有效
- 技术栈特定配置（Vite + TS + Vitest）不适合放入核心
- 不同项目使用不同技术栈，应提供可插拔机制

### Problem

当前架构将所有能力内置：
- 技术栈配置无专门指导，开发者需自行排查
- 新增技术栈需修改核心包，不符合扩展原则
- 用户无法按需选择，必须接受完整包

### Solution

引入 Plugin 层，将技术栈特定能力分离：
- **核心层**: 通用开发流程、角色模型、质量门禁（不变）
- **Plugin 层**: 技术栈适配器（可插拔）

---

## Architecture

### Layer Separation

```
┌─────────────────────────────────────────┐
│  User Project                            │
│  (Vite + React / Next.js / Vue / ...)    │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Plugin Layer (可插拔)                    │
│  - vite-react-ts                         │
│  - nextjs                                │
│  - vue-vite                              │
│  - python-fastapi                        │
│  - go-mod                                │
│  - rust-cargo                            │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Core Layer (通用核心)                    │
│  - 6-role skills (architect/developer/...)│
│  - common skills                         │
│  - contracts                             │
│  - templates                             │
│  - adapters                              │
└─────────────────────────────────────────┘
```

### Core vs Plugin Responsibility

| 类型 | 核心层负责 | Plugin 负责 |
|------|-----------|-------------|
| 开发流程 | ✅ feature-implementation, bugfix-workflow | ❌ |
| 测试方法论 | ✅ unit-test-design, regression-analysis | ❌ |
| 项目配置 | ❌ | ✅ tsconfig, vite.config, eslint 等 |
| 技术栈测试模式 | ❌ | ✅ CSS Module 测试, React 测试等 |
| 模板文件 | ✅ 通用模板 (artifact templates) | ✅ 技术栈模板 (tsconfig 等) |
| 质量门禁 | ✅ quality-gate.md | ❌ |
| 角色协作 | ✅ collaboration-protocol.md | ❌ |

---

## Directory Structure

```
amazing_agent_specialist/
├── .opencode/
│   ├── skills/                   # 核心 skills (不变)
│   │   ├── common/
│   │   ├── architect/
│   │   ├── developer/
│   │   ├── tester/
│   │   ├── reviewer/
│   │   ├── docs/
│   │   └── security/
│   └── commands/                 # 核心 commands (不变)
│
├── plugins/                      # Plugin 目录 (新增)
│   ├── registry.json             # Plugin 注册表
│   ├── loader.js                 # Plugin 加载器
│   ├── PLUGIN-SPEC.md            # Plugin 规格定义
│   │
│   ├── vite-react-ts/            # Plugin 实例
│   │   ├── plugin.json           # Plugin 元数据
│   │   ├── skills/
│   │   │   ├── vite-setup/
│   │   │   │   └── SKILL.md
│   │   │   └── css-module-test/
│   │   │       └── SKILL.md
│   │   ├── templates/
│   │   │   ├── tsconfig.app.json
│   │   │   ├── tsconfig.node.json
│   │   │   ├── tsconfig.test.json
│   │   │   ├── vite-env.d.ts
│   │   │   └── vite.config.ts
│   │   └── hooks/
│   │       └── docstring-exclusions.md
│   │
│   ├── nextjs/                   # (Future)
│   ├── vue-vite/                 # (Future)
│   ├── python-fastapi/           # (Future)
│   ├── go-mod/                   # (Future)
│   └── rust-cargo/               # (Future)
│
├── contracts/                    # 核心 contracts (不变)
├── templates/                    # 核心 templates (不变)
├── adapters/                     # 核心 adapters (不变)
└── docs/
    └── plugin-usage-guide.md     # Plugin 使用指南 (新增)
```

---

## Plugin Specification

### plugin.json Format

```json
{
  "id": "vite-react-ts",
  "name": "Vite + React + TypeScript",
  "version": "1.0.0",
  "description": "技术栈适配器：Vite + React + TypeScript 项目配置与测试",
  "author": "amazing_agent_specialist",
  "compatibility": {
    "core-version": ">=1.0.0"
  },
  "skills": [
    "vite-setup",
    "css-module-test"
  ],
  "templates": [
    "tsconfig.app.json",
    "tsconfig.node.json",
    "tsconfig.test.json",
    "vite-env.d.ts",
    "vite.config.ts"
  ],
  "hooks": [
    "docstring-exclusions"
  ],
  "dependencies": [],
  "tags": ["frontend", "react", "typescript", "vite", "vitest"]
}
```

### registry.json Format

```json
{
  "version": "1.0.0",
  "plugins": [
    {
      "id": "vite-react-ts",
      "path": "plugins/vite-react-ts/",
      "status": "available"
    },
    {
      "id": "nextjs",
      "path": "plugins/nextjs/",
      "status": "planned"
    }
  ],
  "loader-version": "1.0.0"
}
```

---

## Plugin Loading Mechanism

### Discovery

```bash
# 查询可用 Plugin
node plugins/loader.js list

# 输出
Available Plugins:
  - vite-react-ts (installed)
  - nextjs (available, not installed)
  - vue-vite (planned)
```

### Installation

```bash
# 安装 Plugin 到项目
node plugins/loader.js install vite-react-ts --project ../my-project

# 复制 templates, 注册 skills, 配置 hooks
```

### Activation

Plugin skills 通过 OpenCode 的 skill 加载机制自动合并：

```typescript
// OpenCode 加载 skills 时
const coreSkills = loadSkills('.opencode/skills/');
const pluginSkills = loadPluginSkills('plugins/vite-react-ts/skills/');
const allSkills = [...coreSkills, ...pluginSkills];
```

---

## Requirements

### Functional Requirements

#### FR-001: Plugin Registry
- `plugins/registry.json` 维护所有 Plugin 元数据
- 支持 `available`, `installed`, `planned` 状态

#### FR-002: Plugin Loader
- `plugins/loader.js` 提供 list/install/uninstall 命令
- 安装时复制 templates 到目标项目
- 安装时注册 Plugin skills 到 OpenCode

#### FR-003: Plugin Skills
- Plugin 可定义技术栈特定 skills
- Skills 格式与核心 skills 一致（SKILL.md）
- 通过 OpenCode skill 机制加载

#### FR-004: Plugin Templates
- Plugin 可提供技术栈模板文件
- 安装时复制到目标项目

#### FR-005: Plugin Hooks
- Plugin 可定义技术栈特定 hooks
- 如排除 triple-slash directives 检查

#### FR-006: Plugin Documentation
- `PLUGIN-SPEC.md` 定义 Plugin 规格
- `docs/plugin-usage-guide.md` 使用指南

---

## Acceptance Criteria

### AC-001: Plugin 目录结构建立
- [ ] `plugins/` 目录创建
- [ ] `plugins/registry.json` 创建
- [ ] `plugins/loader.js` 创建
- [ ] `plugins/PLUGIN-SPEC.md` 创建

### AC-002: Plugin 加载机制实现
- [ ] `loader.js` list 命令
- [ ] `loader.js` install 命令
- [ ] `loader.js` uninstall 命令

### AC-003: vite-react-ts Plugin 实现
- [ ] `plugins/vite-react-ts/` 目录
- [ ] `plugin.json` 元数据
- [ ] `skills/vite-setup/SKILL.md`
- [ ] `skills/css-module-test/SKILL.md`
- [ ] `templates/` 模板文件
- [ ] `hooks/docstring-exclusions.md`

### AC-004: 文档完成
- [ ] `docs/plugin-usage-guide.md`

### AC-005: 验证通过
- [ ] Plugin list/install/uninstall 测试
- [ ] vite-react-ts Plugin 实际使用验证

---

## Technical Constraints

### TC-001: Plugin Skills 格式
- Plugin skills 必须遵循核心 skill 格式（SKILL.md）
- 使用 `skill` tool 加载，与核心 skills 无差异

### TC-002: Plugin 隔离
- Plugin skills 不得覆盖核心 skills
- Plugin hooks 仅补充核心 hooks，不替换

### TC-003: 版本兼容
- Plugin `plugin.json` 声明 `compatibility.core-version`
- 加载器检查版本兼容性

---

## Risks

### Risk-001: Plugin Skills 与核心 Skills 冲突
- **描述**: Plugin skill 名称可能与核心 skill 冲突
- **缓解**: Plugin skill 使用前缀（如 `vite-setup`），核心 skill 保持无前缀

### Risk-002: Plugin 版本漂移
- **描述**: Plugin 可能与核心版本不兼容
- **缓解**: `compatibility.core-version` 声明 + 加载器检查

---

## Milestones

### M1: 架构设计
- Plugin 目录结构
- Plugin 规格定义
- Registry 格式
- Loader API 设计

### M2: Loader 实现
- list/install/uninstall 命令
- Template 复制
- Skill 注册

### M3: vite-react-ts Plugin
- Plugin 实例实现
- Skills 编写
- Templates 创建
- Hooks 配置

### M4: 验证
- Loader 测试
- 实际项目验证

---

## References

- `specs/029-real-world-validation/validation-report.md` - 验证发现 Plugin 需求
- `.opencode/skills/` - 核心 skills 目录结构
- `templates/` - 核心 templates 目录结构
- `docs/skills-usage-guide.md` - Skills 使用指南