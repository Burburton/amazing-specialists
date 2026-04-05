const fs = require('fs');
const path = require('path');
const GitHubClient = require('../../adapters/github-issue/github-client');
const { detectIssueAssociation, NO_ISSUE_ASSOCIATED } = require('./issue-association');
const { formatErrorComment } = require('./error-comment-formatter');

const MAX_RETRIES = 3;
const ERR_CODES = {
  NO_ISSUE_ASSOCIATED: 'ERR-GIR-001',
  ISSUE_NOT_FOUND: 'ERR-GIR-002',
  PERMISSION_DENIED: 'ERR-GIR-003',
  API_RATE_LIMIT: 'ERR-GIR-004',
  COMMENT_POST_FAILED: 'ERR-GIR-005'
};

async function publishErrorReport(errorReport, owner, repo, issueNumber, options = {}) {
  const result = {
    success: false,
    comment_url: null,
    comment_id: null,
    error: null
  };

  try {
    const githubClient = new GitHubClient(options.githubConfig || {});
    
    const existingCommentId = checkIdempotency(errorReport.artifact_id, issueNumber, owner, repo);
    
    const commentBody = await formatErrorComment(errorReport);
    
    let commentResult;
    if (existingCommentId) {
      commentResult = await githubClient.updateComment(owner, repo, existingCommentId, commentBody);
      result.comment_id = existingCommentId;
      result.comment_url = commentResult.html_url;
    } else {
      commentResult = await githubClient.postComment(owner, repo, issueNumber, commentBody);
      result.comment_id = commentResult.id;
      result.comment_url = commentResult.html_url;
    }
    
    result.success = true;
    
    updateIssueContextPublished(
      errorReport.artifact_id,
      result.comment_id,
      issueNumber,
      owner,
      repo,
      errorReport.error_classification?.severity,
      'published'
    );
    
  } catch (error) {
    result.success = false;
    result.error = classifyError(error);
    
    updateIssueContextPublished(
      errorReport.artifact_id,
      null,
      issueNumber,
      owner,
      repo,
      errorReport.error_classification?.severity,
      'failed'
    );
  }
  
  return result;
}

function checkIdempotency(errorReportId, issueNumber, owner, repo) {
  const issueContextPath = findIssueContextFile();
  if (!issueContextPath) return null;
  
  try {
    const issueContext = JSON.parse(fs.readFileSync(issueContextPath, 'utf8'));
    
    if (issueContext.published_errors && issueContext.published_errors[errorReportId]) {
      const publishedInfo = issueContext.published_errors[errorReportId];
      if (publishedInfo.issue_number === issueNumber && 
          publishedInfo.owner === owner && 
          publishedInfo.repo === repo &&
          publishedInfo.status === 'published') {
        return publishedInfo.comment_id;
      }
    }
  } catch (err) {
    return null;
  }
  
  return null;
}

function updateIssueContextPublished(errorReportId, commentId, issueNumber, owner, repo, severity, status) {
  const issueContextPath = findIssueContextFile();
  if (!issueContextPath) return;
  
  try {
    let issueContext = {};
    if (fs.existsSync(issueContextPath)) {
      issueContext = JSON.parse(fs.readFileSync(issueContextPath, 'utf8'));
    }
    
    if (!issueContext.published_errors) {
      issueContext.published_errors = {};
    }
    
    issueContext.published_errors[errorReportId] = {
      comment_id: commentId,
      issue_number: issueNumber,
      owner: owner,
      repo: repo,
      published_at: new Date().toISOString(),
      severity: severity || 'medium',
      status: status
    };
    
    issueContext.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(issueContextPath, JSON.stringify(issueContext, null, 2));
  } catch (err) {
    console.warn('Failed to update .issue-context.json:', err.message);
  }
}

function findIssueContextFile() {
  const searchPaths = [
    '.issue-context.json',
    path.join(process.cwd(), '.issue-context.json'),
    path.join(process.cwd(), 'specs', '.issue-context.json')
  ];
  
  for (const searchPath of searchPaths) {
    if (fs.existsSync(searchPath)) {
      return searchPath;
    }
  }
  
  return path.join(process.cwd(), '.issue-context.json');
}

function classifyError(error) {
  if (error.message && error.message.includes(NO_ISSUE_ASSOCIATED)) {
    return {
      code: ERR_CODES.NO_ISSUE_ASSOCIATED,
      message: 'No Issue associated with error-report',
      suggestion: 'Use --issue CLI parameter to specify Issue number',
      retry_available: false
    };
  }
  
  if (error.status === 404) {
    return {
      code: ERR_CODES.ISSUE_NOT_FOUND,
      message: 'Issue not found',
      suggestion: 'Check Issue number and repository',
      retry_available: false
    };
  }
  
  if (error.status === 403) {
    if (error.message && error.message.includes('rate limit')) {
      return {
        code: ERR_CODES.API_RATE_LIMIT,
        message: 'GitHub API rate limit exceeded',
        suggestion: 'Wait for rate limit reset or reduce request frequency',
        retry_available: true
      };
    }
    return {
      code: ERR_CODES.PERMISSION_DENIED,
      message: 'Permission denied',
      suggestion: 'Check GITHUB_TOKEN has repo scope',
      retry_available: false
    };
  }
  
  return {
    code: ERR_CODES.COMMENT_POST_FAILED,
    message: error.message || 'Comment posting failed',
    suggestion: 'Retry or check error details',
    retry_available: true
  };
}

module.exports = {
  publishErrorReport,
  checkIdempotency,
  updateIssueContextPublished,
  ERR_CODES
};