# Anti-Example 002: Rubber-Stamp Approval

## What This Anti-Example Looks Like

### ❌ Incorrect Review Report (Rubber-Stamp Approval)

```yaml
review_report:
  dispatch_id: "DISPATCH-2024-001"
  task_id: "TASK-REG-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-01-15T14:30:00Z"
  
  summary:
    overall_decision: approve
    decision_reason: "Developer self-check passed 15/15 items, approving"
    
  issues: []
  
  recommendations:
    must_fix: []
    should_fix: []
    consider: []
    
  recommendation_to_next:
    action: approve
    next_steps: ["Merge"]
```

## Why This Is Wrong

### BR-002 Violation: Self-Check Is Not Independent Verification

This review report **directly violates BR-002** by using self-check as evidence:

| Problem | BR-002 Rule | Violation |
|---------|-------------|-----------|
| Decision based on self-check | "Self-check is hints, NOT evidence" | Decision explicitly says "self-check passed, approving" |
| No independent verification | "All claims must be independently verified" | No reviewer verification shown |
| Using wrong language | "Developer verified" is prohibited | Report uses self-check as proof |

### The Trust Problem

Developer self-check has **inherent conflict of interest**:

```
┌─────────────────┐
│   Developer     │
│  (Same person)  │
├─────────────────┤
│ - Writes code   │
│ - Self-checks   │
│ - Claims PASS   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Reviewer      │
│  (Different)    │
├─────────────────┤
│ ❌ Just accepts │
│ ❌ No verify    │
│ = Rubber stamp  │
└─────────────────┘
```

### What This Enables

Rubber-stamp approval enables:

| Scenario | Risk |
|----------|------|
| Developer made honest mistake | Bug ships to production |
| Developer hid known issue | Critical vulnerability ships |
| Developer misunderstood requirement | Wrong feature ships |
| Time pressure | Quality debt accumulates |

### Why Self-Check Cannot Replace Review

```yaml
# Developer self-check perspective
developer_self_check:
  mindset: "I think this works correctly"
  blind_spots: "Can't see own mistakes"
  time_pressure: "Want to ship"
  familiarity: "Too close to code"
  
# Reviewer perspective (what should happen)  
reviewer_verification:
  mindset: "Let me verify this independently"
  fresh_eyes: "Can see what developer missed"
  no_pressure: "Not responsible for original implementation"
  distance: "Can objectively evaluate"
```

## How to Detect This Anti-Pattern

### Detection Checklist

- [ ] **Evidence Source Check**: Does the decision reason cite developer or self-check?
- [ ] **Verification Check**: Are there specific findings from reviewer's own analysis?
- [ ] **BR-002 Field Check**: Is there `self_check_acknowledged` with proper disclaimer?
- [ ] **Spot-Check Check**: Did reviewer verify at least 3 self-check claims?
- [ ] **Code Reference Check**: Are there specific code locations reviewed by reviewer?

### Warning Signs

```text
🚩 "Developer confirmed..." or "Self-check passed..."
🚩 Decision reason references developer's claims
🚩 No code snippets from reviewer's own analysis
🚩 No br_002_verification notes
🚩 Approval without any reviewer-identified findings
🚩 Review time under 10 minutes for substantial changes
```

### The "Trust But Verify" Rule

Even if you trust the developer:

```
Trust the developer's intentions ≠ Skip independent verification

The review is FOR the system, not for catching "untrustworthy" developers.
Even honest, skilled developers make mistakes.
The review catches those mistakes.
```

## How to Fix This

### Step 1: Change the Mindset

```yaml
# ❌ Wrong mindset
wrong_mindset:
  thought: "Developer is good, so I'll trust their self-check"
  action: "Approve without verification"
  
# ✅ Correct mindset  
correct_mindset:
  thought: "Self-check shows what developer checked - I verify those claims independently"
  action: "Spot-check key claims, add own analysis"
```

### Step 2: Add BR-002 Compliance Section

```yaml
self_check_acknowledged:
  status: "Developer claims 15/15 checks passed"
  use: "Hints for review focus, NOT evidence"
  
  # What reviewer independently verified
  independent_verification:
    - self_check_claim: "Input validation is correct"
      reviewer_action: "Tested 5 invalid input patterns"
      result: "VERIFIED - all rejected correctly"
      
    - self_check_claim: "No security vulnerabilities"
      reviewer_action: "Code review + security checklist"
      result: "VERIFIED - no hardcoded secrets, proper sanitization"
      
    - self_check_claim: "Tests cover edge cases"
      reviewer_action: "Reviewed test file"
      result: "VERIFIED - 3 edge cases tested"
```

### Step 3: Add Own Findings

Even if agreeing with self-check, reviewer should add their own findings:

```yaml
issues:
  - id: ISS-001
    category: "代码质量"
    severity: minor
    description: "Potential improvement to error message clarity"
    location: "src/services/UserService.ts:45"
    suggestion: "Make error message more actionable"
    br_002_verification: "Reviewer independently identified during code review"
```

### Step 4: Use Correct Language

**Prohibited (BR-002 Violation):**
- ❌ "Developer verified this works"
- ❌ "Self-check passed, so approving"
- ❌ "No issues found by developer"
- ❌ "Trust the self-check results"

**Required (BR-002 Compliant):**
- ✅ "Reviewer independently verified..."
- ✅ "Self-check acknowledged, independent verification performed"
- ✅ "Verification results: X checked, Y verified"
- ✅ "Evidence: [reviewer's own analysis]"

## Corrected Example

### ✅ Correct Review Report (BR-002 Compliant)

```yaml
review_report:
  dispatch_id: "DISPATCH-2024-001"
  task_id: "TASK-REG-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-01-15T14:35:00Z"
  
  # BR-002 Compliance - Explicit disclaimer
  self_check_acknowledged:
    status: "Developer claims 15/15 checks passed"
    use: "Hints for review focus, NOT evidence"
    claims_reviewed:
      - claim: "Input validation implemented"
        reviewer_verified: true
        method: "Tested 5 edge cases - all rejected correctly"
      - claim: "No security issues"
        reviewer_verified: true
        method: "Code review + grep for hardcoded secrets"
      - claim: "Tests passing"
        reviewer_verified: true
        method: "Ran test suite locally - 12/12 passed"
  
  summary:
    overall_decision: approve
    decision_reason: "Reviewer independently verified key claims. Implementation matches design. Two minor suggestions noted."
    
  checklist_summary:
    total_checks: 30
    passed: 28
    failed: 0
    na: 2
    
  issues:
    - id: ISS-001
      category: "代码质量"
      severity: minor
      description: "Magic number in timeout configuration"
      location: "src/config/timeout.ts:15"
      code_snippet: |
        const DEFAULT_TIMEOUT = 30000;  // What unit? ms?
      suggestion: "Add unit in comment or use named constant"
      br_002_verification: "Reviewer independently identified during code review"
      
    - id: ISS-002
      category: "可维护性"
      severity: note
      description: "Good error handling pattern"
      location: "src/services/UserService.ts"
  
  positives:
    - description: "Clean architecture with proper separation"
      location: "src/services/"
    - description: "Comprehensive test coverage"
      location: "tests/"
    
  recommendations:
    must_fix: []
    should_fix: []
    consider:
      - "Consider adding unit comment to timeout constant (ISS-001)"
    
  review_coverage:
    files_reviewed:
      - "src/services/UserService.ts"
      - "src/controllers/UserController.ts"
      - "src/config/timeout.ts"
    files_not_reviewed: []
    not_reviewed_reason: "N/A"
    assumptions_made: []
    
  recommendation_to_next:
    action: approve
    next_steps:
      - "Ready to merge"
      - "Minor suggestions can be addressed in future iteration"
```

## Comparison: Rubber-Stamp vs Proper Review

| Aspect | Rubber-Stamp (Wrong) | Proper Review (Correct) |
|--------|---------------------|------------------------|
| Self-check usage | Evidence | Hints only |
| Verification | None | Independent |
| Decision basis | Developer claims | Reviewer evidence |
| Language | "Developer verified" | "Reviewer independently verified" |
| Findings | None (copied from self-check) | Reviewer's own analysis |
| Time | 5 minutes | 15-30 minutes |
| Value | None (false confidence) | Actual quality check |

## Lesson

**Self-check is hints, not evidence.** Reviewer exists to provide **independent verification**, not to rubber-stamp developer claims. Even when agreeing with the self-check results, reviewer must:

1. Explicitly acknowledge self-check as hints (BR-002)
2. Independently verify key claims
3. Add their own findings from independent analysis
4. Use correct language distinguishing self-check from reviewer verification
5. Provide evidence of actual review work done

A rubber-stamp review provides zero value - it creates false confidence without any actual quality improvement.

---

## References

- `specs/006-reviewer-core/spec.md` Section 6: BR-002 (Self-Check Is Not Independent Verification)
- `specs/004-developer-core/contracts/self-check-report-contract.md` - Self-check format
- `quality-gate.md` Section 3.4: Reviewer Gate
- `examples/example-001-feature-code-review.md` - Complete correct example with BR-002 compliance