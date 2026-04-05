# Feature 045: Auto Error Report to GitHub

## Feature ID
`045-auto-error-report`

## Status
`draft`

## Version
`0.1.0`

## Created
2026-04-05

---

## Overview

### Goal
实现错误自动报告机制：当执行层检测到专家包责任错误且严重级别达到阈值时，自动调用 `github-issue-reporter` 发布到 GitHub Issue，无需用户手动执行 CLI 命令。

### Background

当前状态：
- **043-error-reporter**: 定义 error-report artifact 格式
- **044-github-issue-reporter**: 提供 CLI 手动发布命令

**问题**：用户需要手动执行 CLI 才能发布错误报告，无法实现"自动"需求。

---

## Scope

### In Scope

1. **全局配置文件**：`.opencode/auto-report.json` 控制启用/禁用和参数
2. **触发点集成**：
   - `failure-analysis` skill 输出后自动检查
   - Adapter 层 retry-handler 失败时触发
3. **严重级别阈值**：只自动报告 medium 及以上错误
4. **Rate Limit**：防止短时间内重复报告
5. **Token 管理**：从环境变量或配置文件读取 GITHUB_TOKEN

### Out of Scope

- 改变 error-report artifact 格式（043 定义）
- 改变 github-issue-reporter CLI 接口（044 定义）
- 自动解决错误（只报告，不修复）

---

## Actors

| Actor | Role |
|-------|------|
| **Expert Pack User** | 配置自动报告，接收 Issue 通知 |
| **failure-analysis skill** | 检测错误，触发自动报告 |
| **github-issue-reporter** | 发布错误到 GitHub Issue |
| **GitHub API** | 创建/更新 Issue 评论 |

---

## Core Workflows

### Workflow 1: 自动触发流程

```
Error Occurs
    │
    ▼
failure-analysis skill 分析错误
    │
    ▼
生成 error-report artifact
    │
    ▼
检查 auto-report.json 配置
    │
    ├─ disabled → 结束
    │
    └─ enabled → 检查严重级别阈值
                    │
                    ├─ severity < threshold → 结束
                    │
                    └─ severity >= threshold → 检查 rate limit
                                    │
                                    ├─ exceeded → 记录日志，跳过
                                    │
                                    └─ ok → 调用 github-issue-reporter
                                                │
                                                ▼
                                        发布到 GitHub Issue
```

### Workflow 2: 配置初始化

```
用户创建 .opencode/auto-report.json
    │
    ├─ enabled: true/false
    ├─ github_token: "xxx" 或 环境变量 GITHUB_TOKEN
    ├─ target_repo: { owner, repo }
    ├─ severity_threshold: "medium"
    └─ rate_limit: { max_per_hour: 5 }
```

---

## Functional Requirements

### FR-001: 全局配置文件

创建 `.opencode/auto-report.json` 作为自动报告的配置中心。

**Schema:**
```json
{
  "enabled": false,
  "github_token_env": "GITHUB_TOKEN",
  "target_repository": {
    "owner": "Burburton",
    "repo": "amazing-specialists"
  },
  "report_conditions": {
    "severity_threshold": "medium",
    "only_expert_pack_errors": true,
    "exclude_types": ["ENVIRONMENT_ISSUE"]
  },
  "rate_limit": {
    "max_per_hour": 5,
    "max_per_day": 20,
    "dedup_window_minutes": 60
  },
  "privacy": {
    "include_stack_trace": true,
    "redact_secrets": true
  }
}
```

### FR-002: 触发点集成

在以下位置添加自动触发检查：

| 触发点 | 文件 | 触发条件 |
|--------|------|----------|
| failure-analysis skill | `.opencode/skills/common/failure-analysis/SKILL.md` | 分析完成后检查 severity |
| Adapter retry-handler | `adapters/*/retry-handler.js` | 返工次数达到限制时 |
| execution-reporting skill | `.opencode/skills/common/execution-reporting/SKILL.md` | Execution status = FAILED |

### FR-003: 自动触发模块

创建 `lib/auto-error-report/index.js` 作为自动触发核心模块。

**Exports:**
```javascript
// 检查是否应自动报告
shouldAutoReport(errorReport, config): boolean

// 执行自动报告
async function autoReportError(errorReport): Promise<{ success: boolean, issue_url?: string, error?: string }>

// 检查 rate limit
checkRateLimit(config): { allowed: boolean, remaining: number }

// 加载配置
loadConfig(): AutoReportConfig
```

### FR-004: 与 github-issue-reporter 集成

自动调用现有的 `github-issue-reporter` 模块，不重复实现发布逻辑。

```javascript
import { publishErrorReport } from '../github-issue-reporter/index.js';

async function autoReportError(errorReport) {
  const config = loadConfig();
  if (!shouldAutoReport(errorReport, config)) {
    return { success: false, error: 'Conditions not met' };
  }
  
  const result = await publishErrorReport({
    errorReport,
    owner: config.target_repository.owner,
    repo: config.target_repository.repo,
    token: process.env[config.github_token_env]
  });
  
  return result;
}
```

### FR-005: Rate Limit 机制

防止短时间内重复报告相同错误。

**实现:**
- 使用内存缓存记录最近报告的错误 hash
- 相同 hash 在 dedup_window_minutes 内不重复报告
- 小时/天级别计数限制

### FR-006: 错误去重

基于 error-report 内容计算 hash，避免重复报告。

**Hash 计算:**
```javascript
const hash = crypto
  .createHash('sha256')
  .update(`${error_code}:${title}:${dispatch_id}`)
  .digest('hex')
  .substring(0, 16);
```

---

## Non-functional Requirements

### NFR-001: 性能
- 自动触发检查 < 10ms
- 不阻塞主执行流程（异步执行）

### NFR-002: 失败静默
- 自动报告失败不影响主流程
- 失败时仅记录日志，不抛出错误

### NFR-003: 安全
- GitHub Token 不硬编码，从环境变量读取
- 自动 redact 敏感信息（secrets, tokens, passwords）

### NFR-004: 可配置性
- 默认禁用（enabled: false）
- 所有参数可通过配置文件调整

---

## Acceptance Criteria

### AC-001: 配置文件生效
- [ ] `.opencode/auto-report.json` 存在时读取配置
- [ ] 文件不存在时默认禁用
- [ ] 配置验证失败时禁用并记录警告

### AC-002: 自动触发成功
- [ ] failure-analysis skill 执行后检查自动报告条件
- [ ] severity >= threshold 时触发 github-issue-reporter
- [ ] 发布成功返回 issue_url

### AC-003: Rate Limit 生效
- [ ] 小时报告数超过 max_per_hour 时跳过
- [ ] 相同错误在 dedup_window 内不重复报告

### AC-004: 失败静默
- [ ] 自动报告失败时主流程继续执行
- [ ] 失败信息写入日志

### AC-005: 安全性
- [ ] Token 从环境变量读取
- [ ] stack_trace 中的敏感信息被 redact

---

## Technical Constraints

### TC-001: Dependencies
- Feature 043: error-reporter
- Feature 044: github-issue-reporter
- Node.js crypto 模块（hash）

### TC-002: File Locations
- `.opencode/auto-report.json` - 配置文件
- `lib/auto-error-report/index.js` - 核心模块
- `lib/auto-error-report/config-loader.js` - 配置加载器
- `lib/auto-error-report/rate-limiter.js` - Rate limit 逻辑

---

## Risks

### Risk-001: Token 泄露
- **缓解**: 仅从环境变量读取，不存储在配置文件中

### Risk-002: 噪音过多
- **缓解**: Rate limit + severity threshold + dedup

### Risk-003: 阻塞主流程
- **缓解**: 异步执行，失败静默

---

## Milestones

### M1: 配置系统
- 创建 auto-report.json schema
- 实现配置加载器

### M2: 自动触发模块
- 实现 shouldAutoReport
- 实现 rate limiter
- 实现 autoReportError

### M3: 集成触发点
- 修改 failure-analysis SKILL.md
- 测试自动触发

### M4: 验证
- 单元测试
- 集成测试
- 文档更新

---

## Open Questions

### OQ-001: 配置文件位置
- **选项 A**: `.opencode/auto-report.json`（推荐）
- **选项 B**: `specs/.auto-report.json`

### OQ-002: 默认目标仓库
- **问题**: 默认报告到哪个仓库？
- **建议**: 用户必须配置，无默认值

### OQ-003: Issue 关联失败处理
- **问题**: 无法确定 Issue 时如何处理？
- **建议**: 跳过报告，记录警告日志

---

## References

- `specs/043-error-reporter/spec.md` - Error Report Artifact
- `specs/044-github-issue-reporter/spec.md` - GitHub Issue Reporter
- `.opencode/skills/common/failure-analysis/SKILL.md` - 触发点