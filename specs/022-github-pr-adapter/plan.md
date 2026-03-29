# Implementation Plan: GitHub PR Workspace Adapter

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 022-github-pr-adapter |
| **Plan Version** | 1.0.0 |
| **Status** | Planning |
| **Created** | 2026-03-29 |
| **Target Version** | v1.1 |

---

## Overview

This plan implements the GitHub PR Workspace Adapter based on:
- `specs/022-github-pr-adapter/spec.md` - Feature specification
- `docs/adapters/github-pr-adapter-design.md` - Design document
- `adapters/interfaces/workspace-adapter.interface.ts` - Interface contract
- `adapters/local-repo/` - Reference implementation patterns
- `specs/021-github-issue-adapter/` - Parallel adapter reference

---

## Architecture

### Adapter Classification

| Property | Value | Notes |
|----------|-------|-------|
| **Adapter ID** | `github-pr` | Registry key |
| **Adapter Type** | Workspace | Downstream integration (Execution Result → GitHub PR) |
| **Priority** | Later | Design complete, ready for implementation |
| **Interface** | `WorkspaceAdapter` | io-contract.md §8 |
| **Compatible Profiles** | minimal, full | Both profiles supported |
| **Workspace Type** | `github_repo` | Output to GitHub repository |

### Core Components

```
GitHub PR Adapter
├── File Handler        - Handle changed_files (add/modify/delete/rename)
├── PR Client           - GitHub API wrapper for PR operations
├── Artifact Writer     - Write Execution Result artifacts to PR files
├── Review Manager      - Post review comments and set review status
├── Branch Manager      - Create/update PR branches
├── Commit Builder      - Build commits from file changes
├── Escalation Handler  - Output escalation to PR review comments
├── Retry Handler       - Handle output failures with retry logic
└── Path Validator      - Validate file paths before writing
```

### Interface Requirements

The adapter must implement `WorkspaceAdapter` interface:

```typescript
interface GitHubPRAdapter extends WorkspaceAdapter {
  // Core Methods (Required)
  handleArtifacts(result: ExecutionResult): Promise<ArtifactOutputResult>;
  handleChangedFiles(result: ExecutionResult): Promise<ChangedFilesResult>;
  handleEscalation(escalation: Escalation): Promise<EscalationResult>;
  validateArtifactOutput(artifacts: Artifact[]): Promise<ValidationResult>;
  
  // GitHub PR Specific Methods
  createBranch(dispatchId: string): Promise<BranchResult>;
  createCommit(branch: string, files: ChangedFile[], message: string): Promise<CommitResult>;
  createOrUpdatePR(branch: string, title: string, body: string): Promise<PRResult>;
  postReviewComment(prNumber: number, comment: ReviewComment): Promise<void>;
  setReviewStatus(prNumber: number, status: ReviewStatus): Promise<void>;
  addPRLabel(prNumber: number, label: string): Promise<void>;
}
```

---

## Phase 1: Foundation (T001-T006)

**Goal**: Establish project structure, dependencies, and core infrastructure.

### Tasks

| Task ID | Task Name | Description | Dependencies | Estimated Hours |
|---------|-----------|-------------|--------------|-----------------|
| T001 | Create adapter directory structure | Create `adapters/github-pr/` with subdirectories | None | 0.5 |
| T002 | Initialize package.json | Add dependencies: `@octokit/rest`, `crypto`, `dotenv` | None | 0.5 |
| T003 | Create adapter configuration | `github-pr.config.json` with default values, branch naming, retry config | T001 | 1 |
| T004 | Setup TypeScript definitions | Create `types/github-pr.types.ts` for GitHub-specific types | T001 | 1 |
| T005 | Create shared utilities | Token manager, rate limit tracker, error classifier | T002 | 2 |
| T006 | Setup test infrastructure | Jest config, test helpers, mock utilities | T002 | 1 |

**Phase 1 Deliverables**:
- Directory structure: `adapters/github-pr/{src,tests,__mocks__}/`
- `github-pr.config.json` with complete configuration schema
- `package.json` with all dependencies
- Type definitions for GitHub API types
- Shared utility modules

**Validation Checkpoint**: 
- [ ] Directory structure matches ADAPTERS.md conventions
- [ ] Config file passes JSON validation
- [ ] Dependencies install without errors
- [ ] Test runner executes successfully

---

## Phase 2: Core Implementation (T007-T018)

**Goal**: Implement all core components for PR operations and GitHub API integration.

### Tasks

| Task ID | Task Name | Description | Dependencies | Estimated Hours |
|---------|-----------|-------------|--------------|-----------------|
| T007 | **File Handler** | Implement `file-handler.js` - handle changed_files (add/modify/delete/rename) | T004 | 3 |
| T008 | **PR Client** | Implement `pr-client.js` - GitHub API wrapper for PR operations | T005 | 4 |
| T009 | **Artifact Writer** | Implement `artifact-writer.js` - write Execution Result artifacts to PR files | T007, T008 | 3 |
| T010 | **Review Manager** | Implement `review-manager.js` - post review comments, set review status | T008 | 3 |
| T011 | **Branch Manager** | Implement `branch-manager.js` - create/update PR branches | T008 | 2 |
| T012 | **Commit Builder** | Implement `commit-builder.js` - build commits from file changes | T007, T011 | 2 |
| T013 | **Unit Tests - File Handler** | Comprehensive tests for all file operations | T007 | 2 |
| T014 | **Unit Tests - PR Client** | Mocked API tests using nock, rate limit handling | T008 | 2 |
| T015 | **Unit Tests - Artifact Writer** | Tests for artifact output, path validation | T009 | 1.5 |
| T016 | **Unit Tests - Review Manager** | Tests for review comments and status setting | T010 | 1.5 |
| T017 | **Unit Tests - Branch Manager** | Tests for branch creation and updates | T011 | 1 |
| T018 | **Unit Tests - Commit Builder** | Tests for commit building and message formatting | T012 | 1 |

**Phase 2 Deliverables**:
- `file-handler.js` - Complete file operations (add/modify/delete/rename)
- `pr-client.js` - Full GitHub API client with auth, rate limiting
- `artifact-writer.js` - Artifact output to PR files
- `review-manager.js` - Review comments and status management
- `branch-manager.js` - Branch creation and updates
- `commit-builder.js` - Commit building with proper messages
- Unit test suite with >90% coverage

**Validation Checkpoint**:
- [ ] All unit tests pass
- [ ] File handler handles all change types (added, modified, deleted, renamed)
- [ ] PR client handles rate limits with exponential backoff
- [ ] Branch manager follows naming convention: `expert-pack/{dispatch_id}`
- [ ] Commit builder includes artifact type prefix in messages

---

## Phase 3: Integration (T019-T028)

**Goal**: Implement escalation handling, retry logic, and main adapter interface.

### Tasks

| Task ID | Task Name | Description | Dependencies | Estimated Hours |
|---------|-----------|-------------|--------------|-----------------|
| T019 | **Review Comment Templates** | Implement `comment-templates.js` - Escalation, Retry, Result templates | None | 2 |
| T020 | **Escalation Handler** | Implement `escalation-handler.js` - generate and post escalation comments | T010, T019 | 2 |
| T021 | **Retry Handler** | Implement `retry-handler.js` - decision logic, backoff, retry context | T003, T020 | 2 |
| T022 | **Path Validator** | Implement `path-validator.js` - validate paths before writing (BR-006) | T007 | 1.5 |
| T023 | **Main Adapter** | Implement `index.js` - WorkspaceAdapter interface implementation | T009, T012, T020, T021, T022 | 4 |
| T024 | **Integration Tests** | Test complete workflows: Result → PR → Review | T023 | 3 |
| T025 | **Execution Result Schema** | Create `schemas/execution-result.schema.json` for validation | T023 | 1 |
| T026 | **Update Registry** | Add github-pr adapter entry to `adapters/registry.json` | T023 | 0.5 |
| T027 | **Unit Tests - Escalation Handler** | Test comment generation, label management | T020 | 1 |
| T028 | **Unit Tests - Main Adapter** | Test interface compliance, error handling | T023 | 2 |

**Phase 3 Deliverables**:
- `comment-templates.js` - Three template types with variable substitution
- `escalation-handler.js` - Escalation generation and GitHub posting
- `retry-handler.js` - Complete retry logic with user decision flow
- `path-validator.js` - Path validation per BR-006
- `index.js` - Full WorkspaceAdapter implementation
- `execution-result.schema.json` - JSON Schema for Execution Result validation
- Integration test suite
- Updated `adapters/registry.json`

**Validation Checkpoint**:
- [ ] Main adapter implements all required WorkspaceAdapter methods
- [ ] Integration tests cover all 6 core workflows
- [ ] Retry handler respects max_retry config
- [ ] Escalation comments include all required sections (blocking_points, recommended_next_steps)
- [ ] Path validator prevents writes to .git, .env, etc.
- [ ] Registry entry follows schema definition

---

## Phase 4: Documentation & Sync (T029-T036)

**Goal**: Complete documentation, examples, and governance updates.

### Tasks

| Task ID | Task Name | Description | Dependencies | Estimated Hours |
|---------|-----------|-------------|--------------|-----------------|
| T029 | **Adapter README** | Create `adapters/github-pr/README.md` with usage examples | T023 | 1.5 |
| T030 | **API Documentation** | Document all public methods with JSDoc | T023 | 1 |
| T031 | **Usage Examples** | Create example workflows in `examples/github-pr/` | T023 | 1.5 |
| T032 | **Update ADAPTERS.md** | Mark GitHub PR as "Implemented" with link to adapter | T026 | 0.5 |
| T033 | **E2E Test Setup** | Create E2E test with real GitHub test repository | T024 | 2 |
| T034 | **Troubleshooting Guide** | Common issues and solutions documentation | T029 | 1 |
| T035 | **Security Documentation** | Token management and PR security best practices | T029 | 0.5 |
| T036 | **Update CHANGELOG** | Add v1.1 entry for GitHub PR Adapter | All | 0.5 |

**Phase 4 Deliverables**:
- `README.md` - Complete usage guide
- JSDoc comments on all public APIs
- Example workflows (3-5 examples)
- Updated `ADAPTERS.md` status
- E2E test suite
- Troubleshooting guide
- Security best practices doc
- CHANGELOG update per AH-008

**Validation Checkpoint**:
- [ ] README includes setup instructions, configuration guide, and examples
- [ ] E2E tests pass against real GitHub repository
- [ ] ADAPTERS.md correctly references implementation
- [ ] All acceptance criteria from spec.md are met
- [ ] CHANGELOG updated per AH-008

---

## Risk Mitigation

### Risk 1: GitHub API Rate Limiting

**Impact**: HIGH  
**Probability**: MEDIUM  
**Description**: GitHub API has rate limits (5000 req/hour for PAT). Heavy usage could trigger limits.

**Mitigation**:
- Implement rate limit tracking via `X-RateLimit-Remaining` header (T005, T008)
- Exponential backoff when approaching limits
- Batch file operations when possible
- Document rate limit behavior in troubleshooting guide (T034)

**Fallback**:
- Cache responses where appropriate
- Queue non-critical operations
- Document manual retry procedures

### Risk 2: PR Merge Conflicts

**Impact**: MEDIUM  
**Probability**: MEDIUM  
**Description**: When updating existing PRs, merge conflicts may occur with base branch.

**Mitigation**:
- Check for conflicts before committing (T011)
- Request user resolution via PR comment when conflicts detected
- Document conflict resolution in troubleshooting guide (T034)

**Fallback**:
- Create new branch if conflict resolution fails
- Escalate to user for manual merge

### Risk 3: GitHub API Breaking Changes

**Impact**: MEDIUM  
**Probability**: LOW  
**Description**: GitHub may deprecate or change API endpoints.

**Mitigation**:
- Use official Octokit SDK (maintained by GitHub) (T008)
- Pin to specific version ranges
- Monitor GitHub API changelog
- Abstract API calls behind client layer

**Fallback**:
- Version gating in adapter
- Graceful degradation for unsupported features

### Risk 4: Authentication Token Management

**Impact**: HIGH  
**Probability**: MEDIUM  
**Description**: Token expiration, scope issues, or leakage could block operations.

**Mitigation**:
- Support both PAT and GitHub App authentication (T005)
- Implement token validation on startup
- Minimal scope principle (repo, pull_requests:write, contents:write)
- Document token setup procedures (T029)
- Never log tokens

**Fallback**:
- Graceful error handling with clear messages
- Manual token refresh instructions

### Risk 5: File Path Security

**Impact**: HIGH  
**Probability**: MEDIUM  
**Description**: Malicious or accidental paths could overwrite sensitive files (.git, .env).

**Mitigation**:
- Strict path validation before any write operation (T022)
- Blocklist for sensitive paths (.git, .env, node_modules)
- Whitelist approach for allowed paths
- Profile-based path restrictions (BR-006)

**Fallback**:
- Escalate when path validation fails
- Audit log all write attempts

### Risk 6: Integration Complexity

**Impact**: MEDIUM  
**Probability**: MEDIUM  
**Description**: Coordinating multiple components (file handling, PR operations, reviews, retry) may introduce bugs.

**Mitigation**:
- Clear module boundaries (per ADAPTERS.md)
- Comprehensive integration tests (T024)
- Interface contracts strictly followed
- Incremental development with validation checkpoints

**Fallback**:
- Feature flags for new functionality
- Rollback to previous version

---

## Dependencies

### External Dependencies

| Dependency | Version | Purpose | Install Command |
|------------|---------|---------|-----------------|
| `@octokit/rest` | ^20.x | GitHub REST API client | `npm install @octokit/rest` |
| `@octokit/graphql` | ^7.x | GitHub GraphQL API (optional) | `npm install @octokit/graphql` |
| `dotenv` | ^16.x | Environment variable management | `npm install dotenv` |

### Internal Dependencies

| Module | Path | Purpose |
|--------|------|---------|
| WorkspaceAdapter Interface | `adapters/interfaces/workspace-adapter.interface.ts` | Interface contract |
| Contract Schema Pack | `contracts/pack/` | Validation utilities |
| Shared Utilities | `adapters/shared/` | Version check, profile loader |

### Runtime Dependencies

| Requirement | Source | Notes |
|-------------|--------|-------|
| Node.js 18+ | Environment | Required for modern async/await |
| GitHub Token | Environment Variable | `GITHUB_TOKEN` or `GITHUB_APP_*` |
| Network Access | Infrastructure | api.github.com must be reachable |
| Write Access to Repo | GitHub Permissions | Contents:write, Pull requests:write |

---

## Parallel Execution

### Parallel Groups

The following tasks can run concurrently:

**Group A: Infrastructure (Phase 1)**
- T001, T002, T006 can start immediately
- T003, T004, T005 can run in parallel after T001

**Group B: Core Components (Phase 2)**
- T007 (File Handler) and T008 (PR Client) are **independent**
- T011 (Branch Manager) can run parallel with T007/T008
- T013-T018 (Unit Tests) can run parallel with implementation

**Group C: Handler Components (Phase 3)**
- T019 (Comment Templates) is **independent**
- T020 (Escalation Handler) and T021 (Retry Handler) can run in parallel
- T022 (Path Validator) is **independent**
- T025 (Schema) is **independent**

**Group D: Documentation (Phase 4)**
- T030, T031, T034, T035 can run in parallel after T023

### Execution Flow Diagram

```
Phase 1: Foundation
├── T001 (Directory) ──┬── T003 (Config) ──┐
├── T002 (Package) ────┼── T004 (Types) ───┼── T007 (File Handler)
└── T006 (Tests) ──────┴── T005 (Utils) ───┴── T008 (PR Client)
                                                    │
Phase 2: Core                              ┌────────┴────────┐
├── T007 (File Handler) ───────────────────┤                 │
├── T008 (PR Client) ──────────────────────┤   T009 (Artifact│
├── T011 (Branch Manager) ─────────────────┤      Writer)    │
│   └── T012 (Commit Builder)              │                 │
└── T013 to T018 (Tests)                   └────────┬────────┘
                                                    │
Phase 3: Integration                                │
├── T019 (Templates) ──────────────────────┐       │
├── T020 (Escalation Handler) ─────────────┤   T023 (Main    │
├── T021 (Retry Handler) ──────────────────┤   Adapter)      │
├── T022 (Path Validator) ─────────────────┤                 │
├── T025 (Schema) ─────────────────────────┤                 │
│   └── T026 (Registry)                    │                 │
└── T024, T027, T028 (Tests) ──────────────┘                 │
                                                            │
Phase 4: Documentation                                      │
├── T029 (README) ─────────────────────────┐                 │
├── T030 (JSDoc) ──────────────────────────┤   T033 (E2E     │
├── T031 (Examples) ───────────────────────┤   Tests)        │
├── T032 (ADAPTERS.md) ────────────────────┤                 │
├── T034 (Troubleshooting) ────────────────┤                 │
├── T035 (Security) ───────────────────────┤                 │
└── T036 (CHANGELOG) ──────────────────────┘                 │
```

---

## Estimated Effort

### Summary by Phase

| Phase | Tasks | Estimated Hours | Calendar Days* |
|-------|-------|-----------------|----------------|
| Phase 1: Foundation | 6 | 8 | 2 |
| Phase 2: Core Implementation | 12 | 22 | 5 |
| Phase 3: Integration | 10 | 19 | 4 |
| Phase 4: Documentation | 8 | 8.5 | 2 |
| **Total** | **36** | **57.5** | **13** |

*Calendar days assume 2 parallel developers working 6 hours/day, with some parallel task execution.

### Effort by Component

| Component | Tasks | Hours | Complexity |
|-----------|-------|-------|------------|
| **File Operations** | T007, T013 | 5 | Medium |
| **GitHub API Client** | T008, T014 | 6 | High |
| **Artifact Output** | T009, T015 | 4.5 | Medium |
| **Review Management** | T010, T016 | 4.5 | Medium |
| **Branch/Commit Management** | T011, T012, T017, T018 | 6 | Medium |
| **Retry/Escalation** | T019, T020, T021, T027 | 7 | Medium |
| **Main Adapter** | T022, T023, T028 | 7 | High |
| **Testing** | T013-T018, T024, T027, T028, T033 | 13.5 | Medium |
| **Documentation** | T029-T036 | 7 | Low |
| **Infrastructure** | T001-T006 | 8 | Low |

### Resource Requirements

| Resource | Hours | Skills Required |
|----------|-------|-----------------|
| Senior Developer | 42 | Node.js, GitHub API, Git operations, Testing |
| Technical Writer | 6.5 | Documentation, Examples |
| QA Engineer | 10 | Integration testing, E2E testing |

---

## File Structure

```
adapters/github-pr/
├── README.md                           # Usage documentation (T029)
├── package.json                        # Dependencies (T002)
├── github-pr.config.json               # Adapter configuration (T003)
├── index.js                            # Main WorkspaceAdapter implementation (T023)
│
├── src/
│   ├── file-handler.js                 # File operations (T007)
│   ├── pr-client.js                    # GitHub API wrapper (T008)
│   ├── artifact-writer.js              # Artifact output (T009)
│   ├── review-manager.js               # Review comments/status (T010)
│   ├── branch-manager.js               # Branch management (T011)
│   ├── commit-builder.js               # Commit building (T012)
│   ├── escalation-handler.js           # Escalation handling (T020)
│   ├── retry-handler.js                # Retry logic (T021)
│   ├── path-validator.js               # Path validation (T022)
│   ├── comment-templates.js            # Comment templates (T019)
│   └── utils/
│       ├── token-manager.js            # Token management (T005)
│       ├── rate-limit-tracker.js       # Rate limit handling (T005)
│       └── error-classifier.js         # Error classification (T005)
│
├── types/
│   └── github-pr.types.ts              # TypeScript definitions (T004)
│
├── schemas/
│   └── execution-result.schema.json    # Execution Result schema (T025)
│
├── tests/
│   ├── unit/
│   │   ├── file-handler.test.js        # File handler tests (T013)
│   │   ├── pr-client.test.js           # PR client tests (T014)
│   │   ├── artifact-writer.test.js     # Artifact writer tests (T015)
│   │   ├── review-manager.test.js      # Review manager tests (T016)
│   │   ├── branch-manager.test.js      # Branch manager tests (T017)
│   │   ├── commit-builder.test.js      # Commit builder tests (T018)
│   │   ├── escalation-handler.test.js  # Escalation handler tests (T027)
│   │   └── index.test.js               # Main adapter tests (T028)
│   ├── integration/
│   │   └── workflow.test.js            # Integration tests (T024)
│   └── e2e/
│       └── github-workflow.test.js     # E2E tests (T033)
│
├── __mocks__/
│   └── github-api.js                   # Mock GitHub API responses
│
└── examples/
    ├── execution-result.json           # Sample execution result
    ├── changed-files.json              # Sample changed files
    └── escalation.json                 # Sample escalation
```

---

## Validation Checkpoints

### Checkpoint 1: Foundation Complete (End of Phase 1)

**Criteria**:
- [ ] All Phase 1 tasks complete
- [ ] `npm install` succeeds
- [ ] Directory structure follows ADAPTERS.md conventions
- [ ] Configuration file validates against schema
- [ ] Type definitions compile without errors

**Validation Command**:
```bash
cd adapters/github-pr
npm install
npm run test:config
```

### Checkpoint 2: Core Components Complete (End of Phase 2)

**Criteria**:
- [ ] All Phase 2 tasks complete
- [ ] Unit test coverage >90%
- [ ] File handler handles all change types
- [ ] PR client handles rate limits
- [ ] Branch manager follows naming convention
- [ ] Commit builder includes artifact type prefix

**Validation Command**:
```bash
npm test
npm run test:coverage
```

### Checkpoint 3: Integration Complete (End of Phase 3)

**Criteria**:
- [ ] All Phase 3 tasks complete
- [ ] Main adapter implements WorkspaceAdapter interface
- [ ] Integration tests pass
- [ ] Registry updated correctly
- [ ] All 6 core workflows tested

**Validation Command**:
```bash
npm run test:integration
npm run test:interface-compliance
npm run validate:registry
```

### Checkpoint 4: Release Ready (End of Phase 4)

**Criteria**:
- [ ] All Phase 4 tasks complete
- [ ] E2E tests pass against real GitHub repo
- [ ] Documentation complete and accurate
- [ ] All acceptance criteria from spec.md met
- [ ] CHANGELOG updated per AH-008

**Validation Command**:
```bash
npm run test:e2e
npm run docs:check
npm run spec:validate
```

---

## References

- `specs/022-github-pr-adapter/spec.md` - Feature specification
- `docs/adapters/github-pr-adapter-design.md` - Design document
- `adapters/interfaces/workspace-adapter.interface.ts` - Interface definition
- `adapters/local-repo/` - Reference implementation patterns
- `specs/021-github-issue-adapter/plan.md` - Parallel adapter plan reference
- `adapters/registry.json` - Adapter registry
- `ADAPTERS.md` - Adapter architecture
- `io-contract.md` - I/O contracts
- GitHub REST API Documentation: https://docs.github.com/en/rest
- GitHub Pull Requests API: https://docs.github.com/en/rest/pulls

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial plan draft |

---

## Open Questions

| Question | Impact | Status | Decision |
|----------|--------|--------|----------|
| Support draft PRs? | LOW | Open | Recommend: Yes, configurable |
| Auto-merge on success? | MEDIUM | Open | Recommend: No, manual decision only |
| Support GitHub Enterprise Server? | LOW | Open | Recommend: No, Phase 2 |
| Concurrent PR processing? | MEDIUM | Open | Recommend: Serial in Phase 1 |
