/**
 * Platform Adapter Config Merger
 * 
 * 合并配置优先级：项目级覆盖 > Plugin 扩展 > 默认配置。
 * 
 * @module adapters/platform/merger
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Role, Category, SkillId } from '../interfaces/platform-adapter.interface';
import type { RoleMappingConfig } from './loader';

export interface ProjectOverride {
  version?: string;
  overrides?: Partial<Record<Role, {
    override_category?: Category;
    additional_skills?: SkillId[];
    replace_skills?: SkillId[];
  }>>;
}

export function loadProjectOverride(projectRoot: string = process.cwd()): ProjectOverride | null {
  const overridePaths = [
    path.join(projectRoot, '.opencode', 'platform-override.json'),
    path.join(projectRoot, 'platform-override.json'),
  ];
  
  for (const overridePath of overridePaths) {
    if (fs.existsSync(overridePath)) {
      try {
        const content = fs.readFileSync(overridePath, 'utf-8');
        return JSON.parse(content) as ProjectOverride;
      } catch {
        return null;
      }
    }
  }
  
  return null;
}

export function mergeWithOverride(
  baseConfig: RoleMappingConfig,
  override: ProjectOverride | null
): RoleMappingConfig {
  if (!override?.overrides) {
    return baseConfig;
  }
  
  const merged = JSON.parse(JSON.stringify(baseConfig)) as RoleMappingConfig;
  
  for (const [role, roleOverride] of Object.entries(override.overrides)) {
    const validRoles: Role[] = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];
    if (!validRoles.includes(role as Role)) continue;
    
    const roleKey = role as Role;
    const baseRoleConfig = merged.role_mapping[roleKey];
    
    if (!baseRoleConfig) continue;
    
    if (roleOverride.override_category) {
      baseRoleConfig.category = roleOverride.override_category;
    }
    
    if (roleOverride.additional_skills && roleOverride.additional_skills.length > 0) {
      const existingSkills = new Set(baseRoleConfig.default_skills);
      for (const skill of roleOverride.additional_skills) {
        existingSkills.add(skill);
      }
      baseRoleConfig.default_skills = Array.from(existingSkills);
    }
    
    if (roleOverride.replace_skills) {
      baseRoleConfig.default_skills = roleOverride.replace_skills;
    }
  }
  
  return merged;
}

export function mergeWithPlugin(
  baseConfig: RoleMappingConfig,
  pluginMappings: Array<{
    platform_id: string;
    role_mapping: Partial<Record<Role, {
      additional_skills?: SkillId[];
    }>>;
  }>,
  targetPlatform: string
): RoleMappingConfig {
  const merged = JSON.parse(JSON.stringify(baseConfig)) as RoleMappingConfig;
  
  for (const plugin of pluginMappings) {
    if (plugin.platform_id !== targetPlatform) continue;
    
    for (const [role, roleMapping] of Object.entries(plugin.role_mapping)) {
      const validRoles: Role[] = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];
      if (!validRoles.includes(role as Role)) continue;
      
      const roleKey = role as Role;
      const baseRoleConfig = merged.role_mapping[roleKey];
      
      if (!baseRoleConfig || !roleMapping?.additional_skills) continue;
      
      const existingSkills = new Set(baseRoleConfig.default_skills);
      for (const skill of roleMapping.additional_skills) {
        existingSkills.add(skill);
      }
      baseRoleConfig.default_skills = Array.from(existingSkills);
    }
  }
  
  return merged;
}