const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const CONFIG_FILE_NAME = 'auto-report.json';
const SCHEMA_FILE_NAME = 'auto-report-config.schema.json';
const DEFAULT_CONFIG_DIR = '.opencode';

const DEFAULT_CONFIG = {
  enabled: false,
  github_token_env: 'GITHUB_TOKEN',
  target_repository: {
    owner: '',
    repo: ''
  },
  report_conditions: {
    severity_threshold: 'medium',
    only_expert_pack_errors: true,
    exclude_types: ['ENVIRONMENT_ISSUE']
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

let cachedSchema = null;

const EMBEDDED_SCHEMA = {
  "$id": "auto-report-config.schema.json",
  "title": "Auto Error Report Configuration",
  "type": "object",
  "required": ["enabled", "github_token_env", "target_repository", "report_conditions", "rate_limit", "privacy"],
  "properties": {
    "enabled": { "type": "boolean", "default": false },
    "github_token_env": { "type": "string", "default": "GITHUB_TOKEN" },
    "target_repository": {
      "type": "object",
      "required": ["owner", "repo"],
      "properties": {
        "owner": { "type": "string", "minLength": 1 },
        "repo": { "type": "string", "minLength": 1 }
      }
    },
    "report_conditions": {
      "type": "object",
      "required": ["severity_threshold"],
      "properties": {
        "severity_threshold": { "type": "string", "enum": ["low", "medium", "high", "critical"], "default": "medium" },
        "only_expert_pack_errors": { "type": "boolean", "default": true },
        "exclude_types": {
          "type": "array",
          "items": { "type": "string", "enum": ["INPUT_INVALID", "CONSTRAINT_VIOLATION", "EXECUTION_ERROR", "VERIFICATION_FAILURE", "ENVIRONMENT_ISSUE", "DEPENDENCY_BLOCKER", "AMBIGUOUS_GOAL", "SCOPE_CREEP_DETECTED"] },
          "default": ["ENVIRONMENT_ISSUE"]
        }
      }
    },
    "rate_limit": {
      "type": "object",
      "required": ["max_per_hour", "max_per_day", "dedup_window_minutes"],
      "properties": {
        "max_per_hour": { "type": "integer", "minimum": 1, "maximum": 100, "default": 5 },
        "max_per_day": { "type": "integer", "minimum": 1, "maximum": 500, "default": 20 },
        "dedup_window_minutes": { "type": "integer", "minimum": 1, "maximum": 1440, "default": 60 }
      }
    },
    "privacy": {
      "type": "object",
      "required": ["include_stack_trace", "redact_secrets"],
      "properties": {
        "include_stack_trace": { "type": "boolean", "default": true },
        "redact_secrets": { "type": "boolean", "default": true }
      }
    }
  }
};

function loadSchema() {
  if (cachedSchema) {
    return cachedSchema;
  }
  
  const schemaPath = path.resolve(DEFAULT_CONFIG_DIR, SCHEMA_FILE_NAME);
  
  try {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    cachedSchema = JSON.parse(schemaContent);
    return cachedSchema;
  } catch (err) {
    cachedSchema = EMBEDDED_SCHEMA;
    return cachedSchema;
  }
}

function createValidator() {
  const ajv = new Ajv({ 
    allErrors: true,
    useDefaults: true,
    strict: false
  });
  addFormats(ajv);
  
  const schema = loadSchema();
  
  return ajv.compile(schema);
}

function loadConfig(configDir = DEFAULT_CONFIG_DIR) {
  const configPath = path.resolve(configDir, CONFIG_FILE_NAME);
  
  if (!fs.existsSync(configPath)) {
    return {
      success: true,
      config: { ...DEFAULT_CONFIG },
      default_used: true
    };
  }
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    const validator = createValidator();
    const valid = validator(config);
    
    if (!valid) {
      const errors = validator.errors.map(e => 
        `${e.instancePath || '/'}: ${e.message}`
      ).join('; ');
      
      console.warn(`[auto-error-report] Config validation failed: ${errors}`);
      
      return {
        success: false,
        config: null,
        error: errors,
        default_used: false
      };
    }
    
    return {
      success: true,
      config: config,
      default_used: false
    };
  } catch (err) {
    console.warn(`[auto-error-report] Config load failed: ${err.message}`);
    
    return {
      success: false,
      config: null,
      error: err.message,
      default_used: false
    };
  }
}

function validateConfigFile(configPath) {
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    const validator = createValidator();
    const valid = validator(config);
    
    if (!valid) {
      return {
        valid: false,
        errors: validator.errors.map(e => 
          `${e.instancePath || '/'}: ${e.message}`
        )
      };
    }
    
    return {
      valid: true,
      errors: []
    };
  } catch (err) {
    return {
      valid: false,
      errors: [err.message]
    };
  }
}

function getDefaultConfig() {
  return { ...DEFAULT_CONFIG };
}

function resetSchemaCache() {
  cachedSchema = null;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--validate')) {
    const configIndex = args.indexOf('--config');
    const configPath = configIndex >= 0 
      ? args[configIndex + 1] 
      : path.resolve(DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);
    
    if (!fs.existsSync(configPath)) {
      console.log(`Config file not found: ${configPath}`);
      console.log('Default config would be used (enabled: false)');
      process.exit(0);
    }
    
    const result = validateConfigFile(configPath);
    
    if (result.valid) {
      console.log('✓ Config validation passed');
      process.exit(0);
    } else {
      console.log('✗ Config validation failed:');
      result.errors.forEach(e => console.log(`  - ${e}`));
      process.exit(1);
    }
  } else {
    const result = loadConfig();
    console.log(JSON.stringify(result, null, 2));
  }
}

module.exports = {
  loadConfig,
  validateConfigFile,
  getDefaultConfig,
  loadSchema,
  resetSchemaCache,
  CONFIG_FILE_NAME,
  SCHEMA_FILE_NAME,
  DEFAULT_CONFIG_DIR,
  DEFAULT_CONFIG,
  EMBEDDED_SCHEMA
};