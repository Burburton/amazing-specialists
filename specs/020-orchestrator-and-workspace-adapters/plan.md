# Implementation Plan: 020-orchestrator-and-workspace-adapters

## Metadata
```yaml
feature_id: 020-orchestrator-and-workspace-adapters
plan_version: 1.0.0
created_at: 2026-03-28
depends_on: [017-contract-schema-pack, 018-template-and-bootstrap-foundation, 019-versioning-and-compatibility-foundation]
estimated_effort: High (2-3 sessions)
```

---

## Overview

本 Feature 将专家包从"可独立运行的执行层"升级为"可被上游稳定调用、可按项目形态接入下游的完整系统"。核心工作：

1. **Adapter Architecture Definition** - 定义 Orchestrator Adapter 和 Workspace Adapter 的边界与职责
2. **CLI/Local Adapter (Must-Have)** - 实现本地命令行调用适配器
3. **Local Repo Adapter (Must-Have)** - 实现本地文件系统适配器
4. **Adapter Design Documents (Later)** - 为 GitHub Issue、OpenClaw、GitHub PR 预留设计
5. **Profile-Workspace Integration Rules** - 建立 Profile 与 Workspace 的集成规则
6. **Adapter-Contract/Versioning Interface** - 建立与 Contract Pack 和 Versioning 的衔接规则

---

## Phase Breakdown

### Phase 1: Foundation (Architecture & Schema)

**Duration**: 1 session

**Tasks**:

| Task ID | Task Description | Role | Dependencies | Deliverable |
|---------|------------------|------|--------------|-------------|
| P1-T001 | Define ADAPTERS.md architecture document | architect | None | ADAPTERS.md |
| P1-T002 | Create adapters/registry.json schema | architect | P1-T001 | adapters/registry.json |
| P1-T003 | Define workspace-configuration.schema.json | architect | P1-T001 | adapters/schemas/workspace-configuration.schema.json |
| P1-T004 | Update io-contract.md with adapter interface section (§8) | architect | P1-T001 | io-contract.md (updated) |
| P1-T005 | Define OrchestratorAdapter interface (TypeScript) | architect | P1-T001 | adapters/interfaces/orchestrator-adapter.interface.ts |
| P1-T006 | Define WorkspaceAdapter interface (TypeScript) | architect | P1-T001 | adapters/interfaces/workspace-adapter.interface.ts |

**Validation**:
- ADAPTERS.md covers Orchestrator vs Workspace boundary (AC-001)
- registry.json contains adapter types, priorities, configurations (NFR-001)
- Interfaces align with io-contract.md §1, §2, §3 (BR-001)

**Done Criteria**:
- Architecture document complete
- Registry schema defined
- Interface contracts defined
- io-contract.md updated

---

### Phase 2: Core Implementation (Must-Have Adapters)

**Duration**: 1-2 sessions

**Tasks**:

#### Group 2A: CLI/Local Orchestrator Adapter (M-001)

| Task ID | Task Description | Role | Dependencies | Deliverable |
|---------|------------------|------|--------------|-------------|
| P2A-T001 | Create adapters/cli-local/ directory structure | developer | P1-T001 | adapters/cli-local/ |
| P2A-T002 | Implement arg-parser.js (CLI argument parsing) | developer | P2A-T001 | adapters/cli-local/arg-parser.js |
| P2A-T003 | Implement dispatch-normalizer.js | developer | P2A-T002 | adapters/cli-local/dispatch-normalizer.js |
| P2A-T004 | Implement dispatch-validator.js (contract validation) | developer | P2A-T003 | adapters/cli-local/dispatch-validator.js |
| P2A-T005 | Implement escalation-handler.js | developer | P2A-T003 | adapters/cli-local/escalation-handler.js |
| P2A-T006 | Implement retry-handler.js (interactive retry) | developer | P2A-T003 | adapters/cli-local/retry-handler.js |
| P2A-T007 | Create adapter config (cli-local.config.json) | developer | P2A-T003 | adapters/cli-local/cli-local.config.json |

**Validation**:
- arg-parser correctly extracts all dispatch fields (Dispatch Input Mapping table)
- dispatch-normalizer produces valid Dispatch Payload (io-contract.md §1)
- dispatch-validator uses contracts/pack validation (BR-002)
- escalation-handler maps escalation to console output (Escalation Mapping table)

**Done Criteria**:
- CLI/Local adapter fully functional (AC-002)
- Supports dispatch command entry point
- Contract validation integrated

#### Group 2B: Local Repo Workspace Adapter (M-002)

| Task ID | Task Description | Role | Dependencies | Deliverable |
|---------|------------------|------|--------------|-------------|
| P2B-T001 | Create adapters/local-repo/ directory structure | developer | P1-T001 | adapters/local-repo/ |
| P2B-T002 | Implement artifact-handler.js (file output) | developer | P2B-T001 | adapters/local-repo/artifact-handler.js |
| P2B-T003 | Implement changed-files-handler.js | developer | P2B-T001 | adapters/local-repo/changed-files-handler.js |
| P2B-T004 | implement console-reporter.js | developer | P2B-T002, P2B-T003 | adapters/local-repo/console-reporter.js |
| P2B-T005 | Implement escalation-output-handler.js | developer | P2B-T001 | adapters/local-repo/escalation-output-handler.js |
| P2B-T006 | Implement retry-handler.js (local repo retry) | developer | P2B-T001 | adapters/local-repo/retry-handler.js |
| P2B-T007 | Create adapter config (local-repo.config.json) | developer | P2B-T001 | adapters/local-repo/local-repo.config.json |
| P2B-T008 | Implement path-validator.js (BR-006) | developer | P2B-T001 | adapters/local-repo/path-validator.js |

**Validation**:
- artifact-handler writes artifacts to local filesystem (Artifact Output Mapping table)
- changed-files-handler handles added/modified/deleted/renamed
- console-reporter outputs summary/issues/recommendation
- path-validator validates write paths (BR-006)

**Done Criteria**:
- Local Repo adapter fully functional (AC-003)
- Supports artifact file output
- Supports changed files handling
- Supports escalation console output

#### Group 2C: Version Compatibility & Profile Integration

| Task ID | Task Description | Role | Dependencies | Deliverable |
|---------|------------------|------|--------------|-------------|
| P2C-T001 | Implement version-check.js (compatibility-matrix.json) | developer | P1-T001 | adapters/shared/version-check.js |
| P2C-T002 | Implement profile-loader.js (templates/pack) | developer | P1-T001 | adapters/shared/profile-loader.js |
| P2C-T003 | Create profile-workspace-mapping.json | developer | P2C-T002 | adapters/shared/profile-workspace-mapping.json |
| P2C-T004 | Implement workspace-config-validator.js | developer | P1-T003 | adapters/shared/workspace-config-validator.js |

**Validation**:
- version-check reads compatibility-matrix.json (BR-003)
- profile-loader reads templates/pack/pack-version.json (BR-004)
- profile-workspace-mapping covers minimal/full → local_repo/github_repo (IR-001~IR-004)

**Done Criteria**:
- Version compatibility check implemented (AC-009)
- Profile configuration load implemented (AC-007)

---

### Phase 3: Integration (Examples & Design Documents)

**Duration**: 1 session

**Tasks**:

#### Group 3A: Examples (M-004, M-005)

| Task ID | Task Description | Role | Dependencies | Deliverable |
|---------|------------------|------|--------------|-------------|
| P3A-T001 | Create examples/cli-workflow.md | docs | P2A-T007 | examples/cli-workflow.md |
| P3A-T002 | Create examples/local-repo-output.md | docs | P2B-T007 | examples/local-repo-output.md |
| P3A-T003 | Create validation test script for CLI workflow | tester | P3A-T001 | adapters/cli-local/test-cli-workflow.js |
| P3A-T004 | Create validation test script for Local Repo | tester | P3A-T002 | adapters/local-repo/test-local-repo.js |

**Validation**:
- Examples are executable and verifiable (AC-010)
- Test scripts pass

**Done Criteria**:
- CLI workflow example exists (M-004)
- Local repo output example exists (M-005)
- Examples verified

#### Group 3B: Later Adapter Design Documents (L-001, L-002, L-003, L-004)

| Task ID | Task Description | Role | Dependencies | Deliverable |
|---------|------------------|------|--------------|-------------|
| P3B-T001 | Create docs/adapters/ directory | docs | None | docs/adapters/ |
| P3B-T002 | Write github-issue-adapter-design.md | architect | P1-T001 | docs/adapters/github-issue-adapter-design.md |
| P3B-T003 | Write github-pr-adapter-design.md | architect | P1-T001 | docs/adapters/github-pr-adapter-design.md |
| P3B-T004 | Write openclaw-adapter-design.md | architect | P1-T001 | docs/adapters/openclaw-adapter-design.md |
| P3B-T005 | Write external-adapter-design.md | architect | P1-T001 | docs/adapters/external-adapter-design.md |

**Validation**:
- Each design document contains:
  - Adapter type classification
  - Input/Output mapping tables
  - Escalation mapping
  - Retry strategy
  - Interface requirements

**Done Criteria**:
- GitHub Issue adapter design exists (AC-004)
- GitHub PR adapter design exists (AC-005)
- OpenClaw adapter design exists (AC-004)
- External adapter design exists (L-004)

---

### Phase 4: Documentation & Sync (Governance Update)

**Duration**: 0.5 session

**Tasks**:

| Task ID | Task Description | Role | Dependencies | Deliverable |
|---------|------------------|------|--------------|-------------|
| P4-T001 | Update README.md with adapter architecture | docs | P1-T001, P2A, P2B | README.md |
| P4-T002 | Update package.json version (if release) | docs | All | package.json |
| P4-T003 | Update CHANGELOG.md | docs | All | CHANGELOG.md |
| P4-T004 | Update compatibility-matrix.json (if new component) | architect | P2C | compatibility-matrix.json |
| P4-T005 | Create docs/adapters/adapter-usage-guide.md | docs | P1-T001 | docs/adapters/adapter-usage-guide.md |
| P4-T006 | Governance sync check (AH-001~AH-009) | reviewer | All | completion-report.md |

**Validation**:
- README reflects adapter architecture (AC-011)
- CHANGELOG has entry (AH-008)
- Governance documents consistent (AH-001~AH-005)
- Version declarations synchronized (AH-007)

**Done Criteria**:
- README updated
- CHANGELOG updated
- Governance consistency verified
- completion-report.md generated

---

## Parallel Execution

### Independent Tasks (Can Run Concurrently)

**Phase 1**:
- P1-T002, P1-T003, P1-T004, P1-T005, P1-T006 can run **after** P1-T001 (architect defines architecture)

**Phase 2**:
- **Group 2A (CLI/Local)** and **Group 2B (Local Repo)** are **fully independent** - can run in parallel
- Group 2C can start after P1-T001 (depends on architecture, not on adapter implementations)

**Phase 3**:
- **Group 3A (Examples)** and **Group 3B (Design Docs)** are **fully independent** - can run in parallel
- P3A-T001 depends on P2A, P3A-T002 depends on P2B
- P3B-T001~T005 only depend on P1-T001 (architecture)

**Phase 4**:
- P4-T001~T005 can run in parallel after Phase 3
- P4-T006 (governance check) runs after all tasks complete

### Parallel Execution Strategy

```
Session 1:
  └── P1-T001 (architect: define architecture) [SEQUENTIAL START]
  ├── P1-T002, P1-T003, P1-T004, P1-T005, P1-T006 [PARALLEL after T001]

Session 2:
  ├── Group 2A (CLI/Local Adapter) [PARALLEL]
  ├── Group 2B (Local Repo Adapter) [PARALLEL]
  ├── Group 2C (Version/Profile) [PARALLEL with 2A/2B]

Session 3:
  ├── Group 3A (Examples) [PARALLEL - depends on 2A/2B]
  ├── Group 3B (Design Docs) [PARALLEL - depends only on P1]
  ├── Phase 4 (Docs & Sync) [SEQUENTIAL after 3A/3B]
```

---

## Dependencies

### External Dependencies (From Prior Features)

| Dependency | Source Feature | Version | Purpose |
|------------|----------------|---------|---------|
| io-contract.md | Core | 1.0.0 | Dispatch/Execution/Artifact/Escalation schema |
| contracts/pack/registry.json | 017-contract-schema-pack | 1.0.0 | Contract validation |
| contracts/pack/validate-schema.js | 017-contract-schema-pack | 1.0.0 | Schema validation utility |
| templates/pack/pack-version.json | 018-template-and-bootstrap-foundation | 1.0.0 | Profile version definitions |
| templates/pack/minimal/ | 018-template-and-bootstrap-foundation | 1.0.0 | Minimal profile template |
| templates/pack/full/ | 018-template-and-bootstrap-foundation | 1.0.0 | Full profile template |
| compatibility-matrix.json | 019-versioning-and-compatibility-foundation | 1.0.0 | Version compatibility |
| VERSIONING.md | 019-versioning-and-compatibility-foundation | 1.0.0 | Versioning strategy |
| role-definition.md | 002-role-model-alignment | 1.0.0 | 6-role definitions |
| package-spec.md | Core | 1.0.0 | Package specification |

### Internal Dependencies (Within Feature)

| From | To | Reason |
|------|-----|--------|
| P1-T001 (ADAPTERS.md) | P1-T002~T006 | Architecture must be defined first |
| P1-T001 | P2A, P2B, P2C | All implementation depends on architecture |
| P2A (CLI/Local) | P3A-T001, P3A-T003 | Examples require working adapter |
| P2B (Local Repo) | P3A-T002, P3A-T004 | Examples require working adapter |
| All Phases | P4-T006 | Governance check requires all work complete |

---

## Validation Checkpoints

### VP-1: Architecture Validation (After Phase 1)
- ADAPTERS.md defines Orchestrator vs Workspace boundary ✓
- registry.json schema valid ✓
- Interfaces align with io-contract.md ✓
- **Validator**: reviewer

### VP-2: Adapter Implementation Validation (After Phase 2)
- CLI/Local adapter: dispatch → valid Dispatch Payload ✓
- Local Repo adapter: Execution Result → file output ✓
- Contract validation passes ✓
- Version compatibility check works ✓
- **Validator**: tester

### VP-3: Integration Validation (After Phase 3)
- CLI workflow example executable ✓
- Local repo output example executable ✓
- Design documents complete (L-001~L-004) ✓
- **Validator**: tester + docs

### VP-4: Governance Validation (After Phase 4)
- README reflects adapter architecture ✓
- CHANGELOG has entry ✓
- io-contract.md consistent ✓
- AH-001~AH-009 audit rules pass ✓
- **Validator**: reviewer

---

## Risk Assessment

| Risk ID | Risk Description | Severity | Likelihood | Mitigation |
|---------|------------------|----------|------------|------------|
| R-001 | Adapter interface conflict with io-contract.md | High | Low | architect defines interfaces before implementation, reviewer validates alignment |
| R-002 | Contract validation performance exceeds 100ms (NFR-004) | Medium | Low | Use efficient schema validation, benchmark during development |
| R-003 | Profile-Workspace mapping unclear | Medium | Medium | Define explicit IR-001~IR-004 rules in architecture document |
| R-004 | Version compatibility check fails on edge cases | Medium | Low | Test against various version combinations |
| R-005 | Examples not executable due to environment differences | Medium | Medium | Use relative paths, document prerequisites |
| R-006 | Governance drift after implementation | High | Medium | Apply AH-001~AH-009 rules in Phase 4 |
| R-007 | Adapter isolation violated (NFR-003) | High | Low | architect reviews boundary in design, tester validates independence |

---

## Estimated Effort

| Phase | Estimated Duration | Role Allocation |
|-------|-------------------|-----------------|
| Phase 1: Foundation | 1 session (2-3h) | architect (primary), developer (interface) |
| Phase 2: Core Implementation | 1-2 sessions (4-6h) | developer (primary), tester (validation) |
| Phase 3: Integration | 1 session (2-3h) | docs (examples), architect (design docs), tester (validation) |
| Phase 4: Documentation & Sync | 0.5 session (1h) | docs (primary), reviewer (audit) |

**Total Estimated Effort**: 3.5-4 sessions (7-12 hours)

---

## Deliverables Summary

| ID | Deliverable | Path | Phase |
|----|-------------|------|-------|
| D-001 | ADAPTERS.md | ADAPTERS.md | Phase 1 |
| D-002 | adapters/registry.json | adapters/registry.json | Phase 1 |
| D-003 | adapters/cli-local/ | adapters/cli-local/ | Phase 2A |
| D-004 | adapters/local-repo/ | adapters/local-repo/ | Phase 2B |
| D-005 | github-issue-adapter-design.md | docs/adapters/github-issue-adapter-design.md | Phase 3B |
| D-006 | openclaw-adapter-design.md | docs/adapters/openclaw-adapter-design.md | Phase 3B |
| D-007 | github-pr-adapter-design.md | docs/adapters/github-pr-adapter-design.md | Phase 3B |
| D-008 | README.md update | README.md | Phase 4 |
| D-009 | examples/cli-workflow.md | examples/cli-workflow.md | Phase 3A |
| D-010 | examples/local-repo-output.md | examples/local-repo-output.md | Phase 3A |
| D-011 | io-contract.md update | io-contract.md | Phase 1 |

---

## Acceptance Criteria Mapping

| AC | Description | Phase | Key Tasks |
|----|-------------|-------|-----------|
| AC-001 | Adapter Architecture Defined | Phase 1 | P1-T001, P1-T002 |
| AC-002 | CLI/Local Adapter Implemented | Phase 2A | P2A-T001~T007 |
| AC-003 | Local Repo Adapter Implemented | Phase 2B | P2B-T001~T008 |
| AC-004 | Dispatch Mapping Complete | Phase 2A + 3B | P2A, P3B-T002, P3B-T004 |
| AC-005 | Artifact Mapping Complete | Phase 2B + 3B | P2B, P3B-T003 |
| AC-006 | Escalation Mapping Complete | Phase 2A/2B + 3B | P2A-T005, P2B-T005 |
| AC-007 | Profile-Workspace Integration Rules | Phase 2C | P2C-T001~T004 |
| AC-008 | Adapter-Contract Interface | Phase 2A/2B | P2A-T004, P2B-T008 |
| AC-009 | Adapter-Versioning Interface | Phase 2C | P2C-T001, P2C-T002 |
| AC-010 | Examples Provided | Phase 3A | P3A-T001~T004 |
| AC-011 | Docs Sync Complete | Phase 4 | P4-T001~T006 |

---

## Next Recommended Command

建议执行 `/spec-tasks 020-orchestrator-and-workspace-adapters` 生成详细任务清单，或执行 `/spec-implement 020-orchestrator-and-workspace-adapters` 开始实施。