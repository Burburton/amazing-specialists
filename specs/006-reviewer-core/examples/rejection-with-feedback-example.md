# Rejection with Feedback Example

## Example Metadata

| Field | Value |
|-------|-------|
| **Example Type** | Rejection with Actionable Feedback Workflow |
| **Workflow Reference** | spec.md Section 5.2 Workflow 2 |
| **Skills Used** | code-review-checklist, spec-implementation-diff, reject-with-actionable-feedback |
| **Artifacts Produced** | review-findings-report, acceptance-decision-record, actionable-feedback-report |
| **Key Feature** | Actionable rejection with specific remediation (BR-005) |

---

## 1. Scenario Overview

### 1.1 Feature Being Reviewed

**Feature**: Order Processing System

**Implementation Summary** (from developer):
```yaml
implementation_summary:
  goal_alignment:
    goal: "Implement order processing with validation"
    achieved: true
  
  changed_files:
    - path: "src/services/OrderService.ts"
      change_type: "added"
    - path: "src/controllers/OrderController.ts"
      change_type: "added"
    - path: "src/models/Order.ts"
      change_type: "added"
  
  known_issues:
    - issue_id: "ISSUE-001"
      description: "Order cancellation not implemented"
      severity: "low"
  
  risks:
    - risk_id: "RISK-001"
      description: "Concurrent order modification"
      level: "medium"
```

### 1.2 Blocking Findings Identified

During review, the following blocking issues were discovered:

| Finding | Severity | Blocking Reason |
|---------|----------|-----------------|
| SQL injection vulnerability | blocker | Security vulnerability |
| Missing input validation | blocker | Data integrity risk |
| No error handling for database failures | major | System stability |

---

## 2. Reviewer Workflow Execution

### 2.1 Step 1: Consume Upstream Artifacts

**Consumed artifacts**:
```yaml
upstream_artifacts:
  design_note:
    module_boundaries:
      - "OrderService should not directly execute SQL"
      - "All database operations through repository"
  
  implementation_summary:
    goal_alignment:
      goal: "Implement order processing with validation"
      achieved: true
  
  verification_report:
    execution_summary:
      status: "PARTIAL"
      total_tests: 15
      passed: 12
      failed: 3
    failed_cases:
      - test: "Order creation with invalid input"
        status: "FAILED"
        reason: "No validation error returned"
```

### 2.2 Step 2: Execute code-review-checklist

**Critical Findings**:

```yaml
findings_by_severity:
  blocker:
    - finding_id: "BLOCKER-001"
      category: "Security"
      location: "src/services/OrderService.ts:45"
      description: "SQL injection vulnerability in order query"
      impact: "Attacker can execute arbitrary SQL commands"
      evidence: |
        Line 45: const query = `SELECT * FROM orders WHERE id = ${orderId}`;
        Direct string interpolation in SQL query.
        Input 'orderId' is not sanitized or parameterized.
      
    - finding_id: "BLOCKER-002"
      category: "Security"
      location: "src/controllers/OrderController.ts:28"
      description: "No input validation on order creation"
      impact: "Malformed or malicious data can be inserted"
      evidence: |
        Line 28: const order = await orderService.create(req.body);
        req.body is passed directly without validation.
        No schema validation, type checking, or sanitization.
  
  major:
    - finding_id: "MAJOR-001"
      category: "Reliability"
      location: "src/services/OrderService.ts:78"
      description: "No error handling for database failures"
      impact: "Application crashes on database errors"
      evidence: |
        Line 78: const result = await db.query(query);
        No try-catch around database operation.
        Database errors will propagate as unhandled exceptions.
    
    - finding_id: "MAJOR-002"
      category: "Correctness"
      location: "src/services/OrderService.ts:52"
      description: "Order status not validated against allowed values"
      impact: "Invalid status values can be set"
  
  minor:
    - finding_id: "MINOR-001"
      category: "Maintainability"
      location: "src/models/Order.ts:15"
      description: "Missing JSDoc on Order model"
```

### 2.3 Step 3: Classify Blocking Findings

**Blocker Classification**:

| Blocker | Type | Removable by Developer | Requires Architect |
|---------|------|------------------------|---------------------|
| SQL injection | Security | Yes (parameterize query) | No |
| Missing validation | Security | Yes (add validation) | No |

**Both blockers are resolvable by developer without architect involvement.**

### 2.4 Step 4: Generate actionable-feedback-report

**Actionable Feedback Report**:

```yaml
actionable_feedback_report:
  issue_summary: |
    Order Processing System rejected due to 2 blocking security vulnerabilities
    and 2 major reliability issues. Implementation cannot be accepted until
    blockers are resolved.
  
  affected_files_artifacts:
    - file: "src/services/OrderService.ts"
      issues: ["BLOCKER-001", "MAJOR-001", "MAJOR-002"]
    - file: "src/controllers/OrderController.ts"
      issues: ["BLOCKER-002"]
  
  why_it_matters: |
    Security vulnerabilities (SQL injection, missing validation) expose the
    application to attacks and data corruption. Reliability issues cause
    system instability under error conditions.
  
  must_fix_items:
    - item_id: "MUST-001"
      issue_reference: "BLOCKER-001"
      title: "Fix SQL injection vulnerability"
      
      problem: |
        Direct string interpolation in SQL query allows SQL injection.
      
      why_it_matters: |
        Attackers can execute arbitrary SQL, potentially:
        - Extracting sensitive data
        - Modifying or deleting records
        - Gaining administrative access
      
      required_correction: |
        Use parameterized queries:
        
        Before (vulnerable):
        const query = `SELECT * FROM orders WHERE id = ${orderId}`;
        
        After (secure):
        const query = 'SELECT * FROM orders WHERE id = ?';
        const result = await db.query(query, [orderId]);
      
      expected_verification: |
        1. Run SQL injection test: 
           POST /orders with id: "1; DROP TABLE orders;--"
        2. Verify query is parameterized (not interpolated)
        3. Run security scanner (sqlmap or similar)
      
      closure_criteria: |
        - Parameterized query implemented
        - SQL injection test passes
        - Security scanner shows no SQLi vulnerabilities
    
    - item_id: "MUST-002"
      issue_reference: "BLOCKER-002"
      title: "Add input validation on order creation"
      
      problem: |
        Request body is passed directly to service without validation.
      
      why_it_matters: |
        Missing validation allows:
        - Injection of unexpected fields
        - Type confusion attacks
        - Data integrity violations
      
      required_correction: |
        Add validation schema using a validation library:
        
        // src/validators/orderValidator.ts
        import { z } from 'zod';
        
        export const createOrderSchema = z.object({
          customerId: z.string().uuid(),
          items: z.array(z.object({
            productId: z.string().uuid(),
            quantity: z.number().int().positive()
          })).min(1),
          shippingAddress: z.object({
            street: z.string().min(1),
            city: z.string().min(1),
            zipCode: z.string().regex(/^\d{5}(-\d{4})?$/)
          })
        });
        
        // In controller:
        const validatedData = createOrderSchema.parse(req.body);
        const order = await orderService.create(validatedData);
      
      expected_verification: |
        1. Test with invalid customerId: expect 400 error
        2. Test with negative quantity: expect 400 error
        3. Test with missing fields: expect 400 error
        4. Test with valid data: expect 201 created
      
      closure_criteria: |
        - Validation schema defined
        - All invalid inputs return 400
        - Valid inputs accepted
  
  should_fix_items:
    - item_id: "SHOULD-001"
      issue_reference: "MAJOR-001"
      title: "Add error handling for database failures"
      priority: "high"
      
      problem: "No try-catch around database operations"
      
      suggested_correction: |
        Wrap database operations in try-catch:
        
        try {
          const result = await db.query(query);
          return result;
        } catch (error) {
          logger.error('Database operation failed', { error, query });
          throw new DatabaseError('Failed to process order');
        }
    
    - item_id: "SHOULD-002"
      issue_reference: "MAJOR-002"
      title: "Validate order status against allowed values"
      priority: "medium"
      
      suggested_correction: |
        Add status enum validation:
        
        const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered'] as const;
        type OrderStatus = typeof ORDER_STATUSES[number];
        
        if (!ORDER_STATUSES.includes(status)) {
          throw new ValidationError(`Invalid status: ${status}`);
        }
  
  residual_risks:
    - risk: "Concurrent order modification (RISK-001)"
      status: "Acknowledged - not blocking"
      recommendation: "Address in future iteration with optimistic locking"
  
  suggested_owner_role: "developer"
  
  re_review_criteria: |
    Re-review required after MUST-001 and MUST-002 are resolved.
    Reviewer will verify:
    1. SQL injection vulnerability fixed
    2. Input validation implemented
    3. All tests passing
    4. Security scan clean
  
  closure_checklist:
    - "[ ] MUST-001: SQL injection fixed and verified"
    - "[ ] MUST-002: Input validation implemented and tested"
    - "[ ] SHOULD-001: Error handling added (recommended)"
    - "[ ] SHOULD-002: Status validation added (recommended)"
    - "[ ] All tests passing"
    - "[ ] Re-review requested"
```

### 2.5 Step 5: Produce acceptance-decision-record

```yaml
acceptance_decision_record:
  target_feature: "Order Processing System"
  
  decision_state: "reject"
  
  decision_rationale: |
    Feature rejected due to 2 blocking security vulnerabilities:
    
    1. SQL injection vulnerability (BLOCKER-001)
       - Direct string interpolation in SQL query
       - Allows arbitrary SQL execution
       - Must be fixed before acceptance
    
    2. Missing input validation (BLOCKER-002)
       - No validation on request body
       - Allows malformed/malicious data injection
       - Must be fixed before acceptance
    
    Additionally, 2 major issues were identified:
    - No error handling for database failures
    - Missing status validation
    
    These issues prevent the feature from being accepted in its current state.
    actionable-feedback-report has been generated with specific remediation steps.
  
  blocking_issues:
    - issue_id: "BLOCKER-001"
      description: "SQL injection vulnerability"
      severity: "blocker"
      remediation: "Use parameterized queries"
    - issue_id: "BLOCKER-002"
      description: "Missing input validation"
      severity: "blocker"
      remediation: "Add validation schema"
  
  non_blocking_issues:
    - issue_id: "MAJOR-001"
      description: "No error handling for database failures"
      severity: "major"
    - issue_id: "MAJOR-002"
      description: "Missing status validation"
      severity: "major"
    - issue_id: "MINOR-001"
      description: "Missing JSDoc documentation"
      severity: "minor"
  
  acceptance_conditions: []
  # No conditions - feature must be reworked
  
  downstream_recommendation:
    developer: "Review actionable-feedback-report and implement must-fix items"
    acceptance: "Track rejection and await re-review request"
  
  reviewer_confidence_level: "HIGH"
  confidence_rationale: |
    - Clear security vulnerabilities identified
    - Specific evidence provided for each finding
    - Remediation steps are concrete and actionable
    - Re-review criteria well-defined
  
  governance_compliance: "COMPLIANT"
```

---

## 3. Handoff to Developer

### 3.1 Artifacts Delivered

| Artifact | Status | Consumer |
|----------|--------|----------|
| review-findings-report | ✅ Complete | developer, acceptance |
| acceptance-decision-record | ✅ Complete | acceptance, management |
| actionable-feedback-report | ✅ Complete | developer |

### 3.2 Rejection Summary

**Decision**: reject

**Blocking Issues**: 2 (SQL injection, missing validation)

**Must-Fix Items**:
1. MUST-001: Fix SQL injection (parameterized queries)
2. MUST-002: Add input validation (validation schema)

**Should-Fix Items**:
1. SHOULD-001: Add error handling
2. SHOULD-002: Add status validation

**Re-review Required**: Yes, after must-fix items resolved

---

## 4. BR-005 Compliance Demonstration

### 4.1 What NOT to Do

**Prohibited (BR-005 Violation)**:
```yaml
# ❌ WRONG: Vague rejection
feedback: "The code has security issues. Please fix them."
# No specifics, no remediation guidance
```

```yaml
# ❌ WRONG: Missing verification method
must_fix:
  - issue: "SQL injection"
    fix: "Use parameterized queries"
    # Missing: How to verify the fix works
```

### 4.2 Correct Approach

**Required (BR-005 Compliant)**:
```yaml
# ✅ CORRECT: Actionable rejection
must_fix_items:
  - item_id: "MUST-001"
    problem: "Direct string interpolation in SQL query"
    why_it_matters: "Allows SQL injection attacks"
    required_correction: "Use parameterized queries with code example"
    expected_verification: "Run SQL injection test, security scanner"
    closure_criteria: "Parameterized query implemented, tests pass"
```

---

## 5. BR Compliance Summary

| BR | Compliance | Evidence |
|----|------------|----------|
| BR-001 | ✅ | Consumed all upstream artifacts |
| BR-002 | ✅ | Independent review beyond self-check |
| BR-003 | ✅ | Explicit decision state: reject |
| BR-004 | ✅ | All findings severity-classified |
| BR-005 | ✅ | **Actionable rejection with specific remediation** |
| BR-006 | ✅ | Governance alignment checked |
| BR-007 | ✅ | No code mutations - feedback provided instead |
| BR-008 | ✅ | Scope checked - no creep |
| BR-009 | ✅ | Status verified |
| BR-010 | ✅ | 6-role terminology used |

---

## 6. Skills Used Reference

| Skill | Purpose | SKILL.md Location |
|-------|---------|-------------------|
| code-review-checklist | Systematic file review | `.opencode/skills/reviewer/code-review-checklist/SKILL.md` |
| spec-implementation-diff | Compare spec vs implementation | `.opencode/skills/reviewer/spec-implementation-diff/SKILL.md` |
| reject-with-actionable-feedback | Generate actionable rejection | `.opencode/skills/reviewer/reject-with-actionable-feedback/SKILL.md` |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial rejection with feedback example |