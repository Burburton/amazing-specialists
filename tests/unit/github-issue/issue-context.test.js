const fs = require('fs');
const path = require('path');
const os = require('os');

const { IssueContext } = require('../../../adapters/github-issue/issue-context');

describe('IssueContext', () => {
  let tempDir;
  let contextPath;
  let context;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'issue-context-test-'));
    contextPath = path.join(tempDir, '.issue-context.json');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('constructor', () => {
    test('creates new context file if not exists', () => {
      context = new IssueContext(tempDir);
      expect(context.data.version).toBe('1.0.0');
      expect(context.data.issues).toEqual({});
    });

    test('loads existing context file', () => {
      const existingData = {
        version: '1.0.0',
        project: 'test-project',
        owner: 'test-owner',
        issues: {
          'T-001': { number: 1, status: 'open' }
        },
        lastUpdated: '2026-01-01T00:00:00Z'
      };
      fs.writeFileSync(contextPath, JSON.stringify(existingData));

      context = new IssueContext(tempDir);
      expect(context.data.project).toBe('test-project');
      expect(context.data.issues['T-001'].number).toBe(1);
    });

    test('handles corrupted file', () => {
      fs.writeFileSync(contextPath, 'invalid json {{{');

      context = new IssueContext(tempDir);
      expect(context.data.version).toBe('1.0.0');
      expect(context.data.issues).toEqual({});
    });

    test('handles invalid structure', () => {
      fs.writeFileSync(contextPath, JSON.stringify({ foo: 'bar' }));

      context = new IssueContext(tempDir);
      expect(context.data.version).toBe('1.0.0');
    });
  });

  describe('recordIssue', () => {
    beforeEach(() => {
      context = new IssueContext(tempDir);
    });

    test('records new issue', () => {
      context.recordIssue('T-042-001', 42, { url: 'https://github.com/test/test/issues/42' });
      
      expect(context.data.issues['T-042-001']).toEqual({
        number: 42,
        url: 'https://github.com/test/test/issues/42',
        status: 'open',
        created_at: expect.any(String),
        closed_at: null,
        commit_sha: null
      });
    });

    test('saves to file', () => {
      context.recordIssue('T-042-001', 42);
      
      const saved = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
      expect(saved.issues['T-042-001'].number).toBe(42);
    });
  });

  describe('getIssueByTaskId', () => {
    beforeEach(() => {
      context = new IssueContext(tempDir);
      context.recordIssue('T-042-001', 42);
    });

    test('returns issue by task ID', () => {
      const issue = context.getIssueByTaskId('T-042-001');
      expect(issue.number).toBe(42);
    });

    test('returns null for unknown task ID', () => {
      const issue = context.getIssueByTaskId('T-999');
      expect(issue).toBeNull();
    });
  });

  describe('getIssueByNumber', () => {
    beforeEach(() => {
      context = new IssueContext(tempDir);
      context.recordIssue('T-042-001', 42);
      context.recordIssue('T-042-002', 43);
    });

    test('returns issue with task ID by number', () => {
      const issue = context.getIssueByNumber(42);
      expect(issue.taskId).toBe('T-042-001');
      expect(issue.number).toBe(42);
    });

    test('returns null for unknown number', () => {
      const issue = context.getIssueByNumber(999);
      expect(issue).toBeNull();
    });
  });

  describe('updateIssueStatus', () => {
    beforeEach(() => {
      context = new IssueContext(tempDir);
      context.recordIssue('T-042-001', 42);
    });

    test('updates status to closed', () => {
      context.updateIssueStatus('T-042-001', 'closed');
      
      const issue = context.getIssueByTaskId('T-042-001');
      expect(issue.status).toBe('closed');
      expect(issue.closed_at).toBeDefined();
    });

    test('reopens issue', () => {
      context.updateIssueStatus('T-042-001', 'closed');
      context.updateIssueStatus('T-042-001', 'open');
      
      const issue = context.getIssueByTaskId('T-042-001');
      expect(issue.status).toBe('open');
      expect(issue.closed_at).toBeNull();
    });

    test('updates commit SHA', () => {
      context.updateIssueStatus('T-042-001', 'closed', { commit_sha: 'abc123' });
      
      const issue = context.getIssueByTaskId('T-042-001');
      expect(issue.commit_sha).toBe('abc123');
    });

    test('returns false for unknown task', () => {
      const result = context.updateIssueStatus('T-999', 'closed');
      expect(result).toBe(false);
    });
  });

  describe('listIssues', () => {
    beforeEach(() => {
      context = new IssueContext(tempDir);
      context.recordIssue('T-042-001', 42);
      context.recordIssue('T-042-002', 43);
      context.updateIssueStatus('T-042-001', 'closed');
    });

    test('lists all issues', () => {
      const issues = context.listIssues();
      expect(issues).toHaveLength(2);
    });

    test('filters by status', () => {
      const openIssues = context.listIssues({ status: 'open' });
      expect(openIssues).toHaveLength(1);
      expect(openIssues[0].taskId).toBe('T-042-002');
    });

    test('sorts by issue number', () => {
      context.recordIssue('T-042-003', 41);
      const issues = context.listIssues();
      expect(issues[0].number).toBe(41);
      expect(issues[1].number).toBe(42);
      expect(issues[2].number).toBe(43);
    });
  });

  describe('findIssuesByTaskPrefix', () => {
    beforeEach(() => {
      context = new IssueContext(tempDir);
      context.recordIssue('T-042-001', 42);
      context.recordIssue('T-042-002', 43);
      context.recordIssue('T-043-001', 44);
    });

    test('finds issues by prefix', () => {
      const issues = context.findIssuesByTaskPrefix('T-042');
      expect(issues).toHaveLength(2);
      expect(issues[0].taskId).toBe('T-042-001');
      expect(issues[1].taskId).toBe('T-042-002');
    });

    test('returns empty array for no matches', () => {
      const issues = context.findIssuesByTaskPrefix('T-999');
      expect(issues).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      context = new IssueContext(tempDir);
      context.setProjectInfo('test-project', 'test-owner');
      context.recordIssue('T-042-001', 42);
      context.recordIssue('T-042-002', 43);
      context.updateIssueStatus('T-042-001', 'closed');
    });

    test('returns correct stats', () => {
      const stats = context.getStats();
      expect(stats.total).toBe(2);
      expect(stats.open).toBe(1);
      expect(stats.closed).toBe(1);
      expect(stats.project).toBe('test-project');
      expect(stats.owner).toBe('test-owner');
    });
  });

  describe('removeIssue', () => {
    beforeEach(() => {
      context = new IssueContext(tempDir);
      context.recordIssue('T-042-001', 42);
    });

    test('removes issue', () => {
      const result = context.removeIssue('T-042-001');
      expect(result).toBe(true);
      expect(context.getIssueByTaskId('T-042-001')).toBeNull();
    });

    test('returns false for unknown issue', () => {
      const result = context.removeIssue('T-999');
      expect(result).toBe(false);
    });
  });

  describe('export/import', () => {
    beforeEach(() => {
      context = new IssueContext(tempDir);
      context.recordIssue('T-042-001', 42);
    });

    test('exports to JSON string', () => {
      const exported = context.export();
      const parsed = JSON.parse(exported);
      expect(parsed.issues['T-042-001'].number).toBe(42);
    });

    test('imports from JSON string', () => {
      const newContext = new IssueContext(tempDir);
      const exported = context.export();
      
      const result = newContext.import(exported);
      expect(result).toBe(true);
      expect(newContext.getIssueByTaskId('T-042-001').number).toBe(42);
    });

    test('import fails for invalid JSON', () => {
      const result = context.import('invalid json');
      expect(result).toBe(false);
    });

    test('import fails for invalid structure', () => {
      const result = context.import('{"foo": "bar"}');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      context = new IssueContext(tempDir);
      context.recordIssue('T-042-001', 42);
      context.recordIssue('T-042-002', 43);
    });

    test('clears all issues', () => {
      context.clear();
      expect(context.data.issues).toEqual({});
    });

    test('preserves version', () => {
      context.clear();
      expect(context.data.version).toBe('1.0.0');
    });
  });
});