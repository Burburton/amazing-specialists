# Regression Analysis Checklist

## Purpose

Reusable checklist for regression analysis. Use this checklist before, during, and after regression analysis to ensure completeness and BR compliance.

---

## Phase 1: Upstream Consumption (BR-001)

### For Feature Changes

- [ ] **Read implementation-summary.changed_files**
  - [ ] All changed files listed
  - [ ] Change types identified (added/modified/deleted)
  - [ ] Lines changed noted for magnitude assessment

- [ ] **Read implementation-summary.risks**
  - [ ] All risks identified by developer
  - [ ] Risk levels noted (high/medium/low)
  - [ ] High risks prioritized in regression scope

### For Bugfix Scenarios

- [ ] **Read bugfix-report.root_cause**
  - [ ] Root cause category understood
  - [ ] Root cause description analyzed
  - [ ] Contributing factors identified
  - [ ] Root-cause-aware tests will be designed

- [ ] **Read bugfix-report.fix_description**
  - [ ] Fix approach understood
  - [ ] Fix location identified
  - [ ] Fix side-effects considered

---

## Phase 2: Impact Analysis (BR-006)

### Direct Impacts

- [ ] **Changed Components Identified**
  - [ ] All modified functions/methods listed
  - [ ] All modified interfaces/APIs listed
  - [ ] All modified data structures listed

### Indirect Impacts

- [ ] **Callers Analyzed**
  - [ ] Direct callers identified
  - [ ] Indirect callers identified (callers of callers)
  - [ ] Impact on each caller assessed

- [ ] **Data Flow Analyzed**
  - [ ] Data producers affected
  - [ ] Data consumers affected
  - [ ] Data schema changes identified

- [ ] **Dependencies Analyzed**
  - [ ] Upstream dependencies (what this code calls)
  - [ ] Downstream dependencies (what calls this code)
  - [ ] Lateral dependencies (shared state)

### Potential Impacts

- [ ] **Inheritance/Interface Impacts**
  - [ ] Subclasses affected
  - [ ] Interface implementations affected
  - [ ] Event subscribers affected

- [ ] **Configuration Impacts**
  - [ ] Config changes required
  - [ ] Environment variable changes
  - [ ] Database migration required

---

## Phase 3: Risk Assessment (BR-006)

### Risk Factors

- [ ] **Change Complexity Assessed**
  - [ ] Lines changed magnitude noted
  - [ ] Number of files changed noted
  - [ ] Algorithmic complexity changes assessed

- [ ] **Component Criticality Assessed**
  - [ ] Core business logic impact
  - [ ] Security impact
  - [ ] Financial impact
  - [ ] User-facing impact

- [ ] **Historical Risk Assessed**
  - [ ] Historical bugs in this area reviewed
  - [ ] Bug-prone areas identified
  - [ ] Previous similar changes reviewed

### Risk Ranking

- [ ] **Overall Risk Level Assigned** (high/medium/low)
- [ ] **High-Risk Areas Explicitly Listed**
- [ ] **Mitigation Strategies Defined**

---

## Phase 4: Regression Strategy (BR-006)

### Strategy Selection

Choose appropriate strategy:

- [ ] **Smoke Test** (low risk, trivial changes)
  - [ ] System starts
  - [ ] Core path works
  - [ ] No obvious breakage

- [ ] **Targeted Regression** (medium risk, focused changes)
  - [ ] Affected components tested
  - [ ] Adjacent components tested
  - [ ] High-risk areas prioritized

- [ ] **Full Regression** (high risk, major changes)
  - [ ] All components tested
  - [ ] All integration points tested
  - [ ] All end-to-end flows tested

### Test Scope

- [ ] **Components Prioritized** (P0/P1/P2)
- [ ] **Test Types Assigned** (unit/integration/e2e)
- [ ] **Test Cases Listed** with priorities

### Test Categories

- [ ] **Core Functionality Regression**
  - [ ] Main functionality still works
  - [ ] Acceptance criteria still met

- [ ] **Adjacent Impact Regression**
  - [ ] Callers still work
  - [ ] Data consumers still work
  - [ ] UI/API consumers still work

- [ ] **Root-Cause-Aware Regression** (bugfix only)
  - [ ] Original root cause addressed
  - [ ] Contributing factors tested
  - [ ] Recurrence prevented

- [ ] **Historical Issue Regression**
  - [ ] Similar historical bugs considered
  - [ ] Recurring patterns tested

---

## Phase 5: Coverage Boundaries (BR-003)

### Document What Is Tested

- [ ] **Tested Surfaces Listed**
  - [ ] Components tested
  - [ ] Scenarios tested
  - [ ] Integration points tested

### Document What Is NOT Tested

- [ ] **Untested Areas Explicitly Disclosed**
  - [ ] Each untested area listed
  - [ ] Rationale for exclusion documented
  - [ ] Risk level of each gap assessed

- [ ] **Follow-Up Actions Defined**
  - [ ] Backlog items created for deferred testing
  - [ ] Monitoring recommendations made

---

## Phase 6: Validation

### Pre-Analysis Check

- [ ] All upstream artifacts consumed
- [ ] Dependency graph built
- [ ] Impact analysis complete

### Post-Analysis Review

- [ ] Impact analysis covers 3+ layers (direct/indirect/potential)
- [ ] Risk assessment is honest (not minimized)
- [ ] Strategy matches risk level
- [ ] Untested areas disclosed
- [ ] Historical context considered (if bugfix)

---

## Quick Reference

### BR Compliance Summary

| Business Rule | Checklist Item |
|---------------|----------------|
| **BR-001** | Phase 1: Upstream Consumption |
| **BR-006** | Phase 2-4: Impact + Risk + Strategy |
| **BR-003** | Phase 5: Coverage Boundaries |

### Red Flags (Stop and Fix)

- [ ] No indirect impacts identified for non-trivial change
- [ ] No potential impacts considered
- [ ] Strategy is "smoke" for high-risk change
- [ ] No untested areas disclosed (claims 100% coverage)
- [ ] Bugfix scenario without bugfix-report consumption
- [ ] No historical patterns considered
- [ ] Root-cause-aware tests not designed for bugfix

---

## Usage Notes

1. **Before analysis**: Complete Phase 1 (Upstream Consumption)
2. **During analysis**: Use Phase 2-4 as guide
3. **After analysis**: Validate with Phase 5-6
4. **Before sign-off**: Ensure all BR compliance items checked

This checklist ensures regression analysis is thorough, BR-compliant, and honest about gaps.

---

## References

- `specs/005-tester-core/spec.md` Section 6: Business Rules
- `specs/005-tester-core/upstream-consumption.md` - Developer artifact consumption
- `specs/005-tester-core/contracts/regression-risk-report-contract.md` - Output format
