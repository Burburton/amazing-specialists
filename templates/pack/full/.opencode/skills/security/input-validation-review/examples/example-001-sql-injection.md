# Example 001: SQL Injection

## Scenario Description

A developer has implemented a user search feature that queries the database by username. The feature accepts user input from a query parameter. Security review is triggered because the task involves input handling and database queries.

## Input Context

### Implementation Summary (from developer)

```yaml
implementation_summary:
  goal_alignment:
    goal: "Implement user search by username"
    achieved: true
  changed_files:
    - path: "src/controllers/UserController.ts"
      change_type: "modified"
      description: "Added user search endpoint"
    - path: "src/repositories/UserRepository.ts"
      change_type: "modified"
      description: "Added search query method"
```

### Task Risk Level: `high`

Input handling with database queries requires mandatory security review.

## Step-by-Step Skill Application

### Step 1: Identify Input Sources

Inputs identified:
- `GET /api/users?username=` - Query parameter

### Step 2: Trace Data Flow

```
query_param.username → UserController.searchUsers() → UserRepository.searchByUsername() → db.query()
```

### Step 3: Check Input Validation

Finding: No validation on username parameter ❌

### Step 4: Check SQL Query Construction

Finding: Direct string concatenation ❌

### Step 5: Check Output Encoding

Finding: N/A (data flows to database, not output)

### Step 6: Generate Report

## Output Artifact

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
        parameters: ["username"]
        description: "User search endpoint - username query parameter"
    
    data_flows_traced:
      - from: "query_param.username"
        to: "database.query"
        description: "Username parameter flows directly to SQL query without parameterization"
    
    review_type: "full"
  
  findings:
    - id: "VAL-001"
      severity: "critical"
      category: "sql_injection"
      
      title: "SQL Injection in User Search Endpoint"
      description: |
        The username query parameter is directly concatenated into a SQL query 
        without parameterization or input validation, allowing attackers to 
        execute arbitrary SQL commands.
      
      input:
        source: "GET /api/users?username="
        parameter: "username"
        data_type: "string"
        
      vulnerability:
        type: "SQL Injection"
        cwe: "CWE-89"
        owasp: "A03:2021 - Injection"
        description: "User-controlled input is directly concatenated into SQL query string"
        
      vulnerable_code:
        location: "src/repositories/UserRepository.ts:25"
        snippet: |
          // UserRepository.ts:25-27
          async searchByUsername(username: string) {
            const query = `SELECT * FROM users WHERE username LIKE '%${username}%'`
            return await this.db.query(query)
          }
          
      exploit_scenario:
        payload: "' UNION SELECT id, password, email, role FROM users--"
        steps:
          - "Attacker sends GET /api/users?username=' UNION SELECT id, password, email, role FROM users--"
          - "Query becomes: SELECT * FROM users WHERE username LIKE '%' UNION SELECT id, password, email, role FROM users--%'"
          - "Database returns all user passwords and emails"
          - "Attacker gains credentials for all users"
        impact: |
          Attacker can:
          - Read all data from any table (passwords, emails, PII)
          - Modify or delete data
          - Bypass authentication
          - Potentially execute administrative operations
          
      remediation:
        recommendation: "Use parameterized queries with prepared statements"
        secure_code_example: |
          async searchByUsername(username: string) {
            const query = "SELECT * FROM users WHERE username LIKE ?"
            return await this.db.query(query, [`%${username}%`])
          }
        validation_rules:
          - rule: "Username format validation"
            pattern: "^[a-zA-Z0-9_-]{1,50}$"
          - rule: "Length validation"
            pattern: "Maximum 50 characters"
        effort: "quick"
        
  validation_coverage:
    total_inputs: 1
    validated_inputs: 0
    validation_rate: 0
    missing_validation:
      - "username: No format validation"
      - "username: No length validation"
    
  risk_assessment:
    overall_risk: "critical"
    risk_factors:
      - factor: "Complete database access possible"
        level: "high"
      - factor: "No input validation"
        level: "high"
    residual_risk: "None after parameterized queries implemented"
    
  gate_decision:
    decision: "block"
    conditions:
      - "VAL-001 must be fixed: Use parameterized queries"
    blocking_findings: ["VAL-001"]
    
  recommendations:
    must_fix:
      - "Use parameterized queries for all database operations (VAL-001)"
    should_fix:
      - "Add input format validation for username"
    consider:
      - "Add rate limiting to search endpoint"
      - "Add query result limiting (max rows)"
```

## CWE/OWASP References

| Finding | CWE | OWASP |
|---------|-----|-------|
| VAL-001 | CWE-89: SQL Injection | A03:2021 - Injection |

## Gate Decision Rationale

**Decision: block**

- VAL-001 (critical): SQL injection allows complete database compromise
- Must be fixed before any further work can proceed

## Key Learnings

1. **Never concatenate user input into SQL**: Always use parameterized queries
2. **Input validation is defense in depth**: Even with parameterization, validate input format
3. **Trace data flow**: Follow user input from source to sink