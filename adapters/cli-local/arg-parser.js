/**
 * arg-parser.js
 * 
 * CLI argument parser for the CLI/Local Orchestrator Adapter.
 * Parses process.argv and maps flags to dispatch fields per ADAPTERS.md mapping table.
 * 
 * Reference: ADAPTERS.md §Orchestrator Adapter §CLI/Local
 */

'use strict';

const crypto = require('crypto');

function generateUUID() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

/**
 * Valid role enum values per io-contract.md §1
 * @constant {string[]}
 */
const VALID_ROLES = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];

/**
 * Valid risk level enum values per io-contract.md §1
 * @constant {string[]}
 */
const VALID_RISK_LEVELS = ['low', 'medium', 'high', 'critical'];

/**
 * Parse CLI arguments and extract dispatch fields.
 * 
 * @param {string[]} args - CLI arguments (typically process.argv.slice(2))
 * @returns {ParsedArgs} Parsed arguments object
 * @throws {Error} If required fields missing or invalid enum values
 * 
 * @example
 * const args = process.argv.slice(2);
 * const parsed = parseArgs(args);
 * // Returns: { project_id: 'my-app', role: 'developer', ... }
 */
function parseArgs(args) {
  const result = {
    dispatch_id: generateUUID(),
    project_id: null,
    milestone_id: null,
    task_id: null,
    role: null,
    command: null,
    title: null,
    goal: null,
    context: {},
    constraints: [],
    risk_level: 'medium', // Default to medium if not specified
    positional: []
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    switch (arg) {
      case '--project':
        result.project_id = getNextArg(args, i, '--project');
        i += 2;
        break;

      case '--milestone':
        result.milestone_id = getNextArg(args, i, '--milestone');
        i += 2;
        break;

      case '--task':
        result.task_id = getNextArg(args, i, '--task');
        i += 2;
        break;

      case '--role':
        const roleValue = getNextArg(args, i, '--role');
        validateRole(roleValue);
        result.role = roleValue;
        i += 2;
        break;

      case '--command':
        result.command = getNextArg(args, i, '--command');
        i += 2;
        break;

      case '--context':
        const contextValue = getNextArg(args, i, '--context');
        result.context = parseJson(contextValue, '--context');
        i += 2;
        break;

      case '--constraints':
        // Constraints can be multiple values until next flag or end
        result.constraints = parseArrayArg(args, i + 1);
        i += 1 + result.constraints.length;
        break;

      case '--risk':
        const riskValue = getNextArg(args, i, '--risk');
        validateRiskLevel(riskValue);
        result.risk_level = riskValue;
        i += 2;
        break;

      default:
        // Positional arguments (title, goal)
        if (!arg.startsWith('--')) {
          result.positional.push(arg);
          i++;
        } else {
          throw new Error(`Unknown flag: ${arg}`);
        }
        break;
    }
  }

  // Map positional args to title and goal
  if (result.positional.length >= 1) {
    result.title = result.positional[0];
  }
  if (result.positional.length >= 2) {
    result.goal = result.positional.slice(1).join(' ');
  }

  return result;
}

/**
 * Get the next argument value after a flag.
 * 
 * @param {string[]} args - Full argument array
 * @param {number} currentIndex - Current index of the flag
 * @param {string} flagName - Flag name for error messages
 * @returns {string} The next argument value
 * @throws {Error} If no value follows the flag
 */
function getNextArg(args, currentIndex, flagName) {
  if (currentIndex + 1 >= args.length) {
    throw new Error(`Missing value for ${flagName}`);
  }
  const nextArg = args[currentIndex + 1];
  if (nextArg.startsWith('--')) {
    throw new Error(`Missing value for ${flagName} (found another flag: ${nextArg})`);
  }
  return nextArg;
}

/**
 * Parse JSON string into object.
 * 
 * @param {string} jsonString - JSON string to parse
 * @param {string} flagName - Flag name for error messages
 * @returns {Object} Parsed JSON object
 * @throws {Error} If JSON is invalid
 */
function parseJson(jsonString, flagName) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    throw new Error(`Invalid JSON for ${flagName}: ${e.message}`);
  }
}

/**
 * Parse array arguments (constraints or similar).
 * Reads values until next flag or end of arguments.
 * 
 * @param {string[]} args - Full argument array
 * @param {number} startIndex - Starting index after the flag
 * @returns {string[]} Array of values
 */
function parseArrayArg(args, startIndex) {
  const values = [];
  let i = startIndex;
  while (i < args.length && !args[i].startsWith('--')) {
    values.push(args[i]);
    i++;
  }
  return values;
}

/**
 * Validate role enum value.
 * 
 * @param {string} role - Role value to validate
 * @throws {Error} If role is not in VALID_ROLES
 */
function validateRole(role) {
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Invalid role '${role}'. Valid roles: ${VALID_ROLES.join(', ')}`);
  }
}

/**
 * Validate risk level enum value.
 * 
 * @param {string} riskLevel - Risk level to validate
 * @throws {Error} If risk level is not in VALID_RISK_LEVELS
 */
function validateRiskLevel(riskLevel) {
  if (!VALID_RISK_LEVELS.includes(riskLevel)) {
    throw new Error(`Invalid risk_level '${riskLevel}'. Valid levels: ${VALID_RISK_LEVELS.join(', ')}`);
  }
}

/**
 * Validate that all required fields are present.
 * 
 * @param {ParsedArgs} parsed - Parsed arguments object
 * @returns {ValidationResult} Validation result with isValid and errors
 */
function validateRequiredFields(parsed) {
  const required = ['project_id', 'milestone_id', 'task_id', 'role', 'command', 'title', 'goal'];
  const errors = [];

  for (const field of required) {
    if (!parsed[field]) {
      errors.push({
        field,
        message: `Required field '${field}' is missing`,
        severity: 'error'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * @typedef {Object} ParsedArgs
 * @property {string} dispatch_id - Auto-generated UUID v4
 * @property {string|null} project_id - Project ID from --project flag
 * @property {string|null} milestone_id - Milestone ID from --milestone flag
 * @property {string|null} task_id - Task ID from --task flag
 * @property {string|null} role - Role from --role flag
 * @property {string|null} command - Command from --command flag
 * @property {string|null} title - Title from first positional arg
 * @property {string|null} goal - Goal from remaining positional args
 * @property {Object} context - Context object from --context JSON
 * @property {string[]} constraints - Constraints array from --constraints
 * @property {string} risk_level - Risk level from --risk flag
 * @property {string[]} positional - All positional arguments
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {Array<{field: string, message: string, severity: string}>} errors - Validation errors
 */

module.exports = {
  parseArgs,
  validateRequiredFields,
  validateRole,
  validateRiskLevel,
  VALID_ROLES,
  VALID_RISK_LEVELS
};