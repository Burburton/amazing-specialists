# Failure Cases

本文件描述 OpenCode 专家包在失败场景下的处理方式和升级机制。

---

## Failure Scenario 1: Reviewer Reject（审查不通过）

### 场景描述
developer 实现的功能不符合 spec，reviewer 发现 must-fix 问题，要求返工。

### Input
**Dispatch Payload (reviewer task):**
```yaml
dispatch_id: dsp-review-001
task_id: task-login-review
role: reviewer
command: review-task
title: 审查登录功能实现
goal: 判断登录功能实现是否符合 spec
description: 审查 developer 实现的登录功能代码

inputs:
  - artifact_id: impl-login-v1
    artifact_type: implementation_summary
    path: artifacts/impl/impl-login-v1.md
    
  - artifact_id: spec-login-v1
    artifact_type: spec
    path: specs/login/spec.md

expected_outputs:
  - review_report
  - approval decision
```

### Why It Fails
**developer 实现的问题：**
1. **spec 要求**：密码错误时返回 401 Unauthorized，并提示"密码错误"
2. **实际实现**：密码错误时返回 500 Internal Server Error，无提示
3. **spec 要求**：Token 包含 user_id, username, roles
4. **实际实现**：Token 只包含 user_id

**失败原因**：developer 未完全理解 spec，遗漏了错误处理和 Token 字段。

### Expected Handling

#### 1. Reviewer 发现问题
**reviewer 执行审查：**
```yaml
# reviewer 对比 spec vs implementation
checks_performed:
  - spec vs implementation consistency
  - error handling path review
  - Token payload review

# 发现的问题
issues_found:
  - issue_id: REV-MUST-001
    severity: high
    description: 密码错误返回 500 而不是 401，不符合 spec
    recommendation: 修改错误处理，返回 401 并添加"密码错误"提示
    
  - issue_id: REV-MUST-002
    severity: high
    description: Token 缺少 username 和 roles 字段
    recommendation: 补充 Token payload
    
  - issue_id: REV-SUG-001
    severity: low
    description: 建议添加登录日志
    recommendation: 可后续优化
```

#### 2. Reviewer 输出 Reject
**Execution Result:**
```yaml
dispatch_id: dsp-review-001
task_id: task-login-review
role: reviewer
status: FAILED_RETRYABLE

summary: |
  登录功能审查不通过：
  - 发现 2 个 must-fix 问题（错误处理和 Token 字段）
  - 发现 1 个建议项
  
artifacts:
  - artifact_id: review-login-v1
    artifact_type: review_report
    path: artifacts/review/review-login-v1.md

issues_found:
  - issue_id: REV-MUST-001
    severity: high
    description: 密码错误返回 500 而不是 401
    recommendation: 修改错误处理
    
  - issue_id: REV-MUST-002
    severity: high
    description: Token 缺少 username 和 roles
    recommendation: 补充 Token payload

recommendation: REWORK
needs_followup: true
followup_suggestions:
  - 返回 developer 修复 must-fix 问题
  - 重新走 tester -> reviewer 流程
```

#### 3. OpenClaw 生成 ReworkRequest
```yaml
rework_id: rwk-001
project_id: proj-auth-system
milestone_id: ms-login-feature
task_id: task-login-impl
scope: task_only

reason_type: REVIEW_REJECTION
reason_summary: reviewer 发现 2 个 must-fix 问题

failed_checks:
  - check_name: error_handling_consistency
    expected: 401 + "密码错误"提示
    actual: 500 + 无提示
    severity: high
    
  - check_name: token_payload_completeness
    expected: user_id, username, roles
    actual: user_id only
    severity: high

related_artifacts:
  - artifact_id: review-login-v1
    artifact_type: review_report
  - artifact_id: spec-login-v1
    artifact_type: spec

retry_count: 1
max_retry: 2
target_role: developer

required_fixes:
  - fix_id: FIX-001
    description: 修复密码错误处理，返回 401 和正确提示
    priority: must_fix
    verification_method: 单元测试验证错误码和提示
    
  - fix_id: FIX-002
    description: Token payload 添加 username 和 roles
    priority: must_fix
    verification_method: 单元测试验证 Token 字段

non_goals:
  - 不添加新功能
  - 不修改其他模块
  - 不修改 API 接口定义
```

#### 4. Developer 返工
**重新分派 developer:**
```yaml
dispatch_id: dsp-dev-001-retry-1
task_id: task-login-impl
role: developer
command: fix-task

retry_context:
  retry_count: 1
  previous_failure_reason: REVIEW_REJECTION
  required_fixes: [FIX-001, FIX-002]
  non_goals: ["不添加新功能", "不修改其他模块"]
```

**developer 修复：**
- 修改错误处理逻辑
- 补充 Token 字段
- 重新运行测试

#### 5. 重新验收
- 重新走 tester -> reviewer 流程
- reviewer 输出 approve
- 继续 downstream 流程

### Required Output
- **review_report**: 包含 must-fix 问题和建议
- **rework_request**: 包含 failed_checks 和 required_fixes
- **re-execution**: developer 返工后重新输出 implementation

### Escalation
**如返工超过 max_retry:**
- retry_count = 2（超过 max_retry = 2）
- 生成 Escalation
- 升级给用户决策：是否继续尝试或调整需求

---

## Failure Scenario 2: Test Failure（测试失败）

### 场景描述
tester 执行测试发现严重 bug，需要 developer 修复。

### Input
**Dispatch Payload (tester task):**
```yaml
dispatch_id: dsp-test-001
task_id: task-payment-test
role: tester
title: 测试支付功能
goal: 验证支付功能正确性和边界处理

inputs:
  - artifact_id: impl-payment-v1
    artifact_type: implementation_summary
    
  - artifact_id: spec-payment-v1
    artifact_type: spec
```

### Why It Fails
**测试发现的问题：**
1. **并发问题**：同时发起两个支付请求，用户余额被扣两次
2. **边界问题**：支付金额 = 余额时，支付成功后余额未归零
3. **异常问题**：数据库连接断开时，支付状态不一致（钱扣了但订单未创建）

### Expected Handling

#### 1. Tester 输出失败报告
```yaml
dispatch_id: dsp-test-001
task_id: task-payment-test
role: tester
status: FAILED_RETRYABLE

summary: |
  支付功能测试失败：
  - 单元测试：15/18 通过（3 个失败）
  - 集成测试：2/4 通过（2 个失败）
  - 并发测试：0/1 通过（1 个失败）

artifacts:
  - artifact_id: test-report-payment-v1
    artifact_type: test_report
    path: artifacts/test/test-report-payment-v1.md

issues_found:
  - issue_id: TEST-001
    severity: critical
    description: 并发支付导致重复扣款
    logs: "test_concurrent_payment.log"
    
  - issue_id: TEST-002
    severity: high
    description: 支付金额=余额时，余额未归零
    expected: balance = 0
    actual: balance = original
    
  - issue_id: TEST-003
    severity: high
    description: 数据库断开时状态不一致
    logs: "test_db_disconnect.log"

recommendation: REWORK
followup_suggestions:
  - 修复并发控制（添加分布式锁）
  - 修复边界条件处理
  - 添加事务管理
```

#### 2. 失败分类
**tester 对失败的分类：**
```yaml
failure_classification:
  - issue_id: TEST-001
    category: concurrency_bug  # 并发 bug
    retryable: true
    root_cause: 缺少并发控制
    
  - issue_id: TEST-002
    category: boundary_bug  # 边界 bug
    retryable: true
    root_cause: 边界条件判断错误
    
  - issue_id: TEST-003
    category: reliability_bug  # 可靠性 bug
    retryable: true
    root_cause: 缺少事务管理
```

#### 3. ReworkRequest
```yaml
rework_id: rwk-002
reason_type: TEST_FAILURE

failed_checks:
  - check_name: concurrent_payment_test
    expected: 单用户同时支付，只扣款一次
    actual: 扣款两次
    
  - check_name: boundary_balance_test
    expected: 支付后余额归零
    actual: 余额不变
    
  - check_name: transaction_integrity_test
    expected: 数据库断开时回滚
    actual: 状态不一致

required_fixes:
  - fix_id: FIX-003
    description: 添加分布式锁防止并发问题
    priority: must_fix
    
  - fix_id: FIX-004
    description: 修复边界条件（>= 改为 ==）
    priority: must_fix
    
  - fix_id: FIX-005
    description: 添加数据库事务管理
    priority: must_fix

retry_count: 1
max_retry: 2
```

### Required Output
- **test_report**: 包含失败详情和日志
- **failure_classification**: 区分 bug 类型
- **rework_request**: 指定必须修复的问题

### Escalation
**如问题超出 task 范围：**
- 如果发现是架构设计问题（需要重新设计支付流程）
- recommendation = REPLAN
- 生成 ReplanRequest

---

## Failure Scenario 3: Security Critical Issue（安全问题升级）

### 场景描述
security 检查发现 critical 安全问题，必须升级给用户决策。

### Input
**Dispatch Payload (security task):**
```yaml
dispatch_id: dsp-sec-001
task_id: task-auth-security
role: security
title: 登录功能安全检查
goal: 检查登录功能的安全性
risk_level: high  # 高风险任务
domain: auth
```

### Why It Fails
**发现的 security issues：**
1. **密码明文存储**：数据库中密码未加密，明文存储
2. **Token 泄露风险**：Token 包含密码哈希
3. **无速率限制**：登录接口无防暴力破解机制

### Expected Handling

#### 1. Security 输出 Critical Report
```yaml
dispatch_id: dsp-sec-001
task_id: task-auth-security
role: security
status: FAILED_ESCALATE  # 直接升级，不返工

summary: |
  登录功能安全检查发现 **critical** 级别问题：
  1. 密码明文存储（严重违规）
  2. Token 包含敏感信息
  3. 无防暴力破解机制

artifacts:
  - artifact_id: security-report-auth-v1
    artifact_type: security_report

issues_found:
  - issue_id: SEC-CRITICAL-001
    severity: critical
    description: 数据库 users 表 password 字段明文存储
    evidence: "SELECT password FROM users LIMIT 1"
    impact: 数据库泄露时所有密码暴露
    
  - issue_id: SEC-HIGH-001
    severity: high
    description: JWT Token payload 包含 password_hash
    impact: Token 泄露可能导致密码破解
    
  - issue_id: SEC-MEDIUM-001
    severity: medium
    description: 登录接口无速率限制
    impact: 可被暴力破解

gate_recommendation: BLOCK  # 阻断放行
recommendation: ESCALATE   # 必须升级
```

#### 2. OpenClaw 决策
**OpenClaw 评估：**
- 存在 critical security issue
- 修复可能影响数据（需要迁移所有用户密码）
- 需要用户决策：是否接受修复成本？

#### 3. 生成 Escalation
```yaml
escalation_id: esc-001
dispatch_id: dsp-sec-001
level: USER  # 升级给用户

reason_type: HIGH_RISK_CHANGE
reason_summary: 发现 critical 安全问题，需要用户决策是否修复

blocking_points:
  - 密码明文存储违反安全规范
  - 修复需要数据迁移（所有用户密码）
  - 修复成本可能超出预期

evidence:
  - security-report-auth-v1
  - db-schema-users-table
  - code-jwt-generation

options:
  - option_id: OPT-001
    description: 修复所有安全问题（推荐）
    pros:
      - 符合安全规范
      - 降低数据泄露风险
    cons:
      - 需要数据迁移
      - 额外 2-3 天工作量
      
  - option_id: OPT-002
    description: 仅修复 critical（密码加密），延期其他
    pros:
      - 解决最严重问题
      - 工作量较小
    cons:
      - 仍有部分安全风险
      
  - option_id: OPT-003
    description: 接受风险，记录技术债务
    pros:
      - 无额外工作量
    cons:
      - 高安全风险
      - 不推荐

recommended_option: OPT-001

required_decision: 选择安全修复方案

impact_if_continue: 密码明文存储可能导致数据泄露
impact_if_stop: milestone 延期，需要重新规划
```

#### 4. 用户决策
**用户选择 OPT-001（完全修复）：**
- OpenClaw 生成新的 tasks：
  - task-migrate-passwords（数据迁移）
  - task-fix-jwt-payload（修复 Token）
  - task-add-rate-limit（添加速率限制）

**用户选择 OPT-003（接受风险）：**
- OpenClaw 记录技术债务
- 要求用户签署风险接受确认
- milestone 继续，但标记高风险

### Required Output
- **security_report**: 详细安全问题清单
- **escalation**: 升级请求和选项
- **用户决策**: 选择修复方案

### 与 REWORK 的区别
| Security Escalation | REWORK |
|---------------------|--------|
| 涉及重大成本/架构变更 | 局部问题可修复 |
| 需要业务决策（成本 vs 安全） | 纯技术问题 |
| 可能改变 milestone 范围 | 不改变范围 |
| level = USER | 通常 retry |

---

## Failure Scenario 4: Constraint Conflict（约束冲突）

### 场景描述
task 的多个约束条件相互矛盾，无法同时满足。

### Input
**Dispatch Payload (architect task):**
```yaml
dispatch_id: dsp-arch-001
task_id: task-payment-arch
role: architect
title: 设计支付模块架构

constraints:
  - 必须使用现有 PaymentGateway v1（不支持异步）
  - 必须支持高并发（>1000 TPS）
  - 必须保证数据一致性
```

### Why It Fails
**冲突分析：**
- PaymentGateway v1 是同步阻塞 API，单线程处理
- 要实现 1000 TPS，需要异步处理 + 连接池
- 同步 API + 高并发 + 数据一致性三者无法同时满足

### Expected Handling

#### 1. Architect 识别冲突
```yaml
architect 分析：
- 约束 A：PaymentGateway v1（同步）
- 约束 B：高并发（需要异步）
- 冲突：同步 API 无法达到高并发要求

可能的解决方案：
1. 升级 PaymentGateway 到 v2（支持异步）
2. 降低并发要求（接受较低 TPS）
3. 引入消息队列异步处理（但数据一致性更难保证）
```

#### 2. Architect 输出 Escalation
```yaml
dispatch_id: dsp-arch-001
task_id: task-payment-arch
role: architect
status: FAILED_ESCALATE

summary: |
  支付模块架构设计无法完成：
  约束冲突：同步 PaymentGateway v1 无法满足高并发（1000 TPS）要求

blocking_points:
  - PaymentGateway v1 是同步阻塞 API
  - 单线程处理，实测最大 50 TPS
  - 要达到 1000 TPS，需要异步处理或升级网关

evidence:
  - PaymentGateway v1 文档
  - 性能测试报告（显示 50 TPS 上限）

options:
  - option_id: OPT-ARCH-001
    description: 升级 PaymentGateway 到 v2（推荐）
    pros:
      - 支持异步，可达 1000 TPS
      - 支持数据一致性保证
    cons:
      - 需要额外时间评估和升级
      - 可能引入兼容性问题
      
  - option_id: OPT-ARCH-002
    description: 降低并发要求到 50 TPS
    pros:
      - 无需额外工作
    cons:
      - 可能不满足业务需求
      
  - option_id: OPT-ARCH-003
    description: 使用消息队列异步处理
    pros:
      - 可支持高并发
    cons:
      - 数据一致性更难保证
      - 架构复杂度增加

recommended_option: OPT-ARCH-001

required_decision: 选择技术方案

escalation:
  level: USER
  reason_type: UNRESOLVED_TRADEOFF
```

#### 3. 用户决策
**用户选择 OPT-ARCH-001（升级网关）：**
- OpenClaw 生成新的 task：评估 PaymentGateway v2
- 可能触发 replan（milestone 范围变更）

**用户选择 OPT-ARCH-002（降低并发）：：**
- architect 基于新约束继续设计
- status 变为 SUCCESS

### Required Output
- **冲突报告**: 详细说明约束冲突
- **trade-off 分析**: 各选项的优缺点
- **用户决策**: 选择技术方案

### Escalation 理由
- architect 无法自行决策（涉及成本和业务影响）
- 需要用户权衡：成本 vs 性能 vs 时间

---

## Failure Scenario 5: Repeated Failure（多次返工失败）

### 场景描述
developer 连续两次返工仍未修复问题，需要升级。

### Input
**First Attempt (dispatch-dev-001):**
```yaml
task_id: task-concurrent-fix
role: developer
# 实现并发控制
```

**First Failure:**
```yaml
status: FAILED_RETRYABLE
issues_found:
  - 分布式锁实现有误，仍可能并发
retry_count: 1
recommendation: REWORK
```

**Second Attempt (dispatch-dev-001-retry-1):**
```yaml
task_id: task-concurrent-fix
role: developer
retry_context:
  retry_count: 1
  max_retry: 2
```

**Second Failure:**
```yaml
status: FAILED_RETRYABLE
issues_found:
  - 锁释放逻辑有问题，可能导致死锁
retry_count: 2
recommendation: REWORK
```

### Why It Fails
**连续失败原因：**
1. 第一次：锁粒度太粗，导致性能问题，且未处理超时
2. 第二次：锁释放逻辑错误，可能导致死锁

**根本原因**：developer 对分布式锁理解不足，问题比预期复杂。

### Expected Handling

#### 1. 检测 retry_count 超限
```python
if retry_count >= max_retry:
    recommendation = ESCALATE
    level = INTERNAL  # 先升级到管理层
```

#### 2. OpenClaw 决策
**管理层评估：**
- retry_count = 2（已达 max_retry = 2）
- 问题涉及并发控制，可能需要 architect 重新设计
- 或需要更资深的 developer

#### 3. 生成 Escalation (INTERNAL)
```yaml
escalation_id: esc-002
dispatch_id: dsp-dev-001-retry-2
level: INTERNAL  # 先内部升级

reason_type: REPEATED_FAILURE
reason_summary: developer 连续 2 次返工未修复并发控制问题

blocking_points:
  - 分布式锁实现复杂，超出 developer 当前能力
  - 可能涉及架构层重新设计
  - 继续返工可能仍无法收敛

evidence:
  - review-report-retry-1
  - review-report-retry-2
  - test-logs-concurrent

recommended_next_steps:
  - 转给 architect 重新设计并发方案
  - 或引入资深 developer 协助
  - 或简化需求（降低并发要求）

requires_user_decision: false  # 先内部处理
```

#### 4. 内部处理
**方案 A：转给 architect**
- OpenClaw 新增 task：architect 设计并发控制方案
- architect 输出详细设计后，再交给 developer 实现

**方案 B：简化需求**
- 降低并发要求（从 1000 TPS 降到 100 TPS）
- 使用更简单的同步方案

**方案 C：升级给用户**
- 如果内部无法解决，再升级给用户

### Required Output
- **escalation**: retry 超限通知
- **管理层决策**: 选择处理方案
- **新 task**: 可能是 architect 设计或需求变更

### 与首次失败的区别
| 首次失败 | 多次失败 |
|---------|---------|
| recommendation = REWORK | recommendation = ESCALATE |
| 同角色返工 | 可能换角色或换方案 |
| 局部修复 | 可能涉及架构/需求变更 |

---

## Failure Scenario 6: Ambiguous Goal（目标模糊）

### 场景描述
dispatch payload 中的 goal 描述不清晰，角色无法执行。

### Input
**Dispatch Payload (developer task):**
```yaml
dispatch_id: dsp-dev-002
task_id: task-improve-performance
role: developer
title: 优化性能
goal: 优化系统性能  # 模糊！
description: 让系统更快  # 模糊！
constraints:
  - 不改架构
```

### Why It Fails
**模糊点：**
1. **目标模糊**："优化性能"没有具体指标（QPS？延迟？吞吐量？）
2. **范围模糊**："系统"指整个系统还是某个模块？
3. **验收模糊**：优化到什么程度算完成？

### Expected Handling

#### 1. Developer 识别问题
```yaml
developer 执行检查：
- goal = "优化系统性能" -> 无法量化
- description = "让系统更快" -> 无法执行
- expected_outputs = [] -> 未指定

决策：无法继续，必须升级
```

#### 2. Developer 输出 Blocked
```yaml
dispatch_id: dsp-dev-002
task_id: task-improve-performance
role: developer
status: BLOCKED

summary: |
  无法执行任务：目标描述过于模糊
  
blocking_points:
  - goal "优化系统性能" 没有具体指标（QPS/延迟/吞吐量？）
  - "系统"范围不明确（是整个系统还是某个模块？）
  - expected_outputs 未指定（优化到什么程度算完成？）

missing_info:
  - 需要明确的性能指标（如"API 响应时间 < 200ms"）
  - 需要明确的范围（如"用户登录接口"）
  - 需要明确的验收标准（如"压测 1000 QPS"）

recommendation: ESCALATE
escalation:
  level: INTERNAL
  reason_type: MISSING_CONTEXT
```

#### 3. OpenClaw 处理
**管理层响应：**
- 退回 task 到 planning 阶段
- Milestone Planner 重新明确 task：
  ```yaml
  goal: 优化用户登录接口性能，使响应时间 < 200ms（P99）
  scope: 仅优化 /api/auth/login 接口
  expected_outputs:
    - 优化后的代码
    - 压测报告（1000 QPS）
  ```

#### 4. 重新分派
- OpenClaw 重新生成分明的 dispatch payload
- developer 可正常执行

### Required Output
- **blocked status**: 说明阻塞原因
- **missing_info**: 明确缺失的信息
- **建议**: 需要管理层重新规划

### Escalation 理由
- 目标模糊属于 planning 层问题
- 执行层无法自行解决
- 需要 OpenClaw 重新规划

---

## Failure Cases 总结

| 失败场景 | 失败类型 | 处理方式 | 升级路径 |
|---------|---------|---------|---------|
| Reviewer Reject | 实现不符合 spec | REWORK | 返工 developer |
| Test Failure | 功能 bug | REWORK | 返工 developer |
| Security Critical | 安全问题 | ESCALATE | USER（决策） |
| Constraint Conflict | 约束矛盾 | ESCALATE | USER（决策） |
| Repeated Failure | 多次返工失败 | ESCALATE | INTERNAL -> USER |
| Ambiguous Goal | 目标模糊 | BLOCKED -> ESCALATE | INTERNAL（重新规划） |

### 关键原则
1. **局部问题返工**：实现问题、测试失败 -> REWORK
2. **重大问题升级**：安全、架构、成本 -> ESCALATE
3. **模糊问题重规划**：目标不清 -> 回到 planning
4. **超限升级**：retry 超过阈值 -> ESCALATE