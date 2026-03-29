const { PRClient } = require('./src/pr-client');
const { FileHandler } = require('./src/file-handler');
const { ArtifactWriter } = require('./src/artifact-writer');
const { ReviewManager, ReviewEvent } = require('./src/review-manager');
const { BranchManager } = require('./src/branch-manager');
const { CommitBuilder } = require('./src/commit-builder');
const { EscalationHandler } = require('./src/escalation-handler');
const { RetryHandler, RetryDecision } = require('./src/retry-handler');
const { PathValidator } = require('./src/path-validator');
const { CommentTemplates } = require('./src/comment-templates');

const fs = require('fs');
const path = require('path');

const ADAPTER_INFO = {
  adapter_id: 'github-pr',
  adapter_type: 'workspace',
  version: '1.0.0',
  priority: 'later',
  status: 'implemented',
  description: 'GitHub PR Workspace Adapter for outputting execution results to GitHub Pull Requests',
  compatible_profiles: ['minimal', 'full'],
  workspace_type: 'github_repo'
};

const DEFAULT_CONFIG_PATH = './github-pr.config.json';

class GitHubPRAdapter {
  constructor(config = null) {
    this.config = config || this.loadConfig(DEFAULT_CONFIG_PATH);
    this.adapterId = 'github-pr';
    this.adapterType = 'workspace';
    this.version = '1.0.0';
    
    this.prClient = new PRClient(this.config?.github_pr_config);
    this.fileHandler = new FileHandler(this.config);
    this.artifactWriter = new ArtifactWriter(this.prClient, this.config);
    this.reviewManager = new ReviewManager(this.prClient, this.config);
    this.branchManager = new BranchManager(this.prClient, this.config);
    this.commitBuilder = new CommitBuilder(this.config);
    this.escalationHandler = new EscalationHandler(this.prClient, this.reviewManager, this.config);
    this.retryHandler = new RetryHandler(this.config?.retry_config);
    this.pathValidator = new PathValidator(this.config);
    this.commentTemplates = new CommentTemplates();

    this.escalationHandler.setCommentTemplates(this.commentTemplates);

    this._outputState = {
      artifacts_written: [],
      files_changed: [],
      errors: [],
      warnings: []
    };

    this._context = null;
  }

  loadConfig(configPath) {
    try {
      const resolvedPath = path.resolve(__dirname, configPath);
      if (fs.existsSync(resolvedPath)) {
        const content = fs.readFileSync(resolvedPath, 'utf8');
        return JSON.parse(content);
      }
    } catch (err) {
      console.warn(`Failed to load config: ${err.message}`);
    }
    return this.getDefaultConfig();
  }

  getDefaultConfig() {
    return {
      adapter_id: 'github-pr',
      adapter_type: 'workspace',
      workspace_type: 'github_repo',
      profile: 'minimal',
      output_config: {
        artifact_path: 'docs/artifacts/',
        changed_files_path: './',
        console_output: false
      },
      escalation_config: {
        channel: 'github_comment',
        requires_acknowledgment: true
      },
      retry_config: {
        strategy: 'configurable',
        max_retry: 2,
        trigger: 'user_decision'
      },
      github_pr_config: {
        branch_config: {
          default_base_branch: 'main',
          branch_prefix: 'expert-pack/'
        }
      }
    };
  }

  async initialize() {
    await this.prClient.initialize();
  }

  setContext(context) {
    this._context = {
      owner: context.owner,
      repo: context.repo,
      base_branch: context.base_branch || 'main'
    };
  }

  async handleArtifacts(result) {
    this._resetOutputState();

    if (!this._context) {
      this._outputState.errors.push('Context not set. Call setContext() first.');
      return this._buildOutputResult(false);
    }

    if (!result.artifacts || result.artifacts.length === 0) {
      return this._buildOutputResult(true);
    }

    try {
      await this.initialize();

      const dispatchId = result.dispatch_id || 'default';
      const branchResult = await this.branchManager.ensureBranch(
        this._context.owner,
        this._context.repo,
        dispatchId,
        this._context.base_branch
      );

      const writeResult = await this.artifactWriter.writeArtifacts(
        result.artifacts,
        this._context.owner,
        this._context.repo,
        branchResult.branch_name
      );

      this._outputState.artifacts_written = writeResult.artifacts_written;
      this._outputState.errors.push(...writeResult.errors);
      this._outputState.warnings.push(...writeResult.warnings);

      return this._buildOutputResult(writeResult.success);
    } catch (error) {
      this._outputState.errors.push(error.message);
      return this._buildOutputResult(false);
    }
  }

  async handleChangedFiles(result) {
    this._resetOutputState();

    if (!this._context) {
      this._outputState.errors.push('Context not set. Call setContext() first.');
      return this._buildChangedFilesResult(false);
    }

    if (!result.changed_files || result.changed_files.length === 0) {
      return this._buildChangedFilesResult(true);
    }

    try {
      await this.initialize();

      const dispatchId = result.dispatch_id || 'default';
      const branchResult = await this.branchManager.ensureBranch(
        this._context.owner,
        this._context.repo,
        dispatchId,
        this._context.base_branch
      );

      const processed = this.fileHandler.processChangedFiles(result.changed_files);

      for (const file of processed.files) {
        if (!file.valid) continue;

        for (const op of file.operations) {
          if (op.type === 'delete') {
            try {
              const existing = await this.prClient.getFile(
                this._context.owner,
                this._context.repo,
                op.path,
                branchResult.branch_name
              );

              if (!existing.isDirectory) {
                await this.prClient.deleteFile(
                  this._context.owner,
                  this._context.repo,
                  op.path,
                  `Delete ${op.path}`,
                  branchResult.branch_name,
                  existing.sha
                );
                this._outputState.files_changed.push(op.path);
              }
            } catch (e) {
              this._outputState.warnings.push(`Could not delete ${op.path}: file not found`);
            }
          } else {
            const fileData = result.changed_files.find(f => f.path === op.path);
            if (fileData?.content) {
              await this.prClient.createOrUpdateFile(
                this._context.owner,
                this._context.repo,
                op.path,
                fileData.content,
                this.commitBuilder.buildCommitMessage([fileData], result.artifacts?.[0]),
                branchResult.branch_name
              );
              this._outputState.files_changed.push(op.path);
            }
          }
        }
      }

      return this._buildChangedFilesResult(true);
    } catch (error) {
      this._outputState.errors.push(error.message);
      return this._buildChangedFilesResult(false);
    }
  }

  async handleEscalation(escalation) {
    if (!this._context) {
      return {
        success: false,
        error: 'Context not set. Call setContext() first.'
      };
    }

    try {
      await this.initialize();

      const dispatchId = escalation.dispatch_id || 'default';
      const pr = await this.prClient.findPRByBranch(
        this._context.owner,
        this._context.repo,
        this.branchManager.generateBranchName(dispatchId)
      );

      if (!pr) {
        return {
          success: false,
          error: 'No PR found for dispatch'
        };
      }

      return await this.escalationHandler.handleEscalation(
        escalation,
        this._context.owner,
        this._context.repo,
        pr.pr_number
      );
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  validateArtifactOutput(artifacts) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!artifacts || !Array.isArray(artifacts)) {
      result.isValid = false;
      result.errors.push('Artifacts must be an array');
      return result;
    }

    for (const artifact of artifacts) {
      const validation = this.pathValidator.validateArtifactPath(artifact);
      
      if (!validation.valid) {
        result.isValid = false;
        result.errors.push(...validation.errors.map(e => `${artifact.path}: ${e}`));
      }
      
      result.warnings.push(...validation.warnings.map(w => `${artifact.path}: ${w}`));
    }

    return result;
  }

  validatePaths(paths) {
    return this.pathValidator.validatePaths(paths);
  }

  handleRetry(context) {
    return this.retryHandler.shouldRetry(context);
  }

  async syncState(result) {
    if (!this._context) return;

    try {
      await this.initialize();

      const dispatchId = result.dispatch_id || 'default';
      const branchName = this.branchManager.generateBranchName(dispatchId);

      let pr = await this.prClient.findPRByBranch(
        this._context.owner,
        this._context.repo,
        branchName
      );

      if (!pr) {
        const prTitle = this.commitBuilder.buildPRTitle(result.artifacts?.[0], result);
        const prBody = this.commitBuilder.buildPRBody(result, result.artifacts);

        pr = await this.prClient.createPR(
          this._context.owner,
          this._context.repo,
          prTitle,
          branchName,
          this._context.base_branch || 'main',
          prBody
        );
      }

      await this.reviewManager.setReviewStatus(
        this._context.owner,
        this._context.repo,
        pr.pr_number,
        result.status
      );

      await this.reviewManager.addStatusLabel(
        this._context.owner,
        this._context.repo,
        pr.pr_number,
        result.status
      );

      return {
        success: true,
        pr_number: pr.pr_number,
        pr_url: pr.pr_url
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  getOutputSummary() {
    return {
      success: this._outputState.errors.length === 0,
      artifacts_written: this._outputState.artifacts_written,
      files_changed: this._outputState.files_changed,
      console_output: false,
      errors: this._outputState.errors,
      warnings: this._outputState.warnings
    };
  }

  getAdapterInfo() {
    return { ...ADAPTER_INFO };
  }

  getRateLimitInfo() {
    return this.prClient.getRateLimitInfo();
  }

  _resetOutputState() {
    this._outputState = {
      artifacts_written: [],
      files_changed: [],
      errors: [],
      warnings: []
    };
  }

  _buildOutputResult(success) {
    return {
      success,
      artifacts_written: this._outputState.artifacts_written,
      errors: this._outputState.errors,
      warnings: this._outputState.warnings
    };
  }

  _buildChangedFilesResult(success) {
    return {
      success,
      files_changed: this._outputState.files_changed,
      errors: this._outputState.errors,
      warnings: this._outputState.warnings
    };
  }
}

function create(config = null) {
  return new GitHubPRAdapter(config);
}

module.exports = {
  GitHubPRAdapter,
  create,
  ADAPTER_INFO
};