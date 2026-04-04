# OpenCode Template Pack - Usage Guide

> **目标受众**: 终端用户

## Quick Start

### Initialize a New Project

```bash
# Create minimal profile (default, ~110 files)
node templates/cli/init.js ./my-project

# Create full profile (~200 files, includes M4 skills)
node templates/cli/init.js ./my-project --profile full

# Force overwrite existing directory
node templates/cli/init.js ./my-project --force
```

### Install/Upgrade Template

```bash
# Install or upgrade to latest version
node templates/cli/install.js --upgrade

# Preview changes without applying
node templates/cli/install.js --upgrade --dry-run

# Switch profile
node templates/cli/install.js --profile full --upgrade
```

### Verify Installation

```bash
# Run health checks
node templates/cli/doctor.js

# Verbose output
node templates/cli/doctor.js --verbose
```

---

## Profile Comparison

| Feature | Minimal | Full |
|---------|---------|------|
| Core Commands | 5 | 5 |
| MVP Skills | 21 | 21 |
| M4 Skills | 0 | 16 |
| Governance Docs | 7 | 7 |
| Templates | - | ✓ |
| Validation Utils | ✓ | ✓ |
| Total Skills | 21 | 37 |
| Target Files | ~50 | ~150 |

### When to Use Each Profile

**Minimal Profile** (recommended for most projects):
- New projects starting fresh
- Teams wanting simplicity
- Projects with limited scope

**Full Profile** (for advanced use):
- Complex enterprise projects
- Teams needing performance testing
- Projects requiring architecture migration support

---

## Directory Structure

After initialization, your project will have:

```
my-project/
├── .opencode/
│   ├── commands/           # 5 core spec commands
│   │   ├── spec-start.md
│   │   ├── spec-plan.md
│   │   ├── spec-tasks.md
│   │   ├── spec-implement.md
│   │   └── spec-audit.md
│   └── skills/             # 6-role skill directories
│       ├── common/         # 5 common skills
│       ├── architect/      # 3-5 skills
│       ├── developer/      # 3-5 skills
│       ├── tester/         # 3-9 skills
│       ├── reviewer/       # 3-5 skills
│       ├── docs/           # 2-4 skills
│       └── security/       # 2-4 skills
├── contracts/
│   └── pack/
│       ├── registry.json   # Contract registry
│       └── pack-version.json
├── AGENTS.md              # Project rules
├── package-spec.md        # Package spec
├── role-definition.md     # Role definitions
├── io-contract.md         # I/O contracts
├── quality-gate.md        # Quality gates
├── collaboration-protocol.md
├── package-lifecycle.md
└── template-manifest.json # Installation metadata
```

---

## Upgrade Strategy

### Manual Upgrades

Template upgrades are **manual** by design. Run:

```bash
node templates/cli/install.js --upgrade
```

### Preserved Files

During upgrade, these files are preserved:
- `.opencode/skills/**/examples/user-*`
- `.opencode/commands/custom-*`
- `specs/user-*/**`
- `docs/project-specific/**`

### Breaking Changes

Check `templates/pack/pack-version.json` for breaking changes before upgrading.

---

## Contract Integration

The template includes `contracts/pack/registry.json` with 17 artifact schemas:

| Role | Schemas |
|------|---------|
| architect | design-note, open-questions, risks-and-tradeoffs, module-boundaries |
| developer | implementation-summary, self-check-report, bugfix-report |
| tester | verification-report, test-scope-report, regression-risk-report |
| reviewer | review-findings-report, actionable-feedback-report, acceptance-decision-record |
| docs | docs-sync-report, changelog-entry |
| security | security-review-report, input-validation-review-report |

Use the validation utility:

```bash
node contracts/pack/validate-schema.js <artifact-path> <contract-id>
```

---

## Troubleshooting

### Doctor Fails

| Check | Issue | Solution |
|-------|-------|----------|
| C001 | Missing manifest | Run `init.js` first |
| C002/C004 | Missing directories | Re-run `install.js --upgrade` |
| C003 | Missing commands | Copy from templates/pack/minimal/ |
| C005 | Missing role dirs | Check profile was installed correctly |
| C007 | Missing governance | Copy from source template |
| C009/C010 | Invalid JSON | Validate JSON syntax |

### Common Errors

**"Not an OpenCode template project"**
- Run `init.js` to create template-manifest.json

**"Directory already exists"**
- Use `--force` flag to overwrite

**"Profile not found"**
- Ensure templates/pack/{profile}/ exists