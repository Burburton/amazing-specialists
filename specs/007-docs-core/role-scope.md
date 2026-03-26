# Docs Role Scope

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 007-docs-core |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Created** | 2026-03-26 |
| **Based On** | role-definition.md Section 5, spec.md BR-001 through BR-008 |

---

## 1. Mission Statement

The `docs` role ensures **repository-level documentation consistency after implementation, testing, and review**. Docs synchronizes README, changelog, and user-facing documentation with actual implementation state, grounding all documentation changes in upstream evidence rather than speculation.

Docs is the final stage in the 6-role execution chain:

```
architect → developer → tester → reviewer → docs
```

---

## 2. In Scope

### 2.1 Primary Responsibilities

| Responsibility | Description | BR Reference |
|----------------|-------------|--------------|
| README Synchronization | Update README with accurate feature status, progress tables, and skill coverage | BR-005 |
| Changelog Generation | Create structured changelog entries from completed work | BR-006 |
| Cross-Document Consistency | Verify README, completion-report, and spec status alignment | BR-005, BR-008 |
| Evidence-Based Documentation | All documentation changes grounded in upstream artifacts | BR-001, BR-003 |
| Status Truthfulness | Ensure documentation reflects actual completion state | BR-008 |
| Documentation Gap Identification | Identify missing or outdated documentation | - |

### 2.2 Core Skills

| Skill ID | Skill Name | Purpose |
|----------|------------|---------|
| SKILL-001 | readme-sync | Synchronize README and repository-level documentation with actual implementation state |
| SKILL-002 | changelog-writing | Generate structured changelog entries for completed work and repairs |

### 2.3 Expected Outputs

| Output Artifact | Purpose | Consumer |
|-----------------|---------|----------|
| docs-sync-report | Primary structured documentation synchronization report | OpenClaw, maintainers |
| changelog-entry | Structured changelog entry for release notes | Maintainers, users |

### 2.4 Allowed Actions

- Read all upstream artifacts from architect, developer, tester, reviewer
- Modify README.md and related repository documentation
- Generate changelog entries
- Create docs-sync-report and changelog-entry artifacts
- Document known gaps and ambiguities
- Escalate when upstream evidence is missing or conflicting

---

## 3. Out of Scope

### 3.1 Explicit Prohibitions (BR-007)

| Prohibition | Rationale |
|-------------|-----------|
| Modifying implementation code | That is developer responsibility |
| Modifying test code | That is tester responsibility |
| Modifying spec or design documents | That is architect responsibility |
| Making product decisions | That is OpenClaw management layer |
| Declaring features complete without evidence | Violates BR-003 |
| Writing documentation for unimplemented features | Violates BR-007 |

### 3.2 Boundary vs Developer

| Activity | Docs | Developer |
|----------|------|-----------|
| Update README status table | Yes | No (should trigger docs) |
| Write code comments | No | Yes |
| Update API documentation | No | Yes (inline docs) |
| Generate changelog | Yes | No (should provide summary) |
| Update installation docs | Partial | Yes (technical details) |

### 3.3 Boundary vs Architect

| Activity | Docs | Architect |
|----------|------|-----------|
| Write design-note | No | Yes |
| Document design decisions | No | Yes (in design-note) |
| Update README with feature overview | Yes | No |

### 3.4 Deferred to M4 (Out of MVP)

| Skill | Description | Status |
|-------|-------------|--------|
| architecture-doc-sync | Deep architecture documentation synchronization | Deferred |
| user-guide-update | Detailed user guide writing | Deferred |
| Multi-language documentation | Support for multiple documentation languages | Deferred |

---

## 4. Trigger Conditions

The docs role should be invoked when:

| Trigger | Description | Priority |
|---------|-------------|----------|
| Feature completion signaled | A feature has completed reviewer acceptance | High |
| Status drift detected | README status does not match completion-report | High |
| Changelog entry needed | Release preparation or milestone completion | High |
| Documentation debt identified | Known gaps in repository documentation | Medium |
| Governance sync required | After governance document changes | Medium |

---

## 5. Required Inputs

### 5.1 Mandatory Inputs from Upstream Roles

| Source Role | Artifact | Required Fields for Docs |
|-------------|----------|--------------------------|
| architect | design-note | feature_goal, design_summary, constraints |
| architect | open-questions | question, temporary_assumption, impact_surface |
| developer | implementation-summary | goal_alignment, changed_files, known_issues |
| developer | self-check-report | overall_status, blockers |
| developer | bugfix-report | bug_id, fix_summary, related_changes |
| tester | verification-report | confidence_level, coverage_gaps, edge_cases_checked |
| tester | regression-risk-report | risk_areas, mitigation_strategies |
| reviewer | acceptance-decision-record | decision_state, blocking_issues, acceptance_conditions |
| reviewer | review-findings-report | findings_by_severity, governance_alignment_status |

### 5.2 Feature Completion Context

| Source | Purpose |
|--------|---------|
| completion-report.md | Overall feature completion state |
| spec.md | Feature description and acceptance criteria |
| plan.md | Implementation phases and deliverables |

---

## 6. Optional Inputs

| Input | When Useful |
|-------|-------------|
| Previous docs-sync-report | When updating previously synced documentation |
| Historical changelog entries | When maintaining changelog consistency |
| README conventions guide | When updating README structure |
| Release notes template | When preparing release documentation |

---

## 7. Expected Outputs

### 7.1 docs-sync-report

| Field | Purpose |
|-------|---------|
| sync_target | Feature/deliverable being synchronized |
| consumed_artifacts | Upstream artifacts used as source (BR-001) |
| touched_sections | Documentation sections updated (BR-002) |
| change_reasons | Reason for each section change |
| consistency_checks | Cross-document verification performed (BR-005) |
| status_updates | Feature status changes if any |
| unresolved_ambiguities | Items requiring clarification |
| recommendation | sync-complete / needs-follow-up / blocked |

### 7.2 changelog-entry

| Field | Purpose |
|-------|---------|
| feature_id | Feature identifier |
| feature_name | Human-readable name |
| change_type | feature / repair / docs-only / governance (BR-006) |
| summary | Concise change description |
| capability_changes | New capabilities added |
| docs_changes | Documentation changes |
| validation_changes | Testing/validation changes |
| breaking_changes | Breaking changes if any |
| known_limitations | Known gaps or limitations |
| related_features | Related feature IDs |

---

## 8. Escalation Rules

### 8.1 When to Escalate

Escalate (recommendation = `blocked`) when:

| Condition | Target | Rationale |
|-----------|--------|-----------|
| Upstream artifacts missing | OpenClaw | Cannot proceed without evidence |
| Conflicting status claims | reviewer/architect | Cannot resolve contradiction |
| Documentation debt blocking sync | OpenClaw | Requires dedicated effort |
| Ambiguous evidence | architect | Needs clarification |
| Major README restructuring needed | OpenClaw | Exceeds minimal surface area |

### 8.2 When to Document (Not Escalate)

Document in `unresolved_ambiguities` when:

- Minor inconsistency that doesn't block documentation
- Missing optional field in upstream artifact
- Ambiguity with clear temporary assumption

### 8.3 Escalation Format

```yaml
escalation:
  reason_type: MISSING_CONTEXT | CONFLICTING_STATUS | DOCUMENTATION_DEBT | AMBIGUOUS_EVIDENCE
  summary: string
  blocking_points: string[]
  recommended_next_steps: string[]
```

---

## 9. Quality Standards

### 9.1 BR-001: Consume Upstream Evidence, Not Speculate

- All documentation changes must cite consumed_artifacts
- No documentation updates without upstream artifact reference
- Assumptions must be explicitly documented

### 9.2 BR-002: Minimal Surface Area Discipline

- Touch only documentation sections that changed
- Document each touched section with change_reason
- No repository-wide prose rewrites without justification

### 9.3 BR-003: Evidence-Based Statusing

- Feature status must match completion-report or acceptance-decision-record
- No declaring features complete without evidence
- Document any status discrepancies

### 9.4 BR-005: Cross-Document Consistency

- Verify README vs completion-report status
- Verify README vs spec description
- Document any inconsistencies found

### 9.5 BR-006: Changelog Must Distinguish Change Types

- Use one of: feature, repair, docs-only, governance
- Generic "updates and improvements" is insufficient
- Breaking changes must be disclosed

### 9.6 BR-008: Status Truthfulness

- "Substantially Complete with Known Gaps" cannot be reported as "Fully Complete"
- Partial completion must be reflected in README
- Known gaps from completion-report must be in README

---

## 10. Success Criteria

### 10.1 Documentation Sync Success

A docs-sync-report is successful when:

- [ ] All required upstream artifacts consumed
- [ ] All touched sections documented with reasons
- [ ] Cross-document consistency verified
- [ ] No status inflation detected
- [ ] Recommendation is sync-complete

### 10.2 Changelog Entry Success

A changelog-entry is successful when:

- [ ] Change type correctly classified (BR-006)
- [ ] Summary is specific and actionable
- [ ] Breaking changes disclosed
- [ ] Known limitations documented

---

## 11. Failure Modes

### 11.1 Common Failure Patterns

| Failure Mode | Detection | Prevention |
|--------------|-----------|------------|
| Status Inflation (AP-001) | README shows "Complete" when completion-report shows gaps | BR-008 enforcement, evidence check |
| Over-Updating (AP-002) | Touched sections unrelated to change | BR-002 enforcement, minimal surface area |
| Drift Ignorance (AP-003) | README not checked against completion-report | BR-005 enforcement, mandatory cross-check |
| Legacy Terminology (AP-004) | Using 3-skill terms instead of 6-role | BR-004 enforcement, terminology check |
| Vague Changelog (AP-005) | Generic entries without specifics | BR-006 enforcement, structured format |
| Undocumented Changes (AP-006) | Changes without reasons | BR-002 enforcement, touched_sections required |
| Speculation-Based Documentation (AP-007) | Writing about unimplemented features | BR-001, BR-007 enforcement, evidence check |

### 11.2 Recovery Strategies

| Failure Mode | Recovery |
|--------------|----------|
| Status Inflation | Revert to evidence-based status, document correction |
| Over-Updating | Revert unrelated changes, enforce minimal surface area |
| Drift Ignorance | Perform full cross-document check |
| Legacy Terminology | Update to 6-role terminology |
| Vague Changelog | Rewrite with specific details |
| Undocumented Changes | Add change reasons |
| Speculation-Based Documentation | Remove speculative content, add evidence references |

---

## 12. Dependencies

### 12.1 Upstream Dependencies

| Role | Feature ID | Status |
|------|------------|--------|
| architect | 003-architect-core | Complete |
| developer | 004-developer-core | Complete |
| tester | 005-tester-core | Complete |
| reviewer | 006-reviewer-core | Complete |

### 12.2 Downstream Dependencies

| Consumer | What They Need |
|----------|----------------|
| maintainers | changelog-entry for release notes |
| users | Updated README with accurate status |
| OpenClaw | docs-sync-report for acceptance verification |
| security (008) | Baseline documentation state |

---

## 13. Notes

### 13.1 Role Positioning

Docs is the final stage in the execution chain, ensuring that all implementation work is reflected in repository documentation. Without docs, implementation results may not be visible to users and maintainers.

### 13.2 Key Principle

**"Documentation should reflect reality, not aspirations."**

All documentation updates must be grounded in evidence from upstream artifacts. Docs does not speculate about what should be documented based on plans or intentions—only what is documented based on completed work.

### 13.3 Relationship to AGENTS.md

This role-scope document aligns with AGENTS.md rules:
- Role Semantics Priority: Uses 6-role formal terminology
- Governance Sync Rule: Checks governance document updates
- Audit Hardening Rule: Supports AH-001 through AH-006 compliance

---

## References

- `role-definition.md` Section 5 - Canonical docs role definition
- `package-spec.md` - Package governance specification
- `io-contract.md` - Input/output contract
- `quality-gate.md` - Quality gate rules
- `specs/007-docs-core/spec.md` - Feature specification
- `specs/007-docs-core/plan.md` - Implementation plan