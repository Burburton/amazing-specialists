# Anti-Example 001: Impact Blindness

## What This Anti-Example Looks Like

### ❌ Incorrect Risk Review (Impact Blindness)

```yaml
risk_review_report:
  dispatch_id: "DISPATCH-2024-003"
  task_id: "TASK-PAY-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-01-25T15:00:00Z"
  
  summary:
    overall_risk_level: low
    risk_summary: "Minor changes, tested by developer"
    
  identified_risks: []
  
  rollback_capability:
    data_rollback:
      available: true
      tested: true
      
  monitoring_coverage:
    covered_areas: ["Payment metrics"]
    gaps: []
    
  recommendations:
    must_fix: []
    should_fix: []
    consider: []
    
  recommendation_to_next:
    action: approve
    next_steps: ["Deploy as scheduled"]
```

## Why This Is Wrong

### Multiple BR Violations

#### BR-002 Violation: Trust Without Verification
The review blindly trusts developer claims:
- "tested by developer" - no independent verification
- "rollback tested" - reviewer did not verify
- No `br_002_verification` fields

#### BR-007 Violation: No Impact Analysis
The report shows no understanding of impact:
- "Minor changes" - but this is a payment system!
- No blast radius assessment
- No recovery time estimates
- No failure scenario analysis

### The Real Problem

The reviewer failed to detect critical risks in a financial system:

**Actual Code with Critical Issues**:

```typescript
// src/services/PaymentService.ts - What reviewer "missed"
async processPayment(order: Order): Promise<PaymentResult> {
  // CRITICAL: No timeout - could hang indefinitely
  const gatewayResponse = await this.gateway.process(order.payment);
  
  if (gatewayResponse.success) {
    // CRITICAL: Two separate calls without transaction
    await this.updatePaymentStatus(order.id, 'PAID');  
    await this.updateOrderStatus(order.id, 'COMPLETED');
    // If second fails: payment PAID, order PENDING = financial inconsistency
    
    // CRITICAL: No idempotency check
    // User could trigger multiple payments
    return { success: true };
  }
  
  // CRITICAL: No specific error handling
  return { success: false };
}
```

| Problem | Why It's Wrong | Impact |
|---------|----------------|--------|
| **"Low risk" for payment** | Financial system is always high risk | Critical failure potential |
| **Empty risks list** | Payment has multiple critical risks | False confidence |
| **Trust rollback claim** | No verification performed | Rollback may fail |
| **No failure analysis** | Didn't analyze what could fail | Issues missed |

### What This Allows

This type of blindness allows:
- Financial data inconsistency to occur
- Customer double charges
- System hang from gateway timeout
- No detection of payment failures
- No ability to recover from errors

**Real-world consequence**:
- Customer sees "payment processing" forever, retries
- Payment succeeds, order status update fails
- Customer charged twice
- Operations team unaware until customer complaint
- Manual reconciliation needed - hours to days

## How to Detect This Anti-Pattern

### Detection Checklist

- [ ] **Risk Level Check**: Is risk level appropriate for impact area?
- [ ] **Impact Assessment Check**: Are impacts analyzed (user, system, blast radius)?
- [ ] **Failure Scenarios Check**: Are failure scenarios listed?
- [ ] **Rollback Verification Check**: Is rollback independently verified?
- [ ] **Monitoring Gaps Check**: Are monitoring gaps identified?
- [ ] **BR-002 Check**: Is there independent verification documented?

### Warning Signs

```text
🚩 "Low risk" for financial/payment system
🚩 Empty identified_risks without justification
🚩 "Minor changes" for 120+ lines of core logic
🚩 Trusting developer claims without verification
🚩 No failure scenario analysis
🚩 No blast radius assessment
🚩 Review completed in under 15 minutes for payment system
```

## How to Fix This

### Step 1: Analyze Impact Area

```yaml
high_risk_areas:
  - area: "Payment Processing Core"
    description: "Handles financial transactions - critical business function"
    impact_level: critical
    
  - area: "External Gateway Integration"
    description: "Availability dependency"
    impact_level: high
```

### Step 2: Analyze Failure Scenarios

```yaml
failure_scenario:
  name: "Data Consistency Failure"
  description: "Payment succeeds but status update fails"
  impact:
    user_impact: "Order shows pending but payment succeeded"
    system_impact: "Financial data inconsistency"
    blast_radius: "Payment + Order databases"
    recovery_time_estimate: "Hours to days"
```

### Step 3: Independent Verification (BR-002)

```yaml
br_002_verification:
  developer_claim: "Atomic operations"
  reviewer_action: "Reviewed database calls"
  finding: "Two separate async calls without transaction wrapper"
  conclusion: "Claim contradicted - NOT atomic"
```

### Step 4: Honest Risk Level

```yaml
summary:
  overall_risk_level: high  # Not low!
  risk_summary: "Payment processing has critical data consistency risk, missing timeout"
```

## Corrected Example

### ✅ Correct Risk Review (BR-Compliant)

```yaml
risk_review_report:
  dispatch_id: "DISPATCH-2024-003"
  task_id: "TASK-PAY-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-01-25T15:00:00Z"
  
  # BR-002 Compliance
  self_check_acknowledged:
    status: "Developer claims rollback tested, atomic operations"
    use: "Hints only - independent verification required"
    verification_summary: "Multiple claims contradicted by code review"
  
  summary:
    overall_risk_level: high
    risk_summary: "Payment processing has critical data consistency risk, missing timeout, monitoring gaps"
    confidence_level: medium
    
  high_risk_areas:
    - area: "Payment Processing Core"
      description: "Financial transactions - business critical"
      impact_level: critical
      
  identified_risks:
    - risk_id: RISK-001
      category: data
      description: "Payment status updates without transaction"
      severity: blocker
      impact:
        user_impact: "Order pending but payment succeeded"
        system_impact: "Financial data inconsistency"
        blast_radius: "Payment + Order databases"
        recovery_time_estimate: "Hours to days"
      likelihood: medium
      br_002_verification: "Reviewer found two separate async calls"
      
    - risk_id: RISK-002
      category: availability
      description: "Gateway calls without timeout"
      severity: major
      impact:
        user_impact: "Indefinite processing state"
        system_impact: "Thread pool exhaustion"
        blast_radius: "Payment service downstream"
        recovery_time_estimate: "Minutes to hours"
      likelihood: medium
      br_002_verification: "No timeout parameter found in gateway call"
      
  rollback_capability:
    data_rollback:
      available: PARTIAL
      tested: UNVERIFIED
      br_002_verification: "Schema rollback verified, data rollback NOT tested"
      
  monitoring_coverage:
    gaps:
      - area: "Payment-Order consistency"
        severity: major
        suggestion: "Add consistency monitoring"
        
  recommendations:
    must_fix:
      - "Add transaction wrapper for payment status updates (RISK-001)"
    should_fix:
      - "Add timeout configuration (RISK-002)"
      - "Add consistency monitoring"
    deploy_recommendations:
      - recommendation: "Staged deployment during low-traffic"
        reason: "Minimize blast radius"
        
  recommendation_to_next:
    action: reject
    next_steps:
      - "Fix blocker risks"
      - "Re-review after fixes"
```

## Lesson

**Impact blindness in risk review can cause real financial loss.** A proper risk review must:
1. Analyze the impact area - financial systems are always high risk
2. Identify failure scenarios with real impact assessment
3. Verify claims independently (BR-002) - don't trust "tested by developer"
4. Assess blast radius - how far does the failure spread?
5. Estimate recovery time - how long to fix?
6. Check rollback capability - can we undo?
7. Identify monitoring gaps - will we know if it fails?

Risk blindness allows critical issues to slip through, potentially causing:
- Financial loss
- Customer disputes
- Extended downtime
- Manual recovery efforts

---

## References

- `specs/006-reviewer-core/spec.md` Section 6: BR-002, BR-007
- `quality-gate.md` Section 3.4: Reviewer Gate
- `examples/example-001-critical-feature-review.md` - Complete correct example