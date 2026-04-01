# Plugin Specification

## Version
`1.0.0`

## Purpose

本文档定义 `amazing_agent_specialist` 专家包的 Plugin 规格标准，供 Plugin 开发者遵循。

---

## Plugin 定义

Plugin 是技术栈特定能力的可插拔扩展，与核心层分离，用户可按需选择安装。

### 核心层 vs Plugin 层

| 类型 | 核心层 | Plugin 层 |
|------|--------|-----------|
| 开发流程 | ✅ feature-implementation, bugfix-workflow | ❌ 不提供 |
| 测试方法论 | ✅ unit-test-design, regression-analysis | ❌ 不提供 |
| 项目配置 | ❌ 不提供 | ✅ tsconfig, vite.config, eslint 等 |
| 技术栈测试模式 | ❌ 不提供 | ✅ CSS Module 测试, React 测试等 |
| 模板文件 | ✅ 通用 artifact templates | ✅ 技术栈配置模板 |
| 质量门禁 | ✅ quality-gate.md | ❌ 不覆盖 |
| 角色协作 | ✅ collaboration-protocol.md | ❌ 不覆盖 |

---

## Plugin 目录结构

```
plugins/
├── registry.json           # Plugin 注册表（必需）
├── loader.js               # Plugin 加载器（必需）
├── PLUGIN-SPEC.md          # Plugin 规格定义（本文档）
│
├── {plugin-id}/            # Plugin 实例目录
│   ├── plugin.json         # Plugin 元数据（必需）
│   ├── skills/             # Plugin skills
│   │   ├── {skill-name}/
│   │   │   └── SKILL.md    # Skill 定义
│   │   │   └── examples/   # 示例（可选）
│   │   │   └── templates/  # Skill 模板（可选）
│   │   └── {skill-name-2}/
│   │       └── SKILL.md
│   │
│   ├── templates/          # 项目模板文件
│   │   ├── {template-1}
│   │   ├── {template-2}
│   │   └── ...
│   │
│   └── hooks/              # Plugin hooks
│       ├── {hook-name}.md  # Hook 配置
│       └── ...
│
├── {plugin-id-2}/          # 其他 Plugin
│   └── ...
│
└── lib/                    # Loader 共享库（可选）
    ├── plugin-utils.js
    ├── version-check.js
    └── ...
```

---

## registry.json 格式

### 必需字段

```json
{
  "version": "1.0.0",
  "plugins": [
    {
      "id": "vite-react-ts",
      "path": "vite-react-ts/",
      "status": "available",
      "core_compatibility": ">=1.0.0"
    }
  ],
  "loader_version": "1.0.0"
}
```

### 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `version` | string | 是 | Registry schema 版本 (semver) |
| `plugins` | array | 是 | Plugin 列表 |
| `plugins[].id` | string | 是 | Plugin 唯一标识符 |
| `plugins[].path` | string | 是 | Plugin 目录路径（相对于 plugins/） |
| `plugins[].status` | string | 是 | 状态：`available`, `installed`, `planned`, `deprecated` |
| `plugins[].core_compatibility` | string | 推荐 | 核心版本兼容范围 (semver) |
| `plugins[].installed_in` | array | 可选 | 安装项目路径列表（已安装时） |
| `plugins[].installed_at` | string | 可选 | 安装时间戳（已安装时） |
| `loader_version` | string | 是 | 加载器版本 |

---

## plugin.json 格式

### 必需字段

```json
{
  "id": "vite-react-ts",
  "name": "Vite + React + TypeScript",
  "version": "1.0.0",
  "description": "Tech stack adapter for Vite + React + TypeScript projects",
  "author": "amazing_agent_specialist",
  "compatibility": {
    "core_version": ">=1.0.0"
  },
  "skills": ["vite-setup", "css-module-test"],
  "templates": [
    "tsconfig.app.json",
    "tsconfig.node.json",
    "tsconfig.test.json",
    "vite-env.d.ts",
    "vite.config.ts"
  ],
  "hooks": ["docstring-exclusions"],
  "dependencies": [],
  "tags": ["frontend", "react", "typescript", "vite", "vitest"]
}
```

### 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Plugin 唯一标识符（与目录名一致） |
| `name` | string | 是 | Plugin 显示名称 |
| `version` | string | 是 | Plugin 版本 (semver) |
| `description` | string | 是 | Plugin 功能描述 |
| `author` | string | 推荐 | Plugin 作者 |
| `compatibility.core_version` | string | 是 | 核心版本兼容范围 |
| `compatibility.node_version` | string | 可选 | Node.js 版本要求 |
| `skills` | array | 推荐 | Plugin 提供的 skill 名称列表 |
| `commands` | object | 推荐 | Plugin 提供的执行命令配置 |
| `templates` | array | 推荐 | Plugin 提供的模板文件列表 |
| `hooks` | array | 推荐 | Plugin 提供的 hook 名称列表 |
| `dependencies` | array | 可选 | Plugin 依赖（其他 plugin） |
| `tags` | array | 推荐 | 搜索/分类标签 |

---

## commands 字段格式

Plugin 可定义技术栈特定的执行命令，供 Plugin skills 使用。

### 格式

```json
{
  "commands": {
    "build": {
      "cmd": "npm run build",
      "env": {},
      "description": "Build for production"
    },
    "test": {
      "cmd": "npm test",
      "env": { "CI": "true" },
      "description": "Run unit tests"
    },
    "lint": {
      "cmd": "npm run lint",
      "env": {},
      "description": "Run linter"
    }
  }
}
```

### commands 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `commands` | object | 推荐 | 执行命令配置对象 |
| `commands.{name}` | object | - | 单个命令配置（name: build/test/lint等） |
| `commands.{name}.cmd` | string | 是 | 执行命令字符串 |
| `commands.{name}.env` | object | 可选 | 环境变量配置 |
| `commands.{name}.description` | string | 推荐 | 命令用途描述 |

### 常见命令类型

| 命令名 | 用途 | 示例 |
|--------|------|------|
| `build` | 生产构建 | `npm run build`, `cargo build --release` |
| `test` | 运行测试 | `npm test`, `pytest`, `cargo test` |
| `lint` | 代码检查 | `npm run lint`, `ruff check`, `golangci-lint run` |
| `dev` | 开发服务器 | `npm run dev`, `cargo watch` |
| `clean` | 清理构建产物 | `npm run clean`, `cargo clean` |

### Loader 加载 commands

Plugin loader 提供 `getCommands()` 方法读取 commands 配置：

```javascript
const loader = require('./plugins/loader');
const commands = loader.getCommands('vite-react-ts');
// Returns: { build: {...}, test: {...}, lint: {...} }
```

### 后向兼容

若 Plugin 未定义 `commands` 字段，loader 返回空对象 `{}`。

---

## Skill 格式

### 目录结构

```
plugins/{plugin-id}/skills/{skill-name}/
├── SKILL.md              # Skill 定义（必需）
├── examples/             # 示例目录（可选）
│   └── example-1.md
│   └── example-2.md
└── templates/            # Skill 专用模板（可选）
    └── template.json
```

### SKILL.md 格式

Plugin skills 必须遵循核心 skills 的 SKILL.md 格式，并添加 plugin 元数据：

```markdown
# Skill: {skill-name}

## Metadata
- plugin_id: {plugin-id}
- plugin_version: {version}
- core_compatibility: {range}

## Purpose
{skill 用途描述}

## When to Use
{触发条件}

## When Not to Use
{不适用场景}

## Implementation Process
{实现流程}

## Output Requirements
{输出格式}

## Examples
{示例}

## Checklists
{检查清单}
```

### Skill 命名规范

Plugin skill 名称应遵循以下规范，避免与核心 skills 冲突：

| 规范 | 格式 | 示例 |
|------|------|------|
| 技术栈前缀 | `{tech}-{action}` | `vite-setup`, `css-module-test` |
| 完全限定 | `{plugin-id}-{skill}` | `vite-react-ts-vite-setup` |

**禁止命名**：
- 使用核心 skill 名称（如 `feature-implementation`）
- 使用通用名称（如 `setup`, `test`）

---

## Template 格式

### 目录结构

```
plugins/{plugin-id}/templates/
├── tsconfig.app.json     # TypeScript 应用配置
├── tsconfig.node.json    # TypeScript Node 配置
├── vite.config.ts        # Vite 配置模板
├── vite-env.d.ts         # Vite 类型声明
└── ...
```

### Template 元数据（可选）

模板文件可包含头部注释说明来源：

```typescript
// @plugin: vite-react-ts
// @template-type: config
// @version: 1.0.0
// @description: TypeScript configuration for application code
```

### Template 分类

| 类型 | 用途 | 示例 |
|------|------|------|
| `config` | 项目配置文件 | tsconfig.json, vite.config.ts |
| `declaration` | 类型声明文件 | vite-env.d.ts, global.d.ts |
| `boilerplate` | 代码模板 | component.tsx, hook.ts |
| `test` | 测试配置 | vitest.config.ts, jest.config.js |

---

## Hook 格式

### 目录结构

```
plugins/{plugin-id}/hooks/
├── {hook-name}.md        # Hook 配置（必需）
```

### Hook 文件格式

```markdown
# Hook: {hook-name}

## Plugin
id: {plugin-id}

## Hook Type
{hook-type}

## Trigger
{trigger-condition}

## Action
{action-description}

## Configuration
{configuration-yaml}
```

### Hook 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `policy-exclusion` | 排除特定检查规则 | triple-slash directive 排除 |
| `policy-addition` | 添加特定检查规则 | 特定技术栈 lint 规则 |
| `skill-override` | 覆盖核心 skill（慎用） | - |

### 示例：docstring-exclusions.md

```markdown
# Hook: docstring-exclusions

## Plugin
id: vite-react-ts

## Hook Type
policy-exclusion

## Trigger
Docstring policy hook encounters triple-slash directive

## Action
Exclude triple-slash directives (`/// <reference types="...">`) from docstring policy validation

## Configuration
exclusions:
  - pattern: "^///\\s*<reference"
    reason: "TypeScript triple-slash directive (required syntax, not optional comment)"
```

---

## Plugin 加载机制

### Discovery (list)

```bash
node plugins/loader.js list
```

输出：
```
Available Plugins:
  - vite-react-ts (available)
  - nextjs (planned)
  - vue-vite (planned)
```

### Installation (install)

```bash
node plugins/loader.js install {plugin-id} --project {path}
```

流程：
1. 读取 registry.json，验证 plugin 存在
2. 检查 core_version 兼容性
3. 复制 templates 到目标项目
4. 注册 skills 到项目 skill 目录
5. 配置 hooks 到项目 hooks 目录
6. 更新 registry.json status
7. 生成项目 plugin-manifest.json

### Uninstallation (uninstall)

```bash
node plugins/loader.js uninstall {plugin-id} --project {path}
```

流程：
1. 读取项目 plugin-manifest.json
2. 删除已复制的 templates
3. 移除已注册的 skills
4. 移除已配置的 hooks
5. 更新 registry.json status
6. 更新项目 plugin-manifest.json

---

## Skill 激活机制

Plugin skills 通过符号链接激活，用户可以选择启用哪些 skills：

### 激活流程

1. 用户在 `.opencode/skill-registry.json` 配置启用状态
2. 运行 `sync-skills` 命令创建符号链接
3. OpenCode 扫描 `.opencode/skills/` 发现所有 skills

### skill-registry.json 格式

```json
{
  "version": "1.0.0",
  "skills": [
    {
      "name": "vite-setup",
      "source": "plugins/vite-react-ts/skills/vite-setup/SKILL.md",
      "enabled": true,
      "plugin_id": "vite-react-ts"
    }
  ]
}
```

### 命令

```bash
# 安装 plugin 时自动创建 registry
node plugins/loader.js install vite-react-ts --project ./my-project

# 同步 skills 到 .opencode/skills/
node plugins/loader.js sync-skills --project ./my-project

# 启用/禁用特定 skill
node plugins/loader.js enable-skill vite-setup --project ./my-project
node plugins/loader.js disable-skill css-module-test --project ./my-project
```

### 跨平台支持

- Windows: 使用 junction (不需要管理员权限)
- Unix: 使用 symlink

详见 `specs/031-plugin-skill-activation/` 获取完整设计。

---

## 版本兼容性

### 兼容性声明

Plugin 必须在 `plugin.json` 中声明 `compatibility.core_version`：

```json
{
  "compatibility": {
    "core_version": ">=1.0.0 <2.0.0"
  }
}
```

### 兼容性检查

Loader 在安装时检查兼容性：

```javascript
function checkCompatibility(plugin, coreVersion) {
  const range = plugin.compatibility.core_version;
  return semver.satisfies(coreVersion, range);
}
```

不兼容时拒绝安装，提示用户升级核心包或使用兼容 Plugin 版本。

---

## 验证清单

### Plugin 开发者验证

- [ ] plugin.json 所有必需字段存在
- [ ] Plugin ID 与目录名一致
- [ ] skills 目录下每个 skill 有 SKILL.md
- [ ] SKILL.md 包含 plugin_id 元数据
- [ ] skill 名称不与核心 skills 冲突
- [ ] templates 文件有效（语法正确）
- [ ] hooks 文件格式正确
- [ ] core_version 是有效 semver range

### Loader 验证

- [ ] registry.json 格式正确
- [ ] 所有 plugin 路径存在
- [ ] list 输出格式正确
- [ ] install 流程完整
- [ ] uninstall 清理完整
- [ ] 版本兼容性检查正确

---

## 最佳实践

### Plugin 开发

1. **最小范围**：Plugin 应聚焦单一技术栈，不跨栈
2. **明确文档**：每个 skill 有清晰的 Purpose 和 When to Use
3. **模板分离**：不同用途的配置分离（如 tsconfig.app vs tsconfig.node）
4. **版本标记**：模板文件包含版本注释，便于升级
5. **Hook 谨慎**：只在必要时使用 hook，避免过度干预

### Plugin 使用

1. **按需安装**：只安装项目实际使用的技术栈 Plugin
2. **定期更新**：Plugin 版本与核心版本保持兼容
3. **验证安装**：安装后运行 doctor 检查
4. **保留定制**：Plugin 模板复制后可定制，不影响原始 Plugin

---

## 参考文档

- `specs/029-real-world-validation/validation-report.md` - Plugin 需求来源
- `.opencode/skills/*/SKILL.md` - 核心 skill 格式参考
- `templates/cli/init.js` - Loader 实现参考
- `role-definition.md` - 6-role 角色边界（Plugin 不覆盖）