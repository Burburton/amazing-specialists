const { GitHubPRAdapter, create, ADAPTER_INFO } = require('../../index');

describe('GitHubPRAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new GitHubPRAdapter({
      github_pr_config: {
        branch_config: {
          default_base_branch: 'main',
          branch_prefix: 'expert-pack/'
        }
      }
    });
  });

  describe('getAdapterInfo', () => {
    it('should return correct adapter info', () => {
      const info = adapter.getAdapterInfo();

      expect(info.adapter_id).toBe('github-pr');
      expect(info.adapter_type).toBe('workspace');
      expect(info.workspace_type).toBe('github_repo');
      expect(info.compatible_profiles).toContain('minimal');
      expect(info.compatible_profiles).toContain('full');
    });
  });

  describe('setContext', () => {
    it('should set owner and repo context', () => {
      adapter.setContext({ owner: 'test-owner', repo: 'test-repo' });

      expect(adapter._context.owner).toBe('test-owner');
      expect(adapter._context.repo).toBe('test-repo');
      expect(adapter._context.base_branch).toBe('main');
    });

    it('should use custom base branch', () => {
      adapter.setContext({ owner: 'test', repo: 'test', base_branch: 'develop' });

      expect(adapter._context.base_branch).toBe('develop');
    });
  });

  describe('validateArtifactOutput', () => {
    it('should validate artifacts array', () => {
      const result = adapter.validateArtifactOutput([]);

      expect(result.isValid).toBe(true);
    });

    it('should reject non-array', () => {
      const result = adapter.validateArtifactOutput(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Artifacts must be an array');
    });

    it('should validate individual artifacts', () => {
      const artifacts = [{ path: '.env', artifact_type: 'test' }];
      const result = adapter.validateArtifactOutput(artifacts);

      expect(result.isValid).toBe(false);
    });
  });

  describe('validatePaths', () => {
    it('should delegate to path validator', () => {
      const results = adapter.validatePaths(['src/file.js', '.env']);

      expect(results).toHaveLength(2);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(false);
    });
  });

  describe('handleRetry', () => {
    it('should delegate to retry handler', () => {
      const context = { retry_count: 0, max_retry: 2, risk_level: 'low' };
      const decision = adapter.handleRetry(context);

      expect(decision).toBeDefined();
      expect(decision.decision).toBeDefined();
    });
  });

  describe('getOutputSummary', () => {
    it('should return output state', () => {
      const summary = adapter.getOutputSummary();

      expect(summary).toHaveProperty('success');
      expect(summary).toHaveProperty('artifacts_written');
      expect(summary).toHaveProperty('files_changed');
      expect(summary).toHaveProperty('errors');
      expect(summary).toHaveProperty('warnings');
    });
  });

  describe('getDefaultConfig', () => {
    it('should return valid default config', () => {
      const config = adapter.getDefaultConfig();

      expect(config.adapter_id).toBe('github-pr');
      expect(config.adapter_type).toBe('workspace');
      expect(config.workspace_type).toBe('github_repo');
    });
  });
});

describe('create factory', () => {
  it('should create adapter instance', () => {
    const adapter = create();

    expect(adapter).toBeInstanceOf(GitHubPRAdapter);
  });

  it('should accept config parameter', () => {
    const config = { custom: 'config' };
    const adapter = create(config);

    expect(adapter.config.custom).toBe('config');
  });
});

describe('ADAPTER_INFO constant', () => {
  it('should have correct values', () => {
    expect(ADAPTER_INFO.adapter_id).toBe('github-pr');
    expect(ADAPTER_INFO.adapter_type).toBe('workspace');
    expect(ADAPTER_INFO.priority).toBe('later');
    expect(ADAPTER_INFO.status).toBe('implemented');
  });
});