# Docs Role FAQ

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 007-docs-core |
| **Document Type** | FAQ |
| **Version** | 1.0.0 |

---

## General Questions

### Q1: What is the docs role's primary responsibility?

**A:** The docs role ensures **repository-level documentation consistency after implementation, testing, and review**. Docs is the final stage in the 6-role execution chain (architect → developer → tester → reviewer → docs) and produces two primary artifacts:

1. **docs-sync-report** - Documents what was updated and why
2. **changelog-entry** - Structured changelog for release notes

---

### Q2: When should the docs role be invoked?

**A:** Invoke docs when:

| Trigger | Priority |
|---------|----------|
| Feature completion signaled (after reviewer acceptance) | High |
| README status drift detected | High |
| Changelog entry needed for release | High |
| Documentation debt identified | Medium |
| Governance sync required | Medium |

---

### Q3: What's the difference between docs and developer documentation responsibilities?

**A:**

| Activity | Docs | Developer |
|----------|:----:|:---------:|
| Update README status table | ✅ | ❌ |
| Write code comments | ❌ | ✅ |
| Update API documentation (inline) | ❌ | ✅ |
| Generate changelog | ✅ | ❌ |
| Update installation docs (technical) | Partial | ✅ |

Docs handles **repository-level** documentation (README, CHANGELOG), while developer handles **code-level** documentation (comments, inline docs).

---

## Upstream Consumption Questions

### Q4: What upstream artifacts must docs consume?

**A:** Docs must consume artifacts from all four preceding roles:

| Role | Required Artifacts |
|------|-------------------|
| architect | design-note, open-questions |
| developer | implementation-summary, self-check-report, bugfix-report |
| tester | verification-report, regression-risk-report |
| reviewer | acceptance-decision-record, review-findings-report |

Additionally, docs must consume:
- `completion-report.md` - Feature completion state
- `spec.md` - Feature description and acceptance criteria

---

### Q5: What if upstream artifacts are missing?

**A:** If required upstream artifacts are missing:

1. **Document the gap** in `consumed_artifacts.gaps_found`
2. **Set recommendation = blocked** if the gap prevents documentation sync
3. **Escalate to OpenClaw** with specific blocker details

Example:
```yaml
consumed_artifacts:
  - artifact_type: "acceptance-decision-record"
    consumed_fully: false
    gaps_found:
      - "acceptance-decision-record not found - reviewer has not completed review"

recommendation:
  state: "blocked"
  blocking_items:
    - "acceptance-decision-record not available"
```

---

### Q6: How do I handle conflicting status claims between documents?

**A:** When README status conflicts with completion-report or acceptance-decision-record:

1. **Identify the discrepancy** in consistency_checks
2. **Determine the authoritative source** (usually acceptance-decision-record)
3. **Document the resolution** in the consistency_checks resolution field
4. **Update README** to match authoritative source

If you cannot determine the correct status, set recommendation = blocked and escalate.

---

## readme-sync Questions

### Q7: What is "minimal surface area" (BR-002)?

**A:** Minimal surface area means touching **only** the documentation sections that actually changed. Do not rewrite unrelated sections.

**Good**: Update only the feature status row in the table
**Bad**: Restructure the entire README when only status changed

Each touched section must have a documented `change_reason` explaining why it was updated.

---

### Q8: How do I verify status truthfulness (BR-008)?

**A:** Compare README status against evidence:

```yaml
consistency_checks:
  - check_name: "README status vs completion-report status"
    documents_compared:
      - "README.md#Feature Status Table"
      - "specs/007-docs-core/completion-report.md"
    result: "ALIGNED"  # or MISALIGNED
```

Key rules:
- "Substantially Complete with Known Gaps" ≠ "Fully Complete"
- Status must match acceptance-decision-record.decision_state
- Known gaps from completion-report must be reflected in README

---

### Q9: What if README needs major restructuring?

**A:** If README needs restructuring beyond minimal surface area:

1. **Document why** in change_reasons with is_minimal = false
2. **Consider escalating** to OpenClaw if restructuring is extensive
3. **Justify the change** with evidence from upstream artifacts

Major restructuring should be rare and deliberate, not routine.

---

## changelog-writing Questions

### Q10: How do I classify change_type (BR-006)?

**A:** Use these categories:

| Type | Definition | Example |
|------|------------|---------|
| **feature** | New capability added | New skill implemented |
| **repair** | Bug fix, defect correction | Fixed bug in existing skill |
| **docs-only** | Documentation updates, no code changes | README clarification |
| **governance** | Process, policy, rules changes | New validation checklist |

**Never use generic descriptions** like "Various improvements and bug fixes."

---

### Q11: What counts as a "breaking change"?

**A:** A breaking change is any change that:

- Changes the interface contract (input/output fields)
- Removes or renames a skill
- Changes artifact field requirements
- Modifies role boundaries

Breaking changes must be disclosed in the `breaking_changes` field:

```yaml
breaking_changes:
  - "Field 'x' removed from artifact Y"
  - "Skill Z renamed to Skill W"
```

---

### Q12: How specific should the summary be?

**A:** The summary should be **specific and actionable**:

**Good**: "Added 2 docs skills (readme-sync, changelog-writing) with artifact contracts and validation layer"
**Bad**: "Various documentation improvements"

The summary should give maintainers enough information to write release notes.

---

## Escalation Questions

### Q13: When should I escalate vs. document?

**A:**

**Escalate (recommendation = blocked)** when:
- Upstream artifacts missing or insufficient
- Conflicting status claims that cannot be resolved
- Documentation debt blocking synchronization
- Major README restructuring required

**Document (in unresolved_ambiguities)** when:
- Minor inconsistency that doesn't block sync
- Missing optional field in upstream artifact
- Ambiguity with clear temporary assumption

---

### Q14: What information should I include when escalating?

**A:** Include:

```yaml
escalation:
  reason_type: MISSING_ARTIFACT | CONFLICTING_STATUS | DOCUMENTATION_DEBT | AMBIGUOUS_EVIDENCE
  summary: "Clear description of the issue"
  blocking_points:
    - "Specific item blocking sync"
    - "Another blocking item"
  recommended_next_steps:
    - "Action to resolve blocker"
```

---

## Anti-Pattern Questions

### Q15: What is "status inflation" (AP-001)?

**A:** Status inflation occurs when documentation shows a feature as more complete than evidence supports.

**Example**: README shows "Complete" but completion-report shows "Substantially Complete with Known Gaps"

**Prevention**:
- Always verify status against acceptance-decision-record
- Document any discrepancies in consistency_checks
- Never declare complete without evidence

---

### Q16: What is "over-updating" (AP-002)?

**A:** Over-updating occurs when docs rewrites sections unrelated to the actual change.

**Example**: Restructuring the entire README when only adding one skill

**Prevention**:
- Apply BR-002 minimal surface area
- Document each touched section with change_reason
- Justify any non-minimal changes

---

### Q17: What is "speculation-based documentation" (AP-007)?

**A:** Writing documentation about unimplemented or assumed features instead of actual implementation.

**Example**: Documenting a feature as "supports X" when X is planned but not implemented

**Prevention**:
- BR-001: Only document what's in upstream artifacts
- Verify against implementation-summary.changed_files
- Never write about planned features as if they exist

---

## Output Artifact Questions

### Q18: What goes in docs-sync-report?

**A:** The docs-sync-report has 8 required fields:

| Field | Purpose |
|-------|---------|
| sync_target | Feature being synchronized |
| consumed_artifacts | Upstream artifacts used (BR-001) |
| touched_sections | Documentation sections updated (BR-002) |
| change_reasons | Why each section changed |
| consistency_checks | Cross-document verification (BR-005) |
| status_updates | Feature status changes |
| unresolved_ambiguities | Items needing clarification |
| recommendation | sync-complete / needs-follow-up / blocked |

---

### Q19: What goes in changelog-entry?

**A:** The changelog-entry has 10 required fields:

| Field | Purpose |
|-------|---------|
| feature_id | Feature identifier |
| feature_name | Human-readable name |
| change_type | feature / repair / docs-only / governance |
| summary | Concise change description |
| capability_changes | New capabilities added |
| docs_changes | Documentation changes |
| validation_changes | Testing/validation changes |
| breaking_changes | Breaking changes (if any) |
| known_limitations | Known gaps or limitations |
| related_features | Related feature IDs |

---

### Q20: Can I have empty fields in the artifacts?

**A:**

| Field | Can Be Empty? | Notes |
|-------|---------------|-------|
| consumed_artifacts | ❌ No | At least one required |
| touched_sections | ❌ No (unless blocked) | Must document changes |
| change_reasons | ❌ No (unless blocked) | Must justify changes |
| consistency_checks | ❌ No | At least one check required |
| status_updates | ✅ Yes | If no status changed |
| unresolved_ambiguities | ✅ Yes | If no ambiguities |
| breaking_changes | ✅ Yes | If no breaking changes |
| known_limitations | ✅ Yes | If no known limitations |

---

## References

- `specs/007-docs-core/spec.md` - Feature specification
- `specs/007-docs-core/role-scope.md` - Role boundaries
- `specs/007-docs-core/contracts/docs-sync-report-contract.md` - Artifact contract
- `specs/007-docs-core/contracts/changelog-entry-contract.md` - Artifact contract
- `role-definition.md` Section 5 - Canonical docs role definition