/**
 * Mock Configuration Helper
 * 
 * Provides Nock setup utilities for True E2E Adapter Integration Tests.
 * Loads real adapter configs and sets up HTTP mocks accordingly.
 * 
 * @module tests/e2e/adapters/helpers/mock-config
 */

const nock = require('nock');
const path = require('path');

/**
 * Load adapter configuration from config file
 * @param {string} adapterId - Adapter ID (e.g., 'github-issue', 'openclaw')
 * @returns {object} Adapter configuration
 */
function getAdapterConfig(adapterId) {
  const configPath = path.join(__dirname, '../../../..', 'adapters', adapterId, `${adapterId}.config.json`);
  
  try {
    return require(configPath);
  } catch (err) {
    throw new Error(`Failed to load adapter config for ${adapterId}: ${err.message}`);
  }
}

/**
 * Get base URL for adapter's API calls
 * @param {object} adapterConfig - Adapter configuration
 * @returns {string} Base URL for Nock mocking
 */
function getBaseURL(adapterConfig) {
  if (adapterConfig.github_config?.api?.base_url) {
    return adapterConfig.github_config.api.base_url;
  }
  if (adapterConfig.openclaw_config?.api?.base_url) {
    return adapterConfig.openclaw_config.api.base_url;
  }
  return 'https://api.github.com';
}

/**
 * Setup GitHub API Nock mocks
 * @param {object} adapterConfig - GitHub Issue adapter configuration
 * @param {object} options - Mock options
 * @returns {object} Nock scope for verification
 */
function setupGitHubNock(adapterConfig, options = {}) {
  const baseURL = getBaseURL(adapterConfig);
  const owner = options.owner || 'test-owner';
  const repo = options.repo || 'test-repo';
  const issueNumber = options.issueNumber || 123;
  
  const scope = nock(baseURL);
  
  // Default mocks for common operations
  if (options.mockGetIssue) {
    scope
      .get(`/repos/${owner}/${repo}/issues/${issueNumber}`)
      .reply(200, {
        number: issueNumber,
        title: '[architect:design-task] Test issue',
        body: '## Goal\nTest goal',
        labels: [{ name: 'milestone:mvp' }],
        state: 'open',
        user: { login: 'test-user' }
      });
  }
  
  if (options.mockPostComment) {
    scope
      .post(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`)
      .reply(201, { id: 456, body: 'Test comment' });
  }
  
  if (options.mockAddLabels) {
    scope
      .post(`/repos/${owner}/${repo}/issues/${issueNumber}/labels`)
      .reply(200, [{ name: 'status:completed' }]);
  }
  
  if (options.mockCreatePR) {
    scope
      .post(`/repos/${owner}/${repo}/pulls`)
      .reply(201, {
        number: 456,
        html_url: `https://github.com/${owner}/${repo}/pull/456`,
        state: 'open'
      });
  }
  
  return scope;
}

/**
 * Setup OpenClaw API Nock mocks
 * @param {object} adapterConfig - OpenClaw adapter configuration
 * @param {object} options - Mock options
 * @returns {object} Nock scope for verification
 */
function setupOpenClawNock(adapterConfig, options = {}) {
  const baseURL = getBaseURL(adapterConfig);
  
  const scope = nock(baseURL);
  
  if (options.mockPostResult) {
    scope
      .post('/api/v1/results')
      .reply(200, {
        result_id: 'result-001',
        status: 'received',
        timestamp: new Date().toISOString()
      });
  }
  
  if (options.mockPostEscalation) {
    scope
      .post('/api/v1/escalations')
      .reply(200, {
        escalation_id: 'esc-001',
        status: 'pending',
        requires_decision: true
      });
  }
  
  if (options.mockPostRetry) {
    scope
      .post('/api/v1/retries')
      .reply(200, {
        retry_id: 'retry-001',
        scheduled_at: new Date(Date.now() + 5000).toISOString(),
        status: 'scheduled'
      });
  }
  
  if (options.mockPostHeartbeat) {
    scope
      .post('/api/v1/heartbeat')
      .reply(200, { received: true });
  }
  
  if (options.mockGetDecision) {
    scope
      .get('/api/v1/escalations/esc-001/decision')
      .reply(200, {
        response: 'decision_made',
        decision: { selected_option: 'opt-002' }
      });
  }
  
  return scope;
}

/**
 * Setup GitHub PR API Nock mocks (Git operations)
 * @param {object} adapterConfig - GitHub PR adapter configuration
 * @param {object} options - Mock options
 * @returns {object} Nock scope for verification
 */
function setupGitHubPRNock(adapterConfig, options = {}) {
  const baseURL = getBaseURL(adapterConfig);
  const owner = options.owner || 'test-owner';
  const repo = options.repo || 'test-repo';
  const baseBranch = options.baseBranch || 'main';
  
  const scope = nock(baseURL);
  
  // Git reference operations
  if (options.mockGetRef) {
    scope
      .get(`/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`)
      .reply(200, {
        ref: `refs/heads/${baseBranch}`,
        object: { sha: 'abc123def456' }
      });
  }
  
  if (options.mockCreateRef) {
    scope
      .post(`/repos/${owner}/${repo}/git/refs`)
      .reply(201, {
        ref: 'refs/heads/feature-branch',
        object: { sha: 'newcommit123' }
      });
  }
  
  // Tree and commit operations
  if (options.mockCreateTree) {
    scope
      .post(`/repos/${owner}/${repo}/git/trees`)
      .reply(200, { sha: 'tree-sha-123' });
  }
  
  if (options.mockCreateCommit) {
    scope
      .post(`/repos/${owner}/${repo}/git/commits`)
      .reply(200, { sha: 'commit-sha-123' });
  }
  
  if (options.mockCreateBlob) {
    scope
      .post(`/repos/${owner}/${repo}/git/blobs`)
      .reply(200, { sha: 'blob-sha-123' });
  }
  
  // PR operations
  if (options.mockCreatePR) {
    scope
      .post(`/repos/${owner}/${repo}/pulls`)
      .reply(201, {
        number: 456,
        html_url: `https://github.com/${owner}/${repo}/pull/456`,
        state: 'open',
        head: { ref: 'feature-branch' },
        base: { ref: baseBranch }
      });
  }
  
  if (options.mockRequestReview) {
    scope
      .post(`/repos/${owner}/${repo}/pulls/456/requested_reviewers`)
      .reply(200);
  }
  
  if (options.mockAddLabels) {
    scope
      .post(`/repos/${owner}/${repo}/issues/456/labels`)
      .reply(200);
  }
  
  return scope;
}

/**
 * Clean all Nock mocks
 */
function cleanAllMocks() {
  nock.cleanAll();
}

/**
 * Verify all Nock mocks were called
 * @param {object} scope - Nock scope to verify
 * @returns {boolean} True if all mocks called
 */
function verifyMocksCalled(scope) {
  return scope.isDone();
}

module.exports = {
  getAdapterConfig,
  getBaseURL,
  setupGitHubNock,
  setupOpenClawNock,
  setupGitHubPRNock,
  cleanAllMocks,
  verifyMocksCalled
};