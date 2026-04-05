const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  publishErrorReport,
  checkIdempotency,
  updateIssueContextPublished,
  ERR_CODES
} = require('../../../lib/github-issue-reporter/publisher');

const mockPostComment = jest.fn();
const mockUpdateComment = jest.fn();

jest.mock('../../../adapters/github-issue/github-client', () => {
  return jest.fn().mockImplementation(() => ({
    postComment: mockPostComment,
    updateComment: mockUpdateComment
  }));
});

jest.mock('../../../lib/github-issue-reporter/error-comment-formatter');
jest.mock('../../../lib/github-issue-reporter/issue-association');

const GitHubClient = require('../../../adapters/github-issue/github-client');
const { formatErrorComment } = require('../../../lib/github-issue-reporter/error-comment-formatter');
const { NO_ISSUE_ASSOCIATED } = require('../../../lib/github-issue-reporter/issue-association');

describe('Publisher', () => {
  let tempDir;
  let originalCwd;

  const createMockErrorReport = () => ({
    artifact_id: 'ERR-20260405123000-abc123',
    artifact_type: 'error-report',
    error_context: {
      role: 'developer'
    },
    error_classification: {
      error_type: 'EXECUTION_ERROR',
      severity: 'medium'
    },
    error_details: {
      error_code: 'ERR-DEV-001',
      title: 'Test error',
      description: 'Test description'
    }
  });

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'publisher-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
    
    jest.clearAllMocks();
    
    formatErrorComment.mockReturnValue('## 🚨 Error Report\n\nTest comment body');
    
    mockPostComment.mockResolvedValue({
      id: 12345,
      html_url: 'https://github.com/testowner/testrepo/issues/42#issuecomment-12345'
    });
    
    mockUpdateComment.mockResolvedValue({
      id: 12345,
      html_url: 'https://github.com/testowner/testrepo/issues/42#issuecomment-12345'
    });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  describe('ERR_CODES constant', () => {
    test('NO_ISSUE_ASSOCIATED code is ERR-GIR-001', () => {
      expect(ERR_CODES.NO_ISSUE_ASSOCIATED).toBe('ERR-GIR-001');
    });

    test('ISSUE_NOT_FOUND code is ERR-GIR-002', () => {
      expect(ERR_CODES.ISSUE_NOT_FOUND).toBe('ERR-GIR-002');
    });

    test('PERMISSION_DENIED code is ERR-GIR-003', () => {
      expect(ERR_CODES.PERMISSION_DENIED).toBe('ERR-GIR-003');
    });

    test('API_RATE_LIMIT code is ERR-GIR-004', () => {
      expect(ERR_CODES.API_RATE_LIMIT).toBe('ERR-GIR-004');
    });

    test('COMMENT_POST_FAILED code is ERR-GIR-005', () => {
      expect(ERR_CODES.COMMENT_POST_FAILED).toBe('ERR-GIR-005');
    });

    test('all 5 error codes are defined', () => {
      expect(Object.keys(ERR_CODES)).toHaveLength(5);
      expect(ERR_CODES).toHaveProperty('NO_ISSUE_ASSOCIATED');
      expect(ERR_CODES).toHaveProperty('ISSUE_NOT_FOUND');
      expect(ERR_CODES).toHaveProperty('PERMISSION_DENIED');
      expect(ERR_CODES).toHaveProperty('API_RATE_LIMIT');
      expect(ERR_CODES).toHaveProperty('COMMENT_POST_FAILED');
    });
  });

  describe('checkIdempotency', () => {
    test('returns null when .issue-context.json does not exist', () => {
      const result = checkIdempotency('ERR-001', 42, 'testowner', 'testrepo');
      expect(result).toBeNull();
    });

    test('returns null when published_errors field does not exist', () => {
      const issueContext = {
        version: '1.0.0',
        issues: {}
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      
      const result = checkIdempotency('ERR-001', 42, 'testowner', 'testrepo');
      expect(result).toBeNull();
    });

    test('returns null when error_report_id not in published_errors', () => {
      const issueContext = {
        version: '1.0.0',
        published_errors: {
          'ERR-OTHER': {
            comment_id: 999,
            issue_number: 50,
            owner: 'otherowner',
            repo: 'otherrepo',
            status: 'published'
          }
        }
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      
      const result = checkIdempotency('ERR-001', 42, 'testowner', 'testrepo');
      expect(result).toBeNull();
    });

    test('returns comment_id when same error_report_id published to same Issue', () => {
      const issueContext = {
        version: '1.0.0',
        published_errors: {
          'ERR-001': {
            comment_id: 12345,
            issue_number: 42,
            owner: 'testowner',
            repo: 'testrepo',
            status: 'published'
          }
        }
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      
      const result = checkIdempotency('ERR-001', 42, 'testowner', 'testrepo');
      expect(result).toBe(12345);
    });

    test('returns null when error_report_id published to different Issue', () => {
      const issueContext = {
        version: '1.0.0',
        published_errors: {
          'ERR-001': {
            comment_id: 12345,
            issue_number: 99,
            owner: 'testowner',
            repo: 'testrepo',
            status: 'published'
          }
        }
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      
      const result = checkIdempotency('ERR-001', 42, 'testowner', 'testrepo');
      expect(result).toBeNull();
    });

    test('returns null when error_report_id published to different owner', () => {
      const issueContext = {
        version: '1.0.0',
        published_errors: {
          'ERR-001': {
            comment_id: 12345,
            issue_number: 42,
            owner: 'otherowner',
            repo: 'testrepo',
            status: 'published'
          }
        }
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      
      const result = checkIdempotency('ERR-001', 42, 'testowner', 'testrepo');
      expect(result).toBeNull();
    });

    test('returns null when error_report_id published to different repo', () => {
      const issueContext = {
        version: '1.0.0',
        published_errors: {
          'ERR-001': {
            comment_id: 12345,
            issue_number: 42,
            owner: 'testowner',
            repo: 'otherrepo',
            status: 'published'
          }
        }
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      
      const result = checkIdempotency('ERR-001', 42, 'testowner', 'testrepo');
      expect(result).toBeNull();
    });

    test('returns null when status is not published', () => {
      const issueContext = {
        version: '1.0.0',
        published_errors: {
          'ERR-001': {
            comment_id: 12345,
            issue_number: 42,
            owner: 'testowner',
            repo: 'testrepo',
            status: 'failed'
          }
        }
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      
      const result = checkIdempotency('ERR-001', 42, 'testowner', 'testrepo');
      expect(result).toBeNull();
    });

    test('returns null when .issue-context.json is corrupted', () => {
      fs.writeFileSync('.issue-context.json', 'invalid json {{{');
      
      const result = checkIdempotency('ERR-001', 42, 'testowner', 'testrepo');
      expect(result).toBeNull();
    });

    test('searches multiple paths for .issue-context.json', () => {
      const specsDir = path.join(tempDir, 'specs');
      fs.mkdirSync(specsDir);
      
      const issueContext = {
        version: '1.0.0',
        published_errors: {
          'ERR-001': {
            comment_id: 12345,
            issue_number: 42,
            owner: 'testowner',
            repo: 'testrepo',
            status: 'published'
          }
        }
      };
      fs.writeFileSync(path.join(specsDir, '.issue-context.json'), JSON.stringify(issueContext));
      
      const result = checkIdempotency('ERR-001', 42, 'testowner', 'testrepo');
      expect(result).toBe(12345);
    });
  });

  describe('updateIssueContextPublished', () => {
    test('creates .issue-context.json if not exists', () => {
      updateIssueContextPublished('ERR-001', 12345, 42, 'testowner', 'testrepo', 'medium', 'published');
      
      expect(fs.existsSync('.issue-context.json')).toBe(true);
      const context = JSON.parse(fs.readFileSync('.issue-context.json', 'utf8'));
      expect(context.published_errors).toBeDefined();
      expect(context.published_errors['ERR-001']).toBeDefined();
    });

    test('adds published_errors entry with correct fields', () => {
      updateIssueContextPublished('ERR-001', 12345, 42, 'testowner', 'testrepo', 'high', 'published');
      
      const context = JSON.parse(fs.readFileSync('.issue-context.json', 'utf8'));
      const entry = context.published_errors['ERR-001'];
      
      expect(entry.comment_id).toBe(12345);
      expect(entry.issue_number).toBe(42);
      expect(entry.owner).toBe('testowner');
      expect(entry.repo).toBe('testrepo');
      expect(entry.severity).toBe('high');
      expect(entry.status).toBe('published');
      expect(entry.published_at).toBeDefined();
    });

    test('updates existing .issue-context.json', () => {
      const existingContext = {
        version: '1.0.0',
        issues: {
          'T-001': { number: 50 }
        }
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(existingContext));
      
      updateIssueContextPublished('ERR-001', 12345, 42, 'testowner', 'testrepo', 'medium', 'published');
      
      const context = JSON.parse(fs.readFileSync('.issue-context.json', 'utf8'));
      expect(context.version).toBe('1.0.0');
      expect(context.issues).toBeDefined();
      expect(context.published_errors).toBeDefined();
    });

    test('updates existing error_report_id entry', () => {
      const existingContext = {
        version: '1.0.0',
        published_errors: {
          'ERR-001': {
            comment_id: 999,
            issue_number: 50,
            status: 'failed'
          }
        }
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(existingContext));
      
      updateIssueContextPublished('ERR-001', 12345, 42, 'testowner', 'testrepo', 'medium', 'published');
      
      const context = JSON.parse(fs.readFileSync('.issue-context.json', 'utf8'));
      const entry = context.published_errors['ERR-001'];
      
      expect(entry.comment_id).toBe(12345);
      expect(entry.issue_number).toBe(42);
      expect(entry.status).toBe('published');
    });

    test('records failure status correctly', () => {
      updateIssueContextPublished('ERR-001', null, 42, 'testowner', 'testrepo', 'critical', 'failed');
      
      const context = JSON.parse(fs.readFileSync('.issue-context.json', 'utf8'));
      const entry = context.published_errors['ERR-001'];
      
      expect(entry.comment_id).toBeNull();
      expect(entry.status).toBe('failed');
    });

    test('updates lastUpdated timestamp', () => {
      updateIssueContextPublished('ERR-001', 12345, 42, 'testowner', 'testrepo', 'medium', 'published');
      
      const context = JSON.parse(fs.readFileSync('.issue-context.json', 'utf8'));
      expect(context.lastUpdated).toBeDefined();
    });

    test('uses default severity when not provided', () => {
      updateIssueContextPublished('ERR-001', 12345, 42, 'testowner', 'testrepo', null, 'published');
      
      const context = JSON.parse(fs.readFileSync('.issue-context.json', 'utf8'));
      const entry = context.published_errors['ERR-001'];
      
      expect(entry.severity).toBe('medium');
    });

    test('handles corrupted .issue-context.json gracefully', () => {
      fs.writeFileSync('.issue-context.json', 'invalid json {{{');
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      updateIssueContextPublished('ERR-001', 12345, 42, 'testowner', 'testrepo', 'medium', 'published');
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('publishErrorReport - Idempotency', () => {
    test('skips posting new comment when error_report_id already published', async () => {
      const issueContext = {
        version: '1.0.0',
        published_errors: {
          'ERR-20260405123000-abc123': {
            comment_id: 12345,
            issue_number: 42,
            owner: 'testowner',
            repo: 'testrepo',
            status: 'published'
          }
        }
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(mockPostComment).not.toHaveBeenCalled();
      expect(mockUpdateComment).toHaveBeenCalled();
    });

    test('posts new comment when error_report_id not previously published', async () => {
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(mockPostComment).toHaveBeenCalled();
      expect(mockUpdateComment).not.toHaveBeenCalled();
    });

    test('uses updateComment when existing comment found', async () => {
      const issueContext = {
        version: '1.0.0',
        published_errors: {
          'ERR-20260405123000-abc123': {
            comment_id: 12345,
            issue_number: 42,
            owner: 'testowner',
            repo: 'testrepo',
            status: 'published'
          }
        }
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(mockUpdateComment).toHaveBeenCalledWith('testowner', 'testrepo', 12345, '## 🚨 Error Report\n\nTest comment body');
    });
  });

  describe('publishErrorReport - Error Handling', () => {
    test('handles NO_ISSUE_ASSOCIATED error', async () => {
      const error = new Error(NO_ISSUE_ASSOCIATED);
      mockPostComment.mockRejectedValueOnce(error);
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERR_CODES.NO_ISSUE_ASSOCIATED);
      expect(result.error.message).toContain('No Issue associated');
      expect(result.error.retry_available).toBe(false);
    });

    test('handles ISSUE_NOT_FOUND error (404)', async () => {
      const error = { status: 404, message: 'Not Found' };
      mockPostComment.mockRejectedValueOnce(error);
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERR_CODES.ISSUE_NOT_FOUND);
      expect(result.error.message).toContain('Issue not found');
      expect(result.error.retry_available).toBe(false);
    });

    test('handles PERMISSION_DENIED error (403)', async () => {
      const error = { status: 403, message: 'Forbidden' };
      mockPostComment.mockRejectedValueOnce(error);
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERR_CODES.PERMISSION_DENIED);
      expect(result.error.message).toContain('Permission denied');
      expect(result.error.retry_available).toBe(false);
    });

    test('handles API_RATE_LIMIT error (403 with rate limit message)', async () => {
      const error = { status: 403, message: 'rate limit exceeded' };
      mockPostComment.mockRejectedValueOnce(error);
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERR_CODES.API_RATE_LIMIT);
      expect(result.error.message).toContain('rate limit');
      expect(result.error.retry_available).toBe(true);
    });

    test('handles COMMENT_POST_FAILED error (generic)', async () => {
      const error = { message: 'Network timeout' };
      mockPostComment.mockRejectedValueOnce(error);
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERR_CODES.COMMENT_POST_FAILED);
      expect(result.error.message).toContain('Network timeout');
      expect(result.error.retry_available).toBe(true);
    });

    test('handles error without message', async () => {
      const error = {};
      mockPostComment.mockRejectedValueOnce(error);
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERR_CODES.COMMENT_POST_FAILED);
      expect(result.error.message).toContain('Comment posting failed');
    });
  });

  describe('publishErrorReport - Success Cases', () => {
    test('returns success result with comment_url and comment_id', async () => {
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(true);
      expect(result.comment_url).toBe('https://github.com/testowner/testrepo/issues/42#issuecomment-12345');
      expect(result.comment_id).toBe(12345);
      expect(result.error).toBeNull();
    });

    test('calls formatErrorComment with error report', async () => {
      const errorReport = createMockErrorReport();
      await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(formatErrorComment).toHaveBeenCalledWith(errorReport);
    });

    test('creates GitHubClient with provided config', async () => {
      const githubConfig = { token: 'test-token' };
      const errorReport = createMockErrorReport();
      await publishErrorReport(errorReport, 'testowner', 'testrepo', 42, { githubConfig });
      
      expect(GitHubClient).toHaveBeenCalledWith(githubConfig);
    });

    test('calls postComment with correct parameters', async () => {
      const errorReport = createMockErrorReport();
      await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(mockPostComment).toHaveBeenCalledWith('testowner', 'testrepo', 42, '## 🚨 Error Report\n\nTest comment body');
    });

    test('updates .issue-context.json with published status on success', async () => {
      const errorReport = createMockErrorReport();
      await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(fs.existsSync('.issue-context.json')).toBe(true);
      const context = JSON.parse(fs.readFileSync('.issue-context.json', 'utf8'));
      
      expect(context.published_errors['ERR-20260405123000-abc123']).toBeDefined();
      expect(context.published_errors['ERR-20260405123000-abc123'].status).toBe('published');
      expect(context.published_errors['ERR-20260405123000-abc123'].comment_id).toBe(12345);
    });

    test('updates .issue-context.json with failed status on error', async () => {
      const error = { status: 404, message: 'Not Found' };
      mockPostComment.mockRejectedValueOnce(error);
      
      const errorReport = createMockErrorReport();
      await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      const context = JSON.parse(fs.readFileSync('.issue-context.json', 'utf8'));
      
      expect(context.published_errors['ERR-20260405123000-abc123']).toBeDefined();
      expect(context.published_errors['ERR-20260405123000-abc123'].status).toBe('failed');
      expect(context.published_errors['ERR-20260405123000-abc123'].comment_id).toBeNull();
    });

    test('uses existing comment_id when updating', async () => {
      const issueContext = {
        version: '1.0.0',
        published_errors: {
          'ERR-20260405123000-abc123': {
            comment_id: 99999,
            issue_number: 42,
            owner: 'testowner',
            repo: 'testrepo',
            status: 'published'
          }
        }
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.comment_id).toBe(99999);
    });
  });

  describe('publishErrorReport - Integration', () => {
    test('complete workflow: no existing comment, success', async () => {
      const errorReport = createMockErrorReport();
      errorReport.error_classification.severity = 'high';
      
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(true);
      expect(result.comment_url).toBeDefined();
      expect(result.comment_id).toBeDefined();
      
      expect(mockPostComment).toHaveBeenCalledTimes(1);
      expect(mockUpdateComment).not.toHaveBeenCalled();
      
      const context = JSON.parse(fs.readFileSync('.issue-context.json', 'utf8'));
      expect(context.published_errors['ERR-20260405123000-abc123'].severity).toBe('high');
    });

    test('complete workflow: existing comment, update', async () => {
      const issueContext = {
        version: '1.0.0',
        published_errors: {
          'ERR-20260405123000-abc123': {
            comment_id: 88888,
            issue_number: 42,
            owner: 'testowner',
            repo: 'testrepo',
            status: 'published',
            published_at: '2026-04-04T12:00:00Z'
          }
        }
      };
      fs.writeFileSync('.issue-context.json', JSON.stringify(issueContext));
      
      const errorReport = createMockErrorReport();
      errorReport.error_details.title = 'Updated error title';
      
      formatErrorComment.mockReturnValue('## 🚨 Error Report\n\nUpdated comment body');
      
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(true);
      expect(result.comment_id).toBe(88888);
      
      expect(mockPostComment).not.toHaveBeenCalled();
      expect(mockUpdateComment).toHaveBeenCalledWith('testowner', 'testrepo', 88888, '## 🚨 Error Report\n\nUpdated comment body');
    });

    test('failure isolation: error does not affect error-report artifact', async () => {
      const error = { status: 404, message: 'Not Found' };
      mockPostComment.mockRejectedValueOnce(error);
      
      const originalErrorReport = createMockErrorReport();
      const errorReportCopy = JSON.parse(JSON.stringify(originalErrorReport));
      
      const result = await publishErrorReport(errorReportCopy, 'testowner', 'testrepo', 42);
      
      expect(errorReportCopy).toEqual(originalErrorReport);
      expect(result.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('handles error report without artifact_id', async () => {
      const errorReport = createMockErrorReport();
      errorReport.artifact_id = undefined;
      
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(true);
    });

    test('handles error report without error_classification', async () => {
      const errorReport = createMockErrorReport();
      errorReport.error_classification = undefined;
      
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(true);
      
      const context = JSON.parse(fs.readFileSync('.issue-context.json', 'utf8'));
      expect(context.published_errors[errorReport.artifact_id].severity).toBe('medium');
    });

    test('handles large issue number', async () => {
      mockPostComment.mockResolvedValueOnce({
        id: 12345,
        html_url: 'https://github.com/owner/repo/issues/999999#issuecomment-12345'
      });
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 999999);
      
      expect(result.success).toBe(true);
      expect(mockPostComment).toHaveBeenCalledWith('testowner', 'testrepo', 999999, expect.any(String));
    });

    test('handles special characters in comment body', async () => {
      formatErrorComment.mockReturnValue('## 🚨 Error Report\n\nError with "quotes" and <script>');
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(true);
      expect(mockPostComment).toHaveBeenCalledWith('testowner', 'testrepo', 42, '## 🚨 Error Report\n\nError with "quotes" and <script>');
    });

    test('handles multiline comment body', async () => {
      formatErrorComment.mockReturnValue('## 🚨 Error Report\n\nLine 1\nLine 2\nLine 3');
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(true);
    });

    test('handles empty comment body', async () => {
      formatErrorComment.mockReturnValue('');
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(true);
      expect(mockPostComment).toHaveBeenCalledWith('testowner', 'testrepo', 42, '');
    });

    test('handles null severity in error report', async () => {
      const errorReport = createMockErrorReport();
      errorReport.error_classification = null;
      
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(true);
      
      const context = JSON.parse(fs.readFileSync('.issue-context.json', 'utf8'));
      expect(context.published_errors[errorReport.artifact_id].severity).toBe('medium');
    });

    test('handles undefined severity in error report', async () => {
      const errorReport = createMockErrorReport();
      errorReport.error_classification = { severity: undefined };
      
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(true);
    });
  });

  describe('GitHubClient Retry Integration', () => {
    test('GitHubClient handles retry internally (not in publishErrorReport)', async () => {
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(mockPostComment).toHaveBeenCalledTimes(1);
    });

    test('publishErrorReport delegates retry to GitHubClient', async () => {
      const error = { status: 403, message: 'rate limit exceeded' };
      mockPostComment.mockRejectedValueOnce(error);
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.success).toBe(false);
      expect(result.error.retry_available).toBe(true);
    });
  });

  describe('Return Value Structure', () => {
    test('success result has all required fields', async () => {
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('comment_url');
      expect(result).toHaveProperty('comment_id');
      expect(result).toHaveProperty('error');
      expect(result.success).toBe(true);
      expect(result.comment_url).toBe('https://github.com/testowner/testrepo/issues/42#issuecomment-12345');
      expect(result.comment_id).toBe(12345);
      expect(result.error).toBeNull();
    });

    test('failure result has all required fields', async () => {
      const error = { status: 404, message: 'Not Found' };
      mockPostComment.mockRejectedValueOnce(error);
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('comment_url');
      expect(result).toHaveProperty('comment_id');
      expect(result).toHaveProperty('error');
      expect(result.success).toBe(false);
      expect(result.comment_url).toBeNull();
      expect(result.comment_id).toBeNull();
      expect(result.error).toHaveProperty('code');
      expect(result.error).toHaveProperty('message');
      expect(result.error).toHaveProperty('suggestion');
      expect(result.error).toHaveProperty('retry_available');
    });

    test('error classification contains suggestion', async () => {
      const error = { status: 404, message: 'Not Found' };
      mockPostComment.mockRejectedValueOnce(error);
      
      const errorReport = createMockErrorReport();
      const result = await publishErrorReport(errorReport, 'testowner', 'testrepo', 42);
      
      expect(result.error.suggestion).toBeDefined();
      expect(result.error.suggestion.length).toBeGreaterThan(0);
    });
  });
});