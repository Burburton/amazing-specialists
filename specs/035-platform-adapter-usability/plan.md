# Plan: Platform Adapter Usability

## Feature Reference
`specs/035-platform-adapter-usability/spec.md`

## Version
`1.0.0`

## Created
2026-04-03

---

## Overview

系统性修复 Platform Adapter 的可用性问题，提升调用者体验。

---

## Implementation Phases

### Phase 1: P0 文档修复

| Task | 内容 |
|------|------|
| T-001 | 修复 `docs/platform-adapter-guide.md` 字段名 |
| T-002 | 添加字段说明表和示例 |

### Phase 2: P1 运行时 API 暴露

| Task | 内容 |
|------|------|
| T-003 | 更新 `AGENTS.md` 添加运行时 API |
| T-004 | 创建 `adapters/platform/index.ts` |
| T-005 | 更新 `package.json` exports |

### Phase 3: 便捷方法

| Task | 内容 |
|------|------|
| T-006 | 添加 `getTaskConfig()` 到 index.ts |

### Phase 4: 治理同步

| Task | 内容 |
|------|------|
| T-007 | 更新 `README.md` |
| T-008 | 更新 `CHANGELOG.md` |

---

## File Changes

| File | Action |
|------|--------|
| `docs/platform-adapter-guide.md` | 修改 |
| `AGENTS.md` | 修改 |
| `adapters/platform/index.ts` | 新增 |
| `package.json` | 修改 |
| `README.md` | 修改 |
| `CHANGELOG.md` | 修改 |