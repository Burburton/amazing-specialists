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

const skillLinker = require('./lib/skill-linker');
const skillRegistry = require('./lib/skill-registry');

const PLUGINS_ROOT = path.resolve(__dirname);
const REGISTRY_PATH = path.join(PLUGINS_ROOT, 'registry.json');

function parseArgs(args) {
  const result = {
    command: null,
    pluginId: null,
    skillName: null,
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
      } else if (!result.skillName) {
        result.skillName = arg;
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

function getCommands(pluginId) {
  const plugin = loadPluginMetadata(pluginId);
  if (!plugin) {
    return {};
  }
  return plugin.commands || {};
}

function loadPlugin(pluginId) {
  const plugin = loadPluginMetadata(pluginId);
  if (!plugin) {
    return null;
  }
  return {
    ...plugin,
    commands: plugin.commands || {}
  };
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

function syncSkillsCommand(projectPath, options) {
  console.log('\n=== Syncing Plugin Skills ===\n');
  
  const targetDir = path.resolve(projectPath);
  
  const { registry, created, error } = skillRegistry.loadRegistry(targetDir);
  
  if (error) {
    console.log(`Warning: Registry load error: ${error}`);
    console.log('Creating new registry...');
  }
  
  if (created) {
    console.log('No skill-registry.json found.');
    console.log('Run "install" command first to register plugin skills.');
    console.log('');
    console.log('Usage:');
    console.log('  node plugins/loader.js install <plugin-id> --project <path>');
    return;
  }
  
  const summary = skillRegistry.getSkillsSummary(registry);
  console.log(`Registry: ${summary.total} skills (${summary.enabled} enabled, ${summary.disabled} disabled)`);
  console.log('');
  
  const results = skillLinker.syncSkills(registry, targetDir, { dryRun: options.dryRun });
  
  if (options.dryRun) {
    console.log('[DRY-RUN] Preview of changes:');
  }
  
  if (results.created.length > 0) {
    console.log('\nSkills to be linked:');
    for (const item of results.created) {
      const linkType = item.linkType || (process.platform === 'win32' ? 'junction' : 'symlink');
      console.log(`  + ${item.skillName} (${linkType})`);
      if (options.dryRun) {
        console.log(`    Source: ${item.sourcePath}`);
        console.log(`    Target: ${item.targetPath}`);
      }
    }
  }
  
  if (results.removed.length > 0) {
    console.log('\nSkills to be unlinked:');
    for (const item of results.removed) {
      console.log(`  - ${item.skillName}`);
      if (options.dryRun && item.targetPath) {
        console.log(`    Target: ${item.targetPath}`);
      }
    }
  }
  
  if (results.skipped.length > 0) {
    console.log('\nSkills skipped:');
    for (const item of results.skipped) {
      const icon = item.isCustom ? '~' : '.';
      console.log(`  ${icon} ${item.skillName} - ${item.reason}`);
    }
  }
  
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    for (const item of results.errors) {
      console.log(`  ! ${item.skillName}: ${item.error}`);
      if (item.conflict) {
        console.log(`    Conflict type: ${item.conflict.type}`);
      }
    }
  }
  
  if (!options.dryRun) {
    console.log('\n---');
    console.log(`Linked: ${results.created.length}`);
    console.log(`Unlinked: ${results.removed.length}`);
    console.log(`Skipped: ${results.skipped.length}`);
    console.log(`Errors: ${results.errors.length}`);
  }
  
  console.log('\n' + (options.dryRun ? '[DRY-RUN] No changes applied.' : 'Sync complete!') + '\n');
}

function enableSkillCommand(skillName, projectPath, options) {
  console.log(`\n=== Enabling Skill: ${skillName} ===\n`);
  
  const targetDir = path.resolve(projectPath);
  const { registry, created } = skillRegistry.loadRegistry(targetDir);
  
  if (created) {
    console.error('Error: No skill-registry.json found.');
    console.log('Run "install" command first.');
    process.exit(1);
  }
  
  const result = skillRegistry.enableSkill(registry, skillName);
  
  if (!result.success) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }
  
  if (result.action === 'none') {
    console.log(`Skill "${skillName}" is already enabled.`);
    return;
  }
  
  if (!options.dryRun) {
    skillRegistry.saveRegistry(registry, targetDir);
    console.log('Registry updated.');
    
    console.log('\nSyncing skills...');
    syncSkillsCommand(projectPath, { dryRun: false });
  } else {
    console.log('[DRY-RUN] Would enable and sync.');
  }
}

function disableSkillCommand(skillName, projectPath, options) {
  console.log(`\n=== Disabling Skill: ${skillName} ===\n`);
  
  const targetDir = path.resolve(projectPath);
  const { registry, created } = skillRegistry.loadRegistry(targetDir);
  
  if (created) {
    console.error('Error: No skill-registry.json found.');
    console.log('Run "install" command first.');
    process.exit(1);
  }
  
  const result = skillRegistry.disableSkill(registry, skillName);
  
  if (!result.success) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }
  
  if (result.action === 'none') {
    console.log(`Skill "${skillName}" is already disabled.`);
    return;
  }
  
  if (!options.dryRun) {
    skillRegistry.saveRegistry(registry, targetDir);
    console.log('Registry updated.');
    
    console.log('\nSyncing skills...');
    syncSkillsCommand(projectPath, { dryRun: false });
  } else {
    console.log('[DRY-RUN] Would disable and sync.');
  }
}

function listCommand(projectPath) {
  console.log('\n=== Available Plugins ===\n');
  
  const registry = loadRegistry();
  const coreVersion = getCoreVersion();
  
  const targetDir = path.resolve(projectPath || process.cwd());
  const { registry: skillReg } = skillRegistry.loadRegistry(targetDir);
  
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
      
      if (plugin.skills && plugin.skills.length > 0) {
        const skillStatuses = [];
        for (const skillName of plugin.skills) {
          const skillEntry = skillReg ? skillRegistry.getSkill(skillReg, skillName) : null;
          if (skillEntry) {
            const enabledIcon = skillEntry.enabled ? 'enabled' : 'disabled';
            skillStatuses.push(`${skillName} (${enabledIcon})`);
          } else {
            skillStatuses.push(`${skillName} (not installed)`);
          }
        }
        console.log(`   Skills: ${skillStatuses.join(', ')}`);
      } else {
        console.log(`   Skills: none`);
      }
      
      console.log(`   Templates: ${plugin.templates?.length || 0} files`);
      
      const compat = checkCompatibility(plugin, coreVersion);
      if (!compat.compatible) {
        console.log(`   ⚠️ Compatibility: ${compat.reason}`);
      }
    }
    console.log('');
  }
  
  if (skillReg && skillReg.skills && skillReg.skills.length > 0) {
    const summary = skillRegistry.getSkillsSummary(skillReg);
    console.log('---');
    console.log(`Project Skills Summary: ${summary.total} registered (${summary.enabled} enabled, ${summary.disabled} disabled)`);
    console.log('');
  }
  
  console.log('---');
  console.log('Usage:');
  console.log('  node plugins/loader.js install <plugin-id> --project <path>');
  console.log('  node plugins/loader.js sync-skills --project <path>');
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
    
    if (!options.dryRun) {
      const { registry: skillReg } = skillRegistry.loadRegistry(targetDir);
      const result = skillRegistry.addSkillsFromPlugin(
        skillReg, 
        pluginId, 
        plugin.version, 
        plugin.skills,
        targetDir
      );
      
      skillRegistry.saveRegistry(skillReg, targetDir);
      console.log(`  Created: .opencode/skill-registry.json`);
      
      registeredSkills.push(...result.added);
      if (result.updated.length > 0) {
        console.log(`  Updated skills: ${result.updated.join(', ')}`);
      }
      if (result.errors.length > 0) {
        for (const err of result.errors) {
          console.log(`  ! ${err.skillName}: ${err.errors.join(', ')}`);
        }
      }
    } else {
      console.log(`  [dry-run] Would register: ${plugin.skills.join(', ')}`);
      registeredSkills.push(...plugin.skills);
    }
    
    console.log(`  Skills available: ${plugin.skills.join(', ')}`);
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
    
    let manifest = { version: '1.0.0', core_version: coreVersion, plugins: [] };
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch (e) {}
    }
    
    const existingIndex = manifest.plugins.findIndex(p => p.id === pluginId);
    const newPluginEntry = {
      id: pluginId,
      version: plugin.version,
      installed_at: new Date().toISOString(),
      skills_available: registeredSkills,
      templates_copied: copiedTemplates,
      hooks_configured: configuredHooks,
      source_path: `plugins/${pluginId}/`
    };
    
    if (existingIndex >= 0) {
      manifest.plugins[existingIndex] = newPluginEntry;
    } else {
      manifest.plugins.push(newPluginEntry);
    }
    
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
    console.log('To activate skills, run:');
    console.log('  node plugins/loader.js sync-skills --project ' + projectPath);
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
  
  if (installedPlugin.skills_available && installedPlugin.skills_available.length > 0) {
    console.log('Removing skills from registry...');
    
    if (!options.dryRun) {
      const { registry: skillReg } = skillRegistry.loadRegistry(targetDir);
      const result = skillRegistry.removeSkillsFromPlugin(skillReg, pluginId);
      
      skillRegistry.saveRegistry(skillReg, targetDir);
      
      for (const skill of result.removed) {
        console.log(`  Removed skill: ${skill}`);
      }
      
      const skillTargetDir = path.join(targetDir, '.opencode', 'skills');
      for (const skill of result.removed) {
        skillLinker.removeSkillLink(skill, skillTargetDir);
        console.log(`  Unlinked: ${skill}`);
      }
    } else {
      for (const skill of installedPlugin.skills_available) {
        console.log(`  [dry-run] Would remove: ${skill}`);
      }
    }
  }
  
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
      
      const skillRegPath = path.join(targetDir, '.opencode', 'skill-registry.json');
      if (fs.existsSync(skillRegPath)) {
        const { registry: skillReg } = skillRegistry.loadRegistry(targetDir);
        if (!skillReg.skills || skillReg.skills.length === 0) {
          fs.unlinkSync(skillRegPath);
          console.log('Removed: .opencode/skill-registry.json');
        }
      }
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
      listCommand(args.projectPath);
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
      
    case 'sync-skills':
      syncSkillsCommand(args.projectPath, { dryRun: args.dryRun });
      break;
      
    case 'enable-skill':
      if (!args.pluginId) {
        console.error('Error: Skill name required');
        console.log('Usage: node plugins/loader.js enable-skill <skill-name> [--project <path>]');
        process.exit(1);
      }
      enableSkillCommand(args.pluginId, args.projectPath, { dryRun: args.dryRun });
      break;
      
    case 'disable-skill':
      if (!args.pluginId) {
        console.error('Error: Skill name required');
        console.log('Usage: node plugins/loader.js disable-skill <skill-name> [--project <path>]');
        process.exit(1);
      }
      disableSkillCommand(args.pluginId, args.projectPath, { dryRun: args.dryRun });
      break;
      
    default:
      console.log('\n=== OpenCode Plugin Loader ===\n');
      console.log('Commands:');
      console.log('  list                          List available plugins');
      console.log('  install <plugin-id>           Install plugin to project');
      console.log('  uninstall <plugin-id>         Remove plugin from project');
      console.log('  sync-skills                   Sync plugin skills to .opencode/skills/');
      console.log('  enable-skill <skill-name>     Enable a plugin skill');
      console.log('  disable-skill <skill-name>    Disable a plugin skill');
      console.log('');
      console.log('Options:');
      console.log('  --project <path>              Target project path (default: current directory)');
      console.log('  --dry-run                     Preview changes without applying');
      console.log('  --force                       Force operation even with warnings');
      console.log('');
      console.log('Examples:');
      console.log('  node plugins/loader.js list');
      console.log('  node plugins/loader.js install vite-react-ts --project ./my-project');
      console.log('  node plugins/loader.js sync-skills --project ./my-project');
      console.log('  node plugins/loader.js enable-skill vite-setup --project ./my-project');
      console.log('  node plugins/loader.js disable-skill css-module-test --project ./my-project');
      console.log('');
  }
}

main();

module.exports = {
  loadPluginMetadata,
  loadPlugin,
  getCommands,
  checkCompatibility,
  loadRegistry
};