const { GitHubIssueAdapter } = require('../adapters/github-issue');
const { GitClient } = require('../adapters/github-issue/git-client');

class IssueProcessor {
  constructor(config) {
    this.adapter = new GitHubIssueAdapter(config);
    this.gitClient = new GitClient(config?.git_config);
  }

  async process(owner, repo, issueNumber) {
    console.log(`Processing Issue #${issueNumber} in ${owner}/${repo}...`);

    const issue = await this.adapter.githubClient.getIssue(owner, repo, issueNumber);
    console.log(`Fetched Issue: "${issue.title}"`);

    const dispatch = this.adapter.normalizeInput(issue);
    console.log(`Generated Dispatch: ${dispatch.dispatch_id}`);

    const validation = this.adapter.validateDispatch(dispatch);
    if (!validation.isValid) {
      const errorMsg = validation.errors.map(e => e.message).join(', ');
      console.error(`Validation failed: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    const result = await this._executeDispatch(dispatch);

    const comment = this.adapter.commentTemplates.generateResultComment(result);
    await this.adapter.githubClient.postComment(owner, repo, issueNumber, comment);
    console.log('Posted result comment.');

    if (result.status === 'SUCCESS') {
      await this._closeIssue(owner, repo, issueNumber);
      console.log(`Issue #${issueNumber} closed.`);
    }

    return { success: true, result };
  }

  async processDryRun(owner, repo, issueNumber) {
    console.log(`Dry Run: Issue #${issueNumber} in ${owner}/${repo}...`);

    const mockIssue = this._createMockIssue(owner, repo, issueNumber);
    console.log(`Using Mock Issue: "${mockIssue.title}"`);

    const dispatch = this.adapter.normalizeInput(mockIssue);
    console.log(`Generated Dispatch: ${dispatch.dispatch_id}`);
    console.log(`Project ID: ${dispatch.project_id}`);

    const validation = this.adapter.validateDispatch(dispatch);
    if (!validation.isValid) {
      const errorMsg = validation.errors.map(e => e.message).join(', ');
      console.error(`Validation failed: ${errorMsg}`);
      return { success: false, error: errorMsg, dispatch };
    }
    console.log('Validation: PASSED');

    const result = await this._executeDispatch(dispatch);
    const comment = this.adapter.commentTemplates.generateResultComment(result);

    return { success: true, dispatch, result, comment };
  }

  _createMockIssue(owner, repo, issueNumber) {
    return {
      number: issueNumber,
      title: `Test Issue #${issueNumber}`,
      body: `## Context\nThis is a test issue for dry-run verification.\n\n## Goal\nVerify automation script works correctly.\n\n## Constraints\n- Must parse correctly\n- Must validate dispatch\n\n## Expected Outputs\n- Verified dispatch payload\n- Generated comment`,
      repository: { owner: { login: owner }, name: repo },
      repository_url: `https://api.github.com/repos/${owner}/${repo}`,
      html_url: `https://github.com/${owner}/${repo}/issues/${issueNumber}`,
      created_at: new Date().toISOString(),
      user: { login: 'test-user' },
      labels: [
        { name: 'milestone:M027' },
        { name: 'task:T012' },
        { name: 'role:developer' },
        { name: 'command:implement-task' },
        { name: 'risk:low' }
      ]
    };
  }

  async _executeDispatch(dispatch) {
    return {
      status: 'SUCCESS',
      role: dispatch.role,
      command: dispatch.command,
      summary: 'Task executed successfully (placeholder)',
      artifacts: [],
      metrics: { duration_ms: 1000 },
      commit_sha: null,
      recommendation: ['CONTINUE']
    };
  }

  async _closeIssue(owner, repo, issueNumber) {
    const path = `/repos/${owner}/${repo}/issues/${issueNumber}`;
    await this.adapter.githubClient._request('PATCH', path, { state: 'closed' });
  }
}

async function main() {
  const minimist = require('minimist');
  const argv = minimist(process.argv.slice(2));
  
  if (!argv.owner || !argv.repo || !argv.issue) {
    console.error('Usage: node scripts/process-issue.js --owner <owner> --repo <repo> --issue <number> [--token <token>] [--dry-run]');
    process.exit(1);
  }

  const dryRun = argv['dry-run'] || argv.dryrun;

  // Support token via CLI or environment variable (not required for dry-run)
  const token = argv.token || process.env.GITHUB_TOKEN;
  if (!token && !dryRun) {
    console.error('Error: No GitHub token provided. Use --token <token> or set GITHUB_TOKEN environment variable.');
    console.error('For testing without API calls, use --dry-run');
    process.exit(1);
  }

  const config = {
    github_config: {
      api: { base_url: 'https://api.github.com' },
      token,
      label_mappings: {
        milestone_prefix: 'milestone:',
        role_prefix: 'role:',
        command_prefix: 'command:',
        task_prefix: 'task:',
        risk_prefix: 'risk:',
        escalation_prefix: 'escalation:',
        status_prefix: 'status:'
      },
      default_values: {
        role: 'developer',
        command: 'implement-task',
        risk_level: 'medium'
      },
      retry_config: {
        strategy: 'auto',
        max_retry: 1,
        backoff_seconds: 300
      }
    },
    validation: {
      require_role_label: false,
      require_milestone: false,
      require_task_id: false
    }
  };
  
  const processor = new IssueProcessor(config);

  if (dryRun) {
    console.log('=== DRY RUN MODE ===');
    const result = await processor.processDryRun(argv.owner, argv.repo, parseInt(argv.issue));
    
    if (result.success) {
      console.log('\n=== DRY RUN SUCCESS ===');
      console.log('\nGenerated Comment:\n');
      console.log(result.comment);
    } else {
      console.error('Dry run failed:', result.error);
      process.exit(1);
    }
  } else {
    const result = await processor.process(argv.owner, argv.repo, parseInt(argv.issue));
    
    if (result.success) {
      console.log('Processing completed successfully.');
    } else {
      console.error('Processing failed:', result.error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { IssueProcessor };