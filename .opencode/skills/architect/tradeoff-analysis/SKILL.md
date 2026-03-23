# Skill: tradeoff-analysis

## Purpose

Provide explicit trade-off analysis for key architecture decisions, including alternative evaluations, rationale, and revisit conditions.

Core problems solved:
- Multiple technical approaches with unclear best choice
- Decisions made without systematic evaluation
- Future regret from poorly documented choices
- Team disagreements on technical direction
- Missing context for why a decision was made

## When to Use

**Required when:**
- Multiple viable technical approaches exist
- Major architecture decisions need documented rationale
- Team has conflicting opinions on approach
- Stakeholders need decision justification
- Decision has long-term maintenance implications

**Recommended when:**
- Technology selection (frameworks/libraries/databases)
- Architecture style choices
- Performance vs. maintainability trade-offs
- Short-term speed vs. long-term quality trade-offs
- Building new systems from scratch
- Refactoring critical components

## When Not to Use

**Not applicable when:**
- Only one feasible approach exists
- Decision is already made and irreversible
- Pure personal preference choice
- Time-critical decisions without analysis bandwidth
- Trivial decisions with no long-term impact

## Tradeoff Analysis Framework

### 1. Define Decision Point
- What specific decision needs to be made?
- Why does this decision matter?
- What constraints affect this decision?
- What are the success criteria?

### 2. Identify Alternatives
- List all feasible approaches
- Include "status quo" as an option
- Include hybrid approaches
- Avoid premature elimination

### 3. Define Evaluation Criteria
Common dimensions:
- **Performance**: latency, throughput, resource usage
- **Maintainability**: code complexity, learning curve, documentation
- **Development Velocity**: implementation time, team familiarity
- **Reliability**: stability, fault tolerance, recovery capability
- **Scalability**: horizontal scaling, feature extension
- **Security**: attack surface, security properties
- **Cost**: development cost, operational cost, licensing
- **Risk**: technical risk, team risk, vendor risk

### 4. Evaluate Each Alternative
For each alternative across each dimension:
- Use relative scoring (high/medium/low or 1-5)
- Document scoring rationale
- Identify key differentiators

### 5. Assign Weights
- Different dimensions have different importance
- Align weights with stakeholders
- Document weight rationale

### 6. Synthesize Evaluation
- Calculate weighted scores
- Identify trade-offs (what is sacrificed)
- Verify constraints are satisfied

### 7. Make Decision
- Select the preferred approach
- Document decision rationale
- Define success metrics
- Create fallback plan

## Output Format

The skill produces a `risks-and-tradeoffs` artifact with the following required fields:

```yaml
risks-and-tradeoffs:
  decision_point: string          # The decision being analyzed
  alternatives_considered:        # Other options evaluated
    - name: string
      description: string
      pros: string[]
      cons: string[]
  selected_approach: string       # The chosen approach
  rejected_approaches:            # Approaches not taken and why
    - name: string
      reason: string
  tradeoff_rationale: string      # Reasoning for the selection
  risks_introduced:               # New risks from this decision
    - risk: string
      severity: low|medium|high
      mitigation: string
  revisit_trigger: string         # Conditions that should trigger re-evaluation
```

### Field Descriptions

| Field | Description | Required |
|-------|-------------|----------|
| `decision_point` | Clear statement of what decision is being made | Yes |
| `alternatives_considered` | List of options that were evaluated | Yes |
| `selected_approach` | The approach that was chosen | Yes |
| `rejected_approaches` | Approaches that were not selected with reasons | Yes |
| `tradeoff_rationale` | Explanation of why this choice was made, including what was sacrificed | Yes |
| `risks_introduced` | New risks created by this decision | Yes |
| `revisit_trigger` | Specific conditions under which this decision should be re-evaluated | **CRITICAL** |

## Examples

### Example 1: API Style Selection

```yaml
risks-and-tradeoffs:
  decision_point: "Select API style for mobile and web clients"
  
  alternatives_considered:
    - name: REST
      description: Traditional RESTful API design
      pros:
        - Team familiarity
        - Mature tooling
        - HTTP caching support
      cons:
        - Potential over-fetching
        - Multiple round trips for complex data
      
    - name: GraphQL
      description: Query language with client-specified fields
      pros:
        - Reduced over-fetching
        - Single round trip
        - Strong typing
      cons:
        - Learning curve
        - Complex caching
        - Additional infrastructure
      
    - name: gRPC
      description: Binary protocol for high performance
      pros:
        - Excellent performance
        - Strong typing with Protobuf
        - Streaming support
      cons:
        - Steep learning curve
        - Limited browser support
        - HTTP/2 caching challenges
  
  selected_approach: REST
  
  rejected_approaches:
    - name: GraphQL
      reason: Team learning curve and caching complexity outweigh benefits for current use case
    - name: gRPC
      reason: Browser support limitations and team unfamiliarity make it unsuitable for web-first product
  
  tradeoff_rationale: >
    Selected REST for team velocity and mature caching support. 
    Sacrificed the ability to reduce request count and over-fetching prevention.
    This is acceptable given current traffic patterns and team expertise.
    Can migrate to GraphQL later if over-fetching becomes a bottleneck.
  
  risks_introduced:
    - risk: Multiple API calls per page load
      severity: medium
      mitigation: Implement BFF pattern for mobile clients if needed
    - risk: Over-fetching increases bandwidth usage
      severity: low
      mitigation: Monitor payload sizes and optimize endpoints proactively
  
  revisit_trigger: >
    Re-evaluate when: API calls per page exceed 10, 
    or mobile payload size exceeds 100KB, 
    or team gains GraphQL expertise
```

### Example 2: Caching Layer Decision

```yaml
risks-and-tradeoffs:
  decision_point: "Whether to introduce Redis caching layer"
  
  alternatives_considered:
    - name: No caching
      description: Optimize database queries without adding cache layer
      pros:
        - Simpler architecture
        - No cache invalidation complexity
      cons:
        - Database remains bottleneck
        - Query optimization has limits
      
    - name: Redis caching
      description: Add Redis as distributed cache layer
      pros:
        - Significant latency reduction
        - Reduced database load
        - Mature, battle-tested solution
      cons:
        - Additional operational complexity
        - Cache invalidation challenges
        - New failure mode (cache unavailability)
  
  selected_approach: Redis caching
  
  rejected_approaches:
    - name: No caching
      reason: Database query optimization insufficient to meet latency SLOs
  
  tradeoff_rationale: >
    Selected Redis for significant performance gains. 
    Sacrificed architectural simplicity for performance.
    Operational complexity is acceptable given team's Redis experience.
  
  risks_introduced:
    - risk: Cache invalidation bugs leading to stale data
      severity: medium
      mitigation: Implement TTL-based invalidation with conservative expiry
    - risk: Redis unavailability causing cascade failures
      severity: high
      mitigation: Implement cache-aside pattern with database fallback
  
  revisit_trigger: >
    Re-evaluate when: cache hit ratio drops below 70%,
    or Redis operational overhead exceeds 10% of engineering time,
    or data consistency requirements change
```

### Example 3: Simple Decision

```yaml
risks-and-tradeoffs:
  decision_point: "Use managed database service vs. self-hosted"
  
  alternatives_considered:
    - name: Managed (RDS/Aurora)
      description: Cloud provider managed database service
      pros:
        - Minimal operational overhead
        - Built-in backups and HA
        - Automatic patching
      cons:
        - Higher cost
        - Less control over configuration
      
    - name: Self-hosted on EC2
      description: Self-managed database on compute instances
      pros:
        - Lower cost at scale
        - Full control over configuration
      cons:
        - Operational burden
        - Manual backup management
        - Manual patching and upgrades
  
  selected_approach: Managed (RDS/Aurora)
  
  rejected_approaches:
    - name: Self-hosted on EC2
      reason: Operational burden outweighs cost savings for team size and current scale
  
  tradeoff_rationale: >
    Selected managed service to focus team on product development vs. operations.
    Cost premium is acceptable given reduced operational risk and engineering time savings.
  
  risks_introduced:
    - risk: Vendor lock-in
      severity: medium
      mitigation: Use standard SQL features, avoid provider-specific extensions
    - risk: Cost increases with scale
      severity: low
      mitigation: Monitor costs monthly; re-evaluate at 10x current scale
  
  revisit_trigger: >
    Re-evaluate when: monthly database costs exceed $10K,
    or team grows dedicated DBA role,
    or specific feature requirements cannot be met by managed service
```

## Anti-Examples

### Anti-Example 1: Decision Without Alternatives

**What not to do:**

```yaml
# WRONG: No alternatives considered
risks-and-tradeoffs:
  decision_point: "Database selection"
  selected_approach: PostgreSQL
  tradeoff_rationale: "PostgreSQL is the best choice"
  # Missing: alternatives_considered
  # Missing: rejected_approaches
  # Missing: revisit_trigger
```

**Why this fails:**
- No evidence that other options were evaluated
- "Best" is subjective without comparison criteria
- No way to understand what was sacrificed
- Future team cannot understand the decision context

**Correct approach:**
Include at least 2-3 alternatives with explicit pros/cons and reasons for rejection.

---

### Anti-Example 2: No Revisit Trigger

**What not to do:**

```yaml
# WRONG: Missing revisit trigger
risks-and-tradeoffs:
  decision_point: "Use monolithic architecture"
  alternatives_considered:
    - name: Monolith
      pros: ["Simple deployment", "Easy testing"]
      cons: ["Tight coupling"]
    - name: Microservices
      pros: ["Independent scaling", "Team autonomy"]
      cons: ["Complex deployment", "Network latency"]
  selected_approach: Monolith
  tradeoff_rationale: "Simpler for current team size"
  risks_introduced:
    - risk: Coupling makes changes harder over time
      severity: high
      mitigation: Modular design
  # Missing: revisit_trigger
```

**Why this fails:**
- No indication of when to reconsider the decision
- Decision may persist past its useful life
- Team cannot proactively identify inflection points
- Technical debt accumulates silently

**Correct approach:**
Always include specific, measurable conditions for re-evaluation (team size, traffic volume, cost thresholds, etc.).

---

### Anti-Example 3: Vague Trade-offs

**What not to do:**

```yaml
# WRONG: Vague language without specifics
risks-and-tradeoffs:
  decision_point: "Framework selection"
  alternatives_considered:
    - name: React
      pros: ["Good ecosystem"]
      cons: ["Some issues"]
    - name: Vue
      pros: ["Easy to learn"]
      cons: ["Smaller community"]
  selected_approach: React
  tradeoff_rationale: "Better for our needs"
  risks_introduced:
    - risk: "Some potential problems"
      severity: medium
      mitigation: "Be careful"
  revisit_trigger: "When needed"
```

**Why this fails:**
- "Good ecosystem" is meaningless without specifics
- "Some issues" provides no actionable information
- "Better for our needs" doesn't explain which needs
- "When needed" is not a measurable trigger

**Correct approach:**
Use specific, quantifiable language: "2x larger npm ecosystem", "3-day learning curve vs 1-week", "revisit when monthly active users exceed 100K".

---

### Anti-Example 4: No Risks Documented

**What not to do:**

```yaml
# WRONG: No risks identified
risks-and-tradeoffs:
  decision_point: "Introduce Kubernetes"
  alternatives_considered:
    - name: Kubernetes
      pros: ["Auto-scaling", "Self-healing"]
      cons: ["Complex"]
    - name: Docker Swarm
      pros: ["Simple"]
      cons: ["Limited features"]
  selected_approach: Kubernetes
  tradeoff_rationale: "More powerful"
  # Missing: risks_introduced
  revisit_trigger: "When cluster grows"
```

**Why this fails:**
- Every significant decision introduces new risks
- Missing risks means they won't be mitigated
- Future incidents could have been anticipated
- Stakeholders cannot make informed decisions

**Correct approach:**
Explicitly identify at least 2-3 new risks introduced by the decision, with severity and mitigation strategies.

## Checklists

### Pre-Analysis Checklist
- [ ] Decision point is clearly defined
- [ ] At least 2-3 alternatives identified
- [ ] Evaluation criteria are relevant to the decision
- [ ] Constraints and success criteria are documented

### During Analysis Checklist
- [ ] Each alternative scored against all criteria
- [ ] Scoring rationale is documented
- [ ] Weights reflect actual priorities
- [ ] Trade-offs are explicit (what is gained vs. lost)

### Post-Analysis Checklist
- [ ] Decision rationale is clear and specific
- [ ] Rejected approaches have explicit reasons
- [ ] At least 2-3 risks are identified with mitigations
- [ ] Revisit trigger is specific and measurable
- [ ] Downstream roles can understand the decision context

## Common Failure Modes

| Failure Mode | Symptoms | Mitigation |
|--------------|----------|------------|
| Pre-decision bias | Analysis done after decision made | Involve neutral third party in review |
| Incomplete alternatives | Only one viable option presented | Require minimum 2 alternatives |
| Vague criteria | Criteria like "better" without definition | Use measurable, specific criteria |
| Missing revisit trigger | No conditions for re-evaluation | Require explicit trigger before approval |
| Undocumented risks | Risk section empty or trivial | Independent risk review |
| Over-analysis | Analysis paralysis on trivial decisions | Set time budget for analysis |

## Templates

### Minimal Tradeoff Analysis Template

```yaml
risks-and-tradeoffs:
  decision_point: "[Clear statement of the decision]"
  
  alternatives_considered:
    - name: "[Alternative 1]"
      description: "[Brief description]"
      pros: ["[pro 1]", "[pro 2]"]
      cons: ["[con 1]", "[con 2]"]
    - name: "[Alternative 2]"
      description: "[Brief description]"
      pros: ["[pro 1]", "[pro 2]"]
      cons: ["[con 1]", "[con 2]"]
  
  selected_approach: "[Which alternative was chosen]"
  
  rejected_approaches:
    - name: "[Rejected alternative]"
      reason: "[Specific reason for rejection]"
  
  tradeoff_rationale: >
    [Why this approach was selected, what was sacrificed,
     and why the trade-off is acceptable]
  
  risks_introduced:
    - risk: "[Specific risk]"
      severity: low|medium|high
      mitigation: "[How to reduce or handle this risk]"
    - risk: "[Specific risk]"
      severity: low|medium|high
      mitigation: "[How to reduce or handle this risk]"
  
  revisit_trigger: >
    [Specific, measurable conditions under which
     this decision should be re-evaluated]
```

## Notes

### Decision Record Value
- Enables future review of decision quality
- Helps new team members understand historical context
- Prevents re-litigating settled decisions
- Creates accountability for decision makers

### When to Re-evaluate
- New constraints emerge (budget, timeline, regulations)
- Technology landscape changes significantly
- Original assumptions are proven false
- Decision is not producing expected outcomes
- Team capabilities change (growth or attrition)

### Relationship to Other Architect Skills
- `requirement-to-design`: Transforms requirements into design structure
- `module-boundary-design`: Defines module divisions and dependencies
- `tradeoff-analysis`: Documents decision rationale for key choices

These skills work together: first design the structure, then analyze key decisions within that structure.

### Downstream Consumption
This skill's output is consumed by:
- **developer**: Understands why certain approaches were chosen
- **tester**: Identifies risk areas requiring additional test coverage
- **reviewer**: Validates decision quality and rationale
- **docs**: Documents architecture decisions for external audiences
- **security**: Reviews security implications of technical choices
