# Tasks: Platform Adapter Runtime

## Feature Reference
`specs/034-platform-adapter-runtime/spec.md` | `specs/034-platform-adapter-runtime/plan.md`

## Version
`1.0.0`

## Created
2026-04-03

---

## Task Summary

| Task ID | Task Name | Phase | Status | Dependencies |
|---------|-----------|-------|--------|--------------|
| T-001 | Create errors.ts | Phase 1 | ✅ complete | - |
| T-002 | Create loader.ts | Phase 1 | ✅ complete | - |
| T-003 | Create runtime.ts | Phase 1 | ✅ complete | T-001, T-002 |
| T-004 | Create opencode/index.ts | Phase 2 | ✅ complete | T-003 |
| T-005 | Create merger.ts | Phase 3 | ✅ complete | T-002 |
| T-006 | Integrate merger in runtime | Phase 3 | ✅ complete | T-003, T-005 |
| T-007 | Update documentation | Phase 4 | ✅ complete | T-003, T-004 |
| T-008 | Update README.md | Phase 5 | ✅ complete | T-001~T-007 |
| T-009 | Update CHANGELOG.md | Phase 5 | ✅ complete | T-001~T-007 |
| T-010 | Update registry.json | Phase 5 | ✅ complete | T-001~T-007 |

---

## Detailed Tasks

### T-001: Create errors.ts

**Phase**: Phase 1  
**Priority**: high

**Description**: 创建自定义错误类型。

**Deliverable**: `adapters/platform/errors.ts`

**Acceptance Criteria**:
- [ ] `PlatformNotSupportedError` 类，接受 platformId 参数
- [ ] `ConfigLoadError` 类，接受 path 和 reason 参数
- [ ] 错误消息包含解决建议

**Implementation**:
```typescript
export class PlatformNotSupportedError extends Error {
  constructor(platformId: string) {
    super(`Platform '${platformId}' is not supported. Available platforms: opencode`);
    this.name = 'PlatformNotSupportedError';
  }
}

export class ConfigLoadError extends Error {
  constructor(path: string, reason: string) {
    super(`Failed to load config from '${path}': ${reason}`);
    this.name = 'ConfigLoadError';
  }
}
```

---

### T-002: Create loader.ts

**Phase**: Phase 1  
**Priority**: high

**Description**: 创建配置加载逻辑。

**Deliverable**: `adapters/platform/loader.ts`

**Acceptance Criteria**:
- [ ] `loadRoleMapping(platformId)` 函数
- [ ] `loadCapabilities(platformId)` 函数
- [ ] 使用 `path.join(__dirname, ...)` 确保路径正确
- [ ] 文件不存在时抛出 `ConfigLoadError`

**Implementation**:
```typescript
import * as fs from 'fs';
import * as path from 'path';
import { ConfigLoadError } from './errors';

export function loadRoleMapping(platformId: string): RoleMapping {
  const configPath = path.join(__dirname, platformId, 'role-mapping.json');
  if (!fs.existsSync(configPath)) {
    throw new ConfigLoadError(configPath, 'File not found');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}
```

---

### T-003: Create runtime.ts

**Phase**: Phase 1  
**Priority**: high

**Description**: 创建主入口函数 `getPlatformAdapter()`。

**Deliverable**: `adapters/platform/runtime.ts`

**Acceptance Criteria**:
- [ ] `getPlatformAdapter(platformId)` 函数
- [ ] 使用 Map 缓存已加载的 adapter
- [ ] 不存在的平台抛出 `PlatformNotSupportedError`
- [ ] 返回实现了 `PlatformAdapter` 接口的对象

**Implementation**:
```typescript
import { PlatformAdapter } from '../interfaces/platform-adapter.interface';
import { PlatformNotSupportedError } from './errors';
import { loader } from './loader';

const SUPPORTED_PLATFORMS = ['opencode'];
const adapterCache = new Map<string, PlatformAdapter>();

export function getPlatformAdapter(platformId: string): PlatformAdapter {
  if (!SUPPORTED_PLATFORMS.includes(platformId)) {
    throw new PlatformNotSupportedError(platformId);
  }
  
  const cached = adapterCache.get(platformId);
  if (cached) return cached;
  
  const roleMapping = loader.loadRoleMapping(platformId);
  const capabilities = loader.loadCapabilities(platformId);
  
  const adapter = createAdapter(platformId, roleMapping, capabilities);
  adapterCache.set(platformId, adapter);
  return adapter;
}
```

---

### T-004: Create opencode/index.ts

**Phase**: Phase 2  
**Priority**: high

**Description**: 创建 OpenCode adapter 工厂函数。

**Deliverable**: `adapters/platform/opencode/index.ts`

**Acceptance Criteria**:
- [ ] `createOpenCodeAdapter(config)` 函数
- [ ] 返回的对象实现 `PlatformAdapter` 接口的所有方法
- [ ] `mapRoleToCategory()` 从配置读取映射
- [ ] `getDefaultSkills()` 从配置读取 skills

---

### T-005: Create merger.ts

**Phase**: Phase 3  
**Priority**: medium

**Description**: 创建配置合并逻辑，支持项目级覆盖。

**Deliverable**: `adapters/platform/merger.ts`

**Acceptance Criteria**:
- [ ] `mergeWithOverride(roleMapping)` 函数
- [ ] 读取 `.opencode/platform-override.json`（如存在）
- [ ] 合并 `additional_skills`（追加）
- [ ] 覆盖 `override_category`

---

### T-006: Integrate merger in runtime

**Phase**: Phase 3  
**Priority**: medium

**Description**: 在 runtime.ts 中集成 merger。

**Deliverable**: 更新 `adapters/platform/runtime.ts`

**Acceptance Criteria**:
- [ ] 调用 `merger.mergeWithOverride()` 合并配置
- [ ] 项目级覆盖生效

---

### T-007: Update documentation

**Phase**: Phase 4  
**Priority**: medium

**Description**: 更新 platform-adapter-guide.md，添加运行时代码示例。

**Deliverable**: 更新 `docs/platform-adapter-guide.md`

**Acceptance Criteria**:
- [ ] 添加 `import { getPlatformAdapter }` 示例
- [ ] 添加 `mapRoleToCategory()` 使用示例
- [ ] 添加 `getDefaultSkills()` 使用示例

---

### T-008: Update README.md

**Phase**: Phase 5  
**Priority**: high

**Description**: 添加 Feature 034 到 feature 列表。

**Deliverable**: 更新 `README.md`

---

### T-009: Update CHANGELOG.md

**Phase**: Phase 5  
**Priority**: high

**Description**: 添加 v1.6.1 或 v1.7.0 条目。

**Deliverable**: 更新 `CHANGELOG.md`

---

### T-010: Update registry.json

**Phase**: Phase 5  
**Priority**: high

**Description**: 更新 platform_adapters 条目，添加 runtime 入口。

**Deliverable**: 更新 `adapters/registry.json`

---

## Completion Checklist

- [x] 所有 tasks 状态更新
- [x] 创建 completion-report.md
- [x] 代码可实际运行
- [x] 文档示例可验证