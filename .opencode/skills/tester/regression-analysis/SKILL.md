# Skill: regression-analysis

## Purpose

分析改动后哪些路径需要回归测试，哪些问题可能复发，确保变更不会破坏现有功能。

解决的核心问题：
- 不知道改动影响了哪些地方
- 回归测试覆盖不足
- 重复出现的 bug
- 变更影响范围不清晰

## Business Rules Compliance

### BR-001: Tester Must Consume Developer Evidence
This skill requires consuming developer artifacts:
- `implementation-summary.changed_files` - Build dependency graph from actual changes
- `implementation-summary.risks` - Understand developer-identified risks for regression focus
- `bugfix-report.root_cause` (if bugfix) - Design root-cause-aware regression checks

### BR-006: Regression Thinking Is Required
**Mandatory Requirement**: Tester must evaluate impact beyond the immediate changed code path.
- Passing targeted tests is NOT enough if adjacent surfaces remain unassessed
- Adjacent impact assessment is required for all code changes
- Risk ranking must consider indirect and potential impacts

### BR-004: Failure Classification
Regression analysis outputs must enable failure classification:
- If regression found: classify as implementation issue or test gap
- If historical issue recurring: classify as root cause misdiagnosis
- If new area affected: classify as impact underestimation

### BR-003: Coverage Boundaries
Every regression analysis must document:
- Tested regression surfaces
- Untested regression areas (explicitly disclosed)
- Rationale for exclusions

## Upstream Artifact References
- `specs/004-developer-core/contracts/implementation-summary-contract.md`
- `specs/004-developer-core/contracts/bugfix-report-contract.md`
- `specs/005-tester-core/upstream-consumption.md` Section 2.3 (bugfix-report consumption)

## Downstream Artifact References
- `specs/005-tester-core/contracts/regression-risk-report-contract.md` - This skill outputs feed into regression-risk-report
- `specs/005-tester-core/contracts/verification-report-contract.md` - Regression tests feed into verification-report.tests_added_or_run

## When to Use

必须使用时：
- 代码变更后需要评估回归风险
- bugfix 后需要验证未引入新问题
- 重构后需要验证功能完整性
- 需要确定回归测试范围

推荐使用时：
- 任何代码变更前评估影响
- 复杂变更后的全面回归
- 发布前的回归测试规划

## When Not to Use

不适用场景：
- 全新功能，无历史代码（无回归风险）
- 纯文档变更
- 配置变更不影响代码逻辑

## Regression Analysis Framework

### 1. 变更影响分析

#### 1.1 直接变更
- 修改的文件
- 修改的函数
- 修改的接口

#### 1.2 间接影响
- 调用被修改代码的代码
- 依赖被修改模块的模块
- 共享数据结构的使用方

#### 1.3 潜在影响
- 继承关系中的子类
- 接口的实现类
- 事件订阅者

### 2. 风险等级评估

| 等级 | 特征 | 回归策略 |
|------|------|----------|
| 高 | 核心功能、公共接口、基础模块 | 全量回归测试 |
| 中 | 重要功能、有限影响范围 | 重点路径回归 |
| 低 | 边缘功能、独立模块 | 冒烟测试 |

### 3. 回归测试策略

#### 3.1 冒烟测试 (Smoke Test)
- 验证系统能启动
- 验证核心流程通
- 快速发现严重问题

#### 3.2 重点回归 (Targeted Regression)
- 测试受影响的功能
- 测试相关模块
- 测试边界场景

#### 3.3 全量回归 (Full Regression)
- 测试所有功能
- 所有测试用例
- 适用于重大变更

## Steps

### Step 1: 收集变更信息
1. 读取 changed_files
2. 识别修改类型（新增/修改/删除）
3. 了解修改原因
4. 获取实现摘要

### Step 2: 构建依赖图
1. 识别被修改的模块
2. 识别调用方（谁调用了修改的代码）
3. 识别依赖方（谁依赖修改的模块）
4. 构建影响范围图

### Step 3: 评估影响范围
1. 评估直接影响的代码
2. 评估间接影响的代码
3. 评估潜在影响（继承、接口）
4. 评估数据/schema 影响

### Step 4: 确定风险等级
根据以下因素评估：
- 变更的模块重要性
- 影响范围大小
- 历史 bug 率
- 代码复杂度
- 测试覆盖率

### Step 5: 制定回归策略
1. 确定回归测试类型
2. 确定回归测试范围
3. 确定回归测试优先级
4. 分配回归测试资源

### Step 6: 识别历史问题
1. 查看历史 bugs
2. 识别易复发问题
3. 查看相关模块的 bug 率
4. 识别需要重点关注的场景

### Step 7: 生成回归计划
输出 regression analysis report

## Output Format

```yaml
regression_analysis:
  dispatch_id: string
  task_id: string
  
  change_summary:
    changed_files:
      - path: string
        change_type: added | modified | deleted
        description: string
    
    changed_modules:
      - name: string
        change_type: string
        
  impact_analysis:
    direct_impacts:
      - component: string
        impact_type: modified
        description: string
        
    indirect_impacts:
      - component: string
        impact_type: dependent
        reason: string
        via: string  # 通过什么路径影响
        
    potential_impacts:
      - component: string
        impact_type: potential
        reason: string
        
  risk_assessment:
    overall_risk: high | medium | low
    risk_factors:
      - factor: string
        level: high | medium | low
        description: string
        
    high_risk_areas:
      - area: string
        reason: string
        mitigation: string
        
  regression_strategy:
    strategy: smoke | targeted | full
    scope:
      - component: string
        priority: P0 | P1 | P2
        test_types: string[]
        
    test_cases:
      - id: string
        name: string
        priority: P0 | P1 | P2
        reason: string
        
  historical_issues:
    recurring_patterns:
      - pattern: string
        frequency: string
        prevention: string
        
    similar_changes:
      - change: string
        issues: string[]
        lesson: string
        
  data_migration:
    affected: boolean
    schema_changes: string[]
    data_changes: string[]
    rollback_plan: string
    
  performance_impact:
    expected_change: improved | degraded | neutral
    affected_operations: string[]
    benchmarks_to_run: string[]
    
  backward_compatibility:
    breaking_changes: string[]
    api_compatibility: boolean
    data_compatibility: boolean
    migration_required: boolean
    
  regression_plan:
    phases:
      - phase: number
        name: string
        tests: string[]
        estimated_time: string
        
    exit_criteria:
      - "所有 P0 测试通过"
      - "无 blocker 级别 bug"
      
  recommendation:
    proceed_with_caution: boolean
    additional_reviews: string[]
    special_monitoring: string[]
```

## Examples

### 示例 1：登录功能修改回归分析

```yaml
regression_analysis:
  change_summary:
    changed_files:
      - path: "src/services/AuthService.ts"
        change_type: modified
        description: "添加 lockout 检测逻辑"
      - path: "src/errors/codes.ts"
        change_type: modified
        description: "添加 USER_LOCKED 错误码"
        
    changed_modules:
      - name: AuthService
        change_type: modified
      - name: ErrorCodes
        change_type: modified
        
  impact_analysis:
    direct_impacts:
      - component: AuthService.validateUser
        impact_type: modified
        description: "新增 lockout 检测分支"
        
    indirect_impacts:
      - component: AuthController.login
        impact_type: dependent
        reason: "调用 validateUser"
        via: "AuthService.validateUser"
        
      - component: Login UI
        impact_type: dependent
        reason: "需要处理新错误码 USER_LOCKED"
        via: "API 响应变化"
        
    potential_impacts:
      - component: AdminUserService
        impact_type: potential
        reason: "可能继承或使用 AuthService"
        
  risk_assessment:
    overall_risk: medium
    risk_factors:
      - factor: "新增逻辑分支"
        level: medium
        description: "可能引入新的边界条件问题"
      - factor: "API 响应变化"
        level: medium
        description: "前端需要适配新错误码"
        
  regression_strategy:
    strategy: targeted
    scope:
      - component: AuthService
        priority: P0
        test_types: ["unit", "integration"]
      - component: Login Flow
        priority: P0
        test_types: ["integration", "e2e"]
      - component: Error Handling
        priority: P1
        test_types: ["unit"]
        
    test_cases:
      - id: TC-REG-001
        name: "正常登录不受影响"
        priority: P0
        reason: "核心功能必须保持"
      - id: TC-REG-002
        name: "lockout 场景正确处理"
        priority: P0
        reason: "新功能正确性"
      - id: TC-REG-003
        name: "边界：连续 4 次失败不 lockout"
        priority: P1
        reason: "边界条件"
      - id: TC-REG-004
        name: "边界：连续 5 次失败触发 lockout"
        priority: P0
        reason: "关键边界"
        
  historical_issues:
    recurring_patterns:
      - pattern: "错误处理分支遗漏"
        frequency: "常见"
        prevention: "检查所有错误路径"
        
    similar_changes:
      - change: "添加 rate limiting"
        issues: ["影响正常用户", "计数器不准确"]
        lesson: "需要充分的边界测试"
        
  backward_compatibility:
    breaking_changes:
      - "新增 USER_LOCKED 错误码"
    api_compatibility: true
    data_compatibility: true
    migration_required: false
    
  regression_plan:
    phases:
      - phase: 1
        name: "Service 层测试"
        tests: ["AuthService 单元测试"]
        estimated_time: "10分钟"
        
      - phase: 2
        name: "集成测试"
        tests: ["登录流程集成测试"]
        estimated_time: "15分钟"
        
      - phase: 3
        name: "E2E 测试"
        tests: ["用户登录场景"]
        estimated_time: "10分钟"
        
    exit_criteria:
      - "所有 P0 测试通过"
      - "登录成功率 > 99%"
      
  recommendation:
    proceed_with_caution: true
    additional_reviews:
      - "security review"
    special_monitoring:
      - "登录失败率监控"
      - "lockout 触发率监控"
```

### 示例 2：简单修改低风险

```yaml
regression_analysis:
  change_summary:
    changed_files:
      - path: "src/utils/formatDate.ts"
        change_type: modified
        description: "优化日期格式函数"
        
  impact_analysis:
    direct_impacts:
      - component: formatDate
        impact_type: modified
        description: "内部优化，接口不变"
        
    indirect_impacts: []
    potential_impacts: []
    
  risk_assessment:
    overall_risk: low
    risk_factors:
      - factor: "纯内部优化"
        level: low
        description: "不改变接口和行为"
        
  regression_strategy:
    strategy: smoke
    scope:
      - component: formatDate
        priority: P1
        test_types: ["unit"]
        
  recommendation:
    proceed_with_caution: false
```

## Checklists

### 分析阶段
- [ ] 变更已明确
- [ ] 依赖图已构建
- [ ] 影响范围已评估
- [ ] 风险已评级

### 规划阶段
- [ ] 回归策略已选择
- [ ] 测试范围已确定
- [ ] 优先级已分配
- [ ] 历史问题已回顾

### 执行阶段
- [ ] 回归测试已执行
- [ ] 问题已修复
- [ ] 退出标准已满足

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 影响低估 | 回归后发现问题 | 使用依赖分析工具 |
| 过度测试 | 测试范围过大 | 聚焦受影响路径 |
| 遗漏边界 | 边界场景未覆盖 | 结合 edge-case-matrix |
| 历史忽视 | 重复历史 bug | 建立知识库 |

## Notes

### 与 unit-test-design 的关系
- regression-analysis 确定"测什么"
- unit-test-design 确定"怎么测"
- 两者配合使用

### 与 edge-case-matrix 的关系
- edge-case-matrix 生成边界场景
- regression-analysis 将这些场景纳入回归范围

### 工具支持
- 静态分析：识别调用关系
- 代码覆盖率：评估测试完整性
- 历史数据：分析 bug 模式

### 回归测试频率
- 每次 commit：smoke test
- 每次 PR：targeted regression
- 每次发布：full regression
