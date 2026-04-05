# Feature: Secrets Redaction - Implementation Plan

## Feature ID
`046-secrets-redaction`

## Version
`0.1.0`

## Created
2026-04-05

---

## Architecture Summary

### Problem Statement
Feature 045 (auto-error-report) 的安全审查发现 Sec-002：`privacy.redact_secrets: true` 配置项存在但实际 secrets redaction 逻辑未实现。Stack traces 和错误详情可能包含敏感信息（tokens, passwords, API keys），直接发布到 GitHub Issue 会暴露敏感数据。

### Solution Overview
创建 secrets-redaction 模块 (`lib/secrets-redaction/`)，在 error-report 发布到 GitHub Issue 前自动检测并过滤敏感信息，确保敏感数据不会泄露。

### Architecture Pattern
采用 **拦截过滤模式**：
- github-issue-reporter（调用者）在格式化 comment 前调用 scrubber
- auto-error-report（调用者）在传递 error-report 前调用 scrubber
- 日志模块（调用者）在写入日志前调用 scrubber
- 不改变上游 error-report 格式，仅过滤输出副本

### Module Structure
```
secrets-redaction/
├── .opencode/secrets-redaction.json    # 配置文件
├── lib/secrets-redaction/
│   ├── index.js                        # 核心模块入口
│   ├── patterns.js                     # 默认模式定义
│   ├── scrubber.js                     # 过滤逻辑
│   ├── config-loader.js                # 配置加载器
│   └── audit-logger.js                 # 审计日志
├── lib/github-issue-reporter/
│   └── error-comment-formatter.js      # 修改：调用 scrubber
├── lib/auto-error-report/
│   └── index.js                        # 修改：调用 scrubber
└── tests/unit/secrets-redaction/       # 单元测试
```

---

## Inputs from Spec

### Core Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | 默认敏感信息模式（12 种） | P0 |
| FR-002 | 过滤算法（深度遍历 + 替换） | P0 |
| FR-003 | 可配置规则（自定义模式） | P1 |
| FR-004 | 过滤位置（reporter + auto-report + log） | P0 |
| FR-005 | 审计日志（不记录敏感信息） | P1 |

### Acceptance Criteria
| ID | Criteria | Validation |
|----|----------|------------|
| AC-001 | 12 种默认模式正确检测 | Unit tests for each pattern |
| AC-002 | 敏感信息替换为 `[REDACTED:<type>]` | Transformation tests |
| AC-003 | 自定义模式与默认模式同时生效 | Custom pattern tests |
| AC-004 | github-issue-reporter 发布前调用过滤 | Integration tests |
| AC-005 | 单元测试覆盖所有模式 + 集成测试 | Test coverage > 90% |

---

## Technical Constraints

### Dependencies (TC-001)
| Dependency | Status | Impact |
|------------|--------|--------|
| Feature 044: github-issue-reporter | Complete ✅ | Integration point |
| Feature 045: auto-error-report | Complete ✅ | Integration point |
| Node.js 正则引擎 | Built-in | Pattern matching |

### File Locations (TC-002)
| File | Purpose | Action |
|------|---------|--------|
| `lib/secrets-redaction/index.js` | 核心模块入口 | Create |
| `lib/secrets-redaction/patterns.js` | 默认模式定义 | Create |
| `lib/secrets-redaction/scrubber.js` | 过滤逻辑 | Create |
| `lib/secrets-redaction/config-loader.js` | 配置加载 | Create |
| `lib/secrets-redaction/audit-logger.js` | 审计日志 | Create |
| `.opencode/secrets-redaction.json` | 配置文件 | Create |
| `lib/github-issue-reporter/error-comment-formatter.js` | Integration | Modify |
| `lib/auto-error-report/index.js` | Integration | Modify |

---

## Module Decomposition

### Module 1: Default Patterns
**Location**: `lib/secrets-redaction/patterns.js`

**Responsibilities**:
- 定义 12 种默认敏感信息检测模式
- 提供模式元数据（name, description, severity）
- 支持模式启用/禁用

**Pattern Definitions** (FR-001):
```typescript
interface SecretPattern {
  name: string;                    // 模式名称
  type: string;                    // 替换类型标识
  pattern: RegExp;                 // 正则表达式
  description: string;             // 描述
  severity: 'critical' | 'high' | 'medium';
  examples: string[];              // 匹配示例
}

const DEFAULT_PATTERNS: SecretPattern[] = [
  {
    name: 'github_token',
    type: 'github-token',
    pattern: /ghp_[a-zA-Z0-9]{36}/g,
    description: 'GitHub Personal Access Token',
    severity: 'critical',
    examples: ['ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx']
  },
  {
    name: 'github_app_token',
    type: 'github-app-token',
    pattern: /ghs_[a-zA-Z0-9]{36}/g,
    description: 'GitHub App Token',
    severity: 'critical',
    examples: ['ghs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx']
  },
  {
    name: 'aws_access_key',
    type: 'aws-access-key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    description: 'AWS Access Key ID',
    severity: 'critical',
    examples: ['AKIAIOSFODNN7EXAMPLE']
  },
  {
    name: 'aws_secret_key',
    type: 'aws-secret-key',
    pattern: /[A-Za-z0-9/+=]{40}/g,
    description: 'AWS Secret Access Key (context-aware)',
    severity: 'critical',
    examples: ['wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY']
  },
  {
    name: 'api_key_generic',
    type: 'api-key',
    pattern: /(?i)(api[_-]?key|apikey)['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{20,}/g,
    description: 'Generic API Key',
    severity: 'high',
    examples: ['api_key: sk-1234567890abcdefghijklmnop']
  },
  {
    name: 'password',
    type: 'password',
    pattern: /(?i)(password|passwd|pwd)['\"]?\s*[:=]\s*['\"]?[^\s'\"]{8,}/g,
    description: 'Password in config',
    severity: 'critical',
    examples: ['password: secret123']
  },
  {
    name: 'secret_generic',
    type: 'secret',
    pattern: /(?i)(secret|token)['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{16,}/g,
    description: 'Generic Secret/Token',
    severity: 'high',
    examples: ['secret: mysecretvalue123456']
  },
  {
    name: 'private_key',
    type: 'private-key',
    pattern: /-----BEGIN\s+(RSA\s+|EC\s+|DSA\s+)?PRIVATE\s+KEY-----/g,
    description: 'PEM Private Key Header',
    severity: 'critical',
    examples: ['-----BEGIN RSA PRIVATE KEY-----']
  },
  {
    name: 'connection_string',
    type: 'connection-string',
    pattern: /(?i)(connection[_-]?string|connstr)['\"]?\s*[:=]\s*['\"]?[^'\"]+/g,
    description: 'Database Connection String',
    severity: 'high',
    examples: ['connection_string: postgresql://user:pass@host/db']
  },
  {
    name: 'env_var_ref',
    type: 'env-var',
    pattern: /\$\{[A-Z_][A-Z0-9_]*\}/g,
    description: 'Environment Variable Reference',
    severity: 'medium',
    examples: ['${MY_SECRET}', '${DATABASE_PASSWORD}']
  },
  {
    name: 'bearer_token',
    type: 'bearer-token',
    pattern: /Bearer\s+[a-zA-Z0-9._-]+/g,
    description: 'Bearer Token in Authorization Header',
    severity: 'critical',
    examples: ['Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9']
  },
  {
    name: 'jwt',
    type: 'jwt',
    pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
    description: 'JWT Token',
    severity: 'critical',
    examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c']
  }
];
```

**API**:
```typescript
function getDefaultPatterns(): SecretPattern[];
function getPatternByName(name: string): SecretPattern | undefined;
function getEnabledPatterns(config: SecretsRedactionConfig): SecretPattern[];
```

---

### Module 2: Scrubber
**Location**: `lib/secrets-redaction/scrubber.js`

**Responsibilities**:
- 深度遍历 error-report 对象
- 对每个字符串字段应用所有模式
- 匹配到的内容替换为 `[REDACTED:<type>]`
- 处理嵌套对象和数组

**API** (FR-002):
```typescript
interface ScrubResult {
  scrubbed: any;                   // 过滤后的对象
  patterns_matched: string[];      // 匹配的模式名称
  fields_redacted: string[];       // 被过滤的字段路径
  redaction_count: number;         // 过滤次数
}

function scrubObject(obj: any, patterns: SecretPattern[]): ScrubResult;
function scrubString(text: string, patterns: SecretPattern[]): string;
function scrubStackTrace(trace: string, patterns: SecretPattern[]): string;
```

**Algorithm** (FR-002):
```
1. 深度遍历 error-report 对象
   ├── 对于字符串字段：应用所有模式
   ├── 对于嵌套对象：递归处理
   ├── 对于数组：遍历处理
   └── 对于其他类型：保持不变

2. 模式匹配与替换
   ├── 匹配到的内容 → `[REDACTED:<type>]`
   ├── 保留字段名（只替换值）
   └── 记录匹配信息

3. 返回安全副本
   ├── 原始对象不变
   ├── 返回过滤后的副本
   └── 返回匹配统计
```

**Implementation**:
```javascript
function scrubObject(obj, patterns) {
  const result = {
    scrubbed: deepClone(obj),
    patterns_matched: [],
    fields_redacted: [],
    redaction_count: 0
  };
  
  traverse(result.scrubbed, (value, path) => {
    if (typeof value === 'string') {
      const scrubbedValue = scrubStringWithPatterns(value, patterns);
      if (scrubbedValue.matches.length > 0) {
        result.scrubbed[path] = scrubbedValue.result;
        result.patterns_matched.push(...scrubbedValue.matches);
        result.fields_redacted.push(path);
        result.redaction_count += scrubbedValue.matches.length;
      }
    }
  });
  
  return result;
}

function scrubStringWithPatterns(text, patterns) {
  let result = text;
  const matches = [];
  
  for (const pattern of patterns) {
    const matched = text.match(pattern.pattern);
    if (matched) {
      result = result.replace(pattern.pattern, `[REDACTED:${pattern.type}]`);
      matches.push(pattern.name);
    }
  }
  
  return { result, matches };
}
```

---

### Module 3: Configuration Loader
**Location**: `lib/secrets-redaction/config-loader.js`

**Responsibilities**:
- 加载 `.opencode/secrets-redaction.json` 配置文件
- 验证配置 schema
- 合并默认模式与自定义模式
- 处理配置文件不存在场景

**API** (FR-003):
```typescript
interface SecretsRedactionConfig {
  enabled: boolean;
  default_patterns: Record<string, boolean>;  // 模式启用状态
  custom_patterns: CustomPattern[];
  context_patterns: ContextPattern[];
  whitelist_fields: string[];                 // 白名单字段路径
  replacement_format: string;                 // 替换格式模板
}

interface CustomPattern {
  name: string;
  pattern: string;                            // 正则表达式字符串
  replacement: string;
  severity: 'critical' | 'high' | 'medium';
}

interface ContextPattern {
  key_pattern: string;                        // 键名匹配模式
  value_pattern: string;                      // 值匹配模式
  description: string;
}

function loadConfig(): {
  success: boolean;
  config?: SecretsRedactionConfig;
  error?: string;
};

function mergePatterns(defaultPatterns: SecretPattern[], customPatterns: CustomPattern[]): SecretPattern[];
```

**Default Config**:
```json
{
  "enabled": true,
  "default_patterns": {
    "github_token": true,
    "github_app_token": true,
    "aws_access_key": true,
    "aws_secret_key": true,
    "api_key_generic": true,
    "password": true,
    "secret_generic": true,
    "private_key": true,
    "connection_string": true,
    "env_var_ref": true,
    "bearer_token": true,
    "jwt": true
  },
  "custom_patterns": [],
  "context_patterns": [],
  "whitelist_fields": [],
  "replacement_format": "[REDACTED:{type}]"
}
```

---

### Module 4: Audit Logger
**Location**: `lib/secrets-redaction/audit-logger.js`

**Responsibilities**:
- 记录过滤操作（不记录敏感信息）
- 输出 JSON 格式审计日志
- 支持日志级别控制

**API** (FR-005):
```typescript
interface AuditLogEntry {
  timestamp: string;
  action: 'secrets_redaction';
  input_type: string;             // error-report | comment | log
  patterns_matched: string[];
  fields_redacted: string[];
  output_status: 'success' | 'no_matches' | 'error';
  redaction_count: number;
  source: string;                 // 来源模块
}

function logRedaction(entry: AuditLogEntry): void;
function getAuditLog(): AuditLogEntry[];
```

**Log Format** (FR-005):
```json
{
  "timestamp": "2026-04-05T10:30:00Z",
  "action": "secrets_redaction",
  "input_type": "error-report",
  "patterns_matched": ["github_token", "password"],
  "fields_redacted": ["error_details.stacktrace_or_context", "context.config"],
  "output_status": "success",
  "redaction_count": 3,
  "source": "github-issue-reporter"
}
```

---

### Module 5: Core Module (index.js)
**Location**: `lib/secrets-redaction/index.js`

**Responsibilities**:
- 协调配置加载 → 模式合并 → scrubber → audit log
- 提供统一 API 供调用者使用
- 失败静默（过滤失败不阻塞发布）

**API**:
```typescript
interface RedactionResult {
  success: boolean;
  scrubbed?: any;
  patterns_matched?: string[];
  fields_redacted?: string[];
  redaction_count?: number;
  error?: string;
}

async function scrubErrorReport(errorReport: any): RedactionResult;
async function scrubString(text: string): RedactionResult;
async function scrubForLog(text: string): string;
```

**Integration Pattern**:
```javascript
async function scrubErrorReport(errorReport) {
  const configResult = loadConfig();
  
  if (!configResult.success || !configResult.config.enabled) {
    return { success: false, error: 'disabled' };
  }
  
  const defaultPatterns = getDefaultPatterns();
  const enabledPatterns = getEnabledPatterns(configResult.config);
  const mergedPatterns = mergePatterns(enabledPatterns, configResult.config.custom_patterns);
  
  try {
    const scrubResult = scrubObject(errorReport, mergedPatterns);
    
    logRedaction({
      timestamp: new Date().toISOString(),
      action: 'secrets_redaction',
      input_type: 'error-report',
      patterns_matched: scrubResult.patterns_matched,
      fields_redacted: scrubResult.fields_redacted,
      output_status: scrubResult.redaction_count > 0 ? 'success' : 'no_matches',
      redaction_count: scrubResult.redaction_count,
      source: 'secrets-redaction'
    });
    
    return {
      success: true,
      scrubbed: scrubResult.scrubbed,
      patterns_matched: scrubResult.patterns_matched,
      fields_redacted: scrubResult.fields_redacted,
      redaction_count: scrubResult.redaction_count
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

### Module 6: Integration Points

#### Integration 1: github-issue-reporter
**Location**: `lib/github-issue-reporter/error-comment-formatter.js`

**Modification**:
- 在 `extractTemplateVariables` 前调用 `scrubErrorReport`
- 仅过滤输出副本，不改变原始 errorReport

**Pattern**:
```javascript
import { scrubErrorReport } from '../secrets-redaction/index.js';

async function formatErrorComment(errorReport, variant = null) {
  const redactionResult = await scrubErrorReport(errorReport);
  
  const safeErrorReport = redactionResult.success ? redactionResult.scrubbed : errorReport;
  
  const severity = safeErrorReport.error_classification?.severity || 'medium';
  const selectedVariant = variant || selectCommentVariant(severity);
  
  return renderComment(safeErrorReport, selectedVariant);
}
```

#### Integration 2: auto-error-report
**Location**: `lib/auto-error-report/index.js`

**Modification**:
- 在调用 `reportToIssue` 前调用 `scrubErrorReport`
- 确保传递给 github-issue-reporter 的是安全副本

**Pattern**:
```javascript
import { scrubErrorReport } from '../secrets-redaction/index.js';

async function autoReportError(errorReport) {
  // ... 现有检查逻辑 ...
  
  const redactionResult = await scrubErrorReport(errorReport);
  const safeErrorReport = redactionResult.success ? redactionResult.scrubbed : errorReport;
  
  try {
    const result = await reportToIssue(safeErrorReport, {
      owner: configResult.config.target_repository.owner,
      repo: configResult.config.target_repository.repo,
      githubConfig: { token: process.env[configResult.config.github_token_env] }
    });
    
    // ... 现有返回逻辑 ...
  }
}
```

#### Integration 3: Log Output
**Location**: 应用层日志模块

**Pattern**:
```javascript
import { scrubForLog } from './secrets-redaction/index.js';

function safeLog(level, message) {
  const scrubbedMessage = await scrubForLog(message);
  console.log(`[${level}] ${scrubbedMessage}`);
}
```

---

## Data Flow

### Workflow 1: Error Report Redaction Flow

```
[github-issue-reporter] → [formatErrorComment]
                               ↓
                      [scrubErrorReport]
                               ├── loadConfig() → 检查 enabled
                               ├── getEnabledPatterns() → 获取启用模式
                               ├── mergePatterns() → 合并自定义模式
                               ↓
                      [scrubObject]
                               ├── 深度遍历 error-report
                               ├── 应用所有模式
                               ├── 替换敏感信息
                               ↓
                      [logRedaction]
                               ├── 记录审计日志
                               ↓
                      [返回安全副本]
                               ↓
                      [renderComment]
                               ↓
                      [发布到 GitHub Issue]
```

### Workflow 2: Configuration Initialization

```
[用户创建 .opencode/secrets-redaction.json]
                               ↓
                      [config-loader.loadConfig()]
                               ├── Schema validation
                               ├── 默认值填充
                               ↓
                      [返回 SecretsRedactionConfig]
                               ↓
                      [后续调用使用配置]
```

### Data Transformation

```
Error Report Artifact (ErrorReport)
  → scrubErrorReport() → 安全副本
  → patterns_matched: ['github_token', 'password']
  → fields_redacted: ['error_details.stacktrace_or_context']
  → GitHub Comment (不含敏感信息)
```

---

## Failure Handling

### Error Types

| Error Type | Code | Handling |
|------------|------|----------|
| CONFIG_LOAD_FAILED | ERR-SR-001 | 使用默认配置，继续过滤 |
| CONFIG_VALIDATION_FAILED | ERR-SR-002 | 使用默认配置，记录警告 |
| PATTERN_COMPILE_FAILED | ERR-SR-003 | 跳过该模式，继续其他模式 |
| SCRUB_FAILED | ERR-SR-004 | 返回原始对象，记录警告 |

### Failure Isolation (NFR-002)
- 过滤失败不阻塞发布流程
- 返回原始对象作为 fallback
- 失败信息写入日志

### Safe Fallback
```javascript
async function scrubErrorReport(errorReport) {
  try {
    // ... 正常流程 ...
  } catch (error) {
    console.warn('[secrets-redaction] Scrub failed, returning original:', error.message);
    return {
      success: false,
      scrubbed: errorReport,  // fallback to original
      error: error.message
    };
  }
}
```

---

## Validation Strategy

### Unit Tests
| Module | Test Focus |
|--------|------------|
| patterns.js | 12 种模式匹配测试，边界条件 |
| scrubber.js | 对象遍历，字符串替换，嵌套处理 |
| config-loader.js | 配置加载，schema validation，合并 |
| audit-logger.js | 日志格式，敏感信息排除 |
| index.js | 协调流程，失败 fallback |

### Pattern Test Cases (AC-001)
```javascript
describe('Default Patterns', () => {
  test('github_token: matches ghp_* format');
  test('github_app_token: matches ghs_* format');
  test('aws_access_key: matches AKIA* format');
  test('aws_secret_key: matches 40-char base64');
  test('api_key_generic: matches api_key: xxx');
  test('password: matches password: xxx');
  test('secret_generic: matches secret: xxx');
  test('private_key: matches PEM header');
  test('connection_string: matches connection_string: xxx');
  test('env_var_ref: matches ${VAR}');
  test('bearer_token: matches Bearer xxx');
  test('jwt: matches JWT format');
});
```

### Integration Tests
| Scenario | Test Focus |
|----------|------------|
| Full workflow | error-report → scrub → github-issue-reporter |
| Auto-report integration | auto-error-report → scrub → reporter |
| Custom patterns | 用户定义模式 + 默认模式同时生效 |
| Whitelist | 白名单字段不被过滤 |
| Failure fallback | 过滤失败时返回原始对象 |

### Performance Tests (NFR-001)
```javascript
describe('Performance', () => {
  test('Scrubbing typical error-report < 50ms');
  test('Large stacktrace scrubbing < 100ms');
});
```

---

## Risks / Tradeoffs

### Risk-001: 性能影响
- **描述**: 正则匹配可能影响性能
- **影响**: 发布延迟增加
- **缓解**: 预编译正则，限制模式数量
- **Severity**: low

### Risk-002: 误报
- **描述**: 非敏感信息被误判为敏感信息
- **影响**: Issue 信息不完整
- **缓解**: 白名单机制，精确模式定义
- **Severity**: medium

### Risk-003: 漏报
- **描述**: 新类型敏感信息未被检测
- **影响**: 敏感信息泄露
- **缓解**: 支持自定义模式，定期更新默认模式
- **Severity**: high

### Risk-004: AWS Secret Key误报
- **描述**: 40字符Base64模式过于宽泛
- **影响**: 误报正常字符串
- **缓解**: context-aware检测，仅在特定上下文中触发
- **Severity**: medium

### Tradeoff-001: 精确模式 vs 广泛模式
- **选择**: 精确模式优先（减少误报）
- **原因**: 漏报风险可通过自定义模式补充
- **代价**: 可能漏报新类型敏感信息
- **评估**: 可接受（支持自定义扩展）

### Tradeoff-002: 默认启用 vs 默认禁用
- **选择**: 默认启用 (`enabled: true`)
- **原因**: 安全优先，防止意外泄露
- **代价**: 需用户配置才能禁用
- **评估**: 符合安全最佳实践

---

## Requirement Traceability

### FR-001 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| 默认敏感信息模式 | Module 1 | `lib/secrets-redaction/patterns.js` |

### FR-002 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| 过滤算法 | Module 2 | `lib/secrets-redaction/scrubber.js` |

### FR-003 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| 可配置规则 | Module 3 | `lib/secrets-redaction/config-loader.js` |

### FR-004 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| 过滤位置 | Module 6 | `lib/github-issue-reporter/`, `lib/auto-error-report/` |

### FR-005 → Modules
| Requirement | Module | File |
|-------------|--------|------|
| 审计日志 | Module 4 | `lib/secrets-redaction/audit-logger.js` |

### NFR → Validation
| Non-functional Requirement | Validation Method |
|---------------------------|-------------------|
| NFR-001: 性能 < 50ms | Performance tests |
| NFR-002: 误报率 < 5% | False positive tests |
| NFR-003: 漏报率 < 1% | False negative tests |

---

## Implementation Order

### Phase 1: 核心模块 (M1)
1. 创建 `lib/secrets-redaction/patterns.js` - 12 种默认模式
2. 创建 `lib/secrets-redaction/scrubber.js` - 过滤算法
3. 编写单元测试覆盖所有模式

### Phase 2: 配置系统 (M2)
1. 创建 `lib/secrets-redaction/config-loader.js`
2. 创建 `.opencode/secrets-redaction.json` schema
3. 实现自定义模式支持

### Phase 3: 集成 (M3)
1. 修改 `lib/github-issue-reporter/error-comment-formatter.js`
2. 修改 `lib/auto-error-report/index.js`
3. 编写集成测试

### Phase 4: 审计与验证 (M4)
1. 创建 `lib/secrets-redaction/audit-logger.js`
2. 创建使用文档
3. 安全验证（security review）

---

## Assumptions

### A-001: 正则引擎性能足够
- 假设 Node.js 正则引擎能满足性能要求
- 12 种模式同时应用不会显著影响性能

### A-002: error-report 格式稳定
- 假设 Feature 043 的 error-report artifact 格式不变
- 深度遍历算法能正确处理嵌套结构

### A-003: 调用者正确集成
- 假设 github-issue-reporter 和 auto-error-report 正确调用 scrubber
- 过滤逻辑在正确的位置执行

### A-004: 用户不滥用白名单
- 假设用户不会将敏感字段加入白名单
- 白名单机制有使用指南

---

## References

- `specs/045-auto-error-report/security-review-report.md` - Sec-002 发现
- `specs/043-error-reporter/contracts/error-report-contract.md` - Error Report Schema
- `specs/044-github-issue-reporter/spec.md` - GitHub Issue Reporter 定义
- `.opencode/skills/security/secret-handling-review/SKILL.md` - Security review skill
- OWASP Secrets Management Cheatsheet
- GitHub Token Format Documentation

---

## Next Steps

1. `/spec-tasks 046-secrets-redaction` - 生成任务列表
2. `/spec-implement 046-secrets-redaction T-046-001` - 开始实现第一个任务