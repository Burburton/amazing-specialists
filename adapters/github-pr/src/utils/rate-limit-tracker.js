/**
 * Rate Limit Tracker
 * 
 * Tracks GitHub API rate limits and implements exponential backoff.
 * 
 * @module rate-limit-tracker
 * @see io-contract.md §8 NFR-001
 */

/**
 * Rate Limit Tracker class
 */
class RateLimitTracker {
  /**
   * @param {object} config - Rate limit configuration
   */
  constructor(config) {
    this.config = config || {};
    this.enabled = this.config.enabled !== false;
    this.warningThreshold = this.config.warning_threshold || 100;
    this.backoffMultiplier = this.config.backoff_multiplier || 2;
    this.maxBackoffSeconds = this.config.max_backoff_seconds || 3600;
    
    this._rateLimitInfo = {
      limit: 5000,
      remaining: 5000,
      reset: null,
      used: 0
    };
    
    this._consecutiveBackoffs = 0;
  }

  /**
   * Update rate limit info from API response headers
   * @param {object} headers - Response headers
   */
  updateFromHeaders(headers) {
    if (!headers) return;
    
    const limit = parseInt(headers['x-ratelimit-limit'], 10);
    const remaining = parseInt(headers['x-ratelimit-remaining'], 10);
    const reset = parseInt(headers['x-ratelimit-reset'], 10);
    const used = parseInt(headers['x-ratelimit-used'], 10);

    if (!isNaN(limit)) this._rateLimitInfo.limit = limit;
    if (!isNaN(remaining)) this._rateLimitInfo.remaining = remaining;
    if (!isNaN(reset)) this._rateLimitInfo.reset = reset * 1000;
    if (!isNaN(used)) this._rateLimitInfo.used = used;

    if (this.isNearLimit()) {
      console.warn(`Rate limit warning: ${this._rateLimitInfo.remaining} requests remaining`);
    }
  }

  /**
   * Get current rate limit info
   * @returns {object}
   */
  getInfo() {
    return { ...this._rateLimitInfo };
  }

  /**
   * Check if near rate limit
   * @returns {boolean}
   */
  isNearLimit() {
    return this._rateLimitInfo.remaining <= this.warningThreshold;
  }

  /**
   * Check if rate limit exceeded
   * @returns {boolean}
   */
  isExceeded() {
    return this._rateLimitInfo.remaining <= 0;
  }

  /**
   * Get time until rate limit reset
   * @returns {number} Milliseconds until reset
   */
  getTimeUntilReset() {
    if (!this._rateLimitInfo.reset) return 0;
    
    const now = Date.now();
    const resetTime = this._rateLimitInfo.reset;
    
    return Math.max(0, resetTime - now);
  }

  /**
   * Calculate backoff time
   * Uses exponential backoff with configurable multiplier
   * 
   * @returns {number} Backoff time in milliseconds
   */
  calculateBackoff() {
    if (this._consecutiveBackoffs === 0) {
      this._consecutiveBackoffs = 1;
      return 1000; // 1 second initial backoff
    }

    const baseSeconds = Math.pow(this.backoffMultiplier, this._consecutiveBackoffs);
    const backoffMs = Math.min(
      baseSeconds * 1000,
      this.maxBackoffSeconds * 1000
    );

    this._consecutiveBackoffs++;
    
    return backoffMs;
  }

  /**
   * Reset backoff counter
   */
  resetBackoff() {
    this._consecutiveBackoffs = 0;
  }

  /**
   * Wait if rate limit is near or exceeded
   * @returns {Promise<number>} Time waited in milliseconds, or 0 if no wait
   */
  async waitForRateLimit() {
    if (!this.enabled) return 0;
    
    if (this.isExceeded()) {
      const waitTime = this.getTimeUntilReset();
      console.warn(`Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)} seconds until reset.`);
      await this._sleep(waitTime);
      return waitTime;
    }
    
    if (this.isNearLimit()) {
      const backoff = this.calculateBackoff();
      console.warn(`Near rate limit. Backing off for ${Math.ceil(backoff / 1000)} seconds.`);
      await this._sleep(backoff);
      return backoff;
    }
    
    this.resetBackoff();
    return 0;
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms 
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get status for logging
   * @returns {object}
   */
  getStatus() {
    return {
      enabled: this.enabled,
      limit: this._rateLimitInfo.limit,
      remaining: this._rateLimitInfo.remaining,
      used: this._rateLimitInfo.used,
      near_limit: this.isNearLimit(),
      exceeded: this.isExceeded(),
      seconds_until_reset: Math.ceil(this.getTimeUntilReset() / 1000),
      consecutive_backoffs: this._consecutiveBackoffs
    };
  }
}

module.exports = { RateLimitTracker };