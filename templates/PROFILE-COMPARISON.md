# Profile Comparison: Minimal vs Full

## Overview

| Aspect | Minimal | Full |
|--------|---------|------|
| **Purpose** | Essential execution layer | Complete execution layer with enhancements |
| **Target Users** | New projects, simplicity-focused teams | Enterprise, complex projects |
| **File Count** | ~110 | ~200 |
| **Skill Count** | 21 MVP | 37 (21 MVP + 16 M4) |

---

## Skills Matrix

### Common Skills (5) - Both Profiles

| Skill | Purpose |
|-------|---------|
| artifact-reading | Read and parse artifacts |
| context-summarization | Summarize context |
| failure-analysis | Analyze failures |
| execution-reporting | Generate execution reports |
| retry-strategy | Handle retry logic |

### Architect Skills

| Skill | Minimal | Full | Purpose |
|-------|---------|------|---------|
| requirement-to-design | ✓ | ✓ | Convert requirements to design |
| module-boundary-design | ✓ | ✓ | Define module boundaries |
| tradeoff-analysis | ✓ | ✓ | Analyze trade-offs |
| interface-contract-design | - | ✓ | Design API contracts |
| migration-planning | - | ✓ | Plan system migrations |

### Developer Skills

| Skill | Minimal | Full | Purpose |
|-------|---------|------|---------|
| feature-implementation | ✓ | ✓ | Implement features |
| bugfix-workflow | ✓ | ✓ | Fix bugs |
| code-change-selfcheck | ✓ | ✓ | Self-check code changes |
| refactor-safely | - | ✓ | Safe refactoring |
| dependency-minimization | - | ✓ | Minimize dependencies |

### Tester Skills

| Skill | Minimal | Full | Purpose |
|-------|---------|------|---------|
| unit-test-design | ✓ | ✓ | Design unit tests |
| regression-analysis | ✓ | ✓ | Analyze regressions |
| edge-case-matrix | ✓ | ✓ | Identify edge cases |
| integration-test-design | - | ✓ | Design integration tests |
| flaky-test-diagnosis | - | ✓ | Diagnose flaky tests |
| performance-test-design | - | ✓ | Design performance tests |
| benchmark-analysis | - | ✓ | Analyze benchmarks |
| load-test-orchestration | - | ✓ | Orchestrate load tests |
| performance-regression-analysis | - | ✓ | Analyze performance regressions |

### Reviewer Skills

| Skill | Minimal | Full | Purpose |
|-------|---------|------|---------|
| code-review-checklist | ✓ | ✓ | Review code |
| spec-implementation-diff | ✓ | ✓ | Compare spec vs implementation |
| reject-with-actionable-feedback | ✓ | ✓ | Provide actionable feedback |
| maintainability-review | - | ✓ | Review maintainability |
| risk-review | - | ✓ | Assess risks |

### Docs Skills

| Skill | Minimal | Full | Purpose |
|-------|---------|------|---------|
| readme-sync | ✓ | ✓ | Sync README |
| changelog-writing | ✓ | ✓ | Write changelogs |
| architecture-doc-sync | - | ✓ | Sync architecture docs |
| user-guide-update | - | ✓ | Update user guides |

### Security Skills

| Skill | Minimal | Full | Purpose |
|-------|---------|------|---------|
| auth-and-permission-review | ✓ | ✓ | Review auth |
| input-validation-review | ✓ | ✓ | Review input validation |
| secret-handling-review | - | ✓ | Review secret handling |
| dependency-risk-review | - | ✓ | Review dependency risks |

---

## When to Choose Each Profile

### Choose Minimal When:
- Starting a new project
- Team is new to spec-driven development
- Project scope is limited
- Prefer simplicity over completeness
- Don't need performance testing

### Choose Full When:
- Enterprise or complex project
- Need performance/load testing
- Planning system migrations
- Require maintainability reviews
- Need dependency risk analysis
- Have security compliance requirements

---

## Switching Profiles

You can upgrade from minimal to full at any time:

```bash
# Switch to full profile
node templates/cli/install.js --profile full --upgrade

# Preview the changes first
node templates/cli/install.js --profile full --upgrade --dry-run
```

Note: Downgrading from full to minimal is not recommended as it may leave orphan files.