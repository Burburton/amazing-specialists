#!/usr/bin/env node

/**
 * OpenCode Template Pack - Install Command
 * 
 * Install or upgrade template files in an existing project.
 * Usage: node install.js [--profile minimal|full] [--upgrade] [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_ROOT = path.resolve(__dirname, '..');
const PACK_ROOT = path.join(TEMPLATE_ROOT, 'pack');

function parseArgs(args) {
  return {
    profile: args.includes('--profile') ? args[args.indexOf('--profile') + 1] : null,
    upgrade: args.includes('--upgrade'),
    dryRun: args.includes('--dry-run')
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

function loadManifest(projectRoot) {
  const manifestPath = path.join(projectRoot, 'template-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function saveManifest(projectRoot, manifest) {
  const manifestPath = path.join(projectRoot, 'template-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }
  return 0;
}

function getPreservedFiles(projectRoot, manifest) {
  const preserved = [];
  if (manifest?.user_extensions?.preserved_files) {
    for (const file of manifest.user_extensions.preserved_files) {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        preserved.push({
          path: file,
          content: fs.readFileSync(filePath, 'utf8')
        });
      }
    }
  }
  return preserved;
}

function restorePreservedFiles(projectRoot, preserved) {
  for (const item of preserved) {
    const filePath = path.join(projectRoot, item.path);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, item.content);
    console.log(`  Preserved: ${item.path}`);
  }
}

function copyDirectory(src, dest, dryRun, changes) {
  if (!fs.existsSync(dest)) {
    if (!dryRun) {
      fs.mkdirSync(dest, { recursive: true });
    }
    changes.added.push(path.relative(process.cwd(), dest));
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, dryRun, changes);
    } else {
      const relativePath = path.relative(process.cwd(), destPath);
      
      if (fs.existsSync(destPath)) {
        const srcContent = fs.readFileSync(srcPath, 'utf8');
        const destContent = fs.readFileSync(destPath, 'utf8');
        
        if (srcContent !== destContent) {
          changes.modified.push(relativePath);
          if (!dryRun) {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      } else {
        changes.added.push(relativePath);
        if (!dryRun) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  
  console.log('\n=== OpenCode Template Pack - Install ===\n');
  
  const projectRoot = findProjectRoot();
  
  if (!projectRoot) {
    console.error('Error: Not an OpenCode template project.');
    console.log('Run `init.js` first to create a new project.');
    process.exit(1);
  }
  
  const manifest = loadManifest(projectRoot);
  const profile = args.profile || manifest?.profile || 'minimal';
  
  console.log(`Project root: ${projectRoot}`);
  console.log(`Profile: ${profile}`);
  console.log(`Dry run: ${args.dryRun}`);
  console.log('');
  
  // Load pack version
  const packVersionPath = path.join(PACK_ROOT, 'pack-version.json');
  const packVersion = JSON.parse(fs.readFileSync(packVersionPath, 'utf8'));
  
  const currentVersion = manifest?.template_version || '0.0.0';
  const latestVersion = packVersion.version;
  
  if (!args.upgrade && compareVersions(latestVersion, currentVersion) <= 0) {
    console.log('Template is already up to date.');
    console.log(`Current version: ${currentVersion}`);
    process.exit(0);
  }
  
  console.log(`Upgrading from ${currentVersion} to ${latestVersion}...`);
  console.log('');
  
  // Preserve user files
  const preserved = getPreservedFiles(projectRoot, manifest);
  console.log(`Preserving ${preserved.length} user files...`);
  
  const changes = { added: [], modified: [], removed: [] };
  
  const profilePath = path.join(PACK_ROOT, profile);
  copyDirectory(profilePath, projectRoot, args.dryRun, changes);
  
  // Restore preserved files
  if (!args.dryRun) {
    restorePreservedFiles(projectRoot, preserved);
    
    // Update manifest
    manifest.template_version = latestVersion;
    manifest.last_upgrade_timestamp = new Date().toISOString();
    manifest.profile = profile;
    manifest.upgrade_history = manifest.upgrade_history || [];
    manifest.upgrade_history.push({
      from_version: currentVersion,
      to_version: latestVersion,
      timestamp: new Date().toISOString()
    });
    saveManifest(projectRoot, manifest);
  }
  
  
  console.log('\n---');
  if (args.dryRun) {
    console.log('Dry run complete. No changes made.');
  } else {
    console.log('✓ Installation complete!');
  }
  console.log(`  Added: ${changes.added.length} files`);
  console.log(`  Modified: ${changes.modified.length} files`);
  console.log(`  Version: ${currentVersion} → ${latestVersion}`);
  console.log('');
}

main();