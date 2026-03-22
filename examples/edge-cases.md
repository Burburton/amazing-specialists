# Edge Cases

本文件描述 OpenCode 专家包在边界场景下的处理方式和预期行为。

---

## Scenario 1: 小功能跳过 architect

### 描述
简单的 bugfix 或配置修改，不涉及架构变更，可直接由 developer 处理。

### Input
**Dispatch Payload (developer task):**
```yaml
dispatch_id: dsp-bug-001
project_id: proj-web-app
milestone_id: ms-hotfix-v1
task_id: task-fix-null-pointer
role: developer
command: fix-task
title: 修复用户详情页空指针异常
goal: 修复当 user.profile 为 null 时的空指针异常
description: |
  用户详情页在 user.profile 为 null 时抛出 NullPointerException。
  需要添加 null 检查并显示默认信息。
  
  这是一个简单的 bugfix，不涉及架构变更。
context:
  project_goal: 修复生产环境 bug
  milestone_goal: 紧急修复空指针问题
  task_scope: 仅修复 UserProfilePage 组件的 null 检查
constraints:
  - 只修改 UserProfilePage.tsx
  - 不修改 API 接口
  - 不修改数据模型
inputs:
  - artifact_id: bug-report-001
    artifact_type: spec
    summary: 空指针异常堆栈信息
expected_outputs:
  - code changes
  - implementation_summary
verification_steps:
  - unit_test
  - review
risk_level: low
```

### Risk
- **风险**: 小功能跳过 architect 可能导致架构一致性丢失
- **潜在问题**: developer 可能做出不符合整体架构的修改

### Expected Handling
1. **OpenClaw 决策**: 根据任务特征判断不需要 architect
   - 变更范围小（单文件）
   - 不涉及接口变更
   - 不涉及数据模型变更
   - risk_level = low

2. **直接分派 developer**:
   ```
   OpenClaw -> developer (跳过 architect)
   ```

3. **developer 执行**:
   - 读取 bug report
   - 定位问题：UserProfilePage.tsx 第 45 行
   - 添加 null 检查：`user.profile?.name ?? 'Unknown'`
   - 编写单元测试
   - 输出结果

4. **验收标准**:
   - changed_files 只有 UserProfilePage.tsx
   - 包含单元测试
   - 通过 reviewer gate

5. **流程缩短**:
   ```
   developer -> tester -> reviewer
   (跳过 architect)
   ```

### 成功标准
- 修复空指针问题
- 未引入新依赖
- 未修改其他文件
- 测试通过

---

## Scenario 2: 低风险变更跳过 security

### 描述
UI 样式调整或文案修改，不涉及认证、权限、敏感数据，跳过 security 检查。

### Input
**Dispatch Payload:**
```yaml
dispatch_id: dsp-ui-001
role: developer
title: 更新登录页欢迎文案
goal: 将登录页标题从"Login"改为"欢迎登录"
description: 更新登录页面的标题文案
constraints:
  - 只修改 UI 文案
  - 不涉及业务逻辑
  - 不涉及数据处理
inputs:
  - artifact_id: ui-mockup-v1
    artifact_type: spec
risk_level: low
domain: ui-only  # 标记为纯 UI 变更
```

### Risk
- **风险**: 错误判断风险等级，实际涉及安全逻辑但被标记为 low
- **潜在问题**: 例如"忘记密码"链接实际上涉及安全流程

### Expected Handling
1. **OpenClaw 风险评估**:
   - 检查 domain = ui-only
   - 检查 constraints 不涉及 auth/permission/data
   - 确认无敏感逻辑变更

2. **标准流程**（跳过 security）:
   ```
   developer -> tester -> reviewer -> docs
   (不涉及 security)
   ```

3. **Risk Override 机制**:
   - 如果 reviewer 发现实际涉及安全逻辑，可触发 security 追加检查
   - reviewer 输出：
     ```yaml
     issues_found:
       - issue_id: REV-SEC-001
         severity: high
         description: 发现该变更涉及密码重置逻辑，需要 security 审查
     recommendation: SEND_TO_SECURITY
     ```

4. **追加 security**:
   - OpenClaw 追加 security task
   - security 检查密码重置流程

### 成功标准
- UI 文案正确更新
- 无安全逻辑变更
- 或：reviewer 正确识别安全风险并触发追加检查

---

## Scenario 3: 部分依赖缺失但可继续

### 描述
某个上游 task 延期，但当前 task 可以基于已有上下文继续执行部分工作。

### Input
**Dispatch Payload (architect task):**
```yaml
dispatch_id: dsp-arch-001
task_id: task-design-payment
role: architect
title: 设计支付模块架构
goal: 输出支付模块技术方案
description: |
  设计支付模块架构，依赖用户认证模块。
  但用户认证模块的详细接口还未完成。
upstreams:
  - task_id: task-auth-api
    status: IN_PROGRESS  # 依赖未完成
    description: 用户认证 API 设计
context:
  assumptions:
    - 假设用户认证模块提供标准 JWT Token
    - 假设认证接口符合 OAuth2 规范
    - 如假设不成立，需要重新设计
constraints:
  - 基于假设继续设计
  - 明确记录假设
  - 假设失效时触发 replan
risk_level: high  # 因依赖未就绪，风险升高
```

### Risk
- **风险**: 依赖未完成导致设计基于假设，假设可能失效
- **潜在问题**: 如果 auth 模块实际接口与假设不符，整个设计需要重做

### Expected Handling
1. **architect 识别依赖状态**:
   - 读取 upstream task 状态：IN_PROGRESS
   - 评估是否可基于假设继续

2. **显式记录假设**:
   ```yaml
   assumptions:
     - 用户认证模块提供 JWT Token（格式：Bearer {token}）
     - Token 包含 user_id, roles 字段
     - 认证失败返回 401
   ```

3. **风险降级策略**:
   - 输出 design_note，但标记 risk_level = high
   - recommendation = PARTIAL
   - 说明哪些部分依赖假设

4. **输出 Execution Result**:
   ```yaml
   status: PARTIAL  # 部分完成
   summary: |
     完成支付模块架构设计（基于假设）：
     1. 设计了支付流程
     2. 定义了支付接口
     3. **依赖假设**：认证接口符合 OAuth2 规范
     
     **注意**：如果认证模块实际接口与假设不符，
     需要重新设计支付模块的认证集成部分。
   
   risks:
     - level: high
       description: 依赖用户认证模块接口假设
       mitigation: 认证模块完成后验证接口兼容性
   
   recommendation: CONTINUE_WITH_WARNINGS
   ```

5. **后续处理**:
   - design_note 进入 developer，但标记为"条件实现"
   - 当 auth 模块完成后，验证假设
   - 如假设失效，触发 replan

### 成功标准
- 基于合理假设继续推进
- 假设被显式记录
- 风险被识别和监控
- 假设失效时触发 replan

---

## Scenario 4: 并行任务执行

### 描述
多个独立的 task 可以同时分派给不同角色执行。

### Input
**Milestone 包含多个独立 task:**
```yaml
milestone_id: ms-user-module
tasks:
  - task_id: task-login-arch
    role: architect
    title: 设计登录功能
    dependencies: []
    status: READY
    
  - task_id: task-register-arch
    role: architect
    title: 设计注册功能
    dependencies: []
    status: READY
    
  - task_id: task-profile-arch
    role: architect
    title: 设计用户资料功能
    dependencies: []
    status: READY
```

### Risk
- **风险**: 并行任务可能产生冲突（如都修改同一个公共模块）
- **潜在问题**: 三个任务都设计用户模块，可能产生不一致的设计

### Expected Handling
1. **OpenClaw 依赖检查**:
   - 检查 task-login-arch 依赖：无
   - 检查 task-register-arch 依赖：无
   - 检查 task-profile-arch 依赖：无
   - 确认三个 task 可并行执行

2. **并行分派**:
   ```
   OpenClaw -> architect (login)  [并行]
   OpenClaw -> architect (register) [并行]
   OpenClaw -> architect (profile)  [并行]
   ```

3. **结果合并**:
   - 三个 architect 分别输出 design_note
   - OpenClaw 审查三个设计的一致性
   - 如果存在冲突（如三个设计都修改 User 模块但接口不一致）：
     - 触发冲突解决
     - 或追加 reviewer 检查设计一致性

4. **冲突检测示例**:
   ```yaml
   # task-login-arch 设计
   UserService.getUser(id): User
   
   # task-profile-arch 设计
   UserService.fetchUser(userId): UserDTO  # 冲突！
   
   # 检测冲突
   conflicts:
     - type: interface_mismatch
       description: 两个设计修改了 UserService 但接口不一致
       recommendation: REPLAN
   ```

5. **解决冲突**:
   - 生成 ReplanRequest
   - 重新规划任务，统一 UserService 设计
   - 或追加"统一用户模块设计"task

### 成功标准
- 独立任务成功并行执行
- 冲突被检测和解决
- 最终设计一致

---

## Scenario 5: 返工后继续（第二次成功）

### 描述
developer 第一次实现有缺陷，返工后成功修复。

### Input
**First Dispatch (developer task):**
```yaml
dispatch_id: dsp-dev-001
task_id: task-payment-impl
role: developer
title: 实现支付功能
goal: 完成支付接口实现
# ... 首次分派
```

**Execution Result (第一次 - 失败):**
```yaml
status: FAILED_RETRYABLE
dispatch_id: dsp-dev-001
issues_found:
  - issue_id: TEST-001
    severity: high
    description: 支付金额未校验为负数
  - issue_id: TEST-002
    severity: high
    description: 并发情况下可能重复扣款
recommendation: REWORK
```

**Second Dispatch (返工):**
```yaml
dispatch_id: dsp-dev-001-retry-1  # 新的 dispatch_id
task_id: task-payment-impl
role: developer
command: fix-task
title: 修复支付功能缺陷（返工）
goal: 修复支付金额校验和并发问题
description: |
  修复上一轮实现中的问题：
  1. 添加支付金额 > 0 校验
  2. 添加并发锁防止重复扣款
  
retry_context:
  retry_count: 1
  max_retry: 2
  previous_failure_reason: TEST-001, TEST-002
  required_fixes:
    - 支付金额校验
    - 并发控制
  non_goals:
    - 不添加新功能
    - 不修改其他模块
```

### Risk
- **风险**: 返工可能引入新问题
- **潜在问题**: 修复一个 bug 可能引入另一个 bug

### Expected Handling
1. **developer 接收返工任务**:
   - 读取 retry_context
   - 理解 required_fixes
   - 明确 non_goals（范围限制）

2. **定位问题**:
   - 查看上一轮失败原因：TEST-001, TEST-002
   - 查看上一轮代码

3. **修复问题**:
   - 添加金额校验：
     ```typescript
     if (amount <= 0) throw new InvalidAmountException();
     ```
   - 添加分布式锁：
     ```typescript
     await lock.acquire(`payment:${userId}`);
     ```

4. **增强自检**:
   - 除标准自检外，额外检查：
     - 边界值测试（amount = 0, -1, 1）
     - 并发测试（模拟同时支付）

5. **输出 Execution Result (返工成功)**:
   ```yaml
   status: SUCCESS
   dispatch_id: dsp-dev-001-retry-1
   summary: |
     完成支付功能修复：
     1. 添加了支付金额校验（必须 > 0）
     2. 添加了分布式锁防止并发问题
     3. 补充了边界值测试和并发测试
   
   changed_files:
     - path: src/services/PaymentService.ts
       change_type: modified
       diff_summary: 添加金额校验和分布式锁
     - path: src/services/PaymentService.test.ts
       change_type: modified
       diff_summary: 添加边界值和并发测试
   
   checks_performed:
     - 实现目标对齐检查
     - 改动范围检查（只修改 PaymentService）
     - 边界值测试（amount = 0, -1, 1）
     - 并发测试（模拟 10 个并发请求）
     - 上一轮失败点回归检查
   
   issues_found: []  # 无问题
   recommendation: SEND_TO_TEST
   ```

6. **后续流程**:
   - 进入 tester 重新测试
   - 进入 reviewer 审查修复
   - 通过验收

### 成功标准
- required_fixes 全部修复
- 未超出 non_goals 范围
- 通过所有测试
- 未引入新问题

---

## Scenario 6: 跨角色 artifact 引用

### 描述
下游角色需要引用多个上游角色的 artifacts。

### Input
**Dispatch Payload (reviewer task):**
```yaml
dispatch_id: dsp-review-001
task_id: task-final-review
role: reviewer
command: review-task
title: 登录功能最终审查
goal: 综合审查登录功能的 spec、design、implementation、test

inputs:
  - artifact_id: spec-login-v1
    artifact_type: spec
    path: specs/login/spec.md
    summary: 产品规格
    
  - artifact_id: design-login-v1
    artifact_type: design_note
    path: artifacts/design/design-login-v1.md
    summary: 技术设计
    
  - artifact_id: impl-login-v1
    artifact_type: implementation_summary
    path: artifacts/impl/impl-login-v1.md
    summary: 实现总结
    
  - artifact_id: test-login-v1
    artifact_type: test_report
    path: artifacts/test/test-login-v1.md
    summary: 测试报告
```

### Risk
- **风险**: artifacts 之间可能存在不一致
- **潜在问题**: spec 要求 A，design 设计 B，implementation 实现 C

### Expected Handling
1. **reviewer 读取所有 artifacts**:
   - 对比 spec vs design：是否 design 满足 spec？
   - 对比 design vs implementation：是否实现符合设计？
   - 对比 test vs spec：是否测试覆盖 acceptance criteria？

2. **一致性检查**:
   ```yaml
   checks_performed:
     - spec vs design consistency
     - design vs implementation consistency
     - test coverage vs acceptance criteria
   ```

3. **输出 Execution Result**:
   ```yaml
   status: SUCCESS_WITH_WARNINGS
   summary: |
     完成综合审查：
     - spec、design、implementation、test 整体一致
     - 实现符合设计要求
     - 测试覆盖 acceptance criteria
     
     **注意**：design 中定义的 rate limiting 未在 implementation 中实现，
     建议作为后续优化。
   
   issues_found:
     - issue_id: REV-003
       severity: medium
       description: rate limiting 未实现（design 中有，implementation 中无）
       recommendation: 可延期至下一阶段
   
   recommendation: CONTINUE_WITH_WARNINGS
   ```

### 成功标准
- 审查所有 artifacts
- 识别不一致问题
- 给出明确的 approve/warn/reject 决策

---

## Edge Cases 总结

| 场景 | 关键特征 | 处理方式 |
|------|---------|---------|
| 小功能跳过 architect | 范围小、无架构变更 | 直接分派 developer |
| 低风险跳过 security | 纯 UI、无敏感逻辑 | 标准流程，reviewer 兜底 |
| 依赖缺失继续 | 基于假设推进 | PARTIAL 状态，显式记录假设 |
| 并行任务 | 多任务无依赖 | 并行分派，结果合并时检查冲突 |
| 返工后继续 | retry_count < max | 携带失败上下文，范围受限 |
| 跨角色引用 | 消费多个 artifacts | 一致性检查 |