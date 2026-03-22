# 阶段3继续执行计划：001-bootstrap 剩余任务

**文档用途**: 记录阶段3剩余任务的执行计划、顺序和状态  
**创建时间**: 2024-01-17  
**总任务数**: 11 个（T-002 到 T-012）  
**预计总耗时**: 12.5 小时  

---

## 执行策略

### 策略选择：分批执行
由于任务较多（11个），采用**分批执行**策略：

**第一批**（Phase 1 剩余 + Phase 2）：核心实现
- T-002: JwtTokenService（基础服务）
- T-003: AuthExceptions（异常定义）
- T-004: AuthService - 用户验证（核心业务）
- T-005: AuthService - 登录流程（核心业务）
- T-006: AuthController（接口层）

**第二批**（Phase 3）：测试验证
- T-007: 单元测试
- T-008: 集成测试
- T-009: 性能测试

**第三批**（Phase 4）：审查与文档
- T-010: 代码审查
- T-011: 文档同步
- T-012: 安全审查

---

## 第一批：核心实现（5个任务）

### T-002: JwtTokenService 实现
**优先级**: P0（基础依赖）  
**执行角色**: developer  
**依赖**: T-001 ✅  
**预计耗时**: 1小时  
**风险**: 低  
**关键输出**: 
- src/services/JwtTokenService.ts
- src/services/JwtTokenService.test.ts

**验收标准**:
- [ ] generateToken() 方法实现
- [ ] Token 包含 user_id, username, roles, exp
- [ ] 单元测试通过率 100%

**设计参考**: plan.md - JwtTokenService 模块  
**依赖包**: jsonwebtoken  
**阻塞下游**: T-004, T-005

---

### T-003: AuthExceptions 定义
**优先级**: P0（异常基础）  
**执行角色**: developer  
**依赖**: T-001 ✅  
**预计耗时**: 30分钟  
**风险**: 低  
**关键输出**:
- src/exceptions/AuthExceptions.ts

**验收标准**:
- [ ] InvalidCredentialsException 定义
- [ ] UserNotFoundException 定义（可选）
- [ ] 错误码和消息符合规范

**设计参考**: plan.md - AuthExceptions 模块  
**阻塞下游**: T-004

---

### T-004: AuthService 实现 - 用户验证
**优先级**: P0（核心业务）  
**执行角色**: developer  
**依赖**: T-002 ⬜, T-003 ⬜  
**预计耗时**: 2小时  
**风险**: 中（bcrypt 集成）  
**关键输出**:
- src/services/AuthService.ts（validateUser 方法）
- src/services/AuthService.test.ts

**验收标准**:
- [ ] validateUser() 方法实现
- [ ] bcrypt.compare() 集成
- [ ] 时序攻击防护（虚拟比对）
- [ ] 单元测试覆盖率 >= 90%

**设计参考**: plan.md - Data Flow Step 2-3  
**关键代码**:
```typescript
async validateUser(username: string, password: string): Promise<User> {
  const user = await userRepository.findByUsername(username);
  if (!user) {
    // 虚拟比对防止时序攻击
    await bcrypt.compare('dummy', '$2b$10$...');
    throw new InvalidCredentialsException();
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new InvalidCredentialsException();
  }
  return user;
}
```

**阻塞下游**: T-005

---

### T-005: AuthService 实现 - 登录流程
**优先级**: P0（核心业务）  
**执行角色**: developer  
**依赖**: T-004 ⬜  
**预计耗时**: 1小时  
**风险**: 低  
**关键输出**:
- src/services/AuthService.ts（login 方法）

**验收标准**:
- [ ] login() 方法实现
- [ ] 返回 Token 和用户信息
- [ ] 不返回密码字段

**设计参考**: plan.md - Data Flow Step 4-5  
**关键代码**:
```typescript
async login(credentials: LoginRequest): Promise<LoginResult> {
  const user = await this.validateUser(credentials.username, credentials.password);
  const token = jwtTokenService.generateToken({
    user_id: user.id,
    username: user.username,
    roles: user.roles
  });
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles
    }
  };
}
```

**阻塞下游**: T-006

---

### T-006: AuthController 实现
**优先级**: P0（接口层）  
**执行角色**: developer  
**依赖**: T-005 ⬜  
**预计耗时**: 1.5小时  
**风险**: 低  
**关键输出**:
- src/controllers/AuthController.ts
- src/controllers/AuthController.test.ts

**验收标准**:
- [ ] POST /api/auth/login endpoint 实现
- [ ] 参数校验（username, password 必填）
- [ ] 调用 AuthService
- [ ] 返回标准化响应
- [ ] 错误处理（try-catch + exception handler）

**设计参考**: plan.md - AuthController 模块  
**关键代码**:
```typescript
@Post('/api/auth/login')
async login(@Body() request: LoginRequest): Promise<LoginResponse> {
  try {
    // 参数校验
    if (!request.username || !request.password) {
      return {
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: '缺少必填参数'
        }
      };
    }
    
    const result = await authService.login(request);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    if (error instanceof InvalidCredentialsException) {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '账号或密码错误'
        }
      };
    }
    throw error;
  }
}
```

**阻塞下游**: T-007（单元测试）

---

## 第二批：测试验证（3个任务）

### T-007: 单元测试
**优先级**: P1（质量保障）  
**执行角色**: tester  
**依赖**: T-006 ✅  
**预计耗时**: 2小时  
**风险**: 低  
**关键输出**:
- 单元测试套件
- 测试报告（覆盖率 >= 90%）

**测试范围**:
- [ ] JwtTokenService 单元测试
- [ ] AuthService 单元测试
- [ ] AuthController 单元测试
- [ ] 边界条件测试（空值、超长值、特殊字符）
- [ ] 错误场景测试

**测试场景**:
```typescript
// 正常登录
test('login with valid credentials returns token', () => { ... });

// 账号不存在
test('login with non-existent user throws InvalidCredentialsException', () => { ... });

// 密码错误
test('login with wrong password throws InvalidCredentialsException', () => { ... });

// 参数缺失
test('login with missing username returns 400', () => { ... });
test('login with missing password returns 400', () => { ... });

// Token 内容验证
test('token contains user_id, username, roles', () => { ... });
test('token expires in 24 hours', () => { ... });
```

**阻塞下游**: T-008

---

### T-008: 集成测试
**优先级**: P1（质量保障）  
**执行角色**: tester  
**依赖**: T-007 ✅  
**预计耗时**: 1.5小时  
**风险**: 中（数据库环境）  
**关键输出**:
- 集成测试套件
- 集成测试报告

**测试范围**:
- [ ] 完整登录流程测试（端到端）
- [ ] 数据库集成测试
- [ ] Token 验证流程测试

**测试场景**:
```typescript
test('POST /api/auth/login - full flow', async () => {
  // 1. 创建测试用户
  await createTestUser({ username: 'test', password: 'password123' });
  
  // 2. 调用登录接口
  const response = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test', password: 'password123' });
  
  // 3. 验证响应
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data.token).toBeDefined();
  
  // 4. 验证 Token 可用
  const decoded = jwt.verify(response.body.data.token, JWT_SECRET);
  expect(decoded.user_id).toBeDefined();
});
```

**阻塞下游**: T-009, T-010

---

### T-009: 性能测试
**优先级**: P2（非功能性）  
**执行角色**: tester  
**依赖**: T-008 ✅  
**预计耗时**: 1小时  
**风险**: 中（可能需优化）  
**关键输出**:
- 性能测试报告

**测试指标**:
- [ ] 响应时间 < 200ms (P99)
- [ ] 支持 1000 QPS

**测试工具**: k6 / artillery / autocannon  
**测试脚本**:
```javascript
// k6 性能测试
export default function () {
  const payload = JSON.stringify({
    username: 'testuser',
    password: 'testpass123'
  });
  
  const res = http.post('http://localhost:3000/api/auth/login', payload, {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200
  });
}
```

**阻塞下游**: T-010（审查）

---

## 第三批：审查与文档（3个任务）

### T-010: 代码审查
**优先级**: P1（质量门禁）  
**执行角色**: reviewer  
**依赖**: T-008 ✅  
**预计耗时**: 1小时  
**风险**: 中（可能发现需返工问题）  
**关键输出**:
- review_report

**审查清单**:
- [ ] 代码符合编码规范
- [ ] 无 must-fix 问题
- [ ] 安全审查（bcrypt 使用、错误处理）
- [ ] 测试覆盖度 >= 90%
- [ ] 与 spec 和 plan 一致

**审查报告模板**:
```yaml
review_id: review-login-v1
overall_decision: approve  # approve / reject / warn
issues:
  must_fix: []  # 阻塞问题
  suggestions:
    - id: SUG-001
      description: 建议添加登录日志
      priority: low
    - id: SUG-002
      description: Token 过期时间建议可配置
      priority: low
risks:
  - description: Token 泄露风险（24h 较长）
    mitigation: 后续实现 refresh token
recommendation: CONTINUE
```

**可能结果**:
1. **Approve**: 继续 T-011
2. **Warn**: 接受建议，继续 T-011（建议后续优化）
3. **Reject**: 生成 ReworkRequest，返工 T-004/T-005/T-006

**阻塞下游**: T-011, T-012

---

### T-011: 文档同步
**优先级**: P2（可维护性）  
**执行角色**: docs  
**依赖**: T-010 ✅  
**预计耗时**: 1小时  
**风险**: 低  
**关键输出**:
- README.md 更新
- CHANGELOG.md 更新
- API 文档（可选）

**文档内容**:
- [ ] README: 添加登录接口使用说明
- [ ] CHANGELOG: 记录 v0.2.0 变更
- [ ] API 文档: /api/auth/login 接口文档

**README 示例**:
```markdown
## API 文档

### POST /api/auth/login
用户登录

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "1",
      "username": "test",
      "email": "test@example.com",
      "roles": ["user"]
    }
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "账号或密码错误"
  }
}
```
```

**阻塞下游**: Milestone 验收

---

### T-012: 安全审查
**优先级**: P0（必须执行）  
**执行角色**: security  
**依赖**: T-010 ✅  
**触发条件**: 涉及认证功能，必须执行  
**预计耗时**: 1小时  
**风险**: 中（可能发现安全问题需返工）  
**关键输出**:
- security_report

**审查清单**:
- [ ] 密码明文存储检查
- [ ] bcrypt 使用检查（salt rounds >= 10）
- [ ] 时序攻击防护检查
- [ ] Token 敏感信息检查（是否含密码）
- [ ] 错误信息泄露检查
- [ ] JWT 密钥强度检查

**审查报告模板**:
```yaml
security_report_id: sec-login-v1
scope: 登录功能安全检查
issues:
  critical: []  # 必须修复
  high: []      # 建议修复
  medium:
    - id: SEC-MED-001
      description: Token 24h 过期时间较长
      recommendation: 后续实现 refresh token
  low:
    - id: SEC-LOW-001
      description: 建议添加防暴力破解机制
      recommendation: 后续添加速率限制
gate_recommendation: PASS  # PASS / CONDITIONAL / BLOCK
```

**可能结果**:
1. **PASS**: 继续 Milestone 验收
2. **CONDITIONAL**: 有条件通过（记录风险）
3. **BLOCK**: 发现 critical/high 问题，需返工

**阻塞下游**: Milestone 验收

---

## 执行顺序与依赖图

### 时序图
```
T-001 (✅) -> T-002 -> T-003 -> T-004 -> T-005 -> T-006 -> T-007 -> T-008 -> T-009
                                                  |                              
                                                  v                              
                                           T-010 (reviewer)                      
                                                  |                              
                                            +-----+-----+                        
                                            |           |                        
                                            v           v                        
                                       T-011 (docs)  T-012 (security)            
                                            |           |                        
                                            +-----+-----+                        
                                                  |                              
                                                  v                              
                                           Milestone 验收                        
```

### 并行可能性
- **T-002 和 T-003**: 可并行（无依赖）
- **T-011 和 T-012**: 可并行（都依赖 T-010）

### 关键路径
```
T-001 -> T-002 -> T-004 -> T-005 -> T-006 -> T-007 -> T-008 -> T-010 -> T-012 -> 验收
(关键路径长度: 10 个任务)
```

---

## 状态跟踪

| Task | 批次 | 角色 | 依赖 | 状态 | 预计 | 实际 | 风险 |
|------|------|------|------|------|------|------|------|
| T-001 | - | dev | - | ✅ | 30m | 25m | 低 |
| T-002 | 1 | dev | T-001 | ⬜ | 1h | - | 低 |
| T-003 | 1 | dev | T-001 | ⬜ | 30m | - | 低 |
| T-004 | 1 | dev | T-002,T-003 | ⬜ | 2h | - | 中 |
| T-005 | 1 | dev | T-004 | ⬜ | 1h | - | 低 |
| T-006 | 1 | dev | T-005 | ⬜ | 1.5h | - | 低 |
| T-007 | 2 | tester | T-006 | ⬜ | 2h | - | 低 |
| T-008 | 2 | tester | T-007 | ⬜ | 1.5h | - | 中 |
| T-009 | 2 | tester | T-008 | ⬜ | 1h | - | 中 |
| T-010 | 3 | reviewer | T-008 | ⬜ | 1h | - | 中 |
| T-011 | 3 | docs | T-010 | ⬜ | 1h | - | 低 |
| T-012 | 3 | security | T-010 | ⬜ | 1h | - | 中 |

**已完成**: 1/12  
**第一批**: 0/5  ⬜  
**第二批**: 0/3  ⬜  
**第三批**: 0/3  ⬜  

---

## 风险预案

### 返工场景

#### 场景 1: T-010 Reviewer Reject
**触发条件**: T-010 发现 must-fix 问题  
**处理流程**:
1. OpenClaw 生成 ReworkRequest
2. 指定返工任务（T-004/T-005/T-006）
3. Developer 修复
4. 重新执行 T-007 -> T-010

#### 场景 2: T-012 Security BLOCK
**触发条件**: 发现 critical/high 安全问题  
**处理流程**:
1. Security 输出 BLOCK + required_fixes
2. OpenClaw 生成 ReworkRequest
3. Developer 修复安全问题
4. 重新执行 T-010 -> T-012

### 升级场景

#### 场景 3: 返工超过 max_retry
**触发条件**: T-004 返工 2 次仍未通过  
**处理流程**:
1. OpenClaw 检测 retry_count >= max_retry
2. 生成 Escalation (level: INTERNAL)
3. 可能方案：
   - 转给 architect 重新设计
   - 引入资深 developer
   - 简化需求

---

## 验收标准汇总

### Task-Level 验收
每个 task 必须通过对应 role gate:
- **T-002**: JwtTokenService gate（Token 格式正确）
- **T-003**: Exceptions gate（异常定义完整）
- **T-004**: AuthService gate（验证逻辑正确，时序攻击防护）
- **T-005**: AuthService gate（登录流程完整）
- **T-006**: Controller gate（接口响应正确，错误处理完整）
- **T-007**: Unit Test gate（覆盖率 >= 90%）
- **T-008**: Integration Test gate（端到端流程通过）
- **T-009**: Performance gate（< 200ms, 1000 QPS）
- **T-010**: Reviewer gate（无 must-fix 问题）
- **T-011**: Docs gate（文档同步完成）
- **T-012**: Security gate（无 critical/high 问题）

### Milestone-Level 验收
- 所有 required tasks 完成（T-001 到 T-012）
- 所有验收标准通过（AC-001 到 AC-006）
- 测试覆盖率 >= 90%
- 安全审查通过
- 文档同步完成

---

## 执行记录

### 记录格式
每次执行完一个 task，更新以下信息：

```yaml
task_id: T-XXX
execution_date: 2024-01-XX
role: developer/tester/reviewer/docs/security
status: COMPLETED / FAILED_RETRYABLE / BLOCKED
execution_time: XX minutes
artifacts:
  - path: src/xxx/xxx.ts
  - path: artifacts/001-bootstrap/T-XXX-report.md
issues:
  - description: xxx
    severity: low/medium/high
recommendation: CONTINUE / REWORK
next_action: 进入 T-YYY
```

---

## 附录

### 快速参考

**执行命令模板**:
```bash
# 执行单个任务
/spec-implement 001-bootstrap T-002

# 批量执行（同角色连续任务）
/spec-implement 001-bootstrap T-002
/spec-implement 001-bootstrap T-003
...

# 审计
/spec-audit 001-bootstrap
```

**关键文件路径**:
- Spec: `specs/001-bootstrap/spec.md`
- Plan: `specs/001-bootstrap/plan.md`
- Tasks: `specs/001-bootstrap/tasks.md`
- Artifacts: `artifacts/001-bootstrap/`

**依赖包版本**:
- jsonwebtoken: ^9.0.2
- bcrypt: ^5.1.1

**环境变量**:
- JWT_SECRET: required
- JWT_EXPIRES_IN: 24h

---

**文档维护**:  
- 每次 task 执行完成后更新状态
- 如发现依赖关系错误，及时更新
- 记录返工和升级事件

**版本**: 1.0.0  
**最后更新**: 2024-01-17