# Implementation Plan: README 接口定位与用户角色澄清

## Feature ID
`041-readme-interface-and-role-clarification`

---

## Architecture Summary

本 feature 是**纯文档改进**，不涉及代码修改。核心策略是在关键文档中添加定位说明和目标受众声明，帮助用户快速找到适合自己的使用方式。

### 改进策略

```
                    ┌─────────────────────────────────────────┐
                    │              README.md                   │
                    │  ┌─────────────────────────────────────┐ │
                    │  │ 接口定位说明 (新增)                  │ │
                    │  │ - Spec 命令 vs Adapter 接口对比表    │ │
                    │  │ - "大多数用户应使用 Spec 命令"       │ │
                    │  └─────────────────────────────────────┘ │
                    │  ┌─────────────────────────────────────┐ │
                    │  │ 用户角色 (新增)                      │ │
                    │  │ - 终端用户 / 系统集成者 / 开发者     │ │
                    │  └─────────────────────────────────────┘ │
                    │  ┌─────────────────────────────────────┐ │
                    │  │ 文档导航 (重构)                      │ │
                    │  │ - 按用户角色分组                     │ │
                    │  └─────────────────────────────────────┘ │
                    └─────────────────────────────────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           ▼                           ▼                           ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│   io-contract.md    │   │   examples/*.md     │   │   使用指南文档       │
│   + 目标受众声明     │   │   + 分类说明         │   │   + 目标受众声明     │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

---

## Module Decomposition

### 模块 1：README.md 改进
**职责**：作为主入口文档，清晰区分接口定位和用户角色

**改动点**：
1. 在"核心命令参考"前添加"接口定位说明"章节
2. 在"核心命令参考"前添加"用户角色"章节
3. 重构"文档导航"表，按用户角色组织
4. 在"How to Use"补充"终端用户"和"系统集成者"角色

### 模块 2：io-contract.md 改进
**职责**：明确目标受众，避免普通用户误读

**改动点**：
- 在开头添加目标受众声明

### 模块 3：examples/ 改进
**职责**：帮助用户识别示例适用场景

**改动点**：
1. `happy-path.md` 开头添加说明
2. `README.md` 按用户角色分类示例

### 模块 4：使用指南改进
**职责**：各使用指南明确目标受众

**改动点**：
1. `docs/skills-usage-guide.md` 添加目标受众声明
2. `docs/adapters/adapter-usage-guide.md` 添加目标受众声明
3. `templates/USAGE.md` 添加目标受众声明

---

## Implementation Phases

### Phase 1：README.md 核心章节（优先级：High）
**预计工作量**：中等

| Task ID | 描述 | 角色 | 依赖 |
|---------|------|------|------|
| T-1.1 | 添加"接口定位说明"章节 | docs | - |
| T-1.2 | 添加"用户角色"章节 | docs | T-1.1 |
| T-1.3 | 重构"文档导航"表 | docs | T-1.2 |
| T-1.4 | 补充"How to Use"角色定义 | docs | T-1.2 |

### Phase 2：io-contract.md 和 examples/（优先级：Medium）
**预计工作量**：小

| Task ID | 描述 | 角色 | 依赖 |
|---------|------|------|------|
| T-2.1 | io-contract.md 添加目标受众声明 | docs | - |
| T-2.2 | happy-path.md 添加说明 | docs | - |
| T-2.3 | examples/README.md 按角色分类 | docs | T-2.2 |

### Phase 3：使用指南目标受众声明（优先级：Medium）
**预计工作量**：小

| Task ID | 描述 | 角色 | 依赖 |
|---------|------|------|------|
| T-3.1 | skills-usage-guide.md 添加声明 | docs | - |
| T-3.2 | adapter-usage-guide.md 添加声明 | docs | - |
| T-3.3 | templates/USAGE.md 添加声明 | docs | - |

---

## Detailed Task Breakdown

### T-1.1：添加"接口定位说明"章节

**位置**：README.md 第 46 行前（"核心命令参考"之前）

**内容模板**：
```markdown
## 接口定位说明

专家包提供**两套接口**，适用于不同场景：

| 接口类型 | 适用场景 | 使用者 | 典型入口 |
|---------|---------|--------|----------|
| **Spec 命令** | 本地开发、feature 开发流程 | 终端用户 | `/spec-start`, `/spec-plan` |
| **Adapter 接口** | 外部系统集成、管理层调度 | 系统集成者 | Dispatch Payload / Execution Result |

> **大多数用户**: 应使用 **Spec 命令**（下一节"核心命令参考"）。
> **系统集成者**: 参考 "Adapter Architecture" 章节和 `io-contract.md`。
```

**验证**：
- [ ] 章节存在且位置正确
- [ ] 对比表内容完整
- [ ] "大多数用户"指引清晰

---

### T-1.2：添加"用户角色"章节

**位置**：README.md T-1.1 之后

**内容模板**：
```markdown
## 用户角色

### 🎯 终端用户
- **目标**：使用专家包开发功能
- **使用接口**：Spec 命令（`/spec-start`, `/spec-implement` 等）
- **入门**：[examples/01-quick-start/](examples/01-quick-start/)

### 🔗 系统集成者
- **目标**：将专家包集成到外部系统（OpenClaw、GitHub Bot 等）
- **使用接口**：Adapter 接口
- **入门**：[io-contract.md](io-contract.md), [ADAPTERS.md](ADAPTERS.md)

### 🔧 专家包开发者
- **目标**：开发专家包自身的新功能/技能
- **使用接口**：Spec 命令 + 治理文档
- **入门**：[package-spec.md](package-spec.md), [role-definition.md](role-definition.md)
```

**验证**：
- [ ] 三种角色定义完整
- [ ] 每个角色有目标、接口、入门文档

---

### T-1.3：重构"文档导航"表

**位置**：README.md 第 31-43 行

**内容模板**：
```markdown
## 文档导航

### 🎯 终端用户
| 步骤 | 文档 | 用途 |
|------|------|------|
| 第一步 | 本页 [30秒快速入门](#30秒快速入门) | 初始化项目 |
| 第二步 | [examples/01-quick-start/](examples/01-quick-start/) | 最小可运行示例 |
| 第三步 | [核心命令参考](#核心命令参考) | Spec 命令详解 |
| 深入 | [docs/skills-usage-guide.md](docs/skills-usage-guide.md) | Skills 使用指南 |

### 🔗 系统集成者
| 步骤 | 文档 | 用途 |
|------|------|------|
| 第一步 | [io-contract.md](io-contract.md) | I/O 契约定义 |
| 第二步 | [ADAPTERS.md](ADAPTERS.md) | Adapter 架构 |
| 第三步 | [docs/adapters/](docs/adapters/) | 各 Adapter 使用指南 |

### 🔧 专家包开发者
| 步骤 | 文档 | 用途 |
|------|------|------|
| 第一步 | [package-spec.md](package-spec.md) | 专家包定位 |
| 第二步 | [role-definition.md](role-definition.md) | 角色边界 |
| 参考 | [specs/](specs/) | Feature 开发记录 |
```

**验证**：
- [ ] 按角色分组
- [ ] 链接正确

---

### T-1.4：补充"How to Use"角色定义

**位置**：README.md 第 329 行附近

**新增内容**：
```markdown
### 对于终端用户
1. 运行 `node templates/cli/init.js ./my-project` 初始化项目
2. 阅读 [examples/01-quick-start/](examples/01-quick-start/) 了解完整流程
3. 使用 `/spec-start`, `/spec-implement` 等命令开发功能
4. 运行 `node templates/cli/doctor.js` 进行健康检查

### 对于系统集成者
1. 阅读 [io-contract.md](io-contract.md) 理解 I/O 契约
2. 阅读 [ADAPTERS.md](ADAPTERS.md) 理解 Adapter 架构
3. 选择合适的 Orchestrator Adapter 和 Workspace Adapter
4. 使用 `contracts/pack/` 的 JSON Schema 验证数据
```

**验证**：
- [ ] 新增"终端用户"章节
- [ ] 新增"系统集成者"章节
- [ ] 位置在原有章节之前

---

### T-2.1：io-contract.md 添加目标受众声明

**位置**：io-contract.md 第 3 行后

**内容**：
```markdown
> **目标受众**: OpenClaw 开发者、Adapter 开发者、系统集成者。
> **普通用户**: 请使用 `/spec-start`, `/spec-plan` 等 Spec 命令，无需阅读本文档。
```

---

### T-2.2：happy-path.md 添加说明

**位置**：examples/happy-path.md 第 1 行后

**内容**：
```markdown
> **注意**: 本示例展示的是系统内部调用流程，用于理解架构。
> 用户实际操作入口是 `/spec-start <feature-id>`，而非手动构造 Dispatch Payload。
> 如需学习日常使用方式，请参考 [01-quick-start/minimal-example.md](01-quick-start/minimal-example.md)。
```

---

### T-2.3：examples/README.md 按角色分类

**位置**：examples/README.md 第 25 行后（"## 快速导航"之前）

**内容**：
```markdown
## 示例分类

### 普通用户示例
以下示例展示终端用户的日常使用方式：

- [01-quick-start/minimal-example.md](01-quick-start/minimal-example.md) - 使用 Spec 命令的完整流程
- [02-end-to-end-feature/](02-end-to-end-feature/) - 完整 feature 开发示例
- [03-role-specific/](03-role-specific/) - 各角色详细用法

### 高级用户/系统集成者示例
以下示例展示系统内部机制，供高级用户和系统集成者参考：

- [happy-path.md](happy-path.md) - 系统内部调用流程（理解架构）
- [cli-workflow.md](cli-workflow.md) - CLI Adapter 使用（高级）
- [local-repo-output.md](local-repo-output.md) - Workspace Adapter 使用（高级）
```

---

### T-3.1 ~ T-3.3：使用指南添加目标受众声明

**统一格式**：
```markdown
> **目标受众**: [角色列表]
```

| 文件 | 目标受众 |
|------|----------|
| `docs/skills-usage-guide.md` | 终端用户、专家包开发者 |
| `docs/adapters/adapter-usage-guide.md` | 系统集成者 |
| `templates/USAGE.md` | 终端用户 |

---

## Risks and Tradeoffs

### Risk 1：文档篇幅增加
**影响**：README.md 篇幅增加，可能影响阅读体验
**缓解**：
- 使用折叠表格保持简洁
- 新章节放在"核心命令参考"之前，用户能快速看到

### Risk 2：现有链接失效
**影响**：如果章节标题改变，外部链接可能失效
**缓解**：
- 保持章节标题稳定
- 只新增章节，不删除现有章节

### Tradeoff：文档导航按角色 vs 按熟练度
**选择**：按角色组织，但保留"新手第一步"作为快速入门
**原因**：角色维度比熟练度维度更精确

---

## Validation Plan

### 验证点 1：README.md 章节完整性
- [ ] "接口定位说明"章节存在
- [ ] "用户角色"章节存在
- [ ] 文档导航按角色分组

### 验证点 2：目标受众声明一致性
- [ ] 所有使用指南有目标受众声明
- [ ] 格式统一

### 验证点 3：链接正确性
- [ ] 文档导航中所有链接可访问
- [ ] 新增引用链接正确

---

## References

- `specs/041-readme-interface-and-role-clarification/spec.md` - 本 feature 的规格文档
- `README.md` - 主要修改目标
- `io-contract.md` - 需添加目标受众声明
- `examples/happy-path.md` - 需添加说明
- `docs/skills-usage-guide.md` - 需添加目标受众声明
- `docs/adapters/adapter-usage-guide.md` - 需添加目标受众声明
- `templates/USAGE.md` - 需添加目标受众声明