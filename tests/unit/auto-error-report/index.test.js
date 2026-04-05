const {
  autoReportError,
  tryAutoReport,
  setGitHubIssueReporter,
  getGitHubIssueReporter
} = require('../../../lib/auto-error-report/index');
const { clearAllCounts } = require('../../../lib/auto-error-report/rate-limiter');
const { clearAllHashes } = require('../../../lib/auto-error-report/dedup-manager');
const { resetSchemaCache } = require('../../../lib/auto-error-report/config-loader');
const fs = require('fs');

jest.mock('fs');
jest.mock('../../../lib/github-issue-reporter', () => ({
  reportToIssue: jest.fn()
}));

const githubIssueReporter = require('../../../lib/github-issue-reporter');

describe('auto-error-report/index', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    clearAllCounts();
    clearAllHashes();
    resetSchemaCache();
    process.env = { ...originalEnv, GITHUB_TOKEN: 'test-token' };
    setGitHubIssueReporter(githubIssueReporter);
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });

  const createValidConfig = (overrides = {}) => ({
    enabled: true,
    github_token_env: 'GITHUB_TOKEN',
    target_repository: { owner: 'TestOwner', repo: 'test-repo' },
    report_conditions: {
      severity_threshold: 'medium',
      only_expert_pack_errors: true,
      exclude_types: []
    },
    rate_limit: {
      max_per_hour: 5,
      max_per_day: 20,
      dedup_window_minutes: 60
    },
    privacy: {
      include_stack_trace: true,
      redact_secrets: true
    },
    ...overrides
  });

  const createErrorReport = (overrides = {}) => ({
    artifact_id: 'err-001',
    artifact_type: 'error-report',
    error_context: {
      dispatch_id: 'dispatch-123',
      role: 'developer'
    },
    error_classification: {
      severity: 'high',
      error_type: 'EXECUTION_ERROR'
    },
    error_details: {
      error_code: 'ERR-001',
      title: 'Test Error'
    },
    ...overrides
  });

  describe('autoReportError', () => {
    test('returns disabled when config is disabled', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify({});
        }
        return JSON.stringify(createValidConfig({ enabled: false }));
      });
      
      const result = await autoReportError(createErrorReport());
      
      expect(result.success).toBe(false);
      expect(result.triggered).toBe(false);
      expect(result.reason).toBe('disabled');
    });

    test('returns severity_below_threshold when severity too low', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify({});
        }
        return JSON.stringify(createValidConfig());
      });
      
      const result = await autoReportError(createErrorReport({
        error_classification: { severity: 'low' }
      }));
      
      expect(result.success).toBe(false);
      expect(result.triggered).toBe(false);
      expect(result.reason).toBe('severity_below_threshold');
    });

    test('returns type_excluded when error type in exclude list', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify({});
        }
        return JSON.stringify(createValidConfig({
          report_conditions: {
            severity_threshold: 'medium',
            exclude_types: ['EXECUTION_ERROR']
          }
        }));
      });
      
      const result = await autoReportError(createErrorReport());
      
      expect(result.success).toBe(false);
      expect(result.triggered).toBe(false);
      expect(result.reason).toBe('type_excluded');
    });

    test('returns github_token_missing when token not set', async () => {
      delete process.env.GITHUB_TOKEN;
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify({});
        }
        return JSON.stringify(createValidConfig());
      });
      
      const result = await autoReportError(createErrorReport());
      
      expect(result.success).toBe(false);
      expect(result.triggered).toBe(true);
      expect(result.reason).toBe('github_token_missing');
    });

    test('calls github-issue-reporter and returns success', async () => {
      githubIssueReporter.reportToIssue.mockResolvedValue({
        success: true,
        comment_url: 'https://github.com/owner/repo/issues/1#issuecomment-123'
      });
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify({});
        }
        return JSON.stringify(createValidConfig());
      });
      
      const result = await autoReportError(createErrorReport());
      
      expect(result.success).toBe(true);
      expect(result.triggered).toBe(true);
      expect(result.issue_url).toBe('https://github.com/owner/repo/issues/1#issuecomment-123');
      expect(githubIssueReporter.reportToIssue).toHaveBeenCalled();
    });

    test('handles NO_ISSUE_ASSOCIATED error', async () => {
      githubIssueReporter.reportToIssue.mockResolvedValue({
        success: false,
        error: { code: 'NO_ISSUE_ASSOCIATED' }
      });
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify({});
        }
        return JSON.stringify(createValidConfig());
      });
      
      const result = await autoReportError(createErrorReport());
      
      expect(result.success).toBe(false);
      expect(result.triggered).toBe(true);
      expect(result.reason).toBe('no_issue_associated');
    });

    test('handles publish failure', async () => {
      githubIssueReporter.reportToIssue.mockResolvedValue({
        success: false,
        error: { message: 'API rate limit exceeded' }
      });
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify({});
        }
        return JSON.stringify(createValidConfig());
      });
      
      const result = await autoReportError(createErrorReport());
      
      expect(result.success).toBe(false);
      expect(result.triggered).toBe(true);
      expect(result.reason).toBe('publish_failed');
    });

    test('handles exception from reporter', async () => {
      githubIssueReporter.reportToIssue.mockRejectedValue(new Error('Network error'));
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify({});
        }
        return JSON.stringify(createValidConfig());
      });
      
      const result = await autoReportError(createErrorReport());
      
      expect(result.success).toBe(false);
      expect(result.triggered).toBe(true);
      expect(result.reason).toBe('publish_failed');
      expect(result.error).toBe('Network error');
    });

    test('respects rate limit', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify({});
        }
        return JSON.stringify(createValidConfig({
          rate_limit: { max_per_hour: 1, max_per_day: 20, dedup_window_minutes: 60 }
        }));
      });
      
      githubIssueReporter.reportToIssue.mockResolvedValue({
        success: true,
        comment_url: 'https://github.com/owner/repo/issues/1#issuecomment-123'
      });
      
      const result1 = await autoReportError(createErrorReport());
      expect(result1.success).toBe(true);
      
      const result2 = await autoReportError(createErrorReport({
        error_context: { dispatch_id: 'dispatch-456', role: 'developer' }
      }));
      
      expect(result2.success).toBe(false);
      expect(result2.reason).toBe('hour_limit');
    });

    test('respects dedup window', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify({});
        }
        return JSON.stringify(createValidConfig());
      });
      
      githubIssueReporter.reportToIssue.mockResolvedValue({
        success: true,
        comment_url: 'https://github.com/owner/repo/issues/1#issuecomment-123'
      });
      
      const errorReport = createErrorReport();
      
      const result1 = await autoReportError(errorReport);
      expect(result1.success).toBe(true);
      
      const result2 = await autoReportError(errorReport);
      
      expect(result2.success).toBe(false);
      expect(result2.reason).toBe('dedup_window');
    });
  });

  describe('tryAutoReport', () => {
    test('catches unexpected errors', async () => {
      fs.existsSync.mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      
      const result = await tryAutoReport(createErrorReport());
      
      expect(result.success).toBe(false);
      expect(result.triggered).toBe(true);
      expect(result.reason).toBe('unexpected_error');
    });
  });

  describe('setGitHubIssueReporter', () => {
    test('allows setting custom reporter', () => {
      const mockReporter = {
        reportToIssue: jest.fn().mockResolvedValue({ success: true })
      };
      
      setGitHubIssueReporter(mockReporter);
      
      expect(getGitHubIssueReporter()).toBe(mockReporter);
    });
  });
});