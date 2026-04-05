const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  detectIssueAssociation,
  parseDispatchId,
  lookupIssueByTaskId,
  NO_ISSUE_ASSOCIATED
} = require('../../../lib/github-issue-reporter/issue-association');

describe('Issue Association', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'issue-association-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('parseDispatchId', () => {
    test('parses valid dispatch_id format gh-issue-owner-repo-123', () => {
      const result = parseDispatchId('gh-issue-testowner-testrepo-42');
      
      expect(result).toEqual({
        owner: 'testowner',
        repo: 'testrepo',
        issue_number: 42
      });
    });

    test('parses dispatch_id with underscores in owner', () => {
      const result = parseDispatchId('gh-issue-test_owner-testrepo-123');
      
      expect(result).toEqual({
        owner: 'test_owner',
        repo: 'testrepo',
        issue_number: 123
      });
    });

    test('returns null for dispatch_id with hyphens in owner/repo (known limitation)', () => {
      const result = parseDispatchId('gh-issue-my-org-my-repo-123');
      expect(result).toBeNull();
    });

    test('returns null for dispatch_id with real-world GitHub names containing hyphens', () => {
      const result1 = parseDispatchId('gh-issue-Burburton-amazing-specialist-42');
      expect(result1).toBeNull();
      
      const result2 = parseDispatchId('gh-issue-test-org-test-repo-123');
      expect(result2).toBeNull();
    });

    test('returns null for invalid format - missing prefix', () => {
      const result = parseDispatchId('owner-repo-123');
      expect(result).toBeNull();
    });

    test('returns null for invalid format - wrong prefix', () => {
      const result = parseDispatchId('gh-pr-owner-repo-123');
      expect(result).toBeNull();
    });

    test('returns null for invalid format - missing issue number', () => {
      const result = parseDispatchId('gh-issue-owner-repo');
      expect(result).toBeNull();
    });

    test('returns null for null dispatch_id', () => {
      const result = parseDispatchId(null);
      expect(result).toBeNull();
    });

    test('returns null for undefined dispatch_id', () => {
      const result = parseDispatchId(undefined);
      expect(result).toBeNull();
    });

    test('returns null for empty string', () => {
      const result = parseDispatchId('');
      expect(result).toBeNull();
    });
  });

  describe('lookupIssueByTaskId', () => {
    beforeEach(() => {
      const issueContext = {
        version: '1.0.0',
        project: 'test-project',
        owner: 'test-owner',
        issues: {
          'T-044-001': {
            number: 42,
            url: 'https://github.com/test-owner/test-project/issues/42',
            status: 'open',
            created_at: '2026-04-05T12:00:00Z'
          },
          'T-044-002': {
            number: 43,
            url: 'https://github.com/test-owner/test-project/issues/43',
            status: 'open',
            created_at: '2026-04-05T12:00:00Z'
          }
        },
        lastUpdated: '2026-04-05T12:00:00Z'
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
    });

    test('finds issue by task ID', () => {
      const result = lookupIssueByTaskId('T-044-001', 'test-owner', 'test-project');
      
      expect(result).toEqual({
        owner: 'test-owner',
        repo: 'test-project',
        issue_number: 42
      });
    });

    test('finds issue using context owner when owner param missing', () => {
      const result = lookupIssueByTaskId('T-044-001', null, 'test-project');
      
      expect(result).toEqual({
        owner: 'test-owner',
        repo: 'test-project',
        issue_number: 42
      });
    });

    test('finds issue using context project when repo param missing', () => {
      const result = lookupIssueByTaskId('T-044-001', 'test-owner', null);
      
      expect(result).toEqual({
        owner: 'test-owner',
        repo: 'test-project',
        issue_number: 42
      });
    });

    test('returns null for unknown task ID', () => {
      const result = lookupIssueByTaskId('T-999', 'test-owner', 'test-project');
      expect(result).toBeNull();
    });

    test('returns null when .issue-context.json does not exist', () => {
      fs.unlinkSync('.issue-context.json');
      const result = lookupIssueByTaskId('T-044-001', 'test-owner', 'test-project');
      expect(result).toBeNull();
    });

    test('returns null when .issue-context.json is corrupted', () => {
      fs.writeFileSync('.issue-context.json', 'invalid json {{{');
      const result = lookupIssueByTaskId('T-044-001', 'test-owner', 'test-project');
      expect(result).toBeNull();
    });

    test('returns null when .issue-context.json has invalid structure', () => {
      fs.writeFileSync('.issue-context.json', JSON.stringify({ foo: 'bar' }));
      const result = lookupIssueByTaskId('T-044-001', 'test-owner', 'test-project');
      expect(result).toBeNull();
    });

    test('returns null when issues field is missing', () => {
      fs.writeFileSync('.issue-context.json', JSON.stringify({
        version: '1.0.0',
        project: 'test-project',
        owner: 'test-owner'
      }));
      const result = lookupIssueByTaskId('T-044-001', 'test-owner', 'test-project');
      expect(result).toBeNull();
    });
  });

  describe('detectIssueAssociation', () => {
    describe('CLI --issue parameter override (highest priority)', () => {
      test('CLI params override dispatch_id', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-other-owner-other-repo-99'
          }
        };
        const cliParams = {
          issue: 42,
          owner: 'test-owner',
          repo: 'test-repo'
        };
        
        const result = detectIssueAssociation(errorReport, cliParams);
        
        expect(result.success).toBe(true);
        expect(result.source).toBe('cli_param');
        expect(result.issue_number).toBe(42);
        expect(result.owner).toBe('test-owner');
        expect(result.repo).toBe('test-repo');
      });

      test('CLI params override issue_context', () => {
        const issueContext = {
          version: '1.0.0',
          project: 'context-project',
          owner: 'context-owner',
          issues: {
            'T-001': { number: 99 }
          }
        };
        fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
        
        const errorReport = {
          error_context: {
            task_id: 'T-001'
          }
        };
        const cliParams = {
          issue: 42,
          owner: 'cli-owner',
          repo: 'cli-repo'
        };
        
        const result = detectIssueAssociation(errorReport, cliParams);
        
        expect(result.success).toBe(true);
        expect(result.source).toBe('cli_param');
        expect(result.issue_number).toBe(42);
        expect(result.owner).toBe('cli-owner');
        expect(result.repo).toBe('cli-repo');
      });

      test('CLI params override dispatch_id and issue_context together', () => {
        const issueContext = {
          version: '1.0.0',
          issues: {
            'T-001': { number: 50 }
          }
        };
        fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
        
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-dispatch-owner-dispatch-repo-60',
            task_id: 'T-001'
          }
        };
        const cliParams = {
          issue: 42,
          owner: 'cli-owner',
          repo: 'cli-repo'
        };
        
        const result = detectIssueAssociation(errorReport, cliParams);
        
        expect(result.success).toBe(true);
        expect(result.source).toBe('cli_param');
        expect(result.issue_number).toBe(42);
      });

      test('CLI params require all three parameters (issue, owner, repo)', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-dispatchowner-dispatchrepo-60'
          }
        };
        
        const result1 = detectIssueAssociation(errorReport, { issue: 42, owner: 'test' });
        expect(result1.source).toBe('dispatch_id');
        
        const result2 = detectIssueAssociation(errorReport, { issue: 42, repo: 'test' });
        expect(result2.source).toBe('dispatch_id');
        
        const result3 = detectIssueAssociation(errorReport, { owner: 'test', repo: 'test' });
        expect(result3.source).toBe('dispatch_id');
      });
    });

    describe('dispatch_id parsing (second priority)', () => {
      test('uses dispatch_id when CLI params not provided', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-testowner-testrepo-42'
          }
        };
        
        const result = detectIssueAssociation(errorReport);
        
        expect(result.success).toBe(true);
        expect(result.source).toBe('dispatch_id');
        expect(result.issue_number).toBe(42);
        expect(result.owner).toBe('testowner');
        expect(result.repo).toBe('testrepo');
      });

      test('uses dispatch_id when issue_context lookup fails', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-dispatchowner-dispatchrepo-60',
            task_id: 'T-999'
          }
        };
        
        const result = detectIssueAssociation(errorReport);
        
        expect(result.success).toBe(true);
        expect(result.source).toBe('dispatch_id');
        expect(result.issue_number).toBe(60);
      });

      test('dispatch_id ignored when CLI params present', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-dispatchowner-dispatchrepo-60'
          }
        };
        const cliParams = {
          issue: 42,
          owner: 'cliowner',
          repo: 'clirepo'
        };
        
        const result = detectIssueAssociation(errorReport, cliParams);
        
        expect(result.source).toBe('cli_param');
        expect(result.issue_number).toBe(42);
      });
    });

    describe('.issue-context.json lookup (third priority)', () => {
      beforeEach(() => {
        const issueContext = {
          version: '1.0.0',
          project: 'test-project',
          owner: 'test-owner',
          issues: {
            'T-044-001': {
              number: 42,
              url: 'https://github.com/test-owner/test-project/issues/42',
              status: 'open'
            },
            'T-044-002': {
              number: 43,
              url: 'https://github.com/test-owner/test-project/issues/43',
              status: 'open'
            }
          },
          lastUpdated: '2026-04-05T12:00:00Z'
        };
        fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      });

      test('uses issue_context when CLI params and dispatch_id not available', () => {
        const errorReport = {
          error_context: {
            task_id: 'T-044-001'
          }
        };
        
        const result = detectIssueAssociation(errorReport, { owner: 'test-owner', repo: 'test-project' });
        
        expect(result.success).toBe(true);
        expect(result.source).toBe('issue_context');
        expect(result.issue_number).toBe(42);
        expect(result.owner).toBe('test-owner');
        expect(result.repo).toBe('test-project');
      });

      test('uses issue_context when dispatch_id invalid', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'invalid-format',
            task_id: 'T-044-002'
          }
        };
        
        const result = detectIssueAssociation(errorReport, { owner: 'test-owner', repo: 'test-project' });
        
        expect(result.success).toBe(true);
        expect(result.source).toBe('issue_context');
        expect(result.issue_number).toBe(43);
      });

      test('issue_context used when dispatch_id has hyphens (known limitation)', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-dispatch-owner-dispatch-repo-60',
            task_id: 'T-044-001'
          }
        };
        
        const result = detectIssueAssociation(errorReport, { owner: 'test-owner', repo: 'test-project' });
        
        expect(result.source).toBe('issue_context');
        expect(result.issue_number).toBe(42);
      });

      test('issue_context ignored when CLI params present', () => {
        const errorReport = {
          error_context: {
            task_id: 'T-044-001'
          }
        };
        const cliParams = {
          issue: 99,
          owner: 'cliowner',
          repo: 'clirepo'
        };
        
        const result = detectIssueAssociation(errorReport, cliParams);
        
        expect(result.source).toBe('cli_param');
        expect(result.issue_number).toBe(99);
      });
    });

    describe('resolution priority: CLI > dispatch_id > issue_context', () => {
      beforeEach(() => {
        const issueContext = {
          version: '1.0.0',
          project: 'context-project',
          owner: 'context-owner',
          issues: {
            'T-001': { number: 50 }
          }
        };
        fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      });

      test('CLI (priority 1) > dispatch_id (priority 2)', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-dispatchowner-dispatchrepo-60',
            task_id: 'T-001'
          }
        };
        const cliParams = {
          issue: 42,
          owner: 'cliowner',
          repo: 'clirepo'
        };
        
        const result = detectIssueAssociation(errorReport, cliParams);
        expect(result.source).toBe('cli_param');
        expect(result.issue_number).toBe(42);
      });

      test('dispatch_id (priority 2) > issue_context (priority 3)', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-dispatchowner-dispatchrepo-60',
            task_id: 'T-001'
          }
        };
        
        const result = detectIssueAssociation(errorReport);
        expect(result.source).toBe('dispatch_id');
        expect(result.issue_number).toBe(60);
      });

      test('issue_context used when priority 1 and 2 unavailable', () => {
        const errorReport = {
          error_context: {
            task_id: 'T-001'
          }
        };
        
        const result = detectIssueAssociation(errorReport, { owner: 'context-owner', repo: 'context-project' });
        expect(result.source).toBe('issue_context');
        expect(result.issue_number).toBe(50);
      });
    });

    describe('NO_ISSUE_ASSOCIATED error when all sources fail', () => {
      test('returns error when no CLI params, invalid dispatch_id, task_id not found', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'invalid-format',
            task_id: 'T-999'
          }
        };
        
        const result = detectIssueAssociation(errorReport);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe(NO_ISSUE_ASSOCIATED);
        expect(result.source).toBeNull();
        expect(result.issue_number).toBeUndefined();
      });

      test('returns error when no CLI params, no dispatch_id, task_id missing', () => {
        const errorReport = {
          error_context: {}
        };
        
        const result = detectIssueAssociation(errorReport);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe(NO_ISSUE_ASSOCIATED);
      });

      test('returns error when no CLI params, no dispatch_id, .issue-context.json missing', () => {
        const errorReport = {
          error_context: {
            task_id: 'T-001'
          }
        };
        
        const result = detectIssueAssociation(errorReport);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe(NO_ISSUE_ASSOCIATED);
      });

      test('returns error when error_context is missing', () => {
        const errorReport = {};
        
        const result = detectIssueAssociation(errorReport);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe(NO_ISSUE_ASSOCIATED);
      });

      test('returns error when dispatch_id null and task_id null', () => {
        const errorReport = {
          error_context: {
            dispatch_id: null,
            task_id: null
          }
        };
        
        const result = detectIssueAssociation(errorReport);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe(NO_ISSUE_ASSOCIATED);
      });
    });

    describe('edge cases', () => {
      test('handles errorReport with null error_context', () => {
        const errorReport = {
          error_context: null
        };
        
        const result = detectIssueAssociation(errorReport);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe(NO_ISSUE_ASSOCIATED);
      });

      test('handles CLI params with issue number as string', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-oldowner-oldrepo-99'
          }
        };
        const cliParams = {
          issue: '42',
          owner: 'testowner',
          repo: 'testrepo'
        };
        
        const result = detectIssueAssociation(errorReport, cliParams);
        
        expect(result.success).toBe(true);
        expect(result.issue_number).toBe(42);
        expect(typeof result.issue_number).toBe('number');
      });

      test('handles large issue numbers', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-owner-repo-999999'
          }
        };
        
        const result = detectIssueAssociation(errorReport);
        
        expect(result.success).toBe(true);
        expect(result.issue_number).toBe(999999);
      });

      test('handles underscore in owner name', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-org_name-testrepo-123'
          }
        };
        
        const result = detectIssueAssociation(errorReport);
        
        expect(result.success).toBe(true);
        expect(result.owner).toBe('org_name');
        expect(result.repo).toBe('testrepo');
      });

      test('returns null for hyphen in repo name (known limitation)', () => {
        const errorReport = {
          error_context: {
            dispatch_id: 'gh-issue-orgname-repo-name-123'
          }
        };
        
        const result = detectIssueAssociation(errorReport);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe(NO_ISSUE_ASSOCIATED);
      });
    });
  });

  describe('NO_ISSUE_ASSOCIATED constant', () => {
    test('constant value is defined', () => {
      expect(NO_ISSUE_ASSOCIATED).toBe('NO_ISSUE_ASSOCIATED');
    });

    test('constant is exported', () => {
      const module = require('../../../lib/github-issue-reporter/issue-association');
      expect(module.NO_ISSUE_ASSOCIATED).toBeDefined();
    });
  });
});