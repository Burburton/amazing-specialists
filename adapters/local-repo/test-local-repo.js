/**
 * test-local-repo.js
 * 
 * Validation test script for Local Repo Workspace Adapter.
 * Tests artifact-handler.js, changed-files-handler.js, console-reporter.js
 * and complete Local Repo workflow end-to-end.
 * 
 * Task: T029
 * Reference: specs/020-orchestrator-and-workspace-adapters/tasks.md
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const artifactHandler = require('./artifact-handler');
const changedFilesHandler = require('./changed-files-handler');
const consoleReporter = require('./console-reporter');
const escalationOutputHandler = require('./escalation-output-handler');
const pathValidator = require('./path-validator');
const LocalRepoAdapter = require('./index');

// Test counters
let testsPassed = 0;
let testsFailed = 0;

// Test output directory
const TEST_OUTPUT_DIR = './test-output';

/**
 * Setup test environment
 */
function setupTestEnv() {
  // Clean up any existing test output
  if (fs.existsSync(TEST_OUTPUT_DIR)) {
    fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  }
  
  // Create fresh test output directory
  fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(TEST_OUTPUT_DIR, 'artifacts'), { recursive: true });
}

/**
 * Cleanup test environment
 */
function cleanupTestEnv() {
  if (fs.existsSync(TEST_OUTPUT_DIR)) {
    fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  }
}

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
  console.log('\n=== Local Repo Adapter Tests ===\n');
  
  setupTestEnv();
  
  try {
    // ===== Artifact Handler Tests =====
    console.log('--- Artifact Handler Tests ---\n');
    
    test('handleArtifacts: writes artifacts to filesystem', () => {
      const artifacts = [
        {
          artifact_id: 'impl-001',
          artifact_type: 'implementation_summary',
          title: 'Implementation Summary',
          format: 'markdown',
          path: 'developer/impl-001.md',
          content: '# Implementation Summary\n\nTest content',
          summary: 'Test summary',
          created_by_role: 'developer',
          related_task_id: 't001'
        }
      ];
      
      const result = artifactHandler.handleArtifacts(artifacts, {
        basePath: path.join(TEST_OUTPUT_DIR, 'artifacts'),
        validatePaths: false,
        createDirectories: true
      });
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.artifacts_written.length, 1);
      assert.strictEqual(result.errors.length, 0);
    });
    
    test('handleArtifacts: creates directories if needed', () => {
      const artifacts = [
        {
          artifact_id: 'test-001',
          artifact_type: 'test_report',
          title: 'Test Report',
          format: 'markdown',
          path: 'tester/nested/deep/test-001.md',
          content: '# Test Report',
          summary: 'Test',
          created_by_role: 'tester',
          related_task_id: 't001'
        }
      ];
      
      const result = artifactHandler.handleArtifacts(artifacts, {
        basePath: path.join(TEST_OUTPUT_DIR, 'artifacts'),
        validatePaths: false,
        createDirectories: true
      });
      
      assert.strictEqual(result.success, true);
      assert.ok(fs.existsSync(path.join(TEST_OUTPUT_DIR, 'artifacts/tester/nested/deep')));
    });
    
    test('handleArtifacts: handles empty artifacts array', () => {
      const result = artifactHandler.handleArtifacts([], {
        basePath: TEST_OUTPUT_DIR
      });
      
      assert.strictEqual(result.success, true);
      assert.ok(result.warnings.some(w => w.includes('No artifacts')));
    });
    
    test('validateArtifactOutput: validates required fields', () => {
      const validArtifacts = [
        {
          artifact_id: 'test-001',
          artifact_type: 'implementation_summary',
          title: 'Test',
          format: 'markdown',
          created_by_role: 'developer'
        }
      ];
      
      const result = artifactHandler.validateArtifactOutput(validArtifacts);
      
      assert.strictEqual(result.isValid, true);
    });
    
    test('validateArtifactOutput: detects missing required fields', () => {
      const invalidArtifacts = [
        {
          artifact_id: 'test-001',
          // artifact_type missing
          title: 'Test',
          format: 'markdown',
          created_by_role: 'developer'
        }
      ];
      
      const result = artifactHandler.validateArtifactOutput(invalidArtifacts);
      
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some(e => e.field === 'artifacts[].artifact_type'));
    });
    
    test('validateArtifactOutput: validates artifact_type enum', () => {
      const invalidArtifacts = [
        {
          artifact_id: 'test-001',
          artifact_type: 'invalid_type',  // Invalid
          title: 'Test',
          format: 'markdown',
          created_by_role: 'developer'
        }
      ];
      
      const result = artifactHandler.validateArtifactOutput(invalidArtifacts);
      
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some(e => e.message.includes('Invalid artifact_type')));
    });
    
    // ===== Changed Files Handler Tests =====
    console.log('\n--- Changed Files Handler Tests ---\n');
    
    test('handleChangedFiles: creates added files', () => {
      const changedFiles = [
        {
          path: path.join(TEST_OUTPUT_DIR, 'new-file.ts'),
          change_type: 'added',
          content: '// New file content'
        }
      ];
      
      const result = changedFilesHandler.handleChangedFiles(changedFiles, {
        basePath: '.',
        validatePaths: false,
        createDirectories: true
      });
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.files_changed.length, 1);
      assert.ok(fs.existsSync(changedFiles[0].path));
    });
    
    test('handleChangedFiles: modifies existing files', () => {
      // Create a file to modify
      const filePath = path.join(TEST_OUTPUT_DIR, 'modify-me.ts');
      fs.writeFileSync(filePath, '// Original content', 'utf8');
      
      const changedFiles = [
        {
          path: filePath,
          change_type: 'modified',
          content: '// Modified content'
        }
      ];
      
      const result = changedFilesHandler.handleChangedFiles(changedFiles, {
        basePath: '.',
        validatePaths: false,
        backupOnModify: true
      });
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.files_changed.length, 1);
      assert.strictEqual(fs.readFileSync(filePath, 'utf8'), '// Modified content');
    });
    
    test('handleChangedFiles: deletes files', () => {
      // Create a file to delete
      const filePath = path.join(TEST_OUTPUT_DIR, 'delete-me.ts');
      fs.writeFileSync(filePath, '// Delete me', 'utf8');
      
      const changedFiles = [
        {
          path: filePath,
          change_type: 'deleted'
        }
      ];
      
      const result = changedFilesHandler.handleChangedFiles(changedFiles, {
        basePath: '.',
        validatePaths: false
      });
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.files_changed.length, 1);
      assert.ok(!fs.existsSync(filePath));
    });
    
    test('handleChangedFiles: handles empty changed files array', () => {
      const result = changedFilesHandler.handleChangedFiles([], {
        basePath: TEST_OUTPUT_DIR
      });
      
      assert.strictEqual(result.success, true);
      assert.ok(result.warnings.some(w => w.includes('No changed files')));
    });
    
    test('handleChangedFiles: handles unknown change_type', () => {
      const changedFiles = [
        {
          path: path.join(TEST_OUTPUT_DIR, 'unknown.txt'),
          change_type: 'unknown_type'
        }
      ];
      
      const result = changedFilesHandler.handleChangedFiles(changedFiles, {
        basePath: '.',
        validatePaths: false
      });
      
      assert.ok(result.errors.some(e => e.includes('Unknown change_type')));
    });
    
    // ===== Path Validator Tests =====
    console.log('\n--- Path Validator Tests ---\n');
    
    test('validatePaths: validates existing writable paths', () => {
      const paths = [
        TEST_OUTPUT_DIR,
        path.join(TEST_OUTPUT_DIR, 'artifacts')
      ];
      
      const result = pathValidator.validatePaths(paths);
      
      assert.ok(result.every(r => r.errors.length === 0));
    });
    
    test('validatePaths: detects non-existent paths with parent check', () => {
      const paths = [
        '/nonexistent/path/to/file.txt'
      ];
      
      const result = pathValidator.validatePaths(paths, {
        checkParentExists: true
      });
      
      // Should have errors for non-existent parent
      assert.ok(result.some(r => r.errors.length > 0 || r.warnings.length > 0));
    });
    
    test('validatePath: returns validation result for single path', () => {
      const result = pathValidator.validatePath(TEST_OUTPUT_DIR);
      
      assert.ok(result.path === TEST_OUTPUT_DIR);
      assert.ok(Array.isArray(result.errors));
    });
    
    // ===== Console Reporter Tests =====
    console.log('\n--- Console Reporter Tests ---\n');
    
    test('reportExecutionResult: does not throw', () => {
      const executionResult = {
        dispatch_id: 'test-uuid',
        role: 'developer',
        command: 'implement-task',
        status: 'SUCCESS',
        summary: 'Test summary',
        artifacts: [
          {
            artifact_id: 'test-001',
            artifact_type: 'implementation_summary',
            title: 'Test Artifact',
            path: 'test.md'
          }
        ],
        changed_files: [
          {
            path: 'src/test.ts',
            change_type: 'added'
          }
        ],
        issues_found: [],
        recommendation: 'CONTINUE'
      };
      
      // Should not throw
      assert.doesNotThrow(() => {
        consoleReporter.reportExecutionResult(executionResult, { colorize: false });
      });
    });
    
    test('printStatus: formats status correctly', () => {
      // Should not throw for various status values
      const statuses = ['SUCCESS', 'SUCCESS_WITH_WARNINGS', 'PARTIAL', 'BLOCKED', 'FAILED_RETRYABLE', 'FAILED_ESCALATE'];
      
      for (const status of statuses) {
        assert.doesNotThrow(() => {
          consoleReporter.printStatus(status, { colorize: false });
        });
      }
    });
    
    test('printArtifacts: handles empty artifacts', () => {
      assert.doesNotThrow(() => {
        consoleReporter.printArtifacts([], { colorize: false });
      });
    });
    
    test('printChangedFiles: formats change types correctly', () => {
      const changedFiles = [
        { path: 'a.ts', change_type: 'added' },
        { path: 'b.ts', change_type: 'modified' },
        { path: 'c.ts', change_type: 'deleted' },
        { path: 'd.ts', change_type: 'renamed' }
      ];
      
      assert.doesNotThrow(() => {
        consoleReporter.printChangedFiles(changedFiles, { colorize: false });
      });
    });
    
    test('printRecommendation: formats all recommendation types', () => {
      const recommendations = ['CONTINUE', 'SEND_TO_TEST', 'SEND_TO_REVIEW', 'REWORK', 'REPLAN', 'ESCALATE'];
      
      for (const rec of recommendations) {
        assert.doesNotThrow(() => {
          consoleReporter.printRecommendation(rec, { colorize: false });
        });
      }
    });
    
    test('reportBriefStatus: provides brief status output', () => {
      const executionResult = {
        status: 'SUCCESS',
        summary: 'Task completed successfully'
      };
      
      assert.doesNotThrow(() => {
        consoleReporter.reportBriefStatus(executionResult);
      });
    });
    
    // ===== Escalation Output Handler Tests =====
    console.log('\n--- Escalation Output Handler Tests ---\n');
    
    test('handleEscalationOutput: does not throw', () => {
      const escalation = {
        escalation_id: 'esc-001',
        dispatch_id: 'dispatch-001',
        project_id: 'my-app',
        milestone_id: 'm1',
        task_id: 't001',
        role: 'developer',
        level: 'USER',
        reason_type: 'MISSING_CONTEXT',
        summary: 'Missing context information',
        blocking_points: ['Missing spec document'],
        attempted_actions: ['Tried to proceed'],
        recommended_next_steps: ['Provide spec'],
        requires_user_decision: true
      };
      
      assert.doesNotThrow(() => {
        escalationOutputHandler.handleEscalationOutput(escalation, { interactive: false });
      });
    });
    
    // ===== Adapter Interface Tests =====
    console.log('\n--- Adapter Interface Tests ---\n');
    
    test('create: creates adapter instance', () => {
      const adapter = LocalRepoAdapter.create();
      
      assert.ok(adapter.handleArtifacts);
      assert.ok(adapter.handleChangedFiles);
      assert.ok(adapter.handleEscalation);
      assert.ok(adapter.validatePaths);
      assert.ok(adapter.getOutputSummary);
      assert.ok(adapter.getAdapterInfo);
    });
    
    test('getAdapterInfo: returns correct info', () => {
      const adapter = LocalRepoAdapter.create();
      const info = adapter.getAdapterInfo();
      
      assert.strictEqual(info.adapter_id, 'local-repo');
      assert.strictEqual(info.adapter_type, 'workspace');
      assert.strictEqual(info.workspace_type, 'local_repo');
    });
    
    test('handleArtifacts: adapter method works', () => {
      const adapter = LocalRepoAdapter.create({
        output_config: {
          artifact_path: path.join(TEST_OUTPUT_DIR, 'artifacts')
        },
        validation_config: {
          validate_paths: false
        }
      });
      
      const result = {
        artifacts: [
          {
            artifact_id: 'adapter-test-001',
            artifact_type: 'implementation_summary',
            title: 'Adapter Test',
            format: 'markdown',
            path: 'developer/adapter-test.md',
            content: '# Adapter Test',
            summary: 'Test',
            created_by_role: 'developer',
            related_task_id: 't001'
          }
        ]
      };
      
      const output = adapter.handleArtifacts(result);
      
      assert.ok(output.success !== undefined);
    });
    
    test('handleChangedFiles: adapter method works', () => {
      const adapter = LocalRepoAdapter.create({
        output_config: {
          changed_files_path: TEST_OUTPUT_DIR
        },
        validation_config: {
          validate_paths: false
        }
      });
      
      const result = {
        changed_files: [
          {
            path: 'adapter-new-file.ts',
            change_type: 'added',
            content: '// New file'
          }
        ]
      };
      
      const output = adapter.handleChangedFiles(result);
      
      assert.ok(output.success !== undefined);
    });
    
    test('getOutputSummary: returns summary after operations', () => {
      const adapter = LocalRepoAdapter.create({
        output_config: {
          artifact_path: path.join(TEST_OUTPUT_DIR, 'artifacts'),
          console_output: false
        },
        validation_config: {
          validate_paths: false
        }
      });
      
      adapter.handleArtifacts({
        artifacts: [
          {
            artifact_id: 'summary-test',
            artifact_type: 'implementation_summary',
            title: 'Summary Test',
            format: 'markdown',
            path: 'test.md',
            content: 'Test',
            summary: 'Test',
            created_by_role: 'developer',
            related_task_id: 't001'
          }
        ]
      });
      
      const summary = adapter.getOutputSummary();
      
      assert.ok(summary.success !== undefined);
      assert.ok(Array.isArray(summary.artifacts_written));
      assert.ok(Array.isArray(summary.errors));
    });
    
    // ===== End-to-End Tests =====
    console.log('\n--- End-to-End Tests ---\n');
    
    test('E2E: complete Local Repo workflow', () => {
      const testDir = path.resolve(TEST_OUTPUT_DIR);
      
      const adapter = LocalRepoAdapter.create({
        output_config: {
          artifact_path: path.join(testDir, 'artifacts'),
          changed_files_path: testDir,
          console_output: false
        },
        validation_config: {
          validate_paths: false
        }
      });
      
      const newFilePath = path.join(testDir, 'e2e-new.ts');
      
      const executionResult = {
        dispatch_id: 'e2e-test-uuid',
        project_id: 'my-app',
        milestone_id: 'm1',
        task_id: 't001',
        role: 'developer',
        command: 'implement-task',
        status: 'SUCCESS',
        summary: 'E2E test completed successfully',
        artifacts: [
          {
            artifact_id: 'e2e-impl',
            artifact_type: 'implementation_summary',
            title: 'E2E Implementation',
            format: 'markdown',
            path: 'developer/e2e-impl.md',
            content: '# E2E Implementation Summary\n\nAll tests pass.',
            summary: 'E2E test artifact',
            created_by_role: 'developer',
            related_task_id: 't001'
          }
        ],
        changed_files: [
          {
            path: newFilePath,
            change_type: 'added',
            content: '// E2E new file'
          }
        ],
        issues_found: [],
        recommendation: 'SEND_TO_TEST'
      };
      
      // 1. Handle artifacts
      const artifactResult = adapter.handleArtifacts(executionResult);
      assert.strictEqual(artifactResult.success, true);
      
      // 2. Handle changed files
      const filesResult = adapter.handleChangedFiles(executionResult);
      assert.strictEqual(filesResult.success, true);
      
      // 3. Get summary
      const summary = adapter.getOutputSummary();
      assert.strictEqual(summary.success, true);
      assert.ok(summary.artifacts_written.length > 0);
      assert.ok(summary.files_changed.length > 0);
      
      // 4. Verify files exist
      const artifactPath = path.join(testDir, 'artifacts/developer/e2e-impl.md');
      assert.ok(fs.existsSync(artifactPath), `Artifact file should exist at ${artifactPath}`);
      
      assert.ok(fs.existsSync(newFilePath), `Changed file should exist at ${newFilePath}`);
    });
    
    test('E2E: validate artifact output', () => {
      const artifacts = [
        {
          artifact_id: 'valid-001',
          artifact_type: 'implementation_summary',
          title: 'Valid Artifact',
          format: 'markdown',
          created_by_role: 'developer'
        }
      ];
      
      const adapter = LocalRepoAdapter.create();
      const validation = adapter.validateArtifactOutput(artifacts);
      
      assert.strictEqual(validation.isValid, true);
    });
    
  } finally {
    cleanupTestEnv();
  }
  
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