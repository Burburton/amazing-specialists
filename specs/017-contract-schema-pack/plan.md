# Implementation Plan: 017-contract-schema-pack

## Document Status
- **Feature ID**: `017-contract-schema-pack`
- **Version**: 1.0.0
- **Status**: In Progress
- **Created**: 2026-03-28

---

## Architecture Summary

Create a unified Contract Schema Pack that consolidates all 17 artifact contracts into a single, discoverable location with machine-readable JSON Schema definitions. The pack consists of:

1. **Contract Registry** (`registry.json`) - Unified index with metadata for all 17 contracts
2. **Schema Pack Directory** (`contracts/pack/`) - Centralized storage for JSON Schema files
3. **Per-Role Schema Files** - JSON Schema files organized by 6-role model
4. **Validation Utilities** - Basic schema syntax validation tool
5. **Documentation Migration Guide** - Guide for downstream consumers

---

## Inputs from Spec

### Business Rules (6 rules)
| Rule | Key Requirement |
|------|-----------------|
| BR-001 | Single source of truth - registry.json is authoritative |
| BR-002 | Schema parity - schemas must match markdown definitions |
| BR-003 | Backward compatibility - existing markdown unchanged |
| BR-004 | Version tracking - version per contract in registry |
| BR-005 | Governance alignment - directory follows 6-role model |
| BR-006 | Validation utility scope - basic syntax checkers only |

### Non-functional Requirements (4 requirements)
| NFR | Requirement |
|-----|-------------|
| NFR-001 | Path: `contracts/pack/`, documented in README |
| NFR-002 | JSON Schema Draft 2020-12 format |
| NFR-003 | Registry has 8 required metadata fields per contract |
| NFR-004 | Minimal size - field definitions only, examples in markdown |

### Acceptance Criteria (5 criteria)
| AC | Requirement |
|----|-------------|
| AC-001 | Registry complete with 17 contracts, valid JSON |
| AC-002 | All 17 schemas generated, accurate, valid JSON Schema |
| AC-003 | Backward compatibility verified |
| AC-004 | Documentation updated (README, io-contract, skills-usage-guide) |
| AC-005 | Validation utility provided |

---

## Technical Constraints

### C-001: JSON Schema Format
- Use JSON Schema Draft 2020-12 specification
- `$schema` field must be `"https://json-schema.org/draft/2020-12/schema"`
- All schemas must be valid JSON files

### C-002: No Contract Content Changes
- Cannot modify any existing markdown contract definitions
- Cannot add/remove fields from contracts
- Schema must faithfully represent markdown definitions

### C-003: Directory Structure Alignment
- Must follow 6-role model: architect, developer, tester, reviewer, docs, security
- Must maintain traceability to source markdown locations

### C-004: Registry Schema
Registry itself must have a JSON Schema for self-validation:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pack_version": { "type": "string" },
    "created_at": { "type": "string", "format": "date-time" },
    "contracts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "contract_id": { "type": "string" },
          "contract_name": { "type": "string" },
          "producer_role": { "type": "string" },
          "consumer_roles": { "type": "array", "items": { "type": "string" } },
          "version": { "type": "string" },
          "schema_path": { "type": "string" },
          "markdown_path": { "type": "string" },
          "description": { "type": "string" }
        },
        "required": ["contract_id", "contract_name", "producer_role", "consumer_roles", "version", "schema_path", "markdown_path", "description"]
      }
    }
  },
  "required": ["pack_version", "created_at", "contracts"]
}
```

---

## Module Decomposition

### Module 1: Registry Generator
**Purpose**: Generate `registry.json` with metadata for all 17 contracts

**Sub-modules**:
- Contract metadata extractor (parse markdown headers)
- Registry builder (aggregate into JSON structure)
- Registry validator (self-validate against registry schema)

**Output**: `contracts/pack/registry.json`

### Module 2: Schema Generator
**Purpose**: Generate JSON Schema files for each contract

**Sub-modules**:
- Field parser (extract fields from markdown contracts)
- Type mapper (map markdown types to JSON Schema types)
- Schema builder (construct JSON Schema structure)
- Schema validator (validate against JSON Schema spec)

**Output**: 17 `.schema.json` files in `contracts/pack/<role>/`

### Module 3: Validation Utility
**Purpose**: Basic schema syntax validation tool

**Sub-modules**:
- JSON syntax validator
- JSON Schema compliance checker
- Artifact-to-schema validator (validate YAML/JSON artifact against schema)

**Output**: `contracts/pack/validate-schema.js`

### Module 4: Documentation Sync
**Purpose**: Update governance documentation

**Sub-modules**:
- README updater (add schema pack section)
- io-contract updater (reference machine-readable schemas)
- skills-usage-guide updater (mention schema discovery)

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Existing Markdown Contracts                    │
│  specs/*/contracts/*.md (17 files across 6 directories)          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Contract Metadata Extractor                    │
│  Parse markdown headers: contract_id, version, role, consumers   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Registry Builder                             │
│  Aggregate metadata into registry.json structure                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    contracts/pack/registry.json                   │
│  Unified index of all 17 contracts                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Existing Markdown Contracts                    │
│  specs/*/contracts/*.md (17 files)                               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Field Parser                                 │
│  Extract field definitions, types, validation rules              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Type Mapper                                  │
│  Map to JSON Schema types: string, array, object, enum, boolean  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Schema Builder                               │
│  Construct JSON Schema with $schema, type, properties, required  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 contracts/pack/<role>/<name>.schema.json         │
│  Machine-readable schema files (17 total)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Failure Handling

### F-001: Schema Parity Failure
**Condition**: Generated schema does not match markdown contract definition
**Detection**: Manual comparison or automated diff tool
**Response**: Re-parse markdown, regenerate schema, verify parity
**Escalation**: If persistent, report as BR-002 violation

### F-002: JSON Syntax Error
**Condition**: Generated JSON/JSON Schema has syntax errors
**Detection**: JSON.parse() failure or JSON Schema validator
**Response**: Fix JSON syntax, validate before writing
**Prevention**: Always validate before writing files

### F-003: Registry Incomplete
**Condition**: Registry missing required metadata fields for a contract
**Detection**: Registry schema validation
**Response**: Re-extract metadata from missing contract
**Prevention**: Validate registry after generation

### F-004: Backward Compatibility Break
**Condition**: Existing markdown contract accidentally modified
**Detection**: git diff showing changes to specs/*/contracts/*.md
**Response**: Revert changes, use copy for schema generation
**Prevention**: Read-only access to markdown during generation

### F-005: Validation Utility Failure
**Condition**: Validation utility cannot parse artifact or schema
**Detection**: Utility error output
**Response**: Check artifact format, schema format, fix utility
**Prevention**: Test utility with sample artifacts

---

## Validation Strategy

### V-001: Registry Validation
- JSON syntax validation (JSON.parse)
- Registry schema validation (against registry.schema.json)
- Completeness check (17 contracts, 8 fields each)

### V-002: Schema Validation
- JSON syntax validation for each schema file
- JSON Schema spec compliance (ajv or similar validator)
- Parity check against markdown definitions (manual or automated)

### V-003: Backward Compatibility Validation
- git diff showing no changes to existing markdown contracts
- Existing validation checklists still reference markdown
- No breaking changes to downstream consumers

### V-004: Documentation Validation
- README contains schema pack reference
- io-contract.md contains schema pack reference
- skills-usage-guide contains schema discovery mention

### V-005: Validation Utility Validation
- Utility validates sample artifacts correctly
- Utility returns pass/fail with error details
- Utility handles edge cases (invalid JSON, missing fields)

---

## Risks / Tradeoffs

### R-001: Schema Parity Maintenance
**Risk**: Markdown contracts may evolve, schemas may drift
**Tradeoff**: Manual synchronization initially, may need automation later
**Mitigation**: Version tracking in registry, parity checks in validation
**Assumption**: A-002 (JSON Schema acceptable) - if not, may need YAML alternative

### R-002: Complex Nested Types
**Risk**: Some contracts have complex nested object structures
**Tradeoff**: May need custom validation beyond JSON Schema
**Mitigation**: Use JSON Schema `additionalProperties: false` for strictness
**Assumption**: A-005 (contract field types are simple enough) - may need custom validators

### R-003: Dual Maintenance Burden
**Risk**: Both markdown and schemas need maintenance
**Tradeoff**: Short-term burden, long-term automation possible
**Mitigation**: Markdown remains authoritative (BR-002), schemas derived
**Assumption**: A-003 (downstream consumers adopt schemas over time) - if not, burden persists

### R-004: Downstream Adoption Uncertainty
**Risk**: Consumers may not use machine-readable schemas
**Tradeoff**: Provide schemas but don't force adoption
**Mitigation**: Documentation explains benefits, backward compatible
**Assumption**: Q-003 (registry unified vs split) - unified chosen, may need role-specific indexes later

### R-005: Implementation Language Choice
**Risk**: Node.js may not fit all consumers' environments
**Tradeoff**: Node chosen for consistency with existing tooling
**Mitigation**: JSON/YAML schemas are language-independent
**Assumption**: Q-002 (Node vs Python) - Node chosen, Python alternative could be added later

---

## Requirement Traceability

### BR Traceability
| Rule | Plan Section | Implementation Module |
|------|---------------|----------------------|
| BR-001 | Module 1, V-001 | Registry Generator |
| BR-002 | Module 2, V-002 | Schema Generator |
| BR-003 | Module 2, V-003 | Schema Generator (no markdown changes) |
| BR-004 | C-004, Module 1 | Registry Builder (version field) |
| BR-005 | C-003, Module 2 | Schema Generator (directory structure) |
| BR-006 | Module 3 | Validation Utility (basic syntax only) |

### NFR Traceability
| NFR | Plan Section | Implementation Module |
|-----|---------------|----------------------|
| NFR-001 | Module 4, V-004 | Documentation Sync |
| NFR-002 | C-001 | Schema Generator (Draft 2020-12) |
| NFR-003 | C-004, V-001 | Registry Builder (8 fields) |
| NFR-004 | Module 2 | Schema Builder (minimal, no examples) |

### AC Traceability
| AC | Plan Section | Validation Strategy |
|----|---------------|---------------------|
| AC-001 | Module 1, V-001 | Registry validation |
| AC-002 | Module 2, V-002 | Schema validation |
| AC-003 | Module 2, V-003 | Backward compatibility validation |
| AC-004 | Module 4, V-004 | Documentation validation |
| AC-005 | Module 3, V-005 | Validation utility validation |

---

## Contract Coverage

### 17 Contracts to Pack

| Role | Contract ID | Contract Name | Source Path |
|------|-------------|---------------|-------------|
| architect | AC-001 | design-note | specs/003-architect-core/contracts/design-note-contract.md |
| architect | AC-002 | open-questions | specs/003-architect-core/contracts/open-questions-contract.md |
| architect | AC-003 | risks-and-tradeoffs | specs/003-architect-core/contracts/risks-and-tradeoffs-contract.md |
| architect | AC-004 | module-boundaries | specs/003-architect-core/contracts/module-boundaries-contract.md |
| developer | DC-001 | implementation-summary | specs/004-developer-core/contracts/implementation-summary-contract.md |
| developer | DC-002 | self-check-report | specs/004-developer-core/contracts/self-check-report-contract.md |
| developer | DC-003 | bugfix-report | specs/004-developer-core/contracts/bugfix-report-contract.md |
| tester | TC-001 | verification-report | specs/005-tester-core/contracts/verification-report-contract.md |
| tester | TC-002 | test-scope-report | specs/005-tester-core/contracts/test-scope-report-contract.md |
| tester | TC-003 | regression-risk-report | specs/005-tester-core/contracts/regression-risk-report-contract.md |
| reviewer | RC-001 | review-findings-report | specs/006-reviewer-core/contracts/review-findings-report-contract.md |
| reviewer | RC-002 | actionable-feedback-report | specs/006-reviewer-core/contracts/actionable-feedback-report-contract.md |
| reviewer | RC-003 | acceptance-decision-record | specs/006-reviewer-core/contracts/acceptance-decision-record-contract.md |
| docs | DOC-001 | docs-sync-report | specs/007-docs-core/contracts/docs-sync-report-contract.md |
| docs | DOC-002 | changelog-entry | specs/007-docs-core/contracts/changelog-entry-contract.md |
| security | SEC-001 | security-review-report | specs/008-security-core/contracts/security-review-report-contract.md |
| security | SEC-002 | input-validation-review-report | specs/008-security-core/contracts/input-validation-review-report-contract.md |

---

## Directory Structure

```
contracts/
├── pack/
│   ├── registry.json                  # Unified contract registry
│   ├── registry.schema.json           # Schema for registry validation
│   ├── pack-version.json              # Schema pack version tracking
│   ├── validate-schema.js             # Validation utility
│   ├── architect/
│   │   ├── design-note.schema.json
│   │   ├── open-questions.schema.json
│   │   ├── risks-and-tradeoffs.schema.json
│   │   └── module-boundaries.schema.json
│   ├── developer/
│   │   ├── implementation-summary.schema.json
│   │   ├── self-check-report.schema.json
│   │   └── bugfix-report.schema.json
│   ├── tester/
│   │   ├── verification-report.schema.json
│   │   ├── test-scope-report.schema.json
│   │   ├── regression-risk-report.schema.json
│   ├── reviewer/
│   │   ├── review-findings-report.schema.json
│   │   ├── actionable-feedback-report.schema.json
│   │   ├── acceptance-decision-record.schema.json
│   ├── docs/
│   │   ├── docs-sync-report.schema.json
│   │   └angelog-entry.schema.json
│   └── security/
│       ├── security-review-report.schema.json
│       └── input-validation-review-report.schema.json
```

---

## Open Questions Resolution

| Q-ID | Spec Question | Plan Decision | Rationale |
|------|---------------|---------------|-----------|
| Q-001 | JSON or YAML schemas? | JSON | JSON Schema standard format, tool compatibility |
| Q-002 | Node or Python utility? | Node | Matches existing tooling, JSON-native |
| Q-003 | Registry split or unified? | Unified | Single source of truth (BR-001), role metadata in entries |
| Q-004 | Schema version updates? | Manual + version increment | Simple workflow initially, automation later |
| Q-005 | Markdown reference schemas? | Yes | Add `schema_path` metadata in markdown headers |

---

## Assumptions

| A-ID | Assumption | Risk if Wrong | Validation Method |
|------|------------|---------------|-------------------|
| A-001 | All 17 markdown contracts stable and complete | Schema inconsistencies | Verify contracts exist and have defined fields |
| A-002 | JSON Schema Draft 2020-12 acceptable | Tool compatibility issues | Check validator supports Draft 2020-12 |
| A-003 | Downstream will adopt schemas over time | Dual maintenance burden | Document benefits, track adoption |
| A-004 | No immediate need for schema migration | Underestimated effort | Manual workflow initially |
| A-005 | Contract field types simple enough for JSON Schema | Need custom validators | Test with actual contract definitions |

---

## References

- `specs/017-contract-schema-pack/spec.md` - Source specification
- `specs/*/contracts/*.md` - Existing 17 artifact contracts
- `io-contract.md` - I/O contract specification
- `package-spec.md` - Package governance
- `role-definition.md` - 6-role definitions