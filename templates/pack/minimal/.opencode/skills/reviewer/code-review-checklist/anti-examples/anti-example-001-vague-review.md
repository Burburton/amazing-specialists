# Anti-Example 001: Vague Review

## What This Anti-Example Looks Like

### ❌ Incorrect Review Report (Vague Review)

```yaml
review_report:
  dispatch_id: "DISPATCH-2024-001"
  task_id: "TASK-REG-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-01-15T14:30:00Z"
  
  summary:
    overall_decision: approve
    decision_reason: "LGTM, looks good"
    
  issues: []
  
  positives:
    - description: "Good code quality"
    
  recommendations:
    must_fix: []
    should_fix: []
    consider: []
    
  recommendation_to_next:
    action: approve
    next_steps: ["Merge when ready"]
```

## Why This Is Wrong

### Multiple BR Violations

#### BR-002 Violation: No Independent Verification
The review report shows no evidence of independent verification:
- No `self_check_acknowledged` section
- No `br_002_verification` fields in any finding
- No indication reviewer actually reviewed the code

#### BR-004 Violation: No Severity Classification
- Issues list is empty - did reviewer really find nothing?
- If there are truly no issues, this should be explicitly justified
- "Good code quality" is not specific enough

#### BR-007 Violation: False Confidence
The report claims approval but provides no evidence:
- "LGTM" is not a decision reason
- No checklist summary showing what was checked
- No `review_coverage` section showing scope

### The Real Problem

| Problem | Why It's Wrong | Impact |
|---------|----------------|--------|
| **No specific findings** | Reviewer may not have actually reviewed | Bugs slip through |
| **"LGTM" decision reason** | Not actionable, not informative | Cannot trace decision rationale |
| **Empty issues list** | Every code has issues | False confidence |
| **No evidence of review** | No checklist, no coverage | Untrustworthy |

### What This Allows

This type of vague review allows:
- Security vulnerabilities to be merged unnoticed
- Poor code quality to accumulate
- No accountability when bugs are found later
- Rubber-stamp approval culture

## How to Detect This Anti-Pattern

### Detection Checklist

- [ ] **Decision Reason Check**: Is the decision reason specific (not just "LGTM")?
- [ ] **Evidence Check**: Are there specific code locations cited?
- [ ] **Issue Check**: If no issues, is there explicit justification?
- [ ] **Checklist Check**: Is there a checklist summary showing what was checked?
- [ ] **Coverage Check**: Is there a review_coverage section?
- [ ] **BR-002 Check**: Is there self_check_acknowledged with independent verification notes?

### Warning Signs

```text
🚩 "LGTM" or "looks good" as decision reason
🚩 Empty issues list without justification
🚩 No specific file locations or code snippets
🚩 No checklist summary
🚩 No review_coverage section
🚩 No br_002_verification notes
🚩 Overall decision made in under 5 minutes
```

## How to Fix This

### Step 1: Add Specific Findings

Every review should have specific findings, even if minor:

```yaml
issues:
  - id: ISS-001
    category: "代码质量"
    severity: minor
    description: "Variable name 'x' could be more descriptive"
    location: "src/utils/calculator.ts:45"
    suggestion: "Rename to 'result' or 'calculationResult'"
```

If there are truly no issues:

```yaml
issues: []

no_issues_justification: |
  Reviewed all 4 changed files. Code follows established patterns.
  Security checks passed (no hardcoded secrets, proper input validation).
  Tests added and passing. No concerns identified.
```

### Step 2: Add Checklist Summary

```yaml
checklist_summary:
  total_checks: 30
  passed: 28
  failed: 0
  na: 2
  
  by_category:
    - category: "目标对齐"
      passed: 5
      failed: 0
    - category: "安全性"
      passed: 5
      failed: 0
    # ... etc
```

### Step 3: Add Review Coverage (BR-007)

```yaml
review_coverage:
  files_reviewed:
    - "src/services/UserService.ts"
    - "src/controllers/UserController.ts"
  files_not_reviewed:
    - "src/config/database.ts"  # Infrastructure, not changed
  not_reviewed_reason: "Database config unchanged in this PR"
  assumptions_made:
    - "External dependencies are stable"
```

### Step 4: Add Self-Check Acknowledgment (BR-002)

```yaml
self_check_acknowledged:
  status: "Developer claims 12/12 checks passed"
  use: "Hints for review focus, NOT evidence"
  
independent_verification:
  performed: true
  spot_checks:
    - claim: "No hardcoded secrets"
      verified: true
      method: "Code review + grep for key patterns"
```

## Corrected Example

### ✅ Correct Review Report (BR-Compliant)

```yaml
review_report:
  dispatch_id: "DISPATCH-2024-001"
  task_id: "TASK-REG-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-01-15T14:30:00Z"
  
  # BR-002 Compliance
  self_check_acknowledged:
    status: "Developer claims 12/12 checks passed"
    use: "Hints for review focus, NOT evidence - independent verification performed"
  
  summary:
    overall_decision: approve
    decision_reason: "Implementation follows design spec, security checks passed, tests cover key paths. Two minor suggestions for improvement."
    
  checklist_summary:
    total_checks: 30
    passed: 28
    failed: 0
    na: 2
    
    by_category:
      - category: "目标对齐"
        passed: 5
        failed: 0
      - category: "安全性"
        passed: 5
        failed: 0
      - category: "代码质量"
        passed: 4
        failed: 0
      - category: "测试覆盖"
        passed: 5
        failed: 0
        
  issues:
    - id: ISS-001
      category: "代码质量"
      severity: minor
      type: quality
      description: "Function validateEmail() could use a more specific regex"
      location: "src/utils/validation.ts:23"
      code_snippet: |
        const emailRegex = /.+@.+\..+/;  // Very permissive
      suggestion: "Consider using a more strict email validation pattern"
      br_002_verification: "Reviewer identified by code inspection"
      
    - id: ISS-002
      category: "可维护性"
      severity: note
      description: "Good use of dependency injection pattern"
      location: "src/services/UserService.ts:10-15"
  
  positives:
    - description: "Clean separation of concerns"
      location: "All service files"
    - description: "Proper error handling with custom error types"
      location: "src/errors/"
    
  recommendations:
    must_fix: []
    should_fix: []
    consider:
      - "Consider stricter email validation (ISS-001)"
    
  # BR-007 Compliance
  review_coverage:
    files_reviewed:
      - "src/services/UserService.ts"
      - "src/controllers/UserController.ts"
      - "src/utils/validation.ts"
    files_not_reviewed: []
    not_reviewed_reason: "N/A - reviewed all changed files"
    assumptions_made:
      - "Database schema migrations handled separately"
    
  recommendation_to_next:
    action: approve
    next_steps:
      - "Ready to merge"
      - "Consider email validation improvement as future enhancement"
```

## Lesson

**"LGTM" is not a review.** A proper review must:
1. Show evidence of actual code review (specific findings)
2. Distinguish self-check from independent verification (BR-002)
3. Classify issues by severity (BR-004)
4. Disclose review scope and gaps (BR-007)
5. Provide actionable, specific feedback

Vague reviews create false confidence and let bugs slip through. Every review should leave a paper trail of what was checked and why decisions were made.

---

## References

- `specs/006-reviewer-core/spec.md` Section 6: BR-002, BR-004, BR-007
- `quality-gate.md` Section 3.4: Reviewer Gate
- `examples/example-001-feature-code-review.md` - Complete correct example