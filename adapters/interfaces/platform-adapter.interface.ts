/**
 * Platform Adapter Interface
 * 
 * Platform Adapter 隔离不同 AI 平台的运行时差异，提供统一的角色模型抽象。
 * 
 * @module adapters/interfaces/platform-adapter
 * @version 1.0.0
 */

/**
 * 专家包定义的 6 个核心角色
 */
export type Role = 
  | 'architect'   // 架构师 - 技术方案设计
  | 'developer'   // 开发者 - 代码实现
  | 'tester'      // 测试员 - 测试验证
  | 'reviewer'    // 审查员 - 独立审查
  | 'docs'        // 文档员 - 文档同步
  | 'security';   // 安全员 - 安全审查

/**
 * 任务派发的 category 类型
 * 
 * 不同平台使用不同的 category 值，Platform Adapter 负责映射。
 */
export type Category = 
  | 'deep'               // 深度任务，需要充分研究
  | 'ultrabrain'         // 超复杂逻辑任务
  | 'visual-engineering' // 前端/UI/设计任务
  | 'writing'            // 文档/写作任务
  | 'quick'              // 快速简单任务
  | 'unspecified-high'   // 未指定高优先级
  | 'unspecified-low';   // 未指定低优先级

/**
 * Skill 标识符
 * 
 * 格式: "{role}/{skill-name}"
 * 示例: "tester/unit-test-design"
 */
export type SkillId = string;

/**
 * 执行模式类型
 * 
 * - synchronous: 同步执行，适合快速任务
 * - background: 后台执行，适合长时间任务
 * - background_with_fallback: 尝试后台执行，失败时fallback到同步
 */
export type ExecutionMode = 
  | 'synchronous' 
  | 'background' 
  | 'background_with_fallback';

/**
 * 执行策略
 * 
 * 定义任务执行的推荐策略
 */
export interface ExecutionStrategy {
  /** 推荐的执行模式 */
  mode: ExecutionMode;
  /** 推荐理由 */
  rationale: string;
  /** Fallback提示（仅当mode为background_with_fallback时） */
  fallback_hint?: string;
  /** 预估最大执行时长（秒） */
  max_duration_estimate?: number;
}

/**
 * 平台已知问题（增强版）
 * 
 * 结构化的已知问题声明
 */
export interface KnownIssue {
  /** 问题唯一标识 */
  id: string;
  /** 问题描述 */
  description: string;
  /** 严重级别 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 解决方案或 workaround */
  workaround: string;
  /** 受影响的任务类型 */
  affected_task_types?: string[];
  /** 失败率 (0.0-1.0) */
  failure_rate?: number;
}

/**
 * 平台已知问题（兼容旧版）
 */
export interface PlatformIssue {
  /** 问题标识 */
  issue: string;
  /** 解决方案或 workaround */
  workaround: string;
  /** 参考文档链接 */
  reference?: string;
}

/**
 * 平台能力声明
 */
export interface PlatformCapabilities {
  /** 是否支持后台任务执行 */
  supports_background_task: boolean;
  /** 是否支持并行 agent 执行 */
  supports_parallel_agents: boolean;
  /** 最大上下文长度（tokens） */
  max_context_length: number;
  
  // 新增字段：执行策略相关
  /** 后台任务失败率 (0.0-1.0, 越高越不可靠) */
  background_task_failure_rate?: number;
  /** 推荐执行模式映射 (task type → execution mode) */
  recommended_execution_mode?: Record<string, ExecutionMode>;
  /** 已知问题（增强版，结构化） */
  known_issues?: KnownIssue[];
  
  /** 其他平台特定能力 */
  [key: string]: unknown;
}

/**
 * 角色映射配置
 */
export interface RoleMapping {
  /** 目标 category */
  category: Category;
  /** 默认加载的 skills */
  default_skills: SkillId[];
  /** 额外配置 */
  additional_config?: Record<string, unknown>;
}

/**
 * 任务配置
 */
export interface TaskConfig {
  /** 任务描述 */
  description: string;
  /** 任务 prompt */
  prompt: string;
  /** 是否后台运行 */
  run_in_background?: boolean;
  /** 加载的 skills */
  load_skills?: SkillId[];
  /** 其他配置 */
  [key: string]: unknown;
}

/**
 * 任务派发结果
 */
export interface DispatchResult {
  /** 是否成功 */
  success: boolean;
  /** 任务 ID（如果成功） */
  task_id?: string;
  /** 错误信息（如果失败） */
  error?: string;
  /** 会话 ID */
  session_id?: string;
}

/**
 * Platform Adapter Interface
 * 
 * 平台适配器接口，用于隔离不同 AI 平台的运行时差异。
 * 
 * @example
 * ```typescript
 * const adapter = getPlatformAdapter('opencode');
 * 
 * // 获取角色对应的 category
 * const category = adapter.mapRoleToCategory('tester');
 * // Returns: 'unspecified-high'
 * 
 * // 获取默认 skills
 * const skills = adapter.getDefaultSkills('tester');
 * // Returns: ['tester/unit-test-design', 'tester/regression-analysis', ...]
 * 
 * // 派发任务
 * const result = adapter.dispatchTask({
 *   role: 'tester',
 *   config: { description: 'Verify implementation', prompt: '...' }
 * });
 * ```
 */
export interface PlatformAdapter {
  // ============ 元数据 ============
  
  /**
   * 平台唯一标识符
   * 
   * @example 'opencode', 'claude-code', 'gemini-cli'
   */
  readonly platform_id: string;
  
  /**
   * Adapter 版本
   * 
   * @example '1.0.0'
   */
  readonly version: string;
  
  // ============ 角色映射 ============
  
  /**
   * 角色映射配置表
   * 
   * key: Role (6-role 之一)
   * value: RoleMapping (category + skills)
   */
  readonly role_mapping: Record<Role, RoleMapping>;
  
  /**
   * 将角色映射到平台的 category
   * 
   * @param role - 6-role 之一
   * @returns 对应的平台 category
   * 
   * @example
   * ```typescript
   * adapter.mapRoleToCategory('tester');
   * // OpenCode: 'unspecified-high'
   * // Claude Code: 'unspecified-high'
   * ```
   */
  mapRoleToCategory(role: Role): Category;
  
  /**
   * 获取角色对应的默认 skills
   * 
   * @param role - 6-role 之一
   * @returns 该角色的默认 skill 列表
   * 
   * @example
   * ```typescript
   * adapter.getDefaultSkills('tester');
   * // Returns: ['tester/unit-test-design', 'tester/regression-analysis', 'tester/edge-case-matrix']
   * ```
   */
  getDefaultSkills(role: Role): SkillId[];
  
  // ============ 平台能力 ============
  
  /**
   * 平台能力声明
   */
  readonly capabilities: PlatformCapabilities;
  
  /**
   * 获取平台能力
   * 
   * @returns 平台能力对象
   */
  getCapabilities(): PlatformCapabilities;
  
  /**
   * 获取指定任务类型的执行策略
   * 
   * 根据平台能力和任务类型，自动推荐最优执行模式。
   * 
   * @param taskType - 任务类型 (explore, librarian, oracle, deep, etc.)
   * @returns 执行策略对象
   * 
   * @example
   * ```typescript
   * const strategy = adapter.getExecutionStrategy('explore');
   * // Returns: { mode: 'synchronous', rationale: '...' }
   * ```
   */
  getExecutionStrategy(taskType: string): ExecutionStrategy;
  
  /**
   * 判断指定任务类型是否应使用后台执行
   * 
   * 简化判断逻辑，基于 getExecutionStrategy() 的结果。
   * 
   * @param taskType - 任务类型
   * @returns true 表示应使用后台执行，false 表示应使用同步执行
   * 
   * @example
   * ```typescript
   * if (adapter.shouldUseBackground('oracle')) {
   *   // 使用后台执行
   * } else {
   *   // 使用同步执行
   * }
   * ```
   */
  shouldUseBackground(taskType: string): boolean;
  
  // ============ 已知问题 ============
  
  /**
   * 已知问题列表
   */
  readonly known_issues?: PlatformIssue[];
  
  // ============ 任务派发 ============
  
  /**
   * 派发任务到指定角色
   * 
   * 这是一个可选方法，允许 Platform Adapter 提供统一的任务派发接口。
   * 如果平台不支持，可以不实现此方法。
   * 
   * @param role - 目标角色
   * @param config - 任务配置
   * @returns 派发结果
   * 
   * @example
   * ```typescript
   * const result = adapter.dispatchTask?.('tester', {
   *   description: 'Verify T-006 implementation',
   *   prompt: 'Check if all acceptance criteria are met...',
   *   run_in_background: true
   * });
   * ```
   */
  dispatchTask?(role: Role, config: TaskConfig): DispatchResult;
}

/**
 * Platform Adapter 配置文件格式
 * 
 * @example
 * ```json
 * {
 *   "platform_id": "opencode",
 *   "version": "1.0.0",
 *   "role_mapping": {
 *     "architect": {
 *       "category": "deep",
 *       "default_skills": [
 *         "architect/requirement-to-design",
 *         "architect/module-boundary-design",
 *         "architect/tradeoff-analysis"
 *       ]
 *     },
 *     "developer": {
 *       "category": "unspecified-high",
 *       "default_skills": [
 *         "developer/feature-implementation",
 *         "developer/bugfix-workflow",
 *         "developer/code-change-selfcheck"
 *       ]
 *     }
 *   },
 *   "capabilities": {
 *     "supports_background_task": true,
 *     "supports_parallel_agents": true,
 *     "max_context_length": 200000
 *   },
 *   "known_issues": [
 *     {
 *       "issue": "subagent_type parameter not supported",
 *       "workaround": "Use category + load_skills instead",
 *       "reference": "docs/platform-adapter-guide.md#known-issues"
 *     }
 *   ]
 * }
 * ```
 */
export interface PlatformAdapterConfig {
  platform_id: string;
  version: string;
  role_mapping: Record<Role, RoleMapping>;
  capabilities: PlatformCapabilities;
  known_issues?: PlatformIssue[];
}

/**
 * Platform Adapter 工厂函数类型
 */
export type PlatformAdapterFactory = (config: PlatformAdapterConfig) => PlatformAdapter;

/**
 * 创建 Platform Adapter 的默认实现
 * 
 * @param config - Platform Adapter 配置
 * @returns Platform Adapter 实例
 */
export function createPlatformAdapter(config: PlatformAdapterConfig): PlatformAdapter {
  return {
    platform_id: config.platform_id,
    version: config.version,
    role_mapping: config.role_mapping,
    capabilities: config.capabilities,
    known_issues: config.known_issues,
    
    mapRoleToCategory(role: Role): Category {
      const mapping = config.role_mapping[role];
      if (!mapping) {
        // 默认返回 unspecified-high
        return 'unspecified-high';
      }
      return mapping.category;
    },
    
    getDefaultSkills(role: Role): SkillId[] {
      const mapping = config.role_mapping[role];
      if (!mapping) {
        return [];
      }
      return mapping.default_skills;
    },
    
    getCapabilities(): PlatformCapabilities {
      return config.capabilities;
    }
  };
}

export default PlatformAdapter;