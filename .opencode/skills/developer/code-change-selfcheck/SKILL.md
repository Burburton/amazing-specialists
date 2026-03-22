# Skill: code-change-selfcheck

## Purpose

要求 developer 在交付前完成最小自检，确保改动符合目标、遵守约束、不引入风险。

解决的核心问题：
- 代码未经自检就提交
- 改动超出范围不自知
- 约束条件被违反
- 明显问题流入 review

## When to Use

必须使用时：
- 任何代码变更提交前
- 完成 feature-implementation 后
- 完成 bugfix-workflow 后
- 作为 quality gate 的一部分

推荐使用时：
- 每次 commit 前
- push 前最终检查
- review 前自检

## When Not to Use

不适用场景：
- 纯文档变更（使用 docs 流程）
- 紧急热修复（事后补自检）
- 配置变更（使用简化检查）

## Self-Check Categories

### 1. 目标对齐检查 (Goal Alignment)
- [ ] 实现是否符合 task goal？
- [ ] 是否满足 acceptance criteria？
- [ ] 是否遗漏关键功能？
- [ ] 是否有超出 scope 的改动？

### 2. 设计一致检查 (Design Consistency)
- [ ] 是否符合 design note？
- [ ] 模块边界是否尊重？
- [ ] 接口契约是否遵守？
- [ ] 如有偏离，是否记录原因？

### 3. 范围控制检查 (Scope Control)
- [ ] 改动范围是否最小？
- [ ] 是否有无关文件改动？
- [ ] 删除的代码是否必要？
- [ ] 注释/空行修改是否必要？

### 4. 约束遵守检查 (Constraint Compliance)
- [ ] 是否遵守技术约束？
- [ ] 是否遵守性能约束？
- [ ] 是否遵守安全约束？
- [ ] 是否遵守依赖约束？

### 5. 代码质量检查 (Code Quality)
- [ ] 代码是否可理解？
- [ ] 命名是否清晰？
- [ ] 是否有明显逻辑错误？
- [ ] 是否有未处理的异常？
- [ ] 是否有死代码？

### 6. 测试覆盖检查 (Test Coverage)
- [ ] 新增代码是否有测试？
- [ ] 修改代码是否更新测试？
- [ ] 测试是否通过？
- [ ] 覆盖率是否达标？

### 7. 依赖管理检查 (Dependency Management)
- [ ] 是否引入新依赖？
- [ ] 新依赖是否已批准？
- [ ] 依赖版本是否合理？
- [ ] 是否有循环依赖？

### 8. 文档同步检查 (Documentation)
- [ ] 代码注释是否更新？
- [ ] API 文档是否更新？
- [ ] 复杂逻辑是否有注释？
- [ ] 设计变更是否记录？

### 9. 安全风险检查 (Security)
- [ ] 是否有输入验证？
- [ ] 是否有敏感数据泄露？
- [ ] 是否有权限检查？
- [ ] 是否有 SQL/命令注入风险？

### 10. 性能影响检查 (Performance)
- [ ] 是否有明显的性能问题？
- [ ] 是否有 N+1 查询？
- [ ] 是否有内存泄露风险？
- [ ] 大数据量场景是否考虑？

## Steps

### Step 1: 准备检查清单
根据 task 类型选择合适的检查项：
- 新功能：全部检查
- Bugfix：重点检查 1,2,5,6,10
- 重构：重点检查 2,3,5,6
- 配置：简化检查

### Step 2: 逐项检查
对每个检查项：
1. 阅读检查标准
2. 审视代码
3. 标记通过/失败
4. 记录问题（如有）

### Step 3: 问题分类
将发现的问题分类：
- **Blocker**: 必须修复，否则不能提交
- **Warning**: 建议修复，但不强制
- **Info**: 仅供参考

### Step 4: 修复 Blocker
1. 列出所有 blocker
2. 按优先级修复
3. 修复后重新检查

### Step 5: 生成报告
输出 self-check report

## Output Format

```yaml
self_check_report:
  dispatch_id: string
  task_id: string
  timestamp: string
  
  summary:
    total_checks: number
    passed: number
    failed: number
    blockers: number
    warnings: number
    
  check_results:
    - category: string
      checks:
        - item: string
          status: pass | fail | na
          severity: blocker | warning | info
          description: string
          fix_required: boolean
          
  blockers:
    - id: string
      category: string
      description: string
      location: string
      fix_suggestion: string
      fixed: boolean
      
  warnings:
    - id: string
      category: string
      description: string
      recommendation: string
      
  overall_status: PASS | FAIL_WITH_BLOCKERS | PASS_WITH_WARNINGS
  
  recommendation: PROCEED | FIX_BLOCKERS | ESCALATE
  
  time_spent_minutes: number
```

## Examples

### 示例 1：完美通过

```yaml
self_check_report:
  summary:
    total_checks: 30
    passed: 30
    failed: 0
    blockers: 0
    warnings: 0
    
  check_results:
    - category: 目标对齐
      checks:
        - item: 实现符合 task goal
          status: pass
          severity: blocker
        - item: 满足 acceptance criteria
          status: pass
          severity: blocker
          
    - category: 范围控制
      checks:
        - item: 改动范围最小
          status: pass
          severity: blocker
          
  overall_status: PASS
  recommendation: PROCEED
```

### 示例 2：有 Blocker 需要修复

```yaml
self_check_report:
  summary:
    total_checks: 30
    passed: 27
    failed: 3
    blockers: 2
    warnings: 1
    
  blockers:
    - id: BLOCKER-001
      category: 代码质量
      description: "登录接口未处理密码为空的情况，可能导致 null pointer"
      location: "AuthController.ts:45"
      fix_suggestion: "添加 password 参数校验"
      fixed: false
      
    - id: BLOCKER-002
      category: 安全风险
      description: "JWT secret 硬编码在代码中"
      location: "JwtTokenService.ts:12"
      fix_suggestion: "从环境变量读取 secret"
      fixed: false
      
  warnings:
    - id: WARN-001
      category: 代码质量
      description: "函数过长（超过 50 行）"
      recommendation: "考虑拆分为小函数"
      
  overall_status: FAIL_WITH_BLOCKERS
  recommendation: FIX_BLOCKERS
```

### 示例 3：修复后重新检查

```yaml
self_check_report:
  summary:
    total_checks: 30
    passed: 30
    failed: 0
    blockers: 0
    warnings: 0
    
  blockers:
    - id: BLOCKER-001
      category: 代码质量
      description: "登录接口未处理密码为空的情况"
      fixed: true
      fix_description: "添加了 password 非空校验"
      
    - id: BLOCKER-002
      category: 安全风险
      description: "JWT secret 硬编码"
      fixed: true
      fix_description: "改为从 process.env.JWT_SECRET 读取"
      
  overall_status: PASS
  recommendation: PROCEED
  
  notes: "修复了之前发现的 blockers，现可提交"
```

## Quick Check (快速检查)

对于简单改动，使用快速检查清单：

```yaml
quick_check:
  - "代码能编译/运行吗？"
  - "改动符合预期吗？"
  - "测试通过吗？"
  - "有敏感信息泄露吗？"
  - "有 console.log 忘记删除吗？"
```

## Checklist Templates

### 模板 1: 新功能开发
```yaml
必须检查:
  - [ ] 实现符合 task goal
  - [ ] 满足所有 acceptance criteria
  - [ ] 符合 design note
  - [ ] 有对应的单元测试
  - [ ] 代码风格一致
  - [ ] 无敏感信息泄露
  
建议检查:
  - [ ] 有集成测试
  - [ ] 代码注释清晰
  - [ ] 性能考虑周全
```

### 模板 2: Bugfix
```yaml
必须检查:
  - [ ] Bug 已修复
  - [ ] 有复现测试
  - [ ] 回归测试通过
  - [ ] 改动范围最小
  - [ ] 无新 bug 引入
  
建议检查:
  - [ ] 根因已记录
  - [ ] 预防措施已考虑
```

### 模板 3: 重构
```yaml
必须检查:
  - [ ] 功能行为未变
  - [ ] 所有测试通过
  - [ ] 代码质量提升
  
建议检查:
  - [ ] 有性能对比数据
  - [ ] 团队已同步
```

## Notes

### 与 execution-reporting 的关系
- code-change-selfcheck 生成 self-check report
- execution-reporting 将其包含在 checks_performed 中
- self-check 是 execution-reporting 的输入之一

### 自动化程度
- 部分检查可自动化（lint、test、security scan）
- 部分检查需人工判断（设计一致性、代码可理解性）
- 推荐结合自动化工具 + 人工检查

### 强制 vs 建议
- Blocker 必须修复
- Warning 建议修复
- Info 仅供参考

### 时间投入
- 简单改动：5-10 分钟
- 中等改动：15-30 分钟
- 复杂改动：30-60 分钟

自检投入的时间会在 review 阶段节省更多时间。
