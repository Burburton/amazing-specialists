# Anti-Example: Silent Assumptions

## Problem

This anti-example demonstrates **AP-004: Silent Assumptions** - making implicit guesses without documenting them.

---

## What NOT to Do

```yaml
# WRONG: Assumptions hidden or missing
design_note:
  design_summary: "Implement async event-driven authentication"
  
  # No assumptions field
  # No open_questions field
  
  module_boundaries:
    - module: AuthService
      responsibility: "Handle authentication events asynchronously"
      # Why async? Was this decided or assumed?
      
    - module: EventQueue
      responsibility: "Queue authentication events"
      # What queue? Redis? RabbitMQ? Not specified!
```

---

## Why It's Wrong

1. **Hidden decisions**: Async processing assumed without documentation
2. **No traceability**: Future maintainers cannot understand why async was chosen
3. **No risk assessment**: Impact of assumption being wrong is not evaluated
4. **Blocks validation**: Reviewer cannot assess if assumption is reasonable

---

## Correct Approach

```yaml
# RIGHT: Assumptions explicit
design_note:
  design_summary: "Implement async event-driven authentication"
  
  assumptions:
    - assumption_id: "A-001"
      description: "Authentication will be async to avoid blocking main request thread"
      risk_if_wrong: "Synchronous implementation would require architecture change"
      validation_method: "Performance testing on expected load"
      
    - assumption_id: "A-002"
      description: "Redis is available for event queuing"
      risk_if_wrong: "Would need alternative queue implementation"
      validation_method: "Check infrastructure documentation"
  
  open_questions:
    - question_id: "Q-001"
      question: "Should failed auth attempts be retried or dropped?"
      why_it_matters: "Affects error handling design and user experience"
      temporary_assumption: "Drop failed attempts, log for audit"
      impact_surface: "AuthService error handling, monitoring"
      recommended_next_step: "Confirm with product team"
      blocker: false
```

---

## Detection Checklist

- [ ] Is there an explicit `assumptions` section?
- [ ] Are assumptions marked with confidence levels?
- [ ] Is there an `open_questions` section for unresolved items?
- [ ] Can you identify what facts are confirmed vs. assumed?

---

## Prevention

1. Create assumptions table for every design decision that isn't explicitly stated
2. Mark assumptions with confidence (High/Medium/Low)
3. Convert uncertain assumptions to open questions
4. Ask: "What am I assuming to make this design work?"