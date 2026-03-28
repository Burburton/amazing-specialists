# Anti-Example 002: False Confidence from Partial Coverage

## What This Anti-Example Looks Like

### ❌ Incorrect Edge Case Reporting (Partial Coverage Presented as Complete)

```yaml
edge_case_matrix:
  input_parameters:
    - name: "payment_amount"
      type: "decimal"
      constraints: "0.00 to 999,999.99"
    
    - name: "discount_percentage"
      type: "decimal"
      constraints: "0 to 100"
  
  boundary_analysis:
    - parameter: "payment_amount"
      boundaries:
        # Only testing "nice" boundaries
        - type: "zero"
          value: 0.00
          description: "Zero payment"
          priority: "P0"
        
        - type: "round_number"
          value: 100.00
          description: "Round number"
          priority: "P0"
        
        # ❌ Missing critical financial boundaries:
        # - Fractional cents (10.005)
        # - Rounding edge cases (10.005, 10.015, 10.025)
        # - Maximum value (999,999.99)
        # - Negative values
        # - Null values
  
  coverage_summary:
    total_boundaries: 2
    p0_boundaries: 2
    claim: "All boundaries tested"  # ❌ FALSE - only 2 of many boundaries
```

## Why This Is Wrong

### BR-005 Violation: Incomplete Boundary Coverage

This analysis tests only **"nice" round numbers** and misses **penny-critical boundaries**:

| Missing Boundary | Financial Impact |
|-----------------|-----------------|
| **Fractional cents (10.005)** | Rounding errors accumulate |
| **Banker's rounding (10.025)** | Systematic penny-off errors |
| **Cumulative rounding** | Large transactions show errors |
| **Maximum value** | Overflow or precision issues |
| **Null amount** | Crash or incorrect handling |

### BR-007 Violation: Honesty Over False Confidence

Claiming "All boundaries tested" when critical financial boundaries are missing is **false confidence**:
- Stakeholders believe financial calculations are verified
- In reality, rounding edge cases are untested
- Penny-off errors will accumulate in production

### BR-003 Violation: Coverage Gap Not Disclosed

Not disclosing untested boundaries violates BR-003:
- No mention of rounding mode boundaries
- No mention of fractional cent handling
- No disclosure that precision testing is incomplete

### Risk of This Anti-Pattern

```
Financial Impact Scenario:

Day 1-30:
- 10,000 transactions processed
- Each with fractional cent amounts
- System rounds 10.005 → 10.00 (truncates)
- Systematic under-charging by 0.005 per transaction

End of Month Reconciliation:
- Expected revenue: $100,000.00
- Actual revenue: $99,950.00
- Discrepancy: $50.00

Root Cause:
- Rounding edge case never tested
- Only "round" numbers were tested (100.00, 50.00)
- Fractional cents (10.005) silently truncated

Impact:
- Financial loss
- Audit failure
- Customer trust loss
- Expensive hotfix and data correction
```

## How to Detect This Anti-Pattern

### Detection Checklist

- [ ] **Rounding Boundaries Check**: For financial calculations, are rounding edge cases tested?
- [ ] **Fractional Precision Check**: Are fractional cents/sub-units tested?
- [ ] **Maximum Value Check**: Is the maximum allowed value tested?
- [ ] **Null/Invalid Check**: Are null and invalid values tested?
- [ ] **Cumulative Effect Check**: Are multi-item cumulative rounding errors tested?
- [ ] **Coverage Gap Disclosure**: Are untested boundaries explicitly disclosed?

### Warning Signs

```text
🚩 Only "round" numbers tested (100.00, 50.00)
🚩 No fractional cent testing (10.005)
🚩 No rounding mode boundaries
🚩 Maximum value not tested
🚩 Claim says "all boundaries tested" but list is short
🚩 No disclosure of coverage gaps
```

## How to Fix This

### Step 1: Test All Financial Boundaries

```yaml
# Complete financial boundary coverage
boundaries_for_payment_amount:
  # Null/Zero
  - null
  - zero (0.00)
  - one_cent (0.01)
  
  # Rounding Edge Cases (CRITICAL)
  - round_down (10.005 → 10.00 or 10.01?)
  - round_up (10.015 → 10.02)
  - bankers_rounding (10.025 → 10.02)
  
  # Range Boundaries
  - min_positive (0.01)
  - max_valid (999,999.99)
  - above_max (1,000,000.00)
  
  # Invalid
  - negative (-10.00)
  
  # Cumulative
  - multiple_items_rounding ([10.005, 10.005, 10.005])
```

### Step 2: Document Rounding Mode Explicitly

```yaml
rounding_configuration:
  mode: "HALF_UP"  # or HALF_EVEN, CEILING, FLOOR, etc.
  precision: 2  # decimal places
  
  test_verification:
    - 10.005 → 10.01 (HALF_UP)
    - 10.015 → 10.02 (HALF_UP)
    - 10.025 → 10.03 (HALF_UP)
  
  disclosure:
    tested: true
    rounding_mode_documented: true
    all_rounding_boundaries_covered: true
```

### Step 3: Disclose Coverage Gaps Honestly

```yaml
coverage_disclosure:
  tested:
    - "All rounding boundaries for single transactions"
    - "Cumulative rounding for up to 100 items"
    - "Maximum value handling"
  
  not_tested:
    - "Currency conversion rounding (future feature)"
    - "Extreme volume (10,000+ items in single transaction)"
  
  confidence_level: "PARTIAL"  # Not FULL because of untested areas
  rationale: "Currency conversion not yet implemented"
```

## Corrected Example

See `example-002-payment-calculation-edges.md` for complete edge case matrix that:
- ✅ Tests all rounding boundaries (10.005, 10.015, 10.025)
- ✅ Documents rounding mode explicitly
- ✅ Tests cumulative rounding errors
- ✅ Tests maximum values
- ✅ Discloses any coverage gaps honestly
- ✅ Claims appropriate confidence level (PARTIAL if gaps exist)

## Lesson

**Partial coverage is acceptable if honestly disclosed.** What's not acceptable is claiming "all boundaries tested" when critical boundaries are missing. For financial calculations, penny-perfect accuracy requires testing every rounding edge case. False confidence leads to financial discrepancies.

---

## References

- `specs/005-tester-core/spec.md` Section 6: BR-005 (Edge Cases Are Mandatory)
- `specs/005-tester-core/spec.md` Section 6: BR-007 (Honesty Over False Confidence)
- `specs/005-tester-core/spec.md` Section 6: BR-003 (Coverage Boundaries)
- `specs/005-tester-core/contracts/verification-report-contract.md` - confidence_level field
