# Skill: bugfix-workflow

## Purpose

指导 developer 对 bug 修复形成闭环：理解问题、定位范围、最小修复、验证闭环。

解决的核心问题：
- bug 修复不彻底，反复出现
- 修复引入新问题（回归）
- 修复范围过大，影响面不可控
- 缺乏问题根因分析

## When to Use

必须使用时：
- 有明确的 bugfix task
- 需要修复生产环境问题
- 需要修复测试发现的问题

推荐使用时：
- 任何代码问题修复
- 问题根因分析
- 预防措施制定

## When Not to Use

不适用场景：
- 新功能开发（使用 feature-implementation）
- 已知是设计问题（应升级）
- 问题无法复现（应先调查）

## Bugfix Process

### Phase 1: 理解问题 (Understand)

#### Step 1: 收集信息
1. **问题描述**
   - 现象是什么？
   - 期望行为 vs 实际行为
   - 影响范围（用户数、功能）

2. **复现信息**
   - 复现步骤
   - 环境信息（浏览器、OS、版本）
   - 输入数据
   - 发生频率（必现/偶发）

3. **错误信息**
   - 错误日志
   - 堆栈跟踪
   - 相关监控数据

4. **变更历史**
   - 最近代码变更
   - 最近配置变更
   - 最近依赖更新

#### Step 2: 定位根因
使用 5 Whys 或类似方法：
1. 表面现象是什么？
2. 为什么会这样？（第1个 Why）
3. 为什么会那样？（第2个 Why）
4. ...直到找到根因

#### Step 3: 分类问题
| 类型 | 特征 | 修复策略 |
|------|------|----------|
| 逻辑错误 | 代码逻辑问题 | 修正逻辑 |
| 边界条件 | 未处理 edge case | 添加边界处理 |
| 并发问题 | 多线程/进程问题 | 同步/原子操作 |
| 配置错误 | 配置不当 | 修正配置 |
| 依赖问题 | 第三方库问题 | 升级/降级/替换 |
| 环境问题 | 运行环境问题 | 环境修复 |
| 数据问题 | 数据不一致 | 数据修复+预防 |

### Phase 2: 规划修复 (Plan)

#### Step 4: 评估影响
1. 哪些代码路径受影响？
2. 是否有数据需要修复？
3. 修复是否需要停机？
4. 回滚方案是什么？

#### Step 5: 制定修复方案
1. 最小修复原则
   - 只改必要的代码
   - 避免重构或优化
   - 保持改动可见性

2. 识别依赖关系
   - 修复是否依赖其他变更？
   - 是否有模块需要协调更新？

3. 确定测试策略
   - 复现测试
   - 回归测试
   - 边界测试

### Phase 3: 实施修复 (Implement)

#### Step 6: 创建复现测试
1. 先写测试复现问题
2. 确保测试失败（验证复现）
3. 测试覆盖边界条件

#### Step 7: 实施修复
1. 按最小范围修复
2. 避免引入无关改动
3. 添加必要的注释
4. 更新相关文档

#### Step 8: 验证修复
1. 运行复现测试，确保通过
2. 运行全量回归测试
3. 手动验证关键路径
4. 检查代码 review

### Phase 4: 闭环 (Close)

#### Step 9: 部署监控
1. 部署到测试环境
2. 部署到生产环境
3. 监控错误率
4. 观察用户反馈

#### Step 10: 总结复盘
1. 记录根因
2. 记录修复方案
3. 识别预防措施
4. 更新知识库

## Output Requirements

```yaml
bugfix_report:
  dispatch_id: string
  task_id: string
  bug_id: string
  
  problem_analysis:
    symptom: string
    expected_behavior: string
    actual_behavior: string
    
  root_cause:
    category: logic_error | boundary_condition | concurrency | 
              configuration | dependency | environment | data
    description: string
    analysis_method: string  # 5 Whys, Fishbone, etc.
    
  impact_assessment:
    severity: critical | high | medium | low
    affected_components: string[]
    affected_users: string
    data_corruption: boolean
    
  fix_details:
    approach: string
    changed_files:
      - path: string
        change_type: modified
        description: string
        lines_changed:
          added: number
          deleted: number
          
    tests_added:
      - path: string
        type: regression | reproduction
        description: string
        
  verification:
    reproduction_test_passed: boolean
    regression_test_passed: boolean
    manual_verification_passed: boolean
    
  deployment:
    deployed_to: string[]
    monitoring_results: string
    
  lessons_learned:
    - lesson: string
      prevention: string
      
  follow_up:
    - item: string
      owner: string
      due_date: string
      
  recommendation: CLOSE | MONITOR | REOPEN | ESCALATE
```

## Examples

### 示例 1：登录错误码不正确

```yaml
bugfix_report:
  problem_analysis:
    symptom: "密码错误时返回 500 而不是 401"
    expected_behavior: "应返回 401 Unauthorized"
    actual_behavior: "返回 500 Internal Server Error"
    
  root_cause:
    category: logic_error
    description: |
      1. 密码错误时抛出 IncorrectPasswordError
      2. 全局错误处理器未捕获该异常类型
      3. 未处理的异常转为 500 错误
    analysis_method: "代码审查 + 日志分析"
    
  impact_assessment:
    severity: high
    affected_components: ["登录接口"]
    affected_users: "所有登录用户"
    data_corruption: false
    
  fix_details:
    approach: "在全局错误处理器添加 IncorrectPasswordError 处理"
    changed_files:
      - path: "src/middleware/errorHandler.ts"
        change_type: modified
        description: "添加 IncorrectPasswordError 处理分支，返回 401"
        lines_changed:
          added: 8
          deleted: 0
          
    tests_added:
      - path: "tests/integration/login.errors.test.ts"
        type: regression
        description: "验证密码错误返回 401"
        
  verification:
    reproduction_test_passed: true
    regression_test_passed: true
    manual_verification_passed: true
    
  lessons_learned:
    - lesson: "自定义异常需要在错误处理器中显式处理"
      prevention: "添加新异常类型时同步更新错误处理器"
      
  recommendation: CLOSE
```

### 示例 2：偶发并发问题

```yaml
bugfix_report:
  problem_analysis:
    symptom: "高并发时用户创建重复账号"
    expected_behavior: "用户名唯一"
    actual_behavior: "偶尔出现同名用户"
    
  root_cause:
    category: concurrency
    description: |
      1. 检查用户名存在和创建用户非原子操作
      2. 并发请求同时通过检查，同时创建
      3. 数据库唯一约束防止了数据问题，但导致创建失败
    analysis_method: "日志分析 + 并发测试复现"
    
  impact_assessment:
    severity: medium
    affected_components: ["用户注册"]
    affected_users: "高并发注册场景"
    data_corruption: false
    
  fix_details:
    approach: "添加数据库唯一索引 + 应用层重试机制"
    changed_files:
      - path: "src/database/migrations/add_username_unique_index.sql"
        change_type: added
        description: "添加唯一索引"
      - path: "src/services/UserService.ts"
        change_type: modified
        description: "添加唯一冲突处理和重试逻辑"
        
  lessons_learned:
    - lesson: "并发场景需要考虑竞态条件"
      prevention: "关键操作使用数据库约束保证原子性"
      
  follow_up:
    - item: "审计其他关键操作是否存在竞态条件"
      owner: "tech-lead"
      due_date: "2026-03-29"
      
  recommendation: MONITOR
```

## Checklists

### 理解问题
- [ ] 问题现象清晰
- [ ] 复现步骤明确
- [ ] 根因已找到
- [ ] 问题已分类

### 规划修复
- [ ] 影响范围评估
- [ ] 修复方案最小化
- [ ] 测试策略确定

### 实施修复
- [ ] 复现测试先写
- [ ] 修复范围最小
- [ ] 回归测试通过

### 闭环
- [ ] 部署成功
- [ ] 监控无异常
- [ ] 复盘完成
- [ ] 预防措施记录

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 治标不治本 | 修复表面症状 | 深入 5 Whys 找根因 |
| 修复过大 | 顺带重构优化 | 严格限制修复范围 |
| 回归未测 | 修复引入新问题 | 强化回归测试 |
| 无复现测试 | 无法验证修复 | 必须先写复现测试 |
| 修复不完整 | 只修复了部分场景 | 检查所有代码路径 |

## Notes

### 与 feature-implementation 的区别
- bugfix-workflow：修复已有问题，有明确的"错误"和"正确"对比
- feature-implementation：实现新功能，从 0 到 1

### 与 failure-analysis 的关系
- failure-analysis 分析失败原因和类型
- bugfix-workflow 执行修复
- 通常 failure-analysis 在前，bugfix-workflow 在后

### 紧急修复 vs 完整修复
- 紧急修复：先止血，最小改动，快速上线
- 完整修复：事后补充测试、文档、预防措施
