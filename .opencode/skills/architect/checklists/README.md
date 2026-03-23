# Architect Checklists Index

This directory contains shared checklists for architect skill validation.

## Available Checklists

| Checklist | Purpose | Location |
|-----------|---------|----------|
| `requirement-mapping-checklist.md` | Validate requirement-to-design transformation | `requirement-to-design/checklists/` |
| `boundary-check-checklist.md` | Validate module boundary design | `module-boundary-design/checklists/` |
| `tradeoff-validation-checklist.md` | Validate trade-off analysis | `tradeoff-analysis/checklists/` |

## Cross-Skill Validation

For validation across all architect skills, see:
- `specs/003-architect-core/validation/skill-validation-checklist.md`
- `specs/003-architect-core/validation/downstream-consumability-checklist.md`
- `specs/003-architect-core/validation/failure-mode-checklist.md`
- `specs/003-architect-core/validation/anti-pattern-guidance.md`

## Usage

1. **Pre-Execution**: Review checklist before starting skill execution
2. **During Execution**: Use process checks as you work
3. **Post-Execution**: Validate all post-conditions
4. **Anti-Pattern Check**: Verify no anti-patterns present

## Checklist Categories

### Pre-Conditions
Requirements before skill execution can begin

### Process Checks
Validation during skill execution

### Post-Conditions
Verification after skill execution completes

### Anti-Pattern Checks
Detection of common failure modes

## Validation Flow

```
Pre-Conditions → Process Checks → Post-Conditions → Anti-Pattern Check
                                                          ↓
                                                    Pass/Fail Decision
```