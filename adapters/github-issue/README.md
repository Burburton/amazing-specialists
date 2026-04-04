# GitHub Issue Orchestrator Adapter

## Overview

The GitHub Issue Orchestrator Adapter enables the Expert Pack to receive task dispatches via GitHub Issues. It parses Issue labels and body content to generate standardized Dispatch Payloads for execution by the 6-role expert system.

## Status

| Field | Value |
|-------|-------|
| **Adapter ID** | `github-issue` |
| **Adapter Type** | `orchestrator` |
| **Priority** | `later` |
| **Version** | `1.0.0` |
| **Status** | `implemented` |
| **Interface** | `OrchestratorAdapter` |

## Architecture

```
GitHub Issue (Webhook/Manual)
    │
    ├── Webhook Handler (signature verification, event filtering)
    │       │
    │       ▼
    ├── Issue Parser [ENHANCED: project_id extraction]
    │       │
    │       ├── Label Parser (milestone, role, command, task, risk)
    │       │
    │       ├── Body Parser (sections: Context, Goal, Constraints, Inputs, Outputs)
    │       │
    │       ├── Repository URL Parser [NEW]
    │       │
    │       ▼
    │   Dispatch Payload (io-contract.md §1)
    │
    ├── GitHub Client (REST API: comments, labels, milestones)
    │
    ├── Git Client [NEW: retry wrapper for git CLI]
    │
    ├── Comment Templates [ENHANCED: result auto-generation]
    │       │
    │       ├── result() - existing
    │       ├── generateResultComment() [NEW]
    │       └── escalate(), retry() - existing
    │
    ├── Retry Handler (backoff, max_retry, risk-level rules)
    │
    ├── Label Setup CLI [NEW: setup-labels.js]
    │
    └── Automation Script [NEW: scripts/process-issue.js]
```

## Components

| Component | File | Purpose |
|-----------|------|---------|
| **Types** | `types.js` | TypeScript type definitions |
| **Config** | `github-issue.config.json` | Adapter configuration |
| **Label Parser** | `label-parser.js` | Parse Issue labels to dispatch metadata |
| **Body Parser** | `body-parser.js` | Parse Issue body sections to task details |
| **Issue Parser** | `issue-parser.js` | Main parser orchestrating label + body + repository URL |
| **GitHub Client** | `github-client.js` | GitHub REST API client with rate limiting |
| **Git Client** | `git-client.js` | Git CLI operations with retry (NEW) |
| **Webhook Handler** | `webhook-handler.js` | Secure webhook handling (HMAC verification) |
| **Comment Templates** | `comment-templates.js` | Markdown templates for comments (enhanced) |
| **Retry Handler** | `retry-handler.js` | Retry decision logic |
| **Label Setup** | `setup-labels.js` | CLI for creating standard labels (NEW) |
| **Label Config** | `labels.json` | Standard label definitions (NEW) |
| **Main Adapter** | `index.js` | OrchestratorAdapter implementation |

## Label Parsing

### Supported Label Patterns

| Pattern | Example | Maps To |
|---------|---------|---------|
| `milestone:M###` | `milestone:M001` | `milestone_id` |
| `task:T###` | `task:T012` | `task_id` |
| `role:{name}` | `role:developer` | `role` |
| `command:{name}` | `command:feature-implementation` | `command` |
| `risk:{level}` | `risk:high` | `risk_level` |

### Role Values

Valid role labels: `architect`, `developer`, `tester`, `reviewer`, `docs`, `security`

### Risk Levels

Valid risk labels: `low`, `medium`, `high`, `critical`

### Business Rules

- **BR-001**: If no `role:` label, use default from config (`developer`)
- **BR-002**: If multiple role labels, use first in priority order (architect > developer > tester > reviewer > docs > security)

## Body Section Parsing

### Expected Sections

| Section | Maps To | Required |
|---------|---------|----------|
| `## Context` | `context.task_scope` | Recommended |
| `## Goal` | `goal` | **Required** |
| `## Constraints` | `constraints[]` | Optional |
| `## Inputs` | `inputs[]` (artifact references) | Optional |
| `## Expected Outputs` | `expected_outputs[]` | Recommended |

### Business Rules

- **BR-003**: If `## Goal` missing, use Issue title as goal

### Input Artifact Formats

```markdown
## Inputs

- design-note: `specs/001/design-note.md` - Design specification
- artifact_id: artifact_type `path` - summary
```

## Webhook Security

### HMAC-SHA256 Verification

The webhook handler uses **timing-safe comparison** (`crypto.timingSafeEqual`) to verify signatures:

```javascript
const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

// Timing-safe comparison prevents timing attacks
const sigBuffer = Buffer.from(signature, 'hex');
const expectedBuffer = Buffer.from(expectedSignature, 'hex');
const valid = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
```

### Event Filtering

| Rule | Events |
|------|--------|
| **BR-006** | Only `issues` event processed |
| **BR-007** | Only `opened`, `edited`, `labeled` actions processed |

## Configuration

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` | Personal access token or OAuth token |
| `GITHUB_WEBHOOK_SECRET` | Webhook HMAC secret |
| `GITHUB_APP_ID` | GitHub App ID (optional) |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App private key (optional) |

### Config File Structure

See `github-issue.config.json` for full configuration options:

```json
{
  "adapter_id": "github-issue",
  "adapter_type": "orchestrator",
  "priority": "later",
  "version": "1.0.0",
  "github_config": {
    "api": { "base_url": "https://api.github.com" },
    "authentication": { "primary_method": "token" },
    "webhook": { "secret_env_var": "GITHUB_WEBHOOK_SECRET" },
    "label_mappings": { "role_prefix": "role:" },
    "retry_config": { "max_retry": 1 },
    "rate_limit": { "enabled": true }
  }
}
```

## Usage

### Webhook Endpoint

```javascript
const { GitHubIssueAdapter } = require('./adapters/github-issue');

const adapter = new GitHubIssueAdapter(config);

// Handle webhook request
const result = await adapter.handleWebhook(request, process.env.GITHUB_WEBHOOK_SECRET);

if (result.valid) {
  const dispatch = adapter.normalizeInput(result.issue);
  adapter.routeToExecution(dispatch);
}
```

### Manual Issue Processing

```javascript
const adapter = new GitHubIssueAdapter(config);

// Fetch and process an issue
const issue = await adapter.githubClient.getIssue(owner, repo, issueNumber);
const dispatch = adapter.normalizeInput(issue);

// Validate dispatch
const validation = adapter.validateDispatch(dispatch);
if (validation.isValid) {
  adapter.routeToExecution(dispatch);
}
```

### Post Execution Result

```javascript
// After execution completes
await adapter.postResult(executionResult, owner, repo, issueNumber);

// Labels updated automatically:
// - SUCCESS → status:completed
// - FAILED_ESCALATE → status:needs-attention
// - Other → status:in-progress
```

## OrchestratorAdapter Interface

Implements all required methods from `io-contract.md §8`:

| Method | Description |
|--------|-------------|
| `normalizeInput(issue)` | Convert GitHub Issue to Dispatch Payload |
| `validateDispatch(dispatch)` | Validate Dispatch against io-contract.md §1 schema |
| `routeToExecution(dispatch)` | Route dispatch to execution entry point |
| `mapError(error)` | Map GitHub API error to ExecutionStatus |
| `generateEscalation(context)` | Generate Escalation object |
| `handleRetry(retryContext)` | Decide retry/abort/escalate |
| `getAdapterInfo()` | Return adapter metadata |

## Error Mapping

| HTTP Status | ExecutionStatus |
|-------------|-----------------|
| 404, 403, 401 | `BLOCKED` |
| 422 | `FAILED_RETRYABLE` |
| 500, 502, 503 | `FAILED_RETRYABLE` |
| Other | `FAILED_RETRYABLE` |

## Retry Strategy

- **Max Retry**: 1 (configurable)
- **Backoff**: Exponential with multiplier
- **Risk-Level Rules**: Critical tasks never retry automatically

## Integration

### Compatible Profiles

- `minimal` (21 MVP skills)
- `full` (37 skills)

### Compatible Workspaces

- `github-pr` (GitHub PR workspace adapter)
- `local-repo` (Local filesystem workspace adapter)

## Testing

```bash
# Run unit tests
cd adapters/github-issue
npm test

# Run specific test
npm test -- tests/unit/label-parser.test.js
```

## Troubleshooting

### Common Issues

#### Webhook Signature Verification Fails

**Symptom**: `Webhook signature verification failed` error in logs

**Cause**:
- `GITHUB_WEBHOOK_SECRET` environment variable not set or incorrect
- Webhook secret mismatch between GitHub app settings and environment
- Payload modified in transit

**Solution**:
1. Verify `GITHUB_WEBHOOK_SECRET` matches the secret configured in your GitHub App/Webhook settings
2. Ensure the secret is not wrapped in quotes in your environment
3. Check that the `X-Hub-Signature-256` header is being passed through your proxy/load balancer

**Prevention**: Use a secret management service (AWS Secrets Manager, GitHub Actions secrets) to store webhook secrets

---

#### Rate Limit Exceeded

**Symptom**: `GitHubClient: Rate limit hit` warning, 403 errors from GitHub API

**Cause**:
- Too many API requests in short time
- Multiple instances sharing same token without coordination

**Solution**:
1. Wait for rate limit reset (check `X-RateLimit-Reset` header)
2. Reduce polling frequency
3. Use conditional requests with `If-None-Match` headers
4. Consider using GitHub App authentication for higher rate limits

**Prevention**: Monitor `adapter.getRateLimitInfo()` and implement request throttling

---

#### Missing Required Labels (BR-001)

**Symptom**: `Missing required label: role` warning in dispatch

**Cause**: Issue created without `role:` label

**Solution**:
1. Add a role label: `role:architect`, `role:developer`, `role:tester`, `role:reviewer`, `role:docs`, or `role:security`
2. Configure `require_role_label: false` in config to use default role

**Prevention**: Use GitHub Issue templates that include required labels

---

#### Authentication Errors (401)

**Symptom**: `HTTP 401: Bad credentials` error

**Cause**:
- `GITHUB_TOKEN` not set or expired
- Token lacks required scope
- Token revoked

**Solution**:
1. Verify `GITHUB_TOKEN` environment variable is set
2. Check token has `repo` scope (private repos) or `public_repo` scope (public repos only)
3. Regenerate token if expired/revoked

**Prevention**: Use GitHub Apps instead of PATs for production; implement token rotation

---

#### 404 Not Found Errors

**Symptom**: `HTTP 404: Not Found` when accessing issue

**Cause**:
- Repository doesn't exist
- Issue number doesn't exist
- Token doesn't have access to repository

**Solution**:
1. Verify repository exists and is accessible
2. Verify issue number is valid
3. Check token has access to the repository

---

#### Dispatch Validation Fails

**Symptom**: `Dispatch payload validation failed` error

**Cause**:
- Missing required fields (goal, title)
- Invalid field values
- Schema mismatch

**Solution**:
1. Check `validation.errors` array for specific field errors
2. Ensure Issue has required sections (`## Goal` is mandatory)
3. Verify label formats match expected patterns

---

#### Retry Exhausted

**Symptom**: Task escalated after multiple retry attempts

**Cause**:
- Persistent error (API, network, or logic)
- Max retry limit reached (default: 1)

**Solution**:
1. Check `retry_count` in execution context
2. Review error logs for root cause
3. Increase `max_retry` in config if transient errors are common
4. For critical risk tasks, manual intervention is required

---

### Debugging Tips

1. **Enable Debug Logging**:
   ```bash
   DEBUG=github-issue-adapter:* npm start
   ```

2. **Validate Configuration**:
   ```javascript
   const config = require('./github-issue.config.json');
   console.log(JSON.stringify(config, null, 2));
   ```

3. **Test Webhook Locally**:
   ```bash
   # Use smee.io for webhook proxy
   npx smee-client --url https://smee.io/YOUR_CHANNEL --target localhost:3000/webhook
   ```

4. **Verify Token Scopes**:
   ```bash
   curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
   # Check X-OAuth-Scopes header in response
   ```

---

## Security Best Practices

### Webhook Security

#### HMAC-SHA256 Signature Verification

The adapter verifies webhook authenticity using HMAC-SHA256:

```javascript
// Signature format: sha256=<hex-digest>
const signature = headers['x-hub-signature-256'];
const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
```

**Why Timing-Safe Comparison Matters**:

Standard string comparison (`===`) is vulnerable to timing attacks. Attackers can measure response time to guess characters one-by-one. The adapter uses `crypto.timingSafeEqual()` to prevent this:

```javascript
// Vulnerable to timing attacks
if (signature === expected) { ... }

// Secure - constant-time comparison
const sigBuffer = Buffer.from(signature, 'hex');
const expectedBuffer = Buffer.from(expected, 'hex');
if (crypto.timingSafeEqual(sigBuffer, expectedBuffer)) { ... }
```

#### Secret Rotation Procedure

1. Generate new secret: `openssl rand -hex 32`
2. Add new secret to GitHub App/Webhook settings (keep old secret)
3. Deploy adapter with both secrets (supporting grace period)
4. Remove old secret from GitHub settings
5. Remove old secret from adapter configuration

#### IP Allowlisting

GitHub publishes webhook IP ranges:
```bash
curl -s https://api.github.com/meta | jq '.hooks'
```

Consider allowlisting these IPs at your firewall/load balancer level.

---

### Token Management

#### Scope Requirements

| Use Case | Minimum Scope |
|----------|---------------|
| Public repositories | `public_repo` |
| Private repositories | `repo` |
| Organization webhooks | `admin:org_hook` |
| GitHub Apps | No PAT needed (uses App JWT) |

#### Storage Best Practices

- **Never** commit tokens to version control
- **Never** log tokens in error messages
- Use environment variables or secret managers
- Rotate tokens regularly (90 days recommended)

#### GitHub App vs PAT Trade-offs

| Aspect | GitHub App | Personal Access Token |
|--------|------------|----------------------|
| Rate Limit | 15,000 req/hr | 5,000 req/hr |
| Scope | Fine-grained | Broad |
| Expiry | 10 min tokens | No expiry (PAT v1) |
| Audit | Per-installation | Per-user |
| Recommendation | **Production** | Development only |

---

### Rate Limiting Protection

The adapter includes built-in rate limit tracking:

```javascript
const rateLimitInfo = adapter.githubClient.getRateLimitInfo();
// { limit: 5000, remaining: 4999, reset: 1234567890000, used: 1 }
```

**Rate Limit Response Strategy**:
1. Check `remaining` before bulk operations
2. Implement exponential backoff when `remaining < 100`
3. Use `reset` timestamp to schedule retry

---

### Input Validation

#### Label Sanitization

Labels are validated against allowed patterns:
- `role:` prefix → must be one of 6 valid roles
- `risk:` prefix → must be `low`, `medium`, `high`, or `critical`
- Unrecognized labels → collected but don't cause errors

#### Body Content Validation

- Section headers must be `## Title` format
- Artifact references must match `artifact:ID (type) at path` pattern
- Maximum body length: 1MB (GitHub limit)

---

### Audit Logging

**Log What**:
- Webhook receipt (event type, delivery ID, timestamp)
- Dispatch generation (issue number, success/failure)
- API operations (rate limit status, errors)
- Retry attempts (count, reason)

**Don't Log**:
- Webhook secrets
- API tokens
- Request/response bodies with sensitive data

---

### Security Checklist

Before deploying to production:

- [ ] `GITHUB_WEBHOOK_SECRET` set via secret manager
- [ ] `GITHUB_TOKEN` has minimum required scope
- [ ] Webhook endpoint uses HTTPS
- [ ] Rate limit monitoring configured
- [ ] Error logs don't contain secrets
- [ ] IP allowlisting configured (optional)
- [ ] Token rotation schedule defined
- [ ] Audit logging enabled

---

## References

- `io-contract.md §1` - Dispatch Payload schema
- `io-contract.md §8` - OrchestratorAdapter interface
- `ADAPTERS.md` - Adapter architecture
- `specs/021-github-issue-adapter/spec.md` - Feature specification
- `docs/adapters/github-issue-adapter-design.md` - Design document
- [GitHub Webhooks Documentation](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-03-29 | Enhanced with setup-labels, git-client, generateResultComment, automation script, issue template (Feature 027) |
| 1.0.0 | 2026-03-28 | Initial implementation (Feature 021) |

## Authentication Setup

### Creating a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set token name (e.g., "OpenCode Expert Pack")
4. Select required scopes:
   - **Public repos**: `public_repo`
   - **Private repos**: `repo` (includes `public_repo`)
5. Click "Generate token"
6. Copy token and store securely

### Setting the Environment Variable

```bash
# Linux/Mac
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"

# Windows (PowerShell)
$env:GITHUB_TOKEN="ghp_xxxxxxxxxxxx"

# Windows (CMD)
set GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

### Token Scope Requirements

| Use Case | Minimum Scope |
|----------|---------------|
| Public repositories only | `public_repo` |
| Private repositories | `repo` |
| Organization webhooks | `admin:org_hook` |
| Label management | `repo` (includes write access) |

### GitHub App Alternative (Production)

For production deployments, use GitHub Apps instead of PATs:
- Higher rate limits (15,000 req/hr vs 5,000 req/hr)
- Fine-grained permissions
- Built-in token rotation
- Per-installation audit trail

## CLI Commands

### Label Setup

Create standard labels in a repository:

```bash
node adapters/github-issue/setup-labels.js --owner <owner> --repo <repo>

# Example:
node adapters/github-issue/setup-labels.js --owner Burburton --repo amazing-specialist-face
```

**Output**:
```
Label Setup Report:
- Created: 27 (role:architect, role:developer, ...)
- Skipped: 0
- Failed: 0
```

**Custom Labels**: Modify `adapters/github-issue/labels.json` to add custom labels.

### Issue Processing Automation

Process an issue end-to-end:

```bash
node scripts/process-issue.js --owner <owner> --repo <repo> --issue <number>

# Example:
node scripts/process-issue.js --owner Burburton --repo amazing-specialist-face --issue 42
```

**Flow**: Fetch Issue → Parse → Validate → Execute → Post Comment → Close (if SUCCESS)

## Issue Template Usage

### Using the Task Template

When creating a new Issue on GitHub:

1. Click "New Issue"
2. Select "Task" template
3. Fill in required sections:
   - **Context**: Background and task context
   - **Goal**: What needs to be achieved (required)
   - **Constraints**: Any limitations
   - **Inputs**: Required artifacts/files
   - **Expected Outputs**: Deliverables
   - **Acceptance Criteria**: Success checklist

### Template Location

`.github/ISSUE_TEMPLATE/task.md`

### Required Labels

The template includes `role:developer` by default. Add additional labels:
- `milestone:MXXX` - Target milestone
- `task:TXXX` - Task ID
- `risk:low|medium|high|critical` - Risk level---

## Complete Workflow Steps

The GitHub Issue workflow follows these steps:

### Step 1: Pre-flight Check

Before starting implementation, verify:

1. **Dependency Check**
   - All dependent Issues are CLOSED
   - Required input files exist in the repository

2. **Environment Check**
   - Required environment variables set (e.g., GITHUB_TOKEN)
   - Development environment ready

3. **Label Check**
   - Issue has correct role label (role:architect, role:developer, etc.)
   - Priority and milestone labels set

### Step 2: Implementation

Follow the Goal and Constraints from the Issue:

1. Read the Issue body sections
2. Follow Constraints and Expected Outputs
3. Implement according to Acceptance Criteria

### Step 3: Verification

Run verification commands from the Issue:

1. Build command: `npm run build`
2. Type check: `npx tsc --noEmit` (if applicable)
3. Tests: `npm test` (if applicable)

Capture evidence of success (build output, test results).

### Step 4: Completion Report

Post a comment on the Issue with:

**Required Sections:**
1. **Summary** - Brief description of what was done
2. **Files Changed** - List of files created/modified
3. **Verification Results** - Build/test output evidence
4. **Acceptance Criteria** - Check each criterion

**Example Comment Format:**
```markdown
## T-XXX Implementation Complete

### Summary
Brief description of changes.

### Files Changed
- `path/to/file.ts` - Description
- `path/to/another.ts` - Description

### Verification Results
- Build: SUCCESS - 63 modules transformed
- Tests: SUCCESS - All passing

### Acceptance Criteria
- [x] Criterion 1
- [x] Criterion 2
- [x] Criterion 3

**Result: SUCCESS**
```

### Step 5: Code Commit & Push (Required)

**CRITICAL: This step MUST be completed before closing the Issue.**

1. **Stage Changes**
   ```bash
   git add <files>
   # or stage all changes
   git add .
   ```

2. **Commit with Standard Format**
   ```bash
   git commit -m "feat(T-XXX): Brief description

   - Detail 1
   - Detail 2

   Closes #XX"
   ```

3. **Push to Remote**
   ```bash
   git push origin <branch>
   ```

4. **Verify Push Success**
   - Confirm no errors during push
   - Verify commit appears in remote repository
   - Check GitHub commit URL is accessible

**Verification Checklist:**
- [ ] All changes committed
- [ ] Commit message follows format
- [ ] Code pushed to remote
- [ ] Commit visible in GitHub

**Common Errors:**
- Push rejected due to remote changes → Pull and rebase first
- Authentication failed → Check GITHUB_TOKEN
- Large files rejected → Use Git LFS or .gitignore

### Step 6: Reviewer Sign-off (Recommended)

For high-risk or complex tasks:

1. Add `role:reviewer` label after code pushed
2. Wait for reviewer validation
3. Reviewer posts sign-off comment
4. Proceed to Step 7 after sign-off

**Risk-based Triggers:**
- `risk:critical` - Always requires reviewer sign-off
- `risk:high` - Recommended reviewer sign-off
- `risk:medium` or lower - Optional reviewer sign-off

### Step 7: Close Issue (After Code Pushed)

**CRITICAL: Issue MUST NOT be closed until code is pushed to remote.**

1. **Verify Prerequisites**
   - Code committed and pushed (Step 5)
   - Build passed verification (Step 3)
   - Completion report posted (Step 4)
   - Reviewer sign-off obtained (if required, Step 6)

2. **Close Issue**
   ```bash
   gh issue close <number> --repo <owner/repo>
   ```
   Or close via GitHub UI.

**Wrong Sequence (DO NOT):**
```
❌ Close Issue → Then commit code
❌ Close Issue → Code only in local
❌ Close Issue → Build failing
```

**Correct Sequence:**
```
✅ Implement → Verify → Commit → Push → Report → Review (optional) → Close
```

---

## Role Trigger Mechanism

Issue completion can trigger additional role assignments:

### Reviewer Trigger

| Condition | Action |
|-----------|--------|
| `risk:critical` label | Automatically add `role:reviewer` label |
| `risk:high` label | Recommend adding `role:reviewer` label |
| Security-related task | Recommend adding `role:security` label |

### Tester Trigger

| Condition | Action |
|-----------|--------|
| Core logic changes | Recommend running `role:tester` validation |
| Breaking changes | Recommend running `role:tester` validation |
| Database schema changes | Recommend running `role:tester` validation |

### Configuration

Role triggers can be configured in `github-issue.config.json`:

```json
{
  "role_triggers": {
    "reviewer": {
      "auto_trigger_labels": ["risk:critical"],
      "recommend_labels": ["risk:high"],
      "recommend_keywords": ["security", "auth", "permission"]
    },
    "tester": {
      "recommend_keywords": ["breaking", "migration", "schema"]
    }
  }
}
```

---

## Traceability Requirements

### Issue to Code Mapping

Every completion comment must include:

1. **Files Changed List**
   - Full file paths
   - Brief description of changes per file

2. **Functions/Components Affected** (optional)
   - List of modified functions or components
   - Brief description of changes

3. **Verification Evidence**
   - Build output (summary, not full log)
   - Test results summary
   - Type check results (if applicable)

### Traceability File (Optional)

For complex projects, generate `.issue-trace.json`:

```json
{
  "issue": 42,
  "task_id": "T-042",
  "files_changed": [
    {
      "path": "src/pages/HomePage.tsx",
      "change_type": "modified",
      "functions": ["HomePage", "useHomePageData"],
      "lines_added": 45,
      "lines_removed": 12
    }
  ],
  "verification": {
    "build": "success",
    "tests": "passed",
    "type_check": "passed"
  },
  "completed_at": "2026-04-04T12:00:00Z"
}
```

### Commit Message Format

Follow conventional commits with task ID:

```
feat(T-XXX): Brief description

- Detail 1
- Detail 2

Closes #42
```

This enables:
- GitHub automatic issue closure on merge
- Traceability from commit to Issue
- Clear history in git log