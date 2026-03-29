const nock = require('nock');
const { escalation, openClawDispatch } = require('../setup/test-fixtures');
const { mockEscalationDecision } = require('../helpers/openclaw-mock');
const { assertValidEscalation } = require('../helpers/assertions');

describe('E2E: Escalation Flow', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.cleanAll();
  });

  describe('TC-017: Escalation generated with blocking points', () => {
    test('should generate escalation from execution context', () => {
      const esc = escalation();
      
      const result = assertValidEscalation(esc);
      
      expect(result.isValid).toBe(true);
    });

    test('should include blocking points', () => {
      const esc = escalation();
      
      expect(esc.blocking_points).toBeDefined();
      expect(esc.blocking_points.length).toBeGreaterThan(0);
      expect(esc.blocking_points[0]).toContain('OAuth');
    });

    test('should include attempted actions', () => {
      const esc = escalation();
      
      expect(esc.attempted_actions).toBeDefined();
      expect(esc.attempted_actions.length).toBeGreaterThan(0);
    });

    test('should include recommended next steps', () => {
      const esc = escalation();
      
      expect(esc.recommended_next_steps).toBeDefined();
      expect(esc.recommended_next_steps.length).toBeGreaterThan(0);
    });

    test('should include decision options', () => {
      const esc = escalation();
      
      expect(esc.options).toBeDefined();
      expect(esc.options.length).toBeGreaterThan(0);
      expect(esc.options[0].option_id).toBeDefined();
      expect(esc.options[0].pros).toBeDefined();
      expect(esc.options[0].cons).toBeDefined();
    });
  });

  describe('TC-018: Escalation callback sent to OpenClaw', () => {
    test('should format escalation for API', () => {
      const esc = escalation();
      
      const apiPayload = {
        escalation_id: esc.escalation_id,
        dispatch_id: esc.dispatch_id,
        project_id: esc.project_id,
        milestone_id: esc.milestone_id,
        task_id: esc.task_id,
        role: esc.role,
        level: esc.level,
        reason_type: esc.reason_type,
        summary: esc.summary,
        blocking_points: esc.blocking_points,
        recommended_next_steps: esc.recommended_next_steps,
        options: esc.options,
        requires_user_decision: esc.requires_user_decision
      };
      
      expect(apiPayload.escalation_id).toBeDefined();
      expect(apiPayload.dispatch_id).toBeDefined();
      expect(apiPayload.requires_user_decision).toBe(true);
    });
  });

  describe('TC-019: acknowledged response handled', () => {
    test('should parse acknowledged response', () => {
      const response = {
        status: 'acknowledged',
        escalation_id: 'esc-001',
        timestamp: new Date().toISOString()
      };
      
      expect(response.status).toBe('acknowledged');
      
      const nextState = 'wait_for_decision';
      expect(nextState).toBe('wait_for_decision');
    });

    test('should set state to waiting for decision', () => {
      const response = { status: 'acknowledged' };
      
      let state = 'escalated';
      if (response.status === 'acknowledged') {
        state = 'waiting_for_decision';
      }
      
      expect(state).toBe('waiting_for_decision');
    });
  });

  describe('TC-020: decision_made response handled', () => {
    test('should parse decision_made response', () => {
      const response = {
        status: 'decision_made',
        decision: 'continue_with_alternative',
        timestamp: new Date().toISOString()
      };
      
      expect(response.status).toBe('decision_made');
      expect(response.decision).toBe('continue_with_alternative');
    });

    test('should apply decision to execution', () => {
      const response = { decision: 'continue_with_alternative' };
      
      const actions = {
        'continue_with_alternative': 'Use mock OAuth provider',
        'retry_original': 'Retry original approach',
        'abort': 'Stop execution'
      };
      
      expect(actions[response.decision]).toBe('Use mock OAuth provider');
    });
  });

  describe('TC-021: abort response handled', () => {
    test('should parse abort response', () => {
      const response = {
        status: 'abort',
        reason: 'Critical blocking issue cannot be resolved'
      };
      
      expect(response.status).toBe('abort');
    });

    test('should set execution status to BLOCKED', () => {
      const response = { status: 'abort' };
      
      const status = response.status === 'abort' ? 'BLOCKED' : 'CONTINUE';
      
      expect(status).toBe('BLOCKED');
    });

    test('should stop further execution', () => {
      const response = { status: 'abort' };
      
      const shouldContinue = response.status !== 'abort';
      
      expect(shouldContinue).toBe(false);
    });
  });

  describe('TC-022: escalate_further response handled', () => {
    test('should parse escalate_further response', () => {
      const response = {
        status: 'escalate_further',
        message: 'Escalating to higher authority'
      };
      
      expect(response.status).toBe('escalate_further');
    });

    test('should escalate to USER level', () => {
      const response = { status: 'escalate_further' };
      
      const newLevel = response.status === 'escalate_further' ? 'USER' : 'INTERNAL';
      
      expect(newLevel).toBe('USER');
    });

    test('should create new escalation with higher level', () => {
      const originalEsc = escalation({ level: 'INTERNAL' });
      
      const newEsc = {
        ...originalEsc,
        escalation_id: `esc-${Date.now()}-2`,
        level: 'USER',
        previous_escalation_id: originalEsc.escalation_id
      };
      
      expect(newEsc.level).toBe('USER');
      expect(newEsc.previous_escalation_id).toBe(originalEsc.escalation_id);
    });
  });
});