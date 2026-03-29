const nock = require('nock');

class MockServerManager {
  constructor() {
    this.scopes = [];
    this.githubBaseUrl = 'https://api.github.com';
    this.openclawBaseUrl = process.env.OPENCLAW_API_URL || 'https://api.openclaw.test';
  }

  setupGitHubMocks(config = {}) {
    const { owner = 'test-org', repo = 'test-repo' } = config;
    
    this.scopes.push(
      nock(this.githubBaseUrl)
        .persist()
        .get(new RegExp(`/repos/${owner}/${repo}/issues/\\d+`))
        .reply(200, (uri, requestBody) => {
          const number = uri.split('/').pop();
          return {
            number: parseInt(number),
            title: `[architect:design-task] Test Issue ${number}`,
            body: '## Context\nTest context\n## Goal\nTest goal',
            labels: [{ name: 'milestone:mvp' }, { name: 'risk:low' }],
            state: 'open'
          };
        })
    );

    this.scopes.push(
      nock(this.githubBaseUrl)
        .persist()
        .post(new RegExp(`/repos/${owner}/${repo}/issues`))
        .reply(201, (uri, requestBody) => ({
          number: Math.floor(Math.random() * 1000) + 1,
          ...requestBody
        }))
    );

    this.scopes.push(
      nock(this.githubBaseUrl)
        .persist()
        .post(new RegExp(`/repos/${owner}/${repo}/pulls`))
        .reply(201, (uri, requestBody) => ({
          number: Math.floor(Math.random() * 1000) + 1,
          html_url: `https://github.com/${owner}/${repo}/pull/1`,
          state: 'open',
          ...requestBody
        }))
    );

    this.scopes.push(
      nock(this.githubBaseUrl)
        .persist()
        .post(new RegExp(`/repos/${owner}/${repo}/issues/\\d+/comments`))
        .reply(201, { id: Date.now() })
    );

    this.scopes.push(
      nock(this.githubBaseUrl)
        .persist()
        .post(new RegExp(`/repos/${owner}/${repo}/issues/\\d+/labels`))
        .reply(200, [])
    );

    this.scopes.push(
      nock(this.githubBaseUrl)
        .persist()
        .get(new RegExp(`/repos/${owner}/${repo}/pulls/\\d+/files`))
        .reply(200, [])
    );

    this.scopes.push(
      nock(this.githubBaseUrl)
        .persist()
        .post(new RegExp(`/repos/${owner}/${repo}/pulls/\\d+/reviews`))
        .reply(200, { id: Date.now(), state: 'APPROVED' })
    );

    return this;
  }

  setupOpenClawMocks(config = {}) {
    this.scopes.push(
      nock(this.openclawBaseUrl)
        .persist()
        .post('/api/v1/results')
        .reply(200, { acknowledged: true })
    );

    this.scopes.push(
      nock(this.openclawBaseUrl)
        .persist()
        .post('/api/v1/escalations')
        .reply(200, (uri, requestBody) => ({
          status: 'acknowledged',
          escalation_id: requestBody.escalation_id || `esc-${Date.now()}`,
          timestamp: new Date().toISOString()
        }))
    );

    this.scopes.push(
      nock(this.openclawBaseUrl)
        .persist()
        .post('/api/v1/retries')
        .reply(200, { logged: true })
    );

    this.scopes.push(
      nock(this.openclawBaseUrl)
        .persist()
        .post('/api/v1/heartbeat')
        .reply(200, { received: true })
    );

    return this;
  }

  setupFailureMocks(config = {}) {
    this.scopes.push(
      nock(this.openclawBaseUrl)
        .post('/api/v1/results')
        .reply(500, { error: 'Internal Server Error' })
    );

    this.scopes.push(
      nock(this.githubBaseUrl)
        .get(/.*/)
        .reply(401, { message: 'Bad credentials' })
    );

    return this;
  }

  setupEscalationDecisionMocks(decision) {
    nock.cleanAll();
    this.scopes = [];

    this.scopes.push(
      nock(this.openclawBaseUrl)
        .post('/api/v1/escalations')
        .reply(200, {
          status: 'decision_made',
          decision: decision,
          timestamp: new Date().toISOString()
        })
    );

    return this;
  }

  cleanAll() {
    nock.cleanAll();
    this.scopes = [];
  }

  isDone() {
    return this.scopes.every(scope => scope.isDone());
  }

  getPendingMocks() {
    return nock.pendingMocks();
  }
}

function createMockManager() {
  return new MockServerManager();
}

module.exports = {
  MockServerManager,
  createMockManager
};