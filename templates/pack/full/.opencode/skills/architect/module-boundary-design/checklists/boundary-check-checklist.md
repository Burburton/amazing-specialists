# Boundary Check Checklist

**Skill**: `module-boundary-design`  
**Purpose**: Validate module boundaries are clear and well-defined

---

## Pre-Conditions

- [ ] `design-note` exists and is complete
- [ ] Current codebase structure understood
- [ ] Constraints identified

---

## Module Division

- [ ] Each module has single responsibility
- [ ] Modules are neither too large nor too small
- [ ] Module names are descriptive
- [ ] Module count is appropriate (not over/under divided)

---

## Responsibility Clarity

- [ ] Each module has explicit responsibility statement
- [ ] Responsibilities do NOT overlap between modules
- [ ] Non-responsibilities are explicit
- [ ] Each responsibility has exactly one owner module

---

## Dependency Validation

- [ ] All dependencies listed
- [ ] Dependency directions are explicit
- [ ] No circular dependencies exist
- [ ] Dependency graph is acyclic

---

## Integration Seams

- [ ] All integration seams identified
- [ ] Integration types specified (api/event/data/protocol)
- [ ] Seam stability marked (stable/evolving)
- [ ] Contract at each seam is defined

---

## Extension Boundary

- [ ] Future extension points identified
- [ ] Extension mechanism specified
- [ ] What must remain stable is documented
- [ ] Extension guidelines provided

---

## Anti-Pattern Check

- [ ] **NOT** folder-driven architecture (responsibilities defined, not just directories)
- [ ] **NOT** overlapping responsibilities
- [ ] **NOT** missing dependency directions
- [ ] **NOT** missing integration seams
- [ ] **NOT** no future boundary

---

## Downstream Consumability

- [ ] Developer can identify which module to implement
- [ ] Tester can identify test boundaries
- [ ] Reviewer can verify boundary compliance
- [ ] Security can identify trust boundaries

---

## Post-Conditions

- [ ] `module-boundaries` artifact follows AC-002 contract
- [ ] All 7 required fields present
- [ ] Module boundaries are testable