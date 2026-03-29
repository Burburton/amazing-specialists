const { OpenClawAdapter } = require('../../index');

describe('OpenClawAdapter', () => {
  let adapter;
  let config;

  beforeEach(() => {
    config = {
      adapter_id: 'openclaw',
      adapter_type: 'orchestrator',
      priority: 'later',
      version: '1.0.0',
      openclaw_config: {
        api_base_url: 'https://api.openclaw.test',
        authentication: {
          type: 'jwt',
          token_env_var: 'OPENCLAW_JWT_TOKEN'
        },
        endpoints: {
          result: '/api/v1/results',
          escalation: '/api/v1/escalations',
          retry: '/api/v1/retries',
          heartbeat: '/api/v1/heartbeat'
        },
        retry_config: {
          strategy: 'auto',
          max_retry: 2
        },
        heartbeat_config: {
          enabled: true
        },
        timeout_config: {
          connection_timeout_ms: 5000,
          request_timeout_ms: 30000
        }
      }
    };
    adapter = new OpenClawAdapter(config);
  });

  describe('constructor', () => {
    test('initializes with config', () => {
      expect(adapter.adapterId).toBe('openclaw');
      expect(adapter.adapterType).toBe('orchestrator');
      expect(adapter.version).toBe('1.0.0');
    });

    test('uses default values for missing config', () => {
      const defaultAdapter = new OpenClawAdapter();
      expect(defaultAdapter.adapterId).toBe('openclaw');
      expect(defaultAdapter.adapterType).toBe('orchestrator');
    });

    test('initializes all components', () => {
      expect(adapter.messageParser).toBeDefined();
      expect(adapter.schemaValidator).toBeDefined();
      expect(adapter.resultSender).toBeDefined();
      expect(adapter.escalationHandler).toBeDefined();
      expect(adapter.retryHandler).toBeDefined();
      expect(adapter.heartbeatSender).toBeDefined();
    });
  });

  describe('normalizeInput', () => {
    test('parses valid message to dispatch payload', () => {
      const message = {
        dispatch_id: 'dispatch-001',
        project: { id: 'proj-001', name: 'Test', goal: 'Build' },
        milestone: { id: 'ms-001', name: 'MVP', goal: 'Release' },
        task: {
          id: 'task-001',
          title: 'Task',
          goal: 'Goal',
          description: 'Desc',
          context: {},
          constraints: [],
          inputs: [],
          expected_outputs: [],
          verification_steps: [],
          risk_level: 'low'
        },
        role: 'developer',
        command: 'test'
      };
      const result = adapter.normalizeInput(message);
      expect(result.dispatch_id).toBe('dispatch-001');
      expect(result.project_id).toBe('proj-001');
      expect(result.role).toBe('developer');
    });

    test('throws on invalid message', () => {
      expect(() => adapter.normalizeInput({ role: 'invalid' })).toThrow();
    });
  });

  describe('validateDispatch', () => {
    test('returns valid for correct payload', () => {
      const payload = {
        dispatch_id: 'test',
        project_id: 'p1',
        milestone_id: 'm1',
        task_id: 't1',
        role: 'developer',
        command: 'test',
        title: 'Title',
        goal: 'Goal',
        description: 'Desc',
        context: {},
        constraints: ['Must pass'],
        inputs: [{ artifact_id: 'i1' }],
        expected_outputs: ['Output'],
        verification_steps: ['Verify'],
        risk_level: 'low'
      };
      const result = adapter.validateDispatch(payload);
      expect(result.isValid).toBe(true);
    });

    test('returns invalid for missing fields', () => {
      const result = adapter.validateDispatch({});
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('routeToExecution', () => {
    test('returns routing info', () => {
      const dispatch = {
        dispatch_id: 'd1',
        project_id: 'p1',
        milestone_id: 'm1',
        task_id: 't1',
        role: 'developer',
        command: 'test'
      };
      const result = adapter.routeToExecution(dispatch);
      expect(result.routed).toBe(true);
      expect(result.dispatch_id).toBe('d1');
      expect(result.role).toBe('developer');
    });
  });

  describe('mapError', () => {
    test('maps 401 to BLOCKED', () => {
      expect(adapter.mapError({ status: 401 })).toBe('BLOCKED');
    });

    test('maps 403 to BLOCKED', () => {
      expect(adapter.mapError({ status: 403 })).toBe('BLOCKED');
    });

    test('maps 500 to FAILED_RETRYABLE', () => {
      expect(adapter.mapError({ status: 500 })).toBe('FAILED_RETRYABLE');
    });

    test('maps connection timeout to FAILED_RETRYABLE', () => {
      expect(adapter.mapError({ code: 'ETIMEDOUT' })).toBe('FAILED_RETRYABLE');
    });
  });

  describe('generateEscalation', () => {
    test('creates escalation object', () => {
      const escalation = adapter.generateEscalation({
        dispatch_id: 'd1',
        project_id: 'p1',
        milestone_id: 'm1',
        task_id: 't1',
        role: 'developer',
        summary: 'Blocked'
      });
      expect(escalation.dispatch_id).toBe('d1');
      expect(escalation.escalation_id).toBeDefined();
      expect(escalation.requires_user_decision).toBe(true);
    });
  });

  describe('getAdapterInfo', () => {
    test('returns adapter metadata', () => {
      const info = adapter.getAdapterInfo();
      expect(info.adapter_id).toBe('openclaw');
      expect(info.adapter_type).toBe('orchestrator');
      expect(info.status).toBe('implemented');
      expect(info.compatible_profiles).toContain('minimal');
      expect(info.compatible_profiles).toContain('full');
    });
  });
});