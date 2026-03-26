# Failure Mode Checklist

## Document Metadata
- **Feature ID**: 006-reviewer-core
- **Document Type**: Failure Mode Checklist
- **Version**: 1.0.0
- **Created**: 2026-03-26
- **Purpose**: Document all 7 reviewer anti-patterns with detection, remediation, and prevention strategies

---

## Purpose Statement

This checklist documents common reviewer failure patterns (anti-patterns) defined in spec.md Section 10, providing:

1. **Clear definitions** - What each anti-pattern means
2. **Detection methods** - How to identify when the pattern is occurring
3. **Early warning signals** - Red flags that indicate potential failure mode
4. **Remediation strategies** - Steps to recover from the failure mode
5. **Prevention measures** - How to avoid the failure mode entirely
6. **BR violation mapping** - Which business rules are violated by each pattern

---

## AP-001: Vague Review

### Definition
Review that says "needs improvement" without specific, actionable guidance.

**Example**: "The code could be better. Consider refactoring."

### Detection Method

| Check | Method | Status |
|-------|--------|--------|
| [ ] Specific findings listed | Review findings_by_severity field | |
| [ ] Actionable suggestions present | Check each finding has remediation | |
| [ ] File/line references included | Verify evidence_references populated | |
| [ ] No generic language | Check for "needs improvement", "could be better" | |

### Early Warning Signals
- Language like "could be better", "consider", "might want to"
- No specific file or line references in findings
- Findings lack remediation guidance
- Generic suggestions without code examples
- review-findings-report has empty evidence_references

### Remediation Strategy
1. Stop review output generation
2. Require specific file:line references for each finding
3. Add concrete remediation steps
4. Include code examples where applicable
5. Verify each finding passes "actionable" test (can developer act on it?)

### Prevention Measures
- Use structured checklist (code-review-checklist skill)
- Require specific suggestions for every finding
- Enforce evidence_references requirement
- Apply BR-005 actionability check

### Related BR
**BR-005**: Rejection Must Be Actionable

---

## AP-002: Rubber Stamp Approval

### Definition
Approval based on surface-level review without independent verification.

**Example**: Accepting "tested locally" as sufficient evidence without independent artifact review.

### Detection Method

| Check | Method | Status |
|-------|--------|--------|
| [ ] Upstream artifacts consumed | Check reviewed_inputs field | |
| [ ] Evidence links present | Review evidence_references | |
| [ ] Independent analysis performed | Verify findings are reviewer-generated | |
| [ ] No unsubstantiated acceptance | Check rationale in decision_rationale | |

### Early Warning Signals
- Acceptance without consuming upstream artifacts
- "tested locally" or "looks good" as primary evidence
- No reviewer-generated findings
- acceptance-decision-record lacks detailed rationale
- review-findings-report summary_judgment contradicts findings

### Remediation Strategy
1. Revoke acceptance decision
2. Consume upstream artifacts (design-note, implementation-summary, verification-report)
3. Perform independent analysis
4. Generate reviewer-observed findings
5. Re-record acceptance-decision with proper rationale

### Prevention Measures
- Require evidence links in every review
- Mandate upstream artifact consumption (BR-001)
- Check reviewed_inputs before accepting decision
- Apply spec-implementation-diff skill for spec coverage

### Related BR
**BR-001**: Reviewer Must Consume Upstream Evidence, Not Ignore It
**BR-002**: Self-Check Is Not Independent Review

---

## AP-003: Scope Creep Blindness

### Definition
Failing to identify implementation beyond specification.

**Example**: Accepting additional "bonus" features not in spec without flagging them as scope additions.

### Detection Method

| Check | Method | Status |
|-------|--------|--------|
| [ ] Spec requirements extracted | Review spec-implementation-diff output | |
| [ ] Implementation mapped to spec | Check spec_vs_implementation_comparison | |
| [ ] Unauthorized additions flagged | Review scope_mismatches field | |
| [ ] Each feature accounted for | Verify no orphaned implementations | |

### Early Warning Signals
- Implementation includes functionality not in spec
- No mention of scope_mismatches in report
- spec-implementation-diff skill not invoked
- changed_files includes unexpected modules
- "Bonus features" mentioned without finding

### Remediation Strategy
1. Invoke spec-implementation-diff skill
2. Extract all spec requirements
3. Map each implementation to spec requirement
4. Identify and flag unauthorized additions
5. Classify as major finding with recommendation to remove or document

### Prevention Measures
- Explicit spec-implementation-diff execution
- Flag unauthorized additions as findings
- Include scope_mismatches in review-findings-report
- Apply BR-008 scope creep detection

### Related BR
**BR-008**: Scope Creep Detection Is Required

---

## AP-004: Severity Confusion

### Definition
Treating all findings equally without proper severity classification.

**Example**: Listing style suggestions alongside security vulnerabilities without distinguishing urgency.

### Detection Method

| Check | Method | Status |
|-------|--------|--------|
| [ ] All findings severity-classified | Review findings_by_severity field | |
| [ ] Classification follows quality-gate.md | Verify blocker/major/minor/note used | |
| [ ] Security issues marked as blocker/major | Check critical findings | |
| [ ] Minor issues not elevated | Verify proportional severity | |

### Early Warning Signals
- All findings at same severity level
- Style issues mixed with functional issues
- Security concerns marked as "minor" or "note"
- No blocker findings despite obvious issues
- quality-gate.md Section 2.2 severity model not followed

### Remediation Strategy
1. Re-classify all findings per quality-gate.md Section 2.2
2. Apply severity criteria:
   - **blocker**: Must fix, blocks acceptance
   - **major**: Affects downstream, causes understanding deviation
   - **minor**: Minor issue, easily fixable
   - **note**: Informational, suggestion
3. Update findings_by_severity field
4. Verify classification is proportional

### Prevention Measures
- Mandatory severity discipline per quality-gate.md
- Use BR-004 classification requirements
- Include severity rationale for blocker/major findings
- Apply consistent severity model across all reviews

### Related BR
**BR-004**: Findings Must Be Severity-Classified

---

## AP-005: Governance Drift Ignorance

### Definition
Skipping AH-006 governance alignment checks against canonical documents.

**Example**: Not checking if feature violates role-definition.md boundaries or package-spec.md terminology.

### Detection Method

| Check | Method | Status |
|-------|--------|--------|
| [ ] Canonical documents checked | Review governance_alignment_status | |
| [ ] Role boundaries verified | Check against role-definition.md | |
| [ ] Terminology consistent | Verify against package-spec.md | |
| [ ] Artifact formats compliant | Check against io-contract.md | |

### Early Warning Signals
- governance_alignment_status empty or "skipped"
- No mention of role-definition.md or package-spec.md
- Feature uses legacy terminology without flagging
- Governance conflicts not documented
- AH-006 compliance section missing

### Remediation Strategy
1. Invoke spec-implementation-diff governance alignment check
2. Compare against canonical documents:
   - `role-definition.md` - Role boundaries
   - `package-spec.md` - Terminology and package model
   - `io-contract.md` - Artifact formats
   - `quality-gate.md` - Severity levels
3. Document any conflicts in governance_conflicts field
4. Classify governance conflicts as major or blocker
5. Set governance_alignment_status appropriately

### Prevention Measures
- Include governance alignment in review checklist
- Make AH-006 checks mandatory
- Check canonical documents in every review
- Document governance_conflicts explicitly

### Related BR
**BR-006**: Governance Alignment Checking Is Mandatory

---

## AP-006: Silent Fixing

### Definition
Reviewer modifying code instead of providing feedback.

**Example**: Rewriting a function during review instead of documenting the issue in actionable-feedback-report.

### Detection Method

| Check | Method | Status |
|-------|--------|--------|
| [ ] Reviewer did not modify production code | Check changed_files for reviewer edits | |
| [ ] Issues documented as feedback | Review actionable-feedback-report | |
| [ ] No silent repairs | Verify no code changes from reviewer | |
| [ ] Role boundary respected | Check role-scope.md compliance | |

### Early Warning Signals
- Reviewer modifying production files
- "Fixed during review" language
- Issues resolved without developer action
- actionable-feedback-report not generated for rejections
- Blurred role boundaries between reviewer and developer

### Remediation Strategy
1. Revert any production code changes made by reviewer
2. Document issues in actionable-feedback-report
3. Specify remediation guidance for developer
4. Reaffirm role boundary (reviewer reviews, developer fixes)
5. Escalate if pattern continues

### Prevention Measures
- Explicit prohibition in role-scope.md
- BR-007 enforcement
- Reviewer produces feedback, not fixes
- actionable-feedback-report for all rejections

### Related BR
**BR-007**: Reviewer Must Not Mutate Production Code

---

## AP-007: Rejection Without Remedy

### Definition
Rejecting work without providing actionable remediation guidance.

**Example**: "This doesn't meet our standards" without specifics on what to fix.

### Detection Method

| Check | Method | Status |
|-------|--------|--------|
| [ ] Must-fix items listed | Check actionable-feedback-report | |
| [ ] Remediation guidance provided | Verify each must-fix has resolution | |
| [ ] Re-review criteria defined | Check closure_criteria field | |
| [ ] No vague rejection language | Review for "doesn't meet standards" | |

### Early Warning Signals
- Rejection without specific must-fix items
- "Needs improvement" without actionable steps
- No actionable-feedback-report generated
- closure_criteria empty for rejection
- Developer cannot determine what to fix

### Remediation Strategy
1. Generate actionable-feedback-report
2. For each blocking issue:
   - Describe the issue specifically
   - Explain why it matters
   - Provide remediation steps
   - Define verification method
3. Specify re-review criteria
4. Define closure_criteria for "done"

### Prevention Measures
- BR-005 enforcement
- Require actionable-feedback-report for all rejections
- Use reject-with-actionable-feedback skill
- No rejection without must-fix items

### Related BR
**BR-005**: Rejection Must Be Actionable

---

## BR Violation Mapping

| Anti-Pattern | Primary BR | Secondary BR |
|--------------|------------|--------------|
| AP-001: Vague Review | BR-005 | - |
| AP-002: Rubber Stamp Approval | BR-001, BR-002 | - |
| AP-003: Scope Creep Blindness | BR-008 | - |
| AP-004: Severity Confusion | BR-004 | - |
| AP-005: Governance Drift Ignorance | BR-006 | - |
| AP-006: Silent Fixing | BR-007 | - |
| AP-007: Rejection Without Remedy | BR-005 | - |

### BR Quick Reference

| BR | Definition | Related Anti-Patterns |
|----|------------|----------------------|
| BR-001 | Reviewer Must Consume Upstream Evidence | AP-002 |
| BR-002 | Self-Check Is Not Independent Review | AP-002 |
| BR-004 | Findings Must Be Severity-Classified | AP-004 |
| BR-005 | Rejection Must Be Actionable | AP-001, AP-007 |
| BR-006 | Governance Alignment Checking Is Mandatory | AP-005 |
| BR-007 | Reviewer Must Not Mutate Production Code | AP-006 |
| BR-008 | Scope Creep Detection Is Required | AP-003 |

---

## Self-Check Section for Reviewer

Before finalizing any review output, verify:

### Pre-Output Checklist

| Check | Anti-Patterns Prevented |
|-------|------------------------|
| [ ] All findings have specific file:line references | AP-001 |
| [ ] Each finding has actionable remediation | AP-001, AP-007 |
| [ ] Upstream artifacts consumed and documented | AP-002 |
| [ ] Evidence is reviewer-generated, not restated self-check | AP-002 |
| [ ] spec-implementation-diff executed | AP-003 |
| [ ] scope_mismatches populated | AP-003 |
| [ ] All findings severity-classified per quality-gate.md | AP-004 |
| [ ] governance_alignment_status checked | AP-005 |
| [ ] No production code modified by reviewer | AP-006 |
| [ ] actionable-feedback-report generated for rejection | AP-007 |
| [ ] Re-review criteria defined for any rejection | AP-007 |

### Decision Quality Check

| Decision State | Required Artifacts |
|----------------|-------------------|
| accept | review-findings-report with no blockers |
| accept-with-conditions | review-findings-report + acceptance_conditions |
| reject | actionable-feedback-report + must_fix_items |
| needs-clarification | open_questions documented |

---

## Checklist Summary

| Anti-Pattern | Detection Points | Prevention | Recovery Steps | Related BR |
|--------------|------------------|------------|----------------|------------|
| AP-001: Vague Review | 4 | Structured checklist | 5 steps | BR-005 |
| AP-002: Rubber Stamp Approval | 4 | Upstream consumption | 5 steps | BR-001, BR-002 |
| AP-003: Scope Creep Blindness | 4 | spec-implementation-diff | 5 steps | BR-008 |
| AP-004: Severity Confusion | 4 | quality-gate.md discipline | 4 steps | BR-004 |
| AP-005: Governance Drift Ignorance | 4 | AH-006 checks | 5 steps | BR-006 |
| AP-006: Silent Fixing | 4 | role-scope prohibition | 5 steps | BR-007 |
| AP-007: Rejection Without Remedy | 4 | BR-005 enforcement | 4 steps | BR-005 |
| **Total** | **28** | | **33 steps** | |

---

## References

- `specs/006-reviewer-core/spec.md` - Feature specification (Section 6 Business Rules, Section 10 Anti-Patterns)
- `specs/006-reviewer-core/role-scope.md` - Reviewer role scope
- `quality-gate.md` - Section 2.2 severity level definitions
- `role-definition.md` - 6-role definitions
- `docs/audit-hardening.md` - AH-006 governance alignment rules
- `specs/005-tester-core/validation/failure-mode-checklist.md` - Pattern reference

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial failure-mode checklist covering all 7 anti-patterns from spec.md Section 10 |