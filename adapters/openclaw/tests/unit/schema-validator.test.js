const { SchemaValidator } = require('../../schema-validator');

describe('SchemaValidator', () => {
  let validator;
  let validPayload;

  beforeEach(() => {
    validator = new SchemaValidator();
    validPayload = {
      dispatch_id: 'dispatch-001',
      project_id: 'proj-001',
      milestone_id: 'ms-001',
      task_id: 'task-001',
      role: 'developer',
      command: 'feature-implementation',
      title: 'Implement feature',
      goal: 'Create the feature',
      description: 'Description',
      context: { task_scope: 'Implementation' },
      constraints: ['Must pass tests'],
      inputs: [{ artifact_id: 'input-1' }],
      expected_outputs: ['Output file'],
      verification_steps: ['Run tests'],
      risk_level: 'low'
    };
  });

  describe('validate', () => {
    test('returns isValid true for valid payload', () => {
      const result = validator.validate(validPayload);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('returns error for missing dispatch_id', () => {
      const payload = { ...validPayload, dispatch_id: '' };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'dispatch_id')).toBe(true);
    });

    test('returns error for missing project_id', () => {
      const payload = { ...validPayload, project_id: '' };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'project_id')).toBe(true);
    });

    test('returns error for missing milestone_id', () => {
      const payload = { ...validPayload, milestone_id: '' };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'milestone_id')).toBe(true);
    });

    test('returns error for missing task_id', () => {
      const payload = { ...validPayload, task_id: '' };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'task_id')).toBe(true);
    });

    test('returns error for missing role', () => {
      const payload = { ...validPayload, role: '' };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'role')).toBe(true);
    });

    test('returns error for invalid role value', () => {
      const payload = { ...validPayload, role: 'invalid' };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'role')).toBe(true);
    });

    test('returns error for missing command', () => {
      const payload = { ...validPayload, command: '' };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'command')).toBe(true);
    });

    test('returns error for missing title', () => {
      const payload = { ...validPayload, title: '' };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'title')).toBe(true);
    });

    test('returns error for missing goal', () => {
      const payload = { ...validPayload, goal: '' };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'goal')).toBe(true);
    });

    test('returns error for missing description', () => {
      const payload = { ...validPayload, description: '' };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'description')).toBe(true);
    });

    test('returns error for missing context', () => {
      const payload = { ...validPayload, context: null };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'context')).toBe(true);
    });

    test('returns error for invalid risk_level value', () => {
      const payload = { ...validPayload, risk_level: 'extreme' };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'risk_level')).toBe(true);
    });

    test('collects multiple errors', () => {
      const payload = { dispatch_id: 'test' };
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
    });

    test('returns error for null payload', () => {
      const result = validator.validate(null);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('returns error for non-object payload', () => {
      const result = validator.validate('string');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});