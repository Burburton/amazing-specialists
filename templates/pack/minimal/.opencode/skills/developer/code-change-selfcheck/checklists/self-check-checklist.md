# Self-Check Checklist

## Category 1: Goal Alignment

- [ ] Implementation matches task goal
- [ ] All acceptance criteria met
- [ ] No omitted key features
- [ ] No out-of-scope changes

---

## Category 2: Design Consistency

*(Skip if no design note)*

- [ ] Matches design note structure
- [ ] Respects module boundaries
- [ ] Honors interface contracts
- [ ] Deviations documented with rationale

---

## Category 3: Scope Control

- [ ] Changes are minimal for task
- [ ] No unrelated file modifications
- [ ] Deleted code was necessary to delete
- [ ] No "while I'm here" changes

---

## Category 4: Constraint Compliance

- [ ] Technical constraints satisfied
- [ ] Performance constraints met (if any)
- [ ] Security constraints met (if any)
- [ ] Dependency constraints met (if any)

---

## Category 5: Code Quality

- [ ] Code is readable and understandable
- [ ] Naming is clear and consistent
- [ ] No obvious logic errors
- [ ] Exceptions properly handled
- [ ] No dead code

---

## Category 6: Test Coverage

- [ ] New code has corresponding tests
- [ ] Modified code has updated tests
- [ ] All tests pass
- [ ] Test coverage acceptable

---

## Category 7: Dependency Management

*(Skip if no new dependencies)*

- [ ] New dependencies are necessary
- [ ] New dependencies approved
- [ ] Dependency versions appropriate
- [ ] No circular dependencies introduced

---

## Category 8: Documentation

- [ ] Code comments updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Complex logic has explanatory comments
- [ ] Design changes reflected in docs

---

## Category 9: Security

- [ ] Input validation present
- [ ] No sensitive data hardcoded or leaked
- [ ] Proper authentication/authorization
- [ ] No SQL/command injection risks
- [ ] Dependencies have no known vulnerabilities

---

## Category 10: Performance

- [ ] No obvious performance issues
- [ ] No N+1 query patterns
- [ ] Memory leaks unlikely
- [ ] Large data scenarios considered

---

## Summary

### Count Results
- Total checks: _____
- Passed: _____
- Failed: _____
- Skipped (N/A): _____

### Blockers (must fix before handoff)
| ID | Category | Description | Location |
|----|----------|-------------|----------|
| | | | |
| | | | |

### Warnings (should fix but not blocking)
| ID | Category | Description | Recommendation |
|----|----------|-------------|----------------|
| | | | |
| | | | |

### Overall Status
- [ ] PASS - Ready for handoff
- [ ] PASS_WITH_WARNINGS - Ready with documented issues
- [ ] FAIL_WITH_BLOCKERS - Must fix blockers first

### Recommendation
- [ ] PROCEED - Send to tester/reviewer
- [ ] FIX_BLOCKERS - Fix blockers, then re-check
- [ ] ESCALATE - Cannot resolve blockers