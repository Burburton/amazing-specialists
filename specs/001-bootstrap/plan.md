# Implementation Plan: 用户登录功能

## Architecture Summary

### 总体架构
采用分层架构设计：
- **Controller 层**: 处理 HTTP 请求，参数校验，响应封装
- **Service 层**: 业务逻辑处理，认证流程编排
- **Repository 层**: 数据访问（复用现有 UserRepository）
- **Util 层**: JWT Token 生成与验证工具

### 技术栈
- **语言**: TypeScript
- **框架**: Express.js / NestJS
- **认证**: JWT (jsonwebtoken)
- **加密**: bcrypt
- **测试**: Jest

### 架构图
```
┌─────────────────────────────────────────────────────────────┐
│                        Client                                │
└──────────────────────┬──────────────────────────────────────┘
                       │ POST /api/auth/login
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   AuthController                             │
│  - login(req, res)                                           │
│  - 参数校验 (username, password)                             │
│  - 调用 AuthService                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    AuthService                               │
│  - validateUser(username, password)                          │
│  - 查询用户 (UserRepository)                                 │
│  - 验证密码 (bcrypt.compare)                                 │
│  - 生成 Token (JwtTokenService)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│ UserRepository   │      │ JwtTokenService  │
│ - findByUsername │      │ - generateToken  │
└──────────────────┘      └──────────────────┘
```

---

## Inputs from Spec

### 核心需求映射
| Spec 需求 | 实现方案 |
|-----------|---------|
| POST /api/auth/login | AuthController.login() 方法 |
| username/password 验证 | AuthService.validateUser() |
| JWT Token 生成 | JwtTokenService.generateToken() |
| bcrypt 密码验证 | bcrypt.compare() |
| 错误处理 | 自定义异常类 + 全局异常过滤器 |
| Token 包含 user_id, username, roles | JWT payload 设计 |

### 接口契约

#### LoginRequest
```typescript
interface LoginRequest {
  username: string;  // 必填，长度 3-50
  password: string;  // 必填，长度 6-100
}
```

#### LoginResponse (Success)
```typescript
interface LoginResponse {
  success: true;
  data: {
    token: string;     // JWT Token
    user: {
      id: string;
      username: string;
      email: string;
      roles: string[];
    }
  }
}
```

#### LoginResponse (Error)
```typescript
interface LoginErrorResponse {
  success: false;
  error: {
    code: 'INVALID_CREDENTIALS' | 'MISSING_PARAMETERS';
    message: string;
  }
}
```

---

## Technical Constraints

### 硬性约束
1. **TC-001**: 必须使用 JWT 进行会话管理
   - 库: jsonwebtoken
   - 算法: HS256
   
2. **TC-002**: 密码必须使用 bcrypt 加密
   - salt rounds: 10
   - 库: bcrypt

3. **TC-003**: 不改数据库 schema
   - 复用现有 users 表
   - 不添加新字段

4. **TC-004**: 不引入新依赖（除 jwt、bcrypt 外）

### 性能约束
- 响应时间 < 200ms (P99)
- 支持 1000 QPS

### 安全约束
- 防止时序攻击
- 不暴露敏感信息
- Token 使用强密钥签名

---

## Module Decomposition

### 模块划分

#### Module 1: AuthController (控制器层)
**职责**: HTTP 请求处理
**文件**: `src/controllers/AuthController.ts`
**方法**:
- `POST /api/auth/login` - 登录接口

**输入**: LoginRequest
**输出**: LoginResponse / LoginErrorResponse

#### Module 2: AuthService (业务层)
**职责**: 认证业务逻辑
**文件**: `src/services/AuthService.ts`
**方法**:
- `validateUser(username, password): Promise<User>` - 验证用户
- `login(credentials): Promise<LoginResult>` - 登录流程

**依赖**: UserRepository, JwtTokenService

#### Module 3: JwtTokenService (工具层)
**职责**: Token 生成与验证
**文件**: `src/services/JwtTokenService.ts`
**方法**:
- `generateToken(user): string` - 生成 Token
- `verifyToken(token): TokenPayload` - 验证 Token（预留）

**配置**:
```typescript
{
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256'
}
```

#### Module 4: UserRepository (数据层)
**职责**: 用户数据访问
**文件**: `src/repositories/UserRepository.ts` (复用现有)
**方法**:
- `findByUsername(username): Promise<User | null>`

#### Module 5: AuthExceptions (异常层)
**职责**: 自定义异常
**文件**: `src/exceptions/AuthExceptions.ts`
**异常类**:
- `InvalidCredentialsException` - 认证失败
- `UserNotFoundException` - 用户不存在

---

## Data Flow

### 登录流程数据流

```
Step 1: Request Validation
Client -> AuthController
Input: { username, password }
Validation: 检查必填字段

Step 2: User Lookup
AuthController -> AuthService -> UserRepository
Query: SELECT * FROM users WHERE username = ?
Result: User | null

Step 3: Password Verification
AuthService -> bcrypt
Operation: bcrypt.compare(inputPassword, storedHash)
Result: boolean

Step 4: Token Generation
AuthService -> JwtTokenService
Payload: { user_id, username, roles, exp }
Result: JWT Token

Step 5: Response
AuthService -> AuthController -> Client
Output: { token, user }
```

### 错误处理数据流

```
Step 1: Error Occurs
- User not found
- Password mismatch
- Validation error

Step 2: Exception Throw
Service throws AuthException

Step 3: Exception Handler
Global exception handler catches

Step 4: Error Response
Returns standardized error response
```

---

## Failure Handling

### 失败场景与处理

| 失败场景 | 处理策略 | 返回值 |
|---------|---------|--------|
| 用户不存在 | 返回 401，不暴露用户状态 | { code: 'INVALID_CREDENTIALS', message: '账号或密码错误' } |
| 密码错误 | 使用 bcrypt 安全比较，返回 401 | { code: 'INVALID_CREDENTIALS', message: '账号或密码错误' } |
| 参数缺失 | 返回 400，提示缺少参数 | { code: 'MISSING_PARAMETERS', message: '缺少参数: username' } |
| Token 生成失败 | 返回 500，记录日志 | { code: 'INTERNAL_ERROR', message: '服务器内部错误' } |
| 数据库错误 | 返回 500，记录日志 | { code: 'INTERNAL_ERROR', message: '服务器内部错误' } |

### 时序攻击防护
- 使用 bcrypt.compare() 进行密码比对（天然防护）
- 用户不存在时执行虚拟 bcrypt.compare（恒定时间）

### 异常处理代码示例
```typescript
try {
  const user = await userRepository.findByUsername(username);
  if (!user) {
    // 执行虚拟比对以防止时序攻击
    await bcrypt.compare('dummy', '$2b$10$...');
    throw new InvalidCredentialsException();
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new InvalidCredentialsException();
  }
  
  return user;
} catch (error) {
  logger.error('Login error', { username, error });
  throw error;
}
```

---

## Validation Strategy

### 输入验证
- **username**: 必填，字符串，长度 3-50，只包含字母数字下划线
- **password**: 必填，字符串，长度 6-100

### 业务验证
- **用户存在性**: 数据库查询
- **密码正确性**: bcrypt 比对

### 测试验证
- **单元测试**: 覆盖所有分支
- **集成测试**: 覆盖完整流程
- **边界测试**: 空值、超长值、特殊字符

---

## Risks / Tradeoffs

### 识别风险

#### Risk 1: 时序攻击
**风险**: 通过响应时间差异判断账号是否存在
**缓解**: 使用 bcrypt 安全比对，不存在用户也执行虚拟比对
**级别**: medium
**状态**: 已处理

#### Risk 2: Token 泄露
**风险**: JWT Token 被截获，攻击者可冒充用户
**缓解**: 
- 设置合理的过期时间（24h）
- 使用 HTTPS
- 后续 milestone 实现 Token 刷新机制
**级别**: high
**状态**: 已缓解，需后续改进

#### Risk 3: 暴力破解
**风险**: 攻击者使用字典破解密码
**缓解**: 
- bcrypt 自带慢哈希防护
- 后续 milestone 添加速率限制
**级别**: medium
**状态**: 部分缓解，需后续改进

#### Risk 4: 敏感信息泄露
**风险**: 错误信息泄露系统内部状态
**缓解**: 统一错误提示，不区分账号不存在和密码错误
**级别**: medium
**状态**: 已处理

### 设计权衡

#### Tradeoff 1: Token 有效期
**选项 A**: 短 Token（1小时）+ Refresh Token
- 优点：更安全
- 缺点：实现复杂，需要 refresh 机制

**选项 B**: 长 Token（24小时）
- 优点：实现简单
- 缺点：泄露风险更大

**选择**: 选项 B（当前 milestone）
**理由**: MVP 优先简单实现，后续 milestone 添加 Refresh Token

#### Tradeoff 2: 错误提示统一
**选项 A**: 详细错误（账号不存在 / 密码错误）
- 优点：用户体验好
- 缺点：暴露账号存在性

**选项 B**: 统一错误（"账号或密码错误"）
- 优点：更安全
- 缺点：用户体验稍差

**选择**: 选项 B
**理由**: 安全优先

---

## Requirement Traceability

### 需求追溯矩阵

| Spec ID | Spec 描述 | Plan 实现 | 验证方式 |
|---------|-----------|-----------|----------|
| AC-001 | 正常登录 | AuthController.login() | 集成测试 |
| AC-002 | 账号不存在 | UserRepository.findByUsername() + 错误处理 | 单元测试 |
| AC-003 | 密码错误 | bcrypt.compare() + 错误处理 | 单元测试 |
| AC-004 | 参数缺失 | Controller 参数校验 | 单元测试 |
| AC-005 | Token 验证 | JwtTokenService.generateToken() | 单元测试 |
| AC-006 | 测试覆盖 | 单元测试 + 集成测试 | 覆盖率报告 |
| BR-001 | 参数必填 | Controller 校验 | 单元测试 |
| BR-002 | bcrypt 加密 | bcrypt.compare() | 代码审查 |
| BR-003 | 错误提示统一 | AuthException 处理 | 单元测试 |
| BR-004 | Token 24h | JWT config expiresIn | 单元测试 |
| BR-005 | 不返回密码 | Response DTO | 单元测试 |
| TC-001 | JWT 认证 | jsonwebtoken | 依赖检查 |
| TC-002 | bcrypt 加密 | bcrypt | 依赖检查 |
| TC-003 | 不改 schema | 复用 UserRepository | 代码审查 |
| TC-004 | 不引入新依赖 | package.json | 依赖检查 |

---

## Implementation Order

### 推荐实现顺序
1. **Step 1**: JwtTokenService（工具层，无依赖）
2. **Step 2**: AuthExceptions（异常定义）
3. **Step 3**: AuthService（业务层，依赖 JwtTokenService）
4. **Step 4**: AuthController（控制器层，依赖 AuthService）
5. **Step 5**: 单元测试（各层独立测试）
6. **Step 6**: 集成测试（完整流程测试）

### 依赖关系
```
AuthController -> AuthService -> JwtTokenService
                         -> UserRepository (existing)
```

---

**文档信息：**
- **Plan ID**: plan-login-v1
- **版本**: 1.0.0
- **创建日期**: 2024-01-16
- **作者**: Architect
- **关联 Spec**: spec-login-v1
