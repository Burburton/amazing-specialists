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
  PlatformCapabilities,
  ExecutionMode,
  ExecutionStrategy
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

const DECISION_TABLE: Record<string, {
  max_duration_estimate: number;
  default_mode: ExecutionMode;
}> = {
  'explore': { max_duration_estimate: 5, default_mode: 'synchronous' },
  'librarian': { max_duration_estimate: 5, default_mode: 'synchronous' },
  'oracle': { max_duration_estimate: 60, default_mode: 'background_with_fallback' },
  'deep': { max_duration_estimate: 30, default_mode: 'background_with_fallback' },
  'developer': { max_duration_estimate: 20, default_mode: 'synchronous' },
  'architect': { max_duration_estimate: 45, default_mode: 'background_with_fallback' },
  'tester': { max_duration_estimate: 10, default_mode: 'synchronous' },
  'reviewer': { max_duration_estimate: 15, default_mode: 'synchronous' },
  'docs': { max_duration_estimate: 10, default_mode: 'synchronous' },
  'security': { max_duration_estimate: 12, default_mode: 'synchronous' }
};

const FAILURE_RATE_THRESHOLD = 0.3;

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
    background_task_failure_rate: capabilitiesConfig.background_task_failure_rate,
    recommended_execution_mode: capabilitiesConfig.recommended_execution_mode,
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
    
    getExecutionStrategy(taskType: string): ExecutionStrategy {
      const caps = this.getCapabilities();
      const platformRecommended = caps.recommended_execution_mode?.[taskType];
      const failureRate = caps.background_task_failure_rate ?? 0;
      const backgroundReliable = failureRate < FAILURE_RATE_THRESHOLD;
      
      let mode: ExecutionMode;
      let rationale: string;
      
      if (platformRecommended) {
        if (platformRecommended === 'background' && !backgroundReliable) {
          mode = 'background_with_fallback';
          rationale = `Platform recommends background but failure rate (${failureRate.toFixed(2)}) exceeds threshold (${FAILURE_RATE_THRESHOLD})`;
        } else {
          mode = platformRecommended;
          rationale = `Platform explicitly recommends ${platformRecommended}`;
        }
      } else {
        const defaultStrategy = DECISION_TABLE[taskType];
        if (!defaultStrategy) {
          mode = 'synchronous';
          rationale = 'Unknown task type, using safe default';
        } else {
          mode = defaultStrategy.default_mode;
          rationale = `Task type '${taskType}' typically takes ${defaultStrategy.max_duration_estimate}s, default mode is ${defaultStrategy.default_mode}`;
        }
      }
      
      return {
        mode,
        rationale,
        fallback_hint: mode === 'background_with_fallback' 
          ? 'If background task fails, retry with synchronous mode'
          : undefined,
        max_duration_estimate: DECISION_TABLE[taskType]?.max_duration_estimate
      };
    },
    
    shouldUseBackground(taskType: string): boolean {
      const strategy = this.getExecutionStrategy(taskType);
      return strategy.mode === 'background' || strategy.mode === 'background_with_fallback';
    }
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

export function getExecutionStrategy(
  platformId: string,
  taskType: string,
  options?: { projectRoot?: string; skipOverride?: boolean }
): ExecutionStrategy {
  const adapter = getPlatformAdapter(platformId, options);
  return adapter.getExecutionStrategy(taskType);
}

export function shouldUseBackground(
  platformId: string,
  taskType: string,
  options?: { projectRoot?: string; skipOverride?: boolean }
): boolean {
  const adapter = getPlatformAdapter(platformId, options);
  return adapter.shouldUseBackground(taskType);
}

export { PlatformNotSupportedError, ConfigLoadError, InvalidRoleError } from './errors';
export type { Role, Category, SkillId, RoleMapping, PlatformCapabilities, PlatformAdapter, ExecutionMode, ExecutionStrategy } from '../interfaces/platform-adapter.interface';