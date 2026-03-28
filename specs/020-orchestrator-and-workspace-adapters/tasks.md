# Task Checklist: 020-orchestrator-and-workspace-adapters

## Metadata
```yaml
feature_id: 020-orchestrator-and-workspace-adapters
feature_name: Orchestrator 与 Workspace 适配层
tasks_version: 1.0.0
created_at: 2026-03-28
generated_from:
  - specs/020-orchestrator-and-workspace-adapters/spec.md
  - specs/020-orchestrator-and-workspace-adapters/plan.md
```

---

## Task Checklist

### Phase 1: Foundation (Architecture & Schema)

**Objective**: Define adapter architecture, boundaries, and interface contracts.
**Estimated Duration**: 1 session (2-3 hours)
**Dependencies**: Feature dependencies already satisfied (017, 018, 019 complete)

- [x] **T001**: Define ADAPTERS.md architecture document (role: architect)
  - Deliverable: `ADAPTERS.md`
  - Validation: Document covers Orchestrator vs Workspace boundary (AC-001)
  - AC Mapping: AC-001 (Adapter Architecture Defined)
  - Acceptance Criteria:
    - [x] Defines Orchestrator Adapter and Workspace Adapter boundaries
    - [x] Documents adapter responsibilities (Input Normalization, Context Extraction, Validation, Routing, Error Mapping, Artifact Output, File Handling, State Sync, Escalation Handling)
    - [x] Includes boundary rules table (Input/Output Format, Error Direction, Retry Scope, Escalation Role)
    - [x] Defines adapter types and priorities (Must-Have vs Later)
  - Dependencies: None

- [x] **T002**: Create adapters/registry.json schema (role: architect)
  - Deliverable: `adapters/registry.json`
  - Validation: Registry contains adapter types, priorities, configurations (NFR-001)
  - AC Mapping: AC-001
  - Acceptance Criteria:
    - [x] Contains all adapter types (cli-local, local-repo, github-issue, github-pr, openclaw, external)
    - [x] Defines adapter priority (must-have vs later)
    - [x] Includes configuration schema for each adapter
    - [x] Programmatically discoverable (NFR-001)
  - Dependencies: T001

- [x] **T003**: Define workspace-configuration.schema.json (role: architect)
  - Deliverable: `adapters/schemas/workspace-configuration.schema.json`
  - Validation: Schema validates workspace config per spec §Profile/Workspace Integration Design
  - AC Mapping: AC-007
  - Acceptance Criteria:
    - [x] Defines workspace_type enum (local_repo, github_repo, external_system)
    - [x] Defines profile enum (minimal, full)
    - [x] Defines output_config object (artifact_path, changed_files_path, console_output)
    - [x] Defines escalation_config object (channel, requires_acknowledgment)
    - [x] Defines retry_config object (max_retry, strategy)
  - Dependencies: T001

- [x] **T004**: Update io-contract.md with adapter interface section (§8) (role: architect)
  - Deliverable: `io-contract.md` (updated)
  - Validation: Section added aligns with BR-001 interface contract
  - AC Mapping: AC-008
  - Acceptance Criteria:
    - [x] Adds §8 Adapter Interface Contract
    - [x] Documents OrchestratorAdapter interface (normalizeInput, validateDispatch, routeToExecution, mapError)
    - [x] Documents WorkspaceAdapter interface (handleArtifacts, handleChangedFiles, handleEscalation, validateArtifactOutput)
    - [x] References existing io-contract.md §1, §2, §3 for payload schemas
  - Dependencies: T001

- [x] **T005**: Define OrchestratorAdapter interface (TypeScript) (role: architect)
  - Deliverable: `adapters/interfaces/orchestrator-adapter.interface.ts`
  - Validation: Interfaces align with io-contract.md §1 (Dispatch Payload schema)
  - AC Mapping: AC-001, BR-001
  - Acceptance Criteria:
    - [x] TypeScript interface for OrchestratorAdapter
    - [x] normalizeInput(externalInput: any): DispatchPayload
    - [x] validateDispatch(dispatch: DispatchPayload): ValidationResult
    - [x] routeToExecution(dispatch: DispatchPayload): void
    - [x] mapError(error: any): ExecutionStatus
  - Dependencies: T001

- [x] **T006**: Define WorkspaceAdapter interface (TypeScript) (role: architect)
  - Deliverable: `adapters/interfaces/workspace-adapter.interface.ts`
  - Validation: Interfaces align with io-contract.md §2, §3 (Execution Result, Artifact schema)
  - AC Mapping: AC-001, BR-001
  - Acceptance Criteria:
    - [x] TypeScript interface for WorkspaceAdapter
    - [x] handleArtifacts(result: ExecutionResult): void
    - [x] handleChangedFiles(result: ExecutionResult): void
    - [x] handleEscalation(escalation: Escalation): void
    - [x] validateArtifactOutput(artifacts: Artifact[]): ValidationResult
  - Dependencies: T001

---

### Phase 2: Core Implementation (Must-Have Adapters)

**Objective**: Implement CLI/Local Orchestrator Adapter and Local Repo Workspace Adapter.
**Estimated Duration**: 1-2 sessions (4-6 hours)
**Dependencies**: Phase 1 complete

#### Group 2A: CLI/Local Orchestrator Adapter (M-001)

- [x] **T007**: Create adapters/cli-local/ directory structure (role: developer)
  - Deliverable: `adapters/cli-local/` directory
  - Validation: Directory exists with proper structure
  - AC Mapping: AC-002
  - Acceptance Criteria:
    - [x] Directory created at `adapters/cli-local/`
    - [x] Contains README.md documenting CLI adapter usage
    - [x] Directory structure follows project conventions
  - Dependencies: T001

- [x] **T008**: Implement arg-parser.js (CLI argument parsing) (role: developer)
  - Deliverable: `adapters/cli-local/arg-parser.js`
  - Validation: Correctly extracts all dispatch fields per Dispatch Input Mapping table
  - AC Mapping: AC-002, AC-004
  - Acceptance Criteria:
    - [x] Parses `--project` flag → project_id
    - [x] Parses `--milestone` flag → milestone_id
    - [x] Parses `--task` flag → task_id
    - [x] Parses `--role` flag → role (architect/developer/tester/reviewer/docs/security)
    - [x] Parses `--command` flag → command
    - [x] Parses positional arg → title/goal (first positional → title, rest → goal)
    - [x] Parses `--context` flag → context (JSON/YAML parse)
    - [x] Parses `--constraints` flag → constraints (array parse)
    - [x] Parses `--risk` flag → risk_level (low/medium/high/critical)
    - [x] Auto-generates dispatch_id (UUID)
  - Dependencies: T007

- [x] **T009**: Implement dispatch-normalizer.js (role: developer)
  - Deliverable: `adapters/cli-local/dispatch-normalizer.js`
  - Validation: Produces valid Dispatch Payload per io-contract.md §1
  - AC Mapping: AC-002
  - Acceptance Criteria:
    - [x] Takes parsed CLI args and produces Dispatch Payload
    - [x] Output conforms to io-contract.md §1 schema
    - [x] All required fields present (dispatch_id, project_id, milestone_id, task_id, role, command, title, goal, description, context, constraints, inputs, expected_outputs, verification_steps, risk_level)
    - [x] Follows CLI/Local Dispatch Normalization Flow: CLI Args → Arg Parser → Field Extractor → Schema Validator → Dispatch Payload
  - Dependencies: T008

- [x] **T010**: Implement dispatch-validator.js (contract validation) (role: developer)
  - Deliverable: `adapters/cli-local/dispatch-validator.js`
  - Validation: Uses contracts/pack validation (BR-002)
  - AC Mapping: AC-002, AC-008, BR-002
  - Acceptance Criteria:
    - [x] Validates Dispatch Payload against io-contract.md §1 schema
    - [x] Uses contracts/pack/validate-schema.js or equivalent logic
    - [x] Returns ValidationResult with isValid boolean and errors array
    - [x] Validation time < 100ms (NFR-004)
  - Dependencies: T009

- [x] **T011**: Implement escalation-handler.js (role: developer)
  - Deliverable: `adapters/cli-local/escalation-handler.js`
  - Validation: Maps escalation to console output per Escalation Mapping table
  - AC Mapping: AC-006
  - Acceptance Criteria:
    - [x] Handles escalation_id → console output
    - [x] Handles reason_type → console output
    - [x] Handles blocking_points → console output
    - [x] Handles recommended_next_steps → console output
    - [x] Handles requires_user_decision → interactive prompt
  - Dependencies: T009

- [x] **T012**: Implement retry-handler.js (interactive retry) (role: developer)
  - Deliverable: `adapters/cli-local/retry-handler.js`
  - Validation: Implements interactive retry strategy per Retry Mapping table
  - AC Mapping: AC-002
  - Acceptance Criteria:
    - [x] Implements interactive retry strategy
    - [x] Max retry: 2 (user can override)
    - [x] Trigger: User decision
    - [x] Prompts user for retry/abort decision
  - Dependencies: T009

- [x] **T013**: Create adapter config (cli-local.config.json) (role: developer)
  - Deliverable: `adapters/cli-local/cli-local.config.json`
  - Validation: Config valid and matches workspace-configuration.schema.json
  - AC Mapping: AC-002
  - Acceptance Criteria:
    - [x] Contains adapter metadata (type, priority, version)
    - [x] Contains default configuration values
    - [x] Validates against workspace-configuration.schema.json
  - Dependencies: T009, T003

---

#### Group 2B: Local Repo Workspace Adapter (M-002)

- [x] **T014**: Create adapters/local-repo/ directory structure (role: developer)
  - Deliverable: `adapters/local-repo/` directory
  - Validation: Directory exists with proper structure
  - AC Mapping: AC-003
  - Acceptance Criteria:
    - [x] Directory created at `adapters/local-repo/`
    - [x] Contains README.md documenting Local Repo adapter usage
    - [x] Directory structure follows project conventions
  - Dependencies: T001

- [x] **T015**: Implement artifact-handler.js (file output) (role: developer)
  - Deliverable: `adapters/local-repo/artifact-handler.js`
  - Validation: Writes artifacts to local filesystem per Artifact Output Mapping table
  - AC Mapping: AC-003, AC-005
  - Acceptance Criteria:
    - [x] Handles artifacts[].path → file write
    - [x] Creates directories if needed
    - [x] Validates write paths (BR-006)
    - [x] Follows Local Repo Output Flow: Execution Result → Artifact Extractor → File Writer → Console Reporter
  - Dependencies: T014

- [x] **T016**: Implement changed-files-handler.js (role: developer)
  - Deliverable: `adapters/local-repo/changed-files-handler.js`
  - Validation: Handles added/modified/deleted/renamed files
  - AC Mapping: AC-003
  - Acceptance Criteria:
    - [x] Handles changed_files[].path → file write
    - [x] Handles changed_files[].change_type → file action (added → create, modified → update, deleted → remove)
    - [x] Properly handles file modifications
    - [x] Properly handles file deletions
  - Dependencies: T014

- [x] **T017**: Implement console-reporter.js (role: developer)
  - Deliverable: `adapters/local-repo/console-reporter.js`
  - Validation: Outputs summary/issues/recommendation to console
  - AC Mapping: AC-003
  - Acceptance Criteria:
    - [x] Outputs execution summary
    - [x] Outputs issues_found to console
    - [x] Outputs recommendation to console (CONTINUE/REWORK/REPLAN/ESCALATE)
    - [x] Formatted for readability
  - Dependencies: T015, T016

- [x] **T018**: Implement escalation-output-handler.js (role: developer)
  - Deliverable: `adapters/local-repo/escalation-output-handler.js`
  - Validation: Outputs escalation info to console
  - AC Mapping: AC-006
  - Acceptance Criteria:
    - [x] Outputs escalation details to console
    - [x] Formats escalation info for readability
    - [x] Integrates with console-reporter.js
  - Dependencies: T014

- [x] **T019**: Implement retry-handler.js (local repo retry) (role: developer)
  - Deliverable: `adapters/local-repo/retry-handler.js`
  - Validation: Implements interactive retry strategy per Retry Mapping table
  - AC Mapping: AC-003
  - Acceptance Criteria:
    - [x] Implements interactive retry strategy for local_repo
    - [x] Max retry: 2 (user can override)
    - [x] Integrates with CLI retry handler
  - Dependencies: T014

- [x] **T020**: Create adapter config (local-repo.config.json) (role: developer)
  - Deliverable: `adapters/local-repo/local-repo.config.json`
  - Validation: Config valid and matches workspace-configuration.schema.json
  - AC Mapping: AC-003
  - Acceptance Criteria:
    - [x] Contains adapter metadata (type, priority, version)
    - [x] Contains default output paths
    - [x] Validates against workspace-configuration.schema.json
  - Dependencies: T015, T003

- [x] **T021**: Implement path-validator.js (BR-006) (role: developer)
  - Deliverable: `adapters/local-repo/path-validator.js`
  - Validation: Validates artifact output paths per BR-006
  - AC Mapping: AC-003, BR-006
  - Acceptance Criteria:
    - [x] Validates path exists and is writable
    - [x] Validates path doesn't conflict (won't overwrite unauthorized files)
    - [x] Validates path matches profile configuration
    - [x] Returns clear error messages for invalid paths
  - Dependencies: T014

---

#### Group 2C: Version Compatibility & Profile Integration

- [x] **T022**: Implement version-check.js (compatibility-matrix.json) (role: developer)
  - Deliverable: `adapters/shared/version-check.js`
  - Validation: Reads compatibility-matrix.json and checks adapter/package version (BR-003)
  - AC Mapping: AC-009
  - Acceptance Criteria:
    - [x] Reads compatibility-matrix.json
    - [x] Checks adapter version vs package version compatibility
    - [x] Returns BLOCKED status if incompatible
    - [x] Returns compatibility info with migration hints if migration needed
  - Dependencies: T001

- [x] **T023**: Implement profile-loader.js (templates/pack) (role: developer)
  - Deliverable: `adapters/shared/profile-loader.js`
  - Validation: Reads templates/pack/pack-version.json (BR-004)
  - AC Mapping: AC-007, AC-009
  - Acceptance Criteria:
    - [x] Reads templates/pack/pack-version.json
    - [x] Provides getProfileConfig(profile_name) interface
    - [x] Returns profile configuration (minimal: 21 MVP skills, full: 37 skills)
    - [x] Returns BLOCKED status if profile not found
  - Dependencies: T001

- [x] **T024**: Create profile-workspace-mapping.json (role: developer)
  - Deliverable: `adapters/shared/profile-workspace-mapping.json`
  - Validation: Covers minimal/full → local_repo/github_repo per IR-001~IR-004
  - AC Mapping: AC-007
  - Acceptance Criteria:
    - [x] Maps minimal profile to compatible workspaces (local_repo, github_repo)
    - [x] Maps full profile to compatible workspaces (local_repo, github_repo, external_system)
    - [x] Documents skill set per profile (minimal: 21, full: 37)
    - [x] Documents Integration Rules (IR-001~IR-004)
  - Dependencies: T023

- [x] **T025**: Implement workspace-config-validator.js (role: developer)
  - Deliverable: `adapters/shared/workspace-config-validator.js`
  - Validation: Validates workspace config against schema (T003)
  - AC Mapping: AC-007
  - Acceptance Criteria:
    - [x] Validates workspace config against workspace-configuration.schema.json
    - [x] Returns ValidationResult with isValid boolean and errors array
    - [x] Checks profile-workspace compatibility
    - [x] Returns clear error messages for invalid configs
  - Dependencies: T003, T024

---

### Phase 3: Integration (Examples & Design Documents)

**Objective**: Create executable examples and design documents for Later adapters.
**Estimated Duration**: 1 session (2-3 hours)
**Dependencies**: Phase 2 complete

#### Group 3A: Examples (M-004, M-005)

- [x] **T026**: Create examples/cli-workflow.md (role: docs)
  - Deliverable: `examples/cli-workflow.md`
  - Validation: Example is executable and verifiable (AC-010)
  - AC Mapping: AC-010
  - Acceptance Criteria:
    - [x] Documents CLI workflow example
    - [x] Shows complete dispatch command with all flags
    - [x] Shows expected output
    - [x] Includes step-by-step instructions
  - Dependencies: T013

- [x] **T027**: Create examples/local-repo-output.md (role: docs)
  - Deliverable: `examples/local-repo-output.md`
  - Validation: Example is executable and verifiable (AC-010)
  - AC Mapping: AC-010
  - Acceptance Criteria:
    - [x] Documents Local Repo output example
    - [x] Shows artifact file output structure
    - [x] Shows changed files handling
    - [x] Includes step-by-step instructions
  - Dependencies: T020

- [x] **T028**: Create validation test script for CLI workflow (role: tester)
  - Deliverable: `adapters/cli-local/test-cli-workflow.js`
  - Validation: Test script passes
  - AC Mapping: AC-010
  - Acceptance Criteria:
    - [x] Tests arg-parser.js with various inputs
    - [x] Tests dispatch-normalizer.js output
    - [x] Tests dispatch-validator.js validation
    - [x] Tests complete CLI workflow end-to-end
    - [x] All tests pass
  - Dependencies: T026

- [x] **T029**: Create validation test script for Local Repo (role: tester)
  - Deliverable: `adapters/local-repo/test-local-repo.js`
  - Validation: Test script passes
  - AC Mapping: AC-010
  - Acceptance Criteria:
    - [x] Tests artifact-handler.js file writing
    - [x] Tests changed-files-handler.js file operations
    - [x] Tests console-reporter.js output
    - [x] Tests complete Local Repo workflow end-to-end
    - [x] All tests pass
  - Dependencies: T027

---

#### Group 3B: Later Adapter Design Documents (L-001, L-002, L-003, L-004)

- [x] **T030**: Create docs/adapters/ directory (role: docs)
  - Deliverable: `docs/adapters/` directory
  - Validation: Directory exists
  - AC Mapping: AC-004, AC-005, AC-006
  - Acceptance Criteria:
    - [x] Directory created at `docs/adapters/`
    - [x] Contains README.md documenting adapter design docs
  - Dependencies: None

- [x] **T031**: Write github-issue-adapter-design.md (role: architect)
  - Deliverable: `docs/adapters/github-issue-adapter-design.md`
  - Validation: Contains all required design elements
  - AC Mapping: AC-004
  - Acceptance Criteria:
    - [x] Adapter type classification (Orchestrator)
    - [x] Input/Output mapping tables (Issue number → dispatch_id, Repository → project_id, etc.)
    - [x] Escalation mapping (Issue comment, label)
    - [x] Retry strategy (Auto-retry with comment, max 1)
    - [x] Interface requirements
  - Dependencies: T001, T030

- [x] **T032**: Write github-pr-adapter-design.md (role: architect)
  - Deliverable: `docs/adapters/github-pr-adapter-design.md`
  - Validation: Contains all required design elements
  - AC Mapping: AC-005
  - Acceptance Criteria:
    - [x] Adapter type classification (Workspace)
    - [x] Input/Output mapping tables (artifacts → PR files, changed_files → PR commits)
    - [x] Escalation mapping (PR review comment)
    - [x] Retry strategy (configurable)
    - [x] Interface requirements
  - Dependencies: T001, T030

- [x] **T033**: Write openclaw-adapter-design.md (role: architect)
  - Deliverable: `docs/adapters/openclaw-adapter-design.md`
  - Validation: Contains all required design elements
  - AC Mapping: AC-004
  - Acceptance Criteria:
    - [x] Adapter type classification (Orchestrator)
    - [x] Input/Output mapping tables (OpenClaw message → dispatch fields)
    - [x] Escalation mapping (API call)
    - [x] Retry strategy (Auto-retry with log, max 2, configurable)
    - [x] Interface requirements
  - Dependencies: T001, T030

- [x] **T034**: Write external-adapter-design.md (role: architect)
  - Deliverable: `docs/adapters/external-adapter-design.md`
  - Validation: Contains all required design elements
  - AC Mapping: AC-004
  - Acceptance Criteria:
    - [x] Adapter type classification (Workspace/External)
    - [x] Interface framework for external system integration
    - [x] Escalation mapping guidelines
    - [x] Retry strategy guidelines
    - [x] Design预留 for future extensions
  - Dependencies: T001, T030

---

### Phase 4: Documentation & Sync (Governance Update)

**Objective**: Update documentation and ensure governance consistency.
**Estimated Duration**: 0.5 session (1 hour)
**Dependencies**: Phase 3 complete

- [x] **T035**: Update README.md with adapter architecture (role: docs)
  - Deliverable: `README.md` (updated)
  - Validation: README reflects adapter architecture (AC-011)
  - AC Mapping: AC-011
  - Acceptance Criteria:
    - [x] Adds Adapter Architecture section
    - [x] Documents Orchestrator vs Workspace adapters
    - [x] Links to ADAPTERS.md for full documentation
    - [x] Documents CLI/Local adapter usage
    - [x] Documents Local Repo adapter usage
  - Dependencies: T001, T007-T021

- [x] **T036**: Update package.json version (if release) (role: docs)
  - Deliverable: `package.json` (updated)
  - Validation: Version updated per VERSIONING.md
  - AC Mapping: AH-007
  - Acceptance Criteria:
    - [x] Version bumped per semantic versioning
    - [x] Version matches compatibility-matrix.json
  - Dependencies: All prior tasks

- [x] **T037**: Update CHANGELOG.md (role: docs)
  - Deliverable: `CHANGELOG.md` (updated)
  - Validation: CHANGELOG has entry for this feature (AH-008)
  - AC Mapping: AH-008
  - Acceptance Criteria:
    - [x] Added entry under Added/Changed section
    - [x] Describes adapter architecture
    - [x] Lists new CLI/Local and Local Repo adapters
    - [x] References feature ID 020
  - Dependencies: All prior tasks

- [x] **T038**: Update compatibility-matrix.json (if new component) (role: architect)
  - Deliverable: `compatibility-matrix.json` (updated)
  - Validation: Matrix includes new adapter components (AH-009)
  - AC Mapping: AH-009
  - Acceptance Criteria:
    - [x] Adds adapter components to matrix
    - [x] Documents version compatibility
    - [x] Documents migration paths if needed
  - Dependencies: T022

- [x] **T039**: Create docs/adapters/adapter-usage-guide.md (role: docs)
  - Deliverable: `docs/adapters/adapter-usage-guide.md`
  - Validation: Guide complete and accurate
  - AC Mapping: AC-011
  - Acceptance Criteria:
    - [x] Documents how to use CLI/Local adapter
    - [x] Documents how to use Local Repo adapter
    - [x] Documents how to configure adapters
    - [x] Links to examples
  - Dependencies: T026, T027, T030

- [x] **T040**: Governance sync check (AH-001~AH-009) (role: reviewer)
  - Deliverable: `completion-report.md`
  - Validation: AH-001~AH-009 audit rules pass
  - AC Mapping: AC-011
  - Acceptance Criteria:
    - [x] AH-001: Mandatory Canonical Comparison passed
    - [x] AH-002: Cross-Document Consistency passed
    - [x] AH-003: Path Resolution passed
    - [x] AH-004: Status Truthfulness passed
    - [x] AH-005: README Governance Status passed
    - [x] AH-006: Reviewer Enhanced Responsibilities passed
    - [x] AH-007: Version Declarations Synchronized passed
    - [x] AH-008: CHANGELOG Reflects Release passed
    - [x] AH-009: Compatibility Matrix Updated passed
  - Dependencies: All prior tasks

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 40 |
| **Pending** | 0 |
| **In Progress** | 0 |
| **Completed** | 40 |

### Phase Breakdown

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1: Foundation | 6 | ✅ Complete |
| Phase 2A: CLI/Local Adapter | 7 | ✅ Complete |
| Phase 2B: Local Repo Adapter | 8 | ✅ Complete |
| Phase 2C: Version/Profile | 4 | ✅ Complete |
| Phase 3A: Examples | 4 | ✅ Complete |
| Phase 3B: Design Docs | 5 | ✅ Complete |
| Phase 4: Documentation & Sync | 6 | ✅ Complete |

### Acceptance Criteria Coverage

| AC | Description | Covered By Tasks | Status |
|----|-------------|------------------|--------|
| AC-001 | Adapter Architecture Defined | T001, T002, T005, T006 | ✅ |
| AC-002 | CLI/Local Adapter Implemented | T007-T013 | ✅ |
| AC-003 | Local Repo Adapter Implemented | T014-T021 | ✅ |
| AC-004 | Dispatch Mapping Complete | T008, T031, T033 | ✅ |
| AC-005 | Artifact Mapping Complete | T015, T032 | ✅ |
| AC-006 | Escalation Mapping Complete | T011, T018, T031 | ✅ |
| AC-007 | Profile-Workspace Integration Rules | T003, T024, T025 | ✅ |
| AC-008 | Adapter-Contract Interface | T004, T010 | ✅ |
| AC-009 | Adapter-Versioning Interface | T022, T023 | ✅ |
| AC-010 | Examples Provided | T026-T029 | ✅ |
| AC-011 | Docs Sync Complete | T035, T037, T039, T040 | ✅ |

---

## Next Steps

### Recommended Execution Order

#### Session 1: Foundation
1. **T001** - Define ADAPTERS.md architecture document
2. **T002-T006** - Can run in parallel after T001:
   - T002: adapters/registry.json
   - T003: workspace-configuration.schema.json
   - T004: Update io-contract.md
   - T005: OrchestratorAdapter interface
   - T006: WorkspaceAdapter interface

#### Session 2: Core Implementation (Parallel Groups)
**Parallel Group A: CLI/Local Adapter**
3. **T007** - Create cli-local directory
4. **T008-T013** - Sequential after T007:
   - T008: arg-parser.js
   - T009: dispatch-normalizer.js
   - T010: dispatch-validator.js
   - T011: escalation-handler.js
   - T012: retry-handler.js
   - T013: cli-local.config.json

**Parallel Group B: Local Repo Adapter**
5. **T014** - Create local-repo directory
6. **T015-T021** - Sequential after T014:
   - T015: artifact-handler.js
   - T016: changed-files-handler.js
   - T017: console-reporter.js
   - T018: escalation-output-handler.js
   - T019: retry-handler.js
   - T020: local-repo.config.json
   - T021: path-validator.js

**Parallel Group C: Version/Profile (Can start after T001)**
7. **T022-T025** - Can run in parallel:
   - T022: version-check.js
   - T023: profile-loader.js
   - T024: profile-workspace-mapping.json
   - T025: workspace-config-validator.js

#### Session 3: Integration
**Parallel Group A: Examples**
8. **T026-T029** - Sequential:
   - T026: examples/cli-workflow.md
   - T027: examples/local-repo-output.md
   - T028: test-cli-workflow.js
   - T029: test-local-repo.js

**Parallel Group B: Design Docs (Can start after T001)**
9. **T030-T034** - Can run in parallel after T030:
   - T030: Create docs/adapters/ directory
   - T031: github-issue-adapter-design.md
   - T032: github-pr-adapter-design.md
   - T033: openclaw-adapter-design.md
   - T034: external-adapter-design.md

#### Session 4: Documentation & Sync
10. **T035-T039** - Can run in parallel:
    - T035: Update README.md
    - T036: Update package.json
    - T037: Update CHANGELOG.md
    - T038: Update compatibility-matrix.json
    - T039: Create adapter-usage-guide.md
11. **T040** - Governance sync check (runs after all above)

### Quick Start Commands

```bash
# Run tests for CLI adapter
node adapters/cli-local/test-cli-workflow.js

# Run tests for Local Repo adapter
node adapters/local-repo/test-local-repo.js

# Validate workspace config
node adapters/shared/workspace-config-validator.js <config-path>

# Check version compatibility
node adapters/shared/version-check.js

# Load profile config
node adapters/shared/profile-loader.js minimal
```

---

## Validation Checkpoints

### VP-1: Architecture Validation (After Phase 1)
- [x] ADAPTERS.md defines Orchestrator vs Workspace boundary ✓
- [x] registry.json schema valid ✓
- [x] Interfaces align with io-contract.md ✓
- **Validator**: reviewer

### VP-2: Adapter Implementation Validation (After Phase 2)
- [x] CLI/Local adapter: dispatch → valid Dispatch Payload ✓
- [x] Local Repo adapter: Execution Result → file output ✓
- [x] Contract validation passes ✓
- [x] Version compatibility check works ✓
- **Validator**: tester

### VP-3: Integration Validation (After Phase 3)
- [x] CLI workflow example executable ✓
- [x] Local repo output example executable ✓
- [x] Design documents complete (L-001~L-004) ✓
- **Validator**: tester + docs

### VP-4: Governance Validation (After Phase 4)
- [x] README reflects adapter architecture ✓
- [x] CHANGELOG has entry ✓
- [x] io-contract.md consistent ✓
- [x] AH-001~AH-009 audit rules pass ✓
- **Validator**: reviewer

---

## Notes

### Open Questions (From Spec)

These questions should be resolved during implementation:

1. **Adapter configuration location**: `adapters/` or `.opencode/adapters/`?
   - *Current Decision*: Use `adapters/` at project root (consistent with contracts/, templates/)

2. **Multi-adapter concurrency**: Support multiple orchestrator adapters concurrently?
   - *Current Decision*: No, single adapter per execution (spec assumption #4)

3. **Adapter state persistence**: Persist retry count or other state?
   - *Current Decision*: No persistent state, retry handled in-memory

4. **Adapter error recovery**: How to recover from adapter failures?
   - *Current Decision*: Return BLOCKED status, log error details

5. **GitHub Adapter authentication**: How to handle token storage?
   - *Current Decision*: Out of scope for Must-Have, design documents only

6. **External Adapter definition**: Need interface definition for external_system?
   - *Current Decision*: Yes, T034 external-adapter-design.md

### Risk Assessment Reference

| Risk ID | Risk Description | Severity | Mitigation |
|---------|------------------|----------|------------|
| R-001 | Adapter interface conflict with io-contract.md | High | architect defines interfaces before implementation |
| R-002 | Contract validation performance exceeds 100ms | Medium | Use efficient validation, benchmark during dev |
| R-003 | Profile-Workspace mapping unclear | Medium | Define explicit IR-001~IR-004 rules |
| R-004 | Version compatibility check edge cases | Medium | Test against various version combinations |
| R-005 | Examples not executable | Medium | Use relative paths, document prerequisites |
| R-006 | Governance drift | High | Apply AH-001~AH-009 rules in Phase 4 |
| R-007 | Adapter isolation violated | High | architect reviews boundary, tester validates |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial task checklist generated from spec.md and plan.md |
