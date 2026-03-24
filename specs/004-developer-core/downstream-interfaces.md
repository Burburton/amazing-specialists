# 004-developer-core Downstream Interfaces

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `004-developer-core` |
| **Document Type** | Interface Specification |
| **Version** | 1.0.0 |
| **Created** | 2026-03-24 |
| **Status** | Draft |
| **Owner** | developer |

---

## 1. Overview

### 1.1 Handoff Philosophy

The developer role's primary mission is to **transform design notes into working code** and deliver validated implementation artifacts to downstream roles. This document defines the handoff protocols, artifact contracts, and quality expectations for developer-to-downstream role transitions.

**Core Principles:**

1. **Validation Before Handoff**: All code must pass systematic self-check before reaching tester/reviewer.

2. **Transparency**: All deviations, known issues, and risks must be explicitly documented.

3. **Consumability**: Artifacts exist for downstream consumption with clear structure.

4. **Stability**: Once handed off, changes must follow change notification protocol.

5. **Boundary Respect**: Developer provides implementation, not final quality judgment.

### 1.2 Handoff Flow

```
┌─────────────────────────────────────────────────────────┐
│                      DEVELOPER                          │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ feature-impl    │  │ bugfix-workflow             │  │
│  │ - implement     │  │ - analyze                   │  │
│  │ - self-check    │  │ - fix                       │  │
│  │ - summarize     │  │ - verify                    │  │
│  └────────┬────────┘  └────────────┬────────────────┘  │
│           │                        │                    │
│           ▼                        ▼                    │
│  ┌───────────────────────────────────────────────┐     │
│  │ Output Artifacts                              │     │
│  │ - implementation-summary                      │     │
│  │ - self-check-report                           │     │
│  │ - bugfix-report (if applicable)               │     │
│  └────────────────────┬──────────────────────────┘     │
└───────────────────────┼─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   tester    │ │  reviewer   │ │    docs     │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## 2. Per-Role Interface Definitions

### 2.1 Tester Interface

#### What Developer Provides

| Artifact | Section | Purpose | Priority |
|----------|---------|---------|----------|
| implementation-summary | changed_files | Tester knows what to test | Required |
| implementation-summary | goal_alignment | Tester knows expected behavior | Required |
| implementation-summary | deviations_from_design | Tester knows intentional differences | Required |
| implementation-summary | known_issues | Tester knows limitations | Required |
| implementation-summary | risks | Tester knows high-risk areas | Required |
| self-check-report | overall_status | Tester knows pre-delivery quality | Required |
| self-check-report | check_results.tests | Tester knows test coverage | Optional |

#### Expected Format/Structure

**implementation-summary for tester:**
```markdown
## Changed Files
| Path | Type | Description | Lines Changed |
|------|------|-------------|---------------|
| src/auth.ts | modified | Added JWT validation | +45/-12 |

## Goal Alignment
- Goal: "Implement JWT authentication"
- Achieved: true/partial/false
- Deviations: [if any]

## Known Issues
| Issue | Severity | Planned Fix |
|-------|----------|-------------|
| [description] | high/medium/low | [plan] |

## Risks
| Risk | Level | Area |
|------|-------|------|
| [description] | high/medium/low | [component] |
```

#### Consumption Guidance

**Tester should:**

1. **Use `changed_files` for test scope**: Structure test suites around changed files.

2. **Validate `goal_alignment`**: Design tests that verify stated goals are achieved.

3. **Account for `deviations_from_design`**: Test actual implementation, not original design.

4. **Skip `known_issues` areas**: Don't report known issues as new bugs.

5. **Focus on `risks` areas**: Prioritize testing for identified high-risk areas.

6. **Check `self-check-report`**: Spot-check self-check accuracy.

**Tester should NOT:**

1. Assume implementation matches design if deviations are documented
2. Report known issues as failures
3. Skip testing for areas marked as "partial" achievement

#### Feedback Channels

| Issue Type | Channel | Response Time |
|------------|---------|---------------|
| Missing test context | @developer mention | Within task cycle |
| Unclear risk area | Comment on implementation-summary | Within task cycle |
| Self-check inaccuracy | @developer + @reviewer | Next review cycle |

---

### 2.2 Reviewer Interface

#### What Developer Provides

| Artifact | Section | Purpose | Priority |
|----------|---------|---------|----------|
| implementation-summary | all | Review baseline | Required |
| implementation-summary | goal_alignment | Review requirement fulfillment | Required |
| implementation-summary | deviations_from_design | Review design alignment | Required |
| implementation-summary | dependencies_added | Review dependency decisions | Required |
| self-check-report | check_results | Review validation thoroughness | Required |
| self-check-report | blockers | Review blocker resolution | Required |
| self-check-report | warnings | Review improvement areas | Optional |

#### Expected Format/Structure

**self-check-report for reviewer:**
```markdown
## Summary
- Total Checks: 30
- Passed: 28
- Failed: 2
- Blockers: 1
- Warnings: 1

## Blockers (Must Fix)
| ID | Category | Description | Status |
|----|----------|-------------|--------|
| BLOCKER-001 | Security | Hardcoded API key | Fixed |

## Warnings (Should Fix)
| ID | Category | Description |
|----|----------|-------------|
| WARN-001 | Code Quality | Function exceeds 50 lines |

## Check Results by Category
### Goal Alignment
- [x] Implementation matches task goal
- [x] Acceptance criteria met
```

#### Consumption Guidance

**Reviewer should:**

1. **Compare against design-note**: Verify implementation matches design or deviations are justified.

2. **Evaluate deviation rationale**: Assess whether deviations are reasonable.

3. **Spot-check self-check**: Verify blockers are actually fixed, warnings are reasonable.

4. **Review dependency decisions**: Check if new dependencies are justified.

5. **Use blockers/warnings as focus areas**: Prioritize review around identified issues.

**Reviewer should NOT:**

1. Reject solely based on warnings (vs blockers)
2. Require elimination of all deviations
3. Skip code review because self-check passed

#### Feedback Channels

| Issue Type | Channel | Response Time |
|------------|---------|---------------|
| Implementation quality | Formal review comment | Next review cycle |
| Deviation concerns | Review comment with rationale | Next review cycle |
| Self-check inaccuracy | @developer + formal comment | Next review cycle |

---

### 2.3 Docs Interface

#### What Developer Provides

| Artifact | Section | Purpose | Priority |
|----------|---------|---------|----------|
| implementation-summary | goal_alignment | User-facing changes | Required |
| implementation-summary | changed_files | What to document | Required |
| implementation-summary | dependencies_added | Setup changes | Required |
| implementation-summary | performance_notes | Performance characteristics | Optional |

#### Expected Format/Structure

**implementation-summary for docs:**
```markdown
## Goal Alignment
- Goal: "Add user profile feature"
- Achieved: true
- User Impact: Users can now view and edit profiles

## Dependencies Added
| Name | Version | Purpose |
|------|---------|---------|
| sharp | ^0.32.0 | Image processing |

## Performance Notes
- Added caching layer
- Expected latency reduction: 40%
```

#### Consumption Guidance

**Docs should:**

1. **Extract `goal_alignment` for README**: Transform into user-facing feature description.

2. **Document `dependencies_added`**: Update setup/installation instructions.

3. **Include `performance_notes`**: Add to changelog if significant.

4. **Skip implementation details**: Focus on user impact, not code structure.

**Docs should NOT:**

1. Document internal implementation details
2. Speculate on unfinished features
3. Document features marked as "not achieved"

#### Feedback Channels

| Issue Type | Channel | Response Time |
|------------|---------|---------------|
| Missing context | @developer mention | Within task cycle |
| Clarification needed | Comment on implementation-summary | Next doc cycle |

---

## 3. Artifact-to-Role Mapping Matrix

| Artifact | Section | tester | reviewer | docs |
|----------|---------|:------:|:--------:|:----:|
| **implementation-summary** | goal_alignment | ● | ● | ● |
| | implementation_approach | ○ | ● | ○ |
| | changed_files | ● | ● | ○ |
| | deviations_from_design | ● | ● | ○ |
| | dependencies_added | ○ | ● | ● |
| | tests | ● | ○ | ○ |
| | known_issues | ● | ● | ○ |
| | risks | ● | ● | ○ |
| | performance_notes | ○ | ○ | ● |
| **self-check-report** | summary | ● | ● | ○ |
| | check_results | ○ | ● | ○ |
| | blockers | ○ | ● | ○ |
| | warnings | ○ | ● | ○ |
| **bugfix-report** | problem_analysis | ● | ● | ○ |
| | root_cause | ○ | ● | ○ |
| | lessons_learned | ○ | ○ | ● |

**Legend:**
- ● = Primary consumer (directly uses this section)
- ○ = Secondary consumer (may reference this section)

---

## 4. Quality Requirements Per Interface

### 4.1 Tester Interface Quality Gates

| Quality Gate | Criteria | Validation Method |
|--------------|----------|-------------------|
| **Completeness** | All changed files listed | File diff comparison |
| **Clarity** | Goal alignment clear | Test design dry-run |
| **Transparency** | Known issues documented | Gap analysis |
| **Actionability** | Can design tests from summary | Test plan creation |

### 4.2 Reviewer Interface Quality Gates

| Quality Gate | Criteria | Validation Method |
|--------------|----------|-------------------|
| **Completeness** | All required fields present | Checklist validation |
| **Traceability** | Design reference present | Design comparison |
| **Honesty** | Self-check reflects reality | Spot-check verification |
| **Actionability** | Issues categorized | Review focus identification |

### 4.3 Docs Interface Quality Gates

| Quality Gate | Criteria | Validation Method |
|--------------|----------|-------------------|
| **User Impact Clarity** | User-facing changes clear | Documentation draft |
| **Dependency Clarity** | New dependencies documented | Setup verification |
| **Accuracy** | No speculative features | Fact-check |

---

## 5. Change Notification Protocol

### 5.1 Change Classification

| Change Type | Impact | Notification Required | Approval Required |
|-------------|--------|----------------------|-------------------|
| **Breaking** | Requires downstream rework | All consumers | Developer + Reviewer |
| **Non-breaking** | No rework required | Primary consumers | Developer |
| **Clarification** | No functional change | Optional | None |

### 5.2 Notification Workflow

```
┌─────────────────┐
│ Change Request  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Classify Change │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Update Artifact │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Notify Consumers│
└────────┬────────┘
         ↓
┌─────────────────┐
│ Track Adoption  │
└─────────────────┘
```

### 5.3 Notification Matrix

| Change Type | tester | reviewer | docs |
|-------------|:------:|:--------:|:----:|
| **Breaking** | @mention | @mention | @mention |
| **Non-breaking** | Optional | @mention | Optional |
| **Clarification** | - | - | - |

---

## 6. Escalation Paths

### 6.1 From Downstream to Developer

```
Level 1: Direct @developer mention
         ↓ (unresolved after 1 task cycle)
Level 2: @developer + @reviewer mention
         ↓ (unresolved after 1 review cycle)
Level 3: Package owner escalation
```

### 6.2 Escalation Triggers

| Issue | Escalation Level | Path |
|-------|------------------|------|
| Missing implementation context | Level 1 | @developer |
| Unclear risk area | Level 1 | @developer |
| Self-check inaccuracy | Level 2 | @developer + @reviewer |
| Design deviation concern | Level 2 | @developer + @reviewer |

---

## 7. Appendix: Interface Checklist

### 7.1 Pre-Handoff Checklist (Developer)

Before delivering artifacts to downstream roles:

- [ ] All required fields populated per artifact contract
- [ ] implementation-summary complete
- [ ] self-check-report complete
- [ ] All blockers fixed or escalated
- [ ] known_issues documented
- [ ] risks identified
- [ ] Code compiles/builds
- [ ] Change notification prepared (if revision)

### 7.2 Post-Handoff Checklist (Downstream Roles)

**Tester:**
- [ ] Reviewed changed_files
- [ ] Understood goal_alignment
- [ ] Identified deviations_from_design
- [ ] Noted known_issues
- [ ] Prioritized risks areas

**Reviewer:**
- [ ] Compared against design-note
- [ ] Evaluated deviation rationale
- [ ] Spot-checked self-check accuracy
- [ ] Reviewed dependency decisions
- [ ] Used blockers/warnings as focus

**Docs:**
- [ ] Extracted user-facing changes
- [ ] Documented new dependencies
- [ ] Included performance notes if significant
- [ ] Flagged documentation gaps

---

## 8. References

- `specs/004-developer-core/spec.md` - Feature specification
- `specs/004-developer-core/role-scope.md` - Role scope definition
- `specs/003-architect-core/downstream-interfaces.md` - Upstream interfaces
- `package-spec.md` - Package governance
- `role-definition.md` - 6-role definitions
- `io-contract.md` - I/O contracts
- `quality-gate.md` - Quality gate rules
