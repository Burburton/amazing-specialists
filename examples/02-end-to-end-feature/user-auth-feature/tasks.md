# Task List: user-auth-login

## 任务状态总览

| Task ID | 描述 | 角色 | 状态 | 依赖 |
|---------|------|------|------|------|
| T-1.1 | UserRepository | developer | ✅ | - |
| T-2.1 | AuthService | developer | ✅ | T-1.1 |
| T-2.2 | JwtService | developer | ✅ | - |
| T-3.1 | AuthController | developer | ✅ | T-2.1 |
| T-4.1 | Unit Tests | tester | ✅ | T-3.1 |
| T-4.2 | Integration Tests | tester | ✅ | T-4.1 |
| T-5.1 | Security Review | security | ✅ | T-4.2 |
| T-6.1 | Documentation | docs | ✅ | T-5.1 |

---

## Phase 1: 数据层

### T-1.1: 创建 UserRepository ✅
- **状态**: ✅ COMPLETE
- **执行角色**: developer
- **产出**: `src/repositories/UserRepository.ts`
- **验收标准**:
  - [x] `findByUsername(username)` 方法存在
  - [x] 返回 User 或 null
  - [x] 正确处理数据库错误

---

## Phase 2: 服务层

### T-2.1: 实现 AuthService ✅
- **状态**: ✅ COMPLETE
- **执行角色**: developer
- **产出**: `src/services/AuthService.ts`
- **验收标准**:
  - [x] `login(username, password)` 方法存在
  - [x] 密码验证逻辑正确
  - [x] 返回 Token 或抛出异常

### T-2.2: 实现 JwtService ✅
- **状态**: ✅ COMPLETE
- **执行角色**: developer
- **产出**: `src/services/JwtService.ts`
- **验收标准**:
  - [x] `generateToken(user)` 方法存在
  - [x] Token 包含 userId, username, roles
  - [x] 设置 24 小时过期

---

## Phase 3: API 层

### T-3.1: 实现 AuthController ✅
- **状态**: ✅ COMPLETE
- **执行角色**: developer
- **产出**: `src/controllers/AuthController.ts`
- **验收标准**:
  - [x] POST /api/auth/login 端点
  - [x] 200 成功响应
  - [x] 401 失败响应
  - [x] 错误信息不泄露用户存在性

---

## Phase 4: 测试

### T-4.1: 单元测试 ✅
- **状态**: ✅ COMPLETE
- **执行角色**: tester
- **产出**: 
  - `src/services/AuthService.spec.ts`
  - `src/services/JwtService.spec.ts`
  - `src/controllers/AuthController.spec.ts`
- **验收标准**:
  - [x] AuthService 测试覆盖: 95%
  - [x] JwtService 测试覆盖: 100%
  - [x] AuthController 测试覆盖: 92%

### T-4.2: 集成测试 ✅
- **状态**: ✅ COMPLETE
- **执行角色**: tester
- **产出**: `test/integration/auth.integration.spec.ts`
- **验收标准**:
  - [x] 登录成功场景
  - [x] 用户不存在场景
  - [x] 密码错误场景

---

## Phase 5: 安全审查

### T-5.1: 安全检查 ✅
- **状态**: ✅ COMPLETE
- **执行角色**: security
- **产出**: `artifacts/security-report.md`
- **验收标准**:
  - [x] 密码使用 bcrypt 比对
  - [x] JWT_SECRET 从环境变量读取
  - [x] Token 不包含敏感信息
  - [x] 错误信息不泄露用户存在性

---

## Phase 6: 文档

### T-6.1: API 文档 ✅
- **状态**: ✅ COMPLETE
- **执行角色**: docs
- **产出**: `docs/api/auth.md`
- **验收标准**:
  - [x] 端点描述
  - [x] 请求/响应示例
  - [x] 错误码说明