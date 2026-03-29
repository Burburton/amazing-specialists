const { exec } = require('child_process');
const { RetryHandler } = require('./retry-handler');

class GitClient {
  constructor(config) {
    this.maxRetry = config?.maxRetry || 3;
    this.retryHandler = new RetryHandler({
      max_retry: this.maxRetry,
      backoff_seconds: 1
    });
  }

  async push(remote, branch) {
    return this._retryOperation(() => 
      this._execGit(`git push ${remote} ${branch}`)
    );
  }

  async commit(message) {
    return this._retryOperation(() => 
      this._execGit(`git commit -m "${message}"`)
    );
  }

  async add(files) {
    const fileArg = Array.isArray(files) ? files.join(' ') : files || '.';
    return this._execGit(`git add ${fileArg}`);
  }

  async status() {
    return this._execGit('git status --porcelain');
  }

  async _retryOperation(operation) {
    let attempts = 0;
    while (attempts < this.maxRetry) {
      try {
        return await operation();
      } catch (error) {
        if (!this._isRetryable(error)) throw error;
        attempts++;
        await this._backoff(attempts);
      }
    }
    throw new Error(`Git operation failed after ${this.maxRetry} retries`);
  }

  _isRetryable(error) {
    const msg = error.message.toLowerCase();
    return msg.includes('network') || 
           msg.includes('timeout') ||
           msg.includes('connection') ||
           msg.includes('could not read from remote');
  }

  async _backoff(attempts) {
    const delay = Math.pow(2, attempts) * 1000;
    await new Promise(r => setTimeout(r, delay));
  }

  async _execGit(command) {
    return new Promise((resolve, reject) => {
      exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`${error.message}\nstderr: ${stderr}`));
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }
}

module.exports = { GitClient };