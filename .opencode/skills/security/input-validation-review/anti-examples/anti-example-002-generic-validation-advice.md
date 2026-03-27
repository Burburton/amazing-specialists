# Anti-Example 002: Generic Validation Advice

## Document Status
- **Skill**: input-validation-review
- **Anti-Pattern**: AP-001 (Variant)
- **Created**: 2026-03-27

---

## What Went Wrong

A security reviewer provided generic validation advice without specific input identification, making the finding unactionable.

### Bad Output

```yaml
input_validation_review_report:
  scope: "All user inputs in the application"
  findings:
    - id: SEC-001
      severity: medium
      category: missing_validation
      title: "Input Validation Issues"
      description: "Inputs should be validated properly"
      remediation:
        recommendation: "Validate all inputs properly"
        # No specific inputs listed
        # No specific validation method
        # No code example
  risk_assessment: medium
  gate_decision:
    decision: needs-fix
```

### Why This Is a Problem

1. **No scope**: "All user inputs" is too broad
2. **No specifics**: Which inputs? What validation missing?
3. **No code example**: How to validate?
4. **Unactionable**: Developer must audit entire application

---

## Why It's a Problem

### BR Violation: BR-001 (Security Must Be Actionable)

1. **Developer cannot act**: Which inputs need validation?
2. **Scope explosion**: Reviewer asks to validate "all inputs"
3. **Generic advice**: "Validate properly" has no implementation
4. **No priorities**: Developer doesn't know which inputs are critical

### Failure Mode Detection

From `finding-quality-checklist.md`:
- ❌ `F-001`: No specific location (which input?)
- ❌ `F-005`: Vague ("validate properly")
- ❌ `F-004`: Generic remediation

---

## Correct Approach

### Step 1: Identify Specific Inputs

List each input source with:
- Endpoint/parameter name
- Data type expected
- Current validation status

### Step 2: Analyze Each Input

For each input, determine:
- Validation present or missing
- If present, is it sufficient?
- Specific vulnerability risk

### Step 3: Provide Specific Remediation

### Good Output

```yaml
input_validation_review_report:
  scope: "User inputs in profile update endpoint (PUT /users/:id)"
  findings:
    - id: SEC-001
      severity: high
      category: missing_validation
      title: "Email Parameter Missing Format Validation"
      description: "Email parameter accepts any string without format check"
      input:
        source: "HTTP request body field 'email'"
        parameter: "req.body.email"
        endpoint: "PUT /users/:id"
        expected_type: "string (email format)"
        current_validation: "none"
      vulnerable_code:
        location:
          file: "src/controllers/UserController.ts"
          line_start: 32
          line_end: 35
        snippet: |
          // MISSING VALIDATION:
          @Put(':id')
          async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
            // No email format validation
            return await this.userService.update(id, body)
          }
      vulnerability:
        type: "Missing Input Validation"
        cwe: "CWE-20"
        owasp: "A03:2021 - Injection"
      impact:
        description: "Invalid email formats stored, may break email-dependent features"
        examples:
          - "SQL-like strings: 'test@example' OR '1'='1'"
          - "Script injection: '<script>alert(1)</script>@example.com'"
      remediation:
        recommendation: "Add email format validation with regex and length limits"
        code_example: |
          // Before (BAD):
          @Put(':id')
          async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
            return await this.userService.update(id, body)
          }
          
          // After (GOOD):
          import { IsEmail, IsLength } from 'class-validator'
          
          class UpdateUserDto {
            @IsEmail()
            email: string
            
            @IsLength(1, 100)
            name: string
          }
          
          @Put(':id')
          async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
            // Validation happens automatically via DTO decorators
            return await this.userService.update(id, body)
          }
        effort: quick
        priority: high
    
    - id: SEC-002
      severity: medium
      category: insufficient_validation
      title: "Name Parameter Has Insufficient Length Validation"
      description: "Name parameter validated but max length is 500, allowing potential storage abuse"
      input:
        source: "HTTP request body field 'name'"
        parameter: "req.body.name"
        endpoint: "PUT /users/:id"
        expected_type: "string (human name)"
        current_validation: "length min=1, max=500"
      vulnerable_code:
        location:
          file: "src/dto/UpdateUserDto.ts"
          line_start: 8
          line_end: 12
        snippet: |
          @IsLength(1, 500)  // 500 is too long for human name
          name: string
      remediation:
        recommendation: "Reduce max length to 100 for human names"
        code_example: |
          @IsLength(1, 100)  // Reasonable for human names
          name: string
        effort: quick
        priority: normal
    
    - id: SEC-003
      severity: info
      category: validated_safe
      title: "Age Parameter Properly Validated"
      description: "Age parameter has type coercion and range validation"
      input:
        source: "HTTP request body field 'age'"
        parameter: "req.body.age"
        endpoint: "PUT /users/:id"
        expected_type: "integer (human age)"
        current_validation: "parseInt + range check 0-120"
        safe: true
  
  validation_coverage:
    total_inputs: 3
    validated_inputs: 2
    unvalidated_inputs: 1
    coverage_percentage: 67%
    inputs_detail:
      - input: "email"
        validated: false
        severity: high
      - input: "name"
        validated: true
        severity: medium (insufficient)
      - input: "age"
        validated: true
        severity: safe
  
  risk_assessment: high
  gate_decision:
    decision: needs-fix
    conditions:
      - "SEC-001: Add email validation"
      - "SEC-002: Reduce name max length (optional)"
```

---

## Key Differences

| Aspect | Bad Output | Good Output |
|--------|------------|-------------|
| Scope | "All inputs" | Specific endpoint |
| Findings | Generic | Per-input specific |
| Input ID | Missing | Source + parameter + endpoint |
| Current Status | Missing | Validation status documented |
| Remediation | "Validate properly" | Specific code example |
| Coverage | Missing | Statistics + details |

---

## Input Identification Template

For each finding, include:

```yaml
input:
  source: "Where input comes from (HTTP body, query, header)"
  parameter: "Exact parameter name"
  endpoint: "HTTP endpoint if applicable"
  expected_type: "What type/format is expected"
  current_validation: "none | type_check | format_check | full"
  safe: true | false  # If validated properly
```

---

## Detection Checklist

When reviewing your own output:

- [ ] Is scope specific (one endpoint/function)?
- [ ] Is each input identified (source + parameter)?
- [ ] Is current validation status documented?
- [ ] Is remediation specific to each input?
- [ ] Is code example provided for each finding?
- [ ] Is validation coverage calculated?

---

## How to Fix This Anti-Pattern

1. **Limit scope**: Review one endpoint at a time
2. **Enumerate inputs**: List each input parameter
3. **Document current state**: What validation exists?
4. **Provide specific fix**: Code example for each input
5. **Calculate coverage**: Show validation statistics

---

## Scope Best Practice

Instead of:
> "Review all inputs in the application"

Do:
> "Review inputs in PUT /users/:id endpoint (email, name, age)"

Per-input findings are actionable. Bulk findings are not.

---

## References

- `specs/008-security-core/spec.md` Section 10 - AP-001 definition
- `specs/008-security-core/spec.md` BR-001 - Security Must Be Actionable
- `specs/008-security-core/validation/anti-pattern-guidance.md` - AP-001 section
- `specs/008-security-core/validation/finding-quality-checklist.md` - F-001, F-005 checks
- `specs/008-security-core/contracts/input-validation-review-report-contract.md` - input field

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial anti-example |