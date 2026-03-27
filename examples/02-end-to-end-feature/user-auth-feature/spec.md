# Feature Spec: user-auth-login

## Document Status
- **Feature ID**: `user-auth-login`
- **Version**: 1.0.0
- **Status**: Complete
- **Created**: 2026-03-28

---

## Goal

实现用户登录认证功能，支持用户名/密码登录并返回 JWT Token。

---

## Acceptance Criteria

### AC-001: 登录成功
- **Given**: 用户存在且密码正确
- **When**: POST /api/auth/login with `{username, password}`
- **Then**: 返回 200 + JWT Token

### AC-002: 用户不存在
- **Given**: 用户名不存在
- **When**: POST /api/auth/login
- **Then**: 返回 401 + `{"error": "用户名或密码错误"}`

### AC-003: 密码错误
- **Given**: 用户存在但密码错误
- **When**: POST /api/auth/login
- **Then**: 返回 401 + `{"error": "用户名或密码错误"}`

### AC-004: Token 格式
- **Given**: 登录成功
- **When**: 返回 Token
- **Then**: Token 包含 `userId`, `username`, `roles` 字段

### AC-005: 安全要求
- 密码使用 bcrypt 加密存储
- Token 有效期 24 小时
- 登录失败不透露用户是否存在

---

## Scope

### In Scope
- POST /api/auth/login 端点
- JWT Token 生成
- 密码验证
- 错误处理

### Out of Scope
- 用户注册
- 密码重置
- Token 刷新
- 多因素认证

---

## Interface Contract

### Request
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

### Response (Success)
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

### Response (Error)
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "用户名或密码错误"
}
```

---

## Constraints

- 必须使用现有 `users` 表
- Token 使用 HS256 算法签名
- JWT_SECRET 从环境变量读取
- 密码比对时间 < 500ms

---

## Assumptions

- 用户数据已存在于 `users` 表
- 已有 bcrypt 密码哈希
- 已有 JWT 库依赖

---

## References

- [JWT Best Practices](https://auth0.com/blog/jwt-authentication-best-practices/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)