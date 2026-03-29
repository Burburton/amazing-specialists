class CommitBuilder {
  constructor(config) {
    this.config = config || {};
    this.prConfig = config?.github_pr_config?.pr_config || {};
    this.titleFormats = this.prConfig.title_format || {};
  }

  buildCommit(changedFiles, artifact, dispatchInfo) {
    return {
      message: this.buildCommitMessage(changedFiles, artifact),
      files: this.prepareFiles(changedFiles),
      metadata: {
        dispatch_id: dispatchInfo?.dispatch_id,
        task_id: dispatchInfo?.task_id,
        artifact_type: artifact?.artifact_type,
        created_at: new Date().toISOString()
      }
    };
  }

  buildCommitMessage(files, artifact) {
    const prefix = this.getTypePrefix(artifact?.artifact_type);
    const summary = this.buildDiffSummary(files);
    const fileList = this.buildFileList(files);

    return `${prefix} ${summary}\n\n${fileList}\n\nCo-authored-by: Expert Pack <expert-pack@opencode>`;
  }

  getTypePrefix(artifactType) {
    if (this.titleFormats[artifactType]) {
      return this.titleFormats[artifactType].replace(' {title}', '');
    }

    const defaults = {
      'design_note': '[Design]',
      'implementation_summary': '[Implement]',
      'test_report': '[Test]',
      'review_report': '[Review]',
      'security_report': '[Security]',
      'docs_sync_report': '[Docs]',
      'changelog_entry': '[Changelog]'
    };

    return defaults[artifactType] || '[Expert Pack]';
  }

  buildDiffSummary(files) {
    if (!files || files.length === 0) {
      return 'No changes';
    }

    const counts = this.countByChangeType(files);
    const parts = [];

    if (counts.added > 0) parts.push(`${counts.added} added`);
    if (counts.modified > 0) parts.push(`${counts.modified} modified`);
    if (counts.deleted > 0) parts.push(`${counts.deleted} deleted`);
    if (counts.renamed > 0) parts.push(`${counts.renamed} renamed`);

    return parts.length > 0 ? parts.join(', ') : 'No changes';
  }

  buildFileList(files) {
    if (!files || files.length === 0) {
      return 'No files changed';
    }

    const lines = files.map(f => {
      const icon = this.getChangeIcon(f.change_type);
      return `- ${icon} ${f.change_type}: ${f.path}`;
    });

    return lines.join('\n');
  }

  getChangeIcon(changeType) {
    const icons = {
      'added': '➕',
      'modified': '📝',
      'deleted': '➖',
      'renamed': '🔄'
    };

    return icons[changeType] || '📄';
  }

  prepareFiles(files) {
    return files.map(file => ({
      path: file.path,
      change_type: file.change_type,
      content: file.content || null,
      old_path: file.old_path || null
    }));
  }

  countByChangeType(files) {
    const counts = {
      added: 0,
      modified: 0,
      deleted: 0,
      renamed: 0
    };

    for (const file of files) {
      const type = file.change_type;
      if (counts.hasOwnProperty(type)) {
        counts[type]++;
      }
    }

    return counts;
  }

  buildPRTitle(artifact, executionResult) {
    const format = this.titleFormats[artifact?.artifact_type] || this.titleFormats.default || '[Expert Pack] {title}';
    const title = artifact?.title || executionResult?.task_id || 'Output';

    return format.replace('{title}', title);
  }

  buildPRBody(executionResult, artifacts) {
    const sections = [];

    sections.push('## Expert Pack Execution Output\n');
    sections.push(`**Dispatch ID**: ${executionResult.dispatch_id}`);
    sections.push(`**Task**: ${executionResult.task_id}`);
    sections.push(`**Role**: ${executionResult.role}`);
    sections.push(`**Status**: ${executionResult.status}\n`);

    if (executionResult.summary) {
      sections.push('### Summary\n');
      sections.push(executionResult.summary);
    }

    if (artifacts && artifacts.length > 0) {
      sections.push('\n### Artifacts\n');
      for (const artifact of artifacts) {
        sections.push(`- \`${artifact.path}\` - ${artifact.title}`);
      }
    }

    if (executionResult.changed_files && executionResult.changed_files.length > 0) {
      sections.push('\n### Changed Files\n');
      sections.push(this.buildFileList(executionResult.changed_files));
    }

    sections.push('\n---\n*Automated output from OpenCode Expert Pack*');

    return sections.join('\n');
  }

  getStats(files) {
    const counts = this.countByChangeType(files);

    return {
      total: files.length,
      ...counts
    };
  }
}

module.exports = { CommitBuilder };