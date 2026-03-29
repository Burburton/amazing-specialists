class PathValidator {
  constructor(config) {
    this.config = config || {};
    this.validationConfig = config?.github_pr_config?.validation || {};
    this.blocklist = this.validationConfig.path_blocklist || [
      '.git',
      '.env',
      '.env.local',
      '.env.production',
      'node_modules',
      '.npmrc',
      '.netrc',
      'id_rsa',
      'id_ed25519',
      'credentials.json',
      'secrets.json'
    ];
    this.maxFileSize = this.validationConfig.max_file_size_bytes || 10 * 1024 * 1024;
  }

  validatePath(path) {
    const result = {
      path,
      valid: true,
      errors: [],
      warnings: []
    };

    if (!path || typeof path !== 'string') {
      result.valid = false;
      result.errors.push('Path is required and must be a string');
      return result;
    }

    if (path.length > 4096) {
      result.valid = false;
      result.errors.push('Path exceeds maximum length (4096 characters)');
    }

    if (path.includes('..')) {
      result.valid = false;
      result.errors.push('Path traversal not allowed (..)');
    }

    if (path.startsWith('/') || /^[A-Za-z]:/.test(path)) {
      result.valid = false;
      result.errors.push('Absolute paths not allowed');
    }

    const parts = path.split(/[/\\]/);
    for (const part of parts) {
      if (this.blocklist.includes(part)) {
        result.valid = false;
        result.errors.push(`Blocked path component: ${part}`);
      }
    }

    if (path.startsWith('.') && path !== '.') {
      result.warnings.push('Hidden files may not be visible in some systems');
    }

    if (/\s/.test(path)) {
      result.warnings.push('Path contains spaces which may cause issues');
    }

    return result;
  }

  validatePaths(paths) {
    return paths.map(path => this.validatePath(path));
  }

  validateContent(path, content) {
    const result = {
      path,
      valid: true,
      errors: [],
      warnings: []
    };

    const pathResult = this.validatePath(path);
    if (!pathResult.valid) {
      return pathResult;
    }

    if (content === undefined || content === null) {
      result.valid = false;
      result.errors.push('Content is required');
      return result;
    }

    const size = Buffer.byteLength(content, 'utf8');
    if (size > this.maxFileSize) {
      result.valid = false;
      result.errors.push(`Content exceeds max size (${this.maxFileSize} bytes, got ${size})`);
    }

    return result;
  }

  isBlocked(path) {
    const parts = path.split(/[/\\]/);
    return parts.some(part => this.blocklist.includes(part));
  }

  getBlocklist() {
    return [...this.blocklist];
  }

  addToBlocklist(path) {
    if (!this.blocklist.includes(path)) {
      this.blocklist.push(path);
    }
  }

  removeFromBlocklist(path) {
    const index = this.blocklist.indexOf(path);
    if (index > -1) {
      this.blocklist.splice(index, 1);
    }
  }

  sanitizePath(path) {
    let sanitized = path
      .replace(/\.\./g, '')
      .replace(/^[/\\]+/, '')
      .replace(/[/\\]+/g, '/');

    const parts = sanitized.split('/');
    const filtered = parts.filter(part => !this.blocklist.includes(part));
    
    return filtered.join('/');
  }

  validateArtifactPath(artifact) {
    if (!artifact || !artifact.path) {
      return {
        valid: false,
        errors: ['Artifact missing path']
      };
    }

    const result = this.validatePath(artifact.path);

    if (artifact.metadata?.content) {
      const contentResult = this.validateContent(artifact.path, artifact.metadata.content);
      result.errors.push(...contentResult.errors);
      result.warnings.push(...contentResult.warnings);
      result.valid = result.valid && contentResult.valid;
    }

    return result;
  }

  getStats() {
    return {
      blocklist_size: this.blocklist.length,
      max_file_size: this.maxFileSize
    };
  }
}

module.exports = { PathValidator };