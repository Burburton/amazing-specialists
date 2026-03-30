# Implementation Plan: 030-plugin-architecture

## Metadata
```yaml
feature_id: 030-plugin-architecture
plan_version: 1.0.0
created_at: 2026-03-31
depends_on: [029-real-world-validation]
estimated_effort: Medium (2 sessions)
```

---

## Overview

本 Feature 为专家包引入可插拔 Plugin 架构，将技术栈特定能力与核心层分离。核心工作：

1. **Plugin Architecture Definition** - 定义 Plugin 目录结构、规格、加载机制
2. **Plugin Registry & Loader** - 实现 registry.json 和 loader.js
3. **vite-react-ts Plugin (First Instance)** - 实现第一个 Plugin 实例
4. **Plugin Documentation** - 编写使用指南和规格文档

---

## Architecture Summary

### Layer Separation

```
┌─────────────────────────────────────────┐
│  User Project                            │
│  (Vite + React / Next.js / Vue / ...)    │
└─────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Plugin Layer (可插拔)                    │
│  - vite-react-ts                         │
│  - nextjs                                │
│  - vue-vite                              │
│  - python-fastapi                        │
│  - go-mod                                │
│  - rust-cargo                            │
└─────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Core Layer (通用核心)                    │
│  - 6-role skills (architect/developer/...)│
│  - common skills                         │
│  - contracts                             │
│  - templates                             │
│  - adapters                              │
└─────────────────────────────────────────┘
```

### Core vs Plugin Responsibility

| 类型 | 核心层负责 | Plugin 负责 |
|------|-----------|-------------|
| 开发流程 | ✅ feature-implementation, bugfix-workflow | ❌ |
| 测试方法论 | ✅ unit-test-design, regression-analysis | ❌ |
| 项目配置 | ❌ | ✅ tsconfig, vite.config, eslint 等 |
| 技术栈测试模式 | ❌ | ✅ CSS Module 测试, React 测试等 |
| 模板文件 | ✅ 通用模板 (artifact templates) | ✅ 技术栈模板 (tsconfig 等) |
| 质量门禁 | ✅ quality-gate.md | ❌ |
| 角色协作 | ✅ collaboration-protocol.md | ❌ |

---

## Inputs from Spec

### Functional Requirements

| FR | Description | Source |
|----|-------------|--------|
| FR-001 | Plugin Registry | `plugins/registry.json` with status tracking |
| FR-002 | Plugin Loader | `plugins/loader.js` with list/install/uninstall |
| FR-003 | Plugin Skills | Tech-stack specific skills in SKILL.md format |
| FR-004 | Plugin Templates | Tech-stack template files |
| FR-005 | Plugin Hooks | Tech-stack specific hooks |
| FR-006 | Plugin Documentation | PLUGIN-SPEC.md and usage guide |

### Technical Constraints

| TC | Description | Validation |
|----|-------------|------------|
| TC-001 | Plugin skills must follow SKILL.md format | Use skill tool for loading |
| TC-002 | Plugin isolation - no core skill override | Skill prefix naming |
| TC-003 | Version compatibility via plugin.json | loader.js version check |

### Acceptance Criteria

| AC | Description | Phase |
|----|-------------|-------|
| AC-001 | Plugin 目录结构建立 | Phase 1 |
| AC-002 | Plugin 加载机制实现 | Phase 2 |
| AC-003 | vite-react-ts Plugin 实现 | Phase 3 |
| AC-004 | 文档完成 | Phase 4 |
| AC-005 | 验证通过 | Phase 5 |

---

## Module Decomposition

### M1: Plugin Registry Module

**Responsibility**: Provide centralized Plugin metadata management and discovery.

**Components**:
- `plugins/registry.json` - Plugin registry (status, path, version)
- `plugins/PLUGIN-SPEC.md` - Plugin specification document

**Data Model**:
```json
{
  "version": "1.0.0",
  "plugins": [
    {
      "id": "vite-react-ts",
      "path": "plugins/vite-react-ts/",
      "status": "available",
      "core_compatibility": ">=1.0.0"
    }
  ],
  "loader_version": "1.0.0"
}
```

**Key Functions**:
| Function | Description |
|----------|-------------|
| `listPlugins()` | Return all registered plugins with status |
| `getPluginById(id)` | Return plugin metadata |
| `updatePluginStatus(id, status)` | Update plugin status after install/uninstall |

**Dependencies**: None (standalone configuration)

---

### M2: Plugin Loader Module

**Responsibility**: Execute Plugin lifecycle operations (list, install, uninstall).

**Components**:
- `plugins/loader.js` - Plugin loader CLI
- `plugins/lib/plugin-utils.js` - Shared utilities

**Key Functions**:

| Function | Module | Description |
|----------|--------|-------------|
| `listCommand()` | loader.js | List all plugins with status |
| `installCommand(pluginId, projectPath)` | loader.js | Install plugin to project |
| `uninstallCommand(pluginId, projectPath)` | loader.js | Remove plugin from project |
| `copyTemplates(plugin, targetDir)` | plugin-utils.js | Copy template files |
| `registerSkills(plugin, projectSkillsDir)` | plugin-utils.js | Register plugin skills |
| `configureHooks(plugin, projectHooksDir)` | plugin-utils.js | Configure plugin hooks |
| `validateCompatibility(plugin, coreVersion)` | plugin-utils.js | Check version compatibility |

**Error Handling**:

| Error | Response |
|-------|----------|
| Plugin not found | Error + list available plugins |
| Version incompatible | Error + compatibility matrix |
| Target project missing | Error + require valid path |
| Skill name conflict | Warning + skip conflicting skills |
| Template copy failure | Error + partial cleanup |

**Dependencies**: M1 (reads registry.json)

---

### M3: Plugin Instance Module (vite-react-ts)

**Responsibility**: Provide Vite + React + TypeScript specific capabilities.

**Components**:
- `plugins/vite-react-ts/plugin.json` - Plugin metadata
- `plugins/vite-react-ts/skills/vite-setup/SKILL.md` - Vite configuration skill
- `plugins/vite-react-ts/skills/css-module-test/SKILL.md` - CSS Module testing skill
- `plugins/vite-react-ts/templates/` - Template files
- `plugins/vite-react-ts/hooks/docstring-exclusions.md` - Triple-slash hook exclusion

**Plugin Metadata**:
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

**Skill Content**:

| Skill | Purpose | Key Guidance |
|-------|---------|--------------|
| vite-setup | Configure Vite + Vitest + TypeScript | tsconfig separation, defineConfig import, env setup |
| css-module-test | Test CSS Module components | Mock CSS imports, className resolution |

**Template Files**:
- `tsconfig.app.json` - Application code config
- `tsconfig.node.json` - Node/Vite config config
- `tsconfig.test.json` - Test environment config
- `vite-env.d.ts` - Vite type declarations
- `vite.config.ts` - Vite configuration template

**Dependencies**: M1, M2 (uses loader for installation)

---

### M4: Documentation Module

**Responsibility**: Guide users on Plugin usage and development.

**Components**:
- `docs/plugin-usage-guide.md` - Plugin usage guide
- `plugins/PLUGIN-SPEC.md` - Plugin specification (developer reference)

**Content Structure**:

| Document | Sections |
|----------|----------|
| PLUGIN-SPEC.md | Plugin structure, plugin.json format, skill format, template format, hook format |
| plugin-usage-guide.md | List plugins, install plugin, use plugin skills, develop new plugin |

**Dependencies**: M1, M2, M3 (documents the system)

---

## Data Flow

### Flow 1: Plugin Discovery

```
User: node plugins/loader.js list
      │
      ▼
Loader: Read plugins/registry.json
      │
      ▼
Loader: For each plugin entry:
        - Read plugin.json
        - Check compatibility
        - Determine status
      │
      ▼
Loader: Output formatted list:
        Available Plugins:
          - vite-react-ts (available)
          - nextjs (planned)
          - vue-vite (planned)
```

### Flow 2: Plugin Installation

```
User: node plugins/loader.js install vite-react-ts --project ./my-project
      │
      ▼
Loader: Validate plugin exists in registry
      │
      ├─[not found]──► Error: plugin not found
      │
      ▼
Loader: Read plugin.json, validate compatibility
      │
      ├─[incompatible]──► Error: core version mismatch
      │
      ▼
Loader: Copy templates/ to target project
      │
      ├─[copy failure]──► Error + cleanup
      │
      ▼
Loader: Register skills (copy/link SKILL.md)
      │
      ├─[skill conflict]──► Warning + skip
      │
      ▼
Loader: Configure hooks
      │
      ▼
Loader: Update registry status (installed)
      │
      ▼
Loader: Output installation summary
```

### Flow 3: Plugin Skill Loading

```
OpenCode: Load skills for session
      │
      ▼
System: Load core skills from .opencode/skills/
      │
      ▼
System: Check installed plugins
      │
      ▼
System: For each installed plugin:
        - Load plugin/skills/*/SKILL.md
        - Merge with skill registry
      │
      ▼
System: Skill tool can invoke plugin skills
```

---

## Failure Handling

### Failure Categories

| Category | Example | Recovery |
|----------|---------|----------|
| **Registry Error** | Missing registry.json, invalid JSON | Create default registry, error message |
| **Plugin Not Found** | Invalid plugin ID | Error + list available plugins |
| **Version Incompatible** | Core version mismatch | Error + compatibility matrix |
| **Template Copy Failure** | Permission denied, path invalid | Error + cleanup partial copies |
| **Skill Conflict** | Plugin skill name matches core skill | Warning + skip, use core skill |
| **Hook Configuration Failure** | Invalid hook format | Warning + skip hook |

### Error Codes

| Error Code | Message | Suggested Action |
|------------|---------|------------------|
| `P001` | Registry not found | Initialize registry with default plugins |
| `P002` | Plugin not found: {id} | Run 'list' to see available plugins |
| `P003` | Version incompatible: {plugin} requires {version} | Update core or use compatible plugin |
| `P004` | Template copy failed: {file} | Check permissions, verify target path |
| `P005` | Skill conflict: {skill} already exists in core | Plugin skill skipped, using core skill |
| `P006` | Target project not found: {path} | Verify project path exists |

---

## Validation Strategy

### Loader Tests

| Test ID | Test Name | Scope | PASS Condition |
|---------|-----------|-------|----------------|
| `L001` | list command | Output format | Lists all plugins with correct status |
| `L002` | install command | File copy | Templates copied to target |
| `L003` | install command | Skill registration | Skills available in target |
| `L004` | install command | Hook configuration | Hooks applied correctly |
| `L005` | uninstall command | Cleanup | Files removed, registry updated |
| `L006` | compatibility check | Version validation | Rejects incompatible plugins |

### Plugin Instance Tests

| Test ID | Test Name | Scope | PASS Condition |
|---------|-----------|-------|----------------|
| `V001` | plugin.json valid | Metadata | All required fields present |
| `V002` | vite-setup skill | Skill content | SKILL.md follows format |
| `V003` | css-module-test skill | Skill content | SKILL.md follows format |
| `V004` | templates valid | Template files | JSON/TS files valid |
| `V005` | hook valid | Hook content | docstring-exclusions.md valid |

### Integration Tests

| Test ID | Test Name | Scope | PASS Condition |
|---------|-----------|-------|----------------|
| `I001` | Real project install | vite-react-ts in sample project | Skills usable, templates applied |
| `I002` | Skill invocation | Invoke vite-setup skill | Skill loads and executes |

---

## Risks / Tradeoffs

### Identified Risks

| Risk ID | Risk | Severity | Mitigation |
|---------|------|----------|------------|
| R-001 | Plugin skill name conflicts with core skill | Major | Use prefix naming (e.g., `vite-setup`), skip on conflict |
| R-002 | Plugin version drift from core | Major | `compatibility.core_version` check in loader |
| R-003 | Plugin templates outdated | Minor | Plugin versioning, template version markers |
| R-004 | Skill format divergence | Major | Validation against SKILL.md template |
| R-005 | Plugin discovery performance (many plugins) | Minor | Cache registry, lazy load plugin.json |
| R-006 | Hook injection security | Major | Validate hook format, no code execution |

### Tradeoffs

| Tradeoff | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Loader Language | Node.js | Shell scripts | Cross-platform, matches existing CLI (init.js) |
| Skill Registration | Copy/link | Runtime merge | Simpler implementation, explicit presence |
| Template Copy | Full copy | Selective copy | User can delete unwanted files |
| Hook Configuration | Append to existing | Replace | Safer, preserves existing hooks |
| Plugin Versioning | Simple semver | Complex matrix | MVP simplicity, defer complexity |

---

## Implementation Order

### Phase 1: Architecture Foundation (Sequential)

1. Create `plugins/` directory structure
2. Create `plugins/registry.json` with initial plugins
3. Create `plugins/PLUGIN-SPEC.md` specification document
4. Validate structure with AC-001

### Phase 2: Loader Implementation (Sequential)

1. Implement `plugins/loader.js` main entry
2. Implement `list` command
3. Implement `install` command
4. Implement `uninstall` command
5. Implement `plugins/lib/plugin-utils.js` utilities
6. Validate loader with AC-002

### Phase 3: vite-react-ts Plugin (Parallel-Safe after Phase 1)

1. Create `plugins/vite-react-ts/` directory
2. Create `plugin.json` metadata
3. Create `skills/vite-setup/SKILL.md`
4. Create `skills/css-module-test/SKILL.md`
5. Create template files (tsconfig.*, vite-env.d.ts, vite.config.ts)
6. Create `hooks/docstring-exclusions.md`
7. Validate with AC-003

### Phase 4: Documentation (Parallel-Safe)

1. Create `docs/plugin-usage-guide.md`
2. Update README.md with Plugin architecture section
3. Validate with AC-004

### Phase 5: Validation & Review (Sequential)

1. tester: Run loader tests (L001-L006)
2. tester: Run plugin tests (V001-V005)
3. tester: Run integration tests (I001-I002)
4. security: Validate hook security (R-006)
5. reviewer: Review completeness
6. docs: Final documentation sync
7. Validate with AC-005

---

## Estimated Effort

| Module | Effort | Parallel-Safe |
|--------|--------|---------------|
| M1: Registry | 0.5 day | No (foundation) |
| M2: Loader | 1-1.5 days | No (after M1) |
| M3: vite-react-ts Plugin | 1 day | Yes (after M1) |
| M4: Documentation | 0.5 day | Yes |
| Validation | 0.5 day | No |
| **Total** | **3-4 days** | - |

---

## Requirement Traceability

### FR to Design Mapping

| FR | Design Section | Validation |
|----|-----------------|------------|
| FR-001 | M1: Plugin Registry Module | AC-001 |
| FR-002 | M2: Plugin Loader Module | AC-002 |
| FR-003 | M3: Plugin Instance Skills | AC-003 |
| FR-004 | M3: Plugin Instance Templates | AC-003 |
| FR-005 | M3: Plugin Instance Hooks | AC-003 |
| FR-006 | M4: Documentation Module | AC-004 |

### AC to Phase Mapping

| AC | Phase | Key Deliverables |
|----|-------|------------------|
| AC-001 | Phase 1 | plugins/ directory, registry.json, PLUGIN-SPEC.md |
| AC-002 | Phase 2 | loader.js with list/install/uninstall |
| AC-003 | Phase 3 | vite-react-ts plugin complete |
| AC-004 | Phase 4 | plugin-usage-guide.md, README update |
| AC-005 | Phase 5 | All tests pass, security validated |

### TC to Implementation

| TC | Implementation | Check |
|----|----------------|-------|
| TC-001 | plugin-utils.js validates SKILL.md format | Skill tool loads plugin skills |
| TC-002 | loader.js skips conflicting skill names | No core skill override |
| TC-003 | plugin.json compatibility field, loader validates | Version check before install |

---

## Dependencies

### External Dependencies (From Prior Features)

| Dependency | Source Feature | Purpose |
|------------|----------------|---------|
| .opencode/skills/ structure | 003-008 core features | Skill format reference |
| templates/cli/init.js | 018-template-bootstrap | CLI pattern reference |
| io-contract.md | Core | Contract reference |
| role-definition.md | 002-role-model-alignment | Role boundaries |
| validation-report.md | 029-real-world-validation | Plugin demand evidence |

### Internal Dependencies (Within Feature)

| From | To | Reason |
|------|-----|--------|
| Phase 1 | Phase 2, Phase 3 | Registry and structure must exist first |
| Phase 2 | Phase 5 | Loader must work for validation |
| Phase 3 | Phase 5 | Plugin must exist for validation |
| All Phases | Phase 5 | Validation requires all work complete |

---

## Next Recommended Command

建议执行 `/spec-tasks 030-plugin-architecture` 生成详细任务清单，或执行 `/spec-implement 030-plugin-architecture` 开始实施。