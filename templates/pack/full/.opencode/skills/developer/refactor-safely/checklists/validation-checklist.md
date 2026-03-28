# Refactoring Validation Checklist

## Pre-Refactoring

### Scope Assessment
- [ ] Refactoring objective clearly stated
- [ ] Affected files identified
- [ ] Impact boundary defined
- [ ] External interfaces identified
- [ ] Risk level assessed (low/medium/high)

### Test Coverage Check
- [ ] Current test coverage measured
- [ ] Coverage sufficient for refactoring (>70%)
- [ ] If insufficient, tests added
- [ ] Critical paths covered by tests
- [ ] Edge cases covered by tests

### Planning
- [ ] Refactoring broken into small steps
- [ ] Each step independently verifiable
- [ ] Each step independently reversible
- [ ] Commit strategy defined
- [ ] Rollback plan documented

---

## During Refactoring

### Step-by-Step Execution
- [ ] Only one refactoring pattern per step
- [ ] Tests run after each step
- [ ] All tests pass before next step
- [ ] Commit made after each verified step
- [ ] Commit message describes the change

### Behavior Preservation
- [ ] No API changes
- [ ] No parameter changes
- [ ] No return type changes
- [ ] No side effect changes
- [ ] No timing/performance changes (unless intended)

### Progress Tracking
- [ ] Steps completed tracked
- [ ] Issues encountered documented
- [ ] Scope changes documented
- [ ] Time spent recorded

---

## Post-Refactoring

### Final Verification
- [ ] All tests pass
- [ ] Test coverage maintained or improved
- [ ] No new test failures
- [ ] Behavior comparison performed
- [ ] Performance impact measured (if applicable)

### Code Quality
- [ ] Code more readable
- [ ] Code more maintainable
- [ ] No new code smells
- [ ] Consistent with project style

### Documentation
- [ ] refactor_summary complete
- [ ] Changed files listed with descriptions
- [ ] Behavior preservation verified
- [ ] Commit history clean
- [ ] Known issues documented

---

## Risk-Specific Checks

### For Low-Risk Refactoring (Extract Method, Rename, etc.)
- [ ] Standard checks above
- [ ] Single file or small scope
- [ ] Good test coverage

### For Medium-Risk Refactoring (Move Method, Extract Interface, etc.)
- [ ] All standard checks
- [ ] Multiple files affected
- [ ] Integration tests added
- [ ] Behavior comparison tests

### For High-Risk Refactoring (Inheritance Change, Data Structure, etc.)
- [ ] All standard checks
- [ ] Architecture review obtained
- [ ] Performance tests run
- [ ] Staged rollout planned
- [ ] Rollback plan tested
- [ ] Monitoring in place

---

## Output Requirements

### refactor_summary Must Have
- [ ] dispatch_id and task_id
- [ ] refactoring_goal with objective, scope, approach
- [ ] test_coverage before and after
- [ ] changed_files with behavior_preserved status
- [ ] commit_history with verification methods
- [ ] verification_results
- [ ] known_issues (even if empty)
- [ ] risks (even if empty)
- [ ] recommendation

### If Behavior Changed
- [ ] Document what changed
- [ ] Document why it changed
- [ ] Document who approved
- [ ] Consider using feature-implementation instead

---

## Warning Signs

Stop and reassess if:
- [ ] Tests failing unexpectedly
- [ ] Scope growing beyond plan
- [ ] Behavior changes detected
- [ ] Unable to verify preservation
- [ ] Feeling "hopeful" instead of "confident"

## Handoff Readiness

- [ ] refactor_summary complete
- [ ] All tests pass
- [ ] Behavior preserved confirmed
- [ ] Git history clean
- [ ] Ready for code review