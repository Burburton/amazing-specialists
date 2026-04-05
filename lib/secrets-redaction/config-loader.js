const fs = require('fs');
const path = require('path');
const { getDefaultPatterns } = require('./patterns');

const DEFAULT_CONFIG = {
  enabled: true,
  default_patterns: {
    github_token: true,
    github_app_token: true,
    aws_access_key: true,
    aws_secret_key: true,
    api_key_generic: true,
    password: true,
    secret_generic: true,
    private_key: true,
    connection_string: true,
    env_var_ref: true,
    bearer_token: true,
    jwt: true
  },
  custom_patterns: [],
  context_patterns: [],
  whitelist_fields: [],
  replacement_format: '[REDACTED:{type}]'
};

function hasReDoSRisk(pattern) {
  const dangerousPatterns = [
    /\([^)]*\+[^)]*\+\)/,
    /\([^)]*\*[^)]*\*\)/,
    /\.\*\.\*/,
    /\.\+\.\+/
  ];
  
  return dangerousPatterns.some(dangerous => dangerous.test(pattern));
}

function compileCustomPattern(customPattern) {
  try {
    const regex = new RegExp(customPattern.pattern, 'g');
    
    return {
      name: customPattern.name,
      type: customPattern.name,
      pattern: regex,
      description: customPattern.description || `Custom pattern: ${customPattern.name}`,
      severity: customPattern.severity || 'high',
      examples: []
    };
  } catch (error) {
    console.warn(`[secrets-redaction] Invalid regex pattern "${customPattern.name}": ${error.message}`);
    return null;
  }
}

function mergePatterns(defaultPatterns, customPatterns) {
  const compiledCustoms = customPatterns
    .map(compileCustomPattern)
    .filter(p => p !== null);
  
  const defaultNames = new Set(defaultPatterns.map(p => p.name));
  
  const validCustoms = compiledCustoms.filter(p => {
    if (defaultNames.has(p.name)) {
      console.warn(`[secrets-redaction] Custom pattern "${p.name}" conflicts with default pattern name`);
      return false;
    }
    return true;
  });
  
  return [...defaultPatterns, ...validCustoms];
}

function validateConfig(config) {
  const errors = [];
  
  if (config.enabled === undefined) {
    errors.push('Missing required field: enabled');
  }
  
  if (!config.default_patterns || typeof config.default_patterns !== 'object') {
    errors.push('Missing required field: default_patterns');
  } else {
    const enabledCount = Object.values(config.default_patterns).filter(v => v === true).length;
    if (enabledCount === 0 && config.enabled === true) {
      errors.push('BR-003: At least one default pattern must be enabled when redaction is enabled');
    }
  }
  
  if (config.custom_patterns && Array.isArray(config.custom_patterns)) {
    const names = new Set();
    const defaultNames = new Set(getDefaultPatterns().map(p => p.name));
    
    for (const custom of config.custom_patterns) {
      if (!custom.name) {
        errors.push('Custom pattern missing required field: name');
      } else if (names.has(custom.name)) {
        errors.push(`BR-001: Duplicate custom pattern name: ${custom.name}`);
      } else if (defaultNames.has(custom.name)) {
        errors.push(`BR-001: Custom pattern "${custom.name}" conflicts with default pattern name`);
      }
      
      if (!custom.pattern) {
        errors.push(`Custom pattern "${custom.name}" missing required field: pattern`);
      } else if (hasReDoSRisk(custom.pattern)) {
        errors.push(`BR-004: Custom pattern "${custom.name}" has potential ReDoS risk`);
      }
      
      if (!custom.replacement) {
        errors.push(`Custom pattern "${custom.name}" missing required field: replacement`);
      }
      
      names.add(custom.name);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function loadConfig(projectRoot) {
  const root = projectRoot || process.cwd();
  const configPath = path.join(root, '.opencode', 'secrets-redaction.json');
  
  if (!fs.existsSync(configPath)) {
    return {
      success: true,
      config: DEFAULT_CONFIG,
      error: 'config_file_not_found'
    };
  }
  
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);
    
    const validation = validateConfig(config);
    
    if (!validation.valid) {
      console.warn(`[secrets-redaction] Config validation failed: ${validation.errors.join(', ')}`);
      return {
        success: false,
        config: DEFAULT_CONFIG,
        error: `validation_failed: ${validation.errors.join('; ')}`
      };
    }
    
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...config,
      default_patterns: {
        ...DEFAULT_CONFIG.default_patterns,
        ...config.default_patterns
      }
    };
    
    return {
      success: true,
      config: mergedConfig
    };
  } catch (error) {
    console.warn(`[secrets-redaction] Config load failed: ${error.message}`);
    return {
      success: false,
      config: DEFAULT_CONFIG,
      error: error.message
    };
  }
}

module.exports = {
  loadConfig,
  mergePatterns,
  validateConfig,
  DEFAULT_CONFIG
};