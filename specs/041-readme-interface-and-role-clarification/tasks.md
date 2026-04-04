# Tasks: README 接口定位与用户角色澄清

## Feature ID
`041-readme-interface-and-role-clarification`

---

## Task Summary

| Phase | 任务数 | 预计工作量 |
|-------|--------|-----------|
| Phase 1: README.md 核心章节 | 4 | 中等 |
| Phase 2: io-contract.md 和 examples/ | 3 | 小 |
| Phase 3: 使用指南目标受众声明 | 3 | 小 |
| **总计** | **10** | **中等** |

---

## Phase 1: README.md 核心章节

### T-1.1 添加"接口定位说明"章节
**角色**: docs  
**依赖**: 无  
**状态**: PENDING

**描述**:
在 README.md "核心命令参考"章节之前添加"接口定位说明"章节，包含：
- Spec 命令 vs Adapter 接口对比表
- "大多数用户应使用 Spec 命令"的明确说明
- 系统集成者的指引

**交付物**:
- README.md 更新

**验证标准**:
- [ ] 章节位置正确（在"核心命令参考"之前）
- [ ] 对比表包含：定位、适用场景、使用者、典型入口
- [ ] "大多数用户"指引清晰可见

---

### T-1.2 添加"用户角色"章节
**角色**: docs  
**依赖**: T-1.1  
**状态**: PENDING

**描述**:
在"接口定位说明"章节之后添加"用户角色"章节，定义三种用户角色：
- 终端用户：目标、使用接口、入门文档
- 系统集成者：目标、使用接口、入门文档
- 专家包开发者：目标、使用接口、入门文档

**交付物**:
- README.md 更新

**验证标准**:
- [ ] 三种角色定义完整
- [ ] 每个角色有明确的：目标、使用接口、入门文档
- [ ] 使用 emoji 图标区分角色（🎯终端用户, 🔗系统集成者, 🔧专家包开发者）

---

### T-1.3 重构"文档导航"表
**角色**: docs  
**依赖**: T-1.2  
**状态**: PENDING

**描述**:
将 README.md 的"文档导航"表从按"新手/进阶"分类改为按用户角色分类：
- 终端用户文档列表
- 系统集成者文档列表
- 专家包开发者文档列表

**交付物**:
- README.md 更新

**验证标准**:
- [ ] 文档导航按角色分组
- [ ] 每个角色有对应的文档列表
- [ ] 所有链接正确可访问

---

### T-1.4 补充"How to Use"角色定义
**角色**: docs  
**依赖**: T-1.2  
**状态**: PENDING

**描述**:
在 README.md "How to Use"章节补充两个角色定义：
- "对于终端用户"：初始化项目、学习流程、使用命令
- "对于系统集成者"：理解契约、理解架构、选择 Adapter

**交付物**:
- README.md 更新

**验证标准**:
- [ ] 新增"对于终端用户"章节
- [ ] 新增"对于系统集成者"章节
- [ ] 位置在原有章节之前

---

## Phase 2: io-contract.md 和 examples/

### T-2.1 io-contract.md 添加目标受众声明
**角色**: docs  
**依赖**: 无  
**状态**: PENDING

**描述**:
在 io-contract.md 开头添加目标受众声明，明确说明：
- 目标受众：OpenClaw 开发者、Adapter 开发者、系统集成者
- 普通用户无需阅读本文档

**交付物**:
- io-contract.md 更新

**验证标准**:
- [ ] 开头包含目标受众声明
- [ ] 明确说明"普通用户请使用 Spec 命令"

---

### T-2.2 happy-path.md 添加说明
**角色**: docs  
**依赖**: 无  
**状态**: PENDING

**描述**:
在 examples/happy-path.md 开头添加说明：
- 这是系统内部调用流程示例
- 用户实际操作入口是 `/spec-start`
- 指引普通用户参考 minimal-example.md

**交付物**:
- examples/happy-path.md 更新

**验证标准**:
- [ ] 开头包含说明
- [ ] 指向 minimal-example.md 的链接正确

---

### T-2.3 examples/README.md 按角色分类
**角色**: docs  
**依赖**: T-2.2  
**状态**: PENDING

**描述**:
在 examples/README.md 添加"示例分类"章节，按用户角色分类示例：
- 普通用户示例：minimal-example, end-to-end-feature, role-specific
- 高级用户/系统集成者示例：happy-path, cli-workflow, local-repo-output

**交付物**:
- examples/README.md 更新

**验证标准**:
- [ ] 存在"示例分类"章节
- [ ] 分为"普通用户示例"和"高级用户/系统集成者示例"
- [ ] 每个示例有简短说明

---

## Phase 3: 使用指南目标受众声明

### T-3.1 skills-usage-guide.md 添加目标受众声明
**角色**: docs  
**依赖**: 无  
**状态**: PENDING

**描述**:
在 docs/skills-usage-guide.md 开头添加目标受众声明：
- 目标受众：终端用户、专家包开发者

**交付物**:
- docs/skills-usage-guide.md 更新

**验证标准**:
- [ ] 开头包含目标受众声明
- [ ] 格式：`> **目标受众**: 终端用户、专家包开发者`

---

### T-3.2 adapter-usage-guide.md 添加目标受众声明
**角色**: docs  
**依赖**: 无  
**状态**: PENDING

**描述**:
在 docs/adapters/adapter-usage-guide.md 开头添加目标受众声明：
- 目标受众：系统集成者

**交付物**:
- docs/adapters/adapter-usage-guide.md 更新

**验证标准**:
- [ ] 开头包含目标受众声明
- [ ] 格式：`> **目标受众**: 系统集成者`

---

### T-3.3 templates/USAGE.md 添加目标受众声明
**角色**: docs  
**依赖**: 无  
**状态**: PENDING

**描述**:
在 templates/USAGE.md 开头添加目标受众声明：
- 目标受众：终端用户

**交付物**:
- templates/USAGE.md 更新

**验证标准**:
- [ ] 开头包含目标受众声明
- [ ] 格式：`> **目标受众**: 终端用户`

---

## Verification Checklist

### 完成后检查
- [ ] 所有 Acceptance Criteria 满足
- [ ] 所有链接正确
- [ ] 格式一致
- [ ] 无拼写错误

### 验证命令
```bash
# 检查 README.md 章节结构
grep -n "^## " README.md

# 检查目标受众声明
grep -rn "目标受众" docs/ examples/ templates/

# 检查链接有效性
# (手动检查或使用工具)
```

---

## Execution Order

```
T-1.1 ──────┬──> T-1.2 ──────┬──> T-1.3
            │                │
            │                └──> T-1.4
            │
T-2.1       │
T-2.2 ──────┼──> T-2.3
            │
T-3.1       │
T-3.2       │
T-3.3 ──────┘

可并行执行: T-1.1, T-2.1, T-2.2, T-3.1, T-3.2, T-3.3
需等待依赖: T-1.2 (等待 T-1.1), T-1.3 (等待 T-1.2), T-1.4 (等待 T-1.2), T-2.3 (等待 T-2.2)
```