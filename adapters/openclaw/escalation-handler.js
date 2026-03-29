/**
 * Escalation Handler for OpenClaw Orchestrator Adapter
 * 
 * Handles sending escalation requests to OpenClaw API and processing responses.
 * Based on spec.md AC-012, AC-013, AC-014 and plan.md §3.4.
 * 
 * @module adapters/openclaw/escalation-handler
 */

const {
  Escalation,
  EscalationEvidence,
  EscalationOption,
  EscalationResponse,
  EscalationLevelEnum,
  EscalationResponseStatusEnum,
  RoleEnum,
  RiskLevelEnum
} = require('./types');

/**
 * Custom error class for escalation-specific errors
 */
class EscalationError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {object} [details] - Additional error details
   */
  constructor(message, code, details = null) {
    super(message);
    this.name = 'EscalationError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Check if this is a timeout error
   * @returns {boolean}
   */
  isTimeoutError() {
    return this.code === 'DECISION_TIMEOUT';
  }

  /**
   * Check if this is an abort error
   * @returns {boolean}
   */
  isAbortError() {
    return this.code === 'EXECUTION_ABORTED';
  }

  /**
   * Check if this is a network error
   * @returns {boolean}
   */
  isNetworkError() {
    return this.code === 'NETWORK_ERROR';
  }
}

/**
 * Decision pending state for escalation callback handling
 * 
 * Stores pending decisions that will be resolved when OpenClaw
 * sends a decision callback via the /decision endpoint.
 */
class DecisionPending {
  constructor(escalationId, maxWaitMs = 300000) {
    this.escalationId = escalationId;
    this.createdAt = Date.now();
    this.maxWaitMs = maxWaitMs;
    this.resolved = false;
    this.decision = null;
    this.nextAction = null;
    this.status = null;
    this._resolveCallbacks = [];
  }

  /**
   * Check if decision wait has timed out
   * @returns {boolean}
   */
  isTimedOut() {
    return Date.now() - this.createdAt > this.maxWaitMs;
  }

  /**
   * Resolve the pending decision
   * @param {object} response - Decision response
   */
  resolve(response) {
    this.resolved = true;
    this.status = response.status;
    this.decision = response.decision;
    this.nextAction = response.next_action;
    
    // Notify all waiting callbacks
    this._resolveCallbacks.forEach(cb => cb(response));
    this._resolveCallbacks = [];
  }

  /**
   * Wait for decision resolution
   * @returns {Promise<object>}
   */
  waitForResolution() {
    if (this.resolved) {
      return Promise.resolve({
        status: this.status,
        decision: this.decision,
        next_action: this.nextAction
      });
    }

    if (this.isTimedOut()) {
      return Promise.reject(new EscalationError(
        'Decision wait timed out',
        'DECISION_TIMEOUT',
        { escalationId: this.escalationId, waitedMs: Date.now() - this.createdAt }
      ));
    }

    return new Promise((resolve, reject) => {
      // Set up timeout
      const remainingMs = this.maxWaitMs - (Date.now() - this.createdAt);
      const timeout = setTimeout(() => {
        reject(new EscalationError(
          'Decision wait timed out',
          'DECISION_TIMEOUT',
          { escalationId: this.escalationId, waitedMs: this.maxWaitMs }
        ));
      }, remainingMs);

      // Add resolve callback
      this._resolveCallbacks.push((response) => {
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }
}

/**
 * Escalation Handler class
 * 
 * Sends escalation requests to OpenClaw and processes responses.
 * Handles the escalation flow:
 * - Send escalation to OpenClaw API
 * - Handle immediate response (acknowledged, decision_made, escalate_further, abort)
 * - Wait for decision callback if acknowledged
 */
class EscalationHandler {
  /**
   * Create a new Escalation Handler
   * @param {object} openClawClient - OpenClaw HTTP client instance
   * @param {object} config - Configuration object
   * @param {string} [config.escalationEndpoint] - Escalation endpoint path (default: /api/v1/escalations)
   * @param {object} [config.timeoutConfig] - Timeout configuration
   * @param {number} [config.timeoutConfig.maxWaitForDecisionMs] - Max wait for decision (default: 300000 = 5 min)
   * @param {object} [config.retryConfig] - Retry configuration for send failures
   */
  constructor(openClawClient, config = {}) {
    this.client = openClawClient;
    
    // Configuration
    this.escalationEndpoint = config.escalationEndpoint || '/api/v1/escalations';
    this.maxWaitForDecisionMs = config.timeoutConfig?.max_wait_for_decision_ms || 300000; // 5 minutes
    
    // Retry configuration
    this.retryConfig = {
      maxRetry: config.retryConfig?.max_retry ?? 3,
      backoffType: config.retryConfig?.backoff_type ?? 'exponential',
      backoffInitialSeconds: config.retryConfig?.backoff_initial_seconds ?? 60
    };
    
    // Pending decisions registry
    this._pendingDecisions = new Map();
    
    // Escalation history for tracking
    this._escalationHistory = [];
  }

  /**
   * Send escalation request to OpenClaw
   * @param {object} escalationContext - Escalation context from execution
   * @returns {Promise<object>} Send result with response
   * @throws {EscalationError} If send fails or execution aborted
   */
  async send(escalationContext) {
    // Validate context
    if (!escalationContext) {
      throw new EscalationError('Missing escalation context', 'INVALID_CONTEXT');
    }

    // Generate escalation object
    const escalation = this.formatForEscalationApi(escalationContext);
    
    // Store escalation ID before sending
    const escalationId = escalation.escalation_id;

    // Send to OpenClaw
    const response = await this._sendWithRetry(escalation);
    
    // Track in history
    this._escalationHistory.push({
      escalation_id: escalationId,
      sent_at: new Date().toISOString(),
      context_summary: escalationContext.summary || '',
      response_status: response.status
    });

    // Handle response
    const result = this.handleResponse(response, escalationId);
    
    return result;
  }

  /**
   * Generate unique escalation ID
   * Format: esc-{timestamp}-{random}
   * @returns {string} Unique escalation ID
   */
  generateEscalationId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `esc-${timestamp}-${random}`;
  }

  /**
   * Format escalation context for OpenClaw API
   * 
   * Transforms escalation context to Escalation schema (io-contract.md §4).
   * 
   * @param {object} context - Escalation context
   * @param {string} context.dispatch_id - Dispatch ID
   * @param {string} context.project_id - Project ID
   * @param {string} context.milestone_id - Milestone ID
   * @param {string} context.task_id - Task ID
   * @param {string} context.role - Role executing
   * @param {string} context.reason_type - Type of reason for escalation
   * @param {string} context.summary - Summary of escalation
   * @param {string[]} context.blocking_points - Points blocking execution
   * @param {object} [context.evidence] - Escalation evidence
   * @param {string[]} [context.attempted_actions] - Actions already attempted
   * @param {string[]} [context.recommended_next_steps] - Recommended next steps
   * @param {object[]} [context.options] - Escalation options
   * @param {string} [context.recommended_option] - Recommended option ID
   * @param {string} [context.required_decision] - Decision required
   * @param {string} [context.impact_if_continue] - Impact if continuing
   * @param {string} [context.impact_if_stop] - Impact if stopping
   * @param {boolean} [context.requires_user_decision] - Requires user decision
   * @param {string} [context.level] - Escalation level (INTERNAL or USER)
   * @returns {object} Escalation object per io-contract.md §4
   */
  formatForEscalationApi(context) {
    const escalationId = context.escalation_id || this.generateEscalationId();
    const now = new Date().toISOString();
    
    const escalation = {
      escalation_id: escalationId,
      dispatch_id: context.dispatch_id || '',
      project_id: context.project_id || '',
      milestone_id: context.milestone_id || '',
      task_id: context.task_id || '',
      role: this._validateRole(context.role),
      level: this._validateLevel(context.level),
      reason_type: context.reason_type || '',
      summary: context.summary || '',
      blocking_points: context.blocking_points || [],
      evidence: this._normalizeEvidence(context.evidence),
      attempted_actions: context.attempted_actions || [],
      recommended_next_steps: context.recommended_next_steps || [],
      options: this._normalizeOptions(context.options),
      recommended_option: context.recommended_option || '',
      required_decision: context.required_decision || '',
      impact_if_continue: context.impact_if_continue || '',
      impact_if_stop: context.impact_if_stop || '',
      requires_user_decision: context.requires_user_decision ?? true,
      requires_acknowledgment: context.requires_acknowledgment ?? true,
      created_at: now,
      created_by: context.created_by || 'openclaw-adapter'
    };
    
    return escalation;
  }

  /**
   * Handle OpenClaw escalation response
   * 
   * Response handling per plan.md §3.4:
   * - 'acknowledged' → wait for decision callback
   * - 'decision_made' → continue with provided decision
   * - 'escalate_further' → mark as USER level escalation
   * - 'abort' → stop execution, return BLOCKED status
   * 
   * @param {object} response - OpenClaw response
   * @param {string} response.status - Response status (EscalationResponseStatusEnum)
   * @param {string} [response.decision] - Decision if status is decision_made
   * @param {string} [response.next_action] - Next action to take
   * @param {string} [response.timestamp] - Response timestamp
   * @param {string} escalationId - Escalation ID for pending decision tracking
   * @returns {object} Handling result with action to take
   */
  handleResponse(response, escalationId) {
    const status = response.status;
    const validStatuses = Object.values(EscalationResponseStatusEnum);
    
    if (!validStatuses.includes(status)) {
      throw new EscalationError(
        `Invalid response status: ${status}`,
        'INVALID_RESPONSE',
        { validStatuses, response }
      );
    }

    const result = {
      escalation_id: escalationId,
      response_status: status,
      timestamp: response.timestamp || new Date().toISOString()
    };

    switch (status) {
      case EscalationResponseStatusEnum.ACKNOWLEDGED:
        // OpenClaw acknowledged, waiting for decision callback
        result.action = 'wait_for_decision';
        result.pending = true;
        
        // Create pending decision entry for callback resolution
        const pending = new DecisionPending(escalationId, this.maxWaitForDecisionMs);
        this._pendingDecisions.set(escalationId, pending);
        
        result.waitForDecision = () => this.waitForDecision(escalationId);
        break;

      case EscalationResponseStatusEnum.DECISION_MADE:
        // OpenClaw provided immediate decision
        result.action = 'continue_with_decision';
        result.decision = response.decision;
        result.next_action = response.next_action;
        result.pending = false;
        break;

      case EscalationResponseStatusEnum.ESCALATE_FURTHER:
        // OpenClaw requests escalation to USER level
        result.action = 'escalate_to_user';
        result.level = EscalationLevelEnum.USER;
        result.pending = false;
        
        // Clear any pending decision for this escalation
        this._pendingDecisions.delete(escalationId);
        break;

      case EscalationResponseStatusEnum.ABORT:
        // OpenClaw requests execution abort
        result.action = 'abort_execution';
        result.pending = false;
        
        // Clear any pending decision for this escalation
        this._pendingDecisions.delete(escalationId);
        
        // Return abort result (not throwing, caller decides how to handle)
        result.aborted = true;
        break;

      default:
        throw new EscalationError(
          `Unhandled response status: ${status}`,
          'UNHANDLED_STATUS',
          { response }
        );
    }

    return result;
  }

  /**
   * Wait for OpenClaw decision callback
   * 
   * Waits up to maxWaitMs (default 5 minutes) for OpenClaw to send
   * a decision via the /decision endpoint.
   * 
   * @param {string} escalationId - Escalation ID to wait for
   * @param {number} [maxWaitMs] - Maximum wait time (default from config)
   * @returns {Promise<object>} Decision response
   * @throws {EscalationError} If timeout or escalation not found
   */
  async waitForDecision(escalationId, maxWaitMs = null) {
    const pending = this._pendingDecisions.get(escalationId);
    
    if (!pending) {
      throw new EscalationError(
        `No pending decision for escalation: ${escalationId}`,
        'NO_PENDING_DECISION',
        { escalationId }
      );
    }

    // Update max wait if provided
    if (maxWaitMs !== null) {
      pending.maxWaitMs = maxWaitMs;
    }

    try {
      const response = await pending.waitForResolution();
      
      // Clean up pending decision
      this._pendingDecisions.delete(escalationId);
      
      return {
        escalation_id: escalationId,
        decision: response.decision,
        next_action: response.next_action,
        status: response.status,
        resolved_at: new Date().toISOString()
      };
    } catch (error) {
      // Clean up on timeout
      this._pendingDecisions.delete(escalationId);
      throw error;
    }
  }

  /**
   * Receive decision callback from OpenClaw
   * 
   * Called by the adapter when OpenClaw sends a decision via /decision endpoint.
   * Resolves the pending decision wait.
   * 
   * @param {object} decisionPayload - Decision payload from OpenClaw
   * @param {string} decisionPayload.escalation_id - Escalation ID
   * @param {string} decisionPayload.status - Decision status
   * @param {string} decisionPayload.decision - Decision made
   * @param {string} decisionPayload.next_action - Next action
   * @returns {boolean} True if decision was resolved, false if not pending
   */
  receiveDecision(decisionPayload) {
    const escalationId = decisionPayload.escalation_id;
    const pending = this._pendingDecisions.get(escalationId);
    
    if (!pending) {
      // No pending decision - could be already resolved or unknown escalation
      return false;
    }

    // Resolve the pending decision
    pending.resolve({
      status: decisionPayload.status,
      decision: decisionPayload.decision,
      next_action: decisionPayload.next_action,
      timestamp: decisionPayload.timestamp || new Date().toISOString()
    });

    return true;
  }

  /**
   * Check if there are pending decisions
   * @returns {boolean}
   */
  hasPendingDecisions() {
    return this._pendingDecisions.size > 0;
  }

  /**
   * Get all pending escalation IDs
   * @returns {string[]}
   */
  getPendingEscalationIds() {
    return Array.from(this._pendingDecisions.keys());
  }

  /**
   * Get escalation history
   * @returns {object[]}
   */
  getEscalationHistory() {
    return [...this._escalationHistory];
  }

  /**
   * Clear escalation history
   */
  clearHistory() {
    this._escalationHistory = [];
  }

  // ============================================================
  // Private Methods
  // ============================================================

  /**
   * Send escalation with retry logic
   * @param {object} escalation - Escalation payload
   * @returns {Promise<object>} API response
   * @private
   */
  async _sendWithRetry(escalation) {
    let retryCount = 0;
    const maxRetry = this.retryConfig.maxRetry;

    while (retryCount <= maxRetry) {
      try {
        const response = await this._doSend(escalation);
        return response;
      } catch (error) {
        // Don't retry on success responses
        if (error.status >= 200 && error.status < 300) {
          throw error;
        }

        // Don't retry on client errors (4xx except 429)
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw new EscalationError(
            `Escalation send failed: ${error.message}`,
            'CLIENT_ERROR',
            { status: error.status, escalation }
          );
        }

        // Retry on retryable errors (5xx, 429, network)
        if (retryCount < maxRetry) {
          const backoffSeconds = this._calculateBackoff(retryCount);
          await this._sleep(backoffSeconds * 1000);
          retryCount++;
          continue;
        }

        throw new EscalationError(
          `Escalation send failed after ${maxRetry} retries: ${error.message}`,
          'SEND_FAILED',
          { retryCount, escalation }
        );
      }
    }
  }

  /**
   * Execute the actual HTTP send
   * @param {object} escalation - Escalation payload
   * @returns {Promise<object>} API response
   * @private
   */
  async _doSend(escalation) {
    // Use OpenClawClient's postEscalation method
    if (this.client && typeof this.client.postEscalation === 'function') {
      return await this.client.postEscalation(escalation);
    }

    // Fallback to generic post method
    if (this.client && typeof this.client.post === 'function') {
      return await this.client.post(this.escalationEndpoint, escalation);
    }

    // Fallback to native HTTP
    return await this._nativePost(escalation);
  }

  /**
   * Native HTTP POST fallback
   * @param {object} escalation - Escalation payload
   * @returns {Promise<object>} API response
   * @private
   */
  async _nativePost(escalation) {
    const https = require('https');
    const http = require('http');

    const apiBaseUrl = this.client?.apiBaseUrl || process.env.OPENCLAW_API_URL;
    if (!apiBaseUrl) {
      throw new EscalationError('OpenClaw API URL not configured', 'NO_API_URL');
    }

    const url = new URL(this.escalationEndpoint, apiBaseUrl);
    const protocol = url.protocol === 'https:' ? https : http;

    const requestOptions = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    };

    // Add auth header if available
    if (this.client?.token) {
      requestOptions.headers['Authorization'] = `Bearer ${this.client.token}`;
    } else if (this.client?.apiKey) {
      requestOptions.headers['Authorization'] = `ApiKey ${this.client.apiKey}`;
    }

    return new Promise((resolve, reject) => {
      const req = protocol.request(requestOptions, (res) => {
        let body = '';
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(body ? JSON.parse(body) : { status: 'acknowledged' });
            } catch (e) {
              resolve({ status: 'acknowledged', raw: body });
            }
          } else {
            let errorData;
            try {
              errorData = JSON.parse(body);
            } catch (e) {
              errorData = { message: body };
            }

            const error = new Error(errorData.message || `HTTP ${res.statusCode}`);
            error.status = res.statusCode;
            reject(error);
          }
        });
      });

      req.on('error', (e) => {
        const error = new Error(`Network error: ${e.message}`);
        error.status = 0;
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        const error = new Error('Request timeout');
        error.status = 0;
        reject(error);
      });

      req.write(JSON.stringify(escalation));
      req.end();
    });
  }

  /**
   * Calculate backoff duration for retries
   * @param {number} retryCount - Retry count
   * @returns {number} Backoff in seconds
   * @private
   */
  _calculateBackoff(retryCount) {
    const { backoffType, backoffInitialSeconds } = this.retryConfig;

    switch (backoffType) {
      case 'exponential':
        return Math.min(
          backoffInitialSeconds * Math.pow(2, retryCount),
          3600 // Max 1 hour
        );

      case 'linear':
        return Math.min(
          backoffInitialSeconds * (retryCount + 1),
          3600
        );

      case 'fixed':
        return backoffInitialSeconds;

      default:
        return backoffInitialSeconds;
    }
  }

  /**
   * Sleep for specified duration
   * @param {number} ms - Milliseconds
   * @returns {Promise<void>}
   * @private
   */
  async _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate and normalize role
   * @param {string} role - Role value
   * @returns {string} Validated role
   * @private
   */
  _validateRole(role) {
    const validRoles = Object.values(RoleEnum);
    if (role && validRoles.includes(role)) {
      return role;
    }
    // Default to developer if invalid
    return RoleEnum.DEVELOPER;
  }

  /**
   * Validate and normalize escalation level
   * @param {string} level - Level value
   * @returns {string} Validated level
   * @private
   */
  _validateLevel(level) {
    const validLevels = Object.values(EscalationLevelEnum);
    if (level && validLevels.includes(level)) {
      return level;
    }
    // Default to INTERNAL
    return EscalationLevelEnum.INTERNAL;
  }

  /**
   * Normalize evidence object
   * @param {object} evidence - Evidence object
   * @returns {object} Normalized evidence
   * @private
   */
  _normalizeEvidence(evidence) {
    if (!evidence) {
      return {
        related_artifacts: [],
        logs: [],
        failure_history: []
      };
    }

    return {
      related_artifacts: evidence.related_artifacts || [],
      logs: evidence.logs || [],
      failure_history: evidence.failure_history || []
    };
  }

  /**
   * Normalize options array
   * @param {object[]} options - Options array
   * @returns {object[]} Normalized options
   * @private
   */
  _normalizeOptions(options) {
    if (!options || !Array.isArray(options)) {
      return [];
    }

    return options.map((opt, index) => ({
      option_id: opt.option_id || `opt-${index + 1}`,
      description: opt.description || '',
      pros: opt.pros || [],
      cons: opt.cons || []
    }));
  }
}

module.exports = { EscalationHandler, EscalationError, DecisionPending };