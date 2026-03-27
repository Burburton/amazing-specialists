# Review Rules

**Version:** 1.0.0  
**Last Updated:** 2026-03-27  
**Owner:** reviewer  
**Source:** `.opencode/skills/reviewer/code-review-checklist/SKILL.md`, `specs/006-reviewer-core/contracts/review-findings-report-contract.md`

---

## Purpose

本文件定义 reviewer 角色在代码审查过程中必须遵守的规则，确保审查独立、可执行、严重程度分类清晰、治理文档对齐检查完整。

---

## 1. 审查清单使用规则

### 1.1 审查时机

**必须审查**:
- developer 完成实现后
- bugfix 后审查
- 任何代码变更审查

**推荐审查**:
- 高风险变更额外审查
- 新人代码重点审查
- 核心模块变更审查

### 1.2 审查前准备

```
- [ ] 已读取 spec 和 design
- [ ] 已理解改动范围
- [ ] 已确定审查重点
- [ ] 已读取 self-check report 作为 hints（非 evidence）
```

### 1.3 审查清单类别

#### 1.3.1 目标对齐 (Goal Alignment)

```
- [ ] 实现是否符合 task goal？
- [ ] 是否满足 acceptance criteria？
- [ ] 是否有遗漏的需求？
- [ ] 是否有超出 scope 的功能？
- [ ] 是否与 design note 一致？
```

#### 1.3.2 范围控制 (Scope Control)

```
- [ ] 改动范围是否最小必要？
- [ ] 是否有无关改动混入？
- [ ] 删除的代码是否必要？
- [ ] 是否有临时代码未清理？
```

#### 1.3.3 功能正确性 (Correctness)

```
- [ ] 逻辑是否正确？
- [ ] 边界条件是否处理？
- [ ] 错误处理是否完整？
- [ ] 是否有明显的 bug？
- [ ] 并发/线程安全是否考虑？
```

#### 1.3.4 测试覆盖 (Test Coverage)

```
- [ ] 新增代码是否有测试？
- [ ] 修改代码是否更新测试？
- [ ] 边界条件是否测试？
- [ ] 错误路径是否测试？
- [ ] 测试是否充分？
```

#### 1.3.5 代码质量 (Code Quality)

```
- [ ] 代码是否可读？
- [ ] 命名是否清晰有意义？
- [ ] 函数/类是否单一职责？
- [ ] 复杂度是否合理？
- [ ] 是否有重复代码？
- [ ] 注释是否清晰必要？
```

#### 1.3.6 安全性 (Security)

```
- [ ] 输入是否验证？
- [ ] 输出是否转义？
- [ ] 是否有注入风险（SQL/命令/XSS）？
- [ ] 敏感数据是否加密？
- [ ] 权限是否检查？
- [ ] 是否有敏感信息泄露（密钥、密码）？
```

#### 1.3.7 性能 (Performance)

```
- [ ] 是否有明显的性能问题？
- [ ] 是否有 N+1 查询？
- [ ] 是否有不必要的计算？
- [ ] 大数据量场景是否考虑？
- [ ] 资源使用是否合理？
```

---

## 2. 审查决策分类

### 2.1 决策类型

> **对齐**: `quality-gate.md` Section 3.4

| 决策 | 定义 | 后续动作 |
|------|------|----------|
| **approve** | 所有检查通过，无阻塞问题 | 合并/进入下一阶段 |
| **reject** | 存在必须修复的问题 | 返工修复后重新审查 |
| **warn** | 功能正确但有改进空间 | 合并但建议后续优化 |

### 2.2 决策判定规则

| 条件 | 决策 |
|------|------|
| 无 blocker/major 问题 | approve |
| 存在 blocker 问题 | reject |
| 仅存在 minor/note 问题 | warn |

### 2.3 下一步动作映射

> **对齐**: `review-findings-report-contract.md`

| 动作 | 定义 | 适用场景 |
|------|------|----------|
| **accept** | 交付可接受 | approve 决策 |
| **reject** | 需要返工 | blocker 问题 |
| **request_changes** | 需要修改但非阻塞 | major 问题 |
| **escalate** | 需升级决策 | 无法判定的情况 |

---

## 3. 反馈规范（可执行反馈）

### 3.1 反馈原则

- **具体**: 问题描述具体，不模糊
- **可定位**: 提供 location 和 code snippet
- **可执行**: 提供具体修复建议
- **有依据**: 说明问题的 rationale

### 3.2 反馈结构

```yaml
issue:
  id: string              # 问题ID
  category: string        # 问题类别
  severity: enum          # blocker/major/minor/note
  description: string     # 问题描述
  location: string        # 文件位置（含行号）
  code_snippet: string    # 问题代码片段
  suggestion: string      # 修复建议
  rationale: string       # 为什么这是个问题
```

### 3.3 禁止模式

- ❌ 模糊描述（如 "需要优化"）
- ❌ 无具体位置
- ❌ 无修复建议
- ❌ "Developer verified this works"（BR-002 禁止）

### 3.4 反馈模板

**问题反馈示例**:

```yaml
- id: ISS-001
  category: 安全性
  severity: blocker
  description: "JWT Secret 硬编码在代码中"
  location: "JwtTokenService.ts:12"
  code_snippet: |
    const SECRET = 'hardcoded-secret-key-12345'
  suggestion: "从环境变量读取 JWT Secret"
  rationale: "硬编码密钥存在泄露风险，违反安全规范"
```

---

## 4. 返工规则

### 4.1 返工触发条件

| 触发条件 | 返工要求 |
|----------|----------|
| 存在 blocker 问题 | 必须返工 |
| 存在 major 问题 | 建议返工 |
| 返工次数超限 | 升级处理 |

### 4.2 返工次数限制

| 任务类型 | 最大返工次数 |
|----------|--------------|
| 普通 task | 2 次 |
| 高风险 task | 1 次 |
| 安全相关 | 1 次 |

### 4.3 返工输出要求

```yaml
rework_request:
  failed_checks: []       # 失败检查项
  required_fixes: []      # 必须修复项
  non_goals: []           # 返工范围限制
  retry_count: number     # 返工次数记录
```

---

## 5. Spec-实现对比规则

### 5.1 对比检查项

> **对齐**: `reviewer/spec-implementation-diff` skill

```
- [ ] spec 要求是否全部实现？
- [ ] 实现是否有超出 spec 的功能？
- [ ] 实现与 spec 是否有偏差？
- [ ] 偏差是否已说明原因？
```

### 5.2 实现状态分类

| 状态 | 定义 |
|------|------|
| **implemented** | 完全实现 spec 要求 |
| **partially_implemented** | 部分实现 |
| **not_implemented** | 未实现 |
| **exceeded_spec** | 超出 spec 范围 |

### 5.3 Scope Mismatch 处理

| 类型 | 处理方式 |
|------|----------|
| spec 未实现 | blocker，必须返工 |
| 超出 spec | 判断是否合理，记录决策 |
| 偏离 spec | 要求说明原因 |

---

## 6. 严重程度分类规则

> **对齐**: `quality-gate.md` Section 2.2 + `code-review-checklist/SKILL.md` BR-004

### 6.1 严重程度定义

| 级别 | 定义 | 处理要求 |
|------|------|----------|
| **blocker** | 必须修复，阻塞里程碑验收 | 列入 must_fix，决策为 reject |
| **major** | 影响下游或造成理解偏差 | 列入 should_fix，建议修复 |
| **minor** | 轻微问题，有改进空间 | 列入 consider，可选改进 |
| **note** | 信息性备注 | 记录在 positives 或 notes |

### 6.2 Blocker 分类标准

**Blocker 类型**:
- 功能不正确（核心功能失效）
- 安全漏洞（SQL注入、XSS、权限绕过）
- 严重性能问题（系统不可用）
- 数据损坏风险
- 阻碍后续工作
- **伪造验证结果**（BR-002 违规）
- **Governance 根本性冲突**（BR-006）

### 6.3 Major 分类标准

**Major 类型**:
- 代码质量问题（影响可维护性）
- 测试覆盖不足（关键路径缺失）
- 潜在 bug
- 性能隐患
- **与 canonical 文档冲突**
- **Partial gap 未披露**
- **路径声明错误**

### 6.4 S-level 映射

| 执行层 (S0-S3) | 审计层 | 审查动作 |
|----------------|--------|----------|
| S3 - Critical | blocker | must_fix |
| S2 - Major | major | should_fix |
| S1 - Minor | minor | consider |
| S0 - Trivial | note | notes |

---

## 7. 治理对齐检查规则

> **对齐**: `code-review-checklist/SKILL.md` BR-006 + `review-findings-report-contract.md`

### 7.1 治理影响范围

当代码变更影响以下内容时，必须执行治理对齐检查：

| 影响类型 | 检查要求 |
|----------|----------|
| **Role model** | 检查 `role-definition.md` |
| **Workflow** | 检查命令行为、阶段顺序 |
| **Package governance** | 检查 `package-spec.md`, `io-contract.md` |
| **Public documentation** | 检查 `README.md` 状态声明 |

### 7.2 治理对齐状态

| 状态 | 定义 | 处理方式 |
|------|------|----------|
| **aligned** | 无冲突 | 无需额外处理 |
| **drift_detected** | 轻微不一致 | 记录并建议同步 |
| **critical_drift** | 根本性冲突 | blocker，必须修复 |

### 7.3 治理冲突记录

```yaml
governance_conflicts:
  has_conflicts: boolean
  conflicts:
    - conflict_id: string
      document_1: string       # 如 "role-definition.md Section 4"
      document_2: string       # 如 "feature spec.md Section 2"
      conflict_description: string
      severity: blocker | major | minor
      resolution_recommendation: string
```

---

## 8. 与 Reviewer Skills 对齐说明

### 8.1 Skills 映射

| 规则类别 | 对齐 Skill |
|----------|------------|
| 审查清单使用规则 | `reviewer/code-review-checklist` |
| 审查决策分类 | `reviewer/code-review-checklist` |
| 反馈规范 | `reviewer/reject-with-actionable-feedback` |
| 返工规则 | `reviewer/reject-with-actionable-feedback` |
| Spec-实现对比规则 | `reviewer/spec-implementation-diff` |
| 严重程度分类规则 | `reviewer/code-review-checklist` (BR-004) |
| 治理对齐检查规则 | `reviewer/code-review-checklist` (BR-006) |

### 8.2 审查报告输出格式

遵循 `review-findings-report-contract.md` 的输出格式：

```yaml
review_findings_report:
  report_id: string
  
  review_target:
    feature_id: string
    target_type: enum
  
  summary_judgment:
    overall_assessment: enum
    overall_risk_level: enum
  
  findings_by_severity:
    blockers: []
    major: []
    minor: []
    notes: []
  
  governance_alignment_status:
    overall_status: aligned | drift_detected | critical_drift
  
  recommended_next_action:
    action: accept | reject | request_changes | escalate
```

### 8.3 审查时间建议

| 审查类型 | 建议时间 |
|----------|----------|
| 快速审查 | 10-15 分钟 |
| 标准审查 | 20-30 分钟 |
| 深度审查 | 30-60 分钟 |

> 建议审查时间 = 实现时间的 20-30%

---

## References

- `.opencode/skills/reviewer/code-review-checklist/SKILL.md` - 代码审查清单 skill
- `.opencode/skills/reviewer/spec-implementation-diff/SKILL.md` - Spec 实现对比 skill
- `.opencode/skills/reviewer/reject-with-actionable-feedback/SKILL.md` - 可执行反馈 skill
- `specs/006-reviewer-core/contracts/review-findings-report-contract.md` - 审查报告契约
- `specs/006-reviewer-core/contracts/actionable-feedback-report-contract.md` - 反馈报告契约
- `quality-gate.md` Section 2.2 - 严重程度定义
- `quality-gate.md` Section 3.4 - Reviewer Gate
- `docs/audit-hardening.md` - AH-006 治理对齐规则