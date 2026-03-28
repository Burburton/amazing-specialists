/**
 * Retry Handler for GitHub Issue Adapter
 * 
 * Manages retry logic for failed task executions.
 */

class RetryHandler {
  /**
   * @param {object} config - Retry configuration from adapter config
   */
  constructor(config) {
    this.maxRetry = config?.max_retry ?? 1;
    this.backoffSeconds = config?.backoff_seconds ?? 300;
    this.noRetryForRisk = config?.no_retry_for_risk ?? ['high', 'critical'];
    this.commentOnRetry = config?.comment_on_retry ?? true;
  }

  /**
   * Determine if retry should be attempted
   * @param {object} context - Retry context
   * @returns {object} Decision with action
   */
  shouldRetry(context) {
    const { retry_count, risk_level } = context;
    
    // Check if risk level prevents retry
    if (risk_level && this.noRetryForRisk.includes(risk_level)) {
      return {
        decision: 'escalate',
        reason: `Risk level '${risk_level}' does not allow retry`
      };
    }
    
    // Check retry count
    if (retry_count >= this.maxRetry) {
      return {
        decision: 'escalate',
        reason: `Max retry (${this.maxRetry}) exceeded`
      };
    }
    
    return {
      decision: 'retry',
      reason: 'Retry allowed',
      backoff_seconds: this.getBackoffDuration(retry_count)
    };
  }

  /**
   * Build retry context for Dispatch Payload
   * @param {object} previousError - Previous execution error
   * @param {object} executionResult - Previous execution result
   * @returns {object} Retry context
   */
  buildRetryContext(previousError, executionResult) {
    return {
      retry_count: (executionResult?.retry_context?.retry_count ?? 0) + 1,
      previous_failure_reason: previousError?.message || 'Unknown error',
      previous_output_summary: this.summarizeResult(executionResult),
      required_fixes: this.extractRequiredFixes(executionResult)
    };
  }

  /**
   * Calculate backoff duration with exponential backoff
   * @param {number} retryCount - Current retry count
   * @returns {number} Backoff in seconds
   */
  getBackoffDuration(retryCount) {
    // Exponential backoff: base * 2^retry
    return Math.min(
      this.backoffSeconds * Math.pow(2, retryCount),
      3600 // Max 1 hour
    );
  }

  /**
   * Summarize execution result for retry context
   */
  summarizeResult(result) {
    if (!result) return 'No previous result';
    
    const parts = [];
    if (result.status) parts.push(`Status: ${result.status}`);
    if (result.summary) parts.push(`Summary: ${result.summary.substring(0, 200)}`);
    
    return parts.join('. ') || 'No summary available';
  }

  /**
   * Extract required fixes from issues_found
   */
  extractRequiredFixes(result) {
    if (!result?.issues_found || result.issues_found.length === 0) {
      return [];
    }
    
    return result.issues_found
      .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
      .map(issue => issue.recommendation || issue.description)
      .filter(Boolean);
  }

  /**
   * Format retry comment variables
   * @param {object} context - Retry context
   * @returns {object} Variables for comment template
   */
  formatRetryCommentVars(context) {
    return {
      retry_count: context.retry_count,
      previous_failure_reason: context.previous_failure_reason,
      required_fixes: context.required_fixes,
      max_retry: this.maxRetry
    };
  }
}

module.exports = { RetryHandler };