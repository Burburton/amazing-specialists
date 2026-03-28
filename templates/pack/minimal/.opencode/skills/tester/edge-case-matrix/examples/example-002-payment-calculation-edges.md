# Example 002: Payment Calculation Edge Cases

## Scenario Context

**Feature Being Tested:**
Payment calculation service with:
- Base amount
- Discount (percentage or fixed)
- Tax calculation
- Rounding rules
- Minimum/maximum payment limits

## BR-005 Compliance: Financial Edge Cases Mandatory

Payment calculations require **penny-perfect accuracy**. Edge cases are not optional.

---

## Input Parameter Analysis

### Base Amount

```yaml
parameter: "base_amount"
type: "decimal"
constraints: "0.00 to 999,999.99, 2 decimal places"

boundaries:
  # Zero and Null (P0)
  - id: "BA-001"
    type: "null"
    value: null
    description: "Null base amount"
    priority: "P0"
    expected_behavior: "ValidationError: amount is required"
    risk: "Null may cause calculation errors"
  
  - id: "BA-002"
    type: "zero"
    value: 0.00
    description: "Zero amount (free item)"
    priority: "P0"
    expected_behavior: "Accept, total = 0"
    risk: "Zero handling may break calculations"
  
  - id: "BA-003"
    type: "negative"
    value: -10.00
    description: "Negative amount"
    priority: "P0"
    expected_behavior: "ValidationError: amount cannot be negative"
    risk: "Negative amounts could result in refunds"
  
  # Decimal Precision (P0)
  - id: "BA-004"
    type: "one_cent"
    value: 0.01
    description: "One cent (minimum positive)"
    priority: "P0"
    expected_behavior: "Accept"
    risk: "Minimum positive amount"
  
  - id: "BA-005"
    type: "fractional_cent"
    value: 10.005
    description: "Fractional cent (3 decimals)"
    priority: "P0"
    expected_behavior: "Round to 10.01 or reject"
    risk: "Rounding errors propagate"
  
  - id: "BA-006"
    type: "max_valid"
    value: 999999.99
    description: "Maximum allowed amount"
    priority: "P0"
    expected_behavior: "Accept"
    risk: "Large number handling"
  
  - id: "BA-007"
    type: "above_max"
    value: 1000000.00
    description: "Above maximum"
    priority: "P0"
    expected_behavior: "ValidationError: exceeds maximum"
    risk: "May overflow storage"
```

### Discount Percentage

```yaml
parameter: "discount_percentage"
type: "decimal"
constraints: "0 to 100, 2 decimal places"

boundaries:
  # Range Boundaries (P0)
  - id: "DP-001"
    type: "null"
    value: null
    description: "Null discount (no discount)"
    priority: "P0"
    expected_behavior: "Treat as 0%"
  
  - id: "DP-002"
    type: "zero"
    value: 0.00
    description: "Zero percent discount"
    priority: "P0"
    expected_behavior: "No discount applied"
  
  - id: "DP-003"
    type: "negative"
    value: -10.00
    description: "Negative discount (surcharge?)"
    priority: "P0"
    expected_behavior: "ValidationError or treat as 0%"
    risk: "Negative discount could increase total"
  
  - id: "DP-004"
    type: "min_positive"
    value: 0.01
    description: "0.01% discount"
    priority: "P0"
    expected_behavior: "Accept, minimal discount"
  
  - id: "DP-005"
    type: "max_valid"
    value: 100.00
    description: "100% discount (free)"
    priority: "P0"
    expected_behavior: "Accept, total = 0"
    risk: "100% discount edge case"
  
  - id: "DP-006"
    type: "above_max"
    value: 101.00
    description: "Above 100% (negative total?)"
    priority: "P0"
    expected_behavior: "ValidationError: cannot exceed 100%"
    risk: "Could result in negative total"
  
  # Rounding Impact (P1)
  - id: "DP-007"
    type: "repeating_decimal"
    value: 33.33
    description: "1/3 discount (repeating)"
    priority: "P1"
    expected_behavior: "Calculate and round correctly"
    risk: "Repeating decimals cause rounding issues"
```

### Tax Rate

```yaml
parameter: "tax_rate"
type: "decimal"
constraints: "0 to 50 (some regions have high tax)"

boundaries:
  - id: "TR-001"
    type: "null"
    value: null
    description: "Null tax rate"
    priority: "P0"
    expected_behavior: "Use default rate or 0"
  
  - id: "TR-002"
    type: "zero"
    value: 0.00
    description: "Zero tax (tax-exempt)"
    priority: "P0"
    expected_behavior: "No tax applied"
  
  - id: "TR-003"
    type: "standard_rate"
    value: 10.00
    description: "Standard 10% tax"
    priority: "P0"
    expected_behavior: "Calculate tax correctly"
  
  - id: "TR-004"
    type: "high_rate"
    value: 25.00
    description: "High tax rate (25%)"
    priority: "P1"
    expected_behavior: "Calculate tax correctly"
  
  - id: "TR-005"
    type: "max_rate"
    value: 50.00
    description: "Maximum tax rate (50%)"
    priority: "P1"
    expected_behavior: "Calculate tax correctly"
  
  - id: "TR-006"
    type: "negative"
    value: -5.00
    description: "Negative tax (subsidy?)"
    priority: "P0"
    expected_behavior: "ValidationError or treat as 0%"
```

### Discount Stacking Scenarios

```yaml
scenario: "Multiple discounts"

boundaries:
  - id: "DS-001"
    type: "single_discount"
    value: { base: 100, discount1: 10% }
    description: "Single 10% discount"
    priority: "P0"
    expected_behavior: "100 - 10 = 90, then tax"
  
  - id: "DS-002"
    type: "stacked_discounts"
    value: { base: 100, discount1: 10%, discount2: 5% }
    description: "Stacked discounts (10% + 5%)"
    priority: "P0"
    expected_behavior: "100 - 10 - 5 = 85 (additive) or 100 * 0.9 * 0.95 = 85.50 (multiplicative)"
    risk: "Calculation method must be documented"
  
  - id: "DS-003"
    type: "exceeds_100_percent"
    value: { base: 100, discount1: 60%, discount2: 50% }
    description: "Stacked discounts exceed 100%"
    priority: "P0"
    expected_behavior: "Cap at 100% (total = 0) or error"
    risk: "Could result in negative total"
  
  - id: "DS-004"
    type: "fixed_plus_percent"
    value: { base: 100, fixed_discount: 20, percent_discount: 10% }
    description: "Fixed + percentage discount"
    priority: "P0"
    expected_behavior: "Order matters: (100-20)*0.9 = 72 or (100*0.9)-20 = 70"
    risk: "Calculation order affects result"
```

### Rounding Scenarios

```yaml
scenario: "Rounding at each step"

boundaries:
  - id: "RO-001"
    type: "round_down"
    value: { amount: 10.005, round_to: 2 }
    description: "Round down (10.005 → 10.00 or 10.01?)"
    priority: "P0"
    expected_behavior: "Depends on rounding mode (HALF_UP, HALF_EVEN, etc.)"
    risk: "Different rounding modes give different results"
  
  - id: "RO-002"
    type: "round_up"
    value: { amount: 10.015, round_to: 2 }
    description: "Round up (10.015 → 10.02)"
    priority: "P0"
    expected_behavior: "HALF_UP: 10.02"
  
  - id: "RO-003"
    type: "bankers_rounding"
    value: { amount: 10.025, round_to: 2 }
    description: "Banker's rounding (10.025 → 10.02)"
    priority: "P1"
    expected_behavior: "HALF_EVEN: 10.02 (round to even)"
    risk: "Banker's rounding differs from commercial rounding"
  
  - id: "RO-004"
    type: "cumulative_rounding_error"
    value: { items: [10.005, 10.005, 10.005] }
    description: "Cumulative rounding (3 items at 10.005)"
    priority: "P0"
    expected_behavior: "Round each: 30.00 or round total: 30.02?"
    risk: "Penny-off errors accumulate"
```

### Tax Calculation Order

```yaml
scenario: "Tax on discounted amount vs original"

boundaries:
  - id: "TO-001"
    type: "tax_after_discount"
    value: { base: 100, discount: 10%, tax: 10% }
    description: "Tax calculated on discounted amount"
    priority: "P0"
    expected_behavior: "(100 - 10) * 1.10 = 99.00"
    risk: "Most common method"
  
  - id: "TO-002"
    type: "tax_before_discount"
    value: { base: 100, discount: 10%, tax: 10% }
    description: "Tax calculated on original, then discount"
    priority: "P0"
    expected_behavior: "(100 * 1.10) - 10 = 100.00"
    risk: "Less common, but used in some jurisdictions"
  
  - id: "TO-003"
    type: "tax_not_discounted"
    value: { base: 100, discount: 10%, tax: 10%, tax_on_discount: false }
    description: "Tax only on non-discounted portion"
    priority: "P1"
    expected_behavior: "Varies by tax law"
    risk: "Jurisdiction-specific"
```

## Combination Matrix (Critical Scenarios)

```yaml
combination_scenarios:
  - id: "COMBO-001"
    name: "Simple purchase"
    parameters:
      base_amount: 100.00
      discount: 0%
      tax: 10%
    priority: "P0"
    expected: "100 * 1.10 = 110.00"
  
  - id: "COMBO-002"
    name: "Discounted purchase"
    parameters:
      base_amount: 100.00
      discount: 10%
      tax: 10%
    priority: "P0"
    expected: "(100 - 10) * 1.10 = 99.00"
  
  - id: "COMBO-003"
    name: "100% discount (free)"
    parameters:
      base_amount: 100.00
      discount: 100%
      tax: 10%
    priority: "P0"
    expected: "0.00 (no tax on free items)"
  
  - id: "COMBO-004"
    name: "Zero base amount"
    parameters:
      base_amount: 0.00
      discount: 0%
      tax: 10%
    priority: "P0"
    expected: "0.00"
  
  - id: "COMBO-005"
    name: "Rounding edge case"
    parameters:
      base_amount: 10.005
      discount: 0%
      tax: 10%
    priority: "P0"
    expected: "10.01 * 1.10 = 11.01 (rounded)"
  
  - id: "COMBO-006"
    name: "Maximum amount"
    parameters:
      base_amount: 999999.99
      discount: 50%
      tax: 25%
    priority: "P0"
    expected: "(999999.99 * 0.5) * 1.25 = 624999.99"
    risk: "Large number precision"
  
  - id: "COMBO-007"
    name: "Stacked discounts cap"
    parameters:
      base_amount: 100.00
      discount1: 60%
      discount2: 50%
      tax: 10%
    priority: "P0"
    expected: "Total discount capped at 100%, total = 0.00"
```

## Coverage Summary

```yaml
coverage_summary:
  total_boundaries: 42
  by_priority:
    P0: 35  # Must test (penny-perfect critical)
    P1: 7   # Should test
  
  by_parameter:
    base_amount: 7
    discount_percentage: 7
    tax_rate: 6
    discount_stacking: 4
    rounding: 4
    tax_order: 3
    combinations: 7
  
  by_category:
    null_zero: 10
    range_boundaries: 15
    rounding: 8
    stacking_interaction: 4
    calculation_order: 5
  
  br_compliance:
    br_003_coverage_boundaries: "All 42 boundaries documented"
    br_005_edge_cases_mandatory: "35 P0 boundaries for financial accuracy"
    br_004_failure_classification_ready: "Expected behaviors specified"
```

## High-Risk Areas (Financial Impact)

```yaml
high_risk_boundaries:
  - boundary: "Rounding at each step"
    reason: "Penny-off errors accumulate across transactions"
    financial_impact: "Could result in systematic over/under-charging"
    mitigation: "Test all rounding scenarios, document rounding mode"
  
  - boundary: "Tax calculation order"
    reason: "Different orders give different results"
    financial_impact: "Legal compliance issue, varies by jurisdiction"
    mitigation: "Document and test per jurisdiction rules"
  
  - boundary: "Stacked discounts exceeding 100%"
    reason: "Could result in negative total (customer gets paid)"
    financial_impact: "Critical business logic error"
    mitigation: "Cap at 100%, test explicitly"
  
  - boundary: "Fractional cent handling"
    reason: "May silently truncate or round"
    financial_impact: "Accumulates to significant amounts"
    mitigation: "Test fractional inputs explicitly"
```

## Lesson for Financial Edge Cases

**Penny-perfect accuracy is mandatory.** Financial calculations require:
1. Explicit rounding mode documentation
2. Testing all boundary amounts
3. Verifying calculation order
4. Capping discounts to prevent negative totals
5. Jurisdiction-specific tax handling

Missing any of these edge cases can result in:
- Systematic over/under-charging
- Legal compliance violations
- Customer trust loss
- Financial reconciliation nightmares
