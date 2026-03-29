/**
 * Result Sender for OpenClaw Orchestrator Adapter
 * 
 * Handles sending execution results to OpenClaw API.
 * Based on spec.md AC-009, AC-010, AC-011 and design.md §2.
 * 
 * @module adapters/openclaw/result-sender
 */

const { ExecutionStatusEnum, RecommendationEnum } = require('./types');

/**
 * Custom error class for OpenClaw API errors
 */
class OpenClawApiError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {string} message - Error message
   * @param {object} [details] - Additional error details
   */
  constructor(status, message, details = null) {
    super(message);
    this.name = 'OpenClawApiError';
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Check if this error is retryable (5xx server errors)
   * @returns {boolean}
   */
  isRetryable() {
    // 5xx errors are retryable
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if this is a rate limit error (429)
   * @returns {boolean}
   */
  isRateLimitError() {
    return this.status === 429;
  }

  /**
   * Check if this is a client error (4xx except 429)
   * @returns {boolean}
   */
  isClientError() {
    return this.status >= 400 && this.status < 500 && this.status !== 429;
  }

  /**
   * Check if this is an authentication/authorization error
   * @returns {boolean}
   */
  isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if this is a timeout error
   * @returns {boolean}
   */
  isTimeoutError() {
    return this.status === 0 || this.message.includes('timeout');
  }
}

/**
 * Result Sender class
 * 
 * Sends execution results to OpenClaw via API callback.
 * Implements retry logic with exponential backoff for server errors.
 */
class ResultSender {
  /**
   * Create a new Result Sender
   * @param {object} openClawClient - OpenClaw HTTP client instance
   * @param {object} config - Configuration object
   * @param {string} [config.apiBaseUrl] - OpenClaw API base URL
   * @param {string} [config.resultEndpoint] - Result endpoint path (default: /api/v1/results)
   * @param {object} [config.retryConfig] - Retry configuration
   * @param {number} [config.retryConfig.maxRetry] - Max retry attempts (default: 3)
   * @param {string} [config.retryConfig.backoffType] - Backoff type (exponential|linear|fixed)
   * @param {number} [config.retryConfig.backoffInitialSeconds] - Initial backoff seconds (default: 60)
   * @param {object} [config.timeoutConfig] - Timeout configuration
   * @param {number} [config.timeoutConfig.requestTimeoutMs] - Request timeout (default: 30000)
   */
  constructor(openClawClient, config = {}) {
    this.client = openClawClient;
    
    this.apiBaseUrl = config.apiBaseUrl || process.env.OPENCLAW_API_URL || '';
    this.resultEndpoint = config.resultEndpoint || '/api/v1/results';
    
    this.retryConfig = {
      maxRetry: config.retryConfig?.max_retry ?? 3,
      backoffType: config.retryConfig?.backoff_type ?? 'exponential',
      backoffInitialSeconds: config.retryConfig?.backoff_initial_seconds ?? 60
    };
    
    this.timeoutConfig = {
      requestTimeoutMs: config.timeoutConfig?.request_timeout_ms ?? 30000
    };
    
    this.retryAttempts = [];
  }

  /**
   * Send execution result to OpenClaw
   * @param {object} executionResult - Execution Result object (io-contract.md §2)
   * @returns {Promise<object>} Send result with status
   * @throws {OpenClawApiError} If send fails after retries exhausted
   */
  async send(executionResult) {
    if (!executionResult?.dispatch_id) {
      throw new OpenClawApiError(0, 'Missing required field: dispatch_id');
    }
    
    const payload = this.formatForResultApi(executionResult);
    const result = await this._sendWithRetry(payload);
    
    return result;
  }

  /**
   * Format Execution Result for OpenClaw API
   * 
   * Transforms ExecutionResult (io-contract.md §2) to OpenClaw API payload.
   * 
   * @param {object} result - Execution Result object
   * @returns {object} API payload
   */
  formatForResultApi(result) {
    const payload = {
      dispatch_id: result.dispatch_id,
      execution_status: this._normalizeStatus(result.status),
      summary: result.summary || '',
      artifacts: this._normalizeArtifacts(result.artifacts || []),
      recommendation: this._normalizeRecommendation(result.recommendation)
    };
    
    if (result.project_id) payload.project_id = result.project_id;
    if (result.milestone_id) payload.milestone_id = result.milestone_id;
    if (result.task_id) payload.task_id = result.task_id;
    if (result.role) payload.role = result.role;
    if (result.command) payload.command = result.command;
    
    if (result.changed_files && result.changed_files.length > 0) {
      payload.changed_files = this._normalizeChangedFiles(result.changed_files);
    }
    
    if (result.checks_performed && result.checks_performed.length > 0) {
      payload.checks_performed = result.checks_performed;
    }
    
    if (result.issues_found && result.issues_found.length > 0) {
      payload.issues_found = this._normalizeIssues(result.issues_found);
    }
    
    if (result.risks && result.risks.length > 0) {
      payload.risks = this._normalizeRisks(result.risks);
    }
    
    if (result.needs_followup) payload.needs_followup = result.needs_followup;
    if (result.followup_suggestions && result.followup_suggestions.length > 0) {
      payload.followup_suggestions = result.followup_suggestions;
    }
    
    if (result.escalation) {
      payload.escalation = this._normalizeEscalation(result.escalation);
    }
    
    payload.timestamp = new Date().toISOString();
    
    return payload;
  }

  /**
   * Handle send error and determine retry decision
   * @param {Error} error - Error from send attempt
   * @param {number} retryCount - Current retry count
   * @returns {object} Retry decision with should_retry, reason, backoff_seconds
   */
  handleSendError(error, retryCount) {
    const apiError = error instanceof OpenClawApiError 
      ? error 
      : new OpenClawApiError(0, error.message);
    
    if (retryCount >= this.retryConfig.maxRetry) {
      return {
        should_retry: false,
        reason: `Max retry (${this.retryConfig.maxRetry}) exceeded`,
        backoff_seconds: 0,
        escalate: true
      };
    }
    
    if (apiError.isClientError()) {
      return {
        should_retry: false,
        reason: `Client error (${apiError.status}) - not retryable`,
        backoff_seconds: 0,
        escalate: apiError.isAuthError()
      };
    }
    
    if (apiError.isRateLimitError()) {
      const backoffSeconds = this._calculateBackoff(retryCount) * 2;
      return {
        should_retry: true,
        reason: 'Rate limit exceeded - retry with extended backoff',
        backoff_seconds: Math.min(backoffSeconds, 3600),
        escalate: false
      };
    }
    
    if (apiError.isRetryable()) {
      return {
        should_retry: true,
        reason: `Server error (${apiError.status}) - retryable`,
        backoff_seconds: this._calculateBackoff(retryCount),
        escalate: false
      };
    }
    
    if (apiError.isTimeoutError()) {
      return {
        should_retry: true,
        reason: 'Timeout error - retryable',
        backoff_seconds: this._calculateBackoff(retryCount),
        escalate: false
      };
    }
    
    return {
      should_retry: false,
      reason: `Unknown error: ${apiError.message}`,
      backoff_seconds: 0,
      escalate: true
    };
  }

  /**
   * Send payload with retry logic
   * @param {object} payload - API payload
   * @returns {Promise<object>} Send result
   * @private
   */
  async _sendWithRetry(payload) {
    let retryCount = 0;
    this.retryAttempts = [];
    
    while (retryCount <= this.retryConfig.maxRetry) {
      try {
        const response = await this._doSend(payload);
        
        return {
          success: true,
          dispatch_id: payload.dispatch_id,
          response: response,
          retry_count: retryCount,
          attempts: this.retryAttempts.length + 1
        };
        
      } catch (error) {
        const decision = this.handleSendError(error, retryCount);
        
        this.retryAttempts.push({
          attempt: retryCount + 1,
          error: error.message,
          status: error.status || 0,
          decision: decision.reason,
          timestamp: new Date().toISOString()
        });
        
        if (!decision.should_retry) {
          const finalError = error instanceof OpenClawApiError 
            ? error 
            : new OpenClawApiError(0, error.message);
          finalError.retryAttempts = this.retryAttempts;
          finalError.escalate = decision.escalate;
          throw finalError;
        }
        
        await this._sleep(decision.backoff_seconds * 1000);
        retryCount++;
      }
    }
    
    throw new OpenClawApiError(0, `Max retries (${this.retryConfig.maxRetry}) exceeded`, {
      retryAttempts: this.retryAttempts
    });
  }

  /**
   * Execute the actual HTTP send
   * @param {object} payload - API payload
   * @returns {Promise<object>} API response
   * @private
   */
  async _doSend(payload) {
    const url = this._buildUrl(this.resultEndpoint);
    
    if (this.client && typeof this.client.post === 'function') {
      return await this.client.post(url, payload, {
        timeout: this.timeoutConfig.requestTimeoutMs
      });
    }
    
    return await this._nativePost(url, payload);
  }

  /**
   * Build full URL from endpoint
   * @param {string} endpoint - API endpoint path
   * @returns {string} Full URL
   * @private
   */
  _buildUrl(endpoint) {
    if (!this.apiBaseUrl) {
      throw new OpenClawApiError(0, 'OpenClaw API URL not configured');
    }
    
    const baseUrl = this.apiBaseUrl.endsWith('/') 
      ? this.apiBaseUrl.slice(0, -1) 
      : this.apiBaseUrl;
    const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    
    return baseUrl + path;
  }

  /**
   * Native HTTP POST (fallback)
   * @param {string} url - Full URL
   * @param {object} payload - Request payload
   * @returns {Promise<object>} Response
   * @private
   */
  async _nativePost(url, payload) {
    const https = require('https');
    const http = require('http');
    
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      method: 'POST',
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: this.timeoutConfig.requestTimeoutMs
    };
    
    // Add auth header if client has token
    if (this.client && this.client.token) {
      requestOptions.headers['Authorization'] = `Bearer ${this.client.token}`;
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
              resolve(body ? JSON.parse(body) : { success: true });
            } catch (e) {
              resolve({ success: true, raw: body });
            }
          } else {
            let errorData;
            try {
              errorData = JSON.parse(body);
            } catch (e) {
              errorData = { message: body };
            }
            
            reject(new OpenClawApiError(
              res.statusCode,
              errorData.message || `HTTP ${res.statusCode}`,
              errorData
            ));
          }
        });
      });
      
      req.on('error', (e) => {
        reject(new OpenClawApiError(0, `Network error: ${e.message}`));
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new OpenClawApiError(0, 'Request timeout'));
      });
      
      req.write(JSON.stringify(payload));
      req.end();
    });
  }

  /**
   * Calculate backoff duration
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
          3600
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
   * Normalize execution status for API
   * @param {string} status - Status value
   * @returns {string} Normalized status
   * @private
   */
  _normalizeStatus(status) {
    const validStatuses = Object.values(ExecutionStatusEnum);
    if (validStatuses.includes(status)) {
      return status;
    }
    return ExecutionStatusEnum.FAILED_RETRYABLE;
  }

  /**
   * Normalize recommendation for API
   * @param {string} recommendation - Recommendation value
   * @returns {string} Normalized recommendation
   * @private
   */
  _normalizeRecommendation(recommendation) {
    const validRecommendations = Object.values(RecommendationEnum);
    if (recommendation && validRecommendations.includes(recommendation)) {
      return recommendation;
    }
    return RecommendationEnum.CONTINUE;
  }

  /**
   * Normalize artifacts array for API
   * @param {Array} artifacts - Artifacts array
   * @returns {Array} Normalized artifacts
   * @private
   */
  _normalizeArtifacts(artifacts) {
    return artifacts.map(artifact => ({
      artifact_id: artifact.artifact_id || '',
      artifact_type: artifact.artifact_type || '',
      path: artifact.path || '',
      content_hash: artifact.content_hash || null,
      summary: artifact.summary || ''
    }));
  }

  /**
   * Normalize changed files for API
   * @param {Array} changedFiles - Changed files array
   * @returns {Array} Normalized changed files
   * @private
   */
  _normalizeChangedFiles(changedFiles) {
    return changedFiles.map(file => ({
      path: file.path || '',
      change_type: file.change_type || 'modified',
      lines_added: file.lines_added || 0,
      lines_removed: file.lines_removed || 0
    }));
  }

  /**
   * Normalize issues for API
   * @param {Array} issues - Issues array
   * @returns {Array} Normalized issues
   * @private
   */
  _normalizeIssues(issues) {
    return issues.map(issue => ({
      issue_id: issue.issue_id || '',
      severity: issue.severity || 'info',
      message: issue.message || '',
      location: issue.location || null
    }));
  }

  /**
   * Normalize risks for API
   * @param {Array} risks - Risks array
   * @returns {Array} Normalized risks
   * @private
   */
  _normalizeRisks(risks) {
    return risks.map(risk => ({
      risk_id: risk.risk_id || '',
      level: risk.level || 'low',
      description: risk.description || '',
      mitigation: risk.mitigation || null
    }));
  }

  /**
   * Normalize escalation for API
   * @param {object} escalation - Escalation object
   * @returns {object} Normalized escalation
   * @private
   */
  _normalizeEscalation(escalation) {
    return {
      escalation_id: escalation.escalation_id || '',
      dispatch_id: escalation.dispatch_id || '',
      project_id: escalation.project_id || '',
      milestone_id: escalation.milestone_id || '',
      task_id: escalation.task_id || '',
      role: escalation.role || '',
      level: escalation.level || 'INTERNAL',
      reason_type: escalation.reason_type || '',
      summary: escalation.summary || '',
      blocking_points: escalation.blocking_points || [],
      evidence: escalation.evidence || {
        related_artifacts: [],
        logs: [],
        failure_history: []
      },
      attempted_actions: escalation.attempted_actions || [],
      recommended_next_steps: escalation.recommended_next_steps || [],
      options: (escalation.options || []).map(opt => ({
        option_id: opt.option_id || '',
        description: opt.description || '',
        pros: opt.pros || [],
        cons: opt.cons || []
      })),
      recommended_option: escalation.recommended_option || '',
      required_decision: escalation.required_decision || '',
      impact_if_continue: escalation.impact_if_continue || '',
      impact_if_stop: escalation.impact_if_stop || '',
      requires_user_decision: escalation.requires_user_decision ?? true,
      requires_acknowledgment: escalation.requires_acknowledgment ?? true,
      created_at: escalation.created_at || new Date().toISOString(),
      created_by: escalation.created_by || ''
    };
  }

  /**
   * Get retry attempt history
   * @returns {Array} Retry attempts
   */
  getRetryAttempts() {
    return [...this.retryAttempts];
  }

  /**
   * Get last retry attempt
   * @returns {object|null} Last retry attempt or null
   */
  getLastRetryAttempt() {
    return this.retryAttempts.length > 0 
      ? this.retryAttempts[this.retryAttempts.length - 1] 
      : null;
  }
}

module.exports = { ResultSender, OpenClawApiError };