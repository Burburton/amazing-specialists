# Skill: code-review-checklist

## Purpose

为 reviewer 提供系统化的代码审查框架，确保审查覆盖目标对齐、范围控制、边界条件、风险识别、可维护性等关键维度。

解决的核心问题：
- 代码审查流于形式
- 审查不全面，遗漏关键问题
- 审查标准不一致
- 无法给出可执行的修改建议

## Business Rules Compliance

### BR-002: Self-Check Is Not Independent Verification
**Critical Distinction**: Developer self-check informs review but **cannot** replace reviewer verification.
- Self-check reports are hints for review focus areas, NOT evidence of correctness
- Reviewer must independently verify critical claims
- Review reports must explicitly distinguish "developer self-check claims" from "reviewer independently verified"
- Prohibited language: "Developer verified this works" → Required: "Reviewer independently verified..."
- **Role Boundary**: This skill is for **reviewer** (independent verification), not developer self-check (use `code-change-selfcheck` skill instead)

### BR-004: Severity Classification
Review findings must classify issues using the severity levels defined in `quality-gate.md`:

| Severity | Definition | Review Action |
|----------|------------|---------------|
| **blocker** | Must fix, blocks milestone acceptance | Must appear in `must_fix` list, blocks approval |
| **major** | Affects downstream or causes understanding deviation | Must appear in `should_fix` list, recommend fix |
| **minor** | Minor issue, improvement possible | Appears in `consider` list, optional |
| **note** | Informational observation | Appears in `positives` or separate notes |

**Mapping from S-levels (Execution Severity)**:
- S3 (Critical) → blocker
- S2 (Major) → major  
- S1 (Minor) → minor
- S0 (Trivial) → note

### BR-006: Governance Alignment
Review must check alignment with governance documents when code affects:
- **Role model changes** (role-definition.md boundaries)
- **Workflow changes** (command behavior, stage order)
- **Package governance** (package-spec.md, io-contract.md)
- **Public documentation** (README.md status claims)

When governance impact is detected, reviewer must:
1. Flag the governance impact in `risks` section
2. Verify changes are consistent across affected documents
3. Report governance drift as at least **major** severity

### BR-007: Honesty Over False Confidence
Review reports must honestly disclose:
- What was NOT reviewed (time constraints, complexity)
- Known gaps in coverage
- Assumptions made during review
- Areas requiring deeper analysis

## Input Specifications

### Required Upstream Artifacts
- `implementation-summary` (from developer) - Goal alignment, changed files, risks
- `self-check-report` (from developer) - Developer's own checks (hints only per BR-002)
- `design-note` (from architect, if exists) - Design specifications
- `spec.md` (feature spec) - Requirements and acceptance criteria

### Optional Upstream Artifacts
- `test-report` (from tester) - Test coverage and results
- `security-report` (from security, for high-risk changes)

## Output Specifications

### Primary Output
`review-report` artifact with:
- `overall_decision`: approve | reject | warn
- `issues` with severity classification (BR-004)
- `must_fix` list for blocker/major issues
- `recommendation_to_next` with clear next steps

### Downstream Consumers
- **developer**: Uses `must_fix` list for rework
- **docs**: Uses `positives` and issues for changelog
- **quality gate**: Uses decision for milestone acceptance

## Upstream Artifact References
- `specs/004-developer-core/contracts/implementation-summary-contract.md`
- `specs/004-developer-core/contracts/self-check-report-contract.md`
- `specs/003-architect-core/contracts/design-note-contract.md`

## Downstream Artifact References
- `specs/006-reviewer-core/contracts/review-report-contract.md`
- `quality-gate.md` Section 3.4 - Reviewer Gate

## When to Use

必须使用时：
- developer 完成实现后审查
- bugfix 后审查
- 任何代码变更审查

推荐使用时：
- 高风险变更额外审查
- 新人代码重点审查
- 核心模块变更审查

## When Not to Use

不适用场景：
- 无代码变更（纯文档/配置）
- 已通过 reviewer 的紧急修复
- 自动化工具已充分覆盖

## Review Checklist Categories

### 1. 目标对齐 (Goal Alignment)
- [ ] 实现是否符合 task goal？
- [ ] 是否满足 acceptance criteria？
- [ ] 是否有遗漏的需求？
- [ ] 是否有超出 scope 的功能？
- [ ] 是否与 design note 一致？

### 2. 范围控制 (Scope Control)
- [ ] 改动范围是否最小必要？
- [ ] 是否有无关改动混入？
- [ ] 删除的代码是否必要？
- [ ] 是否有临时代码未清理？

### 3. 功能正确性 (Correctness)
- [ ] 逻辑是否正确？
- [ ] 边界条件是否处理？
- [ ] 错误处理是否完整？
- [ ] 是否有明显的 bug？
- [ ] 并发/线程安全是否考虑？

### 4. 测试覆盖 (Test Coverage)
- [ ] 新增代码是否有测试？
- [ ] 修改代码是否更新测试？
- [ ] 边界条件是否测试？
- [ ] 错误路径是否测试？
- [ ] 测试是否充分？

### 5. 代码质量 (Code Quality)
- [ ] 代码是否可读？
- [ ] 命名是否清晰有意义？
- [ ] 函数/类是否单一职责？
- [ ] 复杂度是否合理？
- [ ] 是否有重复代码？
- [ ] 注释是否清晰必要？

### 6. 安全性 (Security)
- [ ] 输入是否验证？
- [ ] 输出是否转义？
- [ ] 是否有注入风险（SQL/命令/XSS）？
- [ ] 敏感数据是否加密？
- [ ] 权限是否检查？
- [ ] 是否有敏感信息泄露（密钥、密码）？

### 7. 性能 (Performance)
- [ ] 是否有明显的性能问题？
- [ ] 是否有 N+1 查询？
- [ ] 是否有不必要的计算？
- [ ] 大数据量场景是否考虑？
- [ ] 资源使用是否合理？

### 8. 错误处理 (Error Handling)
- [ ] 错误是否被正确处理？
- [ ] 异常是否被捕获？
- [ ] 错误信息是否清晰？
- [ ] 是否有静默失败？
- [ ] 恢复机制是否存在？

### 9. 可维护性 (Maintainability)
- [ ] 代码是否易于修改？
- [ ] 是否遵循设计模式？
- [ ] 耦合是否最小？
- [ ] 文档是否更新？
- [ ] 是否引入技术债务？

### 10. 依赖管理 (Dependencies)
- [ ] 新依赖是否必要？
- [ ] 依赖版本是否稳定？
- [ ] 是否有安全漏洞？
- [ ] 许可证是否合规？

## Steps

### Step 1: 准备审查
1. 读取 spec 和 design note
2. 读取 implementation summary
3. 了解改动范围和原因
4. 确定审查重点

### Step 2: 整体浏览
1. 浏览所有改动文件
2. 理解改动结构
3. 识别关键路径
4. 标记重点关注区域

### Step 3: 逐项检查
按照 Checklist 逐项审查：
- 每个大类
- 每个检查项
- 标记通过/失败/N/A
- 记录问题

### Step 4: 深度审查
对关键代码深入审查：
- 核心逻辑
- 复杂算法
- 边界处理
- 安全隐患

### Step 5: 问题分类 (Issue Classification - BR-004)
将发现的问题按严重程度分类：

#### Blocker (必须修复，阻塞里程碑)
- 功能不正确（核心功能失效）
- 安全漏洞（注入、泄露、权限绕过）
- 严重性能问题（系统不可用）
- 数据损坏风险
- 阻碍后续工作
- **Governance drift** (BR-006): 与 canonical 治理文档根本性冲突

#### Major (建议修复，影响下游)
- 代码质量问题（影响可维护性）
- 可维护性问题（过度复杂）
- 测试覆盖不足（关键路径缺失）
- 潜在 bug（边界条件未处理）
- 性能隐患（可能在高负载下出问题）
- **Partial gap 未披露** (BR-006): completion-report 与实际不一致

#### Minor (可选改进)
- 风格建议
- 优化建议
- 更好的写法
- 文档建议
- 轻微术语不统一

#### Note (信息性)
- 值得表扬的写法
- 观察性建议
- 背景信息补充

### Step 6: Governance Alignment Check (BR-006)
检查代码变更是否影响治理层：

1. **Role Boundary Check**: 代码是否改变角色边界？
2. **Workflow Check**: 代码是否改变命令行为或阶段顺序？
3. **Documentation Sync Check**: 是否需要同步更新 README.md / AGENTS.md？

如发现问题，在 `risk_assessment` 中添加 governance 风险项。

### Step 7: 生成 Review Report
输出 review report

## Output Format

```yaml
review_report:
  dispatch_id: string
  task_id: string
  reviewer: string
  timestamp: string
  
  # BR-002 Compliance: Distinguish self-check from independent verification
  self_check_acknowledged:
    status: string  # "Developer claims X/Y checks passed"
    use: string     # "Hints for review focus, NOT evidence"
  
  summary:
    overall_decision: approve | reject | warn
    decision_reason: string
    
  checklist_summary:
    total_checks: number
    passed: number
    failed: number
    na: number
    
    by_category:
      - category: string
        passed: number
        failed: number
        
  # BR-004 Compliance: Severity classification required
  issues:
    - id: string
      category: string
      severity: blocker | major | minor | note  # BR-004 compliant
      type: correctness | security | performance | quality | test | documentation | governance
      description: string
      location: string
      code_snippet: string
      suggestion: string
      rationale: string
      br_002_verification: string  # How reviewer independently verified
      
  positives:
    - description: string
      location: string
      
  recommendations:
    must_fix: string[]      # blocker issues only
    should_fix: string[]    # major issues
    consider: string[]      # minor issues
    
  follow_up:
    - item: string
      owner: string
      due_date: string
      
  # BR-006 Compliance: Governance alignment risks
  risk_assessment:
    risks:
      - risk: string
        level: high | medium | low
        mitigation: string
        governance_impact: boolean  # BR-006: Does this affect governance docs?
        
  # BR-007 Compliance: Honest disclosure
  review_coverage:
    files_reviewed: string[]
    files_not_reviewed: string[]
    not_reviewed_reason: string
    assumptions_made: string[]
    
  recommendation_to_next:
    action: approve | reject | request_changes | escalate
    next_steps: string[]
```

## Examples

> **Note**: Complete examples with step-by-step walkthroughs are available in `examples/` directory.
> See `examples/example-001-feature-code-review.md` and `examples/example-002-bugfix-code-review.md`.

### 示例 1：Approve Review

```yaml
review_report:
  summary:
    overall_decision: approve
    decision_reason: "代码质量良好，符合设计要求，测试覆盖充分"
    
  checklist_summary:
    total_checks: 30
    passed: 30
    failed: 0
    na: 0
    
    by_category:
      - category: 目标对齐
        passed: 3
        failed: 0
      - category: 功能正确性
        passed: 5
        failed: 0
      - category: 代码质量
        passed: 5
        failed: 0
      - category: 测试覆盖
        passed: 4
        failed: 0
      - category: 安全性
        passed: 4
        failed: 0
      - category: 性能
        passed: 3
        failed: 0
        
  issues: []
  
  positives:
    - description: "清晰的错误处理，每个错误路径都有对应处理"
      location: "AuthService.ts:45-60"
    - description: "良好的命名，函数名清晰表达意图"
      location: "AuthController.ts"
    - description: "充分的测试覆盖，包括边界条件"
      location: "auth.test.ts"
      
  recommendations:
    must_fix: []
    should_fix: []
    consider:
      - "可以考虑将验证逻辑提取为独立函数（可选优化）"
      
  recommendation_to_next:
    action: approve
    next_steps:
      - "可以合并到主分支"
      - "进入下一阶段"
```

### 示例 2：Reject Review

```yaml
review_report:
  summary:
    overall_decision: reject
    decision_reason: "存在必须修复的安全问题和功能缺陷"
    
  checklist_summary:
    total_checks: 30
    passed: 25
    failed: 3
    na: 2
    
  issues:
    - id: ISS-001
      category: 安全性
      severity: blocker
      type: security
      description: "JWT Secret 硬编码在代码中"
      location: "JwtTokenService.ts:12"
      code_snippet: |
        const SECRET = 'hardcoded-secret-key-12345'
      suggestion: "从环境变量读取 JWT Secret"
      rationale: "硬编码密钥存在泄露风险，违反安全规范"
      
    - id: ISS-002
      category: 安全性
      severity: blocker
      type: security
      description: "未验证用户名输入，存在 SQL 注入风险"
      location: "AuthService.ts:25"
      code_snippet: |
        const user = await db.query(`SELECT * FROM users WHERE username = '${username}'`)
      suggestion: "使用参数化查询"
      code_example: |
        const user = await db.query('SELECT * FROM users WHERE username = ?', [username])
      rationale: "字符串拼接 SQL 存在注入风险"
      
    - id: ISS-003
      category: 功能正确性
      severity: blocker
      type: correctness
      description: "密码错误时仍返回用户信息"
      location: "AuthService.ts:45"
      code_snippet: |
        if (!passwordValid) {
          return { error: 'Invalid password', user: user }
        }
      suggestion: "密码错误时不返回用户信息"
      rationale: "密码错误时返回用户信息泄露了用户存在性"
      
    - id: ISS-004
      category: 测试覆盖
      severity: warning
      type: test
      description: "缺少错误路径的测试"
      location: "auth.test.ts"
      suggestion: "添加密码错误、用户不存在等场景的测试"
      
  recommendations:
    must_fix:
      - "修复 SQL 注入风险（ISS-002）"
      - "移除硬编码密钥（ISS-001）"
      - "修复密码错误返回用户信息（ISS-003）"
    should_fix:
      - "补充错误路径测试（ISS-004）"
    consider: []
    
  risk_assessment:
    risks:
      - risk: "安全漏洞可能导致数据泄露"
        level: high
        mitigation: "修复后重新审查"
        
  recommendation_to_next:
    action: reject
    next_steps:
      - "修复所有 blocker 级别问题"
      - "提交修改后重新审查"
      - "建议修复后 security review"
```

### 示例 3：Warn Review

```yaml
review_report:
  summary:
    overall_decision: warn
    decision_reason: "功能正确但有改进空间，非阻塞问题可后续处理"
    
  checklist_summary:
    total_checks: 30
    passed: 27
    failed: 0
    na: 3
    
  issues:
    - id: ISS-001
      category: 代码质量
      severity: warning
      type: quality
      description: "函数过长（超过 50 行）"
      location: "AuthService.ts:30-85"
      suggestion: "拆分为多个小函数"
      
    - id: ISS-002
      category: 可维护性
      severity: suggestion
      type: quality
      description: "魔法数字硬编码"
      location: "AuthService.ts:45"
      code_snippet: |
        if (failedAttempts >= 5) {
      suggestion: "提取为常量 MAX_FAILED_ATTEMPTS"
      
  recommendations:
    must_fix: []
    should_fix:
      - "考虑拆分长函数（ISS-001）"
    consider:
      - "提取魔法数字为常量（ISS-002）"
      
  recommendation_to_next:
    action: approve
    next_steps:
      - "可以合并，但建议后续优化"
      - "创建技术债务 ticket 跟踪改进项"
```

## Severity Guidelines (BR-004 Compliance)

> **Reference**: `quality-gate.md` Section 2.2 - Audit Severity Levels

### Blocker (必须修复)
**Definition**: 必须修复，否则阻塞里程碑验收

**Examples**:
- 功能不正确（核心功能失效）
- 安全漏洞（SQL注入、XSS、权限绕过）
- 严重性能问题（系统不可用）
- 数据损坏风险
- 阻碍后续工作
- **伪造验证结果** (BR-002 violation)
- **Governance 根本性冲突** (BR-006)

**Action**: 必须修复，列入 `must_fix`，决策为 reject

### Major (建议修复)
**Definition**: 影响下游工作，或造成理解偏差

**Examples**:
- 代码质量问题（影响可维护性）
- 可维护性问题（过度复杂）
- 测试覆盖不足（关键路径缺失）
- 潜在 bug
- 性能隐患
- **与 canonical 文档冲突** (BR-006)
- **Partial gap 未披露** (BR-006)
- **路径声明错误** (BR-006)

**Action**: 建议修复，列入 `should_fix`

### Minor (可选)
**Definition**: 轻微问题，有改进空间

**Examples**:
- 风格建议
- 优化建议
- 更好的写法
- 文档建议
- 轻微术语不统一

**Action**: 可选改进，列入 `consider`

### Note (信息性)
**Definition**: 信息性备注，供参考

**Examples**:
- 值得表扬的写法
- 观察性建议
- 背景信息补充

**Action**: 记录在 `positives` 或 `notes`

## Checklists

> **Note**: Standalone checklist file available at `checklists/code-review-checklist.md`

### 审查前
- [ ] 已读取 spec 和 design
- [ ] 已理解改动范围
- [ ] 已确定审查重点
- [ ] **BR-002**: 已读取 self-check report 作为 hints（非 evidence）

### 审查中
- [ ] 已检查目标对齐
- [ ] 已检查功能正确性
- [ ] 已检查安全性
- [ ] 已检查测试覆盖
- [ ] 已检查代码质量
- [ ] **BR-002**: 已独立验证关键声明（非依赖 self-check）
- [ ] **BR-006**: 已检查 governance 对齐（如适用）

### 审查后
- [ ] 问题已按 BR-004 严重程度分类
- [ ] 建议已具体可执行
- [ ] 报告已生成
- [ ] 决策已明确
- [ ] **BR-007**: 已披露未审查部分和假设

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 | BR Reference |
|----------|------|----------|--------------|
| 流于形式 | 只检查风格 | 强制 checklist | - |
| 过度审查 | 吹毛求疵 | 聚焦 blocker | - |
| 遗漏关键 | 放过安全问题 | 安全优先检查 | - |
| 建议模糊 | "优化一下" | 必须具体可执行 | - |
| 个人偏好 | 强加个人风格 | 遵循团队规范 | - |
| **Self-check 混淆** | "Developer verified" | Reviewer 必须独立验证 | BR-002 |
| **严重程度混乱** | blocker 写成 suggestion | 严格按 BR-004 分类 | BR-004 |
| **Governance 忽略** | 未检查治理文档对齐 | 添加 governance 检查项 | BR-006 |
| **虚假信心** | 未披露审查盲区 | 必须记录未审查部分 | BR-007 |

## Anti-Patterns

> **Note**: Detailed anti-examples available in `anti-examples/` directory.
> See `anti-examples/anti-example-001-vague-review.md` and `anti-examples/anti-example-002-rubber-stamp-approval.md`.

### ❌ Anti-Pattern: Vague Review
```markdown
## Review Report
Overall: LGTM, looks good.
Issues: None
```

**Why wrong**: No specific findings, no evidence of actual review, no actionable feedback.

### ❌ Anti-Pattern: Rubber-Stamp Approval
```markdown
## Review Report
Self-check passed 15/15, so approving.
```

**Why wrong**: BR-002 violation - self-check is not independent verification.

## Notes

### 与 spec-implementation-diff 的关系
- spec-implementation-diff 检查 spec 对齐
- code-review-checklist 检查代码质量
- 两者配合使用

### 与 developer/code-change-selfcheck 的边界 (BR-002)
- **code-change-selfcheck**: developer 自检，产出 self-check-report
- **code-review-checklist**: reviewer 独立审查，产出 review-report
- **关键区别**: self-check 是 hints，review 是独立验证
- **禁止**: reviewer 直接采用 self-check 结论作为 evidence

### 审查时间分配
- 快速审查：10-15 分钟
- 标准审查：20-30 分钟
- 深度审查：30-60 分钟

### 审查 vs 实现比例
- 建议审查时间 = 实现时间的 20-30%
- 复杂代码需要更多审查时间

### 自动化工具配合
- lint/format：自动化检查
- security scan：自动化安全扫描
- reviewer：人工审查补充

### Educational Materials
- `examples/` - Step-by-step review workflow examples
- `anti-examples/` - Common mistakes and how to avoid them
- `checklists/` - Standalone checklist for quick reference

### Related Skills
- `reviewer/spec-implementation-diff` - Spec vs implementation comparison
- `reviewer/reject-with-actionable-feedback` - How to give actionable feedback
- `developer/code-change-selfcheck` - Developer self-check (upstream)
