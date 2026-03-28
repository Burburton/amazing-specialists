/**
 * Console Reporter
 * 
 * Outputs execution summary, issues_found, and recommendation to console.
 * Implements console output per ADAPTERS.md §Workspace Adapter §Local Repo.
 * 
 * @module console-reporter
 * @see io-contract.md §2
 */

/**
 * Output options
 */
const DEFAULT_OPTIONS = {
  colorize: true,
  verbose: false,
  includeTimestamp: true
};

/**
 * ANSI color codes
 */
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

/**
 * Report execution result to console
 * 
 * Outputs summary, issues_found, and recommendation formatted for readability.
 * 
 * @param {Object} executionResult - Execution Result
 * @param {Object} [options] - Output options
 */
function reportExecutionResult(executionResult, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  printHeader('Execution Result', opts);
  printSummary(executionResult, opts);
  printStatus(executionResult.status, opts);
  printArtifacts(executionResult.artifacts, opts);
  printChangedFiles(executionResult.changed_files, opts);
  printIssues(executionResult.issues_found, opts);
  printRecommendation(executionResult.recommendation, opts);
  printFooter(executionResult, opts);
}

/**
 * Print header section
 */
function printHeader(title, opts) {
  const timestamp = opts.includeTimestamp ? ` [${new Date().toISOString()}]` : '';
  if (opts.colorize) {
    console.log(`${COLORS.bold}${COLORS.cyan}=== ${title} ===${timestamp}${COLORS.reset}`);
  } else {
    console.log(`=== ${title} ===${timestamp}`);
  }
  console.log('');
}

/**
 * Print summary section
 */
function printSummary(result, opts) {
  const label = opts.colorize ? `${COLORS.bold}Summary:${COLORS.reset}` : 'Summary:';
  console.log(label);
  console.log(result.summary || 'No summary provided');
  console.log('');
}

/**
 * Print status with color
 */
function printStatus(status, opts) {
  const statusColors = {
    SUCCESS: COLORS.green,
    SUCCESS_WITH_WARNINGS: COLORS.yellow,
    PARTIAL: COLORS.yellow,
    BLOCKED: COLORS.red,
    FAILED_RETRYABLE: COLORS.red,
    FAILED_ESCALATE: COLORS.red
  };
  
  const color = opts.colorize ? statusColors[status] || COLORS.reset : '';
  const reset = opts.colorize ? COLORS.reset : '';
  
  console.log(`${COLORS.bold}Status:${COLORS.reset} ${color}${status}${reset}`);
  console.log('');
}

/**
 * Print artifacts list
 */
function printArtifacts(artifacts, opts) {
  if (!artifacts || artifacts.length === 0) {
    const label = opts.colorize ? `${COLORS.bold}Artifacts:${COLORS.reset}` : 'Artifacts:';
    console.log(`${label} None`);
    return;
  }
  
  const label = opts.colorize ? `${COLORS.bold}Artifacts (${artifacts.length}):${COLORS.reset}` : `Artifacts (${artifacts.length}):`;
  console.log(label);
  
  for (const artifact of artifacts) {
    const typeColor = opts.colorize ? COLORS.blue : '';
    const reset = opts.colorize ? COLORS.reset : '';
    console.log(`  ${typeColor}[${artifact.artifact_type}]${reset} ${artifact.title}`);
    console.log(`    Path: ${artifact.path || 'N/A'}`);
    if (opts.verbose) {
      console.log(`    ID: ${artifact.artifact_id}`);
      console.log(`    Summary: ${artifact.summary || 'N/A'}`);
    }
  }
  console.log('');
}

/**
 * Print changed files list
 */
function printChangedFiles(changedFiles, opts) {
  if (!changedFiles || changedFiles.length === 0) {
    const label = opts.colorize ? `${COLORS.bold}Changed Files:${COLORS.reset}` : 'Changed Files:';
    console.log(`${label} None`);
    return;
  }
  
  const label = opts.colorize ? `${COLORS.bold}Changed Files (${changedFiles.length}):${COLORS.reset}` : `Changed Files (${changedFiles.length}):`;
  console.log(label);
  
  const typeLabels = {
    added: opts.colorize ? `${COLORS.green}+ added${COLORS.reset}` : '+ added',
    modified: opts.colorize ? `${COLORS.yellow}~ modified${COLORS.reset}` : '~ modified',
    deleted: opts.colorize ? `${COLORS.red}- deleted${COLORS.reset}` : '- deleted',
    renamed: opts.colorize ? `${COLORS.blue}> renamed${COLORS.reset}` : '> renamed'
  };
  
  for (const file of changedFiles) {
    const typeLabel = typeLabels[file.change_type] || file.change_type;
    console.log(`  ${typeLabel}: ${file.path}`);
    if (opts.verbose && file.diff_summary) {
      console.log(`    Diff: ${file.diff_summary}`);
    }
  }
  console.log('');
}

/**
 * Print issues list with severity coloring
 */
function printIssues(issues, opts) {
  if (!issues || issues.length === 0) {
    const label = opts.colorize ? `${COLORS.bold}Issues Found:${COLORS.reset} ${COLORS.green}None${COLORS.reset}` : 'Issues Found: None';
    console.log(label);
    return;
  }
  
  const label = opts.colorize ? `${COLORS.bold}Issues Found (${issues.length}):${COLORS.reset}` : `Issues Found (${issues.length}):`;
  console.log(label);
  
  const severityColors = {
    critical: COLORS.red,
    high: COLORS.red,
    medium: COLORS.yellow,
    low: COLORS.gray
  };
  
  for (const issue of issues) {
    const sevColor = opts.colorize ? severityColors[issue.severity] || COLORS.reset : '';
    const reset = opts.colorize ? COLORS.reset : '';
    console.log(`  ${sevColor}[${issue.severity}]${reset} ${issue.description}`);
    if (issue.recommendation) {
      console.log(`    Recommendation: ${issue.recommendation}`);
    }
  }
  console.log('');
}

/**
 * Print recommendation with appropriate styling
 */
function printRecommendation(recommendation, opts) {
  const recColors = {
    CONTINUE: COLORS.green,
    SEND_TO_TEST: COLORS.blue,
    SEND_TO_REVIEW: COLORS.blue,
    REWORK: COLORS.yellow,
    REPLAN: COLORS.yellow,
    ESCALATE: COLORS.red
  };
  
  const recDescriptions = {
    CONTINUE: 'Continue to next phase',
    SEND_TO_TEST: 'Send to tester for verification',
    SEND_TO_REVIEW: 'Send to reviewer for review',
    REWORK: 'Return to current role for retry',
    REPLAN: 'Return to planning layer',
    ESCALATE: 'Escalate to user/manager'
  };
  
  const color = opts.colorize ? recColors[recommendation] || COLORS.reset : '';
  const reset = opts.colorize ? COLORS.reset : '';
  const desc = recDescriptions[recommendation] || '';
  
  console.log(`${COLORS.bold}Recommendation:${COLORS.reset} ${color}${recommendation}${reset} - ${desc}`);
  console.log('');
}

/**
 * Print footer section
 */
function printFooter(result, opts) {
  console.log(`${COLORS.bold}---${COLORS.reset}`);
  console.log(`Dispatch ID: ${result.dispatch_id || 'N/A'}`);
  console.log(`Role: ${result.role || 'N/A'}`);
  console.log(`Command: ${result.command || 'N/A'}`);
  
  if (result.needs_followup) {
    const label = opts.colorize ? `${COLORS.yellow}Followup Required:${COLORS.reset}` : 'Followup Required:';
    console.log(`${label} ${result.followup_suggestions?.join(', ') || 'N/A'}`);
  }
  console.log('');
}

/**
 * Output brief execution status
 */
function reportBriefStatus(executionResult) {
  const statusIcon = {
    SUCCESS: '✓',
    SUCCESS_WITH_WARNINGS: '⚠',
    PARTIAL: '◐',
    BLOCKED: '✗',
    FAILED_RETRYABLE: '↻',
    FAILED_ESCALATE: '↑'
  };
  
  const icon = statusIcon[executionResult.status] || '?';
  console.log(`${icon} ${executionResult.status}: ${executionResult.summary?.split('\n')[0] || 'No summary'}`);
}

module.exports = {
  reportExecutionResult,
  reportBriefStatus,
  printHeader,
  printSummary,
  printStatus,
  printArtifacts,
  printChangedFiles,
  printIssues,
  printRecommendation,
  printFooter,
  COLORS,
  DEFAULT_OPTIONS
};