const { GitClient } = require('../../../adapters/github-issue/git-client');

jest.mock('child_process', () => ({
  exec: jest.fn()
}));

describe('GitClient - retry mechanism (T-003)', () => {
  let gitClient;
  let mockExec;

  beforeEach(() => {
    mockExec = require('child_process').exec;
    gitClient = new GitClient({ maxRetry: 3 });
    jest.clearAllMocks();
  });

  test('push succeeds without retry', async () => {
    mockExec.mockImplementation((cmd, opts, cb) => {
      cb(null, 'Push successful', '');
    });

    const result = await gitClient.push('origin', 'main');
    expect(result).toBe('Push successful');
    expect(mockExec).toHaveBeenCalledTimes(1);
  });

  test('push retries on network error', async () => {
    mockExec.mockImplementation((cmd, opts, cb) => {
      if (mockExec.mock.calls.length < 3) {
        cb(new Error('network timeout'), '', 'network timeout');
      } else {
        cb(null, 'Push successful', '');
      }
    });

    const result = await gitClient.push('origin', 'main');
    expect(result).toBe('Push successful');
    expect(mockExec).toHaveBeenCalledTimes(3);
  });

  test('push fails on auth error without retry', async () => {
    mockExec.mockImplementation((cmd, opts, cb) => {
      cb(new Error('Authentication failed'), '', 'Authentication failed');
    });

    await expect(gitClient.push('origin', 'main')).rejects.toThrow('Authentication failed');
    expect(mockExec).toHaveBeenCalledTimes(1);
  });

  test('push throws after max retries', async () => {
    mockExec.mockImplementation((cmd, opts, cb) => {
      cb(new Error('Connection refused'), '', 'Connection refused');
    });

    await expect(gitClient.push('origin', 'main')).rejects.toThrow();
    expect(mockExec).toHaveBeenCalledTimes(3);
  });

  test('commit succeeds without retry', async () => {
    mockExec.mockImplementation((cmd, opts, cb) => {
      cb(null, 'Commit created', '');
    });

    const result = await gitClient.commit('Test commit');
    expect(result).toBe('Commit created');
    expect(mockExec).toHaveBeenCalledTimes(1);
  });

  test('_isRetryable returns true for network errors', () => {
    expect(gitClient._isRetryable(new Error('network timeout'))).toBe(true);
    expect(gitClient._isRetryable(new Error('Connection refused'))).toBe(true);
    expect(gitClient._isRetryable(new Error('could not read from remote'))).toBe(true);
  });

  test('_isRetryable returns false for auth/permission errors', () => {
    expect(gitClient._isRetryable(new Error('Authentication failed'))).toBe(false);
    expect(gitClient._isRetryable(new Error('Permission denied'))).toBe(false);
  });
});