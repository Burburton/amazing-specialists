# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
| docs (2) | readme-sync, changelog-writing |
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
