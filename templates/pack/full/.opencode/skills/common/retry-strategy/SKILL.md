# Skill: retry-strategy

## Purpose

根据失败类型选择最小修复路径，避免粗暴重复尝试，提高返工效率和收敛速度。

解决的核心问题：
- 盲目重试浪费资源
- 不同失败需要不同修复策略
- 返工次数有限，需要最大化每次尝试的价值
- 与 failure-analysis 配合，实现智能返工

## When to Use

必须使用时：
- failure-analysis 推荐 REWORK 或 RETRY 时
- 需要决定如何执行返工时
- 连续失败需要调整策略时

推荐使用时：
- 规划 milestone 的返工预算时
- 评估 task 风险时
- 生成返工建议时

## When Not to Use

不适用场景：
- failure-analysis 推荐 REPLAN 或 ESCALATE 时（不需要返工策略）
- 首次执行 task（非返工场景）
- 环境问题导致的偶发失败（直接重试即可）

## Required Inputs

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `failure_analysis` | object | 是 | failure-analysis 的输出 |
| `retry_count` | number | 是 | 已返工次数 |
| `max_retry` | number | 是 | 最大返工次数限制 |

## Optional Inputs

| 字段 | 类型 | 说明 |
|------|------|------|
| `previous_attempts` | object[] | 之前尝试的详细信息 |
| `time_budget_minutes` | number | 时间预算（分钟） |
| `escalation_threshold` | number | 触发升级的重试次数 |

## Retry Strategy Matrix

### 按失败类型的策略

| 失败类型 | 推荐策略 | 说明 |
|----------|----------|------|
| ASSERTION_FAIL | 针对性修复 | 精确定位断言失败原因，修复后重试 |
| EXCEPTION_THROW | 根因修复 + 防御编程 | 修复异常根因，添加异常处理 |
| TIMEOUT | 优化 + 增加超时阈值 | 性能优化或调整超时配置 |
| COVERAGE_GAP | 补充测试 | 增加测试用例覆盖 |
| FLAKY_TEST | 稳定化测试 | 修复测试本身的不稳定性 |
| SPEC_MISMATCH | 对齐 spec 或申请变更 | 修改实现或申请 spec 调整 |
| CODE_QUALITY | 重构 | 按 review 建议重构代码 |
| BUILD_ERROR | 修复构建问题 | 修复代码或配置问题 |
| LINT_ERROR | 格式化/修复 | 运行 linter 自动修复或手动修复 |
| NETWORK_ERROR | 立即重试 | 网络问题直接重试 |
| RESOURCE_LIMIT | 扩容/优化 | 增加资源或优化资源使用 |

### 按重试次数的策略

| 重试次数 | 策略调整 | 说明 |
|----------|----------|------|
| 第 1 次 | 标准修复 | 按 failure-analysis 建议修复 |
| 第 2 次 | 深度检查 | 增加额外检查点，扩大范围 |
| 第 3 次+ | 升级或重规划 | 考虑 REPLAN 或 ESCALATE |

## Steps

### Step 1: 分析失败上下文
1. 读取 failure_analysis 结果
2. 识别 failure_type 和 failure_subtype
3. 评估修复难度和范围

### Step 2: 选择基础策略
根据失败类型从 Strategy Matrix 选择基础策略。

### Step 3: 调整策略参数
根据 retry_count 调整：
- 第 1 次：按标准流程修复
- 第 2 次：增加额外检查，扩大测试范围
- 第 3 次+：考虑是否继续值得，或建议升级

### Step 4: 制定修复计划
生成具体的修复步骤：
1. 列出 required_fixes
2. 确定修复顺序
3. 设置检查点

### Step 5: 生成 Retry Context
为下一轮执行生成上下文：
- 保留原始 task context
- 添加失败原因
- 添加上轮输出摘要
- 列出本次必须修复项

### Step 6: 验证策略可行性
检查：
- 修复是否在 task 范围内
- 时间预算是否足够
- 是否需要额外资源

## Checklists

### 前置检查
- [ ] failure_analysis 已生成
- [ ] retry_count 和 max_retry 已明确
- [ ] 原始 task context 可访问

### 过程检查
- [ ] 已选择合适的基础策略
- [ ] 已根据 retry_count 调整策略
- [ ] 修复计划在 task 范围内

### 后置检查
- [ ] retry_context 已生成
- [ ] 策略可执行
- [ ] 有明确的检查点

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 策略选择错误 | 用错误方式修复 | 重新分析 failure_type |
| 范围失控 | 修复超出 task 范围 | 标记为 REPLAN |
| 时间不足 | 修复需要时间 > 预算 | 建议拆分为多个 task |
| 重复相同错误 | 多次犯同样问题 | 增加预防措施 |
| 策略无效 | 按策略修复后仍失败 | 调整策略或升级 |

## Output Requirements

### 必须输出

```yaml
retry_strategy:
  dispatch_id: string
  task_id: string
  retry_count: number
  max_retry: number
  
  strategy_type: string
    # DIRECT_FIX      - 直接修复问题
    # EXPANDED_FIX    - 扩大范围修复
    # ALTERNATIVE     - 尝试替代方案
    # DECOMPOSE       - 拆分为子任务
    # ESCALATE        - 建议升级
  
  failure_type: string
  selected_approach: string
  
  fix_plan:
    steps:
      - order: number
        description: string
        estimated_time: string
        verification_method: string
        
    checkpoints:
      - "检查点 1：XX 验证通过"
      - "检查点 2：YY 验证通过"
      
    rollback_plan: string
      # 如修复失败如何回退
  
  retry_context:
    original_goal: string
    failure_reason: string
    previous_output_summary: string
    required_fixes: string[]
    lessons_learned: string[]
    
  risk_assessment:
    success_probability: number  # 0-1
    main_risks: string[]
    mitigation: string[]
    
  recommendation:
    action: PROCEED_WITH_RETRY | ADJUST_STRATEGY | ESCALATE
    reason: string
    
  time_estimate:
    estimated_minutes: number
    time_budget: number
    within_budget: boolean
```

### 可选输出

```yaml
alternative_strategies:
  - strategy: string
    pros: string[]
    cons: string[]
    why_not_selected: string
    
prevention_suggestions:
  - "如何在未来避免此类失败"
```

## Examples

### 示例 1：首次返工 - 简单修复

输入：
```yaml
failure_analysis:
  failure_type: TEST_FAILURE
  failure_subtype: ASSERTION_FAIL
  required_fixes:
    - "将错误码从 4000 改为 4001"
    
retry_count: 0
max_retry: 2
```

输出：
```yaml
retry_strategy:
  strategy_type: DIRECT_FIX
  failure_type: ASSERTION_FAIL
  selected_approach: "精确定位并修复错误码常量"
  
  fix_plan:
    steps:
      - order: 1
        description: "修改 src/errors/codes.py 中 INVALID_CREDENTIALS 值为 4001"
        estimated_time: "5分钟"
        verification_method: "查看修改后的常量定义"
        
      - order: 2
        description: "重新运行测试验证"
        estimated_time: "2分钟"
        verification_method: "确认测试通过"
        
    checkpoints:
      - "错误码常量值已更新为 4001"
      - "测试 test_login_invalid_credentials 通过"
      
    rollback_plan: "恢复 constants.py 到修改前版本"
  
  retry_context:
    original_goal: "实现登录接口错误码映射"
    failure_reason: "错误码常量定义与测试期望不匹配"
    previous_output_summary: "基础实现完成，错误码值不正确"
    required_fixes:
      - "将错误码从 4000 改为 4001"
    lessons_learned:
      - "错误码定义应与测试用例对齐"
      
  risk_assessment:
    success_probability: 0.95
    main_risks: []
    mitigation: []
    
  recommendation:
    action: PROCEED_WITH_RETRY
    reason: "简单常量修改，成功概率高"
    
  time_estimate:
    estimated_minutes: 7
    time_budget: 60
    within_budget: true
```

### 示例 2：第二次返工 - 扩大范围

输入：
```yaml
failure_analysis:
  failure_type: REVIEW_REJECTION
  failure_subtype: SPEC_MISMATCH
  required_fixes:
    - "添加 lockout 状态处理"
    - "统一命名规范"
    
retry_count: 1
max_retry: 2
```

输出：
```yaml
retry_strategy:
  strategy_type: EXPANDED_FIX
  failure_type: SPEC_MISMATCH
  selected_approach: "仔细阅读 spec 完整要求，系统性修复遗漏"
  
  fix_plan:
    steps:
      - order: 1
        description: "重新阅读 spec 中关于 lockout 的完整描述"
        estimated_time: "10分钟"
        verification_method: "记录所有 lockout 相关 requirements"
        
      - order: 2
        description: "添加 lockout 检测逻辑"
        estimated_time: "20分钟"
        verification_method: "代码审查 lockout 分支"
        
      - order: 3
        description: "统一错误码字段命名为 errorCode"
        estimated_time: "10分钟"
        verification_method: "全局搜索确保一致性"
        
      - order: 4
        description: "完整测试所有场景"
        estimated_time: "10分钟"
        verification_method: "包含 lockout 场景的测试通过"
        
    checkpoints:
      - "已完整理解 spec 要求"
      - "lockout 检测逻辑已实现"
      - "命名规范已统一"
      - "所有测试通过"
      
    rollback_plan: "回退到上一轮 commit，重新整体实现"
  
  retry_context:
    original_goal: "实现登录接口错误码映射"
    failure_reason: "遗漏了 spec 中的 lockout 场景，命名不规范"
    previous_output_summary: "基础错误码映射完成，遗漏边界场景"
    required_fixes:
      - "添加 lockout 检测和 USER_LOCKED 错误码"
      - "将 error_code 改为 errorCode"
    lessons_learned:
      - "实现前需完整阅读 spec 边界条件"
      - "应遵循既定命名规范"
      
  risk_assessment:
    success_probability: 0.80
    main_risks:
      - "可能还有其他遗漏的边界场景"
    mitigation:
      - "对照 acceptance criteria 逐项检查"
      
  recommendation:
    action: PROCEED_WITH_RETRY
    reason: "剩余 1 次机会，需仔细检查"
    
  time_estimate:
    estimated_minutes: 50
    time_budget: 60
    within_budget: true
```

### 示例 3：建议升级

输入：
```yaml
failure_analysis:
  failure_type: REQUIREMENT_ISSUE
  failure_subtype: TECHNICALLY_INFEASIBLE
  required_fixes: []
  
retry_count: 2
max_retry: 2
```

输出：
```yaml
retry_strategy:
  strategy_type: ESCALATE
  failure_type: REQUIREMENT_ISSUE
  selected_approach: "返工次数已用尽，建议升级"
  
  fix_plan:
    steps: []
    
  retry_context:
    original_goal: "实现用户角色权限系统"
    failure_reason: "约束与需求冲突"
    previous_output_summary: "两次尝试均因 schema 约束失败"
    required_fixes: []
    lessons_learned:
      - "spec 制定时需验证技术可行性"
      - "schema 设计需考虑未来需求"
      
  risk_assessment:
    success_probability: 0.10
    main_risks:
      - "继续尝试可能浪费时间"
    mitigation:
      - "升级给用户决策"
      
  recommendation:
    action: ESCALATE
    reason: "返工次数已用尽，约束冲突无法自行解决"
    
  time_estimate:
    estimated_minutes: 0
    within_budget: false
```

## Notes

### 与 failure-analysis 的关系
- failure-analysis 回答"失败原因和类型"
- retry-strategy 回答"如何修复"
- 两者配合使用：failure-analysis -> retry-strategy -> 执行

### 与 execution-reporting 的关系
- retry-strategy 生成 retry_context
- execution-reporting 在返工输出中包含 retry_context
- 形成完整的返工追溯链

### 策略选择原则
1. **最小范围原则**：优先选择影响范围最小的修复
2. **快速验证原则**：每次修复后能快速验证
3. **可回退原则**：保留回退方案
4. **收敛原则**：每次返工应比上次更接近成功

### 返工次数建议
- 普通 task：最多 2 次返工
- 复杂 task：最多 3 次返工
- 高风险 task：最多 1 次返工，失败即升级
