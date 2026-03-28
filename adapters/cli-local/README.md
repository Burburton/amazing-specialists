# CLI/Local Orchestrator Adapter

## Overview

The CLI/Local Orchestrator Adapter converts command-line arguments into standard Dispatch Payloads for the OpenCode Expert Package. It enables local development workflow by parsing CLI flags and positional arguments into structured dispatch data.

## Adapter Type

- **Type**: Orchestrator Adapter
- **Priority**: Must-Have
- **Interface**: `OrchestratorAdapter` (see `adapters/interfaces/orchestrator-adapter.interface.ts`)
- **Status**: Implemented

## Input Format

CLI arguments via `process.argv`:

```bash
node dispatch.js --project <id> --milestone <id> --task <id> --role <role> --command <cmd> [title] [goal...] [--context <json>] [--constraints <items...] [--risk <level>]
```

## Output Format

Standard Dispatch Payload per `io-contract.md §1`:

```json
{
  "dispatch_id": "uuid-v4",
  "project_id": "...",
  "milestone_id": "...",
  "task_id": "...",
  "role": "architect|developer|tester|reviewer|docs|security",
  "command": "...",
  "title": "...",
  "goal": "...",
  "description": "...",
  "context": {...},
  "constraints": [...],
  "inputs": [...],
  "expected_outputs": [...],
  "verification_steps": [...],
  "risk_level": "low|medium|high|critical"
}
```

## CLI Argument Mapping

| CLI Argument | Dispatch Field | Mapping |
|--------------|----------------|---------|
| `--project <id>` | project_id | Direct |
| `--milestone <id>` | milestone_id | Direct |
| `--task <id>` | task_id | Direct |
| `--role <role>` | role | Direct (validate enum) |
| `--command <cmd>` | command | Direct |
| `<title>` (positional) | title | First positional arg |
| `<goal>` (remaining) | goal | Remaining positional args |
| `--context <json>` | context | JSON parse |
| `--constraints <items>` | constraints | Array parse |
| `--risk <level>` | risk_level | Direct (validate enum) |
| Auto-generated | dispatch_id | UUID v4 |

## Escalation Mapping

| Escalation Field | CLI Action |
|------------------|------------|
| escalation_id | Console output (print) |
| reason_type | Console output (print) |
| blocking_points | Console output (list) |
| recommended_next_steps | Console output (list) |
| requires_user_decision | Interactive prompt |

## Retry Strategy

| Property | Value |
|----------|-------|
| Strategy | Interactive |
| Max Retry | 2 |
| Trigger | User decision |

## Usage Examples

### Basic Dispatch

```bash
node dispatch.js --project my-app --milestone m1 --task t001 --role developer --command implement-task "Implement auth feature" "Create login/logout endpoints" --risk medium
```

### With Context and Constraints

```bash
node dispatch.js \
  --project my-app \
  --milestone m1 \
  --task t002 \
  --role architect \
  --command design-task \
  "Design API contract" \
  "Define REST endpoints for user management" \
  --context '{"project_goal":"Build SaaS platform","related_specs":["spec.md#auth"]}' \
  --constraints "No database schema changes" "Maintain backward compatibility" \
  --risk low
```

### Retry Workflow

When execution fails, the retry handler prompts:

```
[RETRY] Execution failed. Retry? (y/n) [Attempt 1/2]
> y
[RETRY] Retrying execution...
```

### Escalation Handling

When escalation is generated:

```
[ESCALATION] escalation-001
Reason: MISSING_CONTEXT
Blocking Points:
  - Missing API specification document
  - No authentication flow diagram
Recommended Next Steps:
  1. Provide API spec document
  2. Create auth flow diagram
Requires Decision: Should we proceed with assumptions or wait for specs?
[y] Proceed with assumptions
[n] Wait for specs
> 
```

## Module Structure

```
adapters/cli-local/
├── README.md              # This document
├── arg-parser.js          # CLI argument parser
├── dispatch-normalizer.js # Converts parsed args to Dispatch Payload
├── dispatch-validator.js  # Validates Dispatch Payload against schema
├── escalation-handler.js  # Handles escalation output to console
├── retry-handler.js       # Interactive retry strategy
├── cli-local.config.json  # Adapter configuration
└── index.js               # Main entry point (optional)
```

## Configuration

See `cli-local.config.json` for adapter configuration including:
- Adapter metadata (type, priority, version)
- Default retry settings
- Escalation channel configuration

## Integration

The CLI/Local adapter integrates with:

1. **Expert Pack Core**: Dispatch Payload is consumed by 6-role execution layer
2. **Local Repo Workspace Adapter**: Execution Result is output to local filesystem
3. **Contract Schema Pack**: Validation uses `contracts/pack/validate-schema.js`

## References

- `ADAPTERS.md` - Adapter architecture definition
- `io-contract.md §1` - Dispatch Payload schema
- `io-contract.md §4` - Escalation schema
- `adapters/interfaces/orchestrator-adapter.interface.ts` - Interface contract
- `adapters/registry.json` - Adapter registry