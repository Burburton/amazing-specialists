const RetryDecision = {
  RETRY: 'retry',
  ABORT: 'abort',
  ESCALATE: 'escalate'
};

class RetryHandler {
  constructor(config) {
    this.config = config || {};
    this.maxRetry = this.config.max_retry || 2;
    this.retryLabels = this.config.retry_labels || {
      approved: 'retry-approved',
      aborted: 'retry-aborted'
    };
  }

  shouldRetry(context) {
    if (context.retry_count >= this.maxRetry) {
      return {
        decision: RetryDecision.ESCALATE,
        reason: `Max retry limit (${this.maxRetry}) exceeded`,
        backoff_seconds: 0
      };
    }

    if (context.risk_level === 'critical') {
      return {
        decision: RetryDecision.ESCALATE,
        reason: 'Critical risk level prevents automatic retry',
        backoff_seconds: 0
      };
    }

    if (context.error_type === 'permission_denied') {
      return {
        decision: RetryDecision.ESCALATE,
        reason: 'Permission errors require manual intervention',
        backoff_seconds: 0
      };
    }

    const backoff = this.calculateBackoff(context.retry_count);

    return {
      decision: RetryDecision.RETRY,
      reason: `Retry ${context.retry_count + 1}/${this.maxRetry} allowed`,
      backoff_seconds: backoff
    };
  }

  async checkRetryDecision(prClient, owner, repo, issueNumber) {
    const labels = await prClient.getLabels(owner, repo, issueNumber);

    if (labels.includes(this.retryLabels.approved)) {
      await prClient.removeLabel(owner, repo, issueNumber, this.retryLabels.approved);
      return { decision: RetryDecision.RETRY, approved: true };
    }

    if (labels.includes(this.retryLabels.aborted)) {
      await prClient.removeLabel(owner, repo, issueNumber, this.retryLabels.aborted);
      return { decision: RetryDecision.ABORT, approved: false };
    }

    return { decision: null, approved: null, waiting: true };
  }

  calculateBackoff(retryCount) {
    const baseSeconds = [5, 30, 120, 300, 600];
    const index = Math.min(retryCount, baseSeconds.length - 1);
    return baseSeconds[index];
  }

  buildRetryContext(executionResult, previousError) {
    return {
      retry_count: 0,
      max_retry: this.maxRetry,
      previous_failure_reason: previousError?.message || 'Unknown error',
      previous_output_summary: executionResult?.summary || '',
      required_fixes: this.extractRequiredFixes(executionResult),
      error_type: this.classifyError(previousError),
      risk_level: executionResult?.risk_level || 'medium',
      retry_label_approved: this.retryLabels.approved,
      retry_label_aborted: this.retryLabels.aborted
    };
  }

  extractRequiredFixes(executionResult) {
    const fixes = [];

    if (executionResult?.issues_found) {
      for (const issue of executionResult.issues_found) {
        if (issue.recommendation) {
          fixes.push(issue.recommendation);
        }
      }
    }

    return fixes;
  }

  classifyError(error) {
    if (!error) return 'unknown';

    if (error.status === 403 || error.status === 401) {
      return 'permission_denied';
    }

    if (error.status === 404) {
      return 'not_found';
    }

    if (error.status >= 500) {
      return 'server_error';
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return 'network_error';
    }

    return 'execution_error';
  }

  incrementRetry(context) {
    return {
      ...context,
      retry_count: context.retry_count + 1
    };
  }

  isRetryExhausted(context) {
    return context.retry_count >= this.maxRetry;
  }
}

module.exports = { RetryHandler, RetryDecision };