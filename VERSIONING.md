# Versioning Strategy

## Overview

This document defines the versioning strategy for the OpenCode Expert Package, establishing clear rules for version increments, compatibility guarantees, and migration paths.

---

## Versioned Objects

### Object Hierarchy

```
Package Version (MAJOR.MINOR.PATCH)
├── Contract Pack Version (derived)
├── Template Pack Version (derived)
│   ├── Minimal Profile Version (derived)
│   └── Full Profile Version (derived)
└── Tooling Version (independent)
```

### Object Definitions

| Object | Scope | Location | Example |
|--------|-------|----------|---------|
| **Package Version** | Overall expert package | `package.json`, `CHANGELOG.md` | `1.0.0` |
| **Contract Pack Version** | Artifact schemas | `contracts/pack/pack-version.json` | `1.0.0` |
| **Template Pack Version** | Template distribution | `templates/pack/pack-version.json` | `1.0.0` |
| **Profile Version** | minimal/full config | `templates/pack/pack-version.json` | `1.0.0` |
| **Tooling Version** | CLI tools | `templates/cli/*.js` | `1.0.0` |

---

## SemVer Rules

### Package Version

**Format**: `MAJOR.MINOR.PATCH`

#### MAJOR Increment

Triggered when:
- Breaking changes to governance documents (`AGENTS.md`, `package-spec.md`, `role-definition.md`)
- Breaking changes to command interfaces
- Removal of existing skills
- Breaking changes to contract schemas

**Examples**:
| Change | From → To | Reason |
|--------|-----------|--------|
| Remove `spec-audit.md` command | 1.x.x → 2.0.0 | Breaking command interface |
| Add required field to contract schema | 1.x.x → 2.0.0 | Breaking schema change |
| Change role model from 6-role to 5-role | 1.x.x → 2.0.0 | Breaking governance |

#### MINOR Increment

Triggered when:
- New features added (backward compatible)
- New skills added
- New commands added
- New optional fields in schemas
- New template content

**Examples**:
| Change | From → To | Reason |
|--------|-----------|--------|
| Add new M5 skills | 1.0.x → 1.1.0 | New feature |
| Add optional field to schema | 1.0.x → 1.1.0 | Backward compatible |
| Add new template profile | 1.0.x → 1.1.0 | New feature |

#### PATCH Increment

Triggered when:
- Bug fixes
- Documentation improvements
- Schema description updates
- Template file updates (no structural change)

**Examples**:
| Change | From → To | Reason |
|--------|-----------|--------|
| Fix typo in skill description | 1.0.0 → 1.0.1 | Bug fix |
| Update documentation | 1.0.0 → 1.0.1 | Doc improvement |
| Fix validation script bug | 1.0.0 → 1.0.1 | Bug fix |

---

### Contract Pack Version

**Format**: `MAJOR.MINOR.PATCH`

#### MAJOR Increment

| Trigger | Example |
|---------|---------|
| Remove existing schema | Delete `design-note.schema.json` |
| Add required field | Add mandatory `reviewer_id` field |
| Change field type | `version: string` → `version: object` |

#### MINOR Increment

| Trigger | Example |
|---------|---------|
| Add new schema | Add `new-artifact.schema.json` |
| Add optional field | Add `review_notes?: string` |
| Add new registry entry | Register new contract |

#### PATCH Increment

| Trigger | Example |
|---------|---------|
| Fix schema typo | Correct description text |
| Update examples | Improve example values |
| Fix validation regex | Correct pattern |

---

### Template Pack Version

**Format**: `MAJOR.MINOR.PATCH`

#### MAJOR Increment

| Trigger | Example |
|---------|---------|
| Remove profile | Remove `minimal` profile |
| Change profile structure | Move skills to different directory |
| Change manifest format | Add required field to `template-manifest.json` |

#### MINOR Increment

| Trigger | Example |
|---------|---------|
| Add new profile | Add `enterprise` profile |
| Add files to profile | Add new skill files |
| Add M4 skills to full | Extend full profile |

#### PATCH Increment

| Trigger | Example |
|---------|---------|
| Fix file content | Correct typo in template |
| Update documentation | Improve USAGE.md |
| Fix CLI bug | Fix init.js path resolution |

---

### Tooling Version

**Format**: `MAJOR.MINOR.PATCH`

Tooling follows independent versioning but should stay synchronized with Package Version for major releases.

#### MAJOR Increment

| Trigger | Example |
|---------|---------|
| Remove CLI command | Remove `doctor.js` |
| Change command signature | `init <dir>` → `init --target <dir>` |
| Change output format | JSON → YAML default |

#### MINOR Increment

| Trigger | Example |
|---------|---------|
| Add new flag | Add `--verbose` to doctor |
| Add new command | Add `upgrade.js` |
| Add new output format | Add `--format json` |

#### PATCH Increment

| Trigger | Example |
|---------|---------|
| Fix bug | Fix path handling |
| Improve error message | Better error text |
| Performance improvement | Faster execution |

---

## Version Sync Rules

### Synchronization Requirements

| Scenario | Requirement |
|----------|-------------|
| Package MAJOR | Contract Pack MUST increment MAJOR |
| Package MAJOR | Template Pack MUST increment MAJOR |
| Package MINOR | Template Pack SHOULD increment MINOR (if templates changed) |
| Contract MAJOR | Package MUST increment MAJOR |
| Template MINOR | Package SHOULD increment MINOR |

### Version Declaration Locations

| Object | File | Field |
|--------|------|-------|
| Package | `package.json` | `version` |
| Package | `CHANGELOG.md` | Header |
| Contract Pack | `contracts/pack/pack-version.json` | `version` |
| Template Pack | `templates/pack/pack-version.json` | `version` |
| CLI Tools | `templates/cli/*.js` | `TOOL_VERSION` constant |

---

## Compatibility Matrix

See `compatibility-matrix.json` for the full compatibility matrix.

### Compatibility States

| State | Meaning | Action |
|-------|---------|--------|
| `compatible` | Direct upgrade possible | No migration needed |
| `compatible_with_migration` | Upgrade with migration | Follow migration guide |
| `incompatible` | Cannot upgrade directly | Fresh install required |

---

## Release Policy

### Release Types

| Type | Frequency | Version Increment |
|------|-----------|-------------------|
| **Major Release** | As needed (breaking changes) | MAJOR |
| **Minor Release** | Monthly (new features) | MINOR |
| **Patch Release** | As needed (bug fixes) | PATCH |

### Release Requirements

For every release:
1. Update all version declarations
2. Update `CHANGELOG.md` with changes
3. Update `compatibility-matrix.json` if needed
4. Run audit (AH-001 to AH-006)
5. Create git tag `v{MAJOR.MINOR.PATCH}`
6. Update documentation

---

## Migration Support

### Migration Guide Requirements

For MAJOR releases, provide:
- Breaking changes summary
- Migration steps
- Code examples (before/after)
- Timeline for deprecated features

### Deprecation Policy

| Stage | Duration | Notice |
|-------|----------|--------|
| **Announce** | 2 releases before removal | CHANGELOG entry |
| **Deprecate** | 1 release before removal | Warning in tooling |
| **Remove** | MAJOR release | Breaking change entry |

---

## Validation

### CI Integration Points

| Check | Trigger | Script |
|-------|---------|--------|
| Version sync validation | Every commit | `scripts/validate-version-sync.sh` |
| Changelog update check | Release PR | `scripts/check-changelog.sh` |
| Compatibility matrix validation | Release PR | `scripts/validate-compatibility.sh` |

### Audit Integration

| Rule | Check |
|------|-------|
| AH-007 | Version declarations synchronized |
| AH-008 | CHANGELOG reflects release |
| AH-009 | Compatibility matrix updated for MAJOR releases |

---

## References

- `compatibility-matrix.json` - Compatibility matrix
- `CHANGELOG.md` - Change history
- `docs/migration/migration-guide-template.md` - Migration guide template
- `specs/019-versioning-and-compatibility-foundation/spec.md` - Feature specification