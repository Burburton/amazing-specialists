# Anti-Example 002: Large Bugfix with Refactoring

## Scenario
Developer uses bugfix as opportunity for unrelated refactoring.

## What Went Wrong

### Bug Report
```
Issue: Wrong tax calculation
Severity: Medium
Expected: 10% tax
Actual: 5% tax calculated
```

### Developer's Fix
```yaml
bugfix_report:
  fix_details:
    changed_files:
      - path: "src/services/TaxService.ts"
        lines_changed:
          added: 150
          deleted: 80
        # PROBLEM: 230 line change for a tax rate fix
      - path: "src/services/OrderService.ts"
        lines_changed:
          added: 45
          deleted: 30
        # PROBLEM: Unrelated to tax calculation
      - path: "src/utils/formatting.ts"
        lines_changed:
          added: 20
          deleted: 10
        # PROBLEM: Completely unrelated
    is_minimal_fix: false
  
  lessons_learned:
    - lesson: "Refactored the service while fixing"
      # PROBLEM: Refactoring is not a lesson about the bug
```

## Problems Identified

| Problem | Evidence | Impact |
|---------|----------|--------|
| Scope creep | 230 line change | Higher risk |
| Unrelated changes | 3 files unrelated to bug | Hard to review |
| Risk increase | Large change = more bugs | Regression likely |
| Review difficulty | Mixed concerns | Slow approval |

## Correct Approach

### Separate Concerns

**Bugfix:**
```yaml
fix_details:
  changed_files:
    - path: "src/services/TaxService.ts"
      lines_changed:
        added: 2
        deleted: 1
  is_minimal_fix: true
```

**Refactoring (separate task):**
```yaml
task: "Refactor TaxService for maintainability"
# Separate PR, separate review
```

## Why This Matters

1. **Risk isolation**: Bugfix should be low-risk
2. **Fast deployment**: Small fixes deploy quickly
3. **Clear revert**: If issues, easy to revert
4. **Clean history**: Git history shows clear intent

## Detection Checklist

- [ ] Fix size proportional to bug severity?
- [ ] All changed files directly related to bug?
- [ ] No "while I'm here" changes?
- [ ] Single commit purpose?

## Prevention

1. **Stick to the bug**: Fix only what's broken
2. **Note refactoring opportunities**: Create separate task
3. **Get approval for scope changes**: Ask before expanding
4. **Remember**: Bugfix = minimal, focused change