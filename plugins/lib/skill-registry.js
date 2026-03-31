const fs = require('fs');
const path = require('path');

const REGISTRY_VERSION = '1.0.0';

function createEmptyRegistry() {
  return {
    version: REGISTRY_VERSION,
    skills: []
  };
}

function loadRegistry(projectPath) {
  const registryPath = path.join(projectPath, '.opencode', 'skill-registry.json');
  
  if (!fs.existsSync(registryPath)) {
    return {
      registry: createEmptyRegistry(),
      created: true,
      path: registryPath
    };
  }
  
  try {
    const content = fs.readFileSync(registryPath, 'utf8');
    const registry = JSON.parse(content);
    
    if (!registry.version) {
      registry.version = REGISTRY_VERSION;
    }
    
    if (!registry.skills) {
      registry.skills = [];
    }
    
    return {
      registry,
      created: false,
      path: registryPath
    };
  } catch (e) {
    return {
      registry: createEmptyRegistry(),
      created: true,
      error: e.message,
      path: registryPath
    };
  }
}

function saveRegistry(registry, projectPath) {
  const registryPath = path.join(projectPath, '.opencode', 'skill-registry.json');
  const registryDir = path.dirname(registryPath);
  
  if (!fs.existsSync(registryDir)) {
    fs.mkdirSync(registryDir, { recursive: true });
  }
  
  registry.version = registry.version || REGISTRY_VERSION;
  
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  
  return {
    success: true,
    path: registryPath
  };
}

function validateSkillEntry(skill) {
  const errors = [];
  
  if (!skill.name) {
    errors.push('Skill entry must have a name');
  } else {
    const pattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!pattern.test(skill.name)) {
      errors.push(`Skill name "${skill.name}" must be lowercase alphanumeric with hyphens`);
    }
    if (skill.name.length > 64) {
      errors.push(`Skill name "${skill.name}" exceeds 64 character limit`);
    }
  }
  
  if (!skill.source) {
    errors.push('Skill entry must have a source path');
  }
  
  if (typeof skill.enabled !== 'boolean') {
    errors.push('Skill entry must have enabled boolean');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function addSkill(registry, skill) {
  const validation = validateSkillEntry(skill);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }
  
  if (!registry.skills) {
    registry.skills = [];
  }
  
  const existingIndex = registry.skills.findIndex(s => s.name === skill.name);
  
  if (existingIndex >= 0) {
    registry.skills[existingIndex] = {
      ...registry.skills[existingIndex],
      ...skill,
      updated_at: new Date().toISOString()
    };
    
    return {
      success: true,
      action: 'updated',
      skillName: skill.name,
      index: existingIndex
    };
  }
  
  const newSkill = {
    ...skill,
    installed_at: skill.installed_at || new Date().toISOString()
  };
  
  registry.skills.push(newSkill);
  
  return {
    success: true,
    action: 'added',
    skillName: skill.name,
    index: registry.skills.length - 1
  };
}

function removeSkill(registry, skillName) {
  if (!registry.skills) {
    return {
      success: false,
      error: 'No skills in registry'
    };
  }
  
  const index = registry.skills.findIndex(s => s.name === skillName);
  
  if (index < 0) {
    return {
      success: false,
      error: `Skill "${skillName}" not found in registry`
    };
  }
  
  registry.skills.splice(index, 1);
  
  return {
    success: true,
    action: 'removed',
    skillName
  };
}

function getSkill(registry, skillName) {
  if (!registry.skills) {
    return null;
  }
  
  return registry.skills.find(s => s.name === skillName);
}

function getEnabledSkills(registry) {
  if (!registry.skills) {
    return [];
  }
  
  return registry.skills.filter(s => s.enabled === true);
}

function getDisabledSkills(registry) {
  if (!registry.skills) {
    return [];
  }
  
  return registry.skills.filter(s => s.enabled === false);
}

function enableSkill(registry, skillName) {
  const skill = getSkill(registry, skillName);
  
  if (!skill) {
    return {
      success: false,
      error: `Skill "${skillName}" not found in registry`
    };
  }
  
  if (skill.enabled) {
    return {
      success: true,
      action: 'none',
      skillName,
      reason: 'Already enabled'
    };
  }
  
  skill.enabled = true;
  skill.updated_at = new Date().toISOString();
  
  return {
    success: true,
    action: 'enabled',
    skillName
  };
}

function disableSkill(registry, skillName) {
  const skill = getSkill(registry, skillName);
  
  if (!skill) {
    return {
      success: false,
      error: `Skill "${skillName}" not found in registry`
    };
  }
  
  if (!skill.enabled) {
    return {
      success: true,
      action: 'none',
      skillName,
      reason: 'Already disabled'
    };
  }
  
  skill.enabled = false;
  skill.updated_at = new Date().toISOString();
  
  return {
    success: true,
    action: 'disabled',
    skillName
  };
}

function addSkillsFromPlugin(registry, pluginId, pluginVersion, skills, projectPath) {
  const results = {
    added: [],
    updated: [],
    skipped: [],
    errors: []
  };
  
  for (const skillName of skills) {
    const skillDirPath = path.join(projectPath, 'plugins', pluginId, 'skills', skillName);
    const sourcePath = `plugins/${pluginId}/skills/${skillName}/SKILL.md`;
    
    const skillEntry = {
      name: skillName,
      source: sourcePath,
      enabled: true,
      plugin_id: pluginId,
      plugin_version: pluginVersion,
      installed_at: new Date().toISOString()
    };
    
    const result = addSkill(registry, skillEntry);
    
    if (result.success) {
      if (result.action === 'added') {
        results.added.push(skillName);
      } else if (result.action === 'updated') {
        results.updated.push(skillName);
      }
    } else {
      results.errors.push({
        skillName,
        errors: result.errors
      });
    }
  }
  
  return results;
}

function removeSkillsFromPlugin(registry, pluginId) {
  const results = {
    removed: [],
    notFound: [],
    errors: []
  };
  
  if (!registry.skills) {
    return results;
  }
  
  const pluginSkills = registry.skills.filter(s => s.plugin_id === pluginId);
  
  for (const skill of pluginSkills) {
    const result = removeSkill(registry, skill.name);
    
    if (result.success) {
      results.removed.push(skill.name);
    } else {
      results.errors.push({
        skillName: skill.name,
        error: result.error
      });
    }
  }
  
  return results;
}

function getSkillsByPlugin(registry, pluginId) {
  if (!registry.skills) {
    return [];
  }
  
  return registry.skills.filter(s => s.plugin_id === pluginId);
}

function getSkillsSummary(registry) {
  const total = registry.skills?.length || 0;
  const enabled = getEnabledSkills(registry).length;
  const disabled = getDisabledSkills(registry).length;
  
  const byPlugin = {};
  if (registry.skills) {
    for (const skill of registry.skills) {
      const pluginId = skill.plugin_id || 'custom';
      if (!byPlugin[pluginId]) {
        byPlugin[pluginId] = {
          total: 0,
          enabled: 0,
          disabled: 0
        };
      }
      byPlugin[pluginId].total++;
      if (skill.enabled) {
        byPlugin[pluginId].enabled++;
      } else {
        byPlugin[pluginId].disabled++;
      }
    }
  }
  
  return {
    total,
    enabled,
    disabled,
    byPlugin
  };
}

module.exports = {
  REGISTRY_VERSION,
  createEmptyRegistry,
  loadRegistry,
  saveRegistry,
  validateSkillEntry,
  addSkill,
  removeSkill,
  getSkill,
  getEnabledSkills,
  getDisabledSkills,
  enableSkill,
  disableSkill,
  addSkillsFromPlugin,
  removeSkillsFromPlugin,
  getSkillsByPlugin,
  getSkillsSummary
};