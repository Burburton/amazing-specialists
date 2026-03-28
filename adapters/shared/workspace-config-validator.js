/**
 * Workspace Configuration Validator
 * 
 * Validates workspace config against workspace-configuration.schema.json
 * and checks profile-workspace compatibility.
 * 
 * @module adapters/shared/workspace-config-validator
 */

const path = require('path');
const fs = require('fs');

const DEFAULT_SCHEMA_PATH = path.resolve(__dirname, '../schemas/workspace-configuration.schema.json');
const DEFAULT_MAPPING_PATH = path.resolve(__dirname, './profile-workspace-mapping.json');

const VALID_WORKSPACE_TYPES = ['local_repo', 'github_repo', 'external_system'];
const VALID_PROFILES = ['minimal', 'full'];
const VALID_CHANNELS = ['console', 'github_comment', 'api'];
const VALID_STRATEGIES = ['interactive', 'auto', 'disabled'];
const VALID_ROLES = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];

/**
 * @typedef {Object} ValidationError
 * @property {string} field - Field that has the error
 * @property {string} message - Error message
 * @property {string} severity - Error severity: 'error', 'warning', 'info'
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether config is valid
 * @property {Array<ValidationError>} errors - Validation errors
 * @property {Object|null} normalizedConfig - Normalized config if valid
 * @property {Object} compatibility - Profile-workspace compatibility info
 */

/**
 * Load workspace configuration schema
 * 
 * @param {string} schemaPath - Path to schema file
 * @returns {Object} Schema object
 */
function loadSchema(schemaPath = DEFAULT_SCHEMA_PATH) {
  try {
    const content = fs.readFileSync(schemaPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load schema from ${schemaPath}: ${error.message}`);
  }
}

/**
 * Load profile-workspace mapping
 * 
 * @param {string} mappingPath - Path to mapping file
 * @returns {Object} Mapping object
 */
function loadMapping(mappingPath = DEFAULT_MAPPING_PATH) {
  try {
    const content = fs.readFileSync(mappingPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load mapping from ${mappingPath}: ${error.message}`);
  }
}

/**
 * Validate required fields in config
 * 
 * @param {Object} config - Config to validate
 * @param {Object} schema - Schema to check against
 * @returns {Array<ValidationError>} Validation errors
 */
function validateRequiredFields(config, schema) {
  const errors = [];
  
  if (!schema.required) {
    return errors;
  }
  
  for (const field of schema.required) {
    if (!config || config[field] === undefined || config[field] === null) {
      errors.push({
        field: field,
        message: `Required field '${field}' is missing`,
        severity: 'error'
      });
    }
  }
  
  return errors;
}

/**
 * Validate field type matches schema
 * 
 * @param {string} field - Field name
 * @param {*} value - Field value
 * @param {Object} propertySchema - Schema for this property
 * @returns {Array<ValidationError>} Validation errors
 */
function validateFieldType(field, value, propertySchema) {
  const errors = [];
  
  if (value === undefined || value === null) {
    return errors;
  }
  
  if (propertySchema.type === 'string') {
    if (typeof value !== 'string') {
      errors.push({
        field: field,
        message: `Field '${field}' must be a string, got ${typeof value}`,
        severity: 'error'
      });
    }
    
    if (propertySchema.enum && !propertySchema.enum.includes(value)) {
      errors.push({
        field: field,
        message: `Field '${field}' must be one of: ${propertySchema.enum.join(', ')}, got '${value}'`,
        severity: 'error'
      });
    }
  }
  
  if (propertySchema.type === 'boolean') {
    if (typeof value !== 'boolean') {
      errors.push({
        field: field,
        message: `Field '${field}' must be a boolean, got ${typeof value}`,
        severity: 'error'
      });
    }
  }
  
  if (propertySchema.type === 'integer') {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      errors.push({
        field: field,
        message: `Field '${field}' must be an integer, got ${typeof value}`,
        severity: 'error'
      });
    }
    
    if (propertySchema.minimum !== undefined && value < propertySchema.minimum) {
      errors.push({
        field: field,
        message: `Field '${field}' must be >= ${propertySchema.minimum}, got ${value}`,
        severity: 'error'
      });
    }
    
    if (propertySchema.maximum !== undefined && value > propertySchema.maximum) {
      errors.push({
        field: field,
        message: `Field '${field}' must be <= ${propertySchema.maximum}, got ${value}`,
        severity: 'error'
      });
    }
  }
  
  if (propertySchema.type === 'object') {
    if (typeof value !== 'object' || Array.isArray(value)) {
      errors.push({
        field: field,
        message: `Field '${field}' must be an object, got ${typeof value}`,
        severity: 'error'
      });
    }
  }
  
  if (propertySchema.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push({
        field: field,
        message: `Field '${field}' must be an array, got ${typeof value}`,
        severity: 'error'
      });
    }
  }
  
  return errors;
}

/**
 * Validate nested object fields
 * 
 * @param {Object} config - Config object
 * @param {Object} schema - Schema properties
 * @param {string} prefix - Field path prefix
 * @returns {Array<ValidationError>} Validation errors
 */
function validateNestedFields(config, schema, prefix = '') {
  const errors = [];
  
  if (!config || !schema) {
    return errors;
  }
  
  for (const [field, propertySchema] of Object.entries(schema)) {
    const fullPath = prefix ? `${prefix}.${field}` : field;
    const value = config[field];
    
    errors.push(...validateFieldType(fullPath, value, propertySchema));
    
    if (propertySchema.type === 'object' && propertySchema.properties && value) {
      const nestedRequired = propertySchema.required || [];
      for (const reqField of nestedRequired) {
        if (value[reqField] === undefined || value[reqField] === null) {
          errors.push({
            field: `${fullPath}.${reqField}`,
            message: `Required field '${reqField}' is missing in '${fullPath}'`,
            severity: 'error'
          });
        }
      }
      errors.push(...validateNestedFields(value, propertySchema.properties, fullPath));
    }
  }
  
  return errors;
}

/**
 * Validate workspace_type field
 * 
 * @param {string} workspaceType - Workspace type value
 * @returns {Array<ValidationError>} Validation errors
 */
function validateWorkspaceType(workspaceType) {
  const errors = [];
  
  if (!workspaceType) {
    errors.push({
      field: 'workspace_type',
      message: 'workspace_type is required',
      severity: 'error'
    });
    return errors;
  }
  
  const normalized = workspaceType.toLowerCase().trim();
  
  if (!VALID_WORKSPACE_TYPES.includes(normalized)) {
    errors.push({
      field: 'workspace_type',
      message: `Invalid workspace_type '${workspaceType}'. Valid types: ${VALID_WORKSPACE_TYPES.join(', ')}`,
      severity: 'error'
    });
  }
  
  return errors;
}

/**
 * Validate profile field
 * 
 * @param {string} profile - Profile value
 * @returns {Array<ValidationError>} Validation errors
 */
function validateProfile(profile) {
  const errors = [];
  
  if (!profile) {
    errors.push({
      field: 'profile',
      message: 'profile is required',
      severity: 'error'
    });
    return errors;
  }
  
  const normalized = profile.toLowerCase().trim();
  
  if (!VALID_PROFILES.includes(normalized)) {
    errors.push({
      field: 'profile',
      message: `Invalid profile '${profile}'. Valid profiles: ${VALID_PROFILES.join(', ')}`,
      severity: 'error'
    });
  }
  
  return errors;
}

/**
 * Check profile-workspace compatibility
 * 
 * @param {string} profile - Profile name
 * @param {string} workspaceType - Workspace type
 * @param {string} [mappingPath] - Optional path to mapping file
 * @returns {Object} Compatibility check result
 */
function checkProfileWorkspaceCompatibility(profile, workspaceType, mappingPath = DEFAULT_MAPPING_PATH) {
  const mapping = loadMapping(mappingPath);
  
  const result = {
    isCompatible: true,
    profile: profile,
    workspaceType: workspaceType,
    errors: [],
    details: null
  };
  
  const normalizedProfile = profile ? profile.toLowerCase().trim() : null;
  const normalizedWorkspace = workspaceType ? workspaceType.toLowerCase().trim() : null;
  
  if (!normalizedProfile) {
    result.isCompatible = false;
    result.errors.push('Profile is required for compatibility check');
    return result;
  }
  
  if (!normalizedWorkspace) {
    result.isCompatible = false;
    result.errors.push('Workspace type is required for compatibility check');
    return result;
  }
  
  const profileConfig = mapping.profiles && mapping.profiles[normalizedProfile];
  
  if (!profileConfig) {
    result.isCompatible = false;
    result.errors.push(`Profile '${profile}' not found in mapping`);
    return result;
  }
  
  const compatibleWorkspaces = profileConfig.compatible_workspaces || [];
  
  if (!compatibleWorkspaces.includes(normalizedWorkspace)) {
    result.isCompatible = false;
    result.errors.push(`Profile '${profile}' is not compatible with workspace type '${workspaceType}'`);
    result.errors.push(`Compatible workspaces for '${profile}': ${compatibleWorkspaces.join(', ')}`);
    
    const workspaceConfig = mapping.workspaces && mapping.workspaces[normalizedWorkspace];
    if (workspaceConfig && workspaceConfig.restriction) {
      result.errors.push(`Workspace restriction: ${workspaceConfig.restriction}`);
    }
  } else {
    result.details = {
      profileSkills: profileConfig.skill_count,
      outputFormat: profileConfig.workspace_capabilities && 
                    profileConfig.workspace_capabilities[normalizedWorkspace] &&
                    profileConfig.workspace_capabilities[normalizedWorkspace].output_format
    };
  }
  
  return result;
}

/**
 * Validate workspace configuration
 * 
 * Validates workspace config against workspace-configuration.schema.json
 * and checks profile-workspace compatibility.
 * 
 * @param {Object|string} config - Workspace config object or JSON string
 * @param {string} [schemaPath] - Optional path to schema file
 * @param {string} [mappingPath] - Optional path to mapping file
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * const config = {
 *   workspace_type: 'local_repo',
 *   profile: 'minimal',
 *   output_config: { artifact_path: './artifacts', console_output: true },
 *   escalation_config: { channel: 'console' },
 *   retry_config: { strategy: 'interactive' }
 * };
 * const result = validateWorkspaceConfig(config);
 * if (result.isValid) {
 *   console.log('Config is valid');
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 */
function validateWorkspaceConfig(config, schemaPath = DEFAULT_SCHEMA_PATH, mappingPath = DEFAULT_MAPPING_PATH) {
  const result = {
    isValid: true,
    errors: [],
    normalizedConfig: null,
    compatibility: null
  };
  
  let parsedConfig = config;
  
  if (typeof config === 'string') {
    try {
      parsedConfig = JSON.parse(config);
    } catch (error) {
      result.isValid = false;
      result.errors.push({
        field: 'config',
        message: `Failed to parse config JSON: ${error.message}`,
        severity: 'error'
      });
      return result;
    }
  }
  
  if (!parsedConfig || typeof parsedConfig !== 'object') {
    result.isValid = false;
    result.errors.push({
      field: 'config',
      message: 'Config must be a non-null object',
      severity: 'error'
    });
    return result;
  }
  
  const schema = loadSchema(schemaPath);
  
  result.errors.push(...validateRequiredFields(parsedConfig, schema));
  result.errors.push(...validateWorkspaceType(parsedConfig.workspace_type));
  result.errors.push(...validateProfile(parsedConfig.profile));
  
  if (schema.properties) {
    result.errors.push(...validateNestedFields(parsedConfig, schema.properties));
  }
  
  if (parsedConfig.profile && parsedConfig.workspace_type) {
    const compatibilityResult = checkProfileWorkspaceCompatibility(
      parsedConfig.profile,
      parsedConfig.workspace_type,
      mappingPath
    );
    
    result.compatibility = compatibilityResult;
    
    if (!compatibilityResult.isCompatible) {
      result.isValid = false;
      for (const err of compatibilityResult.errors) {
        result.errors.push({
          field: 'profile_workspace_compatibility',
          message: err,
          severity: 'error'
        });
      }
    }
  }
  
  if (result.isValid) {
    result.normalizedConfig = normalizeConfig(parsedConfig);
  }
  
  result.isValid = result.errors.filter(e => e.severity === 'error').length === 0;
  
  return result;
}

/**
 * Normalize config values to standard format
 * 
 * @param {Object} config - Config to normalize
 * @returns {Object} Normalized config
 */
function normalizeConfig(config) {
  const normalized = {
    workspace_type: config.workspace_type ? config.workspace_type.toLowerCase().trim() : null,
    profile: config.profile ? config.profile.toLowerCase().trim() : null
  };
  
  if (config.adapter_id) {
    normalized.adapter_id = config.adapter_id;
  }
  
  if (config.output_config) {
    normalized.output_config = {
      artifact_path: config.output_config.artifact_path || './artifacts',
      changed_files_path: config.output_config.changed_files_path || './',
      console_output: config.output_config.console_output !== false
    };
    if (config.output_config.log_file) {
      normalized.output_config.log_file = config.output_config.log_file;
    }
  }
  
  if (config.escalation_config) {
    normalized.escalation_config = {
      channel: config.escalation_config.channel ? 
               config.escalation_config.channel.toLowerCase().trim() : 'console',
      requires_acknowledgment: config.escalation_config.requires_acknowledgment !== false,
      interactive_prompt: config.escalation_config.interactive_prompt !== false
    };
  }
  
  if (config.retry_config) {
    normalized.retry_config = {
      strategy: config.retry_config.strategy ? 
                config.retry_config.strategy.toLowerCase().trim() : 'interactive',
      max_retry: Math.min(Math.max(config.retry_config.max_retry || 2, 0), 5)
    };
    if (config.retry_config.retry_on_error_types) {
      normalized.retry_config.retry_on_error_types = config.retry_config.retry_on_error_types;
    }
  }
  
  if (config.validation_config) {
    normalized.validation_config = {
      validate_paths: config.validation_config.validate_paths !== false,
      validate_contract: config.validation_config.validate_contract !== false,
      contract_schema_path: config.validation_config.contract_schema_path || 'contracts/pack/'
    };
  }
  
  if (config.version_config) {
    normalized.version_config = {
      check_compatibility: config.version_config.check_compatibility !== false,
      compatibility_matrix_path: config.version_config.compatibility_matrix_path || 'compatibility-matrix.json'
    };
    if (config.version_config.package_version) {
      normalized.version_config.package_version = config.version_config.package_version;
    }
  }
  
  if (config.profile_config) {
    normalized.profile_config = {
      load_profile: config.profile_config.load_profile !== false,
      profile_path: config.profile_config.profile_path || 'templates/pack/'
    };
    if (config.profile_config.skill_count_expected) {
      normalized.profile_config.skill_count_expected = config.profile_config.skill_count_expected;
    }
  }
  
  if (config.metadata) {
    normalized.metadata = config.metadata;
  }
  
  return normalized;
}

/**
 * Create default workspace config for a profile-workspace pair
 * 
 * @param {string} profile - Profile name
 * @param {string} workspaceType - Workspace type
 * @param {Object} [options] - Additional options
 * @returns {Object} Default config
 */
function createDefaultConfig(profile, workspaceType, options = {}) {
  const mapping = loadMapping(options.mappingPath || DEFAULT_MAPPING_PATH);
  
  const normalizedProfile = profile.toLowerCase().trim();
  const normalizedWorkspace = workspaceType.toLowerCase().trim();
  
  const workspaceConfig = mapping.workspaces && mapping.workspaces[normalizedWorkspace];
  const profileConfig = mapping.profiles && mapping.profiles[normalizedProfile];
  
  const config = {
    workspace_type: normalizedWorkspace,
    profile: normalizedProfile,
    output_config: {
      artifact_path: options.artifactPath || './artifacts',
      changed_files_path: options.changedFilesPath || './',
      console_output: true
    },
    escalation_config: {
      channel: workspaceConfig && workspaceConfig.escalation_config ? 
               workspaceConfig.escalation_config.channel : 'console',
      requires_acknowledgment: true,
      interactive_prompt: normalizedWorkspace === 'local_repo'
    },
    retry_config: {
      strategy: normalizedWorkspace === 'local_repo' ? 'interactive' : 'configurable',
      max_retry: 2
    }
  };
  
  if (workspaceConfig && workspaceConfig.adapter_id) {
    config.adapter_id = workspaceConfig.adapter_id;
  }
  
  return config;
}

/**
 * Get valid workspace types
 * 
 * @returns {Array<string>} Valid workspace types
 */
function getValidWorkspaceTypes() {
  return VALID_WORKSPACE_TYPES.slice();
}

/**
 * Get valid profiles
 * 
 * @returns {Array<string>} Valid profiles
 */
function getValidProfiles() {
  return VALID_PROFILES.slice();
}

/**
 * Get valid escalation channels
 * 
 * @returns {Array<string>} Valid channels
 */
function getValidChannels() {
  return VALID_CHANNELS.slice();
}

/**
 * Get valid retry strategies
 * 
 * @returns {Array<string>} Valid strategies
 */
function getValidStrategies() {
  return VALID_STRATEGIES.slice();
}

// CLI interface for testing
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node workspace-config-validator.js <configPath>');
    console.log('       node workspace-config-validator.js --default <profile> <workspace>');
    console.log('       node workspace-config-validator.js --check <profile> <workspace>');
    process.exit(1);
  }
  
  if (args[0] === '--default') {
    const profile = args[1];
    const workspace = args[2];
    if (!profile || !workspace) {
      console.log('Usage: node workspace-config-validator.js --default <profile> <workspace>');
      process.exit(1);
    }
    const config = createDefaultConfig(profile, workspace);
    console.log(JSON.stringify(config, null, 2));
    process.exit(0);
  }
  
  if (args[0] === '--check') {
    const profile = args[1];
    const workspace = args[2];
    if (!profile || !workspace) {
      console.log('Usage: node workspace-config-validator.js --check <profile> <workspace>');
      process.exit(1);
    }
    const result = checkProfileWorkspaceCompatibility(profile, workspace);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.isCompatible ? 0 : 1);
  }
  
  const configPath = args[0];
  
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const result = validateWorkspaceConfig(content);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.isValid ? 0 : 1);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  validateWorkspaceConfig,
  checkProfileWorkspaceCompatibility,
  validateRequiredFields,
  validateFieldType,
  validateNestedFields,
  normalizeConfig,
  createDefaultConfig,
  loadSchema,
  loadMapping,
  getValidWorkspaceTypes,
  getValidProfiles,
  getValidChannels,
  getValidStrategies,
  VALID_WORKSPACE_TYPES,
  VALID_PROFILES,
  VALID_CHANNELS,
  VALID_STRATEGIES
};