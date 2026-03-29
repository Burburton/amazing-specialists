/**
 * Integration Tests: Issue Status Sync Skill (DOC-003 Contract)
 * Test Cases: TC-ISS-001~015
 * 
 * Tests validate the issue-progress-report schema contract including:
 * - BR-003 enforcement (issue_state_after must be OPEN)
 * - Schema compliance (DOC-003 contract)
 * - Evidence-based reporting (consumed_artifacts minItems: 1)
 */

const {
  getIssueProgressReportSchema,
  validateAgainstSchema,
  assertSchemaValid,
  assertSchemaInvalid,
  hasErrorKeyword,
  getValidationErrorsForField
} = require('../helpers/schema-assertions');

const {
  createIssueProgressReport,
  createPartialProgressReport,
  createBlockedProgressReport,
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
} = require('../fixtures/skill-fixtures');

describe('Integration: Issue Status Sync Skill (DOC-003 Contract)', () => {
  let schema;

  beforeAll(() => {
    schema = getIssueProgressReportSchema();
  });

  describe('Schema Validation - Valid Cases', () => {
    test('TC-ISS-001: Valid issue-progress-report passes schema validation', () => {
      const report = createIssueProgressReport();
      const result = validateAgainstSchema(report, schema);
      assertSchemaValid(result);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('TC-ISS-013: Full artifact example validation', () => {
      const report = createIssueProgressReport({
        roles_completed: [
          { role: 'architect', status: 'COMPLETE', key_output: 'docs/design.md' },
          { role: 'developer', status: 'COMPLETE', key_output: 'src/index.js' },
          { role: 'tester', status: 'COMPLETE', key_output: 'tests/test.js' },
          { role: 'reviewer', status: 'COMPLETE', key_output: 'docs/review.md' },
          { role: 'docs', status: 'COMPLETE', key_output: 'README.md' },
          { role: 'security', status: 'COMPLETE', key_output: 'docs/security.md' }
        ],
        artifacts_produced: [
          { contract_id: 'ARC-001', file_path: 'docs/design.md', summary: 'Design document' },
          { contract_id: 'DEV-001', file_path: 'src/index.js', summary: 'Implementation' },
          { contract_id: 'TEST-001', file_path: 'tests/test.js', summary: 'Test suite' }
        ],
        consumed_artifacts: [
          { artifact_type: 'design-note', contract_id: 'ARC-001', artifact_path: 'docs/design.md', fields_used: ['architecture', 'components'] },
          { artifact_type: 'verification-report', contract_id: 'TEST-001', artifact_path: 'tests/report.md', fields_used: ['passed', 'coverage'] },
          { artifact_type: 'acceptance-decision-record', contract_id: 'REV-003', artifact_path: 'docs/acceptance.md', fields_used: ['decision'] }
        ],
        warnings: ['Minor lint issues', 'Documentation incomplete in some areas']
      });
      const result = validateAgainstSchema(report, schema);
      assertSchemaValid(result);
    });

    test('TC-ISS-014: Partial artifact validation', () => {
      const report = createPartialProgressReport();
      const result = validateAgainstSchema(report, schema);
      assertSchemaValid(result);
      expect(result.valid).toBe(true);
      expect(report.execution_status).toBe('PARTIAL');
      expect(report.recommendation).toBe('NEEDS_REWORK');
    });
  });

  describe('BR-003 Enforcement (No Premature Closure)', () => {
    test('TC-ISS-002: BR-003 enforcement - issue_state_after must be OPEN', () => {
      const validReport = createIssueProgressReport();
      expect(validReport.issue_state_after).toBe('OPEN');
      const result = validateAgainstSchema(validReport, schema);
      expect(result.valid).toBe(true);
    });

    test('TC-ISS-007: Missing issue_state_after rejected', () => {
      const report = createMissingFieldsReport(['issue_state_after']);
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'required');
      const requiredError = result.errors.find(e => 
        e.keyword === 'required' && e.params && e.params.missingProperty === 'issue_state_after'
      );
      expect(requiredError).toBeDefined();
      expect(hasErrorKeyword(result, 'required')).toBe(true);
    });

    test('BR-003: issue_state_after = CLOSED violates const constraint', () => {
      const report = createBR003ViolationReport();
      expect(report.issue_state_after).toBe('CLOSED');
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'const');
      expect(hasErrorKeyword(result, 'const')).toBe(true);
    });

    test('BR-003: Schema const value is OPEN', () => {
      const issueStateSchema = schema.properties.issue_state_after;
      expect(issueStateSchema.const).toBe('OPEN');
      expect(issueStateSchema.description).toContain('BR-003');
    });
  });

  describe('Evidence-Based Reporting (consumed_artifacts)', () => {
    test('TC-ISS-003: consumed_artifacts must have minItems: 1 (evidence-based)', () => {
      const validReport = createIssueProgressReport();
      expect(validReport.consumed_artifacts.length).toBeGreaterThanOrEqual(1);
      const result = validateAgainstSchema(validReport, schema);
      expect(result.valid).toBe(true);
    });

    test('TC-ISS-008: Empty consumed_artifacts rejected', () => {
      const report = createEmptyConsumedArtifactsReport();
      expect(report.consumed_artifacts).toHaveLength(0);
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'minItems');
      expect(hasErrorKeyword(result, 'minItems')).toBe(true);
    });

    test('consumed_artifacts schema has minItems: 1', () => {
      const consumedSchema = schema.properties.consumed_artifacts;
      expect(consumedSchema.minItems).toBe(1);
    });
  });

  describe('Enum Validation', () => {
    test('TC-ISS-004: recommendation enum validation', () => {
      const validRecommendations = ['PENDING_ACCEPTANCE', 'NEEDS_REWORK', 'BLOCKED_ESCALATION'];
      const schemaEnum = schema.properties.recommendation.enum;
      expect(schemaEnum).toEqual(validRecommendations);
      
      for (const rec of validRecommendations) {
        const report = createIssueProgressReport({ recommendation: rec });
        const result = validateAgainstSchema(report, schema);
        expect(result.valid).toBe(true);
      }
    });

    test('TC-ISS-006: Invalid recommendation rejected', () => {
      const report = createInvalidRecommendationReport();
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'enum');
      expect(hasErrorKeyword(result, 'enum')).toBe(true);
    });

    test('execution_status enum validation', () => {
      const validStatuses = ['SUCCESS', 'PARTIAL', 'FAILED', 'BLOCKED'];
      const schemaEnum = schema.properties.execution_status.enum;
      expect(schemaEnum).toEqual(validStatuses);
    });

    test('Invalid execution_status rejected', () => {
      const report = createInvalidExecutionStatusReport();
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'enum');
      expect(hasErrorKeyword(result, 'enum')).toBe(true);
    });
  });

  describe('Required Fields Validation', () => {
    test('TC-ISS-005: required fields validation', () => {
      const requiredFields = schema.required;
      const expectedRequired = [
        'contract_id', 'dispatch_id', 'created_at', 'created_by', 'skill_used',
        'issue_number', 'repository', 'execution_status', 'roles_completed',
        'artifacts_produced', 'consumed_artifacts', 'recommendation',
        'recommendation_reason', 'quality_summary', 'next_steps',
        'issue_state_after', 'comment_url'
      ];
      expect(requiredFields).toEqual(expectedRequired);
    });

    test('Missing dispatch_id rejected', () => {
      const report = createMissingFieldsReport(['dispatch_id']);
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'required');
    });

    test('Missing created_at rejected', () => {
      const report = createMissingFieldsReport(['created_at']);
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'required');
    });

    test('Missing recommendation_reason rejected', () => {
      const report = createMissingFieldsReport(['recommendation_reason']);
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'required');
    });
  });

  describe('Nested Object Validation', () => {
    test('TC-ISS-009: roles_completed validation', () => {
      const validRoles = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];
      const validStatuses = ['COMPLETE', 'PARTIAL', 'SKIPPED'];
      const roleSchema = schema.properties.roles_completed.items.properties.role;
      const statusSchema = schema.properties.roles_completed.items.properties.status;
      
      expect(roleSchema.enum).toEqual(validRoles);
      expect(statusSchema.enum).toEqual(validStatuses);
    });

    test('Invalid role in roles_completed rejected', () => {
      const report = createInvalidRoleReport();
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'enum');
    });

    test('Invalid role status rejected', () => {
      const report = createInvalidRoleStatusReport();
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'enum');
    });

    test('TC-ISS-010: quality_summary validation', () => {
      const validReviewStatuses = ['APPROVED', 'REJECTED', 'WARN', null];
      const validSecurityGates = ['PASSED', 'FAILED', null];
      const reviewSchema = schema.properties.quality_summary.properties.review_status;
      const securitySchema = schema.properties.quality_summary.properties.security_gate;
      
      expect(reviewSchema.enum).toContain('APPROVED');
      expect(reviewSchema.enum).toContain('REJECTED');
      expect(reviewSchema.enum).toContain('WARN');
      expect(reviewSchema.enum).toContain(null);
      
      expect(securitySchema.enum).toContain('PASSED');
      expect(securitySchema.enum).toContain('FAILED');
      expect(securitySchema.enum).toContain(null);
    });

    test('quality_summary allows null values for tests_passed', () => {
      const report = createBlockedProgressReport();
      expect(report.quality_summary.tests_passed).toBe(null);
      expect(report.quality_summary.review_status).toBe(null);
      const result = validateAgainstSchema(report, schema);
      expect(result.valid).toBe(true);
    });
  });

  describe('Array Validation', () => {
    test('TC-ISS-011: next_steps minItems: 1 validation', () => {
      const nextStepsSchema = schema.properties.next_steps;
      expect(nextStepsSchema.minItems).toBe(1);
    });

    test('Empty next_steps rejected', () => {
      const report = createEmptyNextStepsReport();
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'minItems');
      expect(hasErrorKeyword(result, 'minItems')).toBe(true);
    });

    test('Invalid artifact_type in consumed_artifacts rejected', () => {
      const report = createInvalidArtifactTypeReport();
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'enum');
    });
  });

  describe('Additional Properties', () => {
    test('TC-ISS-012: Additional properties forbidden', () => {
      expect(schema.additionalProperties).toBe(false);
    });

    test('Report with additional properties rejected', () => {
      const report = createAdditionalPropertiesReport();
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'additionalProperties');
      expect(hasErrorKeyword(result, 'additionalProperties')).toBe(true);
    });
  });

  describe('Format and Pattern Validation', () => {
    test('created_at must be date-time format', () => {
      const createdAtSchema = schema.properties.created_at;
      expect(createdAtSchema.format).toBe('date-time');
    });

    test('comment_url must be URI format', () => {
      const commentUrlSchema = schema.properties.comment_url;
      expect(commentUrlSchema.format).toBe('uri');
    });

    test('repository must match owner/repo pattern', () => {
      const repoSchema = schema.properties.repository;
      expect(repoSchema.pattern).toBe('^[^/]+/[^/]+$');
    });

    test('Invalid repository format rejected', () => {
      const report = createInvalidRepositoryReport();
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'pattern');
    });
  });

  describe('Numeric Constraints', () => {
    test('issue_number minimum: 1', () => {
      const issueNumberSchema = schema.properties.issue_number;
      expect(issueNumberSchema.minimum).toBe(1);
    });

    test('issue_number = 0 rejected', () => {
      const report = createInvalidIssueNumberReport();
      expect(report.issue_number).toBe(0);
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result, 'minimum');
    });
  });

  describe('Contract Identity', () => {
    test('contract_id must be DOC-003', () => {
      const contractIdSchema = schema.properties.contract_id;
      expect(contractIdSchema.const).toBe('DOC-003');
    });

    test('created_by must be docs', () => {
      const createdBySchema = schema.properties.created_by;
      expect(createdBySchema.const).toBe('docs');
    });

    test('skill_used must be issue-status-sync', () => {
      const skillUsedSchema = schema.properties.skill_used;
      expect(skillUsedSchema.const).toBe('issue-status-sync');
    });
  });

  describe('Malformed Input Handling', () => {
    test('TC-ISS-015: Malformed artifact rejected', () => {
      const report = createMalformedProgressReport();
      const result = validateAgainstSchema(report, schema);
      assertSchemaInvalid(result);
      expect(result.errors.length).toBeGreaterThan(5);
      expect(hasErrorKeyword(result, 'required')).toBe(true);
      expect(hasErrorKeyword(result, 'const')).toBe(true);
      expect(hasErrorKeyword(result, 'enum')).toBe(true);
    });

    test('Empty object rejected', () => {
      const result = validateAgainstSchema({}, schema);
      assertSchemaInvalid(result, 'required');
      expect(result.errors.length).toBeGreaterThan(10);
    });

    test('Null values handled appropriately', () => {
      const report = createIssueProgressReport({
        quality_summary: {
          tests_passed: null,
          review_status: null,
          security_gate: null
        }
      });
      const result = validateAgainstSchema(report, schema);
      expect(result.valid).toBe(true);
    });
  });

  describe('Schema Metadata', () => {
    test('Schema has correct $id', () => {
      expect(schema.$id).toBe('contracts/pack/docs/issue-progress-report.schema.json');
    });

    test('Schema has correct title', () => {
      expect(schema.title).toBe('Issue Progress Report Contract');
    });

    test('Schema description mentions BR-003', () => {
      const issueStateDesc = schema.properties.issue_state_after.description;
      expect(issueStateDesc).toContain('BR-003');
      expect(issueStateDesc).toContain('OPEN');
      expect(issueStateDesc).toContain('Premature closure');
    });
  });
});