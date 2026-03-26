# Anti-Example 002: Silent Fixing (BR-007 Violation)

## What This Anti-Example Demonstrates

This anti-example shows a **BR-007 violation**: A reviewer who directly modifies code instead of providing feedback. This violates the role boundary between reviewer and developer.

---

## The BAD Behavior (Do NOT Do This)

### Scenario

A developer submits code for review. The reviewer finds issues and decides to fix them directly.

### What the Reviewer Did Wrong

```typescript
// ❌ BAD: Reviewer directly edited AuthService.ts

// Original code submitted by developer:
export class AuthService {
  private secret = 'hardcoded-secret-key-12345';
  
  async login(username: string, password: string) {
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    const user = await this.db.query(query);
    // ...
  }
}

// Reviewer's commit - THEY EDITED THE FILE DIRECTLY:
export class AuthService {
  private secret: string;
  
  constructor() {
    this.secret = process.env.JWT_SECRET || '';
  }
  
  async login(username: string, password: string) {
    const query = 'SELECT * FROM users WHERE username = ?';
    const user = await this.db.query(query, [username]);
    // ...
  }
}
```

### The BAD Review Message

```yaml
# ❌ BAD: This is NOT proper reviewing
review_feedback:
  verdict: approve
  message: "Fixed the security issues for you. Looks good now."
  changes_made:
    - "Changed hardcoded secret to environment variable"
    - "Fixed SQL injection vulnerability"
```

---

## Why This Is Bad

### 1. Violates Role Boundaries

| Role | Responsibility |
|------|----------------|
| **Reviewer** | Identify issues, provide guidance |
| **Developer** | Implement fixes, maintain code ownership |

When reviewer edits code directly:
- Role boundaries are blurred
- Accountability is unclear
- Audit trail is corrupted

### 2. No Learning Opportunity

The developer who wrote the buggy code:
- Doesn't learn WHY it was wrong
- Doesn't learn HOW to fix it
- May repeat the same mistakes

### 3. Hidden Changes

Direct edits may:
- Introduce new bugs the developer doesn't know about
- Miss context the developer had
- Bypass testing (developer's test suite)

### 4. Ownership Confusion

```
Developer: "Who changed this code?"
Reviewer: "I did."
Developer: "But I'm responsible for this module..."
Reviewer: "Well, it's fixed now."
Developer: "If it breaks, who's on call?"
# Unclear responsibility...
```

### 5. Audit Trail Corruption

```text
Git blame shows: reviewer-agent <reviewer@example.com>
But reviewer should NOT be making code changes!
This breaks the "who wrote what" accountability chain.
```

---

## The CORRECT Approach

### What the Reviewer Should Have Done

```yaml
# ✅ GOOD: Provide actionable feedback, don't edit code
reject_feedback:
  dispatch_id: "DIS-2024-001"
  task_id: "TASK-AUTH-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-03-26T10:30:00Z"
  
  decision:
    verdict: reject
    overall_reason: "存在安全漏洞，需要修复后重新提交"
    
  must_fix:
    - id: MF-001
      title: "JWT Secret 硬编码"
      category: security
      severity: critical
      location: "AuthService.ts:3"
      code_snippet: |
        private secret = 'hardcoded-secret-key-12345';
      issue_explanation: "硬编码密钥存在泄露风险"
      why_fix: "密钥泄露可导致 Token 伪造"
      how_to_fix: |
        1. 将密钥移至环境变量
        2. 在构造函数中读取
        3. 添加验证确保环境变量已设置
      code_example: |
        // 这是建议的修复方式，请勿直接复制
        // 理解原理后根据项目实际情况调整
        export class AuthService {
          private secret: string;
          
          constructor() {
            this.secret = process.env.JWT_SECRET;
            if (!this.secret) {
              throw new Error('JWT_SECRET not configured');
            }
          }
        }
      verification: "检查代码中无硬编码密钥"
      estimated_effort: "15 分钟"
      
    - id: MF-002
      title: "SQL 注入风险"
      category: security
      severity: critical
      location: "AuthService.ts:6"
      code_snippet: |
        const query = `SELECT * FROM users WHERE username = '${username}'`;
      issue_explanation: "用户输入直接嵌入 SQL"
      why_fix: "SQL 注入可导致数据泄露"
      how_to_fix: "使用参数化查询"
      code_example: |
        const query = 'SELECT * FROM users WHERE username = ?';
        const user = await this.db.query(query, [username]);
      verification: "使用 sqlmap 测试通过"
      estimated_effort: "30 分钟"
      
  re_review_instructions:
    what_to_check:
      - "环境变量读取密钥"
      - "参数化查询"
    expected_changes:
      - "AuthService.ts: 构造函数添加环境变量读取"
      - "AuthService.ts: login 方法使用参数化查询"
```

### Developer Makes the Fix

```typescript
// ✅ GOOD: Developer makes the fix themselves
// This ensures:
// 1. Developer understands the issue
// 2. Developer owns the code
// 3. Developer tests the fix
// 4. Git blame correctly shows developer as author

export class AuthService {
  private secret: string;
  
  constructor() {
    // Developer implemented the fix after understanding the feedback
    this.secret = process.env.JWT_SECRET;
    if (!this.secret) {
      throw new Error('JWT_SECRET must be set');
    }
  }
  
  async login(username: string, password: string) {
    // Developer applied parameterized query
    const query = 'SELECT * FROM users WHERE username = ?';
    const user = await this.db.query(query, [username]);
    // ...
  }
}
```

---

## What IS Acceptable: Code Examples

The reviewer CAN provide code examples in feedback:

| Acceptable | Not Acceptable |
|------------|----------------|
| Showing example in review comment | Directly editing source files |
| Providing code snippet in feedback | Committing fixes to the repo |
| Demonstrating the pattern | Pushing changes to the branch |
| "Consider this approach:" | "I fixed this for you:" |

### Acceptable Example Format

```yaml
must_fix:
  - id: MF-001
    code_example: |
      // 这是示例代码，仅供参考
      // 请理解原理后根据项目实际情况实现
      const result = await safeOperation();
```

The key difference: The example is **documentation**, not **direct implementation**.

---

## Real Impact of Silent Fixing

### Scenario: Production Bug

```text
Day 1: Reviewer silently fixes a security issue
Day 30: Similar issue appears in another file by same developer
        Developer didn't learn the lesson because reviewer "fixed it"
Day 31: Production breach occurs

Root Cause Analysis:
- Original issue was "fixed" but developer wasn't educated
- Developer repeated the same mistake elsewhere
- Reviewer's "fix" created a false sense of security
```

### Proper Process Would Have:

```text
Day 1: Reviewer provides actionable feedback
Day 1: Developer fixes the issue, understands the pattern
Day 1: Developer documents the security pattern in team wiki
Day 30: Developer applies same knowledge to new code
Result: Issue never repeats, team knowledge grows
```

---

## Exception: When Direct Edit Might Be Acceptable

There are rare exceptions where a reviewer might make direct changes:

| Situation | Acceptable? | Conditions |
|-----------|-------------|------------|
| Critical production hotfix | Maybe | With explicit permission, documented |
| Typo in documentation | Yes | Trivial, no functional impact |
| Whitespace/formatting | Yes | Auto-formatter, no logic change |
| Adding missing test file | No | Should guide developer instead |
| Fixing security bug | No | Developer must learn |

### Even in Exceptions

```yaml
# If you MUST make a direct edit (rare cases):
direct_edit_justification:
  reason: "Critical production hotfix, developer unavailable"
  approval: "Approved by team lead @lead_name"
  follow_up: "Will provide detailed feedback to developer post-merge"
  documentation: "Updated team runbook with this pattern"
```

---

## Checklist: Avoiding Silent Fixing

Before making ANY code change during review:

- [ ] **Am I the developer?** If no, stop.
- [ ] **Is this a trivial typo in docs?** If no, stop.
- [ ] **Do I have explicit permission?** If no, stop.
- [ ] **Will the developer learn from this?** If no, stop.
- [ ] **Is this documented in feedback?** If no, stop.

If ANY answer is "no" or "stop", provide feedback instead of fixing.

---

## Summary: BR-007 Compliance

| Principle | Implementation |
|-----------|----------------|
| **Reviewer identifies** | Find issues, classify severity |
| **Reviewer guides** | Provide specific remediation steps |
| **Developer implements** | Make the actual code changes |
| **Developer owns** | Maintain code ownership and accountability |
| **Both learn** | Knowledge transfer through feedback |

**The Golden Rule**: Reviewers provide **direction**, not **implementation**. Code examples in feedback are teaching tools, not copy-paste solutions to be committed.