# Developer Anti-Pattern Guidance

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `004-developer-core` |
| **Document Type** | Anti-Pattern Guidance |
| **Version** | 1.0.0 |
| **Created** | 2026-03-24 |

---

## Overview

This document defines common anti-patterns in developer role execution, including detection methods, prevention strategies, and remediation approaches.

---

## AP-001: Implementation Without Design

### Definition
Implementing code without reading or understanding the design-note.

### Symptoms
- Implementation doesn't reference design-note
- Code structure differs from design without documented rationale
- Module boundaries violated
- Implementation doesn't match design constraints

### Detection
| Check | Method |
|-------|--------|
| Design reference | Check if implementation-summary references design-note |
| Structural alignment | Compare module organization with module-boundaries |
| Constraint compliance | Verify constraints in design-note are respected |

### Prevention
- Require explicit design-note reference before implementation
- Include design alignment check in code-change-selfcheck
- Review for design references in code review

### Remediation
1. Pause implementation
2. Read design-note
3. Compare current implementation with design
4. Document deviations if any
5. Adjust implementation to match design or escalate

### Example
```yaml
# Anti-pattern: No design reference
implementation_summary:
  implementation:
    approach: "Implemented auth as per requirements"
    # Missing: reference to design-note

# Good: Explicit design reference
implementation_summary:
  implementation:
    approach: "Implemented auth per design-note.md Section 3.2"
    # References specific design section
```

---

## AP-002: Silent Design Deviation

### Definition
Deviating from design without documenting rationale.

### Symptoms
- Implementation differs from design but no deviation documented
- "I thought it was better this way" without approval
- Design constraints violated without escalation

### Detection
| Check | Method |
|-------|--------|
| Deviation field | Check if deviations_from_design is populated when differences exist |
| Constraint check | Verify constraints are respected or escalated |
| Design comparison | Spot-check implementation against design |

### Prevention
- Make deviations_from_design a required field
- Require approval for deviations in self-check
- Include design comparison in review checklist

### Remediation
1. Identify deviations
2. Document rationale
3. Get approval if significant
4. Update implementation-summary
5. Notify architect if needed

### Example
```yaml
# Anti-pattern: Silent deviation
# Design said: Use JWT
# Implementation: Used session cookies
# No deviation documented

# Good: Documented deviation
implementation_summary:
  deviations_from_design:
    - deviation: "Used session cookies instead of JWT"
      rationale: "Client requirements changed, approved by PO"
      approved_by: "product_owner"
```

---

## AP-003: Scope Creep

### Definition
Adding unrelated features or changes during implementation.

### Symptoms
- Changed files include unrelated modules
- "While I'm here, I'll refactor this too"
- Task grows beyond original scope
- Extra features not in design

### Detection
| Check | Method |
|-------|--------|
| File scope | Check if changed files match task scope |
| Design alignment | Verify all changes align with design |
| Line count | Unusually high line changes for task |
| Feature check | Identify features not in design |

### Prevention
- Scope control check in self-check
- Review for out-of-scope changes
- Require explicit scope change approval

### Remediation
1. Identify scope creep
2. Separate core changes from scope creep
3. Remove scope creep changes
4. Document scope creep separately
5. Propose separate task for scope creep if valuable

### Example
```yaml
# Anti-pattern: Scope creep
# Task: Add login endpoint
# Also: Refactored entire auth module, updated user service

# Good: Scope controlled
implementation_summary:
  changed_files:
    - path: "src/controllers/AuthController.ts"  # Login endpoint
    - path: "src/services/AuthService.ts"        # Auth logic
  # No unrelated files
```

---

## AP-004: Surface Bugfix

### Definition
Fixing symptoms without root cause analysis.

### Symptoms
- Bugfix adds null checks everywhere
- Same bug recurs in different places
- Fixes don't address why the bug occurred
- "Fixed" bugs reappear

### Detection
| Check | Method |
|-------|--------|
| Root cause depth | Check if root_cause describes symptoms or actual cause |
| 5 Whys | Verify analysis uses systematic approach |
| Recurrence | Track if similar bugs recur |

### Prevention
- Require root cause analysis in bugfix-report
- Use 5 Whys or similar methodology
- Review root cause depth

### Remediation
1. Revert surface fix
2. Analyze root cause using 5 Whys
3. Fix root cause
4. Verify fix addresses root cause
5. Document lessons learned

### Example
```yaml
# Anti-pattern: Surface fix
bugfix_report:
  root_cause:
    category: "logic_error"
    description: "Null pointer when user not found"
    # Just describes symptom, not why user not found

# Good: Root cause analysis
bugfix_report:
  root_cause:
    category: "logic_error"
    description: |
      1. Null pointer occurs
      2. Why? User lookup returns null
      3. Why? User ID from JWT payload invalid
      4. Why? Token not validated before use
      5. Why? Validation middleware not applied to this route
      Root cause: Missing auth middleware on route
```

---

## AP-005: Skipping Self-Check

### Definition
Handing off code without systematic self-validation.

### Symptoms
- No self-check-report
- "It compiles, ship it!"
- Obvious issues found by tester/reviewer
- Low first-pass review rate

### Detection
| Check | Method |
|-------|--------|
| Report presence | Check for self-check-report |
| Issue detection | Check if obvious issues exist |
| Check coverage | Verify all categories checked |

### Prevention
- Make self-check-report mandatory
- Include self-check in quality gate
- Spot-check self-check accuracy

### Remediation
1. Generate self-check-report
2. Run through all checks
3. Fix blockers
4. Document warnings
5. Re-handoff

### Example
```yaml
# Anti-pattern: Skipped self-check
# No self-check-report
# Code handed off with compilation errors

# Good: Complete self-check
self_check_report:
  summary:
    total_checks: 28
    passed: 28
    blockers: 0
  check_results:
    # Complete results for all categories
```

---

## AP-006: False All-Clear

### Definition
Claiming self-check passed when obvious issues exist.

### Symptoms
- self-check-report says PASS
- Reviewer finds obvious bugs
- tester finds obvious issues
- Blockers marked as fixed but still exist

### Detection
| Check | Method |
|-------|--------|
| Spot check | Reviewer spot-checks self-check claims |
| Blocker verification | Verify blockers are actually fixed |
| Accuracy tracking | Track self-check accuracy over time |

### Prevention
- Require evidence for blocker fixes
- Spot-check self-check results
- Track self-check accuracy

### Remediation
1. Acknowledge oversight
2. Fix actual issues
3. Re-run self-check
4. Honest reporting
5. Learn from mistake

### Example
```yaml
# Anti-pattern: False all-clear
self_check_report:
  overall_status: PASS
  # But: Code has obvious null pointer

# Good: Honest reporting
self_check_report:
  summary:
    total_checks: 28
    passed: 27
    failed: 1
    blockers: 1
  blockers:
    - blocker_id: "BLOCKER-001"
      description: "Null pointer in UserService"
      fixed: false
  overall_status: FAIL_WITH_BLOCKERS
```

---

## AP-007: Role Bleeding

### Definition
Developer crossing into tester/reviewer formal responsibilities.

### Symptoms
- Developer declares "ready to merge"
- Developer skips review "because it's simple"
- Developer writes test strategy
- Developer approves own quality

### Detection
| Check | Method |
|-------|--------|
| Authority check | Developer claiming approval authority |
| Process skip | Skipping required review/test steps |
| Responsibility overlap | Doing other roles' formal duties |

### Prevention
- Clear role boundaries in role-scope.md
- Mandatory review/test gates
- Authority separation

### Remediation
1. Acknowledge role boundary
2. Submit for proper review/test
3. Focus on implementation quality
4. Let other roles do their jobs

### Example
```markdown
# Anti-pattern: Role bleeding
Developer says: "This is ready to merge, I tested it thoroughly"

# Good: Role boundary respected
Developer says: "Implementation complete, self-check passed, 
ready for reviewer and tester"
```

---

## Anti-Pattern Summary Matrix

| Anti-Pattern | Detection | Prevention | Severity |
|--------------|-----------|------------|----------|
| AP-001: Implementation Without Design | Design reference check | Require design reference | High |
| AP-002: Silent Design Deviation | Deviation documentation | Mandatory deviation field | High |
| AP-003: Scope Creep | File scope check | Scope control gate | Medium |
| AP-004: Surface Bugfix | Root cause depth | Require 5 Whys | High |
| AP-005: Skipping Self-Check | Report presence | Mandatory self-check | High |
| AP-006: False All-Clear | Spot check verification | Evidence requirement | High |
| AP-007: Role Bleeding | Authority check | Clear boundaries | Medium |

---

## Integration with Validation

These anti-patterns are checked in:
- `validation/failure-mode-checklist.md`
- `validation/downstream-consumability-checklist.md`
- Code review checklists
- Self-check checklists

---

## References

- `specs/004-developer-core/spec.md` - Feature specification
- `specs/004-developer-core/validation/failure-mode-checklist.md` - Failure modes
- `role-definition.md` - Role boundaries
- `quality-gate.md` - Quality gates
