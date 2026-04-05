const {
  loadConfig,
  validateConfig,
  mergePatterns,
  DEFAULT_CONFIG
} = require('../../../lib/secrets-redaction/config-loader');
const { getDefaultPatterns, clearPatternCache } = require('../../../lib/secrets-redaction/patterns');
const { clearCustomPatternCache } = require('../../../lib/secrets-redaction/scrubber');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Config Loader', () => {
  let tempDir;
  let originalCwd;
  
  beforeEach(() => {
    clearPatternCache();
    clearCustomPatternCache();
    
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'secrets-redaction-test-'));
    originalCwd = process.cwd();
  });
  
  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
  
  describe('loadConfig', () => {
    test('returns default config when config file not found', () => {
      process.chdir(tempDir);
      
      const result = loadConfig();
      
      expect(result.success).toBe(true);
      expect(result.error).toBe('config_file_not_found');
      expect(result.config).toEqual(DEFAULT_CONFIG);
    });
    
    test('loads valid config file', () => {
      const configDir = path.join(tempDir, '.opencode');
      fs.mkdirSync(configDir, { recursive: true });
      
      const configContent = {
        enabled: true,
        default_patterns: {
          github_token: true,
          password: true
        }
      };
      
      fs.writeFileSync(
        path.join(configDir, 'secrets-redaction.json'),
        JSON.stringify(configContent)
      );
      
      process.chdir(tempDir);
      
      const result = loadConfig();
      
      expect(result.success).toBe(true);
      expect(result.config.enabled).toBe(true);
      expect(result.config.default_patterns.github_token).toBe(true);
      expect(result.config.default_patterns.password).toBe(true);
    });
    
    test('returns error for invalid JSON', () => {
      const configDir = path.join(tempDir, '.opencode');
      fs.mkdirSync(configDir, { recursive: true });
      
      fs.writeFileSync(
        path.join(configDir, 'secrets-redaction.json'),
        '{ invalid json }'
      );
      
      process.chdir(tempDir);
      
      const result = loadConfig();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
    
    test('returns error for missing required field enabled', () => {
      const configDir = path.join(tempDir, '.opencode');
      fs.mkdirSync(configDir, { recursive: true });
      
      const configContent = {
        default_patterns: {
          github_token: true
        }
      };
      
      fs.writeFileSync(
        path.join(configDir, 'secrets-redaction.json'),
        JSON.stringify(configContent)
      );
      
      process.chdir(tempDir);
      
      const result = loadConfig();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required field: enabled');
    });
    
    test('returns error for missing required field default_patterns', () => {
      const configDir = path.join(tempDir, '.opencode');
      fs.mkdirSync(configDir, { recursive: true });
      
      const configContent = {
        enabled: true
      };
      
      fs.writeFileSync(
        path.join(configDir, 'secrets-redaction.json'),
        JSON.stringify(configContent)
      );
      
      process.chdir(tempDir);
      
      const result = loadConfig();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required field: default_patterns');
    });
    
    test('merges partial config with defaults', () => {
      const configDir = path.join(tempDir, '.opencode');
      fs.mkdirSync(configDir, { recursive: true });
      
      const configContent = {
        enabled: true,
        default_patterns: {
          github_token: false,
          password: true,
          aws_access_key: true
        },
        whitelist_fields: ['safe_field']
      };
      
      fs.writeFileSync(
        path.join(configDir, 'secrets-redaction.json'),
        JSON.stringify(configContent)
      );
      
      process.chdir(tempDir);
      
      const result = loadConfig();
      
      expect(result.success).toBe(true);
      expect(result.config.default_patterns.github_token).toBe(false);
      expect(result.config.default_patterns.password).toBe(true);
      expect(result.config.whitelist_fields).toEqual(['safe_field']);
    });
    
    test('loads custom patterns', () => {
      const configDir = path.join(tempDir, '.opencode');
      fs.mkdirSync(configDir, { recursive: true });
      
      const configContent = {
        enabled: true,
        default_patterns: {
          github_token: true
        },
        custom_patterns: [
          {
            name: 'company_key',
            pattern: 'MYCOMP-[a-zA-Z0-9]{32}',
            replacement: '[REDACTED:company]',
            severity: 'critical'
          }
        ]
      };
      
      fs.writeFileSync(
        path.join(configDir, 'secrets-redaction.json'),
        JSON.stringify(configContent)
      );
      
      process.chdir(tempDir);
      
      const result = loadConfig();
      
      expect(result.success).toBe(true);
      expect(result.config.custom_patterns).toHaveLength(1);
      expect(result.config.custom_patterns[0].name).toBe('company_key');
    });
    
    test('loads context patterns', () => {
      const configDir = path.join(tempDir, '.opencode');
      fs.mkdirSync(configDir, { recursive: true });
      
      const configContent = {
        enabled: true,
        default_patterns: {},
        context_patterns: [
          {
            key_pattern: 'internal_token',
            value_pattern: '.*',
            replacement: '[REDACTED:internal]'
          }
        ]
      };
      
      fs.writeFileSync(
        path.join(configDir, 'secrets-redaction.json'),
        JSON.stringify(configContent)
      );
      
      process.chdir(tempDir);
      
      const result = loadConfig();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one default pattern must be enabled');
    });
    
    test('supports projectRoot parameter', () => {
      const configDir = path.join(tempDir, '.opencode');
      fs.mkdirSync(configDir, { recursive: true });
      
      const configContent = {
        enabled: false,
        default_patterns: {}
      };
      
      fs.writeFileSync(
        path.join(configDir, 'secrets-redaction.json'),
        JSON.stringify(configContent)
      );
      
      const result = loadConfig(tempDir);
      
      expect(result.success).toBe(true);
      expect(result.config.enabled).toBe(false);
    });
  });
  
  describe('validateConfig', () => {
    test('returns valid for minimal valid config', () => {
      const config = {
        enabled: true,
        default_patterns: {
          github_token: true
        }
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('returns invalid for missing enabled', () => {
      const config = {
        default_patterns: {
          github_token: true
        }
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: enabled');
    });
    
    test('returns invalid for missing default_patterns', () => {
      const config = {
        enabled: true
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: default_patterns');
    });
    
    test('BR-003: returns invalid when no patterns enabled but redaction enabled', () => {
      const config = {
        enabled: true,
        default_patterns: {
          github_token: false,
          password: false
        }
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('BR-003: At least one default pattern must be enabled when redaction is enabled');
    });
    
    test('allows disabled with no patterns enabled', () => {
      const config = {
        enabled: false,
        default_patterns: {}
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(true);
    });
    
    test('BR-001: validates custom pattern name uniqueness', () => {
      const config = {
        enabled: true,
        default_patterns: { github_token: true },
        custom_patterns: [
          { name: 'duplicate', pattern: 'AAA', replacement: '[R]' },
          { name: 'duplicate', pattern: 'BBB', replacement: '[R]' }
        ]
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('BR-001: Duplicate custom pattern name: duplicate');
    });
    
    test('BR-001: validates custom pattern does not conflict with default', () => {
      const config = {
        enabled: true,
        default_patterns: { github_token: true },
        custom_patterns: [
          { name: 'github_token', pattern: 'AAA', replacement: '[R]' }
        ]
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('BR-001: Custom pattern "github_token" conflicts with default pattern name');
    });
    
    test('validates custom pattern missing name', () => {
      const config = {
        enabled: true,
        default_patterns: { github_token: true },
        custom_patterns: [
          { pattern: 'AAA', replacement: '[R]' }
        ]
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Custom pattern missing required field: name');
    });
    
    test('validates custom pattern missing pattern', () => {
      const config = {
        enabled: true,
        default_patterns: { github_token: true },
        custom_patterns: [
          { name: 'my_pattern', replacement: '[R]' }
        ]
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Custom pattern "my_pattern" missing required field: pattern');
    });
    
    test('validates custom pattern missing replacement', () => {
      const config = {
        enabled: true,
        default_patterns: { github_token: true },
        custom_patterns: [
          { name: 'my_pattern', pattern: 'AAA' }
        ]
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Custom pattern "my_pattern" missing required field: replacement');
    });
    
    test('BR-004: detects ReDoS risk patterns', () => {
      const config = {
        enabled: true,
        default_patterns: { github_token: true },
        custom_patterns: [
          { name: 'dangerous', pattern: '(a+b+)+', replacement: '[R]' }
        ]
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('BR-004: Custom pattern "dangerous" has potential ReDoS risk');
    });
    
    test('BR-004: detects .*.* pattern as ReDoS risk', () => {
      const config = {
        enabled: true,
        default_patterns: { github_token: true },
        custom_patterns: [
          { name: 'dangerous_star', pattern: '.*.*', replacement: '[R]' }
        ]
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('BR-004: Custom pattern "dangerous_star" has potential ReDoS risk');
    });
    
    test('accepts safe custom patterns', () => {
      const config = {
        enabled: true,
        default_patterns: { github_token: true },
        custom_patterns: [
          { name: 'safe_pattern', pattern: 'MYCOMP-[a-zA-Z0-9]{32}', replacement: '[R]' }
        ]
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(true);
    });
    
    test('validates severity enum for custom patterns', () => {
      const config = {
        enabled: true,
        default_patterns: { github_token: true },
        custom_patterns: [
          { name: 'test', pattern: 'AAA', replacement: '[R]', severity: 'critical' }
        ]
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
  
  describe('mergePatterns', () => {
    test('merges default patterns with valid custom patterns', () => {
      const defaultPatterns = getDefaultPatterns();
      const customPatterns = [
        {
          name: 'custom_key',
          pattern: 'CUSTOM-[0-9]+',
          replacement: '[REDACTED:custom]',
          severity: 'high'
        }
      ];
      
      const result = mergePatterns(defaultPatterns, customPatterns);
      
      expect(result.length).toBe(13);
      expect(result.find(p => p.name === 'custom_key')).toBeDefined();
    });
    
    test('skips custom patterns with invalid regex', () => {
      const defaultPatterns = getDefaultPatterns();
      const customPatterns = [
        { name: 'valid', pattern: 'VALID-[0-9]+', replacement: '[R]' },
        { name: 'invalid', pattern: '[invalid(regex', replacement: '[R]' }
      ];
      
      const result = mergePatterns(defaultPatterns, customPatterns);
      
      expect(result.find(p => p.name === 'valid')).toBeDefined();
      expect(result.find(p => p.name === 'invalid')).toBeUndefined();
    });
    
    test('skips custom patterns conflicting with default names', () => {
      const defaultPatterns = getDefaultPatterns();
      const customPatterns = [
        { name: 'github_token', pattern: 'XXX', replacement: '[R]' }
      ];
      
      const result = mergePatterns(defaultPatterns, customPatterns);
      
      expect(result.filter(p => p.name === 'github_token')).toHaveLength(1);
    });
    
    test('returns only default patterns when custom patterns empty', () => {
      const defaultPatterns = getDefaultPatterns();
      const result = mergePatterns(defaultPatterns, []);
      
      expect(result.length).toBe(defaultPatterns.length);
    });
    
    test('compiled custom patterns have correct properties', () => {
      const defaultPatterns = getDefaultPatterns();
      const customPatterns = [
        {
          name: 'company_api',
          pattern: 'MYCOMP-[a-zA-Z]{16}',
          replacement: '[REDACTED:company]',
          severity: 'critical',
          description: 'Company API Key'
        }
      ];
      
      const result = mergePatterns(defaultPatterns, customPatterns);
      const customPattern = result.find(p => p.name === 'company_api');
      
      expect(customPattern.name).toBe('company_api');
      expect(customPattern.type).toBe('company_api');
      expect(customPattern.pattern).toBeInstanceOf(RegExp);
      expect(customPattern.severity).toBe('critical');
      expect(customPattern.description).toBe('Company API Key');
    });
    
    test('uses default severity for custom patterns', () => {
      const defaultPatterns = getDefaultPatterns();
      const customPatterns = [
        { name: 'no_severity', pattern: 'XXX', replacement: '[R]' }
      ];
      
      const result = mergePatterns(defaultPatterns, customPatterns);
      const pattern = result.find(p => p.name === 'no_severity');
      
      expect(pattern.severity).toBe('high');
    });
    
    test('uses generated description when not provided', () => {
      const defaultPatterns = getDefaultPatterns();
      const customPatterns = [
        { name: 'auto_desc', pattern: 'YYY', replacement: '[R]' }
      ];
      
      const result = mergePatterns(defaultPatterns, customPatterns);
      const pattern = result.find(p => p.name === 'auto_desc');
      
      expect(pattern.description).toBe('Custom pattern: auto_desc');
    });
  });
  
  describe('DEFAULT_CONFIG', () => {
    test('has enabled: true', () => {
      expect(DEFAULT_CONFIG.enabled).toBe(true);
    });
    
    test('has all 12 default patterns enabled', () => {
      const enabledCount = Object.values(DEFAULT_CONFIG.default_patterns).filter(v => v === true).length;
      expect(enabledCount).toBe(12);
    });
    
    test('has empty custom_patterns', () => {
      expect(DEFAULT_CONFIG.custom_patterns).toEqual([]);
    });
    
    test('has empty context_patterns', () => {
      expect(DEFAULT_CONFIG.context_patterns).toEqual([]);
    });
    
    test('has empty whitelist_fields', () => {
      expect(DEFAULT_CONFIG.whitelist_fields).toEqual([]);
    });
    
    test('has default replacement_format', () => {
      expect(DEFAULT_CONFIG.replacement_format).toBe('[REDACTED:{type}]');
    });
  });
});