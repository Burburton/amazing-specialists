# Anti-Example 002: Silent Design Deviation

## Scenario
Developer deviates from design without documenting why.

## What Went Wrong

### Design Note Specification
```yaml
# From design-note.md
architecture:
  type: "stateless"
  token_type: "JWT"
  token_storage: "client-side"
```

### Developer's Implementation
```yaml
implementation_summary:
  goal_alignment:
    goal: "Implement authentication"
    achieved: true
    deviations: []  # PROBLEM: Claims no deviations
  
  implementation:
    approach: "Used session-based auth with Redis"
    # PROBLEM: Design specified JWT (stateless), not sessions
  
  changed_files:
    - path: "src/services/SessionService.ts"  # Not in design
    - path: "src/config/redis.ts"  # Not in design
  
  dependencies_added:
    - name: "connect-redis"
    - name: "express-session"
    # PROBLEM: Design didn't specify these
```

## Problems Identified

| Problem | Evidence | Impact |
|---------|----------|--------|
| False no-deviation claim | Sessions vs JWT | Misleading documentation |
| Unapproved architecture change | Redis introduced | Infrastructure not planned |
| Hidden assumptions | Client assumes session | API contract broken |

## Why This Is Dangerous

1. **Infrastructure unprepared**: Ops team didn't plan for Redis
2. **Contract broken**: Clients expect stateless JWT
3. **Reviewer misled**: Thinks design was followed
4. **Knowledge lost**: No one knows why deviation occurred

## Correct Approach

```yaml
implementation_summary:
  goal_alignment:
    goal: "Implement authentication"
    achieved: true
    deviations:
      - deviation: "Used sessions instead of JWT"
        rationale: "Security team recommended sessions for this use case"
        approved_by: "security-lead"
        # Document WHO approved and WHY
```

## How to Detect

### In Code Review
- Implementation differs from design?
- New infrastructure dependencies?
- Architecture changes?

### In Self-Check
- [ ] All deviations documented?
- [ ] Deviations have approval?
- [ ] Rationale explained?

## Prevention

1. **Compare implementation against design before finalizing**
2. **Document ANY difference, even if seems minor**
3. **Get approval for deviations before proceeding**
4. **Be honest in implementation-summary**