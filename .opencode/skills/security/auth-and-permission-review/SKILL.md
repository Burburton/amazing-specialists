# Skill: auth-and-permission-review

## Purpose

检查认证、授权、权限边界逻辑，确保身份验证和访问控制的安全性。

解决的核心问题：
- 认证绕过漏洞
- 权限提升漏洞
- 越权访问
- 会话管理问题

## When to Use

必须使用时：
- 涉及认证、登录、注册的功能
- 涉及权限控制的功能
- 涉及角色管理的功能
- 涉及 Token/Session 的功能
- 标记为高风险的 task

推荐使用时：
- 任何用户相关功能
- API 接口变更
- 涉及敏感数据的功能

## When Not to Use

不适用场景：
- 纯内部无用户系统
- 无权限控制的公开接口
- 已通过 security review

## Review Checklist

### 1. 认证机制 (Authentication)

#### 1.1 凭证存储
- [ ] 密码是否使用强哈希算法（bcrypt/argon2/scrypt）？
- [ ] 是否加盐？
- [ ] 哈希迭代次数是否足够？
- [ ] API Key/Secret 是否安全存储？

#### 1.2 认证流程
- [ ] 是否支持多因素认证？
- [ ] 失败次数是否限制？
- [ ] 是否有账号锁定机制？
- [ ] 是否记录登录日志？

#### 1.3 Session/Token 管理
- [ ] Token 是否设置过期时间？
- [ ] 过期时间是否合理？
- [ ] 是否支持 Token 刷新？
- [ ] 是否支持 Token 吊销？
- [ ] Session ID 是否随机生成？
- [ ] Session 是否安全存储？

### 2. 授权机制 (Authorization)

#### 2.1 权限检查
- [ ] 每个敏感操作是否检查权限？
- [ ] 权限检查是否在服务端执行？
- [ ] 是否存在客户端绕过可能？
- [ ] 默认权限是否最小？

#### 2.2 角色管理
- [ ] 角色定义是否清晰？
- [ ] 权限粒度是否合理？
- [ ] 是否存在权限继承问题？
- [ ] 特权角色是否有额外保护？

#### 2.3 资源访问控制
- [ ] 是否验证资源所有权？
- [ ] 是否存在 IDOR 漏洞？
- [ ] 批量操作是否受限制？
- [ ] 敏感操作是否有额外确认？

### 3. 传输安全

- [ ] 认证信息是否只在 HTTPS 传输？
- [ ] Token 是否不在 URL 中传输？
- [ ] Cookie 是否设置 Secure/HttpOnly？

### 4. 日志与监控

- [ ] 认证失败是否记录？
- [ ] 权限拒绝是否记录？
- [ ] 是否有异常访问模式监控？
- [ ] 日志是否脱敏（不含密码）？

## Common Vulnerabilities

| 漏洞 | 描述 | CWE | OWASP | 检测方法 | 修复建议 |
|------|------|-----|-------|----------|----------|
| **弱密码哈希** | 使用 MD5/SHA1 | CWE-916 | A02:2021 Crypto Failures | 检查哈希算法 | 改用 bcrypt/argon2 |
| **硬编码密钥** | Secret 在代码中 | CWE-798 | A07:2021 Auth Failures | 搜索密钥字符串 | 使用环境变量 |
| **JWT 无验证** | 不验证签名 | CWE-287 | A07:2021 Auth Failures | 检查 JWT 验证逻辑 | 始终验证签名 |
| **会话固定** | Session ID 可预测 | CWE-384 | A07:2021 Auth Failures | 检查 ID 生成 | 使用随机 ID |
| **权限绕过** | 缺少权限检查 | CWE-862 | A01:2021 Access Control | 检查敏感操作 | 添加权限校验 |
| **IDOR** | 越权访问资源 | CWE-639 | A01:2021 Access Control | 测试资源访问 | 验证所有权 |
| **CSRF** | 跨站请求伪造 | CWE-352 | A01:2021 Access Control | 检查 CSRF 防护 | 添加 CSRF Token |
| **Token 泄露** | Token 在日志/URL | CWE-598 | A07:2021 Auth Failures | 搜索 token 关键字 | 避免记录/传输 |

## Steps

### Step 1: 识别认证相关代码
1. 读取 changed_files
2. 识别认证相关文件
3. 识别权限检查代码
4. 识别 Token/Session 处理

### Step 2: 检查认证机制
1. 检查凭证存储
2. 检查认证流程
3. 检查 Session/Token 管理
4. 检查失败处理

### Step 3: 检查授权机制
1. 检查权限检查点
2. 检查角色管理
3. 检查资源访问控制
4. 检查默认权限

### Step 4: 检查传输安全
1. 检查 HTTPS 使用
2. 检查 Token 传输方式
3. 检查 Cookie 设置

### Step 5: 检查日志监控
1. 检查安全事件记录
2. 检查日志脱敏
3. 检查监控告警

### Step 6: 生成安全报告
输出 security review report

## Output Format

```yaml
security_review_report:
  dispatch_id: string
  task_id: string
  
  scope:
    components_reviewed: string[]
    auth_mechanisms: string[]
    permission_systems: string[]
    
  findings:
    - id: string
      severity: critical | high | medium | low | info
      category: authentication | authorization | session | transport | logging
      title: string
      description: string
      location: string
      code_snippet: string
      
      vulnerability:
        type: string
        cwe: string
        owasp: string
        
      impact:
        description: string
        exploit_scenario: string
        affected_users: string
        
      remediation:
        recommendation: string
        code_example: string
        effort: quick | moderate | extensive
        priority: immediate | soon | later
        
  compliance:
    standards:
      - name: string
        compliant: boolean
        notes: string
        
  risk_assessment:
    overall_risk: critical | high | medium | low
    risk_factors:
      - factor: string
        level: high | medium | low
        
  recommendations:
    must_fix: string[]
    should_fix: string[]
    consider: string[]
    
  gate_decision:
    decision: pass | needs-fix | block
    conditions: string[]
    
  follow_up:
    - item: string
      owner: string
      due_date: string
```

## Examples

### 示例 1：发现严重问题

```yaml
security_review_report:
  scope:
    components_reviewed:
      - "AuthService.ts"
      - "AuthController.ts"
      - "JwtTokenService.ts"
      
  findings:
    - id: SEC-001
      severity: critical
      category: authentication
      title: "JWT Secret 硬编码"
      description: "JWT 签名密钥直接写在源代码中"
      location: "JwtTokenService.ts:12"
      code_snippet: |
        const JWT_SECRET = 'my-secret-key-12345'
      
      vulnerability:
        type: "Hardcoded Credentials"
        cwe: "CWE-798"
        owasp: "A07:2021 - Identification and Authentication Failures"
        
      impact:
        description: "攻击者获取代码后可伪造任意用户 Token"
        exploit_scenario: |
          1. 攻击者获取代码仓库访问权限
          2. 找到硬编码密钥
          3. 使用密钥生成管理员 Token
          4. 以管理员身份访问系统
        affected_users: "所有用户"
        
      remediation:
        recommendation: "从环境变量读取密钥"
        code_example: |
          const JWT_SECRET = process.env.JWT_SECRET
          if (!JWT_SECRET) {
            throw new Error('JWT_SECRET not configured')
          }
        effort: quick
        priority: immediate
        
    - id: SEC-002
      severity: high
      category: authorization
      title: "缺少管理员权限检查"
      description: "删除用户接口未验证操作用户是否为管理员"
      location: "UserController.ts:45"
      code_snippet: |
        @Delete('/users/:id')
        async deleteUser(@Param('id') id: string) {
          await this.userService.delete(id)
        }
      
      vulnerability:
        type: "Missing Authorization"
        cwe: "CWE-862"
        owasp: "A01:2021 - Broken Access Control"
        
      impact:
        description: "普通用户可删除任意用户，包括管理员"
        exploit_scenario: |
          1. 普通用户登录
          2. 调用 DELETE /users/admin-id
          3. 管理员账号被删除
        affected_users: "所有用户"
        
      remediation:
        recommendation: "添加管理员权限检查"
        code_example: |
          @Delete('/users/:id')
          @RequireRole('admin')
          async deleteUser(@Param('id') id: string, @CurrentUser() user) {
            await this.userService.delete(id)
          }
        effort: quick
        priority: immediate
        
    - id: SEC-003
      severity: medium
      category: authentication
      title: "Token 未设置过期时间"
      description: "JWT Token 未设置 exp 字段"
      location: "JwtTokenService.ts:25"
      code_snippet: |
        jwt.sign(payload, secret)  // 缺少 expiresIn
      
      remediation:
        recommendation: "设置合理的过期时间"
        code_example: |
          jwt.sign(payload, secret, { expiresIn: '24h' })
        effort: quick
        priority: soon
        
  risk_assessment:
    overall_risk: critical
    
  gate_decision:
    decision: block
    conditions:
      - "必须修复 SEC-001（硬编码密钥）"
      - "必须修复 SEC-002（权限检查）"
      - "建议修复 SEC-003（Token 过期）"
      
  follow_up:
    - item: "重新审查修复后的代码"
      owner: "security-reviewer"
      due_date: "2026-03-23"
```

### 示例 2：通过但有建议

```yaml
security_review_report:
  scope:
    components_reviewed:
      - "AuthService.ts"
      
  findings:
    - id: SEC-001
      severity: low
      category: logging
      title: "登录失败日志缺少上下文"
      description: "登录失败日志未记录来源 IP"
      remediation:
        recommendation: "添加 IP 地址到日志"
        effort: quick
        priority: later
        
    - id: SEC-002
      severity: info
      category: authentication
      title: "建议支持 MFA"
      description: "当前只支持单因素认证"
      remediation:
        recommendation: "考虑添加多因素认证支持"
        effort: extensive
        priority: later
        
  risk_assessment:
    overall_risk: low
    
  gate_decision:
    decision: pass
    conditions: []
    
  recommendations:
    should_fix:
      - "添加 IP 地址到登录日志"
    consider:
      - "评估多因素认证需求"
```

## Checklists

### 审查前
- [ ] 认证相关代码已识别
- [ ] 已知漏洞库已准备
- [ ] 审查工具已就绪

### 审查中
- [ ] 认证机制已检查
- [ ] 授权机制已检查
- [ ] 传输安全已检查
- [ ] 日志监控已检查

### 审查后
- [ ] 漏洞已分级
- [ ] 修复建议已给出
- [ ] 风险已评估
- [ ] Gate 决策已做

## Notes

### 与 code-review-checklist 的关系
- code-review-checklist 包含基础安全检查
- auth-and-permission-review 专注认证授权
- 两者配合使用

### 自动化工具
- 静态分析：SAST 工具
- 依赖扫描：检查漏洞库
- 动态测试：渗透测试

### 人工审查重点
- 业务逻辑漏洞
- 复杂权限场景
- 工具无法检测的问题

### Gate 标准
- **pass**: 无严重/高危问题
- **needs-fix**: 有中低危问题需跟踪修复
- **block**: 有严重/高危问题必须修复

## Anti-Patterns (BR-001, BR-002, BR-003, BR-004)

### AP-001: Vague Security Warning (模糊安全警告)
**Definition**: 安全发现没有具体位置、理由或修复建议。
**Example**: "This code may be insecure."
**Prevention**: 要求每个 finding 包含 location、severity、rationale、remediation。
**BR Violation**: BR-001 (Security Must Be Actionable)

### AP-002: Missing Severity (缺少严重性分类)
**Definition**: 发现没有严重性分类。
**Example**: "There's an issue with the authentication flow."
**Prevention**: 要求所有 findings 必须有 severity 字段。
**BR Violation**: BR-004 (Severity Classification)

### AP-003: False Positive Without Evidence (无证据的误报)
**Definition**: 在没有代码证据的情况下声称漏洞。
**Example**: "This might have injection" 当所有查询都是参数化的。
**Prevention**: 要求提供 vulnerable code snippet 展示漏洞。
**BR Violation**: BR-002 (Evidence-Based Findings)

### AP-004: No Remediation (无修复建议)
**Definition**: 发现没有如何修复的指导。
**Example**: "This endpoint lacks authorization."
**Prevention**: 要求 remediation 字段包含 code example。
**BR Violation**: BR-001 (Security Must Be Actionable)

### AP-005: Security Scope Creep (安全范围蔓延)
**Definition**: 实现非 MVP 安全技能。
**Example**: 在 008 中实现 secret-handling-review。
**Prevention**: 明确范围边界，MVP 仅包含 auth-and-permission-review 和 input-validation-review。
**BR Violation**: BR-005 (MVP Boundary Discipline)

### AP-006: Gate Decision Omission (缺少 Gate 决策)
**Definition**: 安全报告没有 pass/needs-fix/block 决策。
**Example**: 发现报告结束但没有结论。
**Prevention**: 要求 gate_decision 字段必须存在。
**BR Violation**: BR-003 (Gate Decision Required)

## Role Boundaries

### Security Does NOT (BR-006)
- **修改实现代码**: Security 只提供发现，不修改代码
- **声明功能验收**: 接受决策是 reviewer 角色的职责
- **审查非安全方面**: 代码风格、架构决策是 reviewer 的职责

### Parallel Execution with Reviewer (BR-007)
- Security 与 reviewer 并行执行高风险任务
- Security gate decision 告知 reviewer，但不替代 reviewer 的接受决策
- Security block 通常导致 reviewer reject，直到安全问题解决

### Escalation Rules
当以下情况必须升级：
- **Critical 漏洞发现**: 立即通知 developer 和 reviewer
- **多个高危发现**: 可能表明系统性问题
- **修复需要设计变更**: 需要 architect 决策
- **第三方依赖漏洞**: 需要 management 决策

## Input/Output Specifications

### Required Inputs
| Input | Source | Purpose |
|-------|--------|---------|
| `changed_files` | developer | 确定审查范围 |
| `implementation-summary` | developer | 理解实现意图 |
| `task-risk-level` | feature context | 判断审查必要性 |

### Output Artifact
| Artifact | Contract | Purpose |
|----------|----------|---------|
| `security-review-report` | `specs/008-security-core/contracts/security-review-report-contract.md` | 认证授权发现报告 |

## Failure Modes

### Common Failure Modes
| Failure Mode | Detection | Prevention |
|--------------|-----------|------------|
| **Vague finding** | No specific location/remediation | Require finding structure |
| **Missing severity** | No severity field | Mandatory classification |
| **No code evidence** | No vulnerable snippet | Require code snippet |
| **No remediation** | Finding without fix | Mandatory remediation |
| **No gate decision** | Missing decision | Mandatory gate_decision |
