# Test Design Checklist

## Purpose

Reusable checklist for unit test design. Use this checklist before, during, and after test design to ensure completeness and BR compliance.

---

## Phase 1: Upstream Consumption (BR-001)

### Before Designing Tests

- [ ] **Read implementation-summary.goal_alignment**
  - [ ] Understood the goal being verified
  - [ ] Noted any deviations from original design
  - [ ] Derived acceptance criteria from goal

- [ ] **Map changed_files to test surface**
  - [ ] All added files have corresponding tests
  - [ ] All modified files have regression tests
  - [ ] Test files created in correct locations

- [ ] **Acknowledge known_issues**
  - [ ] All known_issues listed and understood
  - [ ] Known issues NOT treated as false positives
  - [ ] Workarounds verified where applicable

- [ ] **Prioritize risks**
  - [ ] High-risk areas identified from implementation-summary.risks
  - [ ] High-risk areas assigned dedicated test cases
  - [ ] Risk-based testing strategy defined

- [ ] **Read self-check-report**
  - [ ] Self-check items reviewed (as hints, not evidence)
  - [ ] At least 3 items identified for spot-checking
  - [ ] Self-check distinguished from independent verification

---

## Phase 2: Test Design (BR-002, BR-005)

### Test Category Distribution

- [ ] **Happy Path Tests** (40-50%)
  - [ ] Main functionality covered
  - [ ] Expected behavior verified

- [ ] **Error Path Tests** (30-40%)
  - [ ] All error conditions have tests
  - [ ] Invalid inputs are rejected
  - [ ] Error messages are correct

- [ ] **Boundary Tests** (15-20%)
  - [ ] Minimum values tested
  - [ ] Maximum values tested
  - [ ] Empty/null inputs tested
  - [ ] Edge case matrix integrated

- [ ] **Security Tests** (5-10%)
  - [ ] Injection attempts covered
  - [ ] Permission boundaries tested
  - [ ] Secret handling verified

### BR-002 Compliance (Independent Verification)

- [ ] Each test case has explicit `br_002_independent_verification` section
- [ ] Self-check claims are acknowledged but not used as evidence
- [ ] Evidence type specified for each test
- [ ] Test report language uses "Tester verified" not "Developer confirmed"

### BR-005 Compliance (Edge Cases Mandatory)

- [ ] Edge-case-matrix skill was invoked before test design
- [ ] All P0 boundaries from edge-case-matrix have tests
- [ ] Happy-path-only anti-pattern avoided
- [ ] Boundary conditions explicitly documented

---

## Phase 3: Test Structure

### Test Case Format

Each test case must include:

- [ ] **Test ID** (unique identifier)
- [ ] **Test Name** (descriptive, behavior-focused)
- [ ] **Category** (happy_path / error_path / boundary / security)
- [ ] **Scenario** (Given-When-Then format)
- [ ] **Input** (concrete test data)
- [ ] **Expected Output** (including errors if applicable)
- [ ] **Mocks** (dependencies to mock, return values)
- [ ] **Assertions** (specific conditions to verify)

### Mock Strategy

- [ ] External dependencies mocked (DB, API, file system)
- [ ] Only direct dependencies mocked
- [ ] Mock return values specified
- [ ] Mock expectations defined (call count, call order)

---

## Phase 4: Coverage Boundaries (BR-003)

### Document What Is Tested

- [ ] In-scope items listed
- [ ] Test targets clearly identified
- [ ] Acceptance criteria mapped to tests

### Document What Is NOT Tested

- [ ] Out-of-scope items listed
- [ ] Exclusions justified
- [ ] Coverage gaps disclosed
- [ ] Gap rationale documented

---

## Phase 5: Failure Classification Ready (BR-004)

### Prepare for Failure Analysis

- [ ] Each test case can classify failures into:
  - [ ] Implementation issue
  - [ ] Test issue
  - [ ] Environment issue
  - [ ] Design/spec issue
  - [ ] Dependency/upstream issue

- [ ] Error messages are specific enough for classification
- [ ] Test failures will point to root cause

---

## Phase 6: Validation

### Pre-Execution Check

- [ ] All test files created
- [ ] All mocks configured
- [ ] Test environment ready
- [ ] Dependencies installed

### Post-Design Review

- [ ] Test count sufficient (minimum 5 for non-trivial function)
- [ ] Category distribution balanced
- [ ] High-risk areas covered
- [ ] Edge cases included
- [ ] Self-check confusion avoided

---

## Quick Reference

### BR Compliance Summary

| Business Rule | Checklist Item |
|---------------|----------------|
| **BR-001** | Phase 1: Upstream Consumption |
| **BR-002** | Phase 2: Independent Verification section |
| **BR-003** | Phase 4: Coverage Boundaries |
| **BR-004** | Phase 5: Failure Classification Ready |
| **BR-005** | Phase 2: Edge Cases Mandatory |

### Red Flags (Stop and Fix)

- [ ] Fewer than 5 test cases for complex logic
- [ ] All tests are happy path
- [ ] No error path tests
- [ ] No boundary tests
- [ ] Report says "developer verified"
- [ ] No coverage gaps disclosed

---

## Usage Notes

1. **Before test design**: Complete Phase 1 (Upstream Consumption)
2. **During test design**: Use Phase 2 (Test Design) as guide
3. **After test design**: Validate with Phase 3-6
4. **Before test execution**: Run Phase 6 validation

This checklist ensures test design is complete, BR-compliant, and ready for execution.

---

## References

- `specs/005-tester-core/spec.md` Section 6: Business Rules
- `specs/005-tester-core/upstream-consumption.md` - Developer artifact consumption
- `.opencode/skills/tester/edge-case-matrix/SKILL.md` - Edge case identification
