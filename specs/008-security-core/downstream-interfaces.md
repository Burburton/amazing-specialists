# Downstream Interfaces

## Document Status
- **Feature ID**: `008-security-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-27
- **Purpose**: Define security handoff to developer, reviewer, and OpenClaw management layer

---

## 1. Purpose

This document defines the downstream interface for the security role, specifying:
- What developer receives from security (findings for remediation)
- What reviewer receives from security (security gate decision)
- What OpenClaw receives from security (security-review-report for acceptance verification)
- Gate decision semantics and escalation paths
- Re-review workflow

---

## 2. Downstream Consumer Overview

### 2.1 Consumers and Their Needs

| Consumer | Receives | Purpose | Priority |
|----------|----------|---------|----------|
| **developer** | Security findings | Implement remediation | High (on findings) |
| **reviewer** | Security gate decision | Factor into acceptance | High (always) |
| **OpenClaw** | security-review-report | Acceptance verification | Medium |

### 2.2 Communication Flow

```
security produces report
        │
        ├── findings → developer (for remediation)
        │
        ├── gate_decision → reviewer (for acceptance judgment)
        │
        └── security-report → OpenClaw (for acceptance verification)
```

---

## 3. Developer Interface

### 3.1 What Developer Receives

When security finds vulnerabilities, developer receives:

| Artifact | Content | Format |
|----------|---------|--------|
| `security-review-report` | Authentication/authorization findings | YAML/Markdown |
| `input-validation-review-report` | Input validation findings | YAML/Markdown |

### 3.2 Finding Structure for Developer

Each finding includes actionable remediation:

```yaml
finding:
  id: "SEC-001"
  severity: critical
  category: authentication
  title: "JWT Secret Hardcoded"
  description: "JWT signing key is directly written in source code"
  location: "JwtTokenService.ts:12"
  
  vulnerability:
    type: "Hardcoded Credentials"
    cwe: "CWE-798"
    owasp: "A07:2021 - Identification and Authentication Failures"
  
  impact:
    description: "Attacker with code access can forge any user token"
    exploit_scenario: |
      1. Attacker gains code repository access
      2. Finds hardcoded key
      3. Generates admin token
      4. Accesses system as admin
  
  remediation:
    recommendation: "Read key from environment variable"
    code_example: |
      const JWT_SECRET = process.env.JWT_SECRET
      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET not configured')
      }
    effort: quick
    priority: immediate
```

### 3.3 Developer Action Required

| Gate Decision | Developer Action | Urgency |
|---------------|------------------|---------|
| `block` | Must fix all critical/high findings | Immediate |
| `needs-fix` | Should fix medium/low findings | Before milestone |
| `pass` | No required action | N/A |

### 3.4 Handoff to Developer

```yaml
# Security to Developer Handoff
handoff:
  trigger: "gate_decision: block OR needs-fix"
  
  required_artifacts:
    - security-review-report OR input-validation-review-report
  
  must_include:
    - findings[].location (exact file and line)
    - findings[].remediation.recommendation
    - findings[].remediation.code_example (where applicable)
    - gate_decision with conditions
  
  developer_actions:
    - action: "Fix findings"
      process: "Implement remediation per recommendation"
    
    - action: "Request clarification"
      when: "Finding unclear or remediation insufficient"
      process: "Contact security with specific questions"
    
    - action: "Dispute finding"
      when: "Finding appears to be false positive"
      process: "Provide evidence why finding is invalid"
```

### 3.5 Remediation Feedback Loop

```
Developer receives findings
        ↓
Developer implements fixes
        ↓
Developer notifies security
        ↓
Security re-reviews
        ↓
Security updates gate_decision
        ↓
If pass: Handoff to reviewer
If still issues: Return to developer with new findings
```

---

## 4. Reviewer Interface

### 4.1 What Reviewer Receives

Reviewer consumes security gate decision:

| Field | Content | Purpose |
|-------|---------|---------|
| `gate_decision.decision` | pass/needs-fix/block | Factor into acceptance judgment |
| `gate_decision.conditions` | Specific conditions | Understand what's needed |
| `risk_assessment.overall_risk` | Overall risk level | Gauge security posture |
| `recommendations.must_fix` | Must-fix items | Critical items for acceptance |
| `findings` by severity | Detailed findings | Understand security issues |

### 4.2 Security Gate Decision Semantics (BR-003)

#### pass

```yaml
gate_decision:
  decision: pass
  conditions: []

meaning: |
  - No critical/high vulnerabilities
  - Acceptable residual risk
  - Security review complete
  
reviewer_action: |
  - Consider security gate passed
  - Proceed with acceptance decision
  - Factor any low/info findings as non-blocking
```

#### needs-fix

```yaml
gate_decision:
  decision: needs-fix
  conditions:
    - "Fix SEC-003 (Token expiry) before next release"

meaning: |
  - Medium/low vulnerabilities present
  - Fixes recommended but not blocking
  - Can proceed with conditions
  
reviewer_action: |
  - Document conditions in acceptance record
  - Proceed with acceptance with documented conditions
  - Track follow-up items
```

#### block

```yaml
gate_decision:
  decision: block
  conditions:
    - "Must fix SEC-001 (Hardcoded credentials)"
    - "Must fix SEC-002 (Missing authorization check)"

meaning: |
  - Critical/high vulnerabilities present
  - Must fix before acceptance
  - Security gate fails
  
reviewer_action: |
  - Block acceptance
  - Return to developer with must-fix list
  - Require re-review after fixes
```

### 4.3 Security Gate vs Reviewer Acceptance

| Aspect | Security Gate | Reviewer Acceptance |
|--------|--------------|---------------------|
| **Scope** | Security vulnerabilities only | All quality aspects |
| **Decision** | pass/needs-fix/block | accept/accept-with-conditions/reject |
| **Authority** | Security domain | Overall implementation |
| **Relationship** | Informs reviewer | Final decision |

**Important**: Security gate `block` does not automatically mean reviewer `reject`, but typically leads to rejection until security issues are resolved.

### 4.4 Parallel Execution (BR-007)

Security and reviewer can execute in parallel:

```
                ┌─────────────┐
                │  developer  │
                └──────┬──────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │  tester  │ │ security │ │ reviewer │
    └────┬─────┘ └────┬─────┘ └────┬─────┘
         │            │            │
         └────────────┼────────────┘
                      ▼
              ┌───────────────┐
              │  acceptance   │
              └───────────────┘
```

**Reviewer consumes security gate during acceptance determination**:
- If security still running: Wait for security gate
- If security blocked: Reviewer should reject pending security resolution
- If security passed: Factor into acceptance decision

---

## 5. OpenClaw Management Layer Interface

### 5.1 What OpenClaw Receives

OpenClaw receives the complete security report:

```yaml
security_review_report:
  dispatch_id: string
  task_id: string
  
  scope:
    components_reviewed: string[]
    auth_mechanisms: string[]
    permission_systems: string[]
  
  findings:
    - id: string
      severity: critical | high | medium | low | info
      category: authentication | authorization | session | transport | logging
      title: string
      description: string
      location: string
      vulnerability:
        type: string
        cwe: string
        owasp: string
      impact:
        description: string
        exploit_scenario: string
      remediation:
        recommendation: string
        code_example: string
  
  risk_assessment:
    overall_risk: critical | high | medium | low
  
  gate_decision:
    decision: pass | needs-fix | block
    conditions: string[]
  
  recommendations:
    must_fix: string[]
    should_fix: string[]
    consider: string[]
```

### 5.2 Management Decision Points

| Gate Decision | Management Action |
|---------------|-------------------|
| `pass` | Proceed with acceptance |
| `needs-fix` | Accept with documented conditions, track follow-up |
| `block` | Require remediation before acceptance |

### 5.3 Escalation to Management

Security escalates to management when:

```yaml
escalation_triggers:
  - trigger: "Critical vulnerability in production code"
    action: "Immediate notification, block deployment"
  
  - trigger: "Multiple high severity findings"
    action: "Assessment whether systemic issue"
  
  - trigger: "Remediation requires design change"
    action: "Architect and management decision needed"
  
  - trigger: "Third-party dependency vulnerability"
    action: "Management decision on upgrade/acceptance"
  
  - trigger: "Security architecture concern"
    action: "Architect review required"
```

---

## 6. Gate Decision Decision Tree

### 6.1 Decision Logic

```
START
  │
  ▼
Are there critical severity findings?
  │
  ├─ YES → gate_decision = block
  │          conditions = all critical findings
  │
  └─ NO
      │
      ▼
    Are there high severity findings?
      │
      ├─ YES → gate_decision = block
      │          conditions = all high + critical findings
      │
      └─ NO
          │
          ▼
        Are there medium severity findings?
          │
          ├─ YES → gate_decision = needs-fix
          │          conditions = all medium findings
          │
          └─ NO
              │
              ▼
            Are there low/info findings?
              │
              ├─ YES → gate_decision = needs-fix
              │          conditions = recommendations
              │
              └─ NO → gate_decision = pass
                       conditions = []
```

### 6.2 Gate Decision Examples

#### Critical Finding (block)

```yaml
findings:
  - id: SEC-001
    severity: critical
    title: "SQL Injection in Login"

gate_decision:
  decision: block
  conditions:
    - "Must fix SEC-001 (SQL Injection in Login)"
```

#### High Severity (block)

```yaml
findings:
  - id: SEC-002
    severity: high
    title: "Missing Authorization on Admin Endpoint"

gate_decision:
  decision: block
  conditions:
    - "Must fix SEC-002 (Missing Authorization)"
```

#### Medium Severity (needs-fix)

```yaml
findings:
  - id: SEC-003
    severity: medium
    title: "Token Expiry Not Enforced"

gate_decision:
  decision: needs-fix
  conditions:
    - "Fix SEC-003 (Token Expiry) before next release"
```

#### No Issues (pass)

```yaml
findings: []

gate_decision:
  decision: pass
  conditions: []
```

---

## 7. Re-Review Workflow

### 7.1 When Re-Review is Needed

Re-review is required when:
- Security gate is `block`
- Developer has fixed critical/high findings
- Developer disputes a finding

### 7.2 Re-Review Process

```yaml
re_review_workflow:
  trigger: "Developer completes remediation"
  
  steps:
    - step: "Developer implements fixes"
      output: "Updated code"
    
    - step: "Developer notifies security"
      input:
        - "Fixed findings: SEC-001, SEC-002"
        - "Changed files: [list]"
    
    - step: "Security re-reviews changed files"
      scope: "Only previously identified issues"
      # Optionally: broader re-review if changes are significant
    
    - step: "Security updates gate_decision"
      outcomes:
        - "pass: All issues resolved"
        - "block: Some issues remain"
        - "new_findings: New issues found"
    
    - step: "If pass, handoff to reviewer"
      artifact: "Updated security-review-report"
```

### 7.3 Re-Review Scope

| Original Finding Status | Re-Review Scope |
|------------------------|-----------------|
| Fixed | Verify fix is correct and complete |
| Disputed | Re-evaluate with new evidence |
| New code added | Full review of new code |

### 7.4 Re-Review Limit

Maximum re-review iterations: **3**

If issues persist after 3 re-reviews:
- Escalate to management
- Consider architectural or systemic issue
- May require security architect involvement

---

## 8. Escalation Paths

### 8.1 Escalation Scenarios

| Scenario | Escalate To | Reason |
|----------|-------------|--------|
| Critical vulnerability in production | developer, management | Immediate remediation required |
| Developer disputes finding | security + developer | Resolution needed |
| Fix requires design change | architect | Architectural decision |
| Third-party vulnerability | management | Dependency decision |
| Persistent issues after re-review | management | Systemic concern |
| Scope disagreement | architect, management | Boundary clarification |

### 8.2 Escalation Communication

```yaml
escalation:
  trigger: "Situation requires higher authority decision"
  
  format:
    escalation_id: string
    from_role: "security"
    to_role: string
    
    summary: "Brief description of issue"
    
    findings_involved:
      - finding_id: string
        severity: string
    
    blocking_points:
      - "What is blocked"
    
    options:
      - option: string
        pros: string[]
        cons: string[]
    
    recommendation: string
```

---

## 9. Communication Templates

### 9.1 Finding Handoff to Developer

```markdown
## Security Finding: SEC-001

**Severity**: Critical
**Category**: Authentication
**Location**: `JwtTokenService.ts:12`

### Issue
JWT signing key is hardcoded in source code.

### Impact
Attacker with code access can forge any user token.

### Remediation
Move JWT secret to environment variable:

```typescript
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not configured')
}
```

### References
- CWE-798: Use of Hard-coded Credentials
- OWASP A07:2021 - Identification and Authentication Failures
```

### 9.2 Gate Decision Handoff to Reviewer

```markdown
## Security Gate Decision

**Task**: T-008-001
**Decision**: block

### Summary
Security review identified 1 critical and 1 high severity finding that must be 
resolved before acceptance.

### Must-Fix Items
1. SEC-001: JWT Secret Hardcoded (critical)
2. SEC-002: Missing Authorization Check (high)

### Conditions for Pass
- Fix SEC-001 and SEC-002
- Security re-review confirming fixes

### Recommendation
Return to developer for remediation. Re-review required.
```

### 9.3 Security Pass to Reviewer

```markdown
## Security Gate Decision

**Task**: T-008-001
**Decision**: pass

### Summary
Security review completed. No critical or high severity findings.

### Findings
- SEC-003: Token Expiry (medium) - Recommend fixing before next release

### Risk Assessment
Overall risk: Low

### Recommendation
Proceed with acceptance. Track SEC-003 as follow-up item.
```

---

## 10. Integration Points

### 10.1 With Developer Workflow

```
developer implementation
        ↓
developer self-check
        ↓
tester verification
        ↓
security review ← (parallel with reviewer)
        ↓
findings → developer remediation
        ↓
security re-review
        ↓
gate decision → reviewer acceptance
```

### 10.2 With Reviewer Workflow

```
reviewer receives:
  - implementation-summary
  - verification-report
  - security-review-report (gate decision)
        ↓
reviewer makes acceptance decision
  - Factors security gate into judgment
  - Security block typically leads to reject
  - Security pass allows proceed
```

### 10.3 With Acceptance Workflow

```
acceptance receives:
  - acceptance-decision-record (from reviewer)
  - security-review-report (from security)
        ↓
acceptance makes final determination
  - Reviews all gates including security
  - Can override only with documented justification
```

---

## 11. Quality Assurance

### 11.1 Output Quality Checklist

Before handing off security report:

- [ ] All findings have specific location
- [ ] All findings have severity classification
- [ ] All findings have remediation guidance
- [ ] Remediation includes code example (where applicable)
- [ ] Gate decision is explicit (pass/needs-fix/block)
- [ ] Gate decision conditions are specific
- [ ] Risk assessment is documented
- [ ] CWE/OWASP references provided

### 11.2 Communication Quality

- [ ] Findings are specific, not vague
- [ ] Remediation is actionable
- [ ] No "be more secure" type advice
- [ ] Gate decision matches finding severity

---

## 12. References

- `specs/008-security-core/spec.md` - Feature specification
- `specs/008-security-core/role-scope.md` - Security role scope
- `specs/008-security-core/upstream-consumption.md` - Upstream interface
- `specs/006-reviewer-core/role-scope.md` - Reviewer role scope (parallel execution)
- `role-definition.md` Section 6 - Security role definition
- `io-contract.md` - Artifact contract definitions

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial downstream interfaces definition |