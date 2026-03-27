# Feature Spec: 009-command-hardening

## Document Status
- **Feature ID**: `009-command-hardening`
- **Version**: 1.0.0
- **Status**: ✅ Complete
- **Created**: 2026-03-27
- **Author**: architect (via OpenCode agent)

---

## Background

README.md 定义 **阶段 5：命令固化与 Bootstrap 验证** 为"下一阶段"，目标包括：

1. 固化 5 个核心命令的输入输出格式
2. 建立统一的 artifact 模板
3. 建立规则文件（coding-rules, testing-rules, review-rules）
4. 跑通 specs/001-bootstrap 验证闭环
5. 实现 quality gate 自动化检查
6. 建立 traceability 追溯链

### 当前完成状态

| 项目 | 状态 | 说明 |
|------|------|------|
| 5 个核心命令 | ✅ 已完成 | spec-start, spec-plan, spec-tasks, spec-implement, spec-audit |
| 001-bootstrap 闭环 | ✅ 已完成 | 12 tasks 全部完成，有完整 artifacts |
| Artifact contracts | ⚠️ 部分完成 | 17 个 contract 分散在各 feature，缺少统一目录 |
| Quality-gate 定义 | ✅ 已完成 | quality-gate.md 定义完整门禁体系 |
| Audit 模板 | ✅ 已完成 | docs/templates/audit-checklist-template.md |
| **规则文件** | ❌ 缺失 | 无 coding-rules, testing-rules, review-rules |
| **统一模板目录** | ❌ 缺失 | templates 目录不完整 |
| **自动化检查规范** | ❌ 缺失 | 规范定义但缺少检查清单 |
| **追溯链方法** | ⚠️ 部分 | 各 completion-report 有 matrix，缺少统一方法 |

---

## Goal

完成阶段 5 的剩余工作，建立完整的执行层基础设施：

1. **规则文件**：建立编码、测试、审查的执行规则
2. **统一模板目录**：整理 artifact 模板，提供可复用入口
3. **自动化检查规范**：建立 quality gate 的检查清单和验证方法
4. **追溯链方法**：建立统一的 traceability 工作方法

---

## Scope

### In Scope

#### 1. 规则文件建立 (`docs/rules/`)

**coding-rules.md**：
- 代码风格规范
- 命名约定
- 错误处理规范
- 依赖管理规则
- 与 developer/code-change-selfcheck 对齐

**testing-rules.md**：
- 测试命名规范
- 测试覆盖率要求
- 测试分类（unit/integration/performance）
- 测试数据管理
- 与 tester skills 对齐

**review-rules.md**：
- 审查清单使用规则
- 审查决策分类
- 反馈规范
- 返工规则
- 与 reviewer skills 对齐

#### 2. 统一 Artifact 模板目录 (`docs/templates/`)

创建以下模板文件：

| 模板 | 来源 | 说明 |
|------|------|------|
| design-note-template.md | 基于 003-architect-core contracts | 架构设计输出模板 |
| implementation-summary-template.md | 基于 004-developer-core contracts | 实现总结模板 |
| test-report-template.md | 基于 005-tester-core contracts | 测试报告模板 |
| review-report-template.md | 基于 006-reviewer-core contracts | 审查报告模板 |
| docs-sync-report-template.md | 基于 007-docs-core contracts | 文档同步模板 |
| security-report-template.md | 基于 008-security-core contracts | 安全报告模板 |
| execution-report-template.md | 基于 common artifacts | 通用执行报告模板 |
| completion-report-template.md | 基于 feature completion reports | Feature 完成报告模板 |

#### 3. Quality Gate 自动化检查规范 (`docs/validation/`)

**quality-gate-checklist.md**：
- 通用门禁检查清单
- 角色专属检查清单整合
- 自动化验证步骤

**gate-validation-method.md**：
- 验证方法定义
- 检查执行流程
- 失败处理规则

#### 4. Traceability 追溯链方法 (`docs/traceability/`)

**traceability-method.md**：
- 追溯链定义
- 需求 → 设计 → 实现 → 测试 → 审查 映射方法
- Matrix 格式规范
- 追溯验证规则

**traceability-matrix-template.md**：
- 标准 Matrix 模板
- 使用指南

### Out of Scope

1. **不修改已有 feature contracts**
   - 003-008 的 contracts 保持原样
   - 新模板仅作为参考格式

2. **不引入新的 skills 或 roles**
   - 保持现有 6-role 模型
   - 不修改 skill 定义

3. **不实现自动化工具**
   - 仅定义规范和方法
   - 不开发 CLI 或脚本

4. **不修改命令文件**
   - `.opencode/commands/` 保持不变
   - 仅补充引用新规范的说明

5. **不创建新的 artifact 类型**
   - 仅整理现有模板

---

## Actors

| Actor | 角色 | 在此 Feature 中的职责 |
|-------|------|----------------------|
| architect | 架构师 | 设计规则文件结构、模板目录组织 |
| developer | 开发者 | 编写规则文件和模板内容 |
| reviewer | 审查员 | 审查规范一致性和完整性 |
| docs | 文档员 | 同步 README.md 阶段 5 状态 |

---

## Core Workflows

### Workflow 1: 规则文件建立

```
1. architect 定义规则文件结构
2. developer 编写 coding-rules.md（对齐 developer skills）
3. developer 编写 testing-rules.md（对齐 tester skills）
4. developer 编写 review-rules.md（对齐 reviewer skills）
5. reviewer 审查规则文件与现有 skills 的对齐
6. docs 同步 README.md 引用新规则文件
```

### Workflow 2: 统一模板目录建立

```
1. architect 分析现有 17 个 contracts
2. architect 设计模板目录结构
3. developer 创建各角色模板文件（基于 contracts）
4. developer 创建通用模板文件
5. reviewer 审查模板格式完整性
6. docs 同步 README.md templates 说明
```

### Workflow 3: Quality Gate 检查规范建立

```
1. architect 分析 quality-gate.md 检查项
2. developer 创建 quality-gate-checklist.md
3. developer 创建 gate-validation-method.md
4. reviewer 审查与 quality-gate.md 对齐
5. docs 同步 README.md validation 说明
```

### Workflow 4: Traceability 方法建立

```
1. architect 分析现有 completion-report matrix 格式
2. developer 创建 traceability-method.md
3. developer 创建 traceability-matrix-template.md
4. reviewer 审查追溯链完整性
5. docs 同步 README.md traceability 说明
```

---

## Business Rules

### BR-001: 规则文件与 Skills 对齐
规则文件内容必须与对应角色的 skill 定义对齐，不得引入新约束或修改 skill 边界。

### BR-002: 模板来源于现有 Contracts
模板文件必须基于现有 003-008 feature 的 contracts，不得发明新格式。

### BR-003: 检查规范与 Quality-Gate 对齐
quality-gate-checklist.md 必须与 quality-gate.md 的检查项完全对齐。

### BR-004: 追溯链覆盖完整生命周期
traceability method 必须覆盖：需求 → 设计 → 实现 → 测试 → 审查 → 文档 完整链条。

### BR-005: 不修改已有 Feature
新文件仅作为补充和参考，不得修改 003-008 的已有实现。

### BR-006: README 状态同步
完成时必须更新 README.md 阶段 5 状态为 "✅ 已完成"。

---

## Non-functional Requirements

### NFR-001: 文档可读性
所有规则文件和模板必须清晰可读，非专家用户也能理解使用方法。

### NFR-002: 格式一致性
所有模板文件格式保持一致，section 命名和顺序统一。

### NFR-003: 引用完整
所有模板必须引用来源 contract 和相关 skill。

### NFR-004: 版本控制
所有文件必须包含版本信息和创建日期。

---

## Acceptance Criteria

### AC-001: 规则文件完整
`docs/rules/` 目录下存在：
- coding-rules.md（至少 5 个规则 section）
- testing-rules.md（至少 5 个规则 section）
- review-rules.md（至少 5 个规则 section）

### AC-002: 模板目录完整
`docs/templates/` 目录下存在至少 8 个模板文件，覆盖 6 个角色 + 通用模板。

### AC-003: 检查规范完整
`docs/validation/` 目录下存在：
- quality-gate-checklist.md
- gate-validation-method.md

### AC-004: 追溯链方法完整
`docs/traceability/` 目录下存在：
- traceability-method.md
- traceability-matrix-template.md

### AC-005: 与现有规范对齐
所有新文件与：
- quality-gate.md 对齐（无冲突）
- role-definition.md 对齐（角色边界不变）
- 各 feature contracts 对齐（格式兼容）

### AC-006: README 同步完成
README.md 阶段 5 标记为 "✅ 已完成"，包含所有新文件的引用说明。

### AC-007: 不修改已有 Feature
003-008 feature 目录下的文件未被修改。

---

## Assumptions

### ASM-001: 现有 Contracts 格式正确
003-008 feature 的 contracts 格式已是最佳实践，可作为模板基础。

### ASM-002: Quality-Gate 定义完整
quality-gate.md 已定义了完整的检查项，仅需整理为清单格式。

### ASM-003: 追溯 Matrix 格式一致
现有 completion-report 的 traceability matrix 格式一致，可作为模板基础。

### ASM-004: 用户需求稳定
阶段 5 的范围定义是稳定的，不需要大幅调整。

---

## Open Questions

### OQ-001: 规则文件存放位置
规则文件应放在 `docs/rules/` 还是 `.opencode/rules/`？
- **推荐**: `docs/rules/`（与 templates、validation 同级）
- **理由**: 保持文档目录结构一致

### OQ-002: 模板文件命名规范
模板文件命名应使用 `-template.md` 后缀还是其他格式？
- **推荐**: 使用 `-template.md` 后缀
- **理由**: 与 audit-checklist-template.md 保持一致

### OQ-003: 检查清单自动化程度
quality-gate-checklist.md 是否需要包含自动化脚本说明？
- **推荐**: 仅定义清单，自动化脚本在后续 feature 实现
- **理由**: 本 feature 聚焦规范建立

### OQ-004: Traceability 工具需求
是否需要提供追溯链验证工具（如 CLI 命令）？
- **推荐**: 仅定义方法和模板，工具在后续 feature 实现
- **理由**: 本 feature 聚焦方法建立

---

## References

- `README.md` - 阶段 5 定义
- `quality-gate.md` - 质量门禁定义
- `role-definition.md` - 角色边界定义
- `specs/003-architect-core/contracts/` - Architect contracts
- `specs/004-developer-core/contracts/` - Developer contracts
- `specs/005-tester-core/contracts/` - Tester contracts
- `specs/006-reviewer-core/contracts/` - Reviewer contracts
- `specs/007-docs-core/contracts/` - Docs contracts
- `specs/008-security-core/contracts/` - Security contracts
- `docs/templates/audit-checklist-template.md` - 现有模板示例

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial spec creation |