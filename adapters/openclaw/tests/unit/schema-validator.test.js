const { SchemaValidator } = require('../../schema-validator');

describe('SchemaValidator', () => {
  let validator;
  let validPayload;

  beforeEach(() => {
    validator = new SchemaValidator();
    validPayload = {
      dispatch_id: 'dispatch-001',
      project_id: 'project-001',
      milestone_id: 'milestone-001',
      task_id: 'task-001',
      role: 'architect',
      command: 'design-task',
      title: 'Design feature',
      goal: 'Implement new feature',
      description: 'Detailed description of the task',
      context: {},
      constraints: ['constraint-1'],
      inputs: ['input-1'],
      expected_outputs: ['output-1'],
      verification_steps: ['step-1'],
      risk_level: 'low'
    };
  });

  test('valid payload returns isValid: true', () => {
    const result = validator.validate(validPayload);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('missing each required field returns an error', () => {
    SchemaValidator.REQUIRED_FIELDS.forEach((field) => {
      const payload = JSON.parse(JSON.stringify(validPayload));
      delete payload[field];
      const result = validator.validate(payload);
      expect(result.isValid).toBe(false);
      const hasFieldError = result.errors.some((e) => e.field === field);
      expect(hasFieldError).toBe(true);
    });
  });

  test('invalid role value returns error', () => {
    const payload = JSON.parse(JSON.stringify(validPayload));
    payload.role = 'not-a-role';
    const result = validator.validate(payload);
    expect(result.isValid).toBe(false);
    const error = result.errors.find((e) => e.field === 'role');
    expect(error).toBeTruthy();
    expect(error.severity).toBe('error');
    expect(error.message).toContain('Invalid role');
  });

  test('invalid risk_level value returns error', () => {
    const payload = JSON.parse(JSON.stringify(validPayload));
    payload.risk_level = 'extreme';
    const result = validator.validate(payload);
    expect(result.isValid).toBe(false);
    const error = result.errors.find((e) => e.field === 'risk_level');
    expect(error).toBeTruthy();
    expect(error.severity).toBe('error');
    expect(error.message).toContain('Invalid risk_level');
  });

  test('multiple errors are collected', () => {
    const payload = JSON.parse(JSON.stringify(validPayload));
    delete payload.dispatch_id;
    delete payload.role;
    const result = validator.validate(payload);
    expect(result.isValid).toBe(false);
    const fields = result.errors.map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(['dispatch_id', 'role']));
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  test('empty payload returns all errors', () => {
    const result = validator.validate({});
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(SchemaValidator.REQUIRED_FIELDS.length);
    const fields = result.errors.map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(SchemaValidator.REQUIRED_FIELDS));
  });
});
