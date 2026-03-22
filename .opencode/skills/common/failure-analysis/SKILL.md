# Skill: failure-analysis

## Purpose

从 test fail、review reject、verification fail、logs 中提炼根因，区分可重试、需返工、需重规划、需升级，是返工闭环质量的核心保障。

解决的核心问题：
- 返工质量高度依赖失败分析质量
- 需要结构化输出：reason_type、failed_checks、required_fixes、recommendation
- 与返工机制强绑定，决定下一步动作

## When to Use

必须使用时：
- test 失败后，决定如何修复
- review reject 后，分析根本原因
- verification fail 后，分类失败类型
- 连续返工后，判断是否需要升级或重规划

推荐使用时：
- milestone 完成后做失败模式分析
- 生成失败知识库供后续 task 参考
- 评估当前项目健康度

## When Not to Use

不适用场景：
- 成功通过的 task（无需分析）
- 失败信息过于模糊无法分析（应直接升级）
- 需要立即应急修复而非分析（先止血后分析）
- 涉及安全事件（按安全流程处理）

## Required Inputs

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `failure_logs` | string[] | 是 | 失败日志、错误信息 |
| `task_context` | object | 是 | 相关 task 的上下文 |
| `previous_attempts` | object[] | 是 | 之前的尝试记录（返工次数） |

## Optional Inputs

| 字段 | 类型 | 说明 |
|------|------|------|
| `failure_type_hint` | string | 失败类型提示：test/review/verification/build |
| `severity_threshold` | string | 严重级别阈值：low/medium/high/critical |
| `max_retry_count` | number | 最大返工次数限制 |

## Failure Type Classification

### 类型 1: TEST_FAILURE
**特征：**
- 单元测试/集成测试失败
- 断言错误
- 覆盖率不足

**子类型：**
| 子类型 | 识别特征 | 建议动作 |
|--------|----------|----------|
| ASSERTION_FAIL | 断言不匹配 | 修复实现逻辑 |
| EXCEPTION_THROW | 代码抛出异常 | 修复异常处理 |
| TIMEOUT | 测试超时 | 优化性能或增加超时 |
| COVERAGE_GAP | 覆盖率未达标 | 补充测试用例 |
| FLAKY_TEST | 不稳定测试 | 修复测试本身 |

### 类型 2: REVIEW_REJECTION
**特征：**
- reviewer 给出 reject/warning
- 代码审查不通过
- spec 与实现不一致

**子类型：**
| 子类型 | 识别特征 | 建议动作 |
|--------|----------|----------|
| SPEC_MISMATCH | 实现不符合 spec | 修改实现或申请 spec 变更 |
| DESIGN_DEVIATION | 偏离 design note | 修改实现或申请 design 变更 |
| CODE_QUALITY | 代码质量问题 | 重构代码 |
| MISSING_TESTS | 缺少测试 | 补充测试 |
| SECURITY_ISSUE | 安全问题 | 立即修复 |

### 类型 3: VERIFICATION_FAILURE
**特征：**
- 构建失败
- lint/format 检查失败
- 类型检查失败

**子类型：**
| 子类型 | 识别特征 | 建议动作 |
|--------|----------|----------|
| BUILD_ERROR | 编译/构建失败 | 修复代码或配置 |
| LINT_ERROR | 代码风格检查失败 | 格式化或修复 |
| TYPE_ERROR | 类型检查失败 | 修复类型定义 |
| DEPENDENCY_ERROR | 依赖问题 | 修复依赖配置 |

### 类型 4: ENVIRONMENT_ISSUE
**特征：**
- 环境问题导致失败
- 非代码问题
- 偶发/不可复现

**子类型：**
| 子类型 | 识别特征 | 建议动作 |
|--------|----------|----------|
| NETWORK_ERROR | 网络问题 | 重试 |
| RESOURCE_LIMIT | 资源不足 | 扩容或优化 |
| EXTERNAL_SERVICE | 外部服务故障 | 等待或降级 |
| TOOLING_ERROR | 工具链问题 | 修复配置 |

### 类型 5: REQUIREMENT_ISSUE
**特征：**
- spec 本身有问题
- 需求不明确或矛盾
- 技术约束无法满足

**子类型：**
| 子类型 | 识别特征 | 建议动作 |
|--------|----------|----------|
| AMBIGUOUS_SPEC | spec 模糊 | 申请 spec 澄清 |
| CONFLICTING_REQUIREMENTS | 需求冲突 | 申请优先级裁决 |
| TECHNICALLY_INFEASIBLE | 技术不可行 | 申请方案变更 |
| SCOPE_CREEP | 范围蔓延 | 申请范围确认 |

## Steps

### Step 1: 收集失败信息
1. 整理所有 failure_logs
2. 识别失败发生阶段：build/test/review/verify
3. 标记时间戳和顺序

### Step 2: 识别失败模式
1. 匹配已知失败类型分类
2. 提取关键错误信息（错误码、堆栈、断言）
3. 识别是否为重复失败（与 previous_attempts 对比）

### Step 3: 分析根因
1. 追问 5 Whys 找到根本原因
2. 区分症状和根因
3. 识别是否为系统性问题

### Step 4: 评估修复可行性
1. 判断是否在 task 范围内可修复
2. 评估修复成本
3. 识别是否有依赖阻塞

### Step 5: 确定下一步动作
根据分析结果输出 recommendation：

| 条件 | recommendation |
|------|----------------|
| 单次失败，根因明确，范围内可修复 | REWORK |
| 环境问题，可重试 | RETRY |
| spec/设计问题，需要重新规划 | REPLAN |
| 返工次数超限或无法自行解决 | ESCALATE |
| 多次同类失败，可能存在系统性问题 | ESCALATE |

### Step 6: 生成结构化报告
输出 failure analysis report

## Checklists

### 前置检查
- [ ] failure_logs 非空且可读
- [ ] task_context 包含 goal 和 constraints
- [ ] previous_attempts 已加载

### 过程检查
- [ ] 已识别失败类型
- [ ] 已找到根因（非表面症状）
- [ ] 已评估修复可行性

### 后置检查
- [ ] recommendation 明确
- [ ] required_fixes 具体可执行
- [ ] 如为 REWORK，有明确的修复指导

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 信息不足 | 日志模糊，无法定位 | 标记 NEED_MORE_INFO，建议补充日志 |
| 多重失败 | 多个并发问题 | 按优先级排序，先解决阻塞性问题 |
| 循环失败 | 相同原因多次返工 | 检查 previous_attempts，可能需升级 |
| 误判类型 | 将环境问题误判为代码问题 | 仔细分析日志上下文 |
| 忽略系统性问题 | 局部修复但结构问题未解决 | 评估是否需要重规划 |

## Output Requirements

### 必须输出

```yaml
failure_analysis:
  dispatch_id: string
  task_id: string
  
  failure_summary:
    failure_type: TEST_FAILURE | REVIEW_REJECTION | VERIFICATION_FAILURE | ENVIRONMENT_ISSUE | REQUIREMENT_ISSUE
    failure_subtype: string
    severity: low | medium | high | critical
    description: string
    
  root_cause:
    primary_cause: string
    contributing_factors: string[]
    is_systematic: boolean
    
  impact_assessment:
    scope_impact: string
    other_modules_affected: string[]
    user_impact: string | null
    
  fix_requirements:
    required_fixes: 
      - description: string
        priority: P0 | P1 | P2
        estimated_effort: string
    
    non_goals:
      - "不应改动 X"
      - "不应引入 Y"
      
  retry_assessment:
    retry_count: number
    max_retry: number
    can_retry: boolean
    retry_advice: string | null
    
  recommendation:
    action: REWORK | RETRY | REPLAN | ESCALATE
    reason: string
    
    next_steps:
      - "具体动作 1"
      - "具体动作 2"
      
    escalation_reason: string | null
    
  status: COMPLETE | NEED_MORE_INFO | BLOCKED
```

### 可选输出

```yaml
lessons_learned:
  - "本次失败的模式和避免方法"
  
prevention_suggestions:
  - "如何在未来避免类似失败"
  
related_failures:
  - task_id: string
    similarity: number
    pattern: string
```

## Examples

### 示例 1：Test Failure - Assertion Fail

输入：
```yaml
failure_logs:
  - "FAIL: test_login_invalid_credentials"
  - "AssertionError: expected 4001, got 4000"
  - "File: tests/test_auth.py:45"
  
task_context:
  goal: "实现登录接口错误码映射"
  
previous_attempts: []
```

输出：
```yaml
failure_analysis:
  failure_summary:
    failure_type: TEST_FAILURE
    failure_subtype: ASSERTION_FAIL
    severity: medium
    description: "错误码映射不正确，期望 4001 实际返回 4000"
    
  root_cause:
    primary_cause: "错误码常量定义与测试期望不匹配"
    contributing_factors: []
    is_systematic: false
    
  fix_requirements:
    required_fixes:
      - description: "将 INVALID_CREDENTIALS 错误码从 4000 改为 4001"
        priority: P0
        estimated_effort: "5分钟"
        
  retry_assessment:
    retry_count: 0
    max_retry: 2
    can_retry: true
    
  recommendation:
    action: REWORK
    reason: "简单错误码修正，范围内可解决"
    next_steps:
      - "修改 src/errors/codes.py 中 INVALID_CREDENTIALS 值为 4001"
      - "重新运行测试验证"
```

### 示例 2：Review Rejection - Spec Mismatch

输入：
```yaml
failure_logs:
  - "REVIEW: overall_decision = REJECT"
  - "must_fix: 缺少 lockout 状态错误码映射"
  - "must_fix: error_code 命名与规范不一致"
  
task_context:
  goal: "实现登录接口错误码映射"
  
previous_attempts:
  - attempt: 1
    result: FAILED
    reason: "缺少错误码映射"
```

输出：
```yaml
failure_analysis:
  failure_summary:
    failure_type: REVIEW_REJECTION
    failure_subtype: SPEC_MISMATCH
    severity: medium
    description: "实现缺少 lockout 分支，且命名不符合规范"
    
  root_cause:
    primary_cause: "实现时遗漏了 spec 中的 USER_LOCKED 场景"
    contributing_factors:
      - "未完整阅读 spec 的边界条件部分"
    is_systematic: false
    
  fix_requirements:
    required_fixes:
      - description: "添加 lockout 状态检查和 USER_LOCKED 错误码返回"
        priority: P0
        estimated_effort: "30分钟"
      - description: "将 error_code 改为 errorCode 以符合命名规范"
        priority: P0
        estimated_effort: "10分钟"
        
  retry_assessment:
    retry_count: 1
    max_retry: 2
    can_retry: true
    retry_advice: "剩余 1 次返工机会"
    
  recommendation:
    action: REWORK
    reason: "问题明确，范围内可修复，但需仔细核对 spec 完整要求"
    next_steps:
      - "阅读 spec 中关于 lockout 的完整描述"
      - "添加 lockout 检测逻辑"
      - "统一错误码字段命名为 errorCode"
```

### 示例 3：Requirement Issue - 需升级

输入：
```yaml
failure_logs:
  - "REVIEW: overall_decision = REJECT"
  - "must_fix: 当前设计与数据库 schema 冲突"
  - "design_note 建议的方案不可行"
  
task_context:
  goal: "实现用户角色权限系统"
  constraints:
    - "不能修改数据库 schema"
    
previous_attempts:
  - attempt: 1
    result: FAILED
    reason: "设计与 schema 冲突"
  - attempt: 2
    result: FAILED
    reason: "备选方案与约束冲突"
```

输出：
```yaml
failure_analysis:
  failure_summary:
    failure_type: REQUIREMENT_ISSUE
    failure_subtype: TECHNICALLY_INFEASIBLE
    severity: high
    description: "在现有约束下（不改 schema）无法实现需求"
    
  root_cause:
    primary_cause: "spec 制定的约束与需求目标存在根本性冲突"
    contributing_factors:
      - "schema 设计时未考虑权限系统需求"
      - "architect 设计时未验证 schema 约束"
    is_systematic: true
    
  fix_requirements:
    required_fixes: []
    
    non_goals:
      - "不应绕过 schema 约束硬实现"
      - "不应自行放宽约束条件"
      
  retry_assessment:
    retry_count: 2
    max_retry: 2
    can_retry: false
    retry_advice: "返工次数已用尽"
    
  recommendation:
    action: ESCALATE
    reason: "约束与需求冲突，需用户决策是否放宽约束"
    next_steps:
      - "向用户说明：现有 schema 不支持权限系统需求"
      - "提供选项：A) 修改 schema B) 降级需求 C) 延迟实现"
    escalation_reason: "技术约束冲突，需业务方决策 trade-off"
```

## Notes

### 与 retry-strategy 的关系
- failure-analysis 负责"分析失败"和"确定动作类型"
- retry-strategy 负责"如何执行返工"（如重试间隔、回退策略）
- 典型流程：failure-analysis -> (REWORK) -> retry-strategy -> 执行

### 与 artifact-reading 的关系
- 需要读取 previous_attempts、review reports 等工件
- 失败分析依赖于准确的工件读取

### 知识沉淀
建议将 failure analysis 结果保存到知识库，用于：
- 识别重复失败模式
- 优化 failure-analysis skill 本身
- 培训新加入的 agent
