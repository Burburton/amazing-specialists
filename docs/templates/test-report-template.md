# Test Report Template (Verification Report)

**Version**: 1.0.0  
**Created**: 2026-03-27  
**Source Contract**: `specs/005-tester-core/contracts/verification-report-contract.md`  
**Producer Role**: `tester`

---

## Purpose

This template provides the standard structure for creating a `verification-report` artifact. The verification-report records what tests were designed/run, what passed/failed, and what remains unknown with honest evidence-based reporting.

---

## Template Structure

Copy and fill in the sections below:

```markdown
# Verification Report: [Task ID]

## Metadata
- **Dispatch ID**: [dispatch_XXX_XXX]
- **Task ID**: [T-XXX-XXX]
- **Created**: [YYYY-MM-DDTHH:MM:SSZ]
- **Author**: tester

---

## 1. Test Scope Reference

**Report Path**: [Path to test-scope-report]

**Scope Version**: [Version identifier]

**Scope Summary**: [Brief description of test scope]

---

## 2. Tests Added or Run

### New Tests
| Test ID | File Path | Test Name | Type | Category | Description |
|---------|-----------|-----------|------|----------|-------------|
| [TC-XXX] | [Path] | [Name] | unit / integration / e2e / manual | happy_path / error_path / boundary / regression | [Description] |

### Modified Tests (if applicable)
| Test ID | File Path | Modification |
|---------|-----------|--------------|
| [TC-XXX] | [Path] | [What was modified] |

### Executed Tests
| Test ID | Execution Time (ms) | Result |
|---------|--------------------| -------|
| [TC-XXX] | [Milliseconds] | pass / fail / skip / blocked |

---

## 3. Execution Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | [Number] |
| **Passed** | [Number] |
| **Failed** | [Number] |
| **Skipped** | [Number] |
| **Blocked** | [Number] |
| **Environment** | [Where tests ran] |
| **Timestamp** | [Execution timestamp] |
| **Framework** | [Test framework + version] |
| **Duration** | [Seconds] |

---

## 4. Pass Cases

| Test ID | Description | Evidence Summary | Automated |
|---------|-------------|------------------|-----------|
| [TC-XXX] | [What passed] | [Evidence] | true / false |

---

## 5. Failed Cases

| Test ID | Description | Failure Message | Failure Type | Reproduction Steps |
|---------|-------------|-----------------|--------------|---------------------|
| [TC-XXX] | [What failed] | [Error message] | assertion / exception / timeout / environment | [Steps to reproduce] |

(If no failures, use empty list: [])

---

## 6. Failure Classification

| Test ID | Classification | Rationale | Severity | Suggested Owner | Recommended Action |
|---------|----------------|-----------|----------|-----------------|-------------------|
| [TC-XXX] | implementation / test / environment / design / dependency | [Why this classification] | critical / major / minor | [Role to fix] | [Action] |

(Required if there are failed_cases)

---

## 7. Evidence

### Automated Evidence
| Type | Source | Description |
|------|--------|-------------|
| log / screenshot / diff / coverage_report / assertion_output | [File path] | [Description] |

### Manual Evidence (if applicable)
| Type | Description | Observer | Timestamp |
|------|-------------|----------|-----------|
| observation / interview / document_review | [Description] | [Name] | [Timestamp] |

### Coverage Report
| Metric | Value | Report Path |
|--------|-------|-------------|
| Statement Coverage | [Percentage] | [Path or null] |
| Branch Coverage | [Percentage] | |
| Function Coverage | [Percentage] | |

---

## 8. Coverage Gaps

| Gap ID | Description | Affected Component | Reason Uncovered | Risk Assessment | Priority |
|--------|-------------|--------------------|--------------------|-----------------|----------|
| [GAP-XXX] | [What's not tested] | [Component] | [Why not covered] | [What could go wrong] | high / medium / low |

(Required even if empty - must check for gaps)

---

## 9. Edge Cases Checked

| Edge ID | Description | Category | Result | Notes |
|---------|-------------|----------|--------|-------|
| [EDGE-XXX] | [Edge case] | boundary / invalid_input / race_condition / resource_limit | pass / fail / not_tested / blocked | [Additional notes] |

---

## 10. Blocked Items

| Block ID | Description | Blocker Type | Impact | Workaround Available | Workaround Description |
|----------|-------------|--------------|--------|---------------------|------------------------|
| [BLOCK-XXX] | [What's blocked] | environment / spec_ambiguity / dependency / resource / access | [What cannot be tested] | true / false | [Workaround or null] |

---

## 11. Confidence Level

**Level**: FULL / PARTIAL / LOW

**Rationale**: [Why this confidence level]

**Evidence Strength**: [Description of evidence quality]

**Assumptions Made**: [List of assumptions, if any]

---

## 12. Recommendation

**Action**: PASS_TO_REVIEW / REWORK / RETEST / ESCALATE

---

## 13. Notes (optional)

[Any additional context]

---

## 14. Attachments (optional)

| Name | Path | Description |
|------|------|-------------|
| [Name] | [Path] | [Description] |
```

---

## Required Fields

Per the contract, the following fields are **mandatory**:

| Field | Required | Notes |
|-------|----------|-------|
| `dispatch_id` | Yes | Matches upstream dispatch |
| `task_id` | Yes | Task identifier |
| `test_scope_reference.report_path` | Yes | Path to test scope report |
| `tests_added_or_run` | Yes | At least one entry |
| `execution_summary` | Yes | All sub-fields |
| `pass_cases` | Yes | Can be empty list |
| `failed_cases` | Yes | Can be empty list |
| `failure_classification` | Yes | Required if failed_cases exists |
| `evidence` | Yes | Must be tester's independent evidence |
| `coverage_gaps` | Yes | Required even if "all tests pass" |
| `edge_cases_checked` | Yes | Can be empty |
| `blocked_items` | Yes | Can be empty |
| `confidence_level.level` | Yes | FULL / PARTIAL / LOW |
| `confidence_level.rationale` | Yes | Why this level |
| `recommendation` | Yes | Action enum |

---

## Field Specifications

### failure_classification.classification

| Value | Definition | Next Action |
|-------|------------|-------------|
| `implementation` | Code logic error | Return to developer |
| `test` | Test design/execution problem | Fix test, re-run |
| `environment` | Test environment blocker | Resolve env issue |
| `design` | Ambiguous/missing requirements | Escalate to architect |
| `dependency` | External dependency failure | Check dependency |

### confidence_level.level

| Value | When to Use |
|-------|-------------|
| `FULL` | All planned tests pass with complete evidence |
| `PARTIAL` | Some tests blocked or skipped |
| `LOW` | Significant verification gaps |

### recommendation

| Value | Meaning | Next Action |
|-------|---------|-------------|
| `PASS_TO_REVIEW` | Testing complete | Handoff to reviewer |
| `REWORK` | Implementation issues found | Return to developer |
| `RETEST` | Environment/test issues | Fix and re-test |
| `ESCALATE` | Needs higher decision | Escalate to architect/management |

---

## Validation Rules

### BR-002: Self-Check Distinction
- **Must NOT** use developer self-check as tester evidence
- All evidence must be tester's independent collection
- If citing developer results, mark as "developer self-check (not independent verification)"

### BR-003: Coverage Boundaries
- `coverage_gaps` must truthfully report untested areas
- Even if "all tests pass", check for coverage gaps
- "All good" without scope boundaries is invalid

### BR-004: Failure Classification
- Every failed_case must have failure_classification entry
- Classification must have rationale
- Classification determines next action

### BR-005: Edge Cases
- `edge_cases_checked` must include boundary condition tests
- If no boundary tests, explain in coverage_gaps

### BR-007: Honest Confidence
- confidence_level must truthfully reflect verification completeness
- PARTIAL/LOW must have rationale
- **Must NOT** report PARTIAL/LOW as FULL

---

## Anti-Patterns to Avoid

- ❌ **Using developer self-check as evidence**: Tester must verify independently
- ❌ **No coverage gaps analysis**: Must check what's NOT tested
- ❌ **Misleading confidence level**: Report actual verification completeness
- ❌ **Missing failure classification**: Every failure must be classified
- ❌ **Skipping edge cases**: Must test boundary conditions

---

## Downstream Consumer Usage

### reviewer
- Verify `confidence_level` matches actual evidence
- Check `failure_classification` reasonableness
- Evaluate `coverage_gaps` risks

### acceptance
- Use `recommendation` to decide next action
- Understand `coverage_gaps` risks
- Decide if PARTIAL verification acceptable

### developer
- Respond to `implementation` classification items
- Fix items where `suggested_owner` is developer

---

## References

- Source Contract: `specs/005-tester-core/contracts/verification-report-contract.md`
- Feature Spec: `specs/005-tester-core/spec.md`
- Role Scope: `specs/005-tester-core/role-scope.md`
- Role Definition: `role-definition.md`