# 008-security-core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish security as a first-class security review role with 2 core skills, 2 artifact contracts, and complete quality/validation layer - completing the 6-role formal execution model.

**Architecture:** This feature validates and formalizes existing security capabilities to match the quality bar established by 003-007. It positions security as a parallel review capability to reviewer, focused specifically on security risk surfaces (authentication, authorization, input validation).

**Tech Stack:** YAML artifact schemas, OpenCode skill system, CWE/OWASP vulnerability references

---

## Document Status
- **Feature ID**: `008-security-core`
- **Version**: 1.0.0
- **Status**: ✅ Complete
- **Created**: 2026-03-27
- **Completed**: 2026-03-27
- **Based On**: `specs/008-security-core/spec.md` v1.0.0

---

## 1. Architecture Summary

This feature completes the 6-role formal execution model by implementing the complete core capability system for the `security` role:

1. **2 Core Skills**: `auth-and-permission-review`, `input-validation-review` (pre-existing, need validation/enhancement)
2. **2 Standard Artifacts**: `security-review-report`, `input-validation-review-report`
3. **Complete Quality Assurance System**: Checklists, Anti-patterns, Failure modes, Validation gates
4. **Upstream/Downstream Role Interfaces**: Consumption contracts from developer/tester (upstream) and handoff to developer/reviewer (downstream)
5. **Gate Decision Semantics**: Clear pass/needs-fix/block decision criteria

**Key Insight:** Unlike previous features (003-007) which created new skills, this feature **validates existing skills** against the quality bar and fills gaps. The security skills already exist with substantial content (~400 lines each).

---

## 2. Inputs from Spec

### 2.1 Core Requirements (from spec.md)

| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| BR-001 | Security Must Be Actionable | Critical |
| BR-002 | Evidence-Based Findings | Critical |
| BR-003 | Gate Decision Required | Critical |
| BR-004 | Severity Classification | Critical |
| BR-005 | MVP Boundary Discipline | Critical |
| BR-006 | No Code Modification | Critical |
| BR-007 | Parallel to Reviewer | Critical |
| BR-008 | High-Risk Task Trigger | Critical |

### 2.2 Skill Requirements (from spec.md)

| Skill ID | Skill Name | Purpose | Current Status |
|----------|------------|---------|----------------|
| SKILL-001 | auth-and-permission-review | Review authentication, authorization, identity boundaries | 397 lines SKILL.md exists |
| SKILL-002 | input-validation-review | Review input handling, validation, injection vulnerabilities | 469 lines SKILL.md exists |

### 2.3 Artifact Requirements (from spec.md)

| Artifact ID | Artifact Name | Required Fields Count |
|-------------|---------------|----------------------|
| AC-001 | security-review-report | 5 top-level + 9 finding fields |
| AC-002 | input-validation-review-report | 5 top-level + 7 finding fields |

### 2.4 Validation Requirements (from spec.md)

| Validation ID | Type | Check Items |
|---------------|------|-------------|
| VM-001 | Skill-Level | Inputs, outputs, checklists, examples, role boundaries, vulnerability references |
| VM-002 | Artifact-Level | Required fields, severity classified, evidence-based, remediation actionable, gate decision |
| VM-003 | Finding Quality | Location, severity, rationale, remediation, not vague |
| VM-004 | Governance Alignment | skill-development-plan aligned, README skill count matches, backlog items documented |

---

## 3. Pre-existing Assets Analysis

### 3.1 auth-and-permission-review SKILL.md Assessment

| Component | Current Status | Quality Bar | Gap |
|-----------|----------------|-------------|-----|
| Purpose section | ✅ Complete | ✅ Pass | None |
| When to Use | ✅ Complete | ✅ Pass | None |
| When Not to Use | ✅ Complete | ✅ Pass | None |
| Review Checklist | ✅ Comprehensive (40+ items) | ✅ Pass | None |
| Common Vulnerabilities table | ✅ With CWE hints | ⚠️ Partial | CWE references incomplete |
| Steps workflow | ✅ 6 steps defined | ✅ Pass | None |
| Output Format (YAML) | ✅ Complete schema | ✅ Pass | Align with artifact contract |
| Examples | ✅ 2 detailed examples | ✅ Pass | None |
| Checklists (pre/during/post) | ✅ Present | ✅ Pass | None |
| Gate standards | ✅ Pass/Conditional/Fail | ⚠️ Partial | Rename to match spec (pass/needs-fix/block) |
| CWE/OWASP references | ⚠️ In examples only | ⚠️ Partial | Add to vulnerability table |
| Anti-patterns section | ❌ Missing | ❌ Gap | Need anti-pattern guidance |

### 3.2 input-validation-review SKILL.md Assessment

| Component | Current Status | Quality Bar | Gap |
|-----------|----------------|-------------|-----|
| Purpose section | ✅ Complete | ✅ Pass | None |
| When to Use | ✅ Complete | ✅ Pass | None |
| When Not to Use | ✅ Complete | ✅ Pass | None |
| Validation Principles | ✅ 4 principles | ✅ Pass | None |
| Review Checklist | ✅ Comprehensive (50+ items) | ✅ Pass | None |
| Common Vulnerabilities table | ✅ With CWE | ✅ Pass | None |
| Steps workflow | ✅ 6 steps defined | ✅ Pass | None |
| Output Format (YAML) | ✅ Complete schema | ✅ Pass | Align with artifact contract |
| Examples | ✅ 3 detailed examples | ✅ Pass | None |
| Checklists (pre/during/post) | ✅ Present | ✅ Pass | None |
| CWE/OWASP references | ✅ In examples | ✅ Pass | None |
| Anti-patterns section | ❌ Missing | ❌ Gap | Need anti-pattern guidance |

### 3.3 Gap Summary

| Gap ID | Gap Description | Affected Skills | Severity |
|--------|-----------------|-----------------|----------|
| G-001 | No formal artifact contracts | Both | Major |
| G-002 | Gate decision terminology inconsistent | auth-and-permission | Minor |
| G-003 | No role-scope.md documentation | Both | Major |
| G-004 | No upstream/downstream interface docs | Both | Major |
| G-005 | No validation checklists (VM-001 to VM-004) | Both | Major |
| G-006 | No anti-pattern guidance (AP-001 to AP-006) | Both | Major |
| G-007 | No example directory structure | Both | Minor |
| G-008 | CWE references incomplete in vulnerability table | auth-and-permission | Minor |

---

## 4. Technical Constraints

### 4.1 Governance Alignment Constraints

| Constraint | Source | Rationale |
|------------|--------|-----------|
| C-001: Use 6-role formal terminology | AGENTS.md, role-definition.md | Maintain governance consistency |
| C-002: Gate decision: pass/needs-fix/block | spec.md BR-003 | Match spec semantics |
| C-003: Follow I/O Contract | io-contract.md | Ensure management layer can invoke |
| C-004: Satisfy Quality Gate Section 3.6 | quality-gate.md | Ensure security output quality |
| C-005: Maintain role purity | BR-006 | Security must not modify code |
| C-006: No scope creep | BR-005 | No secret-handling-review or dependency-risk-review |

### 4.2 Directory Structure Constraints

```
.opencode/skills/security/
├── auth-and-permission-review/
│   ├── SKILL.md (enhance existing)
│   ├── examples/
│   │   ├── example-001-critical-auth-bypass.md
│   │   └── example-002-pass-with-suggestions.md
│   ├── anti-examples/
│   │   ├── anti-example-001-vague-warning.md
│   │   └── anti-example-002-no-remediation.md
│   └── templates/
│       └── security-review-report-template.md
└── input-validation-review/
    ├── SKILL.md (enhance existing)
    ├── examples/
    │   ├── example-001-sql-injection.md
    │   ├── example-002-xss-vulnerability.md
    │   └── example-003-path-traversal.md
    ├── anti-examples/
    │   ├── anti-example-001-false-positive-without-evidence.md
    │   └── anti-example-002-generic-validation-advice.md
    └── templates/
        └── input-validation-review-report-template.md
```

### 4.3 Compatibility Constraints

- Existing security skills have comprehensive SKILL.md files
- Enhance existing skills rather than replacing
- Do not break existing security review workflows
- Gate decision terminology: map existing Pass/Conditional Pass/Fail to spec's pass/needs-fix/block

---

## 5. Module Decomposition

### 5.1 Phase Overview

```
Phase 1: Role Scope & Interface Definition (1 day)
  ├── P1-1: Security role boundary confirmation
  ├── P1-2: Upstream interface from developer/tester definition
  └── P1-3: Downstream interface to developer/reviewer definition

Phase 2: Artifact Contract Establishment (0.5 day)
  ├── P2-1: security-review-report contract
  └── P2-2: input-validation-review-report contract

Phase 3: Skill Enhancement (1.5 days)
  ├── P3-1: auth-and-permission-review enhancement
  │   ├── CWE/OWASP references completion
  │   ├── Gate decision terminology alignment
  │   └── Anti-pattern section addition
  └── P3-2: input-validation-review enhancement
      └── Anti-pattern section addition

Phase 4: Validation & Quality Layer (1 day)
  ├── P4-1: Skill-level validation checklist
  ├── P4-2: Artifact-level validation checklist
  ├── P4-3: Finding-quality validation checklist
  └── P4-4: Anti-pattern guidance documentation

Phase 5: Educational & Example Layer (1 day)
  ├── P5-1: Examples for each skill
  ├── P5-2: Anti-examples for each skill
  └── P5-3: Templates for each skill

Phase 6: Governance Alignment (0.5 day)
  ├── P6-1: skill-development-plan.md verification
  ├── P6-2: README.md verification
  └── P6-3: Feature completion preparation

Phase 7: Consistency Review (0.5 day)
  ├── P7-1: Governance document sync
  ├── P7-2: Cross-document consistency check
  └── P7-3: Final acceptance validation
```

### 5.2 Detailed Module Breakdown

#### Phase 1: Role Scope & Interface Definition

**P1-1: Security Role Boundary Confirmation**
- **Objective**: Define security responsibilities and boundaries aligned with role-definition.md Section 6
- **Inputs**: role-definition.md (Section 6: security), spec.md
- **Outputs**: role-scope.md (in specs/008-security-core/)
- **Content**:
  - Mission statement (security-focused review)
  - In-scope / out-of-scope boundaries
  - Trigger conditions (high-risk tasks, auth/input changes)
  - Required/optional inputs from developer/tester
  - Expected outputs
  - Escalation rules (critical vulnerability → block)
  - BR-006 enforcement (no implementation code modification)
  - Gate decision semantics (pass/needs-fix/block)
- **Acceptance Criteria**: No conflicts with role-definition.md; developer/reviewer can understand handoff
- **Risks**: May overlap with reviewer responsibilities
- **Failure Mode**: Unclear boundary between security role and reviewer role

**P1-2: Upstream Interface Definition**
- **Objective**: Define how security consumes developer and tester outputs
- **Inputs**: 
  - specs/004-developer-core/contracts/
  - specs/005-tester-core/contracts/
  - spec.md Section 4.2
- **Outputs**: upstream-consumption.md (in specs/008-security-core/)
- **Content**:
  - Mapping from developer artifacts (implementation-summary, changed-files, self-check-report)
  - Mapping from tester artifacts (verification-report)
  - Mapping from feature context (spec.md, task risk level)
  - Field-by-field consumption guide
- **Acceptance Criteria**: Security knows how to read all upstream artifacts
- **Risks**: Missing fields or incompatible schemas
- **Failure Mode**: Cannot identify security-relevant code from upstream outputs

**P1-3: Downstream Interface Definition**
- **Objective**: Define security handoff to developer and reviewer
- **Inputs**: role-definition.md, io-contract.md, spec.md Section 4.3
- **Outputs**: downstream-interfaces.md (in specs/008-security-core/)
- **Content**:
  - What developer receives from security (findings for remediation)
  - What reviewer receives from security (security gate decision)
  - What OpenClaw receives from security (security-review-report)
  - Gate decision semantics (pass/needs-fix/block)
  - Escalation path for critical findings
- **Acceptance Criteria**: Each downstream consumer has clear consumption guidance
- **Risks**: Gate decision semantics may conflict with reviewer's acceptance decision
- **Failure Mode**: Reviewer doesn't know how to interpret security gate decision

---

#### Phase 2: Artifact Contract Establishment

**P2-1: security-review-report Contract**
- **Objective**: Define complete schema for security-review-report
- **Output**: contracts/security-review-report-contract.md
- **Content** (per spec.md AC-001):
  - Required top-level fields: scope, findings, risk_assessment, gate_decision, recommendations
  - Required finding fields (9): id, severity, category, title, description, location, vulnerability (type, CWE, OWASP), impact, remediation
  - Severity levels: critical, high, medium, low, info
  - Categories: authentication, authorization, session, transport, logging
  - Gate decision values: pass, needs-fix, block
- **Acceptance Criteria**: Fields match spec.md; supports evidence-based findings
- **Risks**: Existing output format may differ slightly
- **Failure Mode**: Cannot capture all finding details

**P2-2: input-validation-review-report Contract**
- **Objective**: Define complete schema for input-validation-review-report
- **Output**: contracts/input-validation-review-report-contract.md
- **Content** (per spec.md AC-002):
  - Required top-level fields: scope, findings, validation_coverage, risk_assessment, gate_decision
  - Required finding fields (7): id, severity, category, input, vulnerability, vulnerable_code, remediation
  - Severity levels: critical, high, medium, low
  - Categories: sql_injection, xss, command_injection, path_traversal, nosql_injection, ldap_injection, deserialization, missing_validation
- **Acceptance Criteria**: Fields match spec.md; supports exploit scenario documentation
- **Risks**: Existing output format may differ slightly
- **Failure Mode**: Cannot capture input source details

---

#### Phase 3: Skill Enhancement

**P3-1: auth-and-permission-review Enhancement**

| Enhancement | Current Status | Target Status |
|-------------|----------------|---------------|
| CWE/OWASP in vulnerability table | Partial (in examples) | Complete in table |
| Gate decision terminology | Pass/Conditional Pass/Fail | pass/needs-fix/block |
| Anti-patterns section | Missing | 6 anti-patterns (AP-001 to AP-006) |
| Role boundary notes | Implicit | Explicit section |

**Specific Changes**:
1. Add complete CWE/OWASP references to Common Vulnerabilities table:
   - Weak password hash: CWE-916, OWASP A02
   - Hardcoded credentials: CWE-798, OWASP A07
   - JWT without verification: CWE-287, OWASP A07
   - Session fixation: CWE-384, OWASP A07
   - Authorization bypass: CWE-862, OWASP A01
   - IDOR: CWE-639, OWASP A01
   - CSRF: CWE-352, OWASP A01

2. Update Gate standards section:
   - Pass → pass
   - Conditional Pass → needs-fix
   - Fail → block

3. Add Anti-Patterns section (spec.md Section 10):
   - AP-001: Vague Security Warning
   - AP-002: Missing Severity
   - AP-003: False Positive Without Evidence
   - AP-004: No Remediation
   - AP-005: Security Scope Creep
   - AP-006: Gate Decision Omission

**P3-2: input-validation-review Enhancement**

| Enhancement | Current Status | Target Status |
|-------------|----------------|---------------|
| Anti-patterns section | Missing | 6 anti-patterns |
| Role boundary notes | Implicit | Explicit section |

**Specific Changes**:
1. Add Anti-Patterns section:
   - AP-001: Vague Security Warning (generic "validate inputs")
   - AP-002: Missing Severity
   - AP-003: False Positive Without Evidence
   - AP-004: No Remediation
   - AP-005: Security Scope Creep
   - AP-006: Gate Decision Omission

---

#### Phase 4: Validation & Quality Layer

**P4-1: Skill-Level Validation Checklist**
- **Objective**: Ensure skills meet quality bar
- **Output**: validation/skill-level-checklist.md
- **Check Items** (per spec.md VM-001):
  - [ ] inputs_defined: true
  - [ ] outputs_complete: true
  - [ ] checklists_exist: true
  - [ ] examples_exist: true
  - [ ] role_boundaries_clear: true
  - [ ] vulnerability_reference_exists: true
- **Acceptance Criteria**: Both skills pass all items

**P4-2: Artifact-Level Validation Checklist**
- **Objective**: Ensure artifacts meet quality bar
- **Output**: validation/artifact-level-checklist.md
- **Check Items** (per spec.md VM-002):
  - [ ] required_fields_present: true
  - [ ] severity_classified: true
  - [ ] evidence_based: true
  - [ ] remediation_actionable: true
  - [ ] gate_decision_present: true
- **Acceptance Criteria**: Both artifacts pass all items

**P4-3: Finding-Quality Validation Checklist**
- **Objective**: Ensure findings meet quality bar
- **Output**: validation/finding-quality-checklist.md
- **Check Items** (per spec.md VM-003):
  - [ ] has_location: true
  - [ ] has_severity: true
  - [ ] has_rationale: true
  - [ ] has_remediation: true
  - [ ] not_vague: true
- **Acceptance Criteria**: All findings in examples pass

**P4-4: Anti-Pattern Guidance Documentation**
- **Objective**: Document security review anti-patterns
- **Output**: validation/anti-pattern-guidance.md
- **Content** (per spec.md Section 10):
  - AP-001: Vague Security Warning
    - Definition: Finding without specific location, rationale, or remediation
    - Example: "This code may be insecure."
    - Prevention: Require finding structure with location, severity, rationale, remediation
  - AP-002: Missing Severity
    - Definition: Finding without severity classification
    - Example: "There's an issue with the authentication flow."
    - Prevention: Require severity field for all findings
  - AP-003: False Positive Without Evidence
    - Definition: Claiming vulnerability without code evidence
    - Example: "This might have SQL injection" when all queries are parameterized
    - Prevention: Require code snippet showing vulnerability
  - AP-004: No Remediation
    - Definition: Finding with no guidance on how to fix
    - Example: "This endpoint lacks authorization."
    - Prevention: Require remediation field with code example
  - AP-005: Security Scope Creep
    - Definition: Implementing non-MVP security skills
    - Example: Implementing secret-handling-review during 008
    - Prevention: Explicit backlog documentation; scope boundary enforcement
  - AP-006: Gate Decision Omission
    - Definition: Review output without pass/needs-fix/block decision
    - Example: Findings report ending without conclusion
    - Prevention: Require gate_decision field

---

#### Phase 5: Educational & Example Layer

**P5-1: Examples for Each Skill**
- **Objective**: Provide complete examples for each skill
- **Output Structure**:
  ```
  .opencode/skills/security/
  ├── auth-and-permission-review/
  │   └── examples/
  │       ├── example-001-critical-auth-bypass.md (from SKILL.md 示例 1)
  │       └── example-002-pass-with-suggestions.md (from SKILL.md 示例 2)
  └── input-validation-review/
      └── examples/
          ├── example-001-sql-injection.md (from SKILL.md 示例 1)
          ├── example-002-xss-vulnerability.md (from SKILL.md 示例 2)
          └── example-003-path-traversal.md (from SKILL.md 示例 3)
  ```
- **Note**: Examples already exist in SKILL.md; extract to separate files for modularity

**P5-2: Anti-Examples for Each Skill**
- **Objective**: Demonstrate common mistakes
- **Output Structure**:
  ```
  .opencode/skills/security/
  ├── auth-and-permission-review/
  │   └── anti-examples/
  │       ├── anti-example-001-vague-warning.md
  │       └── anti-example-002-no-remediation.md
  └── input-validation-review/
      └── anti-examples/
          ├── anti-example-001-false-positive-without-evidence.md
          └── anti-example-002-generic-validation-advice.md
  ```

**P5-3: Templates for Each Skill**
- **Objective**: Provide reusable templates
- **Output Structure**:
  ```
  .opencode/skills/security/
  ├── auth-and-permission-review/
  │   └── templates/
  │       └── security-review-report-template.md
  └── input-validation-review/
      └── templates/
          └── input-validation-review-report-template.md
  ```

---

#### Phase 6: Governance Alignment

**P6-1: skill-development-plan.md Verification**
- **Objective**: Verify skill-development-plan.md is aligned
- **Current State**: v0.2 (2026-03-27) already shows 2-skill MVP
- **Check Items**:
  - [ ] Security MVP shows 2 skills (auth-and-permission-review, input-validation-review)
  - [ ] M4 扩展 section shows secret-handling-review and dependency-risk-review as deferred
  - [ ] No inconsistencies with README
- **Acceptance Criteria**: Already aligned; document verification

**P6-2: README.md Verification**
- **Objective**: Verify README reflects security skills status
- **Check Items**:
  - [ ] Security Skills section shows 2 skills
  - [ ] Status shows correct completion state after 008
  - [ ] 6-Role Model Complete section reflects 008 completion
- **Acceptance Criteria**: README updated to reflect 008 completion

**P6-3: Feature Completion Preparation**
- **Objective**: Prepare completion-report.md
- **Output**: specs/008-security-core/completion-report.md
- **Content**:
  - Deliverables checklist
  - Traceability matrix to spec
  - Open questions resolved/unresolved
  - Known gaps (future M4 skills)
  - 6-role model complete declaration
- **Acceptance Criteria**: Honest status reporting; no hidden gaps

---

#### Phase 7: Consistency Review

**P7-1: Governance Document Sync**
- **Objective**: Ensure all governance documents are consistent
- **Check Items**:
  - [ ] README.md terminology consistent with role-definition.md
  - [ ] AGENTS.md constraints consistent with package-spec.md
  - [ ] quality-gate.md security gate aligned with this feature
  - [ ] io-contract.md artifact types include security artifacts

**P7-2: Cross-Document Consistency Check**
- **Objective**: Verify no contradictions between documents
- **Method**: Use governance sync rule (AGENTS.md)
- **Check Areas**:
  - 6-role vs 3-skill semantic consistency
  - Feature status across README, plan, completion-report
  - Artifact field definitions consistent across contracts

**P7-3: Final Acceptance Validation**
- **Objective**: Validate against spec.md acceptance criteria
- **Validation Items**:
  - AC-001: Feature package complete
  - AC-002: Security role scope formalized
  - AC-003: Core skills validated
  - AC-004: Artifact contracts defined
  - AC-005: Governance alignment complete
  - AC-006: README accurate
  - AC-007: Gate decision semantics clear
  - AC-008: Anti-pattern guidance present
  - AC-009: Scope boundary maintained
  - AC-010: 6-Role Model Complete

---

## 6. Data Flow

### 6.1 Standard Security Review Flow

```
High-Risk Task Signal
         │
         ▼
┌─────────────────────────┐
│   security: Read        │
│   implementation        │
│   artifacts             │
│   - changed files       │
│   - implementation-summary│
│   - task risk level     │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   security: Identify    │
│   security-relevant     │
│   code                  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Decision: Which skill to invoke?  │
│   - auth/permission changes →       │
│     auth-and-permission-review      │
│   - input handling changes →        │
│     input-validation-review         │
└─────────────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────────┐
│ auth-  │ │ input-     │
│ and-   │ │ validation │
│ permis │ │ -review    │
│ sion-  │ │            │
│ review │ │            │
└────────┘ └────────────┘
    │         │
    └────┬────┘
         ▼
┌─────────────────────────┐
│   Output:               │
│   security-review-report│
│   OR                    │
│   input-validation-     │
│   review-report         │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Gate Decision:        │
│   - pass → continue     │
│   - needs-fix → developer│
│   - block → escalate    │
└─────────────────────────┘
```

### 6.2 Critical Finding Escalation Flow

```
Critical Vulnerability Found
         │
         ▼
┌─────────────────────────┐
│   security: Document    │
│   critical finding      │
│   - location            │
│   - severity            │
│   - exploit scenario    │
│   - remediation         │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   security: Set         │
│   gate_decision = block │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   security: Escalate    │
│   to developer with     │
│   must-fix requirement  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   developer: Remediate  │
│   (security does NOT    │
│   modify code)          │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   security: Re-review   │
│   remediated code       │
└─────────────────────────┘
```

---

## 7. Failure Handling

### 7.1 Skill-Level Failure Modes

| Skill | Failure Mode | Detection | Recovery |
|-------|--------------|-----------|----------|
| auth-and-permission-review | Vague warning (AP-001) | Checklist: location + rationale + remediation | Reject output, require specifics |
| auth-and-permission-review | Missing severity (AP-002) | Checklist: severity field required | Reject output, require classification |
| auth-and-permission-review | False positive (AP-003) | Checklist: code evidence required | Require vulnerable code snippet |
| input-validation-review | No remediation (AP-004) | Checklist: remediation code example | Reject output, require fix guidance |
| input-validation-review | Gate omission (AP-006) | Checklist: gate_decision required | Reject output, require decision |
| Both | Scope creep (AP-005) | Review: only MVP skills implemented | Reject non-MVP skill invocation |

### 7.2 Artifact-Level Failure Modes

| Artifact | Failure Mode | Detection | Recovery |
|----------|--------------|-----------|----------|
| security-review-report | Missing finding location | Validation: location field | Reject, require location |
| security-review-report | Missing CWE/OWASP | Validation: vulnerability.cwe field | Add standard reference |
| input-validation-review-report | Missing input source | Validation: input.source field | Reject, require input trace |
| Both | No gate decision | Validation: gate_decision field | Reject, require decision |

### 7.3 Escalation Rules

Escalate (block) when:
- Critical severity vulnerability found (CWE-798, CWE-862, CWE-89, etc.)
- High severity vulnerability with no quick remediation path
- Multiple high severity findings in same component
- Insufficient implementation context to complete review

---

## 8. Validation Strategy

### 8.1 Skill-Level Validation

Each skill must pass:

```yaml
validation_checklist:
  skill_level:
    - inputs_defined: true
    - outputs_complete: true
    - checklists_exist: true
    - examples_exist: true
    - role_boundaries_clear: true
    - vulnerability_reference_exists: true
```

### 8.2 Artifact-Level Validation

Each artifact must pass:

```yaml
validation_checklist:
  artifact_level:
    - required_fields_present: true
    - severity_classified: true
    - evidence_based: true
    - remediation_actionable: true
    - gate_decision_present: true
```

### 8.3 Finding-Quality Validation

Each finding must pass:

```yaml
validation_checklist:
  finding_quality:
    - has_location: true
    - has_severity: true
    - has_rationale: true
    - has_remediation: true
    - not_vague: true
```

### 8.4 Governance Alignment Validation

```yaml
validation_checklist:
  governance:
    - skill_development_plan_aligned: true
    - readme_skill_count_matches: true
    - backlog_items_documented: true
```

---

## 9. Risks / Tradeoffs

### 9.1 Identified Risks

| Risk ID | Description | Level | Mitigation |
|---------|-------------|-------|------------|
| R-001 | Existing skills have different structure than 003-007 pattern | Low | Enhance existing, preserve what works |
| R-002 | Gate decision terminology mismatch | Low | Map Pass/Conditional Pass/Fail to pass/needs-fix/block |
| R-003 | Security may overstep into reviewer role | Medium | Explicit BR-007 compliance |
| R-004 | CWE/OWASP references may be incomplete | Low | Complete vulnerability table |
| R-005 | Scope creep toward M4 skills | Low | Explicit BR-005 compliance |

### 9.2 Tradeoffs

| Decision | Chosen Approach | Alternative | Rationale |
|----------|-----------------|-------------|-----------|
| Skill approach | Enhance existing | Rewrite entirely | Existing skills are comprehensive |
| CWE references | Add to table | Keep in examples only | Spec requires vulnerability references |
| Example structure | Extract to files | Keep in SKILL.md | Modularity for large examples |
| Gate terminology | Rename to spec values | Keep existing | Spec compliance |

### 9.3 Assumptions

| Assumption ID | Description | Impact if Wrong |
|---------------|-------------|-----------------|
| AS-001 | 003-007 features complete | Missing upstream interfaces |
| AS-002 | Existing skills can be enhanced | Need full rewrite |
| AS-003 | Governance documents authoritative | Need semantic re-alignment |
| AS-004 | skill-development-plan.md already updated (v0.2) | Need to update it |

---

## 10. Requirement Traceability

### 10.1 Spec Requirements to Plan Mapping

| Spec Requirement | Plan Section | Task IDs |
|------------------|--------------|----------|
| BR-001: Security Must Be Actionable | Phase 3, Phase 4 | P3-1, P4-4 |
| BR-002: Evidence-Based Findings | Phase 4 | P4-2, P4-3 |
| BR-003: Gate Decision Required | Phase 2, Phase 3 | P2-1, P2-2, P3-1 |
| BR-004: Severity Classification | Phase 2 | P2-1, P2-2 |
| BR-005: MVP Boundary Discipline | Phase 6 | P6-1 |
| BR-006: No Code Modification | Phase 1 | P1-1 |
| BR-007: Parallel to Reviewer | Phase 1 | P1-3 |
| BR-008: High-Risk Task Trigger | Phase 1 | P1-1 |

### 10.2 Acceptance Criteria to Tasks Mapping

| Acceptance Criteria | Tasks |
|---------------------|-------|
| AC-001: Feature Package Complete | All phases |
| AC-002: Security Role Scope Formalized | P1-1, P6-1 |
| AC-003: Core Skills Validated | P3-1, P3-2, P4-1 |
| AC-004: Artifact Contracts Defined | P2-1, P2-2 |
| AC-005: Governance Alignment Complete | P6-1, P6-2 |
| AC-006: README Accurate | P6-2 |
| AC-007: Gate Decision Semantics Clear | P1-1, P2-1, P2-2 |
| AC-008: Anti-Pattern Guidance Present | P3-1, P3-2, P4-4 |
| AC-009: Scope Boundary Maintained | All phases (by design) |
| AC-010: 6-Role Model Complete | P7-3 |

---

## 11. Implementation Order

### 11.1 Recommended Execution Sequence

```
Day 1:
├── Phase 1: Role Scope & Interface Definition (1 day)
│   └── Parallel: P1-1, P1-2, P1-3

Day 2 (Morning):
├── Phase 2: Artifact Contract Establishment (0.5 day)
│   └── Parallel: P2-1, P2-2

Day 2 (Afternoon) - Day 3:
├── Phase 3: Skill Enhancement (1.5 days)
│   ├── P3-1: auth-and-permission-review (0.75 day)
│   └── P3-2: input-validation-review (0.75 day)

Day 4:
├── Phase 4: Validation & Quality Layer (1 day)
│   └── Sequential: P4-1 → P4-2 → P4-3 → P4-4

Day 5:
├── Phase 5: Educational & Example Layer (1 day)
│   └── Parallel: P5-1, P5-2, P5-3

Day 6 (Morning):
├── Phase 6: Governance Alignment (0.5 day)
│   └── Sequential: P6-1 → P6-2 → P6-3

Day 6 (Afternoon):
└── Phase 7: Consistency Review (0.5 day)
    └── Sequential: P7-1 → P7-2 → P7-3
```

### 11.2 Parallel-Safe Tasks

| Phase | Parallel-Safe Tasks |
|-------|---------------------|
| Phase 1 | P1-1, P1-2, P1-3 (parallel) |
| Phase 2 | P2-1, P2-2 (parallel) |
| Phase 3 | P3-1, P3-2 (parallel) |
| Phase 5 | P5-1, P5-2, P5-3 (parallel) |

### 11.3 Dependencies

```
P1-1, P1-2, P1-3 → P2-1, P2-2
P2-1 → P3-1
P2-2 → P3-2
P3-1, P3-2 → P4-1, P4-2
P4-1, P4-2 → P4-3, P4-4
P4-3, P4-4 → P5-1, P5-2, P5-3
P5-1, P5-2, P5-3 → P6-1
P6-1 → P6-2 → P6-3
P6-3 → P7-1 → P7-2 → P7-3
```

---

## 12. Open Questions

### 12.1 From Spec (OQ-001 to OQ-004)

| OQ ID | Question | Impact | Recommended Resolution |
|-------|----------|--------|------------------------|
| OQ-001 | Automated Tool Integration? | Tool usage | Out of MVP scope; skills focus on review methodology |
| OQ-002 | Security Review Triggers? | Workflow | Explicit task risk marking + heuristics for auth/input files |
| OQ-003 | Finding Re-Review Process? | Workflow | Developer fixes → security re-review → gate decision |
| OQ-004 | Cross-Skill Findings? | Reporting | Both skills can report; aggregate at gate decision level |

### 12.2 New Open Questions from Planning

| OQ ID | Question | Impact | Temporary Assumption |
|-------|----------|--------|---------------------|
| OQ-005 | Should security run before or after reviewer? | Workflow ordering | Parallel execution; security gate informs reviewer |
| OQ-006 | How to handle findings in third-party dependencies? | Scope boundary | Report but mark as external; recommend upgrade |

---

## 13. Next Steps

### 13.1 Immediate Actions

1. **Create tasks.md**: Convert this plan to executable task list
2. **Confirm open questions**: Resolve OQ-001~OQ-006 decisions
3. **Begin Phase 1**: Role Scope & Interface Definition

### 13.2 Dependencies on Other Features

| Dependency | Feature | Status |
|------------|---------|--------|
| 003-architect-core | Completed | ✅ |
| 004-developer-core | Completed | ✅ |
| 005-tester-core | Completed | ✅ |
| 006-reviewer-core | Completed | ✅ |
| 007-docs-core | Completed | ✅ |

### 13.3 Deliverables Checklist

- [ ] `specs/008-security-core/plan.md` (this document)
- [ ] `specs/008-security-core/tasks.md`
- [ ] `specs/008-security-core/role-scope.md`
- [ ] `specs/008-security-core/upstream-consumption.md`
- [ ] `specs/008-security-core/downstream-interfaces.md`
- [ ] `specs/008-security-core/contracts/security-review-report-contract.md`
- [ ] `specs/008-security-core/contracts/input-validation-review-report-contract.md`
- [ ] `.opencode/skills/security/auth-and-permission-review/SKILL.md` (enhanced)
- [ ] `.opencode/skills/security/input-validation-review/SKILL.md` (enhanced)
- [ ] `.opencode/skills/security/*/examples/` (example files)
- [ ] `.opencode/skills/security/*/anti-examples/` (anti-example files)
- [ ] `.opencode/skills/security/*/templates/` (template files)
- [ ] `specs/008-security-core/validation/` (checklists)
- [ ] `specs/008-security-core/completion-report.md`

---

## References

- `specs/008-security-core/spec.md` - Feature specification
- `specs/004-developer-core/` - Developer artifacts for upstream consumption
- `specs/005-tester-core/` - Tester artifacts for upstream consumption
- `specs/006-reviewer-core/` - Reviewer patterns for parallel execution
- `specs/007-docs-core/` - Plan pattern reference
- `package-spec.md` - Package governance specification
- `role-definition.md` - 6-role definition (Section 6: security)
- `io-contract.md` - Input/output contract
- `quality-gate.md` - Quality gate rules (Section 3.6: security gate)
- `.opencode/skills/security/*/SKILL.md` - Existing security skill references