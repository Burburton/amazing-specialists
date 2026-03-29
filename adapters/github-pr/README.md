# GitHub PR Workspace Adapter

## Overview

The GitHub PR Workspace Adapter outputs Execution Results to GitHub Pull Requests. It is a Later priority workspace adapter for the OpenCode Expert Package, enabling PR-based artifact output and changed files handling.

## Status

| Field | Value |
|-------|-------|
| **Adapter ID** | `github-pr` |
| **Adapter Type** | `workspace` |
| **Priority** | `later` |
| **Version** | `1.0.0` |
| **Status** | `implemented` |
| **Interface** | `WorkspaceAdapter` |

## Architecture

```
Execution Result
    │
    ├── File Handler (process changed_files)
    │       │
    │       ├── Validate paths (BR-006)
    │       ├── Group by change type
    │       └── Build commit operations
    │
    ├── Branch Manager
    │       │
    │       ├── Check for existing PR
    │       ├── Create/update branch
    │       └── Naming: expert-pack/{dispatch_id}
    │
    ├── Artifact Writer
    │       │
    │       ├── Write artifacts to PR files
    │       ├── Create/update commits
    │       └── Validate content size
    │
    ├── PR Client (GitHub API)
    │       │
    │       ├── Create/update PR
    │       ├── Post review comments
    │       ├── Set review status
    │       └── Manage labels
    │
    ├── Review Manager
    │       │
    │       ├── Map status to review event
    │       ├── Post review comments
    │       └── Add status labels
    │
    ├── Escalation Handler
    │       │
    │       ├── Format escalation comment
    │       ├── Post to PR
    │       └── Add escalation label
    │
    └── Retry Handler
            │
            ├── Check retry limits
            ├── Post retry comment
            └── Wait for user decision
```

## Components

| Component | File | Purpose |
|-----------|------|---------|
| **Main Adapter** | `index.js` | WorkspaceAdapter implementation |
| **File Handler** | `src/file-handler.js` | Process changed_files operations |
| **PR Client** | `src/pr-client.js` | GitHub REST API client |
| **Artifact Writer** | `src/artifact-writer.js` | Write artifacts to PR files |
| **Review Manager** | `src/review-manager.js` | PR review status management |
| **Branch Manager** | `src/branch-manager.js` | Branch creation/updates |
| **Commit Builder** | `src/commit-builder.js` | Build commits from changes |
| **Escalation Handler** | `src/escalation-handler.js` | Escalation output to PR |
| **Retry Handler** | `src/retry-handler.js` | Retry decision logic |
| **Path Validator** | `src/path-validator.js` | Path validation (BR-006) |
| **Comment Templates** | `src/comment-templates.js` | Markdown templates |

## Usage

### Basic Usage

```javascript
const { GitHubPRAdapter } = require('./adapters/github-pr');

const adapter = new GitHubPRAdapter(config);

adapter.setContext({
  owner: 'my-org',
  repo: 'my-repo',
  base_branch: 'main'
});

await adapter.handleArtifacts(executionResult);
await adapter.handleChangedFiles(executionResult);

const summary = adapter.getOutputSummary();
```

### With Execution Result

```javascript
const executionResult = {
  dispatch_id: 'dispatch-001',
  project_id: 'owner/repo',
  status: 'SUCCESS',
  artifacts: [
    {
      artifact_id: 'art-001',
      artifact_type: 'implementation_summary',
      path: 'docs/summary.md',
      metadata: { content: '# Summary\n...' }
    }
  ],
  changed_files: [
    {
      path: 'src/feature.js',
      change_type: 'added',
      content: 'export function feature() {}'
    }
  ]
};

await adapter.handleArtifacts(executionResult);
await adapter.handleChangedFiles(executionResult);
await adapter.syncState(executionResult);
```

### Handle Escalation

```javascript
const escalation = {
  escalation_id: 'esc-001',
  reason_type: 'HIGH_RISK_CHANGE',
  blocking_points: ['Breaking API change'],
  recommended_next_steps: ['Review API changes']
};

const result = await adapter.handleEscalation(escalation);
```

## Artifact Output Mapping

| Execution Result Field | GitHub PR Action |
|------------------------|------------------|
| `artifacts[].path` | Add to PR files |
| `artifacts[].content` | PR file content |
| `artifacts[].artifact_type` | Commit message prefix |

## Status Mapping

| Execution Status | PR Review Event |
|------------------|-----------------|
| `SUCCESS` | APPROVE |
| `SUCCESS_WITH_WARNINGS` | APPROVE + comment |
| `PARTIAL` | REQUEST_CHANGES |
| `BLOCKED` | COMMENT |
| `FAILED_RETRYABLE` | REQUEST_CHANGES |
| `FAILED_ESCALATE` | COMMENT + escalation |

## Branch Strategy

- **New PR**: Creates branch `expert-pack/{dispatch_id}`
- **Update PR**: Updates existing branch
- **Base Branch**: Defaults to `main`, configurable

## Configuration

```json
{
  "adapter_id": "github-pr",
  "workspace_type": "github_repo",
  "github_pr_config": {
    "branch_config": {
      "default_base_branch": "main",
      "branch_prefix": "expert-pack/"
    },
    "pr_config": {
      "title_format": {
        "implementation_summary": "[Implement] {title}"
      }
    },
    "labels": {
      "success": "expert-pack:success",
      "escalation": "escalation:needs-decision"
    }
  }
}
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` | Personal access token |
| `GITHUB_APP_ID` | GitHub App ID (optional) |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App private key (optional) |

## Testing

```bash
cd adapters/github-pr
npm install
npm test
npm run test:coverage
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

- `github-issue` - Issue → PR workflow
- `cli-local` - CLI → PR workflow

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial implementation (Feature 022) |