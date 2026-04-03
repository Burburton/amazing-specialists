/**
 * Platform Adapter Config Loader
 * 
 * 加载平台配置文件。
 * 
 * @module adapters/platform/loader
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { ConfigLoadError } from './errors';
import type { Role, Category, SkillId, RoleMapping, PlatformCapabilities } from '../interfaces/platform-adapter.interface';

/**
 * 角色映射配置文件结构
 */
export interface RoleMappingConfig {
  version: string;
  platform_id: string;
  role_mapping: Record<Role, {
    category: Category;
    default_skills: SkillId[];
  }>;
}

/**
 * 平台能力配置文件结构
 */
export interface CapabilitiesConfig extends PlatformCapabilities {
  platform_id: string;
  version: string;
}

/**
 * 加载角色映射配置
 * 
 * @param platformId - 平台标识符
 * @returns 角色映射配置
 * @throws ConfigLoadError 如果文件不存在或格式错误
 */
export function loadRoleMapping(platformId: string): RoleMappingConfig {
  const configPath = path.join(__dirname, platformId, 'role-mapping.json');
  
  if (!fs.existsSync(configPath)) {
    throw new ConfigLoadError(configPath, 'File not found');
  }
  
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as RoleMappingConfig;
  } catch (e) {
    throw new ConfigLoadError(configPath, `Parse error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * 加载平台能力配置
 * 
 * @param platformId - 平台标识符
 * @returns 平台能力配置
 * @throws ConfigLoadError 如果文件不存在或格式错误
 */
export function loadCapabilities(platformId: string): CapabilitiesConfig {
  const configPath = path.join(__dirname, platformId, 'capabilities.json');
  
  if (!fs.existsSync(configPath)) {
    throw new ConfigLoadError(configPath, 'File not found');
  }
  
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as CapabilitiesConfig;
  } catch (e) {
    throw new ConfigLoadError(configPath, `Parse error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * 检查平台是否存在
 * 
 * @param platformId - 平台标识符
 * @returns 是否存在
 */
export function platformExists(platformId: string): boolean {
  const platformPath = path.join(__dirname, platformId);
  return fs.existsSync(platformPath) && fs.statSync(platformPath).isDirectory();
}

/**
 * 获取所有可用平台
 * 
 * @returns 平台标识符列表
 */
export function getAvailablePlatforms(): string[] {
  const platforms: string[] = [];
  const items = fs.readdirSync(__dirname);
  
  for (const item of items) {
    const itemPath = path.join(__dirname, item);
    if (fs.statSync(itemPath).isDirectory()) {
      const roleMappingPath = path.join(itemPath, 'role-mapping.json');
      if (fs.existsSync(roleMappingPath)) {
        platforms.push(item);
      }
    }
  }
  
  return platforms;
}