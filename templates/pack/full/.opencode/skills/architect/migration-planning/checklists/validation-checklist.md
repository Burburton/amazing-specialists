# Migration Plan Validation Checklist

**Skill**: `migration-planning`  
**Purpose**: Validate migration plan completeness and safety

---

## Pre-Planning Checklist

- [ ] Current state documented
- [ ] Target state documented
- [ ] Data volume estimated
- [ ] Dependencies identified
- [ ] Risks identified
- [ ] Downtime requirements understood

---

## Strategy Analysis Checklist

- [ ] All strategies evaluated (big_bang, progressive, parallel_run)
- [ ] Pros and cons documented for each
- [ ] Selection rationale clear
- [ ] Strategy matches risk level
- [ ] Strategy matches downtime requirements

---

## Phase Design Checklist

### Structure
- [ ] Each phase has unique ID
- [ ] Phase names are descriptive
- [ ] Phase descriptions clear
- [ ] Prerequisites between phases explicit
- [ ] Duration estimates realistic (include buffer)

### Actions
- [ ] Actions are specific (not vague)
- [ ] Actions are executable
- [ ] Actions are ordered correctly
- [ ] Destructive actions identified

### Validation
- [ ] Validation criteria for each phase
- [ ] Validation is measurable
- [ ] Validation covers key risks

### Rollback
- [ ] Rollback actions for each phase
- [ ] Rollback is executable
- [ ] Rollback restores previous state
- [ ] Rollback tested in staging

---

## Rollback Plan Checklist

### Triggers
- [ ] Trigger conditions defined
- [ ] Triggers are measurable
- [ ] Triggers cover key failure modes
- [ ] Decision threshold explicit

### Procedure
- [ ] Rollback procedure step-by-step
- [ ] Steps are ordered correctly
- [ ] Multiple phase rollback handled
- [ ] Responsibility assigned

### Data Recovery
- [ ] Data recovery method specified
- [ ] Backup location documented
- [ ] Restore procedure documented
- [ ] Restore time estimated

---

## Validation Plan Checklist

### Pre-Migration
- [ ] Backup verification included
- [ ] Test environment validation included
- [ ] Application code testing included
- [ ] Monitoring setup included

### During Migration
- [ ] Progress monitoring defined
- [ ] Error rate monitoring defined
- [ ] Performance monitoring defined
- [ ] Alert thresholds defined

### Post-Migration
- [ ] Functional validation included
- [ ] Data integrity validation included
- [ ] Performance validation included
- [ ] Success criteria measurable

---

## Communication Plan Checklist

- [ ] All stakeholders identified
- [ ] Notification content defined
- [ ] Notification timing defined
- [ ] Escalation path defined
- [ ] Announcement drafts prepared

---

## Timeline Checklist

- [ ] Start date defined
- [ ] End date defined
- [ ] Milestones identified
- [ ] Milestone dates assigned
- [ ] Buffer time included

---

## Safety Checklist

| Item | Requirement | Check |
|------|-------------|-------|
| Backup | Verified and tested restore | [ ] |
| Rollback | Tested in staging | [ ] |
| Validation | Measurable criteria | [ ] |
| Communication | All stakeholders notified | [ ] |
| Destructive Actions | Identified and documented | [ ] |

---

## Anti-Pattern Prevention

- [ ] **NOT** missing rollback plan
- [ ] **NOT** wrong strategy for dataset size
- [ ] **NOT** missing validation criteria
- [ ] **NOT** missing communication plan
- [ ] **NOT** underestimated duration
- [ ] **NOT** destructive action without backup

---

## Post-Planning Checklist

- [ ] Plan follows template structure
- [ ] All required sections present
- [ ] Developer can execute from plan
- [ ] Tester can validate from plan
- [ ] Operations can rollback from plan