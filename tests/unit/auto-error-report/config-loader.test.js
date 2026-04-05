const {
  loadConfig,
  validateConfigFile,
  getDefaultConfig,
  DEFAULT_CONFIG,
  resetSchemaCache,
  EMBEDDED_SCHEMA
} = require('../../../lib/auto-error-report/config-loader');
const fs = require('fs');
const path = require('path');

jest.mock('fs');

describe('config-loader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSchemaCache();
  });

  describe('loadConfig', () => {
    test('returns default config when file not exists', () => {
      fs.existsSync.mockReturnValue(false);
      
      const result = loadConfig();
      
      expect(result.success).toBe(true);
      expect(result.default_used).toBe(true);
      expect(result.config.enabled).toBe(false);
    });

    test('returns valid config when file exists and validates', () => {
      const validConfig = {
        enabled: true,
        github_token_env: 'GITHUB_TOKEN',
        target_repository: {
          owner: 'Burburton',
          repo: 'amazing-specialists'
        },
        report_conditions: {
          severity_threshold: 'medium'
        },
        rate_limit: {
          max_per_hour: 5,
          max_per_day: 20,
          dedup_window_minutes: 60
        },
        privacy: {
          include_stack_trace: true,
          redact_secrets: true
        }
      };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify(EMBEDDED_SCHEMA);
        }
        return JSON.stringify(validConfig);
      });
      
      const result = loadConfig();
      
      expect(result.success).toBe(true);
      expect(result.default_used).toBe(false);
      expect(result.config.enabled).toBe(true);
      expect(result.config.target_repository.owner).toBe('Burburton');
    });

    test('returns error when JSON parse fails', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify(EMBEDDED_SCHEMA);
        }
        return 'invalid json {{{';
      });
      
      const result = loadConfig();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('returns error when missing required fields', () => {
      const invalidConfig = {
        enabled: true,
        github_token_env: 'GITHUB_TOKEN'
      };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify(EMBEDDED_SCHEMA);
        }
        return JSON.stringify(invalidConfig);
      });
      
      const result = loadConfig();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('returns error when target_repository missing owner', () => {
      const invalidConfig = {
        enabled: true,
        github_token_env: 'GITHUB_TOKEN',
        target_repository: {
          repo: 'amazing-specialists'
        },
        report_conditions: {
          severity_threshold: 'medium'
        },
        rate_limit: {
          max_per_hour: 5,
          max_per_day: 20,
          dedup_window_minutes: 60
        },
        privacy: {
          include_stack_trace: true,
          redact_secrets: true
        }
      };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify(EMBEDDED_SCHEMA);
        }
        return JSON.stringify(invalidConfig);
      });
      
      const result = loadConfig();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('returns error when severity_threshold invalid', () => {
      const invalidConfig = {
        enabled: true,
        github_token_env: 'GITHUB_TOKEN',
        target_repository: {
          owner: 'Burburton',
          repo: 'amazing-specialists'
        },
        report_conditions: {
          severity_threshold: 'invalid-level'
        },
        rate_limit: {
          max_per_hour: 5,
          max_per_day: 20,
          dedup_window_minutes: 60
        },
        privacy: {
          include_stack_trace: true,
          redact_secrets: true
        }
      };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify(EMBEDDED_SCHEMA);
        }
        return JSON.stringify(invalidConfig);
      });
      
      const result = loadConfig();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('returns error when rate_limit exceeds bounds', () => {
      const invalidConfig = {
        enabled: true,
        github_token_env: 'GITHUB_TOKEN',
        target_repository: {
          owner: 'Burburton',
          repo: 'amazing-specialists'
        },
        report_conditions: {
          severity_threshold: 'medium'
        },
        rate_limit: {
          max_per_hour: 500,
          max_per_day: 20,
          dedup_window_minutes: 60
        },
        privacy: {
          include_stack_trace: true,
          redact_secrets: true
        }
      };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify(EMBEDDED_SCHEMA);
        }
        return JSON.stringify(invalidConfig);
      });
      
      const result = loadConfig();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateConfigFile', () => {
    test('returns valid when config passes validation', () => {
      const validConfig = {
        enabled: true,
        github_token_env: 'GITHUB_TOKEN',
        target_repository: {
          owner: 'Burburton',
          repo: 'amazing-specialists'
        },
        report_conditions: {
          severity_threshold: 'medium'
        },
        rate_limit: {
          max_per_hour: 5,
          max_per_day: 20,
          dedup_window_minutes: 60
        },
        privacy: {
          include_stack_trace: true,
          redact_secrets: true
        }
      };
      
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify(EMBEDDED_SCHEMA);
        }
        return JSON.stringify(validConfig);
      });
      
      const result = validateConfigFile('/path/to/config.json');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('returns invalid with errors when config fails', () => {
      const invalidConfig = {
        enabled: true
      };
      
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('schema')) {
          return JSON.stringify(EMBEDDED_SCHEMA);
        }
        return JSON.stringify(invalidConfig);
      });
      
      const result = validateConfigFile('/path/to/config.json');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getDefaultConfig', () => {
    test('returns default config with enabled false', () => {
      const config = getDefaultConfig();
      
      expect(config.enabled).toBe(false);
      expect(config.github_token_env).toBe('GITHUB_TOKEN');
      expect(config.report_conditions.severity_threshold).toBe('medium');
      expect(config.rate_limit.max_per_hour).toBe(5);
    });

    test('returns a copy not reference', () => {
      const config1 = getDefaultConfig();
      const config2 = getDefaultConfig();
      
      config1.enabled = true;
      
      expect(config2.enabled).toBe(false);
    });
  });

  describe('DEFAULT_CONFIG', () => {
    test('has all required fields', () => {
      expect(DEFAULT_CONFIG.enabled).toBeDefined();
      expect(DEFAULT_CONFIG.github_token_env).toBeDefined();
      expect(DEFAULT_CONFIG.target_repository).toBeDefined();
      expect(DEFAULT_CONFIG.report_conditions).toBeDefined();
      expect(DEFAULT_CONFIG.rate_limit).toBeDefined();
      expect(DEFAULT_CONFIG.privacy).toBeDefined();
    });

    test('enabled is false by default (SEC-003)', () => {
      expect(DEFAULT_CONFIG.enabled).toBe(false);
    });
  });
});