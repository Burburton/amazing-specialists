# Secrets Redaction Configuration Contract

## Contract ID
`SEC-RED-001`

## Version
`1.0.0`

## Producer Role
`common` (所有角色可用)

## Consumer Roles
- `secrets-redaction` (配置加载器消费)
- `github-issue-reporter` (间接消费)
- `auto-error-report` (间接消费)
- `security` (安全审查参考)

---

## Purpose

为 secrets-redaction 模块提供配置接口，确保敏感信息过滤规则可配置、可扩展、可审计。

**核心问题解决**：
- 默认模式无法覆盖所有场景（如企业内部 API Key 格式）
- 用户无法禁用特定模式（如误报场景）
- 白名单机制缺失（如已知安全字段）
- 配置验证规则不统一

---

## Artifact Schema

### secrets-redaction-config

```yaml
secrets-redaction-config:
  config_type: secrets-redaction-config    # 固定类型
  
  global_settings:
    enabled: boolean                       # 启用/禁用过滤
    replacement_format: string             # 替换格式模板
    
  pattern_control:
    default_patterns:                      # 默认模式启用状态
      github_token: boolean
      github_app_token: boolean
      aws_access_key: boolean
      aws_secret_key: boolean
      api_key_generic: boolean
      password: boolean
      secret_generic: boolean
      private_key: boolean
      connection_string: boolean
      env_var_ref: boolean
      bearer_token: boolean
      jwt: boolean
      
    custom_patterns:                       # 用户自定义模式
      - name: string                       # 模式名称（唯一）
        pattern: string                    # 正则表达式字符串
        replacement: string                # 替换文本
        severity: enum                     # 严重级别
          - critical
          - high
          - medium
        description: string                # 描述
        
    context_patterns:                      # 上下文模式（键值对）
      - key_pattern: string                # 键名匹配模式
        value_pattern: string              # 值匹配模式
        replacement: string                # 替换文本
        description: string                # 描述
        
  field_control:
    whitelist_fields:                      # 白名单字段（不被过滤）
      - string                             # 字段路径（dot notation）
      
  metadata:
    config_file: string                    # 配置文件路径
    created_at: timestamp                  # 创建时间（可选）
    updated_at: timestamp                  # 更新时间（可选）
```

---

## Required Fields

以下字段必须存在且非空：

- `config_type` (固定值 `secrets-redaction-config`)
- `global_settings.enabled`
- `pattern_control.default_patterns` (至少一个)

---

## Default Pattern Definitions

### Default Pattern Catalog

| Pattern ID | Name | Description | Default Status |
|------------|------|-------------|----------------|
| `DP-001` | github_token | GitHub Personal Access Token | enabled |
| `DP-002` | github_app_token | GitHub App Token | enabled |
| `DP-003` | aws_access_key | AWS Access Key ID | enabled |
| `DP-004` | aws_secret_key | AWS Secret Access Key | enabled |
| `DP-005` | api_key_generic | Generic API Key | enabled |
| `DP-006` | password | Password in config | enabled |
| `DP-007` | secret_generic | Generic Secret/Token | enabled |
| `DP-008` | private_key | PEM Private Key Header | enabled |
| `DP-009` | connection_string | Database Connection String | enabled |
| `DP-010` | env_var_ref | Environment Variable Reference | enabled |
| `DP-011` | bearer_token | Bearer Token | enabled |
| `DP-012` | jwt | JWT Token | enabled |

### Pattern Regex Definitions

| Pattern ID | Regex | Example Match |
|------------|-------|---------------|
| DP-001 | `ghp_[a-zA-Z0-9]{36}` | `ghp_xxxx...` |
| DP-002 | `ghs_[a-zA-Z0-9]{36}` | `ghs_xxxx...` |
| DP-003 | `AKIA[0-9A-Z]{16}` | `AKIAIOSFODNN7EXAMPLE` |
| DP-004 | `[A-Za-z0-9/+=]{40}` (context-aware) | 40-char base64 |
| DP-005 | `(?i)(api[_-]?key|apikey)['\"]?\s*[:=]...` | `api_key: xxx` |
| DP-006 | `(?i)(password|passwd|pwd)['\"]?\s*[:=]...` | `password: xxx` |
| DP-007 | `(?i)(secret|token)['\"]?\s*[:=]...` | `secret: xxx` |
| DP-008 | `-----BEGIN\s+(RSA\s+|EC\s+|DSA\s+)?PRIVATE\s+KEY-----` | PEM header |
| DP-009 | `(?i)(connection[_-]?string|connstr)['\"]?\s*[:=]...` | Connection string |
| DP-010 | `\$\{[A-Z_][A-Z0-9_]*\}` | `${MY_SECRET}` |
| DP-011 | `Bearer\s+[a-zA-Z0-9._-]+` | `Bearer xxx` |
| DP-012 | `eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*` | JWT |

---

## Custom Pattern Rules

### Pattern Naming Convention

- 必须唯一（不与默认模式名称冲突）
- 推荐格式：`custom_<organization>_<type>`
- 示例：`custom_company_api_key`, `custom_internal_token`

### Pattern Validation Rules

| Rule | Description | Error Handling |
|------|-------------|----------------|
| **Unique Name** | 名称不能重复 | 拒绝配置，返回验证错误 |
| **Valid Regex** | 正则表达式必须有效 | 跳过该模式，记录警告 |
| **Non-empty Replacement** | 替换文本不能为空 | 使用默认 `[REDACTED:{name}]` |

### Custom Pattern Priority

- 自定义模式与默认模式**同等优先级**
- 应用顺序：默认模式 → 自定义模式
- 多个模式匹配同一内容：**全部替换**（最后一次生效）

---

## Context Pattern Rules

### Context Pattern Semantics

Context patterns 用于键值对过滤：
- `key_pattern`: 匹配配置项键名（如 `my_secret`, `internal_token`）
- `value_pattern`: 匹配值内容（通常 `.*` 表示任意值）
- 当键名匹配时，值被替换

### Context Pattern Example

```json
{
  "key_pattern": "my_secret",
  "value_pattern": ".*",
  "replacement": "[REDACTED:context]"
}
```

**Matching**:
```javascript
// Input object
{ my_secret: "actual_value_12345", other_field: "safe" }

// After context pattern
{ my_secret: "[REDACTED:context]", other_field: "safe" }
```

---

## Whitelist Rules

### Whitelist Field Path Format

使用 dot notation 表示嵌套路径：
- `error_details.error_code` - 顶层字段
- `error_details.description` - 嵌套字段
- `context.config.*` - 数组元素（不支持，使用具体路径）

### Whitelist Behavior

- 白名单字段**跳过所有模式匹配**
- 用于已知安全的字段（如 error_code 本身不含敏感信息）
- 白名单滥用警告：用户不应将敏感字段加入白名单

### Whitelist Validation

| Invalid Path | Handling |
|--------------|----------|
| Empty string | Ignored |
| Invalid syntax | Ignored |
| Non-existent field | Ignored (no error) |

---

## Validation Rules

### Schema Validation

- JSON Schema Draft 2020-12 格式
- 必需字段检查
- 枚举值验证（severity, pattern names）
- 数组元素类型验证

### Business Rules

#### BR-001: Pattern Name Uniqueness
- 自定义模式名称不能与默认模式名称相同
- 自定义模式之间不能重名

#### BR-002: Replacement Format
- `replacement_format` 必须包含 `{type}` 占位符（如使用类型替换）
- 默认值：`[REDACTED:{type}]`

#### BR-003: Enabled Pattern Minimum
- 至少一个默认模式启用（否则过滤无效）

#### BR-004: Regex Safety
- 自定义正则表达式不能包含危险模式（如无限回溯）
- 检测潜在 ReDoS 模式

---

## Configuration File Schema

### JSON Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-2020-12/schema#",
  "$id": "secrets-redaction-config.schema.json",
  "title": "Secrets Redaction Configuration Schema",
  "type": "object",
  "required": ["enabled", "default_patterns"],
  "properties": {
    "enabled": {
      "type": "boolean",
      "default": true
    },
    "default_patterns": {
      "type": "object",
      "properties": {
        "github_token": { "type": "boolean", "default": true },
        "github_app_token": { "type": "boolean", "default": true },
        "aws_access_key": { "type": "boolean", "default": true },
        "aws_secret_key": { "type": "boolean", "default": true },
        "api_key_generic": { "type": "boolean", "default": true },
        "password": { "type": "boolean", "default": true },
        "secret_generic": { "type": "boolean", "default": true },
        "private_key": { "type": "boolean", "default": true },
        "connection_string": { "type": "boolean", "default": true },
        "env_var_ref": { "type": "boolean", "default": true },
        "bearer_token": { "type": "boolean", "default": true },
        "jwt": { "type": "boolean", "default": true }
      },
      "additionalProperties": false
    },
    "custom_patterns": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "pattern", "replacement"],
        "properties": {
          "name": { "type": "string" },
          "pattern": { "type": "string" },
          "replacement": { "type": "string" },
          "severity": { 
            "type": "string", 
            "enum": ["critical", "high", "medium"],
            "default": "high"
          },
          "description": { "type": "string" }
        }
      }
    },
    "context_patterns": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["key_pattern", "value_pattern"],
        "properties": {
          "key_pattern": { "type": "string" },
          "value_pattern": { "type": "string" },
          "replacement": { "type": "string", "default": "[REDACTED:context]" },
          "description": { "type": "string" }
        }
      }
    },
    "whitelist_fields": {
      "type": "array",
      "items": { "type": "string" }
    },
    "replacement_format": {
      "type": "string",
      "default": "[REDACTED:{type}]"
    }
  }
}
```

---

## Examples

### Example 1: Minimal Configuration

```json
{
  "$schema": "./secrets-redaction-config.schema.json",
  "enabled": true,
  "default_patterns": {
    "github_token": true,
    "password": true
  }
}
```

### Example 2: Full Configuration with Custom Patterns

```json
{
  "$schema": "./secrets-redaction-config.schema.json",
  "enabled": true,
  "default_patterns": {
    "github_token": true,
    "github_app_token": true,
    "aws_access_key": true,
    "aws_secret_key": true,
    "api_key_generic": true,
    "password": true,
    "secret_generic": true,
    "private_key": true,
    "connection_string": true,
    "env_var_ref": false,
    "bearer_token": true,
    "jwt": true
  },
  "custom_patterns": [
    {
      "name": "company_api_key",
      "pattern": "MYCOMP-[a-zA-Z0-9]{32}",
      "replacement": "[REDACTED:company-key]",
      "severity": "critical",
      "description": "Company internal API key format"
    }
  ],
  "context_patterns": [
    {
      "key_pattern": "internal_token",
      "value_pattern": ".*",
      "replacement": "[REDACTED:internal]",
      "description": "Any internal_token value"
    }
  ],
  "whitelist_fields": [
    "error_details.error_code"
  ],
  "replacement_format": "[REDACTED:{type}]"
}
```

### Example 3: Disabled Redaction

```json
{
  "$schema": "./secrets-redaction-config.schema.json",
  "enabled": false,
  "default_patterns": {}
}
```

---

## Relationship to Other Artifacts

### 与 Error Report 的关系

| Artifact | 职责 | 输出 |
|----------|------|------|
| secrets-redaction-config | 配置过滤规则 | SecretsRedactionConfig |
| error-report | 待过滤内容 | ErrorReport (input) |
| scrubbed-error-report | 过滤后内容 | ErrorReport (output, filtered) |

**协作模式**：
- secrets-redaction-config 定义过滤规则
- secrets-redaction 模块消费配置，过滤 error-report
- 输出安全副本，不影响原始 artifact

### 与 Auto Error Report 的关系

| auto-report.json field | secrets-redaction-config behavior |
|------------------------|-----------------------------------|
| `privacy.redact_secrets: true` | 启用 secrets-redaction |
| `privacy.include_stack_trace: false` | 跳过 stacktrace 字段 |

---

## Security Considerations

### Secure Configuration

- 配置文件不包含敏感信息
- 配置验证防止注入攻击
- 白名单滥用风险警告

### Configuration Audit

- 记录配置变更（可选）
- 检测禁用所有模式（无效配置）
- 检测危险正则表达式（ReDoS）

---

## References

- `specs/045-auto-error-report/security-review-report.md` - Sec-002 finding
- `specs/043-error-reporter/contracts/error-report-contract.md` - Error Report Contract
- `specs/046-secrets-redaction/data-model.md` - Data Model Definitions
- `.opencode/skills/security/secret-handling-review/SKILL.md` - Security review skill
- OWASP Secrets Management Cheatsheet