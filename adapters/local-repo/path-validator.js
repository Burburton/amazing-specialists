/**
 * Path Validator
 * 
 * Validates artifact output paths per BR-006 rules.
 * Implements path validation per io-contract.md §8.
 * 
 * @module path-validator
 * @see io-contract.md §8, BR-006
 */

const fs = require('fs');
const path = require('path');

/**
 * Path Validation Result (BR-006)
 * @typedef {Object} PathValidationResult
 * @property {string} path - Path being validated
 * @property {boolean} exists - Whether path exists
 * @property {boolean} writable - Whether path is writable
 * @property {boolean} conflict - Whether path conflicts with protected files
 * @property {boolean} profileMatch - Whether path matches profile configuration
 * @property {string[]} errors - List of error messages
 */

/**
 * Protected file patterns (should not be overwritten)
 */
const PROTECTED_PATTERNS = [
  '.git',
  '.env',
  '.env.local',
  '.env.production',
  'credentials',
  'secrets',
  'package.json',
  'package-lock.json',
  '.opencode/config.json'
];

/**
 * Default validation options
 */
const DEFAULT_OPTIONS = {
  checkExists: true,
  checkWritable: true,
  checkConflict: true,
  checkProfileMatch: true,
  allowedPaths: ['./'],
  protectedPatterns: PROTECTED_PATTERNS
};

/**
 * Validate single path
 * 
 * @param {string} filePath - Path to validate
 * @param {Object} [options] - Validation options
 * @returns {PathValidationResult} Validation result
 */
function validatePath(filePath, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const result = {
    path: filePath,
    exists: false,
    writable: false,
    conflict: false,
    profileMatch: false,
    errors: []
  };
  
  const resolvedPath = path.resolve(filePath);
  
  if (opts.checkExists) {
    const parentDir = path.dirname(resolvedPath);
    if (!fs.existsSync(parentDir)) {
      result.errors.push(`Parent directory does not exist: ${parentDir}`);
    } else {
      result.exists = true;
    }
  } else {
    result.exists = true;
  }
  
  if (opts.checkWritable && result.exists) {
    try {
      const parentDir = path.dirname(resolvedPath);
      fs.accessSync(parentDir, fs.constants.W_OK);
      result.writable = true;
    } catch (err) {
      result.errors.push(`Path is not writable: ${err.message}`);
    }
  }
  
  if (opts.checkConflict) {
    for (const pattern of opts.protectedPatterns) {
      if (resolvedPath.includes(pattern) || resolvedPath.endsWith(pattern)) {
        result.conflict = true;
        result.errors.push(`Path conflicts with protected pattern: ${pattern}`);
        break;
      }
    }
    if (!result.conflict) {
      result.conflict = false;
    }
  }
  
  if (opts.checkProfileMatch) {
    for (const allowed of opts.allowedPaths) {
      const allowedResolved = path.resolve(allowed);
      if (resolvedPath.startsWith(allowedResolved)) {
        result.profileMatch = true;
        break;
      }
    }
    if (!result.profileMatch) {
      result.errors.push(`Path does not match allowed paths: ${opts.allowedPaths.join(', ')}`);
    }
  } else {
    result.profileMatch = true;
  }
  
  return result;
}

/**
 * Validate multiple paths
 * 
 * @param {string[]} filePaths - Paths to validate
 * @param {Object} [options] - Validation options
 * @returns {PathValidationResult[]} Array of validation results
 */
function validatePaths(filePaths, options = {}) {
  return filePaths.map(fp => validatePath(fp, options));
}

/**
 * Check if all paths are valid
 * 
 * @param {PathValidationResult[]} results - Validation results
 * @returns {boolean} True if all paths have no errors
 */
function allValid(results) {
  return results.every(r => r.errors.length === 0);
}

/**
 * Get summary of validation results
 * 
 * @param {PathValidationResult[]} results - Validation results
 * @returns {Object} Validation summary
 */
function getValidationSummary(results) {
  const total = results.length;
  const valid = results.filter(r => r.errors.length === 0).length;
  const invalid = total - valid;
  
  const errorCounts = {};
  for (const result of results) {
    for (const error of result.errors) {
      const key = error.split(':')[0];
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    }
  }
  
  return {
    total,
    valid,
    invalid,
    error_counts: errorCounts,
    all_valid: invalid === 0
  };
}

/**
 * Get error messages for invalid paths
 * 
 * @param {PathValidationResult[]} results - Validation results
 * @returns {string[]} List of error messages
 */
function getErrorMessages(results) {
  return results
    .filter(r => r.errors.length > 0)
    .flatMap(r => r.errors.map(e => `${r.path}: ${e}`));
}

/**
 * Add custom protected pattern
 * 
 * @param {string} pattern - Pattern to add
 * @param {Object} [options] - Validation options to modify
 * @returns {Object} Updated options
 */
function addProtectedPattern(pattern, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  opts.protectedPatterns = [...opts.protectedPatterns, pattern];
  return opts;
}

/**
 * Add custom allowed path
 * 
 * @param {string} allowedPath - Path to allow
 * @param {Object} [options] - Validation options to modify
 * @returns {Object} Updated options
 */
function addAllowedPath(allowedPath, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  opts.allowedPaths = [...opts.allowedPaths, allowedPath];
  return opts;
}

module.exports = {
  validatePath,
  validatePaths,
  allValid,
  getValidationSummary,
  getErrorMessages,
  addProtectedPattern,
  addAllowedPath,
  PROTECTED_PATTERNS,
  DEFAULT_OPTIONS
};