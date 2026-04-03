# Spec: Platform Adapter Runtime

## Feature ID
`034-platform-adapter-runtime`

## Version
`1.0.0`

## Status
`complete`

## Created
2026-04-03

## Parent Feature
`033-platform-adapter` - 本 feature 实现 033 的运行时部分

---

## Problem Statement

Feature 033 定义了 Platform Adapter 的接口和配置，但缺少运行时代码：

| 已完成 | 缺失 |
|--------|------|
| `platform-adapter.interface.ts` 接口定义 | `getPlatformAdapter()` 函数 |
| `role-mapping.json` 配置文件 | 读取配置并返回 adapter 的代码 |
| `capabilities.json` 配置文件 | `mapRoleToCategory()` 实现 |
| 文档（AGENTS.md, ADAPTERS.md） | Plugin loader 集成 |

**结果**：开发者无法实际使用 Platform Adapter，只能看到规范。

---

## Goal

实现 Platform Adapter 运行时，让开发者可以：

```typescript
// 期望用法
import { getPlatformAdapter } from './adapters/platform/runtime';

const adapter = getPlatformAdapter('opencode');
const category = adapter.mapRoleToCategory('tester');  // 'unspecified-high'
const skills = adapter.getDefaultSkills('tester');     // ['tester/unit-test-design', ...]
```

---

## Scope

### In Scope

| 内容 | 说明 |
|------|------|
| `getPlatformAdapter(platformId)` | 获取指定平台的 adapter 实例 |
| `mapRoleToCategory(role)` | 将 6-role 映射到平台 category |
| `getDefaultSkills(role)` | 获取角色的默认 skills |
| `getCapabilities()` | 获取平台能力声明 |
| 配置合并 | 项目级覆盖 + Plugin 扩展 + 默认配置 |

### Out of Scope

| 内容 | 原因 |
|------|------|
| Plugin loader 修改 | 可在后续 feature 中实现 |
| 新平台 adapter | 只实现 OpenCode，其他平台后续添加 |
| CLI 命令 | 非必需，可在后续添加 |

---

## Functional Requirements

### FR-001: getPlatformAdapter 函数

**需求**：提供获取 Platform Adapter 实例的函数。

**输入**：
- `platformId: string` - 平台标识符（如 'opencode'）

**输出**：
- `PlatformAdapter` - 实现了接口的对象
- 若平台不存在，抛出 `PlatformNotSupportedError`

**验收标准**：
```typescript
const adapter = getPlatformAdapter('opencode');
assert(adapter.platform_id === 'opencode');
assert(typeof adapter.mapRoleToCategory === 'function');
```

### FR-002: mapRoleToCategory 实现

**需求**：将 6-role 映射到平台支持的 category。

**输入**：
- `role: Role` - 6-role 之一

**输出**：
- `category: Category` - 平台支持的 category 字符串

**验收标准**：
```typescript
const adapter = getPlatformAdapter('opencode');
assert(adapter.mapRoleToCategory('tester') === 'unspecified-high');
assert(adapter.mapRoleToCategory('docs') === 'writing');
assert(adapter.mapRoleToCategory('architect') === 'deep');
```

### FR-003: getDefaultSkills 实现

**需求**：获取指定角色的默认 skills 列表。

**输入**：
- `role: Role` - 6-role 之一

**输出**：
- `skills: SkillId[]` - skill ID 数组

**验收标准**：
```typescript
const adapter = getPlatformAdapter('opencode');
const skills = adapter.getDefaultSkills('tester');
assert(skills.includes('tester/unit-test-design'));
assert(skills.includes('tester/regression-analysis'));
```

### FR-004: getCapabilities 实现

**需求**：获取平台能力声明。

**输出**：
- `capabilities: PlatformCapabilities` - 能力对象

**验收标准**：
```typescript
const adapter = getPlatformAdapter('opencode');
const caps = adapter.getCapabilities();
assert(caps.supports_subagent_type === false);
assert(Array.isArray(caps.known_issues));
```

### FR-005: 配置优先级

**需求**：按优先级合并配置。

**优先级**（从高到低）：
1. 项目级覆盖 - `.opencode/platform-override.json`
2. Plugin 扩展 - 从 Plugin loader 获取
3. Platform Adapter 默认 - `adapters/platform/{platform-id}/role-mapping.json`

**验收标准**：
```typescript
// 项目级覆盖 tester 的 category
// .opencode/platform-override.json: { "tester": { "override_category": "deep" } }
const adapter = getPlatformAdapter('opencode');
assert(adapter.mapRoleToCategory('tester') === 'deep');  // 覆盖了默认值
```

---

## Non-Functional Requirements

### NFR-001: 性能

- 配置加载应在首次调用时完成（懒加载）
- 后续调用应使用缓存
- 加载时间 < 50ms

### NFR-002: 错误处理

- 平台不存在时抛出明确的错误信息
- 配置文件格式错误时提供有用的错误提示
- 所有错误消息应包含解决建议

### NFR-003: 类型安全

- 所有公共 API 应有完整的 TypeScript 类型定义
- 导出类型供外部使用

---

## Implementation Notes

### 建议的文件结构

```
adapters/platform/
├── runtime.ts                    # 主入口，导出 getPlatformAdapter
├── loader.ts                     # 配置加载逻辑
├── merger.ts                     # 配置合并逻辑
├── errors.ts                     # 自定义错误类型
└── opencode/
    ├── index.ts                  # OpenCode adapter 工厂函数
    ├── role-mapping.json         # 配置（已存在）
    └── capabilities.json         # 配置（已存在）
```

### 实现建议

1. 使用工厂模式创建 adapter 实例
2. 配置加载使用同步方式（配置文件小，无需异步）
3. 使用 Map 缓存已加载的 adapter 实例

---

## Dependencies

| 依赖 | 说明 |
|------|------|
| `033-platform-adapter` | 接口定义和配置文件 |
| `adapters/registry.json` | 注册表 |

---

## Risks

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 配置文件格式变化 | 运行时错误 | 添加 schema 验证 |
| 项目级配置路径不确定 | 找不到配置 | 支持多种路径回退 |

---

## Success Metrics

| 指标 | 目标 |
|------|------|
| 代码行数 | < 200 行（核心逻辑） |
| 测试覆盖 | 所有公开 API 有单元测试 |
| 文档 | 更新 platform-adapter-guide.md 添加代码示例 |

---

## References

- `specs/033-platform-adapter/spec.md` - Platform Adapter 规范
- `adapters/interfaces/platform-adapter.interface.ts` - 接口定义
- `docs/platform-adapter-guide.md` - 使用指南