# Interface Contract Validation Checklist

**Skill**: `interface-contract-design`  
**Purpose**: Validate interface contract completeness and quality

---

## Pre-Design Checklist

- [ ] Interface purpose is clearly stated
- [ ] All consumers identified (upstream/downstream/internal/external)
- [ ] Stability expectations understood
- [ ] Performance requirements known
- [ ] Integration context documented

---

## Input Contract Checklist

### Type and Constraints
- [ ] All inputs have explicit types
- [ ] Required vs. optional clearly marked
- [ ] Constraints are explicit (not implied)
- [ ] Constraints are enforceable in code
- [ ] Default values specified where applicable

### Examples
- [ ] Valid input examples provided
- [ ] Invalid input examples provided
- [ ] Examples demonstrate constraint violations
- [ ] Examples are realistic (not trivial)

---

## Output Contract Checklist

### Success Response
- [ ] Success type defined
- [ ] Structure schema provided
- [ ] Success examples included
- [ ] All fields documented

### Error Contract
- [ ] Error code taxonomy complete
- [ ] Each error code has meaning
- [ ] Retry guidance for each error
- [ ] Retryable vs. non-retryable distinction
- [ ] Error response format defined
- [ ] Error examples included

---

## Version Strategy Checklist

- [ ] Versioning scheme defined (semver, calver, etc.)
- [ ] Deprecation policy documented
- [ ] Timeline for deprecation specified
- [ ] Breaking change criteria explicit
- [ ] Breaking change examples listed

---

## Backward Compatibility Checklist

- [ ] Safe changes enumerated
- [ ] Breaking changes enumerated
- [ ] Migration guidance provided
- [ ] Consumer upgrade path clear
- [ ] Deprecation timeline aligned with policy

---

## Integration Tests Checklist

- [ ] Required test scenarios listed
- [ ] Mock expectations documented
- [ ] Compatibility verification defined
- [ ] Consumer-driven contract tests planned

---

## Stability Classification Checklist

| Level | Requirements | Check |
|-------|-------------|-------|
| stable | No breaking changes for 12+ months, comprehensive tests | [ ] |
| evolving | Changes expected, migration guidance available | [ ] |
| experimental | Early stage, expect breaking changes, documented | [ ] |
| deprecated | Sunset date announced, migration path documented | [ ] |

---

## Consumer Alignment Checklist

- [ ] Consumer expectations documented
- [ ] Performance requirements from consumers addressed
- [ ] Error handling requirements from consumers addressed
- [ ] Integration patterns from consumers supported

---

## Anti-Pattern Prevention

- [ ] **NOT** missing error contract
- [ ] **NOT** implicit constraints
- [ ] **NOT** no version strategy
- [ ] **NOT** unstable marked as stable
- [ ] **NOT** missing retry guidance

---

## Post-Design Checklist

- [ ] Contract follows template structure
- [ ] All required sections present
- [ ] Developer can implement from contract
- [ ] Tester can create contract tests
- [ ] Docs can document from contract