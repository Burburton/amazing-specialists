const { MessageParser } = require('../../message-parser');

describe('MessageParser', () => {
  let parser;
  let validMessage;

  beforeEach(() => {
    parser = new MessageParser();
    validMessage = {
      dispatch_id: 'dispatch-001',
      project: { id: 'proj-001', name: 'Test Project', goal: 'Build feature' },
      milestone: { id: 'ms-001', name: 'MVP', goal: 'Release MVP', status: 'active' },
      task: {
        id: 'task-001',
        title: 'Implement feature',
        goal: 'Create the feature',
        description: 'Detailed description',
        context: {
          project_goal: 'Build feature',
          milestone_goal: 'Release MVP',
          task_scope: 'Implementation',
          related_spec_sections: [],
          code_context_summary: ''
        },
        constraints: ['Must pass tests'],
        inputs: [],
        expected_outputs: ['Working feature'],
        verification_steps: ['Run tests'],
        risk_level: 'low'
      },
      role: 'developer',
      command: 'feature-implementation'
    };
  });

  describe('parse', () => {
    test('parses valid message successfully', () => {
      const result = parser.parse(validMessage);
      expect(result.success).toBe(true);
      expect(result.dispatch_payload).toBeDefined();
      expect(result.errors).toEqual([]);
    });

    test('generates dispatch_id when missing', () => {
      const msg = { ...validMessage, dispatch_id: undefined };
      const result = parser.parse(msg);
      expect(result.success).toBe(true);
      expect(result.dispatch_payload.dispatch_id).toMatch(/^oc-dispatch-/);
    });

    test('returns error for invalid role', () => {
      const msg = { ...validMessage, role: 'invalid-role' };
      const result = parser.parse(msg);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'role')).toBe(true);
    });

    test('returns error for invalid risk_level', () => {
      const msg = {
        ...validMessage,
        task: { ...validMessage.task, risk_level: 'extreme' }
      };
      const result = parser.parse(msg);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('maps project.id to project_id', () => {
      const result = parser.parse(validMessage);
      expect(result.dispatch_payload.project_id).toBe('proj-001');
    });

    test('maps milestone.id to milestone_id', () => {
      const result = parser.parse(validMessage);
      expect(result.dispatch_payload.milestone_id).toBe('ms-001');
    });

    test('maps task.id to task_id', () => {
      const result = parser.parse(validMessage);
      expect(result.dispatch_payload.task_id).toBe('task-001');
    });

    test('maps task.title to title', () => {
      const result = parser.parse(validMessage);
      expect(result.dispatch_payload.title).toBe('Implement feature');
    });

    test('maps task.goal to goal', () => {
      const result = parser.parse(validMessage);
      expect(result.dispatch_payload.goal).toBe('Create the feature');
    });

    test('maps task.description to description', () => {
      const result = parser.parse(validMessage);
      expect(result.dispatch_payload.description).toBe('Detailed description');
    });

    test('includes retry_context when present', () => {
      const msg = {
        ...validMessage,
        retry_context: { retry_count: 1, previous_failure_reason: 'Error' }
      };
      const result = parser.parse(msg);
      expect(result.dispatch_payload.retry_context).toBeDefined();
      expect(result.dispatch_payload.retry_context.retry_count).toBe(1);
    });
  });

  describe('validateRole', () => {
    test('returns valid for valid roles', () => {
      expect(parser.validateRole('architect').valid).toBe(true);
      expect(parser.validateRole('developer').valid).toBe(true);
      expect(parser.validateRole('tester').valid).toBe(true);
      expect(parser.validateRole('reviewer').valid).toBe(true);
      expect(parser.validateRole('docs').valid).toBe(true);
      expect(parser.validateRole('security').valid).toBe(true);
    });

    test('returns invalid for invalid role', () => {
      expect(parser.validateRole('invalid').valid).toBe(false);
      expect(parser.validateRole('admin').valid).toBe(false);
    });
  });

  describe('validateRiskLevel', () => {
    test('returns valid for valid risk levels', () => {
      expect(parser.validateRiskLevel('low').valid).toBe(true);
      expect(parser.validateRiskLevel('medium').valid).toBe(true);
      expect(parser.validateRiskLevel('high').valid).toBe(true);
      expect(parser.validateRiskLevel('critical').valid).toBe(true);
    });

    test('returns invalid for invalid risk level', () => {
      expect(parser.validateRiskLevel('extreme').valid).toBe(false);
    });
  });

  describe('generateDispatchId', () => {
    test('generates unique ID with correct format', () => {
      const id1 = parser.generateDispatchId();
      const id2 = parser.generateDispatchId();
      expect(id1).toMatch(/^oc-dispatch-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^oc-dispatch-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });
});