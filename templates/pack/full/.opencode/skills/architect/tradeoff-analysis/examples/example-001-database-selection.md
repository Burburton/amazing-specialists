# Example: Database Selection Trade-off

## Context

This example demonstrates `tradeoff-analysis` skill for database technology selection.

---

## Decision Point

Choose a database technology for a new feature that requires:
- ACID transactions for financial data
- Flexible schema for evolving requirements
- Good query performance for reporting

---

## Output

```yaml
risks-and-tradeoffs:
  decision_point: "Select database technology for order management system"

  alternatives_considered:
    - name: PostgreSQL
      description: "Mature relational database with ACID guarantees"
      pros:
        - "Strong ACID compliance for financial data"
        - "Mature ecosystem with excellent tooling"
        - "JSONB support for flexible schema"
        - "Team has existing expertise"
      cons:
        - "Schema migrations require planning"
        - "Horizontal scaling is complex"
        
    - name: MongoDB
      description: "Document database with flexible schema"
      pros:
        - "Flexible schema for rapid iteration"
        - "Easy horizontal scaling"
        - "Good for hierarchical data"
      cons:
        - "No multi-document ACID transactions (pre-4.0)"
        - "Weaker consistency guarantees"
        - "Team lacks experience"
        
    - name: CockroachDB
      description: "Distributed SQL database with PostgreSQL compatibility"
      pros:
        - "ACID transactions with horizontal scaling"
        - "PostgreSQL compatible"
        - "Cloud-native architecture"
      cons:
        - "Newer technology, smaller ecosystem"
        - "Higher operational complexity"
        - "Licensing costs at scale"

  selected_approach: "PostgreSQL"

  rejected_approaches:
    - name: "MongoDB"
      reason: "Financial data requires ACID transactions; team lacks experience"
    - name: "CockroachDB"
      reason: "Operational complexity not justified at current scale; team expertise in PostgreSQL"

  tradeoff_rationale: |
    Selected PostgreSQL for its strong ACID guarantees which are critical for 
    financial transaction integrity. The team's existing expertise reduces risk 
    and accelerates development. JSONB provides sufficient schema flexibility 
    for the anticipated evolution.
    
    Sacrificed: Horizontal scaling simplicity that MongoDB/CockroachDB would provide.
    Acceptable because: Current scale (projected 1M orders/year) is well within 
    PostgreSQL's capabilities.

  risks_introduced:
    - risk: "Schema migrations may slow iteration"
      severity: medium
      mitigation: "Use JSONB for rapidly evolving fields; plan migrations carefully"
    - risk: "Scaling may require significant effort at 10x growth"
      severity: low
      mitigation: "Design with future sharding in mind; monitor growth metrics"

  revisit_trigger: |
    Re-evaluate when:
    - Order volume exceeds 10M/year
    - Team grows dedicated DBA role
    - Multi-region deployment required
    - Schema flexibility becomes a persistent blocker
```

---

## Key Elements Demonstrated

1. **Multiple Alternatives**: 3 distinct options evaluated
2. **Specific Pros/Cons**: Concrete reasons, not vague statements
3. **Clear Rejection Rationale**: Why each alternative was not chosen
4. **Trade-off Explicit**: What was sacrificed and why acceptable
5. **Measurable Trigger**: Specific conditions for re-evaluation