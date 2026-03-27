# Integration Test Design Validation Checklist

## Purpose

Reusable checklist for integration test design. Use this checklist before, during, and after integration test design to ensure completeness and BR compliance.

---

## Phase 1: Integration Scope Analysis (BR-001)

### Before Designing Tests

- [ ] **Analyze implementation-summary.changed_files**
  - [ ] Identified all modules involved in integration
  - [ ] Traced data flow between modules
  - [ ] Identified integration points (API calls, DB operations, message passing)

- [ ] **Review architecture documentation**
  - [ ] Understood module boundaries
  - [ ] Identified contracts between modules
  - [ ] Noted any integration constraints

- [ ] **Identify integration risks**
  - [ ] High-risk integration points from implementation-summary.risks
  - [ ] Distributed transaction risks
  - [ ] External dependency risks
  - [ ] Concurrency risks

---

## Phase 2: Mock vs Real Strategy (BR-002, BR-003)

### Dependency Classification

For each dependency, document:

- [ ] **Internal Services**
  - [ ] Listed all internal services involved
  - [ ] Each marked as real (should NOT be mocked)
  - [ ] Reason documented for using real instances

- [ ] **Database**
  - [ ] Database strategy chosen (real/fake)
  - [ ] Fake strategy documented (in-memory, test container)
  - [ ] Schema setup documented

- [ ] **External APIs**
  - [ ] Listed all external dependencies
  - [ ] Each marked as mock (correct strategy)
  - [ ] Mock behavior documented (success/error/timeout scenarios)

- [ ] **Infrastructure (Logger, Config)**
  - [ ] Strategy chosen (mock or fake)
  - [ ] Not blocking integration verification

### BR-003 Compliance (Explicit Scope)

- [ ] Integration scope documented:
  - [ ] What modules are tested
  - [ ] What integration points are verified
  - [ ] What is NOT tested (exclusions)

---

## Phase 3: Test Design (BR-002, BR-005)

### Test Category Distribution

- [ ] **Happy Path Tests** (1-2 tests)
  - [ ] Complete integration flow tested
  - [ ] Data flow through all modules verified
  - [ ] Contracts respected

- [ ] **Error Path Tests** (2-3 tests)
  - [ ] External service errors handled
  - [ ] Database errors handled
  - [ ] Error propagation correct

- [ ] **Boundary Tests** (1-2 tests)
  - [ ] Timeout scenarios (high risk)
  - [ ] Concurrency scenarios
  - [ ] Resource exhaustion

### Integration Flow Verification

Each test case must include:

- [ ] **Integration flow steps documented**
  - [ ] Each step identifies which module
  - [ ] Expected output at each step
  - [ ] Data transformation verified

- [ ] **Assertions beyond mock values**
  - [ ] Database queries verify persisted data
  - [ ] Service state changes verified
  - [ ] Contract compliance verified

---

## Phase 4: Test Data Strategy (BR-005)

### Test Data Preparation

- [ ] **Fixtures**
  - [ ] Required fixtures identified
  - [ ] Fixture files created/available
  - [ ] Fixture data reflects real scenarios

- [ ] **Factories**
  - [ ] Required factories identified
  - [ ] Factory methods available
  - [ ] Factory generates valid test data

- [ ] **Data Reset Strategy**
  - [ ] How data is reset between tests
  - [ ] Reset documented in cleanup
  - [ ] Reset verified to work

---

## Phase 5: Environment Setup (BR-004)

### Environment Isolation

- [ ] **Isolation Level**
  - [ ] Chosen isolation strategy:
    - [ ] Database per test
    - [ ] Shared with reset
    - [ ] Transaction rollback
  - [ ] Isolation strategy documented

- [ ] **Services Setup**
  - [ ] All required services listed
  - [ ] Setup sequence documented
  - [ ] Setup timeout defined

- [ ] **Cleanup Strategy**
  - [ ] Cleanup sequence documented
  - [ ] Cleanup verified to work
  - [ ] No state leakage between tests

### BR-004 Compliance (Environment Isolation)

- [ ] Tests can run in isolation
- [ ] No shared state between tests
- [ ] No dependency on production data
- [ ] Cleanup executed after each test

---

## Phase 6: Validation

### Pre-Execution Check

- [ ] All test files created
- [ ] Environment setup script ready
- [ ] Test fixtures loaded
- [ ] Mock configurations correct
- [ ] Cleanup script ready

### Post-Design Review

- [ ] **Mock vs Real Balance**
  - [ ] Less than 50% dependencies mocked (excluding external)
  - [ ] Internal services are real
  - [ ] Database is real/fake (not mocked)

- [ ] **Integration Coverage**
  - [ ] All critical integration points tested
  - [ ] High-risk scenarios covered
  - [ ] Error propagation tested

- [ ] **Anti-Patterns Avoided**
  - [ ] Not over-mocked (see anti-example-001)
  - [ ] Not missing cleanup
  - [ ] Not using production data

---

## Quick Reference

### BR Compliance Summary

| Business Rule | Checklist Item |
|---------------|----------------|
| **BR-001** | Phase 1: Integration Scope Analysis |
| **BR-002** | Phase 2: Mock vs Real Strategy |
| **BR-003** | Phase 2: Explicit Scope |
| **BR-004** | Phase 5: Environment Isolation |
| **BR-005** | Phase 4: Test Data Strategy |

### Red Flags (Stop and Fix)

- [ ] More than 50% dependencies mocked
- [ ] Internal services are mocked
- [ ] Database is mocked (not real/fake)
- [ ] No integration flow steps documented
- [ ] Assertions only check mock return values
- [ ] No cleanup strategy
- [ ] Tests depend on shared state

---

## Usage Notes

1. **Before integration test design**: Complete Phase 1 (Integration Scope Analysis)
2. **During integration test design**: Use Phase 2-4 as guide
3. **After integration test design**: Validate with Phase 5-6
4. **Before test execution**: Run Phase 6 validation

This checklist ensures integration test design is complete, BR-compliant, and tests actual integration (not over-mocked unit tests).

---

## References

- `specs/005-tester-core/spec.md` Section 6: Business Rules
- `.opencode/skills/tester/integration-test-design/SKILL.md` - Main skill definition
- `.opencode/skills/tester/integration-test-design/anti-examples/anti-example-001-over-mocking-integration-tests.md` - Over-mocking anti-pattern