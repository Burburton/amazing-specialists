# Skill: module-boundary-design

## Purpose

Define module boundaries, responsibility divisions, dependencies, and integration seams to ensure high cohesion and low coupling.

Core problems solved:
- Unclear module responsibilities leading to code chaos
- Circular dependencies causing maintenance difficulties
- Module granularity too large or too small
- Unreasonable interface design
- Missing extension points for future evolution

## When to Use

**Must use when:**
- Architecture design requires module refinement
- Before refactoring to redivide module boundaries
- Adding new modules requiring boundary definition
- Resolving circular dependency problems

**Recommended when:**
- Code review reveals module boundary issues
- Performance optimization requires boundary adjustment
- Team division of labor requires boundary alignment

## When Not to Use

**Not applicable when:**
- Module boundaries are already clear (implement directly)
- Pure scripts or utility code
- Single functionality requiring no split
- Emergency fix scenarios

## Module Design Principles

### 1. Single Responsibility (SRP)
Each module should have one and only one reason to change.

### 2. Dependency Inversion (DIP)
Depend on abstractions, not concrete implementations.

### 3. Interface Segregation (ISP)
Interfaces should be small and specialized, not forcing dependence on unnecessary interfaces.

### 4. Least Knowledge Principle
Modules should only know about their direct dependencies.

### 5. Stable Dependencies Principle
Dependencies should point toward more stable modules.

## Steps

### Step 1: Identify Functional Responsibilities
1. List all functional points
2. Group by responsibility similarity
3. Identify core vs. auxiliary functions
4. Identify common vs. specialized functions

### Step 2: Preliminary Module Division
1. Map each responsibility group to a module candidate
2. Evaluate module granularity (too large/too small)
3. Check inter-module dependencies
4. Identify circular dependencies

### Step 3: Define Module Interfaces
1. Determine public API for each module
2. Define interface signatures and data structures
3. Clarify error handling conventions
4. Determine version compatibility strategy

### Step 4: Optimize Dependencies
1. Eliminate circular dependencies:
   - Extract common dependencies
   - Use interfaces/abstractions
   - Redivide boundaries

2. Reduce dependency count:
   - Merge highly coupled modules
   - Extract common infrastructure
   - Use dependency injection

### Step 5: Verify Boundary Reasonableness
1. **Testability**: Can the module be independently tested?
2. **Replaceability**: Can the module be replaced?
3. **Understandability**: Is the module responsibility clear?
4. **Maintainability**: Is the modification impact scope controllable?

### Step 6: Document
Output module boundary definition document.

## Output Format

The output must follow the `module-boundaries` artifact contract (AC-002) with these exact fields:

```yaml
module_boundaries:
  # AC-002 Field 1: Module list with names and descriptions
  module_list:
    - name: string
      description: string
      
  # AC-002 Field 2: Each module's responsibilities
  module_responsibilities:
    - module: string
      primary_responsibility: string
      scope:
        - string  # included functionalities
      non_responsibilities:
        - string  # explicit exclusions
        
  # AC-002 Field 3: Input/output for each module
  inputs_outputs:
    - module: string
      inputs:
        - name: string
          type: string
          source: string
          description: string
      outputs:
        - name: string
          type: string
          destination: string
          description: string
        
  # AC-002 Field 4: How modules depend on each other
  dependency_directions:
    - from: string
      to: string
      type: required | optional
      reason: string
      direction: downstream | upstream
        
  # AC-002 Field 5: Points where modules connect
  integration_seams:
    - seam_id: string
      modules_involved:
        - string
      integration_type: api | event | data | protocol
      description: string
      stability: stable | evolving
        
  # AC-002 Field 6: Where extension is allowed (NEW - required by spec)
  future_extension_boundary:
    - extension_point: string
      module: string
      what_can_extend: string
      what_must_remain_stable: string
      extension_mechanism: plugin | inheritance | composition | configuration
        
  # AC-002 Field 7: What each module does NOT do (NEW - required by spec)
  explicit_non_responsibilities:
    - module: string
      does_not_do:
        - string
      rationale: string

  # Dependency graph (text format)
  dependency_graph: |
    ModuleA -> ModuleB
    ModuleB -> ModuleC
    ModuleD -> ModuleB
    
  # Cross-cutting concerns
  cross_cutting_concerns:
    - concern: string
      modules: string[]
      solution: string
```

## Examples

### Example 1: Authentication System Module Division

```yaml
module_boundaries:
  module_list:
    - name: AuthController
      description: "Handle HTTP authentication requests"
    - name: AuthService
      description: "Authentication business logic"
    - name: UserRepository
      description: "User data access layer"
    - name: TokenService
      description: "JWT token management"
    - name: PasswordHasher
      description: "Password hashing and verification"
      
  module_responsibilities:
    - module: AuthController
      primary_responsibility: "Process HTTP authentication requests"
      scope:
        - "Login endpoint"
        - "Logout endpoint"
        - "Token refresh endpoint"
      non_responsibilities:
        - "Business logic delegation"
        - "Direct database access"
        
    - module: AuthService
      primary_responsibility: "Authentication business logic"
      scope:
        - "User validation"
        - "Token management"
        - "Session management"
      non_responsibilities:
        - "HTTP request handling"
        - "Direct data persistence"
        
    - module: UserRepository
      primary_responsibility: "User data access"
      scope:
        - "User queries"
        - "User creation"
        - "User updates"
      non_responsibilities:
        - "Business logic"
        - "Password hashing"
        
    - module: TokenService
      primary_responsibility: "JWT token management"
      scope:
        - "Token generation"
        - "Token validation"
        - "Token refresh"
      non_responsibilities:
        - "User validation"
        - "Session storage"
        
    - module: PasswordHasher
      primary_responsibility: "Password hashing and verification"
      scope:
        - "Password hashing"
        - "Password verification"
      non_responsibilities:
        - "User data access"
        - "Token generation"
        
  inputs_outputs:
    - module: AuthController
      inputs:
        - name: LoginRequest
          type: HTTP POST body
          source: Client
          description: "User credentials"
      outputs:
        - name: LoginResponse
          type: HTTP Response
          destination: Client
          description: "Authentication result with token"
          
    - module: AuthService
      inputs:
        - name: Credentials
          type: Object
          source: AuthController
          description: "Username and password"
      outputs:
        - name: AuthResult
          type: Object
          destination: AuthController
          description: "Authentication success/failure with user info"
          
    - module: UserRepository
      inputs:
        - name: Username
          type: String
          source: AuthService
          description: "Username to query"
      outputs:
        - name: User
          type: Object | null
          destination: AuthService
          description: "User entity or null if not found"
          
  dependency_directions:
    - from: AuthController
      to: AuthService
      type: required
      reason: "Delegate business logic"
      direction: downstream
    - from: AuthService
      to: UserRepository
      type: required
      reason: "User data queries"
      direction: downstream
    - from: AuthService
      to: TokenService
      type: required
      reason: "Token generation"
      direction: downstream
    - from: AuthService
      to: PasswordHasher
      type: required
      reason: "Password verification"
      direction: downstream
      
  integration_seams:
    - seam_id: IS-001
      modules_involved:
        - AuthController
        - AuthService
      integration_type: api
      description: "Synchronous method calls for authentication flow"
      stability: stable
    - seam_id: IS-002
      modules_involved:
        - AuthService
        - UserRepository
      integration_type: api
      description: "Repository pattern for data access"
      stability: stable
    - seam_id: IS-003
      modules_involved:
        - AuthService
        - TokenService
      integration_type: api
      description: "Token generation and validation interface"
      stability: stable
      
  future_extension_boundary:
    - extension_point: "Multi-factor authentication"
      module: AuthService
      what_can_extend: "Add additional authentication factors"
      what_must_remain_stable: "Interface with AuthController"
      extension_mechanism: composition
    - extension_point: "Custom token providers"
      module: TokenService
      what_can_extend: "Support OAuth, SAML, custom tokens"
      what_must_remain_stable: "Token generation interface"
      extension_mechanism: inheritance
    - extension_point: "Alternative user stores"
      module: UserRepository
      what_can_extend: "LDAP, OAuth providers, custom databases"
      what_must_remain_stable: "Repository interface"
      extension_mechanism: inheritance
      
  explicit_non_responsibilities:
    - module: AuthController
      does_not_do:
        - "Business logic implementation"
        - "Direct database queries"
        - "Token generation logic"
      rationale: "Separation of concerns - controller only handles HTTP layer"
    - module: AuthService
      does_not_do:
        - "HTTP request parsing"
        - "Raw SQL execution"
        - "Cryptographic operations"
      rationale: "Service layer coordinates but does not implement low-level operations"
    - module: UserRepository
      does_not_do:
        - "Password hashing"
        - "Business rule validation"
        - "Session management"
      rationale: "Repository only handles data persistence"
      
  dependency_graph: |
    AuthController -> AuthService
    AuthService -> UserRepository
    AuthService -> TokenService
    AuthService -> PasswordHasher
    
  cross_cutting_concerns:
    - concern: "Logging"
      modules:
        - AuthController
        - AuthService
      solution: "Use dependency injection for logger interface"
    - concern: "Error handling"
      modules:
        - AuthController
        - AuthService
        - UserRepository
      solution: "Unified exception hierarchy with error codes"
```

### Example 2: E-commerce Order Processing

```yaml
module_boundaries:
  module_list:
    - name: OrderController
      description: "Handle order-related HTTP requests"
    - name: OrderService
      description: "Order business logic and workflow"
    - name: PaymentService
      description: "Payment processing"
    - name: InventoryService
      description: "Inventory management"
    - name: NotificationService
      description: "Send order notifications"
    - name: OrderRepository
      description: "Order data persistence"
      
  module_responsibilities:
    - module: OrderService
      primary_responsibility: "Orchestrate order workflow"
      scope:
        - "Order creation"
        - "Order status transitions"
        - "Inventory reservation"
        - "Payment coordination"
      non_responsibilities:
        - "HTTP handling"
        - "Direct payment processing"
        - "Notification sending"
        
  inputs_outputs:
    - module: OrderService
      inputs:
        - name: CreateOrderCommand
          type: Command object
          source: OrderController
          description: "Order creation request"
      outputs:
        - name: OrderResult
          type: Result object
          destination: OrderController
          description: "Order creation result with order ID"
          
  dependency_directions:
    - from: OrderService
      to: PaymentService
      type: required
      reason: "Process payment"
      direction: downstream
    - from: OrderService
      to: InventoryService
      type: required
      reason: "Reserve inventory"
      direction: downstream
    - from: OrderService
      to: NotificationService
      type: optional
      reason: "Send notifications"
      direction: downstream
      
  integration_seams:
    - seam_id: IS-001
      modules_involved:
        - OrderService
        - PaymentService
      integration_type: event
      description: "PaymentCompleted/ PaymentFailed events"
      stability: stable
    - seam_id: IS-002
      modules_involved:
        - OrderService
        - InventoryService
      integration_type: api
      description: "Synchronous inventory reservation"
      stability: stable
      
  future_extension_boundary:
    - extension_point: "Multiple payment providers"
      module: PaymentService
      what_can_extend: "Add Stripe, PayPal, Alipay providers"
      what_must_remain_stable: "Payment interface"
      extension_mechanism: inheritance
    - extension_point: "Notification channels"
      module: NotificationService
      what_can_extend: "Email, SMS, push notifications"
      what_must_remain_stable: "Notification interface"
      extension_mechanism: composition
      
  explicit_non_responsibilities:
    - module: OrderService
      does_not_do:
        - "Direct payment API calls"
        - "Email/SMS sending"
        - "Database queries"
      rationale: "Orchestrator pattern - coordinates but delegates implementation"
      
  dependency_graph: |
    OrderController -> OrderService
    OrderService -> PaymentService
    OrderService -> InventoryService
    OrderService -> NotificationService
    OrderService -> OrderRepository
```

### Example 3: Plugin Architecture

```yaml
module_boundaries:
  module_list:
    - name: PluginHost
      description: "Load and manage plugin lifecycle"
    - name: PluginManager
      description: "Plugin registration and discovery"
    - name: CoreAPI
      description: "Core functionality exposed to plugins"
    - name: PluginSDK
      description: "SDK for plugin developers"
      
  module_responsibilities:
    - module: PluginHost
      primary_responsibility: "Plugin lifecycle management"
      scope:
        - "Plugin loading"
        - "Plugin initialization"
        - "Plugin unloading"
      non_responsibilities:
        - "Plugin business logic"
        - "Core functionality implementation"
        
  inputs_outputs:
    - module: PluginHost
      inputs:
        - name: PluginDescriptor
          type: Configuration
          source: Plugin registry
          description: "Plugin metadata"
      outputs:
        - name: PluginInstance
          type: Object
          destination: PluginManager
          description: "Initialized plugin instance"
          
  dependency_directions:
    - from: PluginHost
      to: CoreAPI
      type: required
      reason: "Access core functionality"
      direction: downstream
    - from: PluginManager
      to: PluginHost
      type: required
      reason: "Manage loaded plugins"
      direction: upstream
      
  integration_seams:
    - seam_id: IS-001
      modules_involved:
        - PluginHost
        - CoreAPI
      integration_type: protocol
      description: "Plugin API contract"
      stability: stable
    - seam_id: IS-002
      modules_involved:
        - PluginSDK
        - CoreAPI
      integration_type: api
      description: "SDK wraps core API for plugin developers"
      stability: evolving
      
  future_extension_boundary:
    - extension_point: "Plugin types"
      module: PluginSDK
      what_can_extend: "New plugin categories and hooks"
      what_must_remain_stable: "Plugin interface contract"
      extension_mechanism: inheritance
    - extension_point: "Loading mechanisms"
      module: PluginHost
      what_can_extend: "Remote loading, hot reload"
      what_must_remain_stable: "Plugin lifecycle interface"
      extension_mechanism: composition
      
  explicit_non_responsibilities:
    - module: PluginHost
      does_not_do:
        - "Plugin business logic"
        - "Plugin validation rules"
        - "Core feature implementation"
      rationale: "Host only manages lifecycle, not plugin functionality"
      
  dependency_graph: |
    PluginManager -> PluginHost
    PluginHost -> CoreAPI
    PluginSDK -> CoreAPI
```

## Anti-Examples

### Anti-Example 1: Folder-Driven Architecture

**Mistake**: Defining modules based solely on directory structure without considering responsibilities.

```yaml
# WRONG: Just listing folders
module_boundaries:
  module_list:
    - name: src/api
      description: "API folder"
    - name: src/core
      description: "Core folder"
    - name: src/utils
      description: "Utils folder"
    - name: src/models
      description: "Models folder"
      
  # Missing: module_responsibilities
  # Missing: inputs_outputs  
  # Missing: dependency_directions
  # Missing: integration_seams
  # Missing: future_extension_boundary
  # Missing: explicit_non_responsibilities
```

**Why it's wrong:**
- Directory structure doesn't define responsibilities
- No clarity on what each module should/shouldn't do
- Dependencies are implicit, not explicit
- No integration points defined
- No extension boundaries specified

**How to fix:**
- Define modules by responsibility, not location
- Explicitly state what each module does and doesn't do
- Map all dependencies and integration seams
- Define extension points for future evolution

---

### Anti-Example 2: No Future Boundary

**Mistake**: Design that assumes current scope is final, blocking future evolution.

```yaml
# WRONG: No extension points defined
module_boundaries:
  module_list:
    - name: UserService
      description: "Handle all user operations"
      
  module_responsibilities:
    - module: UserService
      primary_responsibility: "Everything about users"
      scope:
        - "CRUD operations"
        - "Authentication"
        - "Authorization"
        - "Profile management"
        - "Session management"
        - "Password reset"
        - "Email verification"
        # ... grows without bound
      non_responsibilities: []  # Everything is responsibility!
      
  # Missing: future_extension_boundary entirely
  # Missing: explicit_non_responsibilities
```

**Why it's wrong:**
- No clear boundary for what can be extended
- Module becomes a god class over time
- No stable interfaces for extension
- Future changes require modifying core logic

**How to fix:**
- Define explicit extension points
- Separate core stable logic from extensible logic
- Use composition/inheritance for extension
- Document what must remain stable

---

### Anti-Example 3: Overlapping Responsibilities

**Mistake**: Modules with unclear or overlapping responsibility boundaries.

```yaml
# WRONG: Unclear who does what
module_boundaries:
  module_list:
    - name: UserService
      description: "User operations"
    - name: UserManager
      description: "User management"
    - name: UserHandler
      description: "User handling"
      
  module_responsibilities:
    - module: UserService
      primary_responsibility: "Handle user operations"
      scope:
        - "User validation"
        - "User queries"
        - "User updates"
        
    - module: UserManager
      primary_responsibility: "Manage users"
      scope:
        - "User validation"  # OVERLAP!
        - "User queries"     # OVERLAP!
        - "User creation"
        
    - module: UserHandler
      primary_responsibility: "Process users"
      scope:
        - "User validation"  # OVERLAP!
        - "User updates"     # OVERLAP!
        - "User deletion"
        
  # Missing: explicit_non_responsibilities
  # Dependencies would be circular or unclear
```

**Why it's wrong:**
- Multiple modules doing the same thing
- No clear ownership of functionality
- Leads to code duplication or confusion
- Makes testing and maintenance difficult

**How to fix:**
- Define exclusive responsibilities
- Use explicit_non_responsibilities to clarify boundaries
- Ensure each responsibility has exactly one owner
- Document delegation patterns clearly

---

### Anti-Example 4: Missing Integration Seams

**Mistake**: Not defining how modules actually connect and communicate.

```yaml
# WRONG: Dependencies listed but no integration details
module_boundaries:
  dependency_directions:
    - from: OrderService
      to: PaymentService
      type: required
      reason: "Process payments"
    - from: OrderService
      to: NotificationService
      type: required
      reason: "Send notifications"
      
  # Missing: integration_seams section entirely
  # How do they communicate? HTTP? Events? Direct calls?
  # What are the message formats?
  # What happens on failure?
```

**Why it's wrong:**
- Implementation details left ambiguous
- Teams may implement incompatible interfaces
- Error handling not considered
- Synchronous vs. asynchronous not specified

**How to fix:**
- Define integration type (api/event/data/protocol)
- Specify stability (stable/evolving)
- Document message/request formats
- Consider failure modes in seam definition

---

### Anti-Example 5: Circular Dependencies

**Mistake**: Allowing circular dependencies that create tight coupling.

```yaml
# WRONG: Circular dependency chain
module_boundaries:
  dependency_graph: |
    OrderService -> PaymentService
    PaymentService -> NotificationService
    NotificationService -> OrderService  # CIRCULAR!
    
  # No strategy to break the cycle
```

**Why it's wrong:**
- Creates tight coupling between modules
- Makes independent testing impossible
- Leads to spaghetti architecture
- Changes cascade unpredictably

**How to fix:**
- Introduce event bus for decoupled communication
- Extract shared interface to dependency inversion
- Redivide responsibilities to eliminate cycle
- Use dependency injection for flexibility

## Checklists

### Pre-condition Checklist
- [ ] Requirements are clear
- [ ] Existing module structure has been reviewed
- [ ] Constraints are understood
- [ ] Stakeholders identified

### Process Checklist
- [ ] Each module has a single responsibility
- [ ] No circular dependencies exist
- [ ] Interfaces are clearly defined
- [ ] Dependencies are reasonable
- [ ] Integration seams are documented
- [ ] Future extension boundaries are defined
- [ ] Explicit non-responsibilities are stated

### Post-condition Checklist
- [ ] Modules can be independently tested
- [ ] Modules can be replaced
- [ ] Modification impact scope is controllable
- [ ] Boundaries are documented
- [ ] Downstream roles can consume the output

## Common Failure Modes

| Failure Mode | Symptoms | Recommended Action |
|--------------|----------|-------------------|
| God Module | One module does too much | Split into multiple smaller modules |
| Circular Dependencies | A->b->c->a | Extract interface or event mechanism |
| Over-division | Module granularity too fine | Merge related modules |
| Unstable Interfaces | Frequent interface changes | Abstract stable interface layer |
| Implicit Dependencies | Dependencies through global state | Make dependencies explicit |
| Folder-Driven | Modules mirror directory structure | Redefine by responsibility |
| No Extension Points | Design assumes final state | Add future_extension_boundary |
| Overlapping Responsibilities | Unclear module ownership | Define explicit_non_responsibilities |

## Notes

### Module Granularity Guidelines
- **Too small**: High maintenance cost, should merge
- **Appropriate**: 200-500 lines of code, single responsibility
- **Too large**: Should split to maintain high cohesion

### Interface Stability
- Frequently changing implementation details should be encapsulated inside the module
- Public interfaces should be as stable as possible
- Introduce adapter layer to isolate changes when necessary

### Relationship with requirement-to-design
- requirement-to-design outputs overall architecture
- module-boundary-design refines module division
- Can be used independently or as part of design flow

### Downstream Consumption
- **Developer**: Uses module boundaries to organize implementation
- **Tester**: Uses boundaries to design integration tests
- **Reviewer**: Uses boundaries to verify architecture consistency
- **Docs**: Uses responsibilities to structure documentation
- **Security**: Uses seams to identify trust boundaries

## Legacy Compatibility Note

This skill was originally part of the 3-skill transition skeleton (architect-auditor). It has been migrated to the 6-role formal execution model under `architect`. The core methodology remains the same, but the output format now aligns with the AC-002 artifact contract from `specs/003-architect-core/spec.md`.
