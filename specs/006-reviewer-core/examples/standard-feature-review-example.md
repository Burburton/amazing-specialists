# Standard Feature Review Example

## Example Metadata

| Field | Value |
|-------|-------|
| **Example Type** | Standard Feature Review Workflow |
| **Workflow Reference** | spec.md Section 5.1 Workflow 1 |
| **Skills Used** | code-review-checklist, spec-implementation-diff |
| **Artifacts Produced** | review-findings-report, acceptance-decision-record |
| **Key Feature** | Complete upstream artifact consumption (BR-001) |

---

## 1. Scenario Overview

### 1.1 Feature Being Reviewed

**Feature**: User Authentication System

**Implementation Summary** (from developer):
```yaml
implementation_summary:
  goal_alignment:
    goal: "Implement user authentication with JWT tokens"
    achieved: true
  
  changed_files:
    - path: "src/services/AuthService.ts"
      change_type: "added"
    - path: "src/controllers/AuthController.ts"
      change_type: "added"
    - path: "src/middleware/authMiddleware.ts"
      change_type: "added"
  
  known_issues:
    - issue_id: "ISSUE-001"
      description: "Token refresh not implemented"
      severity: "medium"
  
  risks:
    - risk_id: "RISK-001"
      description: "JWT secret management"
      level: "high"
```

### 1.2 Upstream Artifacts Consumed

| Artifact | Source | Key Fields Used |
|----------|--------|-----------------|
| design-note | architect | module-boundaries, risks-and-tradeoffs |
| implementation-summary | developer | goal_alignment, changed_files, known_issues, risks |
| self-check-report | developer | overall_status |
| verification-report | tester | pass_cases, failed_cases, coverage_gaps |
| regression-risk-report | tester | regression_surfaces, risk_ranking |

---

## 2. Reviewer Workflow Execution

### 2.1 Step 1: Consume Upstream Artifacts

**Consumed architect artifacts**:
```yaml
design_note:
  module_boundaries:
    - "AuthService should not directly access database"
    - "AuthController should only handle HTTP concerns"
  
  risks_and_tradeoffs:
    - risk: "JWT token storage in client"
      mitigation: "Use httpOnly cookies"
    - risk: "Secret key exposure"
      mitigation: "Environment variable injection"

open_questions:
  - question: "Should we support OAuth providers?"
    resolution: "Deferred to future iteration"
```

**Consumed developer artifacts**:
```yaml
implementation_summary:
  goal_alignment:
    goal: "Implement user authentication with JWT tokens"
    achieved: true
  
  changed_files:
    - src/services/AuthService.ts (added)
    - src/controllers/AuthController.ts (added)
    - src/middleware/authMiddleware.ts (added)
  
  known_issues:
    - issue_id: "ISSUE-001"
      description: "Token refresh not implemented"
      severity: "medium"
  
  risks:
    - risk_id: "RISK-001"
      description: "JWT secret management"
      level: "high"

self_check_report:
  overall_status: "PASS"
  checks_performed:
    - "All tests passing"
    - "No lint errors"
    - "Type check clean"
```

**Consumed tester artifacts**:
```yaml
verification_report:
  execution_summary:
    status: "COMPLETE"
    total_tests: 28
    passed: 28
    failed: 0
  
  coverage_gaps:
    - gap: "Token refresh flow"
      reason: "Known issue ISSUE-001"
      impact: "MEDIUM"
  
  confidence_level: "FULL"

regression_risk_report:
  regression_surfaces:
    - area: "Route middleware chain"
      risk_level: "low"
    - area: "Error handling paths"
      risk_level: "low"
```

### 2.2 Step 2: Execute code-review-checklist

**Review Surface**: src/services/AuthService.ts, src/controllers/AuthController.ts, src/middleware/authMiddleware.ts

**Checklist Execution**:

| Category | Items Checked | Findings |
|----------|---------------|----------|
| **Correctness** | Logic, error handling, edge cases | No blockers |
| **Completeness** | Spec coverage, error messages | 1 minor: Missing error message for expired token |
| **Consistency** | Naming, patterns, style | No findings |
| **Maintainability** | Code clarity, documentation | 2 minor: Missing JSDoc on public methods |
| **Security** | Input validation, secrets, auth | 1 major: JWT secret not validated on startup |
| **Performance** | Resource usage, efficiency | No findings |

**Severity-Classified Findings**:

```yaml
findings_by_severity:
  blocker: []
  
  major:
    - finding_id: "FIND-001"
      category: "Security"
      location: "src/services/AuthService.ts:15"
      description: "JWT secret not validated on application startup"
      impact: "Application may start with empty/invalid secret, causing auth failures"
      evidence: |
        Line 15: const JWT_SECRET = process.env.JWT_SECRET;
        No validation that JWT_SECRET is defined or valid format.
      suggestion: |
        Add startup validation:
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
          throw new Error('JWT_SECRET must be at least 32 characters');
        }
  
  minor:
    - finding_id: "FIND-002"
      category: "Maintainability"
      location: "src/services/AuthService.ts:45"
      description: "Missing JSDoc on generateToken method"
      impact: "Developers may not understand token format/expiration"
    
    - finding_id: "FIND-003"
      category: "Maintainability"
      location: "src/services/AuthService.ts:78"
      description: "Missing JSDoc on validateToken method"
    
    - finding_id: "FIND-004"
      category: "Completeness"
      location: "src/controllers/AuthController.ts:52"
      description: "Missing error message for expired token case"
      impact: "Users receive generic error instead of helpful message"
  
  note:
    - finding_id: "FIND-005"
      category: "Style"
      location: "src/middleware/authMiddleware.ts"
      description: "Consider extracting error messages to constants"
```

### 2.3 Step 3: Execute spec-implementation-diff

**Comparison: Spec vs Implementation**:

| Spec Requirement | Implementation Status | Evidence |
|------------------|----------------------|----------|
| User can login with email/password | ✅ Implemented | AuthService.authenticate() |
| JWT tokens returned on success | ✅ Implemented | AuthService.generateToken() |
| Token validation middleware | ✅ Implemented | authMiddleware.ts |
| Token expiration handling | ✅ Implemented | 24h expiration configured |
| Token refresh | ⚠️ Not implemented | Known issue ISSUE-001 |
| Logout functionality | ✅ Implemented | AuthController.logout() |
| Password hashing | ✅ Implemented | bcrypt used |
| Input validation | ✅ Implemented | Request validation in controller |

**Scope Mismatches**:
```yaml
scope_mismatches:
  missing_from_spec:
    - item: "Rate limiting on login endpoint"
      found_in_implementation: false
      impact: "NONE - Security improvement, not scope creep"
      recommendation: "Consider for future enhancement"
  
  scope_creep:
    - item: "None detected"
```

**Governance Alignment Check (AH-006)**:

```yaml
governance_alignment:
  canonical_documents_checked:
    - role-definition.md: "ALIGNED - Reviewer boundaries respected"
    - package-spec.md: "ALIGNED - 6-role terminology used"
    - io-contract.md: "ALIGNED - Artifact formats match"
    - quality-gate.md: "ALIGNED - Severity levels follow Section 2.2"
  
  role_boundaries:
    - boundary: "AuthService does not access database directly"
      status: "ALIGNED - Uses repository pattern"
    - boundary: "AuthController handles only HTTP concerns"
      status: "ALIGNED - Business logic in AuthService"
  
  terminology:
    check: "All role references use 6-role terms"
    status: "ALIGNED"
  
  path_resolution:
    - declared: "src/services/AuthService.ts"
      exists: true
    - declared: "src/controllers/AuthController.ts"
      exists: true
    - declared: "src/middleware/authMiddleware.ts"
      exists: true
  
  status_truthfulness:
    - completion_report_status: "Complete"
    - readme_status: "Updated with auth feature"
    - alignment: "ALIGNED"
```

### 2.4 Step 4: Classify Findings

**Finding Classification Summary**:

| Severity | Count | Blocking |
|----------|-------|----------|
| blocker | 0 | No |
| major | 1 | Yes (for unconditional accept) |
| minor | 3 | No |
| note | 1 | No |

**Known Issues Assessment**:
```yaml
known_issues_review:
  - issue_id: "ISSUE-001"
    description: "Token refresh not implemented"
    reviewer_assessment: "Acknowledged and documented"
    impact_on_acceptance: "Acceptable with documentation"
    recommendation: "Accept with condition: create follow-up task"
```

### 2.5 Step 5: Determine Decision State

**Decision Analysis**:

```yaml
decision_factors:
  positives:
    - "All 28 tests passing"
    - "No scope creep detected"
    - "Governance alignment verified"
    - "Module boundaries respected"
    - "Core authentication functionality complete"
  
  concerns:
    - "1 major security finding (JWT secret validation)"
    - "Token refresh not implemented (known issue)"
    - "3 minor documentation gaps"
  
  evidence_quality:
    tester_confidence: "FULL"
    self_check_result: "PASS"
    independent_review: "Conducted"
```

**Decision**: accept-with-conditions

**Rationale**:
- Core functionality meets spec requirements
- All tests pass with FULL tester confidence
- Major finding (JWT secret validation) should be fixed but not blocking
- Token refresh is documented known issue with acceptable deferral
- Minor issues do not affect functionality

---

## 3. Artifact Production

### 3.1 review-findings-report

```yaml
review_findings_report:
  review_target: "User Authentication System"
  
  reviewed_inputs:
    - artifact: "design-note"
      source: "architect"
      key_fields_consumed: ["module_boundaries", "risks_and_tradeoffs"]
    - artifact: "implementation-summary"
      source: "developer"
      key_fields_consumed: ["goal_alignment", "changed_files", "known_issues", "risks"]
    - artifact: "self-check-report"
      source: "developer"
      treatment: "Input, not substitute for independent review"
    - artifact: "verification-report"
      source: "tester"
      key_fields_consumed: ["pass_cases", "coverage_gaps", "confidence_level"]
    - artifact: "regression-risk-report"
      source: "tester"
      key_fields_consumed: ["regression_surfaces", "risk_ranking"]
  
  summary_judgment: |
    Authentication feature substantially meets specification.
    Core functionality implemented correctly with passing tests.
    One major security finding requires follow-up but not blocking.
    Token refresh deferred as documented known issue.
  
  findings_by_severity:
    blocker: []
    major:
      - finding_id: "FIND-001"
        category: "Security"
        location: "src/services/AuthService.ts:15"
        description: "JWT secret not validated on application startup"
        suggestion: "Add startup validation for JWT_SECRET"
    minor:
      - finding_id: "FIND-002"
        description: "Missing JSDoc on generateToken method"
      - finding_id: "FIND-003"
        description: "Missing JSDoc on validateToken method"
      - finding_id: "FIND-004"
        description: "Missing error message for expired token"
    note:
      - finding_id: "FIND-005"
        description: "Consider extracting error messages to constants"
  
  evidence_references:
    - file: "src/services/AuthService.ts"
      lines_reviewed: "1-120"
    - file: "src/controllers/AuthController.ts"
      lines_reviewed: "1-85"
    - file: "src/middleware/authMiddleware.ts"
      lines_reviewed: "1-45"
  
  scope_mismatches:
    missing_from_spec: []
    scope_creep: []
  
  quality_concerns:
    - concern: "JWT secret validation"
      severity: "major"
      recommendation: "Add startup check"
  
  governance_alignment_status: "ALIGNED"
  governance_conflicts: []
  
  open_questions: []
  
  recommended_next_action: "accept-with-conditions"
```

### 3.2 acceptance-decision-record

```yaml
acceptance_decision_record:
  target_feature: "User Authentication System"
  
  decision_state: "accept-with-conditions"
  
  decision_rationale: |
    1. Core authentication functionality meets specification requirements
    2. All 28 tests passing with FULL tester confidence
    3. No scope creep or governance conflicts detected
    4. Module boundaries and architectural constraints respected
    5. One major security finding (JWT secret validation) should be addressed
       but does not block core functionality
    6. Token refresh is documented known issue with acceptable deferral
  
  blocking_issues: []
  
  non_blocking_issues:
    - issue_id: "FIND-001"
      description: "JWT secret not validated on startup"
      severity: "major"
      recommended_action: "Create follow-up task for security hardening"
    - issue_id: "ISSUE-001"
      description: "Token refresh not implemented"
      severity: "medium"
      recommended_action: "Create follow-up task"
    - issue_id: "FIND-002, FIND-003"
      description: "Missing JSDoc documentation"
      severity: "minor"
      recommended_action: "Add documentation in future iteration"
  
  acceptance_conditions:
    - condition: "Create follow-up task for JWT secret validation"
      owner: "developer"
      priority: "high"
    - condition: "Create follow-up task for token refresh implementation"
      owner: "developer"
      priority: "medium"
    - condition: "Document token refresh limitation in README"
      owner: "docs"
      priority: "medium"
  
  downstream_recommendation:
    acceptance: "Accept feature with follow-up tasks"
    docs: "Update authentication documentation with limitations"
    security: "Review JWT secret management in deployment"
  
  reviewer_confidence_level: "HIGH"
  confidence_rationale: |
    - Complete upstream artifact consumption performed
    - Independent code review conducted with checklist
    - Spec-implementation diff verified
    - Governance alignment checked
    - Tester confidence is FULL
    - No blocking issues found
  
  governance_compliance: "COMPLIANT"
```

---

## 4. Handoff Summary

### 4.1 Artifacts Delivered

| Artifact | Status | Consumer |
|----------|--------|----------|
| review-findings-report | ✅ Complete | acceptance, docs, security |
| acceptance-decision-record | ✅ Complete | acceptance, management |

### 4.2 Decision Summary

**Decision**: accept-with-conditions

**Key Points**:
- ✅ Core functionality meets spec
- ✅ All tests passing
- ✅ No scope creep
- ✅ Governance aligned
- ⚠️ 1 major security finding (non-blocking)
- ⚠️ Token refresh deferred (documented)

**Follow-up Required**:
1. JWT secret validation (high priority)
2. Token refresh implementation (medium priority)

---

## 5. BR Compliance Summary

| BR | Compliance | Evidence |
|----|------------|----------|
| BR-001 | ✅ | Consumed all upstream artifacts systematically |
| BR-002 | ✅ | Self-check treated as input; independent review conducted |
| BR-003 | ✅ | Explicit decision state: accept-with-conditions |
| BR-004 | ✅ | All findings severity-classified |
| BR-005 | ✅ | N/A (no rejection) |
| BR-006 | ✅ | Governance alignment checked per AH-006 |
| BR-007 | ✅ | No code mutations during review |
| BR-008 | ✅ | Scope creep explicitly checked - none found |
| BR-009 | ✅ | Status truthfulness verified |
| BR-010 | ✅ | 6-role terminology used consistently |

---

## 6. Skills Used Reference

| Skill | Purpose | SKILL.md Location |
|-------|---------|-------------------|
| code-review-checklist | Systematic file review with checklist | `.opencode/skills/reviewer/code-review-checklist/SKILL.md` |
| spec-implementation-diff | Compare spec vs implementation | `.opencode/skills/reviewer/spec-implementation-diff/SKILL.md` |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial standard feature review example |