# 005-tester-core Feature Specification

## Document Status
- **Feature ID**: `005-tester-core`
- **Feature Name**: Tester Core Skills System
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-25
- **Last Updated**: 2026-03-25
- **Authoring Intent**: Full-feature specification for OpenCode-driven implementation, not a minimal bootstrap

---

## 1. Background

### 1.1 Context
The repository has already established the first two formal execution roles in the 6-role model:

- `003-architect-core`: turns requirements into design notes, module boundaries, and trade-off guidance
- `004-developer-core`: turns design into code changes, implementation summaries, self-check reports, and bugfix reports

The next missing first-class capability is `tester`.

In the intended execution chain:

```text
architect (design) → developer (implement) → tester (verify) → reviewer (independent judgment)
```

`tester` is the role that converts implementation claims into verifiable evidence.
Without a complete tester-core system, the repository still lacks a formal verification layer between implementation and approval.

### 1.2 Problem Statement
Without `005-tester-core`, the expert package still has the following structural gaps:

1. **No formal verification contract**  
   developer outputs cannot be consumed by a standardized testing role with stable artifacts.

2. **No unified test-scope methodology**  
   there is no first-class method for converting `changed_files`, `goal_alignment`, `known_issues`, and `risks` into a test plan.

3. **No systematic regression strategy**  
   regression analysis remains ad hoc and may miss impact outside the immediate code path.

4. **No explicit boundary-condition framework**  
   edge cases are mentioned in role-definition, but there is no full tester skill system for identifying, organizing, and reporting them.

5. **No downstream-ready evidence package**  
   reviewer and acceptance layers need structured test evidence, not vague statements like “tested locally” or “looks good”.

6. **Role boundary remains under-specified in practice**  
   without tester-core, developer may overstep into unverifiable self-approval, or reviewer may be forced to compensate for missing test rigor.

### 1.3 Prior Work
This feature builds on:

- `002-role-model-alignment`
- `002b-governance-repair`
- `003-architect-core`
- `004-developer-core`

In particular, `004-developer-core` already defined the tester-facing upstream inputs that 005 must consume:

- `changed_files`
- `goal_alignment`
- `known_issues`
- `risks`

This means `005-tester-core` should be designed as a **downstream consumer of developer artifacts**, not as an isolated role document.

---

## 2. Goal

Establish `tester` as a first-class verification role with:

1. **Complete capability system**  
   3 core skills with full supporting assets and explicit role boundaries.

2. **Stable artifact contracts**  
   structured outputs that can be consumed by reviewer and acceptance layers.

3. **Upstream-consumption discipline**  
   formal transformation of developer artifacts into test scope and verification strategy.

4. **Verification rigor**  
   clear separation between test design, test execution, regression analysis, and gap reporting.

5. **Honest evidence reporting**  
   pass/fail/gap conclusions must be evidence-based, reproducible, and classification-driven.

6. **Full educational packaging**  
   each tester skill must include SKILL.md, examples, anti-examples, and reusable checklists/templates.

This feature is **not** a minimal placeholder. It is intended to be a complete tester-core capability layer suitable for downstream production use in the OpenCode expert package.

---

## 3. Scope

### 3.1 In Scope

#### A. Role Boundary Layer
Define tester role scope precisely:

- what tester must do
- what tester may do
- what tester must never do
- what tester escalates instead of deciding alone

This includes explicit boundaries against:

- developer substituting test evidence with self-check
- reviewer substituting systematic test execution
- docs/security responsibilities bleeding into tester outputs

#### B. Core Skills Layer (3 skills)

| Skill | Purpose |
|------|---------|
| `unit-test-design` | Turn changed behavior and risk areas into test cases and test structure |
| `regression-analysis` | Evaluate what existing behavior may be affected and what must be re-verified |
| `edge-case-matrix` | Identify, organize, and report boundary conditions, invalid inputs, and scenario coverage |

#### C. Artifact Contract Layer (3 artifacts)

| Artifact | Purpose |
|---------|---------|
| `test-scope-report` | Defines what is being tested, why it is in scope, and what is intentionally out of scope |
| `verification-report` | Records tests designed/run, pass/fail summary, evidence, blockers, and coverage gaps |
| `regression-risk-report` | Explains regression surfaces, risk prioritization, and required follow-up verification |

#### D. Quality and Validation Layer
The feature must define:

- upstream-consumability checklist for consuming developer outputs
- downstream-consumability checklist for reviewer/acceptance consumers
- failure-mode checklist for tester work
- anti-pattern guidance for weak or misleading test reporting
- evidence-quality rules
- failure classification model

#### E. Educational and Example Layer
Each tester skill must include:

- `SKILL.md`
- `examples/`
- `anti-examples/`
- `templates/` or `checklists/`

#### F. Interface Layer
Define:

- how tester consumes `implementation-summary`, `self-check-report`, and `bugfix-report`
- how tester hands off to reviewer
- how tester reports blocked states or unresolved design/spec conflicts

### 3.2 Out of Scope

1. `006-reviewer-core` implementation
2. `007-docs-core` implementation
3. `008-security-core` implementation
4. repository-wide automated CI test framework buildout
5. business-specific test code for a real product feature
6. advanced testing specialties beyond core foundation, such as:
   - `performance-test-planning`
   - `fuzz-test-workflow`
   - `compatibility-matrix-testing`
   - `chaos-or-failure-injection`
   - `test-environment-provisioning`

---

## 4. Actors

### 4.1 Primary Actor: tester

**Mission**: build a verification loop that demonstrates whether implementation satisfies intended behavior, highlights uncovered risk, and provides trustworthy evidence for downstream decision makers.

**Responsibilities**:

- consume developer outputs and derive test scope
- design tests against expected behavior and risk areas
- run or specify tests and record evidence honestly
- classify failures into actionable categories
- analyze regression surfaces beyond the immediate change
- identify edge cases and document uncovered gaps
- escalate when spec/design/implementation conflict makes testing ambiguous

**Non-Responsibilities**:

- rewriting business logic to make tests pass
- replacing developer for implementation work
- replacing reviewer for final approval judgment
- silently ignoring gaps because “main path passed”
- overstating evidence quality when only partial verification exists
- redefining spec or acceptance criteria on behalf of management

### 4.2 Upstream Provider: developer

Tester must formally consume the following developer-side artifacts and fields:

| Upstream Artifact / Field | Purpose for Tester |
|---------------------------|--------------------|
| `implementation-summary.goal_alignment` | derive expected behavior and acceptance targets |
| `implementation-summary.changed_files` | establish impacted surface |
| `implementation-summary.known_issues` | avoid false positives and document known limitations |
| `implementation-summary.risks` | prioritize high-risk testing |
| `implementation-summary.tests_included` | understand existing test assets |
| `self-check-report` | distinguish self-check from independent verification |
| `bugfix-report.root_cause` | design regression checks against recurrence |

### 4.3 Downstream Consumers

| Role | Consumes |
|------|----------|
| `reviewer` | test-scope-report, verification-report, regression-risk-report |
| `acceptance` / management layer | overall pass/fail/gap evidence and recommendations |
| `developer` | actionable failures, uncovered gaps, repro summaries |

---

## 5. Core Workflows

### 5.1 Workflow 1: Verification of New Feature or Change

```text
implementation-summary + self-check-report
→ test-scope derivation
→ unit-test-design
→ edge-case-matrix
→ test execution / evidence collection
→ verification-report
→ regression-analysis
→ regression-risk-report
→ handoff to reviewer
```

### 5.2 Workflow 2: Bugfix Verification

```text
bugfix-report + implementation-summary
→ root-cause-aware test design
→ repro check for original issue
→ non-regression verification
→ verification-report
→ regression-risk-report
```

### 5.3 Workflow 3: Ambiguity / Conflict Escalation

```text
spec vs implementation mismatch
or
developer claims cannot be independently verified
or
test environment prevents trustworthy result
→ tester documents blocker
→ classify issue type
→ escalate to developer / architect / management as appropriate
```

---

## 6. Business Rules

### BR-001: Tester Must Consume Developer Evidence, Not Ignore It
Tester work must begin from structured developer artifacts, not from informal assumptions.

**Implication**: no tester output should skip upstream artifact interpretation.

### BR-002: Self-Check Is Not Independent Verification
Developer self-check may inform testing, but cannot replace tester evidence.

**Implication**: tester must explicitly distinguish “developer self-check” from “independent verification”.

### BR-003: Every Verification Report Must State Coverage Boundaries
Tester must document what was tested, what was not tested, and why.

**Implication**: “all good” without scope boundaries is invalid.

### BR-004: Failures Must Be Classified
Every failed test or blocked verification must be classified into one of:

- implementation issue
- test issue
- environment issue
- design/spec issue
- dependency/upstream issue

**Implication**: raw failure dumps without classification are insufficient.

### BR-005: Edge Cases Are Mandatory, Not Optional Polish
Tester must assess edge and invalid scenarios appropriate to the change.

**Implication**: happy-path-only testing is incomplete by default.

### BR-006: Regression Thinking Is Required
Tester must evaluate impact beyond the immediate changed code path.

**Implication**: passing targeted tests is not enough if adjacent surfaces remain unassessed.

### BR-007: Honesty Over False Confidence
When evidence is partial, tester must report partial confidence.

**Implication**: blocked, partial, or assumption-heavy verification must not be framed as full pass.

### BR-008: Tester Must Not Mutate Production Logic to Make Validation Pass
If implementation changes are required, tester escalates back to developer.

**Implication**: tester may add/adjust test assets but must not silently repair business behavior.

### BR-009: Use 6-Role Formal Semantics
All primary descriptions use architect/developer/tester/reviewer/docs/security terminology.

**Implication**: legacy 3-skill terminology only appears in mapping notes if needed.

---

## 7. Artifact Contracts

### AC-001: `test-scope-report`

**Purpose**: define what tester is verifying, why it is in scope, and how scope was derived.

**Required Fields**:

| Field | Description |
|------|-------------|
| `input_artifacts` | developer artifacts consumed |
| `goal_under_test` | expected behavior or acceptance target being verified |
| `changed_surface` | files/modules/flows under test |
| `risk_priorities` | high-risk areas ranked for testing |
| `test_strategy` | overall verification approach |
| `in_scope_items` | scenarios explicitly included |
| `out_of_scope_items` | scenarios intentionally excluded |
| `assumptions` | assumptions that shape test design |
| `environment_requirements` | tools/data/setup required |
| `recommendation` | PROCEED, BLOCKED, or ESCALATE |

**Primary Consumers**: reviewer, management layer

### AC-002: `verification-report`

**Purpose**: record what tests were designed/run, what passed/failed, and what remains unknown.

**Required Fields**:

| Field | Description |
|------|-------------|
| `test_scope_reference` | link or mapping to test-scope-report |
| `tests_added_or_run` | tests created, modified, or executed |
| `execution_summary` | overview of execution status |
| `pass_cases` | verified passing scenarios |
| `failed_cases` | failed scenarios with identifiers |
| `failure_classification` | categorized failure reasons |
| `evidence` | logs, outputs, assertions, or reproducible observations |
| `coverage_gaps` | uncovered or insufficiently verified areas |
| `edge_cases_checked` | edge conditions explicitly assessed |
| `blocked_items` | items blocked by environment/spec/dependency issues |
| `confidence_level` | FULL / PARTIAL / LOW with rationale |
| `recommendation` | PASS_TO_REVIEW, REWORK, RETEST, or ESCALATE |

**Primary Consumers**: reviewer, developer, acceptance layer

### AC-003: `regression-risk-report`

**Purpose**: explain what adjacent or historical behavior might regress and how that risk was addressed.

**Required Fields**:

| Field | Description |
|------|-------------|
| `change_anchor` | what change or bugfix triggered regression analysis |
| `regression_surfaces` | nearby impacted behaviors/modules |
| `existing_tests_reused` | existing tests used for regression confidence |
| `new_regression_checks` | additional checks added for recurrence prevention |
| `untested_regression_areas` | risk surfaces not yet covered |
| `risk_ranking` | severity / likelihood prioritization |
| `follow_up_actions` | recommended next actions |
| `recommendation` | ACCEPT_RISK, REWORK, or ESCALATE |

**Primary Consumers**: reviewer, developer, management layer

---

## 8. Acceptance Criteria

### AC-001: Feature Package Complete
The feature must contain:

- `spec.md`
- `plan.md`
- `tasks.md`
- `completion-report.md`
- role/interface/validation documents required by the plan

### AC-002: Tester Role Scope Formalized
The repository must clearly define tester responsibilities, non-responsibilities, escalation conditions, and upstream/downstream interfaces.

### AC-003: Core Skills Formally Implemented
All 3 core tester skills must exist as first-class skills with role-appropriate boundaries.

### AC-004: Artifact Contracts Defined
All 3 tester artifact contracts must be documented with required fields and intended consumers.

### AC-005: Upstream Consumption Logic Clear
The feature must explicitly map how tester consumes developer artifacts from `004-developer-core`.

### AC-006: Downstream Evidence Logic Clear
The feature must explicitly define how reviewer and acceptance layers consume tester outputs.

### AC-007: Skill Assets Complete
Each of the 3 skills must include:

- 1 `SKILL.md`
- at least 2 examples
- at least 2 anti-examples
- at least 1 checklist or template

### AC-008: Failure Classification Model Present
The feature must define a reusable failure classification model for tester outputs.

### AC-009: Anti-Pattern Guidance Present
The feature must document common tester failure patterns and how to detect/prevent/remediate them.

### AC-010: Scope Boundary Maintained
No reviewer/docs/security implementation may be smuggled into 005.

### AC-011: First-Class Verification Role Established
The resulting feature must make tester operable as a true intermediate verification layer between developer and reviewer.

---

## 9. Required Deliverables

### 9.1 Feature Documents
Recommended file set:

```text
specs/005-tester-core/
├── spec.md
├── plan.md
├── tasks.md
├── completion-report.md
├── role-scope.md
├── upstream-consumption.md
├── downstream-interfaces.md
├── contracts/
│   ├── test-scope-report-contract.md
│   ├── verification-report-contract.md
│   └── regression-risk-report-contract.md
├── validation/
│   ├── upstream-consumability-checklist.md
│   ├── downstream-consumability-checklist.md
│   ├── failure-mode-checklist.md
│   └── anti-pattern-guidance.md
└── examples/
    ├── feature-verification-example.md
    ├── bugfix-verification-example.md
    └── blocked-test-example.md
```

### 9.2 Skill Deliverables
Recommended skill targets:

```text
.opencode/skills/6-role/tester/
├── unit-test-design/
│   ├── SKILL.md
│   ├── examples/
│   ├── anti-examples/
│   └── checklists/
├── regression-analysis/
│   ├── SKILL.md
│   ├── examples/
│   ├── anti-examples/
│   └── checklists/
└── edge-case-matrix/
    ├── SKILL.md
    ├── examples/
    ├── anti-examples/
    └── checklists/
```

### 9.3 README / Governance Sync
If repository status tracking requires it, implementation should also update:

- feature status in `README.md`
- “current progress” statement in `README.md`
- any tester skill inventory sections that should move from placeholder to implemented state

This sync is not the core functional output of 005, but it is required for governance consistency when the feature completes.

---

## 10. Suggested Implementation Phases

### Phase 1: Role and Interface Foundation
Deliverables:

- `spec.md`
- `plan.md`
- `tasks.md`
- `role-scope.md`
- `upstream-consumption.md`
- `downstream-interfaces.md`

Focus:

- tester role scope and boundary
- formal mapping from developer outputs to tester inputs
- definition of reviewer-facing evidence expectations

### Phase 2: Artifact Contract Establishment
Deliverables:

- `contracts/test-scope-report-contract.md`
- `contracts/verification-report-contract.md`
- `contracts/regression-risk-report-contract.md`

Focus:

- field completeness
- consumer clarity
- recommendation/status semantics

### Phase 3: Skill Formalization
Deliverables:

- 3 tester skills with full support assets

Focus:

- skill boundaries
- reusable method guidance
- examples and anti-examples rooted in actual tester role behavior

### Phase 4: Validation and Quality Layer
Deliverables:

- upstream-consumability checklist
- downstream-consumability checklist
- failure-mode checklist
- anti-pattern guidance

Focus:

- evidence quality
- failure honesty
- role purity
- downstream usability

### Phase 5: Completion Audit and Governance Sync
Deliverables:

- `completion-report.md`
- any necessary README status sync

Focus:

- acceptance criteria evidence
- status truthfulness
- repository consistency

---

## 11. Failure Modes and Anti-Patterns to Cover

At minimum, the feature should document the following tester failure patterns:

1. **Happy-path-only verification**  
   only main flow is tested; edge conditions ignored.

2. **Evidence-free pass claim**  
   report says “passed” without traceable evidence.

3. **Self-check confusion**  
   developer self-check is restated as tester verification.

4. **Unclassified failures**  
   failures listed with no determination of issue type.

5. **No coverage gap disclosure**  
   report omits what was not tested.

6. **No regression thinking**  
   only changed line/path is tested; nearby surfaces ignored.

7. **Spec ambiguity hidden instead of escalated**  
   tester silently picks an interpretation and reports confidence as if requirements were clear.

8. **Business logic mutation by tester**  
   tester adjusts production behavior rather than reporting failure back to developer.

9. **Environment block misreported as implementation failure**  
   noisy diagnosis leads to wrong rework direction.

10. **False completeness language**  
   partial verification described as comprehensive pass.

---

## 12. Open Questions to Resolve During Implementation

These should be resolved honestly in `plan.md` or related documents:

### OQ-001: Recommendation Vocabulary Granularity
Should tester recommendation vocabulary remain compact (`PASS_TO_REVIEW / REWORK / ESCALATE`) or include finer states like `RETEST_REQUIRED` and `ACCEPT_WITH_GAPS`?

**Initial Direction**: use a compact primary vocabulary with optional status qualifiers if needed.

### OQ-002: Evidence Format Standardization
Should evidence be standardized as structured fields only, or allow freeform evidence sections with recommended formatting?

**Initial Direction**: require structured fields, allow freeform details inside each field.

### OQ-003: Automated vs Manual Verification Distinction
How explicitly should the feature separate automated tests, manual verification, and reasoning-based checks?

**Initial Direction**: make this distinction mandatory in `verification-report`.

### OQ-004: Compatibility with Existing Bootstrap Skills
How much legacy `task-executor` compatibility should be documented?

**Initial Direction**: keep compatibility notes minimal; preserve 6-role semantics as primary.

---

## 13. Non-Goals and Guardrails

The following must be avoided during 005 implementation:

- turning tester into a generic QA encyclopedia disconnected from repository workflows
- implementing advanced specialty testing instead of core verification foundation
- redefining reviewer approval semantics inside tester docs
- allowing tester to “fix implementation silently” as part of testing workflow
- writing vague test guidance that cannot be consumed by downstream roles
- claiming completion without examples / anti-examples / checklists

---

## 14. Definition of Done

`005-tester-core` is done only when all of the following are true:

1. tester role scope is explicit and aligned with canonical role semantics
2. all 3 tester core skills are implemented with complete support assets
3. all 3 tester artifact contracts are documented with required fields
4. developer-to-tester input mapping is formally documented
5. tester-to-reviewer handoff is formally documented
6. validation and anti-pattern guidance exists and is usable
7. completion report honestly validates acceptance criteria
8. repository governance docs that require status sync are updated

---

## 15. Recommended `/spec-start` Prompt for OpenCode

Use the following as your first command to OpenCode.

```text
/spec-start

Feature: 005-tester-core
Title: Tester Core Skills System

Please create a full feature spec for `005-tester-core` in this repository.
This is not a minimal bootstrap feature. Build it as a complete first-class tester capability system aligned with the 6-role model.

Required goals:
1. Establish `tester` as the formal verification role between developer and reviewer.
2. Implement 3 core tester skills:
   - unit-test-design
   - regression-analysis
   - edge-case-matrix
3. Define 3 formal tester artifacts:
   - test-scope-report
   - verification-report
   - regression-risk-report
4. Explicitly consume upstream outputs from `004-developer-core`, especially:
   - implementation-summary.goal_alignment
   - implementation-summary.changed_files
   - implementation-summary.known_issues
   - implementation-summary.risks
   - self-check-report
   - bugfix-report where relevant
5. Define downstream handoff to reviewer / acceptance.
6. Include validation layer, failure-mode checklist, anti-pattern guidance, examples, anti-examples, and reusable checklists/templates.
7. Maintain strict role boundaries: tester verifies, but does not silently repair business logic or replace reviewer.
8. Keep terminology aligned with the 6-role formal model and repository governance documents.

Expected output quality:
- full feature package, not a sketch
- clear acceptance criteria
- explicit artifact contracts
- honest status language
- downstream-consumable structure

Please start by producing `specs/005-tester-core/spec.md` and ensure it is rich enough to support subsequent `/spec-plan`, `/spec-tasks`, `/spec-implement`, and `/spec-audit` steps.
```

---

## 16. Suggested Follow-up Commands After `/spec-start`

After the spec is generated and you have reviewed it, use this sequence:

### Step 1

```text
/spec-plan
Please produce a detailed implementation plan for 005-tester-core based on the approved spec. The plan should include role/interface documents, artifact contracts, skill formalization, validation layer, completion audit, and any required README governance sync.
```

### Step 2

```text
/spec-tasks
Please break 005-tester-core into concrete implementation tasks with explicit deliverables, file targets, dependencies, and acceptance checks. Keep tasks aligned with the plan phases and avoid mixing reviewer/docs/security implementation into this feature.
```

### Step 3

```text
/spec-implement
Please implement 005-tester-core according to the approved spec, plan, and tasks. Deliver the full tester-core package, including skill assets, contract docs, validation docs, examples, anti-examples, and completion-report. Keep the feature honest, downstream-consumable, and governance-aligned.
```

### Step 4

```text
/spec-audit
Please audit 005-tester-core against its spec, plan, tasks, canonical governance docs, and actual repository outputs. Verify acceptance criteria, path correctness, status truthfulness, README sync, and downstream usability. Report all gaps honestly.
```

---

## 17. Practical Usage Note

If `/spec-start` generates something too thin, immediately push it back toward the intended bar with wording like this:

```text
This is too minimal. Rework 005-tester-core as a complete first-class tester capability system, not a placeholder. Strengthen role boundaries, upstream consumption from developer-core, artifact contracts, validation layer, and educational assets. The output must be robust enough to support direct downstream implementation.
```

