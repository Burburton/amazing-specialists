const { PRClient } = require('../../src/pr-client');
const nock = require('nock');

const GITHUB_API = 'https://api.github.com';

describe('PRClient', () => {
  let client;
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      api: {
        base_url: 'https://api.github.com',
        user_agent: 'TestAgent/1.0.0'
      },
      authentication: {
        primary_method: 'pat',
        token_env_var: 'GITHUB_TOKEN'
      },
      rate_limit: {
        enabled: false
      },
      pr_config: {
        draft_by_default: false
      }
    };

    process.env.GITHUB_TOKEN = 'test-token-12345';
    client = new PRClient(mockConfig);
    nock.cleanAll();
  });

  afterEach(() => {
    delete process.env.GITHUB_TOKEN;
    nock.cleanAll();
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(client.config).toEqual(mockConfig);
      expect(client.initialized).toBe(false);
    });

    it('should handle null config', () => {
      const nullClient = new PRClient(null);
      expect(nullClient.config).toEqual({});
    });
  });

  describe('initialize', () => {
    it('should initialize with PAT token', async () => {
      await client.initialize();
      expect(client.initialized).toBe(true);
    });

    it('should throw error if no valid token', async () => {
      delete process.env.GITHUB_TOKEN;
      const noTokenClient = new PRClient(mockConfig);

      await expect(noTokenClient.initialize()).rejects.toThrow('Failed to obtain valid authentication token');
    });

    it('should not reinitialize if already initialized', async () => {
      await client.initialize();
      const firstOctokit = client.octokit;
      await client.initialize();
      expect(client.octokit).toBe(firstOctokit);
    });
  });

  describe('createBranch', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should create a new branch', async () => {
      nock(GITHUB_API)
        .get(/\/repos\/owner\/repo\/git\/ref\/heads/)
        .reply(200, {
          ref: 'refs/heads/main',
          object: { sha: 'abc123basecommit' }
        });

      nock(GITHUB_API)
        .post('/repos/owner/repo/git/refs')
        .reply(201, {
          ref: 'refs/heads/feature-branch',
          object: { sha: 'def456newcommit' }
        });

      const result = await client.createBranch('owner', 'repo', 'feature-branch', 'main');

      expect(result.branch_name).toBe('feature-branch');
      expect(result.base_branch).toBe('main');
      expect(result.created).toBe(true);
    });
  });

  describe('getBranch', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should get branch info', async () => {
      nock(GITHUB_API)
        .get(/\/repos\/owner\/repo\/git\/ref\/heads/)
        .reply(200, {
          ref: 'refs/heads/existing-branch',
          object: { sha: 'abc123head' }
        });

      const result = await client.getBranch('owner', 'repo', 'existing-branch');

      expect(result.exists).toBe(true);
      expect(result.branch_name).toBe('existing-branch');
      expect(result.head_sha).toBe('abc123head');
    });

    it('should throw error for non-existent branch', async () => {
      nock(GITHUB_API)
        .get(/\/repos\/owner\/repo\/git\/ref\/heads/)
        .reply(404, { message: 'Not Found' });

      await expect(client.getBranch('owner', 'repo', 'nonexistent')).rejects.toThrow();
    });
  });

  describe('createOrUpdateFile', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should create a new file', async () => {
      nock(GITHUB_API)
        .put(/\/repos\/owner\/repo\/contents\/new-file\.js/)
        .reply(200, {
          content: { sha: 'filesha123' },
          commit: { sha: 'commitsha456' }
        });

      const result = await client.createOrUpdateFile(
        'owner',
        'repo',
        'new-file.js',
        'content',
        'Add new file',
        'main'
      );

      expect(result.path).toBe('new-file.js');
      expect(result.operation).toBe('created');
    });

    it('should update an existing file', async () => {
      nock(GITHUB_API)
        .put(/\/repos\/owner\/repo\/contents\/existing-file\.js/)
        .reply(200, {
          content: { sha: 'newfilesha' },
          commit: { sha: 'newcommitsha' }
        });

      const result = await client.createOrUpdateFile(
        'owner',
        'repo',
        'existing-file.js',
        'updated content',
        'Update file',
        'main',
        'existingfilesha'
      );

      expect(result.operation).toBe('updated');
    });
  });

  describe('deleteFile', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should delete a file', async () => {
      nock(GITHUB_API)
        .delete(/\/repos\/owner\/repo\/contents\/old-file\.js/)
        .reply(200, {
          commit: { sha: 'deletecommitsha' }
        });

      const result = await client.deleteFile(
        'owner',
        'repo',
        'old-file.js',
        'Remove old file',
        'main',
        'oldfilesha'
      );

      expect(result.deleted).toBe(true);
      expect(result.path).toBe('old-file.js');
    });
  });

  describe('getFile', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should get file content', async () => {
      const fileContent = Buffer.from('file content here').toString('base64');

      nock(GITHUB_API)
        .get(/\/repos\/owner\/repo\/contents\/file\.js/)
        .query({ ref: 'main' })
        .reply(200, {
          type: 'file',
          content: fileContent,
          sha: 'filesha',
          path: 'file.js'
        });

      const result = await client.getFile('owner', 'repo', 'file.js', 'main');

      expect(result.isDirectory).toBe(false);
      expect(result.content).toBe('file content here');
    });

    it('should detect directory', async () => {
      nock(GITHUB_API)
        .get(/\/repos\/owner\/repo\/contents\/src/)
        .query({ ref: 'main' })
        .reply(200, [
          { name: 'file1.js', type: 'file' },
          { name: 'file2.js', type: 'file' }
        ]);

      const result = await client.getFile('owner', 'repo', 'src', 'main');

      expect(result.isDirectory).toBe(true);
      expect(result.entries).toHaveLength(2);
    });
  });

  describe('createPR', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should create a pull request', async () => {
      nock(GITHUB_API)
        .post('/repos/owner/repo/pulls')
        .reply(201, {
          number: 42,
          html_url: 'https://github.com/owner/repo/pull/42',
          head: { ref: 'feature-branch' },
          base: { ref: 'main' }
        });

      const result = await client.createPR(
        'owner',
        'repo',
        'Add new feature',
        'feature-branch',
        'main',
        'PR description'
      );

      expect(result.pr_number).toBe(42);
      expect(result.pr_url).toBe('https://github.com/owner/repo/pull/42');
      expect(result.status).toBe('created');
    });
  });

  describe('getPR', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should get PR info', async () => {
      nock(GITHUB_API)
        .get('/repos/owner/repo/pulls/42')
        .reply(200, {
          number: 42,
          state: 'open',
          title: 'Add feature',
          head: { ref: 'feature-branch', sha: 'headsha' },
          base: { ref: 'main' },
          draft: false
        });

      const result = await client.getPR('owner', 'repo', 42);

      expect(result.number).toBe(42);
      expect(result.state).toBe('open');
      expect(result.head).toBe('feature-branch');
    });
  });

  describe('findPRByBranch', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should find PR by branch', async () => {
      nock(GITHUB_API)
        .get('/repos/owner/repo/pulls')
        .query({ head: 'owner:feature-branch', state: 'all' })
        .reply(200, [
          {
            number: 42,
            html_url: 'https://github.com/owner/repo/pull/42',
            state: 'open',
            head: { ref: 'feature-branch' }
          }
        ]);

      const result = await client.findPRByBranch('owner', 'repo', 'feature-branch');

      expect(result).not.toBeNull();
      expect(result.pr_number).toBe(42);
    });

    it('should return null if no PR found', async () => {
      nock(GITHUB_API)
        .get('/repos/owner/repo/pulls')
        .query({ head: 'owner:nonexistent', state: 'all' })
        .reply(200, []);

      const result = await client.findPRByBranch('owner', 'repo', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createReview', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should create a review', async () => {
      nock(GITHUB_API)
        .post('/repos/owner/repo/pulls/42/reviews')
        .reply(200, {
          id: 12345,
          state: 'APPROVED'
        });

      const result = await client.createReview('owner', 'repo', 42, 'APPROVE', 'LGTM!');

      expect(result.review_id).toBe(12345);
      expect(result.state).toBe('APPROVED');
    });
  });

  describe('createReviewComment', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should create a general comment', async () => {
      nock(GITHUB_API)
        .post('/repos/owner/repo/pulls/42/comments')
        .reply(201, {
          id: 54321,
          path: null,
          line: null
        });

      const result = await client.createReviewComment('owner', 'repo', 42, 'Nice work!');

      expect(result.comment_id).toBe(54321);
    });

    it('should create a line comment', async () => {
      nock(GITHUB_API)
        .post('/repos/owner/repo/pulls/42/comments')
        .reply(201, {
          id: 54322,
          path: 'file.js',
          line: 10
        });

      const result = await client.createReviewComment('owner', 'repo', 42, 'Fix this', 'file.js', 10);

      expect(result.path).toBe('file.js');
      expect(result.line).toBe(10);
    });
  });

  describe('addLabels', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should add labels to issue', async () => {
      nock(GITHUB_API)
        .post('/repos/owner/repo/issues/42/labels')
        .reply(200, [{ name: 'bug' }, { name: 'priority' }]);

      const result = await client.addLabels('owner', 'repo', 42, ['bug', 'priority']);

      expect(result.added).toBe(true);
      expect(result.labels).toEqual(['bug', 'priority']);
    });

    it('should accept single label string', async () => {
      nock(GITHUB_API)
        .post('/repos/owner/repo/issues/42/labels')
        .reply(200, [{ name: 'bug' }]);

      const result = await client.addLabels('owner', 'repo', 42, 'bug');

      expect(result.added).toBe(true);
    });
  });

  describe('removeLabel', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should remove a label', async () => {
      nock(GITHUB_API)
        .delete('/repos/owner/repo/issues/42/labels/bug')
        .reply(200, {});

      const result = await client.removeLabel('owner', 'repo', 42, 'bug');

      expect(result.removed).toBe(true);
    });
  });

  describe('getLabels', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should get labels on issue', async () => {
      nock(GITHUB_API)
        .get('/repos/owner/repo/issues/42/labels')
        .reply(200, [
          { name: 'bug' },
          { name: 'priority' }
        ]);

      const result = await client.getLabels('owner', 'repo', 42);

      expect(result).toEqual(['bug', 'priority']);
    });
  });

  describe('getRateLimitInfo', () => {
    it('should return rate limit info', () => {
      const info = client.getRateLimitInfo();

      expect(info).toHaveProperty('limit');
      expect(info).toHaveProperty('remaining');
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return rate limit status', () => {
      const status = client.getRateLimitStatus();

      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('near_limit');
    });
  });
});