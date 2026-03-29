const path = require('path');

class ArtifactWriter {
  constructor(prClient, config) {
    this.prClient = prClient;
    this.config = config || {};
    this.outputConfig = config?.output_config || {};
    this.validationConfig = config?.github_pr_config?.validation || {};
  }

  async writeArtifacts(artifacts, owner, repo, branch) {
    const results = {
      success: true,
      artifacts_written: [],
      errors: [],
      warnings: []
    };

    if (!artifacts || artifacts.length === 0) {
      results.warnings.push('No artifacts to write');
      return results;
    }

    for (const artifact of artifacts) {
      try {
        const result = await this.writeArtifact(artifact, owner, repo, branch);
        
        if (result.success) {
          results.artifacts_written.push(artifact.path);
        } else {
          results.errors.push(result.error);
          results.success = false;
        }
      } catch (error) {
        results.errors.push(`Failed to write artifact ${artifact.path}: ${error.message}`);
        results.success = false;
      }
    }

    return results;
  }

  async writeArtifact(artifact, owner, repo, branch) {
    const result = {
      success: false,
      path: artifact.path,
      error: null
    };

    const validation = this.validateArtifact(artifact);
    if (!validation.valid) {
      result.error = validation.error;
      return result;
    }

    const content = this.extractContent(artifact);
    if (!content) {
      result.error = 'Artifact has no content to write';
      return result;
    }

    const filePath = this.resolvePath(artifact);
    const message = this.buildCommitMessage(artifact);

    try {
      let sha = null;
      try {
        const existing = await this.prClient.getFile(owner, repo, filePath, branch);
        if (!existing.isDirectory && existing.sha) {
          sha = existing.sha;
        }
      } catch (e) {
        // File doesn't exist, will create new
      }

      const writeResult = await this.prClient.createOrUpdateFile(
        owner,
        repo,
        filePath,
        content,
        message,
        branch,
        sha
      );

      result.success = true;
      result.sha = writeResult.sha;
      result.commit_sha = writeResult.commit_sha;
      result.operation = writeResult.operation;
    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  validateArtifact(artifact) {
    if (!artifact.path) {
      return { valid: false, error: 'Artifact missing path' };
    }

    if (!artifact.artifact_type) {
      return { valid: false, error: 'Artifact missing artifact_type' };
    }

    const pathValidation = this.validatePath(artifact.path);
    if (!pathValidation.valid) {
      return { valid: false, error: pathValidation.reason };
    }

    const maxSize = this.validationConfig.max_file_size_bytes || 10 * 1024 * 1024;
    const content = this.extractContent(artifact);
    if (content && content.length > maxSize) {
      return { valid: false, error: `Artifact exceeds max size (${maxSize} bytes)` };
    }

    return { valid: true };
  }

  validatePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return { valid: false, reason: 'Path is required' };
    }

    const blocklist = this.validationConfig.path_blocklist || [];
    const parts = filePath.split('/');

    for (const blocked of blocklist) {
      if (parts.includes(blocked)) {
        return { valid: false, reason: `Path contains blocked entry: ${blocked}` };
      }
    }

    if (filePath.includes('..')) {
      return { valid: false, reason: 'Path traversal not allowed' };
    }

    return { valid: true };
  }

  extractContent(artifact) {
    if (artifact.metadata?.content) {
      return artifact.metadata.content;
    }
    
    if (artifact.content) {
      return artifact.content;
    }
    
    return null;
  }

  resolvePath(artifact) {
    const basePath = this.outputConfig.artifact_path || '';
    const artifactPath = artifact.path;
    
    if (basePath) {
      return path.join(basePath, artifactPath).replace(/\\/g, '/');
    }
    
    return artifactPath;
  }

  buildCommitMessage(artifact) {
    const prefix = this.getTypePrefix(artifact.artifact_type);
    const title = artifact.title || artifact.path;
    
    return `${prefix} ${title}\n\nArtifact ID: ${artifact.artifact_id}\nCreated by: ${artifact.created_by_role}\n\nCo-authored-by: Expert Pack <expert-pack@opencode>`;
  }

  getTypePrefix(artifactType) {
    const prefixes = {
      'design_note': '[Design]',
      'implementation_summary': '[Implement]',
      'test_report': '[Test]',
      'review_report': '[Review]',
      'security_report': '[Security]',
      'docs_sync_report': '[Docs]',
      'changelog_entry': '[Changelog]'
    };
    
    return prefixes[artifactType] || '[Artifact]';
  }

  getStats(artifacts) {
    return {
      total: artifacts.length,
      by_type: this.groupByType(artifacts),
      with_content: artifacts.filter(a => this.extractContent(a)).length
    };
  }

  groupByType(artifacts) {
    const groups = {};
    
    for (const artifact of artifacts) {
      const type = artifact.artifact_type;
      groups[type] = (groups[type] || 0) + 1;
    }
    
    return groups;
  }
}

module.exports = { ArtifactWriter };