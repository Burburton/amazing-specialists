# Architect Skills

## Overview

This directory contains the **architect** role's core skills for the 6-role formal execution model. The architect transforms feature specifications into executable technical designs, defines module boundaries, and provides stable baselines for downstream roles.

## Role Mission

Transform requirements into executable technical designs, define module boundaries, and provide stable baselines for downstream roles (developer, tester, reviewer, docs, security).

## Skill Taxonomy

### Core Skills (3)

| Skill | Purpose | Primary Output |
|-------|---------|----------------|
| `requirement-to-design` | Transform feature specs into structured design notes | `design-note` |
| `module-boundary-design` | Define module boundaries, responsibilities, and dependencies | `module-boundaries` |
| `tradeoff-analysis` | Document design decisions with alternatives and rationale | `risks-and-tradeoffs` |

### Advanced Skills (Future)

| Skill | Purpose | Status |
|-------|---------|--------|
| `interface-contract-design` | Define API and data contracts | Planned |
| `dependency-shaping` | Design dependency architecture | Planned |
| `architecture-risk-framing` | Frame architectural risks | Planned |
| `migration-path-design` | Design migration strategies | Planned |
| `extensibility-planning` | Plan for future extensions | Planned |
| `operational-boundary-design` | Define operational boundaries | Planned |

## Skill Naming Convention

- Use lowercase with hyphens: `requirement-to-design`
- Action-oriented naming: `[input]-to-[output]` or `[domain]-[action]`
- Directory name matches skill invocation name

## Skill Directory Structure

```
architect/
├── README.md                          # This file
├── SKILL-METADATA-TEMPLATE.md         # Standard metadata template
├── templates/                         # Shared templates
│   └── README.md
├── checklists/                        # Shared checklists
│   └── README.md
├── requirement-to-design/
│   ├── SKILL.md                       # Skill definition
│   ├── examples/                      # Correct usage demonstrations
│   ├── anti-examples/                 # Common mistake demonstrations
│   ├── templates/                     # Reusable templates
│   └── checklists/                    # Validation checklists
├── module-boundary-design/
│   ├── SKILL.md
│   ├── examples/
│   ├── anti-examples/
│   ├── templates/
│   └── checklists/
└── tradeoff-analysis/
    ├── SKILL.md
    ├── examples/
    ├── anti-examples/
    ├── templates/
    └── checklists/
```

## Skill Discovery Path

1. **Entry Point**: Start with this `README.md`
2. **Skill Selection**: Choose appropriate skill based on task
3. **Skill Definition**: Read `SKILL.md` for detailed guidance
4. **Examples**: Review `examples/` for correct patterns
5. **Anti-Examples**: Review `anti-examples/` for common pitfalls
6. **Templates**: Use `templates/` for artifact structure
7. **Checklists**: Validate with `checklists/`

## Downstream Consumers

| Role | Consumes |
|------|----------|
| `developer` | design-note, module-boundaries, constraints, integration seams |
| `tester` | module divisions, critical paths, boundary conditions, risk areas |
| `reviewer` | decision rationale, trade-off analysis, assumptions, scope boundaries |
| `docs` | module summaries, design terminology, structure explanations |
| `security` | high-risk boundary hints, dependency/boundary info, trust boundaries |

## Artifact Contracts

All architect outputs must conform to artifact contracts:

| Artifact | Contract Location |
|----------|-------------------|
| `design-note` | `specs/003-architect-core/contracts/design-note-contract.md` |
| `module-boundaries` | `specs/003-architect-core/contracts/module-boundaries-contract.md` |
| `risks-and-tradeoffs` | `specs/003-architect-core/contracts/risks-and-tradeoffs-contract.md` |
| `open-questions` | `specs/003-architect-core/contracts/open-questions-contract.md` |

## Related Documents

- `specs/003-architect-core/spec.md` - Feature specification
- `specs/003-architect-core/role-scope.md` - Role scope definition
- `specs/003-architect-core/downstream-interfaces.md` - Downstream interfaces
- `role-definition.md` - 6-role definitions
- `package-spec.md` - Package governance

## Legacy Compatibility Note

This skill directory implements the 6-role formal execution model. The legacy 3-skill transition skeleton (`architect-auditor`) remains in `.opencode/skills/architect-auditor/` for bootstrap compatibility. See `specs/003-architect-core/de-legacy-mapping-note.md` for migration guidance.