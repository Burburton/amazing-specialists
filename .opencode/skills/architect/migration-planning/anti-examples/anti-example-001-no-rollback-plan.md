# Anti-Example: No Rollback Plan

## Problem

This anti-example demonstrates a migration plan without rollback procedures.

---

## What NOT to Do

```yaml
# WRONG: Migration without rollback plan
migration-plan:
  migration_name: "Database-Consolidation"
  migration_type: big_bang
  
  phases:
    - phase_id: "P1"
      name: "Merge Tables"
      actions:
        - "DROP TABLE user_profiles"
        - "ALTER TABLE users ADD profile_data JSON"
        - "INSERT profile data into users table"
  
  # Missing: rollback_plan
  # Missing: rollback_actions per phase
  # Missing: trigger conditions for rollback
  # Missing: data recovery procedure
```

---

## Why It's Wrong

1. **No recovery path**: If migration fails, data is permanently lost
2. **Extended downtime**: Production downtime extends while scrambling to recover
3. **Risk of catastrophic data loss**: DROP TABLE is irreversible without backup
4. **No confidence in migration**: Stakeholders cannot approve without rollback safety
5. **Legal/compliance risk**: Data loss may violate regulations

---

## Impact Example

```
# Migration execution
Phase P1: Merge Tables
- DROP TABLE user_profiles  # DONE - table deleted
- ALTER TABLE users ADD profile_data JSON  # DONE
- INSERT profile data...  # FAILS - data corruption detected

# Now what?
- user_profiles table is GONE
- Data cannot be recovered
- Production is down
- Engineers scrambling to restore from backup (hours of downtime)
- Customers affected
```

---

## Correct Approach

```yaml
# RIGHT: Migration with complete rollback plan
migration-plan:
  migration_name: "Database-Consolidation"
  migration_type: progressive
  
  phases:
    - phase_id: "P1"
      name: "Backup and Preparation"
      actions:
        - "CREATE full backup of user_profiles and users"
        - "Verify backup integrity"
        - "Create staging copy for testing"
      validation:
        - "Backup successful"
        - "Restore test passed"
      rollback_actions:
        - "No rollback needed (preparation phase)"
      estimated_duration: "30 minutes"
      prerequisites: []
    
    - phase_id: "P2"
      name: "Add Column (Non-Breaking)"
      actions:
        - "ALTER TABLE users ADD COLUMN profile_data JSON NULL"
        - "Create application code to write to new column"
        - "Deploy application update"
      validation:
        - "New column accepts writes"
        - "Existing queries unaffected"
      rollback_actions:
        - "ALTER TABLE users DROP COLUMN profile_data"
        - "Deploy previous application version"
      estimated_duration: "1 hour"
      prerequisites: ["P1 complete"]
    
    - phase_id: "P3"
      name: "Migrate Data"
      actions:
        - "Copy data from user_profiles to users.profile_data (batch)"
        - "Verify data integrity after each batch"
      validation:
        - "All profile data copied"
        - "JSON structure valid"
      rollback_actions:
        - "UPDATE users SET profile_data = NULL WHERE profile_data IS NOT NULL"
        - "user_profiles table still exists (not dropped yet)"
      estimated_duration: "4 hours"
      prerequisites: ["P2 complete"]
    
    - phase_id: "P4"
      name: "Deprecate Old Table"
      actions:
        - "Rename user_profiles to user_profiles_deprecated"
        - "Monitor for 1 week"
        - "DROP TABLE user_profiles_deprecated after confirmation"
      validation:
        - "No application queries user_profiles"
        - "All functionality using new column"
      rollback_actions:
        - "Rename user_profiles_deprecated back to user_profiles"
        - "If already dropped: restore from P1 backup"
      estimated_duration: "1 week"
      prerequisites: ["P3 complete"]
  
  rollback_plan:
    trigger_conditions:
      - "Phase validation fails"
      - "Data integrity check fails"
      - "Application error rate exceeds 5%"
      - "User reports data missing"
    procedure:
      - "Execute rollback actions for current phase"
      - "If multiple phases completed, rollback in reverse order"
      - "If phase rollback insufficient, restore from P1 backup"
    data_recovery:
      - "P1 backup available for full restore"
      - "Point-in-time recovery for last 24 hours"
      - "Estimated restore time: 2 hours"
    estimated_duration: "4 hours maximum"
  
  validation_plan:
    pre_migration_checks:
      - "Backup verified"
      - "Restore test passed"
      - "Staging migration successful"
    during_migration_checks:
      - "Batch progress monitoring"
      - "Data integrity after each batch"
      - "Application error rate monitoring"
    post_migration_checks:
      - "All profiles accessible"
      - "No missing data"
      - "Application functional"
    success_criteria:
      - "Zero data loss"
      - "All profiles in new format"
      - "Application error rate < 0.1%"
```

---

## Detection Checklist

- [ ] Does each phase have rollback_actions?
- [ ] Is there a global rollback_plan section?
- [ ] Are trigger conditions for rollback defined?
- [ ] Is data recovery procedure specified?
- [ ] Is rollback duration estimated?

---

## Prevention

1. **Require rollback plan**: Every migration plan must have rollback procedures
2. **Per-phase rollback**: Each phase must have specific rollback actions
3. **Backup first**: Create backup before any destructive action
4. **Test rollback**: Validate rollback procedure in staging
5. **Define triggers**: Specify exactly when rollback should be initiated