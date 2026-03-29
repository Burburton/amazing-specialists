const ReviewEvent = {
  APPROVE: 'APPROVE',
  REQUEST_CHANGES: 'REQUEST_CHANGES',
  COMMENT: 'COMMENT',
  PENDING: 'PENDING'
};

class ReviewManager {
  constructor(prClient, config) {
    this.prClient = prClient;
    this.config = config || {};
    this.reviewConfig = config?.github_pr_config?.review_config || {};
    this.labelConfig = config?.github_pr_config?.labels || {};
    
    this.statusMapping = this.reviewConfig.status_mapping || {
      'SUCCESS': ReviewEvent.APPROVE,
      'SUCCESS_WITH_WARNINGS': ReviewEvent.APPROVE,
      'PARTIAL': ReviewEvent.REQUEST_CHANGES,
      'BLOCKED': ReviewEvent.COMMENT,
      'FAILED_RETRYABLE': ReviewEvent.REQUEST_CHANGES,
      'FAILED_ESCALATE': ReviewEvent.COMMENT
    };
  }

  async setReviewStatus(owner, repo, prNumber, executionStatus, body) {
    const event = this.mapStatusToReviewEvent(executionStatus);
    const reviewBody = body || this.getDefaultReviewBody(executionStatus);

    const result = await this.prClient.createReview(owner, repo, prNumber, event, reviewBody);

    return {
      success: true,
      event,
      review_id: result.review_id,
      state: result.state
    };
  }

  mapStatusToReviewEvent(status) {
    return this.statusMapping[status] || ReviewEvent.COMMENT;
  }

  getDefaultReviewBody(status) {
    const messages = {
      'SUCCESS': '## ✅ Execution Successful\n\nAll checks passed. Ready to merge.',
      'SUCCESS_WITH_WARNINGS': '## ⚠️ Execution Completed with Warnings\n\nPlease review the warnings before merging.',
      'PARTIAL': '## 🔄 Partial Completion\n\nSome tasks completed successfully. Changes requested for remaining items.',
      'BLOCKED': '## 🚫 Execution Blocked\n\nUnable to proceed due to external blockers. See details above.',
      'FAILED_RETRYABLE': '## ❌ Execution Failed\n\nIssues found that can be fixed. Please address the feedback.',
      'FAILED_ESCALATE': '## 🚨 Escalation Required\n\nCritical issues found. Please review and respond to the escalation.'
    };

    return messages[status] || '## Execution Status Update\n\nSee details above.';
  }

  async postComment(owner, repo, prNumber, body, path, line) {
    const result = await this.prClient.createReviewComment(
      owner,
      repo,
      prNumber,
      body,
      path,
      line
    );

    return {
      success: true,
      comment_id: result.comment_id
    };
  }

  async addStatusLabel(owner, repo, prNumber, status) {
    const label = this.getStatusLabel(status);
    
    if (!label) {
      return { success: true, label: null };
    }

    await this.prClient.addLabels(owner, repo, prNumber, [label]);

    return { success: true, label };
  }

  getStatusLabel(status) {
    const labels = {
      'SUCCESS': this.labelConfig.success,
      'SUCCESS_WITH_WARNINGS': this.labelConfig.warning,
      'PARTIAL': this.labelConfig.partial,
      'BLOCKED': this.labelConfig.failed,
      'FAILED_RETRYABLE': this.labelConfig.failed,
      'FAILED_ESCALATE': this.labelConfig.escalation
    };

    return labels[status];
  }

  buildReviewBody(executionResult) {
    const sections = [];

    sections.push(this.buildStatusSection(executionResult.status));
    sections.push(this.buildSummarySection(executionResult.summary));

    if (executionResult.issues_found?.length > 0) {
      sections.push(this.buildIssuesSection(executionResult.issues_found));
    }

    if (executionResult.risks?.length > 0) {
      sections.push(this.buildRisksSection(executionResult.risks));
    }

    sections.push(this.buildRecommendationSection(executionResult.recommendation));

    return sections.join('\n\n');
  }

  buildStatusSection(status) {
    const icons = {
      'SUCCESS': '✅',
      'SUCCESS_WITH_WARNINGS': '⚠️',
      'PARTIAL': '🔄',
      'BLOCKED': '🚫',
      'FAILED_RETRYABLE': '❌',
      'FAILED_ESCALATE': '🚨'
    };

    return `## ${icons[status] || '📋'} Execution Status: ${status}`;
  }

  buildSummarySection(summary) {
    return `### Summary\n\n${summary}`;
  }

  buildIssuesSection(issues) {
    const lines = ['### Issues Found', ''];

    for (const issue of issues) {
      const severity = this.formatSeverity(issue.severity);
      lines.push(`- **${severity}**: ${issue.description}`);
      if (issue.recommendation) {
        lines.push(`  - 💡 ${issue.recommendation}`);
      }
    }

    return lines.join('\n');
  }

  buildRisksSection(risks) {
    const lines = ['### Risks', ''];

    for (const risk of risks) {
      lines.push(`- **${risk.level}**: ${risk.description}`);
      if (risk.mitigation) {
        lines.push(`  - 🛡️ ${risk.mitigation}`);
      }
    }

    return lines.join('\n');
  }

  buildRecommendationSection(recommendation) {
    const actions = {
      'CONTINUE': '✅ Ready to proceed',
      'SEND_TO_TEST': '🧪 Requires testing',
      'SEND_TO_REVIEW': '👀 Requires review',
      'REWORK': '🔄 Needs rework',
      'REPLAN': '📋 Replanning needed',
      'ESCALATE': '🚨 Requires escalation'
    };

    return `### Recommendation\n\n${actions[recommendation] || recommendation}`;
  }

  formatSeverity(severity) {
    const icons = {
      'critical': '🔴 Critical',
      'high': '🟠 High',
      'medium': '🟡 Medium',
      'low': '🟢 Low'
    };

    return icons[severity] || severity;
  }
}

module.exports = { ReviewManager, ReviewEvent };