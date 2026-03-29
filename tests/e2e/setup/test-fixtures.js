const crypto = require('crypto');

function githubIssue(overrides = {}) {
  const defaults = {
    action: 'opened',
    issue: {
      number: 1,
      title: '[architect:design-task] Design new feature',
      body: `## Context
Building a new authentication feature for the application.

## Goal
Create a comprehensive design document for the auth system.

## Constraints
- Must support OAuth2
- Must have MFA option
- Must follow security best practices`,
      labels: [
        { name: 'milestone:mvp' },
        { name: 'risk:low' }
      ],
      user: { login: 'test-user', id: 1 },
      repository: {
        id: 1,
        owner: { login: 'test-org' },
        name: 'test-repo',
        full_name: 'test-org/test-repo'
      },
      state: 'open',
      created_at: new Date().toISOString()
    }
  };

  return deepMerge(defaults, overrides);
}

function githubWebhook(overrides = {}) {
  const issue = githubIssue(overrides.issue || {});
  const secret = overrides.secret || 'test-webhook-secret';
  const payload = JSON.stringify(issue);
  const signature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return {
    headers: {
      'x-github-event': 'issues',
      'x-hub-signature-256': signature,
      'content-type': 'application/json'
    },
    body: payload,
    parsedBody: issue
  };
}

function openClawDispatch(overrides = {}) {
  const defaults = {
    dispatch_id: `dispatch-${Date.now()}`,
    project: {
      id: 'proj-001',
      name: 'Test Project',
      goal: 'Build a new feature for the application'
    },
    milestone: {
      id: 'ms-001',
      name: 'MVP Release',
      goal: 'Release minimum viable product',
      status: 'active'
    },
    task: {
      id: 'task-001',
      title: 'Implement authentication feature',
      goal: 'Create working authentication system',
      description: 'Implement OAuth2-based authentication with MFA support',
      context: {
        project_goal: 'Build a new feature',
        milestone_goal: 'Release MVP',
        task_scope: 'Authentication implementation',
        related_spec_sections: ['specs/auth/'],
        code_context_summary: 'New feature implementation'
      },
      constraints: [
        'Must support OAuth2',
        'Must have MFA option'
      ],
      inputs: [],
      expected_outputs: [
        'Working authentication system',
        'Unit tests passing'
      ],
      verification_steps: [
        'Run unit tests',
        'Test OAuth flow',
        'Verify MFA works'
      ],
      risk_level: 'low'
    },
    role: 'developer',
    command: 'implement-task',
    metadata: {
      priority: 'normal',
      created_at: new Date().toISOString()
    }
  };

  return deepMerge(defaults, overrides);
}

function executionResult(overrides = {}) {
  const defaults = {
    dispatch_id: 'dispatch-001',
    project_id: 'proj-001',
    milestone_id: 'ms-001',
    task_id: 'task-001',
    role: 'developer',
    command: 'implement-task',
    status: 'SUCCESS',
    summary: 'Task completed successfully. Authentication feature implemented.',
    artifacts: [
      {
        artifact_id: 'artifact-001',
        artifact_type: 'implementation-summary',
        path: 'src/auth/index.js',
        summary: 'OAuth2 authentication implementation'
      },
      {
        artifact_id: 'artifact-002',
        artifact_type: 'test-report',
        path: 'tests/auth.test.js',
        summary: 'Authentication unit tests'
      }
    ],
    changed_files: [
      { path: 'src/auth/index.js', change_type: 'created' },
      { path: 'tests/auth.test.js', change_type: 'created' }
    ],
    checks_performed: [
      'Unit tests executed',
      'Lint check passed',
      'Type check passed'
    ],
    issues_found: [],
    risks: [],
    recommendation: 'CONTINUE',
    needs_followup: false,
    followup_suggestions: [],
    duration_ms: 45000
  };

  return deepMerge(defaults, overrides);
}

function escalation(overrides = {}) {
  const defaults = {
    escalation_id: `esc-${Date.now()}`,
    dispatch_id: 'dispatch-001',
    project_id: 'proj-001',
    milestone_id: 'ms-001',
    task_id: 'task-001',
    role: 'developer',
    level: 'USER',
    reason_type: 'BLOCKING_DEPENDENCY',
    summary: 'Cannot proceed due to missing external API access',
    blocking_points: [
      'External OAuth provider is not accessible',
      'API credentials not configured in test environment'
    ],
    evidence: {
      related_artifacts: ['src/auth/index.js'],
      logs: ['Error: Connection refused to oauth.provider.com'],
      failure_history: []
    },
    attempted_actions: [
      'Tried connecting to OAuth provider',
      'Checked network configuration'
    ],
    recommended_next_steps: [
      'Provide valid OAuth credentials',
      'Configure test environment for external API access'
    ],
    options: [
      {
        option_id: 'option-1',
        description: 'Wait for credentials and retry',
        pros: ['Will work once credentials provided'],
        cons: ['Blocks progress until resolved']
      },
      {
        option_id: 'option-2',
        description: 'Mock OAuth provider for development',
        pros: ['Can proceed immediately'],
        cons: ['Not testing real integration']
      }
    ],
    recommended_option: 'option-2',
    required_decision: 'Choose how to proceed with OAuth integration',
    requires_user_decision: true,
    requires_acknowledgment: true,
    created_at: new Date().toISOString(),
    created_by: 'e2e-test'
  };

  return deepMerge(defaults, overrides);
}

function retryContext(overrides = {}) {
  const defaults = {
    retry_count: 0,
    previous_failure_reason: 'Connection timeout',
    previous_output_summary: 'Partial implementation completed',
    required_fixes: ['Fix network timeout issues'],
    retry_strategy: 'auto',
    backoff_seconds: 60
  };

  return deepMerge(defaults, overrides);
}

function dispatchPayload(overrides = {}) {
  const dispatch = openClawDispatch(overrides);
  return {
    dispatch_id: dispatch.dispatch_id,
    project_id: dispatch.project.id,
    milestone_id: dispatch.milestone.id,
    task_id: dispatch.task.id,
    role: dispatch.role,
    command: dispatch.command,
    title: dispatch.task.title,
    goal: dispatch.task.goal,
    description: dispatch.task.description,
    context: dispatch.task.context,
    constraints: dispatch.task.constraints,
    inputs: dispatch.task.inputs,
    expected_outputs: dispatch.task.expected_outputs,
    verification_steps: dispatch.task.verification_steps,
    risk_level: dispatch.task.risk_level,
    retry_context: dispatch.retry_context
  };
}

function deepMerge(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

module.exports = {
  githubIssue,
  githubWebhook,
  openClawDispatch,
  executionResult,
  escalation,
  retryContext,
  dispatchPayload
};