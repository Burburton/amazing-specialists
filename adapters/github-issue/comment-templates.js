/**
 * Comment Templates for GitHub Issue Adapter
 * 
 * Generates formatted comments for Escalation, Retry, and Result.
 */

const ESCALATION_TEMPLATE = `## 🔔 Escalation Request

**Escalation ID**: {escalation_id}
**Reason**: {reason_type}
**Level**: {level}

### 🚫 Blocking Points
{blocking_points}

### 🔧 Attempted Actions
{attempted_actions}

### 📋 Recommended Next Steps
{recommended_next_steps}

### ⚖️ Options
{options}

**Requires User Decision**: {requires_user_decision}

---
Please respond with your decision to proceed.`;

const RETRY_TEMPLATE = `## 🔄 Retry Attempt #{retry_count}

**Previous Failure Reason**: {previous_failure_reason}
**Required Fixes**: {required_fixes}

Attempting retry with adjusted parameters...

---
*Max retries: {max_retry}. Current: {retry_count}*`;

const RESULT_TEMPLATE = `## ✅ Execution Complete

**Status**: {status}
**Role**: {role}
**Command**: {command}

### Summary
{summary}

### Artifacts
{artifacts}

### Next Steps
{recommendation}`;

const ACKNOWLEDGMENT_TEMPLATE = `## 📋 Task Acknowledged

**Dispatch ID**: {dispatch_id}
**Role**: {role}
**Command**: {command}

Processing your request...

---
*Powered by OpenCode Expert Pack*`;

const ERROR_TEMPLATE = `## ❌ Execution Failed

**Status**: {status}
**Error**: {error_message}

### Details
{error_details}

Please check the issue and try again.`;

class CommentTemplates {
  constructor() {
    this.templates = {
      escalation: ESCALATION_TEMPLATE,
      retry: RETRY_TEMPLATE,
      result: RESULT_TEMPLATE,
      acknowledgment: ACKNOWLEDGMENT_TEMPLATE,
      error: ERROR_TEMPLATE
    };
  }

  /**
   * Render a template with variables
   * @param {string} templateName - Name of template
   * @param {object} variables - Variables to substitute
   * @returns {string} Rendered comment
   */
  render(templateName, variables) {
    let template = this.templates[templateName];
    if (!template) {
      throw new Error(`Unknown template: ${templateName}`);
    }
    
    return this.substitute(template, variables);
  }

  /**
   * Substitute variables in template
   * @param {string} template - Template string
   * @param {object} variables - Variables to substitute
   * @returns {string} Substituted string
   */
  substitute(template, variables) {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      let replacement;
      
      if (Array.isArray(value)) {
        replacement = value.map(item => `- ${item}`).join('\n');
      } else if (typeof value === 'boolean') {
        replacement = value ? 'Yes' : 'No';
      } else if (value === null || value === undefined) {
        replacement = 'N/A';
      } else {
        replacement = String(value);
      }
      
      result = result.split(placeholder).join(replacement);
    }
    
    return result;
  }

  /**
   * Generate escalation comment
   */
  escalation(options) {
    return this.render('escalation', {
      escalation_id: options.escalation_id,
      reason_type: options.reason_type,
      level: options.level,
      blocking_points: options.blocking_points || [],
      attempted_actions: options.attempted_actions || [],
      recommended_next_steps: options.recommended_next_steps || [],
      options: this.formatOptions(options.options || []),
      requires_user_decision: options.requires_user_decision
    });
  }

  /**
   * Generate retry comment
   */
  retry(options) {
    return this.render('retry', {
      retry_count: options.retry_count,
      previous_failure_reason: options.previous_failure_reason,
      required_fixes: options.required_fixes || [],
      max_retry: options.max_retry
    });
  }

  /**
   * Generate result comment
   */
  result(options) {
    return this.render('result', {
      status: options.status,
      role: options.role,
      command: options.command,
      summary: options.summary,
      artifacts: this.formatArtifacts(options.artifacts || []),
      recommendation: options.recommendation
    });
  }

  /**
   * Generate acknowledgment comment
   */
  acknowledgment(options) {
    return this.render('acknowledgment', {
      dispatch_id: options.dispatch_id,
      role: options.role,
      command: options.command
    });
  }

  /**
   * Generate error comment
   */
  error(options) {
    return this.render('error', {
      status: options.status,
      error_message: options.error_message,
      error_details: options.error_details || 'No additional details available.'
    });
  }

  /**
   * Format options as numbered list
   */
  formatOptions(options) {
    if (!options || options.length === 0) {
      return 'No options available.';
    }
    
    return options.map((opt, i) => {
      if (typeof opt === 'string') {
        return `${i + 1}. ${opt}`;
      }
      return `${i + 1}. **${opt.description}**\n   - Pros: ${opt.pros?.join(', ') || 'N/A'}\n   - Cons: ${opt.cons?.join(', ') || 'N/A'}`;
    }).join('\n\n');
  }

  /**
   * Format artifacts as list
   */
  formatArtifacts(artifacts) {
    if (!artifacts || artifacts.length === 0) {
      return 'No artifacts generated.';
    }
    
    return artifacts.map(a => `- **${a.title}** (${a.artifact_type}): ${a.path}`).join('\n');
  }
}

module.exports = { CommentTemplates };