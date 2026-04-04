/**
 * GitHub Client for GitHub Issue Adapter
 * 
 * REST API v3 client for GitHub operations.
 * Reference: docs/adapters/github-issue-adapter-design.md
 * 
 * Features:
 * - REST API v3 integration
 * - Token authentication via GITHUB_TOKEN environment variable
 * - Rate limit tracking via X-RateLimit-* headers
 * - Error handling for 404, 403, 422, 500
 * - Exponential backoff for rate limits
 */

const https = require('https');
const http = require('http');

/**
 * Custom error class for GitHub API errors
 */
class GitHubApiError extends Error {
  constructor(status, message, documentationUrl = null, errors = null) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.documentationUrl = documentationUrl;
    this.errors = errors;
  }

  /**
   * Check if this error is retryable
   * @returns {boolean}
   */
  isRetryable() {
    // 500 Server Error is retryable
    // 422 can sometimes be retryable depending on the error type
    return this.status === 500;
  }

  /**
   * Check if this is a rate limit error
   * @returns {boolean}
   */
  isRateLimitError() {
    return this.status === 403 && this.message.includes('rate limit');
  }

  /**
   * Check if this is a not found error
   * @returns {boolean}
   */
  isNotFoundError() {
    return this.status === 404;
  }

  /**
   * Check if this is a permission error
   * @returns {boolean}
   */
  isPermissionError() {
    return this.status === 403 && !this.isRateLimitError();
  }
}

/**
 * GitHub Client class
 * 
 * Provides methods for interacting with GitHub REST API v3.
 */
class GitHubClient {
  /**
   * Create a new GitHub Client
   * @param {Object} config - Configuration object
   * @param {string} [config.token] - GitHub token (defaults to GITHUB_TOKEN env var)
   * @param {string} [config.baseUrl] - API base URL (defaults to https://api.github.com)
   * @param {string} [config.userAgent] - User agent string
   * @param {number} [config.backoffMultiplier] - Backoff multiplier for retries (default: 2)
   * @param {number} [config.maxBackoffSeconds] - Maximum backoff time (default: 3600)
   * @param {number} [config.warningThreshold] - Rate limit warning threshold (default: 100)
   */
  constructor(config = {}) {
    // Get token from config or environment variable
    this.token = config.token || process.env.GITHUB_TOKEN || null;
    
    // API configuration
    this.baseUrl = config.baseUrl || 'https://api.github.com';
    this.userAgent = config.userAgent || 'OpenCode-ExpertPack/1.0.0';
    
    // Rate limit configuration
    this.backoffMultiplier = config.backoffMultiplier || 2;
    this.maxBackoffSeconds = config.maxBackoffSeconds || 3600;
    this.warningThreshold = config.warningThreshold || 100;
    
    // Cached rate limit info
    this.rateLimitInfo = {
      limit: 5000,
      remaining: 5000,
      reset: Date.now() + 3600000,
      used: 0
    };
    
    // Validate token presence
    if (!this.token) {
      console.warn('GitHubClient: No token provided. Set GITHUB_TOKEN environment variable or pass token in config.');
    }
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
      apiUrl = this.baseUrl + apiUrl;
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
   * Make an HTTP request to GitHub API
   * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
   * @param {string} path - API endpoint path
   * @param {Object} [data] - Request body data
   * @returns {Promise<Object>} Response data
   * @private
   */
  async _request(method, path, data = null) {
    const urlParts = this._parseUrl(path);
    
    const headers = {
      'User-Agent': this.userAgent,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    
    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }
    
    // Add content headers for requests with body
    if (data) {
      headers['Content-Type'] = 'application/json';
    }
    
    const requestOptions = {
      method: method,
      hostname: urlParts.hostname,
      port: urlParts.port,
      path: urlParts.path,
      headers: headers
    };
    
    return new Promise((resolve, reject) => {
      const protocol = urlParts.protocol === 'https:' ? https : http;
      
      const req = protocol.request(requestOptions, (res) => {
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
              // Return empty object for non-JSON responses (like 204 No Content)
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
            
            const error = new GitHubApiError(
              res.statusCode,
              errorData.message || `HTTP ${res.statusCode}`,
              errorData.documentation_url || null,
              errorData.errors || null
            );
            
            reject(error);
          }
        });
      });
      
      req.on('error', (e) => {
        reject(new GitHubApiError(0, `Network error: ${e.message}`));
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
    const used = headers['x-ratelimit-used'];
    
    if (limit) this.rateLimitInfo.limit = parseInt(limit, 10);
    if (remaining) this.rateLimitInfo.remaining = parseInt(remaining, 10);
    if (reset) this.rateLimitInfo.reset = parseInt(reset, 10) * 1000; // Convert to milliseconds
    if (used) this.rateLimitInfo.used = parseInt(used, 10);
    
    // Log warning if approaching rate limit
    if (this.rateLimitInfo.remaining < this.warningThreshold) {
      console.warn(`GitHubClient: Rate limit warning - ${this.rateLimitInfo.remaining} requests remaining`);
    }
  }

  /**
   * Calculate backoff time for retries
   * @param {number} retryCount - Number of retries attempted
   * @returns {number} Backoff time in milliseconds
   * @private
   */
  _calculateBackoff(retryCount) {
    const baseBackoff = 1000; // 1 second base
    const backoffMs = Math.min(
      baseBackoff * Math.pow(this.backoffMultiplier, retryCount) * 1000,
      this.maxBackoffSeconds * 1000
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
   * @param {number} [maxRetries] - Maximum number of retries (default: 3)
   * @returns {Promise<Object>} Response data
   * @private
   */
  async _requestWithRetry(method, path, data = null, maxRetries = 3) {
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        return await this._request(method, path, data);
      } catch (error) {
        // Don't retry non-retryable errors
        if (error instanceof GitHubApiError) {
          if (error.isNotFoundError() || error.isPermissionError()) {
            throw error;
          }
          
          // Handle rate limit errors with exponential backoff
          if (error.isRateLimitError()) {
            const waitTime = Math.max(
              this.rateLimitInfo.reset - Date.now(),
              this._calculateBackoff(retryCount)
            );
            
            console.warn(`GitHubClient: Rate limit hit. Waiting ${waitTime / 1000} seconds before retry.`);
            await this._sleep(waitTime);
            retryCount++;
            continue;
          }
          
          // Retry server errors
          if (error.isRetryable() && retryCount < maxRetries) {
            const backoffTime = this._calculateBackoff(retryCount);
            console.warn(`GitHubClient: Server error ${error.status}. Retrying in ${backoffTime / 1000} seconds.`);
            await this._sleep(backoffTime);
            retryCount++;
            continue;
          }
        }
        
        throw error;
      }
    }
    
    throw new GitHubApiError(500, `Max retries (${maxRetries}) exceeded`);
  }

  // ============================================================
  // Comment Methods
  // ============================================================

  /**
   * Post a comment on an issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @param {string} body - Comment body (markdown supported)
   * @returns {Promise<Object>} Created comment object
   */
  async postComment(owner, repo, issueNumber, body) {
    const path = `/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
    return await this._requestWithRetry('POST', path, { body });
  }

  /**
   * Update an existing comment
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} commentId - Comment ID
   * @param {string} body - New comment body (markdown supported)
   * @returns {Promise<Object>} Updated comment object
   */
  async updateComment(owner, repo, commentId, body) {
    const path = `/repos/${owner}/${repo}/issues/comments/${commentId}`;
    return await this._requestWithRetry('PATCH', path, { body });
  }

  /**
   * Delete a comment
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object>} Empty object on success
   */
  async deleteComment(owner, repo, commentId) {
    const path = `/repos/${owner}/${repo}/issues/comments/${commentId}`;
    return await this._requestWithRetry('DELETE', path);
  }

  // ============================================================
  // Label Methods
  // ============================================================

  /**
   * Add a label to an issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @param {string} label - Label name
   * @returns {Promise<Object>} Added label object
   */
  async addLabel(owner, repo, issueNumber, label) {
    const path = `/repos/${owner}/${repo}/issues/${issueNumber}/labels`;
    // GitHub API accepts either a single label string or array
    const labels = Array.isArray(label) ? label : [label];
    return await this._requestWithRetry('POST', path, { labels });
  }

  /**
   * Remove a label from an issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @param {string} label - Label name
   * @returns {Promise<Object>} Empty object on success
   */
  async removeLabel(owner, repo, issueNumber, label) {
    const path = `/repos/${owner}/${repo}/issues/${issueNumber}/labels/${encodeURIComponent(label)}`;
    return await this._requestWithRetry('DELETE', path);
  }

  /**
   * List all labels on an issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @returns {Promise<Array>} Array of label objects
   */
  async listLabels(owner, repo, issueNumber) {
    const path = `/repos/${owner}/${repo}/issues/${issueNumber}/labels`;
    return await this._requestWithRetry('GET', path);
  }

  // ============================================================
  // Issue Methods
  // ============================================================

  /**
   * Get an issue by number
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @returns {Promise<Object>} Issue object
   */
  async getIssue(owner, repo, issueNumber) {
    const path = `/repos/${owner}/${repo}/issues/${issueNumber}`;
    return await this._requestWithRetry('GET', path);
  }

  /**
   * Create a new issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} options - Issue options
   * @param {string} options.title - Issue title (required)
   * @param {string} [options.body] - Issue body (markdown supported)
   * @param {string[]} [options.labels] - Labels to add
   * @param {number|string} [options.milestone] - Milestone number or title
   * @param {string[]} [options.assignees] - Assignees (usernames)
   * @returns {Promise<Object>} Created issue object
   */
  async createIssue(owner, repo, options) {
    const path = `/repos/${owner}/${repo}/issues`;
    const data = {
      title: options.title,
      body: options.body || '',
      labels: options.labels || [],
      assignees: options.assignees || []
    };
    
    if (options.milestone !== undefined) {
      data.milestone = options.milestone;
    }
    
    return await this._requestWithRetry('POST', path, data);
  }

  /**
   * Search issues with filters
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} [options] - Search options
   * @param {string[]} [options.labels] - Filter by labels
   * @param {string} [options.state] - Filter by state ('open', 'closed', 'all')
   * @param {string|number} [options.milestone] - Filter by milestone
   * @param {string} [options.creator] - Filter by creator
   * @param {string} [options.assignee] - Filter by assignee
   * @param {number} [options.per_page] - Results per page (max 100, default 30)
   * @param {number} [options.page] - Page number
   * @param {string} [options.since] - Only issues updated after this timestamp (ISO 8601)
   * @returns {Promise<Array>} Array of issue objects
   */
  async searchIssues(owner, repo, options = {}) {
    const params = new URLSearchParams();
    
    if (options.labels && options.labels.length > 0) {
      params.set('labels', options.labels.join(','));
    }
    if (options.state) {
      params.set('state', options.state);
    }
    if (options.milestone !== undefined) {
      params.set('milestone', String(options.milestone));
    }
    if (options.creator) {
      params.set('creator', options.creator);
    }
    if (options.assignee) {
      params.set('assignee', options.assignee);
    }
    if (options.per_page !== undefined) {
      params.set('per_page', String(Math.min(options.per_page, 100)));
    }
    if (options.page !== undefined) {
      params.set('page', String(options.page));
    }
    if (options.since) {
      params.set('since', options.since);
    }
    
    const queryString = params.toString();
    const path = `/repos/${owner}/${repo}/issues${queryString ? '?' + queryString : ''}`;
    return await this._requestWithRetry('GET', path);
  }

  /**
   * Update an issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @param {Object} options - Update options
   * @param {string} [options.title] - New title
   * @param {string} [options.body] - New body
   * @param {string} [options.state] - New state ('open' or 'closed')
   * @param {string[]} [options.labels] - Replace labels
   * @param {number|string} [options.milestone] - New milestone
   * @param {string[]} [options.assignees] - Replace assignees
   * @returns {Promise<Object>} Updated issue object
   */
  async updateIssue(owner, repo, issueNumber, options) {
    const path = `/repos/${owner}/${repo}/issues/${issueNumber}`;
    const data = {};
    
    if (options.title !== undefined) data.title = options.title;
    if (options.body !== undefined) data.body = options.body;
    if (options.state !== undefined) data.state = options.state;
    if (options.labels !== undefined) data.labels = options.labels;
    if (options.milestone !== undefined) data.milestone = options.milestone;
    if (options.assignees !== undefined) data.assignees = options.assignees;
    
    return await this._requestWithRetry('PATCH', path, data);
  }

  /**
   * Close an issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @returns {Promise<Object>} Closed issue object
   */
  async closeIssue(owner, repo, issueNumber) {
    return await this.updateIssue(owner, repo, issueNumber, { state: 'closed' });
  }

  /**
   * Reopen an issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @returns {Promise<Object>} Reopened issue object
   */
  async reopenIssue(owner, repo, issueNumber) {
    return await this.updateIssue(owner, repo, issueNumber, { state: 'open' });
  }

  // ============================================================
  // Rate Limit Methods
  // ============================================================

  /**
   * Check current rate limit status
   * @returns {Promise<Object>} Rate limit information
   */
  async checkRateLimit() {
    const path = '/rate_limit';
    const response = await this._requestWithRetry('GET', path);
    
    // Update cached rate limit info from response
    if (response.resources && response.resources.core) {
      this.rateLimitInfo = {
        limit: response.resources.core.limit,
        remaining: response.resources.core.remaining,
        reset: response.resources.core.reset * 1000,
        used: response.resources.core.used || 0
      };
    }
    
    return response;
  }

  /**
   * Get cached rate limit info
   * @returns {Object} Rate limit information
   */
  getRateLimitInfo() {
    return {
      ...this.rateLimitInfo,
      resetDate: new Date(this.rateLimitInfo.reset).toISOString(),
      secondsUntilReset: Math.max(0, Math.floor((this.rateLimitInfo.reset - Date.now()) / 1000))
    };
  }

  /**
   * Check if rate limit is approaching threshold
   * @returns {boolean} True if remaining requests below warning threshold
   */
  isRateLimitLow() {
    return this.rateLimitInfo.remaining < this.warningThreshold;
  }
}

module.exports = { GitHubClient, GitHubApiError };