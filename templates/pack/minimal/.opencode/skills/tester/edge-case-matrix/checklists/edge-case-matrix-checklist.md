# Edge Case Matrix Checklist

## Purpose

Reusable checklist for edge case analysis. Use this checklist before, during, and after edge case matrix generation to ensure completeness and BR compliance.

---

## Phase 1: Parameter Identification (BR-001)

### Identify All Input Parameters

- [ ] **String Parameters Listed**
  - [ ] Username fields
  - [ ] Email fields
  - [ ] Password fields
  - [ ] Description/text fields
  - [ ] Code/identifier fields

- [ ] **Numeric Parameters Listed**
  - [ ] Integer fields (age, quantity)
  - [ ] Decimal fields (amounts, percentages)
  - [ ] Date/time fields

- [ ] **Boolean Parameters Listed**
  - [ ] Toggle switches
  - [ ] Agreement checkboxes
  - [ ] Feature flags

- [ ] **Collection Parameters Listed**
  - [ ] Arrays/lists
  - [ ] Maps/dictionaries
  - [ ] Sets

- [ ] **Complex Objects Listed**
  - [ ] Nested objects
  - [ ] Polymorphic types

---

## Phase 2: Boundary Analysis by Type

### String Boundaries (for each string parameter)

- [ ] **Null/Empty Boundaries**
  - [ ] null
  - [ ] empty string ("")
  - [ ] whitespace only ("   ")
  - [ ] leading/trailing spaces

- [ ] **Length Boundaries**
  - [ ] too short (min - 1)
  - [ ] minimum valid length
  - [ ] maximum valid length
  - [ ] too long (max + 1)
  - [ ] extremely long (10x max)

- [ ] **Character Set Boundaries**
  - [ ] alphanumeric only
  - [ ] special characters (!@#$%)
  - [ ] SQL injection attempt
  - [ ] XSS attempt (<script>)
  - [ ] Unicode characters (中文)
  - [ ] Emoji (😎)
  - [ ] Null bytes (\0)

### Numeric Boundaries (for each numeric parameter)

- [ ] **Null/Type Boundaries**
  - [ ] null
  - [ ] wrong type (string for number)

- [ ] **Range Boundaries**
  - [ ] below minimum
  - [ ] minimum valid
  - [ ] maximum valid
  - [ ] above maximum
  - [ ] zero (if applicable)
  - [ ] negative (if applicable)

- [ ] **Precision Boundaries** (for decimals)
  - [ ] fractional sub-units (0.005 for currency)
  - [ ] rounding edge cases (10.005, 10.015, 10.025)
  - [ ] repeating decimals (0.333...)
  - [ ] extremely large numbers

### Boolean Boundaries (for each boolean parameter)

- [ ] **Value Boundaries**
  - [ ] null
  - [ ] true
  - [ ] false
  - [ ] wrong type (string "true" vs boolean true)

### Collection Boundaries (for each collection parameter)

- [ ] **Size Boundaries**
  - [ ] null
  - [ ] empty collection
  - [ ] single element
  - [ ] multiple elements
  - [ ] at capacity
  - [ ] over capacity

- [ ] **Content Boundaries**
  - [ ] all null elements
  - [ ] mixed null/non-null
  - [ ] duplicate elements
  - [ ] self-referential elements

---

## Phase 3: State and Environment Boundaries

### State Boundaries

- [ ] **Object State**
  - [ ] Initialized vs uninitialized
  - [ ] Locked vs unlocked
  - [ ] Active vs inactive
  - [ ] Expired vs valid

- [ ] **Time Boundaries**
  - [ ] Start of day/end of day
  - [ ] Start of month/end of month
  - [ ] Leap year dates
  - [ ] Timezone boundaries
  - [ ] DST transitions

### Environment Boundaries

- [ ] **Resource Boundaries**
  - [ ] Low memory
  - [ ] Disk full
  - [ ] Connection limit
  - [ ] Rate limit exceeded

- [ ] **Network Boundaries**
  - [ ] No network
  - [ ] Slow network
  - [ ] Timeout
  - [ ] Intermittent connection

---

## Phase 4: Combination Matrix

### High-Priority Combinations

- [ ] **All Valid Minimum**
  - [ ] All parameters at minimum valid values

- [ ] **All Valid Maximum**
  - [ ] All parameters at maximum valid values

- [ ] **All Invalid**
  - [ ] All parameters invalid simultaneously

- [ ] **Security-Critical Combinations**
  - [ ] SQL injection in one field + valid in others
  - [ ] XSS attempt + valid data
  - [ ] Boundary value + injection attempt

### Interaction Boundaries

- [ ] **Parameter Interactions**
  - [ ] Dependent parameters (if A, then B required)
  - [ ] Mutually exclusive parameters
  - [ ] Order-dependent parameters

---

## Phase 5: Priority Assignment (BR-005)

### P0 Boundaries (Must Test)

- [ ] Null/empty for all required fields
- [ ] Min/max range boundaries
- [ ] Security boundaries (injection, XSS)
- [ ] Financial rounding boundaries
- [ ] Authentication/authorization boundaries

### P1 Boundaries (Should Test)

- [ ] Unicode/emoji handling
- [ ] Extreme values (10x max)
- [ ] Unusual but valid combinations
- [ ] Performance-related boundaries

### P2 Boundaries (Nice to Test)

- [ ] Aesthetic edge cases
- [ ] Extremely unlikely scenarios
- [ ] Theoretical boundaries

---

## Phase 6: Coverage Documentation (BR-003)

### Document Tested Boundaries

- [ ] **In-Scope Boundaries Listed**
  - [ ] All P0 boundaries tested
  - [ ] P1 boundaries coverage noted
  - [ ] Test case mapping complete

### Document Untested Boundaries

- [ ] **Out-of-Scope Boundaries Listed**
  - [ ] Each excluded boundary listed
  - [ ] Rationale for exclusion documented
  - [ ] Risk level of each gap assessed

### Coverage Gap Disclosure

- [ ] **Honest Gap Reporting**
  - [ ] Coverage gaps explicitly disclosed
  - [ ] Gap risk assessment included
  - [ ] Follow-up actions defined

---

## Phase 7: Integration with Other Skills

### With unit-test-design

- [ ] Edge case matrix completed FIRST
- [ ] P0 boundaries mapped to test cases
- [ ] Test design references edge case IDs

### With regression-analysis

- [ ] Historical boundary-related bugs considered
- [ ] Boundary regression tests identified

### With verification-report

- [ ] edge_cases_checked field populated
- [ ] Boundary test results documented
- [ ] Coverage gaps disclosed

---

## Phase 8: Validation

### Pre-Analysis Check

- [ ] All input parameters identified
- [ ] Parameter types confirmed
- [ ] Constraints documented

### Post-Analysis Review

- [ ] Each parameter has 5+ boundaries analyzed
- [ ] Security boundaries included for user inputs
- [ ] P0 boundaries identified
- [ ] Coverage gaps disclosed
- [ ] Combination scenarios considered

---

## Quick Reference

### BR Compliance Summary

| Business Rule | Checklist Item |
|---------------|----------------|
| **BR-001** | Phase 1: Consume parameter definitions |
| **BR-005** | Phase 2-5: Comprehensive boundary analysis |
| **BR-003** | Phase 6: Coverage documentation |
| **BR-007** | Phase 6: Honest gap disclosure |

### Red Flags (Stop and Fix)

- [ ] Fewer than 5 boundaries per string parameter
- [ ] No null/empty boundaries
- [ ] No security boundaries (injection, XSS)
- [ ] No min/max boundaries for numeric ranges
- [ ] No coverage gap disclosure
- [ ] Claim "all boundaries tested" without comprehensive list
- [ ] No combination scenarios

---

## Usage Notes

1. **Before test design**: Complete Phases 1-5 (boundary analysis)
2. **During test design**: Use Phase 7 (integration)
3. **After analysis**: Validate with Phase 8
4. **Before verification**: Complete Phase 6 (coverage documentation)

This checklist ensures edge case analysis is thorough, BR-compliant, and honest about gaps.

---

## References

- `specs/005-tester-core/spec.md` Section 6: Business Rules
- `.opencode/skills/tester/edge-case-matrix/SKILL.md` - Edge case categories
- `specs/005-tester-core/contracts/verification-report-contract.md` - edge_cases_checked field
