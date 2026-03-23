# 003-architect-core Downstream Interfaces

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `003-architect-core` |
| **Document Type** | Interface Specification |
| **Version** | 1.0.0 |
| **Created** | 2026-03-23 |
| **Status** | Draft |
| **Owner** | architect |

---

## 1. Overview

### 1.1 Handoff Philosophy

The architect role's primary mission is to **transform feature specifications into executable technical designs** that serve as stable baselines for downstream roles. This document defines the handoff protocols, artifact contracts, and quality expectations for architect-to-downstream role transitions.

**Core Principles:**

1. **Consumability Over Completeness**: Artifacts exist for downstream consumption, not to demonstrate architectural sophistication. Every section must have actionable value for its intended consumers.

2. **Explicit Over Implicit**: All assumptions, decisions, and uncertainties must be explicitly documented. Silent guessing is prohibited.

3. **Traceability**: Each design decision must trace to a requirement or constraint from the input spec. Each artifact must reference its input sources.

4. **Stability**: Once an artifact is delivered, changes must follow the change notification protocol (Section 6) to avoid downstream disruption.

5. **Boundary Respect**: Architect outputs provide design baselines, not implementation details, test cases, review judgments, or security certifications. Role boundaries are explicit.

### 1.2 Handoff Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARCHITECT                                │
│  ┌─────────────────┐  ┌───────────────────┐  ┌──────────────┐  │
│  │ requirement-to  │  │ module-boundary   │  │ tradeoff-    │  │
│  │ design skill    │→ │ design skill      │→ │ analysis     │  │
│  └─────────────────┘  └───────────────────┘  └──────────────┘  │
│           ↓                     ↓                    ↓          │
│  ┌─────────────────┐  ┌───────────────────┐  ┌──────────────┐  │
│  │ design-note     │  │ module-boundaries │  │ risks-and-   │  │
│  │ open-questions  │  │                   │  │ tradeoffs    │  │
│  └─────────────────┘  └───────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ↓                    ↓                    ↓
┌───────────────┐   ┌─────────────────┐   ┌───────────────┐
│  developer    │   │     tester      │   │   reviewer    │
└───────────────┘   └─────────────────┘   └───────────────┘
         ↓                    ↓                    ↓
┌───────────────┐   ┌─────────────────┐
│     docs      │   │    security     │
└───────────────┘   └─────────────────┘
```

---

## 2. Per-Role Interface Definitions

### 2.1 Developer Interface

#### What Architect Provides

| Artifact | Purpose | Priority |
|----------|---------|----------|
| `design-note` | Design baseline with requirement mapping | Required |
| `module-boundaries` | Module responsibilities and dependencies | Required |
| `module-boundaries.integration_seams` | Connection points between modules | Required |
| `design-note.constraints` | Implementation constraints | Required |
| `open-questions` | Unresolved design decisions | Optional |

#### Expected Format/Structure

**design-note:**
```markdown
## Design Summary
[High-level design overview]

## Requirement-to-Design Mapping
| Requirement ID | Design Decision | Rationale |
|----------------|-----------------|-----------|
| REQ-001        | [decision]      | [why]     |

## Constraints
- [Constraint 1]
- [Constraint 2]

## Assumptions
- [Assumption 1]
- [Assumption 2]
```

**module-boundaries:**
```markdown
## Module List
| Module Name | Path | Responsibility |
|-------------|------|----------------|
| [name]      | [path] | [single-sentence responsibility] |

## Module Responsibilities
### [Module Name]
**Does:**
- [Responsibility 1]
- [Responsibility 2]

**Does NOT:**
- [Explicit non-responsibility]

**Inputs:**
- [Input source]

**Outputs:**
- [Output destination]

## Dependencies
[Module A] → [Module B]: [dependency type]

## Integration Seams
### [Seam Name]
**Location:** [file/path or interface name]
**Connected Modules:** [Module A] ↔ [Module B]
**Contract:** [interface signature or contract description]
**Extension Point:** [yes/no, if yes, how]
```

#### Consumption Guidance

**Developer should:**

1. **Start with `design-note.feature_goal`**: Understand what the feature aims to achieve before implementing.

2. **Review `module-boundaries.module_responsibilities`**: Ensure implementation respects module boundaries. Do not add responsibilities to modules without architect consultation.

3. **Check `integration_seams` before coding**: Understand how modules connect. Do not modify integration contracts without architect approval.

4. **Implement within `constraints`**: Respect stated constraints (performance, security, compatibility). If constraints are infeasible, escalate via feedback channel.

5. **Resolve `open-questions`**: For open questions marked as "blocking," request clarification before implementation. For non-blocking questions, implement per `temporary_assumption` and mark code for later revision.

**Developer should NOT:**

1. Redesign module boundaries without escalation
2. Ignore non-goals in design-note
3. Assume unstated requirements
4. Modify integration seams without architect sign-off

#### Feedback Channels

| Issue Type | Channel | Response Time |
|------------|---------|---------------|
| Clarification request | Comment on artifact or @architect mention | Within task cycle |
| Constraint infeasibility | Escalate to reviewer + architect | Immediate |
| Boundary ambiguity | @architect mention with specific question | Within task cycle |
| Open question resolution | Comment on open-questions document | Within task cycle |
| Design change request | Formal RFC to architect + reviewer | Next review cycle |

---

### 2.2 Tester Interface

#### What Architect Provides

| Artifact | Purpose | Priority |
|----------|---------|----------|
| `module-boundaries.module_list` | Module divisions for test organization | Required |
| `module-boundaries.integration_seams` | Integration test targets | Required |
| `design-note.constraints` | Constraint validation points | Required |
| `risks-and-tradeoffs.risks_introduced` | Risk areas requiring testing | Required |
| `design-note.assumptions` | Assumptions requiring validation | Required |

#### Expected Format/Structure

**module-boundaries for tester:**
```markdown
## Module Divisions
[Clear module boundaries for test scoping]

## Critical Paths
| Path ID | Flow Description | Modules Involved | Risk Level |
|---------|-----------------|------------------|------------|
| CP-001  | [description]   | [A, B, C]        | High/Med/Low |

## Boundary Conditions
| Module | Input Boundary | Output Boundary | Edge Cases |
|--------|---------------|-----------------|------------|
| [name] | [min/max/valid] | [expected]      | [edges]    |

## Integration Seams
[All integration points for integration test planning]
```

**risks-and-tradeoffs for tester:**
```markdown
## Risk Areas
| Risk ID | Description | Affected Modules | Test Implication |
|---------|-------------|------------------|------------------|
| RISK-001 | [description] | [modules] | [what to test] |
```

#### Consumption Guidance

**Tester should:**

1. **Use `module_list` for test organization**: Structure test suites to align with module boundaries.

2. **Prioritize `critical_paths`**: Ensure all marked critical paths have test coverage.

3. **Validate `boundary_conditions`**: Test input/output boundaries for each module.

4. **Focus on `integration_seams`**: Design integration tests for all marked seams.

5. **Scrutinize `risks_introduced`**: Design tests specifically for identified risks.

6. **Validate `assumptions`**: Create tests that verify assumptions hold true.

**Tester should NOT:**

1. Assume module boundaries are final without verification
2. Skip testing for areas marked as "low risk" without justification
3. Test implementation details (defer to developer unit tests)

#### Feedback Channels

| Issue Type | Channel | Response Time |
|------------|---------|---------------|
| Missing test boundary | @architect mention | Within task cycle |
| Unclear integration seam | Comment on module-boundaries | Within task cycle |
| Risk area dispute | @architect + @reviewer | Next review cycle |
| Assumption invalidation | Immediate escalation | Immediate |

---

### 2.3 Reviewer Interface

#### What Architect Provides

| Artifact | Purpose | Priority |
|----------|---------|----------|
| `risks-and-tradeoffs` | Decision rationale and alternatives | Required |
| `design-note.assumptions` | Explicit assumptions | Required |
| `design-note.open_questions` | Unresolved questions | Required |
| `module-boundaries.future_extension_boundary` | Scope boundaries | Required |
| `design-note.requirement_to_design_mapping` | Traceability | Required |

#### Expected Format/Structure

**risks-and-tradeoffs:**
```markdown
## Decision Point: [decision name]
**Alternatives Considered:**
1. [Alternative A]
   - Pros: [list]
   - Cons: [list]
2. [Alternative B]
   - Pros: [list]
   - Cons: [list]

**Selected Approach:** [chosen approach]

**Tradeoff Rationale:**
[Why this approach was selected over alternatives]

**Risks Introduced:**
- [Risk 1 with mitigation]
- [Risk 2 with mitigation]

**Revisit Trigger:**
[Conditions under which this decision should be re-evaluated]
```

**design-note mapping:**
```markdown
## Requirement-to-Design Mapping
| Requirement | Design Decision | Evidence |
|-------------|-----------------|----------|
| [REQ-ID]    | [decision]      | [rationale/section ref] |
```

#### Consumption Guidance

**Reviewer should:**

1. **Verify `tradeoff_rationale`**: Ensure alternatives were genuinely considered and rationale is sound.

2. **Check `requirement_to_design_mapping`**: Confirm all requirements have corresponding design decisions.

3. **Evaluate `assumptions`**: Assess whether assumptions are reasonable and documented.

4. **Review `open_questions`**: Determine if open questions are acceptable or blocking.

5. **Validate `scope_boundaries`**: Ensure future extension boundaries are clear and reasonable.

6. **Assess cross-artifact consistency**: Verify design-note, module-boundaries, and risks-and-tradeoffs are internally consistent.

**Reviewer should NOT:**

1. Redesign without explicit architect role boundary violation
2. Require elimination of all risks (evaluate mitigations instead)
3. Reject for stylistic preferences without substantive issues

#### Feedback Channels

| Issue Type | Channel | Response Time |
|------------|---------|---------------|
| Design quality issue | Formal review comment | Next review cycle |
| Missing rationale | Review comment on specific section | Next review cycle |
| Role boundary violation | Escalation to package owner | Immediate |
| Inconsistency between artifacts | Review comment with cross-refs | Next review cycle |

---

### 2.4 Docs Interface

#### What Architect Provides

| Artifact | Purpose | Priority |
|----------|---------|----------|
| `module-boundaries.module_responsibilities` | Module summaries for documentation | Required |
| `design-note.design_summary` | Key structure explanations | Required |
| `design-note.open_questions.terminology` | Design terminology definitions | Optional |
| `risks-and-tradeoffs.decision_point` | Key decisions to document | Optional |

#### Expected Format/Structure

**Module responsibility summary:**
```markdown
## Module: [Module Name]
**One-sentence purpose:** [elevator pitch]

**Responsibilities:**
- [Responsibility 1]
- [Responsibility 2]

**Key interfaces:**
- [Interface 1]: [description]

**Design terminology:**
- [Term 1]: [definition as used in this design]
- [Term 2]: [definition]
```

#### Consumption Guidance

**Docs should:**

1. **Extract `module_responsibilities` for API docs**: Use as basis for module-level documentation.

2. **Expand `design_summary` for architecture docs**: Transform into user-facing architecture documentation.

3. **Standardize `terminology`**: Ensure consistent terminology across all documentation.

4. **Document `key_decisions`**: Include major design decisions in architecture decision records (ADRs).

**Docs should NOT:**

1. Change design terminology without architect consultation
2. Document implementation details (defer to developer comments)
3. Speculate on unresolved design questions

#### Feedback Channels

| Issue Type | Channel | Response Time |
|------------|---------|---------------|
| Terminology clarification | @architect mention | Within task cycle |
| Missing documentation context | Comment on artifact | Next doc cycle |
| Ambiguous responsibility | @architect mention | Within task cycle |

---

### 2.5 Security Interface

#### What Architect Provides

| Artifact | Purpose | Priority |
|----------|---------|----------|
| `module-boundaries.dependency_directions` | Dependency/boundary info | Required |
| `design-note.constraints` | High-risk boundary hints | Required |
| `risks-and-tradeoffs.risks_introduced` | Security-relevant risks | Required |
| `module-boundaries.integration_seams` | Trust boundary notes | Required |

#### Expected Format/Structure

**Security-relevant sections:**
```markdown
## Trust Boundaries
| Boundary | From Module | To Module | Trust Level | Security Implication |
|----------|-------------|-----------|-------------|---------------------|
| [name]   | [Module A]  | [Module B] | [high/med/low] | [implication] |

## High-Risk Boundaries
| Boundary | Risk Type | Mitigation | Validation Status |
|----------|-----------|------------|-------------------|
| [name]   | [e.g., injection, auth bypass] | [mitigation] | [pending/validated] |

## Dependencies
| Module | External Dependencies | Security Review Status |
|--------|----------------------|----------------------|
| [name] | [dependency list]    | [pending/completed]  |
```

#### Consumption Guidance

**Security should:**

1. **Audit `trust_boundaries`**: Verify trust levels are appropriate and enforced.

2. **Review `high_risk_boundaries`**: Validate mitigations for identified security risks.

3. **Assess `dependency_directions`**: Identify potential supply chain or dependency risks.

4. **Scrutinize `integration_seams`**: Ensure security contracts are defined at module boundaries.

5. **Evaluate `constraints`**: Verify security constraints are explicit and enforceable.

**Security should NOT:**

1. Assume architect has performed security audit (architect provides hints, not certifications)
2. Redesign without explicit security vulnerability
3. Approve without independent security analysis

#### Feedback Channels

| Issue Type | Channel | Response Time |
|------------|---------|---------------|
| Security vulnerability | Immediate escalation to architect + reviewer | Immediate |
| Missing trust boundary | Review comment | Next review cycle |
| Inadequate mitigation | @architect + @reviewer | Next review cycle |
| Dependency risk | Comment on module-boundaries | Within task cycle |

---

## 3. Artifact-to-Role Mapping Matrix

| Artifact | Section | developer | tester | reviewer | docs | security |
|----------|---------|:---------:|:------:|:--------:|:----:|:--------:|
| **design-note** | background | ○ | ○ | ● | ● | ○ |
| | feature_goal | ● | ● | ● | ● | ○ |
| | input_sources | ○ | ○ | ● | ○ | ○ |
| | requirement_to_design_mapping | ● | ● | ● | ○ | ○ |
| | design_summary | ● | ○ | ● | ● | ○ |
| | constraints | ● | ● | ○ | ○ | ● |
| | non_goals | ● | ○ | ● | ○ | ○ |
| | assumptions | ● | ● | ● | ○ | ● |
| | open_questions | ● | ● | ● | ● | ● |
| **module-boundaries** | module_list | ● | ● | ○ | ● | ○ |
| | module_responsibilities | ● | ○ | ○ | ● | ○ |
| | inputs_outputs | ● | ● | ○ | ○ | ● |
| | dependency_directions | ● | ○ | ● | ○ | ● |
| | integration_seams | ● | ● | ○ | ○ | ● |
| | future_extension_boundary | ● | ○ | ● | ○ | ○ |
| | explicit_non_responsibilities | ● | ○ | ● | ○ | ○ |
| **risks-and-tradeoffs** | decision_point | ○ | ○ | ● | ○ | ○ |
| | alternatives_considered | ○ | ○ | ● | ○ | ○ |
| | selected_approach | ● | ○ | ● | ● | ○ |
| | rejected_approaches | ○ | ○ | ● | ○ | ○ |
| | tradeoff_rationale | ○ | ○ | ● | ○ | ○ |
| | risks_introduced | ● | ● | ● | ○ | ● |
| | revisit_trigger | ● | ○ | ● | ○ | ○ |
| **open-questions** | question | ● | ● | ● | ● | ● |
| | why_it_matters | ● | ● | ● | ● | ● |
| | temporary_assumption | ● | ● | ● | ○ | ● |
| | impact_surface | ● | ● | ○ | ○ | ● |
| | recommended_next_step | ● | ○ | ● | ○ | ● |

**Legend:**
- ● = Primary consumer (directly uses this section)
- ○ = Secondary consumer (may reference this section)

---

## 4. Quality Requirements Per Interface

### 4.1 Developer Interface Quality Gates

| Quality Gate | Criteria | Validation Method |
|--------------|----------|-------------------|
| **Completeness** | All required sections present | Checklist validation |
| **Clarity** | No ambiguous module boundaries | Peer review by developer |
| **Actionability** | Can implement without redesign | Implementation dry-run |
| **Traceability** | All requirements mapped to design | Traceability matrix review |
| **Constraint validity** | Constraints are implementable | Developer feasibility check |

**Minimum Acceptable Quality:**
- All required fields populated
- Module boundaries have clear responsibilities
- Integration seams have defined contracts
- No hidden assumptions
- Non-goals explicitly stated

### 4.2 Tester Interface Quality Gates

| Quality Gate | Criteria | Validation Method |
|--------------|----------|-------------------|
| **Testability** | All modules have testable boundaries | Tester review |
| **Coverage clarity** | Critical paths are explicit | Test plan alignment |
| **Risk visibility** | All risks have test implications | Risk-to-test mapping |
| **Boundary definition** | Input/output boundaries are clear | Edge case derivation test |

**Minimum Acceptable Quality:**
- Module list complete and unambiguous
- Critical paths identified
- Integration seams marked
- Risk areas flagged with test implications
- Assumptions callable for validation

### 4.3 Reviewer Interface Quality Gates

| Quality Gate | Criteria | Validation Method |
|--------------|----------|-------------------|
| **Rationale completeness** | All key decisions have alternatives | Document audit |
| **Tradeoff transparency** | Costs documented, not just benefits | Rationale review |
| **Assumption visibility** | All assumptions explicit | Assumption extraction test |
| **Scope clarity** | Boundaries between in/out scope clear | Scope boundary test |
| **Consistency** | Cross-artifact consistency | Cross-reference audit |

**Minimum Acceptable Quality:**
- All major decisions have documented alternatives
- Tradeoffs include costs and revisit triggers
- Assumptions and facts distinguished
- Open questions explicitly marked
- Internal consistency across all artifacts

### 4.4 Docs Interface Quality Gates

| Quality Gate | Criteria | Validation Method |
|--------------|----------|-------------------|
| **Terminology consistency** | Terms defined and used consistently | Terminology extraction |
| **Responsibility clarity** | Module responsibilities documentable | Documentation draft test |
| **Decision traceability** | Key decisions are explainable | ADR completeness check |

**Minimum Acceptable Quality:**
- Module responsibilities are summarizable
- Design terminology is defined
- Key structures are explainable
- No contradictions between artifacts

### 4.5 Security Interface Quality Gates

| Quality Gate | Criteria | Validation Method |
|--------------|----------|-------------------|
| **Trust boundary visibility** | All trust boundaries marked | Security boundary audit |
| **Risk hint completeness** | High-risk areas flagged | Security risk review |
| **Dependency transparency** | External dependencies listed | Dependency audit |
| **Integration contract security** | Security contracts at seams | Interface security review |

**Minimum Acceptable Quality:**
- Trust boundaries explicitly marked
- High-risk areas flagged
- Dependencies listed
- Integration seams have security considerations noted

---

## 5. Version Compatibility Expectations

### 5.1 Versioning Scheme

Architect artifacts follow semantic versioning:

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes requiring downstream rework
- **MINOR**: Non-breaking additions or enhancements
- **PATCH**: Clarifications, typo fixes, non-substantive changes

### 5.2 Compatibility Matrix

| Architect Version | Developer | Tester | Reviewer | Docs | Security |
|-------------------|-----------|--------|----------|------|----------|
| 1.0.x | 1.0.x | 1.0.x | 1.0.x | 1.0.x | 1.0.x |
| 1.MINOR.x | Compatible | Compatible | Compatible | Compatible | Compatible |
| 2.0.x | May require update | May require update | May require update | May require update | May require update |

### 5.3 Breaking Change Definition

**MAJOR version changes (breaking):**
- Removal of required artifact sections
- Change to integration seam contracts
- Modification of module boundaries
- Change to trust boundary definitions
- Removal of documented constraints

**MINOR version changes (non-breaking):**
- Addition of new optional sections
- Clarification of existing sections
- Addition of new modules (without modifying existing)
- Addition of new open questions

**PATCH version changes:**
- Typo corrections
- Formatting changes
- Clarification without substantive change
- Grammar improvements

### 5.4 Downstream Role Version Lock

| Role | Version Lock Policy |
|------|---------------------|
| developer | Lock to MAJOR version; MINOR updates auto-accepted |
| tester | Lock to MAJOR version; MINOR updates auto-accepted |
| reviewer | Lock to MAJOR version; tracks all updates |
| docs | Lock to MAJOR version; MINOR updates auto-accepted |
| security | Lock to MAJOR version; tracks all updates |

---

## 6. Change Notification Protocol

### 6.1 Change Classification

| Change Type | Impact | Notification Required | Approval Required |
|-------------|--------|----------------------|-------------------|
| **Breaking** | Requires downstream rework | All consumers | Architect + Reviewer |
| **Non-breaking** | No rework required | Primary consumers | Architect |
| **Clarification** | No functional change | Optional | None |

### 6.2 Notification Workflow

```
┌─────────────────┐
│ Change Request  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Classify Change │ (Breaking / Non-breaking / Clarification)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Update Artifact │ (Increment version per Section 5)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Notify Consumers│ (Per notification matrix below)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Track Adoption  │ (Monitor downstream acknowledgment)
└─────────────────┘
```

### 6.3 Notification Matrix

| Change Type | developer | tester | reviewer | docs | security |
|-------------|:---------:|:------:|:--------:|:----:|:--------:|
| **Breaking** | @mention + email | @mention + email | @mention + email | @mention | @mention + email |
| **Non-breaking** | @mention | @mention | @mention | Optional | @mention |
| **Clarification** | Artifact comment | Artifact comment | Artifact comment | - | Artifact comment |

### 6.4 Notification Template

```markdown
## Architect Artifact Change Notification

**Artifact:** [artifact name]
**Version:** [old version] → [new version]
**Change Type:** [Breaking / Non-breaking / Clarification]
**Date:** [YYYY-MM-DD]

### Summary
[Brief description of what changed]

### Affected Sections
- [Section 1]: [description of change]
- [Section 2]: [description of change]

### Impact Assessment
| Role | Impact | Action Required |
|------|--------|-----------------|
| developer | [High/Medium/Low/None] | [action if any] |
| tester | [High/Medium/Low/None] | [action if any] |
| reviewer | [High/Medium/Low/None] | [action if any] |
| docs | [High/Medium/Low/None] | [action if any] |
| security | [High/Medium/Low/None] | [action if any] |

### Rationale
[Why this change was made]

### Questions
[Contact for questions about this change]

### Acknowledgment Required
- [ ] developer acknowledges
- [ ] tester acknowledges
- [ ] reviewer acknowledges
- [ ] docs acknowledges (if applicable)
- [ ] security acknowledges (if applicable)
```

### 6.5 Emergency Change Protocol

For urgent changes (security vulnerabilities, critical blockers):

1. **Immediate notification** via highest-priority channel (e.g., direct message, call)
2. **Artifact update** follows within 24 hours
3. **Formal notification** per Section 6.4 follows artifact update
4. **Post-incident review** required for all emergency changes

---

## 7. Feedback and Iteration

### 7.1 Feedback Collection

| Feedback Type | Collection Method | Review Frequency |
|---------------|-------------------|------------------|
| Consumability issues | Artifact comments, @mentions | Per task cycle |
| Quality concerns | Formal review comments | Per review cycle |
| Process improvements | Retrospective input | Per feature completion |
| Role boundary disputes | Escalation to package owner | Immediate |

### 7.2 Iteration Triggers

Architect artifacts should be revised when:

1. **Downstream blockers**: Multiple downstream roles report inability to proceed
2. **Requirement changes**: Spec updates require design changes
3. **Discovery during implementation**: New information invalidates assumptions
4. **Review rejection**: Reviewer identifies substantive issues
5. **Security concerns**: Security identifies vulnerabilities in design

### 7.3 Revision History Tracking

All revisions must be tracked:

```markdown
## Revision History
| Version | Date | Author | Changes | Approval |
|---------|------|--------|---------|----------|
| 1.0.0 | 2026-03-23 | [author] | Initial release | - |
| 1.0.1 | 2026-03-XX | [author] | [description] | [approver] |
```

---

## 8. Escalation Paths

### 8.1 Escalation Hierarchy

```
Level 1: Direct @architect mention
         ↓ (unresolved after 1 task cycle)
Level 2: @architect + @reviewer mention
         ↓ (unresolved after 1 review cycle)
Level 3: Package owner escalation
         ↓ (unresolved after 2 days)
Level 4: Project leadership escalation
```

### 8.2 Escalation Triggers

| Issue | Escalation Level | Path |
|-------|------------------|------|
| Clarification request | Level 1 | @architect |
| Boundary ambiguity | Level 1 | @architect |
| Constraint infeasibility | Level 2 | @architect + @reviewer |
| Role boundary violation | Level 3 | Package owner |
| Security vulnerability | Level 2 (immediate) | @architect + @reviewer |
| Design quality dispute | Level 2 | @architect + @reviewer |
| Change notification dispute | Level 3 | Package owner |

---

## 9. Appendix: Interface Checklist

### 9.1 Pre-Handoff Checklist (Architect)

Before delivering artifacts to downstream roles:

- [ ] All required fields populated per artifact contract
- [ ] Requirement-to-design mapping complete
- [ ] Module boundaries have clear responsibilities
- [ ] Integration seams defined
- [ ] Assumptions explicitly marked
- [ ] Open questions documented
- [ ] Tradeoffs include alternatives and rationale
- [ ] Risks identified with mitigations
- [ ] Non-goals preserved
- [ ] Cross-artifact consistency verified
- [ ] Version numbers assigned
- [ ] Change notification prepared (if revision)

### 9.2 Post-Handoff Checklist (Downstream Roles)

After receiving architect artifacts:

**Developer:**
- [ ] Reviewed design-note.feature_goal
- [ ] Understood module boundaries
- [ ] Identified integration seams
- [ ] Verified constraint feasibility
- [ ] Flagged open questions needing resolution

**Tester:**
- [ ] Mapped test suites to module boundaries
- [ ] Identified critical paths
- [ ] Designed integration tests for seams
- [ ] Created tests for risk areas
- [ ] Validated assumptions testable

**Reviewer:**
- [ ] Verified tradeoff rationale
- [ ] Checked requirement-to-design mapping
- [ ] Evaluated assumptions
- [ ] Assessed open questions
- [ ] Validated cross-artifact consistency

**Docs:**
- [ ] Extracted module responsibilities
- [ ] Standardized terminology
- [ ] Identified key decisions for ADRs
- [ ] Flagged documentation gaps

**Security:**
- [ ] Audited trust boundaries
- [ ] Reviewed high-risk areas
- [ ] Assessed dependency risks
- [ ] Validated integration seam security

---

## 10. References

- `spec.md` - Section "Downstream Consumers"
- `package-spec.md` - Package governance specification
- `role-definition.md` - 6-role formal definitions
- `io-contract.md` - Input/output contract specifications
- `quality-gate.md` - Quality gate rules
- `collaboration-protocol.md` - Role collaboration protocols
