# Secrets Redaction - Usage Guide

## Overview

The secrets-redaction module automatically detects and filters sensitive information (tokens, passwords, secrets, API keys) from error reports before they are published to GitHub Issues, preventing sensitive data leakage.

## Quick Start

### Basic Usage

The module is automatically integrated with:
- **github-issue-reporter**: Filters error reports before publishing
- **auto-error-report**: Filters error reports before passing to reporter

No manual configuration required - it works out of the box with sensible defaults.

### Manual Usage

```javascript
const { scrubErrorReport, scrubString, scrubForLog } = require('./lib/secrets-redaction');

// Filter an error report object
const result = await scrubErrorReport(errorReport);
if (result.success) {
  console.log('Redacted:', result.scrubbed);
  console.log('Patterns matched:', result.patterns_matched);
  console.log('Fields redacted:', result.fields_redacted);
}

// Filter a standalone string
const safeString = await scrubString('Token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
// Result: 'Token: [REDACTED:github-token]'

// Filter for log output
const logSafe = await scrubForLog('Password: secret123');
// Result: 'Password: [REDACTED:password]'
```

---

## Default Patterns

The module includes 12 built-in detection patterns:

### Critical Severity

| Pattern | Type | Regex | Example |
|---------|------|-------|---------|
| GitHub Token | `github-token` | `ghp_[a-zA-Z0-9]{36}` | `ghp_xxxx...` |
| GitHub App Token | `github-app-token` | `ghs_[a-zA-Z0-9]{36}` | `ghs_xxxx...` |
| AWS Access Key | `aws-access-key` | `AKIA[0-9A-Z]{16}` | `AKIAIOSFODNN7EXAMPLE` |
| Password | `password` | `password: xxx` | `password: secret123` |
| Private Key | `private-key` | `-----BEGIN ... PRIVATE KEY-----` | PEM headers |
| Bearer Token | `bearer-token` | `Bearer xxx` | `Bearer eyJ...` |
| JWT | `jwt` | `eyJ...\.eyJ...\....` | JWT tokens |

### High Severity

| Pattern | Type | Regex | Example |
|---------|------|-------|---------|
| AWS Secret Key | `aws-secret-key` | 40-char base64 | `wJalrXUtnFEMI/...` |
| API Key Generic | `api-key` | `api_key: xxx` | `api_key: sk-xxxx` |
| Secret Generic | `secret` | `secret: xxx` | `secret: mysecret` |
| Connection String | `connection-string` | `connection_string: xxx` | Database URLs |

### Medium Severity

| Pattern | Type | Regex | Example |
|---------|------|-------|---------|
| Env Var Reference | `env-var` | `${VAR}` | `${MY_SECRET}` |

---

## Configuration

### Configuration File

Create `.opencode/secrets-redaction.json`:

```json
{
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
    "env_var_ref": true,
    "bearer_token": true,
    "jwt": true
  },
  "custom_patterns": [],
  "context_patterns": [],
  "whitelist_fields": [],
  "replacement_format": "[REDACTED:{type}]"
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable redaction |
| `default_patterns` | object | all enabled | Toggle individual default patterns |
| `custom_patterns` | array | `[]` | User-defined patterns |
| `context_patterns` | array | `[]` | Key-value context patterns |
| `whitelist_fields` | array | `[]` | Fields to exclude from redaction |
| `replacement_format` | string | `[REDACTED:{type}]` | Format for redacted values |

---

## Custom Patterns

### Adding Custom Patterns

Define patterns for your organization's specific secret formats:

```json
{
  "custom_patterns": [
    {
      "name": "company_api_key",
      "pattern": "MYCOMP-[a-zA-Z0-9]{32}",
      "replacement": "[REDACTED:company-key]",
      "severity": "critical",
      "description": "Company internal API key"
    },
    {
      "name": "internal_token",
      "pattern": "INT-[0-9]{16}",
      "replacement": "[REDACTED:internal]",
      "severity": "high"
    }
  ]
}
```

### Custom Pattern Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique pattern identifier |
| `pattern` | Yes | Regular expression string |
| `replacement` | Yes | Replacement text |
| `severity` | No | `critical`, `high`, or `medium` (default: `high`) |
| `description` | No | Pattern description |

### Pattern Validation Rules

1. **Unique Name**: Pattern names must not conflict with default patterns
2. **Valid Regex**: Pattern must be a valid regular expression
3. **Non-empty Replacement**: Replacement text cannot be empty

---

## Context Patterns

Context patterns allow filtering based on key names:

```json
{
  "context_patterns": [
    {
      "key_pattern": "my_secret",
      "value_pattern": ".*",
      "replacement": "[REDACTED:context]",
      "description": "Any value after 'my_secret:'"
    }
  ]
}
```

### How Context Patterns Work

```javascript
// Input object
{ my_secret: "actual_value_12345", other_field: "safe" }

// After context pattern
{ my_secret: "[REDACTED:context]", other_field: "safe" }
```

### Context Pattern Fields

| Field | Required | Description |
|-------|----------|-------------|
| `key_pattern` | Yes | Regex to match key names |
| `value_pattern` | Yes | Regex to match values (usually `.*`) |
| `replacement` | No | Replacement text (default: `[REDACTED:context]`) |
| `description` | No | Pattern description |

---

## Whitelist Fields

Exclude specific fields from redaction:

```json
{
  "whitelist_fields": [
    "error_details.error_code",
    "metadata.trace_id"
  ]
}
```

### Whitelist Behavior

- Whitelisted fields skip all pattern matching
- Use dot notation for nested paths: `config.database.name`
- Array indices supported: `items[0].name`

### ⚠️ Warning: Whitelist Abuse Risk

Do not add sensitive fields to the whitelist. Only whitelist fields that:
- Are known to be safe (e.g., error codes, trace IDs)
- Contain no user data or credentials
- Are system-generated identifiers

---

## Replacement Format

Customize the replacement text format:

```json
{
  "replacement_format": "[FILTERED:{type}]"
}
```

The `{type}` placeholder is replaced with the pattern type (e.g., `github-token`, `password`).

---

## Integration Points

### 1. github-issue-reporter

Automatically filters error reports before publishing:

```javascript
// lib/github-issue-reporter/error-comment-formatter.js
import { scrubErrorReport } from '../secrets-redaction';

async function formatErrorComment(errorReport) {
  const result = await scrubErrorReport(errorReport);
  const safeReport = result.success ? result.scrubbed : errorReport;
  return renderComment(safeReport);
}
```

### 2. auto-error-report

Filters before passing to github-issue-reporter:

```javascript
// lib/auto-error-report/index.js
import { scrubErrorReport } from '../secrets-redaction';

async function autoReportError(errorReport) {
  const result = await scrubErrorReport(errorReport);
  const safeReport = result.success ? result.scrubbed : errorReport;
  await reportToIssue(safeReport, config);
}
```

### 3. Log Output

Filter logs before writing:

```javascript
import { scrubForLog } from './secrets-redaction';

function safeLog(level, message) {
  const safeMessage = await scrubForLog(message);
  console.log(`[${level}] ${safeMessage}`);
}
```

---

## Audit Logging

All redaction operations are logged (without sensitive information):

```json
{
  "timestamp": "2026-04-05T10:30:00Z",
  "action": "secrets_redaction",
  "input_type": "error-report",
  "patterns_matched": ["github_token", "password"],
  "fields_redacted": ["error_details.stacktrace_or_context", "context.config"],
  "output_status": "success",
  "redaction_count": 3,
  "source": "github-issue-reporter"
}
```

---

## Performance

### Benchmarks

| Scenario | Target | Actual |
|----------|--------|--------|
| Typical error-report | < 50ms | ~2ms |
| Large stacktrace | < 100ms | ~2ms |
| Sequential scrubbing | < 10ms avg | ~0.3ms |

### Optimization Techniques

1. **Pattern Pre-compilation**: All regex patterns are compiled once at load
2. **Deep Clone Once**: Object is cloned once, then traversed
3. **Early Skip**: Non-string fields are skipped immediately
4. **Pattern Caching**: Compiled patterns are cached for reuse

---

## Failure Handling

### Failure Isolation

Redaction failures do not block publishing:

```javascript
try {
  const result = await scrubErrorReport(errorReport);
  return result.success ? result.scrubbed : errorReport;
} catch (error) {
  // Fallback to original on any error
  console.warn('[secrets-redaction] Failed, using original:', error.message);
  return errorReport;
}
```

### Error Types

| Error Code | Description | Handling |
|------------|-------------|----------|
| `ERR-SR-001` | Config load failed | Use default config |
| `ERR-SR-002` | Config validation failed | Use default config |
| `ERR-SR-003` | Pattern compile failed | Skip that pattern |
| `ERR-SR-004` | Scrub failed | Return original object |

---

## Best Practices

### 1. Keep Redaction Enabled

```json
{ "enabled": true }
```

Default is enabled. Only disable for debugging purposes.

### 2. Use Specific Patterns

Prefer specific patterns over broad ones:

```json
// Good: Specific format
{ "pattern": "MYCOMP-[a-zA-Z0-9]{32}" }

// Avoid: Too broad (matches too many things)
{ "pattern": "[a-zA-Z0-9]+" }
```

### 3. Test Custom Patterns

Test your patterns before deploying:

```javascript
const { scrubString } = require('./lib/secrets-redaction');

const testSecret = 'MYCOMP-1234567890abcdefghijklmnop';
const result = await scrubString(testSecret);
console.log(result); // Should contain [REDACTED:company-key]
```

### 4. Review Whitelist Regularly

Audit your whitelist fields to ensure no sensitive data is being exposed.

### 5. Monitor Audit Logs

Check audit logs for:
- Unexpected patterns being matched
- Fields being redacted that shouldn't be
- Missing patterns for known secret formats

---

## Troubleshooting

### Issue: False Positives (non-secrets being redacted)

**Solution**: Add the field to whitelist or adjust pattern:

```json
{
  "whitelist_fields": ["config.api_version"]
}
```

### Issue: False Negatives (secrets not being caught)

**Solution**: Add a custom pattern:

```json
{
  "custom_patterns": [{
    "name": "my_secret_format",
    "pattern": "SECRET-[0-9]{20}",
    "replacement": "[REDACTED:my-secret]"
  }]
}
```

### Issue: Performance Impact

**Solutions**:
1. Disable unused default patterns
2. Reduce custom pattern complexity
3. Use whitelist to skip known-safe fields

---

## Security Considerations

### What Gets Redacted

- Values matching secret patterns
- PEM private key headers
- Environment variable references
- Connection strings with credentials

### What Does NOT Get Redacted

- Field names (keys)
- Object structure
- Non-string values (numbers, booleans)

### Audit Trail

All redaction operations create audit entries without sensitive information.

### Limitations

1. **Pattern-based detection**: Cannot catch all possible secrets
2. **Context-dependent**: Some secrets may only be detectable with context
3. **Performance trade-off**: More patterns = slower processing

---

## References

- [Feature Spec](../specs/046-secrets-redaction/spec.md)
- [Data Model](../specs/046-secrets-redaction/data-model.md)
- [Configuration Contract](../specs/046-secrets-redaction/contracts/secrets-redaction-config-contract.md)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_CheatSheet.html)
- [GitHub Token Format](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication)