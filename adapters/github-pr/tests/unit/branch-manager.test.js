const { BranchManager } = require('../../src/branch-manager');

describe('BranchManager', () => {
  let manager;
  let mockPRClient;

  beforeEach(() => {
    mockPRClient = {
      createBranch: jest.fn().mockResolvedValue({
        branch_name: 'expert-pack/dispatch-001',
        head_sha: 'abc123'
      }),
      getBranch: jest.fn()
    };

    manager = new BranchManager(mockPRClient, {
      github_pr_config: {
        branch_config: {
          default_base_branch: 'main',
          branch_prefix: 'expert-pack/',
          branch_name_format: 'expert-pack/{dispatch_id}'
        }
      }
    });
  });

  describe('generateBranchName', () => {
    it('should generate branch name from dispatch ID', () => {
      const name = manager.generateBranchName('dispatch-001');

      expect(name).toBe('expert-pack/dispatch-001');
    });

    it('should sanitize dispatch ID', () => {
      const name = manager.generateBranchName('Dispatch@#$001');

      expect(name).toBe('expert-pack/dispatch-001');
    });

    it('should truncate long dispatch IDs', () => {
      const longId = 'a'.repeat(150);
      const name = manager.generateBranchName(longId);

      expect(name.length).toBeLessThanOrEqual(112);
    });
  });

  describe('sanitizeBranchName', () => {
    it('should convert to lowercase', () => {
      const sanitized = manager.sanitizeBranchName('MyBranch');

      expect(sanitized).toBe('mybranch');
    });

    it('should replace special characters with dashes', () => {
      const sanitized = manager.sanitizeBranchName('my@branch#name');

      expect(sanitized).toBe('my-branch-name');
    });

    it('should collapse multiple dashes', () => {
      const sanitized = manager.sanitizeBranchName('my---branch');

      expect(sanitized).toBe('my-branch');
    });

    it('should remove leading and trailing dashes', () => {
      const sanitized = manager.sanitizeBranchName('-my-branch-');

      expect(sanitized).toBe('my-branch');
    });
  });

  describe('ensureBranch', () => {
    it('should create new branch if not exists', async () => {
      mockPRClient.getBranch.mockRejectedValue(new Error('Not found'));

      const result = await manager.ensureBranch('owner', 'repo', 'dispatch-001');

      expect(result.created).toBe(true);
      expect(result.branch_name).toBe('expert-pack/dispatch-001');
      expect(mockPRClient.createBranch).toHaveBeenCalled();
    });

    it('should return existing branch if exists', async () => {
      mockPRClient.getBranch.mockResolvedValue({
        branch_name: 'expert-pack/dispatch-001',
        head_sha: 'existing-sha'
      });

      const result = await manager.ensureBranch('owner', 'repo', 'dispatch-001');

      expect(result.created).toBe(false);
      expect(result.head_sha).toBe('existing-sha');
      expect(mockPRClient.createBranch).not.toHaveBeenCalled();
    });
  });

  describe('parseBranchInfo', () => {
    it('should parse expert-pack branch', () => {
      const info = manager.parseBranchInfo('expert-pack/dispatch-001');

      expect(info.is_expert_pack_branch).toBe(true);
      expect(info.dispatch_id).toBe('dispatch-001');
    });

    it('should identify non-expert-pack branch', () => {
      const info = manager.parseBranchInfo('feature/my-feature');

      expect(info.is_expert_pack_branch).toBe(false);
      expect(info.dispatch_id).toBeNull();
    });
  });

  describe('getBaseBranch', () => {
    it('should return default base branch', () => {
      expect(manager.getBaseBranch()).toBe('main');
    });
  });

  describe('isValidBranchName', () => {
    it('should accept valid branch names', () => {
      expect(manager.isValidBranchName('feature/my-feature')).toBe(true);
      expect(manager.isValidBranchName('main')).toBe(true);
    });

    it('should reject names starting with dot', () => {
      expect(manager.isValidBranchName('.hidden')).toBe(false);
    });

    it('should reject overly long names', () => {
      expect(manager.isValidBranchName('a'.repeat(300))).toBe(false);
    });
  });
});