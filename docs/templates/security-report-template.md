# Security Report Template (Security Review Report)

**Version**: 1.0.0  
**Created**: 2026-03-27  
**Source Contract**: `specs/008-security-core/contracts/security-review-report-contract.md`  
**Producer Role**: `security`

---

## Purpose

This template provides the standard structure for creating a `security-review-report` artifact. The security-review-report documents security findings from authentication, authorization, and input validation reviews with severity classification and gate decisions.

---

## Template Structure

Copy and fill in the sections below:

```markdown
# Security Review Report: [Task ID]

## Metadata
- **Dispatch ID**: [dispatch_XXX_XXX]
- **Task ID**: [T-XXX-XXX]
- **Created**: [YYYY-MM-DDTHH:MM:SSZ]
- **Author**: security

---

## 1. Scope

### Components Reviewed
| Path | Type | Description |
|------|------|-------------|
| [File path] | authentication / authorization / session / transport / logging | [What was examined] |

### Auth Mechanisms Found
- [List of authentication mechanisms identified]

### Permission Systems Found
- [List of authorization/permission systems identified]

### Review Type
- full / focused / re-review

---

## 2. Findings

### Finding [ID]
| Field | Value |
|-------|-------|
| **ID** | SEC-XXX |
| **Severity** | critical / high / medium / low / info |
| **Category** | authentication / authorization / session / transport / logging |

**Title**: [Brief finding title]

**Description**: [Detailed description]

**Location**:
- **File**: [File path]
- **Lines**: [Start] - [End]

**Vulnerability**:
- **Type**: [Vulnerability type name]
- **CWE**: [CWE identifier, e.g., CWE-798]
- **OWASP**: [OWASP reference, e.g., A07:2021]

**Code Snippet**:
```
[Vulnerable code here]
```

**Impact**:
- **Description**: [Potential impact description]
- **Exploit Scenario**: [How attacker could exploit]
- **Affected Users**: [Who is affected]

**Remediation**:
- **Recommendation**: [How to fix]
- **Code Example**:
```
[Secure code example]
```
- **Effort**: quick / moderate / extensive
- **Priority**: immediate / soon / later

---

(Repeat for each finding. If no findings, state: "No security findings identified.")

---

## 3. Risk Assessment

**Overall Risk**: critical / high / medium / low

### Risk Factors
| Factor | Level |
|--------|-------|
| [Risk factor description] | high / medium / low |

**Residual Risk**: [Risk that remains after fixes]

---

## 4. Gate Decision

**Decision**: pass / needs-fix / block

**Conditions**:
- [Conditions for this decision]

**Blocking Findings** (if block):
- [Finding IDs that block]

---

## 5. Recommendations

### Must Fix
- [Items requiring immediate attention]

### Should Fix
- [Items recommended for near-term]

### Consider
- [Items for future consideration]

---

## 6. Follow-up (optional)

| Item | Owner | Due Date |
|------|-------|----------|
| [Follow-up action] | [Responsible party] | [Timeline] |

---

## 7. Notes (optional)

[Any additional context]

---

## 8. Compliance (optional)

| Standard | Compliant | Notes |
|----------|-----------|-------|
| [OWASP, PCI-DSS, etc.] | true / false | [Notes] |
```

---

## Required Fields

Per the contract, the following fields are **mandatory**:

| Field | Required | Notes |
|-------|----------|-------|
| `dispatch_id` | Yes | Dispatch request ID |
| `task_id` | Yes | Task ID being reviewed |
| `created_at` | Yes | ISO 8601 timestamp |
| `created_by` | Yes | Must be "security" |
| `scope.components_reviewed` | Yes | At least one component |
| `findings` | Yes | Can be empty if no issues |
| `risk_assessment.overall_risk` | Yes | Risk level enum |
| `gate_decision.decision` | Yes | pass / needs-fix / block |
| `recommendations` | Yes | All three lists (can be empty) |

---

## Severity Classification (BR-004)

| Value | Definition | Action Required |
|-------|------------|-----------------|
| `critical` | Immediate exploitation possible | Block, fix immediately |
| `high` | Significant vulnerability | Block or needs-fix with priority |
| `medium` | Moderate risk, may be exploitable | needs-fix, prioritize |
| `low` | Minor security concern | should_fix |
| `info` | Informational, no direct risk | consider |

---

## Category Types

| Value | Definition | Examples |
|-------|------------|----------|
| `authentication` | Identity verification | Password handling, MFA, JWT |
| `authorization` | Access control | RBAC, resource ownership checks |
| `session` | Session management | Session tokens, cookie security |
| `transport` | Data transmission | HTTPS, certificate validation |
| `logging` | Security logging | Auth events, sensitive data exposure |

---

## Gate Decision Types (BR-003)

| Value | When to Use |
|-------|-------------|
| `pass` | No critical/high findings, security acceptable |
| `needs-fix` | High/medium findings with clear remediation |
| `block` | Critical finding OR multiple high OR unclear remediation |

---

## Remediation Effort Levels

| Value | Time Estimate |
|-------|---------------|
| `quick` | < 30 minutes |
| `moderate` | 30 min - 2 hours |
| `extensive` | > 2 hours |

---

## Remediation Priority Levels

| Value | Timeline |
|-------|----------|
| `immediate` | Same day |
| `soon` | Within sprint |
| `later` | Future iteration |

---

## Validation Rules

### R-002: Finding Completeness (BR-001)
Each finding must have:
- `id` in format SEC-XXX
- `severity` from defined enum
- `category` from defined enum
- Non-empty `title` and `description`
- Valid `location.file`
- `vulnerability.cwe` and `vulnerability.owasp`
- `impact.description`
- `remediation.recommendation`

### R-003: Evidence-Based Findings (BR-002)
Each finding must have:
- Specific `location` with file and line numbers
- `code_snippet` showing vulnerable code
- `impact.exploit_scenario` explaining exploitation

### R-004: Gate Decision Consistency
- If `block`, there must be `blocking_findings`
- If `pass`, `blocking_findings` must be empty
- `overall_risk` must match finding severities

### R-005: Remediation Actionability (BR-001)
Each finding must have:
- Specific `remediation.recommendation`
- `remediation.code_example` (not required for info findings)

---

## Anti-Patterns to Avoid

- ❌ **Vague findings**: Must have specific location and code snippet
- ❌ **Missing CWE/OWASP**: All findings need vulnerability classification
- ❌ **No remediation**: Every finding must have actionable fix guidance
- ❌ **Inconsistent gate decision**: Decision must match finding severities
- ❌ **Code modification by security**: Security must NEVER modify code (BR-006)

---

## Downstream Consumer Usage

### developer
- Read `findings` to understand security issues
- Use `remediation.code_example` as guidance
- Address `must_fix` items first

### reviewer
- Use `gate_decision` in acceptance decision
- Verify security concerns addressed before approval

### OpenClaw Management Layer
- Use `gate_decision.decision` for workflow
- Track `must_fix` for critical items
- Review `residual_risk` for acceptance

---

## References

- Source Contract: `specs/008-security-core/contracts/security-review-report-contract.md`
- Feature Spec: `specs/008-security-core/spec.md`
- Role Scope: `specs/008-security-core/role-scope.md`
- Skill: `.opencode/skills/security/auth-and-permission-review/SKILL.md`
- Quality Gate: `quality-gate.md` Section 3.6