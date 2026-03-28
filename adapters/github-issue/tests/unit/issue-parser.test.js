"use strict";

const { IssueParser } = require('../../issue-parser');

describe('IssueParser', () => {
  const BASE_CONFIG = {
    github_config: {
      label_mappings: {
        milestone_prefix: 'milestone:',
        role_prefix: 'role:',
        command_prefix: 'command:',
        task_prefix: 'task:',
        risk_prefix: 'risk:'
      },
      default_values: {
        role: 'developer',
        command: 'implement-task',
        risk_level: 'medium'
      }
    },
    dispatch_config: {
      dispatch_id_format: 'gh-issue-{owner}-{repo}-{number}',
      project_id_format: '{owner}/{repo}'
    }
  };

  // Helper to create a mock GitHub Issue-like object
  function makeIssue(overrides = {}) {
    const base = {
      number: 42,
      title: 'Implement feature X',
      body: `## Context\nThis is the context description.\n\n## Goal\nAchieve X.\n\n## Constraints\n- Must run in Node.js 18+\n\n## Inputs\n- artifact:ABC001 (design-note) at specs/001/design-note.md\n\n## Expected Outputs\n- X completed`,
      repository: { owner: { login: 'octo' }, name: 'repo' },
      html_url: 'https://github.com/octo/repo/issues/42',
      created_at: '2026-03-26',
      user: { login: 'alice' },
      labels: [
        { name: 'milestone:M001' },
        { name: 'role:developer' },
        { name: 'command:implement-task' },
        { name: 'task:T001' },
        { name: 'risk:low' }
      ]
    };
    return Object.assign({}, base, overrides);
  }

  test('parses issue through full flow and builds dispatch payload', () => {
    const parser = new IssueParser(BASE_CONFIG);
    const issue = makeIssue();

    const result = parser.parse(issue);

    // Basic housekeeping
    expect(result.success).toBe(true);
    expect(result.dispatch_payload).toBeDefined();
    expect(result.errors).toEqual([]);
    expect(Array.isArray(result.warnings)).toBe(true);

    const payload = result.dispatch_payload;

    // Dispatch identifiers
    expect(payload.dispatch_id).toBe('gh-issue-octo-repo-42');
    expect(payload.project_id).toBe('octo/repo');

    // Labels-driven fields
    expect(payload.milestone_id).toBe('M001');
    expect(payload.role).toBe('developer');
    expect(payload.command).toBe('implement-task');
    expect(payload.task_id).toBe('T001');
    expect(payload.risk_level).toBe('low');

    // Title and body flow
    expect(payload.title).toBe('Implement feature X');
    expect(payload.goal).toBe('Achieve X.');
    expect(typeof payload.description).toBe('string');
    expect(payload.description).toContain('## Context'); // from issue body fallback

    // Body parsing results
    expect(payload.context).toBeDefined();
    expect(payload.context.task_scope).toBe('This is the context description.');
    expect(payload.constraints).toContain('Must run in Node.js 18+');
    expect(payload.inputs.length).toBeGreaterThan(0);
    expect(payload.expected_outputs).toContain('X completed');

    // Metadata
    expect(payload.metadata).toBeDefined();
    expect(payload.metadata.source).toBe('github-issue');
    expect(payload.metadata.issue_number).toBe(42);
    expect(payload.metadata.issue_url).toBe(issue.html_url);
    expect(payload.metadata.created_by).toBe(issue.user?.login);
    expect(payload.metadata.created_at).toBe(issue.created_at);
  });

  test('dispatch payload generation fails gracefully when builder throws (success: false)', () => {
    const parser = new IssueParser(BASE_CONFIG);
    const issue = makeIssue();

    // Force an error inside buildDispatchPayload to exercise error handling path
    const spy = jest.spyOn(parser, 'buildDispatchPayload').mockImplementation(() => { throw new Error('payload build error'); });

    const result = parser.parse(issue);

    expect(result.success).toBe(false);
    expect(result.dispatch_payload).toBeNull();
    expect(result.errors && result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.errors[0].field).toBe('dispatch_payload');
    expect(result.errors[0].message).toBe('payload build error');

    spy.mockRestore();
  });

  test('validateRequiredFields detects missing fields correctly', () => {
    const parser = new IssueParser(BASE_CONFIG);
    const incompletePayload = {};

    const validation = parser.validateRequiredFields(incompletePayload);

    expect(validation.valid).toBe(false);
    // Should report all required fields as missing
    expect(validation.missing_fields).toEqual(expect.arrayContaining([
      'dispatch_id', 'project_id', 'milestone_id', 'task_id',
      'role', 'command', 'title', 'goal', 'description', 'context',
      'constraints', 'inputs', 'expected_outputs', 'verification_steps', 'risk_level'
    ]));
  });
});
