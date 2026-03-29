/**
 * OpenClaw Retry Handler
 * 
 * Implements retry decision logic with configurable policy including
 * exponential backoff, risk-level based limits, and strategy selection.
 * 
 * Based on spec.md §2 FR-005 (AC-015 to AC-018) and BR-002.
 * 
 * @module adapters/openclaw/retry-handler
 */

const { 
  RetryStrategyEnum, 
  BackoffTypeEnum, 
  RiskLevelEnum,
  validRetryStrategies,
  validBackoffTypes,
  validRiskLevels
} = require('./types.js');

/**
 * Default retry configuration
 * @see spec.md §7 Configuration Schema
 */
const DEFAULT_RETRY_CONFIG = {
  strategy: RetryStrategyEnum.AUTO,
  max_retry: 2,
  backoff_type: BackoffTypeEnum.EXPONENTIAL,
  backoff_initial_seconds: 60
};

/**
 * Retry limits by risk level per BR-002
 * @see spec.md §4 BR-002
 */
const RETRY_LIMITS_BY_RISK = {
  [RiskLevelEnum.LOW]: 2,
  [RiskLevelEnum.MEDIUM]: 1,
  [RiskLevelEnum.HIGH]: 0,
  [RiskLevelEnum.CRITICAL]: 0
};

/**
 * RetryHandler - Manages retry decisions with configurable policy
 * 
 * Responsibilities:
 * - Determine whether a failed execution should retry
 * - Calculate backoff time based on retry count and strategy
 * - Enforce risk-level based retry limits
 * - Format retry logs for API submission
 */
class RetryHandler {
  /**
   * Create a RetryHandler instance
   * 
   * @param {Object} retry_config - Retry configuration from OpenClaw dispatch
   * @param {string} [retry_config.strategy='auto'] - Retry strategy (auto/manual/disabled)
   * @param {number} [retry_config.max_retry=2] - Maximum retry attempts
   * @param {string} [retry_config.backoff_type='exponential'] - Backoff type
   * @param {number} [retry_config.backoff_initial_seconds=60] - Initial backoff seconds
   */
  constructor(retry_config = {}) {
    this.config = {
      strategy: retry_config.strategy || DEFAULT_RETRY_CONFIG.strategy,
      max_retry: retry_config.max_retry ?? DEFAULT_RETRY_CONFIG.max_retry,
      backoff_type: retry_config.backoff_type || DEFAULT_RETRY_CONFIG.backoff_type,
      backoff_initial_seconds: retry_config.backoff_initial_seconds ?? DEFAULT_RETRY_CONFIG.backoff_initial_seconds
    };

    if (!validRetryStrategies.includes(this.config.strategy)) {
      throw new Error(`Invalid retry strategy: ${this.config.strategy}. Valid: ${validRetryStrategies.join(', ')}`);
    }

    if (!validBackoffTypes.includes(this.config.backoff_type)) {
      throw new Error(`Invalid backoff type: ${this.config.backoff_type}. Valid: ${validBackoffTypes.join(', ')}`);
    }

    if (typeof this.config.max_retry !== 'number' || this.config.max_retry < 0) {
      throw new Error(`Invalid max_retry: must be a non-negative number`);
    }

    if (typeof this.config.backoff_initial_seconds !== 'number' || this.config.backoff_initial_seconds < 0) {
      throw new Error(`Invalid backoff_initial_seconds: must be a non-negative number`);
    }
  }

  /**
   * Determine whether execution should retry based on context
   * 
   * Decision logic:
   * 1. Check if retry is disabled by strategy
   * 2. Check if manual retry is required (return escalate=true)
   * 3. Compare retry_count against risk-level based max
   * 4. Return decision with calculated backoff
   * 
   * @param {Object} retryContext - Retry context from execution failure
   * @param {number} retryContext.retry_count - Current retry count
   * @param {string} retryContext.previous_failure_reason - Reason for failure
   * @param {string} [retryContext.previous_output_summary] - Summary of previous output
   * @param {string[]} [retryContext.required_fixes] - Required fixes
   * @param {string} [retryContext.risk_level='low'] - Risk level for retry limit
   * @returns {Object} RetryDecision - { should_retry, reason, backoff_seconds, escalate }
   * 
   * @example
   * const decision = retryHandler.shouldRetry({
   *   retry_count: 1,
   *   previous_failure_reason: 'Test failed',
   *   risk_level: 'low'
   * });
   * // => { should_retry: true, reason: 'Retry allowed, 1/2 attempts', backoff_seconds: 120, escalate: false }
   */
  shouldRetry(retryContext) {
    const retryCount = retryContext.retry_count || 0;
    const riskLevel = retryContext.risk_level || RiskLevelEnum.LOW;
    const previousFailureReason = retryContext.previous_failure_reason || 'Unknown failure';

    if (!validRiskLevels.includes(riskLevel)) {
      return {
        should_retry: false,
        reason: `Invalid risk_level: ${riskLevel}`,
        backoff_seconds: 0,
        escalate: true
      };
    }

    if (this.isRetryDisabled()) {
      return {
        should_retry: false,
        reason: 'Retry strategy is disabled',
        backoff_seconds: 0,
        escalate: true
      };
    }

    if (this.isManualRetryRequired()) {
      return {
        should_retry: false,
        reason: 'Manual retry required - awaiting user decision',
        backoff_seconds: 0,
        escalate: true
      };
    }

    const maxRetryForRisk = this.getMaxRetry(riskLevel);
    const configMaxRetry = this.config.max_retry;
    const effectiveMaxRetry = Math.min(maxRetryForRisk, configMaxRetry);

    if (retryCount >= effectiveMaxRetry) {
      return {
        should_retry: false,
        reason: `Max retry limit reached (${retryCount}/${effectiveMaxRetry}) for risk_level: ${riskLevel}`,
        backoff_seconds: 0,
        escalate: true
      };
    }

    const backoffSeconds = this.calculateBackoff(retryCount, this.config);

    return {
      should_retry: true,
      reason: `Retry allowed, ${retryCount}/${effectiveMaxRetry} attempts used, risk_level: ${riskLevel}`,
      backoff_seconds: backoffSeconds,
      escalate: false
    };
  }

  /**
   * Calculate backoff time based on retry count and backoff type
   * 
   * Backoff formulas:
   * - Exponential: initial * (2 ^ retryCount)
   * - Linear: initial + (initial * retryCount)
   * - Fixed: initial
   * 
   * @param {number} retryCount - Current retry count (0-based)
   * @param {Object} config - Backoff configuration
   * @param {string} config.backoff_type - Backoff type
   * @param {number} config.backoff_initial_seconds - Initial backoff seconds
   * @returns {number} Backoff seconds for next retry
   * 
   * @example
   * // Exponential: 60 * (2^0) = 60, 60 * (2^1) = 120, 60 * (2^2) = 240
   * calculateBackoff(0, { backoff_type: 'exponential', backoff_initial_seconds: 60 });
   * // => 60
   */
  calculateBackoff(retryCount, config) {
    const initial = config.backoff_initial_seconds;
    const backoffType = config.backoff_type;

    switch (backoffType) {
      case BackoffTypeEnum.EXPONENTIAL:
        return initial * Math.pow(2, retryCount);

      case BackoffTypeEnum.LINEAR:
        return initial + (initial * retryCount);

      case BackoffTypeEnum.FIXED:
        return initial;

      default:
        return initial * Math.pow(2, retryCount);
    }
  }

  /**
   * Get maximum retry count based on risk level
   * 
   * Per BR-002:
   * - low: 2 retries
   * - medium: 1 retry
   * - high: 0 retries (immediate escalation)
   * - critical: 0 retries (immediate escalation)
   * 
   * @param {string} riskLevel - Risk level (low/medium/high/critical)
   * @returns {number} Maximum retry count for this risk level
   * 
   * @example
   * getMaxRetry('low');      // => 2
   * getMaxRetry('medium');   // => 1
   * getMaxRetry('high');     // => 0
   * getMaxRetry('critical'); // => 0
   */
  getMaxRetry(riskLevel) {
    if (!validRiskLevels.includes(riskLevel)) {
      return RETRY_LIMITS_BY_RISK[RiskLevelEnum.LOW];
    }

    return RETRY_LIMITS_BY_RISK[riskLevel] || 0;
  }

  /**
   * Check if automatic retry is enabled
   * 
   * @returns {boolean} True if strategy is 'auto'
   * 
   * @example
   * const handler = new RetryHandler({ strategy: 'auto' });
   * handler.isAutoRetryEnabled(); // => true
   */
  isAutoRetryEnabled() {
    return this.config.strategy === RetryStrategyEnum.AUTO;
  }

  /**
   * Check if manual retry is required (user decision needed)
   * 
   * @returns {boolean} True if strategy is 'manual'
   * 
   * @example
   * const handler = new RetryHandler({ strategy: 'manual' });
   * handler.isManualRetryRequired(); // => true
   */
  isManualRetryRequired() {
    return this.config.strategy === RetryStrategyEnum.MANUAL;
  }

  /**
   * Check if retry is disabled (no retries allowed)
   * 
   * @returns {boolean} True if strategy is 'disabled'
   * 
   * @example
   * const handler = new RetryHandler({ strategy: 'disabled' });
   * handler.isRetryDisabled(); // => true
   */
  isRetryDisabled() {
    return this.config.strategy === RetryStrategyEnum.DISABLED;
  }

  /**
   * Format retry log for API submission to OpenClaw
   * 
   * Creates a RetryLog object conforming to the RetryLog schema in types.js
   * suitable for POST to OpenClaw /api/v1/retries endpoint.
   * 
   * @param {Object} retryLog - Raw retry log data
   * @param {string} retryLog.dispatch_id - Dispatch ID
   * @param {number} retryLog.retry_count - Current retry count
   * @param {string} retryLog.previous_failure_reason - Failure reason
   * @param {string} [retryLog.previous_output_summary] - Previous output summary
   * @param {string[]} [retryLog.required_fixes] - Required fixes
   * @returns {Object} Formatted RetryLog for API
   * 
   * @example
   * const formatted = retryHandler.logRetry({
   *   dispatch_id: 'dispatch-123',
   *   retry_count: 1,
   *   previous_failure_reason: 'Test failed'
   * });
   * // => {
   * //   retry_id: 'retry-dispatch-123-1',
   * //   dispatch_id: 'dispatch-123',
   * //   retry_count: 1,
   * //   max_retry: 2,
   * //   ...
   * // }
   */
  logRetry(retryLog) {
    const now = new Date().toISOString();
    
    return {
      retry_id: `retry-${retryLog.dispatch_id}-${retryLog.retry_count}`,
      dispatch_id: retryLog.dispatch_id,
      retry_count: retryLog.retry_count || 0,
      max_retry: this.config.max_retry,
      previous_failure_reason: retryLog.previous_failure_reason || '',
      previous_output_summary: retryLog.previous_output_summary || '',
      required_fixes: retryLog.required_fixes || [],
      retry_strategy: this.config.strategy,
      backoff_seconds: this.calculateBackoff(retryLog.retry_count || 0, this.config),
      timestamp: now
    };
  }

  /**
   * Get current configuration
   * 
   * @returns {Object} Current retry configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Get default retry configuration
   * 
   * @returns {Object} Default configuration values
   * @static
   */
  static getDefaultConfig() {
    return { ...DEFAULT_RETRY_CONFIG };
  }

  /**
   * Get retry limits by risk level
   * 
   * @returns {Object} Retry limits mapping
   * @static
   */
  static getRetryLimitsByRisk() {
    return { ...RETRY_LIMITS_BY_RISK };
  }
}

module.exports = {
  RetryHandler,
  DEFAULT_RETRY_CONFIG,
  RETRY_LIMITS_BY_RISK
};