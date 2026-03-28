# Anti-Example 001: Rejection Without Remedy (BR-005 Violation)

## What This Anti-Example Demonstrates

This anti-example shows a **BR-005 violation**: A rejection that fails to provide actionable, specific remediation guidance. The reviewer only points out problems without telling the developer how to fix them.

---

## The BAD Rejection (Do NOT Do This)

```yaml
# ❌ BAD: This is NOT actionable feedback
reject_feedback:
  dispatch_id: "DIS-2024-001"
  task_id: "TASK-AUTH-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-03-26T10:30:00Z"
  
  decision:
    verdict: reject
    overall_reason: "代码质量不达标，需要改进"
    
  issues:
    - "认证模块存在安全隐患"
    - "代码风格不统一"
    - "性能有待优化"
    - "缺少必要的错误处理"
    - "日志记录不完善"
    
  summary: "请修改后重新提交"
```

---

## Why This Is Bad

### 1. Vague Issue Descriptions

| Bad Statement | Why It's Bad |
|---------------|--------------|
| "认证模块存在安全隐患" | Which security issue? Where? How severe? |
| "代码风格不统一" | Which style rules? Which files? Which lines? |
| "性能有待优化" | What performance metric? What's the target? |
| "缺少必要的错误处理" | Which errors? Which functions? |

### 2. No Remediation Guidance

The developer receives no information about:
- What specifically to change
- Where to make changes
- How to verify the fix is correct

### 3. No Closure Criteria

The developer cannot know when the fixes are "done" because there's no pass/fail criteria.

### 4. Frustrating Developer Experience

```text
Developer: "I fixed the security issues. Can you review again?"
Reviewer: "Still not good enough."
Developer: "What specifically is wrong?"
Reviewer: "Just needs more work."
# Cycle continues indefinitely...
```

---

## The CORRECT Approach (Follow This Instead)

```yaml
# ✅ GOOD: Actionable feedback with specific remediation
reject_feedback:
  dispatch_id: "DIS-2024-001"
  task_id: "TASK-AUTH-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-03-26T10:30:00Z"
  
  decision:
    verdict: reject
    overall_reason: "存在安全漏洞和功能缺陷，必须修复后重新审查"
    
  summary:
    must_fix_count: 2
    should_fix_count: 1
    
  must_fix:
    - id: MF-001
      title: "JWT Secret 硬编码"
      category: security
      severity: critical
      description: "JWT Secret 直接写在代码中"
      location: "AuthService.ts:3"
      code_snippet: |
        private secret = 'hardcoded-secret-key-12345';
      issue_explanation: "硬编码密钥可被代码仓库访问者获取"
      why_fix: "密钥泄露可导致 Token 伪造"
      how_to_fix: |
        1. 从环境变量读取 JWT Secret
        2. 添加启动时验证
      code_example: |
        private secret = process.env.JWT_SECRET || 
          (() => { throw new Error('JWT_SECRET not set') })()
      verification: |
        1. grep 检查无硬编码密钥
        2. 启动测试验证环境变量检查
      estimated_effort: "15 分钟"
      closure_criteria:
        - "无硬编码密钥"
        - "从环境变量读取"
        
    - id: MF-002
      title: "SQL 注入风险"
      category: security
      severity: critical
      description: "使用字符串拼接 SQL 查询"
      location: "AuthService.ts:6"
      code_snippet: |
        const query = `SELECT * FROM users WHERE username = '${username}'`;
      issue_explanation: "用户输入直接嵌入 SQL"
      why_fix: "SQL 注入可导致数据泄露"
      how_to_fix: "使用参数化查询"
      code_example: |
        const query = 'SELECT * FROM users WHERE username = ?';
        const user = await this.db.query(query, [username]);
      verification: "SQL 注入测试通过"
      estimated_effort: "30 分钟"
      closure_criteria:
        - "所有查询使用参数化"
        
  should_fix:
    - id: SF-001
      title: "缺少输入验证"
      description: "username 和 password 未验证"
      suggestion: "添加格式和长度验证"
      priority: high
      
  re_review_instructions:
    what_to_check:
      - "MF-001: 环境变量读取密钥"
      - "MF-002: 参数化查询"
    re_review_focus:
      - "安全性"
```

---

## Comparison: Bad vs Good

| Aspect | Bad (Anti-Example) | Good (Correct) |
|--------|-------------------|----------------|
| Issue description | "存在安全隐患" | "JWT Secret 硬编码在 AuthService.ts:3" |
| Location | Not specified | Exact file and line number |
| Remediation | Not provided | Step-by-step instructions |
| Code example | Not provided | Working code showing fix |
| Verification | Not provided | Specific test steps |
| Closure criteria | Not provided | Clear pass conditions |
| Estimated effort | Not provided | "15 分钟", "30 分钟" |

---

## Real Impact of Non-Actionable Feedback

### Wasted Time

```text
Round 1: Developer guesses what to fix → 2 hours
Round 2: Still wrong, more guessing → 2 hours
Round 3: Still not done → 2 hours
Total: 6+ hours of frustration
```

### With Actionable Feedback

```text
Round 1: Developer follows specific steps → 1 hour
Round 2: Re-review passes → 20 minutes
Total: 1.5 hours with clear outcome
```

### Developer Morale Impact

- **Non-actionable**: "The reviewer doesn't respect my time"
- **Actionable**: "The reviewer helped me understand and fix the issue"

---

## Common Variations of Non-Actionable Feedback

### Variation 1: The "Refactor" Request

```
❌ BAD: "This function needs refactoring."
✅ GOOD: "This function is 80 lines and does 3 things. 
         Extract the validation logic into validateInput() 
         and the transformation into transformData()."
```

### Variation 2: The "Not Good Enough" Request

```
❌ BAD: "The error handling isn't good enough."
✅ GOOD: "Missing error handling for:
         - Network timeout (add retry with exponential backoff)
         - Invalid response format (add schema validation)
         - Rate limit exceeded (return 429 with Retry-After header)"
```

### Variation 3: The "Performance" Request

```
❌ BAD: "This is too slow, optimize it."
✅ GOOD: "Current performance: 500ms for 1000 items.
         Target: < 100ms for 1000 items.
         Bottleneck: The nested loop in processData() at line 45.
         Suggestion: Use Map for O(1) lookup instead of array.find()"
```

### Variation 4: The "Style" Request

```
❌ BAD: "Fix the code style issues."
✅ GOOD: "Run `npm run lint:fix` to auto-fix style issues.
         Manual fixes needed:
         - Line 23: Add JSDoc comment for public method
         - Line 45: Use const instead of let (value never reassigned)"
```

---

## Checklist: Avoiding Non-Actionable Feedback

Before submitting rejection, verify each issue has:

- [ ] **Specific location**: File name and line number
- [ ] **Clear description**: What exactly is wrong
- [ ] **Rationale**: Why it needs to be fixed
- [ ] **Remediation steps**: How to fix it
- [ ] **Code example**: For code-level issues
- [ ] **Verification method**: How to confirm the fix
- [ ] **Closure criteria**: When the fix is complete

If ANY of these are missing, the feedback is NOT actionable.