# Skill: module-boundary-design

## Purpose

明确模块边界划分，定义模块职责、接口和依赖关系，确保模块高内聚低耦合。

解决的核心问题：
- 模块职责不清导致代码混乱
- 循环依赖导致维护困难
- 模块粒度过大或过小
- 接口设计不合理

## When to Use

必须使用时：
- 架构设计需要细化模块划分
- 重构前重新划分模块边界
- 新增模块需要明确边界
- 解决循环依赖问题

推荐使用时：
- 代码 review 发现模块边界问题
- 性能优化需要调整模块边界
- 团队分工需要模块边界对齐

## When Not to Use

不适用场景：
- 模块边界已清晰（直接实现）
- 纯脚本或工具类代码
- 单一功能无需拆分
- 紧急修复场景

## Module Design Principles

### 1. 单一职责 (SRP)
每个模块只负责一件事。

### 2. 依赖倒置 (DIP)
依赖抽象，不依赖具体实现。

### 3. 接口隔离 (ISP)
接口应小而专，不应强迫依赖不需要的接口。

### 4. 最小知识原则
模块只应了解直接依赖的模块。

### 5. 稳定依赖原则
依赖应指向更稳定的模块。

## Steps

### Step 1: 识别功能职责
1. 列出所有功能点
2. 按职责相似性分组
3. 识别核心 vs 辅助功能
4. 识别通用 vs 专用功能

### Step 2: 初步划分模块
1. 每个职责组对应一个模块候选
2. 评估模块粒度（过大/过小）
3. 检查模块间依赖关系
4. 识别循环依赖

### Step 3: 定义模块接口
1. 确定每个模块的 public API
2. 定义接口签名和数据结构
3. 明确错误处理约定
4. 确定版本兼容性策略

### Step 4: 优化依赖关系
1. 消除循环依赖
- 提取共同依赖
- 使用接口/抽象
- 重新划分边界

2. 减少依赖数量
- 合并高度耦合的模块
- 提取通用基础设施
- 使用依赖注入

### Step 5: 验证边界合理性
1. 可测试性：模块能否独立测试？
2. 可替换性：模块能否被替换？
3. 可理解性：模块职责是否清晰？
4. 可维护性：修改影响范围是否可控？

### Step 6: 文档化
输出模块边界定义文档。

## Output Format

```yaml
module_design:
  modules:
    - name: string
      
      # 职责定义
      responsibility: string
      scope:
        - string  # 包含的功能
      
      # 接口定义
      public_interface:
        - name: string
          type: class | function | api
          signature: string
          description: string
      
      # 依赖关系
      dependencies:
        - module: string
          type: required | optional
          reason: string
      
      # 被依赖关系
      dependents:
        - module: string
          reason: string
      
      # 实现约束
      constraints:
        - string
        
      # 测试策略
      test_strategy:
        - string
        
  dependency_graph: |
    # 文本形式的依赖图
    ModuleA -> ModuleB
    ModuleB -> ModuleC
    ModuleD -> ModuleB
    
  boundaries:
    - boundary: string
      modules: string[]
      description: string
      
  cross_cutting_concerns:
    - concern: string
      modules: string[]
      solution: string
```

## Examples

### 示例 1：认证系统模块划分

```yaml
module_design:
  modules:
    - name: AuthController
      responsibility: "处理 HTTP 认证请求"
      scope:
        - "登录接口"
        - "登出接口"
        - "Token 刷新接口"
      public_interface:
        - name: login
          type: function
          signature: "login(req: LoginRequest): Promise<LoginResponse>"
          description: "处理用户登录请求"
      dependencies:
        - module: AuthService
          type: required
          reason: "业务逻辑委托"
      constraints:
        - "不直接访问数据库"
        - "所有响应通过统一格式封装"
        
    - name: AuthService
      responsibility: "认证业务逻辑"
      scope:
        - "用户验证"
        - "Token 管理"
        - "会话管理"
      public_interface:
        - name: validateUser
          type: function
          signature: "validateUser(credentials: Credentials): Promise<AuthResult>"
      dependencies:
        - module: UserRepository
          type: required
          reason: "用户数据查询"
        - module: TokenService
          type: required
          reason: "Token 生成"
        - module: PasswordHasher
          type: required
          reason: "密码验证"
          
    - name: UserRepository
      responsibility: "用户数据访问"
      scope:
        - "用户查询"
        - "用户创建"
        - "用户更新"
      public_interface:
        - name: findByUsername
          type: function
          signature: "findByUsername(username: string): Promise<User | null>"
      dependencies: []
      constraints:
        - "不依赖业务逻辑"
        - "只处理数据持久化"
        
    - name: TokenService
      responsibility: "JWT Token 管理"
      scope:
        - "Token 生成"
        - "Token 验证"
        - "Token 刷新"
      public_interface:
        - name: generate
          type: function
          signature: "generate(payload: TokenPayload): string"
      dependencies: []
      
    - name: PasswordHasher
      responsibility: "密码哈希与验证"
      scope:
        - "密码哈希"
        - "密码验证"
      public_interface:
        - name: verify
          type: function
          signature: "verify(password: string, hash: string): Promise<boolean>"
      dependencies: []
      
  dependency_graph: |
    AuthController -> AuthService
    AuthService -> UserRepository
    AuthService -> TokenService
    AuthService -> PasswordHasher
    
  # 无循环依赖，良好
```

### 示例 2：发现循环依赖

```yaml
# 问题场景
original_modules:
  - OrderService 依赖 PaymentService
  - PaymentService 依赖 NotificationService
  - NotificationService 依赖 OrderService  # 循环！

# 解决方案
solution:
  action: "提取事件机制"
  new_modules:
    - name: EventBus
      responsibility: "模块间异步通信"
      
  changes:
    - "NotificationService 不再依赖 OrderService"
    - "OrderService 发布 OrderCompleted 事件"
    - "NotificationService 订阅事件"
    
  result:
    dependency_graph: |
      OrderService -> PaymentService
      OrderService -> EventBus
      PaymentService -> EventBus
      NotificationService -> EventBus
    # 循环已消除
```

## Checklists

### 前置检查
- [ ] 需求已明确
- [ ] 已有模块结构已梳理
- [ ] 约束条件已了解

### 过程检查
- [ ] 每个模块有单一职责
- [ ] 无循环依赖
- [ ] 接口清晰定义
- [ ] 依赖关系合理

### 后置检查
- [ ] 模块可独立测试
- [ ] 模块可被替换
- [ ] 修改影响范围可控
- [ ] 边界已文档化

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 神类/神模块 | 一个模块做太多事 | 拆分为多个小模块 |
| 循环依赖 | A->B->C->A | 提取接口或事件机制 |
| 过度拆分 | 模块粒度过细 | 合并相关模块 |
| 接口不稳定 | 频繁修改接口 | 抽象稳定接口层 |
| 隐式依赖 | 通过全局状态依赖 | 显式化依赖关系 |

## Notes

### 模块粒度建议
- **过小**: 维护成本高，应合并
- **适中**: 200-500 行代码，职责单一
- **过大**: 应拆分，保持高内聚

### 接口稳定性
- 频繁变化的实现细节应封装在模块内部
- 公共接口应尽量稳定
- 必要时引入适配器层隔离变化

### 与 requirement-to-design 的关系
- requirement-to-design 输出总体架构
- module-boundary-design 细化模块划分
- 可独立使用，也可作为设计的一部分
