const { GitHubClient, GitHubApiError } = require('../../../adapters/github-issue/github-client');

jest.mock('https', () => ({
  request: jest.fn()
}));

jest.mock('http', () => ({
  request: jest.fn()
}));

describe('GitHubClient Issue Lifecycle Methods', () => {
  let client;
  let mockRequest;

  const mockResponse = (statusCode, data) => {
    const mockRes = {
      statusCode,
      headers: {
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4999',
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600)
      },
      setEncoding: jest.fn(),
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback(JSON.stringify(data));
        } else if (event === 'end') {
          callback();
        }
      })
    };

    mockRequest = {
      on: jest.fn((event, callback) => {
        if (event === 'error') return;
      }),
      write: jest.fn(),
      end: jest.fn()
    };

    const https = require('https');
    https.request.mockImplementation((options, callback) => {
      callback(mockRes);
      return mockRequest;
    });

    return mockRes;
  };

  beforeEach(() => {
    client = new GitHubClient({ token: 'test-token' });
    jest.clearAllMocks();
  });

  describe('createIssue', () => {
    test('creates issue with required fields', async () => {
      const mockData = {
        number: 42,
        title: 'Test Issue',
        html_url: 'https://github.com/owner/repo/issues/42',
        state: 'open'
      };
      mockResponse(201, mockData);

      const result = await client.createIssue('owner', 'repo', {
        title: 'Test Issue'
      });

      expect(result.number).toBe(42);
      expect(result.title).toBe('Test Issue');
    });

    test('creates issue with labels and assignees', async () => {
      const mockData = {
        number: 42,
        title: 'Test Issue',
        labels: [{ name: 'task:T-001' }, { name: 'role:developer' }],
        assignees: [{ login: 'user1' }]
      };
      mockResponse(201, mockData);

      const result = await client.createIssue('owner', 'repo', {
        title: 'Test Issue',
        labels: ['task:T-001', 'role:developer'],
        assignees: ['user1']
      });

      expect(result.labels).toHaveLength(2);
    });

    test('creates issue with milestone', async () => {
      const mockData = {
        number: 42,
        title: 'Test Issue',
        milestone: { number: 1 }
      };
      mockResponse(201, mockData);

      const result = await client.createIssue('owner', 'repo', {
        title: 'Test Issue',
        milestone: 1
      });

      expect(result.milestone.number).toBe(1);
    });

    test('sends POST request to correct endpoint', async () => {
      mockResponse(201, { number: 42 });

      await client.createIssue('owner', 'repo', { title: 'Test' });

      const https = require('https');
      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/repos/owner/repo/issues'
        }),
        expect.any(Function)
      );
    });
  });

  describe('searchIssues', () => {
    test('searches issues without filters', async () => {
      const mockData = [
        { number: 1, title: 'Issue 1' },
        { number: 2, title: 'Issue 2' }
      ];
      mockResponse(200, mockData);

      const result = await client.searchIssues('owner', 'repo');

      expect(result).toHaveLength(2);
    });

    test('searches issues with label filter', async () => {
      const mockData = [
        { number: 1, title: 'Issue 1', labels: [{ name: 'task:T-001' }] }
      ];
      mockResponse(200, mockData);

      const result = await client.searchIssues('owner', 'repo', {
        labels: ['task:T-001']
      });

      expect(result).toHaveLength(1);
    });

    test('searches issues with state filter', async () => {
      mockResponse(200, []);

      await client.searchIssues('owner', 'repo', { state: 'closed' });

      const https = require('https');
      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: expect.stringContaining('state=closed')
        }),
        expect.any(Function)
      );
    });

    test('searches issues with multiple filters', async () => {
      mockResponse(200, []);

      await client.searchIssues('owner', 'repo', {
        labels: ['task:T-001', 'role:developer'],
        state: 'open',
        per_page: 50
      });

      const https = require('https');
      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: expect.stringContaining('labels=task%3AT-001%2Crole%3Adeveloper')
        }),
        expect.any(Function)
      );
      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: expect.stringContaining('state=open')
        }),
        expect.any(Function)
      );
      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: expect.stringContaining('per_page=50')
        }),
        expect.any(Function)
      );
    });
  });

  describe('updateIssue', () => {
    test('updates issue title', async () => {
      const mockData = {
        number: 42,
        title: 'Updated Title'
      };
      mockResponse(200, mockData);

      const result = await client.updateIssue('owner', 'repo', 42, {
        title: 'Updated Title'
      });

      expect(result.title).toBe('Updated Title');
    });

    test('updates issue body', async () => {
      const mockData = {
        number: 42,
        body: 'New body content'
      };
      mockResponse(200, mockData);

      const result = await client.updateIssue('owner', 'repo', 42, {
        body: 'New body content'
      });

      expect(result.body).toBe('New body content');
    });

    test('updates multiple fields', async () => {
      const mockData = {
        number: 42,
        title: 'Updated',
        body: 'New body',
        labels: [{ name: 'status:in-progress' }]
      };
      mockResponse(200, mockData);

      const result = await client.updateIssue('owner', 'repo', 42, {
        title: 'Updated',
        body: 'New body',
        labels: ['status:in-progress']
      });

      expect(result.title).toBe('Updated');
      expect(result.body).toBe('New body');
    });

    test('sends PATCH request to correct endpoint', async () => {
      mockResponse(200, { number: 42 });

      await client.updateIssue('owner', 'repo', 42, { title: 'Test' });

      const https = require('https');
      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          path: '/repos/owner/repo/issues/42'
        }),
        expect.any(Function)
      );
    });
  });

  describe('closeIssue', () => {
    test('closes issue', async () => {
      const mockData = {
        number: 42,
        state: 'closed'
      };
      mockResponse(200, mockData);

      const result = await client.closeIssue('owner', 'repo', 42);

      expect(result.state).toBe('closed');
    });

    test('sends PATCH request with state=closed', async () => {
      mockResponse(200, { number: 42, state: 'closed' });

      await client.closeIssue('owner', 'repo', 42);

      const https = require('https');
      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH'
        }),
        expect.any(Function)
      );
    });
  });

  describe('reopenIssue', () => {
    test('reopens issue', async () => {
      const mockData = {
        number: 42,
        state: 'open'
      };
      mockResponse(200, mockData);

      const result = await client.reopenIssue('owner', 'repo', 42);

      expect(result.state).toBe('open');
    });
  });

  describe('error handling', () => {
    test('handles 404 not found', async () => {
      mockResponse(404, { message: 'Not Found' });

      await expect(client.getIssue('owner', 'repo', 999))
        .rejects.toThrow(GitHubApiError);
    });

    test('handles 403 permission error', async () => {
      mockResponse(403, { message: 'Forbidden' });

      await expect(client.createIssue('owner', 'repo', { title: 'Test' }))
        .rejects.toThrow(GitHubApiError);
    });

    test('handles 422 validation error', async () => {
      mockResponse(422, { 
        message: 'Validation Failed',
        errors: [{ field: 'title', code: 'missing_field' }]
      });

      await expect(client.createIssue('owner', 'repo', {}))
        .rejects.toThrow(GitHubApiError);
    });
  });

  describe('rate limit tracking', () => {
    test('updates rate limit info from headers', async () => {
      const mockRes = {
        statusCode: 200,
        headers: {
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4998',
          'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
          'x-ratelimit-used': '2'
        },
        setEncoding: jest.fn(),
        on: jest.fn((event, callback) => {
          if (event === 'data') callback('{}');
          if (event === 'end') callback();
        })
      };

      const mockReq = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      };

      const https = require('https');
      https.request.mockImplementation((options, callback) => {
        callback(mockRes);
        return mockReq;
      });

      await client.searchIssues('owner', 'repo');

      const info = client.getRateLimitInfo();
      expect(info.remaining).toBe(4998);
      expect(info.used).toBe(2);
    });
  });
});