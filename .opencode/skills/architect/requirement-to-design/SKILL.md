# Skill: requirement-to-design

## Purpose

将 requirement / spec 转化为可执行的技术设计方案，明确模块边界、接口契约、实施路线，让 developer 能据此实现。

解决的核心问题：
- 需求到设计的 gap，防止 developer 直接写代码时偏离目标
- 明确技术方案，减少实现过程中的不确定性
- 提供可审计的设计决策记录

## When to Use

必须使用时：
- 新 feature 需要技术方案设计
- 中大型功能（>3天工作量）需要模块拆分
- API / data contract 需要设计
- 存在多个技术方案需要评估选择

推荐使用时：
- 模块重构前需要结构规划
- 技术债务清理需要设计方案
- 性能优化需要技术方案

## When Not to Use

不适用场景：
- 纯配置类变更（无需技术设计）
- bugfix 不涉及架构变更（直接 developer 处理）
- 文档类 task（直接 docs 处理）
- 需求本身不明确（应先澄清需求）

## Required Inputs

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `spec` | object | 是 | 功能规格文档（已用 artifact-reading 读取） |
| `codebase_context` | object | 是 | 代码库上下文摘要 |
| `constraints` | string[] | 是 | 技术约束条件 |

## Optional Inputs

| 字段 | 类型 | 说明 |
|------|------|------|
| `existing_design` | object | 已有设计（演进场景） |
| `tech_preferences` | string[] | 技术选型偏好 |
| `performance_requirements` | object | 性能特殊要求 |

## Design Output Structure

### 1. Design Summary
一句话描述技术方案的核心思路。

### 2. Module Boundaries
定义模块划分和职责：
```yaml
modules:
  - name: string
    responsibility: string
    interfaces: string[]
    dependencies: string[]
```

### 3. Interface Contracts
定义模块间接口契约：
```yaml
interfaces:
  - name: string
    type: api | function | event | data
    input: object
    output: object
    error_handling: string
```

### 4. Data Model
涉及的数据结构定义。

### 5. Implementation Order
推荐的实施顺序和依赖关系。

### 6. Risks & Mitigation
识别的风险和缓解措施。

### 7. Assumptions
设计假设和前提条件。

## Steps

### Step 1: 理解需求
1. 仔细阅读 spec 的 goal、scope、acceptance_criteria
2. 提取功能需求和非功能需求
3. 识别约束条件和边界
4. 记录假设和不确定点

### Step 2: 分析现状
1. 了解现有代码库结构
2. 识别相关模块和组件
3. 评估技术债务和限制
4. 确定复用 vs 新建

### Step 3: 确定架构风格
根据需求选择架构模式：
- **分层架构**: 适合业务逻辑清晰的项目
- **微服务**: 适合独立部署的服务
- **事件驱动**: 适合异步处理场景
- **插件化**: 适合可扩展的框架

### Step 4: 划分模块边界
1. 基于单一职责原则划分模块
2. 明确每个模块的输入输出
3. 最小化模块间依赖
4. 考虑测试隔离性

### Step 5: 设计接口契约
1. 定义 API 端点（如果是 HTTP）
2. 定义函数签名（如果是库）
3. 定义事件格式（如果是事件驱动）
4. 定义错误码和异常处理

### Step 6: 设计数据模型
1. 识别核心实体
2. 定义实体关系
3. 考虑数据一致性
4. 评估存储方案

### Step 7: 制定实施计划
1. 确定模块依赖图
2. 识别可并行开发的模块
3. 确定关键路径
4. 估算每个模块工作量

### Step 8: 识别风险
1. 技术风险（新技术、性能瓶颈）
2. 依赖风险（外部服务、第三方库）
3. 业务风险（需求变更、范围蔓延）
4. 制定缓解措施

### Step 9: 评审设计
1. 对照 spec 检查完整性
2. 检查约束遵守情况
3. 评估可维护性
4. 确认可测试性

### Step 10: 生成 Design Note
按模板输出完整设计文档。

## Checklists

### 前置检查
- [ ] spec 已完整读取
- [ ] codebase_context 已加载
- [ ] constraints 已明确

### 过程检查
- [ ] 模块边界清晰
- [ ] 接口契约完整
- [ ] 实施顺序合理
- [ ] 风险已识别

### 后置检查
- [ ] design note 符合模板
- [ ] 可被 developer 直接执行
- [ ] reviewer 可审查

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 过度设计 | 设计过于复杂 | 回到 KISS 原则，简化方案 |
| 设计不足 | 关键细节缺失 | 补充接口定义和错误处理 |
| 与现状冲突 | 设计与现有代码冲突 | 评估改造成本，必要时调整设计 |
| 约束违反 | 设计违反约束条件 | 重新设计或申请放宽约束 |
| 需求遗漏 | 未覆盖所有需求 | 对照 spec 逐项检查 |
| 风险低估 | 未识别关键风险 | 引入 reviewer 审查 |

## Output Requirements

### 必须输出

```yaml
design_note:
  dispatch_id: string
  task_id: string
  version: string
  
  summary: string  # 一句话设计概要
  
  context:
    spec_reference: string
    codebase_state: string
    assumptions: string[]
  
  proposed_design:
    architecture_style: string
    overview: string
    
  module_boundaries:
    - module: string
      responsibility: string
      public_interfaces: string[]
      private_details: string
      dependencies: string[]
      
  interface_contracts:
    - interface: string
      type: api | function | event | data
      description: string
      input_schema: object
      output_schema: object
      error_codes: string[]
      
  data_model:
    entities:
      - name: string
        attributes: object
        relationships: string[]
    storage_strategy: string
    
  implementation_plan:
    phases:
      - phase: number
        modules: string[]
        dependencies: string[]
        estimated_effort: string
        deliverables: string[]
        
  risks:
    - risk: string
      level: high | medium | low
      mitigation: string
      
  non_goals:
    - string  # 明确设计不覆盖的内容
    
  open_questions:
    - question: string
      blocker: boolean
      
  status: COMPLETE | PARTIAL | BLOCKED
```

### 可选输出

```yaml
tradeoffs_considered:
  - option: string
    pros: string[]
    cons: string[]
    selected: boolean
    
alternatives_rejected:
  - alternative: string
    reason: string
    
performance_considerations:
  - aspect: string
    strategy: string
```

## Examples

### 示例 1：用户登录功能设计

#### 输入
```yaml
spec:
  goal: "实现用户登录功能"
  scope:
    - "登录接口"
    - "密码验证"
    - "Token 生成"
  acceptance_criteria:
    - "支持用户名/密码登录"
    - "返回 JWT Token"
    - "错误处理完整"
    
constraints:
  - "使用 bcrypt 验证密码"
  - "Token 有效期 24 小时"
  - "复用现有 UserRepository"
```

#### 输出 Design Note

```yaml
design_note:
  summary: "采用分层架构，Controller-Service-Repository 三层，JWT Token 认证"
  
  proposed_design:
    architecture_style: "分层架构"
    overview: "Login API -> AuthController -> AuthService -> UserRepository + JwtTokenService"
    
  module_boundaries:
    - module: AuthController
      responsibility: "处理 HTTP 请求，参数校验，响应封装"
      public_interfaces:
        - "POST /api/auth/login"
      dependencies:
        - AuthService
        
    - module: AuthService
      responsibility: "认证业务逻辑，密码验证，Token 生成"
      public_interfaces:
        - "validateUser(username, password): AuthResult"
      dependencies:
        - UserRepository
        - JwtTokenService
        
    - module: JwtTokenService
      responsibility: "JWT Token 生成与验证"
      public_interfaces:
        - "generateToken(payload): string"
        - "verifyToken(token): Payload"
      dependencies: []
      
  interface_contracts:
    - interface: POST /api/auth/login
      type: api
      input_schema:
        username: string
        password: string
      output_schema:
        success: boolean
        token: string | null
        user: UserInfo | null
        error: ErrorInfo | null
      error_codes:
        - INVALID_CREDENTIALS: 401
        - USER_LOCKED: 403
        - SYSTEM_ERROR: 500
        
  implementation_plan:
    phases:
      - phase: 1
        modules: [JwtTokenService]
        estimated_effort: "2小时"
        deliverables: ["Token 生成工具类"]
        
      - phase: 2
        modules: [AuthService]
        dependencies: [JwtTokenService]
        estimated_effort: "3小时"
        deliverables: ["认证服务实现"]
        
      - phase: 3
        modules: [AuthController]
        dependencies: [AuthService]
        estimated_effort: "2小时"
        deliverables: ["HTTP 接口实现"]
        
  risks:
    - risk: "JWT Token 泄露"
      level: medium
      mitigation: "Token 有效期限制，后续支持 refresh token"
      
  non_goals:
    - "不包含注册功能"
    - "不包含密码找回功能"
    - "不包含单点登录(SSO)"
```

### 示例 2：设计被阻塞

```yaml
status: BLOCKED
open_questions:
  - question: "现有数据库 schema 是否支持 roles 字段？"
    blocker: true
    
escalation_reason: "设计依赖 schema 确认，需要数据团队决策"
```

## Notes

### 与 module-boundary-design 的关系
- requirement-to-design 是总体设计
- module-boundary-design 可单独用于细化模块设计
- 简单场景可合并，复杂场景应拆分

### 与 tradeoff-analysis 的关系
- 如存在多个技术方案选择，先调用 tradeoff-analysis
- requirement-to-design 输出最终选定的方案
- 可在 design note 中记录 tradeoffs_considered

### 与 interface-contract-design 的关系
- requirement-to-design 输出接口契约概要
- interface-contract-design 可进一步细化具体接口
- API 设计建议用 interface-contract-design 细化

### 设计质量指标
好的 design note 应满足：
1. developer 能直接按设计实现
2. reviewer 能判断设计合理性
3. tester 能设计测试策略
4. 所有关键决策都有理由
5. 风险清晰，有缓解措施
