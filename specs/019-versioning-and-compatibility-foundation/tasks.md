# Tasks: 019-versioning-and-compatibility-foundation

## Metadata
```yaml
feature_id: 019-versioning-and-compatibility-foundation
feature_name: 版本化与兼容性治理基础
tasks_version: 1.0.0
created_at: 2026-03-28
status: Draft
depends_on: [016-release-preparation, 017-contract-schema-pack, 018-template-and-bootstrap-foundation]
```

---

## Phase 1: Setup / Prerequisites

### T-001: Verify Existing Version Infrastructure [P]
**Scope**: Check existing version-related files before enhancement
**Refs**: spec.md NFR-001, plan.md "Existing Artifacts to Preserve"
**Validation**: Files exist and are readable

**Steps**:
1. Verify `package-lifecycle.md` exists and contains "Current Version" section
2. Verify `contracts/pack/registry.json` exists with `pack_version` field
3. Verify `templates/pack/pack-version.json` exists with `version` field
4. Verify `CHANGELOG.md` exists and follows current format
5. Verify `specs/016-release-preparation/release-checklist.md` exists
6. Verify `docs/audit-hardening.md` exists with AH-001~AH-006 rules
7. Create verification report in `specs/019/infra-check-report.md`

**Deliverable**: `specs/019-versioning-and-compatibility-foundation/infra-check-report.md`

---

### T-002: Create docs/migration Directory [P]
**Scope**: Establish migration guide storage directory
**Refs**: spec.md NFR-003, data-model.md "Migration Guide Document Structure"

**Steps**:
1. Create directory `docs/migration/`
2. Create README.md in docs/migration/ explaining directory purpose
3. Verify directory is empty (no legacy migration guides exist)

**Deliverable**: `docs/migration/` directory + `docs/migration/README.md`

---

### T-003: Validate Schema Validation Tool Availability [P]
**Scope**: Ensure existing validate-schema.js can validate JSON schemas
**Refs**: plan.md "JSON Schema Validation", data-model.md "Schema Validation Implementation"

**Steps**:
1. Verify `contracts/pack/validate-schema.js` exists
2. Test validation tool with sample JSON against existing schema
3. Document tool usage in task notes

**Deliverable**: Tool verification notes in task completion

---

## Phase 2: Core Implementation

### T-004: Create VERSIONING.md - Section 1: Version Object Definitions
**Scope**: Define 5 version objects (package, contract, template, profile, tooling)
**Refs**: spec.md BR-001, AC-001, plan.md "Module 1"

**Steps**:
1. Create `VERSIONING.md` file in repository root
2. Write Section 1: Version Object Definitions
   - Package Version (primary)
   - Contract Pack Version (derived)
   - Template Pack Version (derived)
   - Profile Version (derived)
   - Tooling Version (independent)
3. Include version number format (SemVer)
4. Reference spec.md BR-001 for hierarchy

**Deliverable**: `VERSIONING.md` Section 1

---

### T-005: Create VERSIONING.md - Section 2: Version Object Hierarchy
**Scope**: Define hierarchical relationship between version objects
**Refs**: spec.md BR-001, plan.md "Module 1" Structure

**Steps**:
1. Write Section 2: Version Object Hierarchy
2. Create ASCII diagram showing hierarchy (per data-model.md diagram)
3. Define inheritance rules:
   - Package Version change triggers derived version sync
   - Contract Pack can independent PATCH
   - Template Pack can independent MINOR (new profiles)
   - Tooling independent versioning

**Deliverable**: `VERSIONING.md` Section 2

---

### T-006: Create VERSIONING.md - Section 3.1: Package Version SemVer Rules
**Scope**: Define BR-002 SemVer trigger conditions for Package Version
**Refs**: spec.md BR-002, AC-002

**Steps**:
1. Write Section 3.1: Package Version SemVer
2. Create trigger condition table:
   - MAJOR triggers (role removal, contract field removal, command removal)
   - MINOR triggers (new role, new skill, new command, optional field)
   - PATCH triggers (skill fix, template fix, doc fix)
3. Include concrete examples from spec.md BR-002

**Deliverable**: `VERSIONING.md` Section 3.1

---

### T-007: Create VERSIONING.md - Section 3.2-3.5: Derived SemVer Rules [P]
**Scope**: Define SemVer rules for Contract Pack, Template Pack, Profile, Tooling
**Refs**: spec.md BR-003~BR-006, AC-002

**Parallel Tasks**:
- T-007a: Contract Pack Version SemVer (BR-003)
- T-007b: Template Pack Version SemVer (BR-004)
- T-007c: Profile Version SemVer (BR-005)
- T-007d: Tooling Version SemVer (BR-006)

**Each Subtask Steps**:
1. Write corresponding section
2. Create trigger condition table per spec.md
3. Include concrete examples

**Deliverable**: `VERSIONING.md` Sections 3.2-3.5

---

### T-008: Create VERSIONING.md - Section 4: Version Number Storage Locations
**Scope**: Define where each version number is stored
**Refs**: spec.md NFR-001, data-model.md "Entity 2: Version Number Storage"

**Steps**:
1. Write Section 4: Version Number Storage Locations
2. Create mapping table:
   - Package Version → package-lifecycle.md "Current Version"
   - Contract Pack Version → contracts/pack/registry.json pack_version
   - Template Pack Version → templates/pack/pack-version.json version
3. Include current values (note: Package needs update from 0.1.0-MVP to 1.0.0)

**Deliverable**: `VERSIONING.md` Section 4

---

### T-009: Create VERSIONING.md - Section 5: Docs Sync Rules
**Scope**: Define BR-011 document synchronization rules
**Refs**: spec.md BR-011, AC-007, plan.md "BR-011 in VERSIONING.md"

**Steps**:
1. Write Section 5: Docs Sync Rules
2. Create sync trigger table from spec.md BR-011:
   - README.md sync on MINOR/MAJOR
   - package-lifecycle.md sync on any version
   - package-spec.md sync on MINOR/MAJOR
   - io-contract.md sync on MAJOR
   - registry.json sync on Contract change
   - pack-version.json sync on Template change
3. Link to AGENTS.md Governance Sync Rule

**Deliverable**: `VERSIONING.md` Section 5

---

### T-010: Create VERSIONING.md - Section 6-7: Workflow & References
**Scope**: Complete VERSIONING.md with workflow and references
**Refs**: spec.md "Core Workflows", plan.md "Module 1" Structure

**Steps**:
1. Write Section 6: Version Planning Workflow (per spec.md Workflow 1)
2. Write Section 7: References
   - Link to package-lifecycle.md
   - Link to compatibility-matrix.json
   - Link to SemVer specification
3. Add document header with purpose statement

**Deliverable**: Complete `VERSIONING.md`

---

### T-011: Create compatibility-matrix.schema.json
**Scope**: Define JSON Schema for compatibility matrix
**Refs**: spec.md BR-007, AC-003, data-model.md "Entity 1: Compatibility Matrix"

**Steps**:
1. Create `compatibility-matrix.schema.json` in repository root
2. Include `$schema` pointing to JSON Schema Draft 2020-12
3. Define schema structure per data-model.md:
   - matrix_id, created_at, updated_at
   - versions array (version_descriptor)
   - compatibility_entries array
   - $defs for version_descriptor, compatibility_entry, profile_compatibility
4. Add SemVer pattern validation
5. Add migration_guide path pattern validation

**Deliverable**: `compatibility-matrix.schema.json`

---

### T-012: Create compatibility-matrix.json - v1.0.0 Baseline
**Scope**: Create initial compatibility matrix with v1.0.0 data
**Refs**: spec.md AC-003, data-model.md "Initial Data Example"

**Steps**:
1. Create `compatibility-matrix.json` in repository root
2. Add `$schema` reference to compatibility-matrix.schema.json
3. Add matrix metadata (matrix_id, created_at, updated_at)
4. Add v1.0.0 version_descriptor:
   - package_version: "1.0.0"
   - contract_pack_version: "1.0.0"
   - template_pack_version: "1.0.0"
   - profiles: ["minimal", "full"]
   - node_version: ">=18.0.0"
   - status: "released"
5. Add self-compatibility entry for v1.0.0

**Deliverable**: `compatibility-matrix.json`

---

### T-013: Validate Compatibility Matrix JSON Schema
**Scope**: Validate both JSON files against schema
**Refs**: plan.md "JSON Schema Validation", data-model.md "Schema Validation Implementation"

**Steps**:
1. Run validate-schema.js against compatibility-matrix.json
2. Verify all required fields present
3. Verify version_reference integrity (from/to refs exist in versions)
4. Verify status-migration consistency rules
5. Document validation results

**Deliverable**: Validation success documentation

---

### T-014: Create docs/templates/migration-guide-template.md
**Scope**: Create reusable migration guide template
**Refs**: spec.md BR-009, AC-004, data-model.md "Migration Guide Document Structure"

**Steps**:
1. Create `docs/templates/migration-guide-template.md`
2. Include required sections per BR-009:
   - Upgrade Path (From/To version)
   - Breaking Changes (list with impact)
   - Step-by-Step Instructions
   - Validation Steps (post-migration checklist)
   - Rollback Instructions (optional but recommended)
3. Add template usage instructions
4. Add placeholder examples

**Deliverable**: `docs/templates/migration-guide-template.md`

---

### T-015: Create docs/migration/v0-to-v1.md
**Scope**: Create concrete migration guide for v0.x to v1.0.0
**Refs**: spec.md AC-004, package-lifecycle.md "Migration Notes"

**Steps**:
1. Create `docs/migration/v0-to-v1.md`
2. Extract existing migration notes from package-lifecycle.md:
   - Directory structure adjustment (3-skill to 6-role)
   - AGENTS.md update points
   - Command parameter format changes
3. Add breaking changes section (3-skill deprecation)
4. Add step-by-step migration steps
5. Add validation steps (run doctor, verify skills)
6. Add rollback instructions

**Deliverable**: `docs/migration/v0-to-v1.md`

---

## Phase 3: Integration / Edge Cases

### T-016: Create docs/validation/release-checklist-enhanced.md
**Scope**: Create enhanced release checklist with SemVer and Audit integration
**Refs**: spec.md BR-010, AC-005, plan.md "Module 4"

**Steps**:
1. Create `docs/validation/release-checklist-enhanced.md`
2. Include sections:
   - 1. Version Planning (change analysis, SemVer judgment)
   - 2. SemVer Verification (per-object trigger condition check)
   - 3. Compatibility Matrix Update
   - 4. Governance Audit (AH-001~AH-006 explicit steps)
   - 5. Docs Sync (per BR-011)
   - 6. Contract & Template Verification
3. Reference existing release-checklist.md as baseline

**Deliverable**: `docs/validation/release-checklist-enhanced.md`

---

### T-017: Create docs/ci-integration-points.md
**Scope**: Define CI integration points (not implement)
**Refs**: spec.md NFR-005, AC-008, plan.md "Module 5"

**Steps**:
1. Create `docs/ci-integration-points.md`
2. Define integration points:
   - scripts/validate-version.sh - version format validation
   - scripts/validate-compatibility.sh - matrix validation
   - scripts/validate-changelog.sh - CHANGELOG format validation
3. Document each script's expected behavior
4. Mark status as "Defined, not implemented"
5. Link to future implementation roadmap

**Deliverable**: `docs/ci-integration-points.md`

---

### T-018: Update package-lifecycle.md SemVer Section [P]
**Scope**: Enhance existing SemVer section with formal trigger conditions
**Refs**: spec.md D-007, plan.md "T-014"

**Steps**:
1. Update "Versioning Strategy" section
2. Replace coarse MAJOR/MINOR/PATCH definitions with:
   - Link to VERSIONING.md for detailed rules
   - Keep summary definitions for readability
3. Update "Current Version" from "0.1.0-MVP" to "1.0.0"
4. Add reference to compatibility-matrix.json
5. Add reference to VERSIONING.md

**Deliverable**: Updated `package-lifecycle.md`

---

### T-019: Update CHANGELOG.md with Feature 019 Entry [P]
**Scope**: Add 019 feature to CHANGELOG with proper format
**Refs**: spec.md BR-008, AC-006, D-008

**Steps**:
1. Add new version section [1.0.0] or update existing
2. Add entries under appropriate categories:
   - Added: VERSIONING.md, compatibility-matrix.json, migration framework
   - Added: docs/validation/release-checklist-enhanced.md
3. Mark affected version objects: [Package], [Contract], [Template]
4. Ensure format follows BR-008:
   - Version number format strict
   - Categories clear (Added/Changed/Fixed)
   - Version object annotations

**Deliverable**: Updated `CHANGELOG.md`

---

### T-020: Update README.md Versioning Section [P]
**Scope**: Add versioning system description to README
**Refs**: spec.md AC-009, D-009, AGENTS.md "Governance Sync Rule"

**Steps**:
1. Add new section "Versioning & Compatibility" after "System Position"
2. Include:
   - Reference to VERSIONING.md for details
   - Brief explanation of 5 version objects
   - Reference to compatibility-matrix.json
   - How to query compatibility
3. Update Feature Status table to include 019
4. Ensure governance alignment per AH-005

**Deliverable**: Updated `README.md`

---

### T-021: Align with AGENTS.md Governance Sync Rule
**Scope**: Ensure VERSIONING.md is referenced in governance rules
**Refs**: AGENTS.md "Governance Sync Rule", plan.md "Governance Constraints"

**Steps**:
1. Review AGENTS.md "Governance Sync Rule" section
2. Verify VERSIONING.md is in required sync check list
3. If needed, add VERSIONING.md to governance document list
4. Verify no conflict with existing governance rules

**Deliverable**: AGENTS.md alignment verification

---

## Phase 4: Validation / Cleanup

### T-022: Validate JSON Schema Compliance [P]
**Scope**: Run schema validation on all new JSON files
**Refs**: spec.md AC-010, data-model.md "Data Validation Rules"

**Steps**:
1. Validate compatibility-matrix.json against compatibility-matrix.schema.json
2. Validate contracts/pack/registry.json (ensure unchanged)
3. Validate templates/pack/pack-version.json (ensure unchanged)
4. Document all validation results
5. Fix any validation errors found

**Deliverable**: JSON validation report

---

### T-023: Validate Path Resolution [P]
**Scope**: Verify all declared paths resolve to actual files
**Refs**: spec.md AC-010, plan.md "AH-003: Path Resolution"

**Steps**:
1. Check VERSIONING.md references resolve
2. Check compatibility-matrix.json $schema resolves
3. Check migration guide paths in matrix resolve
4. Check release-checklist references resolve
5. Document any broken paths and fix

**Deliverable**: Path resolution verification report

---

### T-024: Run AH-001~AH-006 Governance Audit
**Scope**: Execute full governance audit on deliverables
**Refs**: spec.md AC-009, plan.md "Validation Strategy", docs/audit-hardening.md

**Steps**:
1. Run AH-001: Canonical Comparison
   - VERSIONING.md vs role-definition.md/package-spec.md
2. Run AH-002: Cross-Document Consistency
   - VERSIONING.md, CHANGELOG.md, README.md flow consistency
3. Run AH-003: Path Resolution
   - All declared paths exist
4. Run AH-004: Status Truthfulness
   - No partial completion misreported as complete
5. Run AH-005: README Governance Status
   - README reflects versioning system
6. Run AH-006: Enhanced Reviewer Responsibilities
   - Version compliance checks defined

**Deliverable**: AH audit report

---

### T-025: Validate Migration Guide Template Usability
**Scope**: Verify migration guide template can be used for future migrations
**Refs**: spec.md AC-004, plan.md "Migration Guide Template Usability"

**Steps**:
1. Review template contains all BR-009 required sections
2. Test template by creating hypothetical v1.0-to-v1.1 guide (draft)
3. Verify template structure is clear and reusable
4. Document template usability assessment

**Deliverable**: Template usability review

---

### T-026: Validate Release Checklist Completeness
**Scope**: Verify enhanced release checklist covers all requirements
**Refs**: spec.md AC-005, plan.md "Release Checklist Completeness"

**Steps**:
1. Verify checklist includes SemVer verification steps
2. Verify checklist includes compatibility matrix update steps
3. Verify checklist includes AH-001~AH-006 steps (explicit)
4. Verify checklist includes Migration Guide writing steps
5. Verify checklist includes docs sync steps
6. Verify checklist includes Contract/Template verification

**Deliverable**: Release checklist completeness review

---

### T-027: Create Completion Report
**Scope**: Document feature completion with deliverables and findings
**Refs**: spec.md Acceptance Criteria, docs/templates/completion-report-template.md

**Steps**:
1. Create `specs/019-versioning-and-compatibility-foundation/completion-report.md`
2. List all deliverables with paths
3. Map deliverables to AC items
4. Document any known gaps or partial completions
5. Document audit findings (from T-024)
6. Include validation results summary

**Deliverable**: `specs/019-versioning-and-compatibility-foundation/completion-report.md`

---

### T-028: Final Sign-off
**Scope**: Confirm all acceptance criteria met and feature complete
**Refs**: All AC items

**Steps**:
1. Review AC-001: Version Objects Defined ✓
2. Review AC-002: SemVer Rules Complete ✓
3. Review AC-003: Compatibility Matrix Implemented ✓
4. Review AC-004: Migration Guide Framework Established ✓
5. Review AC-005: Release Checklist Enhanced ✓
6. Review AC-006: Changelog Discipline Enhanced ✓
7. Review AC-007: Docs Sync Rules Implemented ✓
8. Review AC-008: Audit/CI Integration Points Defined ✓
9. Review AC-009: Governance Alignment ✓
10. Review AC-010: Validation Complete ✓
11. Update spec.md status to "Complete"

**Deliverable**: Feature status update

---

## Task Summary

| Phase | Tasks | Parallelizable |
|-------|-------|----------------|
| Phase 1 | T-001, T-002, T-003 | 3 tasks [P] |
| Phase 2 | T-004-T-015 | T-007 [P], T-007a-d [P] |
| Phase 3 | T-016-T-021 | T-018, T-019, T-020 [P] |
| Phase 4 | T-022-T-028 | T-022, T-023 [P] |

**Total Tasks**: 28 (including 4 subtasks in T-007)

---

## Dependency Graph

```
T-001 [P] ─────────────────────────────────────────────────────┐
T-002 [P] ─────────────────────────────────────────────────────┤
T-003 [P] ─────────────────────────────────────────────────────┤
                                                                │
T-004 ──► T-005 ──► T-006 ──► T-007 [P] ──► T-008 ──► T-009 ──► T-010◄─┘
                                        │
                                        ├─► T-007a
                                        ├─► T-007b
                                        ├─► T-007c
                                        └─► T-007d

T-011 ──► T-012 ──► T-013

T-014 ──► T-015

T-016 ──► T-017

T-018 [P] ──►
T-019 [P] ──► T-021
T-020 [P] ──►

T-022 [P] ──► T-024
T-023 [P] ──► T-024

T-024 ──► T-025 ──► T-026 ──► T-027 ──► T-028
```

---

## Notes

### Parallel Execution Guidance
- Phase 1 tasks (T-001, T-002, T-003) can run in parallel as they verify/create independent infrastructure
- T-007 subtasks (a-d) can run in parallel as they write independent sections
- T-018, T-019, T-020 can run in parallel as they update independent governance documents
- T-022, T-023 can run in parallel as they validate independent aspects

### Critical Path
- VERSIONING.md creation (T-004-T-010) is critical path
- Governance audit (T-024) must complete before sign-off

### Risk Mitigation
- If AH-001~AH-006 audit finds issues, create remediation tasks before T-028
- If JSON validation fails, fix schema/data before proceeding to T-024

---

## References

- `specs/019-versioning-and-compatibility-foundation/spec.md` - Feature specification
- `specs/019-versioning-and-compatibility-foundation/plan.md` - Implementation plan
- `specs/019-versioning-and-compatibility-foundation/data-model.md` - Data model definition
- `docs/templates/completion-report-template.md` - Completion report format
- `docs/audit-hardening.md` - AH-001~AH-006 audit rules