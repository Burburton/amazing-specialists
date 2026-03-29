const mockGitHubAPI = require('./mock-github');
const nock = require('nock');

beforeEach(() => {
  nock.cleanAll();
});

afterEach(() => {
  nock.cleanAll();
});

global.testHelpers = mockGitHubAPI;