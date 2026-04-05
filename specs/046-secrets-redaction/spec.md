# Feature: Secrets Redaction

## Feature ID
`046-secrets-redaction`

## Status
`complete`

## Version
`0.1.0`

## Created
2026-04-05

---

## Overview

### Goal
在错误报告发布到 GitHub Issue 之前，自动检测并过滤敏感信息（tokens, passwords, secrets, API keys），防止敏感数据泄露。

### Background

**问题**：
- `045-auto-error-report` 的安全审查发现 Sec-002：secrets redaction 未实现
- 错误报告可能包含敏感信息（stack traces 中的环境变量、配置文件路径、token 值）
- 自动发布到 GitHub Issue 会将敏感信息公开暴露

**风险**：
- GitHub Token 泄露
- API Keys 暴露
- 数据库密码泄露
- 私密配置暴露

---

## Scope

### In Scope

1. **敏感信息检测**：识别常见的敏感信息模式
2. **自动过滤**：在发布前替换敏感信息为 `[REDACTED]`
3. **可配置规则**：支持自定义敏感信息模式
4. **日志安全**：确保日志中也不泄露敏感信息

### Out of Scope

- 加密存储敏感信息（只做过滤，不做加密）
- 运行时环境变量保护（只处理错误报告中的内容）
- 修改原始错误报告（只过滤输出副本）

---

## Actors

| Actor | Role |
|-------|------|
| **auto-error-report** | 调用 secrets-redaction 进行过滤 |
| **github-issue-reporter** | 在发布前调用过滤模块 |
| **User** | 配置自定义敏感信息模式 |

---

## Core Workflows

### Workflow 1: 错误报告过滤流程

```
error-report artifact 生成
    │
    ▼
secrets-redaction 检测敏感信息
    │
    ├─ 检测标准模式（tokens, passwords, keys）
    │
    ├─ 检测自定义模式
    │
    └─ 检测环境变量引用
    │
    ▼
替换敏感信息为 [REDACTED]
    │
    ▼
生成安全副本
    │
    ▼
发布到 GitHub Issue
```

### Workflow 2: 配置规则

```
用户创建 .opencode/secrets-redaction.json
    │
    ├─ enabled: true/false
    ├─ default_patterns: [...]
    └─ custom_patterns: [...]
```

---

## Functional Requirements

### FR-001: 默认敏感信息模式

定义常见敏感信息的检测模式。

**默认模式**：
| 类型 | 模式 | 示例 |
|------|------|------|
| GitHub Token | `ghp_[a-zA-Z0-9]{36}` | `ghp_xxxxxxxxxxxx` |
| GitHub App Token | `ghs_[a-zA-Z0-9]{36}` | `ghs_xxxxxxxxxxxx` |
| AWS Access Key | `AKIA[0-9A-Z]{16}` | `AKIAIOSFODNN7EXAMPLE` |
| AWS Secret Key | `[A-Za-z0-9/+=]{40}` (context-aware) | `wJalrXUtnFEMI/...` |
| API Key Generic | `(?i)(api[_-]?key|apikey)['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{20,}` | `api_key: sk-xxxx` |
| Password | `(?i)(password|passwd|pwd)['\"]?\s*[:=]\s*['\"]?[^\s'\"]{8,}` | `password: secret123` |
| Secret Generic | `(?i)(secret|token)['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{16,}` | `secret: mysecret` |
| Private Key | `-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----` | PEM 格式私钥 |
| Connection String | `(?i)(connection[_-]?string|connstr)['\"]?\s*[:=]\s*['\"]?[^'\"]+` | 数据库连接串 |
| Environment Variable | `\$\{[A-Z_][A-Z0-9_]*\}` | `${MY_SECRET}` |
| Bearer Token | `Bearer\s+[a-zA-Z0-9._-]+` | `Bearer eyJ...` |
| JWT | `eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*` | JWT tokens |

### FR-002: 过滤算法

实现高效的敏感信息过滤算法。

**算法步骤**：
1. 深度遍历 error-report 对象
2. 对每个字符串字段应用所有模式
3. 匹配到的内容替换为 `[REDACTED:<type>]`
4. 保留过滤日志（不包含敏感信息）

**输出格式**：
```
原始：api_key: sk-1234567890abcdefghijklmnop
过滤后：api_key: [REDACTED:api-key]
```

### FR-003: 可配置规则

支持用户自定义敏感信息模式。

**配置文件** `.opencode/secrets-redaction.json`：
```json
{
  "enabled": true,
  "default_patterns": {
    "github_token": true,
    "aws_credentials": true,
    "api_keys": true,
    "passwords": true,
    "private_keys": true
  },
  "custom_patterns": [
    {
      "name": "my_company_api_key",
      "pattern": "MYCOMP-[a-zA-Z0-9]{32}",
      "replacement": "[REDACTED:company-key]"
    }
  ],
  "context_patterns": [
    {
      "key_pattern": "my_secret",
      "value_pattern": ".*",
      "description": "Any value after 'my_secret:'"
    }
  ]
}
```

### FR-004: 过滤位置

在以下位置应用过滤：

| 位置 | 时机 | 说明 |
|------|------|------|
| `github-issue-reporter` | 发布评论前 | 过滤评论内容 |
| `auto-error-report` | 调用 reporter 前 | 过滤 error-report |
| 日志输出 | 写入日志前 | 过滤日志字符串 |

### FR-005: 审计日志

记录过滤操作（不记录敏感信息）。

**日志格式**：
```json
{
  "timestamp": "2026-04-05T10:30:00Z",
  "action": "secrets_redaction",
  "input_type": "error-report",
  "patterns_matched": ["github_token", "password"],
  "fields_redacted": ["error_details.stacktrace", "context.config"],
  "output_status": "success"
}
```

---

## Non-functional Requirements

### NFR-001: 性能
- 过滤操作 < 50ms（典型 error-report）
- 不显著影响错误报告发布延迟

### NFR-002: 准确性
- 误报率 < 5%（非敏感信息被误判）
- 漏报率 < 1%（敏感信息未被检测）

### NFR-003: 可扩展性
- 支持添加新模式无需修改核心代码
- 支持禁用特定默认模式

---

## Acceptance Criteria

### AC-001: 默认模式检测
- [ ] 所有 10 种默认模式正确检测
- [ ] 测试用例覆盖各种变体

### AC-002: 过滤功能
- [ ] 敏感信息替换为 `[REDACTED:<type>]`
- [ ] 不修改原始 error-report（只过滤副本）

### AC-003: 自定义模式
- [ ] 用户可通过配置添加自定义模式
- [ ] 自定义模式与默认模式同时生效

### AC-004: 集成点
- [ ] github-issue-reporter 发布前调用过滤
- [ ] auto-error-report 调用前调用过滤

### AC-005: 测试覆盖
- [ ] 单元测试覆盖所有模式
- [ ] 集成测试验证端到端过滤

---

## Technical Constraints

### TC-001: Dependencies
- Feature 044: github-issue-reporter
- Feature 045: auto-error-report

### TC-002: File Locations
- `lib/secrets-redaction/index.js` - 核心模块
- `lib/secrets-redaction/patterns.js` - 默认模式定义
- `lib/secrets-redaction/scrubber.js` - 过滤逻辑
- `.opencode/secrets-redaction.json` - 配置文件
- `tests/unit/secrets-redaction/` - 单元测试

---

## Risks

### Risk-001: 性能影响
- **缓解**: 使用高效正则引擎，预编译模式

### Risk-002: 误报
- **缓解**: 提供白名单机制，允许用户排除特定字段

### Risk-003: 漏报
- **缓解**: 定期更新默认模式，支持社区贡献

---

## Milestones

### M1: 核心模块
- 实现模式定义
- 实现过滤算法
- 单元测试

### M2: 配置系统
- 配置加载器
- 自定义模式支持
- 测试

### M3: 集成
- 集成到 github-issue-reporter
- 集成到 auto-error-report
- 集成测试

### M4: 文档与验证
- 使用文档
- 安全验证
- 发布

---

## References

- `specs/045-auto-error-report/security-review-report.md` - Sec-002 发现
- OWASP Secrets Management
- GitHub Token Format Documentation