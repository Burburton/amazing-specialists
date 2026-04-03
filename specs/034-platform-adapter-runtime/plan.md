# Plan: Platform Adapter Runtime

## Feature Reference
`specs/034-platform-adapter-runtime/spec.md`

## Version
`1.0.0`

## Created
2026-04-03

---

## Overview

实现 Platform Adapter 运行时代码，让开发者可以实际调用 `getPlatformAdapter()` 获取 adapter 实例。

---

## Implementation Phases

### Phase 1: 核心运行时 (T-001 ~ T-003)

**目标**：实现基础的 adapter 加载和实例化。

| Task | 内容 | 预计时间 |
|------|------|----------|
| T-001 | 创建 `errors.ts` - 自定义错误类型 | 10 min |
| T-002 | 创建 `loader.ts` - 配置加载逻辑 | 20 min |
| T-003 | 创建 `runtime.ts` - 主入口函数 | 30 min |

**交付物**：
- `adapters/platform/errors.ts`
- `adapters/platform/loader.ts`
- `adapters/platform/runtime.ts`

### Phase 2: OpenCode Adapter 工厂 (T-004)

**目标**：为 OpenCode 创建 adapter 实例工厂。

| Task | 内容 | 预计时间 |
|------|------|----------|
| T-004 | 创建 `opencode/index.ts` - OpenCode adapter 工厂 | 20 min |

**交付物**：
- `adapters/platform/opencode/index.ts`

### Phase 3: 配置合并 (T-005 ~ T-006)

**目标**：支持项目级配置覆盖。

| Task | 内容 | 预计时间 |
|------|------|----------|
| T-005 | 创建 `merger.ts` - 配置合并逻辑 | 20 min |
| T-006 | 更新 `runtime.ts` - 集成合并逻辑 | 15 min |

**交付物**：
- `adapters/platform/merger.ts`

### Phase 4: 文档更新 (T-007)

**目标**：更新文档，添加代码示例。

| Task | 内容 | 预计时间 |
|------|------|----------|
| T-007 | 更新 `docs/platform-adapter-guide.md` | 15 min |

### Phase 5: 治理同步 (T-008 ~ T-010)

**目标**：更新 README、CHANGELOG、registry。

| Task | 内容 | 预计时间 |
|------|------|----------|
| T-008 | 更新 `README.md` - Feature 034 | 10 min |
| T-009 | 更新 `CHANGELOG.md` | 10 min |
| T-010 | 更新 `adapters/registry.json` | 5 min |

---

## Technical Design

### 模块结构

```
adapters/platform/
├── runtime.ts          # getPlatformAdapter() - 主入口
├── loader.ts           # loadConfig() - 加载 JSON 配置
├── merger.ts           # mergeConfig() - 合并配置优先级
├── errors.ts           # PlatformNotSupportedError
└── opencode/
    └── index.ts        # createOpenCodeAdapter() - 工厂函数
```

### 数据流

```
用户调用 getPlatformAdapter('opencode')
    │
    ▼
检查缓存 ──命中──► 返回缓存的 adapter
    │
    未命中
    ▼
loader.loadConfig('opencode')
    │
    ├── 读取 role-mapping.json
    └── 读取 capabilities.json
    │
    ▼
merger.mergeWithOverride(roleMapping)
    │
    └── 读取 .opencode/platform-override.json（如存在）
    │
    ▼
createOpenCodeAdapter(mergedConfig)
    │
    ▼
缓存 adapter 实例
    │
    ▼
返回 adapter
```

### 关键接口实现

```typescript
// runtime.ts
export function getPlatformAdapter(platformId: string): PlatformAdapter {
  const cached = adapterCache.get(platformId);
  if (cached) return cached;
  
  const config = loader.loadConfig(platformId);
  const merged = merger.mergeWithOverride(config);
  const adapter = createAdapter(platformId, merged);
  
  adapterCache.set(platformId, adapter);
  return adapter;
}
```

---

## Risks and Mitigations

| 风险 | 缓解措施 |
|------|----------|
| Node.js 模块解析路径问题 | 使用 `path.join(__dirname, ...)` 确保正确路径 |
| JSON 缓存问题 | 提供清除缓存的方法（可选） |
| 类型导入循环 | errors.ts 独立，不依赖其他模块 |

---

## Acceptance Criteria

- [ ] `getPlatformAdapter('opencode')` 返回有效的 adapter
- [ ] `adapter.mapRoleToCategory('tester')` 返回 `'unspecified-high'`
- [ ] `adapter.getDefaultSkills('tester')` 返回正确的 skill 数组
- [ ] 项目级覆盖配置生效
- [ ] 不存在的平台抛出 `PlatformNotSupportedError`
- [ ] 文档包含可运行的代码示例