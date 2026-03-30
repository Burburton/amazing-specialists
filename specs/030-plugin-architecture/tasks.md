# Tasks: 030-plugin-architecture

## Metadata
```yaml
feature_id: 030-plugin-architecture
version: 1.0.0
created_at: 2026-03-31
status: complete
```

---

## Phase 1: Architecture Foundation

### T-001: Create Plugin Directory Structure
**Related**: AC-001, FR-001
**Deliverable**: `plugins/` directory with subdirectories

- Create `plugins/` root directory
- Create `plugins/lib/` for shared utilities
- Verify structure matches spec.md § Directory Structure

**Validation**: Directory exists, structure matches spec

---

### T-002: Create Plugin Registry Schema
**Related**: FR-001, data-model.md § Plugin Registry Schema
**Deliverable**: `plugins/registry.json`

- Create registry.json with initial plugin entries
- Include vite-react-ts (available)
- Include nextjs, vue-vite, python-fastapi, go-mod, rust-cargo (planned)
- Set loader_version to "1.0.0"

**Validation**: JSON valid, schema-compliant (per data-model.md)

---

### T-003: Create Plugin Specification Document
**Related**: FR-006, AC-001
**Deliverable**: `plugins/PLUGIN-SPEC.md`

- Define plugin directory structure
- Define plugin.json format (reference data-model.md)
- Define skill format requirements (TC-001)
- Define template and hook formats
- Define compatibility rules (TC-003)

**Validation**: Document covers all required sections

---

### T-004: Validate Phase 1 Completion
**Related**: AC-001
**Deliverable**: Phase 1 validation checkpoint

- Verify plugins/ directory exists
- Verify registry.json is valid JSON
- Verify PLUGIN-SPEC.md covers required sections

**Validation**: AC-001 checklist items all passed

---

## Phase 2: Loader Implementation

### T-005: Create Loader Entry Point
**Related**: FR-002, AC-002
**Deliverable**: `plugins/loader.js` main CLI

- Implement CLI entry point with command routing
- Support commands: list, install, uninstall
- Parse command-line arguments
- Handle missing/invalid commands with error messages

**Validation**: `node plugins/loader.js --help` shows usage

---

### T-006: Implement List Command
**Related**: FR-002, L001
**Deliverable**: `list` command in loader.js

- Read registry.json
- For each plugin: read plugin.json, check compatibility
- Format output with status (available/installed/planned/deprecated)
- Handle registry not found error (P001)

**Validation**: `node plugins/loader.js list` outputs formatted list

---

### T-007: Create Plugin Utilities Module
**Related**: M2 § Key Functions
**Deliverable**: `plugins/lib/plugin-utils.js`

- Implement `copyTemplates(plugin, targetDir)` - copy template files
- Implement `registerSkills(plugin, projectSkillsDir)` - copy skills
- Implement `configureHooks(plugin, projectHooksDir)` - configure hooks
- Implement `validateCompatibility(plugin, coreVersion)` - version check
- Implement error handling per plan.md § Error Handling

**Validation**: Functions exported, error handling covers P001-P006

---

### T-008: Implement Install Command
**Related**: FR-002, L002-L004
**Deliverable**: `install` command in loader.js

- Validate plugin exists in registry (P002)
- Validate version compatibility (P003)
- Validate target project path (P006)
- Copy templates using plugin-utils
- Register skills (handle conflict with P005)
- Configure hooks
- Update registry status to "installed"
- Output installation summary

**Validation**: `node plugins/loader.js install vite-react-ts --project ./test-project` succeeds

---

### T-009: Implement Uninstall Command
**Related**: FR-002, L005
**Deliverable**: `uninstall` command in loader.js

- Validate plugin is installed in target project
- Remove copied templates
- Remove registered skills
- Remove configured hooks
- Update plugin-manifest.json in target project
- Update registry status if no other installations

**Validation**: `node plugins/loader.js uninstall vite-react-ts --project ./test-project` cleans up

---

### T-010: Add Version Compatibility Check
**Related**: TC-003, data-model.md § Compatibility Check Logic
**Deliverable**: Compatibility validation in plugin-utils.js

- Parse semver range from plugin.compatibility.core_version
- Compare with core package version
- Return compatible: true/false with reason
- Integrate with install command

**Validation**: Incompatible plugin rejected with error P003

---

### T-011: Add Skill Conflict Detection
**Related**: TC-002, R-001, S-003
**Deliverable**: Skill name conflict handling in plugin-utils.js

- List core skills from .opencode/skills/
- Compare plugin skill names with core skill names
- On conflict: warning P005, skip conflicting skill
- Log skipped skills in installation summary

**Validation**: Plugin skill with core name skipped, warning shown

---

### T-012: Validate Phase 2 Completion
**Related**: AC-002
**Deliverable**: Phase 2 validation checkpoint

- Test list command (L001)
- Test install command with mock project (L002-L004)
- Test uninstall command (L005)
- Test compatibility rejection (L006)

**Validation**: AC-002 checklist items all passed

---

## Phase 3: vite-react-ts Plugin Instance

### T-013: Create Plugin Directory Structure [P]
**Related**: AC-003, M3
**Deliverable**: `plugins/vite-react-ts/` directory

- Create `plugins/vite-react-ts/` root
- Create `plugins/vite-react-ts/skills/` subdirectory
- Create `plugins/vite-react-ts/skills/vite-setup/` subdirectory
- Create `plugins/vite-react-ts/skills/css-module-test/` subdirectory
- Create `plugins/vite-react-ts/templates/` subdirectory
- Create `plugins/vite-react-ts/hooks/` subdirectory

**Validation**: Directory structure matches spec.md § Directory Structure

---

### T-014: Create Plugin Metadata [P]
**Related**: AC-003, V001, data-model.md § Plugin Metadata Schema
**Deliverable**: `plugins/vite-react-ts/plugin.json`

- Define id, name, version, description, author
- Set compatibility.core_version to ">=1.0.0"
- List skills: ["vite-setup", "css-module-test"]
- List templates (5 files)
- List hooks: ["docstring-exclusions"]
- Set tags: ["frontend", "react", "typescript", "vite", "vitest", "css-modules"]

**Validation**: JSON valid, all required fields per plugin-metadata.schema.json

---

### T-015: Create vite-setup Skill [P]
**Related**: FR-003, V002, TC-001
**Deliverable**: `plugins/vite-react-ts/skills/vite-setup/SKILL.md`

- Follow SKILL.md format from .opencode/skills/
- Add plugin metadata header (plugin_id, plugin_version, core_compatibility)
- Document Vite + Vitest + TypeScript configuration guidance
- Cover: tsconfig separation, defineConfig import, env setup
- Include examples for common configurations

**Validation**: SKILL.md parses, skill tool can load it

---

### T-016: Create css-module-test Skill [P]
**Related**: FR-003, V003, TC-001
**Deliverable**: `plugins/vite-react-ts/skills/css-module-test/SKILL.md`

- Follow SKILL.md format
- Add plugin metadata header
- Document CSS Module testing patterns
- Cover: mock CSS imports, className resolution, Vitest configuration
- Include example test code

**Validation**: SKILL.md parses, skill tool can load it

---

### T-017: Create tsconfig.app.json Template [P]
**Related**: FR-004, V004
**Deliverable**: `plugins/vite-react-ts/templates/tsconfig.app.json`

- TypeScript config for application code
- Set target: "ES2020", module: "ESNext"
- Configure React JSX settings
- Enable strict mode
- Add Vite-specific compiler options

**Validation**: JSON valid TypeScript config

---

### T-018: Create tsconfig.node.json Template [P]
**Related**: FR-004, V004
**Deliverable**: `plugins/vite-react-ts/templates/tsconfig.node.json`

- TypeScript config for Node/Vite config files
- Set target: "ES2022", module: "CommonJS"
- Configure for vite.config.ts, vitest.config.ts

**Validation**: JSON valid TypeScript config

---

### T-019: Create tsconfig.test.json Template [P]
**Related**: FR-004, V004
**Deliverable**: `plugins/vite-react-ts/templates/tsconfig.test.json`

- TypeScript config for test environment
- Vitest-specific compiler options
- Configure for test file patterns

**Validation**: JSON valid TypeScript config

---

### T-020: Create vite-env.d.ts Template [P]
**Related**: FR-004, V004
**Deliverable**: `plugins/vite-react-ts/templates/vite-env.d.ts`

- Vite type declarations
- Triple-slash reference to vite/client
- CSS module type declarations
- Image asset type declarations

**Validation**: Valid TypeScript declaration file

---

### T-021: Create vite.config.ts Template [P]
**Related**: FR-004, V004
**Deliverable**: `plugins/vite-react-ts/templates/vite.config.ts`

- Vite configuration template
- defineConfig import pattern
- React plugin configuration
- Vitest configuration inline
- Common path aliases

**Validation**: Valid TypeScript, Vite config structure

---

### T-022: Create docstring-exclusions Hook [P]
**Related**: FR-005, V005, data-model.md § Hook Configuration Schema
**Deliverable**: `plugins/vite-react-ts/hooks/docstring-exclusions.md`

- Define hook type: policy-exclusion
- Set trigger: docstring policy check encounters triple-slash directive
- Define action: exclude triple-slash directives from validation
- Specify exclusion pattern: `^///\s*<reference`
- Document reason: TypeScript triple-slash directive (required syntax)

**Validation**: Hook format valid per data-model.md schema

---

### T-023: Validate Phase 3 Completion
**Related**: AC-003
**Deliverable**: Phase 3 validation checkpoint

- Verify plugin.json valid (V001)
- Verify vite-setup skill format (V002)
- Verify css-module-test skill format (V003)
- Verify all template files valid (V004)
- Verify hook valid (V005)

**Validation**: AC-003 checklist items all passed

---

## Phase 4: Documentation

### T-024: Create Plugin Usage Guide [P]
**Related**: FR-006, AC-004
**Deliverable**: `docs/plugin-usage-guide.md`

- Document how to list available plugins
- Document how to install a plugin
- Document how to use plugin skills (skill tool invocation)
- Document how to uninstall a plugin
- Document how to develop a new plugin (reference PLUGIN-SPEC.md)
- Include examples for vite-react-ts

**Validation**: Guide covers all user operations

---

### T-025: Update README.md with Plugin Architecture [P]
**Related**: AC-004, Governance Sync Rule
**Deliverable**: README.md updated

- Add Plugin Architecture section
- List available plugins (vite-react-ts)
- Document plugin usage CLI commands
- Update Skills 清单 to mention plugin skills extension
- Add Plugin section to Included Components

**Validation**: README reflects plugin capability

---

### T-026: Validate Phase 4 Completion
**Related**: AC-004
**Deliverable**: Phase 4 validation checkpoint

- Verify plugin-usage-guide.md exists and is complete
- Verify README.md updated with plugin section

**Validation**: AC-004 checklist items all passed

---

## Phase 5: Validation & Review

### T-027: Run Loader Tests
**Related**: AC-005, plan.md § Loader Tests
**Deliverable**: Loader test execution report

- Test L001: list command output format
- Test L002: install command template copy
- Test L003: install command skill registration
- Test L004: install command hook configuration
- Test L005: uninstall command cleanup
- Test L006: compatibility check rejection

**Validation**: All loader tests pass

---

### T-028: Run Plugin Instance Tests
**Related**: AC-005, plan.md § Plugin Instance Tests
**Deliverable**: Plugin test execution report

- Test V001: plugin.json valid metadata
- Test V002: vite-setup skill format
- Test V003: css-module-test skill format
- Test V004: templates valid JSON/TS
- Test V005: hook valid

**Validation**: All plugin instance tests pass

---

### T-029: Run Integration Tests
**Related**: AC-005, plan.md § Integration Tests, I001-I002
**Deliverable**: Integration test execution report

- Test I001: Real project install (create sample project, install plugin)
- Test I002: Skill invocation (invoke vite-setup skill via skill tool)

**Validation**: Integration tests pass

---

### T-030: Security Review for Hook Injection
**Related**: R-006, security role responsibility
**Deliverable**: Security review report

- Validate hook format (no code execution)
- Validate hook content does not allow arbitrary commands
- Check hook configuration does not bypass core policies
- Ensure hooks only append/extend, not replace

**Validation**: Security review finds no blocker issues

---

### T-031: Code Review for Completeness
**Related**: reviewer role responsibility, AH-006
**Deliverable**: Review findings report

- Review spec vs implementation alignment
- Review feature vs canonical governance docs
- Review completion-report vs README state narrative
- Review tasks declared outputs vs actual outputs
- Apply AH-001~AH-006 audit hardening rules

**Validation**: Review finds no blocker/major issues

---

### T-032: Create Completion Report
**Related**: docs role responsibility
**Deliverable**: `specs/030-plugin-architecture/completion-report.md`

- Summarize what was changed
- List files created/modified
- Document validation results
- Note any assumptions, risks, blockers
- Document governance updates (README.md, etc.)
- Apply completion-report format from docs/templates/

**Validation**: Completion report follows template format

---

### T-033: Final Documentation Sync
**Related**: Governance Sync Rule, docs role responsibility
**Deliverable**: Documentation synchronized

- Sync README.md with plugin capability
- Verify CHANGELOG.md has 030 entry (if applicable)
- Verify AGENTS.md reflects plugin rules (if needed)
- Verify no governance drift

**Validation**: All governance docs consistent

---

### T-034: Validate Phase 5 Completion
**Related**: AC-005
**Deliverable**: Phase 5 validation checkpoint

- All loader tests pass
- All plugin tests pass
- All integration tests pass
- Security review no blockers
- Code review no blockers
- Completion report created
- Governance synced

**Validation**: AC-005 checklist items all passed, feature complete

---

## Summary

| Phase | Tasks | Parallel-Safe | Dependencies |
|-------|-------|---------------|--------------|
| Phase 1 | T-001 to T-004 | No (foundation) | None |
| Phase 2 | T-005 to T-012 | No (sequential) | Phase 1 |
| Phase 3 | T-013 to T-023 | Yes (marked [P]) | Phase 1 |
| Phase 4 | T-024 to T-026 | Yes (marked [P]) | Phase 1 |
| Phase 5 | T-027 to T-034 | No (sequential) | All Phases |

**Total Tasks**: 34
**Estimated Effort**: 3-4 days (per plan.md)

---

## Dependency Highlights

1. **Phase 1 → Phase 2**: Registry and structure must exist before loader can read
2. **Phase 1 → Phase 3**: Plugin structure defined before instance can be created
3. **Phase 1 → Phase 4**: Architecture defined before documentation can be written
4. **Phase 2 → Phase 5**: Loader must work for validation tests
5. **Phase 3 → Phase 5**: Plugin instance must exist for integration tests
4. **Phase 4 → Phase 5**: Documentation must exist for governance sync check

---

## Next Recommended Command

执行 `/spec-implement 030-plugin-architecture` 开始实施，建议按 Phase 顺序执行。