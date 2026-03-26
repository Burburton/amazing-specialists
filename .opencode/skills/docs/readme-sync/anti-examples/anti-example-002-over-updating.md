# Anti-Example 002: Over-Updating

## What Went Wrong

**Anti-Pattern:** AP-002 - Over-Updating
**BR Violated:** BR-002 (Minimal Surface Area)

## Scenario

The docs role updated unrelated README sections while syncing a single feature completion, violating the minimal surface area discipline.

## Incorrect Behavior

### Changed Files from implementation-summary
```yaml
changed_files:
  - .opencode/skills/docs/readme-sync/SKILL.md
  - .opencode/skills/docs/changelog-writing/SKILL.md
```

### README Updates (WRONG)
```markdown
# Updated sections:

## Skills 清单
(Updated docs skills section - CORRECT, related to change)

## Recommended Workflow
(Rewrote entire workflow section - WRONG, unrelated to docs skills)

## Quick Start
(Rewrote quick start examples - WRONG, unrelated to docs skills)

## How to Use
(Rewrote usage instructions - WRONG, unrelated to docs skills)
```

**Problem:** Only docs skills changed, but 4 sections were updated including 3 unrelated ones.

## Why This Is a Problem

1. **Unnecessary Churn:** Changes unrelated to the feature create review burden
2. **Risk of Errors:** More changes = more chances to introduce mistakes
3. **Violates BR-002:** Did not maintain minimal surface area
4. **Unclear Intent:** Hard to understand what changed and why

## Detection Method

1. List all files changed in implementation-summary
2. For each README section to update, ask:
   - "Is this section related to the changed files?"
   - "Is this update necessary to reflect the change?"
3. If answer is "no" for either question, don't update that section

**Checklist:**
- [ ] changed_files from implementation-summary read?
- [ ] Each touched_section has clear reason?
- [ ] All touched_sections related to changed files?
- [ ] Minimal update scope verified?

## Correct Behavior

### README Updates (CORRECT)
```markdown
# Updated sections:

## Skills 清单
(Updated docs skills section - ONLY section related to docs skills change)
```

### docs-sync-report (CORRECT)
```yaml
touched_sections:
  - section: "Skills 清单 > Docs Skills"
    status: updated
    change_reason: "007-docs-core 完成，docs skills 从待实现改为正式实现"  # Clear reason
    changes:
      - type: modified
        content: "### Docs Skills（2个）✅ 正式实现"
```

**Note:** Only ONE section touched, clearly related to the change.

## How to Fix

1. Read implementation-summary changed_files list
2. Identify which README sections are affected by those files
3. Only update those sections
4. Document each touched section with clear change_reason
5. Skip sections unrelated to the change

## Prevention Strategy

- **Only** update sections directly affected by changed files
- **Document** change_reason for every touched section
- **Ask** "Is this related to the change?" before updating
- **Enforce** BR-002 check in docs-sync-report

## BR Violation Mapping

| BR | How Violated | How to Comply |
|----|--------------|---------------|
| BR-002 | Touched unrelated sections | Only touch sections related to changed files |

## Related Anti-Patterns

- AP-006: Undocumented Changes (not documenting why you updated sections)
- AP-003: Drift Ignorance (not checking what actually changed)

## Example: Minimal vs Over-Updating

### ✅ Minimal (Correct)
- Change: docs skills completed
- Touched: 1 section (Skills 清单)
- Reason: Clearly related to docs skills

### ❌ Over-Updating (Wrong)
- Change: docs skills completed
- Touched: 4 sections (Skills, Workflow, Quick Start, How to Use)
- Reason: 3 sections unrelated to change