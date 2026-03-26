# Skill: changelog-writing

## Document Metadata

| Field | Value |
|-------|-------|
| **Skill ID** | SKILL-002 |
| **Role** | docs |
| **Feature ID** | 007-docs-core |
| **Version** | 2.0.0 |
| **Status** | Formal |
| **Created** | 2026-03-26 |

---

## Purpose

按结构化方式记录项目变更，让用户和开发者了解版本更新内容。

解决的核心问题：
- 变更记录缺失或不完整
- 变更描述不清晰
- 版本号管理混乱
- 无法追溯历史变更

---

## Role Boundaries (BR-007)

**In Scope:**
- 生成 changelog-entry 工件
- 分类变更类型 (feature/repair/docs-only/governance)
- 记录破坏性变更和迁移指南
- 与 readme-sync 协同工作

**Out of Scope (Explicit Prohibition):**
- ❌ 修改实现代码
- ❌ 决定版本发布时间
- ❌ 编写未发布功能的 changelog
- ❌ 隐瞒已知问题

**Boundary vs readme-sync:**
| 活动 | changelog-writing | readme-sync |
|------|-------------------|-------------|
| 记录历史变更 | ✅ | ❌ |
| 更新当前状态 | ❌ | ✅ |
| 生成 docs-sync-report | ❌ | ✅ |
| 生成 changelog-entry | ✅ | ❌ |

---

## When to Use

**必须使用时：**
- milestone 完成时（收到 completion-report）
- 版本发布时
- 有用户可见的变更时

**推荐使用时：**
- 每次 feature 完成后
- 每次 release 前

**不适用场景：**
- 纯内部重构无外部影响
- 紧急热修复（事后补）
- 未发布的功能

---

## Upstream Consumption (BR-001)

### Required Upstream Artifacts

| Source Role | Artifact | Required Fields for Changelog |
|-------------|----------|-------------------------------|
| architect | design-note | feature_goal, design_summary |
| developer | implementation-summary | goal_alignment, changed_files, known_issues |
| developer | bugfix-report | bug_id, fix_summary, related_changes |
| tester | verification-report | confidence_level, edge_cases_checked |
| reviewer | acceptance-decision-record | decision_state, acceptance_conditions |
| completion | completion-report | deliverables, known_gaps |

### BR-001 Compliance: Consume Evidence, Not Speculate

**必须遵守：**
- 所有变更条目必须引用 consumed_artifacts
- 禁止记录未实际发生的变更
- 迁移指南必须基于实际 API 变更

**Example of Correct Consumption:**
```yaml
consumed_artifacts:
  - artifact: implementation-summary
    path: specs/007-docs-core/implementation-summary.md
    fields_used: [changed_files, known_issues]
  
  - artifact: completion-report
    path: specs/007-docs-core/completion-report.md
    fields_used: [deliverables, known_gaps]
```

---

## Business Rules Compliance

### BR-006: Distinguish Change Types (Core Requirement)

**原则：** 必须区分变更类型，禁止使用模糊描述。

**四种变更类型：**

| Change Type | 含义 | 示例 |
|-------------|------|------|
| **feature** | 新功能 | 新增用户登录 |
| **repair** | Bug 修复 | 修复登录失败问题 |
| **docs-only** | 仅文档变更 | 更新 API 文档 |
| **governance** | 治理/流程变更 | 更新编码规范 |

**禁止：**
- ❌ "Various improvements and bug fixes"
- ❌ "Multiple updates"
- ❌ 未分类的变更列表

**Checklist:**
- [ ] 每个变更条目都有明确的 change_type
- [ ] 变更类型准确反映变更性质
- [ ] 没有模糊或通用的描述

### BR-002: Minimal Surface Area (Applied to Changelog)

**原则：** 只记录实际变更，不重复已有信息。

**实施要求：**
- 每个变更只记录一次
- 不重复已知信息
- 引用详细文档而非复制内容

### BR-003: Evidence-Based Changelog

**原则：** 变更记录必须基于实际实现，禁止推测。

**实施要求：**
- 变更必须引用 implementation-summary 或 bugfix-report
- 破坏性变更必须有实际 API 变更证据
- 已知限制必须来自 completion-report

### BR-008: Truthful Limitations

**原则：** 诚实记录已知限制和缺口。

**实施要求：**
- completion-report 的 known_gaps 必须在 changelog 中反映
- 破坏性变更必须披露
- 已知问题不能隐瞒

---

## Changelog Format

### 版本号 (Semantic Versioning)
```
MAJOR.MINOR.PATCH

MAJOR - 不兼容的 API 变更
MINOR - 向后兼容的功能添加
PATCH - 向后兼容的问题修复
```

### Changelog 结构

遵循 [Keep a Changelog](https://keepachangelog.com/) 规范：

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [VERSION] - YYYY-MM-DD

### feature
- 新功能描述

### repair
- Bug 修复描述

### docs-only
- 文档变更描述

### governance
- 治理/流程变更描述

### Breaking Changes
- 破坏性变更及迁移指南
```

---

## Steps

### Step 1: 消费上游工件 (BR-001)
1. 读取 completion-report 获取交付物列表
2. 读取 implementation-summary 获取变更文件和已知问题
3. 读取 acceptance-decision-record 获取验收决定
4. 读取 bugfix-report（如有）获取 bug 修复信息
5. 验证所有必需工件存在

**BR-001 Check:**
- [ ] 所有 consumed_artifacts 已记录
- [ ] 工件路径和字段已标注

### Step 2: 分类变更 (BR-006)
对每个变更：
1. 判断 change_type（feature/repair/docs-only/governance）
2. 判断是否用户可见
3. 判断是否 breaking change
4. 确定重要程度

**BR-006 Check:**
- [ ] 所有变更都有明确的 change_type
- [ ] 变更类型准确

### Step 3: 撰写条目
每个条目应包含：
1. 变更简述（一句话，具体明确）
2. 详细描述（可选，用于重要变更）
3. 关联引用（issue/PR/feature ID）
4. 迁移说明（如为 breaking change）

### Step 4: 确定版本号
根据变更确定：
- MAJOR: 有 breaking change
- MINOR: 有新功能（feature type）
- PATCH: 只有修复（repair type）

### Step 5: 诚实记录限制 (BR-008)
1. 检查 completion-report 的 known_gaps
2. 将已知缺口记录在 known_limitations 字段
3. 确保破坏性变更在 breaking_changes 字段
4. 不隐瞒已知问题

**BR-008 Check:**
- [ ] known_gaps 已反映
- [ ] 破坏性变更已披露

### Step 6: 验证格式
1. 检查格式规范（Keep a Changelog）
2. 检查版本号正确
3. 检查日期正确
4. 检查链接有效

### Step 7: 输出 changelog-entry
生成符合 changelog-entry contract 的工件

---

## Output Format (changelog-entry)

```yaml
changelog_entry:
  feature_id: string
  feature_name: string
  
  version:
    new_version: string
    previous_version: string
    bump_type: major | minor | patch
    bump_reason: string
    
  release_date: string  # YYYY-MM-DD or "Unreleased"
  
  change_type: feature | repair | docs-only | governance  # BR-006
  
  consumed_artifacts:  # BR-001
    - artifact: string
      path: string
      fields_used: string[]
      
  summary: string  # 一句话简述，必须具体明确
  
  capability_changes:  # 功能变更
    - description: string
      detail: string
      breaking: boolean
      migration: string  # if breaking
      references: string[]
      
  docs_changes:  # 文档变更
    - description: string
      detail: string
      
  validation_changes:  # 验证变更
    - description: string
      detail: string
      
  breaking_changes:  # 破坏性变更
    - change: string
      impact: string
      migration_guide: string
      references: string[]
      
  known_limitations:  # BR-008 已知限制
    - limitation: string
      impact: string
      workaround: string
      source: string  # 引用 completion-report
      
  related_features: string[]
  
  full_changelog: string  # Markdown 格式完整内容
```

---

## Examples

> 完整示例见 `examples/` 目录。

### 示例 1：Feature Release (BR-006)

**场景：** 007-docs-core feature 完成后的 changelog

```yaml
changelog_entry:
  feature_id: "007-docs-core"
  feature_name: "Docs 角色核心技能"
  
  version:
    new_version: "1.3.0"
    previous_version: "1.2.0"
    bump_type: minor
    bump_reason: "新功能：docs 角色核心技能实现"
    
  release_date: "2026-03-26"
  
  change_type: feature  # BR-006
  
  consumed_artifacts:
    - artifact: completion-report
      path: specs/007-docs-core/completion-report.md
      fields_used: [deliverables, known_gaps]
    - artifact: implementation-summary
      path: specs/007-docs-core/implementation-summary.md
      fields_used: [changed_files]
      
  summary: "实现 docs 角色核心技能：readme-sync 和 changelog-writing，包含完整 artifact contracts 和 validation layer"
  
  capability_changes:
    - description: "新增 readme-sync 正式技能"
      detail: |
        - README 文档同步能力
        - BR-001 到 BR-008 合规检查
        - docs-sync-report artifact 生成
      breaking: false
      references: ["007-docs-core"]
      
    - description: "新增 changelog-writing 正式技能"
      detail: |
        - 结构化变更日志生成
        - BR-006 变更类型区分
        - changelog-entry artifact 生成
      breaking: false
      references: ["007-docs-core"]
      
  docs_changes:
    - description: "新增 docs-sync-report contract"
      detail: "定义文档同步报告的标准格式"
    - description: "新增 changelog-entry contract"
      detail: "定义变更日志条目的标准格式"
      
  validation_changes:
    - description: "新增 upstream-consumability-checklist"
      detail: "验证上游工件消费的正确性"
    - description: "新增 downstream-consumability-checklist"
      detail: "验证下游交付的可消费性"
      
  breaking_changes: []
  
  known_limitations: []  # BR-008: 无已知缺口
  
  related_features: ["003-architect-core", "004-developer-core", "005-tester-core", "006-reviewer-core"]
  
  full_changelog: |
    ## [1.3.0] - 2026-03-26
    
    ### feature
    - 实现 docs 角色核心技能 (007-docs-core)
      - readme-sync: README 文档同步能力
      - changelog-writing: 结构化变更日志生成
      - 完整 artifact contracts 和 validation layer
```

### 示例 2：Bug Fix Release (BR-006)

**场景：** Bug 修复后的 changelog

```yaml
changelog_entry:
  feature_id: "BUGFIX-001"
  feature_name: "Login Bug Fix"
  
  version:
    new_version: "1.2.1"
    previous_version: "1.2.0"
    bump_type: patch
    bump_reason: "Bug 修复"
    
  release_date: "2026-03-26"
  
  change_type: repair  # BR-006
  
  consumed_artifacts:
    - artifact: bugfix-report
      path: specs/bugfix-001/bugfix-report.md
      fields_used: [bug_id, fix_summary]
    - artifact: implementation-summary
      path: specs/bugfix-001/implementation-summary.md
      fields_used: [changed_files]
      
  summary: "修复用户登录时的空指针异常"
  
  capability_changes: []
  
  docs_changes: []
  
  validation_changes: []
  
  breaking_changes: []
  
  known_limitations:
    - limitation: "修复仅在简单场景验证"
      impact: "复杂认证流程可能仍有问题"
      workaround: "建议使用标准认证路径"
      source: "specs/bugfix-001/completion-report.md#known_gaps"
      
  related_features: []
  
  full_changelog: |
    ## [1.2.1] - 2026-03-26
    
    ### repair
    - 修复用户登录时的空指针异常 (#110)
      - 当用户名为空时不再抛出异常，返回 400 锱误
    
    ### Known Limitations
    - 修复仅在简单场景验证，复杂认证流程可能仍有问题
```

### 示例 3：Breaking Change (BR-008)

**场景：** API 变更，需要迁移指南

```yaml
changelog_entry:
  feature_id: "008-api-v2"
  feature_name: "API v2 迁移"
  
  version:
    new_version: "2.0.0"
    previous_version: "1.5.0"
    bump_type: major
    bump_reason: "破坏性 API 变更"
    
  release_date: "2026-03-26"
  
  change_type: feature  # 包含新功能，但有 breaking change
  
  consumed_artifacts:
    - artifact: implementation-summary
      path: specs/008-api-v2/implementation-summary.md
      fields_used: [changed_files, breaking_changes]
    - artifact: completion-report
      path: specs/008-api-v2/completion-report.md
      fields_used: [known_gaps]
      
  summary: "API v2 发布，包含认证方式变更和旧版 API 移除"
  
  capability_changes:
    - description: "全新插件系统"
      detail: "支持自定义插件扩展功能"
      breaking: false
      
  breaking_changes:  # BR-008: 必须披露
    - change: "API 认证方式变更"
      impact: "所有 API 调用需要更新认证方式"
      migration_guide: |
        **旧代码：**
        ```javascript
        fetch('/api?token=xxx')
        ```
        
        **新代码：**
        ```javascript
        fetch('/api', {
          headers: { 'Authorization': 'Bearer xxx' }
        })
        ```
      references: ["docs/migration-v1-v2.md"]
      
    - change: "移除 /v1 API"
      impact: "所有 /v1 端点不再可用"
      migration_guide: "将所有 /v1 调用改为 /v2"
      references: ["docs/migration-v1-v2.md"]
      
  known_limitations:
    - limitation: "v1 到 v2 迁移工具未完成"
      impact: "需要手动迁移 API 调用"
      workaround: "参考 docs/migration-v1-v2.md"
      source: "specs/008-api-v2/completion-report.md#known_gaps"
      
  full_changelog: |
    ## [2.0.0] - 2026-03-26
    
    ### feature
    - 全新插件系统
    
    ### Breaking Changes
    - **API 认证方式变更**
      - 从 Query Parameter 改为 Header
      - 参见迁移指南: docs/migration-v1-v2.md
    - **移除 /v1 API**
      - 请使用 /v2 API
    
    ### Known Limitations
    - v1 到 v2 迁移工具未完成，需手动迁移
```

---

## Checklists

### 撰写前
- [ ] 上游工件已读取 (BR-001)
- [ ] consumed_artifacts 已记录
- [ ] 变更已分类 (BR-006)

### 撰写中
- [ ] 每个变更有明确的 change_type
- [ ] Breaking changes 已标记
- [ ] 迁移说明已添加 (如有 breaking)
- [ ] 已知限制已记录 (BR-008)

### 撰写后
- [ ] 格式符合 Keep a Changelog
- [ ] 版本号正确
- [ ] 没有模糊描述 (BR-006)
- [ ] changelog-entry 已生成

### BR Compliance Checklist
- [ ] **BR-001**: 所有变更引用了 consumed_artifacts
- [ ] **BR-002**: 只记录实际变更，不重复
- [ ] **BR-003**: 变更基于 implementation-summary 等证据
- [ ] **BR-006**: 每个变更有明确的 change_type
- [ ] **BR-008**: known_limitations 反映了 known_gaps

---

## Common Failure Modes

> 详细反例见 `anti-examples/` 目录。

| 失败模式 | AP ID | 表现 | 检测方法 | 恢复策略 |
|----------|-------|------|----------|----------|
| 模糊变更日志 | AP-005 | "Various improvements" 等模糊描述 | BR-006 检查 | 使用具体的 change_type 和描述 |
| 缺失破坏性变更 | - | Breaking change 未披露 | BR-008 检查 | 添加 breaking_changes 字段 |
| 未记录变更 | AP-006 | 有变更但无 changelog 条目 | BR-001 检查 | 补充变更条目 |
| 隐瞒已知限制 | - | known_gaps 未反映在 changelog | BR-008 检查 | 添加 known_limitations |

---

## Notes

### 与 readme-sync 的关系
- changelog-writing 记录历史变更
- readme-sync 更新当前状态
- 两者配合使用，共享上游工件

### Keep a Changelog
遵循 [Keep a Changelog](https://keepachangelog.com/) 规范：
- 按版本分组
- 使用明确的 change_type (BR-006)
- 最新版本在上
- 保留历史版本

### 版本号确定
问自己：
- 有 breaking change？→ MAJOR
- 有新功能（feature type）？→ MINOR
- 只有修复（repair type）？→ PATCH

---

## References

- `specs/007-docs-core/role-scope.md` - Docs 角色边界
- `specs/007-docs-core/contracts/changelog-entry-contract.md` - 工件契约
- `specs/007-docs-core/validation/failure-mode-checklist.md` - 失败模式检查
- `role-definition.md` Section 5 - 正式角色定义
