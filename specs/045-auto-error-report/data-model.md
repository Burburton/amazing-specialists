# Data Model: 045-auto-error-report

## Metadata
```yaml
feature_id: 045-auto-error-report
data_model_version: 1.0.0
created_at: 2026-04-05
status: Draft
```

---

## Overview

本 Data Model 定义 Feature 045 涉及的数据结构，主要包括：
- Auto Report Configuration Schema
- Rate Limit State Structure
- Error Hash Computation
- Auto Report Result Structure

---

## Data Entities

### Entity 1: Auto Report Configuration

**Purpose**: 控制自动错误报告的启用状态、参数和阈值

**Storage**: `.opencode/auto-report.json`

**Schema Definition**:

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
          "description": "GitHub repository owner"
        },
        "repo": {
          "type": "string",
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
            "enum": ["INPUT_INVALID", "CONSTRAINT_VIOLATION", "EXECUTION_ERROR", "VERIFICATION_FAILURE", "ENVIRONMENT_ISSUE", "DEPENDENCY_BLOCKER", "AMBIGUOUS_GOAL", "SCOPE_CREEP_DETECTED"]
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

**Example Configuration**:

```json
{
  "$schema": "./auto-report-config.schema.json",
  "enabled": false,
  "github_token_env": "GITHUB_TOKEN",
  "target_repository": {
    "owner": "Burburburton",
    "repo": "amazing-specialists"
  },
  "report_conditions": {
    "severity_threshold": "medium",
    "only_expert_pack_errors": true,
    "exclude_types": ["ENVIRONMENT_ISSUE"]
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

---

### Entity 2: Rate Limit State

**Purpose**: 记录报告历史，用于 rate limit 检查

**Storage**: 内存缓存 (Map)

**Structure**:

```typescript
interface RateLimitState {
  hour_counts: Map<string, number>;      // Key: hour_key (YYYY-MM-DD-HH)
  day_counts: Map<string, number>;       // Key: day_key (YYYY-MM-DD)
  error_hashes: Map<string, Date>;       // Key: 16-char hash, Value: last_report_time
}

interface RateLimitResult {
  allowed: boolean;
  remaining_hour: number;
  remaining_day: number;
  reason?: 'hour_limit' | 'day_limit' | 'dedup_window';
}
```

**Key Generation**:

```javascript
// Hour key
const hourKey = `${year}-${month}-${day}-${hour}`;

// Day key  
const dayKey = `${year}-${month}-${day}`;

// Error hash key (computed from error-report)
const errorHash = crypto
  .createHash('sha256')
  .update(`${error_code}:${title}:${dispatch_id}`)
  .digest('hex')
  .substring(0, 16);
```

---

### Entity 3: Error Hash Computation

**Purpose**: 基于 error-report 内容计算唯一标识，用于去重

**Algorithm** (FR-006):

```javascript
function computeErrorHash(errorReport) {
  const components = [
    errorReport.error_details.error_code,
    errorReport.error_details.title,
    errorReport.error_context.dispatch_id
  ];
  
  const hash = crypto
    .createHash('sha256')
    .update(components.join(':'))
    .digest('hex')
    .substring(0, 16);
  
  return hash;
}
```

**Hash Components**:
| Component | Source | Purpose |
|-----------|--------|---------|
| error_code | `error_details.error_code` | 错误类型标识 |
| title | `error_details.title` | 错误描述 |
| dispatch_id | `error_context.dispatch_id` | 任务关联 |

**Properties**:
- 16 字符长度（足够唯一性）
- 相同错误在相同任务中产生相同 hash
- 不同任务中的相同错误产生不同 hash（dispatch_id 不同）

---

### Entity 4: Auto Report Result

**Purpose**: 返回自动报告执行结果

**Structure**:

```typescript
interface AutoReportResult {
  success: boolean;
  triggered: boolean;
  reason?: string;
  issue_url?: string;
  error?: string;
}
```

**Result Scenarios**:
| Scenario | success | triggered | reason |
|----------|---------|-----------|--------|
| Config disabled | false | false | 'disabled' |
| Config load failed | false | false | 'config_load_failed' |
| Severity below threshold | false | false | 'severity_below_threshold' |
| Type excluded | false | false | 'type_excluded' |
| Not expert pack error | false | false | 'not_expert_pack_error' |
| Hour rate limit exceeded | false | false | 'hour_limit' |
| Day rate limit exceeded | false | false | 'day_limit' |
| Dedup window hit | false | false | 'dedup_window' |
| Publish success | true | true | - |
| Publish failed | false | true | 'publish_failed' |
| Token missing | false | true | 'github_token_missing' |
| No issue associated | false | true | 'no_issue_associated' |

---

### Entity 5: Trigger Check Result

**Purpose**: 返回触发条件检查结果

**Structure**:

```typescript
interface TriggerCheckResult {
  should_trigger: boolean;
  reason?: 'disabled' | 'severity_below_threshold' | 'type_excluded' | 'not_expert_pack_error';
}
```

**Severity Threshold Logic**:
| Threshold | Severity Levels Included |
|-----------|-------------------------|
| low | low, medium, high, critical |
| medium | medium, high, critical |
| high | high, critical |
| critical | critical only |

---

## Data Relationships

### Config → Rate Limit Flow

```
AutoReportConfig
    │
    ├── rate_limit.max_per_hour ──► RateLimitState.hour_counts
    │
    ├── rate_limit.max_per_day ──► RateLimitState.day_counts
    │
    └── rate_limit.dedup_window_minutes ──► dedup check
```

### Error Report → Hash → Dedup Flow

```
ErrorReport
    │
    ├── error_details.error_code ──► hash component
    │
    ├── error_details.title ──► hash component
    │
    └── error_context.dispatch_id ──► hash component
    │
    ▼
computeErrorHash()
    │
    ▼
16-char hash string
    │
    ▼
RateLimitState.error_hashes
    │
    ▼
isDuplicate() check
```

### Trigger Condition Flow

```
ErrorReport
    │
    ├── error_classification.severity ──► severity threshold check
    │
    ├── error_classification.error_type ──► exclude_types check
    │
    └── error_context.role ──► only_expert_pack_errors check
    │
    ▼
TriggerCheckResult
```

---

## Data Validation Rules

### Rule 1: Config Schema Validation
**Applies to**: AutoReportConfig
**Validation**: JSON Schema validation
**Required Fields**: enabled, github_token_env, target_repository, report_conditions, rate_limit, privacy

### Rule 2: Severity Threshold Mapping
**Applies to**: report_conditions.severity_threshold
**Valid Values**: 'low', 'medium', 'high', 'critical'
**Mapping**: Must follow severity hierarchy (low < medium < high < critical)

### Rule 3: Rate Limit Bounds
**Applies to**: rate_limit
**Constraints**:
- max_per_hour: 1-100
- max_per_day: 1-500
- dedup_window_minutes: 1-1440 (max 24 hours)

### Rule 4: Error Type Exclusion
**Applies to**: report_conditions.exclude_types
**Valid Values**: Must match Error Taxonomy types from Feature 043
- INPUT_INVALID, CONSTRAINT_VIOLATION, EXECUTION_ERROR
- VERIFICATION_FAILURE, ENVIRONMENT_ISSUE, DEPENDENCY_BLOCKER
- AMBIGUOUS_GOAL, SCOPE_CREEP_DETECTED

### Rule 5: Target Repository Required
**Applies to**: target_repository
**Constraint**: owner and repo must be non-empty strings
**Error**: Missing owner/repo results in config validation failure

---

## Data Lifecycle

### Creation Flow

```
User creates .opencode/auto-report.json
    │
    ├── 1. Validate JSON schema
    │
    ├── 2. Fill default values for missing optional fields
    │
    ├── 3. Store in memory (config-loader cache)
    │
    └── 4. Ready for auto-report calls
```

### Update Flow

```
User modifies .opencode/auto-report.json
    │
    ├── 1. Re-validate JSON schema
    │
    ├── 2. Update memory cache
    │
    ├── 3. Clear rate limit state (optional)
    │
    └── 4. New config effective immediately
```

### Rate Limit State Lifecycle

```
Auto Report Triggered
    │
    ├── 1. checkRateLimit()
    │     ├── Get current hour/day counts
    │     ├── Get error hash from dedup map
    │     └── Return allowed/remaining
    │
    ├── 2. If allowed, publish
    │
    ├── 3. recordReport()
    │     ├── Increment hour/day counts
    │     ├── Store error hash with timestamp
    │     └── Update RateLimitState
    │
    └── 4. Dedup window expiry
    │     ├── Auto cleanup on next check
    │     └── Remove entries older than dedup_window_minutes
```

---

## Integration with Existing Data

### Error Report Artifact (Feature 043)

**Consumed Fields**:
| Auto-Report Field | Error-Report Source |
|-------------------|---------------------|
| severity check | `error_classification.severity` |
| type exclusion | `error_classification.error_type` |
| hash computation | `error_details.error_code`, `error_details.title`, `error_context.dispatch_id` |
| expert pack check | `error_context.role` |

### GitHub Issue Reporter (Feature 044)

**Consumed API**:
```javascript
import { reportToIssue } from '../github-issue-reporter/index.js';

const result = await reportToIssue(errorReport, {
  owner: config.target_repository.owner,
  repo: config.target_repository.repo,
  githubConfig: { token: process.env[config.github_token_env] }
});
```

---

## Data Model Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    .opencode/auto-report.json                     │
├─────────────────────────────────────────────────────────────────┤
│  enabled: boolean                                                │
│  github_token_env: string                                        │
│  target_repository: { owner, repo }                              │
│  report_conditions: { severity_threshold, exclude_types }        │
│  rate_limit: { max_per_hour, max_per_day, dedup_window_minutes } │
│  privacy: { include_stack_trace, redact_secrets }                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RateLimitState (Memory)                      │
├─────────────────────────────────────────────────────────────────┤
│  hour_counts: Map<string, number>                                │
│  day_counts: Map<string, number>                                 │
│  error_hashes: Map<string, Date>                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ErrorReport                               │
├─────────────────────────────────────────────────────────────────┤
│  error_context: { dispatch_id, role }                            │
│  error_classification: { severity, error_type }                  │
│  error_details: { error_code, title }                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AutoReportResult                             │
├─────────────────────────────────────────────────────────────────┤
│  success: boolean                                                │
│  triggered: boolean                                              │
│  reason?: string                                                 │
│  issue_url?: string                                              │
│  error?: string                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## References

- `specs/043-error-reporter/spec.md` - Error Report Artifact 定义
- `specs/043-error-reporter/contracts/error-report-contract.md` - Error Report Schema
- `specs/044-github-issue-reporter/spec.md` - GitHub Issue Reporter 定义
- `lib/github-issue-reporter/index.js` - reportToIssue API
- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html)