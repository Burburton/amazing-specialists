# Architect 角色示例

本文档展示 architect 角色的具体工作方式和 skill 使用。

---

## 角色定义

**architect** 负责技术方案设计，将产品需求转化为可执行的技术设计。

### MVP Skills
- `requirement-to-design` - 需求转技术设计
- `module-boundary-design` - 模块边界划分
- `tradeoff-analysis` - 技术方案对比分析

### M4 Skills (可选)
- `interface-contract-design` - API/接口契约设计
- `migration-planning` - 迁移策略规划

---

## 典型工作流程

### 输入
```yaml
dispatch_id: dsp-arch-001
role: architect
command: design-task
title: 设计用户登录功能技术方案

inputs:
  - artifact_id: spec-login-v1
    artifact_type: spec
    path: specs/login/spec.md

constraints:
  - 使用 JWT 进行会话管理
  - 密码使用 bcrypt 加密
  - 复用现有 users 表

expected_outputs:
  - design_note
  - interface_contract
```

### 执行过程

#### Step 1: 读取 spec
```
architect 使用 artifact-reading skill 读取 spec.md
提取: Goal, Acceptance Criteria, Constraints, Assumptions
```

#### Step 2: 需求分析
```
使用 requirement-to-design skill:
1. 识别功能需求: 登录验证, Token 生成
2. 识别非功能需求: 安全性, 性能
3. 识别约束条件: JWT, bcrypt, users 表
```

#### Step 3: 架构设计
```
使用 module-boundary-design skill:
1. 定义模块边界: AuthModule
2. 定义层结构: Controller -> Service -> Repository
3. 定义数据流: Request -> Validation -> Service -> Response
```

#### Step 4: 技术决策
```
使用 tradeoff-analysis skill:
决策: Token 存储位置
选项:
  A: 响应体返回
  B: HttpOnly Cookie
分析: ...
选择: A (响应体返回)
```

#### Step 5: 接口设计
```
使用 interface-contract-design skill (M4):
定义:
  - POST /api/auth/login
  - Request: {username, password}
  - Response: {token, expiresIn}
  - Errors: 401 Unauthorized
```

### 输出
```yaml
status: SUCCESS
summary: 完成登录功能技术方案设计

artifacts:
  - artifact_id: design-login-v1
    artifact_type: design_note
    path: artifacts/design/design-login-v1.md

recommendation: SEND_TO_IMPLEMENT
```

---

## Skill 使用示例

### requirement-to-design

**何时使用**: 收到新的功能需求

**输入**: spec.md

**输出**: 
- 功能需求列表
- 非功能需求列表
- 约束条件
- 风险识别

**示例输出**:
```markdown
## 功能需求
1. 用户名/密码验证
2. JWT Token 生成
3. 错误处理

## 非功能需求
1. 响应时间 < 200ms
2. 密码比对 < 500ms
3. 可扩展支持多认证方式

## 约束条件
1. 使用现有 users 表
2. 使用 JWT (HS256)
3. 密码使用 bcrypt

## 风险
1. 暴力破解 - 缓解: 添加速率限制
2. Token 泄露 - 缓解: 短过期时间 + 刷新机制
```

### tradeoff-analysis

**何时使用**: 面临多个技术选项

**输入**: 决策问题, 选项列表

**输出**: 分析矩阵, 推荐选项

**示例**:
```markdown
## 决策: Token 存储位置

### 选项对比

| 维度 | 响应体 | HttpOnly Cookie |
|------|--------|-----------------|
| XSS 安全 | ⚠️ 需前端保护 | ✅ 自动保护 |
| CSRF 安全 | ✅ 无风险 | ⚠️ 需要 CSRF Token |
| 灵活性 | ✅ 客户端决定 | ⚠️ 服务端控制 |
| 实现复杂度 | ✅ 简单 | ⚠️ 需要配置 |

### 推荐
选择: 响应体返回
理由:
- spec 要求返回 token
- 客户端可灵活处理存储
- 后续可扩展双模式
```

---

## 典型产出文件

### design-note.md 结构
```markdown
# Design Note: {feature-name}

## 技术方案
- 架构图
- 数据流图
- 组件交互

## 数据模型
- Entity 定义
- DTO 定义

## 关键决策
- 决策记录
- 选择理由

## 接口契约
- API 端点
- 请求/响应格式

## 风险与缓解
- 风险列表
- 缓解措施
```

---

## 质量门禁

architect 输出必须满足:
- [ ] 设计覆盖所有 AC
- [ ] 接口契约明确定义
- [ ] 风险被识别和记录
- [ ] 约束条件被考虑
- [ ] 技术决策有理由