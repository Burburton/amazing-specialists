# Spec: Platform Adapter Usability

## Feature ID
`035-platform-adapter-usability`

## Version
`1.0.0`

## Status
`complete`

## Created
2026-04-03

## Parent Features
`033-platform-adapter`, `034-platform-adapter-runtime`

---

## Problem Statement

从调用者视角验证 Platform Adapter 时发现以下问题：

### P0 - 阻塞性问题

**文档字段名与代码不一致**：用户按文档写配置不生效。

| 文档写的 | 代码期望的 |
|----------|-----------|
| `"category"` | `override_category` |
| `"load_skills"` | `additional_skills` |

### P1 - 重要问题

1. **AGENTS.md 缺少运行时 API** - 用户不知道 `getPlatformAdapter()` 存在
2. **没有 index.ts 入口** - import 路径不直观
3. **没有 package.json exports** - 外部项目导入困难

### P2 - 改进建议

1. **API 碎片化** - 需要分别调用 `mapRoleToCategory()` 和 `getDefaultSkills()`
2. **缺少便捷方法** - 没有 `getTaskConfig(role)` 一次获取配置

---

## Goal

提升 Platform Adapter 的调用者体验，确保：
1. 文档与代码一致
2. API 易于发现和使用
3. 导入路径直观

---

## Functional Requirements

### FR-001: 文档字段名修复

**需求**：文档中的配置字段名与代码一致。

**验收标准**：
- `docs/platform-adapter-guide.md` 使用正确的字段名
- 添加字段说明表

### FR-002: AGENTS.md 运行时 API

**需求**：AGENTS.md 包含运行时 API 使用说明。

**验收标准**：
- 包含 `getPlatformAdapter()` 示例
- 包含可用导出列表

### FR-003: index.ts 入口文件

**需求**：提供统一的入口文件。

**验收标准**：
- `adapters/platform/index.ts` 存在
- 导出所有公共 API

### FR-004: package.json exports

**需求**：支持标准化的模块导入。

**验收标准**：
- `package.json` 包含 `exports` 字段
- 支持 `import ... from 'opencode-expert-pack/platform'`

### FR-005: 便捷方法 getTaskConfig

**需求**：提供一次性获取任务配置的方法。

**验收标准**：
- `getTaskConfig(platformId, role)` 返回 `{ category, skills }`

---

## Acceptance Criteria

- [x] 文档字段名与代码一致
- [x] AGENTS.md 包含运行时 API
- [x] index.ts 入口文件存在
- [x] package.json 有 exports 字段
- [x] getTaskConfig 便捷方法可用

---

## References

- `docs/platform-adapter-guide.md`
- `AGENTS.md`
- `adapters/platform/index.ts`
- `package.json`