const { CommentTemplates } = require('../../../adapters/github-issue/comment-templates');

describe('CommentTemplates - generateResultComment (T-002)', () => {
  let templates;

  beforeEach(() => {
    templates = new CommentTemplates();
  });

  test('generates SUCCESS result comment', () => {
    const result = {
      status: 'SUCCESS',
      role: 'developer',
      command: 'feature-implementation',
      summary: 'Task completed successfully',
      artifacts: [],
      metrics: { duration_ms: 1500 },
      commit_sha: 'abc123',
      recommendation: ['CONTINUE']
    };

    const comment = templates.generateResultComment(result);
    expect(comment).toContain('✅');
    expect(comment).toContain('SUCCESS');
    expect(comment).toContain('developer');
    expect(comment).toContain('abc123');
    expect(comment).toContain('1500');
  });

  test('generates FAILED_RETRYABLE result comment', () => {
    const result = {
      status: 'FAILED_RETRYABLE',
      role: 'developer',
      command: 'bugfix-workflow',
      summary: 'Failed due to network error',
      artifacts: [],
      metrics: { duration_ms: 2000 },
      commit_sha: null,
      recommendation: ['REWORK']
    };

    const comment = templates.generateResultComment(result);
    expect(comment).toContain('🔄');
    expect(comment).toContain('FAILED_RETRYABLE');
    expect(comment).toContain('N/A');
  });

  test('generates FAILED_ESCALATE result comment', () => {
    const result = {
      status: 'FAILED_ESCALATE',
      role: 'architect',
      command: 'design-task',
      summary: 'Missing critical context',
      artifacts: [],
      metrics: { duration_ms: 500 },
      commit_sha: null,
      recommendation: ['ESCALATE']
    };

    const comment = templates.generateResultComment(result);
    expect(comment).toContain('❌');
    expect(comment).toContain('FAILED_ESCALATE');
  });

  test('formats artifacts correctly', () => {
    const result = {
      status: 'SUCCESS',
      role: 'developer',
      command: 'feature-implementation',
      summary: 'Task completed',
      artifacts: [
        { type: 'implementation-summary', path: 'specs/001/impl.md' }
      ],
      metrics: null,
      commit_sha: 'def456',
      recommendation: ['SEND_TO_TEST']
    };

    const comment = templates.generateResultComment(result);
    expect(comment).toContain('implementation-summary');
    expect(comment).toContain('specs/001/impl.md');
  });

  test('handles unknown status with fallback emoji', () => {
    const result = {
      status: 'UNKNOWN_STATUS',
      role: 'developer',
      command: 'test',
      summary: 'Test',
      artifacts: [],
      metrics: null,
      commit_sha: null,
      recommendation: []
    };

    const comment = templates.generateResultComment(result);
    expect(comment).toContain('❓');
  });
});