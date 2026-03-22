# Feature Spec: 用户登录功能

## Background
当前系统需要实现用户认证功能的第一阶段——用户登录。这是构建完整用户认证系统的基础，为后续的用户注册、权限管理等功能奠定基础。

项目背景：
- 系统：用户认证系统 (proj-auth-system)
- 当前阶段：MVP 第一阶段
- 前置条件：已存在 users 数据表（包含 id, username, password, email, created_at 字段）

## Goal
实现一个完整的用户登录功能，包括：
1. 用户名/密码验证
2. JWT Token 生成与返回
3. 基础错误处理（账号不存在、密码错误）
4. 符合安全规范的密码处理

成功标准：
- 用户可以使用正确的用户名和密码登录
- 登录成功后返回有效的 JWT Token
- 错误情况下返回清晰的错误信息
- 所有代码通过测试和审查

## Scope
**包含的功能：**
1. **登录接口**
   - POST /api/auth/login
   - 接收：username, password
   - 返回：JWT Token, 用户信息

2. **密码验证**
   - 使用 bcrypt 验证密码
   - 密码错误时返回 401 Unauthorized

3. **Token 生成**
   - 使用 JWT 标准
   - Token 包含：user_id, username, roles, exp
   - Token 有效期：24 小时

4. **错误处理**
   - 账号不存在：返回 401，提示"账号或密码错误"
   - 密码错误：返回 401，提示"账号或密码错误"
   - 参数缺失：返回 400，提示缺少的参数

5. **测试覆盖**
   - 单元测试覆盖所有代码路径
   - 集成测试覆盖登录流程

**包含的文件：**
- AuthController.ts - 登录接口控制器
- AuthService.ts - 认证业务逻辑
- JwtTokenService.ts - Token 生成服务
- AuthExceptions.ts - 认证相关异常
- 对应的测试文件

## Out of Scope
**明确不包含的功能：**
1. 用户注册功能（将在下一 milestone 实现）
2. 密码重置功能
3. 第三方登录（OAuth, SSO）
4. 多因素认证（MFA）
5. 登录日志和审计
6. 防暴力破解的速率限制（仅预留接口，不实现）
7. 用户权限管理（RBAC）
8. Token 刷新机制

**技术限制：**
- 不修改现有数据库 schema
- 不引入除 jwt、bcrypt 外的新依赖
- 不改变现有 API 路由结构

## Actors
**主要参与者：**
1. **终端用户** - 使用登录功能登录系统
2. **前端应用** - 调用登录 API，处理 Token
3. **后端服务** - 提供登录 API，验证身份

**系统角色：**
1. **architect** - 设计技术方案
2. **developer** - 实现代码
3. **tester** - 编写和执行测试
4. **reviewer** - 审查代码
5. **docs** - 更新文档

## Core Workflows

### 主流程：用户登录成功
```
1. 用户输入用户名和密码
2. 前端发送 POST /api/auth/login 请求
3. AuthController 接收请求，参数校验
4. AuthService 查询用户信息
5. 验证密码（bcrypt.compare）
6. 生成 JWT Token
7. 返回 Token 和用户信息
8. 前端存储 Token，跳转首页
```

### 替代流程 1：账号不存在
```
5a. 用户不存在
6a. 返回 401 Unauthorized
7a. 提示"账号或密码错误"
```

### 替代流程 2：密码错误
```
5b. 密码不匹配
6b. 返回 401 Unauthorized
7b. 提示"账号或密码错误"
```

### 替代流程 3：参数缺失
```
3a. 参数校验失败（缺少 username 或 password）
4a. 返回 400 Bad Request
5a. 提示缺少的参数
```

## Business Rules
**业务规则：**
1. **BR-001**: 用户名和密码必须同时提供，缺一不可
2. **BR-002**: 密码必须使用 bcrypt 加密存储和验证
3. **BR-003**: 错误提示不应暴露账号是否存在（统一提示"账号或密码错误"）
4. **BR-004**: Token 有效期为 24 小时
5. **BR-005**: 登录成功后返回的用户信息不应包含密码字段

## Non-functional Requirements
**性能要求：**
- 登录接口响应时间 < 200ms（P99）
- 支持 1000 QPS 并发

**安全要求：**
- 密码必须使用 bcrypt 加密（salt rounds >= 10）
- Token 必须使用强密钥签名
- 错误信息不应泄露系统内部信息
- 必须防止时序攻击（密码比对时间一致）

**可维护性：**
- 代码覆盖率 >= 90%
- 代码符合项目编码规范
- 文档同步更新

## Acceptance Criteria
**验收标准：**

### AC-001: 正常登录
**Given**: 用户存在且密码正确
**When**: 调用 POST /api/auth/login
**Then**: 
- 返回 200 OK
- 返回有效的 JWT Token
- 返回用户信息（不包含密码）

### AC-002: 账号不存在
**Given**: 用户不存在
**When**: 调用 POST /api/auth/login
**Then**:
- 返回 401 Unauthorized
- 提示"账号或密码错误"
- 不暴露账号不存在的事实

### AC-003: 密码错误
**Given**: 用户存在但密码错误
**When**: 调用 POST /api/auth/login
**Then**:
- 返回 401 Unauthorized
- 提示"账号或密码错误"

### AC-004: 参数缺失
**Given**: 请求缺少 username 或 password
**When**: 调用 POST /api/auth/login
**Then**:
- 返回 400 Bad Request
- 提示缺少的参数

### AC-005: Token 验证
**Given**: 登录成功获得 Token
**When**: 验证 Token 内容
**Then**:
- Token 包含 user_id, username, roles
- Token 有合法的 exp 字段
- Token 可正确解析

### AC-006: 测试覆盖
**Given**: 实现完成
**When**: 运行测试
**Then**:
- 单元测试全部通过
- 集成测试全部通过
- 代码覆盖率 >= 90%

## Assumptions
**设计假设：**
1. **ASM-001**: 数据库 users 表已存在，包含 id, username, password, email 字段
2. **ASM-002**: password 字段存储的是 bcrypt 加密后的密码
3. **ASM-003**: 系统已配置 JWT 密钥（process.env.JWT_SECRET）
4. **ASM-004**: 前端能够正确处理 JWT Token 的存储和使用
5. **ASM-005**: 后续 milestone 会实现 Token 刷新机制，当前版本 Token 过期需重新登录

## Open Questions
**待澄清问题：**
1. **Q-001**: 是否需要支持邮箱登录（目前仅支持 username）？
   - **状态**: 待产品确认
   - **当前处理**: 当前版本仅支持 username

2. **Q-002**: 登录成功后是否需要返回 refresh token？
   - **状态**: 待架构确认
   - **当前处理**: 当前版本仅返回 access token，refresh token 在后续 milestone 实现

3. **Q-003**: 是否需要记录登录日志（IP、时间、设备）？
   - **状态**: 待产品确认
   - **当前处理**: 当前版本不记录，预留扩展接口

---

**文档信息：**
- **Spec ID**: spec-login-v1
- **版本**: 1.0.0
- **创建日期**: 2024-01-15
- **作者**: Product Team
- **评审状态**: 待评审
