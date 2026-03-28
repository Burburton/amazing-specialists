# Anti-Example 001: Implementation Without Design

## Scenario
Developer implements a feature without reading the design note.

## What Went Wrong

### Developer's Implementation Summary
```yaml
implementation_summary:
  dispatch_id: "dispatch-auth-001"
  task_id: "T-AUTH-001"
  
  goal_alignment:
    goal: "Implement user authentication"
    achieved: true
    # PROBLEM: No reference to design-note
    # PROBLEM: Doesn't state if constraints were met
  
  implementation:
    approach: "Built auth the standard way"
    # PROBLEM: Vague, doesn't reference design
    key_decisions: []
    # PROBLEM: No documented decisions
  
  changed_files:
    - path: "src/auth.ts"
      change_type: added
      description: "Auth implementation"
      # PROBLEM: Doesn't follow module boundaries from design
      lines_changed:
        added: 500
        deleted: 0
      # PROBLEM: Single large file instead of layered architecture
  
  dependencies_added:
    - name: "passport"
      version: "^0.6.0"
      reason: "Standard auth library"
      # PROBLEM: Design specified JWT, not passport sessions
  
  self_check:
    overall_status: PASS
    # PROBLEM: Should have caught design deviation
  
  recommendation: SEND_TO_TEST
```

## Problems Identified

| Problem | Why It's Wrong | Impact |
|---------|----------------|--------|
| No design reference | Cannot verify alignment | Design may not be implemented |
| Wrong architecture | Design specified 3-layer | Harder to maintain |
| Wrong library | Design specified JWT | Session-based auth not designed for |
| Large single file | Design specified modules | Code organization poor |
| Self-check passed | Should catch deviations | False confidence |

## Correct Approach

```yaml
implementation_summary:
  goal_alignment:
    goal: "Implement user authentication with JWT"
    achieved: true
    deviations: []
  
  implementation:
    approach: "Per design-note.md Section 3.2: Three-layer architecture"
    key_decisions:
      - decision: "Use jsonwebtoken per design"
        reason: "Design specified stateless auth"
```

## How to Prevent

1. **Always read design-note first**
2. **Reference design sections in implementation-summary**
3. **Verify approach matches design before coding**
4. **Run design alignment check in self-check**

## Detection Checklist

- [ ] Design-note referenced in implementation-summary?
- [ ] Module structure matches module-boundaries?
- [ ] Libraries match design specifications?
- [ ] Constraints from design respected?