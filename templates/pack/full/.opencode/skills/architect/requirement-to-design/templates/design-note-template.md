# Design Note Template

**Artifact Type**: `design-note`  
**Contract**: `specs/003-architect-core/contracts/design-note-contract.md`  
**Producer**: `architect`  
**Consumers**: `developer`, `tester`, `reviewer`, `docs`

---

## background

[Context and motivation for this design. Explain the problem being solved and why this design is needed now. Minimum 2 sentences.]

---

## feature_goal

[What this feature aims to achieve. State what success looks like. Must be testable/verifiable. 3-5 sentences.]

---

## input_sources

```yaml
- source: "specs/[feature-id]/spec.md"
  type: "spec"
  mandatory: true
- source: "package-spec.md"
  type: "governance"
  mandatory: true
- source: "role-definition.md"
  type: "governance"
  mandatory: true
```

---

## requirement_to_design_mapping

| Requirement ID | Requirement Text | Design Decision | Artifact Section |
|----------------|------------------|-----------------|------------------|
| BR-001 | [requirement] | [how design addresses it] | [field/section] |
| BR-002 | [requirement] | [how design addresses it] | [field/section] |
| NFR-001 | [requirement] | [how design addresses it] | [field/section] |

---

## design_summary

[High-level design overview. Mention key architectural decisions. 5-10 sentences. Must be understandable without reading the full spec.]

---

## constraints

| Constraint ID | Description | Source | Impact |
|---------------|-------------|--------|--------|
| C-001 | [what the constraint is] | [source reference] | [design implications] |
| C-002 | [what the constraint is] | [source reference] | [design implications] |

---

## non_goals

| Item | Rationale | Future Consideration |
|------|-----------|---------------------|
| [what is out of scope] | [why excluded] | [yes/no] |
| [what is out of scope] | [why excluded] | [yes/no] |

---

## assumptions

| Assumption ID | Description | Risk if Wrong | Validation Method |
|---------------|-------------|---------------|-------------------|
| A-001 | [what is assumed] | [impact if incorrect] | [how to verify] |
| A-002 | [what is assumed] | [impact if incorrect] | [how to verify] |

---

## open_questions

| Question ID | Question | Why It Matters | Temporary Assumption | Impact Surface | Recommended Next Step | Blocker |
|-------------|----------|----------------|---------------------|----------------|----------------------|---------|
| Q-001 | [unresolved question] | [impact on design] | [working assumption] | [affected areas] | [how to resolve] | [yes/no] |

---

## Status

- [ ] COMPLETE - All fields populated, no blockers
- [ ] PARTIAL - Some fields pending, no blockers
- [ ] BLOCKED - Blocker exists, cannot proceed

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | YYYY-MM-DD | Initial creation |