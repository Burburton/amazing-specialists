# Requirement Mapping Checklist

**Skill**: `requirement-to-design`  
**Purpose**: Validate that all requirements are properly mapped to design decisions

---

## Pre-Conditions

- [ ] `spec.md` has been fully read
- [ ] All business rules (BR-*) identified
- [ ] All non-functional requirements (NFR-*) identified
- [ ] Constraints extracted from spec

---

## Requirement Extraction

- [ ] All functional requirements listed
- [ ] All non-functional requirements listed
- [ ] All constraints identified
- [ ] All dependencies noted
- [ ] Non-goals explicitly stated in spec

---

## Design Transformation

- [ ] Each requirement maps to at least one design decision
- [ ] Design decisions are specific, not vague restatements
- [ ] Design decisions include rationale
- [ ] Design decisions are actionable for developer

---

## Mapping Completeness

- [ ] BR-001 (Design Must Be Consumable) mapped
- [ ] BR-002 (Design Must Map Requirements) mapped
- [ ] BR-003 (Boundaries Must Be Clear) mapped
- [ ] BR-004 (Uncertainties Must Be Explicit) mapped
- [ ] BR-005 (Skill System Must Be Extensible) mapped (if applicable)
- [ ] BR-006 (Use 6-Role Formal Semantics) mapped

---

## Non-Goal Verification

- [ ] Non-goals are explicit
- [ ] Non-goals prevent scope creep
- [ ] Non-goals align with spec "Out of Scope" section
- [ ] Non-goals have rationale for exclusion

---

## Assumption Validation

- [ ] All assumptions explicitly marked as "ASSUMPTION"
- [ ] Each assumption has risk assessment
- [ ] High-risk assumptions flagged
- [ ] Validation method documented for each assumption

---

## Open Questions Review

- [ ] All unresolved items documented as open questions
- [ ] Each open question has temporary assumption
- [ ] Blocking questions marked as blockers
- [ ] Recommended next steps are actionable

---

## Anti-Pattern Check

- [ ] **NOT** spec parroting (design adds structure beyond spec)
- [ ] **NOT** silent assumptions (all assumptions explicit)
- [ ] **NOT** missing non-goals
- [ ] **NOT** implementation jump (design layer present)

---

## Post-Conditions

- [ ] `design-note` artifact follows AC-001 contract
- [ ] Developer can identify implementation tasks
- [ ] Reviewer can evaluate design rationale
- [ ] Tester can derive test cases from goals