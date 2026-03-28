/**
 * Escalation Output Handler
 * 
 * Outputs escalation details to console.
 * Implements escalation output per ADAPTERS.md §Workspace Adapter §Local Repo.
 * 
 * @module escalation-output-handler
 * @see io-contract.md §4
 */

const consoleReporter = require('./console-reporter');
const COLORS = consoleReporter.COLORS;

/**
 * Default options
 */
const DEFAULT_OPTIONS = {
  colorize: true,
  interactive: true,
  includeTimestamp: true
};

/**
 * Handle escalation output to console
 * 
 * Outputs escalation information formatted for readability.
 * Integrates with console-reporter.js for consistent formatting.
 * 
 * @param {Object} escalation - Escalation object from io-contract.md §4
 * @param {Object} [options] - Output options
 */
function handleEscalationOutput(escalation, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  printEscalationHeader(escalation, opts);
  printEscalationSummary(escalation, opts);
  printBlockingPoints(escalation.blocking_points, opts);
  printReasonType(escalation.reason_type, opts);
  printAttemptedActions(escalation.attempted_actions, opts);
  printRecommendedSteps(escalation.recommended_next_steps, opts);
  printOptions(escalation.options, opts);
  
  if (escalation.requires_user_decision && opts.interactive) {
    promptUserDecision(escalation, opts);
  }
  
  printEscalationFooter(escalation, opts);
}

/**
 * Print escalation header
 */
function printEscalationHeader(escalation, opts) {
  const timestamp = opts.includeTimestamp ? ` [${new Date().toISOString()}]` : '';
  const color = opts.colorize ? `${COLORS.bold}${COLORS.red}` : '';
  const reset = opts.colorize ? COLORS.reset : '';
  
  console.log(`${color}=== ESCALATION ===${timestamp}${reset}`);
  console.log('');
  console.log(`Escalation ID: ${escalation.escalation_id || 'N/A'}`);
  console.log(`Dispatch ID: ${escalation.dispatch_id || 'N/A'}`);
  console.log(`Level: ${escalation.level || 'N/A'}`);
  console.log(`Role: ${escalation.role || 'N/A'}`);
  console.log('');
}

/**
 * Print escalation summary
 */
function printEscalationSummary(escalation, opts) {
  const label = opts.colorize ? `${COLORS.bold}Summary:${COLORS.reset}` : 'Summary:';
  console.log(label);
  console.log(escalation.summary || 'No summary provided');
  console.log('');
}

/**
 * Print blocking points
 */
function printBlockingPoints(points, opts) {
  if (!points || points.length === 0) {
    console.log('Blocking Points: None');
    return;
  }
  
  const label = opts.colorize ? `${COLORS.bold}${COLORS.red}Blocking Points:${COLORS.reset}` : 'Blocking Points:';
  console.log(label);
  
  for (let i = 0; i < points.length; i++) {
    const bullet = opts.colorize ? `${COLORS.red}✗${COLORS.reset}` : '✗';
    console.log(`  ${bullet} ${points[i]}`);
  }
  console.log('');
}

/**
 * Print reason type with description
 */
function printReasonType(reasonType, opts) {
  const reasonDescriptions = {
    MISSING_CONTEXT: 'Required context information is missing',
    CONFLICTING_CONSTRAINTS: 'Constraints conflict with each other',
    HIGH_RISK_CHANGE: 'Change involves high-risk modifications',
    REPEATED_FAILURE: 'Multiple attempts have failed',
    OUT_OF_SCOPE_REQUEST: 'Request exceeds defined scope',
    TOOLING_BLOCKER: 'Required tooling is unavailable',
    AMBIGUOUS_GOAL: 'Goal definition is unclear',
    UNRESOLVED_TRADEOFF: 'Trade-off decision required'
  };
  
  const color = opts.colorize ? `${COLORS.yellow}` : '';
  const reset = opts.colorize ? COLORS.reset : '';
  
  console.log(`${COLORS.bold}Reason:${COLORS.reset} ${color}${reasonType}${reset}`);
  console.log(`  ${reasonDescriptions[reasonType] || 'Unknown reason type'}`);
  console.log('');
}

/**
 * Print attempted actions
 */
function printAttemptedActions(actions, opts) {
  if (!actions || actions.length === 0) {
    console.log('Attempted Actions: None');
    return;
  }
  
  const label = opts.colorize ? `${COLORS.bold}Attempted Actions:${COLORS.reset}` : 'Attempted Actions:';
  console.log(label);
  
  for (const action of actions) {
    const bullet = opts.colorize ? `${COLORS.gray}→${COLORS.reset}` : '→';
    console.log(`  ${bullet} ${action}`);
  }
  console.log('');
}

/**
 * Print recommended next steps
 */
function printRecommendedSteps(steps, opts) {
  if (!steps || steps.length === 0) {
    console.log('Recommended Next Steps: None');
    return;
  }
  
  const label = opts.colorize ? `${COLORS.bold}${COLORS.green}Recommended Next Steps:${COLORS.reset}` : 'Recommended Next Steps:';
  console.log(label);
  
  for (let i = 0; i < steps.length; i++) {
    const bullet = opts.colorize ? `${COLORS.green}✓${COLORS.reset}` : '✓';
    console.log(`  ${bullet} ${steps[i]}`);
  }
  console.log('');
}

/**
 * Print available options if provided
 */
function printOptions(options, opts) {
  if (!options || options.length === 0) {
    return;
  }
  
  const label = opts.colorize ? `${COLORS.bold}Available Options:${COLORS.reset}` : 'Available Options:';
  console.log(label);
  
  for (const option of options) {
    const recommended = option.option_id === options.recommended_option;
    const marker = recommended ? (opts.colorize ? `${COLORS.green}*${COLORS.reset}` : '*') : ' ';
    console.log(`  ${marker} Option ${option.option_id}: ${option.description}`);
    
    if (option.pros && option.pros.length > 0) {
      console.log(`    Pros: ${option.pros.join(', ')}`);
    }
    if (option.cons && option.cons.length > 0) {
      console.log(`    Cons: ${option.cons.join(', ')}`);
    }
  }
  console.log('');
}

/**
 * Prompt user for decision (interactive mode)
 */
function promptUserDecision(escalation, opts) {
  const color = opts.colorize ? `${COLORS.bold}${COLORS.yellow}` : '';
  const reset = opts.colorize ? COLORS.reset : '';
  
  console.log(`${color}⚠ USER DECISION REQUIRED${reset}`);
  console.log(`Decision needed: ${escalation.required_decision || 'Please review and decide'}`);
  console.log('');
  console.log('Impact if continue:', escalation.impact_if_continue || 'Unknown');
  console.log('Impact if stop:', escalation.impact_if_stop || 'Unknown');
  console.log('');
}

/**
 * Print escalation footer
 */
function printEscalationFooter(escalation, opts) {
  console.log(`${COLORS.bold}---${COLORS.reset}`);
  console.log(`Created: ${escalation.created_at || 'N/A'}`);
  console.log(`Created by: ${escalation.created_by || 'N/A'}`);
  console.log('');
}

/**
 * Output brief escalation notice
 */
function reportBriefEscalation(escalation) {
  console.log(`↑ ESCALATION [${escalation.level}] ${escalation.reason_type}: ${escalation.summary?.split('\n')[0] || 'See details'}`);
}

module.exports = {
  handleEscalationOutput,
  reportBriefEscalation,
  printEscalationHeader,
  printEscalationSummary,
  printBlockingPoints,
  printReasonType,
  printAttemptedActions,
  printRecommendedSteps,
  printOptions,
  promptUserDecision,
  printEscalationFooter,
  DEFAULT_OPTIONS
};