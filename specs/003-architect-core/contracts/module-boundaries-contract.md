# AC-002: Module Boundaries Contract

## Document Status
- **Contract ID**: `AC-002`
- **Contract Name**: Module Boundaries Contract
- **Version**: 1.0.0
- **Status**: Active
- **Created**: 2026-03-23
- **Owner**: architect role
- **Consumers**: developer, tester, reviewer, security

---

## 1. Purpose Statement

This contract defines the structure, required fields, validation rules, and quality standards for the `module-boundaries` artifact produced by the **architect** role.

The `module-boundaries` artifact serves as the authoritative source for:
- Module divisions and responsibility assignments
- Input/output boundaries for each module
- Dependency directions between modules
- Integration seams for downstream handoffs
- Extension boundaries for future evolution
- Explicit non-responsibilities to prevent scope creep

This artifact is consumed by:
- **developer**: For organizing implementation structure
- **tester**: For organizing verification by module boundaries
- **reviewer**: For judging design reasonableness and boundary clarity
- **security**: For identifying trust boundaries and high-risk seams

---

## 2. Required Fields

The `module-boundaries` artifact MUST contain all 7 required fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `module_list` | `Module[]` | Yes | List of modules with names and descriptions |
| `module_responsibilities` | `ResponsibilityMap` | Yes | Each module's responsibilities |
| `inputs_outputs` | `IOMap` | Yes | Input/output for each module |
| `dependency_directions` | `DependencyGraph` | Yes | How modules depend on each other |
| `integration_seams` | `IntegrationSeam[]` | Yes | Points where modules connect |
| `future_extension_boundary` | `ExtensionBoundary` | Yes | Where extension is allowed |
| `explicit_non_responsibilities` | `NonResponsibilityMap` | Yes | What each module does NOT do |

---

## 3. Field Specifications

### 3.1 module_list

**Type**: `Module[]` (array of module objects)

**Structure**:
```typescript
interface Module {
  id: string;              // Unique identifier (e.g., "MOD-001")
  name: string;            // Human-readable name
  description: string;     // One-sentence purpose
  stability: "stable" | "evolving" | "experimental";
}
```

**Validation Rules**:
- [ ] Each module has a unique `id`
- [ ] Each module has a non-empty `name`
- [ ] Each module has a `description` that states purpose, not implementation
- [ ] `stability` is one of the three allowed values
- [ ] At least 2 modules are defined (single-module systems should be re-evaluated)
- [ ] No more than 15 modules (if more, consider hierarchical grouping)

**Anti-Pattern Prevention**:
- Prevents AP-002 (Folder-Driven Architecture): Modules must have explicit purposes, not just directory names
- Prevents over-fragmentation: 15-module limit forces hierarchical thinking

---

### 3.2 module_responsibilities

**Type**: `ResponsibilityMap` (map of module IDs to responsibility arrays)

**Structure**:
```typescript
type ResponsibilityMap = {
  [moduleId: string]: Responsibility[];
};

interface Responsibility {
  id: string;              // Unique within module (e.g., "R-001")
  description: string;     // What this module is responsible for
  priority: "core" | "secondary" | "supporting";
  verification_hint?: string; // Hint for tester on how to verify
}
```

**Validation Rules**:
- [ ] Every module in `module_list` has at least one responsibility
- [ ] Each responsibility has a unique `id` within its module
- [ ] Each responsibility has a non-empty `description`
- [ ] `priority` is one of the three allowed values
- [ ] At least one "core" priority responsibility per module
- [ ] Responsibilities are actionable (can be verified by tester)

**Anti-Pattern Prevention**:
- Prevents overlapping responsibilities: Each responsibility should map to one module
- Prevents vague responsibilities: Descriptions must be specific and verifiable

---

### 3.3 inputs_outputs

**Type**: `IOMap` (map of module IDs to I/O specifications)

**Structure**:
```typescript
type IOMap = {
  [moduleId: string]: {
    inputs: IOBoundary[];
    outputs: IOBoundary[];
  };
};

interface IOBoundary {
  id: string;              // Unique identifier
  name: string;            // Human-readable name
  type: "data" | "event" | "command" | "query";
  direction: "inbound" | "outbound";
  source_or_sink: string;  // Where it comes from or goes to
  contract?: string;       // Reference to interface contract if applicable
}
```

**Validation Rules**:
- [ ] Every module has at least one input OR one output
- [ ] Each I/O boundary has a unique `id`
- [ ] `type` is one of the four allowed values
- [ ] `direction` matches the boundary classification (inputs=inbound, outputs=outbound)
- [ ] `source_or_sink` identifies the external system, module, or user
- [ ] Cross-module I/O references a valid module from `module_list`

**Anti-Pattern Prevention**:
- Prevents hidden I/O: All data/event flows must be explicit
- Prevents boundary ambiguity: Each I/O must have a clear source/sink

---

### 3.4 dependency_directions

**Type**: `DependencyGraph` (directed dependency relationships)

**Structure**:
```typescript
interface DependencyGraph {
  dependencies: Dependency[];
  dependency_rules: DependencyRule[];
}

interface Dependency {
  from_module: string;     // Module ID that depends
  to_module: string;       // Module ID being depended upon
  type: "direct" | "interface" | "event" | "configuration";
  strength: "strong" | "weak";
  rationale: string;       // Why this dependency exists
}

interface DependencyRule {
  rule: string;            // Human-readable rule
  enforced_by: string;     // How this rule is enforced (compile, runtime, convention)
}
```

**Validation Rules**:
- [ ] All `from_module` and `to_module` reference valid module IDs
- [ ] `type` is one of the four allowed values
- [ ] `strength` is one of the two allowed values
- [ ] Each dependency has a non-empty `rationale`
- [ ] No circular dependencies exist (must be a DAG)
- [ ] At least one dependency rule is defined

**Anti-Pattern Prevention**:
- Prevents circular dependencies: Must be a directed acyclic graph
- Prevents unexplained dependencies: Each must have a rationale
- Prevents implicit coupling: Dependency types must be explicit

---

### 3.5 integration_seams

**Type**: `IntegrationSeam[]` (array of integration points)

**Structure**:
```typescript
interface IntegrationSeam {
  id: string;              // Unique identifier (e.g., "SEAM-001")
  name: string;            // Human-readable name
  modules_involved: string[]; // Module IDs involved in this seam
  seam_type: "api" | "event" | "data" | "protocol" | "lifecycle";
  description: string;     // What happens at this seam
  risk_level: "low" | "medium" | "high";
  testing_hint?: string;   // Hint for tester on integration testing
}
```

**Validation Rules**:
- [ ] Each seam has a unique `id`
- [ ] `modules_involved` references valid module IDs (at least 2)
- [ ] `seam_type` is one of the five allowed values
- [ ] `description` explains the integration mechanism
- [ ] `risk_level` is assessed for each seam
- [ ] High-risk seams have a `testing_hint`

**Anti-Pattern Prevention**:
- Prevents hidden coupling: All integration points must be explicit
- Prevents untested seams: High-risk seams require testing guidance
- Provides stable review baseline for reviewer/reviewer

---

### 3.6 future_extension_boundary

**Type**: `ExtensionBoundary` (extension rules and guidelines)

**Structure**:
```typescript
interface ExtensionBoundary {
  extension_points: ExtensionPoint[];
  stability_contract: StabilityContract;
}

interface ExtensionPoint {
  id: string;              // Unique identifier
  module_id: string;       // Module that can be extended
  extension_type: "subclass" | "plugin" | "configuration" | "event_handler";
  description: string;     // What can be extended
  constraints?: string;    // Constraints on extension
}

interface StabilityContract {
  stable_modules: string[];    // Modules with stable interfaces
  evolving_modules: string[];  // Modules expected to change
  deprecation_policy: string;  // How deprecation is handled
}
```

**Validation Rules**:
- [ ] At least one extension point is defined (unless system is closed)
- [ ] All `module_id` references are valid
- [ ] `extension_type` is one of the four allowed values
- [ ] `stable_modules` and `evolving_modules` partition the module list
- [ ] `deprecation_policy` is non-empty

**Anti-Pattern Prevention**:
- Prevents AP-007 (No Future Boundary): Extension points must be explicit
- Prevents breaking changes: Stability contract defines change expectations
- Provides input for future feature planners

---

### 3.7 explicit_non_responsibilities

**Type**: `NonResponsibilityMap` (map of module IDs to non-responsibility arrays)

**Structure**:
```typescript
type NonResponsibilityMap = {
  [moduleId: string]: NonResponsibility[];
};

interface NonResponsibility {
  id: string;              // Unique within module
  description: string;     // What this module does NOT do
  rationale: string;       // Why this is out of scope
  may_belong_to?: string;  // Which module might handle this instead
}
```

**Validation Rules**:
- [ ] Every module has at least one non-responsibility
- [ ] Each non-responsibility has a non-empty `description`
- [ ] Each non-responsibility has a `rationale`
- [ ] If `may_belong_to` is specified, it references a valid module
- [ ] Non-responsibilities prevent overlap with other modules' responsibilities

**Anti-Pattern Prevention**:
- Prevents scope creep: Explicit non-responsibilities block feature creep
- Prevents responsibility ambiguity: Clear what each module does NOT do
- Supports BR-003 (Boundaries Must Be Clear)

---

## 4. Consumer Responsibilities

### 4.1 Developer (consumer)

**Consumes**:
- `module_list`: For understanding system structure
- `module_responsibilities`: For implementing module logic
- `inputs_outputs`: For implementing interfaces
- `dependency_directions`: For organizing imports/dependencies
- `integration_seams`: For implementing integration points

**Responsibilities**:
- [ ] Implement modules according to defined responsibilities
- [ ] Respect dependency directions (no circular imports)
- [ ] Implement I/O boundaries as specified
- [ ] Flag violations of module boundaries during implementation
- [ ] Use `integration_seams` testing hints for integration tests

**Escalation Triggers**:
- Ambiguous responsibility definitions
- Missing I/O boundaries for implementation
- Dependency cycles discovered during implementation

---

### 4.2 Tester (consumer)

**Consumes**:
- `module_responsibilities`: For organizing test structure
- `inputs_outputs`: For defining test boundaries
- `integration_seams`: For integration test planning
- `future_extension_boundary`: For regression test scope

**Responsibilities**:
- [ ] Organize test suites by module boundaries
- [ ] Create tests for each I/O boundary
- [ ] Prioritize high-risk integration seams for testing
- [ ] Verify non-responsibilities are not violated
- [ ] Use `verification_hint` fields for test design

**Escalation Triggers**:
- Responsibilities not verifiable
- Missing testing hints for high-risk seams
- I/O boundaries not testable

---

### 4.3 Reviewer (consumer)

**Consumes**:
- `module_responsibilities`: For judging boundary clarity
- `dependency_directions`: For reviewing coupling
- `integration_seams`: For risk assessment
- `explicit_non_responsibilities`: For scope validation

**Responsibilities**:
- [ ] Verify boundaries are clear and non-overlapping
- [ ] Check for circular dependencies
- [ ] Validate that integration seams are explicit
- [ ] Confirm non-responsibilities prevent scope creep
- [ ] Use `downstream-consumability-checklist.md` for validation

**Escalation Triggers**:
- Overlapping responsibilities detected
- Circular dependencies present
- AP-002 (Folder-Driven Architecture) detected
- Missing required fields

---

### 4.4 Security (consumer)

**Consumes**:
- `inputs_outputs`: For trust boundary identification
- `integration_seams`: For high-risk seam review
- `dependency_directions`: For attack surface analysis

**Responsibilities**:
- [ ] Identify trust boundaries from I/O specifications
- [ ] Review high-risk integration seams
- [ ] Assess authentication/authorization at seams
- [ ] Flag external-facing I/O for security review
- [ ] Use `auth-and-permission-review` skill for deep analysis

**Escalation Triggers**:
- High-risk seams without security controls
- External I/O without validation requirements
- Missing trust boundary definitions

---

## 5. Producer Responsibilities

### 5.1 Architect (producer)

**Produces**: `module-boundaries` artifact

**Responsibilities**:
- [ ] Include all 7 required fields
- [ ] Validate against all field validation rules
- [ ] Prevent anti-patterns AP-002 and AP-007
- [ ] Ensure downstream consumability (BR-001)
- [ ] Maintain clear boundaries (BR-003)
- [ ] Explicitly document uncertainties as assumptions/open questions
- [ ] Trace module decisions to design-note requirements

**Quality Gates**:
- [ ] Pass `boundary-check-checklist.md`
- [ ] Pass `downstream-consumability-checklist.md`
- [ ] Pass `failure-mode-checklist.md` for boundary failures
- [ ] Cross-reference with `design-note` for requirement traceability

**Delivery Rules**:
- Store in `specs/<feature>/artifacts/module-boundaries.md`
- Reference in `completion-report.md`
- Notify downstream roles upon delivery

---

## 6. Example Minimal Valid Artifact

```markdown
# Module Boundaries: Example Feature

## module_list
| ID | Name | Description | Stability |
|----|------|-------------|-----------|
| MOD-001 | API Gateway | Handles external HTTP requests | stable |
| MOD-002 | Command Processor | Processes business commands | evolving |
| MOD-003 | Event Dispatcher | Publishes domain events | stable |

## module_responsibilities
### MOD-001: API Gateway
| ID | Description | Priority | Verification Hint |
|----|-------------|----------|-------------------|
| R-001 | Validate incoming request format | core | Test with invalid payloads |
| R-002 | Route requests to command processor | core | Trace request flow |
| R-003 | Format error responses | secondary | Test error scenarios |

### MOD-002: Command Processor
| ID | Description | Priority | Verification Hint |
|----|-------------|----------|-------------------|
| R-001 | Execute business logic | core | Test command outcomes |
| R-002 | Publish events on state change | core | Verify event publication |

### MOD-003: Event Dispatcher
| ID | Description | Priority | Verification Hint |
|----|-------------|----------|-------------------|
| R-001 | Deliver events to subscribers | core | Test delivery guarantees |

## inputs_outputs
### MOD-001: API Gateway
- **Inputs**:
  - IO-001: HTTP Request (data, inbound, from: external client)
- **Outputs**:
  - IO-002: HTTP Response (data, outbound, to: external client)
  - IO-003: Command (command, outbound, to: MOD-002)

### MOD-002: Command Processor
- **Inputs**:
  - IO-003: Command (command, inbound, from: MOD-001)
- **Outputs**:
  - IO-004: Domain Event (event, outbound, to: MOD-003)

### MOD-003: Event Dispatcher
- **Inputs**:
  - IO-004: Domain Event (event, inbound, from: MOD-002)
- **Outputs**:
  - IO-005: Subscriber Notification (event, outbound, to: external subscribers)

## dependency_directions
### Dependencies
| From | To | Type | Strength | Rationale |
|------|-----|------|----------|-----------|
| MOD-001 | MOD-002 | direct | strong | Gateway must invoke processor |
| MOD-002 | MOD-003 | event | weak | Processor publishes, dispatcher subscribes |

### Dependency Rules
| Rule | Enforced By |
|------|-------------|
| MOD-003 cannot depend on MOD-001 | Compile-time import restrictions |
| External modules cannot depend on MOD-002 | Package visibility |

## integration_seams
| ID | Name | Modules | Type | Description | Risk | Testing Hint |
|----|------|---------|------|-------------|------|--------------|
| SEAM-001 | Request-Command | MOD-001, MOD-002 | api | HTTP request to command conversion | medium | Test malformed requests |
| SEAM-002 | Event Publication | MOD-002, MOD-003 | event | Domain event publication | high | Test event loss scenarios |

## future_extension_boundary
### Extension Points
| ID | Module | Type | Description | Constraints |
|----|--------|------|-------------|-------------|
| EP-001 | MOD-002 | plugin | Custom command handlers | Must implement ICommandHandler |

### Stability Contract
- **Stable Modules**: MOD-001, MOD-003
- **Evolving Modules**: MOD-002
- **Deprecation Policy**: 2 minor versions notice, backward-compatible migration path required

## explicit_non_responsibilities
### MOD-001: API Gateway
| ID | Not Responsible For | Rationale | May Belong To |
|----|---------------------|-----------|---------------|
| NR-001 | Business logic validation | Separation of concerns | MOD-002 |
| NR-002 | Authentication | Cross-cutting concern | security layer |

### MOD-002: Command Processor
| ID | Not Responsible For | Rationale | May Belong To |
|----|---------------------|-----------|---------------|
| NR-001 | HTTP protocol handling | Protocol independence | MOD-001 |
| NR-002 | Event delivery | Single responsibility | MOD-003 |

### MOD-003: Event Dispatcher
| ID | Not Responsible For | Rationale | May Belong To |
|----|---------------------|-----------|---------------|
| NR-001 | Event content validation | Payload transparency | MOD-002 |
| NR-002 | Subscriber retry logic | Delivery concern | external infrastructure |
```

---

## 7. Quality Checklist

### 7.1 Field Completeness
- [ ] All 7 required fields present
- [ ] `module_list` has 2-15 modules
- [ ] Every module has at least one responsibility
- [ ] Every module has at least one non-responsibility
- [ ] Every module has I/O boundaries defined
- [ ] At least one integration seam defined (if multi-module)
- [ ] At least one extension point defined (if extensible system)

### 7.2 Boundary Clarity (BR-003)
- [ ] No overlapping responsibilities between modules
- [ ] Non-responsibilities prevent scope creep
- [ ] I/O boundaries are explicit and testable
- [ ] Dependency directions form a DAG (no cycles)

### 7.3 Anti-Pattern Prevention
- [ ] Not AP-002: Modules defined by responsibility, not folder structure
- [ ] Not AP-007: Future extension boundaries are explicit
- [ ] Not AP-006: Artifact is actionable for downstream roles

### 7.4 Downstream Consumability (BR-001)
- [ ] Developer can implement from this artifact
- [ ] Tester can design tests from this artifact
- [ ] Reviewer can review boundaries from this artifact
- [ ] Security can identify trust boundaries from this artifact

### 7.5 Traceability
- [ ] Module decisions trace to `design-note` requirements
- [ ] Dependencies have rationales
- [ ] Integration seams reference risk assessments

### 7.6 Validation Executed
- [ ] `boundary-check-checklist.md` executed
- [ ] `downstream-consumability-checklist.md` executed
- [ ] `failure-mode-checklist.md` executed
- [ ] All validations passed or documented exceptions

---

## 8. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-03-23 | architect-core | Initial contract definition |

---

## 9. References

- `specs/003-architect-core/spec.md` - AC-002 artifact contract definition
- `specs/003-architect-core/plan.md` - P4-2 module-boundaries Contract task
- `package-spec.md` - Package governance
- `role-definition.md` - 6-role definition
- `quality-gate.md` - Quality gate rules
- `.opencode/skills/architect/module-boundary-design/SKILL.md` - Skill definition
- `specs/003-architect-core/validation/boundary-check-checklist.md` - Boundary validation
- `specs/003-architect-core/validation/downstream-consumability-checklist.md` - Consumability validation
