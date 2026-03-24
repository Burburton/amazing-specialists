# Downstream Consumability Checklist

## Purpose
Verify that developer outputs are consumable by tester, reviewer, and docs.

---

## Tester Consumability

### implementation-summary for Tester
- [ ] `changed_files` complete with all modified/added/deleted files
- [ ] `changed_files` includes line counts
- [ ] `goal_alignment` clearly states achieved/partial/false
- [ ] `deviations_from_design` documented (if any)
- [ ] `known_issues` lists all known problems
- [ ] `risks` identifies high-risk areas
- [ ] `tests` section documents test coverage

### Testability Verification
- [ ] Tester can identify test scope from `changed_files`
- [ ] Tester can design acceptance tests from `goal_alignment`
- [ ] Tester can account for `deviations_from_design`
- [ ] Tester can skip `known_issues` without false positives
- [ ] Tester can prioritize `risks` areas

### self-check-report for Tester
- [ ] `overall_status` is honest
- [ ] `blockers` are actually fixed if status is PASS
- [ ] Test coverage category checked
- [ ] Tests pass category verified

---

## Reviewer Consumability

### implementation-summary for Reviewer
- [ ] `implementation.approach` describes strategy
- [ ] `implementation.key_decisions` documents decisions
- [ ] `dependencies_added` justified (if any)
- [ ] `deviations_from_design` has rationale
- [ ] `recommendation` is appropriate

### Review Baseline
- [ ] Can compare implementation against design-note
- [ ] Can evaluate deviation rationale
- [ ] Can assess dependency necessity
- [ ] Can identify review focus from `blockers`/`warnings`

### self-check-report for Reviewer
- [ ] All 10 categories checked
- [ ] `blockers` fixed or escalated
- [ ] `warnings` reasonable
- [ ] Spot-check reveals honest assessment

---

## Docs Consumability

### implementation-summary for Docs
- [ ] `goal_alignment` describes user-facing changes
- [ ] `dependencies_added` documented with reasons
- [ ] `performance_notes` included (if applicable)
- [ ] No speculative feature claims

### Documentation Baseline
- [ ] Can extract user-facing changes for README
- [ ] Can update setup instructions from `dependencies_added`
- [ ] Can create changelog entry from `goal_alignment`
- [ ] Can identify documentation gaps

---

## Artifact Completeness

### implementation-summary
| Field | Required | Present |
|-------|----------|---------|
| `dispatch_id` | Yes | [ ] |
| `task_id` | Yes | [ ] |
| `goal_alignment` | Yes | [ ] |
| `implementation` | Yes | [ ] |
| `changed_files` | Yes | [ ] |
| `dependencies_added` | If changed | [ ] |
| `tests` | Recommended | [ ] |
| `self_check` | Yes | [ ] |
| `known_issues` | Yes | [ ] |
| `risks` | Yes | [ ] |
| `recommendation` | Yes | [ ] |

### self-check-report
| Field | Required | Present |
|-------|----------|---------|
| `dispatch_id` | Yes | [ ] |
| `task_id` | Yes | [ ] |
| `summary` | Yes | [ ] |
| `check_results` | Yes | [ ] |
| `blockers` | If any | [ ] |
| `warnings` | If any | [ ] |
| `overall_status` | Yes | [ ] |
| `recommendation` | Yes | [ ] |

---

## Quality Gates

### tester Gate
- [ ] Can design test scope
- [ ] Can identify expected behavior
- [ ] Can avoid known issues
- [ ] Can prioritize risk areas

### reviewer Gate
- [ ] Can compare against design
- [ ] Can evaluate decisions
- [ ] Can verify self-check honesty
- [ ] Can identify review focus

### docs Gate
- [ ] Can extract user changes
- [ ] Can update setup docs
- [ ] Can create changelog
- [ ] No speculative claims

---

## Checklist Summary

| Consumer | Checks | Required |
|----------|--------|----------|
| Tester Consumability | 14 | All required |
| Reviewer Consumability | 14 | All required |
| Docs Consumability | 8 | All required |
| Artifact Completeness | 19 | All required |
| Quality Gates | 12 | All required |
| **Total** | **67** | **All required** |

---

## References
- `specs/004-developer-core/downstream-interfaces.md` - Interface definitions
- `specs/004-developer-core/contracts/implementation-summary-contract.md` - Contract
- `specs/004-developer-core/contracts/self-check-report-contract.md` - Contract