const nock = require('nock');

function getBaseUrl() {
  return process.env.OPENCLAW_API_URL || 'https://api.openclaw.test';
}

function mockPostResult(response = {}, options = {}) {
  const defaultResponse = {
    acknowledged: true,
    timestamp: new Date().toISOString()
  };

  return nock(getBaseUrl())
    .post('/api/v1/results')
    .reply(options.statusCode || 200, { ...defaultResponse, ...response });
}

function mockPostResultError(statusCode = 500, error = 'Internal Server Error') {
  return nock(getBaseUrl())
    .post('/api/v1/results')
    .reply(statusCode, { error });
}

function mockPostEscalation(response = {}, options = {}) {
  const defaultResponse = {
    status: 'acknowledged',
    escalation_id: `esc-${Date.now()}`,
    timestamp: new Date().toISOString()
  };

  return nock(getBaseUrl())
    .post('/api/v1/escalations')
    .reply(options.statusCode || 200, { ...defaultResponse, ...response });
}

function mockEscalationDecision(decision, additionalResponse = {}) {
  const responses = {
    acknowledged: {
      status: 'acknowledged',
      message: 'Escalation received, awaiting decision'
    },
    decision_made: {
      status: 'decision_made',
      decision: decision || 'continue_with_alternative',
      timestamp: new Date().toISOString()
    },
    escalate_further: {
      status: 'escalate_further',
      message: 'Escalating to higher authority'
    },
    abort: {
      status: 'abort',
      reason: 'Task aborted due to blocking issue'
    }
  };

  return nock(getBaseUrl())
    .post('/api/v1/escalations')
    .reply(200, { ...responses[decision], ...additionalResponse });
}

function mockPostRetry(response = {}, options = {}) {
  const defaultResponse = {
    logged: true,
    retry_id: `retry-${Date.now()}`,
    timestamp: new Date().toISOString()
  };

  return nock(getBaseUrl())
    .post('/api/v1/retries')
    .reply(options.statusCode || 200, { ...defaultResponse, ...response });
}

function mockPostHeartbeat(response = {}, options = {}) {
  const defaultResponse = {
    received: true,
    timestamp: new Date().toISOString()
  };

  return nock(getBaseUrl())
    .post('/api/v1/heartbeat')
    .reply(options.statusCode || 200, { ...defaultResponse, ...response });
}

function mockHeartbeatError(statusCode = 500) {
  return nock(getBaseUrl())
    .post('/api/v1/heartbeat')
    .reply(statusCode, { error: 'Heartbeat failed' });
}

function mockAuthFailure() {
  return nock(getBaseUrl())
    .post(/.*/)
    .reply(401, { error: 'Authentication failed', code: 'AUTH_FAILED' });
}

function mockTimeout() {
  return nock(getBaseUrl())
    .post(/.*/)
    .delayConnection(5000)
    .reply(504, { error: 'Gateway Timeout' });
}

function mockRateLimited() {
  return nock(getBaseUrl())
    .post(/.*/)
    .reply(429, {
      error: 'Rate limit exceeded',
      retry_after: 60
    });
}

function mockAllEndpoints(config = {}) {
  const baseUrl = getBaseUrl();
  const scopes = [];

  scopes.push(
    nock(baseUrl)
      .persist()
      .post('/api/v1/results')
      .reply(200, { acknowledged: true })
  );

  scopes.push(
    nock(baseUrl)
      .persist()
      .post('/api/v1/escalations')
      .reply(200, { status: 'acknowledged' })
  );

  scopes.push(
    nock(baseUrl)
      .persist()
      .post('/api/v1/retries')
      .reply(200, { logged: true })
  );

  scopes.push(
    nock(baseUrl)
      .persist()
      .post('/api/v1/heartbeat')
      .reply(200, { received: true })
  );

  return scopes;
}

module.exports = {
  getBaseUrl,
  mockPostResult,
  mockPostResultError,
  mockPostEscalation,
  mockEscalationDecision,
  mockPostRetry,
  mockPostHeartbeat,
  mockHeartbeatError,
  mockAuthFailure,
  mockTimeout,
  mockRateLimited,
  mockAllEndpoints
};