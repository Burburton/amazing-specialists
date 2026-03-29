const { GitHubPRAdapter } = require('../../index');
const nock = require('nock');

const GITHUB_API = 'https://api.github.com';

describe('Integration: GitHub PR Adapter Workflow', () => {
  let adapter;

  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token-12345';

    adapter = new GitHubPRAdapter({
      api: { base_url: 'https://api.github.com' },
      authentication: { primary_method: 'pat', token_env_var: 'GITHUB_TOKEN' },
      rate_limit: { enabled: false },
      github_pr_config: {
        branch_config: {
          default_base_branch: 'main',
          branch_prefix: 'expert-pack/',
          branch_name_format: 'expert-pack/{dispatch_id}'
        },
        labels: {
          success: 'expert-pack:success',
          escalation: 'escalation:needs-decision'
        }
      },
      output_config: {
        artifact_path: ''
      }
    });

    adapter.setContext({
      owner: 'test-owner',
      repo: 'test-repo',
      base_branch: 'main'
    });

    nock.cleanAll();
  });

  afterEach(() => {
    delete process.env.GITHUB_TOKEN;
    nock.cleanAll();
  });

  describe('Workflow 1: Artifact to PR', () => {
    it('should create branch, write artifacts, and create PR', async () => {
      const executionResult = {
        dispatch_id: 'dispatch-001',
        project_id: 'test-owner/test-repo',
        status: 'SUCCESS',
        artifacts: [
          {
            artifact_id: 'art-001',
            artifact_type: 'implementation_summary',
            path: 'docs/summary.md',
            title: 'Implementation Summary',
            created_by_role: 'developer',
            metadata: { content: '# Summary\n\nImplementation complete.' }
          }
        ],
        changed_files: []
      };

      nock(GITHUB_API)
        .get(/\/repos\/test-owner\/test-repo\/git\/ref\/heads/)
        .times(2)
        .reply(200, {
          ref: 'refs/heads/main',
          object: { sha: 'basesha123' }
        });

      nock(GITHUB_API)
        .post('/repos/test-owner/test-repo/git/refs')
        .reply(201, {
          ref: 'refs/heads/expert-pack/dispatch-001',
          object: { sha: 'newcommitsha' }
        });

      nock(GITHUB_API)
        .get(/\/repos\/test-owner\/test-repo\/contents\/docs%2Fsummary\.md/)
        .query({ ref: 'expert-pack/dispatch-001' })
        .reply(404);

      nock(GITHUB_API)
        .put(/\/repos\/test-owner\/test-repo\/contents\/docs%2Fsummary\.md/)
        .reply(200, {
          content: { sha: 'filesha' },
          commit: { sha: 'commitsha' }
        });

      nock(GITHUB_API)
        .get('/repos/test-owner/test-repo/pulls')
        .query({ head: 'test-owner:expert-pack/dispatch-001', state: 'all' })
        .reply(200, []);

      nock(GITHUB_API)
        .post('/repos/test-owner/test-repo/pulls')
        .reply(201, {
          number: 42,
          html_url: 'https://github.com/test-owner/test-repo/pull/42',
          head: { ref: 'expert-pack/dispatch-001' },
          base: { ref: 'main' }
        });

      nock(GITHUB_API)
        .post('/repos/test-owner/test-repo/pulls/42/reviews')
        .reply(200, { id: 123, state: 'APPROVED' });

      nock(GITHUB_API)
        .post('/repos/test-owner/test-repo/issues/42/labels')
        .reply(200, [{ name: 'expert-pack:success' }]);

      const artifactResult = await adapter.handleArtifacts(executionResult);
      expect(artifactResult.success).toBe(true);
      expect(artifactResult.artifacts_written).toContain('docs/summary.md');

      const syncResult = await adapter.syncState(executionResult);
      expect(syncResult.success).toBe(true);
      expect(syncResult.pr_number).toBe(42);
    });
  });

  describe('Workflow 2: Changed Files to Commit', () => {
    it('should process changed files and validate them', async () => {
      const executionResult = {
        dispatch_id: 'dispatch-002',
        changed_files: [
          {
            path: 'src/feature.js',
            change_type: 'added',
            content: 'export function feature() { return true; }'
          }
        ]
      };

      nock(GITHUB_API)
        .get(/\/repos\/test-owner\/test-repo\/git\/ref\/heads/)
        .reply(200, {
          ref: 'refs/heads/main',
          object: { sha: 'basesha123' }
        });

      nock(GITHUB_API)
        .post('/repos/test-owner/test-repo/git/refs')
        .reply(201, {
          ref: 'refs/heads/expert-pack/dispatch-002',
          object: { sha: 'newbranchsha' }
        });

      nock(GITHUB_API)
        .get(/\/repos\/test-owner\/test-repo\/contents/)
        .reply(404);

      nock(GITHUB_API)
        .put(/\/repos\/test-owner\/test-repo\/contents/)
        .reply(200, {
          content: { sha: 'filesha' },
          commit: { sha: 'commitsha' }
        });

      const result = await adapter.handleChangedFiles(executionResult);

      expect(result.files_changed).toContain('src/feature.js');
    });
  });

  describe('Workflow 3: Status to Review', () => {
    it('should map execution status to PR review', async () => {
      const executionResult = {
        dispatch_id: 'dispatch-003',
        status: 'SUCCESS',
        summary: 'All tasks completed successfully'
      };

      nock(GITHUB_API)
        .get('/repos/test-owner/test-repo/pulls')
        .query({ head: 'test-owner:expert-pack/dispatch-003', state: 'all' })
        .reply(200, [
          {
            number: 50,
            html_url: 'https://github.com/test-owner/test-repo/pull/50',
            state: 'open',
            head: { ref: 'expert-pack/dispatch-003' }
          }
        ]);

      nock(GITHUB_API)
        .post('/repos/test-owner/test-repo/pulls/50/reviews')
        .reply(200, { id: 456, state: 'APPROVED' });

      nock(GITHUB_API)
        .post('/repos/test-owner/test-repo/issues/50/labels')
        .reply(200, [{ name: 'expert-pack:success' }]);

      const result = await adapter.syncState(executionResult);

      expect(result.success).toBe(true);
      expect(result.pr_number).toBe(50);
    });
  });

  describe('Workflow 4: Escalation to Comment', () => {
    it('should post escalation comment to PR', async () => {
      const escalation = {
        escalation_id: 'esc-001',
        dispatch_id: 'dispatch-004',
        reason_type: 'HIGH_RISK_CHANGE',
        level: 'USER',
        blocking_points: ['Breaking API change detected'],
        recommended_next_steps: ['Review API changes'],
        requires_user_decision: true
      };

      nock(GITHUB_API)
        .get('/repos/test-owner/test-repo/pulls')
        .query({ head: 'test-owner:expert-pack/dispatch-004', state: 'all' })
        .reply(200, [
          {
            number: 60,
            html_url: 'https://github.com/test-owner/test-repo/pull/60',
            state: 'open',
            head: { ref: 'expert-pack/dispatch-004' }
          }
        ]);

      nock(GITHUB_API)
        .post('/repos/test-owner/test-repo/pulls/60/reviews')
        .reply(200, { id: 789, state: 'COMMENTED' });

      nock(GITHUB_API)
        .post('/repos/test-owner/test-repo/issues/60/labels')
        .reply(200, [{ name: 'escalation:needs-decision' }]);

      const result = await adapter.handleEscalation(escalation);

      expect(result.success).toBe(true);
    });
  });

  describe('Workflow 5: Retry Handling', () => {
    it('should decide retry based on context', () => {
      const retryContext = {
        retry_count: 0,
        max_retry: 2,
        risk_level: 'low',
        error_type: 'server_error'
      };

      const decision = adapter.handleRetry(retryContext);

      expect(decision.decision).toBe('retry');
    });

    it('should escalate when retry exhausted', () => {
      const retryContext = {
        retry_count: 2,
        max_retry: 2,
        risk_level: 'low',
        error_type: 'server_error'
      };

      const decision = adapter.handleRetry(retryContext);

      expect(decision.decision).toBe('escalate');
    });
  });

  describe('Workflow 6: Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const executionResult = {
        dispatch_id: 'dispatch-005',
        artifacts: [
          {
            artifact_id: 'art-001',
            artifact_type: 'implementation_summary',
            path: 'valid.md',
            metadata: { content: 'content' }
          }
        ]
      };

      nock(GITHUB_API)
        .get(/\/repos\/test-owner\/test-repo\/git\/ref\/heads/)
        .reply(401, { message: 'Bad credentials' });

      const result = await adapter.handleArtifacts(executionResult);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Adapter Info', () => {
    it('should return correct adapter info', () => {
      const info = adapter.getAdapterInfo();

      expect(info.adapter_id).toBe('github-pr');
      expect(info.adapter_type).toBe('workspace');
      expect(info.workspace_type).toBe('github_repo');
      expect(info.compatible_profiles).toContain('minimal');
    });
  });

  describe('Path Validation', () => {
    it('should validate artifact paths', () => {
      const artifacts = [
        { path: 'valid.md', artifact_type: 'test' },
        { path: '.env', artifact_type: 'test' }
      ];

      const result = adapter.validateArtifactOutput(artifacts);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should accept valid paths', () => {
      const artifacts = [
        { path: 'docs/summary.md', artifact_type: 'implementation_summary' }
      ];

      const result = adapter.validatePaths(['docs/summary.md']);

      expect(result[0].valid).toBe(true);
    });
  });
});