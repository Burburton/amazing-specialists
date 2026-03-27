# Security Review Report Contract

## Contract Metadata

| Field | Value |
|-------|-------|
| **Contract ID** | AC-001-sec |
| **Contract Name** | Security Review Report Contract |
| **Version** | 1.0.0 |
| **Owner** | security |
| **Consumers** | developer, reviewer, OpenClaw management layer |

---

## Purpose

Define the complete schema and validation rules for the `security-review-report` artifact, which documents security findings from authentication, authorization, and permission-related code reviews.

This contract satisfies:
- **AC-001**: security-review-report artifact specification
- **BR-001**: Security Must Be Actionable
- **BR-002**: Evidence-Based Findings
- **BR-003**: Gate Decision Required
- **BR-004**: Severity Classification

---

## Schema

```yaml
security_review_report:
  # Metadata (Required)
  dispatch_id: string              # Dispatch request ID
  task_id: string                  # Task ID being reviewed
  created_at: timestamp            # Report creation time
  created_by: string               # Always "security"
  
  # Scope (Required)
  scope:
    components_reviewed:           # List of files/components examined
      - path: string               # File path
        type: enum                 # authentication | authorization | session | transport | logging
        description: string        # What was examined in this component
    
    auth_mechanisms: string[]      # Authentication mechanisms found
    permission_systems: string[]   # Authorization/permission systems found
    
    review_type: enum              # Type of review performed
      - full                       # Complete security review
      - focused                    # Targeted review of specific areas
      - re-review                  # Follow-up review after fixes
  
  # Findings (Required)
  findings:
    - id: string                   # Unique finding ID (SEC-XXX)
      severity: enum               # critical | high | medium | low | info
      category: enum               # authentication | authorization | session | transport | logging
      
      title: string                # Brief finding title
      description: string          # Detailed description
      
      location:                    # Where the issue was found
        file: string               # File path
        line_start: integer        # Starting line number
        line_end: integer          # Ending line number (optional, same as start if single line)
        
      vulnerability:               # Vulnerability classification
        type: string               # Vulnerability type name
        cwe: string                # CWE identifier (e.g., CWE-798)
        owasp: string              # OWASP reference (e.g., A07:2021)
        
      code_snippet: string         # Vulnerable code snippet (markdown code block)
      
      impact:                      # Impact assessment
        description: string        # Description of potential impact
        exploit_scenario: string   # How an attacker could exploit this
        affected_users: string     # Who is affected (all users, admins, etc.)
        
      remediation:                 # How to fix
        recommendation: string     # General fix recommendation
        code_example: string       # Secure code example (markdown code block)
        effort: enum               # quick | moderate | extensive
        priority: enum             # immediate | soon | later
        
  # Risk Assessment (Required)
  risk_assessment:
    overall_risk: enum             # critical | high | medium | low
    risk_factors:                  # Contributing risk factors
      - factor: string             # Risk factor description
        level: enum                # high | medium | low
    residual_risk: string          # Risk that will remain after fixes
  
  # Gate Decision (Required - BR-003)
  gate_decision:
    decision: enum                 # pass | needs-fix | block
    conditions: string[]           # Conditions for decision
    blocking_findings: string[]    # Finding IDs that block (if any)
    
  # Recommendations (Required)
  recommendations:
    must_fix: string[]             # Items requiring immediate attention
    should_fix: string[]           # Items recommended for near-term
    consider: string[]             # Items for future consideration
    
  # Follow-up (Optional)
  follow_up:
    - item: string                 # Follow-up action
      owner: string                # Responsible party
      due_date: string             # Recommended timeline
      
  # Notes (Optional)
  notes: string | null
  
  # Compliance (Optional)
  compliance:
    standards:
      - name: string               # Standard name (OWASP, PCI-DSS, etc.)
        compliant: boolean
        notes: string
```

---

## Field Specifications

### severity (BR-004)

| Value | Definition | Example | Action Required |
|-------|------------|---------|-----------------|
| `critical` | Immediate exploitation possible, severe impact | Hardcoded credentials, auth bypass | Block, fix immediately |
| `high` | Significant vulnerability, exploitable with effort | Missing authorization check, weak hash | Block or needs-fix with priority |
| `medium` | Moderate risk, may be exploitable in certain conditions | Missing rate limiting, verbose errors | needs-fix, prioritize |
| `low` | Minor security concern, best practice improvement | Missing security headers | should_fix |
| `info` | Informational, no direct security risk | Recommendation for future | consider |

### category

| Value | Definition | Examples |
|-------|------------|----------|
| `authentication` | Identity verification mechanisms | Password handling, MFA, JWT |
| `authorization` | Access control and permissions | RBAC, resource ownership checks |
| `session` | Session management | Session tokens, cookie security |
| `transport` | Data transmission security | HTTPS, certificate validation |
| `logging` | Security-related logging | Auth events, sensitive data exposure |

### gate_decision.decision (BR-003)

| Value | Definition | When to Use |
|-------|------------|-------------|
| `pass` | No critical/high findings, security acceptable | All findings are medium/low/info |
| `needs-fix` | Issues found but not blocking | High/medium findings with clear remediation path |
| `block` | Critical vulnerability or multiple high findings | Critical finding OR multiple high findings OR remediation unclear |

### remediation.effort

| Value | Definition | Time Estimate |
|-------|------------|---------------|
| `quick` | Simple fix, one-liner or small change | < 30 minutes |
| `moderate` | Requires some refactoring | 30 min - 2 hours |
| `extensive` | Significant changes required | > 2 hours |

### remediation.priority

| Value | Definition | Timeline |
|-------|------------|----------|
| `immediate` | Must fix before proceeding | Same day |
| `soon` | Fix in current iteration | Within sprint |
| `later` | Backlog item | Future iteration |

---

## Validation Rules

### R-001: Required Fields

All fields marked as Required must be present:
- `dispatch_id`, `task_id`, `created_at`, `created_by`
- `scope.components_reviewed` (at least one)
- `findings` (list, can be empty if no issues)
- `risk_assessment.overall_risk`
- `gate_decision.decision`
- `recommendations` (all three lists, can be empty)

### R-002: Finding Completeness (BR-001)

Each finding must have:
- `id` in format `SEC-XXX`
- `severity` from defined enum
- `category` from defined enum
- `title` (non-empty string)
- `description` (non-empty string)
- `location.file` (valid file path)
- `vulnerability.cwe` and `vulnerability.owasp`
- `impact.description`
- `remediation.recommendation`

### R-003: Evidence-Based Findings (BR-002)

Each finding must have:
- `location` with specific file and line numbers
- `code_snippet` showing the vulnerable code
- `impact.exploit_scenario` explaining how to exploit

### R-004: Gate Decision Consistency

- If `gate_decision.decision` is `block`, there must be `blocking_findings` listed
- If `gate_decision.decision` is `pass`, `blocking_findings` must be empty
- `risk_assessment.overall_risk` must be consistent with finding severities

### R-005: Remediation Actionability (BR-001)

Each finding must have:
- `remediation.recommendation` with specific guidance
- `remediation.code_example` when applicable (not required for info findings)

---

## Consumer Responsibilities

### Developer

- Read `findings` to understand security issues
- Use `remediation.code_example` as guidance
- Address `recommendations.must_fix` items first
- Notify security when fixes ready for re-review

### Reviewer

- Use `gate_decision` in overall acceptance decision
- Verify security concerns are addressed before approval
- Factor `risk_assessment` into risk evaluation

### OpenClaw Management Layer

- Use `gate_decision.decision` to determine workflow
- Track `recommendations.must_fix` for critical items
- Review `risk_assessment.residual_risk` for acceptance

---

## Producer Responsibilities

### Security Role

- Provide actionable findings with specific locations
- Include CWE/OWASP references for industry alignment
- Give concrete remediation guidance with code examples
- Make clear gate decisions
- Never modify code directly (BR-006)

---

## Example: Critical Finding Report

```yaml
security_review_report:
  dispatch_id: "dispatch_008_001"
  task_id: "T-008-001"
  created_at: "2026-03-27T14:00:00Z"
  created_by: "security"
  
  scope:
    components_reviewed:
      - path: "src/services/AuthService.ts"
        type: "authentication"
        description: "JWT token generation and validation"
      - path: "src/controllers/AuthController.ts"
        type: "authentication"
        description: "Login and token refresh endpoints"
    
    auth_mechanisms: ["JWT", "password-based"]
    permission_systems: []
    review_type: "full"
  
  findings:
    - id: "SEC-001"
      severity: "critical"
      category: "authentication"
      
      title: "JWT Secret Hardcoded in Source Code"
      description: "The JWT signing secret is hardcoded directly in the source code, allowing any attacker with code access to forge arbitrary tokens."
      
      location:
        file: "src/services/JwtTokenService.ts"
        line_start: 12
        line_end: 12
        
      vulnerability:
        type: "Hardcoded Credentials"
        cwe: "CWE-798"
        owasp: "A07:2021 - Identification and Authentication Failures"
        
      code_snippet: |
        const JWT_SECRET = 'my-secret-key-12345'
        
      impact:
        description: "Attacker with code access can forge tokens for any user including administrators"
        exploit_scenario: |
          1. Attacker gains read access to code repository
          2. Extracts hardcoded JWT_SECRET value
          3. Generates valid JWT for admin user
          4. Accesses system with full admin privileges
        affected_users: "All users"
        
      remediation:
        recommendation: "Move JWT secret to environment variable and validate on startup"
        code_example: |
          const JWT_SECRET = process.env.JWT_SECRET
          if (!JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable not set')
          }
        effort: "quick"
        priority: "immediate"
        
    - id: "SEC-002"
      severity: "high"
      category: "authorization"
      
      title: "Missing Admin Role Check on Delete User Endpoint"
      description: "The DELETE /users/:id endpoint does not verify that the requesting user has admin privileges."
      
      location:
        file: "src/controllers/UserController.ts"
        line_start: 45
        line_end: 48
        
      vulnerability:
        type: "Missing Authorization"
        cwe: "CWE-862"
        owasp: "A01:2021 - Broken Access Control"
        
      code_snippet: |
        @Delete('/users/:id')
        async deleteUser(@Param('id') id: string) {
          await this.userService.delete(id)
        }
        
      impact:
        description: "Any authenticated user can delete any other user account"
        exploit_scenario: |
          1. Regular user authenticates to the system
          2. Sends DELETE request to /users/admin-id
          3. Admin account is deleted
        affected_users: "All users"
        
      remediation:
        recommendation: "Add role-based authorization guard requiring admin role"
        code_example: |
          @Delete('/users/:id')
          @Roles('admin')
          @UseGuards(RolesGuard)
          async deleteUser(@Param('id') id: string) {
            await this.userService.delete(id)
          }
        effort: "quick"
        priority: "immediate"
  
  risk_assessment:
    overall_risk: "critical"
    risk_factors:
      - factor: "Authentication bypass possible"
        level: "high"
      - factor: "Privilege escalation possible"
        level: "high"
    residual_risk: "None after fixes are applied"
    
  gate_decision:
    decision: "block"
    conditions:
      - "SEC-001 must be fixed (hardcoded secret)"
      - "SEC-002 must be fixed (missing authorization)"
    blocking_findings: ["SEC-001", "SEC-002"]
    
  recommendations:
    must_fix:
      - "Move JWT secret to environment variable (SEC-001)"
      - "Add admin role check to delete endpoint (SEC-002)"
    should_fix: []
    consider: []
    
  follow_up:
    - item: "Re-review after fixes applied"
      owner: "security"
      due_date: "2026-03-28"
```

---

## Example: Pass Report with Suggestions

```yaml
security_review_report:
  dispatch_id: "dispatch_008_002"
  task_id: "T-008-002"
  created_at: "2026-03-27T16:00:00Z"
  created_by: "security"
  
  scope:
    components_reviewed:
      - path: "src/services/AuthService.ts"
        type: "authentication"
        description: "Password validation and hash verification"
    auth_mechanisms: ["bcrypt password hashing"]
    permission_systems: []
    review_type: "focused"
  
  findings:
    - id: "SEC-003"
      severity: "low"
      category: "logging"
      
      title: "Login Failure Log Missing IP Address"
      description: "Failed login attempts are logged but do not include the source IP address for forensics."
      
      location:
        file: "src/services/AuthService.ts"
        line_start: 78
        line_end: 80
        
      vulnerability:
        type: "Insufficient Logging"
        cwe: "CWE-778"
        owasp: "A09:2021 - Security Logging and Monitoring Failures"
        
      code_snippet: |
        this.logger.warn(`Login failed for user: ${username}`)
        
      impact:
        description: "Limited ability to investigate brute force attacks or identify attack sources"
        exploit_scenario: "N/A - this is a logging improvement"
        affected_users: "Security operations team"
        
      remediation:
        recommendation: "Include IP address and user agent in login failure logs"
        code_example: |
          this.logger.warn(`Login failed for user: ${username}`, {
            ip: request.ip,
            userAgent: request.headers['user-agent']
          })
        effort: "quick"
        priority: "later"
        
  risk_assessment:
    overall_risk: "low"
    risk_factors: []
    residual_risk: "None"
    
  gate_decision:
    decision: "pass"
    conditions: []
    blocking_findings: []
    
  recommendations:
    must_fix: []
    should_fix:
      - "Add IP address to login failure logs (SEC-003)"
    consider:
      - "Implement login failure rate limiting"
```

---

## References

- `specs/008-security-core/spec.md` - Feature specification (AC-001)
- `specs/008-security-core/role-scope.md` - Security role scope
- `specs/008-security-core/downstream-interfaces.md` - Downstream handoff
- `.opencode/skills/security/auth-and-permission-review/SKILL.md` - Review skill
- `role-definition.md` Section 6 - Security role definition
- `quality-gate.md` Section 3.6 - Security quality gate

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial contract definition |