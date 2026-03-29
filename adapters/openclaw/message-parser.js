/**
 * Message Parser - Parse OpenClaw dispatch messages to Dispatch Payload
 * 
 * Transforms OpenClaw message format to Dispatch Payload format per io-contract.md §1.
 * Based on spec.md §5.1 field mapping and AC-004, AC-005, AC-006, AC-007, AC-008.
 * 
 * @module adapters/openclaw/message-parser
 */

const { 
  validRoles, 
  validRiskLevels,
  RoleEnum,
  RiskLevelEnum
} = require('./types');
const crypto = require('crypto');

class MessageParser {
  /**
   * @param {object} config - Adapter configuration
   */
  constructor(config) {
    this.config = config;
    this.openclawConfig = config?.openclaw_config || {};
    this.defaultValues = this.openclawConfig?.default_values || {
      role: 'developer',
      command: 'implement-task',
      risk_level: 'medium'
    };
    this.idConfig = this.openclawConfig?.id_config || {
      dispatch_id_format: 'oc-dispatch-{timestamp}-{random}',
      project_id_format: '{project_id}'
    };
  }

  /**
   * Parse OpenClaw dispatch message into Dispatch Payload
   * @param {object} openClawMessage - OpenClaw dispatch message object
   * @returns {object} Parse result with success, dispatch_payload, errors
   */
  parse(openClawMessage) {
    const errors = [];
    const warnings = [];

    // Validate input is an object
    if (!openClawMessage || typeof openClawMessage !== 'object') {
      errors.push({
        field: 'message',
        message: 'OpenClaw message must be a non-null object',
        severity: 'error'
      });
      
      return {
        success: false,
        dispatch_payload: null,
        errors: errors,
        warnings: warnings
      };
    }

    // Validate role (AC-006)
    const roleValidation = this.validateRole(openClawMessage.role);
    if (!roleValidation.valid) {
      errors.push({
        field: 'role',
        message: roleValidation.message,
        severity: 'error'
      });
    }

    // Validate risk_level if present in task (AC-007)
    const taskRiskLevel = openClawMessage.task?.risk_level;
    if (taskRiskLevel) {
      const riskValidation = this.validateRiskLevel(taskRiskLevel);
      if (!riskValidation.valid) {
        errors.push({
          field: 'task.risk_level',
          message: riskValidation.message,
          severity: 'error'
        });
      }
    }

    // Validate required nested objects
    if (!openClawMessage.project) {
      errors.push({
        field: 'project',
        message: 'Project object is required',
        severity: 'error'
      });
    }

    if (!openClawMessage.milestone) {
      errors.push({
        field: 'milestone',
        message: 'Milestone object is required',
        severity: 'error'
      });
    }

    if (!openClawMessage.task) {
      errors.push({
        field: 'task',
        message: 'Task object is required',
        severity: 'error'
      });
    }

    // If we have critical errors, return early
    if (errors.some(e => e.severity === 'error')) {
      return {
        success: false,
        dispatch_payload: null,
        errors: errors,
        warnings: warnings
      };
    }

    // Build Dispatch Payload
    try {
      const dispatchPayload = this.buildDispatchPayload(openClawMessage);
      
      // Validate required fields in payload
      const requiredValidation = this.validateRequiredFields(dispatchPayload);
      if (!requiredValidation.valid) {
        requiredValidation.missing_fields.forEach(field => {
          warnings.push({
            field: field,
            message: `Required field '${field}' is empty or missing`,
            severity: 'warning'
          });
        });
      }

      return {
        success: true,
        dispatch_payload: dispatchPayload,
        errors: [],
        warnings: warnings
      };
    } catch (err) {
      errors.push({
        field: 'dispatch_payload',
        message: err.message,
        severity: 'error'
      });
      
      return {
        success: false,
        dispatch_payload: null,
        errors: errors,
        warnings: warnings
      };
    }
  }

  /**
   * Build Dispatch Payload from OpenClaw message
   * @param {object} message - OpenClaw dispatch message
   * @returns {object} Dispatch Payload
   */
  buildDispatchPayload(message) {
    // Generate dispatch_id if not provided (AC-008)
    const dispatchId = message.dispatch_id || this.generateDispatchId();
    
    // Map nested objects
    const project = this.mapProject(message.project);
    const milestone = this.mapMilestone(message.milestone);
    const task = this.mapTask(message.task);
    const context = this.mapContext(message.task?.context);

    return {
      // Required fields per io-contract.md §1
      dispatch_id: dispatchId,
      project_id: project.id,
      milestone_id: milestone.id,
      task_id: task.id,
      
      role: message.role || this.defaultValues.role,
      command: message.command || this.defaultValues.command,
      
      title: task.title,
      goal: task.goal,
      description: task.description,
      
      context: context,
      constraints: task.constraints || [],
      inputs: task.inputs || [],
      expected_outputs: task.expected_outputs || [],
      verification_steps: task.verification_steps || [],
      
      risk_level: task.risk_level || this.defaultValues.risk_level,
      
      // Optional fields
      retry_context: message.retry_context || null,
      
      // Metadata for traceability
      metadata: {
        source: 'openclaw',
        original_dispatch_id: message.dispatch_id,
        upstream_dependencies: message.upstream_dependencies || [],
        downstream_expectations: message.downstream_expectations || [],
        parsed_at: new Date().toISOString()
      }
    };
  }

  /**
   * Validate role value against validRoles array (AC-006)
   * @param {string} role - Role value to validate
   * @returns {object} Validation result with valid and message
   */
  validateRole(role) {
    if (!role) {
      return {
        valid: false,
        message: 'Role is required'
      };
    }

    if (typeof role !== 'string') {
      return {
        valid: false,
        message: 'Role must be a string'
      };
    }

    if (!validRoles.includes(role)) {
      return {
        valid: false,
        message: `Invalid role '${role}'. Must be one of: ${validRoles.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Validate risk level value against validRiskLevels array (AC-007)
   * @param {string} level - Risk level value to validate
   * @returns {object} Validation result with valid and message
   */
  validateRiskLevel(level) {
    if (!level) {
      return {
        valid: false,
        message: 'Risk level is required'
      };
    }

    if (typeof level !== 'string') {
      return {
        valid: false,
        message: 'Risk level must be a string'
      };
    }

    if (!validRiskLevels.includes(level)) {
      return {
        valid: false,
        message: `Invalid risk level '${level}'. Must be one of: ${validRiskLevels.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique dispatch ID (AC-008)
   * Format: oc-dispatch-{timestamp}-{random}
   * @returns {string} Generated dispatch ID
   */
  generateDispatchId() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `oc-dispatch-${timestamp}-${random}`;
  }

  /**
   * Map OpenClaw project object to project fields
   * @param {object} projectObj - OpenClaw project object
   * @returns {object} Mapped project with id, name, goal
   */
  mapProject(projectObj) {
    if (!projectObj) {
      return { id: null, name: null, goal: null };
    }

    return {
      id: projectObj.id || '',
      name: projectObj.name || '',
      goal: projectObj.goal || ''
    };
  }

  /**
   * Map OpenClaw milestone object to milestone fields
   * @param {object} milestoneObj - OpenClaw milestone object
   * @returns {object} Mapped milestone with id, name, goal, status
   */
  mapMilestone(milestoneObj) {
    if (!milestoneObj) {
      return { id: null, name: null, goal: null, status: null };
    }

    return {
      id: milestoneObj.id || '',
      name: milestoneObj.name || '',
      goal: milestoneObj.goal || '',
      status: milestoneObj.status || ''
    };
  }

  /**
   * Map OpenClaw task object to task fields
   * @param {object} taskObj - OpenClaw task object
   * @returns {object} Mapped task with all fields
   */
  mapTask(taskObj) {
    if (!taskObj) {
      return {
        id: null,
        title: '',
        goal: '',
        description: '',
        context: null,
        constraints: [],
        inputs: [],
        expected_outputs: [],
        verification_steps: [],
        risk_level: 'medium'
      };
    }

    return {
      id: taskObj.id || '',
      title: taskObj.title || '',
      goal: taskObj.goal || '',
      description: taskObj.description || '',
      context: taskObj.context || null,
      constraints: taskObj.constraints || [],
      inputs: this.mapInputs(taskObj.inputs || []),
      expected_outputs: taskObj.expected_outputs || [],
      verification_steps: taskObj.verification_steps || [],
      risk_level: taskObj.risk_level || 'medium'
    };
  }

  /**
   * Map OpenClaw context object to DispatchContext
   * @param {object} contextObj - OpenClaw context object
   * @returns {object} DispatchContext
   */
  mapContext(contextObj) {
    if (!contextObj) {
      return {
        project_goal: '',
        milestone_goal: '',
        task_scope: '',
        related_spec_sections: [],
        code_context_summary: '',
        upstream_task_summaries: [],
        related_artifacts: []
      };
    }

    return {
      project_goal: contextObj.project_goal || '',
      milestone_goal: contextObj.milestone_goal || '',
      task_scope: contextObj.task_scope || '',
      related_spec_sections: contextObj.related_spec_sections || [],
      code_context_summary: contextObj.code_context_summary || '',
      upstream_task_summaries: contextObj.upstream_task_summaries || [],
      related_artifacts: this.mapArtifacts(contextObj.related_artifacts || [])
    };
  }

  /**
   * Map input artifact references
   * @param {array} inputs - Array of input artifacts
   * @returns {array} Mapped ArtifactReference array
   */
  mapInputs(inputs) {
    if (!Array.isArray(inputs)) {
      return [];
    }

    return inputs.map(input => {
      if (typeof input === 'string') {
        // Simple string input - convert to artifact reference
        return {
          artifact_id: input,
          artifact_type: 'unknown',
          path: '',
          summary: ''
        };
      }

      return {
        artifact_id: input.artifact_id || '',
        artifact_type: input.artifact_type || '',
        path: input.path || '',
        summary: input.summary || ''
      };
    });
  }

  /**
   * Map related artifacts
   * @param {array} artifacts - Array of related artifacts
   * @returns {array} Mapped ArtifactReference array
   */
  mapArtifacts(artifacts) {
    if (!Array.isArray(artifacts)) {
      return [];
    }

    return artifacts.map(artifact => {
      if (typeof artifact === 'string') {
        return {
          artifact_id: artifact,
          artifact_type: 'unknown',
          path: '',
          summary: ''
        };
      }

      return {
        artifact_id: artifact.artifact_id || '',
        artifact_type: artifact.artifact_type || '',
        path: artifact.path || '',
        summary: artifact.summary || ''
      };
    });
  }

  /**
   * Validate that required fields are present in Dispatch Payload
   * @param {object} payload - Dispatch Payload to validate
   * @returns {object} Validation result with valid and missing_fields
   */
  validateRequiredFields(payload) {
    const required = [
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

    const missing = required.filter(field => {
      const value = payload[field];
      
      // For arrays, check if empty
      if (Array.isArray(value)) {
        return false; // Arrays are valid even if empty
      }
      
      // For objects, check if null
      if (value === null && field === 'retry_context') {
        return false; // retry_context is optional
      }
      
      // For other fields, check if undefined/null/empty string
      return value === undefined || value === null || value === '';
    });

    return {
      valid: missing.length === 0,
      missing_fields: missing
    };
  }
}

module.exports = { MessageParser };