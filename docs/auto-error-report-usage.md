# Auto Error Report Usage Guide

## Overview

Auto Error Report automatically publishes error reports to GitHub Issues when execution errors meet configured conditions. This eliminates the need for manual CLI commands and provides real-time error visibility.

---

## Quick Start

### 1. Create Configuration File

Create `.opencode/auto-report.json`:

```json
{
  "$schema": "./auto-report-config.schema.json",
  "enabled": true,
  "github_token_env": "GITHUB_TOKEN",
  "target_repository": {
    "owner": "your-org",
    "repo": "your-repo"
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

### 2. Set GitHub Token

```bash
# Set environment variable
export GITHUB_TOKEN="your-github-token"

# Or in .bashrc/.zshrc
echo 'export GITHUB_TOKEN="your-token"' >> ~/.bashrc
```

### 3. Verify Configuration

```bash
# Validate configuration file
node lib/auto-error-report/config-loader.js --validate

# Expected output: ✓ Config validation passed
```

---

## Configuration Fields

### Required Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable/disable auto reporting |
| `github_token_env` | string | `"GITHUB_TOKEN"` | Environment variable name for GitHub token |
| `target_repository` | object | - | Target repository for error reports |
| `target_repository.owner` | string | - | Repository owner (required) |
| `target_repository.repo` | string | - | Repository name (required) |

### Report Conditions

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `report_conditions.severity_threshold` | enum | `"medium"` | Minimum severity to trigger report |
| `report_conditions.only_expert_pack_errors` | boolean | `true` | Only report expert pack role errors |
| `report_conditions.exclude_types` | array | `["ENVIRONMENT_ISSUE"]` | Error types to exclude |

**Severity Threshold Options**:
- `"low"` - Report all errors (low, medium, high, critical)
- `"medium"` - Report medium, high, critical only
- `"high"` - Report high, critical only
- `"critical"` - Report critical only

**Error Types**:
- `INPUT_INVALID` - Invalid input parameters
- `CONSTRAINT_VIOLATION` - Constraint check failed
- `EXECUTION_ERROR` - Execution phase error
- `VERIFICATION_FAILURE` - Verification phase error
- `ENVIRONMENT_ISSUE` - Environment/infrastructure error
- `DEPENDENCY_BLOCKER` - Dependency blocking
- `AMBIGUOUS_GOAL` - Ambiguous goal/task
- `SCOPE_CREEP_DETECTED` - Scope creep detected

### Rate Limit

| Field | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| `rate_limit.max_per_hour` | integer | `5` | 1-100 | Maximum reports per hour |
| `rate_limit.max_per_day` | integer | `20` | 1-500 | Maximum reports per day |
| `rate_limit.dedup_window_minutes` | integer | `60` | 1-1440 | Deduplication window in minutes |

### Privacy

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `privacy.include_stack_trace` | boolean | `true` | Include stack trace in report |
| `privacy.redact_secrets` | boolean | `true` | Redact secrets in stack trace |

---

## Trigger Mechanism

### Automatic Trigger Points

Auto error reporting is triggered automatically from:

1. **failure-analysis Skill** (Primary)
   - Location: `.opencode/skills/common/failure-analysis/SKILL.md`
   - Trigger: After Step 6 (failure analysis report generation)
   - Integration: Step 7 (auto trigger check)

2. **Adapter Retry Handlers** (Optional)
   - Location: `adapters/*/retry-handler.js`
   - Trigger: Retry count exceeded limit

3. **execution-reporting Skill** (Optional)
   - Location: `.opencode/skills/common/execution-reporting/SKILL.md`
   - Trigger: Execution status = FAILED

### Trigger Flow

```
Error Occurs
    ↓
failure-analysis Skill
    ↓
Generate error-report artifact
    ↓
Check auto-report.json config
    ├─ disabled → Stop
    ├─ enabled → Check conditions
        ├─ severity < threshold → Stop
        ├─ type excluded → Stop
        ├─ rate limit exceeded → Stop (log)
        ├─ dedup window hit → Stop
        ↓
    Publish to GitHub Issue (async)
    ↓
Continue main flow
```

---

## CLI Validation

### Validate Configuration

```bash
# Validate default config
node lib/auto-error-report/config-loader.js --validate

# Validate custom config path
node lib/auto-error-report/config-loader.js --validate --config path/to/config.json

# Expected output on success:
# ✓ Config validation passed

# Expected output on failure:
# ✗ Config validation failed:
#   - /target_repository/owner: must have required property 'owner'
```

### Manual Testing

```bash
# Trigger manual test (requires error-report artifact)
node scripts/test-auto-report.js --error-report specs/feature/artifacts/error-report-xxx.json
```

---

## Integration with failure-analysis Skill

### Step 7: Auto Trigger Check

When failure-analysis completes, Step 7 automatically checks auto-report conditions:

```javascript
// In failure-analysis SKILL.md Step 7
const { tryAutoReport } = require('../../../lib/auto-error-report');

// Generate error-report from failure_analysis
const errorReport = {
  artifact_id: `err-${dispatch_id}`,
  artifact_type: 'error-report',
  error_context: {
    dispatch_id: dispatch_id,
    task_id: task_id,
    role: role
  },
  error_classification: {
    severity: failure_analysis.failure_summary.severity,
    error_type: failure_analysis.failure_summary.failure_type,
    error_subtype: failure_analysis.failure_summary.failure_subtype
  },
  error_details: {
    error_code: failure_analysis.failure_summary.failure_subtype,
    title: failure_analysis.failure_summary.description,
    root_cause: failure_analysis.root_cause.primary_cause
  }
};

// Async execution (failure silent)
tryAutoReport(errorReport).catch(() => {});
```

---

## Rate Limiting

### How Rate Limiting Works

- **Hourly Limit**: Prevents excessive reports per hour
- **Daily Limit**: Prevents excessive reports per day
- **Dedup Window**: Prevents duplicate reports for same error

### Behavior

| Condition | Action | Log |
|-----------|--------|-----|
| Hour limit exceeded | Skip report | `[auto-error-report] Rate limit exceeded: hour_limit` |
| Day limit exceeded | Skip report | `[auto-error-report] Rate limit exceeded: day_limit` |
| Dedup window hit | Skip report | No log (silent) |

### Memory-Based Storage

Rate limit state is stored in memory (Map-based):
- **Pros**: Fast, no file I/O
- **Cons**: Lost on process restart

**Recommendation**: Use reasonable `dedup_window_minutes` (60-120) to minimize impact of restart.

---

## Troubleshooting

### Common Issues

#### Issue 1: "GitHub token not found in environment"

**Symptom**:
```
[auto-error-report] GitHub token not found in environment
```

**Solution**:
```bash
# Check token exists
echo $GITHUB_TOKEN

# Set token
export GITHUB_TOKEN="your-token"

# Verify in script
node -e "console.log(process.env.GITHUB_TOKEN)"
```

#### Issue 2: "Config validation failed"

**Symptom**:
```
✗ Config validation failed:
  - /target_repository: must have required property 'owner'
```

**Solution**:
- Ensure all required fields present in `.opencode/auto-report.json`
- Check JSON syntax (no trailing commas)
- Use schema reference: `"$schema": "./auto-report-config.schema.json"`

#### Issue 3: "No Issue associated"

**Symptom**:
```
[auto-error-report] No Issue associated with error-report
```

**Solution**:
- Verify dispatch_id contains Issue reference: `gh-issue-{owner}-{repo}-{issue_number}`
- Check `.issue-context.json` exists in feature directory
- Use CLI `--issue` parameter to manually specify

#### Issue 4: "Rate limit exceeded"

**Symptom**:
```
[auto-error-report] Rate limit exceeded: hour_limit
```

**Solution**:
- Increase `max_per_hour` in config (max 100)
- Wait for next hour window
- Check if duplicate errors causing excessive reports

#### Issue 5: Auto report not triggered

**Symptom**: No GitHub comment despite error

**Debug Steps**:
```bash
# 1. Check config enabled
cat .opencode/auto-report.json | grep enabled

# 2. Check severity threshold
cat .opencode/auto-report.json | grep severity_threshold

# 3. Check error type excluded
cat .opencode/auto-report.json | grep exclude_types

# 4. Check role match (only_expert_pack_errors)
cat .opencode/auto-report.json | grep only_expert_pack_errors
```

---

## Security Best Practices

### 1. Token Management

✅ **Do**:
- Use environment variable for token
- Use different tokens for different environments
- Rotate tokens regularly

❌ **Don't**:
- Hardcode token in config file
- Share token in public repositories
- Use admin-level tokens (use minimal permissions)

### 2. Configuration Security

✅ **Do**:
- Keep `enabled: false` by default
- Validate config before use
- Review `exclude_types` to avoid noise

❌ **Don't**:
- Enable auto-report without testing
- Set too low severity threshold (causes noise)
- Skip config validation

### 3. Privacy Settings

✅ **Do**:
- Keep `redact_secrets: true`
- Review stack traces before enabling
- Exclude sensitive error types

❌ **Don't**:
- Disable secrets redaction
- Include full stack traces in public repos
- Report ENVIRONMENT_ISSUE (noise)

---

## Examples

### Example 1: Minimal Configuration

```json
{
  "enabled": true,
  "github_token_env": "GITHUB_TOKEN",
  "target_repository": {
    "owner": "my-org",
    "repo": "my-repo"
  },
  "report_conditions": {
    "severity_threshold": "high"
  },
  "rate_limit": {
    "max_per_hour": 3
  },
  "privacy": {
    "redact_secrets": true
  }
}
```

### Example 2: Strict Configuration

```json
{
  "enabled": true,
  "github_token_env": "GITHUB_TOKEN_PROD",
  "target_repository": {
    "owner": "enterprise-org",
    "repo": "critical-system"
  },
  "report_conditions": {
    "severity_threshold": "critical",
    "only_expert_pack_errors": true,
    "exclude_types": ["ENVIRONMENT_ISSUE", "INPUT_INVALID"]
  },
  "rate_limit": {
    "max_per_hour": 1,
    "max_per_day": 5,
    "dedup_window_minutes": 120
  },
  "privacy": {
    "include_stack_trace": false,
    "redact_secrets": true
  }
}
```

### Example 3: Development Configuration

```json
{
  "enabled": false,
  "github_token_env": "GITHUB_TOKEN_DEV",
  "target_repository": {
    "owner": "dev-org",
    "repo": "test-repo"
  },
  "report_conditions": {
    "severity_threshold": "low"
  },
  "rate_limit": {
    "max_per_hour": 10
  }
}
```

---

## References

- **Spec**: `specs/045-auto-error-report/spec.md`
- **Plan**: `specs/045-auto-error-report/plan.md`
- **Tasks**: `specs/045-auto-error-report/tasks.md`
- **Config Schema**: `.opencode/auto-report-config.schema.json`
- **Security Review**: `specs/045-auto-error-report/security-review-report.md`
- **Skill Integration**: `.opencode/skills/common/failure-analysis/SKILL.md` Step 7

---

## Version

- **Feature**: 045-auto-error-report
- **Version**: 0.1.0
- **Updated**: 2026-04-05