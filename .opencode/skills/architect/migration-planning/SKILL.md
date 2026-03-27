# Skill: migration-planning

## Purpose

Plan data and system migration strategies that minimize risk, ensure data integrity, and provide clear rollback paths.

Core problems solved:
- Database schema changes break existing functionality
- System upgrades cause unexpected downtime
- Data migrations lose or corrupt data
- No rollback plan when migrations fail
- Migration execution lacks clear phases

## When to Use

**Required when:**
- Database schema changes affect production data
- System upgrades require data transformation
- Major version changes alter data structures
- Platform migrations (e.g., cloud provider switch)
- Technology replacements (e.g., database engine change)

**Recommended when:**
- Adding new columns with default values
- Changing column types
- Splitting or merging tables
- Index optimization affecting queries
- Archiving old data

## When Not to Use

**Not applicable when:**
- Add-only changes (new table, new optional column)
- Configuration-only changes
- Trivial renames without data impact
- Development environment migrations (no production risk)

## Migration Strategy Types

### 1. Big Bang Migration
Single-step migration with downtime window.

**Characteristics:**
- All changes applied at once
- Requires planned downtime
- Simple rollback (restore backup)
- Higher risk, faster execution

**When to use:**
- Small datasets
- Acceptable downtime window
- Simple transformation logic
- Low complexity dependency

### 2. Progressive Migration
Gradual migration over multiple phases.

**Characteristics:**
- Changes applied incrementally
- Continuous availability
- Complex rollback (per-phase)
- Lower risk, longer execution

**When to use:**
- Large datasets
- Zero-downtime requirement
- Complex transformation logic
- High complexity dependency

### 3. Parallel Run Migration
Old and new systems run simultaneously.

**Characteristics:**
- Both systems active during transition
- Data synchronized bidirectionally
- Gradual traffic shift
- Safest rollback (switch back to old)

**When to use:**
- High-risk migrations
- Business-critical systems
- Validation required before switch
- Sufficient infrastructure resources

## Output Format

The skill produces a `migration-plan` artifact:

```yaml
migration-plan:
  migration_name: string            # Canonical name
  migration_type: string            # big_bang|progressive|parallel_run
  
  current_state:                    # Status before migration
    description: string
    data_volume: string
    dependencies: string[]
    risks: string[]
  
  target_state:                     # Status after migration
    description: string
    changes_summary: string[]
  
  strategy_analysis:                # Why this strategy was chosen
    options_evaluated:
      - strategy: string
        pros: string[]
        cons: string[]
        selected: boolean
    rationale: string
  
  phases:                           # Execution phases
    - phase_id: string
      name: string
      description: string
      actions: string[]
      validation: string[]          # How to verify success
      rollback_actions: string[]    # How to undo this phase
      estimated_duration: string
      prerequisites: string[]       # What must complete before
  
  rollback_plan:                    # Full rollback procedure
    trigger_conditions: string[]    # When to rollback
    procedure: string[]
    data_recovery: string[]
    estimated_duration: string
  
  validation_plan:                  # How to verify migration success
    pre_migration_checks: string[]
    during_migration_checks: string[]
    post_migration_checks: string[]
    success_criteria: string[]
  
  communication_plan:               # Who needs to know
    stakeholders:
      - name: string
        notification: string
        timing: string
    announcements: string[]
  
  timeline:
    start_date: string
    end_date: string
    milestones:
      - name: string
        date: string
  
  status: planned|in_progress|completed|rolled_back|blocked
```

## Examples

### Example 1: Database Schema Migration (Progressive)

```yaml
migration-plan:
  migration_name: "UserTable-Schema-V2"
  migration_type: progressive
  
  current_state:
    description: "User table with flat structure, single email field"
    data_volume: "2M users, 500GB total"
    dependencies:
      - "AuthService reads user table"
      - "NotificationService queries by email"
      - "ReportingService aggregates user data"
    risks:
      - "Email field is case-sensitive, causing duplicate entries"
      - "No soft-delete support, deletions are permanent"
  
  target_state:
    description: "User table with normalized email, soft-delete flag, audit fields"
    changes_summary:
      - "Add email_normalized column"
      - "Add deleted_at column for soft-delete"
      - "Add updated_at, updated_by audit columns"
      - "Create index on email_normalized"
      - "Backfill email_normalized from existing emails"
  
  strategy_analysis:
    options_evaluated:
      - strategy: big_bang
        pros:
          - "Single execution window"
          - "Simple rollback (restore backup)"
        cons:
          - "Requires 2+ hours downtime"
          - "Cannot validate incrementally"
          - "High risk for 2M users"
        selected: false
      
      - strategy: progressive
        pros:
          - "Zero downtime"
          - "Incremental validation"
          - "Per-phase rollback possible"
        cons:
          - "Longer total duration"
          - "More complex coordination"
        selected: true
      
      - strategy: parallel_run
        pros:
          - "Full rollback by switching systems"
          - "Extensive validation possible"
        cons:
          - "Double infrastructure cost"
          - "Complex sync logic"
        selected: false
    
    rationale: "Progressive migration chosen due to zero-downtime requirement and ability to validate each phase before proceeding. Dataset size (2M users) makes big-bang too risky."
  
  phases:
    - phase_id: "P1"
      name: "Add Columns (Non-Breaking)"
      description: "Add new columns without affecting existing queries"
      actions:
        - "ALTER TABLE users ADD COLUMN email_normalized VARCHAR(255)"
        - "ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL"
        - "ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NULL"
        - "ALTER TABLE users ADD COLUMN updated_by VARCHAR(50) NULL"
      validation:
        - "Schema migration successful"
        - "Existing queries still work"
        - "New columns accept writes"
      rollback_actions:
        - "ALTER TABLE users DROP COLUMN email_normalized"
        - "ALTER TABLE users DROP COLUMN deleted_at"
        - "ALTER TABLE users DROP COLUMN updated_at"
        - "ALTER TABLE users DROP COLUMN updated_by"
      estimated_duration: "30 minutes"
      prerequisites: []
    
    - phase_id: "P2"
      name: "Backfill Data"
      description: "Populate new columns from existing data"
      actions:
        - "Write backfill script to normalize emails (batch size 10K)"
        - "Execute backfill in batches with rate limiting"
        - "Verify all rows have email_normalized populated"
      validation:
        - "All rows backfilled successfully"
        - "email_normalized matches LOWER(email)"
        - "No duplicate email_normalized values created"
      rollback_actions:
        - "UPDATE users SET email_normalized = NULL WHERE email_normalized IS NOT NULL"
      estimated_duration: "4 hours"
      prerequisites: ["P1 complete"]
    
    - phase_id: "P3"
      name: "Update Application Code"
      description: "Modify application to use new columns"
      actions:
        - "Update AuthService to query by email_normalized"
        - "Update NotificationService to use email_normalized"
        - "Update ReportingService to handle soft-delete"
        - "Deploy application changes"
      validation:
        - "All services query correctly"
        - "Soft-delete working as expected"
        - "Audit fields populated on updates"
      rollback_actions:
        - "Deploy previous application version"
        - "Revert configuration changes"
      estimated_duration: "2 hours"
      prerequisites: ["P2 complete"]
    
    - phase_id: "P4"
      name: "Create Index and Cleanup"
      description: "Optimize queries and remove unused fields"
      actions:
        - "CREATE INDEX idx_email_normalized ON users(email_normalized)"
        - "Monitor query performance"
        - "Deprecate old email column (keep for 6 months)"
      validation:
        - "Index created successfully"
        - "Query performance improved"
        - "No application errors"
      rollback_actions:
        - "DROP INDEX idx_email_normalized"
        - "Re-enable old email column usage"
      estimated_duration: "1 hour"
      prerequisites: ["P3 complete"]
  
  rollback_plan:
    trigger_conditions:
      - "Phase validation fails"
      - "Application errors exceed 1% threshold"
      - "Data integrity check fails"
      - "Performance degradation exceeds 50%"
    procedure:
      - "Execute rollback actions for current phase"
      - "If multiple phases completed, rollback in reverse order"
      - "Verify system stability after each rollback step"
    data_recovery:
      - "Restore from backup if phase rollback insufficient"
      - "Point-in-time recovery available for last 24 hours"
    estimated_duration: "2 hours (full rollback)"
  
  validation_plan:
    pre_migration_checks:
      - "Backup verified and restorable"
      - "Test environment migration successful"
      - "Application code tested with new schema"
      - "Monitoring dashboards ready"
    during_migration_checks:
      - "Error rate monitoring"
      - "Query latency monitoring"
      - "Batch progress tracking"
    post_migration_checks:
      - "All services functioning correctly"
      - "No duplicate email entries"
      - "Soft-delete working as expected"
      - "Audit trail populated"
    success_criteria:
      - "Zero data loss"
      - "All rows migrated successfully"
      - "Application error rate < 0.1%"
      - "Query performance improved"
  
  communication_plan:
    stakeholders:
      - name: "Product Team"
        notification: "Feature freeze during migration window"
        timing: "1 week before start"
      - name: "Operations Team"
        notification: "Migration schedule and rollback procedures"
        timing: "3 days before start"
      - name: "Customer Support"
        notification: "Potential brief service interruptions"
        timing: "1 day before start"
    announcements:
      - "Internal: Migration status updates every phase"
      - "External: No announcement (zero downtime expected)"
  
  timeline:
    start_date: "2024-02-01"
    end_date: "2024-02-05"
    milestones:
      - name: "Phase 1 Complete"
        date: "2024-02-01"
      - name: "Phase 2 Complete"
        date: "2024-02-03"
      - name: "Phase 3 Complete"
        date: "2024-02-04"
      - name: "Phase 4 Complete (Migration Success)"
        date: "2024-02-05"
  
  status: planned
```

### Example 2: System Upgrade (Parallel Run)

```yaml
migration-plan:
  migration_name: "PaymentService-V3-Upgrade"
  migration_type: parallel_run
  
  current_state:
    description: "Payment service v2, synchronous processing, single database"
    data_volume: "5M transactions/month"
    dependencies:
      - "OrderService initiates payments"
      - "InventoryService confirms after payment"
      - "NotificationService sends receipt emails"
    risks:
      - "Synchronous processing causes latency spikes"
      - "Single database limits scalability"
      - "No retry mechanism for failed payments"
  
  target_state:
    description: "Payment service v3, async processing, sharded database"
    changes_summary:
      - "Async payment processing with queue"
      - "Database sharding by region"
      - "Built-in retry with exponential backoff"
      - "New API endpoints for payment status"
  
  strategy_analysis:
    options_evaluated:
      - strategy: big_bang
        pros: ["Simple deployment"]
        cons: ["High risk", "No validation period"]
        selected: false
      
      - strategy: progressive
        pros: ["Incremental rollout"]
        cons: ["API versioning complexity"]
        selected: false
      
      - strategy: parallel_run
        pros:
          - "Full validation before switch"
          - "Instant rollback by switching back"
          - "Gradual traffic shift"
        cons:
          - "Double infrastructure cost for 2 weeks"
        selected: true
    
    rationale: "Parallel run chosen due to business-critical nature of payment processing. Full validation required before committing to v3."
  
  phases:
    - phase_id: "P1"
      name: "Deploy V3 Infrastructure"
      description: "Set up V3 system without production traffic"
      actions:
        - "Deploy V3 payment service instances"
        - "Create sharded database infrastructure"
        - "Configure message queue for async processing"
        - "Set up bidirectional sync from V2 to V3"
      validation:
        - "V3 infrastructure healthy"
        - "Sync working correctly"
        - "No production traffic yet"
      rollback_actions:
        - "Shut down V3 infrastructure"
        - "Remove sync configuration"
      estimated_duration: "3 days"
      prerequisites: []
    
    - phase_id: "P2"
      name: "Shadow Traffic"
      description: "Route read-only shadow traffic to V3"
      actions:
        - "Configure traffic mirroring to V3"
        - "Monitor V3 processing accuracy"
        - "Compare V3 results with V2"
      validation:
        - "V3 processing matches V2 exactly"
        - "No errors in V3 processing"
        - "Latency within acceptable range"
      rollback_actions:
        - "Stop traffic mirroring"
        - "Continue with V2 only"
      estimated_duration: "5 days"
      prerequisites: ["P1 complete"]
    
    - phase_id: "P3"
      name: "Gradual Traffic Shift"
      description: "Shift increasing percentage of write traffic to V3"
      actions:
        - "Shift 10% of new payments to V3"
        - "Monitor for 24 hours, then increase to 25%"
        - "Monitor for 24 hours, then increase to 50%"
        - "Monitor for 24 hours, then increase to 100%"
      validation:
        - "Payment success rate maintained"
        - "No customer complaints"
        - "Processing latency acceptable"
      rollback_actions:
        - "Redirect traffic back to V2 at current percentage"
        - "Verify V2 handles redirected traffic"
      estimated_duration: "5 days"
      prerequisites: ["P2 complete"]
    
    - phase_id: "P4"
      name: "V2 Decommission"
      description: "Remove V2 system after full validation"
      actions:
        - "Stop V2 instance (keep for 1 week as backup)"
        - "Final sync verification"
        - "Remove V2 after 1 week confirmation"
      validation:
        - "No traffic to V2"
        - "All data in V3"
        - "Cost savings realized"
      rollback_actions:
        - "Restart V2 instances"
        - "Redirect traffic to V2"
      estimated_duration: "2 days"
      prerequisites: ["P3 complete"]
  
  rollback_plan:
    trigger_conditions:
      - "Payment success rate drops below 95%"
      - "Customer complaints exceed threshold"
      - "Processing latency exceeds SLA"
      - "Data sync inconsistency detected"
    procedure:
      - "Immediately redirect all traffic to V2"
      - "Verify V2 handles full traffic load"
      - "Investigate V3 issues while V2 handles production"
    data_recovery:
      - "V2 remains active during entire migration"
      - "No data recovery needed (V2 preserved)"
    estimated_duration: "15 minutes"
  
  validation_plan:
    pre_migration_checks:
      - "V3 infrastructure tested in staging"
      - "Sync mechanism verified"
      - "Traffic routing configuration ready"
      - "Monitoring dashboards configured for both systems"
    during_migration_checks:
      - "Payment success rate comparison (V2 vs V3)"
      - "Processing latency comparison"
      - "Data consistency between systems"
      - "Error rate monitoring"
    post_migration_checks:
      - "All payments processed in V3"
      - "No missing transactions"
      - "Customer experience unchanged"
      - "Cost metrics within budget"
    success_criteria:
      - "Payment success rate ≥ 99.5%"
      - "Processing latency < 200ms average"
      - "Zero data loss"
      - "No customer escalations"
  
  communication_plan:
    stakeholders:
      - name: "Finance Team"
        notification: "Migration timing and validation criteria"
        timing: "2 weeks before start"
      - name: "Customer Support"
        notification: "Potential support procedures during migration"
        timing: "1 week before start"
      - name: "Executive Team"
        notification: "Risk summary and rollback capability"
        timing: "3 days before start"
    announcements:
      - "Internal: Daily status updates during migration"
      - "External: No announcement (seamless migration)"
  
  timeline:
    start_date: "2024-03-01"
    end_date: "2024-03-15"
    milestones:
      - name: "P1: Infrastructure Ready"
        date: "2024-03-04"
      - name: "P2: Shadow Validation Complete"
        date: "2024-03-09"
      - name: "P3: Full Traffic on V3"
        date: "2024-03-14"
      - name: "P4: V2 Decommissioned"
        date: "2024-03-15"
  
  status: planned
```

## Anti-Examples

### Anti-Example 1: No Rollback Plan

**What NOT to do:**

```yaml
# WRONG: No rollback procedure
migration-plan:
  migration_name: "Database-Schema-Update"
  phases:
    - phase_id: "P1"
      actions: ["ALTER TABLE orders ADD COLUMN status"]
  # Missing: rollback_plan
  # Missing: rollback_actions per phase
```

**Why it's wrong:**
- If migration fails, no way to recover
- Production downtime extends while planning rollback
- Risk of permanent data loss
- Stakeholders cannot trust migration process

**Correct approach:**
Every phase must have rollback actions; overall rollback plan required.

---

### Anti-Example 2: Big Bang for Large Dataset

**What NOT to do:**

```yaml
# WRONG: Big bang migration for large dataset
migration-plan:
  migration_name: "CustomerData-Migration"
  migration_type: big_bang
  current_state:
    data_volume: "50M records"
  # Missing: strategy analysis showing why big bang was chosen
  # Missing: downtime acknowledgment
```

**Why it's wrong:**
- 50M records need hours to migrate
- Downtime too long for business
- High risk of failure
- No incremental validation

**Correct approach:**
Use progressive or parallel run for large datasets; analyze strategy options.

---

### Anti-Example 3: Missing Validation

**What NOT to do:**

```yaml
# WRONG: No validation checks
migration-plan:
  migration_name: "UserService-Upgrade"
  phases:
    - phase_id: "P1"
      actions: ["Deploy new service version"]
  # Missing: validation section
  # Missing: success_criteria
```

**Why it's wrong:**
- Cannot determine if migration succeeded
- Issues discovered post-migration
- No confidence in migration quality
- Cannot detect partial failures

**Correct approach:**
Define validation checks for pre/during/post migration; specify success criteria.

---

### Anti-Example 4: No Communication Plan

**What NOT to do:**

```yaml
# WRONG: Stakeholders unaware
migration-plan:
  migration_name: "Platform-Migration"
  timeline:
    start_date: "2024-04-01"
  # Missing: communication_plan
  # Missing: stakeholder notifications
```

**Why it's wrong:**
- Teams surprised by migration timing
- Customer support unprepared
- No coordination with dependent teams
- Escalation procedures unclear

**Correct approach:**
Define who needs to know, what they need to know, and when.

## Checklists

### Strategy Selection Checklist
- [ ] All strategies evaluated (big_bang, progressive, parallel_run)
- [ ] Strategy rationale documented
- [ ] Downtime requirements acknowledged
- [ ] Risk level acceptable for chosen strategy

### Phase Design Checklist
- [ ] Each phase has clear actions
- [ ] Each phase has validation criteria
- [ ] Each phase has rollback actions
- [ ] Prerequisites between phases clear
- [ ] Duration estimates realistic

### Rollback Planning Checklist
- [ ] Trigger conditions defined
- [ ] Rollback procedure step-by-step
- [ ] Data recovery method specified
- [ ] Rollback duration estimated
- [ ] Rollback tested in staging

### Validation Checklist
- [ ] Pre-migration checks defined
- [ ] During-migration checks defined
- [ ] Post-migration checks defined
- [ ] Success criteria measurable
- [ ] Monitoring ready

### Communication Checklist
- [ ] All stakeholders identified
- [ ] Notification content defined
- [ ] Timing for each notification
- [ ] Escalation path clear

## Common Failure Modes

| Failure Mode | Symptoms | Mitigation |
|--------------|----------|------------|
| No rollback plan | Migration failure causes extended downtime | Require rollback plan before approval |
| Wrong strategy choice | Downtime exceeds acceptable window | Evaluate all strategies with trade-offs |
| Missing validation | Issues discovered late | Define validation for all phases |
| No communication | Stakeholders surprised | Create communication plan upfront |
| Underestimated duration | Migration extends beyond timeline | Include buffer in estimates |

## Templates

### Minimal Migration Plan Template

```yaml
migration-plan:
  migration_name: "[Canonical name]"
  migration_type: big_bang|progressive|parallel_run
  
  current_state:
    description: "[Current system state]"
    data_volume: "[Size/count]"
    dependencies: ["[Dependency 1]"]
    risks: ["[Risk 1]"]
  
  target_state:
    description: "[Target system state]"
    changes_summary: ["[Change 1]"]
  
  strategy_analysis:
    options_evaluated:
      - strategy: "[Strategy name]"
        pros: ["[Pro 1]"]
        cons: ["[Con 1]"]
        selected: true|false
    rationale: "[Why this strategy]"
  
  phases:
    - phase_id: "[Phase ID]"
      name: "[Phase name]"
      description: "[What this phase does]"
      actions: ["[Action 1]"]
      validation: ["[Validation check 1]"]
      rollback_actions: ["[Rollback action 1]"]
      estimated_duration: "[Time estimate]"
      prerequisites: ["[Prerequisite phase]"]
  
  rollback_plan:
    trigger_conditions: ["[Condition 1]"]
    procedure: ["[Step 1]"]
    data_recovery: ["[Recovery method]"]
    estimated_duration: "[Time estimate]"
  
  validation_plan:
    pre_migration_checks: ["[Check 1]"]
    during_migration_checks: ["[Check 1]"]
    post_migration_checks: ["[Check 1]"]
    success_criteria: ["[Criterion 1]"]
  
  communication_plan:
    stakeholders:
      - name: "[Stakeholder]"
        notification: "[What to tell them]"
        timing: "[When to notify]"
  
  timeline:
    start_date: "[Date]"
    end_date: "[Date]"
    milestones:
      - name: "[Milestone]"
        date: "[Date]"
  
  status: planned|in_progress|completed|rolled_back|blocked
```

## Notes

### Relationship to MVP Architect Skills
- `requirement-to-design` may identify migration needs
- `tradeoff-analysis` evaluates migration strategy options
- `migration-planning` executes after strategy selected

### Relationship to Other Skills
- `interface-contract-design`: Interface changes require migration
- `module-boundary-design`: Module restructuring may need migration

### Downstream Consumption
- **developer**: Executes migration phases
- **tester**: Validates migration success
- **reviewer**: Reviews migration plan completeness
- **security**: Reviews data integrity during migration

### Migration Strategy Selection Guide

| Scenario | Recommended Strategy |
|----------|---------------------|
| Small dataset (<1M), acceptable downtime | Big Bang |
| Large dataset (>1M), zero downtime required | Progressive |
| Business-critical, high risk | Parallel Run |
| Add-only changes, no transformation | Progressive (simplified) |