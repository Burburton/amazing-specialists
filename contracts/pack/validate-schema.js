#!/usr/bin/env node

/**
 * Contract Schema Validation Utility
 * 
 * Validates artifacts against JSON Schema definitions.
 * Usage: node validate-schema.js <artifact-path> <contract-id>
 * 
 * Example:
 *   node validate-schema.js design-note.yaml AC-001
 */

const fs = require('fs');
const path = require('path');

// Load JSON Schema validator (simplified - for production use ajv)
function validateAgainstSchema(artifact, schema) {
  const errors = [];
  
  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!artifact.hasOwnProperty(field)) {
        errors.push({
          path: field,
          message: `Missing required field: ${field}`,
          expected: 'present',
          actual: 'missing'
        });
      }
    }
  }
  
  // Check property types
  if (schema.properties) {
    for (const [key, value] of Object.entries(artifact)) {
      if (schema.properties[key]) {
        const propSchema = schema.properties[key];
        const typeError = checkType(key, value, propSchema);
        if (typeError) {
          errors.push(typeError);
        }
      } else if (schema.additionalProperties === false) {
        errors.push({
          path: key,
          message: `Additional property not allowed: ${key}`,
          expected: 'not present',
          actual: 'present'
        });
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

function checkType(path, value, schema) {
  const expectedType = schema.type;
  
  // Handle union types (e.g., ["string", "null"])
  if (Array.isArray(expectedType)) {
    const actualType = getType(value);
    // Integer should match "number" in union types
    const actualTypes = actualType === 'integer' ? ['integer', 'number'] : [actualType];
    const matches = expectedType.some(t => actualTypes.includes(t));
    if (!matches) {
      return {
        path,
        message: `Type mismatch at ${path}`,
        expected: expectedType.join(' | '),
        actual: actualType
      };
    }
    return null;
  }
  
  // Handle array type
  if (expectedType === 'array') {
    if (!Array.isArray(value)) {
      return {
        path,
        message: `Type mismatch at ${path}`,
        expected: 'array',
        actual: getType(value)
      };
    }
    if (schema.minItems && value.length < schema.minItems) {
      return {
        path,
        message: `Array too short at ${path}`,
        expected: `>= ${schema.minItems} items`,
        actual: `${value.length} items`
      };
    }
    // Check array items if schema provided
    if (schema.items && typeof schema.items === 'object') {
      for (let i = 0; i < value.length; i++) {
        const itemError = checkType(`${path}[${i}]`, value[i], schema.items);
        if (itemError) return itemError;
      }
    }
    return null;
  }
  
  // Handle object type
  if (expectedType === 'object') {
    if (typeof value !== 'object' || Array.isArray(value)) {
      return {
        path,
        message: `Type mismatch at ${path}`,
        expected: 'object',
        actual: getType(value)
      };
    }
    // Check nested properties
    if (schema.properties) {
      for (const [key, val] of Object.entries(value)) {
        if (schema.properties[key]) {
          const nestedError = checkType(`${path}.${key}`, val, schema.properties[key]);
          if (nestedError) return nestedError;
        }
      }
    }
    return null;
  }
  
  // Handle primitive types
  const actualType = getType(value);
  if (actualType !== expectedType) {
    return {
      path,
      message: `Type mismatch at ${path}`,
      expected: expectedType,
      actual: actualType
    };
  }
  
  // Check string constraints
  if (expectedType === 'string' && typeof value === 'string') {
    if (schema.minLength && value.length < schema.minLength) {
      return {
        path,
        message: `String too short at ${path}`,
        expected: `>= ${schema.minLength} chars`,
        actual: `${value.length} chars`
      };
    }
    if (schema.enum && !schema.enum.includes(value)) {
      return {
        path,
        message: `Invalid enum value at ${path}`,
        expected: schema.enum.join(' | '),
        actual: value
      };
    }
  }
  
  return null;
}

function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'number' && Number.isInteger(value)) return 'integer';
  return typeof value;
}

// Main validation function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node validate-schema.js <artifact-path> <contract-id>');
    console.log('Example: node validate-schema.js design-note.yaml AC-001');
    process.exit(1);
  }
  
  const artifactPath = args[0];
  const contractId = args[1];
  
  // Load registry to find schema path
  const registryPath = path.join(__dirname, 'registry.json');
  if (!fs.existsSync(registryPath)) {
    console.error('Error: registry.json not found');
    process.exit(1);
  }
  
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const contractEntry = registry.contracts.find(c => c.contract_id === contractId);
  
  if (!contractEntry) {
    console.error(`Error: Contract ${contractId} not found in registry`);
    console.log('Available contracts:', registry.contracts.map(c => c.contract_id).join(', '));
    process.exit(1);
  }
  
  // Load schema
  const schemaPath = path.resolve(__dirname, '..', '..', contractEntry.schema_path);
  if (!fs.existsSync(schemaPath)) {
    console.error(`Error: Schema file not found: ${schemaPath}`);
    process.exit(1);
  }
  
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  
  // Load artifact
  if (!fs.existsSync(artifactPath)) {
    console.error(`Error: Artifact file not found: ${artifactPath}`);
    process.exit(1);
  }
  
  let artifact;
  const ext = path.extname(artifactPath).toLowerCase();
  const content = fs.readFileSync(artifactPath, 'utf8');
  
  if (ext === '.json') {
    artifact = JSON.parse(content);
  } else if (ext === '.yaml' || ext === '.yml') {
    // Simple YAML parsing (for production, use yaml library)
    console.log('Note: YAML parsing requires yaml library. Using JSON format recommended.');
    try {
      artifact = JSON.parse(content);
    } catch (e) {
      console.error('Error: Could not parse artifact. Use JSON format or install yaml library.');
      process.exit(1);
    }
  } else {
    console.error('Error: Unsupported file format. Use .json or .yaml');
    process.exit(1);
  }
  
  // Validate
  console.log(`\nValidating ${artifactPath} against ${contractId} (${contractEntry.contract_name})...\n`);
  
  const result = validateAgainstSchema(artifact, schema);
  
  if (result.valid) {
    console.log('✓ Validation PASSED\n');
    console.log(`Contract: ${contractEntry.contract_name}`);
    console.log(`Version: ${contractEntry.version}`);
    console.log(`Producer: ${contractEntry.producer_role}`);
    console.log(`Consumers: ${contractEntry.consumer_roles.join(', ')}`);
  } else {
    console.log('✗ Validation FAILED\n');
    console.log('Errors:');
    for (const error of result.errors) {
      console.log(`  - ${error.path}: ${error.message}`);
      console.log(`    Expected: ${error.expected}`);
      console.log(`    Actual: ${error.actual}`);
    }
  }
  
  console.log('\n---');
  console.log(`Checked at: ${new Date().toISOString()}`);
  
  process.exit(result.valid ? 0 : 1);
}

main();