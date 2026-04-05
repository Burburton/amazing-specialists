const fs = require('fs');
const path = require('path');

const DISPATCH_ID_PATTERN = /^gh-issue-([^-]+)-([^-]+)-(\d+)$/;
const NO_ISSUE_ASSOCIATED = 'NO_ISSUE_ASSOCIATED';

function detectIssueAssociation(errorReport, cliParams = {}) {
  const result = {
    success: false,
    source: null,
    error: null
  };

  if (cliParams.issue && cliParams.owner && cliParams.repo) {
    result.success = true;
    result.issue_number = parseInt(cliParams.issue);
    result.owner = cliParams.owner;
    result.repo = cliParams.repo;
    result.source = 'cli_param';
    return result;
  }

  const dispatchInfo = parseDispatchId(errorReport.error_context?.dispatch_id);
  if (dispatchInfo) {
    result.success = true;
    result.issue_number = dispatchInfo.issue_number;
    result.owner = dispatchInfo.owner;
    result.repo = dispatchInfo.repo;
    result.source = 'dispatch_id';
    return result;
  }

  if (errorReport.error_context?.task_id) {
    const issueContextInfo = lookupIssueByTaskId(
      errorReport.error_context.task_id,
      cliParams.owner,
      cliParams.repo
    );
    if (issueContextInfo) {
      result.success = true;
      result.issue_number = issueContextInfo.issue_number;
      result.owner = issueContextInfo.owner;
      result.repo = issueContextInfo.repo;
      result.source = 'issue_context';
      return result;
    }
  }

  result.success = false;
  result.error = NO_ISSUE_ASSOCIATED;
  return result;
}

function parseDispatchId(dispatchId) {
  if (!dispatchId) return null;
  const match = dispatchId.match(DISPATCH_ID_PATTERN);
  if (match) {
    return {
      owner: match[1],
      repo: match[2],
      issue_number: parseInt(match[3])
    };
  }
  return null;
}

function lookupIssueByTaskId(taskId, owner, repo) {
  const issueContextPath = findIssueContextFile();
  if (!issueContextPath) return null;

  try {
    const issueContextContent = fs.readFileSync(issueContextPath, 'utf8');
    const issueContext = JSON.parse(issueContextContent);

    if (issueContext.issues && issueContext.issues[taskId]) {
      const issueInfo = issueContext.issues[taskId];
      return {
        owner: owner || issueContext.owner,
        repo: repo || issueContext.project,
        issue_number: issueInfo.number
      };
    }
  } catch (err) {
    return null;
  }

  return null;
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

  return null;
}

module.exports = {
  detectIssueAssociation,
  parseDispatchId,
  lookupIssueByTaskId,
  NO_ISSUE_ASSOCIATED
};