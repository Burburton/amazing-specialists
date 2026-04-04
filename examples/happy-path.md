# Happy Path Example - 用户登录功能开发

> **注意**: 本示例展示的是系统内部调用流程，用于理解架构。
> 用户实际操作入口是 `/spec-start <feature-id>`，而非手动构造 Dispatch Payload。
> 如需学习日常使用方式，请参考 [01-quick-start/minimal-example.md](01-quick-start/minimal-example.md)。

## Scenario
开发一个用户登录功能，包括：
- 用户名/密码验证
- JWT Token 生成与返回
- 基础错误处理（账号不存在、密码错误）

这是一个典型的标准 feature 开发流程，涉及所有 6 个核心角色的正常协作。

## Input

### OpenClaw 管理层输入

**Dispatch Payload (architect task):**
```yaml
dispatch_id: dsp-001
project_id: proj-auth-system
milestone_id: ms-login-feature
task_id: task-login-arch
role: architect
command: design-task
title: 设计用户登录功能技术方案
goal: 输出可执行的登录功能技术设计方案
description: |
  设计用户登录功能的技术实现方案：
  1. 用户名/密码验证流程
  2. JWT Token 生成机制
  3. 错误处理策略
context:
  project_goal: 构建完整的用户认证系统
  milestone_goal: 实现用户登录闭环
  task_scope: 登录功能的技术方案设计
constraints:
  - 必须使用 JWT 进行会话管理
  - 密码必须使用 bcrypt 加密
  - 不改数据库 schema（复用现有 users 表）
inputs:
  - artifact_id: spec-login-v1
    artifact_type: spec
    path: specs/login/spec.md
    summary: 登录功能产品规格
expected_outputs:
  - design_note
  - interface_contract
  - implementation_plan
verification_steps:
  - design_review
  - developer_readable
risk_level: medium
```

## Expected Behavior

### 1. architect 执行
**输入：** dispatch payload 包含 spec 和约束

**处理：**
- 读取 spec-login-v1，理解需求
- 分析现有代码结构和 users 表 schema
- 设计登录流程：验证 -> 密码比对 -> Token 生成
- 定义接口：POST /api/auth/login
- 识别风险：密码泄露风险、暴力破解风险

**输出 Execution Result:**
```yaml
status: SUCCESS
summary: |
  完成登录功能技术方案设计：
  1. 设计了完整的登录验证流程
  2. 定义了 LoginRequest/LoginResponse 接口契约
  3. 识别了密码安全和暴力破解风险
artifacts:
  - artifact_id: design-login-v1
    artifact_type: design_note
    path: artifacts/design/design-login-v1.md
recommendation: SEND_TO_IMPLEMENT
```

### 2. developer 执行
**输入：** architect 的 design_note

**处理：**
- 读取 design-login-v1
- 实现 AuthController.login() 方法
- 实现 AuthService.validateUser() 方法
- 实现 JwtTokenService.generateToken() 方法
- 添加错误处理（UserNotFoundException, InvalidPasswordException）
- 编写基础单元测试

**输出 Execution Result:**
```yaml
status: SUCCESS
summary: |
  完成登录功能实现：
  1. 实现了 AuthController.login() 接口
  2. 实现了用户验证和密码比对逻辑
  3. 实现了 JWT Token 生成
  4. 添加了完整的错误处理
changed_files:
  - path: src/controllers/AuthController.ts
    change_type: added
  - path: src/services/AuthService.ts
    change_type: added
  - path: src/services/JwtTokenService.ts
    change_type: added
  - path: src/exceptions/AuthExceptions.ts
    change_type: added
checks_performed:
  - 实现目标对齐检查
  - 改动范围检查
  - 依赖引入检查（添加 jsonwebtoken, bcrypt）
  - 与 design note 一致性检查
recommendation: SEND_TO_TEST
```

### 3. tester 执行
**输入：** developer 的 code changes 和 implementation summary

**处理：**
- 设计测试用例：
  - 正常登录成功
  - 账号不存在
  - 密码错误
  - Token 生成验证
- 编写单元测试
- 编写集成测试
- 执行测试并输出结果

**输出 Execution Result:**
```yaml
status: SUCCESS
summary: |
  完成登录功能测试：
  - 新增 12 个单元测试，全部通过
  - 新增 4 个集成测试，全部通过
  - 覆盖了正常路径和错误路径
artifacts:
  - artifact_id: test-report-login-v1
    artifact_type: test_report
    path: artifacts/test/test-report-login-v1.md
    summary: 16 个测试全部通过，覆盖率 92%
checks_performed:
  - 关键路径覆盖检查
  - 边界条件检查
  - 错误处理路径检查
recommendation: SEND_TO_REVIEW
```

### 4. reviewer 执行
**输入：** code diff + test report + design note

**处理：**
- 审查代码实现是否符合 design note
- 检查错误处理完整性
- 检查安全性（密码处理、Token 生成）
- 检查测试覆盖度
- 给出审查意见

**输出 Execution Result:**
```yaml
status: SUCCESS
summary: |
  完成登录功能代码审查：
  - 代码结构清晰，符合设计
  - 错误处理完整
  - 测试覆盖充分
  - 无 must-fix 问题
artifacts:
  - artifact_id: review-login-v1
    artifact_type: review_report
    path: artifacts/review/review-login-v1.md
    summary: 审查通过，2 个建议项（非阻塞）
issues_found:
  - issue_id: REV-001
    severity: low
    description: 建议添加登录日志记录
    recommendation: 可在下一阶段补充
  - issue_id: REV-002
    severity: low
    description: Token 过期时间建议可配置
    recommendation: 后续优化
recommendation: CONTINUE
```

### 5. docs 执行
**输入：** implementation summary + review report

**处理：**
- 更新 README.md，添加登录 API 使用说明
- 更新 API 文档，添加 /api/auth/login 接口文档
- 更新 CHANGELOG.md，记录登录功能变更

**输出 Execution Result:**
```yaml
status: SUCCESS
summary: |
  完成文档同步：
  - 更新了 README.md（添加登录接口说明）
  - 更新了 docs/api/auth.md（添加登录接口文档）
  - 更新了 CHANGELOG.md（v0.2.0 变更记录）
artifacts:
  - artifact_id: docs-update-login-v1
    artifact_type: doc_update_report
    path: artifacts/docs/docs-update-login-v1.md
recommendation: CONTINUE
```

### 6. Milestone 验收
**OpenClaw 生成 AcceptanceReport:**
```yaml
id: acceptance-login-ms-001
milestone_id: ms-login-feature
status: MILESTONE_ACCEPTED
objective: 实现用户登录闭环
completed_items:
  - 技术方案设计（architect）
  - 登录功能实现（developer）
  - 测试覆盖 92%（tester）
  - 代码审查通过（reviewer）
  - 文档同步完成（docs）
artifacts:
  - design-login-v1
  - implementation-login-v1
  - test-report-login-v1
  - review-login-v1
  - docs-update-login-v1
verification_summary:
  - build: pass
  - unit_test: 16/16 pass
  - integration_test: 4/4 pass
  - review: approve
risks:
  - level: low
    description: 建议添加登录日志和 Token 可配置
recommendation: CONTINUE
next_actions:
  - 进入下一 milestone（用户注册功能）
```

## Expected Output

### 最终产物清单
1. **design-login-v1.md** - 技术设计方案
2. **AuthController.ts** - 登录接口控制器
3. **AuthService.ts** - 认证服务
4. **JwtTokenService.ts** - Token 服务
5. **AuthExceptions.ts** - 异常定义
6. **test-report-login-v1.md** - 测试报告
7. **review-login-v1.md** - 审查报告
8. **docs-update-login-v1.md** - 文档更新报告

### 流程数据
- **总任务数**: 5 个（architect + developer + tester + reviewer + docs）
- **返工次数**: 0 次
- **升级次数**: 0 次
- **总耗时**: ~2 小时（估算）

## Why This Matters

### 验证的能力
1. **角色协作能力** - 验证 6 个角色能顺畅协作完成 feature 开发
2. **契约一致性** - 验证 dispatch/execution/artifact 契约能正确传递
3. **质量门禁** - 验证各 role gate 能有效筛选合格输出
4. **可追溯性** - 验证从 spec 到 design 到 implementation 的完整链条
5. **零返工流程** - 展示理想情况下的一次性通过流程

### 适用场景
- 标准 feature 开发
- 需求明确、约束清晰的任务
- 团队对技术方案达成共识的项目

### 关键成功要素
1. spec 清晰，无重大歧义
2. architect 输出可执行的 design
3. developer 严格按 design 实现
4. tester 覆盖关键路径
5. reviewer 认可实现质量

### 与 Failure Cases 的区别
Happy Path 展示**理想流程** - 所有角色一次通过，无返工无升级。
Failure Cases 展示**异常处理** - 各种失败场景和恢复机制。
两者结合验证专家包的完整性和鲁棒性。