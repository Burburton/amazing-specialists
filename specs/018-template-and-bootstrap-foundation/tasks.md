# Tasks: 018-template-and-bootstrap-foundation

## Phase 1: Setup / Prerequisites

### T-001: Create Template Pack Root Structure [P]
**Related**: AC-001, BR-001, M1 (plan.md)
**Deliverable**: `templates/` directory with pack/, cli/, and documentation placeholders

- Create `templates/` root directory
- Create `templates/pack/` subdirectory
- Create `templates/cli/` subdirectory
- Create placeholder files for documentation (USAGE.md, PROFILE-COMPARISON.md, UPGRADE-STRATEGY.md)

### T-002: Define Template Content Classification [P]
**Related**: BR-002, BR-007, data-model.md (Content Classification Data)
**Deliverable**: Content classification JSON manifest for CLI consumption

- Create `templates/pack/content-index.json` defining:
  - Required files list (minimal profile)
  - Optional files list (full profile additions)
  - Source-only exclusion patterns
  - Extension file patterns (never modified)

### T-003: Create pack-version.json [P]
**Related**: BR-005, E2 (data-model.md), NFR-005
**Deliverable**: `templates/pack/pack-version.json` with initial version 1.0.0

- Create pack-version.json with:
  - version: "1.0.0"
  - release_date
  - profiles metadata (minimal/full file counts, skills counts)
  - breaking_changes (empty array for initial)
  - checksum placeholder

### T-004: Create manifest-template.json [P]
**Related**: BR-005, E1 (data-model.md), AC-002
**Deliverable**: `templates/pack/manifest-template.json` template file

- Create manifest-template.json with:
  - Schema reference
  - Required fields placeholders
  - Example values with comments

---

## Phase 2: Core Implementation

### M1: Template Pack Module

#### T-005: Create Minimal Profile Directory Structure [P]
**Related**: AC-001, BR-002, NFR-002, minimal_required (data-model.md)
**Deliverable**: `templates/pack/minimal/` with all required files

- Create `templates/pack/minimal/` directory
- Create subdirectories:
  - `.opencode/commands/`
  - `.opencode/skills/` (6-role MVP structure)
  - `contracts/pack/`
- Verify minimal profile target: ~50 files

#### T-006: Copy Core Commands to Minimal Profile [P]
**Related**: AC-001, BR-002, spec.md (Template Content Classification)
**Dependency**: T-005 complete
**Deliverable**: 5 core command files in minimal profile

- Copy `.opencode/commands/spec-start.md` to minimal
- Copy `.opencode/commands/spec-plan.md` to minimal
- Copy `.opencode/commands/spec-tasks.md` to minimal
- Copy `.opencode/commands/spec-implement.md` to minimal
- Copy `.opencode/commands/spec-audit.md` to minimal

#### T-007: Copy MVP Skills to Minimal Profile [P]
**Related**: AC-001, BR-002, 21 MVP skills per spec.md
**Dependency**: T-005 complete
**Deliverable**: 21 MVP skill directories in minimal profile

- Copy `.opencode/skills/common/` (5 skills)
- Copy `.opencode/skills/architect/` MVP skills only (3)
- Copy `.opencode/skills/developer/` MVP skills only (3)
- Copy `.opencode/skills/tester/` MVP skills only (3)
- Copy `.opencode/skills/reviewer/` MVP skills only (3)
- Copy `.opencode/skills/docs/` MVP skills only (2)
- Copy `.opencode/skills/security/` MVP skills only (2)
- Exclude M4 skills from minimal

#### T-008: Copy Governance Files to Minimal Profile [P]
**Related**: AC-001, BR-002, AC-004 D002
**Dependency**: T-005 complete
**Deliverable**: Governance files in minimal profile

- Copy `AGENTS.md` to minimal
- Copy `package-spec.md` to minimal
- Copy `role-definition.md` to minimal
- Copy `io-contract.md` to minimal
- Copy `quality-gate.md` to minimal
- Copy `collaboration-protocol.md` to minimal

#### T-009: Copy Contract Registry to Minimal Profile [P]
**Related**: AC-007, BR-008, AC-004 D006
**Dependency**: T-005 complete
**Deliverable**: `contracts/pack/registry.json` in minimal profile

- Copy `contracts/pack/registry.json` to minimal
- Verify registry parses correctly
- Exclude schema JSON files (full profile only)

#### T-010: Create Minimal .gitignore Template [P]
**Related**: Q-008 resolution (spec.md)
**Dependency**: T-005 complete
**Deliverable**: `.gitignore` template in minimal profile

- Create `.gitignore` with:
  - Node.js patterns
  - artifacts/ output patterns
  - Common IDE patterns
  - Template-specific exclusions

#### T-011: Create Full Profile Directory Structure [P]
**Related**: AC-001, NFR-003, M1 (plan.md)
**Dependency**: T-005 through T-010 complete
**Deliverable**: `templates/pack/full/` with minimal + optional content

- Create `templates/pack/full/` directory
- Copy all minimal profile content to full (inherit base)
- Create additional subdirectories:
  - `docs/templates/`
  - `docs/rules/`
  - `docs/validation/`
  - `docs/traceability/`
  - `examples/`
- Verify full profile target: ~150 files

#### T-012: Copy M4 Skills to Full Profile [P]
**Related**: AC-001, NFR-003, 16 M4 skills per spec.md
**Dependency**: T-011 complete
**Deliverable**: M4 skills added to full profile

- Copy architect M4: interface-contract-design, migration-planning
- Copy developer M4: refactor-safely, dependency-minimization
- Copy tester M4: integration-test-design, flaky-test-diagnosis, performance-test-design, benchmark-analysis, load-test-orchestration, performance-regression-analysis
- Copy reviewer M4: maintainability-review, risk-review
- Copy docs M4: architecture-doc-sync, user-guide-update
- Copy security M4: secret-handling-review, dependency-risk-review

#### T-013: Copy Documentation Templates to Full Profile [P]
**Related**: AC-001, NFR-003, docs/templates/ (data-model.md)
**Dependency**: T-011 complete
**Deliverable**: Documentation template files in full profile

- Copy `docs/templates/` (9 templates) to full
- Copy `docs/rules/` (3 rules files) to full
- Copy `docs/validation/` (2 validation files) to full
- Copy `docs/traceability/` (2 traceability files) to full
- Copy `docs/enhanced-mode-guide.md` to full

#### T-014: Copy Contract Schemas to Full Profile [P]
**Related**: AC-007, BR-008, contracts/pack/*.schema.json
**Dependency**: T-011 complete
**Deliverable**: 17 contract schema files in full profile

- Copy all `contracts/pack/*.schema.json` files to full
- Verify schema count matches registry.json

### M2: CLI Module

#### T-015: Create CLI Shared Utilities Library
**Related**: M2 (plan.md), Error Handling (plan.md)
**Deliverable**: `templates/cli/lib/` with utility modules

- Create `templates/cli/lib/` directory
- Implement `lib/manifest.js`:
  - readManifest(targetDir)
  - generateManifest(profile, targetDir, options)
  - updateManifest(targetDir, changes)
- Implement `lib/version.js`:
  - compareVersions(source, instance)
  - getPackVersion()
- Implement `lib/files.js`:
  - copyDirectory(src, dest, options)
  - syncFiles(profile, targetDir)
  - detectConflicts(targetDir, templateFiles)
- Implement `lib/errors.js`:
  - Error codes E001-E006
  - Error formatting functions

#### T-016: Implement init.js Command
**Related**: AC-002, init Command (spec.md), Flow 1 (plan.md)
**Dependency**: T-015 complete
**Deliverable**: `templates/cli/init.js` executable

- Implement argument parsing (--profile, --force)
- Implement target directory validation
- Implement profile selection logic
- Implement file copy from templates/pack/{profile}/
- Implement placeholder directory creation (specs/, artifacts/)
- Implement manifest generation
- Implement success output formatting
- Implement error handling (E001, E002, E003)

#### T-017: Implement install.js Command
**Related**: AC-003, install Command (spec.md), Flow 2 (plan.md)
**Dependency**: T-015, T-016 complete
**Deliverable**: `templates/cli/install.js` executable

- Implement argument parsing (--profile, --upgrade, --dry-run)
- Implement manifest existence check
- Implement version comparison
- Implement file sync with extension preservation
- Implement conflict detection (E006)
- Implement --dry-run preview mode
- Implement manifest update
- Implement change summary output

#### T-018: Implement doctor.js Command
**Related**: AC-004, doctor Command (spec.md), Flow 3 (plan.md)
**Dependency**: T-015 complete
**Deliverable**: `templates/cli/doctor.js` executable

- Implement argument parsing (--verbose, --fix)
- Implement D001: manifest-valid check
- Implement D002: required-files check
- Implement D003: governance-consistent check
- Implement D004: skills-complete check
- Implement D005: commands-complete check
- Implement D006: contracts-registry check
- Implement D007: no-source-leak check
- Implement --fix auto-repair logic
- Implement structured report output (PASS/WARN/FAIL)
- Optimize for <5 seconds execution (NFR-004)

#### T-019: Create CLI Entry Point Script
**Related**: M2 (plan.md), AC-002, AC-003, AC-004
**Dependency**: T-016, T-017, T-018 complete
**Deliverable**: `templates/cli/index.js` main entry point

- Create unified entry point
- Implement command routing (init, install, doctor)
- Implement help output
- Implement version output

### M4: Example Project Module

#### T-020: Create Example Project Structure [P]
**Related**: AC-005, Example Project Design (spec.md)
**Dependency**: T-011 complete
**Deliverable**: `templates/pack/full/examples/sample-workflow/` directory

- Create `examples/sample-workflow/` in full profile
- Create directory structure for static demonstration

#### T-021: Create Sample Feature Specification [P]
**Related**: AC-005, Example Project Design (spec.md)
**Dependency**: T-020 complete
**Deliverable**: Sample spec.md, plan.md, tasks.md

- Create sample `spec.md` (simple feature, not complex)
- Create sample `plan.md` (minimal design note)
- Create sample `tasks.md` (few tasks, demonstration purpose)
- Keep example focused on happy path workflow

#### T-022: Create Example README [P]
**Related**: AC-005, AC-005 bullet 3
**Dependency**: T-020, T-021 complete
**Deliverable**: `examples/sample-workflow/README.md`

- Create README explaining:
  - What the example demonstrates
  - How to interpret sample files
  - What workflow is shown (spec-start through spec-audit)
- Clarify example is static, not runnable

---

## Phase 3: Integration / Edge Cases

### T-023: Test init Command with Empty Target
**Related**: AC-002, Validation Strategy (plan.md)
**Dependency**: T-016, T-005 through T-010 complete
**Deliverable**: init test case passing

- Test init with empty directory
- Verify all required files copied
- Verify manifest generated correctly
- Verify placeholder directories created

### T-024: Test init Command with Non-Empty Target
**Related**: AC-002, E001 error handling
**Dependency**: T-016, T-023 complete
**Deliverable**: init edge case handling verified

- Test init without --force on non-empty directory (expect error)
- Test init with --force on non-empty directory (expect success)
- Verify --force behavior preserves existing user files

### T-025: Test install Command Version Upgrade
**Related**: AC-003, Flow 2 (plan.md)
**Dependency**: T-017 complete
**Deliverable**: install upgrade scenario passing

- Test install without --upgrade on version mismatch (expect warning)
- Test install with --upgrade (expect file sync)
- Test install --dry-run (expect preview only)

### T-026: Test install Command Profile Change
**Related**: AC-003, AC-003 bullet 2
**Dependency**: T-017 complete
**Deliverable**: profile change scenario passing

- Test minimal → full profile change (expect M4 files added)
- Test full → minimal profile change (expect M4 files removed, with warning)
- Verify extension files preserved

### T-027: Test doctor Command All Checks
**Related**: AC-004, Validation Strategy (plan.md)
**Dependency**: T-018 complete
**Deliverable**: All 7 doctor checks verified

- Test D001 manifest-valid (PASS and FAIL cases)
- Test D002 required-files (PASS and FAIL cases)
- Test D003 governance-consistent
- Test D004 skills-complete (minimal vs full)
- Test D005 commands-complete
- Test D006 contracts-registry
- Test D007 no-source-leak

### T-028: Test doctor Command Auto-Fix
**Related**: AC-004, AC-004 bullet 6
**Dependency**: T-018 complete
**Deliverable**: --fix functionality verified

- Test doctor --fix on missing manifest
- Test doctor --fix on missing required files
- Verify unfixable issues provide manual instructions

### T-029: Test Extension Isolation
**Related**: BR-004, C3 (data-model.md), AC-003
**Dependency**: T-017 complete
**Deliverable**: Extension preservation verified

- Create test project with specs/, artifacts/ content
- Run install --upgrade
- Verify specs/, artifacts/ untouched
- Verify user-modified template files handled correctly (conflict detection)

### T-030: Test Cross-Platform Compatibility
**Related**: R-002 (plan.md)
**Dependency**: T-015 through T-019 complete
**Deliverable**: CLI works on Windows, macOS, Linux

- Test file operations on Windows (paths, permissions)
- Test symbolic link handling (if needed)
- Verify fs module usage is cross-platform safe

---

## Phase 4: Validation / Cleanup

### M3: Documentation Module

#### T-031: Create templates/USAGE.md [P]
**Related**: AC-006, M3 (plan.md)
**Deliverable**: `templates/USAGE.md` comprehensive guide

- Document quick start instructions
- Document init command usage with examples
- Document install command usage with examples
- Document doctor command usage with examples
- Document common patterns and workflows

#### T-032: Create templates/PROFILE-COMPARISON.md [P]
**Related**: AC-006, Profile Design (spec.md)
**Deliverable**: `templates/PROFILE-COMPARISON.md`

- Document minimal profile file list
- Document full profile additional files
- Document skills count per profile
- Document use case recommendations per spec.md table

#### T-033: Create templates/UPGRADE-STRATEGY.md [P]
**Related**: AC-006, Upgrade/Sync Strategy (spec.md)
**Deliverable**: `templates/UPGRADE-STRATEGY.md`

- Document manual upgrade flow
- Document version conflict handling
- Document sync frequency recommendations
- Document breaking changes procedure

#### T-034: Update README.md
**Related**: AC-006, NFR-001
**Deliverable**: README.md with template pack section

- Add "Template Pack" section
- Add template usage quick start
- Reference templates/USAGE.md for details
- Update feature list with 018 entry

#### T-035: Update CHANGELOG.md
**Related**: AC-006
**Deliverable**: CHANGELOG.md with 018 entry

- Add 018-template-and-bootstrap-foundation entry
- List new capabilities (init, install, doctor, profiles)
- List new directories (templates/)

### Security Review

#### T-036: Security Review - Source-Only Exclusion
**Related**: AC-008, BR-007, R-005 (plan.md)
**Deliverable**: Security review report confirming no leakage

- Verify no specs/001-017/ in template pack
- Verify no verification reports in template pack
- Verify no docs/archive/ in template pack
- Verify no docs/infra/ in template pack
- Verify no credentials/secrets in template pack

#### T-037: Security Review - Template Content Safety
**Related**: AC-008, AC-008 bullets 1-2
**Deliverable**: Security review report confirming safe content

- Verify no hardcoded secrets in template files
- Verify no development-only artifacts
- Verify .gitignore excludes sensitive patterns
- Document security review findings

### Validation

#### T-038: Verify Minimal Profile File Count
**Related**: AC-001, NFR-002
**Deliverable**: Minimal profile count < 100 files verified

- Count files in templates/pack/minimal/
- Verify count matches pack-version.json
- Report if count exceeds 100 (warning)

#### T-039: Verify Full Profile File Count
**Related**: AC-001, NFR-003
**Deliverable**: Full profile count verified

- Count files in templates/pack/full/
- Verify count matches pack-version.json
- Verify full includes all minimal + optional

#### T-040: Verify Doctor Execution Speed
**Related**: NFR-004, AC-004
**Deliverable**: doctor completes in <5 seconds

- Run doctor on minimal profile project
- Measure execution time
- Verify < 5000ms

#### T-041: Final Integration Test
**Related**: All AC criteria
**Deliverable**: End-to-end workflow passing

- Run init minimal → verify structure
- Run doctor → verify PASS
- Create user content in specs/
- Run install --upgrade → verify preserved
- Run doctor → verify PASS

#### T-042: Create Verification Report
**Related**: tester role, AC validation
**Deliverable**: `specs/018-template-and-bootstrap-foundation/verification-report.md`

- Document all test results
- Document AC checklist status
- Document any warnings or known gaps
- Provide final PASS/PASS_WITH_WARNINGS/FAIL verdict

---

## Task Summary

| Phase | Task Count | Parallel-Safe |
|-------|------------|---------------|
| Phase 1: Setup | 4 | 4 [P] |
| Phase 2: Core | 19 | 10 [P] |
| Phase 3: Integration | 8 | 0 |
| Phase 4: Validation | 12 | 4 [P] |
| **Total** | **43** | **18 [P]** |

## Dependency Highlights

- **T-005 → T-006, T-007, T-008, T-009, T-010**: Minimal structure must exist before copying content
- **T-005-T-010 → T-011**: Minimal must complete before full profile
- **T-015 → T-016, T-017, T-018**: CLI lib must exist before command implementations
- **T-016 → T-017**: init must complete before install (shared patterns)
- **T-011 → T-020**: Full profile must exist for example project

## Next Recommended Command

After tasks.md approval:
```
/spec-implement 018-template-and-bootstrap-foundation --start T-001
```