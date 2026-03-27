# Design Note: user-auth-login

## Document Status
- **Feature ID**: `user-auth-login`
- **Version**: 1.0.0
- **Status**: Complete

---

## 技术方案

### 架构设计

```
┌─────────────────────────────────────────────────────┐
│                    API Layer                        │
│  ┌─────────────────────────────────────────────┐   │
│  │           AuthController                     │   │
│  │  POST /api/auth/login                        │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  Service Layer                      │
│  ┌─────────────────┐    ┌─────────────────────┐    │
│  │   AuthService   │───>│     JwtService      │    │
│  │ - login()       │    │ - generateToken()   │    │
│  │ - validateUser()│    │ - verifyToken()     │    │
│  └─────────────────┘    └─────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  Data Layer                         │
│  ┌─────────────────────────────────────────────┐   │
│  │         UserRepository                       │   │
│  │  - findByUsername(username)                  │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
                   ┌───────────┐
                   │  users    │
                   │  table    │
                   └───────────┘
```

---

## 数据模型

### User Entity
```typescript
interface User {
  id: string;
  username: string;
  passwordHash: string;  // bcrypt hash
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Login Request
```typescript
interface LoginRequest {
  username: string;
  password: string;
}
```

### Login Response
```typescript
interface LoginResponse {
  token: string;
  expiresIn: number;  // seconds
}
```

### JWT Payload
```typescript
interface JwtPayload {
  userId: string;
  username: string;
  roles: string[];
  iat: number;  // issued at
  exp: number;  // expiration
}
```

---

## 关键决策

### 决策 1: 密码验证方式
**选项**:
- A: 同步 bcrypt.compare
- B: 异步 bcrypt.compare

**选择**: B (异步)

**理由**:
- bcrypt.compare 是 CPU 密集型操作
- 异步不会阻塞事件循环
- 更适合高并发场景

### 决策 2: Token 存储位置
**选项**:
- A: 返回在响应体中
- B: 设置 HttpOnly Cookie

**选择**: A (响应体)

**理由**:
- spec 要求返回 token
- 客户端可灵活处理存储
- 后续可扩展为双模式

### 决策 3: 错误信息
**选项**:
- A: 区分 "用户不存在" 和 "密码错误"
- B: 统一返回 "用户名或密码错误"

**选择**: B (统一)

**理由**:
- 防止用户枚举攻击
- 符合 OWASP 建议
- AC-005 要求

---

## 接口契约

### POST /api/auth/login

**Request**:
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response (200)**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

**Response (401)**:
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "用户名或密码错误"
}
```

---

## 依赖

### npm 包
- `jsonwebtoken`: ^9.0.0
- `bcrypt`: ^5.1.0

### 环境变量
- `JWT_SECRET`: Token 签名密钥 (required)
- `JWT_EXPIRES_IN`: Token 有效期 (default: 24h)

---

## 风险与缓解

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 暴力破解 | 高 | 添加速率限制 (后续) |
| Token 泄露 | 中 | 设置合理过期时间 |
| 密码比对慢 | 低 | 使用异步方法 |

---

## 参考
- spec.md: 产品规格
- plan.md: 实现计划