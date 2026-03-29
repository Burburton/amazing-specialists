const { IssueParser } = require('../../../adapters/github-issue/issue-parser');

describe('IssueParser - project_id extraction (T-001)', () => {
  let parser;

  const defaultConfig = {
    github_config: {
      label_mappings: {
        role_prefix: 'role:',
        milestone_prefix: 'milestone:',
        task_prefix: 'task:',
        command_prefix: 'command:',
        risk_prefix: 'risk:'
      }
    }
  };

  beforeEach(() => {
    parser = new IssueParser(defaultConfig);
  });

  test('extracts project_id from repository_url', () => {
    const issue = {
      number: 42,
      title: 'Test Issue',
      body: '## Goal\nTest goal',
      repository_url: 'https://api.github.com/repos/Burburton/amazing-specialist-face',
      labels: []
    };

    const projectId = parser._extractProjectId(issue);
    expect(projectId).toBe('Burburton/amazing-specialist-face');
  });

  test('returns unknown/unknown when repository_url missing', () => {
    const issue = {
      number: 42,
      title: 'Test Issue',
      body: '## Goal\nTest goal',
      labels: []
    };

    const projectId = parser._extractProjectId(issue);
    expect(projectId).toBe('unknown/unknown');
  });

  test('returns unknown/unknown for malformed repository_url', () => {
    const issue = {
      number: 42,
      title: 'Test Issue',
      body: '## Goal\nTest goal',
      repository_url: 'https://api.github.com/invalid/path',
      labels: []
    };

    const projectId = parser._extractProjectId(issue);
    expect(projectId).toBe('unknown/unknown');
  });

  test('dispatch payload uses extracted project_id', () => {
    const issue = {
      number: 42,
      title: 'Test Issue',
      body: '## Goal\nTest goal',
      repository_url: 'https://api.github.com/repos/owner/repo',
      labels: [{ name: 'role:developer' }, { name: 'milestone:M001' }]
    };

    const result = parser.parse(issue);
    expect(result.success).toBe(true);
    expect(result.dispatch_payload.project_id).toBe('owner/repo');
    expect(result.dispatch_payload.dispatch_id).toBe('gh-issue-owner-repo-42');
  });
});