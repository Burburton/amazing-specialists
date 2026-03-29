const nock = require('nock');

function mockGetIssue(owner, repo, number, response = {}, options = {}) {
  const defaultResponse = {
    number: number,
    title: '[architect:design-task] Test Issue',
    body: '## Context\nTest context\n## Goal\nTest goal',
    labels: [{ name: 'milestone:mvp' }, { name: 'risk:low' }],
    state: 'open',
    user: { login: 'test-user' },
    repository: {
      owner: { login: owner },
      name: repo
    }
  };

  return nock('https://api.github.com')
    .get(`/repos/${owner}/${repo}/issues/${number}`)
    .reply(options.statusCode || 200, { ...defaultResponse, ...response });
}

function mockCreateIssue(owner, repo, response = {}, options = {}) {
  const defaultResponse = {
    number: Math.floor(Math.random() * 1000) + 1,
    html_url: `https://github.com/${owner}/${repo}/issues/1`,
    state: 'open'
  };

  return nock('https://api.github.com')
    .post(`/repos/${owner}/${repo}/issues`)
    .reply(options.statusCode || 201, { ...defaultResponse, ...response });
}

function mockCreatePR(owner, repo, response = {}, options = {}) {
  const prNumber = Math.floor(Math.random() * 1000) + 1;
  const defaultResponse = {
    number: prNumber,
    html_url: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
    state: 'open',
    draft: false
  };

  return nock('https://api.github.com')
    .post(`/repos/${owner}/${repo}/pulls`)
    .reply(options.statusCode || 201, { ...defaultResponse, ...response });
}

function mockGetPR(owner, repo, number, response = {}, options = {}) {
  const defaultResponse = {
    number: number,
    state: 'open',
    merged: false,
    draft: false
  };

  return nock('https://api.github.com')
    .get(`/repos/${owner}/${repo}/pulls/${number}`)
    .reply(options.statusCode || 200, { ...defaultResponse, ...response });
}

function mockGetPRFiles(owner, repo, number, response = [], options = {}) {
  const defaultResponse = [
    { filename: 'src/index.js', status: 'added', additions: 10, deletions: 0 },
    { filename: 'tests/index.test.js', status: 'added', additions: 20, deletions: 0 }
  ];

  return nock('https://api.github.com')
    .get(`/repos/${owner}/${repo}/pulls/${number}/files`)
    .reply(options.statusCode || 200, response.length > 0 ? response : defaultResponse);
}

function mockPostComment(owner, repo, number, response = {}, options = {}) {
  const defaultResponse = {
    id: Date.now(),
    html_url: `https://github.com/${owner}/${repo}/issues/${number}#issuecomment-1`
  };

  return nock('https://api.github.com')
    .post(`/repos/${owner}/${repo}/issues/${number}/comments`)
    .reply(options.statusCode || 201, { ...defaultResponse, ...response });
}

function mockAddLabels(owner, repo, number, labels = [], options = {}) {
  return nock('https://api.github.com')
    .post(`/repos/${owner}/${repo}/issues/${number}/labels`, { labels })
    .reply(options.statusCode || 200, labels.map(name => ({ name })));
}

function mockRemoveLabel(owner, repo, number, labelName, options = {}) {
  return nock('https://api.github.com')
    .delete(`/repos/${owner}/${repo}/issues/${number}/labels/${labelName}`)
    .reply(options.statusCode || 200, []);
}

function mockCreateReview(owner, repo, prNumber, response = {}, options = {}) {
  const defaultResponse = {
    id: Date.now(),
    state: 'APPROVED',
    body: 'Looks good!',
    user: { login: 'test-user' }
  };

  return nock('https://api.github.com')
    .post(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`)
    .reply(options.statusCode || 200, { ...defaultResponse, ...response });
}

function mockCreateFile(owner, repo, path, response = {}, options = {}) {
  const defaultResponse = {
    content: { sha: 'abc123' },
    commit: { sha: 'def456' }
  };

  return nock('https://api.github.com')
    .put(`/repos/${owner}/${repo}/contents/${path}`)
    .reply(options.statusCode || 201, { ...defaultResponse, ...response });
}

function mockAuthError(owner, repo) {
  return nock('https://api.github.com')
    .get(/.*/)
    .reply(401, { message: 'Bad credentials' });
}

function mockRateLimitError(owner, repo) {
  return nock('https://api.github.com')
    .get(/.*/)
    .reply(403, {
      message: 'API rate limit exceeded',
      documentation_url: 'https://docs.github.com/rest/rate-limit'
    });
}

function mockNotFoundError(owner, repo, resource) {
  return nock('https://api.github.com')
    .get(new RegExp(`/repos/${owner}/${repo}/${resource}/\\d+`))
    .reply(404, { message: 'Not Found' });
}

module.exports = {
  mockGetIssue,
  mockCreateIssue,
  mockCreatePR,
  mockGetPR,
  mockGetPRFiles,
  mockPostComment,
  mockAddLabels,
  mockRemoveLabel,
  mockCreateReview,
  mockCreateFile,
  mockAuthError,
  mockRateLimitError,
  mockNotFoundError
};