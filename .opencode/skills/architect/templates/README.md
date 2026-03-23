# Architect Templates Index

This directory contains shared templates for architect artifacts.

## Available Templates

| Template | Purpose | Location |
|----------|---------|----------|
| `design-note-template.md` | Design note artifact template | `requirement-to-design/templates/` |
| `module-boundaries-template.md` | Module boundaries artifact template | `module-boundary-design/templates/` |
| `risks-and-tradeoffs-template.md` | Risks and tradeoffs artifact template | `tradeoff-analysis/templates/` |

## Usage

1. Copy the appropriate template to your feature directory
2. Fill in all required fields (marked with [placeholders])
3. Validate against the artifact contract
4. Remove placeholder text before finalizing

## Template Structure

Each template follows its artifact contract:

- **AC-001**: `design-note` - 9 required fields
- **AC-002**: `module-boundaries` - 7 required fields
- **AC-003**: `risks-and-tradeoffs` - 7 required fields
- **AC-004**: `open-questions` - 5 required fields

## Artifact Contracts

All templates conform to contracts in:
- `specs/003-architect-core/contracts/design-note-contract.md`
- `specs/003-architect-core/contracts/module-boundaries-contract.md`
- `specs/003-architect-core/contracts/risks-and-tradeoffs-contract.md`
- `specs/003-architect-core/contracts/open-questions-contract.md`

## Creating New Templates

When creating a new template:

1. Start from the artifact contract
2. Include all required fields
3. Provide placeholder examples
4. Include version history section
5. Add validation guidance