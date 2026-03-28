# CI Integration Points

## Overview

This document defines the integration points between the OpenCode Expert Package versioning system and CI/CD pipelines.

---

## Validation Scripts

### Version Sync Validation

**Script Path**: `scripts/validate-version-sync.sh`

**Purpose**: Validates that all version declarations are synchronized.

**Checks**:
- `package.json` version
- `CHANGELOG.md` header version
- `contracts/pack/pack-version.json` version
- `templates/pack/pack-version.json` version

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | All versions synchronized |
| 1 | Version mismatch detected |

**Usage**:
```bash
./scripts/validate-version-sync.sh
```

**CI Integration**:
```yaml
# GitHub Actions example
- name: Validate Version Sync
  run: ./scripts/validate-version-sync.sh
```

---

### Changelog Check

**Script Path**: `scripts/check-changelog.sh`

**Purpose**: Ensures CHANGELOG.md has been updated for the release.

**Checks**:
- CHANGELOG.md has entry for current version
- Required sections present (Added, Changed, etc.)

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | CHANGELOG valid |
| 1 | CHANGELOG missing or incomplete |

**Usage**:
```bash
./scripts/check-changelog.sh <version>
```

**CI Integration**:
```yaml
- name: Check Changelog
  run: ./scripts/check-changelog.sh ${{ steps.version.outputs.version }}
```

---

### Compatibility Matrix Validation

**Script Path**: `scripts/validate-compatibility.sh`

**Purpose**: Validates compatibility-matrix.json against its schema.

**Checks**:
- JSON syntax valid
- Schema compliance
- Version history entries present

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | Matrix valid |
| 1 | Matrix validation failed |

**Usage**:
```bash
./scripts/validate-compatibility.sh
```

**CI Integration**:
```yaml
- name: Validate Compatibility Matrix
  run: ./scripts/validate-compatibility.sh
```

---

## CI Pipeline Stages

### Stage 1: Pre-Commit Validation

**Trigger**: Push to any branch

**Checks**:
1. Version sync validation
2. JSON schema validation (contracts, templates)
3. Lint and format checks

**Example Configuration**:
```yaml
name: Pre-Commit Validation

on: push

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate Version Sync
        run: ./scripts/validate-version-sync.sh
        
      - name: Validate Schemas
        run: |
          node -e "JSON.parse(require('fs').readFileSync('compatibility-matrix.json'))"
          node -e "JSON.parse(require('fs').readFileSync('contracts/pack/registry.json'))"
```

---

### Stage 2: Release PR Validation

**Trigger**: Pull request to main with release/*

**Checks**:
1. All pre-commit checks
2. Changelog update check
3. Compatibility matrix update check
4. Full governance audit (AH-001 to AH-009)

**Example Configuration**:
```yaml
name: Release PR Validation

on:
  pull_request:
    branches: [main]
    paths: ['release/**']

jobs:
  release-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check Changelog
        run: ./scripts/check-changelog.sh ${{ github.event.pull_request.title }}
        
      - name: Validate Compatibility Matrix
        run: ./scripts/validate-compatibility.sh
```

---

### Stage 3: Release Pipeline

**Trigger**: Push tag v*

**Actions**:
1. Create GitHub release
2. Update compatibility matrix
3. Publish artifacts

**Example Configuration**:
```yaml
name: Release

on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create Release
        uses: actions/create-release@v1
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
```

---

## Integration Points Summary

| Integration Point | Script | Trigger | Required |
|-------------------|--------|---------|----------|
| Version Sync | `validate-version-sync.sh` | Push, PR | Yes |
| Changelog Check | `check-changelog.sh` | Release PR | Yes |
| Compatibility Matrix | `validate-compatibility.sh` | Release PR | Yes |
| Governance Audit | `/spec-audit` | Release PR | Yes |

---

## Audit Integration

The following audit rules should be enforced in CI:

| Rule | Description | CI Stage |
|------|-------------|----------|
| AH-007 | Version declarations synchronized | Pre-commit |
| AH-008 | CHANGELOG reflects release | Release PR |
| AH-009 | Compatibility matrix updated | Release PR |

---

## Notes

- Scripts referenced in this document are defined paths but may not be implemented yet
- Implement scripts as needed when CI integration is required
- All scripts should exit with code 0 on success, non-zero on failure