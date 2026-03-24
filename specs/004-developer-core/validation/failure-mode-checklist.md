# Failure Mode Checklist

## Purpose
Identify common failure modes in developer role execution.

---

## Implementation Failure Modes

### FM-001: Implementation Without Design
**Detection**:
- [ ] No reference to design-note in implementation-summary
- [ ] Code structure differs from module-boundaries
- [ ] Constraints not reflected in code

**Early Warning**:
- Developer cannot explain design approach
- Implementation-summary missing design reference

**Recovery**:
1. Stop implementation
2. Read design-note
3. Document deviations
4. Adjust implementation

---

### FM-002: Silent Design Deviation
**Detection**:
- [ ] Implementation differs from design
- [ ] No deviation documented in implementation-summary
- [ ] `deviations_from_design` empty but differences exist

**Early Warning**:
- Implementation doesn't match design summary
- Developer mentions "better approach" without approval

**Recovery**:
1. Identify deviations
2. Document rationale
3. Get approval if significant
4. Update implementation-summary

---

### FM-003: Scope Creep
**Detection**:
- [ ] Changed files include unrelated modules
- [ ] Line changes unusually high for task
- [ ] Features implemented not in design

**Early Warning**:
- "While I'm here, I'll also..."
- Changed files count exceeds expected
- Implementation-summary describes extra features

**Recovery**:
1. Identify scope creep
2. Remove unrelated changes
3. Document scope creep separately
4. Propose separate task if valuable

---

### FM-004: Constraint Violation
**Detection**:
- [ ] Technical constraints violated
- [ ] Security constraints violated
- [ ] Performance constraints violated
- [ ] Dependency constraints violated

**Early Warning**:
- Implementation-summary doesn't address constraints
- Self-check constraint section fails

**Recovery**:
1. Identify violated constraint
2. Revert violating code
3. Find compliant alternative
4. Escalate if constraint infeasible

---

## Self-Check Failure Modes

### FM-005: Skipping Self-Check
**Detection**:
- [ ] No self-check-report
- [ ] obvious issues found by reviewer
- [ ] Low first-pass review rate

**Early Warning**:
- Developer rushes to handoff
- "It compiles, good enough"

**Recovery**:
1. Generate self-check-report
2. Run all checks
3. Fix blockers
4. Document warnings

---

### FM-006: False All-Clear
**Detection**:
- [ ] self-check-report says PASS
- [ ] obvious bugs exist
- [ ] Reviewer finds issues self-check should catch

**Early Warning**:
- Self-check completed too quickly
- All checks marked pass without evidence

**Recovery**:
1. Re-run self-check honestly
2. Fix actual issues
3. Document honestly
4. Learn from oversight

---

### FM-007: Blocker Downgrade
**Detection**:
- [ ] Issues marked as warning that should be blocker
- [ ] Severity mismatch between issue and severity level
- [ ] Critical issues not blocking handoff

**Early Warning**:
- Self-check shows many warnings but no blockers
- High-risk issues marked as low severity

**Recovery**:
1. Re-evaluate severity levels
2. Upgrade inappropriate classifications
3. Fix real blockers
4. Re-assess handoff readiness

---

## Bugfix Failure Modes

### FM-008: Surface Bugfix
**Detection**:
- [ ] Root cause describes symptoms, not cause
- [ ] Same bug recurs in different places
- [ ] No 5 Whys or similar analysis

**Early Warning**:
- Fix adds null checks everywhere
- Bugfix-report root cause is shallow

**Recovery**:
1. Revert surface fix
2. Perform root cause analysis
3. Fix root cause
4. Document lessons learned

---

### FM-009: Large Bugfix
**Detection**:
- [ ] Bugfix changes many files
- [ ] Bugfix includes refactoring
- [ ] Bugfix is not minimal

**Early Warning**:
- Fix description includes "also improved"
- Line changes high for simple bug

**Recovery**:
1. Identify core fix
2. Remove unrelated changes
3. Submit minimal fix
4. Propose refactoring separately

---

### FM-010: No Reproduction Test
**Detection**:
- [ ] Bugfix has no test
- [ ] No reproduction test
- [ ] Bug may recur without detection

**Early Warning**:
- Bugfix-report missing tests_added
- No verification test mentioned

**Recovery**:
1. Create reproduction test
2. Verify test fails on old code
3. Verify test passes on fix
4. Document in bugfix-report

---

## Role Boundary Failure Modes

### FM-011: Role Bleeding
**Detection**:
- [ ] Developer claims approval authority
- [ ] Developer skips required review
- [ ] Developer does tester's job

**Early Warning**:
- "This is ready to merge"
- Skipping review "because it's simple"

**Recovery**:
1. Acknowledge role boundary
2. Submit for proper review
3. Let other roles do their jobs

---

### FM-012: Premature Handoff
**Detection**:
- [ ] Handoff before self-check complete
- [ ] Known issues not documented
- [ ] Blockers not resolved

**Early Warning**:
- Implementation-summary incomplete
- Self-check-report missing

**Recovery**:
1. Complete self-check
2. Fix blockers
3. Document issues
4. Re-handoff

---

## Communication Failure Modes

### FM-013: Missing Escalation
**Detection**:
- [ ] Design conflict not escalated
- [ ] Critical issue not reported
- [ ] Multiple rework attempts without escalation

**Early Warning**:
- Developer stuck but not asking for help
- Implementation stalled without blocker documented

**Recovery**:
1. Identify blocking issue
2. Document issue
3. Escalate appropriately
4. Wait for resolution

---

## Checklist Summary

| Failure Mode | Category | Detection Points |
|--------------|----------|------------------|
| FM-001 | Implementation | 3 |
| FM-002 | Implementation | 3 |
| FM-003 | Implementation | 3 |
| FM-004 | Implementation | 4 |
| FM-005 | Self-Check | 3 |
| FM-006 | Self-Check | 3 |
| FM-007 | Self-Check | 3 |
| FM-008 | Bugfix | 3 |
| FM-009 | Bugfix | 3 |
| FM-010 | Bugfix | 3 |
| FM-011 | Role Boundary | 3 |
| FM-012 | Role Boundary | 3 |
| FM-013 | Communication | 3 |
| **Total** | | **40** |

---

## References
- `specs/004-developer-core/validation/anti-pattern-guidance.md` - Anti-patterns
- `specs/004-developer-core/role-scope.md` - Role boundaries
- `quality-gate.md` - Quality gates