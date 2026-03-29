class CommentTemplates {
  escalation(escalation) {
    const lines = [
      '## 🚨 PR Escalation',
      '',
      `**Escalation ID**: \`${escalation.escalation_id}\``,
      `**Reason**: ${this.formatReasonType(escalation.reason_type)}`,
      `**Level**: ${escalation.level} decision required`,
      ''
    ];

    lines.push('### 🚫 Blocking Points');
    if (escalation.blocking_points && escalation.blocking_points.length > 0) {
      for (const point of escalation.blocking_points) {
        lines.push(`- ${point}`);
      }
    } else {
      lines.push('No specific blocking points identified.');
    }

    lines.push('');
    lines.push('### 🔧 Attempted Actions');
    if (escalation.attempted_actions && escalation.attempted_actions.length > 0) {
      for (const action of escalation.attempted_actions) {
        lines.push(`- ${action}`);
      }
    } else {
      lines.push('No actions attempted yet.');
    }

    lines.push('');
    lines.push('### 📋 Recommended Next Steps');
    if (escalation.recommended_next_steps && escalation.recommended_next_steps.length > 0) {
      for (const step of escalation.recommended_next_steps) {
        lines.push(`- ${step}`);
      }
    } else {
      lines.push('No specific recommendations available.');
    }

    if (escalation.options && escalation.options.length > 0) {
      lines.push('');
      lines.push('### ⚖️ Options');
      for (const option of escalation.options) {
        lines.push('');
        lines.push(`**Option ${option.option_id}**: ${option.description}`);
        if (option.pros && option.pros.length > 0) {
          lines.push('- Pros:');
          for (const pro of option.pros) {
            lines.push(`  - ✅ ${pro}`);
          }
        }
        if (option.cons && option.cons.length > 0) {
          lines.push('- Cons:');
          for (const con of option.cons) {
            lines.push(`  - ❌ ${con}`);
          }
        }
      }
    }

    lines.push('');
    lines.push('---');
    lines.push('**Requires your decision to proceed.** Please respond with your choice.');

    return lines.join('\n');
  }

  retry(context) {
    const lines = [
      '## 🔄 Output Retry Request',
      '',
      `**Attempt**: ${context.retry_count}/${context.max_retry}`,
      `**Previous Failure**: ${context.previous_failure_reason}`,
      '',
      '### Options',
      '',
      `- ✅ Add \`${context.retry_label_approved || 'retry-approved'}\` label to retry`,
      `- ❌ Add \`${context.retry_label_aborted || 'retry-aborted'}\` label to cancel`,
      '',
      '---',
      '*Please add a label to indicate your decision.*'
    ];

    if (context.required_fixes && context.required_fixes.length > 0) {
      lines.splice(6, 0, '', '### Required Fixes', '');
      for (const fix of context.required_fixes) {
        lines.splice(7, 0, `- ${fix}`);
      }
    }

    return lines.join('\n');
  }

  result(context) {
    const statusIcons = {
      'SUCCESS': '✅',
      'SUCCESS_WITH_WARNINGS': '⚠️',
      'PARTIAL': '🔄',
      'BLOCKED': '🚫',
      'FAILED_RETRYABLE': '❌',
      'FAILED_ESCALATE': '🚨'
    };

    const lines = [
      '## Expert Pack Execution Result',
      '',
      `${statusIcons[context.status] || '📋'} **Status**: ${context.status}`,
      `**Role**: ${context.role}`,
      `**Command**: ${context.command}`,
      ''
    ];

    if (context.summary) {
      lines.push('### Summary');
      lines.push(context.summary);
      lines.push('');
    }

    if (context.artifacts && context.artifacts.length > 0) {
      lines.push('### Artifacts');
      for (const artifact of context.artifacts) {
        lines.push(`- \`${artifact.path}\` - ${artifact.title}`);
      }
      lines.push('');
    }

    if (context.recommendation) {
      const recActions = {
        'CONTINUE': '✅ Ready to proceed',
        'SEND_TO_TEST': '🧪 Requires testing',
        'SEND_TO_REVIEW': '👀 Requires review',
        'REWORK': '🔄 Needs rework',
        'REPLAN': '📋 Replanning needed',
        'ESCALATE': '🚨 Requires escalation'
      };
      lines.push(`**Recommendation**: ${recActions[context.recommendation] || context.recommendation}`);
    }

    lines.push('');
    lines.push('---');
    lines.push('*Automated output from OpenCode Expert Pack*');

    return lines.join('\n');
  }

  formatReasonType(reasonType) {
    const reasons = {
      'MISSING_CONTEXT': 'Missing required context',
      'CONFLICTING_CONSTRAINTS': 'Conflicting constraints',
      'HIGH_RISK_CHANGE': 'High-risk change detected',
      'REPEATED_FAILURE': 'Repeated execution failure',
      'OUT_OF_SCOPE_REQUEST': 'Request out of scope',
      'TOOLING_BLOCKER': 'Tooling or infrastructure blocker',
      'AMBIGUOUS_GOAL': 'Ambiguous goal definition',
      'UNRESOLVED_TRADEOFF': 'Unresolved trade-off decision'
    };

    return reasons[reasonType] || reasonType;
  }

  success(context) {
    return [
      '## ✅ Execution Successful',
      '',
      context.summary || 'All operations completed successfully.',
      '',
      '---',
      '*Automated output from OpenCode Expert Pack*'
    ].join('\n');
  }

  failure(context) {
    return [
      '## ❌ Execution Failed',
      '',
      `**Reason**: ${context.reason}`,
      '',
      context.summary || 'See error details above.',
      '',
      '---',
      '*Automated output from OpenCode Expert Pack*'
    ].join('\n');
  }
}

module.exports = { CommentTemplates };