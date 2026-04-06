# Implementation Plan: Background Task Execution Strategy Optimization

## Metadata

| Field | Value |
|-------|-------|
| Feature ID | `047-background-task-execution-strategy` |
| Plan Version | 1.0.0 |
| Created | 2026-04-07 |
| Status | Draft |
| Estimated Effort | Medium (2-3 hours) |

## Architecture Summary

### Design Philosophy

采用**Metadata-Driven Strategy Selection**设计：
- Platform capabilities声明执行策略建议
- Runtime API根据metadata自动决策
- AGENTS.md提供执行原则指导
- 主agent遵循"派发后不阻塞"原则

### Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│          Platform Capabilities (Metadata Layer)         │
│  - background_task_failure_rate                         │
│  - recommended_execution_mode                           │
│  - known_issues with workaround                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│          Runtime API (Decision Layer)                   │
│  - getExecutionStrategy(taskType)                       │
│  - shouldUseBackground(taskType)                        │
│  - Decision Table (TaskType → Strategy)                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│          AGENTS.md (Execution Layer)                    │
│  - OpenCode Platform Adaptation Strategy                │
│  - Non-blocking Execution Principles                    │
│  - Quick vs Long Task Decision Guide                    │
└─────────────────────────────────────────────────────────┘
```

### Execution Flow

```
主agent接收任务
  ↓
调用 getExecutionStrategy(taskType)
  ↓
获得 { mode: 'synchronous', rationale: '...' }
  ↓
根据mode选择执行方式
  ↓ synchronous → task(run_in_background=false)
  ↓ background → task(run_in_background=true) + END RESPONSE
  ↓ background_with_fallback → try background, fallback on failure
```

## Module Decomposition

### Module 1: Capabilities Metadata Extension

**Location**: `adapters/platform/opencode/capabilities.json`

**Changes**:
```json
{
  "supports_background_task": true,
  "supports_parallel_agents": true,
  "max_context_length": 200000,
  "background_task_failure_rate": 0.9,  // NEW
  "recommended_execution_mode": {       // NEW
    "explore": "synchronous",
    "librarian": "synchronous",
    "oracle": "background_with_fallback",
    "developer": "synchronous",
    "architect": "background_with_fallback",
    "tester": "synchronous",
    "reviewer": "synchronous",
    "docs": "synchronous",
    "security": "synchronous"
  },
  "known_issues": [                      // ENHANCED
    {
      "id": "PAT_REJECTION",
      "description": "Background tasks using subagent_type fail with PAT rejection",
      "severity": "high",
      "workaround": "Use category + load_skills, or synchronous mode for quick tasks",
      "affected_task_types": ["all"],
      "failure_rate": 0.9
    },
    {
      "id": "BACKGROUND_TASK_INSTABILITY",
      "description": "Background tasks may fail on first attempt without clear error",
      "severity": "medium",
      "workaround": "Check task status, retry, or use synchronous execution",
      "affected_task_types": ["explore", "librarian"],
      "failure_rate": 0.3
    }
  ]
}
```

**Dependencies**: None

**Validation**: JSON schema validation + manual review

### Module 2: Interface Contract Extension

**Location**: `adapters/interfaces/platform-adapter.interface.ts`

**Changes**:
```typescript
// NEW: Execution Strategy Types
export type ExecutionMode = 'synchronous' | 'background' | 'background_with_fallback';

export interface ExecutionStrategy {
  mode: ExecutionMode;
  rationale: string;
  fallback_hint?: string;
  max_duration_estimate?: number;  // seconds
}

// EXTENDED: PlatformCapabilities
export interface PlatformCapabilities {
  supports_background_task: boolean;
  supports_parallel_agents: boolean;
  max_context_length: number;
  
  // NEW fields
  background_task_failure_rate?: number;  // 0.0-1.0, higher = more unreliable
  recommended_execution_mode?: Record<string, ExecutionMode>;
  known_issues?: KnownIssue[];
}

// NEW: KnownIssue structure
export interface KnownIssue {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  workaround: string;
  affected_task_types?: string[];
  failure_rate?: number;
}

// NEW: Runtime API extensions
export interface PlatformAdapter {
  // existing methods
  platform_id: string;
  version: string;
  role_mapping: Record<Role, RoleMapping>;
  capabilities: PlatformCapabilities;
  
  mapRoleToCategory(role: Role): Category;
  getDefaultSkills(role: Role): SkillId[];
  getCapabilities(): PlatformCapabilities;
  
  // NEW methods
  getExecutionStrategy(taskType: string): ExecutionStrategy;
  shouldUseBackground(taskType: string): boolean;
}
```

**Dependencies**: Module 1 (capabilities.json)

**Validation**: TypeScript compilation + contract schema validation

### Module 3: Runtime Implementation

**Location**: `adapters/platform/runtime.ts`

**Changes**:
```typescript
// NEW: Decision Table
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

const FAILURE_RATE_THRESHOLD = 0.3;  // >30% failure rate = unreliable

// NEW: Implementation in createAdapter()
function createAdapter(...): PlatformAdapter {
  return {
    // existing methods
    
    getExecutionStrategy(taskType: string): ExecutionStrategy {
      // 1. Check platform capabilities
      const capabilities = this.getCapabilities();
      const platformRecommended = capabilities.recommended_execution_mode?.[taskType];
      
      // 2. Check failure rate
      const failureRate = capabilities.background_task_failure_rate ?? 0;
      const backgroundReliable = failureRate < FAILURE_RATE_THRESHOLD;
      
      // 3. Decision logic
      let mode: ExecutionMode;
      let rationale: string;
      
      if (platformRecommended) {
        // Platform has explicit recommendation
        if (platformRecommended === 'background' && !backgroundReliable) {
          mode = 'background_with_fallback';
          rationale = `Platform recommends background but failure rate (${failureRate}) exceeds threshold`;
        } else {
          mode = platformRecommended;
          rationale = `Platform explicitly recommends ${platformRecommended}`;
        }
      } else {
        // Use decision table default
        const defaultStrategy = DECISION_TABLE[taskType];
        if (!defaultStrategy) {
          mode = 'synchronous';
          rationale = 'Unknown task type, using safe default';
        } else {
          mode = defaultStrategy.default_mode;
          rationale = `Task type '${taskType}' typically takes ${defaultStrategy.max_duration_estimate}s, default mode is ${defaultStrategy.default_mode}`;
        }
      }
      
      // 4. Build result
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

// NEW: Export convenience function
export function getExecutionStrategy(
  platformId: string,
  taskType: string,
  options?: { projectRoot?: string }
): ExecutionStrategy {
  const adapter = getPlatformAdapter(platformId, options);
  return adapter.getExecutionStrategy(taskType);
}

export function shouldUseBackground(
  platformId: string,
  taskType: string,
  options?: { projectRoot?: string }
): boolean {
  const adapter = getPlatformAdapter(platformId, options);
  return adapter.shouldUseBackground(taskType);
}
```

**Dependencies**: Module 2 (interface), Module 1 (capabilities)

**Validation**: Unit tests + integration tests

### Module 4: AGENTS.md Strategy Guidance

**Location**: `AGENTS.md`

**Changes**: Insert new section after Phase 2A

```markdown
### OpenCode平台适配策略

#### Background Task执行问题

OpenCode平台的background task存在以下已知限制：

**Issue 1: PAT Rejection**
- 使用`task(subagent_type="...", run_in_background=true)`会触发Personal Access Token验证错误
- Subagent spawning endpoint不支持PAT认证
- Background task立即失败，主agent被迫等待notification处理

**Issue 2: Background Task不稳定**
- 某些task类型（explore, librarian）background模式失败率高达90%+
- 主agent派发后需要等待失败notification，失去并行优势

#### 推荐执行策略

**策略原则**：

1. **快速任务 → Synchronous**
   - Explore/Librarian等快速搜索任务（<5秒）使用synchronous模式
   - 避免"PAT rejection → notification → retry"的循环
   - 多个synchronous task可在同一message派发，串行执行但总时间可控

2. **长任务 → Background with Fallback**
   - Oracle/Deep分析等长任务（>30秒）尝试background模式
   - 如果失败notification到达，立即切换synchronous retry
   - 永远不要`background_output(block=true)`

3. **派发后立即结束**
   - 派发background task后，立即结束response
   - 等待system notification触发下一turn
   - 收到失败notification后，立即fallback

**决策表**：

| Task Type | Estimated Duration | Recommended Mode | Rationale |
|-----------|-------------------|------------------|-----------|
| explore | <5s | synchronous | Quick search, no need for background |
| librarian | <5s | synchronous | Reference lookup, fast execution |
| oracle | >60s | background_with_fallback | Deep analysis, worth trying background |
| deep | >30s | background_with_fallback | Autonomous solving, long execution |
| developer | ~20s | synchronous | Implementation, moderate duration |
| architect | >45s | background_with_fallback | Architecture design, complex reasoning |
| tester | ~10s | synchronous | Verification, moderate duration |
| reviewer | ~15s | synchronous | Review, moderate duration |
| docs | ~10s | synchronous | Documentation, moderate duration |
| security | ~12s | synchronous | Security review, moderate duration |

**代码示例**：

```typescript
import { getExecutionStrategy } from './adapters/platform/runtime';

// 获取推荐执行策略
const strategy = getExecutionStrategy('opencode', 'explore');

console.log(strategy.mode);  // 'synchronous'
console.log(strategy.rationale);  // 'Task type 'explore' typically takes 5s...'
console.log(strategy.max_duration_estimate);  // 5

// 根据策略选择执行模式
if (strategy.mode === 'synchronous') {
  task(category="unspecified-high", load_skills=[], run_in_background=false, prompt="...");
} else if (strategy.mode === 'background_with_fallback') {
  const taskId = task(category="deep", load_skills=[], run_in_background=true, prompt="...");
  // DON'T call background_output here
  // END RESPONSE
  // Wait for notification → if failure, fallback to synchronous
}
```

#### Non-Blocking Execution原则

**永远不要**：
- ❌ `background_output(task_id, block=true)` - 阻塞等待
- ❌ 派发background task后继续其他工作（依赖background结果）
- ❌ Background失败后retry background（会再次失败）

**应该**：
- ✅ 派发background task后立即结束response
- ✅ 等待system notification触发下一turn
- ✅ 收到失败notification后切换synchronous fallback
- ✅ 快速任务直接使用synchronous模式

#### 平台能力检查

使用Platform Adapter检查background task支持度：

```typescript
import { getPlatformAdapter } from './adapters/platform/runtime';

const adapter = getPlatformAdapter('opencode');
const capabilities = adapter.getCapabilities();

// 检查failure rate
if (capabilities.background_task_failure_rate > 0.3) {
  console.log('Background tasks unreliable, prefer synchronous');
}

// 获取平台推荐模式
const recommended = capabilities.recommended_execution_mode;
console.log(recommended['explore']);  // 'synchronous'
```
```

**Dependencies**: Module 3 (runtime API)

**Validation**: Manual review + example execution

### Module 5: Documentation Sync

**Location**: `docs/platform-adapter-guide.md`

**Changes**: Add new section "Execution Strategy Selection"

```markdown
## Execution Strategy Selection

### Overview

Platform Adapter提供智能执行策略选择，帮助主agent避免不必要的background task失败。

### Using Execution Strategy API

```typescript
import { getExecutionStrategy } from './adapters/platform/runtime';

// 自动获取推荐执行模式
const strategy = getExecutionStrategy('opencode', 'oracle');

// strategy包含：
// - mode: 'synchronous' | 'background' | 'background_with_fallback'
// - rationale: 为什么推荐这个模式
// - fallback_hint: 如果background失败怎么办
// - max_duration_estimate: 预估耗时（秒）
```

### Decision Logic

Runtime根据以下因素决策：

1. **Platform Recommended Mode** - capabilities.json中的`recommended_execution_mode`
2. **Failure Rate Threshold** - `background_task_failure_rate > 0.3`视为不可靠
3. **Task Type Default** - Decision table中的默认策略
4. **Duration Estimate** - 预估耗时影响模式选择

### Best Practices

1. **调用getExecutionStrategy获取策略**
2. **根据mode选择执行方式**
3. **遵循AGENTS.md中的Non-Blocking原则**
4. **准备好fallback处理机制**
```

**Dependencies**: Module 3, Module 4

**Validation**: Manual review + link validation

**Location**: `adapters/platform/opencode/README.md`

**Changes**: Update Known Issues section

```markdown
## Known Issues

### Issue 1: PAT Rejection (CRITICAL)

**Problem**: Background tasks using `subagent_type` fail with Personal Access Token rejection.

**Root Cause**: OpenCode's subagent spawning endpoint does not support PAT authentication.

**Impact**: 
- 90%+ failure rate for background tasks
- Main agent blocks waiting for failure notification
- Parallel execution advantage lost

**Workaround**: 
```typescript
// ✅ Use execution strategy API
import { getExecutionStrategy } from './adapters/platform/runtime';

const strategy = getExecutionStrategy('opencode', 'explore');
// Returns: { mode: 'synchronous', rationale: '...' }

// ✅ Follow recommended mode
if (strategy.mode === 'synchronous') {
  task(category="unspecified-high", run_in_background=false, prompt="...");
}
```

**Status**: Known limitation, workaround provided via Platform Adapter.

### Issue 2: Background Task Instability

**Problem**: Background tasks may fail on first attempt without clear error.

**Impact**: Quick tasks (<5s) suffer unnecessary retry overhead.

**Workaround**: 
- Quick tasks: Use synchronous mode directly
- Long tasks: Try background, fallback to synchronous on failure

**Status**: Platform limitation, mitigated via execution strategy selection.
```

**Dependencies**: Module 3, Module 4

**Validation**: Manual review

## Risks and Tradeoffs

### Tradeoff-001: Synchronous vs Parallel Execution

**选择**: 快速任务使用synchronous模式，失去并行优势

**权衡**:
- **收益**: 避免90%+失败率，执行时间从>30秒降至<5秒
- **代价**: 多个快速任务无法真正并行，串行执行总时间=sum(times)
- **决策依据**: 快速任务串行总时间<10秒，仍优于background失败处理>30秒

**适用场景**: Explore/Librarian等<5秒任务

### Tradeoff-002: Metadata Complexity

**选择**: Capabilities.json包含复杂的执行策略metadata

**权衡**:
- **收益**: Runtime自动决策，主agent无需手动判断
- **代价**: Metadata维护成本增加，platform capabilities drift需跟踪
- **决策依据**: Metadata-driven比manual decision更可靠，且易于update

**缓解措施**: 
1. 提供project override机制
2. 定期re-validation（未来feature）
3. Failure rate作为可观察指标

### Tradeoff-003: Fallback Handler Implementation

**选择**: AGENTS.md指导fallback原则，runtime仅返回fallback_hint

**权衡**:
- **收益**: Runtime保持轻量，不侵入主agent逻辑
- **代价**: 主agent需手动实现fallback逻辑
- **决策依据**: Fallback时机和方式依赖具体context，不宜在runtime硬编码

**未来优化**: 如果发现通用fallback pattern，可考虑runtime提供helper function

## Implementation Sequence

### Phase 1: Metadata Foundation (30 min)

**顺序**: Module 1 → Module 2

**任务**:
1. Update `capabilities.json` with new fields
2. Update `platform-adapter.interface.ts` with new types
3. Validate JSON schema + TypeScript compilation

**验证**: 
- JSON valid + TS compilation success
- Interface contract matches capabilities structure

### Phase 2: Runtime Implementation (45 min)

**顺序**: Module 3

**任务**:
1. Implement decision table
2. Implement `getExecutionStrategy()`
3. Implement `shouldUseBackground()`
4. Export convenience functions

**验证**: 
- Unit tests for decision logic
- Integration test with real adapter

### Phase 3: AGENTS.md Guidance (30 min)

**顺序**: Module 4

**任务**:
1. Insert "OpenCode平台适配策略" section
2. Add decision table and examples
3. Add non-blocking principles

**验证**: 
- Manual review for clarity
- Example code executable

### Phase 4: Documentation Sync (20 min)

**顺序**: Module 5

**任务**:
1. Update `docs/platform-adapter-guide.md`
2. Update `adapters/platform/opencode/README.md`
3. Add usage examples

**验证**: 
- Link validation
- Cross-reference consistency

### Phase 5: Integration Validation (15 min)

**顺序**: Cross-module validation

**任务**:
1. Trace spec → plan → implementation
2. Verify all AC satisfied
3. Run governance checks (AH-001~AH-006)

**验证**: 
- All acceptance criteria met
- Governance compliant
- README/CHANGELOG updated

## Quality Gates

### Gate-001: Interface Contract Compliance

**检查**: TypeScript compilation + schema validation

**标准**: 
- No compilation errors
- Interface matches capabilities structure
- All new types exported

### Gate-002: Decision Logic Correctness

**检查**: Unit tests for all task types

**标准**: 
- `getExecutionStrategy('explore')` returns synchronous
- `getExecutionStrategy('oracle')` returns background_with_fallback
- Failure rate threshold logic works

### Gate-003: AGENTS.md Clarity

**检查**: Manual review + example execution

**标准**: 
- Strategy section clearly explains PAT issue
- Decision table easy to understand
- Examples executable

### Gate-004: Governance Alignment

**检查**: AH-001~AH-006 compliance

**标准**: 
- README updated with new feature
- CHANGELOG has entry
- All cross-references valid

## Estimated Effort

| Phase | Estimated Time | Priority |
|-------|----------------|----------|
| Phase 1 | 30 min | High |
| Phase 2 | 45 min | High |
| Phase 3 | 30 min | High |
| Phase 4 | 20 min | Medium |
| Phase 5 | 15 min | High |
| **Total** | **140 min** | - |

## Success Metrics

1. **Execution Time**: Explore task execution <5秒 (vs >30秒 previously)
2. **Failure Rate**: Background task attempts reduced by 90%+
3. **Main Agent Blocking**: No more unnecessary waits for failure notifications
4. **Code Adoption**: AGENTS.md strategy used in 3+ subsequent features

## Rollout Strategy

1. **Phase 1-2**: Core infrastructure (capabilities + runtime)
2. **Phase 3-4**: Documentation and guidance
3. **Phase 5**: Validation and governance sync
4. **Post-Release**: Observe adoption in subsequent features

## Future Enhancements

1. **Dynamic Failure Rate Tracking**: Collect real execution data, adjust failure_rate
2. **Auto-Fallback Implementation**: Runtime helper for automatic fallback
3. **Cross-Platform Extension**: Apply to Claude Code, Gemini CLI
4. **Performance Metrics Dashboard**: Track execution mode effectiveness

## References

- `specs/047-background-task-execution-strategy/spec.md` - Feature specification
- `adapters/platform/opencode/capabilities.json` - Current capabilities
- `docs/validation/T-006-expert-pack-validation-report.md` - Background task failure analysis
- `AGENTS.md` Phase 2A - Exploration & Research section