/**
 * Issue Parser - Main parser for GitHub Issue to Dispatch Payload conversion
 * 
 * Orchestrates LabelParser and BodyParser to convert GitHub Issue
 * into standard Dispatch Payload format.
 */

const { LabelParser } = require('./label-parser');
const { BodyParser } = require('./body-parser');
const crypto = require('crypto');

class IssueParser {
  /**
   * @param {object} config - Adapter configuration
   */
  constructor(config) {
    this.config = config;
    this.labelParser = new LabelParser({
      label_mappings: config?.github_config?.label_mappings,
      validation: config?.validation
    });
    this.bodyParser = new BodyParser();
    this.defaultValues = config?.github_config?.default_values || {
      role: 'developer',
      command: 'implement-task',
      risk_level: 'medium'
    };
    this.dispatchConfig = config?.dispatch_config || {
      dispatch_id_format: 'gh-issue-{owner}-{repo}-{number}',
      project_id_format: '{owner}/{repo}'
    };
  }

  /**
   * Parse GitHub Issue into Dispatch Payload
   * @param {object} issue - GitHub Issue object
   * @returns {object} Parse result with dispatch_payload or errors
   */
  parse(issue) {
    const errors = [];
    const warnings = [];
    
    // 1. Parse labels
    const labelResult = this.labelParser.parse(issue.labels || []);
    warnings.push(...(labelResult.warnings || []));
    
    // 2. Parse body
    const bodyResult = this.bodyParser.parse(issue.body || '');
    warnings.push(...(bodyResult.warnings || []));
    
    // 3. Build Dispatch Payload
    try {
      const dispatchPayload = this.buildDispatchPayload(issue, labelResult, bodyResult);
      
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
   * Build Dispatch Payload from parsed components
   */
  buildDispatchPayload(issue, labelResult, bodyResult) {
    const owner = issue.repository?.owner?.login || issue.repository?.owner || 'unknown';
    const repo = issue.repository?.name || issue.repository?.repo || 'unknown';
    
    const projectId = this._extractProjectId(issue);
    const effectiveOwner = projectId !== 'unknown/unknown' ? projectId.split('/')[0] : owner;
    const effectiveRepo = projectId !== 'unknown/unknown' ? projectId.split('/')[1] : repo;
    
    return {
      // Required fields
      dispatch_id: this.buildDispatchId(effectiveOwner, effectiveRepo, issue.number),
      project_id: projectId,
      milestone_id: labelResult.milestone_id || issue.milestone?.title || null,
      task_id: labelResult.task_id || null,
      
      role: labelResult.role || this.defaultValues.role,
      command: labelResult.command || this.defaultValues.command,
      
      title: issue.title,
      goal: bodyResult.goal || issue.title,
      description: bodyResult.description || issue.body || '',
      
      context: {
        task_scope: bodyResult.context?.task_scope || '',
        project_goal: bodyResult.context?.project_goal,
        milestone_goal: bodyResult.context?.milestone_goal,
        code_context_summary: bodyResult.context?.code_context_summary,
        related_spec_sections: [],
        code_context_summary: bodyResult.context?.code_context_summary || ''
      },
      
      constraints: bodyResult.constraints?.length > 0 
        ? bodyResult.constraints 
        : ['No specific constraints'],
      
      inputs: bodyResult.inputs || [],
      
      expected_outputs: bodyResult.expected_outputs?.length > 0
        ? bodyResult.expected_outputs
        : this.getDefaultExpectedOutputs(labelResult.role, labelResult.command),
      
      verification_steps: this.getDefaultVerificationSteps(labelResult.role),
      
      risk_level: labelResult.risk_level || this.defaultValues.risk_level,
      
      // Metadata
      metadata: {
        source: 'github-issue',
        issue_number: issue.number,
        issue_url: issue.html_url,
        created_by: issue.user?.login,
        created_at: issue.created_at
      }
    };
  }

  /**
   * Build dispatch_id from issue metadata
   */
  buildDispatchId(owner, repo, issueNumber) {
    return `gh-issue-${owner}-${repo}-${issueNumber}`;
  }

  /**
   * Build project_id from repository
   */
  buildProjectId(owner, repo) {
    return `${owner}/${repo}`;
  }

/**
    * Extract project_id from Issue's repository_url field or repository object
    * @param {object} issue - GitHub Issue object
    * @returns {string} project_id in format {owner}/{repo}
    */
  _extractProjectId(issue) {
    const repositoryUrl = issue.repository_url;
    if (repositoryUrl) {
      const match = repositoryUrl.match(/repos\/([^/]+)\/([^/]+)$/);
      if (match) {
        return `${match[1]}/${match[2]}`;
      }
    }
    
    const repository = issue.repository;
    if (repository) {
      const owner = repository.owner?.login || repository.owner;
      const name = repository.name || repository.repo;
      if (owner && name) {
        return `${owner}/${name}`;
      }
    }
    
    return 'unknown/unknown';
  }

  /**
   * Get default expected outputs based on role/command
   */
  getDefaultExpectedOutputs(role, command) {
    const defaults = {
      architect: ['design-note', 'open-questions'],
      developer: ['implementation-summary', 'code-changes'],
      tester: ['verification-report', 'test-cases'],
      reviewer: ['review-findings-report'],
      docs: ['docs-sync-report', 'changelog-entry'],
      security: ['security-review-report']
    };
    
    return defaults[role] || ['execution-result'];
  }

  /**
   * Get default verification steps based on role
   */
  getDefaultVerificationSteps(role) {
    const defaults = {
      architect: ['design-review', 'stakeholder-approval'],
      developer: ['build', 'unit-test', 'self-check'],
      tester: ['test-execution', 'coverage-check'],
      reviewer: ['code-review', 'spec-alignment'],
      docs: ['docs-accuracy', 'link-validation'],
      security: ['vulnerability-scan', 'auth-review']
    };
    
    return defaults[role] || ['verification'];
  }

  /**
   * Validate that required fields are present
   */
  validateRequiredFields(payload) {
    const required = [
      'dispatch_id', 'project_id', 'milestone_id', 'task_id',
      'role', 'command', 'title', 'goal', 'description',
      'context', 'constraints', 'inputs', 'expected_outputs',
      'verification_steps', 'risk_level'
    ];
    
    const missing = required.filter(field => {
      const value = payload[field];
      return value === undefined || value === null || value === '';
    });
    
    return {
      valid: missing.length === 0,
      missing_fields: missing
    };
  }
}

module.exports = { IssueParser };