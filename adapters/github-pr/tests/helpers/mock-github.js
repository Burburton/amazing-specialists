const nock = require('nock');

const GITHUB_API_URL = 'https://api.github.com';

function createMockGitHubAPI() {
  return {
    setupBranchMocks(owner, repo, branch, baseBranch = 'main') {
      nock(GITHUB_API_URL)
        .get(`/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`)
        .reply(200, {
          ref: `refs/heads/${baseBranch}`,
          object: { sha: 'abc123basecommit' }
        });

      nock(GITHUB_API_URL)
        .post(`/repos/${owner}/${repo}/git/refs`)
        .reply(201, {
          ref: `refs/heads/${branch}`,
          object: { sha: 'abc123newcommit' }
        });

      nock(GITHUB_API_URL)
        .get(`/repos/${owner}/${repo}/git/ref/heads/${branch}`)
        .reply(200, {
          ref: `refs/heads/${branch}`,
          object: { sha: 'abc123newcommit' }
        });
    },

    setupPRMocks(owner, repo, prNumber, branch) {
      nock(GITHUB_API_URL)
        .post(`/repos/${owner}/${repo}/pulls`)
        .reply(201, {
          number: prNumber,
          html_url: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
          head: { ref: branch },
          base: { ref: 'main' }
        });

      nock(GITHUB_API_URL)
        .get(`/repos/${owner}/${repo}/pulls/${prNumber}`)
        .reply(200, {
          number: prNumber,
          html_url: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
          head: { ref: branch, sha: 'abc123' },
          base: { ref: 'main' }
        });
    },

    setupCommitMocks(owner, repo) {
      nock(GITHUB_API_URL)
        .put(/\/repos\/.+\/contents\/.+/)
        .reply(200, {
          commit: {
            sha: 'abc123commit',
            html_url: `https://github.com/${owner}/${repo}/commit/abc123commit`
          }
        });
    },

    setupReviewMocks(owner, repo, prNumber) {
      nock(GITHUB_API_URL)
        .post(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`)
        .reply(200, {
          id: 12345,
          state: 'APPROVED'
        });

      nock(GITHUB_API_URL)
        .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
        .reply(201, {
          id: 54321,
          html_url: `https://github.com/${owner}/${repo}/issues/${prNumber}#issuecomment-54321`
        });
    },

    setupLabelMocks(owner, repo, issueNumber, label) {
      nock(GITHUB_API_URL)
        .post(`/repos/${owner}/${repo}/issues/${issueNumber}/labels`)
        .reply(200, [{
          name: label
        }]);
    },

    setupRateLimitMocks(remaining = 5000, limit = 5000) {
      nock(GITHUB_API_URL)
        .get('/rate_limit')
        .reply(200, {
          resources: {
            core: { limit, remaining, reset: Date.now() / 1000 + 3600 }
          }
        }, {
          'x-ratelimit-limit': limit.toString(),
          'x-ratelimit-remaining': remaining.toString(),
          'x-ratelimit-reset': Math.floor(Date.now() / 1000 + 3600).toString()
        });
    },

    setupErrorMocks(owner, repo, statusCode, message) {
      nock(GITHUB_API_URL)
        .get(`/repos/${owner}/${repo}`)
        .reply(statusCode, {
          message
        });
    },

    cleanAll() {
      nock.cleanAll();
    }
  };
}

function createSampleExecutionResult(overrides = {}) {
  return {
    dispatch_id: 'dispatch-001',
    project_id: 'owner/repo',
    milestone_id: 'M001',
    task_id: 'T001',
    role: 'developer',
    command: 'implement-task',
    status: 'SUCCESS',
    summary: 'Implementation completed successfully',
    artifacts: [
      {
        artifact_id: 'artifact-001',
        artifact_type: 'implementation_summary',
        title: 'Implementation Summary',
        path: 'docs/implementation-summary.md',
        format: 'markdown',
        summary: 'Summary of changes',
        created_by_role: 'developer',
        related_task_id: 'T001',
        created_at: new Date().toISOString(),
        metadata: {
          content: '# Implementation Summary\n\nChanges made...'
        }
      }
    ],
    changed_files: [
      {
        path: 'src/new-feature.js',
        change_type: 'added',
        diff_summary: 'Added new feature implementation',
        content: 'export function newFeature() { return true; }'
      }
    ],
    checks_performed: ['code-style', 'unit-tests'],
    issues_found: [],
    risks: [],
    recommendation: 'CONTINUE',
    needs_followup: false,
    created_at: new Date().toISOString(),
    ...overrides
  };
}

function createSampleEscalation(overrides = {}) {
  return {
    escalation_id: 'esc-001',
    dispatch_id: 'dispatch-001',
    project_id: 'owner/repo',
    milestone_id: 'M001',
    task_id: 'T001',
    role: 'developer',
    level: 'USER',
    reason_type: 'HIGH_RISK_CHANGE',
    summary: 'High risk change requires user decision',
    blocking_points: ['Potential breaking change in API'],
    evidence: {
      related_artifacts: ['artifact-001'],
      logs: ['Warning: API signature changed'],
      failure_history: []
    },
    attempted_actions: ['Attempted to proceed with change'],
    recommended_next_steps: ['Review API changes', 'Update documentation'],
    requires_user_decision: true,
    created_at: new Date().toISOString(),
    created_by: 'developer',
    ...overrides
  };
}

function createSampleChangedFiles() {
  return [
    {
      path: 'src/feature.js',
      change_type: 'added',
      diff_summary: 'Added new feature',
      content: 'export const feature = () => {};'
    },
    {
      path: 'src/utils.js',
      change_type: 'modified',
      diff_summary: 'Updated utility function',
      content: 'export const util = () => {};'
    },
    {
      path: 'src/deprecated.js',
      change_type: 'deleted',
      diff_summary: 'Removed deprecated file'
    }
  ];
}

function createSampleArtifacts() {
  return [
    {
      artifact_id: 'art-001',
      artifact_type: 'implementation_summary',
      title: 'Implementation Summary',
      path: 'docs/summary.md',
      format: 'markdown',
      summary: 'Summary',
      created_by_role: 'developer',
      related_task_id: 'T001',
      created_at: new Date().toISOString(),
      metadata: {
        content: '# Summary\n\nContent here...'
      }
    }
  ];
}

module.exports = {
  createMockGitHubAPI,
  createSampleExecutionResult,
  createSampleEscalation,
  createSampleChangedFiles,
  createSampleArtifacts
};