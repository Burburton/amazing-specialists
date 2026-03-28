# Contract Schema Pack Migration Guide

## Purpose

This guide helps downstream consumers adopt the machine-readable Contract Schema Pack for automated artifact validation.

---

## What is Contract Schema Pack?

The Contract Schema Pack provides:

1. **Unified Registry** (`registry.json`) - Single source of truth for all 17 artifact contracts
2. **JSON Schema Files** - Machine-readable schema definitions (Draft 2020-12)
3. **Validation Utility** (`validate-schema.js`) - Basic schema validation tool

---

## Migration Steps

### Step 1: Discover Contracts

Query the registry to find available contracts:

```bash
cat contracts/pack/registry.json
```

Registry structure:
```json
{
  "pack_version": "1.0.0",
  "total_contracts": 17,
  "contracts": [
    {
      "contract_id": "AC-001",
      "contract_name": "design-note",
      "producer_role": "architect",
      "consumer_roles": ["developer", "tester", "reviewer", "docs"],
      "version": "1.0.0",
      "schema_path": "contracts/pack/architect/design-note.schema.json",
      "markdown_path": "specs/003-architect-core/contracts/design-note-contract.md",
      "description": "..."
    }
  ]
}
```

### Step 2: Load Schema for Validation

Load the schema file for your contract:

```bash
# Example: Load design-note schema
cat contracts/pack/architect/design-note.schema.json
```

### Step 3: Validate Artifacts

Use the validation utility:

```bash
# Basic validation
node contracts/pack/validate-schema.js <artifact-path> <contract-id>

# Example
node contracts/pack/validate-schema.js artifacts/design-note.json AC-001

# Output
Validating artifacts/design-note.json against AC-001 (design-note)...

✓ Validation PASSED
```

### Step 4: Integrate with Your Tools

For programmatic integration:

```javascript
// Load registry
const registry = require('./contracts/pack/registry.json');

// Find contract by ID
const contract = registry.contracts.find(c => c.contract_id === 'AC-001');

// Load schema
const schema = require('./' + contract.schema_path);

// Use ajv or similar for validation
const Ajv = require('ajv');
const validate = new Ajv().compile(schema);
const valid = validate(artifact);
```

---

## Contract ID Reference

| Role | Contract ID | Contract Name |
|------|-------------|---------------|
| architect | AC-001 | design-note |
| architect | AC-002 | open-questions |
| architect | AC-003 | risks-and-tradeoffs |
| architect | AC-004 | module-boundaries |
| developer | DC-001 | implementation-summary |
| developer | DC-002 | self-check-report |
| developer | DC-003 | bugfix-report |
| tester | TC-001 | verification-report |
| tester | TC-002 | test-scope-report |
| tester | TC-003 | regression-risk-report |
| reviewer | RC-001 | review-findings-report |
| reviewer | RC-002 | actionable-feedback-report |
| reviewer | RC-003 | acceptance-decision-record |
| docs | DOC-001 | docs-sync-report |
| docs | DOC-002 | changelog-entry |
| security | SEC-001 | security-review-report |
| security | SEC-002 | input-validation-review-report |

---

## Backward Compatibility

- **Markdown contracts remain unchanged** - Existing documentation references still work
- **Schema is derived format** - Markdown is authoritative (BR-002)
- **No breaking changes** - Schema pack is additive, not replacing

---

## Best Practices

### 1. Always Check Registry First
Registry is the single source of truth (BR-001). Query it before loading schemas.

### 2. Handle Validation Errors Gracefully
```javascript
if (!valid) {
  console.log(validate.errors);
  // Handle missing fields, type mismatches, etc.
}
```

### 3. Keep Schemas Updated
When markdown contracts change, schemas should be regenerated to maintain parity (BR-002).

### 4. Use JSON Format for Artifacts
While YAML is supported, JSON is the recommended format for machine-readable artifacts.

---

## Troubleshooting

### Schema File Not Found
```
Error: Schema file not found
```
Check:
- Registry `schema_path` is correct
- Schema file exists at the path
- Path is relative to repository root

### Validation Fails with Missing Fields
```
Missing required field: input_sources
```
Check:
- Artifact has all required fields per schema
- Field names match schema property names exactly

### Type Mismatch
```
Type mismatch at input_sources
Expected: array
Actual: string
```
Check:
- Field type matches schema definition
- Arrays use JSON array syntax: `[...]`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial release with 17 contract schemas |

---

## References

- `contracts/pack/registry.json` - Contract registry
- `contracts/pack/validate-schema.js` - Validation utility
- `specs/*/contracts/*.md` - Source markdown contracts
- `io-contract.md` - I/O contract specification