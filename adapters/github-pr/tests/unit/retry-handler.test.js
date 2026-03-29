const { RetryHandler, RetryDecision } = require('../../src/retry-handler');

describe('RetryHandler', () => {
  let handler;

  beforeEach(() => {
    handler = new RetryHandler({
      max_retry: 2,
      retry_labels: {
        approved: 'retry-approved',
        aborted: 'retry-aborted'
      }
    });
  });

  describe('shouldRetry', () => {
    it('should allow retry when under limit', () => {
      const context = { retry_count: 0, max_retry: 2, risk_level: 'low' };
      const decision = handler.shouldRetry(context);

      expect(decision.decision).toBe(RetryDecision.RETRY);
      expect(decision.reason).toContain('1/2');
    });

    it('should escalate when max retry exceeded', () => {
      const context = { retry_count: 2, max_retry: 2, risk_level: 'low' };
      const decision = handler.shouldRetry(context);

      expect(decision.decision).toBe(RetryDecision.ESCALATE);
      expect(decision.reason).toContain('exceeded');
    });

    it('should escalate for critical risk', () => {
      const context = { retry_count: 0, max_retry: 2, risk_level: 'critical' };
      const decision = handler.shouldRetry(context);

      expect(decision.decision).toBe(RetryDecision.ESCALATE);
    });

    it('should escalate for permission errors', () => {
      const context = { retry_count: 0, max_retry: 2, risk_level: 'low', error_type: 'permission_denied' };
      const decision = handler.shouldRetry(context);

      expect(decision.decision).toBe(RetryDecision.ESCALATE);
    });

    it('should calculate backoff time', () => {
      const context = { retry_count: 1, max_retry: 2, risk_level: 'medium' };
      const decision = handler.shouldRetry(context);

      expect(decision.backoff_seconds).toBeGreaterThan(0);
    });
  });

  describe('calculateBackoff', () => {
    it('should return increasing backoff times', () => {
      expect(handler.calculateBackoff(0)).toBe(5);
      expect(handler.calculateBackoff(1)).toBe(30);
      expect(handler.calculateBackoff(2)).toBe(120);
    });
  });

  describe('buildRetryContext', () => {
    it('should build context from execution result', () => {
      const result = {
        summary: 'Test summary',
        issues_found: [{ recommendation: 'Fix this' }],
        risk_level: 'medium'
      };
      const error = { message: 'Test error', status: 500 };

      const context = handler.buildRetryContext(result, error);

      expect(context.retry_count).toBe(0);
      expect(context.max_retry).toBe(2);
      expect(context.previous_failure_reason).toBe('Test error');
      expect(context.risk_level).toBe('medium');
      expect(context.required_fixes).toContain('Fix this');
    });
  });

  describe('classifyError', () => {
    it('should classify permission errors', () => {
      expect(handler.classifyError({ status: 403 })).toBe('permission_denied');
      expect(handler.classifyError({ status: 401 })).toBe('permission_denied');
    });

    it('should classify server errors', () => {
      expect(handler.classifyError({ status: 500 })).toBe('server_error');
      expect(handler.classifyError({ status: 502 })).toBe('server_error');
    });

    it('should classify network errors', () => {
      expect(handler.classifyError({ code: 'ETIMEDOUT' })).toBe('network_error');
      expect(handler.classifyError({ code: 'ENOTFOUND' })).toBe('network_error');
    });
  });

  describe('incrementRetry', () => {
    it('should increment retry count', () => {
      const context = { retry_count: 1 };
      const incremented = handler.incrementRetry(context);

      expect(incremented.retry_count).toBe(2);
    });
  });

  describe('isRetryExhausted', () => {
    it('should return true when exhausted', () => {
      expect(handler.isRetryExhausted({ retry_count: 2, max_retry: 2 })).toBe(true);
    });

    it('should return false when not exhausted', () => {
      expect(handler.isRetryExhausted({ retry_count: 1, max_retry: 2 })).toBe(false);
    });
  });
});