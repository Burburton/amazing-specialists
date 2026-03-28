/**
 * Unit tests for GitHub Issue Adapter (index.js)
 * Tests OrchestratorAdapter interface compliance (AC-010)
 */

const { GitHubIssueAdapter } = require('../../index');

describe('GitHubIssueAdapter', () => {
  let adapter;
  let defaultConfig;

  beforeEach(() => {
    defaultConfig = {
      adapter_id: 'github-issue',
      adapter_type: 'orchestrator',
      priority: 'later',
      version: '1.0.0',
      github_config: {
        api: { base_url: 'https://api.github.com' },
        webhook: { secret_env_var: 'GITHUB_WEBHOOK_SECRET' },
        retry_config: { max_retry: 1, backoff_seconds: 300 },
        default_values: { role: 'developer', risk_level: 'medium' },
        label_mappings: {
          milestone_prefix: 'milestone:',
          role_prefix: 'role:',
          command_prefix: 'command:',
          task_prefix: 'task:',
          risk_prefix: 'risk:',
          escalation_prefix: 'escalation:',
          status_prefix: 'status:'
        }
      }
    };
    adapter = new GitHubIssueAdapter(defaultConfig);
  });

  describe('Constructor', () => {
    test('initializes with provided config', () => {
      expect(adapter.adapterId).toBe('github-issue');
      expect(adapter.adapterType).toBe('orchestrator');
      expect(adapter.priority).toBe('later');
      expect(adapter.version).toBe('1.0.0');
    });

    test('uses default values when config missing', () => {
      const minimalAdapter = new GitHubIssueAdapter({
        github_config: {
          label_mappings: {
            milestone_prefix: 'milestone:',
            role_prefix: 'role:',
            command_prefix: 'command:',
            task_prefix: 'task:',
            risk_prefix: 'risk:',
            escalation_prefix: 'escalation:',
            status_prefix: 'status:'
          }
        }
      });
      expect(minimalAdapter.adapterId).toBe('github-issue');
      expect(minimalAdapter.adapterType).toBe('orchestrator');
      expect(minimalAdapter.priority).toBe('later');
      expect(minimalAdapter.version).toBe('1.0.0');
    });

    test('handles null config', () => {
      expect(() => new GitHubIssueAdapter(null)).toThrow();
    });

    test('initializes all components', () => {
      expect(adapter.issueParser).toBeDefined();
      expect(adapter.githubClient).toBeDefined();
      expect(adapter.webhookHandler).toBeDefined();
      expect(adapter.commentTemplates).toBeDefined();
      expect(adapter.retryHandler).toBeDefined();
    });

    test('accepts custom adapter_id', () => {
      const customAdapter = new GitHubIssueAdapter({
        adapter_id: 'custom-github',
        github_config: {
          label_mappings: {
            milestone_prefix: 'milestone:',
            role_prefix: 'role:',
            command_prefix: 'command:',
            task_prefix: 'task:',
            risk_prefix: 'risk:',
            escalation_prefix: 'escalation:',
            status_prefix: 'status:'
          }
        }
      });
      expect(customAdapter.adapterId).toBe('custom-github');
    });
  });

  describe('normalizeInput - AC-001', () => {
    test('converts GitHub Issue to Dispatch Payload', () => {
      const issue = {
        number: 123,
        title: 'Test Issue',
        body: '## Goal\nImplement feature X\n\n## Context\nThis is context',
        labels: [{ name: 'role:developer' }, { name: 'milestone:M001' }],
        repository: { 
          owner: { login: 'owner' }, 
          name: 'repo',
          full_name: 'owner/repo' 
        }
      };

      const dispatch = adapter.normalizeInput(issue);

      expect(dispatch.dispatch_id).toBe('gh-issue-owner-repo-123');
      expect(dispatch.project_id).toBe('owner/repo');
      expect(dispatch.milestone_id).toBe('M001');
      expect(dispatch.role).toBe('developer');
      expect(dispatch.goal).toBe('Implement feature X');
    });

    test('handles issue with missing fields using defaults', () => {
      const minimalIssue = {
        number: 123,
        title: '',
        body: '',
        labels: [],
        repository: { owner: { login: 'test' }, name: 'repo' }
      };

      const dispatch = adapter.normalizeInput(minimalIssue);
      expect(dispatch.dispatch_id).toBe('gh-issue-test-repo-123');
      expect(dispatch.role).toBe('developer');
    });

    test('uses default role when no role label', () => {
      const issue = {
        number: 123,
        title: 'Test',
        body: '## Goal\nTest goal',
        labels: [],
        repository: { owner: { login: 'owner' }, name: 'repo' }
      };

      const dispatch = adapter.normalizeInput(issue);
      expect(dispatch.role).toBe('developer');
    });

    test('handles milestone extraction from label', () => {
      const issue = {
        number: 1,
        title: 'Test',
        body: '## Goal\nGoal',
        labels: [{ name: 'milestone:M005' }],
        repository: { owner: { login: 'test' }, name: 'test' }
      };

      const dispatch = adapter.normalizeInput(issue);
      expect(dispatch.milestone_id).toBe('M005');
    });

    test('extracts risk_level from labels', () => {
      const issue = {
        number: 1,
        title: 'Test',
        body: '## Goal\nGoal',
        labels: [{ name: 'risk:high' }],
        repository: { owner: { login: 'test' }, name: 'test' }
      };

      const dispatch = adapter.normalizeInput(issue);
      expect(dispatch.risk_level).toBe('high');
    });
  });

  describe('validateDispatch - AC-001', () => {
    test('returns valid for complete dispatch', () => {
      const dispatch = {
        dispatch_id: 'gh-issue-test-test-1',
        project_id: 'test/test',
        milestone_id: 'M001',
        task_id: 'T001',
        role: 'developer',
        command: 'implement-task',
        title: 'Test Task',
        goal: 'Test goal',
        description: 'Test description',
        context: { task_scope: 'test' },
        constraints: [],
        inputs: [],
        expected_outputs: [],
        verification_steps: [],
        risk_level: 'low'
      };

      const result = adapter.validateDispatch(dispatch);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('returns errors for missing required fields', () => {
      const incompleteDispatch = {
        dispatch_id: 'test-1',
        role: 'developer'
      };

      const result = adapter.validateDispatch(incompleteDispatch);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('validates role enum', () => {
      const invalidRoleDispatch = {
        dispatch_id: 'test-1',
        project_id: 'test/test',
        milestone_id: 'M001',
        task_id: 'T001',
        role: 'invalid-role',
        command: 'test',
        title: 'Test',
        goal: 'Goal',
        description: 'Desc',
        context: {},
        constraints: [],
        inputs: [],
        expected_outputs: [],
        verification_steps: [],
        risk_level: 'low'
      };

      const result = adapter.validateDispatch(invalidRoleDispatch);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'role')).toBe(true);
    });

    test('accepts all valid roles', () => {
      const validRoles = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];
      
      for (const role of validRoles) {
        const dispatch = {
          dispatch_id: 'test-1',
          project_id: 'test/test',
          milestone_id: 'M001',
          task_id: 'T001',
          role,
          command: 'test',
          title: 'Test',
          goal: 'Goal',
          description: 'Desc',
          context: {},
          constraints: [],
          inputs: [],
          expected_outputs: [],
          verification_steps: [],
          risk_level: 'low'
        };

        const result = adapter.validateDispatch(dispatch);
        expect(result.isValid).toBe(true);
      }
    });

    test('validates risk_level enum', () => {
      const invalidRiskDispatch = {
        dispatch_id: 'test-1',
        project_id: 'test/test',
        milestone_id: 'M001',
        task_id: 'T001',
        role: 'developer',
        command: 'test',
        title: 'Test',
        goal: 'Goal',
        description: 'Desc',
        context: {},
        constraints: [],
        inputs: [],
        expected_outputs: [],
        verification_steps: [],
        risk_level: 'invalid-risk'
      };

      const result = adapter.validateDispatch(invalidRiskDispatch);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'risk_level')).toBe(true);
    });

    test('accepts all valid risk levels', () => {
      const validLevels = ['low', 'medium', 'high', 'critical'];
      
      for (const level of validLevels) {
        const dispatch = {
          dispatch_id: 'test-1',
          project_id: 'test/test',
          milestone_id: 'M001',
          task_id: 'T001',
          role: 'developer',
          command: 'test',
          title: 'Test',
          goal: 'Goal',
          description: 'Desc',
          context: {},
          constraints: [],
          inputs: [],
          expected_outputs: [],
          verification_steps: [],
          risk_level: level
        };

        const result = adapter.validateDispatch(dispatch);
        expect(result.isValid).toBe(true);
      }
    });

    test('detects empty string as missing', () => {
      const dispatch = {
        dispatch_id: '',
        project_id: 'test/test',
        milestone_id: 'M001',
        task_id: 'T001',
        role: 'developer',
        command: 'test',
        title: 'Test',
        goal: 'Goal',
        description: 'Desc',
        context: {},
        constraints: [],
        inputs: [],
        expected_outputs: [],
        verification_steps: [],
        risk_level: 'low'
      };

      const result = adapter.validateDispatch(dispatch);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'dispatch_id')).toBe(true);
    });
  });

  describe('routeToExecution', () => {
    test('returns routing result', () => {
      const dispatch = {
        dispatch_id: 'gh-issue-test-test-1',
        role: 'developer',
        command: 'implement-task'
      };

      const result = adapter.routeToExecution(dispatch);
      expect(result.routed).toBe(true);
      expect(result.dispatch_id).toBe('gh-issue-test-test-1');
      expect(result.role).toBe('developer');
      expect(result.command).toBe('implement-task');
    });

    test('handles dispatch with minimal fields', () => {
      const dispatch = { dispatch_id: 'test-id', role: 'tester' };
      const result = adapter.routeToExecution(dispatch);
      expect(result.routed).toBe(true);
    });
  });

  describe('mapError - AC-008', () => {
    test('maps 404 to BLOCKED', () => {
      const error = { status: 404 };
      expect(adapter.mapError(error)).toBe('BLOCKED');
    });

    test('maps 403 to BLOCKED', () => {
      const error = { status: 403 };
      expect(adapter.mapError(error)).toBe('BLOCKED');
    });

    test('maps 401 to BLOCKED', () => {
      const error = { status: 401 };
      expect(adapter.mapError(error)).toBe('BLOCKED');
    });

    test('maps 422 to FAILED_RETRYABLE', () => {
      const error = { status: 422 };
      expect(adapter.mapError(error)).toBe('FAILED_RETRYABLE');
    });

    test('maps 500 to FAILED_RETRYABLE', () => {
      const error = { status: 500 };
      expect(adapter.mapError(error)).toBe('FAILED_RETRYABLE');
    });

    test('maps 502 to FAILED_RETRYABLE', () => {
      const error = { status: 502 };
      expect(adapter.mapError(error)).toBe('FAILED_RETRYABLE');
    });

    test('maps 503 to FAILED_RETRYABLE', () => {
      const error = { status: 503 };
      expect(adapter.mapError(error)).toBe('FAILED_RETRYABLE');
    });

    test('maps unknown status to FAILED_RETRYABLE', () => {
      const error = { status: 999 };
      expect(adapter.mapError(error)).toBe('FAILED_RETRYABLE');
    });

    test('maps error without status to FAILED_RETRYABLE', () => {
      const error = { message: 'Network error' };
      expect(adapter.mapError(error)).toBe('FAILED_RETRYABLE');
    });

    test('maps null error to FAILED_RETRYABLE', () => {
      expect(adapter.mapError(null)).toBe('FAILED_RETRYABLE');
    });

    test('extracts status from response property', () => {
      const error = { response: { status: 404 } };
      expect(adapter.mapError(error)).toBe('BLOCKED');
    });

    test('handles undefined error', () => {
      expect(adapter.mapError(undefined)).toBe('FAILED_RETRYABLE');
    });
  });

  describe('generateEscalation', () => {
    test('generates escalation with required fields', () => {
      const context = {
        dispatch_id: 'gh-issue-test-test-1',
        project_id: 'test/test',
        milestone_id: 'M001',
        task_id: 'T001',
        role: 'developer',
        summary: 'Need user decision',
        blocking_points: ['Missing config'],
        attempted_actions: ['Retry'],
        recommended_next_steps: ['Provide config'],
        options: ['Option A', 'Option B']
      };

      const escalation = adapter.generateEscalation(context);

      expect(escalation.escalation_id).toBeDefined();
      expect(escalation.dispatch_id).toBe('gh-issue-test-test-1');
      expect(escalation.project_id).toBe('test/test');
      expect(escalation.milestone_id).toBe('M001');
      expect(escalation.role).toBe('developer');
      expect(escalation.level).toBe('USER');
      expect(escalation.reason_type).toBe('OUT_OF_SCOPE_REQUEST');
      expect(escalation.summary).toBe('Need user decision');
      expect(escalation.blocking_points).toHaveLength(1);
      expect(escalation.attempted_actions).toHaveLength(1);
      expect(escalation.recommended_next_steps).toHaveLength(1);
      expect(escalation.options).toHaveLength(2);
      expect(escalation.requires_user_decision).toBe(true);
      expect(escalation.created_at).toBeDefined();
      expect(escalation.created_by).toBe('github-issue-adapter');
    });

    test('uses provided level and reason_type', () => {
      const context = {
        dispatch_id: 'test-1',
        level: 'SYSTEM',
        reason_type: 'AMBIGUOUS_REQUEST',
        summary: 'Ambiguous'
      };

      const escalation = adapter.generateEscalation(context);
      expect(escalation.level).toBe('SYSTEM');
      expect(escalation.reason_type).toBe('AMBIGUOUS_REQUEST');
    });

    test('generates unique escalation_ids', () => {
      const context = { dispatch_id: 'test-1', summary: 'Test' };
      
      const escalation1 = adapter.generateEscalation(context);
      const escalation2 = adapter.generateEscalation(context);
      
      expect(escalation1.escalation_id).not.toBe(escalation2.escalation_id);
    });

    test('handles minimal context', () => {
      const context = {};
      const escalation = adapter.generateEscalation(context);
      
      expect(escalation.escalation_id).toBeDefined();
      expect(escalation.level).toBe('USER');
      expect(escalation.blocking_points).toEqual([]);
      expect(escalation.attempted_actions).toEqual([]);
    });

    test('sets requires_user_decision to false when specified', () => {
      const context = {
        dispatch_id: 'test-1',
        requires_user_decision: false
      };

      const escalation = adapter.generateEscalation(context);
      expect(escalation.requires_user_decision).toBe(false);
    });
  });

  describe('handleRetry', () => {
    test('delegates to retryHandler', () => {
      const context = { retry_count: 0, risk_level: 'low' };
      const result = adapter.handleRetry(context);
      
      expect(result.decision).toBe('retry');
    });

    test('returns escalate for high risk', () => {
      const context = { retry_count: 0, risk_level: 'high' };
      const result = adapter.handleRetry(context);
      
      expect(result.decision).toBe('escalate');
    });

    test('returns escalate when max_retry exceeded', () => {
      const context = { retry_count: 2, risk_level: 'low' };
      const result = adapter.handleRetry(context);
      
      expect(result.decision).toBe('escalate');
    });
  });

  describe('getAdapterInfo - AC-010', () => {
    test('returns adapter metadata', () => {
      const info = adapter.getAdapterInfo();

      expect(info.adapter_id).toBe('github-issue');
      expect(info.adapter_type).toBe('orchestrator');
      expect(info.version).toBe('1.0.0');
      expect(info.priority).toBe('later');
      expect(info.status).toBe('implemented');
      expect(info.description).toBeDefined();
      expect(info.compatible_profiles).toContain('minimal');
      expect(info.compatible_profiles).toContain('full');
      expect(info.compatible_workspaces).toContain('github-pr');
      expect(info.compatible_workspaces).toContain('local-repo');
    });

    test('returns custom adapter_id', () => {
      const customAdapter = new GitHubIssueAdapter({
        adapter_id: 'custom-id',
        github_config: {
          label_mappings: {
            milestone_prefix: 'milestone:',
            role_prefix: 'role:',
            command_prefix: 'command:',
            task_prefix: 'task:',
            risk_prefix: 'risk:',
            escalation_prefix: 'escalation:',
            status_prefix: 'status:'
          }
        }
      });
      const info = customAdapter.getAdapterInfo();
      
      expect(info.adapter_id).toBe('custom-id');
    });
  });

  describe('Interface Compliance - AC-010', () => {
    test('implements normalizeInput method', () => {
      expect(adapter.normalizeInput).toBeDefined();
      expect(typeof adapter.normalizeInput).toBe('function');
    });

    test('implements validateDispatch method', () => {
      expect(adapter.validateDispatch).toBeDefined();
      expect(typeof adapter.validateDispatch).toBe('function');
    });

    test('implements routeToExecution method', () => {
      expect(adapter.routeToExecution).toBeDefined();
      expect(typeof adapter.routeToExecution).toBe('function');
    });

    test('implements mapError method', () => {
      expect(adapter.mapError).toBeDefined();
      expect(typeof adapter.mapError).toBe('function');
    });

    test('implements generateEscalation method', () => {
      expect(adapter.generateEscalation).toBeDefined();
      expect(typeof adapter.generateEscalation).toBe('function');
    });

    test('implements handleRetry method', () => {
      expect(adapter.handleRetry).toBeDefined();
      expect(typeof adapter.handleRetry).toBe('function');
    });

    test('implements getAdapterInfo method', () => {
      expect(adapter.getAdapterInfo).toBeDefined();
      expect(typeof adapter.getAdapterInfo).toBe('function');
    });

    test('implements handleWebhook method', () => {
      expect(adapter.handleWebhook).toBeDefined();
      expect(typeof adapter.handleWebhook).toBe('function');
    });

    test('implements postResult method', () => {
      expect(adapter.postResult).toBeDefined();
      expect(typeof adapter.postResult).toBe('function');
    });

    test('implements postEscalation method', () => {
      expect(adapter.postEscalation).toBeDefined();
      expect(typeof adapter.postEscalation).toBe('function');
    });

    test('implements postRetryComment method', () => {
      expect(adapter.postRetryComment).toBeDefined();
      expect(typeof adapter.postRetryComment).toBe('function');
    });
  });

  describe('Webhook Handling', () => {
    test('handleWebhook delegates to webhookHandler', () => {
      const mockRequest = {
        headers: {
          'x-hub-signature-256': 'sha256=abc123',
          'x-github-event': 'issues',
          'x-github-delivery': '12345'
        },
        body: JSON.stringify({
          action: 'opened',
          issue: { number: 1, title: 'Test' }
        })
      };

      expect(adapter.handleWebhook).toBeDefined();
    });
  });

  describe('Escalation Posting', () => {
    test('postEscalation method exists', () => {
      expect(adapter.postEscalation).toBeDefined();
    });
  });

  describe('Result Posting', () => {
    test('postResult method exists', () => {
      expect(adapter.postResult).toBeDefined();
    });
  });

  describe('Integration with Sub-components', () => {
    test('issueParser is correctly initialized', () => {
      expect(adapter.issueParser).toBeDefined();
      expect(adapter.issueParser.config).toBeDefined();
    });

    test('githubClient is correctly initialized', () => {
      expect(adapter.githubClient).toBeDefined();
    });

    test('webhookHandler is correctly initialized', () => {
      expect(adapter.webhookHandler).toBeDefined();
    });

    test('commentTemplates is correctly initialized', () => {
      expect(adapter.commentTemplates).toBeDefined();
      expect(adapter.commentTemplates.escalation).toBeDefined();
      expect(adapter.commentTemplates.retry).toBeDefined();
      expect(adapter.commentTemplates.result).toBeDefined();
    });

    test('retryHandler is correctly initialized', () => {
      expect(adapter.retryHandler).toBeDefined();
      expect(adapter.retryHandler.maxRetry).toBe(1);
    });
  });
});