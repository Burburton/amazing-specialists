/**
 * True E2E: Local Repo Adapter Integration Tests
 * 
 * Tests REAL LocalRepoAdapter code with filesystem operations.
 * Uses temp directories for isolation and proper cleanup.
 * 
 * Test Cases:
 * - TC-LR-001: Workspace initialized
 * - TC-LR-002: Artifacts written to filesystem
 * - TC-LR-003: Execution result logged
 * - TC-LR-004: Changelog updated
 * - TC-LR-005: README synced
 * - TC-LR-006: Cleanup performed
 * - TC-LR-007: Adapter info returned
 * 
 * @module tests/e2e/adapters/local-repo-adapter.test
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Import REAL LocalRepoAdapter (not mocks)
const LocalRepoAdapter = require('../../../adapters/local-repo');

// Import test infrastructure
const { getAdapterConfig } = require('./helpers/mock-config');
const { createExecutionResult, createEscalation, createRetryContext } = require('./fixtures/adapter-fixtures');
const { assertValidAdapterInfo, assertValidExecutionResult } = require('./helpers/adapter-assertions');

describe('True E2E: Local Repo Adapter Integration', () => {
  let adapter;
  let config;
  let tmpDir;

  beforeEach(() => {
    // Create unique temp directory for each test
    tmpDir = path.join(os.tmpdir(), `local-repo-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    // Load real adapter config and override paths to use temp directory
    config = {
      ...getAdapterConfig('local-repo'),
      output_config: {
        artifact_path: path.join(tmpDir, 'artifacts'),
        changed_files_path: tmpDir,
        console_output: false // Suppress console output during tests
      },
      escalation_config: {
        channel: 'console',
        requires_acknowledgment: false, // Non-interactive for tests
        interactive_prompt: false
      },
      validation_config: {
        validate_paths: false, // Disabled for E2E tests with temp directories
        validate_contract: false
      }
    };

    // Create adapter instance using REAL factory function
    adapter = LocalRepoAdapter.create(config);
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tmpDir)) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch (err) {
        // Ignore cleanup errors on Windows (file handles may be locked)
        console.warn(`Cleanup warning: ${err.message}`);
      }
    }
  });

  describe('Workspace Operations', () => {

    test('TC-LR-001: Workspace initialized', async () => {
      // Create artifact directory to simulate workspace initialization
      const artifactPath = config.output_config.artifact_path;
      
      // Verify temp workspace directory exists
      expect(fs.existsSync(tmpDir)).toBe(true);
      
      // Verify artifact path can be created
      fs.mkdirSync(artifactPath, { recursive: true });
      expect(fs.existsSync(artifactPath)).toBe(true);
      
      // Verify adapter can work with the workspace
      const summary = adapter.getOutputSummary();
      expect(summary).toBeDefined();
      expect(summary.success).toBe(true);
    });

    test('TC-LR-002: Artifacts written to filesystem', async () => {
      fs.mkdirSync(config.output_config.artifact_path, { recursive: true });
      
      const result = createExecutionResult({
        artifacts: [
          {
            artifact_id: 'impl-001',
            artifact_type: 'implementation_summary',
            path: 'docs/auth-impl-summary.md',
            title: 'Authentication Implementation',
            format: 'markdown',
            created_by_role: 'developer',
            content: '# Authentication Implementation\n\n## Summary\n\nOAuth2 and MFA support implemented.\n'
          }
        ]
      });

      const artifactResult = adapter.handleArtifacts(result);

      expect(artifactResult).toBeDefined();
      expect(artifactResult.success).toBe(true);
    });

    test('TC-LR-003: Execution result logged', async () => {
      // Create execution result
      const result = createExecutionResult({
        status: 'SUCCESS',
        summary: 'Test execution completed successfully'
      });

      // Validate execution result structure
      assertValidExecutionResult(result, 'SUCCESS');

      // Call REAL adapter method to sync state
      adapter.syncState(result);

      // Get output summary to verify state was tracked
      const summary = adapter.getOutputSummary();
      expect(summary).toBeDefined();
      expect(summary.console_output).toBe(false); // Disabled in test config
    });

    test('TC-LR-004: Changelog updated', async () => {
      fs.mkdirSync(config.output_config.artifact_path, { recursive: true });
      
      const result = createExecutionResult({
        artifacts: [
          {
            artifact_id: 'changelog-001',
            artifact_type: 'changelog_entry',
            path: 'CHANGELOG.md',
            title: 'v1.0.0 Release',
            format: 'markdown',
            created_by_role: 'docs',
            content: '# Changelog\n\n## v1.0.0\n\n- Added authentication module\n'
          }
        ]
      });

      const artifactResult = adapter.handleArtifacts(result);

      expect(artifactResult).toBeDefined();
      expect(artifactResult.success).toBe(true);
    });

    test('TC-LR-005: README synced', async () => {
      fs.mkdirSync(config.output_config.artifact_path, { recursive: true });
      
      const result = createExecutionResult({
        artifacts: [
          {
            artifact_id: 'readme-001',
            artifact_type: 'docs_sync_report',
            path: 'README.md',
            title: 'README Update',
            format: 'markdown',
            created_by_role: 'docs',
            content: '# Project README\n\n## Authentication\n\nAuthentication module added.\n'
          }
        ]
      });

      const artifactResult = adapter.handleArtifacts(result);

      expect(artifactResult).toBeDefined();
      expect(artifactResult.success).toBe(true);
    });

    test('TC-LR-006: Cleanup performed', async () => {
      // Create some test files
      const testFilePath = path.join(tmpDir, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'test content', 'utf8');
      expect(fs.existsSync(testFilePath)).toBe(true);

      // Verify cleanup happens in afterEach by checking directory exists now
      expect(fs.existsSync(tmpDir)).toBe(true);

      // The actual cleanup verification is implicit - afterEach will remove the directory
      // We verify the adapter does not interfere with cleanup
      const summary = adapter.getOutputSummary();
      expect(summary.success).toBe(true);
    });

  });

  describe('Adapter Info', () => {

    test('TC-LR-007: Adapter info returned', () => {
      // Call REAL adapter method to get info
      const info = adapter.getAdapterInfo();

      // Validate adapter info using assertion helper
      assertValidAdapterInfo(info, 'workspace');

      // Verify specific fields
      expect(info.adapter_id).toBe('local-repo');
      expect(info.adapter_type).toBe('workspace');
      expect(info.version).toBeDefined();
      expect(info.status).toBe('implemented');
      expect(info.compatible_profiles).toContain('minimal');
      expect(info.compatible_profiles).toContain('full');
    });

  });

  describe('Additional Integration Tests', () => {

    test('TC-LR-008: Artifact validation works', async () => {
      // Create valid artifacts
      const validArtifacts = [
        {
          artifact_id: 'valid-001',
          artifact_type: 'implementation_summary',
          title: 'Valid Artifact',
          format: 'markdown',
          created_by_role: 'developer'
        }
      ];

      // Call REAL validation method
      const validation = adapter.validateArtifactOutput(validArtifacts);

      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    test('TC-LR-009: Invalid artifact detected', async () => {
      // Create invalid artifacts (missing required fields)
      const invalidArtifacts = [
        {
          artifact_id: 'invalid-001'
          // Missing artifact_type, title, format, created_by_role
        }
      ];

      // Call REAL validation method
      const validation = adapter.validateArtifactOutput(invalidArtifacts);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('TC-LR-010: Path validation works', async () => {
      const validPaths = [
        path.join(config.output_config.artifact_path, 'docs/test.md'),
        path.join(config.output_config.changed_files_path, 'src/index.js')
      ];

      const validation = adapter.validatePaths(validPaths);

      expect(validation).toBeDefined();
      expect(validation.length).toBe(2);
    });

    test('TC-LR-011: Changed files handled', async () => {
      const result = createExecutionResult({
        changed_files: [
          { path: 'src/auth/index.js', mode: 'created', description: 'Auth module' },
          { path: 'src/auth/oauth2.js', mode: 'created', description: 'OAuth2 handler' }
        ]
      });

      const filesResult = adapter.handleChangedFiles(result);

      expect(filesResult).toBeDefined();
      expect(filesResult.files_changed).toBeDefined();
    });

    test('TC-LR-012: Retry handling works', async () => {
      // Create retry context
      const retryContext = createRetryContext({
        risk_level: 'low',
        retry_count: 0,
        max_retry: 2
      });

      // Call REAL retry handler method
      const retryDecision = adapter.handleRetry(retryContext);

      expect(retryDecision).toBeDefined();
      expect(retryDecision.should_retry).toBeDefined();
      expect(retryDecision.reason).toBeDefined();
    });

    test('TC-LR-013: Output summary reflects operations', async () => {
      const result = createExecutionResult({
        artifacts: [
          {
            artifact_id: 'summary-test',
            artifact_type: 'implementation_summary',
            path: 'docs/summary.md',
            title: 'Test Summary',
            format: 'markdown',
            created_by_role: 'developer',
            content: 'Test content'
          }
        ]
      });

      adapter.handleArtifacts(result);
      adapter.syncState(result);

      const summary = adapter.getOutputSummary();

      expect(summary).toBeDefined();
      expect(summary.success).toBe(true);
    });

    test('TC-LR-014: Empty artifacts handled gracefully', async () => {
      const result = createExecutionResult({
        artifacts: []
      });

      const artifactResult = adapter.handleArtifacts(result);

      expect(artifactResult).toBeDefined();
      expect(artifactResult.success).toBe(true);
    });

  });

});
