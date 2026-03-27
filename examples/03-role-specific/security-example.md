# Security 角色示例

本文档展示 security 角色的具体工作方式和 skill 使用。

---

## 角色定义

**security** 负责安全审查，确保代码实现符合安全最佳实践。

### MVP Skills
- `auth-and-permission-review` - 认证权限审查
- `input-validation-review` - 输入验证审查

### M4 Skills (可选)
- `secret-handling-review` - 密钥处理审查
- `dependency-risk-review` - 依赖风险审查

---

## 角色特点

### 触发条件
security 角色通常在以下场景被触发：

1. **高风险任务** - risk_level = high
2. **认证/授权相关** - domain = auth
3. **敏感数据处理** - 涉及 PII、支付、密钥
4. **reviewer 推荐** - reviewer 发现安全疑虑

### 与其他角色的关系
```
architect → developer → tester → reviewer
                                    ↓
                              (如需安全检查)
                                    ↓
                               security
```

---

## 典型工作流程

### 输入
```yaml
dispatch_id: dsp-sec-001
role: security
command: security-review
title: 登录功能安全审查
risk_level: high
domain: auth

inputs:
  - artifact_id: impl-login-v1
    artifact_type: implementation_summary
    
  - artifact_id: design-login-v1
    artifact_type: design_note

expected_outputs:
  - security_report
```

### 执行过程

#### Step 1: 认证机制审查
```
使用 auth-and-permission-review skill:
1. 审查认证流程
2. 审查密码处理
3. 审查 Token 安全
4. 审查权限控制
```

#### Step 2: 输入验证审查
```
使用 input-validation-review skill:
1. 审查输入验证
2. 审查 SQL 注入防护
3. 审查 XSS 防护
4. 审查 CSRF 防护
```

#### Step 3: 密钥处理审查 (M4)
```
使用 secret-handling-review skill:
1. 检查硬编码密钥
2. 检查密钥存储方式
3. 检查密钥传输安全
```

### 输出
```yaml
status: SUCCESS  # 或 FAILED_ESCALATE
summary: 安全审查完成

issues_found:
  - severity: medium
    description: 建议添加速率限制
    recommendation: 后续优化
    
gate_recommendation: PASS  # 或 BLOCK
recommendation: CONTINUE
```

---

## Skill 使用示例

### auth-and-permission-review

**何时使用**: 审查认证授权相关代码

**审查清单**:
```
## 密码安全
- [ ] 密码是否加密存储? (bcrypt, argon2)
- [ ] 密码比对是否使用恒定时间算法?
- [ ] 是否有密码强度要求?
- [ ] 是否有密码重试限制?

## Token 安全
- [ ] Token 是否有有效期?
- [ ] Token 是否包含敏感信息?
- [ ] Token 是否使用安全算法签名?
- [ ] Token 是否通过安全方式传输?

## 会话管理
- [ ] 是否有会话超时?
- [ ] 是否支持会话撤销?
- [ ] 是否有并发登录限制?
```

### input-validation-review

**何时使用**: 审查输入处理代码

**审查清单**:
```
## 输入验证
- [ ] 所有输入是否已验证?
- [ ] 是否使用白名单验证?
- [ ] 是否有长度限制?
- [ ] 是否有类型检查?

## 注入防护
- [ ] SQL 注入防护? (参数化查询)
- [ ] XSS 防护? (输出编码)
- [ ] 命令注入防护?
- [ ] 路径遍历防护?

## 错误处理
- [ ] 错误信息是否泄露敏感信息?
- [ ] 是否有统一的错误处理?
```

### secret-handling-review (M4)

**何时使用**: 审查密钥和敏感数据处理

**审查清单**:
```
## 密钥存储
- [ ] 无硬编码密钥?
- [ ] 使用环境变量?
- [ ] 使用密钥管理服务?

## 密钥传输
- [ ] HTTPS 传输?
- [ ] 不在日志中打印?
- [ ] 不在响应中返回?

## 密钥轮换
- [ ] 支持密钥轮换?
- [ ] 有密钥过期机制?
```

---

## 安全报告模板

```markdown
# Security Report: {feature-name}

## 审查范围
- 认证机制
- 输入验证
- 密钥处理

## 发现的问题

### Critical (必须修复)
| ID | 描述 | 影响 | 建议 |
|----|------|------|------|
| - | - | - | - |

### High (建议修复)
| ID | 描述 | 影响 | 建议 |
|----|------|------|------|
| - | - | - | - |

### Medium (可接受风险)
| ID | 描述 | 影响 | 建议 |
|----|------|------|------|
| SEC-001 | 无速率限制 | 暴力破解风险 | 添加速率限制 |

## 审查结论
**Gate**: PASS | BLOCK

## 建议
1. 添加登录速率限制
2. 考虑添加 MFA 支持
```

---

## Escalation 机制

当发现 **critical** 级别安全问题时：

```yaml
status: FAILED_ESCALATE

issues_found:
  - severity: critical
    description: 密码明文存储
    impact: 数据泄露风险
    
gate_recommendation: BLOCK

escalation:
  level: USER
  reason: 需要业务决策修复方案
  options:
    - 修复方案 A: 数据迁移
    - 修复方案 B: 接受风险
```

---

## 质量门禁

security 输出必须满足:
- [ ] 完成认证审查
- [ ] 完成输入验证审查
- [ ] 问题严重度正确分类
- [ ] 给出明确的 gate 决策 (PASS/BLOCK)
- [ ] Critical 问题必须升级