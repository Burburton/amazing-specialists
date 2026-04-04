# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.7.1] - 2026-04-04

### Summary

**Repository Rename** - Renamed repository from `amazing_agent_specialist` to `amazing-specialists`.

### Changed

- Repository renamed to `amazing-specialists`
- Updated all internal references (23 files)
- GitHub URL: https://github.com/Burburton/amazing-specialists
- Template Repository: Enabled

---

## [1.7.0] - 2026-04-04

### Summary

**Usability Improvements** - Enhanced documentation, simplified CLI, and fixed template pack content.

### Added

#### README Improvements (038, 039)

- **30秒快速入门** section at README top for quick onboarding
- **文档导航** section with clear reading order
- **核心命令参考** section with 5 spec commands documentation
- CLI `quick` subcommand for simplified dispatch (`node dispatch.js quick --role developer "task"`)

#### Template Pack Content Fix (040)

- **CLI scripts** added to template pack (`templates/cli/init.js`, `install.js`, `doctor.js`)
- **Examples** added to template pack (`examples/01-quick-start/minimal-example.md`)
- **Docs** added to template pack (`skills-usage-guide.md`, `enhanced-mode-guide.md`, `adapter-usage-guide.md`, `plugin-usage-guide.md`)
- **Doctor checks** updated with 3 new checks (CLI scripts, Examples, Docs)

### Fixed

- Skills count unified to 23 MVP across README and skills-usage-guide.md
- Template pack file counts updated (minimal: 124, full: 198)
- README links now work after project initialization

### Changed

- Features count: 39 total
- Template file count: 117 → 124 (minimal), 190 → 198 (full)

---

## [1.6.2] - 2026-04-03

### Summary

**Platform Adapter Usability** - Fix documentation inconsistencies and improve caller experience based on caller-perspective validation.

### Fixed

#### P0 - Documentation Field Names

- **Fixed `docs/platform-adapter-guide.md`**: Corrected field names to match code
  - `"category"` → `override_category`
  - `"load_skills"` → `additional_skills`
- Added field description table with examples

### Added

#### P1 - API Improvements

- **`adapters/platform/index.ts`** - New unified entry point
- **`getTaskConfig(platformId, role)`** - Convenience method to get both category and skills
- **`AGENTS.md`** - Added Runtime API section with usage examples
- **`package.json`** - Added `exports` field for module imports

### API Improvement

```typescript
// Before: Multiple calls
const adapter = getPlatformAdapter('opencode');
const category = adapter.mapRoleToCategory('tester');
const skills = adapter.getDefaultSkills('tester');

// After: One call
import { getTaskConfig } from './adapters/platform';
const { category, skills } = getTaskConfig('opencode', 'tester');
```

---

## [1.6.1] - 2026-04-03

### Summary

**Platform Adapter Runtime** - Implement runtime code for Platform Adapter, making `getPlatformAdapter()` actually usable.

### Added

#### Runtime Implementation

- **`adapters/platform/runtime.ts`** - Main entry point with `getPlatformAdapter()` function
- **`adapters/platform/loader.ts`** - Configuration loading from JSON files
- **`adapters/platform/merger.ts`** - Configuration merging with project override support
- **`adapters/platform/errors.ts`** - Custom error types (`PlatformNotSupportedError`, `ConfigLoadError`, `InvalidRoleError`)
- **`adapters/platform/opencode/index.ts`** - OpenCode adapter factory function

#### Features

- `getPlatformAdapter(platformId)` - Get adapter instance with caching
- `mapRoleToCategory(role)` - Map 6-role to platform category
- `getDefaultSkills(role)` - Get default skills for a role
- Project-level override via `.opencode/platform-override.json`
- Error handling with helpful messages

### Changed

- `docs/platform-adapter-guide.md` - Updated with runtime usage examples

---

## [1.6.0] - 2026-04-03

### Summary

**Platform Adapter Layer** - Abstract platform runtime differences, providing unified role model mapping for cross-platform compatibility.

### Added

#### Platform Adapter Infrastructure

- **Platform Adapter Interface** (`adapters/interfaces/platform-adapter.interface.ts`) - TypeScript interface for platform abstraction
- **OpenCode Platform Adapter** (`adapters/platform/opencode/`) - OpenCode-specific adapter implementation
  - `role-mapping.json` - 6-role to category mapping
  - `capabilities.json` - Platform capabilities declaration
  - `README.md` - OpenCode adapter documentation
- **Platform Adapter Template** (`adapters/platform/templates/`) - Template for creating new platform adapters
- **Platform Adapter Guide** (`docs/platform-adapter-guide.md`) - Usage and customization guide

#### Plugin Extension

- **platform_mapping field** - Added to `plugins/PLUGIN-SPEC.md` for plugin-level skill extension
- Plugin can now extend role-to-skill mappings per platform

#### Documentation

- **ADAPTERS.md** - Added Platform Adapter Definition section
- **AGENTS.md** - Added OpenCode Platform Adaptation section with correct task() usage examples

### Changed

- `README.md` - Updated feature count (32→33), added Feature 033 to feature table
- `adapters/registry.json` - Added platform_adapters section

### Problem Solved

| Problem | Solution |
|---------|----------|
| `task(subagent_type="tester")` not supported on OpenCode | Use `category` + `load_skills` pattern via Platform Adapter |
| Role-to-category mapping inconsistency | Centralized mapping configuration |
| No plugin extension for platform skills | `platform_mapping` field in plugin.json |

### Stats

| Metric | v1.5.0 | v1.6.0 |
|--------|--------|--------|
| Features | 32 | 33 |
| Adapters | 5 | 5 + Platform Adapter |
| Platform Adapters | 0 | 1 (OpenCode) |

---

## [1.5.0] - 2026-03-31

### Summary

**5 Additional Plugins Released** - Extended plugin library with nextjs, vue-vite, python-fastapi, go-mod, and rust-cargo plugins, covering major frontend and backend tech stacks.

### Added

#### Frontend Plugins

- **nextjs** - Next.js plugin with App Router, Server Components, API Routes guidance
  - `nextjs-setup` skill - Next.js 14+ configuration best practices
  - Templates: next.config.mjs, middleware.ts, tsconfig.json, env.d.ts, app/layout.tsx
  - Hook: nextjs-exclusions for 'use client'/'use server' directives

- **vue-vite** - Vue 3 + Vite plugin with Composition API, Pinia, Vue Router
  - `vue-setup` skill - Vue 3 SFC patterns, composables, state management
  - Templates: vite.config.ts, tsconfig.json, env.d.ts, src/main.ts, src/App.vue
  - Hook: vue-exclusions for Vue-specific directives

#### Backend Plugins

- **python-fastapi** - Python FastAPI plugin for async REST API development
  - `fastapi-setup` skill - REST API design, Pydantic models, async patterns
  - Templates: pyproject.toml, main.py, config.py, requirements.txt
  - Hook: python-exclusions for Python type ignore comments

- **go-mod** - Go Modules plugin with project structure and testing patterns
  - `go-setup` skill - Error handling, testing best practices
  - Templates: go.mod, main.go, Makefile
  - Hook: go-exclusions for go:generate/go:build directives

- **rust-cargo** - Rust Cargo plugin with tokio async and Result error handling
  - `rust-setup` skill - Async patterns, error handling, testing
  - Templates: Cargo.toml, src/main.rs, src/lib.rs
  - Hook: rust-exclusions for lint allow/deny attributes

### Changed

- `README.md` - Updated plugin table to show all 6 plugins as Available
- `specs/030-plugin-architecture/completion-report.md` - Documented all 6 plugin instances
- `plugins/registry.json` - Updated loader_version to 1.4.0

### Stats

| Metric | v1.4.0 | v1.5.0 |
|--------|--------|--------|
| Plugins | 1 | 6 |
| Plugin Skills | 2 | 8 |
| Frontend Plugins | 1 | 3 |
| Backend Plugins | 0 | 3 |

---

## [1.4.0] - 2026-03-31

### Summary

**Plugin Skill Activation Complete** - User-selectable skill activation with symlink-based loading, enabling OpenCode to discover and load plugin skills automatically.

### Added

#### Skill Activation Infrastructure
- **skill-registry.json** - User configuration file for enabling/disabling plugin skills
- **sync-skills command** - Create/remove symlinks from `.opencode/skills/` to plugin skills
- **enable-skill/disable-skill commands** - CLI for toggling individual skills
- **Cross-platform symlink support** - Windows junction (no admin) + Unix symlink

#### New Libraries
- `plugins/lib/skill-linker.js` - Cross-platform symlink/junction management
- `plugins/lib/skill-registry.js` - skill-registry.json CRUD operations

#### Enhanced Commands
- **install** - Auto-creates skill-registry.json, prompts for sync-skills
- **uninstall** - Cleans up skills from registry and removes symlinks
- **list** - Shows skills with enabled/disabled status

### Changed

#### 030 Design Cleanup
- `plugins/PLUGIN-SPEC.md` - Replaced "Skill 合并机制" with "Skill 激活机制"
- `specs/030-plugin-architecture/data-model.md` - Deprecated `skills_enabled` field
- `specs/030-plugin-architecture/spec.md` - Updated Activation section
- `docs/plugin-usage-guide.md` - Added skill activation workflow
- `README.md` - Updated Plugin usage and features table (31 features)

### Stats
| Metric | v1.3.0 | v1.4.0 |
|--------|--------|--------|
| Features | 30 | 31 |
| Plugin Skills | 2 | 2 |
| Loader Commands | 3 | 6 |
| Lib Modules | 0 | 2 |

---

## [1.3.0] - 2026-03-31

### Summary

**Plugin Architecture Complete** - Pluggable architecture for tech-stack-specific capabilities, enabling users to install and use plugins for their project type.

### Added

#### Plugin Infrastructure
- **Plugin Registry** (`plugins/registry.json`) - Central registry for all available plugins
- **Plugin Loader** (`plugins/loader.js`) - CLI tool for plugin lifecycle management
  - `list` command - Display all available plugins with status
  - `install` command - Install plugin to target project (templates, skills, hooks)
  - `uninstall` command - Remove plugin from project
- **Plugin Specification** (`plugins/PLUGIN-SPEC.md`) - Developer guide for creating new plugins

#### vite-react-ts Plugin
- **vite-setup skill** - Vite + Vitest + TypeScript configuration guidance
  - tsconfig separation strategy (app/node/test)
  - defineConfig import source guidance
  - triple-slash directive handling
- **css-module-test skill** - CSS Module testing patterns
  - Mock CSS imports
  - className resolution
  - Vitest configuration
- **Template files** (5 files)
  - `tsconfig.app.json` - Application code TypeScript config
  - `tsconfig.node.json` - Node/Vite tooling TypeScript config
  - `tsconfig.test.json` - Test environment TypeScript config
  - `vite-env.d.ts` - Vite type declarations
  - `vite.config.ts` - Vite configuration template
- **docstring-exclusions hook** - Exclude triple-slash directives from docstring policy

#### Documentation
- **Plugin Usage Guide** (`docs/plugin-usage-guide.md`) - User guide for plugin operations

### Changed
- `README.md` - Added Plugin Architecture section, updated features table (30 features)

### Stats
| Metric | v1.2.0 | v1.3.0 |
|--------|--------|--------|
| Features | 28 | 30 |
| Plugin Skills | 0 | 2 |
| Plugins | 0 | 1 (vite-react-ts) |

---

## [1.2.0] - 2026-03-30

### Summary

**E2E Testing & Issue Workflow Complete** - Full end-to-end testing infrastructure, GitHub Issue adapter workflow verification, and Issue status sync skill for automated progress reporting.

### Added

#### E2E Testing Infrastructure
- **E2E Integration Tests** (`tests/e2e/`) - 64 tests covering full command workflow
  - Mock server infrastructure for adapter testing
  - 5 command execution tests
  - 6-role collaboration tests
  - Governance rule validation (AH-001~AH-006)

#### E2E Adapter Integration
- **E2E Adapter Integration Tests** (`tests/e2e/adapters/`) - 46 tests with real adapter code
  - GitHub Issue adapter real-code tests
  - GitHub PR adapter real-code tests
  - OpenClaw adapter real-code tests
  - Cross-adapter workflow tests

#### GitHub Issue Workflow
- **GitHub Issue Adapter Workflow Test** - Verified complete workflow from Issue dispatch to PR output
  - Workflow verification report documenting all steps
  - Issue label parsing → Dispatch Payload → Execution → PR output flow
  - Error handling and retry scenarios

#### GitHub Issue Adapter Enhancements
- **setup-labels CLI** - Automated label setup for GitHub repositories
  - Milestone labels (M1-M4)
  - Role labels (6-role model)
  - Command labels (5 core commands)
  - Task labels and risk labels
- **git-client utility** - Git operations for automation scripts
- **generateResultComment** - Template generator for execution result comments
- **automation script** - End-to-end automation helper

#### Issue Status Sync Skill
- **issue-status-sync skill** (`docs/issue-status-sync/`) - MVP skill for docs role
  - DOC-003 artifact contract (`issue-progress-report`)
  - BR-003: No Premature Closure - Issue must remain OPEN
  - Evidence-based progress reporting from upstream artifacts
  - Recommendation field: PENDING_ACCEPTANCE, NEEDS_REWORK, BLOCKED_ESCALATION
  - Examples (example-001, example-002) and anti-examples (anti-example-001)
  - Validation checklist for BR-003 compliance

### Changed
- `contracts/pack/registry.json` - Added DOC-003 contract metadata
- `contracts/pack/docs/issue-progress-report.schema.json` - New schema for DOC-003
- `role-definition.md` - Added issue-status-sync to docs skills
- `README.md` - Updated skills count: 23 MVP + 16 M4 = 39 total
- Docs Skills: 2 → 3 (added issue-status-sync)

### Stats
| Metric | v1.1.0 | v1.2.0 |
|--------|--------|--------|
| Features | 23 | 28 |
| Skills | 38 | 39 |
| MVP Skills | 22 | 23 |
| Tests | 676+ | 726+ |

---

## [1.1.0] - 2026-03-29

### Summary

**Adapter Layer Complete** - All orchestrator and workspace adapters implemented, enabling full bidirectional integration with external systems (GitHub, OpenClaw).

### Added

#### Adapters
- **OpenClaw Orchestrator Adapter** (`adapters/openclaw/`) - Bidirectional communication between OpenClaw manager and Expert Pack
  - 8 core components: types, client, parser, validator, result-sender, escalation-handler, retry-handler, heartbeat-sender
  - 69 unit tests, all passing
  - JWT/API key authentication with token refresh
  - Configurable retry with risk-level limits
  - Heartbeat mechanism with task-length-based intervals

### Changed
- `adapters/registry.json` - Updated openclaw status to "implemented"
- `README.md` - Updated feature table and adapter architecture section
- Feature count: 22 → 23

### Stats
| Metric | v1.0.0 | v1.1.0 |
|--------|--------|--------|
| Features | 22 | 23 |
| Adapters | 4 | 5 |
| Tests | 607+ | 676+ |

---

## [1.0.0] - 2026-03-28

### Summary

Initial release of OpenCode 专家包 - A complete execution layer for automated product development with 6-role model, 37 skills, and full governance compliance.

---

## Features

### Bootstrap Features (001-002b)

#### [001-bootstrap] - 2026-03-22
**项目初始化**

**Added:**
- Project directory structure
- Governance document framework
- Initial skill development plan
- Bootstrap verification

---

#### [002-role-model-alignment] - 2026-03-22
**角色模型对齐**

**Added:**
- 6-role formal model definition (architect, developer, tester, reviewer, docs, security)
- 3-skill transition skeleton mapping
- Role model evolution documentation
- Skill-to-role migration guide

**Changed:**
- Updated governance documents for 6-role terminology

---

#### [002b-governance-repair] - 2026-03-22
**治理一致性修复**

**Fixed:**
- Governance drift between completion-report and actual state
- 6-role/3-skill terminology inconsistency
- Documentation sync issues

---

### Core Role Features (003-008)

#### [003-architect-core] - 2026-03-24
**architect 角色核心技能**

**Added:**
- 3 core skills: `requirement-to-design`, `module-boundary-design`, `tradeoff-analysis`
- 4 artifact contracts: design-note, module-boundaries, risks-and-tradeoffs, open-questions
- Validation layer with failure-mode checklist
- Anti-pattern guidance

---

#### [004-developer-core] - 2026-03-25
**developer 角色核心技能**

**Added:**
- 3 core skills: `feature-implementation`, `bugfix-workflow`, `code-change-selfcheck`
- 3 artifact contracts: implementation-summary, bugfix-report, self-check-report
- Validation layer with upstream/downstream consumability checklists
- Anti-pattern guidance

---

#### [005-tester-core] - 2026-03-26
**tester 角色核心技能**

**Added:**
- 3 core skills: `unit-test-design`, `regression-analysis`, `edge-case-matrix`
- 3 artifact contracts: test-scope-report, verification-report, regression-risk-report
- Validation layer with failure-mode checklist
- Examples: feature-verification, bugfix-verification, blocked-test

---

#### [006-reviewer-core] - 2026-03-27
**reviewer 角色核心技能**

**Added:**
- 3 core skills: `code-review-checklist`, `spec-implementation-diff`, `reject-with-actionable-feedback`
- 3 artifact contracts: review-findings-report, acceptance-decision-record, actionable-feedback-report
- Governance alignment checks (AH-006)
- Examples: standard-feature-review, rejection-with-feedback, ambiguity-escalation

---

#### [007-docs-core] - 2026-03-27
**docs 角色核心技能**

**Added:**
- 2 core skills: `readme-sync`, `changelog-writing`
- 2 artifact contracts: docs-sync-report, changelog-entry
- Validation layer with consistency review checklist
- Quick reference and FAQ documentation

---

#### [008-security-core] - 2026-03-28
**security 角色核心技能**

**Added:**
- 2 core skills: `auth-and-permission-review`, `input-validation-review`
- 2 artifact contracts: security-review-report, input-validation-review-report
- Validation layer with finding-quality checklist
- **6-role model complete**

---

### Infrastructure Features (009-010)

#### [009-command-hardening] - 2026-03-24
**命令固化与验证**

**Added:**
- 5 core commands: `spec-start`, `spec-plan`, `spec-tasks`, `spec-implement`, `spec-audit`
- 9 artifact templates (6 role + 3 common)
- Quality gate check specification
- Traceability methodology

---

#### [010-3-skill-migration] - 2026-03-28
**3-Skill 迁移归档**

**Changed:**
- Archived legacy 3-skill skeleton to `docs/archive/legacy-skills/`
- Mapping: `spec-writer` → architect + docs
- Mapping: `architect-auditor` → architect + reviewer
- Mapping: `task-executor` → developer + tester + docs + security

---

### Enhancement Features (011-012)

#### [011-m4-enhancement-kit] - 2026-03-28
**M4 可选增强套件**

**Added:**
- 12 M4 enhancement skills (2 per role)
- `--enhanced` flag for commands
- Enhanced mode detection logic
- Metadata inheritance from `spec.md`

**Skills Added:**
- architect: `interface-contract-design`, `migration-planning`
- developer: `refactor-safely`, `dependency-minimization`
- tester: `integration-test-design`, `flaky-test-diagnosis`
- reviewer: `maintainability-review`, `risk-review`
- docs: `architecture-doc-sync`, `user-guide-update`
- security: `secret-handling-review`, `dependency-risk-review`

---

#### [012-performance-testing-skills] - 2026-03-28
**性能测试技能**

**Added:**
- 4 performance testing skills for tester role
- `performance-test-design`: Design performance test plans
- `benchmark-analysis`: Establish baselines and compare
- `load-test-orchestration`: Orchestrate load tests
- `performance-regression-analysis`: Detect performance regression

**Skills Total:** 37 (21 MVP + 16 M4)

---

### Validation Features (013-014)

#### [013-e2e-validation] - 2026-03-28
**端到端流程验证**

**Validated:**
- 5 core commands execution
- 6-role collaboration (architect, developer, tester, reviewer, docs, security)
- Governance rules AH-001 through AH-006
- All artifacts format compliance

**Result:** PASS_WITH_WARNINGS (2 minor cosmetic issues)

---

#### [014-enhanced-mode-validation] - 2026-03-28
**Enhanced 模式验证**

**Validated:**
- Enhanced mode activation via `enhanced: true` metadata
- 16 M4 skills triggering mechanism (4 triggered, 8 correctly not triggered)
- Integration test design scenarios
- Maintainability review (Score: 8/10)
- Risk review (Level: Low)

**Result:** PASS

---

### Governance Features (015)

#### [015-historical-features-audit] - 2026-03-28
**历史功能审计**

**Audited:**
- 10 historical features (003-012)
- AH-001~AH-006 governance compliance

**Fixed:**
- 4 major findings (AH-004 status truthfulness violations)
- Features 004-007 spec.md status updated from "Draft" to "Complete"

**Result:** All features governance-compliant

---

#### [016-release-preparation] - 2026-03-28
**发布准备**

**Cleanup:**
- Removed empty `docs/planning/` directory
- Archived early design docs to `docs/archive/early-design/`
- Updated README.md with missing features 001, 002, 002b

**Verified:**
- Document consistency (README, CHANGELOG, feature specs)
- Skills inventory (37 skills confirmed)
- Governance compliance (AH-001~AH-006 all pass)

**Added:**
- `release-checklist.md` - Pre-release verification checklist

**Result:** READY FOR v1.0.0 RELEASE

---

## Skills Summary

### MVP Core Skills (21)

| Role | Skills |
|------|--------|
| common (5) | artifact-reading, context-summarization, failure-analysis, execution-reporting, retry-strategy |
| architect (3) | requirement-to-design, module-boundary-design, tradeoff-analysis |
| developer (3) | feature-implementation, bugfix-workflow, code-change-selfcheck |
| tester (3) | unit-test-design, regression-analysis, edge-case-matrix |
| reviewer (3) | code-review-checklist, spec-implementation-diff, reject-with-actionable-feedback |
| docs (3) | readme-sync, changelog-writing, issue-status-sync |
| security (2) | auth-and-permission-review, input-validation-review |

### M4 Enhancement Skills (16)

| Role | Skills |
|------|--------|
| architect (2) | interface-contract-design, migration-planning |
| developer (2) | refactor-safely, dependency-minimization |
| tester (6) | integration-test-design, flaky-test-diagnosis, performance-test-design, benchmark-analysis, load-test-orchestration, performance-regression-analysis |
| reviewer (2) | maintainability-review, risk-review |
| docs (2) | architecture-doc-sync, user-guide-update |
| security (2) | secret-handling-review, dependency-risk-review |

---

## Governance Documents

| Document | Purpose |
|----------|---------|
| `package-spec.md` | Package specification and skill classifications |
| `role-definition.md` | 6-role definitions and boundaries |
| `io-contract.md` | I/O contract formats |
| `quality-gate.md` | Quality gates and severity levels |
| `collaboration-protocol.md` | Role collaboration protocols |
| `package-lifecycle.md` | Version management and lifecycle |
| `AGENTS.md` | Project-level execution rules |
| `docs/audit-hardening.md` | Audit hardening specification (AH-001~AH-006) |

---

## Commands

| Command | Description |
|---------|-------------|
| `/spec-start <feature>` | Create or refine a feature spec |
| `/spec-plan <feature>` | Generate implementation plan |
| `/spec-tasks <feature>` | Generate executable task list |
| `/spec-implement <feature>` | Implement a feature |
| `/spec-audit <feature>` | Audit feature governance compliance |

All commands support `--enhanced` flag to enable M4 enhancement kit.

---

## Migration Notes

### From 3-Skill to 6-Role Model

The project has migrated from the legacy 3-skill skeleton to the formal 6-role execution model:

- `spec-writer` → architect + docs collaboration
- `architect-auditor` → architect + reviewer separation
- `task-executor` → developer + tester + docs + security division

Legacy skills are archived in `docs/archive/legacy-skills/`.

---

## Version History

| Version | Date | Description |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial release with 20 features, 37 skills, full governance compliance, adapter architecture, versioning system |

---

## References

- [README.md](README.md) - Project overview
- [docs/skills-usage-guide.md](docs/skills-usage-guide.md) - Skills usage guide
- [docs/enhanced-mode-guide.md](docs/enhanced-mode-guide.md) - Enhanced mode guide
- [specs/](specs/) - Feature specifications and reports
---

### Template Features (017-018)

#### [017-contract-schema-pack] - 2026-03-28
**Contract Schema Pack**

**Added:**
- 17 artifact JSON schemas for all 6 roles
- `contracts/pack/registry.json` - unified contract registry
- `validate-schema.js` - CLI validation utility
- Machine-readable contract definitions for automation

**Result:** PASS - Enables programmatic contract discovery and validation

---

#### [018-template-and-bootstrap-foundation] - 2026-03-28
**模板化与 Bootstrap 基础包**

**Added:**
- Template pack structure (`templates/pack/minimal/`, `templates/pack/full/`)
- Profile mechanism (minimal: 21 MVP skills, full: 37 skills)
- CLI tools: `init.js`, `install.js`, `doctor.js`
- Documentation: `USAGE.md`, `PROFILE-COMPARISON.md`, `UPGRADE-STRATEGY.md`
- Content classification: `content-index.json`, `pack-version.json`

**Known Gaps:**
- Example project not implemented
- Contract schemas not included in template pack
- docs/ content not included in profiles

**Result:** COMPLETE with known gaps

---

#### [019-versioning-and-compatibility-foundation] - 2026-03-28
**版本化与兼容性基础**

**Added:**
- `VERSIONING.md` - Comprehensive versioning strategy document
- `compatibility-matrix.json` - Version compatibility matrix
- `docs/migration/migration-guide-template.md` - Migration guide template
- `docs/validation/release-checklist-template.md` - Enhanced release checklist with versioning checks
- Audit rules AH-007, AH-008, AH-009 for version governance

**Changed:**
- `AGENTS.md` - Added AH-007 to AH-009 versioning audit rules
- `README.md` - Added feature 019 to feature table

**Result:** PASS - Establishes versioning system for dependable, upgradeable package

---

### Adapter Features (020)

#### [020-orchestrator-and-workspace-adapters] - 2026-03-28
**Orchestrator 与 Workspace 适配层**

**Added:**
- `ADAPTERS.md` - Complete adapter architecture definition
- `adapters/registry.json` - Adapter registry for programmatic discovery
- `adapters/schemas/workspace-configuration.schema.json` - Workspace configuration schema
- `adapters/interfaces/orchestrator-adapter.interface.ts` - OrchestratorAdapter TypeScript interface
- `adapters/interfaces/workspace-adapter.interface.ts` - WorkspaceAdapter TypeScript interface
- `io-contract.md §8` - Adapter Interface Contract section
- `adapters/cli-local/` - CLI/Local Orchestrator Adapter (Must-Have, implemented)
- `adapters/local-repo/` - Local Repo Workspace Adapter (Must-Have, implemented)
- `adapters/shared/` - Shared utilities (version-check, profile-loader, workspace-config-validator)
- Design documents for Later adapters (GitHub Issue, GitHub PR, OpenClaw, External)

**Changed:**
- `README.md` - Added Adapter Architecture section
- Feature count updated from 19 to 20

**Result:** COMPLETE - Establishes adapter layer for upstream/downstream integration

---

### Later Adapters (021)

#### [021-github-issue-adapter] - 2026-03-29
**GitHub Issue Orchestrator Adapter**

**Added:**
- `adapters/github-issue/` - Complete GitHub Issue Orchestrator Adapter implementation
- `label-parser.js` - Parse Issue labels (milestone, role, command, task, risk)
- `body-parser.js` - Parse Issue body sections (Context, Goal, Constraints, Inputs, Expected Outputs)
- `issue-parser.js` - Main parser coordinating label + body parsing
- `github-client.js` - GitHub REST API client with rate limiting
- `webhook-handler.js` - Secure webhook handling (HMAC-SHA256 verification)
- `comment-templates.js` - Markdown templates for escalation, retry, result comments
- `retry-handler.js` - Retry decision logic with backoff
- `index.js` - Main adapter implementing OrchestratorAdapter interface
- `types.js` - TypeScript type definitions
- `github-issue.config.json` - Adapter configuration
- `README.md` - Complete adapter documentation

**Tests:**
- 7 test suites, 448 unit tests, all passing
- `label-parser.test.js` - 103 tests (100% coverage)
- `body-parser.test.js` - 42 tests
- `issue-parser.test.js` - 3 tests
- `github-client.test.js` - 92 tests
- `webhook-handler.test.js` - 80 tests (98.7% coverage)
- `retry-handler.test.js` - 68 tests
- `index.test.js` - 60 tests (interface compliance)

**Changed:**
- `adapters/registry.json` - Updated github-issue status to "implemented"
- Feature count updated from 20 to 21

**Security:**
- HMAC-SHA256 webhook signature verification
- Timing-safe comparison (crypto.timingSafeEqual)
- Rate limiting with exponential backoff

**Result:** COMPLETE - Enables task dispatch via GitHub Issues

---

### Later Adapters (022)

#### [022-github-pr-adapter] - 2026-03-29
**GitHub PR Workspace Adapter**

**Added:**
- `adapters/github-pr/` - Complete GitHub PR Workspace Adapter implementation
- `src/file-handler.js` - Handle changed_files (add/modify/delete/rename)
- `src/pr-client.js` - GitHub REST API client for PR operations
- `src/artifact-writer.js` - Write Execution Result artifacts to PR files
- `src/review-manager.js` - Post review comments and set review status
- `src/branch-manager.js` - Create/update PR branches
- `src/commit-builder.js` - Build commits from file changes
- `src/escalation-handler.js` - Output escalation to PR review comments
- `src/retry-handler.js` - Handle output failures with retry logic
- `src/path-validator.js` - Validate file paths before writing (BR-006)
- `src/comment-templates.js` - Markdown templates for PR comments
- `src/utils/` - Token manager, rate limit tracker, error classifier
- `index.js` - Main adapter implementing WorkspaceAdapter interface
- `types/github-pr.types.ts` - TypeScript type definitions
- `github-pr.config.json` - Adapter configuration
- `README.md` - Complete adapter documentation

**Tests:**
- 10 test suites, 159 tests, all passing
- `file-handler.test.js` - File operations tests
- `pr-client.test.js` - GitHub API client tests (25 tests)
- `artifact-writer.test.js` - Artifact output tests (25 tests)
- `review-manager.test.js` - Review comment/status tests
- `branch-manager.test.js` - Branch creation/update tests
- `commit-builder.test.js` - Commit building tests
- `index.test.js` - Interface compliance tests
- `path-validator.test.js` - Path validation tests
- `retry-handler.test.js` - Retry logic tests
- `tests/integration/workflow.test.js` - End-to-end workflow tests

**Documentation:**
- Troubleshooting guide (authentication, rate limits, branch issues)
- Security best practices (token management, path validation)
- Debug mode instructions

**Changed:**
- `adapters/registry.json` - Updated github-pr status to "implemented"
- `ADAPTERS.md` - Updated GitHub PR section to "Implemented"
- Feature count updated from 21 to 22

**Features:**
- Artifact output to PR files
- Changed files handling with commit creation
- PR status mapping (SUCCESS→APPROVE, PARTIAL→REQUEST_CHANGES, etc.)
- Escalation comment formatting
- Retry flow with user decision labels
- Path validation for security

**Result:** COMPLETE - Enables execution result output to GitHub Pull Requests

---

### Later Adapters (023)

#### [023-openclaw-adapter] - 2026-03-29
**OpenClaw Orchestrator Adapter**

**Added:**
- `adapters/openclaw/` - Complete OpenClaw Orchestrator Adapter implementation
- `types.js` - TypeScript-compatible type definitions (RoleEnum, RiskLevelEnum, DispatchPayload, etc.)
- `openclaw-client.js` - HTTP client with JWT/API key auth, connection pooling, retry, timeouts
- `message-parser.js` - Parse OpenClaw dispatch message → Dispatch Payload
- `schema-validator.js` - Validate Dispatch Payload against io-contract.md §1
- `result-sender.js` - POST execution results to OpenClaw /api/v1/results
- `escalation-handler.js` - POST escalation requests with decision response handling
- `retry-handler.js` - Configurable retry policy with risk-level limits (BR-002)
- `heartbeat-sender.js` - Periodic heartbeat with task-length-based intervals (BR-003)
- `index.js` - Main adapter implementing OrchestratorAdapter interface
- `openclaw.config.json` - Adapter configuration
- `package.json` - NPM package with Jest test configuration
- `README.md` - Complete adapter documentation

**Tests:**
- 4 test suites, 69 unit tests, all passing
- `message-parser.test.js` - Message parsing and field mapping tests
- `schema-validator.test.js` - Payload validation tests
- `retry-handler.test.js` - Retry logic and backoff calculation tests
- `index.test.js` - Main adapter interface compliance tests

**Features:**
- Bidirectional communication (dispatch reception + result callback)
- JWT/API key authentication with token refresh
- Exponential/linear/fixed backoff strategies
- Risk-level retry limits (low: 2, medium: 1, high/critical: 0)
- Heartbeat intervals based on task length
- Graceful error handling

**Changed:**
- `adapters/registry.json` - Updated openclaw status to "implemented"
- Feature count updated from 22 to 23

**Result:** COMPLETE - Enables bidirectional communication between OpenClaw manager and Expert Pack
