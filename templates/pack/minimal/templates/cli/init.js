#!/usr/bin/env node

/**
 * OpenCode Template Pack - Init Command
 * 
 * Initialize a new project from the template pack.
 * Usage: node init.js <target-dir> [--profile minimal|full] [--force]
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_ROOT = path.resolve(__dirname, '..');
const PACK_ROOT = path.join(TEMPLATE_ROOT, 'pack');

function parseArgs(args) {
  const result = {
    targetDir: null,
    profile: 'minimal',
    force: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--profile') {
      result.profile = args[++i] || 'minimal';
    } else if (arg === '--force') {
      result.force = true;
    } else if (!arg.startsWith('--')) {
      result.targetDir = arg;
    }
  }
  
  return result;
}

function validateProfile(profile) {
  if (!['minimal', 'full'].includes(profile)) {
    console.error(`Error: Invalid profile '${profile}'. Must be 'minimal' or 'full'.`);
    process.exit(1);
  }
}

function checkTargetDir(targetDir, force) {
  if (!targetDir) {
    console.error('Error: Target directory is required.');
    console.log('Usage: node init.js <target-dir> [--profile minimal|full] [--force]');
    process.exit(1);
  }
  
  if (fs.existsSync(targetDir)) {
    if (!force) {
      console.error(`Error: Directory '${targetDir}' already exists. Use --force to overwrite.`);
      process.exit(1);
    }
    console.log(`Warning: --force specified, will overwrite existing directory.`);
  }
}

function copyDirectory(src, dest, options = {}) {
  const { excludePatterns = [] } = options;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    
    const relativePath = path.relative(PACK_ROOT, srcPath);
    if (excludePatterns.some(p => relativePath.includes(p))) {
      continue;
    }
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, options);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createManifest(targetDir, profile) {
  const manifestPath = path.join(targetDir, 'template-manifest.json');
  
  const manifest = {
    template_version: '1.0.0',
    profile: profile,
    install_timestamp: new Date().toISOString(),
    last_upgrade_timestamp: null,
    template_source: 'https://github.com/Burburton/amazing_agent_specialist',
    install_options: {
      force: false,
      dry_run: false
    },
    upgrade_history: [],
    user_extensions: {
      custom_skills: [],
      custom_commands: [],
      preserved_files: []
    },
    validation: {
      last_doctor_run: null,
      health_status: 'unknown'
    }
  };
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  Created: template-manifest.json`);
}

function countFiles(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  
  console.log('\n=== OpenCode Template Pack - Init ===\n');
  
  validateProfile(args.profile);
  checkTargetDir(args.targetDir, args.force);
  
  const profilePath = path.join(PACK_ROOT, args.profile);
  
  if (!fs.existsSync(profilePath)) {
    console.error(`Error: Profile '${args.profile}' not found at ${profilePath}`);
    process.exit(1);
  }
  
  console.log(`Profile: ${args.profile}`);
  console.log(`Target: ${path.resolve(args.targetDir)}`);
  console.log('');
  
  
  if (args.force && fs.existsSync(args.targetDir)) {
    console.log('Removing existing directory...');
    fs.rmSync(args.targetDir, { recursive: true });
  }
  
  fs.mkdirSync(args.targetDir, { recursive: true });
  console.log('Copying template files...');
  
  
  copyDirectory(profilePath, args.targetDir);
  
  
  createManifest(args.targetDir, args.profile);
  
  
  const fileCount = countFiles(args.targetDir);
  
  console.log('\n---');
  console.log(`✓ Initialization complete!`);
  console.log(`  Files copied: ${fileCount}`);
  console.log(`  Profile: ${args.profile}`);
  console.log(`  Location: ${path.resolve(args.targetDir)}`);
  console.log('\nNext steps:');
  console.log('  1. cd ' + args.targetDir);
  console.log('  2. Run `node templates/cli/doctor.js` to verify installation');
  console.log('');
}

main();