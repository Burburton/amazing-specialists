/**
 * Webhook Handler for GitHub Issue Adapter
 * 
 * Handles incoming GitHub Webhook requests with security verification.
 * Reference: specs/021-github-issue-adapter/spec.md (Task T011)
 * Reference: docs/adapters/github-issue-adapter-design.md
 * 
 * @module adapters/github-issue/webhook-handler
 */

const crypto = require('crypto');

/**
 * Events that should be processed
 * @constant {string[]}
 */
const PROCESS_EVENTS = [
  'issues.opened',
  'issues.edited',
  'issues.labeled',
  'issue_comment.created'
];

/**
 * Events that should be ignored
 * @constant {string[]}
 */
const IGNORE_EVENTS = [
  'issues.closed',
  'issues.deleted',
  'issues.assigned',
  'issues.unassigned',
  'issues.milestoned',
  'issues.demilestoned'
];

/**
 * WebhookHandler class
 * 
 * Receives and validates GitHub Webhook requests with HMAC-SHA256 signature verification.
 * Uses constant-time comparison to prevent timing attacks.
 */
class WebhookHandler {
  /**
   * Creates a new WebhookHandler instance
   * 
   * @param {Object} config - Configuration from github-issue.config.json
   * @param {Object} config.github_config - GitHub specific configuration
   * @param {Object} config.github_config.webhook - Webhook configuration
   * @param {string} config.github_config.webhook.secret_env_var - Environment variable for webhook secret
   * @param {string} config.github_config.webhook.signature_header - Header for signature (X-Hub-Signature-256)
   * @param {string} config.github_config.webhook.event_header - Header for event type (X-GitHub-Event)
   * @param {string} config.github_config.webhook.delivery_header - Header for delivery ID (X-GitHub-Delivery)
   * @param {Object} config.github_config.events - Event filtering configuration
   * @param {string[]} config.github_config.events.process - Events to process
   * @param {string[]} config.github_config.events.ignore - Events to ignore
   */
  constructor(config) {
    this.config = config;
    
    // Extract webhook configuration
    const webhookConfig = config.github_config?.webhook || {};
    this.secretEnvVar = webhookConfig.secret_env_var || 'GITHUB_WEBHOOK_SECRET';
    this.signatureHeader = webhookConfig.signature_header || 'X-Hub-Signature-256';
    this.eventHeader = webhookConfig.event_header || 'X-GitHub-Event';
    this.deliveryHeader = webhookConfig.delivery_header || 'X-GitHub-Delivery';
    
    // Event filtering configuration
    const eventsConfig = config.github_config?.events || {};
    this.processEvents = eventsConfig.process || PROCESS_EVENTS;
    this.ignoreEvents = eventsConfig.ignore || IGNORE_EVENTS;
  }

  /**
   * Main handler for incoming webhook requests
   * 
   * @param {Object} request - The incoming request object
   * @param {string} request.body - Raw request body (string)
   * @param {Object} request.headers - Request headers
   * @param {string} secret - Webhook secret for signature verification
   * @returns {Promise<Object>} Handler result with status and data
   * @returns {number} return.status - HTTP status code (200, 401, 400)
   * @returns {string} return.message - Response message
   * @returns {Object} [return.data] - Parsed event data (if valid)
   * @returns {WebhookVerificationResult} [return.verification] - Verification details
   * 
   * @example
   * const handler = new WebhookHandler(config);
   * const result = await handler.handleRequest({
   *   body: rawPayload,
   *   headers: { 'x-hub-signature-256': 'sha256=...', 'x-github-event': 'issues' }
   * }, secret);
   * 
   * if (result.status === 200) {
   *   // Process the event
   *   const eventData = result.data;
   * }
   */
  async handleRequest(request, secret) {
    // Validate request structure
    if (!request || !request.body) {
      return {
        status: 400,
        message: 'Invalid request: missing body',
        verification: { valid: false, error: 'Missing request body' }
      };
    }

    // Extract headers (normalize to lowercase for comparison)
    const headers = request.headers || {};
    const signature = headers[this.signatureHeader] || headers[this.signatureHeader.toLowerCase()];
    const event = headers[this.eventHeader] || headers[this.eventHeader.toLowerCase()];
    const delivery = headers[this.deliveryHeader] || headers[this.deliveryHeader.toLowerCase()];

    // Check required headers
    if (!signature) {
      return {
        status: 401,
        message: 'Missing signature header',
        verification: { valid: false, error: 'Missing X-Hub-Signature-256 header' }
      };
    }

    if (!event) {
      return {
        status: 400,
        message: 'Missing event header',
        verification: { valid: false, error: 'Missing X-GitHub-Event header' }
      };
    }

    // Verify signature (CRITICAL: uses constant-time comparison)
    const payload = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
    const verification = this.verifySignature(payload, signature, secret);

    if (!verification.valid) {
      return {
        status: 401,
        message: 'Invalid signature',
        verification
      };
    }

    // Parse payload
    let parsedPayload;
    try {
      parsedPayload = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    } catch (parseError) {
      return {
        status: 400,
        message: 'Invalid JSON payload',
        verification: { ...verification, valid: false, error: 'JSON parse error' }
      };
    }

    // Extract action from payload
    const action = parsedPayload.action;

    // Check if event should be processed
    if (!this.shouldProcessEvent(event, action)) {
      return {
        status: 200,
        message: `Event ${event}.${action || 'unknown'} ignored`,
        verification: { ...verification, event, action },
        data: null,
        ignored: true
      };
    }

    // Build successful result
    return {
      status: 200,
      message: 'Webhook verified and ready for processing',
      verification: { ...verification, event, action },
      data: {
        event,
        action,
        delivery,
        payload: parsedPayload
      }
    };
  }

  /**
   * Verifies webhook signature using HMAC-SHA256
   * 
   * CRITICAL SECURITY: Uses crypto.timingSafeEqual() for constant-time comparison
   * to prevent timing attacks. This is mandatory for security compliance.
   * 
   * @param {string} payload - Raw request payload (string)
   * @param {string} signature - Signature from X-Hub-Signature-256 header (format: "sha256={hex}")
   * @param {string} secret - Webhook secret
   * @returns {WebhookVerificationResult} Verification result
   * 
   * @example
   * const result = handler.verifySignature(
   *   '{"action":"opened",...}',
   *   'sha256=abc123...',
   *   'my-webhook-secret'
   * );
   * 
   * if (result.valid) {
   *   // Signature is valid
   * }
   */
  verifySignature(payload, signature, secret) {
    // Validate inputs
    if (!payload || !signature || !secret) {
      return {
        valid: false,
        error: 'Missing required parameters for signature verification'
      };
    }

    // Extract hex digest from signature header (format: "sha256={hex_digest}")
    const signaturePrefix = 'sha256=';
    if (!signature.startsWith(signaturePrefix)) {
      return {
        valid: false,
        error: 'Invalid signature format: expected sha256 prefix'
      };
    }

    const expectedSig = signature.slice(signaturePrefix.length);

    // Compute HMAC-SHA256
    const computedSig = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    // CRITICAL: Use constant-time comparison to prevent timing attacks
    // Both buffers must be of equal length for timingSafeEqual
    try {
      const expectedBuffer = Buffer.from(expectedSig, 'hex');
      const computedBuffer = Buffer.from(computedSig, 'hex');

      // Check buffer lengths match (timingSafeEqual requires equal length)
      if (expectedBuffer.length !== computedBuffer.length) {
        return {
          valid: false,
          error: 'Signature length mismatch'
        };
      }

      // Constant-time comparison (prevents timing attacks)
      const isValid = crypto.timingSafeEqual(expectedBuffer, computedBuffer);

      return {
        valid: isValid,
        error: isValid ? undefined : 'Signature mismatch'
      };
    } catch (bufferError) {
      return {
        valid: false,
        error: 'Invalid signature encoding'
      };
    }
  }

  /**
   * Handles GitHub 'issues' event
   * 
   * Processes issues.opened, issues.edited, issues.labeled events.
   * 
   * @param {Object} event - The parsed webhook event payload
   * @param {string} event.action - The action type (opened, edited, labeled)
   * @param {Object} event.issue - The GitHub issue object
   * @param {Object} event.repository - The repository object
   * @param {Object} event.sender - The user who triggered the event
   * @returns {Object} Processed event result
   * 
   * @example
   * const result = handler.handleIssuesEvent({
   *   action: 'opened',
   *   issue: { number: 123, title: '...', body: '...', labels: [...] },
   *   repository: { owner: { login: 'myorg' }, name: 'myrepo' }
   * });
   */
  handleIssuesEvent(event) {
    const { action, issue, repository, sender } = event;

    if (!issue || !repository) {
      return {
        success: false,
        error: 'Missing issue or repository in payload',
        action
      };
    }

    // Build standardized issue event data
    const issueData = {
      eventType: 'issues',
      action,
      issue: {
        number: issue.number,
        title: issue.title,
        body: issue.body,
        html_url: issue.html_url,
        state: issue.state,
        labels: issue.labels || [],
        milestone: issue.milestone,
        user: issue.user,
        assignees: issue.assignees || [],
        created_at: issue.created_at,
        updated_at: issue.updated_at
      },
      repository: {
        owner: repository.owner?.login || repository.owner,
        name: repository.name,
        full_name: repository.full_name
      },
      sender: sender?.login || sender,
      // Dispatch ID format: gh-issue-{owner}-{repo}-{number}
      dispatchId: `gh-issue-${repository.owner?.login || repository.owner}-${repository.name}-${issue.number}`,
      projectId: repository.full_name
    };

    // Handle specific actions
    switch (action) {
      case 'opened':
        return {
          success: true,
          action: 'opened',
          data: issueData,
          needsProcessing: true,
          message: 'New issue created, ready for dispatch'
        };

      case 'edited':
        return {
          success: true,
          action: 'edited',
          data: issueData,
          needsProcessing: true,
          message: 'Issue edited, may need re-dispatch'
        };

      case 'labeled':
        // Check if relevant labels were added
        return {
          success: true,
          action: 'labeled',
          data: issueData,
          needsProcessing: true,
          message: 'Issue labeled, check for role/command labels',
          label: event.label // The label that was added
        };

      default:
        return {
          success: true,
          action,
          data: issueData,
          needsProcessing: false,
          message: `Issues action '${action}' not handled`
        };
    }
  }

  /**
   * Handles GitHub 'issue_comment' event
   * 
   * Processes issue_comment.created events (for user decision responses on escalations).
   * 
   * @param {Object} event - The parsed webhook event payload
   * @param {string} event.action - The action type (created)
   * @param {Object} event.comment - The comment object
   * @param {Object} event.issue - The GitHub issue object
   * @param {Object} event.repository - The repository object
   * @param {Object} event.sender - The user who created the comment
   * @returns {Object} Processed event result
   * 
   * @example
   * const result = handler.handleIssueCommentEvent({
   *   action: 'created',
   *   comment: { id: 456, body: 'I choose option A' },
   *   issue: { number: 123, labels: [{ name: 'escalation:needs-decision' }] },
   *   repository: { owner: { login: 'myorg' }, name: 'myrepo' }
   * });
   */
  handleIssueCommentEvent(event) {
    const { action, comment, issue, repository, sender } = event;

    if (!comment || !issue || !repository) {
      return {
        success: false,
        error: 'Missing comment, issue or repository in payload',
        action
      };
    }

    // Build standardized comment event data
    const commentData = {
      eventType: 'issue_comment',
      action,
      comment: {
        id: comment.id,
        body: comment.body,
        html_url: comment.html_url,
        user: comment.user,
        created_at: comment.created_at
      },
      issue: {
        number: issue.number,
        title: issue.title,
        labels: issue.labels || [],
        state: issue.state,
        html_url: issue.html_url
      },
      repository: {
        owner: repository.owner?.login || repository.owner,
        name: repository.name,
        full_name: repository.full_name
      },
      sender: sender?.login || sender,
      dispatchId: `gh-issue-${repository.owner?.login || repository.owner}-${repository.name}-${issue.number}`,
      projectId: repository.full_name
    };

    // Check if issue has escalation label
    const hasEscalationLabel = issue.labels?.some(
      label => label.name?.startsWith('escalation:')
    );

    return {
      success: true,
      action: 'created',
      data: commentData,
      needsProcessing: hasEscalationLabel,
      isEscalationResponse: hasEscalationLabel,
      message: hasEscalationLabel
        ? 'Comment on escalation issue, may contain user decision'
        : 'Regular comment, no escalation context'
    };
  }

  /**
   * Determines if an event should be processed
   * 
   * Filters based on event type and action according to configuration.
   * 
   * @param {string} event - The event type (issues, issue_comment)
   * @param {string} [action] - The action type (opened, edited, labeled, created, etc.)
   * @returns {boolean} True if the event should be processed
   * 
   * @example
   * // Should process
   * handler.shouldProcessEvent('issues', 'opened') // true
   * handler.shouldProcessEvent('issue_comment', 'created') // true
   * 
   * // Should ignore
   * handler.shouldProcessEvent('issues', 'closed') // false
   * handler.shouldProcessEvent('pull_request', 'opened') // false
   */
  shouldProcessEvent(event, action) {
    // Build event key (e.g., "issues.opened")
    const eventKey = action ? `${event}.${action}` : event;

    // Check if event is in ignore list
    if (this.ignoreEvents.includes(eventKey) || this.ignoreEvents.includes(event)) {
      return false;
    }

    // Check if event is in process list
    if (this.processEvents.includes(eventKey) || this.processEvents.includes(event)) {
      return true;
    }

    // Default: only process known event types (issues, issue_comment)
    const validEventTypes = ['issues', 'issue_comment'];
    if (!validEventTypes.includes(event)) {
      return false;
    }

    // For valid event types without action, check if any action variant is in process list
    const hasProcessableAction = this.processEvents.some(pe => pe.startsWith(`${event}.`));
    return hasProcessableAction && action !== undefined;
  }

  /**
   * Gets the webhook secret from environment variable
   * 
   * @returns {string|null} The webhook secret or null if not set
   */
  getSecretFromEnv() {
    return process.env[this.secretEnvVar] || null;
  }

  /**
   * Gets adapter info for registration
   * 
   * @returns {Object} Handler metadata
   */
  getHandlerInfo() {
    return {
      handlerType: 'WebhookHandler',
      version: '1.0.0',
      supportedEvents: this.processEvents,
      ignoredEvents: this.ignoreEvents,
      signatureAlgorithm: 'HMAC-SHA256',
      securityFeatures: ['constant-time-comparison', 'signature-verification']
    };
  }
}

module.exports = { WebhookHandler, PROCESS_EVENTS, IGNORE_EVENTS };