# Migration Plan Template

Use this template when planning database migrations, system upgrades, or data transformations.

---

## Template

```yaml
migration-plan:
  # === IDENTIFICATION ===
  migration_name: "[Canonical name, e.g., UserTable-Schema-V2]"
  migration_type: "[big_bang|progressive|parallel_run]"
  
  # === CURRENT STATE ===
  current_state:
    description: "[Current system state before migration]"
    data_volume: "[Size, count, or estimate]"
    dependencies:
      - "[System/service that depends on this]"
      - "[Another dependency]"
    risks:
      - "[Risk 1]"
      - "[Risk 2]"
  
  # === TARGET STATE ===
  target_state:
    description: "[Target system state after migration]"
    changes_summary:
      - "[Change 1]"
      - "[Change 2]"
  
  # === STRATEGY ANALYSIS ===
  strategy_analysis:
    options_evaluated:
      - strategy: "[Strategy name]"
        pros:
          - "[Pro 1]"
          - "[Pro 2]"
        cons:
          - "[Con 1]"
          - "[Con 2]"
        selected: [true|false]
      # Evaluate all three strategies
    
    rationale: "[Why this strategy was selected]"
  
  # === PHASES ===
  phases:
    - phase_id: "[Phase ID, e.g., P1]"
      name: "[Phase name]"
      description: "[What this phase accomplishes]"
      actions:
        - "[Action 1 - specific, executable]"
        - "[Action 2]"
      validation:
        - "[How to verify this phase succeeded]"
        - "[Validation criterion]"
      rollback_actions:
        - "[How to undo this phase]"
        - "[Rollback step]"
      estimated_duration: "[Time estimate with buffer]"
      prerequisites: ["[Phase IDs that must complete first]"]
    # Add more phases as needed
  
  # === ROLLBACK PLAN ===
  rollback_plan:
    trigger_conditions:
      - "[Condition 1 that triggers rollback]"
      - "[Condition 2]"
    
    procedure:
      - "[Step 1 of rollback procedure]"
      - "[Step 2]"
    
    data_recovery:
      - "[How to recover data if needed]"
      - "[Backup location and restore method]"
    
    estimated_duration: "[Time to complete rollback]"
  
  # === VALIDATION PLAN ===
  validation_plan:
    pre_migration_checks:
      - "[Check to perform before starting]"
    
    during_migration_checks:
      - "[Check to perform during migration]"
    
    post_migration_checks:
      - "[Check to perform after completion]"
    
    success_criteria:
      - "[Measurable success criterion]"
  
  # === COMMUNICATION PLAN ===
  communication_plan:
    stakeholders:
      - name: "[Stakeholder name]"
        notification: "[What to notify them]"
        timing: "[When to notify]"
    announcements:
      - "[Announcement type and content]"
  
  # === TIMELINE ===
  timeline:
    start_date: "[YYYY-MM-DD]"
    end_date: "[YYYY-MM-DD]"
    milestones:
      - name: "[Milestone name]"
        date: "[YYYY-MM-DD]"
  
  # === STATUS ===
  status: "[planned|in_progress|completed|rolled_back|blocked]"
```

---

## Quick Reference

### Strategy Selection Guide

| Strategy | When to Use | Key Characteristics |
|----------|-------------|---------------------|
| big_bang | Small dataset, acceptable downtime | Single execution, simple rollback |
| progressive | Zero downtime required, medium complexity | Incremental phases, per-phase rollback |
| parallel_run | High risk, business-critical | Both systems active, gradual traffic shift |

### Phase Naming Convention

| Prefix | Type | Example |
|--------|------|---------|
| P1, P2, ... | Sequential phases | P1: Add columns, P2: Backfill |
| V1, V2, ... | Validation phases | V1: Validate backfill |

### Duration Estimation Buffer

| Risk Level | Buffer |
|------------|--------|
| Low | +10% |
| Medium | +25% |
| High | +50% |

### Common Validation Checks

| Check | Pre | During | Post |
|-------|-----|--------|------|
| Backup verified | ✓ | | |
| Schema change successful | | ✓ | |
| Data integrity | | ✓ | ✓ |
| Application functional | | ✓ | ✓ |
| Performance baseline | | | ✓ |

### Rollback Trigger Thresholds

| Metric | Warning | Critical (Rollback) |
|--------|---------|---------------------|
| Error rate | 1% | 5% |
| Latency increase | 50% | 200% |
| Data integrity failures | 1 | 10 |
| User complaints | 5 | 20 |