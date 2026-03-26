# 006-reviewer-core Feature Specification

## 1. Feature Overview

### Feature ID
`006-reviewer-core`

### Feature Title
Reviewer Core Skills System

### Feature Type
Core role capability feature

### Status
Draft for `/spec-start` input

### Purpose
Establish `reviewer` as the formal independent review and acceptance-gate role in the OpenCode expert package. This feature should convert reviewer from a conceptual role into a governed, auditable, reusable capability system with explicit boundaries, structured outputs, and downstream decision semantics.

---

## 2. Why 006 Exists

After `003-architect-core`, `004-developer-core`, and `005-tester-core`, the repository already has:
- design intent and architecture judgment
- implementation and self-check capability
- verification and regression-oriented testing capability

What is still missing is a **formal independent acceptance layer**.

The `reviewer` role is needed to:
- independently compare implementation outcomes against intended scope
- detect unacceptable gaps, overclaims, or quality risks
- decide whether a change should be accepted, rejected, or sent back for revision
- produce actionable feedback without silently turning into the implementer
- serve as the final quality gate before broader acceptance or downstream documentation/security stages

Without 006, the system lacks a strong independent review checkpoint.

---

## 3. Primary Objectives

`006-reviewer-core` must achieve the following:

1. Formally define `reviewer` as an independent review and acceptance-gate role.
2. Implement the reviewer’s core reusable skill set.
3. Define reviewer-owned artifacts for findings, decisions, and rejection feedback.
4. Consume upstream outputs from architect, developer, and tester in a structured way.
5. Establish explicit reviewer decision states and handoff semantics.
6. Enforce role boundaries so reviewer does not become developer or tester.
7. Provide examples, anti-examples, templates, validation rules, and checklists.
8. Make reviewer outputs auditable and usable by later roles and governance documents.

---

## 4. Role Definition

### Role Name
`reviewer`

### Core Responsibility
Perform independent quality review and produce acceptance-oriented judgment based on intended scope, implementation evidence, and testing evidence.

### Reviewer Should Do
- compare actual delivered outputs against intended requirements and scope
- inspect whether implementation and testing claims are supported by evidence
- identify mismatches, risks, omissions, overstatements, and acceptance blockers
- produce actionable findings and decision outputs
- recommend acceptance, conditional acceptance, or rejection with justification

### Reviewer Should Not Do
- silently repair implementation defects as if acting as developer
- replace the tester’s validation function
- redefine product or architecture scope without clear rationale
- approve work based only on self-claims without independent comparison
- provide vague rejection without actionable remediation guidance

### Position in Pipeline
Typical upstream inputs:
- architect outputs from `003-architect-core`
- developer outputs from `004-developer-core`
- tester outputs from `005-tester-core`

Typical downstream consumers:
- final acceptance process
- governance status reporting
- docs/security roles in later phases
- rework loop back to developer/tester when rejection occurs

---

## 5. Scope of This Feature

### In Scope
- reviewer core role definition
- reviewer skill package structure
- reviewer artifact contracts
- upstream input consumption rules
- reviewer decision model
- validation rules and quality checks
- examples and anti-examples
- templates and checklists
- README / governance synchronization requirements

### Out of Scope
- implementing docs-core capabilities
- implementing security-core capabilities
- replacing developer or tester execution logic
- repository-wide orchestration redesign beyond reviewer integration needs

---

## 6. Core Reviewer Skills

This feature should create **three first-class reviewer skills**.

### 6.1 `code-review-checklist`

#### Purpose
Provide a reusable structured checklist for independent review of delivered work.

#### Responsibilities
- inspect correctness, completeness, consistency, and maintainability signals
- check whether delivered artifacts match intended scope
- identify missing evidence, weak reasoning, or suspicious overclaims
- ensure findings are categorized and actionable

#### Expected Output Characteristics
- checklist-driven, not vague opinion-based review
- severity-aware findings
- evidence-linked observations
- explicit pass / concern / fail style checkpoints where appropriate

---

### 6.2 `spec-implementation-diff`

#### Purpose
Compare what was specified versus what was actually implemented.

#### Responsibilities
- compare `spec.md`, `plan.md`, `tasks.md`, and real repository outputs
- identify scope drift, partial delivery, undocumented narrowing, and missing components
- distinguish acceptable deviation from unacceptable deviation
- call out overstated completion claims

#### Expected Output Characteristics
- structured spec-versus-reality comparison
- explicit mismatch categories
- clear distinction between blocking and non-blocking deltas

---

### 6.3 `reject-with-actionable-feedback`

#### Purpose
Enable reviewer to reject work in a way that is operationally useful and recoverable.

#### Responsibilities
- explain why a submission cannot be accepted
- separate blockers from improvements
- tell downstream actors exactly what must change
- preserve traceability between finding and remediation expectation

#### Expected Output Characteristics
- actionable, specific, unambiguous rejection guidance
- no generic “needs improvement” statements without detail
- findings mapped to next-step remediation actions

---

## 7. Reviewer-Owned Artifacts

This feature should define **three formal reviewer artifacts**.

### 7.1 `review-findings-report`

#### Purpose
Primary structured review artifact capturing findings.

#### Required Fields
- review target
- reviewed inputs
- summary judgment
- findings by severity
- evidence / references
- scope mismatches
- quality concerns
- open questions
- recommended next action

---

### 7.2 `acceptance-decision-record`

#### Purpose
Formal record of reviewer decision.

#### Required Fields
- target feature / deliverable
- decision state
- decision rationale
- blocking issues
- non-blocking issues
- acceptance conditions if conditional
- downstream recommendation
- reviewer confidence level

#### Allowed Decision States
- `accept`
- `accept-with-conditions`
- `reject`
- `needs-clarification`

---

### 7.3 `actionable-feedback-report`

#### Purpose
Operational handoff document when rework is needed.

#### Required Fields
- issue summary
- affected files / artifacts
- why it matters
- required correction
- suggested owner role
- expected verification after fix
- closure criteria

---

## 8. Upstream Inputs and Contracts

Reviewer must explicitly consume upstream outputs from prior roles.

### 8.1 From `003-architect-core`
Potential reviewer inputs include:
- architecture intent
- invariants / constraints
- requirement-to-design alignment
- declared tradeoffs and assumptions

Reviewer should verify whether implementation and testing remain aligned with approved architecture intent.

### 8.2 From `004-developer-core`
Reviewer should explicitly support consumption of:
- `implementation-summary`
- `self-check-report`
- `bugfix-report` where relevant
- especially fields such as:
  - `goal_alignment`
  - `changed_files`
  - `known_issues`
  - `risks`

Reviewer should treat developer self-report as evidence input, not as final truth.

### 8.3 From `005-tester-core`
Reviewer should explicitly support consumption of:
- `test-scope-report`
- `verification-report`
- `regression-risk-report`

Reviewer should verify whether testing evidence is sufficient, relevant, and consistent with acceptance expectations.

---

## 9. Decision Model and Handoff Semantics

### Reviewer Decision Semantics
Reviewer must not just “comment”; reviewer must produce an explicit decision state.

### Expected Behaviors by Decision

#### `accept`
- deliverable is acceptable for intended stage
- no blocking issues remain
- downstream work may proceed

#### `accept-with-conditions`
- core acceptance is possible
- some bounded follow-up items remain
- follow-ups must be explicitly listed and non-blocking

#### `reject`
- blocking gaps prevent acceptance
- rework is required before downstream progression
- actionable remediation must be produced

#### `needs-clarification`
- reviewer cannot make a reliable decision because required information is missing or ambiguous
- clarification request must be explicit and scoped

### Handoff Expectations
When reviewer rejects or conditionally accepts work, downstream expectations must be unambiguous:
- who needs to act
- what needs to be corrected
- what evidence is required for re-review
- what completion condition closes the finding

---

## 10. Validation Rules

The feature should define validation rules for reviewer outputs and behavior.

### Required Validation Themes
1. **Independence**: review cannot merely restate developer or tester claims.
2. **Evidence grounding**: findings should be tied to files, artifacts, or explicit evidence.
3. **Severity discipline**: blocking vs non-blocking issues must be distinguished.
4. **Actionability**: rejection feedback must be concretely fixable.
5. **Boundary discipline**: reviewer should not silently mutate into implementer.
6. **Decision clarity**: final judgment must be explicit.
7. **Terminology consistency**: reviewer language must align with repository governance.
8. **Status honesty**: conclusions must not overstate completeness.

---

## 11. Failure Modes and Anti-Patterns

The feature should explicitly document reviewer failure modes.

### Examples of Failure Modes
- reviewer acts like a second developer and rewrites rather than reviews
- reviewer simply repeats tester output without independent judgment
- reviewer approves based on surface completeness only
- reviewer rejects without remediation guidance
- reviewer flags issues but does not classify severity
- reviewer claims acceptance despite known blocking gaps
- reviewer ignores mismatch between spec and actual outputs

### Anti-Pattern Documentation Should Include
- what the anti-pattern looks like
- why it is harmful
- how correct reviewer behavior differs

---

## 12. Examples, Anti-Examples, and Templates

This feature should not stop at abstract role description. It should include teaching and operational assets.

### Must Include
- good example of high-quality review findings
- good example of justified rejection with remediation guidance
- good example of conditional acceptance
- anti-example of vague review
- anti-example of reviewer overreach into implementation
- reusable template(s) for reviewer artifacts
- checklist(s) for structured review execution

### Quality Bar
Examples should be:
- concrete
- realistic
- aligned with repository terminology
- useful for future agent behavior shaping

---

## 13. File / Directory Expectations

The final implementation plan will decide exact file layout, but the feature should anticipate repository outputs such as:

- reviewer skill directories under `.opencode/skills/`
- reviewer artifact templates under appropriate package paths
- examples / anti-examples / checklists
- feature documents under `specs/006-reviewer-core/`
- README and governance updates where feature status changes

The exact names can be adjusted during planning, but the feature must preserve consistency with existing repository conventions.

---

## 14. Acceptance Criteria

`006-reviewer-core` should be considered complete only if all of the following are substantially satisfied:

1. `reviewer` is formalized as an independent review role with explicit boundaries.
2. The three reviewer core skills are implemented and documented.
3. Reviewer artifact contracts are defined and reusable.
4. Upstream inputs from architect, developer, and tester are explicitly integrated.
5. Reviewer decision states are formalized and operationally usable.
6. Validation rules and failure-mode guidance are provided.
7. Examples, anti-examples, templates, and checklists are present.
8. Repository terminology and governance documents remain consistent.
9. Completion reporting is honest about any remaining gaps.
10. The feature is sufficient to support downstream progression toward docs/security roles.

---

## 15. Implementation Planning Expectations

When OpenCode moves to `/spec-plan`, the plan should break this feature into auditable workstreams, likely including:

- reviewer role definition and boundaries
- skill package skeleton and structure
- artifact schema / template design
- upstream integration rules
- decision model implementation
- validation and anti-pattern assets
- examples / teaching assets
- governance and README synchronization

Each workstream should include:
- purpose
- target files
- dependencies
- risks
- definition of done

---

## 16. Task Breakdown Expectations

When OpenCode moves to `/spec-tasks`, tasks should:
- be small and reviewable
- separate core role scaffolding from examples/checklists/docs
- include concrete file targets
- include acceptance checks
- preserve full delivery scope rather than collapsing into a minimal implementation

---

## 17. Audit Expectations

When `/spec-audit` is eventually run after implementation, the audit should verify:
- whether reviewer skills actually exist and are usable
- whether reviewer artifacts are defined and realistic
- whether reviewer boundaries are respected
- whether upstream contracts are explicitly supported
- whether README / completion state matches delivered reality
- whether any completeness claims are overstated
- whether the feature is complete enough to begin `007-docs-core`

---

## 18. Recommended Instruction to OpenCode

Use this document as design intent for `/spec-start`.

Suggested start instruction:

```text
/spec-start

Feature: 006-reviewer-core
Title: Reviewer Core Skills System

Please create a full feature spec for `006-reviewer-core` in this repository.
This is not a minimal bootstrap feature. Build it as a complete first-class reviewer capability system aligned with the 6-role model.

Required goals:
1. Establish `reviewer` as the formal independent review and acceptance-gate role.
2. Implement 3 core reviewer skills:
   - code-review-checklist
   - spec-implementation-diff
   - reject-with-actionable-feedback
3. Define formal reviewer artifacts:
   - review-findings-report
   - acceptance-decision-record
   - actionable-feedback-report
4. Explicitly consume upstream outputs from:
   - `003-architect-core`
   - `004-developer-core`
   - `005-tester-core`
5. Define reviewer decision states and downstream handoff semantics.
6. Enforce strict role boundaries:
   - reviewer does not silently become developer
   - reviewer does not replace tester
   - reviewer focuses on independent judgment, acceptance quality, and actionable rejection
7. Include validation rules, failure modes, examples, anti-examples, and reusable checklists/templates.
8. Keep terminology aligned with the repository governance model and formal 6-role structure.
9. Ensure the resulting spec is rich enough to support `/spec-plan`, `/spec-tasks`, `/spec-implement`, and `/spec-audit`.

Expected output quality:
- full feature package, not a sketch
- explicit artifact contracts
- clear reviewer role boundaries
- auditable acceptance criteria
- honest status language
- downstream-consumable structure

Please create:
`specs/006-reviewer-core/spec.md`
```

