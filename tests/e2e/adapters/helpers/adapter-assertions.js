/**
 * Adapter Test Assertions
 * 
 * Provides custom assertions for True E2E Adapter Integration Tests.
 * Validates adapter outputs against io-contract.md specifications.
 * 
 * @module tests/e2e/adapters/helpers/adapter-assertions
 */

/**
 * Assert dispatch payload is valid (io-contract.md §1)
 * @param {object} dispatch - Dispatch payload to validate
 * @param {string} expectedRole - Expected role value
 * @throws {Error} If validation fails
 */
function assertValidDispatchFromAdapter(dispatch, expectedRole) {
  const requiredFields = [
    'dispatch_id',
    'project_id',
    'role',
    'command',
    'title',
    'goal',
    'risk_level'
  ];
  
  const missingFields = requiredFields.filter(field => {
    const value = dispatch[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missingFields.length > 0) {
    throw new Error(`Dispatch missing required fields: ${missingFields.join(', ')}`);
  }
  
  const validRoles = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];
  if (!validRoles.includes(dispatch.role)) {
    throw new Error(`Invalid role: ${dispatch.role}. Must be one of: ${validRoles.join(', ')}`);
  }
  
  if (expectedRole && dispatch.role !== expectedRole) {
    throw new Error(`Expected role ${expectedRole}, got ${dispatch.role}`);
  }
  
  const validRiskLevels = ['low', 'medium', 'high', 'critical'];
  if (!validRiskLevels.includes(dispatch.risk_level)) {
    throw new Error(`Invalid risk_level: ${dispatch.risk_level}. Must be one of: ${validRiskLevels.join(', ')}`);
  }
}

/**
 * Assert execution result is valid (io-contract.md §3)
 * @param {object} result - Execution result to validate
 * @param {string} expectedStatus - Expected status value
 * @throws {Error} If validation fails
 */
function assertValidExecutionResult(result, expectedStatus) {
  const requiredFields = ['dispatch_id', 'status', 'role', 'command', 'summary', 'recommendation'];
  
  const missingFields = requiredFields.filter(field => {
    const value = result[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missingFields.length > 0) {
    throw new Error(`Execution result missing required fields: ${missingFields.join(', ')}`);
  }
  
  const validStatuses = ['SUCCESS', 'FAILED_RETRYABLE', 'FAILED_ESCALATE', 'BLOCKED', 'IN_PROGRESS'];
  if (!validStatuses.includes(result.status)) {
    throw new Error(`Invalid status: ${result.status}. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  if (expectedStatus && result.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${result.status}`);
  }
  
  const validRecommendations = ['CONTINUE', 'REWORK', 'REPLAN', 'ESCALATE', 'ABORT'];
  if (!validRecommendations.includes(result.recommendation)) {
    throw new Error(`Invalid recommendation: ${result.recommendation}. Must be one of: ${validRecommendations.join(', ')}`);
  }
}

/**
 * Assert escalation object is valid (io-contract.md §5)
 * @param {object} escalation - Escalation object to validate
 * @throws {Error} If validation fails
 */
function assertValidEscalation(escalation) {
  const requiredFields = [
    'escalation_id',
    'dispatch_id',
    'level',
    'reason_type',
    'summary',
    'requires_user_decision'
  ];
  
  const missingFields = requiredFields.filter(field => {
    const value = escalation[field];
    return value === undefined || value === null;
  });
  
  if (missingFields.length > 0) {
    throw new Error(`Escalation missing required fields: ${missingFields.join(', ')}`);
  }
  
  const validLevels = ['USER', 'ADMIN', 'SYSTEM'];
  if (!validLevels.includes(escalation.level)) {
    throw new Error(`Invalid escalation level: ${escalation.level}. Must be one of: ${validLevels.join(', ')}`);
  }
  
  const validReasonTypes = [
    'OUT_OF_SCOPE_REQUEST',
    'BLOCKING_DEPENDENCY',
    'INSUFFICIENT_CONTEXT',
    'AMBIGUOUS_REQUIREMENT',
    'TECHNICAL_BLOCKER',
    'RESOURCE_LIMITATION'
  ];
  if (!validReasonTypes.includes(escalation.reason_type)) {
    throw new Error(`Invalid reason_type: ${escalation.reason_type}`);
  }
}

/**
 * Assert Nock mock was called
 * @param {object} scope - Nock scope to verify
 * @param {string} description - Description for error message
 * @throws {Error} If mock was not called
 */
function assertNockCallComplete(scope, description = 'HTTP mock') {
  if (!scope.isDone()) {
    throw new Error(`${description} was not called. Pending mocks: ${scope.pendingMocks().join(', ')}`);
  }
}

/**
 * Assert adapter error mapping is correct
 * @param {object} adapter - Adapter instance
 * @param {number} statusCode - HTTP status code
 * @param {string} expectedStatus - Expected execution status
 * @throws {Error} If mapping doesn't match
 */
function assertAdapterErrorMapping(adapter, statusCode, expectedStatus) {
  const error = { status: statusCode };
  const mapped = adapter.mapError(error);
  
  if (mapped !== expectedStatus) {
    throw new Error(`Error mapping failed: status ${statusCode} should map to ${expectedStatus}, got ${mapped}`);
  }
}

/**
 * Assert webhook handling result is valid
 * @param {object} result - Webhook handling result
 * @param {boolean} expectedValid - Expected validity
 * @throws {Error} If result doesn't match expectations
 */
function assertWebhookResult(result, expectedValid) {
  if (result.valid !== expectedValid) {
    if (expectedValid) {
      throw new Error(`Webhook should be valid but got: ${result.error || 'unknown error'}`);
    } else {
      throw new Error(`Webhook should be invalid but was accepted`);
    }
  }
  
  if (expectedValid && !result.issue) {
    throw new Error('Valid webhook result should include issue');
  }
}

/**
 * Assert adapter info is valid
 * @param {object} info - Adapter info object
 * @param {string} expectedType - Expected adapter type
 * @throws {Error} If info is invalid
 */
function assertValidAdapterInfo(info, expectedType) {
  const requiredFields = ['adapter_id', 'adapter_type', 'version', 'status'];
  
  const missingFields = requiredFields.filter(field => !info[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Adapter info missing fields: ${missingFields.join(', ')}`);
  }
  
  if (expectedType && info.adapter_type !== expectedType) {
    throw new Error(`Expected adapter_type ${expectedType}, got ${info.adapter_type}`);
  }
}

/**
 * Assert retry decision is correct
 * @param {object} decision - Retry decision
 * @param {boolean} expectedShouldRetry - Expected retry decision
 * @throws {Error} If decision doesn't match
 */
function assertRetryDecision(decision, expectedShouldRetry) {
  if (decision.should_retry !== expectedShouldRetry) {
    throw new Error(`Retry decision mismatch: expected should_retry=${expectedShouldRetry}, got ${decision.should_retry}. Reason: ${decision.reason || 'none'}`);
  }
}

/**
 * Assert JWT validation result
 * @param {object} validation - JWT validation result
 * @param {boolean} expectedValid - Expected validity
 * @throws {Error} If validation doesn't match
 */
function assertJWTValidation(validation, expectedValid) {
  if (validation.valid !== expectedValid) {
    throw new Error(`JWT validation mismatch: expected valid=${expectedValid}, got ${validation.valid}. Error: ${validation.error || 'none'}`);
  }
  
  if (expectedValid && !validation.payload) {
    throw new Error('Valid JWT should have payload');
  }
}

module.exports = {
  assertValidDispatchFromAdapter,
  assertValidExecutionResult,
  assertValidEscalation,
  assertNockCallComplete,
  assertAdapterErrorMapping,
  assertWebhookResult,
  assertValidAdapterInfo,
  assertRetryDecision,
  assertJWTValidation
};