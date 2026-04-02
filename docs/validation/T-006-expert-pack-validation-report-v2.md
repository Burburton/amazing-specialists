# 专家包能力验证报告 - T-006 实战测试（修订版）

**验证日期**: 2026-04-02  
**修订日期**: 2026-04-02  
**验证方式**: T-006 GitHub Issue Workflow 完整执行  
**验证项目**: `Burburton/amazing-specialist-face`  
**专家包版本**: 032-workflow-extensibility-enhancements  

---

## 修订说明

本报告是初版报告的修订版，根据用户反馈，重新分析了专家包的定位和职责边界，区分了：
- **专家包核心层**应该提供的改进
- **Plugin 层**应该提供的改进
- **Adapter 层**应该提供的改进
- **具体项目**应该自行处理的配置

---

## 1. 专家包架构定位

### 1.1 三层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    专家包核心层 (Core)                           │
│  职责：通用方法论、角色定义、IO 契约、质量门禁                    │
│  提供：feature-implementation, unit-test-design 等 skills       │
│  不提供：技术栈特定配置、平台适配                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Plugin 层 (可插拔扩展)                        │
│  职责：技术栈特定能力、项目配置模板                              │
│  提供：tsconfig, vite.config, run-tests, run-build, hooks       │
│  不提供：开发方法论、质量门禁                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Adapter 层 (平台适配)                         │
│  职责：隔离平台差异、外部系统集成                                │
│  提供：GitHub Issue adapter, OpenClaw adapter, CLI adapter      │
│  处理：上游接入（外部 → Dispatch Payload）                       │
│        下游输出（Execution Result → 外部）                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    项目级配置 (Project-specific)                  │
│  职责：具体项目的特异化配置                                      │
│  提供：项目特定的 TypeScript 配置、测试环境、错误映射            │
│  不提供：通用能力（由专家包提供）                                │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 职责边界矩阵

| 能力 | 核心层 | Plugin 层 | Adapter 层 | 项目级 |
|------|--------|-----------|------------|--------|
| 开发流程方法论 | ✅ | ❌ | ❌ | ❌ |
| 测试方法论 | ✅ | ❌ | ❌ | ❌ |
| 质量门禁 | ✅ | ❌ | ❌ | ❌ |
| 角色定义 | ✅ | ❌ | ❌ | ❌ |
| IO 契约 | ✅ | ❌ | ❌ | ❌ |
| 技术栈配置模板 | ❌ | ✅ | ❌ | ❌ |
| 技术栈特定命令 | ❌ | ✅ | ❌ | ❌ |
| 平台适配 | ❌ | ❌ | ✅ | ❌ |
| 外部系统集成 | ❌ | ❌ | ✅ | ❌ |
| 项目特定配置 | ❌ | ❌ | ❌ | ✅ |
| 测试环境配置 | ❌ | ❌ | ❌ | ✅ |
| 平台特定错误处理 | ❌ | ❌ | ✅ | 可选 |

---

## 2. 问题重新分类

### 2.1 问题归属分析

| 问题 ID | 问题描述 | 原归属 | 正确归属 | 理由 |
|---------|----------|--------|----------|------|
| **P-001** | Subagent 映射缺失 | 专家包创建映射表 | **Adapter 层 + 项目级** | 平台差异应由 Adapter 隔离，具体项目可自定义 |
| **P-002** | Test 环境配置不一致 | 专家包修复 | **项目级** | @types/node、tsconfig 是项目特定配置 |
| **T-001** | Edit/Write 缓存机制 | 专家包改进 | **平台问题** | 专家包无法控制平台工具 |
| **T-002** | Background Task 启动失败 | 专家包改进 | **平台问题** | 专家包无法控制平台调度 |
| **D-001** | Subagent 使用指南缺失 | 专家包文档 | **Adapter 文档** | 平台适配指南应在 Adapter 层 |
| **D-002** | Plugin Skills 文档缺失 | 专家包文档 | **Plugin 文档** | 已正确，应在 Plugin README |
| **D-003** | 错误处理手册缺失 | 专家包文档 | **分层次** | 通用→核心，平台→Adapter，项目→项目 |

### 2.2 专家包可控性分析

```
┌─────────────────────────────────────────────────────────────────┐
│                    专家包可控范围                                │
├─────────────────────────────────────────────────────────────────┤
│ ✅ 可改进：                                                      │
│    - 核心 Skills 内容和质量                                      │
│    - Plugin 规范和扩展机制                                       │
│    - Adapter 接口定义                                            │
│    - 文档和指南                                                  │
│                                                                 │
│ ⚠️ 需提供扩展点：                                                │
│    - Plugin role-to-category 映射配置                           │
│    - Adapter 平台适配接口                                        │
│    - 项目级配置覆盖机制                                          │
│                                                                 │
│ ❌ 无法控制：                                                    │
│    - OpenCode 平台工具行为（Edit/Write 缓存）                   │
│    - OpenCode 平台任务调度（Background Task）                   │
│    - OpenCode agent 命名体系                                    │
│    - 具体项目的 TypeScript 配置                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 改进建议（按层级）

### 3.1 专家包核心层改进

#### 改进 C-001: 定义 Platform Adapter 接口规范

**问题**: 缺少平台适配的标准接口定义

**改进方案**: 在 `adapters/interfaces/` 中定义 `platform-adapter.interface.ts`

```typescript
// adapters/interfaces/platform-adapter.interface.ts

/**
 * Platform Adapter Interface
 * 用于隔离不同运行平台的差异
 */
export interface PlatformAdapter {
  // 平台标识
  platform_id: string;  // 'opencode', 'claude-code', 'gemini-cli'
  
  // Role 映射
  role_mapping: {
    [role: string]: {
      category: string;
      default_skills: string[];
    }
  };
  
  // 平台特定能力
  capabilities: {
    supports_background_task: boolean;
    supports_parallel_agents: boolean;
    max_context_length: number;
  };
  
  // 错误映射
  error_mapping?: {
    [platform_error: string]: string;  // platform error -> standard error
  };
}
```

**预期效果**:
- 专家包核心层定义接口，不关心具体平台实现
- 各平台通过实现接口进行适配
- 项目可以自定义覆盖

#### 改进 C-002: 完善 Plugin 扩展机制文档

**问题**: Plugin 如何提供 role-to-category 映射未说明

**改进方案**: 在 `plugins/PLUGIN-SPEC.md` 中添加 `platform_mapping` 字段规范

```json
{
  "id": "vite-react-ts",
  "name": "Vite + React + TypeScript",
  "platform_mapping": {
    "opencode": {
      "tester": {
        "category": "unspecified-high",
        "skills": ["tester/unit-test-design"]
      }
    }
  }
}
```

**预期效果**:
- Plugin 可以定义平台特定的映射
- 用户不需要手动配置

---

### 3.2 Plugin 层改进

#### 改进 P-001: 完善 Plugin README

**问题**: Plugin skills 和 commands 使用方式不清晰

**改进方案**: 在 `plugins/vite-react-ts/README.md` 中添加：

```markdown
# Vite React TypeScript Plugin

## Available Commands

Plugin 提供以下执行命令：

| 命令 | 调用方式 | 说明 |
|------|----------|------|
| build | `npm run build` | 生产构建 |
| test | `npm test` | 运行测试 |

## Available Skills

### run-tests

运行项目测试。

**调用方式**:
- 在 tester/unit-test-design skill 中自动检测并调用
- 或通过 Plugin loader 手动调用

### run-build

运行项目构建验证。

---

## Platform Mapping

Plugin 提供以下平台适配配置：

| Role | OpenCode Category | Skills |
|------|-------------------|--------|
| tester | unspecified-high | tester/unit-test-design |

项目可通过 `.opencode/platform-mapping.json` 覆盖默认配置。
```

**预期效果**:
- 开发者清楚如何使用 Plugin skills
- 平台适配有文档支持

---

### 3.3 Adapter 层改进

#### 改进 A-001: 创建 Platform Adapter 模板

**问题**: 缺少平台适配的标准模板

**改进方案**: 创建 `adapters/platform/` 目录，提供 OpenCode 适配示例

```
adapters/platform/
├── README.md                      # Platform Adapter 使用指南
├── opencode/
│   ├── platform-adapter.json      # OpenCode 平台配置
│   └── README.md                  # OpenCode 适配说明
└── templates/
    └── platform-adapter.template.json  # 新平台适配模板
```

**opencode/platform-adapter.json**:
```json
{
  "platform_id": "opencode",
  "version": "1.0.0",
  "role_mapping": {
    "architect": {
      "category": "deep",
      "default_skills": ["architect/requirement-to-design"]
    },
    "developer": {
      "category": "unspecified-high",
      "default_skills": ["developer/feature-implementation"]
    },
    "tester": {
      "category": "unspecified-high",
      "default_skills": ["tester/unit-test-design"]
    },
    "reviewer": {
      "category": "unspecified-high",
      "default_skills": ["reviewer/code-review-checklist"]
    },
    "docs": {
      "category": "writing",
      "default_skills": ["docs/readme-sync"]
    },
    "security": {
      "category": "unspecified-high",
      "default_skills": ["security/auth-and-permission-review"]
    }
  },
  "capabilities": {
    "supports_background_task": true,
    "supports_parallel_agents": true,
    "max_context_length": 200000
  },
  "known_issues": [
    {
      "issue": "subagent_type parameter not supported",
      "workaround": "Use category + load_skills instead"
    }
  ]
}
```

**预期效果**:
- 开发者有明确的平台适配指南
- 可复用到其他平台

---

### 3.4 项目级改进（测试项目应该做的）

#### 改进 PRJ-001: 测试环境配置修复

**问题**: 测试项目缺少 @types/node 和 tsconfig 配置

**改进方案**: 在测试项目中：

```bash
npm install --save-dev @types/node
```

更新 `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "types": ["node", "vitest/globals"]
  }
}
```

**预期效果**:
- 构建成功
- 测试环境可用

#### 改进 PRJ-002: 项目级平台配置

**问题**: 项目需要自定义平台映射

**改进方案**: 在测试项目中创建 `.opencode/platform-mapping.json`:

```json
{
  "platform_id": "opencode",
  "overrides": {
    "tester": {
      "category": "unspecified-high",
      "load_skills": ["tester/unit-test-design"]
    }
  }
}
```

**预期效果**:
- 项目可以覆盖默认配置
- 不同项目可以有不同配置

---

## 4. 改进优先级排序（修订版）

### 4.1 专家包核心层改进

| 优先级 | 改进 ID | 改进内容 | 预计时间 |
|--------|---------|----------|----------|
| **P0** | C-001 | 定义 Platform Adapter 接口规范 | 2h |
| **P0** | C-002 | 完善 Plugin 扩展机制文档 | 1h |

### 4.2 Plugin 层改进

| 优先级 | 改进 ID | 改进内容 | 预计时间 |
|--------|---------|----------|----------|
| **P1** | P-001 | 完善 Plugin README | 1h |

### 4.3 Adapter 层改进

| 优先级 | 改进 ID | 改进内容 | 预计时间 |
|--------|---------|----------|----------|
| **P1** | A-001 | 创建 Platform Adapter 模板 | 2h |

### 4.4 项目级改进（测试项目）

| 优先级 | 改进 ID | 改进内容 | 预计时间 |
|--------|---------|----------|----------|
| **P0** | PRJ-001 | 测试环境配置修复 | 0.5h |
| **P1** | PRJ-002 | 项目级平台配置 | 0.5h |

---

## 5. 总结

### 5.1 专家包能力验证结果

| 维度 | 结果 | 评分 |
|------|------|------|
| GitHub Issue Workflow | ✅ 通过 | 10/10 |
| 角色分工流程 | ✅ 通过 | 10/10 |
| Skills 可用性 | ✅ 通过 | 9/10 |
| Artifact 生成 | ✅ 通过 | 10/10 |
| Issue 状态管理 | ✅ 通过 | 10/10 |
| 开发效率 | ✅ 通过 | 9/10 |

**总体评分**: 9.7/10

### 5.2 改进建议归类

| 类别 | 数量 | 归属 |
|------|------|------|
| 专家包核心层改进 | 2 | 专家包团队负责 |
| Plugin 层改进 | 1 | 专家包团队负责 |
| Adapter 层改进 | 1 | 专家包团队负责 |
| 项目级改进 | 2 | 具体项目团队负责 |
| 平台问题 | 2 | OpenCode 平台负责 |

### 5.3 关键洞察

1. **专家包核心层不需要关心平台差异** - 应该通过 Adapter 层隔离
2. **Plugin 是项目特异化的正确位置** - 提供技术栈特定配置
3. **项目级配置应该可覆盖默认** - 不同项目有不同需求
4. **平台问题不应归咎于专家包** - Edit/Write、Background Task 是平台行为

### 5.4 建议采纳

**建议采纳**：
- C-001, C-002（专家包核心层，定义接口和扩展机制）
- P-001（Plugin 层，完善文档）
- A-001（Adapter 层，提供平台适配模板）

**建议交给具体项目**：
- PRJ-001, PRJ-002（测试项目特定配置）

**建议反馈给平台**：
- T-001, T-002（OpenCode 平台行为）

---

**报告生成时间**: 2026-04-02  
**修订时间**: 2026-04-02  
**报告作者**: Sisyphus (OpenCode Expert Pack)  
**审核状态**: Pending Review