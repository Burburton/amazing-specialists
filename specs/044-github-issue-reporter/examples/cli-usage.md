# GitHub Issue Reporter CLI Usage Examples

## Example 1: Manual Publication with Explicit Issue Number

### CLI Command
```bash
node scripts/report-error-to-issue.js \
  --error-report specs/044/artifacts/error-report-example.json \
  --owner anomalyco \
  --repo amazing-specialists \
  --issue 42
```

### Expected Output
```
Reading error report from: specs/044/artifacts/error-report-example.json
Publishing to anomalyco/amazing-specialists...

✅ Error report published successfully!

Comment URL: https://github.com/anomalyco/amazing-specialists/issues/42#issuecomment-123456
Comment ID: 123456
```

---

## Example 2: Using Task ID to Find Issue

### CLI Command
```bash
node scripts/report-error-to-issue.js \
  --error-report specs/044/artifacts/error-report-example.json \
  --task T-044-003 \
  --owner anomalyco \
  --repo amazing-specialists
```

### Expected Output
```
Reading error report from: specs/044/artifacts/error-report-example.json
Publishing to anomalyco/amazing-specialists...

✅ Error report published successfully!

Comment URL: https://github.com/anomalyco/amazing-specialists/issues/42#issuecomment-123457
Comment ID: 123457
```

---

## Example 3: Automatic Publication (dispatch_id)

### Scenario
When `dispatch_id` contains Issue information in the format `gh-issue-{owner}-{repo}-{issue_number}`, the system automatically extracts the Issue association.

### Input (error-report artifact)
```json
{
  "error_context": {
    "dispatch_id": "gh-issue-anomalyco-amazing-specialists-42"
  }
}
```

### Expected Behavior
- System parses `dispatch_id` to extract: owner=anomalyco, repo=amazing-specialists, issue_number=42
- Comment is automatically published to Issue #42
- No manual CLI `--issue` parameter required

---

## Example 4: Error - No Issue Associated

### CLI Command (without Issue association)
```bash
node scripts/report-error-to-issue.js \
  --error-report specs/044/artifacts/error-report-no-issue.json \
  --owner anomalyco \
  --repo amazing-specialists
```

### Expected Output
```
Reading error report from: specs/044/artifacts/error-report-no-issue.json
Publishing to anomalyco/amazing-specialists...

❌ Failed to publish error report

Error Code: ERR-GIR-001
Message: No Issue associated with error-report
Suggestion: Use --issue CLI parameter to specify Issue number
Retry Available: false
```

---

## Example 5: Comment Update (Same error_report_id)

### Scenario
When the same `error_report_id` is published again (e.g., after retry with updated content), the existing comment is updated instead of creating a new one.

### First Publication
```bash
node scripts/report-error-to-issue.js \
  --error-report specs/044/artifacts/error-report-example.json \
  --issue 42 \
  --owner anomalyco \
  --repo amazing-specialists

# Output: Comment ID: 123456
```

### Second Publication (after fix)
```bash
node scripts/report-error-to-issue.js \
  --error-report specs/044/artifacts/error-report-example-updated.json \
  --issue 42 \
  --owner anomalyco \
  --repo amazing-specialists

# Output: Comment URL unchanged, content updated
```

### Expected Behavior
- System detects existing comment_id: 123456 in `.issue-context.json`
- Uses `updateComment` API instead of `createComment`
- Comment content is updated, URL remains the same

---

## Environment Setup

### Required Environment Variable
```bash
export GITHUB_TOKEN="your_github_token_with_repo_scope"
```

### Token Requirements
- Scope: `repo` (for creating/updating comments)
- Permissions: read/write access to repository Issues

### Token Validation
```bash
# Test token validity
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

---

## CLI Parameters Reference

| Parameter | Short | Required | Description |
|-----------|-------|----------|-------------|
| `--error-report` | `-e` | Yes | Path to error-report artifact (JSON/YAML) |
| `--owner` | `-o` | Yes | GitHub repository owner |
| `--repo` | `-r` | Yes | GitHub repository name |
| `--issue` | `-i` | No | Issue number (overrides dispatch_id) |
| `--task` | `-t` | No | Task ID for .issue-context.json lookup |
| `--help` | `-h` | No | Show help message |

---

## See Also

- [SKILL.md](../.opencode/skills/common/github-issue-reporter/SKILL.md) - Full skill documentation
- [spec.md](../spec.md) - Feature specification
- [error-report-contract.md](../../043-error-reporter/contracts/error-report-contract.md) - Error report artifact format