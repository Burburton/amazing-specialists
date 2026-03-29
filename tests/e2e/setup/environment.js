const defaultConfig = {
  github: {
    baseUrl: 'https://api.github.com',
    owner: 'test-org',
    repo: 'test-repo',
    webhookSecret: 'test-webhook-secret',
    token: 'ghp_test_token_xxxxxxxxxxxx'
  },
  openclaw: {
    baseUrl: process.env.OPENCLAW_API_URL || 'https://api.openclaw.test',
    jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
    apiKey: 'oc_test_api_key_xxxxxxxxxxxx'
  },
  test: {
    timeout: 30000,
    slowThreshold: 10000
  }
};

function getConfig(overrides = {}) {
  const config = JSON.parse(JSON.stringify(defaultConfig));
  
  if (overrides.github) {
    config.github = { ...config.github, ...overrides.github };
  }
  if (overrides.openclaw) {
    config.openclaw = { ...config.openclaw, ...overrides.openclaw };
  }
  if (overrides.test) {
    config.test = { ...config.test, ...overrides.test };
  }
  
  return config;
}

function getGithubConfig(overrides = {}) {
  return getConfig().github;
}

function getOpenClawConfig(overrides = {}) {
  return getConfig().openclaw;
}

function getTestTimeout() {
  return parseInt(process.env.TEST_TIMEOUT || defaultConfig.test.timeout, 10);
}

function shouldRunRealApiTests() {
  return process.env.RUN_REAL_API_TESTS === 'true' &&
         process.env.GITHUB_TOKEN &&
         process.env.TEST_REPO;
}

module.exports = {
  defaultConfig,
  getConfig,
  getGithubConfig,
  getOpenClawConfig,
  getTestTimeout,
  shouldRunRealApiTests
};