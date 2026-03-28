/**
 * escalation-handler.js
 * 
 * Handles escalation output to console with interactive prompts
 * for requires_user_decision.
 * 
 * Reference: ADAPTERS.md §Escalation Mapping, io-contract.md §4
 */

'use strict';

const readline = require('readline');

/**
 * Handle escalation by outputting to console.
 * Interactive prompt for requires_user_decision.
 * 
 * @param {Escalation} escalation - Escalation object from io-contract.md §4
 * @returns {Promise<string|null>} User decision if requires_user_decision, null otherwise
 * 
 * @example
 * const handler = require('./escalation-handler');
 * const decision = await handler.handle(escalation);
 * if (decision) {
 *   console.log('User chose:', decision);
 * }
 */
async function handle(escalation) {
  printEscalationHeader(escalation);
  printReasonType(escalation);
  printBlockingPoints(escalation);
  printRecommendedNextSteps(escalation);
  printEvidence(escalation);
  
  if (escalation.requires_user_decision) {
    return await promptUserDecision(escalation);
  }
  
  printImpactWarnings(escalation);
  return null;
}

/**
 * Print escalation header with ID and level.
 * 
 * @param {Escalation} escalation - Escalation object
 */
function printEscalationHeader(escalation) {
  console.log('\n' + '='.repeat(60));
  console.log(`[ESCALATION] ${escalation.escalation_id}`);
  console.log(`Level: ${escalation.level}`);
  console.log(`Role: ${escalation.role}`);
  console.log('='.repeat(60));
}

/**
 * Print reason type and summary.
 * 
 * @param {Escalation} escalation - Escalation object
 */
function printReasonType(escalation) {
  console.log(`\nReason Type: ${escalation.reason_type}`);
  console.log(`\nSummary:\n${escalation.summary}`);
}

/**
 * Print blocking points as a list.
 * 
 * @param {Escalation} escalation - Escalation object
 */
function printBlockingPoints(escalation) {
  if (escalation.blocking_points && escalation.blocking_points.length > 0) {
    console.log('\nBlocking Points:');
    escalation.blocking_points.forEach((point, index) => {
      console.log(`  ${index + 1}. ${point}`);
    });
  }
}

/**
 * Print recommended next steps as a numbered list.
 * 
 * @param {Escalation} escalation - Escalation object
 */
function printRecommendedNextSteps(escalation) {
  if (escalation.recommended_next_steps && escalation.recommended_next_steps.length > 0) {
    console.log('\nRecommended Next Steps:');
    escalation.recommended_next_steps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
  }
}

/**
 * Print evidence (artifacts, logs, failure history).
 * 
 * @param {Escalation} escalation - Escalation object
 */
function printEvidence(escalation) {
  if (!escalation.evidence) return;
  
  if (escalation.evidence.related_artifacts && escalation.evidence.related_artifacts.length > 0) {
    console.log('\nRelated Artifacts:');
    escalation.evidence.related_artifacts.forEach(artifact => {
      console.log(`  - ${artifact}`);
    });
  }
  
  if (escalation.evidence.logs && escalation.evidence.logs.length > 0) {
    console.log('\nLogs (last 5):');
    escalation.evidence.logs.slice(-5).forEach(log => {
      console.log(`  - ${log}`);
    });
  }
  
  if (escalation.evidence.failure_history && escalation.evidence.failure_history.length > 0) {
    console.log('\nFailure History:');
    escalation.evidence.failure_history.forEach(failure => {
      console.log(`  - Attempt ${failure.attempt_number}: ${failure.failure_reason} (${failure.timestamp})`);
    });
  }
}

/**
 * Print impact warnings if continuing or stopping.
 * 
 * @param {Escalation} escalation - Escalation object
 */
function printImpactWarnings(escalation) {
  if (escalation.impact_if_continue) {
    console.log(`\n⚠ Impact if continue: ${escalation.impact_if_continue}`);
  }
  
  if (escalation.impact_if_stop) {
    console.log(`\n⚠ Impact if stop: ${escalation.impact_if_stop}`);
  }
}

/**
 * Prompt user for decision with options.
 * 
 * @param {Escalation} escalation - Escalation object
 * @returns {Promise<string>} User's decision
 */
async function promptUserDecision(escalation) {
  console.log(`\nRequires Decision: ${escalation.required_decision || 'Please choose an action'}`);
  
  if (escalation.options && escalation.options.length > 0) {
    printOptions(escalation.options, escalation.recommended_option);
    return await promptWithOptions(escalation.options);
  }
  
  return await promptSimpleDecision();
}

/**
 * Print available options with pros/cons.
 * 
 * @param {Array} options - Options array
 * @param {string} recommendedOption - Recommended option ID
 */
function printOptions(options, recommendedOption) {
  console.log('\nOptions:');
  options.forEach((option, index) => {
    const recommended = option.option_id === recommendedOption ? ' (RECOMMENDED)' : '';
    console.log(`\n  [${index + 1}] ${option.description}${recommended}`);
    if (option.pros && option.pros.length > 0) {
      console.log('    Pros:');
      option.pros.forEach(pro => console.log(`      + ${pro}`));
    }
    if (option.cons && option.cons.length > 0) {
      console.log('    Cons:');
      option.cons.forEach(con => console.log(`      - ${con}`));
    }
  });
}

/**
 * Prompt user to select from numbered options.
 * 
 * @param {Array} options - Options array
 * @returns {Promise<string>} Selected option_id
 */
async function promptWithOptions(options) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('\nEnter your choice (number): ', (answer) => {
      rl.close();
      
      const choice = parseInt(answer, 10);
      if (choice >= 1 && choice <= options.length) {
        resolve(options[choice - 1].option_id);
      } else {
        console.log('Invalid choice. Defaulting to abort.');
        resolve('abort');
      }
    });
  });
}

/**
 * Prompt simple y/n decision.
 * 
 * @returns {Promise<string>} 'proceed' or 'abort'
 */
async function promptSimpleDecision() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('\nProceed? (y/n): ', (answer) => {
      rl.close();
      
      const decision = answer.toLowerCase().trim();
      if (decision === 'y' || decision === 'yes') {
        resolve('proceed');
      } else {
        resolve('abort');
      }
    });
  });
}

/**
 * Format escalation for console output (non-interactive).
 * Used when escalation needs to be logged without prompting.
 * 
 * @param {Escalation} escalation - Escalation object
 * @returns {string} Formatted string
 */
function formatForConsole(escalation) {
  const lines = [];
  
  lines.push(`[ESCALATION] ${escalation.escalation_id}`);
  lines.push(`Reason: ${escalation.reason_type}`);
  lines.push(`Summary: ${escalation.summary}`);
  
  if (escalation.blocking_points && escalation.blocking_points.length > 0) {
    lines.push('Blocking Points:');
    escalation.blocking_points.forEach((point, i) => {
      lines.push(`  ${i + 1}. ${point}`);
    });
  }
  
  if (escalation.recommended_next_steps && escalation.recommended_next_steps.length > 0) {
    lines.push('Next Steps:');
    escalation.recommended_next_steps.forEach((step, i) => {
      lines.push(`  ${i + 1}. ${step}`);
    });
  }
  
  if (escalation.requires_user_decision) {
    lines.push('⚠ Requires user decision');
  }
  
  return lines.join('\n');
}

module.exports = {
  handle,
  printEscalationHeader,
  printReasonType,
  printBlockingPoints,
  printRecommendedNextSteps,
  printEvidence,
  promptUserDecision,
  formatForConsole
};