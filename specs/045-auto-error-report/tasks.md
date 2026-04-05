# Feature 045: Auto Error Report to GitHub - Task List

## Feature ID
`045-auto-error-report`

## Version
`0.1.0`

## Created
2026-04-05

---

## Overview

本任务列表将 Feature 045 的实现分解为可执行任务，覆盖配置系统、自动触发模块、集成触发点和验证阶段。

---

## Phase 1: Configuration System

### T-045-001: Create Configuration Schema File
**Related**: FR-001, TC-002
**Role**: developer
**Dependencies**: None
**Deliverable**: `.opencode/auto-report.json` schema file

**Tasks**:
- Create `.opencode/auto-report-config.schema.json` with JSON Schema Draft 2020-12
- Include all required fields per `contracts/auto-report-config-contract.md` AER-001
- Add default values per contract specification
- Include validation rules VR-001 through VR-004

**Acceptance Criteria**:
- Schema validates example configurations from data-model.md
- Schema includes all 6 top-level required fields
- Schema matches AER-001 contract exactly

---

### T-045-002: Create Default Configuration Template
**Related**: FR-001, TC-002
**Role**: developer
**Dependencies**: T-045-001
**Deliverable**: `.opencode/auto-report.json` template file

**Tasks**:
- Create `.opencode/auto-report.json` with `enabled: false` (default disabled)
- Fill all required fields with default values
- Add `$schema` reference to schema file
- Include comments explaining each field

**Acceptance Criteria**:
- File follows AER-001 contract exactly
- `enabled` is `false` by default (SEC-003)
- All default values match contract specification

---

### T-045-003: Implement Configuration Loader
**Related**: FR-001, FR-003, TC-002
**Role**: developer
**Dependencies**: T-045-001
**Deliverable**: `lib/auto-error-report/config-loader.js`

**Tasks**:
- Create `lib/auto-error-report/` directory structure
- Implement `loadConfig()` function
- Handle file-not-exist scenario (return `default_used: true`, `enabled: false`)
- Handle schema validation failure (return `success: false`, log warning)
- Implement schema validation using AJV or similar
- Add `--validate` CLI mode for manual validation

**API**:
```javascript
function loadConfig(): {
  success: boolean;
  config?: AutoReportConfig;
  error?: string;
  default_used?: boolean;
}
```

**Acceptance Criteria**:
- AC-001: File not exist returns `default_used: true`
- AC-001: Validation failure returns `success: false` with error message
- Unit tests for file-not-exist, validation-success, validation-failure scenarios

---

### T-045-004: Write Config Loader Unit Tests
**Related**: FR-001, AC-001
**Role**: tester
**Dependencies**: T-045-003
**Deliverable**: `tests/unit/auto-error-report/config-loader.test.js`

**Tasks**:
- Test config file exists and validates correctly
- Test config file missing returns default disabled state
- Test invalid schema returns validation error
- Test missing required fields (owner, repo)
- Test invalid enum values (severity_threshold)
- Test rate limit bounds validation

**Acceptance Criteria**:
- 6+ unit tests covering all validation scenarios
- All tests pass with `npm test`

---

## Phase 2: Auto Trigger Module

### T-045-005: Implement Rate Limiter Module [P]
**Related**: FR-005, TC-002
**Role**: developer
**Dependencies**: T-045-003
**Deliverable**: `lib/auto-error-report/rate-limiter.js`

**Tasks**:
- Implement `checkRateLimit(config)` function
- Implement `recordReport(errorHash, timestamp)` function
- Implement `getHourCount()` and `getDayCount()` functions
- Use Map for hour_counts, day_counts, error_hashes storage
- Generate hour_key (YYYY-MM-DD-HH) and day_key (YYYY-MM-DD)
- Implement dedup window expiry cleanup

**API**:
```javascript
function checkRateLimit(config: AutoReportConfig): RateLimitResult;
function recordReport(errorHash: string, timestamp: Date): void;
function getHourCount(): number;
function getDayCount(): number;
```

**Acceptance Criteria**:
- Returns `allowed: false` when hour count exceeds max_per_hour
- Returns `allowed: false` when day count exceeds max_per_day
- Returns remaining counts correctly
- Cleanup removes expired dedup entries

---

### T-045-006: Implement Dedup Manager Module [P]
**Related**: FR-006, TC-002
**Role**: developer
**Dependencies**: None (can parallelize with T-045-005)
**Deliverable**: `lib/auto-error-report/dedup-manager.js`

**Tasks**:
- Implement `computeErrorHash(errorReport)` function
- Use SHA-256 hash with 16-char truncation
- Hash components: `error_code:title:dispatch_id`
- Implement `isDuplicate(errorHash, dedupWindowMinutes)` function
- Implement `recordErrorHash(errorHash)` function
- Store hash → timestamp mapping in memory Map

**API**:
```javascript
function computeErrorHash(errorReport: ErrorReport): string;
function isDuplicate(errorHash: string, dedupWindowMinutes: number): boolean;
function recordErrorHash(errorHash: string): void;
```

**Acceptance Criteria**:
- Same error in same dispatch produces same hash
- Different dispatch with same error produces different hash
- Dedup window correctly identifies duplicates

---

### T-045-007: Implement Trigger Checker Module [P]
**Related**: FR-002, FR-003, TC-002
**Role**: developer
**Dependencies**: None (can parallelize)
**Deliverable**: `lib/auto-error-report/trigger-checker.js`

**Tasks**:
- Implement `shouldAutoReport(errorReport, config)` function
- Check config.enabled flag
- Check severity threshold mapping (low → medium/high/critical)
- Check exclude_types array
- Check only_expert_pack_errors flag (role validation)
- Return TriggerCheckResult with reason

**API**:
```javascript
function shouldAutoReport(
  errorReport: ErrorReport,
  config: AutoReportConfig
): TriggerCheckResult;
```

**Severity Threshold Logic**:
| Threshold | Included Severities |
|-----------|--------------------|
| low | low, medium, high, critical |
| medium | medium, high, critical |
| high | high, critical |
| critical | critical only |

**Acceptance Criteria**:
- Returns `should_trigger: false` when disabled
- Returns correct reason for each rejection case
- Severity threshold comparison follows hierarchy

---

### T-045-008: Implement Core Module Entry Point
**Related**: FR-003, FR-004, TC-002
**Role**: developer
**Dependencies**: T-045-005, T-045-006, T-045-007
**Deliverable**: `lib/auto-error-report/index.js`

**Tasks**:
- Create main `autoReportError(errorReport)` async function
- Integrate config-loader, trigger-checker, rate-limiter, dedup-manager
- Import `reportToIssue` from `lib/github-issue-reporter/index.js`
- Implement async execution flow with failure isolation
- Implement GitHub Token retrieval from environment variable
- Implement result recording after successful publish
- Handle all error types per plan.md Failure Handling section

**API**:
```javascript
async function autoReportError(errorReport: ErrorReport): AutoReportResult;
function shouldAutoReport(errorReport: ErrorReport, config: AutoReportConfig): boolean;
function checkRateLimit(config: AutoReportConfig): RateLimitResult;
function loadConfig(): { success: boolean; config?: AutoReportConfig };
```

**Integration Pattern**:
```javascript
import { reportToIssue } from '../github-issue-reporter/index.js';

async function autoReportError(errorReport) {
  const configResult = loadConfig();
  if (!configResult.success || !configResult.config.enabled) {
    return { success: false, triggered: false, reason: 'disabled' };
  }
  
  if (!shouldAutoReport(errorReport, configResult.config)) {
    return { success: false, triggered: false, reason: 'conditions_not_met' };
  }
  
  const rateLimitResult = checkRateLimit(configResult.config);
  if (!rateLimitResult.allowed) {
    return { success: false, triggered: false, reason: rateLimitResult.reason };
  }
  
  try {
    const result = await reportToIssue(errorReport, {
      owner: configResult.config.target_repository.owner,
      repo: configResult.config.target_repository.repo,
      githubConfig: { token: process.env[configResult.config.github_token_env] }
    });
    
    if (result.success) {
      recordReport(computeErrorHash(errorReport), new Date());
    }
    
    return { success: result.success, triggered: true, issue_url: result.comment_url };
  } catch (error) {
    return { success: false, triggered: true, error: error.message };
  }
}
```

**Acceptance Criteria**:
- AC-002: Checks all conditions before triggering
- AC-004: Failure isolation (catches errors, continues main flow)
- AC-005: Token from environment variable (not hardcoded)
- Returns correct AutoReportResult for all scenarios

---

### T-045-009: Write Rate Limiter Unit Tests
**Related**: FR-005, AC-003
**Role**: tester
**Dependencies**: T-045-005
**Deliverable**: `tests/unit/auto-error-report/rate-limiter.test.js`

**Tasks**:
- Test hour limit enforcement (max_per_hour)
- Test day limit enforcement (max_per_day)
- Test remaining count calculation
- Test recordReport updates state correctly
- Test dedup window expiry cleanup

**Acceptance Criteria**:
- AC-003: Hour limit exceeded returns `allowed: false`
- AC-003: Day limit exceeded returns `allowed: false`
- 5+ unit tests covering rate limit scenarios

---

### T-045-010: Write Dedup Manager Unit Tests
**Related**: FR-006
**Role**: tester
**Dependencies**: T-045-006
**Deliverable**: `tests/unit/auto-error-report/dedup-manager.test.js`

**Tasks**:
- Test hash computation consistency
- Test different errors produce different hashes
- Test same error + same dispatch = same hash
- Test same error + different dispatch = different hash
- Test dedup window detection
- Test hash recording and retrieval

**Acceptance Criteria**:
- Hash computation deterministic and consistent
- Dedup window correctly identifies duplicates
- 6+ unit tests covering hash scenarios

---

### T-045-011: Write Trigger Checker Unit Tests
**Related**: FR-002, AC-002
**Role**: tester
**Dependencies**: T-045-007
**Deliverable**: `tests/unit/auto-error-report/trigger-checker.test.js`

**Tasks**:
- Test disabled config returns `should_trigger: false`
- Test severity threshold comparison (all 4 levels)
- Test exclude_types filtering
- Test only_expert_pack_errors flag
- Test all rejection reason codes

**Acceptance Criteria**:
- AC-002: Severity >= threshold triggers correctly
- All 4 severity thresholds tested
- 6+ unit tests covering trigger scenarios

---

### T-045-012: Write Core Module Unit Tests
**Related**: FR-003, FR-004, AC-002, AC-004, AC-005
**Role**: tester
**Dependencies**: T-045-008
**Deliverable**: `tests/unit/auto-error-report/index.test.js`

**Tasks**:
- Test full workflow: config → trigger check → rate limit → publish
- Test failure isolation (error caught, main flow continues)
- Test GitHub token retrieval from env var
- Test result recording after successful publish
- Test all AutoReportResult scenarios from data-model.md

**Acceptance Criteria**:
- AC-002: Full workflow executes correctly
- AC-004: Failure isolation works (errors caught)
- AC-005: Token from environment variable
- 10+ unit tests covering workflow scenarios

---

## Phase 3: Integration Trigger Points

### T-045-013: Integrate with failure-analysis Skill
**Related**: FR-002, TC-002
**Role**: developer
**Dependencies**: T-045-008
**Deliverable**: Modified `.opencode/skills/common/failure-analysis/SKILL.md`

**Tasks**:
- Add "Step 7: 自动触发检查" after Step 6 in SKILL.md
- Import `autoReportError` from `lib/auto-error-report/index.js`
- Add error-report generation step (call error-reporter)
- Add async execution with failure isolation
- Document integration pattern in SKILL.md

**Integration Pattern**:
```
failure-analysis Step 6: 生成 failure analysis report
    ↓
Step 7: 自动触发检查
    ↓
    ├── 生成 error-report artifact（调用 error-reporter）
    ↓
    ├── 调用 autoReportError(errorReport)
    ↓
    ├── 异步执行，失败静默
    ↓
    └── 继续主流程（返工/升级决策）
```

**Acceptance Criteria**:
- SKILL.md includes Step 7 with clear instructions
- Integration pattern documented
- Step 7 calls autoReportError correctly

---

### T-045-014: Create Integration Test for Skill Trigger
**Related**: FR-002, AC-002
**Role**: tester
**Dependencies**: T-045-013
**Deliverable**: `tests/integration/auto-error-report/skill-trigger.test.js`

**Tasks**:
- Test failure-analysis skill execution triggers auto-report
- Test severity threshold filtering in integration context
- Test rate limit enforcement in integration context
- Test deduplication in integration context
- Mock github-issue-reporter for integration testing

**Acceptance Criteria**:
- AC-002: failure-analysis skill triggers auto-report when conditions met
- Integration test validates full workflow from skill execution

---

## Phase 4: Validation and Cleanup

### T-045-015: Security Review for Token Handling ✅ COMPLETE
**Related**: NFR-003, AC-005, Risk-001
**Role**: security
**Dependencies**: T-045-008
**Deliverable**: Security review report ✅ `specs/045-auto-error-report/security-review-report.md`

**Tasks**:
- ✅ Review GitHub token handling (environment variable only)
- ✅ Review secrets redaction logic (stack trace sanitization) - Finding: Sec-002
- ✅ Review default disabled state (SEC-003)
- ✅ Review config file security (no token storage)
- ✅ Document security findings per security/secret-handling-review skill

**Acceptance Criteria**:
- ✅ AC-005: Token from environment variable verified
- ✅ No token storage in config file verified
- ⚠️ Secrets redaction logic - Major finding documented (Sec-002)

---

### T-045-016: Performance Benchmark Tests ✅ COMPLETE
**Related**: NFR-001
**Role**: tester
**Dependencies**: T-045-008
**Deliverable**: ✅ `tests/performance/auto-error-report/benchmark.test.js`

**Tasks**:
- ✅ Measure auto trigger check execution time (< 10ms target)
- ✅ Measure hash computation time
- ✅ Measure rate limit check time
- ✅ Measure full workflow execution time
- ✅ Document benchmark results

**Acceptance Criteria**:
- ✅ NFR-001: Auto trigger check < 10ms (Actual: < 2ms)
- ✅ Benchmark results documented

---

### T-045-017: Write Usage Documentation ✅ COMPLETE
**Related**: NFR-004
**Role**: docs
**Dependencies**: T-045-008, T-045-013
**Deliverable**: ✅ `docs/auto-error-report-usage.md`

**Tasks**:
- ✅ Document configuration file creation process
- ✅ Document all configuration fields and defaults
- ✅ Document CLI validation command usage
- ✅ Document integration with failure-analysis skill
- ✅ Document troubleshooting guide
- ✅ Add quick start example

**Acceptance Criteria**:
- ✅ NFR-004: All parameters documented
- ✅ Quick start example provided
- ✅ Troubleshooting guide included

---

### T-045-018: Update README Skill List ✅ COMPLETE
**Related**: Governance Sync Rule
**Role**: docs
**Dependencies**: T-045-008
**Deliverable**: ✅ Updated `README.md`

**Tasks**:
- ✅ Update feature list: add 045-auto-error-report entry
- ✅ Update Features count (43 → 44)
- ✅ Ensure consistency with AGENTS.md

**Note**: This feature does NOT create a new skill, it integrates into failure-analysis. Updated feature list only.

---

### T-045-019: Update CHANGELOG ✅ COMPLETE
**Related**: AH-008
**Role**: docs
**Dependencies**: All previous tasks
**Deliverable**: ✅ Updated `CHANGELOG.md` (v1.8.0 entry)

**Tasks**:
- ✅ Add 045-auto-error-report entry under Added section
- ✅ Document new modules: config-loader, rate-limiter, dedup-manager, trigger-checker
- ✅ Document integration with failure-analysis skill
- ✅ Document configuration file `.opencode/auto-report.json`
- ✅ Link to usage documentation

---

### T-045-020: Final Integration Validation ✅ COMPLETE
**Related**: AC-001, AC-002, AC-003, AC-004, AC-005
**Role**: tester
**Dependencies**: All previous tasks
**Deliverable**: ✅ `specs/045-auto-error-report/verification-report.md`

**Tasks**:
- Run all unit tests: `npm test tests/unit/auto-error-report/`
- Run integration tests: `npm test tests/integration/auto-error-report/`
- Run performance benchmarks: `npm test tests/performance/auto-error-report/`
- Validate all AC criteria pass
- Document verification results

**Acceptance Criteria Summary**:
- AC-001: Configuration file loading validated
- AC-002: Auto trigger from failure-analysis validated
- AC-003: Rate limit enforcement validated
- AC-004: Failure isolation validated
- AC-005: Security requirements validated

---

## Task Summary

| Phase | Tasks | Dependencies | Parallelizable |
|-------|-------|--------------|----------------|
| Phase 1: Configuration | T-045-001 ~ T-045-004 | Sequential | No |
| Phase 2: Auto Trigger Module | T-045-005 ~ T-045-012 | T-005, T-006, T-007 parallel | Yes (3 tasks) |
| Phase 3: Integration | T-045-013 ~ T-045-014 | Sequential | No |
| Phase 4: Validation | T-045-015 ~ T-045-020 | Most parallel | Yes (4 tasks) |

**Total Tasks**: 20

**Parallelizable Tasks**:
- [P] T-045-005 (rate-limiter)
- [P] T-045-006 (dedup-manager)
- [P] T-045-007 (trigger-checker)
- [P] T-045-015 (security review)
- [P] T-045-016 (performance benchmark)
- [P] T-045-017 (usage documentation)
- [P] T-045-018 (README update)

---

## Dependency Highlights

### Critical Dependencies
- T-045-008 (Core Module) depends on T-045-005, T-045-006, T-045-007
- T-045-013 (Skill Integration) depends on T-045-008
- All tests depend on their respective implementation tasks

### External Dependencies (TC-001)
- Feature 043: error-reporter (error-report artifact)
- Feature 044: github-issue-reporter (reportToIssue API)
- Node.js crypto module (hash computation)

---

## Next Recommended Command

After completing this task list:
```bash
/spec-implement 045-auto-error-report T-045-001
```

Start with Phase 1 Configuration System tasks.

---

## References

- `specs/045-auto-error-report/spec.md` - Feature specification
- `specs/045-auto-error-report/plan.md` - Implementation plan
- `specs/045-auto-error-report/data-model.md` - Data structures
- `specs/045-auto-error-report/contracts/auto-report-config-contract.md` - Configuration contract
- `specs/043-error-reporter/spec.md` - Error report artifact
- `specs/044-github-issue-reporter/spec.md` - GitHub issue reporter