# Example 001: Actionable Rejection with Complete Feedback

## Scenario

A developer has implemented an authentication module. The reviewer finds several issues that require fixes before approval.

## Original Code Under Review

```typescript
// AuthService.ts
export class AuthService {
  private secret = 'hardcoded-secret-key-12345';
  
  async login(username: string, password: string) {
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    const user = await this.db.query(query);
    
    if (!user) {
      return { error: 'User not found' };
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return { error: 'Invalid password', user: user };
    }
    
    const token = jwt.sign({ id: user.id }, this.secret);
    return { token, user };
  }
}
```

## Reviewer's Actionable Rejection Feedback

```yaml
reject_feedback:
  dispatch_id: "DIS-2024-001"
  task_id: "TASK-AUTH-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-03-26T10:30:00Z"
  
  decision:
    verdict: reject
    overall_reason: "存在安全漏洞和功能缺陷，必须修复后重新审查"
    
  summary:
    must_fix_count: 3
    should_fix_count: 2
    non_blocking_count: 1
    residual_risk_count: 0
    
  must_fix:
    - id: MF-001
      title: "JWT Secret 硬编码"
      category: security
      severity: critical
      description: "JWT Secret 直接写在代码中，存在泄露风险"
      location: "AuthService.ts:3"
      code_snippet: |
        private secret = 'hardcoded-secret-key-12345';
      issue_explanation: "硬编码密钥可被代码仓库访问者获取，版本控制历史也会保留"
      why_fix: "密钥泄露可导致 Token 伪造，攻击者可以生成任意用户的有效 Token"
      how_to_fix: |
        1. 从环境变量读取 JWT Secret
        2. 添加启动时检查确保环境变量已设置
        3. 移除所有硬编码密钥
      code_example: |
        // 正确做法
        export class AuthService {
          private secret: string;
          
          constructor() {
            this.secret = process.env.JWT_SECRET;
            if (!this.secret) {
              throw new Error('JWT_SECRET environment variable is required');
            }
          }
        }
      verification: |
        1. 检查代码中无硬编码密钥（grep -r "secret.*=" --include="*.ts"）
        2. 启动应用，验证未设置 JWT_SECRET 时抛出错误
        3. 设置 JWT_SECRET，验证应用正常启动
      estimated_effort: "15 分钟"
      closure_criteria:
        - "代码中无硬编码密钥"
        - "从环境变量读取密钥"
        - "启动时验证环境变量存在"
        
    - id: MF-002
      title: "SQL 注入漏洞"
      category: security
      severity: critical
      description: "使用字符串拼接 SQL 查询，用户输入直接嵌入 SQL"
      location: "AuthService.ts:6"
      code_snippet: |
        const query = `SELECT * FROM users WHERE username = '${username}'`;
      issue_explanation: "攻击者可以通过构造恶意 username 执行任意 SQL"
      why_fix: "SQL 注入可导致数据泄露、数据篡改、甚至整个数据库被删除"
      how_to_fix: |
        1. 使用参数化查询
        2. 使用 ORM 的查询构建器
        3. 对所有用户输入进行参数化处理
      code_example: |
        // 正确做法 - 使用参数化查询
        const query = 'SELECT * FROM users WHERE username = ?';
        const user = await this.db.query(query, [username]);
        
        // 或使用 ORM
        const user = await this.userRepository.findOne({ 
          where: { username } 
        });
      verification: |
        1. 代码审查确认所有 SQL 查询使用参数化
        2. 使用 SQL 注入测试工具（如 sqlmap）验证
        3. 测试输入 `admin' OR '1'='1` 应返回认证失败而非成功
      estimated_effort: "30 分钟"
      closure_criteria:
        - "所有 SQL 查询使用参数化"
        - "SQL 注入测试通过"
        
    - id: MF-003
      title: "密码错误时泄露用户信息"
      category: security
      severity: high
      description: "密码错误时仍返回用户对象，泄露用户存在性信息"
      location: "AuthService.ts:13"
      code_snippet: |
        if (!valid) {
          return { error: 'Invalid password', user: user };
        }
      issue_explanation: "返回 user 对象泄露了用户存在的信息，攻击者可利用此枚举有效用户名"
      why_fix: "用户枚举是常见的攻击向量，可帮助攻击者锁定有效账户进行针对性攻击"
      how_to_fix: |
        1. 密码错误时不返回任何用户信息
        2. 使用统一的错误消息（"用户名或密码错误"）
        3. 用户不存在时也返回相同错误消息
      code_example: |
        // 正确做法
        if (!user || !valid) {
          return { error: 'Invalid credentials' };  // 不区分用户不存在和密码错误
        }
      verification: |
        1. 测试不存在用户登录，验证返回相同错误消息
        2. 测试错误密码登录，验证不返回用户信息
        3. 检查响应体不包含任何用户标识
      estimated_effort: "10 分钟"
      closure_criteria:
        - "密码错误不返回用户信息"
        - "用户不存在返回相同错误消息"
        
  should_fix:
    - id: SF-001
      title: "缺少输入验证"
      category: quality
      description: "username 和 password 参数未验证格式和长度"
      location: "AuthService.ts:5"
      suggestion: |
        1. 添加 username 格式验证（如：3-50 字符，字母数字下划线）
        2. 添加 password 长度验证（如：6-128 字符）
        3. 在处理前验证输入
      impact_if_not_fixed: "无效输入可能导致意外行为或额外的数据库查询"
      priority: high
      
    - id: SF-002
      title: "缺少账号锁定机制"
      category: quality
      description: "无限次密码尝试，易受暴力破解攻击"
      location: "AuthService.ts"
      suggestion: |
        实现账号锁定：连续 N 次失败后锁定 M 分钟
        1. 记录失败次数
        2. 检查锁定状态
        3. 解锁逻辑
      impact_if_not_fixed: "攻击者可无限尝试密码"
      priority: high
      
  non_blocking:
    - id: NB-001
      title: "添加日志记录"
      description: "登录成功/失败应记录日志用于审计"
      suggestion: "添加结构化日志记录登录事件"
      benefit: "便于安全审计和问题排查"
      
  re_review_instructions:
    what_to_check:
      - "所有 must-fix 已修复"
      - "修复未引入新问题"
      - "输入验证已添加"
    expected_changes:
      - "AuthService.ts: 使用环境变量存储密钥"
      - "AuthService.ts: 使用参数化查询"
      - "AuthService.ts: 不泄露用户信息"
    re_review_focus:
      - "安全性（重点）"
      - "输入验证"
      - "边界条件处理"
      
  timeline:
    estimated_fix_time: "1 小时"
    re_review_time: "20 分钟"
    
  escalation:
    required: false
    
  scope:
    reviewed:
      - "AuthService.ts - login 方法"
      - "认证流程核心逻辑"
    not_reviewed:
      - "其他 AuthService 方法"
      - "前端认证集成"
    rationale: "聚焦登录核心流程，其他方法可在后续审查"
```

## Why This Is a Good Example

### BR-005 Compliance: Actionable Feedback

Each must-fix item includes:
1. **What**: Clear description of the issue
2. **Why**: Security rationale explaining the risk
3. **How**: Step-by-step remediation instructions
4. **Code Example**: Working code showing the fix
5. **Verification**: Specific steps to confirm the fix
6. **Closure Criteria**: Clear pass/fail conditions

### BR-007 Compliance: No Code Mutation

The reviewer:
- Provided code examples showing the correct approach
- Did NOT directly modify the source files
- Maintained clear reviewer/developer role boundaries

### Clear Closure Criteria

Each issue has specific, testable closure criteria that define when the fix is complete. This prevents:
- Developer guessing what "fixed" means
- Repeated back-and-forth for incomplete fixes
- Subjective quality disputes

### Efficient Re-Review

The `re_review_instructions` section:
- Defines exactly what to check
- Lists expected file changes
- Focuses the re-review on relevant areas
- Estimates time required

## Developer's Response (Example)

After receiving this feedback, the developer can:

1. **Prioritize**: Know that MF-001, MF-002, MF-003 are must-fix
2. **Understand**: Read the "why_fix" for motivation
3. **Execute**: Follow the "how_to_fix" steps
4. **Verify**: Use the "verification" steps to self-check
5. **Know when done**: Use closure criteria to confirm completeness