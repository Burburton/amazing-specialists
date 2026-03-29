/**
 * OpenClaw Client for OpenClaw Orchestrator Adapter
 * 
 * HTTP client for OpenClaw API operations.
 * Reference: specs/023-openclaw-adapter/spec.md
 * 
 * Features:
 * - JWT/API key authentication
 * - Connection pooling with keep-alive
 * - Timeout handling (5s connection, 30s request)
 * - HTTP-level retry for network errors
 * - API methods: postResult, postEscalation, postRetryLog, postHeartbeat
 */

const https = require('https');
const http = require('http');

/**
 * Custom error class for OpenClaw API errors
 */
class OpenClawApiError extends Error {
  constructor(status, message, code = null, details = null) {
    super(message);
    this.name = 'OpenClawApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /**
   * Check if this error is retryable
   * @returns {boolean}
   */
  isRetryable() {
    // 500 Server Error is retryable
    // 502, 503, 504 Gateway errors are retryable
    // 408 Request Timeout is retryable
    // 429 Rate Limit is retryable
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(this.status);
  }

  /**
   * Check if this is an authentication error
   * @returns {boolean}
   */
  isAuthError() {
    // 401 Unauthorized, 403 Forbidden
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if this is a not found error
   * @returns {boolean}
   */
  isNotFoundError() {
    return this.status === 404;
  }

  /**
   * Check if this is a validation error
   * @returns {boolean}
   */
  isValidationError() {
    return this.status === 400 || this.status === 422;
  }

  /**
   * Check if this is a rate limit error
   * @returns {boolean}
   */
  isRateLimitError() {
    return this.status === 429;
  }
}

/**
 * OpenClaw Client class
 * 
 * Provides methods for interacting with OpenClaw API.
 */
class OpenClawClient {
  /**
   * Create a new OpenClaw Client
   * @param {Object} config - Configuration object
   * @param {string} [config.apiBaseUrl] - API base URL (defaults to env OPENCLAW_API_URL or http://localhost:3000)
   * @param {string} [config.token] - JWT token (defaults to env OPENCLAW_JWT_TOKEN)
   * @param {string} [config.apiKey] - API key for development
   * @param {Object} [config.endpoints] - API endpoints override
   * @param {Object} [config.timeoutConfig] - Timeout configuration
   * @param {Object} [config.retryConfig] - Retry configuration
   * @param {number} [config.connectionTimeoutMs] - Connection timeout (default: 5000)
   * @param {number} [config.requestTimeoutMs] - Request timeout (default: 30000)
   * @param {number} [config.maxRetries] - Max retry attempts (default: 3)
   * @param {number} [config.backoffInitialMs] - Initial backoff in ms (default: 1000)
   */
  constructor(config = {}) {
    // API configuration
    this.apiBaseUrl = config.apiBaseUrl || process.env.OPENCLAW_API_URL || 'http://localhost:3000';
    
    // Authentication
    this.token = config.token || process.env.OPENCLAW_JWT_TOKEN || null;
    this.apiKey = config.apiKey || process.env.OPENCLAW_API_KEY || null;
    
    // Endpoints from config or defaults
    this.endpoints = {
      result: '/api/v1/results',
      escalation: '/api/v1/escalations',
      retry: '/api/v1/retries',
      heartbeat: '/api/v1/heartbeat'
    };
    
    if (config.endpoints) {
      this.endpoints = { ...this.endpoints, ...config.endpoints };
    }
    
    // Timeout configuration
    this.connectionTimeoutMs = config.connectionTimeoutMs || 
      config.timeoutConfig?.connection_timeout_ms || 5000;
    this.requestTimeoutMs = config.requestTimeoutMs || 
      config.timeoutConfig?.request_timeout_ms || 30000;
    
    // Retry configuration
    this.maxRetries = config.maxRetries || config.retryConfig?.max_retry || 3;
    this.backoffInitialMs = config.backoffInitialMs || 
      (config.retryConfig?.backoff_initial_seconds || 1) * 1000;
    this.backoffMultiplier = 2;
    this.maxBackoffMs = 30000; // Maximum 30 seconds backoff
    
    // Rate limit tracking
    this.rateLimitInfo = {
      limit: null,
      remaining: null,
      reset: null,
      lastRequestTime: null
    };
    
    // Token metadata for refresh logic
    this.tokenExpiry = null;
    this.refreshThresholdMs = config.refreshThresholdMs || 300000; // 5 minutes
    
    // Connection pool for keep-alive
    this._initConnectionPool();
    
    // Validate authentication
    if (!this.token && !this.apiKey) {
      console.warn('OpenClawClient: No authentication provided. Set OPENCLAW_JWT_TOKEN or OPENCLAW_API_KEY.');
    }
  }

  /**
   * Initialize connection pool with keep-alive
   * @private
   */
  _initConnectionPool() {
    // Create agent for connection pooling
    const maxSockets = 10;
    const keepAliveTimeout = 60000; // 60 seconds
    
    this.httpsAgent = new https.Agent({
      keepAlive: true,
      maxSockets: maxSockets,
      maxFreeSockets: 5,
      timeout: this.connectionTimeoutMs,
      keepAliveMsecs: keepAliveTimeout
    });
    
    this.httpAgent = new http.Agent({
      keepAlive: true,
      maxSockets: maxSockets,
      maxFreeSockets: 5,
      timeout: this.connectionTimeoutMs,
      keepAliveMsecs: keepAliveTimeout
    });
  }

  /**
   * Parse API URL into components
   * @param {string} apiUrl - Full API URL or path
   * @returns {Object} URL components
   * @private
   */
  _parseUrl(apiUrl) {
    // If it's a relative path, prepend base URL
    if (!apiUrl.startsWith('http')) {
      apiUrl = this.apiBaseUrl + apiUrl;
    }
    
    const parsed = new URL(apiUrl);
    return {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search
    };
  }

  /**
   * Get authentication header value
   * @returns {string|null} Authorization header value
   * @private
   */
  _getAuthHeader() {
    if (this.token) {
      return `Bearer ${this.token}`;
    }
    if (this.apiKey) {
      return `ApiKey ${this.apiKey}`;
    }
    return null;
  }

  /**
   * Make an HTTP request to OpenClaw API
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {string} path - API endpoint path
   * @param {Object} [data] - Request body data
   * @returns {Promise<Object>} Response data
   * @private
   */
  async _request(method, path, data = null) {
    const urlParts = this._parseUrl(path);
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    // Add authorization header if available
    const authHeader = this._getAuthHeader();
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Add data length header if data provided
    if (data) {
      headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }
    
    const requestOptions = {
      method: method,
      hostname: urlParts.hostname,
      port: urlParts.port,
      path: urlParts.path,
      headers: headers,
      timeout: this.requestTimeoutMs,
      agent: urlParts.protocol === 'https:' ? this.httpsAgent : this.httpAgent
    };
    
    return new Promise((resolve, reject) => {
      const protocol = urlParts.protocol === 'https:' ? https : http;
      
      // Connection timeout handler
      const connectionTimer = setTimeout(() => {
        req.destroy(new OpenClawApiError(0, 'Connection timeout'));
      }, this.connectionTimeoutMs);
      
      const req = protocol.request(requestOptions, (res) => {
        clearTimeout(connectionTimer);
        
        // Update rate limit info from headers
        this._updateRateLimitFromHeaders(res.headers);
        
        let body = '';
        res.setEncoding('utf8');
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          // Handle successful responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const responseData = body ? JSON.parse(body) : {};
              resolve(responseData);
            } catch (e) {
              // Return empty object for non-JSON responses
              resolve({});
            }
          } 
          // Handle error responses
          else {
            let errorData;
            try {
              errorData = JSON.parse(body);
            } catch (e) {
              errorData = { message: body || 'Unknown error' };
            }
            
            const error = new OpenClawApiError(
              res.statusCode,
              errorData.message || errorData.error || `HTTP ${res.statusCode}`,
              errorData.code || null,
              errorData.details || null
            );
            
            reject(error);
          }
        });
      });
      
      req.on('error', (e) => {
        clearTimeout(connectionTimer);
        
        // Handle timeout error
        if (e.code === 'ETIMEDOUT' || e.code === 'ESOCKETTIMEDOUT') {
          reject(new OpenClawApiError(408, `Request timeout: ${e.message}`));
        } else {
          reject(new OpenClawApiError(0, `Network error: ${e.message}`));
        }
      });
      
      req.on('socket', (socket) => {
        socket.on('connect', () => {
          clearTimeout(connectionTimer);
        });
      });
      
      // Write request body if provided
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  /**
   * Update rate limit info from response headers
   * @param {Object} headers - HTTP response headers
   * @private
   */
  _updateRateLimitFromHeaders(headers) {
    const limit = headers['x-ratelimit-limit'];
    const remaining = headers['x-ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'];
    
    if (limit) this.rateLimitInfo.limit = parseInt(limit, 10);
    if (remaining) this.rateLimitInfo.remaining = parseInt(remaining, 10);
    if (reset) this.rateLimitInfo.reset = parseInt(reset, 10) * 1000;
    
    this.rateLimitInfo.lastRequestTime = Date.now();
    
    // Log warning if approaching rate limit
    if (this.rateLimitInfo.remaining !== null && 
        this.rateLimitInfo.limit !== null &&
        this.rateLimitInfo.remaining < this.rateLimitInfo.limit * 0.1) {
      console.warn(`OpenClawClient: Rate limit warning - ${this.rateLimitInfo.remaining} requests remaining`);
    }
  }

  /**
   * Calculate backoff time for retries
   * @param {number} retryCount - Number of retries attempted
   * @returns {number} Backoff time in milliseconds
   * @private
   */
  _calculateBackoff(retryCount) {
    const backoffMs = Math.min(
      this.backoffInitialMs * Math.pow(this.backoffMultiplier, retryCount),
      this.maxBackoffMs
    );
    return backoffMs;
  }

  /**
   * Sleep for a specified duration
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   * @private
   */
  async _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make a request with automatic retry and exponential backoff
   * @param {string} method - HTTP method
   * @param {string} path - API endpoint path
   * @param {Object} [data] - Request body data
   * @returns {Promise<Object>} Response data
   * @private
   */
  async _requestWithRetry(method, path, data = null) {
    let retryCount = 0;
    
    while (retryCount <= this.maxRetries) {
      try {
        return await this._request(method, path, data);
      } catch (error) {
        // Don't retry authentication errors (401, 403)
        if (error instanceof OpenClawApiError && error.isAuthError()) {
          throw error;
        }
        
        // Don't retry validation errors (400, 422) - client error
        if (error instanceof OpenClawApiError && error.isValidationError()) {
          throw error;
        }
        
        // Don't retry not found errors (404)
        if (error instanceof OpenClawApiError && error.isNotFoundError()) {
          throw error;
        }
        
        // Handle rate limit errors with backoff
        if (error instanceof OpenClawApiError && error.isRateLimitError()) {
          const waitTime = this.rateLimitInfo.reset
            ? Math.max(this.rateLimitInfo.reset - Date.now(), this._calculateBackoff(retryCount))
            : this._calculateBackoff(retryCount);
          
          console.warn(`OpenClawClient: Rate limit hit. Waiting ${waitTime / 1000} seconds before retry.`);
          await this._sleep(waitTime);
          retryCount++;
          continue;
        }
        
        // Retry retryable errors (5xx, 408, network)
        if (error instanceof OpenClawApiError && error.isRetryable() && retryCount < this.maxRetries) {
          const backoffTime = this._calculateBackoff(retryCount);
          console.warn(`OpenClawClient: Server error ${error.status}. Retrying in ${backoffTime / 1000} seconds.`);
          await this._sleep(backoffTime);
          retryCount++;
          continue;
        }
        
        // Retry network errors (status 0)
        if (error instanceof OpenClawApiError && error.status === 0 && retryCount < this.maxRetries) {
          const backoffTime = this._calculateBackoff(retryCount);
          console.warn(`OpenClawClient: Network error. Retrying in ${backoffTime / 1000} seconds.`);
          await this._sleep(backoffTime);
          retryCount++;
          continue;
        }
        
        throw error;
      }
    }
    
    throw new OpenClawApiError(500, `Max retries (${this.maxRetries}) exceeded`);
  }

  // ============================================================
  // Authentication Methods
  // ============================================================

  /**
   * Set authentication token
   * @param {string} token - JWT token
   * @param {number} [expiresIn] - Token expiry in seconds from now
   */
  setAuthToken(token, expiresIn = null) {
    this.token = token;
    this.apiKey = null; // Clear API key when using JWT
    
    if (expiresIn) {
      this.tokenExpiry = Date.now() + (expiresIn * 1000);
    } else {
      this.tokenExpiry = null;
    }
  }

  /**
   * Set API key (for development mode)
   * @param {string} apiKey - API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Check if token needs refresh
   * @returns {boolean} True if token should be refreshed
   */
  needsTokenRefresh() {
    if (!this.token || !this.tokenExpiry) {
      return false;
    }
    
    const timeUntilExpiry = this.tokenExpiry - Date.now();
    return timeUntilExpiry < this.refreshThresholdMs;
  }

  /**
   * Refresh authentication token
   * This method should be called by the adapter when token is near expiry.
   * The actual refresh mechanism depends on OpenClaw server implementation.
   * @returns {Promise<Object>} Refresh result
   */
  async refreshToken() {
    // If no refresh endpoint defined, this is a placeholder
    // In production, OpenClaw would provide a /auth/refresh endpoint
    // or use a refresh token mechanism
    
    if (!this.token) {
      throw new OpenClawApiError(401, 'No token to refresh');
    }
    
    try {
      // Attempt to call refresh endpoint if available
      const response = await this._requestWithRetry('POST', '/api/v1/auth/refresh', {
        token: this.token
      });
      
      if (response.token) {
        this.setAuthToken(response.token, response.expires_in);
        return {
          success: true,
          token: response.token,
          expires_in: response.expires_in
        };
      }
      
      return {
        success: false,
        message: 'No new token in response'
      };
    } catch (error) {
      console.error('OpenClawClient: Token refresh failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================================
  // API Methods
  // ============================================================

  /**
   * Post execution result to OpenClaw
   * @param {string} dispatchId - Dispatch ID
   * @param {Object} executionResult - Execution result object
   * @returns {Promise<Object>} Response from OpenClaw
   */
  async postResult(dispatchId, executionResult) {
    const path = this.endpoints.result;
    
    // Ensure dispatch_id is included
    const payload = {
      ...executionResult,
      dispatch_id: dispatchId
    };
    
    return await this._requestWithRetry('POST', path, payload);
  }

  /**
   * Post escalation request to OpenClaw
   * @param {Object} escalation - Escalation object
   * @returns {Promise<Object>} Response from OpenClaw (decision)
   */
  async postEscalation(escalation) {
    const path = this.endpoints.escalation;
    
    return await this._requestWithRetry('POST', path, escalation);
  }

  /**
   * Post retry log to OpenClaw
   * @param {Object} retryLog - Retry log object
   * @returns {Promise<Object>} Response from OpenClaw
   */
  async postRetryLog(retryLog) {
    const path = this.endpoints.retry;
    
    // Ensure timestamp is set
    const payload = {
      ...retryLog,
      timestamp: retryLog.timestamp || new Date().toISOString()
    };
    
    return await this._requestWithRetry('POST', path, payload);
  }

  /**
   * Post heartbeat to OpenClaw
   * @param {string} dispatchId - Dispatch ID
   * @param {string} status - Heartbeat status (running, waiting, blocked)
   * @param {Object} [progress] - Progress information
   * @returns {Promise<Object>} Response from OpenClaw
   */
  async postHeartbeat(dispatchId, status, progress = null) {
    const path = this.endpoints.heartbeat;
    
    const payload = {
      dispatch_id: dispatchId,
      status: status,
      timestamp: new Date().toISOString()
    };
    
    if (progress) {
      payload.progress = progress;
    }
    
    return await this._requestWithRetry('POST', path, payload);
  }

  // ============================================================
  // Rate Limit Methods
  // ============================================================

  /**
   * Get cached rate limit info
   * @returns {Object} Rate limit information
   */
  getRateLimitInfo() {
    return {
      limit: this.rateLimitInfo.limit,
      remaining: this.rateLimitInfo.remaining,
      reset: this.rateLimitInfo.reset,
      resetDate: this.rateLimitInfo.reset ? new Date(this.rateLimitInfo.reset).toISOString() : null,
      secondsUntilReset: this.rateLimitInfo.reset 
        ? Math.max(0, Math.floor((this.rateLimitInfo.reset - Date.now()) / 1000))
        : null,
      lastRequestTime: this.rateLimitInfo.lastRequestTime
    };
  }

  /**
   * Check if rate limit is approaching threshold
   * @param {number} [threshold] - Threshold percentage (default: 10%)
   * @returns {boolean} True if remaining requests below threshold
   */
  isRateLimitLow(threshold = 0.1) {
    if (this.rateLimitInfo.remaining === null || this.rateLimitInfo.limit === null) {
      return false;
    }
    return this.rateLimitInfo.remaining < this.rateLimitInfo.limit * threshold;
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * Check connection health by making a simple request
   * @returns {Promise<boolean>} True if connection is healthy
   */
  async checkConnection() {
    try {
      // Try a lightweight endpoint or just check the base URL
      await this._request('GET', '/api/v1/health');
      return true;
    } catch (error) {
      // If health endpoint doesn't exist, try base URL
      try {
        await this._request('GET', '/');
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  /**
   * Get client configuration summary
   * @returns {Object} Configuration summary
   */
  getConfig() {
    return {
      apiBaseUrl: this.apiBaseUrl,
      endpoints: this.endpoints,
      connectionTimeoutMs: this.connectionTimeoutMs,
      requestTimeoutMs: this.requestTimeoutMs,
      maxRetries: this.maxRetries,
      backoffInitialMs: this.backoffInitialMs,
      hasAuth: this.token || this.apiKey ? true : false,
      authType: this.token ? 'jwt' : (this.apiKey ? 'api_key' : 'none')
    };
  }

  /**
   * Destroy connection pool (cleanup)
   */
  destroy() {
    if (this.httpsAgent) {
      this.httpsAgent.destroy();
    }
    if (this.httpAgent) {
      this.httpAgent.destroy();
    }
  }
}

module.exports = { OpenClawClient, OpenClawApiError };