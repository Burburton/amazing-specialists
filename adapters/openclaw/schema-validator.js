/**
 * OpenClaw Orchestrator Adapter - Schema Validator
 * 
 * Validates Dispatch Payload against io-contract.md §1 schema.
 * Based on spec.md §5.1 and AC-006, AC-007.
 * 
 * @module adapters/openclaw/schema-validator
 */

const { validRoles, validRiskLevels } = require('./types');

/**
 * SchemaValidator - Validates Dispatch Payload structure and values
 */
class SchemaValidator {
  /**
   * Required fields for Dispatch Payload
   * @see io-contract.md §1
   */
  static REQUIRED_FIELDS = [
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
   * Validate a dispatch payload
   * 
   * @param {Object} dispatch - The dispatch payload to validate
   * @returns {Object} Validation result with { isValid: boolean, errors: Array }
   * 
   * @example
   * const validator = new SchemaValidator();
   * const result = validator.validate(dispatch);
   * if (!result.isValid) {
   *   console.error('Validation errors:', result.errors);
   * }
   */
  validate(dispatch) {
    const errors = [];

    // Guard: dispatch must be an object
    if (!dispatch || typeof dispatch !== 'object') {
      errors.push({
        field: 'root',
        message: 'Dispatch payload must be a non-null object',
        severity: 'error'
      });
      return { isValid: false, errors };
    }

    // Check all required fields exist and are non-empty
    for (const field of SchemaValidator.REQUIRED_FIELDS) {
      const error = this._validateRequiredField(dispatch, field);
      if (error) {
        errors.push(error);
      }
    }

    // Validate role enum (only if field exists to avoid duplicate errors)
    if (dispatch.role !== undefined && dispatch.role !== null && dispatch.role !== '') {
      const roleError = this._validateRole(dispatch.role);
      if (roleError) {
        errors.push(roleError);
      }
    }

    // Validate risk_level enum (only if field exists to avoid duplicate errors)
    if (dispatch.risk_level !== undefined && dispatch.risk_level !== null && dispatch.risk_level !== '') {
      const riskError = this._validateRiskLevel(dispatch.risk_level);
      if (riskError) {
        errors.push(riskError);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate a required field exists and is non-empty
   * 
   * @private
   * @param {Object} dispatch - The dispatch payload
   * @param {string} field - The field name to validate
   * @returns {Object|null} Error object if validation fails, null if valid
   */
  _validateRequiredField(dispatch, field) {
    const value = dispatch[field];

    // Check existence
    if (value === undefined || value === null) {
      return {
        field,
        message: `Required field '${field}' is missing`,
        severity: 'error'
      };
    }

    // Check non-empty for strings
    if (typeof value === 'string' && value.trim() === '') {
      return {
        field,
        message: `Required field '${field}' must be a non-empty string`,
        severity: 'error'
      };
    }

    // Check non-empty for arrays
    if (Array.isArray(value) && value.length === 0) {
      return {
        field,
        message: `Required field '${field}' must be a non-empty array`,
        severity: 'error'
      };
    }

    // Check non-null for objects (context)
    if (typeof value === 'object' && !Array.isArray(value)) {
      // context is allowed to be an empty object with optional subfields
      // But it must exist - we've already checked for null/undefined above
      // For context, we accept empty object {} as valid per io-contract.md
      return null;
    }

    return null;
  }

  /**
   * Validate role against validRoles array
   * 
   * @private
   * @param {string} role - The role value to validate
   * @returns {Object|null} Error object if validation fails, null if valid
   */
  _validateRole(role) {
    if (!validRoles.includes(role)) {
      return {
        field: 'role',
        message: `Invalid role '${role}'. Must be one of: ${validRoles.join(', ')}`,
        severity: 'error'
      };
    }
    return null;
  }

  /**
   * Validate risk_level against validRiskLevels array
   * 
   * @private
   * @param {string} riskLevel - The risk level value to validate
   * @returns {Object|null} Error object if validation fails, null if valid
   */
  _validateRiskLevel(riskLevel) {
    if (!validRiskLevels.includes(riskLevel)) {
      return {
        field: 'risk_level',
        message: `Invalid risk_level '${riskLevel}'. Must be one of: ${validRiskLevels.join(', ')}`,
        severity: 'error'
      };
    }
    return null;
  }
}

module.exports = { SchemaValidator };