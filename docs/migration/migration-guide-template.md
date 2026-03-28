# Migration Guide Template

## Document Information

| Field | Value |
|-------|-------|
| **From Version** | `{FROM_VERSION}` |
| **To Version** | `{TO_VERSION}` |
| **Release Date** | `{RELEASE_DATE}` |
| **Effort Level** | `{LOW|MEDIUM|HIGH}` |

---

## Overview

{Brief description of what this migration entails and why it's needed.}

---

## Breaking Changes

### 1. {Breaking Change Title}

**Impact**: `{HIGH|MEDIUM|LOW}`

**Description**:
{Description of the breaking change}

**Before**:
```json
{
  "example": "old format"
}
```

**After**:
```json
{
  "example": "new format"
}
```

**Migration Steps**:
1. {Step 1}
2. {Step 2}
3. {Step 3}

---

## New Features

### {Feature Title}

**Description**:
{Description of new feature}

**How to Use**:
```bash
# Example command or code
```

---

## Deprecated Features

| Feature | Deprecated In | Removed In | Replacement |
|---------|---------------|------------|-------------|
| {feature} | {version} | {version} | {replacement} |

---

## Step-by-Step Migration

### Prerequisites

- [ ] Backup existing project
- [ ] Review breaking changes
- [ ] Check compatibility matrix

### Migration Steps

#### Step 1: {Step Title}

```bash
# Command or action
```

**Expected Result**: {What you should see}

#### Step 2: {Step Title}

```bash
# Command or action
```

**Expected Result**: {What you should see}

#### Step 3: {Step Title}

```bash
# Command or action
```

**Expected Result**: {What you should see}

---

## Validation

Run the following to verify migration success:

```bash
node templates/cli/doctor.js --verbose
```

**Expected Output**:
```
✓ All checks passed
```

---

## Rollback

If migration fails, follow these steps:

### Step 1: Restore Backup

```bash
# Restore command
```

### Step 2: Verify Restoration

```bash
node templates/cli/doctor.js
```

---

## Known Issues

| Issue | Workaround | Status |
|-------|------------|--------|
| {issue} | {workaround} | {status} |

---

## Support

- **Documentation**: [VERSIONING.md](../VERSIONING.md)
- **Compatibility Matrix**: [compatibility-matrix.json](../compatibility-matrix.json)
- **Issues**: Report issues via GitHub Issues

---

## Template Variables

When using this template, replace the following:

| Variable | Description | Example |
|----------|-------------|---------|
| `{FROM_VERSION}` | Starting version | `1.0.0` |
| `{TO_VERSION}` | Target version | `2.0.0` |
| `{RELEASE_DATE}` | Release date | `2026-04-15` |
| `{LOW|MEDIUM|HIGH}` | Effort level | `MEDIUM` |