# Feature: 017-contract-schema-pack

## Background

The OpenCode expert package has completed 16 features (001-016), establishing a comprehensive 6-role execution model with 37 skills and 17 artifact contracts. Each artifact contract is defined in individual markdown files under `specs/*/contracts/` directories, providing detailed schemas, validation rules, and examples.

**Current State**:
- 17 artifact contracts scattered across 6 role-specific directories
- Each contract has rich documentation but no machine-readable schema format
- No unified index or single reference for all contract schemas
- Downstream consumers must search multiple directories to find contract definitions

**Problem**:
- Contract discovery requires navigating multiple nested directories
- No single source of truth for "all available contracts"
- Machine-readable schemas absent - validation tools must parse markdown
- Contract version tracking is distributed, making audits harder

---

## Goal

Create a unified Contract Schema Pack that:
1. Consolidates all 17 artifact contracts into a single, discoverable location
2. Provides machine-readable schema definitions (JSON/YAML) for automated validation
3. Establishes a contract registry with metadata for each contract
4. Enables downstream systems to programmatically discover and validate contracts
5. Maintains backward compatibility with existing contract markdown documentation

---

## Scope

### In Scope

| Item | Description |
|------|-------------|
| Contract Registry | Unified index of all 17 artifact contracts with metadata |
| Schema Pack Directory | Centralized location for all contract schemas |
| Machine-Readable Schemas | JSON/YAML schema files for each contract |
| Schema Versioning | Version tracking per contract in registry |
| Validation Library | Basic validation utilities for schema compliance |
| Documentation Migration Guide | Guide for updating downstream references |

### Contract Coverage

| Role | Contracts | Count |
|------|-----------|-------|
| architect | design-note, open-questions, risks-and-tradeoffs, module-boundaries | 4 |
| developer | implementation-summary, self-check-report, bugfix-report | 3 |
| tester | verification-report, test-scope-report, regression-risk-report | 3 |
| reviewer | review-findings-report, actionable-feedback-report, acceptance-decision-record | 3 |
| docs | docs-sync-report, changelog-entry | 2 |
| security | security-review-report, input-validation-review-report | 2 |
| **Total** | | **17** |

### Out of Scope

| Item | Reason |
|------|--------|
| Contract content changes | No modification to contract field definitions |
| New contracts | Only existing 17 contracts are packed |
| io-contract.md changes | Separate governance document, not an artifact contract |
| Runtime validation service | This pack provides schemas, not a runtime validator |
| Breaking changes to markdown | Existing markdown contracts remain unchanged |

---

## Actors

| Actor | Role |
|-------|------|
| architect | Design the schema pack structure, registry format, and validation approach |
| developer | Implement the schema pack directory, JSON/YAML schema files, registry |
| tester | Validate schema pack completeness, schema syntax correctness |
| reviewer | Review schema pack alignment with governance docs, consistency |
| docs | Update README and documentation to reference new schema pack |

---

## Core Workflows

### Workflow 1: Schema Pack Creation

```
1. architect designs:
   - Schema pack directory structure
   - Registry format (JSON schema for registry itself)
   - Machine-readable schema format per contract
   - Naming conventions and file organization

2. developer implements:
   - Creates `contracts/pack/` directory structure
   - Extracts schema definitions from each markdown contract
   - Creates JSON/YAML schema files per contract
   - Creates registry.json with all contract metadata
   - Creates validation utilities for schema compliance

3. tester validates:
   - Verifies all 17 contracts have schema files
   - Validates JSON/YAML syntax correctness
   - Tests validation utilities with sample artifacts
   - Checks registry completeness

4. reviewer reviews:
   - Reviews schema pack against governance docs
   - Checks backward compatibility
   - Validates naming consistency

5. docs updates:
   - Updates README to reference schema pack
   - Updates skills-usage-guide to mention schema discovery
```

### Workflow 2: Contract Discovery

```
1. Downstream system queries registry.json
2. Registry returns contract metadata (role, version, path)
3. System loads specific schema file for validation
4. System validates artifact against schema
```

---

## Business Rules

### BR-001: Single Source of Truth for Registry
The contract registry (`registry.json`) is the authoritative source for contract metadata. All downstream systems must query this registry for contract discovery.

### BR-002: Schema Parity with Markdown
Each machine-readable schema must accurately reflect the corresponding markdown contract definition. No schema fields may be added, removed, or changed from the markdown source.

### BR-003: Backward Compatibility
Existing markdown contracts remain unchanged. Downstream references to markdown contracts continue to work. The schema pack is additive, not replacing.

### BR-004: Version Tracking
Each contract in the registry includes its version (matching markdown contract version). Schema pack version is tracked separately in pack-version.json.

### BR-005: Governance Alignment
Schema pack directory structure and naming follows 6-role model (architect, developer, tester, reviewer, docs, security).

### BR-006: Validation Utility Scope
Validation utilities are basic schema syntax checkers, not full artifact validators. Full validation remains in role-specific validation checklists.

---

## Non-functional Requirements

### NFR-001: Discoverability
The schema pack location must be documented in README and referenced in io-contract.md. Path: `contracts/pack/`.

### NFR-002: Machine-Readable Format
Schema files use JSON Schema (Draft 2020-12) format, which is widely supported by validation tools.

### NFR-003: Registry Completeness
Registry includes all 17 contracts with: contract_id, contract_name, producer_role, consumer_roles, version, schema_path, markdown_path, description.

### NFR-004: Minimal Size Impact
Schema files are concise, focusing on field definitions without examples. Examples remain in markdown contracts.

---

## Acceptance Criteria

### AC-001: Contract Registry Complete
- [ ] registry.json exists with all 17 contracts listed
- [ ] Each contract entry has all required metadata fields
- [ ] Registry JSON syntax is valid

### AC-002: All Schemas Generated
- [ ] All 17 contracts have corresponding .schema.json files
- [ ] Schema files accurately reflect markdown contract definitions
- [ ] Schema JSON syntax is valid (passes JSON Schema validation)

### AC-003: Backward Compatibility Verified
- [ ] Existing markdown contracts unchanged
- [ ] Existing validation checklists still reference markdown contracts
- [ ] No breaking changes to downstream consumers

### AC-004: Documentation Updated
- [ ] README references schema pack location
- [ ] io-contract.md references schema pack for machine-readable schemas
- [ ] docs/skills-usage-guide.md mentions schema discovery

### AC-005: Validation Utilities Available
- [ ] Basic schema syntax validation utility provided
- [ ] Utility validates JSON/YAML artifact against schema
- [ ] Utility returns pass/fail with error details

---

## Assumptions

| ID | Assumption | Risk if Wrong |
|----|------------|---------------|
| A-001 | All 17 markdown contracts are stable and complete | Incomplete contracts would cause schema inconsistencies |
| A-002 | JSON Schema Draft 2020-12 is acceptable format | Tools may not support newer draft features |
| A-003 | Downstream consumers will adopt machine-readable schemas over time | Dual maintenance burden if both formats required |
| A-004 | No immediate need for schema migration | Migration effort underestimated if needed urgently |
| A-005 | Contract field types are simple enough for JSON Schema | Complex nested types may need custom validation |

---

## Open Questions

| ID | Question | Impact | Temporary Assumption |
|----|----------|--------|---------------------|
| Q-001 | Should schemas be JSON or YAML? | File format, tool compatibility | JSON (JSON Schema standard) |
| Q-002 | Should validation utilities be in Python or Node? | Implementation language | Node (matches existing tooling) |
| Q-003 | Should registry be split by role or unified? | Directory organization | Unified registry with role metadata |
| Q-004 | How to handle schema version updates? | Maintenance workflow | Manual update with version increment |
| Q-005 | Should markdown contracts reference schemas? | Documentation linkage | Yes, add schema reference in markdown header |

---

## References

- `io-contract.md` - I/O contract specification
- `specs/*/contracts/*.md` - Existing 17 artifact contracts
- `package-spec.md` - Package governance
- `role-definition.md` - 6-role definitions