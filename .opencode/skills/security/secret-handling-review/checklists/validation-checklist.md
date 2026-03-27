# Secret Handling Review Validation Checklist

> **Standalone checklist for quick reference.** For detailed guidance, see `../SKILL.md`.

---

## Pre-Review Checklist

- [ ] Identify all secret-related code in changed_files
- [ ] Identify external service integrations
- [ ] Identify configuration files
- [ ] Identify test files with mock secrets
- [ ] Prepare secret pattern search list

---

## Secret Categories Checklist

### 1. Hardcoded Secrets (硬编码密钥)
- [ ] API keys not in source code?
- [ ] Passwords not in source code?
- [ ] Tokens not in source code?
- [ ] Private keys not in source code?
- [ ] Certificates not in source code?
- [ ] No real secrets in test files?

### 2. Configuration Files (配置文件)
- [ ] Config files contain no secrets?
- [ ] Config templates use placeholder values?
- [ ] Config files not committed with secrets?
- [ ] .env files excluded from repository?
- [ ] .env.example has no real values?

### 3. Secret Storage (密钥存储)
- [ ] Secrets stored in secure location?
- [ ] Environment variables used properly?
- [ ] Secret management service used?
- [ ] Secrets encrypted at rest?
- [ ] Access to secrets controlled?

### 4. Secret Logging (密钥日志)
- [ ] Secrets not in error logs?
- [ ] Secrets not in debug logs?
- [ ] Secrets not in trace logs?
- [ ] Log filtering configured?
- [ ] Debug mode disabled in production?

### 5. Secret Transmission (密钥传输)
- [ ] Secrets transmitted via HTTPS?
- [ ] Secrets not in URL parameters?
- [ ] Secrets not in response bodies?
- [ ] Secrets not in HTTP headers logged?

### 6. Secret Rotation (密钥轮换)
- [ ] Rotation mechanism exists?
- [ ] Rotation is automated?
- [ ] Old secrets invalidated?
- [ ] Rotation history maintained?

---

## Finding Quality Checklist

### Required Fields per Finding
- [ ] `id` - Unique identifier (SEC-XXX)
- [ ] `severity` - critical | high | medium | low | info
- [ ] `category` - hardcoded_secret | secret_storage | secret_logging | secret_rotation | secret_transport
- [ ] `title` - Specific and actionable
- [ ] `description` - Detailed explanation
- [ ] `location.file` - File path
- [ ] `location.line_start` - Line number
- [ ] `secret_type` - api_key | password | token | certificate | private_key | encryption_key
- [ ] `code_snippet` - Shows the vulnerable code
- [ ] `vulnerability.cwe` - CWE reference
- [ ] `vulnerability.owasp` - OWASP reference
- [ ] `remediation.recommendation` - Fix guidance
- [ ] `remediation.code_example` - Secure code example
- [ ] `remediation.effort` - quick | moderate | extensive
- [ ] `remediation.priority` - immediate | soon | later

---

## Severity Classification

| Severity | Definition | Action |
|----------|------------|--------|
| **critical** | Live secret hardcoded, financial/identity impact | `must_fix`, block |
| **high** | Secret in logs/config, significant exposure | `must_fix`, block |
| **medium** | No rotation, weak storage, limited exposure | `should_fix`, warn |
| **low** | Minor storage weakness, no immediate risk | `consider`, pass |
| **info** | Recommendation, no vulnerability found | Notes, pass |

### Critical Examples
- Live API key in source code
- Production password in config file
- Real certificate committed to repo
- Private key in public repository

### High Examples
- Secret exposed in error logs
- Secret transmitted in URL
- Secret in test file (real value)

### Medium Examples
- No rotation mechanism
- Weak storage (plaintext file)
- No secret audit logging

### Low Examples
- Secret in debug mode only
- Placeholder contains realistic-looking fake value

---

## Gate Decision Rules

```
┌─────────────────────────────────────────────────────────────┐
│                 SECRET REVIEW DECISION TREE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Are there critical findings (live secrets)?                │
│       │                                                      │
│       ├── YES → BLOCK                                        │
│       │          Immediate notification to developer         │
│       │          May need to invalidate secret               │
│       │                                                      │
│       └── NO ──┐                                            │
│                │                                             │
│                ▼                                             │
│  Are there high findings (exposure in logs/config)?         │
│       │                                                      │
│       ├── YES → BLOCK                                        │
│       │          Fix required before deployment              │
│       │                                                      │
│       └── NO ──┐                                            │
│                │                                             │
│                ▼                                             │
│  Are there medium findings (no rotation, weak storage)?     │
│       │                                                      │
│       ├── YES → NEEDS-FIX                                    │
│       │          Recommendations for improvement             │
│       │                                                      │
│       └── NO ──┐                                            │
│                │                                             │
│                ▼                                             │
│  Are there low/info findings?                                │
│       │                                                      │
│       ├── YES → PASS                                         │
│       │          Consider suggestions                        │
│       │                                                      │
│       └── NO ──→ PASS                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Secret Pattern Search List

### Generic Patterns
```regex
# API Keys
api_key|apiKey|API_KEY|secret_key|SECRET_KEY|api_secret

# Passwords
password|PASSWORD|passwd|PASSWD|pwd|PWD|pass|PASS

# Tokens
token|TOKEN|auth_token|AUTH_TOKEN|access_token|ACCESS_TOKEN|refresh_token

# Keys
private_key|PRIVATE_KEY|privateKey|secret|SECRET|encryption_key

# Database
db_password|DB_PASSWORD|database_password|mysql_password|postgres_password
```

### Service-Specific Patterns
```regex
# Stripe
sk_live_|pk_live_|sk_test_|pk_test_

# AWS
AKIA[0-9A-Z]{16}|aws_access_key_id|aws_secret_access_key

# GitHub
ghp_[0-9a-zA-Z]{36}|ghu_[0-9a-zA-Z]{36}|github_token

# Google
AIza[0-9A-Za-z\-]{35}|google_api_key

# Azure
azure_key|AZURE_KEY|client_secret|ClientSecret

# JWT
jwt_secret|JWT_SECRET|jwt_key|JWT_KEY
```

### High-Risk Extensions
- `.pem` - Private keys
- `.key` - Key files
- `.p12` - Certificates
- `.env` - Environment files (should be excluded)
- `.credentials` - Credential files

---

## Secret Management Assessment

### Storage Methods Rating
| Method | Risk Level | Recommendation |
|--------|------------|----------------|
| Hardcoded in source | **Critical** | Must fix immediately |
| Config file committed | **Critical** | Must fix immediately |
| Environment variable | **Low** | Acceptable for most cases |
| Secret file (not committed) | **Medium** | Add encryption |
| Secret management service | **Minimal** | Best practice |

### Required Assessment Fields
- [ ] `storage_method` assessed
- [ ] `rotation_enabled` checked
- [ ] `audit_enabled` checked
- [ ] Recommendations provided

---

## Post-Review Checklist

- [ ] All secret categories reviewed
- [ ] All findings have required fields
- [ ] Severity properly classified
- [ ] Code examples provided
- [ ] Remediation is actionable
- [ ] Gate decision made
- [ ] Secret management assessed
- [ ] Immediate actions specified (if critical)

---

## Anti-Patterns to Avoid

| Anti-Pattern | Warning Sign | Fix |
|--------------|--------------|-----|
| **Vague warning** | "may expose secrets" | Be specific with location |
| **Missing secret type** | No classification | Add secret_type field |
| **No code evidence** | Finding without snippet | Add code_snippet |
| **No remediation** | Finding without fix | Add code_example |
| **Missing storage assessment** | No secret_management | Add assessment section |
| **Missing gate decision** | No decision field | Add gate_decision |

---

## Related Resources

- **Full Skill**: `../SKILL.md`
- **Examples**: `../examples/`
- **Anti-Examples**: `../anti-examples/`
- **Quality Gate**: `quality-gate.md` Section 3.5
- **Governance**: `role-definition.md` (security role)