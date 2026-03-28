# Skill: interface-contract-design

## Purpose

Design API and module interface contracts that ensure upstream-downstream alignment, prevent integration issues, and enable independent development.

Core problems solved:
- Upstream and downstream teams work without clear interface agreements
- Interface changes break downstream consumers unexpectedly
- Missing error handling specifications cause inconsistent behavior
- Version strategies are undefined, leading to breaking changes
- Backward compatibility is not enforced systematically

## When to Use

**Required when:**
- New API endpoints need contract definition
- Module boundaries require explicit interface contracts
- Microservice boundaries are being defined
- Third-party integrations need formal contracts
- Cross-team dependencies need specification

**Recommended when:**
- Refactoring module interfaces
- Adding new methods to existing interfaces
- Planning API version upgrades
- Setting up integration test baselines
- Documenting existing interfaces formally

## When Not to Use

**Not applicable when:**
- Internal-only interfaces with single consumer
- Prototype/experimental code without stability requirements
- Trivial utility functions without contract complexity
- Configuration-only changes without interface impact

## Interface Contract Framework

### 1. Define Interface Purpose
- What service/functionality does this interface provide?
- Who are the consumers (upstream/downstream)?
- What are the stability requirements?
- What are the performance expectations?

### 2. Design Input Contract
For each input:
- Name and type (with constraints)
- Required vs. optional
- Default values (if applicable)
- Validation rules
- Examples of valid/invalid inputs

### 3. Design Output Contract
For each output:
- Name and type
- Success response structure
- Error response structure
- Partial success handling
- Pagination/streaming (if applicable)

### 4. Define Error Contract
- Error code taxonomy
- Error message format
- Retry guidance
- Error recovery expectations
- Logging requirements

### 5. Define Version Strategy
- Version numbering scheme
- Deprecation timeline
- Backward compatibility rules
- Breaking change definition
- Migration guidance

### 6. Document Backward Compatibility
- What changes are safe?
- What changes are breaking?
- How to add new fields safely
- How to deprecate fields
- Consumer upgrade path

### 7. Define Integration Test Requirements
- Contract test scenarios
- Consumer-driven contract tests
- Mock/stub expectations
- Compatibility verification

## Output Format

The skill produces an `interface-contract` artifact with the following structure:

```yaml
interface-contract:
  interface_name: string              # Canonical name of the interface
  version: string                     # Contract version (e.g., "v1.0.0")
  purpose: string                     # What this interface provides
  
  consumers:                          # Who uses this interface
    - name: string
      type: upstream|downstream|internal|external
      expectations: string
  
  stability_level: stable|evolving|experimental|deprecated
  
  input_contract:                     # Input specifications
    - name: string
      type: string
      required: boolean
      constraints: string[]           # Validation rules
      examples:                       # Valid examples
        valid: string
        invalid: string
  
  output_contract:                    # Output specifications
    success:
      type: string
      structure: object               # JSON schema or type definition
      examples: string[]
    error:
      code_taxonomy:                  # Error codes
        - code: string
          meaning: string
          retry_guidance: string
      format: object                  # Error response structure
      examples: string[]
  
  version_strategy:
    scheme: string                    # e.g., "semver"
    deprecation_policy: string
    breaking_change_definition: string[]
  
  backward_compatibility:
    safe_changes: string[]            # Non-breaking additions
    breaking_changes: string[]        # Changes requiring migration
    migration_guidance: string
  
  integration_tests:
    required_scenarios: string[]
    mock_expectations: string[]
    compatibility_verification: string
```

## Examples

### Example 1: REST API Endpoint Contract

```yaml
interface-contract:
  interface_name: "UserAuthAPI.login"
  version: "v1.0.0"
  purpose: "Authenticate users with username/password and return JWT token"
  
  consumers:
    - name: "Web Frontend"
      type: downstream
      expectations: "Fast response (<200ms), reliable error messages"
    - name: "Mobile App"
      type: downstream
      expectations: "Offline support via token caching"
  
  stability_level: stable
  
  input_contract:
    - name: "username"
      type: "string"
      required: true
      constraints:
        - "min_length: 3"
        - "max_length: 50"
        - "pattern: ^[a-zA-Z0-9_]+$"
      examples:
        valid: "john_doe"
        invalid: "j@hn!"  # Contains special characters
    
    - name: "password"
      type: "string"
      required: true
      constraints:
        - "min_length: 8"
        - "max_length: 100"
      examples:
        valid: "SecurePass123!"
        invalid: "short"  # Less than 8 characters
  
  output_contract:
    success:
      type: "LoginResponse"
      structure:
        token: "string (JWT)"
        expires_at: "ISO8601 datetime"
        user_id: "string (UUID)"
      examples:
        - '{"token": "eyJ...", "expires_at": "2024-01-02T00:00:00Z", "user_id": "abc-123"}'
    
    error:
      code_taxonomy:
        - code: "AUTH_001"
          meaning: "Invalid credentials"
          retry_guidance: "Do not retry; user must correct input"
        - code: "AUTH_002"
          meaning: "Account locked"
          retry_guidance: "Retry after 30 minutes or contact support"
        - code: "AUTH_003"
          meaning: "Service unavailable"
          retry_guidance: "Retry with exponential backoff (max 3 attempts)"
      format:
        code: "string"
        message: "string"
        retry_after: "integer (seconds, optional)"
      examples:
        - '{"code": "AUTH_001", "message": "Invalid username or password"}'
  
  version_strategy:
    scheme: "semver"
    deprecation_policy: "6 months notice before removal"
    breaking_change_definition:
      - "Removing required field"
      - "Changing field type"
      - "Removing error code"
      - "Changing error code meaning"
  
  backward_compatibility:
    safe_changes:
      - "Adding optional field"
      - "Adding new error code"
      - "Adding new endpoint variant"
    breaking_changes:
      - "Removing field"
      - "Making optional field required"
      - "Changing field semantics"
    migration_guidance: "Add new fields as optional; deprecate with notice; remove after 6 months"
  
  integration_tests:
    required_scenarios:
      - "Valid credentials return token"
      - "Invalid credentials return AUTH_001"
      - "Locked account returns AUTH_002"
      - "Rate limited request returns AUTH_004"
    mock_expectations: "Mock AuthService returns predictable responses for contract tests"
    compatibility_verification: "Run consumer-driven contract tests before each release"
```

### Example 2: Module Function Interface

```yaml
interface-contract:
  interface_name: "UserService.findByEmail"
  version: "v1.0.0"
  purpose: "Retrieve user entity by email address"
  
  consumers:
    - name: "AuthService"
      type: internal
      expectations: "Single query, return null if not found"
    - name: "NotificationService"
      type: internal
      expectations: "Handle case where user does not exist gracefully"
  
  stability_level: stable
  
  input_contract:
    - name: "email"
      type: "string"
      required: true
      constraints:
        - "Valid email format"
        - "Case-insensitive lookup"
      examples:
        valid: "user@example.com"
        invalid: "not-an-email"
  
  output_contract:
    success:
      type: "User | null"
      structure:
        id: "UUID"
        email: "string"
        name: "string"
        created_at: "datetime"
      examples:
        - '{"id": "abc-123", "email": "user@example.com", "name": "John Doe"}'
        - 'null'  # User not found
    
    error:
      code_taxonomy:
        - code: "DB_001"
          meaning: "Database connection failure"
          retry_guidance: "Retry with backoff; escalate if persists"
        - code: "VAL_001"
          meaning: "Invalid email format"
          retry_guidance: "Do not retry; caller must validate input"
      format:
        code: "string"
        message: "string"
        stack_trace: "string (dev mode only)"
  
  version_strategy:
    scheme: "semver"
    deprecation_policy: "3 months notice for internal interfaces"
    breaking_change_definition:
      - "Changing return type"
      - "Changing parameter order"
      - "Removing parameter"
  
  backward_compatibility:
    safe_changes:
      - "Adding optional parameter with default"
      - "Adding new field to User object"
    breaking_changes:
      - "Changing email lookup behavior"
      - "Removing field from User object"
    migration_guidance: "Use optional parameters for extensions; version User object separately"
  
  integration_tests:
    required_scenarios:
      - "Existing email returns User"
      - "Non-existent email returns null"
      - "Invalid email throws VAL_001"
      - "Database failure throws DB_001"
    mock_expectations: "Mock UserRepository returns predefined users"
    compatibility_verification: "Unit tests verify contract compliance"
```

## Anti-Examples

### Anti-Example 1: Missing Error Contract

**What NOT to do:**

```yaml
# WRONG: No error handling specified
interface-contract:
  interface_name: "PaymentAPI.charge"
  input_contract:
    - name: "amount"
      type: "number"
  output_contract:
    success:
      type: "PaymentResult"
  # Missing: error contract
  # Missing: retry guidance
  # Missing: error code taxonomy
```

**Why it's wrong:**
- Consumers don't know how to handle failures
- Inconsistent error responses across implementations
- No guidance for retry vs. escalation
- Integration tests cannot verify error scenarios

**Correct approach:**
Define complete error taxonomy with retry guidance for each error code.

---

### Anti-Example 2: No Backward Compatibility Rules

**What NOT to do:**

```yaml
# WRONG: No backward compatibility guidance
interface-contract:
  interface_name: "OrderAPI.create"
  version: "v1.0.0"
  # Missing: backward_compatibility section
  # Missing: breaking_change_definition
  # Missing: migration_guidance
```

**Why it's wrong:**
- Future changes may break consumers unexpectedly
- No guidance for safe evolution
- No deprecation policy
- Consumers cannot plan upgrades

**Correct approach:**
Always define safe vs. breaking changes with migration guidance.

---

### Anti-Example 3: Implicit Constraints

**What NOT to do:**

```yaml
# WRONG: Constraints are implicit, not explicit
interface-contract:
  interface_name: "UserAPI.updateProfile"
  input_contract:
    - name: "age"
      type: "number"
      # Missing: explicit constraints (min/max)
    - name: "bio"
      type: "string"
      # Missing: length constraints
```

**Why it's wrong:**
- Consumers discover constraints only through trial and error
- Validation logic differs across implementations
- No examples of valid/invalid inputs
- Integration tests incomplete

**Correct approach:**
Every input field must have explicit constraints with valid/invalid examples.

---

### Anti-Example 4: Unstable Interface Marked as Stable

**What NOT to do:**

```yaml
# WRONG: Experimental interface marked as stable
interface-contract:
  interface_name: "ExperimentalAIChatAPI"
  stability_level: stable  # Incorrect!
  # This is a new experimental feature, should be "experimental"
```

**Why it's wrong:**
- Consumers expect stability guarantees
- Breaking changes will surprise consumers
- Trust is damaged when contract is violated
- Proper stability level should reflect actual risk

**Correct approach:**
Mark new or evolving interfaces as `experimental` or `evolving`, upgrade to `stable` only after proven reliability.

## Checklists

### Pre-Design Checklist
- [ ] Interface purpose is clear
- [ ] All consumers identified
- [ ] Stability expectations understood
- [ ] Performance requirements known

### Input Contract Checklist
- [ ] All inputs have explicit types
- [ ] All inputs have constraints
- [ ] Required vs. optional marked
- [ ] Valid/invalid examples provided

### Output Contract Checklist
- [ ] Success structure defined
- [ ] Error code taxonomy complete
- [ ] Error format standardized
- [ ] Retry guidance for each error

### Version Strategy Checklist
- [ ] Versioning scheme defined
- [ ] Deprecation policy set
- [ ] Breaking change criteria explicit
- [ ] Migration path documented

### Backward Compatibility Checklist
- [ ] Safe changes listed
- [ ] Breaking changes listed
- [ ] Migration guidance provided
- [ ] Consumer upgrade path clear

## Common Failure Modes

| Failure Mode | Symptoms | Mitigation |
|--------------|----------|------------|
| Missing error contract | Consumers fail on unexpected errors | Require error taxonomy in all contracts |
| Implicit constraints | Validation differs by implementation | Mandate explicit constraints with examples |
| No version strategy | Breaking changes surprise consumers | Require version strategy before approval |
| Unstable marked stable | Trust damaged by breaking changes | Stability audit before marking stable |
| Missing retry guidance | Retry loops or premature escalation | Include retry guidance for every error code |

## Templates

### Minimal Interface Contract Template

```yaml
interface-contract:
  interface_name: "[Canonical name]"
  version: "[Version number]"
  purpose: "[What this interface provides]"
  
  consumers:
    - name: "[Consumer name]"
      type: upstream|downstream|internal|external
      expectations: "[Consumer expectations]"
  
  stability_level: stable|evolving|experimental|deprecated
  
  input_contract:
    - name: "[Field name]"
      type: "[Type]"
      required: true|false
      constraints: ["[Constraint 1]", "[Constraint 2]"]
      examples:
        valid: "[Valid example]"
        invalid: "[Invalid example]"
  
  output_contract:
    success:
      type: "[Type]"
      structure: "[Schema definition]"
      examples: ["[Example 1]"]
    error:
      code_taxonomy:
        - code: "[Code]"
          meaning: "[Description]"
          retry_guidance: "[Retry strategy]"
      format: "[Error schema]"
  
  version_strategy:
    scheme: "[Versioning scheme]"
    deprecation_policy: "[Timeline and notice]"
    breaking_change_definition: ["[Breaking change 1]"]
  
  backward_compatibility:
    safe_changes: ["[Safe change 1]"]
    breaking_changes: ["[Breaking change 1]"]
    migration_guidance: "[How to evolve safely]"
  
  integration_tests:
    required_scenarios: ["[Scenario 1]"]
    mock_expectations: "[Mock behavior]"
    compatibility_verification: "[Verification method]"
```

## Notes

### Relationship to MVP Architect Skills
- `requirement-to-design` identifies interfaces needed
- `interface-contract-design` defines each interface in detail
- Use after requirement-to-design, before implementation

### Relationship to Other Skills
- `tradeoff-analysis`: Evaluate interface design alternatives
- `module-boundary-design`: Interfaces are defined at module boundaries
- `migration-planning`: Interface changes require migration planning

### Downstream Consumption
- **developer**: Implements according to contract
- **tester**: Creates contract tests from specifications
- **reviewer**: Validates contract completeness
- **docs**: Documents API from contract

### Contract-Driven Development Benefits
- Independent development (frontend/backend can work simultaneously)
- Integration issues discovered early
- Breaking changes prevented
- Consumer expectations documented