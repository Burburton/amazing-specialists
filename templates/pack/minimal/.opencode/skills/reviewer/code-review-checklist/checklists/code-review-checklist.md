# Code Review Checklist

> **Standalone checklist for quick reference.** For detailed guidance, see `../SKILL.md`.

---

## Pre-Review Checklist

- [ ] Read spec and design documents
- [ ] Understand the change scope and reason
- [ ] Identify review focus areas (security, performance, etc.)
- [ ] **BR-002**: Acknowledge self-check as hints, NOT evidence

---

## Review Checklist Categories

### 1. Goal Alignment (目标对齐)
- [ ] Does implementation match task goal?
- [ ] Are all acceptance criteria met?
- [ ] Any missing requirements?
- [ ] Any out-of-scope features added?
- [ ] Consistent with design note?

### 2. Scope Control (范围控制)
- [ ] Changes are minimum necessary?
- [ ] No unrelated changes mixed in?
- [ ] Deleted code is necessary?
- [ ] No temporary/debug code left?

### 3. Correctness (功能正确性)
- [ ] Logic is correct?
- [ ] Boundary conditions handled?
- [ ] Error handling complete?
- [ ] No obvious bugs?
- [ ] Thread safety considered?

### 4. Test Coverage (测试覆盖)
- [ ] New code has tests?
- [ ] Modified code has updated tests?
- [ ] Boundary conditions tested?
- [ ] Error paths tested?
- [ ] Tests are sufficient?

### 5. Code Quality (代码质量)
- [ ] Code is readable?
- [ ] Naming is clear and meaningful?
- [ ] Single responsibility per function/class?
- [ ] Complexity is reasonable?
- [ ] No duplicate code?
- [ ] Comments are clear and necessary?

### 6. Security (安全性)
- [ ] Input validated?
- [ ] Output escaped?
- [ ] No injection risks (SQL/Command/XSS)?
- [ ] Sensitive data encrypted?
- [ ] Permissions checked?
- [ ] No sensitive information leaked?

### 7. Performance (性能)
- [ ] No obvious performance issues?
- [ ] No N+1 queries?
- [ ] No unnecessary computations?
- [ ] Large data scenarios considered?
- [ ] Resource usage reasonable?

### 8. Error Handling (错误处理)
- [ ] Errors properly handled?
- [ ] Exceptions caught?
- [ ] Error messages clear?
- [ ] No silent failures?
- [ ] Recovery mechanisms exist?

### 9. Maintainability (可维护性)
- [ ] Easy to modify?
- [ ] Follows design patterns?
- [ ] Minimal coupling?
- [ ] Documentation updated?
- [ ] No technical debt introduced?

### 10. Dependencies (依赖管理)
- [ ] New dependencies necessary?
- [ ] Dependency versions stable?
- [ ] No security vulnerabilities in dependencies?
- [ ] Licenses compliant?

---

## BR Compliance Checks

### BR-002: Self-Check Is Not Evidence
- [ ] Self-check acknowledged as hints only
- [ ] Key claims independently verified by reviewer
- [ ] Report uses "Reviewer independently verified..." language
- [ ] No "Developer confirmed..." in report

### BR-004: Severity Classification
- [ ] All issues classified: blocker | major | minor | note
- [ ] Blockers listed in `must_fix`
- [ ] Major issues listed in `should_fix`
- [ ] Minor issues listed in `consider`

### BR-006: Governance Alignment
- [ ] Checked if changes affect role boundaries
- [ ] Checked if changes affect workflow/stages
- [ ] Checked if README.md needs update
- [ ] Governance drift reported as major+ if found

### BR-007: Honest Disclosure
- [ ] Files reviewed listed
- [ ] Files NOT reviewed listed with reason
- [ ] Assumptions documented
- [ ] Review gaps disclosed

---

## Severity Classification Quick Reference

| Severity | Definition | Action |
|----------|------------|--------|
| **blocker** | Must fix, blocks milestone | `must_fix`, reject |
| **major** | Affects downstream or understanding | `should_fix`, consider warn |
| **minor** | Improvement possible | `consider`, approve allowed |
| **note** | Informational | Notes section |

### Blocker Examples
- Core functionality broken
- Security vulnerability (injection, leak, bypass)
- Critical performance issue
- Data corruption risk
- **Forged verification results**
- **Governance fundamental conflict**

### Major Examples
- Code quality affecting maintainability
- Missing test coverage (key paths)
- Potential bugs (boundary conditions)
- **Canonical document conflict**
- **Partial gap undisclosed**

### Minor Examples
- Style suggestions
- Optimization opportunities
- Better patterns
- Documentation improvements

---

## Post-Review Checklist

- [ ] All checklist categories reviewed
- [ ] Issues classified by severity (BR-004)
- [ ] Suggestions are specific and actionable
- [ ] Decision is clear (approve/reject/warn)
- [ ] Report generated with all required sections
- [ ] **BR-002**: Independent verification documented
- [ ] **BR-007**: Review scope and gaps disclosed

---

## Common Anti-Patterns to Avoid

| Anti-Pattern | Warning Sign | Fix |
|--------------|--------------|-----|
| **Vague review** | "LGTM", no specific findings | Add specific issues with code locations |
| **Rubber stamp** | "Self-check passed, approving" | Independent verification required |
| **Severity confusion** | Blocker written as minor | Use severity classification table |
| **Missing coverage** | No `review_coverage` section | Add files reviewed/not reviewed |
| **Self-check confusion** | "Developer verified..." | Use "Reviewer independently verified..." |

---

## Quick Decision Guide

```
┌─────────────────────────────────────────────────────────────┐
│                    REVIEW DECISION TREE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Are there blocker issues?                                  │
│       │                                                      │
│       ├── YES → REJECT (must_fix required)                  │
│       │                                                      │
│       └── NO ──┐                                            │
│                │                                             │
│                ▼                                             │
│  Are there major issues?                                    │
│       │                                                      │
│       ├── YES → WARN (should_fix recommended)               │
│       │          or REJECT if critical                      │
│       │                                                      │
│       └── NO ──┐                                            │
│                │                                             │
│                ▼                                             │
│  Are there minor issues?                                    │
│       │                                                      │
│       ├── YES → APPROVE (consider suggestions)              │
│       │                                                      │
│       └── NO ──→ APPROVE                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Related Resources

- **Full Skill**: `../SKILL.md`
- **Examples**: `../examples/`
- **Anti-Examples**: `../anti-examples/`
- **Quality Gate**: `quality-gate.md` Section 3.4
- **Governance**: `role-definition.md` (reviewer role)