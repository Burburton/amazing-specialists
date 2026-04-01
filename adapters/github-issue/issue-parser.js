/**
 * Issue Parser - Main parser for GitHub Issue to Dispatch Payload conversion
 *
 * Orchestrates LabelParser and BodyParser to convert GitHub Issue
 * into standard Dispatch Payload format.
 *
 * Reference: specs/032-workflow-extensibility-enhancements/spec.md (R2: Template → Command 映射)
 */

const { LabelParser } = require('./label-parser');
const { BodyParser } = require('./body-parser');
const crypto = require('crypto');

const DEFAULT_TEMPLATE_MAPPING = {
  'task.md': 'implement-task',
  'bug.md': 'bugfix-workflow',
  'bugfix.md': 'bugfix-workflow',
  'design.md': 'design-task',
  'refactor.md': 'refactor-task',
  'test.md': 'test-task'
};

class IssueParser {
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
    this.templateMapping = config?.github_config?.template_mapping || DEFAULT_TEMPLATE_MAPPING;
  }

  parse(issue) {
    const errors = [];
    const warnings = [];

    const labelResult = this.labelParser.parse(issue.labels || []);
    warnings.push(...(labelResult.warnings || []));

    const bodyResult = this.bodyParser.parse(issue.body || '');
    warnings.push(...(bodyResult.warnings || []));

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

  buildDispatchPayload(issue, labelResult, bodyResult) {
    const owner = issue.repository?.owner?.login || issue.repository?.owner || 'unknown';
    const repo = issue.repository?.name || issue.repository?.repo || 'unknown';

    const projectId = this._extractProjectId(issue);
    const effectiveOwner = projectId !== 'unknown/unknown' ? projectId.split('/')[0] : owner;
    const effectiveRepo = projectId !== 'unknown/unknown' ? projectId.split('/')[1] : repo;

    const command = this.inferCommandFromTemplate(issue, labelResult);

    return {
      dispatch_id: this.buildDispatchId(effectiveOwner, effectiveRepo, issue.number),
      project_id: projectId,
      milestone_id: labelResult.milestone_id || issue.milestone?.title || null,
      task_id: labelResult.task_id || null,

      role: labelResult.role || this.defaultValues.role,
      command: command,

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

      metadata: {
        source: 'github-issue',
        issue_number: issue.number,
        issue_url: issue.html_url,
        created_by: issue.user?.login,
        created_at: issue.created_at
      }
    };
  }

  inferCommandFromTemplate(issue, labelResult) {
    if (labelResult.command) {
      return labelResult.command;
    }

    const templateName = this._inferTemplateName(issue);
    if (templateName && this.templateMapping[templateName]) {
      return this.templateMapping[templateName];
    }

    return this.defaultValues.command;
  }

  _inferTemplateName(issue) {
    const labels = issue.labels || [];

    for (const label of labels) {
      const labelName = typeof label === 'string' ? label : label.name || '';

      if (labelName.includes('bug') || labelName.includes('bugfix')) {
        return 'bug.md';
      }
      if (labelName.includes('design') || labelName.includes('architecture')) {
        return 'design.md';
      }
      if (labelName.includes('refactor')) {
        return 'refactor.md';
      }
      if (labelName.includes('test')) {
        return 'test.md';
      }
      if (labelName.includes('task') || labelName.includes('feature')) {
        return 'task.md';
      }
    }

    const title = (issue.title || '').toLowerCase();
    if (title.includes('fix') || title.includes('bug')) {
      return 'bug.md';
    }
    if (title.includes('design') || title.includes('architecture')) {
      return 'design.md';
    }
    if (title.includes('refactor')) {
      return 'refactor.md';
    }

    return null;
  }

  buildDispatchId(owner, repo, issueNumber) {
    return `gh-issue-${owner}-${repo}-${issueNumber}`;
  }

  buildProjectId(owner, repo) {
    return `${owner}/${repo}`;
  }

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

module.exports = { IssueParser, DEFAULT_TEMPLATE_MAPPING };