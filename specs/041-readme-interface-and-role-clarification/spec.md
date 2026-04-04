# Feature Spec: README 接口定位与用户角色澄清

## Feature ID
`041-readme-interface-and-role-clarification`

## Background

### 问题背景
通过代码库分析发现，README.md 和相关文档存在两类接口定位混淆的问题：

1. **Spec 系列命令**（`/spec-start`, `/spec-plan` 等）与 **Adapter 接口**（Dispatch Payload / Execution Result）在文档中并列呈现，用户不知道该学习哪个
2. **用户角色**定义缺失：文档导航按"新手/进阶"分类，而非按用户角色（终端用户、系统集成者、专家包开发者）分类
3. 各使用指南缺少**目标受众声明**，用户不知道文档是否适合自己

### 影响范围
- 新用户可能误学 Adapter 接口而非 Spec 命令
- 系统集成者难以找到正确的入口文档
- 文档导航结构不符合用户心智模型

---

## Goal

**一句话目标**：在 README.md 和相关文档中清晰区分两套接口的定位，并按用户角色组织文档导航，让不同类型用户能快速找到适合自己的使用方式。

---

## Scope

### In Scope

1. **README.md 改进**
   - 添加"接口定位说明"章节，对比 Spec 命令 vs Adapter 接口
   - 添加"用户角色"章节，定义三种用户角色及其入口
   - 重构"文档导航"表，按用户角色组织
   - 在"How to Use"补充"终端用户"和"系统集成者"角色

2. **io-contract.md 改进**
   - 开头添加目标受众声明

3. **examples/ 改进**
   - `examples/happy-path.md` 开头说明这是系统内部流程示例
   - `examples/README.md` 按用户角色分类示例

4. **使用指南改进**
   - `docs/skills-usage-guide.md` 添加目标受众声明
   - `docs/adapters/adapter-usage-guide.md` 添加目标受众声明
   - `templates/USAGE.md` 添加"终端用户专属指南"声明

### Out of Scope

- 重构 `.opencode/commands/` 目录下的命令文档
- 修改 `package-spec.md` 或其他治理文档
- 创建新的使用指南文档
- 修改代码实现

---

## Actors

### 主要角色
- **终端用户**：使用 Spec 命令开发功能
- **系统集成者**：使用 Adapter 接口集成外部系统
- **专家包开发者**：开发专家包自身功能

### 次要角色
- 文档阅读者（潜在用户）

---

## Core Workflows

### 流程 1：新用户找到适合自己的入口
```
用户访问 README.md
  → 看到"接口定位说明"章节
  → 确认自己是"终端用户"
  → 跳转到 Spec 命令章节或 examples/01-quick-start/
```

### 流程 2：系统集成者找到 Adapter 文档
```
系统集成者访问 README.md
  → 看到"接口定位说明"章节
  → 确认需要"Adapter 接口"
  → 跳转到 ADAPTERS.md 或 io-contract.md
```

### 流程 3：用户判断文档是否适合自己
```
用户打开任意使用指南
  → 看到开头"目标受众"声明
  → 确认是否继续阅读或跳转其他文档
```

---

## Business Rules

### BR-001：接口定位对比表必须存在
README.md 必须包含一个对比表，清晰说明两套接口的：
- 定位（内部开发工具 vs 外部调用接口）
- 使用者（人类用户 vs 外部系统）
- 典型入口（命令 vs Payload）

### BR-002：用户角色定义必须完整
必须定义三种用户角色：
1. 终端用户
2. 系统集成者
3. 专家包开发者

### BR-003：目标受众声明格式统一
所有使用指南的目标受众声明格式：
```markdown
> **目标受众**: [角色名称]
```

### BR-004：文档导航按角色组织
文档导航表必须按用户角色分组，而非仅按熟练度分组。

---

## Non-functional Requirements

### 可读性
- 新用户能在 30 秒内确定自己属于哪种用户角色
- 对比表内容简洁，每行不超过 20 字

### 一致性
- 所有目标受众声明使用统一格式
- 术语使用一致（"终端用户"而非"普通用户"）

### 可维护性
- 章节结构清晰，便于后续扩展
- 避免重复内容，使用引用代替

---

## Acceptance Criteria

### AC-001：README.md 包含接口定位章节
- [x] 存在"接口定位说明"章节
- [x] 包含 Spec 命令 vs Adapter 接口对比表
- [x] 包含"大多数用户应使用 Spec 命令"的明确说明

### AC-002：README.md 包含用户角色章节
- [x] 存在"用户角色"章节
- [x] 定义三种用户角色（终端用户、系统集成者、专家包开发者）
- [x] 每个角色有明确的目标、使用接口、入门文档

### AC-003：README.md 文档导航按角色组织
- [x] 文档导航表按用户角色分组
- [x] 每个角色有对应的文档列表

### AC-004：io-contract.md 有目标受众声明
- [x] 开头包含目标受众声明
- [x] 明确说明"普通用户无需阅读本文档"

### AC-005：examples/happy-path.md 有说明
- [x] 开头说明这是系统内部流程示例
- [x] 指引普通用户参考 minimal-example.md

### AC-006：examples/README.md 按角色分类
- [x] 存在"普通用户示例"和"高级用户/系统集成者示例"分类
- [x] 每个示例标注适用角色

### AC-007：使用指南有目标受众声明
- [x] `docs/skills-usage-guide.md` 有目标受众声明
- [x] `docs/adapters/adapter-usage-guide.md` 有目标受众声明
- [x] `templates/USAGE.md` 有目标受众声明

---

## Assumptions

- 当前文档结构基本合理，只需添加定位说明而非重构
- 用户角色定义与实际使用场景一致
- 改进后的文档导航不会破坏现有文档的引用关系

---

## Open Questions

1. 是否需要在"30秒快速入门"中也添加角色定位说明？
2. `package-spec.md` 的 Target Users 章节是否需要同步修改？
3. 是否需要创建独立的"用户角色定义"文档供其他文档引用？

---

## Related Documents

- `README.md` - 主要修改目标
- `io-contract.md` - 需添加目标受众声明
- `examples/happy-path.md` - 需添加说明
- `examples/README.md` - 需重构
- `docs/skills-usage-guide.md` - 需添加目标受众声明
- `docs/adapters/adapter-usage-guide.md` - 需添加目标受众声明
- `templates/USAGE.md` - 需添加目标受众声明