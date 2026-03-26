# 006-reviewer-core Downstream Interfaces

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `006-reviewer-core` |
| **Document Type** | Interface Specification |
| **Version** | 1.0.0 |
| **Created** | 2026-03-26 |
| **Status** | Draft |
| **Owner** | reviewer |
| **Aligned With** | `role-definition.md` Section 4 (reviewer) |

---

## 1. Overview

### 1.1 Handoff Philosophy

The reviewer role's primary mission is to **provide independent judgment and actionable feedback for downstream decision makers**. This document defines how reviewer hands off review artifacts to acceptance layer, docs, security, and developer (on reject) with clear decision states, evidence quality requirements, and severity classification.

**Core Principles:**

1. **Decision Clarity (BR-003)**: Every review ends with a clear decision state (accept/accept-with-conditions/reject/needs-clarification), not vague opinions.

2. **Evidence Quality (BR-004)**: Every finding backed by specific evidence. No "this looks wrong" without explanation.

3. **Severity Classification**: Every issue classified with proper severity (blocker/major/minor/note) per `quality-gate.md` Section 2.2.

4. **Actionability**: Reject decisions must include actionable fix items, not just complaints.

5. **Boundary Respect**: Reviewer provides judgment and recommendations, not implementation fixes.

### 1.2 Handoff Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       REVIEWER                              │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │ review-input    │  │ execution-review                │  │
│  │ - consume spec  │  │ - code review                   │  │
│  │ - consume test  │  │ - spec-implementation diff      │  │
│  │ - consume impl  │  │ - governance alignment check    │  │
│  └────────┬────────┘  └────────────┬────────────────────┘  │
│           │                        │                        │
│           ▼                        ▼                        │
│  ┌───────────────────────────────────────────────────┐     │
│  │ Output Artifacts                                  │     │
│  │ - review-report                                   │     │
│  │ - actionable-feedback-report (on reject)          │     │
│  │ - governance-alignment-report                     │     │
│  └────────────────────┬──────────────────────────────┘     │
└───────────────────────┼─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬───────────────┐
        ▼               ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ acceptance  │ │    docs     │ │  security   │ │  developer  │
│ (approve?)  │ │  (sync?)    │ │  (check?)   │ │  (fix?)     │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 2. Decision State Semantics (BR-003)

### 2.1 Decision States

Every review-report must conclude with one of four decision states:

| Decision State | Definition | When to Use | Downstream Action |
|----------------|------------|-------------|-------------------|
| **accept** | Implementation fully satisfies spec; no blocking issues; governance aligned | All acceptance criteria met; no must-fix issues; evidence quality sufficient | Proceed to acceptance |
| **accept-with-conditions** | Implementation acceptable with documented conditions/exceptions | Minor gaps acknowledged; non-blocking issues documented; risks acceptable with conditions | Proceed to acceptance with conditions recorded |
| **reject** | Implementation has blocking issues that must be fixed before acceptance | Must-fix issues exist; critical spec deviations; governance violations | Send back to developer |
| **needs-clarification** | Cannot determine accept/reject due to missing information | Ambiguous spec; unclear requirements; missing test evidence | Request clarification from upstream |

### 2.2 Decision State Format

```yaml
review_decision:
  decision: "accept | accept-with-conditions | reject | needs-clarification"
  
  rationale: "Brief explanation of why this decision was made"
  
  confidence_level: "HIGH | MEDIUM | LOW"
    # HIGH: Clear evidence, unambiguous spec
    # MEDIUM: Some ambiguity but reasonable judgment
    # LOW: Significant uncertainty, consider escalation
  
  conditions:  # Only for accept-with-conditions
    - condition: "What must be monitored/acknowledged"
      impact: "What happens if not addressed"
  
  blocking_issues:  # Only for reject
    - issue_id: "ISSUE-001"
      severity: "blocker | major"
      description: "What is wrong"
      fix_suggestion: "How to fix it"
  
  clarification_requests:  # Only for needs-clarification
    - question: "What needs clarification"
      context: "Why this is blocking the review"
```

### 2.3 Decision State Selection Guide

```yaml
decision_selection:
  # Use ACCEPT when:
  accept_conditions:
    - All spec requirements verified
    - Test evidence sufficient and passing
    - No blocker or major issues
    - Governance alignment verified
    - Residual risks documented and acceptable
  
  # Use ACCEPT-WITH-CONDITIONS when:
  accept_with_conditions_conditions:
    - Core requirements met
    - Minor issues documented but not blocking
    - Some gaps acknowledged with mitigation plan
    - Governance drift noted but acceptable
  
  # Use REJECT when:
  reject_conditions:
    - Must-fix issues exist (blocker or major)
    - Critical spec deviations
    - Test failures unaddressed
    - Governance violations (AH-006)
    - Evidence quality insufficient
  
  # Use NEEDS-CLARIFICATION when:
  needs_clarification_conditions:
    - Spec is ambiguous for key requirements
    - Missing test evidence for critical paths
    - Unclear whether implementation matches intent
    - Cannot determine severity without more context
```

---

## 3. Evidence Quality Requirements (BR-004)

### 3.1 Honesty Over False Confidence

**Prohibited (BR-004 Violation):**
- ❌ "Code looks fine" without specific observations
- ❌ "LGTM" (Looks Good To Me) without evidence
- ❌ "Should work" without traceability to spec
- ❌ Skipping governance alignment check (AH-006 violation)
- ❌ Reporting "no issues" when governance drift exists

**Required (BR-004 Compliant):**
- ✅ "Spec requirement X verified in file Y, line Z"
- ✅ "Issue: [specific code] violates [specific spec requirement]"
- ✅ "Evidence: [specific log/output/behavior]"
- ✅ "Governance check: Found conflict between spec and role-definition.md"

### 3.2 Evidence Format Requirements

| Evidence Type | Required Content | Example |
|---------------|------------------|---------|
| **Code Reference** | File path, line number, code snippet | `src/auth/AuthService.ts:45 - validateToken() crashes on null input` |
| **Spec Reference** | Spec section, requirement ID | `Spec Section 3.2.1 - REQ-AUTH-003 requires token expiration` |
| **Test Reference** | Test file, test name, result | `tests/unit/AuthService.test.ts - validateToken(null) FAILED` |
| **Governance Reference** | Document, section, conflict | `role-definition.md Section 4 - reviewer boundary violated` |

### 3.3 Finding Evidence Quality Levels

| Quality Level | Characteristics | Reviewer Action |
|---------------|-----------------|-----------------|
| **HIGH** | Specific file/line/spec references; Clear reproduction steps; Direct spec mapping | Can include in review-report as-is |
| **MEDIUM** | General code area; Some evidence; Reasonable inference | Include with confidence note |
| **LOW** | "Something feels wrong" without specifics | Do NOT include; request more context or escalate |

### 3.4 Evidence Evaluation Checklist

```yaml
evidence_quality_check:
  - check: "Does finding include specific file/line reference?"
    good_example: "AuthService.ts:45 - Null check missing before token validation"
    bad_example: "Token validation has issues"
  
  - check: "Does finding trace to spec requirement?"
    good_example: "Violates Spec Section 3.2.1 REQ-AUTH-003"
    bad_example: "This doesn't follow best practices"
  
  - check: "Is severity justified by impact?"
    good_example: "BLOCKER - Security vulnerability allows authentication bypass"
    bad_example: "MAJOR - Code could be improved"
  
  - check: "Is governance alignment checked? (AH-006)"
    good_example: "Governance: Aligned with role-definition.md Section 4"
    bad_example: "Governance: Not checked"
```

---

## 4. Severity Classification Model

### 4.1 Audit Severity Levels (from `quality-gate.md` Section 2.2)

| Severity | Definition | Example | Handling |
|----------|------------|---------|----------|
| **blocker** | Must fix; blocks milestone验收 | Critical spec deviation; forged verification; security vulnerability; governance violation | Immediate fix required |
| **major** | Affects downstream or causes understanding deviation | Canonical document conflict; README misleading; path error; terminology inconsistency | Must fix before acceptance |
| **minor** | Minor issue with improvement space | Slight terminology inconsistency; format suggestions; non-critical field missing | Suggest fix, non-blocking |
| **note** | Informational; not mandatory | Observations; optional improvements; background info | Record but don't require action |

### 4.2 Severity Selection Guide

```yaml
severity_selection:
  # BLOCKER - Must fix, blocks milestone
  blocker_criteria:
    - Critical security vulnerability
    - Spec requirement completely unimplemented
    - Forged or falsified test results
    - Governance violation affecting role boundaries
    - Data corruption or data loss risk
    - Authentication/authorization bypass
  
  # MAJOR - Must fix, affects downstream
  major_criteria:
    - Spec deviation (partial implementation)
    - Test failure on acceptance criteria
    - Canonical document conflict (role-definition.md, package-spec.md)
    - README status misleading (partial reported as complete)
    - Path resolution error (file exists but wrong path)
    - Terminology causing understanding deviation
    - Missing critical documentation sync
  
  # MINOR - Suggest fix, non-blocking
  minor_criteria:
    - Minor terminology inconsistency (no understanding impact)
    - Format improvement suggestions
    - Non-critical field missing
    - Code style issues
    - Minor documentation improvements
  
  # NOTE - Informational
  note_criteria:
    - Observations for future consideration
    - Optional improvement suggestions
    - Background context additions
    - "Nice to have" enhancements
```

### 4.3 Finding Categories (AH-006)

| Finding Type | Definition | Severity Example | Handling |
|--------------|------------|------------------|----------|
| **Implementation Gap** | Implementation doesn't satisfy spec | major/blocker | Require fix |
| **Governance Drift** | Feature deviates from governance baseline | major | Require alignment or document drift |
| **Documentation Inconsistency** | Inconsistency between documents | major | Require sync |
| **Path Mismatch** | Declared path doesn't resolve | major | Require correction |
| **Status Misrepresentation** | Status description misleading | major | Require honest disclosure |

---

## 5. Acceptance Layer Consumption Guide

### 5.1 What Acceptance Receives

| Artifact | Purpose | Primary Sections for Acceptance |
|----------|---------|--------------------------------|
| `review-report` | Make acceptance decision | `decision`, `rationale`, `confidence_level`, `findings_summary` |
| `governance-alignment-report` | Verify governance compliance | `alignment_status`, `conflicts`, `recommendations` |

### 5.2 Decision State Interpretation

| Decision | Acceptance Action | Conditions |
|----------|-------------------|------------|
| **accept** | Can proceed to milestone acceptance | None |
| **accept-with-conditions** | Proceed with documented conditions | Monitor conditions; record exceptions |
| **reject** | Send back to developer | Wait for fix and re-review |
| **needs-clarification** | Request clarification from upstream | May block milestone if critical |

### 5.3 Confidence Level Interpretation

| Confidence | Acceptance Guidance |
|------------|---------------------|
| **HIGH** | Strong evidence; clear spec mapping; proceed with confidence |
| **MEDIUM** | Some ambiguity; reasonable judgment; consider monitoring |
| **LOW** | Significant uncertainty; consider requesting additional verification |

### 5.4 Acceptance Decision Template

```yaml
acceptance_decision:
  based_on:
    review_report:
      decision: "accept-with-conditions"
      confidence_level: "HIGH"
      conditions:
        - "Minor performance optimization pending (ISSUE-003)"
        - "Documentation sync required for API changes"
    
    governance_alignment_report:
      alignment_status: "ALIGNED"
      conflicts: []
  
  decision: "ACCEPT_WITH_CONDITIONS"
  rationale: "Core requirements verified; conditions are acceptable for milestone"
  
  monitoring_items:
    - "ISSUE-003: Schedule for next sprint"
    - "API docs: Assign to docs role"
```

---

## 6. Docs Consumption Guide

### 6.1 What Docs Receives

| Artifact | Purpose | Primary Sections for Docs |
|----------|---------|---------------------------|
| `review-report` | Identify documentation sync needs | `documentation_impact`, `findings.documentation` |
| `governance-alignment-report` | Governance documentation sync | `governance_sync_needed`, `affected_documents` |

### 6.2 Documentation Impact Assessment

```yaml
documentation_impact:
  # Reviewer identifies docs impact from findings
  affected_areas:
    - area: "API documentation"
      change_type: "update"
      reason: "New endpoint added: /auth/refresh"
      priority: "must-sync"
    
    - area: "README.md"
      change_type: "update"
      reason: "Feature status changed"
      priority: "should-sync"
    
    - area: "role-definition.md"
      change_type: "none"
      reason: "No role boundary changes"
      priority: "N/A"
  
  governance_sync:
    - document: "README.md"
      section: "Feature Status"
      required_update: "Mark 006-reviewer-core as complete"
    
    - document: "AGENTS.md"
      section: "None"
      required_update: "No changes needed"
```

### 6.3 Docs Workflow from Review Findings

```
1. Read review-report.documentation_impact
   ↓ (understand what docs need updating)
2. Cross-reference with governance-alignment-report
   ↓ (check governance sync requirements)
3. Prioritize documentation updates
   ↓ (must-sync > should-sync > optional)
4. Create doc_update_report
   ↓ (document what was synced)
5. Hand off to acceptance
```

### 6.4 Documentation Finding Examples

**Compliant:**
```markdown
## Documentation Impact
| Area | Change Type | Reason | Priority |
|------|-------------|--------|----------|
| API docs | update | New endpoint /auth/refresh added | must-sync |
| README.md | update | Feature status change | should-sync |
```

**Non-Compliant (missing docs impact):**
```markdown
## Documentation Impact
None
```
(Only valid if truly no documentation changes needed)

---

## 7. Security Consumption Guide

### 7.1 What Security Receives

| Artifact | Purpose | Primary Sections for Security |
|----------|---------|------------------------------|
| `review-report` | Security-relevant findings | `security_findings`, `findings.security` |
| `governance-alignment-report` | Security governance check | `security_governance_status` |

### 7.2 Security-Relevant Finding Categories

| Category | Definition | Security Action |
|----------|------------|-----------------|
| **Authentication Issue** | Auth logic vulnerability | Trigger security role deep-dive |
| **Authorization Issue** | Permission/role check vulnerability | Trigger security role deep-dive |
| **Input Validation Issue** | Unvalidated user input | Trigger security role deep-dive |
| **Secret/Credential Issue** | Exposed or mishandled secrets | Immediate blocker; trigger security role |
| **Dependency Issue** | Vulnerable dependency | Assess CVE; trigger security role |
| **Data Exposure Issue** | PII or sensitive data exposed | Trigger security role |

### 7.3 Security Finding Format

```yaml
security_findings:
  - finding_id: "SEC-001"
    category: "Authentication Issue"
    severity: "blocker"
    description: "Token validation bypasses null check"
    location:
      file: "src/auth/AuthService.ts"
      line: 45
      code: "validateToken(input: string) { /* no null check */ }"
    
    impact: "Attacker can bypass authentication with null token"
    
    recommendation: "Trigger security role for detailed analysis"
    
    cwe_reference: "CWE-287"  # If applicable
```

### 7.4 Security Escalation Triggers

| Trigger | Severity | Action |
|---------|----------|--------|
| Auth/permission vulnerability found | blocker | Immediate security role escalation |
| Secret/credential exposed | blocker | Immediate security role escalation |
| Input validation issue | major+ | Security role review recommended |
| Dependency vulnerability | varies | Assess severity; escalate if high/critical |
| PII exposure risk | major+ | Security role review recommended |

---

## 8. Developer Consumption Guide (On Reject)

### 8.1 What Developer Receives

| Artifact | Purpose | Primary Sections for Developer |
|----------|---------|-------------------------------|
| `review-report` | Understand rejection | `decision`, `blocking_issues`, `rationale` |
| `actionable-feedback-report` | Fix guidance | `must_fix_items`, `fix_suggestions`, `verification_requirements` |

### 8.2 Actionable Feedback Report Format

```yaml
actionable_feedback_report:
  report_id: "AFB-006-001"
  review_decision: "reject"
  
  summary: "3 blocking issues found requiring fixes before acceptance"
  
  must_fix_items:
    - item_id: "FIX-001"
      severity: "blocker"
      category: "Implementation Gap"
      
      issue: "Token validation crashes on null input"
      
      location:
        file: "src/auth/AuthService.ts"
        line: 45
        current_code: |
          validateToken(input: string) {
            return jwt.verify(input, SECRET);
          }
      
      spec_reference: "Spec Section 3.2.1 - REQ-AUTH-003: Validate all inputs"
      
      fix_suggestion: |
        Add null/undefined check before jwt.verify:
        validateToken(input: string) {
          if (!input) throw new Error('Token required');
          return jwt.verify(input, SECRET);
        }
      
      verification: "Add unit test: validateToken(null) should throw"
    
    - item_id: "FIX-002"
      severity: "major"
      category: "Documentation Inconsistency"
      
      issue: "README status says 'complete' but spec shows partial implementation"
      
      location:
        file: "README.md"
        line: 50
      
      fix_suggestion: "Update status to 'partial' with known gaps documented"
      
      verification: "Reviewer will verify status accuracy"
  
  optional_improvements:
    - item_id: "OPT-001"
      severity: "minor"
      issue: "Consider adding input type validation"
      suggestion: "Use zod or similar for runtime type checking"
  
  verification_requirements:
    - "All must_fix_items must be addressed"
    - "Unit tests must pass for fixed items"
    - "Re-submit for review after fixes"
  
  non_goals:
    - "Do not change authentication algorithm"
    - "Do not add new features beyond fixing reported issues"
```

### 8.3 Developer Workflow on Reject

```
1. Read actionable_feedback_report.summary
   ↓ (understand rejection scope)
2. Review must_fix_items in priority order
   ↓ (blocker > major > minor)
3. Implement fixes per fix_suggestion
   ↓ (or propose alternative with justification)
4. Run verification per verification_requirements
   ↓ (ensure fixes work)
5. Update implementation-summary
   ↓ (document what was fixed)
6. Re-submit for review
```

### 8.4 Good vs Bad Feedback

**Good (Actionable):**
```markdown
## FIX-001 (blocker)
**Issue**: Token validation crashes on null input
**Location**: src/auth/AuthService.ts:45
**Fix**: Add null check before jwt.verify
**Verification**: Add unit test validateToken(null) → throws
```

**Bad (Not Actionable):**
```markdown
## Issue
Token validation has problems.
```

---

## 9. Coverage Gap Disclosure

### 9.1 Mandatory Review Coverage Disclosure

Every review-report must include:

```yaml
review_coverage:
  areas_reviewed:
    - area: "Code implementation"
      depth: "full"  # full | partial | sampling
      confidence: "HIGH"
    
    - area: "Test coverage"
      depth: "partial"
      confidence: "MEDIUM"
      gaps: ["Edge case tests for token refresh"]
    
    - area: "Governance alignment"
      depth: "full"
      confidence: "HIGH"
  
  areas_not_reviewed:
    - area: "Performance under load"
      reason: "No load testing environment"
      risk: "Performance degradation may occur"
    
    - area: "Integration with external services"
      reason: "External services mocked in tests"
      risk: "Integration issues may surface in production"
```

### 9.2 Review Depth Definitions

| Depth | Definition | When to Use |
|-------|------------|-------------|
| **full** | Every file/line/function reviewed | Critical paths; security-sensitive code |
| **partial** | Key areas reviewed; some areas sampled | Standard features; time constraints |
| **sampling** | Representative samples reviewed | Low-risk changes; large codebases |

### 9.3 Coverage Gap Examples

**Compliant:**
```markdown
## Coverage Gaps
| Area | Reason | Risk | Follow-up |
|------|--------|------|-----------|
| Load testing | No staging environment | Performance unknown | Schedule for post-release |
| External integrations | Mocked in tests | Integration issues may surface | Monitor in production |
```

**Non-Compliant:**
```markdown
## Coverage Gaps
None
```
(Only valid if truly comprehensive review was performed)

---

## 10. Artifact Consumption Summary Matrix

### 10.1 Per-Role Artifact Mapping

| Artifact | Section | acceptance | docs | security | developer |
|----------|---------|:----------:|:----:|:--------:|:---------:|
| **review-report** | decision | ● | ○ | ○ | ● |
| | rationale | ● | ○ | ○ | ● |
| | confidence_level | ● | ○ | ○ | ○ |
| | findings_summary | ● | ○ | ● | ● |
| | blocking_issues | ● | ○ | ● | ● |
| | documentation_impact | ○ | ● | ○ | ○ |
| | security_findings | ○ | ○ | ● | ○ |
| | coverage_gaps | ● | ○ | ○ | ○ |
| **actionable-feedback-report** | must_fix_items | ○ | ○ | ○ | ● |
| | fix_suggestions | ○ | ○ | ○ | ● |
| | verification_requirements | ○ | ○ | ○ | ● |
| | non_goals | ○ | ○ | ○ | ● |
| **governance-alignment-report** | alignment_status | ● | ● | ○ | ○ |
| | conflicts | ● | ● | ○ | ○ |
| | governance_sync_needed | ○ | ● | ○ | ○ |

**Legend:**
- ● = Primary consumer (directly uses this section)
- ○ = Secondary consumer (may reference this section)

### 10.2 Consumption Workflow by Role

#### Acceptance Workflow
```
1. Read review-report.decision
   ↓ (understand verdict)
2. Review rationale + confidence_level
   ↓ (understand reasoning)
3. Check governance-alignment-report.status
   ↓ (verify governance compliance)
4. Make acceptance decision
```

#### Docs Workflow
```
1. Read review-report.documentation_impact
   ↓ (understand docs changes needed)
2. Check governance-alignment-report.governance_sync_needed
   ↓ (identify governance docs to update)
3. Prioritize and execute documentation sync
```

#### Security Workflow
```
1. Read review-report.security_findings
   ↓ (identify security-relevant issues)
2. Assess severity and impact
   ↓ (determine escalation level)
3. Perform deep security analysis if needed
```

#### Developer Workflow (On Reject)
```
1. Read actionable-feedback-report.summary
   ↓ (understand rejection)
2. Review must_fix_items
   ↓ (understand what to fix)
3. Implement fixes per suggestions
   ↓ (address each item)
4. Verify fixes pass requirements
   ↓ (run tests)
5. Re-submit for review
```

---

## 11. Validation Checklist

### 11.1 Pre-Handoff Checklist (Reviewer)

Before delivering artifacts to downstream roles:

- [ ] `review-report` complete with decision state
- [ ] Decision state is one of: accept/accept-with-conditions/reject/needs-clarification (BR-003)
- [ ] All findings have severity classification (blocker/major/minor/note)
- [ ] All findings have evidence backing (BR-004)
- [ ] `actionable-feedback-report` created if decision is reject
- [ ] Documentation impact assessed for docs role
- [ ] Security findings flagged for security role
- [ ] Governance alignment checked (AH-006)
- [ ] Coverage gaps disclosed
- [ ] Confidence level justified

### 11.2 Post-Handoff Checklist (Downstream Roles)

**Acceptance:**
- [ ] Decision state understood
- [ ] Rationale reviewed
- [ ] Confidence level considered
- [ ] Governance alignment verified
- [ ] Acceptance decision documented

**Docs:**
- [ ] Documentation impact understood
- [ ] Governance sync requirements identified
- [ ] Documentation updates planned
- [ ] Priority assigned (must-sync vs should-sync)

**Security:**
- [ ] Security findings reviewed
- [ ] Severity assessed
- [ ] Escalation decision made
- [ ] Security analysis performed if needed

**Developer (on reject):**
- [ ] Rejection reasons understood
- [ ] Must-fix items identified
- [ ] Fix suggestions reviewed
- [ ] Fix plan created
- [ ] Verification requirements noted

---

## 12. Escalation Paths

### 12.1 From Downstream to Reviewer

```
Level 1: Direct @reviewer mention
         ↓ (unresolved after 1 review cycle)
Level 2: @reviewer + @architect mention
         ↓ (unresolved after 1 cycle)
Level 3: Package owner escalation
```

### 12.2 Escalation Triggers

| Issue | Escalation Level | Path |
|-------|------------------|------|
| Decision unclear or contradictory | Level 1 | @reviewer |
| Finding lacks evidence | Level 1 | @reviewer |
| Severity misclassified | Level 1 | @reviewer |
| Governance conflict unresolved | Level 2 | @reviewer + @architect |
| AH-006 violation detected | Level 2 | @reviewer + @architect |
| Spec-implementation conflict needs clarification | Level 2 | @reviewer + @architect |

### 12.3 Reviewer Escalation to Upstream

When reviewer needs to escalate:

```yaml
escalation:
  from_role: "reviewer"
  to_role: "architect" | "OpenClaw management"
  
  triggers:
    - "Spec is fundamentally ambiguous"
    - "Implementation conflict with governance that requires policy decision"
    - "Repeated reject cycles not converging"
    - "Trade-off decision beyond reviewer authority"
  
  format:
    escalation_id: "ESC-006-001"
    reason_type: "AMBIGUOUS_SPEC | GOVERNANCE_CONFLICT | REPEATED_FAILURE"
    summary: "What requires escalation"
    blocking_points: ["Specific items blocking review"]
    recommended_options: ["Option A", "Option B"]
```

---

## 13. References

- `specs/006-reviewer-core/spec.md` - Feature specification (Section 6 Business Rules, Section 7 Artifact Contracts)
- `specs/006-reviewer-core/role-scope.md` - Reviewer role scope (Section 5: Outputs)
- `role-definition.md` Section 4 - Reviewer role definition
- `role-definition.md` Section 5 - Docs role definition
- `role-definition.md` Section 6 - Security role definition
- `quality-gate.md` Section 2.2 - Findings severity definitions
- `io-contract.md` - I/O contract standards
- `docs/audit-hardening.md` - Enhanced audit requirements (AH-006)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial downstream interfaces guide aligned with role-definition.md Sections 4-6 |