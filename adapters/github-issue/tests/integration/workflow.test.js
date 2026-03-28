/**
 * Integration Tests for GitHub Issue Adapter
 * 
 * Tests complete workflow scenarios spanning multiple components:
 * 1. Issue→Dispatch workflow (parse issue, generate dispatch payload)
 * 2. Execution→Result workflow (post comment with result)
 * 3. Escalation workflow (generate escalation comment)
 * 4. Retry workflow (retry decision based on error)
 * 
 * Uses mock GitHub API responses (no real API calls).
 * Focuses on component integration, not unit-level logic.
 * 
 * @module adapters/github-issue/tests/integration/workflow.test
 * @reference specs/021-github-issue-adapter/spec.md - AC-001 to AC-010
 * @reference adapters/github-issue/index.js - Main adapter
 */

const { GitHubIssueAdapter } = require('../../index');
const { IssueParser } = require('../../issue-parser');
const { LabelParser } = require('../../label-parser');
const { BodyParser } = require('../../body-parser');
const { WebhookHandler } = require('../../webhook-handler');
const { CommentTemplates } = require('../../comment-templates');
const { RetryHandler } = require('../../retry-handler');
const { GitHubClient } = require('../../github-client');

// Mock GitHub API responses for integration testing
const MOCK_GITHUB_RESPONSES = {
  // Mock comment creation response
  commentCreated: {
    id: 123456789,
    node_id: 'MDEyOklzc3VlQ29tbWVudDEyMzQ1Njc4OQ==',
    html_url: 'https://github.com/test-org/test-repo/issues/123#issuecomment-123456789',
    body: 'Test comment body',
    user: {
      login: 'opencode-bot',
      id: 123456,
      type: 'Bot'
    },
    created_at: '2026-03-28T14:30:00Z',
    updated_at: '2026-03-28T14:30:00Z'
  },

  // Mock labels added response
  labelsAdded: [
    { id: 1, name: 'status:completed', color: '0e8a16' },
    { id: 2, name: 'role:developer', color: '5319e7' }
  ],

  // Mock issue retrieved response
  issueRetrieved: {
    id: 44450001,
    number: 123,
    title: 'Test Issue',
    body: '## Goal\nTest goal',
    state: 'open',
    labels: [
      { name: 'role:developer' },
      { name: 'milestone:M001' }
    ],
    user: { login: 'test-user' },
    created_at: '2026-03-28T14:30:00Z',
    updated_at: '2026-03-28T14:30:00Z'
  },

  // Mock rate limit response
  rateLimit: {
    resources: {
      core: {
        limit: 5000,
        remaining: 4500,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 500
      }
    }
  }
};

// Mock GitHub Webhook payload
const MOCK_WEBHOOK_PAYLOAD = {
  action: 'opened',
  issue: {
    id: 44450001,
    number: 123,
    title: 'Design and implement payment gateway integration',
    body: `## Context

This task is part of the e-commerce milestone (M001). We need to integrate a payment gateway to process customer transactions securely.

## Goal

Design and implement a secure payment gateway integration supporting Stripe and PayPal with proper error handling and transaction logging.

## Constraints

- Must comply with PCI DSS Level 1 requirements
- Maximum transaction timeout: 30 seconds
- Support USD, EUR, and GBP currencies

## Expected Outputs

- payment-service: implementation-summary - Payment service implementation
- unit-tests: verification-report - Unit test coverage report`,
    state: 'open',
    labels: [
      { name: 'role:developer', color: '0e8a16' },
      { name: 'milestone:M001', color: '5319e7' },
      { name: 'task:T015', color: 'fbca04' },
      { name: 'command:feature-implementation', color: '1d76db' },
      { name: 'risk:high', color: 'd93f0b' }
    ],
    user: { login: 'product-manager' },
    created_at: '2026-03-28T14:30:00Z',
    html_url: 'https://github.com/myorg/myrepo/issues/123'
  },
  repository: {
    id: 1296269,
    name: 'myrepo',
    full_name: 'myorg/myrepo',
    owner: { login: 'myorg', type: 'Organization' }
  },
  sender: { login: 'product-manager' }
};

// Mock execution results for testing
const MOCK_EXECUTION_RESULTS = {
  success: {
    status: 'SUCCESS',
    role: 'developer',
    command: 'feature-implementation',
    summary: 'Successfully implemented payment gateway integration with Stripe and PayPal support. All tests passing with 95% coverage.',
    artifacts: [
      { title: 'payment-service', artifact_type: 'implementation-summary', path: 'docs/implementation/payment-gateway.md' },
      { title: 'unit-tests', artifact_type: 'verification-report', path: 'tests/reports/unit-coverage.html' },
      { title: 'integration-guide', artifact_type: 'docs-sync-report', path: 'docs/guides/payment-integration.md' }
    ],
    recommendation: 'Task completed successfully. Review artifacts and merge to main branch.'
  },

  failedEscalate: {
    status: 'FAILED_ESCALATE',
    role: 'developer',
    command: 'feature-implementation',
    summary: 'Unable to complete implementation due to ambiguous requirements around PCI compliance scope.',
    blocking_points: [
      'PCI DSS compliance scope unclear - full SAQ or just SAQ A?',
      'Payment processor selection - Stripe Connect vs Stripe Standard unclear',
      'Tokenization approach not specified in requirements'
    ],
    attempted_actions: [
      'Reviewed existing payment processing architecture',
      'Analyzed Stripe and PayPal documentation',
      'Attempted implementation with both approaches'
    ],
    options: [
      { description: 'Option A: Stripe Standard with basic PCI compliance', pros: ['Simpler implementation', 'Lower compliance burden'], cons: ['Less flexibility', 'Higher fees'] },
      { description: 'Option B: Stripe Connect with full PCI compliance', pros: ['Full control', 'Lower fees'], cons: ['Complex implementation', 'Higher compliance burden'] }
    ]
  },

  failedRetryable: {
    status: 'FAILED_RETRYABLE',
    role: 'developer',
    command: 'feature-implementation',
    summary: 'Implementation failed due to transient network error when fetching Stripe API documentation.',
    issues_found: [
      { severity: 'high', recommendation: 'Retry with network timeout increased to 30 seconds' },
      { severity: 'medium', description: 'Consider caching API documentation locally' }
    ],
    retry_context: {
      retry_count: 0,
      previous_failure_reason: 'Network timeout while fetching Stripe API docs'
    }
  }
};

describe('GitHub Issue Adapter Integration Tests', () => {
  let adapter;
  let mockGitHubClient;
  let config;

  beforeEach(() => {
    // Adapter configuration
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
        }
      }
    };

    adapter = new GitHubIssueAdapter(config);

    // Mock GitHub Client methods to avoid real API calls
    mockGitHubClient = {
      postComment: jest.fn().mockResolvedValue(MOCK_GITHUB_RESPONSES.commentCreated),
      addLabel: jest.fn().mockResolvedValue(MOCK_GITHUB_RESPONSES.labelsAdded),
      removeLabel: jest.fn().mockResolvedValue({}),
      getIssue: jest.fn().mockResolvedValue(MOCK_GITHUB_RESPONSES.issueRetrieved),
      checkRateLimit: jest.fn().mockResolvedValue(MOCK_GITHUB_RESPONSES.rateLimit)
    };

    // Replace the githubClient with our mock
    adapter.githubClient = mockGitHubClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // WORKFLOW 1: Issue → Dispatch Workflow (AC-001, AC-002, AC-003)
  // ============================================================================
  describe('Workflow 1: Issue → Dispatch', () => {
    test('should complete full workflow from webhook to dispatch payload', async () => {
      // Given: A webhook payload representing a new GitHub Issue
      const webhookPayload = JSON.stringify(MOCK_WEBHOOK_PAYLOAD);
      const webhookSecret = 'test-webhook-secret';

      // When: Webhook is received and processed
      // Step 1: Webhook handler validates the request
      const crypto = require('crypto');
      const signature = 'sha256=' + crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookPayload)
        .digest('hex');

      const request = {
        body: webhookPayload,
        headers: {
          'x-hub-signature-256': signature,
          'x-github-event': 'issues',
          'x-github-delivery': '72d3162e-cc78-11e3-81ab-4c9367dc0958'
        }
      };

      const webhookResult = await adapter.handleWebhook(request, webhookSecret);

      // Then: Webhook should be validated successfully
      expect(webhookResult.status).toBe(200);
      expect(webhookResult.verification.valid).toBe(true);
      expect(webhookResult.data).toBeDefined();
      expect(webhookResult.data.event).toBe('issues');
      expect(webhookResult.data.action).toBe('opened');

      // Step 2: Extract issue from webhook payload
      const issue = webhookResult.data.payload.issue;
      expect(issue.number).toBe(123);
      expect(issue.labels).toHaveLength(5);

      // Step 3: Issue parser converts to dispatch payload (AC-001)
      const dispatch = adapter.normalizeInput(issue);

      // Then: Dispatch payload should be correctly generated
      expect(dispatch.dispatch_id).toBeDefined();
      expect(dispatch.dispatch_id).toMatch(/gh-issue-.*-123/);
      expect(dispatch.project_id).toBeDefined();
      expect(dispatch.milestone_id).toBe('M001');
      expect(dispatch.task_id).toBe('T015');
      expect(dispatch.role).toBe('developer');
      expect(dispatch.command).toBe('feature-implementation');
      expect(dispatch.risk_level).toBe('high');

      // Step 4: Validate dispatch payload (AC-001)
      const validation = adapter.validateDispatch(dispatch);

      // Then: Dispatch should pass validation
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Step 5: Route to execution
      const routingResult = adapter.routeToExecution(dispatch);

      // Then: Should be routed successfully
      expect(routingResult.routed).toBe(true);
      expect(routingResult.dispatch_id).toBeDefined();
      expect(routingResult.dispatch_id).toMatch(/gh-issue-.*-123/);
      expect(routingResult.role).toBe('developer');
      expect(routingResult.command).toBe('feature-implementation');
    });

    test('should parse labels correctly (AC-002)', () => {
      // Given: An issue with various labels
      const issue = MOCK_WEBHOOK_PAYLOAD.issue;

      // When: Labels are parsed through IssueParser
      const dispatch = adapter.normalizeInput(issue);

      // Then: All labels should be correctly extracted (AC-002)
      expect(dispatch.milestone_id).toBe('M001');
      expect(dispatch.task_id).toBe('T015');
      expect(dispatch.role).toBe('developer');
      expect(dispatch.command).toBe('feature-implementation');
      expect(dispatch.risk_level).toBe('high');
    });

    test('should parse body sections correctly (AC-003)', () => {
      // Given: An issue with body sections
      const issue = MOCK_WEBHOOK_PAYLOAD.issue;

      // When: Body is parsed
      const dispatch = adapter.normalizeInput(issue);

      // Then: All sections should be correctly extracted (AC-003)
      expect(dispatch.goal).toContain('Design and implement a secure payment gateway');
      expect(dispatch.context.task_scope).toContain('e-commerce milestone');
      expect(dispatch.constraints.length).toBeGreaterThan(0);
      expect(dispatch.constraints).toContain('Must comply with PCI DSS Level 1 requirements');
      expect(dispatch.expected_outputs.length).toBeGreaterThan(0);
    });

    test('should handle webhook security verification (AC-004)', async () => {
      // Given: Valid webhook request
      const webhookPayload = JSON.stringify(MOCK_WEBHOOK_PAYLOAD);
      const webhookSecret = 'test-webhook-secret';
      const crypto = require('crypto');
      const signature = 'sha256=' + crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookPayload)
        .digest('hex');

      const validRequest = {
        body: webhookPayload,
        headers: {
          'x-hub-signature-256': signature,
          'x-github-event': 'issues'
        }
      };

      // When: Webhook is handled
      const result = await adapter.handleWebhook(validRequest, webhookSecret);

      // Then: Should be accepted (AC-004)
      expect(result.status).toBe(200);
      expect(result.verification.valid).toBe(true);

      // Given: Invalid webhook request (wrong signature)
      const invalidRequest = {
        body: webhookPayload,
        headers: {
          'x-hub-signature-256': 'sha256=invalid-signature',
          'x-github-event': 'issues'
        }
      };

      // When: Invalid webhook is handled
      const invalidResult = await adapter.handleWebhook(invalidRequest, webhookSecret);

      // Then: Should be rejected (AC-004)
      expect(invalidResult.status).toBe(401);
      expect(invalidResult.verification.valid).toBe(false);
    });

    test('should handle webhook parsing errors', async () => {
      // Given: Invalid JSON in webhook body
      const malformedRequest = {
        body: 'not valid json',
        headers: {
          'x-hub-signature-256': 'sha256=abc123',
          'x-github-event': 'issues'
        }
      };

      // When: Handled
      const result = await adapter.handleWebhook(malformedRequest, 'secret');

      // Then: Should return 401 error
      expect(result.status).toBe(401);
      expect(result.verification.valid).toBe(false);
    });
  });

  // ============================================================================
  // End-to-End Integration Scenarios
  // ============================================================================
  describe('End-to-End Integration Scenarios', () => {
    test('complete success flow: Issue → Execution → Result', async () => {
      // Given: A new GitHub Issue via webhook
      const webhookPayload = JSON.stringify(MOCK_WEBHOOK_PAYLOAD);
      const webhookSecret = 'test-secret';
      const crypto = require('crypto');
      const signature = 'sha256=' + crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookPayload)
        .digest('hex');

      // When: Full workflow is executed
      // 1. Receive webhook
      const webhookResult = await adapter.handleWebhook({
        body: webhookPayload,
        headers: {
          'x-hub-signature-256': signature,
          'x-github-event': 'issues'
        }
      }, webhookSecret);

      // 2. Parse issue to dispatch
      const issue = webhookResult.data.payload.issue;
      const dispatch = adapter.normalizeInput(issue);

      // 3. Validate dispatch
      const validation = adapter.validateDispatch(dispatch);
      expect(validation.isValid).toBe(true);

      // 4. Simulate execution
      const executionResult = {
        status: 'SUCCESS',
        role: dispatch.role,
        command: dispatch.command,
        summary: 'Implementation completed successfully',
        artifacts: [
          { title: 'Implementation', artifact_type: 'implementation-summary', path: 'docs/impl.md' }
        ],
        recommendation: 'Ready for review'
      };

      // 5. Post result
      await adapter.postResult(executionResult, 'myorg', 'myrepo', issue.number);

      // Then: Result should be posted with correct content
      expect(mockGitHubClient.postComment).toHaveBeenCalled();
      const commentBody = mockGitHubClient.postComment.mock.calls[0][3];
      expect(commentBody).toContain('SUCCESS');
      expect(commentBody).toContain('Implementation completed successfully');
    });

    test('complete escalation flow: Issue → Execution → Escalation', async () => {
      // Given: A new GitHub Issue
      const issue = MOCK_WEBHOOK_PAYLOAD.issue;
      const dispatch = adapter.normalizeInput(issue);

      // When: Execution requires escalation
      const executionResult = {
        status: 'FAILED_ESCALATE',
        role: dispatch.role,
        command: dispatch.command,
        summary: 'Cannot proceed without user decision',
        blocking_points: ['Ambiguous requirement'],
        options: ['Option 1', 'Option 2']
      };

      // Generate and post escalation
      const escalation = adapter.generateEscalation({
        dispatch_id: dispatch.dispatch_id,
        project_id: dispatch.project_id,
        summary: executionResult.summary,
        blocking_points: executionResult.blocking_points,
        options: executionResult.options,
        requires_user_decision: true
      });

      await adapter.postEscalation(escalation, 'myorg', 'myrepo', issue.number);

      // Then: Escalation should be posted
      expect(mockGitHubClient.postComment).toHaveBeenCalled();
      expect(mockGitHubClient.addLabel).toHaveBeenCalledWith(
        'myorg', 'myrepo', issue.number, 'escalation:needs-decision'
      );
    });

    test('complete retry flow: Issue → Execution → Retry → Success', async () => {
      // Given: First execution attempt fails with retryable error
      const issue = MOCK_WEBHOOK_PAYLOAD.issue;
      const dispatch = adapter.normalizeInput(issue);

      // First attempt fails
      const firstResult = {
        status: 'FAILED_RETRYABLE',
        role: dispatch.role,
        command: dispatch.command,
        summary: 'Network error during execution',
        retry_context: { retry_count: 0 }
      };

      // Check retry decision
      const retryDecision = adapter.handleRetry({
        retry_count: firstResult.retry_context.retry_count,
        risk_level: 'low'
      });

      expect(retryDecision.decision).toBe('retry');

      // Post retry comment
      await adapter.postRetryComment({
        retry_count: 1,
        previous_failure_reason: 'Network error',
        required_fixes: ['Retry with timeout'],
        max_retry: 1
      }, 'myorg', 'myrepo', issue.number);

      // Then: Retry comment posted
      expect(mockGitHubClient.postComment).toHaveBeenCalled();
      const commentBody = mockGitHubClient.postComment.mock.calls[0][3];
      expect(commentBody).toContain('Retry Attempt #1');

      // Second attempt succeeds
      const secondResult = {
        status: 'SUCCESS',
        role: dispatch.role,
        command: dispatch.command,
        summary: 'Execution succeeded on retry',
        artifacts: [],
        recommendation: 'Task completed'
      };

      await adapter.postResult(secondResult, 'myorg', 'myrepo', issue.number);

      // Then: Success label added
      const labels = mockGitHubClient.addLabel.mock.calls;
      const successLabel = labels.find(call => call[3] === 'status:completed');
      expect(successLabel).toBeDefined();
    });

    test('retry exhausted flow: Issue → Execution → Retry → Escalate', async () => {
      // Given: Execution fails and retry also fails
      const dispatch = adapter.normalizeInput(MOCK_WEBHOOK_PAYLOAD.issue);

      // First failure
      const firstRetryContext = { retry_count: 0, risk_level: 'low' };
      const firstDecision = adapter.handleRetry(firstRetryContext);
      expect(firstDecision.decision).toBe('retry');

      // Second failure (max retry = 1, so this should escalate)
      const secondRetryContext = { retry_count: 1, risk_level: 'low' };
      const secondDecision = adapter.handleRetry(secondRetryContext);
      expect(secondDecision.decision).toBe('escalate');

      // When: Convert to escalation
      const escalation = adapter.generateEscalation({
        dispatch_id: dispatch.dispatch_id,
        summary: 'Max retries exceeded',
        blocking_points: ['Persistent failure after retry'],
        requires_user_decision: true
      });

      await adapter.postEscalation(escalation, 'myorg', 'myrepo', 123);

      // Then: Escalation posted
      expect(mockGitHubClient.postComment).toHaveBeenCalled();
    });
  });
});
