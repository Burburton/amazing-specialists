# Skill: user-guide-update

## Document Metadata

| Field | Value |
|-------|-------|
| **Skill ID** | SKILL-DOC-004 |
| **Role** | docs |
| **Feature ID** | M4-docs-enhancement |
| **Version** | 1.0.0 |
| **Status** | Formal |
| **Created** | 2026-03-28 |

---

## Purpose

保证用户指南与当前实现一致，确保用户能获取最新的功能使用说明、API 文档和操作指南。

解决的核心问题：
- 用户指南与实际功能不同步
- 新功能未文档化
- API 变更未更新
- 使用示例过时或不可运行

---

## Role Boundaries

**In Scope:**
- 更新用户使用指南
- 更新 API 文档（用户视角）
- 更新操作示例和截图
- 更新 FAQ 和常见问题
- 生成 user-guide-sync-report

**Out of Scope (Explicit Prohibition):**
- ❌ 修改实现代码
- ❌ 修改测试代码
- ❌ 编写未实现功能的文档
- ❌ 声明功能可用（需上游证据）

**Boundary vs Developer:**
| 活动 | user-guide-update | developer |
|------|-------------------|-----------|
| 更新用户指南 | ✅ | ❌ |
| 编写内联 API 注释 | ❌ | ✅ |
| 更新使用示例 | ✅ | ❌ |
| 创建功能代码 | ❌ | ✅ |

---

## When to Use

**必须使用时：**
- 新功能发布后
- API 变更后
- 工作流变更后
- 用户反馈文档问题

**推荐使用时：**
- 每次 feature 完成后有用户可见变化
- 版本升级时
- 发现用户指南过时

**不适用场景：**
- 纯内部重构无用户影响
- 紧急修复（事后补）
- 管理员/开发者专用变更

---

## Upstream Consumption

### Required Upstream Artifacts

| Source Role | Artifact | Required Fields for Docs |
|-------------|----------|--------------------------|
| architect | design-note | feature_goal, user_impact, user_workflow_changes |
| developer | implementation-summary | changed_files, user_visible_changes, api_changes |
| tester | verification-report | user_workflow_verified, edge_cases_checked |
| reviewer | acceptance-decision-record | user_impact_assessment |

### Consume Evidence, Not Speculate

**必须遵守：**
- 所有用户指南更新必须引用 consumed_artifacts
- 禁止基于计划或假设编写文档
- 示例代码必须验证可运行

**Example of Correct Consumption:**
```yaml
consumed_artifacts:
  - artifact: implementation-summary
    path: specs/004-developer-core/implementation-summary.md
    fields_used: [user_visible_changes, api_changes]
  
  - artifact: verification-report
    path: specs/005-tester-core/verification-report.md
    fields_used: [user_workflow_verified]
```

---

## Business Rules Compliance

### BR-002: Minimal Surface Area Discipline

**原则：** 只更新与用户变更相关的章节，避免全文档重写。

**实施要求：**
- 每个被修改的章节必须在 touched_sections 中记录
- 每个修改必须有 change_reason
- 禁止无理由的大规模重写

### BR-003: Evidence-Based Statusing

**原则：** 功能可用性声明必须基于上游证据。

**实施要求：**
- 新功能说明必须匹配 implementation-summary
- API 文档必须匹配实际接口
- 禁止声称功能可用但未实现

### BR-005: Cross-Document Consistency

**原则：** 用户指南与其他文档保持一致。

**必须检查：**
- 用户指南 vs README 功能描述
- 用户指南 API vs 实际 API
- 用户指南示例 vs 实际代码

---

## User Guide Sections

### 1. Getting Started
- 快速入门指南
- 最小使用示例
- 环境要求

### 2. Features Overview
- 功能清单
- 功能说明
- 使用场景

### 3. API Reference
- API 端点列表
- 参数说明
- 返回值说明
- 错误码

### 4. Workflow Guides
- 操作流程
- 步骤说明
- 最佳实践

### 5. FAQ
- 常见问题
- 错误处理
- 限制说明

### 6. Examples & Tutorials
- 完整示例
- 代码片段
- 场景教程

---

## Steps

### Step 1: 消费上游工件
1. 读取 implementation-summary 获取用户可见变更
2. 读取 design-note 获取用户工作流变更
3. 读取 verification-report 获取验证结果
4. 验证所有必需工件存在

### Step 2: 分析当前用户指南
1. 读取现有用户指南
2. 识别需要更新的部分
3. 检查过时内容
4. 识别缺失章节

### Step 3: 确定用户影响范围
- 哪些功能面向用户？
- 哪些 API 变更影响用户？
- 哪些工作流变更影响用户？
- 哪些示例需要更新？

### Step 4: 生成更新内容
1. 更新功能概述（基于 implementation-summary）
2. 更新 API 文档（基于实际接口）
3. 更新工作流指南（基于 design-note）
4. 更新示例代码（基于验证结果）

### Step 5: 示例代码验证
1. 检查示例代码可运行
2. 检查参数与实际 API 一致
3. 检查输出与实际结果一致

### Step 6: 跨文档一致性检查
1. 检查用户指南 vs README 功能描述
2. 检查用户指南 API vs 实际 API
3. 检查用户指南示例 vs 实际代码
4. 记录发现的不一致

### Step 7: 输出 user-guide-sync-report
生成符合 user-guide-sync-report contract 的工件

---

## Output Format (user-guide-sync-report)

```yaml
user_guide_sync_report:
  sync_target:
    feature_id: string
    feature_name: string
    user_impact_level: low | medium | high
    
  consumed_artifacts:
    - artifact: string
      path: string
      fields_used: string[]
      
  touched_sections:
    - section: string
      status: updated | added | removed | unchanged
      change_reason: string  # 必填
      user_impact: string  # 对用户的影响描述
      changes:
        - type: added | modified | deleted
          content: string
          
  api_changes:
    - api_endpoint: string
      change_type: added | modified | deprecated | removed
      user_action_required: string  # 用户需要做什么
      evidence: string
      
  example_verification:
    - example_id: string
      verified: boolean
      verification_method: string  # 如何验证
      issues_found: string[]
      
  consistency_checks:
    user_guide_vs_readme:
      status: consistent | inconsistent
      details: string
    user_guide_api_vs_actual:
      status: consistent | inconsistent
      details: string
    examples_runnable:
      status: verified | unverified | failed
      details: string
      
  unresolved_ambiguities:
    - item: string
      description: string
      impact: string
      recommended_action: string
      
  recommendation: sync-complete | needs-follow-up | blocked
```

---

## Examples

> 完整示例见 `examples/` 目录。

### 示例 1：新功能发布同步

**场景：** 新功能发布，需要更新用户指南

```yaml
user_guide_sync_report:
  sync_target:
    feature_id: "004-developer-core"
    feature_name: "Developer 角色核心技能"
    user_impact_level: medium
    
  consumed_artifacts:
    - artifact: implementation-summary
      path: specs/004-developer-core/implementation-summary.md
      fields_used: [user_visible_changes, api_changes]
      
  touched_sections:
    - section: "Features Overview"
      status: updated
      change_reason: "新增 feature-implementation skill 说明"
      user_impact: "用户可以使用新 skill 实现功能"
      changes:
        - type: added
          content: "feature-implementation: 从 spec 到实现的工作流"
          
  api_changes:
    - api_endpoint: "/dispatch"
      change_type: added
      user_action_required: "无，新端点向后兼容"
      evidence: "implementation-summary.md#api_changes"
      
  example_verification:
    - example_id: "example-001"
      verified: true
      verification_method: "手动运行验证"
      issues_found: []
      
  consistency_checks:
    user_guide_vs_readme:
      status: consistent
      details: "功能描述一致"
      
  recommendation: sync-complete
```

---

## Checklists

### 更新前
- [ ] 上游工件已读取
- [ ] consumed_artifacts 已记录
- [ ] 用户影响范围已确定
- [ ] 更新范围已确定

### 更新中
- [ ] 功能概述已更新（基于证据）
- [ ] API 文档已同步
- [ ] 工作流指南已更新
- [ ] 示例代码已验证可运行
- [ ] 触及章节已记录

### 更新后
- [ ] 跨文档一致性已验证
- [ ] 示例代码可运行
- [ ] 用户影响已描述
- [ ] 无遗漏文档
- [ ] user-guide-sync-report 已生成

---

## Common Failure Modes

> 详细反例见 `anti-examples/` 目录。

| 失败模式 | AP ID | 表现 | 检测方法 | 恢复策略 |
|----------|-------|------|----------|----------|
| 示例代码不可运行 | AP-201 | 示例与实际 API 不匹配 | 手动运行示例 | 更新示例代码 |
| API 文档过时 | AP-202 | 文档显示旧参数 | 对比实际接口 | 同步参数说明 |
| 用户影响未描述 | AP-203 | 更新未说明用户需做什么 | 检查 user_impact 字段 | 补充影响说明 |
| 功能未实现已文档 | AP-204 | 文档描述未实现功能 | 对比 implementation-summary | 移除未实现内容 |

---

## Notes

### 与 readme-sync 的关系
- user-guide-update 更新详细用户指南
- readme-sync 更新项目 README
- 用户可见变更可能触发两者

### 版本化文档
- API 变更需标注版本
- deprecated 功能需标注替代方案
- 保持旧版本文档可访问

### 示例验证
- 所有代码示例必须可运行
- 使用 verification-report 验证
- 记录验证方法和结果

---

## References

- `specs/007-docs-core/role-scope.md` - Docs 角色边界
- `docs/user-guide/` - 用户指南目录
- `role-definition.md` Section 5 - docs 角色定义