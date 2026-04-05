# Feature: GitHub Issue Reporter - Task List

## Feature ID
`044-github-issue-reporter`

## Version
`0.1.0`

## Created
2026-04-05

---

## Phase 1: Setup & Prerequisites

### T-044-001: Verify Dependencies and Environment
**Priority**: P0  
**Role**: developer  
**Related**: TC-001 (Dependencies)  

**Tasks**:
- [x] Verify Feature 043 (error-reporter) artifacts exist and format stable
- [x] Verify Feature 021 (github-issue-adapter) github-client.js available
- [x] Verify Feature 042 (issue-lifecycle-automation) .issue-context.json schema
- [x] Verify Feature 028 (issue-status-sync) docs role pattern
- [x] Check Node.js version >= 18
- [x] Verify GITHUB_TOKEN environment variable availability

**Deliverables**:
- Dependency verification report in `specs/044/artifacts/dependency-check.md`

**Validation**:
- Manual check, all dependencies confirmed available

---

### T-044-002: Create Directory Structure
**Priority**: P0  
**Role**: developer  
**Related**: TC-002 (File Locations)  

**Tasks**:
- [x] Create `.opencode/skills/common/github-issue-reporter/` directory
- [x] Create `lib/github-issue-reporter/` directory
- [x] Create `tests/unit/github-issue-reporter/` directory
- [x] Create `tests/integration/github-issue-reporter/` directory
- [x] Create `specs/044/artifacts/` directory for validation reports

**Deliverables**:
- Directory structure ready for implementation

**Validation**:
- `ls` command confirms all directories exist

---

## Phase 2: Core Implementation

### T-044-003: Define GitHub Issue Reporter Skill
**Priority**: P0  
**Role**: architect  
**Related**: FR-001, AC-001  

**Tasks**:
- [x] Create `.opencode/skills/common/github-issue-reporter/SKILL.md`
- [x] Define skill purpose: consume error-report, publish to Issue
- [x] Define input: error-report artifact (JSON/YAML)
- [x] Define output: comment URL, status update to .issue-context.json
- [x] Define execution steps:
  1. Read error-report artifact
  2. Detect Issue association
  3. Format comment based on severity
  4. Publish comment via github-client
  5. Update .issue-context.json with comment_id
- [x] Define error handling (NO_ISSUE_ASSOCIATED, PERMISSION_DENIED, etc.)
- [x] Define collaboration: upstream error-reporter, downstream github-client
- [x] Define configuration options: auto_publish_to_issue, severity_threshold

**Deliverables**:
- `.opencode/skills/common/github-issue-reporter/SKILL.md` complete

**Validation**:
- Manual review against skill template pattern
- AC-001: Contains complete input/output definitions

---

### T-044-004: Implement Issue Association Detector [P]
**Priority**: P0  
**Role**: developer  
**Related**: FR-003, AC-002  

**Tasks**:
- [x] Create `lib/github-issue-reporter/issue-association.js`
- [x] Implement `detectIssueAssociation(errorReport, cliParams)` function
- [x] Implement dispatch_id parsing: `gh-issue-{owner}-{repo}-{issue_number}` regex
- [x] Implement .issue-context.json Task ID → Issue Number lookup
- [x] Implement CLI `--issue` parameter override (highest priority)
- [x] Implement resolution priority per BR-001:
  1. CLI --issue param
  2. dispatch_id parsing
  3. .issue-context.json lookup
  4. Return NO_ISSUE_ASSOCIATED error
- [x] Return `IssueAssociationResult` interface with success/error details

**Deliverables**:
- `lib/github-issue-reporter/issue-association.js`
- TypeScript interface: `IssueAssociationResult`

**Dependencies**:
- T-044-002 (directory structure)

**Validation**:
- Unit tests: dispatch_id parsing, issue_context lookup, CLI override
- AC-002: dispatch_id and .issue-context.json resolution correct

---

### T-044-005: Implement Error Comment Formatter [P]
**Priority**: P0  
**Role**: developer  
**Related**: FR-002, FR-005, AC-003  

**Tasks**:
- [x] Create `lib/github-issue-reporter/error-comment-formatter.js`
- [x] Implement `formatErrorComment(errorReport, variant)` function
- [x] Implement severity badge mapping per FR-002:
  - low → 🟢 Low
  - medium → 🟡 Medium
  - high → 🔴 High
  - critical → 🟠 Critical
- [x] Implement comment variants per FR-005:
  - **detailed** (critical/high): blocking_points, fix_suggestions, impact, recovery
  - **standard** (medium): error details, recommended_action, simplified impact
  - **simplified** (low): error summary, source, informational note
- [x] Implement template variable substitution:
  - error_code, severity_badge, error_type, role
  - title, description, blocking_points_list
  - source_reference, recommended_action, fix_suggestions
  - downstream_impact, milestone_impact
  - auto_recoverable, retry_count, max_retry
  - error_report_id, created_at
- [x] Ensure GitHub markdown compatibility per BR-005

**Deliverables**:
- `lib/github-issue-reporter/error-comment-formatter.js`
- Comment templates for all severity variants

**Dependencies**:
- T-044-002 (directory structure)

**Validation**:
- Visual verification of rendered comments
- AC-003: Template includes all severity variants, badges correct

---

### T-044-006: Implement Publisher Coordinator
**Priority**: P0  
**Role**: developer  
**Related**: FR-006, NFR-003  

**Tasks**:
- [x] Create `lib/github-issue-reporter/publisher.js`
- [x] Implement `publishErrorReport(errorReport, owner, repo, issueNumber)` async function
- [x] Coordinate workflow: Issue Association → Formatter → GitHub Client
- [x] Implement idempotency check per BR-003:
  - Check .issue-context.json for existing error_report_id → comment_id
  - Skip if already published to same Issue
- [x] Implement retry strategy per NFR-003:
  - Max 3 retries
  - Use github-client `_requestWithRetry` pattern
  - Exponential backoff
- [x] Implement .issue-context.json update:
  - Record comment_id, published_at, error_report_id
  - Mark failure status if publish fails
- [x] Handle error types per plan Failure Handling:
  - NO_ISSUE_ASSOCIATED (ERR-GIR-001)
  - ISSUE_NOT_FOUND (ERR-GIR-002)
  - PERMISSION_DENIED (ERR-GIR-003)
  - API_RATE_LIMIT (ERR-GIR-004)
  - COMMENT_POST_FAILED (ERR-GIR-005)

**Deliverables**:
- `lib/github-issue-reporter/publisher.js`
- `PublishResult` interface

**Dependencies**:
- T-044-004 (issue-association.js)
- T-044-005 (error-comment-formatter.js)

**Validation**:
- Unit tests: idempotency, retry logic, error handling
- Integration: publish workflow coordination

---

### T-044-007: Create Module Entry Point
**Priority**: P1  
**Role**: developer  
**Related**: FR-001  

**Tasks**:
- [x] Create `lib/github-issue-reporter/index.js`
- [x] Export all modules:
  - `detectIssueAssociation`
  - `formatErrorComment`
  - `publishErrorReport`
- [x] Export TypeScript interfaces:
  - `IssueAssociationResult`
  - `ErrorCommentOptions`
  - `PublishResult`
- [x] Add convenience function `reportToIssue(errorReport, options)` that combines all steps

**Deliverables**:
- `lib/github-issue-reporter/index.js`
- Unified module exports

**Dependencies**:
- T-044-004, T-044-005, T-044-006

**Validation**:
- Import test, all exports accessible

---

## Phase 3: Integration & CLI

### T-044-008: Create CLI Command Script
**Priority**: P1  
**Role**: developer  
**Related**: FR-004, AC-004  

**Tasks**:
- [x] Create `scripts/report-error-to-issue.js`
- [x] Implement CLI parameter parsing:
  - `--error-report <path>` (required)
  - `--owner <owner>` (required)
  - `--repo <repo>` (required)
  - `--issue <number>` (optional)
  - `--task <task-id>` (optional)
- [x] Implement error-report artifact reading (JSON/YAML)
- [x] Integrate with `lib/github-issue-reporter/index.js`
- [x] Implement Issue association detection (combine CLI params + dispatch_id + .issue-context.json)
- [x] Implement comment publishing
- [x] Implement output formatting:
  - Success: print comment URL
  - Failure: print error details with suggestion
- [x] Add help message (`--help`)

**Deliverables**:
- `scripts/report-error-to-issue.js`
- CLI command ready for manual testing

**Dependencies**:
- T-044-007 (module entry point)

**Validation**:
- CLI integration tests
- AC-004: Supports --error-report, --issue, --task parameters

---

### T-044-009: Extend Comment Templates
**Priority**: P1  
**Role**: developer  
**Related**: FR-002, Module 6  

**Tasks**:
- [ ] Read existing `adapters/github-issue/comment-templates.js`
- [ ] Add `errorComment(options)` method to CommentTemplates class
- [ ] Implement variant selection based on severity
- [ ] Implement template rendering for all variants (detailed/standard/simplified)
- [ ] Maintain backward compatibility with existing templates

**Deliverables**:
- Extended `adapters/github-issue/comment-templates.js`
- `errorComment` method added

**Dependencies**:
- T-044-005 (error-comment-formatter.js for template reference)

**Validation**:
- Unit tests: template rendering for all variants
- Backward compatibility test: existing templates unaffected

---

### T-044-010: Integrate with github-client
**Priority**: P0  
**Role**: developer  
**Related**: FR-001, AC-005  

**Tasks**:
- [x] Import `github-client.js` in `publisher.js`
- [x] Use `createComment(owner, repo, issueNumber, body)` method
- [x] Leverage existing rate limit handling
- [x] Leverage existing retry mechanism
- [x] Test integration with mock GitHub API

**Deliverables**:
- Integration with github-client complete
- Comment publishing via API

**Dependencies**:
- T-044-006 (publisher.js)

**Validation**:
- Integration tests with mock GitHub API
- AC-005: Integration with github-client correct

---

### T-044-011: Handle Comment Updates (OQ-002)
**Priority**: P1  
**Role**: developer  
**Related**: BR-004, OQ-002 Resolution  

**Tasks**:
- [x] Implement comment update logic in `publisher.js`
- [x] Query .issue-context.json for existing comment_id
- [x] If comment exists, use `updateComment(owner, repo, commentId, body)` instead of create
- [x] Track error_report_id → comment_id mapping in .issue-context.json
- [x] Handle case where error-report content changes (e.g., after retry)

**Deliverables**:
- Comment update functionality
- State tracking in .issue-context.json

**Dependencies**:
- T-044-010 (github-client integration)

**Validation**:
- Unit tests: comment update vs create logic
- Integration: update existing comment

---

## Phase 4: Testing & Documentation

### T-044-012: Write Unit Tests for Issue Association [P]
**Priority**: P0  
**Role**: tester  
**Related**: AC-002  
**Status**: ✅ Complete

**Tasks**:
- [x] Create `tests/unit/github-issue-reporter/issue-association.test.js`
- [x] Test cases:
  - dispatch_id parsing: valid format `gh-issue-owner-repo-123`
  - dispatch_id parsing: invalid format
  - .issue-context.json lookup: Task ID found
  - .issue-context.json lookup: Task ID not found
  - CLI `--issue` override: overrides dispatch_id
  - Resolution priority: CLI > dispatch_id > issue_context
  - NO_ISSUE_ASSOCIATED error: all sources fail
- [x] Document known limitation: dispatch_id parsing doesn't support hyphens in owner/repo names

**Deliverables**:
- `tests/unit/github-issue-reporter/issue-association.test.js` ✅
- All test cases passing (44 tests) ✅

**Dependencies**:
- T-044-004 (issue-association.js) ✅

**Validation**:
- ✅ `npm test tests/unit/github-issue-reporter/issue-association.test.js` - All 44 tests passed

---

### T-044-013: Write Unit Tests for Comment Formatter [P]
**Priority**: P0  
**Role**: tester  
**Related**: AC-003  
**Status**: ✅ Complete

**Tasks**:
- [x] Create `tests/unit/github-issue-reporter/error-comment-formatter.test.js`
- [x] Test cases:
  - [x] Severity badge mapping: all 4 severities
  - [x] Comment variant selection: detailed for critical/high
  - [x] Comment variant selection: standard for medium
  - [x] Comment variant selection: simplified for low
  - [x] Template variable substitution: all fields
  - [x] Markdown format validation: GitHub supported features
  - [x] Edge case: empty fields, missing optional fields

**Deliverables**:
- `tests/unit/github-issue-reporter/error-comment-formatter.test.js` ✅
- All test cases passing (71 tests) ✅

**Dependencies**:
- T-044-005 (error-comment-formatter.js) ✅

**Validation**:
- ✅ `npm test tests/unit/github-issue-reporter/error-comment-formatter.test.js` - All 71 tests passed

---

### T-044-014: Write Unit Tests for Publisher [P]
**Priority**: P0  
**Role**: tester  
**Related**: NFR-003  
**Status**: ✅ Complete

**Tasks**:
- [x] Create `tests/unit/github-issue-reporter/publisher.test.js`
- [x] Test cases:
  - [x] Idempotency: same error_report_id, skip duplicate
  - [x] Retry logic: 3 retries with exponential backoff (delegated to GitHubClient)
  - [x] Error handling: NO_ISSUE_ASSOCIATED
  - [x] Error handling: ISSUE_NOT_FOUND
  - [x] Error handling: PERMISSION_DENIED
  - [x] Error handling: API_RATE_LIMIT
  - [x] .issue-context.json update: record comment_id
  - [x] .issue-context.json update: record failure status

**Deliverables**:
- `tests/unit/github-issue-reporter/publisher.test.js` ✅
- All test cases passing (56 tests) ✅

**Dependencies**:
- T-044-006 (publisher.js) ✅

**Validation**:
- ✅ `npm test tests/unit/github-issue-reporter/publisher.test.js` - All 56 tests passed

---

### T-044-015: Write Integration Tests
**Priority**: P1  
**Role**: tester  
**Related**: AC-005  
**Status**: ✅ Complete

**Tasks**:
- [x] Create `tests/integration/github-issue-reporter/workflow.test.js`
- [x] Test cases:
  - Full workflow: error-report → Issue comment → URL returned
  - CLI command: parameter parsing, artifact reading, publishing
  - Integration with github-client: API call mock
  - Integration with .issue-context.json: state persistence
  - Comment update workflow: existing comment updated
  - Failure isolation: publish failure doesn't affect artifact

**Deliverables**:
- `tests/integration/github-issue-reporter/workflow.test.js` ✅
- All test cases passing (23 tests) ✅

**Dependencies**:
- T-044-007, T-044-008, T-044-010

**Validation**:
- ✅ `npm test tests/integration/github-issue-reporter/workflow.test.js` - All 23 tests passed

---

### T-044-016: Manual CLI Validation
**Priority**: P1  
**Role**: tester  
**Related**: AC-004, AC-005  

**Tasks**:
- [ ] Create sample error-report artifact for testing
- [ ] Run CLI command with valid parameters
- [ ] Verify comment posted to test Issue
- [ ] Verify comment format rendered correctly on GitHub
- [ ] Run CLI with invalid Issue number, verify error message
- [ ] Run CLI without GITHUB_TOKEN, verify permission error
- [ ] Test comment update scenario (same error_report_id twice)

**Deliverables**:
- Manual validation report in `specs/044/artifacts/cli-validation.md`

**Dependencies**:
- T-044-008, T-044-010
- Test Issue available on GitHub repo

**Validation**:
- Manual execution, visual verification

---

### T-044-017: Update Documentation
**Priority**: P1  
**Role**: docs  
**Related**: AC-006  
**Status**: ✅ Complete

**Tasks**:
- [x] Update README.md:
  - Add `github-issue-reporter` to Common Skills list
  - Update Skills count (25 MVP + 16 M4 + 4 Plugin)
  - Update Features count (43)
- [x] Update `docs/skills-usage-guide.md`:
  - Add github-issue-reporter section
  - Add usage examples (automatic + CLI)
- [x] Create usage example in `specs/044/examples/`:
  - Example error-report artifact
  - Example CLI command
  - Example Issue comment output
- [x] Update AGENTS.md if needed (skill invocation pattern) - No changes needed

**Deliverables**:
- README.md updated ✅
- docs/skills-usage-guide.md updated ✅
- Usage examples in specs/044/examples/ ✅

**Dependencies**:
- T-044-003 (SKILL.md) ✅, T-044-008 (CLI) ✅

**Validation**:
- ✅ Documentation review passed
- ✅ AC-006: README updated, usage examples available

---

### T-044-018: Create Verification Report
**Priority**: P0  
**Role**: tester  
**Related**: All AC  
**Status**: ✅ Complete

**Tasks**:
- [x] Create `specs/044/verification-report.md`
- [x] Verify all Acceptance Criteria:
  - AC-001: SKILL.md complete with input/output definitions ✅ PASS
  - AC-002: Issue association detection correct ✅ PASS
  - AC-003: Comment templates with all severity variants ✅ PASS
  - AC-004: CLI command supports all parameters ✅ PASS
  - AC-005: Integration with github-client correct ✅ PASS
  - AC-006: Documentation updated ⚠️ PENDING (T-044-017)
- [x] Run all unit tests, report results (171 tests passed)
- [x] Run all integration tests, report results (23 tests passed)
- [x] Document any known gaps or limitations (3 minor, 1 note)
- [x] Overall verification status: PASS_WITH_WARNINGS

**Deliverables**:
- `specs/044/verification-report.md` ✅

**Dependencies**:
- All previous tasks ✅

**Validation**:
- All AC verified and documented ✅
- Test results: 194/194 tests passed

---

## Task Dependencies Summary

```
T-044-001 (Verify Dependencies) ──────┐
                                      │
T-044-002 (Create Directory Structure)─┼──► T-044-004 [P] (Issue Association)
                                      │          │
                                      │          ├─► T-044-006 (Publisher)
                                      │          │       │
                                      ├──► T-044-005 [P] (Comment Formatter)
                                      │          │       │
                                      │          ├─► T-044-006 (Publisher)
                                      │          │
T-044-003 (Define Skill) ─────────────┘          │
                                                 │
T-044-004 + T-044-005 + T-044-006 ──────────────► T-044-007 (Module Entry)
                                                        │
                                                        ├─► T-044-008 (CLI Command)
                                                        │       │
T-044-005 ─────────────────────────────────────────────► T-044-009 (Comment Templates)
                                                        │
T-044-006 ─────────────────────────────────────────────► T-044-010 (github-client)
                                                        │       │
                                                        │       ├─► T-044-011 (Comment Updates)
                                                        │
T-044-004 ─────────────────────────────────────────────► T-044-012 [P] (Unit Tests - Association)
                                                        │
T-044-005 ─────────────────────────────────────────────► T-044-013 [P] (Unit Tests - Formatter)
                                                        │
T-044-006 ─────────────────────────────────────────────► T-044-014 [P] (Unit Tests - Publisher)
                                                        │
T-044-007 + T-044-008 + T-044-010 ────────────────────► T-044-015 (Integration Tests)
                                                        │
T-044-008 + T-044-010 ───────────────────────────────► T-044-016 (Manual CLI Validation)
                                                        │
T-044-003 + T-044-008 ───────────────────────────────► T-044-017 (Documentation)
                                                        │
All Tasks ───────────────────────────────────────────► T-044-018 (Verification Report)
```

**Parallelizable Tasks** (marked with [P]):
- T-044-004 (Issue Association) and T-044-005 (Comment Formatter) can run in parallel
- T-044-012, T-044-013, T-044-014 (Unit Tests) can run in parallel

---

## Implementation Order

### Recommended Execution Sequence

1. **T-044-001** → Verify dependencies (blocker)
2. **T-044-002** → Create directory structure (blocker)
3. **T-044-003** → Define skill (can start after T-001)
4. **T-044-004 [P]** → Issue association (parallel with T-005)
5. **T-044-005 [P]** → Comment formatter (parallel with T-004)
6. **T-044-006** → Publisher (depends on T-004, T-005)
7. **T-044-007** → Module entry point
8. **T-044-008** → CLI command
9. **T-044-009** → Comment templates extension
10. **T-044-010** → github-client integration
11. **T-044-011** → Comment updates
12. **T-044-012 [P]** → Unit tests (association) (parallel)
13. **T-044-013 [P]** → Unit tests (formatter) (parallel)
14. **T-044-014 [P]** → Unit tests (publisher) (parallel)
15. **T-044-015** → Integration tests
16. **T-044-016** → Manual CLI validation
17. **T-044-017** → Documentation
18. **T-044-018** → Verification report

---

## Estimated Effort

| Task | Effort | Notes |
|------|--------|-------|
| T-044-001 | 0.5h | Dependency verification |
| T-044-002 | 0.25h | Directory creation |
| T-044-003 | 1h | Skill definition (architect) |
| T-044-004 | 2h | Issue association logic |
| T-044-005 | 2h | Comment formatter + templates |
| T-044-006 | 2h | Publisher coordinator |
| T-044-007 | 0.5h | Module entry point |
| T-044-008 | 1.5h | CLI command script |
| T-044-009 | 0.5h | Comment templates extension |
| T-044-010 | 1h | github-client integration |
| T-044-011 | 1h | Comment updates logic |
| T-044-012 | 1h | Unit tests (association) |
| T-044-013 | 1h | Unit tests (formatter) |
| T-044-014 | 1h | Unit tests (publisher) |
| T-044-015 | 1.5h | Integration tests |
| T-044-016 | 1h | Manual CLI validation |
| T-044-017 | 1h | Documentation update |
| T-044-018 | 1h | Verification report |
| **Total** | **15h** | ~2 days |

---

## Next Steps

After completing all tasks:
1. Run `/spec-audit 044-github-issue-reporter` to verify governance alignment
2. Update `README.md` with final feature status
3. Consider `/spec-implement` for next feature or milestone

---

## Risk Mitigation During Implementation

| Risk | Task Mitigation |
|------|-----------------|
| Issue Association Failure (Risk-001) | T-044-004: Provide manual CLI fallback, record status |
| Comment Formatting Variability (Risk-002) | T-044-013: Test GitHub markdown rendering |
| API Rate Limit (Risk-003) | T-044-010: Leverage existing rate limit handling |
| Comment Uniqueness (Risk-004) | T-044-006: Idempotency check, state tracking |

---

## References

- `specs/044-github-issue-reporter/spec.md` - Feature specification
- `specs/044-github-issue-reporter/plan.md` - Implementation plan
- `specs/043-error-reporter/contracts/error-report-contract.md` - Input artifact format
- `adapters/github-issue/github-client.js` - API client reference
- `adapters/github-issue/comment-templates.js` - Template patterns