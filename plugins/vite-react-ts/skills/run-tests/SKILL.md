# Skill: run-tests

## Metadata
```yaml
plugin_id: vite-react-ts
plugin_version: 1.0.0
core_compatibility: >=1.0.0
```

## Purpose

Execute Vite + Vitest project tests and parse results, enabling automated test verification in the expert pack workflow.

Core problems solved:
- Tester cannot execute tests automatically
- Test results not captured in structured format
- No integration between Plugin commands and Core skills

## When to Use

Must use when:
- tester role needs to run unit tests (Step 6 of unit-test-design)
- CI/CD verification requires test execution
- Plugin commands need to be invoked from skills

Recommended when:
- Verifying implementation after code changes
- Running regression tests
- Generating test coverage reports

## When Not to Use

Not applicable:
- Projects without Vitest/Jest configured
- Non-Vite projects (use appropriate plugin)
- Integration/E2E tests (use integration-test-design skill)

## Implementation Process

### Step 1: Detect Test Command

Check for test command availability:

```javascript
// Read plugin.json commands config
const commands = require('../../../plugins/vite-react-ts/plugin.json').commands;

if (!commands.test) {
  throw new Error('Test command not configured in plugin.json');
}

const testCmd = commands.test.cmd;     // "npm test"
const testEnv = commands.test.env;     // { CI: "true" }
```

Alternative: Check package.json directly:
```javascript
const pkg = require('./package.json');
const testScript = pkg.scripts?.test;  // "vitest run"
```

### Step 2: Execute Tests

Run test command and capture output:

```bash
# Standard Vitest command
npm test

# Or with CI environment
CI=true npm test

# Or with coverage
npm test -- --coverage
```

**Execution handling**:
- Set timeout appropriately (default: 60000ms)
- Capture stdout and stderr
- Handle process exit codes
- Support for JSON reporter output

### Step 3: Parse Test Results

Parse Vitest/Jest JSON output:

```json
{
  "testResults": [
    {
      "name": "src/__tests__/example.test.ts",
      "status": "passed",
      "assertionResults": [
        {
          "status": "passed",
          "title": "should return correct value"
        }
      ]
    }
  ],
  "success": true,
  "numPassedTests": 5,
  "numFailedTests": 0
}
```

**Extraction**:
- Total tests run
- Passed/Failed count
- Coverage percentage
- Failed test names and errors

### Step 4: Generate Report

Output structured test report:

```yaml
test_report:
  status: success | failure | error
  
  summary:
    total: number
    passed: number
    failed: number
    skipped: number
    duration_ms: number
    
  coverage:
    statements: number
    branches: number
    functions: number
    lines: number
    
  failures:
    - test_file: string
      test_name: string
      error_message: string
      
  command_used: string
  executed_at: timestamp
```

### Step 5: Error Handling

Handle common errors:

| Error | Cause | Resolution |
|-------|-------|------------|
| Command not found | npm/vitest not installed | Install dependencies |
| No tests found | Test files missing | Create test files |
| Timeout | Tests hanging | Increase timeout or fix tests |
| Parse error | Unexpected output format | Check reporter config |

## Output Requirements

After execution, provide:

```yaml
execution_result:
  status: SUCCESS | FAILED | ERROR
  
  test_report:
    summary:
      total: 10
      passed: 10
      failed: 0
    coverage:
      statements: 85
      branches: 72
      functions: 90
      lines: 84
      
  raw_output: |
    (truncated test output)
    
  recommendations:
    - "Add tests for edge cases in X module"
    - "Increase branch coverage in Y file"
```

## Examples

### Example 1: Basic Test Execution

```bash
# Execute tests
$ npm test

> vitest run

 ✓ src/__tests__/utils.test.ts (5)
 ✓ src/__tests__/components/Button.test.tsx (3)

Test Files  2 passed (2)
     Tests  8 passed (8)
  Duration  1.23s
```

**Result**:
```yaml
test_report:
  status: success
  summary:
    total: 8
    passed: 8
    failed: 0
```

### Example 2: Test with Failures

```bash
$ npm test

 ✓ src/__tests__/utils.test.ts (5)
 ✗ src/__tests__/components/Button.test.tsx (3)
   ❯ Button > should render correctly
     AssertionError: expected 'div' to be 'button'

Test Files  1 passed, 1 failed (2)
     Tests  7 passed, 1 failed (8)
```

**Result**:
```yaml
test_report:
  status: failure
  summary:
    total: 8
    passed: 7
    failed: 1
  failures:
    - test_file: src/__tests__/components/Button.test.tsx
      test_name: Button > should render correctly
      error_message: AssertionError: expected 'div' to be 'button'
```

### Example 3: Coverage Report

```bash
$ npm test -- --coverage

 % Coverage report from v8
----------|---------|----------|---------|---------|
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
All files |   85.71 |    72.34 |   90.12 |   84.56 |
 utils.ts |   92.45 |    85.71 |  100.00 |   91.30 |
 Button.tsx|   78.57 |    61.54 |   80.00 |   77.27 |
----------|---------|----------|---------|---------|
```

## Checklists

### Pre-execution
- [ ] Test command available in plugin.json or package.json
- [ ] Test dependencies installed
- [ ] Test files exist

### Execution
- [ ] Command executed successfully
- [ ] Output captured
- [ ] Exit code recorded

### Post-execution
- [ ] Results parsed correctly
- [ ] Report generated
- [ ] Failures documented

## Common Failure Modes

| Failure Mode | Symptoms | Resolution |
|--------------|----------|------------|
| Command timeout | Process hangs | Increase timeout, check for infinite loops |
| No tests run | 0 tests found | Check test file naming (*.test.ts) |
| Import errors | Cannot find module | Check tsconfig paths, install deps |
| Coverage too low | < 80% statements | Add more tests |

## Notes

### Integration with unit-test-design
This skill is called from tester/unit-test-design Step 6:
- Step 6.1: Detect test command (this skill)
- Step 6.2: Execute tests (this skill)
- Step 6.3: Parse results (this skill)
- Step 6.4: Generate report (verification-report)

### JSON Reporter Configuration
For structured output, configure Vitest:

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    reporters: ['default', 'json'],
    outputFile: 'test-results.json'
  }
})
```

### CI Environment
Setting `CI=true`:
- Disables watch mode
- Enables verbose output
- Fails on any test failure