# Release Checklist Template

## Release Information

| Field | Value |
|-------|-------|
| **Release Version** | `v{MAJOR.MINOR.PATCH}` |
| **Release Type** | `{MAJOR|MINOR|PATCH}` |
| **Release Date** | `{YYYY-MM-DD}` |
| **Previous Version** | `{PREVIOUS_VERSION}` |

---

## Phase 1: Pre-Release Verification

### 1.1 Code Quality

- [ ] All skills have SKILL.md file
- [ ] All skills have examples and anti-examples
- [ ] All commands have documentation
- [ ] No temporary files in codebase
- [ ] No debug code or comments

### 1.2 Documentation

- [ ] README.md is up to date
- [ ] CHANGELOG.md is complete for this release
- [ ] All features have completion-report.md
- [ ] Governance documents are consistent

### 1.3 Version Declarations

| File | Field | Current | Target | Updated |
|------|-------|---------|--------|---------|
| `package.json` | `version` | | | [ ] |
| `CHANGELOG.md` | header | | | [ ] |
| `contracts/pack/pack-version.json` | `version` | | | [ ] |
| `templates/pack/pack-version.json` | `version` | | | [ ] |

### 1.4 Version Sync Validation

- [ ] Package version syncs with Contract Pack version
- [ ] Package version syncs with Template Pack version
- [ ] CLI tool versions are consistent
- [ ] All version declarations follow SemVer

---

## Phase 2: SemVer Classification

### 2.1 Changes Classification

| Change | Type | SemVer Impact |
|--------|------|---------------|
| {change} | {feature|fix|breaking} | {major|minor|patch} |

### 2.2 Breaking Changes (MAJOR)

- [ ] List all breaking changes
- [ ] Migration guide created
- [ ] Deprecation notices added

### 2.3 New Features (MINOR)

- [ ] List all new features
- [ ] Documentation updated
- [ ] Examples added

### 2.4 Bug Fixes (PATCH)

- [ ] List all bug fixes
- [ ] Tests updated
- [ ] Validation passed

---

## Phase 3: Compatibility Verification

### 3.1 Compatibility Matrix Update

- [ ] `compatibility-matrix.json` updated
- [ ] New version entry added
- [ ] Migration path documented (if MAJOR)
- [ ] Deprecation schedule updated (if applicable)

### 3.2 Component Compatibility

| Component | Version | Compatible | Notes |
|-----------|---------|------------|-------|
| Contract Pack | | [ ] | |
| Template Pack | | [ ] | |
| CLI Tools | | [ ] | |

### 3.3 Profile Compatibility

| Profile | File Count | Skill Count | Compatible |
|---------|------------|-------------|------------|
| minimal | | | [ ] |
| full | | | [ ] |

---

## Phase 4: Governance Compliance

### 4.1 Standard Audit (AH-001 to AH-006)

| Rule | Description | Status |
|------|-------------|--------|
| AH-001 | Canonical Comparison | [ ] |
| AH-002 | Cross-Document Consistency | [ ] |
| AH-003 | Path Resolution | [ ] |
| AH-004 | Status Truthfulness | [ ] |
| AH-005 | README Governance Sync | [ ] |
| AH-006 | Enhanced Reviewer Responsibilities | [ ] |

### 4.2 Versioning Audit (AH-007 to AH-009)

| Rule | Description | Status |
|------|-------------|--------|
| AH-007 | Version Declarations Synchronized | [ ] |
| AH-008 | CHANGELOG Reflects Release | [ ] |
| AH-009 | Compatibility Matrix Updated | [ ] |

---

## Phase 5: Feature Status

### 5.1 Features Completed This Release

| Feature | Status | Completion Date |
|---------|--------|-----------------|
| {feature-id} | ✅ Complete | {date} |

### 5.2 Total Features

| Metric | Count |
|--------|-------|
| Previous Total | |
| New Features | |
| **Current Total** | |

### 5.3 Skills Inventory

| Category | Count | Status |
|----------|-------|--------|
| MVP Core | 21 | [ ] |
| M4 Enhancement | 16 | [ ] |
| **Total** | **37** | [ ] |

---

## Phase 6: Release Artifacts

### 6.1 Core Files

- [ ] README.md
- [ ] CHANGELOG.md
- [ ] VERSIONING.md
- [ ] compatibility-matrix.json
- [ ] package-spec.md
- [ ] role-definition.md
- [ ] io-contract.md
- [ ] quality-gate.md
- [ ] AGENTS.md

### 6.2 Contract Pack

- [ ] contracts/pack/registry.json
- [ ] contracts/pack/pack-version.json
- [ ] All schema files (17)

### 6.3 Template Pack

- [ ] templates/pack/minimal/
- [ ] templates/pack/full/
- [ ] templates/cli/
- [ ] templates/pack/pack-version.json

---

## Phase 7: Release Actions

### 7.1 Pre-Release

- [ ] Run all audits
- [ ] Validate version sync
- [ ] Update compatibility matrix
- [ ] Create migration guide (if MAJOR)

### 7.2 Release

- [ ] Create git tag `v{MAJOR.MINOR.PATCH}`
- [ ] Push tag to remote
- [ ] Create GitHub release
- [ ] Update documentation

### 7.3 Post-Release

- [ ] Verify release on GitHub
- [ ] Update project website (if applicable)
- [ ] Notify users (if MAJOR or MINOR)

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Developer | | | [ ] |
| Reviewer | | | [ ] |
| Architect | | | [ ] |

**Release Decision**: [ ] APPROVED / [ ] REJECTED

**Notes**:
{Any additional notes or concerns}