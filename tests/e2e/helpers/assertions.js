const validRoles = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];
const validRiskLevels = ['low', 'medium', 'high', 'critical'];
const validStatuses = ['SUCCESS', 'FAILED_RETRYABLE', 'FAILED_ESCALATE', 'BLOCKED'];
const validRecommendations = ['CONTINUE', 'REWORK', 'REPLAN', 'ESCALATE'];

function assertValidDispatchPayload(payload) {
  const errors = [];

  if (!payload.dispatch_id) {
    errors.push('Missing dispatch_id');
  }
  if (!payload.project_id) {
    errors.push('Missing project_id');
  }
  if (!payload.milestone_id) {
    errors.push('Missing milestone_id');
  }
  if (!payload.task_id) {
    errors.push('Missing task_id');
  }
  if (!payload.role || !validRoles.includes(payload.role)) {
    errors.push(`Invalid role: ${payload.role}. Must be one of: ${validRoles.join(', ')}`);
  }
  if (!payload.command) {
    errors.push('Missing command');
  }
  if (!payload.title) {
    errors.push('Missing title');
  }
  if (!payload.goal) {
    errors.push('Missing goal');
  }
  if (!payload.description) {
    errors.push('Missing description');
  }
  if (!payload.risk_level || !validRiskLevels.includes(payload.risk_level)) {
    errors.push(`Invalid risk_level: ${payload.risk_level}. Must be one of: ${validRiskLevels.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function assertValidExecutionResult(result) {
  const errors = [];

  if (!result.dispatch_id) {
    errors.push('Missing dispatch_id');
  }
  if (!result.status || !validStatuses.includes(result.status)) {
    errors.push(`Invalid status: ${result.status}. Must be one of: ${validStatuses.join(', ')}`);
  }
  if (!result.summary) {
    errors.push('Missing summary');
  }
  if (result.recommendation && !validRecommendations.includes(result.recommendation)) {
    errors.push(`Invalid recommendation: ${result.recommendation}. Must be one of: ${validRecommendations.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function assertValidEscalation(escalation) {
  const errors = [];

  if (!escalation.escalation_id) {
    errors.push('Missing escalation_id');
  }
  if (!escalation.dispatch_id) {
    errors.push('Missing dispatch_id');
  }
  if (!escalation.summary) {
    errors.push('Missing summary');
  }
  if (!Array.isArray(escalation.blocking_points)) {
    errors.push('blocking_points must be an array');
  }
  if (typeof escalation.requires_user_decision !== 'boolean') {
    errors.push('requires_user_decision must be boolean');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function assertValidRetryDecision(decision) {
  const errors = [];

  if (typeof decision.should_retry !== 'boolean') {
    errors.push('should_retry must be boolean');
  }
  if (typeof decision.backoff_seconds !== 'number') {
    errors.push('backoff_seconds must be number');
  }
  if (typeof decision.escalate !== 'boolean') {
    errors.push('escalate must be boolean');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function assertWebhookSignatureValid(payload, signature, secret) {
  const crypto = require('crypto');
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature === expectedSignature;
}

function assertMockCallsComplete(scopes) {
  const pending = scopes.filter(scope => !scope.isDone());
  return {
    isComplete: pending.length === 0,
    pendingMocks: pending.map(s => s.pendingMocks()).flat()
  };
}

module.exports = {
  assertValidDispatchPayload,
  assertValidExecutionResult,
  assertValidEscalation,
  assertValidRetryDecision,
  assertWebhookSignatureValid,
  assertMockCallsComplete,
  validRoles,
  validRiskLevels,
  validStatuses,
  validRecommendations
};