/**
 * Unit Tests for Webhook Handler
 *
 * SECURITY CRITICAL COMPONENT
 * These tests validate the security-critical webhook handling functionality
 * including HMAC-SHA256 signature verification and timing-safe comparisons.
 *
 * @module adapters/github-issue/tests/unit/webhook-handler
 * @security-level critical
 */

const crypto = require('crypto');
const { WebhookHandler, PROCESS_EVENTS, IGNORE_EVENTS } = require('../../webhook-handler');

// Test configuration matching github-issue.config.json
const TEST_CONFIG = {
  github_config: {
    webhook: {
      secret_env_var: 'GITHUB_WEBHOOK_SECRET',
      signature_header: 'X-Hub-Signature-256',
      event_header: 'X-GitHub-Event',
      delivery_header: 'X-GitHub-Delivery'
    },
    events: {
      process: [
        'issues.opened',
        'issues.edited',
        'issues.labeled',
        'issue_comment.created'
      ],
      ignore: [
        'issues.closed',
        'issues.deleted',
        'issues.assigned',
        'issues.unassigned'
      ]
    }
  }
};

const TEST_SECRET = 'test-webhook-secret-12345';

/**
 * Generate a valid HMAC-SHA256 signature for testing
 * @param {string} payload - Raw payload string
 * @param {string} secret - Webhook secret
 * @returns {string} Signature in format "sha256={hex_digest}"
 */
function generateSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload, 'utf8');
  return `sha256=${hmac.digest('hex')}`;
}

/**
 * Create a mock webhook request
 * @param {Object} options - Request options
 * @returns {Object} Mock request object
 */
function createMockRequest(options = {}) {
  const {
    body = '{}',
    signature = null,
    event = 'issues',
    delivery = 'test-delivery-id',
    headers = {}
  } = options;

  const defaultHeaders = {
    'X-Hub-Signature-256': signature,
    'X-GitHub-Event': event,
    'X-GitHub-Delivery': delivery
  };

  // Filter out null/undefined headers
  const mergedHeaders = {};
  for (const [key, value] of Object.entries({ ...defaultHeaders, ...headers })) {
    if (value !== null && value !== undefined) {
      mergedHeaders[key] = value;
    }
  }

  return {
    body,
    headers: mergedHeaders
  };
}

/**
 * Create a sample issues.opened payload
 * @returns {Object} Sample payload
 */
function createIssuesPayload(action = 'opened') {
  return {
    action,
    issue: {
      number: 123,
      title: 'Test Issue',
      body: 'Test body',
      html_url: 'https://github.com/test-org/test-repo/issues/123',
      state: 'open',
      labels: [],
      user: { login: 'testuser' },
      assignees: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    repository: {
      owner: { login: 'test-org' },
      name: 'test-repo',
      full_name: 'test-org/test-repo'
    },
    sender: { login: 'testuser' }
  };
}

describe('WebhookHandler', () => {
  let handler;

  beforeEach(() => {
    handler = new WebhookHandler(TEST_CONFIG);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with default config values', () => {
      const defaultHandler = new WebhookHandler({});
      expect(defaultHandler.secretEnvVar).toBe('GITHUB_WEBHOOK_SECRET');
      expect(defaultHandler.signatureHeader).toBe('X-Hub-Signature-256');
      expect(defaultHandler.eventHeader).toBe('X-GitHub-Event');
      expect(defaultHandler.deliveryHeader).toBe('X-GitHub-Delivery');
    });

    it('should initialize with custom config values', () => {
      expect(handler.secretEnvVar).toBe('GITHUB_WEBHOOK_SECRET');
      expect(handler.signatureHeader).toBe('X-Hub-Signature-256');
      expect(handler.eventHeader).toBe('X-GitHub-Event');
      expect(handler.deliveryHeader).toBe('X-GitHub-Delivery');
    });

    it('should load process events from config', () => {
      expect(handler.processEvents).toContain('issues.opened');
      expect(handler.processEvents).toContain('issues.edited');
      expect(handler.processEvents).toContain('issues.labeled');
      expect(handler.processEvents).toContain('issue_comment.created');
    });

    it('should load ignore events from config', () => {
      expect(handler.ignoreEvents).toContain('issues.closed');
      expect(handler.ignoreEvents).toContain('issues.deleted');
    });
  });

  describe('SECURITY: Signature Verification', () => {
    describe('verifySignature', () => {
      it('should verify valid signature using HMAC-SHA256', () => {
        const payload = JSON.stringify(createIssuesPayload());
        const signature = generateSignature(payload, TEST_SECRET);

        const result = handler.verifySignature(payload, signature, TEST_SECRET);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

    it('should reject invalid signature', () => {
        const payload = JSON.stringify(createIssuesPayload());
        const invalidSignature = 'sha256=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // Valid format, wrong sig

        const result = handler.verifySignature(payload, invalidSignature, TEST_SECRET);

        expect(result.valid).toBe(false);
        // Implementation returns 'Signature length mismatch' or 'Signature mismatch' depending on length
        expect(result.error).toMatch(/Signature (length )?mismatch/);
      });

      it('should reject signature with wrong secret', () => {
        const payload = JSON.stringify(createIssuesPayload());
        const signature = generateSignature(payload, 'wrong-secret');

        const result = handler.verifySignature(payload, signature, TEST_SECRET);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Signature mismatch');
      });

      it('should reject signature without sha256 prefix', () => {
        const payload = JSON.stringify(createIssuesPayload());
        const hmac = crypto.createHmac('sha256', TEST_SECRET);
        hmac.update(payload, 'utf8');
        const signatureWithoutPrefix = hmac.digest('hex'); // Missing "sha256="

        const result = handler.verifySignature(payload, signatureWithoutPrefix, TEST_SECRET);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid signature format: expected sha256 prefix');
      });

      it('should reject empty signature', () => {
        const payload = JSON.stringify(createIssuesPayload());

        const result = handler.verifySignature(payload, '', TEST_SECRET);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Missing required parameters for signature verification');
      });

      it('should reject null signature', () => {
        const payload = JSON.stringify(createIssuesPayload());

        const result = handler.verifySignature(payload, null, TEST_SECRET);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Missing required parameters for signature verification');
      });

      it('should reject undefined signature', () => {
        const payload = JSON.stringify(createIssuesPayload());

        const result = handler.verifySignature(payload, undefined, TEST_SECRET);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Missing required parameters for signature verification');
      });

      it('should reject signature with invalid hex encoding', () => {
        const payload = JSON.stringify(createIssuesPayload());
        // 'G' is not valid hex, but Buffer.from handles it differently
        // It will produce a shorter buffer causing length mismatch
        const invalidHexSignature = 'sha256=GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG';

        const result = handler.verifySignature(payload, invalidHexSignature, TEST_SECRET);

        expect(result.valid).toBe(false);
        // Buffer.from with invalid hex may result in different length buffer
        expect(result.error).toMatch(/(Invalid signature encoding|Signature length mismatch)/);
      });

      it('should handle missing payload parameter', () => {
        const signature = generateSignature('{}', TEST_SECRET);

        const result = handler.verifySignature(null, signature, TEST_SECRET);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Missing required parameters for signature verification');
      });

      it('should handle missing secret parameter', () => {
        const payload = JSON.stringify(createIssuesPayload());
        const signature = generateSignature(payload, TEST_SECRET);

        const result = handler.verifySignature(payload, signature, null);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Missing required parameters for signature verification');
      });

      it('should handle empty secret', () => {
        const payload = JSON.stringify(createIssuesPayload());
        const signature = generateSignature(payload, '');

        const result = handler.verifySignature(payload, signature, '');

        // Empty secret is falsy, so it fails parameter validation
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Missing required parameters for signature verification');
      });
    });

    describe('SECURITY: Timing-Safe Comparison', () => {
      it('should use crypto.timingSafeEqual for signature comparison', () => {
        const timingSpy = jest.spyOn(crypto, 'timingSafeEqual');

        const payload = JSON.stringify(createIssuesPayload());
        const signature = generateSignature(payload, TEST_SECRET);

        handler.verifySignature(payload, signature, TEST_SECRET);

        expect(timingSpy).toHaveBeenCalled();
      });

      it('should detect signature length mismatch', () => {
        const payload = JSON.stringify(createIssuesPayload());
        const hmac = crypto.createHmac('sha256', TEST_SECRET);
        hmac.update(payload, 'utf8');
        const fullSig = hmac.digest('hex');

        // Truncate signature
        const truncatedSignature = `sha256=${fullSig.slice(0, 32)}`;

        const result = handler.verifySignature(payload, truncatedSignature, TEST_SECRET);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Signature length mismatch');
      });

      it('should handle signatures of different lengths gracefully', () => {
        const payload = JSON.stringify(createIssuesPayload());

        // Create a signature that's way too short
        const shortSignature = 'sha256=abcd1234';

        const result = handler.verifySignature(payload, shortSignature, TEST_SECRET);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Signature length mismatch');
      });

      it('should reject signature with extra hex characters', () => {
        const payload = JSON.stringify(createIssuesPayload());
        const hmac = crypto.createHmac('sha256', TEST_SECRET);
        hmac.update(payload, 'utf8');
        const fullSig = hmac.digest('hex');

        // Add extra characters
        const longSignature = `sha256=${fullSig}abcdef123456`;

        const result = handler.verifySignature(payload, longSignature, TEST_SECRET);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Signature length mismatch');
      });
    });
  });

  describe('SECURITY: Request Validation', () => {
    describe('handleRequest - Missing Signature', () => {
      it('should reject request with missing signature header', async () => {
        const payload = createIssuesPayload();
        const request = createMockRequest({
          body: JSON.stringify(payload),
          signature: null
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(401);
        expect(result.message).toBe('Missing signature header');
        expect(result.verification.valid).toBe(false);
        expect(result.verification.error).toBe('Missing X-Hub-Signature-256 header');
      });

      it('should reject request with undefined signature header', async () => {
        const payload = createIssuesPayload();
        const request = {
          body: JSON.stringify(payload),
          headers: {
            'X-GitHub-Event': 'issues'
            // X-Hub-Signature-256 is missing
          }
        };

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(401);
        expect(result.message).toBe('Missing signature header');
      });

      it('should reject request with empty signature header', async () => {
        const payload = createIssuesPayload();
        const request = createMockRequest({
          body: JSON.stringify(payload),
          signature: ''
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(401);
        expect(result.message).toBe('Missing signature header');
      });
    });

    describe('handleRequest - Invalid Signature', () => {
      it('should reject request with invalid signature', async () => {
        const payload = createIssuesPayload();
        const request = createMockRequest({
          body: JSON.stringify(payload),
          signature: 'sha256=invalid0000000000000000000000000000000000000000000000000000'
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(401);
        expect(result.message).toBe('Invalid signature');
        expect(result.verification.valid).toBe(false);
      });

      it('should reject request with tampered payload', async () => {
        const originalPayload = createIssuesPayload();
        const tamperedPayload = { ...originalPayload, action: 'closed' };
        const signature = generateSignature(JSON.stringify(originalPayload), TEST_SECRET);

        const request = createMockRequest({
          body: JSON.stringify(tamperedPayload),
          signature
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(401);
        expect(result.verification.valid).toBe(false);
      });
    });

    describe('handleRequest - Missing Required Headers', () => {
      it('should reject request with missing event header', async () => {
        const payload = createIssuesPayload();
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = {
          body,
          headers: {
            'X-Hub-Signature-256': signature
            // X-GitHub-Event is missing
          }
        };

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(400);
        expect(result.message).toBe('Missing event header');
        expect(result.verification.valid).toBe(false);
        expect(result.verification.error).toBe('Missing X-GitHub-Event header');
      });

      it('should accept request with missing delivery header (optional)', async () => {
        const payload = createIssuesPayload();
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = {
          body,
          headers: {
            'X-Hub-Signature-256': signature,
            'X-GitHub-Event': 'issues'
            // X-GitHub-Delivery is optional
          }
        };

        const result = await handler.handleRequest(request, TEST_SECRET);

        // Should pass validation (but may be ignored due to event filtering)
        expect(result.status).toBe(200);
      });
    });

    describe('handleRequest - Request Structure', () => {
      it('should reject null request', async () => {
        const result = await handler.handleRequest(null, TEST_SECRET);

        expect(result.status).toBe(400);
        expect(result.message).toBe('Invalid request: missing body');
      });

      it('should reject request with missing body', async () => {
        const request = {
          headers: {
            'X-Hub-Signature-256': 'sha256=abc123',
            'X-GitHub-Event': 'issues'
          }
          // body is missing
        };

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(400);
        expect(result.message).toBe('Invalid request: missing body');
      });

      it('should reject request with empty body', async () => {
        const request = createMockRequest({
          body: '',
          signature: generateSignature('', TEST_SECRET)
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        // Empty body returns 400 with missing body error
        expect(result.status).toBe(400);
        expect(result.message).toBe('Invalid request: missing body');
      });

      it('should reject invalid JSON payload', async () => {
        const invalidBody = '{ invalid json }';
        const request = createMockRequest({
          body: invalidBody,
          signature: generateSignature(invalidBody, TEST_SECRET)
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(400);
        expect(result.message).toBe('Invalid JSON payload');
      });
    });

    describe('handleRequest - Header Case Insensitivity', () => {
      it('should accept lowercase header names', async () => {
        const payload = createIssuesPayload('opened');
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = {
          body,
          headers: {
            'x-hub-signature-256': signature,
            'x-github-event': 'issues',
            'x-github-delivery': 'test-id'
          }
        };

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(200);
        expect(result.verification.valid).toBe(true);
      });

      it('should accept mixed-case header names', async () => {
        const payload = createIssuesPayload('opened');
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = {
          body,
          headers: {
            'X-Hub-Signature-256': signature,
            'x-github-event': 'issues',
            'X-GitHub-Delivery': 'test-id'
          }
        };

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(200);
        expect(result.verification.valid).toBe(true);
      });
    });
  });

  describe('Event Filtering', () => {
    describe('shouldProcessEvent', () => {
      it('should process issues.opened event', () => {
        expect(handler.shouldProcessEvent('issues', 'opened')).toBe(true);
      });

      it('should process issues.edited event', () => {
        expect(handler.shouldProcessEvent('issues', 'edited')).toBe(true);
      });

      it('should process issues.labeled event', () => {
        expect(handler.shouldProcessEvent('issues', 'labeled')).toBe(true);
      });

      it('should process issue_comment.created event', () => {
        expect(handler.shouldProcessEvent('issue_comment', 'created')).toBe(true);
      });

      it('should ignore issues.closed event', () => {
        expect(handler.shouldProcessEvent('issues', 'closed')).toBe(false);
      });

      it('should ignore issues.deleted event', () => {
        expect(handler.shouldProcessEvent('issues', 'deleted')).toBe(false);
      });

      it('should ignore issues.assigned event', () => {
        expect(handler.shouldProcessEvent('issues', 'assigned')).toBe(false);
      });

      it('should ignore issues.unassigned event', () => {
        expect(handler.shouldProcessEvent('issues', 'unassigned')).toBe(false);
      });

      it('should ignore pull_request events', () => {
        expect(handler.shouldProcessEvent('pull_request', 'opened')).toBe(false);
      });

      it('should ignore push events', () => {
        expect(handler.shouldProcessEvent('push', null)).toBe(false);
      });

      it('should handle event without action', () => {
        // For issues event without action, check if any action variant is processable
        // The implementation returns false when action is undefined
        expect(handler.shouldProcessEvent('issues', undefined)).toBe(false);
      });

      it('should handle unknown event type', () => {
        expect(handler.shouldProcessEvent('unknown_event', 'action')).toBe(false);
      });

      it('should handle event in ignore list', () => {
        // 'issues.closed' is explicitly in ignoreEvents list
        expect(handler.shouldProcessEvent('issues', 'closed')).toBe(false);
      });
    });

    describe('handleRequest - Event Filtering', () => {
      it('should process valid issues.opened webhook', async () => {
        const payload = createIssuesPayload('opened');
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = createMockRequest({
          body,
          signature,
          event: 'issues'
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(200);
        expect(result.message).toBe('Webhook verified and ready for processing');
        expect(result.data).toBeDefined();
        expect(result.data.event).toBe('issues');
        expect(result.data.action).toBe('opened');
        expect(result.data.payload).toEqual(payload);
      });

      it('should process issues.edited webhook', async () => {
        const payload = createIssuesPayload('edited');
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = createMockRequest({
          body,
          signature,
          event: 'issues'
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(200);
        expect(result.data.action).toBe('edited');
      });

      it('should process issues.labeled webhook', async () => {
        const payload = createIssuesPayload('labeled');
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = createMockRequest({
          body,
          signature,
          event: 'issues'
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(200);
        expect(result.data.action).toBe('labeled');
      });

      it('should ignore issues.closed webhook', async () => {
        const payload = createIssuesPayload('closed');
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = createMockRequest({
          body,
          signature,
          event: 'issues'
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(200);
        expect(result.message).toContain('ignored');
        expect(result.ignored).toBe(true);
        expect(result.data).toBeNull();
      });

      it('should ignore pull_request.opened webhook', async () => {
        const payload = { action: 'opened', pull_request: { number: 1 } };
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = createMockRequest({
          body,
          signature,
          event: 'pull_request'
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(200);
        expect(result.message).toContain('ignored');
        expect(result.ignored).toBe(true);
      });

      it('should process issue_comment.created webhook', async () => {
        const payload = {
          action: 'created',
          comment: { id: 456, body: 'Test comment', user: { login: 'testuser' } },
          issue: { number: 123, title: 'Test Issue', labels: [] },
          repository: { owner: { login: 'test-org' }, name: 'test-repo', full_name: 'test-org/test-repo' },
          sender: { login: 'testuser' }
        };
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = createMockRequest({
          body,
          signature,
          event: 'issue_comment'
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(200);
        expect(result.data.event).toBe('issue_comment');
        expect(result.data.action).toBe('created');
      });
    });
  });

  describe('Payload Structure Validation', () => {
    describe('handleRequest - Payload Validation', () => {
      it('should extract delivery ID from headers', async () => {
        const payload = createIssuesPayload('opened');
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = createMockRequest({
          body,
          signature,
          event: 'issues',
          delivery: 'abc-123-def'
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(200);
        expect(result.data.delivery).toBe('abc-123-def');
      });

      it('should handle body as object instead of string', async () => {
        const payload = createIssuesPayload('opened');
        const bodyString = JSON.stringify(payload);
        const signature = generateSignature(bodyString, TEST_SECRET);

        // Pass body as object
        const request = createMockRequest({
          body: payload, // Object instead of string
          signature,
          event: 'issues'
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(200);
        expect(result.data.payload).toEqual(payload);
      });

      it('should return complete data structure on success', async () => {
        const payload = createIssuesPayload('opened');
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = createMockRequest({
          body,
          signature,
          event: 'issues',
          delivery: 'delivery-123'
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.status).toBe(200);
        expect(result.message).toBe('Webhook verified and ready for processing');
        expect(result.verification).toBeDefined();
        expect(result.verification.valid).toBe(true);
        expect(result.verification.event).toBe('issues');
        expect(result.verification.action).toBe('opened');
        expect(result.data).toBeDefined();
        expect(result.data.event).toBe('issues');
        expect(result.data.action).toBe('opened');
        expect(result.data.delivery).toBe('delivery-123');
        expect(result.data.payload).toEqual(payload);
      });

      it('should include verification details in response', async () => {
        const payload = createIssuesPayload('opened');
        const body = JSON.stringify(payload);
        const signature = generateSignature(body, TEST_SECRET);

        const request = createMockRequest({
          body,
          signature,
          event: 'issues'
        });

        const result = await handler.handleRequest(request, TEST_SECRET);

        expect(result.verification).toBeDefined();
        expect(result.verification.valid).toBe(true);
        expect(result.verification.error).toBeUndefined();
      });
    });

    describe('handleIssuesEvent', () => {
      it('should handle issues.opened event', () => {
        const event = createIssuesPayload('opened');

        const result = handler.handleIssuesEvent(event);

        expect(result.success).toBe(true);
        expect(result.action).toBe('opened');
        expect(result.needsProcessing).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.eventType).toBe('issues');
        expect(result.data.dispatchId).toBe('gh-issue-test-org-test-repo-123');
        expect(result.data.projectId).toBe('test-org/test-repo');
      });

      it('should handle issues.edited event', () => {
        const event = createIssuesPayload('edited');

        const result = handler.handleIssuesEvent(event);

        expect(result.success).toBe(true);
        expect(result.action).toBe('edited');
        expect(result.needsProcessing).toBe(true);
      });

      it('should handle issues.labeled event', () => {
        const event = {
          ...createIssuesPayload('labeled'),
          label: { name: 'bug', color: 'd73a4a' }
        };

        const result = handler.handleIssuesEvent(event);

        expect(result.success).toBe(true);
        expect(result.action).toBe('labeled');
        expect(result.needsProcessing).toBe(true);
        expect(result.label).toEqual({ name: 'bug', color: 'd73a4a' });
      });

      it('should handle unknown action gracefully', () => {
        const event = createIssuesPayload('unknown_action');

        const result = handler.handleIssuesEvent(event);

        expect(result.success).toBe(true);
        expect(result.action).toBe('unknown_action');
        expect(result.needsProcessing).toBe(false);
      });

      it('should return error for missing issue', () => {
        const event = {
          action: 'opened',
          repository: { owner: { login: 'test-org' }, name: 'test-repo' }
          // issue is missing
        };

        const result = handler.handleIssuesEvent(event);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Missing issue or repository in payload');
      });

      it('should return error for missing repository', () => {
        const event = {
          action: 'opened',
          issue: { number: 123 }
          // repository is missing
        };

        const result = handler.handleIssuesEvent(event);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Missing issue or repository in payload');
      });

      it('should correctly format issue data', () => {
        const event = createIssuesPayload('opened');

        const result = handler.handleIssuesEvent(event);

        expect(result.data.issue).toEqual({
          number: 123,
          title: 'Test Issue',
          body: 'Test body',
          html_url: 'https://github.com/test-org/test-repo/issues/123',
          state: 'open',
          labels: [],
          milestone: undefined,
          user: { login: 'testuser' },
          assignees: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        });
      });

      it('should correctly format repository data', () => {
        const event = createIssuesPayload('opened');

        const result = handler.handleIssuesEvent(event);

        expect(result.data.repository).toEqual({
          owner: 'test-org',
          name: 'test-repo',
          full_name: 'test-org/test-repo'
        });
      });
    });

    describe('handleIssueCommentEvent', () => {
      it('should handle issue_comment.created event', () => {
        const event = {
          action: 'created',
          comment: {
            id: 456,
            body: 'Test comment',
            html_url: 'https://github.com/test-org/test-repo/issues/123#issuecomment-456',
            user: { login: 'testuser' },
            created_at: '2024-01-01T00:00:00Z'
          },
          issue: {
            number: 123,
            title: 'Test Issue',
            labels: [],
            state: 'open',
            html_url: 'https://github.com/test-org/test-repo/issues/123'
          },
          repository: {
            owner: { login: 'test-org' },
            name: 'test-repo',
            full_name: 'test-org/test-repo'
          },
          sender: { login: 'testuser' }
        };

        const result = handler.handleIssueCommentEvent(event);

        expect(result.success).toBe(true);
        expect(result.action).toBe('created');
        expect(result.needsProcessing).toBe(false);
        expect(result.isEscalationResponse).toBe(false);
        expect(result.data.eventType).toBe('issue_comment');
      });

      it('should detect escalation comment', () => {
        const event = {
          action: 'created',
          comment: {
            id: 456,
            body: 'I choose option A',
            user: { login: 'testuser' },
            created_at: '2024-01-01T00:00:00Z'
          },
          issue: {
            number: 123,
            title: 'Test Issue',
            labels: [{ name: 'escalation:needs-decision' }],
            state: 'open',
            html_url: 'https://github.com/test-org/test-repo/issues/123'
          },
          repository: {
            owner: { login: 'test-org' },
            name: 'test-repo',
            full_name: 'test-org/test-repo'
          },
          sender: { login: 'testuser' }
        };

        const result = handler.handleIssueCommentEvent(event);

        expect(result.success).toBe(true);
        expect(result.needsProcessing).toBe(true);
        expect(result.isEscalationResponse).toBe(true);
      });

      it('should return error for missing comment', () => {
        const event = {
          action: 'created',
          issue: { number: 123 },
          repository: { owner: { login: 'test-org' }, name: 'test-repo' }
          // comment is missing
        };

        const result = handler.handleIssueCommentEvent(event);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Missing comment, issue or repository in payload');
      });

      it('should return error for missing issue', () => {
        const event = {
          action: 'created',
          comment: { id: 456, body: 'Test' },
          repository: { owner: { login: 'test-org' }, name: 'test-repo' }
          // issue is missing
        };

        const result = handler.handleIssueCommentEvent(event);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Missing comment, issue or repository in payload');
      });

      it('should correctly format comment data', () => {
        const event = {
          action: 'created',
          comment: {
            id: 456,
            body: 'Test comment',
            html_url: 'https://github.com/test-org/test-repo/issues/123#issuecomment-456',
            user: { login: 'testuser' },
            created_at: '2024-01-01T00:00:00Z'
          },
          issue: {
            number: 123,
            title: 'Test Issue',
            labels: [],
            state: 'open',
            html_url: 'https://github.com/test-org/test-repo/issues/123'
          },
          repository: {
            owner: { login: 'test-org' },
            name: 'test-repo',
            full_name: 'test-org/test-repo'
          },
          sender: { login: 'testuser' }
        };

        const result = handler.handleIssueCommentEvent(event);

        expect(result.data.comment).toEqual({
          id: 456,
          body: 'Test comment',
          html_url: 'https://github.com/test-org/test-repo/issues/123#issuecomment-456',
          user: { login: 'testuser' },
          created_at: '2024-01-01T00:00:00Z'
        });
      });
    });
  });

  describe('Utility Methods', () => {
    describe('getSecretFromEnv', () => {
      it('should return secret from environment variable', () => {
        process.env.GITHUB_WEBHOOK_SECRET = 'env-secret-123';

        const secret = handler.getSecretFromEnv();

        expect(secret).toBe('env-secret-123');

        delete process.env.GITHUB_WEBHOOK_SECRET;
      });

      it('should return null if env variable not set', () => {
        delete process.env.GITHUB_WEBHOOK_SECRET;

        const secret = handler.getSecretFromEnv();

        expect(secret).toBeNull();
      });
    });

    describe('getHandlerInfo', () => {
      it('should return handler metadata', () => {
        const info = handler.getHandlerInfo();

        expect(info.handlerType).toBe('WebhookHandler');
        expect(info.version).toBe('1.0.0');
        expect(info.signatureAlgorithm).toBe('HMAC-SHA256');
        expect(info.securityFeatures).toContain('constant-time-comparison');
        expect(info.securityFeatures).toContain('signature-verification');
        expect(info.supportedEvents).toContain('issues.opened');
        expect(info.ignoredEvents).toContain('issues.closed');
      });
    });
  });

  describe('Constants', () => {
    it('should export PROCESS_EVENTS constant', () => {
      expect(PROCESS_EVENTS).toContain('issues.opened');
      expect(PROCESS_EVENTS).toContain('issues.edited');
      expect(PROCESS_EVENTS).toContain('issues.labeled');
      expect(PROCESS_EVENTS).toContain('issue_comment.created');
    });

    it('should export IGNORE_EVENTS constant', () => {
      expect(IGNORE_EVENTS).toContain('issues.closed');
      expect(IGNORE_EVENTS).toContain('issues.deleted');
      expect(IGNORE_EVENTS).toContain('issues.assigned');
      expect(IGNORE_EVENTS).toContain('issues.unassigned');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle payload with unicode characters', async () => {
      const payload = {
        action: 'opened',
        issue: {
          number: 123,
          title: 'Test Issue with unicode: 你好世界 🎉',
          body: 'Unicode content: émojis 🚀 and chinese 中文',
          html_url: 'https://github.com/test-org/test-repo/issues/123',
          state: 'open',
          labels: [],
          user: { login: 'testuser' },
          assignees: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        repository: {
          owner: { login: 'test-org' },
          name: 'test-repo',
          full_name: 'test-org/test-repo'
        },
        sender: { login: 'testuser' }
      };
      const body = JSON.stringify(payload);
      const signature = generateSignature(body, TEST_SECRET);

      const request = createMockRequest({
        body,
        signature,
        event: 'issues'
      });

      const result = await handler.handleRequest(request, TEST_SECRET);

      expect(result.status).toBe(200);
      expect(result.data.payload.issue.title).toBe('Test Issue with unicode: 你好世界 🎉');
    });

    it('should handle payload with special characters', async () => {
      const payload = {
        action: 'opened',
        issue: {
          number: 123,
          title: 'Test with "quotes" and \n newlines \t tabs',
          body: 'Body with <html> & special > chars',
          html_url: 'https://github.com/test-org/test-repo/issues/123',
          state: 'open',
          labels: [],
          user: { login: 'testuser' },
          assignees: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        repository: {
          owner: { login: 'test-org' },
          name: 'test-repo',
          full_name: 'test-org/test-repo'
        },
        sender: { login: 'testuser' }
      };
      const body = JSON.stringify(payload);
      const signature = generateSignature(body, TEST_SECRET);

      const request = createMockRequest({
        body,
        signature,
        event: 'issues'
      });

      const result = await handler.handleRequest(request, TEST_SECRET);

      expect(result.status).toBe(200);
      expect(result.data.payload.issue.title).toBe('Test with "quotes" and \n newlines \t tabs');
    });

    it('should handle very large payload', async () => {
      const largeBody = 'x'.repeat(10000);
      const payload = {
        action: 'opened',
        issue: {
          number: 123,
          title: 'Large payload test',
          body: largeBody,
          html_url: 'https://github.com/test-org/test-repo/issues/123',
          state: 'open',
          labels: [],
          user: { login: 'testuser' },
          assignees: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        repository: {
          owner: { login: 'test-org' },
          name: 'test-repo',
          full_name: 'test-org/test-repo'
        },
        sender: { login: 'testuser' }
      };
      const body = JSON.stringify(payload);
      const signature = generateSignature(body, TEST_SECRET);

      const request = createMockRequest({
        body,
        signature,
        event: 'issues'
      });

      const result = await handler.handleRequest(request, TEST_SECRET);

      expect(result.status).toBe(200);
      expect(result.data.payload.issue.body).toBe(largeBody);
    });

    it('should handle payload with null fields', async () => {
      const payload = {
        action: 'opened',
        issue: {
          number: 123,
          title: null,
          body: null,
          html_url: 'https://github.com/test-org/test-repo/issues/123',
          state: 'open',
          labels: null,
          user: null,
          assignees: null,
          milestone: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        repository: {
          owner: { login: 'test-org' },
          name: 'test-repo',
          full_name: 'test-org/test-repo'
        },
        sender: null
      };
      const body = JSON.stringify(payload);
      const signature = generateSignature(body, TEST_SECRET);

      const request = createMockRequest({
        body,
        signature,
        event: 'issues'
      });

      const result = await handler.handleRequest(request, TEST_SECRET);

      expect(result.status).toBe(200);
      expect(result.data.payload.issue.title).toBeNull();
    });

    it('should handle issues.labeled with label in payload', async () => {
      const payload = {
        action: 'labeled',
        issue: {
          number: 123,
          title: 'Test Issue',
          body: 'Test body',
          html_url: 'https://github.com/test-org/test-repo/issues/123',
          state: 'open',
          labels: [{ name: 'bug', color: 'd73a4a' }, { name: 'feature', color: 'a2eeef' }],
          user: { login: 'testuser' },
          assignees: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        repository: {
          owner: { login: 'test-org' },
          name: 'test-repo',
          full_name: 'test-org/test-repo'
        },
        sender: { login: 'testuser' },
        label: { name: 'urgent', color: 'ff0000' }
      };
      const body = JSON.stringify(payload);
      const signature = generateSignature(body, TEST_SECRET);

      const request = createMockRequest({
        body,
        signature,
        event: 'issues'
      });

      const result = await handler.handleRequest(request, TEST_SECRET);

      expect(result.status).toBe(200);
      const eventResult = handler.handleIssuesEvent(result.data.payload);
      expect(eventResult.label).toEqual({ name: 'urgent', color: 'ff0000' });
    });

    it('should handle repository owner as string instead of object', () => {
      const event = {
        action: 'opened',
        issue: {
          number: 123,
          title: 'Test Issue',
          body: 'Test body',
          html_url: 'https://github.com/test-org/test-repo/issues/123',
          state: 'open',
          labels: [],
          user: { login: 'testuser' },
          assignees: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        repository: {
          owner: 'test-org', // String instead of object
          name: 'test-repo',
          full_name: 'test-org/test-repo'
        },
        sender: { login: 'testuser' }
      };

      const result = handler.handleIssuesEvent(event);

      expect(result.success).toBe(true);
      expect(result.data.repository.owner).toBe('test-org');
      expect(result.data.dispatchId).toBe('gh-issue-test-org-test-repo-123');
    });

    it('should handle sender as string instead of object', () => {
      const event = {
        action: 'opened',
        issue: {
          number: 123,
          title: 'Test Issue',
          body: 'Test body',
          html_url: 'https://github.com/test-org/test-repo/issues/123',
          state: 'open',
          labels: [],
          user: { login: 'testuser' },
          assignees: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        repository: {
          owner: { login: 'test-org' },
          name: 'test-repo',
          full_name: 'test-org/test-repo'
        },
        sender: 'testuser' // String instead of object
      };

      const result = handler.handleIssuesEvent(event);

      expect(result.success).toBe(true);
      expect(result.data.sender).toBe('testuser');
    });
  });
});
