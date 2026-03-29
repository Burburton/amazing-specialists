class BranchManager {
  constructor(prClient, config) {
    this.prClient = prClient;
    this.config = config || {};
    this.branchConfig = config?.github_pr_config?.branch_config || {};
    
    this.defaultBaseBranch = this.branchConfig.default_base_branch || 'main';
    this.branchPrefix = this.branchConfig.branch_prefix || 'expert-pack/';
    this.branchNameFormat = this.branchConfig.branch_name_format || 'expert-pack/{dispatch_id}';
  }

  async ensureBranch(owner, repo, dispatchId, baseBranch) {
    const branchName = this.generateBranchName(dispatchId);
    const targetBaseBranch = baseBranch || this.defaultBaseBranch;

    const existing = await this.checkBranchExists(owner, repo, branchName);
    
    if (existing) {
      return {
        branch_name: branchName,
        base_branch: targetBaseBranch,
        created: false,
        head_sha: existing.head_sha
      };
    }

    const created = await this.prClient.createBranch(owner, repo, branchName, targetBaseBranch);
    
    return {
      branch_name: branchName,
      base_branch: targetBaseBranch,
      created: true,
      head_sha: created.head_sha
    };
  }

  async checkBranchExists(owner, repo, branchName) {
    try {
      const result = await this.prClient.getBranch(owner, repo, branchName);
      return {
        exists: true,
        branch_name: result.branch_name,
        head_sha: result.head_sha
      };
    } catch (error) {
      return null;
    }
  }

  generateBranchName(dispatchId) {
    const sanitized = this.sanitizeBranchName(dispatchId);
    return this.branchNameFormat.replace('{dispatch_id}', sanitized);
  }

  sanitizeBranchName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }

  parseBranchInfo(branchName) {
    const match = branchName.match(new RegExp(`^${this.branchPrefix}(.+)$`));
    
    if (match) {
      return {
        is_expert_pack_branch: true,
        dispatch_id: match[1]
      };
    }

    return {
      is_expert_pack_branch: false,
      dispatch_id: null
    };
  }

  async getBranchInfo(owner, repo, branchName) {
    try {
      const branch = await this.prClient.getBranch(owner, repo, branchName);
      return {
        exists: true,
        name: branch.branch_name,
        head_sha: branch.head_sha
      };
    } catch (error) {
      return {
        exists: false,
        name: branchName,
        error: error.message
      };
    }
  }

  getBaseBranch() {
    return this.defaultBaseBranch;
  }

  setBaseBranch(branch) {
    this.defaultBaseBranch = branch;
  }

  isValidBranchName(name) {
    if (!name || name.length > 255) {
      return false;
    }

    if (name.startsWith('.') || name.endsWith('.')) {
      return false;
    }

    if (name.includes('..') || name.includes('//')) {
      return false;
    }

    const invalidChars = ['\\', ':', '[', ']', '{', '}', '~', '^', '?', '*'];
    for (const char of invalidChars) {
      if (name.includes(char)) {
        return false;
      }
    }

    return true;
  }
}

module.exports = { BranchManager };