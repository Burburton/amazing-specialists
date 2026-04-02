# Feature: Platform Adapter

## Feature ID
`033-platform-adapter`

## Version
`1.0.0`

## Created
2026-04-03

## Status
`draft`

---

## Overview

### Problem Statement

在 T-006 实战验证中发现以下问题：

1. **角色模型不匹配**：专家包定义 6-role 模型（architect, developer, tester, reviewer, docs, security），但 OpenCode 平台使用不同的 agent 命名体系（Atlas, Hephaestus, Metis, 等）

2. **任务派发困难**：使用 `task(subagent_type="tester")` 失败，平台返回 "Unknown agent: tester"

3. **缺乏平台适配层**：现有 Adapter 层专注于外部系统集成（GitHub Issue, OpenClaw），未处理平台运行时差异

4. **文档缺失**：缺少平台适配指南，开发者需要反复试错

### Impact

- **开发效率降低**：每次调用需要手动映射 role → category
- **自动化流程受阻**：无法直接使用角色名称派发任务
- **文档与实现脱节**：Skills 文档中引用的角色概念无法直接使用
- **可移植性差**：不同平台（OpenCode, Claude Code, Gemini CLI）需要不同的适配方式

---

## Goals

### Primary Goal

建立 **Platform Adapter** 机制，隔离平台运行时差异，提供统一的角色模型抽象。

### Specific Goals

1. **定义 Platform Adapter 接口规范**
   - 标准化角色到平台 category 的映射
   - 标准化 skills 加载机制
   - 标准化任务派发接口

2. **提供 OpenCode Platform Adapter 实现**
   - 6-role → OpenCode category 映射
   - 对应的 skills 自动加载

3. **完善扩展点文档**
   - Plugin 如何提供平台映射
   - 项目如何自定义覆盖

4. **更新治理文档**
   - ADAPTERS.md 增加 Platform Adapter 概念
   - AGENTS.md 增加平台适配指南

---

## Scope

### In Scope

| 项目 | 说明 |
|------|------|
| Platform Adapter 接口定义 | `adapters/interfaces/platform-adapter.interface.ts` |
| OpenCode Platform Adapter 实现 | `adapters/platform/opencode/` |
| Role-to-Category 映射配置 | `adapters/platform/opencode/role-mapping.json` |
| Plugin platform_mapping 字段扩展 | `plugins/PLUGIN-SPEC.md` 更新 |
| Plugin README 完善 | `plugins/vite-react-ts/README.md` |
| ADAPTERS.md 更新 | 增加 Platform Adapter 章节 |
| AGENTS.md 更新 | 增加平台适配指南 |
| 文档更新 | 创建平台适配使用指南 |

### Out of Scope

| 项目 | 原因 |
|------|------|
| 其他平台 Adapter 实现 | 仅提供 OpenCode 模板，其他平台由社区或项目实现 |
| 平台工具行为修改 | Edit/Write 缓存、Background Task 是平台内部行为，专家包无法控制 |
| 具体项目配置修复 | 项目级配置（@types/node, tsconfig）由具体项目负责 |
| 自动角色检测 | MVP 阶段手动映射，未来可考虑自动检测 |

---

## Requirements

### Functional Requirements

#### FR-001: Platform Adapter Interface

定义统一的 Platform Adapter 接口：

```typescript
interface PlatformAdapter {
  // 平台标识
  platform_id: string;
  version: string;
  
  // 角色映射
  role_mapping: {
    [role: string]: {
      category: string;
      default_skills: string[];
    }
  };
  
  // 平台能力
  capabilities: {
    supports_background_task: boolean;
    supports_parallel_agents: boolean;
    max_context_length: number;
  };
  
  // 已知问题
  known_issues?: PlatformIssue[];
  
  // 方法
  mapRoleToCategory(role: string): string;
  getDefaultSkills(role: string): string[];
  dispatchTask(role: string, task: TaskConfig): DispatchResult;
}
```

#### FR-002: OpenCode Platform Adapter

提供 OpenCode 平台的具体实现：

| Role | Category | Default Skills |
|------|----------|----------------|
| architect | deep | architect/requirement-to-design, architect/module-boundary-design, architect/tradeoff-analysis |
| developer | unspecified-high | developer/feature-implementation, developer/bugfix-workflow, developer/code-change-selfcheck |
| tester | unspecified-high | tester/unit-test-design, tester/regression-analysis, tester/edge-case-matrix |
| reviewer | unspecified-high | reviewer/code-review-checklist, reviewer/spec-implementation-diff, reviewer/reject-with-actionable-feedback |
| docs | writing | docs/readme-sync, docs/changelog-writing, docs/issue-status-sync |
| security | unspecified-high | security/auth-and-permission-review, security/input-validation-review |

#### FR-003: Plugin Extension Support

Plugin 可通过 `platform_mapping` 字段提供平台特定配置：

```json
{
  "id": "vite-react-ts",
  "platform_mapping": {
    "opencode": {
      "tester": {
        "category": "unspecified-high",
        "additional_skills": ["run-tests"]
      }
    }
  }
}
```

#### FR-004: Project-Level Override

项目可通过 `.opencode/platform-override.json` 覆盖默认映射：

```json
{
  "platform_id": "opencode",
  "overrides": {
    "tester": {
      "category": "deep",
      "load_skills": ["tester/unit-test-design", "tester/integration-test-design"]
    }
  }
}
```

#### FR-005: Documentation

提供完整的平台适配文档：
- ADAPTERS.md 增加 Platform Adapter 章节
- AGENTS.md 增加平台适配指南
- `docs/platform-adapter-guide.md` 详细使用指南
- `plugins/vite-react-ts/README.md` 增加 platform_mapping 说明

---

## Non-Functional Requirements

### NFR-001: Compatibility

- 向后兼容：不修改现有 Adapter 接口
- 新 Platform Adapter 不影响现有 Orchestrator/Workspace Adapter

### NFR-002: Extensibility

- 支持 Plugin 层扩展平台映射
- 支持项目层自定义覆盖
- 支持未来添加其他平台（Claude Code, Gemini CLI）

### NFR-003: Documentation Quality

- 所有接口有 TSDoc 注释
- 提供完整的使用示例
- 错误场景有清晰的解决方案

---

## Acceptance Criteria

### AC-001: Platform Adapter Interface Defined

- [ ] `adapters/interfaces/platform-adapter.interface.ts` 文件存在
- [ ] 接口定义包含所有必需字段
- [ ] 接口有完整的 TSDoc 注释

### AC-002: OpenCode Platform Adapter Implemented

- [ ] `adapters/platform/opencode/` 目录存在
- [ ] `role-mapping.json` 包含所有 6-role 映射
- [ ] 映射可通过代码正确读取

### AC-003: Plugin Extension Working

- [ ] `PLUGIN-SPEC.md` 包含 `platform_mapping` 字段规范
- [ ] Plugin loader 可读取 `platform_mapping` 配置

### AC-004: Documentation Complete

- [ ] `ADAPTERS.md` 包含 Platform Adapter 章节
- [ ] `AGENTS.md` 包含平台适配指南
- [ ] `docs/platform-adapter-guide.md` 存在且内容完整
- [ ] `plugins/vite-react-ts/README.md` 包含 platform_mapping 说明

### AC-005: Governance Sync

- [ ] `README.md` 更新 Feature 列表
- [ ] `package.json` 版本号更新（如需要）
- [ ] `CHANGELOG.md` 添加条目

---

## Technical Constraints

### TC-001: File Locations

| 文件类型 | 位置 |
|----------|------|
| Interface Definition | `adapters/interfaces/platform-adapter.interface.ts` |
| Platform Adapter | `adapters/platform/{platform-id}/` |
| Role Mapping Config | `adapters/platform/{platform-id}/role-mapping.json` |
| Platform README | `adapters/platform/{platform-id}/README.md` |

### TC-002: Compatibility

- Platform Adapter 是可选组件
- 不存在时，使用核心层默认行为
- 不影响现有 Adapter 的工作

### TC-003: Priority Order

配置加载优先级（从高到低）：
1. 项目级覆盖 (`.opencode/platform-override.json`)
2. Plugin 配置 (`plugin.json` → `platform_mapping`)
3. Platform Adapter 默认 (`adapters/platform/{platform-id}/role-mapping.json`)
4. 核心层默认行为

---

## Dependencies

### Internal Dependencies

- `adapters/interfaces/orchestrator-adapter.interface.ts` - 现有 Orchestrator 接口
- `adapters/interfaces/workspace-adapter.interface.ts` - 现有 Workspace 接口
- `plugins/PLUGIN-SPEC.md` - Plugin 规范
- `AGENTS.md` - 项目执行规则

### External Dependencies

- 无新增外部依赖

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 平台 API 变更 | Low | Medium | 版本化配置，明确兼容性 |
| 映射规则冲突 | Medium | Low | 明确优先级顺序，文档说明 |
| 文档更新遗漏 | Medium | Medium | 使用审计规则检查一致性 |

---

## Milestones

### M1: Interface Definition
- 创建 Platform Adapter 接口
- 定义 Role Mapping Schema

### M2: OpenCode Implementation
- 实现 OpenCode Platform Adapter
- 提供 6-role 映射

### M3: Plugin Integration
- 更新 PLUGIN-SPEC.md
- Plugin loader 支持 platform_mapping

### M4: Documentation
- 更新 ADAPTERS.md
- 更新 AGENTS.md
- 创建使用指南
- 更新 Plugin README

### M5: Governance Sync
- 更新 README.md
- 更新 CHANGELOG.md
- 运行审计验证

---

## References

- `docs/validation/T-006-expert-pack-validation-report-v2.md` - 需求来源
- `adapters/ADAPTERS.md` - 现有 Adapter 架构
- `plugins/PLUGIN-SPEC.md` - Plugin 规范
- `package-spec.md` - 专家包定位
- `role-definition.md` - 6-role 模型定义