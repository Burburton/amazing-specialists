# Anti-Example 001: Architecture Drift Ignorance

## What Went Wrong

**Anti-Pattern:** AP-101 - Architecture Drift Ignorance
**BR Violated:** BR-003 (Evidence-Based Statusing), BR-005 (Cross-Document Consistency)

## Scenario

The docs role failed to update architecture documents after a significant implementation change. The module boundaries document still shows outdated information that conflicts with actual implementation.

## Incorrect Behavior

### implementation-summary.md
```yaml
module_changes:
  - module: tester
    changes: "验证职责边界强化，移除质量判定逻辑"
    impact: "tester no longer makes quality decisions"
```

### Current Module Boundaries Document (WRONG - Not Updated)
```markdown
### tester
- 职责：测试和质量判定
- 输出：测试结果 + 质量结论
```

**Problem:** The module boundaries document shows tester doing "质量判定" but implementation shows it no longer does this.

## Why This Is a Problem

1. **Architecture-Implementation Mismatch:** Documents don't reflect actual code behavior
2. **Violates BR-003:** Architecture not based on evidence (implementation-summary shows change)
3. **Violates BR-005:** Cross-document inconsistency (module boundaries vs implementation)
4. **Developer Confusion:** New developers read outdated architecture docs
5. **Decision Drift:** ADR-001 shows "proposed" but feature is already implemented

## Detection Method

1. Read implementation-summary to get module_changes
2. Compare with current module-boundaries.md
3. Check for keyword mismatches (e.g., "质量判定" in doc but removed in code)
4. Check ADR status vs actual implementation state

**Checklist:**
- [ ] implementation-summary read?
- [ ] module_changes compared with architecture docs?
- [ ] ADR status checked?
- [ ] Dependency updates verified?

## Correct Behavior

### architecture-sync-report (CORRECT)
```yaml
architecture_sync_report:
  sync_target:
    feature_id: "003-architect-core"
    
  consumed_artifacts:
    - artifact: implementation-summary
      path: specs/004-developer-core/implementation-summary.md
      fields_used: [module_changes]
      
  touched_documents:
    - document: docs/architecture/module-boundaries.md
      type: module-boundary
      status: updated
      change_reason: "BR-003: tester 质量判定职责已移除，需同步文档"
      changes:
        - type: modified
          content: "tester: 职责明确为"独立测试验证，生成 verification-report""
          
  adr_status_updates:
    - adr_id: "ADR-001"
      previous_status: "proposed"
      new_status: "accepted"
      evidence: "implementation-summary.md shows module change completed"
      
  consistency_checks:
    architecture_vs_module_boundary:
      status: consistent
      details: "tester 职责已同步，移除质量判定"
```

## How to Fix

1. Read implementation-summary.md to find module_changes
2. Identify any architecture-related changes (module boundary, dependency, etc.)
3. Update affected architecture documents:
   - module-boundaries.md
   - dependency-graph.md
   - ADR status if applicable
4. Verify cross-document consistency

## Prevention Strategy

- **Always** read implementation-summary after any feature completion
- **Always** check module_changes and dependency_updates fields
- **Always** check if architecture docs need updates
- **Enforce** architecture sync after architect role completion

## BR Violation Mapping

| BR | How Violated | How to Comply |
|----|--------------|---------------|
| BR-003 | Architecture not based on implementation evidence | Read implementation-summary, update docs |
| BR-005 | Architecture docs inconsistent with implementation | Check consistency, update affected docs |

## Related Anti-Patterns

- AP-102: ADR Status Outdated (ADR shows proposed but implementation done)
- AP-104: Missing Dependency Graph (未记录关键依赖变更)