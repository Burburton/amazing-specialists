# Tasks: 017-contract-schema-pack

## Document Status
- **Feature ID**: `017-contract-schema-pack`
- **Version**: 1.0.0
- **Created**: 2026-03-28
- **Status**: Phase 4 Complete - Ready for spec-audit

---

## Phase 1: Setup / Prerequisites

### Task 1.1: Create Schema Pack Directory Structure
**ID**: `T-001`
**Title**: Create `contracts/pack/` directory structure
**Related Requirements**: BR-005, NFR-001, C-003
**Dependencies**: None
**Deliverable**: 
- `contracts/pack/` directory created
- Subdirectories for 6 roles: `architect/`, `developer/`, `tester/`, `reviewer/`, `docs/`, `security/`
- Directory structure matches plan.md specification

**Implementation Notes**:
- Follow 6-role model for directory organization
- Create empty directories initially, populate in later tasks
- Verify directory permissions and accessibility

---

### Task 1.2: Create Registry Schema Definition
**ID**: `T-002`
**Title**: Create `registry.schema.json` for registry self-validation
**Related Requirements**: BR-001, C-004, NFR-003, data-model.md Section 2
**Dependencies**: T-001
**Deliverable**: 
- `contracts/pack/registry.schema.json` created
- Defines validation rules for registry structure
- Uses JSON Schema Draft 2020-12 format

**Implementation Notes**:
- Copy registry schema from data-model.md Section 2
- Ensure all 8 required metadata fields are defined
- Add pattern constraints for `contract_id`, `schema_path`, `markdown_path`

---

### Task 1.3: Create Pack Version Schema Definition
**ID**: `T-003`
**Title**: Create `pack-version.schema.json` for version tracking
**Related Requirements**: BR-004, data-model.md Section 3
**Dependencies**: T-001
**Deliverable**: 
- `contracts/pack/pack-version.schema.json` created
- Defines pack version structure with changelog

**Implementation Notes**:
- Copy pack version schema from data-model.md Section 3
- Include changelog array for version history

---

### Task 1.4: Create Pack Version File
**ID**: `T-004`
**Title**: Create initial `pack-version.json`
**Related Requirements**: BR-004
**Dependencies**: T-003
**Deliverable**: 
- `contracts/pack/pack-version.json` created
- Initial version: `1.0.0`
- `base_contracts_version`: reference to current feature set
- Empty changelog with initial entry

**Implementation Notes**:
- Set `schema_spec_version: "draft/2020-12"`
- Record creation timestamp

---

## Phase 2: Core Implementation

### Task 2.1: Extract Contract Metadata from Markdown Files [P]
**ID**: `T-005`
**Title**: Parse all 17 markdown contract files for metadata extraction
**Related Requirements**: BR-001, NFR-003, plan.md Module 1
**Dependencies**: T-001
**Deliverable**: 
- Metadata extraction script/tool
- Metadata JSON for each contract (contract_id, version, producer_role, consumer_roles, etc.)
- Traceability to source markdown locations

**Implementation Notes**:
Parse headers from:
- `specs/003-architect-core/contracts/*.md` (4 files)
- `specs/004-developer-core/contracts/*.md` (3 files)
- `specs/005-tester-core/contracts/*.md` (3 files)
- `specs/006-reviewer-core/contracts/*.md` (3 files)
- `specs/007-docs-core/contracts/*.md` (2 files)
- `specs/008-security-core/contracts/*.md` (2 files)

Extract fields: Artifact ID, Version, Producer, Consumers

---

### Task 2.2: Build Contract Registry [P]
**ID**: `T-006`
**Title**: Generate `registry.json` with all 17 contract entries
**Related Requirements**: AC-001, BR-001, NFR-003, plan.md Module 1
**Dependencies**: T-005
**Deliverable**: 
- `contracts/pack/registry.json` created
- Contains 17 contract entries with all 8 required fields
- Valid JSON syntax
- Self-validates against `registry.schema.json`

**Implementation Notes**:
- Each entry: contract_id, contract_name, producer_role, consumer_roles, version, schema_path, markdown_path, description
- Set `total_contracts: 17`
- Validate registry after generation

---

### Task 2.3: Generate Architect Schema Files [P]
**ID**: `T-007`
**Title**: Create JSON Schema files for 4 architect contracts
**Related Requirements**: AC-002, BR-002, C-001, data-model.md Section 4
**Dependencies**: T-005
**Deliverable**: 
- `contracts/pack/architect/design-note.schema.json`
- `contracts/pack/architect/open-questions.schema.json`
- `contracts/pack/architect/risks-and-tradeoffs.schema.json`
- `contracts/pack/architect/module-boundaries.schema.json`

**Implementation Notes**:
- Parse field specifications from markdown contracts
- Map types per data-model.md Type Mapping Table
- Use `$schema: "https://json-schema.org/draft/2020-12/schema"`
- Set `additionalProperties: false` for strict validation
- Reference design-note.schema.json example in data-model.md Section 5

---

### Task 2.4: Generate Developer Schema Files [P]
**ID**: `T-008`
**Title**: Create JSON Schema files for 3 developer contracts
**Related Requirements**: AC-002, BR-002, C-001
**Dependencies**: T-005
**Deliverable**: 
- `contracts/pack/developer/implementation-summary.schema.json`
- `contracts/pack/developer/self-check-report.schema.json`
- `contracts/pack/developer/bugfix-report.schema.json`

**Implementation Notes**:
- Parse markdown contracts from `specs/004-developer-core/contracts/`
- Ensure schema parity with markdown definitions
- All schemas must be valid JSON Schema Draft 2020-12

---

### Task 2.5: Generate Tester Schema Files [P]
**ID**: `T-009`
**Title**: Create JSON Schema files for 3 tester contracts
**Related Requirements**: AC-002, BR-002, C-001
**Dependencies**: T-005
**Deliverable**: 
- `contracts/pack/tester/verification-report.schema.json`
- `contracts/pack/tester/test-scope-report.schema.json`
- `contracts/pack/tester/regression-risk-report.schema.json`

**Implementation Notes**:
- Parse markdown contracts from `specs/005-tester-core/contracts/`
- Handle nested object arrays appropriately

---

### Task 2.6: Generate Reviewer Schema Files [P]
**ID**: `T-010`
**Title**: Create JSON Schema files for 3 reviewer contracts
**Related Requirements**: AC-002, BR-002, C-001
**Dependencies**: T-005
**Deliverable**: 
- `contracts/pack/reviewer/review-findings-report.schema.json`
- `contracts/pack/reviewer/actionable-feedback-report.schema.json`
- `contracts/pack/reviewer/acceptance-decision-record.schema.json`

**Implementation Notes**:
- Parse markdown contracts from `specs/006-reviewer-core/contracts/`
- Include severity level enums where applicable

---

### Task 2.7: Generate Docs Schema Files [P]
**ID**: `T-011`
**Title**: Create JSON Schema files for 2 docs contracts
**Related Requirements**: AC-002, BR-002, C-001
**Dependencies**: T-005
**Deliverable**: 
- `contracts/pack/docs/docs-sync-report.schema.json`
- `contracts/pack/docs/changelog-entry.schema.json`

**Implementation Notes**:
- Parse markdown contracts from `specs/007-docs-core/contracts/`

---

### Task 2.8: Generate Security Schema Files [P]
**ID**: `T-012`
**Title**: Create JSON Schema files for 2 security contracts
**Related Requirements**: AC-002, BR-002, C-001
**Dependencies**: T-005
**Deliverable**: 
- `contracts/pack/security/security-review-report.schema.json`
- `contracts/pack/security/input-validation-review-report.schema.json`

**Implementation Notes**:
- Parse markdown contracts from `specs/008-security-core/contracts/`

---

## Phase 3: Integration / Edge Cases ✅ COMPLETE

### Task 3.1: Create Validation Utility ✅
**ID**: `T-013`
**Status**: Complete
**Title**: Implement `validate-schema.js` utility script
**Related Requirements**: AC-005, BR-006, plan.md Module 3
**Dependencies**: T-002, T-007, T-008, T-009, T-010, T-011, T-012
**Deliverable**: 
- `contracts/pack/validate-schema.js` created
- Validates JSON/YAML artifact against schema
- Returns pass/fail with error details
- Uses Node.js (matches existing tooling)

**Implementation Notes**:
- Basic syntax validation (not full artifact validator)
- Input: artifact_path, schema_id
- Output: ValidationResponse (valid, errors, warnings)
- Handle edge cases: invalid JSON, missing fields, wrong types

---

### Task 3.2: Create Sample Test Artifacts ✅
**ID**: `T-014`
**Status**: Complete
**Title**: Create sample YAML artifacts for validation testing
**Related Requirements**: V-005, AC-005
**Dependencies**: T-007 through T-012
**Deliverable**: 
- Sample valid artifacts for testing validation utility
- Sample invalid artifacts for error case testing
- Located in `contracts/pack/samples/`

**Implementation Notes**:
- Use minimal valid examples from existing contracts
- Create intentional invalid examples (missing fields, wrong types)

---

### Task 3.3: Test Validation Utility ✅
**ID**: `T-015`
**Status**: Complete
**Title**: Run validation utility against sample artifacts
**Related Requirements**: V-005, AC-005
**Dependencies**: T-013, T-014
**Deliverable**: 
- Validation utility tested successfully
- Valid artifacts pass validation
- Invalid artifacts fail with appropriate errors
- Edge cases handled correctly

**Implementation Notes**:
- Test all 17 schema types
- Document validation results

---

### Task 3.4: Schema Parity Verification ✅
**ID**: `T-016`
**Status**: Complete (verified via schema validation)

---

## Phase 4: Validation / Cleanup ✅ COMPLETE

### Task 4.1: Registry Validation [P] ✅
**ID**: `T-017`
**Status**: Complete (AC-001 PASS)
**Title**: Verify schema parity with markdown contracts
**Related Requirements**: BR-002, V-002, AC-002
**Dependencies**: T-007 through T-012
**Deliverable**: 
- Parity verification report
- No missing or extra fields in schemas vs markdown
- All types correctly mapped

**Implementation Notes**:
- Compare each schema against its markdown source
- Check required fields match
- Check field types match
- Report any discrepancies

---

## Phase 4: Validation / Cleanup

### Task 4.1: Registry Validation [P]
**ID**: `T-017`
**Title**: Validate registry completeness and syntax
**Related Requirements**: AC-001, V-001
**Dependencies**: T-006
**Deliverable**: 
- Registry validation passed
- JSON syntax valid
- All 17 contracts present
- All 8 metadata fields per contract
- Self-validates against registry.schema.json

**Implementation Notes**:
- Use JSON.parse() for syntax check
- Use registry.schema.json for schema validation
- Verify total_contracts matches array length

---

### Task 4.2: All Schema Files Validation [P] ✅
**ID**: `T-018`
**Status**: Complete (AC-002 PASS)
**Title**: Validate all 17 schema files for syntax and compliance
**Related Requirements**: AC-002, V-002
**Dependencies**: T-007 through T-012
**Deliverable**: 
- All 17 schemas pass JSON syntax validation
- All schemas pass JSON Schema spec compliance
- Validation results documented

**Implementation Notes**:
- Use ajv or similar validator for JSON Schema compliance
- Check `$schema` field is correct
- Check `type`, `properties`, `required` structure

---

### Task 4.3: Backward Compatibility Verification ✅
**ID**: `T-019`
**Status**: Complete (AC-003 PASS)
**Title**: Verify no changes to existing markdown contracts
**Related Requirements**: AC-003, BR-003, V-003
**Dependencies**: All implementation tasks
**Deliverable**: 
- git diff showing no changes to `specs/*/contracts/*.md`
- Existing validation checklists unchanged
- Backward compatibility report

**Implementation Notes**:
- Run `git diff specs/*/contracts/` to verify no changes
- Check existing validation references still work
- Document backward compatibility status

---

### Task 4.4: Update README Documentation ✅
**ID**: `T-020`
**Status**: Complete
**Title**: Add schema pack reference to README.md
**Related Requirements**: AC-004, NFR-001, V-004
**Dependencies**: T-006, T-017
**Deliverable**: 
- README.md updated with `contracts/pack/` reference
- Schema pack section added
- Discovery instructions included

**Implementation Notes**:
- Add section explaining schema pack purpose
- Reference path: `contracts/pack/`
- Explain machine-readable schema benefits

---

### Task 4.5: Update io-contract.md Documentation ✅
**ID**: `T-021`
**Status**: Complete
**Title**: Add schema pack reference to io-contract.md
**Related Requirements**: AC-004, NFR-001, V-004
**Dependencies**: T-006, T-017
**Deliverable**: 
- `io-contract.md` updated with schema pack reference
- Machine-readable schema section added

**Implementation Notes**:
- Reference registry.json for contract discovery
- Explain schema_path usage for validation
- Note backward compatibility with markdown contracts

---

### Task 4.6: Update skills-usage-guide.md Documentation ✅
**ID**: `T-022`
**Status**: Complete
**Title**: Add schema discovery mention to skills-usage-guide.md
**Related Requirements**: AC-004, V-004
**Dependencies**: T-006
**Deliverable**: 
- `docs/skills-usage-guide.md` updated
- Schema discovery section added

**Implementation Notes**:
- Explain how skills can use schema pack for artifact validation
- Reference validate-schema.js utility

---

### Task 4.7: Create Documentation Migration Guide ✅
**ID**: `T-023`
**Status**: Complete
**Title**: Create migration guide for downstream consumers
**Related Requirements**: spec.md Scope (Documentation Migration Guide)
**Dependencies**: T-006, T-013
**Deliverable**: 
- `contracts/pack/MIGRATION-GUIDE.md` created
- Explains how to adopt machine-readable schemas
- Provides examples of schema usage

**Implementation Notes**:
- Guide for updating downstream references
- Examples of validation workflow
- Backward compatibility notes

---

### Task 4.8: Final Integration Validation ✅
**ID**: `T-024`
**Status**: Complete (AC-001~AC-005 all PASS)
**Title**: Execute end-to-end validation of complete schema pack
**Related Requirements**: AC-001, AC-002, AC-003, AC-004, AC-005
**Dependencies**: All Phase 4 tasks
**Deliverable**: 
- All acceptance criteria verified
- Integration validation report
- Feature completion confirmed

**Implementation Notes**:
- Run through all AC-001 through AC-005 checks
- Document validation results
- Prepare for spec-audit

---

### Task 4.9: Governance Sync Check ✅
**ID**: `T-025`
**Status**: Complete (All governance docs consistent)
**Title**: Verify governance document consistency per AGENTS.md
**Related Requirements**: AGENTS.md Governance Sync Rule, AH-001
**Dependencies**: T-020, T-021, T-022
**Deliverable**: 
- README.md updated
- io-contract.md updated
- skills-usage-guide.md updated
- All governance documents consistent

**Implementation Notes**:
- Check README references schema pack
- Check io-contract.md references schema pack
- Verify no governance conflicts

---

## Task Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1 | 4 tasks | ✅ Complete |
| Phase 2 | 8 tasks | ✅ Complete |
| Phase 3 | 4 tasks | ✅ Complete |
| Phase 4 | 9 tasks | ✅ Complete |
| **Total** | **25 tasks** | **✅ All Complete** |

---

## Parallel Execution Groups

### Group A: Directory Setup (Sequential)
- T-001 → T-002, T-003, T-004

### Group B: Metadata Extraction (Sequential)
- T-005 → T-006 (registry)

### Group C: Schema Generation (Parallel after T-005)
- T-007, T-008, T-009, T-010, T-011, T-012 (all parallel after T-005)

### Group D: Validation Setup (Sequential)
- T-013 → T-014 → T-015 → T-016

### Group E: Final Validation (Parallel)
- T-017, T-018 parallel after all schemas complete
- T-019 → T-020 → T-021, T-022, T-023 parallel
- T-024 → T-025

---

## Recommended Execution Order

1. **T-001**: Create directory structure (foundation)
2. **T-002, T-003**: Create schema definitions (parallel)
3. **T-004**: Create pack version file
4. **T-005**: Extract metadata (enables parallel schema generation)
5. **T-007, T-008, T-009, T-010, T-011, T-012**: Generate all schemas (parallel)
6. **T-006**: Build registry (after metadata ready)
7. **T-013**: Create validation utility
8. **T-014, T-015**: Test validation
9. **T-016**: Verify schema parity
10. **T-017, T-018**: Validate registry and schemas (parallel)
11. **T-019**: Verify backward compatibility
12. **T-020, T-021, T-022**: Update documentation (parallel)
13. **T-023**: Create migration guide
14. **T-024**: Final integration validation
15. **T-025**: Governance sync check

---

## References

- `specs/017-contract-schema-pack/spec.md` - Source specification
- `specs/017-contract-schema-pack/plan.md` - Implementation plan
- `specs/017-contract-schema-pack/data-model.md` - Data model definitions
- `specs/*/contracts/*.md` - Source markdown contracts (17 files)