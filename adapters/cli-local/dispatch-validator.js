/**
 * dispatch-validator.js
 * 
 * Validates Dispatch Payload against io-contract.md §1 schema.
 * Uses contract validation approach per BR-002.
 * 
 * Reference: io-contract.md §1, BR-002, NFR-004
 */

'use strict';

/**
 * Required fields per io-contract.md §1.
 */
const REQUIRED_FIELDS = [
  'dispatch_id',
  'project_id',
  'milestone_id',
  'task_id',
  'role',
  'command',
  'title',
  'goal',
  'description',
  'context',
  'constraints',
  'inputs',
  'expected_outputs',
  'verification_steps',
  'risk_level'
];

/**
 * Valid role values per io-contract.md §1.
 */
const VALID_ROLES = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];

/**
 * Valid risk level values per io-contract.md §1.
 */
const VALID_RISK_LEVELS = ['low', 'medium', 'high', 'critical'];

/**
 * Valid artifact types per io-contract.md §1.
 */
const VALID_ARTIFACT_TYPES = [
  'spec',
  'design_note',
  'implementation_summary',
  'test_report',
  'review_report',
  'docs_sync_report',
  'changelog_entry',
  'security_report'
];

/**
 * Validate Dispatch Payload against io-contract.md §1 schema.
 * 
 * Performance requirement: < 100ms (NFR-004)
 * 
 * @param {DispatchPayload} dispatch - Dispatch Payload to validate
 * @returns {ValidationResult} Validation result with isValid and errors
 * 
 * @example
 * const { validate } = require('./dispatch-validator');
 * const result = validate(dispatch);
 * if (!result.isValid) {
 *   console.error('Validation failed:', result.errors);
 * }
 */
function validate(dispatch) {
  const startTime = Date.now();
  const errors = [];
  
  validateRequiredFields(dispatch, errors);
  validateFieldTypes(dispatch, errors);
  validateEnums(dispatch, errors);
  validateContext(dispatch, errors);
  validateInputs(dispatch, errors);
  validateRetryContext(dispatch, errors);
  
  const validationTime = Date.now() - startTime;
  
  if (validationTime > 100) {
    errors.push({
      field: '_performance',
      message: `Validation took ${validationTime}ms, exceeds 100ms threshold`,
      severity: 'warning'
    });
  }
  
  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    validation_time_ms: validationTime
  };
}

/**
 * Validate all required fields are present.
 * 
 * @param {DispatchPayload} dispatch - Dispatch payload
 * @param {Array} errors - Errors array to append to
 */
function validateRequiredFields(dispatch, errors) {
  for (const field of REQUIRED_FIELDS) {
    if (dispatch[field] === undefined || dispatch[field] === null) {
      errors.push({
        field,
        message: `Required field '${field}' is missing`,
        severity: 'error'
      });
    }
  }
}

/**
 * Validate field types match expected types.
 * 
 * @param {DispatchPayload} dispatch - Dispatch payload
 * @param {Array} errors - Errors array to append to
 */
function validateFieldTypes(dispatch, errors) {
  const typeChecks = [
    { field: 'dispatch_id', type: 'string' },
    { field: 'project_id', type: 'string' },
    { field: 'milestone_id', type: 'string' },
    { field: 'task_id', type: 'string' },
    { field: 'role', type: 'string' },
    { field: 'command', type: 'string' },
    { field: 'title', type: 'string' },
    { field: 'goal', type: 'string' },
    { field: 'description', type: 'string' },
    { field: 'context', type: 'object' },
    { field: 'constraints', type: 'array' },
    { field: 'inputs', type: 'array' },
    { field: 'expected_outputs', type: 'array' },
    { field: 'verification_steps', type: 'array' },
    { field: 'risk_level', type: 'string' }
  ];
  
  for (const check of typeChecks) {
    if (dispatch[check.field] !== undefined && dispatch[check.field] !== null) {
      const actualType = Array.isArray(dispatch[check.field]) ? 'array' : typeof dispatch[check.field];
      if (actualType !== check.type) {
        errors.push({
          field: check.field,
          message: `Field '${check.field}' has wrong type '${actualType}', expected '${check.type}'`,
          severity: 'error'
        });
      }
    }
  }
}

/**
 * Validate enum values for role and risk_level.
 * 
 * @param {DispatchPayload} dispatch - Dispatch payload
 * @param {Array} errors - Errors array to append to
 */
function validateEnums(dispatch, errors) {
  if (dispatch.role && !VALID_ROLES.includes(dispatch.role)) {
    errors.push({
      field: 'role',
      message: `Invalid role '${dispatch.role}'. Valid roles: ${VALID_ROLES.join(', ')}`,
      severity: 'error'
    });
  }
  
  if (dispatch.risk_level && !VALID_RISK_LEVELS.includes(dispatch.risk_level)) {
    errors.push({
      field: 'risk_level',
      message: `Invalid risk_level '${dispatch.risk_level}'. Valid levels: ${VALID_RISK_LEVELS.join(', ')}`,
      severity: 'error'
    });
  }
}

/**
 * Validate context object structure.
 * task_scope is required per io-contract.md §1.
 * 
 * @param {DispatchPayload} dispatch - Dispatch payload
 * @param {Array} errors - Errors array to append to
 */
function validateContext(dispatch, errors) {
  if (!dispatch.context) return;
  
  if (!dispatch.context.task_scope) {
    errors.push({
      field: 'context.task_scope',
      message: 'Required field context.task_scope is missing',
      severity: 'error'
    });
  }
  
  if (dispatch.context.related_spec_sections && !Array.isArray(dispatch.context.related_spec_sections)) {
    errors.push({
      field: 'context.related_spec_sections',
      message: 'context.related_spec_sections must be an array',
      severity: 'error'
    });
  }
}

/**
 * Validate inputs array structure.
 * Each input must have artifact_id, artifact_type, and path.
 * 
 * @param {DispatchPayload} dispatch - Dispatch payload
 * @param {Array} errors - Errors array to append to
 */
function validateInputs(dispatch, errors) {
  if (!dispatch.inputs || !Array.isArray(dispatch.inputs)) return;
  
  if (dispatch.inputs.length === 0) {
    errors.push({
      field: 'inputs',
      message: 'inputs array must have at least one element',
      severity: 'error'
    });
    return;
  }
  
  dispatch.inputs.forEach((input, index) => {
    if (!input.artifact_id) {
      errors.push({
        field: `inputs[${index}].artifact_id`,
        message: `Input at index ${index} missing artifact_id`,
        severity: 'error'
      });
    }
    
    if (!input.artifact_type) {
      errors.push({
        field: `inputs[${index}].artifact_type`,
        message: `Input at index ${index} missing artifact_type`,
        severity: 'error'
      });
    }
    
    if (input.artifact_type && !VALID_ARTIFACT_TYPES.includes(input.artifact_type)) {
      errors.push({
        field: `inputs[${index}].artifact_type`,
        message: `Invalid artifact_type '${input.artifact_type}'`,
        severity: 'warning'
      });
    }
    
    if (!input.path) {
      errors.push({
        field: `inputs[${index}].path`,
        message: `Input at index ${index} missing path`,
        severity: 'warning'
      });
    }
  });
}

/**
 * Validate retry_context if present.
 * retry_count must be <= 2 for normal tasks, <= 1 for high/critical tasks.
 * 
 * @param {DispatchPayload} dispatch - Dispatch payload
 * @param {Array} errors - Errors array to append to
 */
function validateRetryContext(dispatch, errors) {
  if (!dispatch.retry_context) return;
  
  const maxRetry = dispatch.risk_level === 'high' || dispatch.risk_level === 'critical' ? 1 : 2;
  
  if (dispatch.retry_context.retry_count > maxRetry) {
    errors.push({
      field: 'retry_context.retry_count',
      message: `retry_count ${dispatch.retry_context.retry_count} exceeds max ${maxRetry} for risk_level ${dispatch.risk_level}`,
      severity: 'error'
    });
  }
  
  if (!dispatch.retry_context.previous_failure_reason) {
    errors.push({
      field: 'retry_context.previous_failure_reason',
      message: 'retry_context.previous_failure_reason is required when retry_context is present',
      severity: 'warning'
    });
  }
  
  if (!dispatch.retry_context.required_fixes || !Array.isArray(dispatch.retry_context.required_fixes)) {
    errors.push({
      field: 'retry_context.required_fixes',
      message: 'retry_context.required_fixes must be an array',
      severity: 'warning'
    });
  }
}

/**
 * Validate role-command match.
 * Developer role cannot use architect-specific commands.
 * 
 * @param {DispatchPayload} dispatch - Dispatch payload
 * @returns {ValidationResult} Additional validation result
 */
function validateRoleCommandMatch(dispatch) {
  const errors = [];
  
  const roleCommands = {
    architect: ['design-task', 'evaluate-tradeoff', 'design-review'],
    developer: ['implement-task', 'fix-task', 'refactor-task'],
    tester: ['test-task', 'regression-task', 'verify-edge-cases'],
    reviewer: ['review-task', 'compare-spec-vs-code', 'risk-review'],
    docs: ['sync-readme', 'update-docs', 'write-changelog'],
    security: ['security-check', 'permission-review', 'dependency-risk-review']
  };
  
  if (dispatch.role && dispatch.command) {
    const validCommands = roleCommands[dispatch.role];
    if (validCommands && !validCommands.includes(dispatch.command)) {
      if (!validCommands.some(cmd => dispatch.command.startsWith(cmd.split('-')[0]))) {
        errors.push({
          field: 'command',
          message: `Command '${dispatch.command}' may not be appropriate for role '${dispatch.role}'`,
          severity: 'warning'
        });
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validate,
  validateRequiredFields,
  validateFieldTypes,
  validateEnums,
  validateContext,
  validateInputs,
  validateRetryContext,
  validateRoleCommandMatch,
  REQUIRED_FIELDS,
  VALID_ROLES,
  VALID_RISK_LEVELS,
  VALID_ARTIFACT_TYPES
};