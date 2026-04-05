const {
  formatErrorComment,
  selectCommentVariant,
  SEVERITY_BADGES,
  MAX_RETRY
} = require('../../../lib/github-issue-reporter/error-comment-formatter');

describe('Error Comment Formatter', () => {
  describe('SEVERITY_BADGES constant', () => {
    test('low severity maps to green badge', () => {
      expect(SEVERITY_BADGES.low).toBe('🟢 Low');
    });

    test('medium severity maps to yellow badge', () => {
      expect(SEVERITY_BADGES.medium).toBe('🟡 Medium');
    });

    test('high severity maps to red badge', () => {
      expect(SEVERITY_BADGES.high).toBe('🔴 High');
    });

    test('critical severity maps to orange badge', () => {
      expect(SEVERITY_BADGES.critical).toBe('🟠 Critical');
    });

    test('all 4 severities have badge definitions', () => {
      expect(Object.keys(SEVERITY_BADGES)).toHaveLength(4);
      expect(SEVERITY_BADGES).toHaveProperty('low');
      expect(SEVERITY_BADGES).toHaveProperty('medium');
      expect(SEVERITY_BADGES).toHaveProperty('high');
      expect(SEVERITY_BADGES).toHaveProperty('critical');
    });
  });

  describe('MAX_RETRY constant', () => {
    test('MAX_RETRY is defined as 3', () => {
      expect(MAX_RETRY).toBe(3);
    });
  });

  describe('selectCommentVariant', () => {
    test('critical severity returns detailed variant', () => {
      expect(selectCommentVariant('critical')).toBe('detailed');
    });

    test('high severity returns detailed variant', () => {
      expect(selectCommentVariant('high')).toBe('detailed');
    });

    test('medium severity returns standard variant', () => {
      expect(selectCommentVariant('medium')).toBe('standard');
    });

    test('low severity returns simplified variant', () => {
      expect(selectCommentVariant('low')).toBe('simplified');
    });

    test('unknown severity defaults to standard variant', () => {
      expect(selectCommentVariant('unknown')).toBe('simplified');
    });

    test('null severity defaults to simplified variant', () => {
      expect(selectCommentVariant(null)).toBe('simplified');
    });

    test('undefined severity defaults to simplified variant', () => {
      expect(selectCommentVariant(undefined)).toBe('simplified');
    });
  });

  describe('formatErrorComment', () => {
    const createMinimalErrorReport = () => ({
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
      },
      impact_assessment: {
        downstream_impact: 'blocked',
        milestone_impact: 'delay'
      },
      traceability: {
        source_file: 'src/test.js',
        source_line: 42
      },
      resolution_guidance: {
        auto_recoverable: false,
        recommended_action: 'REWORK'
      },
      metadata: {
        created_at: '2026-04-05T12:30:00Z',
        retry_count: 1
      }
    });

    describe('variant selection by severity', () => {
      test('critical severity produces detailed comment', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'critical';
        
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('### 🚫 Blocking Points');
        expect(comment).toContain('### ⏱️ Impact Assessment');
        expect(comment).toContain('Downstream Impact');
        expect(comment).toContain('Milestone Impact');
      });

      test('high severity produces detailed comment', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'high';
        
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('### 🚫 Blocking Points');
        expect(comment).toContain('### ⏱️ Impact Assessment');
      });

      test('medium severity produces standard comment', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'medium';
        
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('## 🚨 Error Report');
        expect(comment).toContain('### 🔧 Recommended Action');
        expect(comment).toContain('### 📊 Recovery');
        expect(comment).not.toContain('### ⏱️ Impact Assessment');
      });

      test('low severity produces simplified comment', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'low';
        
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('## 🟢 Informational Note');
        expect(comment).toContain('### 📍 Source');
        expect(comment).not.toContain('### 🔧 Recommended Action');
        expect(comment).not.toContain('### 📊 Recovery');
      });
    });

    describe('explicit variant override', () => {
      test('can force detailed variant for low severity', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'low';
        
        const comment = formatErrorComment(errorReport, 'detailed');
        
        expect(comment).toContain('### 🚫 Blocking Points');
        expect(comment).toContain('### ⏱️ Impact Assessment');
      });

      test('can force simplified variant for critical severity', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'critical';
        
        const comment = formatErrorComment(errorReport, 'simplified');
        
        expect(comment).toContain('## 🟢 Informational Note');
        expect(comment).not.toContain('### 🚫 Blocking Points');
      });

      test('can force standard variant for high severity', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'high';
        
        const comment = formatErrorComment(errorReport, 'standard');
        
        expect(comment).toContain('## 🚨 Error Report');
        expect(comment).not.toContain('### ⏱️ Impact Assessment');
      });
    });

    describe('template variable substitution', () => {
      test('error_code substituted correctly', () => {
        const errorReport = createMinimalErrorReport();
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('ERR-DEV-001');
      });

      test('severity_badge substituted correctly', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'high';
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('🔴 High');
      });

      test('error_type substituted correctly', () => {
        const errorReport = createMinimalErrorReport();
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('EXECUTION_ERROR');
      });

      test('role substituted correctly', () => {
        const errorReport = createMinimalErrorReport();
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('developer');
      });

      test('title substituted correctly', () => {
        const errorReport = createMinimalErrorReport();
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('Test error');
      });

      test('description substituted correctly', () => {
        const errorReport = createMinimalErrorReport();
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('Test description');
      });

      test('source_reference with file and line substituted', () => {
        const errorReport = createMinimalErrorReport();
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('File: src/test.js:42');
      });

      test('source_reference with only file substituted', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.traceability.source_line = null;
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('File: src/test.js');
        expect(comment).not.toContain(':null');
      });

      test('source_reference with artifact substituted', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.traceability.source_file = null;
        errorReport.traceability.source_artifact = 'test-report-001';
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('Artifact: test-report-001');
      });

      test('recommended_action substituted correctly', () => {
        const errorReport = createMinimalErrorReport();
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('REWORK');
      });

      test('downstream_impact substituted in detailed variant', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'high';
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('blocked');
      });

      test('milestone_impact substituted in detailed variant', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'high';
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('delay');
      });

      test('auto_recoverable substituted as Yes when true', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.resolution_guidance.auto_recoverable = true;
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('**Auto-Recoverable**: Yes');
      });

      test('auto_recoverable substituted as No when false', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.resolution_guidance.auto_recoverable = false;
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('**Auto-Recoverable**: No');
      });

      test('retry_count substituted correctly', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.metadata.retry_count = 2;
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('**Retry Count**: 2/3');
      });

      test('error_report_id substituted correctly', () => {
        const errorReport = createMinimalErrorReport();
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('Error ID: ERR-20260405123000-abc123');
      });

      test('created_at substituted correctly', () => {
        const errorReport = createMinimalErrorReport();
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('2026-04-05T12:30:00Z');
      });
    });

    describe('blocking_points formatting', () => {
      test('multiple blocking points formatted as list', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'high';
        errorReport.impact_assessment.blocking_points = [
          'Cannot proceed without spec',
          'Missing test coverage'
        ];
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('- Cannot proceed without spec');
        expect(comment).toContain('- Missing test coverage');
      });

      test('empty blocking_points shows default message', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'high';
        errorReport.impact_assessment.blocking_points = [];
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('No blocking points identified');
      });

      test('missing blocking_points shows default message', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.error_classification.severity = 'high';
        errorReport.impact_assessment.blocking_points = null;
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('No blocking points identified');
      });
    });

    describe('fix_suggestions formatting', () => {
      test('multiple fix suggestions formatted correctly', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.resolution_guidance.fix_suggestions = [
          'Fix the import statement',
          'Add null check'
        ];
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('Fix suggestions:');
        expect(comment).toContain('- Fix the import statement');
        expect(comment).toContain('- Add null check');
      });

      test('empty fix_suggestions shows default message', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.resolution_guidance.fix_suggestions = [];
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('No specific fix suggestions available');
      });

      test('missing fix_suggestions shows default message', () => {
        const errorReport = createMinimalErrorReport();
        errorReport.resolution_guidance.fix_suggestions = null;
        const comment = formatErrorComment(errorReport);
        
        expect(comment).toContain('No specific fix suggestions available');
      });
    });
  });

  describe('Markdown format validation', () => {
    const createMinimalErrorReport = () => ({
      artifact_id: 'ERR-20260405123000-abc123',
      error_context: { role: 'developer' },
      error_classification: { error_type: 'EXECUTION_ERROR', severity: 'medium' },
      error_details: { error_code: 'ERR-DEV-001', title: 'Test', description: 'Desc' },
      impact_assessment: { downstream_impact: 'blocked', milestone_impact: 'delay' },
      traceability: { source_file: 'test.js' },
      resolution_guidance: { auto_recoverable: false, recommended_action: 'REWORK' },
      metadata: { created_at: '2026-04-05T12:30:00Z', retry_count: 0 }
    });

    test('uses GitHub supported markdown headers', () => {
      const comment = formatErrorComment(createMinimalErrorReport());
      
      expect(comment).toMatch(/^## /);
      expect(comment).toMatch(/### /);
    });

    test('uses bold text with ** syntax', () => {
      const comment = formatErrorComment(createMinimalErrorReport());
      
      expect(comment).toContain('**Severity**:');
      expect(comment).toContain('**Error Type**:');
      expect(comment).toContain('**Role**:');
    });

    test('uses list items with - syntax', () => {
      const errorReport = createMinimalErrorReport();
      errorReport.error_classification.severity = 'high';
      errorReport.impact_assessment.blocking_points = ['Point 1'];
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('- Point 1');
      expect(comment).toContain('- **Downstream Impact**:');
    });

    test('uses horizontal rule with --- syntax', () => {
      const comment = formatErrorComment(createMinimalErrorReport());
      
      expect(comment).toContain('\n---\n');
    });

    test('uses italic text with * syntax for footer', () => {
      const comment = formatErrorComment(createMinimalErrorReport());
      
      expect(comment).toContain('*Error ID:');
      expect(comment).toContain('*Reported');
    });

    test('no unsupported markdown features', () => {
      const comment = formatErrorComment(createMinimalErrorReport());
      
      expect(comment).not.toContain('```');
      expect(comment).not.toContain('~~');
      expect(comment).not.toContain('[]');
    });

    test('emoji in headers are GitHub supported', () => {
      const errorReport = createMinimalErrorReport();
      errorReport.error_classification.severity = 'high';
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('🚨');
      expect(comment).toContain('📋');
      expect(comment).toContain('🚫');
      expect(comment).toContain('📍');
      expect(comment).toContain('🔧');
      expect(comment).toContain('⏱️');
      expect(comment).toContain('📊');
    });
  });

  describe('Edge cases', () => {
    test('handles empty error_details', () => {
      const errorReport = {
        artifact_id: 'ERR-test',
        error_details: {}
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('ERR-UNKNOWN');
      expect(comment).toContain('Unknown error');
    });

    test('handles missing error_classification', () => {
      const errorReport = {
        artifact_id: 'ERR-test'
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('🟡 Medium');
    });

    test('handles missing error_context', () => {
      const errorReport = {
        artifact_id: 'ERR-test',
        error_classification: { severity: 'medium' }
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('common');
    });

    test('handles missing metadata', () => {
      const errorReport = {
        artifact_id: 'ERR-test'
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('**Retry Count**: 0/3');
    });

    test('handles missing traceability', () => {
      const errorReport = {
        artifact_id: 'ERR-test'
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('Source reference not available');
    });

    test('handles missing impact_assessment', () => {
      const errorReport = {
        artifact_id: 'ERR-test',
        error_classification: { severity: 'high' }
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('unknown');
    });

    test('handles missing resolution_guidance', () => {
      const errorReport = {
        artifact_id: 'ERR-test'
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('**Auto-Recoverable**: No');
      expect(comment).toContain('REWORK');
    });

    test('handles null artifact_id', () => {
      const errorReport = {
        artifact_id: null
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('Error ID: unknown');
    });

    test('handles missing artifact_id', () => {
      const errorReport = {};
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('Error ID: unknown');
    });

    test('handles empty blocking_points array', () => {
      const errorReport = {
        artifact_id: 'ERR-test',
        error_classification: { severity: 'critical' },
        impact_assessment: { blocking_points: [] }
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('No blocking points identified');
    });

    test('handles empty fix_suggestions array', () => {
      const errorReport = {
        artifact_id: 'ERR-test',
        resolution_guidance: { fix_suggestions: [] }
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('No specific fix suggestions available');
    });

    test('handles missing created_at with fallback', () => {
      const errorReport = {
        artifact_id: 'ERR-test',
        metadata: {}
      };
      
      const comment = formatErrorComment(errorReport);
      
      const today = new Date().toISOString().slice(0, 10);
      expect(comment).toContain(today);
    });

    test('handles all fields missing', () => {
      const errorReport = {};
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('ERR-UNKNOWN');
      expect(comment).toContain('Unknown error');
      expect(comment).toContain('common');
      expect(comment).toContain('🟡 Medium');
      expect(comment).toContain('Source reference not available');
      expect(comment).toContain('Error ID: unknown');
    });

    test('handles very long title', () => {
      const longTitle = 'A'.repeat(200);
      const errorReport = {
        artifact_id: 'ERR-test',
        error_details: { title: longTitle }
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain(longTitle);
    });

    test('handles multiline description', () => {
      const multilineDesc = 'Line 1\nLine 2\nLine 3';
      const errorReport = {
        artifact_id: 'ERR-test',
        error_details: { description: multilineDesc }
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('Line 1');
      expect(comment).toContain('Line 2');
      expect(comment).toContain('Line 3');
    });

    test('handles special characters in fields', () => {
      const errorReport = {
        artifact_id: 'ERR-test-<script>',
        error_details: {
          title: 'Error with "quotes" and <angle>',
          description: 'Test with `backticks` and $variables'
        },
        error_classification: { severity: 'medium' }
      };
      
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('Error with "quotes" and <angle>');
      expect(comment).toContain('Test with `backticks` and $variables');
    });
  });

  describe('Output format verification', () => {
    const createCompleteErrorReport = () => ({
      artifact_id: 'ERR-20260405123000-abc123',
      artifact_type: 'error-report',
      error_context: {
        dispatch_id: 'disp-001',
        task_id: 'T-001',
        role: 'developer',
        execution_phase: 'execution'
      },
      error_classification: {
        error_type: 'EXECUTION_ERROR',
        error_subtype: 'npm_timeout',
        severity: 'high'
      },
      error_details: {
        title: 'npm install timeout',
        description: 'npm install command timed out after 60 seconds',
        error_code: 'ERR-DEV-003',
        stacktrace_or_context: 'npm ERR! network timeout'
      },
      impact_assessment: {
        blocking_points: [
          'Cannot build project without dependencies',
          'Tests cannot run'
        ],
        downstream_impact: 'blocked',
        milestone_impact: 'at_risk'
      },
      traceability: {
        source_artifact: 'build-log-001',
        source_file: 'package.json',
        source_line: 15,
        related_errors: []
      },
      resolution_guidance: {
        auto_recoverable: true,
        recommended_action: 'RETRY',
        fix_suggestions: [
          'Retry npm install',
          'Check network connectivity',
          'Use offline cache if available'
        ],
        estimated_fix_effort: '5 minutes'
      },
      metadata: {
        created_at: '2026-04-05T12:30:00Z',
        created_by_role: 'developer',
        retry_count: 1
      }
    });

    test('detailed comment has all expected sections', () => {
      const comment = formatErrorComment(createCompleteErrorReport());
      
      expect(comment).toContain('## 🚨 Error Report: ERR-DEV-003');
      expect(comment).toContain('**Severity**: 🔴 High');
      expect(comment).toContain('**Error Type**: EXECUTION_ERROR');
      expect(comment).toContain('**Role**: developer');
      expect(comment).toContain('### 📋 Error Summary');
      expect(comment).toContain('### 🚫 Blocking Points');
      expect(comment).toContain('### 📍 Source');
      expect(comment).toContain('### 🔧 Recommended Action');
      expect(comment).toContain('### ⏱️ Impact Assessment');
      expect(comment).toContain('### 📊 Recovery');
      expect(comment).toContain('---');
      expect(comment).toContain('*Error ID: ERR-20260405123000-abc123*');
    });

    test('simplified comment has minimal sections', () => {
      const errorReport = createCompleteErrorReport();
      errorReport.error_classification.severity = 'low';
      const comment = formatErrorComment(errorReport);
      
      expect(comment).toContain('## 🟢 Informational Note');
      expect(comment).toContain('**Error Code**: ERR-DEV-003');
      expect(comment).toContain('**Type**: EXECUTION_ERROR');
      expect(comment).toContain('### 📍 Source');
      expect(comment).toContain('---');
      expect(comment).not.toContain('### 🚫 Blocking Points');
      expect(comment).not.toContain('### 🔧 Recommended Action');
      expect(comment).not.toContain('Role:');
    });

    test('comment output is string type', () => {
      const comment = formatErrorComment(createCompleteErrorReport());
      
      expect(typeof comment).toBe('string');
    });

    test('comment output is non-empty', () => {
      const comment = formatErrorComment(createCompleteErrorReport());
      
      expect(comment.length).toBeGreaterThan(100);
    });

    test('comment contains proper line breaks', () => {
      const comment = formatErrorComment(createCompleteErrorReport());
      
      expect(comment).toMatch(/\n/);
      expect(comment.split('\n').length).toBeGreaterThan(10);
    });
  });
});