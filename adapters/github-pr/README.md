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

## Troubleshooting

### Common Issues

#### Authentication Failed

**Symptom**: `Failed to obtain valid authentication token`

**Cause**: `GITHUB_TOKEN` not set or invalid

**Solution**:
1. Verify token is set: `echo $GITHUB_TOKEN`
2. Check token has required scopes: `repo`, `pull_requests:write`, `contents:write`
3. Generate new token at https://github.com/settings/tokens

---

#### Rate Limit Exceeded

**Symptom**: `Rate limit exceeded` warning, 403 errors

**Cause**: Too many API requests

**Solution**:
1. Wait for rate limit reset (check `X-RateLimit-Reset` header)
2. Reduce request frequency
3. Use GitHub App authentication for higher limits (15,000 req/hr vs 5,000 req/hr)

---

#### Branch Creation Failed

**Symptom**: `Reference already exists` error

**Cause**: Branch name already exists in repository

**Solution**:
1. Check if branch exists: `git ls-remote --heads origin`
2. Use unique dispatch_id for each execution
3. Delete old branch if needed: `git push origin --delete branch-name`

---

#### File Write Failed

**Symptom**: `Path contains blocked entry` error

**Cause**: Path validation blocked sensitive files

**Solution**:
1. Check path against blocklist (`.env`, `.git`, `node_modules`, etc.)
2. Use allowed paths only
3. Configure custom blocklist in `github-pr.config.json`

---

#### PR Not Found

**Symptom**: `findPRByBranch` returns null

**Cause**: PR doesn't exist for the branch

**Solution**:
1. Verify branch name matches expected pattern
2. Check PR state (open/closed)
3. Ensure correct owner/repo context

---

#### Review Status Not Applied

**Symptom**: PR review status not changing

**Cause**: Insufficient permissions or PR state issue

**Solution**:
1. Verify token has `pull_requests:write` scope
2. Check PR is not already merged
3. Ensure user has write access to repository

---

### Debug Mode

Enable verbose logging:

```bash
DEBUG=github-pr:* npm test
```

---

## Security Best Practices

### Token Management

#### Storage

- **Never** commit tokens to version control
- Use environment variables or secret managers
- Rotate tokens regularly (90 days recommended)

#### Scope Requirements

| Use Case | Minimum Scope |
|----------|---------------|
| Public repositories | `public_repo` |
| Private repositories | `repo` |
| Organization access | `read:org` |

#### GitHub App vs PAT

| Aspect | GitHub App | PAT |
|--------|------------|-----|
| Rate Limit | 15,000 req/hr | 5,000 req/hr |
| Scope | Fine-grained | Broad |
| Expiry | 10 min tokens | No expiry (v1) |
| Audit | Per-installation | Per-user |
| **Recommendation** | **Production** | Development only |

---

### Path Validation

The adapter blocks writes to sensitive paths:

| Blocked Path | Reason |
|--------------|--------|
| `.env`, `.env.local`, `.env.production` | Environment secrets |
| `.git` | Repository internals |
| `node_modules` | Package dependencies |
| `.npmrc`, `.netrc` | Credential files |
| `id_rsa`, `id_ed25519` | SSH keys |
| `credentials.json`, `secrets.json` | Credential files |

Configure custom blocklist in `github-pr.config.json`:

```json
{
  "github_pr_config": {
    "validation": {
      "path_blocklist": [".env", "secrets", "credentials"]
    }
  }
}
```

---

### Webhook Security (for future use)

When receiving webhooks:

1. **Verify HMAC signature**: Use timing-safe comparison
2. **Validate IP origin**: Check against GitHub's IP ranges
3. **Validate event type**: Process only expected events

---

### Secret Rotation

Token rotation procedure:

1. Generate new token
2. Add to GitHub settings (keep old token during transition)
3. Deploy with both tokens (grace period)
4. Remove old token from GitHub settings
5. Remove old token from configuration

---

### Security Checklist

Before production deployment:

- [ ] `GITHUB_TOKEN` stored in secret manager
- [ ] Token has minimum required scope
- [ ] Path validation enabled
- [ ] Error logs don't contain secrets
- [ ] Rate limit monitoring configured
- [ ] Token rotation schedule defined

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial implementation (Feature 022) |