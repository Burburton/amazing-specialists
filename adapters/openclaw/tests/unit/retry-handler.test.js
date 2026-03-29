const { RetryHandler, DEFAULT_RETRY_CONFIG, RETRY_LIMITS_BY_RISK } = require('../../retry-handler');

describe('RetryHandler', () => {
  let handler;

  beforeEach(() => {
    handler = new RetryHandler();
  });

  describe('constructor', () => {
    test('initializes with default config', () => {
      expect(handler.config.strategy).toBe('auto');
      expect(handler.config.max_retry).toBe(2);
      expect(handler.config.backoff_type).toBe('exponential');
      expect(handler.config.backoff_initial_seconds).toBe(60);
    });

    test('merges custom config with defaults', () => {
      const customHandler = new RetryHandler({ max_retry: 5 });
      expect(customHandler.config.max_retry).toBe(5);
      expect(customHandler.config.strategy).toBe('auto');
    });

    test('handles null config', () => {
      const nullHandler = new RetryHandler({});
      expect(nullHandler.config.strategy).toBe('auto');
    });
  });

  describe('shouldRetry', () => {
    test('returns retry for low risk under limit', () => {
      const result = handler.shouldRetry({
        retry_count: 0,
        risk_level: 'low',
        previous_failure_reason: 'Error'
      });
      expect(result.should_retry).toBe(true);
      expect(result.escalate).toBe(false);
    });

    test('returns escalate when retry_count exceeds max', () => {
      const result = handler.shouldRetry({
        retry_count: 3,
        risk_level: 'low',
        previous_failure_reason: 'Error'
      });
      expect(result.should_retry).toBe(false);
      expect(result.escalate).toBe(true);
    });

    test('returns escalate for high risk', () => {
      const result = handler.shouldRetry({
        retry_count: 0,
        risk_level: 'high',
        previous_failure_reason: 'Error'
      });
      expect(result.should_retry).toBe(false);
      expect(result.escalate).toBe(true);
    });

    test('returns escalate for critical risk', () => {
      const result = handler.shouldRetry({
        retry_count: 0,
        risk_level: 'critical',
        previous_failure_reason: 'Error'
      });
      expect(result.should_retry).toBe(false);
      expect(result.escalate).toBe(true);
    });

    test('returns escalate when strategy is disabled', () => {
      const disabledHandler = new RetryHandler({ strategy: 'disabled' });
      const result = disabledHandler.shouldRetry({
        retry_count: 0,
        risk_level: 'low',
        previous_failure_reason: 'Error'
      });
      expect(result.should_retry).toBe(false);
    });
  });

  describe('calculateBackoff', () => {
    test('calculates exponential backoff', () => {
      const config = { backoff_type: 'exponential', backoff_initial_seconds: 60 };
      expect(handler.calculateBackoff(0, config)).toBe(60);
      expect(handler.calculateBackoff(1, config)).toBe(120);
      expect(handler.calculateBackoff(2, config)).toBe(240);
    });

    test('calculates linear backoff', () => {
      const config = { backoff_type: 'linear', backoff_initial_seconds: 60 };
      expect(handler.calculateBackoff(0, config)).toBe(60);
      expect(handler.calculateBackoff(1, config)).toBe(120);
      expect(handler.calculateBackoff(2, config)).toBe(180);
    });

    test('calculates fixed backoff', () => {
      const config = { backoff_type: 'fixed', backoff_initial_seconds: 60 };
      expect(handler.calculateBackoff(0, config)).toBe(60);
      expect(handler.calculateBackoff(1, config)).toBe(60);
      expect(handler.calculateBackoff(2, config)).toBe(60);
    });
  });

  describe('getMaxRetry', () => {
    test('returns 2 for low risk', () => {
      expect(handler.getMaxRetry('low')).toBe(2);
    });

    test('returns 1 for medium risk', () => {
      expect(handler.getMaxRetry('medium')).toBe(1);
    });

    test('returns 0 for high risk', () => {
      expect(handler.getMaxRetry('high')).toBe(0);
    });

    test('returns 0 for critical risk', () => {
      expect(handler.getMaxRetry('critical')).toBe(0);
    });
  });

  describe('isAutoRetryEnabled', () => {
    test('returns true for auto strategy', () => {
      expect(handler.isAutoRetryEnabled()).toBe(true);
    });

    test('returns false for manual strategy', () => {
      const manualHandler = new RetryHandler({ strategy: 'manual' });
      expect(manualHandler.isAutoRetryEnabled()).toBe(false);
    });

    test('returns false for disabled strategy', () => {
      const disabledHandler = new RetryHandler({ strategy: 'disabled' });
      expect(disabledHandler.isAutoRetryEnabled()).toBe(false);
    });
  });

  describe('isManualRetryRequired', () => {
    test('returns true for manual strategy', () => {
      const manualHandler = new RetryHandler({ strategy: 'manual' });
      expect(manualHandler.isManualRetryRequired()).toBe(true);
    });

    test('returns false for auto strategy', () => {
      expect(handler.isManualRetryRequired()).toBe(false);
    });
  });

  describe('isRetryDisabled', () => {
    test('returns true for disabled strategy', () => {
      const disabledHandler = new RetryHandler({ strategy: 'disabled' });
      expect(disabledHandler.isRetryDisabled()).toBe(true);
    });

    test('returns false for auto strategy', () => {
      expect(handler.isRetryDisabled()).toBe(false);
    });
  });

  describe('logRetry', () => {
    test('formats retry log with all fields', () => {
      const log = handler.logRetry({
        dispatch_id: 'dispatch-001',
        retry_count: 1,
        previous_failure_reason: 'Error',
        retry_strategy: 'auto'
      });
      expect(log.dispatch_id).toBe('dispatch-001');
      expect(log.retry_count).toBe(1);
      expect(log.retry_strategy).toBe('auto');
      expect(log.timestamp).toBeDefined();
    });
  });
});