# Migration Guide: v0.x to v1.0.0

## Document Information

| Field | Value |
|-------|-------|
| **From Version** | `0.1.0-MVP` |
| **To Version** | `1.0.0` |
| **Release Date** | `2026-03-28` |
| **Effort Level** | `MEDIUM` |

---

## Overview

This guide covers migration from the pre-release MVP version (0.1.0-MVP) to the first official release (1.0.0) of the OpenCode Expert Package.

---

## Breaking Changes

### 1. Governance Structure Reorganized

**Impact**: `HIGH`

**Description**: Governance documents have been restructured for clarity and consistency.

**Before**:
```
/docs/
  /planning/          # Removed
  /api/               # Archived
  /infra/feature/     # Archived
```

**After**:
```
/docs/
  /archive/           # Legacy documents moved here
  /migration/         # Migration guides
  /validation/        # Release checklists
  /templates/         # Artifact templates
```

**Migration Steps**:
1. Remove references to deprecated `/docs/planning/` paths
2. Update documentation links to new locations
3. Archive any local customizations under `/docs/project-specific/`

---

### 2. 3-Skill to 6-Role Model Migration

**Impact**: `HIGH`

**Description**: The execution model has migrated from legacy 3-skill skeleton to formal 6-role model.

**Before**:
```
Roles: spec-writer, architect-auditor, task-executor (3 skills)
```

**After**:
```
Roles: architect, developer, tester, reviewer, docs, security (6 roles)
```

**Migration Steps**:
1. Review role definitions in `role-definition.md`
2. Update any custom skills to align with 6-role model
3. Use the skill mapping in `docs/archive/legacy-skills/README.md`

---

### 3. Contract Schema Pack Introduced

**Impact**: `MEDIUM`

**Description**: Artifact contracts now have machine-readable JSON schemas.

**Before**:
```
Contract definitions: Markdown only (docs/templates/)
```

**After**:
```
Contract definitions: JSON Schemas (contracts/pack/*.schema.json)
+ Registry: contracts/pack/registry.json
+ Validation: contracts/pack/validate-schema.js
```

**Migration Steps**:
1. Review `contracts/pack/registry.json` for available schemas
2. Update artifact generation to use schema validation
3. Use `node contracts/pack/validate-schema.js <artifact> <contract-id>`

---

## New Features

### Template Pack

**Description**: New template distribution system with profile support.

**How to Use**:
```bash
# Initialize new project
node templates/cli/init.js ./my-project --profile minimal

# Validate installation
node templates/cli/doctor.js
```

### Versioning System

**Description**: Formal SemVer versioning with compatibility tracking.

**Key Files**:
- `VERSIONING.md` - Versioning strategy
- `compatibility-matrix.json` - Version compatibility

---

## Deprecated Features

| Feature | Deprecated In | Removed In | Replacement |
|---------|---------------|------------|-------------|
| 3-skill skeleton | 1.0.0 | 2.0.0 | 6-role model |
| `/docs/planning/` | 1.0.0 | 1.1.0 | `/docs/archive/` |

---

## Step-by-Step Migration

### Prerequisites

- [ ] Backup existing project
- [ ] Review breaking changes above
- [ ] Check compatibility matrix

### Migration Steps

#### Step 1: Update Governance References

```bash
# Update any hardcoded paths in your project
grep -r "docs/planning" . --exclude-dir=.git
grep -r "docs/api" . --exclude-dir=.git
```

**Expected Result**: No remaining references to deprecated paths

#### Step 2: Migrate to 6-Role Model

```bash
# Review legacy skill mapping
cat docs/archive/legacy-skills/README.md
```

**Expected Result**: Understanding of how legacy skills map to new roles

#### Step 3: Validate Installation

```bash
node templates/cli/doctor.js --verbose
```

**Expected Result**:
```
✓ All checks passed
Health status: PASS
```

---

## Validation

Run the following to verify migration success:

```bash
node templates/cli/doctor.js --verbose
```

**Expected Output**:
```
=== OpenCode Template Pack - Doctor ===

Running checks...

✓ [CRITICAL ] Manifest exists
✓ [CRITICAL ] Commands directory exists
✓ [HIGH     ] 5 core commands present
✓ [CRITICAL ] Skills directory exists
✓ [HIGH     ] 6 role directories present
✓ [HIGH     ] Common skills present
✓ [HIGH     ] Governance files present
✓ [MEDIUM   ] Contracts registry present
✓ [HIGH     ] Manifest is valid JSON
✓ [MEDIUM   ] Registry is valid JSON

---
Checks: 10/10 passed
Health status: PASS
```

---

## Rollback

If migration fails, follow these steps:

### Step 1: Restore Backup

```bash
# Restore from your backup
cp -r /path/to/backup/.opencode ./
cp -r /path/to/backup/docs ./
```

### Step 2: Verify Restoration

```bash
node templates/cli/doctor.js
```

---

## Known Issues

| Issue | Workaround | Status |
|-------|------------|--------|
| None currently known | N/A | N/A |

---

## Support

- **Documentation**: [VERSIONING.md](../VERSIONING.md)
- **Compatibility Matrix**: [compatibility-matrix.json](../compatibility-matrix.json)
- **Issues**: Report issues via GitHub Issues