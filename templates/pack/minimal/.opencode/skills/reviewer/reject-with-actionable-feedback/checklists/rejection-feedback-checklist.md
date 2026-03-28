# Rejection Feedback Checklist

Use this checklist to ensure rejection feedback meets BR-005 and BR-007 requirements.

---

## Pre-Rejection Checklist

Before deciding to reject, verify:

### Issue Classification
- [ ] All issues have been identified through systematic review
- [ ] Issues are classified by severity (critical, high, medium, low)
- [ ] Issues are categorized (security, correctness, quality, performance)
- [ ] Root cause is understood (not just symptoms)

### Reject vs Escalate Decision
- [ ] Issues can be fixed by developer through code changes → **Reject**
- [ ] Issue requires product/architectural decision → **Escalate**
- [ ] Issue requires security team input → **Escalate**
- [ ] Issue is a constraint/requirement conflict → **Escalate**

### Scope Definition
- [ ] What was reviewed is clearly documented
- [ ] What was NOT reviewed is acknowledged
- [ ] Rationale for scope is provided

---

## Must-Fix Verification Checklist

For each must-fix item, verify ALL of the following:

### Issue Definition
- [ ] **ID**: Unique identifier (e.g., MF-001)
- [ ] **Title**: Clear, concise summary of the issue
- [ ] **Category**: security | correctness | performance | compliance
- [ ] **Severity**: critical | high
- [ ] **Location**: Exact file path and line number

### Issue Explanation
- [ ] **Description**: What exactly is wrong
- [ ] **Code snippet**: Shows the problematic code
- [ ] **Issue explanation**: Why this is a problem
- [ ] **Rationale**: Why it MUST be fixed (security risk, spec violation, etc.)

### Remediation Guidance (BR-005)
- [ ] **How to fix**: Step-by-step remediation instructions
- [ ] **Code example**: Shows the correct approach
- [ ] **Code example is example**: Marked as example, not copy-paste solution
- [ ] **Verification method**: How to confirm the fix works
- [ ] **Estimated effort**: Time estimate for the fix

### Closure Criteria
- [ ] **Closure criteria defined**: Clear pass/fail conditions
- [ ] **Testable**: Criteria can be objectively verified
- [ ] **Complete**: Developer knows exactly when done

---

## Actionability Verification Checklist (BR-005)

Verify the feedback is actionable by checking:

### Specificity
- [ ] Each issue has a specific location (file + line)
- [ ] Problem is clearly described (not "needs improvement")
- [ ] Impact is explained (why it matters)

### Remediation Quality
- [ ] Fix instructions are concrete, not abstract
- [ ] Code examples are provided for code-level issues
- [ ] Alternative approaches are suggested if applicable
- [ ] Trade-offs are explained if multiple solutions exist

### Verification Quality
- [ ] Verification steps are specific and executable
- [ ] Expected outcomes are clearly stated
- [ ] Tools/commands needed are specified

### Completeness
- [ ] Developer has all information needed to fix
- [ ] No critical information is left as "you should know"
- [ ] Context is provided for complex issues

---

## BR-007 Compliance Checklist (No Code Mutation)

Verify the reviewer is NOT violating role boundaries:

### During Review
- [ ] **Reviewer did NOT edit source files**
- [ ] **Reviewer did NOT commit changes to the repo**
- [ ] **Reviewer did NOT push to the developer's branch**
- [ ] **Code examples are in feedback, not in source files**

### Code Examples
- [ ] Code examples are clearly marked as examples
- [ ] Examples are teaching tools, not direct implementations
- [ ] Developer is expected to understand and implement

### Role Boundaries
- [ ] Reviewer identifies issues
- [ ] Reviewer provides guidance
- [ ] Developer implements fixes
- [ ] Developer maintains code ownership

---

## Closure Criteria Checklist

For the overall rejection feedback, verify:

### Must-Fix Closure
- [ ] All must-fix items have individual closure criteria
- [ ] Criteria are specific and testable
- [ ] Criteria don't require subjective judgment

### Re-Review Readiness
- [ ] Re-review scope is defined
- [ ] Expected changes are listed
- [ ] Re-review focus areas are specified
- [ ] Estimated re-review time is provided

### Timeline
- [ ] Total fix time is estimated
- [ ] Estimates are reasonable for the issues

---

## Quality Checklist

### Tone and Style
- [ ] Feedback is professional and objective
- [ ] Feedback is constructive, not accusatory
- [ ] Focus is on code, not on developer
- [ ] Explanations help developer learn

### Completeness
- [ ] All issues are categorized (must-fix / should-fix / non-blocking)
- [ ] No issues are left unclassified
- [ ] Residual risks are documented
- [ ] Escalation decision is explicit

### Format
- [ ] Structured YAML format is used
- [ ] All required fields are present
- [ ] IDs are consistent and unique
- [ ] Timestamp is included

---

## Rejection Decision Checklist

### Before Sending
- [ ] All must-fix items have complete remediation guidance
- [ ] All BR-005 requirements are satisfied
- [ ] All BR-007 requirements are satisfied
- [ ] Closure criteria are defined
- [ ] Re-review instructions are clear

### Self-Check Questions
1. Can the developer fix this without asking clarifying questions?
2. Does the developer know exactly where to make changes?
3. Does the developer know how to verify the fix?
4. Does the developer know when they are done?
5. Is there any ambiguity that could lead to wasted time?

If any answer is "no" or "unclear", improve the feedback before sending.

---

## Common Mistakes to Avoid

### ❌ Vague Issues
```
Bad: "This code has performance issues"
Good: "Query at line 45 scans entire table (O(n)), should use index (O(log n))"
```

### ❌ Missing Location
```
Bad: "There's a SQL injection vulnerability"
Good: "SQL injection at AuthService.ts:6, username parameter directly interpolated"
```

### ❌ No Remediation
```
Bad: "Fix the security issue"
Good: "Replace string interpolation with parameterized query. See code example."
```

### ❌ No Verification
```
Bad: "Fix it and resubmit"
Good: "After fix: 1) Run sqlmap, 2) Verify no injection found, 3) Test with username: admin' OR '1'='1"
```

### ❌ Silent Fixing (BR-007)
```
Bad: Reviewer edits the file and commits
Good: Reviewer provides code example in feedback, developer implements
```

---

## Quick Reference: Required Fields

### Must-Fix Item Required Fields
```yaml
- id: string              # e.g., MF-001
  title: string           # Clear summary
  category: enum          # security | correctness | performance
  severity: enum          # critical | high
  description: string     # What is wrong
  location: string        # File:line
  code_snippet: string    # Problematic code
  issue_explanation: string # Why it's a problem
  why_fix: string         # Why it must be fixed
  how_to_fix: string      # Remediation steps
  code_example: string    # Example fix
  verification: string    # How to verify
  estimated_effort: string # Time estimate
  closure_criteria: list  # Pass/fail conditions
```

### Should-Fix Item Required Fields
```yaml
- id: string
  title: string
  description: string
  location: string
  suggestion: string
  impact_if_not_fixed: string
  priority: enum          # high | medium | low
```

### Non-Blocking Item Required Fields
```yaml
- id: string
  title: string
  description: string
  suggestion: string
  benefit: string         # Why consider it
```

---

## Example: Filled Checklist

```yaml
checklist_verification:
  rejection_id: "DIS-2024-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-03-26T10:30:00Z"
  
  must_fix_items:
    - id: "MF-001"
      has_location: true
      has_description: true
      has_rationale: true
      has_remediation: true
      has_code_example: true
      has_verification: true
      has_closure_criteria: true
      br005_compliant: true
      
    - id: "MF-002"
      has_location: true
      has_description: true
      has_rationale: true
      has_remediation: true
      has_code_example: true
      has_verification: true
      has_closure_criteria: true
      br005_compliant: true
      
  br007_compliance:
    no_source_edits: true
    no_direct_commits: true
    examples_are_documentation: true
    role_boundaries_maintained: true
    
  overall:
    actionable: true
    complete: true
    ready_to_send: true
```