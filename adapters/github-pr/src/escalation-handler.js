class EscalationHandler {
  constructor(prClient, reviewManager, config) {
    this.prClient = prClient;
    this.reviewManager = reviewManager;
    this.config = config || {};
    this.labelConfig = config?.github_pr_config?.labels || {};
    this.commentTemplates = null;
  }

  setCommentTemplates(templates) {
    this.commentTemplates = templates;
  }

  async handleEscalation(escalation, owner, repo, prNumber) {
    const result = {
      success: false,
      comment_id: null,
      review_id: null,
      error: null
    };

    try {
      const commentBody = this.buildEscalationComment(escalation);

      const reviewResult = await this.prClient.createReview(
        owner,
        repo,
        prNumber,
        'COMMENT',
        commentBody
      );

      result.review_id = reviewResult.review_id;

      const escalationLabel = this.labelConfig.escalation || 'escalation:needs-decision';
      await this.prClient.addLabels(owner, repo, prNumber, [escalationLabel]);

      result.success = true;
    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  buildEscalationComment(escalation) {
    if (this.commentTemplates) {
      return this.commentTemplates.escalation(escalation);
    }

    return this.buildDefaultEscalationComment(escalation);
  }

  buildDefaultEscalationComment(escalation) {
    const lines = [
      '## 🚨 PR Escalation',
      '',
      `**Escalation ID**: \`${escalation.escalation_id}\``,
      `**Reason**: ${this.formatReasonType(escalation.reason_type)}`,
      `**Level**: ${escalation.level}`,
      ''
    ];

    lines.push('### 🚫 Blocking Points');
    for (const point of escalation.blocking_points || []) {
      lines.push(`- ${point}`);
    }

    lines.push('');
    lines.push('### 📋 Recommended Next Steps');
    for (const step of escalation.recommended_next_steps || []) {
      lines.push(`- ${step}`);
    }

    if (escalation.requires_user_decision) {
      lines.push('');
      lines.push('---');
      lines.push('**Requires your decision to proceed.**');
    }

    return lines.join('\n');
  }

  formatReasonType(reasonType) {
    const reasons = {
      'MISSING_CONTEXT': 'Missing required context',
      'CONFLICTING_CONSTRAINTS': 'Conflicting constraints',
      'HIGH_RISK_CHANGE': 'High-risk change detected',
      'REPEATED_FAILURE': 'Repeated execution failure',
      'OUT_OF_SCOPE_REQUEST': 'Request out of scope',
      'TOOLING_BLOCKER': 'Tooling blocker',
      'AMBIGUOUS_GOAL': 'Ambiguous goal',
      'UNRESOLVED_TRADEOFF': 'Unresolved trade-off'
    };

    return reasons[reasonType] || reasonType;
  }

  validateEscalation(escalation) {
    const errors = [];

    if (!escalation.escalation_id) {
      errors.push('Missing escalation_id');
    }

    if (!escalation.reason_type) {
      errors.push('Missing reason_type');
    }

    if (!escalation.blocking_points || escalation.blocking_points.length === 0) {
      errors.push('Missing blocking_points');
    }

    if (!escalation.recommended_next_steps || escalation.recommended_next_steps.length === 0) {
      errors.push('Missing recommended_next_steps');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getPositionInfo(escalation) {
    if (escalation.file_path) {
      return {
        path: escalation.file_path,
        line: escalation.line_number || null,
        type: escalation.line_number ? 'line' : 'file'
      };
    }

    return { type: 'general' };
  }
}

module.exports = { EscalationHandler };