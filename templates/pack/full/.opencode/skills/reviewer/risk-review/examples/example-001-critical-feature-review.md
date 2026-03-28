# Example 001: Critical Feature Risk Review

## Scenario Context

A developer has completed implementing a payment processing system upgrade. The reviewer (using risk-review skill) needs to assess technical risks before deployment.

### Developer Output Consumed (BR-002 Compliance)

```yaml
implementation-summary:
  goal_alignment:
    goal: "Upgrade payment processing to support new payment gateway"
    achieved: true
    deviations:
      - "Added retry mechanism for gateway timeouts"
  
  changed_files:
    - path: "src/services/PaymentService.ts"
      change_type: "modified"
      description: "New gateway integration with retry logic"
      lines_changed: { added: 120, deleted: 30 }
    - path: "src/controllers/PaymentController.ts"
      change_type: "modified"
      description: "New payment endpoints for new gateway"
      lines_changed: { added: 40, deleted: 10 }
    - path: "src/models/PaymentTransaction.ts"
      change_type: "modified"
      description: "Updated transaction model for new gateway fields"
      lines_changed: { added: 25, deleted: 5 }
  
  claimed_risk_mitigations:
    - claim: "Rollback tested - database migrations reversible"
    - claim: "Circuit breaker implemented for gateway calls"
    - claim: "New gateway has timeout configuration"
    - claim: "Monitoring alerts configured for payment failures"
  
  risks_acknowledged:
    - risk_id: "RISK-001"
      description: "Payment gateway availability affects order completion"
      level: "medium"
      mitigation: "Retry mechanism + circuit breaker"
```

### Risk Context from Task Dispatch

```yaml
risk_context:
  risk_level: "high"
  impact_area: "financial"
  critical_scenarios:
    - "Payment processing failure results in lost revenue"
    - "Double payment could result in customer disputes"
    - "Data inconsistency between order and payment"
  deployment_window: "Low-traffic period (2-4 AM)"
```

---

## Step-by-Step Risk Review Execution

### Step 1: Preparation

```yaml
risk_review_preparation:
  artifacts_read:
    - "implementation-summary (above)"
    - "risk-context (above)"
    - "src/services/PaymentService.ts"
    - "src/controllers/PaymentController.ts"
  
  review_focus:
    primary: "Payment failure impact and rollback capability"
    secondary: "Monitoring coverage and fault tolerance"
  
  br_002_acknowledgment:
    rollback_claim: "Developer claims rollback tested"
    reviewer_stance: "Hint only - independent verification required"
```

### Step 2: High-Risk Area Scan

```yaml
high_risk_areas_identified:
  - area: "Payment Processing Core"
    description: "Handles financial transactions - critical business function"
    impact_level: critical
    files:
      - "src/services/PaymentService.ts"
      - "src/controllers/PaymentController.ts"
      
  - area: "Database Transactions"
    description: "Payment status updates without transaction wrapper"
    impact_level: high
    finding: "Potential data consistency risk"
    
  - area: "External Service Integration"
    description: "New payment gateway dependency"
    impact_level: high
    finding: "External availability affects system"
```

### Step 3: Failure Scenario Analysis

#### Scenario 1: Gateway Timeout

```yaml
failure_scenario:
  name: "Payment Gateway Timeout"
  description: "New gateway becomes unresponsive during peak hours"
  
  code_reviewed: |
    async processPayment(order: Order): Promise<PaymentResult> {
      const gatewayResponse = await this.gateway.process(order.payment);
      // No timeout specified!
      if (gatewayResponse.success) {
        await this.updatePaymentStatus(order.id, 'PAID');
        return { success: true };
      }
      return { success: false };
    }
  
  impact_assessment:
    user_impact: "User sees 'processing' indefinitely, may retry"
    system_impact: "Thread pool exhaustion, cascading delays"
    blast_radius: "Payment service → Order service → User interface"
    recovery_time_estimate: "Minutes to hours (manual intervention)"
    
  likelihood: medium
  current_mitigation: "Developer claims circuit breaker implemented"
  br_002_verification:
    reviewer_action: "Searched for circuit breaker pattern"
    finding: "Circuit breaker present but NOT connected to timeout config"
    code_found: |
      this.circuitBreaker = new CircuitBreaker({
        failureThreshold: 5,
        resetTimeout: 30000
      });
      // BUT: gateway.process() has no timeout parameter!
```

#### Scenario 2: Data Consistency Failure

```yaml
failure_scenario:
  name: "Payment Status Update Without Transaction"
  description: "Payment succeeds but status update fails"
  
  code_reviewed: |
    async processPayment(order: Order): Promise<PaymentResult> {
      const gatewayResponse = await this.gateway.process(order.payment);
      
      if (gatewayResponse.success) {
        // SEPARATE CALLS - no transaction!
        await this.updatePaymentStatus(order.id, 'PAID');  
        await this.updateOrderStatus(order.id, 'COMPLETED');
        // If second update fails, payment is PAID but order is PENDING
        return { success: true };
      }
    }
  
  impact_assessment:
    user_impact: "Order shows pending but payment succeeded"
    system_impact: "Financial data inconsistency"
    blast_radius: "Payment database + Order database"
    recovery_time_estimate: "Hours to days (manual reconciliation)"
    
  likelihood: medium
  current_mitigation: "Developer claims atomic operations"
  br_002_verification:
    reviewer_action: "Reviewed database calls"
    finding: "Two separate async calls without transaction wrapper"
    conclusion: "Claim contradicted - NOT atomic"
```

#### Scenario 3: Double Payment

```yaml
failure_scenario:
  name: "Double Payment from User Retry"
  description: "User retries payment due to unclear feedback"
  
  code_reviewed: |
    async processPayment(order: Order): Promise<PaymentResult> {
      // No check for existing payment status!
      const gatewayResponse = await this.gateway.process(order.payment);
      ...
    }
  
  impact_assessment:
    user_impact: "Customer charged twice"
    system_impact: "Financial dispute, refund processing"
    blast_radius: "Customer service, refund system"
    recovery_time_estimate: "Days (manual refund)"
    
  likelihood: low
  current_mitigation: "None implemented"
  br_002_verification:
    reviewer_action: "Checked for idempotency check"
    finding: "No check if payment already processed for order"
```

### Step 4: Rollback Assessment

```yaml
rollback_capability:
  data_rollback:
    available: PARTIAL
    developer_claim: "Database migrations reversible"
    br_002_verification:
      reviewer_action: "Reviewed migration scripts"
      code_reviewed: |
        // Migration script
        ALTER TABLE payments ADD COLUMN gateway_transaction_id VARCHAR(64);
        // Rollback script exists
        ALTER TABLE payments DROP COLUMN gateway_transaction_id;
      finding: "Schema rollback available, but transaction data rollback unclear"
      conclusion: "Schema rollback verified, data rollback NOT verified"
      
    tested: UNVERIFIED
    complexity: moderate
    estimated_time: "30 minutes for schema, unknown for data"
    
  code_rollback:
    available: true
    method: "Git revert + deploy previous version"
    requires_manual_action: false
    
  missing_rollback_for:
    - "Completed transactions with new gateway"
    - "Gateway-specific transaction IDs"
```

### Step 5: Monitoring Coverage Check

```yaml
monitoring_coverage:
  covered_areas:
    - "Payment success rate (gateway provided)"
    - "Payment processing latency (gateway provided)"
    - "Basic error logging"
    
  gaps:
    - area: "Timeout detection"
      severity: major
      suggestion: "Add monitoring for gateway response times > threshold"
      br_002_verification: "Developer claimed timeout alerts - NOT found in config"
      
    - area: "Circuit breaker state changes"
      severity: minor
      suggestion: "Alert when circuit breaker opens"
      
    - area: "Payment-Order consistency"
      severity: major
      suggestion: "Add monitoring for orders with PAID payment but PENDING status"
      
    - area: "Double payment detection"
      severity: major
      suggestion: "Alert when same order processed multiple times"
```

### Step 6: Fault Tolerance Review

```yaml
fault_tolerance:
  mechanisms_present:
    - mechanism: retry
      location: "PaymentService.ts:45-60"
      effectiveness: adequate
      code_reviewed: |
        const retryOptions = { maxRetries: 3, delay: 1000 };
        // Standard retry pattern implemented
      
    - mechanism: circuit_breaker
      location: "PaymentService.ts:20"
      effectiveness: inadequate
      reason: "Not connected to timeout configuration"
      
    - mechanism: timeout
      location: "NONE"
      effectiveness: missing
      severity: major
      
  missing_mechanisms:
    - mechanism: "Timeout for gateway calls"
      recommended_location: "PaymentService.ts:processPayment"
      severity: major
      suggestion: "Add timeout: await this.gateway.process(order.payment, { timeout: 30000 })"
      
    - mechanism: "Idempotency check"
      recommended_location: "PaymentService.ts:processPayment"
      severity: major
      suggestion: "Check if payment already processed before calling gateway"
      
    - mechanism: "Transaction wrapper"
      recommended_location: "PaymentService.ts:processPayment"
      severity: blocker
      suggestion: "Wrap status updates in database transaction"
```

---

## Risk Review Report

```yaml
risk_review_report:
  dispatch_id: "DISPATCH-2024-003"
  task_id: "TASK-PAY-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-01-25T15:00:00Z"
  
  # BR-002 Compliance
  self_check_acknowledged:
    status: "Developer claims rollback tested, circuit breaker working, timeout configured"
    use: "Hints only, NOT evidence - independent verification required"
    verification_summary: "Multiple claims contradicted by code review"
  
  summary:
    overall_risk_level: high
    risk_summary: "Payment processing changes have critical data consistency risk, missing timeout, and monitoring gaps"
    confidence_level: medium
    
  high_risk_areas:
    - area: "Payment Processing Core"
      description: "Financial transactions - business critical"
      impact_level: critical
    - area: "External Gateway Integration"
      description: "Availability dependency"
      impact_level: high
      
  identified_risks:
    - risk_id: RISK-001
      category: data
      description: "Payment status updates without transaction - data consistency risk"
      severity: blocker
      impact:
        user_impact: "Order shows pending but payment succeeded"
        system_impact: "Financial data inconsistency"
        blast_radius: "Payment + Order databases"
        recovery_time_estimate: "Hours to days (manual reconciliation)"
      likelihood: medium
      current_mitigation: "Developer claims atomic operations"
      br_002_verification: "Reviewer found two separate async calls - NOT atomic"
      
    - risk_id: RISK-002
      category: availability
      description: "Gateway calls without timeout configuration"
      severity: major
      impact:
        user_impact: "Users see indefinite 'processing' state"
        system_impact: "Thread pool exhaustion"
        blast_radius: "Payment service → downstream services"
        recovery_time_estimate: "Minutes to hours"
      likelihood: medium
      current_mitigation: "Circuit breaker implemented"
      br_002_verification: "Circuit breaker present but not connected to timeout"
      
    - risk_id: RISK-003
      category: data
      description: "No idempotency check - double payment risk"
      severity: major
      impact:
        user_impact: "Customer charged twice"
        system_impact: "Financial disputes, refunds"
        blast_radius: "Customer service, refund processing"
        recovery_time_estimate: "Days"
      likelihood: low
      current_mitigation: "None"
      br_002_verification: "No check for existing payment status"
      
    - risk_id: RISK-004
      category: monitoring
      description: "Monitoring gaps for payment consistency"
      severity: major
      impact:
        user_impact: "Issues not detected proactively"
        system_impact: "Delayed incident response"
        blast_radius: "Operations team"
        recovery_time_estimate: "Increased detection latency"
      likelihood: high
      current_mitigation: "Developer claimed alerts configured"
      br_002_verification: "Timeout and consistency alerts NOT found"
      
  rollback_capability:
    data_rollback:
      available: PARTIAL
      method: "Schema rollback available, transaction data rollback unclear"
      tested: UNVERIFIED
      complexity: moderate
      estimated_time: "30 min schema, unknown data"
      br_002_verification: "Schema verified, data rollback NOT tested"
      
    code_rollback:
      available: true
      method: "Git revert"
      requires_manual_action: false
      
  monitoring_coverage:
    covered_areas:
      - "Gateway success rate"
      - "Gateway latency"
      - "Basic error logging"
    gaps:
      - area: "Timeout detection"
        severity: major
        suggestion: "Add response time alerts"
      - area: "Payment-Order consistency"
        severity: major
        suggestion: "Add consistency monitoring"
        
  fault_tolerance:
    mechanisms_present:
      - mechanism: retry
        effectiveness: adequate
      - mechanism: circuit_breaker
        effectiveness: inadequate
        reason: "Not connected to timeout"
        
    missing_mechanisms:
      - mechanism: "Timeout"
        severity: major
      - mechanism: "Idempotency check"
        severity: major
      - mechanism: "Transaction wrapper"
        severity: blocker
        
  # BR-007 Compliance
  review_coverage:
    risk_scenarios_analyzed:
      - "Gateway timeout"
      - "Data consistency failure"
      - "Double payment"
      - "Rollback capability"
      - "Monitoring coverage"
      - "Fault tolerance"
    scenarios_not_analyzed:
      - "Gateway-specific error handling"  # New gateway behavior unknown
      - "Race conditions in concurrent payments"  # Requires load testing
    not_analyzed_reason: "Gateway documentation incomplete, load test not performed"
    assumptions_made:
      - "New gateway behaves similarly to old gateway"
      - "Database transaction performance acceptable"
      
  recommendations:
    must_fix:
      - "Add transaction wrapper for payment status updates (RISK-001)"
      - "Wrap status updates in database transaction"
    should_fix:
      - "Add timeout configuration for gateway calls (RISK-002)"
      - "Add idempotency check before payment processing (RISK-003)"
      - "Add monitoring for payment-order consistency (RISK-004)"
    consider:
      - "Document rollback procedure for completed transactions"
      - "Add circuit breaker state change alerts"
    deploy_recommendations:
      - recommendation: "Staged deployment with payment validation monitoring"
        reason: "High financial impact risk"
      - recommendation: "Deploy during low-traffic window (2-4 AM)"
        reason: "Minimize blast radius if issues occur"
      - recommendation: "Have operations team on standby"
        reason: "Quick rollback capability needed"
        
  recommendation_to_next:
    action: reject
    next_steps:
      - "Fix blocker: Add transaction wrapper for data consistency"
      - "Fix major risks: timeout, idempotency, monitoring"
      - "Request security review for payment flow"
      - "Test rollback procedure"
      - "Re-review after fixes"
```

---

## Key Decisions Notes

### BR-002 Compliance
- Developer claims were systematically verified against actual code
- Multiple claims contradicted by independent verification:
  - "Atomic operations" → Found separate async calls
  - "Timeout configured" → Found no timeout parameter
  - "Alerts configured" → Found missing alert definitions
- All findings include `br_002_verification` showing how reviewer confirmed

### BR-004 Compliance
- RISK-001 (data consistency) = blocker (could cause financial loss)
- RISK-002, RISK-003, RISK-004 = major (significant impact)
- Severity based on actual impact assessment, not developer claims

### BR-007 Honest Disclosure
- Explicitly listed scenarios NOT analyzed (gateway behavior, race conditions)
- Documented assumptions about gateway behavior
- Confidence level noted as "medium" due to incomplete gateway documentation

---

## Lessons

1. **Risk claims require independent verification**: Developer said "rollback tested" - reviewer found rollback procedure unverified.
2. **Impact assessment is critical**: Data consistency risk could cause financial loss - must be blocker.
3. **BR-002 verification must be explicit**: Each finding shows how reviewer contradicted developer claim.
4. **Monitoring gaps are risks too**: Missing alerts means delayed detection = increased impact.
5. **Staged deployment reduces blast radius**: High-risk changes need careful deployment strategy.