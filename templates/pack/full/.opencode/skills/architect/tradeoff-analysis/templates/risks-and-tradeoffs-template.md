# Risks and Tradeoffs Template

**Artifact Type**: `risks-and-tradeoffs`  
**Contract**: `specs/003-architect-core/contracts/risks-and-tradeoffs-contract.md`  
**Producer**: `architect`  
**Consumers**: `reviewer`, `security`, `docs`, `future architect`

---

## decision_point

[Clear statement of the decision being analyzed. What specific choice needs to be made?]

---

## alternatives_considered

### Alternative 1: [Name]

**Description**: [Brief description of this approach]

**Pros**:
- [Advantage 1]
- [Advantage 2]

**Cons**:
- [Disadvantage 1]
- [Disadvantage 2]

---

### Alternative 2: [Name]

**Description**: [Brief description of this approach]

**Pros**:
- [Advantage 1]
- [Advantage 2]

**Cons**:
- [Disadvantage 1]
- [Disadvantage 2]

---

### Alternative 3: [Name]

**Description**: [Brief description of this approach]

**Pros**:
- [Advantage 1]

**Cons**:
- [Disadvantage 1]

---

## selected_approach

[Name of the chosen approach]

**Rationale**:
[Why this approach was selected. Include what criteria led to this choice.]

---

## rejected_approaches

| Alternative | Reason for Rejection |
|-------------|---------------------|
| [Alternative 2] | [Specific reason why not chosen] |
| [Alternative 3] | [Specific reason why not chosen] |

---

## tradeoff_rationale

[Explain the trade-offs made. What was sacrificed? Why is this acceptable? What was gained?]

---

## risks_introduced

| Risk | Severity | Mitigation |
|------|----------|------------|
| [Risk 1] | low/medium/high | [How to mitigate] |
| [Risk 2] | low/medium/high | [How to mitigate] |

---

## revisit_trigger

[Specific, measurable conditions under which this decision should be re-evaluated]

**Examples of good triggers**:
- When user count exceeds X
- When response time exceeds Y ms
- When maintenance cost exceeds Z hours/week
- When team size changes by factor N

---

## Success Metrics

| Metric | Current | Target | Revisit Threshold |
|--------|---------|--------|-------------------|
| [metric] | [value] | [goal] | [trigger value] |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | YYYY-MM-DD | Initial creation |