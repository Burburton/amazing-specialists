# Implementation Plan: Issue Status Sync Skill

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 028-issue-status-sync |
| **Plan Version** | 1.0 |
| **Estimated Effort** | 4-6 hours |
| **Risk Level** | Low |

## Design Summary

Add `issue-status-sync` skill to docs role that:
1. Receives execution context from upstream roles
2. Generates issue-progress-report (DOC-003)
3. Posts comment to GitHub Issue
4. **Does NOT close Issue** (management responsibility)

## Architecture

### Component Structure

```
.opencode/skills/docs/issue-status-sync/
├── SKILL.md                    # Main skill definition
├── checklists/
│   └── validation-checklist.md
├── examples/
│   ├── example-001-successful-execution.md
│   └── example-002-partial-execution.md
└── anti-examples/
    └── anti-example-001-premature-closure.md

contracts/pack/
├── registry.json               # Add DOC-003 entry
└── schemas/docs/
    └── issue-progress-report.schema.json  # New schema
```

### Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    Execution Chain                           │
│                                                              │
│  architect → developer → tester → reviewer → docs           │
│                                │              │              │
│                                ↓              ↓              │
│                         RC-003 (accept)   DOC-003            │
│                         decision-record   issue-progress     │
│                                              │               │
│                                              ↓               │
│                                    GitHub Issue Comment      │
│                                    (Issue remains OPEN)      │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Skill Core (P0-T1)

**Goal**: Create main SKILL.md with complete definition

**Tasks**:
| Task ID | Description | Est. Time |
|---------|-------------|-----------|
| P1-T1 | Create SKILL.md skeleton | 15 min |
| P1-T2 | Define Purpose and When to Use | 10 min |
| P1-T3 | Define Implementation Process | 30 min |
| P1-T4 | Define Output Requirements (DOC-003) | 20 min |
| P1-T5 | Add Examples | 20 min |
| P1-T6 | Add Anti-Examples | 15 min |
| P1-T7 | Add Checklists | 15 min |

**Deliverables**:
- `.opencode/skills/docs/issue-status-sync/SKILL.md`

### Phase 2: Contract Definition (P0-T2)

**Goal**: Define DOC-003 contract in registry and schema

**Tasks**:
| Task ID | Description | Est. Time |
|---------|-------------|-----------|
| P2-T1 | Create issue-progress-report.schema.json | 20 min |
| P2-T2 | Update registry.json with DOC-003 entry | 10 min |
| P2-T3 | Validate schema against skill output | 15 min |

**Deliverables**:
- `contracts/pack/schemas/docs/issue-progress-report.schema.json`
- Updated `contracts/pack/registry.json`

### Phase 3: Role Integration (P0-T3)

**Goal**: Update docs role definition to include new skill

**Tasks**:
| Task ID | Description | Est. Time |
|---------|-------------|-----------|
| P3-T1 | Update role-definition.md docs skills list | 10 min |
| P3-T2 | Update docs role inScope/triggerConditions | 10 min |
| P3-T3 | Update README.md skills count | 10 min |

**Deliverables**:
- Updated `role-definition.md`
- Updated `README.md`

### Phase 4: Supporting Materials (P1-T4)

**Goal**: Create checklists and examples

**Tasks**:
| Task ID | Description | Est. Time |
|---------|-------------|-----------|
| P4-T1 | Create validation-checklist.md | 15 min |
| P4-T2 | Create example-001-successful-execution.md | 20 min |
| P4-T3 | Create example-002-partial-execution.md | 15 min |
| P4-T4 | Create anti-example-001-premature-closure.md | 15 min |

**Deliverables**:
- `checklists/validation-checklist.md`
- `examples/example-001-successful-execution.md`
- `examples/example-002-partial-execution.md`
- `anti-examples/anti-example-001-premature-closure.md`

### Phase 5: Validation (P1-T5)

**Goal**: Verify implementation meets acceptance criteria

**Tasks**:
| Task ID | Description | Est. Time |
|---------|-------------|-----------|
| P5-T1 | Verify SKILL.md follows docs template | 10 min |
| P5-T2 | Verify skill does NOT close Issue | 10 min |
| P5-T3 | Verify DOC-003 schema validation | 10 min |
| P5-T4 | Create completion-report.md | 20 min |

**Deliverables**:
- Validation results
- `specs/028-issue-status-sync/completion-report.md`

## Dependency Graph

```
P1-T1 ─┬─> P1-T2 ─> P1-T3 ─> P1-T4 ─> P1-T5 ─> P1-T6 ─> P1-T7
       │                                              │
       │                                              ↓
       └──────────────────────────────────────> P2-T1 ─> P2-T2 ─> P2-T3
                                                              │
                                                              ↓
                                                        P3-T1 ─> P3-T2 ─> P3-T3
                                                              │
                                                              ↓
                                                        P4-T1 ─> P4-T2 ─> P4-T3 ─> P4-T4
                                                              │
                                                              ↓
                                                        P5-T1 ─> P5-T2 ─> P5-T3 ─> P5-T4
```

## Parallel Execution Opportunities

| Phase | Tasks | Can Parallel With |
|-------|-------|-------------------|
| Phase 1 | P1-T5, P1-T6 | Each other |
| Phase 4 | P4-T1, P4-T2, P4-T3, P4-T4 | All four in parallel |
| Phase 5 | P5-T1, P5-T2, P5-T3 | All three in parallel |

## Technical Decisions

### Decision 1: Comment Template Format

**Option A**: Use existing `comment-templates.js` from GitHub Issue Adapter
**Option B**: Create new template in skill

**Decision**: **Option A** - Reuse existing template infrastructure

**Rationale**:
- DRY principle
- Consistent comment format across adapters
- Adapter already tested

### Decision 2: Issue Closure Responsibility

**Option A**: docs role closes Issue after successful execution
**Option B**: docs role posts comment only, management closes

**Decision**: **Option B** - docs posts comment only

**Rationale**:
- Separation of concerns: execution vs. acceptance
- Management (OpenClaw layer) should decide closure
- Allows for human review before closure

### Decision 3: Trigger Mechanism

**Option A**: Automatic trigger when reviewer produces RC-003
**Option B**: Manual trigger by docs role

**Decision**: **Option B** - Explicit trigger by docs role

**Rationale**:
- docs role has full context of what to sync
- Follows existing docs skill pattern
- Allows docs to aggregate multiple artifacts

## Risk Mitigation

| Risk | Mitigation | Owner |
|------|------------|-------|
| Comment format inconsistent | Reuse comment-templates.js | developer |
| Missing Issue context | Check dispatch context before executing | developer |
| Premature closure | Anti-example + code review | reviewer |
| Schema mismatch | Validate output against schema | tester |

## Testing Strategy

### Unit Testing
- Schema validation for DOC-003 output
- Comment format validation

### Integration Testing
- Mock GitHub API call
- Verify comment posted, Issue NOT closed

### Validation Checklist
- All AC criteria checked
- Anti-patterns not present
- Governance compliance verified

## Rollback Plan

If issues found:
1. Remove DOC-003 from registry
2. Remove skill from role-definition.md
3. Delete skill directory
4. No data migration needed (new feature)

## Success Metrics

| Metric | Target |
|--------|--------|
| Skill completeness | 100% (all sections filled) |
| Schema compliance | 100% (all outputs validate) |
| Anti-pattern coverage | 100% (premature closure documented) |
| Governance compliance | AH-001~AH-006 pass |

## Timeline

| Phase | Start | Duration | End |
|-------|-------|----------|-----|
| Phase 1: Skill Core | T+0 | 2h | T+2h |
| Phase 2: Contract | T+2h | 1h | T+3h |
| Phase 3: Role Integration | T+3h | 0.5h | T+3.5h |
| Phase 4: Materials | T+3.5h | 1h | T+4.5h |
| Phase 5: Validation | T+4.5h | 1h | T+5.5h |

**Total Estimated Time**: 5.5 hours