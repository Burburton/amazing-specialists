# Downstream Consumability Checklist

## Purpose
Verify that reviewer outputs can be consumed by downstream roles (acceptance, docs, security, developer).

---

## 1. Acceptance Layer Consumption Checks

### 1.1 review-report Decision State Checks

| Field | Check | Status |
|-------|-------|--------|
| `decision` | [ ] One of: accept/accept-with-conditions/reject/needs-clarification (BR-003) | |
| `decision` | [ ] Decision state appropriate for findings | |
| `rationale` | [ ] Clear explanation of why decision was made | |
| `confidence_level` | [ ] HIGH/MEDIUM/LOW with justification | |
| `findings_summary` | [ ] Overview of issues found | |
| `blocking_issues` | [ ] Must-fix items preventing acceptance (if reject) | |
| `non_blocking_issues` | [ ] Issues that don't prevent acceptance (if accept-with-conditions) | |
| `conditions` | [ ] Conditions for conditional acceptance documented | |

### 1.2 Decision State Compliance (BR-003)

| Decision State | Criteria Met | Status |
|----------------|--------------|--------|
| **accept** | [ ] All spec requirements verified | |
| | [ ] Test evidence sufficient and passing | |
| | [ ] No blocker or major issues | |
| | [ ] Governance alignment verified | |
| | [ ] Residual risks documented and acceptable | |
| **accept-with-conditions** | [ ] Core requirements met | |
| | [ ] Minor issues documented but not blocking | |
| | [ ] Some gaps acknowledged with mitigation plan | |
| | [ ] Governance drift noted but acceptable | |
| **reject** | [ ] Must-fix issues exist (blocker or major) | |
| | [ ] Critical spec deviations documented | |
| | [ ] Test failures unaddressed | |
| | [ ] Governance violations identified (AH-006) | |
| | [ ] Evidence quality insufficient | |
| **needs-clarification** | [ ] Spec ambiguous for key requirements | |
| | [ ] Missing test evidence for critical paths | |
| | [ ] Unclear whether implementation matches intent | |

### 1.3 governance-alignment-report Checks

| Field | Check | Status |
|-------|-------|--------|
| `alignment_status` | [ ] ALIGNED or DRIFT_DETECTED | |
| `conflicts` | [ ] Governance conflicts listed (if any) | |
| `canonical_documents_checked` | [ ] role-definition.md, package-spec.md, io-contract.md verified | |
| `recommendations` | [ ] Actionable recommendations for alignment | |

### 1.4 Confidence Level Assessment

| Level | Criteria | Check |
|-------|----------|-------|
| **HIGH** | [ ] Clear evidence; unambiguous spec mapping; proceed with confidence | |
| **MEDIUM** | [ ] Some ambiguity; reasonable judgment; consider monitoring | |
| **LOW** | [ ] Significant uncertainty; consider additional verification | |

---

## 2. Docs Consumption Checks

### 2.1 Documentation Impact Assessment

| Field | Check | Status |
|-------|-------|--------|
| `documentation_impact` | [ ] Section present in review-report | |
| `affected_areas` | [ ] Documents requiring updates listed | |
| `change_type` | [ ] Type of change (update/add/remove) specified | |
| `priority` | [ ] must-sync/should-sync/optional assigned | |

### 2.2 Governance Sync Requirements

| Check | Status | Notes |
|-------|--------|-------|
| [ ] Governance documents requiring sync identified | | |
| [ ] Specific sections requiring updates listed | | |
| [ ] Sync priority assigned (must-sync > should-sync > optional) | | |
| [ ] No governance sync needed = explicitly stated with justification | | |

### 2.3 Documentation Finding Categories

| Category | Check | Status |
|----------|-------|--------|
| **API docs** | [ ] Changes to API documented | |
| **README.md** | [ ] Status/feature changes reflected | |
| **AGENTS.md** | [ ] Role/workflow changes noted | |
| **role-definition.md** | [ ] Role boundary changes captured | |
| **package-spec.md** | [ ] Package capability changes noted | |

---

## 3. Security Consumption Checks

### 3.1 Security Findings Checks

| Field | Check | Status |
|-------|-------|--------|
| `security_findings` | [ ] Section present in review-report | |
| `category` | [ ] One of: Authentication/Authorization/Input Validation/Secret/Credential/Dependency/Data Exposure | |
| `severity` | [ ] blocker/major/minor/note per quality-gate.md Section 2.2 | |
| `description` | [ ] Clear description of vulnerability | |
| `location` | [ ] File path, line number, code snippet | |
| `impact` | [ ] Potential impact of vulnerability | |
| `recommendation` | [ ] Actionable recommendation (often: trigger security role) | |

### 3.2 Security Escalation Triggers

| Trigger | Severity | Escalation Required | Status |
|---------|----------|---------------------|--------|
| Auth/permission vulnerability | blocker | [ ] Immediate security role escalation | |
| Secret/credential exposed | blocker | [ ] Immediate security role escalation | |
| Input validation issue | major+ | [ ] Security role review recommended | |
| Dependency vulnerability | varies | [ ] Assess severity; escalate if high/critical | |
| PII exposure risk | major+ | [ ] Security role review recommended | |

### 3.3 Security Finding Format

| Element | Check | Status |
|---------|-------|--------|
| [ ] finding_id present | | |
| [ ] category specified | | |
| [ ] severity justified by impact | | |
| [ ] location includes file/line/code | | |
| [ ] impact statement clear | | |
| [ ] recommendation actionable | | |
| [ ] CWE reference (if applicable) | | |

---

## 4. Developer Consumption Checks (On Reject)

### 4.1 actionable-feedback-report Checks

| Field | Check | Status |
|-------|-------|--------|
| `report_id` | [ ] Unique identifier present | |
| `review_decision` | [ ] Matches review-report decision (reject) | |
| `summary` | [ ] High-level summary of rejection reasons | |
| `must_fix_items` | [ ] Blocking items listed | |
| `should_fix_items` | [ ] Non-blocking improvements listed | |
| `verification_requirements` | [ ] How to verify fixes | |
| `non_goals` | [ ] Scope boundaries for fixes | |

### 4.2 Must-Fix Item Format

| Element | Check | Status |
|---------|-------|--------|
| [ ] item_id present | | |
| [ ] severity specified (blocker/major) | | |
| [ ] category specified | | |
| [ ] issue description clear | | |
| [ ] location includes file/line/current_code | | |
| [ ] spec_reference links to requirement | | |
| [ ] fix_suggestion specific and actionable | | |
| [ ] verification method defined | | |

### 4.3 Actionability Requirements (BR-005)

| Prohibited (BR-005 Violation) | Check NOT Present | Status |
|-------------------------------|-------------------|--------|
| ❌ "Needs improvement" without specifics | [ ] Absent | |
| ❌ "This doesn't meet our standards" | [ ] Absent | |
| ❌ "Consider refactoring" without guidance | [ ] Absent | |
| ❌ Fix suggestion that's too vague | [ ] Absent | |

| Required (BR-005 Compliant) | Check Present | Status |
|-----------------------------|---------------|--------|
| ✅ Specific file/line reference | [ ] Present | |
| ✅ Clear issue description | [ ] Present | |
| ✅ Actionable fix suggestion | [ ] Present | |
| ✅ Defined verification method | [ ] Present | |

---

## 5. Evidence Quality Checks

### 5.1 Evidence Traceability

| Check | Status | Notes |
|-------|--------|-------|
| [ ] Evidence traceable to specific file/line | | |
| [ ] Finding traceable to spec requirement | | |
| [ ] Severity justified by impact | | |
| [ ] Governance alignment checked (AH-006) | | |

### 5.2 Evidence Quality Levels (BR-004)

| Level | Characteristics | Check |
|-------|-----------------|-------|
| **HIGH** | [ ] Specific file/line/spec references; Clear reproduction steps; Direct spec mapping | |
| **MEDIUM** | [ ] General code area; Some evidence; Reasonable inference | |
| **LOW** | [ ] "Something feels wrong" without specifics - DO NOT INCLUDE | |

### 5.3 Vague Evidence Detection

| Vague Pattern | Check NOT Present | Status |
|---------------|-------------------|--------|
| ❌ "Code looks fine" without observations | [ ] Absent | |
| ❌ "LGTM" without evidence | [ ] Absent | |
| ❌ "Should work" without traceability | [ ] Absent | |
| ❌ "No issues found" when testing was partial | [ ] Absent | |
| ❌ Governance alignment not checked (AH-006 violation) | [ ] Absent | |

---

## 6. Severity Classification Checks (BR-004)

### 6.1 Severity Level Compliance

| Severity | Definition | Appropriate Use | Check |
|----------|------------|-----------------|-------|
| **blocker** | Must fix; blocks milestone | Critical spec deviation; forged verification; security vulnerability; governance violation | [ ] Used correctly |
| **major** | Must fix; affects downstream | Canonical document conflict; README misleading; path error; terminology inconsistency | [ ] Used correctly |
| **minor** | Suggest fix; non-blocking | Minor terminology inconsistency; format suggestions; non-critical field missing | [ ] Used correctly |
| **note** | Informational | Observations; optional improvements; background info | [ ] Used correctly |

### 6.2 Finding Categories (AH-006)

| Category | Severity Range | Check |
|----------|----------------|-------|
| **Implementation Gap** | [ ] major/blocker as appropriate | |
| **Governance Drift** | [ ] major (require alignment or document drift) | |
| **Documentation Inconsistency** | [ ] major (require sync) | |
| **Path Mismatch** | [ ] major (require correction) | |
| **Status Misrepresentation** | [ ] major (require honest disclosure) | |

---

## 7. Coverage Gap Disclosure Checks

### 7.1 Review Coverage Disclosure

| Field | Check | Status |
|-------|-------|--------|
| `areas_reviewed` | [ ] Areas explicitly listed | |
| `depth` | [ ] full/partial/sampling specified per area | |
| `confidence` | [ ] Confidence level per area | |
| `gaps` | [ ] Gaps disclosed per area | |
| `areas_not_reviewed` | [ ] Areas not reviewed listed with reasons | |
| `risk` | [ ] Risk of not reviewing disclosed | |

### 7.2 Coverage Depth Definitions

| Depth | Definition | When Used | Check |
|-------|------------|-----------|-------|
| **full** | Every file/line/function reviewed | Critical paths; security-sensitive code | [ ] Used correctly |
| **partial** | Key areas reviewed; some areas sampled | Standard features; time constraints | [ ] Used correctly |
| **sampling** | Representative samples reviewed | Low-risk changes; large codebases | [ ] Used correctly |

---

## 8. Per-Role Artifact Mapping

### 8.1 acceptance Consumption

| Artifact | Section | Consumable | Notes |
|----------|---------|:----------:|-------|
| **review-report** | decision | [ ] | |
| | rationale | [ ] | |
| | confidence_level | [ ] | |
| | findings_summary | [ ] | |
| | blocking_issues | [ ] | |
| **governance-alignment-report** | alignment_status | [ ] | |
| | conflicts | [ ] | |

### 8.2 docs Consumption

| Artifact | Section | Consumable | Notes |
|----------|---------|:----------:|-------|
| **review-report** | documentation_impact | [ ] | |
| | affected_areas | [ ] | |
| **governance-alignment-report** | governance_sync_needed | [ ] | |
| | affected_documents | [ ] | |

### 8.3 security Consumption

| Artifact | Section | Consumable | Notes |
|----------|---------|:----------:|-------|
| **review-report** | security_findings | [ ] | |
| | severity | [ ] | |
| | impact | [ ] | |
| | recommendation | [ ] | |

### 8.4 developer Consumption (On Reject)

| Artifact | Section | Consumable | Notes |
|----------|---------|:----------:|-------|
| **review-report** | decision | [ ] | |
| | blocking_issues | [ ] | |
| **actionable-feedback-report** | must_fix_items | [ ] | |
| | fix_suggestions | [ ] | |
| | verification_requirements | [ ] | |
| | non_goals | [ ] | |

---

## 9. Quality Gates

### 9.1 acceptance Gate

- [ ] Can understand decision from decision state
- [ ] Can understand reasoning from rationale
- [ ] Can assess confidence from confidence_level
- [ ] Can verify governance from governance-alignment-report
- [ ] Can make accept/reject/escalate decision

### 9.2 docs Gate

- [ ] Can identify documentation changes needed from documentation_impact
- [ ] Can understand governance sync requirements
- [ ] Can prioritize updates (must-sync vs should-sync)
- [ ] Can execute documentation sync

### 9.3 security Gate

- [ ] Can identify security-relevant issues from security_findings
- [ ] Can assess severity and impact
- [ ] Can determine escalation level
- [ ] Can perform deep security analysis if needed

### 9.4 developer Gate (On Reject)

- [ ] Can understand rejection from summary
- [ ] Can identify what to fix from must_fix_items
- [ ] Can understand how to fix from fix_suggestions
- [ ] Can verify fixes from verification_requirements
- [ ] Knows scope boundaries from non_goals

---

## 10. BR-006: Governance Alignment Validation

### 10.1 Mandatory Canonical Comparison (AH-001)

| Canonical Document | Checked | Conflicts Found | Status |
|--------------------|:-------:|-----------------|--------|
| role-definition.md | [ ] | | |
| package-spec.md | [ ] | | |
| io-contract.md | [ ] | | |
| quality-gate.md | [ ] | | |
| README.md | [ ] | | |

### 10.2 Cross-Document Consistency (AH-002)

| Check | Status | Notes |
|-------|--------|-------|
| [ ] Flow ordering consistent across documents | | |
| [ ] Role boundaries consistent across documents | | |
| [ ] Phase states consistent across documents | | |
| [ ] Terminology consistent across documents | | |

### 10.3 Path Resolution (AH-003)

| Declared Path | Resolves | Status |
|---------------|:--------:|--------|
| | [ ] | |

### 10.4 Status Truthfulness (AH-004)

| Check | Status | Notes |
|-------|--------|-------|
| [ ] completion-report partial/gaps disclosed in README | | |
| [ ] No "Fully Complete" misreporting | | |

---

## 11. Pre-Handoff Checklist

### 11.1 Reviewer Pre-Handoff

- [ ] review-report complete with decision state
- [ ] Decision state is one of: accept/accept-with-conditions/reject/needs-clarification (BR-003)
- [ ] All findings have severity classification (blocker/major/minor/note)
- [ ] All findings have evidence backing (BR-004)
- [ ] actionable-feedback-report created if decision is reject
- [ ] Documentation impact assessed for docs role
- [ ] Security findings flagged for security role
- [ ] Governance alignment checked (AH-006)
- [ ] Coverage gaps disclosed
- [ ] Confidence level justified

### 11.2 Downstream Post-Handoff

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

## 12. Checklist Summary

| Category | Checks | Required |
|----------|--------|----------|
| Acceptance Layer Consumption Checks | 31 | All required |
| Docs Consumption Checks | 12 | All required |
| Security Consumption Checks | 18 | All required |
| Developer Consumption Checks | 19 | All required |
| Evidence Quality Checks | 14 | All required |
| Severity Classification Checks | 11 | All required |
| Coverage Gap Disclosure Checks | 9 | All required |
| Per-Role Artifact Mapping | 22 | All required |
| Quality Gates | 19 | All required |
| Governance Alignment Validation | 12 | All required |
| Pre-Handoff Checklist | 21 | All required |
| **Total** | **188** | **All required** |

---

## References

- `specs/006-reviewer-core/spec.md` - Feature specification (Section 6 Business Rules, Section 7 Artifact Contracts)
- `specs/006-reviewer-core/downstream-interfaces.md` - Detailed handoff guide
- `specs/006-reviewer-core/role-scope.md` - Reviewer role scope (Section 5: Outputs)
- `role-definition.md` Section 4 - Reviewer role definition
- `role-definition.md` Section 5 - Docs role definition
- `role-definition.md` Section 6 - Security role definition
- `quality-gate.md` Section 2.2 - Findings severity definitions
- `docs/audit-hardening.md` - Enhanced audit requirements (AH-006)
- `io-contract.md` - I/O contract standards

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial downstream consumability checklist for 006-reviewer-core |