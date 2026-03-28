# Implementation Plan: 018-template-and-bootstrap-foundation

## design_note

### background

The OpenCode expert package has completed 17 features with full 6-role execution model and 37 skills. However, external reuse barrier is high - new users struggle to understand which files to copy, how to initialize, and how to verify integration. The repository exposes too much internal structure without clear separation between "source repo for development" and "template for external use".

### feature_goal

Transform the expert package from a "source repository" into a "reusable project template foundation" with minimal product entry points, focusing on **templating first, productization second**. Provide clear separation between template pack and source internals, support profile-based distribution, and enable bootstrap CLI operations.

### input_sources

- `specs/018-template-and-bootstrap-foundation/spec.md` - Feature specification
- `package-spec.md` - Package governance (defines core components)
- `role-definition.md` - 6-role skills (defines required skills per role)
- `io-contract.md` - Contract definitions (defines contract integration)
- `contracts/pack/registry.json` - Existing contract registry
- `.opencode/commands/` - Existing commands structure
- `.opencode/skills/` - Existing skills structure
- `README.md` - Current package description

### requirement_to_design_mapping

| requirement | design_decision | rationale |
|-------------|-----------------|-----------|
| Template Structure Definition | Create `templates/pack/` directory with `minimal/` and `full/` subdirectories | Physical separation enables clear distinction between reusable content and source internals; profile subdirectories enable user selection |
| Content Classification | Define explicit Required/Optional/Extension/Source-Only categories with file lists | Prevents accidental inclusion of internal artifacts; guides user on what to expect |
| Profile Support (minimal/full) | minimal: Required files only (~50 files); full: Required + Optional (~150 files) | Two profiles cover 80%+ use cases per A-004; enables progressive enhancement |
| init Command | Node.js CLI: `init <target-dir> [--profile minimal|full] [--force]` | Node.js matches existing tooling (A-001); cross-platform; structured error handling |
| install Command | Node.js CLI: `install [--profile minimal|full] [--upgrade] [--dry-run]` | Enables in-place updates; --dry-run allows preview; preserves user extensions (BR-004) |
| doctor Command | Node.js CLI: `doctor [--verbose] [--fix]` with structured checks | Validates template health; --fix enables auto-repair where possible; structured report output |
| Template Pack Directory | `templates/pack/{minimal,full}/` + `templates/cli/` + `templates/*.md` docs | Centralized location per BR-001; enables single-source updates |
| template-manifest.json | Instance metadata: version, profile, timestamps, source reference | Enables upgrade detection (BR-005); human-readable JSON per NFR-005 |
| Source-Only Exclusion | Exclude: specs/001-017/, verification reports, docs/archive/, docs/infra/ | Prevents internal leakage (BR-007); security review validation (AC-008) |
| Contract Schema Integration | Include `contracts/pack/registry.json` in template; doctor validates registry | Enables downstream contract extension; validates schema presence |
| Example Project | `templates/pack/full/examples/sample-workflow/` static demonstration | Shows minimal workflow without full implementation complexity |
| Documentation | templates/USAGE.md, templates/PROFILE-COMPARISON.md, templates/UPGRADE-STRATEGY.md | Guides users; README updates reference template location |

### design_summary

Layered architecture with three components:

1. **Template Pack Layer** (`templates/pack/`): Contains profile-specific template content physically separated from source internals. Each profile (minimal/full) is a complete, self-contained template directory.

2. **CLI Layer** (`templates/cli/`): Node.js-based bootstrap commands (init, install, doctor) that operate on template pack and target projects. Handles file operations, manifest management, and health validation.

3. **Documentation Layer** (`templates/*.md`): Usage guide, profile comparison, upgrade strategy docs for template consumers.

### constraints

- Do not break existing 6-role workflow commands (spec-start through spec-audit)
- Do not modify existing governance documents (package-spec.md, role-definition.md, etc.)
- Template pack must be stable across source repo version updates (BR-006)
- CLI must complete doctor in <5 seconds (NFR-004)
- minimal profile must have <100 files (NFR-002)
- Backward compatibility with partial template structures (NFR-006)

### non_goals

- Complex Web UI (out of scope - templating phase only)
- npm publishing (future phase - current focus is template pack)
- Multi-project management (single project scope for MVP)
- Automated version sync (manual upgrade strategy first)
- Plugin ecosystem (premature abstraction)
- Orchestrator adapters (separate concern)

### assumptions

- Node.js is acceptable CLI implementation (A-001)
- Copy-based distribution sufficient for MVP (A-002)
- Users understand spec-driven workflow basics (A-003)
- Two profiles cover 80% use cases (A-004)
- Manual upgrade acceptable initially (A-005)
- Template files stable across versions (A-006)
- Single example sufficient (A-007)
- doctor checks comprehensive enough (A-008)
- minimal .gitignore needed (Q-008 resolved: Yes)

### open_questions

| question | why_it_matters | temporary_assumption | impact_surface | recommended_next_step | blocker |
|----------|----------------|---------------------|----------------|----------------------|---------|
| Should CLI be shell scripts or Node.js? | Implementation language, cross-platform support | Node.js (matches existing tooling) | templates/cli/*.js | Confirm in tasks.md | false |
| Should template pack be npm package? | Distribution mechanism | No (future phase), copy-based first | Distribution docs | Document in UPGRADE-STRATEGY.md | false |
| How to handle partial template projects? | Backward compatibility edge case | Merge with warnings, preserve user files | install command | Test in AC-003 validation | false |

---

## Module Decomposition

### M1: Template Pack Module

**Responsibility**: Provide organized, profile-specific template content for distribution.

**Components**:
- `templates/pack/minimal/` - Minimal profile content
- `templates/pack/full/` - Full profile content (extends minimal)
- `templates/pack/manifest-template.json` - Template for instance manifests
- `templates/pack/pack-version.json` - Template pack version tracking

**Key Files**:
```
templates/pack/
├── minimal/
│   ├── AGENTS.md
│   ├── .opencode/commands/ (5 core commands)
│   ├── .opencode/skills/ (6-role MVP: ~21 skills)
│   ├── contracts/pack/registry.json
│   ├── package-spec.md
│   ├── role-definition.md
│   ├── io-contract.md
│   ├── quality-gate.md
│   ├── collaboration-protocol.md
│   └── .gitignore
├── full/
│   ├── (inherits minimal content)
│   ├── .opencode/skills/ (M4 additions: ~16 skills)
│   ├── docs/templates/
│   ├── docs/rules/
│   ├── docs/validation/
│   ├── docs/enhanced-mode-guide.md
│   ├── examples/sample-workflow/
│   └── contracts/pack/*.schema.json
├── manifest-template.json
└── pack-version.json
```

**Dependencies**: None (source content)

**Validation**: doctor checks file presence per profile

---

### M2: CLI Module

**Responsibility**: Execute bootstrap operations (init, install, doctor).

**Components**:
- `templates/cli/init.js` - Template initialization
- `templates/cli/install.js` - Template install/update
- `templates/cli/doctor.js` - Health validation
- `templates/cli/lib/` - Shared utilities

**Key Functions**:

| Function | Module | Description |
|----------|--------|-------------|
| `copyTemplateFiles(profile, targetDir)` | init.js | Copy profile-specific files to target |
| `generateManifest(profile, targetDir)` | init.js | Create template-manifest.json |
| `readManifest(targetDir)` | lib/manifest.js | Parse existing manifest |
| `compareVersions(source, instance)` | lib/version.js | Detect upgrade opportunity |
| `syncFiles(profile, targetDir, upgrade)` | install.js | Update template files preserving extensions |
| `runDoctorChecks(targetDir, profile)` | doctor.js | Execute health validation checks |
| `attemptAutoFix(targetDir, issues)` | doctor.js | Apply automatic fixes |

**Error Handling**:

| Error | Module | Response |
|-------|--------|----------|
| Target non-empty without --force | init.js | Error + suggestion to use --force |
| Invalid profile | init.js, install.js | Error + list valid options |
| Copy failure | init.js | Error + partial cleanup |
| No manifest | install.js | Suggest init instead |
| Version mismatch without --upgrade | install.js | Warning only |
| Missing required files | doctor.js | FAIL + fix recommendation |

**Dependencies**: Template Pack Module (reads template content)

---

### M3: Documentation Module

**Responsibility**: Guide template users on usage, profiles, upgrades.

**Components**:
- `templates/USAGE.md` - Template usage guide
- `templates/PROFILE-COMPARISON.md` - Profile differences
- `templates/UPGRADE-STRATEGY.md` - Upgrade guidance
- `README.md` (updated) - Reference template pack location

**Content Structure**:

| Document | Sections |
|----------|----------|
| USAGE.md | Quick start, init/install/doctor usage, common patterns |
| PROFILE-COMPARISON.md | File lists, skill counts, use case recommendations |
| UPGRADE-STRATEGY.md | Manual upgrade flow, conflict handling, versioning |

**Dependencies**: None

---

### M4: Example Project Module

**Responsibility**: Demonstrate minimal template usage.

**Components**:
- `templates/pack/full/examples/sample-workflow/` - Static example
- Sample spec.md, plan.md, tasks.md
- README.md explaining demonstration

**Dependencies**: Template Pack Module (demonstrates usage)

---

## Data Flow

### Flow 1: Template Initialization

```
User: init <target-dir> --profile minimal
      │
      ▼
CLI: Validate target (empty or --force)
      │
      ▼
CLI: Select profile (minimal/full)
      │
      ▼
CLI: Copy templates/pack/{profile}/ to target/
      │
      ▼
CLI: Create placeholder dirs (specs/, artifacts/)
      │
      ▼
CLI: Generate template-manifest.json
      │
      ▼
CLI: Output success summary + next steps
```

### Flow 2: Template Install/Update

```
User: install --upgrade
      │
      ▼
CLI: Read target/template-manifest.json
      │
      ├─[no manifest]──► Error: suggest init
      │
      ▼
CLI: Compare pack-version.json vs manifest.template_version
      │
      ├─[no --upgrade, version mismatch]──► Warning only
      │
      ▼
CLI: List files to add/change/remove
      │
      ├─[--dry-run]──► Show changes, exit
      │
      ▼
CLI: Apply changes (preserve specs/, artifacts/)
      │
      ▼
CLI: Update template-manifest.json
      │
      ▼
CLI: Output change summary
```

### Flow 3: Template Health Check

```
User: doctor [--verbose] [--fix]
      │
      ▼
CLI: Check 1: manifest-valid
      │
      ▼
CLI: Check 2: required-files
      │
      ▼
CLI: Check 3: governance-consistent
      │
      ▼
CLI: Check 4: skills-complete
      │
      ▼
CLI: Check 5: commands-complete
      │
      ▼
CLI: Check 6: contracts-registry
      │
      ▼
CLI: Check 7: no-source-leak
      │
      ▼
CLI: Output structured report (PASS/WARN/FAIL)
      │
      ├─[--fix]──► Apply auto-fixes where possible
      │
      ▼
CLI: Provide fix recommendations for unfixable
```

---

## Failure Handling

### Failure Categories

| Category | Example | Recovery |
|----------|---------|----------|
| **Input Validation** | Invalid profile, missing target dir | Immediate error + guidance |
| **File Operation** | Copy failure, write failure | Partial cleanup + error |
| **State Conflict** | Target non-empty, version mismatch | Warning or error with options |
| **Validation Failure** | Missing required files | FAIL + fix recommendation |
| **Extension Preservation** | User file conflicts with template | Warn + suggest resolution |

### Error Messages

| Error Code | Message | Suggested Action |
|------------|---------|------------------|
| `E001` | Target directory not empty | Use --force or choose empty directory |
| `E002` | Invalid profile: {profile} | Valid profiles: minimal, full |
| `E003` | Copy failed: {file} | Check permissions, retry |
| `E004` | No template-manifest.json found | Run init first |
| `E005` | Required file missing: {file} | Run install or manual copy |
| `E006` | User file conflicts: {file} | Rename user file or skip template |

---

## Validation Strategy

### doctor Checks

| Check ID | Check Name | Scope | PASS Condition |
|----------|------------|-------|----------------|
| `D001` | manifest-valid | template-manifest.json exists and parses | File present, JSON valid, required fields present |
| `D002` | required-files | All BR-002 required files present | AGENTS.md, commands/, skills/, registry.json, governance files |
| `D003` | governance-consistent | AGENTS.md references match files | All referenced files exist |
| `D004` | skills-complete | Skills directories match profile | minimal: 6-role MVP; full: MVP + M4 |
| `D005` | commands-complete | 5 core commands present | spec-start, spec-plan, spec-tasks, spec-implement, spec-audit |
| `D006` | contracts-registry | registry.json exists and valid | File present, JSON valid |
| `D007` | no-source-leak | No source-only files present | No specs/001-017/, no verification reports, no docs/archive/ |

### Validation Methods

1. **File Presence Check**: Simple fs.existsSync for required paths
2. **JSON Validity**: Parse JSON files, check required fields
3. **Directory Count**: Count skills/commands per profile expectation
4. **Exclusion Check**: Verify source-only directories/files absent

### Performance Target

All doctor checks complete in <5 seconds (NFR-004) for typical project (~150 files).

---

## Risks / Tradeoffs

### Identified Risks

| Risk ID | Risk | Severity | Mitigation |
|---------|------|----------|------------|
| R-001 | Template content drift from source repo | Major | Establish pack-version.json sync process; manual review before release |
| R-002 | CLI cross-platform compatibility issues | Minor | Test on Windows/macOS/Linux; use Node.js fs module correctly |
| R-003 | User confusion on profile selection | Minor | Clear PROFILE-COMPARISON.md; doctor reports profile mismatch |
| R-004 | Extension preservation during upgrade | Major | Explicit extension isolation (BR-004); conflict warnings |
| R-005 | Security: unintended info exposure | Major | Security review pass (AC-008); explicit Source-Only exclusion |
| R-006 | Breaking changes in template versions | Major | Document in UPGRADE-STRATEGY.md; version compatibility markers |

### Tradeoffs

| Tradeoff | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| CLI Language | Node.js | Shell scripts | Cross-platform, existing tooling alignment (A-001) |
| Distribution | Copy-based | npm package | MVP simplicity (A-002); npm deferred to future phase |
| Profile Count | 2 (minimal/full) | 3+ profiles | Two covers 80%+ (A-004); more adds complexity |
| Upgrade Strategy | Manual | Auto-sync | User control (BR-006); prevents surprise changes |
| Example Completeness | Static | Runnable | Demonstration focus (Q-006); runnable adds maintenance burden |

---

## Requirement Traceability

### Spec Requirement → Design Decision

| Spec Requirement | Design Section | Validation |
|------------------|----------------|------------|
| Template Structure Design (In Scope) | M1: Template Pack Module | AC-001 |
| Profile Design (In Scope) | M1: minimal/full subdirs | AC-001 |
| init Command (In Scope) | M2: CLI Module / init.js | AC-002 |
| install Command (In Scope) | M2: CLI Module / install.js | AC-003 |
| doctor Command (In Scope) | M2: CLI Module / doctor.js | AC-004 |
| Template Pack Directory (In Scope) | M1: templates/pack/ | AC-001 |
| Profile Selection Logic (In Scope) | M2: profile detection logic | AC-002, AC-003 |
| Upgrade/Sync Strategy (In Scope) | M3: UPGRADE-STRATEGY.md, M2 install | AC-003 |
| Example Project (In Scope) | M4: Example Project Module | AC-005 |
| Documentation (In Scope) | M3: Documentation Module | AC-006 |
| Contract Schema Integration (In Scope) | M1: contracts/pack/registry.json | AC-007 |
| BR-001: Template Separation | M1: templates/pack/ physical separation | AC-001 |
| BR-002: Required Content Minimum | M1: minimal/ content list | AC-001, AC-004 D002 |
| BR-003: Profile Selection Logic | M1: minimal vs full definition | AC-001 |
| BR-004: Extension Isolation | M2: install preserves specs/, artifacts/ | AC-003 |
| BR-005: Version Tracking | M1: template-manifest.json | AC-002, AC-003 |
| BR-006: Upgrade Strategy | M3: UPGRADE-STRATEGY.md | AC-003 |
| BR-007: Source-Only Exclusion | M1: exclusion list, AC-008 | AC-004 D007 |
| BR-008: Contract Schema Linkage | M1: contracts/pack/ | AC-007 |
| NFR-001: Discoverability | M3: README reference | AC-006 |
| NFR-002: Minimal Footprint | M1: minimal ~50 files | AC-001 |
| NFR-003: Full Profile Completeness | M1: full ~150 files | AC-001 |
| NFR-004: Doctor Execution Speed | M2: doctor.js optimization | AC-004 |
| NFR-005: Template Manifest Clarity | M1: manifest-template.json | AC-002 |
| NFR-006: Backward Compatibility | M2: install handles partial | AC-003 |

### Acceptance Criteria → Validation

| AC | Validation Method | Responsible Role |
|----|-------------------|------------------|
| AC-001 | File presence check, structure review | tester |
| AC-002 | CLI execution test, output validation | tester |
| AC-003 | CLI execution test, upgrade scenario test | tester |
| AC-004 | doctor execution test, all check IDs | tester |
| AC-005 | Example directory review, README check | reviewer |
| AC-006 | Documentation review, README check | docs |
| AC-007 | registry.json presence, doctor D006 | tester |
| AC-008 | Security review, exclusion verification | security |

---

## Implementation Order

### Phase 1: Template Pack Structure (Parallel-Safe)

1. Create `templates/pack/minimal/` directory structure
2. Copy required content from source repo to minimal/
3. Create `templates/pack/full/` directory structure
4. Copy optional content to full/
5. Create manifest-template.json
6. Create pack-version.json

### Phase 2: CLI Implementation (Sequential)

1. Implement templates/cli/lib/ shared utilities
2. Implement init.js
3. Implement install.js
4. Implement doctor.js

### Phase 3: Documentation (Parallel-Safe)

1. Create templates/USAGE.md
2. Create templates/PROFILE-COMPARISON.md
3. Create templates/UPGRADE-STRATEGY.md
4. Update README.md

### Phase 4: Example Project (Parallel-Safe)

1. Create examples/sample-workflow/ structure
2. Create sample spec.md, plan.md, tasks.md
3. Create example README.md

### Phase 5: Validation & Review (Sequential)

1. tester: Run init/install/doctor tests
2. security: AC-008 security review
3. reviewer: Review completeness
4. docs: Final documentation sync

---

## Estimated Effort

| Module | Effort | Parallel-Safe |
|--------|--------|---------------|
| M1: Template Pack | 2-3 days | Yes |
| M2: CLI | 3-4 days | No (sequential) |
| M3: Documentation | 1-2 days | Yes |
| M4: Example Project | 1 day | Yes |
| Validation | 1-2 days | No |
| **Total** | **8-12 days** | - |