/**
 * Changed Files Handler
 * 
 * Handles changed_files operations from Execution Result to local filesystem.
 * Supports change_type: added, modified, deleted, renamed.
 * 
 * @module changed-files-handler
 * @see io-contract.md §2
 */

const fs = require('fs');
const path = require('path');
const pathValidator = require('./path-validator');

/**
 * Default options
 */
const DEFAULT_OPTIONS = {
  basePath: './',
  validatePaths: true,
  createDirectories: true,
  backupOnModify: true
};

/**
 * Handle changed files from Execution Result
 * 
 * Performs file operations based on change_type:
 * - added: Create new file
 * - modified: Update existing file
 * - deleted: Remove file
 * - renamed: Move file to new location
 * 
 * @param {Object[]} changedFiles - Array of changed files from Execution Result
 * @param {Object} [options] - Handler options
 * @returns {Object} Output result
 */
function handleChangedFiles(changedFiles, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const result = {
    success: true,
    files_changed: [],
    errors: [],
    warnings: []
  };

  if (!changedFiles || changedFiles.length === 0) {
    result.warnings.push('No changed files to process');
    return result;
  }

  for (const file of changedFiles) {
    const filePath = resolveFilePath(file, opts.basePath);
    
    try {
      switch (file.change_type) {
        case 'added':
          handleFileAdded(filePath, file, opts, result);
          break;
        case 'modified':
          handleFileModified(filePath, file, opts, result);
          break;
        case 'deleted':
          handleFileDeleted(filePath, file, opts, result);
          break;
        case 'renamed':
          handleFileRenamed(file, opts, result);
          break;
        default:
          result.errors.push(`Unknown change_type for ${file.path}: ${file.change_type}`);
      }
    } catch (err) {
      result.errors.push(`Failed to handle file ${file.path}: ${err.message}`);
      result.success = false;
    }
  }

  return result;
}

/**
 * Handle added file - create new file
 */
function handleFileAdded(filePath, file, opts, result) {
  if (opts.validatePaths) {
    const validation = pathValidator.validatePath(filePath);
    if (validation.errors.length > 0) {
      result.errors.push(`Path validation failed: ${validation.errors.join(', ')}`);
      return;
    }
  }

  if (opts.createDirectories) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  if (fs.existsSync(filePath)) {
    result.warnings.push(`File already exists (added): ${filePath}`);
    return;
  }

  if (file.content) {
    fs.writeFileSync(filePath, file.content, 'utf8');
    result.files_changed.push(filePath);
  } else {
    result.warnings.push(`No content for added file: ${filePath}`);
  }
}

/**
 * Handle modified file - update existing file
 */
function handleFileModified(filePath, file, opts, result) {
  if (!fs.existsSync(filePath)) {
    result.warnings.push(`File not found (modified): ${filePath}`);
    return;
  }

  if (opts.backupOnModify) {
    const backupPath = `${filePath}.backup-${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
  }

  if (file.content) {
    fs.writeFileSync(filePath, file.content, 'utf8');
    result.files_changed.push(filePath);
  } else {
    result.warnings.push(`No content for modified file: ${filePath}`);
  }
}

/**
 * Handle deleted file - remove file
 */
function handleFileDeleted(filePath, file, opts, result) {
  if (!fs.existsSync(filePath)) {
    result.warnings.push(`File not found (deleted): ${filePath}`);
    return;
  }

  fs.unlinkSync(filePath);
  result.files_changed.push(filePath);
}

/**
 * Handle renamed file - move to new location
 */
function handleFileRenamed(file, opts, result) {
  if (!file.old_path && !file.path) {
    result.errors.push(`Renamed file missing old_path or new_path: ${JSON.stringify(file)}`);
    return;
  }

  const oldPath = file.old_path || file.path;
  const newPath = file.new_path || file.path;

  const resolvedOld = resolveFilePath({ path: oldPath }, opts.basePath);
  const resolvedNew = resolveFilePath({ path: newPath }, opts.basePath);

  if (!fs.existsSync(resolvedOld)) {
    result.warnings.push(`Old file not found (renamed): ${resolvedOld}`);
    return;
  }

  if (opts.createDirectories) {
    const dir = path.dirname(resolvedNew);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  fs.renameSync(resolvedOld, resolvedNew);
  result.files_changed.push(`${resolvedOld} -> ${resolvedNew}`);
}

/**
 * Resolve file path relative to base path
 */
function resolveFilePath(file, basePath) {
  if (file.path) {
    if (path.isAbsolute(file.path)) {
      return file.path;
    }
    return path.resolve(basePath, file.path);
  }
  return path.resolve(basePath);
}

/**
 * Get changed files output summary
 */
function getChangedFilesSummary(executionResult, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const changes = executionResult.changed_files || [];
  const added = changes.filter(c => c.change_type === 'added').length;
  const modified = changes.filter(c => c.change_type === 'modified').length;
  const deleted = changes.filter(c => c.change_type === 'deleted').length;
  const renamed = changes.filter(c => c.change_type === 'renamed').length;
  
  return {
    total_changes: changes.length,
    added,
    modified,
    deleted,
    renamed,
    output_path: opts.basePath,
    workspace_type: 'local_repo'
  };
}

module.exports = {
  handleChangedFiles,
  handleFileAdded,
  handleFileModified,
  handleFileDeleted,
  handleFileRenamed,
  resolveFilePath,
  getChangedFilesSummary,
  DEFAULT_OPTIONS
};