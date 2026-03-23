# Anti-Example: Decision Without Alternatives

## Problem

This anti-example demonstrates **AP-003: Decision Without Alternatives** - presenting conclusions without trade-off analysis.

---

## What NOT to Do

```yaml
# WRONG: No alternatives considered
risks-and-tradeoffs:
  decision_point: "Database selection"
  
  selected_approach: "PostgreSQL"
  
  tradeoff_rationale: "PostgreSQL is the best choice for our needs"
  
  # Missing: alternatives_considered
  # Missing: rejected_approaches
  # Missing: revisit_trigger
```

---

## Why It's Wrong

1. **No evaluation evidence**: Cannot verify alternatives were considered
2. **Arbitrary appearance**: Decision seems subjective
3. **No context for future**: Team cannot understand why this choice was made
4. **Cannot defend decision**: No documented rationale for rejecting alternatives
5. **No revisit criteria**: When should this be reconsidered?

---

## Correct Approach

```yaml
# RIGHT: Explicit alternatives and rationale
risks-and-tradeoffs:
  decision_point: "Database selection for order management"

  alternatives_considered:
    - name: PostgreSQL
      description: "Mature relational database"
      pros:
        - "Strong ACID compliance"
        - "Team expertise"
        - "JSONB for flexibility"
      cons:
        - "Schema migrations require planning"
        
    - name: MongoDB
      description: "Document database"
      pros:
        - "Flexible schema"
        - "Easy scaling"
      cons:
        - "Weaker ACID guarantees"
        - "No team experience"

  selected_approach: "PostgreSQL"

  rejected_approaches:
    - name: "MongoDB"
      reason: "Financial data requires ACID transactions; team lacks experience"

  tradeoff_rationale: |
    Selected PostgreSQL for ACID compliance critical for financial data.
    Team expertise reduces risk. JSONB provides sufficient flexibility.
    
    Sacrificed: MongoDB's easier horizontal scaling.
    Acceptable: Current scale is within PostgreSQL's capabilities.

  risks_introduced:
    - risk: "Schema migration complexity"
      severity: medium
      mitigation: "Use JSONB for evolving fields"

  revisit_trigger: "Re-evaluate when order volume exceeds 10M/year"
```

---

## Detection Checklist

- [ ] Does each key decision have `alternatives_considered`?
- [ ] Are pros/cons listed for each alternative?
- [ ] Is there a `tradeoff_rationale` explaining selection?
- [ ] Are `rejected_approaches` documented?
- [ ] Is there a `revisit_trigger`?

---

## Prevention

1. Always list at least 2 alternatives before deciding
2. Document pros/cons for each alternative
3. Explain why selected approach beats alternatives
4. Set measurable conditions for future re-evaluation