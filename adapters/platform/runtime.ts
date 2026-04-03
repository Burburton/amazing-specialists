/**
 * Platform Adapter Runtime
 * 
 * 主入口模块，提供 getPlatformAdapter() 函数。
 * 
 * @module adapters/platform/runtime
 * @version 1.0.0
 */

import type { 
  PlatformAdapter, 
  Role, 
  Category, 
  SkillId, 
  RoleMapping, 
  PlatformCapabilities 
} from '../interfaces/platform-adapter.interface';
import { PlatformNotSupportedError, InvalidRoleError } from './errors';
import { loadRoleMapping, loadCapabilities, platformExists, getAvailablePlatforms } from './loader';
import { loadProjectOverride, mergeWithOverride, mergeWithPlugin, type ProjectOverride } from './merger';

const adapterCache = new Map<string, PlatformAdapter>();
let currentProjectRoot: string = process.cwd();

export function setProjectRoot(root: string): void {
  currentProjectRoot = root;
}

export function getProjectRoot(): string {
  return currentProjectRoot;
}

const VALID_ROLES: Role[] = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];

function isValidRole(role: string): role is Role {
  return VALID_ROLES.includes(role as Role);
}

function createAdapter(
  platformId: string,
  roleMappingConfig: ReturnType<typeof loadRoleMapping>,
  capabilitiesConfig: ReturnType<typeof loadCapabilities>
): PlatformAdapter {
  const roleMapping: Record<Role, RoleMapping> = {} as Record<Role, RoleMapping>;
  
  for (const [role, config] of Object.entries(roleMappingConfig.role_mapping)) {
    if (isValidRole(role)) {
      roleMapping[role] = {
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
    platform_id: platformId,
    version: roleMappingConfig.version,
    role_mapping: roleMapping,
    capabilities,
    
    mapRoleToCategory(role: Role): Category {
      if (!isValidRole(role)) {
        throw new InvalidRoleError(role);
      }
      return roleMapping[role]?.category ?? 'unspecified-high';
    },
    
    getDefaultSkills(role: Role): SkillId[] {
      if (!isValidRole(role)) {
        throw new InvalidRoleError(role);
      }
      return roleMapping[role]?.default_skills ?? [];
    },
    
    getCapabilities(): PlatformCapabilities {
      return capabilities;
    },
  };
}

export function getPlatformAdapter(platformId: string, options?: {
  projectRoot?: string;
  skipOverride?: boolean;
}): PlatformAdapter {
  const cacheKey = `${platformId}:${options?.projectRoot ?? currentProjectRoot}`;
  const cached = adapterCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  if (!platformExists(platformId)) {
    throw new PlatformNotSupportedError(platformId, getAvailablePlatforms());
  }
  
  let roleMappingConfig = loadRoleMapping(platformId);
  const capabilitiesConfig = loadCapabilities(platformId);
  
  if (!options?.skipOverride) {
    const projectRoot = options?.projectRoot ?? currentProjectRoot;
    const override = loadProjectOverride(projectRoot);
    if (override) {
      roleMappingConfig = mergeWithOverride(roleMappingConfig, override);
    }
  }
  
  const adapter = createAdapter(platformId, roleMappingConfig, capabilitiesConfig);
  adapterCache.set(cacheKey, adapter);
  
  return adapter;
}

export function clearCache(): void {
  adapterCache.clear();
}

export function getSupportedPlatforms(): string[] {
  return getAvailablePlatforms();
}

export { PlatformNotSupportedError, ConfigLoadError, InvalidRoleError } from './errors';
export type { Role, Category, SkillId, RoleMapping, PlatformCapabilities, PlatformAdapter } from '../interfaces/platform-adapter.interface';