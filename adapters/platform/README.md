# Platform Adapter

## What is Platform Adapter?

Platform Adapter 是专家包与 AI 平台运行时之间的适配层，用于隔离不同平台的差异，提供统一的角色模型抽象。

## Purpose

解决的核心问题：
- **角色模型不匹配**：专家包定义 6-role 模型，但各平台使用不同的 agent 命名体系
- **任务派发困难**：`task(subagent_type="tester")` 在某些平台不可用
- **缺乏统一抽象**：每个平台需要不同的调用方式

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Expert Pack Core                              │
│  (6-role model, skills, quality gates)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Platform Adapter Layer                        │
│  - mapRoleToCategory(role) → category                           │
│  - getDefaultSkills(role) → skill[]                             │
│  - getCapabilities() → capabilities                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Platform Runtime                              │
│  (OpenCode, Claude Code, Gemini CLI, etc.)                      │
└─────────────────────────────────────────────────────────────────┘
```

## Available Platform Adapters

| Platform | Status | Location |
|----------|--------|----------|
| OpenCode | ✅ Available | `adapters/platform/opencode/` |
| Claude Code | 🔜 Planned | - |
| Gemini CLI | 🔜 Planned | - |

## Quick Start

### Using OpenCode Platform Adapter

```typescript
import { createPlatformAdapter } from './adapters/interfaces/platform-adapter.interface';
import opencodeConfig from './adapters/platform/opencode/role-mapping.json';

const adapter = createPlatformAdapter(opencodeConfig);

// Map role to category
const category = adapter.mapRoleToCategory('tester');
// Returns: 'unspecified-high'

// Get default skills
const skills = adapter.getDefaultSkills('tester');
// Returns: ['tester/unit-test-design', 'tester/regression-analysis', 'tester/edge-case-matrix']
```

### Using with task()

```typescript
// Before (doesn't work on OpenCode)
task(subagent_type="tester", prompt="...")  // ❌ Unknown agent

// After (using Platform Adapter)
const category = adapter.mapRoleToCategory('tester');
const skills = adapter.getDefaultSkills('tester');

task(
  category=category,           // ✅ 'unspecified-high'
  load_skills=skills,          // ✅ ['tester/unit-test-design', ...]
  prompt="..."
)
```

## Configuration Priority

配置加载优先级（从高到低）：

1. **项目级覆盖** - `.opencode/platform-override.json`
2. **Plugin 配置** - `plugin.json` → `platform_mapping`
3. **Platform Adapter 默认** - `adapters/platform/{platform-id}/`
4. **核心层默认行为** - 兜底处理

## Creating a New Platform Adapter

1. 复制模板：
```bash
cp adapters/platform/templates/platform-adapter.template.json adapters/platform/{platform-id}/role-mapping.json
```

2. 编辑配置文件，填写正确的映射关系

3. 创建 `README.md` 说明平台特性

## References

- `adapters/interfaces/platform-adapter.interface.ts` - 接口定义
- `docs/platform-adapter-guide.md` - 详细使用指南
- `ADAPTERS.md` - Adapter 架构文档