# Anti-Example 001: Status Inflation

## What Went Wrong

**Anti-Pattern:** AP-001 - Status Inflation
**BR Violated:** BR-008 (Status Truthfulness), BR-003 (Evidence-Based Statusing)

## Scenario

The docs role updated README to show a feature as "✅ Complete" when the completion-report clearly shows it is only "substantially_complete" with known gaps.

## Incorrect Behavior

### completion-report.md
```yaml
feature_id: 006-reviewer-core
completion_status: substantially_complete
known_gaps:
  - id: KG-001
    description: "Complex scenario review coverage incomplete"
    impact: "May miss edge cases in complex approval workflows"
    priority: medium
```

### README Update (WRONG)
```markdown
| `006-reviewer-core` | reviewer 角色核心技能 | ✅ Complete | 3 core skills, 4 artifact contracts, validation layer |
```

**Problem:** README shows "✅ Complete" but completion-report shows "substantially_complete" with known gaps.

## Why This Is a Problem

1. **Misleading Users:** Users expect fully complete features, but there are gaps
2. **Violates BR-008:** Status not truthful about known limitations
3. **Violates BR-003:** Status not based on evidence (completion-report shows gaps)
4. **Hidden Technical Debt:** Known gaps not visible in README

## Detection Method

1. Read completion-report before updating README
2. Check if `completion_status` is "complete" (no gaps) vs "substantially_complete" (has gaps)
3. Check if `known_gaps` array is non-empty
4. Compare README status string with completion status

**Checklist:**
- [ ] completion-report read?
- [ ] known_gaps checked?
- [ ] completion_status verified?
- [ ] README status matches evidence?

## Correct Behavior

### README Update (CORRECT)
```markdown
| `006-reviewer-core` | reviewer 角色核心技能 | ⚠️ 基本完成，有已知缺口 | 3 core skills, 4 artifact contracts, validation layer, known_gaps: complex scenarios |
```

### docs-sync-report (CORRECT)
```yaml
status_updates:
  - item: "006-reviewer-core"
    previous_status: "待实现"
    new_status: "⚠️ 基本完成，有已知缺口"
    evidence: "specs/006-reviewer-core/completion-report.md#completion_status=substantially_complete"
    truthful: true  # BR-008 compliance
```

## How to Fix

1. Read completion-report.md for the feature
2. Check completion_status field
3. Check known_gaps array
4. Update README to reflect actual status:
   - "✅ Complete" → only if completion_status = "complete" AND known_gaps = []
   - "⚠️ 基本完成，有已知缺口" → if completion_status = "substantially_complete" OR known_gaps non-empty
5. Include gap summary in README

## Prevention Strategy

- **Always** read completion-report before status updates
- **Never** assume feature is complete without evidence
- **Always** check known_gaps array
- **Enforce** BR-008 check in docs-sync-report

## BR Violation Mapping

| BR | How Violated | How to Comply |
|----|--------------|---------------|
| BR-003 | Status not based on completion-report evidence | Read completion-report, use its status |
| BR-008 | Status not truthful about gaps | Reflect known_gaps in README |

## Related Anti-Patterns

- AP-003: Drift Ignorance (not checking completion-report at all)
- AP-007: Speculation-Based Documentation (writing about what should be, not what is)