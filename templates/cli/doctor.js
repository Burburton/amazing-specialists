#!/usr/bin/env node

/**
 * OpenCode Template Pack - Doctor Command
 * 
 * Verify template installation health.
 * Usage: node doctor.js [--verbose] [--fix]
 */

const fs = require('fs');
const path = require('path');

function parseArgs(args) {
  return {
    verbose: args.includes('--verbose'),
    fix: args.includes('--fix')
  };
}

function findProjectRoot() {
  let current = process.cwd();
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'template-manifest.json'))) {
      return current;
    }
    current = path.dirname(current);
  }
  return null;
}

// Check definitions
const CHECKS = [
  {
    id: 'C001',
    name: 'Manifest exists',
    severity: 'critical',
    check: (root) => fs.existsSync(path.join(root, 'template-manifest.json')),
    fix: null
  },
  {
    id: 'C002',
    name: 'Commands directory exists',
    severity: 'critical',
    check: (root) => fs.existsSync(path.join(root, '.opencode', 'commands')),
    fix: null
  },
  {
    id: 'C003',
    name: '5 core commands present',
    severity: 'high',
    check: (root) => {
      const cmds = ['spec-start.md', 'spec-plan.md', 'spec-tasks.md', 'spec-implement.md', 'spec-audit.md'];
      return cmds.every(c => fs.existsSync(path.join(root, '.opencode', 'commands', c)));
    },
    fix: null
  },
  {
    id: 'C004',
    name: 'Skills directory exists',
    severity: 'critical',
    check: (root) => fs.existsSync(path.join(root, '.opencode', 'skills')),
    fix: null
  },
  {
    id: 'C005',
    name: '6 role directories present',
    severity: 'high',
    check: (root) => {
      const roles = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];
      return roles.every(r => fs.existsSync(path.join(root, '.opencode', 'skills', r)));
    },
    fix: null
  },
  {
    id: 'C006',
    name: 'Common skills present',
    severity: 'high',
    check: (root) => fs.existsSync(path.join(root, '.opencode', 'skills', 'common')),
    fix: null
  },
  {
    id: 'C007',
    name: 'Governance files present',
    severity: 'high',
    check: (root) => {
      const files = ['AGENTS.md', 'package-spec.md', 'role-definition.md', 'io-contract.md'];
      return files.every(f => fs.existsSync(path.join(root, f)));
    },
    fix: null
  },
  {
    id: 'C008',
    name: 'Contracts registry present',
    severity: 'medium',
    check: (root) => fs.existsSync(path.join(root, 'contracts', 'pack', 'registry.json')),
    fix: null
  },
  {
    id: 'C009',
    name: 'Manifest is valid JSON',
    severity: 'high',
    check: (root) => {
      try {
        const manifest = JSON.parse(fs.readFileSync(path.join(root, 'template-manifest.json'), 'utf8'));
        return manifest.template_version && manifest.profile;
      } catch {
        return false;
      }
    },
    fix: null
  },
  {
    id: 'C010',
    name: 'Registry is valid JSON',
    severity: 'medium',
    check: (root) => {
      try {
        const registry = JSON.parse(fs.readFileSync(path.join(root, 'contracts', 'pack', 'registry.json'), 'utf8'));
        return registry.contracts && Array.isArray(registry.contracts);
      } catch {
        return false;
      }
    },
    fix: null
  }
];

function runChecks(root, verbose) {
  const results = [];
  
  for (const check of CHECKS) {
    const passed = check.check(root);
    results.push({
      ...check,
      passed
    });
    
    if (verbose || !passed) {
      const status = passed ? '✓' : '✗';
      const severity = check.severity.toUpperCase().padEnd(8);
      console.log(`  ${status} [${severity}] ${check.name}`);
    } else if (passed) {
      console.log(`  ✓ ${check.name}`);
    }
  }
  
  return results;
}

function printSummary(results) {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed);
  
  const criticalFailed = failed.filter(r => r.severity === 'critical');
  const highFailed = failed.filter(r => r.severity === 'high');
  
  console.log('\n---');
  console.log(`Checks: ${passed}/${results.length} passed`);
  
  if (criticalFailed.length > 0) {
    console.log(`\nCritical issues: ${criticalFailed.length}`);
    for (const issue of criticalFailed) {
      console.log(`  - ${issue.name}`);
    }
    return 'fail';
  }
  
  if (highFailed.length > 0) {
    console.log(`\nHigh severity issues: ${highFailed.length}`);
    for (const issue of highFailed) {
      console.log(`  - ${issue.name}`);
    }
    return 'warn';
  }
  
  if (failed.length > 0) {
    console.log(`\nMinor issues: ${failed.length}`);
  }
  
  return 'pass';
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  
  console.log('\n=== OpenCode Template Pack - Doctor ===\n');
  
  const projectRoot = findProjectRoot();
  
  if (!projectRoot) {
    console.error('Error: Not an OpenCode template project.');
    console.log('Run `init.js` first to create a new project.');
    process.exit(1);
  }
  
  console.log(`Project root: ${projectRoot}`);
  console.log('\nRunning checks...\n');
  
  const results = runChecks(projectRoot, args.verbose);
  const status = printSummary(results);
  
  // Update manifest with health status
  const manifestPath = path.join(projectRoot, 'template-manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.validation = {
      last_doctor_run: new Date().toISOString(),
      health_status: status,
      checks_passed: results.filter(r => r.passed).length,
      checks_total: results.length
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }
  
  console.log(`\nHealth status: ${status.toUpperCase()}`);
  
  if (status === 'fail') {
    process.exit(1);
  }
}

main();