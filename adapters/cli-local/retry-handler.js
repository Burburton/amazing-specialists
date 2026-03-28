/**
 * retry-handler.js
 * 
 * Interactive retry handler for CLI/Local adapter.
 * Max retry: 2, user decides retry/abort.
 * 
 * Reference: ADAPTERS.md §Retry Strategy, AC-002
 */

'use strict';

const readline = require('readline');

/**
 * Default maximum retry count per ADAPTERS.md.
 */
const DEFAULT_MAX_RETRY = 2;

/**
 * Handle retry decision for failed execution.
 * Prompts user for retry/abort decision.
 * 
 * @param {RetryContext} retryContext - Retry context with error info
 * @param {number} maxRetry - Maximum retry allowed (default 2)
 * @returns {Promise<RetryDecision>} 'retry', 'abort', or 'escalate'
 * 
 * @example
 * const handler = require('./retry-handler');
 * const decision = await handler.handleRetry({
 *   retry_count: 1,
 *   max_retry: 2,
 *   previous_error: new Error('Validation failed')
 * });
 */
async function handleRetry(retryContext, maxRetry = DEFAULT_MAX_RETRY) {
  const currentRetry = retryContext.retry_count || 0;
  
  if (currentRetry >= maxRetry) {
    console.log(`\n[RETRY] Maximum retries (${maxRetry}) reached. Escalating...`);
    return 'escalate';
  }
  
  printRetryInfo(retryContext, currentRetry, maxRetry);
  
  return await promptRetryDecision(currentRetry, maxRetry);
}

/**
 * Print retry information to console.
 * 
 * @param {RetryContext} retryContext - Retry context
 * @param {number} currentRetry - Current retry count
 * @param {number} maxRetry - Maximum retry allowed
 */
function printRetryInfo(retryContext, currentRetry, maxRetry) {
  console.log('\n' + '='.repeat(50));
  console.log('[RETRY] Execution failed');
  console.log('='.repeat(50));
  
  console.log(`\nAttempt: ${currentRetry + 1}/${maxRetry + 1}`);
  
  if (retryContext.previous_error) {
    console.log(`\nError: ${retryContext.previous_error.message}`);
  }
  
  if (retryContext.previous_output) {
    console.log('\nPrevious output summary:');
    console.log(JSON.stringify(retryContext.previous_output, null, 2).slice(0, 500));
  }
}

/**
 * Prompt user for retry/abort decision.
 * 
 * @param {number} currentRetry - Current retry count
 * @param {number} maxRetry - Maximum retry allowed
 * @returns {Promise<RetryDecision>} User's decision
 */
async function promptRetryDecision(currentRetry, maxRetry) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    const remainingAttempts = maxRetry - currentRetry;
    rl.question(`\nRetry? (y/n) [${remainingAttempts} attempts remaining]: `, (answer) => {
      rl.close();
      
      const decision = answer.toLowerCase().trim();
      
      if (decision === 'y' || decision === 'yes' || decision === 'retry') {
        console.log('[RETRY] Retrying execution...');
        resolve('retry');
      } else if (decision === 'e' || decision === 'escalate') {
        console.log('[RETRY] Escalating instead of retry...');
        resolve('escalate');
      } else {
        console.log('[RETRY] Aborting execution...');
        resolve('abort');
      }
    });
  });
}

/**
 * Check if retry should be auto-triggered based on error type.
 * Certain error types may warrant automatic retry.
 * 
 * @param {Error} error - The error that occurred
 * @returns {boolean} Whether auto-retry is appropriate
 */
function shouldAutoRetry(error) {
  const autoRetryPatterns = [
    /timeout/i,
    /network/i,
    /temporary/i,
    /rate limit/i,
    /connection/i
  ];
  
  const message = error.message || '';
  return autoRetryPatterns.some(pattern => pattern.test(message));
}

/**
 * Create retry context from previous failure.
 * 
 * @param {number} retryCount - Current retry count
 * @param {Error} error - Previous error
 * @param {any} previousOutput - Previous output
 * @returns {RetryContext} Retry context object
 */
function createRetryContext(retryCount, error, previousOutput) {
  return {
    retry_count: retryCount,
    max_retry: DEFAULT_MAX_RETRY,
    previous_error: error,
    previous_output: previousOutput
  };
}

/**
 * Execute with retry logic.
 * Wraps an async function with automatic retry handling.
 * 
 * @param {Function} fn - Async function to execute
 * @param {RetryOptions} options - Retry options
 * @returns {Promise<any>} Result of successful execution
 * 
 * @example
 * const result = await executeWithRetry(
 *   async () => doSomething(),
 *   { maxRetry: 2, interactive: true }
 * );
 */
async function executeWithRetry(fn, options = {}) {
  const maxRetry = options.maxRetry || DEFAULT_MAX_RETRY;
  const interactive = options.interactive !== false;
  
  let retryCount = 0;
  let lastError = null;
  let lastOutput = null;
  
  while (retryCount <= maxRetry) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      retryCount++;
      
      if (retryCount <= maxRetry) {
        if (interactive) {
          const context = createRetryContext(retryCount - 1, error, lastOutput);
          const decision = await handleRetry(context, maxRetry);
          
          if (decision === 'abort') {
            throw error;
          } else if (decision === 'escalate') {
            throw new Error(`Escalation requested after ${retryCount} attempts: ${error.message}`);
          }
        } else if (!shouldAutoRetry(error)) {
          throw error;
        }
      }
    }
  }
  
  throw lastError;
}

module.exports = {
  handleRetry,
  promptRetryDecision,
  shouldAutoRetry,
  createRetryContext,
  executeWithRetry,
  DEFAULT_MAX_RETRY
};