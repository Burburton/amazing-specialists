# Upstream Consumability Checklist

## Purpose
Verify that developer correctly consumes architect outputs.

---

## design-note Consumption

### Reading Checks
- [ ] Read `feature_goal` section
- [ ] Read `design_summary` section
- [ ] Read `requirement_to_design_mapping` section
- [ ] Read `constraints` section
- [ ] Read `non_goals` section
- [ ] Read `assumptions` section
- [ ] Read `open_questions` section

### Understanding Checks
- [ ] Can explain what feature should do
- [ ] Can identify key design decisions
- [ ] Can list all constraints
- [ ] Can identify non-goals (what NOT to implement)
- [ ] Can identify open questions needing resolution

### Traceability Checks
- [ ] Can trace design decisions to requirements
- [ ] Can explain why design approach was chosen
- [ ] Can identify design dependencies

---

## module-boundaries Consumption

### Structure Checks
- [ ] Read `module_list` section
- [ ] Read `module_responsibilities` section
- [ ] Read `inputs_outputs` section
- [ ] Read `dependency_directions` section
- [ ] Read `integration_seams` section

### Boundary Checks
- [ ] Can identify which module to place new code in
- [ ] Can identify module boundaries not to cross
- [ ] Can identify integration seams to implement
- [ ] Can identify dependencies to respect

### Implementation Checks
- [ ] Code organized by module structure
- [ ] Module responsibilities respected
- [ ] No unauthorized module boundary crossings
- [ ] Integration seams implemented correctly

---

## Constraint Identification

### Technical Constraints
- [ ] All technical constraints listed
- [ ] Each constraint understood
- [ ] Constraints validated as feasible

### Performance Constraints
- [ ] Performance constraints identified
- [ ] Performance constraints considered in implementation

### Security Constraints
- [ ] Security constraints identified
- [ ] Security constraints addressed in implementation

### Dependency Constraints
- [ ] Dependency constraints identified
- [ ] New dependencies justified if added

---

## open-questions Handling

### Resolution Checks
- [ ] All open questions reviewed
- [ ] Blocking questions resolved before implementation
- [ ] Non-blocking questions handled with temporary assumptions
- [ ] Questions escalated if cannot resolve

### Documentation Checks
- [ ] Resolutions documented
- [ ] Temporary assumptions marked for revisit
- [ ] Escalated questions tracked

---

## Design Conflict Detection

### Conflict Identification
- [ ] Compared design with current codebase
- [ ] Identified any design-reality gaps
- [ ] Documented potential conflicts

### Conflict Resolution
- [ ] Minor conflicts resolved with documentation
- [ ] Major conflicts escalated to architect
- [ ] All resolutions documented in deviations_from_design

---

## Checklist Summary

| Category | Checks | Required |
|----------|--------|----------|
| design-note Consumption | 14 | All required |
| module-boundaries Consumption | 12 | All required |
| Constraint Identification | 12 | All required |
| open-questions Handling | 8 | All required |
| Design Conflict Detection | 6 | All required |
| **Total** | **52** | **All required** |

---

## References
- `specs/003-architect-core/downstream-interfaces.md` - Architect outputs
- `specs/004-developer-core/role-scope.md` - Developer role scope
- `specs/004-developer-core/contracts/implementation-summary-contract.md` - Implementation contract