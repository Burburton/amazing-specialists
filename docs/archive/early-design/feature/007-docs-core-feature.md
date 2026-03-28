# 007-docs-core Feature Specification

## 1. Feature Metadata

- **Feature ID:** `007-docs-core`
- **Feature Name:** `docs` role core skills
- **Target Role:** `docs`
- **Status:** Proposed
- **Priority:** P1
- **Depends On:**
  - `001-bootstrap`
  - Common skills foundation
  - `003-architect-core`
  - `004-developer-core`
  - `005-tester-core`
- **Related Planned Feature:** `008-security-core`

---

## 2. Background

The repository has already completed the first three formal core-role features:

- `003-architect-core`
- `004-developer-core`
- `005-tester-core`

According to the current roadmap in `README.md`, `007-docs-core` is the formal feature for the `docs` role, and its responsibility is to implement the docs role’s core documentation synchronization capability.

At the moment, the docs role exists in the repository structure and role model, but its core skills are still marked as **pending**. This creates an execution gap:

1. implementation changes may land without synchronized README / docs updates;
2. change history may be incomplete or inconsistent;
3. spec-driven delivery can pass implementation and testing but still fail repository-level documentation integrity;
4. the current 6-role model remains incomplete because the docs role is defined but not yet operationalized.

This feature closes that gap by formally implementing the docs role’s P1 core skills and their artifact / validation / educational support.

---

## 3. Goal

Deliver the minimum but formal `docs` role core capability so OpenCode can:

1. detect documentation surfaces affected by a change;
2. update README and related docs in a scoped, consistency-preserving way;
3. produce structured changelog entries from completed work;
4. emit standard artifacts and validation signals consistent with the rest of the expert package.

---

## 4. Scope

### In Scope

This feature should formally implement the following two docs skills listed in the repository roadmap:

1. `readme-sync`
2. `changelog-writing`

The feature should include:

- skill directories under `.opencode/skills/docs/`
- each skill’s `SKILL.md`
- role-aligned input/output contract definition
- artifact templates or examples where needed
- validation checklist / acceptance guidance
- educational material or usage examples consistent with prior role-core features
- repository documentation updates reflecting that `007-docs-core` is implemented

### Out of Scope

Do **not** include these deferred docs-role enhancements in this feature unless strictly necessary as supporting notes:

- `architecture-doc-sync`
- `user-guide-update`
- broad product documentation system redesign
- automated release tooling outside the docs role skill boundary

---

## 5. Problem Statement

The current repository already defines docs as one of the 6 formal execution roles, but it does not yet provide operational docs-role skills. As a result:

- repository-level documentation consistency depends on ad hoc behavior instead of explicit role capability;
- README state, feature status, and completion reports can diverge;
- changelog updates are not guaranteed to happen as part of the execution loop;
- the expert package remains weaker at “delivery completion” than at “implementation completion”.

The docs role should become the formal owner of documentation synchronization after feature implementation, test completion, review outcomes, and audit-driven repairs.

---

## 6. Expected Outcomes

After `007-docs-core` is completed:

1. OpenCode has a usable `docs` role with formal core skills;
2. README / project-status / skill-status updates can be executed via a standardized docs skill rather than ad hoc patching;
3. changelog entries can be generated in a structured and reusable format;
4. the 6-role formal execution model is more complete;
5. later `008-security-core` can build on a cleaner documentation baseline.

---

## 7. Skill Requirements

### 7.1 Skill: `readme-sync`

#### Purpose
Synchronize repository-level documentation after a feature or repair changes system capabilities, feature status, skill coverage, usage guidance, or development progress.

#### Core Responsibilities

- identify which top-level or role-facing docs are impacted by a completed change;
- update `README.md` consistently with the authoritative implementation state;
- preserve naming, progress tables, role-model terminology, and roadmap ordering;
- avoid over-updating unrelated sections;
- explain what changed and why in a structured report.

#### Minimum Inputs

- feature spec / implementation summary;
- completion report or audit result;
- current README and affected docs;
- repository conventions for status wording and naming.

#### Minimum Outputs

- updated README or documentation patch;
- structured sync report including:
  - touched sections;
  - reason for each change;
  - consistency checks performed;
  - unresolved ambiguities, if any.

#### Required Behavior

- prefer minimal, high-signal edits;
- keep status wording aligned with actual completion evidence;
- do not declare a feature fully complete when evidence says partial or pending;
- maintain consistency between feature tables, current-progress text, and skill listings;
- use 6-role terminology rather than regressing to legacy 3-skill framing.

---

### 7.2 Skill: `changelog-writing`

#### Purpose
Generate consistent changelog entries for completed features, repairs, and significant governance / capability updates.

#### Core Responsibilities

- summarize what changed in user-facing or maintainer-facing language;
- capture scope, impact, and notable repository changes;
- distinguish new capability, repair, and documentation-only updates;
- produce changelog text that can be inserted with minimal manual rewriting.

#### Minimum Inputs

- implementation summary;
- changed files or change categories;
- feature completion state;
- related feature ID and title.

#### Minimum Outputs

- structured changelog entry;
- optional summary bullets grouped by capability / docs / validation / repair.

#### Required Behavior

- avoid overstating feature completeness;
- clearly identify whether the entry is for feature delivery, repair, or follow-up;
- keep wording concise, maintainable, and suitable for repeated repository usage;
- preserve release-note readability.

---

## 8. Deliverables

The feature should produce at least the following deliverables.

### 8.1 Skill Assets

Under `.opencode/skills/docs/`:

- `.opencode/skills/docs/readme-sync/SKILL.md`
- `.opencode/skills/docs/changelog-writing/SKILL.md`

Each skill should define:

- purpose
- invocation situations
- required inputs
- expected outputs
- constraints / non-goals
- examples
- quality checklist

### 8.2 Role-Level Support Artifacts

Recommended artifacts for this feature:

- docs sync report template
- changelog entry template
- example input/output pairs
- validation checklist for docs role outputs

### 8.3 Spec-Driven Project Files

Under `specs/007-docs-core/`, create the standard feature folder and enough project artifacts to support spec-driven execution, typically including:

- `spec.md`
- `plan.md`
- `tasks.md`
- `implementation-notes.md` or equivalent working notes
- `completion-report.md`
- audit outputs if your repository flow generates them

### 8.4 Repository Documentation Updates

At completion, update repository-facing documentation, including as needed:

- `README.md`
- any skill usage guide or development plan references that should reflect 007 completion
- any status table or progress narrative impacted by this feature

---

## 9. Acceptance Criteria

### AC-001 Docs Skills Exist
The repository contains formal docs-role skill directories and `SKILL.md` files for `readme-sync` and `changelog-writing`.

### AC-002 Skill Contracts Are Explicit
Each docs skill clearly defines trigger conditions, inputs, outputs, constraints, and examples.

### AC-003 Docs Sync Behavior Is Actionable
`readme-sync` includes enough guidance for OpenCode to:

- determine what documentation sections need updating;
- keep README status language consistent with evidence;
- avoid unrelated documentation churn.

### AC-004 Changelog Behavior Is Actionable
`changelog-writing` includes enough guidance for OpenCode to generate consistent changelog entries for completed work and repairs.

### AC-005 Validation Layer Exists
The feature includes a docs-role validation mechanism such as checklists, quality gates, or explicit acceptance rubrics.

### AC-006 Educational / Example Material Exists
The feature includes examples or templates showing correct usage of the two docs skills.

### AC-007 Repository State Is Updated
Repository-level progress documentation reflects that `007-docs-core` has been implemented, and the docs role is no longer marked pending.

### AC-008 Consistency Is Preserved
README progress table, current-progress text, and skill status wording remain internally consistent after the feature lands.

---

## 10. Non-Functional Requirements

### 10.1 Consistency First
This feature must optimize for consistency, traceability, and minimal ambiguity rather than creative documentation rewriting.

### 10.2 Minimal Surface Area
Docs updates should be scoped to what changed. Avoid repository-wide prose rewrites unless necessary for correctness.

### 10.3 Evidence-Based Statusing
Any feature-status wording must be grounded in completion reports, audit outcomes, or explicit implementation evidence.

### 10.4 Reusability
The docs skills should be reusable across future features, especially for `006-reviewer-core`, `008-security-core`, and later repairs.

---

## 11. Suggested Implementation Approach

1. Create the docs role skill folders and draft both `SKILL.md` files.
2. Define a shared output structure for docs sync reports and changelog entries.
3. Add examples that show:
   - a README status correction;
   - a feature-completion changelog entry;
   - a repair/follow-up changelog entry.
4. Add validation criteria for correctness, scope control, and status consistency.
5. Update repository progress surfaces after implementation is complete.
6. Run `/spec-audit` and repair any consistency gaps found.

---

## 12. Suggested File/Directory Targets

Possible target paths include:

```text
.opencode/skills/docs/readme-sync/SKILL.md
.opencode/skills/docs/changelog-writing/SKILL.md
specs/007-docs-core/spec.md
specs/007-docs-core/plan.md
specs/007-docs-core/tasks.md
specs/007-docs-core/completion-report.md
README.md
CHANGELOG.md
```

You may add supporting example or template files if they improve clarity and keep the package aligned with earlier role-core features.

---

## 13. Risks and Guardrails

### Risk 1: Over-updating documentation
The docs role may rewrite broad sections unnecessarily.

**Guardrail:** require scoped changes and touched-section reporting.

### Risk 2: Status inflation
The docs role may mark a feature complete without enough evidence.

**Guardrail:** require evidence-based status language and consistency checks.

### Risk 3: Drift between README and completion artifacts
README may say one thing while completion reports say another.

**Guardrail:** make cross-document consistency a required validation step.

### Risk 4: Docs role becomes too broad
The feature could drift into general knowledge management.

**Guardrail:** restrict `007-docs-core` to `readme-sync` and `changelog-writing` as the formal core.

---

## 14. Definition of Done

`007-docs-core` is done when:

- the two docs skills exist and are usable;
- their contracts, examples, and validation guidance are complete;
- repository progress documentation reflects the new state accurately;
- the feature passes implementation + audit without unresolved documentation consistency gaps.

---

## 15. Direct Instruction for OpenCode

Implement `007-docs-core` as the formal docs-role core feature for the OpenCode expert package.

Use the repository’s spec-driven workflow.

Mandatory focus:

- implement `readme-sync`
- implement `changelog-writing`
- include explicit contracts, examples, and validation guidance
- update repository progress documentation consistently
- preserve 6-role terminology and avoid regressions into legacy 3-skill framing

Do not expand scope into `architecture-doc-sync` or `user-guide-update` except as future-work notes.
