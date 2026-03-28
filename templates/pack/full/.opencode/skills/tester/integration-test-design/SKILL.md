# Skill: integration-test-design

## Purpose

指导 tester 设计集成测试，验证模块间交互、API 端到端流程、数据库集成等跨组件行为。

解决的核心问题：
- 集成测试设计不规范
- Mock vs Real 选择混乱
- 测试环境隔离不彻底
- 测试数据准备不足
- 集成点识别遗漏

## Business Rules Compliance

### BR-001: Tester Must Consume Developer Evidence
This skill requires reading and consuming developer artifacts before integration test design:
- `implementation-summary.goal_alignment` - Derive expected integration behavior
- `implementation-summary.changed_files` - Identify integration points between modules
- `implementation-summary.risks` - Prioritize high-risk integration scenarios
- `architecture-doc` - Understand module boundaries and contracts

### BR-002: Integration Tests Complement Unit Tests
**Critical Distinction**: Integration tests verify module interaction, unit tests verify isolated behavior.
- Integration tests focus on contracts, data flow, and module boundaries
- Integration tests should NOT duplicate unit test coverage
- Integration tests use real dependencies or realistic fakes

### BR-003: Integration Scope Must Be Explicit
Every integration test design must document:
- What integration points are tested (module A → module B)
- What is mocked at integration level (external services, slow resources)
- What is real (database, internal modules)
- Why choices were made

### BR-004: Test Environment Isolation
Integration tests must run in isolated environments:
- No shared state between tests
- No dependency on production data
- Cleanup after each test
- Environment setup/teardown documented

### BR-005: Test Data Strategy
Integration tests require explicit test data strategy:
- Where test data comes from (fixtures, factories, generators)
- How data is reset between tests
- How data reflects real-world scenarios

## Upstream Artifact References
- `specs/004-developer-core/contracts/implementation-summary-contract.md`
- `specs/003-architect-core/contracts/architecture-design-contract.md`
- `specs/005-tester-core/upstream-consumption.md`

## Downstream Artifact References
- `specs/005-tester-core/contracts/verification-report-contract.md` - Integration test results
- `specs/005-tester-core/contracts/regression-risk-report-contract.md` - Integration coverage

## When to Use

必须使用时：
- developer 完成多模块集成代码
- 需要验证 API 端到端流程
- 需要验证数据库读写集成
- 需要验证第三方服务集成

推荐使用时：
- 重构后验证模块间契约
- 新 API endpoint 上线前验证
- 数据库 schema 变更后验证
- 微服务间通信验证

## When Not to Use

不适用场景：
- 单函数逻辑测试（使用 unit-test-design）
- 纯 UI 展示测试（使用 frontend 测试工具）
- 性能压力测试（使用 performance testing）
- 单模块内部测试（单元测试已覆盖）

## Integration Test Types

### 1. 模块集成测试
测试两个或多个模块之间的交互：
- Service → Repository
- Controller → Service
- Client → Server

### 2. API 端到端测试
测试完整的 API 请求流程：
- Request → Validation → Controller → Service → Repository → Response

### 3. 数据库集成测试
测试数据库读写操作：
- Query execution
- Transaction handling
- Connection pooling

### 4. 第三方服务集成测试
测试与外部服务的交互：
- API client calls
- Authentication flows
- Error handling

### 5. 测试金字塔位置

```
    /\
   /  \  E2E Tests (少量)
  /____\
 /      \  Integration Tests (中等) ← 本 skill
/________\
          Unit Tests (大量)
```

## Mock vs Real Strategy

### 选择决策表

| 依赖类型 | Mock | Real | 原因 |
|---------|------|------|------|
| 内部模块（已测试） | ❌ | ✅ | 单元测试已验证，集成测试验证交互 |
| 数据库 | ❌ | ✅ | 测试真实数据流 |
| 缓存（Redis） | ❌ | ✅ | 测试真实缓存行为 |
| 外部 API | ✅ | ❌ | 避免外部依赖，控制响应 |
| 文件系统 | ✅ | ❌ | 避免文件污染 |
| 时间服务 | ✅ | ❌ | 控制时间相关测试 |
| Email 服务 | ✅ | ❌ | 避免 spam，验证格式 |

### Mock 策略

```yaml
mock_strategy:
  type: contract_mock | behavior_mock | fake
  
  contract_mock:
    description: "Mock 只验证契约（接口签名、响应格式）"
    use_when: "外部 API、不稳定依赖"
    
  behavior_mock:
    description: "Mock 模拟真实行为（返回预定义响应）"
    use_when: "可预测的第三方服务"
    
  fake:
    description: "轻量级替代实现（如内存数据库）"
    use_when: "数据库、缓存（需要真实行为但更快）"
```

## Steps

### Step 1: 分析集成点
1. 识别模块边界
2. 识别模块间契约
3. 识别数据流向
4. 识别依赖类型（内部/外部）

### Step 2: 选择 Mock vs Real
1. 按决策表选择
2. 记录选择原因
3. 配置 Mock 行为（如需要）
4. 准备 Fake 实现（如需要）

### Step 3: 设计测试场景

#### 3.1 正常集成路径
```
Given: 依赖模块已就绪
When: 执行集成操作
Then: 数据正确传递，契约遵守
```

#### 3.2 失败集成路径
```
Given: 依赖模块返回错误
When: 执行集成操作
Then: 错误正确传播，处理符合预期
```

#### 3.3 边界集成场景
- 大数据量传输
- 并发请求
- 资源耗尽
- 网络延迟

### Step 4: 准备测试数据
1. 设计数据 fixtures
2. 设计数据 factories
3. 设计数据清理策略

### Step 5: 配置测试环境
1. 设置隔离环境
2. 配置依赖服务（数据库、缓存）
3. 配置 Mock/Fake
4. 设置 cleanup hook

### Step 6: 编写测试代码
1. 使用真实依赖（按策略）
2. 验证契约遵守
3. 验证数据传递
4. 验证错误处理
5. 执行 cleanup

## Output Format

```yaml
integration_test_design:
  dispatch_id: string
  task_id: string
  
  integration_scope:
    modules:
      - name: string
        role: caller | callee | both
        
    integration_points:
      - from_module: string
        to_module: string
        contract_type: API | database | message | file
        description: string
        
  mock_vs_real:
    dependencies:
      - name: string
        type: internal | external | database | cache
        strategy: mock | real | fake
        reason: string
        
      mock_config:
        behavior: string
        responses: object[]
        
  test_suite:
    name: string
    description: string
    
    test_cases:
      - id: string
        name: string
        description: string
        category: happy_path | error_path | boundary
        
        integration_flow:
          - step: string
            module: string
            expected_output: string
            
        scenario:
          given: string
          when: string
          then: string
          
        test_data:
          fixtures: string[]
          factories: string[]
          
        assertions:
          - assertion_type: contract | data | error
            description: string
            expected: string
            
  environment_setup:
    isolation_level: database_per_test | shared_with_reset | transaction_rollback
    services_needed: string[]
    cleanup_strategy: string
    
  estimated_execution_time_ms: number
```

## Examples

### 示例 1：API 端到端集成测试

```yaml
integration_test_design:
  integration_scope:
    modules:
      - name: UserController
        role: caller
      - name: UserService
        role: callee
      - name: UserRepository
        role: callee
        
    integration_points:
      - from_module: UserController
        to_module: UserService
        contract_type: API
        description: "REST API → Service method call"
        
      - from_module: UserService
        to_module: UserRepository
        contract_type: database
        description: "Service → Database query"
        
  mock_vs_real:
    dependencies:
      - name: UserService
        type: internal
        strategy: real
        reason: "Core business logic, need real behavior"
        
      - name: UserRepository
        type: database
        strategy: real
        reason: "Test real database operations"
        
      - name: EmailService
        type: external
        strategy: mock
        reason: "External SMTP, avoid real email sending"
        mock_config:
          behavior: "contract_mock"
          responses: [{ success: true, message_id: "mock-msg-001" }]
          
      - name: Database
        type: database
        strategy: fake
        reason: "Use in-memory SQLite for speed"
        
  test_suite:
    name: "User Registration Integration Tests"
    description: "Test full registration flow from API to Database"
    
    test_cases:
      - id: IT-REG-001
        name: "successful registration stores user in database"
        category: happy_path
        
        integration_flow:
          - step: "POST /api/users"
            module: UserController
            expected_output: "HTTP 201, user DTO"
            
          - step: "UserService.createUser()"
            module: UserService
            expected_output: "User entity created"
            
          - step: "UserRepository.save()"
            module: UserRepository
            expected_output: "User persisted to DB"
            
        scenario:
          given: "Database is empty, EmailService mock configured"
          when: "POST /api/users with valid user data"
          then: "User stored in DB, confirmation email queued"
          
        test_data:
          fixtures: []
          factories: ["UserFactory.validUser()"]
          
        assertions:
          - assertion_type: contract
            description: "HTTP response matches API contract"
            expected: "201 Created, user DTO with id"
            
          - assertion_type: data
            description: "User persisted with correct fields"
            expected: "DB contains user with email='test@example.com'"
            
          - assertion_type: contract
            description: "EmailService received send request"
            expected: "Mock called once with correct email format"
            
      - id: IT-REG-002
        name: "duplicate email returns conflict error"
        category: error_path
        
        integration_flow:
          - step: "POST /api/users"
            module: UserController
            expected_output: "HTTP 409 Conflict"
            
        scenario:
          given: "User with email='existing@example.com' already in DB"
          when: "POST /api/users with same email"
          then: "Returns 409, no duplicate created"
          
        test_data:
          fixtures: ["existing_user_fixture.json"]
          factories: ["UserFactory.duplicateEmailUser()"]
          
        assertions:
          - assertion_type: contract
            description: "HTTP response is 409"
            expected: "HTTP 409, error message"
            
          - assertion_type: data
            description: "No second user created"
            expected: "DB still has only 1 user"
            
  environment_setup:
    isolation_level: "transaction_rollback"
    services_needed: ["SQLite in-memory", "EmailService mock"]
    cleanup_strategy: "Rollback transaction after each test"
    
  estimated_execution_time_ms: 1500
```

## Checklists

### 设计阶段
- [ ] 集成点已识别
- [ ] Mock vs Real 已决策
- [ ] 环境隔离已规划
- [ ] 测试数据已准备

### 实现阶段
- [ ] 使用正确依赖策略
- [ ] 契约验证完整
- [ ] 数据传递验证
- [ ] 错误传播验证

### 验证阶段
- [ ] 所有测试通过
- [ ] 无环境污染
- [ ] Cleanup 正确执行
- [ ] 执行时间合理

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 环境污染 | 测试结果不一致 | 加强 cleanup，使用隔离 |
| 过度 Mock | 测试失去意义 | 减少 mock，测试真实集成 |
| 测试数据残留 | 下次测试失败 | 使用 rollback 或 truncate |
| 外部依赖不稳定 | 测试偶发失败 | Mock 外部服务 |
| 执行时间过长 | CI/CD 延迟 | 优化策略，使用 fake |

## Notes

### 与 unit-test-design 的区别
- unit-test-design: 测试单个函数，大量 mock
- integration-test-design: 测试模块交互，少量 mock，使用真实依赖

### 与 regression-analysis 的关系
- integration-test-design 设计新测试
- regression-analysis 分析现有集成测试

### 最佳实践
- 使用 transaction rollback 清理数据库
- 使用 in-memory 替代真实数据库（fake）
- 外部 API 必须 mock
- 测试命名描述集成场景

### TDD 支持
本 skill 支持 TDD 流程：
1. 先设计集成测试（本 skill）
2. 配置测试环境
3. 编写测试代码（失败）
4. 实现集成代码（通过）
5. 重构