# Interface Contract Template

Use this template when designing interface contracts for API endpoints, module functions, or service boundaries.

---

## Template

```yaml
interface-contract:
  # === IDENTIFICATION ===
  interface_name: "[Canonical name, e.g., UserAPI.login, UserService.findById]"
  version: "[Version number, e.g., v1.0.0]"
  purpose: "[What this interface provides, one sentence]"
  
  # === CONSUMERS ===
  consumers:
    - name: "[Consumer name]"
      type: "[upstream|downstream|internal|external]"
      expectations: "[What the consumer expects from this interface]"
    # Add more consumers as needed
  
  # === STABILITY ===
  stability_level: "[stable|evolving|experimental|deprecated]"
  # stable: No breaking changes for 12+ months
  # evolving: Changes expected, migration guidance available
  # experimental: Early stage, expect breaking changes
  # deprecated: Sunset announced
  
  # === INPUT CONTRACT ===
  input_contract:
    - name: "[Field name]"
      type: "[Type: string, integer, boolean, array, object, etc.]"
      required: [true|false]
      constraints:
        - "[Constraint 1: e.g., min_length: 3]"
        - "[Constraint 2: e.g., pattern: ^[a-zA-Z]+$]"
      examples:
        valid: "[Example of valid input]"
        invalid: "[Example of invalid input showing constraint violation]"
    # Add more fields as needed
  
  # === OUTPUT CONTRACT ===
  output_contract:
    # Success Response
    success:
      type: "[Response type name]"
      structure:
        field_name: "[type and description]"
        # Add more fields as needed
      examples:
        - "[JSON example of successful response]"
    
    # Error Contract
    error:
      code_taxonomy:
        - code: "[Error code, e.g., AUTH_001]"
          meaning: "[What this error means]"
          retry_guidance: "[Should consumer retry? How?]"
        # Add more error codes as needed
      
      format:
        code: "[type]"
        message: "[type]"
        retry_after: "[type, optional]"
        details: "[type, optional]"
      
      examples:
        - "[JSON example of error response]"
  
  # === VERSION STRATEGY ===
  version_strategy:
    scheme: "[semver|calver|custom]"
    deprecation_policy: "[Timeline and notice requirements]"
    breaking_change_definition:
      - "[Change type 1 that is considered breaking]"
      - "[Change type 2 that is considered breaking]"
  
  # === BACKWARD COMPATIBILITY ===
  backward_compatibility:
    safe_changes:
      - "[Change that is safe, e.g., adding optional field]"
      - "[Change that is safe, e.g., adding new error code]"
    
    breaking_changes:
      - "[Change that breaks compatibility]"
      - "[Change that breaks compatibility]"
    
    migration_guidance: "[How consumers should upgrade]"
  
  # === INTEGRATION TESTS ===
  integration_tests:
    required_scenarios:
      - "[Test scenario 1]"
      - "[Test scenario 2]"
    
    mock_expectations: "[What mocks should return]"
    
    compatibility_verification: "[How to verify compatibility]"
```

---

## Quick Reference

### Stability Levels

| Level | Use When | Expectations |
|-------|----------|--------------|
| stable | Production, third-party consumers | No breaking changes |
| evolving | Active development, internal use | Migration guidance provided |
| experimental | Prototype, early testing | Breaking changes expected |
| deprecated | Sunset planned | Migration deadline announced |

### Common Error Code Categories

| Prefix | Domain | Example Codes |
|--------|--------|---------------|
| AUTH_ | Authentication | AUTH_001 (Invalid credentials), AUTH_002 (Locked) |
| VAL_ | Validation | VAL_001 (Invalid format), VAL_002 (Out of range) |
| DB_ | Database | DB_001 (Connection failed), DB_002 (Timeout) |
| SYS_ | System | SYS_001 (Unavailable), SYS_002 (Timeout) |

### Retry Guidance Patterns

| Error Type | Guidance |
|------------|----------|
| User input error | "Do not retry; caller must correct input" |
| Temporary failure | "Retry with exponential backoff (max N attempts)" |
| Rate limited | "Retry after N seconds" |
| Permanent failure | "Do not retry; escalate to support" |