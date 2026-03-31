/**
 * Skill Linker - Cross-platform symlink/junction management
 * 
 * Creates and manages symbolic links for plugin skills to .opencode/skills/
 * 
 * Windows: Uses junction (directory link, no admin required)
 * Unix: Uses symlink
 */

const fs = require('fs');
const path = require('path');

const CORE_SKILLS = [
  'artifact-reading',
  'context-summarization',
  'failure-analysis',
  'execution-reporting',
  'retry-strategy',
  'requirement-to-design',
  'module-boundary-design',
  'tradeoff-analysis',
  'feature-implementation',
  'bugfix-workflow',
  'code-change-selfcheck',
  'unit-test-design',
  'regression-analysis',
  'edge-case-matrix',
  'code-review-checklist',
  'spec-implementation-diff',
  'reject-with-actionable-feedback',
  'readme-sync',
  'changelog-writing',
  'issue-status-sync',
  'auth-and-permission-review',
  'input-validation-review',
  'interface-contract-design',
  'migration-planning',
  'refactor-safely',
  'dependency-minimization',
  'integration-test-design',
  'flaky-test-diagnosis',
  'performance-test-design',
  'benchmark-analysis',
  'load-test-orchestration',
  'performance-regression-analysis',
  'maintainability-review',
  'risk-review',
  'architecture-doc-sync',
  'user-guide-update',
  'secret-handling-review',
  'dependency-risk-review'
];

function isCoreSkill(skillName) {
  return CORE_SKILLS.includes(skillName);
}

function validateSkillName(skillName) {
  const pattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!pattern.test(skillName)) {
    return {
      valid: false,
      reason: `Skill name "${skillName}" must match pattern: lowercase alphanumeric with hyphens`
    };
  }
  if (skillName.length < 1 || skillName.length > 64) {
    return {
      valid: false,
      reason: `Skill name "${skillName}" must be 1-64 characters`
    };
  }
  return { valid: true };
}

function checkConflict(skillName, targetDir, currentPluginId = null) {
  if (isCoreSkill(skillName)) {
    return {
      hasConflict: true,
      type: 'core_skill',
      message: `Skill "${skillName}" conflicts with core skill. Rename plugin skill to avoid conflict.`
    };
  }
  
  const skillPath = path.join(targetDir, skillName);
  if (fs.existsSync(skillPath)) {
    const existingRegistryPath = path.join(path.dirname(targetDir), 'skill-registry.json');
    if (fs.existsSync(existingRegistryPath)) {
      try {
        const registry = JSON.parse(fs.readFileSync(existingRegistryPath, 'utf8'));
        const existingSkill = registry.skills?.find(s => s.name === skillName);
        if (existingSkill && existingSkill.plugin_id) {
          if (currentPluginId && existingSkill.plugin_id === currentPluginId) {
            return { hasConflict: false };
          }
          return {
            hasConflict: true,
            type: 'duplicate',
            message: `Skill "${skillName}" already provided by plugin "${existingSkill.plugin_id}"`
          };
        }
      } catch (e) {
        return {
          hasConflict: true,
          type: 'unknown',
          message: `Skill "${skillName}" already exists at ${skillPath}`
        };
      }
    }
    
    if (!fs.existsSync(existingRegistryPath)) {
      return {
        hasConflict: true,
        type: 'custom_skill',
        message: `Skill "${skillName}" appears to be a user custom skill. Plugin skills cannot override custom skills.`
      };
    }
  }
  
  return { hasConflict: false };
}

function createSkillLink(skillName, sourceDir, targetDir, options = {}) {
  const validation = validateSkillName(skillName);
  if (!validation.valid) {
    return { success: false, error: validation.reason };
  }
  
  const conflict = checkConflict(skillName, targetDir, options.pluginId);
  if (conflict.hasConflict) {
    return { success: false, error: conflict.message, conflict };
  }
  
  const sourcePath = path.resolve(sourceDir);
  const skillTargetDir = path.join(targetDir, skillName);
  
  if (!fs.existsSync(sourcePath)) {
    return { success: false, error: `Source directory not found: ${sourcePath}` };
  }
  
  const skillMdPath = path.join(sourcePath, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    return { success: false, error: `SKILL.md not found in source: ${skillMdPath}` };
  }
  
  if (options.dryRun) {
    return {
      success: true,
      dryRun: true,
      action: 'create',
      skillName,
      sourcePath,
      targetPath: skillTargetDir,
      platform: process.platform
    };
  }
  
  if (fs.existsSync(skillTargetDir)) {
    try {
      if (process.platform === 'win32') {
        fs.rmSync(skillTargetDir, { recursive: true });
      } else {
        const skillMdLink = path.join(skillTargetDir, 'SKILL.md');
        if (fs.existsSync(skillMdLink)) {
          fs.unlinkSync(skillMdLink);
        }
        if (fs.existsSync(skillTargetDir) && fs.readdirSync(skillTargetDir).length === 0) {
          fs.rmdirSync(skillTargetDir);
        }
      }
    } catch (e) {
      return { success: false, error: `Failed to remove existing link: ${e.message}` };
    }
  }
  
  try {
    const parentDir = path.dirname(skillTargetDir);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    
    if (process.platform === 'win32') {
      fs.symlinkSync(sourcePath, skillTargetDir, 'junction');
    } else {
      if (!fs.existsSync(skillTargetDir)) {
        fs.mkdirSync(skillTargetDir, { recursive: true });
      }
      const targetMdPath = path.join(skillTargetDir, 'SKILL.md');
      fs.symlinkSync(skillMdPath, targetMdPath);
    }
    
    return {
      success: true,
      action: 'create',
      skillName,
      sourcePath,
      targetPath: skillTargetDir,
      platform: process.platform,
      linkType: process.platform === 'win32' ? 'junction' : 'symlink'
    };
  } catch (e) {
    return { success: false, error: `Failed to create link: ${e.message}` };
  }
}

function removeSkillLink(skillName, targetDir, options = {}) {
  const skillTargetDir = path.join(targetDir, skillName);
  
  if (!fs.existsSync(skillTargetDir)) {
    return { success: true, action: 'none', skillName, reason: 'Link does not exist' };
  }
  
  if (options.dryRun) {
    return {
      success: true,
      dryRun: true,
      action: 'remove',
      skillName,
      targetPath: skillTargetDir
    };
  }
  
  try {
    if (process.platform === 'win32') {
      fs.rmSync(skillTargetDir, { recursive: true });
    } else {
      const skillMdLink = path.join(skillTargetDir, 'SKILL.md');
      if (fs.existsSync(skillMdLink) && fs.lstatSync(skillMdLink).isSymbolicLink()) {
        fs.unlinkSync(skillMdLink);
      }
      if (fs.existsSync(skillTargetDir) && fs.readdirSync(skillTargetDir).length === 0) {
        fs.rmdirSync(skillTargetDir);
      }
    }
    
    return {
      success: true,
      action: 'remove',
      skillName,
      targetPath: skillTargetDir
    };
  } catch (e) {
    return { success: false, error: `Failed to remove link: ${e.message}` };
  }
}

function validateLink(skillName, targetDir) {
  const skillTargetDir = path.join(targetDir, skillName);
  const skillMdPath = path.join(skillTargetDir, 'SKILL.md');
  
  if (!fs.existsSync(skillTargetDir)) {
    return { valid: false, reason: 'Link directory does not exist' };
  }
  
  if (!fs.existsSync(skillMdPath)) {
    return { valid: false, reason: 'SKILL.md does not exist at link target' };
  }
  
  if (process.platform === 'win32') {
    try {
      const stats = fs.lstatSync(skillTargetDir);
      if (!stats.isSymbolicLink()) {
        return { valid: false, reason: 'Target is not a junction' };
      }
    } catch (e) {
      return { valid: false, reason: `Failed to check link status: ${e.message}` };
    }
  } else {
    try {
      const stats = fs.lstatSync(skillMdPath);
      if (!stats.isSymbolicLink()) {
        return { valid: false, reason: 'SKILL.md is not a symlink' };
      }
    } catch (e) {
      return { valid: false, reason: `Failed to check link status: ${e.message}` };
    }
  }
  
  let content;
  try {
    content = fs.readFileSync(skillMdPath, 'utf8');
  } catch (e) {
    return { valid: false, reason: `Failed to read SKILL.md: ${e.message}` };
  }
  
  if (!content || content.trim().length === 0) {
    return { valid: false, reason: 'SKILL.md is empty' };
  }
  
  return { valid: true, skillName, path: skillMdPath };
}

function getLinkInfo(skillName, targetDir) {
  const skillTargetDir = path.join(targetDir, skillName);
  
  if (!fs.existsSync(skillTargetDir)) {
    return { exists: false };
  }
  
  const info = {
    exists: true,
    path: skillTargetDir,
    isLink: false,
    linkType: null,
    targetPath: null
  };
  
  try {
    const stats = fs.lstatSync(skillTargetDir);
    
    if (process.platform === 'win32') {
      info.isLink = stats.isSymbolicLink();
      info.linkType = info.isLink ? 'junction' : 'directory';
      if (info.isLink) {
        info.targetPath = fs.readlinkSync(skillTargetDir);
      }
    } else {
      const skillMdPath = path.join(skillTargetDir, 'SKILL.md');
      if (fs.existsSync(skillMdPath)) {
        const mdStats = fs.lstatSync(skillMdPath);
        info.isLink = mdStats.isSymbolicLink();
        info.linkType = info.isLink ? 'symlink' : 'file';
        if (info.isLink) {
          info.targetPath = fs.readlinkSync(skillMdPath);
        }
      }
    }
  } catch (e) {
    info.error = e.message;
  }
  
  return info;
}

function syncSkills(registry, projectPath, options = {}) {
  const targetDir = path.join(projectPath, '.opencode', 'skills');
  const pluginsRoot = options.pluginsRoot || path.resolve(__dirname, '..');
  const results = {
    created: [],
    removed: [],
    skipped: [],
    errors: []
  };
  
  if (!registry.skills || !Array.isArray(registry.skills)) {
    return { ...results, error: 'Invalid registry: no skills array' };
  }
  
  const existingSkills = new Set();
  if (fs.existsSync(targetDir)) {
    const dirs = fs.readdirSync(targetDir);
    for (const dir of dirs) {
      const skillPath = path.join(targetDir, dir);
      if (fs.statSync(skillPath).isDirectory()) {
        existingSkills.add(dir);
      }
    }
  }
  
  const registrySkillNames = new Set(registry.skills.map(s => s.name));
  
  for (const skill of registry.skills) {
    const validationResult = validateSkillName(skill.name);
    if (!validationResult.valid) {
      results.errors.push({
        skillName: skill.name,
        error: validationResult.reason
      });
      continue;
    }
    
    if (skill.enabled) {
      const sourceDir = path.dirname(skill.source);
      let sourcePath;
      
      if (path.isAbsolute(skill.source)) {
        sourcePath = path.dirname(skill.source);
      } else {
        const possiblePaths = [
          path.join(projectPath, sourceDir),
          path.join(pluginsRoot, '..', sourceDir),
          path.join(pluginsRoot, sourceDir)
        ];
        
        sourcePath = possiblePaths.find(p => {
          const skillMd = path.join(p, 'SKILL.md');
          return fs.existsSync(skillMd);
        });
        
        if (!sourcePath) {
          sourcePath = path.join(projectPath, sourceDir);
        }
      }
      
      const result = createSkillLink(skill.name, sourcePath, targetDir, { 
        ...options, 
        pluginId: skill.plugin_id 
      });
      
      if (result.success) {
        if (result.dryRun) {
          results.created.push(result);
        } else {
          results.created.push({
            skillName: skill.name,
            sourcePath: sourcePath,
            targetPath: path.join(targetDir, skill.name),
            linkType: result.linkType
          });
        }
      } else {
        results.errors.push({
          skillName: skill.name,
          error: result.error,
          conflict: result.conflict
        });
      }
    } else {
      const result = removeSkillLink(skill.name, targetDir, options);
      
      if (result.success) {
        if (result.action === 'remove') {
          results.removed.push({
            skillName: skill.name,
            targetPath: path.join(targetDir, skill.name),
            dryRun: result.dryRun
          });
        } else {
          results.skipped.push({
            skillName: skill.name,
            reason: 'Already unlinked'
          });
        }
      } else {
        results.errors.push({
          skillName: skill.name,
          error: result.error
        });
      }
    }
  }
  
  for (const existingSkill of existingSkills) {
    if (!registrySkillNames.has(existingSkill)) {
      const linkInfo = getLinkInfo(existingSkill, targetDir);
      
      results.skipped.push({
        skillName: existingSkill,
        reason: linkInfo.isLink 
          ? 'Not in registry - plugin skill link preserved' 
          : 'Not in registry - user custom skill preserved',
        isCustom: !linkInfo.isLink
      });
    }
  }
  
  return results;
}

module.exports = {
  isCoreSkill,
  validateSkillName,
  checkConflict,
  createSkillLink,
  removeSkillLink,
  validateLink,
  getLinkInfo,
  syncSkills,
  CORE_SKILLS
};