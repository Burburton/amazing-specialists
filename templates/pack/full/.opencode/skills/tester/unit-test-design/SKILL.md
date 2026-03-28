# Skill: unit-test-design

## Purpose

指导 tester 设计单元测试，覆盖关键路径、正常路径、失败路径，确保代码行为符合预期。

解决的核心问题：
- 测试设计不规范
- 覆盖率不足
- 测试用例质量低
- 缺乏系统性测试策略

## Business Rules Compliance

### BR-001: Tester Must Consume Developer Evidence
This skill requires reading and consuming developer artifacts before test design:
- `implementation-summary.goal_alignment` - Derive expected behavior
- `implementation-summary.changed_files` - Establish test surface
- `implementation-summary.risks` - Prioritize high-risk testing
- `self-check-report` - Use as hints, NOT as evidence (see BR-002)

### BR-002: Self-Check Is Not Independent Verification
**Critical Distinction**: Developer self-check may inform testing but **cannot** replace tester evidence.
- Self-check results are hints for test focus areas
- All claims must be independently verified by tester
- Test reports must explicitly distinguish "developer self-check" from "independent verification"
- Prohibited language: "Developer verified this works" → Required: "Tester independently verified..."

### BR-003: Coverage Boundaries Mandatory
Every test design must document:
- What is in scope (explicitly tested)
- What is out of scope (intentionally excluded)
- Why exclusions were made

### BR-004: Failure Classification
Test outputs must classify failures into:
- **Implementation issue**: Code logic error
- **Test issue**: Test design/execution problem
- **Environment issue**: Test environment blocker
- **Design/spec issue**: Ambiguous requirements
- **Dependency/upstream issue**: External dependency failure

### BR-005: Edge Cases Are Mandatory
Happy-path-only testing is incomplete. This skill integrates with `edge-case-matrix` to ensure boundary conditions are covered.

## Upstream Artifact References
- `specs/004-developer-core/contracts/implementation-summary-contract.md`
- `specs/004-developer-core/contracts/self-check-report-contract.md`
- `specs/005-tester-core/upstream-consumption.md`

## Downstream Artifact References
- `specs/005-tester-core/contracts/verification-report-contract.md` - Test results feed into verification-report.tests_added_or_run
- `specs/005-tester-core/contracts/regression-risk-report-contract.md` - Test coverage informs regression-risk-report.existing_tests_reused

## When to Use

必须使用时：
- developer 完成代码实现后
- 需要建立单元测试覆盖
- 需要验证代码行为符合 spec

推荐使用时：
- 新功能开发时同步设计测试
- 重构前建立基线测试
- 修复 bug 前编写复现测试

## When Not to Use

不适用场景：
- 纯 UI/集成测试（使用 integration-test-design）
- 第三方库测试（测试库本身，非使用代码）
- 无业务逻辑的纯数据类
- 已充分覆盖的代码

## Test Design Principles

### 1. FIRST 原则
- **F**ast: 测试应快速运行
- **I**ndependent: 测试相互独立
- **R**epeatable: 测试可重复运行
- **S**elf-Validating: 测试自验证（布尔结果）
- **T**imely: 及时编写（实现前或同时）

### 2. 测试金字塔
```
    /\
   /  \  E2E Tests (少量)
  /____\
 /      \  Integration Tests (中等)
/________\
          Unit Tests (大量)
```

### 3. 测试类型

| 类型 | 目的 | 示例 |
|------|------|------|
| 单元测试 | 验证单个函数/类 | 测试 login 函数 |
| 集成测试 | 验证模块间交互 | 测试 Controller -> Service |
| 契约测试 | 验证接口契约 | 测试 API 输入输出 |
| 性能测试 | 验证性能指标 | 测试并发登录 |

## Test Coverage Targets

### 最小覆盖要求
- **语句覆盖**: > 80%
- **分支覆盖**: > 70%
- **函数覆盖**: > 90%

### 关键路径必须覆盖
- 核心业务逻辑
- 错误处理路径
- 边界条件
- 并发代码

## Steps

### Step 1: 分析被测代码
1. 读取 implementation summary
2. 识别关键函数/类
3. 理解输入输出
4. 识别依赖（mock/stub）

### Step 2: 识别测试场景

#### 2.1 正常路径 (Happy Path)
```
Given: 有效输入
When: 执行被测代码
Then: 返回预期结果
```

#### 2.2 失败路径 (Error Path)
```
Given: 无效输入或错误条件
When: 执行被测代码
Then: 返回错误/抛出异常
```

#### 2.3 边界条件 (Boundary)
- 最小值/最大值
- 空值/空集合
- 边界值 ±1

#### 2.4 特殊场景
- 并发访问
- 资源耗尽
- 时序问题

### Step 3: 设计测试用例

每个测试用例包含：
```yaml
test_case:
  id: string
  name: string
  description: string
  
  scenario:
    given: string  # 前置条件
    when: string   # 操作
    then: string   # 预期结果
    
  input:
    # 具体输入值
    
  expected:
    output: any    # 预期输出
    error: string  # 预期错误（如有）
    state: object  # 预期状态变更（如有）
    
  mocks:
    - dependency: string
      mock_behavior: string
      
  category: happy_path | error_path | boundary | special
```

### Step 4: 确定 Mock 策略

需要 Mock 的对象：
- 外部依赖（数据库、API）
- 复杂依赖（文件系统、时间）
- 未实现依赖

Mock 原则：
- 只 mock 直接依赖
- 不要 mock 被测代码内部
- 保持 mock 简单

### Step 5: 编写测试代码
1. 按 Arrange-Act-Assert 结构
2. 使用描述性命名
3. 一个断言一个概念
4. 避免逻辑（if/for）

### Step 6: 运行验证
1. 运行所有测试
2. 确保全部通过
3. 检查覆盖率
4. 修复问题

## Output Format

```yaml
test_design:
  dispatch_id: string
  task_id: string
  
  target:
    module: string
    functions:
      - name: string
        description: string
        complexity: simple | moderate | complex
        
  test_suite:
    name: string
    description: string
    
    test_cases:
      - id: string
        name: string
        description: string
        category: happy_path | error_path | boundary | special
        
        scenario:
          given: string
          when: string
          then: string
          
        input:
          # 具体输入
          
        expected:
          output: any
          error: string | null
          side_effects: string[]
          
        mocks:
          - dependency: string
            method: string
            return_value: any
            
        assertions:
          - assertion: string
            expected: any
            actual: expression
            
  coverage_plan:
    statement_coverage: number
    branch_coverage: number
    function_coverage: number
    uncovered_explanation: string | null
    
  dependencies_to_mock:
    - name: string
      reason: string
      mock_strategy: stub | spy | fake
      
  setup_requirements:
    - description: string
      
  cleanup_requirements:
    - description: string
    
  estimated_execution_time_ms: number
```

## Examples

### 示例 1：登录功能测试设计

```yaml
test_design:
  target:
    module: AuthService
    functions:
      - name: validateUser
        description: "验证用户名密码"
        complexity: moderate
        
  test_suite:
    name: AuthService.validateUser Tests
    description: "测试用户验证逻辑"
    
    test_cases:
      # Happy Path
      - id: TC-001
        name: "valid credentials returns user"
        description: "正确的用户名密码返回用户对象"
        category: happy_path
        
        scenario:
          given: "用户存在且密码正确"
          when: "调用 validateUser(validUser, validPassword)"
          then: "返回用户对象"
          
        input:
          username: "john.doe"
          password: "correctPassword123"
          
        expected:
          output:
            id: "user-123"
            username: "john.doe"
            email: "john@example.com"
          error: null
          
        mocks:
          - dependency: UserRepository
            method: findByUsername
            return_value:
              id: "user-123"
              username: "john.doe"
              passwordHash: "$2b$10$..."
              
          - dependency: PasswordHasher
            method: verify
            return_value: true
            
      # Error Path
      - id: TC-002
        name: "invalid password throws error"
        description: "密码错误抛出验证失败异常"
        category: error_path
        
        scenario:
          given: "用户存在但密码错误"
          when: "调用 validateUser(validUser, wrongPassword)"
          then: "抛出 InvalidCredentialsError"
          
        input:
          username: "john.doe"
          password: "wrongPassword"
          
        expected:
          output: null
          error: "InvalidCredentialsError"
          side_effects: []
          
        mocks:
          - dependency: UserRepository
            method: findByUsername
            return_value:
              id: "user-123"
              username: "john.doe"
              passwordHash: "$2b$10$..."
              
          - dependency: PasswordHasher
            method: verify
            return_value: false
            
      # Boundary
      - id: TC-003
        name: "empty username throws validation error"
        description: "空用户名触发参数校验失败"
        category: boundary
        
        scenario:
          given: "用户名为空字符串"
          when: "调用 validateUser('', 'password')"
          then: "抛出 ValidationError"
          
        input:
          username: ""
          password: "somePassword"
          
        expected:
          error: "ValidationError"
          error_message: "username is required"
          
      - id: TC-004
        name: "non-existent user throws error"
        description: "用户不存在抛出异常"
        category: error_path
        
        scenario:
          given: "用户名不存在"
          when: "调用 validateUser('unknown', 'password')"
          then: "抛出 UserNotFoundError"
          
        mocks:
          - dependency: UserRepository
            method: findByUsername
            return_value: null
            
  coverage_plan:
    statement_coverage: 95
    branch_coverage: 85
    function_coverage: 100
    uncovered_explanation: null
    
  dependencies_to_mock:
    - name: UserRepository
      reason: "数据库访问，需隔离"
      mock_strategy: stub
    - name: PasswordHasher
      reason: "bcrypt 计算慢，需 mock"
      mock_strategy: stub
```

### 示例 2：边界条件测试矩阵

```yaml
test_cases:
  # 用户名边界
  - id: TC-B-001
    name: "username min length"
    input: { username: "a", password: "valid" }
    category: boundary
    
  - id: TC-B-002
    name: "username max length"
    input: { username: "a" * 50, password: "valid" }
    category: boundary
    
  - id: TC-B-003
    name: "username max length + 1"
    input: { username: "a" * 51, password: "valid" }
    category: boundary
    
  # 密码边界
  - id: TC-B-004
    name: "password min length"
    input: { username: "user", password: "123456" }
    category: boundary
    
  - id: TC-B-005
    name: "password max length"
    input: { username: "user", password: "a" * 128 }
    category: boundary
    
  # 特殊字符
  - id: TC-B-006
    name: "username with special chars"
    input: { username: "user@email.com", password: "valid" }
    category: boundary
    
  - id: TC-B-007
    name: "password with unicode"
    input: { username: "user", password: "密码123" }
    category: boundary
```

## Checklists

### 设计阶段
- [ ] 被测代码已分析
- [ ] 正常路径已覆盖
- [ ] 错误路径已覆盖
- [ ] 边界条件已识别
- [ ] Mock 策略已确定

### 实现阶段
- [ ] 测试命名清晰
- [ ] 遵循 Arrange-Act-Assert
- [ ] 无复杂逻辑
- [ ] 断言明确

### 验证阶段
- [ ] 所有测试通过
- [ ] 覆盖率达标
- [ ] 无 flaky 测试
- [ ] 执行时间合理

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 测试与实现耦合 | 测试依赖实现细节 | 测试行为而非实现 |
| 测试重复 | 多个测试验证同一行为 | 合并或删除重复 |
| Mock 过多 | 测试大量 mock | 减少 mock，测试集成 |
| 测试不稳定 | 偶发失败 | 检查并发/时序/外部依赖 |
| 覆盖率虚高 | 覆盖代码但未验证行为 | 增加断言验证 |

## Notes

### 与 integration-test-design 的区别
- unit-test-design: 测试单个函数/类，大量 mock
- integration-test-design: 测试模块交互，少量 mock

### 与 edge-case-matrix 的关系
- edge-case-matrix 生成边界条件列表
- unit-test-design 为边界条件设计具体测试用例
- 通常先 edge-case-matrix 再 unit-test-design

### 测试命名建议
- 描述行为，而非方法名
- 使用 Given-When-Then 或 Should-When 格式
- 例: "should return user when credentials are valid"

### TDD 支持
本 skill 支持 TDD 流程：
1. 先设计测试（本 skill）
2. 编写测试代码（失败）
3. 编写实现代码（通过）
4. 重构
