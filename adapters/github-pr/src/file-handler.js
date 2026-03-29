const path = require('path');

const ChangeType = {
  ADDED: 'added',
  MODIFIED: 'modified',
  DELETED: 'deleted',
  RENAMED: 'renamed'
};

class FileHandler {
  constructor(config) {
    this.config = config || {};
    this.validationConfig = config?.github_pr_config?.validation || {};
    this.blocklist = this.validationConfig.path_blocklist || [
      '.git', '.env', '.env.local', 'node_modules'
    ];
  }

  processChangedFiles(changedFiles) {
    if (!changedFiles || !Array.isArray(changedFiles)) {
      return {
        success: false,
        files: [],
        errors: ['changed_files must be an array'],
        warnings: []
      };
    }

    const results = {
      success: true,
      files: [],
      errors: [],
      warnings: []
    };

    for (const file of changedFiles) {
      const processed = this.processFile(file);
      results.files.push(processed);
      
      if (processed.error) {
        results.errors.push(processed.error);
        results.success = false;
      }
      if (processed.warning) {
        results.warnings.push(processed.warning);
      }
    }

    return results;
  }

  processFile(file) {
    const result = {
      path: file.path,
      change_type: file.change_type,
      valid: true,
      operations: [],
      error: null,
      warning: null
    };

    const pathValidation = this.validatePath(file.path);
    if (!pathValidation.valid) {
      result.valid = false;
      result.error = `Invalid path '${file.path}': ${pathValidation.reason}`;
      return result;
    }

    switch (file.change_type) {
      case ChangeType.ADDED:
        result.operations.push({ type: 'create', path: file.path });
        break;
      case ChangeType.MODIFIED:
        result.operations.push({ type: 'update', path: file.path });
        break;
      case ChangeType.DELETED:
        result.operations.push({ type: 'delete', path: file.path });
        break;
      case ChangeType.RENAMED:
        if (!file.old_path) {
          result.valid = false;
          result.error = `Renamed file '${file.path}' missing old_path`;
          return result;
        }
        result.operations.push({ type: 'delete', path: file.old_path });
        result.operations.push({ type: 'create', path: file.path });
        break;
      default:
        result.valid = false;
        result.error = `Unknown change_type: ${file.change_type}`;
    }

    return result;
  }

  validatePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return { valid: false, reason: 'Path is required and must be a string' };
    }

    const normalized = path.normalize(filePath);
    const parts = normalized.split(path.sep);

    for (const blocked of this.blocklist) {
      if (parts.includes(blocked)) {
        return { valid: false, reason: `Path contains blocked directory: ${blocked}` };
      }
    }

    if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
      return { valid: false, reason: 'Path must be relative and within repository' };
    }

    if (filePath.includes('..')) {
      return { valid: false, reason: 'Path traversal not allowed' };
    }

    return { valid: true };
  }

  groupByChangeType(changedFiles) {
    const groups = {
      [ChangeType.ADDED]: [],
      [ChangeType.MODIFIED]: [],
      [ChangeType.DELETED]: [],
      [ChangeType.RENAMED]: []
    };

    for (const file of changedFiles) {
      const type = file.change_type;
      if (groups[type]) {
        groups[type].push(file);
      }
    }

    return groups;
  }

  buildCommitMessage(files, artifactType = 'default') {
    const typePrefix = this.getTypePrefix(artifactType);
    const summary = this.buildDiffSummary(files);
    
    return `${typePrefix}: ${summary}\n\n${this.buildFileList(files)}\n\nCo-authored-by: Expert Pack <expert-pack@opencode>`;
  }

  getTypePrefix(artifactType) {
    const prefixes = {
      'design_note': '[Design]',
      'implementation_summary': '[Implement]',
      'test_report': '[Test]',
      'review_report': '[Review]',
      'bugfix-report': '[Fix]'
    };
    return prefixes[artifactType] || '[Expert Pack]';
  }

  buildDiffSummary(files) {
    const counts = {
      added: 0,
      modified: 0,
      deleted: 0,
      renamed: 0
    };

    for (const file of files) {
      counts[file.change_type] = (counts[file.change_type] || 0) + 1;
    }

    const parts = [];
    if (counts.added > 0) parts.push(`${counts.added} added`);
    if (counts.modified > 0) parts.push(`${counts.modified} modified`);
    if (counts.deleted > 0) parts.push(`${counts.deleted} deleted`);
    if (counts.renamed > 0) parts.push(`${counts.renamed} renamed`);

    return parts.length > 0 ? parts.join(', ') : 'No changes';
  }

  buildFileList(files) {
    return files.map(f => `- ${f.change_type}: ${f.path}`).join('\n');
  }

  getStats(changedFiles) {
    const stats = {
      total: changedFiles.length,
      by_type: {},
      validation_errors: 0,
      validation_warnings: 0
    };

    for (const file of changedFiles) {
      stats.by_type[file.change_type] = (stats.by_type[file.change_type] || 0) + 1;
    }

    return stats;
  }
}

module.exports = { FileHandler, ChangeType };