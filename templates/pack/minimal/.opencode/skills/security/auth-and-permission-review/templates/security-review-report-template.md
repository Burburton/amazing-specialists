# Template: Security Review Report

## Instructions

Copy this template and fill in all `[PLACEHOLDER]` fields. Remove placeholder comments when complete.

---

```yaml
security_review_report:
  # === METADATA ===
  dispatch_id: "[PLACEHOLDER: dispatch ID from request]"
  task_id: "[PLACEHOLDER: task ID being reviewed]"
  created_at: "[PLACEHOLDER: ISO 8601 timestamp]"
  created_by: "security"
  
  # === SCOPE ===
  scope:
    components_reviewed:
      - path: "[PLACEHOLDER: file path]"
        type: "[PLACEHOLDER: authentication | authorization | session | transport | logging]"
        description: "[PLACEHOLDER: what was examined]"
      # Add more components as needed
    
    auth_mechanisms:
      - "[PLACEHOLDER: e.g., JWT, password-based, OAuth]"
    
    permission_systems:
      - "[PLACEHOLDER: e.g., RBAC, ACL]"
      # Leave empty [] if none
    
    review_type: "[PLACEHOLDER: full | focused | re-review]"
  
  # === FINDINGS ===
  # List all security findings. Use empty list [] if none.
  findings:
    - id: "SEC-001"
      severity: "[PLACEHOLDER: critical | high | medium | low | info]"
      category: "[PLACEHOLDER: authentication | authorization | session | transport | logging]"
      
      title: "[PLACEHOLDER: Brief finding title]"
      description: |
        [PLACEHOLDER: Detailed description of the security issue]
      
      location:
        file: "[PLACEHOLDER: file path]"
        line_start: [PLACEHOLDER: line number]
        line_end: [PLACEHOLDER: line number, omit if single line]
        
      vulnerability:
        type: "[PLACEHOLDER: vulnerability type name]"
        cwe: "[PLACEHOLDER: CWE-XXX]"
        owasp: "[PLACEHOLDER: A0X:2021 - Category Name]"
        
      code_snippet: |
        [PLACEHOLDER: vulnerable code]
        
      impact:
        description: "[PLACEHOLDER: what could happen]"
        exploit_scenario: |
          1. [PLACEHOLDER: step 1]
          2. [PLACEHOLDER: step 2]
          3. [PLACEHOLDER: step 3]
        affected_users: "[PLACEHOLDER: who is affected]"
        
      remediation:
        recommendation: "[PLACEHOLDER: how to fix]"
        code_example: |
          [PLACEHOLDER: secure code example]
        effort: "[PLACEHOLDER: quick | moderate | extensive]"
        priority: "[PLACEHOLDER: immediate | soon | later]"
  
  # === RISK ASSESSMENT ===
  risk_assessment:
    overall_risk: "[PLACEHOLDER: critical | high | medium | low]"
    risk_factors:
      - factor: "[PLACEHOLDER: risk factor description]"
        level: "[PLACEHOLDER: high | medium | low]"
    residual_risk: "[PLACEHOLDER: risk after fixes applied]"
    
  # === GATE DECISION ===
  gate_decision:
    decision: "[PLACEHOLDER: pass | needs-fix | block]"
    conditions:
      - "[PLACEHOLDER: condition for decision]"
    blocking_findings:
      - "[PLACEHOLDER: SEC-XXX]"
      # Leave empty [] if pass
    
  # === RECOMMENDATIONS ===
  recommendations:
    must_fix:
      - "[PLACEHOLDER: item requiring immediate attention]"
    should_fix:
      - "[PLACEHOLDER: item recommended for near-term]"
    consider:
      - "[PLACEHOLDER: item for future consideration]"
    
  # === FOLLOW-UP (Optional) ===
  follow_up:
    - item: "[PLACEHOLDER: follow-up action]"
      owner: "[PLACEHOLDER: responsible party]"
      due_date: "[PLACEHOLDER: recommended date]"
      
  # === NOTES (Optional) ===
  notes: |
    [PLACEHOLDER: any additional context or observations]
```

---

## Severity Classification Quick Reference

| Severity | Use When | Examples |
|----------|----------|----------|
| `critical` | Immediate exploitation possible | SQL injection, auth bypass, hardcoded credentials |
| `high` | Significant vulnerability | Missing authorization, stored XSS, weak crypto |
| `medium` | Moderate risk, needs conditions | Missing rate limiting, reflected XSS |
| `low` | Minor concern | Verbose errors, missing headers |
| `info` | Best practice suggestion | Logging improvements, documentation |

## Gate Decision Quick Reference

| Decision | Criteria |
|----------|----------|
| `pass` | No critical/high findings, acceptable residual risk |
| `needs-fix` | Medium/low findings present, fixes recommended |
| `block` | Critical/high findings, must fix before proceeding |

## Common CWE/OWASP References

| Vulnerability Type | CWE | OWASP |
|-------------------|-----|-------|
| Hardcoded Credentials | CWE-798 | A07:2021 |
| Missing Authorization | CWE-862 | A01:2021 |
| SQL Injection | CWE-89 | A03:2021 |
| XSS | CWE-79 | A03:2021 |
| Path Traversal | CWE-22 | A01:2021 |
| Weak Password Hash | CWE-916 | A02:2021 |
| Session Fixation | CWE-384 | A07:2021 |
| CSRF | CWE-352 | A01:2021 |
| Insufficient Logging | CWE-778 | A09:2021 |