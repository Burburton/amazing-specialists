/**
 * quick.js
 * 
 * Quick subcommand for CLI/Local Orchestrator Adapter.
 * Provides simplified dispatch with minimal required parameters.
 * 
 * Reference: specs/039-readme-command-reference-and-adapter-quick/spec.md
 */

'use strict';

const crypto = require('crypto');

/**
 * Default values for quick command
 */
const QUICK_DEFAULTS = {
  project_id: 'default',
  milestone_id: 'm-current',
  task_id: 't-quick',
  risk_level: 'medium'
};

/**
 * Role to command mapping for quick command
 */
const ROLE_COMMAND_MAP = {
  architect: 'design-task',
  developer: 'implement-task',
  tester: 'test-task',
  reviewer: 'review-task',
  docs: 'sync-docs',
  security: 'security-check'
};

/**
 * Valid roles for quick command
 */
const VALID_ROLES = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];

/**
 * Generate UUID v4
 */
function generateUUID() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

/**
 * Parse quick subcommand arguments.
 * 
 * @param {string[]} args - Arguments after 'quick' subcommand
 * @returns {QuickParseResult} Parsed result
 * 
 * @example
 * // node index.js quick --role developer "Implement login"
 * parseQuickArgs(['--role', 'developer', 'Implement', 'login'])
 */
function parseQuickArgs(args) {
  const result = {
    role: null,
    enhanced: false,
    title: null,
    goal: null,
    project_id: QUICK_DEFAULTS.project_id,
    milestone_id: QUICK_DEFAULTS.milestone_id,
    task_id: QUICK_DEFAULTS.task_id,
    risk_level: QUICK_DEFAULTS.risk_level,
    positional: []
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    switch (arg) {
      case '--role':
      case '-r':
        if (i + 1 >= args.length) {
          throw new Error('Missing value for --role');
        }
        const roleValue = args[i + 1];
        if (!VALID_ROLES.includes(roleValue)) {
          throw new Error(`Invalid role '${roleValue}'. Valid roles: ${VALID_ROLES.join(', ')}`);
        }
        result.role = roleValue;
        i += 2;
        break;

      case '--enhanced':
      case '-e':
        result.enhanced = true;
        i += 1;
        break;

      case '--project':
      case '-p':
        if (i + 1 >= args.length) {
          throw new Error('Missing value for --project');
        }
        result.project_id = args[i + 1];
        i += 2;
        break;

      case '--milestone':
      case '-m':
        if (i + 1 >= args.length) {
          throw new Error('Missing value for --milestone');
        }
        result.milestone_id = args[i + 1];
        i += 2;
        break;

      case '--task':
      case '-t':
        if (i + 1 >= args.length) {
          throw new Error('Missing value for --task');
        }
        result.task_id = args[i + 1];
        i += 2;
        break;

      case '--risk':
        if (i + 1 >= args.length) {
          throw new Error('Missing value for --risk');
        }
        result.risk_level = args[i + 1];
        i += 2;
        break;

      default:
        // Positional arguments
        if (!arg.startsWith('-')) {
          result.positional.push(arg);
        }
        i += 1;
        break;
    }
  }

  // Map positional args to title and goal
  if (result.positional.length >= 1) {
    result.title = result.positional.join(' ');
  }
  if (result.positional.length >= 2) {
    // If multiple positional args, first is title, rest is goal
    result.title = result.positional[0];
    result.goal = result.positional.slice(1).join(' ');
  }

  return result;
}

/**
 * Validate quick command arguments.
 * 
 * @param {QuickParseResult} parsed - Parsed arguments
 * @returns {ValidationResult} Validation result
 */
function validateQuickArgs(parsed) {
  const errors = [];

  if (!parsed.role) {
    errors.push({
      field: 'role',
      message: 'Required flag --role is missing',
      severity: 'error'
    });
  }

  if (!parsed.title) {
    errors.push({
      field: 'title',
      message: 'Required positional argument <title> is missing',
      severity: 'error'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Build Dispatch Payload from quick command arguments.
 * 
 * @param {QuickParseResult} parsed - Parsed quick arguments
 * @returns {DispatchPayload} Standard Dispatch Payload
 */
function buildDispatchPayload(parsed) {
  const command = ROLE_COMMAND_MAP[parsed.role] || 'execute';
  
  return {
    dispatch_id: generateUUID(),
    project_id: parsed.project_id,
    milestone_id: parsed.milestone_id,
    task_id: parsed.task_id,
    role: parsed.role,
    command: command,
    title: parsed.title,
    goal: parsed.goal || parsed.title,
    description: `Quick dispatch for: ${parsed.title}`,
    context: {
      project_goal: 'Quick task execution',
      milestone_goal: 'Current milestone',
      task_scope: parsed.title,
      related_spec_sections: [],
      code_context_summary: ''
    },
    constraints: [],
    inputs: [],
    expected_outputs: ['execution_result'],
    verification_steps: ['validate'],
    risk_level: parsed.risk_level,
    metadata: {
      source: 'cli-quick',
      enhanced: parsed.enhanced,
      created_at: new Date().toISOString(),
      created_by: 'cli-local-adapter-quick'
    }
  };
}

/**
 * Generate execution suggestion based on role and command.
 * 
 * @param {DispatchPayload} payload - Dispatch payload
 * @returns {string[]} Execution suggestions
 */
function generateSuggestions(payload) {
  const suggestions = [];
  
  suggestions.push(`Role: ${payload.role}`);
  suggestions.push(`Command: ${payload.command}`);
  suggestions.push(`Task: ${payload.title}`);
  
  if (payload.metadata.enhanced) {
    suggestions.push('Enhanced mode: ENABLED (M4 skills will be applied)');
  }
  
  suggestions.push('');
  suggestions.push('Next steps:');
  
  switch (payload.role) {
    case 'architect':
      suggestions.push('  1. Review design requirements');
      suggestions.push('  2. Create design-note artifact');
      suggestions.push('  3. Define module boundaries');
      break;
    case 'developer':
      suggestions.push('  1. Review spec and plan');
      suggestions.push('  2. Implement the feature');
      suggestions.push('  3. Run self-check validation');
      break;
    case 'tester':
      suggestions.push('  1. Design test cases');
      suggestions.push('  2. Execute tests');
      suggestions.push('  3. Generate test report');
      break;
    case 'reviewer':
      suggestions.push('  1. Review code changes');
      suggestions.push('  2. Check spec compliance');
      suggestions.push('  3. Generate review report');
      break;
    case 'docs':
      suggestions.push('  1. Sync README if needed');
      suggestions.push('  2. Update changelog');
      suggestions.push('  3. Generate docs report');
      break;
    case 'security':
      suggestions.push('  1. Review authentication/authorization');
      suggestions.push('  2. Check input validation');
      suggestions.push('  3. Generate security report');
      break;
  }
  
  return suggestions;
}

/**
 * Format output for quick command.
 * 
 * @param {DispatchPayload} payload - Dispatch payload
 * @param {string[]} suggestions - Execution suggestions
 * @returns {string} Formatted output
 */
function formatOutput(payload, suggestions) {
  const lines = [];
  
  lines.push('=== Quick Dispatch Payload ===');
  lines.push('');
  lines.push(JSON.stringify(payload, null, 2));
  lines.push('');
  lines.push('=== Execution Suggestions ===');
  lines.push('');
  suggestions.forEach(s => lines.push(s));
  
  return lines.join('\n');
}

/**
 * @typedef {Object} QuickParseResult
 * @property {string|null} role - Role from --role flag
 * @property {boolean} enhanced - Enhanced mode flag
 * @property {string|null} title - Title from positional args
 * @property {string|null} goal - Goal from positional args
 * @property {string} project_id - Project ID (default or specified)
 * @property {string} milestone_id - Milestone ID (default or specified)
 * @property {string} task_id - Task ID (default or specified)
 * @property {string} risk_level - Risk level (default or specified)
 * @property {string[]} positional - All positional arguments
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {Array<{field: string, message: string, severity: string}>} errors - Validation errors
 */

/**
 * @typedef {Object} DispatchPayload
 * Standard Dispatch Payload per io-contract.md §1
 */

module.exports = {
  parseQuickArgs,
  validateQuickArgs,
  buildDispatchPayload,
  generateSuggestions,
  formatOutput,
  QUICK_DEFAULTS,
  ROLE_COMMAND_MAP,
  VALID_ROLES
};