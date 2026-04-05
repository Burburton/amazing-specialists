const { loadConfig, DEFAULT_CONFIG } = require('./config-loader');
const { shouldAutoReport } = require('./trigger-checker');
const { checkRateLimit, recordReport } = require('./rate-limiter');
const { computeErrorHash, isDuplicate, recordErrorHash } = require('./dedup-manager');

let githubIssueReporter = null;

function setGitHubIssueReporter(reporter) {
  githubIssueReporter = reporter;
}

function getGitHubIssueReporter() {
  if (!githubIssueReporter) {
    try {
      githubIssueReporter = require('../github-issue-reporter');
    } catch (err) {
      return null;
    }
  }
  return githubIssueReporter;
}

async function autoReportError(errorReport, options = {}) {
  const configResult = loadConfig();
  
  if (!configResult.success) {
    return {
      success: false,
      triggered: false,
      reason: 'config_load_failed',
      error: configResult.error
    };
  }
  
  const config = configResult.config;
  
  if (!config.enabled) {
    return {
      success: false,
      triggered: false,
      reason: 'disabled'
    };
  }
  
  const triggerResult = shouldAutoReport(errorReport, config);
  
  if (!triggerResult.should_trigger) {
    return {
      success: false,
      triggered: false,
      reason: triggerResult.reason
    };
  }
  
  const rateLimitResult = checkRateLimit(config);
  
  if (!rateLimitResult.allowed) {
    return {
      success: false,
      triggered: false,
      reason: rateLimitResult.reason
    };
  }
  
  const errorHash = computeErrorHash(errorReport);
  const dedupWindow = config.rate_limit?.dedup_window_minutes || 60;
  
  if (isDuplicate(errorHash, dedupWindow)) {
    return {
      success: false,
      triggered: false,
      reason: 'dedup_window'
    };
  }
  
  const token = process.env[config.github_token_env || 'GITHUB_TOKEN'];
  
  if (!token) {
    console.warn('[auto-error-report] GitHub token not found in environment');
    return {
      success: false,
      triggered: true,
      reason: 'github_token_missing'
    };
  }
  
  const reporter = getGitHubIssueReporter();
  
  if (!reporter) {
    console.warn('[auto-error-report] github-issue-reporter module not found');
    return {
      success: false,
      triggered: true,
      reason: 'reporter_not_available'
    };
  }
  
  try {
    const result = await reporter.reportToIssue(errorReport, {
      owner: config.target_repository?.owner,
      repo: config.target_repository?.repo,
      githubConfig: { token }
    });
    
    if (result.success) {
      recordReport(errorHash, new Date());
      recordErrorHash(errorHash);
      
      return {
        success: true,
        triggered: true,
        issue_url: result.comment_url
      };
    }
    
    if (result.error?.code === 'NO_ISSUE_ASSOCIATED') {
      return {
        success: false,
        triggered: true,
        reason: 'no_issue_associated'
      };
    }
    
    return {
      success: false,
      triggered: true,
      reason: 'publish_failed',
      error: result.error?.message || 'Unknown error'
    };
  } catch (err) {
    console.warn(`[auto-error-report] Failed to publish: ${err.message}`);
    
    return {
      success: false,
      triggered: true,
      reason: 'publish_failed',
      error: err.message
    };
  }
}

async function tryAutoReport(errorReport, options = {}) {
  try {
    return await autoReportError(errorReport, options);
  } catch (err) {
    console.warn(`[auto-error-report] Unexpected error: ${err.message}`);
    
    return {
      success: false,
      triggered: true,
      reason: 'unexpected_error',
      error: err.message
    };
  }
}

module.exports = {
  autoReportError,
  tryAutoReport,
  shouldAutoReport,
  checkRateLimit,
  loadConfig,
  setGitHubIssueReporter,
  getGitHubIssueReporter
};