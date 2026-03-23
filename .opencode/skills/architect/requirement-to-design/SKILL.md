# Skill: requirement-to-design

## Purpose

Transform feature specifications into structured technical design notes that define module boundaries, interface contracts, implementation roadmaps, and enable downstream roles (developer, tester, reviewer, docs, security) to execute their work.

Core problems solved:
- Bridge the gap between requirements and design to prevent developer drift during implementation
- Define technical solutions to reduce uncertainty during implementation
- Provide auditable design decision records

## When to Use

Required when:
- New features require technical solution design
- Medium-to-large features (>3 days effort) require module decomposition
- APIs or data contracts need design
- Multiple technical solutions exist and need evaluation

Recommended when:
- Module refactoring requires structure planning
- Technical debt cleanup needs design approach
- Performance optimization requires technical planning

## When Not to Use

Not applicable when:
- Pure configuration changes (no technical design needed)
- Bugfixes without architecture changes (handle directly as developer)
- Documentation tasks (handle directly as docs)
- Requirements themselves are unclear (clarify requirements first)

## Required Inputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `spec` | object | Yes | Feature specification document (read via artifact-reading) |
| `codebase_context` | object | Yes | Codebase context summary |
| `constraints` | string[] | Yes | Technical constraints |

## Optional Inputs

| Field | Type | Description |
|-------|------|-------------|
| `existing_design` | object | Existing design (for evolution scenarios) |
| `tech_preferences` | string[] | Technology stack preferences |
| `performance_requirements` | object | Special performance requirements |

## Design Output Structure (AC-001 Compliant)

The design note must use these exact field names:

```yaml
design_note:
  background: string              # Context and motivation
  feature_goal: string            # What this feature aims to achieve
  input_sources: string[]         # Where requirements come from
  requirement_to_design_mapping:  # Explicit mapping of requirements to design decisions
    - requirement: string
      design_decision: string
      rationale: string
  design_summary: string          # High-level design overview
  constraints: string[]           # Limitations and boundaries
  non_goals: string[]             # Explicit out-of-scope items
  assumptions: string[]           # Design assumptions made
  open_questions:                 # Unresolved design questions
    - question: string
      why_it_matters: string
      temporary_assumption: string
      impact_surface: string
      recommended_next_step: string
      blocker: boolean
```

## Steps

### Step 1: Understand Requirements
1. Carefully read spec's goal, scope, acceptance_criteria
2. Extract functional and non-functional requirements
3. Identify constraints and boundaries
4. Document assumptions and uncertain points

### Step 2: Analyze Current State
1. Understand existing codebase structure
2. Identify relevant modules and components
3. Assess technical debt and limitations
4. Determine reuse vs. new build decisions

### Step 3: Determine Architecture Style
Choose architecture pattern based on requirements:
- **Layered architecture**: Suitable for projects with clear business logic
- **Microservices**: Suitable for independently deployable services
- **Event-driven**: Suitable for async processing scenarios
- **Plugin architecture**: Suitable for extensible frameworks

### Step 4: Define Module Boundaries
1. Divide modules based on Single Responsibility Principle
2. Clarify each module's inputs and outputs
3. Minimize inter-module dependencies
4. Consider test isolation

### Step 5: Design Interface Contracts
1. Define API endpoints (if HTTP)
2. Define function signatures (if library)
3. Define event formats (if event-driven)
4. Define error codes and exception handling

### Step 6: Design Data Model
1. Identify core entities
2. Define entity relationships
3. Consider data consistency
4. Evaluate storage solutions

### Step 7: Create Implementation Plan
1. Determine module dependency graph
2. Identify modules that can be developed in parallel
3. Determine critical path
4. Estimate effort per module

### Step 8: Identify Risks
1. Technical risks (new technology, performance bottlenecks)
2. Dependency risks (external services, third-party libraries)
3. Business risks (requirement changes, scope creep)
4. Define mitigation measures

### Step 9: Review Design
1. Check completeness against spec
2. Verify constraint compliance
3. Assess maintainability
4. Confirm testability

### Step 10: Generate Design Note
Output complete design document following the template above.

## Checklists

### Pre-Conditions
- [ ] spec fully read
- [ ] codebase_context loaded
- [ ] constraints clarified

### Process Checks
- [ ] Module boundaries are clear
- [ ] Interface contracts are complete
- [ ] Implementation order is reasonable
- [ ] Risks are identified
- [ ] requirement_to_design_mapping is explicit
- [ ] non_goals are documented
- [ ] assumptions are documented

### Post-Conditions
- [ ] design note follows AC-001 template
- [ ] Can be directly executed by developer
- [ ] Can be reviewed by reviewer
- [ ] Can be used by tester for test strategy

## Common Failure Modes

| Failure Mode | Symptoms | Handling |
|--------------|----------|----------|
| Over-engineering | Design is too complex | Return to KISS principle, simplify |
| Under-design | Missing critical details | Add interface definitions and error handling |
| Conflict with current state | Design conflicts with existing code | Assess refactoring cost, adjust if needed |
| Constraint violation | Design violates constraints | Redesign or request constraint relaxation |
| Requirement omission | Not covering all requirements | Check against spec item by item |
| Underestimated risks | Missing critical risks | Engage reviewer for review |

## Anti-Examples

### Anti-Example 1: Spec Parroting (AP-001)

**What it looks like:**
```yaml
# WRONG - Just copying spec without transformation
design_note:
  background: "Implement user login feature"  # Copied from spec goal
  feature_goal: "Support username/password login"  # Copied from spec
  design_summary: "Login feature as described in spec"  # No design thinking
  
  # Missing: requirement_to_design_mapping
  # Missing: module boundaries
  # Missing: interface contracts
  # Missing: design decisions
```

**Why it's wrong:** This is not design—it's spec rephrasing. No architectural thinking, no module structure, no actionable guidance for developer.

**Correct approach:**
```yaml
# RIGHT - Transform requirements into design structure
design_note:
  background: "Current system has no authentication; users access all features anonymously"
  feature_goal: "Enable secure user authentication to protect sensitive operations"
  
  requirement_to_design_mapping:
    - requirement: "Support username/password login"
      design_decision: "Implement AuthController + AuthService layered architecture"
      rationale: "Separation of concerns: HTTP handling vs. business logic"
    
    - requirement: "Return JWT Token"
      design_decision: "Introduce JwtTokenService as dedicated module"
      rationale: "Token management is orthogonal to auth logic, enables future token refresh"
```

---

### Anti-Example 2: Silent Assumptions (AP-004)

**What it looks like:**
```yaml
# WRONG - Assumptions hidden or missing
design_note:
  design_summary: "Implement async event-driven authentication"
  
  # No assumptions field
  # No open_questions field
  
  module_boundaries:
    - module: AuthService
      responsibility: "Handle authentication events asynchronously"
      # Why async? Was this decided or assumed?
```

**Why it's wrong:** The design assumes async processing without documenting why or what happens if the requirement changes. Downstream roles cannot evaluate this decision.

**Correct approach:**
```yaml
# RIGHT - Assumptions explicit
design_note:
  assumptions:
    - "Authentication will be async to avoid blocking main request thread"
    - "Event queue (Redis) is available in infrastructure"
  
  open_questions:
    - question: "Should failed auth attempts be retried or dropped?"
      why_it_matters: "Affects error handling design and user experience"
      temporary_assumption: "Drop failed attempts, log for audit"
      impact_surface: "AuthService error handling, monitoring dashboard"
      recommended_next_step: "Confirm with product team by milestone review"
      blocker: false
```

---

### Anti-Example 3: Missing Non-Goals (AP-002 variant)

**What it looks like:**
```yaml
# WRONG - Non-goals omitted, leading to scope creep
design_note:
  feature_goal: "Implement user login"
  
  # No non_goals field
  
  module_boundaries:
    - module: AuthController
      responsibility: "Handle login, registration, password reset, profile management"
      # Scope creep: registration and password reset were not in spec
```

**Why it's wrong:** Without explicit non-goals, the design expands beyond spec scope. Developer implements unrequested features; tester writes unnecessary tests.

**Correct approach:**
```yaml
# RIGHT - Non-goals explicit
design_note:
  feature_goal: "Implement user login with JWT token authentication"
  
  non_goals:
    - "User registration (separate feature)"
    - "Password recovery/reset (separate feature)"
    - "Single Sign-On (SSO) integration (future consideration)"
    - "Social login (Google, GitHub, etc.) (not in scope)"
  
  module_boundaries:
    - module: AuthController
      responsibility: "Handle login requests only"
      # Clear scope boundary
```

---

### Anti-Example 4: Missing Requirement-to-Design Mapping

**What it looks like:**
```yaml
# WRONG - Design decisions without tracing to requirements
design_note:
  design_summary: "Use PostgreSQL for data storage"
  
  # No requirement_to_design_mapping
  # Where did PostgreSQL come from?
  
  module_boundaries:
    - module: UserRepository
      responsibility: "Store user data in PostgreSQL"
```

**Why it's wrong:** Design decisions appear from nowhere. Reviewer cannot evaluate if the choice aligns with requirements. Future maintainers cannot understand the rationale.

**Correct approach:**
```yaml
# RIGHT - Explicit mapping
design_note:
  requirement_to_design_mapping:
    - requirement: "Support ACID transactions for user data consistency"
      design_decision: "Use PostgreSQL as primary database"
      rationale: "PostgreSQL provides ACID guarantees; spec requires transactional integrity for concurrent updates"
    
    - requirement: "Query user data by multiple criteria"
      design_decision: "Use relational schema with indexed columns"
      rationale: "Enables flexible querying without denormalization"
```

---

### Anti-Example 5: No Open Questions (Blocking Design)

**What it looks like:**
```yaml
# WRONG - Critical uncertainties hidden
design_note:
  design_summary: "Implement role-based access control"
  
  # No open_questions field
  # But the database schema for roles doesn't exist yet
  
  module_boundaries:
    - module: RoleService
      responsibility: "Manage user roles from roles table"
      # What roles table? It doesn't exist!
```

**Why it's wrong:** The design assumes a database schema that hasn't been created. This blocks implementation and causes rework.

**Correct approach:**
```yaml
# RIGHT - Blockers exposed
design_note:
  open_questions:
    - question: "Does existing database schema support roles table?"
      why_it_matters: "RoleService depends on this table structure"
      temporary_assumption: "Assume roles table will be created by data team"
      impact_surface: "RoleService, UserRepository, migration scripts"
      recommended_next_step: "Coordinate with data team on schema migration timeline"
      blocker: true
  
  status: BLOCKED  # Design cannot proceed until this is resolved
```

## Output Requirements

### Required Output

```yaml
design_note:
  background: string
  feature_goal: string
  input_sources: string[]
  requirement_to_design_mapping:
    - requirement: string
      design_decision: string
      rationale: string
  design_summary: string
  constraints: string[]
  non_goals: string[]
  assumptions: string[]
  open_questions:
    - question: string
      why_it_matters: string
      temporary_assumption: string
      impact_surface: string
      recommended_next_step: string
      blocker: boolean
  status: COMPLETE | PARTIAL | BLOCKED
```

### Optional Output

```yaml
tradeoffs_considered:
  - option: string
    pros: string[]
    cons: string[]
    selected: boolean

alternatives_rejected:
  - alternative: string
    reason: string

performance_considerations:
  - aspect: string
    strategy: string
```

## Examples

### Example 1: User Login Feature Design

#### Input
```yaml
spec:
  goal: "Implement user login feature"
  scope:
    - "Login API endpoint"
    - "Password verification"
    - "Token generation"
  acceptance_criteria:
    - "Support username/password login"
    - "Return JWT Token"
    - "Complete error handling"
    
constraints:
  - "Use bcrypt for password verification"
  - "Token validity: 24 hours"
  - "Reuse existing UserRepository"
```

#### Output Design Note

```yaml
design_note:
  background: "Current system lacks authentication; all users access features anonymously. This feature introduces secure login to protect sensitive operations."
  
  feature_goal: "Enable secure user authentication with JWT token-based session management"
  
  input_sources:
    - "specs/feature-login/spec.md"
    - "package-spec.md (constraint: bcrypt)"
    - "role-definition.md (architect -> developer handoff)"
  
  requirement_to_design_mapping:
    - requirement: "Support username/password login"
      design_decision: "Implement AuthController + AuthService layered architecture"
      rationale: "Separation of concerns: HTTP handling vs. business logic enables independent testing"
    
    - requirement: "Return JWT Token"
      design_decision: "Introduce JwtTokenService module"
      rationale: "Token lifecycle management is orthogonal to auth logic; enables future token refresh feature"
    
    - requirement: "Use bcrypt for password verification"
      design_decision: "Integrate bcrypt library in AuthService"
      rationale: "Compliance with package governance constraint; bcrypt is industry standard for password hashing"
    
    - requirement: "Reuse existing UserRepository"
      design_decision: "AuthService depends on existing UserRepository interface"
      rationale: "Avoids data layer duplication; maintains single source of truth for user data"
  
  design_summary: "Layered architecture (Controller-Service-Repository) with dedicated JwtTokenService for token lifecycle management"
  
  constraints:
    - "Use bcrypt for password verification"
    - "Token validity: 24 hours"
    - "Reuse existing UserRepository"
  
  non_goals:
    - "User registration (separate feature)"
    - "Password recovery/reset (separate feature)"
    - "Single Sign-On (SSO) integration (future consideration)"
    - "Social login providers (Google, GitHub, etc.) (not in scope)"
  
  assumptions:
    - "UserRepository interface provides findByUsername method"
    - "System clock is synchronized for token expiration"
    - "HTTPS is enforced at infrastructure level (not in application code)"
  
  open_questions:
    - question: "Should we implement rate limiting for login attempts?"
      why_it_matters: "Prevents brute force attacks; affects AuthService interface"
      temporary_assumption: "Rate limiting will be handled by API gateway"
      impact_surface: "AuthService, monitoring, security posture"
      recommended_next_step: "Confirm with security team during review"
      blocker: false
  
  status: COMPLETE
```

### Example 2: Design Blocked

```yaml
design_note:
  background: "Feature requires role-based access control"
  
  feature_goal: "Implement RBAC for admin operations"
  
  open_questions:
    - question: "Does existing database schema support roles table?"
      why_it_matters: "RoleService cannot be implemented without this table"
      temporary_assumption: "Assume roles table will be created by data team"
      impact_surface: "RoleService, migration scripts, all admin APIs"
      recommended_next_step: "Data team to confirm schema migration timeline by next milestone"
      blocker: true
  
  status: BLOCKED

escalation_reason: "Design depends on database schema decision; requires data team commitment before implementation can proceed"
```

## Notes

### Relationship to module-boundary-design
- requirement-to-design produces overall design
- module-boundary-design can be used separately to refine module details
- Simple scenarios can combine both; complex scenarios should separate

### Relationship to tradeoff-analysis
- If multiple technical solutions exist, call tradeoff-analysis first
- requirement-to-design outputs the final selected solution
- Can record tradeoffs_considered in design note

### Relationship to interface-contract-design
- requirement-to-design outputs interface contract overview
- interface-contract-design can further refine specific interfaces
- API design should be refined using interface-contract-design

### Design Quality Indicators

A good design note satisfies:
1. **developer** can implement directly from the design
2. **reviewer** can judge design reasonableness
3. **tester** can design test strategy
4. All critical decisions have rationale
5. Risks are clear with mitigation measures
6. Requirements trace to design decisions explicitly (via requirement_to_design_mapping)
7. Non-goals prevent scope creep
8. Assumptions and open questions are explicit

## Quality Gates

### Gate 1: Spec Compliance
- [ ] All spec requirements are covered in requirement_to_design_mapping
- [ ] All constraints are respected
- [ ] Non-goals align with spec scope

### Gate 2: Downstream Consumability
- [ ] developer can identify modules to implement
- [ ] tester can identify test scenarios from design
- [ ] reviewer can evaluate design rationale

### Gate 3: Completeness
- [ ] All AC-001 fields are present
- [ ] No hidden assumptions
- [ ] Open questions are explicit with blocker flags

### Gate 4: Anti-Pattern Check
- [ ] Not spec parroting (design transformation is present)
- [ ] Not folder-driven architecture (responsibilities are explicit)
- [ ] Not silent assumptions (all assumptions documented)
- [ ] Not missing non-goals
