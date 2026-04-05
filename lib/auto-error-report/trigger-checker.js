const SEVERITY_LEVELS = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3
};

const EXPERT_PACK_ROLES = [
  'architect',
  'developer',
  'tester',
  'reviewer',
  'docs',
  'security'
];

function shouldAutoReport(errorReport, config) {
  if (!config.enabled) {
    return {
      should_trigger: false,
      reason: 'disabled'
    };
  }
  
  const severity = errorReport?.error_classification?.severity || 'low';
  const threshold = config.report_conditions?.severity_threshold || 'medium';
  
  if (SEVERITY_LEVELS[severity] < SEVERITY_LEVELS[threshold]) {
    return {
      should_trigger: false,
      reason: 'severity_below_threshold'
    };
  }
  
  const errorType = errorReport?.error_classification?.error_type;
  const excludeTypes = config.report_conditions?.exclude_types || [];
  
  if (errorType && excludeTypes.includes(errorType)) {
    return {
      should_trigger: false,
      reason: 'type_excluded'
    };
  }
  
  if (config.report_conditions?.only_expert_pack_errors) {
    const role = errorReport?.error_context?.role;
    if (role && !EXPERT_PACK_ROLES.includes(role)) {
      return {
        should_trigger: false,
        reason: 'not_expert_pack_error'
      };
    }
  }
  
  return {
    should_trigger: true
  };
}

function getSeverityLevel(severity) {
  return SEVERITY_LEVELS[severity] ?? SEVERITY_LEVELS.low;
}

function isExpertPackRole(role) {
  return EXPERT_PACK_ROLES.includes(role);
}

module.exports = {
  shouldAutoReport,
  getSeverityLevel,
  isExpertPackRole,
  SEVERITY_LEVELS,
  EXPERT_PACK_ROLES
};