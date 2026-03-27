# Skill: architecture-doc-sync

## Document Metadata

| Field | Value |
|-------|-------|
| **Skill ID** | SKILL-DOC-003 |
| **Role** | docs |
| **Feature ID** | M4-docs-enhancement |
| **Version** | 1.0.0 |
| **Status** | Formal |
| **Created** | 2026-03-28 |

---

## Purpose

保证架构文档与当前实现一致，确保设计决策、模块边界、依赖关系等架构信息准确反映实际代码状态。

解决的核心问题：
- 架构文档与代码不同步
- ADR 未更新或过时
- 设计决策漂移
- 模块边界描述不准确

---

## Role Boundaries

**In Scope:**
- 更新架构图、设计文档、ADR
- 同步模块边界描述
- 更新依赖关系图
- 生成 architecture-sync-report

**Out of Scope (Explicit Prohibition):**
- ❌ 修改实现代码
- ❌ 修改架构设计（仅记录，不决策）
- ❌ 编写未实现架构的文档
- ❌ 声明架构变更完成（需上游证据）

**Boundary vs Architect:**
| 活动 | architecture-doc-sync | architect |
|------|----------------------|-----------|
| 更新架构图 | ✅ | ❌ |
| 设计模块边界 | ❌ | ✅ |
| 更新 ADR | ✅ | ❌ |
| 创建新 ADR | ❌ | ✅ |
| 记录技术决策 | ✅（记录已有决策） | ✅（做出新决策） |

---

## When to Use

**必须使用时：**
- 架构重构完成后
- 新增重要模块后
- 模块边界调整后
- 技术栈变更后
- ADR 状态需更新

**推荐使用时：**
- 每次 architect 角色完成设计后
- 发现架构文档过时
- 模块依赖关系变化

**不适用场景：**
- 纯功能实现无架构影响
- 紧急 bug 修复（事后补）
- 内部代码优化无边界变化

---

## Upstream Consumption

### Required Upstream Artifacts

| Source Role | Artifact | Required Fields for Docs |
|-------------|----------|--------------------------|
| architect | design-note | feature_goal, design_summary, architecture_changes |
| architect | tradeoff-analysis-result | options_evaluated, decision, rationale |
| developer | implementation-summary | changed_files, architecture_alignment, module_changes |
| reviewer | spec-implementation-diff-result | architecture_drift, boundary_violations |

### Consume Evidence, Not Speculate

**必须遵守：**
- 所有架构文档更新必须引用 consumed_artifacts
- 禁止基于计划或假设编写文档
- 设计决策必须引用 ADR 或 design-note

**Example of Correct Consumption:**
```yaml
consumed_artifacts:
  - artifact: design-note
    path: specs/003-architect-core/design-note.md
    fields_used: [architecture_changes, module_boundary_adjustments]
  
  - artifact: implementation-summary
    path: specs/004-developer-core/implementation-summary.md
    fields_used: [module_changes, dependency_updates]
```

---

## Business Rules Compliance

### BR-002: Minimal Surface Area Discipline

**原则：** 只更新与架构变更相关的文档，避免全文档重写。

**实施要求：**
- 每个被修改的文档必须在 touched_documents 中记录
- 每个修改必须有 change_reason
- 禁止无理由的大规模重写

### BR-003: Evidence-Based Statusing

**原则：** 架构文档状态必须基于上游证据。

**实施要求：**
- 模块状态必须匹配 implementation-summary
- ADR 状态必须匹配实际决策状态
- 禁止推测架构意图

### BR-005: Cross-Document Consistency

**原则：** 架构文档之间保持一致。

**必须检查：**
- 架构图 vs 模块边界描述
- ADR 状态 vs design-note 状态
- 依赖图 vs 实际依赖

---

## Architecture Documents

### 1. Architecture Overview
- 系统整体架构
- 核心组件关系
- 技术栈说明

### 2. Module Boundaries
- 模块职责定义
- 接口边界
- 依赖方向

### 3. Architecture Decision Records (ADR)
- 决策编号
- 决策背景
- 决策内容
- 决策状态（proposed/accepted/superseded）

### 4. Dependency Graph
- 模块依赖关系
- 外部依赖
- 版本约束

---

## Steps

### Step 1: 消费上游工件
1. 读取 design-note 获取架构变更信息
2. 读取 implementation-summary 获取实际实现状态
3. 读取 tradeoff-analysis-result 获取决策依据
4. 验证所有必需工件存在

### Step 2: 分析当前架构文档
1. 读取现有架构文档
2. 识别需要更新的部分
3. 检查过时内容
4. 识别缺失文档

### Step 3: 确定更新范围
- 哪些文档需要更新？（最小化）
- 哪些 ADR 需要更新状态？
- 哪些架构图需要更新？

### Step 4: 生成更新内容
1. 更新架构图（基于 design-note）
2. 更新模块边界描述（基于 implementation-summary）
3. 更新 ADR 状态（基于决策状态）
4. 更新依赖图（基于实际依赖）

### Step 5: 跨文档一致性检查
1. 检查架构图 vs 模块边界描述
2. 检查 ADR 状态 vs design-note 状态
3. 检查依赖图 vs 实际依赖
4. 记录发现的不一致

### Step 6: 验证同步
1. 检查所有变更已反映
2. 检查架构图可追溯
3. 检查术语一致性
4. 检查格式正确

### Step 7: 输出 architecture-sync-report
生成符合 architecture-sync-report contract 的工件

---

## Output Format (architecture-sync-report)

```yaml
architecture_sync_report:
  sync_target:
    feature_id: string
    feature_name: string
    
  consumed_artifacts:
    - artifact: string
      path: string
      fields_used: string[]
      
  touched_documents:
    - document: string
      type: architecture-overview | module-boundary | adr | dependency-graph
      status: updated | added | removed | unchanged
      change_reason: string  # 必填
      changes:
        - type: added | modified | deleted
          content: string
          
  adr_status_updates:
    - adr_id: string
      previous_status: proposed | accepted | superseded
      new_status: proposed | accepted | superseded
      evidence: string
      
  consistency_checks:
    architecture_vs_module_boundary:
      status: consistent | inconsistent
      details: string
    adr_vs_design_note:
      status: consistent | inconsistent
      details: string
    dependency_graph_vs_actual:
      status: consistent | inconsistent
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

### 示例 1：模块边界调整同步

**场景：** architect 调整了模块边界，需要同步架构文档

```yaml
architecture_sync_report:
  sync_target:
    feature_id: "003-architect-core"
    feature_name: "Architect 角色核心技能"
    
  consumed_artifacts:
    - artifact: design-note
      path: specs/003-architect-core/design-note.md
      fields_used: [module_boundary_adjustments]
    - artifact: implementation-summary
      path: specs/004-developer-core/implementation-summary.md
      fields_used: [module_changes]
      
  touched_documents:
    - document: docs/architecture/module-boundaries.md
      type: module-boundary
      status: updated
      change_reason: "模块边界调整：tester 与 reviewer 职责更清晰"
      changes:
        - type: modified
          content: "tester: 独立测试验证，生成 verification-report"
          
  adr_status_updates:
    - adr_id: "ADR-001"
      previous_status: "proposed"
      new_status: "accepted"
      evidence: "design-note.md#decision_status=accepted"
      
  consistency_checks:
    architecture_vs_module_boundary:
      status: consistent
      details: "架构图与模块边界描述一致"
      
  recommendation: sync-complete
```

---

## Checklists

### 更新前
- [ ] 上游工件已读取
- [ ] consumed_artifacts 已记录
- [ ] 当前架构文档已读取
- [ ] 更新范围已确定

### 更新中
- [ ] 架构图已更新（基于证据）
- [ ] 模块边界已同步
- [ ] ADR 状态已更新
- [ ] 依赖图已更新
- [ ] 触及文档已记录

### 更新后
- [ ] 跨文档一致性已验证
- [ ] 术语一致性已检查
- [ ] 架构图可追溯
- [ ] 无遗漏文档
- [ ] architecture-sync-report 已生成

---

## Common Failure Modes

> 详细反例见 `anti-examples/` 目录。

| 失败模式 | AP ID | 表现 | 检测方法 | 恢复策略 |
|----------|-------|------|----------|----------|
| 架构漂移忽视 | AP-101 | 架构文档未反映实际实现 | 对比 implementation-summary | 更新架构文档 |
| ADR 状态过时 | AP-102 | ADR 显示 proposed 但已实施 | 对比 design-note 状态 | 更新 ADR 状态 |
| 模块边界模糊 | AP-103 | 边界描述不清晰或冲突 | 检查边界定义一致性 | 澄清边界描述 |
| 依赖图缺失 | AP-104 | 未记录关键依赖 | 检查依赖图完整性 | 补充依赖记录 |

---

## Notes

### 与 readme-sync 的关系
- architecture-doc-sync 更新专业架构文档
- readme-sync 更新项目整体 README
- 架构变更可能触发两者

### ADR 管理
- 使用标准 ADR 格式（编号、背景、决策、状态）
- 状态变更需记录原因
- superseded 的 ADR 应链接到新 ADR

### 架构图
- 保持可追溯性
- 使用标准图示
- 标注版本和更新日期

---

## References

- `specs/003-architect-core/role-scope.md` - Architect 角色边界
- `role-definition.md` Section 1 - architect 角色定义
- `docs/architecture/` - 架构文档目录