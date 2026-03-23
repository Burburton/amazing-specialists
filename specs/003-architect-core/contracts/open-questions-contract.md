# Open Questions Contract

## Purpose

This contract defines the structure and requirements for documenting open questions within the architect-core package. Open questions capture unresolved design decisions, ambiguities, and uncertainties that require human judgment or additional information to resolve. This contract ensures consistent documentation of uncertainties to prevent knowledge loss and enable systematic resolution.

## Required Fields

Every open question artifact MUST contain the following five fields:

| Field | Type | Required |
|-------|------|----------|
| `question` | string | YES |
| `why_it_matters` | string | YES |
| `temporary_assumption` | string | YES |
| `impact_surface` | string | YES |
| `recommended_next_step` | string | YES |

## Field Specifications

### `question`

**Type:** `string`

**Description:** The unresolved question stated as a clear, specific inquiry.

**Validation Rules:**
- MUST be phrased as a question (ending with `?`)
- MUST be specific enough to be answerable with a definitive response
- MUST NOT contain multiple questions (one concern per artifact)
- SHOULD avoid yes/no questions; prefer questions that elicit reasoning
- MUST NOT exceed 500 characters

**Examples:**
- ✅ `Should the architect-core package directly invoke external MCP servers, or delegate this responsibility to a dedicated orchestration layer?`
- ❌ `MCP integration and error handling` (not a question)
- ❌ `Should we use Redis? And what about caching strategy?` (multiple questions)

### `why_it_matters`

**Type:** `string`

**Description:** Explanation of the impact this unresolved question has on the design, implementation, or downstream consumers.

**Validation Rules:**
- MUST describe concrete consequences of the uncertainty
- MUST identify at least one affected area (design, implementation, testing, deployment, maintenance)
- SHOULD quantify impact where possible (e.g., "affects 3 downstream packages")
- MUST NOT be vague statements like "this is important"
- MUST NOT exceed 1000 characters

**Examples:**
- ✅ `This decision affects the I/O contract boundary between architect-core and developer-core. Without resolution, interface definitions may require breaking changes. Impacts 2 downstream consumers.`
- ❌ `This is critical for the system` (too vague)

### `temporary_assumption`

**Type:** `string`

**Description:** The working assumption adopted to allow development to proceed while the question remains unresolved.

**Validation Rules:**
- MUST state a concrete, actionable assumption
- MUST be consistent with current known constraints
- SHOULD include rationale for why this assumption was chosen
- MUST be reversible (i.e., changing the assumption later should be feasible)
- MUST NOT exceed 1000 characters

**Examples:**
- ✅ `Assumption: architect-core will NOT directly invoke MCP servers. All external tool calls are delegated to a future orchestration layer. Rationale: Maintains separation of concerns and reduces coupling.`
- ❌ `We will figure this out later` (not actionable)

### `impact_surface`

**Type:** `string`

**Description:** Identification of all system components, packages, interfaces, or processes affected by this open question and its resolution.

**Validation Rules:**
- MUST list specific file paths, package names, or interface contracts
- MUST distinguish between direct impacts (will require changes) and indirect impacts (may require changes)
- SHOULD reference specific artifact IDs where applicable (e.g., `AC-001`, `specs/004-developer-core/`)
- MUST be formatted as a list or structured enumeration
- MUST NOT exceed 1500 characters

**Examples:**
- ✅ 
  ```
  Direct impacts:
  - specs/003-architect-core/contracts/orchestration-protocol.md
  - specs/004-developer-core/contracts/execution-interface.md
  
  Indirect impacts:
  - tester-core validation workflows (if orchestration layer changes)
  - reviewer-core gate definitions
  ```
- ❌ `Affects many parts of the system` (not specific)

### `recommended_next_step`

**Type:** `string`

**Description:** Concrete action(s) required to resolve this open question, including suggested owners and timelines where applicable.

**Validation Rules:**
- MUST specify at least one concrete action
- SHOULD identify the responsible role (e.g., `architect`, `reviewer`, `security`)
- SHOULD include suggested timeline or priority (e.g., `before implementation`, `before v1.0`)
- MUST be actionable (someone should be able to execute the step without further clarification)
- MUST NOT exceed 1000 characters

**Examples:**
- ✅ `Action: Schedule architecture review meeting with reviewer-core to evaluate orchestration patterns. Owner: architect-core lead. Timeline: Before developer-core spec finalization ( milestone 004).`
- ❌ `Someone should decide this` (not actionable)

## Consumer Responsibilities

Consumers of open question artifacts include: **human decision makers**, **reviewer**, **developer**, and **future feature planners**.

### All Consumers MUST:
1. Read and understand all open questions relevant to their work scope
2. Acknowledge temporary assumptions before implementing dependent features
3. Reference open question IDs when implementation relies on unresolved decisions
4. Escalate if a temporary assumption conflicts with new information

### Decision Makers MUST:
1. Review open questions assigned to their decision domain
2. Provide resolution within the suggested timeline or escalate delays
3. Document resolution decisions in a linked artifact or comment

### Reviewer MUST:
1. Verify that open questions are properly documented per this contract
2. Block merge if critical open questions lack required fields
3. Track open question resolution status through review cycles

### Developer MUST:
1. Check for open questions before implementing features in affected areas
2. Code defensively around temporary assumptions (isolate assumption-dependent logic)
3. Flag violations if temporary assumptions prove incorrect during implementation

### Future Feature Planners MUST:
1. Review historical open questions when designing related features
2. Update or close resolved questions that were never formally answered
3. Consider unresolved questions as constraints in new feature specs

## Producer Responsibilities

Producers of open question artifacts are primarily the **architect** role within architect-core.

### Architect MUST:
1. Create an open question artifact immediately upon identifying an unresolved decision
2. Populate all five required fields before considering the artifact complete
3. Assign appropriate tags/labels for routing to decision makers
4. Update or close questions as resolutions are made
5. Link open questions to dependent specs, plans, and implementation tasks

### Quality Standards:
- Open questions MUST be created early (at spec/plan phase, not during implementation)
- Each open question MUST have a unique identifier (e.g., `AC-004-OQ-001`)
- Resolved questions MUST be updated with resolution status and reference to decision artifact
- Stale questions (unresolved > 2 sprints) MUST be escalated to package maintainer

## Example Minimal Valid Artifact

```markdown
# Open Question: AC-004-OQ-001

## Question
Should the architect-core package directly invoke external MCP servers, or delegate this responsibility to a dedicated orchestration layer?

## Why It Matters
This decision affects the I/O contract boundary between architect-core and developer-core. Without resolution, interface definitions may require breaking changes. Impacts 2 downstream consumers (developer-core, tester-core).

## Temporary Assumption
Assumption: architect-core will NOT directly invoke MCP servers. All external tool calls are delegated to a future orchestration layer. Rationale: Maintains separation of concerns and reduces coupling.

## Impact Surface
Direct impacts:
- specs/003-architect-core/contracts/orchestration-protocol.md
- specs/004-developer-core/contracts/execution-interface.md

Indirect impacts:
- tester-core validation workflows (if orchestration layer changes)
- reviewer-core gate definitions

## Recommended Next Step
Action: Schedule architecture review meeting with reviewer-core to evaluate orchestration patterns. Owner: architect-core lead. Timeline: Before developer-core spec finalization (milestone 004).

---
Status: Open
Created: 2026-03-23
Resolved: N/A
Resolution: N/A
```

## Quality Checklist

Use this checklist to validate open question artifacts:

- [ ] **Field Completeness**
  - [ ] `question` field present and phrased as a question
  - [ ] `why_it_matters` field present with concrete impact description
  - [ ] `temporary_assumption` field present with actionable assumption
  - [ ] `impact_surface` field present with specific component references
  - [ ] `recommended_next_step` field present with actionable steps

- [ ] **Field Quality**
  - [ ] `question` is specific and answerable (not vague)
  - [ ] `question` addresses single concern (not compound)
  - [ ] `why_it_matters` identifies affected areas concretely
  - [ ] `temporary_assumption` is reversible and documented with rationale
  - [ ] `impact_surface` distinguishes direct vs indirect impacts
  - [ ] `recommended_next_step` has clear owner and timeline

- [ ] **Metadata**
  - [ ] Unique identifier assigned (e.g., `AC-004-OQ-001`)
  - [ ] Creation date recorded
  - [ ] Status tracked (Open / Resolved / Deferred / Escalated)
  - [ ] Resolution fields populated when closed

- [ ] **Integration**
  - [ ] Linked to parent spec/plan where the question originated
  - [ ] Referenced by dependent artifacts that rely on the assumption
  - [ ] Tagged for appropriate decision maker routing

---

**Contract Version:** 1.0  
**Effective Date:** 2026-03-23  
**Owner:** architect-core  
**Consumers:** human decision makers, reviewer, developer, future feature planners
