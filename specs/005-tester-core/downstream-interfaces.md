# 005-tester-core Downstream Interfaces

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `005-tester-core` |
| **Document Type** | Interface Specification |
| **Version** | 1.0.0 |
| **Created** | 2026-03-25 |
| **Status** | Draft |
| **Owner** | tester |
| **Aligned With** | `role-definition.md` Section 4 (reviewer) |

---

## 1. Overview

### 1.1 Handoff Philosophy

The tester role's primary mission is to **provide trustworthy evidence for downstream decision makers**. This document defines how tester hands off test artifacts to reviewer, acceptance layer, and developer with clear evidence quality requirements, failure classification, and coverage gap disclosure.

**Core Principles:**

1. **Evidence Quality (BR-007)**: Honesty over false confidence. Partial verification reported as partial.

2. **Failure Classification (BR-004)**: Every failure classified into actionable categories.

3. **Coverage Gap Disclosure (BR-003)**: What was not tested is as important as what was tested.

4. **Consumability**: Artifacts structured for downstream role consumption patterns.

5. **Boundary Respect**: Tester provides evidence and recommendation, not approval judgment.

### 1.2 Handoff Flow

```
┌─────────────────────────────────────────────────────────┐
│                      TESTER                             │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ test-scope      │  │ verification-report         │  │
│  │ - derive scope  │  │ - execute tests             │  │
│  │ - document      │  │ - collect evidence          │  │
│  └────────┬────────┘  └────────────┬────────────────┘  │
│           │                        │                    │
│           ▼                        ▼                    │
│  ┌───────────────────────────────────────────────┐     │
│  │ Output Artifacts                              │     │
│  │ - test-scope-report                           │     │
│  │ - verification-report                         │     │
│  │ - regression-risk-report                      │     │
│  └────────────────────┬──────────────────────────┘     │
└───────────────────────┼─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  reviewer   │ │ acceptance  │ │  developer  │
│ (approve?)  │ │ (decide?)   │ │  (fix?)     │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## 2. Reviewer Consumption Guide

### 2.1 What Reviewer Receives

| Artifact | Purpose | Primary Sections for Reviewer |
|----------|---------|------------------------------|
| `test-scope-report` | Understand what was tested and why | `in_scope_items`, `out_of_scope_items`, `risk_priorities` |
| `verification-report` | Judge test quality and evidence | `execution_summary`, `pass_cases`, `failed_cases`, `evidence`, `confidence_level` |
| `regression-risk-report` | Assess regression risk | `regression_surfaces`, `untested_regression_areas`, `risk_ranking` |

### 2.2 How to Read test-scope-report

#### 2.2.1 Key Sections for Approval Judgment

```yaml
# test-scope-report structure for reviewer consumption
test_scope_report:
  input_artifacts: 
    # Reviewer checks: Did tester consume developer outputs?
    - implementation-summary
    - self-check-report
    - bugfix-report (if applicable)
  
  goal_under_test:
    # Reviewer checks: Does this match spec/requirement?
    description: "What behavior is being verified"
  
  changed_surface:
    # Reviewer checks: Are all changed files covered?
    files_in_scope: ["list of files"]
  
  risk_priorities:
    # Reviewer checks: Were high-risk areas prioritized?
    high_risk_areas: ["prioritized items"]
  
  in_scope_items:
    # Reviewer checks: What was explicitly tested
    - "Scenario 1"
    - "Scenario 2"
  
  out_of_scope_items:
    # Reviewer checks: What was intentionally NOT tested (BR-003)
    - "Item 1 - Reason: ..."
  
  recommendation:
    # Reviewer checks: Tester's recommendation
    value: "PROCEED | BLOCKED | ESCALATE"
```

#### 2.2.2 Reviewer Red Flags

| Red Flag | Meaning | Reviewer Action |
|----------|---------|----------------|
| `in_scope_items` empty or vague | Testing may be shallow | Request detailed test scenarios |
| `out_of_scope_items` empty | Coverage gaps not disclosed (BR-003 violation) | Request gap analysis |
| `risk_priorities` empty | Risk-prioritized testing not performed | Request risk assessment |
| `input_artifacts` missing | Tester didn't consume developer outputs (BR-001 violation) | Escalate |
| `recommendation: PROCEED` with significant `out_of_scope_items` | Inconsistent recommendation | Question recommendation |

### 2.3 How to Evaluate verification-report Evidence

#### 2.3.1 Evidence Quality Indicators

| Quality Level | Characteristics | Reviewer Decision |
|---------------|-----------------|-------------------|
| **HIGH** | Specific logs/outputs/assertions; Reproducible steps; Clear pass/fail | Can approve based on evidence |
| **MEDIUM** | General descriptions; Some evidence present | Approve with warnings or request more evidence |
| **LOW** | "Tested locally" without details; No traceable evidence | Reject - insufficient evidence |

#### 2.3.2 Evidence Evaluation Checklist

```yaml
evidence_quality_check:
  - check: "Does evidence include specific outputs/logs?"
    good_example: "Assertion passed: AuthService.generateToken() returned JWT with expected payload"
    bad_example: "Token generation works"
  
  - check: "Are pass/fail conclusions traceable?"
    good_example: "PASS - tests/unit/AuthService.test.ts:45 - 12/12 tests passed"
    bad_example: "All tests passed"
  
  - check: "Is confidence level justified?"
    good_example: "PARTIAL - Core paths verified (80%), edge cases pending due to time"
    bad_example: "FULL - Everything tested" (when out_of_scope_items non-empty)
  
  - check: "Are failures classified per BR-004?"
    good_example: "FAILED - Classification: Implementation issue - AuthService.validateToken() crashes on null input"
    bad_example: "FAILED - validateToken broken"
```

#### 2.3.3 Sufficient vs Insufficient Evidence

**Sufficient Evidence (Approve-able):**
```markdown
## Test Execution Summary
- Unit tests: 45 passed, 0 failed (tests/unit/AuthService.test.ts)
- Integration tests: 12 passed, 0 failed (tests/integration/auth-flow.test.ts)
- Evidence: See test output logs in Appendix A

## Pass Cases
| Test | Evidence | Status |
|------|----------|--------|
| Valid credentials produce JWT | Log: "Token generated: eyJhbG..." | PASS |
| Invalid credentials rejected | Log: "401 Unauthorized" | PASS |

## Confidence Level: FULL
Rationale: All in-scope items tested with passing results. No coverage gaps.
```

**Insufficient Evidence (Reject):**
```markdown
## Test Execution Summary
- Tested locally, everything works

## Pass Cases
- Authentication works
- Token generation works

## Confidence Level: FULL
Rationale: Feels good
```

### 2.4 How to Assess regression-risk-report

#### 2.4.1 Key Sections for Risk Judgment

```yaml
regression_risk_report:
  change_anchor:
    # Reviewer checks: What change triggered this analysis?
    description: "Feature X implementation" or "Bugfix BUG-001"
  
  regression_surfaces:
    # Reviewer checks: What adjacent areas might be affected?
    surfaces:
      - area: "Adjacent module Y"
        reason: "Shares data structure with changed code"
  
  existing_tests_reused:
    # Reviewer checks: What existing tests provide confidence?
    tests:
      - test: "tests/integration/full-flow.test.ts"
        coverage: "Verifies end-to-end flow unchanged"
  
  new_regression_checks:
    # Reviewer checks: What new tests prevent recurrence?
    checks:
      - check: "Regression test for BUG-001 scenario"
  
  untested_regression_areas:
    # Reviewer checks: What risks remain? (BR-003)
    areas:
      - area: "Performance under load"
        reason: "Load testing environment not available"
  
  risk_ranking:
    # Reviewer checks: Are risks prioritized?
    risks:
      - risk: "Data corruption in edge case"
        severity: "high"
        likelihood: "low"
  
  recommendation:
    # Reviewer checks: Tester's risk recommendation
    value: "ACCEPT_RISK | REWORK | ESCALATE"
```

#### 2.4.2 Reviewer Red Flags

| Red Flag | Meaning | Reviewer Action |
|----------|---------|----------------|
| `regression_surfaces` empty | Regression thinking not performed (BR-006 violation) | Request regression analysis |
| `untested_regression_areas` empty | Coverage gaps not disclosed (BR-003 violation) | Request gap analysis |
| `risk_ranking` missing severity/likelihood | Risk assessment vague | Request quantified risks |
| `recommendation: ACCEPT_RISK` with high-severity `untested_regression_areas` | Inconsistent recommendation | Question recommendation |

---

## 3. Acceptance Layer Consumption Guide

### 3.1 Pass/Fail/Gap Summary Interpretation

#### 3.1.1 verification-report.confidence_level

| Confidence Level | Definition | Acceptance Decision Guidance |
|------------------|------------|------------------------------|
| **FULL** | Comprehensive coverage; all paths verified | Can accept if no BLOCKED items |
| **PARTIAL** | Core paths verified; gaps acknowledged | Accept with known gaps OR request rework |
| **LOW** | Significant gaps or blockers | Reject or escalate |

#### 3.1.2 verification-report.recommendation

| Recommendation | Definition | Acceptance Decision |
|----------------|------------|---------------------|
| `PASS_TO_REVIEW` | Tests pass; ready for reviewer approval | Forward to reviewer |
| `REWORK` | Failures need fixing before acceptance | Send back to developer |
| `RETEST` | Fix applied; needs re-verification | Schedule re-test |
| `ESCALATE` | Blocked or ambiguous; needs decision | Escalate to management |

### 3.2 Risk Assessment from regression-risk-report

#### 3.2.1 Risk Acceptance Matrix

| Untested Area Severity | Likelihood | Acceptance Guidance |
|------------------------|------------|---------------------|
| **HIGH** | **HIGH** | Do NOT accept; require mitigation |
| **HIGH** | **LOW** | Accept with monitoring plan |
| **MEDIUM** | **HIGH** | Accept with caution; schedule follow-up |
| **MEDIUM** | **LOW** | Accept; document for future |
| **LOW** | **ANY** | Accept |

#### 3.2.2 Acceptance Decision Template

```yaml
acceptance_decision:
  based_on:
    verification_report:
      confidence_level: "PARTIAL"
      pass_fail_summary: "45 passed, 2 failed"
    regression_risk_report:
      untested_areas: "Performance under load"
      risk_level: "MEDIUM"
  
  decision: "ACCEPT_WITH_KNOWN_GAPS"
  conditions:
    - "Failed items (ISSUE-001, ISSUE-002) documented and accepted"
    - "Performance testing scheduled for next sprint"
    - "Monitoring in place for regression indicators"
  
  rationale: "Core functionality verified; untested areas are acceptable risk for MVP"
```

### 3.3 When to Accept with Known Gaps vs Reject

#### Accept with Known Gaps When:
- Core functionality verified and passing
- Gaps are documented and acknowledged
- Risks are understood and acceptable
- Follow-up actions are scheduled

#### Reject When:
- Core functionality NOT verified
- Critical failures unaddressed
- Evidence quality insufficient
- High-risk areas untested without justification

---

## 4. Evidence Quality Requirements (BR-007)

### 4.1 Honesty Over False Confidence

**Prohibited (BR-007 Violation):**
- ❌ "FULL confidence" when `out_of_scope_items` is non-empty
- ❌ "All tested" without traceable evidence
- ❌ "Works fine" without specific observations
- ❌ "No issues found" when testing was partial

**Required (BR-007 Compliant):**
- ✅ "PARTIAL confidence - core paths verified, edge cases pending"
- ✅ "Evidence: [specific log/output/assertion]"
- ✅ "Coverage gap: [specific area not tested]"
- ✅ "Assumption: [explicit assumption made]"

### 4.2 Evidence Format Requirements

| Evidence Type | Required Content | Example |
|---------------|------------------|---------|
| **Test Output** | File path, test name, result, count | `tests/unit/AuthService.test.ts: 12/12 passed` |
| **Log Snippet** | Relevant log lines with context | `"Token validated successfully for user_id=123"` |
| **Assertion** | Expected vs actual values | `Expected: 200, Actual: 200 - PASS` |
| **Manual Verification** | Steps taken, observations | `"Manual: Sent request to /auth/login, received 200 with JWT"` |

### 4.3 Confidence Level Definitions

| Level | Criteria | When to Use |
|-------|----------|-------------|
| **FULL** | All in-scope items tested; all passing; no gaps | Comprehensive test execution complete |
| **PARTIAL** | Core items tested; some gaps acknowledged | Time constraints; environment limitations; non-critical gaps |
| **LOW** | Significant gaps or blockers | Major areas untested; environment blocked testing |

---

## 5. Failure Classification Expectations (BR-004)

### 5.1 Required Classification Categories

Every failed test must be classified into one of:

| Category | Definition | Example | Who Fixes |
|----------|------------|---------|-----------|
| **Implementation Issue** | Bug in production code | `AuthService crashes on null input` | developer |
| **Test Issue** | Bug in test code | `Test assertion incorrect` | tester |
| **Environment Issue** | External factor blocking test | `Database connection timeout` | infrastructure |
| **Design/Spec Issue** | Ambiguity in requirements | `Spec doesn't define behavior for edge case` | architect |
| **Dependency/Upstream Issue** | External service/dependency failure | `Email service unavailable` | dependency owner |

### 5.2 Failure Report Format

**Compliant (BR-004):**
```markdown
## Failed Cases
| Test | Classification | Description | Action |
|------|----------------|-------------|--------|
| validateToken(null) | Implementation Issue | Crashes with NullPointerException | developer to fix |
| integration-test | Environment Issue | Database timeout during test | infra to investigate |
```

**Non-Compliant (BR-004 Violation):**
```markdown
## Failed Cases
- validateToken test failed
- integration test failed
```

### 5.3 Reviewer/acceptance Use of Classification

| Classification | Reviewer Action | Acceptance Action |
|----------------|-----------------|-------------------|
| Implementation Issue | Reject to developer | Wait for fix |
| Test Issue | Request tester fix | May accept with test fix pending |
| Environment Issue | Request environment fix | May accept with re-test scheduled |
| Design/Spec Issue | Escalate to architect | Block acceptance until resolved |
| Dependency Issue | Escalate or accept with risk | Accept with mitigation plan |

---

## 6. Coverage Gap Disclosure Requirements (BR-003)

### 6.1 Mandatory Gap Disclosure

**Every verification-report must include:**

```yaml
coverage_gaps:
  - gap: "What was not tested"
    reason: "Why it was not tested"
    impact: "What risk this creates"
    planned_followup: "When/how it will be addressed"
```

### 6.2 Gap Examples

**Compliant (BR-003):**
```markdown
## Coverage Gaps
| Gap | Reason | Impact | Follow-up |
|-----|--------|--------|-----------|
| Token refresh flow | Out of scope (deferred to next sprint) | Refresh not verified | Scheduled for Sprint 5 |
| Load testing | Environment not available | Performance unknown | Staging env ready next week |
| Invalid JWT formats | Time constraints | Edge cases untested | Low priority, backlog |
```

**Non-Compliant (BR-003 Violation):**
```markdown
## Coverage Gaps
None
```
(This is only valid if truly comprehensive testing was performed)

### 6.3 Reviewer/acceptance Use of Gap Disclosure

| Gap Pattern | Reviewer Action | Acceptance Action |
|-------------|-----------------|-------------------|
| No gaps disclosed (comprehensive testing) | Verify claim | Can accept |
| Minor gaps, low impact | Note for future | Can accept |
| Significant gaps, documented | Assess risk | Accept with conditions OR reject |
| No gaps disclosed (but obviously incomplete) | Question honesty | Reject - BR-007 violation |

---

## 7. Artifact Consumption Summary

### 7.1 Per-Role Artifact Mapping

| Artifact | Section | reviewer | acceptance | developer |
|----------|---------|:--------:|:----------:|:---------:|
| **test-scope-report** | input_artifacts | ● | ○ | ○ |
| | goal_under_test | ● | ● | ● |
| | in_scope_items | ● | ● | ● |
| | out_of_scope_items | ● | ● | ○ |
| | recommendation | ● | ○ | ○ |
| **verification-report** | execution_summary | ● | ● | ● |
| | pass_cases | ● | ○ | ● |
| | failed_cases | ● | ○ | ● |
| | failure_classification | ● | ○ | ● |
| | evidence | ● | ○ | ○ |
| | coverage_gaps | ● | ● | ● |
| | confidence_level | ● | ● | ○ |
| | recommendation | ● | ● | ○ |
| **regression-risk-report** | regression_surfaces | ● | ● | ● |
| | untested_regression_areas | ● | ● | ● |
| | risk_ranking | ● | ● | ○ |
| | recommendation | ● | ● | ○ |

**Legend:**
- ● = Primary consumer (directly uses this section)
- ○ = Secondary consumer (may reference this section)

### 7.2 Consumption Workflow by Role

#### Reviewer Workflow
```
1. Read test-scope-report
   ↓ (understand what was tested)
2. Evaluate verification-report evidence
   ↓ (judge evidence quality)
3. Assess regression-risk-report
   ↓ (understand residual risk)
4. Make approve/reject decision
```

#### Acceptance Workflow
```
1. Read verification-report.confidence_level
   ↓ (understand coverage)
2. Review failed_cases + coverage_gaps
   ↓ (understand issues)
3. Assess regression-risk-report.recommendation
   ↓ (understand risk)
4. Make accept/reject/escalate decision
```

#### Developer Workflow
```
1. Read verification-report.failed_cases
   ↓ (understand failures)
2. Review failure_classification
   ↓ (understand what to fix)
3. Review coverage_gaps
   ↓ (understand what additional testing needed)
4. Implement fixes
```

---

## 8. Validation Checklist

### 8.1 Pre-Handoff Checklist (Tester)

Before delivering artifacts to downstream roles:

- [ ] `test-scope-report` complete with all required fields
- [ ] `verification-report` includes traceable evidence
- [ ] `confidence_level` justified by actual coverage
- [ ] `coverage_gaps` disclosed per BR-003
- [ ] All failures classified per BR-004
- [ ] `regression-risk-report` includes risk ranking
- [ ] BR-007 compliance: Honesty over false confidence
- [ ] Recommendations consistent with evidence

### 8.2 Post-Handoff Checklist (Downstream Roles)

**Reviewer:**
- [ ] Evidence quality assessed
- [ ] Coverage gaps acknowledged
- [ ] Failure classifications reviewed
- [ ] Risk assessment understood
- [ ] Approval decision documented

**Acceptance:**
- [ ] Confidence level understood
- [ ] Pass/fail/gap summary interpreted
- [ ] Risk assessment considered
- [ ] Decision documented with rationale

**Developer:**
- [ ] Failed cases understood
- [ ] Failure classifications clear
- [ ] Action items identified
- [ ] Fix plan created

---

## 9. Escalation Paths

### 9.1 From Downstream to Tester

```
Level 1: Direct @tester mention
         ↓ (unresolved after 1 task cycle)
Level 2: @tester + @reviewer mention
         ↓ (unresolved after 1 review cycle)
Level 3: Package owner escalation
```

### 9.2 Escalation Triggers

| Issue | Escalation Level | Path |
|-------|------------------|------|
| Evidence quality insufficient | Level 1 | @tester |
| Coverage gaps not disclosed | Level 1 | @tester |
| Failure classification unclear | Level 1 | @tester |
| Recommendation inconsistent with evidence | Level 2 | @tester + @reviewer |
| BR-007 violation (false confidence) | Level 2 | @tester + @reviewer |

---

## 10. References

- `specs/005-tester-core/spec.md` - Feature specification (Section 6 Business Rules, Section 7 Artifact Contracts)
- `specs/005-tester-core/role-scope.md` - Tester role scope (Section 5: Outputs)
- `role-definition.md` Section 4 - Reviewer role definition
- `quality-gate.md` Section 2.2 - Findings severity definitions
- `io-contract.md` - I/O contract standards

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-25 | Initial downstream interfaces guide aligned with role-definition.md Section 4 |
