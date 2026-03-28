# Anti-Example 001: Ignoring Governance Alignment Checks

## What This Shows

This anti-example demonstrates the **WRONG way** to perform spec-implementation diff by skipping governance alignment checks (AH-006). This violates BR-006 and can allow governance drift to go undetected.

## The Anti-Pattern

### Scenario

Reviewer is reviewing a feature that introduces new terminology and roles, but skips the governance alignment check step.

### ❌ WRONG Approach: Skipping Governance Checks

```yaml
# INCORRECT: Reviewer skips governance alignment
spec_implementation_diff:
  summary:
    overall_status: aligned
    alignment_percentage: 100
    # NOTE: governance_status field is MISSING!
    
  comparison:
    - category: "Requirements"
      items:
        - spec_item: "AC-001"
          implementation_status: implemented
          alignment: aligned
          
  # ❌ WRONG: No governance_alignment section!
  # Reviewer assumed feature is fine because spec requirements are met
  
  recommendation:
    action: approve  # ❌ WRONG: Approving without governance check
```

### Why This Is Wrong

1. **AH-006 Violation**: Governance alignment check is mandatory, not optional
2. **Hidden Governance Drift**: Feature may have introduced terminology conflicts
3. **Role Boundary Violations**: New roles may have been added without updating canonical
4. **Status Mismatch Risk**: completion-report and README may be inconsistent

## The Correct Approach

### ✅ CORRECT: Include Governance Alignment Check

```yaml
spec_implementation_diff:
  summary:
    overall_status: partial_aligned
    alignment_percentage: 85
    governance_status: drift_detected  # ✅ Always include this field
    
  comparison:
    - category: "Requirements"
      items:
        - spec_item: "AC-001"
          implementation_status: implemented
          alignment: aligned
          
  # ✅ CORRECT: Always include governance_alignment section
  governance_alignment:
    canonical_documents_checked:
      - role-definition.md
      - package-spec.md
      - io-contract.md
      - quality-gate.md
      - README.md
      
    conflicts:
      - document: "role-definition.md"
        conflict_type: "role_boundary"
        feature_value: "Added 'auditor' role"
        canonical_value: "6-role model only"
        severity: blocker
        recommendation: "Remove 'auditor' or update canonical first"
        
    status_truthfulness:
      completion_report_status: "COMPLETE"
      readme_status: "COMPLETE"
      aligned: true
      
  recommendation:
    action: request_changes  # ✅ CORRECT: Cannot approve with blocker
    must_fix:
      - "Remove 'auditor' role or update role-definition.md"
```

## Real-World Consequences of Skipping Governance Checks

### Consequence 1: Terminology Drift

```
Without governance check:
  Feature A: Uses "auditor" as new role
  Feature B: Uses "auditor" differently
  Feature C: Conflicts with A and B
  → Inconsistent terminology across project
```

### Consequence 2: Status Misrepresentation

```
Without status truthfulness check:
  completion-report: "PARTIAL (AC-003 not done)"
  README: "✅ Complete"
  → Users/management misinformed about actual state
```

### Consequence 3: Path Resolution Failures

```
Without path check:
  tasks.md: "Output to docs/guide.md"
  Actual: docs/user-guide.md
  → References broken, documentation incomplete
```

## How to Avoid This Anti-Pattern

### Checklist for Reviewers

Before submitting spec-implementation diff:

- [ ] **Step 1**: Read all 5 canonical documents
  - [ ] `role-definition.md`
  - [ ] `package-spec.md`
  - [ ] `io-contract.md`
  - [ ] `quality-gate.md`
  - [ ] `README.md`

- [ ] **Step 2**: Check role boundaries
  - [ ] No new roles introduced
  - [ ] No role boundary changes
  - [ ] Terminology matches canonical

- [ ] **Step 3**: Check status truthfulness
  - [ ] completion-report status read
  - [ ] README status read
  - [ ] Statuses match

- [ ] **Step 4**: Check path resolution
  - [ ] All declared paths exist
  - [ ] No broken references

- [ ] **Step 5**: Include `governance_alignment` section in output
  - [ ] `canonical_documents_checked` listed
  - [ ] `conflicts` array present (even if empty)
  - [ ] `status_truthfulness` section present

## Code Example: Proper Governance Check

```python
# CORRECT: Always perform governance check
def perform_spec_implementation_diff(spec, implementation):
    # Step 1: Basic spec-implementation comparison
    comparison = compare_spec_to_implementation(spec, implementation)
    
    # Step 2: GOVERNANCE CHECK (MANDATORY - AH-006)
    governance_alignment = check_governance_alignment(
        canonical_documents=[
            "role-definition.md",
            "package-spec.md",
            "io-contract.md",
            "quality-gate.md",
            "README.md"
        ],
        feature_documents=implementation.changed_files
    )
    
    # Step 3: Status truthfulness check (BR-009)
    status_check = verify_status_truthfulness(
        completion_report="completion-report.md",
        readme="README.md"
    )
    
    # Step 4: Determine recommendation based on ALL findings
    if governance_alignment.conflicts:
        if any(c.severity == "blocker" for c in governance_alignment.conflicts):
            recommendation.action = "reject"
        else:
            recommendation.action = "request_changes"
    elif not status_check.aligned:
        recommendation.action = "request_changes"
    else:
        recommendation.action = "approve"
        
    return {
        "comparison": comparison,
        "governance_alignment": governance_alignment,  # Always include
        "recommendation": recommendation
    }
```

## Summary

| Aspect | Anti-Pattern | Correct Pattern |
|--------|--------------|-----------------|
| Governance check | Skipped | Always performed |
| `governance_alignment` section | Missing | Always included |
| Status truthfulness | Not verified | Always verified (BR-009) |
| Canonical documents | Not read | All 5 read and checked |
| Conflicts | Not reported | Reported with severity |
| Recommendation | May approve incorrectly | Based on all findings |

## Related Rules

- **AH-006**: Enhanced Reviewer Responsibilities - mandates governance checks
- **BR-006**: Governance Alignment Is Required
- **BR-009**: Status Truthfulness Must Be Verified
- **AH-001**: Mandatory Canonical Comparison
- **AH-004**: Status Truthfulness Audit Rules