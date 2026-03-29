# Feature Spec: Issue Status Sync Skill

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 028-issue-status-sync |
| **Feature Name** | Issue Status Sync Skill for docs Role |
| **Category** | Workflow Enhancement |
| **Priority** | P1 (High) - Critical workflow defect fix |
| **Depends On** | 007-docs-core, 021-github-issue-adapter |
| **Status** | Draft |

## Background

### Problem Statement

Current workflow has a critical defect: **GitHub Issues are closed prematurely by developer role before testing/review/acceptance completes**.

**Observed behavior (T-002 case)**:
- Developer completes implementation
- Agent commits and pushes code
- Agent posts comment and closes Issue
- **Skipped**: tester verification, reviewer acceptance, docs sync, management acceptance

**Root cause analysis**:
1. **Adapter layer** (`scripts/process-issue.js`) has complete "comment + close" logic for automated mode
2. **Developer workflow** (`feature-implementation` skill) has no Issue handling steps
3. **No explicit checklist** ensures Issue workflow after execution completes
4. **No role responsibility** defined for "sync execution status to Issue"

### Governance Gap

| Document | Issue Handling | Gap |
|----------|---------------|-----|
| `role-definition.md` | docs role: "README sync, Changelog" | Missing "Issue status sync" |
| `contracts/pack/registry.json` | DOC-001, DOC-002 defined | Missing "Issue progress report" contract |
| `quality-gate.md` | Task completion checks | Missing "Issue updated" check |
| `developer/feature-implementation` | "准备提交" phase | Missing "Issue workflow" step |

## Goal

**Primary goal**: Establish correct Issue closure workflow where **docs role syncs execution status to Issue, and management closes Issue after acceptance**.

**Specific objectives**:
1. Add `issue-status-sync` skill to docs role
2. Define DOC-003 contract: `issue-progress-report`
3. Skill publishes progress comment to Issue, **does NOT close Issue**
4. Establish that Issue closure is management responsibility (after acceptance)

## Scope

### In Scope

| Item | Description |
|------|-------------|
| **Skill Definition** | `.opencode/skills/docs/issue-status-sync/SKILL.md` |
| **Contract Definition** | `contracts/pack/schemas/docs/issue-progress-report.schema.json` |
| **Role Update** | Add skill to docs role in `role-definition.md` |
| **Registry Update** | Add DOC-003 to `contracts/pack/registry.json` |
| **Workflow Integration** | Define when docs role triggers this skill |
| **Examples** | Positive examples showing correct usage |
| **Anti-Examples** | Anti-pattern: premature Issue closure |
| **Checklists** | Validation checklist for skill output |

### Out of Scope

| Item | Reason |
|------|--------|
| **Adapter modification** | `scripts/process-issue.js` unchanged (works for automated mode) |
| **Management acceptance UI** | Not in expert pack scope (OpenClaw layer) |
| **GitHub API implementation** | Reuse existing `adapters/github-issue/github-client.js` |
| **Webhook handler changes** | Existing webhook handles Issue creation, not closure |

## Actors

| Actor | Role | Responsibility |
|-------|------|----------------|
| **GitHub Issue** | Trigger Source | Provides task dispatch context |
| **docs Role** | Primary Executor | Syncs execution status to Issue |
| **reviewer Role** | Upstream | Produces `acceptance-decision-record` (RC-003) |
| **GitHub Client** | Adapter Component | Posts comment via GitHub API |
| **Management** | Acceptance Layer | Reviews progress, decides to close Issue |

## Workflow Integration

### Current Workflow (Problematic)

```
Issue OPEN
    ↓
dispatch → developer executes
    ↓
developer: implementation + commit + push
    ↓
❌ developer closes Issue (WRONG)
    ↓
Issue CLOSED (prematurely)
```

### Proposed Workflow (Correct)

```
Issue OPEN
    ↓
dispatch → 6-role execution chain
    ↓
architect → developer → tester → reviewer → docs
    ↓
reviewer: acceptance-decision-record (RC-003)
docs: issue-status-sync (DOC-003) ← NEW SKILL
    ↓
docs posts "execution complete, pending acceptance" comment
Issue remains OPEN
    ↓
Management reviews execution result + RC-003
    ↓
Management decision:
  - ACCEPT → Management closes Issue
  - REJECT → Issue stays OPEN, triggers rework
```

### Trigger Conditions for issue-status-sync

docs role triggers `issue-status-sync` when:
1. Task was dispatched via GitHub Issue (has `issue_number` in dispatch context)
2. All upstream roles completed (received `acceptance-decision-record` from reviewer)
3. `execution-reporting` produced execution result
4. Execution result recommendation is CONTINUE or SEND_TO_ACCEPTANCE

### Non-Trigger Conditions

docs role **does NOT** trigger `issue-status-sync` when:
- Task dispatched via CLI (no Issue context)
- Task dispatched via OpenClaw (handled by OpenClaw adapter)
- Execution result recommendation is REWORK or ESCALATE (Issue stays open for rework)
- No GitHub Issue associated with dispatch

## Expected Outputs

### Primary Output: DOC-003 issue-progress-report

```yaml
issue_progress_report:
  # Identity
  issue_number: number
  repository: string  # owner/repo format
  dispatch_id: string
  
  # Execution Summary
  execution_status: SUCCESS | PARTIAL | FAILED | BLOCKED
  roles_completed:
    - role: string
      status: string
      key_output: string
  
  # Key Artifacts Reference
  artifacts_produced:
    - contract_id: string
      file_path: string
      summary: string
  
  # Recommendation
  recommendation: PENDING_ACCEPTANCE | NEEDS_REWORK | BLOCKED_ESCALATION
  recommendation_reason: string
  
  # Quality Summary
  quality_summary:
    tests_passed: boolean | null
    review_status: APPROVED | REJECTED | WARN | null
    security_gate: PASSED | FAILED | null
  
  # Next Steps
  next_steps:
    - action: string
      responsible_party: string
  
  # Timestamp
  posted_at: ISO8601 timestamp
  comment_url: string
```

### Secondary Outputs

- GitHub Issue comment (formatted markdown)
- docs role execution summary

## Acceptance Criteria

### Must Have (P0)

| ID | Criterion | Validation Method |
|----|-----------|-------------------|
| AC-001 | `issue-status-sync` SKILL.md exists | File exists check |
| AC-002 | Skill follows docs role pattern | Template compliance check |
| AC-003 | DOC-003 contract defined in registry | Registry contains DOC-003 |
| AC-004 | Skill output matches DOC-003 schema | Schema validation |
| AC-005 | Skill does NOT close Issue | Code review: no `state: 'closed'` call |
| AC-006 | Examples show correct workflow | Example validation |
| AC-007 | Anti-example shows premature closure | Anti-pattern documented |

### Should Have (P1)

| ID | Criterion | Validation Method |
|----|-----------|-------------------|
| AC-008 | role-definition.md updated | docs skills list includes issue-status-sync |
| AC-009 | Checklist for skill validation | Validation checklist exists |
| AC-010 | README.md updated | docs skills count updated |

### Nice to Have (P2)

| ID | Criterion | Validation Method |
|----|-----------|-------------------|
| AC-011 | Integration test with mock Issue | Test passes |

## Constraints

### Technical Constraints

| Constraint | Source | Reason |
|------------|--------|--------|
| Use existing GitHub Client | 021-github-issue-adapter | Avoid duplication |
| Follow docs skill template | 007-docs-core | Consistency |
| Use DOC-XXX contract namespace | contracts/pack | Naming convention |
| Skill is MVP (not M4) | Architecture decision | Critical workflow fix |

### Governance Constraints

| Constraint | Source | Reason |
|------------|--------|--------|
| BR-001 Evidence Consumption | quality-gate.md | Comment based on artifacts |
| BR-002 Minimal Surface | docs role | Only update Issue comment |
| BR-005 Cross-doc Consistency | docs role | Align with execution result |

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Management doesn't close Issue | Medium | Document workflow expectation |
| Multiple Issues for same task | Low | dispatch_id tracks Issue association |
| Comment format inconsistent | Low | Template-based comment generation |
| GitHub API rate limit | Low | Reuse adapter rate limit handling |

## Dependencies

### Upstream Dependencies

| Dependency | Feature | Purpose |
|------------|---------|---------|
| docs role definition | 007-docs-core | docs role template and patterns |
| GitHub Issue Adapter | 021-github-issue-adapter | GitHub Client, comment templates |
| reviewer acceptance-decision-record | 006-reviewer-core | RC-003 contract for acceptance |

### Downstream Impact

| Impact | Description |
|--------|-------------|
| Workflow correction | All future Issue-driven tasks will have correct closure |
| docs role expansion | docs role adds Issue management responsibility |
| Contract registry growth | DOC-003 added to registry |

## References

- `specs/007-docs-core/spec.md` - docs role core implementation
- `specs/021-github-issue-adapter/spec.md` - GitHub Issue Adapter
- `contracts/pack/registry.json` - Contract registry
- `role-definition.md` - Role definitions
- `adapters/github-issue/comment-templates.js` - Comment generation patterns