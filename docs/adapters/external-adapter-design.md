# External System Adapter Design Document

## Metadata
```yaml
adapter_id: external-system
adapter_type: workspace
priority: future
status: design-only
design_version: 1.0.0
created_at: 2026-03-28
feature_reference: 020-orchestrator-and-workspace-adapters
```

---

## 1. Adapter Classification

| Property | Value | Notes |
|----------|-------|-------|
| **Adapter ID** | `external-system` | Registry key |
| **Adapter Type** | Workspace (External) | Downstream integration to external systems |
| **Priority** | Future | Design only, future implementation |
| **Interface** | `WorkspaceAdapter` (Extended) | io-contract.md §8 with extensions |
| **Compatible Profiles** | full | Only full profile (37 skills) |
| **Workspace Type** | `external_system` | API-based output |

### Type Definition (from ADAPTERS.md)

作为 Workspace Adapter，External System Adapter 负责：
- **Artifact Output**: 将 Execution Result 的 artifacts 发送到外部系统 API
- **File Handling**: 处理 changed_files 的外部提交
- **State Sync**: 同步 execution state 到外部系统状态
- **Escalation Handling**: 将 escalation 输出到外部系统 API
- **Validation**: 验证 artifact 输出符合 schema
- **Retry Handling**: 处理输出失败的 retry

### External System Scope

本适配器为以下外部系统集成提供框架：

| External System Type | Example Use Cases |
|----------------------|-------------------|
| **CI/CD Systems** | Jenkins, CircleCI, GitLab CI |
| **Project Management** | Jira, Linear, Asana |
| **Documentation Systems** | Confluence, Notion |
| **Code Review Systems** | Gerrit, GitLab Review |
| **Storage Systems** | S3, Azure Blob, GCS |
| **Custom APIs** | Enterprise internal APIs |

---

## 2. Interface Framework

### Extended WorkspaceAdapter Interface

外部系统适配器需要扩展基础 `WorkspaceAdapter` 接口：

```typescript
interface ExternalSystemAdapter extends WorkspaceAdapter {
  // Core Methods (from WorkspaceAdapter)
  handleArtifacts(result: ExecutionResult): void;
  handleChangedFiles(result: ExecutionResult): void;
  handleEscalation(escalation: Escalation): void;
  validateArtifactOutput(artifacts: Artifact[]): ValidationResult;
  
  // Extended Methods for External Systems
  transformArtifacts(artifacts: Artifact[]): ExternalPayload[];
  sendToExternalApi(payload: ExternalPayload): ExternalResponse;
  handleExternalError(error: ExternalApiError): ErrorHandlingResult;
  validateExternalConfig(config: ExternalConfig): ValidationResult;
  
  // Configuration Methods
  getExternalSystemType(): ExternalSystemType;
  getExternalSystemConfig(): ExternalConfig;
  
  // Metadata
  getAdapterInfo(): WorkspaceAdapterInfo;
}
```

### Generic External Payload Schema

```typescript
interface ExternalPayload {
  // Core fields
  payload_id: string;
  payload_type: 'artifact' | 'changed_file' | 'escalation' | 'status';
  
  // Source reference
  dispatch_id: string;
  project_id: string;
  task_id: string;
  
  // Content
  content: ExternalContent;
  
  // Metadata
  metadata: {
    created_at: string;
    format: string;
    encoding?: string;
    compression?: string;
  };
}

interface ExternalContent {
  // For artifacts
  artifacts?: {
    artifact_id: string;
    artifact_type: string;
    path: string;
    content: string | Buffer;
    format: string;
  }[];
  
  // For changed files
  changed_files?: {
    path: string;
    change_type: 'added' | 'modified' | 'deleted' | 'renamed';
    content?: string | Buffer;
    diff?: string;
  }[];
  
  // For escalation
  escalation?: {
    escalation_id: string;
    reason_type: string;
    summary: string;
    blocking_points: string[];
    requires_user_decision: boolean;
  };
  
  // For status
  status?: {
    execution_status: string;
    summary: string;
    recommendation: string;
  };
}
```

### External Response Schema

```typescript
interface ExternalResponse {
  success: boolean;
  response_id: string;
  
  // Success details
  external_reference?: string;  // ID in external system
  external_url?: string;        // URL to view in external system
  
  // Error details
  error?: {
    error_code: string;
    error_message: string;
    error_type: 'validation' | 'authentication' | 'rate_limit' | 'server' | 'network';
    retry_recommended: boolean;
  };
  
  // Metadata
  timestamp: string;
}
```

---

## 3. Input/Output Mapping Guidelines

### Artifact Transformation Guidelines

不同外部系统需要不同的 artifact 转换策略：

| External System | Artifact Transformation | Example |
|-----------------|-------------------------|---------|
| **CI/CD** | Attach to build artifacts | Jenkins artifact attachment |
| **Project Mgmt** | Create task attachment | Jira issue attachment |
| **Documentation** | Convert to doc format | Confluence page creation |
| **Storage** | Store as file | S3 object upload |
| **Custom API** | Custom transformation | Enterprise-specific format |

### Generic Transformation Flow

```
Execution Result (artifacts)
    ↓
Artifact Extractor
    ↓
Format Transformer (based on external system type)
    ↓
External Payload Builder
    ↓
API Client (send to external system)
    ↓
Response Handler
```

### Changed Files Transformation Guidelines

| External System | Changed Files Action | Example |
|-----------------|---------------------|---------|
| **CI/CD** | Commit to branch | GitLab commit |
| **Project Mgmt** | Link to commit | Jira → GitHub link |
| **Documentation** | Update doc source | Confluence sync |
| **Storage** | Store as files | S3 bucket update |
| **Custom API** | Custom submission | Enterprise API |

### Status Mapping Guidelines

| Execution Status | External System Action |
|------------------|------------------------|
| `SUCCESS` | Mark as complete |
| `SUCCESS_WITH_WARNINGS` | Mark complete + warnings |
| `PARTIAL` | Mark as in-progress |
| `BLOCKED` | Mark as blocked |
| `FAILED_RETRYABLE` | Mark as failed (retryable) |
| `FAILED_ESCALATE` | Mark as failed (escalate) |

---

## 4. Escalation Mapping Guidelines

### Generic Escalation API Pattern

```typescript
interface EscalationPayload {
  escalation_id: string;
  dispatch_id: string;
  project_id: string;
  task_id: string;
  
  // Escalation details
  level: 'INTERNAL' | 'USER';
  reason_type: string;
  summary: string;
  blocking_points: string[];
  recommended_next_steps: string[];
  requires_user_decision: boolean;
  
  // External system specific
  external_reference?: string;
  external_context?: Record<string, any>;
}
```

### Escalation Channel Selection (BR-007)

外部系统 escalation channel 配置：

| External System Type | Escalation Channel | Configuration |
|----------------------|--------------------| -------------|
| **CI/CD** | Build notification | Jenkins notification plugin |
| **Project Mgmt** | Issue comment + status | Jira comment + status change |
| **Documentation** | Doc comment | Confluence comment |
| **Storage** | API log | S3 event notification |
| **Custom API** | Configurable | Enterprise API endpoint |

### Escalation Response Handling

```typescript
interface EscalationResponse {
  acknowledged: boolean;
  response_type: 'acknowledged' | 'decision_provided' | 'escalated';
  decision?: string;
  external_reference?: string;
  next_action?: string;
}
```

---

## 5. Retry Strategy Guidelines

### Configurable Retry Strategy (BR-008)

外部系统适配器应支持可配置的 retry 策略：

```typescript
interface RetryConfig {
  strategy: 'auto' | 'manual' | 'disabled';
  max_retry: number;
  backoff_type: 'exponential' | 'linear' | 'fixed';
  backoff_initial_ms: number;
  backoff_max_ms: number;
  
  // External system specific
  external_retry_policy?: {
    respect_rate_limit: boolean;
    rate_limit_backoff_ms: number;
    circuit_breaker_enabled: boolean;
    circuit_breaker_threshold: number;
    circuit_breaker_reset_ms: number;
  };
}
```

### Error Type Retry Mapping

| Error Type | Retry Recommended | Backoff |
|------------|-------------------|---------|
| **Network timeout** | Yes | Exponential |
| **Rate limited** | Yes | Fixed (wait period) |
| **Authentication failed** | No | Escalate |
| **Validation failed** | No | Return error |
| **Server error (5xx)** | Yes | Exponential |
| **Client error (4xx)** | No | Return error |

### Circuit Breaker Pattern

对于频繁失败的外部系统，应实现 Circuit Breaker：

```
1. Track consecutive failures
2. If threshold exceeded → Open circuit
3. Skip calls for circuit_breaker_reset_ms
4. After reset → Try one call (half-open)
5. If success → Close circuit
6. If failure → Re-open circuit
```

---

## 6. External System Type Definitions

### Type Enum

```typescript
enum ExternalSystemType {
  // CI/CD
  'jenkins',
  'circleci',
  'gitlab-ci',
  'github-actions',
  
  // Project Management
  'jira',
  'linear',
  'asana',
  'trello',
  
  // Documentation
  'confluence',
  'notion',
  'gitbook',
  
  // Code Review
  'gerrit',
  'gitlab-review',
  'phabricator',
  
  // Storage
  's3',
  'azure-blob',
  'gcs',
  'minio',
  
  // Custom
  'custom-api'
}
```

### Type-specific Config Schema

```typescript
interface ExternalConfig {
  system_type: ExternalSystemType;
  
  // Common fields
  api_endpoint: string;
  authentication: AuthenticationConfig;
  
  // Type-specific fields
  type_specific: Record<string, any>;
  
  // Retry configuration
  retry_config: RetryConfig;
  
  // Escalation configuration
  escalation_config: EscalationConfig;
}

interface AuthenticationConfig {
  type: 'api_key' | 'oauth' | 'jwt' | 'basic' | 'custom';
  
  // Type-specific auth fields
  api_key?: {
    header_name: string;
    key_source: string;
  };
  
  oauth?: {
    client_id: string;
    client_secret_source: string;
    token_url: string;
    scopes: string[];
  };
  
  jwt?: {
    issuer: string;
    audience: string;
    secret_source: string;
    expiry_seconds: number;
  };
  
  basic?: {
    username: string;
    password_source: string;
  };
  
  custom?: Record<string, any>;
}
```

---

## 7. Configuration Schema

外部系统适配器配置扩展基础 schema：

```json
{
  "workspace_type": "external_system",
  "profile": "full",
  
  "external_config": {
    "system_type": "custom-api",
    
    "api_endpoint": "${EXTERNAL_API_URL}",
    
    "authentication": {
      "type": "jwt",
      "issuer": "expert-pack",
      "audience": "${EXTERNAL_SYSTEM_ID}",
      "secret_source": "vault",
      "secret_path": "${JWT_SECRET_PATH}",
      "expiry_seconds": 3600
    },
    
    "type_specific": {
      // Custom fields for specific external system
      "artifact_format": "json",
      "changed_files_as_diff": true,
      "include_metadata": true
    },
    
    "retry_config": {
      "strategy": "configurable",
      "max_retry": 2,
      "backoff_type": "exponential",
      "backoff_initial_ms": 1000,
      "backoff_max_ms": 60000,
      "external_retry_policy": {
        "respect_rate_limit": true,
        "rate_limit_backoff_ms": 5000,
        "circuit_breaker_enabled": true,
        "circuit_breaker_threshold": 5,
        "circuit_breaker_reset_ms": 30000
      }
    },
    
    "escalation_config": {
      "channel": "api",
      "endpoint": "${EXTERNAL_API_URL}/escalations",
      "requires_acknowledgment": true,
      "timeout_ms": 30000
    },
    
    "timeout_config": {
      "connection_timeout_ms": 5000,
      "request_timeout_ms": 60000,
      "max_response_size_mb": 10
    }
  }
}
```

---

## 8. Implementation Guidelines

### Adapter Implementation Checklist

实现外部系统适配器时应遵循：

1. **基础接口实现**
   - [ ] `handleArtifacts()` - Artifact 输出
   - [ ] `handleChangedFiles()` - Changed files 输出
   - [ ] `handleEscalation()` - Escalation 输出
   - [ ] `validateArtifactOutput()` - Output 验证

2. **扩展接口实现**
   - [ ] `transformArtifacts()` - 格式转换
   - [ ] `sendToExternalApi()` - API 发送
   - [ ] `handleExternalError()` - 错误处理
   - [ ] `validateExternalConfig()` - 配置验证

3. **认证实现**
   - [ ] Token 获取与刷新
   - [ ] Token 存储（安全）
   - [ ] Token 失效处理

4. **Retry 实现**
   - [ ] Backoff 逻辑
   - [ ] Circuit breaker
   - [ ] Rate limit handling

5. **测试**
   - [ ] 单元测试（mock API）
   - [ ] 集成测试（真实 API）
   - [ ] 错误场景测试

### Testing Strategy

| Test Type | Scope | Tool |
|-----------|-------|------|
| Unit Tests | Transformation, validation | Jest/Mocha |
| Integration Tests | API mock | Mock server |
| Contract Tests | API contract | Pact/OpenAPI |
| E2E Tests | Real external system | Test account |

### Security Considerations

| Concern | Mitigation |
|---------|------------|
| Credential storage | Use vault/secrets manager |
| Token rotation | Implement automatic refresh |
| API encryption | Enforce TLS 1.2+ |
| Input validation | Validate all external inputs |
| Rate limiting | Implement client-side limits |

---

## 9. Design Reserved for Future Extensions

### Future Extension Points

以下设计预留用于未来扩展：

1. **Multi-external system output**
   - 当前设计：单一外部系统
   - 未来扩展：同时输出到多个外部系统
   - 预留接口：`handleArtifactsMulti(targets: ExternalTarget[])`

2. **Bidirectional sync**
   - 当前设计：单向输出
   - 未来扩展：从外部系统接收更新
   - 预留接口：`receiveExternalUpdate(update: ExternalUpdate)`

3. **Streaming output**
   - 当前设计：批量输出
   - 未来扩展：实时流式输出
   - 预留接口：`streamArtifacts(stream: ArtifactStream)`

4. **External system events**
   - 当前设计：主动发送
   - 未来扩展：响应外部系统事件
   - 预留接口：`handleExternalEvent(event: ExternalEvent)`

### Plugin Architecture

未来可实现插件架构支持自定义外部系统：

```typescript
interface ExternalSystemPlugin {
  plugin_id: string;
  system_type: ExternalSystemType;
  
  // Plugin hooks
  transformArtifact(artifact: Artifact): ExternalPayload;
  transformChangedFile(file: ChangedFile): ExternalPayload;
  handleResponse(response: ExternalResponse): void;
  handleError(error: ExternalApiError): ErrorHandlingResult;
  
  // Plugin metadata
  getPluginInfo(): PluginInfo;
}
```

---

## 10. References

- `ADAPTERS.md` §Workspace Adapter §External (Future)
- `io-contract.md` §2 (Execution Result)
- `io-contract.md` §3 (Artifact)
- `io-contract.md` §4 (Escalation)
- `io-contract.md` §8 (Adapter Interface Contract)
- `adapters/registry.json` (Adapter metadata)
- `adapters/schemas/workspace-configuration.schema.json` (Configuration schema)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial design document (Feature 020 T034) |