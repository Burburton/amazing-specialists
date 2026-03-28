/**
 * Retry Handler
 * 
 * Interactive retry strategy for local_repo workspace adapter.
 * Implements retry strategy per ADAPTERS.md §Workspace Adapter §Local Repo.
 * 
 * @module retry-handler
 * @see io-contract.md §8
 */

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetry: 2,
  strategy: 'interactive',
  trigger: 'user_decision'
};

/**
 * Retry context from io-contract.md §8
 * @typedef {Object} RetryContext
 * @property {string} error_type - Type of error
 * @property {number} retry_count - Current retry count
 * @property {string} error_message - Error message
 * @property {Object} execution_result - Execution result if available
 */

/**
 * Retry decision from io-contract.md §8
 * @typedef {Object} RetryDecision
 * @property {boolean} should_retry - Whether to retry
 * @property {string} action - Action to take (retry/abort/escalate)
 * @property {string} [reason] - Reason for decision
 * @property {Object} [modified_context] - Modified context for retry
 */

/**
 * Handle retry decision for failed output
 * 
 * @param {RetryContext} context - Retry context
 * @param {Object} [config] - Retry configuration
 * @returns {RetryDecision} Retry decision
 */
function handleRetry(context, config = {}) {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  const retryableErrors = ['validation_error', 'execution_error', 'timeout_error'];
  const nonRetryableErrors = ['blocked', 'escalate', 'permission_denied'];
  
  if (nonRetryableErrors.includes(context.error_type)) {
    return {
      should_retry: false,
      action: 'escalate',
      reason: `Non-retryable error type: ${context.error_type}`
    };
  }
  
  if (context.retry_count >= cfg.maxRetry) {
    return {
      should_retry: false,
      action: cfg.strategy === 'interactive' ? 'prompt_escalate' : 'escalate',
      reason: `Max retry (${cfg.maxRetry}) exceeded`
    };
  }
  
  if (!retryableErrors.includes(context.error_type)) {
    return {
      should_retry: false,
      action: 'escalate',
      reason: `Unknown error type: ${context.error_type}`
    };
  }
  
  if (cfg.strategy === 'interactive') {
    return {
      should_retry: true,
      action: 'prompt_retry',
      reason: 'Interactive retry - awaiting user decision',
      modified_context: {
        ...context,
        retry_count: context.retry_count + 1,
        previous_failure_reason: context.error_message
      }
    };
  }
  
  if (cfg.strategy === 'auto') {
    return {
      should_retry: true,
      action: 'retry',
      reason: 'Auto retry enabled',
      modified_context: {
        ...context,
        retry_count: context.retry_count + 1,
        previous_failure_reason: context.error_message
      }
    };
  }
  
  return {
    should_retry: false,
    action: 'abort',
    reason: 'Retry strategy disabled'
  };
}

/**
 * Prompt user for retry decision
 * 
 * @param {RetryContext} context - Retry context
 * @param {Object} [config] - Retry configuration
 * @returns {RetryDecision} User's retry decision
 */
function promptRetryDecision(context, config = {}) {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  console.log('');
  console.log(`\x1b[33m\x1b[1m=== RETRY DECISION ===\x1b[0m`);
  console.log(`Error: ${context.error_message}`);
  console.log(`Retry count: ${context.retry_count}/${cfg.maxRetry}`);
  console.log('');
  console.log('Options:');
  console.log('  [R] Retry - Attempt again');
  console.log('  [A] Abort - Stop execution');
  console.log('  [E] Escalate - Escalate to manager');
  console.log('');
  
  return {
    should_retry: true,
    action: 'awaiting_input',
    reason: 'Waiting for user input'
  };
}

/**
 * Process user input for retry decision
 * 
 * @param {string} input - User input (R/A/E)
 * @param {RetryContext} context - Retry context
 * @param {Object} [config] - Retry configuration
 * @returns {RetryDecision} Final retry decision
 */
function processUserInput(input, context, config = {}) {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  const inputMap = {
    'R': 'retry',
    'r': 'retry',
    'A': 'abort',
    'a': 'abort',
    'E': 'escalate',
    'e': 'escalate'
  };
  
  const action = inputMap[input];
  
  if (!action) {
    return {
      should_retry: false,
      action: 'invalid_input',
      reason: `Invalid input: ${input}. Use R/A/E`
    };
  }
  
  if (action === 'retry') {
    if (context.retry_count >= cfg.maxRetry) {
      return {
        should_retry: false,
        action: 'escalate',
        reason: `Max retry (${cfg.maxRetry}) exceeded`
      };
    }
    return {
      should_retry: true,
      action: 'retry',
      reason: 'User chose retry',
      modified_context: {
        ...context,
        retry_count: context.retry_count + 1
      }
    };
  }
  
  if (action === 'abort') {
    return {
      should_retry: false,
      action: 'abort',
      reason: 'User chose abort'
    };
  }
  
  if (action === 'escalate') {
    return {
      should_retry: false,
      action: 'escalate',
      reason: 'User chose escalate'
    };
  }
  
  return {
    should_retry: false,
    action: 'abort',
    reason: 'Unknown action'
  };
}

/**
 * Get retry statistics
 * 
 * @param {RetryContext} context - Retry context
 * @param {Object} [config] - Retry configuration
 * @returns {Object} Retry statistics
 */
function getRetryStats(context, config = {}) {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  return {
    current_retry: context.retry_count,
    max_retry: cfg.maxRetry,
    remaining: cfg.maxRetry - context.retry_count,
    strategy: cfg.strategy,
    trigger: cfg.trigger,
    can_retry: context.retry_count < cfg.maxRetry
  };
}

module.exports = {
  handleRetry,
  promptRetryDecision,
  processUserInput,
  getRetryStats,
  DEFAULT_RETRY_CONFIG
};