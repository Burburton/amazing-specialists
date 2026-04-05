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

const {
  scrubErrorReport,
  scrubString,
  scrubObject,
  loadConfig,
  clearAllCaches
} = require('../../../lib/secrets-redaction/index.js');
const { logRedaction, getAuditLog, clearAuditLog } = require('../../../lib/secrets-redaction/audit-logger.js');
const { scrubObject: scrubberScrubObject } = require('../../../lib/secrets-redaction/scrubber.js');
const { getDefaultPatterns, getEnabledPatterns } = require('../../../lib/secrets-redaction/patterns.js');
const { formatErrorComment } = require('../../../lib/github-issue-reporter/error-comment-formatter.js');

function writeConfig(tempDir, config) {
  fs.mkdirSync(path.join(tempDir, '.opencode'), { recursive: true });
  fs.writeFileSync(path.join(tempDir, '.opencode', 'secrets-redaction.json'), JSON.stringify(config, null, 2));
}

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

const createErrorReportWithSecrets = () => ({
  artifact_id: 'ERR-with-secrets',
  artifact_type: 'error-report',
  error_context: {
    dispatch_id: 'gh-issue-secret-owner-secret-repo-100',
    task_id: 'T-SECRET-001',
    role: 'developer'
  },
  error_details: {
    title: 'Error with embedded secrets',
    description: 'GitHub token: ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR and password: my_secret_password_123',
    error_code: 'ERR-SECRET-001',
    stacktrace_or_context: 'AWS key: AKIATESTFAKE12345678 found in config file. api_key: TEST-API-KEY-FOR-TESTING-NOT-REAL-abc'
  },
  error_classification: {
    error_type: 'CONFIGURATION_ERROR',
    severity: 'critical'
  },
  impact_assessment: {
    blocking_points: ['Secret exposure risk']
  },
  traceability: {
    source_file: 'config/settings.json'
  },
  resolution_guidance: {
    auto_recoverable: false,
    recommended_action: 'REWORK',
    fix_suggestions: ['Remove secrets from config']
  },
  metadata: {
    created_at: '2026-04-05T12:00:00Z'
  }
});

const createErrorReportWithNestedSecrets = () => ({
  artifact_id: 'ERR-nested-secrets',
  artifact_type: 'error-report',
  error_context: {
    role: 'developer'
  },
  error_details: {
    title: 'Nested secrets error'
  },
  error_classification: {
    severity: 'high'
  },
  impact_assessment: {
    blocking_points: ['Test blocked'],
    downstream_impact: 'blocked',
    milestone_impact: 'at_risk'
  },
  traceability: {
    source_file: 'tests/test.js'
  },
  resolution_guidance: {
    auto_recoverable: false,
    recommended_action: 'REWORK'
  },
  metadata: {
    created_at: '2026-04-05T12:00:00Z'
  },
  context: {
    config: {
      database: {
        connection_string: 'postgresql://user:secretpass123@host:5432/mydb',
        password: 'db_password_secret_value'
      },
      api: {
        key: 'api_key: FAKE_STRIPE_KEY_FOR_TESTING_NOT_REAL_12345',
        bearer_token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      }
    },
    secrets: {
      jwt_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      private_key_pem: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...'
    }
  }
});

describe('Secrets Redaction Integration Tests', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'secrets-redaction-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);

    jest.clearAllMocks();
    clearAuditLog();
    clearAllCaches();

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

  describe('Full workflow: error-report to scrub to comment', () => {
    test('scrubs secrets before comment generation', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true, password: true, api_key_generic: true }
      });

      const errorReport = createErrorReportWithSecrets();

      const result = await scrubErrorReport(errorReport, { source: 'integration-test' });

      expect(result.success).toBe(true);
      expect(result.patterns_matched).toContain('github_token');
      expect(result.patterns_matched).toContain('password');
      expect(result.redaction_count).toBeGreaterThan(0);

      expect(result.scrubbed.error_details.description).not.toContain('ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR');
      expect(result.scrubbed.error_details.description).toContain('[REDACTED:github-token]');
      expect(result.scrubbed.error_details.description).toContain('[REDACTED:password]');
      expect(result.scrubbed.error_details.stacktrace_or_context).toContain('[REDACTED:api-key]');
    });

    test('formatErrorComment uses scrubbed error report', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true, password: true, bearer_token: true, jwt: true }
      });

      const errorReport = createErrorReportWithNestedSecrets();

      const comment = await formatErrorComment(errorReport);

      expect(comment).not.toContain('ghp_');
      expect(comment).not.toContain('secretpass123');
      expect(comment).not.toContain('sk_live');
      expect(comment).not.toContain('Bearer eyJ');
      expect(comment).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    test('preserves original error report during scrubbing', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true }
      });

      const originalReport = createErrorReportWithSecrets();
      const originalDescription = originalReport.error_details.description;

      const result = await scrubErrorReport(originalReport);

      expect(originalReport.error_details.description).toBe(originalDescription);
      expect(result.scrubbed.error_details.description).not.toBe(originalDescription);
    });

    test('handles error report without secrets', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true }
      });

      const cleanReport = createSampleErrorReport();

      const result = await scrubErrorReport(cleanReport);

      expect(result.success).toBe(true);
      expect(result.redaction_count).toBe(0);
      expect(result.patterns_matched).toHaveLength(0);
      expect(result.fields_redacted).toHaveLength(0);
    });
  });

  describe('Custom patterns + default patterns combined', () => {
    test('custom patterns work alongside default patterns', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true },
        custom_patterns: [
          {
            name: 'company_api_key',
            pattern: 'MYCOMP-[a-zA-Z0-9]{32}',
            replacement: '[REDACTED:company-key]',
            severity: 'critical'
          }
        ]
      });

      const errorReport = {
        artifact_id: 'ERR-custom-patterns',
        error_details: {
          description: 'GitHub token: ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR and Company key: MYCOMP-abcdefghijklmnopqrstuvwxyz123456'
        }
      };

      const result = await scrubErrorReport(errorReport);

      expect(result.success).toBe(true);
      expect(result.patterns_matched).toContain('github_token');
      expect(result.patterns_matched).toContain('company_api_key');
      expect(result.scrubbed.error_details.description).toContain('[REDACTED:github-token]');
      expect(result.scrubbed.error_details.description).toContain('[REDACTED:company_api_key]');
    });

    test('custom pattern does not conflict with disabled default pattern', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true, password: false },
        custom_patterns: [
          {
            name: 'my_custom_secret',
            pattern: 'MYSECRET-[a-zA-Z0-9]+',
            replacement: '[REDACTED:custom]',
            severity: 'high'
          }
        ]
      });

      const errorReport = {
        artifact_id: 'ERR-custom-only',
        error_details: {
          description: 'Password: mypassword123 and MYSECRET-something and token: ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
        }
      };

      const result = await scrubErrorReport(errorReport);

      expect(result.success).toBe(true);
      expect(result.patterns_matched).toContain('my_custom_secret');
      expect(result.patterns_matched).toContain('github_token');
      expect(result.patterns_matched).not.toContain('password');
      expect(result.scrubbed.error_details.description).toContain('mypassword123');
      expect(result.scrubbed.error_details.description).toContain('[REDACTED:my_custom_secret]');
    });
  });

  describe('Whitelist field exclusion', () => {
    test('whitelist prevents redaction of specified fields', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true, api_key_generic: true },
        whitelist_fields: ['error_details.description', 'context.config.api']
      });

      const errorReport = {
        artifact_id: 'ERR-whitelist',
        error_details: {
          title: 'Test',
          description: 'GitHub token: ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
        },
        context: {
          config: {
            api: {
              key: 'api_key: TEST-API-KEY-FOR-TESTING-NOT-REAL-abc'
            },
            database: {
              connection_string: 'postgresql://user:pass@host/db'
            }
          }
        }
      };

      const result = await scrubErrorReport(errorReport);

      expect(result.success).toBe(true);
      expect(result.scrubbed.error_details.description).toContain('ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR');
      expect(result.scrubbed.context.config.api.key).toContain('TEST-API-KEY-FOR-TESTING-NOT-REAL-abc');
      expect(result.patterns_matched).not.toContain('github_token');
      expect(result.patterns_matched).not.toContain('api_key_generic');
    });

    test('whitelist does not affect non-whitelisted nested fields', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true, password: true },
        whitelist_fields: ['error_details.description']
      });

      const errorReport = {
        artifact_id: 'ERR-partial-whitelist',
        error_details: {
          description: 'Token: ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
        },
        context: {
          config: {
            db: {
              password: 'password: secretPassword123'
            }
          }
        }
      };

      const result = await scrubErrorReport(errorReport);

      expect(result.scrubbed.error_details.description).toContain('ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR');
      expect(result.scrubbed.context.config.db.password).toContain('[REDACTED:password]');
    });
  });

  describe('Context patterns filtering', () => {
    test('context patterns filter based on key name', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true },
        context_patterns: [
          {
            key_pattern: 'my_secret',
            value_pattern: '.*',
            replacement: '[REDACTED:my-secret]',
            description: 'Any my_secret value'
          },
          {
            key_pattern: 'internal_token',
            value_pattern: '.*',
            replacement: '[REDACTED:internal]',
            description: 'Any internal_token value'
          }
        ]
      });

      const errorReport = {
        artifact_id: 'ERR-context-patterns',
        context: {
          my_secret: 'actual_secret_value',
          safe_field: 'not_redacted',
          internal_token: 'internal_value_123',
          config: {
            my_secret: 'nested_secret_value'
          }
        }
      };

      const result = await scrubErrorReport(errorReport);

      expect(result.success).toBe(true);
      expect(result.patterns_matched).toContain('context:my_secret');
      expect(result.patterns_matched).toContain('context:internal_token');
      expect(result.scrubbed.context.my_secret).toBe('[REDACTED:my-secret]');
      expect(result.scrubbed.context.safe_field).toBe('not_redacted');
      expect(result.scrubbed.context.internal_token).toBe('[REDACTED:internal]');
      expect(result.scrubbed.context.config.my_secret).toBe('[REDACTED:my-secret]');
    });
  });

  describe('Failure fallback scenarios', () => {
    test('returns original report when redaction is disabled', async () => {
      writeConfig(tempDir, {
        enabled: false,
        default_patterns: { github_token: true }
      });

      const errorReport = createErrorReportWithSecrets();

      const result = await scrubErrorReport(errorReport);

      expect(result.success).toBe(false);
      expect(result.error).toBe('disabled');
      expect(result.scrubbed.error_details.description).toContain('ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR');
    });

    test('returns original report when config file is missing', async () => {
      const errorReport = createErrorReportWithSecrets();

      const result = await scrubErrorReport(errorReport);

      expect(result.success).toBe(true);
      expect(result.scrubbed.error_details.description).not.toContain('ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR');
      expect(result.scrubbed.error_details.description).toContain('[REDACTED:github-token]');
    });

    test('handles malformed config gracefully - falls back to default config', async () => {
      fs.mkdirSync(path.join(tempDir, '.opencode'), { recursive: true });
      fs.writeFileSync(path.join(tempDir, '.opencode', 'secrets-redaction.json'), 'invalid json {');

      const errorReport = createErrorReportWithSecrets();

      const result = await scrubErrorReport(errorReport);

      expect(result.success).toBe(false);
      expect(result.error).toBe('disabled');
    });

    test('formatErrorComment falls back to original when scrubber fails', async () => {
      jest.spyOn(require('../../../lib/secrets-redaction/index.js'), 'scrubErrorReport').mockImplementation(() => {
        throw new Error('Scrubber internal error');
      });

      const errorReport = createSampleErrorReport();

      const comment = await formatErrorComment(errorReport);

      expect(comment).toBeDefined();
      expect(comment).toContain('Error Report');
    });
  });

  describe('Audit log generation', () => {
    test('audit log records successful redaction', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true, password: true }
      });

      const errorReport = createErrorReportWithSecrets();

      await scrubErrorReport(errorReport, { source: 'test-source' });

      const auditLog = getAuditLog();

      expect(auditLog.length).toBeGreaterThan(0);
      expect(auditLog[0].action).toBe('secrets_redaction');
      expect(auditLog[0].input_type).toBe('error-report');
      expect(auditLog[0].source).toBe('test-source');
      expect(auditLog[0].output_status).toBe('success');
      expect(auditLog[0].patterns_matched).toContain('github_token');
      expect(auditLog[0].patterns_matched).toContain('password');
      expect(auditLog[0].redaction_count).toBeGreaterThan(0);
    });

    test('audit log records no_matches status', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true }
      });

      const cleanReport = createSampleErrorReport();

      await scrubErrorReport(cleanReport, { source: 'clean-source' });

      const auditLog = getAuditLog();

      expect(auditLog[0].output_status).toBe('no_matches');
      expect(auditLog[0].redaction_count).toBe(0);
      expect(auditLog[0].patterns_matched).toHaveLength(0);
    });

    test('audit log does not contain actual secret values', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true }
      });

      const errorReport = {
        artifact_id: 'ERR-audit-safe',
        error_details: {
          description: 'GitHub token: ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
        }
      };

      await scrubErrorReport(errorReport);

      const auditLogStr = JSON.stringify(getAuditLog());

      expect(auditLogStr).not.toContain('ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR');
    });

    test('audit log tracks multiple sequential scrubbing operations', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true }
      });

      const reports = [
        createErrorReportWithSecrets(),
        createSampleErrorReport(),
        { artifact_id: 'ERR-3', error_details: { description: 'ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } }
      ];

      for (const report of reports) {
        await scrubErrorReport(report, { source: 'batch-test' });
      }

      const auditLog = getAuditLog();

      expect(auditLog.length).toBe(3);
      expect(auditLog[0].source).toBe('batch-test');
      expect(auditLog[1].output_status).toBe('no_matches');
      expect(auditLog[2].output_status).toBe('success');
    });
  });

  describe('Auto-error-report integration flow', () => {
    test('scrubErrorReport called with auto-error-report source', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true }
      });

      const errorReport = createErrorReportWithSecrets();

      const result = await scrubErrorReport(errorReport, { source: 'auto-error-report' });

      expect(result.success).toBe(true);

      const auditLog = getAuditLog();
      expect(auditLog[0].source).toBe('auto-error-report');
    });

    test('scrubbing preserves error report structure for downstream', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true, password: true, api_key_generic: true }
      });

      const errorReport = createErrorReportWithNestedSecrets();

      const result = await scrubErrorReport(errorReport);

      expect(result.scrubbed.artifact_id).toBe(errorReport.artifact_id);
      expect(result.scrubbed.artifact_type).toBe(errorReport.artifact_type);
      expect(result.scrubbed.error_context).toBeDefined();
      expect(result.scrubbed.error_classification).toBeDefined();
      expect(result.scrubbed.error_details).toBeDefined();
      expect(result.scrubbed.impact_assessment).toBeDefined();
      expect(result.scrubbed.traceability).toBeDefined();
      expect(result.scrubbed.resolution_guidance).toBeDefined();
      expect(result.scrubbed.metadata).toBeDefined();
    });
  });

  describe('Multiple secrets in single field', () => {
    test('scrubs multiple secrets in same string', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true, aws_access_key: true, password: true }
      });

      const errorReport = {
        artifact_id: 'ERR-multi-secrets',
        error_details: {
          stacktrace_or_context: 'Config contains: token=ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR, aws_key=AKIATESTFAKE12345678, password=supersecret123'
        }
      };

      const result = await scrubErrorReport(errorReport);

      expect(result.success).toBe(true);
      expect(result.patterns_matched).toContain('github_token');
      expect(result.patterns_matched).toContain('aws_access_key');
      expect(result.patterns_matched).toContain('password');
      expect(result.redaction_count).toBeGreaterThanOrEqual(3);

      const scrubbed = result.scrubbed.error_details.stacktrace_or_context;
      expect(scrubbed).toContain('[REDACTED:github-token]');
      expect(scrubbed).toContain('[REDACTED:aws-access-key]');
      expect(scrubbed).toContain('[REDACTED:password]');
    });

    test('scrubs secrets in array values', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true, jwt: true, aws_secret_key: false }
      });

      const fullJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const errorReport = {
        artifact_id: 'ERR-array-secrets',
        impact_assessment: {
          blocking_points: [
            'Token leaked: ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR',
            `JWT found: ${fullJwt}`,
            'No secret here'
          ]
        }
      };

      const result = await scrubErrorReport(errorReport);

      expect(result.success).toBe(true);
      expect(result.scrubbed.impact_assessment.blocking_points[0]).toContain('[REDACTED:github-token]');
      expect(result.scrubbed.impact_assessment.blocking_points[1]).toContain('[REDACTED:jwt]');
      expect(result.scrubbed.impact_assessment.blocking_points[2]).toBe('No secret here');
    });
  });

  describe('End-to-end scenarios', () => {
    test('complete workflow: create error report, scrub, generate comment', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true, password: true, api_key_generic: true }
      });

      const errorReport = createErrorReportWithNestedSecrets();

      const scrubResult = await scrubErrorReport(errorReport, { source: 'e2e-test' });
      expect(scrubResult.success).toBe(true);

      const comment = await formatErrorComment(scrubResult.scrubbed);
      expect(comment).toBeDefined();
      expect(comment).toContain('Error Report');
      expect(comment).not.toContain('ghp_');
      expect(comment).not.toContain('secretpass123');
      expect(comment).not.toContain('sk_live');

      const auditLog = getAuditLog();
      expect(auditLog.length).toBeGreaterThan(0);
      expect(auditLog[0].source).toBe('e2e-test');
    });

    test('scrubbing then publishing to mock GitHub Issue', async () => {
      writeConfig(tempDir, {
        enabled: true,
        default_patterns: { github_token: true }
      });
      fs.writeFileSync(path.join(tempDir, '.issue-context.json'), JSON.stringify({ version: '1.0.0' }, null, 2));

      const { publishErrorReport } = require('../../../lib/github-issue-reporter');
      const errorReport = createErrorReportWithSecrets();

      const scrubResult = await scrubErrorReport(errorReport, { source: 'publish-test' });
      const safeErrorReport = scrubResult.success ? scrubResult.scrubbed : errorReport;

      const publishResult = await publishErrorReport(safeErrorReport, 'testowner', 'testrepo', 42);

      expect(publishResult.success).toBe(true);
      expect(mockPostComment).toHaveBeenCalledWith(
        'testowner',
        'testrepo',
        42,
        expect.not.stringContaining('ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR')
      );
    });
  });
});