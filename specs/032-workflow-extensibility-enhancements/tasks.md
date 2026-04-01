# Tasks: 032-workflow-extensibility-enhancements

## Task Summary

| Phase | Tasks | Duration | Parallel |
|-------|-------|----------|----------|
| Phase 1: Adapter Enhancement | T-001 ~ T-004 | 2h | No |
| Phase 2: Template Mapping | T-005 ~ T-008 | 1.5h | No |
| Phase 3: Plugin Commands | T-009 ~ T-011 | 1h | Yes (with P1/P2) |
| Phase 4: Plugin Execution Skills | T-012 ~ T-014 | 2h | No (depends on P3) |
| Phase 5: Core Skill Enhancement | T-015 ~ T-016 | 0.5h | Yes (with P4) |

**Total**: 16 tasks, ~7h estimated

---

## Phase 1: Adapter Enhancement (Body Parser)

### T-001: Define body_parser_config schema

**Status**: [x] Complete
**Priority**: High
**Dependencies**: None

**Goal**: Define JSON Schema for body_parser_config

**Deliverable**: `adapters/schemas/body-parser-config.schema.json`

**Acceptance Criteria**:
- [x] Schema defines `sections.required`, `sections.recommended`, `sections.optional`
- [x] Schema defines `sections.mapping` field mapping
- [x] Schema validates against JSON Schema Draft 2020-12
- [x] Schema added to `adapters/registry.json`

---

### T-002: Modify body-parser.js to support config parsing

**Status**: [x] Complete
**Priority**: High
**Dependencies**: T-001

**Goal**: Modify body-parser.js to support configurable section parsing

**Deliverable**: `adapters/github-issue/body-parser.js` (modified)

**Acceptance Criteria**:
- [x] New `parseWithConfig(body, config)` function added
- [x] `parseBody(body)` retained as default entry point
- [x] Default behavior matches existing implementation
- [x] Uses DEFAULT_SECTIONS when config is missing

---

### T-003: Update github-issue.config.json default config

**Status**: [x] Complete
**Priority**: High
**Dependencies**: T-001, T-002

**Goal**: Update config file to add body_parser_config

**Deliverable**: `adapters/github-issue/github-issue.config.json` (modified)

**Acceptance Criteria**:
- [x] New `body_parser_config` configuration added
- [x] Configuration matches existing behavior (backward compatible)
- [x] Includes `Verification Steps` mapping to `verification_steps`

---

### T-004: Write body-parser unit tests

**Status**: [x] Complete
**Priority**: High
**Dependencies**: T-002, T-003

**Goal**: Test configurable section parsing logic

**Deliverable**: `adapters/github-issue/tests/body-parser.test.js`

**Acceptance Criteria**:
- [x] Test default config behavior
- [x] Test custom config behavior
- [x] Test new section (Verification Steps)
- [x] Test section mapping to nested fields
- [x] Test fallback when config is missing

---

## Phase 2: Template Mapping

### T-005: Define template_mapping schema

**Status**: [x] Complete
**Priority**: Medium
**Dependencies**: None

**Goal**: Define JSON Schema for template_mapping

**Deliverable**: `adapters/schemas/template-mapping.schema.json`

**Acceptance Criteria**:
- [x] Schema defines template name -> command mapping
- [x] Schema validates against JSON Schema Draft 2020-12

---

### T-006: Modify issue-parser.js to support template inference

**Status**: [x] Complete
**Priority**: Medium
**Dependencies**: T-005

**Goal**: Infer Template type from Issue and map to command

**Deliverable**: `adapters/github-issue/issue-parser.js` (modified)

**Acceptance Criteria**:
- [x] New `inferCommandFromTemplate(issue, config)` function added
- [x] Explicit `command:` label has higher priority than Template mapping
- [x] Returns default command when unable to infer: `implement-task`

---

### T-007: Update default config to add template_mapping

**Status**: [x] Complete
**Priority**: Medium
**Dependencies**: T-005, T-006

**Goal**: Update config file to add template_mapping

**Deliverable**: `adapters/github-issue/github-issue.config.json` (modified)

**Acceptance Criteria**:
- [x] New `template_mapping` configuration added
- [x] Includes common template mappings (task.md, bug.md, design.md)

---

### T-008: Write issue-parser unit tests

**Status**: [x] Complete
**Priority**: Medium
**Dependencies**: T-006, T-007

**Goal**: Test template inference and command mapping logic

**Deliverable**: `adapters/github-issue/tests/issue-parser.test.js`

**Acceptance Criteria**:
- [x] Test explicit label priority
- [x] Test template mapping fallback
- [x] Test unknown template uses default value
- [x] Test behavior when no template info available

---

## Phase 3: Plugin Commands Configuration

### T-009: Update PLUGIN-SPEC.md

**Status**: [x] Complete
**Priority**: High
**Dependencies**: None

**Goal**: Add commands field to Plugin specification

**Deliverable**: `plugins/PLUGIN-SPEC.md` (modified)

**Acceptance Criteria**:
- [x] New `commands` field definition added
- [x] Define `commands.{name}.cmd` as required
- [x] Define `commands.{name}.env` as optional
- [x] Define `commands.{name}.description` as recommended

---

### T-010: Update vite-react-ts plugin.json

**Status**: [x] Complete
**Priority**: High
**Dependencies**: T-009

**Goal**: Add commands config to vite-react-ts Plugin

**Deliverable**: `plugins/vite-react-ts/plugin.json` (modified)

**Acceptance Criteria**:
- [x] New `commands.build` added
- [x] New `commands.test` added
- [x] New `commands.lint` added
- [x] Update `skills` list to include run-tests, run-build

---

### T-011: Update plugin loader

**Status**: [x] Complete
**Priority**: High
**Dependencies**: T-009, T-010

**Goal**: Enable plugin loader to load commands config

**Deliverable**: `plugins/loader.js` (modified)

**Acceptance Criteria**:
- [x] `loadPlugin()` returns object containing commands
- [x] `getCommands()` method returns plugin commands
- [x] Returns empty object when no commands config

---

## Phase 4: Plugin Execution Skills

### T-012: Create run-tests skill

**Status**: [x] Complete
**Priority**: High
**Dependencies**: T-010, T-011

**Goal**: Create Vite + Vitest test execution skill

**Deliverable**: `plugins/vite-react-ts/skills/run-tests/SKILL.md`

**Acceptance Criteria**:
- [x] Skill reads `plugin.json` `commands.test` config
- [x] Execute test command and capture output
- [x] Parse Vitest/Jest test results
- [x] Return test report (pass/fail count, coverage)

---

### T-013: Create run-build skill

**Status**: [x] Complete
**Priority**: High
**Dependencies**: T-010, T-011

**Goal**: Create Vite build execution skill

**Deliverable**: `plugins/vite-react-ts/skills/run-build/SKILL.md`

**Acceptance Criteria**:
- [x] Skill reads `plugin.json` `commands.build` config
- [x] Execute build command and capture output
- [x] Check build result (success/failure)
- [x] Return build report

---

### T-014: Write skill examples

**Status**: [x] Complete
**Priority**: Medium
**Dependencies**: T-012, T-013

**Goal**: Add examples for run-tests and run-build

**Deliverables**:
- `plugins/vite-react-ts/skills/run-tests/examples/example-001-basic.md`
- `plugins/vite-react-ts/skills/run-build/examples/example-001-basic.md`

**Acceptance Criteria**:
- [x] run-tests example shows test execution and result parsing
- [x] run-build example shows build execution and result check

---

## Phase 5: Core Skill Enhancement

### T-015: Enhance Tester Skill Step 6

**Status**: [x] Complete
**Priority**: Medium
**Dependencies**: T-012, T-013

**Goal**: Enhance unit-test-design skill Step 6 content

**Deliverable**: `.opencode/skills/tester/unit-test-design/SKILL.md` (modified)

**Acceptance Criteria**:
- [x] Step 6 refined into 4 sub-steps (6.1 ~ 6.4)
- [x] 6.1 includes test command detection logic
- [x] 6.2 includes Plugin skill call guidance
- [x] 6.3 includes test result parsing guidance
- [x] 6.4 includes verification-report generation guidance

---

### T-016: Update Tester Skill examples

**Status**: [x] Complete
**Priority**: Low
**Dependencies**: T-015

**Goal**: Update examples to show enhanced Step 6

**Deliverable**: `.opencode/skills/tester/unit-test-design/examples/` (modified)

**Acceptance Criteria**:
- [x] Example shows test command detection
- [x] Example shows run-tests skill call
- [x] Example shows verification-report generation

---

## Verification Checklist

### Phase 1 Complete
- [x] body-parser supports configurable sections
- [x] All tests pass
- [x] Documentation updated

### Phase 2 Complete
- [x] Template mapping working
- [x] All tests pass
- [x] Documentation updated

### Phase 3 Complete
- [x] Plugin commands config available
- [x] loader loads commands

### Phase 4 Complete
- [x] run-tests skill available
- [x] run-build skill available
- [x] Examples complete

### Phase 5 Complete
- [x] Tester Skill Step 6 enhanced
- [x] Examples updated

### Feature Complete
- [x] All AC satisfied
- [x] All tests pass
- [x] Documentation synced
- [x] completion-report written