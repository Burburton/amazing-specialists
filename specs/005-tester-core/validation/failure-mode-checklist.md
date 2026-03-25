# Failure Mode Checklist

## Purpose
Identify common tester failure patterns with detection methods, early warning signals, and remediation strategies.

---

## FM-001: Happy-Path-Only Verification

### Definition
Testing only the main flow while ignoring edge conditions and boundary scenarios.

### Detection
| Check | Method | Status |
|-------|--------|--------|
| [ ] Edge cases assessed | Review test scenarios for boundary coverage | |
| [ ] Invalid input tests present | Check for negative test cases | |
| [ ] Boundary conditions tested | Verify parameter boundaries covered | |
| [ ] Error handling verified | Check error path testing | |

### Early Warning Signals
- Test scenarios only describe successful flows
- No mention of invalid inputs or error conditions
- Edge-case-matrix skill not invoked
- Test count low for complexity of feature

### Prevention
- Mandatory edge-case-matrix skill invocation
- Use boundary analysis methodology (per-parameter)
- Include invalid input scenarios in test design
- Apply "what could go wrong" thinking

### Recovery
1. Stop test execution
2. Invoke edge-case-matrix skill
3. Redesign tests with boundary coverage
4. Add invalid input and error handling tests
5. Re-execute tests

### Related BR
**BR-005**: Edge Cases Are Mandatory, Not Optional Polish

---

## FM-002: Evidence-Free Pass Claim

### Definition
Reporting "passed" without traceable evidence or specific observations.

### Detection
| Check | Method | Status |
|-------|--------|--------|
| [ ] Traceable evidence present | Look for logs/outputs/assertions | |
| [ ] Specific test outputs documented | Check for file paths and counts | |
| [ ] Reproducible steps described | Verify steps can be repeated | |
| [ ] No vague language | Check for "tested locally", "looks good" | |

### Early Warning Signals
- Evidence section empty or minimal
- Language like "tested locally" or "verified manually"
- No specific log snippets or assertions
- Pass count without test file references

### Prevention
- Require evidence in verification-report
- Use structured evidence format (file, test, result)
- Spot-check evidence quality during review
- Apply evidence quality gate

### Recovery
1. Add specific evidence for each pass claim
2. Include test output logs
3. Document assertions with expected vs actual
4. Remove vague language
5. Mark as PARTIAL if evidence cannot be produced

### Related BR
**BR-007**: Honesty Over False Confidence

---

## FM-003: Self-Check Confusion

### Definition
Restating developer self-check as tester independent verification.

### Detection
| Check | Method | Status |
|-------|--------|--------|
| [ ] Explicit distinction in report | Look for "independently verified" language | |
| [ ] Self-check not used as evidence | Verify evidence is tester-observed | |
| [ ] Independent evidence collected | Check for tester-observed results | |
| [ ] Spot-checks completed | Verify 3+ self-check items verified | |

### Early Warning Signals
- Language like "Developer verified this works"
- Self-check results restated without verification
- No independent test execution mentioned
- Missing test output evidence

### Prevention
- Explicit BR-002 compliance section in report
- Required language: "Tester independently verified"
- Prohibited language: "Developer self-check shows"
- Mandatory spot-checks of self-check claims

### Recovery
1. Perform independent verification
2. Collect tester-observed evidence
3. Update report language to distinguish sources
4. Document self-check as hints only
5. Add independent test results

### Related BR
**BR-002**: Self-Check Is Not Independent Verification

---

## FM-004: Unclassified Failures

### Definition
Listing failures without determining issue type or actionable category.

### Detection
| Check | Method | Status |
|-------|--------|--------|
| [ ] All failures classified | Check failure_classification field | |
| [ ] Classification matches BR-004 categories | Verify 5 categories used | |
| [ ] Classification actionable | Check "Who Fixes" is clear | |
| [ ] Raw failure dumps absent | Verify no unclassified failures | |

### Early Warning Signals
- failure_classification field empty
- Raw test output without categorization
- "Failed" without explanation of why
- Multiple failures with no prioritization

### Prevention
- Use failure classification model (BR-004)
- Require classification for every failure
- Include "Who Fixes" guidance
- Apply classification consistently

### Recovery
1. Classify all failures per BR-004
2. Add actionable guidance for each
3. Prioritize by severity
4. Document classification rationale
5. Update verification-report

### Related BR
**BR-004**: Failures Must Be Classified

### BR-004 Categories

| Category | Definition | Who Fixes |
|----------|------------|-----------|
| Implementation Issue | Bug in production code | developer |
| Test Issue | Bug in test code | tester |
| Environment Issue | External factor blocking | infrastructure |
| Design/Spec Issue | Ambiguity in requirements | architect |
| Dependency/Upstream Issue | External service failure | dependency owner |

---

## FM-005: No Coverage Gap Disclosure

### Definition
Omitting what was not tested, creating false impression of comprehensive coverage.

### Detection
| Check | Method | Status |
|-------|--------|--------|
| [ ] Uncovered areas documented | Check coverage_gaps field | |
| [ ] Gaps include reasons | Verify "why" documented | |
| [ ] Gaps include impact | Verify risk assessed | |
| [ ] Follow-up actions listed | Verify remediation planned | |

### Early Warning Signals
- coverage_gaps field empty
- "All tested" claim with obvious gaps
- out_of_scope_items empty without justification
- No mention of what was excluded

### Prevention
- BR-003 compliance check mandatory
- Document gaps honestly
- Include reason and impact for each gap
- Plan follow-up actions

### Recovery
1. Document all coverage gaps
2. Add reason for each gap
3. Assess impact/risk
4. Plan follow-up actions
5. Update confidence_level if needed

### Related BR
**BR-003**: Every Verification Report Must State Coverage Boundaries

---

## FM-006: No Regression Thinking

### Definition
Testing only the changed line/path without assessing adjacent surfaces.

### Detection
| Check | Method | Status |
|-------|--------|--------|
| [ ] Impact beyond immediate change assessed | Check regression_surfaces | |
| [ ] Adjacent modules considered | Review nearby code paths | |
| [ ] Historical context reviewed | Check bugfix-report consumption | |
| [ ] Regression tests designed | Verify new_regression_checks | |

### Early Warning Signals
- regression_surfaces field empty
- regression-risk-report missing
- Only changed files tested
- No mention of adjacent functionality

### Prevention
- BR-006 regression-analysis mandatory
- Invoke regression-analysis skill
- Review changed_files for adjacent impact
- Consider historical failure patterns

### Recovery
1. Invoke regression-analysis skill
2. Identify regression surfaces
3. Design regression tests
4. Document untested regression areas
5. Update regression-risk-report

### Related BR
**BR-006**: Regression Thinking Is Required

---

## FM-007: Spec Ambiguity Hidden

### Definition
Silently picking an interpretation and reporting confidence as if requirements were clear.

### Detection
| Check | Method | Status |
|-------|--------|--------|
| [ ] Assumptions stated | Check assumptions field | |
| [ ] Ambiguities escalated | Review blocked_items/escalations | |
| [ ] No silent interpretation | Check for unilateral decisions | |
| [ ] Spec conflicts documented | Review escalations | |

### Early Warning Signals
- assumptions field empty in complex feature
- No mention of spec ambiguity
- Tester making spec interpretations
- Confidence level high despite ambiguity

### Prevention
- Document assumptions explicitly
- Escalate ambiguities to architect/developer
- Do not silently interpret
- Mark ambiguous areas in report

### Recovery
1. Document assumptions made
2. Escalate ambiguities
3. Mark areas with uncertain requirements
4. Adjust confidence_level
5. Update verification-report

### Related BR
**BR-007**: Honesty Over False Confidence (implicit)

---

## FM-008: Business Logic Mutation by Tester

### Definition
Tester adjusting production behavior to make tests pass instead of reporting failure.

### Detection
| Check | Method | Status |
|-------|--------|--------|
| [ ] Tester did not modify production code | Review changed_files | |
| [ ] Failures reported to developer | Check failed_cases | |
| [ ] No silent repairs | Review escalation patterns | |
| [ ] Role boundary respected | Check role-scope compliance | |

### Early Warning Signals
- Tester modifying production files
- "Fixed while testing" language
- Failures resolved without developer action
- Blurred role boundaries

### Prevention
- BR-008 enforcement
- Explicit role boundary in role-scope.md
- Tester focuses on test assets only
- Report failures to developer

### Recovery
1. Revert any production code changes
2. Report failures to developer
3. Document in verification-report
4. Reaffirm role boundary
5. Escalate if pattern continues

### Related BR
**BR-008**: Tester Must Not Mutate Production Logic to Make Validation Pass

---

## FM-009: Environment Block Misreported

### Definition
Blaming environment issues on implementation, leading to wrong rework direction.

### Detection
| Check | Method | Status |
|-------|--------|--------|
| [ ] Environment issues properly classified | Check failure_classification | |
| [ ] Not blamed on implementation | Review classification accuracy | |
| [ ] Environment blockers documented | Check blocked_items | |
| [ ] Proper failure classification used | Verify BR-004 compliance | |

### Early Warning Signals
- Implementation issue classified for environment problem
- "Code broken" when environment unavailable
- No investigation of environment state
- Wrong rework direction (developer instead of infra)

### Prevention
- Proper failure classification training
- Investigate before classifying
- Document environment state
- Use "Environment Issue" category

### Recovery
1. Reclassify as Environment Issue
2. Document environment state
3. Update verification-report
4. Escalate to infrastructure
5. Adjust recommendation

### Related BR
**BR-004**: Failures Must Be Classified

---

## FM-010: False Completeness Language

### Definition
Describing partial verification as comprehensive pass, overstating evidence quality.

### Detection
| Check | Method | Status |
|-------|--------|--------|
| [ ] Confidence level matches coverage | Compare confidence vs actual | |
| [ ] No "all tested" with gaps | Check for contradictions | |
| [ ] Partial marked as PARTIAL | Verify honesty | |
| [ ] BR-007 compliance | Review language | |

### Early Warning Signals
- "FULL" confidence with non-empty gaps
- "Everything tested" without evidence
- "No issues" when testing incomplete
- Contradiction between confidence and coverage

### Prevention
- BR-007 honesty enforcement
- Confidence level definitions
- Evidence-based conclusions
- Spot-check confidence claims

### Recovery
1. Correct confidence_level
2. Update language to reflect actual coverage
3. Document gaps honestly
4. Adjust recommendation
5. Apply BR-007 compliance

### Related BR
**BR-007**: Honesty Over False Confidence

---

## Checklist Summary

| Failure Mode | Detection Points | Prevention | Recovery Steps | Related BR |
|--------------|------------------|------------|----------------|------------|
| FM-001: Happy-Path-Only | 4 | edge-case-matrix skill | 5 steps | BR-005 |
| FM-002: Evidence-Free Pass | 4 | Evidence requirement | 5 steps | BR-007 |
| FM-003: Self-Check Confusion | 4 | BR-002 compliance | 5 steps | BR-002 |
| FM-004: Unclassified Failures | 4 | Classification model | 5 steps | BR-004 |
| FM-005: No Coverage Gap | 4 | BR-003 check | 5 steps | BR-003 |
| FM-006: No Regression Thinking | 4 | regression-analysis | 5 steps | BR-006 |
| FM-007: Spec Ambiguity Hidden | 4 | Assumption documentation | 5 steps | BR-007 |
| FM-008: Business Logic Mutation | 4 | BR-008 enforcement | 5 steps | BR-008 |
| FM-009: Environment Block Misreported | 4 | Classification training | 5 steps | BR-004 |
| FM-010: False Completeness | 4 | BR-007 honesty | 5 steps | BR-007 |
| **Total** | **40** | | **50 steps** | |

---

## Quick Reference: BR Coverage

| BR | Related Failure Modes |
|----|----------------------|
| BR-002 | FM-003 |
| BR-003 | FM-005 |
| BR-004 | FM-004, FM-009 |
| BR-005 | FM-001 |
| BR-006 | FM-006 |
| BR-007 | FM-002, FM-007, FM-010 |
| BR-008 | FM-008 |

---

## References

- `specs/005-tester-core/spec.md` - Feature specification (Section 6 Business Rules, Section 11 Failure Modes)
- `specs/005-tester-core/role-scope.md` - Tester role scope (Section 9 Failure Modes)
- `specs/005-tester-core/validation/anti-pattern-guidance.md` - Detailed anti-pattern guidance
- `role-definition.md` - 6-role definitions

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial failure-mode checklist for 005-tester-core covering all 10 anti-patterns |
