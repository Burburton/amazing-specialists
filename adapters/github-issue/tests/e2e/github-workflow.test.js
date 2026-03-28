/**
 * End-to-End Tests for GitHub Issue Adapter
 *
 * Tests real GitHub API integration (requires GITHUB_TOKEN env var).
 * Tests webhook signature verification with real crypto.
 * Tests full workflow from webhook to dispatch.
 *
 * @module adapters/github-issue/tests/e2e/github-workflow.test
 * @requires GITHUB_TOKEN - Personal access token with repo scope
 * @requires TEST_REPO - Repository in format "owner/repo" (default: creates test repo)
 * @requires GITHUB_WEBHOOK_SECRET - Secret for webhook signature verification tests
 *
 * @example
 * # Run all E2E tests
 * GITHUB_TOKEN=ghp_xxx TEST_REPO=test-org/test-repo npm run test:e2e
 *
 * # Run with custom config
 * GITHUB_TOKEN=ghp_xxx TEST_REPO=myorg/myrepo GITHUB_WEBHOOK_SECRET=secret npm test -- tests/e2e/
 */

const { GitHubIssueAdapter } = require('../../index');
const { GitHubClient } = require('../../github-client');
const { WebhookHandler } = require('../../webhook-handler');
const crypto = require('crypto');

// ============================================================================
// Environment Configuration
// ============================================================================

/**
 * Required environment variables for E2E tests
 */
const REQUIRED_ENV_VARS = {
  GITHUB_TOKEN: 'GitHub Personal Access Token with repo scope',
  TEST_REPO: 'Test repository in format "owner/repo" (default: creates test repo)'
};

/**
 * Optional environment variables
 */
const OPTIONAL_ENV_VARS = {
  GITHUB_WEBHOOK_SECRET: 'Webhook secret for signature verification tests (default: test-secret)',
  TEST_TIMEOUT: 'Test timeout in milliseconds (default: 30000)'
};

/**
 * Check if E2E tests should run
 * @returns {boolean} True if all required env vars are present
 */
function shouldRunE2E() {
  return !!process.env.GITHUB_TOKEN && !!process.env.TEST_REPO;
}

/**
 * Get test configuration
 * @returns {Object} Test configuration
 */
function getTestConfig() {
  const [owner, repo] = (process.env.TEST_REPO || 'test/test').split('/');
  return {
    token: process.env.GITHUB_TOKEN,
    owner,
    repo,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || 'test-webhook-secret',
    timeout: parseInt(process.env.TEST_TIMEOUT || '30000', 10)
  };
}

// ============================================================================
// Test Setup Helpers
// ============================================================================

/**
 * Create a test issue with specified labels and body
 * @param {GitHubClient} client - GitHub client instance
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {Object} options - Issue options
 * @returns {Promise<Object>} Created issue
 */
async function createTestIssue(client, owner, repo, options = {}) {
  const defaultTitle = `[E2E Test] ${new Date().toISOString()}`;
  const defaultBody = `## Context

This is an automated E2E test issue created by the GitHub Issue Adapter test suite.
Created at: ${new Date().toISOString()}

## Goal

Test GitHub Issue Adapter workflow end-to-end.

## Constraints

- Auto-created test issue
- Should be cleaned up after test

## Expected Outputs

- Test dispatch payload generated correctly
- Comments posted successfully
- Labels added successfully`;

  const issueData = {
    title: options.title || defaultTitle,
    body: options.body || defaultBody,
    labels: options.labels || ['e2e-test', 'status:in-progress']
  };

  const path = `/repos/${owner}/${repo}/issues`;
  const response = await client._requestWithRetry('POST', path, issueData);
  return response;
}

/**
 * Close and lock a test issue
 * @param {GitHubClient} client - GitHub client instance
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} issueNumber - Issue number
 * @returns {Promise<void>}
 */
async function cleanupTestIssue(client, owner, repo, issueNumber) {
  try {
    // Close the issue
    const path = `/repos/${owner}/${repo}/issues/${issueNumber}`;
    await client._requestWithRetry('PATCH', path, {
      state: 'closed',
      state_reason: 'not_planned'
    });
  } catch (error) {
    console.warn(`Warning: Failed to cleanup test issue #${issueNumber}:`, error.message);
  }
}

/**
 * Generate webhook signature for testing
 * @param {string} payload - Webhook payload
 * @param {string} secret - Webhook secret
 * @returns {string} Signature header value
 */
function generateWebhookSignature(payload, secret) {
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  return `sha256=${signature}`;
}

/**
 * Create mock webhook request
 * @param {Object} issue - Issue object
 * @param {Object} repository - Repository object
 * @param {string} secret - Webhook secret
 * @param {string} action - Webhook action (default: 'opened')
 * @returns {Object} Mock request object
 */
function createMockWebhookRequest(issue, repository, secret, action = 'opened') {
  const payload = JSON.stringify({
    action,
    issue,
    repository,
    sender: { login: 'e2e-test-user', id: 123456 }
  });

  const signature = generateWebhookSignature(payload, secret);

  return {
    body: payload,
    headers: {
      'x-hub-signature-256': signature,
      'x-github-event': 'issues',
      'x-github-delivery': `e2e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  };
}

// ============================================================================
// E2E Test Suite
// ============================================================================

// Use describe.skipIf for Jest 27+ or conditional describe
const describeE2E = shouldRunE2E() ? describe : describe.skip;

describeE2E('GitHub Issue Adapter E2E Tests', () => {
  let client;
  let adapter;
  let config;
  let testIssues = [];

  beforeAll(() => {
    if (!shouldRunE2E()) {
      console.log('\n⚠️  E2E tests skipped: GITHUB_TOKEN and TEST_REPO environment variables not set');
      console.log('   To run E2E tests, set the following environment variables:');
      console.log('   - GITHUB_TOKEN: GitHub Personal Access Token with repo scope');
      console.log('   - TEST_REPO: Repository in format "owner/repo"');
      console.log('   - GITHUB_WEBHOOK_SECRET: (optional) Webhook secret for signature tests');
      console.log('   Example: GITHUB_TOKEN=ghp_xxx TEST_REPO=myorg/myrepo npm test\n');
      return;
    }

    const testConfig = getTestConfig();

    // Initialize GitHub Client with real token
    client = new GitHubClient({
      token: testConfig.token,
      userAgent: 'OpenCode-E2E-Test/1.0.0'
    });

    // Initialize Adapter with test configuration
    config = {
      adapter_id: 'github-issue',
      adapter_type: 'orchestrator',
      priority: 'later',
      version: '1.0.0',
      github_config: {
        api: { base_url: 'https://api.github.com' },
        webhook: { secret_env_var: 'GITHUB_WEBHOOK_SECRET' },
        retry_config: { max_retry: 1, backoff_seconds: 300 },
        default_values: { role: 'developer', risk_level: 'medium' },
        label_mappings: {
          milestone_prefix: 'milestone:',
          role_prefix: 'role:',
          command_prefix: 'command:',
          task_prefix: 'task:',
          risk_prefix: 'risk:',
          escalation_prefix: 'escalation:',
          status_prefix: 'status:'
        },
        events: {
          process: ['issues.opened', 'issues.edited', 'issues.labeled'],
          ignore: ['issues.closed', 'issues.deleted']
        }
      }
    };

    adapter = new GitHubIssueAdapter(config);
    // Replace the adapter's client with our configured client
    adapter.githubClient = client;
  });

  afterAll(async () => {
    if (!shouldRunE2E()) return;

    // Cleanup all test issues created during tests
    console.log(`\n🧹 Cleaning up ${testIssues.length} test issue(s)...`);
    const testConfig = getTestConfig();

    for (const issueNumber of testIssues) {
      await cleanupTestIssue(client, testConfig.owner, testConfig.repo, issueNumber);
    }

    console.log('✅ E2E test cleanup complete\n');
  });

  beforeEach(() => {
    if (!shouldRunE2E()) return;
    jest.setTimeout(getTestConfig().timeout);
  });

  // ============================================================================
  // E2E TEST SCENARIO 1: Create test issue → Parse → Verify dispatch payload
  // ============================================================================
  describe('E2E Scenario 1: Issue Creation and Dispatch', () => {
    test('should create a test issue via real GitHub API', async () => {
      const testConfig = getTestConfig();

      // Create test issue with specific labels
      const issue = await createTestIssue(client, testConfig.owner, testConfig.repo, {
        title: '[E2E] Issue Creation Test',
        labels: [
          'e2e-test',
          'role:developer',
          'milestone:M001',
          'task:T999',
          'risk:medium'
        ]
      });

      // Track for cleanup
      testIssues.push(issue.number);

      // Verify issue was created
      expect(issue).toBeDefined();
      expect(issue.number).toBeGreaterThan(0);
      expect(issue.title).toBe('[E2E] Issue Creation Test');
      expect(issue.state).toBe('open');

      // Verify labels were applied
      const labelNames = issue.labels.map(l => l.name);
      expect(labelNames).toContain('e2e-test');
      expect(labelNames).toContain('role:developer');
      expect(labelNames).toContain('milestone:M001');

      console.log(`✅ Created test issue #${issue.number}`);
    });

    test('should parse real issue into dispatch payload', async () => {
      const testConfig = getTestConfig();

      // Create test issue
      const issue = await createTestIssue(client, testConfig.owner, testConfig.repo, {
        title: '[E2E] Parse Test',
        body: `## Context

Testing parse functionality with real API.

## Goal

Verify issue parsing generates correct dispatch payload.

## Constraints

- Must parse correctly
- Must handle real data

## Inputs

- design-note: specs/001/design.md - Test design

## Expected Outputs

- implementation-summary: docs/impl.md - Implementation docs`,
        labels: [
          'e2e-test',
          'role:tester',
          'milestone:M002',
          'task:T888',
          'command:unit-test-design',
          'risk:low'
        ]
      });

      testIssues.push(issue.number);

      // Parse issue using adapter
      const dispatch = adapter.normalizeInput(issue);

      // Verify dispatch payload structure
      expect(dispatch).toBeDefined();
      expect(dispatch.dispatch_id).toMatch(/gh-issue-.*-\d+/);
      expect(dispatch.project_id).toBe(`${testConfig.owner}/${testConfig.repo}`);
      expect(dispatch.milestone_id).toBe('M002');
      expect(dispatch.task_id).toBe('T888');
      expect(dispatch.role).toBe('tester');
      expect(dispatch.command).toBe('unit-test-design');
      expect(dispatch.risk_level).toBe('low');
      expect(dispatch.title).toBe('[E2E] Parse Test');
      expect(dispatch.goal).toContain('dispatch payload');
      expect(dispatch.constraints).toHaveLength(2);
      expect(dispatch.inputs).toHaveLength(1);
      expect(dispatch.expected_outputs).toHaveLength(1);

      // Validate dispatch
      const validation = adapter.validateDispatch(dispatch);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      console.log(`✅ Parsed issue #${issue.number} into valid dispatch`);
    });

    test('should handle webhook signature verification with real crypto', async () => {
      const testConfig = getTestConfig();
      const webhookHandler = new WebhookHandler(config);

      // Create a real issue first
      const issue = await createTestIssue(client, testConfig.owner, testConfig.repo, {
        title: '[E2E] Webhook Test'
      });

      testIssues.push(issue.number);

      // Create mock repository object
      const repository = {
        id: 1296269,
        name: testConfig.repo,
        full_name: testConfig.TEST_REPO,
        owner: { login: testConfig.owner, type: 'Organization' }
      };

      // Create mock webhook request with valid signature
      const request = createMockWebhookRequest(issue, repository, testConfig.webhookSecret);

      // Process webhook
      const result = await webhookHandler.handleRequest(request, testConfig.webhookSecret);

      // Verify webhook was accepted
      expect(result.status).toBe(200);
      expect(result.verification.valid).toBe(true);
      expect(result.data.event).toBe('issues');
      expect(result.data.action).toBe('opened');
      expect(result.data.payload.issue.number).toBe(issue.number);

      console.log(`✅ Webhook verification passed for issue #${issue.number}`);
    });

    test('should reject webhook with invalid signature', async () => {
      const testConfig = getTestConfig();
      const webhookHandler = new WebhookHandler(config);

      // Create mock issue data
      const issue = {
        id: 44450001,
        number: 12345,
        title: 'Test Issue',
        body: 'Test body',
        state: 'open',
        labels: [],
        user: { login: 'test-user' },
        created_at: new Date().toISOString()
      };

      const repository = {
        id: 1296269,
        name: testConfig.repo,
        full_name: testConfig.TEST_REPO,
        owner: { login: testConfig.owner, type: 'Organization' }
      };

      // Create request with wrong secret
      const request = createMockWebhookRequest(issue, repository, 'wrong-secret');

      // Process with correct secret (should fail)
      const result = await webhookHandler.handleRequest(request, testConfig.webhookSecret);

      // Verify webhook was rejected
      expect(result.status).toBe(401);
      expect(result.verification.valid).toBe(false);
      expect(result.verification.error).toContain('mismatch');

      console.log('✅ Invalid signature correctly rejected');
    });

    test('should complete full workflow from webhook to dispatch', async () => {
      const testConfig = getTestConfig();
      const webhookHandler = new WebhookHandler(config);

      // Create test issue with comprehensive labels
      const issue = await createTestIssue(client, testConfig.owner, testConfig.repo, {
        title: '[E2E] Full Workflow Test',
        body: `## Context

Complete workflow test from webhook to dispatch.

## Goal

Verify entire workflow integration.

## Constraints

- Full integration test
- Real API calls

## Expected Outputs

- test-report: tests/e2e/report.md - E2E test results`,
        labels: [
          'e2e-test',
          'role:architect',
          'milestone:M003',
          'task:T777',
          'command:requirement-to-design',
          'risk:high'
        ]
      });

      testIssues.push(issue.number);

      // Step 1: Simulate webhook delivery
      const repository = {
        id: 1296269,
        name: testConfig.repo,
        full_name: testConfig.TEST_REPO,
        owner: { login: testConfig.owner, type: 'Organization' }
      };

      const request = createMockWebhookRequest(issue, repository, testConfig.webhookSecret);
      const webhookResult = await webhookHandler.handleRequest(request, testConfig.webhookSecret);

      expect(webhookResult.status).toBe(200);
      expect(webhookResult.verification.valid).toBe(true);

      // Step 2: Parse to dispatch payload
      const dispatch = adapter.normalizeInput(webhookResult.data.payload.issue);

      expect(dispatch.role).toBe('architect');
      expect(dispatch.command).toBe('requirement-to-design');
      expect(dispatch.milestone_id).toBe('M003');
      expect(dispatch.task_id).toBe('T777');
      expect(dispatch.risk_level).toBe('high');

      // Step 3: Validate dispatch
      const validation = adapter.validateDispatch(dispatch);
      expect(validation.isValid).toBe(true);

      // Step 4: Route to execution
      const routingResult = adapter.routeToExecution(dispatch);
      expect(routingResult.routed).toBe(true);
      expect(routingResult.role).toBe('architect');
      expect(routingResult.command).toBe('requirement-to-design');

      console.log(`✅ Full workflow completed for issue #${issue.number}`);
    });
  });

  // ============================================================================
  // E2E TEST SCENARIO 2: Post comment via real API → Verify comment appears
  // ============================================================================
  describe('E2E Scenario 2: Comment Operations', () => {
    test('should post comment to real issue and verify it appears', async () => {
      const testConfig = getTestConfig();

      // Create test issue
      const issue = await createTestIssue(client, testConfig.owner, testConfig.repo, {
        title: '[E2E] Comment Test'
      });

      testIssues.push(issue.number);

      // Post comment using adapter
      const commentBody = `## 🧪 E2E Test Comment

This comment was posted by the E2E test suite at ${new Date().toISOString()}.

**Test:** Comment Operations
**Status:** ✅ Posted successfully`;

      const comment = await adapter.postResult({
        status: 'SUCCESS',
        role: 'tester',
        command: 'unit-test-design',
        summary: 'E2E comment test completed',
        artifacts: [],
        recommendation: 'Test passed'
      }, testConfig.owner, testConfig.repo, issue.number);

      // Verify comment was created
      expect(comment).toBeDefined();
      expect(comment.id).toBeGreaterThan(0);

      // Fetch issue comments to verify
      const commentsPath = `/repos/${testConfig.owner}/${testConfig.repo}/issues/${issue.number}/comments`;
      const comments = await client._requestWithRetry('GET', commentsPath);

      expect(comments).toHaveLength(1);
      expect(comments[0].body).toContain('E2E Test Comment');
      expect(comments[0].user.type).toBe('Bot');

      console.log(`✅ Comment posted and verified on issue #${issue.number}`);
    });

    test('should post escalation comment with options', async () => {
      const testConfig = getTestConfig();

      // Create test issue
      const issue = await createTestIssue(client, testConfig.owner, testConfig.repo, {
        title: '[E2E] Escalation Test',
        labels: ['e2e-test']
      });

      testIssues.push(issue.number);

      // Generate escalation
      const escalation = adapter.generateEscalation({
        dispatch_id: `gh-issue-${testConfig.owner}-${testConfig.repo}-${issue.number}`,
        project_id: `${testConfig.owner}/${testConfig.repo}`,
        summary: 'E2E escalation test',
        blocking_points: ['Test blocking point 1', 'Test blocking point 2'],
        options: [
          { description: 'Option A', pros: ['Fast'], cons: ['Less secure'] },
          { description: 'Option B', pros: ['Secure'], cons: ['Slower'] }
        ],
        requires_user_decision: true
      });

      // Post escalation
      await adapter.postEscalation(escalation, testConfig.owner, testConfig.repo, issue.number);

      // Verify label was added
      const issueData = await client.getIssue(testConfig.owner, testConfig.repo, issue.number);
      const labelNames = issueData.labels.map(l => l.name);
      expect(labelNames).toContain('escalation:needs-decision');

      // Verify comment was posted
      const commentsPath = `/repos/${testConfig.owner}/${testConfig.repo}/issues/${issue.number}/comments`;
      const comments = await client._requestWithRetry('GET', commentsPath);

      expect(comments.length).toBeGreaterThan(0);
      expect(comments[0].body).toContain('⚠️ Action Required');
      expect(comments[0].body).toContain('Option A');
      expect(comments[0].body).toContain('Option B');

      console.log(`✅ Escalation posted and verified on issue #${issue.number}`);
    });
  });

  // ============================================================================
  // E2E TEST SCENARIO 3: Add label via real API → Verify label added
  // ============================================================================
  describe('E2E Scenario 3: Label Operations', () => {
    test('should add labels to real issue and verify', async () => {
      const testConfig = getTestConfig();

      // Create test issue with minimal labels
      const issue = await createTestIssue(client, testConfig.owner, testConfig.repo, {
        title: '[E2E] Label Test',
        labels: ['e2e-test'] // Start with just one label
      });

      testIssues.push(issue.number);

      // Add labels using adapter's client
      const newLabels = ['status:completed', 'role:developer'];
      await client.addLabel(testConfig.owner, testConfig.repo, issue.number, newLabels);

      // Verify labels were added
      const issueData = await client.getIssue(testConfig.owner, testConfig.repo, issue.number);
      const labelNames = issueData.labels.map(l => l.name);

      expect(labelNames).toContain('e2e-test');
      expect(labelNames).toContain('status:completed');
      expect(labelNames).toContain('role:developer');

      console.log(`✅ Labels added and verified on issue #${issue.number}`);
    });

    test('should remove labels from real issue', async () => {
      const testConfig = getTestConfig();

      // Create test issue with multiple labels
      const issue = await createTestIssue(client, testConfig.owner, testConfig.repo, {
        title: '[E2E] Label Removal Test',
        labels: ['e2e-test', 'temp-label', 'status:in-progress']
      });

      testIssues.push(issue.number);

      // Remove a label
      await client.removeLabel(testConfig.owner, testConfig.repo, issue.number, 'temp-label');

      // Verify label was removed
      const issueData = await client.getIssue(testConfig.owner, testConfig.repo, issue.number);
      const labelNames = issueData.labels.map(l => l.name);

      expect(labelNames).toContain('e2e-test');
      expect(labelNames).not.toContain('temp-label');
      expect(labelNames).toContain('status:in-progress');

      console.log(`✅ Label removal verified on issue #${issue.number}`);
    });

    test('should update labels via adapter postResult', async () => {
      const testConfig = getTestConfig();

      // Create test issue
      const issue = await createTestIssue(client, testConfig.owner, testConfig.repo, {
        title: '[E2E] Status Label Test',
        labels: ['e2e-test', 'status:in-progress']
      });

      testIssues.push(issue.number);

      // Post success result (should add status:completed)
      await adapter.postResult({
        status: 'SUCCESS',
        role: 'developer',
        command: 'feature-implementation',
        summary: 'Task completed',
        artifacts: [],
        recommendation: 'Approved'
      }, testConfig.owner, testConfig.repo, issue.number);

      // Verify status label was updated
      const issueData = await client.getIssue(testConfig.owner, testConfig.repo, issue.number);
      const labelNames = issueData.labels.map(l => l.name);

      expect(labelNames).toContain('status:completed');

      console.log(`✅ Status label update verified on issue #${issue.number}`);
    });
  });

  // ============================================================================
  // E2E TEST SCENARIO 4: Cleanup - Close/delete test issue
  // ============================================================================
  describe('E2E Scenario 4: Cleanup Operations', () => {
    test('should properly close test issue', async () => {
      const testConfig = getTestConfig();

      // Create test issue specifically for cleanup test
      const issue = await createTestIssue(client, testConfig.owner, testConfig.repo, {
        title: '[E2E] Cleanup Test'
      });

      const issueNumber = issue.number;

      // Close the issue
      const path = `/repos/${testConfig.owner}/${testConfig.repo}/issues/${issueNumber}`;
      const closed = await client._requestWithRetry('PATCH', path, {
        state: 'closed',
        state_reason: 'not_planned'
      });

      expect(closed.state).toBe('closed');
      expect(closed.state_reason).toBe('not_planned');

      // Re-fetch to verify
      const issueData = await client.getIssue(testConfig.owner, testConfig.repo, issueNumber);
      expect(issueData.state).toBe('closed');

      // Add to cleanup list (already closed but good for tracking)
      testIssues.push(issueNumber);

      console.log(`✅ Issue #${issueNumber} closed successfully`);
    });
  });

  // ============================================================================
  // Additional E2E Tests
  // ============================================================================
  describe('Additional E2E Scenarios', () => {
    test('should handle rate limit headers', async () => {
      const testConfig = getTestConfig();

      // Make a request to trigger rate limit tracking
      const rateLimit = await client.checkRateLimit();

      expect(rateLimit).toBeDefined();
      expect(rateLimit.resources).toBeDefined();
      expect(rateLimit.resources.core).toBeDefined();
      expect(rateLimit.resources.core.limit).toBeGreaterThan(0);
      expect(rateLimit.resources.core.remaining).toBeGreaterThanOrEqual(0);

      // Check cached rate limit info
      const cachedInfo = client.getRateLimitInfo();
      expect(cachedInfo.limit).toBeGreaterThan(0);
      expect(cachedInfo.remaining).toBeGreaterThanOrEqual(0);

      console.log(`✅ Rate limit: ${cachedInfo.remaining}/${cachedInfo.limit} remaining`);
    });

    test('should handle retry workflow end-to-end', async () => {
      const testConfig = getTestConfig();

      // Create test issue
      const issue = await createTestIssue(client, testConfig.owner, testConfig.repo, {
        title: '[E2E] Retry Workflow Test'
      });

      testIssues.push(issue.number);

      // Simulate retry scenario
      const retryContext = {
        retry_count: 0,
        previous_failure_reason: 'Network timeout',
        risk_level: 'low'
      };

      const decision = adapter.handleRetry(retryContext);
      expect(decision.decision).toBe('retry');

      // Post retry comment
      await adapter.postRetryComment({
        retry_count: 1,
        previous_failure_reason: 'Network timeout',
        required_fixes: ['Increase timeout', 'Add retry logic'],
        max_retry: 2
      }, testConfig.owner, testConfig.repo, issue.number);

      // Verify comment
      const commentsPath = `/repos/${testConfig.owner}/${testConfig.repo}/issues/${issue.number}/comments`;
      const comments = await client._requestWithRetry('GET', commentsPath);

      expect(comments.length).toBeGreaterThan(0);
      expect(comments[0].body).toContain('Retry Attempt #1');

      console.log(`✅ Retry workflow verified on issue #${issue.number}`);
    });

    test('should handle edge cases in real API', async () => {
      const testConfig = getTestConfig();

      // Create issue with special characters
      const issue = await createTestIssue(client, testConfig.owner, testConfig.repo, {
        title: '[E2E] Special Chars: <>&"\' Test',
        body: `## Context

Test with special characters:
- Code: \`console.log("test")\`
- HTML: <div>test</div>
- Unicode: 🧪 📝 ✅

## Goal

Verify special characters are handled correctly.`
      });

      testIssues.push(issue.number);

      // Fetch and verify
      const issueData = await client.getIssue(testConfig.owner, testConfig.repo, issue.number);
      expect(issueData.title).toBe('[E2E] Special Chars: <>&"\' Test');
      expect(issueData.body).toContain('🧪');

      // Post comment with special characters
      await adapter.postResult({
        status: 'SUCCESS',
        role: 'tester',
        command: 'edge-case-matrix',
        summary: 'Test with special chars: <>&"\' and unicode: 🧪',
        artifacts: [],
        recommendation: 'All edge cases handled'
      }, testConfig.owner, testConfig.repo, issue.number);

      console.log(`✅ Edge case handling verified on issue #${issue.number}`);
    });
  });
});

// ============================================================================
// Standalone Documentation Test
// ============================================================================

describe('E2E Test Documentation', () => {
  test('documents required environment variables', () => {
    // This test serves as documentation and validation
    const docs = {
      required: REQUIRED_ENV_VARS,
      optional: OPTIONAL_ENV_VARS
    };

    expect(docs.required.GITHUB_TOKEN).toBeDefined();
    expect(docs.required.TEST_REPO).toBeDefined();
    expect(docs.optional.GITHUB_WEBHOOK_SECRET).toBeDefined();
    expect(docs.optional.TEST_TIMEOUT).toBeDefined();

    console.log('\n📋 E2E Test Environment Variables:');
    console.log('Required:');
    Object.entries(docs.required).forEach(([key, desc]) => {
      console.log(`  ${key}: ${desc}`);
    });
    console.log('Optional:');
    Object.entries(docs.optional).forEach(([key, desc]) => {
      console.log(`  ${key}: ${desc}`);
    });
    console.log('');
  });

  test('validates test configuration helper', () => {
    // Ensure the configuration logic is sound
    const originalToken = process.env.GITHUB_TOKEN;
    const originalRepo = process.env.TEST_REPO;

    // Test without env vars
    delete process.env.GITHUB_TOKEN;
    delete process.env.TEST_REPO;
    expect(shouldRunE2E()).toBe(false);

    // Test with only token
    process.env.GITHUB_TOKEN = 'test-token';
    expect(shouldRunE2E()).toBe(false);

    // Test with both
    process.env.TEST_REPO = 'test/repo';
    expect(shouldRunE2E()).toBe(true);

    // Restore
    process.env.GITHUB_TOKEN = originalToken;
    process.env.TEST_REPO = originalRepo;
  });
});
