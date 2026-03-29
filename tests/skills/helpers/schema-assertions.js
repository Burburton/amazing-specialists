/**
 * Schema Assertion Helpers
 * 
 * Provides validation functions for JSON Schema contract testing.
 * Uses AJV for schema validation.
 * 
 * @module tests/skills/helpers/schema-assertions
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const path = require('path');
const fs = require('fs');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv, ['date-time', 'uri']);

function loadSchema(schemaPath) {
  const fullPath = path.resolve(schemaPath);
  const schemaContent = fs.readFileSync(fullPath, 'utf8');
  const schema = JSON.parse(schemaContent);
  delete schema.$schema;
  return schema;
}

function getIssueProgressReportSchema() {
  return loadSchema('contracts/pack/docs/issue-progress-report.schema.json');
}

function normalizePath(instancePath) {
  if (!instancePath) return 'root';
  return instancePath.replace(/^\//, '').replace(/\//g, '.');
}

function validateAgainstSchema(data, schema) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return {
    valid,
    errors: validate.errors ? validate.errors.map(e => ({
      field: normalizePath(e.instancePath) || e.propertyName || 'root',
      message: e.message,
      keyword: e.keyword,
      params: e.params
    })) : []
  };
}

function assertSchemaValid(result) {
  if (!result.valid) {
    const errorMessages = result.errors.map(e => 
      `${e.field}: ${e.message} (keyword: ${e.keyword})`
    ).join('\n');
    throw new Error(`Schema validation failed:\n${errorMessages}`);
  }
}

function assertSchemaInvalid(result, expectedKeyword = null) {
  if (result.valid) {
    throw new Error('Expected schema validation to fail, but it passed');
  }
  if (expectedKeyword) {
    const hasExpectedKeyword = result.errors.some(e => e.keyword === expectedKeyword);
    if (!hasExpectedKeyword) {
      throw new Error(`Expected error keyword "${expectedKeyword}" but got: ${result.errors.map(e => e.keyword).join(', ')}`);
    }
  }
}

function assertBR003Compliance(result) {
  if (result.valid) {
    return true;
  }
  const br003Error = result.errors.find(e => 
    e.field.includes('issue_state_after') && e.keyword === 'const'
  );
  return !br003Error;
}

function assertEvidenceBased(result) {
  if (result.valid) {
    return true;
  }
  const consumedArtifactsError = result.errors.find(e =>
    e.field.includes('consumed_artifacts') && e.keyword === 'minItems'
  );
  return !consumedArtifactsError;
}

function assertNoAdditionalProperties(result) {
  if (result.valid) {
    return true;
  }
  const additionalPropsError = result.errors.find(e =>
    e.keyword === 'additionalProperties'
  );
  return !additionalPropsError;
}

function getValidationErrorsForField(result, fieldName) {
  return result.errors.filter(e => 
    e.field.includes(fieldName) || e.field === fieldName
  );
}

function hasErrorKeyword(result, keyword) {
  return result.errors.some(e => e.keyword === keyword);
}

function assertValidEnum(result, fieldName) {
  if (result.valid) {
    return true;
  }
  const enumError = result.errors.find(e =>
    e.field.includes(fieldName) && e.keyword === 'enum'
  );
  return !enumError;
}

function assertRequiredField(result, fieldName) {
  if (result.valid) {
    return true;
  }
  const requiredError = result.errors.find(e =>
    e.keyword === 'required' && e.params && e.params.missingProperty === fieldName
  );
  return !requiredError;
}

function formatValidationErrors(result) {
  return result.errors.map(e => ({
    path: e.field,
    message: e.message,
    keyword: e.keyword
  }));
}

module.exports = {
  ajv,
  loadSchema,
  getIssueProgressReportSchema,
  validateAgainstSchema,
  assertSchemaValid,
  assertSchemaInvalid,
  assertBR003Compliance,
  assertEvidenceBased,
  assertNoAdditionalProperties,
  getValidationErrorsForField,
  hasErrorKeyword,
  assertValidEnum,
  assertRequiredField,
  formatValidationErrors
};