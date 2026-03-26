# Skill: readme-sync

## Document Metadata

| Field | Value |
|-------|-------|
| **Skill ID** | SKILL-001 |
| **Role** | docs |
| **Feature ID** | 007-docs-core |
| **Version** | 2.0.0 |
| **Status** | Formal |
| **Created** | 2026-03-26 |

---

## Purpose

保证 README 与当前实现一致，让用户和开发者能获取最新的项目信息。

解决的核心问题：
- README 与代码不同步
- 新功能未文档化
- API 变更未更新
- 安装/使用说明过时

---

## Role Boundaries (BR-007)

**In Scope:**
- 更新 README 状态表、功能描述、使用说明
- 同步项目结构、依赖说明
- 生成 docs-sync-report

**Out of Scope (Explicit Prohibition):**
- ❌ 修改实现代码
- ❌ 修改测试代码
- ❌ 编写未实现功能的文档
- ❌ 声明功能完成（需上游证据）

**Boundary vs Developer:**
| 活动 | readme-sync | developer |
|------|-------------|-----------|
| 更新 README 状态表 | ✅ | ❌ |
| 编写代码注释 | ❌ | ✅ |
| 更新 API 文档（内联） | ❌ | ✅ |
| 生成变更日志 | ✅ | ❌ |

---

## When to Use

**必须使用时：**
- milestone 完成时（收到 completion-report）
- 有用户可见的功能变更
- API 变更后
- 项目结构变更后
- 检测到 README 状态漂移

**推荐使用时：**
- 每次 feature 完成后
- 发现 README 过时

**不适用场景：**
- 纯内部重构无外部影响
- 紧急修复（事后补）

---

## Upstream Consumption (BR-001)

### Required Upstream Artifacts

| Source Role | Artifact | Required Fields for Docs |
|-------------|----------|--------------------------|
| architect | design-note | feature_goal, design_summary, constraints |
| architect | open-questions | question, temporary_assumption, impact_surface |
| developer | implementation-summary | goal_alignment, changed_files, known_issues |
| developer | self-check-report | overall_status, blockers |
| developer | bugfix-report | bug_id, fix_summary, related_changes |
| tester | verification-report | confidence_level, coverage_gaps, edge_cases_checked |
| tester | regression-risk-report | risk_areas, mitigation_strategies |
| reviewer | acceptance-decision-record | decision_state, blocking_issues, acceptance_conditions |
| reviewer | review-findings-report | findings_by_severity, governance_alignment_status |
| completion | completion-report | completion_status, deliverables, known_gaps |

### BR-001 Compliance: Consume Evidence, Not Speculate

**必须遵守：**
- 所有文档更新必须引用 consumed_artifacts
- 禁止基于计划或假设编写文档
- 临时假设必须明确标注

**Example of Correct Consumption:**
```yaml
consumed_artifacts:
  - artifact: completion-report
    path: specs/007-docs-core/completion-report.md
    fields_used: [completion_status, deliverables, known_gaps]
  
  - artifact: implementation-summary
    path: specs/007-docs-core/implementation-summary.md
    fields_used: [changed_files, known_issues]
```

**Example of Incorrect (Violation):**
```yaml
# ❌ 错误：基于计划而非证据
touched_sections:
  - section: "API 文档"
    reason: "计划添加新接口"  # 应该引用实际实现的证据
```

---

## Business Rules Compliance

### BR-002: Minimal Surface Area Discipline

**原则：** 只更新与变更相关的章节，避免全文档重写。

**实施要求：**
- 每个被修改的章节必须在 touched_sections 中记录
- 每个修改必须有 change_reason
- 禁止无理由的大规模重写

**Checklist:**
- [ ] 所有 touched_sections 已列出
- [ ] 每个 section 有明确的 change_reason
- [ ] 没有修改与变更无关的章节

### BR-003: Evidence-Based Statusing

**原则：** 状态更新必须基于上游证据，禁止推测或夸大。

**实施要求：**
- 功能状态必须匹配 completion-report 或 acceptance-decision-record
- 禁止将"部分完成"标记为"完成"
- 已知缺口必须在 README 中反映

**Checklist:**
- [ ] 状态引用了 completion-report
- [ ] 已知缺口已在 README 中标注
- [ ] 没有状态夸大

### BR-004: 6-Role Terminology

**原则：** 使用正式 6-role 术语，避免 legacy 3-skill 术语。

**正确术语：**
- ✅ architect, developer, tester, reviewer, docs, security
- ❌ spec-writer, architect-auditor, task-executor (仅用于 bootstrap 兼容)

**Checklist:**
- [ ] README 中使用 6-role 术语
- [ ] 文档中无 legacy 术语残留

### BR-005: Cross-Document Consistency

**原则：** 确保 README 与其他文档状态一致。

**必须检查：**
- README 状态表 vs completion-report 状态
- README 功能描述 vs spec.md 描述
- README 已知缺口 vs completion-report known_gaps

**Checklist:**
- [ ] README 与 completion-report 状态一致
- [ ] 发现的不一致已记录在 unresolved_ambiguities
- [ ] consistency_checks 字段已填写

### BR-008: Status Truthfulness

**原则：** 诚实反映完成状态，禁止隐藏缺口。

**实施要求：**
- "基本完成但有已知缺口" ≠ "已完成"
- completion-report 中的 known_gaps 必须在 README 中反映
- 部分完成的功能必须标注进度

**Checklist:**
- [ ] 已知缺口在 README 中可见
- [ ] 部分完成标注了进度
- [ ] 没有隐藏的未完成项

---

## README Sections

### 1. Header
- 项目名称
- 一句话描述
- 徽章（版本、构建状态、许可）

### 2. 简介 (Introduction)
- 项目是什么
- 解决什么问题
- 核心特性

### 3. 安装 (Installation)
- 环境要求
- 安装步骤
- 依赖说明

### 4. 快速开始 (Quick Start)
- 最小示例
- 基本用法
- 常见场景

### 5. 功能特性 (Features)
- 主要功能列表
- 最新更新
- 路线图

### 6. API 文档 (API Documentation)
- 接口列表
- 参数说明
- 返回值说明
- 错误码

### 7. 配置 (Configuration)
- 配置项说明
- 环境变量
- 默认值

### 8. 贡献指南 (Contributing)
- 如何贡献
- 开发流程
- 提交规范

### 9. 许可 (License)
- 开源协议
- 版权声明

---

## Steps

### Step 1: 消费上游工件 (BR-001)
1. 读取 completion-report 获取完成状态
2. 读取 implementation-summary 获取变更文件列表
3. 读取 acceptance-decision-record 获取验收决定
4. 读取 verification-report 获取验证结果
5. 验证所有必需工件存在

**BR-001 Check:**
- [ ] 所有 consumed_artifacts 已记录
- [ ] 工件路径和字段已标注
- [ ] 缺失工件已记录在 unresolved_ambiguities

### Step 2: 分析当前 README
1. 读取现有 README
2. 识别需要更新的章节
3. 检查过时内容
4. 识别缺失章节

### Step 3: 确定更新范围 (BR-002)
- 哪些章节需要更新？（最小化）
- 哪些章节需要新增？
- 哪些章节可以删除？
- 哪些章节保持不变？

**BR-002 Check:**
- [ ] 更新范围最小化
- [ ] 每个更新有明确理由

### Step 4: 生成更新内容
1. 更新功能特性（基于 implementation-summary）
2. 更新 API 文档（基于实际接口）
3. 更新快速开始示例
4. 更新配置说明
5. 添加变更说明

### Step 5: 跨文档一致性检查 (BR-005)
1. 检查 README 状态 vs completion-report 状态
2. 检查 README 功能描述 vs spec.md 描述
3. 检查 README 已知缺口 vs completion-report known_gaps
4. 记录发现的不一致

**BR-005 Check:**
- [ ] 状态一致性已验证
- [ ] 不一致已记录

### Step 6: 状态真实性验证 (BR-008)
1. 验证功能状态与证据匹配
2. 确保已知缺口在 README 中反映
3. 确保没有状态夸大

**BR-008 Check:**
- [ ] 状态基于证据
- [ ] 已知缺口已标注
- [ ] 没有隐藏缺口

### Step 7: 验证同步
1. 检查所有变更已反映
2. 检查代码示例可运行
3. 检查链接有效
4. 检查格式正确
5. 检查术语一致性 (BR-004)

**BR-004 Check:**
- [ ] 使用 6-role 正式术语
- [ ] 无 legacy 术语残留

### Step 8: 输出 docs-sync-report
生成符合 docs-sync-report contract 的工件

---

## Output Format (docs-sync-report)

```yaml
docs_sync_report:
  sync_target:
    feature_id: string
    feature_name: string
    
  consumed_artifacts:  # BR-001
    - artifact: string
      path: string
      fields_used: string[]
      
  touched_sections:  # BR-002
    - section: string
      status: updated | added | removed | unchanged
      change_reason: string  # 必填
      changes:
        - type: added | modified | deleted
          content: string
          
  consistency_checks:  # BR-005
    readme_vs_completion_report:
      status: consistent | inconsistent
      details: string
    readme_vs_spec:
      status: consistent | inconsistent
      details: string
    known_gaps_reflected:
      status: reflected | not_reflected
      details: string
      
  status_updates:  # BR-003
    - item: string
      previous_status: string
      new_status: string
      evidence: string  # 引用 completion-report
      truthful: boolean  # BR-008
      
  unresolved_ambiguities:
    - item: string
      description: string
      impact: string
      recommended_action: string
      
  recommendation: sync-complete | needs-follow-up | blocked
  
  blocking_reason: string  # if blocked
  
  terminology_check:  # BR-004
    uses_6_role_terminology: boolean
    legacy_terms_found: string[]
```

---

## Examples

> 完整示例见 `examples/` 目录。

### 示例 1：Feature 完成同步

**场景：** 007-docs-core feature 完成后的 README 同步

```yaml
docs_sync_report:
  sync_target:
    feature_id: "007-docs-core"
    feature_name: "Docs 角色核心技能"
    
  consumed_artifacts:  # BR-001
    - artifact: completion-report
      path: specs/007-docs-core/completion-report.md
      fields_used: [completion_status, deliverables, known_gaps]
    - artifact: implementation-summary
      path: specs/007-docs-core/implementation-summary.md
      fields_used: [changed_files, known_issues]
    - artifact: acceptance-decision-record
      path: specs/007-docs-core/acceptance-decision-record.md
      fields_used: [decision_state, acceptance_conditions]
      
  touched_sections:  # BR-002 最小化
    - section: "Skills 清单"
      status: updated
      change_reason: "007-docs-core 完成，docs skills 从待实现改为已完成"
      changes:
        - type: modified
          content: "### Docs Skills（2个）✅ 正式实现"
          
    - section: "Project Status"
      status: updated
      change_reason: "更新 Skills 完成度统计"
      changes:
        - type: modified
          content: "| M3 - Peripheral | 4/4 | ✅ 100% |"
          
  consistency_checks:  # BR-005
    readme_vs_completion_report:
      status: consistent
      details: "README 状态与 completion-report 一致"
    readme_vs_spec:
      status: consistent
      details: "功能描述与 spec.md 一致"
    known_gaps_reflected:
      status: reflected
      details: "已知缺口已在 README 中标注"
      
  status_updates:  # BR-003, BR-008
    - item: "docs skills"
      previous_status: "待实现"
      new_status: "✅ 正式实现"
      evidence: "completion-report.md#completion_status=complete"
      truthful: true
      
  unresolved_ambiguities: []
  
  recommendation: sync-complete
  
  terminology_check:  # BR-004
    uses_6_role_terminology: true
    legacy_terms_found: []
```

### 示例 2：状态漂移检测

**场景：** README 显示"完成"但 completion-report 显示有已知缺口

```yaml
docs_sync_report:
  sync_target:
    feature_id: "006-reviewer-core"
    feature_name: "Reviewer 角色核心技能"
    
  consumed_artifacts:
    - artifact: completion-report
      path: specs/006-reviewer-core/completion-report.md
      fields_used: [completion_status, known_gaps]
      
  touched_sections:
    - section: "阶段 6：正式核心角色 Feature"
      status: updated
      change_reason: "BR-008 状态真实性：反映已知缺口"
      changes:
        - type: modified
          content: "| `006-reviewer-core` | reviewer 角色核心技能 | ⚠️ 基本完成，有已知缺口 |"
          
  consistency_checks:
    readme_vs_completion_report:
      status: inconsistent
      details: "README 显示 ✅ Complete，但 completion-report 显示有已知缺口"
    known_gaps_reflected:
      status: not_reflected
      details: "缺口：复杂场景审查覆盖不完整"
      
  status_updates:
    - item: "006-reviewer-core"
      previous_status: "✅ Complete"
      new_status: "⚠️ 基本完成，有已知缺口"
      evidence: "completion-report.md#known_gaps"
      truthful: true  # 修正后为真
      
  unresolved_ambiguities: []
  
  recommendation: sync-complete
  
  terminology_check:
    uses_6_role_terminology: true
    legacy_terms_found: []
```

### 示例 3：被阻塞的同步

**场景：** 缺失必需的上游工件

```yaml
docs_sync_report:
  sync_target:
    feature_id: "008-security-core"
    feature_name: "Security 角色核心技能"
    
  consumed_artifacts:
    - artifact: completion-report
      path: specs/008-security-core/completion-report.md
      fields_used: []
      note: "文件不存在"
      
  touched_sections: []
  
  consistency_checks:
    readme_vs_completion_report:
      status: inconsistent
      details: "无法检查：completion-report 不存在"
      
  status_updates: []
  
  unresolved_ambiguities:
    - item: "completion-report"
      description: "文件不存在"
      impact: "无法执行文档同步"
      recommended_action: "等待 feature 完成或创建工件"
      
  recommendation: blocked
  
  blocking_reason: "缺失必需上游工件：completion-report"
  
  terminology_check:
    uses_6_role_terminology: true
    legacy_terms_found: []
```

---

## Checklists

### 更新前
- [ ] 上游工件已读取 (BR-001)
- [ ] consumed_artifacts 已记录
- [ ] 当前 README 已读取
- [ ] 更新范围已确定 (BR-002)

### 更新中
- [ ] 功能特性已更新（基于证据）
- [ ] API 文档已同步
- [ ] 示例代码已验证
- [ ] 格式已检查
- [ ] 触及章节已记录 (BR-002)

### 更新后
- [ ] 跨文档一致性已验证 (BR-005)
- [ ] 状态真实性已确认 (BR-008)
- [ ] 术语一致性已检查 (BR-004)
- [ ] 链接已验证
- [ ] 示例可运行
- [ ] 无遗漏文档
- [ ] docs-sync-report 已生成

### BR Compliance Checklist
- [ ] **BR-001**: 所有更新引用了 consumed_artifacts
- [ ] **BR-002**: touched_sections 已记录，每个有 change_reason
- [ ] **BR-003**: 状态引用了 completion-report 或 acceptance-decision-record
- [ ] **BR-004**: 使用 6-role 正式术语
- [ ] **BR-005**: 完成跨文档一致性检查
- [ ] **BR-008**: 已知缺口在 README 中反映

---

## Common Failure Modes

> 详细反例见 `anti-examples/` 目录。

| 失败模式 | AP ID | 表现 | 检测方法 | 恢复策略 |
|----------|-------|------|----------|----------|
| 状态夸大 | AP-001 | README 显示"完成"但 completion-report 显示缺口 | BR-008 检查 | 恢复到证据支持的状态 |
| 过度更新 | AP-002 | 修改了与变更无关的章节 | BR-002 检查 | 回滚无关修改 |
| 漂移忽视 | AP-003 | README 未与 completion-report 对比 | BR-005 检查 | 执行完整对比 |
| Legacy 术语 | AP-004 | 使用 spec-writer 等旧术语 | BR-004 检查 | 更新到 6-role 术语 |
| 未记录变更 | AP-006 | 修改了章节但未记录原因 | BR-002 检查 | 补充 change_reason |
| 推测文档 | AP-007 | 为未实现功能编写文档 | BR-001, BR-007 检查 | 删除推测内容，添加证据引用 |

---

## Notes

### 与 changelog-writing 的关系
- readme-sync 更新项目当前状态
- changelog-writing 记录变更历史
- 两者配合使用，共享上游工件

### README 长度
- 理想长度：1-2 屏可读完
- 详细内容链接到 docs/
- 保持简洁，重点突出

### 自动化
- 示例代码应可测试
- API 文档可从代码生成
- 徽章可自动更新

### 多语言
- 主要 README 用英文
- 可添加中文 README
- 保持内容同步

---

## References

- `specs/007-docs-core/role-scope.md` - Docs 角色边界
- `specs/007-docs-core/contracts/docs-sync-report-contract.md` - 工件契约
- `specs/007-docs-core/validation/upstream-consumability-checklist.md` - 上游消费检查
- `specs/007-docs-core/validation/failure-mode-checklist.md` - 失败模式检查
- `role-definition.md` Section 5 - 正式角色定义
