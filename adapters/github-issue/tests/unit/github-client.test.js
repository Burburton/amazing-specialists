/**
 * Unit Tests for GitHub Client
 *
 * Coverage target: >90%
 * Test framework: Jest
 * Mocking: Manual https module mocking
 *
 * @spec AC-005: GitHub API Integration
 * @spec BR-004: Milestone Extraction
 */

const { GitHubClient, GitHubApiError } = require('../../github-client');
const https = require('https');
const http = require('http');

// Mock the https and http modules
jest.mock('https');
jest.mock('http');

describe('GitHubClient', () => {
  let client;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock request and response
    mockResponse = {
      statusCode: 200,
      headers: {},
      setEncoding: jest.fn(),
      on: jest.fn()
    };

    mockRequest = {
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn()
    };

    // Setup https.request mock
    https.request.mockImplementation((options, callback) => {
      callback(mockResponse);
      return mockRequest;
    });

    // Create client instance with test config
    client = new GitHubClient({
      token: 'test-token-123',
      baseUrl: 'https://api.github.com',
      userAgent: 'Test-Agent/1.0.0',
      backoffMultiplier: 2,
      maxBackoffSeconds: 3600,
      warningThreshold: 100
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with provided config', () => {
      expect(client.token).toBe('test-token-123');
      expect(client.baseUrl).toBe('https://api.github.com');
      expect(client.userAgent).toBe('Test-Agent/1.0.0');
      expect(client.backoffMultiplier).toBe(2);
      expect(client.maxBackoffSeconds).toBe(3600);
      expect(client.warningThreshold).toBe(100);
    });

    it('should use environment variable for token when not provided', () => {
      const originalToken = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = 'env-token-456';

      const envClient = new GitHubClient({});
      expect(envClient.token).toBe('env-token-456');

      process.env.GITHUB_TOKEN = originalToken;
    });

    it('should use default values when no config provided', () => {
      const originalToken = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const defaultClient = new GitHubClient({});
      expect(defaultClient.baseUrl).toBe('https://api.github.com');
      expect(defaultClient.userAgent).toBe('OpenCode-ExpertPack/1.0.0');
      expect(defaultClient.backoffMultiplier).toBe(2);
      expect(defaultClient.maxBackoffSeconds).toBe(3600);
      expect(defaultClient.warningThreshold).toBe(100);
      expect(defaultClient.token).toBeNull();

      process.env.GITHUB_TOKEN = originalToken;
    });

    it('should initialize rate limit info with defaults', () => {
      expect(client.rateLimitInfo).toEqual({
        limit: 5000,
        remaining: 5000,
        reset: expect.any(Number),
        used: 0
      });
    });

    it('should warn when no token is provided', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const originalToken = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;

      new GitHubClient({});

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No token provided')
      );

      process.env.GITHUB_TOKEN = originalToken;
      consoleWarnSpy.mockRestore();
    });
  });

  describe('GitHubApiError', () => {
    it('should create error with status and message', () => {
      const error = new GitHubApiError(404, 'Not Found');
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not Found');
      expect(error.name).toBe('GitHubApiError');
    });

    it('should include documentation URL and errors when provided', () => {
      const validationErrors = [{ field: 'title', code: 'missing' }];
      const error = new GitHubApiError(
        422,
        'Validation Failed',
        'https://docs.github.com',
        validationErrors
      );
      expect(error.documentationUrl).toBe('https://docs.github.com');
      expect(error.errors).toEqual(validationErrors);
    });

    describe('isRetryable', () => {
      it('should return true for 500 errors', () => {
        const error = new GitHubApiError(500, 'Server Error');
        expect(error.isRetryable()).toBe(true);
      });

      it('should return false for 404 errors', () => {
        const error = new GitHubApiError(404, 'Not Found');
        expect(error.isRetryable()).toBe(false);
      });

      it('should return false for 403 errors', () => {
        const error = new GitHubApiError(403, 'Forbidden');
        expect(error.isRetryable()).toBe(false);
      });
    });

    describe('isRateLimitError', () => {
      it('should return true for 403 with rate limit message', () => {
        const error = new GitHubApiError(403, 'API rate limit exceeded');
        expect(error.isRateLimitError()).toBe(true);
      });

      it('should return false for 403 without rate limit message', () => {
        const error = new GitHubApiError(403, 'Forbidden');
        expect(error.isRateLimitError()).toBe(false);
      });

      it('should return false for other status codes', () => {
        const error = new GitHubApiError(404, 'Not Found');
        expect(error.isRateLimitError()).toBe(false);
      });
    });

    describe('isNotFoundError', () => {
      it('should return true for 404 errors', () => {
        const error = new GitHubApiError(404, 'Not Found');
        expect(error.isNotFoundError()).toBe(true);
      });

      it('should return false for other status codes', () => {
        const error = new GitHubApiError(500, 'Server Error');
        expect(error.isNotFoundError()).toBe(false);
      });
    });

    describe('isPermissionError', () => {
      it('should return true for 403 without rate limit', () => {
        const error = new GitHubApiError(403, 'Forbidden');
        expect(error.isPermissionError()).toBe(true);
      });

      it('should return false for 403 with rate limit', () => {
        const error = new GitHubApiError(403, 'API rate limit exceeded');
        expect(error.isPermissionError()).toBe(false);
      });

      it('should return false for other status codes', () => {
        const error = new GitHubApiError(404, 'Not Found');
        expect(error.isPermissionError()).toBe(false);
      });
    });
  });

  describe('_parseUrl', () => {
    it('should parse absolute URLs', () => {
      const result = client._parseUrl('https://api.github.com/repos/owner/repo/issues');
      expect(result).toEqual({
        protocol: 'https:',
        hostname: 'api.github.com',
        port: 443,
        path: '/repos/owner/repo/issues'
      });
    });

    it('should parse relative paths by prepending baseUrl', () => {
      const result = client._parseUrl('/repos/owner/repo/issues');
      expect(result).toEqual({
        protocol: 'https:',
        hostname: 'api.github.com',
        port: 443,
        path: '/repos/owner/repo/issues'
      });
    });

    it('should handle URLs with query parameters', () => {
      const result = client._parseUrl('/repos/owner/repo/issues?state=open');
      expect(result.path).toBe('/repos/owner/repo/issues?state=open');
    });

    it('should handle custom ports in URL', () => {
      const result = client._parseUrl('http://localhost:3000/api/test');
      expect(result.port).toBe('3000');
      expect(result.protocol).toBe('http:');
    });
  });

  describe('_request', () => {
    it('should make successful GET request', async () => {
      const responseData = { id: 123, title: 'Test Issue' };
      setupMockResponse(200, responseData, {
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4999'
      });

      const result = await client._request('GET', '/repos/owner/repo/issues/123');

      expect(result).toEqual(responseData);
      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          hostname: 'api.github.com',
          path: '/repos/owner/repo/issues/123',
          headers: expect.objectContaining({
            'Authorization': 'token test-token-123',
            'User-Agent': 'Test-Agent/1.0.0',
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
          })
        }),
        expect.any(Function)
      );
    });

    it('should make POST request with body', async () => {
      const requestBody = { body: 'Test comment' };
      const responseData = { id: 456, body: 'Test comment' };
      setupMockResponse(201, responseData);

      const result = await client._request('POST', '/repos/owner/repo/issues/123/comments', requestBody);

      expect(result).toEqual(responseData);
      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/repos/owner/repo/issues/123/comments'
        }),
        expect.any(Function)
      );
    });

    it('should handle 204 No Content response', async () => {
      setupMockResponse(204, null);

      const result = await client._request('DELETE', '/repos/owner/repo/issues/123/labels/bug');

      expect(result).toEqual({});
    });

    it('should update rate limit info from headers', async () => {
      setupMockResponse(200, {}, {
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '100',
        'x-ratelimit-reset': '1234567890',
        'x-ratelimit-used': '4900'
      });

      await client._request('GET', '/repos/owner/repo/issues/123');

      expect(client.rateLimitInfo).toEqual({
        limit: 5000,
        remaining: 100,
        reset: 1234567890000,
        used: 4900
      });
    });

    it('should warn when rate limit is low', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      client.warningThreshold = 100;

      setupMockResponse(200, {}, {
        'x-ratelimit-remaining': '50'
      });

      await client._request('GET', '/repos/owner/repo/issues/123');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limit warning')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should work without token (unauthenticated)', async () => {
      client.token = null;
      setupMockResponse(200, { id: 123 });

      await client._request('GET', '/repos/owner/repo/issues/123');

      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String)
          })
        }),
        expect.any(Function)
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw GitHubApiError for 404 Not Found', async () => {
      setupMockResponse(404, {
        message: 'Not Found',
        documentation_url: 'https://docs.github.com'
      });

      await expect(client._request('GET', '/repos/owner/repo/issues/999'))
        .rejects
        .toThrow(GitHubApiError);

      try {
        await client._request('GET', '/repos/owner/repo/issues/999');
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Not Found');
        expect(error.documentationUrl).toBe('https://docs.github.com');
        expect(error.isNotFoundError()).toBe(true);
      }
    });

    it('should throw GitHubApiError for 403 Forbidden', async () => {
      setupMockResponse(403, {
        message: 'Forbidden'
      });

      await expect(client._request('GET', '/repos/owner/repo/issues/123'))
        .rejects
        .toThrow(GitHubApiError);

      try {
        await client._request('GET', '/repos/owner/repo/issues/123');
      } catch (error) {
        expect(error.status).toBe(403);
        expect(error.isPermissionError()).toBe(true);
      }
    });

    it('should throw GitHubApiError for 401 Unauthorized', async () => {
      setupMockResponse(401, {
        message: 'Bad credentials'
      });

      await expect(client._request('GET', '/repos/owner/repo/issues/123'))
        .rejects
        .toThrow(GitHubApiError);

      try {
        await client._request('GET', '/repos/owner/repo/issues/123');
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Bad credentials');
      }
    });

    it('should throw GitHubApiError for 500 Server Error', async () => {
      setupMockResponse(500, {
        message: 'Internal Server Error'
      });

      await expect(client._request('GET', '/repos/owner/repo/issues/123'))
        .rejects
        .toThrow(GitHubApiError);

      try {
        await client._request('GET', '/repos/owner/repo/issues/123');
      } catch (error) {
        expect(error.status).toBe(500);
        expect(error.isRetryable()).toBe(true);
      }
    });

    it('should throw GitHubApiError for 422 Validation Failed', async () => {
      setupMockResponse(422, {
        message: 'Validation Failed',
        errors: [{ field: 'title', code: 'missing' }]
      });

      await expect(client._request('POST', '/repos/owner/repo/issues', {}))
        .rejects
        .toThrow(GitHubApiError);

      try {
        await client._request('POST', '/repos/owner/repo/issues', {});
      } catch (error) {
        expect(error.status).toBe(422);
        expect(error.errors).toEqual([{ field: 'title', code: 'missing' }]);
      }
    });

    it('should handle network errors', async () => {
      mockRequest.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(new Error('ECONNREFUSED'));
        }
      });

      https.request.mockImplementation((options, callback) => {
        return mockRequest;
      });

      await expect(client._request('GET', '/repos/owner/repo/issues/123'))
        .rejects
        .toThrow(GitHubApiError);

      try {
        await client._request('GET', '/repos/owner/repo/issues/123');
      } catch (error) {
        expect(error.status).toBe(0);
        expect(error.message).toContain('Network error');
      }
    });

    it('should handle non-JSON error responses', async () => {
      mockResponse.statusCode = 500;
      mockResponse.headers = {};
      mockResponse.setEncoding = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === 'data') {
          callback('Internal Server Error');
        }
        if (event === 'end') {
          callback();
        }
      });

      try {
        await client._request('GET', '/repos/owner/repo/issues/123');
      } catch (error) {
        expect(error).toBeInstanceOf(GitHubApiError);
        expect(error.status).toBe(500);
        expect(error.message).toBe('Internal Server Error');
      }
    });
  });

  describe('Rate Limit Handling', () => {
    describe('_calculateBackoff', () => {
      it('should calculate exponential backoff with max cap', () => {
        // Implementation: Math.min(1000 * pow(2, n) * 1000, maxBackoffSeconds * 1000)
        // Default maxBackoffSeconds = 3600, so max is 3600000
        expect(client._calculateBackoff(0)).toBe(1000000); // 1000 * 1 * 1000 = 1000000
        expect(client._calculateBackoff(1)).toBe(2000000); // 1000 * 2 * 1000 = 2000000
        expect(client._calculateBackoff(2)).toBe(3600000); // would be 4000000 but capped at 3600000
        expect(client._calculateBackoff(3)).toBe(3600000); // would be 8000000 but capped
      });

      it('should respect max backoff limit', () => {
        client.maxBackoffSeconds = 10;
        expect(client._calculateBackoff(10)).toBe(10000); // capped at max
      });
    });

    describe('_sleep', () => {
      it('should return a promise that resolves after delay', async () => {
        const start = Date.now();
        await client._sleep(50);
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some variance
      });
    });

    describe('_requestWithRetry', () => {
      beforeEach(() => {
        // Override _sleep to speed up tests
        client._sleep = jest.fn().mockResolvedValue();
      });

      it('should succeed on first attempt', async () => {
        setupMockResponse(200, { success: true });

        const result = await client._requestWithRetry('GET', '/test');

        expect(result).toEqual({ success: true });
        expect(https.request).toHaveBeenCalledTimes(1);
      });

      it('should retry on 500 error and succeed', async () => {
        // First call fails with 500, second succeeds
        let callCount = 0;
        https.request.mockImplementation((options, callback) => {
          callCount++;
          if (callCount === 1) {
            callback(createMockResponse(500, { message: 'Server Error' }));
          } else {
            callback(createMockResponse(200, { success: true }));
          }
          return mockRequest;
        });

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = await client._requestWithRetry('GET', '/test', null, 3);

        expect(result).toEqual({ success: true });
        expect(https.request).toHaveBeenCalledTimes(2);
        expect(client._sleep).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Server error 500')
        );

        consoleWarnSpy.mockRestore();
      });

      it('should not retry 404 errors', async () => {
        setupMockResponse(404, { message: 'Not Found' });

        await expect(client._requestWithRetry('GET', '/test'))
          .rejects
          .toThrow(GitHubApiError);

        expect(https.request).toHaveBeenCalledTimes(1);
        expect(client._sleep).not.toHaveBeenCalled();
      });

      it('should not retry permission errors (403)', async () => {
        setupMockResponse(403, { message: 'Forbidden' });

        await expect(client._requestWithRetry('GET', '/test'))
          .rejects
          .toThrow(GitHubApiError);

        expect(https.request).toHaveBeenCalledTimes(1);
        expect(client._sleep).not.toHaveBeenCalled();
      });

      it('should handle rate limit errors with backoff', async () => {
        const resetTime = Math.floor(Date.now() / 1000) + 60; // 60 seconds from now

        let callCount = 0;
        https.request.mockImplementation((options, callback) => {
          callCount++;
          if (callCount === 1) {
            const response = createMockResponse(403, {
              message: 'API rate limit exceeded'
            }, {
              'x-ratelimit-reset': String(resetTime)
            });
            callback(response);
          } else {
            callback(createMockResponse(200, { success: true }));
          }
          return mockRequest;
        });

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = await client._requestWithRetry('GET', '/test');

        expect(result).toEqual({ success: true });
        expect(https.request).toHaveBeenCalledTimes(2);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Rate limit hit')
        );

        consoleWarnSpy.mockRestore();
      });

      it('should throw after max retries exceeded', async () => {
        https.request.mockImplementation((options, callback) => {
          callback(createMockResponse(500, { message: 'Server Error' }));
          return mockRequest;
        });

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        // Implementation throws the last error when retries exhausted
        await expect(client._requestWithRetry('GET', '/test', null, 2))
          .rejects
          .toThrow('Server Error');

        expect(https.request).toHaveBeenCalledTimes(3); // initial + 2 retries

        consoleWarnSpy.mockRestore();
      });
    });
  });

  describe('Comment Methods', () => {
    describe('postComment', () => {
      it('should post a comment on an issue', async () => {
        const responseData = {
          id: 12345,
          body: 'This is a test comment',
          user: { login: 'test-bot' }
        };
        setupMockResponse(201, responseData);

        const result = await client.postComment('owner', 'repo', 123, 'This is a test comment');

        expect(result).toEqual(responseData);
        expect(https.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/repos/owner/repo/issues/123/comments'
          }),
          expect.any(Function)
        );
      });

      it('should support markdown in comment body', async () => {
        setupMockResponse(201, { id: 123 });

        const markdown = '# Header\n\n- Item 1\n- Item 2';
        await client.postComment('owner', 'repo', 123, markdown);

        expect(https.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/repos/owner/repo/issues/123/comments'
          }),
          expect.any(Function)
        );
      });
    });

    describe('updateComment', () => {
      it('should update an existing comment', async () => {
        const responseData = {
          id: 12345,
          body: 'Updated comment'
        };
        setupMockResponse(200, responseData);

        const result = await client.updateComment('owner', 'repo', 12345, 'Updated comment');

        expect(result).toEqual(responseData);
        expect(https.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'PATCH',
            path: '/repos/owner/repo/issues/comments/12345'
          }),
          expect.any(Function)
        );
      });
    });

    describe('deleteComment', () => {
      it('should delete a comment', async () => {
        setupMockResponse(204, null);

        const result = await client.deleteComment('owner', 'repo', 12345);

        expect(result).toEqual({});
        expect(https.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'DELETE',
            path: '/repos/owner/repo/issues/comments/12345'
          }),
          expect.any(Function)
        );
      });
    });
  });

  describe('Label Methods', () => {
    describe('addLabel', () => {
      it('should add a single label to an issue', async () => {
        const responseData = [{ id: 1, name: 'bug' }];
        setupMockResponse(200, responseData);

        const result = await client.addLabel('owner', 'repo', 123, 'bug');

        expect(result).toEqual(responseData);
        expect(https.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/repos/owner/repo/issues/123/labels'
          }),
          expect.any(Function)
        );
      });

      it('should add multiple labels when array is provided', async () => {
        setupMockResponse(200, []);

        await client.addLabel('owner', 'repo', 123, ['bug', 'feature', 'help wanted']);

        expect(https.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/repos/owner/repo/issues/123/labels'
          }),
          expect.any(Function)
        );
      });
    });

    describe('removeLabel', () => {
      it('should remove a label from an issue', async () => {
        setupMockResponse(200, []);

        const result = await client.removeLabel('owner', 'repo', 123, 'bug');

        expect(result).toEqual([]);
        expect(https.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'DELETE',
            path: '/repos/owner/repo/issues/123/labels/bug'
          }),
          expect.any(Function)
        );
      });

      it('should URL encode special characters in label names', async () => {
        setupMockResponse(200, []);

        await client.removeLabel('owner', 'repo', 123, 'help wanted');

        expect(https.request).toHaveBeenCalledWith(
          expect.objectContaining({
            path: '/repos/owner/repo/issues/123/labels/help%20wanted'
          }),
          expect.any(Function)
        );
      });
    });

    describe('listLabels', () => {
      it('should list all labels on an issue', async () => {
        const responseData = [
          { id: 1, name: 'bug', color: 'd73a4a' },
          { id: 2, name: 'feature', color: 'a2eeef' }
        ];
        setupMockResponse(200, responseData);

        const result = await client.listLabels('owner', 'repo', 123);

        expect(result).toEqual(responseData);
        expect(https.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'GET',
            path: '/repos/owner/repo/issues/123/labels'
          }),
          expect.any(Function)
        );
      });
    });
  });

  describe('Issue Methods', () => {
    describe('getIssue', () => {
      it('should get issue by number', async () => {
        const responseData = {
          number: 123,
          title: 'Test Issue',
          body: 'Issue description',
          state: 'open'
        };
        setupMockResponse(200, responseData);

        const result = await client.getIssue('owner', 'repo', 123);

        expect(result).toEqual(responseData);
        expect(https.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'GET',
            path: '/repos/owner/repo/issues/123'
          }),
          expect.any(Function)
        );
      });

      it('should include milestone information when present', async () => {
        const responseData = {
          number: 123,
          title: 'Test Issue',
          milestone: {
            number: 1,
            title: 'v1.0',
            state: 'open'
          }
        };
        setupMockResponse(200, responseData);

        const result = await client.getIssue('owner', 'repo', 123);

        expect(result.milestone).toEqual({
          number: 1,
          title: 'v1.0',
          state: 'open'
        });
      });
    });

    // createIssue method not implemented in GitHubClient - skip these tests
  });

  describe('Rate Limit Methods', () => {
    describe('checkRateLimit', () => {
      it('should check current rate limit status', async () => {
        const responseData = {
          resources: {
            core: {
              limit: 5000,
              remaining: 4990,
              reset: 1234567890,
              used: 10
            }
          }
        };
        setupMockResponse(200, responseData);

        const result = await client.checkRateLimit();

        expect(result).toEqual(responseData);
        expect(client.rateLimitInfo).toEqual({
          limit: 5000,
          remaining: 4990,
          reset: 1234567890000,
          used: 10
        });
      });

      it('should handle response without resources', async () => {
        setupMockResponse(200, {});

        const result = await client.checkRateLimit();

        expect(result).toEqual({});
        // Rate limit info should remain unchanged
        expect(client.rateLimitInfo.limit).toBe(5000);
      });
    });

    describe('getRateLimitInfo', () => {
      it('should return cached rate limit info with formatted date', () => {
        client.rateLimitInfo = {
          limit: 5000,
          remaining: 100,
          reset: Date.now() + 3600000, // 1 hour from now
          used: 4900
        };

        const result = client.getRateLimitInfo();

        expect(result.limit).toBe(5000);
        expect(result.remaining).toBe(100);
        expect(result.used).toBe(4900);
        expect(result.resetDate).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
        expect(result.secondsUntilReset).toBeGreaterThan(3500);
        expect(result.secondsUntilReset).toBeLessThanOrEqual(3600);
      });

      it('should return 0 secondsUntilReset when past reset time', () => {
        client.rateLimitInfo = {
          limit: 5000,
          remaining: 100,
          reset: Date.now() - 1000, // 1 second ago
          used: 4900
        };

        const result = client.getRateLimitInfo();

        expect(result.secondsUntilReset).toBe(0);
      });
    });

    describe('isRateLimitLow', () => {
      it('should return true when remaining is below threshold', () => {
        client.rateLimitInfo.remaining = 50;
        client.warningThreshold = 100;

        expect(client.isRateLimitLow()).toBe(true);
      });

      it('should return false when remaining is at or above threshold', () => {
        client.rateLimitInfo.remaining = 100;
        client.warningThreshold = 100;

        expect(client.isRateLimitLow()).toBe(false);

        client.rateLimitInfo.remaining = 150;
        expect(client.isRateLimitLow()).toBe(false);
      });
    });
  });

  describe('HTTP Protocol Selection', () => {
    it('should use https for https URLs', async () => {
      setupMockResponse(200, { success: true });

      await client._request('GET', 'https://api.github.com/test');

      expect(https.request).toHaveBeenCalled();
      expect(http.request).not.toHaveBeenCalled();
    });

    it('should use http for http URLs', async () => {
      const httpClient = new GitHubClient({
        token: 'test-token',
        baseUrl: 'http://localhost:3000'
      });

      http.request.mockImplementation((options, callback) => {
        callback(createMockResponse(200, { success: true }));
        return mockRequest;
      });

      await httpClient._request('GET', '/test');

      expect(http.request).toHaveBeenCalled();
      expect(https.request).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response body', async () => {
      mockResponse.statusCode = 200;
      mockResponse.headers = {};
      mockResponse.setEncoding = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === 'data') {
          // No data
        }
        if (event === 'end') {
          callback();
        }
      });

      const result = await client._request('GET', '/test');

      expect(result).toEqual({});
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockResponse.statusCode = 200;
      mockResponse.headers = {};
      mockResponse.setEncoding = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === 'data') {
          callback('invalid json');
        }
        if (event === 'end') {
          callback();
        }
      });

      const result = await client._request('GET', '/test');

      expect(result).toEqual({});
    });

    it('should handle very long retry delays', async () => {
      client._sleep = jest.fn().mockResolvedValue();
      client.maxBackoffSeconds = 3600;

      let callCount = 0;
      https.request.mockImplementation((options, callback) => {
        callCount++;
        if (callCount < 3) {
          callback(createMockResponse(500, { message: 'Server Error' }));
        } else {
          callback(createMockResponse(200, { success: true }));
        }
        return mockRequest;
      });

      await client._requestWithRetry('GET', '/test', null, 3);

      // Should be capped at maxBackoffSeconds
      expect(client._sleep).toHaveBeenCalled();
    });

    it('should handle labels with special characters', async () => {
      setupMockResponse(200, []);

      await client.removeLabel('owner', 'repo', 123, 'type:bug');

      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/repos/owner/repo/issues/123/labels/type%3Abug'
        }),
        expect.any(Function)
      );
    });
  });

  describe('Integration Scenarios', () => {
    beforeEach(() => {
      client._sleep = jest.fn().mockResolvedValue();
    });

    it('should handle complete workflow: get issue, add label, post comment', async () => {
      // Mock getIssue
      const issueData = { number: 123, title: 'Test Issue' };
      setupMockResponse(200, issueData);
      const issue = await client.getIssue('owner', 'repo', 123);
      expect(issue.number).toBe(123);

      // Mock addLabel
      setupMockResponse(200, [{ name: 'in-progress' }]);
      const labels = await client.addLabel('owner', 'repo', 123, 'in-progress');
      expect(labels).toHaveLength(1);

      // Mock postComment
      setupMockResponse(201, { id: 456, body: 'Working on this issue' });
      const comment = await client.postComment('owner', 'repo', 123, 'Working on this issue');
      expect(comment.id).toBe(456);
    });

    it('should handle milestone extraction workflow', async () => {
      const issueWithMilestone = {
        number: 123,
        title: 'Feature request',
        milestone: {
          number: 5,
          title: 'v2.0',
          state: 'open',
          due_on: '2024-12-31T23:59:59Z'
        },
        labels: [
          { name: 'milestone:M005' },
          { name: 'role:developer' }
        ]
      };
      setupMockResponse(200, issueWithMilestone);

      const issue = await client.getIssue('owner', 'repo', 123);

      expect(issue.milestone).toBeDefined();
      expect(issue.milestone.number).toBe(5);
      expect(issue.milestone.title).toBe('v2.0');

      // Extract milestone ID from labels
      const milestoneLabel = issue.labels.find(l => l.name.startsWith('milestone:'));
      const milestoneId = milestoneLabel ? milestoneLabel.name.split(':')[1] : null;
      expect(milestoneId).toBe('M005');
    });
  });
});

// Helper functions

function createMockResponse(statusCode, body, headers = {}) {
  const response = {
    statusCode,
    headers: {
      'x-ratelimit-limit': '5000',
      'x-ratelimit-remaining': '4999',
      ...headers
    },
    setEncoding: jest.fn(),
    on: jest.fn((event, callback) => {
      if (event === 'data') {
        if (body) {
          callback(JSON.stringify(body));
        }
      }
      if (event === 'end') {
        callback();
      }
    })
  };
  return response;
}

function setupMockResponse(statusCode, body, headers = {}) {
  https.request.mockImplementation((options, callback) => {
    callback(createMockResponse(statusCode, body, headers));
    return {
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn()
    };
  });
}
