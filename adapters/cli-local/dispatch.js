#!/usr/bin/env node
/**
 * dispatch.js
 * 
 * CLI entry point for CLI/Local Orchestrator Adapter.
 * Supports both full dispatch and quick subcommand.
 * 
 * Reference: io-contract.md §8, ADAPTERS.md
 */

'use strict';

const argParser = require('./arg-parser');
const dispatchNormalizer = require('./dispatch-normalizer');
const dispatchValidator = require('./dispatch-validator');
const quick = require('./quick');

const config = require('./cli-local.config.json');

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
CLI/Local Orchestrator Adapter

Usage:
  node dispatch.js [options] <title> [goal...]
  node dispatch.js quick --role <role> [options] <title> [goal]

Full Dispatch Options:
  --project <id>       Project ID (required)
  --milestone <id>     Milestone ID (required)
  --task <id>          Task ID (required)
  --role <role>        Role: architect, developer, tester, reviewer, docs, security (required)
  --command <cmd>      Command to execute (required)
  --context <json>     Context object as JSON
  --constraints <items> Constraint strings
  --risk <level>       Risk level: low, medium, high, critical

Quick Subcommand:
  node dispatch.js quick --role <role> [options] <title>

Quick Options:
  --role, -r <role>    Role (required)
  --enhanced, -e       Enable M4 enhancement kit
  --project, -p <id>   Project ID (default: ${quick.QUICK_DEFAULTS.project_id})
  --milestone, -m <id> Milestone ID (default: ${quick.QUICK_DEFAULTS.milestone_id})
  --task, -t <id>      Task ID (default: ${quick.QUICK_DEFAULTS.task_id})
  --risk <level>       Risk level (default: ${quick.QUICK_DEFAULTS.risk_level})

Examples:
  # Full dispatch
  node dispatch.js --project myapp --milestone m1 --task t001 \\
    --role developer --command implement-task "Implement login" "Create auth endpoints"

  # Quick dispatch (simplified)
  node dispatch.js quick --role developer "Implement login feature"

  # Quick dispatch with enhanced mode
  node dispatch.js quick --role developer --enhanced "Implement secure auth"
`);
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }

  try {
    // Check for quick subcommand
    if (args[0] === 'quick') {
      handleQuickCommand(args.slice(1));
    } else {
      handleFullDispatch(args);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Handle quick subcommand
 */
function handleQuickCommand(args) {
  const parsed = quick.parseQuickArgs(args);
  const validation = quick.validateQuickArgs(parsed);

  if (!validation.isValid) {
    console.error('Validation errors:');
    validation.errors.forEach(e => {
      console.error(`  - ${e.message}`);
    });
    process.exit(1);
  }

  const payload = quick.buildDispatchPayload(parsed);
  const suggestions = quick.generateSuggestions(payload);
  const output = quick.formatOutput(payload, suggestions);

  console.log(output);
}

/**
 * Handle full dispatch
 */
function handleFullDispatch(args) {
  const parsed = argParser.parseArgs(args);
  const validation = argParser.validateRequiredFields(parsed);

  if (!validation.isValid) {
    console.error('Validation errors:');
    validation.errors.forEach(e => {
      console.error(`  - ${e.message}`);
    });
    process.exit(1);
  }

  const dispatch = dispatchNormalizer.normalize(parsed);
  const dispatchValidation = dispatchValidator.validate(dispatch);

  if (!dispatchValidation.isValid) {
    console.error('Dispatch validation errors:');
    dispatchValidation.errors.forEach(e => {
      console.error(`  - ${e.message}`);
    });
    process.exit(1);
  }

  console.log('=== Dispatch Payload ===');
  console.log(JSON.stringify(dispatch, null, 2));
  console.log('');
  console.log('Routing to execution...');
  console.log(`  Role: ${dispatch.role}`);
  console.log(`  Command: ${dispatch.command}`);
  console.log(`  Task: ${dispatch.title}`);
}

// Run main
main();