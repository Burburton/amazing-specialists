# Skill: refactor-safely

## Purpose

指导 developer 安全地重构代码，在不改变外部行为的前提下改善代码结构、可读性和可维护性。

解决的核心问题：
- 重构引入意外行为变更
- 重构范围失控
- 缺乏测试保护
- 丢失 git history
- 无法回滚

## When to Use

必须使用时：
- 需要重构遗留代码
- 改善代码结构但不改变功能
- 提取公共逻辑
- 消除代码重复

推荐使用时：
- 重构前做风险评估
- 重构过程中做小步验证
- 重构后做行为对比验证

## When Not to Use

不适用场景：
- 功能变更（使用 feature-implementation）
- Bug 修复（使用 bugfix-workflow）
- 架构重设计（使用 architect 的 module-boundary-design）
- 无测试覆盖且无法添加测试

## Refactoring Process

### Phase 0: Issue 准备 (Issue Preparation)

> **触发条件**: 以下情况必须执行此 Phase：
> - dispatch payload 包含 `issue_id` 字段
> - 从 `/spec-start` 命令启动的 GitHub Issue 驱动流程
> - 任务明确要求 "GitHub Issue 驱动方式"
>
> **跳过条件**: 以下情况可跳过此 Phase：
> - 从 CLI 直接触发，无 Issue ID
> - 任务明确指定不使用 Issue 驱动
> - 紧急修复场景（后续补充 Issue）

#### Step 0: 检查 GitHub Issues

**目的**: 确保重构任务在 GitHub Issues 中正确管理，避免创建重复 Issue。

1. **列出现有 Issues**
   ```bash
   gh issue list --state all --limit 100
   ```

2. **搜索相关 Issue**
   - 使用关键词搜索（重构目标、模块名称、代码区域）
   - 检查 Issue 状态（open, closed, closed-as-completed）
   - 检查 Issue 内容是否与当前重构任务匹配

3. **决策分支**

   | 情况 | 处理方式 |
   |------|----------|
   | 找到匹配的 open Issue | 使用现有 Issue，直接进入 Phase 1 |
   | 找到匹配的 closed Issue（已完成） | 检查是否需要新 Issue（如范围变更） |
   | 找到匹配的 closed Issue（未完成） | 重新打开 Issue 或创建新 Issue |
   | 未找到匹配 Issue | 创建新 Issue，进入 Phase 1 |

4. **创建 Issue（如需要）**
   ```bash
   gh issue create --title "[Refactor] <refactor-description>" --body "..."
   ```

**Checklist - Phase 0**:
- [ ] 已列出并检查现有 GitHub Issues
- [ ] 已搜索与重构任务相关的 Issue
- [ ] 已确认 Issue 状态（使用现有或创建新的）
- [ ] 已记录 Issue ID 用于后续关联

**常见错误**:
- ❌ 未检查现有 Issue，直接创建新 Issue → 导致重复 Issue
- ❌ 未记录 Issue ID → 后续无法关联 PR 和 Issue

---

### Phase 1: 准备 (Preparation)

#### Step 1: 识别重构范围
1. 明确重构目标（改善什么？）
2. 识别涉及文件
3. 评估影响范围
4. 识别外部接口边界

#### Step 2: 测试覆盖检查
1. 检查现有测试覆盖
2. 识别无测试覆盖区域
3. 补充必要的行为测试
4. 确保测试作为安全网

#### Step 3: 制定重构计划
1. 分解为小步骤
2. 每步可独立验证
3. 每步可独立回滚
4. 设置检查点

### Phase 2: 执行 (Execution)

#### Step 4: 小步重构
对每个重构步骤：
1. 执行单一重构动作
2. 运行测试验证
3. 提交可工作的状态
4. 记录变更内容

#### Step 5: 行为一致性验证
- [ ] 所有测试通过
- [ ] 无新增测试失败
- [ ] 公共 API 未变更
- [ ] 外部可观测行为一致

#### Step 6: 持续自检
- [ ] 是否保持小步前进？
- [ ] 每步是否可验证？
- [ ] 是否有意外行为变更？
- [ ] 是否偏离重构目标？

### Phase 3: 验证 (Verification)

#### Step 7: 最终验证
1. 全量测试运行
2. 行为对比测试（如适用）
3. 性能回归测试（如适用）
4. 代码质量检查

#### Step 8: 范围检查
1. 对比重构计划检查完成度
2. 确认无超出范围的改动
3. 确认 git history 清晰

### Phase 4: 总结 (Summary)

#### Step 9: 生成重构总结
1. 列出所有改动文件
2. 描述重构内容
3. 记录行为不变性确认
4. 记录已知问题和风险

#### Step 10: 准备提交
1. 最终代码审查
2. 生成 commit message
3. 准备 execution result

## Output Requirements

```yaml
refactor_summary:
  dispatch_id: string
  task_id: string
  
  refactoring_goal:
    objective: string          # 重构目标
    scope: string              # 重构范围
    approach: string           # 重构方法
    
  test_coverage:
    before: string             # 重构前测试覆盖率
    after: string              # 重构后测试覆盖率
    new_tests_added: string[]  # 新增测试
    
  changed_files:
    - path: string
      change_type: modified | renamed | deleted
      description: string
      behavior_preserved: boolean
      verification_method: string
      
  commit_history:
    - commit: string
      message: string
      verification: string     # 如何验证此步
      
  verification_results:
    all_tests_pass: boolean
    behavior_comparison: string # 如何确认行为不变
    performance_impact: string | null
    
  known_issues:
    - issue: string
      severity: low | medium | high
      planned_fix: string | null
      
  risks:
    - risk: string
      level: low | medium | high
      mitigation: string
      
  recommendation: SEND_TO_TEST | ROLLBACK | ESCALATE
  
  time_spent_minutes: number
```

## Refactoring Techniques

### 安全重构模式

| 模式 | 描述 | 验证方法 |
|------|------|----------|
| 提取方法 | 将代码块提取为独立方法 | 测试通过 |
| 提取变量 | 将表达式提取为命名变量 | 测试通过 |
| 重命名 | 变量/方法/类重命名 | 编译通过 + 测试通过 |
| 移动方法 | 将方法移动到更合适的类 | 测试通过 |
| 内联方法 | 将简单方法内联调用 | 测试通过 |
| 提取接口 | 从类提取接口 | 编译通过 + 测试通过 |

### 危险重构模式（需额外测试）

| 模式 | 风险 | 必要测试 |
|------|------|----------|
| 改变继承结构 | 高 | 行为对比测试 |
| 修改数据结构 | 高 | 边界测试 + 性能测试 |
| 重构异步逻辑 | 中 | 并发测试 |
| 重构状态机 | 高 | 状态转换测试 |

## Examples

### 示例 1：提取公共方法

```yaml
refactor_summary:
  refactoring_goal:
    objective: "消除 UserService 和 OrderService 中的重复验证逻辑"
    scope: "src/services/UserService.ts, src/services/OrderService.ts"
    approach: "提取公共验证方法到 ValidationUtils"
    
  test_coverage:
    before: "78%"
    after: "82%"
    new_tests_added:
      - "tests/unit/ValidationUtils.test.ts"
      
  changed_files:
    - path: "src/utils/ValidationUtils.ts"
      change_type: modified
      description: "新增 validateEmail, validatePhone 方法"
      behavior_preserved: true
      verification_method: "单元测试 + 集成测试"
      
    - path: "src/services/UserService.ts"
      change_type: modified
      description: "使用 ValidationUtils 替代内联验证"
      behavior_preserved: true
      verification_method: "回归测试通过"
      
    - path: "src/services/OrderService.ts"
      change_type: modified
      description: "使用 ValidationUtils 替代内联验证"
      behavior_preserved: true
      verification_method: "回归测试通过"
      
  commit_history:
    - commit: "abc1234"
      message: "refactor: extract validation to ValidationUtils"
      verification: "全量测试通过"
    - commit: "abc1235"
      message: "refactor: use ValidationUtils in UserService"
      verification: "UserService 测试通过"
    - commit: "abc1236"
      message: "refactor: use ValidationUtils in OrderService"
      verification: "OrderService 测试通过"
      
  verification_results:
    all_tests_pass: true
    behavior_comparison: "API 返回结果与重构前一致"
    performance_impact: null
    
  known_issues: []
  
  risks:
    - risk: "公共方法可能被其他服务误用"
      level: low
      mitigation: "方法注释明确使用场景"
      
  recommendation: SEND_TO_TEST
  time_spent_minutes: 45
```

## Checklists

### 准备阶段
- [ ] 明确重构目标
- [ ] 识别涉及文件
- [ ] 检查测试覆盖
- [ ] 制定小步计划

### 执行阶段
- [ ] 保持小步前进
- [ ] 每步运行测试
- [ ] 每步提交可工作状态
- [ ] 行为不变性检查

### 验证阶段
- [ ] 全量测试通过
- [ ] 行为对比确认
- [ ] 无超出范围改动
- [ ] Git history 清晰

### 总结阶段
- [ ] 列出所有改动
- [ ] 确认行为不变
- [ ] 记录已知问题
- [ ] 完成 commit

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 测试缺失 | 无安全网重构 | 先补充测试再重构 |
| 步子太大 | 一次改动太多 | 回滚，分小步重构 |
| 行为变更 | 测试失败或行为变化 | 回滚，重新评估 |
| 目标漂移 | 从重构变成功能变更 | 回滚，重新聚焦 |
| History 混乱 | 提交信息不清 | 使用 interactive rebase 整理 |

## Notes

### 与 feature-implementation 的区别
- refactor-safely：不改变外部行为
- feature-implementation：添加或修改功能

### 与 bugfix-workflow 的区别
- refactor-safely：改善代码结构
- bugfix-workflow：修复已知问题

### 重构的前提条件
1. 有测试覆盖
2. 或可以添加测试
3. 或行为可以通过其他方式验证

### 测试覆盖不足时
- 先添加行为测试
- 再进行重构
- 或者选择放弃重构