# Example: Progressive Database Schema Migration

## Context

This example demonstrates `migration-planning` skill for a database schema migration.

---

## Scenario

Migrate user authentication data to support multi-factor authentication (MFA) with zero downtime.

---

## Input

```yaml
migration: Add MFA Support
current_state:
  table: users
  columns: id, email, password_hash, created_at
  data_volume: 1.5M users
  constraints: Zero downtime required
target_state:
  new_columns: mfa_enabled, mfa_secret, mfa_backup_codes
  new_table: user_mfa_sessions
requirements:
  - Backfill existing users (mfa_enabled = false)
  - Support gradual MFA rollout
  - Maintain existing auth functionality
```

---

## Output Migration Plan

```yaml
migration-plan:
  migration_name: "MFA-Schema-Migration"
  migration_type: progressive
  
  current_state:
    description: "User table with basic auth fields, no MFA support"
    data_volume: "1.5M users, 200MB table size"
    dependencies:
      - "AuthService reads user table for login"
      - "RegistrationService writes to user table"
      - "ReportingService aggregates user counts"
    risks:
      - "Auth flow must continue during migration"
      - "Users expecting immediate MFA capability"
  
  target_state:
    description: "User table with MFA fields, new session tracking table"
    changes_summary:
      - "Add mfa_enabled (boolean, default false)"
      - "Add mfa_secret (varchar, nullable)"
      - "Add mfa_backup_codes (json, nullable)"
      - "Create user_mfa_sessions table for session tracking"
      - "Add foreign key from sessions to users"
  
  strategy_analysis:
    options_evaluated:
      - strategy: big_bang
        pros:
          - "Single execution"
          - "Simple rollback"
        cons:
          - "Requires 30+ min downtime"
          - "Cannot validate incrementally"
        selected: false
      
      - strategy: progressive
        pros:
          - "Zero downtime"
          - "Incremental validation"
          - "Phased rollback possible"
        cons:
          - "4 phases required"
          - "Coordination complexity"
        selected: true
      
      - strategy: parallel_run
        pros:
          - "Full validation"
          - "Instant rollback"
        cons:
          - "Double database cost"
          - "Overkill for schema migration"
        selected: false
    
    rationale: "Progressive migration chosen for zero downtime requirement. Schema-only changes (no data transformation) make parallel run unnecessary complexity."
  
  phases:
    - phase_id: "P1"
      name: "Add New Columns"
      description: "Add MFA columns to existing table (non-breaking)"
      actions:
        - "ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT false"
        - "ALTER TABLE users ADD COLUMN mfa_secret VARCHAR(255) NULL"
        - "ALTER TABLE users ADD COLUMN mfa_backup_codes JSON NULL"
      validation:
        - "Schema change successful"
        - "Existing auth queries still work"
        - "New columns accept writes"
      rollback_actions:
        - "ALTER TABLE users DROP COLUMN mfa_enabled"
        - "ALTER TABLE users DROP COLUMN mfa_secret"
        - "ALTER TABLE users DROP COLUMN mfa_backup_codes"
      estimated_duration: "15 minutes"
      prerequisites: []
    
    - phase_id: "P2"
      name: "Create Sessions Table"
      description: "Create new table for MFA session tracking"
      actions:
        - "CREATE TABLE user_mfa_sessions (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), session_token VARCHAR(255), created_at TIMESTAMP, expires_at TIMESTAMP)"
        - "CREATE INDEX idx_user_mfa_sessions_user_id ON user_mfa_sessions(user_id)"
      validation:
        - "Table created successfully"
        - "Foreign key constraint active"
        - "Index improves query performance"
      rollback_actions:
        - "DROP TABLE user_mfa_sessions"
      estimated_duration: "10 minutes"
      prerequisites: ["P1 complete"]
    
    - phase_id: "P3"
      name: "Update Application Code"
      description: "Deploy application with MFA support"
      actions:
        - "Update AuthService to check mfa_enabled field"
        - "Update RegistrationService to handle new columns"
        - "Add MfaService for MFA operations"
        - "Deploy updated services"
      validation:
        - "Login flow works with mfa_enabled = false users"
        - "MFA enrollment works for new users"
        - "Session tracking functional"
      rollback_actions:
        - "Deploy previous application version"
        - "MFA features disabled (but schema ready)"
      estimated_duration: "2 hours"
      prerequisites: ["P2 complete"]
    
    - phase_id: "P4"
      name: "Enable MFA Features"
      description: "Gradually enable MFA for users"
      actions:
        - "Enable MFA enrollment UI"
        - "Monitor MFA enrollment rate"
        - "Enable MFA requirement for admin users"
      validation:
        - "Users can enroll in MFA"
        - "Admin users required to use MFA"
        - "No auth failures"
      rollback_actions:
        - "Disable MFA enrollment UI"
        - "Revert admin MFA requirement"
      estimated_duration: "1 week (gradual rollout)"
      prerequisites: ["P3 complete"]
  
  rollback_plan:
    trigger_conditions:
      - "Auth failure rate exceeds 1%"
      - "Phase validation fails"
      - "Application errors exceed threshold"
    procedure:
      - "Execute rollback actions for current phase"
      - "Verify application stability"
      - "If needed, rollback previous phases in reverse order"
    data_recovery:
      - "New columns can be dropped (no data loss)"
      - "Sessions table can be recreated if needed"
    estimated_duration: "1 hour"
  
  validation_plan:
    pre_migration_checks:
      - "Database backup verified"
      - "Test environment migration successful"
      - "Application code tested with new schema"
    during_migration_checks:
      - "Auth success rate monitoring"
      - "Query latency monitoring"
      - "Error rate monitoring"
    post_migration_checks:
      - "All users can log in"
      - "MFA enrollment functional"
      - "Session tracking accurate"
    success_criteria:
      - "Auth failure rate < 0.1%"
      - "All 1.5M users accessible"
      - "MFA enrollment working"
  
  communication_plan:
    stakeholders:
      - name: "Product Team"
        notification: "MFA feature availability timeline"
        timing: "Phase P3 start"
      - name: "Security Team"
        notification: "Admin MFA requirement timeline"
        timing: "Phase P4 start"
      - name: "Operations Team"
        notification: "Migration schedule and rollback procedures"
        timing: "1 day before P1"
  
  timeline:
    start_date: "2024-03-01"
    end_date: "2024-03-10"
    milestones:
      - name: "Schema Ready"
        date: "2024-03-01"
      - name: "Application Updated"
        date: "2024-03-03"
      - name: "MFA Available"
        date: "2024-03-04"
      - name: "Migration Complete"
        date: "2024-03-10"
  
  status: planned

---

## Key Planning Points

1. **Progressive Strategy**: Chosen for zero downtime, incremental validation
2. **Non-Breaking Phase 1**: Add columns without affecting existing queries
3. **Phased Rollback**: Each phase has specific rollback actions
4. **Gradual Feature Enable**: MFA enabled incrementally after schema ready
5. **Clear Validation**: Each phase has measurable success criteria