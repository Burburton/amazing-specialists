# Anti-Pattern Guidance for Reviewer Role

## Document Status
- **Document ID**: `006-reviewer-core-validation-anti-pattern-guidance`
- **Feature ID**: `006-reviewer-core`
- **Version**: 1.0.0
- **Created**: 2026-03-26
- **Last Updated**: 2026-03-26
- **Purpose**: Comprehensive anti-pattern documentation with detection, prevention, and remediation guidance

---

## 1. Purpose

This document provides comprehensive guidance on identifying, preventing, and remediating reviewer anti-patterns. It serves as an educational resource and operational reference for:

1. **Reviewers** - To recognize and avoid common failure modes
2. **Quality Assurance** - To audit review quality
3. **Training** - To onboard new reviewers with real-world examples
4. **Continuous Improvement** - To refine review processes

---

## 2. Overview of Reviewer Anti-Patterns

Reviewer anti-patterns are common but problematic behaviors that undermine the core purpose of independent review: **providing accurate, actionable, and trustworthy judgments about deliverable quality**.

### Impact Classification

| Severity | Impact | Example |
|----------|--------|---------|
| **Critical** | Undermines trust in review process | Rubber stamp approval of defective code |
| **High** | Delays remediation or causes rework cycles | Vague review without actionable guidance |
| **Medium** | Reduces review efficiency | Severity confusion masking real issues |
| **Low** | Minor process deviation | Inconsistent documentation style |

### Anti-Pattern Quick Reference

| ID | Pattern | BR Violated | Severity |
|----|---------|-------------|----------|
| AP-001 | Vague Review | BR-005 | High |
| AP-002 | Rubber Stamp Approval | BR-001, BR-002, BR-006 | Critical |
| AP-003 | Scope Creep Blindness | BR-008 | High |
| AP-004 | Severity Confusion | BR-004 | Medium |
| AP-005 | Governance Drift Ignorance | BR-006 | Critical |
| AP-006 | Silent Fixing | BR-007 | Critical |
| AP-007 | Rejection Without Remedy | BR-005 | High |

---

## 3. Anti-Pattern Detailed Guidance

---

### AP-001: Vague Review

#### Definition
A review that provides feedback without specific, actionable guidance. The reviewer identifies that something is wrong but fails to communicate what specifically needs to change or how to fix it.

#### Real-World Example (Sanitized)

**Scenario**: Developer submits a feature implementation for review.

**Vague Review Output**:
```markdown
## Review Findings

The implementation looks mostly fine but could use some improvement.

**Issues Found**:
- Code quality could be better in some places
- Consider refactoring the main module
- Tests seem incomplete
- Documentation needs work

**Recommendation**: Needs improvement before merge.
```

**Problems with this review**:
- "Could be better" - Which files? Which lines? Better how?
- "Consider refactoring" - What specific refactoring? Why?
- "Tests seem incomplete" - Which test cases are missing? For what scenarios?
- "Needs work" - What specific sections need what changes?
- No severity classification
- No actionable remediation steps

**Correct Review Output**:
```markdown
## Review Findings

### Blocker Issues (Must Fix)
**[BLK-001]** Missing error handling in `src/api/handler.ts:47-52`
- **Issue**: The `processPayment()` function catches errors but does not log them, making debugging impossible in production.
- **Why it matters**: Payment failures without logs will cause customer support escalations with no investigation path.
- **Remediation**: Add structured logging with correlation ID before re-throwing:
  ```typescript
  catch (error) {
    logger.error({ correlationId, error }, 'Payment processing failed');
    throw error;
  }
  ```
- **Verification**: Run integration test `payment-flow.test.ts` and verify logs contain error details.

### Major Issues
**[MAJ-001]** Insufficient test coverage for edge cases
- **Issue**: `src/utils/validator.ts` has 80% coverage but missing tests for null/undefined inputs.
- **Specific gap**: Lines 23-27 (null handling) and lines 45-48 (undefined coercion).
- **Remediation**: Add test cases for null and undefined inputs in `validator.test.ts`.
```

#### Why It's a Problem

1. **Wastes Developer Time**: Developer must guess what to fix, leading to multiple revision cycles.
2. **Erodes Trust**: Developers lose confidence in review value.
3. **Delays Delivery**: Unclear feedback extends review cycles.
4. **Hides Real Issues**: Vague complaints may mask actual blockers.
5. **Violates BR-005**: Every rejection must include specific must-fix items with remediation guidance.

#### Detection Checklist

- [ ] Every finding has a specific file and line reference
- [ ] Every finding explains *why* it matters
- [ ] Every finding has a specific remediation suggestion
- [ ] Findings are classified by severity (blocker/major/minor/note)
- [ ] No finding uses only vague phrases like "improve", "better", "incomplete"
- [ ] Each blocker has a verification method defined

#### Prevention Strategies

1. **Use Structured Templates**: Enforce `review-findings-report` format with required fields.
2. **Apply BR-005 Check**: Before submitting review, verify every rejection has actionable items.
3. **Evidence Linking**: Require each finding to link to specific code, test, or artifact evidence.
4. **Severity Discipline**: Force classification before accepting findings.
5. **Peer Review of Reviews**: Spot-check review outputs for vagueness.

#### Remediation Steps

When vague review is detected:

1. **Acknowledge**: "This review lacks specific actionable guidance."
2. **Analyze Each Finding**:
   - For vague finding: Identify the actual concern (security? performance? maintainability?)
   - Trace to specific code location
   - Determine severity
3. **Reformulate**:
   - Write specific file:line reference
   - Explain the concrete problem
   - Provide specific remediation
   - Add verification method
4. **Resubmit**: Provide corrected review to developer.

#### BR Violation Mapping

| Business Rule | Violation |
|---------------|-----------|
| **BR-005** | Rejection must include specific must-fix items with remediation guidance |
| **BR-004** | Findings must be severity-classified (vague reviews often skip this) |

---

### AP-002: Rubber Stamp Approval

#### Definition
Approving a deliverable based on surface-level review or self-claims without independent verification. The reviewer trusts the developer's assertions without checking the actual implementation or evidence.

#### Real-World Example (Sanitized)

**Scenario**: Developer submits implementation with self-check report.

**Rubber Stamp Review**:
```markdown
## Review Decision: ACCEPT

**Rationale**:
- Developer self-check passed
- All tests green locally
- Implementation matches spec
- Good to merge

**Signed off by**: reviewer-bot
```

**What was actually wrong (discovered in production)**:
- Self-check only covered happy path, not edge cases
- Tests were green because test cases were incomplete
- Implementation added unauthorized features beyond spec
- Governance documents were violated (role boundary confusion)
- Security vulnerability in input validation

**Correct Review Process**:
```markdown
## Review Findings

### Upstream Artifacts Consumed
- `spec.md`: Feature 006-reviewer-core specification
- `implementation-summary`: Developer self-report
- `verification-report`: Test execution results
- `design-note`: Architect guidance

### Independent Verification Performed
- [x] Spec vs Implementation diff (SKILL-002)
- [x] Governance alignment check (AH-006)
- [x] Test coverage analysis
- [x] Code review checklist execution (SKILL-001)

### Findings

**[BLK-001]** Unauthorized scope expansion
- **Issue**: Implementation includes caching layer not specified in spec.
- **Spec requirement**: Section 3.2 explicitly excludes "advanced review specialties"
- **Implementation**: `src/cache/review-cache.ts` was added
- **Why it matters**: BR-008 requires flagging scope creep; unauthorized features create maintenance burden.
- **Remediation**: Remove caching layer or seek explicit spec amendment.

**[MAJ-001]** Governance boundary violation
- **Issue**: Reviewer role code modifies tester artifacts.
- **Evidence**: `src/reviewer/adapter.ts:34` writes to test-output directory
- **Governance**: role-definition.md Section 4.2 prohibits reviewer from mutating tester outputs
- **Remediation**: Move artifact generation to tester role or request role boundary exception.

**[MAJ-002]** Test coverage gap
- **Issue**: Edge case tests missing for null input handling.
- **Evidence**: `test/reviewer.test.ts` has no null input tests despite `validateInput()` function
- **Remediation**: Add test cases for null, undefined, and malformed inputs.

### Decision: REJECT
Blocking issues prevent acceptance. See actionable-feedback-report for remediation steps.
```

#### Why It's a Problem

1. **False Confidence**: Team believes quality is verified when it isn't.
2. **Defects Reach Production**: Issues that should have been caught slip through.
3. **Undermines Review Role**: Review becomes a formality, not a quality gate.
4. **Violates AH-006**: Governance alignment is skipped entirely.
5. **Violates BR-001**: Upstream evidence is ignored, not consumed.
6. **Violates BR-002**: Self-check is treated as independent review.

#### Detection Checklist

- [ ] Review explicitly lists upstream artifacts consumed
- [ ] Review performed independent verification (not just reading self-check)
- [ ] Spec vs implementation diff was performed (SKILL-002)
- [ ] Governance alignment check was performed (AH-006)
- [ ] Evidence links are provided, not just assertions
- [ ] No finding is accepted based solely on "developer says" or "tested locally"
- [ ] Review output format follows `review-findings-report` structure

#### Prevention Strategies

1. **Artifact Consumption Audit**: Require explicit listing of consumed artifacts.
2. **Independent Evidence Mandate**: No finding can be based solely on self-claims.
3. **Governance Checklist**: Include AH-006 checks as mandatory step.
4. **Spec-Implementation Diff**: Require SKILL-002 execution for all reviews.
5. **Spot Audit**: Randomly audit accepted reviews for depth.

#### Remediation Steps

When rubber stamp approval is detected:

1. **Acknowledge**: "This approval was issued without sufficient independent verification."
2. **Block Merge**: Prevent delivery to downstream if not already merged.
3. **Perform Retrospective Review**:
   - Consume all upstream artifacts properly
   - Execute spec-implementation diff
   - Run governance alignment check
   - Perform code review checklist
4. **Document Findings**: Create proper `review-findings-report`.
5. **Issue Corrected Decision**: Accept, accept-with-conditions, or reject with actionable feedback.
6. **Process Improvement**: Add to failure mode checklist for future prevention.

#### BR Violation Mapping

| Business Rule | Violation |
|---------------|-----------|
| **BR-001** | Reviewer must consume upstream evidence, not ignore it |
| **BR-002** | Self-check is not independent review |
| **BR-003** | Every review must produce explicit decision state (often skipped) |
| **BR-006** | Governance alignment checking is mandatory (AH-006) |

---

### AP-003: Scope Creep Blindness

#### Definition
Failing to identify and flag implementation that goes beyond what was specified. The reviewer focuses only on whether the targeted functionality works, ignoring unauthorized additions.

#### Real-World Example (Sanitized)

**Scenario**: Spec defines a simple user profile update feature.

**Spec Scope**:
```markdown
## Feature: User Profile Update

### In Scope
- Update display name
- Update email address
- Basic validation (email format, name length)

### Out of Scope
- Avatar upload
- Profile visibility settings
- Social media linking
```

**Implementation included**:
```typescript
// Specified: profile update
function updateProfile(userId: string, updates: ProfileUpdates): void { ... }

// UNSPECIFIED: avatar upload with image processing
function uploadAvatar(userId: string, image: Buffer): Avatar { ... }

// UNSPECIFIED: social media linking
function linkSocialAccount(userId: string, provider: string, token: string): void { ... }
```

**Blind Review (WRONG)**:
```markdown
## Review: ACCEPT

Profile update function works correctly.
Email validation is proper.
Name length check implemented.
All tests pass.

Ready to merge.
```

**Correct Review**:
```markdown
## Review Findings

### Blocker Issues

**[BLK-001]** Unauthorized Feature Addition - Avatar Upload
- **Issue**: Implementation includes `uploadAvatar()` function not specified in scope.
- **Spec Reference**: Section 3.2 explicitly lists "Avatar upload" as Out of Scope.
- **Implementation Location**: `src/profile/avatar.ts:1-156`
- **Why it matters**: BR-008 requires identifying scope creep; unauthorized features create undocumented maintenance burden and expand attack surface.
- **Remediation**: 
  - Option A: Remove avatar upload code and defer to future feature.
  - Option B: Submit spec amendment request for scope expansion.
- **Verification**: Confirm removal or approved spec amendment.

**[BLK-002]** Unauthorized Feature Addition - Social Media Linking
- **Issue**: Implementation includes `linkSocialAccount()` function not specified in scope.
- **Spec Reference**: Section 3.2 explicitly lists "Social media linking" as Out of Scope.
- **Implementation Location**: `src/profile/social.ts:1-89`
- **Why it matters**: Scope creep introduces unreviewed dependencies (OAuth libraries) and security considerations.
- **Remediation**: Remove or seek explicit authorization.

### Scope Mismatch Summary
| Spec Requirement | Implementation Status | Finding |
|------------------|----------------------|---------|
| Update display name | ✅ Implemented | - |
| Update email address | ✅ Implemented | - |
| Basic validation | ✅ Implemented | - |
| Avatar upload | ❌ Not in spec | BLK-001 |
| Social media linking | ❌ Not in spec | BLK-002 |

### Decision: REJECT
Scope creep detected. Must resolve BLK-001 and BLK-002 before acceptance.
```

#### Why It's a Problem

1. **Hidden Technical Debt**: Unauthorized features lack proper documentation and review.
2. **Security Risk**: New features introduce unassessed attack surfaces.
3. **Maintenance Burden**: Future maintainers don't know why code exists.
4. **Scope Integrity**: Undermines spec-driven development discipline.
5. **Violates BR-008**: Scope creep detection is required.

#### Detection Checklist

- [ ] Spec-implementation diff was explicitly performed (SKILL-002)
- [ ] Every implemented feature is traced to a spec requirement
- [ ] "Out of Scope" items in spec are verified not implemented
- [ ] Implementation additions beyond spec are flagged as findings
- [ ] Scope mismatch summary table is present
- [ ] Unauthorized features are classified as blockers (not just "nice additions")

#### Prevention Strategies

1. **Mandatory Spec Diff**: SKILL-002 must be executed for every review.
2. **Requirement Traceability Matrix**: Map every implementation to spec requirement.
3. **Out-of-Scope Verification**: Explicitly check that out-of-scope items are not implemented.
4. **Addition Detection**: Flag any file/function not referenced in spec or design note.
5. **Scope Expansion Process**: Require formal spec amendment for any additions.

#### Remediation Steps

When scope creep blindness is detected:

1. **Acknowledge**: "This review failed to detect scope creep."
2. **Perform Spec Diff**: Execute SKILL-002 systematically.
3. **Catalog Scope Mismatches**:
   - List all spec requirements vs implementation status
   - List all implementation items not in spec
4. **Classify Findings**:
   - Unauthorized additions = blocker (BR-008)
   - Missing requirements = blocker or major
5. **Update Review Output**: Add scope mismatch section to review-findings-report.
6. **Decision Update**: Re-evaluate accept/reject decision.

#### BR Violation Mapping

| Business Rule | Violation |
|---------------|-----------|
| **BR-008** | Scope creep detection is required |
| **BR-001** | Reviewer must consume spec artifact (often skipped) |

---

### AP-004: Severity Confusion

#### Definition
Treating all findings as equal importance, or misclassifying severity levels. This results in either overwhelming noise (everything is "major") or dangerous dismissal (security vulnerabilities marked as "minor").

#### Real-World Example (Sanitized)

**Scenario**: Review of authentication module.

**Confused Review (WRONG)**:
```markdown
## Review Findings

- Variable name `usr` should be `user` for clarity
- SQL injection vulnerability in login query
- Missing unit test for logout flow
- Comment typo on line 45
- Password stored in plain text temporarily
- Indentation inconsistent in auth module
- Function is 200 lines long, consider splitting
- Session timeout not configurable
- Log message has typo "succesful"
```

**Problems**:
- SQL injection (critical security) mixed with typos (trivial)
- Password handling issue not highlighted as blocker
- No severity classification
- Impossible for developer to prioritize

**Correct Review**:
```markdown
## Review Findings

### Blocker Issues (Must Fix Before Merge)

**[BLK-001]** SQL Injection Vulnerability
- **Severity**: BLOCKER
- **Location**: `src/auth/login.ts:78`
- **Issue**: User input directly interpolated into SQL query.
- **Why it matters**: Allows attackers to execute arbitrary SQL, potentially exposing all user data.
- **Remediation**: Use parameterized queries:
  ```typescript
  // WRONG
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  
  // CORRECT
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email]);
  ```
- **Verification**: Run security test suite and SQL injection test cases.

**[BLK-002]** Plain Text Password Handling
- **Severity**: BLOCKER
- **Location**: `src/auth/password.ts:23-31`
- **Issue**: Password temporarily stored in plain text before hashing.
- **Why it matters**: Memory dump or logging could expose user passwords.
- **Remediation**: Hash password immediately upon receipt; never store plain text.
- **Verification**: Security audit of password handling flow.

### Major Issues (Should Fix)

**[MAJ-001]** Missing Logout Test Coverage
- **Severity**: MAJOR
- **Issue**: No unit tests for logout flow despite implementation.
- **Remediation**: Add test cases for logout scenarios.

**[MAJ-002]** Session Timeout Not Configurable
- **Severity**: MAJOR
- **Issue**: Session timeout hard-coded to 24 hours.
- **Remediation**: Make configurable via environment variable.

**[MAJ-003]** Function Exceeds Complexity Threshold
- **Severity**: MAJOR
- **Location**: `src/auth/handler.ts:12-212`
- **Issue**: Function is 200 lines, violates maintainability guidelines.
- **Remediation**: Extract helper functions for login, validation, session creation.

### Minor Issues (Consider Fixing)

**[MIN-001]** Variable Naming
- **Severity**: MINOR
- **Issue**: `usr` should be `user` for clarity.

**[MIN-002]** Indentation Inconsistency
- **Severity**: MINOR
- **Issue**: Mixed tabs/spaces in auth module.

### Notes (Non-Blocking)

**[NOTE-001]** Comment Typo
- **Issue**: "succesful" should be "successful" in line 45.

### Decision: REJECT
2 blocker issues prevent acceptance. Must fix BLK-001 and BLK-002 before merge.
```

#### Why It's a Problem

1. **Priority Confusion**: Developer cannot determine what to fix first.
2. **Critical Issues Buried**: Security vulnerabilities may be missed among trivial complaints.
3. **Inefficient Remediation**: Time spent on typos while critical fixes wait.
4. **Review Fatigue**: Long lists of equal-priority items overwhelm recipients.
5. **Violates BR-004**: Every finding must be severity-classified.

#### Detection Checklist

- [ ] All findings have explicit severity (blocker/major/minor/note)
- [ ] Severity follows quality-gate.md Section 2.2 definitions
- [ ] Blockers are truly blocking (prevent acceptance)
- [ ] Security issues are appropriately classified (usually blocker/major)
- [ ] Style issues are appropriately classified (usually minor/note)
- [ ] Findings are separated by severity in output
- [ ] No finding is missing severity classification

#### Prevention Strategies

1. **Severity Definitions Reference**: Include quality-gate.md definitions in review template.
2. **Security-First Priority**: Security vulnerabilities automatically blocker or major.
3. **Separation by Category**: Group findings by severity in output.
4. **Classification Discipline**: Force explicit severity per BR-004 before accepting finding.
5. **Severity Calibration**: Periodically audit past reviews for severity accuracy.

#### Remediation Steps

When severity confusion is detected:

1. **Acknowledge**: "Findings lack proper severity classification."
2. **Apply Definitions**:
   - **Blocker**: Must fix, prevents acceptance
   - **Major**: Should fix, affects quality/maintainability
   - **Minor**: Consider fixing, cosmetic/style
   - **Note**: Informational, no action required
3. **Reclassify Each Finding**:
   - Security issues → blocker or major
   - Functional bugs → major
   - Style issues → minor or note
4. **Reorder Output**: Present blockers first, then major, then minor, then notes.
5. **Update Decision**: Re-evaluate accept/reject based on blocker presence.

#### BR Violation Mapping

| Business Rule | Violation |
|---------------|-----------|
| **BR-004** | Findings must be severity-classified per quality-gate.md Section 2.2 |

---

### AP-005: Governance Drift Ignorance

#### Definition
Skipping the AH-006 governance alignment check. The reviewer verifies functional requirements but fails to check if the implementation violates role boundaries, terminology standards, or governance documents.

#### Real-World Example (Sanitized)

**Scenario**: Feature 006-reviewer-core implementation review.

**Governance-Ignorant Review (WRONG)**:
```markdown
## Review: ACCEPT

Implementation complete:
- All 3 skills implemented
- All artifact contracts satisfied
- Tests passing
- Documentation complete

Ready to merge.
```

**What was missed (governance violations)**:
1. Implementation used "spec-writer" terminology (legacy) instead of "architect" (6-role formal)
2. Role boundary violated: reviewer code was mutating developer artifacts
3. Completion-report claimed "Fully Complete" but README showed feature as "In Progress"
4. Artifact paths in spec didn't match actual file locations

**Correct Review (with Governance Alignment)**:
```markdown
## Review Findings

### Governance Alignment Check (AH-006)

#### Canonical Documents Checked
- [x] `role-definition.md` - 6-role boundaries
- [x] `package-spec.md` - Terminology standards
- [x] `io-contract.md` - Artifact formats
- [x] `quality-gate.md` - Severity definitions
- [x] `README.md` - Status truthfulness

#### Governance Conflicts Detected

**[MAJ-001]** Terminology Violation
- **Governance Reference**: `role-definition.md` Section 4 defines 6-role model (architect/developer/tester/reviewer/docs/security)
- **Issue Found**: Implementation uses legacy "spec-writer" terminology in 3 locations
- **Evidence**: 
  - `src/reviewer/adapter.ts:12` - comment references "spec-writer output"
  - `docs/guide.md:45` - describes "spec-writer integration"
  - `test/reviewer.test.ts:89` - test name includes "spec-writer"
- **Why it matters**: Terminology inconsistency causes confusion and violates BR-010.
- **Remediation**: Replace all "spec-writer" references with "architect" or remove if obsolete.

**[MAJ-002]** Role Boundary Violation
- **Governance Reference**: `role-definition.md` Section 4.4 - "Reviewer must not mutate production code"
- **Issue Found**: Reviewer skill generates code modifications directly
- **Evidence**: `src/reviewer/fix-suggester.ts:67-89` writes to `src/` directory
- **Why it matters**: Violates BR-007; reviewer should produce feedback, not code changes.
- **Remediation**: Change to generate `actionable-feedback-report` instead of direct code edits.

**[MAJ-003]** Status Truthfulness Mismatch
- **Governance Reference**: AGENTS.md AH-004 - "Status truthfulness must be verified"
- **Issue Found**: `completion-report.md` claims "Fully Complete" but `README.md` shows "In Progress"
- **Evidence**: 
  - `specs/006-reviewer-core/completion-report.md:5` - "Status: Fully Complete"
  - `README.md:67` - Feature 006 row shows "待实现" (pending implementation)
- **Why it matters**: Misleading status causes confusion for downstream consumers.
- **Remediation**: Update README to match completion-report status, or correct completion-report to reflect actual state.

#### Path Resolution Verification
| Declared Path | Exists | Match |
|---------------|--------|-------|
| `.opencode/skills/reviewer/code-review-checklist/SKILL.md` | ❌ | Missing |
| `.opencode/skills/reviewer/spec-implementation-diff/SKILL.md` | ❌ | Missing |
| `specs/006-reviewer-core/validation/failure-mode-checklist.md` | ❌ | Missing |

### Decision: REJECT
3 major governance conflicts detected. Must resolve governance alignment issues before acceptance.

**Governance Alignment Status**: DRIFT_DETECTED
```

#### Why It's a Problem

1. **Erosion of Standards**: Governance documents become meaningless if not enforced.
2. **Role Confusion**: Team loses clarity on who does what.
3. **Downstream Impact**: Other roles build on incorrect assumptions.
4. **Drift Accumulation**: Small violations compound over time.
5. **Violates BR-006**: Governance alignment checking is mandatory.
6. **Violates AH-006**: Enhanced reviewer responsibilities explicitly require this.

#### Detection Checklist

- [ ] Governance alignment check was explicitly performed
- [ ] `role-definition.md` was checked for role boundary violations
- [ ] `package-spec.md` was checked for terminology consistency
- [ ] `io-contract.md` was checked for artifact format compliance
- [ ] `quality-gate.md` was checked for severity classification
- [ ] `README.md` status was checked against completion-report
- [ ] Declared artifact paths were verified to exist
- [ ] Governance conflicts are reported as major or blocker

#### Prevention Strategies

1. **Governance Checklist Integration**: Include AH-006 checks in SKILL-002 template.
2. **Canonical Document Reference**: Require explicit listing of governance documents checked.
3. **Automated Path Verification**: Verify declared paths exist.
4. **Status Sync Check**: Compare completion-report status to README.
5. **Terminology Audit**: Flag legacy terms during review.

#### Remediation Steps

When governance drift ignorance is detected:

1. **Acknowledge**: "Governance alignment check was skipped or incomplete."
2. **Identify Scope**: Which governance documents should have been checked?
3. **Perform Alignment Check**:
   - Role boundaries vs role-definition.md
   - Terminology vs package-spec.md
   - Artifact formats vs io-contract.md
   - Severity levels vs quality-gate.md
   - Status truthfulness vs README.md
4. **Document Conflicts**: Create explicit governance conflict findings.
5. **Classify Severity**: Governance conflicts are typically major or blocker.
6. **Update Decision**: Re-evaluate based on governance findings.

#### BR Violation Mapping

| Business Rule | Violation |
|---------------|-----------|
| **BR-006** | Governance alignment checking is mandatory (AH-006) |
| **BR-009** | Status truthfulness must be verified |
| **BR-010** | Use 6-role formal semantics |

---

### AP-006: Silent Fixing

#### Definition
The reviewer modifies code directly instead of providing feedback for the developer to fix. This violates the reviewer's role boundary and undermines developer ownership and learning.

#### Real-World Example (Sanitized)

**Scenario**: Reviewer finds a bug in submitted code.

**Silent Fixing (WRONG)**:
```markdown
## Review: ACCEPT (with changes)

I fixed the bug in authentication - you had a null pointer issue.
Also improved the variable names while I was at it.

Changes committed to: feature/auth-fixes
```

**What the reviewer did (inappropriately)**:
- Modified production code directly
- Bypassed developer's learning opportunity
- Created unreviewed changes
- Violated role boundary
- Made acceptance decision on self-modified code

**Correct Review**:
```markdown
## Review Findings

### Blocker Issues

**[BLK-001]** Null Pointer Risk in Authentication
- **Severity**: BLOCKER
- **Location**: `src/auth/handler.ts:45`
- **Issue**: `user.profile` is accessed without null check. If profile is undefined, throws runtime error.
- **Code Context**:
  ```typescript
  // Line 45 - Current (problematic)
  const theme = user.profile.preferences.theme;
  ```
- **Why it matters**: Crashes user sessions when profile is incomplete. Found in 3% of production users.
- **Remediation**: Add null check:
  ```typescript
  // Corrected approach
  const theme = user.profile?.preferences?.theme ?? 'default';
  ```
- **Verification**: 
  - Add test case for user without profile
  - Verify no runtime errors in auth flow

**[MIN-001]** Variable Naming Suggestion
- **Severity**: MINOR
- **Issue**: `u` and `p` variable names are unclear.
- **Location**: `src/auth/handler.ts:12, 18`
- **Suggestion**: Rename to `user` and `preferences` for clarity.
- **Note**: This is optional; current names work but reduce readability.

### Decision: REJECT
Blocking issue BLK-001 must be fixed before acceptance.

### Actionable Feedback Report
See `specs/006-reviewer-core/feedback/auth-handler-feedback.md` for detailed remediation steps.
```

**Role Boundary Enforcement**:
```markdown
## Reviewer Role Boundary (role-definition.md Section 4.4)

### MUST DO
- Identify issues and document findings
- Provide specific remediation guidance
- Classify findings by severity
- Hand off actionable feedback to developer

### MUST NEVER DO
- Modify production code directly
- Fix bugs silently during review
- Commit changes without developer action
- Bypass the developer workflow

### BR-007: Reviewer Must Not Mutate Production Code
If implementation changes are required, reviewer produces actionable feedback, not code changes.
```

#### Why It's a Problem

1. **Role Boundary Violation**: Reviewer crosses into developer territory.
2. **Ownership Loss**: Developer loses ownership of their code.
3. **Learning Loss**: Developer doesn't learn from mistakes.
4. **Unreviewed Changes**: Self-modified code bypasses review.
5. **Accountability Gap**: Who is responsible for the fix?
6. **Violates BR-007**: Reviewer must not mutate production code.

#### Detection Checklist

- [ ] Review output contains no "I fixed..." or "changes committed" statements
- [ ] All remediation is provided as guidance, not applied code
- [ ] No reviewer commits in the feature branch
- [ ] Reviewer did not push to developer's branch
- [ ] Feedback is actionable, not already acted upon
- [ ] Role boundary is respected (reviewer provides feedback, developer fixes)

#### Prevention Strategies

1. **Role Boundary Documentation**: Clear MUST DO / MUST NEVER DO in role-definition.md.
2. **Separation Enforcement**: Reviewer accounts cannot commit to feature branches.
3. **BR-007 Check**: Explicit check before approval: "Did I modify code?"
4. **Feedback Template**: Force use of actionable-feedback-report format.
5. **Code Ownership**: Developer must be the one to commit fixes.

#### Remediation Steps

When silent fixing is detected:

1. **Acknowledge**: "Reviewer inappropriately modified code during review."
2. **Revert Self-Changes**: Remove reviewer's code modifications.
3. **Convert to Feedback**:
   - Document what was wrong
   - Explain why it matters
   - Provide remediation guidance
   - Define verification method
4. **Return to Developer**: Hand off actionable feedback for developer to fix.
5. **Re-Review**: After developer fixes, perform proper review.

#### BR Violation Mapping

| Business Rule | Violation |
|---------------|-----------|
| **BR-007** | Reviewer must not mutate production code |

---

### AP-007: Rejection Without Remedy

#### Definition
Rejecting work without providing specific, actionable remediation guidance. The developer is told something is wrong but not given clear direction on how to fix it.

#### Real-World Example (Sanitized)

**Scenario**: Developer submits feature implementation.

**Rejection Without Remedy (WRONG)**:
```markdown
## Review Decision: REJECT

This doesn't meet our quality standards.

Issues:
- Code structure is problematic
- Tests are insufficient
- Documentation is lacking
- Performance concerns

Please address these issues and resubmit.
```

**Problems**:
- "Problematic" - What specifically is wrong?
- "Insufficient" - Which test cases are missing?
- "Lacking" - What documentation is needed?
- "Concerns" - What performance metrics are failing?
- No path forward provided
- Developer cannot act on this feedback

**Correct Rejection with Remedy**:
```markdown
## Review Decision: REJECT

Blocking issues identified. See detailed remediation below.

### Blocking Issues (Must Fix)

**[BLK-001]** Missing Error Handling for Network Failures
- **Location**: `src/api/client.ts:67-89`
- **Issue**: `fetchUserData()` does not handle network timeout or connection refused errors.
- **Impact**: Users see blank screen instead of error message during network issues.
- **Remediation**: Add try-catch with error handling:
  ```typescript
  async function fetchUserData(userId: string): Promise<UserData> {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}`, response.status);
      }
      return response.json();
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new UserFacingError('Request timed out. Please try again.');
      }
      if (error.name === 'TypeError') {
        throw new UserFacingError('Network error. Please check your connection.');
      }
      throw error;
    }
  }
  ```
- **Verification**: Run `npm run test:network` to verify error scenarios.

**[BLK-002]** Missing Test Coverage for Edge Cases
- **Issue**: Test suite only covers happy path.
- **Missing Test Cases**:
  | Scenario | Status |
  |----------|--------|
  | Network timeout | ❌ Not tested |
  | Invalid user ID | ❌ Not tested |
  | Malformed response | ❌ Not tested |
  | Concurrent requests | ❌ Not tested |
- **Remediation**: Add tests in `test/api/client.test.ts`:
  ```typescript
  describe('fetchUserData edge cases', () => {
    it('should handle network timeout', async () => { ... });
    it('should handle invalid user ID', async () => { ... });
    it('should handle malformed response', async () => { ... });
  });
  ```
- **Verification**: `npm test -- --coverage` must show >90% coverage for client.ts.

**[BLK-003]** API Documentation Missing
- **Issue**: `fetchUserData()` has no JSDoc or API documentation.
- **Remediation**: Add documentation:
  ```typescript
  /**
   * Fetches user data from the API.
   * @param userId - The unique identifier of the user
   * @returns Promise resolving to user data object
   * @throws {UserFacingError} On network timeout or connection error
   * @throws {ApiError} On HTTP error responses (4xx, 5xx)
   */
  async function fetchUserData(userId: string): Promise<UserData>
  ```

### Non-Blocking Issues (Should Fix)

**[MAJ-001]** Performance: Unnecessary Re-renders
- **Issue**: `UserCard` component re-renders on every parent update.
- **Remediation**: Wrap in `React.memo()` or use proper dependency array.
- **Note**: This is an optimization; not blocking for current release.

### Re-Review Criteria

When resubmitting, the following will be verified:
- [ ] All 4 edge case tests pass
- [ ] Test coverage >90% for `client.ts`
- [ ] JSDoc documentation present
- [ ] Error handling tests demonstrate proper user-facing errors

### Actionable Feedback Report
Detailed remediation guide: `specs/006-reviewer-core/feedback/api-client-feedback.md`
```

#### Why It's a Problem

1. **Developer Frustration**: No clear path forward.
2. **Extended Review Cycles**: Multiple back-and-forth to clarify.
3. **Arbitrary Standards**: "Quality standards" is not actionable.
4. **Wasted Time**: Developer guesses at what to fix.
5. **Violates BR-005**: Every rejection must include specific must-fix items with remediation.

#### Detection Checklist

- [ ] Rejection includes specific must-fix items
- [ ] Each must-fix item has remediation guidance
- [ ] Each must-fix item has verification method
- [ ] Developer can act on feedback without clarification
- [ ] No vague phrases like "improve quality" without specifics
- [ ] Actionable feedback report is provided or referenced

#### Prevention Strategies

1. **BR-005 Enforcement**: Require actionable-feedback-report for all rejections.
2. **Template Discipline**: Use actionable-feedback-report template with required fields.
3. **Remediation Format**: Each finding must have Issue, Why It Matters, Remediation, Verification.
4. **Clarity Check**: Could a developer understand exactly what to fix without asking questions?
5. **Review of Reviews**: Audit past rejections for actionability.

#### Remediation Steps

When rejection without remedy is detected:

1. **Acknowledge**: "Rejection was provided without actionable remediation."
2. **For Each Finding**:
   - Make the issue specific (file, line, behavior)
   - Explain why it matters (impact)
   - Provide specific remediation (code example, steps)
   - Define verification method (how to confirm fix)
3. **Generate Feedback Report**: Create actionable-feedback-report artifact.
4. **Update Rejection**: Replace vague rejection with specific actionable feedback.
5. **Communicate to Developer**: Provide clear path to acceptance.

#### BR Violation Mapping

| Business Rule | Violation |
|---------------|-----------|
| **BR-005** | Rejection must be actionable; every must-fix requires remediation guidance |

---

## 4. Anti-Pattern Decision Tree

```
                    Review Output Produced
                            │
                            ▼
            ┌───────────────────────────────┐
            │ Is every finding specific     │
            │ with file:line and evidence?  │
            └───────────────────────────────┘
                    │               │
                   NO              YES
                    │               │
                    ▼               ▼
            ┌───────────────┐   ┌───────────────────────────────┐
            │ AP-001: Vague │   │ Is severity classification    │
            │ Review        │   │ applied to all findings?      │
            └───────────────┘   └───────────────────────────────┘
                                    │               │
                                   NO              YES
                                    │               │
                                    ▼               ▼
                            ┌────────────────┐   ┌───────────────────────────────┐
                            │ AP-004:        │   │ Was independent verification   │
                            │ Severity       │   │ performed (not just self-check)?│
                            │ Confusion      │   └───────────────────────────────┘
                            └────────────────┘           │               │
                                                        NO              YES
                                                         │               │
                                                         ▼               ▼
                                                ┌────────────────┐   ┌───────────────────────────────┐
                                                │ AP-002: Rubber │   │ Was spec-implementation diff   │
                                                │ Stamp Approval │   │ performed?                     │
                                                └────────────────┘   └───────────────────────────────┘
                                                                         │               │
                                                                        NO              YES
                                                                         │               │
                                                                         ▼               ▼
                                                                ┌────────────────┐   ┌───────────────────────────────┐
                                                                │ AP-003: Scope  │   │ Was governance alignment       │
                                                                │ Creep Blindness│   │ checked (AH-006)?              │
                                                                └────────────────┘   └───────────────────────────────┘
                                                                                         │               │
                                                                                        NO              YES
                                                                                         │               │
                                                                                         ▼               ▼
                                                                                ┌────────────────┐   ┌───────────────────────────────┐
                                                                                │ AP-005:        │   │ Did reviewer modify code       │
                                                                                │ Governance     │   │ directly?                      │
                                                                                │ Drift Ignorance│   └───────────────────────────────┘
                                                                                └────────────────┘           │               │
                                                                                                            YES             NO
                                                                                                             │               │
                                                                                                             ▼               ▼
                                                                                                    ┌────────────────┐   ┌───────────────────────────────┐
                                                                                                    │ AP-006: Silent │   │ If rejected, is feedback       │
                                                                                                    │ Fixing         │   │ actionable with remediation?   │
                                                                                                    └────────────────┘   └───────────────────────────────┘
                                                                                                                             │               │
                                                                                                                            NO              YES
                                                                                                                             │               │
                                                                                                                             ▼               ▼
                                                                                                                    ┌────────────────┐   ┌─────────────┐
                                                                                                                    │ AP-007:        │   │ VALID       │
                                                                                                                    │ Rejection      │   │ REVIEW      │
                                                                                                                    │ Without Remedy │   │ OUTPUT      │
                                                                                                                    └────────────────┘   └─────────────┘
```

---

## 5. Quick Reference Table

| Anti-Pattern | BR Violated | Detection Question | Severity | Prevention Key |
|--------------|-------------|---------------------|----------|----------------|
| **AP-001: Vague Review** | BR-005 | Can developer act on feedback without clarification? | High | Structured templates, evidence linking |
| **AP-002: Rubber Stamp** | BR-001, BR-002, BR-006 | Was independent verification performed? | Critical | Artifact consumption audit, governance checklist |
| **AP-003: Scope Creep Blindness** | BR-008 | Was spec-implementation diff performed? | High | Mandatory SKILL-002, requirement traceability |
| **AP-004: Severity Confusion** | BR-004 | Are all findings severity-classified correctly? | Medium | Severity definitions reference, security-first |
| **AP-005: Governance Drift** | BR-006 | Was AH-006 governance alignment checked? | Critical | Mandatory AH-006 checks, canonical document reference |
| **AP-006: Silent Fixing** | BR-007 | Did reviewer modify code directly? | Critical | Role boundary enforcement, BR-007 check |
| **AP-007: Rejection Without Remedy** | BR-005 | Does rejection include actionable remediation? | High | Actionable feedback template, BR-005 enforcement |

---

## 6. Detection Summary Checklist

Use this checklist to verify review output quality:

### Completeness
- [ ] All upstream artifacts consumed and listed
- [ ] Spec-implementation diff performed
- [ ] Governance alignment checked (AH-006)
- [ ] Decision state is explicit (accept/reject/accept-with-conditions/needs-clarification)

### Specificity
- [ ] Every finding has file:line reference
- [ ] Every finding explains why it matters
- [ ] Every finding has specific remediation
- [ ] No vague phrases without detail

### Severity
- [ ] Every finding has severity classification
- [ ] Severities follow quality-gate.md definitions
- [ ] Blockers truly block acceptance
- [ ] Security issues appropriately classified

### Governance
- [ ] Role boundaries respected
- [ ] Terminology consistent with package-spec.md
- [ ] Artifact paths verified to exist
- [ ] Status truthfulness checked

### Actionability
- [ ] Rejection includes must-fix items
- [ ] Each must-fix has remediation guidance
- [ ] Each must-fix has verification method
- [ ] Developer can proceed without clarification

### Role Boundary
- [ ] Reviewer did not modify production code
- [ ] Feedback is provided, not fixes applied
- [ ] Developer maintains ownership
- [ ] Re-review criteria defined

---

## 7. References

- `specs/006-reviewer-core/spec.md` - Feature specification
- `quality-gate.md` Section 2.2 - Severity level definitions
- `role-definition.md` Section 4 - Reviewer role definition
- `AGENTS.md` - AH-006 governance alignment rules
- `specs/006-reviewer-core/validation/failure-mode-checklist.md` - Failure mode checklist

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial comprehensive anti-pattern guidance |