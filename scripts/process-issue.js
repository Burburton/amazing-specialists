const fs = require('fs');
const path = require('path');
const { GitHubIssueAdapter } = require('../adapters/github-issue');
const { GitClient } = require('../adapters/github-issue/git-client');
const { IssueContext } = require('../adapters/github-issue/issue-context');

class IssueProcessor {
  constructor(config, projectRoot = process.cwd()) {
    this.adapter = new GitHubIssueAdapter(config);
    this.gitClient = new GitClient(config?.git_config);
    this.context = new IssueContext(projectRoot);
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
    await this.adapter.githubClient.closeIssue(owner, repo, issueNumber);
  }

  async _findIssueByTaskId(owner, repo, taskId) {
    const issues = await this.adapter.githubClient.searchIssues(owner, repo, {
      labels: [`task:${taskId}`],
      state: 'all'
    });
    return issues.length > 0 ? issues[0] : null;
  }

  async handleCreateCommand(argv) {
    const { owner, repo, task, title, role, risk, milestone, body, bodyFile } = argv;

    if (!owner || !repo || !task || !title) {
      console.error('Error: --owner, --repo, --task, and --title are required');
      return { success: false, error: 'MISSING_ARGS' };
    }

    const existing = await this._findIssueByTaskId(owner, repo, task);
    if (existing) {
      console.log(`Issue #${existing.number} already exists for task:${task}`);
      console.log(`URL: ${existing.html_url}`);
      this.context.recordIssue(task, existing.number, {
        url: existing.html_url,
        status: existing.state
      });
      return { success: true, issue: existing, alreadyExisted: true };
    }

    const labels = [`task:${task}`];
    if (role) labels.push(`role:${role}`);
    if (risk) labels.push(`risk:${risk}`);
    if (milestone) labels.push(`milestone:${milestone}`);

    let issueBody = body || '';
    if (bodyFile) {
      try {
        issueBody = fs.readFileSync(bodyFile, 'utf8');
      } catch (e) {
        console.error(`Error reading body file: ${e.message}`);
        return { success: false, error: 'BODY_FILE_ERROR' };
      }
    }

    this.context.setProjectInfo(repo, owner);

    const issue = await this.adapter.githubClient.createIssue(owner, repo, {
      title,
      body: issueBody,
      labels
    });

    this.context.recordIssue(task, issue.number, {
      url: issue.html_url,
      status: 'open'
    });

    console.log(`Created Issue #${issue.number}: ${issue.html_url}`);
    return { success: true, issue, alreadyExisted: false };
  }

  async handleCloseCommand(argv) {
    const { owner, repo, task, comment } = argv;

    if (!owner || !repo || !task) {
      console.error('Error: --owner, --repo, and --task are required');
      return { success: false, error: 'MISSING_ARGS' };
    }

    const issues = await this.adapter.githubClient.searchIssues(owner, repo, {
      labels: [`task:${task}`],
      state: 'all'
    });

    if (issues.length === 0) {
      console.error(`No issue found with task:${task}`);
      return { success: false, error: 'NOT_FOUND' };
    }

    if (issues.length > 1) {
      console.warn(`Warning: Multiple issues found with task:${task}, using first`);
    }

    const issue = issues[0];

    if (issue.state === 'closed') {
      console.log(`Issue #${issue.number} already closed`);
      this.context.updateIssueStatus(task, 'closed');
      return { success: true, issue, alreadyClosed: true };
    }

    if (comment) {
      await this.adapter.githubClient.postComment(owner, repo, issue.number, comment);
      console.log(`Posted comment on Issue #${issue.number}`);
    }

    await this.adapter.githubClient.closeIssue(owner, repo, issue.number);

    this.context.updateIssueStatus(task, 'closed');

    console.log(`Closed Issue #${issue.number}`);
    return { success: true, issue, alreadyClosed: false };
  }

  async handleStatusCommand(argv) {
    const { owner, repo, task } = argv;

    if (!task) {
      console.error('Error: --task is required');
      return { success: false, error: 'MISSING_ARGS' };
    }

    const cached = this.context.getIssueByTaskId(task);
    if (cached) {
      console.log(`Issue #${cached.number}`);
      console.log(`  URL: ${cached.url}`);
      console.log(`  Status: ${cached.status}`);
      console.log(`  Created: ${cached.created_at}`);
      if (cached.closed_at) {
        console.log(`  Closed: ${cached.closed_at}`);
      }
      if (cached.commit_sha) {
        console.log(`  Commit: ${cached.commit_sha}`);
      }
      return { success: true, issue: cached, source: 'cache' };
    }

    if (!owner || !repo) {
      console.error('Error: --owner and --repo required when not in cache');
      return { success: false, error: 'MISSING_ARGS' };
    }

    const issues = await this.adapter.githubClient.searchIssues(owner, repo, {
      labels: [`task:${task}`],
      state: 'all'
    });

    if (issues.length === 0) {
      console.error(`No issue found with task:${task}`);
      return { success: false, error: 'NOT_FOUND' };
    }

    const issue = issues[0];
    console.log(`Issue #${issue.number}`);
    console.log(`  URL: ${issue.html_url}`);
    console.log(`  Status: ${issue.state}`);
    console.log(`  Title: ${issue.title}`);
    console.log(`  Created: ${issue.created_at}`);
    if (issue.closed_at) {
      console.log(`  Closed: ${issue.closed_at}`);
    }

    return { success: true, issue, source: 'api' };
  }

  async handleListCommand(argv) {
    const { owner, repo, label, state, taskPrefix } = argv;

    if (!owner || !repo) {
      console.error('Error: --owner and --repo are required');
      return { success: false, error: 'MISSING_ARGS' };
    }

    if (taskPrefix) {
      const cached = this.context.findIssuesByTaskPrefix(taskPrefix);
      if (cached.length > 0) {
        console.log(`Found ${cached.length} issues with prefix ${taskPrefix} (from cache):\n`);
        for (const issue of cached) {
          console.log(`#${issue.number} [${issue.status}] ${issue.taskId}`);
        }
        return { success: true, issues: cached, source: 'cache' };
      }
    }

    const options = {};
    if (label) options.labels = Array.isArray(label) ? label : [label];
    if (state) options.state = state;

    const issues = await this.adapter.githubClient.searchIssues(owner, repo, options);

    console.log(`Found ${issues.length} issues:\n`);

    for (const issue of issues) {
      const taskLabel = issue.labels.find(l => l.name.startsWith('task:'));
      const taskId = taskLabel ? taskLabel.name.slice(5) : 'N/A';
      console.log(`#${issue.number} [${issue.state}] ${taskId}: ${issue.title}`);
    }

    return { success: true, issues, source: 'api' };
  }

  printUsage() {
    console.log(`
Usage: node scripts/process-issue.js <command> [options]

Commands:
  process    Process an existing issue (default)
  create     Create a new issue with task ID
  close      Close an issue by task ID
  status     Get issue status by task ID
  list       List issues with filters

Options:
  --owner <owner>       Repository owner
  --repo <repo>         Repository name
  --issue <number>      Issue number (for process command)
  --task <taskId>       Task ID (e.g., T-042-001)
  --title <title>       Issue title (for create)
  --role <role>         Role label (architect|developer|tester|reviewer|docs|security)
  --risk <level>        Risk level (low|medium|high|critical)
  --milestone <id>      Milestone ID (e.g., M042)
  --body <text>         Issue body text
  --bodyFile <path>     Path to file containing issue body
  --comment <text>      Comment to post (for close)
  --label <label>       Filter by label (for list, can be multiple)
  --state <state>       Filter by state (open|closed|all, for list)
  --taskPrefix <prefix> Filter by task ID prefix (for list)
  --token <token>       GitHub token (or set GITHUB_TOKEN)
  --dry-run             Dry run mode (for process)

Examples:
  # Process existing issue
  node scripts/process-issue.js process --owner Burburton --repo my-project --issue 42

  # Create new issue
  node scripts/process-issue.js create --owner Burburton --repo my-project --task T-042-001 --title "Add createIssue method" --role developer

  # Close issue by task ID
  node scripts/process-issue.js close --owner Burburton --repo my-project --task T-042-001 --comment "✅ Implementation complete"

  # Get issue status
  node scripts/process-issue.js status --task T-042-001

  # List issues
  node scripts/process-issue.js list --owner Burburton --repo my-project --label role:developer --state open
`);
  }
}

async function main() {
  const minimist = require('minimist');
  const argv = minimist(process.argv.slice(2));

  const command = argv._[0] || 'process';

  const processor = new IssueProcessor(getConfig(argv.token, argv['dry-run'] || argv.dryrun));

  const dryRun = argv['dry-run'] || argv.dryrun;

  switch (command) {
    case 'process':
      if (!argv.owner || !argv.repo || !argv.issue) {
        processor.printUsage();
        process.exit(1);
      }

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
        if (!result.success) {
          console.error('Processing failed:', result.error);
          process.exit(1);
        }
        console.log('Processing completed successfully.');
      }
      break;

    case 'create':
      validateToken(argv.token, dryRun);
      const createResult = await processor.handleCreateCommand(argv);
      if (!createResult.success) {
        process.exit(1);
      }
      break;

    case 'close':
      validateToken(argv.token, dryRun);
      const closeResult = await processor.handleCloseCommand(argv);
      if (!closeResult.success) {
        process.exit(1);
      }
      break;

    case 'status':
      const statusResult = await processor.handleStatusCommand(argv);
      if (!statusResult.success) {
        process.exit(1);
      }
      break;

    case 'list':
      validateToken(argv.token, dryRun);
      const listResult = await processor.handleListCommand(argv);
      if (!listResult.success) {
        process.exit(1);
      }
      break;

    case 'help':
    case '--help':
    case '-h':
      processor.printUsage();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      processor.printUsage();
      process.exit(1);
  }
}

function validateToken(token, dryRun) {
  const effectiveToken = token || process.env.GITHUB_TOKEN;
  if (!effectiveToken && !dryRun) {
    console.error('Error: No GitHub token provided. Use --token <token> or set GITHUB_TOKEN environment variable.');
    console.error('For testing without API calls, use --dry-run');
    process.exit(1);
  }
}

function getConfig(token, dryRun) {
  const effectiveToken = token || process.env.GITHUB_TOKEN || (dryRun ? 'mock-token' : null);

  return {
    github_config: {
      api: { base_url: 'https://api.github.com' },
      token: effectiveToken,
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
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { IssueProcessor };