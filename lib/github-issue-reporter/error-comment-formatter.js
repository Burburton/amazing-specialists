const SEVERITY_BADGES = {
  low: '🟢 Low',
  medium: '🟡 Medium',
  high: '🔴 High',
  critical: '🟠 Critical'
};

const MAX_RETRY = 3;

function formatErrorComment(errorReport, variant = null) {
  const severity = errorReport.error_classification?.severity || 'medium';
  const selectedVariant = variant || selectCommentVariant(severity);
  
  return renderComment(errorReport, selectedVariant);
}

function selectCommentVariant(severity) {
  if (severity === 'critical' || severity === 'high') return 'detailed';
  if (severity === 'medium') return 'standard';
  return 'simplified';
}

function renderComment(errorReport, variant) {
  const templateVars = extractTemplateVariables(errorReport);
  
  switch (variant) {
    case 'detailed':
      return renderDetailedComment(templateVars);
    case 'standard':
      return renderStandardComment(templateVars);
    case 'simplified':
      return renderSimplifiedComment(templateVars);
    default:
      return renderStandardComment(templateVars);
  }
}

function extractTemplateVariables(errorReport) {
  const severity = errorReport.error_classification?.severity || 'medium';
  
  return {
    error_code: errorReport.error_details?.error_code || 'ERR-UNKNOWN',
    severity_badge: SEVERITY_BADGES[severity] || SEVERITY_BADGES.medium,
    error_type: errorReport.error_classification?.error_type || 'EXECUTION_ERROR',
    role: errorReport.error_context?.role || 'common',
    title: errorReport.error_details?.title || 'Unknown error',
    description: errorReport.error_details?.description || '',
    blocking_points_list: formatBlockingPoints(errorReport.impact_assessment?.blocking_points || []),
    source_reference: formatSourceReference(errorReport.traceability || {}),
    recommended_action: errorReport.resolution_guidance?.recommended_action || 'REWORK',
    fix_suggestions: formatFixSuggestions(errorReport.resolution_guidance?.fix_suggestions || []),
    downstream_impact: errorReport.impact_assessment?.downstream_impact || 'unknown',
    milestone_impact: errorReport.impact_assessment?.milestone_impact || 'unknown',
    auto_recoverable: errorReport.resolution_guidance?.auto_recoverable ? 'Yes' : 'No',
    retry_count: errorReport.metadata?.retry_count || 0,
    max_retry: MAX_RETRY,
    error_report_id: errorReport.artifact_id || 'unknown',
    created_at: errorReport.metadata?.created_at || new Date().toISOString()
  };
}

function formatBlockingPoints(blockingPoints) {
  if (!blockingPoints || blockingPoints.length === 0) {
    return 'No blocking points identified';
  }
  return blockingPoints.map(point => `- ${point}`).join('\n');
}

function formatSourceReference(traceability) {
  if (traceability.source_file) {
    if (traceability.source_line) {
      return `File: ${traceability.source_file}:${traceability.source_line}`;
    }
    return `File: ${traceability.source_file}`;
  }
  if (traceability.source_artifact) {
    return `Artifact: ${traceability.source_artifact}`;
  }
  return 'Source reference not available';
}

function formatFixSuggestions(fixSuggestions) {
  if (!fixSuggestions || fixSuggestions.length === 0) {
    return 'No specific fix suggestions available';
  }
  return `Fix suggestions:\n${fixSuggestions.map(suggestion => `- ${suggestion}`).join('\n')}`;
}

function renderDetailedComment(vars) {
  return `## 🚨 Error Report: ${vars.error_code}

**Severity**: ${vars.severity_badge}
**Error Type**: ${vars.error_type}
**Role**: ${vars.role}

### 📋 Error Summary
${vars.title}

${vars.description}

### 🚫 Blocking Points
${vars.blocking_points_list}

### 📍 Source
${vars.source_reference}

### 🔧 Recommended Action
**Action**: ${vars.recommended_action}

${vars.fix_suggestions}

### ⏱️ Impact Assessment
- **Downstream Impact**: ${vars.downstream_impact}
- **Milestone Impact**: ${vars.milestone_impact}

### 📊 Recovery
- **Auto-Recoverable**: ${vars.auto_recoverable}
- **Retry Count**: ${vars.retry_count}/${vars.max_retry}

---
*Error ID: ${vars.error_report_id}*
*Reported by: ${vars.role} role at ${vars.created_at}*`;
}

function renderStandardComment(vars) {
  return `## 🚨 Error Report: ${vars.error_code}

**Severity**: ${vars.severity_badge}
**Error Type**: ${vars.error_type}
**Role**: ${vars.role}

### 📋 Error Summary
${vars.title}

${vars.description}

### 📍 Source
${vars.source_reference}

### 🔧 Recommended Action
**Action**: ${vars.recommended_action}

${vars.fix_suggestions}

### 📊 Recovery
- **Auto-Recoverable**: ${vars.auto_recoverable}
- **Retry Count**: ${vars.retry_count}/${vars.max_retry}

---
*Error ID: ${vars.error_report_id}*
*Reported by: ${vars.role} role at ${vars.created_at}*`;
}

function renderSimplifiedComment(vars) {
  return `## 🟢 Informational Note

**Error Code**: ${vars.error_code}
**Type**: ${vars.error_type}

${vars.title}

### 📍 Source
${vars.source_reference}

---
*Error ID: ${vars.error_report_id}*
*Reported at: ${vars.created_at}*`;
}

module.exports = {
  formatErrorComment,
  selectCommentVariant,
  SEVERITY_BADGES,
  MAX_RETRY
};