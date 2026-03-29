const { Octokit } = require('@octokit/rest');
const { TokenManager } = require('./utils/token-manager');
const { RateLimitTracker } = require('./utils/rate-limit-tracker');
const { ErrorClassifier } = require('./utils/error-classifier');

class PRClient {
  constructor(config) {
    this.config = config || {};
    this.octokit = null;
    this.tokenManager = new TokenManager(config?.authentication);
    this.rateLimitTracker = new RateLimitTracker(config?.rate_limit);
    this.errorClassifier = new ErrorClassifier();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    const { token, valid } = await this.tokenManager.getToken();
    
    if (!valid || !token) {
      throw new Error('Failed to obtain valid authentication token');
    }

    this.octokit = new Octokit({
      auth: token,
      baseUrl: this.config?.api?.base_url || 'https://api.github.com',
      userAgent: this.config?.api?.user_agent || 'OpenCode-ExpertPack/1.0.0'
    });

    this.initialized = true;
  }

  async _ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async _executeWithRetry(fn, maxRetries = 3) {
    await this._ensureInitialized();
    
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      await this.rateLimitTracker.waitForRateLimit();
      
      try {
        const result = await fn();
        
        if (result?.headers) {
          this.rateLimitTracker.updateFromHeaders(result.headers);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        const classification = this.errorClassifier.classify(error);
        
        if (!classification.retryable || attempt === maxRetries - 1) {
          throw error;
        }
        
        const backoff = this.rateLimitTracker.calculateBackoff();
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
    
    throw lastError;
  }

  async createBranch(owner, repo, branchName, baseBranch = 'main') {
    return this._executeWithRetry(async () => {
      const baseRef = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${baseBranch}`
      });

      const result = await this.octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: baseRef.data.object.sha
      });

      return {
        branch_name: branchName,
        base_branch: baseBranch,
        created: true,
        head_sha: result.data.object.sha
      };
    });
  }

  async getBranch(owner, repo, branchName) {
    return this._executeWithRetry(async () => {
      const result = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branchName}`
      });

      return {
        exists: true,
        branch_name: branchName,
        head_sha: result.data.object.sha
      };
    });
  }

  async createOrUpdateFile(owner, repo, path, content, message, branch, sha = null) {
    return this._executeWithRetry(async () => {
      const params = {
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch
      };

      if (sha) {
        params.sha = sha;
      }

      const result = await this.octokit.repos.createOrUpdateFileContents(params);

      return {
        path,
        sha: result.data.content?.sha || result.data.commit.sha,
        commit_sha: result.data.commit.sha,
        operation: sha ? 'updated' : 'created'
      };
    });
  }

  async deleteFile(owner, repo, path, message, branch, sha) {
    return this._executeWithRetry(async () => {
      const result = await this.octokit.repos.deleteFile({
        owner,
        repo,
        path,
        message,
        sha,
        branch
      });

      return {
        path,
        deleted: true,
        commit_sha: result.data.commit.sha
      };
    });
  }

  async getFile(owner, repo, path, ref) {
    return this._executeWithRetry(async () => {
      const result = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (Array.isArray(result.data)) {
        return { isDirectory: true, entries: result.data };
      }

      return {
        isDirectory: false,
        content: Buffer.from(result.data.content, 'base64').toString('utf8'),
        sha: result.data.sha,
        path: result.data.path
      };
    });
  }

  async createPR(owner, repo, title, head, base, body) {
    return this._executeWithRetry(async () => {
      const result = await this.octokit.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
        body,
        draft: this.config?.pr_config?.draft_by_default || false
      });

      return {
        pr_number: result.data.number,
        pr_url: result.data.html_url,
        branch_name: head,
        status: 'created',
        base_branch: base
      };
    });
  }

  async getPR(owner, repo, prNumber) {
    return this._executeWithRetry(async () => {
      const result = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber
      });

      return {
        number: result.data.number,
        state: result.data.state,
        title: result.data.title,
        head: result.data.head.ref,
        base: result.data.base.ref,
        head_sha: result.data.head.sha,
        draft: result.data.draft
      };
    });
  }

  async findPRByBranch(owner, repo, branchName) {
    return this._executeWithRetry(async () => {
      const result = await this.octokit.pulls.list({
        owner,
        repo,
        head: `${owner}:${branchName}`,
        state: 'all'
      });

      if (result.data.length === 0) {
        return null;
      }

      const pr = result.data[0];
      return {
        pr_number: pr.number,
        pr_url: pr.html_url,
        state: pr.state,
        branch_name: pr.head.ref
      };
    });
  }

  async createReview(owner, repo, prNumber, event, body) {
    return this._executeWithRetry(async () => {
      const result = await this.octokit.pulls.createReview({
        owner,
        repo,
        pull_number: prNumber,
        event,
        body
      });

      return {
        review_id: result.data.id,
        state: result.data.state
      };
    });
  }

  async createReviewComment(owner, repo, prNumber, body, path, line) {
    return this._executeWithRetry(async () => {
      const params = {
        owner,
        repo,
        pull_number: prNumber,
        body
      };

      if (path && line) {
        params.path = path;
        params.line = line;
        params.side = 'RIGHT';
      }

      const result = await this.octokit.pulls.createReviewComment(params);

      return {
        comment_id: result.data.id,
        path: result.data.path,
        line: result.data.line
      };
    });
  }

  async addLabels(owner, repo, issueNumber, labels) {
    return this._executeWithRetry(async () => {
      await this.octokit.issues.addLabels({
        owner,
        repo,
        issue_number: issueNumber,
        labels: Array.isArray(labels) ? labels : [labels]
      });

      return { added: true, labels };
    });
  }

  async removeLabel(owner, repo, issueNumber, label) {
    return this._executeWithRetry(async () => {
      await this.octokit.issues.removeLabel({
        owner,
        repo,
        issue_number: issueNumber,
        name: label
      });

      return { removed: true, label };
    });
  }

  async getLabels(owner, repo, issueNumber) {
    return this._executeWithRetry(async () => {
      const result = await this.octokit.issues.listLabelsOnIssue({
        owner,
        repo,
        issue_number: issueNumber
      });

      return result.data.map(label => label.name);
    });
  }

  getRateLimitInfo() {
    return this.rateLimitTracker.getInfo();
  }

  getRateLimitStatus() {
    return this.rateLimitTracker.getStatus();
  }
}

module.exports = { PRClient };