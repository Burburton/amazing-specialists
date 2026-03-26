# Ambiguity Escalation Example

## Example Metadata

| Field | Value |
|-------|-------|
| **Example Type** | Ambiguity Escalation Workflow |
| **Workflow Reference** | spec.md Section 5.4 Workflow 4 |
| **Skills Used** | N/A (escalation workflow, not skill-driven) |
| **Artifacts Produced** | review-findings-report (with blocker), escalation-request |
| **Key Feature** | Proper escalation when reviewer cannot decide (BR-003) |

---

## 1. Scenario Overview

### 1.1 Feature Being Reviewed

**Feature**: Payment Gateway Integration (Feature 008)

**Implementation Summary** (from developer):
```yaml
implementation_summary:
  goal_alignment:
    goal: "Integrate with payment gateway for order processing"
    achieved: "unknown"
  
  changed_files:
    - path: "src/services/PaymentService.ts"
      change_type: "added"
    - path: "src/controllers/PaymentController.ts"
      change_type: "added"
  
  known_issues:
    - issue_id: "ISSUE-001"
      description: "Multiple payment providers supported, unclear which is primary"
      severity: "unknown"
```

### 1.2 Blockers Preventing Decision

| Blocker Type | Description | Prevents Decision Because |
|--------------|-------------|---------------------------|
| Spec vs Implementation Conflict | Spec says "Stripe integration", code supports multiple providers | Cannot verify if implementation matches intent |
| Insufficient Evidence | No test results for payment flows | Cannot verify functionality works |
| Design Constraint Conflict | Architect specified single provider, developer implemented multi-provider | Architectural constraint violated |

---

## 2. Reviewer Workflow Execution

### 2.1 Step 1: Consume Upstream Artifacts

**Consumed artifacts**:
```yaml
upstream_artifacts:
  design_note:
    provider: "architect"
    content:
      module_boundaries:
        - "PaymentService should support single payment provider"
        - "Payment processing must be idempotent"
      
      risks_and_tradeoffs:
        - decision: "Use Stripe as payment provider"
          rationale: "Industry standard, good documentation"
          alternatives_considered: ["PayPal", "Square"]
      
      open_questions:
        - question: "Should we support multiple payment providers?"
          resolution: "NO - Single provider (Stripe) for MVP"
```

**Key Discovery**:
```yaml
design_specification:
  payment_provider: "Stripe (single provider)"
  scope: "MVP - single provider only"
  architect_decision: "Explicitly rejected multi-provider support"
```

### 2.2 Step 2: Identify Spec vs Implementation Conflict

**Conflict Discovery**:

```yaml
spec_implementation_conflict:
  spec_requirement:
    source: "design-note"
    statement: "Use Stripe as payment provider (single provider for MVP)"
    architect_decision: "Rejected multi-provider support"
  
  implementation_reality:
    source: "src/services/PaymentService.ts"
    code_evidence: |
      // Line 15-25
      enum PaymentProvider {
        STRIPE = 'stripe',
        PAYPAL = 'paypal',
        SQUARE = 'square'
      }
      
      class PaymentService {
        private provider: PaymentProvider;
        
        constructor(provider: PaymentProvider) {
          this.provider = provider;
        }
        
        async processPayment(amount: number, provider?: PaymentProvider) {
          const selectedProvider = provider || this.provider;
          switch (selectedProvider) {
            case PaymentProvider.STRIPE:
              return this.processWithStripe(amount);
            case PaymentProvider.PAYPAL:
              return this.processWithPayPal(amount);
            case PaymentProvider.SQUARE:
              return this.processWithSquare(amount);
          }
        }
      }
  
  conflict_analysis:
    spec_says: "Single provider (Stripe)"
    implementation_does: "Multi-provider support (Stripe, PayPal, Square)"
    architect_intent: "Rejected multi-provider for MVP"
    developer_action: "Implemented multi-provider anyway"
  
  reviewer_cannot_decide:
    reason: |
      1. Spec clearly states single provider (Stripe)
      2. Architect explicitly rejected multi-provider
      3. Developer implemented multi-provider support
      
      Is this:
      - Scope creep (developer added unauthorized feature)?
      - Spec change (requirements changed without documentation)?
      - Design evolution (architect approved verbally)?
      
      Reviewer cannot determine intent without clarification.
```

### 2.3 Step 3: Identify Insufficient Evidence

**Evidence Gap Discovery**:

```yaml
insufficient_evidence:
  test_coverage:
    verification_report:
      status: "INCOMPLETE"
      payment_tests:
        - test: "Stripe payment flow"
          status: "NOT RUN"
          reason: "No sandbox credentials configured"
        - test: "PayPal payment flow"
          status: "NOT RUN"
          reason: "No sandbox credentials configured"
        - test: "Square payment flow"
          status: "NOT RUN"
          reason: "No sandbox credentials configured"
      
      confidence_level: "NONE"
      rationale: "Zero payment tests executed"
  
  self_check_report:
    status: "INCOMPLETE"
    notes: "Developer claims tested locally but no evidence provided"
  
  reviewer_cannot_verify:
    - item: "Payment processing works"
      evidence: "None - all tests blocked"
    - item: "Single provider mode works"
      evidence: "None - multi-provider implemented"
    - item: "Error handling works"
      evidence: "None - no test results"
```

### 2.4 Step 4: Identify Design Constraint Conflict

**Constraint Violation Discovery**:

```yaml
design_constraint_conflict:
  architect_constraint:
    source: "design-note"
    constraint: "PaymentService should support single payment provider"
    rationale: "MVP simplicity, reduced testing surface"
  
  implementation_violation:
    source: "src/services/PaymentService.ts"
    violation: "Implemented multi-provider support (3 providers)"
    added_complexity: |
      - 3 payment integration paths
      - Provider selection logic
      - Multiple SDK dependencies
      - Increased testing surface (3x)
  
  conflict_resolution_required:
    options:
      - option: "Revert to single provider (Stripe)"
        impact: "Remove PayPal and Square code"
      - option: "Update design to allow multi-provider"
        impact: "Architect must approve and document decision"
      - option: "Keep multi-provider but document deviation"
        impact: "Requires architect acknowledgment"
    
    reviewer_cannot_resolve:
      reason: "This is an architectural decision, not a code review finding"
      authority: "Architect or management must decide"
```

### 2.5 Step 5: Document Blocker

```yaml
blocker_documentation:
  blocker_id: "BLOCKER-AMB-001"
  blocker_type: "Ambiguity - Multiple Conflicts"
  
  summary: |
    Reviewer cannot make acceptance decision due to:
    1. Spec vs Implementation conflict (multi-provider)
    2. Insufficient evidence (no test results)
    3. Design constraint violation (architect constraint ignored)
  
  detailed_conflicts:
    conflict_1:
      type: "Spec vs Implementation Conflict"
      severity: "major"
      description: "Spec requires single provider, implementation has three"
      spec_reference: "design-note: Single provider (Stripe) for MVP"
      implementation_reference: "PaymentService.ts:15-45"
      question_for_architect: "Was multi-provider support approved?"
    
    conflict_2:
      type: "Insufficient Evidence"
      severity: "blocker"
      description: "No payment tests executed, zero verification evidence"
      evidence_reference: "verification-report: status INCOMPLETE"
      question_for_tester: "Why are tests not run?"
    
    conflict_3:
      type: "Design Constraint Conflict"
      severity: "major"
      description: "Architect specified single provider, constraint violated"
      constraint_reference: "design-note: PaymentService should support single provider"
      question_for_developer: "Why was constraint not followed?"
  
  why_decision_blocked:
    - "Cannot verify if spec changed or developer exceeded scope"
    - "Cannot verify functionality without test evidence"
    - "Cannot accept constraint violation without architect acknowledgment"
  
  decision_state_required: "needs-clarification"
```

### 2.6 Step 6: Classify Issue Type

```yaml
issue_classification:
  primary_issue: "Architectural Decision Required"
  
  issue_types:
    - type: "Spec Ambiguity"
      description: "Unclear if spec changed or implementation exceeded scope"
      resolution_owner: "architect"
      resolution_type: "Clarify intent"
    
    - type: "Process Violation"
      description: "Design constraint not followed without documented approval"
      resolution_owner: "architect + developer"
      resolution_type: "Document deviation or revert"
    
    - type: "Evidence Gap"
      description: "Testing incomplete, no verification evidence"
      resolution_owner: "tester"
      resolution_type: "Complete testing"
  
  escalation_required:
    reason: "Multiple issues requiring different role resolutions"
    cannot_self_resolve: true
```

### 2.7 Step 7: Escalate to Appropriate Roles

**Escalation Request**:

```yaml
escalation_request:
  escalation_id: "ESC-REV-001"
  from_role: "reviewer"
  to_roles: ["architect", "developer", "tester", "management"]
  
  summary: |
    Payment Gateway Integration review blocked due to multiple conflicts.
    Reviewer cannot make acceptance decision without clarification.
  
  blockers:
    - blocker_id: "BLOCKER-AMB-001"
      type: "Ambiguity"
      severity: "blocker"
      description: "Spec vs Implementation conflict with insufficient evidence"
  
  questions_requiring_answers:
    - question_id: "Q-001"
      target_role: "architect"
      question: "Was multi-provider support approved for MVP?"
      context: "Design-note says single provider (Stripe), but implementation supports Stripe, PayPal, and Square"
      impact: "Determines if this is scope creep or authorized change"
    
    - question_id: "Q-002"
      target_role: "developer"
      question: "Why was multi-provider implemented when spec said single provider?"
      context: "Architect constraint was explicit in design-note"
      impact: "Determines if process violation occurred"
    
    - question_id: "Q-003"
      target_role: "tester"
      question: "Why are payment tests not executed?"
      context: "Verification report shows all payment tests NOT RUN"
      impact: "Cannot verify payment functionality without tests"
    
    - question_id: "Q-004"
      target_role: "management"
      question: "Should we accept multi-provider support for MVP?"
      context: "Increases scope and testing surface"
      impact: "Product decision affecting timeline and risk"
  
  options_for_resolution:
    - option: "Revert to single provider (Stripe only)"
      actions:
        - "Remove PayPal and Square code paths"
        - "Run Stripe payment tests"
      pros: "Matches original spec, reduced complexity"
      cons: "Developer work discarded"
    
    - option: "Accept multi-provider, update documentation"
      actions:
        - "Architect approves deviation"
        - "Update design-note to reflect multi-provider"
        - "Complete testing for all providers"
      pros: "More flexible payment system"
      cons: "Increased scope, more testing required"
    
    - option: "Accept single provider implementation only"
      actions:
        - "Keep multi-provider code but only use Stripe"
        - "Disable other providers in configuration"
        - "Test Stripe flow only"
      pros: "Compromise - code exists but MVP uses single provider"
      cons: "Dead code, potential confusion"
  
  reviewer_recommendation: |
    Option 1 (revert to single provider) is recommended for MVP because:
    1. Matches original architectural decision
    2. Reduces testing surface and complexity
    3. Aligns with "single provider for MVP" rationale
    
    However, this is an architectural/product decision that
    reviewer cannot make unilaterally.
  
  required_by: "architect + management"
  
  deadline_for_response: "Within 2 business days"
  
  status_if_unresolved: "Feature remains in 'needs-clarification' state"
```

---

## 3. Artifact Production

### 3.1 review-findings-report (with Blocker)

```yaml
review_findings_report:
  review_target: "Payment Gateway Integration (Feature 008)"
  
  reviewed_inputs:
    - artifact: "design-note"
      source: "architect"
      key_conflict: "Single provider specified, multi-provider implemented"
    - artifact: "implementation-summary"
      source: "developer"
    - artifact: "verification-report"
      source: "tester"
      key_gap: "All payment tests NOT RUN"
  
  summary_judgment: |
    Review BLOCKED due to multiple conflicts requiring clarification.
    Cannot make acceptance decision until the following are resolved:
    1. Architectural intent clarification (single vs multi-provider)
    2. Evidence gap closure (payment tests required)
    3. Design constraint violation resolution
  
  findings_by_severity:
    blocker:
      - finding_id: "BLOCKER-AMB-001"
        category: "Ambiguity"
        description: "Cannot determine if implementation matches spec intent"
        requires_escalation: true
    
    major:
      - finding_id: "FIND-001"
        category: "Spec Conflict"
        description: "Spec says single provider, code has three"
      - finding_id: "FIND-002"
        category: "Design Constraint Violation"
        description: "Architect constraint not followed"
    
    minor: []
    note: []
  
  evidence_references:
    - file: "src/services/PaymentService.ts"
      lines: "15-45"
    - artifact: "design-note"
      section: "risks_and_tradeoffs"
  
  scope_mismatches:
    - item: "Multi-provider support"
      in_spec: "No (rejected for MVP)"
      in_implementation: "Yes (3 providers)"
      classification: "Potential scope creep - awaiting clarification"
  
  quality_concerns:
    - concern: "Zero test evidence for payment flows"
      severity: "blocker"
  
  governance_alignment_status: "PENDING"
  governance_conflicts: []
  
  open_questions:
    - question: "Was multi-provider approved?"
      target: "architect"
    - question: "Why constraint not followed?"
      target: "developer"
    - question: "Why tests not run?"
      target: "tester"
  
  recommended_next_action: "escalate"
```

### 3.2 acceptance-decision-record

```yaml
acceptance_decision_record:
  target_feature: "Payment Gateway Integration (Feature 008)"
  
  decision_state: "needs-clarification"
  
  decision_rationale: |
    Reviewer cannot make acceptance decision due to multiple unresolved conflicts:
    
    1. SPEC VS IMPLEMENTATION CONFLICT
       - Spec: Single payment provider (Stripe) for MVP
       - Implementation: Multi-provider support (Stripe, PayPal, Square)
       - Question: Was this change approved?
    
    2. INSUFFICIENT EVIDENCE
       - All payment tests: NOT RUN
       - Zero verification evidence for payment functionality
       - Cannot verify core feature works
    
    3. DESIGN CONSTRAINT VIOLATION
       - Architect constraint: Single provider
       - Implementation: Violated constraint
       - Question: Why was constraint ignored?
    
    These issues require clarification from architect, developer, and tester
    before a decision can be made.
  
  blocking_issues:
    - issue_id: "BLOCKER-AMB-001"
      description: "Spec vs Implementation conflict"
      severity: "blocker"
      requires_clarification_from: ["architect", "developer"]
    - issue_id: "BLOCKER-AMB-002"
      description: "No test evidence"
      severity: "blocker"
      requires_clarification_from: ["tester"]
  
  non_blocking_issues: []
  
  acceptance_conditions:
    - condition: "Architect clarifies single vs multi-provider intent"
      required_for: "decision"
    - condition: "Tester provides payment test results"
      required_for: "verification"
    - condition: "Developer explains constraint deviation"
      required_for: "process compliance"
  
  downstream_recommendation:
    acceptance: "Hold decision pending clarification"
    architect: "Clarify design intent"
    developer: "Provide context on implementation decisions"
    tester: "Complete payment testing"
    management: "Product decision if scope changed"
  
  reviewer_confidence_level: "LOW"
  confidence_rationale: |
    - Cannot verify spec alignment without architect clarification
    - Cannot verify functionality without test evidence
    - Cannot accept constraint violation without documented approval
    - Multiple roles must provide input before decision possible
  
  governance_compliance: "PENDING"
  
  escalation_reference: "ESC-REV-001"
```

---

## 4. Handoff Summary

### 4.1 Artifacts Delivered

| Artifact | Status | Consumer |
|----------|--------|----------|
| review-findings-report | ✅ Complete (with blocker) | acceptance, architect, developer, tester |
| acceptance-decision-record | ✅ Complete (needs-clarification) | acceptance, management |
| escalation-request | ✅ Complete | architect, developer, tester, management |

### 4.2 Escalation Summary

**Decision**: needs-clarification

**Blockers**: 2 (spec conflict, evidence gap)

**Roles Requiring Response**:
| Role | Question |
|------|----------|
| architect | Was multi-provider approved? |
| developer | Why was constraint not followed? |
| tester | Why are tests not run? |
| management | Accept scope change? |

**Next Action**: Await clarification before re-evaluation

---

## 5. BR-003 Compliance Demonstration

### 5.1 What NOT to Do

**Prohibited (BR-003 Violation)**:
```yaml
# ❌ WRONG: Force a decision without evidence
decision_state: "accept"
rationale: "Code looks reasonable, assume it works"
# Reviewer cannot accept without evidence
```

```yaml
# ❌ WRONG: Make architectural decision
decision_state: "accept"
rationale: "Multi-provider is better anyway, approve the change"
# Reviewer is not architect - cannot override design decisions
```

### 5.2 Correct Approach

**Required (BR-003 Compliant)**:
```yaml
# ✅ CORRECT: Acknowledge cannot decide
decision_state: "needs-clarification"

decision_rationale: |
  Cannot make acceptance decision because:
  1. Spec vs implementation conflict requires architect input
  2. No test evidence requires tester input
  3. Constraint violation requires process review
  
  Escalating for clarification.

escalation_request: "Created with specific questions for each role"
```

---

## 6. BR Compliance Summary

| BR | Compliance | Evidence |
|----|------------|----------|
| BR-001 | ✅ | Consumed all upstream artifacts, identified conflicts |
| BR-002 | ✅ | Did not rely on self-check; identified evidence gap |
| BR-003 | ✅ | **Explicit decision state: needs-clarification** |
| BR-004 | ✅ | All findings classified |
| BR-005 | ✅ | N/A (not rejection, needs clarification) |
| BR-006 | ✅ | Governance check pending clarification |
| BR-007 | ✅ | No code mutations |
| BR-008 | ✅ | Identified potential scope creep |
| BR-009 | ✅ | Status check pending |
| BR-010 | ✅ | 6-role terminology used |

---

## 7. Resolution Path

### 7.1 If Architect Confirms Single Provider

```yaml
resolution_path:
  architect_confirms_single_provider:
    decision: "Implementation does not match spec"
    action:
      - "Reject with actionable feedback"
      - "Generate actionable-feedback-report to remove multi-provider code"
      - "Re-run tests for single provider"
```

### 7.2 If Architect Approves Multi-Provider

```yaml
resolution_path:
  architect_approves_multi_provider:
    decision: "Spec changed, implementation aligned"
    action:
      - "Update design-note to reflect new decision"
      - "Complete testing for all providers"
      - "Re-review with updated spec"
```

### 7.3 If Evidence Gap Resolved

```yaml
resolution_path:
  tests_completed:
    if_passed:
      - "Verification evidence now available"
      - "Continue review with evidence"
    if_failed:
      - "Reject with actionable feedback"
      - "Generate actionable-feedback-report for failures"
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial ambiguity escalation example |