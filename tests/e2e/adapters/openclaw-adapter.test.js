/**
 * True E2E Tests: OpenClaw Adapter Integration
 * 
 * Tests REAL OpenClawAdapter code with Nock HTTP mocking.
 * Implements TC-OC-001~014 per specs/024-e2e-integration-tests/spec.md.
 */

const nock = require('nock');
const jwt = require('jsonwebtoken');
const { OpenClawAdapter } = require('../../../adapters/openclaw');
const { getAdapterConfig, cleanAllMocks } = require('./helpers/mock-config');
const { createExecutionResult, createRetryContext } = require('./fixtures/adapter-fixtures');
const {
  assertValidDispatchFromAdapter,
  assertValidEscalation,
  assertNockCallComplete,
  assertAdapterErrorMapping,
  assertValidAdapterInfo,
  assertRetryDecision,
  assertJWTValidation
} = require('./helpers/adapter-assertions');

const { ExecutionStatusEnum, EscalationResponseStatusEnum } = require('../../../adapters/openclaw/types');

const TEST_JWT_SECRET = 'test-jwt-secret-do-not-use-in-production';
const MOCK_OPENCLAW_API_URL = 'http://localhost:3000';

function validateTestJWT(token, secret) {
  try {
    const payload = jwt.verify(token, secret);
    return { valid: true, payload, error: null };
  } catch (err) {
    return { valid: false, payload: null, error: err.message };
  }
}

function generateTestJWT(payload, secret = TEST_JWT_SECRET, options = {}) {
  const defaultOptions = { expiresIn: '1h', algorithm: 'HS256' };
  return jwt.sign(payload, secret, { ...defaultOptions, ...options });
}

describe('True E2E: OpenClaw Adapter Integration', () => {
  let adapter;
  let config;

  beforeEach(() => {
    cleanAllMocks();
    config = getAdapterConfig('openclaw');
    config.openclaw_config = { ...config.openclaw_config, api_base_url: MOCK_OPENCLAW_API_URL };
    adapter = new OpenClawAdapter(config);
  });

  afterAll(() => {
    cleanAllMocks();
    if (adapter.client && typeof adapter.client.destroy === 'function') {
      adapter.client.destroy();
    }
  });


  describe('JWT Authentication', () => {
    test('TC-OC-001: JWT token validated', () => {
      const payload = { dispatch_id: 'dispatch-001', role: 'developer', user: 'test-user' };
      const token = generateTestJWT(payload, TEST_JWT_SECRET);
      const validation = validateTestJWT(token, TEST_JWT_SECRET);
      assertJWTValidation(validation, true);
      expect(validation.payload.dispatch_id).toBe('dispatch-001');
      expect(validation.payload.role).toBe('developer');
      adapter.setAuthToken(token, 3600);
      expect(adapter.client.token).toBe(token);
    });

    test('TC-OC-002: JWT expired rejected', () => {
      const payload = { dispatch_id: 'dispatch-002', role: 'architect' };
      const token = generateTestJWT(payload, TEST_JWT_SECRET, { expiresIn: '-1s' });
      const validation = validateTestJWT(token, TEST_JWT_SECRET);
      assertJWTValidation(validation, false);
      expect(validation.error).toContain('expired');
    });

    test('TC-OC-003: JWT invalid signature rejected', () => {
      const payload = { dispatch_id: 'dispatch-003', role: 'tester' };
      const token = generateTestJWT(payload, 'wrong-secret-key');
      const validation = validateTestJWT(token, TEST_JWT_SECRET);
      assertJWTValidation(validation, false);
      expect(validation.error).toContain('invalid signature');
    });
  });


  describe('Message Parsing', () => {
    test('TC-OC-004: Message parsed to dispatch payload', () => {
      const openClawMessage = {
        dispatch_id: 'dispatch-004',
        project: { id: 'proj-001', name: 'Test Project', goal: 'Build feature' },
        milestone: { id: 'ms-001', name: 'MVP', goal: 'Complete MVP', status: 'active' },
        task: {
          id: 'task-001', title: 'Implement auth', goal: 'Create auth module',
          description: 'OAuth2 and MFA', context: { project_goal: 'Build system' },
          constraints: ['OAuth2'], inputs: [], expected_outputs: ['Auth module'],
          verification_steps: ['Tests'], risk_level: 'low'
        },
        role: 'developer', command: 'feature-implementation'
      };
      const dispatch = adapter.normalizeInput(openClawMessage);
      assertValidDispatchFromAdapter(dispatch, 'developer');
      expect(dispatch.dispatch_id).toBe('dispatch-004');
      expect(dispatch.project_id).toBe('proj-001');
    });
  });

  describe('Callbacks (Nock HTTP Mocks)', () => {
    test('TC-OC-005: Execution result callback sent (Nock)', async () => {
      const scope = nock(MOCK_OPENCLAW_API_URL)
        .post('/api/v1/results')
        .reply(200, {
          result_id: 'result-001',
          status: 'received',
          timestamp: new Date().toISOString()
        });
      
      const executionResult = createExecutionResult({ dispatch_id: 'dispatch-005' });
      
      const result = await adapter.sendExecutionResult(executionResult);
      
      expect(result).toBeDefined();
      expect(scope.isDone()).toBe(true);
    });

    test('TC-OC-006: Escalation callback sent (Nock)', async () => {
      const scope = nock(MOCK_OPENCLAW_API_URL)
        .post('/api/v1/escalations')
        .reply(200, {
          escalation_id: 'esc-001',
          status: 'acknowledged',
          requires_decision: true
        });
      
      const escalation = adapter.generateEscalation({
        dispatch_id: 'dispatch-006',
        project_id: 'proj-001',
        milestone_id: 'ms-001',
        task_id: 'task-001',
        role: 'developer',
        level: 'USER',
        reason_type: 'BLOCKING_DEPENDENCY',
        summary: 'Waiting for docs',
        blocking_points: ['Missing specs'],
        requires_user_decision: true
      });
      
      assertValidEscalation(escalation);
      
      const response = await adapter.sendEscalationCallback(escalation);
      
      expect(response).toBeDefined();
      expect(scope.isDone()).toBe(true);
    });

    test('TC-OC-007: Retry callback sent (Nock)', async () => {
      const scope = nock(MOCK_OPENCLAW_API_URL)
        .post('/api/v1/retries')
        .reply(200, {
          retry_id: 'retry-001',
          scheduled_at: new Date(Date.now() + 5000).toISOString(),
          status: 'scheduled'
        });
      
      const retryLog = {
        dispatch_id: 'dispatch-007',
        retry_count: 1,
        previous_failure_reason: 'Rate limit',
        previous_output_summary: 'Partial',
        required_fixes: ['Wait']
      };
      
      await adapter.logRetry(retryLog);
      
      expect(scope.isDone()).toBe(true);
    });

    test('TC-OC-008: Heartbeat sent during execution (Nock)', async () => {
      const scope = nock(MOCK_OPENCLAW_API_URL)
        .post('/api/v1/heartbeat')
        .reply(200, { received: true });
      
      const dispatchId = 'dispatch-008';
      
      const sent = await adapter.sendHeartbeat(dispatchId, 'running', {
        phase: 'impl',
        percent_complete: 50,
        estimated_remaining_seconds: 300
      });
      
      expect(sent).toBeDefined();
      expect(scope.isDone()).toBe(true);
    });
  });


  describe('Decision Response Handling', () => {
    test('TC-OC-009: Decision response: acknowledged', async () => {
      const scope = nock(MOCK_OPENCLAW_API_URL).post('/api/v1/escalations').reply(200, {
        escalation_id: 'esc-009', status: EscalationResponseStatusEnum.ACKNOWLEDGED,
        requires_decision: true, timestamp: new Date().toISOString()
      });
      const escalation = adapter.generateEscalation({
        dispatch_id: 'dispatch-009', project_id: 'proj-001', milestone_id: 'ms-001',
        task_id: 'task-001', role: 'developer', summary: 'Blocked'
      });
      const response = await adapter.sendEscalationCallback(escalation);
      assertNockCallComplete(scope, 'Escalation acknowledged');
      expect(response.response_status).toBe(EscalationResponseStatusEnum.ACKNOWLEDGED);
      expect(response.action).toBe('wait_for_decision');
    });

    test('TC-OC-010: Decision response: decision_made', async () => {
      const scope = nock(MOCK_OPENCLAW_API_URL).post('/api/v1/escalations').reply(200, {
        escalation_id: 'esc-010', status: EscalationResponseStatusEnum.DECISION_MADE,
        decision: { selected_option: 'opt-002' }, next_action: 'continue',
        timestamp: new Date().toISOString()
      });
      const escalation = adapter.generateEscalation({
        dispatch_id: 'dispatch-010', project_id: 'proj-001', milestone_id: 'ms-001',
        task_id: 'task-001', role: 'developer', summary: 'Decision needed'
      });
      const response = await adapter.sendEscalationCallback(escalation);
      assertNockCallComplete(scope, 'Decision made');
      expect(response.response_status).toBe(EscalationResponseStatusEnum.DECISION_MADE);
      expect(response.decision.selected_option).toBe('opt-002');
    });

    test('TC-OC-011: Decision response: abort', async () => {
      const scope = nock(MOCK_OPENCLAW_API_URL).post('/api/v1/escalations').reply(200, {
        escalation_id: 'esc-011', status: EscalationResponseStatusEnum.ABORT,
        reason: 'Critical blocker', timestamp: new Date().toISOString()
      });
      const escalation = adapter.generateEscalation({
        dispatch_id: 'dispatch-011', project_id: 'proj-001', milestone_id: 'ms-001',
        task_id: 'task-001', role: 'developer', level: 'USER', summary: 'Critical'
      });
      const response = await adapter.sendEscalationCallback(escalation);
      assertNockCallComplete(scope, 'Abort response');
      expect(response.response_status).toBe(EscalationResponseStatusEnum.ABORT);
      expect(response.aborted).toBe(true);
    });

    test('TC-OC-012: Decision response: escalate_further', async () => {
      const scope = nock(MOCK_OPENCLAW_API_URL).post('/api/v1/escalations').reply(200, {
        escalation_id: 'esc-012', status: EscalationResponseStatusEnum.ESCALATE_FURTHER,
        escalate_to: 'USER', timestamp: new Date().toISOString()
      });
      const escalation = adapter.generateEscalation({
        dispatch_id: 'dispatch-012', project_id: 'proj-001', milestone_id: 'ms-001',
        task_id: 'task-001', role: 'developer', level: 'INTERNAL', summary: 'Need approval'
      });
      const response = await adapter.sendEscalationCallback(escalation);
      assertNockCallComplete(scope, 'Escalate further');
      expect(response.response_status).toBe(EscalationResponseStatusEnum.ESCALATE_FURTHER);
    });
  });


  describe('Error Mapping', () => {
    test('TC-OC-013: API error mapping', () => {
      assertAdapterErrorMapping(adapter, 401, ExecutionStatusEnum.BLOCKED);
      assertAdapterErrorMapping(adapter, 403, ExecutionStatusEnum.BLOCKED);
      assertAdapterErrorMapping(adapter, 404, ExecutionStatusEnum.BLOCKED);
      assertAdapterErrorMapping(adapter, 422, ExecutionStatusEnum.FAILED_RETRYABLE);
      assertAdapterErrorMapping(adapter, 429, ExecutionStatusEnum.BLOCKED);
      assertAdapterErrorMapping(adapter, 500, ExecutionStatusEnum.FAILED_RETRYABLE);
      assertAdapterErrorMapping(adapter, 502, ExecutionStatusEnum.FAILED_RETRYABLE);
      assertAdapterErrorMapping(adapter, 503, ExecutionStatusEnum.FAILED_RETRYABLE);
      assertAdapterErrorMapping(adapter, 504, ExecutionStatusEnum.FAILED_RETRYABLE);
      expect(adapter.mapError({ code: 'ECONNREFUSED' })).toBe(ExecutionStatusEnum.FAILED_RETRYABLE);
      expect(adapter.mapError({ code: 'ETIMEDOUT' })).toBe(ExecutionStatusEnum.FAILED_RETRYABLE);
    });
  });

  describe('Adapter Info', () => {
    test('TC-OC-014: Adapter info returned', () => {
      const info = adapter.getAdapterInfo();
      assertValidAdapterInfo(info, 'orchestrator');
      expect(info.adapter_id).toBe('openclaw');
      expect(info.adapter_type).toBe('orchestrator');
      expect(info.version).toBe('1.0.0');
      expect(info.features.dispatch_normalization).toBe(true);
      expect(info.features.jwt_authentication).toBe(true);
      expect(info.compatible_profiles).toContain('minimal');
      expect(info.compatible_profiles).toContain('full');
    });
  });

  describe('Retry Logic (BR-002)', () => {
    test('Low risk task retry allowed', () => {
      const decision = adapter.handleRetry(createRetryContext({ retry_count: 0, risk_level: 'low' }));
      assertRetryDecision(decision, true);
    });

    test('Medium risk task retry limited', () => {
      const decision = adapter.handleRetry(createRetryContext({ retry_count: 0, risk_level: 'medium' }));
      assertRetryDecision(decision, true);
      const second = adapter.handleRetry(createRetryContext({ retry_count: 1, risk_level: 'medium' }));
      assertRetryDecision(second, false);
    });

    test('High risk no auto-retry', () => {
      const decision = adapter.handleRetry(createRetryContext({ retry_count: 0, risk_level: 'high' }));
      assertRetryDecision(decision, false);
      expect(decision.escalate).toBe(true);
    });

    test('Critical risk no auto-retry', () => {
      const decision = adapter.handleRetry(createRetryContext({ retry_count: 0, risk_level: 'critical' }));
      assertRetryDecision(decision, false);
      expect(decision.escalate).toBe(true);
    });
  });

  describe('Route to Execution', () => {
    test('Dispatch routed correctly', () => {
      const routing = adapter.routeToExecution({
        dispatch_id: 'dispatch-route-001', project_id: 'proj-001', milestone_id: 'ms-001',
        task_id: 'task-001', role: 'developer', command: 'feature-implementation'
      });
      expect(routing.routed).toBe(true);
      expect(routing.dispatch_id).toBe('dispatch-route-001');
    });
  });

  describe('Schema Validation', () => {
    test('Valid dispatch validated', () => {
      const validation = adapter.validateDispatch({
        dispatch_id: 'd-001', project_id: 'p-001', milestone_id: 'm-001', task_id: 't-001',
        role: 'developer', command: 'impl', title: 'T', goal: 'G', description: 'D',
        context: {}, constraints: ['test'], inputs: [{ artifact_id: 'test' }], expected_outputs: ['output'], verification_steps: ['step'],
        risk_level: 'low'
      });
      expect(validation.isValid).toBe(true);
    });

    test('Invalid role rejected', () => {
      const validation = adapter.validateDispatch({
        dispatch_id: 'd-002', project_id: 'p-001', milestone_id: 'm-001', task_id: 't-001',
        role: 'invalid-role', command: 'impl', title: 'T', goal: 'G', description: 'D',
        context: {}, constraints: ['test'], inputs: [{ artifact_id: 'test' }], expected_outputs: ['output'], verification_steps: ['step'],
        risk_level: 'low'
      });
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.field === 'role')).toBe(true);
    });
  });
});

