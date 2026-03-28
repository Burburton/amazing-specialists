# 008-security-core Feature Specification

## 1. Feature Metadata

- **Feature ID:** `008-security-core`
- **Feature Name:** `security` role core skills
- **Owner Role:** `security`
- **Status:** Proposed
- **Priority:** High
- **Depends On:**
  - `001-bootstrap`
  - `002-role-model-alignment`
  - `002b-governance-repair`
  - `003-architect-core`
  - `004-developer-core`
  - `005-tester-core`
  - `006-reviewer-core`
  - `007-docs-core`

---

## 2. Background and Current Repository State

The repository has already completed the formal core-skill implementation for `architect`, `developer`, `tester`, `reviewer`, and `docs`. README currently marks `008-security-core` as the next planned feature and describes it as the step that will complete the `security` role’s core capability set.

At the same time, the repository currently contains a governance inconsistency that this feature must address:

- `README.md` defines `security` as having **2 core skills** to be implemented by `008-security-core`:
  - `auth-and-permission-review`
  - `input-validation-review`
- `specs/skill-development-plan.md` still contains an older phase plan listing **4 security skills**:
  - `auth-and-permission-review`
  - `input-validation-review`
  - `secret-handling-review`
  - `dependency-risk-review`

This means `008-security-core` is not only a skill implementation feature, but also a governance-alignment feature. The implementation must make the repository state consistent again, with one authoritative scope clearly reflected in README, planning docs, reports, and examples.

---

## 3. Problem Statement

The OpenCode expert package now has a nearly complete 6-role execution model, but `security` is still the only formal role without implemented core capabilities. As a result:

1. The role model is incomplete.
2. Security-sensitive changes do not have a standardized review path.
3. The package lacks reusable security review methodology for AI execution agents.
4. The repository contains planning drift about what `security` actually includes in MVP scope.

Without `008-security-core`, the expert package cannot claim a complete role-based execution layer for higher-risk workstreams.

---

## 4. Goal

Implement the MVP core security capability for the OpenCode expert package so that the `security` role becomes a formal, usable, validated role in the 6-role execution model.

This feature should:

- formalize the `security` role’s MVP boundary,
- implement the agreed core security skills,
- define their artifact contracts and validation rules,
- provide educational materials and examples,
- integrate with command-driven workflows,
- and repair repository-level governance drift about the security scope.

---

## 5. Scope

### 5.1 In Scope

#### A. Formal MVP security scope definition

Decide and codify the authoritative MVP scope for `security`.

**Recommended canonical MVP scope for 008:**

- `auth-and-permission-review`
- `input-validation-review`

The additional items below should be treated as **future enhancements / backlog**, not core MVP scope for this feature unless the implementation explicitly expands the roadmap:

- `secret-handling-review`
- `dependency-risk-review`

#### B. Core skill implementation

Implement the two core security skills under the formal 6-role structure.

Expected skill paths:

- `.opencode/skills/security/auth-and-permission-review/`
- `.opencode/skills/security/input-validation-review/`

Each skill should include a complete reusable skill package consistent with the conventions established by the completed role-core features.

#### C. Artifact contracts

Define the required inputs, outputs, and decision semantics for each security skill.

Examples of expected artifact types include:

- security review request
- security findings report
- risk classification output
- remediation recommendation output
- escalation / block recommendation

#### D. Validation layer

Create machine-checkable or rule-checkable validation expectations for security outputs so that quality can be assessed consistently.

Validation should cover at least:

- required sections
- risk severity classification
- evidence grounding
- remediation actionability
- pass / needs-fix / block semantics
- no vague “security concern” statements without concrete rationale

#### E. Educational and usage materials

Provide examples, anti-pattern guidance, and role usage guidance so that the skills are understandable to both humans and agents.

#### F. Governance alignment updates

Update repository documentation so that the defined scope of `security` is consistent everywhere.

This must include at minimum review and alignment of:

- `README.md`
- `specs/skill-development-plan.md`
- any role or package overview docs that mention security role scope
- any verification/integration reports impacted by the new implementation

### 5.2 Out of Scope

Unless explicitly chosen as stretch work inside the implementation, this feature should **not** require:

- a full advanced AppSec framework,
- dependency scanning integration,
- secret scanning platform integration,
- threat modeling framework expansion,
- enterprise compliance mappings,
- runtime security enforcement,
- or redesign of the existing command system.

---

## 6. Target Capability Definition

After this feature is complete, the `security` role should be able to review proposed or implemented changes and produce structured, bounded, actionable security feedback for MVP-level product development tasks.

The role is **not** expected to replace a full security team. It is expected to provide a practical expert-package security guardrail for common development workflows.

---

## 7. Functional Requirements

### FR-001 Role completion

The repository shall formally support `security` as an implemented 6-role execution role, rather than a placeholder.

### FR-002 Skill: auth-and-permission-review

The repository shall provide a reusable skill for reviewing authentication, authorization, identity-boundary, and permission-related changes.

The skill should help evaluate topics such as:

- authentication flow misuse
- missing authorization checks
- privilege escalation risk
- role boundary confusion
- insecure default access behavior
- permission bypass via alternate flows

### FR-003 Skill: input-validation-review

The repository shall provide a reusable skill for reviewing input handling and validation-related changes.

The skill should help evaluate topics such as:

- missing input validation
- trust-boundary confusion
- unsafe assumptions about client input
- parser / deserialization risk at MVP level
- injection-prone patterns
- invalid-state propagation due to weak validation

### FR-004 Structured output contracts

Each security skill shall produce standardized outputs with explicit status and rationale.

At minimum, outputs should support:

- summary
- findings
- severity / risk level
- impacted surface
- evidence or reasoning trace
- recommended remediation
- final decision (`pass`, `needs-fix`, or `block`)

### FR-005 Actionability requirement

Security outputs shall be written so that a developer or reviewer can take corrective action directly.

The system shall avoid outputs like:

- “this may be insecure”
- “please improve validation”
- “consider permissions more carefully”

without concrete explanation, affected surface, and recommended change direction.

### FR-006 Validation support

The repository shall include validation rules or validation-oriented guidance sufficient to check whether security outputs satisfy the required structure and minimum quality bar.

### FR-007 Examples and anti-patterns

The repository shall include examples of good and bad usage for the security skills.

### FR-008 Workflow compatibility

The implemented security skills shall be compatible with the existing OpenCode package workflow and command structure.

This does not require new commands, but the implementation should make clear:

- when security review should be invoked,
- what artifacts it expects,
- and how it interacts with developer / reviewer / docs roles.

### FR-009 Governance repair

The repository shall eliminate the current scope mismatch between README and planning documentation regarding security skill count and MVP boundary.

---

## 8. Non-Functional Requirements

### NFR-001 Consistency with completed role-core features

`008-security-core` should follow the same structural and documentation quality patterns already established by completed role-core features.

### NFR-002 Clear MVP boundary

The feature must keep the MVP boundary tight and avoid scope explosion.

### NFR-003 Reusability

The skills should be reusable across multiple repositories / features, not written as one-off content for a single case.

### NFR-004 Auditability

Outputs should be easy to inspect and trace during `/spec-audit` and repository review.

### NFR-005 Practicality

Security guidance should be useful for real implementation review, not abstract policy prose.

---

## 9. Recommended Deliverables

The exact file set may vary with repository conventions, but the implementation should produce deliverables equivalent to the following.

### 9.1 Skill directories

- `.opencode/skills/security/auth-and-permission-review/...`
- `.opencode/skills/security/input-validation-review/...`

### 9.2 Security contracts / schemas / guidance

Files or sections that define:

- expected inputs
- expected outputs
- severity model
- decision semantics
- validation criteria

### 9.3 Examples / educational materials

Examples should include:

- positive examples
- boundary examples
- anti-pattern or failed examples

### 9.4 Spec artifacts

Under `specs/008-security-core/`, create a standard spec-driven feature workspace, likely including:

- `spec.md`
- `plan.md`
- `tasks.md`
- implementation notes / evidence artifacts as needed
- `completion-report.md`
- `audit-report.md` or equivalent if generated by workflow

### 9.5 Governance/documentation updates

Expected updates likely include:

- `README.md`
- `specs/skill-development-plan.md`
- role / package docs that mention security scope
- verification reports if milestone narratives change

---

## 10. Acceptance Criteria

### AC-001 Security role is formally implemented

The repository clearly shows `security` as an implemented formal role rather than a pending placeholder.

### AC-002 Two core security skills exist

The repository contains implemented skill packages for:

- `auth-and-permission-review`
- `input-validation-review`

### AC-003 Skill packages are complete

Each implemented skill package includes the expected materials used by the other completed role-core features, such as:

- role-facing instructions
- artifact expectations
- validation guidance
- examples / educational support

### AC-004 Output contracts are explicit

A reader can determine exactly what each skill consumes and produces.

### AC-005 Security review outputs are actionable

The skill outputs provide concrete findings and remediation guidance instead of vague warnings.

### AC-006 Governance mismatch is resolved

Repository docs no longer disagree about the MVP scope of `security`.

Accepted resolution options:

- **Preferred:** README and planning docs both define MVP security core as 2 skills, with the other 2 moved to future backlog.
- **Alternative:** if the implementation intentionally expands the feature, all docs consistently define security MVP as 4 skills and the repository actually implements that larger scope.

### AC-007 README progress is updated

README feature table and progress text accurately reflect post-implementation state.

### AC-008 Workflow compatibility is documented

The repository explains when and how the `security` role is invoked in relation to other roles.

### AC-009 Feature audit can pass

The implementation is structured so that `/spec-audit` can verify completeness, consistency, and documentation alignment.

---

## 11. Risks and Mitigations

### Risk 1: Scope creep

Because security is a broad domain, 008 may expand into advanced security governance work.

**Mitigation:** keep MVP limited to the agreed core review skills and document postponed skills explicitly.

### Risk 2: Repository inconsistency persists

The implementation may add skills but fail to update planning / README / reports.

**Mitigation:** treat governance alignment as a first-class acceptance criterion, not a nice-to-have.

### Risk 3: Outputs are too generic

A security skill may produce high-level warnings that are not useful in execution workflows.

**Mitigation:** require affected surface, concrete rationale, severity, and remediation in every non-pass finding.

### Risk 4: Overlap confusion with reviewer role

Security review may blur with reviewer responsibilities.

**Mitigation:** explicitly define that reviewer focuses on overall implementation quality and spec alignment, while security focuses on security-specific risk surfaces and block conditions.

---

## 12. Implementation Guidance for OpenCode

### 12.1 Suggested implementation posture

Use the established role-core feature pattern from `003`–`007` as the baseline template for structure, deliverables, and completion reporting.

### 12.2 Recommended sequencing inside 008

1. Inspect current `security` mentions across README, plans, and role docs.
2. Decide and document the authoritative MVP scope.
3. Create `specs/008-security-core/` and write the feature spec.
4. Implement the two security skill packages.
5. Add contracts, validation guidance, and examples.
6. Update README and planning/governance docs for alignment.
7. Run audit and repair any consistency gaps.

### 12.3 Recommended decision on scope mismatch

Unless there is a strong repository-wide decision to enlarge MVP now, prefer the **2-skill MVP interpretation** because that matches the current README and visible progress narrative.

The other two security skills should be captured as future work rather than silently dropped.

---

## 13. Definition of Done

`008-security-core` is done when all of the following are true:

1. The `security` role has implemented core skills in the formal `.opencode/skills/security/` path.
2. The implemented scope is clearly documented and consistent across repository documents.
3. Skill outputs, validation rules, and examples are present.
4. README reflects completion accurately.
5. `/spec-audit` can verify the feature without unresolved scope confusion.

---

## 14. Suggested Future Follow-Ups

These should not block 008 completion unless the implementation explicitly expands scope:

- `009-security-extended` for:
  - `secret-handling-review`
  - `dependency-risk-review`
- stronger security invocation rules in workflow orchestration
- optional integration with security-oriented verification reports

---

## 15. One-Sentence Feature Summary

`008-security-core` completes the formal 6-role MVP by implementing the `security` role’s core review skills, adding structured security review contracts, and repairing repository-wide scope drift about what security means in the expert package.
