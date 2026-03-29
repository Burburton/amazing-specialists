/**
 * Skill Test Fixtures
 * 
 * Provides test data factories for Skill Integration Tests.
 * All fixtures support deep merge overrides for flexible test scenarios.
 * 
 * @module tests/skills/fixtures/skill-fixtures
 */

/**
 * Deep merge utility for fixture overrides
 * @param {object} target - Base object
 * @param {object} source - Override object
 * @returns {object} Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else if (Array.isArray(source[key])) {
      result[key] = source[key];
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Create valid Issue Progress Report fixture (DOC-003 contract)
 * @param {object} overrides - Custom overrides
 * @returns {object} Issue progress report object
 */
function createIssueProgressReport(overrides = {}) {
  const base = {
    contract_id: 'DOC-003',
    dispatch_id: 'dispatch-001',
    created_at: '2026-03-30T10:00:00Z',
    created_by: 'docs',
    skill_used: 'issue-status-sync',
    issue_number: 123,
    repository: 'test-owner/test-repo',
    execution_status: 'SUCCESS',
    roles_completed: [
      {
        role: 'developer',
        status: 'COMPLETE',
        key_output: 'src/auth/index.js - Main authentication module'
      },
      {
        role: 'tester',
        status: 'COMPLETE',
        key_output: 'tests/auth.test.js - Unit tests with 92% coverage'
      },
      {
        role: 'reviewer',
        status: 'COMPLETE',
        key_output: 'docs/review-findings.md - Code review passed'
      }
    ],
    artifacts_produced: [
      {
        contract_id: 'DEV-001',
        file_path: 'docs/impl-summary.md',
        summary: 'Implementation summary for authentication feature'
      },
      {
        contract_id: 'TEST-001',
        file_path: 'tests/reports/auth-test-report.md',
        summary: 'Test execution report with 92% coverage'
      }
    ],
    consumed_artifacts: [
      {
        artifact_type: 'acceptance-decision-record',
        contract_id: 'REV-003',
        artifact_path: 'docs/acceptance-record.md',
        fields_used: ['decision', 'reviewer_feedback', 'approved_at']
      },
      {
        artifact_type: 'verification-report',
        contract_id: 'TEST-001',
        artifact_path: 'tests/reports/verification-report.md',
        fields_used: ['status', 'test_results', 'coverage']
      }
    ],
    recommendation: 'PENDING_ACCEPTANCE',
    recommendation_reason: 'All roles completed successfully. Tests passed. Review approved. Waiting for final acceptance.',
    quality_summary: {
      tests_passed: true,
      review_status: 'APPROVED',
      security_gate: 'PASSED'
    },
    next_steps: [
      {
        action: 'User review and acceptance',
        responsible_party: 'User'
      },
      {
        action: 'Merge approved changes',
        responsible_party: 'User'
      }
    ],
    issue_state_after: 'OPEN',
    comment_url: 'https://github.com/test-owner/test-repo/issues/123#issuecomment-456789',
    warnings: []
  };
  
  return deepMerge(base, overrides);
}

/**
 * Create Issue Progress Report with PARTIAL status
 * @param {object} overrides - Custom overrides
 * @returns {object} Partial issue progress report
 */
function createPartialProgressReport(overrides = {}) {
  const base = createIssueProgressReport({
    execution_status: 'PARTIAL',
    recommendation: 'NEEDS_REWORK',
    recommendation_reason: 'Some roles partially completed. Tests failed in edge cases.',
    quality_summary: {
      tests_passed: false,
      review_status: 'WARN',
      security_gate: 'PASSED'
    },
    roles_completed: [
      {
        role: 'developer',
        status: 'COMPLETE',
        key_output: 'src/auth/index.js - Main module complete'
      },
      {
        role: 'tester',
        status: 'PARTIAL',
        key_output: 'tests/auth.test.js - 85% coverage, 2 edge cases failed'
      }
    ],
    consumed_artifacts: [
      {
        artifact_type: 'execution-result',
        contract_id: 'DEV-001',
        artifact_path: 'logs/execution.log',
        fields_used: ['status', 'error_details']
      }
    ],
    next_steps: [
      {
        action: 'Fix failed edge case tests',
        responsible_party: 'developer'
      }
    ],
    warnings: ['Edge case test "empty_token" failed', 'Edge case test "expired_token" failed']
  });
  
  return deepMerge(base, overrides);
}

/**
 * Create Issue Progress Report with BLOCKED status
 * @param {object} overrides - Custom overrides
 * @returns {object} Blocked issue progress report
 */
function createBlockedProgressReport(overrides = {}) {
  const base = createIssueProgressReport({
    execution_status: 'BLOCKED',
    recommendation: 'BLOCKED_ESCALATION',
    recommendation_reason: 'External dependency unavailable. Cannot proceed without API documentation.',
    quality_summary: {
      tests_passed: null,
      review_status: null,
      security_gate: null
    },
    roles_completed: [
      {
        role: 'developer',
        status: 'SKIPPED',
        key_output: 'Blocked - waiting for API documentation'
      }
    ],
    consumed_artifacts: [
      {
        artifact_type: 'design-note',
        contract_id: 'ARC-001',
        artifact_path: 'docs/design-note.md',
        fields_used: ['dependencies', 'external_apis']
      }
    ],
    next_steps: [
      {
        action: 'Resolve blocking dependency',
        responsible_party: 'User'
      }
    ],
    warnings: ['OAuth2 API documentation not available', 'Cannot proceed with implementation']
  });
  
  return deepMerge(base, overrides);
}

/**
 * Create invalid Issue Progress Report (for testing validation)
 * @param {object} overrides - Custom overrides that make the report invalid
 * @returns {object} Invalid issue progress report
 */
function createInvalidProgressReport(overrides = {}) {
  return deepMerge(createIssueProgressReport(), overrides);
}

/**
 * Create malformed Issue Progress Report (syntax errors)
 * @returns {object} Malformed report object
 */
function createMalformedProgressReport() {
  return {
    // Missing required fields
    contract_id: 'DOC-003',
    // Missing: dispatch_id, created_at, created_by, skill_used, issue_number, repository, etc.
    issue_state_after: 'CLOSED', // Invalid - violates BR-003
    recommendation: 'INVALID_ENUM' // Invalid enum value
  };
}

/**
 * Create report violating BR-003 (premature closure)
 * @returns {object} Report with issue_state_after = 'CLOSED'
 */
function createBR003ViolationReport() {
  return createIssueProgressReport({
    issue_state_after: 'CLOSED' // Violates BR-003: must be OPEN
  });
}

/**
 * Create report with empty consumed_artifacts (violates evidence-based rule)
 * @returns {object} Report with empty consumed_artifacts array
 */
function createEmptyConsumedArtifactsReport() {
  return createIssueProgressReport({
    consumed_artifacts: [] // Violates minItems: 1
  });
}

/**
 * Create report with empty next_steps
 * @returns {object} Report with empty next_steps array
 */
function createEmptyNextStepsReport() {
  return createIssueProgressReport({
    next_steps: [] // Violates minItems: 1
  });
}

/**
 * Create report with additional properties (violates additionalProperties: false)
 * @returns {object} Report with extra properties
 */
function createAdditionalPropertiesReport() {
  return createIssueProgressReport({
    extra_field: 'This should not be allowed',
    another_extra: { nested: 'extra data' }
  });
}

/**
 * Create report with invalid recommendation enum
 * @returns {object} Report with invalid recommendation
 */
function createInvalidRecommendationReport() {
  return createIssueProgressReport({
    recommendation: 'INVALID_STATUS' // Not in enum
  });
}

/**
 * Create report with invalid execution_status enum
 * @returns {object} Report with invalid execution_status
 */
function createInvalidExecutionStatusReport() {
  return createIssueProgressReport({
    execution_status: 'INVALID_STATUS' // Not in enum
  });
}

/**
 * Create report with invalid role enum in roles_completed
 * @returns {object} Report with invalid role
 */
function createInvalidRoleReport() {
  return createIssueProgressReport({
    roles_completed: [
      {
        role: 'invalid_role', // Not in enum
        status: 'COMPLETE',
        key_output: 'Some output'
      }
    ]
  });
}

/**
 * Create report with invalid role status enum
 * @returns {object} Report with invalid role status
 */
function createInvalidRoleStatusReport() {
  return createIssueProgressReport({
    roles_completed: [
      {
        role: 'developer',
        status: 'INVALID_STATUS', // Not in enum
        key_output: 'Some output'
      }
    ]
  });
}

/**
 * Create report with invalid artifact_type enum
 * @returns {object} Report with invalid artifact_type
 */
function createInvalidArtifactTypeReport() {
  return createIssueProgressReport({
    consumed_artifacts: [
      {
        artifact_type: 'invalid_type', // Not in enum
        artifact_path: 'docs/something.md',
        fields_used: ['field1']
      }
    ]
  });
}

/**
 * Create report with missing required fields
 * @param {string[]} missingFields - Array of field names to remove
 * @returns {object} Report with missing fields
 */
function createMissingFieldsReport(missingFields = []) {
  const report = createIssueProgressReport();
  const result = { ...report };
  
  for (const field of missingFields) {
    delete result[field];
  }
  
  return result;
}

/**
 * Create report with invalid repository format
 * @returns {object} Report with invalid repository pattern
 */
function createInvalidRepositoryReport() {
  return createIssueProgressReport({
    repository: 'invalid-format' // Should be "owner/repo"
  });
}

/**
 * Create report with invalid issue_number
 * @returns {object} Report with invalid issue_number (negative)
 */
function createInvalidIssueNumberReport() {
  return createIssueProgressReport({
    issue_number: 0 // minimum: 1
  });
}

module.exports = {
  deepMerge,
  createIssueProgressReport,
  createPartialProgressReport,
  createBlockedProgressReport,
  createInvalidProgressReport,
  createMalformedProgressReport,
  createBR003ViolationReport,
  createEmptyConsumedArtifactsReport,
  createEmptyNextStepsReport,
  createAdditionalPropertiesReport,
  createInvalidRecommendationReport,
  createInvalidExecutionStatusReport,
  createInvalidRoleReport,
  createInvalidRoleStatusReport,
  createInvalidArtifactTypeReport,
  createMissingFieldsReport,
  createInvalidRepositoryReport,
  createInvalidIssueNumberReport
};