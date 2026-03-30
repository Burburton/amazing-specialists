#!/usr/bin/env node

/**
 * OpenCode Plugin Loader
 * 
 * Manage plugin lifecycle: list, install, uninstall
 * Usage: node plugins/loader.js <command> [options]
 * 
 * Commands:
 *   list                          List available plugins
 *   install <plugin-id>           Install plugin to project
 *   uninstall <plugin-id>         Remove plugin from project
 * 
 * Options:
 *   --project <path>              Target project path (default: current directory)
 *   --dry-run                     Preview changes without applying
 *   --force                       Force operation even with warnings
 */

const fs = require('fs');
const path = require('path');

const PLUGINS_ROOT = path.resolve(__dirname);
const REGISTRY_PATH = path.join(PLUGINS_ROOT, 'registry.json');

function parseArgs(args) {
  const result = {
    command: null,
    pluginId: null,
    projectPath: process.cwd(),
    dryRun: false,
    force: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--project') {
      result.projectPath = args[++i] || result.projectPath;
    } else if (arg === '--dry-run') {
      result.dryRun = true;
    } else if (arg === '--force') {
      result.force = true;
    } else if (!arg.startsWith('--')) {
      if (!result.command) {
        result.command = arg;
      } else if (!result.pluginId) {
        result.pluginId = arg;
      }
    }
  }
  
  return result;
}

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error('Error: Plugin registry not found at ' + REGISTRY_PATH);
    process.exit(1);
  }
  
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch (e) {
    console.error('Error: Failed to parse registry.json');
    console.error(e.message);
    process.exit(1);
  }
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

function loadPluginMetadata(pluginId) {
  const pluginDir = path.join(PLUGINS_ROOT, pluginId);
  const pluginJsonPath = path.join(pluginDir, 'plugin.json');
  
  if (!fs.existsSync(pluginJsonPath)) {
    return null;
  }
  
  try {
    return JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
  } catch (e) {
    console.error(`Warning: Failed to parse plugin.json for ${pluginId}`);
    return null;
  }
}

function checkCompatibility(plugin, coreVersion) {
  const range = plugin.compatibility?.core_version || '>=1.0.0';
  
  const minMatch = range.match(/>=?\s*(\d+\.\d+\.\d+)/);
  if (minMatch) {
    const minVersion = minMatch[1];
    if (coreVersion < minVersion) {
      return { compatible: false, reason: `Plugin requires core >=${minVersion}, current is ${coreVersion}` };
    }
  }
  
  return { compatible: true };
}

function getCoreVersion() {
  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return pkg.version || '1.0.0';
    } catch (e) {
      return '1.0.0';
    }
  }
  return '1.0.0';
}

function listCommand() {
  console.log('\n=== Available Plugins ===\n');
  
  const registry = loadRegistry();
  const coreVersion = getCoreVersion();
  
  for (const entry of registry.plugins) {
    const plugin = loadPluginMetadata(entry.id);
    const status = entry.status;
    const statusIcon = status === 'available' ? '✅' : 
                       status === 'installed' ? '✓' : 
                       status === 'planned' ? '📋' : 
                       status === 'deprecated' ? '⚠️' : '?';
    
    console.log(`${statusIcon} ${entry.id} (${status})`);
    
    if (plugin) {
      console.log(`   Name: ${plugin.name}`);
      console.log(`   Description: ${plugin.description}`);
      console.log(`   Skills: ${plugin.skills?.join(', ') || 'none'}`);
      console.log(`   Templates: ${plugin.templates?.length || 0} files`);
      
      const compat = checkCompatibility(plugin, coreVersion);
      if (!compat.compatible) {
        console.log(`   ⚠️ Compatibility: ${compat.reason}`);
      }
    }
    console.log('');
  }
  
  console.log('---');
  console.log('Usage:');
  console.log('  node plugins/loader.js install <plugin-id> --project ./my-project');
  console.log('');
}

function installCommand(pluginId, projectPath, options) {
  console.log(`\n=== Installing Plugin: ${pluginId} ===\n`);
  
  const registry = loadRegistry();
  const entry = registry.plugins.find(p => p.id === pluginId);
  
  if (!entry) {
    console.error(`Error: Plugin '${pluginId}' not found`);
    console.log('Run "list" to see available plugins');
    process.exit(1);
  }
  
  if (entry.status === 'planned') {
    console.error(`Error: Plugin '${pluginId}' is not yet implemented`);
    process.exit(1);
  }
  
  if (entry.status === 'deprecated') {
    console.log('Warning: This plugin is deprecated');
    if (!options.force) {
      console.log('Use --force to install anyway');
      process.exit(1);
    }
  }
  
  const plugin = loadPluginMetadata(pluginId);
  if (!plugin) {
    console.error(`Error: Plugin metadata not found for '${pluginId}'`);
    process.exit(1);
  }
  
  const coreVersion = getCoreVersion();
  const compat = checkCompatibility(plugin, coreVersion);
  if (!compat.compatible) {
    console.error(`Error: ${compat.reason}`);
    console.log('Update core package or use a compatible plugin version');
    process.exit(1);
  }
  
  console.log(`Checking compatibility... OK (core ${coreVersion})`);
  
  const targetDir = path.resolve(projectPath);
  if (!fs.existsSync(targetDir)) {
    console.error(`Error: Target project not found: ${targetDir}`);
    process.exit(1);
  }
  
  const pluginDir = path.join(PLUGINS_ROOT, pluginId);
  
  const copiedTemplates = [];
  if (plugin.templates && plugin.templates.length > 0) {
    console.log(`Copying templates...`);
    const templatesDir = path.join(pluginDir, 'templates');
    const targetTemplatesDir = targetDir;
    
    for (const template of plugin.templates) {
      const srcPath = path.join(templatesDir, template);
      const destPath = path.join(targetTemplatesDir, template);
      
      if (fs.existsSync(srcPath)) {
        if (options.dryRun) {
          console.log(`  [dry-run] Would copy: ${template}`);
        } else {
          fs.copyFileSync(srcPath, destPath);
          console.log(`  Copied: ${template}`);
          copiedTemplates.push(template);
        }
      } else {
        console.log(`  Skipped (not found): ${template}`);
      }
    }
  }
  
  const registeredSkills = [];
  if (plugin.skills && plugin.skills.length > 0) {
    console.log(`Registering skills...`);
    console.log(`  Skills available: ${plugin.skills.join(', ')}`);
    registeredSkills.push(...plugin.skills);
  }
  
  const configuredHooks = [];
  if (plugin.hooks && plugin.hooks.length > 0) {
    console.log(`Configuring hooks...`);
    console.log(`  Hooks configured: ${plugin.hooks.join(', ')}`);
    configuredHooks.push(...plugin.hooks);
  }
  
  if (!options.dryRun) {
    const manifestPath = path.join(targetDir, '.opencode', 'plugin-manifest.json');
    const manifestDir = path.dirname(manifestPath);
    
    if (!fs.existsSync(manifestDir)) {
      fs.mkdirSync(manifestDir, { recursive: true });
    }
    
    const manifest = {
      version: '1.0.0',
      core_version: coreVersion,
      plugins: [
        {
          id: pluginId,
          version: plugin.version,
          installed_at: new Date().toISOString(),
          skills_enabled: registeredSkills,
          templates_copied: copiedTemplates,
          hooks_configured: configuredHooks,
          source_path: `plugins/${pluginId}/`
        }
      ]
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`  Created: .opencode/plugin-manifest.json`);
  }
  
  console.log('\n✓ Installation complete!\n');
  
  if (registeredSkills.length > 0) {
    console.log('Skills available:');
    for (const skill of registeredSkills) {
      console.log(`  - ${skill}`);
    }
    console.log('');
  }
  
  if (copiedTemplates.length > 0) {
    console.log('Templates copied:');
    for (const template of copiedTemplates) {
      console.log(`  - ${template}`);
    }
    console.log('');
  }
  
  if (options.dryRun) {
    console.log('This was a dry-run. No changes were made.');
    console.log('Remove --dry-run to apply changes.');
  }
}

function uninstallCommand(pluginId, projectPath, options) {
  console.log(`\n=== Uninstalling Plugin: ${pluginId} ===\n`);
  
  const targetDir = path.resolve(projectPath);
  const manifestPath = path.join(targetDir, '.opencode', 'plugin-manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.error('Error: No plugin manifest found in project');
    console.log('The project may not have any plugins installed');
    process.exit(1);
  }
  
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.error('Error: Failed to read plugin manifest');
    process.exit(1);
  }
  
  const installedPlugin = manifest.plugins?.find(p => p.id === pluginId);
  if (!installedPlugin) {
    console.error(`Error: Plugin '${pluginId}' is not installed in this project`);
    console.log('Installed plugins:', manifest.plugins?.map(p => p.id).join(', ') || 'none');
    process.exit(1);
  }
  
  console.log(`Removing plugin: ${pluginId}`);
  
  if (installedPlugin.templates_copied && installedPlugin.templates_copied.length > 0) {
    console.log('Removing templates...');
    for (const template of installedPlugin.templates_copied) {
      const templatePath = path.join(targetDir, template);
      if (fs.existsSync(templatePath)) {
        if (options.dryRun) {
          console.log(`  [dry-run] Would remove: ${template}`);
        } else {
          fs.unlinkSync(templatePath);
          console.log(`  Removed: ${template}`);
        }
      }
    }
  }
  
  if (!options.dryRun) {
    manifest.plugins = manifest.plugins.filter(p => p.id !== pluginId);
    
    if (manifest.plugins.length === 0) {
      fs.unlinkSync(manifestPath);
      console.log('Removed: .opencode/plugin-manifest.json');
    } else {
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log('Updated: .opencode/plugin-manifest.json');
    }
  }
  
  console.log('\n✓ Uninstallation complete!\n');
  
  if (options.dryRun) {
    console.log('This was a dry-run. No changes were made.');
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  
  switch (args.command) {
    case 'list':
      listCommand();
      break;
      
    case 'install':
      if (!args.pluginId) {
        console.error('Error: Plugin ID required');
        console.log('Usage: node plugins/loader.js install <plugin-id> [--project <path>]');
        process.exit(1);
      }
      installCommand(args.pluginId, args.projectPath, { dryRun: args.dryRun, force: args.force });
      break;
      
    case 'uninstall':
      if (!args.pluginId) {
        console.error('Error: Plugin ID required');
        console.log('Usage: node plugins/loader.js uninstall <plugin-id> [--project <path>]');
        process.exit(1);
      }
      uninstallCommand(args.pluginId, args.projectPath, { dryRun: args.dryRun });
      break;
      
    default:
      console.log('\n=== OpenCode Plugin Loader ===\n');
      console.log('Commands:');
      console.log('  list                          List available plugins');
      console.log('  install <plugin-id>           Install plugin to project');
      console.log('  uninstall <plugin-id>         Remove plugin from project');
      console.log('');
      console.log('Options:');
      console.log('  --project <path>              Target project path (default: current directory)');
      console.log('  --dry-run                     Preview changes without applying');
      console.log('  --force                       Force operation even with warnings');
      console.log('');
      console.log('Examples:');
      console.log('  node plugins/loader.js list');
      console.log('  node plugins/loader.js install vite-react-ts --project ./my-project');
      console.log('  node plugins/loader.js uninstall vite-react-ts --project ./my-project');
      console.log('');
  }
}

main();