# Validation Checklist: architecture-doc-sync

> This checklist validates that architecture document synchronization is complete and compliant with business rules.

---

## Pre-Sync Validation

### Upstream Artifact Availability

- [ ] design-note exists and readable
- [ ] implementation-summary exists and readable
- [ ] tradeoff-analysis-result exists (if applicable)
- [ ] All required fields are accessible

### Current State Assessment

- [ ] Current module-boundaries.md read
- [ ] Current architecture-overview read
- [ ] Current ADRs cataloged
- [ ] Current dependency-graph read

---

## Sync Execution Validation

### BR-001: Upstream Artifact Consumption

- [ ] consumed_artifacts documented in report
- [ ] Each artifact has path and fields_used
- [ ] Missing artifacts noted in unresolved_ambiguities

### BR-002: Minimal Surface Area

- [ ] Only architecture-related documents touched
- [ ] Each touched_document has change_reason
- [ ] No unrelated documents modified

### BR-003: Evidence-Based Statusing

- [ ] ADR status changes reference design-note
- [ ] Module boundary changes reference implementation-summary
- [ ] No speculative updates

### BR-005: Cross-Document Consistency

- [ ] architecture_vs_module_boundary checked
- [ ] adr_vs_design_note checked
- [ ] dependency_graph_vs_actual checked
- [ ] Inconsistencies recorded if found

---

## Post-Sync Validation

### Document Quality

- [ ] Architecture diagrams are clear and accurate
- [ ] Module boundaries are well-defined
- [ ] ADRs follow standard format
- [ ] Dependency graph is complete

### Traceability

- [ ] ADRs linked to design-notes
- [ ] Module changes linked to implementation-summary
- [ | All updates traceable to upstream artifacts

### Report Completeness

- [ ] architecture-sync-report generated
- [ ] All sections filled
- [ ] recommendation is clear

---

## Specific Checks by Document Type

### Module Boundaries

- [ ] Each module has clear responsibility statement
- [ ] Boundaries between modules are explicit
- [ ] No overlapping responsibilities
- [ ] Dependencies follow boundary rules

### ADR

- [ ] ADR has ID, status, date
- [ ] Decision is clear and actionable
- [ ] Rationale is documented
- [ ] Status matches actual implementation state

### Dependency Graph

- [ ] All key dependencies documented
- [ ] Direction is correct
- [ ] Artifact types specified
- [ ] External dependencies included

---

## Failure Mode Prevention

| AP ID | Prevention Check |
|-------|-------------------|
| AP-101 | [ ] Compared module_changes with architecture docs |
| AP-102 | [ ] ADR status vs implementation state verified |
| AP-103 | [ ] Boundary descriptions are clear and non-conflicting |
| AP-104 | [ ] Dependency updates reflected in dependency graph |

---

## Sign-Off

| Field | Value |
|-------|-------|
| Validator | docs role |
| Date | YYYY-MM-DD |
| Recommendation | sync-complete / needs-follow-up / blocked |

---

## Notes

- If any critical check fails, recommendation should be `blocked`
- If minor issues found, recommendation should be `needs-follow-up`
- Only if all checks pass, recommendation should be `sync-complete`