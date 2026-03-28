/**
 * Artifact Handler
 * 
 * Handles artifact output from Execution Result to local filesystem.
 * Implements the artifact output mapping per ADAPTERS.md §Workspace Adapter §Local Repo.
 * 
 * @module artifact-handler
 * @see io-contract.md §2, §3
 */

const fs = require('fs');
const path = require('path');
const pathValidator = require('./path-validator');

/**
 * Artifact output result
 * @typedef {Object} ArtifactOutputResult
 * @property {boolean} success - Whether output succeeded
 * @property {string[]} artifacts_written - List of written artifact paths
 * @property {string[]} errors - List of error messages
 * @property {string[]} warnings - List of warning messages
 */

/**
 * Options for artifact handler
 * @typedef {Object} ArtifactHandlerOptions
 * @property {string} [basePath='./artifacts'] - Base path for artifact output
 * @property {boolean} [validatePaths=true] - Whether to validate paths (BR-006)
 * @property {boolean} [createDirectories=true] - Whether to create directories if needed
 * @property {boolean} [overwrite=false] - Whether to overwrite existing files
 */

/**
 * Default options
 */
const DEFAULT_OPTIONS = {
  basePath: './artifacts',
  validatePaths: true,
  createDirectories: true,
  overwrite: false
};

/**
 * Handle artifacts from Execution Result
 * 
 * Writes artifacts to local filesystem based on artifact.path and artifact.content.
 * Creates directories if needed. Validates write paths per BR-006.
 * 
 * @param {Object[]} artifacts - Array of artifacts from Execution Result
 * @param {ArtifactHandlerOptions} [options] - Handler options
 * @returns {ArtifactOutputResult} Output result
 * 
 * @example
 * const result = handleArtifacts(executionResult.artifacts);
 * if (result.success) {
 *   console.log('Artifacts written:', result.artifacts_written);
 * }
 */
function handleArtifacts(artifacts, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const result = {
    success: true,
    artifacts_written: [],
    errors: [],
    warnings: []
  };

  if (!artifacts || artifacts.length === 0) {
    result.warnings.push('No artifacts to process');
    return result;
  }

  // Extract paths for validation
  const paths = artifacts.map(a => {
    const outputPath = resolveArtifactPath(a, opts.basePath);
    return outputPath;
  });

  // Validate paths if enabled (BR-006)
  if (opts.validatePaths) {
    const validationResults = pathValidator.validatePaths(paths);
    const invalidPaths = validationResults.filter(v => v.errors.length > 0);
    
    if (invalidPaths.length > 0) {
      for (const invalid of invalidPaths) {
        result.errors.push(`Path validation failed for ${invalid.path}: ${invalid.errors.join(', ')}`);
      }
      result.success = false;
      return result;
    }
  }

  // Process each artifact
  for (const artifact of artifacts) {
    try {
      const outputPath = resolveArtifactPath(artifact, opts.basePath);
      
      // Check if file exists and overwrite is disabled
      if (!opts.overwrite && fs.existsSync(outputPath)) {
        result.warnings.push(`File already exists: ${outputPath} (skipped, overwrite=false)`);
        continue;
      }

      // Create directory if needed
      if (opts.createDirectories) {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }

      // Write artifact content
      if (artifact.content) {
        fs.writeFileSync(outputPath, artifact.content, 'utf8');
        result.artifacts_written.push(outputPath);
      } else if (artifact.path) {
        // If no content but path specified, create placeholder
        result.warnings.push(`No content for artifact ${artifact.artifact_id}, creating placeholder`);
        const placeholderContent = createPlaceholderContent(artifact);
        fs.writeFileSync(outputPath, placeholderContent, 'utf8');
        result.artifacts_written.push(outputPath);
      } else {
        result.errors.push(`Artifact ${artifact.artifact_id} has no path or content`);
      }
    } catch (err) {
      result.errors.push(`Failed to write artifact ${artifact.artifact_id}: ${err.message}`);
      result.success = false;
    }
  }

  return result;
}

/**
 * Resolve artifact path relative to base path
 * 
 * @param {Object} artifact - Artifact object
 * @param {string} basePath - Base path for output
 * @returns {string} Resolved absolute path
 */
function resolveArtifactPath(artifact, basePath) {
  // Use artifact.path if specified
  if (artifact.path) {
    // If path is absolute, use it directly
    if (path.isAbsolute(artifact.path)) {
      return artifact.path;
    }
    // Otherwise, resolve relative to base path
    return path.resolve(basePath, artifact.path);
  }

  // Generate path based on artifact metadata
  const artifactDir = artifact.artifact_type || 'unknown';
  const fileName = `${artifact.artifact_id || 'artifact'}-${artifact.title || 'untitled'}.${getExtension(artifact.format)}`;
  return path.resolve(basePath, artifactDir, fileName);
}

/**
 * Get file extension based on artifact format
 * 
 * @param {string} format - Artifact format (markdown, yaml, json, code, txt)
 * @returns {string} File extension
 */
function getExtension(format) {
  const extensions = {
    markdown: 'md',
    yaml: 'yaml',
    json: 'json',
    code: 'js',
    txt: 'txt'
  };
  return extensions[format] || 'md';
}

/**
 * Create placeholder content for artifact without content
 * 
 * @param {Object} artifact - Artifact object
 * @returns {string} Placeholder content
 */
function createPlaceholderContent(artifact) {
  const lines = [
    `# Placeholder for ${artifact.title || artifact.artifact_id}`,
    '',
    `Artifact ID: ${artifact.artifact_id}`,
    `Artifact Type: ${artifact.artifact_type}`,
    `Format: ${artifact.format}`,
    `Created by: ${artifact.created_by_role}`,
    `Related Task: ${artifact.related_task_id}`,
    '',
    `Summary: ${artifact.summary || 'No summary provided'}`,
    '',
    '---',
    '',
    'This placeholder was created because the artifact content was not provided.',
    'Please update this file with the actual content.',
    ''
  ];
  return lines.join('\n');
}

/**
 * Validate artifact output against io-contract.md §3 schema
 * 
 * @param {Object[]} artifacts - Artifacts to validate
 * @returns {Object} Validation result
 */
function validateArtifactOutput(artifacts) {
  const result = {
    isValid: true,
    errors: []
  };

  if (!Array.isArray(artifacts)) {
    result.isValid = false;
    result.errors.push({ field: 'artifacts', message: 'artifacts must be an array', severity: 'error' });
    return result;
  }

  const requiredFields = ['artifact_id', 'artifact_type', 'title', 'format', 'created_by_role'];
  const validArtifactTypes = ['design_note', 'implementation_summary', 'test_report', 'review_report', 'docs_sync_report', 'changelog_entry', 'security_report'];
  const validFormats = ['markdown', 'yaml', 'json', 'code', 'txt'];

  for (const artifact of artifacts) {
    // Check required fields
    for (const field of requiredFields) {
      if (!artifact[field]) {
        result.isValid = false;
        result.errors.push({
          field: `artifacts[].${field}`,
          message: `Missing required field: ${field}`,
          severity: 'error'
        });
      }
    }

    // Validate artifact_type
    if (artifact.artifact_type && !validArtifactTypes.includes(artifact.artifact_type)) {
      result.isValid = false;
      result.errors.push({
        field: 'artifacts[].artifact_type',
        message: `Invalid artifact_type: ${artifact.artifact_type}`,
        severity: 'error'
      });
    }

    // Validate format
    if (artifact.format && !validFormats.includes(artifact.format)) {
      result.isValid = false;
      result.errors.push({
        field: 'artifacts[].format',
        message: `Invalid format: ${artifact.format}`,
        severity: 'error'
      });
    }
  }

  return result;
}

/**
 * Get artifact output summary
 * 
 * @param {Object} executionResult - Execution Result
 * @param {ArtifactHandlerOptions} [options] - Handler options
 * @returns {Object} Output summary
 */
function getArtifactOutputSummary(executionResult, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return {
    artifact_count: executionResult.artifacts?.length || 0,
    output_path: opts.basePath,
    workspace_type: 'local_repo'
  };
}

module.exports = {
  handleArtifacts,
  validateArtifactOutput,
  resolveArtifactPath,
  getExtension,
  createPlaceholderContent,
  getArtifactOutputSummary,
  DEFAULT_OPTIONS
};