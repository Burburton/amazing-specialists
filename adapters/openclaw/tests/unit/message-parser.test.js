"use strict";

const { MessageParser } = require('../../message-parser');

describe('MessageParser', () => {
  const BASE_CONFIG = {
    openclaw_config: {
      default_values: {
        role: 'developer',
        command: 'implement-task',
        risk_level: 'medium'
      },
      id_config: {
        dispatch_id_format: 'oc-dispatch-{timestamp}-{random}',
        project_id_format: '{project_id}'
      }
    }
  };

  function validOpenClawMessage(overrides = {}) {
    const base = {
      // dispatch_id intentionally omitted to test auto-generation
      project: { id: 'P1', name: 'Project One', goal: 'Goal' },
      milestone: { id: 'M1', name: 'Milestone 1', goal: 'Milestone goal', status: 'active' },
      task: {
        id: 'T1',
        title: 'Do something',
        goal: 'Achieve something',
        description: 'Task description',
        context: {
          project_goal: 'Proj goal',
          milestone_goal: 'Milestone goal',
          task_scope: 'Scope of work'
        },
        constraints: ['Constraint A'],
        inputs: [
          { artifact_id: 'A1', artifact_type: 'design', path: 'path/to/design.md', summary: 'Design input' }
        ],
        expected_outputs: ['Output1'],
        verification_steps: ['Step1'],
        risk_level: 'low'
      },
      role: 'developer',
      command: 'implement-task',
      retry_context: null
    };
    return Object.assign({}, base, overrides);
  }

  test('parse - valid message parses successfully', () => {
    const parser = new MessageParser(BASE_CONFIG);
    const msg = validOpenClawMessage();
    const result = parser.parse(msg);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.dispatch_payload).toBeDefined();
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(Array.isArray(result.warnings)).toBe(true);

    const p = result.dispatch_payload;
    expect(p.dispatch_id).toBeDefined();
    expect(p.dispatch_id).toMatch(/^oc-dispatch-/);
    expect(p.project_id).toBe('P1');
    expect(p.milestone_id).toBe('M1');
    expect(p.task_id).toBe('T1');
    expect(p.role).toBe('developer');
    expect(p.command).toBe('implement-task');
    expect(p.title).toBe('Do something');
    expect(p.goal).toBe('Achieve something');
    expect(p.description).toBe('Task description');
    expect(p.context).toBeDefined();
    expect(p.context.project_goal).toBe('Proj goal');
    expect(p.constraints).toContain('Constraint A');
    expect(p.inputs.length).toBe(1);
    expect(p.inputs[0].artifact_id).toBe('A1');
    expect(p.expected_outputs).toContain('Output1');
    expect(p.risk_level).toBe('low');
  });

  test('validateRole - invalid role returns error', () => {
    const parser = new MessageParser(BASE_CONFIG);
    const res = parser.validateRole('not-a-role');
    expect(res.valid).toBe(false);
    expect(res.message).toBeDefined();
  });

  test('validateRole - valid role passes', () => {
    const parser = new MessageParser(BASE_CONFIG);
    const res = parser.validateRole('developer');
    expect(res.valid).toBe(true);
  });

  test('validateRiskLevel - invalid risk level returns error', () => {
    const parser = new MessageParser(BASE_CONFIG);
    const res = parser.validateRiskLevel('extreme');
    expect(res.valid).toBe(false);
  });

  test('validateRiskLevel - valid risk level passes', () => {
    const parser = new MessageParser(BASE_CONFIG);
    const res = parser.validateRiskLevel('medium');
    expect(res.valid).toBe(true);
  });

  test('generateDispatchId - produces a dispatch id', () => {
    const parser = new MessageParser(BASE_CONFIG);
    const id = parser.generateDispatchId();
    expect(typeof id).toBe('string');
    expect(id.startsWith('oc-dispatch-')).toBe(true);
  });

  test('mapProject/mapMilestone/mapTask/mapContext - mappings work', () => {
    const parser = new MessageParser(BASE_CONFIG);

    const proj = { id: 'PID', name: 'PRJ', goal: 'G' };
    const mappedProj = parser.mapProject(proj);
    expect(mappedProj).toEqual({ id: 'PID', name: 'PRJ', goal: 'G' });

    const mil = { id: 'MID', name: 'MN', goal: 'MG', status: 'active' };
    const mappedMil = parser.mapMilestone(mil);
    expect(mappedMil).toEqual({ id: 'MID', name: 'MN', goal: 'MG', status: 'active' });

    const task = {
      id: 'TID', title: 'TT', goal: 'TG', description: 'TD',
      context: { a: 1 }, constraints: ['c'], inputs: ['in1', { artifact_id: 'A2', artifact_type: 'type2', path: 'p', summary: 's' }],
      expected_outputs: ['out']
    };
    const mappedTask = parser.mapTask(task);
    expect(mappedTask.id).toBe('TID');
    expect(mappedTask.title).toBe('TT');
    expect(mappedTask.goal).toBe('TG');
    expect(mappedTask.description).toBe('TD');
    expect(mappedTask.context).toEqual({ a: 1 });
    expect(mappedTask.constraints).toContain('c');
    expect(mappedTask.inputs.length).toBe(2);
    expect(mappedTask.risk_level).toBe('medium');

    const ctx = {
      project_goal: 'PG', milestone_goal: 'MG', task_scope: 'TS', related_spec_sections: ['sec'], code_context_summary: 'sum', upstream_task_summaries: ['u'], related_artifacts: ['X']
    };
    const mappedCtx = parser.mapContext(ctx);
    expect(mappedCtx.project_goal).toBe('PG');
    expect(mappedCtx.related_artifacts.length).toBeGreaterThan(0);
  });

  test('parse - missing required fields returns errors (early abort)', () => {
    const parser = new MessageParser(BASE_CONFIG);
    const incomplete = { project: null, milestone: null, task: null };
    const result = parser.parse(incomplete);
    // Should fail early due to missing nested objects
    expect(result.success).toBe(false);
    expect(result.dispatch_payload).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
