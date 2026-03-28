/**
 * Unit tests for RetryHandler
 * 
 * Tests retry decisions, backoff calculation, max retry limits,
 * and risk-level rules (BR-009).
 */

const { RetryHandler } = require('../../retry-handler');

describe('RetryHandler', () => {
  let handler;
  let defaultConfig;

  beforeEach(() => {
    defaultConfig = {
      max_retry: 1,
      backoff_seconds: 300,
      no_retry_for_risk: ['high', 'critical'],
      comment_on_retry: true
    };
    handler = new RetryHandler(defaultConfig);
  });

  describe('constructor', () => {
    test('initializes with provided config', () => {
      expect(handler.maxRetry).toBe(1);
      expect(handler.backoffSeconds).toBe(300);
      expect(handler.noRetryForRisk).toEqual(['high', 'critical']);
      expect(handler.commentOnRetry).toBe(true);
    });

    test('uses default values when config not provided', () => {
      const emptyHandler = new RetryHandler();
      expect(emptyHandler.maxRetry).toBe(1);
      expect(emptyHandler.backoffSeconds).toBe(300);
      expect(emptyHandler.noRetryForRisk).toEqual(['high', 'critical']);
      expect(emptyHandler.commentOnRetry).toBe(true);
    });

    test('accepts partial config', () => {
      const partialHandler = new RetryHandler({ max_retry: 3 });
      expect(partialHandler.maxRetry).toBe(3);
      expect(partialHandler.backoffSeconds).toBe(300);
    });

    test('handles null config', () => {
      const nullHandler = new RetryHandler(null);
      expect(nullHandler.maxRetry).toBe(1);
    });

    test('handles undefined config', () => {
      const undefinedHandler = new RetryHandler(undefined);
      expect(undefinedHandler.maxRetry).toBe(1);
    });
  });

  describe('shouldRetry - BR-009 Retry Limit', () => {
    test('returns retry decision when retry_count < max_retry', () => {
      const context = { retry_count: 0, risk_level: 'low' };
      const result = handler.shouldRetry(context);
      
      expect(result.decision).toBe('retry');
      expect(result.reason).toBe('Retry allowed');
      expect(result.backoff_seconds).toBeDefined();
    });

    test('returns escalate when retry_count >= max_retry', () => {
      const context = { retry_count: 1, risk_level: 'low' };
      const result = handler.shouldRetry(context);
      
      expect(result.decision).toBe('escalate');
      expect(result.reason).toBe('Max retry (1) exceeded');
    });

    test('returns escalate when retry_count exceeds max_retry', () => {
      const context = { retry_count: 5, risk_level: 'low' };
      const result = handler.shouldRetry(context);
      
      expect(result.decision).toBe('escalate');
    });

    test('returns escalate for high risk level', () => {
      const context = { retry_count: 0, risk_level: 'high' };
      const result = handler.shouldRetry(context);
      
      expect(result.decision).toBe('escalate');
      expect(result.reason).toContain('high');
    });

    test('returns escalate for critical risk level', () => {
      const context = { retry_count: 0, risk_level: 'critical' };
      const result = handler.shouldRetry(context);
      
      expect(result.decision).toBe('escalate');
      expect(result.reason).toContain('critical');
    });

    test('allows retry for medium risk level', () => {
      const context = { retry_count: 0, risk_level: 'medium' };
      const result = handler.shouldRetry(context);
      
      expect(result.decision).toBe('retry');
    });

    test('allows retry for low risk level', () => {
      const context = { retry_count: 0, risk_level: 'low' };
      const result = handler.shouldRetry(context);
      
      expect(result.decision).toBe('retry');
    });

    test('handles missing risk_level', () => {
      const context = { retry_count: 0 };
      const result = handler.shouldRetry(context);
      
      expect(result.decision).toBe('retry');
    });

    test('handles undefined risk_level', () => {
      const context = { retry_count: 0, risk_level: undefined };
      const result = handler.shouldRetry(context);
      
      expect(result.decision).toBe('retry');
    });

    test('handles null risk_level', () => {
      const context = { retry_count: 0, risk_level: null };
      const result = handler.shouldRetry(context);
      
      expect(result.decision).toBe('retry');
    });

    test('respects custom no_retry_for_risk config', () => {
      const customHandler = new RetryHandler({
        max_retry: 2,
        no_retry_for_risk: ['critical'] // Only critical prevents retry
      });
      
      const highRiskContext = { retry_count: 0, risk_level: 'high' };
      const criticalRiskContext = { retry_count: 0, risk_level: 'critical' };
      
      expect(customHandler.shouldRetry(highRiskContext).decision).toBe('retry');
      expect(customHandler.shouldRetry(criticalRiskContext).decision).toBe('escalate');
    });

    test('allows retry for all risk levels when no_retry_for_risk is empty', () => {
      const lenientHandler = new RetryHandler({
        max_retry: 1,
        no_retry_for_risk: []
      });
      
      const criticalContext = { retry_count: 0, risk_level: 'critical' };
      expect(lenientHandler.shouldRetry(criticalContext).decision).toBe('retry');
    });
  });

  describe('getBackoffDuration - Exponential Backoff', () => {
    test('returns base backoff for first retry (retry_count = 0)', () => {
      const backoff = handler.getBackoffDuration(0);
      expect(backoff).toBe(300);
    });

    test('returns doubled backoff for second retry (retry_count = 1)', () => {
      const backoff = handler.getBackoffDuration(1);
      expect(backoff).toBe(600);
    });

    test('returns quadrupled backoff for third retry (retry_count = 2)', () => {
      const backoff = handler.getBackoffDuration(2);
      expect(backoff).toBe(1200);
    });

    test('caps backoff at 1 hour (3600 seconds)', () => {
      // With base 300 and exponential, we hit max quickly
      const backoff = handler.getBackoffDuration(10);
      expect(backoff).toBe(3600);
    });

    test('never exceeds max backoff', () => {
      for (let i = 0; i < 20; i++) {
        const backoff = handler.getBackoffDuration(i);
        expect(backoff).toBeLessThanOrEqual(3600);
      }
    });

    test('respects custom base backoff', () => {
      const customHandler = new RetryHandler({ backoff_seconds: 60 });
      expect(customHandler.getBackoffDuration(0)).toBe(60);
      expect(customHandler.getBackoffDuration(1)).toBe(120);
    });

    test('exponential backoff formula: base * 2^retry', () => {
      const base = 300;
      expect(handler.getBackoffDuration(0)).toBe(base * Math.pow(2, 0));
      expect(handler.getBackoffDuration(1)).toBe(base * Math.pow(2, 1));
      expect(handler.getBackoffDuration(2)).toBe(base * Math.pow(2, 2));
      expect(handler.getBackoffDuration(3)).toBe(Math.min(base * Math.pow(2, 3), 3600));
    });
  });

  describe('buildRetryContext', () => {
    test('builds retry context with incremented count', () => {
      const error = { message: 'Test error' };
      const previousResult = { retry_context: { retry_count: 0 } };
      
      const context = handler.buildRetryContext(error, previousResult);
      
      expect(context.retry_count).toBe(1);
    });

    test('handles missing previous retry_context', () => {
      const error = { message: 'Test error' };
      const previousResult = {};
      
      const context = handler.buildRetryContext(error, previousResult);
      
      expect(context.retry_count).toBe(1);
    });

    test('handles null previousResult', () => {
      const error = { message: 'Test error' };
      const context = handler.buildRetryContext(error, null);
      
      expect(context.retry_count).toBe(1);
      expect(context.previous_failure_reason).toBe('Test error');
    });

    test('handles undefined previousResult', () => {
      const error = { message: 'Test error' };
      const context = handler.buildRetryContext(error, undefined);
      
      expect(context.retry_count).toBe(1);
    });

    test('extracts previous_failure_reason from error', () => {
      const error = { message: 'Connection timeout' };
      const context = handler.buildRetryContext(error, {});
      
      expect(context.previous_failure_reason).toBe('Connection timeout');
    });

    test('uses default message when error has no message', () => {
      const error = {};
      const context = handler.buildRetryContext(error, {});
      
      expect(context.previous_failure_reason).toBe('Unknown error');
    });

    test('handles null error', () => {
      const context = handler.buildRetryContext(null, {});
      
      expect(context.previous_failure_reason).toBe('Unknown error');
    });

    test('summarizes previous result', () => {
      const result = {
        status: 'FAILED_RETRYABLE',
        summary: 'Execution failed due to timeout'
      };
      const context = handler.buildRetryContext({}, result);
      
      expect(context.previous_output_summary).toContain('FAILED_RETRYABLE');
      expect(context.previous_output_summary).toContain('timeout');
    });

    test('truncates long summaries to 200 chars', () => {
      const longSummary = 'A'.repeat(500);
      const result = { summary: longSummary };
      const context = handler.buildRetryContext({}, result);
      
      expect(context.previous_output_summary.length).toBeLessThan(250);
    });

    test('extracts required fixes from critical issues', () => {
      const result = {
        issues_found: [
          { severity: 'critical', recommendation: 'Fix authentication' },
          { severity: 'high', recommendation: 'Update config' },
          { severity: 'low', recommendation: 'Minor cleanup' }
        ]
      };
      const context = handler.buildRetryContext({}, result);
      
      expect(context.required_fixes).toContain('Fix authentication');
      expect(context.required_fixes).toContain('Update config');
      expect(context.required_fixes).not.toContain('Minor cleanup');
    });

    test('returns empty required_fixes when no critical/high issues', () => {
      const result = {
        issues_found: [
          { severity: 'low', recommendation: 'Minor cleanup' }
        ]
      };
      const context = handler.buildRetryContext({}, result);
      
      expect(context.required_fixes).toEqual([]);
    });

    test('returns empty required_fixes when issues_found is empty', () => {
      const result = { issues_found: [] };
      const context = handler.buildRetryContext({}, result);
      
      expect(context.required_fixes).toEqual([]);
    });

    test('returns empty required_fixes when issues_found missing', () => {
      const result = {};
      const context = handler.buildRetryContext({}, result);
      
      expect(context.required_fixes).toEqual([]);
    });

    test('uses description when recommendation missing', () => {
      const result = {
        issues_found: [
          { severity: 'critical', description: 'Critical bug found' }
        ]
      };
      const context = handler.buildRetryContext({}, result);
      
      expect(context.required_fixes).toContain('Critical bug found');
    });

    test('filters out issues without recommendation or description', () => {
      const result = {
        issues_found: [
          { severity: 'critical' },
          { severity: 'high', recommendation: 'Fix this' }
        ]
      };
      const context = handler.buildRetryContext({}, result);
      
      expect(context.required_fixes).toEqual(['Fix this']);
    });
  });

  describe('summarizeResult', () => {
    test('returns default message for null result', () => {
      expect(handler.summarizeResult(null)).toBe('No previous result');
    });

    test('returns default message for undefined result', () => {
      expect(handler.summarizeResult(undefined)).toBe('No previous result');
    });

    test('returns default message for empty result', () => {
      expect(handler.summarizeResult({})).toBe('No summary available');
    });

    test('includes status when present', () => {
      const result = { status: 'SUCCESS' };
      expect(handler.summarizeResult(result)).toBe('Status: SUCCESS');
    });

    test('includes truncated summary when present', () => {
      const result = { status: 'FAILED', summary: 'Something went wrong' };
      const summary = handler.summarizeResult(result);
      expect(summary).toContain('Status: FAILED');
      expect(summary).toContain('Something went wrong');
    });

test('truncates summary to 200 chars', () => {
      const longSummary = 'X'.repeat(300);
      const result = { status: 'FAILED', summary: longSummary };
      const truncated = handler.summarizeResult(result);
      // Includes Status (approx 20) + '. ' + Summary: (max 200) = ~222 chars
      expect(truncated.length).toBeLessThanOrEqual(235);
    });

    test('handles result with only summary', () => {
      const result = { summary: 'Task completed' };
      expect(handler.summarizeResult(result)).toContain('Task completed');
    });
  });

  describe('extractRequiredFixes', () => {
    test('returns empty array for null result', () => {
      expect(handler.extractRequiredFixes(null)).toEqual([]);
    });

    test('returns empty array for undefined result', () => {
      expect(handler.extractRequiredFixes(undefined)).toEqual([]);
    });

    test('returns empty array for missing issues_found', () => {
      expect(handler.extractRequiredFixes({})).toEqual([]);
    });

    test('returns empty array for empty issues_found', () => {
      expect(handler.extractRequiredFixes({ issues_found: [] })).toEqual([]);
    });

    test('extracts only critical and high severity issues', () => {
      const result = {
        issues_found: [
          { severity: 'critical', recommendation: 'Fix critical' },
          { severity: 'high', recommendation: 'Fix high' },
          { severity: 'medium', recommendation: 'Fix medium' },
          { severity: 'low', recommendation: 'Fix low' }
        ]
      };
      const fixes = handler.extractRequiredFixes(result);
      
      expect(fixes).toContain('Fix critical');
      expect(fixes).toContain('Fix high');
      expect(fixes).toHaveLength(2);
    });

    test('uses description as fallback', () => {
      const result = {
        issues_found: [
          { severity: 'critical', description: 'Critical error' }
        ]
      };
      expect(handler.extractRequiredFixes(result)).toContain('Critical error');
    });

    test('prefers recommendation over description', () => {
      const result = {
        issues_found: [
          { severity: 'critical', recommendation: 'Do this', description: 'Error desc' }
        ]
      };
      expect(handler.extractRequiredFixes(result)).toContain('Do this');
    });

    test('filters out issues without recommendation or description', () => {
      const result = {
        issues_found: [
          { severity: 'critical' },
          { severity: 'high', recommendation: 'Valid fix' }
        ]
      };
      expect(handler.extractRequiredFixes(result)).toEqual(['Valid fix']);
    });
  });

  describe('formatRetryCommentVars', () => {
    test('formats all retry comment variables', () => {
      const context = {
        retry_count: 2,
        previous_failure_reason: 'Network timeout',
        required_fixes: ['Increase timeout', 'Add retry logic']
      };
      
      const vars = handler.formatRetryCommentVars(context);
      
      expect(vars.retry_count).toBe(2);
      expect(vars.previous_failure_reason).toBe('Network timeout');
      expect(vars.required_fixes).toEqual(['Increase timeout', 'Add retry logic']);
      expect(vars.max_retry).toBe(1);
    });

    test('handles empty required_fixes', () => {
      const context = {
        retry_count: 1,
        previous_failure_reason: 'Error',
        required_fixes: []
      };
      
      const vars = handler.formatRetryCommentVars(context);
      expect(vars.required_fixes).toEqual([]);
    });

    test('includes max_retry from config', () => {
      const customHandler = new RetryHandler({ max_retry: 5 });
      const vars = customHandler.formatRetryCommentVars({});
      
      expect(vars.max_retry).toBe(5);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles very high retry counts', () => {
      const context = { retry_count: 1000, risk_level: 'low' };
      const result = handler.shouldRetry(context);
      
      expect(result.decision).toBe('escalate');
    });

    test('handles negative retry count (should allow retry)', () => {
      const context = { retry_count: -1, risk_level: 'low' };
      const result = handler.shouldRetry(context);
      
      // -1 < 1, so retry allowed
      expect(result.decision).toBe('retry');
    });

    test('handles string retry_count', () => {
      const context = { retry_count: '0', risk_level: 'low' };
      const result = handler.shouldRetry(context);
      
      // String '0' should be treated as 0, retry allowed
      expect(result.decision).toBe('retry');
    });

    test('handles string max_retry config', () => {
      const stringHandler = new RetryHandler({ max_retry: '2' });
      const context = { retry_count: 1, risk_level: 'low' };
      
      // Should still work with string config
      const result = stringHandler.shouldRetry(context);
      expect(result.decision).toBe('retry');
    });

    test('handles empty context object', () => {
      const result = handler.shouldRetry({});
      
      // No retry_count defaults to undefined, which is < 1
      expect(result.decision).toBe('retry');
    });

    test('handles null context', () => {
      // This would throw, but we test graceful handling
      expect(() => handler.shouldRetry(null)).toThrow();
    });

    test('handles unknown risk levels', () => {
      const context = { retry_count: 0, risk_level: 'unknown' };
      const result = handler.shouldRetry(context);
      
      // Unknown risk level is not in no_retry_for_risk, so retry allowed
      expect(result.decision).toBe('retry');
    });

    test('handles zero max_retry config', () => {
      const zeroRetryHandler = new RetryHandler({ max_retry: 0 });
      const context = { retry_count: 0, risk_level: 'low' };
      const result = zeroRetryHandler.shouldRetry(context);
      
      // retry_count 0 >= max_retry 0, so escalate
      expect(result.decision).toBe('escalate');
    });
  });

  describe('Integration Scenarios', () => {
    test('complete retry flow simulation', () => {
      // First attempt fails
      const error1 = { message: 'Network timeout' };
      const result1 = { status: 'FAILED_RETRYABLE' };
      
      // Build retry context
      const retryContext = handler.buildRetryContext(error1, result1);
      expect(retryContext.retry_count).toBe(1);
      
      // Decide on retry
      const decision1 = handler.shouldRetry({
        retry_count: retryContext.retry_count,
        risk_level: 'low'
      });
      expect(decision1.decision).toBe('escalate'); // max_retry is 1
      
      // Format comment vars
      const vars = handler.formatRetryCommentVars(retryContext);
      expect(vars.retry_count).toBe(1);
      expect(vars.max_retry).toBe(1);
    });

    test('high risk task never retries', () => {
      const error = { message: 'Security vulnerability found' };
      const result = { status: 'FAILED_RETRYABLE', retry_context: { retry_count: 0 } };
      
      const context = handler.buildRetryContext(error, result);
      const decision = handler.shouldRetry({
        retry_count: context.retry_count,
        risk_level: 'high'
      });
      
      expect(decision.decision).toBe('escalate');
      expect(decision.reason).toContain('high');
    });

    test('multiple retries with increasing backoff', () => {
      const multiRetryHandler = new RetryHandler({
        max_retry: 3,
        backoff_seconds: 60
      });
      
      const backoffs = [];
      for (let i = 0; i < 4; i++) {
        const decision = multiRetryHandler.shouldRetry({
          retry_count: i,
          risk_level: 'low'
        });
        
        if (decision.decision === 'retry') {
          backoffs.push(decision.backoff_seconds);
        }
      }
      
      expect(backoffs[0]).toBe(60);
      expect(backoffs[1]).toBe(120);
      expect(backoffs[2]).toBe(240);
    });
  });
});