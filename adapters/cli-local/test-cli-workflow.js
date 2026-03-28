/**
 * test-cli-workflow.js
 * 
 * Validation test script for CLI/Local Orchestrator Adapter.
 * Tests arg-parser.js, dispatch-normalizer.js, dispatch-validator.js
 * and complete CLI workflow end-to-end.
 * 
 * Task: T028
 * Reference: specs/020-orchestrator-and-workspace-adapters/tasks.md
 */

'use strict';

const assert = require('assert');
const argParser = require('./arg-parser');
const dispatchNormalizer = require('./dispatch-normalizer');
const dispatchValidator = require('./dispatch-validator');
const { CliLocalAdapter } = require('./index');

// Test counters
let testsPassed = 0;
let testsFailed = 0;

/**
 * Simple test runner
 */
function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${err.message}`);
    testsFailed++;
  }
}

/**
 * Run all tests
 */
function runTests() {
  console.log('\n=== CLI/Local Adapter Tests ===\n');
  
  // ===== Arg Parser Tests =====
  console.log('--- Arg Parser Tests ---\n');
  
  test('parseArgs: basic arguments', () => {
    const args = [
      '--project', 'my-app',
      '--milestone', 'm1',
      '--task', 't001',
      '--role', 'developer',
      '--command', 'implement-task',
      'Implement auth feature',
      'Create login/logout endpoints',
      '--risk', 'medium'
    ];
    
    const result = argParser.parseArgs(args);
    
    assert.strictEqual(result.project_id, 'my-app');
    assert.strictEqual(result.milestone_id, 'm1');
    assert.strictEqual(result.task_id, 't001');
    assert.strictEqual(result.role, 'developer');
    assert.strictEqual(result.command, 'implement-task');
    assert.strictEqual(result.title, 'Implement auth feature');
    assert.strictEqual(result.goal, 'Create login/logout endpoints');
    assert.strictEqual(result.risk_level, 'medium');
    assert.ok(result.dispatch_id, 'dispatch_id should be generated');
  });
  
  test('parseArgs: with context JSON', () => {
    const args = [
      '--project', 'my-app',
      '--milestone', 'm1',
      '--task', 't002',
      '--role', 'architect',
      '--command', 'design-task',
      'Design API',
      '--context', '{"project_goal":"Build SaaS platform"}',
      '--risk', 'low'
    ];
    
    const result = argParser.parseArgs(args);
    
    assert.deepStrictEqual(result.context, { project_goal: 'Build SaaS platform' });
  });
  
  test('parseArgs: with constraints array', () => {
    const args = [
      '--project', 'my-app',
      '--milestone', 'm1',
      '--task', 't003',
      '--role', 'developer',
      '--command', 'implement-task',
      'Test',
      '--constraints', 'No DB changes', 'Maintain compatibility',
      '--risk', 'low'
    ];
    
    const result = argParser.parseArgs(args);
    
    assert.deepStrictEqual(result.constraints, ['No DB changes', 'Maintain compatibility']);
  });
  
  test('parseArgs: invalid role throws error', () => {
    const args = [
      '--project', 'my-app',
      '--milestone', 'm1',
      '--task', 't001',
      '--role', 'manager',  // Invalid role
      '--command', 'test',
      'Test'
    ];
    
    assert.throws(() => {
      argParser.parseArgs(args);
    }, /Invalid role/);
  });
  
  test('parseArgs: invalid risk level throws error', () => {
    const args = [
      '--project', 'my-app',
      '--milestone', 'm1',
      '--task', 't001',
      '--role', 'developer',
      '--command', 'test',
      'Test',
      '--risk', 'extreme'  // Invalid risk level
    ];
    
    assert.throws(() => {
      argParser.parseArgs(args);
    }, /Invalid risk_level/);
  });
  
  test('parseArgs: missing required value throws error', () => {
    const args = [
      '--project', 'my-app',
      '--milestone', 'm1',
      '--task', 't001',
      '--role',  // Missing value
      '--command', 'test',
      'Test'
    ];
    
    assert.throws(() => {
      argParser.parseArgs(args);
    }, /Missing value/);
  });
  
  test('validateRequiredFields: all fields present', () => {
    const parsed = {
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'developer',
      command: 'implement-task',
      title: 'Test',
      goal: 'Test goal'
    };
    
    const result = argParser.validateRequiredFields(parsed);
    
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.length, 0);
  });
  
  test('validateRequiredFields: missing field detected', () => {
    const parsed = {
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'developer',
      command: 'implement-task',
      title: 'Test'
      // goal missing
    };
    
    const result = argParser.validateRequiredFields(parsed);
    
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.field === 'goal'));
  });
  
  // ===== Dispatch Normalizer Tests =====
  console.log('\n--- Dispatch Normalizer Tests ---\n');
  
  test('normalize: produces valid Dispatch Payload', () => {
    const parsedArgs = {
      dispatch_id: 'test-uuid',
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'developer',
      command: 'implement-task',
      title: 'Implement feature',
      goal: 'Create endpoints',
      context: {},
      constraints: [],
      risk_level: 'medium'
    };
    
    const dispatch = dispatchNormalizer.normalize(parsedArgs);
    
    assert.strictEqual(dispatch.dispatch_id, 'test-uuid');
    assert.strictEqual(dispatch.project_id, 'my-app');
    assert.strictEqual(dispatch.role, 'developer');
    assert.ok(dispatch.description);
    assert.ok(dispatch.context);
    assert.ok(Array.isArray(dispatch.inputs));
    assert.ok(Array.isArray(dispatch.expected_outputs));
    assert.ok(Array.isArray(dispatch.verification_steps));
    assert.ok(dispatch.metadata);
  });
  
  test('normalize: developer role gets correct defaults', () => {
    const parsedArgs = {
      dispatch_id: 'test-uuid',
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'developer',
      command: 'implement-task',
      title: 'Test',
      goal: 'Test goal',
      context: {},
      constraints: [],
      risk_level: 'medium'
    };
    
    const dispatch = dispatchNormalizer.normalize(parsedArgs);
    
    assert.deepStrictEqual(dispatch.expected_outputs, ['implementation_summary', 'code_changes']);
    assert.deepStrictEqual(dispatch.verification_steps, ['build', 'unit_test', 'self_check']);
  });
  
  test('normalize: architect role gets correct defaults', () => {
    const parsedArgs = {
      dispatch_id: 'test-uuid',
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'architect',
      command: 'design-task',
      title: 'Test',
      goal: 'Test goal',
      context: {},
      constraints: [],
      risk_level: 'low'
    };
    
    const dispatch = dispatchNormalizer.normalize(parsedArgs);
    
    assert.deepStrictEqual(dispatch.expected_outputs, ['design_note', 'module_boundaries']);
    assert.deepStrictEqual(dispatch.verification_steps, ['design_review', 'boundary_check']);
  });
  
  test('normalize: context.task_scope defaults to goal', () => {
    const parsedArgs = {
      dispatch_id: 'test-uuid',
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'developer',
      command: 'test',
      title: 'Test',
      goal: 'My custom goal',
      context: {},
      constraints: [],
      risk_level: 'medium'
    };
    
    const dispatch = dispatchNormalizer.normalize(parsedArgs);
    
    assert.strictEqual(dispatch.context.task_scope, 'My custom goal');
  });
  
  // ===== Dispatch Validator Tests =====
  console.log('\n--- Dispatch Validator Tests ---\n');
  
  test('validate: valid dispatch passes', () => {
    const dispatch = {
      dispatch_id: 'test-uuid',
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'developer',
      command: 'implement-task',
      title: 'Test',
      goal: 'Test goal',
      description: 'Test description',
      context: { task_scope: 'Test' },
      constraints: [],
      inputs: [{ artifact_id: 'test', artifact_type: 'spec', path: 'test.md' }],
      expected_outputs: ['result'],
      verification_steps: ['test'],
      risk_level: 'medium'
    };
    
    const result = dispatchValidator.validate(dispatch);
    
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.filter(e => e.severity === 'error').length, 0);
  });
  
  test('validate: missing required field detected', () => {
    const dispatch = {
      dispatch_id: 'test-uuid',
      project_id: 'my-app',
      // milestone_id missing
      task_id: 't001',
      role: 'developer',
      command: 'test',
      title: 'Test',
      goal: 'Test',
      description: 'Test',
      context: { task_scope: 'Test' },
      constraints: [],
      inputs: [{ artifact_id: 'test', artifact_type: 'spec', path: 'test.md' }],
      expected_outputs: ['result'],
      verification_steps: ['test'],
      risk_level: 'medium'
    };
    
    const result = dispatchValidator.validate(dispatch);
    
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.field === 'milestone_id'));
  });
  
  test('validate: invalid role detected', () => {
    const dispatch = {
      dispatch_id: 'test-uuid',
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'manager',  // Invalid
      command: 'test',
      title: 'Test',
      goal: 'Test',
      description: 'Test',
      context: { task_scope: 'Test' },
      constraints: [],
      inputs: [{ artifact_id: 'test', artifact_type: 'spec', path: 'test.md' }],
      expected_outputs: ['result'],
      verification_steps: ['test'],
      risk_level: 'medium'
    };
    
    const result = dispatchValidator.validate(dispatch);
    
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.field === 'role'));
  });
  
  test('validate: missing context.task_scope detected', () => {
    const dispatch = {
      dispatch_id: 'test-uuid',
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'developer',
      command: 'test',
      title: 'Test',
      goal: 'Test',
      description: 'Test',
      context: {},  // task_scope missing
      constraints: [],
      inputs: [{ artifact_id: 'test', artifact_type: 'spec', path: 'test.md' }],
      expected_outputs: ['result'],
      verification_steps: ['test'],
      risk_level: 'medium'
    };
    
    const result = dispatchValidator.validate(dispatch);
    
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.field === 'context.task_scope'));
  });
  
  test('validate: performance check < 100ms', () => {
    const dispatch = {
      dispatch_id: 'test-uuid',
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'developer',
      command: 'test',
      title: 'Test',
      goal: 'Test',
      description: 'Test',
      context: { task_scope: 'Test' },
      constraints: [],
      inputs: [{ artifact_id: 'test', artifact_type: 'spec', path: 'test.md' }],
      expected_outputs: ['result'],
      verification_steps: ['test'],
      risk_level: 'medium'
    };
    
    const result = dispatchValidator.validate(dispatch);
    
    assert.ok(result.validation_time_ms < 100, `Validation took ${result.validation_time_ms}ms, should be < 100ms`);
  });
  
  test('validate: retry_count exceeds max for high risk', () => {
    const dispatch = {
      dispatch_id: 'test-uuid',
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'developer',
      command: 'test',
      title: 'Test',
      goal: 'Test',
      description: 'Test',
      context: { task_scope: 'Test' },
      constraints: [],
      inputs: [{ artifact_id: 'test', artifact_type: 'spec', path: 'test.md' }],
      expected_outputs: ['result'],
      verification_steps: ['test'],
      risk_level: 'high',
      retry_context: {
        retry_count: 2  // Exceeds max 1 for high risk
      }
    };
    
    const result = dispatchValidator.validate(dispatch);
    
    assert.ok(result.errors.some(e => e.field === 'retry_context.retry_count'));
  });
  
  // ===== Adapter Interface Tests =====
  console.log('\n--- Adapter Interface Tests ---\n');
  
  test('getAdapterInfo: returns correct info', () => {
    const info = CliLocalAdapter.getAdapterInfo();
    
    assert.strictEqual(info.adapter_id, 'cli-local');
    assert.strictEqual(info.adapter_type, 'orchestrator');
    assert.strictEqual(info.status, 'implemented');
  });
  
  test('normalizeInput: converts CLI args to Dispatch Payload', () => {
    const args = [
      '--project', 'my-app',
      '--milestone', 'm1',
      '--task', 't001',
      '--role', 'developer',
      '--command', 'implement-task',
      'Implement feature',
      'Create endpoints',
      '--risk', 'medium'
    ];
    
    const dispatch = CliLocalAdapter.normalizeInput(args);
    
    assert.strictEqual(dispatch.project_id, 'my-app');
    assert.strictEqual(dispatch.role, 'developer');
    assert.ok(dispatch.dispatch_id);
  });
  
  test('validateDispatch: returns validation result', () => {
    const dispatch = {
      dispatch_id: 'test-uuid',
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'developer',
      command: 'test',
      title: 'Test',
      goal: 'Test',
      description: 'Test',
      context: { task_scope: 'Test' },
      constraints: [],
      inputs: [{ artifact_id: 'test', artifact_type: 'spec', path: 'test.md' }],
      expected_outputs: ['result'],
      verification_steps: ['test'],
      risk_level: 'medium'
    };
    
    const result = CliLocalAdapter.validateDispatch(dispatch);
    
    assert.ok(result.isValid !== undefined);
    assert.ok(Array.isArray(result.errors));
  });
  
  test('routeToExecution: returns routing info', () => {
    const dispatch = {
      dispatch_id: 'test-uuid',
      project_id: 'my-app',
      milestone_id: 'm1',
      task_id: 't001',
      role: 'developer',
      command: 'implement-task'
    };
    
    const routing = CliLocalAdapter.routeToExecution(dispatch);
    
    assert.strictEqual(routing.routed, true);
    assert.strictEqual(routing.role, 'developer');
    assert.strictEqual(routing.command, 'implement-task');
  });
  
  test('mapError: maps error types to status', () => {
    assert.strictEqual(CliLocalAdapter.mapError(new Error('Missing required field')), 'BLOCKED');
    assert.strictEqual(CliLocalAdapter.mapError(new Error('Invalid value')), 'BLOCKED');
    assert.strictEqual(CliLocalAdapter.mapError(new Error('Network timeout')), 'FAILED_RETRYABLE');
    assert.strictEqual(CliLocalAdapter.mapError(new Error('Permission denied')), 'FAILED_ESCALATE');
    assert.strictEqual(CliLocalAdapter.mapError(new Error('Fatal error')), 'FAILED_ESCALATE');
  });
  
  test('generateEscalation: creates valid escalation object', () => {
    const context = {
      dispatch: {
        dispatch_id: 'test-uuid',
        project_id: 'my-app',
        milestone_id: 'm1',
        task_id: 't001',
        role: 'developer'
      },
      reason_type: 'MISSING_CONTEXT',
      blocking_points: ['Missing spec document'],
      attempted_actions: ['Tried to proceed with assumptions'],
      recommended_next_steps: ['Provide spec document']
    };
    
    const escalation = CliLocalAdapter.generateEscalation(context);
    
    assert.ok(escalation.escalation_id);
    assert.strictEqual(escalation.dispatch_id, 'test-uuid');
    assert.strictEqual(escalation.reason_type, 'MISSING_CONTEXT');
    assert.strictEqual(escalation.requires_user_decision, true);
  });
  
  // ===== End-to-End Tests =====
  console.log('\n--- End-to-End Tests ---\n');
  
  test('E2E: complete CLI workflow', () => {
    // 1. Parse args
    const args = [
      '--project', 'my-app',
      '--milestone', 'm1',
      '--task', 't001',
      '--role', 'developer',
      '--command', 'implement-task',
      'Implement auth feature',
      'Create login/logout endpoints',
      '--context', '{"project_goal":"Build SaaS platform"}',
      '--constraints', 'No DB changes',
      '--risk', 'medium'
    ];
    
    const parsed = argParser.parseArgs(args);
    
    // 2. Validate required fields
    const fieldValidation = argParser.validateRequiredFields(parsed);
    assert.strictEqual(fieldValidation.isValid, true);
    
    // 3. Normalize to Dispatch Payload
    const dispatch = dispatchNormalizer.normalize(parsed);
    
    // 4. Validate Dispatch Payload
    const validation = dispatchValidator.validate(dispatch);
    
    assert.strictEqual(validation.isValid, true, `Validation failed: ${JSON.stringify(validation.errors)}`);
    assert.ok(validation.validation_time_ms < 100);
    
    // 5. Verify dispatch content
    assert.strictEqual(dispatch.project_id, 'my-app');
    assert.strictEqual(dispatch.role, 'developer');
    assert.strictEqual(dispatch.constraints[0], 'No DB changes');
    assert.strictEqual(dispatch.context.project_goal, 'Build SaaS platform');
  });
  
  // ===== Summary =====
  console.log('\n=== Test Summary ===\n');
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);
  
  if (testsFailed > 0) {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed');
    process.exit(0);
  }
}

// Run tests
runTests();