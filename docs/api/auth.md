# API Documentation - 用户登录功能

**Feature**: 001-bootstrap - 用户登录  
**Version**: 1.0.0  
**Last Updated**: 2024-01-17  

---

## Overview

用户登录功能提供了基于 JWT 的身份认证机制，支持用户名/密码验证。

---

## API Endpoints

### POST /api/auth/login

用户登录接口。

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "username": "string",  // 必填，长度 3-50
  "password": "string"   // 必填，长度 6-100
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

#### Response

**Success (200)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123",
      "username": "testuser",
      "email": "test@example.com",
      "roles": ["user"]
    }
  }
}
```

**Error - Invalid Credentials (401)**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "账号或密码错误"
  }
}
```

**Error - Missing Parameters (400)**:
```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAMETERS",
    "message": "缺少必填参数: username"
  }
}
```

---

## JWT Token

### Token Structure

Token 包含以下字段:
- `user_id`: 用户唯一标识
- `username`: 用户名
- `roles`: 角色数组
- `exp`: 过期时间（24小时）
- `iat`: 签发时间

### Token Verification

使用 `JwtTokenService.verifyToken(token)` 验证 Token 有效性。

### Token Expiration

- **有效期**: 24小时
- **过期后**: 需重新调用登录接口获取新 Token
- **刷新机制**: 后续版本将支持 refresh token

---

## Authentication Flow

```
1. Client 发送 POST /api/auth/login
2. Server 验证用户名和密码
   - 用户不存在 -> 返回 401
   - 密码错误 -> 返回 401
3. Server 生成 JWT Token
4. Server 返回 Token 和用户信息
5. Client 存储 Token（localStorage/cookie）
6. Client 后续请求携带 Token（Authorization: Bearer <token>）
```

---

## Security Features

### 密码安全
- 使用 **bcrypt** 加密存储
- Salt rounds: 10
- 密码比对使用恒定时间算法防止时序攻击

### 错误处理
- 统一错误提示"账号或密码错误"，不暴露账号是否存在
- 防止用户枚举攻击

### Token 安全
- 使用强密钥签名（JWT_SECRET）
- 24小时过期时间
- HTTPS 传输（生产环境）

### SQL 注入防护
- 使用参数化查询
- 输入验证

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_CREDENTIALS | 401 | 账号或密码错误 |
| MISSING_PARAMETERS | 400 | 缺少必填参数 |
| TOKEN_INVALID | 401 | Token 无效或已过期 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

---

## Testing

### 测试覆盖率
- **单元测试**: 95%
- **集成测试**: 10 个场景
- **性能测试**: P99 < 200ms, QPS > 1000

### 运行测试
```bash
# 单元测试
npm test

# 集成测试
npm run test:integration

# 性能测试
npm run test:performance
```

---

## Implementation Details

### Architecture
```
AuthController (HTTP Layer)
  ↓
AuthService (Business Layer)
  ↓
UserRepository (Data Layer)
JwtTokenService (Token Generation)
```

### Key Files
- `src/controllers/AuthController.ts` - HTTP 接口
- `src/services/AuthService.ts` - 业务逻辑
- `src/services/JwtTokenService.ts` - Token 生成
- `src/exceptions/AuthExceptions.ts` - 异常定义

---

## Changelog

### v1.0.0 (2024-01-17)
- ✅ 实现用户登录功能
- ✅ JWT Token 生成与验证
- ✅ bcrypt 密码加密
- ✅ 时序攻击防护
- ✅ 完整的测试覆盖

---

## Future Improvements

### Planned
- [ ] Token 刷新机制（refresh token）
- [ ] 登录日志记录
- [ ] 防暴力破解（速率限制）
- [ ] 多因素认证（MFA）

### Suggestions
- [ ] OAuth 第三方登录
- [ ] 密码重置功能
- [ ] 用户注册功能

---

## References

- Spec: `specs/001-bootstrap/spec.md`
- Plan: `specs/001-bootstrap/plan.md`
- Tasks: `specs/001-bootstrap/tasks.md`
- Review Report: `artifacts/001-bootstrap/T-010-review-report.md`

---

**API Version**: 1.0.0  
**Last Updated**: 2024-01-17  
**Maintainer**: OpenCode Expert Pack Team