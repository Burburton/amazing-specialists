# Feature: 018-template-and-bootstrap-foundation

## Background

The OpenCode expert package has completed 17 features (001-017), establishing:
- Complete 6-role execution model with 37 skills (21 MVP + 16 M4)
- 17 artifact contracts with machine-readable JSON Schema
- 5 core workflow commands (spec-start, spec-plan, spec-tasks, spec-implement, spec-audit)
- Comprehensive governance documentation
- Validation and verification layers

**Current State**:
- The repository is a fully functional expert package source repository
- All features are complete and validated
- Governance documents are aligned and consistent

**Problem**:
- External reuse barrier is high - new users struggle to understand:
  - Which files must be copied vs optional
  - How to initialize into a new project
  - How to verify correct integration
- The repository exposes too much internal structure (specs/, validation reports, historical artifacts)
- No clear separation between "source repo for development" and "template for external use"
- No minimal CLI entry point for bootstrap operations

---

## Goal

Transform the expert package from a "source repository" into a "reusable project template foundation" with minimal product entry points, focusing on **templating first, productization second**.

### Primary Objectives

1. **Template Structure Definition** - Define what constitutes a reusable template vs source repo internals
2. **Content Classification** - Distinguish required content, optional content, and extension content
3. **Profile Support** - Support at least two template profiles (minimal / full)
4. **Bootstrap Entry** - Provide minimal CLI covering init / install / doctor commands
5. **Boundary Clarification** - Clear separation between template repo, source repo, and future npm distribution

---

## Scope

### In Scope

| Item | Description |
|------|-------------|
| Template Structure Design | Define template directory layout, content categorization |
| Profile Design | minimal profile (core only) / full profile (with examples/docs) |
| init Command | Initialize template into target project directory |
| install Command | Install/update template files into existing project |
| doctor Command | Diagnose template integration health |
| Template Pack Directory | Centralized template artifacts location |
| Profile Selection Logic | Criteria for minimal vs full selection |
| Upgrade/Sync Strategy | How template updates propagate to project instances |
| Example Project | One minimal example demonstrating template usage |
| Documentation | Template usage guide, profile comparison, upgrade strategy |
| Contract Schema Integration | How template relates to existing contract schemas |

### Template Content Classification

| Category | Definition | Examples |
|----------|------------|----------|
| **Required** | Must copy for any template usage | AGENTS.md, 6-role skills, core commands, governance files |
| **Optional** | Enhances functionality but not mandatory | M4 skills, examples/, validation templates |
| **Extension** | Project-specific, not part of template | specs/ (user's features), artifacts/ (user's outputs) |
| **Source-Only** | Internal development, excluded from template | historical specs, verification reports, archive/ |

### Out of Scope

| Item | Reason |
|------|--------|
| Complex Web UI | Templating phase, not platformization |
| Full plugin ecosystem | Premature abstraction |
| Orchestrator adapters | Separate concern |
| Complete npm publishing | Future phase, current focus is template pack |
| Large-scale refactoring | Minimal changes to existing structure |
| Role model/command workflow redesign | Already complete and validated |
| Multi-project management | Single project scope for MVP |
| Automated version sync | Manual upgrade strategy first |

---

## Actors

| Actor | Role |
|-------|------|
| architect | Design template structure, profile definitions, upgrade strategy |
| developer | Implement template pack directory, CLI commands, example project |
| tester | Validate init/install/doctor workflows, profile correctness |
| reviewer | Review template pack alignment with governance, completeness |
| docs | Update README, create template usage guide, profile comparison doc |
| security | Review template for unintended information exposure |

---

## Core Workflows

### Workflow 1: Template Initialization (init)

```
User calls: init <target-project> [--profile minimal|full]

1. Validate target directory exists and is empty (or has user confirmation)
2. Select profile based on flag or auto-detection
3. Copy required template files to target
4. If full profile: copy optional template files
5. Generate initial project structure (specs/, artifacts/ placeholders)
6. Write template-manifest.json with profile, version, timestamp
7. Output success summary with next steps
```

### Workflow 2: Template Install/Update (install)

```
User calls: install [--profile minimal|full] [--upgrade]

1. Read existing template-manifest.json (if exists)
2. Compare current template version with manifest version
3. If --upgrade: sync template files to latest version
4. If --profile change: add/remove optional files accordingly
5. Preserve user's extension files (specs/, artifacts/)
6. Update template-manifest.json
7. Output change summary
```

### Workflow 3: Template Health Check (doctor)

```
User calls: doctor

1. Check template-manifest.json existence and validity
2. Verify required files exist and match template version
3. Check governance file consistency (AGENTS.md, role-definition.md)
4. Validate skills directory completeness per profile
5. Validate commands directory completeness
6. Check contract schema pack integration
7. Output health report with pass/fail per check
8. Provide fix recommendations for failures
```

---

## Business Rules

### BR-001: Template Separation Principle
Template pack must be physically separated from source repository internals. The template pack directory (`templates/pack/`) contains only content intended for external reuse.

### BR-002: Required Content Minimum
Every template instance must contain:
- AGENTS.md (execution rules)
- .opencode/commands/ (5 core commands)
- .opencode/skills/ (6-role MVP skills: architect, developer, tester, reviewer, docs, security)
- contracts/pack/registry.json (contract discovery)
- Governance files: package-spec.md, role-definition.md, io-contract.md

### BR-003: Profile Selection Logic
- **minimal**: Required content only, no examples, no extended docs
- **full**: Required + optional (M4 skills, examples/, validation templates, docs/templates/)
- Default: minimal unless target project has complex requirements

### BR-004: Extension Isolation
User-created content (specs/, artifacts/, project-specific rules) is never touched by template commands. Template commands only operate on template-managed files.

### BR-005: Version Tracking
Each template instance has `template-manifest.json` tracking:
- template_version (from source repo)
- profile (minimal/full)
- install_timestamp
- last_upgrade_timestamp
- template_source (URL or path reference)

### BR-006: Upgrade Strategy
Upgrades are manual and explicit (`--upgrade` flag). Template does not auto-sync. Upgrades preserve user extensions.

### BR-007: Source-Only Exclusion
The following are excluded from template pack:
- specs/001-017/ (internal features)
- specs/*-verification-report.md
- docs/archive/ (historical content)
- docs/infra/ (internal design documents)
- src/ (if any internal implementation)

### BR-008: Contract Schema Linkage
Template includes `contracts/pack/` but downstream projects may extend with their own contracts. Template doctor validates registry consistency.

---

## Non-functional Requirements

### NFR-001: Discoverability
Template pack location (`templates/pack/`) documented in README with clear usage instructions.

### NFR-002: Minimal Footprint
minimal profile should contain < 100 files, focused on essential execution capability.

### NFR-003: Full Profile Completeness
full profile should include all optional skills files, example workflows, and validation templates.

### NFR-004: Doctor Execution Speed
doctor command should complete in < 5 seconds for typical project.

### NFR-005: Template Manifest Clarity
template-manifest.json must be human-readable JSON with clear field naming.

### NFR-006: Backward Compatibility
Template commands must not break existing projects that already have partial template structure.

---

## Acceptance Criteria

### AC-001: Template Pack Directory Created
- [ ] `templates/pack/` directory exists with organized structure
- [ ] Required content files are present and organized
- [ ] Profile-specific subdirectories exist (minimal/, full/)
- [ ] Template manifest template exists

### AC-002: init Command Implemented
- [ ] init command executable (CLI entry)
- [ ] Supports --profile flag (minimal/full)
- [ ] Creates correct directory structure in target
- [ ] Generates template-manifest.json
- [ ] Outputs success summary with next steps

### AC-003: install Command Implemented
- [ ] install command executable
- [ ] Supports --upgrade flag
- [ ] Supports --profile change
- [ ] Preserves user extension files
- [ ] Updates template-manifest.json

### AC-004: doctor Command Implemented
- [ ] doctor command executable
- [ ] Checks all required file existence
- [ ] Validates governance consistency
- [ ] Validates skills completeness per profile
- [ ] Outputs structured health report
- [ ] Provides fix recommendations

### AC-005: Example Project Created
- [ ] One example project demonstrating minimal template usage
- [ ] Example shows typical workflow (spec-start through spec-audit)
- [ ] Example README explains what's demonstrated

### AC-006: Documentation Updated
- [ ] README references template pack location
- [ ] Template usage guide created (templates/USAGE.md)
- [ ] Profile comparison document created
- [ ] Upgrade strategy documented

### AC-007: Contract Schema Integration
- [ ] Template pack includes contracts/pack/registry.json
- [ ] doctor validates contract registry presence
- [ ] Template explains contract extension mechanism

### AC-008: Security Review Passed
- [ ] Template pack does not expose internal secrets/credentials
- [ ] Template pack does not include development-only artifacts
- [ ] Source-only content properly excluded

---

## Template Structure Design

### Directory Layout

```
templates/
├── pack/
│   ├── minimal/                    # Minimal profile template
│   │   ├── AGENTS.md
│   │   ├── .opencode/
│   │   │   ├── commands/
│   │   │   │   ├── spec-start.md
│   │   │   │   ├── spec-plan.md
│   │   │   │   ├── spec-tasks.md
│   │   │   │   ├── spec-implement.md
│   │   │   │   └── spec-audit.md
│   │   │   └── skills/
│   │   │       ├── common/
│   │   │       ├── architect/
│   │   │       ├── developer/
│   │   │       ├── tester/
│   │   │       ├── reviewer/
│   │   │       ├── docs/
│   │   │       └── security/
│   │   ├── contracts/
│   │   │   └── pack/
│   │   │       └── registry.json
│   │   ├── package-spec.md
│   │   ├── role-definition.md
│   │   ├── io-contract.md
│   │   └── quality-gate.md
│   │   └── collaboration-protocol.md
│   ├── full/                       # Full profile template
│   │   ├── (inherits minimal/)
│   │   ├── .opencode/
│   │   │   └── skills/
│   │   │       └── (M4 skills added)
│   │   ├── docs/
│   │   │   ├── templates/
│   │   │   ├── rules/
│   │   │   ├── validation/
│   │   │   └── enhanced-mode-guide.md
│   │   ├── examples/
│   │   │   └── sample-workflow/
│   │   └── contracts/
│   │   │   └── pack/
│   │   │       └── (full schemas)
│   ├── manifest-template.json      # Template for generated manifest
│   └── pack-version.json           # Template pack version
├── cli/                            # CLI implementation
│   ├── init.js (or init.sh)
│   ├── install.js
│   └── doctor.js
├── USAGE.md                        # Template usage guide
├── PROFILE-COMPARISON.md           # Profile comparison document
└── UPGRADE-STRATEGY.md             # Upgrade strategy documentation
```

### Content Classification Details

| Content | minimal | full | Source-Only |
|---------|---------|------|-------------|
| AGENTS.md | ✓ | ✓ | |
| .opencode/commands/ (5 core) | ✓ | ✓ | |
| .opencode/skills/common/ (5) | ✓ | ✓ | |
| .opencode/skills/architect/ (3 MVP) | ✓ | ✓ | |
| .opencode/skills/developer/ (3 MVP) | ✓ | ✓ | |
| .opencode/skills/tester/ (3 MVP) | ✓ | ✓ | |
| .opencode/skills/reviewer/ (3 MVP) | ✓ | ✓ | |
| .opencode/skills/docs/ (2 MVP) | ✓ | ✓ | |
| .opencode/skills/security/ (2 MVP) | ✓ | ✓ | |
| .opencode/skills/*/M4 skills | | ✓ | |
| contracts/pack/registry.json | ✓ | ✓ | |
| contracts/pack/*.schema.json | | ✓ | |
| package-spec.md | ✓ | ✓ | |
| role-definition.md | ✓ | ✓ | |
| io-contract.md | ✓ | ✓ | |
| quality-gate.md | ✓ | ✓ | |
| collaboration-protocol.md | ✓ | ✓ | |
| docs/templates/ | | ✓ | |
| docs/rules/ | | ✓ | |
| docs/validation/ | | ✓ | |
| docs/enhanced-mode-guide.md | | ✓ | |
| examples/ | | ✓ | |
| specs/001-017/ | | | ✓ |
| specs/*-report.md | | | ✓ |
| docs/archive/ | | | ✓ |
| docs/infra/ | | | ✓ |
| src/ | | | ✓ |

---

## Profile Design

### Minimal Profile

**Purpose**: Core execution capability without extras.

**Use Case**: New projects wanting the essential spec-driven workflow.

**File Count**: ~50 files (commands + skills + governance + registry)

**Skills Coverage**: 21 MVP skills only

**Validation**: doctor checks required files only

### Full Profile

**Purpose**: Complete capability with documentation and examples.

**Use Case**: Teams wanting comprehensive toolkit and reference materials.

**File Count**: ~150 files (minimal + M4 + docs + examples + schemas)

**Skills Coverage**: 37 skills (21 MVP + 16 M4)

**Validation**: doctor checks required + optional files

### Profile Selection Criteria

| Project Type | Recommended Profile |
|--------------|---------------------|
| New greenfield project | minimal |
| Complex multi-team project | full |
| Learning/experimentation | full |
| Production deployment | minimal (extend as needed) |
| Already has similar structure | minimal (merge) |

---

## Bootstrap Command Design

### init Command

**Signature**: `init <target-dir> [--profile minimal|full] [--force]`

**Behavior**:
1. Create target directory if not exists
2. If target non-empty, require --force or prompt confirmation
3. Copy profile-specific template files
4. Create placeholder directories (specs/, artifacts/)
5. Generate template-manifest.json
6. Output: file count, next steps recommendation

**Error Handling**:
- Target non-empty without --force → error with suggestion
- Profile invalid → error with valid options
- Copy failure → error with partial cleanup

### install Command

**Signature**: `install [--profile minimal|full] [--upgrade] [--dry-run]`

**Behavior**:
1. Check template-manifest.json existence
2. If no manifest: suggest init instead
3. If --upgrade: compare versions, list changes
4. If --dry-run: show changes without applying
5. Apply changes preserving user extensions
6. Update manifest

**Error Handling**:
- No manifest → suggest init
- Version mismatch without --upgrade → warning
- Profile downgrade → warn about removed optional files

### doctor Command

**Signature**: `doctor [--verbose] [--fix]`

**Behavior**:
1. Run all checks (required files, governance, skills, commands, contracts)
2. Output structured report (PASS/WARN/FAIL per check)
3. If --fix: attempt automatic fixes where possible
4. Provide manual fix instructions for unfixable issues

**Checks**:
| Check | Description |
|-------|-------------|
| manifest-valid | template-manifest.json exists and valid |
| required-files | All required files present |
| governance-consistent | AGENTS.md references match actual files |
| skills-complete | Skills directories match profile |
| commands-complete | 5 core commands present |
| contracts-registry | registry.json exists and valid |
| no-source-leak | No source-only files accidentally present |

---

## Upgrade/Sync Strategy

### Manual Upgrade Flow

```
1. Source repo updates template pack (version bump in pack-version.json)
2. User runs: install --upgrade
3. CLI compares source version vs manifest version
4. CLI shows diff: files added/changed/removed
5. User confirms or rejects
6. CLI applies changes, preserving user extensions
7. CLI updates manifest with new version
```

### Version Conflict Handling

- If user modified template-managed file → warn, offer merge or skip
- If user added file that conflicts with new template file → warn, suggest rename
- If template removes file user depends on → warn, suggest manual review

### Sync Frequency Recommendation

- Major template version → recommend upgrade within 1 week
- Minor template version → upgrade optional
- Template-breaking changes → documented in UPGRADE-STRATEGY.md

---

## Example Project Design

### Sample Workflow Example

**Location**: `templates/pack/full/examples/sample-workflow/`

**Purpose**: Demonstrate minimal spec-driven workflow from start to finish.

**Contents**:
- Sample spec.md (simple feature)
- Sample plan.md
- Sample tasks.md
- Sample artifact outputs
- README explaining the demonstration

**Not Included**:
- Full feature implementation (too heavy for example)
- Complex multi-role interactions (focus on happy path)

---

## Contract Schema Integration

### Template's Role

The template provides the **contract registry** (`contracts/pack/registry.json`) as the discovery mechanism.

Downstream projects can:
1. Use existing 17 contracts unchanged
2. Add project-specific contracts by extending registry
3. Override contract schemas (with version tracking)

### doctor Contract Check

- Validates registry.json exists and parses correctly
- Checks all contract IDs referenced by skills are present
- Warns if contract versions mismatch skills expectations

---

## Required New Files and Directories

### New Directories

| Path | Purpose |
|------|---------|
| templates/ | Root template directory |
| templates/pack/ | Template pack content |
| templates/pack/minimal/ | Minimal profile template |
| templates/pack/full/ | Full profile template |
| templates/cli/ | CLI implementation |

### New Files

| Path | Purpose |
|------|---------|
| templates/pack/minimal/* | Minimal profile content |
| templates/pack/full/* | Full profile content (extends minimal) |
| templates/pack/manifest-template.json | Template for project manifests |
| templates/pack/pack-version.json | Template pack version |
| templates/cli/init.js | init command implementation |
| templates/cli/install.js | install command implementation |
| templates/cli/doctor.js | doctor command implementation |
| templates/USAGE.md | Template usage guide |
| templates/PROFILE-COMPARISON.md | Profile comparison |
| templates/UPGRADE-STRATEGY.md | Upgrade strategy documentation |

### Updated Files

| Path | Changes |
|------|---------|
| README.md | Add template pack section, usage quick start |
| CHANGELOG.md | Add 018-template-and-bootstrap-foundation entry |

---

## Assumptions

| ID | Assumption | Risk if Wrong |
|----|------------|---------------|
| A-001 | Node.js is acceptable CLI implementation language | Users may prefer shell scripts |
| A-002 | Copy-based template distribution is sufficient for MVP | May need npm package later |
| A-003 | Users understand spec-driven workflow basics | May need more educational content |
| A-004 | Minimal profile covers 80% use cases | May need additional profiles |
| A-005 | Manual upgrade strategy is acceptable initially | Users may expect auto-sync |
| A-006 | Template files are stable across versions | Breaking changes need migration docs |
| A-007 | Single example is sufficient | May need role-specific examples |
| A-008 | doctor checks are comprehensive enough | May miss edge case issues |

---

## Open Questions

| ID | Question | Impact | Temporary Assumption |
|----|----------|--------|---------------------|
| Q-001 | Should CLI be shell scripts or Node.js? | Implementation language | Node.js (matches existing tooling) |
| Q-002 | Should template pack be published to npm? | Distribution mechanism | No (future phase), copy-based first |
| Q-003 | Should minimal profile include validation templates? | minimal completeness | No (moved to full) |
| Q-004 | How to handle projects with partial template already? | install edge case | Merge with warnings |
| Q-005 | Should doctor attempt auto-fix? | doctor behavior | Yes, with --fix flag |
| Q-006 | Should example project be runnable? | example completeness | No (static example), demonstration only |
| Q-007 | How many profiles beyond minimal/full? | profile expansion | Two for MVP, more in future |
| Q-008 | Should template include .gitignore templates? | project initialization | Yes, minimal .gitignore in template |

---

## References

- `package-spec.md` - Package governance (defines what's core)
- `role-definition.md` - 6-role skills (defines required skills)
- `io-contract.md` - Contract definitions (defines contract integration)
- `contracts/pack/registry.json` - Existing contract registry
- `README.md` - Current package description (to be updated)
- `.opencode/commands/` - Existing commands (to be templated)
- `.opencode/skills/` - Existing skills (to be templated)
- `docs/enhanced-mode-guide.md` - M4 skills reference (for full profile)