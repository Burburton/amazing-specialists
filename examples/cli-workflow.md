# CLI Workflow Example

本文档展示 CLI/Local Orchestrator Adapter 的完整工作流程，包括命令行参数解析、Dispatch Payload 生成和验证。

## Overview

CLI/Local Adapter 将命令行参数转换为标准 Dispatch Payload，使本地开发工作流与专家包执行层对接。

---

## Prerequisites

```bash
# 确保在项目根目录
cd amazing-specialists

# 验证 Node.js 环境
node --version  # 需要 Node.js 14+
```

---

## Step 1: Basic Dispatch Command

### Command

```bash
node adapters/cli-local/index.js \
  --project my-app \
  --milestone m1 \
  --task t001 \
  --role developer \
  --command implement-task \
  "Implement auth feature" \
  "Create login/logout endpoints" \
  --risk medium
```

### Expected Output

```json
{
  "dispatch_id": "a1b2c3d4-e5f6-4789-a012-34567890abcd",
  "project_id": "my-app",
  "milestone_id": "m1",
  "task_id": "t001",
  "role": "developer",
  "command": "implement-task",
  "title": "Implement auth feature",
  "goal": "Create login/logout endpoints",
  "description": "Task: Implement auth feature\nGoal: Create login/logout endpoints",
  "context": {
    "project_goal": "",
    "milestone_goal": "",
    "task_scope": "Create login/logout endpoints",
    "related_spec_sections": [],
    "code_context_summary": ""
  },
  "constraints": ["No special constraints"],
  "inputs": [{
    "artifact_id": "cli-input-a1b2c3d4...",
    "artifact_type": "spec",
    "path": "cli-arguments",
    "summary": "CLI command input: implement-task for role developer"
  }],
  "expected_outputs": ["implementation_summary", "code_changes"],
  "verification_steps": ["build", "unit_test", "self_check"],
  "risk_level": "medium",
  "metadata": {
    "source": "cli-local-adapter",
    "created_at": "2026-03-28T10:30:00.000Z",
    "created_by": "cli-user"
  }
}
```

---

## Step 2: Advanced Dispatch with Context

### Command

```bash
node adapters/cli-local/index.js \
  --project my-app \
  --milestone m1 \
  --task t002 \
  --role architect \
  --command design-task \
  "Design API contract" \
  "Define REST endpoints for user management" \
  --context '{"project_goal":"Build SaaS platform","milestone_goal":"User management module","task_scope":"Design REST API","related_spec_sections":["spec.md#auth","spec.md#user"]}' \
  --constraints "No database schema changes" "Maintain backward compatibility" \
  --risk low
```

### Expected Output

```json
{
  "dispatch_id": "uuid-generated",
  "project_id": "my-app",
  "milestone_id": "m1",
  "task_id": "t002",
  "role": "architect",
  "command": "design-task",
  "title": "Design API contract",
  "goal": "Define REST endpoints for user management",
  "description": "Task: Design API contract\nGoal: Define REST endpoints for user management\nScope: Design REST API",
  "context": {
    "project_goal": "Build SaaS platform",
    "milestone_goal": "User management module",
    "task_scope": "Design REST API",
    "related_spec_sections": ["spec.md#auth", "spec.md#user"],
    "code_context_summary": ""
  },
  "constraints": [
    "No database schema changes",
    "Maintain backward compatibility"
  ],
  "inputs": [{
    "artifact_id": "cli-input-...",
    "artifact_type": "spec",
    "path": "cli-arguments",
    "summary": "CLI command input: design-task for role architect"
  }],
  "expected_outputs": ["design_note", "module_boundaries"],
  "verification_steps": ["design_review", "boundary_check"],
  "risk_level": "low",
  "metadata": {
    "source": "cli-local-adapter",
    "created_at": "timestamp",
    "created_by": "cli-user"
  }
}
```

---

## Step 3: Argument Parsing Flow

### Flow Diagram

```
CLI Arguments (process.argv.slice(2))
    │
    ▼
┌─────────────────────────────┐
│     arg-parser.js           │
│   -- Parse flags            │
│   -- Extract positional     │
│   -- Validate enums         │
│   -- Generate UUID          │
└─────────────────────────────┘
    │
    ▼
ParsedArgs Object
    │
    ▼
┌─────────────────────────────┐
│ dispatch-normalizer.js      │
│   -- Build description      │
│   -- Build context          │
│   -- Build inputs           │
│   -- Build expected_outputs │
│   -- Build verification     │
└─────────────────────────────┘
    │
    ▼
Dispatch Payload
    │
    ▼
┌─────────────────────────────┐
│ dispatch-validator.js       │
│   -- Required fields        │
│   -- Type validation        │
│   -- Enum validation        │
│   -- Context validation     │
│   -- Performance check      │
└─────────────────────────────┘
    │
    ▼
ValidationResult
    │
    ▼
Valid Dispatch Payload
```

---

## Step 4: CLI Argument Mapping Table

| CLI Argument | Dispatch Field | Mapping Rule |
|--------------|----------------|--------------|
| `--project <id>` | project_id | Direct mapping |
| `--milestone <id>` | milestone_id | Direct mapping |
| `--task <id>` | task_id | Direct mapping |
| `--role <role>` | role | Direct (validate enum: architect/developer/tester/reviewer/docs/security) |
| `--command <cmd>` | command | Direct mapping |
| `<title>` (positional) | title | First positional argument |
| `<goal>` (remaining) | goal | Remaining positional arguments joined |
| `--context <json>` | context | JSON.parse() |
| `--constraints <items>` | constraints | Array of values until next flag |
| `--risk <level>` | risk_level | Direct (validate enum: low/medium/high/critical) |
| Auto-generated | dispatch_id | UUID v4 |

---

## Step 5: Validation Example

### Valid Role Values

```javascript
// From arg-parser.js
const VALID_ROLES = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];
```

### Valid Risk Level Values

```javascript
// From arg-parser.js
const VALID_RISK_LEVELS = ['low', 'medium', 'high', 'critical'];
```

### Validation Result Example

```javascript
// Successful validation
{
  isValid: true,
  errors: [],
  validation_time_ms: 12  // < 100ms (NFR-004)
}

// Failed validation (missing required field)
{
  isValid: false,
  errors: [
    {
      field: 'milestone_id',
      message: 'Required field \'milestone_id\' is missing',
      severity: 'error'
    }
  ],
  validation_time_ms: 5
}
```

---

## Step 6: Error Handling

### Invalid Role

```bash
node adapters/cli-local/index.js \
  --project my-app \
  --milestone m1 \
  --task t001 \
  --role manager \
  --command implement-task \
  "Test"
```

**Expected Error**:

```
Error: Invalid role 'manager'. Valid roles: architect, developer, tester, reviewer, docs, security
```

### Missing Required Field

```bash
node adapters/cli-local/index.js \
  --project my-app \
  --task t001 \
  --role developer \
  --command implement-task \
  "Test"
```

**Expected Error**:

```
Error: Invalid CLI arguments: Required field 'milestone_id' is missing
```

---

## Step 7: Escalation Handling

When execution cannot proceed, the adapter generates escalation:

```
[ESCALATION] esc-1700000000000
Dispatch ID: a1b2c3d4-e5f6-4789-a012-34567890abcd
Project: my-app
Milestone: m1
Task: t001
Role: developer
Level: USER

Reason: MISSING_CONTEXT

Blocking Points:
  - Missing API specification document
  - No authentication flow diagram

Attempted Actions:
  - Attempted to proceed with assumptions
  - Failed due to ambiguous requirements

Recommended Next Steps:
  1. Provide API spec document
  2. Create auth flow diagram
  3. Clarify authentication requirements

Requires User Decision: true
```

---

## Step 8: Retry Workflow

Interactive retry when execution fails:

```
[RETRY] Execution failed. Retry? (y/n) [Attempt 1/2]
> y

[RETRY] Retrying execution...

[RETRY] Execution failed. Retry? (y/n) [Attempt 2/2]
> n

[RETRY] Max retries reached. Escalating...
```

**Retry Configuration** (from `cli-local.config.json`):

```json
{
  "retry_config": {
    "strategy": "interactive",
    "max_retry": 2,
    "retry_on_error_types": ["validation_error", "execution_error"]
  }
}
```

---

## Step 9: Complete End-to-End Example

### Full Command with All Flags

```bash
node adapters/cli-local/index.js \
  --project amazing-agent \
  --milestone m3 \
  --task t026 \
  --role developer \
  --command implement-task \
  "Create CLI workflow example" \
  "Write documentation showing complete CLI adapter workflow" \
  --context '{"project_goal":"Complete adapter implementation","milestone_goal":"Integration phase","related_spec_sections":["specs/020/spec.md#cli"],"inputs":[{"artifact_id":"spec-020","artifact_type":"spec","path":"specs/020/spec.md"}],"expected_outputs":["cli-workflow.md"]}' \
  --constraints "Must be executable" "Must show all flags" \
  --risk medium
```

### Module Import Example

```javascript
// Import the adapter
const { CliLocalAdapter, argParser, dispatchNormalizer, dispatchValidator } = require('./adapters/cli-local');

// Parse CLI arguments
const args = [
  '--project', 'my-app',
  '--milestone', 'm1',
  '--task', 't001',
  '--role', 'developer',
  '--command', 'implement-task',
  'Implement feature',
  'Create endpoints'
];

const parsed = argParser.parseArgs(args);
console.log('Parsed:', parsed);

// Normalize to Dispatch Payload
const dispatch = dispatchNormalizer.normalize(parsed);
console.log('Dispatch:', JSON.stringify(dispatch, null, 2));

// Validate
const validation = dispatchValidator.validate(dispatch);
console.log('Validation:', validation);

// Use adapter interface
const adapterInfo = CliLocalAdapter.getAdapterInfo();
console.log('Adapter Info:', adapterInfo);
```

---

## Reference

- `adapters/cli-local/README.md` - Adapter documentation
- `ADAPTERS.md` - Architecture definition
- `io-contract.md §1` - Dispatch Payload schema
- `specs/020-orchestrator-and-workspace-adapters/tasks.md` - Task checklist

---

## Verification

To verify this workflow works:

```bash
# Run the test script
node adapters/cli-local/test-cli-workflow.js

# Expected output: All tests pass
```

---

## Key Takeaways

1. **Single Command Entry**: All dispatch fields via single CLI command
2. **Automatic UUID**: dispatch_id auto-generated
3. **Enum Validation**: role and risk_level validated before normalization
4. **Performance**: Validation < 100ms (NFR-004)
5. **Error Transparency**: Clear error messages for invalid inputs
6. **Interactive Retry**: User controls retry decisions