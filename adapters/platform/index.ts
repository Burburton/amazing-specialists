/**
 * Platform Adapter Entry Point
 * 
 * 统一导出 Platform Adapter 相关的所有 API。
 * 
 * @module adapters/platform
 * @version 1.0.0
 */

// Main API
export { 
  getPlatformAdapter, 
  getSupportedPlatforms, 
  clearCache,
  setProjectRoot,
  getProjectRoot
} from './runtime';

// Error classes
export { 
  PlatformNotSupportedError, 
  ConfigLoadError, 
  InvalidRoleError 
} from './errors';

// Types
export type { 
  Role, 
  Category, 
  SkillId, 
  RoleMapping, 
  PlatformCapabilities, 
  PlatformAdapter 
} from '../interfaces/platform-adapter.interface';

// Convenience function for getting task config
import { getPlatformAdapter } from './runtime';
import type { Role, Category, SkillId } from '../interfaces/platform-adapter.interface';

export interface TaskConfig {
  category: Category;
  skills: SkillId[];
}

/**
 * 便捷方法：一次性获取派发任务所需的配置
 * 
 * @param platformId - 平台标识符
 * @param role - 6-role 之一
 * @returns 包含 category 和 skills 的配置对象
 * 
 * @example
 * ```typescript
 * import { getTaskConfig } from './adapters/platform';
 * 
 * const { category, skills } = getTaskConfig('opencode', 'tester');
 * 
 * task(category=category, load_skills=skills, prompt="...");
 * ```
 */
export function getTaskConfig(platformId: string, role: Role): TaskConfig {
  const adapter = getPlatformAdapter(platformId);
  return {
    category: adapter.mapRoleToCategory(role),
    skills: adapter.getDefaultSkills(role),
  };
}