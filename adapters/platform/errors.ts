/**
 * Platform Adapter Errors
 * 
 * Platform Adapter 相关的自定义错误类型。
 * 
 * @module adapters/platform/errors
 * @version 1.0.0
 */

/**
 * 平台不支持错误
 * 
 * 当请求的平台不在支持列表中时抛出。
 */
export class PlatformNotSupportedError extends Error {
  constructor(
    public readonly platformId: string,
    supportedPlatforms: string[] = ['opencode']
  ) {
    super(
      `Platform '${platformId}' is not supported. ` +
      `Available platforms: ${supportedPlatforms.join(', ')}. ` +
      `To add support for a new platform, create an adapter in adapters/platform/${platformId}/`
    );
    this.name = 'PlatformNotSupportedError';
  }
}

/**
 * 配置加载错误
 * 
 * 当配置文件读取或解析失败时抛出。
 */
export class ConfigLoadError extends Error {
  constructor(
    public readonly path: string,
    public readonly reason: string
  ) {
    super(
      `Failed to load config from '${path}': ${reason}. ` +
      `Ensure the file exists and contains valid JSON.`
    );
    this.name = 'ConfigLoadError';
  }
}

/**
 * 角色映射错误
 * 
 * 当角色不在 6-role 模型中时抛出。
 */
export class InvalidRoleError extends Error {
  constructor(
    public readonly role: string,
    validRoles: string[] = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security']
  ) {
    super(
      `Invalid role '${role}'. ` +
      `Valid roles: ${validRoles.join(', ')}.`
    );
    this.name = 'InvalidRoleError';
  }
}