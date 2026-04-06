# Feature Spec: Background Task Execution Strategy Optimization

## Metadata

| Field | Value |
|-------|-------|
| Feature ID | `047-background-task-execution-strategy` |
| Status | Complete |
| Created | 2026-04-07 |
| Priority | Medium |
| Target Milestone | M4 Maintenance |

## Background

### Problem Statement

OpenCode平台的background task执行存在以下问题：

1. **PAT Rejection**: 使用`task(subagent_type="...", run_in_background=true)`会触发PAT验证错误，导致background task立即失败
2. **主Agent阻塞**: Background task失败后，主agent被迫等待notification处理，失去并行优势
3. **执行效率下降**: 本应<5秒的explore/librarian任务，因background失败处理耗时>30秒

### Current Behavior

```
主agent调用 task(run_in_background=true)
  ↓ 立即返回 task_id
主agent调用 background_output(block=true)
  ↓ 阻塞等待（可能60秒）
background task启动 → PAT rejection → 立即失败
  ↓ 系统notification返回失败
主agent被迫处理失败 → retry或fallback
  ↓ 失去了并行执行的时间窗口
```

### Root Cause Analysis

OpenCode平台的background subagent spawning endpoint不支持Personal Access Token (PAT)认证：
- Background task需要isolated execution context
- Subagent spawning使用PAT → endpoint拒绝
- Platform Adapter已提供workaround (category + load_skills)，但缺乏智能执行策略选择

## Goal

建立**智能执行策略选择机制**，让主agent根据任务类型和平台能力自动选择最优执行模式，避免不必要的background task失败和主agent阻塞。

### Success Criteria

1. 主agent不再因background task失败而阻塞等待
2. Explore/Librarian等快速任务执行时间从>30秒降至<5秒
3. Deep/Oracle等长任务有可靠的fallback机制
4. Platform Adapter capabilities包含执行策略指导metadata

## Scope

### In Scope

1. **Platform Adapter Capabilities增强**
   - 新增`background_task_failure_rate`字段
   - 新增`recommended_execution_mode`指导
   - 新增`known_issues`详细描述

2. **AGENTS.md执行策略指导**
   - OpenCode平台适配策略章节
   - 任务类型vs执行模式决策表
   - Non-blocking execution原则

3. **Runtime辅助API**
   - `getExecutionStrategy(taskType)` - 自动推荐执行模式
   - `shouldUseBackground(taskType)` - 判断是否使用background
   - Fallback handler框架

### Out of Scope

1. OpenCode平台本身的PAT支持改进（platform-level问题）
2. 其他platform adapter（Claude Code, Gemini CLI）
3. 实际测试验证（后续feature）

### Assumptions

1. OpenCode平台的PAT rejection问题短期内无法解决
2. Explore/Librarian任务通常<5秒，适合synchronous模式
3. 主agent遵循"派发后立即结束response"原则
4. Background output永不使用`block=true`

### Dependencies

- `033-platform-adapter` - Platform Adapter Interface
- `034-platform-adapter-runtime` - Runtime API
- `035-platform-adapter-usability` - Usability improvements

## Architecture Overview

### Design Approach

采用**三层决策机制**：

```
Layer 1: Task Type Classifier
  ↓ 根据任务类型(explore/librarian/oracle/deep)分类
  
Layer 2: Platform Capability Checker
  ↓ 检查background_task_failure_rate + supports_background_task
  
Layer 3: Execution Mode Selector
  ↓ 选择最优模式(synchronous/background_with_fallback/background)
```

### Key Components

1. **capabilities.json扩展** - Platform能力声明增强
2. **runtime.ts API扩展** - `getExecutionStrategy()`, `shouldUseBackground()`
3. **AGENTS.md策略指导** - 执行策略最佳实践
4. **决策表** - TaskType × PlatformCapability → ExecutionMode

## Acceptance Criteria

### AC-001: Platform Capabilities Metadata Extended

**验收标准**: capabilities.json包含以下新字段

```json
{
  "background_task_failure_rate": 0.9,
  "recommended_execution_mode": {
    "explore": "synchronous",
    "librarian": "synchronous",
    "oracle": "background_with_fallback",
    "developer": "synchronous"
  },
  "known_issues": [
    {
      "id": "PAT_REJECTION",
      "description": "...",
      "severity": "high",
      "workaround": "..."
    }
  ]
}
```

**验证方法**: JSON schema validation + manual review

### AC-002: Runtime API Extended

**验收标准**: runtime.ts exports以下新API

```typescript
export function getExecutionStrategy(taskType: string): ExecutionStrategy;
export function shouldUseBackground(taskType: string): boolean;

interface ExecutionStrategy {
  mode: 'synchronous' | 'background' | 'background_with_fallback';
  rationale: string;
  fallback_hint?: string;
}
```

**验证方法**: TypeScript compilation + unit tests

### AC-003: AGENTS.md Strategy Guidance Added

**验收标准**: AGENTS.md包含"OpenCode平台适配策略"章节，包含：

1. 快速任务→synchronous建议
2. 长任务→background_with_fallback建议
3. Non-blocking execution原则
4. 决策表（TaskType vs ExecutionMode）

**验证方法**: Manual review + link validation

### AC-004: Decision Table Implemented

**验收标准**: runtime.ts包含决策逻辑

```typescript
const DECISION_TABLE = {
  explore: { max_duration: 5, preferred_mode: 'synchronous' },
  librarian: { max_duration: 5, preferred_mode: 'synchronous' },
  oracle: { max_duration: 60, preferred_mode: 'background_with_fallback' },
  deep: { max_duration: 30, preferred_mode: 'background_with_fallback' }
};
```

**验证方法**: Unit tests covering all task types

### AC-005: Interface Contract Updated

**验收标准**: platform-adapter.interface.ts包含新接口定义

```typescript
interface ExecutionStrategy {
  mode: 'synchronous' | 'background' | 'background_with_fallback';
  rationale: string;
  fallback_hint?: string;
}

interface PlatformCapabilities {
  // existing fields
  background_task_failure_rate?: number;
  recommended_execution_mode?: Record<string, ExecutionMode>;
}
```

**验证方法**: TypeScript compilation + contract schema validation

## Risks and Mitigations

### Risk-001: Task Type Misclassification

**风险**: 主agent可能无法准确判断任务类型

**缓解措施**:
1. 提供明确的task type hint API
2. AGENTS.md包含典型场景示例
3. Runtime提供fallback logic

### Risk-002: Execution Mode Over-Specification

**风险**: 策略过于复杂，主agent难以遵循

**缓解措施**:
1. 保持决策逻辑简单：quick task → synchronous, long task → background_with_fallback
2. 提供明确的"always safe"默认策略
3. AGENTS.md包含simple decision tree

### Risk-003: Platform Capability Drift

**风险**: OpenCode平台可能修复PAT问题，导致failure_rate变化

**缓解措施**:
1. failure_rate作为动态配置，可随时更新
2. 提供override机制
3. 定期re-validation机制（未来feature）

## Open Questions

### OQ-001: Failure Rate Threshold

**问题**: background_task_failure_rate的阈值如何确定？

**当前假设**: >0.3视为不可靠，推荐synchronous/fallback

**需要验证**: 实际运行数据收集（后续feature）

### OQ-002: Fallback Handler Implementation

**问题**: Fallback handler是否需要在runtime中实现，还是由AGENTS.md指导？

**当前假设**: 仅在AGENTS.md提供指导原则，runtime返回fallback_hint

**决策依据**: 保持runtime轻量，避免侵入主agent逻辑

### OQ-003: Synchronous Task Parallelization

**问题**: 多个synchronous task是否可以在同一message中派发？

**当前假设**: 可以，但会串行执行，总时间=sum(individual times)

**需要验证**: OpenCode平台实际行为测试

## Implementation Notes

### Phase 1: Metadata Enhancement (Priority: High)

1. 更新 `capabilities.json`
2. 更新 `role-mapping.json`（如需）
3. 更新 interface定义

### Phase 2: Runtime API (Priority: High)

1. 实现 `getExecutionStrategy()`
2. 实现 `shouldUseBackground()`
3. 实现 decision table

### Phase 3: AGENTS.md Guidance (Priority: High)

1. 新增"OpenCode平台适配策略"章节
2. 添加执行策略示例
3. 更新Phase 2A - Exploration & Research章节

### Phase 4: Documentation Sync (Priority: Medium)

1. 更新 `docs/platform-adapter-guide.md`
2. 更新 `adapters/platform/opencode/README.md`
3. 添加usage examples

## References

- `specs/033-platform-adapter/spec.md` - Platform Adapter设计
- `specs/034-platform-adapter-runtime/spec.md` - Runtime API设计
- `docs/validation/T-006-expert-pack-validation-report.md` - Background task失败分析
- `AGENTS.md` Phase 2A - Exploration & Research
- `adapters/platform/opencode/README.md` - Known Issues