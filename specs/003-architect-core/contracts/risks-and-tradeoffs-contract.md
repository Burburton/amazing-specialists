# AC-003: risks-and-tradeoffs Artifact Contract

## Document Status
- **Contract ID**: `AC-003`
- **Artifact Name**: `risks-and-tradeoffs`
- **Version**: 1.0.0
- **Created**: 2026-03-23
- **Owner**: architect role
- **Status**: Active

---

## 1. Purpose Statement

The `risks-and-tradeoffs` artifact documents design decision trade-offs, risks, and revisit conditions for key architectural decisions. It serves as the authoritative record of:

- **What decisions were made** and why
- **What alternatives were considered** and rejected
- **What risks were introduced** by the chosen approach
- **When to reconsider** the decision in the future

This artifact exists to:
1. Make design rationale explicit and traceable
2. Prevent future architects from re-litigating settled decisions without cause
3. Enable reviewers to assess decision quality
4. Help security identify risk areas requiring mitigation
5. Guide docs on which decisions need explanation

---

## 2. Required Fields

The artifact **MUST** contain all 7 required fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `decision_point` | string | YES | The decision being analyzed |
| `alternatives_considered` | array | YES | Other options evaluated |
| `selected_approach` | string | YES | The chosen approach |
| `rejected_approaches` | array | YES | Approaches not taken and why |
| `tradeoff_rationale` | string | YES | Reasoning for the selection |
| `risks_introduced` | array | YES | New risks from this decision |
| `revisit_trigger` | array | YES | Conditions that should trigger re-evaluation |

---

## 3. Field Specifications

### 3.1 decision_point

**Type**: `string`

**Description**: A clear, concise statement of the specific design decision being analyzed.

**Validation Rules**:
- Must be a complete sentence or clear noun phrase
- Must identify a single decision (not multiple bundled decisions)
- Must be specific enough to distinguish from other decisions
- Must not contain the solution (e.g., use "Database selection" not "Why we chose PostgreSQL")

**Examples**:
- ✅ "Database technology selection for persistent storage"
- ✅ "Authentication mechanism for API endpoints"
- ✅ "State management approach for client-side application"
- ❌ "PostgreSQL vs MySQL" (contains solution bias)
- ❌ "Infrastructure decisions" (too vague)

---

### 3.2 alternatives_considered

**Type**: `array of objects`

**Description**: List of alternative approaches that were evaluated before making the decision.

**Object Structure**:
```markdown
- **name**: Short identifier for the alternative
- **description**: Brief explanation of the approach
- **pros**: Array of advantages
- **cons**: Array of disadvantages
```

**Validation Rules**:
- Must contain at least 2 alternatives (unless only one viable option exists, with explanation)
- Each alternative must have distinct characteristics
- Pros and cons must be specific, not vague (e.g., "better performance" must specify what kind and by how much if known)
- Must include at least one fundamentally different approach, not just variations

**Examples**:
```markdown
- **PostgreSQL**: Relational database with ACID compliance
  - Pros: Strong consistency, mature ecosystem, advanced query capabilities
  - Cons: Higher resource usage, more complex scaling
- **MongoDB**: Document-oriented NoSQL database
  - Pros: Flexible schema, horizontal scaling, JSON-native
  - Cons: Eventually consistent by default, less mature transaction support
- **Redis**: In-memory key-value store
  - Pros: Extremely fast, simple data model
  - Cons: Data persistence challenges, limited query capabilities
```

---

### 3.3 selected_approach

**Type**: `string`

**Description**: The approach that was chosen, stated clearly and unambiguously.

**Validation Rules**:
- Must match one of the `alternatives_considered` by name or be a clearly defined synthesis
- Must be stated positively (what WAS chosen), not just what was rejected
- Must be specific enough to guide implementation
- If a hybrid approach, must explain how components combine

**Examples**:
- ✅ "PostgreSQL 15.x with connection pooling via PgBouncer"
- ✅ "JWT-based stateless authentication with 15-minute token expiry"
- ❌ "A database solution" (too vague)
- ❌ "Not MongoDB" (states what was rejected, not what was chosen)

---

### 3.4 rejected_approaches

**Type**: `array of objects`

**Description**: Detailed explanation of why each rejected alternative was not selected.

**Object Structure**:
```markdown
- **approach**: Name of the rejected approach
- **rejection_reason**: Primary reason for rejection
- **showstoppers**: Array of critical issues (if any)
- **tradeoff_cost**: What is sacrificed by not choosing this approach
```

**Validation Rules**:
- Must address every alternative listed in `alternatives_considered` except `selected_approach`
- Rejection reasons must be specific and technical, not opinion-based
- Must acknowledge what is lost (tradeoff_cost) to show balanced analysis
- "Showstoppers" must be reserved for truly blocking issues, not minor concerns

**Examples**:
```markdown
- **MongoDB**:
  - Rejection reason: Eventual consistency model conflicts with financial transaction requirements
  - Showstoppers: Cannot guarantee ACID properties for multi-document transactions under load
  - Tradeoff cost: Lose flexible schema evolution and horizontal scaling simplicity

- **Redis**:
  - Rejection reason: In-memory nature creates data persistence risks for core business data
  - Showstoppers: None for caching layer, but disqualifies for primary storage
  - Tradeoff cost: Lose sub-millisecond response times for simple lookups
```

---

### 3.5 tradeoff_rationale

**Type**: `string` (may be multi-paragraph)

**Description**: Comprehensive explanation of the reasoning behind the selection, including what was prioritized and what was deprioritized.

**Validation Rules**:
- Must explain the decision criteria used (e.g., "prioritized consistency over availability")
- Must acknowledge what is being sacrificed, not just benefits gained
- Must reference relevant constraints (time, budget, team skills, operational capacity)
- Must be honest about uncertainties or gambles being taken
- Minimum 3 sentences; complex decisions require more

**Examples**:
```markdown
We selected PostgreSQL because our primary design drivers are **data integrity** and **query flexibility**. 
The financial nature of our core transactions requires strong consistency guarantees that only ACID-compliant 
relational databases can provide. While we sacrifice horizontal scaling simplicity compared to NoSQL 
alternatives, our projected data volume (< 100GB/year) and query patterns (complex joins, aggregations) 
align well with PostgreSQL's strengths. This decision assumes our team can maintain operational expertise 
for PostgreSQL administration and that read-replica scaling will suffice for read-heavy workloads.
```

---

### 3.6 risks_introduced

**Type**: `array of objects`

**Description**: New risks that are created or amplified by this decision.

**Object Structure**:
```markdown
- **risk**: Description of the risk
- **severity**: Low | Medium | High | Critical
- **likelihood**: Unlikely | Possible | Likely | Almost Certain
- **impact**: What happens if this risk materializes
- **mitigation_strategy**: How the risk will be addressed
- **mitigation_owner**: Which role owns mitigation (developer/tester/security/ops)
```

**Validation Rules**:
- Must include at least 1 risk (a decision with zero risks is likely not analyzed deeply enough)
- Severity and likelihood must be assessed honestly, not downplayed
- Mitigation strategies must be actionable, not vague
- High/Critical risks must have explicit mitigation owners

**Examples**:
```markdown
- **Operational complexity risk**:
  - Severity: Medium
  - Likelihood: Likely
  - Impact: Increased on-call burden, slower incident recovery
  - Mitigation strategy: Create runbooks, establish monitoring dashboards, train team on PostgreSQL troubleshooting
  - Mitigation owner: ops (primary), security (for audit logging)

- **Single database bottleneck risk**:
  - Severity: High
  - Likelihood: Possible
  - Impact: System-wide performance degradation under load
  - Mitigation strategy: Implement connection pooling, design for read-replica scaling, establish performance baselines
  - Mitigation owner: developer (primary), architect (oversight)
```

---

### 3.7 revisit_trigger

**Type**: `array of strings`

**Description**: Specific conditions or events that should trigger re-evaluation of this decision.

**Validation Rules**:
- Must be measurable or observable conditions, not vague timelines
- Must include both quantitative thresholds (e.g., "when X exceeds Y") and qualitative triggers (e.g., "when team grows beyond Z")
- Should include at least one time-based review reminder (e.g., "revisit in 6 months")
- Must be actionable—someone should be able to recognize when a trigger fires

**Examples**:
```markdown
- User count exceeds 100,000 daily active users
- Database query latency p95 exceeds 200ms for core operations
- Data volume exceeds 500GB in primary tables
- Team grows beyond 10 engineers (requiring more specialized DB expertise)
- PostgreSQL announces major version with breaking changes
- 6-month review checkpoint (scheduled for 2026-09-23)
- Business requirements shift to require multi-region active-active deployment
```

---

## 4. Consumer Responsibilities

### 4.1 reviewer

**Consumes for**: Assessing decision quality and rationale soundness

**Responsibilities**:
- [ ] Verify that alternatives were genuinely considered, not strawmen
- [ ] Check that rejection reasons are technical, not political or arbitrary
- [ ] Ensure tradeoff_rationale acknowledges costs, not just benefits
- [ ] Validate that risks_introduced includes meaningful risks with mitigation plans
- [ ] Confirm revisit_trigger conditions are specific and measurable
- [ ] Flag any hidden assumptions or unexamined constraints

**Quality Questions**:
- "Would a reasonable person disagree with this decision given the same constraints?"
- "Are the risks honestly assessed, or downplayed to justify the decision?"

---

### 4.2 security

**Consumes for**: Identifying security-relevant risks and trust boundary implications

**Responsibilities**:
- [ ] Extract all security-relevant risks from `risks_introduced`
- [ ] Verify security considerations are included in `alternatives_considered` analysis
- [ ] Assess whether `mitigation_strategy` for security risks is adequate
- [ ] Identify any trust boundary changes introduced by this decision
- [ ] Escalate High/Critical security risks that lack mitigation owners

**Quality Questions**:
- "What new attack surfaces does this decision create?"
- "Are security risks owned by someone with security expertise?"

---

### 4.3 docs

**Consumes for**: Understanding which decisions need external documentation

**Responsibilities**:
- [ ] Identify decisions that users/developers need to understand
- [ ] Extract `selected_approach` and `tradeoff_rationale` for architecture documentation
- [ ] Note `risks_introduced` that users should be aware of (e.g., limitations, caveats)
- [ ] Use `revisit_trigger` to schedule documentation review dates

**Quality Questions**:
- "Which of these decisions will users ask about?"
- "What limitations should be documented in user-facing docs?"

---

### 4.4 future architect work

**Consumes for**: Understanding design history and knowing when to re-evaluate

**Responsibilities**:
- [ ] Read `tradeoff_rationale` before proposing changes to this decision area
- [ ] Monitor `revisit_trigger` conditions during system evolution
- [ ] Update this artifact if triggers fire and decision is re-evaluated
- [ ] Preserve institutional memory by maintaining this document through refactors

**Quality Questions**:
- "Do I understand why this decision was made before trying to change it?"
- "Have any revisit triggers fired that I should address?"

---

## 5. Producer Responsibilities (architect)

The **architect** role is responsible for producing this artifact with the following obligations:

### 5.1 Before Writing

- [ ] Identify all significant design decisions requiring tradeoff analysis
- [ ] Research at least 2 viable alternatives for each decision
- [ ] Gather input constraints (time, budget, skills, operational capacity)
- [ ] Consult with relevant stakeholders (security, ops, downstream roles) if decision affects them

### 5.2 During Writing

- [ ] Use specific, technical language—avoid vague terms like "better" or "simpler"
- [ ] Be honest about what is being sacrificed, not just gained
- [ ] Include meaningful risks—if you can't identify risks, you haven't analyzed deeply enough
- [ ] Make revisit triggers measurable so future teams know when to act

### 5.3 After Writing

- [ ] Have reviewer assess decision quality
- [ ] Have security validate risk assessments for security-relevant decisions
- [ ] Ensure artifact is stored in the feature's `contracts/` directory
- [ ] Reference this artifact in related `design-note` and `module-boundaries` artifacts

### 5.4 Anti-Patterns to Avoid

| Anti-Pattern | Description | Prevention |
|--------------|-------------|------------|
| **Single-option syndrome** | Only one alternative listed | Require at least 2 alternatives; if truly only one, explain why |
| **Strawman alternatives** | Weak alternatives to make selected look better | Include at least one genuinely competitive alternative |
| **Benefit-only rationale** | Only lists benefits, ignores costs | Require explicit "what we sacrifice" section |
| **Risk minimization** | Downplaying or omitting risks | Mandate at least 1 risk; have security review |
| **Vague triggers** | "When needed" or "In the future" | Require measurable thresholds and dates |
| **Decision bundling** | Multiple decisions in one artifact | One decision_point per artifact |

---

## 6. Example Minimal Valid Artifact

```markdown
# Decision: Authentication Mechanism for API

## decision_point
Authentication mechanism selection for REST API endpoints

## alternatives_considered

- **JWT (JSON Web Tokens)**
  - Pros: Stateless, scalable, widely supported, self-contained
  - Cons: Token revocation complexity, larger payload size, security concerns if not implemented correctly

- **Session-based authentication**
  - Pros: Easy revocation, server-side control, smaller client payload
  - Cons: Server state required, horizontal scaling complexity, session store dependency

- **API Keys**
  - Pros: Simple implementation, easy to understand, good for service-to-service
  - Cons: No user context, difficult to rotate, less granular permissions

## selected_approach
JWT with 15-minute access token expiry and refresh token rotation

## rejected_approaches

- **Session-based authentication**:
  - Rejection reason: Conflicts with stateless architecture goal and adds operational complexity
  - Showstoppers: Would require Redis session store, adding new infrastructure dependency
  - Tradeoff cost: Lose instant revocation capability and fine-grained server-side control

- **API Keys**:
  - Rejection reason: Insufficient for user-facing authentication needs
  - Showstoppers: Cannot support user-specific permissions or audit trails
  - Tradeoff cost: Lose simplicity for service-to-service authentication (will use API keys for that separately)

## tradeoff_rationale
We selected JWT because it aligns with our stateless API architecture and horizontal scaling requirements. The 15-minute expiry window limits exposure from token compromise while refresh token rotation maintains user experience. While we sacrifice instant revocation capability (a token remains valid until expiry), this is acceptable given our threat model and the ability to blacklist compromised refresh tokens. This decision assumes our team can implement JWT security best practices (proper signing algorithms, secure storage, HTTPS enforcement).

## risks_introduced

- **Token compromise risk**:
  - Severity: High
  - Likelihood: Possible
  - Impact: Attacker can impersonate user until token expires
  - Mitigation strategy: Short expiry (15min), refresh token rotation, HTTPS enforcement, token binding
  - Mitigation owner: security (primary), developer (implementation)

- **Implementation complexity risk**:
  - Severity: Medium
  - Likelihood: Likely
  - Impact: Security vulnerabilities if JWT is implemented incorrectly
  - Mitigation strategy: Use established libraries (node-jwt, PyJWT), security review, penetration testing
  - Mitigation owner: developer (primary), security (review)

- **Token size overhead risk**:
  - Severity: Low
  - Likelihood: Almost Certain
  - Impact: Increased bandwidth usage, especially for mobile clients
  - Mitigation strategy: Minimize claims, use compression for large tokens, monitor bandwidth metrics
  - Mitigation owner: developer

## revisit_trigger

- Security incident involving JWT token compromise
- Team grows beyond 5 engineers (requiring more formal auth infrastructure)
- Business requirements add support for OAuth2 social login providers
- Performance metrics show token payload size impacting mobile client latency (>5% overhead)
- 6-month review checkpoint (scheduled for 2026-09-23)
```

---

## 7. Quality Checklist

### Pre-Submission Checklist (Producer)

- [ ] **Decision clarity**: `decision_point` clearly states what decision was made
- [ ] **Alternative depth**: At least 2 genuine alternatives considered with pros/cons
- [ ] **Selection specificity**: `selected_approach` is specific and actionable
- [ ] **Rejection honesty**: `rejected_approaches` explains why, not just what
- [ ] **Rationale completeness**: `tradeoff_rationale` acknowledges costs and constraints
- [ ] **Risk honesty**: At least 1 meaningful risk identified with mitigation
- [ ] **Trigger measurability**: `revisit_trigger` conditions are specific and observable
- [ ] **No hidden assumptions**: All assumptions are explicit in rationale or risks
- [ ] **Consumer-ready**: Each consumer role can extract what they need

### Validation Checklist (Reviewer)

- [ ] **Alternatives are real**: Not strawmen designed to make selected approach look better
- [ ] **Rationale is sound**: Decision follows logically from constraints and criteria
- [ ] **Risks are honest**: Not downplayed or omitted to justify decision
- [ ] **Mitigations are actionable**: Someone can actually implement them
- [ ] **Triggers are measurable**: Future team will know when to revisit
- [ ] **Scope is appropriate**: Decision is significant enough to warrant this analysis

### Downstream Consumability Checklist

| Consumer | Can they...? |
|----------|--------------|
| **reviewer** | Judge decision quality from rationale alone? |
| **security** | Identify all security-relevant risks and mitigations? |
| **docs** | Extract user-facing explanations and caveats? |
| **future architect** | Understand reasoning before proposing changes? |
| **developer** | Know what constraints to respect during implementation? |

---

## 8. Storage and Versioning

### Location
- Primary: `specs/<feature>/contracts/risks-and-tradeoffs/<decision-name>.md`
- Cross-reference: Link from `design-note.md` and `module-boundaries.md`

### Versioning
- Version number in document header (starts at 1.0.0)
- Increment minor version (1.1.0) for updates that add information
- Increment major version (2.0.0) for decision reversals or fundamental changes
- Maintain changelog section for significant revisions

### Changelog Template
```markdown
## Changelog

| Version | Date | Author | Change Type | Description |
|---------|------|--------|-------------|-------------|
| 1.0.0 | 2026-03-23 | architect | Initial | Initial decision record |
```

---

## 9. Relationship to Other Artifacts

### Inputs (consumes from)
- `design-note` - Provides design context and constraints
- `module-boundaries` - May identify decisions requiring tradeoff analysis

### Outputs (consumed by)
- `design-note` - References tradeoff decisions affecting design
- Downstream roles (reviewer, security, docs) - As specified in Section 4

### Sibling Artifacts
- `open-questions` - Unresolved questions may become decisions requiring tradeoff analysis once resolved

---

## 10. References

- Spec reference: `specs/003-architect-core/spec.md` - AC-003 definition
- Skill reference: `.opencode/skills/architect/tradeoff-analysis/SKILL.md`
- Related contract: `specs/003-architect-core/contracts/design-note-contract.md`
- Related contract: `specs/003-architect-core/contracts/module-boundaries-contract.md`
- Related contract: `specs/003-architect-core/contracts/open-questions-contract.md`

---

## Appendix A: Decision Significance Threshold

Not every decision requires a `risks-and-tradeoffs` artifact. Use this artifact when:

**DO create artifact for**:
- Decisions affecting multiple modules or teams
- Technology selections (databases, frameworks, protocols)
- Security-relevant choices
- Performance-critical design choices
- Decisions that are difficult or expensive to reverse
- Decisions with significant operational impact

**DO NOT create artifact for**:
- Naming conventions (variable names, function names)
- Trivial implementation details
- Decisions fully constrained by upstream requirements
- Decisions reversible with minimal cost (< 1 hour of work)

**Rule of thumb**: If downstream roles (developer, tester, security) need to understand *why* you chose this approach, create the artifact.
