const { detectIssueAssociation, parseDispatchId, lookupIssueByTaskId, NO_ISSUE_ASSOCIATED } = require('./issue-association');
const { formatErrorComment, selectCommentVariant, SEVERITY_BADGES } = require('./error-comment-formatter');
const { publishErrorReport, checkIdempotency, updateIssueContextPublished, ERR_CODES } = require('./publisher');

async function reportToIssue(errorReport, options = {}) {
  const {
    owner,
    repo,
    issue,
    task,
    githubConfig
  } = options;
  
  const cliParams = {
    issue: issue,
    owner: owner,
    repo: repo,
    task: task
  };
  
  const associationResult = detectIssueAssociation(errorReport, cliParams);
  
  if (!associationResult.success) {
    return {
      success: false,
      error: {
        code: ERR_CODES.NO_ISSUE_ASSOCIATED,
        message: 'No Issue associated with error-report',
        suggestion: 'Use --issue CLI parameter to specify Issue number',
        retry_available: false
      }
    };
  }
  
  return await publishErrorReport(
    errorReport,
    associationResult.owner,
    associationResult.repo,
    associationResult.issue_number,
    { githubConfig }
  );
}

module.exports = {
  detectIssueAssociation,
  parseDispatchId,
  lookupIssueByTaskId,
  NO_ISSUE_ASSOCIATED,
  
  formatErrorComment,
  selectCommentVariant,
  SEVERITY_BADGES,
  
  publishErrorReport,
  checkIdempotency,
  updateIssueContextPublished,
  ERR_CODES,
  
  reportToIssue
};

module.exports.IssueAssociationResult = {
  success: 'boolean',
  issue_number: 'number?',
  owner: 'string?',
  repo: 'string?',
  source: "'dispatch_id' | 'issue_context' | 'cli_param'",
  error: 'string?'
};

module.exports.PublishResult = {
  success: 'boolean',
  comment_url: 'string?',
  comment_id: 'number?',
  error: 'Object?'
};

module.exports.ErrorReport = {
  artifact_id: 'string',
  artifact_type: "'error-report'",
  error_context: 'Object',
  error_classification: 'Object',
  error_details: 'Object',
  impact_assessment: 'Object',
  traceability: 'Object',
  resolution_guidance: 'Object',
  metadata: 'Object'
};