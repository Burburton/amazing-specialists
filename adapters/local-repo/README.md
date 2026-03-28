# Local Repo Workspace Adapter

## Overview

The Local Repo Workspace Adapter handles execution result output to the local filesystem. It is the Must-Have workspace adapter for the OpenCode Expert Package, enabling file-based artifact output and changed files handling.

## Adapter Type

- **Type**: Workspace Adapter
- **Priority**: Must-Have
- **Status**: Implemented
- **Interface**: `WorkspaceAdapter` (see `adapters/interfaces/workspace-adapter.interface.ts`)
- **Workspace Type**: `local_repo`

## Responsibilities

| Responsibility | Description | Implementation |
|----------------|-------------|----------------|
| **Artifact Output** | Write Execution Result artifacts to local filesystem | `artifact-handler.js` |
| **File Handling** | Handle changed_files operations (create/update/delete) | `changed-files-handler.js` |
| **Console Output** | Output execution summary and issues to console | `console-reporter.js` |
| **Escalation Handling** | Output escalation details to console | `escalation-output-handler.js` |
| **Path Validation** | Validate output paths per BR-006 rules | `path-validator.js` |
| **Retry Handling** | Interactive retry for failed output | `retry-handler.js` |

## Files

| File | Purpose |
|------|---------|
| `README.md` | This documentation |
| `artifact-handler.js` | Artifact file output handler |
| `changed-files-handler.js` | Changed files operations handler |
| `console-reporter.js` | Console output formatter |
| `escalation-output-handler.js` | Escalation output handler |
| `retry-handler.js` | Interactive retry handler |
| `path-validator.js` | Path validation (BR-006) |
| `local-repo.config.json` | Adapter configuration |

## Usage

### Basic Usage

```javascript
const LocalRepoAdapter = require('./adapters/local-repo');

// Initialize adapter
const adapter = LocalRepoAdapter.create();

// Handle execution result
adapter.handleArtifacts(executionResult);
adapter.handleChangedFiles(executionResult);

// Get output summary
const summary = adapter.getOutputSummary();
```

### With Configuration

```javascript
const config = require('./local-repo.config.json');
const adapter = LocalRepoAdapter.create(config);

// Validate paths before output
const paths = executionResult.artifacts.map(a => a.path);
const validation = adapter.validatePaths(paths);

if (validation.every(v => v.errors.length === 0)) {
  adapter.handleArtifacts(executionResult);
}
```

## Artifact Output Mapping

Per `ADAPTERS.md` §Workspace Adapter §Local Repo:

| Execution Result Field | Local Repo Action |
|------------------------|-------------------|
| `artifacts[].path` | File write (create/update) |
| `artifacts[].content` | File content |
| `changed_files[].path` | File write/delete |
| `changed_files[].change_type` | added → create, modified → update, deleted → remove |
| `issues_found` | Console output (log) |
| `recommendation` | Console output (status) |

## Escalation Output Mapping

| Escalation Field | Local Repo Action |
|------------------|-------------------|
| `escalation_id` | Console output (print) |
| `reason_type` | Console output (print) |
| `blocking_points` | Console output (list) |
| `recommended_next_steps` | Console output (list) |
| `requires_user_decision` | Interactive prompt |

## Path Validation Rules (BR-006)

Per `io-contract.md` §8:

| Rule | Description |
|------|-------------|
| **Path exists** | Validate parent directory exists |
| **Writable** | Validate path is writable |
| **No conflict** | Validate won't overwrite unauthorized files |
| **Profile match** | Validate path matches profile configuration |

## Retry Strategy

| Property | Value |
|----------|-------|
| Strategy | Interactive |
| Max Retry | 2 (user can override) |
| Trigger | User decision |

## Configuration Schema

Configuration must conform to `adapters/schemas/workspace-configuration.schema.json`:

```json
{
  "workspace_type": "local_repo",
  "profile": "minimal",
  "output_config": {
    "artifact_path": "./artifacts",
    "changed_files_path": "./",
    "console_output": true
  },
  "escalation_config": {
    "channel": "console",
    "requires_acknowledgment": true,
    "interactive_prompt": true
  },
  "retry_config": {
    "strategy": "interactive",
    "max_retry": 2
  }
}
```

## Output Flow

```
Execution Result
    │
    ▼
┌─────────────────────────────┐
│     Artifact Extractor       │
│   (artifact-handler.js)      │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│     Path Validator           │
│   (path-validator.js)        │
│   BR-006 Compliance Check    │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│     File Writer              │
│   (artifact-handler.js)      │
│   Create directories if needed│
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│     Console Reporter         │
│   (console-reporter.js)      │
│   Output summary/issues      │
└─────────────────────────────┘
```

## Contract Reference

- `io-contract.md §2` - Execution Result schema
- `io-contract.md §3` - Artifact schema
- `io-contract.md §8` - Adapter Interface Contract
- `ADAPTERS.md` - Adapter Architecture

## Compatible Profiles

- `minimal` (21 MVP skills)
- `full` (37 skills)

## Compatible Orchestrator Adapters

- `cli-local` (Must-Have)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial implementation (Feature 020) |