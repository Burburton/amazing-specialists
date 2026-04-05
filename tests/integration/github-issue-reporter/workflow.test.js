const fs = require('fs');
const path = require('path');
const os = require('os');

const mockPostComment = jest.fn();
const mockUpdateComment = jest.fn();

jest.mock('../../../adapters/github-issue/github-client', () => {
  return jest.fn().mockImplementation(() => ({
    postComment: mockPostComment,
    updateComment: mockUpdateComment
  }));
});

const { reportToIssue, publishErrorReport, ERR_CODES } = require('../../../lib/github-issue-reporter');

const createSampleErrorReport = (overrides = {}) => ({
  artifact_id: 'ERR-20260405-test001',
  artifact_type: 'error-report',
  error_context: {
    dispatch_id: 'gh-issue-testowner-testrepo-42',
    task_id: 'T-TEST-001',
    role: 'developer',
    execution_phase: 'execution'
  },
  error_classification: {
    error_type: 'EXECUTION_ERROR',
    error_subtype: 'test_failure',
    severity: 'high'
  },
  error_details: {
    title: 'Test error for integration test',
    description: 'This is a test error report for integration testing',
    error_code: 'ERR-DEV-001',
    stacktrace_or_context: 'Test context'
  },
  impact_assessment: {
    blocking_points: ['Test blocked'],
    downstream_impact: 'blocked',
    milestone_impact: 'at_risk'
  },
  traceability: {
    source_artifact: 'test-artifact-001',
    source_file: 'tests/test.js',
    source_line: 10
  },
  resolution_guidance: {
    auto_recoverable: false,
    recommended_action: 'REWORK',
    fix_suggestions: ['Fix suggestion 1', 'Fix suggestion 2']
  },
  metadata: {
    created_at: '2026-04-05T12:00:00Z',
    created_by_role: 'developer',
    retry_count: 0
  },
  ...overrides
});

describe('GitHub Issue Reporter Workflow Integration', () => {
  let tempDir;
  let originalCwd;

  const testOwner = 'testowner';
  const testRepo = 'testrepo';
  const testIssueNumber = 42;
  const testCommentId = 12345;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'github-issue-reporter-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);

    jest.clearAllMocks();

    mockPostComment.mockResolvedValue({
      id: testCommentId,
      html_url: `https://github.com/${testOwner}/${testRepo}/issues/${testIssueNumber}#issuecomment-${testCommentId}`
    });

    mockUpdateComment.mockResolvedValue({
      id: testCommentId,
      html_url: `https://github.com/${testOwner}/${testRepo}/issues/${testIssueNumber}#issuecomment-${testCommentId}`
    });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  describe('Full workflow: error-report to Issue comment', () => {
    test('publishes error report to GitHub Issue successfully', async () => {
      const errorReport = createSampleErrorReport();

      const result = await publishErrorReport(
        errorReport,
        testOwner,
        testRepo,
        testIssueNumber
      );

      expect(result.success).toBe(true);
      expect(result.comment_url).toBe(`https://github.com/${testOwner}/${testRepo}/issues/${testIssueNumber}#issuecomment-${testCommentId}`);
      expect(result.comment_id).toBe(testCommentId);
      expect(result.error).toBeNull();
      expect(mockPostComment).toHaveBeenCalledWith(
        testOwner,
        testRepo,
        testIssueNumber,
        expect.stringContaining('Error Report')
      );
    });

    test('formats comment with correct severity badge', async () => {
      const errorReport = createSampleErrorReport({
        error_classification: { severity: 'critical' }
      });

      await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);

      expect(mockPostComment).toHaveBeenCalledWith(
        testOwner,
        testRepo,
        testIssueNumber,
        expect.stringContaining('Critical')
      );
    });

    test('formats comment with all severity variants', async () => {
      const severities = [
        { severity: 'critical', expectedContent: 'Critical' },
        { severity: 'high', expectedContent: 'High' },
        { severity: 'medium', expectedContent: 'Medium' },
        { severity: 'low', expectedContent: 'Informational Note' }
      ];

      for (let i = 0; i < severities.length; i++) {
        jest.clearAllMocks();
        mockPostComment.mockResolvedValue({
          id: testCommentId + i,
          html_url: `https://github.com/${testOwner}/${testRepo}/issues/${testIssueNumber}#issuecomment-${testCommentId + i}`
        });

        const errorReport = createSampleErrorReport({
          artifact_id: `ERR-test-${i}`,
          error_classification: { severity: severities[i].severity }
        });

        const result = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);

        expect(result.success).toBe(true);
        expect(mockPostComment).toHaveBeenCalledWith(
          testOwner,
          testRepo,
          testIssueNumber,
          expect.stringContaining(severities[i].expectedContent)
        );
      }
    });
  });

  describe('CLI command integration', () => {
    test('handles error report from dispatch_id', async () => {
      const errorReport = createSampleErrorReport({
        error_context: {
          dispatch_id: 'gh-issue-cliowner-clirepo-100',
          task_id: null
        }
      });

      const result = await reportToIssue(errorReport, {
        owner: 'cliowner',
        repo: 'clirepo'
      });

      expect(result.success).toBe(true);
      expect(mockPostComment).toHaveBeenCalledWith(
        'cliowner',
        'clirepo',
        100,
        expect.any(String)
      );
    });

    test('accepts CLI --issue override', async () => {
      const errorReport = createSampleErrorReport({
        error_context: { dispatch_id: 'gh-issue-otherowner-otherrepo-99' }
      });

      const result = await reportToIssue(errorReport, {
        owner: testOwner,
        repo: testRepo,
        issue: 50
      });

      expect(result.success).toBe(true);
      expect(mockPostComment).toHaveBeenCalledWith(
        testOwner,
        testRepo,
        50,
        expect.any(String)
      );
    });

    test('rejects when no Issue association found', async () => {
      const errorReport = createSampleErrorReport({
        error_context: {
          dispatch_id: null,
          task_id: null
        }
      });

      const result = await reportToIssue(errorReport, {
        owner: testOwner,
        repo: testRepo
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERR_CODES.NO_ISSUE_ASSOCIATED);
      expect(mockPostComment).not.toHaveBeenCalled();
    });
  });

  describe('Integration with github-client API errors', () => {
    test('handles 404 Issue Not Found error', async () => {
      const error = new Error('Not Found');
      error.status = 404;
      mockPostComment.mockRejectedValue(error);

      const errorReport = createSampleErrorReport();
      const result = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERR_CODES.ISSUE_NOT_FOUND);
      expect(result.error.message).toContain('Issue not found');
    });

    test('handles 403 Permission Denied error', async () => {
      const error = new Error('Forbidden');
      error.status = 403;
      mockPostComment.mockRejectedValue(error);

      const errorReport = createSampleErrorReport();
      const result = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERR_CODES.PERMISSION_DENIED);
      expect(result.error.message).toContain('Permission denied');
    });

    test('handles 403 Rate Limit error', async () => {
      const error = new Error('rate limit exceeded');
      error.status = 403;
      mockPostComment.mockRejectedValue(error);

      const errorReport = createSampleErrorReport();
      const result = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERR_CODES.API_RATE_LIMIT);
      expect(result.error.message).toContain('rate limit');
      expect(result.error.retry_available).toBe(true);
    });

    test('handles 500 Server Error', async () => {
      const error = new Error('Internal Server Error');
      error.status = 500;
      mockPostComment.mockRejectedValue(error);

      const errorReport = createSampleErrorReport();
      const result = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERR_CODES.COMMENT_POST_FAILED);
      expect(result.error.retry_available).toBe(true);
    });
  });

  describe('Integration with .issue-context.json state persistence', () => {
    test('records published comment to .issue-context.json', async () => {
      const errorReport = createSampleErrorReport();
      const issueContextPath = path.join(tempDir, '.issue-context.json');
      fs.writeFileSync(issueContextPath, JSON.stringify({ version: '1.0.0' }, null, 2));

      const result = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);

      expect(result.success).toBe(true);

      const issueContext = JSON.parse(fs.readFileSync(issueContextPath, 'utf8'));
      expect(issueContext.published_errors).toBeDefined();
      expect(issueContext.published_errors[errorReport.artifact_id]).toBeDefined();
      expect(issueContext.published_errors[errorReport.artifact_id].comment_id).toBe(testCommentId);
      expect(issueContext.published_errors[errorReport.artifact_id].issue_number).toBe(testIssueNumber);
      expect(issueContext.published_errors[errorReport.artifact_id].status).toBe('published');
    });

    test('records failure status to .issue-context.json', async () => {
      const error = new Error('Not Found');
      error.status = 404;
      mockPostComment.mockRejectedValue(error);

      const errorReport = createSampleErrorReport();
      const issueContextPath = path.join(tempDir, '.issue-context.json');
      fs.writeFileSync(issueContextPath, JSON.stringify({ version: '1.0.0' }, null, 2));

      const result = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);

      expect(result.success).toBe(false);

      const issueContext = JSON.parse(fs.readFileSync(issueContextPath, 'utf8'));
      expect(issueContext.published_errors[errorReport.artifact_id]).toBeDefined();
      expect(issueContext.published_errors[errorReport.artifact_id].status).toBe('failed');
      expect(issueContext.published_errors[errorReport.artifact_id].comment_id).toBeNull();
    });
  });

  describe('Comment update workflow', () => {
    test('updates existing comment instead of creating new one', async () => {
      const errorReport = createSampleErrorReport();
      const existingCommentId = 99999;
      const issueContextPath = path.join(tempDir, '.issue-context.json');

      fs.writeFileSync(issueContextPath, JSON.stringify({
        version: '1.0.0',
        published_errors: {
          [errorReport.artifact_id]: {
            comment_id: existingCommentId,
            issue_number: testIssueNumber,
            owner: testOwner,
            repo: testRepo,
            status: 'published'
          }
        }
      }, null, 2));

      mockUpdateComment.mockResolvedValue({
        id: existingCommentId,
        html_url: `https://github.com/${testOwner}/${testRepo}/issues/${testIssueNumber}#issuecomment-${existingCommentId}`
      });

      const result = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);

      expect(result.success).toBe(true);
      expect(result.comment_id).toBe(existingCommentId);
      expect(result.comment_url).toContain(`#issuecomment-${existingCommentId}`);
      expect(mockUpdateComment).toHaveBeenCalledWith(
        testOwner,
        testRepo,
        existingCommentId,
        expect.stringContaining('Error Report')
      );
      expect(mockPostComment).not.toHaveBeenCalled();
    });

    test('idempotency: same error_report_id updates same comment', async () => {
      const errorReport = createSampleErrorReport();
      const issueContextPath = path.join(tempDir, '.issue-context.json');

      fs.writeFileSync(issueContextPath, JSON.stringify({
        version: '1.0.0',
        published_errors: {
          [errorReport.artifact_id]: {
            comment_id: testCommentId,
            issue_number: testIssueNumber,
            owner: testOwner,
            repo: testRepo,
            status: 'published'
          }
        }
      }, null, 2));

      const result1 = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);
      expect(result1.success).toBe(true);
      expect(result1.comment_id).toBe(testCommentId);

      const result2 = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);
      expect(result2.success).toBe(true);
      expect(result2.comment_id).toBe(testCommentId);

      expect(mockUpdateComment).toHaveBeenCalledTimes(2);
      expect(mockPostComment).not.toHaveBeenCalled();
    });

    test('creates new comment when error_report_id not found', async () => {
      const errorReport1 = createSampleErrorReport({ artifact_id: 'ERR-first' });
      const errorReport2 = createSampleErrorReport({ artifact_id: 'ERR-second' });
      const issueContextPath = path.join(tempDir, '.issue-context.json');
      fs.writeFileSync(issueContextPath, JSON.stringify({ version: '1.0.0' }, null, 2));

      mockPostComment
        .mockResolvedValueOnce({
          id: 100,
          html_url: `https://github.com/${testOwner}/${testRepo}/issues/${testIssueNumber}#issuecomment-100`
        })
        .mockResolvedValueOnce({
          id: 200,
          html_url: `https://github.com/${testOwner}/${testRepo}/issues/${testIssueNumber}#issuecomment-200`
        });

      const result1 = await publishErrorReport(errorReport1, testOwner, testRepo, testIssueNumber);
      expect(result1.success).toBe(true);
      expect(result1.comment_id).toBe(100);

      const result2 = await publishErrorReport(errorReport2, testOwner, testRepo, testIssueNumber);
      expect(result2.success).toBe(true);
      expect(result2.comment_id).toBe(200);

      const issueContext = JSON.parse(fs.readFileSync(issueContextPath, 'utf8'));
      expect(issueContext.published_errors['ERR-first'].comment_id).toBe(100);
      expect(issueContext.published_errors['ERR-second'].comment_id).toBe(200);
    });
  });

  describe('Failure isolation', () => {
    test('error report artifact unchanged when publish fails', async () => {
      const error = new Error('Internal Server Error');
      error.status = 500;
      mockPostComment.mockRejectedValue(error);

      const errorReport = createSampleErrorReport();
      const errorReportPath = path.join(tempDir, 'error-report.json');
      const originalContent = JSON.stringify(errorReport, null, 2);
      fs.writeFileSync(errorReportPath, originalContent);

      const result = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);

      expect(result.success).toBe(false);
      const artifactContent = fs.readFileSync(errorReportPath, 'utf8');
      expect(artifactContent).toBe(originalContent);
    });

    test('error report can be republished after failure', async () => {
      const error = new Error('Internal Server Error');
      error.status = 500;

      const errorReport = createSampleErrorReport();
      const issueContextPath = path.join(tempDir, '.issue-context.json');
      fs.writeFileSync(issueContextPath, JSON.stringify({ version: '1.0.0' }, null, 2));

      mockPostComment.mockRejectedValueOnce(error);

      const result1 = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);
      expect(result1.success).toBe(false);

      const issueContext1 = JSON.parse(fs.readFileSync(issueContextPath, 'utf8'));
      expect(issueContext1.published_errors[errorReport.artifact_id].status).toBe('failed');

      mockPostComment.mockResolvedValueOnce({
        id: testCommentId,
        html_url: `https://github.com/${testOwner}/${testRepo}/issues/${testIssueNumber}#issuecomment-${testCommentId}`
      });

      const result2 = await publishErrorReport(errorReport, testOwner, testRepo, testIssueNumber);
      expect(result2.success).toBe(true);

      const issueContext2 = JSON.parse(fs.readFileSync(issueContextPath, 'utf8'));
      expect(issueContext2.published_errors[errorReport.artifact_id].status).toBe('published');
    });
  });

  describe('Issue association detection workflow', () => {
    test('resolves Issue from dispatch_id format', async () => {
      const errorReport = createSampleErrorReport({
        error_context: {
          dispatch_id: 'gh-issue-myowner-myrepo-100',
          task_id: null
        }
      });

      const result = await reportToIssue(errorReport, {
        owner: 'myowner',
        repo: 'myrepo'
      });

      expect(result.success).toBe(true);
      expect(mockPostComment).toHaveBeenCalledWith(
        'myowner',
        'myrepo',
        100,
        expect.any(String)
      );
    });

    test('resolves Issue from .issue-context.json Task ID mapping', async () => {
      const errorReport = createSampleErrorReport({
        error_context: {
          dispatch_id: null,
          task_id: 'T-MAPPED-001'
        }
      });

      const issueContextPath = path.join(tempDir, '.issue-context.json');
      fs.writeFileSync(issueContextPath, JSON.stringify({
        version: '1.0.0',
        owner: 'mappedowner',
        project: 'mappedrepo',
        issues: {
          'T-MAPPED-001': {
            number: 75,
            url: 'https://github.com/mappedowner/mappedrepo/issues/75',
            status: 'open'
          }
        }
      }, null, 2));

      const result = await reportToIssue(errorReport, {
        owner: 'mappedowner',
        repo: 'mappedrepo'
      });

      expect(result.success).toBe(true);
      expect(mockPostComment).toHaveBeenCalledWith(
        'mappedowner',
        'mappedrepo',
        75,
        expect.any(String)
      );
    });

    test('returns NO_ISSUE_ASSOCIATED when all sources fail', async () => {
      const errorReport = createSampleErrorReport({
        error_context: {
          dispatch_id: 'invalid-format',
          task_id: 'T-NOTFOUND-999'
        }
      });

      const result = await reportToIssue(errorReport, {
        owner: testOwner,
        repo: testRepo
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERR_CODES.NO_ISSUE_ASSOCIATED);
    });
  });

  describe('End-to-end scenarios', () => {
    test('complete workflow: create, publish, verify state', async () => {
      const errorReport = createSampleErrorReport();
      const issueContextPath = path.join(tempDir, '.issue-context.json');
      fs.writeFileSync(issueContextPath, JSON.stringify({ version: '1.0.0' }, null, 2));

      const result = await reportToIssue(errorReport, {
        owner: testOwner,
        repo: testRepo,
        issue: testIssueNumber
      });

      expect(result.success).toBe(true);
      expect(result.comment_url).toBeDefined();
      expect(result.comment_id).toBe(testCommentId);

      expect(mockPostComment).toHaveBeenCalledWith(
        testOwner,
        testRepo,
        testIssueNumber,
        expect.stringContaining('ERR-DEV-001')
      );

      const issueContext = JSON.parse(fs.readFileSync(issueContextPath, 'utf8'));
      expect(issueContext.published_errors[errorReport.artifact_id]).toBeDefined();
      expect(issueContext.published_errors[errorReport.artifact_id].status).toBe('published');
      expect(issueContext.published_errors[errorReport.artifact_id].comment_id).toBe(testCommentId);
    });

    test('multiple error reports to same Issue', async () => {
      const issueContextPath = path.join(tempDir, '.issue-context.json');
      fs.writeFileSync(issueContextPath, JSON.stringify({ version: '1.0.0' }, null, 2));

      const reports = [
        createSampleErrorReport({
          artifact_id: 'ERR-multi-1',
          error_details: { error_code: 'ERR-001', title: 'First error' }
        }),
        createSampleErrorReport({
          artifact_id: 'ERR-multi-2',
          error_details: { error_code: 'ERR-002', title: 'Second error' }
        }),
        createSampleErrorReport({
          artifact_id: 'ERR-multi-3',
          error_details: { error_code: 'ERR-003', title: 'Third error' }
        })
      ];

      mockPostComment
        .mockResolvedValueOnce({ id: 101, html_url: 'https://github.com/testowner/testrepo/issues/42#issuecomment-101' })
        .mockResolvedValueOnce({ id: 102, html_url: 'https://github.com/testowner/testrepo/issues/42#issuecomment-102' })
        .mockResolvedValueOnce({ id: 103, html_url: 'https://github.com/testowner/testrepo/issues/42#issuecomment-103' });

      for (const report of reports) {
        const result = await publishErrorReport(report, testOwner, testRepo, testIssueNumber);
        expect(result.success).toBe(true);
      }

      const issueContext = JSON.parse(fs.readFileSync(issueContextPath, 'utf8'));
      expect(issueContext.published_errors['ERR-multi-1'].comment_id).toBe(101);
      expect(issueContext.published_errors['ERR-multi-2'].comment_id).toBe(102);
      expect(issueContext.published_errors['ERR-multi-3'].comment_id).toBe(103);
    });

    test('mixed success and failure workflow', async () => {
      const issueContextPath = path.join(tempDir, '.issue-context.json');
      fs.writeFileSync(issueContextPath, JSON.stringify({ version: '1.0.0' }, null, 2));

      const successReport = createSampleErrorReport({ artifact_id: 'ERR-success' });
      const failReport = createSampleErrorReport({ artifact_id: 'ERR-fail' });

      mockPostComment
        .mockResolvedValueOnce({ id: 1, html_url: 'https://github.com/test/test/issues/1#issuecomment-1' })
        .mockRejectedValueOnce(Object.assign(new Error('Not Found'), { status: 404 }))
        .mockResolvedValueOnce({ id: 2, html_url: 'https://github.com/test/test/issues/1#issuecomment-2' });

      const result1 = await publishErrorReport(successReport, testOwner, testRepo, testIssueNumber);
      expect(result1.success).toBe(true);

      const result2 = await publishErrorReport(failReport, testOwner, testRepo, testIssueNumber);
      expect(result2.success).toBe(false);
      expect(result2.error.code).toBe(ERR_CODES.ISSUE_NOT_FOUND);

      const result3 = await publishErrorReport(failReport, testOwner, testRepo, testIssueNumber);
      expect(result3.success).toBe(true);

      const issueContext = JSON.parse(fs.readFileSync(issueContextPath, 'utf8'));
      expect(issueContext.published_errors['ERR-success'].status).toBe('published');
      expect(issueContext.published_errors['ERR-fail'].status).toBe('published');
    });
  });
});