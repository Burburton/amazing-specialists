#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { reportToIssue } = require('../lib/github-issue-reporter');

function parseArgs(args) {
  const params = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--error-report' || arg === '-e') {
      params.errorReport = args[++i];
    } else if (arg === '--owner' || arg === '-o') {
      params.owner = args[++i];
    } else if (arg === '--repo' || arg === '-r') {
      params.repo = args[++i];
    } else if (arg === '--issue' || arg === '-i') {
      params.issue = parseInt(args[++i]);
    } else if (arg === '--task' || arg === '-t') {
      params.task = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      params.help = true;
    }
  }
  
  return params;
}

function printHelp() {
  console.log(`
Usage: node scripts/report-error-to-issue.js [options]

Options:
  --error-report, -e <path>   Path to error-report artifact (JSON/YAML) [required]
  --owner, -o <owner>         GitHub repository owner [required]
  --repo, -r <repo>           GitHub repository name [required]
  --issue, -i <number>        Issue number (optional, overrides dispatch_id)
  --task, -t <task-id>        Task ID for .issue-context.json lookup (optional)
  --help, -h                  Show this help message

Examples:
  # Publish error-report to Issue
  node scripts/report-error-to-issue.js \\
    --error-report specs/044/artifacts/error-report-example.json \\
    --owner anomalyco \\
    --repo amazing-specialists \\
    --issue 42

  # Use Task ID to find Issue
  node scripts/report-error-to-issue.js \\
    --error-report specs/044/artifacts/error-report-example.json \\
    --task T-044-003 \\
    --owner anomalyco \\
    --repo amazing-specialists

Environment Variables:
  GITHUB_TOKEN                GitHub token with repo scope (required)
`);
}

function readErrorReport(filePath) {
  const absolutePath = path.resolve(filePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Error report file not found: ${absolutePath}`);
  }
  
  const content = fs.readFileSync(absolutePath, 'utf8');
  
  if (filePath.endsWith('.json')) {
    return JSON.parse(content);
  } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
    return yaml.load(content);
  } else {
    try {
      return JSON.parse(content);
    } catch (jsonError) {
      try {
        return yaml.load(content);
      } catch (yamlError) {
        throw new Error('File is not valid JSON or YAML format');
      }
    }
  }
}

function formatOutput(result) {
  if (result.success) {
    console.log('\n✅ Error report published successfully!\n');
    console.log(`Comment URL: ${result.comment_url}`);
    console.log(`Comment ID: ${result.comment_id}`);
    console.log('');
  } else {
    console.error('\n❌ Failed to publish error report\n');
    console.error(`Error Code: ${result.error.code}`);
    console.error(`Message: ${result.error.message}`);
    console.error(`Suggestion: ${result.error.suggestion}`);
    console.error(`Retry Available: ${result.error.retry_available}`);
    console.error('');
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const params = parseArgs(args);
  
  if (params.help || args.length === 0) {
    printHelp();
    process.exit(0);
  }
  
  if (!params.errorReport) {
    console.error('Error: --error-report parameter is required');
    console.error('Use --help for usage information');
    process.exit(1);
  }
  
  if (!params.owner || !params.repo) {
    console.error('Error: --owner and --repo parameters are required');
    console.error('Use --help for usage information');
    process.exit(1);
  }
  
  if (!process.env.GITHUB_TOKEN) {
    console.error('Error: GITHUB_TOKEN environment variable not set');
    console.error('Please set GITHUB_TOKEN with repo scope');
    process.exit(1);
  }
  
  try {
    console.log(`Reading error report from: ${params.errorReport}`);
    const errorReport = readErrorReport(params.errorReport);
    
    console.log(`Publishing to ${params.owner}/${params.repo}...`);
    const result = await reportToIssue(errorReport, {
      owner: params.owner,
      repo: params.repo,
      issue: params.issue,
      task: params.task
    });
    
    formatOutput(result);
  } catch (error) {
    console.error('\n❌ Unexpected error occurred:\n');
    console.error(error.message);
    console.error('');
    process.exit(1);
  }
}

main();