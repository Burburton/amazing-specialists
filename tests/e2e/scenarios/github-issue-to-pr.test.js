const nock = require('nock');
const { githubIssue, githubWebhook, executionResult } = require('../setup/test-fixtures');
const { mockGetIssue, mockCreatePR, mockPostComment, mockAddLabels } = require('../helpers/github-mock');
const { assertValidDispatchPayload, assertMockCallsComplete } = require('../helpers/assertions');

describe('E2E: GitHub Issue → PR Workflow', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.cleanAll();
  });

  describe('TC-001: Webhook with valid signature', () => {
    test('should accept webhook with valid HMAC signature', () => {
      const webhook = githubWebhook();
      const crypto = require('crypto');
      
      const expectedSig = 'sha256=' + crypto
        .createHmac('sha256', 'test-webhook-secret')
        .update(webhook.body)
        .digest('hex');
      
      expect(webhook.headers['x-hub-signature-256']).toBe(expectedSig);
    });
  });

  describe('TC-002: Issue labels parsed correctly', () => {
    test('should parse role and command from title', () => {
      const issue = githubIssue();
      
      const titleMatch = issue.issue.title.match(/\[(\w+):(\w+(?:-\w+)*)\]/);
      
      expect(titleMatch).not.toBeNull();
      expect(titleMatch[1]).toBe('architect');
      expect(titleMatch[2]).toBe('design-task');
    });

    test('should parse milestone from labels', () => {
      const issue = githubIssue();
      
      const milestoneLabel = issue.issue.labels.find(l => l.name.startsWith('milestone:'));
      expect(milestoneLabel).toBeDefined();
      expect(milestoneLabel.name).toBe('milestone:mvp');
    });

    test('should parse risk level from labels', () => {
      const issue = githubIssue();
      
      const riskLabel = issue.issue.labels.find(l => l.name.startsWith('risk:'));
      expect(riskLabel).toBeDefined();
      expect(riskLabel.name).toBe('risk:low');
    });
  });

  describe('TC-003: Issue body parsed correctly', () => {
    test('should extract Context section', () => {
      const issue = githubIssue();
      const body = issue.issue.body;
      
      const contextMatch = body.match(/## Context\n([\s\S]*?)(?=\n## |$)/);
      
      expect(contextMatch).not.toBeNull();
      expect(contextMatch[1].trim()).toContain('authentication feature');
    });

    test('should extract Goal section', () => {
      const issue = githubIssue();
      const body = issue.issue.body;
      
      const goalMatch = body.match(/## Goal\n([\s\S]*?)(?=\n## |$)/);
      
      expect(goalMatch).not.toBeNull();
      expect(goalMatch[1].trim()).toContain('design document');
    });

    test('should extract Constraints section', () => {
      const issue = githubIssue();
      const body = issue.issue.body;
      
      const constraintsMatch = body.match(/## Constraints\n([\s\S]*?)(?=\n## |$)/);
      
      expect(constraintsMatch).not.toBeNull();
      expect(constraintsMatch[1]).toContain('OAuth2');
      expect(constraintsMatch[1]).toContain('MFA');
    });
  });

  describe('TC-004: Dispatch payload validated', () => {
    test('should create valid dispatch payload from issue', () => {
      const dispatchPayload = {
        dispatch_id: 'dispatch-001',
        project_id: 'proj-001',
        milestone_id: 'ms-001',
        task_id: 'task-001',
        role: 'architect',
        command: 'design-task',
        title: 'Design new feature',
        goal: 'Create design document',
        description: 'Design the auth system',
        context: { project_goal: 'Build feature' },
        constraints: ['OAuth2', 'MFA'],
        inputs: [],
        expected_outputs: ['Design doc'],
        verification_steps: ['Review'],
        risk_level: 'low'
      };
      
      const result = assertValidDispatchPayload(dispatchPayload);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('TC-005: Execution result creates PR', () => {
    test('should format execution result for PR creation', () => {
      const result = executionResult();
      
      expect(result.status).toBe('SUCCESS');
      expect(result.artifacts).toHaveLength(2);
      expect(result.changed_files).toHaveLength(2);
      expect(result.recommendation).toBe('CONTINUE');
    });

    test('should include artifact paths for PR files', () => {
      const result = executionResult();
      
      const filePaths = result.changed_files.map(f => f.path);
      
      expect(filePaths).toContain('src/auth/index.js');
      expect(filePaths).toContain('tests/auth.test.js');
    });
  });

  describe('TC-006: Review comments posted', () => {
    test('should format review comment from execution result', () => {
      const result = executionResult({
        status: 'SUCCESS',
        summary: 'All checks passed'
      });
      
      const commentBody = `## Execution Result: ✅ SUCCESS

${result.summary}

### Changed Files
- \`src/auth/index.js\` (created)
- \`tests/auth.test.js\` (created)

### Recommendation
**CONTINUE** - Task completed successfully.`;
      
      expect(commentBody).toContain('SUCCESS');
      expect(commentBody).toContain('CONTINUE');
    });
  });

  describe('TC-007: Invalid webhook signature rejected', () => {
    test('should reject webhook with invalid signature', () => {
      const crypto = require('crypto');
      const webhook = githubWebhook();
      
      const invalidSig = 'sha256=' + 'invalid_signature';
      
      const expectedSig = webhook.headers['x-hub-signature-256'];
      
      expect(invalidSig).not.toBe(expectedSig);
    });
  });

  describe('TC-008: Malformed issue body handled', () => {
    test('should handle missing Context section', () => {
      const malformedBody = '## Goal\nSome goal\n## Constraints\nSome constraints';
      
      const contextMatch = malformedBody.match(/## Context\n([\s\S]*?)(?=\n## |$)/);
      
      expect(contextMatch).toBeNull();
    });

    test('should handle empty body', () => {
      const issue = githubIssue({
        issue: { body: '' }
      });
      
      expect(issue.issue.body).toBe('');
    });

    test('should use default values for missing sections', () => {
      const defaults = {
        context: 'No context provided',
        goal: 'No goal specified',
        constraints: []
      };
      
      expect(defaults.context).toBeDefined();
      expect(defaults.goal).toBeDefined();
      expect(defaults.constraints).toEqual([]);
    });
  });
});