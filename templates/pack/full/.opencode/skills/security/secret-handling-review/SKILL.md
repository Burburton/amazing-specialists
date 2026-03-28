# Skill: secret-handling-review

## Purpose

审查密钥和敏感信息处理，确保密钥管理符合安全最佳实践。

解决的核心问题：
- 硬编码密钥泄露
- 密钥存储不安全
- 密钥日志泄露
- 密钥轮换缺失
- 密钥传输不安全

## When to Use

必须使用时：
- 涉及认证代码（密码、Token、API Key）
- 配置文件变更
- 新增外部服务集成
- 涉及加密/解密功能
- 标记为高风险的 task

推荐使用时：
- 任何涉及敏感数据的功能
- 环境变量变更
- 密钥配置更新
- 第三方 SDK 集成

## When Not to Use

不适用场景：
- 纯前端无密钥功能
- 公开数据无敏感信息
- 已通过 secret-handling-review
- 密钥管理在基础设施层（如 K8s Secrets）

## Secret Management Principles

### 1. 密钥分离原则
- 密钥与代码分离
- 密钥不进入代码仓库
- 密钥不进入构建产物

### 2. 密钥最小化原则
- 仅存储必要的密钥
- 密钥权限最小化
- 密钥生命周期最短

### 3. 密钥轮换原则
- 定期轮换密钥
- 支持无缝轮换
- 保留轮换历史

### 4. 密钥审计原则
- 记录密钥使用
- 监控密钥访问
- 告警异常行为

## Review Checklist

### 1. 硬编码密钥检查 (Hardcoded Secrets)

#### 1.1 源代码检查
- [ ] 是否有硬编码 API Key？
- [ ] 是否有硬编码密码？
- [ ] 是否有硬编码 Token？
- [ ] 是否有硬编码证书？
- [ ] 是否有硬编码私钥？

#### 1.2 配置文件检查
- [ ] 配置文件是否包含密钥？
- [ ] 配置文件是否提交到仓库？
- [ ] 配置示例是否包含真实密钥？

#### 1.3 测试代码检查
- [ ] 测试代码是否使用真实密钥？
- [ ] 测试数据是否包含敏感信息？
- [ ] Mock 是否泄露真实密钥？

### 2. 密钥存储检查 (Secret Storage)

#### 2.1 存储方式
- [ ] 密钥是否存储在安全位置？
- [ ] 是否使用密钥管理服务？
- [ ] 是否使用环境变量？
- [ ] 是否加密存储？

#### 2.2 存储访问
- [ ] 密钥访问是否受限？
- [ ] 是否有访问审计？
- [ ] 是否有访问过期？

### 3. 密钥使用检查 (Secret Usage)

#### 3.1 运行时加载
- [ ] 密钥是否在启动时加载？
- [ ] 密钥加载失败是否有错误？
- [ ] 密钥是否缓存在内存？

#### 3.2 密钥传递
- [ ] 密钥传递是否安全？
- [ ] 密钥是否通过参数传递？
- [ ] 密钥是否在日志中暴露？

### 4. 密钥日志检查 (Secret Logging)

#### 4.1 日志内容
- [ ] 日志是否包含密钥？
- [ ] 日志是否包含敏感数据？
- [ ] 错误日志是否泄露密钥？

#### 4.2 日志配置
- [ ] 日志级别是否合理？
- [ ] 是否有敏感数据过滤？
- [ ] 调试日志是否关闭？

### 5. 密钥轮换检查 (Secret Rotation)

#### 5.1 轮换机制
- [ ] 是否支持密钥轮换？
- [ ] 轮换是否自动化？
- [ ] 轮换是否有告警？

#### 5.2 轮换流程
- [ ] 轮换是否无缝？
- [ ] 老密钥是否失效？
- [ ] 轮换历史是否记录？

### 6. 密钥传输检查 (Secret Transport)

#### 6.1 传输方式
- [ ] 密钥是否通过 HTTPS 传输？
- [ ] 密钥是否在 URL 中传输？
- [ ] 密钥是否在 Header 中传输？

#### 6.2 传输加密
- [ ] 传输是否加密？
- [ ] 是否使用 TLS 1.2+？
- [ ] 是否验证证书？

## Common Vulnerabilities

| 漏洞 | 描述 | CWE | OWASP | 检测方法 | 修复建议 |
|------|------|-----|-------|----------|----------|
| **硬编码密钥** | 密钥在源代码中 | CWE-798 | A07:2021 Auth Failures | 搜索密钥字符串 | 使用环境变量 |
| **配置泄露** | 配置文件包含密钥 | CWE-526 | A05:2021 Security Misconfig | 检查配置文件 | 移除密钥 |
| **日志泄露** | 密钥在日志中 | CWE-532 | A09:2021 Logging Failures | 检查日志输出 | 日志脱敏 |
| **不安全存储** | 密钥存储不安全 | CWE-256 | A02:2021 Crypto Failures | 检查存储方式 | 使用密钥管理 |
| **无轮换机制** | 密钥从不轮换 | CWE-261 | A02:2021 Crypto Failures | 检查轮换逻辑 | 添加轮换 |
| **传输不加密** | 密钥明文传输 | CWE-319 | A02:2021 Crypto Failures | 检查传输方式 | 使用 HTTPS |

## Steps

### Step 1: 识别密钥相关代码
1. 读取 changed_files
2. 识别密钥配置文件
3. 识别密钥使用代码
4. 识别外部服务集成

### Step 2: 检查硬编码密钥
1. 搜索密钥字符串模式
2. 检查源代码中的密钥
3. 检查配置文件中的密钥
4. 检查测试代码中的密钥

### Step 3: 检查密钥存储
1. 检查存储位置
2. 检查存储方式
3. 检查存储加密
4. 检查访问控制

### Step 4: 检查密钥使用
1. 检查运行时加载
2. 检查密钥传递
3. 检查密钥缓存
4. 检查密钥销毁

### Step 5: 检查密钥日志
1. 检查日志输出
2. 检查错误日志
3. 检查调试日志
4. 检查日志过滤

### Step 6: 检查密钥轮换
1. 检查轮换机制
2. 检查轮换流程
3. 检查轮换告警

### Step 7: 生成安全报告

## Output Format

```yaml
secret_handling_review:
  dispatch_id: string
  task_id: string
  
  scope:
    secrets_reviewed:
      - type: api_key | password | token | certificate | private_key | encryption_key
        location: string
        description: string
        
  findings:
    - id: string
      severity: critical | high | medium | low | info
      category: hardcoded_secret | secret_storage | secret_usage | secret_logging | 
                secret_rotation | secret_transport
      title: string
      description: string
      location: string
      code_snippet: string
      
      secret_type: string
      
      vulnerability:
        type: string
        cwe: string
        owasp: string
        
      impact:
        description: string
        exploit_scenario: string
        affected_systems: string
        
      remediation:
        recommendation: string
        code_example: string
        effort: quick | moderate | extensive
        priority: immediate | soon | later
        
  secret_management:
    storage_method: string
    rotation_enabled: boolean
    audit_enabled: boolean
    
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

### 示例 1：发现硬编码密钥

```yaml
secret_handling_review:
  scope:
    secrets_reviewed:
      - type: api_key
        location: "src/services/PaymentService.ts"
        description: "Payment gateway API key"
      - type: encryption_key
        location: "src/utils/Encryption.ts"
        description: "AES encryption key"
        
  findings:
    - id: SEC-001
      severity: critical
      category: hardcoded_secret
      title: "Payment API Key Hardcoded"
      description: "Payment gateway API key is hardcoded in source code"
      location: "src/services/PaymentService.ts:15"
      code_snippet: |
        const API_KEY = 'pk_live_abc123xyz789'
        const client = new PaymentClient(API_KEY)
        
      secret_type: "api_key"
      
      vulnerability:
        type: "Hardcoded Credentials"
        cwe: "CWE-798"
        owasp: "A07:2021 - Identification and Authentication Failures"
        
      impact:
        description: "Attacker with code access can use the payment API key"
        exploit_scenario: |
          1. Attacker gains code repository access
          2. Extracts hardcoded API_KEY
          3. Uses key to make unauthorized payment requests
          4. Potentially causes financial loss
        affected_systems: "Payment processing system"
        
      remediation:
        recommendation: "Move API key to environment variable"
        code_example: |
          const API_KEY = process.env.PAYMENT_API_KEY
          if (!API_KEY) {
            throw new Error('PAYMENT_API_KEY not configured')
          }
        effort: quick
        priority: immediate
        
    - id: SEC-002
      severity: high
      category: secret_logging
      title: "API Key Logged on Error"
      description: "API key is logged when payment fails"
      location: "src/services/PaymentService.ts:35"
      code_snippet: |
        catch (error) {
          console.error(`Payment failed with key ${API_KEY}:`, error)
        }
        
      secret_type: "api_key"
      
      vulnerability:
        type: "Information Exposure Through Log Files"
        cwe: "CWE-532"
        owasp: "A09:2021 - Security Logging and Monitoring Failures"
        
      remediation:
        recommendation: "Remove API key from error log"
        code_example: |
          catch (error) {
            console.error('Payment failed:', error.message)
          }
        effort: quick
        priority: immediate
        
  risk_assessment:
    overall_risk: critical
    
  gate_decision:
    decision: block
    conditions:
      - "SEC-001 must be fixed: Move API key to environment variable"
      - "SEC-002 must be fixed: Remove API key from logs"
```

### 示例 2：通过但有建议

```yaml
secret_handling_review:
  scope:
    secrets_reviewed:
      - type: jwt_secret
        location: "src/config/auth.ts"
        description: "JWT signing secret"
        
  findings:
    - id: SEC-001
      severity: info
      category: secret_rotation
      title: "No JWT Secret Rotation Mechanism"
      description: "JWT secret has no rotation mechanism defined"
      remediation:
        recommendation: "Consider implementing secret rotation"
        effort: moderate
        priority: later
        
  secret_management:
    storage_method: "environment_variable"
    rotation_enabled: false
    audit_enabled: true
    
  risk_assessment:
    overall_risk: low
    
  gate_decision:
    decision: pass
    conditions: []
    
  recommendations:
    consider:
      - "Implement JWT secret rotation schedule"
      - "Add rotation automation"
```

## Anti-Patterns

### AP-001: Vague Secret Warning (模糊密钥警告)
**Definition**: 密钥发现没有具体位置、密钥类型或修复建议。
**Example**: "This code may expose secrets."
**Prevention**: 要求每个 finding 包含 location、secret_type、remediation。

### AP-002: Missing Secret Type (缺少密钥类型)
**Definition**: 发现没有声明密钥类型（api_key、password、token 等）。
**Example**: "There's a secret in the config."
**Prevention**: 要求 secret_type 字段。

### AP-003: False Positive Without Code (无代码证据)
**Definition**: 声称密钥泄露但没有展示代码。
**Example**: "API key might be exposed" 无代码片段。
**Prevention**: 要求 code_snippet 展示泄露点。

### AP-004: No Remediation (无修复建议)
**Definition**: 发现没有如何修复的指导。
**Example**: "Secret is hardcoded." 无修复方案。
**Prevention**: 要求 remediation.code_example。

### AP-005: Missing Storage Assessment (缺少存储评估)
**Definition**: 报告没有评估密钥存储方式。
**Example**: 报告结束没有 secret_management.storage_method。
**Prevention**: 要求 secret_management 部分。

### AP-006: Gate Decision Omission (缺少 Gate 决策)
**Definition**: 报告没有 pass/needs-fix/block 决策。
**Example**: 报告结束没有 gate_decision。
**Prevention**: 要求 gate_decision 字段。

## Role Boundaries

### Security Does NOT
- **修改实现代码**: Security 只提供发现，不修改代码
- **声明功能验收**: 接受决策是 reviewer 角色的职责
- **审查非安全方面**: 代码风格、架构决策是 reviewer 的职责

### Parallel Execution with Reviewer
- Security 与 reviewer 并行执行高风险任务
- Security gate decision 告知 reviewer，但不替代 reviewer 的接受决策
- Security block 通常导致 reviewer reject，直到安全问题解决

### Escalation Rules
当以下情况必须升级：
- **Critical 密钥泄露发现**: 立即通知 developer 和 reviewer
- **多个密钥泄露**: 可能系统性问题
- **第三方密钥泄露**: 需要 management 决策（联系供应商）
- **基础设施密钥泄露**: 需要 ops 团队决策

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
| `secret-handling-review-report` | Security review contract | 密钥处理发现报告 |

## Failure Modes

### Common Failure Modes
| Failure Mode | Detection | Prevention |
|--------------|-----------|------------|
| **Missing location** | No file/line | Require location field |
| **Missing secret type** | No type classification | Mandatory secret_type |
| **No code evidence** | No snippet | Require code_snippet |
| **No remediation** | Finding without fix | Mandatory remediation |
| **No gate decision** | Missing decision | Mandatory gate_decision |