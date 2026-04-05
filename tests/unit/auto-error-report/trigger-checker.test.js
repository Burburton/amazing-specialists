const {
  shouldAutoReport,
  getSeverityLevel,
  isExpertPackRole,
  SEVERITY_LEVELS,
  EXPERT_PACK_ROLES
} = require('../../../lib/auto-error-report/trigger-checker');

describe('trigger-checker', () => {
  describe('shouldAutoReport', () => {
    test('returns false when disabled', () => {
      const errorReport = {
        error_classification: { severity: 'critical' }
      };
      const config = { enabled: false };
      
      const result = shouldAutoReport(errorReport, config);
      
      expect(result.should_trigger).toBe(false);
      expect(result.reason).toBe('disabled');
    });

    test('returns true when all conditions met', () => {
      const errorReport = {
        error_classification: { severity: 'high', error_type: 'EXECUTION_ERROR' },
        error_context: { role: 'developer' }
      };
      const config = {
        enabled: true,
        report_conditions: {
          severity_threshold: 'medium',
          only_expert_pack_errors: true,
          exclude_types: ['ENVIRONMENT_ISSUE']
        }
      };
      
      const result = shouldAutoReport(errorReport, config);
      
      expect(result.should_trigger).toBe(true);
    });

    test('returns false when severity below threshold', () => {
      const errorReport = {
        error_classification: { severity: 'low' }
      };
      const config = {
        enabled: true,
        report_conditions: {
          severity_threshold: 'medium'
        }
      };
      
      const result = shouldAutoReport(errorReport, config);
      
      expect(result.should_trigger).toBe(false);
      expect(result.reason).toBe('severity_below_threshold');
    });

    test('returns false when error type excluded', () => {
      const errorReport = {
        error_classification: { severity: 'high', error_type: 'ENVIRONMENT_ISSUE' }
      };
      const config = {
        enabled: true,
        report_conditions: {
          severity_threshold: 'medium',
          exclude_types: ['ENVIRONMENT_ISSUE']
        }
      };
      
      const result = shouldAutoReport(errorReport, config);
      
      expect(result.should_trigger).toBe(false);
      expect(result.reason).toBe('type_excluded');
    });

    test('returns false when not expert pack error', () => {
      const errorReport = {
        error_classification: { severity: 'high' },
        error_context: { role: 'external-tool' }
      };
      const config = {
        enabled: true,
        report_conditions: {
          severity_threshold: 'medium',
          only_expert_pack_errors: true
        }
      };
      
      const result = shouldAutoReport(errorReport, config);
      
      expect(result.should_trigger).toBe(false);
      expect(result.reason).toBe('not_expert_pack_error');
    });

    test('allows non-expert errors when flag is false', () => {
      const errorReport = {
        error_classification: { severity: 'high' },
        error_context: { role: 'external-tool' }
      };
      const config = {
        enabled: true,
        report_conditions: {
          severity_threshold: 'medium',
          only_expert_pack_errors: false
        }
      };
      
      const result = shouldAutoReport(errorReport, config);
      
      expect(result.should_trigger).toBe(true);
    });
  });

  describe('Severity Threshold Logic', () => {
    const config = {
      enabled: true,
      report_conditions: { severity_threshold: 'medium' }
    };

    test('critical passes medium threshold', () => {
      const result = shouldAutoReport(
        { error_classification: { severity: 'critical' } },
        config
      );
      expect(result.should_trigger).toBe(true);
    });

    test('high passes medium threshold', () => {
      const result = shouldAutoReport(
        { error_classification: { severity: 'high' } },
        config
      );
      expect(result.should_trigger).toBe(true);
    });

    test('medium passes medium threshold', () => {
      const result = shouldAutoReport(
        { error_classification: { severity: 'medium' } },
        config
      );
      expect(result.should_trigger).toBe(true);
    });

    test('low fails medium threshold', () => {
      const result = shouldAutoReport(
        { error_classification: { severity: 'low' } },
        config
      );
      expect(result.should_trigger).toBe(false);
    });
  });

  describe('All Severity Thresholds', () => {
    test('low threshold allows all', () => {
      const config = {
        enabled: true,
        report_conditions: { severity_threshold: 'low' }
      };
      
      expect(shouldAutoReport({ error_classification: { severity: 'low' } }, config).should_trigger).toBe(true);
      expect(shouldAutoReport({ error_classification: { severity: 'medium' } }, config).should_trigger).toBe(true);
      expect(shouldAutoReport({ error_classification: { severity: 'high' } }, config).should_trigger).toBe(true);
      expect(shouldAutoReport({ error_classification: { severity: 'critical' } }, config).should_trigger).toBe(true);
    });

    test('critical threshold only allows critical', () => {
      const config = {
        enabled: true,
        report_conditions: { severity_threshold: 'critical' }
      };
      
      expect(shouldAutoReport({ error_classification: { severity: 'low' } }, config).should_trigger).toBe(false);
      expect(shouldAutoReport({ error_classification: { severity: 'medium' } }, config).should_trigger).toBe(false);
      expect(shouldAutoReport({ error_classification: { severity: 'high' } }, config).should_trigger).toBe(false);
      expect(shouldAutoReport({ error_classification: { severity: 'critical' } }, config).should_trigger).toBe(true);
    });
  });

  describe('getSeverityLevel', () => {
    test('returns correct level for valid severity', () => {
      expect(getSeverityLevel('low')).toBe(0);
      expect(getSeverityLevel('medium')).toBe(1);
      expect(getSeverityLevel('high')).toBe(2);
      expect(getSeverityLevel('critical')).toBe(3);
    });

    test('returns low for unknown severity', () => {
      expect(getSeverityLevel('unknown')).toBe(0);
    });
  });

  describe('isExpertPackRole', () => {
    test('returns true for expert pack roles', () => {
      expect(isExpertPackRole('architect')).toBe(true);
      expect(isExpertPackRole('developer')).toBe(true);
      expect(isExpertPackRole('tester')).toBe(true);
      expect(isExpertPackRole('reviewer')).toBe(true);
      expect(isExpertPackRole('docs')).toBe(true);
      expect(isExpertPackRole('security')).toBe(true);
    });

    test('returns false for non-expert roles', () => {
      expect(isExpertPackRole('external')).toBe(false);
      expect(isExpertPackRole('user')).toBe(false);
      expect(isExpertPackRole('admin')).toBe(false);
    });
  });

  describe('Constants', () => {
    test('SEVERITY_LEVELS has correct mapping', () => {
      expect(SEVERITY_LEVELS.low).toBe(0);
      expect(SEVERITY_LEVELS.medium).toBe(1);
      expect(SEVERITY_LEVELS.high).toBe(2);
      expect(SEVERITY_LEVELS.critical).toBe(3);
    });

    test('EXPERT_PACK_ROLES has all 6 roles', () => {
      expect(EXPERT_PACK_ROLES).toHaveLength(6);
      expect(EXPERT_PACK_ROLES).toContain('architect');
      expect(EXPERT_PACK_ROLES).toContain('developer');
      expect(EXPERT_PACK_ROLES).toContain('tester');
      expect(EXPERT_PACK_ROLES).toContain('reviewer');
      expect(EXPERT_PACK_ROLES).toContain('docs');
      expect(EXPERT_PACK_ROLES).toContain('security');
    });
  });
});