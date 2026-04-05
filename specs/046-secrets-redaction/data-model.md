# Data Model: 046-secrets-redaction

## Metadata
```yaml
feature_id: 046-secrets-redaction
data_model_version: 1.0.0
created_at: 2026-04-05
status: Draft
```

---

## Overview

本 Data Model 定义 Feature 046 涉及的数据结构，主要包括：
- Secrets Redaction Configuration Schema
- Secret Pattern Definition Structure
- Scrub Result Structure
- Audit Log Entry Structure
- Custom Pattern Schema
- Context Pattern Schema

---

## Data Entities

### Entity 1: Secrets Redaction Configuration

**Purpose**: 控制敏感信息过滤的启用状态、默认模式、自定义规则

**Storage**: `.opencode/secrets-redaction.json`

**Schema Definition**:

```json
{
  "$schema": "http://json-schema.org/draft-2020-12/schema#",
  "$id": "secrets-redaction-config.schema.json",
  "title": "Secrets Redaction Configuration",
  "description": "Configuration for automatic secrets redaction in error reports",
  "type": "object",
  "required": ["enabled", "default_patterns"],
  "properties": {
    "enabled": {
      "type": "boolean",
      "default": true,
      "description": "Enable/disable secrets redaction"
    },
    "default_patterns": {
      "type": "object",
      "description": "Enable/disable specific default patterns",
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
      "description": "User-defined secret patterns",
      "items": {
        "$ref": "#/definitions/CustomPattern"
      },
      "default": []
    },
    "context_patterns": {
      "type": "array",
      "description": "Context-aware patterns (key-value pairs)",
      "items": {
        "$ref": "#/definitions/ContextPattern"
      },
      "default": []
    },
    "whitelist_fields": {
      "type": "array",
      "description": "Field paths to exclude from redaction",
      "items": { "type": "string" },
      "default": []
    },
    "replacement_format": {
      "type": "string",
      "default": "[REDACTED:{type}]",
      "description": "Format for redacted content. Use {type} placeholder"
    }
  },
  "definitions": {
    "CustomPattern": {
      "type": "object",
      "required": ["name", "pattern", "replacement"],
      "properties": {
        "name": {
          "type": "string",
          "description": "Unique pattern identifier"
        },
        "pattern": {
          "type": "string",
          "description": "Regular expression pattern (string format)"
        },
        "replacement": {
          "type": "string",
          "description": "Replacement text when matched"
        },
        "severity": {
          "type": "string",
          "enum": ["critical", "high", "medium"],
          "default": "high"
        },
        "description": {
          "type": "string",
          "description": "Pattern description"
        }
      }
    },
    "ContextPattern": {
      "type": "object",
      "required": ["key_pattern", "value_pattern"],
      "properties": {
        "key_pattern": {
          "type": "string",
          "description": "Pattern to match key names"
        },
        "value_pattern": {
          "type": "string",
          "description": "Pattern to match values (usually .* for any value)"
        },
        "replacement": {
          "type": "string",
          "default": "[REDACTED:context]",
          "description": "Replacement text"
        },
        "description": {
          "type": "string",
          "description": "Pattern description"
        }
      }
    }
  }
}
```

**Example Configuration**:

```json
{
  "$schema": "./secrets-redaction-config.schema.json",
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
      "replacement": "[REDACTED:company-key]",
      "severity": "critical"
    }
  ],
  "context_patterns": [
    {
      "key_pattern": "my_secret",
      "value_pattern": ".*",
      "replacement": "[REDACTED:context]",
      "description": "Any value after 'my_secret:'"
    }
  ],
  "whitelist_fields": [
    "error_details.error_code"
  ],
  "replacement_format": "[REDACTED:{type}]"
}
```

---

### Entity 2: Secret Pattern Definition

**Purpose**: 定义单个敏感信息检测模式的结构

**Storage**: 内存（patterns.js 定义）

**Structure**:

```typescript
interface SecretPattern {
  name: string;                              // 模式唯一标识
  type: string;                              // 替换类型标识（用于 replacement）
  pattern: RegExp;                           // 正则表达式
  description: string;                       // 模式描述
  severity: 'critical' | 'high' | 'medium';  // 严重级别
  examples: string[];                        // 匹配示例（用于测试/文档）
}
```

**Pattern Severity Mapping**:
| Severity | Criteria | Example Patterns |
|----------|----------|-----------------|
| critical | 直接可利用的认证凭证 | github_token, aws_access_key, private_key, password, bearer_token, jwt |
| high | 可间接利用的凭证 | api_key_generic, secret_generic, connection_string, aws_secret_key |
| medium | 环境变量引用、潜在敏感信息 | env_var_ref |

**Complete Pattern List**:

| Pattern Name | Type | Regex | Severity | Description |
|--------------|------|-------|----------|-------------|
| github_token | github-token | `ghp_[a-zA-Z0-9]{36}` | critical | GitHub Personal Access Token |
| github_app_token | github-app-token | `ghs_[a-zA-Z0-9]{36}` | critical | GitHub App Token |
| aws_access_key | aws-access-key | `AKIA[0-9A-Z]{16}` | critical | AWS Access Key ID |
| aws_secret_key | aws-secret-key | `[A-Za-z0-9/+=]{40}` (context) | high | AWS Secret Key |
| api_key_generic | api-key | `(?i)(api[_-]?key|apikey)['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{20,}` | high | Generic API Key |
| password | password | `(?i)(password|passwd|pwd)['\"]?\s*[:=]\s*['\"]?[^\s'\"]{8,}` | critical | Password |
| secret_generic | secret | `(?i)(secret|token)['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{16,}` | high | Generic Secret |
| private_key | private-key | `-----BEGIN\s+(RSA\s+|EC\s+|DSA\s+)?PRIVATE\s+KEY-----` | critical | PEM Private Key |
| connection_string | connection-string | `(?i)(connection[_-]?string|connstr)['\"]?\s*[:=]\s*['\"]?[^'\"]+` | high | Connection String |
| env_var_ref | env-var | `\$\{[A-Z_][A-Z0-9_]*\}` | medium | Environment Variable Reference |
| bearer_token | bearer-token | `Bearer\s+[a-zA-Z0-9._-]+` | critical | Bearer Token |
| jwt | jwt | `eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*` | critical | JWT Token |

---

### Entity 3: Scrub Result

**Purpose**: 返回过滤操作的结果和统计信息

**Storage**: 临时（函数返回）

**Structure**:

```typescript
interface ScrubResult {
  scrubbed: any;                   // 过滤后的对象（安全副本）
  patterns_matched: string[];      // 匹配的模式名称列表
  fields_redacted: string[];       // 被过滤的字段路径列表
  redaction_count: number;         // 过滤次数总计
}

interface StringScrubResult {
  result: string;                  // 过滤后的字符串
  matches: string[];               // 匹配的模式名称列表
}
```

**Field Path Format**:
- 使用 dot notation 表示嵌套路径
- 示例：`error_details.stacktrace_or_context`, `context.config.password`

**Result Scenarios**:
| Scenario | patterns_matched | fields_redacted | redaction_count |
|----------|-----------------|-----------------|-----------------|
| No secrets found | [] | [] | 0 |
| GitHub token found | ['github_token'] | ['error_details.stacktrace_or_context'] | 1 |
| Multiple secrets | ['github_token', 'password', 'api_key_generic'] | ['stacktrace', 'config.api_key', 'config.password'] | 3 |

---

### Entity 4: Audit Log Entry

**Purpose**: 记录过滤操作的审计日志（不含敏感信息）

**Storage**: 内存（可选持久化）

**Structure** (FR-005):

```typescript
interface AuditLogEntry {
  timestamp: string;                     // ISO 8601 格式时间戳
  action: 'secrets_redaction';           // 固定值
  input_type: 'error-report' | 'comment' | 'log';  // 输入类型
  patterns_matched: string[];            // 匹配的模式名称
  fields_redacted: string[];             // 被过滤的字段路径
  output_status: 'success' | 'no_matches' | 'error';  // 输出状态
  redaction_count: number;               // 过滤次数
  source: string;                        // 来源模块（caller）
}
```

**Important**: 审计日志**绝不**包含原始敏感信息或过滤后的内容。

---

### Entity 5: Redaction Result (API Response)

**Purpose**: 返回给调用者的完整结果

**Storage**: 临时（函数返回）

**Structure**:

```typescript
interface RedactionResult {
  success: boolean;                      // 操作是否成功
  scrubbed?: any;                        // 过滤后的对象（success=true）
  patterns_matched?: string[];           // 匹配的模式列表
  fields_redacted?: string[];            // 被过滤的字段列表
  redaction_count?: number;              // 过滤次数
  error?: string;                        // 错误信息（success=false）
}
```

**Result Scenarios**:
| Scenario | success | scrubbed | error |
|----------|---------|----------|-------|
| Config disabled | false | undefined | 'disabled' |
| Scrub success | true | { filtered object } | undefined |
| Scrub failed | false | original object | error message |

---

### Entity 6: Custom Pattern

**Purpose**: 用户自定义的敏感信息检测模式

**Storage**: `.opencode/secrets-redaction.json` → `custom_patterns[]`

**Structure**:

```typescript
interface CustomPattern {
  name: string;                          // 模式名称
  pattern: string;                       // 正则表达式字符串
  replacement: string;                   // 替换文本
  severity: 'critical' | 'high' | 'medium';  // 严重级别
  description?: string;                  // 可选描述
}
```

**Pattern String to RegExp Conversion**:
```javascript
function compileCustomPattern(pattern: CustomPattern): SecretPattern {
  return {
    name: pattern.name,
    type: pattern.name,  // use name as type
    pattern: new RegExp(pattern.pattern, 'g'),
    description: pattern.description || `Custom pattern: ${pattern.name}`,
    severity: pattern.severity,
    examples: []
  };
}
```

---

### Entity 7: Context Pattern

**Purpose**: 基于键名上下文过滤值的模式

**Storage**: `.opencode/secrets-redaction.json` → `context_patterns[]`

**Structure**:

```typescript
interface ContextPattern {
  key_pattern: string;                   // 键名匹配正则
  value_pattern: string;                 // 值匹配正则（通常 .*）
  replacement: string;                   // 替换文本
  description?: string;                  // 可选描述
}
```

**Usage Example**:
```json
{
  "key_pattern": "my_secret",
  "value_pattern": ".*",
  "replacement": "[REDACTED:context]",
  "description": "Any value after 'my_secret:'"
}
```

**Matching Logic**:
```javascript
// For object { my_secret: "actual_secret_value" }
// key_pattern matches "my_secret"
// value_pattern matches "actual_secret_value"
// Result: my_secret: "[REDACTED:context]"
```

---

## Data Relationships

### Config → Pattern Selection Flow

```
SecretsRedactionConfig
    │
    ├── enabled ──► 是否执行过滤
    │
    ├── default_patterns ──► getEnabledPatterns()
    │                      └── 筛选启用的默认模式
    │
    ├── custom_patterns ──► compileCustomPattern()
    │                      └── 编译为 SecretPattern
    │
    └── whitelist_fields ──► scrubObject() 白名单检查
```

### Error Report → Scrub Flow

```
ErrorReport (input)
    │
    ├── scrubObject()
    │   ├── deepClone() ──► 创建副本
    │   ├── traverse() ──► 深度遍历
    │   │   ├── 字符串字段 → scrubString()
    │   │   ├── 嵌套对象 → 递归
    │   │   └── 数组 → 遍历
    │   └── pattern matching
    │       ├── 匹配 → 替换为 [REDACTED:{type}]
    │       └── 记录 patterns_matched, fields_redacted
    │
    └── ScrubResult
        ├── scrubbed: filtered object
        ├── patterns_matched: [...]
        ├── fields_redacted: [...]
        └── redaction_count: N
```

### Scrub → Audit Log Flow

```
ScrubResult
    │
    ├── patterns_matched ──► AuditLogEntry.patterns_matched
    │
    ├── fields_redacted ──► AuditLogEntry.fields_redacted
    │
    ├── redaction_count ──► AuditLogEntry.redaction_count
    │
    └── input_type (from caller) ──► AuditLogEntry.input_type
    │
    └── source (from caller) ──► AuditLogEntry.source
    │
    └── timestamp ──► AuditLogEntry.timestamp (generated)
    │
    └── output_status ──► determined by redaction_count
        ├── > 0 → 'success'
        ├── = 0 → 'no_matches'
        └── error → 'error'
```

---

## Data Validation Rules

### Rule 1: Config Schema Validation
**Applies to**: SecretsRedactionConfig
**Validation**: JSON Schema validation
**Required Fields**: enabled, default_patterns

### Rule 2: Pattern Name Uniqueness
**Applies to**: custom_patterns
**Constraint**: custom pattern names must not conflict with default pattern names
**Error**: Duplicate pattern name → validation error

### Rule 3: Regex Pattern Validity
**Applies to**: custom_patterns[].pattern
**Constraint**: Pattern string must be valid RegExp
**Error**: Invalid regex → pattern compilation error (skip pattern)

### Rule 4: Whitelist Path Validity
**Applies to**: whitelist_fields
**Constraint**: Path must be valid dot notation
**Error**: Invalid path → ignored (no validation error)

### Rule 5: Replacement Format
**Applies to**: replacement_format
**Constraint**: Must contain `{type}` placeholder if using type-based replacement
**Default**: `[REDACTED:{type}]`

---

## Data Lifecycle

### Creation Flow

```
User creates .opencode/secrets-redaction.json
    │
    ├── 1. Validate JSON schema
    │
    ├── 2. Compile custom patterns
    │     ├── Convert pattern string to RegExp
    │     ├── Validate regex validity
    │     └── Store compiled SecretPattern
    │
    ├── 3. Merge with default patterns
    │     ├── Get enabled default patterns
    │     ├── Append compiled custom patterns
    │     └── Store merged pattern list
    │
    └── 4. Ready for scrubbing calls
```

### Scrubbing Flow

```
Caller calls scrubErrorReport(errorReport)
    │
    ├── 1. loadConfig()
    │     ├── Read config file
    │     ├── Validate schema
    │     └── Return SecretsRedactionConfig
    │
    ├── 2. Get patterns
    │     ├── getDefaultPatterns()
    │     ├── Filter by default_patterns
    │     ├── Compile custom_patterns
    │     └── Return merged list
    │
    ├── 3. scrubObject()
    │     ├── Deep clone input
    │     ├── Traverse object tree
    │     ├── Apply patterns to string fields
    │     ├── Replace matches
    │     └── Return ScrubResult
    │
    ├── 4. logRedaction()
    │     ├── Create AuditLogEntry
    │     ├── Exclude sensitive info
    │     └── Write to log
    │
    └── 5. Return RedactionResult
```

### Audit Log Lifecycle

```
Scrubbing completes
    │
    ├── 1. Create AuditLogEntry
    │     ├── timestamp: now
    │     ├── action: 'secrets_redaction'
    │     ├── patterns_matched: from ScrubResult
    │     ├── fields_redacted: from ScrubResult
    │     ├── output_status: determined
    │     └── source: caller name
    │
    ├── 2. Write to log
    │     ├── Console output (development)
    │     └── File output (production, optional)
    │
    └── 3. No sensitive info stored
```

---

## Integration with Existing Data

### Error Report Artifact (Feature 043)

**Consumed Fields**:
| Secrets-Redaction Field | Error-Report Source |
|-------------------------|---------------------|
| 全对象遍历 | entire error-report object |
| error_details.stacktrace_or_context | stack traces (high risk) |
| error_details.description | error description |
| context.config | configuration data |

**Scrubbed Fields Priority**:
| Priority | Field Path | Risk Level |
|----------|-----------|------------|
| P1 | `error_details.stacktrace_or_context` | high |
| P1 | `error_details.description` | medium |
| P2 | `impact_assessment.blocking_points[]` | low |
| P2 | `resolution_guidance.fix_suggestions[]` | low |

### Auto Error Report (Feature 045)

**Integration Point**:
```javascript
// lib/auto-error-report/index.js
import { scrubErrorReport } from '../secrets-redaction/index.js';

async function autoReportError(errorReport) {
  // Redaction before publishing
  const redactionResult = await scrubErrorReport(errorReport);
  const safeErrorReport = redactionResult.success 
    ? redactionResult.scrubbed 
    : errorReport;
  
  // Pass safe copy to github-issue-reporter
  const result = await reportToIssue(safeErrorReport, config);
}
```

**Privacy Config Integration**:
| auto-report.json field | secrets-redaction behavior |
|------------------------|---------------------------|
| `privacy.redact_secrets: true` | Enable secrets-redaction (default) |
| `privacy.include_stack_trace: false` | Skip stacktrace scrubbing (remove field) |

---

## Data Model Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│               .opencode/secrets-redaction.json                    │
├─────────────────────────────────────────────────────────────────┤
│  enabled: boolean                                                │
│  default_patterns: { github_token: true, ... }                   │
│  custom_patterns: [{ name, pattern, replacement }]               │
│  context_patterns: [{ key_pattern, value_pattern }]              │
│  whitelist_fields: [field_paths]                                 │
│  replacement_format: string                                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SecretPattern[] (compiled)                     │
├─────────────────────────────────────────────────────────────────┤
│  default patterns (enabled)                                      │
│  + custom patterns (compiled)                                    │
│  = merged pattern list                                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ErrorReport                               │
├─────────────────────────────────────────────────────────────────┤
│  error_details: { title, description, stacktrace_or_context }   │
│  impact_assessment: { blocking_points[] }                        │
│  resolution_guidance: { fix_suggestions[] }                      │
│  ... (nested object)                                             │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ScrubResult                               │
├─────────────────────────────────────────────────────────────────┤
│  scrubbed: filtered object                                       │
│  patterns_matched: [pattern_names]                               │
│  fields_redacted: [field_paths]                                  │
│  redaction_count: number                                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       AuditLogEntry                               │
├─────────────────────────────────────────────────────────────────┤
│  timestamp: ISO 8601                                             │
│  action: 'secrets_redaction'                                     │
│  patterns_matched: [pattern_names]                               │
│  fields_redacted: [field_paths]                                  │
│  output_status: 'success' | 'no_matches' | 'error'              │
│  source: caller module name                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

### Pattern Compilation
- Custom patterns compiled once at config load
- Compiled RegExp stored for reuse
- Avoid repeated compilation during scrubbing

### Object Traversal
- Deep clone only once at start
- Traverse depth limited by object structure
- Skip non-string fields early

### Pattern Matching
- Apply patterns sequentially (not parallel)
- Stop at first match per pattern (use `g` flag)
- Limit pattern count to avoid excessive iteration

---

## References

- `specs/043-error-reporter/contracts/error-report-contract.md` - Error Report Schema
- `specs/045-auto-error-report/data-model.md` - Auto Error Report Data Model
- `specs/045-auto-error-report/security-review-report.md` - Sec-002 finding
- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html)
- OWASP Secrets Management Cheatsheet