# Anti-Pattern Guidance

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `005-tester-core` |
| **Document Type** | Anti-Pattern Guidance |
| **Version** | 1.0.0 |
| **Created** | 2026-03-26 |

---

## Overview

This document defines common tester anti-patterns with comprehensive guidance including definition, symptoms, causes, prevention, remediation, and concrete examples.

---

## AP-001: Happy-Path-Only Verification

### Definition
Testing only the main successful flow while ignoring edge conditions, boundary scenarios, invalid inputs, and error handling paths.

### Symptoms
- Test scenarios describe only successful outcomes
- No invalid input test cases
- Boundary conditions not mentioned
- Error handling paths untested
- Test count disproportionately low for feature complexity

### Causes
- Time pressure leading to shortcuts
- Assumption that "main flow is most important"
- Lack of systematic edge case identification methodology
- Overconfidence in implementation quality
- Missing edge-case-matrix skill invocation

### Prevention
1. **Mandatory edge-case-matrix skill invocation** before test execution
2. **Boundary analysis methodology**: Analyze each parameter for min/max/invalid values
3. **Test design checklist**: Include invalid input, error handling, and boundary tests
4. **Peer review**: Have another tester review test coverage
5. **BR-005 enforcement**: Edge cases are mandatory, not optional

### Remediation
1. Stop test execution immediately upon detection
2. Invoke edge-case-matrix skill
3. Perform systematic boundary analysis for all parameters
4. Redesign test suite with comprehensive coverage
5. Re-execute tests with new edge cases
6. Update verification-report with expanded coverage

### Example

**Anti-Pattern Scenario:**
```markdown
## Test Scenarios (Incomplete)
- User can login with valid credentials ✓
- User can logout after login ✓
- User can access dashboard after login ✓

## Missing
- Login with invalid credentials
- Login with empty username/password
- Login with SQL injection attempt
- Logout without prior login
- Session timeout handling
- Concurrent login from multiple devices
```

**Corrected Scenario:**
```markdown
## Test Scenarios (Complete)
### Happy Path
- User can login with valid credentials ✓
- User can logout after login ✓
- User can access dashboard after login ✓

### Edge Cases
- Login with empty username → 400 Bad Request ✓
- Login with empty password → 400 Bad Request ✓
- Login with invalid credentials → 401 Unauthorized ✓
- Login with SQL injection attempt → 400, logged ✓
- Logout without prior login → 200 (idempotent) ✓
- Session timeout → Redirect to login ✓
- Concurrent login (same user, 2 devices) → Both sessions valid ✓
```

---

## AP-002: Evidence-Free Pass Claim

### Definition
Reporting test results as "passed" without providing traceable evidence, specific observations, or reproducible results.

### Symptoms
- Evidence section empty or minimal
- Language like "tested locally" or "verified manually"
- No specific log snippets, outputs, or assertions
- Pass/fail conclusions without test file references
- "All tests passed" without count or file path

### Causes
- Rushed test execution
- Lack of evidence format standards
- Assumption that claims are trustworthy
- Missing evidence requirements in artifact contract
- No spot-check verification process

### Prevention
1. **Require structured evidence format**: File path, test name, result, count
2. **Evidence quality gate**: No evidence = incomplete report
3. **Prohibit vague language**: "tested locally", "looks good" banned
4. **Spot-check verification**: Reviewer spot-checks 3+ evidence items
5. **BR-007 enforcement**: Honesty over false confidence

### Remediation
1. Add specific evidence for each pass claim
2. Include test output logs with file paths
3. Document assertions with expected vs actual values
4. Remove all vague language
5. Mark as PARTIAL if evidence cannot be produced
6. Re-submit verification-report with complete evidence

### Example

**Anti-Pattern Evidence:**
```markdown
## Test Results
- Authentication: PASS
- Token generation: PASS
- Authorization: PASS

## Evidence
Tested locally, everything works.
```

**Corrected Evidence:**
```markdown
## Test Results
| Test | File | Result | Evidence |
|------|------|--------|----------|
| Valid credentials produce JWT | tests/unit/AuthService.test.ts | PASS | 12/12 tests passed, Log: "Token generated: eyJhbG..." |
| Invalid credentials rejected | tests/unit/AuthService.test.ts | PASS | 8/8 tests passed, Log: "401 Unauthorized" |
| Token validation succeeds | tests/unit/authMiddleware.test.ts | PASS | 15/15 tests passed, Log: "Token validated for user_id=123" |

## Evidence Samples
```
Running tests/unit/AuthService.test.ts...
✓ generateToken() with valid credentials (45ms)
✓ generateToken() with invalid credentials (12ms)
✓ validateToken() with valid token (23ms)
Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
```
```

---

## AP-003: Self-Check Confusion

### Definition
Restating developer self-check results as tester independent verification, blurring the line between self-reported claims and independently observed evidence.

### Symptoms
- Language like "Developer verified this works"
- Self-check results restated without independent verification
- No tester-observed evidence
- Missing spot-checks of self-check claims
- Prohibited language present ("self-check passed, so...")

### Causes
- Misunderstanding of BR-002 requirements
- Time pressure leading to shortcut (skip independent verification)
- Overconfidence in developer self-check accuracy
- Lack of clear distinction in report templates
- Missing spot-check requirements

### Prevention
1. **Explicit BR-002 compliance section** in verification-report
2. **Required language**: "Tester independently verified..."
3. **Prohibited language**: "Developer verified", "Self-check shows"
4. **Mandatory spot-checks**: Verify 3+ self-check items independently
5. **Self-check as hints only**: Use to inform testing, not replace it

### Remediation
1. Perform independent verification for all claims
2. Collect tester-observed evidence (logs, outputs, assertions)
3. Update report language to distinguish sources
4. Document self-check as hints only
5. Add independent test execution results
6. Complete spot-checks and document accuracy

### Example

**Anti-Pattern Report:**
```markdown
## Verification Summary
Developer self-check passed with 28/28 checks.
All acceptance criteria verified by developer.
No independent testing performed - self-check sufficient.
```

**Corrected Report:**
```markdown
## Self-Check Acknowledgment
Developer self-check status: PASS (28/28 checks)
Usage: Hints for test strategy, NOT evidence

## Independent Verification
| Claim | Self-Check | Tester Verification | Evidence |
|-------|------------|---------------------|----------|
| "All acceptance criteria met" | Claimed | Independently verified | tests/acceptance/auth.test.ts: 15/15 passed |
| "92% test coverage" | Claimed | Independently verified | Coverage report: 92.3% |
| "Code compiles" | Claimed | Independently verified | Build log: "Build successful" |
| "No hardcoded secrets" | Claimed | Independently verified | Grep results: 0 matches |
| "Input validation present" | Claimed | Independently verified | Code review + tests |

## Spot-Check Results
Self-check accuracy: 5/5 verified items accurate
Confidence in self-check: HIGH
```

---

## AP-004: Unclassified Failures

### Definition
Listing test failures without categorizing them into actionable types, leaving downstream consumers unable to prioritize or assign fixes.

### Symptoms
- failure_classification field empty
- Raw test output without categorization
- "Failed" without explanation of type
- Multiple failures with no prioritization
- No "Who Fixes" guidance

### Causes
- Missing failure classification model knowledge
- Rushed report completion
- Assumption that failure description is sufficient
- Lack of accountability assignment
- No BR-004 enforcement

### Prevention
1. **Use BR-004 failure classification model** for every failure
2. **Require classification** before report submission
3. **Include "Who Fixes" guidance** for each category
4. **Apply consistently** across all failures
5. **Review classification accuracy** during quality gate

### Remediation
1. Classify all failures per BR-004 categories
2. Add actionable guidance for each failure
3. Prioritize by severity and category
4. Document classification rationale
5. Update verification-report with complete classification

### Example

**Anti-Pattern Failure Report:**
```markdown
## Failed Cases
- validateToken(null) test failed
- integration-test failed
- Database connection timeout
```

**Corrected Failure Report:**
```markdown
## Failed Cases
| Test | Classification | Description | Who Fixes | Severity |
|------|----------------|-------------|-----------|----------|
| validateToken(null) | Implementation Issue | Crashes with NullPointerException when null input | developer | High |
| integration-test | Environment Issue | Database connection timeout during test execution | infrastructure | Medium |
| JWT expiry validation | Test Issue | Test assertion incorrect (expected 200, should be 401) | tester | Low |
| Token refresh behavior | Design/Spec Issue | Spec doesn't define behavior for expired token during refresh | architect | Medium |
| Email notification | Dependency Issue | Email service unavailable (external dependency) | dependency owner | Low |
```

---

## AP-005: No Coverage Gap Disclosure

### Definition
Omitting documentation of what was not tested, creating a false impression of comprehensive coverage and hiding untested risk areas.

### Symptoms
- coverage_gaps field empty without justification
- out_of_scope_items empty
- "All tested" claim with obvious gaps
- No mention of excluded scenarios
- Missing "why" for exclusions

### Causes
- Fear of appearing incomplete
- Assumption that gaps are obvious
- No BR-003 enforcement
- Lack of gap documentation standards
- Overconfidence in coverage

### Prevention
1. **BR-003 mandatory compliance**: Every report must state coverage boundaries
2. **Document gaps honestly**: What, why, impact, follow-up
3. **Include reason and impact** for each gap
4. **Plan follow-up actions** for significant gaps
5. **Adjust confidence_level** based on gaps

### Remediation
1. Document all coverage gaps explicitly
2. Add reason for each gap (time, environment, scope)
3. Assess and document impact/risk
4. Plan follow-up actions with timeline
5. Update confidence_level to reflect gaps
6. Re-submit verification-report

### Example

**Anti-Pattern Report:**
```markdown
## Coverage Gaps
None

## Confidence Level
FULL
```

**Corrected Report:**
```markdown
## Coverage Gaps
| Gap | Reason | Impact | Follow-up |
|-----|--------|--------|-----------|
| Token refresh flow | Out of scope (deferred to next sprint) | Refresh not verified | Scheduled for Sprint 5 |
| Load testing | Environment not available | Performance under load unknown | Staging env ready 2026-04-01 |
| Invalid JWT format edge cases | Time constraints | Some edge cases untested | Low priority, backlog added |
| Browser compatibility | Single browser tested | Cross-browser issues possible | Testing scheduled next sprint |

## Confidence Level
PARTIAL

## Rationale
Core authentication paths verified comprehensively. Gaps exist in token refresh (deferred), performance (env blocked), and edge cases (time). Recommend PASS_TO_REVIEW with documented gaps.
```

---

## AP-006: No Regression Thinking

### Definition
Testing only the immediately changed code path without assessing what adjacent or historical functionality might be affected.

### Symptoms
- regression_surfaces field empty
- regression-risk-report missing
- Only changed files tested
- No mention of adjacent functionality
- Historical context not considered

### Causes
- Narrow focus on immediate change
- Missing regression-analysis skill invocation
- Lack of systematic impact assessment methodology
- Time pressure
- No BR-006 enforcement

### Prevention
1. **BR-006 mandatory**: Regression thinking required for all changes
2. **Invoke regression-analysis skill** before test design
3. **Review changed_files** for adjacent impact
4. **Consider historical failure patterns**
5. **Document regression surfaces** explicitly

### Remediation
1. Invoke regression-analysis skill
2. Identify all regression surfaces (adjacent modules, shared data, integration points)
3. Design regression tests for identified surfaces
4. Document untested regression areas with risk assessment
5. Update regression-risk-report
6. Re-submit with complete analysis

### Example

**Anti-Pattern Analysis:**
```markdown
## Change
Added JWT authentication to /api/orders endpoint

## Testing
Tested /api/orders with JWT → PASS

## Regression
N/A (only one endpoint changed)
```

**Corrected Analysis:**
```markdown
## Change
Added JWT authentication to /api/orders endpoint

## Regression Surfaces
| Surface | Reason | Test Status |
|---------|--------|-------------|
| /api/orders (all methods) | Same endpoint, different methods | Tested (GET, POST, PUT, DELETE) |
| /api/users endpoint | Shared auth middleware | Tested (no regression) |
| /api/products endpoint | Shared auth middleware | Tested (no regression) |
| Existing integration tests | Full flow may be affected | Re-run (all passing) |
| Mobile app compatibility | API contract unchanged | NOT TESTED (env blocked) |

## New Regression Checks
- Auth middleware applied consistently across all endpoints
- JWT validation doesn't break existing session handling
- Error responses maintain backward compatibility

## Untested Regression Areas
| Area | Reason | Risk Level |
|------|--------|------------|
| Mobile app compatibility | Mobile test env unavailable | Medium (API contract unchanged) |

## Risk Ranking
| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Mobile app breakage | Medium | Low | API contract unchanged, low risk |

## Recommendation
ACCEPT_RISK (mobile testing scheduled for next sprint)
```

---

## AP-007: Spec Ambiguity Hidden

### Definition
Silently picking one interpretation of ambiguous requirements and reporting confidence as if requirements were clear, without escalating or documenting the ambiguity.

### Symptoms
- assumptions field empty in complex feature
- No mention of spec ambiguity
- Tester making unilateral spec interpretations
- High confidence level despite ambiguity
- No escalation documented

### Causes
- Desire to appear decisive
- Unclear escalation process
- Assumption that interpretation is "obvious"
- Fear of appearing indecisive
- Missing assumption documentation requirements

### Prevention
1. **Document assumptions explicitly** in verification-report
2. **Escalate ambiguities** to architect/developer
3. **Do not silently interpret** ambiguous requirements
4. **Mark ambiguous areas** in report
5. **Adjust confidence_level** based on ambiguity

### Remediation
1. Document all assumptions made during testing
2. Escalate ambiguities to appropriate role (architect/developer)
3. Mark areas with uncertain requirements in report
4. Adjust confidence_level downward if ambiguity significant
5. Update verification-report with transparent ambiguity disclosure

### Example

**Anti-Pattern Report:**
```markdown
## Test Results
All tests passed.

## Confidence Level
FULL

## Notes
Spec said "handle errors gracefully" - implemented as returning 500 with error message.
```

**Corrected Report:**
```markdown
## Assumptions Made
| Assumption | Reason | Impact if Wrong |
|------------|--------|-----------------|
| "Gracefully" = 500 + message | Common pattern | May need different error format |

## Ambiguities Escalated
| Ambiguity | Escalated To | Status |
|-----------|--------------|--------|
| What does "handle errors gracefully" mean? | architect | Pending response |

## Confidence Level
PARTIAL

## Rationale
Core functionality verified. Ambiguity in error handling definition may require adjustment pending architect clarification.
```

---

## AP-008: Business Logic Mutation by Tester

### Definition
Tester modifying production code to make tests pass instead of reporting failures back to developer, violating role boundaries.

### Symptoms
- Tester modifying production files
- "Fixed while testing" language
- Failures resolved without developer action
- Blurred role boundaries
- Changed files include production code modified by tester

### Causes
- "Quick fix" mentality
- Unclear role boundaries
- Desire to be helpful
- Lack of BR-008 enforcement
- Blurred tester/developer responsibilities

### Prevention
1. **BR-008 explicit enforcement**: Tester must not modify production logic
2. **Role boundary training**: Clear tester vs developer responsibilities
3. **Changed files review**: Verify tester only modified test assets
4. **Report failures to developer**: Never silently repair
5. **Escalate pattern**: If tester repeatedly fixes, escalate

### Remediation
1. Revert any production code changes made by tester
2. Report failures to developer through proper channels
3. Document in verification-report as failures
4. Reaffirm role boundary in team communication
5. Escalate if pattern continues

### Example

**Anti-Pattern Scenario:**
```markdown
## Actions Taken
Found null pointer in AuthService.validateToken().
Fixed by adding null check.
Test now passes.

## Changed Files
- src/services/AuthService.ts (added null check)
- tests/unit/AuthService.test.ts (added test)
```

**Corrected Scenario:**
```markdown
## Failures Found
| Test | Classification | Description | Who Fixes |
|------|----------------|-------------|-----------|
| validateToken(null) | Implementation Issue | Crashes with NullPointerException when null input | developer |

## Changed Files (Tester)
- tests/unit/AuthService.test.ts (added test for null input)

## Recommendation
REWORK - Implementation issue requires developer fix
```

---

## AP-009: Environment Block Misreported

### Definition
Incorrectly classifying environment-related test blocks as implementation failures, leading to wrong rework direction and wasted developer effort.

### Symptoms
- Implementation issue classified for environment problem
- "Code broken" when environment unavailable
- No investigation of environment state before classification
- Wrong rework direction (developer instead of infrastructure)
- Environment blocker not documented in blocked_items

### Causes
- Rushed failure classification
- Lack of environment investigation
- Assumption that test failure = code failure
- Missing environment diagnosis steps
- No BR-004 compliance check

### Prevention
1. **Investigate before classifying**: Check environment state
2. **Use proper BR-004 category**: Environment Issue when applicable
3. **Document environment state**: Include in blocked_items
4. **Train on classification**: Environment vs implementation distinction
5. **Diagnosis checklist**: Environment verification steps

### Remediation
1. Reclassify failure as Environment Issue
2. Document environment state (what failed, why)
3. Update verification-report with correct classification
4. Escalate to infrastructure team
5. Adjust recommendation (not REWORK for developer)

### Example

**Anti-Pattern Classification:**
```markdown
## Failed Cases
| Test | Classification | Description |
|------|----------------|-------------|
| Database integration test | Implementation Issue | Cannot connect to database |

## Recommendation
REWORK (developer to fix database connection)
```

**Corrected Classification:**
```markdown
## Failed Cases
| Test | Classification | Description | Who Fixes |
|------|----------------|-------------|-----------|
| Database integration test | Environment Issue | Database connection timeout - test environment database unavailable | infrastructure |

## Blocked Items
| Item | Blocker Type | Status |
|------|--------------|--------|
| Database integration tests | Environment - DB unavailable | Blocked until infra resolves |

## Environment State
- Database host: test-db.example.com
- Error: ECONNREFUSED
- Verified: Database service down
- Contacted: infrastructure team (ticket INFRA-123)

## Recommendation
ESCALATE (environment blocker, not implementation issue)
```

---

## AP-010: False Completeness Language

### Definition
Using language that implies comprehensive verification when testing was actually partial, incomplete, or blocked, overstating confidence and evidence quality.

### Symptoms
- "FULL" confidence with non-empty coverage_gaps
- "All tested" without comprehensive evidence
- "No issues found" when testing incomplete
- Contradiction between confidence level and actual coverage
- Vague completeness claims

### Causes
- Pressure to show progress
- Fear of appearing incompetent
- Lack of BR-007 enforcement
- Missing confidence level definitions
- No honesty culture

### Prevention
1. **BR-007 strict enforcement**: Honesty over false confidence
2. **Confidence level definitions**: Clear FULL/PARTIAL/LOW criteria
3. **Evidence-based conclusions**: No claims without evidence
4. **Spot-check confidence claims**: Reviewer verifies alignment
5. **Culture of honesty**: Reward transparent gap disclosure

### Remediation
1. Correct confidence_level to match actual coverage
2. Update language to reflect true state
3. Document gaps honestly
4. Adjust recommendation appropriately
5. Apply BR-007 compliance retroactively

### Example

**Anti-Pattern Language:**
```markdown
## Summary
All tests passed. Everything verified.

## Confidence Level
FULL - Complete testing performed

## Coverage Gaps
None
```

**Corrected Language:**
```markdown
## Summary
Core authentication flows tested and passing. Edge cases partially tested. Load testing not performed.

## Confidence Level
PARTIAL - Core paths verified (80%), edge cases pending

## Coverage Gaps
| Gap | Reason | Impact |
|-----|--------|--------|
| Load testing | Environment unavailable | Performance unknown |
| Invalid input edge cases | Time constraints | Some edge cases untested |
| Browser compatibility | Single browser tested | Cross-browser issues possible |

## Rationale
Honest assessment: Main functionality verified, gaps exist in non-critical areas. Recommend PASS_TO_REVIEW with documented gaps.
```

---

## Anti-Pattern Summary Matrix

| AP ID | Name | Severity | Related BR | Detection Points | Prevention |
|-------|------|----------|------------|------------------|------------|
| AP-001 | Happy-Path-Only | High | BR-005 | 4 | edge-case-matrix |
| AP-002 | Evidence-Free Pass | High | BR-007 | 4 | Evidence requirement |
| AP-003 | Self-Check Confusion | High | BR-002 | 4 | BR-002 compliance |
| AP-004 | Unclassified Failures | High | BR-004 | 4 | Classification model |
| AP-005 | No Coverage Gap | High | BR-003 | 4 | BR-003 check |
| AP-006 | No Regression Thinking | High | BR-006 | 4 | regression-analysis |
| AP-007 | Spec Ambiguity Hidden | Medium | BR-007 | 4 | Assumption docs |
| AP-008 | Business Logic Mutation | High | BR-008 | 4 | BR-008 enforcement |
| AP-009 | Environment Block Misreported | Medium | BR-004 | 4 | Classification training |
| AP-010 | False Completeness | High | BR-007 | 4 | BR-007 honesty |

---

## Integration with Validation

These anti-patterns are checked in:
- `validation/failure-mode-checklist.md` - Detection methods
- `validation/downstream-consumability-checklist.md` - Quality gates
- `validation/upstream-consumability-checklist.md` - BR compliance
- Code review checklists
- Self-check checklists

---

## References

- `specs/005-tester-core/spec.md` - Feature specification (Section 6 Business Rules, Section 11 Failure Modes)
- `specs/005-tester-core/validation/failure-mode-checklist.md` - Failure modes
- `role-definition.md` - Role boundaries
- `quality-gate.md` - Quality gates

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial anti-pattern guidance for 005-tester-core covering all 10 failure modes |
