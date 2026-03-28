# Upgrade Strategy

## Version Management

Template versions are tracked in:
- `templates/pack/pack-version.json` - Source pack version
- `template-manifest.json` - Installed instance version

### Version Format

Versions follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes

---

## Upgrade Process

### Check Current Version

```bash
cat template-manifest.json | grep template_version
```

### Upgrade to Latest

```bash
node templates/cli/install.js --upgrade
```

### Preview Changes

```bash
node templates/cli/install.js --upgrade --dry-run
```

---

## Preservation Strategy

### Files Always Preserved

During upgrade, these patterns are never overwritten:

| Pattern | Description |
|---------|-------------|
| `.opencode/skills/**/examples/user-*` | User-added skill examples |
| `.opencode/commands/custom-*` | Custom commands |
| `specs/user-*/**` | User spec directories |
| `docs/project-specific/**` | Project-specific docs |

### Files Always Updated

These files are always updated during upgrade:

| File | Reason |
|------|--------|
| `.opencode/commands/spec-*.md` | Core commands may have fixes |
| `.opencode/skills/*/SKILL.md` | Skill definitions may improve |
| `AGENTS.md` | Project rules may be updated |
| `contracts/pack/registry.json` | Contract registry evolves |
| Governance documents | Quality improvements |

---

## Breaking Changes

### Handling Breaking Changes

1. **Check before upgrade**:
   ```bash
   cat templates/pack/pack-version.json | grep breaking_changes
   ```

2. **Review upgrade history**:
   ```bash
   cat template-manifest.json | grep -A 20 upgrade_history
   ```

3. **Test in a branch**:
   ```bash
   git checkout -b upgrade-test
   node templates/cli/install.js --upgrade
   node templates/cli/doctor.js
   ```

### Breaking Change Categories

| Category | Impact | Action Required |
|----------|--------|-----------------|
| Command signature change | High | Update command calls |
| Skill interface change | Medium | Update skill usage |
| Governance rule change | Medium | Review and adapt |
| Contract schema change | Low | Validate artifacts |

---

## Rollback Strategy

### Manual Rollback

1. **Before upgrading**, create a backup:
   ```bash
   cp -r .opencode .opencode.backup
   cp template-manifest.json template-manifest.backup.json
   ```

2. **If upgrade fails**, restore:
   ```bash
   rm -rf .opencode
   mv .opencode.backup .opencode
   mv template-manifest.backup.json template-manifest.json
   ```

### Git-Based Rollback

```bash
# Commit before upgrade
git add . && git commit -m "Pre-upgrade state"

# If upgrade fails
git checkout HEAD~1 -- .
```

---

## Upgrade Checklist

- [ ] Check current version in template-manifest.json
- [ ] Review breaking_changes in pack-version.json
- [ ] Create backup or git commit
- [ ] Run `--dry-run` to preview changes
- [ ] Execute upgrade
- [ ] Run `doctor.js` to verify
- [ ] Test critical workflows
- [ ] Commit upgrade changes

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial template pack release |