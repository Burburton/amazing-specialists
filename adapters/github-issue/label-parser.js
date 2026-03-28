/**
 * label-parser.js
 * 
 * Label parser for the GitHub Issue Orchestrator Adapter.
 * Parses GitHub labels and extracts dispatch fields per io-contract.md §1.
 * 
 * Reference: docs/adapters/github-issue-adapter-design.md §Label Parsing Rules
 * Reference: ADAPTERS.md §Orchestrator Adapter §GitHub Issue
 */

'use strict';

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
 * Milestone ID pattern: M### (e.g., M001, M002)
 * @constant {RegExp}
 */
const MILESTONE_PATTERN = /^M\d{3}$/;

/**
 * Task ID pattern: T### (e.g., T001, T002)
 * @constant {RegExp}
 */
const TASK_PATTERN = /^T\d{3}$/;

/**
 * LabelParser class for extracting dispatch fields from GitHub labels.
 * 
 * Business Rules (from spec):
 * - BR-001: At least one `role:*` label required for dispatch (returns warning)
 * - BR-002: If multiple `role:*` labels, use first one
 * - Returns warnings for unrecognized labels
 */
class LabelParser {
  /**
   * Create a LabelParser instance.
   * 
   * @param {Object} config - Configuration object with label_mappings
   * @param {Object} config.label_mappings - Label prefix mappings from github-issue.config.json
   * @param {string} config.label_mappings.milestone_prefix - e.g., "milestone:"
   * @param {string} config.label_mappings.role_prefix - e.g., "role:"
   * @param {string} config.label_mappings.command_prefix - e.g., "command:"
   * @param {string} config.label_mappings.task_prefix - e.g., "task:"
   * @param {string} config.label_mappings.risk_prefix - e.g., "risk:"
   * @param {string} config.label_mappings.escalation_prefix - e.g., "escalation:"
   * @param {string} config.label_mappings.status_prefix - e.g., "status:"
   * @throws {Error} If config or label_mappings is missing
   */
  constructor(config) {
    if (!config) {
      throw new Error('LabelParser requires a config object');
    }
    if (!config.label_mappings) {
      throw new Error('LabelParser requires config.label_mappings');
    }
    
    this.labelMappings = config.label_mappings;
    this.validationConfig = config.validation || {};
  }

  /**
   * Parse GitHub labels and extract dispatch fields.
   * 
   * @param {Array<{name: string}>} labels - Array of GitHub label objects
   * @returns {LabelParseResult} Parsed result with extracted fields and warnings
   * 
   * @example
   * const parser = new LabelParser(config);
   * const result = parser.parse([
   *   { name: 'milestone:M001' },
   *   { name: 'role:developer' },
   *   { name: 'risk:high' }
   * ]);
   * // Returns: { milestone_id: 'M001', role: 'developer', risk_level: 'high', ... }
   */
  parse(labels) {
    const result = {
      milestone_id: null,
      task_id: null,
      role: null,
      command: null,
      risk_level: null,
      unrecognized_labels: [],
      warnings: []
    };

    if (!labels || !Array.isArray(labels) || labels.length === 0) {
      result.warnings.push('No labels provided for parsing');
      if (this.validationConfig.require_role_label) {
        result.warnings.push('BR-001: At least one role:* label required for dispatch');
      }
      return result;
    }

    const roleLabelsFound = [];

    for (const label of labels) {
      if (!label || typeof label.name !== 'string') {
        result.warnings.push(`Malformed label object: ${JSON.stringify(label)}`);
        continue;
      }

      const labelName = label.name.trim();
      if (!labelName) {
        result.warnings.push('Empty label name encountered');
        continue;
      }

      if (!this._parseLabel(labelName, result, roleLabelsFound)) {
        result.unrecognized_labels.push(labelName);
      }
    }

    if (roleLabelsFound.length >= 1) {
      result.role = roleLabelsFound[0];
      if (roleLabelsFound.length > 1) {
        result.warnings.push(`BR-002: Multiple role labels found (${roleLabelsFound.join(', ')}), using first: ${roleLabelsFound[0]}`);
      }
    }

    if (this.validationConfig.require_role_label && result.role === null) {
      result.warnings.push('BR-001: At least one role:* label required for dispatch');
    }

    return result;
  }

  _parseLabel(labelName, result, roleLabelsFound) {
    const mappings = this.labelMappings;

    if (mappings.milestone_prefix && labelName.startsWith(mappings.milestone_prefix)) {
      const value = labelName.slice(mappings.milestone_prefix.length);
      if (MILESTONE_PATTERN.test(value)) {
        result.milestone_id = value;
        return true;
      }
      result.warnings.push(`Invalid milestone format: '${labelName}' (expected M###)`);
      return true;
    }

    if (mappings.task_prefix && labelName.startsWith(mappings.task_prefix)) {
      const value = labelName.slice(mappings.task_prefix.length);
      if (TASK_PATTERN.test(value)) {
        result.task_id = value;
        return true;
      }
      result.warnings.push(`Invalid task format: '${labelName}' (expected T###)`);
      return true;
    }

    if (mappings.role_prefix && labelName.startsWith(mappings.role_prefix)) {
      const value = labelName.slice(mappings.role_prefix.length).toLowerCase();
      if (VALID_ROLES.includes(value)) {
        roleLabelsFound.push(value);
        return true;
      }
      result.warnings.push(`Invalid role value: '${labelName}' (valid roles: ${VALID_ROLES.join(', ')})`);
      return true;
    }

    if (mappings.command_prefix && labelName.startsWith(mappings.command_prefix)) {
      const value = labelName.slice(mappings.command_prefix.length);
      if (value) {
        result.command = value;
        return true;
      }
      result.warnings.push(`Empty command value: '${labelName}'`);
      return true;
    }

    if (mappings.risk_prefix && labelName.startsWith(mappings.risk_prefix)) {
      const value = labelName.slice(mappings.risk_prefix.length).toLowerCase();
      if (VALID_RISK_LEVELS.includes(value)) {
        result.risk_level = value;
        return true;
      }
      result.warnings.push(`Invalid risk level: '${labelName}' (valid levels: ${VALID_RISK_LEVELS.join(', ')})`);
      return true;
    }

    if (mappings.escalation_prefix && labelName.startsWith(mappings.escalation_prefix)) {
      return true;
    }

    if (mappings.status_prefix && labelName.startsWith(mappings.status_prefix)) {
      return true;
    }

    return false;
  }

  static getValidRoles() {
    return VALID_ROLES;
  }

  static getValidRiskLevels() {
    return VALID_RISK_LEVELS;
  }
}

/**
 * @typedef {Object} LabelParseResult
 * @property {string|null} milestone_id - Milestone ID (e.g., 'M001')
 * @property {string|null} task_id - Task ID (e.g., 'T001')
 * @property {string|null} role - Role enum value (architect|developer|tester|reviewer|docs|security)
 * @property {string|null} command - Command name
 * @property {string|null} risk_level - Risk level enum value (low|medium|high|critical)
 * @property {string[]} unrecognized_labels - Labels not matching any pattern
 * @property {string[]} warnings - Warning messages for validation/edge cases
 */

/**
 * @typedef {Object} GitHubLabel
 * @property {number} id - Label ID
 * @property {string} name - Label name
 * @property {string|null} description - Label description
 * @property {string} color - Label color
 */

module.exports = {
  LabelParser,
  VALID_ROLES,
  VALID_RISK_LEVELS
};