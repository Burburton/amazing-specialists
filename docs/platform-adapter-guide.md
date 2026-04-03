# Platform Adapter Guide

## Overview

Platform Adapter 是专家包与 AI 平台运行时之间的适配层，用于隔离不同平台的差异，提供统一的角色模型抽象。

## Why Platform Adapter?

### 问题背景

专家包定义了 **6-role 正式执行层模型**：
- `architect` - 架构师
- `developer` - 开发者
- `tester` - 测试员
- `reviewer` - 审查员
- `docs` - 文档员
- `security` - 安全员

但不同 AI 平台使用不同的 agent 命名体系：

| 平台 | Agent 体系 |
|------|-----------|
| OpenCode | Atlas, Hephaestus, Metis, Momus, Prometheus, Sisyphus... |
| Claude Code | subagent_type + category |
| Gemini CLI | 不同的 agent 体系 |

### 解决方案

Platform Adapter 提供：
1. **统一的接口** - `mapRoleToCategory(role)` 将角色映射到平台 category
2. **默认 skills** - `getDefaultSkills(role)` 返回角色的默认技能
3. **平台能力声明** - 声明平台支持的特性

---

## Using OpenCode Platform Adapter

### Quick Start

```typescript
import { getPlatformAdapter } from './adapters/platform/runtime';

const adapter = getPlatformAdapter('opencode');
console.log(adapter.platform_id);  // 'opencode'
```

### Map Role to Category

```typescript
import { getPlatformAdapter } from './adapters/platform/runtime';

const adapter = getPlatformAdapter('opencode');
const category = adapter.mapRoleToCategory('tester');  // 'unspecified-high'

task(category=category, load_skills=['tester/unit-test-design'], prompt="...")
```

### Get Default Skills

```typescript
import { getPlatformAdapter } from './adapters/platform/runtime';

const adapter = getPlatformAdapter('opencode');
const skills = adapter.getDefaultSkills('tester');

task(category='unspecified-high', load_skills=skills, prompt="...")
```

### Error Handling

```typescript
import { getPlatformAdapter, getSupportedPlatforms, PlatformNotSupportedError } from './adapters/platform/runtime';

try {
  const adapter = getPlatformAdapter('opencode');
} catch (e) {
  if (e instanceof PlatformNotSupportedError) {
    console.log('Available:', getSupportedPlatforms());
  }
}
```

---

## Role-to-Category Mapping (OpenCode)

| Role | Category | Reason |
|------|----------|--------|
| architect | `deep` | Architecture requires deep research |
| developer | `unspecified-high` | General high-priority implementation |
| tester | `unspecified-high` | General high-priority verification |
| reviewer | `unspecified-high` | General high-priority review |
| docs | `writing` | Documentation is a writing task |
| security | `unspecified-high` | Security is high priority |

---

## Known Issues

### Issue 1: subagent_type Not Supported

**Problem**:
```typescript
task(subagent_type="tester", prompt="...")  // ❌ Error: Unknown agent: tester
```

**Solution**:
```typescript
task(
  category="unspecified-high",  // ✅ Use category instead
  load_skills=["tester/unit-test-design"],
  prompt="..."
)
```

### Issue 2: Background Task May Fail

**Problem**: Background tasks sometimes fail immediately without clear error.

**Solution**:
1. Check task status: `background_output(task_id="...")`
2. Retry if needed, or use synchronous execution

---

## Plugin Extension

Plugin 可以通过 `platform_mapping` 字段扩展平台映射：

```json
{
  "platform_mapping": {
    "opencode": {
      "tester": {
        "additional_skills": ["run-tests"]
      }
    }
  }
}
```

详见 `plugins/PLUGIN-SPEC.md`。

---

## Project-Level Override

项目可通过 `.opencode/platform-override.json` 覆盖默认映射：

```json
{
  "platform_id": "opencode",
  "overrides": {
    "tester": {
      "category": "deep",
      "load_skills": ["tester/integration-test-design"]
    }
  }
}
```

---

## Creating a New Platform Adapter

1. Copy the template:
```bash
cp adapters/platform/templates/platform-adapter.template.json adapters/platform/{platform-id}/role-mapping.json
```

2. Edit the configuration:
   - Set `platform_id`
   - Define `role_mapping` for all 6 roles
   - Declare `capabilities`
   - Document `known_issues`

3. Create `README.md` explaining platform specifics

---

## Configuration Priority

```
Project Override (.opencode/platform-override.json)
       ↓ overrides
Plugin Configuration (plugin.json → platform_mapping)
       ↓ merges with
Platform Adapter Default (adapters/platform/{platform-id}/)
       ↓ falls back to
Core Default Behavior
```

---

## References

- `adapters/interfaces/platform-adapter.interface.ts` - Interface definition
- `adapters/platform/opencode/` - OpenCode implementation
- `plugins/PLUGIN-SPEC.md` - Plugin extension spec
- `ADAPTERS.md` - Adapter architecture
- `AGENTS.md` - Platform adaptation guide