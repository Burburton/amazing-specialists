const fs = require('fs');
const path = require('path');
const os = require('os');
const nock = require('nock');
const { IssueProcessor } = require('../../../scripts/process-issue');

describe('Issue Lifecycle Automation CLI Integration', () => {
  let tempDir;
  let processor;
  let githubScope;

  const testOwner = 'test-owner';
  const testRepo = 'test-repo';
  const testToken = 'test-token-12345';

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'issue-lifecycle-test-'));
    
    const config = {
      github_config: {
        api: { base_url: 'https://api.github.com' },
        token: testToken,
        label_mappings: {
          task_prefix: 'task:',
          role_prefix: 'role:',
          risk_prefix: 'risk:'
        }
      }
    };
    
    processor = new IssueProcessor(config, tempDir);
    
    githubScope = nock('https://api.github.com');
    
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('create command', () => {
    test('creates new issue with task ID', async () => {
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-TEST-001&state=all')
        .reply(200, []);
      
      githubScope
        .post('/repos/test-owner/test-repo/issues', body => {
          expect(body.title).toBe('Test Issue');
          expect(body.labels).toContain('task:T-TEST-001');
          expect(body.labels).toContain('role:developer');
          return true;
        })
        .reply(201, {
          number: 42,
          title: 'Test Issue',
          html_url: 'https://github.com/test-owner/test-repo/issues/42',
          state: 'open',
          labels: [
            { name: 'task:T-TEST-001' },
            { name: 'role:developer' }
          ]
        });

      const result = await processor.handleCreateCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-TEST-001',
        title: 'Test Issue',
        role: 'developer'
      });

      expect(result.success).toBe(true);
      expect(result.issue.number).toBe(42);
      expect(result.alreadyExisted).toBe(false);
      
      const cachedIssue = processor.context.getIssueByTaskId('T-TEST-001');
      expect(cachedIssue).not.toBeNull();
      expect(cachedIssue.number).toBe(42);
    });

    test('returns existing issue if already created (idempotency)', async () => {
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-TEST-001&state=all')
        .reply(200, [
          {
            number: 42,
            title: 'Existing Issue',
            html_url: 'https://github.com/test-owner/test-repo/issues/42',
            state: 'open',
            labels: [{ name: 'task:T-TEST-001' }]
          }
        ]);

      const result = await processor.handleCreateCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-TEST-001',
        title: 'New Title'
      });

      expect(result.success).toBe(true);
      expect(result.alreadyExisted).toBe(true);
      expect(result.issue.number).toBe(42);
    });

    test('fails with missing required args', async () => {
      const result = await processor.handleCreateCommand({
        owner: testOwner,
        repo: testRepo
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('MISSING_ARGS');
    });
  });

  describe('close command', () => {
    test('closes issue by task ID', async () => {
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-TEST-001&state=all')
        .reply(200, [
          {
            number: 42,
            title: 'Test Issue',
            html_url: 'https://github.com/test-owner/test-repo/issues/42',
            state: 'open',
            labels: [{ name: 'task:T-TEST-001' }]
          }
        ]);

      githubScope
        .post('/repos/test-owner/test-repo/issues/42/comments', body => {
          expect(body.body).toContain('Implementation complete');
          return true;
        })
        .reply(201, { id: 1 });

      githubScope
        .patch('/repos/test-owner/test-repo/issues/42', body => {
          expect(body.state).toBe('closed');
          return true;
        })
        .reply(200, {
          number: 42,
          state: 'closed'
        });

      const result = await processor.handleCloseCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-TEST-001',
        comment: '✅ Implementation complete'
      });

      expect(result.success).toBe(true);
      expect(result.issue.state).toBe('closed');
      expect(result.alreadyClosed).toBe(false);
    });

    test('returns success if already closed (idempotency)', async () => {
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-TEST-001&state=all')
        .reply(200, [
          {
            number: 42,
            title: 'Test Issue',
            state: 'closed',
            labels: [{ name: 'task:T-TEST-001' }]
          }
        ]);

      const result = await processor.handleCloseCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-TEST-001'
      });

      expect(result.success).toBe(true);
      expect(result.alreadyClosed).toBe(true);
    });

    test('fails when issue not found', async () => {
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-TEST-999&state=all')
        .reply(200, []);

      const result = await processor.handleCloseCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-TEST-999'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('status command', () => {
    test('returns cached status', async () => {
      processor.context.recordIssue('T-TEST-001', 42, {
        url: 'https://github.com/test-owner/test-repo/issues/42',
        status: 'open'
      });

      const result = await processor.handleStatusCommand({
        task: 'T-TEST-001'
      });

      expect(result.success).toBe(true);
      expect(result.source).toBe('cache');
      expect(result.issue.number).toBe(42);
    });

    test('fetches status from API when not cached', async () => {
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-TEST-001&state=all')
        .reply(200, [
          {
            number: 42,
            title: 'Test Issue',
            html_url: 'https://github.com/test-owner/test-repo/issues/42',
            state: 'open',
            created_at: '2026-04-04T12:00:00Z'
          }
        ]);

      const result = await processor.handleStatusCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-TEST-001'
      });

      expect(result.success).toBe(true);
      expect(result.source).toBe('api');
      expect(result.issue.number).toBe(42);
    });

    test('fails when task not found', async () => {
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-TEST-999&state=all')
        .reply(200, []);

      const result = await processor.handleStatusCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-TEST-999'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('list command', () => {
    test('lists issues from API', async () => {
      githubScope
        .get('/repos/test-owner/test-repo/issues?state=open')
        .reply(200, [
          {
            number: 42,
            title: 'Test Issue 1',
            state: 'open',
            labels: [{ name: 'task:T-TEST-001' }]
          },
          {
            number: 43,
            title: 'Test Issue 2',
            state: 'open',
            labels: [{ name: 'task:T-TEST-002' }]
          }
        ]);

      const result = await processor.handleListCommand({
        owner: testOwner,
        repo: testRepo,
        state: 'open'
      });

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(2);
      expect(result.source).toBe('api');
    });

    test('lists issues by task prefix from cache', async () => {
      processor.context.recordIssue('T-042-001', 42, { status: 'open' });
      processor.context.recordIssue('T-042-002', 43, { status: 'closed' });

      const result = await processor.handleListCommand({
        owner: testOwner,
        repo: testRepo,
        taskPrefix: 'T-042'
      });

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(2);
      expect(result.source).toBe('cache');
    });

    test('filters by label', async () => {
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=role%3Adeveloper')
        .reply(200, [
          {
            number: 42,
            title: 'Dev Issue',
            state: 'open',
            labels: [{ name: 'role:developer' }]
          }
        ]);

      const result = await processor.handleListCommand({
        owner: testOwner,
        repo: testRepo,
        label: 'role:developer'
      });

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(1);
    });
  });

  describe('full workflow', () => {
    test('create → status → close flow', async () => {
      // Step 1: Create
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-WORKFLOW-001&state=all')
        .reply(200, []);
      
      githubScope
        .post('/repos/test-owner/test-repo/issues')
        .reply(201, {
          number: 100,
          title: 'Workflow Test Issue',
          html_url: 'https://github.com/test-owner/test-repo/issues/100',
          state: 'open',
          labels: [{ name: 'task:T-WORKFLOW-001' }]
        });

      const createResult = await processor.handleCreateCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-WORKFLOW-001',
        title: 'Workflow Test Issue'
      });
      expect(createResult.success).toBe(true);
      expect(createResult.issue.number).toBe(100);

      // Step 2: Status (from cache)
      const statusResult = await processor.handleStatusCommand({
        task: 'T-WORKFLOW-001'
      });
      expect(statusResult.success).toBe(true);
      expect(statusResult.source).toBe('cache');
      expect(statusResult.issue.status).toBe('open');

      // Step 3: Close
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-WORKFLOW-001&state=all')
        .reply(200, [
          {
            number: 100,
            title: 'Workflow Test Issue',
            html_url: 'https://github.com/test-owner/test-repo/issues/100',
            state: 'open',
            labels: [{ name: 'task:T-WORKFLOW-001' }]
          }
        ]);

      githubScope
        .patch('/repos/test-owner/test-repo/issues/100')
        .reply(200, {
          number: 100,
          state: 'closed'
        });

      const closeResult = await processor.handleCloseCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-WORKFLOW-001'
      });
      expect(closeResult.success).toBe(true);
      expect(closeResult.issue.state).toBe('closed');

      // Verify context updated
      const finalStatus = processor.context.getIssueByTaskId('T-WORKFLOW-001');
      expect(finalStatus.status).toBe('closed');
    });

    test('idempotency: repeated create and close', async () => {
      // First create
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-IDEMPOTENT-001&state=all')
        .reply(200, []);
      
      githubScope
        .post('/repos/test-owner/test-repo/issues')
        .reply(201, {
          number: 200,
          html_url: 'https://github.com/test-owner/test-repo/issues/200',
          state: 'open'
        });

      const create1 = await processor.handleCreateCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-IDEMPOTENT-001',
        title: 'Idempotent Test'
      });
      expect(create1.alreadyExisted).toBe(false);

      // Second create (should return existing)
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-IDEMPOTENT-001&state=all')
        .reply(200, [
          {
            number: 200,
            html_url: 'https://github.com/test-owner/test-repo/issues/200',
            state: 'open'
          }
        ]);

      const create2 = await processor.handleCreateCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-IDEMPOTENT-001',
        title: 'Idempotent Test'
      });
      expect(create2.alreadyExisted).toBe(true);

      // First close
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-IDEMPOTENT-001&state=all')
        .reply(200, [
          {
            number: 200,
            state: 'open'
          }
        ]);
      
      githubScope
        .patch('/repos/test-owner/test-repo/issues/200')
        .reply(200, { number: 200, state: 'closed' });

      const close1 = await processor.handleCloseCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-IDEMPOTENT-001'
      });
      expect(close1.alreadyClosed).toBe(false);

      // Second close (should return already closed)
      githubScope
        .get('/repos/test-owner/test-repo/issues?labels=task%3AT-IDEMPOTENT-001&state=all')
        .reply(200, [
          {
            number: 200,
            state: 'closed'
          }
        ]);

      const close2 = await processor.handleCloseCommand({
        owner: testOwner,
        repo: testRepo,
        task: 'T-IDEMPOTENT-001'
      });
      expect(close2.alreadyClosed).toBe(true);
    });
  });
});