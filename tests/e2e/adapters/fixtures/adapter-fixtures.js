/**
 * Adapter Test Fixtures
 * 
 * Provides test data factories for True E2E Adapter Integration Tests.
 * All fixtures support deep merge overrides for flexible test scenarios.
 * 
 * @module tests/e2e/adapters/fixtures/adapter-fixtures
 */

/**
 * Deep merge utility for fixture overrides
 * @param {object} target - Base object
 * @param {object} source - Override object
 * @returns {object} Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else if (Array.isArray(source[key])) {
      result[key] = source[key];
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Create GitHub Webhook Payload fixture
 * @param {object} overrides - Custom overrides
 * @returns {object} Webhook payload object
 */
function createGitHubWebhookPayload(overrides = {}) {
  const base = {
    action: 'opened',
    issue: {
      number: 123,
      title: '[architect:design-task] Design authentication feature',
      body: `## Context

Building a new authentication feature for the application.
This will support OAuth2 and MFA.

## Goal

Create a comprehensive design document that covers:
- Architecture overview
- Component breakdown
- API contracts
- Security considerations

## Constraints

- Must use OAuth2 protocol
- Support MFA (Multi-Factor Authentication)
- Compatible with existing user system
- Performance: < 500ms auth latency`,
      labels: [
        { name: 'milestone:mvp' },
        { name: 'role:architect' },
        { name: 'risk:low' },
        { name: 'status:pending' }
      ],
      state: 'open',
      created_at: '2026-03-29T10:00:00Z',
      updated_at: '2026-03-29T10:00:00Z',
      user: {
        login: 'test-user',
        id: 1,
        type: 'User'
      }
    },
    repository: {
      id: 12345,
      name: 'test-repo',
      full_name: 'test-owner/test-repo',
      owner: {
        login: 'test-owner',
        id: 1,
        type: 'User'
      },
      private: false
    },
    sender: {
      login: 'test-user',
      id: 1
    }
  };
  
  return deepMerge(base, overrides);
}

/**
 * Create GitHub Issue fixture (for manual processing)
 * @param {object} overrides - Custom overrides
 * @returns {object} GitHub Issue object
 */
function createGitHubIssue(overrides = {}) {
  const base = {
    number: 123,
    title: '[developer:feature-implementation] Implement auth feature',
    body: `## Context

Implementing the authentication feature based on the design document.

## Goal

Create production-ready authentication module with:
- OAuth2 integration
- MFA support
- Session management

## Constraints

- Follow design document in docs/auth-design.md
- Use existing testing patterns
- Add comprehensive tests

## Inputs

- design-note: docs/auth-design.md - Authentication design

## Expected Outputs

- src/auth/index.js - Main auth module
- tests/auth.test.js - Unit tests`,
    labels: [
      { name: 'milestone:mvp' },
      { name: 'role:developer' },
      { name: 'task:T001' },
      { name: 'risk:medium' }
    ],
    state: 'open',
    user: {
      login: 'test-user',
      id: 1
    },
    repository: {
      owner: { login: 'test-owner' },
      name: 'test-repo'
    },
    milestone: {
      title: 'MVP'
    }
  };
  
  return deepMerge(base, overrides);
}

/**
 * Create OpenClaw Message fixture
 * @param {object} overrides - Custom overrides
 * @returns {object} OpenClaw message object
 */
function createOpenClawMessage(overrides = {}) {
  const base = {
    message_id: 'msg-001',
    dispatch_id: 'dispatch-001',
    project_id: 'test-project',
    milestone_id: 'mvp',
    task_id: 'task-001',
    role: 'developer',
    command: 'feature-implementation',
    payload: {
      title: 'Implement authentication',
      goal: 'Create production-ready auth module',
      description: 'Implement OAuth2 and MFA support',
      context: {
        task_scope: 'Authentication module implementation',
        project_goal: 'Build secure authentication system'
      },
      constraints: [
        'Use OAuth2 protocol',
        'Support MFA',
        'Follow existing patterns'
      ],
      inputs: [
        { artifact_id: 'design-note', artifact_type: 'design-note', path: 'docs/auth-design.md' }
      ],
      expected_outputs: [
        { artifact_type: 'implementation-summary', path: 'docs/impl-summary.md' }
      ]
    },
    auth: {
      token: 'test-jwt-token',
      expires_at: new Date(Date.now() + 3600000).toISOString()
    },
    metadata: {
      source: 'openclaw',
      timestamp: new Date().toISOString(),
      priority: 'normal'
    }
  };
  
  return deepMerge(base, overrides);
}

/**
 * Create Execution Result fixture
 * @param {object} overrides - Custom overrides
 * @returns {object} Execution result object (io-contract.md §3)
 */
function createExecutionResult(overrides = {}) {
  const base = {
    dispatch_id: 'dispatch-001',
    status: 'SUCCESS',
    role: 'developer',
    command: 'feature-implementation',
    summary: 'Authentication module implemented successfully with OAuth2 and MFA support.',
    artifacts: [
      {
        artifact_id: 'impl-001',
        artifact_type: 'implementation-summary',
        path: 'docs/auth-impl-summary.md',
        description: 'Implementation summary document'
      },
      {
        artifact_id: 'test-001',
        artifact_type: 'test-report',
        path: 'tests/reports/auth-test-report.md',
        description: 'Test execution report'
      }
    ],
    changed_files: [
      { path: 'src/auth/index.js', mode: 'created', description: 'Main auth module' },
      { path: 'src/auth/oauth2.js', mode: 'created', description: 'OAuth2 handler' },
      { path: 'src/auth/mfa.js', mode: 'created', description: 'MFA handler' },
      { path: 'tests/auth.test.js', mode: 'created', description: 'Unit tests' }
    ],
    recommendation: 'CONTINUE',
    next_steps: [
      { action: 'review', description: 'Code review by reviewer role' },
      { action: 'integrate', description: 'Integration testing' }
    ],
    metrics: {
      duration_ms: 45000,
      test_coverage: 92,
      files_changed: 4
    },
    execution_timestamp: new Date().toISOString(),
    executed_by: 'developer-agent'
  };
  
  return deepMerge(base, overrides);
}

/**
 * Create Escalation fixture
 * @param {object} overrides - Custom overrides
 * @returns {object} Escalation object (io-contract.md §5)
 */
function createEscalation(overrides = {}) {
  const base = {
    escalation_id: `esc-${Date.now()}-abc123`,
    dispatch_id: 'dispatch-001',
    project_id: 'test-owner/test-repo',
    milestone_id: 'mvp',
    task_id: 'task-001',
    role: 'developer',
    level: 'USER',
    reason_type: 'BLOCKING_DEPENDENCY',
    summary: 'Waiting for external API documentation before proceeding.',
    blocking_points: [
      {
        point: 'OAuth2 provider API documentation incomplete',
        impact: 'Cannot implement OAuth2 flow without API specs',
        suggested_action: 'Request API documentation from provider'
      }
    ],
    attempted_actions: [
      { action: 'Attempted to implement based on assumptions', result: 'Failed validation' },
      { action: 'Checked provider documentation site', result: 'Documentation missing' }
    ],
    recommended_next_steps: [
      { step: 'Contact OAuth2 provider for API docs', priority: 'high' },
      { step: 'Use mock implementation temporarily', priority: 'medium' }
    ],
    options: [
      {
        id: 'opt-001',
        title: 'Wait for API documentation',
        description: 'Pause task until documentation available',
        pros: ['Accurate implementation'],
        cons: ['Delays timeline']
      },
      {
        id: 'opt-002',
        title: 'Use mock implementation',
        description: 'Proceed with mock OAuth2 for testing',
        pros: ['Continues progress'],
        cons: ['Requires later refactoring']
      }
    ],
    requires_user_decision: true,
    created_at: new Date().toISOString(),
    created_by: 'developer-agent'
  };
  
  return deepMerge(base, overrides);
}

/**
 * Create Retry Context fixture
 * @param {object} overrides - Custom overrides
 * @returns {object} Retry context object
 */
function createRetryContext(overrides = {}) {
  const base = {
    dispatch_id: 'dispatch-001',
    error_type: 'API_ERROR',
    error_message: 'GitHub API rate limit exceeded',
    retry_count: 0,
    max_retry: 2,
    risk_level: 'low',
    last_attempt_at: new Date().toISOString(),
    backoff_multiplier: 2,
    base_delay_ms: 1000
  };
  
  return deepMerge(base, overrides);
}

/**
 * Create Decision Response fixture (for OpenClaw)
 * @param {object} overrides - Custom overrides
 * @returns {object} Decision response object
 */
function createDecisionResponse(overrides = {}) {
  const base = {
    escalation_id: 'esc-001',
    response: 'decision_made',
    decision: {
      selected_option: 'opt-002',
      reason: 'Proceed with mock to maintain timeline'
    },
    message: 'Using mock implementation temporarily',
    responded_by: 'test-user',
    responded_at: new Date().toISOString()
  };
  
  return deepMerge(base, overrides);
}

/**
 * Compute HMAC-SHA256 signature for webhook testing
 * @param {string} payload - JSON string payload
 * @param {string} secret - Webhook secret
 * @returns {string} Signature in format 'sha256=<hex>'
 */
function computeHMACSignature(payload, secret) {
  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${signature}`;
}

/**
 * Generate test JWT token for OpenClaw adapter testing
 * @param {object} payload - JWT payload
 * @param {string} secret - JWT secret (default: test secret)
 * @param {object} options - JWT options
 * @returns {string} JWT token
 */
function generateTestJWT(payload, secret = 'test-jwt-secret-do-not-use-in-production', options = {}) {
  const jwt = require('jsonwebtoken');
  const defaultOptions = {
    expiresIn: '1h',
    algorithm: 'HS256'
  };
  
  return jwt.sign(payload, secret, { ...defaultOptions, ...options });
}

module.exports = {
  deepMerge,
  createGitHubWebhookPayload,
  createGitHubIssue,
  createOpenClawMessage,
  createExecutionResult,
  createEscalation,
  createRetryContext,
  createDecisionResponse,
  computeHMACSignature,
  generateTestJWT
};