# 007-docs-core Implementation Tasks

## Document Status
- **Feature ID**: `007-docs-core`
- **Version**: 1.0.0
- **Status**: Complete
- **Created**: 2026-03-26
- **Completed**: 2026-03-27
- **Based On**: `specs/007-docs-core/plan.md` v1.0.0

---

## Task Overview

This document breaks down the 007-docs-core implementation into small, executable, reviewable tasks organized into 7 phases.

**Total Tasks**: 38
**Completed**: 38
**Completion Rate**: 100%
**Estimated Duration**: 7 days
**Parallel-Safe Tasks**: Marked with `[P]`

---

## Phase 1: Role Scope Finalization

*Focus: Define docs role boundaries, upstream/downstream interfaces, and governance alignment*

### Task 1.1: Define Docs Role Scope
- **Task ID**: T1.1
- **Title**: Create role-scope.md with docs boundaries
- **Purpose**: Formalize docs responsibilities, in-scope/out-of-scope boundaries, and escalation rules aligned with role-definition.md Section 5
- **Related Requirements**: BR-007, AC-002, AC-010
- **Files to Modify**:
  - `specs/007-docs-core/role-scope.md` (new)
- **Expected Outputs**:
  - Complete role-scope.md with:
    - Mission statement (documentation synchronization)
    - In-scope / out-of-scope boundaries
    - Trigger conditions
    - Required/optional inputs from architect/developer/tester/reviewer
    - Expected outputs (docs-sync-report, changelog-entry)
    - Escalation rules (when to escalate vs document)
    - Explicit prohibition on implementation code modification (BR-007)
    - Status truthfulness discipline (BR-008)
- **Dependency / Ordering Notes**: None (can start immediately)
- **Acceptance Checks**:
  - [ ] No conflicts with role-definition.md Section 5
  - [ ] Upstream (architect/developer/tester/reviewer) and downstream (maintainers/users) roles can understand boundaries
  - [ ] Explicit prohibition on implementation code modification (BR-007)
  - [ ] 6-role terminology used consistently (no legacy 3-skill terms)
  - [ ] BR-008 status truthfulness documented

- **Status**: ✅ COMPLETE

### Task 1.2: Define Upstream Interface from Architect/Developer/Tester/Reviewer [P]
- **Task ID**: T1.2
- **Title**: Create upstream-consumption.md for upstream artifacts
- **Purpose**: Define how docs consumes outputs from 003-architect-core, 004-developer-core, 005-tester-core, 006-reviewer-core
- **Related Requirements**: BR-001, BR-003, AC-005
- **Files to Modify**:
  - `specs/007-docs-core/upstream-consumption.md` (new)
- **Expected Outputs**:
  - Complete upstream-consumption.md with:
    - Mapping from architect artifacts (design-note, open-questions)
    - Mapping from developer artifacts (implementation-summary, self-check-report, bugfix-report)
    - Mapping from tester artifacts (verification-report, regression-risk-report)
    - Mapping from reviewer artifacts (acceptance-decision-record, review-findings-report)
    - Mapping from feature completion (completion-report.md, spec.md)
    - Field-by-field consumption guide
    - BR-001 compliance: Consume evidence, not speculation
    - Examples of correct consumption
- **Dependency / Ordering Notes**: Can parallel with T1.1, T1.3
- **Acceptance Checks**:
  - [ ] All upstream artifacts from 003/004/005/006 mapped to docs inputs
  - [ ] Explicit BR-001 compliance (evidence-based, not speculation)
  - [ ] Examples of correct consumption provided
  - [ ] Missing data handling documented

- **Status**: ✅ COMPLETE

### Task 1.3: Define Downstream Interface to Maintainers/Users/OpenClaw [P]
- **Task ID**: T1.3
- **Title**: Create downstream-interfaces.md for maintainer/user/OpenClaw handoff
- **Purpose**: Define docs handoff to maintainers, users, and OpenClaw management layer
- **Related Requirements**: AC-006
- **Files to Modify**:
  - `specs/007-docs-core/downstream-interfaces.md` (new)
- **Expected Outputs**:
  - Complete downstream-interfaces.md with:
    - What maintainers receive from docs (changelog-entry for release notes)
    - What users receive from docs (updated README with accurate status)
    - What OpenClaw receives from docs (docs-sync-report for acceptance verification)
    - What future features receive from docs (baseline documentation state)
    - Blocked state handling (escalation vs documentation)
    - Recommendation vocabulary (sync-complete / needs-follow-up / blocked)
- **Dependency / Ordering Notes**: Can parallel with T1.1, T1.2
- **Acceptance Checks**:
  - [ ] Maintainer consumption path defined
  - [ ] User consumption path defined
  - [ ] OpenClaw consumption path defined
  - [ ] Blocked state handling documented
  - [ ] Recommendation vocabulary defined

- **Status**: ✅ COMPLETE

---

## Phase 2: Skill Formalization

*Focus: Formalize 2 core docs skills with complete guidance*

### Task 2.1: Formalize readme-sync Skill
- **Task ID**: T2.1
- **Title**: Enhance readme-sync SKILL.md with complete guidance
- **Purpose**: Transform existing readme-sync skill into formal first-class skill with explicit role boundaries and BR-002/BR-003/BR-004/BR-005/BR-008 compliance
- **Related Requirements**: SKILL-001, BR-002, BR-003, BR-004, BR-005, BR-008, AC-003
- **Files to Modify**:
  - `.opencode/skills/docs/readme-sync/SKILL.md` (enhance)
- **Expected Outputs**:
  - Enhanced SKILL.md with:
    - Explicit BR-002 compliance section (minimal surface area discipline)
    - BR-003 integration (evidence-based statusing)
    - BR-004 compliance (6-role terminology)
    - BR-005 integration (cross-document consistency checks)
    - BR-008 compliance (status truthfulness)
    - Examples showing consumption of upstream artifacts
    - Step-by-step docs sync workflow
    - Input/output specifications
    - Role boundary clarifications
    - Failure modes documentation
- **Dependency / Ordering Notes**: Depends on T1.1, T1.2 (role boundaries and upstream interface defined)
- **Acceptance Checks**:
  - [ ] BR-002 explicitly addressed (minimal surface area)
  - [ ] BR-003 documented (evidence-based statusing)
  - [ ] BR-004 documented (6-role terminology)
  - [ ] BR-005 documented (cross-document consistency)
  - [ ] BR-008 documented (status truthfulness)
  - [ ] Upstream consumption documented
  - [ ] Role boundaries clear (no code modification)
  - [ ] Workflow steps executable
  - [ ] At least 2 examples created (in separate files)
  - [ ] At least 2 anti-examples created (in separate files)
  - [ ] At least 1 template created (in separate files)

- **Status**: ✅ COMPLETE

### Task 2.2: Formalize changelog-writing Skill [P]
- **Task ID**: T2.2
- **Title**: Enhance changelog-writing SKILL.md with complete guidance
- **Purpose**: Transform existing changelog-writing skill into formal first-class skill with BR-006 compliance and contract alignment
- **Related Requirements**: SKILL-002, BR-006, AC-003
- **Files to Modify**:
  - `.opencode/skills/docs/changelog-writing/SKILL.md` (enhance)
- **Expected Outputs**:
  - Enhanced SKILL.md with:
    - BR-006 compliance (distinguish change types: feature/repair/docs-only/governance)
    - Examples showing changelog generation from completion context
    - Integration with docs-sync-report workflow
    - Step-by-step changelog writing workflow
    - Input/output specifications
    - Role boundary clarifications
    - Failure modes documentation
- **Dependency / Ordering Notes**: Depends on T1.1 (role boundaries defined)
- **Acceptance Checks**:
  - [ ] BR-006 explicitly addressed (change type distinction)
  - [ ] All 4 change types documented
  - [ ] Upstream consumption documented
  - [ ] Role boundaries clear
  - [ ] At least 2 examples created
  - [ ] At least 2 anti-examples created
  - [ ] At least 1 template created

- **Status**: ✅ COMPLETE

---

## Phase 3: Artifact Contract Establishment

*Focus: Define 2 artifact contracts with complete schemas*

### Task 3.1: Create docs-sync-report Contract [P]
- **Task ID**: T3.1
- **Title**: Define docs-sync-report artifact contract
- **Purpose**: Establish complete schema for docs-sync-report with all 8 required fields per AC-001
- **Related Requirements**: AC-001, BR-002, BR-003, BR-005
- **Files to Modify**:
  - `specs/007-docs-core/contracts/docs-sync-report-contract.md` (new)
- **Expected Outputs**:
  - Complete contract document with:
    - All 8 required fields defined (sync_target, consumed_artifacts, touched_sections, change_reasons, consistency_checks, status_updates, unresolved_ambiguities, recommendation)
    - Field validation rules
    - Recommendation vocabulary (sync-complete / needs-follow-up / blocked)
    - Evidence reference format
    - Consumer guidance (OpenClaw, maintainers)
- **Dependency / Ordering Notes**: Depends on T2.1 (readme-sync skill informs contract needs)
- **Acceptance Checks**:
  - [ ] All 8 fields from AC-001 present
  - [ ] BR-002 minimal surface area field (touched_sections) defined
  - [ ] BR-003 evidence-based field (consumed_artifacts) defined
  - [ ] BR-005 cross-document consistency field defined
  - [ ] Recommendation vocabulary defined
  - [ ] Consumer guidance present

- **Status**: ✅ COMPLETE

### Task 3.2: Create changelog-entry Contract [P]
- **Task ID**: T3.2
- **Title**: Define changelog-entry artifact contract
- **Purpose**: Establish complete schema for changelog-entry with all 10 required fields per AC-002
- **Related Requirements**: AC-002, BR-006
- **Files to Modify**:
  - `specs/007-docs-core/contracts/changelog-entry-contract.md` (new)
- **Expected Outputs**:
  - Complete contract document with:
    - All 10 required fields defined (feature_id, feature_name, change_type, summary, capability_changes, docs_changes, validation_changes, breaking_changes, known_limitations, related_features)
    - Change type definitions (feature/repair/docs-only/governance)
    - BR-006 compliance (change type distinction)
    - Summary format requirements
    - Consumer guidance (maintainers, release notes)
- **Dependency / Ordering Notes**: Depends on T2.2 (changelog-writing skill informs contract needs)
- **Acceptance Checks**:
  - [ ] All 10 fields from AC-002 present
  - [ ] BR-006 change type vocabulary defined
  - [ ] Summary format specified
  - [ ] Breaking changes field defined
  - [ ] Consumer guidance present

- **Status**: ✅ COMPLETE

---

## Phase 4: Validation & Quality Layer

*Focus: Build validation checklists and quality documentation*

### Task 4.1: Create Upstream-Consumability Checklist
- **Task ID**: T4.1
- **Title**: Build upstream-consumability-checklist.md
- **Purpose**: Ensure docs correctly consumes architect, developer, tester, and reviewer outputs with systematic verification
- **Related Requirements**: AC-005, BR-001
- **Files to Modify**:
  - `specs/007-docs-core/validation/upstream-consumability-checklist.md` (new)
- **Expected Outputs**:
  - Complete checklist with:
    - Architect artifacts consumption checks (design-note, open-questions)
    - Developer artifacts consumption checks (implementation-summary, self-check-report, bugfix-report)
    - Tester artifacts consumption checks (verification-report, regression-risk-report)
    - Reviewer artifacts consumption checks (acceptance-decision-record, review-findings-report)
    - Completion-report consumption checks
    - BR-001 compliance check (evidence vs speculation)
    - Missing data handling check
- **Dependency / Ordering Notes**: Depends on T1.2, T3.1 (upstream interface and contracts)
- **Acceptance Checks**:
  - [ ] All upstream artifact fields have check items
  - [ ] Checklist executable by docs role
  - [ ] BR-001 distinction verifiable
  - [ ] Missing data handling documented

- **Status**: ✅ COMPLETE

### Task 4.2: Create Downstream-Consumability Checklist
- **Task ID**: T4.2
- **Title**: Build downstream-consumability-checklist.md
- **Purpose**: Ensure outputs can be consumed by maintainers, users, and OpenClaw
- **Related Requirements**: AC-006
- **Files to Modify**:
  - `specs/007-docs-core/validation/downstream-consumability-checklist.md` (new)
- **Expected Outputs**:
  - Complete checklist with consumption paths for:
    - Maintainers: Changelog-entry suitable for release notes
    - Users: README updates accurate and accessible
    - OpenClaw: docs-sync-report provides verification evidence
    - Future features: Baseline documentation state clear
- **Dependency / Ordering Notes**: Depends on T1.3, T3.1, T3.2 (downstream interface and contracts)
- **Acceptance Checks**:
  - [ ] Maintainer consumption path verified
  - [ ] User consumption path verified
  - [ ] OpenClaw consumption path verified
  - [ ] Future feature consumption path verified

- **Status**: ✅ COMPLETE

### Task 4.3: Create Failure-Mode Checklist
- **Task ID**: T4.3
- **Title**: Build failure-mode-checklist.md with 7 anti-patterns
- **Purpose**: Document common docs failure patterns with detection and remediation strategies
- **Related Requirements**: AC-009, spec.md Section 10
- **Files to Modify**:
  - `specs/007-docs-core/validation/failure-mode-checklist.md` (new)
- **Expected Outputs**:
  - Complete checklist covering all 7 patterns from spec.md:
    1. AP-001: Status Inflation
    2. AP-002: Over-Updating
    3. AP-003: Drift Ignorance
    4. AP-004: Legacy Terminology Regression
    5. AP-005: Vague Changelog
    6. AP-006: Undocumented Changes
    7. AP-007: Speculation-Based Documentation
  - Each pattern includes: definition, detection method, early warning signals, remediation, prevention
- **Dependency / Ordering Notes**: Depends on T2.1, T2.2 (skills define failure modes)
- **Acceptance Checks**:
  - [ ] All 7 patterns from spec.md Section 10 covered
  - [ ] Each pattern has detection method
  - [ ] Each pattern has remediation strategy
  - [ ] Each pattern has prevention measure

- **Status**: ✅ COMPLETE

### Task 4.4: Create Anti-Pattern Guidance Document
- **Task ID**: T4.4
- **Title**: Build anti-pattern-guidance.md with detailed remediation
- **Purpose**: Provide comprehensive anti-pattern documentation with real-world examples and actionable guidance
- **Related Requirements**: AC-009
- **Files to Modify**:
  - `specs/007-docs-core/validation/anti-pattern-guidance.md` (new)
- **Expected Outputs**:
  - Complete guidance document with:
    - Definition of each anti-pattern
    - Real-world examples (sanitized)
    - Detection methods
    - Prevention strategies
    - Remediation steps
    - BR violation mapping (which BR each anti-pattern violates)
- **Dependency / Ordering Notes**: Depends on T4.3 (failure-mode checklist)
- **Acceptance Checks**:
  - [ ] Guidance actionable by docs role
  - [ ] Examples realistic and educational
  - [ ] Prevention strategies practical
  - [ ] Remediation steps clear
  - [ ] BR violation mapping documented

- **Status**: ✅ COMPLETE

---

## Phase 5: Educational & Example Layer

*Focus: Create examples, anti-examples, and templates for each skill*

### Task 5.1: Create Examples for readme-sync Skill [P]
- **Task ID**: T5.1
- **Title**: Build 2+ formal examples for readme-sync skill
- **Purpose**: Demonstrate correct docs behavior with realistic scenarios and complete workflows
- **Related Requirements**: AC-007, AC-003
- **Files to Modify**:
  - `.opencode/skills/docs/readme-sync/examples/example-001-feature-completion-sync.md` (new)
  - `.opencode/skills/docs/readme-sync/examples/example-002-status-correction.md` (new)
- **Expected Outputs**:
  - 2 complete examples with:
    - Realistic scenario description
    - Complete input context (simulated architect/developer/tester/reviewer outputs)
    - Step-by-step skill application
    - Complete output artifacts (partial docs-sync-report)
    - Key decision notes
    - Minimal surface area demonstration
- **Dependency / Ordering Notes**: Depends on T2.1 (skill formalization)
- **Acceptance Checks**:
  - [ ] At least 2 examples present
  - [ ] Examples demonstrate correct role behavior
  - [ ] Input context complete (upstream artifacts)
  - [ ] Output artifacts match contracts
  - [ ] BR-002 minimal surface area demonstrated

- **Status**: ✅ COMPLETE

### Task 5.2: Create Examples for changelog-writing Skill [P]
- **Task ID**: T5.2
- **Title**: Build 2+ formal examples for changelog-writing skill
- **Purpose**: Demonstrate changelog generation with change type classification
- **Related Requirements**: AC-007, BR-006
- **Files to Modify**:
  - `.opencode/skills/docs/changelog-writing/examples/example-001-feature-release.md` (new)
  - `.opencode/skills/docs/changelog-writing/examples/example-002-bugfix-release.md` (new)
- **Expected Outputs**:
  - 2 complete examples with:
    - Realistic scenario description
    - Completion context extraction
    - Change type classification
    - Complete changelog-entry artifact
    - Breaking change handling demonstration
- **Dependency / Ordering Notes**: Depends on T2.2 (skill formalization)
- **Acceptance Checks**:
  - [ ] At least 2 examples present
  - [ ] Examples demonstrate change type classification
  - [ ] Input context complete
  - [ ] Output artifacts match contracts
  - [ ] BR-006 compliance demonstrated

- **Status**: ✅ COMPLETE

### Task 5.3: Create Anti-Examples for readme-sync Skill
- **Task ID**: T5.3
- **Title**: Build 2+ anti-examples for readme-sync skill
- **Purpose**: Demonstrate common mistakes and how to detect/avoid them
- **Related Requirements**: AC-007, AC-009
- **Files to Modify**:
  - `.opencode/skills/docs/readme-sync/anti-examples/anti-example-001-status-inflation.md` (new)
  - `.opencode/skills/docs/readme-sync/anti-examples/anti-example-002-over-updating.md` (new)
- **Expected Outputs**:
  - 2 anti-example documents:
    - Status Inflation: Declaring partial complete as fully complete
    - Over-Updating: Rewriting unrelated sections
  - Each includes: what went wrong, why it's a problem, which BR violated, how to detect, how to fix
- **Dependency / Ordering Notes**: Depends on T5.1 (examples created first)
- **Acceptance Checks**:
  - [ ] At least 2 anti-examples present
  - [ ] Anti-examples clearly illustrate failure modes
  - [ ] Detection methods practical
  - [ ] Remediation steps actionable
  - [ ] BR violation mapping documented

- **Status**: ✅ COMPLETE

### Task 5.4: Create Anti-Examples for changelog-writing Skill
- **Task ID**: T5.4
- **Title**: Build 2+ anti-examples for changelog-writing skill
- **Purpose**: Demonstrate common changelog mistakes
- **Related Requirements**: AC-007, AC-009
- **Files to Modify**:
  - `.opencode/skills/docs/changelog-writing/anti-examples/anti-example-001-vague-changelog.md` (new)
  - `.opencode/skills/docs/changelog-writing/anti-examples/anti-example-002-missing-breaking-change.md` (new)
- **Expected Outputs**:
  - 2 anti-example documents:
    - Vague Changelog: "Various improvements and bug fixes"
    - Missing Breaking Change: Undisclosed breaking changes
  - Each includes: what went wrong, why it's a problem, which BR violated, how to detect, how to fix
- **Dependency / Ordering Notes**: Depends on T5.2 (examples created first)
- **Acceptance Checks**:
  - [ ] At least 2 anti-examples present
  - [ ] Anti-examples clearly illustrate failure modes
  - [ ] Detection methods practical
  - [ ] Remediation steps actionable
  - [ ] BR-006 violation mapping documented

- **Status**: ✅ COMPLETE

### Task 5.5: Create Templates for Both Skills [P]
- **Task ID**: T5.5
- **Title**: Build reusable templates for both skills
- **Purpose**: Provide ready-to-use templates that work across features without modification
- **Related Requirements**: AC-007
- **Files to Modify**:
  - `.opencode/skills/docs/readme-sync/templates/docs-sync-report-template.md` (new)
  - `.opencode/skills/docs/changelog-writing/templates/changelog-entry-template.md` (new)
- **Expected Outputs**:
  - 2 reusable template documents:
    - docs-sync-report template with all required fields
    - changelog-entry template with all required fields
- **Dependency / Ordering Notes**: Depends on T3.1, T3.2 (contracts defined)
- **Acceptance Checks**:
  - [ ] 2 template documents created
  - [ ] Templates usable without modification across features
  - [ ] All required fields from contracts present
  - [ ] Integration with skill workflows clear

- **Status**: ✅ COMPLETE

### Task 5.6: Create Workflow Diagram
- **Task ID**: T5.6
- **Title**: Build docs-workflow-diagram.md
- **Purpose**: Provide visual workflow documentation for docs role execution
- **Related Requirements**: AC-003, AC-005
- **Files to Modify**:
  - `specs/007-docs-core/docs-workflow-diagram.md` (new)
- **Expected Outputs**:
  - Visual workflow diagrams for:
    - Standard feature completion sync flow
    - Status correction flow
    - Blocked documentation sync flow
    - Change type classification
    - Recommendation states
    - 6-role chain integration
- **Dependency / Ordering Notes**: Depends on T5.1-T5.5 (core examples/templates)
- **Acceptance Checks**:
  - [ ] Workflow diagram created
  - [ ] All major flows documented visually
  - [ ] ASCII diagrams render correctly
- **Status**: ✅ COMPLETE

### Task 5.7: Create Quick Reference Card
- **Task ID**: T5.7
- **Title**: Build docs-quick-reference.md
- **Purpose**: Provide quick lookup reference for BR rules, artifacts, and procedures
- **Related Requirements**: AC-007
- **Files to Modify**:
  - `specs/007-docs-core/docs-quick-reference.md` (new)
- **Expected Outputs**:
  - Quick reference with:
    - BR quick reference table
    - Upstream artifacts reference
    - Artifact fields reference
    - Change type classification
    - Recommendation states
    - Escalation quick reference
    - Anti-pattern detection
- **Dependency / Ordering Notes**: Depends on T1.1-T1.3, T3.1-T3.2
- **Acceptance Checks**:
  - [ ] Quick reference created
  - [ ] All BR rules documented
  - [ ] Artifact fields listed
  - [ ] Tables formatted correctly
- **Status**: ✅ COMPLETE

### Task 5.8: Create FAQ Document
- **Task ID**: T5.8
- **Title**: Build docs-faq.md
- **Purpose**: Answer common questions about docs role procedures and decisions
- **Related Requirements**: AC-007
- **Files to Modify**:
  - `specs/007-docs-core/docs-faq.md` (new)
- **Expected Outputs**:
  - FAQ with 20+ Q&A covering:
    - General role questions
    - Upstream consumption questions
    - readme-sync questions
    - changelog-writing questions
    - Escalation questions
    - Anti-pattern questions
    - Output artifact questions
- **Dependency / Ordering Notes**: Depends on all Phase 1-4 tasks
- **Acceptance Checks**:
  - [ ] FAQ created
  - [ ] At least 20 Q&A pairs
  - [ ] All major topics covered
  - [ ] Answers reference BR/spec
- **Status**: ✅ COMPLETE

---

## Phase 6: Workflow & Package Integration

*Focus: Role-scope documentation, governance updates, completion preparation*

### Task 6.1: Finalize Role-Scope Documentation
- **Task ID**: T6.1
- **Title**: Update role-definition.md Section 5 with formalized docs role
- **Purpose**: Ensure role-definition.md Section 5 reflects the formalized docs role from 007-docs-core
- **Related Requirements**: AC-002, BR-007
- **Files Modified**:
  - `role-definition.md` (Section 5 updated)
- **Expected Outputs**:
  - Enhanced Section 5 with:
    - Formalized mission statement referencing 007-docs-core
    - Core skills table (readme-sync, changelog-writing)
    - Output artifacts table
    - Explicit prohibitions (BR-007)
    - Trigger conditions with priorities
    - Required inputs from all upstream roles
    - Failure modes from validation/failure-mode-checklist.md
    - Escalation rules
    - Dependencies on other roles
- **Dependency / Ordering Notes**: Depends on T1.1-T5.8 (all core deliverables created)
- **Acceptance Checks**:
  - [ ] Section 5 references 007-docs-core as implementation source
  - [ ] All BR-001 through BR-008 referenced
  - [ ] Failure modes documented
  - [ ] Trigger conditions explicit
  - [ ] Dependencies documented

- **Status**: ✅ COMPLETE

### Task 6.2: Update package-spec.md
- **Task ID**: T6.2
- **Title**: Update package-spec.md docs skills section
- **Purpose**: Ensure package-spec.md docs skills reference 007-docs-core implementation
- **Related Requirements**: AC-002, AC-003
- **Files Modified**:
  - `package-spec.md` (docs skills section updated)
- **Expected Outputs**:
  - Updated docs skills section with:
    - Reference to 007-docs-core as implementation source
    - Skill metadata (readme-sync, changelog-writing)
- **Dependency / Ordering Notes**: Depends on T6.1
- **Acceptance Checks**:
  - [ ] Docs skills reference 007-docs-core
  - [ ] Skills listed match actual implementation

- **Status**: ✅ COMPLETE

### Task 6.3: Update io-contract.md
- **Task ID**: T6.3
- **Title**: Add docs artifact contracts to io-contract.md
- **Purpose**: Add docs-sync-report and changelog-entry artifact types to I/O contract
- **Related Requirements**: AC-004
- **Files Modified**:
  - `io-contract.md` (artifact types updated)
- **Expected Outputs**:
  - Added to artifact_type enum:
    - docs_sync_report
    - changelog_entry
  - Added artifact type definitions with required fields
- **Dependency / Ordering Notes**: Depends on T3.1, T3.2 (contracts defined)
- **Acceptance Checks**:
  - [ ] docs_sync_report in artifact_type enum
  - [ ] changelog_entry in artifact_type enum
  - [ ] Field definitions match contracts

- **Status**: ✅ COMPLETE

### Task 6.4: Update quality-gate.md
- **Task ID**: T6.4
- **Title**: Enhance docs Gate in quality-gate.md
- **Purpose**: Add 007-docs-core validation references to docs quality gate
- **Related Requirements**: AC-008
- **Files Modified**:
  - `quality-gate.md` (Section 3.5 updated)
- **Expected Outputs**:
  - Enhanced Section 3.5 with:
    - docs-sync-report checks
    - changelog-entry checks
    - BR compliance checks
    - References to validation checklists
- **Dependency / Ordering Notes**: Depends on T4.1-T4.4 (validation layer)
- **Acceptance Checks**:
  - [ ] docs-sync-report checks documented
  - [ ] changelog-entry checks documented
  - [ ] Validation checklist references present

- **Status**: ✅ COMPLETE

### Task 6.5: Update README.md
- **Task ID**: T6.5
- **Title**: Update README.md feature status and skills directory
- **Purpose**: Ensure README reflects 007-docs-core completion
- **Related Requirements**: AC-011
- **Files Modified**:
  - `README.md` (skills directory, feature status)
- **Expected Outputs**:
  - Updated README with:
    - Docs skills marked as ✅ 正式实现
    - Skills directory shows docs as implemented
    - Feature status table accurate
- **Dependency / Ordering Notes**: Depends on all core deliverables
- **Acceptance Checks**:
  - [ ] Docs skills status accurate
  - [ ] Skills directory updated
  - [ ] No contradictions with completion-report

- **Status**: ✅ COMPLETE

### Task 6.6: Update completion-report.md
- **Task ID**: T6.6
- **Title**: Finalize completion-report.md with governance updates
- **Purpose**: Document all deliverables and governance document updates
- **Related Requirements**: AC-001, AGENTS.md Audit Hardening Rule
- **Files Modified**:
  - `specs/007-docs-core/completion-report.md` (updated)
- **Expected Outputs**:
  - Complete completion-report.md with:
    - Deliverables checklist (all items)
    - Traceability matrix to spec requirements
    - Governance updates section listing all updated documents
    - Known gaps documented
    - Honest status reporting
- **Dependency / Ordering Notes**: Depends on T6.1-T6.5
- **Acceptance Checks**:
  - [ ] All AC-001 through AC-012 assessed
  - [ ] Honest gap disclosure
  - [ ] Governance updates documented
  - [ ] Status consistent with repository state

- **Status**: ✅ COMPLETE

---

## Phase 7: Consistency Review

*Focus: Governance sync, cross-document consistency, final acceptance*

**Status**: ✅ COMPLETE (2026-03-27)

### Task 7.1: Perform Governance Document Sync
- **Task ID**: T7.1
- **Title**: Verify consistency across all governance documents
- **Purpose**: Ensure no contradictions between governance documents per AGENTS.md Governance Sync Rule
- **Related Requirements**: AGENTS.md Governance Sync Rule
- **Files to Modify**:
  - `AGENTS.md` (if role semantics need update)
  - `quality-gate.md` (if docs gate needs update)
  - `io-contract.md` (if artifact types need update)
  - `role-definition.md` (if docs section needs enhancement)
- **Expected Outputs**:
  - Verification that:
    - README.md terminology consistent with role-definition.md
    - AGENTS.md constraints consistent with package-spec.md
    - quality-gate.md docs gate aligned with this feature
    - io-contract.md artifact types include docs artifacts
    - role-definition.md Section 5 aligned with 007 deliverables
- **Dependency / Ordering Notes**: Depends on T6.2
- **Acceptance Checks**:
  - [x] No contradictions across governance docs
  - [x] 6-role vs 3-skill consistency verified
  - [x] Feature status consistent across docs
  - [x] Artifact definitions consistent

- **Status**: ✅ COMPLETE
- **Verification Date**: 2026-03-27
- **Findings**: None - all governance documents consistent

### Task 7.2: Perform Cross-Document Consistency Check
- **Task ID**: T7.2
- **Title**: Final consistency verification across all 007-docs-core documents
- **Purpose**: Verify no contradictions between spec, plan, tasks, and outputs
- **Related Requirements**: AGENTS.md Audit Hardening Rule (AH-001 to AH-006)
- **Files to Modify**:
  - None (verification only)
- **Expected Outputs**:
  - Consistency report documenting:
    - Spec vs plan alignment
    - Plan vs tasks alignment
    - Tasks vs actual outputs alignment
    - Artifact contracts vs skill documents alignment
- **Dependency / Ordering Notes**: Depends on T6.3, T7.1 (completion report and governance sync done)
- **Acceptance Checks**:
  - [x] Spec.md requirements all addressed in tasks
  - [x] Plan.md phases mapped to tasks
  - [x] No orphaned requirements
  - [x] Single source of truth for each fact
  - [x] AH-001 to AH-006 compliance verified

- **Status**: ✅ COMPLETE
- **Verification Date**: 2026-03-27
- **Findings**: None - all cross-document checks passed

### Task 7.3: Execute Final Acceptance Validation
- **Task ID**: T7.3
- **Title**: Validate all acceptance criteria with evidence
- **Purpose**: Final validation against spec.md acceptance criteria
- **Related Requirements**: AC-001 through AC-012
- **Files to Modify**:
  - None (validation only, updates completion-report.md if needed)
- **Expected Outputs**:
  - Evidence package for each AC:
    - AC-001: Feature package complete
    - AC-002: Docs role scope formalized
    - AC-003: Core skills formally implemented
    - AC-004: Artifact contracts defined
    - AC-005: Upstream consumption logic clear
    - AC-006: Downstream handoff clear
    - AC-007: Skill assets complete
    - AC-008: Consistency discipline present
    - AC-009: Anti-pattern guidance present
    - AC-010: Scope boundary maintained
    - AC-011: Repository state updated
    - AC-012: 6-Role terminology preserved
- **Dependency / Ordering Notes**: Depends on all tasks (final validation)
- **Acceptance Checks**:
  - [x] All 12 AC items satisfied with evidence
  - [x] Evidence traceable to deliverables
  - [x] No AC interpretation conflicts
  - [x] Honest assessment of gaps

- **Status**: ✅ COMPLETE
- **Verification Date**: 2026-03-27
- **Findings**: All 12 AC requirements verified PASS

---

## Dependency Graph

```
Phase 1:
  T1.1, T1.2, T1.3 → can run in parallel

Phase 2:
  T1.* → T2.1 (readme-sync skill)
  T1.* → T2.2 (changelog-writing skill)
  T2.1, T2.2 can run in parallel

Phase 3:
  T2.1 → T3.1 (docs-sync-report contract)
  T2.2 → T3.2 (changelog-entry contract)
  T3.1, T3.2 can run in parallel

Phase 4:
  T1.2 + T3.1 → T4.1 (upstream consumability)
  T1.3 + T3.1 + T3.2 → T4.2 (downstream consumability)
  T2.1, T2.2 → T4.3 (failure modes)
  T4.3 → T4.4 (anti-pattern guidance)

Phase 5:
  T2.1 → T5.1 (readme-sync examples)
  T2.2 → T5.2 (changelog-writing examples)
  T5.1 → T5.3 (readme-sync anti-examples)
  T5.2 → T5.4 (changelog-writing anti-examples)
  T3.1, T3.2 → T5.5 (templates)
  T5.1, T5.2, T5.3, T5.4, T5.5 can partially overlap

Phase 6:
  T1.1 + T2.1 + T2.2 + T3.1 + T3.2 → T6.1 (role-scope finalize)
  Phase 2, 3, 4, 5 complete → T6.2 (governance update)
  All previous → T6.3 (completion report)

Phase 7:
  T6.2 → T7.1 (governance sync)
  T6.3 + T7.1 → T7.2 (consistency check)
  T7.2 → T7.3 (final validation)
```

---

## Execution Recommendations

### Recommended Execution Sequence

```
Day 1:
├── Phase 1: Role Scope Finalization
│   └── Parallel: T1.1, T1.2, T1.3

Day 2-3:
├── Phase 2: Skill Formalization
│   └── Parallel: T2.1, T2.2

Day 3-4:
├── Phase 3: Artifact Contract Establishment
│   └── Parallel: T3.1, T3.2

Day 4-5:
├── Phase 4: Validation & Quality Layer
│   └── Sequential: T4.1 → T4.2 → T4.3 → T4.4

Day 5-6:
├── Phase 5: Educational & Example Layer
│   ├── Parallel: T5.1, T5.2, T5.5
│   └── Sequential: T5.1 → T5.3, T5.2 → T5.4
│   └── Sequential: T5.6, T5.7, T5.8

Day 7 (Morning):
├── Phase 6: Workflow & Package Integration
│   └── Sequential: T6.1 → T6.2 → T6.3

Day 7 (Afternoon):
└── Phase 7: Consistency Review
    └── Sequential: T7.1 → T7.2 → T7.3
```

### Parallel Execution Groups

**Group A** (Day 1): T1.1, T1.2, T1.3
**Group B** (Day 2-3): T2.1, T2.2
**Group C** (Day 3-4): T3.1, T3.2
**Group D** (Day 4-5): T4.1, T4.2, T4.3, T4.4
**Group E** (Day 5-6): T5.1, T5.2, T5.5
**Group F** (Day 5-6, after Group E): T5.3, T5.4
**Group G** (Day 7): T6.1, T6.2, T6.3, T7.1, T7.2, T7.3

### Critical Path

```
T1.1/T1.2 → T2.1 → T3.1 → T4.1 → T5.1 → T5.3 → T6.1 → T6.3 → T7.2 → T7.3
      ↓
T2.2 → T3.2 → T5.2 → T5.4
```

---

## Deliverables Summary

### Core Capability Deliverables (14 tasks)
- 3 role/interface documents (T1.1, T1.2, T1.3)
- 2 enhanced SKILL.md files (T2.1, T2.2)
- 2 artifact contracts (T3.1, T3.2)
- 4 validation documents (T4.1, T4.2, T4.3, T4.4)

### Educational Assets (8 tasks)
- 4 skill examples (T5.1, T5.2)
- 4 anti-examples (T5.3, T5.4)
- 2 reusable templates (T5.5)
- 1 workflow diagram (T5.6)
- 1 quick reference card (T5.7)
- 1 FAQ document (T5.8)

### Governance & Completion (9 tasks)
- Role-scope finalization (T6.1)
- package-spec.md update (T6.2)
- io-contract.md update (T6.3)
- quality-gate.md update (T6.4)
- README.md update (T6.5)
- completion-report update (T6.6)
- Governance sync (T7.1)
- Consistency check (T7.2)
- Final validation (T7.3)

### Total File Outputs

**New Files**: ~28
**Modified Files**: ~5 (skill enhancements + governance)

---

## Traceability Matrix

| Spec Requirement | Plan Phase | Tasks | AC |
|------------------|------------|-------|-----|
| BR-001 | P1, P4 | T1.2, T4.1 | AC-005 |
| BR-002 | P2, P3 | T2.1, T3.1, T5.1 | AC-003 |
| BR-003 | P2 | T2.1, T3.1 | AC-003 |
| BR-004 | P2 | T2.1 | AC-012 |
| BR-005 | P2 | T2.1, T3.1 | AC-008 |
| BR-006 | P2, P3 | T2.2, T3.2, T5.2 | AC-003 |
| BR-007 | P1 | T1.1 | AC-002, AC-010 |
| BR-008 | P1, P2 | T1.1, T2.1 | AC-009 |
| SKILL-001 | P2, P5 | T2.1, T5.1, T5.3 | AC-003, AC-007 |
| SKILL-002 | P2, P5 | T2.2, T5.2, T5.4 | AC-003, AC-007 |
| AC-001 | P6 | T6.3 | - |
| AC-002 | P1, P6 | T1.1, T6.1 | - |
| AC-003 | P2 | T2.1, T2.2 | - |
| AC-004 | P3 | T3.1, T3.2 | - |
| AC-005 | P1, P4 | T1.2, T4.1 | - |
| AC-006 | P1, P4 | T1.3, T4.2 | - |
| AC-007 | P5 | T5.1, T5.2, T5.3, T5.4, T5.5 | - |
| AC-008 | P4 | T2.1, T3.1, T4.1 | - |
| AC-009 | P4 | T4.3, T4.4 | - |
| AC-010 | All | (design constraint) | - |
| AC-011 | P6, P7 | T6.2, T7.1 | - |
| AC-012 | P1, P2, P7 | T1.1, T2.1, T7.1 | - |

---

## Next Recommended Command

After reviewing this tasks.md:

```
/spec-implement

Feature: 007-docs-core
Tasks: Execute tasks T1.1 through T7.3 according to dependency order
Focus: Phase 1 and Phase 2 first (core capabilities)
Constraint: Maintain role purity, no security implementation
Validation: Ensure all AC-001 through AC-012 satisfied
```

Or begin with Phase 1 only:

```
/spec-implement

Feature: 007-docs-core
Tasks: T1.1, T1.2, T1.3
Deliver: specs/007-docs-core/role-scope.md, upstream-consumption.md, downstream-interfaces.md
```