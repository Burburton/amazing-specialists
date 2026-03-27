# Dependency Optimization Validation Checklist

## Pre-Optimization

### Analysis Preparation
- [ ] Run depcheck for unused dependency detection
- [ ] Run npm audit / yarn audit for security scan
- [ ] Generate dependency tree (npm ls)
- [ ] Record current dependency count
- [ ] Record current bundle size (if applicable)
- [ ] Record current build time (if applicable)

### Safety Assessment
- [ ] Each removal candidate verified for actual usage
- [ ] Imports searched in codebase (grep)
- [ ] Polyfills and compatibility deps identified
- [ ] Dev vs production dependencies distinguished
- [ ] Peer dependencies handled correctly

---

## During Optimization

### Per-Removal Verification
- [ ] Remove single dependency
- [ ] Run build immediately
- [ ] Run tests immediately
- [ ] Check for import errors
- [ ] Check for runtime errors
- [ ] If any failure, rollback and investigate

### Per-Replacement Verification
- [ ] Replacement package installed
- [ ] Code updated to use replacement
- [ ] Tests pass with replacement
- [ ] Behavior matches original
- [ ] Bundle size measured

### Per-Upgrade Verification
- [ ] Upgrade single package
- [ ] Check for peer dependency conflicts
- [ ] Run tests with new version
- [ ] Check for breaking changes
- [ ] Update code if API changed

---

## Post-Optimization

### Final Verification
- [ ] Full build succeeds
- [ ] All tests pass
- [ ] No runtime errors
- [ ] No import warnings
- [ ] Application starts correctly

### Measurement
- [ ] Bundle size compared (before/after)
- [ ] Build time compared (before/after)
- [ ] Dependency count compared (before/after)
- [ ] Security audit clean (or issues documented)

### Documentation
- [ ] Each removal documented with reason
- [ ] Each replacement documented with reason
- [ ] Each upgrade documented with reason
- [ ] Known issues documented
- [ ] Risks documented

---

## Risk-Specific Checks

### Removing Dependencies
- [ ] depcheck confirms unused
- [ ] grep confirms no imports
- [ ] Not a polyfill for target browsers
- [ ] Not a peer dependency
- [ ] Tests pass after removal

### Replacing Dependencies
- [ ] Replacement package evaluated
- [ ] API compatibility checked
- [ ] Bundle size of replacement measured
- [ ] Security status of replacement checked
- [ ] Maintenance status of replacement checked

### Upgrading Dependencies
- [ ] Breaking changes reviewed
- [ ] Peer dependency updates needed
- [ ] Tests updated for new API
- [ ] Migration guide followed (if available)
- [ ] Staged upgrade if multiple deps

---

## Output Requirements

### dependency_optimization_summary Must Have
- [ ] dispatch_id and task_id
- [ ] analysis with before/after counts
- [ ] unused_dependencies list
- [ ] security_issues count
- [ ] optimizations with reasons
- [ ] verification results
- [ ] known_issues (even if empty)
- [ ] risks (even if empty)
- [ ] recommendation

### For Each Removal
- [ ] Package name and version
- [ ] Reason for removal
- [ ] Verification method used
- [ ] Impact confirmed safe

### For Each Replacement
- [ ] Old package name
- [ ] New package name
- [ ] Reason for replacement
- [ ] Size/behavior impact

---

## Warning Signs

Stop and investigate if:
- [ ] depcheck shows dependency IS used
- [ ] Imports found after claimed removal
- [ ] Tests fail after any change
- [ ] Build warnings appear
- [ ] Security audit shows new issues
- [ ] Bundle size increases unexpectedly

## Security Priority

| Priority | Condition | Action |
|----------|-----------|--------|
| Critical | Active exploit known | Immediate fix/replace |
| High | CVE with fix available | Fix within 24 hours |
| Medium | CVE with workaround | Plan fix within week |
| Low | CVE no fix available | Document, monitor |

## Handoff Readiness

- [ ] dependency_optimization_summary complete
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Bundle/build improvements documented
- [ ] Security audit addressed
- [ ] Ready for code review