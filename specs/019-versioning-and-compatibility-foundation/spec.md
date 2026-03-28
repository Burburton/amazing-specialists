# Feature Spec: 019-versioning-and-compatibility-foundation

## Metadata
```yaml
feature_id: 019-versioning-and-compatibility-foundation
feature_name: 版本化与兼容性治理基础
status: Complete
created_at: 2026-03-28
priority: High
depends_on: [016-release-preparation, 017-contract-schema-pack, 018-template-and-bootstrap-foundation]
```

---

## Background

### Current State
- 专家包已达到 v1.0.0 发布状态，具备完整的 6-role 执行模型、37 skills、5 commands
- 存在 `package-lifecycle.md` 定义基础版本策略，但内容过于简单
- 存在 `templates/pack/pack-version.json` 和 `content-index.json`，但未与正式版本语义连接
- 存在 `contracts/pack/registry.json` 定义契约版本，但缺乏跨版本兼容规则
- `CHANGELOG.md` 已规范化，但缺乏结构化的版本发布流程

### Problem Statement
当前版本体系存在以下核心问题：

1. **版本对象边界不清**：package、contract、template、profile、tooling 各自独立存在，但没有明确哪个是"主版本"、哪个是"派生版本"
2. **SemVer 规则模糊**：`package-lifecycle.md` 仅有粗粒度的 MAJOR/MINOR/PATCH 定义，无法判断具体变更属于哪一级别
3. **缺少 Compatibility Matrix**：用户无法知道 "v1.0.0 minimal profile" 与 "v1.1.0 full profile" 是否兼容
4. **缺少 Migration Framework**：没有结构化的迁移指南模板和升级路径文档
5. **Release Checklist 与 Audit 脱节**：`specs/016-release-preparation/release-checklist.md` 仅为一次性检查，未与 CI/Audit 机制对接
6. **版本承诺不可验证**：声称"向后兼容"但无自动化验证手段

### Why This Feature Matters
本 Feature 将专家包从"可用的执行层"升级为"可依赖、可升级、可兼容管理的产品"，解决：
- 用户信任问题：版本号代表可承诺的接口兼容语义
- 升级风险问题：明确的迁移路径和兼容矩阵
- 维护成本问题：结构化的 release 流程与 audit 集成
- 消费者对接问题：OpenClaw、CLI、外部仓库可以程序化判断兼容性

---

## Goal

建立正式的版本化与兼容性治理体系，使版本号成为可承诺、可验证、可追溯的接口兼容语义。

### Primary Goals
1. 定义版本化对象及其边界（package、contract、template、profile、tooling）
2. 建立细粒度 SemVer 规则，明确各对象的 patch/minor/major 触发条件
3. 建立 Compatibility Matrix，明确各层之间的兼容关系
4. 建立 Migration Guide Framework，规范升级路径文档
5. 建立 Release Checklist 与 Audit/CI 对接点
6. 使版本号成为可承诺的接口兼容语义

---

## Scope

### In Scope
- **Versioning Model**：定义 5 类版本化对象及其关系
- **SemVer Rules**：为每类对象定义 patch/minor/major 触发条件
- **Compatibility Matrix**：建立版本兼容性查询表
- **Release Policy**：定义发布流程、发布节奏、发布渠道
- **Changelog Discipline**：强化 CHANGELOG 结构与语义
- **Migration Guide Framework**：建立迁移文档模板与流程
- **Docs Sync Rules**：版本变更时的文档同步义务
- **Audit/CI Integration Points**：定义版本验证接入点

### Out of Scope
- 不实现新的 adapter 或平台集成
- 不开发复杂自动化 CI 系统（仅定义接入点）
- 不创建新的功能模板或 profile
- 不重做角色模型或 command workflow
- 不扩展业务 profile 范围
- 不实现自动化兼容性检测工具（仅定义接口）

---

## Actors

| Actor | Role in This Feature |
|-------|---------------------|
| **Maintainer** | 发布新版本，执行 release checklist，编写 migration guide |
| **OpenClaw 管理层** | 消费版本信息，判断兼容性，决定是否升级 |
| **External Consumer** | 通过 registry.json 判断契约兼容性 |
| **CLI User** | 通过 pack-version.json 判断模板兼容性 |
| **Auditor** | 执行 AH-001~AH-006 检查，验证版本承诺真实性 |
| **CI System** | 在发布前执行自动化版本验证（定义接入点） |

---

## Core Workflows

### Workflow 1: Version Planning
```
Maintainer 分析变更 -> 判断变更级别 -> 更新版本号 -> 更新文档 -> 执行 release checklist
```

**Steps:**
1. 分析变更内容，确定影响哪些版本化对象
2. 根据 SemVer 规则判断变更级别（patch/minor/major）
3. 更新对应对象的版本号
4. 更新 CHANGELOG.md
5. 更新兼容性矩阵（如需要）
6. 执行 release checklist
7. 通过 audit 验证

### Workflow 2: Compatibility Query
```
Consumer 查询兼容性 -> 检查 Compatibility Matrix -> 判断升级路径 -> 读取 Migration Guide
```

**Steps:**
1. Consumer 查询当前版本与目标版本的兼容性
2. 检查 Compatibility Matrix
3. 若兼容，直接升级
4. 若不兼容或需要迁移，读取 Migration Guide
5. 执行迁移步骤

### Workflow 3: Release Gate
```
Maintainer 准备发布 -> 执行 Release Checklist -> Audit 验证 -> CI 验证 -> 发布
```

**Steps:**
1. 完成所有变更
2. 执行 release checklist（手动）
3. 触发 audit（AH-001~AH-006）
4. 触发 CI 验证（定义的接入点）
5. 发布版本
6. 更新 CHANGELOG 和兼容性矩阵

---

## Business Rules

### BR-001: Version Object Hierarchy
版本化对象之间存在层级关系：
```
Package Version (主版本)
  ├── Contract Pack Version (派生，跟随 Package)
  ├── Template Pack Version (派生，跟随 Package)
  ├── Profile Version (派生，跟随 Template Pack)
  └── Tooling Version (独立，可单独升级)
```

**规则：**
- Package Version 变更时，Contract Pack 和 Template Pack 必须同步更新
- Contract Pack 可独立 patch 级别更新（契约格式修正）
- Template Pack 可独立 minor 级别更新（新增 profile）
- Tooling 可独立升级（CLI 工具修复）

### BR-002: SemVer for Package Version
Package Version (MAJOR.MINOR.PATCH) 触发条件：

| 变更类型 | 级别 | 示例 |
|---------|------|------|
| 移除核心角色 | MAJOR | 移除 architect |
| 修改 Dispatch Payload 必填字段 | MAJOR | 删除 dispatch_id 字段 |
| 修改 Execution Result 必填字段 | MAJOR | 删除 status 字段 |
| 修改 Artifact 必需结构 | MAJOR | 删除 artifact_id |
| 删除或重命名核心 command | MAJOR | 移除 spec-audit |
| 角色职责边界重新定义 | MAJOR | 合并 developer + tester |
| 新增角色 | MINOR | 新增 performance 角色 |
| 新增 skill（向后兼容） | MINOR | 新增 migration-planning |
| 新增 command | MINOR | 新增 spec-validate |
| I/O 契约新增可选字段 | MINOR | 新增 metadata.trace_id |
| Quality gate 新增检查项 | MINOR | 新增 AH-007 |
| Skill 内容修正 | PATCH | 修正 skill.md 错字 |
| Template 格式调整 | PATCH | 调整模板换行 |
| 文档错误修复 | PATCH | README 错字修正 |

### BR-003: SemVer for Contract Pack Version
Contract Pack Version 触发条件：

| 变更类型 | 级别 | 示例 |
|---------|------|------|
| 删除契约 | MAJOR | 移除 design-note contract |
| 修改契约必填字段 | MAJOR | 删除 artifact_id |
| 修改契约字段类型 | MAJOR | status 从 enum 改为 string |
| 新增契约 | MINOR | 新增 performance-report contract |
| 新增契约可选字段 | MINOR | 新增 metadata.trace_id |
| 契约描述修正 | PATCH | 更新 contract description |

### BR-004: SemVer for Template Pack Version
Template Pack Version 触发条件：

| 变更类型 | 级别 | 示例 |
|---------|------|------|
| 移除 profile | MAJOR | 移除 minimal profile |
| 修改 profile 必需文件 | MAJOR | 删除 AGENTS.md |
| 新增 profile | MINOR | 新增 enterprise profile |
| 修改 profile 可选文件 | MINOR | 新增 docs/rules/ |
| 文件内容修正 | PATCH | 修正模板文件错字 |

### BR-005: SemVer for Profile Version
Profile Version 继承 Template Pack Version，同时跟踪：

| 变更类型 | 级别 | 示例 |
|---------|------|------|
| 移除必需 skill | MAJOR | minimal 移除 artifact-reading |
| 新增必需 skill | MINOR | minimal 新增 retry-strategy |
| Skill 版本更新 | PATCH | skill 内容修正 |

### BR-006: SemVer for Tooling Version
Tooling Version (CLI tools) 独立版本号：

| 变更类型 | 级别 | 示例 |
|---------|------|------|
| 删除 CLI 命令 | MAJOR | 移除 doctor 命令 |
| 修改 CLI 输出格式 | MAJOR | init 输出从 JSON 改为 YAML |
| 新增 CLI 命令 | MINOR | 新增 validate 命令 |
| CLI 参数新增 | MINOR | init 新增 --dry-run |
| CLI bug 修复 | PATCH | 修复 doctor 错误检测 |

### BR-007: Compatibility Matrix Structure
Compatibility Matrix 定义以下维度：

| 维度 | 说明 |
|------|------|
| Package Version | 主版本号 |
| Contract Pack Version | 契约版本 |
| Template Pack Version | 模板版本 |
| Profile | minimal / full |
| OpenClaw Version | 上游管理层版本（可选） |
| Node Version | 运行环境要求 |

**兼容性状态：**
- `compatible`: 完全兼容，无需迁移
- `compatible_with_migration`: 需要迁移步骤
- `incompatible`: 不兼容，无法直接升级

### BR-008: Changelog Discipline Enhancement
CHANGELOG.md 必须遵循以下增强规则：

1. **版本号格式严格**：必须使用 `[MAJOR.MINOR.PATCH]` 格式
2. **变更分类明确**：Added/Changed/Fixed/Deprecated/Removed/Security
3. **版本化对象标注**：每个变更必须标注影响的版本化对象
4. **Breaking Changes 披露**：必须在 Security 或 Breaking Changes 部分披露
5. **Migration Notes 链接**：如有迁移需求，必须链接到 Migration Guide

### BR-009: Migration Guide Framework
Migration Guide 必须包含：

1. **Upgrade Path**: 从哪个版本升级到哪个版本
2. **Breaking Changes**: 明确列出破坏性变更
3. **Step-by-Step Instructions**: 逐步迁移步骤
4. **Validation Steps**: 迁移后验证步骤
5. **Rollback Instructions**: 回滚步骤（如有）

### BR-010: Release Checklist Integration
Release Checklist 必须包含：

1. **文档完整性检查**：README、CHANGELOG、治理文档同步
2. **SemVer 规则验证**：变更级别判断正确性
3. **兼容性矩阵更新**：如需要，更新矩阵
4. **Migration Guide 编写**：如有迁移需求，编写指南
5. **Audit AH-001~AH-006 验证**：通过 governance audit
6. **Contract Schema 验证**：所有契约 schema 有效
7. **Template Pack 验证**：模板文件完整性

### BR-011: Docs Sync on Version Change
版本变更时必须同步以下文档：

| 文档 | 触发条件 | 同步内容 |
|------|---------|---------|
| README.md | MINOR/MAJOR | 版本号、feature 状态表 |
| package-lifecycle.md | 任意版本 | Current Version、Changelog 链接 |
| package-spec.md | MINOR/MAJOR | Skills 清单、角色定义 |
| io-contract.md | MAJOR | 契约字段变更 |
| contracts/pack/registry.json | Contract 变更 | 契约元数据 |
| templates/pack/pack-version.json | Template 变更 | 版本号 |
| templates/pack/content-index.json | Template 变更 | 文件清单 |

---

## Non-functional Requirements

### NFR-001: Version Discoverability
版本信息必须程序化可发现：
- `package-lifecycle.md` 包含 Current Version 字段
- `contracts/pack/registry.json` 包含 pack_version
- `templates/pack/pack-version.json` 包含 version

### NFR-002: Compatibility Matrix Query
兼容性矩阵必须可通过 JSON 文件程序化查询：
- 文件路径：`compatibility-matrix.json`
- 包含所有版本的兼容性关系

### NFR-003: Migration Guide Accessibility
Migration Guide 必须可通过版本号定位：
- 文件路径：`docs/migration/v{FROM}-to-v{TO}.md`
- 链接在 CHANGELOG 中提供

### NFR-004: Audit Integration
版本验证必须可接入 AH-001~AH-006 audit：
- Release Checklist 包含 audit 步骤
- Audit 输出包含版本合规性判断

### NFR-005: CI Integration Points
定义 CI 接入点（不实现）：
- `scripts/validate-version.sh`: 版本号格式验证
- `scripts/validate-compatibility.sh`: 兼容性矩阵验证
- `scripts/validate-changelog.sh`: CHANGELOG 格式验证

---

## Acceptance Criteria

### AC-001: Version Objects Defined
- [ ] 5 类版本化对象明确定义（package, contract, template, profile, tooling）
- [ ] 版本对象层级关系明确（BR-001）
- [ ] 每类对象的版本号存储位置明确

### AC-002: SemVer Rules Complete
- [ ] Package Version 触发条件完整（BR-002）
- [ ] Contract Pack Version 触发条件完整（BR-003）
- [ ] Template Pack Version 触发条件完整（BR-004）
- [ ] Profile Version 触发条件完整（BR-005）
- [ ] Tooling Version 触发条件完整（BR-006）
- [ ] 触发条件可程序化判断（有示例）

### AC-003: Compatibility Matrix Implemented
- [ ] compatibility-matrix.json 文件存在
- [ ] 包含所有当前版本的兼容性关系
- [ ] 兼容性状态定义明确（compatible, compatible_with_migration, incompatible）
- [ ] 可程序化查询

### AC-004: Migration Guide Framework Established
- [ ] Migration Guide 模板文档存在
- [ ] Migration Guide 文档命名规范明确
- [ ] 至少有一个示例 Migration Guide（v0.x-to-v1.0.md 更新）

### AC-005: Release Checklist Enhanced
- [ ] release-checklist.md 包含 SemVer 验证步骤
- [ ] release-checklist.md 包含兼容性矩阵更新步骤
- [ ] release-checklist.md 包含 Audit AH-001~AH-006 步骤
- [ ] release-checklist.md 包含 Migration Guide 编写步骤

### AC-006: Changelog Discipline Enhanced
- [ ] CHANGELOG.md 格式符合 BR-008
- [ ] 当前版本变更已标注版本化对象
- [ ] Breaking Changes 已披露

### AC-007: Docs Sync Rules Implemented
- [ ] 版本变更时的文档同步规则明确（BR-011）
- [ ] 文档同步规则接入 Audit（AH-005）

### AC-008: Audit/CI Integration Points Defined
- [ ] CI 接入点脚本路径定义（不实现）
- [ ] Audit 集成点定义明确
- [ ] 版本验证可通过 spec-audit 执行

### AC-009: Governance Alignment
- [ ] 本 Feature 不违反 role-definition.md 角色边界
- [ ] 本 Feature 使用 package-spec.md 统一术语
- [ ] 本 Feature 符合 io-contract.md 契约格式
- [ ] README.md 已更新反映本 Feature

### AC-010: Validation Complete
- [ ] 所有交付物路径可 resolve 到真实文件
- [ ] Compatibility Matrix JSON schema 有效
- [ ] Migration Guide 模板可复用

---

## Deliverables

### Primary Deliverables

| ID | Deliverable | Path | Description |
|----|-------------|------|-------------|
| D-001 | VERSIONING.md | VERSIONING.md | 版本化对象定义与 SemVer 规则总文档 |
| D-002 | compatibility-matrix.json | compatibility-matrix.json | 兼容性矩阵 JSON 文件 |
| D-003 | compatibility-matrix.schema.json | compatibility-matrix.schema.json | 兼容性矩阵 schema |
| D-004 | migration-guide-template.md | docs/migration/migration-guide-template.md | Migration Guide 模板 |
| D-005 | release-checklist-enhanced.md | docs/validation/release-checklist-enhanced.md | 增强的 Release Checklist |
| D-006 | v0-to-v1-migration.md | docs/migration/v0-to-v1.md | 更新后的 Migration Guide |

### Secondary Deliverables

| ID | Deliverable | Path | Description |
|----|-------------|------|-------------|
| D-007 | package-lifecycle.md 更新 | package-lifecycle.md | 增强 SemVer 规则部分 |
| D-008 | CHANGELOG.md 更新 | CHANGELOG.md | 添加本 Feature 条目 |
| D-009 | README.md 更新 | README.md | 添加版本化体系说明 |
| D-010 | ci-integration-points.md | docs/ci-integration-points.md | CI 接入点定义文档 |

---

## Assumptions

1. **当前版本基线**：v1.0.0 为当前稳定版本，无前置版本兼容性问题
2. **OpenClaw 版本**：暂不考虑 OpenClaw 版本兼容性（未来可扩展）
3. **Node Version**：Node >= 18.0.0 为唯一运行环境要求
4. **单 Package 模式**：当前仅支持单一专家包版本（不考虑多包并发）

---

## Open Questions

1. **多版本并发问题**：如果存在多个活跃版本（如 v1.x LTS + v2.x 新版），兼容性矩阵如何设计？
2. **预发布版本处理**：alpha/beta/rc 版本是否需要纳入兼容性矩阵？
3. **回滚版本号问题**：如果发布后发现 bug 回滚，版本号如何处理？
4. **Contract Schema 与 Package Version 关系**：Contract Schema 的 patch 级别更新是否触发 Package patch 更新？
5. **自动化 CI 范围**：本 Feature 定义的 CI 接入点是否需要在后续 Feature 中实现？

---

## References

- `package-lifecycle.md` - 当前版本策略（待增强）
- `contracts/pack/registry.json` - 契约版本定义
- `templates/pack/pack-version.json` - 模板版本定义
- `templates/pack/content-index.json` - 内容分类定义
- `specs/016-release-preparation/release-checklist.md` - 当前 Release Checklist
- `CHANGELOG.md` - 变更日志
- `docs/audit-hardening.md` - Audit 规则定义（AH-001~AH-006）
- [Semantic Versioning Specification](https://semver.org/spec/v2.0.0.html)

---

## Next Recommended Command

建议执行 `/spec-plan 019-versioning-and-compatibility-foundation` 生成实施计划。