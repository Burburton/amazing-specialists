# AC-001: Design Note Contract

**Artifact ID**: `AC-001`  
**Artifact Name**: `design-note`  
**Version**: 1.0.0  
**Producer**: `architect`  
**Consumers**: `developer`, `tester`, `reviewer`, `docs`  

---

## 1. Purpose Statement

The `design-note` artifact is the primary design baseline document produced by the `architect` role. It transforms feature specifications into structured technical designs, providing a stable foundation for downstream roles.

**Primary Goals**:
- Capture the complete design context for a feature
- Explicitly map requirements to design decisions
- Document assumptions, constraints, and non-goals
- Expose unresolved questions before implementation begins
- Provide actionable guidance for developer, tester, reviewer, and docs roles

**Anti-Goal**: This is not a restatement of the spec. It must add design structure and technical organization beyond the requirements.

---

## 2. Required Fields

The following 9 fields are **mandatory** in every valid `design-note` artifact:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `background` | string | Yes | Context and motivation for the design |
| `feature_goal` | string | Yes | What this feature aims to achieve |
| `input_sources` | array | Yes | Where requirements come from |
| `requirement_to_design_mapping` | array | Yes | Explicit mapping of requirements to design decisions |
| `design_summary` | string | Yes | High-level design overview |
| `constraints` | array | Yes | Limitations and boundaries |
| `non_goals` | array | Yes | Explicit out-of-scope items |
| `assumptions` | array | Yes | Design assumptions made |
| `open_questions` | array | Yes | Unresolved design questions |

---

## 3. Field Specifications

### 3.1 `background`

**Type**: `string` (markdown)  
**Validation Rules**:
- Minimum 2 sentences explaining context
- Must reference the problem being solved
- Must explain why this design is needed now

**Example**:
```markdown
The repository has completed governance migration from legacy 3-skill to the 6-role formal execution model. 
The architect role requires structured design artifacts to provide stable baselines for downstream roles.
Without complete architect-core implementation, downstream roles lack clear design boundaries and traceability.
```

---

### 3.2 `feature_goal`

**Type**: `string` (markdown)  
**Validation Rules**:
- Must be a single concise paragraph (3-5 sentences)
- Must state what success looks like
- Must be testable/verifiable

**Example**:
```markdown
Establish architect as a first-class execution role with complete capability system, stable artifact contracts, 
clear role boundaries, validation model, and downstream interfaces. This provides developer, tester, reviewer, 
and docs roles with consumable design baselines for feature implementation.
```

---

### 3.3 `input_sources`

**Type**: `array` of objects  
**Schema**:
```typescript
{
  source: string;        // File path or document name
  type: "spec" | "governance" | "constraint" | "context";
  mandatory: boolean;    // Whether this source is required
}[]
```

**Validation Rules**:
- At least one `spec` type source must be present
- Each source must have a valid file path or document reference
- Mandatory sources must exist

**Example**:
```yaml
- source: "specs/003-architect-core/spec.md"
  type: "spec"
  mandatory: true
- source: "package-spec.md"
  type: "governance"
  mandatory: true
- source: "role-definition.md"
  type: "governance"
  mandatory: true
```

---

### 3.4 `requirement_to_design_mapping`

**Type**: `array` of objects  
**Schema**:
```typescript
{
  requirement_id: string;     // e.g., "BR-001", "NFR-001"
  requirement_text: string;   // Brief summary of the requirement
  design_decision: string;    // How the design addresses this requirement
  artifact_section: string;   // Which section/field contains the implementation
}[]
```

**Validation Rules**:
- Each business rule (BR-001 through BR-006) must be mapped
- Each non-functional requirement (NFR-001 through NFR-004) must be mapped
- Design decisions must be specific, not vague restatements
- Artifact section references must be valid field names

**Example**:
```yaml
- requirement_id: "BR-001"
  requirement_text: "Design Must Be Consumable"
  design_decision: "All 9 required fields have explicit types and validation rules to ensure clarity"
  artifact_section: "all fields"
- requirement_id: "BR-002"
  requirement_text: "Design Must Map Requirements"
  design_decision: "requirement_to_design_mapping field provides explicit traceability"
  artifact_section: "requirement_to_design_mapping"
- requirement_id: "NFR-001"
  requirement_text: "Discoverability"
  design_decision: "Contract stored in specs/003-architect-core/contracts/ with clear naming"
  artifact_section: "document location"
```

---

### 3.5 `design_summary`

**Type**: `string` (markdown)  
**Validation Rules**:
- Must provide high-level overview of the design approach
- Must mention key architectural decisions
- Must be understandable without reading the full spec
- Length: 5-10 sentences

**Example**:
```markdown
The design-note contract establishes a structured template with 9 mandatory fields that transform 
feature specifications into actionable design baselines. The contract enforces requirement-to-design 
traceability through explicit mapping, prevents scope creep through non-goals documentation, and 
exposes uncertainties through assumptions and open questions. Each field has strict validation 
rules to ensure downstream consumability by developer, tester, reviewer, and docs roles.
```

---

### 3.6 `constraints`

**Type**: `array` of objects  
**Schema**:
```typescript
{
  constraint_id: string;      // e.g., "C-001"
  description: string;        // What the constraint is
  source: string;             // Where this constraint comes from
  impact: string;             // How this affects the design
}[]
```

**Validation Rules**:
- All constraints from the spec must be listed
- Each constraint must have a source reference
- Impact must describe design implications, not just restate the constraint

**Example**:
```yaml
- constraint_id: "C-001"
  description: "Must use 6-role formal semantics, not legacy 3-skill terminology"
  source: "spec.md:BR-006"
  impact: "All field names and descriptions use architect/developer/tester/reviewer/docs/security terminology"
- constraint_id: "C-002"
  description: "Design cannot cross into developer/tester/reviewer responsibilities"
  source: "spec.md:BR-003"
  impact: "Contract defines what architect provides, not how downstream roles use it"
```

---

### 3.7 `non_goals`

**Type**: `array` of objects  
**Schema**:
```typescript
{
  item: string;               // What is explicitly out of scope
  rationale: string;          // Why this is excluded
  future_consideration: boolean; // Whether this might be added later
}[]
```

**Validation Rules**:
- Must include all "Out of Scope" items from the spec
- Each non-goal must have a clear rationale
- Must prevent scope creep during implementation

**Example**:
```yaml
- item: "developer core implementation"
  rationale: "This is feature 004, outside architect-core scope"
  future_consideration: false
- item: "Detailed implementation code"
  rationale: "Architect provides design baseline, not implementation"
  future_consideration: false
- item: "Final independent approval"
  rationale: "This is reviewer responsibility, not architect"
  future_consideration: false
```

---

### 3.8 `assumptions`

**Type**: `array` of objects  
**Schema**:
```typescript
{
  assumption_id: string;      // e.g., "A-001"
  description: string;        // What is being assumed
  risk_if_wrong: string;      // What happens if this assumption is incorrect
  validation_method: string;  // How to verify this assumption
}[]
```

**Validation Rules**:
- All assumptions from the spec must be listed
- Each assumption must have a risk assessment
- Assumptions must be marked as facts vs. assumptions (no hidden assumptions)

**Example**:
```yaml
- assumption_id: "A-001"
  description: "Features 002-role-model-alignment and 002b-governance-repair are complete"
  risk_if_wrong: "Architect role definition may conflict with legacy semantics"
  validation_method: "Check completion-report.md of features 002 and 002b"
- assumption_id: "A-002"
  description: "Downstream roles (004-008) will be developed to consume architect outputs"
  risk_if_wrong: "Architect artifacts may not align with actual downstream needs"
  validation_method: "Gather feedback after features 004-008 implementation"
```

---

### 3.9 `open_questions`

**Type**: `array` of objects  
**Schema**:
```typescript
{
  question_id: string;        // e.g., "Q-001"
  question: string;           // The unresolved question
  why_it_matters: string;     // Impact on design/implementation
  temporary_assumption: string; // Working assumption until resolved
  impact_surface: string;     // What parts of the system are affected
  recommended_next_step: string; // How to resolve this question
}[]
```

**Validation Rules**:
- All open questions from the spec must be listed
- Each question must have a temporary assumption (cannot leave unresolved)
- Recommended next step must be actionable

**Example**:
```yaml
- question_id: "Q-001"
  question: "Which advanced architect skills should be prioritized after core completion?"
  why_it_matters: "Affects roadmap for architect capability expansion"
  temporary_assumption: "Focus on core skills first; advanced skills prioritized based on usage feedback"
  impact_surface: "Future feature planning (003+ enhancements)"
  recommended_next_step: "Gather downstream role usage feedback after core implementation"
```

---

## 4. Consumer Responsibilities

### 4.1 `developer`

**What to Expect**:
- Clear module boundaries and responsibility assignments
- Explicit constraints that limit implementation choices
- Requirement-to-design mapping to understand the "why" behind decisions
- Assumptions that may affect implementation details

**How to Use**:
1. Read `design_summary` for high-level understanding
2. Review `requirement_to_design_mapping` for design rationale
3. Check `constraints` for implementation boundaries
4. Note `assumptions` that may need validation during implementation
5. Flag `open_questions` that block implementation

---

### 4.2 `tester`

**What to Expect**:
- Clear feature goals to derive test cases from
- Constraints that define boundary conditions
- Assumptions that may be testable
- Open questions that may need exploratory testing

**How to Use**:
1. Use `feature_goal` to derive acceptance criteria
2. Use `constraints` to identify boundary test cases
3. Use `assumptions` to identify validation test cases
4. Use `open_questions` to identify risk-based testing priorities
5. Use `requirement_to_design_mapping` to trace tests to requirements

---

### 4.3 `reviewer`

**What to Expect**:
- Complete traceability from requirements to design
- Explicit assumptions and their risk assessments
- Clear non-goals to prevent scope creep in review
- Open questions that may need human decision

**How to Use**:
1. Verify `requirement_to_design_mapping` completeness
2. Challenge high-risk `assumptions`
3. Ensure `non_goals` are respected
4. Evaluate whether `open_questions` are appropriately escalated
5. Validate design decisions against `constraints`

---

### 4.4 `docs`

**What to Expect**:
- Clear `design_summary` for documentation overview
- Module/responsibility summaries for structure docs
- Terminology and key concepts from `background`
- Decision rationale for context documentation

**How to Use**:
1. Extract `design_summary` for documentation introduction
2. Use `background` for context sections
3. Use `requirement_to_design_mapping` for rationale documentation
4. Track `open_questions` for documentation TODOs

---

## 5. Producer Responsibilities

The `architect` role must ensure:

### 5.1 Completeness

- [ ] All 9 required fields are present and populated
- [ ] All business rules (BR-001 to BR-006) are mapped
- [ ] All non-functional requirements (NFR-001 to NFR-004) are mapped
- [ ] All spec assumptions are documented
- [ ] All spec open questions are documented

### 5.2 Quality

- [ ] No field is a restatement of spec without design transformation
- [ ] All assumptions are explicitly marked (no hidden assumptions)
- [ ] All open questions have temporary assumptions
- [ ] Non-goals are explicit and prevent scope creep
- [ ] Design decisions are specific and actionable

### 5.3 Consumability

- [ ] Developer can organize implementation from this document
- [ ] Tester can organize verification from this document
- [ ] Reviewer can judge design reasonableness from this document
- [ ] Docs can write documentation from this document

### 5.4 Traceability

- [ ] Each design decision traces to a requirement
- [ ] Each constraint traces to its source
- [ ] Input sources are explicitly referenced
- [ ] Field values reference spec sections where applicable

### 5.5 Boundary Maintenance

- [ ] Does not implement developer responsibilities
- [ ] Does not implement tester responsibilities
- [ ] Does not perform reviewer approval
- [ ] Does not write complete documentation
- [ ] Does not perform security audits

---

## 6. Example Minimal Valid Artifact

```yaml
# Minimal valid design-note for AC-001 contract validation

background: |
  The architect role requires structured design artifacts to provide stable baselines 
  for downstream roles in the 6-role formal execution model.

feature_goal: |
  Define the design-note contract with 9 mandatory fields to ensure consistent, 
  consumable design baselines for developer, tester, reviewer, and docs roles.

input_sources:
  - source: "specs/003-architect-core/spec.md"
    type: "spec"
    mandatory: true

requirement_to_design_mapping:
  - requirement_id: "BR-001"
    requirement_text: "Design Must Be Consumable"
    design_decision: "9 mandatory fields with validation rules ensure clarity"
    artifact_section: "all fields"

design_summary: |
  The design-note contract establishes a structured template with 9 mandatory fields 
  that transform feature specifications into actionable design baselines with explicit 
  traceability and validation rules.

constraints:
  - constraint_id: "C-001"
    description: "Must use 6-role formal semantics"
    source: "spec.md:BR-006"
    impact: "All terminology uses architect/developer/tester/reviewer/docs/security"

non_goals:
  - item: "Detailed implementation code"
    rationale: "This is developer responsibility"
    future_consideration: false

assumptions:
  - assumption_id: "A-001"
    description: "Features 002 and 002b are complete"
    risk_if_wrong: "Role semantics may conflict"
    validation_method: "Check completion reports"

open_questions:
  - question_id: "Q-001"
    question: "Which advanced architect skills to prioritize?"
    why_it_matters: "Affects roadmap"
    temporary_assumption: "Focus on core skills first"
    impact_surface: "Future feature planning"
    recommended_next_step: "Gather feedback after core implementation"
```

---

## 7. Quality Checklist

### 7.1 Structural Validation

- [ ] All 9 required fields present
- [ ] All fields have correct types (string, array)
- [ ] All array fields have at least one entry
- [ ] All object fields have required sub-fields

### 7.2 Content Validation

- [ ] `background` has at least 2 sentences with context
- [ ] `feature_goal` is testable and verifiable
- [ ] `input_sources` includes at least one spec source
- [ ] `requirement_to_design_mapping` covers all BR and NFR items
- [ ] `design_summary` is 5-10 sentences with key decisions
- [ ] `constraints` include source references and impact
- [ ] `non_goals` include rationale for each item
- [ ] `assumptions` include risk assessment for each
- [ ] `open_questions` include temporary assumptions and next steps

### 7.3 Anti-Pattern Checks

- [ ] **NOT** spec parroting (adds design structure)
- [ ] **NOT** folder-driven (design is not based on directory structure)
- [ ] **NOT** silent assumptions (all assumptions explicit)
- [ ] **NOT** role bleeding (stays within architect boundaries)
- [ ] **NOT** over-abstract (actionable for downstream)

### 7.4 Downstream Consumability

- [ ] Developer can identify implementation boundaries
- [ ] Tester can derive test cases from goals and constraints
- [ ] Reviewer can evaluate design rationale
- [ ] Docs can extract documentation content

### 7.5 Traceability

- [ ] Each design decision maps to a requirement
- [ ] Each constraint has a source
- [ ] Input sources are valid and accessible
- [ ] Field references link to spec sections

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-03-23 | architect | Initial contract definition |

---

## References

- `specs/003-architect-core/spec.md` - Source specification
- `package-spec.md` - Package governance
- `role-definition.md` - 6-role definitions
- `io-contract.md` - Input/output contract
