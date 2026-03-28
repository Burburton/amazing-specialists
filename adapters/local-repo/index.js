/**
 * Local Repo Workspace Adapter
 * 
 * Main entry point for the Local Repo workspace adapter.
 * Implements WorkspaceAdapter interface per io-contract.md §8.
 * 
 * @module local-repo-adapter
 * @see adapters/interfaces/workspace-adapter.interface.ts
 */

const artifactHandler = require('./artifact-handler');
const changedFilesHandler = require('./changed-files-handler');
const consoleReporter = require('./console-reporter');
const escalationOutputHandler = require('./escalation-output-handler');
const retryHandler = require('./retry-handler');
const pathValidator = require('./path-validator');

const fs = require('fs');
const path = require('path');

/**
 * Adapter info from registry.json
 */
const ADAPTER_INFO = {
  adapter_id: 'local-repo',
  adapter_type: 'workspace',
  version: '1.0.0',
  priority: 'must-have',
  status: 'implemented',
  description: 'Local filesystem workspace adapter for file output',
  compatible_profiles: ['minimal', 'full'],
  workspace_type: 'local_repo'
};

/**
 * Default config path
 */
const DEFAULT_CONFIG_PATH = './local-repo.config.json';

/**
 * Output tracking
 */
let outputState = {
  artifacts_written: [],
  files_changed: [],
  console_output: false,
  errors: [],
  warnings: []
};

/**
 * Create Local Repo Adapter instance
 * 
 * @param {Object} [config] - Adapter configuration
 * @returns {Object} Adapter instance implementing WorkspaceAdapter
 */
function create(config = null) {
  const loadedConfig = config || loadConfig(DEFAULT_CONFIG_PATH);
  
  outputState = {
    artifacts_written: [],
    files_changed: [],
    console_output: false,
    errors: [],
    warnings: []
  };
  
  return {
    handleArtifacts: (result) => handleArtifacts(result, loadedConfig),
    handleChangedFiles: (result) => handleChangedFiles(result, loadedConfig),
    handleEscalation: (escalation) => handleEscalation(escalation, loadedConfig),
    validateArtifactOutput: (artifacts) => validateArtifactOutput(artifacts),
    validatePaths: (paths) => validatePaths(paths, loadedConfig),
    handleRetry: (context) => handleRetry(context, loadedConfig),
    syncState: (result) => syncState(result, loadedConfig),
    getOutputSummary: () => getOutputSummary(),
    getAdapterInfo: () => getAdapterInfo()
  };
}

/**
 * Load configuration from file
 */
function loadConfig(configPath) {
  try {
    const resolvedPath = path.resolve(__dirname, configPath);
    if (fs.existsSync(resolvedPath)) {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`Failed to load config from ${configPath}: ${err.message}`);
  }
  return getDefaultConfig();
}

/**
 * Get default configuration
 */
function getDefaultConfig() {
  return {
    workspace_type: 'local_repo',
    profile: 'minimal',
    output_config: {
      artifact_path: './artifacts',
      changed_files_path: './',
      console_output: true
    },
    escalation_config: {
      channel: 'console',
      requires_acknowledgment: true,
      interactive_prompt: true
    },
    retry_config: {
      strategy: 'interactive',
      max_retry: 2
    },
    validation_config: {
      validate_paths: true,
      validate_contract: true
    }
  };
}

/**
 * Handle artifacts output
 */
function handleArtifacts(result, config) {
  const options = {
    basePath: config.output_config?.artifact_path || './artifacts',
    validatePaths: config.validation_config?.validate_paths !== false,
    createDirectories: true
  };
  
  const artifactResult = artifactHandler.handleArtifacts(result.artifacts, options);
  
  outputState.artifacts_written = artifactResult.artifacts_written;
  outputState.errors.push(...artifactResult.errors);
  outputState.warnings.push(...artifactResult.warnings);
  
  if (config.output_config?.console_output) {
    consoleReporter.printArtifacts(result.artifacts, { verbose: false });
    outputState.console_output = true;
  }
  
  return artifactResult;
}

/**
 * Handle changed files output
 */
function handleChangedFiles(result, config) {
  const options = {
    basePath: config.output_config?.changed_files_path || './',
    validatePaths: config.validation_config?.validate_paths !== false,
    createDirectories: true
  };
  
  const filesResult = changedFilesHandler.handleChangedFiles(result.changed_files, options);
  
  outputState.files_changed = filesResult.files_changed;
  outputState.errors.push(...filesResult.errors);
  outputState.warnings.push(...filesResult.warnings);
  
  if (config.output_config?.console_output) {
    consoleReporter.printChangedFiles(result.changed_files, { verbose: false });
    outputState.console_output = true;
  }
  
  return filesResult;
}

/**
 * Handle escalation output
 */
function handleEscalation(escalation, config) {
  const options = {
    interactive: config.escalation_config?.interactive_prompt !== false,
    colorize: true
  };
  
  escalationOutputHandler.handleEscalationOutput(escalation, options);
  outputState.console_output = true;
}

/**
 * Validate artifact output
 */
function validateArtifactOutput(artifacts) {
  return artifactHandler.validateArtifactOutput(artifacts);
}

/**
 * Validate paths
 */
function validatePaths(paths, config) {
  const allowedPaths = [
    config.output_config?.artifact_path || './artifacts',
    config.output_config?.changed_files_path || './'
  ];
  
  const options = {
    allowedPaths,
    checkProfileMatch: config.validation_config?.validate_paths !== false
  };
  
  return pathValidator.validatePaths(paths, options);
}

/**
 * Handle retry decision
 */
function handleRetry(context, config) {
  const retryConfig = config.retry_config || {};
  return retryHandler.handleRetry(context, retryConfig);
}

/**
 * Sync execution state
 */
function syncState(result, config) {
  if (config.output_config?.console_output) {
    consoleReporter.reportExecutionResult(result);
    outputState.console_output = true;
  }
}

/**
 * Get output summary
 */
function getOutputSummary() {
  return {
    success: outputState.errors.length === 0,
    artifacts_written: outputState.artifacts_written,
    files_changed: outputState.files_changed,
    console_output: outputState.console_output,
    errors: outputState.errors,
    warnings: outputState.warnings
  };
}

/**
 * Get adapter info
 */
function getAdapterInfo() {
  return ADAPTER_INFO;
}

module.exports = {
  create,
  loadConfig,
  getDefaultConfig,
  handleArtifacts,
  handleChangedFiles,
  handleEscalation,
  validateArtifactOutput,
  validatePaths,
  handleRetry,
  syncState,
  getOutputSummary,
  getAdapterInfo,
  ADAPTER_INFO,
  artifactHandler,
  changedFilesHandler,
  consoleReporter,
  escalationOutputHandler,
  retryHandler,
  pathValidator
};