# Architect Core Anti-Patterns Guidance

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `003-architect-core` |
| **Document Type** | Anti-Pattern Guidance |
| **Version** | 1.0.0 |
| **Created** | 2026-03-23 |
| **Based On** | `spec.md` Section 11 Anti-Patterns |
| **Audience** | architect, reviewer, developer |

---

## 1. Purpose and Scope

### 1.1 Purpose

This document provides comprehensive guidance for identifying, preventing, and remediating the 7 anti-patterns defined in the `003-architect-core` specification. Each anti-pattern represents a failure mode in architect role execution that compromises design quality and downstream consumability.

### 1.2 Scope

This guidance applies to:
- All `architect` role outputs (`design-note`, `module-boundaries`, `risks-and-tradeoffs`, `open-questions`)
- All 3 core architect skills (`requirement-to-design`, `module-boundary-design`, `tradeoff-analysis`)
- Design review and validation processes
- Architect skill development and training

### 1.3 How to Use This Document

1. **Prevention**: Before starting architect work, review relevant anti-patterns
2. **Detection**: During design review, use detection checklists
3. **Remediation**: When an anti-pattern is found, follow remediation steps
4. **Training**: Use examples and anti-examples for skill development

---

## 2. Anti-Pattern Catalog

---

### AP-001: Spec Parroting

#### ID and Name
**AP-001: Spec Parroting**

#### Definition

Just restating the specification without performing design transformation. The architect output appears to be a reorganized copy of the spec rather than a technical design that maps requirements to architectural decisions.

#### Concrete Example

**Anti-Example** (Spec Parroting):
```markdown
# Design Note

## Goals (copied from spec)
- Users can upload files
- System validates file types
- Files are stored securely

## Features (copied from spec)
- File upload endpoint
- Validation logic
- Storage mechanism
```

**Correct Example** (Design Transformation):
```markdown
# Design Note

## Requirement-to-Design Mapping

| Requirement | Design Decision | Rationale |
|-------------|-----------------|-----------|
| "Users can upload files" | POST /api/files endpoint with multipart/form-data | Standard file upload pattern, supports progress tracking |
| "System validates file types" | Middleware validation layer with allowlist strategy | Security best practice, centralized validation logic |
| "Files are stored securely" | S3 bucket with private ACL + signed URLs | Separation of concerns, scalable storage |

## Design Organization
- UploadController: Handles HTTP request/response
- FileValidationService: Validates type, size, content
- StorageAdapter: Abstracts storage backend
```

#### Why It's Harmful

1. **No design value added**: Downstream roles receive no technical guidance beyond what the spec already stated
2. **Missing transformation**: Requirements are not translated into implementable structures
3. **False confidence**: Appears complete but lacks actionable architecture
4. **Wasted review cycles**: Reviewers must request actual design work

#### How to Detect It

**Detection Checklist**:
- [ ] Does each section add technical structure beyond the spec?
- [ ] Is there an explicit `requirement_to_design_mapping` section?
- [ ] Are technical decisions made (e.g., patterns, interfaces, layers)?
- [ ] Can developer start implementation from this document alone?
- [ ] Are there design-specific sections (architecture, modules, interfaces)?

**Red Flags**:
- Spec goals appear verbatim in design document
- No requirement-to-design mapping table
- Design sections mirror spec sections 1:1
- No technical decision rationale

#### Prevention Measures

1. **Mandatory Mapping**: Require `requirement_to_design_mapping` field in every `design-note`
2. **Design Layer Enforcement**: Each requirement must map to at least one design decision
3. **Skill Checklist**: Include "Is this a transformation or restatement?" in `requirement-to-design` skill validation
4. **Downstream Test**: Ask "Can developer implement from this?" If yes, it's transformed; if no, it's parroting

#### Remediation Steps

If AP-001 is detected:

1. **Identify gaps**: List requirements that lack design decisions
2. **Create mapping table**: Build explicit requirement → design mapping
3. **Add design organization**: Introduce architectural layers, modules, or components
4. **Validate transformation**: Re-run detection checklist
5. **Document revision reason**: Note in design changelog that AP-001 remediation occurred

---

### AP-002: Folder-Driven Architecture

#### ID and Name
**AP-002: Folder-Driven Architecture**

#### Definition

Pretending module design is complete based only on directory structure, without defining actual responsibilities, boundaries, or dependencies.

#### Concrete Example

**Anti-Example** (Folder-Driven):
```markdown
# Module Boundaries

## Modules
- `src/api/` - API handling
- `src/core/` - Core logic
- `src/utils/` - Utilities
- `src/config/` - Configuration

## Structure
```
src/
├── api/
├── core/
├── utils/
└── config/
```
```

**Correct Example** (Responsibility-Driven):
```markdown
# Module Boundaries

## Module Responsibility Table

| Module | Responsibilities | Does NOT Do |
|--------|-----------------|-------------|
| `api` | HTTP request handling, input validation, response formatting | Business logic, data persistence |
| `core` | Business rules, domain logic, workflow orchestration | HTTP handling, storage details |
| `utils` | Pure helper functions, formatting, transformations | State management, I/O operations |
| `config` | Configuration loading, environment detection | Runtime decisions, business rules |

## Dependency Map

```
api → core → utils
  ↓      ↓
config  config
```

## Dependency Rules
- `api` depends on `core` (never reverse)
- `core` depends on `utils` (never reverse)
- All modules may depend on `config`
- No circular dependencies allowed
```

#### Why It's Harmful

1. **False completeness**: Directory structure exists, but architectural clarity does not
2. **Responsibility ambiguity**: Developers cannot determine what code belongs where
3. **Dependency chaos**: No guidance on allowed dependency directions leads to coupling
4. **Review baseline missing**: Reviewer cannot judge if module boundaries are respected

#### How to Detect It

**Detection Checklist**:
- [ ] Is there a responsibility table with "does NOT do" column?
- [ ] Is there an explicit dependency map or diagram?
- [ ] Are module input/output boundaries defined?
- [ ] Are integration seams identified?
- [ ] Can reviewer verify module boundary violations?

**Red Flags**:
- Only directory tree shown, no responsibilities
- "Handles X" without specifics
- No dependency direction arrows
- No `explicit_non_responsibilities` field

#### Prevention Measures

1. **Responsibility Table Requirement**: Mandate responsibility table with "Does NOT Do" column
2. **Dependency Map Requirement**: Require visual or tabular dependency representation
3. **Skill Validation**: Include folder-driven check in `module-boundary-design` skill
4. **Integration Seams**: Require explicit integration seam definitions

#### Remediation Steps

If AP-002 is detected:

1. **Stop implementation**: Do not proceed until boundaries are clear
2. **Create responsibility table**: Define what each module does and does NOT do
3. **Draw dependency map**: Show allowed dependency directions
4. **Define integration seams**: Mark where modules connect
5. **Validate with downstream**: Ask developer if they can organize code from this

---

### AP-003: Decision Without Alternatives

#### ID and Name
**AP-003: Decision Without Alternatives**

#### Definition

Presenting design conclusions without showing the trade-off analysis process. The decision appears arbitrary because alternative options were not evaluated.

#### Concrete Example

**Anti-Example** (No Alternatives):
```markdown
# Design Decisions

## Database Selection
We will use PostgreSQL for data persistence.

## Caching Strategy
We will use Redis for caching.

## API Design
We will use REST for the API.
```

**Correct Example** (With Trade-offs):
```markdown
# Design Decisions

## Database Selection

| Alternative | Pros | Cons | Verdict |
|-------------|------|------|---------|
| PostgreSQL | ACID compliance, mature ecosystem, JSONB support | More complex setup | **Selected** |
| MySQL | Simpler, widely known | Less advanced features | Rejected - need JSONB |
| MongoDB | Flexible schema, easy scaling | No ACID for multi-doc | Rejected - need transactions |

### Trade-off Rationale
Selected PostgreSQL because transaction integrity is critical for financial data. The operational complexity is acceptable given the team's existing PostgreSQL expertise.

### Revisit Trigger
Re-evaluate if data volume exceeds 10TB or if schema flexibility becomes a blocker.
```

#### Why It's Harmful

1. **Unjustified decisions**: Stakeholders cannot evaluate if the decision is sound
2. **Lost institutional knowledge**: Future maintainers don't know why alternatives were rejected
3. **Debate reopening**: Without recorded rationale, the same debates recur
4. **Risk blindness**: Costs and risks of the chosen approach are hidden

#### How to Detect It

**Detection Checklist**:
- [ ] Does each key decision have an `alternatives_considered` field?
- [ ] Are pros/cons listed for each alternative?
- [ ] Is there a `tradeoff_rationale` explaining the selection?
- [ ] Are `rejected_approaches` documented with reasons?
- [ ] Is there a `revisit_trigger` for future re-evaluation?

**Red Flags**:
- "We will use X" without explanation
- No alternatives table or list
- No discussion of rejected options
- No mention of costs or trade-offs

#### Prevention Measures

1. **Mandatory Alternatives Field**: Require `alternatives_considered` in `risks-and-tradeoffs`
2. **Trade-off Rationale**: Require explicit rationale for selection
3. **Revisit Trigger**: Require conditions for future re-evaluation
4. **Skill Enforcement**: Include alternatives check in `tradeoff-analysis` skill validation

#### Remediation Steps

If AP-003 is detected:

1. **Identify decisions**: List all design decisions lacking alternatives
2. **Reconstruct analysis**: Document what alternatives were considered (even if retrospectively)
3. **Add rationale**: Explain why the chosen approach was selected
4. **Document rejected options**: State why alternatives were not taken
5. **Set revisit triggers**: Define conditions for future re-evaluation

---

### AP-004: Silent Assumptions

#### ID and Name
**AP-004: Silent Assumptions**

#### Definition

Making implicit guesses when input is incomplete, without documenting the assumptions or raising open questions. The design proceeds as if all information were known.

#### Concrete Example

**Anti-Example** (Silent Assumptions):
```markdown
# Design Note

## Architecture
The system will process events asynchronously using a message queue.
Files will be processed in real-time as they arrive.
Users will authenticate via OAuth 2.0.
```

**Correct Example** (Explicit Assumptions):
```markdown
# Design Note

## Assumptions

| Assumption | Confidence | Impact if Wrong |
|------------|------------|-----------------|
| Events processed asynchronously | Medium - not confirmed with product | High - would require redesign |
| Real-time processing required | Medium - spec says "fast" | Medium - batch could work |
| OAuth 2.0 available | High - existing infra | Low - can fall back to JWT |

## Open Questions

| Question | Why It Matters | Temporary Assumption | Recommended Next Step |
|----------|---------------|---------------------|----------------------|
| Async vs. sync processing? | Affects architecture pattern | Assume async | Confirm with product owner by 2026-03-25 |
| OAuth provider? | Affects implementation details | Assume Auth0 | Check with infra team |

## Assumptions Validation Plan
- Review assumptions with product owner before implementation
- Revisit open questions in milestone 2
```

#### Why It's Harmful

1. **Hidden risk**: Assumptions may be wrong, requiring expensive rework
2. **Misaligned expectations**: Stakeholders assume different things
3. **Blame shifting**: When assumptions are wrong, accountability is unclear
4. **Cascade failures**: Silent assumptions compound across downstream work

#### How to Detect It

**Detection Checklist**:
- [ ] Is there an explicit `assumptions` section?
- [ ] Are assumptions marked with confidence levels?
- [ ] Is there an `open_questions` section for unresolved items?
- [ ] Are critical missing inputs flagged as blockers?
- [ ] Can you identify what facts are confirmed vs. assumed?

**Red Flags**:
- Design reads as 100% certain
- No "assumes" or "assuming" language
- No open questions section
- Critical design choices lack source attribution

#### Prevention Measures

1. **Mandatory Assumptions Field**: Require `assumptions` section in `design-note`
2. **Open Questions Field**: Require `open_questions` for unresolved items
3. **Confidence Levels**: Mark assumptions with confidence (High/Medium/Low)
4. **Block on Critical**: Block design completion if critical inputs are missing
5. **Skill Validation**: Include silent assumption check in `requirement-to-design` skill

#### Remediation Steps

If AP-004 is detected:

1. **Extract assumptions**: Identify all implicit assumptions in the design
2. **Document explicitly**: Create assumptions table with confidence levels
3. **Raise open questions**: Convert uncertain assumptions to open questions
4. **Assess impact**: Mark impact level if assumption proves wrong
5. **Plan validation**: Create plan to confirm or reject assumptions

---

### AP-005: Role Bleeding

#### ID and Name
**AP-005: Role Bleeding**

#### Definition

The architect crossing into formal responsibilities of other roles (developer, reviewer, security, docs). The architect either does too much implementation detail or performs final approval.

#### Concrete Example

**Anti-Example** (Role Bleeding):
```markdown
# Implementation Plan

## Code to Write
```typescript
async function uploadFile(file: File): Promise<UploadResult> {
  // Validate file type
  const isValid = await validateFileType(file);
  if (!isValid) {
    throw new InvalidFileTypeError();
  }
  
  // Store in S3
  const key = `uploads/${Date.now()}-${file.name}`;
  await s3.putObject({
    Bucket: 'my-bucket',
    Key: key,
    Body: file.buffer,
    ACL: 'private'
  });
  
  return { success: true, key };
}
```

## Approval
This design is approved for implementation.
```

**Correct Example** (Role Boundaries):
```markdown
# Module Boundaries

## Implementation Constraints
- Upload handling must validate file type before storage
- Storage adapter must be abstracted for future backend changes
- Error handling must follow error-handling-protocol.md

## For Developer to Determine
- Specific function names and signatures
- Error message text and formatting
- Logging strategy details
- Test coverage approach

## For Reviewer to Determine
- Code quality assessment
- Test coverage adequacy
- Security implementation correctness

## For Security to Review
- S3 bucket permissions
- File type validation bypass risks
- Authentication/authorization integration
```

#### Why It's Harmful

1. **Role confusion**: Unclear who is responsible for what
2. **Review bypass**: Architect cannot self-approve their own design
3. **Over-specification**: Developers lose implementation autonomy
4. **Skill atrophy**: Architect skills drift from design into implementation

#### How to Detect It

**Detection Checklist**:
- [ ] Does design contain detailed implementation code (>10 lines)?
- [ ] Does architect claim approval authority?
- [ ] Are developer responsibilities defined as "for developer to determine"?
- [ ] Does design leave room for implementation choices?
- [ ] Is reviewer role preserved for independent approval?

**Red Flags**:
- Full function/method implementations
- "This design is approved" statements
- Variable names, exact function signatures
- Test case implementations (vs. test strategy)

#### Prevention Measures

1. **Non-Responsibilities Section**: Document what architect does NOT do
2. **Implementation Constraints, Not Code**: Specify constraints, not implementations
3. **Role Boundary Checklist**: Include role boundary check in all architect skills
4. **Approval Separation**: Architect outputs baseline; reviewer approves independently

#### Remediation Steps

If AP-005 is detected:

1. **Identify bleeding**: Mark sections that cross into other roles
2. **Remove implementation code**: Replace detailed code with constraints
3. **Clarify boundaries**: Add "For [Role] to Determine" sections
4. **Remove approval claims**: Delete any self-approval statements
5. **Revalidate role scope**: Re-check against role-definition.md

---

### AP-006: Over-Abstract Design

#### ID and Name
**AP-006: Over-Abstract Design**

#### Definition

Outputting large amounts of abstract concepts, theories, or diagrams without providing actionable, consumable guidance for downstream roles.

#### Concrete Example

**Anti-Example** (Over-Abstract):
```markdown
# Design Philosophy

## Conceptual Framework
The system embodies a multi-layered abstraction wherein entities interact through well-defined interfaces within a distributed event-driven paradigm.

## Architectural Vision
Data flows through transformation pipelines that progressively refine raw information into actionable insights, with each layer maintaining separation of concerns and adhering to SOLID principles.

## Theoretical Model
```
[Abstract Diagram with no concrete modules]
Entity → Transformer → Mediator → Repository → Sink
```
```

**Correct Example** (Actionable Design):
```markdown
# Design Summary

## Module Organization

| Module | Entry Point | Key Interfaces | Output |
|--------|-------------|----------------|--------|
| `IngestionService` | `ingest(rawData: RawData)` | `DataValidator`, `DataTransformer` | `ValidatedData` |
| `ProcessingEngine` | `process(data: ValidatedData)` | `ProcessingStrategy`, `ResultAggregator` | `ProcessedResult` |
| `StorageAdapter` | `store(result: ProcessedResult)` | `StorageBackend` | `StorageLocation` |

## Integration Points for Developer

### IngestionService
```typescript
interface IngestionService {
  ingest(rawData: RawData): Promise<ValidatedData>;
  validate(data: RawData): ValidationResult;
}
```

### ProcessingEngine
- Implements Strategy pattern for processing algorithms
- Configurable via ProcessingConfig interface
- Emits ProcessingEvent on completion

## Actionable Next Steps for Developer
1. Implement IngestionService.ingest() method
2. Create ProcessingStrategy implementations
3. Integrate with StorageAdapter interface
```

#### Why It's Harmful

1. **Zero consumability**: Developer cannot extract implementation tasks
2. **False sophistication**: Looks impressive but provides no value
3. **Review impossibility**: Reviewer cannot validate abstract concepts
4. **Wasted effort**: Time spent on abstraction instead of actionable design

#### How to Detect It

**Detection Checklist**:
- [ ] Can developer extract specific implementation tasks?
- [ ] Are interfaces, methods, or components concrete?
- [ ] Does design have entry points for downstream roles?
- [ ] Are diagrams labeled with real module names?
- [ ] Is there an "Actionable Next Steps" section?

**Red Flags**:
- Only high-level conceptual language
- No concrete module or component names
- No interfaces or method signatures
- Diagrams are purely theoretical
- Phrases like "in a general sense" or "conceptually"

#### Prevention Measures

1. **Downstream Consumability Checklist**: Require validation for each downstream role
2. **Concrete Entry Points**: Mandate specific interfaces, methods, or components
3. **Actionable Sections**: Require "For Developer" or "Next Steps" sections
4. **Abstract-to-Concrete Ratio**: Limit abstract sections to 20% of document

#### Remediation Steps

If AP-006 is detected:

1. **Identify abstractions**: Mark sections that are purely conceptual
2. **Add concrete counterparts**: For each concept, add concrete implementation
3. **Create entry points**: Add interfaces, methods, or component definitions
4. **Write actionable guidance**: Add "For Developer" sections with specific tasks
5. **Validate consumability**: Ask developer if they can implement from this

---

### AP-007: No Future Boundary

#### ID and Name
**AP-007: No Future Boundary**

#### Definition

Not clearly defining the boundary between current scope and future extension. The design assumes the current implementation is final, blocking future evolution.

#### Concrete Example

**Anti-Example** (No Future Boundary):
```markdown
# Module Boundaries

## Current Modules
- `UserModule`: Handles user registration, login, profile management
- `OrderModule`: Handles order creation, payment, fulfillment
- `NotificationModule`: Handles email notifications

## Implementation
All features implemented as described.
```

**Correct Example** (With Future Boundary):
```markdown
# Module Boundaries

## Current Scope (This Milestone)

| Module | Current Responsibilities | Explicitly Out of Scope |
|--------|-------------------------|------------------------|
| `UserModule` | Registration, login, basic profile | OAuth, social login, SSO |
| `OrderModule` | Order creation, payment | Refunds, partial fulfillment, subscriptions |
| `NotificationModule` | Email notifications | SMS, push, in-app, templating system |

## Future Extension Boundary

| Extension Point | Current Design | Future Extension Allowed |
|-----------------|----------------|-------------------------|
| Authentication | Username/password | OAuth provider interface at `auth/providers/` |
| Notifications | Email adapter only | Notification channel interface at `notification/channels/` |
| Payments | Single payment processor | Payment gateway interface at `payment/gateways/` |

## Extension Guidelines
- New auth providers: Implement `AuthProvider` interface
- New notification channels: Implement `NotificationChannel` interface
- New payment gateways: Implement `PaymentGateway` interface
- Do NOT modify existing implementations; extend via interfaces
```

#### Why It's Harmful

1. **Evolution blocker**: Future features require breaking changes
2. **Technical debt**: Short-term design creates long-term constraints
3. **Rework cost**: Future extensions require redesign instead of simple extension
4. **Scope creep risk**: Unclear boundaries invite feature creep into current work

#### How to Detect It

**Detection Checklist**:
- [ ] Is there a `future_extension_boundary` field?
- [ ] Are current responsibilities vs. future extensions distinguished?
- [ ] Are extension points explicitly marked?
- [ ] Are interfaces provided for future implementations?
- [ ] Is there an "Explicitly Out of Scope" section?

**Red Flags**:
- All features described as if equally important
- No distinction between "now" and "later"
- No extension interfaces or patterns
- No explicit non-goals for future work

#### Prevention Measures

1. **Mandatory Extension Boundary**: Require `future_extension_boundary` in `module-boundaries`
2. **Extension Points**: Mark where future work should plug in
3. **Interface Design**: Design interfaces that allow extension without modification
4. **Scope Table**: Use "Current vs. Future" responsibility tables

#### Remediation Steps

If AP-007 is detected:

1. **Identify extension points**: Find areas likely to need future work
2. **Add extension boundaries**: Create `future_extension_boundary` section
3. **Design interfaces**: Add interfaces for anticipated extensions
4. **Mark current scope**: Explicitly state what is NOT in current scope
5. **Document extension guidelines**: Provide guidance for future implementers

---

## 3. Cross-Reference to Related Skills

### Prevention Skills

| Skill | Anti-Patterns Prevented | Location |
|-------|------------------------|----------|
| `requirement-to-design` | AP-001 (Spec Parroting), AP-004 (Silent Assumptions) | `.opencode/skills/architect/requirement-to-design/SKILL.md` |
| `module-boundary-design` | AP-002 (Folder-Driven), AP-006 (Over-Abstract), AP-007 (No Future Boundary) | `.opencode/skills/architect/module-boundary-design/SKILL.md` |
| `tradeoff-analysis` | AP-003 (Decision Without Alternatives), AP-005 (Role Bleeding) | `.opencode/skills/architect/tradeoff-analysis/SKILL.md` |

### Detection Skills

| Validation Asset | Anti-Patterns Detected | Location |
|-----------------|----------------------|----------|
| Downstream-Consumability Checklist | AP-001, AP-002, AP-006 | `specs/003-architect-core/validation/consumability-checklist.md` |
| Cross-Skill Validation Checklist | AP-001, AP-003, AP-004, AP-005 | `specs/003-architect-core/validation/cross-skill-checklist.md` |
| Failure-Mode Checklist | All 7 anti-patterns | `specs/003-architect-core/validation/failure-mode-checklist.md` |

### Related Governance Documents

| Document | Relevance |
|----------|-----------|
| `role-definition.md` | AP-005 (Role Bleeding) - defines role boundaries |
| `package-spec.md` | All anti-patterns - defines quality gates |
| `quality-gate.md` | All anti-patterns - validation criteria |
| `io-contract.md` | AP-001, AP-004 - input/output expectations |

### Related Specifications

| Spec Section | Anti-Patterns Addressed |
|--------------|------------------------|
| AC-001 (design-note contract) | AP-001, AP-004 |
| AC-002 (module-boundaries contract) | AP-002, AP-007 |
| AC-003 (risks-and-tradeoffs contract) | AP-003 |
| AC-004 (open-questions contract) | AP-004 |

---

## 4. Quick Reference Table

| ID | Name | Key Prevention | Detection Signal | Severity |
|----|------|---------------|------------------|----------|
| AP-001 | Spec Parroting | Require requirement → design mapping | No mapping table, spec text copied verbatim | High |
| AP-002 | Folder-Driven Architecture | Require responsibility table + dependency map | Only directory tree, no responsibilities | High |
| AP-003 | Decision Without Alternatives | Require alternatives_considered field | "We will use X" without explanation | Medium |
| AP-004 | Silent Assumptions | Require assumptions + open_questions fields | Design reads as 100% certain | High |
| AP-005 | Role Bleeding | Enforce non-responsibilities, use constraints not code | Detailed implementation code, self-approval | Medium |
| AP-006 | Over-Abstract Design | Require downstream-consumability validation | Only concepts, no actionable guidance | Medium |
| AP-007 | No Future Boundary | Require future_extension_boundary | No distinction between now/later | Low-Medium |

### Severity Levels

| Level | Action Required |
|-------|----------------|
| **High** | Block downstream work until remediated |
| **Medium** | Remediate before implementation starts |
| **Low-Medium** | Remediate in next iteration if not blocking |

---

## 5. Usage Workflows

### Workflow 1: Pre-Work Prevention

Before starting architect work:

1. Review relevant anti-patterns for the skill being used
2. Set up document templates with required fields
3. Enable validation checklists in skill execution

### Workflow 2: During-Work Detection

While creating architect artifacts:

1. Run self-check against detection checklist
2. Validate each section against anti-pattern criteria
3. Flag potential issues for early remediation

### Workflow 3: Post-Work Validation

After completing architect artifacts:

1. Run full anti-pattern detection checklists
2. Have reviewer independently validate
3. Document any remediation performed

### Workflow 4: Remediation

When anti-pattern is detected:

1. Identify specific anti-pattern and severity
2. Follow remediation steps for that anti-pattern
3. Re-validate after remediation
4. Document remediation in changelog

---

## 6. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-03-23 | Initial creation based on spec.md Section 11 | architect |

---

## 7. Appendix: Anti-Pattern Quick Cards

### AP-001 Quick Card
```
AP-001: Spec Parroting
Prevention: Add requirement → design mapping table
Detection: No design organization beyond spec structure
Remediation: Transform requirements into design decisions
```

### AP-002 Quick Card
```
AP-002: Folder-Driven Architecture
Prevention: Add responsibility table with "Does NOT Do"
Detection: Only directory tree shown
Remediation: Define responsibilities, dependencies, seams
```

### AP-003 Quick Card
```
AP-003: Decision Without Alternatives
Prevention: Add alternatives_considered field
Detection: "We will use X" without explanation
Remediation: Document alternatives, rationale, revisit triggers
```

### AP-004 Quick Card
```
AP-004: Silent Assumptions
Prevention: Add assumptions + open_questions fields
Detection: Design reads as 100% certain
Remediation: Extract and document all assumptions
```

### AP-005 Quick Card
```
AP-005: Role Bleeding
Prevention: Use constraints, not implementation code
Detection: Detailed code or self-approval statements
Remediation: Remove code, add boundary sections
```

### AP-006 Quick Card
```
AP-006: Over-Abstract Design
Prevention: Add actionable entry points for developers
Detection: Only concepts, no concrete guidance
Remediation: Add interfaces, methods, next steps
```

### AP-007 Quick Card
```
AP-007: No Future Boundary
Prevention: Add future_extension_boundary field
Detection: No distinction between current/future scope
Remediation: Mark extension points and out-of-scope items
```
