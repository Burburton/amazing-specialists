/**
 * GitHub Issue Orchestrator Adapter
 * 
 * Main entry point implementing OrchestratorAdapter interface.
 * Converts GitHub Issues to Dispatch Payloads for Expert Pack execution.
 * 
 * @implements {OrchestratorAdapter}
 * @see io-contract.md §8
 */

const { IssueParser } = require('./issue-parser');
const { GitHubClient } = require('./github-client');
const { WebhookHandler } = require('./webhook-handler');
const { CommentTemplates } = require('./comment-templates');
const { RetryHandler } = require('./retry-handler');

class GitHubIssueAdapter {
  /**
   * @param {object} config - Adapter configuration
   */
  constructor(config) {
    this.config = config;
    this.adapterId = config?.adapter_id || 'github-issue';
    this.adapterType = 'orchestrator';
    this.priority = config?.priority || 'later';
    this.version = config?.version || '1.0.0';
    
    // Initialize components
    this.issueParser = new IssueParser(config);
    this.githubClient = new GitHubClient(config?.github_config);
    this.webhookHandler = new WebhookHandler(config);
    this.commentTemplates = new CommentTemplates();
    this.retryHandler = new RetryHandler(config?.github_config?.retry_config);
  }

  // ==================== Core OrchestratorAdapter Methods ====================

  /**
   * Normalize GitHub Issue to Dispatch Payload
   * @param {object} issue - GitHub Issue object
   * @returns {object} Dispatch Payload
   */
  normalizeInput(issue) {
    const result = this.issueParser.parse(issue);
    
    if (!result.success) {
      throw new Error(`Failed to parse Issue: ${result.errors.map(e => e.message).join(', ')}`);
    }
    
    return result.dispatch_payload;
  }

  /**
   * Validate Dispatch Payload against io-contract.md §1
   * @param {object} dispatch - Dispatch Payload to validate
   * @returns {object} ValidationResult
   */
  validateDispatch(dispatch) {
    const requiredFields = [
      'dispatch_id', 'project_id', 'milestone_id', 'task_id',
      'role', 'command', 'title', 'goal', 'description',
      'context', 'constraints', 'inputs', 'expected_outputs',
      'verification_steps', 'risk_level'
    ];
    
    const errors = [];
    
    for (const field of requiredFields) {
      const value = dispatch[field];
      if (value === undefined || value === null || value === '') {
        errors.push({
          field,
          message: `Missing required field: ${field}`,
          severity: 'error'
        });
      }
    }
    
    // Validate role enum
    const validRoles = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];
    if (dispatch.role && !validRoles.includes(dispatch.role)) {
      errors.push({
        field: 'role',
        message: `Invalid role: ${dispatch.role}. Must be one of: ${validRoles.join(', ')}`,
        severity: 'error'
      });
    }
    
    // Validate risk_level enum
    const validRiskLevels = ['low', 'medium', 'high', 'critical'];
    if (dispatch.risk_level && !validRiskLevels.includes(dispatch.risk_level)) {
      errors.push({
        field: 'risk_level',
        message: `Invalid risk_level: ${dispatch.risk_level}. Must be one of: ${validRiskLevels.join(', ')}`,
        severity: 'error'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Route Dispatch Payload to execution entry point
   * @param {object} dispatch - Validated Dispatch Payload
   */
  routeToExecution(dispatch) {
    // This would be implemented by the integration layer
    // For now, return the dispatch for external routing
    return {
      routed: true,
      dispatch_id: dispatch.dispatch_id,
      role: dispatch.role,
      command: dispatch.command
    };
  }

  /**
   * Map GitHub API error to Execution Status
   * @param {object} error - GitHub API error
   * @returns {string} Execution status
   */
  mapError(error) {
    const status = error?.status || error?.response?.status;
    
    if (!status) {
      return 'FAILED_RETRYABLE';
    }
    
    switch (status) {
      case 404:
        return 'BLOCKED'; // Resource not found
      case 403:
        return 'BLOCKED'; // Permission denied
      case 401:
        return 'BLOCKED'; // Authentication failed
      case 422:
        return 'FAILED_RETRYABLE'; // Validation error, might be fixable
      case 500:
      case 502:
      case 503:
        return 'FAILED_RETRYABLE'; // Server errors
      default:
        return 'FAILED_RETRYABLE';
    }
  }

  // ==================== Escalation Methods ====================

  /**
   * Generate Escalation from context
   * @param {object} context - Escalation context
   * @returns {object} Escalation object
   */
  generateEscalation(context) {
    return {
      escalation_id: `esc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dispatch_id: context.dispatch_id,
      project_id: context.project_id,
      milestone_id: context.milestone_id,
      task_id: context.task_id,
      role: context.role,
      level: context.level || 'USER',
      reason_type: context.reason_type || 'OUT_OF_SCOPE_REQUEST',
      summary: context.summary,
      blocking_points: context.blocking_points || [],
      attempted_actions: context.attempted_actions || [],
      recommended_next_steps: context.recommended_next_steps || [],
      options: context.options || [],
      requires_user_decision: context.requires_user_decision ?? true,
      created_at: new Date().toISOString(),
      created_by: 'github-issue-adapter'
    };
  }

  /**
   * Post escalation comment to GitHub Issue
   * @param {object} escalation - Escalation object
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   */
  async postEscalation(escalation, owner, repo, issueNumber) {
    const commentBody = this.commentTemplates.escalation(escalation);
    
    await this.githubClient.postComment(owner, repo, issueNumber, commentBody);
    
    // Add escalation label
    await this.githubClient.addLabel(owner, repo, issueNumber, 'escalation:needs-decision');
  }

  // ==================== Retry Methods ====================

  /**
   * Handle retry decision
   * @param {object} retryContext - Retry context
   * @returns {object} Retry decision
   */
  handleRetry(retryContext) {
    return this.retryHandler.shouldRetry(retryContext);
  }

  /**
   * Post retry comment to GitHub Issue
   * @param {object} context - Retry context
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   */
  async postRetryComment(context, owner, repo, issueNumber) {
    const vars = this.retryHandler.formatRetryCommentVars(context);
    const commentBody = this.commentTemplates.retry(vars);
    
    await this.githubClient.postComment(owner, repo, issueNumber, commentBody);
  }

  // ==================== Webhook Methods ====================

  /**
   * Handle incoming webhook request
   * @param {object} request - HTTP request
   * @param {string} secret - Webhook secret
   * @returns {object} Processed result
   */
  async handleWebhook(request, secret) {
    return this.webhookHandler.handleRequest(request, secret);
  }

  // ==================== Result Methods ====================

  /**
   * Post execution result comment to GitHub Issue
   * @param {object} result - Execution result
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   */
  async postResult(result, owner, repo, issueNumber) {
    const commentBody = this.commentTemplates.result({
      status: result.status,
      role: result.role,
      command: result.command,
      summary: result.summary,
      artifacts: result.artifacts,
      recommendation: result.recommendation
    });
    
    await this.githubClient.postComment(owner, repo, issueNumber, commentBody);
    
    // Add status label based on result
    const statusLabel = result.status === 'SUCCESS' ? 'status:completed' : 
                        result.status === 'FAILED_ESCALATE' ? 'status:needs-attention' :
                        'status:in-progress';
    
    await this.githubClient.addLabel(owner, repo, issueNumber, statusLabel);
  }

  // ==================== Metadata ====================

  /**
   * Get adapter information
   * @returns {object} Adapter info
   */
  getAdapterInfo() {
    return {
      adapter_id: this.adapterId,
      adapter_type: this.adapterType,
      version: this.version,
      priority: this.priority,
      status: 'implemented',
      description: 'GitHub Issue Orchestrator Adapter for triggering tasks via GitHub Issues',
      compatible_profiles: ['minimal', 'full'],
      compatible_workspaces: ['github-pr', 'local-repo']
    };
  }
}

module.exports = { GitHubIssueAdapter };