const { LabelSetup } = require('../../../adapters/github-issue/setup-labels');

jest.mock('../../../adapters/github-issue/github-client', () => ({
  GitHubClient: jest.fn().mockImplementation(() => ({
    _request: jest.fn()
  }))
}));

describe('LabelSetup CLI (T-004)', () => {
  let labelSetup;
  let mockClient;

  beforeEach(() => {
    const { GitHubClient } = require('../../../adapters/github-issue/github-client');
    mockClient = new GitHubClient();
    const labelConfig = { labels: [
      { name: 'role:developer', color: '1d76db', description: 'Developer role task' },
      { name: 'role:architect', color: '0075ca', description: 'Architect role task' }
    ]};
    labelSetup = new LabelSetup(mockClient, labelConfig);
    jest.clearAllMocks();
  });

  test('creates new labels', async () => {
    mockClient._request.mockImplementation(async (method, path) => {
      if (method === 'GET') throw { status: 404 };
      return {};
    });

    const results = await labelSetup.run('owner', 'repo');
    expect(results.created).toContain('role:developer');
    expect(results.created).toContain('role:architect');
    expect(results.skipped).toHaveLength(0);
  });

  test('skips existing labels', async () => {
    mockClient._request.mockImplementation(async (method, path) => {
      if (method === 'GET') return { name: 'role:developer' };
      return {};
    });

    const results = await labelSetup.run('owner', 'repo');
    expect(results.skipped).toContain('role:developer');
    expect(results.created).toHaveLength(0);
  });

  test('records failed labels', async () => {
    mockClient._request.mockImplementation(async (method, path, data) => {
      if (method === 'GET') throw { status: 404 };
      if (data?.name === 'role:architect') throw new Error('Permission denied');
      return {};
    });

    const results = await labelSetup.run('owner', 'repo');
    expect(results.failed).toHaveLength(1);
    expect(results.failed[0].name).toBe('role:architect');
  });

  test('formatReport generates summary', () => {
    const results = {
      created: ['role:developer', 'role:architect'],
      skipped: ['milestone:M001'],
      failed: []
    };

    const report = labelSetup.formatReport(results);
    expect(report).toContain('Created: 2');
    expect(report).toContain('role:developer');
    expect(report).toContain('Skipped: 1');
    expect(report).toContain('Failed: 0');
  });
});