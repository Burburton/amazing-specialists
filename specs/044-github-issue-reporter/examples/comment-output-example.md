# Example Issue Comment Output

This document shows example GitHub Issue comment formats for different severity levels.

---

## Critical/High Severity Comment (Detailed Format)

### Input
```yaml
severity: high
error_type: INPUT_INVALID
error_code: ERR-ARCH-001
```

### Output Comment
```markdown
## 🚨 Error Report: ERR-ARCH-001

**Severity**: 🔴 High
**Error Type**: INPUT_INVALID
**Role**: architect

### 📋 Error Summary
Missing spec section: acceptance criteria

The spec.md file does not contain a valid Acceptance Criteria section. Unable to proceed with design phase.

### 🚫 Blocking Points
- Cannot define design success criteria without acceptance criteria
- Review phase will fail without measurable criteria
- Test design phase cannot proceed

### 📍 Source
File: specs/my-feature/spec.md:45

### 🔧 Recommended Action
**Action**: REWORK

Fix suggestions:
- Add Acceptance Criteria section to spec.md
- Define at least 3 testable acceptance criteria
- Ensure criteria are measurable and verifiable

### ⏱️ Impact Assessment
- **Downstream Impact**: blocked
- **Milestone Impact**: delay

### 📊 Recovery
- **Auto-Recoverable**: No
- **Retry Count**: 0/3

---
*Error ID: ERR-20260405123000-abc123*
*Reported by: architect role at 2026-04-05T12:30:00Z*
```

---

## Medium Severity Comment (Standard Format)

### Input
```yaml
severity: medium
error_type: DEPENDENCY_ISSUE
error_code: ERR-DEV-003
```

### Output Comment
```markdown
## 🚨 Error Report: ERR-DEV-003

**Severity**: 🟡 Medium
**Error Type**: DEPENDENCY_ISSUE
**Role**: developer

### 📋 Error Summary
Missing npm dependency: lodash

Required dependency lodash is not installed. Feature implementation cannot proceed.

### 📍 Source
File: package.json

### 🔧 Recommended Action
**Action**: RETRY

Run: npm install lodash

---
*Error ID: ERR-20260405140000-def456*
*Reported by: developer role at 2026-04-05T14:00:00Z*
```

---

## Low Severity Comment (Simplified Format)

### Input
```yaml
severity: low
error_type: ENVIRONMENT_ISSUE
error_code: ERR-COM-001
```

### Output Comment
```markdown
## 🚨 Error Report: ERR-COM-001

**Severity**: 🟢 Low
**Error Type**: ENVIRONMENT_ISSUE
**Role**: common

### 📋 Error Summary
Non-critical environment configuration missing

Optional environment variable DEBUG_MODE not set. Execution proceeds with default configuration.

**Note**: This is an informational message. No action required.

---
*Error ID: ERR-20260405160000-ghi789*
*Reported by: common role at 2026-04-05T16:00:00Z*
```

---

## Critical Severity Comment (Full Details)

### Input
```yaml
severity: critical
error_type: SECURITY_ISSUE
error_code: ERR-SEC-001
```

### Output Comment
```markdown
## 🚨 Error Report: ERR-SEC-001

**Severity**: 🟠 Critical
**Error Type**: SECURITY_ISSUE
**Role**: security

### 📋 Error Summary
Critical security vulnerability: hardcoded credentials

Hardcoded API key detected in source code. This is a critical security issue that must be fixed immediately.

### 🚫 Blocking Points
- Potential credential exposure in repository
- Violates security best practices
- May trigger security audit failure

### 📍 Source
File: src/services/AuthService.ts:23

### 🔧 Recommended Action
**Action**: ESCALATE

Fix suggestions:
- Remove hardcoded API key from source code
- Use environment variable or secure credential store
- Audit all files for similar patterns
- Update git history if key was committed

### ⏱️ Impact Assessment
- **Downstream Impact**: cascading
- **Milestone Impact**: blocked

### 📊 Recovery
- **Auto-Recoverable**: No
- **Retry Count**: 0/3

---
*Error ID: ERR-20260405180000-jkl012*
*Reported by: security role at 2026-04-05T18:00:00Z*
```

---

## Severity Badge Reference

| Severity | Badge | Color |
|----------|-------|-------|
| low | 🟢 Low | Green |
| medium | 🟡 Medium | Yellow |
| high | 🔴 High | Red |
| critical | 🟠 Critical | Orange |

---

## Comment Format Rules

1. **Detailed Format** (critical/high):
   - Full sections including blocking_points, fix_suggestions, impact, recovery
   - Recommended for errors requiring immediate attention

2. **Standard Format** (medium):
   - Error details, recommended_action, simplified impact
   - Recommended for errors with straightforward fixes

3. **Simplified Format** (low):
   - Error summary, source, informational note
   - Recommended for non-blocking informational messages

---

## Markdown Compatibility

All comments use GitHub-supported markdown features:
- Headers (##, ###)
- Bold text (**text**)
- Lists (- item)
- Code blocks (```language)
- Emoji (UTF-8)

Unsupported features are NOT used:
- Custom CSS
- LaTeX
- HTML tags
- Custom styling