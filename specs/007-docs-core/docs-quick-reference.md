# Docs Role Quick Reference Card

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 007-docs-core |
| **Document Type** | Quick Reference |
| **Version** | 1.0.0 |

---

## Role at a Glance

| Aspect | Description |
|--------|-------------|
| **Role** | docs |
| **Position in Chain** | architect → developer → tester → reviewer → **docs** → security |
| **Primary Mission** | Repository-level documentation consistency |
| **Core Skills** | readme-sync, changelog-writing |
| **Primary Artifacts** | docs-sync-report, changelog-entry |

---

## BR Quick Reference

| BR | Rule | Key Check |
|----|------|-----------|
| **BR-001** | Consume upstream evidence, not speculate | All changes cite consumed_artifacts |
| **BR-002** | Minimal surface area | Touch only what changed |
| **BR-003** | Evidence-based statusing | Status matches upstream artifacts |
| **BR-004** | 6-role terminology | No legacy 3-skill terms |
| **BR-005** | Cross-document consistency | README ↔ completion-report aligned |
| **BR-006** | Changelog distinguish change types | Use: feature/repair/docs-only/governance |
| **BR-007** | No implementation code modification | Docs = documentation only |
| **BR-008** | Status truthfulness | No status inflation |

---

## Upstream Artifacts Quick Reference

### From architect (003)
| Artifact | Key Fields for Docs |
|----------|---------------------|
| design-note | feature_goal, design_summary, constraints |
| open-questions | question, temporary_assumption, impact_surface |

### From developer (004)
| Artifact | Key Fields for Docs |
|----------|---------------------|
| implementation-summary | goal_alignment, changed_files, known_issues |
| self-check-report | overall_status, blockers |
| bugfix-report | bug_id, fix_summary, related_changes |

### From tester (005)
| Artifact | Key Fields for Docs |
|----------|---------------------|
| verification-report | confidence_level, coverage_gaps, edge_cases_checked |
| regression-risk-report | risk_areas, mitigation_strategies |

### From reviewer (006)
| Artifact | Key Fields for Docs |
|----------|---------------------|
| acceptance-decision-record | decision_state, blocking_issues, acceptance_conditions |
| review-findings-report | findings_by_severity, governance_alignment_status |

### Feature Completion Context
| Source | Key Fields |
|--------|------------|
| completion-report.md | completion_status, deliverables, known_gaps |
| spec.md | feature description, acceptance criteria |

---

## docs-sync-report Fields

| Field | Required | Purpose |
|-------|----------|---------|
| sync_target | ✅ | Feature being synchronized |
| consumed_artifacts | ✅ | Upstream artifacts used (BR-001) |
| touched_sections | ✅ | Documentation sections updated (BR-002) |
| change_reasons | ✅ | Why each section changed |
| consistency_checks | ✅ | Cross-document verification (BR-005) |
| status_updates | ✅ | Feature status changes |
| unresolved_ambiguities | ✅ | Items needing clarification |
| recommendation | ✅ | sync-complete / needs-follow-up / blocked |

---

## changelog-entry Fields

| Field | Required | Purpose |
|-------|----------|---------|
| feature_id | ✅ | Feature identifier |
| feature_name | ✅ | Human-readable name |
| change_type | ✅ | feature / repair / docs-only / governance (BR-006) |
| summary | ✅ | Concise change description |
| capability_changes | ✅ | New capabilities added |
| docs_changes | ✅ | Documentation changes |
| validation_changes | ✅ | Testing/validation changes |
| breaking_changes | ✅ | Breaking changes (if any) |
| known_limitations | ✅ | Known gaps or limitations |
| related_features | ✅ | Related feature IDs |

---

## Change Type Classification

| Type | When to Use | Example |
|------|-------------|---------|
| **feature** | New capability added | New skill implemented |
| **repair** | Bug fix, defect correction | Bugfix in existing skill |
| **docs-only** | Documentation updates, no code changes | README clarification |
| **governance** | Process, policy, rules changes | New validation checklist |

---

## Recommendation States

| State | Meaning | Next Action |
|-------|---------|-------------|
| **sync-complete** | All docs synchronized | Proceed to acceptance |
| **needs-follow-up** | Sync done, pending items | Track items, may proceed |
| **blocked** | Cannot complete sync | Resolve blockers first |

---

## Escalation Quick Reference

### When to Escalate (recommendation = blocked)

| Condition | Escalate To |
|-----------|-------------|
| Upstream artifacts missing | OpenClaw |
| Conflicting status claims | reviewer/architect |
| Documentation debt blocking sync | OpenClaw |
| Ambiguous evidence | architect |
| Major README restructuring needed | OpenClaw |

### When to Document (not escalate)

- Minor inconsistency that doesn't block
- Missing optional field in upstream artifact
- Ambiguity with clear temporary assumption

---

## Anti-Pattern Quick Detection

| Anti-Pattern | Detection Signal | BR Violated |
|--------------|------------------|-------------|
| **AP-001**: Status Inflation | README "Complete" but completion-report has gaps | BR-008 |
| **AP-002**: Over-Updating | Touched sections unrelated to change | BR-002 |
| **AP-003**: Drift Ignorance | No consistency checks performed | BR-005 |
| **AP-004**: Legacy Terminology | Using "spec-writer" instead of "architect" | BR-004 |
| **AP-005**: Vague Changelog | "Various improvements and bug fixes" | BR-006 |
| **AP-006**: Undocumented Changes | Changes without reasons | BR-002 |
| **AP-007**: Speculation-Based Documentation | Writing about unimplemented features | BR-001, BR-007 |

---

## Quick Commands

### readme-sync Checklist

```
□ Consume upstream artifacts (BR-001)
□ Identify affected README sections
□ Apply minimal surface area (BR-002)
□ Perform consistency checks (BR-005)
□ Verify status truthfulness (BR-008)
□ Document touched_sections + change_reasons
□ Generate docs-sync-report
```

### changelog-writing Checklist

```
□ Extract completion context
□ Classify change_type (BR-006)
□ Document capability_changes
□ Identify breaking_changes
□ Document known_limitations
□ Generate changelog-entry
```

---

## Role Boundaries Summary

| Activity | Docs | Developer |
|----------|:----:|:---------:|
| Update README status table | ✅ | ❌ |
| Write code comments | ❌ | ✅ |
| Update API documentation | ❌ | ✅ |
| Generate changelog | ✅ | ❌ |

| Activity | Docs | Architect |
|----------|:----:|:---------:|
| Write design-note | ❌ | ✅ |
| Update README feature overview | ✅ | ❌ |

---

## File Locations

| Resource | Location |
|----------|----------|
| readme-sync SKILL.md | `.opencode/skills/docs/readme-sync/SKILL.md` |
| changelog-writing SKILL.md | `.opencode/skills/docs/changelog-writing/SKILL.md` |
| docs-sync-report contract | `specs/007-docs-core/contracts/docs-sync-report-contract.md` |
| changelog-entry contract | `specs/007-docs-core/contracts/changelog-entry-contract.md` |
| role-scope.md | `specs/007-docs-core/role-scope.md` |
| upstream-consumption.md | `specs/007-docs-core/upstream-consumption.md` |
| downstream-interfaces.md | `specs/007-docs-core/downstream-interfaces.md` |

---

## References

- `role-definition.md` Section 5 - Canonical docs role definition
- `specs/007-docs-core/spec.md` - Feature specification
- `specs/007-docs-core/role-scope.md` - Role boundaries
- `io-contract.md` - I/O contract specification