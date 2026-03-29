# Plan: 027-github-issue-adapter-enhancements

## Metadata

| Field | Value |
|-------|-------|
| Feature ID | 027-github-issue-adapter-enhancements |
| Plan Version | 1.0 |
| Created | 2026-03-29 |
| Status | Draft |

## Design Overview

This plan addresses 5 workflow issues and 2 enhancements discovered during Feature 026's real-world testing. The design follows a modular approach, enhancing existing components without breaking backward compatibility.

## Architecture Changes

### Current Architecture (Feature 021)

```
GitHub Issue (Webhook/Manual)
    │
    ├── Webhook Handler (signature verification)
    │       │
    │       ▼
    ├── Issue Parser
    │       ├── Label Parser (milestone, role, command, task)
    │       └── Body Parser (sections: Context, Goal, Constraints)
    │       │
    │       ▼
    │   Dispatch Payload (io-contract.md §1)
    │
    ├── GitHub Client (REST API with retry)
    │
    ├── Comment Templates (result, escalation, retry)
    │
    └── Retry Handler (backoff, max_retry)
```

### Enhanced Architecture (Feature 027)

```
GitHub Issue (Webhook/Manual)
    │
    ├── Webhook Handler (signature verification)
    │       │
    │       ▼
    ├── Issue Parser [ENHANCED: project_id extraction]
    │       ├── Label Parser (milestone, role, command, task)
    │       ├── Body Parser (sections: Context, Goal, Constraints)
    │       └── Repository URL Parser [NEW]
    │       │
    │       ▼
    │   Dispatch Payload (io-contract.md §1)
    │
    ├── GitHub Client (REST API with retry)
    │
    ├── Git Client [NEW: retry wrapper for git CLI]
    │
    ├── Comment Templates [ENHANCED: result auto-generation]
    │       │
    │       ├── result() - existing
    │       ├── generateResultComment() [NEW METHOD]
    │       └── escalate(), retry() - existing
    │
    ├── Retry Handler [ENHANCED: git operations support]
    │
    ├── Label Setup CLI [NEW: setup-labels.js]
    │
    └── Automation Script [NEW: scripts/process-issue.js]
```

## Component Design

### C1: setup-labels.js (New)

**Purpose**: CLI tool to create standard labels in a repository.

**Location**: `adapters/github-issue/setup-labels.js`

**Design**:
```javascript
// setup-labels.js
class LabelSetup {
  constructor(githubClient, labelConfig) {
    this.client = githubClient;
    this.labelConfig = labelConfig; // labels.json
  }
  
  async run(owner, repo) {
    const results = { created: [], skipped: [], failed: [] };
    
    for (const label of this.labelConfig.labels) {
      try {
        const existing = await this.client.getLabel(owner, repo, label.name);
        if (existing) {
          results.skipped.push(label.name);
        } else {
          await this.client.createLabel(owner, repo, label);
          results.created.push(label.name);
        }
      } catch (error) {
        results.failed.push({ name: label.name, error: error.message });
      }
    }
    
    return results;
  }
}
```

**Label Config**: `adapters/github-issue/labels.json`
```json
{
  "labels": [
    { "name": "role:architect", "color": "0075ca", "description": "Architect role task" },
    { "name": "role:developer", "color": "1d76db", "description": "Developer role task" },
    // ... 20+ labels
  ]
}
```

**CLI Usage**:
```bash
node adapters/github-issue/setup-labels.js --owner Burburton --repo amazing-specialist-face
```

### C2: Issue Parser Enhancement

**Purpose**: Extract `project_id` from Issue's `repository_url`.

**Location**: `adapters/github-issue/issue-parser.js`

**Change**:
```javascript
// issue-parser.js - _extractProjectId() method
_extractProjectId(issue) {
  // NEW: Extract from repository_url
  const repositoryUrl = issue.repository_url;
  if (repositoryUrl) {
    const match = repositoryUrl.match(/repos\/([^/]+)\/([^/]+)$/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
  }
  
  // Fallback
  return 'unknown/unknown';
}
```

### C3: Git Client with Retry (New)

**Purpose**: Wrapper for git CLI operations with retry.

**Location**: `adapters/github-issue/git-client.js`

**Design**:
```javascript
// git-client.js
class GitClient {
  constructor(config) {
    this.maxRetry = config?.maxRetry || 3;
    this.retryHandler = new RetryHandler(config);
  }
  
  async push(remote, branch) {
    return this._retryOperation(() => 
      this._execGit(`git push ${remote} ${branch}`)
    );
  }
  
  async commit(message) {
    return this._retryOperation(() => 
      this._execGit(`git commit -m "${message}"`)
    );
  }
  
  async _retryOperation(operation) {
    let attempts = 0;
    while (attempts < this.maxRetry) {
      try {
        return await operation();
      } catch (error) {
        if (!this._isRetryable(error)) throw error;
        attempts++;
        await this._backoff(attempts);
      }
    }
    throw new Error(`Max retries exceeded`);
  }
  
  _isRetryable(error) {
    // Network errors retry, auth errors don't
    return error.message.includes('network') || 
           error.message.includes('timeout') ||
           error.message.includes('Connection');
  }
  
  async _backoff(attempts) {
    const delay = Math.pow(2, attempts) * 1000;
    await new Promise(r => setTimeout(r, delay));
  }
  
  async _execGit(command) {
    // Use child_process.exec
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });
  }
}
```

### C4: Comment Templates Enhancement

**Purpose**: Add `generateResultComment()` method.

**Location**: `adapters/github-issue/comment-templates.js`

**Change**:
```javascript
// comment-templates.js
class CommentTemplates {
  // Existing: result(vars) method
  
  // NEW: generateResultComment(executionResult)
  generateResultComment(result) {
    const statusEmoji = {
      'SUCCESS': '✅',
      'FAILED_RETRYABLE': '🔄',
      'FAILED_ESCALATE': '⚠️',
      'BLOCKED': '🚫'
    };
    
    const emoji = statusEmoji[result.status] || '❓';
    
    return `## ${emoji} Execution Result

| Field | Value |
|-------|-------|
| Status | ${result.status} |
| Role | ${result.role} |
| Command | ${result.command} |
| Commit | ${result.commit_sha || 'N/A'} |

### Summary
${result.summary}

### Artifacts
${this._formatArtifacts(result.artifacts)}

### Metrics
${this._formatMetrics(result.metrics)}

### Recommendation
${result.recommendation?.join(', ') || 'CONTINUE'}

---
*Generated by GitHub Issue Adapter at ${new Date().toISOString()}*`;
  }
  
  _formatArtifacts(artifacts) {
    if (!artifacts || artifacts.length === 0) return 'None';
    return artifacts.map(a => `- ${a.type}: ${a.path}`).join('\n');
  }
  
  _formatMetrics(metrics) {
    if (!metrics) return 'N/A';
    return Object.entries(metrics)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');
  }
}
```

### C5: Automation Script (New)

**Purpose**: End-to-end Issue processing.

**Location**: `scripts/process-issue.js`

**Design**:
```javascript
// scripts/process-issue.js
class IssueProcessor {
  constructor(adapter, gitClient) {
    this.adapter = adapter; // GitHubIssueAdapter
    this.gitClient = gitClient;
  }
  
  async process(owner, repo, issueNumber) {
    console.log(`Processing Issue #${issueNumber}...`);
    
    // 1. Fetch Issue
    const issue = await this.adapter.githubClient.getIssue(owner, repo, issueNumber);
    
    // 2. Parse → Dispatch
    const dispatch = this.adapter.normalizeInput(issue);
    
    // 3. Validate
    const validation = this.adapter.validateDispatch(dispatch);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    // 4. Execute (placeholder - real execution via skill dispatch)
    console.log('Dispatch ready for execution:', dispatch);
    // In production: call skill dispatch system
    const result = await this._executeDispatch(dispatch);
    
    // 5. Generate Comment
    const comment = this.adapter.commentTemplates.generateResultComment(result);
    
    // 6. Post Comment
    await this.adapter.githubClient.postComment(owner, repo, issueNumber, comment);
    
    // 7. Close Issue (if SUCCESS)
    if (result.status === 'SUCCESS') {
      await this.adapter.githubClient.closeIssue(owner, repo, issueNumber);
      console.log(`Issue #${issueNumber} closed.`);
    }
    
    return { success: true, result };
  }
  
  async _executeDispatch(dispatch) {
    // Placeholder - delegate to actual execution layer
    // Returns mock result for testing
    return {
      status: 'SUCCESS',
      role: dispatch.role,
      command: dispatch.command,
      summary: 'Task executed successfully',
      artifacts: [],
      metrics: { duration_ms: 15000 },
      commit_sha: 'abc123',
      recommendation: ['CONTINUE']
    };
  }
}

// CLI entry
if (require.main === module) {
  const yargs = require('yargs/yargs');
  const { hideBin } = require('yargs/helpers');
  
  const argv = yargs(hideBin(process.argv))
    .option('owner', { type: 'string', demandOption: true })
    .option('repo', { type: 'string', demandOption: true })
    .option('issue', { type: 'number', demandOption: true })
    .argv;
  
  const processor = new IssueProcessor(adapter, gitClient);
  processor.process(argv.owner, argv.repo, argv.issue);
}
```

### C6: Issue Template (New)

**Purpose**: GitHub Issue template for task creation.

**Location**: `.github/ISSUE_TEMPLATE/task.md`

**Content**:
```markdown
---
name: Task
about: Create a task for expert pack execution
title: '[T-XXX]: '
labels: 'role:developer'
assignees: ''
---

## Context
<!-- Describe the task context and background -->

## Goal
<!-- What needs to be achieved (REQUIRED) -->

## Constraints
<!-- Any constraints or limitations -->

## Inputs
<!-- Required inputs (artifacts, files, dependencies) -->
<!-- Format: artifact_type: `path` - description -->

## Expected Outputs
<!-- Expected deliverables -->

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

## Data Model Changes

### Dispatch Payload Enhancement

**Current**:
```javascript
{
  dispatch_id: "gh-issue-unknown-unknown-2",
  project_id: "unknown/unknown",  // <-- Problem
  ...
}
```

**Enhanced**:
```javascript
{
  dispatch_id: "gh-issue-Burburton-amazing-specialist-face-2",
  project_id: "Burburton/amazing-specialist-face",  // <-- Fixed
  ...
}
```

## API Changes

### New APIs

| API | Method | Description |
|-----|--------|-------------|
| `setup-labels.js` | CLI | Create standard labels |
| `git-client.js` | `push(remote, branch)` | Git push with retry |
| `git-client.js` | `commit(message)` | Git commit with retry |
| `comment-templates.js` | `generateResultComment(result)` | Auto-format result comment |
| `scripts/process-issue.js` | CLI | End-to-end Issue processing |

### Modified APIs

| API | Change | Description |
|-----|--------|-------------|
| `issue-parser.js` | New method `_extractProjectId()` | Extract project_id from repository_url |

## Error Handling

### Git Client Error Categories

| Error Type | Retry? | Action |
|------------|--------|--------|
| Network timeout | Yes | Retry with backoff |
| Connection refused | Yes | Retry with backoff |
| Authentication failed | No | Throw immediately |
| Permission denied | No | Throw immediately |
| Merge conflict | No | Throw immediately |

### Label Setup Error Handling

| Error Type | Action |
|------------|--------|
| Label already exists | Skip, add to `skipped` list |
| Permission denied | Add to `failed` list, continue |
| Rate limit hit | Wait and retry |

## Testing Strategy

### Unit Tests

| Component | Test File | Coverage |
|-----------|-----------|----------|
| setup-labels.js | `tests/unit/setup-labels.test.js` | Create/skip/fail scenarios |
| issue-parser.js | `tests/unit/issue-parser.test.js` | project_id extraction |
| git-client.js | `tests/unit/git-client.test.js` | Retry logic, error classification |
| comment-templates.js | `tests/unit/comment-templates.test.js` | generateResultComment output |
| process-issue.js | `tests/unit/process-issue.test.js` | End-to-end flow |

### Integration Tests

| Scenario | Test |
|----------|------|
| Full workflow | Issue → Dispatch → Comment → Close |
| Label setup | Create labels in test repo |
| Git retry | Simulate network failure |

### Validation

- Run existing adapter tests (Feature 021)
- Validate against io-contract.md
- Test with real GitHub repo (amazing-specialist-face)

## Dependencies

### New Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `yargs` | CLI argument parsing | ^17.x |
| `child_process` | Git CLI execution | built-in |

### No New npm Dependencies

- Uses built-in `child_process` for git operations
- Uses existing `yargs` if already installed

## Implementation Order

```
Phase 1: Core Enhancements
├── T-001: project_id extraction (issue-parser.js)
├── T-002: generateResultComment (comment-templates.js)
└── T-003: Git Client with retry (git-client.js)

Phase 2: Automation & UX
├── T-004: Label Setup CLI (setup-labels.js)
├── T-005: Label Config (labels.json)
├── T-006: Issue Template (.github/ISSUE_TEMPLATE/task.md)
└── T-007: Documentation (README updates)

Phase 3: Full Automation
├── T-008: Automation Script (scripts/process-issue.js)
└── T-009: Integration Tests

Phase 4: Validation
├── T-010: Run all tests
├── T-011: Verify io-contract compliance
└── T-012: Real-world test (amazing-specialist-face)
```

## Rollback Plan

If issues arise:
1. Git operations fail → Disable retry, use manual git
2. Label setup fails → Manual label creation fallback
3. Automation script fails → Manual step-by-step workflow

All changes are additive; no existing functionality is modified in a breaking way.

## References

- `specs/027-github-issue-adapter-enhancements/spec.md` - Requirements
- `specs/026-github-issue-adapter-workflow-test/workflow-test-report.md` - Test findings
- `adapters/github-issue/` - Existing adapter code
- `io-contract.md §1` - Dispatch Payload schema