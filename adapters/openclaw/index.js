/**
 * OpenClaw Orchestrator Adapter
 * 
 * Main entry point implementing OrchestratorAdapter interface.
 * Converts OpenClaw dispatch messages to Dispatch Payloads for Expert Pack execution.
 * 
 * @implements {OrchestratorAdapter}
 * @see io-contract.md §8
 * @see specs/023-openclaw-adapter/spec.md
 */

const { OpenClawClient } = require('./openclaw-client');
const { MessageParser } = require('./message-parser');
const { SchemaValidator } = require('./schema-validator');
const { ResultSender } = require('./result-sender');
const { EscalationHandler } = require('./escalation-handler');
const { RetryHandler } = require('./retry-handler');
const { HeartbeatSender } = require('./heartbeat-sender');

const {
  ExecutionStatusEnum,
  RecommendationEnum,
  EscalationLevelEnum
} = require('./types');

class OpenClawAdapter {
  
  constructor(config = {}) {
    this.adapterId = config.adapter_id || 'openclaw';
    this.adapterType = 'orchestrator';
    this.priority = config.priority || 'later';
    this.version = config.version || '1.0.0';
    
    this.config = config.openclaw_config || {};
    
    this.client = new OpenClawClient({
      apiBaseUrl: this._resolveEnvVar(this.config.api_base_url),
      token: this._getEnvVar(this.config.authentication?.token_env_var),
      endpoints: this.config.endpoints,
      timeoutConfig: this.config.timeout_config,
      retryConfig: this.config.retry_config
    });
    
    this.messageParser = new MessageParser(config);
    this.schemaValidator = new SchemaValidator();
    this.resultSender = new ResultSender(this.client, this.config);
    this.escalationHandler = new EscalationHandler(this.client, this.config);
    this.retryHandler = new RetryHandler(this.config.retry_config);
    this.heartbeatSender = new HeartbeatSender(this.client, this.config.heartbeat_config);
  }

  normalizeInput(message) {
    const result = this.messageParser.parse(message);
    
    if (!result.success) {
      throw new Error(
        `Failed to parse OpenClaw message: ${result.errors.map(e => e.message).join(', ')}`
      );
    }
    
    return result.dispatch_payload;
  }

  validateDispatch(dispatch) {
    return this.schemaValidator.validate(dispatch);
  }

  routeToExecution(dispatch) {
    return {
      routed: true,
      dispatch_id: dispatch.dispatch_id,
      role: dispatch.role,
      command: dispatch.command,
      project_id: dispatch.project_id,
      milestone_id: dispatch.milestone_id,
      task_id: dispatch.task_id
    };
  }

  mapError(error) {
    const status = error?.status || error?.response?.status || error?.statusCode;
    
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
      return ExecutionStatusEnum.FAILED_RETRYABLE;
    }
    
    if (!status) {
      return ExecutionStatusEnum.FAILED_RETRYABLE;
    }
    
    switch (status) {
      case 401:
      case 403:
        return ExecutionStatusEnum.BLOCKED;
      case 404:
        return ExecutionStatusEnum.BLOCKED;
      case 422:
        return ExecutionStatusEnum.FAILED_RETRYABLE;
      case 429:
        return ExecutionStatusEnum.BLOCKED;
      case 500:
      case 502:
      case 503:
      case 504:
        return ExecutionStatusEnum.FAILED_RETRYABLE;
      default:
        return ExecutionStatusEnum.FAILED_RETRYABLE;
    }
  }

  generateEscalation(context) {
    const escalationId = this.escalationHandler.generateEscalationId();
    
    return {
      escalation_id: escalationId,
      dispatch_id: context.dispatch_id,
      project_id: context.project_id,
      milestone_id: context.milestone_id,
      task_id: context.task_id,
      role: context.role,
      level: context.level || EscalationLevelEnum.USER,
      reason_type: context.reason_type || 'EXECUTION_BLOCKED',
      summary: context.summary,
      blocking_points: context.blocking_points || [],
      evidence: context.evidence || {},
      attempted_actions: context.attempted_actions || [],
      recommended_next_steps: context.recommended_next_steps || [],
      options: context.options || [],
      recommended_option: context.recommended_option,
      required_decision: context.required_decision,
      impact_if_continue: context.impact_if_continue,
      impact_if_stop: context.impact_if_stop,
      requires_user_decision: context.requires_user_decision ?? true,
      requires_acknowledgment: context.requires_acknowledgment ?? true,
      created_at: new Date().toISOString(),
      created_by: 'openclaw-adapter'
    };
  }

  async sendEscalationCallback(escalation) {
    return this.escalationHandler.send(escalation);
  }

  handleRetry(retryContext) {
    return this.retryHandler.shouldRetry(retryContext);
  }

  async logRetry(retryLog) {
    await this.client.postRetryLog(retryLog);
  }

  async sendExecutionResult(result) {
    return this.resultSender.send(result);
  }

  async sendHeartbeat(dispatchId, status, progress) {
    return this.heartbeatSender.sendHeartbeat(dispatchId, status, progress);
  }

  startHeartbeat(dispatchId, estimatedLengthSeconds) {
    this.heartbeatSender.start(dispatchId, estimatedLengthSeconds);
  }

  stopHeartbeat(dispatchId) {
    this.heartbeatSender.stop(dispatchId);
  }

  updateHeartbeatProgress(dispatchId, progress) {
    this.heartbeatSender.updateProgress(dispatchId, progress);
  }

  updateHeartbeatStatus(dispatchId, status) {
    this.heartbeatSender.updateStatus(dispatchId, status);
  }

  setAuthToken(token, expiresAt) {
    this.client.setAuthToken(token, expiresAt);
  }

  async refreshToken() {
    return this.client.refreshToken();
  }

  getRateLimitInfo() {
    return this.client.getRateLimitInfo();
  }

  getAdapterInfo() {
    return {
      adapter_id: this.adapterId,
      adapter_type: this.adapterType,
      version: this.version,
      priority: this.priority,
      status: 'implemented',
      description: 'OpenClaw Orchestrator Adapter for bidirectional communication between OpenClaw and Expert Pack',
      compatible_profiles: ['minimal', 'full'],
      compatible_workspaces: ['github-pr', 'local-repo'],
      features: {
        dispatch_normalization: true,
        execution_result_callback: true,
        escalation_callback: true,
        retry_with_policy: true,
        heartbeat_mechanism: true,
        jwt_authentication: true,
        api_key_authentication: true
      }
    };
  }

  _resolveEnvVar(value) {
    if (!value) return value;
    
    const envMatch = value.match(/^\$\{(.+)\}$/);
    if (envMatch) {
      return process.env[envMatch[1]] || value;
    }
    
    const envMatch2 = value.match(/^\$(.+)/);
    if (envMatch2) {
      return process.env[envMatch2[1]] || value;
    }
    
    return value;
  }

  _getEnvVar(envVarName) {
    if (!envVarName) return undefined;
    return process.env[envVarName];
  }
}

module.exports = { OpenClawAdapter };