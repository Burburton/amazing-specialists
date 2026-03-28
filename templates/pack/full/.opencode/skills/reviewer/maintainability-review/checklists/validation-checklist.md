# Validation Checklist: Maintainability Review

> **Standalone checklist for maintainability review.** For detailed guidance, see `../SKILL.md`.

---

## Pre-Review Checklist

- [ ] Read design-note for expected patterns
- [ ] Understand module boundaries
- [ ] Identify high LOC files (>100 lines changed)
- [ ] **BR-002**: Acknowledge self-check claims as hints only

---

## Complexity Analysis Checklist

### Cyclomatic Complexity
- [ ] Counted decision points in key functions?
- [ ] Identified functions exceeding threshold (>15)?
- [ ] Verified developer's complexity claims independently?

### Function Length
- [ ] Checked function lengths?
- [ ] Identified functions exceeding threshold (>50 lines)?
- [ ] Long functions documented with suggestions?

### Nesting Depth
- [ ] Checked nesting levels?
- [ ] Identified deep nesting exceeding threshold (>4)?
- [ ] Suggested flattening patterns (guard clauses)?

---

## Dependency Assessment Checklist

### Dependency Mapping
- [ ] Listed all imports/dependencies?
- [ ] Checked for unnecessary dependencies?
- [ ] Verified new dependencies are justified?

### Circular Dependencies
- [ ] Traced import chains for circular patterns?
- [ ] Documented any circular dependencies found?
- [ ] Suggested resolution strategies?

### Coupling Assessment
- [ ] Evaluated coupling tightness?
- [ ] Identified hidden dependencies (global state)?
- [ ] Checked module boundaries are clear?

---

## SOLID Principles Checklist

### Single Responsibility Principle (S)
- [ ] Each class has one responsibility?
- [ ] Each function has one purpose?
- [ ] Identified classes with multiple concerns?

### Open/Closed Principle (O)
- [ ] Easy to extend without modification?
- [ ] Uses interfaces/abstracts appropriately?
- [ ] Configuration over hardcoding?

### Liskov Substitution Principle (L)
- [ ] Subclasses can replace parent classes?
- [ ] No unexpected behavior in overrides?
- [ ] Inheritance used appropriately?

### Interface Segregation Principle (I)
- [ ] Interfaces are minimal necessary?
- [ ] Clients don't depend on unused methods?
- [ ] Fat interfaces identified?

### Dependency Inversion Principle (D)
- [ ] Depends on abstractions, not concretes?
- [ ] Dependency injection used appropriately?
- [ ] High-level modules independent?

---

## Documentation Coverage Checklist

### API Documentation
- [ ] Public methods documented?
- [ ] Input/output types specified?
- [ ] Error conditions documented?

### Inline Comments
- [ ] Complex logic has explanatory comments?
- [ ] Magic numbers have context?
- [ ] Non-obvious decisions explained?

### Naming Quality
- [ ] Variable names are descriptive?
- [ ] Function names express intent?
- [ ] Constants are meaningful?

---

## Test Quality Checklist

### Test Structure
- [ ] Tests organized per module?
- [ ] Test file naming is clear?
- [ ] Test coverage for key paths?

### Test Maintainability
- [ ] Tests are readable?
- [ ] Test names describe scenarios?
- [ ] Setup/teardown organized?

---

## BR Compliance Checks

### BR-002: Independent Verification
- [ ] Self-check acknowledged as hints only
- [ ] Complexity claims independently verified
- [ ] SOLID compliance independently assessed
- [ ] Dependency claims independently verified

### BR-004: Severity Classification
- [ ] All issues classified: blocker | major | minor
- [ ] Blockers in `must_fix`
- [ ] Major issues in `should_fix`
- [ ] Minor issues in `consider`

### BR-007: Honest Disclosure
- [ ] Files analyzed listed
- [ ] Files NOT analyzed listed with reason
- [ ] Assumptions documented
- [ ] Analysis gaps disclosed

---

## Score Calculation Guide

| Score | Criteria |
|-------|----------|
| **5** | All thresholds within range, SOLID compliant, docs complete |
| **4** | Minor threshold exceedances, SOLID mostly compliant |
| **3** | One major threshold exceedance, some SOLID violations |
| **2** | Multiple major exceedances, significant SOLID violations |
| **1** | Severe complexity, SOLID fundamentally violated |

---

## Technical Debt Estimation Guide

| Issue | Estimated Hours |
|-------|-----------------|
| Cyclomatic complexity exceed threshold by 10 | 2 hours |
| Function >100 lines | 3 hours |
| Circular dependency | 2 hours |
| SRP violation (split class) | 4 hours |
| Missing API documentation | 1 hour |

---

## Common Anti-Patterns to Avoid

| Anti-Pattern | Warning Sign | Fix |
|--------------|--------------|-----|
| **Score without evidence** | Score 5, empty hot spots | Add complexity metrics |
| **SOLID blanket claim** | "Follows SOLID" | Check per-principle |
| **Trust complexity claims** | "Developer verified" | Count decision points |
| **No coverage disclosure** | Missing review_coverage | Add scope section |

---

## Quick Decision Guide

```
┌─────────────────────────────────────────────────────────────┐
│               MAINTAINABILITY DECISION TREE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Are there complexity hot spots exceeding threshold?         │
│       │                                                      │
│       ├── YES (>15 complexity) → Score 2-3, WARN/REJECT     │
│       │                                                      │
│       └── NO ──┐                                             │
│                │                                              │
│                ▼                                              │
│  Are there SOLID violations?                                 │
│       │                                                      │
│       ├── YES (SRP violated) → Score 2-3, should_fix        │
│       │                                                      │
│       └── NO ──┐                                             │
│                │                                              │
│                ▼                                              │
│  Is documentation incomplete?                                │
│       │                                                      │
│       ├── YES (missing API docs) → Score 3-4, consider      │
│       │                                                      │
│       └── NO ──→ Score 4-5, APPROVE                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Related Resources

- **Full Skill**: `../SKILL.md`
- **Examples**: `../examples/`
- **Anti-Examples**: `../anti-examples/`
- **Quality Gate**: `quality-gate.md` Section 3.4
- **SOLID Reference**: `architect/module-boundary-design/SKILL.md`