# Feature: Auto Error Report to GitHub - Implementation Plan

## Feature ID
`045-auto-error-report`

## Version
`0.1.0`

## Created
2026-04-05

---

## Architecture Summary

### Problem Statement
Feature 043 (error-reporter) 建立了统一的 error-report artifact 格式，Feature 044 (github-issue-reporter) 提供了 CLI 手动发布命令，但用户仍需手动执行 CLI 才能发布错误报告，无法实现"自动"需求。

### Solution Overview
创建自动触发模块 (`lib/auto-error-report/`)，在 failure-analysis skill 输出后自动检查条件并调用 github-issue-reporter 发布到 GitHub Issue，无需用户手动干预。

### Architecture Pattern
采用 **触发点集成模式**：
- failure-analysis（上游）生成 error-report artifact
- auto-error-report（中间层）检查配置、severity threshold、rate limit
- github-issue-reporter（下游）消费 artifact，发布到 Issue
- 不改变上游/下游模块，仅添加中间层自动化

### Module Structure
```
auto-error-report/
├── .opencode/auto-report.json          # 配置文件
├── lib/auto-error-report/
│   ├── index.js                        # 核心模块入口
│   ├── config-loader.js                # 配置加载器
│   ├── rate-limiter.js                 # Rate limit 逻辑
│   ├── dedup-manager.js                # 去重管理
│   └── trigger-checker.js              # 触发条件检查
├── .opencode/skills/common/failure-analysis/
│   └── SKILL.md                        # 修改：添加自动触发步骤
└── adapters/*/retry-handler.js         # 修改：添加触发点
```

---

## Inputs from Spec

### Core Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | 全局配置文件 `.opencode/auto-report.json` | P0 |
| FR-002 | 触发点集成 | P0 |
| FR-003 | 自动触发模块 `lib/auto-error-report/index.js` | P0 |
| FR-004 | 与 github-issue-reporter 集成 | P0 |
| FR-005 | Rate Limit 机制 | P0 |
| FR-006 | 错误去重 | P1 |

### Acceptance Criteria
| ID | Criteria | Validation |
|----|----------|------------|
| AC-001 | 配置文件生效，文件不存在时默认禁用 | Unit tests |
| AC-002 | failure-analysis skill 执行后检查自动报告条件 | Integration tests |
| AC-003 | Rate Limit 生效，小时报告数限制、去重窗口 | Unit tests |
| AC-004 | 自动报告失败时主流程继续执行 | Failure tests |
| AC-005 | Token 从环境变量读取，敏感信息被 redact | Security review |

---

## Technical Constraints

### Dependencies (TC-001)
| Dependency | Status | Impact |
|------------|--------|--------|
| Feature 043: error-reporter | Complete ✅ | error-report artifact 定义 |
| Feature 044: github-issue-reporter | Complete ✅ | 发布到 GitHub Issue |
| Node.js crypto 模块 | Built-in | Hash 计算 |
| `.opencode/auto-report.json` | Create | 配置文件 |

### File Locations (TC-002)
| File | Purpose | Action |
|------|---------|--------|
| `.opencode/auto-report.json` | 配置文件 | Create |
| `lib/auto-error-report/index.js` | 核心模块入口 | Create |
| `lib/auto-error-report/config-loader.js` | 配置加载 | Create |
| `lib/auto-error-report/rate-limiter.js` | Rate limit | Create |
| `lib/auto-error-report/dedup-manager.js` | 去重管理 | Create |
| `lib/auto-error-report/trigger-checker.js` | 触发检查 | Create |
| `.opencode/skills/common/failure-analysis/SKILL.md` | Skill 修改 | Extend |

---

## Module Decomposition

### Module 1: Configuration Loader
**Location**: `lib/auto-error-report/config-loader.js`

**Responsibilities**:
- 加载 `.opencode/auto-report.json` 配置文件
- 验证配置 schema
- 处理配置文件不存在/验证失败场景

**API**:
```typescript
interface AutoReportConfig {
  enabled: boolean;
  github_token_env: string;
  target_repository: {
    owner: string;
    repo: string;
  };
  report_conditions: {
    severity_threshold: 'low' | 'medium' | 'high' | 'critical';
    only_expert_pack_errors: boolean;
    exclude_types: string[];
  };
  rate_limit: {
    max_per_hour: number;
    max_per_day: number;
    dedup_window_minutes: number;
  };
  privacy: {
    include_stack_trace: boolean;
    redact_secrets: boolean;
  };
}

function loadConfig(): {
  success: boolean;
  config?: AutoReportConfig;
  error?: string;
  default_used?: boolean;
};
```

**Behavior**:
- 文件不存在：返回 `default_used: true`, `enabled: false`
- Schema 验证失败：返回 `success: false`, `error: validation error`, 禁用并记录警告

---

### Module 2: Rate Limiter
**Location**: `lib/auto-error-report/rate-limiter.js`

**Responsibilities**:
- 检查小时/天级别报告计数
- 记录报告历史（内存缓存）
- 提供剩余配额查询

**API**:
```typescript
interface RateLimitResult {
  allowed: boolean;
  remaining_hour: number;
  remaining_day: number;
  reason?: 'hour_limit' | 'day_limit' | 'dedup_window';
}

function checkRateLimit(config: AutoReportConfig): RateLimitResult;
function recordReport(errorHash: string, timestamp: Date): void;
function getHourCount(): number;
function getDayCount(): number;
```

**Implementation**:
- 使用内存 Map 存储报告历史
- Key: `{hour_key}` / `{day_key}` 计数器
- Key: `{error_hash}` → `{last_report_time}` 去重映射

---

### Module 3: Dedup Manager
**Location**: `lib/auto-error-report/dedup-manager.js`

**Responsibilities**:
- 基于 error-report 内容计算 hash
- 检查去重窗口内是否已报告
- 维护 hash → timestamp 映射

**API**:
```typescript
function computeErrorHash(errorReport: ErrorReport): string;
function isDuplicate(errorHash: string, dedupWindowMinutes: number): boolean;
function recordErrorHash(errorHash: string): void;
```

**Hash 计算** (FR-006):
```javascript
const hash = crypto
  .createHash('sha256')
  .update(`${error_code}:${title}:${dispatch_id}`)
  .digest('hex')
  .substring(0, 16);
```

---

### Module 4: Trigger Checker
**Location**: `lib/auto-error-report/trigger-checker.js`

**Responsibilities**:
- 检查配置是否启用
- 检查 severity threshold
- 检查 exclude_types
- 检查 only_expert_pack_errors

**API**:
```typescript
interface TriggerCheckResult {
  should_trigger: boolean;
  reason?: 'disabled' | 'severity_below_threshold' | 'type_excluded' | 'not_expert_pack_error';
}

function shouldAutoReport(
  errorReport: ErrorReport,
  config: AutoReportConfig
): TriggerCheckResult;
```

**Severity Threshold Mapping**:
| Threshold | Included Severities |
|-----------|--------------------|
| low | low, medium, high, critical |
| medium | medium, high, critical |
| high | high, critical |
| critical | critical only |

---

### Module 5: Core Module (index.js)
**Location**: `lib/auto-error-report/index.js`

**Responsibilities**:
- 协调配置加载 → 触发检查 → Rate limit → 发布流程
- 异步执行，失败静默
- 返回发布结果

**API**:
```typescript
interface AutoReportResult {
  success: boolean;
  triggered: boolean;
  reason?: string;
  issue_url?: string;
  error?: string;
}

async function autoReportError(errorReport: ErrorReport): AutoReportResult;
function shouldAutoReport(errorReport: ErrorReport, config: AutoReportConfig): boolean;
function checkRateLimit(config: AutoReportConfig): RateLimitResult;
function loadConfig(): AutoReportConfig;
```

**Integration with github-issue-reporter** (FR-004):
```javascript
import { reportToIssue } from '../github-issue-reporter/index.js';

async function autoReportError(errorReport) {
  const configResult = loadConfig();
  if (!configResult.success || !configResult.config.enabled) {
    return { success: false, triggered: false, reason: 'disabled' };
  }
  
  if (!shouldAutoReport(errorReport, configResult.config)) {
    return { success: false, triggered: false, reason: 'conditions_not_met' };
  }
  
  const rateLimitResult = checkRateLimit(configResult.config);
  if (!rateLimitResult.allowed) {
    return { success: false, triggered: false, reason: rateLimitResult.reason };
  }
  
  try {
    const result = await reportToIssue(errorReport, {
      owner: configResult.config.target_repository.owner,
      repo: configResult.config.target_repository.repo,
      githubConfig: { token: process.env[configResult.config.github_token_env] }
    });
    
    if (result.success) {
      recordReport(computeErrorHash(errorReport), new Date());
    }
    
    return { success: result.success, triggered: true, issue_url: result.comment_url };
  } catch (error) {
    return { success: false, triggered: true, error: error.message };
  }
}
```

---

### Module 6: Skill Integration Point
**Location**: `.opencode/skills/common/failure-analysis/SKILL.md`

**Modification**:
- 在 Step 6 后添加 "Step 7: 自动触发检查"
- 调用 `lib/auto-error-report/index.js` 的 `autoReportError`

**Integration Pattern**:
```
failure-analysis Step 6: 生成 failure analysis report
    ↓
Step 7: 自动触发检查
    ↓
    ├── 生成 error-report artifact（调用 error-reporter）
    ↓
    ├── 调用 autoReportError(errorReport)
    ↓
    ├── 异步执行，失败静默
    ↓
    └── 继续主流程（返工/升级决策）
```

---

## Data Flow

### Workflow 1: 自动触发流程

```
[Role Execution] → [failure-analysis]
                          ↓
                  [生成 error-report artifact]
                          ↓
                  [auto-error-report 检查]
                          ├── loadConfig() → 检查 enabled
                          ├── shouldAutoReport() → 检查 severity threshold
                          ├── checkRateLimit() → 检查计数/去重
                          ↓
                  [满足条件]
                          ↓
                  [github-issue-reporter.reportToIssue()]
                          ↓
                  [发布到 GitHub Issue]
                          ↓
                  [recordReport() → 更新 rate limit 状态]
                          ↓
                  [继续主流程（异步，失败静默）]
```

### Workflow 2: 配置初始化

```
[用户创建 .opencode/auto-report.json]
                          ↓
                  [config-loader.loadConfig()]
                          ├── Schema validation
                          ├── 默认值填充
                          ↓
                  [返回 AutoReportConfig]
                          ↓
                  [后续调用使用配置]
```

### Data Transformation

```
Error Report Artifact (ErrorReport)
  → computeErrorHash() → 16-char hash (去重)
  → shouldAutoReport() → boolean (条件检查)
  → checkRateLimit() → RateLimitResult (配额检查)
  → reportToIssue() → GitHub API POST
  → AutoReportResult (返回结果)
```

---

## Failure Handling

### Error Types

| Error Type | Code | Handling |
|------------|------|----------|
| CONFIG_LOAD_FAILED | ERR-AER-001 | 禁用自动报告，记录警告日志 |
| CONFIG_VALIDATION_FAILED | ERR-AER-002 | 禁用自动报告，记录警告日志 |
| RATE_LIMIT_EXCEEDED | ERR-AER-003 | 跳过报告，记录 skipped 日志 |
| DEDUP_WINDOW_HIT | ERR-AER-004 | 跳过报告，记录 skipped 日志 |
| GITHUB_TOKEN_MISSING | ERR-AER-005 | 跳过报告，记录警告日志 |
| PUBLISH_FAILED | ERR-AER-006 | 记录失败日志，继续主流程 |

### Failure Isolation (NFR-002)
- 自动报告失败不影响主执行流程
- 所有异常被捕获，返回 `success: false`
- 失败信息写入日志，不抛出错误

### Retry Strategy
- 自动报告不重试（避免阻塞主流程）
- 用户可通过 CLI 命令手动重试

---

## Validation Strategy

### Unit Tests
| Module | Test Focus |
|--------|------------|
| config-loader.js | 配置加载，schema validation，默认值处理 |
| rate-limiter.js | 小时/天计数，去重窗口检查 |
| dedup-manager.js | hash 计算，去重逻辑 |
| trigger-checker.js | severity threshold，exclude_types |
| index.js | 协调流程，异步执行 |

### Integration Tests
| Scenario | Test Focus |
|----------|------------|
| Full workflow | failure-analysis → auto-error-report → github-issue-reporter |
| Skill integration | failure-analysis SKILL.md 执行后自动触发 |
| Failure isolation | 自动报告失败时主流程继续 |

### Validation Commands
```bash
# Unit tests
npm test tests/unit/auto-error-report/

# Integration tests
npm test tests/integration/auto-error-report/

# Manual config validation
node lib/auto-error-report/config-loader.js --validate
```

---

## Risks / Tradeoffs

### Risk-001: Token 泄露
- **描述**: GitHub Token 可能被泄露
- **影响**: 安全风险
- **缓解**: 仅从环境变量读取，不存储在配置文件中
- **Severity**: high

### Risk-002: 噪音过多
- **描述**: 自动报告可能产生过多 Issue 评论
- **影响**: Issue 信息噪音
- **缓解**: Rate limit + severity threshold + dedup
- **Severity**: medium

### Risk-003: 阻塞主流程
- **描述**: 自动报告可能阻塞主执行流程
- **影响**: 用户体验下降
- **缓解**: 异步执行，失败静默
- **Severity**: low

### Risk-004: 内存缓存丢失
- **描述**: Rate limit 使用内存缓存，进程重启后丢失
- **影响**: 可能重复报告
- **缓解**: 去重窗口较短（60分钟），影响有限
- **Severity**: low

### Tradeoff-001: 内存缓存 vs 文件存储
- **选择**: 内存缓存
- **原因**: 性能优先，避免文件 I/O 阻塞
- **代价**: 进程重启后 rate limit 状态丢失
- **评估**: 可接受（去重窗口短，影响有限）

### Tradeoff-002: 默认禁用 vs 默认启用
- **选择**: 默认禁用 (`enabled: false`)
- **原因**: 安全优先，避免意外发布
- **代价**: 用户需显式配置才能启用
- **评估**: 符合安全最佳实践

---

## Requirement Traceability

### FR-001 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| 全局配置文件 | Module 1 | `lib/auto-error-report/config-loader.js` |
| 配置 Schema | Module 1 | `.opencode/auto-report.json` |

### FR-002 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| 触发点集成 | Module 6 | `.opencode/skills/common/failure-analysis/SKILL.md` |

### FR-003 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| 自动触发模块 | Module 5 | `lib/auto-error-report/index.js` |

### FR-004 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| github-issue-reporter 集成 | Module 5 | `lib/auto-error-report/index.js` |

### FR-005 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| Rate Limit 机制 | Module 2 | `lib/auto-error-report/rate-limiter.js` |

### FR-006 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| 错误去重 | Module 3 | `lib/auto-error-report/dedup-manager.js` |

### NFR → Validation
| Non-functional Requirement | Validation Method |
|---------------------------|-------------------|
| NFR-001: 性能 | Benchmark tests (< 10ms) |
| NFR-002: 失败静默 | Failure isolation tests |
| NFR-003: 安全 | Security review |
| NFR-004: 可配置性 | Config validation tests |

---

## Implementation Order

### Phase 1: 配置系统 (M1)
1. 创建 `.opencode/auto-report.json` schema
2. 创建 `lib/auto-error-report/config-loader.js`
3. 编写配置 schema validation

### Phase 2: 自动触发模块 (M2)
1. 创建 `lib/auto-error-report/rate-limiter.js`
2. 创建 `lib/auto-error-report/dedup-manager.js`
3. 创建 `lib/auto-error-report/trigger-checker.js`
4. 创建 `lib/auto-error-report/index.js`

### Phase 3: 集成触发点 (M3)
1. 修改 `.opencode/skills/common/failure-analysis/SKILL.md`
2. 添加 "Step 7: 自动触发检查"
3. 测试自动触发流程

### Phase 4: 验证 (M4)
1. 编写单元测试
2. 编写集成测试
3. 文档更新

---

## Open Questions Resolution

### OQ-001: 配置文件位置
- **Decision**: 选择选项 A (`.opencode/auto-report.json`)
- **原因**: 与现有 `.opencode` 目录结构一致
- **影响**: 用户需在 `.opencode` 目录下创建配置

### OQ-002: 默认目标仓库
- **Decision**: 用户必须配置，无默认值
- **原因**: 避免意外发布到错误仓库
- **实现**: `target_repository.owner` 和 `repo` 为必填字段

### OQ-003: Issue 关联失败处理
- **Decision**: 跳过报告，记录警告日志
- **原因**: 遵循失败静默原则
- **实现**: 返回 `success: false, reason: 'NO_ISSUE_ASSOCIATED'`

---

## Assumptions

### A-001: github-issue-reporter 稳定
- 假设 Feature 044 的 github-issue-reporter 已稳定可用
- 如果不稳定，自动报告可能失败

### A-002: error-report 格式不变
- 假设 Feature 043 的 error-report artifact 格式不变
- 直接消费 043 定义的格式

### A-003: 内存缓存足够
- 假设内存缓存能满足 rate limit 需求
- 去重窗口短（60分钟），内存占用有限

### A-004: 异步执行不阻塞
- 假设 Node.js async/await 异步执行不阻塞主流程
- 验证: 测试自动报告执行时间

---

## References

- `specs/043-error-reporter/spec.md` - error-reporter feature 定义
- `specs/044-github-issue-reporter/spec.md` - github-issue-reporter feature 定义
- `specs/044-github-issue-reporter/plan.md` - github-issue-reporter 实现计划
- `.opencode/skills/common/failure-analysis/SKILL.md` - 触发点
- `lib/github-issue-reporter/index.js` - github-issue-reporter 模块
- `io-contract.md` §2 - Execution Result Contract

---

## Next Steps

1. `/spec-tasks 045-auto-error-report` - 生成任务列表
2. `/spec-implement 045-auto-error-report T-045-001` - 开始实现第一个任务