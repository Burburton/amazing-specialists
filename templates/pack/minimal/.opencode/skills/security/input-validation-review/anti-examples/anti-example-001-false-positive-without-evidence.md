# Anti-Example 001: False Positive Without Evidence

## Document Status
- **Skill**: input-validation-review
- **Anti-Pattern**: AP-003
- **Created**: 2026-03-27

---

## What Went Wrong

A security reviewer claimed a vulnerability without providing code evidence, resulting in a false positive that wasted developer time.

### Bad Output

```yaml
input_validation_review_report:
  scope: "User input handling in search functionality"
  findings:
    - id: SEC-001
      severity: critical
      category: sql_injection
      title: "Potential SQL Injection in Search"
      description: "This code might have SQL injection."
      # No code snippet
      # No evidence that input is user-controlled
      # No exploit scenario
      # Speculation without verification
  risk_assessment: critical
  gate_decision:
    decision: block
```

### Developer Investigation

Developer checked the code and found:

```typescript
// src/services/UserSearchService.ts:25
const query = this.db.createQueryBuilder('user')
  .where('user.username LIKE :pattern', { pattern: `%${username}%` })
return await query.getMany()
```

**Analysis**: This code uses parameterized queries via QueryBuilder. No SQL injection vulnerability exists.

**Result**: False positive. Developer wasted 30 minutes investigating.

---

## Why It's a Problem

### BR Violation: BR-002 (Evidence-Based Findings)

1. **False positive**: Claim contradicted by actual code
2. **Wastes developer time**: Investigation without payoff
3. **Erodes trust**: Security reviewer credibility damaged
4. **Blocks progress**: Unnecessary gate decision

### Failure Mode Detection

From `finding-quality-checklist.md`:
- ❌ `F-003`: No vulnerable code snippet
- ❌ `F-005`: Speculation without evidence ("might have")

---

## Correct Approach

### Step 1: Verify Vulnerability Exists

Before reporting, reviewer must:
1. Read the actual code
2. Trace data flow from input to sink
3. Verify input is user-controlled
4. Verify sink is vulnerable

### Step 2: Provide Evidence

### Good Output (Actual Vulnerability Found)

```yaml
input_validation_review_report:
  scope: "User input handling in legacy search endpoint"
  findings:
    - id: SEC-001
      severity: critical
      category: sql_injection
      title: "SQL Injection in Legacy Search Endpoint"
      description: "User-controlled input directly concatenated into SQL query"
      input:
        source: "HTTP request parameter 'q'"
        parameter: "req.query.q"
        trace:
          - "req.query.q received at UserController.ts:12"
          - "passed to LegacySearchService.search() at line 23"
          - "concatenated at LegacySearchService.ts:15"
      vulnerable_code:
        location:
          file: "src/services/LegacySearchService.ts"
          line_start: 15
          line_end: 18
        snippet: |
          // VULNERABLE CODE:
          const query = `SELECT * FROM users WHERE name LIKE '%${searchTerm}%'`
          return await this.db.rawQuery(query)  // Raw SQL execution
      vulnerability:
        type: "SQL Injection"
        cwe: "CWE-89"
        owasp: "A03:2021 - Injection"
      exploit_scenario:
        payload: "' OR '1'='1' --"
        attack_flow: |
          1. Attacker sends GET /legacy/search?q=' OR '1'='1' --
          2. searchTerm = "' OR '1'='1' --"
          3. Query becomes: SELECT * FROM users WHERE name LIKE '%' OR '1'='1' --'%'
          4. Condition '1'='1' is always true
          5. Returns all users (bypasses LIKE filter)
        impact: "Attacker can read all user records including admin credentials"
      remediation:
        recommendation: "Replace raw SQL with parameterized query"
        code_example: |
          // Before (BAD):
          const query = `SELECT * FROM users WHERE name LIKE '%${searchTerm}%'`
          return await this.db.rawQuery(query)
          
          // After (GOOD):
          const query = 'SELECT * FROM users WHERE name LIKE ?'
          const pattern = `%${searchTerm}%`
          return await this.db.query(query, [pattern])
        effort: quick
        priority: immediate
  validation_coverage:
    total_inputs: 3
    validated_inputs: 1
    unvalidated_inputs: 2
  risk_assessment: critical
  gate_decision:
    decision: block
    conditions:
      - "SEC-001 must be remediated before deployment"
```

---

## Good Output (Verified Safe)

If reviewer verified code is safe:

```yaml
input_validation_review_report:
  scope: "User input handling in search functionality"
  findings:
    # No vulnerabilities found - all queries are parameterized
  validation_coverage:
    total_inputs: 3
    validated_inputs: 3
    unvalidated_inputs: 0
    validation_details:
      - input: "username parameter"
        method: "QueryBuilder parameterized query"
        safe: true
        evidence: "Uses :pattern placeholder with { pattern: value } binding"
      - input: "email parameter"
        method: "QueryBuilder parameterized query"
        safe: true
        evidence: "Uses :email placeholder"
      - input: "age parameter"
        method: "Type coercion + range check"
        safe: true
        evidence: "parseInt() + if (age < 0 || age > 120) throw"
  risk_assessment: low
  gate_decision:
    decision: pass
    notes: "All inputs properly validated via parameterized queries"
```

---

## Key Differences

| Aspect | Bad Output | Good Output (Vuln Found) | Good Output (Safe) |
|--------|------------|--------------------------|---------------------|
| Verification | None | Code read + trace | Code read + verified |
| Code Snippet | Missing | Included with lines | Evidence of safety |
| Exploit Scenario | Missing | Detailed payload | N/A (no vuln) |
| Decision Basis | Speculation | Evidence | Evidence |

---

## Detection Checklist

When reviewing your own output:

- [ ] Did you read the actual code file?
- [ ] Did you trace input → sink data flow?
- [ ] Did you verify input is user-controlled?
- [ ] Is vulnerable code snippet included?
- [ ] Is exploit scenario realistic?
- [ ] Would another reviewer agree with finding?

---

## How to Fix This Anti-Pattern

1. **Always read the code**: Don't guess based on patterns
2. **Trace data flow**: Verify input reaches vulnerable sink
3. **Provide evidence**: Include code snippet showing vulnerability
4. **Test exploit scenario**: Ensure payload actually works
5. **Document safe code**: If verified safe, explain why

---

## Prevention Workflow

```
1. Identify input source
2. Trace data flow to sink
3. Check if sink is vulnerable
4. IF vulnerable:
   - Report with code snippet + exploit
   - gate_decision = block/needs-fix
5. IF safe:
   - Document validation method
   - gate_decision = pass
6. NEVER speculate without evidence
```

---

## References

- `specs/008-security-core/spec.md` Section 10 - AP-003 definition
- `specs/008-security-core/spec.md` BR-002 - Evidence-Based Findings
- `specs/008-security-core/validation/anti-pattern-guidance.md` - AP-003 section
- `specs/008-security-core/validation/finding-quality-checklist.md` - F-003 check

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial anti-example |