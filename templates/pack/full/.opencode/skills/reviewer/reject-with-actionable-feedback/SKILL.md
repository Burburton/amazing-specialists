# Skill: reject-with-actionable-feedback

## Purpose

保证 reviewer 在拒绝时给出可执行的修改建议，包括 must-fix、non-blocking、residual risks，让 developer 知道具体怎么改。

解决的核心问题：
- reviewer 只说"有问题"但不说怎么改
- 拒绝理由模糊，developer 无从下手
- 问题不分轻重，混在一起
- 修改后仍不知道是否满足要求

## Business Rules Compliance

### BR-005: Rejection Must Be Actionable
**Critical Requirement**: Every rejection must provide specific, executable remediation guidance.

- **No vague rejections**: "Needs improvement" or "Not good enough" is **not acceptable**
- **Must include**: For each must-fix item:
  - What exactly is wrong (issue description)
  - Why it must be fixed (rationale)
  - How to fix it (specific remediation steps)
  - Code example showing the fix
  - Verification method to confirm the fix
- **Closure criteria**: Each issue must have clear pass/fail criteria

**Non-compliance indicators**:
- Rejection without specific remediation steps
- "Refactor this" without explaining what/why
- Missing code examples for code-level issues

### BR-007: No Code Mutation During Rejection
**Critical Requirement**: Reviewer must NOT modify code during rejection process.

- **Reviewer role**: Identify issues and provide guidance
- **Developer role**: Make the actual code changes
- **Boundary**: Reviewer may show examples of what the fixed code should look like, but must NOT directly edit the codebase
- **Rationale**: Maintains clear responsibility boundaries and audit trail

**Violations**:
- Directly editing source files during review
- Committing fixes on behalf of developer
- Modifying tests to make them pass

### BR-003: Rejection Report Must State Coverage Boundaries
This skill explicitly documents:
- What was reviewed (in scope)
- What was NOT reviewed (out of scope)
- Why certain areas were excluded (rationale)

## Integration with Other Skills

### With code-review-checklist
- **code-review-checklist** discovers issues systematically
- **reject-with-actionable-feedback** organizes and communicates those issues
- **Workflow**: Run code-review-checklist FIRST, then reject-with-actionable-feedback

### With spec-implementation-diff
- **spec-implementation-diff** identifies spec deviations
- **reject-with-actionable-feedback** communicates those deviations as must-fix items
- **Workflow**: spec-implementation-diff findings become must-fix entries

### With developer rework workflow
- Rejection output feeds directly into developer's rework task
- Clear must-fix items enable focused, efficient rework
- Closure criteria define when rework is complete
- Re-review instructions define what to check after rework

## Downstream Artifact References
- `specs/006-reviewer-core/contracts/review-feedback-contract.md` - review_feedback field receives output from this skill
- `specs/004-developer-core/contracts/rework-instruction-contract.md` - Developer consumes rejection output for rework

## Closure Criteria

### When Is a Rejection "Complete"?
A rejection feedback is complete when:

1. **All issues classified**: Every finding has must-fix / should-fix / non-blocking classification
2. **All must-fix items actionable**: Each must-fix has:
   - [ ] Specific location identified
   - [ ] Issue explanation provided
   - [ ] Rationale for fixing
   - [ ] Remediation steps provided
   - [ ] Code example included (for code issues)
   - [ ] Verification method specified
3. **Re-review scope defined**: Clear instructions on what to re-check
4. **Timeline estimated**: Reasonable fix and re-review time estimates
5. **Escalation decision made**: Whether escalation is needed is explicitly stated

### When Is Rework "Complete"?
Developer's rework is complete when:

1. **All must-fix items addressed**: Every MF-* item has been fixed
2. **Verification passed**: Each fix passes its specified verification method
3. **No new issues introduced**: Changes don't create new problems
4. **Should-fix items considered**: At least acknowledged (fixed or deferred with rationale)

## Failure Modes

| Failure Mode | Manifestation | Handling |
|--------------|---------------|----------|
| Vague rejection | "Needs work" without specifics | Use structured feedback format |
| Missing remediation | States problem but not solution | Require how_to_fix for each issue |
| Silent fixing | Reviewer modifies code directly | Enforce BR-007, provide examples only |
| Over-rejection | Non-blocking treated as must-fix | Apply strict must-fix criteria |
| Under-rejection | Critical issue marked as suggestion | Re-evaluate severity classification |
| Scope creep | Rejection includes unrelated issues | Focus on current task scope only |
| Missing closure criteria | Developer doesn't know when done | Require verification field for each issue |
| Escalation confusion | Should escalate but rejected | Use escalation decision tree |

## When to Use

必须使用时：
- reviewer 决定 reject 时
- 发现必须修复的问题时
- 需要给出明确修改指导时

推荐使用时：
- warn 状态给出建议时
- approve with suggestions 时
- 任何 review feedback 场景

## When Not to Use

不适用场景：
- approve 无建议时
- 纯 praise 无问题
- 需要 escalated 而非 reject

## Feedback Structure

### 1. Must-Fix (必须修复)

**特征：**
- 功能不正确
- 安全漏洞
- 严重性能问题
- 阻塞性问题
- 不满足 spec 核心要求

**格式：**
```yaml
must_fix:
  - id: string
    title: string
    description: string
    location: string
    severity: critical | high
    suggestion: string  # 具体怎么改
    code_example: string  # 示例代码
    rationale: string  # 为什么必须改
    verification: string  # 怎么验证修复
```

### 2. Should-Fix (建议修复)

**特征：**
- 代码质量问题
- 可维护性问题
- 测试覆盖不足
- 潜在问题
- 不满足最佳实践

**格式：**
```yaml
should_fix:
  - id: string
    title: string
    description: string
    location: string
    severity: medium | low
    suggestion: string
    impact: string  # 不修的影响
    priority: high | medium | low
```

### 3. Non-Blocking (非阻塞)

**特征：**
- 风格建议
- 可选优化
- 未来改进
- 不阻止通过

**格式：**
```yaml
non_blocking:
  - id: string
    title: string
    description: string
    suggestion: string
    benefit: string  # 采纳的好处
```

### 4. Residual Risks (残余风险)

**特征：**
- 已知但未解决的风险
- 接受的 trade-off
- 需要监控的问题
- 未来可能暴露

**格式：**
```yaml
residual_risks:
  - risk: string
    level: high | medium | low
    description: string
    acceptance_rationale: string  # 为什么接受
    mitigation: string  # 缓解措施
    monitoring: string  # 监控方法
```

## Steps

### Step 1: 整理发现的问题
1. 收集 code-review-checklist 发现的问题
2. 收集 spec-implementation-diff 发现的偏离
3. 按严重程度分类

### Step 2: 分类问题
对每个问题：
1. 评估严重程度
2. 评估修复难度
3. 评估影响范围
4. 分类到 must-fix / should-fix / non-blocking

### Step 3: 生成修改建议
对每个问题：
1. 描述问题
2. 说明原因
3. 给出具体修改建议
4. 提供代码示例（如适用）
5. 说明验证方法

### Step 4: 识别残余风险
1. 列出未完全解决的风险
2. 评估风险等级
3. 说明接受理由
4. 制定缓解和监控计划

### Step 5: 组织反馈
按优先级组织反馈：
1. 先 must-fix（紧急重要）
2. 再 should-fix（重要不紧急）
3. 最后 non-blocking（可选）
4. 附 residual risks

### Step 6: 生成 Reject Report
输出结构化的 reject feedback

## Output Format

```yaml
reject_feedback:
  dispatch_id: string
  task_id: string
  reviewer: string
  timestamp: string
  
  decision:
    verdict: reject
    overall_reason: string
    
  summary:
    must_fix_count: number
    should_fix_count: number
    non_blocking_count: number
    residual_risk_count: number
    
  must_fix:
    - id: MF-001
      title: string
      category: security | correctness | performance
      description: string
      location: string
      code_snippet: string
      issue_explanation: string  # 问题是什么
      why_fix: string  # 为什么要修复
      how_to_fix: string  # 怎么修复
      code_example: string  # 修复后示例
      verification: string  # 怎么验证修复
      estimated_effort: string
      
  should_fix:
    - id: SF-001
      title: string
      category: quality | test | maintainability
      description: string
      location: string
      suggestion: string
      impact_if_not_fixed: string
      priority: high | medium | low
      
  non_blocking:
    - id: NB-001
      title: string
      description: string
      suggestion: string
      benefit: string
      
  residual_risks:
    - id: RR-001
      risk: string
      level: high | medium | low
      description: string
      why_accepted: string
      mitigation: string
      monitoring: string
      
  re_review_instructions:
    what_to_check: string[]
    expected_changes: string[]
    re_review_focus: string[]
    
  timeline:
    estimated_fix_time: string
    re_review_time: string
    
  escalation:
    required: boolean
    reason: string
    alternatives: string[]
```

## Examples

### 示例 1：典型 Reject

```yaml
reject_feedback:
  decision:
    verdict: reject
    overall_reason: "存在安全漏洞和功能缺陷，必须修复后重新审查"
    
  summary:
    must_fix_count: 3
    should_fix_count: 2
    non_blocking_count: 1
    residual_risk_count: 1
    
  must_fix:
    - id: MF-001
      title: "JWT Secret 硬编码"
      category: security
      description: "JWT Secret 直接写在代码中，存在泄露风险"
      location: "JwtTokenService.ts:12"
      code_snippet: |
        const SECRET = 'hardcoded-secret-key-12345'
      issue_explanation: "硬编码密钥可被代码仓库访问者获取"
      why_fix: "密钥泄露可导致 Token 伪造，严重安全漏洞"
      how_to_fix: "从环境变量读取 JWT Secret"
      code_example: |
        const SECRET = process.env.JWT_SECRET || 
          (() => { throw new Error('JWT_SECRET not set') })()
      verification: "检查代码中无硬编码密钥，部署时设置环境变量"
      estimated_effort: "15 分钟"
      
    - id: MF-002
      title: "SQL 注入风险"
      category: security
      description: "使用字符串拼接 SQL 查询"
      location: "UserRepository.ts:25"
      code_snippet: |
        const query = `SELECT * FROM users WHERE username = '${username}'`
      issue_explanation: "用户输入直接拼接到 SQL，可被注入"
      why_fix: "SQL 注入可导致数据泄露、删除"
      how_to_fix: "使用参数化查询"
      code_example: |
        const query = 'SELECT * FROM users WHERE username = ?'
        const user = await db.query(query, [username])
      verification: "检查所有 SQL 查询使用参数化"
      estimated_effort: "30 分钟"
      
    - id: MF-003
      title: "密码错误返回用户信息"
      category: correctness
      description: "密码错误时仍返回用户对象"
      location: "AuthService.ts:45"
      code_snippet: |
        if (!passwordValid) {
          return { error: 'Invalid password', user: user }
        }
      issue_explanation: "泄露了用户存在性信息"
      why_fix: "攻击者可利用此枚举有效用户名"
      how_to_fix: "密码错误时不返回用户信息"
      code_example: |
        if (!passwordValid) {
          return { error: 'Invalid credentials', user: null }
        }
      verification: "测试密码错误响应不包含 user 字段"
      estimated_effort: "10 分钟"
      
  should_fix:
    - id: SF-001
      title: "缺少错误路径测试"
      category: test
      description: "只有正常路径测试，缺少错误处理测试"
      location: "auth.test.ts"
      suggestion: "添加密码错误、用户不存在等场景的测试"
      impact_if_not_fixed: "错误处理逻辑未验证，可能隐藏 bug"
      priority: high
      
    - id: SF-002
      title: "函数过长"
      category: quality
      description: "login 函数超过 60 行"
      location: "AuthController.ts:30"
      suggestion: "拆分为验证、处理、响应三个小函数"
      impact_if_not_fixed: "可读性和可维护性降低"
      priority: medium
      
  non_blocking:
    - id: NB-001
      title: "使用常量替代魔法数字"
      description: "5 次失败尝试是魔法数字"
      location: "AuthService.ts:45"
      suggestion: "提取为 MAX_FAILED_ATTEMPTS 常量"
      benefit: "提高可读性，便于调整"
      
  residual_risks:
    - id: RR-001
      risk: "JWT Token 泄露"
      level: medium
      description: "Token 可能被窃取"
      why_accepted: "标准 JWT 风险，通过 HTTPS 和短有效期缓解"
      mitigation: "使用 HTTPS，Token 1 小时过期"
      monitoring: "监控异常登录行为"
      
  re_review_instructions:
    what_to_check:
      - "所有 must-fix 已修复"
      - "修复未引入新问题"
      - "测试已补充"
    expected_changes:
      - "JwtTokenService.ts: 使用环境变量"
      - "UserRepository.ts: 参数化查询"
      - "AuthService.ts: 不泄露用户信息"
    re_review_focus:
      - "安全性"
      - "测试覆盖"
      
  timeline:
    estimated_fix_time: "2 小时"
    re_review_time: "30 分钟"
    
  escalation:
    required: false
```

### 示例 2：需要升级

```yaml
reject_feedback:
  decision:
    verdict: reject
    overall_reason: "约束与需求冲突，需要产品决策"
    
  summary:
    must_fix_count: 0
    should_fix_count: 0
    non_blocking_count: 0
    residual_risk_count: 0
    
  must_fix: []
  should_fix: []
  non_blocking: []
  residual_risks: []
  
  escalation:
    required: true
    reason: |
      需求要求实现角色权限系统，约束要求不能修改数据库 schema。
      现有 schema 不支持多对多用户-角色关系。
      两次尝试均无法在不改 schema 的情况下实现。
      需要产品决策：
      A) 放宽约束，修改 schema
      B) 降级需求，简化权限模型
      C) 延迟实现，先重构 schema
    alternatives:
      - "修改 schema 添加 user_roles 表"
      - "使用现有 roles 字段，只支持单角色"
      - "延迟到 schema 重构后实现"
      
  recommendation:
    next_step: "escalate_to_product"
    blocking: true
```

### 示例 3：温和 Reject

```yaml
reject_feedback:
  decision:
    verdict: reject
    overall_reason: "整体方向正确，但有遗漏和偏离需要调整"
    
  summary:
    must_fix_count: 1
    should_fix_count: 3
    non_blocking_count: 2
    residual_risk_count: 0
    
  must_fix:
    - id: MF-001
      title: "遗漏账号锁定功能"
      category: correctness
      description: "spec 要求连续 5 次失败锁定 30 分钟，未实现"
      location: "AuthService.ts"
      issue_explanation: "缺少 lockout 检测逻辑"
      why_fix: "防止暴力破解"
      how_to_fix: |
        1. 添加失败次数计数
        2. 检查是否达到阈值
        3. 锁定账号并记录时间
        4. 解锁时检查锁定时间
      code_example: |
        async validateUser(username, password) {
          const user = await this.userRepo.findByUsername(username)
          if (user.isLocked && this.isLockExpired(user.lockedAt)) {
            throw new UserLockedError()
          }
          // ... validation
          if (!valid) {
            await this.incrementFailedAttempts(user)
            if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
              await this.lockUser(user)
            }
          }
        }
      verification: "测试连续 5 次失败后账号锁定"
      estimated_effort: "1 小时"
      
  should_fix:
    - id: SF-001
      title: "命名不一致"
      category: quality
      description: "error_code vs errorCode"
      suggestion: "统一为 errorCode"
      priority: medium
      
    - id: SF-002
      title: "缺少注释"
      category: quality
      description: "复杂逻辑无注释"
      suggestion: "添加解释性注释"
      priority: low
      
  non_blocking:
    - id: NB-001
      title: "日志格式可优化"
      suggestion: "使用结构化日志"
      benefit: "便于日志分析"
      
  re_review_instructions:
    what_to_check:
      - "lockout 功能完整实现"
      - "命名统一"
    re_review_focus:
      - "功能完整性"
      - "边界条件"
      
  timeline:
    estimated_fix_time: "2-3 小时"
    re_review_time: "20 分钟"
```

## Guidelines

### Must-Fix Criteria
以下情况必须是 must-fix：
- 安全漏洞
- 功能不正确
- 不满足 spec 核心要求
- 严重性能问题
- 阻塞性问题

### Suggestion Quality
好的建议应该：
1. 具体可执行
2. 有代码示例
3. 说明原因
4. 提供验证方法

### Tone
Reject feedback 的语调：
- 专业客观
- 建设性
- 非指责性
- 帮助改进

### Reviewer Discipline
- 不说"这个不好"，说"建议改为 X 因为 Y"
- 不说"有问题"，说"Z 场景下会出问题，建议 A"
- 区分 blocker vs preference

## Checklists

### Reject 前
- [ ] 问题已分类
- [ ] 严重程度已评估
- [ ] 建议已具体化
- [ ] 有代码示例

### Reject 后
- [ ] re-review 标准已明确
- [ ] 时间估算已给出
- [ ] 风险已说明
- [ ] 语调已检查

## Notes

### 与 code-review-checklist 的关系
- code-review-checklist 发现问题
- reject-with-actionable-feedback 组织反馈
- 两者通常连续使用

### Reject vs Escalate
- Reject: 可修复，给具体指导
- Escalate: 无法自行决定，需升级

### Re-Review 效率
- 明确 re-review 范围
- 聚焦修改部分
- 避免重复全量审查

### 拒绝的艺术
- 拒绝的是代码，不是人
- 解释为什么，不只是是什么
- 提供帮助，不只是指出问题
