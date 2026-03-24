# Skill: spec-implementation-diff

## Purpose

检查 spec / design 与 implementation 是否一致，识别偏离和遗漏，确保实现符合原始需求。

**增强职责（AH-006）**：同时检查 feature 与仓库级治理基线（canonical documents）的一致性，确保 governance alignment。

解决的核心问题：
- 实现偏离 spec 不自知
- 需求遗漏未被发现
- design 与实现不一致
- 变更未同步更新文档
- **feature 与治理基线漂移不自知（新增）**
- **跨文档状态不一致未被发现（新增）**

## When to Use

必须使用时：
- reviewer 审查实现时
- 验收前验证一致性
- 发现实现与预期不符时
- **需要 governance baseline audit 时（新增）**

推荐使用时：
- 任何代码审查时
- milestone 完成前
- 发布前最终检查

## When Not to Use

不适用场景：
- 无 spec 的快速原型
- 纯技术重构
- 已明确是设计变更
- **已明确是 governance 变更且已文档化**

## Diff Categories

### 1. 功能对齐 (Functional Alignment)

#### 1.1 需求覆盖
| 检查项 | 描述 |
|--------|------|
| 已实现 | spec 中的需求已实现 |
| 部分实现 | spec 中的需求部分实现 |
| 未实现 | spec 中的需求未实现 |
| 超出实现 | 实现了 spec 外的功能 |

#### 1.2 Acceptance Criteria
- 每个 acceptance criterion 是否满足？
- 如何验证满足？
- 是否有遗漏的 criteria？

### 2. 接口对齐 (Interface Alignment)

#### 2.1 API 契约
- 端点路径是否一致？
- 请求参数是否一致？
- 响应格式是否一致？
- 错误码是否一致？

#### 2.2 函数签名
- 函数名是否一致？
- 参数类型是否一致？
- 返回值是否一致？
- 异常类型是否一致？

### 3. 行为对齐 (Behavioral Alignment)

#### 3.1 正常行为
- happy path 行为是否一致？
- 状态转换是否一致？
- 副作用是否一致？

#### 3.2 异常行为
- 错误处理是否一致？
- 边界处理是否一致？
- 超时处理是否一致？

### 4. 数据对齐 (Data Alignment)

#### 4.1 数据结构
- 数据模型是否一致？
- 字段命名是否一致？
- 数据类型是否一致？

#### 4.2 数据约束
- 必填字段是否一致？
- 数据校验是否一致？
- 默认值是否一致？

### 5. 非功能对齐 (Non-Functional Alignment)

#### 5.1 性能
- 性能要求是否满足？
- 资源限制是否遵守？

#### 5.2 安全
- 安全要求是否满足？
- 权限控制是否一致？

#### 5.3 兼容性
- 兼容性要求是否满足？
- 向后兼容是否保持？

### 6. 治理对齐 (Governance Alignment) - NEW

#### 6.1 Canonical Document Alignment
| 检查项 | 来源文档 | 检查内容 |
|--------|----------|----------|
| 角色定义 | `role-definition.md` | Feature 中使用的角色与 canonical 一致 |
| 术语定义 | `package-spec.md` | Feature 中使用的术语与 canonical 一致 |
| 契约格式 | `io-contract.md` | Artifact/payload 格式符合 canonical |
| 严重级别 | `quality-gate.md` | 使用的 severity 与 canonical 一致 |

#### 6.2 Cross-Document Consistency
| 检查项 | 检查内容 |
|--------|----------|
| 流程顺序 | Spec → Plan → Tasks 流程一致 |
| 角色边界 | Feature 内角色描述与 canonical 一致 |
| 阶段状态 | 各文档中的 feature 状态一致 |
| 术语一致 | 同一术语在各文档中含义一致 |

#### 6.3 Path Resolution
| 检查项 | 检查内容 |
|--------|----------|
| Artifact 路径 | 声明的 artifact 路径可 resolve |
| 输出路径 | 声明的输出路径可 resolve |
| 证据路径 | 声明的证据路径可 resolve |

#### 6.4 Status Truthfulness
| 检查项 | 检查内容 |
|--------|----------|
| Completion vs README | completion-report 与 README 状态一致 |
| Gap 披露 | known gaps 在各文档中同步披露 |
| 状态分类 | 使用正确的状态分类（a/b/c） |

**References**: See `docs/audit-hardening.md` for complete governance alignment rules.

## Steps

### Step 1: 收集文档
1. 读取 spec
2. 读取 design note
3. 读取 implementation summary
4. 读取 changed_files
5. **读取 canonical governance documents（新增）**：
   - `role-definition.md`
   - `package-spec.md`
   - `io-contract.md`
   - `quality-gate.md`
6. **读取状态文档（新增）**：
   - `completion-report.md`
   - `README.md`

### Step 2: 逐条对比 (Spec vs Implementation)
对 spec 中的每条需求：
1. 在实现中查找对应
2. 对比预期 vs 实际
3. 标记一致性
4. 记录差异

### Step 3: 识别偏离
检查：
- 实现偏离 design
- 新增未设计的功能
- 遗漏设计的功能
- 简化的功能

### Step 4: 评估影响
对每项偏离：
1. 评估影响范围
2. 评估风险等级
3. 确定是否可接受
4. 记录理由

### Step 5: Governance Alignment Check (NEW)
检查 feature 与治理基线的一致性：
1. **Canonical Comparison**: Feature 与 `role-definition.md`, `package-spec.md` 等是否冲突
2. **Cross-Document Consistency**: Feature 内部各文档是否一致
3. **Path Resolution**: 所有声明路径是否可 resolve
4. **Status Truthfulness**: completion-report 与 README 是否一致

**Severity**: Governance drift findings use blocker/major/minor/note (see audit-hardening.md Section 8).

### Step 6: 生成 Diff Report
输出 spec-implementation diff report with governance findings.

## Output Format

```yaml
spec_implementation_diff:
  dispatch_id: string
  task_id: string
  
  summary:
    overall_status: aligned | partial_aligned | not_aligned
    alignment_percentage: number
    governance_status: aligned | drift_detected  # NEW
    
  spec_reference:
    spec_version: string
    design_version: string
    
  comparison:
    - category: string
      items:
        - spec_item: string
          spec_description: string
          implementation_status: implemented | partial | not_implemented | exceeded
          implementation_location: string
          alignment: aligned | deviation | gap
          
          deviation:
            type: omission | addition | modification
            description: string
            reason: string
            severity: blocker | major | minor | note  # UPDATED: use audit severity
            acceptable: boolean
            
          verification:
            method: string
            result: pass | fail | not_tested
            
  gaps:
    - gap: string
      description: string
      impact: string
      mitigation: string
      
  deviations:
    - deviation: string
      description: string
      reason: string
      impact: string
      acceptable: boolean
      requires_approval: boolean
      
  additions:
    - addition: string
      description: string
      reason: string
      in_scope: boolean
      
  verification_coverage:
    test_coverage: number
    untested_items: string[]
    
  # NEW: Governance Alignment Section
  governance_alignment:
    canonical_documents_checked:
      - role-definition.md
      - package-spec.md
      - io-contract.md
      - quality-gate.md
    
    conflicts:
      - document: string
        conflict_type: role_boundary | terminology | io_contract | severity_level
        feature_value: string
        canonical_value: string
        severity: blocker | major | minor | note
        recommendation: string
    
    cross_document_consistency:
      flow_order_aligned: boolean
      role_boundaries_aligned: boolean
      stage_status_aligned: boolean
      terminology_consistent: boolean
      issues: []
    
    path_resolution:
      paths_checked: number
      paths_resolved: number
      failures:
        - declared_path: string
          expected_location: string
          actual_location: string | null
          severity: major | minor
    
    status_truthfulness:
      completion_report_status: string
      readme_status: string
      aligned: boolean
      gaps_disclosed: boolean
      issues: []
  
  # UPDATED: Use audit severity levels
  recommendation:
    action: approve | reject | request_changes | escalate
    must_fix:  # blocker/major
      - string
    should_fix:  # minor
      - string
    acceptable_deviations:  # note
      - string
    governance_actions:  # NEW
      - action: sync_canonical | update_readme | document_drift
        description: string
```

## Examples

### 示例 1：完全对齐（含治理检查）

```yaml
spec_implementation_diff:
  summary:
    overall_status: aligned
    alignment_percentage: 100
    governance_status: aligned  # NEW
    
  comparison:
    - category: 功能需求
      items:
        - spec_item: "FR-001: 用户登录"
          spec_description: "支持用户名密码登录"
          implementation_status: implemented
          implementation_location: "AuthController.login"
          alignment: aligned
          verification:
            method: "集成测试"
            result: pass
            
  gaps: []
  deviations: []
  additions: []
  
  # NEW: Governance Alignment
  governance_alignment:
    canonical_documents_checked:
      - role-definition.md
      - package-spec.md
      - io-contract.md
      - quality-gate.md
    conflicts: []
    cross_document_consistency:
      flow_order_aligned: true
      role_boundaries_aligned: true
      stage_status_aligned: true
      terminology_consistent: true
      issues: []
    path_resolution:
      paths_checked: 5
      paths_resolved: 5
      failures: []
    status_truthfulness:
      completion_report_status: "COMPLETE"
      readme_status: "COMPLETE"
      aligned: true
      gaps_disclosed: true
      issues: []
  
  verification_coverage:
    test_coverage: 95
    untested_items: []
    
  recommendation:
    action: approve
    must_fix: []
    acceptable_deviations: []
    governance_actions: []
```

### 示例 2：治理漂移检测

```yaml
spec_implementation_diff:
  summary:
    overall_status: partial_aligned
    alignment_percentage: 85
    governance_status: drift_detected  # NEW
    
  comparison:
    - category: 功能需求
      items:
        - spec_item: "FR-001: 用户登录"
          spec_description: "支持用户名密码登录"
          implementation_status: implemented
          alignment: aligned
          
  gaps: []
  deviations: []
  additions: []
  
  # NEW: Governance Alignment with Issues
  governance_alignment:
    canonical_documents_checked:
      - role-definition.md
      - package-spec.md
      - io-contract.md
      - quality-gate.md
    
    conflicts:
      - document: "role-definition.md"
        conflict_type: "terminology"
        feature_value: "spec-writer 是正式角色"
        canonical_value: "spec-writer 是 legacy 过渡角色"
        severity: major
        recommendation: "Update feature docs to mark spec-writer as legacy"
    
    cross_document_consistency:
      flow_order_aligned: true
      role_boundaries_aligned: false  # Issue
      stage_status_aligned: false  # Issue
      terminology_consistent: true
      issues:
        - issue: "README says feature is COMPLETE, but completion-report shows PARTIAL"
          severity: major
          location: "README.md vs completion-report.md"
    
    path_resolution:
      paths_checked: 5
      paths_resolved: 4
      failures:
        - declared_path: "docs/example.md"
          expected_location: "docs/example.md"
          actual_location: null
          severity: major
    
    status_truthfulness:
      completion_report_status: "COMPLETE with known gaps (AC-003 PARTIAL)"
      readme_status: "COMPLETE"
      aligned: false
      gaps_disclosed: false
      issues:
        - issue: "README shows COMPLETE but AC-003 is PARTIAL"
          severity: major
  
  recommendation:
    action: request_changes
    must_fix:
      - "Fix README status to reflect PARTIAL (AC-003)"
      - "Fix path: docs/example.md does not exist"
    should_fix:
      - "Mark spec-writer as legacy in feature docs"
    acceptable_deviations: []
    governance_actions:
      - action: update_readme
        description: "Sync README status with completion-report"
      - action: sync_canonical
        description: "Align terminology with role-definition.md"
```

### 示例 3：严重治理冲突

```yaml
spec_implementation_diff:
  summary:
    overall_status: not_aligned
    alignment_percentage: 60
    governance_status: drift_detected
    
  comparison:
    - category: 架构
      items: []
      
  governance_alignment:
    conflicts:
      - document: "role-definition.md"
        conflict_type: "role_boundary"
        feature_value: "developer 可以修改 role-definition.md"
        canonical_value: "developer 不能修改治理文档"
        severity: blocker
        recommendation: "Revert changes to role-definition.md, use docs role"
      
      - document: "package-spec.md"
        conflict_type: "terminology"
        feature_value: "引入新的 'auditor' 角色"
        canonical_value: "6-role 模型: architect, developer, tester, reviewer, docs, security"
        severity: blocker
        recommendation: "Remove 'auditor' role, use existing reviewer + security"
    
    status_truthfulness:
      completion_report_status: "COMPLETE"
      readme_status: "COMPLETE"
      aligned: true
      gaps_disclosed: false
      issues:
        - issue: "Feature claims COMPLETE but introduces governance conflicts"
          severity: blocker
  
  recommendation:
    action: reject
    must_fix:
      - "Remove unauthorized changes to role-definition.md"
      - "Remove 'auditor' role, align with 6-role model"
      - "Document known gaps in governance alignment"
    governance_actions:
      - action: document_drift
        description: "Document governance conflicts and resolution plan"
```

## Checklists

### 对比前
- [ ] spec 已读取
- [ ] design 已读取
- [ ] implementation 已读取
- [ ] **canonical documents 已读取（新增）**
- [ ] **completion-report 已读取（新增）**
- [ ] **README 已读取（新增）**

### 对比中
- [ ] 每条需求已检查
- [ ] 偏离已识别
- [ ] 影响已评估
- [ ] 偏离已分类
- [ ] **governance alignment 已检查（新增）**
- [ ] **cross-document consistency 已检查（新增）**
- [ ] **path resolution 已验证（新增）**

### 对比后
- [ ] gap 已记录
- [ ] deviation 已评估
- [ ] 建议已生成
- [ ] 决策已明确
- [ ] **governance findings 已分级（新增）**
- [ ] **governance actions 已定义（新增）**

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 遗漏对比 | 未检查所有需求 | 使用需求跟踪表 |
| 过度宽容 | 接受严重偏离 | 明确 blocker 标准 |
| 文档滞后 | spec 未更新 | 同步更新文档 |
| 沟通不足 | 偏离未沟通 | 要求文档化理由 |
| **治理漂移漏检** | 只做 spec-implementation 对比，不做 governance check | **强制执行 AH-006 governance alignment check** |
| **状态误导未识别** | completion-report 有 gaps 但 README 显示 complete | **强制执行 AH-004 status truthfulness check** |
| **路径错误未验证** | 声明的路径不存在但未报告 | **强制执行 AH-003 path resolution check** |

## Notes

### 与 code-review-checklist 的关系
- spec-implementation-diff 检查"做什么"对齐 + governance alignment
- code-review-checklist 检查"怎么做"质量
- 两者互补

### 偏离处理原则
1. 功能偏离：通常 reject
2. 技术偏离：评估合理性
3. 扩展功能：评估 scope
4. 简化功能：评估影响
5. **governance drift：必须 report，severity >= major（新增）**

### 文档同步
偏离必须文档化：
- 偏离原因
- 偏离影响
- 批准状态
- **governance drift 需要额外的同步计划（新增）**

### 工具支持
- 需求跟踪工具
- 代码覆盖率
- API 对比工具
- **governance document diff 工具（建议新增）**

### References
- `docs/audit-hardening.md` - Complete audit hardening specification
- `quality-gate.md` Section 2.2 - Audit severity levels (blocker/major/minor/note)
- `role-definition.md` Section 4 (reviewer) - Enhanced reviewer responsibilities (AH-006)

