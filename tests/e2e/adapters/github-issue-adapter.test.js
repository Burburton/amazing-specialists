/**
 * True E2E Tests: GitHub Issue Adapter Integration
 * Test Cases: TC-GI-001~015
 */

const nock = require('nock');
const crypto = require('crypto');
const { GitHubIssueAdapter } = require('../../../adapters/github-issue');
const { getAdapterConfig, setupGitHubNock, cleanAllMocks, verifyMocksCalled } = require('../helpers/mock-config');
const { createGitHubWebhookPayload, createGitHubIssue, createExecutionResult, createEscalation, createRetryContext, computeHMACSignature } = require('../fixtures/adapter-fixtures');
const { assertValidDispatchFromAdapter, assertValidEscalation, assertAdapterErrorMapping, assertWebhookResult, assertValidAdapterInfo, assertRetryDecision } = require('../helpers/adapter-assertions');

describe('True E2E: GitHub Issue Adapter Integration', () => {
  let adapter;
  let config;
  const testSecret = 'test-webhook-secret';

  beforeEach(() => {
    cleanAllMocks();
    config = getAdapterConfig('github-issue');
    adapter = new GitHubIssueAdapter(config);
  });

  afterAll(() => {
    cleanAllMocks();
  });

  describe('Webhook Handling', () => {
    test('TC-GI-001: Webhook with valid signature -> dispatch created', async () => {
      const payload = createGitHubWebhookPayload({ action: 'opened', issue: { number: 123, title: '[architect:design-task] Design authentication feature', body: '## Context

Building a new authentication feature.

## Goal

Create a comprehensive design document.', labels: [{ name: 'milestone:mvp' }, { name: 'role:architect' }, { name: 'risk:low' }] } });
      const payloadStr = JSON.stringify(payload);
      const signature = computeHMACSignature(payloadStr, testSecret);
      const request = { body: payloadStr, headers: { 'x-hub-signature-256': signature, 'x-github-event': 'issues', 'x-github-delivery': 'delivery-123' } };
      const result = await adapter.handleWebhook(request, testSecret);
      assertWebhookResult(result, true);
      expect(result.issue).toBeDefined();
      const dispatch = adapter.normalizeInput(result.issue);
      assertValidDispatchFromAdapter(dispatch, 'architect');
      expect(dispatch.dispatch_id).toBe('gh-issue-test-owner-test-repo-123');
    });

    test('TC-GI-002: Webhook signature verification timing-safe', async () => {
      const payload = createGitHubWebhookPayload();
      const payloadStr = JSON.stringify(payload);
      const signature = computeHMACSignature(payloadStr, testSecret);
      const request = { body: payloadStr, headers: { 'x-hub-signature-256': signature, 'x-github-event': 'issues' } };
      const timingSpy = jest.spyOn(crypto, 'timingSafeEqual');
      await adapter.handleWebhook(request, testSecret);
      expect(timingSpy).toHaveBeenCalled();
      timingSpy.mockRestore();
    });

    test('TC-GI-003: Invalid webhook signature rejected', async () => {
      const payload = createGitHubWebhookPayload();
      const payloadStr = JSON.stringify(payload);
      const invalidSignature = 'sha256=invalid0000000000000000000000000000000000000000000000000000000000';
      const request = { body: payloadStr, headers: { 'x-hub-signature-256': invalidSignature, 'x-github-event': 'issues' } };
      const result = await adapter.handleWebhook(request, testSecret);
      assertWebhookResult(result, false);
      expect(result.error).toMatch(/signature/i);
    });
  });

  describe('Parsing Flow', () => {
    test('TC-GI-004: Issue labels parsed via LabelParser', () => {
      const issue = createGitHubIssue({ labels: [{ name: 'milestone:M001' }, { name: 'role:developer' }, { name: 'task:T012' }, { name: 'command:feature-implementation' }, { name: 'risk:medium' }] });
      const dispatch = adapter.normalizeInput(issue);
      expect(dispatch.milestone_id).toBe('M001');
      expect(dispatch.role).toBe('developer');
      expect(dispatch.task_id).toBe('T012');
      expect(dispatch.command).toBe('feature-implementation');
      expect(dispatch.risk_level).toBe('medium');
      assertValidDispatchFromAdapter(dispatch, 'developer');
    });

    test('TC-GI-005: Issue body parsed via BodyParser', () => {
      const issue = createGitHubIssue({ body: '## Context

Implementing authentication feature.

## Goal

Create production-ready auth module.

## Constraints

- Follow design document' });
      const dispatch = adapter.normalizeInput(issue);
      expect(dispatch.goal).toBe('Create production-ready auth module.');
      assertValidDispatchFromAdapter(dispatch, 'developer');
    });

    test('TC-GI-006: Dispatch payload validated', () => {
      const issue = createGitHubIssue();
      const dispatch = adapter.normalizeInput(issue);
      const validation = adapter.validateDispatch(dispatch);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('TC-GI-007: Dispatch routed to execution', () => {
      const issue = createGitHubIssue();
      const dispatch = adapter.normalizeInput(issue);
      const routing = adapter.routeToExecution(dispatch);
      expect(routing.routed).toBe(true);
      expect(routing.dispatch_id).toBe(dispatch.dispatch_id);
    });
  });

  describe('Error Mapping', () => {
    test('TC-GI-008: Error mapping: 404 -> BLOCKED', () => {
      expect(adapter.mapError({ status: 404 })).toBe('BLOCKED');
    });

    test('TC-GI-009: Error mapping: 500 -> FAILED_RETRYABLE', () => {
      expect(adapter.mapError({ status: 500 })).toBe('FAILED_RETRYABLE');
    });
  });

  describe('Escalation Flow', () => {
    test('TC-GI-010: Escalation generation', () => {
      const escalationContext = { dispatch_id: 'dispatch-001', project_id: 'test-owner/test-repo', milestone_id: 'M001', task_id: 'T001', role: 'developer', level: 'USER', reason_type: 'BLOCKING_DEPENDENCY', summary: 'Waiting for external API documentation.', blocking_points: [{ point: 'API documentation incomplete', impact: 'Cannot implement OAuth2' }], requires_user_decision: true };
      const escalation = adapter.generateEscalation(escalationContext);
      assertValidEscalation(escalation);
      expect(escalation.dispatch_id).toBe('dispatch-001');
    });

    test('TC-GI-011: Escalation posted via GitHub API (Nock)', async () => {
      const escalation = createEscalation();
      const scope = setupGitHubNock(config, { mockPostComment: true, mockAddLabels: true, owner: 'test-owner', repo: 'test-repo', issueNumber: 123 });
      await adapter.postEscalation(escalation, 'test-owner', 'test-repo', 123);
      expect(verifyMocksCalled(scope)).toBe(true);
    });
  });

  describe('Retry Flow', () => {
    test('TC-GI-012: Retry decision: low risk allowed', () => {
      const retryContext = createRetryContext({ retry_count: 0, risk_level: 'low', max_retry: 2 });
      const decision = adapter.handleRetry(retryContext);
      assertRetryDecision(decision, true);
      expect(decision.decision).toBe('retry');
    });

    test('TC-GI-013: Retry decision: critical risk denied', () => {
      const retryContext = createRetryContext({ retry_count: 0, risk_level: 'critical' });
      const decision = adapter.handleRetry(retryContext);
      assertRetryDecision(decision, false);
      expect(decision.decision).toBe('escalate');
    });
  });

  describe('Result and Info', () => {
    test('TC-GI-014: Execution result posted', async () => {
      const result = createExecutionResult({ status: 'SUCCESS', role: 'developer', command: 'feature-implementation' });
      const scope = setupGitHubNock(config, { mockPostComment: true, mockAddLabels: true, owner: 'test-owner', repo: 'test-repo', issueNumber: 123 });
      await adapter.postResult(result, 'test-owner', 'test-repo', 123);
      expect(verifyMocksCalled(scope)).toBe(true);
    });

    test('TC-GI-015: Adapter info returned', () => {
      const info = adapter.getAdapterInfo();
      assertValidAdapterInfo(info, 'orchestrator');
      expect(info.adapter_id).toBe('github-issue');
      expect(info.version).toBe('1.0.0');
    });
  });

  describe('Complete Integration Flows', () => {
    test('Complete webhook to dispatch to result flow', async () => {
      const payload = createGitHubWebhookPayload({ action: 'opened', issue: { number: 456, title: '[developer:feature-implementation] Implement feature X', body: '## Goal

Complete implementation.', labels: [{ name: 'role:developer' }, { name: 'risk:low' }] } });
      const payloadStr = JSON.stringify(payload);
      const signature = computeHMACSignature(payloadStr, testSecret);
      const request = { body: payloadStr, headers: { 'x-hub-signature-256': signature, 'x-github-event': 'issues' } };
      const webhookResult = await adapter.handleWebhook(request, testSecret);
      assertWebhookResult(webhookResult, true);
      const dispatch = adapter.normalizeInput(webhookResult.issue);
      assertValidDispatchFromAdapter(dispatch, 'developer');
      const validation = adapter.validateDispatch(dispatch);
      expect(validation.isValid).toBe(true);
    });

    test('Handles malformed webhook gracefully', async () => {
      const request = { body: 'not-json', headers: { 'x-hub-signature-256': computeHMACSignature('not-json', testSecret), 'x-github-event': 'issues' } };
      const result = await adapter.handleWebhook(request, testSecret);
      expect(result.status).toBe(400);
      expect(result.message).toContain('Invalid JSON');
    });

    test('Handles missing role label with default', () => {
      const issue = createGitHubIssue({ labels: [{ name: 'milestone:M001' }] });
      const dispatch = adapter.normalizeInput(issue);
      expect(dispatch.role).toBeDefined();
    });

    test('Handles multiple role labels (uses first)', () => {
      const issue = createGitHubIssue({ labels: [{ name: 'role:architect' }, { name: 'role:developer' }] });
      const dispatch = adapter.normalizeInput(issue);
      expect(dispatch.role).toBe('architect');
    });

    test('Handles error mapping for all status codes', () => {
      expect(adapter.mapError({ status: 401 })).toBe('BLOCKED');
      expect(adapter.mapError({ status: 403 })).toBe('BLOCKED');
      expect(adapter.mapError({ status: 404 })).toBe('BLOCKED');
      expect(adapter.mapError({ status: 422 })).toBe('FAILED_RETRYABLE');
      expect(adapter.mapError({ status: 500 })).toBe('FAILED_RETRYABLE');
      expect(adapter.mapError({ status: 502 })).toBe('FAILED_RETRYABLE');
      expect(adapter.mapError({ status: 503 })).toBe('FAILED_RETRYABLE');
    });

    test('Handles retry with exponential backoff', () => {
      const handler = adapter.retryHandler;
      const backoff0 = handler.getBackoffDuration(0);
      const backoff1 = handler.getBackoffDuration(1);
      expect(backoff1).toBeGreaterThan(backoff0);
    });
  });

  describe('Edge Cases', () => {
    test('Handles null request body', async () => {
      const request = { body: null, headers: { 'x-hub-signature-256': 'sha256=abc123', 'x-github-event': 'issues' } };
      const result = await adapter.handleWebhook(request, testSecret);
      expect(result.status).toBe(400);
    });

    test('Handles missing event header', async () => {
      const payload = createGitHubWebhookPayload();
      const payloadStr = JSON.stringify(payload);
      const signature = computeHMACSignature(payloadStr, testSecret);
      const request = { body: payloadStr, headers: { 'x-hub-signature-256': signature } };
      const result = await adapter.handleWebhook(request, testSecret);
      expect(result.status).toBe(400);
    });

    test('Handles ignored event types', async () => {
      const payload = createGitHubWebhookPayload({ action: 'closed' });
      const payloadStr = JSON.stringify(payload);
      const signature = computeHMACSignature(payloadStr, testSecret);
      const request = { body: payloadStr, headers: { 'x-hub-signature-256': signature, 'x-github-event': 'issues' } };
      const result = await adapter.handleWebhook(request, testSecret);
      expect(result.status).toBe(200);
      expect(result.ignored).toBe(true);
    });

    test('Handles empty labels array', () => {
      const issue = createGitHubIssue({ labels: [] });
      const dispatch = adapter.normalizeInput(issue);
      expect(dispatch.role).toBe('developer');
      expect(dispatch.risk_level).toBe('medium');
    });

    test('Handles invalid role label', () => {
      const issue = createGitHubIssue({ labels: [{ name: 'role:invalid-role' }] });
      const dispatch = adapter.normalizeInput(issue);
      expect(dispatch.role).toBeDefined();
    });

    test('Handles invalid risk label', () => {
      const issue = createGitHubIssue({ labels: [{ name: 'role:developer' }, { name: 'risk:invalid-risk' }] });
      const dispatch = adapter.normalizeInput(issue);
      expect(dispatch.risk_level).toBe('medium');
    });
  });

  describe('Security', () => {
    test('Rejects webhook without signature', async () => {
      const payload = createGitHubWebhookPayload();
      const request = { body: JSON.stringify(payload), headers: { 'x-github-event': 'issues' } };
      const result = await adapter.handleWebhook(request, testSecret);
      expect(result.status).toBe(401);
      expect(result.message).toContain('signature');
    });

    test('Rejects webhook with wrong secret', async () => {
      const payload = createGitHubWebhookPayload();
      const payloadStr = JSON.stringify(payload);
      const signature = computeHMACSignature(payloadStr, 'wrong-secret');
      const request = { body: payloadStr, headers: { 'x-hub-signature-256': signature, 'x-github-event': 'issues' } };
      const result = await adapter.handleWebhook(request, testSecret);
      expect(result.status).toBe(401);
      expect(result.verification.valid).toBe(false);
    });

    test('Rejects tampered payload', async () => {
      const payload = createGitHubWebhookPayload();
      const payloadStr = JSON.stringify(payload);
      const signature = computeHMACSignature(payloadStr, testSecret);
      const tampered = JSON.parse(payloadStr);
      tampered.issue.title = 'TAMPERED';
      const request = { body: JSON.stringify(tampered), headers: { 'x-hub-signature-256': signature, 'x-github-event': 'issues' } };
      const result = await adapter.handleWebhook(request, testSecret);
      expect(result.status).toBe(401);
      expect(result.verification.valid).toBe(false);
    });

    test('Uses timing-safe comparison for signatures', async () => {
      const payload = createGitHubWebhookPayload();
      const payloadStr = JSON.stringify(payload);
      const signature = computeHMACSignature(payloadStr, testSecret);
      const request = { body: payloadStr, headers: { 'x-hub-signature-256': signature, 'x-github-event': 'issues' } };
      const timingSpy = jest.spyOn(crypto, 'timingSafeEqual');
      await adapter.handleWebhook(request, testSecret);
      expect(timingSpy).toHaveBeenCalled();
      timingSpy.mockRestore();
    });
  });
});
