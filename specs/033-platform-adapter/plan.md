# Plan: Platform Adapter

## Plan ID
`033-platform-adapter`

## Feature Reference
`specs/033-platform-adapter/spec.md`

## Version
`1.0.0`

## Created
2026-04-03

---

## Design Note

### Background

专家包采用 6-role 正式执行层模型，但不同 AI 平台使用不同的 agent 命名体系：

| 平台 | Agent 体系 | 与 6-role 关系 |
|------|-----------|---------------|
| OpenCode | Atlas, Hephaestus, Metis, Momus, Prometheus, Sisyphus... | 无直接映射 |
| Claude Code | subagent_type + category | role → category 需要映射 |
| Gemini CLI | 不同的 agent 体系 | 需要适配 |

Platform Adapter 的作用是在专家包核心层和平台运行时之间建立一个**适配层**，隔离平台差异。

### Feature Goal

建立 Platform Adapter 机制，提供：
1. 统一的角色模型抽象
2. 平台无关的任务派发接口
3. 可扩展的平台适配配置

### Design Decisions

#### Decision 1: Adapter 层次结构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Expert Pack Core                              │
│  (6-role model, skills, quality gates)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Platform Adapter Layer                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Platform Adapter Interface                                 ││
│  │  - mapRoleToCategory(role) → category                       ││
│  │  - getDefaultSkills(role) → skill[]                         ││
│  │  - getCapabilities() → PlatformCapabilities                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  OpenCode   │  │ Claude Code │  │  Gemini CLI │             │
│  │  Adapter    │  │  Adapter    │  │  Adapter    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Platform Runtime                              │
│  (OpenCode, Claude Code, Gemini CLI, etc.)                      │
└─────────────────────────────────────────────────────────────────┘
```

**Rationale**: 
- 保持专家包核心层平台无关
- 平台差异由 Adapter 层隔离
- 易于扩展新平台

#### Decision 2: 配置优先级

```
项目级覆盖 (.opencode/platform-override.json)
           ↓ 覆盖
Plugin 配置 (plugin.json → platform_mapping)
           ↓ 覆盖
Platform Adapter 默认 (adapters/platform/{platform-id}/)
           ↓ 覆盖
核心层默认行为
```

**Rationale**:
- 项目级配置最高优先级，支持特殊需求
- Plugin 可扩展平台映射
- Platform Adapter 提供合理默认值
- 核心层兜底，保证可用性

#### Decision 3: 文件结构

```
adapters/
├── interfaces/
│   ├── orchestrator-adapter.interface.ts    # 现有
│   ├── workspace-adapter.interface.ts       # 现有
│   └── platform-adapter.interface.ts        # 新增
│
├── platform/                                 # 新增目录
│   ├── README.md                            # Platform Adapter 概述
│   ├── opencode/                            # OpenCode 平台适配
│   │   ├── README.md                        # OpenCode 适配说明
│   │   ├── role-mapping.json                # 6-role → category 映射
│   │   └── capabilities.json                # 平台能力声明
│   │
│   └── templates/                           # 新平台适配模板
│       └── platform-adapter.template.json   # 模板文件
│
└── registry.json                            # 更新：增加 platform 类型
```

**Rationale**:
- 遵循现有 Adapter 架构
- Platform Adapter 作为新的 Adapter 类型
- 提供模板便于扩展

---

## Implementation Phases

### Phase 1: Interface Definition (M1)

**目标**: 定义 Platform Adapter 接口规范

**交付物**:
- `adapters/interfaces/platform-adapter.interface.ts` - TypeScript 接口定义
- `adapters/platform/README.md` - Platform Adapter 概述

**预计工作量**: 1 小时

### Phase 2: OpenCode Implementation (M2)

**目标**: 实现 OpenCode Platform Adapter

**交付物**:
- `adapters/platform/opencode/role-mapping.json` - 角色映射配置
- `adapters/platform/opencode/capabilities.json` - 平台能力声明
- `adapters/platform/opencode/README.md` - OpenCode 适配说明
- `adapters/platform/templates/platform-adapter.template.json` - 模板文件

**预计工作量**: 1.5 小时

### Phase 3: Plugin Integration (M3)

**目标**: 支持 Plugin 扩展平台映射

**交付物**:
- 更新 `plugins/PLUGIN-SPEC.md` - 增加 `platform_mapping` 字段规范
- 更新 `plugins/vite-react-ts/plugin.json` - 添加示例 `platform_mapping`
- 更新 `plugins/loader.js` - 添加 `getPlatformMapping()` 方法

**预计工作量**: 1 小时

### Phase 4: Documentation (M4)

**目标**: 完善文档

**交付物**:
- 更新 `ADAPTERS.md` - 增加 Platform Adapter 章节
- 更新 `AGENTS.md` - 增加平台适配指南章节
- 创建 `docs/platform-adapter-guide.md` - 详细使用指南
- 更新 `plugins/vite-react-ts/README.md` - 增加 platform_mapping 说明

**预计工作量**: 1.5 小时

### Phase 5: Governance Sync (M5)

**目标**: 同步治理文档

**交付物**:
- 更新 `README.md` - 添加 Feature 033
- 更新 `CHANGELOG.md` - 添加变更条目
- 更新 `adapters/registry.json` - 注册 Platform Adapter

**预计工作量**: 0.5 小时

---

## Module Boundaries

### Platform Adapter 职责

| 模块 | 职责 | 不负责 |
|------|------|--------|
| Platform Adapter Interface | 定义标准接口 | 具体平台实现 |
| OpenCode Adapter | OpenCode 平台映射 | 其他平台适配 |
| Plugin platform_mapping | 扩展平台映射 | 核心角色定义 |
| 项目级 override | 自定义覆盖 | 提供默认值 |

### 接口契约

**PlatformAdapter Interface**:
```typescript
interface PlatformAdapter {
  // 元数据
  platform_id: string;
  version: string;
  
  // 映射方法
  mapRoleToCategory(role: Role): Category;
  getDefaultSkills(role: Role): SkillId[];
  
  // 能力查询
  getCapabilities(): PlatformCapabilities;
  
  // 任务派发（可选实现）
  dispatchTask?(config: TaskConfig): DispatchResult;
}

type Role = 'architect' | 'developer' | 'tester' | 'reviewer' | 'docs' | 'security';
type Category = 'deep' | 'ultrabrain' | 'visual-engineering' | 'writing' | 'quick' | 'unspecified-high' | 'unspecified-low';
type SkillId = string;  // e.g., "tester/unit-test-design"
```

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 配置冲突 | Medium | Low | 明确优先级顺序，提供诊断工具 |
| 平台 API 变更 | Low | Medium | 版本化配置，兼容性矩阵 |
| 文档同步遗漏 | Medium | Medium | 审计规则检查 |

---

## Quality Gates

### Gate 1: Interface Quality
- [ ] TypeScript 接口定义完整
- [ ] 所有方法有 TSDoc 注释
- [ ] 类型导出正确

### Gate 2: Implementation Quality
- [ ] OpenCode role-mapping.json 包含所有 6-role
- [ ] 映射值与实际平台 category 匹配
- [ ] JSON Schema 验证通过

### Gate 3: Documentation Quality
- [ ] 所有文档章节完整
- [ ] 示例代码可执行
- [ ] 无死链接

### Gate 4: Governance Compliance
- [ ] README.md 已更新
- [ ] CHANGELOG.md 已更新
- [ ] registry.json 已更新

---

## References

- `specs/033-platform-adapter/spec.md` - 需求规格
- `docs/validation/T-006-expert-pack-validation-report-v2.md` - 问题来源
- `adapters/ADAPTERS.md` - 现有 Adapter 架构
- `role-definition.md` - 6-role 模型定义