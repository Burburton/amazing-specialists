# Contract: Auto Error Report Configuration

## Contract ID
`AER-001`

## Version
`1.0.0`

## Role
`common`

---

## Purpose

定义自动错误报告配置文件的标准格式，确保配置加载器能正确解析和验证用户配置。

---

## Artifact Type
`auto-report-config`

---

## Schema Definition

### JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-2020-12/schema#",
  "$id": "auto-report-config.schema.json",
  "title": "Auto Error Report Configuration",
  "description": "Configuration for automatic error report to GitHub",
  "type": "object",
  "required": ["enabled", "github_token_env", "target_repository", "report_conditions", "rate_limit", "privacy"],
  "properties": {
    "enabled": {
      "type": "boolean",
      "default": false,
      "description": "Enable/disable automatic error reporting"
    },
    "github_token_env": {
      "type": "string",
      "default": "GITHUB_TOKEN",
      "description": "Environment variable name for GitHub token"
    },
    "target_repository": {
      "type": "object",
      "required": ["owner", "repo"],
      "properties": {
        "owner": {
          "type": "string",
          "minLength": 1,
          "description": "GitHub repository owner"
        },
        "repo": {
          "type": "string",
          "minLength": 1,
          "description": "GitHub repository name"
        }
      },
      "description": "Target GitHub repository for error reports"
    },
    "report_conditions": {
      "type": "object",
      "required": ["severity_threshold"],
      "properties": {
        "severity_threshold": {
          "type": "string",
          "enum": ["low", "medium", "high", "critical"],
          "default": "medium",
          "description": "Minimum severity level for auto report"
        },
        "only_expert_pack_errors": {
          "type": "boolean",
          "default": true,
          "description": "Only report errors from expert pack execution"
        },
        "exclude_types": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "INPUT_INVALID",
              "CONSTRAINT_VIOLATION",
              "EXECUTION_ERROR",
              "VERIFICATION_FAILURE",
              "ENVIRONMENT_ISSUE",
              "DEPENDENCY_BLOCKER",
              "AMBIGUOUS_GOAL",
              "SCOPE_CREEP_DETECTED"
            ]
          },
          "default": ["ENVIRONMENT_ISSUE"],
          "description": "Error types to exclude from auto report"
        }
      },
      "description": "Conditions for triggering auto report"
    },
    "rate_limit": {
      "type": "object",
      "required": ["max_per_hour", "max_per_day", "dedup_window_minutes"],
      "properties": {
        "max_per_hour": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 5,
          "description": "Maximum reports per hour"
        },
        "max_per_day": {
          "type": "integer",
          "minimum": 1,
          "maximum": 500,
          "default": 20,
          "description": "Maximum reports per day"
        },
        "dedup_window_minutes": {
          "type": "integer",
          "minimum": 1,
          "maximum": 1440,
          "default": 60,
          "description": "Deduplication window in minutes"
        }
      },
      "description": "Rate limiting configuration"
    },
    "privacy": {
      "type": "object",
      "required": ["include_stack_trace", "redact_secrets"],
      "properties": {
        "include_stack_trace": {
          "type": "boolean",
          "default": true,
          "description": "Include stack trace in error report"
        },
        "redact_secrets": {
          "type": "boolean",
          "default": true,
          "description": "Redact secrets/tokens from stack trace"
        }
      },
      "description": "Privacy settings for error reports"
    }
  }
}
```

---

## Field Definitions

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | 启用/禁用自动报告 |
| `github_token_env` | string | GitHub Token 环境变量名 |
| `target_repository.owner` | string | GitHub 仓库所有者 |
| `target_repository.repo` | string | GitHub 仓库名称 |
| `report_conditions.severity_threshold` | enum | 严重级别阈值 |
| `rate_limit.max_per_hour` | integer | 小时报告上限 |
| `rate_limit.max_per_day` | integer | 天报告上限 |
| `rate_limit.dedup_window_minutes` | integer | 去重窗口（分钟） |
| `privacy.include_stack_trace` | boolean | 是否包含堆栈 |
| `privacy.redact_secrets` | boolean | 是否脱敏 |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `report_conditions.only_expert_pack_errors` | boolean | true | 仅报告专家包错误 |
| `report_conditions.exclude_types` | array | ["ENVIRONMENT_ISSUE"] | 排除的错误类型 |

---

## Validation Rules

### VR-001: Owner/Repo Required
- `target_repository.owner` 和 `repo` 必须为非空字符串
- 缺失时配置验证失败

### VR-002: Severity Threshold Valid
- `severity_threshold` 必须为 `low`, `medium`, `high`, `critical` 之一
- 其他值导致验证失败

### VR-003: Rate Limit Bounds
- `max_per_hour`: 1-100
- `max_per_day`: 1-500
- `dedup_window_minutes`: 1-1440
- 超出范围导致验证失败

### VR-004: Exclude Types Valid
- `exclude_types` 数组元素必须匹配 Error Taxonomy
- 无效值导致验证失败

---

## Default Values

| Field | Default Value | Condition |
|-------|---------------|-----------|
| `enabled` | `false` | 安全优先，默认禁用 |
| `github_token_env` | `"GITHUB_TOKEN"` | 标准环境变量名 |
| `severity_threshold` | `"medium"` | 平衡噪音与可见性 |
| `only_expert_pack_errors` | `true` | 仅关注专家包错误 |
| `exclude_types` | `["ENVIRONMENT_ISSUE"]` | 排除环境问题 |
| `max_per_hour` | `5` | 适中限制 |
| `max_per_day` | `20` | 适中限制 |
| `dedup_window_minutes` | `60` | 1小时窗口 |
| `include_stack_trace` | `true` | 有助于调试 |
| `redact_secrets` | `true` | 安全优先 |

---

## Example

### Minimal Configuration

```json
{
  "enabled": true,
  "github_token_env": "GITHUB_TOKEN",
  "target_repository": {
    "owner": "Burburton",
    "repo": "amazing-specialists"
  },
  "report_conditions": {
    "severity_threshold": "medium"
  },
  "rate_limit": {
    "max_per_hour": 5,
    "max_per_day": 20,
    "dedup_window_minutes": 60
  },
  "privacy": {
    "include_stack_trace": true,
    "redact_secrets": true
  }
}
```

### Full Configuration

```json
{
  "$schema": "./auto-report-config.schema.json",
  "enabled": true,
  "github_token_env": "MY_GITHUB_TOKEN",
  "target_repository": {
    "owner": "Burburton",
    "repo": "amazing-specialists"
  },
  "report_conditions": {
    "severity_threshold": "high",
    "only_expert_pack_errors": true,
    "exclude_types": ["ENVIRONMENT_ISSUE", "INPUT_INVALID"]
  },
  "rate_limit": {
    "max_per_hour": 3,
    "max_per_day": 10,
    "dedup_window_minutes": 120
  },
  "privacy": {
    "include_stack_trace": false,
    "redact_secrets": true
  }
}
```

---

## Security Considerations

### SEC-001: Token Storage
- GitHub Token **不应**存储在配置文件中
- 仅通过环境变量读取（`github_token_env`）

### SEC-002: Secrets Redaction
- 默认启用 `redact_secrets: true`
- 自动脱敏 passwords, tokens, secrets, keys

### SEC-003: Default Disabled
- 默认 `enabled: false`
- 用户必须显式启用

---

## Usage

### Loading Configuration

```javascript
const { loadConfig } = require('./lib/auto-error-report/config-loader');

const result = loadConfig();

if (result.success) {
  const config = result.config;
  // Use config for auto-report
} else {
  // Config validation failed, disable auto-report
  console.warn('Auto-report config validation failed:', result.error);
}
```

### Validating Configuration

```bash
# CLI validation command
node lib/auto-error-report/config-loader.js --validate --config .opencode/auto-report.json
```

---

## Traceability

### Spec Reference
- `specs/045-auto-error-report/spec.md` FR-001

### Implementation
- `lib/auto-error-report/config-loader.js`

---

## References

- `specs/043-error-reporter/spec.md` - Error Taxonomy Types
- `specs/044-github-issue-reporter/spec.md` - GitHub Issue Reporter
- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html)