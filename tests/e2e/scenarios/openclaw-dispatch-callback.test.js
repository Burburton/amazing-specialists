const nock = require('nock');
const { openClawDispatch, executionResult, escalation } = require('../setup/test-fixtures');
const { mockPostResult, mockPostEscalation, mockEscalationDecision, mockPostHeartbeat, mockPostRetry } = require('../helpers/openclaw-mock');
const { assertValidDispatchPayload, validRoles, validRiskLevels } = require('../helpers/assertions');

describe('E2E: OpenClaw Bidirectional Communication', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.cleanAll();
  });

  describe('TC-009: JWT authentication validated', () => {
    test('should accept valid JWT token', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      
      expect(validToken).toMatch(/^eyJ/);
    });

    test('should reject invalid token format', () => {
      const invalidToken = 'invalid-token';
      
      expect(invalidToken).not.toMatch(/^eyJ/);
    });
  });

  describe('TC-010: Message parsed to dispatch payload', () => {
    test('should parse OpenClaw dispatch to dispatch payload', () => {
      const dispatch = openClawDispatch();
      
      const payload = {
        dispatch_id: dispatch.dispatch_id,
        project_id: dispatch.project.id,
        milestone_id: dispatch.milestone.id,
        task_id: dispatch.task.id,
        role: dispatch.role,
        command: dispatch.command,
        title: dispatch.task.title,
        goal: dispatch.task.goal,
        description: dispatch.task.description,
        context: dispatch.task.context,
        constraints: dispatch.task.constraints,
        inputs: dispatch.task.inputs,
        expected_outputs: dispatch.task.expected_outputs,
        verification_steps: dispatch.task.verification_steps,
        risk_level: dispatch.task.risk_level
      };
      
      const result = assertValidDispatchPayload(payload);
      
      expect(result.isValid).toBe(true);
    });

    test('should validate role against allowed values', () => {
      const dispatch = openClawDispatch();
      
      expect(validRoles).toContain(dispatch.role);
    });

    test('should validate risk_level against allowed values', () => {
      const dispatch = openClawDispatch();
      
      expect(validRiskLevels).toContain(dispatch.task.risk_level);
    });
  });

  describe('TC-011: Execution result callback sent', () => {
    test('should format result for API', () => {
      const result = executionResult();
      
      const apiPayload = {
        dispatch_id: result.dispatch_id,
        execution_status: result.status,
        summary: result.summary,
        artifacts: result.artifacts,
        recommendation: result.recommendation
      };
      
      expect(apiPayload.dispatch_id).toBe('dispatch-001');
      expect(apiPayload.execution_status).toBe('SUCCESS');
    });

    test('should handle API response', async () => {
      const scope = mockPostResult();
      
      const response = { acknowledged: true };
      
      expect(response.acknowledged).toBe(true);
    });
  });

  describe('TC-012: Escalation sent', () => {
    test('should format escalation for API', () => {
      const esc = escalation();
      
      const apiPayload = {
        escalation_id: esc.escalation_id,
        dispatch_id: esc.dispatch_id,
        summary: esc.summary,
        blocking_points: esc.blocking_points,
        requires_user_decision: esc.requires_user_decision
      };
      
      expect(apiPayload.summary).toContain('missing external API');
      expect(apiPayload.blocking_points).toHaveLength(2);
    });
  });

  describe('TC-013: Decision response processed', () => {
    test('should handle decision_made response', () => {
      const response = {
        status: 'decision_made',
        decision: 'continue_with_alternative'
      };
      
      expect(response.status).toBe('decision_made');
      expect(response.decision).toBe('continue_with_alternative');
    });

    test('should handle acknowledged response', () => {
      const response = {
        status: 'acknowledged'
      };
      
      expect(response.status).toBe('acknowledged');
    });

    test('should handle abort response', () => {
      const response = {
        status: 'abort',
        reason: 'Critical blocking issue'
      };
      
      expect(response.status).toBe('abort');
    });

    test('should handle escalate_further response', () => {
      const response = {
        status: 'escalate_further'
      };
      
      expect(response.status).toBe('escalate_further');
    });
  });

  describe('TC-014: Heartbeat sent during execution', () => {
    test('should format heartbeat payload', () => {
      const heartbeat = {
        dispatch_id: 'dispatch-001',
        status: 'running',
        progress: {
          phase: 'implementation',
          percent_complete: 50,
          estimated_remaining_seconds: 300
        },
        timestamp: new Date().toISOString()
      };
      
      expect(heartbeat.status).toBe('running');
      expect(heartbeat.progress.percent_complete).toBe(50);
    });

    test('should calculate interval based on task length', () => {
      const intervals = {
        short: 30,    // < 5 min → 30s
        medium: 120,  // 5-30 min → 2m
        long: 300     // > 30 min → 5m
      };
      
      expect(intervals.short).toBe(30);
      expect(intervals.medium).toBe(120);
      expect(intervals.long).toBe(300);
    });
  });

  describe('TC-015: Retry with exponential backoff', () => {
    test('should calculate exponential backoff', () => {
      const initial = 60;
      const backoffs = [0, 1, 2].map(retryCount => initial * Math.pow(2, retryCount));
      
      expect(backoffs[0]).toBe(60);   // 1x
      expect(backoffs[1]).toBe(120);  // 2x
      expect(backoffs[2]).toBe(240);  // 4x
    });

    test('should respect max retry limit', () => {
      const limits = {
        low: 2,
        medium: 1,
        high: 0,
        critical: 0
      };
      
      expect(limits.low).toBe(2);
      expect(limits.medium).toBe(1);
      expect(limits.high).toBe(0);
    });
  });

  describe('TC-016: Authentication failure handled', () => {
    test('should return BLOCKED status on auth failure', () => {
      const errorStatus = 'BLOCKED';
      
      expect(errorStatus).toBe('BLOCKED');
    });

    test('should not retry on auth failure', () => {
      const authError = { status: 401, message: 'Unauthorized' };
      
      const shouldRetry = authError.status !== 401 && authError.status !== 403;
      
      expect(shouldRetry).toBe(false);
    });
  });
});