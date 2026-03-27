# Validation Checklist: user-guide-update

> This checklist validates that user guide synchronization is complete and compliant with business rules.

---

## Pre-Sync Validation

### Upstream Artifact Availability

- [ ] implementation-summary exists and readable
- [ ] design-note exists (if user workflow changes)
- [ ] verification-report exists and readable
- [ ] All required fields are accessible

### Current State Assessment

- [ ] Current user guide read
- [ ] Current API reference read
- [ ] Current examples cataloged
- [ ] Current FAQ read

---

## Sync Execution Validation

### BR-001: Upstream Artifact Consumption

- [ ] consumed_artifacts documented in report
- [ ] Each artifact has path and fields_used
- [ ] Missing artifacts noted in unresolved_ambiguities

### BR-002: Minimal Surface Area

- [ ] Only user-visible sections touched
- [ ] Each touched_section has change_reason
- [ ] Each touched_section has user_impact description
- [ ] No unrelated sections modified

### BR-003: Evidence-Based Statusing

- [ ] API changes match implementation-summary
- [ ] Feature descriptions match actual implementation
- [ ] No speculative feature claims

### BR-005: Cross-Document Consistency

- [ ] user_guide_vs_readme checked
- [ ] user_guide_api_vs_actual checked
- [ ] examples_runnable verified
- [ ] Inconsistencies recorded if found

---

## Post-Sync Validation

### Document Quality

- [ ] User guide is clear and readable
- [ ] API descriptions are accurate
- [ ] Examples are complete and runnable
- [ ] FAQ covers common questions

### Example Verification

- [ ] All code examples manually tested
- [ ] Example parameters match actual API
- [ ] Example outputs match expected results
- [ ] Example environment requirements documented

### User Impact Assessment

- [ ] user_impact_level correctly assessed (low/medium/high)
- [ ] Each change has user_impact description
- [ ] user_action_required documented for API changes

### Report Completeness

- [ ] user-guide-sync-report generated
- [ ] All sections filled
- [ ] recommendation is clear

---

## Specific Checks by Section Type

### Features Overview

- [ ] All visible features documented
- [ ] Feature descriptions match implementation
- [ ] NEW markers for new features
- [ ] No unimplemented features listed

### API Reference

- [ ] All public APIs documented
- [ ] Parameters match actual API
- [ ] Return types documented
- [ ] Error codes documented
- [ ] Deprecated APIs marked

### Workflow Guides

- [ ] Steps are clear and sequential
- [ ] Steps match actual workflow
- [ ] Prerequisites documented
- [ ] Troubleshooting included

### Examples

- [ ] Examples are runnable
- [ ] Examples have context/explanation
- [ ] Examples cover common use cases
- [ ] Edge case examples included

---

## Failure Mode Prevention

| AP ID | Prevention Check |
|-------|-------------------|
| AP-201 | [ ] All examples manually run and verified |
| AP-202 | [ ] API parameters compared with implementation-summary |
| AP-203 | [ ] Each change has user_impact description |
| AP-204 | [ ] Only implemented features documented |

---

## Sign-Off

| Field | Value |
|-------|-------|
| Validator | docs role |
| Date | YYYY-MM-DD |
| Recommendation | sync-complete / needs-follow-up / blocked |

---

## Notes

- If any example fails to run, recommendation should be `blocked`
- If minor issues found, recommendation should be `needs-follow-up`
- Only if all checks pass, recommendation should be `sync-complete`
- User impact assessment is critical - always describe what users need to do