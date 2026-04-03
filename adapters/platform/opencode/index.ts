/**
 * OpenCode Platform Adapter Factory
 * 
 * 创建 OpenCode 平台的 adapter 实例。
 * 
 * @module adapters/platform/opencode
 * @version 1.0.0
 */

import type { 
  PlatformAdapter, 
  Role, 
  Category, 
  SkillId, 
  RoleMapping, 
  PlatformCapabilities 
} from '../../interfaces/platform-adapter.interface';
import { loadRoleMapping, loadCapabilities } from '../loader';

export function createOpenCodeAdapter(): PlatformAdapter {
  const roleMappingConfig = loadRoleMapping('opencode');
  const capabilitiesConfig = loadCapabilities('opencode');
  
  const roleMapping: Record<Role, RoleMapping> = {} as Record<Role, RoleMapping>;
  
  for (const [role, config] of Object.entries(roleMappingConfig.role_mapping)) {
    const validRoles: Role[] = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];
    if (validRoles.includes(role as Role)) {
      roleMapping[role as Role] = {
        category: config.category,
        default_skills: config.default_skills,
      };
    }
  }
  
  const capabilities: PlatformCapabilities = {
    supports_background_task: capabilitiesConfig.supports_background_task,
    supports_parallel_agents: capabilitiesConfig.supports_parallel_agents,
    max_context_length: capabilitiesConfig.max_context_length,
    known_issues: capabilitiesConfig.known_issues,
  };
  
  return {
    platform_id: 'opencode',
    version: roleMappingConfig.version,
    role_mapping: roleMapping,
    capabilities,
    
    mapRoleToCategory(role: Role): Category {
      return roleMapping[role]?.category ?? 'unspecified-high';
    },
    
    getDefaultSkills(role: Role): SkillId[] {
      return roleMapping[role]?.default_skills ?? [];
    },
    
    getCapabilities(): PlatformCapabilities {
      return capabilities;
    },
  };
}

export default createOpenCodeAdapter;