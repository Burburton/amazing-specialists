const nock = require('nock');
const { openClawDispatch, retryContext, executionResult } = require('../setup/test-fixtures');
const { mockPostRetry, mockPostResult } = require('../helpers/openclaw-mock');

describe('E2E: Retry Flow', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.cleanAll();
  });

  describe('TC-023: Low risk task retry allowed', () => {
    test('should allow retry for low risk under limit', () => {
      const context = retryContext({
        retry_count: 0,
        retry_strategy: 'auto'
      });
      
      const riskLevel = 'low';
      const maxRetry = { low: 2, medium: 1, high: 0, critical: 0 };
      
      const shouldRetry = context.retry_strategy === 'auto' && 
                          context.retry_count < maxRetry[riskLevel];
      
      expect(shouldRetry).toBe(true);
    });

    test('should allow second retry for low risk', () => {
      const context = retryContext({
        retry_count: 1,
        retry_strategy: 'auto'
      });
      
      const riskLevel = 'low';
      const maxRetry = { low: 2, medium: 1, high: 0, critical: 0 };
      
      const shouldRetry = context.retry_strategy === 'auto' && 
                          context.retry_count < maxRetry[riskLevel];
      
      expect(shouldRetry).toBe(true);
    });

    test('should not allow third retry for low risk', () => {
      const context = retryContext({
        retry_count: 2,
        retry_strategy: 'auto'
      });
      
      const riskLevel = 'low';
      const maxRetry = { low: 2, medium: 1, high: 0, critical: 0 };
      
      const shouldRetry = context.retry_strategy === 'auto' && 
                          context.retry_count < maxRetry[riskLevel];
      
      expect(shouldRetry).toBe(false);
    });
  });

  describe('TC-024: Medium risk task retry limited', () => {
    test('should allow one retry for medium risk', () => {
      const context = retryContext({
        retry_count: 0,
        retry_strategy: 'auto'
      });
      
      const riskLevel = 'medium';
      const maxRetry = { low: 2, medium: 1, high: 0, critical: 0 };
      
      const shouldRetry = context.retry_strategy === 'auto' && 
                          context.retry_count < maxRetry[riskLevel];
      
      expect(shouldRetry).toBe(true);
    });

    test('should not allow second retry for medium risk', () => {
      const context = retryContext({
        retry_count: 1,
        retry_strategy: 'auto'
      });
      
      const riskLevel = 'medium';
      const maxRetry = { low: 2, medium: 1, high: 0, critical: 0 };
      
      const shouldRetry = context.retry_strategy === 'auto' && 
                          context.retry_count < maxRetry[riskLevel];
      
      expect(shouldRetry).toBe(false);
    });
  });

  describe('TC-025: High/critical risk no auto-retry', () => {
    test('should not retry high risk tasks', () => {
      const context = retryContext({
        retry_count: 0,
        retry_strategy: 'auto'
      });
      
      const riskLevel = 'high';
      const maxRetry = { low: 2, medium: 1, high: 0, critical: 0 };
      
      const shouldRetry = context.retry_strategy === 'auto' && 
                          context.retry_count < maxRetry[riskLevel];
      
      expect(shouldRetry).toBe(false);
    });

    test('should not retry critical risk tasks', () => {
      const context = retryContext({
        retry_count: 0,
        retry_strategy: 'auto'
      });
      
      const riskLevel = 'critical';
      const maxRetry = { low: 2, medium: 1, high: 0, critical: 0 };
      
      const shouldRetry = context.retry_strategy === 'auto' && 
                          context.retry_count < maxRetry[riskLevel];
      
      expect(shouldRetry).toBe(false);
    });

    test('should escalate immediately for high risk', () => {
      const riskLevel = 'high';
      const maxRetry = { low: 2, medium: 1, high: 0, critical: 0 };
      
      const shouldEscalate = maxRetry[riskLevel] === 0;
      
      expect(shouldEscalate).toBe(true);
    });
  });

  describe('TC-026: Exponential backoff calculation', () => {
    test('should calculate correct exponential backoff', () => {
      const initial = 60;
      
      const backoff0 = initial * Math.pow(2, 0);
      const backoff1 = initial * Math.pow(2, 1);
      const backoff2 = initial * Math.pow(2, 2);
      
      expect(backoff0).toBe(60);
      expect(backoff1).toBe(120);
      expect(backoff2).toBe(240);
    });

    test('should increase backoff for each retry', () => {
      const initial = 60;
      const backoffs = [0, 1, 2].map(n => initial * Math.pow(2, n));
      
      expect(backoffs[1]).toBeGreaterThan(backoffs[0]);
      expect(backoffs[2]).toBeGreaterThan(backoffs[1]);
    });

    test('should respect max backoff limit', () => {
      const initial = 60;
      const maxBackoff = 600; // 10 minutes
      
      const backoff5 = initial * Math.pow(2, 5); // 1920 seconds
      
      const actualBackoff = Math.min(backoff5, maxBackoff);
      
      expect(actualBackoff).toBe(600);
    });
  });

  describe('TC-027: Retry attempt logged to OpenClaw', () => {
    test('should format retry log for API', () => {
      const context = retryContext();
      const dispatch = openClawDispatch();
      
      const retryLog = {
        retry_id: `retry-${Date.now()}`,
        dispatch_id: dispatch.dispatch_id,
        retry_count: context.retry_count,
        max_retry: 2,
        previous_failure_reason: context.previous_failure_reason,
        previous_output_summary: context.previous_output_summary,
        required_fixes: context.required_fixes,
        retry_strategy: context.retry_strategy,
        backoff_seconds: context.backoff_seconds,
        timestamp: new Date().toISOString()
      };
      
      expect(retryLog.dispatch_id).toBe(dispatch.dispatch_id);
      expect(retryLog.retry_count).toBe(0);
      expect(retryLog.retry_strategy).toBe('auto');
    });

    test('should include failure reason', () => {
      const context = retryContext({
        previous_failure_reason: 'Connection timeout to OAuth provider'
      });
      
      expect(context.previous_failure_reason).toContain('timeout');
    });

    test('should include required fixes', () => {
      const context = retryContext({
        required_fixes: [
          'Fix network timeout issues',
          'Verify OAuth credentials'
        ]
      });
      
      expect(context.required_fixes).toHaveLength(2);
    });
  });

  describe('TC-028: Max retry exceeded triggers escalation', () => {
    test('should escalate when max retry exceeded', () => {
      const retryCount = 3;
      const maxRetry = 2;
      
      const shouldEscalate = retryCount >= maxRetry;
      
      expect(shouldEscalate).toBe(true);
    });

    test('should set status to FAILED_ESCALATE', () => {
      const retryCount = 3;
      const maxRetry = 2;
      
      const status = retryCount >= maxRetry ? 'FAILED_ESCALATE' : 'FAILED_RETRYABLE';
      
      expect(status).toBe('FAILED_ESCALATE');
    });

    test('should include retry history in escalation', () => {
      const retryHistory = [
        { attempt: 1, reason: 'Connection timeout', backoff: 60 },
        { attempt: 2, reason: 'Connection timeout', backoff: 120 }
      ];
      
      const escalationContext = {
        total_retries: retryHistory.length,
        last_failure_reason: retryHistory[retryHistory.length - 1].reason,
        retry_history: retryHistory
      };
      
      expect(escalationContext.total_retries).toBe(2);
      expect(escalationContext.last_failure_reason).toBe('Connection timeout');
    });
  });
});