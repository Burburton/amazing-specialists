# Template: Input Validation Review Report

## Instructions

Copy this template and fill in all `[PLACEHOLDER]` fields. Remove placeholder comments when complete.

---

```yaml
input_validation_review_report:
  # === METADATA ===
  dispatch_id: "[PLACEHOLDER: dispatch ID from request]"
  task_id: "[PLACEHOLDER: task ID being reviewed]"
  created_at: "[PLACEHOLDER: ISO 8601 timestamp]"
  created_by: "security"
  
  # === SCOPE ===
  scope:
    inputs_reviewed:
      - source: "[PLACEHOLDER: API endpoint or input source]"
        type: "[PLACEHOLDER: http_body | query_param | path_param | header | file | database]"
        parameters: ["[PLACEHOLDER: parameter names]"]
        description: "[PLACEHOLDER: what inputs were examined]"
    
    data_flows_traced:
      - from: "[PLACEHOLDER: input source]"
        to: "[PLACEHOLDER: data sink (database, command, filesystem, output)]"
        description: "[PLACEHOLDER: how data flows]"
    
    review_type: "[PLACEHOLDER: full | focused | re-review]"
  
  # === FINDINGS ===
  # List all input validation findings. Use empty list [] if none.
  findings:
    - id: "VAL-001"
      severity: "[PLACEHOLDER: critical | high | medium | low]"
      category: "[PLACEHOLDER: sql_injection | xss | command_injection | path_traversal | 
                   nosql_injection | ldap_injection | deserialization | 
                   missing_validation | insufficient_validation]"
      
      title: "[PLACEHOLDER: Brief finding title]"
      description: |
        [PLACEHOLDER: Detailed description of the input validation issue]
      
      input:
        source: "[PLACEHOLDER: where input comes from]"
        parameter: "[PLACEHOLDER: parameter name]"
        data_type: "[PLACEHOLDER: expected data type]"
        
      vulnerability:
        type: "[PLACEHOLDER: vulnerability type name]"
        cwe: "[PLACEHOLDER: CWE-XXX]"
        owasp: "[PLACEHOLDER: A0X:2021 - Category Name]"
        description: "[PLACEHOLDER: why this is a vulnerability]"
        
      vulnerable_code:
        location: "[PLACEHOLDER: file:line format]"
        snippet: |
          [PLACEHOLDER: vulnerable code showing issue]
          
      exploit_scenario:
        payload: "[PLACEHOLDER: example malicious input]"
        steps:
          - "[PLACEHOLDER: step 1 of exploit]"
          - "[PLACEHOLDER: step 2]"
          - "[PLACEHOLDER: step 3]"
        impact: "[PLACEHOLDER: what attacker can achieve]"
        
      remediation:
        recommendation: "[PLACEHOLDER: how to fix]"
        secure_code_example: |
          [PLACEHOLDER: secure code example]
        validation_rules:
          - rule: "[PLACEHOLDER: validation rule name]"
            pattern: "[PLACEHOLDER: regex or validation logic]"
        effort: "[PLACEHOLDER: quick | moderate | extensive]"
        
  # === VALIDATION COVERAGE ===
  validation_coverage:
    total_inputs: [PLACEHOLDER: number]
    validated_inputs: [PLACEHOLDER: number]
    validation_rate: [PLACEHOLDER: percentage]
    missing_validation:
      - "[PLACEHOLDER: parameter: missing validation type]"
    
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
      - "[PLACEHOLDER: VAL-XXX]"
      # Leave empty [] if pass
    
  # === RECOMMENDATIONS ===
  recommendations:
    must_fix:
      - "[PLACEHOLDER: item requiring immediate attention]"
    should_fix:
      - "[PLACEHOLDER: item recommended for near-term]"
    consider:
      - "[PLACEHOLDER: item for future consideration]"
    
  # === NOTES (Optional) ===
  notes: |
    [PLACEHOLDER: any additional context or observations]
```

---

## Severity Classification Quick Reference

| Severity | Use When | Examples |
|----------|----------|----------|
| `critical` | Immediate exploitation, severe impact | SQL injection, command injection |
| `high` | Significant vulnerability | Stored XSS, path traversal, missing validation on critical input |
| `medium` | Moderate risk | Reflected XSS, missing rate limiting |
| `low` | Minor concern | Missing length validation, verbose errors |

## Category Quick Reference

| Category | CWE | Description |
|----------|-----|-------------|
| `sql_injection` | CWE-89 | SQL query manipulation |
| `xss` | CWE-79 | Cross-site scripting |
| `command_injection` | CWE-78 | OS command execution |
| `path_traversal` | CWE-22 | File path manipulation |
| `nosql_injection` | CWE-943 | NoSQL query manipulation |
| `ldap_injection` | CWE-90 | LDAP query manipulation |
| `deserialization` | CWE-502 | Unsafe deserialization |
| `missing_validation` | CWE-20 | No input validation present |
| `insufficient_validation` | CWE-20 | Validation present but inadequate |

## Gate Decision Quick Reference

| Decision | Criteria |
|----------|----------|
| `pass` | No injection vulnerabilities, validation adequate |
| `needs-fix` | Missing/insufficient validation, no active injection |
| `block` | Confirmed injection vulnerability |

## Common CWE/OWASP References

| Vulnerability | CWE | OWASP |
|---------------|-----|-------|
| SQL Injection | CWE-89 | A03:2021 |
| XSS | CWE-79 | A03:2021 |
| Command Injection | CWE-78 | A03:2021 |
| Path Traversal | CWE-22 | A01:2021 |
| NoSQL Injection | CWE-943 | A03:2021 |
| LDAP Injection | CWE-90 | A03:2021 |
| Deserialization | CWE-502 | A08:2021 |
| Input Validation | CWE-20 | A03:2021 |