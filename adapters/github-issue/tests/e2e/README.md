# E2E Tests for GitHub Issue Adapter

This directory contains end-to-end tests that validate the GitHub Issue Adapter against the real GitHub API.

## Prerequisites

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub Personal Access Token with `repo` scope | `ghp_xxxxxxxxxxxx` |
| `TEST_REPO` | Repository in format "owner/repo" for test operations | `myorg/test-repo` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_WEBHOOK_SECRET` | Secret for webhook signature verification tests | `test-webhook-secret` |
| `TEST_TIMEOUT` | Test timeout in milliseconds | `30000` |

## Setup

### 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with the following scopes:
   - `repo` - Full control of private repositories
   - `read:org` - Read org and team membership (if using org repos)

### 2. Create a Test Repository

Create a dedicated test repository (recommended) or use an existing one. The tests will:
- Create test issues
- Post comments
- Add/remove labels
- Close issues

**Important**: Tests will only modify issues created by the test suite itself.

### 3. Configure Environment

```bash
export GITHUB_TOKEN=ghp_your_token_here
export TEST_REPO=your-org/your-test-repo
export GITHUB_WEBHOOK_SECRET=your-webhook-secret  # optional
```

Or create a `.env` file in the `adapters/github-issue/` directory:

```bash
GITHUB_TOKEN=ghp_your_token_here
TEST_REPO=your-org/your-test-repo
GITHUB_WEBHOOK_SECRET=your-webhook-secret
```

## Running Tests

### Run All E2E Tests

```bash
cd adapters/github-issue
npm run test:e2e
```

### Run with Environment Variables

```bash
cd adapters/github-issue
GITHUB_TOKEN=ghp_xxx TEST_REPO=myorg/repo npm run test:e2e
```

### Run Specific Test

```bash
cd adapters/github-issue
npm test -- tests/e2e/github-workflow.test.js -t "should create a test issue"
```

### Run in Watch Mode

```bash
cd adapters/github-issue
npm run test:watch -- tests/e2e/
```

## Test Scenarios

### Scenario 1: Issue Creation and Dispatch
- Creates test issues via real GitHub API
- Parses issues into dispatch payloads
- Verifies webhook signature verification with real crypto
- Tests full workflow from webhook to dispatch

### Scenario 2: Comment Operations
- Posts comments via real API
- Verifies comments appear
- Tests escalation comments with options
- Verifies label updates from result posting

### Scenario 3: Label Operations
- Adds labels to issues
- Removes labels from issues
- Updates status labels via adapter methods
- Verifies label state persistence

### Scenario 4: Cleanup Operations
- Properly closes test issues
- Ensures no test artifacts remain

### Additional Scenarios
- Rate limit tracking
- Retry workflow end-to-end
- Edge cases with special characters

## Safety Measures

The E2E tests include several safety mechanisms:

1. **Conditional Execution**: Tests skip if `GITHUB_TOKEN` and `TEST_REPO` are not set
2. **Issue Tracking**: All created issues are tracked and cleaned up in `afterAll`
3. **Dedicated Labels**: Issues are created with `e2e-test` label for easy identification
4. **No Production Data**: Tests only touch test issues, never production data
5. **Auto-Cleanup**: Issues are closed after tests (even if tests fail)

## Troubleshooting

### Tests Skip Automatically

If you see:
```
⚠️  E2E tests skipped: GITHUB_TOKEN and TEST_REPO environment variables not set
```

Ensure both environment variables are exported:
```bash
echo $GITHUB_TOKEN
echo $TEST_REPO
```

### Rate Limit Errors

If you hit rate limits:
1. Check your remaining rate limit: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit`
2. Wait for rate limit reset (usually 1 hour)
3. Consider using a GitHub App instead of PAT for higher limits

### Permission Errors

If tests fail with 403 or 404 errors:
1. Verify your token has `repo` scope
2. Ensure you have write access to the test repository
3. Check that the repository exists and is not archived

## Test Structure

```
tests/e2e/
├── github-workflow.test.js    # Main E2E test file
└── README.md                   # This documentation
```

## CI/CD Integration

For CI/CD pipelines, you can:

1. Set environment variables in your CI config
2. Create ephemeral test repositories
3. Run E2E tests as part of deployment pipeline

Example GitHub Actions workflow:

```yaml
name: E2E Tests
on: [push]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run E2E tests
        env:
          GITHUB_TOKEN: ${{ secrets.E2E_GITHUB_TOKEN }}
          TEST_REPO: ${{ github.repository }}-e2e
        run: |
          cd adapters/github-issue
          npm run test:e2e
```

## Security Considerations

1. **Never commit tokens**: Always use environment variables
2. **Use dedicated test repo**: Don't run against production repositories
3. **Rotate tokens regularly**: PATs should be rotated periodically
4. **Audit access**: Review who has access to the test repository
5. **Enable branch protection**: Protect your test repository's main branch

## Additional Resources

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Webhook security](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries)
