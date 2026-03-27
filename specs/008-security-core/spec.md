# 008-security-core Feature Specification

## Document Status
- **Feature ID**: `008-security-core`
- **Feature Name**: Security Core Skills System
- **Version**: 1.0.0
- **Status**: ✅ Complete
- **Created**: 2026-03-27
- **Completed**: 2026-03-27
- **Authoring Intent**: Full-feature specification for OpenCode-driven implementation, not a minimal bootstrap

---

## 1. Background

### 1.1 Context

The repository has established five formal execution roles in the 6-role model:

- `003-architect-core`: Transforms requirements into design notes, module boundaries, and trade-off guidance
- `004-developer-core`: Transforms design into code changes, implementation summaries, self-check reports, and bugfix reports
- `005-tester-core`: Transforms implementation claims into verifiable evidence with test scope, verification reports, and regression analysis
- `006-reviewer-core`: Performs independent quality review with findings reports, acceptance decision records, and actionable feedback
- `007-docs-core`: Synchronizes repository-level documentation with implementation state

The final missing first-class capability in the 6-role MVP is `security`.

In the intended execution chain:

```text
architect (design) → developer (implement) → tester (verify) → security (high-risk review) → reviewer (independent judgment) → docs (documentation sync)
```

`security` is the role that provides **security-focused review of authentication, authorization, permission boundaries, and input validation**.

Without a complete security-core system, the expert package has the following structural gaps:

1. Security-sensitive changes lack a standardized review path
2. The 6-role formal execution model remains incomplete
3. No reusable security review methodology exists for AI execution agents
4. Repository contains planning drift about security scope definition

### 1.2 Problem Statement

Without `008-security-core`, the expert package has the following issues:

1. **No formal security review capability**
   High-risk authentication, authorization, and input handling changes lack structured security assessment.

2. **Incomplete role model**
   The `security` role remains a placeholder rather than an implemented, validated capability.

3. **No security artifact contracts**
   No standardized outputs exist for security findings, risk classification, or remediation guidance.

4. **Pre-existing skill validation needed**
   Two security skills already exist (`auth-and-permission-review` and `input-validation-review`) but need validation against the quality bar established by 003-007.

5. **No actionable security guidance**
   Without structured outputs, security concerns risk becoming vague warnings without concrete remediation.

### 1.3 Prior Work

This feature builds on:

- `002-role-model-alignment`
- `002b-governance-repair`
- `003-architect-core`
- `004-developer-core`
- `005-tester-core`
- `006-reviewer-core`
- `007-docs-core`

In particular:
- `004-developer-core` provides implementation artifacts for security review
- `005-tester-core` provides verification artifacts
- `006-reviewer-core` provides review methodology patterns

This means `008-security-core` should be designed as a **parallel review capability to reviewer**, focused specifically on security risk surfaces.

### 1.4 Pre-existing Assets

The following security skills already exist in the repository:

| Skill | Path | Status |
|-------|------|--------|
| `auth-and-permission-review` | `.opencode/skills/security/auth-and-permission-review/` | Implemented |
| `input-validation-review` | `.opencode/skills/security/input-validation-review/` | Implemented |

This feature validates existing implementations against the quality bar established by 003-007 and completes the formal feature documentation.

---

## 2. Goal

Establish `security` as a first-class security review role with:

1. **Complete capability system**
   2 core skills with full supporting assets and explicit role boundaries.

2. **Stable security artifacts**
   Structured outputs (security-review-report, input-validation-review-report) that can be consumed by developers, reviewers, and maintainers.

3. **Actionable findings**
   Security outputs must include affected surface, severity, concrete rationale, and remediation guidance.

4. **MVP boundary clarity**
   Explicitly define what is in MVP scope vs. future backlog.

5. **Governance alignment**
   Resolve the scope mismatch between README and `skill-development-plan.md`.

6. **Full educational packaging**
   Each security skill must include SKILL.md, examples, checklists, and validation criteria.

This feature is **not** a minimal placeholder. It validates and formalizes existing security capabilities to match the quality bar of completed role-core features.

---

## 3. Scope

### 3.1 In Scope

#### A. Role Boundary Layer

Define security role scope precisely:

- What security must do
- What security may do
- What security must never do
- What security escalates instead of deciding alone

This includes explicit boundaries against:

- Security attempting to fix implementation code (escalate to developer)
- Security declaring feature acceptance (reviewer role)
- Security reviewing non-security aspects (reviewer role)

#### B. Core Skills Layer (2 skills)

| Skill | Purpose |
|-------|---------|
| `auth-and-permission-review` | Review authentication, authorization, identity boundaries, and permission-related changes |
| `input-validation-review` | Review input handling, validation logic, and injection/XSS/path traversal vulnerabilities |

#### C. Artifact Contract Layer (2 artifacts)

| Artifact | Purpose |
|----------|---------|
| `security-review-report` | Primary structured security findings report from auth-and-permission-review |
| `input-validation-review-report` | Structured input validation findings from input-validation-review |

#### D. Quality and Validation Layer

The feature must define:

- Finding severity classification model
- Evidence grounding requirements
- Remediation actionability standards
- Gate decision semantics (pass / needs-fix / block)
- Cross-skill consistency

#### E. Educational and Example Layer

Each security skill must include:

- `SKILL.md` with checklists
- Positive examples
- Boundary examples
- Anti-pattern / failed examples

#### F. Interface Layer

Define:

- How security consumes implementation artifacts
- How security hands off to developer and reviewer
- How security reports blocked states

#### G. Governance Alignment Layer

Update repository documentation to resolve scope mismatch:

- Align `skill-development-plan.md` with README's 2-skill MVP definition
- Move `secret-handling-review` and `dependency-risk-review` to M4 backlog

### 3.2 Out of Scope

1. `secret-handling-review` skill (deferred to M4 / future feature)
2. `dependency-risk-review` skill (deferred to M4 / future feature)
3. Threat modeling framework expansion
4. Enterprise compliance mappings
5. Runtime security enforcement
6. Automated vulnerability scanning tool integration
7. Redesign of existing security skill implementations

---

## 4. Actors

### 4.1 Primary Actor: security

**Mission**: Review proposed or implemented changes for security risks related to authentication, authorization, permission boundaries, and input validation, producing structured, actionable security feedback.

**Responsibilities**:

- Review authentication and authorization logic for vulnerabilities
- Check permission boundary enforcement
- Identify missing authorization checks
- Detect privilege escalation risks
- Review input validation and sanitization
- Identify injection, XSS, and path traversal vulnerabilities
- Produce structured security findings with severity classification
- Provide actionable remediation guidance
- Make gate decisions (pass / needs-fix / block)

**Non-Responsibilities**:

- Modifying implementation code (escalate to developer)
- Declaring feature acceptance (reviewer role)
- Reviewing non-security aspects like code style or architecture
- Running automated vulnerability scans (tool integration, not skill)

### 4.2 Upstream Providers

Security must formally consume the following artifacts:

#### From `004-developer-core`:

| Upstream Artifact | Purpose for Security |
|-------------------|----------------------|
| `implementation-summary` | Understand what changed |
| `changed files` | Identify security-relevant code |
| `self-check-report` | Understand known issues |

#### From `005-tester-core`:

| Upstream Artifact | Purpose for Security |
|-------------------|----------------------|
| `verification-report` | Confirm what was tested |

#### From Feature Context:

| Source | Purpose for Security |
|--------|----------------------|
| `spec.md` | Understand feature requirements |
| `task risk level` | Determine if security review required |

### 4.3 Downstream Consumers

| Consumer | Consumes |
|----------|----------|
| Developer | Security findings for remediation |
| Reviewer | Security gate decision |
| OpenClaw management layer | security-review-report for acceptance verification |

### 4.4 Relationship with reviewer Role

| Aspect | reviewer | security |
|--------|----------|----------|
| Focus | Overall implementation quality, spec alignment | Security-specific risk surfaces |
| Gate Authority | Final acceptance decision | Security gate decision (pass/needs-fix/block) |
| Scope | All changes | Authentication, authorization, input handling, high-risk tasks |
| Finding Type | Code quality, spec drift, maintainability | Vulnerabilities, security risks |

---

## 5. Core Workflows

### 5.1 Workflow 1: Standard Security Review

```text
high-risk task signaled
  → consume implementation artifacts
    → identify security-relevant code
      → execute auth-and-permission-review OR input-validation-review
        → generate security-review-report
          → gate decision (pass / needs-fix / block)
            → handoff to reviewer or escalate to developer
```

### 5.2 Workflow 2: Auth and Permission Review

```text
auth/permission-related changes detected
  → identify authentication code
  → identify authorization checks
  → identify permission boundaries
    → check for:
      - authentication bypass
      - authorization bypass
      - privilege escalation
      - IDOR vulnerabilities
    → generate findings with severity
    → provide remediation guidance
      → gate decision
```

### 5.3 Workflow 3: Input Validation Review

```text
input-handling changes detected
  → identify input sources
  → identify validation logic
  → identify data sinks
    → check for:
      - missing validation
      - SQL injection
      - XSS
      - path traversal
      - command injection
    → generate findings with severity
    → provide remediation guidance
      → gate decision
```

### 5.4 Workflow 4: Blocked Security Review

```text
insufficient implementation context
or
critical vulnerability found
  → document blocker
    → classify issue type
      → escalate to developer or reviewer
```

---

## 6. Business Rules

### BR-001: Security Must Be Actionable

Every security finding must include:
- Affected location
- Severity classification
- Concrete rationale
- Remediation guidance

**Implication**: Vague "this may be insecure" statements without specifics are insufficient.

### BR-002: Evidence-Based Findings

Security findings must be grounded in actual code, not speculation.

**Implication**: No theoretical vulnerabilities without code evidence.

### BR-003: Gate Decision Required

Every security review must produce a gate decision: pass, needs-fix, or block.

**Implication**: No "reviewed but no conclusion" states.

### BR-004: Severity Classification

Findings must use severity levels: critical, high, medium, low, info.

**Implication**: All findings must be classified for prioritization.

### BR-005: MVP Boundary Discipline

`secret-handling-review` and `dependency-risk-review` are explicitly out of MVP scope.

**Implication**: These skills are documented as backlog, not implemented.

### BR-006: No Code Modification

Security role produces findings only, not code changes.

**Implication**: If code changes needed, escalate to developer.

### BR-007: Parallel to Reviewer

Security runs in parallel with reviewer for high-risk tasks, providing security-specific input.

**Implication**: Security gate decision informs but does not replace reviewer acceptance decision.

### BR-008: High-Risk Task Trigger

Security review is mandatory for:
- Authentication-related changes
- Authorization/permission changes
- Input handling changes
- Tasks marked as high-risk

**Implication**: These task types require security review in the execution flow.

---

## 7. Artifact Contracts

### AC-001: security-review-report

**Purpose**: Primary structured security findings report from auth-and-permission-review.

**Required Fields**:

| Field | Description |
|-------|-------------|
| `scope` | Components and mechanisms reviewed |
| `findings` | List of security findings with severity |
| `risk_assessment` | Overall risk level |
| `gate_decision` | pass / needs-fix / block |
| `recommendations` | must_fix / should_fix / consider |

**Finding Structure**:

| Field | Description |
|-------|-------------|
| `id` | Unique finding identifier |
| `severity` | critical / high / medium / low / info |
| `category` | authentication / authorization / session / transport / logging |
| `title` | Brief finding title |
| `description` | Detailed description |
| `location` | File and line number |
| `vulnerability` | Vulnerability type, CWE, OWASP reference |
| `impact` | Description of potential impact |
| `remediation` | Recommendation and code example |

**Primary Consumers**: Developer, reviewer, OpenClaw management layer

---

### AC-002: input-validation-review-report

**Purpose**: Structured input validation findings from input-validation-review.

**Required Fields**:

| Field | Description |
|-------|-------------|
| `scope` | Input sources reviewed |
| `findings` | List of validation findings with severity |
| `validation_coverage` | Coverage statistics |
| `risk_assessment` | Overall risk level |
| `gate_decision` | pass / needs-fix / block |

**Finding Structure**:

| Field | Description |
|-------|-------------|
| `id` | Unique finding identifier |
| `severity` | critical / high / medium / low |
| `category` | sql_injection / xss / command_injection / path_traversal / missing_validation |
| `input` | Source and parameter affected |
| `vulnerability` | Vulnerability type, CWE, OWASP reference |
| `vulnerable_code` | Location and snippet |
| `remediation` | Recommendation and secure code example |

**Primary Consumers**: Developer, reviewer

---

## 8. Skill Definitions

### SKILL-001: auth-and-permission-review

**Goal**: Review authentication, authorization, identity boundaries, and permission-related changes for security vulnerabilities.

**Inputs**:
- `changed files` (required)
- `implementation-summary` (required)
- `task risk level` (required)

**Outputs**:
- `security-review-report`

**Required Actions**:
1. Identify authentication-related code
2. Check credential storage mechanisms
3. Check authentication flow security
4. Check token/session management
5. Identify authorization checks
6. Check permission boundary enforcement
7. Detect IDOR vulnerabilities
8. Check for privilege escalation risks
9. Generate structured findings
10. Provide remediation guidance
11. Make gate decision

**Quality Standards**:
- Every finding must have severity, location, and remediation
- Must use CWE/OWASP references where applicable
- Must distinguish between must-fix and should-fix

**Failure Modes**:
- Vague findings without location
- Missing severity classification
- No remediation guidance
- Declaring "secure" without evidence

---

### SKILL-002: input-validation-review

**Goal**: Review input handling and validation logic for injection, XSS, path traversal, and related vulnerabilities.

**Inputs**:
- `changed files` (required)
- `implementation-summary` (required)
- `task risk level` (required)

**Outputs**:
- `input-validation-review-report`

**Required Actions**:
1. Identify all input sources
2. Trace data flow from input to sink
3. Check type validation
4. Check format validation
5. Check SQL query construction
6. Check output encoding (XSS)
7. Check file path handling
8. Check command execution
9. Generate structured findings
10. Provide remediation guidance
11. Make gate decision

**Quality Standards**:
- Every finding must have exploit scenario
- Must provide secure code example
- Must distinguish between missing validation and insufficient validation

**Failure Modes**:
- Missing input sources
- Not checking all data sinks
- Generic "validate inputs" without specifics

---

## 9. Validation Model

### VM-001: Skill-Level Validation

```yaml
validation_checklist:
  skill_level:
    - [ ] inputs_defined: true
    - [ ] outputs_complete: true
    - [ ] checklists_exist: true
    - [ ] examples_exist: true
    - [ ] role_boundaries_clear: true
    - [ ] vulnerability_reference_exists: true
```

### VM-002: Artifact-Level Validation

```yaml
validation_checklist:
  artifact_level:
    - [ ] required_fields_present: true
    - [ ] severity_classified: true
    - [ ] evidence_based: true
    - [ ] remediation_actionable: true
    - [ ] gate_decision_present: true
```

### VM-003: Finding Quality Validation

```yaml
validation_checklist:
  finding_quality:
    - [ ] has_location: true
    - [ ] has_severity: true
    - [ ] has_rationale: true
    - [ ] has_remediation: true
    - [ ] not_vague: true
```

### VM-004: Governance Alignment

```yaml
validation_checklist:
  governance:
    - [ ] skill_development_plan_aligned: true
    - [ ] readme_skill_count_matches: true
    - [ ] backlog_items_documented: true
```

---

## 10. Anti-Patterns

### AP-001: Vague Security Warning

**Definition**: Security finding without specific location, rationale, or remediation.

**Example**: "This code may be insecure."

**Prevention**: Require finding structure with location, severity, rationale, and remediation.

### AP-002: Missing Severity

**Definition**: Finding without severity classification.

**Example**: "There's an issue with the authentication flow."

**Prevention**: Require severity field for all findings.

### AP-003: False Positive Without Evidence

**Definition**: Claiming vulnerability without code evidence.

**Example**: "This might have SQL injection" when all queries are parameterized.

**Prevention**: Require code snippet showing vulnerability.

### AP-004: No Remediation

**Definition**: Finding with no guidance on how to fix.

**Example**: "This endpoint lacks authorization."

**Prevention**: Require remediation field with code example.

### AP-005: Security Scope Creep

**Definition**: Implementing non-MVP security skills.

**Example**: Implementing `secret-handling-review` during 008.

**Prevention**: Explicit backlog documentation; scope boundary enforcement.

### AP-006: Gate Decision Omission

**Definition**: Review output without pass/needs-fix/block decision.

**Example**: Findings report ending without conclusion.

**Prevention**: Require gate_decision field.

---

## 11. Non-Functional Requirements

### NFR-001: Actionability

All security findings must be directly actionable by a developer.

### NFR-002: Severity Consistency

Severity classification must follow consistent criteria across both skills.

### NFR-003: CWE/OWASP Alignment

Findings should reference standard vulnerability classifications where applicable.

### NFR-004: Reusability

Skills must be reusable across multiple repositories and feature types.

### NFR-005: Parallel Execution

Security review should be parallelizable with reviewer role.

---

## 12. Acceptance Criteria

### AC-001: Feature Package Complete

The feature must contain:
- `spec.md`
- `plan.md`
- `tasks.md`
- `completion-report.md`

### AC-002: Security Role Scope Formalized

The repository must clearly define security responsibilities, non-responsibilities, escalation conditions, and upstream/downstream interfaces.

### AC-003: Core Skills Validated

Both existing security skills must meet the quality bar established by 003-007:
- Complete SKILL.md with checklists
- Vulnerability references (CWE/OWASP)
- Output format specification

### AC-004: Artifact Contracts Defined

Both security artifact contracts must be documented with required fields and intended consumers.

### AC-005: Governance Alignment Complete

`skill-development-plan.md` must be updated to:
- Reflect 2-skill MVP for security
- Document `secret-handling-review` and `dependency-risk-review` as M4 backlog

### AC-006: README Accurate

README security skills section must accurately reflect implemented state.

### AC-007: Gate Decision Semantics Clear

The feature must define clear semantics for pass / needs-fix / block decisions.

### AC-008: Anti-Pattern Guidance Present

The feature must document common security review failure patterns.

### AC-009: Scope Boundary Maintained

No `secret-handling-review` or `dependency-risk-review` implementation in 008.

### AC-010: 6-Role Model Complete

After 008, all 6 roles have implemented core capabilities.

---

## 13. Assumptions

### AS-001: Upstream Features Complete

Assumes `003-architect-core` through `007-docs-core` are complete and provide stable artifact contracts.

### AS-002: Existing Skills Adequate

Assumes the existing security skill implementations in `.opencode/skills/security/` can be validated against the quality bar without major rewrites.

### AS-003: Governance Documents Authoritative

Assumes role-definition.md, package-spec.md, io-contract.md, and quality-gate.md are the canonical source of truth.

### AS-004: README is MVP Narrative

Assumes README.md represents the authoritative MVP scope definition for security.

---

## 14. Open Questions

### OQ-001: Automated Tool Integration

Should security skills integrate with automated scanning tools?

**Initial Direction**: Out of MVP scope; skills focus on review methodology, not tool orchestration.

### OQ-002: Security Review Triggers

What exactly triggers mandatory security review in the workflow?

**Initial Direction**: Explicit task risk marking + heuristics for auth/input-related files.

### OQ-003: Finding Re-Review Process

How should remediated findings be re-reviewed?

**Initial Direction**: Developer fixes → security re-review → gate decision.

### OQ-004: Cross-Skill Findings

How to handle findings that span both skills (e.g., auth + input)?

**Initial Direction**: Both skills can report; aggregate at gate decision level.

---

## 15. Scope Resolution Decision

### Pre-existing Skills Validation

**Status**: Two security skills already exist in `.opencode/skills/security/`:
- `auth-and-permission-review` (~400 lines)
- `input-validation-review` (~470 lines)

**Resolution**:
- Both `README.md` and `skill-development-plan.md` v0.2 are aligned on 2-skill MVP
- This feature validates existing skills against the quality bar established by 003-007
- `secret-handling-review` and `dependency-risk-review` are documented as M4 backlog items

**Rationale**: Existing skills have substantial content. This feature validates and enhances rather than creates from scratch.

---

## 16. References

- `docs/infra/feature/008-security-core-feature.md` - Full requirements document
- `specs/003-architect-core/` through `specs/007-docs-core/` - Prior role-core features
- `.opencode/skills/security/auth-and-permission-review/SKILL.md` - Existing skill
- `.opencode/skills/security/input-validation-review/SKILL.md` - Existing skill
- `package-spec.md` - Package governance specification
- `role-definition.md` - 6-role definition (Section 6: security)
- `io-contract.md` - Input/output contract
- `quality-gate.md` - Quality gate rules

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial spec creation based on 008-security-core-feature.md requirements |