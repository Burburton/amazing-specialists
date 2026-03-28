/**
 * index.js
 * 
 * Main entry point for CLI/Local Orchestrator Adapter.
 * Exports all modules and provides OrchestratorAdapter interface implementation.
 * 
 * Reference: io-contract.md §8, ADAPTERS.md
 */

'use strict';

const argParser = require('./arg-parser');
const dispatchNormalizer = require('./dispatch-normalizer');
const dispatchValidator = require('./dispatch-validator');
const escalationHandler = require('./escalation-handler');
const retryHandler = require('./retry-handler');

const config = require('./cli-local.config.json');

/**
 * OrchestratorAdapter implementation for CLI/Local.
 * Implements interface defined in adapters/interfaces/orchestrator-adapter.interface.ts.
 */
const CliLocalAdapter = {
  
  normalizeInput(externalInput) {
    const parsed = argParser.parseArgs(externalInput);
    const validation = argParser.validateRequiredFields(parsed);
    
    if (!validation.isValid) {
      throw new Error(`Invalid CLI arguments: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    return dispatchNormalizer.normalize(parsed);
  },
  
  validateDispatch(dispatch) {
    return dispatchValidator.validate(dispatch);
  },
  
  routeToExecution(dispatch) {
    console.log(`Routing to execution: role=${dispatch.role}, command=${dispatch.command}`);
    return {
      routed: true,
      role: dispatch.role,
      command: dispatch.command,
      dispatch_id: dispatch.dispatch_id
    };
  },
  
  mapError(error) {
    const statusMap = {
      'validation': 'BLOCKED',
      'missing_field': 'BLOCKED',
      'execution': 'FAILED_RETRYABLE',
      'timeout': 'FAILED_RETRYABLE',
      'network': 'FAILED_RETRYABLE',
      'permission': 'FAILED_ESCALATE',
      'fatal': 'FAILED_ESCALATE'
    };
    
    const errorType = detectErrorType(error);
    return statusMap[errorType] || 'FAILED_RETRYABLE';
  },
  
  generateEscalation(context) {
    return {
      escalation_id: `esc-${Date.now()}`,
      dispatch_id: context.dispatch.dispatch_id,
      project_id: context.dispatch.project_id,
      milestone_id: context.dispatch.milestone_id,
      task_id: context.dispatch.task_id,
      role: context.dispatch.role,
      level: 'USER',
      reason_type: context.reason_type,
      summary: `Escalation required: ${context.reason_type}`,
      blocking_points: context.blocking_points,
      attempted_actions: context.attempted_actions,
      recommended_next_steps: context.recommended_next_steps,
      requires_user_decision: true,
      created_at: new Date().toISOString(),
      created_by: 'cli-local-adapter'
    };
  },
  
  handleRetry(retryContext) {
    return retryHandler.handleRetry(retryContext, config.retry_config.max_retry);
  },
  
  getAdapterInfo() {
    return {
      adapter_id: config.adapter_id,
      adapter_type: 'orchestrator',
      version: config.metadata.version,
      priority: config.metadata.priority,
      status: 'implemented',
      description: config.metadata.description,
      compatible_profiles: config.metadata.compatible_profiles
    };
  }
};

function detectErrorType(error) {
  const message = error.message || '';
  
  if (/missing|required|invalid|validation/i.test(message)) return 'validation';
  if (/timeout|timed out/i.test(message)) return 'timeout';
  if (/network|connection|ECONN/i.test(message)) return 'network';
  if (/permission|access denied|auth/i.test(message)) return 'permission';
  if (/fatal|critical|unrecoverable/i.test(message)) return 'fatal';
  
  return 'execution';
}

module.exports = {
  CliLocalAdapter,
  argParser,
  dispatchNormalizer,
  dispatchValidator,
  escalationHandler,
  retryHandler,
  config
};