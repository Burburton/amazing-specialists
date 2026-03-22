# Skill: code-review-checklist

## Purpose

为 reviewer 提供系统化的代码审查框架，确保审查覆盖目标对齐、范围控制、边界条件、风险识别、可维护性等关键维度。

解决的核心问题：
- 代码审查流于形式
- 审查不全面，遗漏关键问题
- 审查标准不一致
- 无法给出可执行的修改建议

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

### Step 5: 问题分类
将发现的问题分类：
- **Blocker**: 必须修复（功能/安全/性能）
- **Warning**: 建议修复（质量/可维护性）
- **Suggestion**: 可选优化（风格/建议）
- **Praise**: 值得表扬的写法

### Step 6: 生成 Review Report
输出 review report

## Output Format

```yaml
review_report:
  dispatch_id: string
  task_id: string
  reviewer: string
  timestamp: string
  
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
        
  issues:
    - id: string
      category: string
      severity: blocker | warning | suggestion
      type: correctness | security | performance | quality | test | documentation
      description: string
      location: string
      code_snippet: string
      suggestion: string
      rationale: string
      
  positives:
    - description: string
      location: string
      
  recommendations:
    must_fix: string[]
    should_fix: string[]
    consider: string[]
    
  follow_up:
    - item: string
      owner: string
      due_date: string
      
  risk_assessment:
    risks:
      - risk: string
        level: high | medium | low
        mitigation: string
        
  recommendation_to_next:
    action: approve | reject | request_changes | escalate
    next_steps: string[]
```

## Examples

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

## Severity Guidelines

### Blocker (必须修复)
- 功能不正确
- 安全漏洞
- 严重性能问题
- 数据损坏风险
- 阻碍后续工作

### Warning (建议修复)
- 代码质量问题
- 可维护性问题
- 测试覆盖不足
- 潜在 bug
- 性能隐患

### Suggestion (可选)
- 风格建议
- 优化建议
- 更好的写法
- 文档建议

## Checklists

### 审查前
- [ ] 已读取 spec 和 design
- [ ] 已理解改动范围
- [ ] 已确定审查重点

### 审查中
- [ ] 已检查目标对齐
- [ ] 已检查功能正确性
- [ ] 已检查安全性
- [ ] 已检查测试覆盖
- [ ] 已检查代码质量

### 审查后
- [ ] 问题已分类
- [ ] 建议已具体可执行
- [ ] 报告已生成
- [ ] 决策已明确

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 流于形式 | 只检查风格 | 强制 checklist |
| 过度审查 | 吹毛求疵 | 聚焦 blocker |
| 遗漏关键 | 放过安全问题 | 安全优先检查 |
| 建议模糊 | "优化一下" | 必须具体可执行 |
| 个人偏好 | 强加个人风格 | 遵循团队规范 |

## Notes

### 与 spec-implementation-diff 的关系
- spec-implementation-diff 检查 spec 对齐
- code-review-checklist 检查代码质量
- 两者配合使用

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
