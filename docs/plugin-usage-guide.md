# Plugin Usage Guide

## Overview

Plugin 是 `amazing_agent_specialist` 专家包的可插拔扩展层，提供技术栈特定能力。本文档指导用户如何发现、安装、使用 Plugin。

---

## Plugin vs Core

| 能力 | 核心层提供 | Plugin 提供 |
|------|-----------|-------------|
| 开发流程指导 | ✅ | ❌ |
| 测试方法论 | ✅ | ❌ |
| 项目配置模板 | ❌ | ✅ |
| 技术栈特定技能 | ❌ | ✅ |
| 质量门禁 | ✅ | ❌ |

**原则**：核心层提供通用能力，Plugin 提供技术栈适配。

---

## Available Plugins

| Plugin | Tech Stack | Status | Description |
|--------|------------|--------|-------------|
| `vite-react-ts` | Vite + React + TypeScript | ✅ Available | Configuration, CSS Module testing |
| `nextjs` | Next.js | 📋 Planned | Future |
| `vue-vite` | Vue + Vite | 📋 Planned | Future |
| `python-fastapi` | Python FastAPI | 📋 Planned | Future |
| `go-mod` | Go Modules | 📋 Planned | Future |
| `rust-cargo` | Rust Cargo | 📋 Planned | Future |

---

## Quick Start

### 1. List Available Plugins

```bash
node plugins/loader.js list
```

Output:
```
Available Plugins:
  - vite-react-ts (available)
  - nextjs (planned)
  - vue-vite (planned)
  - python-fastapi (planned)
  - go-mod (planned)
  - rust-cargo (planned)
```

### 2. Install a Plugin

```bash
node plugins/loader.js install vite-react-ts --project ./my-project
```

Output:
```
Installing plugin: vite-react-ts
  - Checking compatibility... OK (core >=1.0.0)
  - Copying templates... 5 files
  - Registering skills... 2 skills
  - Configuring hooks... 1 hook
✓ Installation complete!

Skills available:
  - vite-setup
  - css-module-test

Templates copied to ./my-project:
  - tsconfig.app.json
  - tsconfig.node.json
  - tsconfig.test.json
  - vite-env.d.ts
  - vite.config.ts
```

### 3. Use Plugin Skills

After installation, plugin skills are available through the skill tool:

```bash
# Invoke vite-setup skill
node .opencode/commands/skill-loader.js vite-setup
```

### 4. Uninstall a Plugin

```bash
node plugins/loader.js uninstall vite-react-ts --project ./my-project
```

---

## Plugin Details

### vite-react-ts

**Purpose**: Provide guidance and templates for Vite + React + TypeScript projects.

**Skills**:

| Skill | Purpose |
|-------|---------|
| `vite-setup` | Configure Vite + Vitest + TypeScript project structure |
| `css-module-test` | Test React components with CSS Modules |

**Templates**:

| File | Purpose |
|------|---------|
| `tsconfig.app.json` | Application code TypeScript config |
| `tsconfig.node.json` | Node/Vite tooling TypeScript config |
| `tsconfig.test.json` | Test environment TypeScript config |
| `vite-env.d.ts` | Vite type declarations |
| `vite.config.ts` | Vite configuration template |

**Hooks**:

| Hook | Purpose |
|------|---------|
| `docstring-exclusions` | Exclude triple-slash directives from docstring policy |

---

## Developing New Plugins

### Plugin Structure

```
plugins/
└── my-plugin/
    ├── plugin.json         # Metadata
    ├── skills/
    │   └── my-skill/
    │       └── SKILL.md    # Skill definition
    ├── templates/
    │   └── config.json     # Template files
    └── hooks/
        └── my-hook.md      # Hook configuration
```

### plugin.json Template

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "your-name",
  "compatibility": {
    "core_version": ">=1.0.0"
  },
  "skills": ["my-skill"],
  "templates": ["config.json"],
  "hooks": ["my-hook"],
  "dependencies": [],
  "tags": ["tag1", "tag2"]
}
```

### Skill Template

```markdown
# Skill: my-skill

## Metadata
- plugin_id: my-plugin
- plugin_version: 1.0.0
- core_compatibility: >=1.0.0

## Purpose
{Describe what this skill does}

## When to Use
{Trigger conditions}

## Implementation Process
{Step-by-step process}

## Output Requirements
{Expected output format}
```

### Register Your Plugin

Add entry to `plugins/registry.json`:

```json
{
  "plugins": [
    {
      "id": "my-plugin",
      "path": "my-plugin/",
      "status": "available",
      "core_compatibility": ">=1.0.0"
    }
  ]
}
```

---

## Troubleshooting

### Plugin not found

```
Error: Plugin 'my-plugin' not found
```

**Solution**: Check `plugins/registry.json` for valid plugin IDs. Run `list` command.

### Version incompatible

```
Error: Plugin 'my-plugin' requires core >=2.0.0, current is 1.0.0
```

**Solution**: Update core package or use compatible plugin version.

### Skill conflict

```
Warning: Skill 'feature-implementation' already exists in core, skipping plugin skill
```

**Solution**: Rename plugin skill to avoid conflict (e.g., `vite-feature-implementation`).

---

## References

- `plugins/PLUGIN-SPEC.md` - Full plugin specification
- `specs/030-plugin-architecture/spec.md` - Feature specification
- `specs/030-plugin-architecture/plan.md` - Implementation plan
- `specs/029-real-world-validation/validation-report.md` - Plugin demand validation