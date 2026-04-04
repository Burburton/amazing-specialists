# Local Repo Output Example

本文档展示 Local Repo Workspace Adapter 的完整输出流程，包括 Artifact 文件写入、Changed Files 处理和 Console 报告。

## Overview

Local Repo Adapter 将 Execution Result 输出到本地文件系统，处理 artifacts 和 changed_files，并通过 console 输出执行摘要。

---

## Prerequisites

```bash
# 确保在项目根目录
cd amazing-specialists

# 确保输出目录存在
mkdir -p ./artifacts

# 验证 Node.js 环境
node --version  # 需要 Node.js 14+
```

---

## Step 1: Execution Result Input

### Example Execution Result

```javascript
const executionResult = {
  dispatch_id: 'a1b2c3d4-e5f6-4789-a012-34567890abcd',
  project_id: 'my-app',
  milestone_id: 'm1',
  task_id: 't001',
  role: 'developer',
  command: 'implement-task',
  
  status: 'SUCCESS',
  summary: 'Successfully implemented user authentication endpoints',
  
  artifacts: [
    {
      artifact_id: 'impl-001',
      artifact_type: 'implementation_summary',
      title: 'Implementation Summary',
      format: 'markdown',
      path: 'developer/impl-001-implementation-summary.md',
      content: `# Implementation Summary\n\n## Changes Made\n- Added login endpoint\n- Added logout endpoint\n- Added auth middleware`,
      summary: 'User authentication endpoints implemented',
      created_by_role: 'developer',
      related_task_id: 't001'
    },
    {
      artifact_id: 'selfcheck-001',
      artifact_type: 'self_check_report',
      title: 'Self-Check Report',
      format: 'markdown',
      path: 'developer/selfcheck-001-report.md',
      content: `# Self-Check Report\n\n## Checklist\n- [x] Code compiles\n- [x] Tests pass\n- [x] No security issues`,
      summary: 'All checks passed',
      created_by_role: 'developer',
      related_task_id: 't001'
    }
  ],
  
  changed_files: [
    {
      path: 'src/controllers/AuthController.ts',
      change_type: 'added',
      content: `// AuthController.ts\nexport class AuthController {\n  login() { ... }\n  logout() { ... }\n}`
    },
    {
      path: 'src/middleware/AuthMiddleware.ts',
      change_type: 'added',
      content: `// AuthMiddleware.ts\nexport class AuthMiddleware { ... }`
    },
    {
      path: 'src/controllers/UserController.ts',
      change_type: 'modified',
      content: `// Updated UserController with auth integration`
    },
    {
      path: 'src/deprecated/AuthOld.ts',
      change_type: 'deleted'
    }
  ],
  
  issues_found: [],
  
  recommendation: 'SEND_TO_TEST',
  
  needs_followup: false
};
```

---

## Step 2: Artifact Output Flow

### Flow Diagram

```
Execution Result
    │
    ▼
┌─────────────────────────────┐
│     Artifact Extractor       │
│   (artifact-handler.js)      │
│   Extract artifacts array    │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│     Path Validator           │
│   (path-validator.js)        │
│   Validate paths (BR-006)    │
│   Check writable permissions │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│     File Writer              │
│   Create directories         │
│   Write artifact content     │
└─────────────────────────────┘
    │
    ▼
./artifacts/developer/
    ├── impl-001-implementation-summary.md
    └── selfcheck-001-report.md
```

---

## Step 3: Artifact File Output Structure

### Output Directory Layout

```
./artifacts/
│
├── developer/
│   ├── impl-001-implementation-summary.md
│   └── selfcheck-001-report.md
│
├── architect/
│   └── design-001-design-note.md
│
├── tester/
│   └── test-001-verification-report.md
│
├── reviewer/
│   └── review-001-findings-report.md
│
├── docs/
│   └── docs-001-sync-report.md
│
└── security/
    └── security-001-review-report.md
```

### Artifact File Content Example

```markdown
# ./artifacts/developer/impl-001-implementation-summary.md

# Implementation Summary

## Changes Made
- Added login endpoint
- Added logout endpoint
- Added auth middleware

## Technical Details
- Used JWT for authentication
- Implemented session management
- Added rate limiting

## Files Changed
- src/controllers/AuthController.ts
- src/middleware/AuthMiddleware.ts

## Testing Notes
- Unit tests created for all endpoints
- Integration tests pending

---
Created by: developer
Task: t001
Timestamp: 2026-03-28T10:30:00Z
```

---

## Step 4: Changed Files Handling

### Change Type Mapping

| change_type | Action | Description |
|-------------|--------|-------------|
| `added` | Create file | New file written to filesystem |
| `modified` | Update file | Existing file updated (with backup) |
| `deleted` | Remove file | File removed from filesystem |
| `renamed` | Move file | File moved to new location |

### Processing Example

```javascript
// From changed-files-handler.js

// Added: Create new file
handleFileAdded(filePath, file, opts, result);
// Creates: src/controllers/AuthController.ts

// Modified: Update with backup
handleFileModified(filePath, file, opts, result);
// Updates: src/controllers/UserController.ts
// Backup: src/controllers/UserController.ts.backup-1700000000000

// Deleted: Remove file
handleFileDeleted(filePath, file, opts, result);
// Removes: src/deprecated/AuthOld.ts

// Renamed: Move file
handleFileRenamed(file, opts, result);
// Moves: old_path -> new_path
```

---

## Step 5: Console Reporter Output

### Example Console Output

```
=== Execution Result [2026-03-28T10:30:00.000Z] ===

Summary:
Successfully implemented user authentication endpoints

Status: SUCCESS

Artifacts (2):
  [implementation_summary] Implementation Summary
    Path: developer/impl-001-implementation-summary.md
  [self_check_report] Self-Check Report
    Path: developer/selfcheck-001-report.md

Changed Files (4):
  + added: src/controllers/AuthController.ts
  + added: src/middleware/AuthMiddleware.ts
  ~ modified: src/controllers/UserController.ts
  - deleted: src/deprecated/AuthOld.ts

Issues Found: None

Recommendation: SEND_TO_TEST - Send to tester for verification

---
Dispatch ID: a1b2c3d4-e5f6-4789-a012-34567890abcd
Role: developer
Command: implement-task
```

---

## Step 6: Path Validation Rules (BR-006)

### Validation Checks

| Rule | Description | Implementation |
|------|-------------|----------------|
| **Path exists** | Parent directory must exist or be creatable | `fs.existsSync(dir)` |
| **Writable** | Path must be writable | Permission check |
| **No conflict** | Cannot overwrite unauthorized files | Profile path check |
| **Profile match** | Path must match profile configuration | Allowed paths check |

### Validation Example

```javascript
// From path-validator.js

const paths = [
  './artifacts/developer/impl-001.md',
  './src/controllers/AuthController.ts'
];

const validation = pathValidator.validatePaths(paths);

// Result:
[
  {
    path: './artifacts/developer/impl-001.md',
    valid: true,
    errors: [],
    warnings: []
  },
  {
    path: './src/controllers/AuthController.ts',
    valid: true,
    errors: [],
    warnings: []
  }
]
```

---

## Step 7: Module Usage Example

### Basic Usage

```javascript
const LocalRepoAdapter = require('./adapters/local-repo');

// Create adapter instance
const adapter = LocalRepoAdapter.create();

// Handle artifacts
const artifactResult = adapter.handleArtifacts(executionResult);
console.log('Artifacts written:', artifactResult.artifacts_written);

// Handle changed files
const filesResult = adapter.handleChangedFiles(executionResult);
console.log('Files changed:', filesResult.files_changed);

// Get output summary
const summary = adapter.getOutputSummary();
console.log('Summary:', summary);
```

### With Configuration

```javascript
const config = {
  workspace_type: 'local_repo',
  profile: 'minimal',
  output_config: {
    artifact_path: './output/artifacts',
    changed_files_path: './output/src',
    console_output: true
  },
  validation_config: {
    validate_paths: true,
    validate_contract: true
  }
};

const adapter = LocalRepoAdapter.create(config);
adapter.handleArtifacts(executionResult);
```

---

## Step 8: Escalation Output Handling

### Example Escalation Output

```
[ESCALATION] esc-1700000000000

Dispatch ID: a1b2c3d4-e5f6-4789-a012-34567890abcd
Project: my-app
Milestone: m1
Task: t001

Level: USER
Reason: FILE_PERMISSION_DENIED

Blocking Points:
  - Cannot write to ./artifacts/ directory
  - Permission denied for ./src/controllers/

Attempted Actions:
  - Attempted to create artifacts directory
  - Failed due to filesystem permissions

Recommended Next Steps:
  1. Check directory permissions
  2. Run with appropriate user permissions
  3. Verify disk space availability

Requires User Decision: true
> [y] Retry with elevated permissions
  [n] Abort execution
```

---

## Step 9: Retry Strategy

### Interactive Retry Example

```
[RETRY] File write failed. Retry? (y/n) [Attempt 1/2]
> y

[RETRY] Retrying file write...
[RETRY] File write successful.
```

### Configuration

```json
// From local-repo.config.json
{
  "retry_config": {
    "strategy": "interactive",
    "max_retry": 2,
    "retry_on_error_types": ["validation_error", "execution_error", "timeout_error"]
  }
}
```

---

## Step 10: Output Result Structure

### Artifact Output Result

```javascript
{
  success: true,
  artifacts_written: [
    './artifacts/developer/impl-001-implementation-summary.md',
    './artifacts/developer/selfcheck-001-report.md'
  ],
  errors: [],
  warnings: []
}
```

### Changed Files Result

```javascript
{
  success: true,
  files_changed: [
    './src/controllers/AuthController.ts',
    './src/middleware/AuthMiddleware.ts',
    './src/controllers/UserController.ts',
    './src/deprecated/AuthOld.ts'
  ],
  errors: [],
  warnings: []
}
```

### Complete Output Summary

```javascript
{
  success: true,
  artifacts_written: ['...'],
  files_changed: ['...'],
  console_output: true,
  errors: [],
  warnings: []
}
```

---

## Step 11: Role-Specific Artifact Types

| Role | Artifact Types |
|------|---------------|
| architect | design_note, open_questions, risks_and_tradeoffs, module_boundaries |
| developer | implementation_summary, self_check_report, bugfix_report |
| tester | verification_report, test_scope_report, regression_risk_report |
| reviewer | review_findings_report, actionable_feedback_report, acceptance_decision_record |
| docs | docs_sync_report, changelog_entry |
| security | security_review_report, input_validation_review_report |

---

## Reference

- `adapters/local-repo/README.md` - Adapter documentation
- `ADAPTERS.md` - Architecture definition
- `io-contract.md §2` - Execution Result schema
- `io-contract.md §3` - Artifact schema
- `specs/020-orchestrator-and-workspace-adapters/tasks.md` - Task checklist

---

## Verification

To verify this workflow works:

```bash
# Run the test script
node adapters/local-repo/test-local-repo.js

# Expected output: All tests pass
```

---

## Key Takeaways

1. **Directory Organization**: Artifacts organized by role in subdirectories
2. **Backup on Modify**: Modified files backed up before changes
3. **Path Validation**: BR-006 compliance before any file operations
4. **Console Reporting**: Colorized output for readability
5. **Interactive Retry**: User controls retry decisions
6. **Traceability**: All outputs linked to dispatch_id and task_id