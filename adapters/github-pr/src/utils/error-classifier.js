/**
 * Error Classifier
 * 
 * Classifies GitHub API errors and maps them to ExecutionStatus.
 * 
 * @module error-classifier
 * @see io-contract.md §8
 * @see io-contract.md §2 (Execution Status)
 */

/**
 * Error classification result
 */
class ErrorClassification {
  /**
   * @param {object} params
   */
  constructor({ type, retryable, status, message, suggestion }) {
    this.type = type;
    this.retryable = retryable;
    this.status = status;
    this.message = message;
    this.suggestion = suggestion;
  }
}

/**
 * Error types
 */
const ErrorType = {
  AUTHENTICATION: 'authentication',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  VALIDATION: 'validation',
  RATE_LIMIT: 'rate_limit',
  NETWORK: 'network',
  SERVER: 'server',
  CONFLICT: 'conflict',
  UNKNOWN: 'unknown'
};

/**
 * Error Classifier class
 */
class ErrorClassifier {
  constructor() {
    this._classificationRules = [
      {
        test: (err) => err.status === 401,
        type: ErrorType.AUTHENTICATION,
        retryable: false,
        status: 'BLOCKED',
        message: 'Authentication failed. Check your GITHUB_TOKEN.',
        suggestion: 'Verify GITHUB_TOKEN environment variable is set and valid.'
      },
      {
        test: (err) => err.status === 403 && err.message?.includes('rate limit'),
        type: ErrorType.RATE_LIMIT,
        retryable: true,
        status: 'FAILED_RETRYABLE',
        message: 'GitHub API rate limit exceeded.',
        suggestion: 'Wait for rate limit reset or use GitHub App authentication for higher limits.'
      },
      {
        test: (err) => err.status === 403,
        type: ErrorType.PERMISSION,
        retryable: false,
        status: 'BLOCKED',
        message: 'Permission denied. Token lacks required scope.',
        suggestion: 'Ensure token has repo, pull_requests:write, and contents:write scopes.'
      },
      {
        test: (err) => err.status === 404,
        type: ErrorType.NOT_FOUND,
        retryable: false,
        status: 'BLOCKED',
        message: 'Resource not found.',
        suggestion: 'Verify repository, branch, or file exists and is accessible.'
      },
      {
        test: (err) => err.status === 422,
        type: ErrorType.VALIDATION,
        retryable: true,
        status: 'FAILED_RETRYABLE',
        message: 'Validation error from GitHub API.',
        suggestion: 'Check the request payload for invalid data.'
      },
      {
        test: (err) => err.status === 409,
        type: ErrorType.CONFLICT,
        retryable: true,
        status: 'FAILED_RETRYABLE',
        message: 'Merge conflict detected.',
        suggestion: 'Resolve conflicts manually or create a new branch.'
      },
      {
        test: (err) => err.status >= 500 && err.status < 600,
        type: ErrorType.SERVER,
        retryable: true,
        status: 'FAILED_RETRYABLE',
        message: 'GitHub server error.',
        suggestion: 'Retry the operation after a short delay.'
      },
      {
        test: (err) => err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED',
        type: ErrorType.NETWORK,
        retryable: true,
        status: 'FAILED_RETRYABLE',
        message: 'Network error. Cannot reach GitHub API.',
        suggestion: 'Check network connectivity and DNS resolution.'
      },
      {
        test: (err) => err.code === 'ETIMEDOUT',
        type: ErrorType.NETWORK,
        retryable: true,
        status: 'FAILED_RETRYABLE',
        message: 'Request timed out.',
        suggestion: 'Retry the operation. Consider increasing timeout.'
      }
    ];
  }

  /**
   * Classify an error
   * @param {Error|object} error - Error to classify
   * @returns {ErrorClassification}
   */
  classify(error) {
    if (!error) {
      return new ErrorClassification({
        type: ErrorType.UNKNOWN,
        retryable: false,
        status: 'FAILED_ESCALATE',
        message: 'Unknown error (no error provided)',
        suggestion: 'Check logs for more details.'
      });
    }

    for (const rule of this._classificationRules) {
      if (rule.test(error)) {
        return new ErrorClassification({
          type: rule.type,
          retryable: rule.retryable,
          status: rule.status,
          message: rule.message,
          suggestion: rule.suggestion
        });
      }
    }

    return new ErrorClassification({
      type: ErrorType.UNKNOWN,
      retryable: true,
      status: 'FAILED_RETRYABLE',
      message: error.message || 'Unknown error',
      suggestion: 'Retry the operation. If the problem persists, escalate.'
    });
  }

  /**
   * Map HTTP status code to ExecutionStatus
   * @param {number} statusCode - HTTP status code
   * @returns {string} ExecutionStatus
   */
  mapStatusToExecutionStatus(statusCode) {
    switch (statusCode) {
      case 401:
      case 403:
      case 404:
        return 'BLOCKED';
      case 422:
      case 409:
      case 500:
      case 502:
      case 503:
        return 'FAILED_RETRYABLE';
      default:
        return 'FAILED_RETRYABLE';
    }
  }

  /**
   * Check if error is retryable
   * @param {Error|object} error 
   * @returns {boolean}
   */
  isRetryable(error) {
    const classification = this.classify(error);
    return classification.retryable;
  }

  /**
   * Get user-friendly error message
   * @param {Error|object} error 
   * @returns {string}
   */
  getUserMessage(error) {
    const classification = this.classify(error);
    return `${classification.message} ${classification.suggestion}`;
  }

  /**
   * Get all error types
   * @returns {string[]}
   */
  getErrorTypes() {
    return Object.values(ErrorType);
  }
}

module.exports = { ErrorClassifier, ErrorType, ErrorClassification };